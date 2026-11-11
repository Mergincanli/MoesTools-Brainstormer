// Page reader (npm run page-text): prints a web page as plain text, the way the copy-check reads it.
//
// Research agents read pages through this instead of fetching them by hand, for three reasons:
//   - Size. A rendered wiki page as HTML is ten to twenty times the size of its text.
//   - The same text. What an agent reads is what the copy-check later compares: for a wiki page, the page source
//     and the rendered page, which holds what templates kept on other pages draw in (an ability box, for example).
//   - One polite way in. Pages come from the page cache (.cache/sources/) when it has them. A page that is not
//     there is fetched the copy-check's way and kept, and requests to one site are spaced out even between
//     several agents at work at once (the copy-check keeps a small file per site in the system's temporary
//     folder, claimed under a lock).
//
// Usage: node scripts/page-text.mjs <page address> [options]
//   --source       a wiki page: print only the page source (its wikitext, as it is: the info box fields are named there)
//   --rendered     a wiki page: print only the rendered page, one line per block of text
//   --offline      use the cache only
//   --refresh      fetch the page again even when it is cached
//   --delay MS     the pause between requests to one site (default 1500; a site's own minimum still holds)
//   --root FOLDER  the repository or copy whose cache to use (default: this one)
//
// A site whose terms restrict automated reading (the copy-check's RESTRICTED_SITES: Liquipedia) is not fetched:
// only its cached pages are printed, until Mustafa has decided how it is read (then UNIT_FORGE_ALLOW_HOSTS names
// the site and COPY_CHECK_CONTACT gives the contact, for the copy-check, the plant test and this reader alike).
//
// Exit codes: 0 the page was printed; 2 bad arguments; 3 the page could not be read, or only the source of a wiki
// page could (the reason is on stderr; the source is still printed).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_OPTIONS, REPO_ROOT, RESTRICTED_SITES, cachePath, fetchPage, htmlToText, refusal, rerunWithProxy, sourceOnly, steamNewsText, visibleLines,
} from './copy-check.mjs'

export const NO_FETCH = RESTRICTED_SITES // the sites this reader does not fetch (see the copy-check)

/**
 * Reads a page: from the cache, or from the network (then cached). Options: root, offline, refresh, delay,
 * retryWait, hostDelay, pace, stampDir, log. Returns { page, cached, error }: error is the reason why a wiki page
 * cached with its source only could not be read again. Throws an Error with the reason when there is no page.
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
  const why = opts.offline ? 'offline' : refusal(new URL(url).hostname)
  if (why) {
    if (page) return { page, cached: true, error: why }
    throw new Error(opts.offline ? 'offline and not cached' : why)
  }
  // The copy-check's own request path: its pauses hold between this process and every other one.
  const state = { delay: opts.delay, retryWait: opts.retryWait, log: opts.log, pace: opts.pace, hostDelay: opts.hostDelay, stampDir: opts.stampDir, requests: 0 }
  try {
    page = { url, fetched: new Date().toISOString(), ...(await fetchPage(url, state)) }
  } catch (e) {
    if (page) return { page, cached: true, error: e.message } // the cached source is better than nothing
    throw e
  }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(page, null, 1) + '\n')
  return { page, cached: false }
}

/**
 * The page as plain text. part: 'source', 'rendered' or undefined for both (wiki pages only). why: the reason a
 * wiki page's rendered version is missing, when the caller knows it.
 */
export function pageAsText(page, part, why) {
  const out = []
  if (page.format === 'wikitext') {
    // Text inside an HTML comment never shows to a reader (and the copy-check does not compare it): it is marked, so
    // that nobody takes it for the page's text. It may still hold an editor's remark worth knowing.
    const source = page.raw.replace(/<!--([\s\S]*?)-->/g, (m, inner) => `[HIDDEN COMMENT, not shown to readers:${inner}]`)
    if (part !== 'rendered') out.push('== SOURCE (wikitext) ==', source.trim(), '')
    if (part !== 'source') {
      if (typeof page.rendered === 'string') out.push('== RENDERED (what a reader sees, one line per block) ==', ...visibleLines(page.rendered), '')
      else out.push('== RENDERED ==', why && why !== 'offline' ? `(the rendered page could not be read: ${why})` : '(not in the cache: only the page source was read; run again online)', '')
    }
    return out.join('\n')
  }
  if (/^%PDF-/.test(page.raw)) return null // a PDF: its text needs pdftotext
  if (/^https?:\/\/store\.steampowered\.com\/news\/app\//.test(page.url || '')) return steamNewsText(page.raw)
  const lines = visibleLines(page.raw)
  return (lines.length ? lines.join('\n') : htmlToText(page.raw)) + '\n'
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const usage = 'usage: node scripts/page-text.mjs <page address> [--source | --rendered] [--offline] [--refresh] [--delay MS] [--root FOLDER]'
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
    else if (a === '--delay' && /^\d+$/.test(argv[i + 1] || '')) opts.delay = Number(argv[++i])
    else if (/^https?:\/\//.test(a) && URL.canParse(a) && !url) url = a
    else { console.error(`not a page address or an option: '${a}'\n${usage}`); process.exit(2) }
  }
  if (!url) { console.error(usage); process.exit(2) }
  const status = opts.offline ? null : rerunWithProxy()
  if (status !== null) process.exit(status)
  try {
    const { page, cached, error } = await readPage(url, opts)
    const text = pageAsText({ url, ...page }, part, error)
    if (text === null) { console.error(`${url}: no text to print (a PDF needs pdftotext; a Steam news page may hold no post)`); process.exit(3) }
    console.error(`${url} (${cached ? `from the cache, fetched ${page.fetched || 'earlier'}` : 'fetched now'}; ${page.format === 'wikitext' ? 'a wiki page' : 'a web page'})`)
    process.stdout.write(text)
    // An online run that still has only a wiki page's source is not a full read: say why, and end 3.
    if (sourceOnly(page) && error && error !== 'offline') {
      console.error(`${url}: the rendered page could not be read: ${error}`)
      process.exitCode = 3
    }
  } catch (e) {
    console.error(`${url}: not read: ${e.message}`)
    process.exit(3)
  }
}
