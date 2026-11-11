// Tests for the page reader (scripts/page-text.mjs): what it prints for a wiki page and for a plain page, its use
// of the page cache, the sites it never fetches, and the pause it keeps between requests to one site, also between
// separate processes. No real network: a seeded cache and a local server.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import { REPO_ROOT, cachePath } from '../scripts/copy-check.mjs'
import { NO_FETCH, pageAsText, readPage } from '../scripts/page-text.mjs'

const SCRIPT = path.join(REPO_ROOT, 'scripts/page-text.mjs')
const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })
const tempRoot = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-page-')); tmpDirs.push(d); return d }
const cli = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' })

const WIKI = 'https://w.example/wiki/Test_Drone'
const SOURCE = "{{Infobox|cost=150|speed=3.15}}\n'''Test Drone''' is a scout.\n{{DroneLeapAbility}}"
const RENDERED = '<div><p><b>Test Drone</b> is a scout.</p><table><tr><th>Leap</th><td>Jumps inside an enemy vehicle.</td></tr></table><script>var hidden = 1</script></div>'

function seed(root, url, page) {
  const file = cachePath(path.join(root, '.cache', 'sources'), url)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ url, ...page }))
}

describe('page reader: what it prints', () => {
  it('prints a wiki page as its source and its rendered page, one line per block, without markup', () => {
    const root = tempRoot()
    seed(root, WIKI, { format: 'wikitext', raw: SOURCE, rendered: RENDERED })
    const r = cli(WIKI, '--offline', '--root', root)
    assert.equal(r.status, 0, r.stderr)
    assert.match(r.stdout, /^== SOURCE \(wikitext\) ==\n\{\{Infobox\|cost=150\|speed=3\.15\}\}/)
    assert.match(r.stdout, /== RENDERED \(what a reader sees, one line per block\) ==\nTest Drone is a scout\.\nLeap\nJumps inside an enemy vehicle\.\n/)
    assert.doesNotMatch(r.stdout, /<|hidden/)
    assert.match(r.stderr, /from the cache/)
  })

  it('prints one part of a wiki page on request', () => {
    const root = tempRoot()
    seed(root, WIKI, { format: 'wikitext', raw: SOURCE, rendered: RENDERED })
    assert.doesNotMatch(cli(WIKI, '--offline', '--root', root, '--rendered').stdout, /SOURCE|Infobox/)
    assert.doesNotMatch(cli(WIKI, '--offline', '--root', root, '--source').stdout, /RENDERED|Jumps inside/)
  })

  it('says so when a wiki page is cached with its source only', () => {
    assert.match(pageAsText({ url: WIKI, format: 'wikitext', raw: SOURCE }), /== RENDERED ==\n\(not in the cache: only the page source was read; run again online\)/)
  })

  it('prints a plain web page as its visible lines, and gives nothing for a PDF', () => {
    assert.equal(pageAsText({ url: 'https://p.example/a', format: 'html', raw: '<html><head><title>T</title></head><body><h1>Dox</h1><p>Fast &amp; cheap.</p></body></html>' }), 'Dox\nFast & cheap.\n')
    assert.equal(pageAsText({ url: 'https://p.example/m.pdf', format: 'html', raw: '%PDF-1.5 ...' }), null)
  })

  it('exits 3 for a page that is not cached when offline, and 2 on bad arguments', () => {
    const r = cli(WIKI, '--offline', '--root', tempRoot())
    assert.equal(r.status, 3)
    assert.match(r.stderr, /not read: offline and not cached/)
    assert.equal(cli().status, 2)
    assert.equal(cli('not-an-address').status, 2)
  })
})

describe('page reader: sites it never fetches', () => {
  it('prints a cached Liquipedia page but never asks the site for one', async () => {
    assert.ok(NO_FETCH.has('liquipedia.net'))
    const root = tempRoot()
    await assert.rejects(readPage('https://liquipedia.net/starcraft2/Marine', { root, log: () => {} }), /liquipedia\.net is not fetched: its terms do not allow it/)
    const cachedUrl = 'https://liquipedia.net/starcraft2/Raven'
    seed(root, cachedUrl, { format: 'wikitext', raw: 'A [[Raven]].' }) // source only: it is not fetched again either
    const { page, cached } = await readPage(cachedUrl, { root, log: () => {} })
    assert.equal(cached, true)
    assert.equal(page.raw, 'A [[Raven]].')
  })
})

describe('page reader: against a local wiki', () => {
  async function wiki() {
    const times = []
    const srv = http.createServer((req, res) => {
      const u = new URL(req.url, 'http://x')
      if (u.pathname !== '/api.php') { res.writeHead(404); res.end('no'); return }
      times.push(Date.now())
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ parse: { title: u.searchParams.get('page'), wikitext: { '*': SOURCE }, text: { '*': RENDERED } } }))
    })
    await new Promise(resolve => srv.listen(0, '127.0.0.1', resolve))
    after(() => { srv.closeAllConnections(); srv.close() })
    return { base: `http://127.0.0.1:${srv.address().port}`, times }
  }
  const quick = root => ({ root, delay: 0, retryWait: 1, log: () => {} })

  it('fetches a page once, keeps it in the cache and reads it from there the next time', async () => {
    const { base, times } = await wiki()
    const root = tempRoot()
    const url = `${base}/wiki/Test_Drone`
    const first = await readPage(url, quick(root))
    assert.equal(first.cached, false)
    assert.equal(first.page.rendered, RENDERED)
    const again = await readPage(url, quick(root))
    assert.equal(again.cached, true)
    assert.equal(times.length, 1)
  })

  it('fetches again a wiki page cached with its source only', async () => {
    const { base, times } = await wiki()
    const root = tempRoot()
    const url = `${base}/wiki/Test_Drone`
    seed(root, url, { format: 'wikitext', raw: SOURCE })
    const r = await readPage(url, quick(root))
    assert.equal(r.cached, false)
    assert.equal(r.page.rendered, RENDERED)
    assert.equal(times.length, 1)
  })

  it('keeps the pause between two requests to one site, also from two readers at once', async () => {
    const { base, times } = await wiki()
    const root = tempRoot()
    await Promise.all(['A', 'B', 'C'].map(t => readPage(`${base}/wiki/${t}`, { ...quick(root), delay: 300 })))
    assert.equal(times.length, 3)
    const gaps = times.sort((a, b) => a - b).slice(1).map((t, i) => t - times[i])
    assert.ok(gaps.every(g => g >= 250), `gaps between requests: ${gaps.join(', ')} ms`)
  })
})
