// Tests for the page reader (scripts/page-text.mjs): what it prints for a wiki page and for a plain page, its use
// of the page cache, the sites it never fetches, and the pause it keeps between requests to one site, also between
// separate processes. No real network: a seeded cache and a local server.
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import { REPO_ROOT, RESTRICTED, cachePath, stampFile } from '../scripts/copy-check.mjs'
import { NO_FETCH, pageAsText, readPage } from '../scripts/page-text.mjs'

const SCRIPT = path.join(REPO_ROOT, 'scripts/page-text.mjs')
const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })
const tempRoot = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-page-')); tmpDirs.push(d); return d }
const cli = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' })

// No test may reach a real site: any request that is not to this machine fails here, before it leaves.
const realFetch = globalThis.fetch
globalThis.fetch = (input, ...rest) => {
  const host = new URL(typeof input === 'string' ? input : input.url).hostname
  if (host !== '127.0.0.1') throw new Error(`a test tried to reach ${host}`)
  return realFetch(input, ...rest)
}
after(() => { globalThis.fetch = realFetch })

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

  it('marks text inside an HTML comment of the source as hidden from readers', () => {
    const text = pageAsText({ url: WIKI, format: 'wikitext', raw: 'Shown text.\n<!-- A unit list the editors\nswitched off. -->\nMore shown text.', rendered: '<p>Shown text.</p>' })
    assert.match(text, /Shown text\.\n\[HIDDEN COMMENT, not shown to readers: A unit list the editors\nswitched off\. \]\nMore shown text\./)
    assert.doesNotMatch(text, /<!--/)
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
    assert.equal(cli('https://exa mple.com/x', '--offline').status, 2, 'a malformed address is a bad argument')
  })
})

describe('page reader: sites it never fetches', () => {
  it('prints a cached Liquipedia page but never asks the site, or a subdomain of it, for one', async () => {
    assert.ok(NO_FETCH.has('liquipedia.net'))
    assert.equal(process.env.UNIT_FORGE_ALLOW_HOSTS, undefined, 'this test needs UNIT_FORGE_ALLOW_HOSTS unset')
    const root = tempRoot()
    for (const url of ['https://liquipedia.net/starcraft2/Marine', 'https://www.liquipedia.net/starcraft2/Marine']) {
      await assert.rejects(readPage(url, { root, log: () => {} }), e => e.message === RESTRICTED)
    }
    const cachedUrl = 'https://liquipedia.net/starcraft2/Raven'
    seed(root, cachedUrl, { format: 'wikitext', raw: 'A [[Raven]].' }) // source only: it is not fetched again either
    const { page, cached, error } = await readPage(cachedUrl, { root, log: () => {} })
    assert.equal(cached, true)
    assert.equal(page.raw, 'A [[Raven]].')
    assert.equal(error, RESTRICTED)
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

  it('says why when a wiki page cached with its source only cannot be read again, and exits 3', async () => {
    const srv = http.createServer((req, res) => { res.writeHead(500); res.end('down') })
    await new Promise(resolve => srv.listen(0, '127.0.0.1', resolve))
    after(() => { srv.closeAllConnections(); srv.close() })
    const url = `http://127.0.0.1:${srv.address().port}/wiki/Test_Drone`
    const root = tempRoot()
    seed(root, url, { format: 'wikitext', raw: SOURCE })
    const r = await readPage(url, quick(root))
    assert.equal(r.cached, true)
    assert.match(r.error, /^HTTP 500/)
    assert.match(pageAsText({ url, ...r.page }, undefined, r.error), /\(the rendered page could not be read: HTTP 500/)
    const run = await new Promise(resolve => {
      const c = spawn(process.execPath, [SCRIPT, url, '--root', root, '--delay', '0'], { env: { ...process.env, HTTPS_PROXY: '', https_proxy: '' } })
      let out = '', err = ''
      c.stdout.on('data', d => { out += d }); c.stderr.on('data', d => { err += d })
      c.on('close', status => resolve({ status, out, err }))
    })
    assert.equal(run.status, 3, run.err)
    assert.match(run.out, /== SOURCE \(wikitext\) ==/)
    assert.match(run.err, /the rendered page could not be read: HTTP 500/)
  })

  it('keeps the pause between requests to one site from several readers running at once, each its own process', async () => {
    const { base, times } = await wiki()
    const root = tempRoot()
    // The site was answered just now, so all three readers must wait, and they wake at the same moment: without a
    // lock around the claim, all three would go together.
    const stamp = stampFile(new URL(base).host)
    fs.mkdirSync(path.dirname(stamp), { recursive: true })
    after(() => fs.rmSync(stamp, { force: true }))
    const start = Date.now()
    fs.writeFileSync(stamp, JSON.stringify({ last: start, busy: 0 }))
    const read = t => new Promise(resolve => {
      const c = spawn(process.execPath, [SCRIPT, `${base}/wiki/${t}`, '--root', root, '--delay', '1000'], { stdio: 'ignore', env: { ...process.env, HTTPS_PROXY: '', https_proxy: '' } })
      c.on('close', resolve)
    })
    const codes = await Promise.all(['A', 'B', 'C'].map(read))
    assert.deepEqual(codes, [0, 0, 0])
    assert.equal(times.length, 3)
    const sorted = [...times].sort((a, b) => a - b)
    assert.ok(sorted[0] - start >= 990, `the first request came ${sorted[0] - start} ms after the site's last answer`)
    const gaps = sorted.slice(1).map((t, i) => t - sorted[i])
    assert.ok(gaps.every(g => g >= 990), `ms between the requests the site saw: ${gaps.join(', ')}`)
  })
})
