// Tests for the copy-check as a whole: the command line on a throwaway repo with a seeded page cache (no
// network), its exit codes, notes checked with --also, and how it gives up on a network that is down (against
// a local test server). The word-matching helpers are tested in validate.test.mjs.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import {
  REPO_ROOT, MAX_NETWORK_FAILURES, NO_POST_TEXT, ONLY_MATCHED_NOTHING, cachePath, copyCheck, exitCode, formatCopyReport, markdownBlocks, noteFiles,
  noteTexts, pageGrams, pageText, pageTexts, sourceOnly, steamNewsText, urlsIn, covers, hostPause, refusal, HOST_MIN_DELAY, RESTRICTED, RESTRICTED_SITES,
  SOURCE_ONLY_CACHE, SOURCE_ONLY_OFFLINE, USER_AGENT,
} from '../scripts/copy-check.mjs'
import { plantTest } from '../scripts/plant.mjs'

const COPY_CHECK = path.join(REPO_ROOT, 'scripts/copy-check.mjs')
const PAGE = 'https://a.example/p'
const SUMMARY = 'Our drone leaps inside an enemy vehicle and eats it from within, then leaves.'

const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })

// No test may reach a real site: any request that is not to this machine fails here, before it leaves. (A guard in
// the code under test must not be the only thing between a test and a site whose terms forbid automated reading.)
const realFetch = globalThis.fetch
globalThis.fetch = (input, ...rest) => {
  const host = new URL(typeof input === 'string' ? input : input.url).hostname
  if (host !== '127.0.0.1') throw new Error(`a test tried to reach ${host}`)
  return realFetch(input, ...rest)
}
after(() => { globalThis.fetch = realFetch })

// A throwaway repo with one unit that cites the given URLs; `pages` maps a URL to the HTML to cache for it.
function tempRepo(urls, pages = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-copy-'))
  tmpDirs.push(root)
  fs.mkdirSync(path.join(root, 'data/units'), { recursive: true })
  const unit = { id: 'g.f.test-drone', name: 'Test Drone', summary: SUMMARY, sources: urls.map(url => ({ url, title: 'A page' })) }
  fs.writeFileSync(path.join(root, 'data/units/g.json'), JSON.stringify({ units: [unit] }))
  for (const [url, raw] of Object.entries(pages)) {
    const file = cachePath(path.join(root, '.cache', 'sources'), url)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify({ url, format: 'html', raw }))
  }
  return root
}

const cli = (...args) => spawnSync(process.execPath, [COPY_CHECK, ...args], { encoding: 'utf8' })

// Writes files into a folder: { 'a/b.md': 'text', 'c.json': { ... } }.
function writeFiles(dir, files) {
  for (const [f, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true })
    fs.writeFileSync(path.join(dir, f), typeof content === 'string' ? content : JSON.stringify(content))
  }
}

describe('copy-check command line (offline, seeded cache)', () => {
  it('exits 1 with a FOUND line when a record shares six or more words with a page it cites', () => {
    const root = tempRepo([PAGE], { [PAGE]: '<p>The drone leaps inside an enemy vehicle and eats it.</p>' })
    const r = cli(root, '--offline')
    assert.equal(r.status, 1, r.stdout + r.stderr)
    assert.match(r.stdout, /^FOUND +data\/units\/g\.json g\.f\.test-drone \/summary$/m)
    assert.match(r.stdout, /"drone leaps inside an enemy vehicle and eats it" \(9 words\)/)
    assert.match(r.stdout, /^FAILED: 1 shared run\(s\)/m)
  })

  it('exits 3 with an INCOMPLETE line when a cited page is not in the cache', () => {
    const root = tempRepo([PAGE])
    const r = cli(root, '--offline')
    assert.equal(r.status, 3, r.stdout + r.stderr)
    assert.match(r.stdout, /^NOT CHECKED \(offline and not cached\): 1 page\(s\)$/m)
    assert.match(r.stdout, /^INCOMPLETE: 1 page\(s\) not checked/m)
    assert.doesNotMatch(r.stdout, /^OK/m)
  })

  it('exits 0 when every cited page was checked and none shares a run', () => {
    const root = tempRepo([PAGE], { [PAGE]: '<p>A different text about a small robot that climbs into tanks.</p>' })
    const r = cli(root, '--offline')
    assert.equal(r.status, 0, r.stdout + r.stderr)
    assert.match(r.stdout, /^OK: no shared runs$/m)
  })

  it('exits 1, not 3, when runs are found and some pages were not checked as well', () => {
    const other = 'https://b.example/q'
    const root = tempRepo([PAGE, other], { [PAGE]: '<p>The drone leaps inside an enemy vehicle and eats it.</p>' })
    const r = cli(root, '--offline')
    assert.equal(r.status, 1, r.stdout + r.stderr)
    assert.match(r.stdout, /^FAILED/m)
    assert.match(r.stdout, /^INCOMPLETE: 1 page\(s\) not checked/m)
  })

  it('exits 2 on a bad argument', () => {
    const r = cli('--no-such-option')
    assert.equal(r.status, 2)
    assert.match(r.stderr, /usage:/)
  })

  it('exitCode() ranks shared runs over pages not checked', () => {
    assert.equal(exitCode({ findings: [{}], notChecked: [['u', 'x']] }), 1)
    assert.equal(exitCode({ findings: [], notChecked: [['u', 'x']] }), 3)
    assert.equal(exitCode({ findings: [], notChecked: [] }), 0)
  })
})

// A page in the cache that no record cites, and notes that copy from it: --also checks them against every page.
const OTHER = 'https://c.example/guide'
const GUIDE = '<p>The scout buggy is only beaten in speed by the light tank on even ground, and it has a single machine gun.</p>'
const COPIED = 'only beaten in speed by the light tank on even ground'

describe('copy-check --also (notes that cite no page)', () => {
  // A repo whose one cited page shares nothing, plus a cached page that nothing cites.
  const repoWithGuide = () => tempRepo([PAGE], {
    [PAGE]: '<p>A different text about a small robot that climbs into tanks.</p>',
    [OTHER]: GUIDE,
  })

  it('checks every string of the .json notes and every block of the .md notes against every cached page', () => {
    const root = repoWithGuide()
    writeFiles(root, {
      'research/notes/speed.json': { vehicles: [{ key: 'buggy', note: `Per the guide: ${COPIED}.`, title: 'A page title that is never checked at all' }] },
      // A wrapped paragraph: the run starts on line 3 and goes on to line 4.
      'research/notes/sub/hesitations.md': `# Notes\n\nThe buggy is fast. Per the guide: only beaten in\nspeed by the light tank on even ground.\n\n- A list item in our own words.\n`,
      'research/notes/.hidden/skip.md': `It is ${COPIED}.`,
      'research/notes/other.txt': `It is ${COPIED}.`,
    })
    const r = cli(root, '--offline', '--also', path.join(root, 'research/notes'))
    assert.equal(r.status, 1, r.stdout + r.stderr)
    assert.match(r.stdout, /^copy-check: 1 cited page\(s\) in 1 record\(s\) and 2 note file\(s\);/m)
    assert.match(r.stdout, /^notes \(--also\): 2 file\(s\) checked against 2 page\(s\)/m)
    assert.match(r.stdout, /^FOUND +research\/notes\/speed\.json \/vehicles\/0\/note$/m)
    assert.match(r.stdout, /^FOUND +research\/notes\/sub\/hesitations\.md line 3$/m)
    assert.match(r.stdout, new RegExp(`"${COPIED}" \\(11 words\\)\n +shared with ${OTHER.replace(/\./g, '\\.')}`))
    assert.equal((r.stdout.match(/^FOUND/gm) || []).length, 2) // not the title, the hidden folder or the .txt file
  })

  it('ignores runs that are our own wording: in the data, the schemas or the registry notes', () => {
    for (const own of [
      ['data/units/g.json', { units: [{ id: 'g.f.test-drone', name: 'Test Drone', summary: `Ours: ${COPIED}.`, sources: [{ url: PAGE, title: 'A page' }] }] }],
      ['schemas/x.schema.json', { description: `Ours: ${COPIED}.` }],
      ['research/registry-notes/games.md', `Ours: ${COPIED}.\n`],
    ]) {
      const root = repoWithGuide()
      writeFiles(root, { [own[0]]: own[1], 'research/notes/a.md': `Per the guide: ${COPIED}.\n` })
      const r = cli(root, '--offline', '--also', path.join(root, 'research/notes'))
      assert.equal(r.status, 0, `${own[0]}\n${r.stdout}${r.stderr}`)
      assert.match(r.stdout, /^OK: no shared runs$/m)
    }
  })

  it('still checks the registry notes when they are the folder given', () => {
    const root = repoWithGuide()
    writeFiles(root, { 'research/registry-notes/games.md': `Per the guide: ${COPIED}.\n` })
    const r = cli(root, '--offline', '--also', path.join(root, 'research/registry-notes'))
    assert.equal(r.status, 1, r.stdout + r.stderr)
    assert.match(r.stdout, /^FOUND +research\/registry-notes\/games\.md line 1$/m)
  })

  it('also checks the pages the notes link to, and lists them as not checked when they are not cached', () => {
    const root = repoWithGuide()
    writeFiles(root, { 'research/notes/a.md': 'See [the guide](https://d.example/wiki/Buggy_(Scout)) and https://e.example/x.\n' })
    const r = cli(root, '--offline', '--also', path.join(root, 'research/notes'))
    assert.equal(r.status, 3, r.stdout + r.stderr)
    assert.match(r.stdout, /^ {2}https:\/\/d\.example\/wiki\/Buggy_\(Scout\)$/m)
    assert.match(r.stdout, /^ {2}https:\/\/e\.example\/x$/m)
  })

  it('exits 2 on a folder that does not exist or a note that is not valid JSON', () => {
    const root = repoWithGuide()
    const missing = cli(root, '--offline', '--also', path.join(root, 'no-such-folder'))
    assert.equal(missing.status, 2)
    assert.match(missing.stderr, /is not a folder/)
    assert.equal(cli(root, '--offline', '--also').status, 2)
    writeFiles(root, { 'research/notes/bad.json': '{ not json' })
    const bad = cli(root, '--offline', '--also', path.join(root, 'research/notes'))
    assert.equal(bad.status, 2)
    assert.match(bad.stderr, /bad\.json is not valid JSON/)
  })

  it('reads Markdown as blocks and finds the web addresses in it', () => {
    const md = '# Head\nline one\nline two\n\n- item one\n  goes on\n- item two\n| a | b |\n|---|---|\n'
    assert.deepEqual(markdownBlocks(md).map(b => b.map(([n]) => n)), [[1], [2, 3], [5, 6], [7], [8], [9]])
    assert.deepEqual(markdownBlocks('A [link](https://x.example/a_(b)) here.')[0][0][1], 'A [link] here.')
    assert.deepEqual(urlsIn('See https://x.example/wiki/Terror_drone_(Red_Alert_3), then <https://y.example/p>.'),
      ['https://x.example/wiki/Terror_drone_(Red_Alert_3)', 'https://y.example/p'])
    assert.deepEqual(urlsIn('API at `https://w.example/wiki/api.php`, or https://w.example/api.php?action=parse; page https://w.example/wiki/Api.php_page'),
      ['https://w.example/wiki/Api.php_page'])
    assert.deepEqual(urlsIn("Pages https://x.example/wiki/Devil's_Tongue_(Tiberian_Sun) and 'https://y.example/p', then https://z.example/wiki/Template:Data_Rek'Sai/W."),
      ["https://x.example/wiki/Devil's_Tongue_(Tiberian_Sun)", 'https://y.example/p', "https://z.example/wiki/Template:Data_Rek'Sai/W"])
  })

  it('lists note files at any depth and skips dot folders', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-notes-'))
    tmpDirs.push(dir)
    writeFiles(dir, { 'b.md': 'x', 'a/c.json': {}, '.cache/d.md': 'x', 'e.txt': 'x' })
    assert.deepEqual(noteFiles(dir).map(f => path.relative(dir, f).split(path.sep).join('/')), ['a/c.json', 'b.md'])
    const t = noteTexts(path.join(dir, 'a/c.json'))
    assert.deepEqual(t.texts, [])
  })

  it('drops web addresses from the strings of a .json note, as from a .md note', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-notes-'))
    tmpDirs.push(dir)
    writeFiles(dir, { 'n.json': { notes: 'Scan: https://static.example.net/cnc_gamepedia_en/images/b/be/Manual.pdf/revision/latest, read [it](https://x.example/a_(b)) first.', pages_read: ['https://x.example/wiki/Page'] } })
    const t = noteTexts(path.join(dir, 'n.json'))
    assert.deepEqual(t.texts.map(x => x.ws.join(' ')), ['scan read it first', ''])
    assert.deepEqual(t.urls, ['https://static.example.net/cnc_gamepedia_en/images/b/be/Manual.pdf/revision/latest', 'https://x.example/a_(b)', 'https://x.example/wiki/Page'])
  })
})

// A local server: `handle` decides what each request gets. Returns its base URL and a request count.
async function server(handle) {
  const hits = { n: 0 }
  const srv = http.createServer((req, res) => { hits.n++; handle(req, res) })
  await new Promise(resolve => srv.listen(0, '127.0.0.1', resolve))
  after(() => { srv.closeAllConnections(); srv.close() })
  return { base: `http://127.0.0.1:${srv.address().port}`, hits }
}

const quick = root => ({ root, delay: 0, retryWait: 1, log: () => {} })

describe('copy-check on a failing network', () => {
  it('retries a dropped connection at most twice, then stops fetching after three failures in a row', async () => {
    const { base, hits } = await server(req => req.socket.destroy())
    const urls = ['a', 'b', 'c', 'd', 'e'].map(p => `${base}/${p}`)
    const res = await copyCheck(quick(tempRepo(urls)))
    assert.equal(MAX_NETWORK_FAILURES, 3)
    assert.equal(hits.n, 3 * 3, 'three pages, each tried once and retried twice')
    assert.equal(res.requests, 9)
    assert.deepEqual(res.notChecked.map(([, why]) => why.split(':')[0]),
      ['network error', 'network error', 'network error', 'network unavailable', 'network unavailable'])
    assert.equal(exitCode(res), 3)
    assert.match(formatCopyReport(res), /^NOT CHECKED \(network unavailable: stopped after 3 network failures in a row\): 2 page\(s\)$/m)
  })

  it('does not retry an error that will not go away, such as a refused connection', async () => {
    const closed = http.createServer() // listen and close again to get a port nothing listens on
    await new Promise(resolve => closed.listen(0, '127.0.0.1', resolve))
    const port = closed.address().port
    await new Promise(resolve => closed.close(resolve))
    const urls = ['a', 'b', 'c', 'd'].map(p => `http://127.0.0.1:${port}/${p}`)
    const res = await copyCheck(quick(tempRepo(urls)))
    assert.equal(res.requests, 3, 'one try each for three pages, then none')
    assert.deepEqual(res.notChecked.map(([, why]) => why), [
      'network error: ECONNREFUSED', 'network error: ECONNREFUSED', 'network error: ECONNREFUSED',
      'network unavailable: stopped after 3 network failures in a row',
    ])
  })

  it('does not count an HTTP error as the network being down', async () => {
    const { base, hits } = await server((req, res) => { res.writeHead(404); res.end('gone') })
    const urls = ['a', 'b', 'c', 'd', 'e'].map(p => `${base}/${p}`)
    const res = await copyCheck(quick(tempRepo(urls)))
    assert.equal(hits.n, 5)
    assert.deepEqual(res.notChecked.map(([, why]) => why), Array(5).fill('HTTP 404'))
  })

  it('caches a fetched page and checks it', async () => {
    const { base } = await server((req, res) => {
      res.writeHead(200, { 'content-type': 'text/html' })
      res.end('<html><head><title>x</title></head><body><p>The drone leaps inside an enemy vehicle and eats it.</p></body></html>')
    })
    const root = tempRepo([`${base}/page`])
    const res = await copyCheck(quick(root))
    assert.equal(res.fetched, 1)
    assert.equal(res.findings.length, 1)
    assert.ok(fs.existsSync(cachePath(path.join(root, '.cache', 'sources'), `${base}/page`)))
    const again = await copyCheck({ ...quick(root), offline: true })
    assert.equal(again.fromCache, 1)
    assert.equal(exitCode(again), 1)
  })
})

// A Steam news post page as the store serves it: a frame of markup, with the post as JSON in one attribute.
const STEAM = 'https://store.steampowered.com/news/app/1/view/42'
const steamPage = events => `<html><head><meta property="og:description" content="A short note about the drone."></head><body><div id="application_config" ` +
  `data-partnereventstore="${JSON.stringify(events).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></div><p>Sign in to add this item to your wishlist.</p></body></html>`
const POST = [{ event_name: 'Patch notes', announcement_body: { headline: 'Patch notes', body: '[h3]Drones[/h3]\n[list][*]The drone leaps inside an enemy vehicle and eats it from within.[/list]' } }]

describe('copy-check on Steam news posts', () => {
  it('reads the post from the page\'s data attribute, not the store frame around it', () => {
    const text = steamNewsText(steamPage(POST))
    assert.match(text, /The drone leaps inside an enemy vehicle and eats it from within\./)
    assert.match(text, /A short note about the drone\./)
    assert.doesNotMatch(text, /\[h3\]|\[\*\]|wishlist/)
    assert.equal(pageText({ url: STEAM, format: 'html', raw: steamPage(POST) }), text)
    // the same markup under another address is read as plain HTML, frame and all
    assert.match(pageText({ url: PAGE, format: 'html', raw: steamPage(POST) }), /wishlist/)
  })

  it('finds a run a record shares with a Steam post it cites', () => {
    const root = tempRepo([STEAM], { [STEAM]: steamPage(POST) })
    const r = cli(root, '--offline')
    assert.equal(r.status, 1, r.stdout + r.stderr)
    assert.match(r.stdout, /"drone leaps inside an enemy vehicle and eats it from within" \(11 words\)/)
  })

  it('does not count a web address in a record as wording, even when a cited page links to the same address', async () => {
    const link = 'https://store.steampowered.com/news/app/1486920/view/505083956845086898'
    const post = [{ event_name: 'Notes', announcement_body: { headline: 'Notes', body: `See the earlier notes at ${link} for more.` } }]
    const root = tempRepo([STEAM], { [STEAM]: steamPage(post) })
    const file = path.join(root, 'data/units/g.json')
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    data.units[0].summary = `The older notes (${link}) say the same.`
    fs.writeFileSync(file, JSON.stringify(data))
    const res = await copyCheck({ root, offline: true, log: () => {} })
    assert.deepEqual(res.findings, [])
    assert.equal(res.pagesChecked, 1)
  })

  it('lists a Steam news page that holds no post as not checked', async () => {
    assert.equal(steamNewsText(steamPage([])), null)
    assert.equal(steamNewsText('<p>no store here</p>'), null)
    const root = tempRepo([STEAM], { [STEAM]: steamPage([]) })
    const res = await copyCheck({ root, offline: true, log: () => {} })
    assert.deepEqual(res.notChecked, [[STEAM, NO_POST_TEXT]])
    assert.equal(res.pagesChecked, 0)
    assert.equal(exitCode(res), 3)
  })
})

describe('copy-check --only', () => {
  it('checks only the pages whose address holds the text', async () => {
    const root = tempRepo([PAGE, OTHER], { [PAGE]: '<p>The drone leaps inside an enemy vehicle and eats it.</p>', [OTHER]: GUIDE })
    const res = await copyCheck({ root, offline: true, only: ['c.example'], log: () => {} })
    assert.deepEqual(res.urls, [OTHER])
    assert.equal(exitCode(res), 0)
  })

  it('ends incomplete when the text matches no cited, linked or cached page', async () => {
    const root = tempRepo([PAGE], { [PAGE]: '<p>Nothing shared here.</p>' })
    const res = await copyCheck({ root, offline: true, only: ['no-such-page'], log: () => {} })
    assert.deepEqual(res.notChecked, [['no-such-page', ONLY_MATCHED_NOTHING]])
    assert.equal(exitCode(res), 3)
    assert.match(formatCopyReport(res, { only: ['no-such-page'] }), /--only matched no cited, linked or cached page/)
  })

  it('takes a full address that nothing cites as a page to read: not cached and offline, it is not checked', async () => {
    const root = tempRepo([PAGE], { [PAGE]: '<p>Nothing shared here.</p>' })
    const res = await copyCheck({ root, offline: true, only: ['https://b.example/named-only'], log: () => {} })
    assert.deepEqual(res.notChecked, [['https://b.example/named-only', 'offline and not cached']])
    assert.equal(exitCode(res), 3)
  })

  it('checks a cached page that only the notes name by title, when its full address is given', async () => {
    const root = tempRepo([PAGE], { [PAGE]: '<p>Nothing shared here.</p>', [OTHER]: GUIDE })
    writeFiles(path.join(root, 'notes'), { 'a.md': `The scout buggy is ${COPIED}.` })
    const res = await copyCheck({ root, offline: true, only: [OTHER], also: [path.join(root, 'notes')], log: () => {} })
    assert.equal(res.notChecked.length, 0)
    assert.equal(res.findings.length, 1)
    assert.deepEqual(res.findings[0].urls, [OTHER])
  })
})


// A wiki page as a reader sees it holds text that its source only names: a template kept on another page draws
// the ability box in. The check reads both the source and the rendered page.
const WIKI = 'https://w.example/wiki/Test_Drone'
const WIKI_SOURCE = "'''Test Drone''' is a small scout.\n{{DroneLeapAbility}}\n[[Category:Drones]]"
const WIKI_RENDERED = '<div class="mw-parser-output"><p><b>Test Drone</b> is a small scout.</p>' +
  '<table><tr><th>Leap</th></tr><tr><td>The drone leaps inside an enemy vehicle and eats it from within.</td></tr></table></div>'

// Seeds a wiki page in a throwaway repo's cache: with its rendered page, or (an older cache) with the source only.
function seedWiki(root, url, { rendered } = {}) {
  const file = cachePath(path.join(root, '.cache', 'sources'), url)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ url, format: 'wikitext', raw: WIKI_SOURCE, ...(rendered ? { rendered } : {}) }))
}

describe('copy-check on rendered wiki pages', () => {
  it('reads a wiki page as its source and as the rendered page, and never joins the two into one run', () => {
    const page = { url: WIKI, format: 'wikitext', raw: 'one two three four five', rendered: '<p>six seven eight nine ten</p>' }
    assert.deepEqual(pageTexts(page).map(t => t.trim()), ['one two three four five', 'six seven eight nine ten'])
    assert.equal(pageGrams(page, 5).size, 2)
    assert.equal(pageGrams(page, 6).size, 0, 'no six-word run spans the source and the rendered page')
    assert.equal(sourceOnly(page), false)
    assert.equal(sourceOnly({ format: 'wikitext', raw: 'x' }), true)
    assert.equal(sourceOnly({ format: 'html', raw: 'x' }), false)
    assert.deepEqual(pageTexts({ format: 'wikitext', raw: 'one two' }), ['one two'])
    assert.match(pageText(page), /five\n\s*six/)
  })

  it('finds a run that only the rendered page holds: text a template on another page draws in', () => {
    const root = tempRepo([WIKI])
    seedWiki(root, WIKI, { rendered: WIKI_RENDERED })
    const r = cli(root, '--offline')
    assert.equal(r.status, 1, r.stdout)
    assert.match(r.stdout, /FOUND {4}data\/units\/g\.json g\.f\.test-drone \/summary/)
    assert.match(r.stdout, /"drone leaps inside an enemy vehicle and eats it from within"/)
  })

  it('offline, compares a page cached with its source only, lists it as SOURCE ONLY and ends incomplete', () => {
    const root = tempRepo([WIKI])
    seedWiki(root, WIKI)
    const r = cli(root, '--offline')
    assert.equal(r.status, 3, r.stdout)
    assert.doesNotMatch(r.stdout, /FOUND/)
    assert.match(r.stdout, /^pages checked: 1 \(1 from cache, 0 fetched\); not checked: 0; source only: 1$/m)
    assert.match(r.stdout, new RegExp(`^SOURCE ONLY \\(${SOURCE_ONLY_OFFLINE}\\): 1 wiki page\\(s\\) compared with the page source, not with the rendered page$`, 'm'))
    assert.match(r.stdout, /^INCOMPLETE: 1 wiki page\(s\) compared with the page source only \(listed above\); no shared runs in the 1 page\(s\) checked$/m)
  })

  it('still reports a run in the source of a page cached with its source only', async () => {
    const root = tempRepo([WIKI])
    const file = cachePath(path.join(root, '.cache', 'sources'), WIKI)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify({ url: WIKI, format: 'wikitext', raw: 'The [[drone]] leaps inside an enemy vehicle and eats it.' }))
    const res = await copyCheck({ ...quick(root), offline: true })
    assert.equal(res.findings.length, 1)
    assert.equal(res.partly.length, 1)
    assert.equal(exitCode(res), 1)
    assert.match(formatCopyReport(res), /^INCOMPLETE: 1 wiki page\(s\) compared with the page source only \(listed above\)$/m)
  })

  it('exitCode() is 3 when a page was compared with its source only', () => {
    assert.equal(exitCode({ findings: [], notChecked: [], partly: [['u', 'why']] }), 3)
    assert.equal(exitCode({ findings: [], notChecked: [], partly: [] }), 0)
    assert.equal(exitCode({ findings: [], notChecked: [] }), 0)
  })

  // A local wiki: /api.php answers action=parse with the props asked for.
  async function wikiServer({ withText = true } = {}) {
    const asked = []
    const s = await server((req, res) => {
      const u = new URL(req.url, 'http://x')
      if (u.pathname !== '/api.php') { res.writeHead(404); res.end('no'); return }
      asked.push({ prop: u.searchParams.get('prop'), page: u.searchParams.get('page'), agent: req.headers['user-agent'] })
      const parse = { title: u.searchParams.get('page'), wikitext: { '*': WIKI_SOURCE }, ...(withText ? { text: { '*': WIKI_RENDERED } } : {}) }
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ parse }))
    })
    return { ...s, asked }
  }

  it('asks the wiki for the source and the rendered page in one request, caches both and finds the run', async () => {
    const { base, hits, asked } = await wikiServer()
    const url = `${base}/wiki/Test_Drone`
    const root = tempRepo([url])
    const res = await copyCheck(quick(root))
    assert.equal(asked.filter(a => a.page === 'Test Drone').length, 1, 'one request for the page')
    assert.equal(asked.find(a => a.page === 'Test Drone').prop, 'wikitext|text')
    assert.equal(asked[0].agent, USER_AGENT)
    assert.equal(res.fetched, 1)
    assert.equal(res.partly.length, 0)
    assert.equal(res.findings.length, 1)
    const cached = JSON.parse(fs.readFileSync(cachePath(path.join(root, '.cache', 'sources'), url), 'utf8'))
    assert.equal(cached.format, 'wikitext')
    assert.equal(cached.raw, WIKI_SOURCE)
    assert.equal(cached.rendered, WIKI_RENDERED)
    const before = hits.n
    const again = await copyCheck(quick(root))
    assert.equal(hits.n, before, 'a page cached with both is not fetched again')
    assert.equal(again.fromCache, 1)
  })

  it('fetches a page again when the cache holds its source only, and then finds the run', async () => {
    const { base, asked } = await wikiServer()
    const url = `${base}/wiki/Test_Drone`
    const root = tempRepo([url])
    seedWiki(root, url)
    const res = await copyCheck(quick(root))
    assert.equal(asked.length >= 1, true)
    assert.equal(res.fetched, 1)
    assert.equal(res.fromCache, 0)
    assert.equal(res.partly.length, 0)
    assert.equal(res.findings.length, 1)
    assert.equal(exitCode(res), 1)
  })

  it('keeps the cached source and lists the page as source only when the page cannot be fetched again', async () => {
    const { base } = await server((req, res) => { res.writeHead(500); res.end('down') })
    const url = `${base}/wiki/Test_Drone`
    const root = tempRepo([url])
    seedWiki(root, url)
    const res = await copyCheck(quick(root))
    assert.equal(res.notChecked.length, 0)
    assert.equal(res.pagesChecked, 1)
    assert.equal(res.fromCache, 1)
    assert.deepEqual(res.partly.map(([u]) => u), [url])
    assert.match(res.partly[0][1], /^HTTP 500/)
    assert.equal(exitCode(res), 3)
  })

  it('lists a page as source only when the wiki gives no rendered page', async () => {
    const { base } = await wikiServer({ withText: false })
    const url = `${base}/wiki/Test_Drone`
    const res = await copyCheck(quick(tempRepo([url])))
    assert.equal(res.fetched, 1)
    assert.deepEqual(res.partly, [[url, 'the wiki gave the page source but no rendered page']])
    assert.equal(exitCode(res), 3)
  })

  it('checks notes against the rendered page of a cached wiki page too', () => {
    const root = tempRepo([])
    seedWiki(root, WIKI, { rendered: WIKI_RENDERED })
    fs.mkdirSync(path.join(root, 'notes'))
    fs.writeFileSync(path.join(root, 'notes/n.md'), 'A report says the drone leaps inside an enemy vehicle and eats it from within.\n')
    const r = cli(root, '--offline', '--also', path.join(root, 'notes'))
    assert.equal(r.status, 1, r.stdout)
    assert.match(r.stdout, /FOUND {4}notes\/n\.md line 1/)
  })

  it('waits longer between two requests to a site whose terms ask for it', async () => {
    const { base } = await wikiServer()
    assert.equal(HOST_MIN_DELAY['liquipedia.net'], 30000)
    const urls = [`${base}/wiki/A`, `${base}/wiki/B`]
    const t0 = Date.now()
    await copyCheck({ ...quick(tempRepo(urls)), hostDelay: { '127.0.0.1': 400 } })
    const slow = Date.now() - t0
    assert.ok(slow >= 400, `two requests to one site took ${slow} ms, the second should wait 400 ms`)
  })
})

// Found by the review of the change that made the copy-check read rendered pages (11 November 2026).
describe('copy-check: pauses, contacts and cache-only pages', () => {
  // A local site that notes when every request arrives and when its answer goes out. It answers after `think` ms.
  async function slowSite(think = 0) {
    const log = [] // { path, at, answered }
    const s = await server((req, res) => {
      const u = new URL(req.url, 'http://x'), entry = { path: u.pathname + u.search, at: Date.now(), answered: 0 }
      log.push(entry)
      setTimeout(() => {
        entry.answered = Date.now()
        if (u.pathname !== '/api.php') { res.writeHead(404); res.end('no'); return }
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ parse: { title: u.searchParams.get('page'), wikitext: { '*': WIKI_SOURCE }, text: { '*': WIKI_RENDERED } } }))
      }, think)
    })
    return { ...s, log }
  }

  it('keeps a site\'s pause between two runs in one process, as the plant test makes them', async () => {
    const { base, log } = await slowSite()
    const opts = { delay: 0, retryWait: 1, hostDelay: { '127.0.0.1': 400 } }
    await plantTest(`${base}/wiki/A`, opts)
    const lastOfA = log[log.length - 1]
    await plantTest(`${base}/wiki/B`, opts)
    const firstOfB = log[log.indexOf(lastOfA) + 1]
    assert.ok(firstOfB, 'the second run asked for nothing')
    assert.ok(firstOfB.at - lastOfA.answered >= 395, `the second run's first request came ${firstOfB.at - lastOfA.answered} ms after the first run's last answer`)
  })

  it('counts the pause from the answer, so the site never sees two requests closer than the pause', async () => {
    const { base, log } = await slowSite(250)
    await copyCheck({ ...quick(tempRepo([`${base}/wiki/A`, `${base}/wiki/B`])), hostDelay: { '127.0.0.1': 300 } })
    assert.ok(log.length >= 4, `requests seen: ${log.length}`)
    const gaps = log.slice(1).map((e, i) => e.at - log[i].answered)
    assert.ok(gaps.every(g => g >= 295), `ms between an answer and the next request: ${gaps.join(', ')}`)
  })

  it('takes a site\'s pause from its terms, for its subdomains too, unless a test overrides it', () => {
    assert.equal(hostPause('liquipedia.net'), 30000)
    assert.equal(hostPause('www.liquipedia.net'), 30000)
    assert.equal(hostPause('notliquipedia.net'), 0)
    assert.equal(hostPause('liquipedia.net', { hostDelay: {} }), 0)
    assert.equal(hostPause('cnc.fandom.com'), 0)
    assert.equal(hostPause('a.example', { hostDelay: { 'a.example': 7 } }), 7)
  })

  it('asks nothing of a site whose terms restrict reading, nor of its subdomains, until both switches are set', async () => {
    assert.ok(RESTRICTED_SITES.has('liquipedia.net'))
    assert.ok(covers(RESTRICTED_SITES, 'api.liquipedia.net'))
    assert.ok(!covers(RESTRICTED_SITES, 'notliquipedia.net'))
    assert.ok(covers(RESTRICTED_SITES, 'liquipedia.net.'), 'a host name may end with a dot')
    assert.ok(covers(RESTRICTED_SITES, 'WWW.Liquipedia.NET'))
    assert.equal(hostPause('liquipedia.net.'), 30000)
    const saved = { a: process.env.UNIT_FORGE_ALLOW_HOSTS, c: process.env.COPY_CHECK_CONTACT }
    const set = (a, c) => { for (const [k, v] of [['UNIT_FORGE_ALLOW_HOSTS', a], ['COPY_CHECK_CONTACT', c]]) { if (v === undefined) delete process.env[k]; else process.env[k] = v } }
    try {
      set(undefined, undefined)
      assert.equal(refusal('liquipedia.net'), RESTRICTED)
      assert.equal(refusal('www.liquipedia.net'), RESTRICTED)
      assert.equal(refusal('cnc.fandom.com'), null)
      set('liquipedia.net', undefined)
      assert.equal(refusal('liquipedia.net'), RESTRICTED, 'allowed, but no contact')
      set(undefined, 'https://example.org/contact')
      assert.equal(refusal('liquipedia.net'), RESTRICTED, 'a contact, but not allowed')
      set('liquipedia.net', 'https://example.org/contact')
      assert.equal(refusal('liquipedia.net'), null)
      assert.equal(refusal('www.liquipedia.net'), null)
      set(undefined, undefined)
      for (const url of ['https://liquipedia.net/starcraft2/No_Such_Test_Page', 'https://www.liquipedia.net/starcraft2/No_Such_Test_Page', 'https://liquipedia.net./starcraft2/No_Such_Test_Page']) {
        const res = await copyCheck(quick(tempRepo([url])))
        assert.equal(res.requests, 0, 'a request was started')
        assert.deepEqual(res.notChecked, [[url, RESTRICTED]])
        assert.equal(exitCode(res), 3)
      }
    } finally {
      set(saved.a, saved.c)
    }
  })

  it('never fetches a restricted site\'s page as HTML, even when both switches are set and its API gives no page', async () => {
    const saved = { a: process.env.UNIT_FORGE_ALLOW_HOSTS, c: process.env.COPY_CHECK_CONTACT, f: globalThis.fetch }
    const asked = []
    process.env.UNIT_FORGE_ALLOW_HOSTS = 'liquipedia.net'
    process.env.COPY_CHECK_CONTACT = 'https://example.org/contact'
    globalThis.fetch = async input => { asked.push(String(input)); return new Response('<html>not an API answer</html>', { status: 200 }) } // nothing leaves
    try {
      const url = 'https://liquipedia.net/starcraft2/No_Such_Test_Page'
      const res = await copyCheck({ ...quick(tempRepo([url])), hostDelay: {}, stampDir: null })
      assert.equal(asked.length, 1)
      assert.match(asked[0], /^https:\/\/liquipedia\.net\/starcraft2\/api\.php\?action=parse/)
      assert.match(res.notChecked[0][1], /this site's pages are not fetched as HTML/)
    } finally {
      globalThis.fetch = saved.f
      for (const [k, v] of [['UNIT_FORGE_ALLOW_HOSTS', saved.a], ['COPY_CHECK_CONTACT', saved.c]]) { if (v === undefined) delete process.env[k]; else process.env[k] = v }
    }
  })

  it('follows a redirect itself, and refuses one that leads to a page of a restricted site', async () => {
    const seen = []
    const { base } = await server((req, res) => {
      seen.push(req.url)
      if (req.url === '/moved') { res.writeHead(302, { location: '/final' }); res.end(); return }
      if (req.url === '/away') { res.writeHead(301, { location: 'https://liquipedia.net/starcraft2/Marine' }); res.end(); return }
      if (req.url === '/loop') { res.writeHead(302, { location: '/loop' }); res.end(); return }
      res.writeHead(200, { 'content-type': 'text/html' })
      res.end('<p>The drone leaps inside an enemy vehicle and eats it.</p>')
    })
    const res = await copyCheck(quick(tempRepo([`${base}/moved`, `${base}/away`, `${base}/loop`])))
    assert.deepEqual(seen.filter(u => u === '/final').length, 1, 'the redirect was not followed')
    assert.equal(res.findings.length, 1)
    const why = Object.fromEntries(res.notChecked)
    assert.match(why[`${base}/away`], /^redirected to liquipedia\.net, whose pages are not fetched as HTML/)
    assert.match(why[`${base}/loop`], /^more than 5 redirects/)
  })

  it('compares a sentence copied across a footnote mark', () => {
    const page = { url: WIKI, format: 'wikitext', raw: 'x', rendered: '<p>The drone leaps inside an enemy<sup id="c1" class="reference"><a href="#n1">[1]</a></sup> vehicle and eats it from within.</p>' }
    const texts = pageTexts(page)
    assert.equal(texts.length, 3, 'the source, the rendered page, and the rendered page without footnote marks')
    assert.ok(pageGrams(page, 6).has('leaps inside an enemy vehicle and'))
    assert.ok(pageGrams(page, 6).has('inside an enemy 1 vehicle and'), 'the page as it is stays compared too')
    assert.equal(pageTexts({ url: WIKI, format: 'wikitext', raw: 'x', rendered: '<p>No marks here.</p>' }).length, 2)
    const root = tempRepo([WIKI])
    seedWiki(root, WIKI, { rendered: page.rendered })
    const r = cli(root, '--offline')
    assert.equal(r.status, 1, r.stdout)
    assert.match(r.stdout, /"drone leaps inside an enemy vehicle and eats it from within"/)
  })

  it('lists a page that only the cache holds, with its source only, when notes are checked against it', () => {
    const root = tempRepo([])
    seedWiki(root, WIKI)
    fs.mkdirSync(path.join(root, 'notes'))
    fs.writeFileSync(path.join(root, 'notes/n.md'), 'A note that cites nothing and copies nothing from any page at all.\n')
    const r = cli(root, '--offline', '--also', path.join(root, 'notes'))
    assert.equal(r.status, 3, r.stdout)
    assert.ok(r.stdout.includes(`SOURCE ONLY (${SOURCE_ONLY_CACHE}): 1 wiki page(s)`), r.stdout)
    assert.doesNotMatch(r.stdout, /^OK/m)
  })

  it('lists a cited page once when --refresh cannot fetch it and the cache holds its source only', async () => {
    const { base } = await server((req, res) => { res.writeHead(500); res.end('down') })
    const url = `${base}/wiki/Test_Drone`
    const root = tempRepo([url])
    seedWiki(root, url)
    fs.mkdirSync(path.join(root, 'notes'))
    fs.writeFileSync(path.join(root, 'notes/n.md'), 'A note that copies nothing from any page at all, as far as anyone can tell.\n')
    const res = await copyCheck({ ...quick(root), refresh: true, also: [path.join(root, 'notes')] })
    assert.deepEqual(res.notChecked.map(([u]) => u), [url])
    assert.deepEqual(res.partly, [], 'the page is listed a second time as source only')
  })

  it('reads such a page again when its full address is given with --only', async () => {
    const { base, log } = await slowSite()
    const url = `${base}/wiki/Test_Drone`
    const root = tempRepo([])
    seedWiki(root, url)
    fs.mkdirSync(path.join(root, 'notes'))
    fs.writeFileSync(path.join(root, 'notes/n.md'), 'A report says the drone leaps inside an enemy vehicle and eats it from within.\n')
    const res = await copyCheck({ ...quick(root), also: [path.join(root, 'notes')], only: [url] })
    assert.equal(log.filter(e => e.path.startsWith('/api.php')).length, 1, 'the page was not fetched again')
    assert.equal(res.partly.length, 0)
    assert.equal(res.findings.length, 1)
  })
})
