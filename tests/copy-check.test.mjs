// Tests for the copy-check as a whole: the command line on a throwaway repo with a seeded page cache (no
// network), its exit codes, and how it gives up on a network that is down (against a local test server).
// The word-matching helpers are tested in validate.test.mjs.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import { REPO_ROOT, MAX_NETWORK_FAILURES, cachePath, copyCheck, exitCode, formatCopyReport } from '../scripts/copy-check.mjs'

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
