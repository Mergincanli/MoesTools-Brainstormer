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
  REPO_ROOT, MAX_NETWORK_FAILURES, cachePath, copyCheck, exitCode, formatCopyReport, markdownBlocks, noteFiles, noteTexts, urlsIn,
} from '../scripts/copy-check.mjs'

const COPY_CHECK = path.join(REPO_ROOT, 'scripts/copy-check.mjs')
const PAGE = 'https://a.example/p'
const SUMMARY = 'Our drone leaps inside an enemy vehicle and eats it from within, then leaves.'

const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })

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
  })

  it('lists note files at any depth and skips dot folders', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-notes-'))
    tmpDirs.push(dir)
    writeFiles(dir, { 'b.md': 'x', 'a/c.json': {}, '.cache/d.md': 'x', 'e.txt': 'x' })
    assert.deepEqual(noteFiles(dir).map(f => path.relative(dir, f).split(path.sep).join('/')), ['a/c.json', 'b.md'])
    const t = noteTexts(path.join(dir, 'a/c.json'))
    assert.deepEqual(t.texts, [])
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
