// Copy-check: flags wording copied from the pages the data cites.
//
// For every source URL cited in data/units/*.json (each unit), data/patterns/*.json (each pattern, through
// its other_examples and shooter_analogues) and data/games.json (each game), it fetches the page text and
// reports every run of N or more consecutive words (default 6) that the page shares with any prose string
// of the record that cites it. Words are compared lower-cased with punctuation stripped, and British and
// American spellings count as the same word ('armour' = 'armor'). Runs that are only a title or name
// (a game, unit or page title found in the data) are ignored.
//
// --also <folder> (repeatable) also checks notes that cite no page, such as research notes: every string in
// the .json files (outside keys such as url, title and name) and every paragraph, list item, table row and
// heading in the .md files under that folder, with link targets and bare web addresses dropped, against
// every page in the cache, every page the data cites and every page those notes link to. A run that also
// appears in our own wording (any string in data/ or schemas/, or any text in research/registry-notes/,
// leaving out files under an --also folder) is ignored: that is our own text quoted back, not a copy.
//
// Pages come from MediaWiki sites (Fandom, wiki.gg, StrategyWiki, Halopedia, Wikipedia and others) through
// the site's api.php (action=parse), and from other sites as HTML turned into text. A wiki page is read twice
// over in one request: its source (wikitext) and its rendered page, the text a reader sees. The source alone
// misses what a template kept on another page draws in, such as an ability box. A wiki page whose rendered
// version is not in the cache is fetched again; offline it is compared with its source only and listed as
// SOURCE ONLY, and the run then ends incomplete.
// Every page is cached under .cache/sources/ (git-ignored), so later runs work offline. Requests go one
// at a time with a pause between them, and a 429 or 503 answer is retried with a growing wait (Retry-After
// when the site gives one). A dropped connection, a timeout or a temporary DNS failure is tried again at
// most twice; other network errors are not retried. After three network failures in a row the network
// counts as unavailable: nothing more is fetched and the remaining uncached pages are listed as not checked.
// A Steam news post is read from the page's data attribute (its markup holds only the store's frame), and web
// addresses in a record's prose are not wording. A site can ask for a longer pause (HOST_MIN_DELAY). Set
// COPY_CHECK_CONTACT to add a contact to the User-Agent header for sites whose terms ask for one.
// scripts/plant.mjs tests whether the check reads what a reader of a page sees: run it on one page of
// every new site before a batch cites it.
//
// This needs the network, so CI does not run it: research agents and checkers run it by hand. Behind a
// proxy it needs Node.js 22.21 or newer (see rerunWithProxy below).
//
// Usage: node scripts/copy-check.mjs [root] [options]
//   root               the repository to check (default: this one)
//   --offline          use cached pages only; uncached pages are listed as not checked
//   --min-words N      shortest shared run to report (default 6)
//   --only TEXT        only check pages whose URL contains TEXT (repeatable); a full address that nothing cites is
//                      fetched (or listed as not checked), and a TEXT that matches nothing is listed as not checked
//   --max-fetch N      fetch at most N pages from the network in this run; the rest count as not checked
//   --refresh          fetch again even when a page is cached
//   --delay MS         pause between network requests (default 1500)
//   --also FOLDER      also check the .json and .md files under FOLDER against every page (repeatable)
//
// Exit codes:
//   0  every cited page in scope was checked and none shares a run with the records that cite it
//   1  shared runs were found (FOUND lines; pages that were not checked are listed as well)
//   2  bad arguments, an --also folder that does not exist, or a file under it that is not valid JSON
//   3  no shared runs were found, but some pages were not checked (offline and not cached, over
//      --max-fetch, an HTTP or network error, the network unavailable, a Steam news page that holds no post,
//      or an --only TEXT that matched nothing) or a wiki page was compared with its source only, so the
//      check is incomplete
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// Some sites' terms ask for a contact in the User-Agent (Liquipedia's API terms do). It is not kept in the
// repository: set COPY_CHECK_CONTACT (a web address or an email address) to add one.
const CONTACT = (process.env.COPY_CHECK_CONTACT || '').trim()
export const USER_AGENT = `UnitForgeCopyCheck/1.1 (checks research notes for copied wording; one request at a time${CONTACT ? `; ${CONTACT}` : ''})`

// Keys whose values are names, titles, ids or citations rather than our own prose.
const NOT_PROSE = new Set([
  '$schema', 'url', 'title', 'accessed', 'supports', 'kind', 'id', 'ref', 'name', 'aliases', 'unit', 'game',
  'franchise', 'source_terms', 'developer', 'gate', 'currency',
])
// Keys whose values are names or titles; runs made only of these words are not reported.
const NAME_KEYS = new Set(['title', 'name', 'aliases', 'unit', 'game', 'franchise', 'developer', 'gate'])

// ---------------------------------------------------------------- words

// British spellings mapped to American ones (the word starts with the key), so a copy that only changed
// the spelling is still found. The same mapping is applied to both sides.
const UK_US = {
  armour: 'armor', colour: 'color', favour: 'favor', behaviour: 'behavior', honour: 'honor', harbour: 'harbor',
  vapour: 'vapor', rumour: 'rumor', labour: 'labor', flavour: 'flavor', neighbour: 'neighbor', valour: 'valor',
  vigour: 'vigor', humour: 'humor', endeavour: 'endeavor', defence: 'defense', offence: 'offense',
  licence: 'license', centre: 'center', metre: 'meter', litre: 'liter', fibre: 'fiber', theatre: 'theater',
  calibre: 'caliber', sabre: 'saber', spectre: 'specter', manoeuvr: 'maneuver', grey: 'gray', tyre: 'tire',
  aluminium: 'aluminum', programme: 'program', catalogue: 'catalog', analys: 'analyz', paralys: 'paralyz',
}
const UK_US_RE = new RegExp(`^(${Object.keys(UK_US).join('|')})`)

function spelling(w) {
  w = w.replace(UK_US_RE, m => UK_US[m])
  w = w.replace(/^(\p{L}{3,})is(e|ed|es|ing|ation|ations)$/u, '$1iz$2') // immobilise -> immobilize
  w = w.replace(/^(\p{L}{2,}[ae])ll(ed|ing|er|ers)$/u, '$1l$2') // travelled -> traveled
  return w
}

/** Splits text into normalised words: lower-case, no punctuation, apostrophes dropped, US spelling. */
export function words(text) {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/['‘’`´]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map(spelling)
}

/** The set of all n-word runs in a list of words, each joined with spaces. */
export function grams(ws, n) {
  const out = new Set()
  for (let i = 0; i + n <= ws.length; i++) out.add(ws.slice(i, i + n).join(' '))
  return out
}

/**
 * Finds the runs of n or more consecutive words of `ws` that also occur in a page, given the page's n-gram
 * set. Overlapping hits are merged into one maximal run. `ignore` holds n-grams that never count.
 * Returns the runs as strings of words.
 */
export function sharedRuns(ws, pageGrams, n, ignore = new Set()) {
  return runSpans(gramList(ws, n), g => pageGrams.has(g) && !ignore.has(g)).map(([i, j]) => ws.slice(i, j + n).join(' '))
}

// The n-word run starting at each position of ws, in order.
const gramList = (ws, n) => Array.from({ length: Math.max(0, ws.length - n + 1) }, (_, i) => ws.slice(i, i + n).join(' '))

// Each stretch of positions whose n-gram is a hit, as [first, last]. A position that is not a hit ends the
// stretch; a later, overlapping run is reported on its own.
function runSpans(gs, hit) {
  const spans = []
  for (let i = 0; i < gs.length;) {
    if (!hit(gs[i])) { i++; continue }
    let j = i + 1
    while (j < gs.length && hit(gs[j])) j++
    spans.push([i, j - 1])
    i = j
  }
  return spans
}

// ---------------------------------------------------------------- page text

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', middot: '·', bull: '•',
  times: '×', eacute: 'é', egrave: 'è', aacute: 'á', agrave: 'à', ouml: 'ö', uuml: 'ü', auml: 'ä', szlig: 'ß',
}
export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const cp = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ' '
    }
    return NAMED_ENTITIES[e.toLowerCase()] ?? m
  })
}

/** Turns MediaWiki wikitext into plain text: link labels kept, markup and comments dropped. */
export function wikitextToText(t) {
  t = t.replace(/<!--[\s\S]*?-->/g, ' ')
  // [[target|label]] -> label, [[target]] -> target; repeated so links inside image captions resolve.
  for (let prev = null; prev !== t;) {
    prev = t
    t = t.replace(/\[\[(?:[^[\]|]*\|)*([^[\]|]*)\]\]/g, '$1')
  }
  t = t.replace(/\[(?:https?:)?\/\/[^\s\]]+\s*([^\]]*)\]/g, '$1') // [http://x label] -> label
  t = t.replace(/'{2,}/g, '') // bold and italics
  t = t.replace(/<[^>]+>/g, ' ')
  return decodeEntities(t)
}

/** Turns an HTML page into plain text: scripts, styles and tags dropped, entities decoded. */
export function htmlToText(h) {
  h = h.replace(/<!--[\s\S]*?-->/g, ' ')
  h = h.replace(/<(script|style|noscript|svg|template|head)\b[\s\S]*?<\/\1\s*>/gi, ' ')
  h = h.replace(/<[^>]+>/g, ' ')
  return decodeEntities(h)
}

// A Steam news post (store.steampowered.com/news/app/<id>/view/<post>) is drawn by a script: the page's markup holds
// only the store's frame, and the post itself sits as JSON in one attribute. Read as plain HTML, every such page
// gives the same frame and none of the post.
const STEAM_NEWS = /^https?:\/\/store\.steampowered\.com\/news\/app\//

/** The text of a Steam news post page (its title, body and description), or null when the page holds no post. */
export function steamNewsText(h) {
  const m = h.match(/data-partnereventstore="([^"]*)"/)
  if (!m) return null
  let events
  try { events = JSON.parse(decodeEntities(m[1])) } catch { return null }
  if (!Array.isArray(events)) return null
  const parts = []
  for (const e of events) {
    const body = e?.announcement_body || {}
    for (const t of [e?.event_name, body.headline, body.body]) if (typeof t === 'string' && t.trim()) parts.push(t)
  }
  if (!parts.length) return null
  const og = h.match(/<meta property="og:description" content="([^"]*)"/)
  if (og) parts.push(decodeEntities(og[1]))
  return parts.join('\n').replace(/\[\/?[a-z0-9*]+(?:=[^\]]*)?\]/gi, ' ') // [h3], [/url], [url=...], [*]
}

/**
 * The plain texts of a cached page, or null when it has none to compare (a Steam news page without its post).
 * A wiki page gives two: its source, and its rendered page when the cache holds it (what a reader sees,
 * with the text that templates kept on other pages draw in).
 */
export function pageTexts(page) {
  if (page.format === 'wikitext') {
    return typeof page.rendered === 'string' ? [wikitextToText(page.raw), htmlToText(page.rendered)] : [wikitextToText(page.raw)]
  }
  if (STEAM_NEWS.test(page.url || '')) { const t = steamNewsText(page.raw); return t === null ? null : [t] }
  return [htmlToText(page.raw)]
}

/** The texts of pageTexts() as one text, or null. For comparing, use pageGrams(): a run never spans two texts. */
export function pageText(page) {
  const texts = pageTexts(page)
  return texts === null ? null : texts.join('\n')
}

/** Every n-word run in a cached page's texts, or null when the page has no text to compare. */
export function pageGrams(page, n) {
  const texts = pageTexts(page)
  if (texts === null) return null
  const out = new Set()
  for (const t of texts) for (const g of grams(words(t), n)) out.add(g)
  return out
}

/** A wiki page cached with its source only: what a reader sees was not read. */
export const sourceOnly = page => page.format === 'wikitext' && typeof page.rendered !== 'string'
export const SOURCE_ONLY_OFFLINE = 'offline, and the cache holds the page source but not the rendered page'
export const NO_POST_TEXT = 'a Steam news page that holds no post text'
export const ONLY_MATCHED_NOTHING = '--only matched no cited, linked or cached page'

// ---------------------------------------------------------------- fetching

// MediaWiki sites whose page URLs have no /wiki/ prefix (https://www.halopedia.org/Page_title).
const ROOT_PATH_WIKIS = new Set(['www.halopedia.org', 'halopedia.org'])

// Where a site's MediaWiki API lives, by host; other hosts with /wiki/ URLs are probed.
function apiCandidates(u) {
  const h = u.hostname
  if (h.endsWith('.fandom.com') || h.endsWith('.wiki.gg') || h === 'www.halopedia.org' || h === 'halopedia.org') {
    return [`${u.origin}/api.php`]
  }
  if (h === 'www.sarna.net') return [`${u.origin}/wiki/api.php`]
  if (h === 'strategywiki.org' || h.endsWith('.wikipedia.org') || h.endsWith('.wikimedia.org') || h.endsWith('.wiktionary.org')) {
    return [`${u.origin}/w/api.php`]
  }
  return [`${u.origin}/w/api.php`, `${u.origin}/api.php`]
}

/** For a wiki page URL, the page title and the API endpoints to try; null for other URLs. */
export function mediaWikiTarget(url) {
  const u = new URL(url)
  // Liquipedia keeps one wiki per game, each with its own API (https://liquipedia.net/starcraft2/Page).
  const lq = u.hostname === 'liquipedia.net' && u.pathname.match(/^\/([a-z0-9]+)\/(.+)$/)
  if (lq) return { title: safeDecode(lq[2]).replace(/_/g, ' '), apis: [`${u.origin}/${lq[1]}/api.php`] }
  let title = null
  const m = u.pathname.match(/^\/wiki\/(.+)$/)
  if (m) title = m[1]
  else if (/\/index\.php$/.test(u.pathname) && u.searchParams.get('title')) title = u.searchParams.get('title')
  else if (ROOT_PATH_WIKIS.has(u.hostname) && u.pathname.length > 1) title = u.pathname.slice(1)
  if (!title) return null
  return { title: safeDecode(title).replace(/_/g, ' '), apis: apiCandidates(u) }
}

function safeDecode(s) {
  try { return decodeURIComponent(s) } catch { return s }
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// The shortest pause between two requests to one site, where the site's terms ask for more than --delay.
// Liquipedia's API terms (liquipedia.net/api-terms-of-use, read on 11 November 2026) allow one action=parse
// request per 30 seconds.
export const HOST_MIN_DELAY = Object.freeze({ 'liquipedia.net': 30000 })

// Network errors worth one more try: a dropped connection, a timeout or a temporary DNS failure. Anything
// else (connection refused, host not found, a bad certificate) fails the same way the next time.
const TRANSIENT = new Set(['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'UND_ERR_SOCKET', 'UND_ERR_CONNECT_TIMEOUT'])
const NETWORK_RETRIES = 2 // tries again at most twice after a transient network error
const BUSY_TRIES = 6 // tries in all when a site answers 429 or 503
export const MAX_NETWORK_FAILURES = 3 // network failures in a row before the network counts as unavailable
const NETWORK_UNAVAILABLE = `network unavailable: stopped after ${MAX_NETWORK_FAILURES} network failures in a row`

/** The site could not be reached at all (no HTTP answer), as opposed to an HTTP or wiki API error. */
class NetworkError extends Error {}

function networkCode(e) {
  if (e?.name === 'TimeoutError') return 'ETIMEDOUT' // our own 30-second limit
  return e?.cause?.code || e?.code || e?.message || String(e)
}

// One request at a time. A 429 or 503 is retried with a growing wait (Retry-After if given); a transient
// network error is retried at most NETWORK_RETRIES times; any other network error throws a NetworkError.
async function politeGet(url, state) {
  for (let busy = 1, net = 0; ;) {
    const host = new URL(url).hostname
    const hostDelay = (state.hostDelay || HOST_MIN_DELAY)[host] || 0
    const wait = Math.max(state.lastRequest + state.delay, ((state.lastByHost ||= {})[host] || 0) + hostDelay) - Date.now()
    if (wait > 0) await sleep(wait)
    state.lastRequest = state.lastByHost[host] = Date.now()
    state.requests++
    let res
    try {
      res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, redirect: 'follow', signal: AbortSignal.timeout(30000) })
    } catch (e) {
      const code = networkCode(e)
      if (!TRANSIENT.has(code) || net >= NETWORK_RETRIES) throw new NetworkError(`network error: ${code}`)
      net++
      const backoff = state.retryWait * 2 ** (net - 1)
      state.log(`  ${code} from ${new URL(url).host}, trying again in ${Math.round(backoff / 1000)}s (retry ${net} of ${NETWORK_RETRIES})`)
      await sleep(backoff)
      continue
    }
    if ((res.status === 429 || res.status === 503) && busy < BUSY_TRIES) {
      const retryAfter = Number(res.headers.get('retry-after'))
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : state.retryWait * 2 ** (busy - 1)
      state.log(`  ${res.status} from ${new URL(url).host}, waiting ${Math.round(backoff / 1000)}s (try ${busy} of ${BUSY_TRIES})`)
      await res.body?.cancel()
      await sleep(Math.min(backoff, 120000))
      busy++
      continue
    }
    return res
  }
}

// The body of an answer; a connection lost while reading it is a network failure too.
async function bodyText(res) {
  try {
    return await res.text()
  } catch (e) {
    throw new NetworkError(`network error while reading: ${networkCode(e)}`)
  }
}

async function fetchPage(url, state) {
  const wiki = mediaWikiTarget(url)
  if (wiki) {
    for (const api of wiki.apis) {
      // One request for both the page source and the rendered page (prop=wikitext|text).
      const q = `${api}?action=parse&page=${encodeURIComponent(wiki.title)}&prop=wikitext%7Ctext&redirects=1&format=json`
      const res = await politeGet(q, state)
      if (res.status === 404) { await res.body?.cancel(); continue } // no API at this path
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${api}`)
      const body = await bodyText(res)
      let data
      try { data = JSON.parse(body) } catch { continue } // not an API here; try the next one
      if (data.error) throw new Error(`wiki API: ${data.error.code}${data.error.info ? ` (${data.error.info})` : ''}`)
      const part = v => typeof v === 'string' ? v : v?.['*']
      const raw = part(data.parse?.wikitext), rendered = part(data.parse?.text)
      if (typeof raw === 'string') return { format: 'wikitext', via: q, raw, ...(typeof rendered === 'string' ? { rendered } : {}) }
    }
  }
  const res = await politeGet(url, state)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return { format: 'html', via: url, raw: await bodyText(res) }
}

export function cachePath(cacheDir, url) {
  const u = new URL(url)
  const slug = safeDecode(u.pathname + u.search).replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'index'
  const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 10)
  return path.join(cacheDir, u.hostname, `${slug}-${hash}.json`)
}

// ---------------------------------------------------------------- records and prose

/** Every record that cites sources: { file, id, value }. */
export function collectRecords(root) {
  const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'))
  const ls = d => (fs.existsSync(path.join(root, d)) ? fs.readdirSync(path.join(root, d)).filter(f => f.endsWith('.json')).sort().map(f => `${d}/${f}`) : [])
  const records = []
  for (const f of ls('data/units')) for (const u of read(f).units || []) records.push({ file: f, id: u.id, value: u })
  for (const f of ls('data/patterns')) { const p = read(f); records.push({ file: f, id: p.id, value: p }) }
  if (fs.existsSync(path.join(root, 'data/games.json'))) for (const g of read('data/games.json').games || []) records.push({ file: 'data/games.json', id: g.id, value: g })
  return records
}

/** URLs cited anywhere inside a record (any 'sources' list, including those of examples and analogues). */
export function citedUrls(value) {
  const out = new Set()
  const walk = (x, key) => {
    if (Array.isArray(x)) {
      for (const v of x) {
        if (key === 'sources' && v && typeof v.url === 'string') out.add(v.url)
        walk(v, null)
      }
    } else if (x && typeof x === 'object') {
      for (const [k, v] of Object.entries(x)) walk(v, k)
    }
  }
  walk(value, null)
  return [...out]
}

/** Our own prose strings inside a record, as [jsonPath, text]. */
export function proseStrings(value) {
  const out = []
  const walk = (x, p) => {
    if (typeof x === 'string') out.push([p || '/', x])
    else if (Array.isArray(x)) x.forEach((v, i) => walk(v, `${p}/${i}`))
    else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (!NOT_PROSE.has(k)) walk(v, `${p}/${k}`)
  }
  walk(value, '')
  return out
}

function nameStrings(x, key = null, out = []) {
  if (typeof x === 'string') { if (NAME_KEYS.has(key)) out.push(x) }
  else if (Array.isArray(x)) for (const v of x) nameStrings(v, key, out)
  else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) nameStrings(v, k, out)
  return out
}

// ---------------------------------------------------------------- notes (--also)

/** A note file that can't be read; the command line exits 2 on it, as on a bad option. */
export class BadNoteError extends Error {}

/** The .json and .md files under a folder, at any depth, sorted; folders starting with '.' and node_modules are skipped. */
export function noteFiles(dir) {
  const out = []
  const walk = d => {
    const entries = fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    for (const e of entries) {
      if (e.name.startsWith('.') || e.name === 'node_modules') continue
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.isFile() && /\.(json|md)$/i.test(e.name)) out.push(p)
    }
  }
  walk(dir)
  return out
}

// A web address in running text; one level of brackets is kept, as in wiki titles such as Terror_drone_(Red_Alert_3),
// and so is an apostrophe followed by a word character, as in Devil's_Tongue, while a closing quote ends the address.
const URL_RE = /https?:\/\/(?:[^\s<>()[\]"'`|]|'(?=[\w%-])|\([^\s<>()]*\))+/g
/** The web addresses in a text, without trailing punctuation. A wiki's api.php is an endpoint, not a page, so it is left out. */
export function urlsIn(text) {
  return [...String(text).matchAll(URL_RE)].map(m => m[0].replace(/[.,;:!?*_]+$/, '')).filter(u => !/\/api\.php(?:[?#]|$)/i.test(u))
}
/** Note text as the check reads it: Markdown link targets and bare web addresses are dropped, in .md and .json notes alike. */
const withoutLinks = text => String(text).replace(/\]\((?:[^()\s]|\([^()\s]*\))*\)/g, ']').replace(URL_RE, ' ')

// A Markdown line that starts a new block: a heading, a list item or a table row.
const BLOCK_START = /^\s{0,3}(#{1,6}\s|[-*+]\s|\d+[.)]\s|\|)/

/**
 * The text blocks of a Markdown file (paragraphs, list items, table rows, headings), each as its lines:
 * [[line number, text], ...]. Link targets and bare web addresses are dropped from the text.
 */
export function markdownBlocks(md) {
  const blocks = []
  let cur = null
  md.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) { cur = null; return }
    const text = withoutLinks(line)
    if (!cur || BLOCK_START.test(line)) { cur = []; blocks.push(cur) }
    cur.push([i + 1, text])
    if (/^\s{0,3}#{1,6}\s/.test(line)) cur = null // a heading is one line
  })
  return blocks
}

/**
 * The texts of one note file to check: { at(i), ws, names, urls }, where ws are the words of one string or
 * block and at(i) says where its word i is (a JSON path, or a line of a Markdown file). names are the file's
 * name and title strings, and urls the pages it links to. A .json file that does not parse throws.
 */
export function noteTexts(file) {
  const raw = fs.readFileSync(file, 'utf8')
  if (/\.md$/i.test(file)) {
    const texts = markdownBlocks(raw).map(lines => {
      const ws = []
      const lineOf = []
      for (const [n, text] of lines) for (const w of words(text)) { ws.push(w); lineOf.push(n) }
      return { ws, at: i => `line ${lineOf[i]}` }
    })
    return { texts, names: [], urls: urlsIn(raw) }
  }
  let value
  try { value = JSON.parse(raw) } catch (e) { throw new BadNoteError(`--also: ${file} is not valid JSON (${e.message})`) }
  const texts = proseStrings(value).map(([p, s]) => ({ ws: words(withoutLinks(s)), at: () => p }))
  const urls = [...citedUrls(value), ...allStrings(value).flatMap(urlsIn)].filter(u => /^https?:\/\//.test(u)) // not a file path
  return { texts, names: nameStrings(value), urls: [...new Set(urls)] }
}

function allStrings(x, out = []) {
  if (typeof x === 'string') out.push(x)
  else if (Array.isArray(x)) for (const v of x) allStrings(v, out)
  else if (x && typeof x === 'object') for (const v of Object.values(x)) allStrings(v, out)
  return out
}

const inside = (file, dir) => { const r = path.relative(dir, file); return r && !r.startsWith('..') && !path.isAbsolute(r) }

/**
 * The n-word runs of our own wording: every string in the .json files under data/ and schemas/, and every
 * text block under research/registry-notes/, leaving out files under the `skip` folders.
 */
export function ownWordingGrams(root, n, skip = []) {
  const out = new Set()
  for (const dir of ['data', 'schemas', 'research/registry-notes']) {
    const abs = path.join(root, dir)
    if (!fs.existsSync(abs)) continue
    for (const f of noteFiles(abs)) {
      if (skip.some(s => inside(f, s))) continue
      const raw = fs.readFileSync(f, 'utf8')
      let strings
      if (/\.md$/i.test(f)) strings = markdownBlocks(raw).map(lines => lines.map(([, t]) => t).join(' '))
      else { try { strings = allStrings(JSON.parse(raw)) } catch { continue } }
      for (const s of strings) for (const g of grams(words(s), n)) out.add(g)
    }
  }
  return out
}

// Every page in the cache, as [url, page], for --also.
function cachedPages(cacheDir) {
  const out = []
  if (!fs.existsSync(cacheDir)) return out
  for (const f of fs.readdirSync(cacheDir, { recursive: true }).map(String).filter(f => f.endsWith('.json')).sort()) {
    try {
      const page = JSON.parse(fs.readFileSync(path.join(cacheDir, f), 'utf8'))
      if (typeof page?.url === 'string' && typeof page.raw === 'string') out.push([page.url, page])
    } catch { /* a broken cache file is fetched again when the data cites it */ }
  }
  return out
}

// ---------------------------------------------------------------- the check

// retryWait (the first wait before a retry, doubling each time) and log (where progress lines go) have no
// command-line option; tests set them.
export const DEFAULT_OPTIONS = Object.freeze({
  root: REPO_ROOT, offline: false, minWords: 6, only: Object.freeze([]), also: Object.freeze([]), maxFetch: Infinity,
  refresh: false, delay: 1500, retryWait: 2000, log: msg => console.error(msg),
})

function parseArgs(argv) {
  const opts = { ...DEFAULT_OPTIONS, only: [], also: [] }
  const num = (a, v) => { const n = Number(v); if (!Number.isInteger(n) || n < 0) throw new Error(`${a} needs a whole number`); return n }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--offline') opts.offline = true
    else if (a === '--refresh') opts.refresh = true
    else if (a === '--min-words') opts.minWords = Math.max(2, num(a, argv[++i]))
    else if (a === '--max-fetch') opts.maxFetch = num(a, argv[++i])
    else if (a === '--delay') opts.delay = num(a, argv[++i])
    else if (a === '--only') { if (!argv[i + 1]) throw new Error('--only needs a text'); opts.only.push(argv[++i]) }
    else if (a === '--also') {
      const dir = argv[++i]
      if (!dir) throw new Error('--also needs a folder')
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) throw new Error(`--also: '${dir}' is not a folder`)
      opts.also.push(path.resolve(dir))
    }
    else if (a.startsWith('--')) throw new Error(`unknown option '${a}'`)
    else opts.root = path.resolve(a)
  }
  return opts
}

export async function copyCheck(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const n = opts.minWords
  const cacheDir = path.join(opts.root, '.cache', 'sources')
  const records = collectRecords(opts.root)
  const ignore = new Set()
  for (const r of records) for (const s of nameStrings(r.value)) for (const g of grams(words(s), n)) ignore.add(g)

  // Notes under the --also folders: read first, so a file that does not parse stops the check before any fetch.
  const notes = opts.also.flatMap(dir => noteFiles(dir)).map(file => ({ file, ...noteTexts(file) }))
  const inScope = u => !opts.only.length || opts.only.some(t => u.includes(t))
  const allUrls = [...new Set([...records.flatMap(r => citedUrls(r.value)), ...notes.flatMap(x => x.urls)])].sort()
  const urls = allUrls.filter(inScope)
  // An --only text that is a full web address which nothing cites and the cache lacks (a page the notes name only by
  // title): fetch it, or list it as not checked, so that the run cannot pass without having read it.
  for (const t of opts.only) {
    if (/^https?:\/\//.test(t) && !allUrls.some(u => u.includes(t)) && !fs.existsSync(cachePath(cacheDir, t)) && !urls.includes(t)) urls.push(t)
  }
  const state = { delay: opts.delay, retryWait: opts.retryWait, log: opts.log, lastRequest: 0, lastByHost: {}, hostDelay: opts.hostDelay, requests: 0 }
  const pages = new Map() // url -> gram set
  const notChecked = [] // [url, reason]
  const partly = [] // [url, reason]: wiki pages compared with their source only, not with the rendered page
  let fromCache = 0, fetched = 0, requested = 0, failuresInARow = 0
  for (const url of urls) {
    const file = cachePath(cacheDir, url)
    let page = null, cached = false
    if (fs.existsSync(file) && !opts.refresh) {
      try { page = JSON.parse(fs.readFileSync(file, 'utf8')); cached = true } catch { page = null }
    }
    // A wiki page cached by an older run holds the page source only: read it again for the rendered page. When
    // that cannot be done, the page is still compared with its source, and listed as source only.
    const old = page && sourceOnly(page) ? page : null
    let why = null // why a page that needs fetching was not fetched
    if (!page || old) {
      if (opts.offline) why = old ? SOURCE_ONLY_OFFLINE : 'offline and not cached'
      else if (failuresInARow >= MAX_NETWORK_FAILURES) why = NETWORK_UNAVAILABLE
      else if (requested >= opts.maxFetch) why = `over --max-fetch ${opts.maxFetch}`
      else {
        try {
          opts.log(`fetching ${url}`)
          page = { url, fetched: new Date().toISOString(), ...(await fetchPage(url, state)) }
          cached = false
          fs.mkdirSync(path.dirname(file), { recursive: true })
          fs.writeFileSync(file, JSON.stringify(page, null, 1) + '\n')
          requested++ // pages fetched from the network, for --max-fetch
          failuresInARow = 0
        } catch (e) {
          // Only a failure to reach a site at all counts towards the network being down; an HTTP or wiki
          // API error shows the network works.
          failuresInARow = e instanceof NetworkError ? failuresInARow + 1 : 0
          if (failuresInARow === MAX_NETWORK_FAILURES) opts.log(`${MAX_NETWORK_FAILURES} network failures in a row; fetching nothing more`)
          why = e.message
          page = old
        }
      }
    }
    if (!page) { notChecked.push([url, why]); continue }
    const pg = pageGrams({ url, ...page }, n)
    if (pg === null) { notChecked.push([url, NO_POST_TEXT]); continue }
    if (sourceOnly(page)) partly.push([url, why || 'the wiki gave the page source but no rendered page'])
    if (cached) fromCache++; else fetched++
    pages.set(url, pg)
  }

  const findings = [] // { file, id, path, run, urls }
  for (const r of records) {
    const cited = citedUrls(r.value).filter(u => pages.has(u))
    if (!cited.length) continue
    for (const [p, s] of proseStrings(r.value)) {
      const ws = words(withoutLinks(s)) // a web address named in a note is no wording, as in the --also notes
      if (ws.length < n) continue
      const byRun = new Map()
      for (const u of cited) for (const run of sharedRuns(ws, pages.get(u), n, ignore)) {
        if (!byRun.has(run)) byRun.set(run, [])
        byRun.get(run).push(u)
      }
      for (const [run, us] of byRun) findings.push({ file: r.file, id: r.id, path: p, run, urls: us })
    }
  }

  // Notes cite no page of their own, so each of their texts is checked against every page: the cache and
  // every page fetched above. Runs in our own wording (or names in the data or the notes) never count.
  let notePages = 0
  const seen = new Set(urls) // every address the run looked at or listed, for the --only check below
  if (notes.length) {
    const all = new Map(pages)
    for (const [url, page] of cachedPages(cacheDir)) {
      if (!inScope(url)) continue
      seen.add(url)
      if (all.has(url)) continue
      const pg = pageGrams({ url, ...page }, n)
      if (pg !== null) all.set(url, pg)
    }
    notePages = all.size
    const own = ownWordingGrams(opts.root, n, opts.also)
    for (const x of notes) for (const s of x.names) for (const g of grams(words(s), n)) own.add(g)
    const counts = g => ignore.has(g) || own.has(g)
    for (const note of notes) {
      const file = shownPath(opts.root, note.file)
      for (const t of note.texts) {
        if (t.ws.length < n) continue
        const gs = gramList(t.ws, n)
        const byRun = new Map() // run -> { at, urls }
        for (const [url, pg] of all) {
          for (const [i, j] of runSpans(gs, g => pg.has(g) && !counts(g))) {
            const run = t.ws.slice(i, j + n).join(' ')
            if (!byRun.has(run)) byRun.set(run, { at: t.at(i), urls: [] })
            byRun.get(run).urls.push(url)
          }
        }
        for (const [run, { at, urls: us }] of byRun) findings.push({ file, id: null, path: at, run, urls: us })
      }
    }
  }
  // An --only text that matched nothing means nothing was read for it: a mistyped address must not pass as checked.
  // Without --also the cache is not read, so a full address that is cached but cited nowhere counts as matched.
  for (const t of opts.only) {
    const matched = [...seen].some(u => u.includes(t)) || (/^https?:\/\//.test(t) && fs.existsSync(cachePath(cacheDir, t)))
    if (!matched) notChecked.push([t, ONLY_MATCHED_NOTHING])
  }
  return {
    urls, allUrls, pagesChecked: pages.size, fromCache, fetched, requests: state.requests, notChecked, partly, findings,
    records: records.length, notes: notes.length, notePages,
  }
}

// A file as the report shows it: relative to the repository when it is inside it, with '/' between parts.
function shownPath(root, file) {
  return (inside(file, root) ? path.relative(root, file) : file).split(path.sep).join('/')
}

/** 1 when shared runs were found, else 3 when some pages were not checked or only partly, else 0. */
export function exitCode(res) {
  return res.findings.length ? 1 : res.notChecked.length || res.partly?.length ? 3 : 0
}

export function formatCopyReport(res, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const lines = []
  const scope = opts.only.length ? `${res.urls.length} of ${res.allUrls.length} cited page(s) (--only)` : `${res.urls.length} cited page(s)`
  lines.push(`copy-check: ${scope} in ${res.records} record(s)${res.notes ? ` and ${res.notes} note file(s)` : ''}; reporting shared runs of ${opts.minWords}+ words`)
  const partly = res.partly || []
  lines.push(`pages checked: ${res.pagesChecked} (${res.fromCache} from cache, ${res.fetched} fetched); not checked: ${res.notChecked.length}` +
    (partly.length ? `; source only: ${partly.length}` : ''))
  if (res.notes) lines.push(`notes (--also): ${res.notes} file(s) checked against ${res.notePages} page(s), the cache and every page fetched`)
  for (const f of res.findings) {
    lines.push('')
    lines.push(`FOUND    ${f.file}${f.id ? ` ${f.id}` : ''} ${f.path}`)
    lines.push(`         "${f.run}" (${f.run.split(' ').length} words)`)
    for (const u of f.urls) lines.push(`         shared with ${u}`)
  }
  const byReason = new Map()
  for (const [u, why] of res.notChecked) {
    if (!byReason.has(why)) byReason.set(why, [])
    byReason.get(why).push(u)
  }
  for (const [why, us] of byReason) {
    lines.push('', `NOT CHECKED (${why}): ${us.length} page(s)`)
    for (const u of us) lines.push(`  ${u}`)
  }
  const partlyBy = new Map()
  for (const [u, why] of partly) {
    if (!partlyBy.has(why)) partlyBy.set(why, [])
    partlyBy.get(why).push(u)
  }
  for (const [why, us] of partlyBy) {
    lines.push('', `SOURCE ONLY (${why}): ${us.length} wiki page(s) compared with the page source, not with the rendered page`)
    for (const u of us) lines.push(`  ${u}`)
  }
  lines.push('')
  if (res.findings.length) lines.push(`FAILED: ${res.findings.length} shared run(s); rewrite them in your own words`)
  if (res.notChecked.length || partly.length) {
    const what = [
      ...(res.notChecked.length ? [`${res.notChecked.length} page(s) not checked`] : []),
      ...(partly.length ? [`${partly.length} wiki page(s) compared with the page source only`] : []),
    ].join(' and ')
    lines.push(`INCOMPLETE: ${what} (listed above)` +
      (res.findings.length ? '' : `; no shared runs in the ${res.pagesChecked} page(s) checked`))
  }
  if (!res.findings.length && !res.notChecked.length && !partly.length) lines.push('OK: no shared runs')
  return lines.join('\n')
}

// Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY=1 (Node 22.21+ and 24.5+), so behind a proxy
// the script runs itself again with that set.
export function rerunWithProxy() {
  const proxied = process.env.HTTPS_PROXY || process.env.https_proxy
  if (!proxied || process.env.NODE_USE_ENV_PROXY) return null
  const args = ['--disable-warning=UNDICI-EHPA', ...process.execArgv, ...process.argv.slice(1)] // quiet "experimental" notice
  const r = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  })
  return r.status ?? 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const usage = 'usage: node scripts/copy-check.mjs [root] [--offline] [--min-words N] [--only TEXT] [--max-fetch N] [--refresh] [--delay MS] [--also FOLDER]'
  let opts
  try {
    opts = parseArgs(process.argv.slice(2))
  } catch (e) {
    console.error(`${e.message}\n${usage}`)
    process.exit(2)
  }
  const status = opts.offline ? null : rerunWithProxy()
  if (status !== null) process.exit(status)
  let res
  try {
    res = await copyCheck(opts)
  } catch (e) {
    if (!(e instanceof BadNoteError)) throw e
    console.error(e.message) // read before any page is fetched, so nothing was checked
    process.exit(2)
  }
  console.log(formatCopyReport(res, opts))
  process.exitCode = exitCode(res)
}
