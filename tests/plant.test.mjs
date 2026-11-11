// Tests for the plant test (scripts/plant.mjs): how it takes a reader's lines from a page, how it picks the
// passages to plant, and the whole test on a seeded cache and against a local wiki (no real network, no browser).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import { cachePath } from '../scripts/copy-check.mjs'
import {
  MIN_LINE_WORDS, NO_BROWSER, PASSAGES, PASSAGE_WORDS, VIEW_BROWSER, VIEW_WIKI, exitCode, formatPlantReport, pickPassages, plantTest, visibleLines,
} from '../scripts/plant.mjs'

const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })
const tempRoot = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-plant-test-')); tmpDirs.push(d); return d }

// Five paragraphs a reader sees; the ability box is drawn by a template, so the page source does not hold it.
const PARAS = [
  'The grey scout crosses the frozen river at night and waits beside the old bridge until the convoy has passed.',
  'Its heavy cannon turns slowly, so a quick walker can circle behind the hull before the gunner finds a target.',
  'Engineers mend damaged armour in the field, but they must stand still and cannot defend themselves while working there.',
  'A carrier that loses every fighter keeps building new ones for as long as its hangar still has power.',
]
const BOX = 'Leap lets the drone jump inside an enemy vehicle and eat it slowly from within over several long seconds.'
const SOURCE = PARAS.join('\n\n') + '\n\n{{DroneLeapAbility}}'
const RENDERED = '<div class="mw-parser-output">' + PARAS.map(p => `<p>${p}</p>`).join('') +
  `<table><tr><th>Leap</th></tr><tr><td>${BOX}<sup class="reference">[1]</sup></td></tr></table><script>var x = "never seen by a reader"</script></div>`
const WIKI = 'https://w.example/wiki/Test_Drone'

function seed(root, url, page) {
  const file = cachePath(path.join(root, '.cache', 'sources'), url)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ url, ...page }))
}

describe('plant test: the reader\'s lines', () => {
  it('gives one line per block of text and drops scripts, styles and footnote marks', () => {
    const lines = visibleLines('<div><h2>Leap</h2><p>One <b>bold</b> word &amp; more.<sup id="r1" class="reference">[1]</sup></p><ul><li>First</li><li>Second</li></ul>' +
      '<style>p { color: red }</style><script>alert("x")</script><table><tr><td>Cell A</td><td>Cell B</td></tr></table></div>')
    assert.deepEqual(lines, ['Leap', 'One bold word & more.', 'First', 'Second', 'Cell A', 'Cell B'])
  })

  it('keeps the words of one block together across inline tags', () => {
    const lines = visibleLines('<p>The <a href="/wiki/Drone">drone</a> leaps <i>far</i>.</p><p>Next block.</p>')
    assert.equal(lines.length, 2)
    assert.deepEqual(lines[0].split(/[^a-z]+/i).filter(Boolean), ['The', 'drone', 'leaps', 'far'])
  })
})

describe('plant test: the passages', () => {
  const lines = Array.from({ length: 10 }, (_, i) => `line${i} ` + Array.from({ length: 15 }, (_, j) => `w${i}x${j}`).join(' '))

  it('picks five passages of ten words, spread over the long lines, each from the middle of its line', () => {
    const picks = pickPassages(lines)
    assert.equal(PASSAGES, 5)
    assert.equal(picks.length, 5)
    for (const p of picks) assert.equal(p.split(' ').length, PASSAGE_WORDS)
    assert.deepEqual(picks.map(p => p.split(' ')[0]), ['w1x2', 'w3x2', 'w5x2', 'w7x2', 'w9x2'])
  })

  it('gives the same passages for the same lines', () => {
    assert.deepEqual(pickPassages(lines), pickPassages(lines))
  })

  it('skips lines that are too short and never plants a passage twice', () => {
    assert.equal(MIN_LINE_WORDS, 14)
    assert.deepEqual(pickPassages(['only a few words here', 'thirteen words is one too few for a line to be planted from']), [])
    const one = ['a b c d e f g h i j k l m n o p']
    assert.deepEqual(pickPassages(one), ['d e f g h i j k l m'])
  })
})

describe('plant test: the whole test, offline on a seeded cache', () => {
  it('passes on a wiki page cached with its rendered page: every planted passage is flagged', async () => {
    const root = tempRoot()
    seed(root, WIKI, { format: 'wikitext', raw: SOURCE, rendered: RENDERED })
    const r = await plantTest(WIKI, { root, offline: true })
    assert.equal(r.read, true)
    assert.equal(r.view, VIEW_WIKI)
    assert.equal(r.planted.length, 5)
    assert.deepEqual(r.missed, [])
    assert.equal(r.flagged.length, 5)
    assert.equal(r.source_only, false)
    assert.ok(r.planted.some(p => p.includes('enemy vehicle')), 'one passage comes from the ability box')
    assert.equal(exitCode([r]), 0)
    assert.match(formatPlantReport([r]), /planted 5, flagged 5: ok/)
    assert.match(formatPlantReport([r]), /^1 of 1 page\(s\) passed$/m)
  })

  it('fails when the copy-check read the page source only and a reader sees text a template drew in', async () => {
    const root = tempRoot()
    seed(root, WIKI, { format: 'wikitext', raw: SOURCE })
    const r = await plantTest(WIKI, { root, offline: true, lines: [...PARAS, BOX] })
    assert.equal(r.view, VIEW_BROWSER)
    assert.equal(r.source_only, true)
    assert.equal(r.planted.length, 5)
    assert.equal(r.flagged.length, 4)
    assert.equal(r.missed.length, 1)
    assert.match(r.missed[0], /enemy vehicle/)
    assert.equal(exitCode([r]), 1)
    assert.match(formatPlantReport([r]), /planted 5, flagged 4: MISSED/)
    assert.match(formatPlantReport([r]), /^0 of 1 page\(s\) passed$/m)
  })

  it('reports a page the copy-check could not read, and a page with no reader\'s view', async () => {
    const root = tempRoot()
    const unread = await plantTest(WIKI, { root, offline: true })
    assert.equal(unread.read, false)
    assert.match(unread.reason, /could not read the page: offline and not cached/)
    assert.equal(exitCode([unread]), 3)

    const root2 = tempRoot()
    const plain = 'https://p.example/page'
    seed(root2, plain, { format: 'html', raw: `<p>${PARAS[0]}</p>` })
    const noView = await plantTest(plain, { root: root2, offline: true })
    assert.equal(noView.read, true)
    assert.equal(noView.view, null)
    assert.match(noView.reason, /needs a browser/)
    assert.equal(exitCode([noView]), 3)
    assert.match(formatPlantReport([noView]), /NOT TESTED: no reader's view/)
  })

  it('reports a view with no line long enough to plant from', async () => {
    const root = tempRoot()
    seed(root, WIKI, { format: 'wikitext', raw: 'Short.', rendered: '<p>Short page.</p>' })
    const r = await plantTest(WIKI, { root, offline: true })
    assert.equal(r.planted.length, 0)
    assert.match(r.reason, /no line of 14 words or more/)
    assert.equal(exitCode([r]), 3)
  })

  it('counts a passage as flagged when the copy-check reports a run of six words or more inside it', async () => {
    const root = tempRoot()
    const plain = 'https://p.example/page'
    seed(root, plain, { format: 'html', raw: '<p>river at night and waits beside the</p>' })
    const r = await plantTest(plain, { root, offline: true, lines: [PARAS[0]] })
    assert.equal(r.planted.length, 1)
    assert.equal(r.flagged.length, 1)
    assert.equal(r.partly.length, 1)
    assert.equal(exitCode([r]), 0)
  })

  it('does not open a browser on a site whose terms do not allow it', () => {
    assert.ok(NO_BROWSER.has('liquipedia.net'))
  })
})

describe('plant test: against a local wiki', () => {
  it('fetches the page through the copy-check, plants from the wiki\'s rendered page and flags every passage', async () => {
    const srv = http.createServer((req, res) => {
      const u = new URL(req.url, 'http://x')
      if (u.pathname !== '/api.php') { res.writeHead(404); res.end('no'); return }
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ parse: { title: u.searchParams.get('page'), wikitext: { '*': SOURCE }, text: { '*': RENDERED } } }))
    })
    await new Promise(resolve => srv.listen(0, '127.0.0.1', resolve))
    after(() => { srv.closeAllConnections(); srv.close() })
    const url = `http://127.0.0.1:${srv.address().port}/wiki/Test_Drone`
    const r = await plantTest(url, { root: tempRoot(), delay: 0, retryWait: 1 })
    assert.equal(r.read, true)
    assert.equal(r.view, VIEW_WIKI)
    assert.equal(r.planted.length, 5)
    assert.equal(r.flagged.length, 5)
    assert.equal(exitCode([r]), 0)
  })
})
