// Plant test (npm run plant-test): does the copy-check read what a reader of a page sees?
// The file is not named plant-test.mjs because `node --test` would then take it for a test file.
//
// The copy-check can only flag wording it has read. A page that a script draws (a Steam news post), or a wiki
// page whose text comes from templates kept on other pages (an ability box), can look read while most of what a
// reader sees was never compared. This test finds that out for one page at a time:
//   1. The copy-check itself fetches the page, into a throwaway folder, the way it always does.
//   2. The reader's view of the page is taken: the visible text in a real browser. A wiki that answers a
//      headless browser with an error or a bot page, or whose terms do not allow automated reading of its pages
//      (NO_BROWSER), gives the wiki's own rendered page from its API instead.
//   3. Up to five passages of ten words in a row, spread over that view, are planted in a throwaway record that
//      cites the page.
//   4. The copy-check runs on that record. Every planted passage it flags counts.
// A site passes when every planted passage is flagged. Run it on one page of every new site before a batch
// cites it (docs/research-runbook.md), and read the missed passages: a cookie notice that a script draws is no
// loss, an ability text is.
//
// The browser is Playwright with Chromium, when it is installed (it is not a dependency of this repository).
// Without it, only wiki pages can be tested, from the wiki's rendered page.
//
// Usage: node scripts/plant.mjs <page address> [<page address> ...] [options]
//   --json FILE     also write the results to FILE
//   --no-browser    do not use a browser, even when one is installed
//
// Exit codes:
//   0  every page was read and every planted passage was flagged
//   1  the copy-check missed a planted passage on some page
//   2  bad arguments
//   3  a page could not be tested: the copy-check could not read it, it gave no reader's view, or its view has
//      no line long enough to plant
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { cachePath, copyCheck, htmlToText, rerunWithProxy, words } from './copy-check.mjs'

export const PASSAGES = 5 // passages planted per page
export const PASSAGE_WORDS = 10 // words in a row per passage
export const MIN_LINE_WORDS = 14 // a line must have this many words to be planted from
const MIN_VIEW_WORDS = 80 // a browser view with fewer words is an error page or a bot page, not the page

// Sites whose terms do not allow automated reading of their pages: the reader's view comes from the API.
// Liquipedia's API terms (liquipedia.net/api-terms-of-use, read on 11 November 2026) say so.
export const NO_BROWSER = Object.freeze(new Set(['liquipedia.net']))

export const VIEW_BROWSER = 'the page in a browser'
export const VIEW_WIKI = 'the wiki\'s rendered page, from its API'

const BLOCK = 'p|div|li|ul|ol|dl|dt|dd|tr|td|th|table|thead|tbody|h[1-6]|br|hr|section|article|blockquote|pre|figure|figcaption|caption|nav|header|footer|aside'

/** The visible lines of an HTML page or fragment: one per block of text (paragraph, list item, table cell, heading). */
export function visibleLines(html) {
  let h = html.replace(/<!--[\s\S]*?-->/g, ' ')
  h = h.replace(/<(script|style|noscript|svg|template|head)\b[\s\S]*?<\/\1\s*>/gi, ' ')
  h = h.replace(/<sup\b[^>]*\bclass="[^"]*\breference\b[^"]*"[\s\S]*?<\/sup\s*>/gi, ' ') // footnote marks
  h = h.replace(new RegExp(`</?(?:${BLOCK})\\b[^>]*>`, 'gi'), '\n')
  return h.split('\n').map(line => htmlToText(line).replace(/\s+/g, ' ').trim()).filter(Boolean)
}

/**
 * Up to `count` passages of `len` words in a row, spread evenly over the lines that have at least `minLine`
 * words; each is taken from the middle of its line. The same lines always give the same passages.
 */
export function pickPassages(lines, { count = PASSAGES, len = PASSAGE_WORDS, minLine = MIN_LINE_WORDS } = {}) {
  const long = lines.map(line => words(line)).filter(ws => ws.length >= Math.max(minLine, len))
  const picks = []
  for (let i = 0; i < count && long.length; i++) {
    const ws = long[Math.min(long.length - 1, Math.floor((i + 0.5) * long.length / count))]
    const at = Math.floor((ws.length - len) / 2)
    const run = ws.slice(at, at + len).join(' ')
    if (!picks.includes(run)) picks.push(run)
  }
  return picks
}

// The throwaway record that cites the page; the planted passages are its notes.
function writeRecord(root, url, passages) {
  fs.mkdirSync(path.join(root, 'data/units'), { recursive: true })
  const unit = { id: 'plant.test.page', name: 'Plant test', notes: passages, sources: [{ url, title: 'page' }] }
  fs.writeFileSync(path.join(root, 'data/units/plant.json'), JSON.stringify({ units: [unit] }))
}

/** Playwright's chromium, or null when Playwright is not installed. */
export function findBrowser() {
  try { return createRequire(import.meta.url)('playwright').chromium } catch { return null }
}

// The visible lines of a live page in a browser, with its HTTP status.
async function browserLines(browser, url) {
  const page = await browser.newPage()
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(4000) // let scripts draw the page
    const lines = await page.evaluate(() => {
      document.querySelectorAll('style, script, .mw-editsection, sup.reference').forEach(e => e.remove())
      const el = document.querySelector('#mw-content-text') || document.querySelector('article') || document.querySelector('main') || document.body
      return el.innerText.split('\n').map(s => s.trim()).filter(Boolean)
    })
    return { status: res ? res.status() : null, lines }
  } finally {
    await page.close()
  }
}

const count = lines => lines.reduce((n, line) => n + words(line).length, 0)

/**
 * Tests one page. Options: root (a throwaway folder; made when not given), browser (a launched Playwright
 * browser, or null), offline (use only what root's cache holds), lines (the reader's view, given by a test),
 * and the copy-check's own options delay, retryWait, hostDelay and log.
 * Returns { url, read, reason, view, browser_status, reader_words, planted, flagged, partly, missed, source_only }.
 */
export async function plantTest(url, options = {}) {
  const root = options.root || fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-plant-'))
  const quiet = { root, log: () => {}, ...(options.delay === undefined ? {} : { delay: options.delay }),
    ...(options.retryWait === undefined ? {} : { retryWait: options.retryWait }), ...(options.hostDelay ? { hostDelay: options.hostDelay } : {}) }
  const out = { url, read: false, reason: null, view: null, browser_status: null, reader_words: 0, planted: [], flagged: [], partly: [], missed: [], source_only: false }
  try {
    // 1. The copy-check fetches the page its own way.
    writeRecord(root, url, [])
    const first = await copyCheck({ ...quiet, offline: !!options.offline })
    const why = first.notChecked.find(([u]) => u === url)
    if (why) { out.reason = `the copy-check could not read the page: ${why[1]}`; return out }
    out.read = true
    out.source_only = first.partly.some(([u]) => u === url)
    const cached = JSON.parse(fs.readFileSync(cachePath(path.join(root, '.cache', 'sources'), url), 'utf8'))

    // 2. The reader's view.
    let lines = null
    if (options.lines) { lines = options.lines; out.view = options.view || VIEW_BROWSER }
    if (!lines && options.browser && !NO_BROWSER.has(new URL(url).hostname)) {
      try {
        const seen = await browserLines(options.browser, url)
        out.browser_status = seen.status
        if (seen.status !== null && seen.status < 400 && count(seen.lines) >= MIN_VIEW_WORDS) { lines = seen.lines; out.view = VIEW_BROWSER }
      } catch (e) {
        out.browser_status = `error: ${String(e.message || e).split('\n')[0]}`
      }
    }
    if (!lines && cached.format === 'wikitext' && typeof cached.rendered === 'string') { lines = visibleLines(cached.rendered); out.view = VIEW_WIKI }
    if (!lines) {
      out.reason = cached.format === 'wikitext' ? 'no reader\'s view: the browser got no page and the wiki gave no rendered page'
        : options.browser ? 'no reader\'s view: the browser got an error page or a bot page' : 'no reader\'s view: a page that is not a wiki needs a browser (Playwright with Chromium)'
      return out
    }
    out.reader_words = count(lines)

    // 3. Plant, and 4. run the copy-check on what it already fetched.
    out.planted = pickPassages(lines, options)
    if (!out.planted.length) { out.reason = `the reader's view has no line of ${MIN_LINE_WORDS} words or more to plant from`; return out }
    writeRecord(root, url, out.planted)
    const res = await copyCheck({ ...quiet, offline: true })
    const runs = res.findings.filter(f => f.urls.includes(url)).map(f => f.run)
    for (const p of out.planted) {
      if (runs.some(r => r.includes(p))) out.flagged.push(p)
      else if (runs.some(r => p.includes(r))) { out.flagged.push(p); out.partly.push(p) } // a run of six words or more inside it
      else out.missed.push(p)
    }
    return out
  } finally {
    if (!options.root) fs.rmSync(root, { recursive: true, force: true })
  }
}

/** 0 when every page passed, 1 when a passage was missed, 3 when a page could not be tested. */
export function exitCode(results) {
  if (results.some(r => r.missed.length)) return 1
  if (results.some(r => !r.read || !r.view || !r.planted.length)) return 3
  return 0
}

export function formatPlantReport(results) {
  const lines = []
  for (const r of results) {
    lines.push(r.url)
    if (r.reason) lines.push(`  NOT TESTED: ${r.reason}${r.browser_status !== null ? ` (browser: ${r.browser_status})` : ''}`)
    else {
      lines.push(`  reader's view: ${r.view}${r.browser_status !== null && r.view !== VIEW_BROWSER ? ` (the browser got ${r.browser_status})` : ''}, ${r.reader_words} words`)
      lines.push(`  planted ${r.planted.length}, flagged ${r.flagged.length}${r.partly.length ? ` (${r.partly.length} only in part)` : ''}: ${r.missed.length ? 'MISSED' : 'ok'}`)
      for (const m of r.missed) lines.push(`    missed: "${m}"`)
      if (r.source_only) lines.push('  the copy-check read this wiki page\'s source only, not the rendered page')
    }
  }
  const ok = results.filter(r => !r.reason && !r.missed.length).length
  lines.push('', `${ok} of ${results.length} page(s) passed`)
  return lines.join('\n')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const usage = 'usage: node scripts/plant.mjs <page address> [<page address> ...] [--json FILE] [--no-browser]'
  const urls = []
  let json = null, useBrowser = true
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--json') json = argv[++i]
    else if (a === '--no-browser') useBrowser = false
    else if (/^https?:\/\//.test(a)) urls.push(a)
    else { console.error(`not a page address or an option: '${a}'\n${usage}`); process.exit(2) }
  }
  if (!urls.length || (json !== null && !json)) { console.error(usage); process.exit(2) }
  const status = rerunWithProxy()
  if (status !== null) process.exit(status)
  const chromium = useBrowser ? findBrowser() : null
  if (useBrowser && !chromium) console.error('no browser (Playwright is not installed): only wiki pages can be tested, from the wiki\'s rendered page')
  const browser = chromium ? await chromium.launch() : null
  const results = []
  try {
    for (const url of urls) results.push(await plantTest(url, { browser }))
  } finally {
    if (browser) await browser.close()
  }
  if (json) fs.writeFileSync(json, JSON.stringify(results, null, 1) + '\n')
  console.log(formatPlantReport(results))
  process.exitCode = exitCode(results)
}
