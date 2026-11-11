// Page reader (npm run page-text): prints a web page as plain text, the way the copy-check reads it.
//
// Research agents read pages through this instead of fetching them by hand, for three reasons:
//   - Size. A rendered wiki page as HTML is ten to twenty times the size of its text.
//   - The same text. What an agent reads is what the copy-check later compares: for a wiki page, the page source
//     and the rendered page, which holds what templates kept on other pages draw in (an ability box, for example).
//   - One polite way in. Pages come from the page cache (.cache/sources/) when it has them. A page that is not
//     there is fetched the copy-check's way and kept, and requests to one site are spaced out even between
//     several agents at work at once (a time stamp per site in the cache).
//
// Usage: node scripts/page-text.mjs <page address> [options]
//   --source       a wiki page: print only the page source (its wikitext, as it is: the info box fields are named there)
//   --rendered     a wiki page: print only the rendered page, one line per block of text
//   --offline      use the cache only
//   --refresh      fetch the page again even when it is cached
//   --root FOLDER  the repository or copy whose cache to use (default: this one)
//
// A site whose terms do not allow this use is never fetched (NO_FETCH): only its cached pages are printed.
// UNIT_FORGE_ALLOW_HOSTS (host names, separated by commas) lifts that for the hosts it names, once Mustafa has
// decided how such a site may be read.
//
// Exit codes: 0 the page was printed; 2 bad arguments; 3 the page could not be read (the reason is on stderr).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_OPTIONS, HOST_MIN_DELAY, REPO_ROOT, cachePath, fetchPage, htmlToText, rerunWithProxy, sourceOnly, steamNewsText, visibleLines,
} from './copy-check.mjs'

// Liquipedia's API terms (liquipedia.net/api-terms-of-use, read on 11 November 2026): its pages may not be read by
// automated tools, and its API is meant for editors.
export const NO_FETCH = Object.freeze(new Set(['liquipedia.net']))
const allowed = () => new Set((process.env.UNIT_FORGE_ALLOW_HOSTS || '').split(',').map(h => h.trim()).filter(Boolean))

const sleep = ms => new Promise(r => setTimeout(r, ms))

// Waits until the site's last request, by any process using this cache, is at least `gap` ms old, then marks now.
async function waitForSite(cacheDir, host, gap) {
  const dir = path.join(cacheDir, host), stamp = path.join(dir, '.last-request')
  fs.mkdirSync(dir, { recursive: true })
  for (;;) {
    let last = 0
    try { last = fs.statSync(stamp).mtimeMs } catch { /* no request yet */ }
    const wait = last + gap - Date.now()
    if (wait <= 0) break
    await sleep(Math.min(wait, 5000))
  }
  fs.writeFileSync(stamp, new Date().toISOString() + '\n')
}

/**
 * Reads a page: from the cache, or from the network (then cached). Options: root, offline, refresh, delay,
 * retryWait, hostDelay, log. Returns { page, cached } or throws an Error with the reason.
 */
export async function readPage(url, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const cacheDir = path.join(opts.root, '.cache', 'sources')
  const file = cachePath(cacheDir, url)
  let page = null
  if (fs.existsSync(file) && !opts.refresh) {
    try { page = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { page = null }
  }
  // A wiki page cached with its source only is read again for the rendered page, when that is possible.
  if (page && !sourceOnly(page)) return { page, cached: true }
  const host = new URL(url).hostname
  const blocked = NO_FETCH.has(host) && !allowed().has(host)
  if (opts.offline || blocked) {
    if (page) return { page, cached: true }
    throw new Error(blocked ? `${host} is not fetched: its terms do not allow it, and the page is not in the cache` : 'offline and not cached')
  }
  const hostDelay = (opts.hostDelay || HOST_MIN_DELAY)[host] || 0
  await waitForSite(cacheDir, host, Math.max(opts.delay, hostDelay))
  const state = { delay: 0, retryWait: opts.retryWait, log: opts.log, lastRequest: 0, lastByHost: {}, hostDelay: {}, requests: 0 }
  try {
    page = { url, fetched: new Date().toISOString(), ...(await fetchPage(url, state)) }
  } catch (e) {
    if (page) return { page, cached: true } // the cached source is better than nothing
    throw e
  }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(page, null, 1) + '\n')
  return { page, cached: false }
}

/** The page as plain text. part: 'source', 'rendered' or undefined for both (wiki pages only). */
export function pageAsText(page, part) {
  const out = []
  if (page.format === 'wikitext') {
    if (part !== 'rendered') out.push('== SOURCE (wikitext) ==', page.raw.trim(), '')
    if (part !== 'source') {
      if (typeof page.rendered === 'string') out.push('== RENDERED (what a reader sees, one line per block) ==', ...visibleLines(page.rendered), '')
      else out.push('== RENDERED ==', '(not in the cache: only the page source was read; run again online)', '')
    }
    return out.join('\n')
  }
  if (/^%PDF-/.test(page.raw)) return null // a PDF: its text needs pdftotext
  if (/^https?:\/\/store\.steampowered\.com\/news\/app\//.test(page.url || '')) return steamNewsText(page.raw)
  const lines = visibleLines(page.raw)
  return (lines.length ? lines.join('\n') : htmlToText(page.raw)) + '\n'
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const usage = 'usage: node scripts/page-text.mjs <page address> [--source | --rendered] [--offline] [--refresh] [--root FOLDER]'
  const opts = { root: REPO_ROOT, log: () => {} }
  let url = null, part
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--source') part = 'source'
    else if (a === '--rendered') part = 'rendered'
    else if (a === '--offline') opts.offline = true
    else if (a === '--refresh') opts.refresh = true
    else if (a === '--root' && argv[i + 1]) opts.root = path.resolve(argv[++i])
    else if (/^https?:\/\//.test(a) && !url) url = a
    else { console.error(`not a page address or an option: '${a}'\n${usage}`); process.exit(2) }
  }
  if (!url) { console.error(usage); process.exit(2) }
  const status = opts.offline ? null : rerunWithProxy()
  if (status !== null) process.exit(status)
  try {
    const { page, cached } = await readPage(url, opts)
    const text = pageAsText({ url, ...page }, part)
    if (text === null) { console.error(`${url}: no text to print (a PDF needs pdftotext; a Steam news page may hold no post)`); process.exit(3) }
    console.error(`${url} (${cached ? `from the cache, fetched ${page.fetched || 'earlier'}` : 'fetched now'}; ${page.format === 'wikitext' ? 'a wiki page' : 'a web page'})`)
    process.stdout.write(text)
  } catch (e) {
    console.error(`${url}: not read: ${e.message}`)
    process.exit(3)
  }
}
