// Tests for the docs builder: the generated pages in docs/ match the data, a change to the data shows up in the
// pages (in a throwaway copy), samples.md keeps to its fixed list, the builder gives the same output every
// time, and --check reports stale pages without writing anything.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import { REPO_ROOT, OUTPUTS, SAMPLE_PATTERNS, SAMPLE_UNITS, buildDocs } from '../scripts/build-docs.mjs'

const BUILD = path.join(REPO_ROOT, 'scripts/build-docs.mjs')
const run = (...args) => spawnSync(process.execPath, [BUILD, ...args], { cwd: REPO_ROOT, encoding: 'utf8' })

const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })

// A throwaway copy of the inputs and the current docs.
function copyRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-docs-'))
  tmpDirs.push(dir)
  for (const d of ['schemas', 'data', 'docs']) fs.cpSync(path.join(REPO_ROOT, d), path.join(dir, d), { recursive: true })
  return dir
}

const readDocs = root => Object.fromEntries(OUTPUTS.map(rel => [rel, fs.readFileSync(path.join(root, rel), 'utf8')]))

describe('docs builder', () => {
  it('generated docs are in sync with the data', () => {
    const res = run('--check')
    assert.equal(res.status, 0, `${res.stdout}${res.stderr}\nrun npm run docs and commit the result`)
  })

  it('is deterministic: two runs give the same output', () => {
    const first = buildDocs()
    const second = buildDocs()
    assert.deepEqual(Object.keys(first), OUTPUTS)
    assert.deepEqual(second, first)

    // The same through the command line, writing into a copy of the repo.
    const dir = copyRepo()
    const runs = []
    for (let i = 0; i < 2; i++) {
      const res = run('--root', dir)
      assert.equal(res.status, 0, res.stderr)
      runs.push(readDocs(dir))
    }
    assert.deepEqual(runs[1], runs[0])
    assert.deepEqual(runs[0], first, 'the command line writes what buildDocs() returns')
  })

  it('--check names stale or missing pages, exits 1 and writes nothing', () => {
    const dir = copyRepo()
    assert.equal(run('--root', dir).status, 0)
    assert.equal(run('--root', dir, '--check').status, 0)

    const fields = path.join(dir, 'docs/fields.md')
    fs.appendFileSync(fields, 'hand edit\n')
    fs.rmSync(path.join(dir, 'docs/samples.md'))
    const res = run('--root', dir, '--check')
    assert.equal(res.status, 1)
    assert.match(res.stdout, /out of date: docs\/fields\.md/)
    assert.match(res.stdout, /out of date: docs\/samples\.md/)
    assert.doesNotMatch(res.stdout, /out of date: docs\/vocabularies\.md/)
    assert.ok(fs.readFileSync(fields, 'utf8').endsWith('hand edit\n'), '--check must not rewrite files')
    assert.ok(!fs.existsSync(path.join(dir, 'docs/samples.md')), '--check must not create files')
  })

  it('renders what the data says: a changed term label shows up in vocabularies.md', () => {
    const dir = copyRepo()
    const file = path.join(dir, 'data/vocab/sizes.json')
    const v = JSON.parse(fs.readFileSync(file, 'utf8'))
    const t = v.terms[0]
    assert.ok(!readDocs(REPO_ROOT)['docs/vocabularies.md'].includes('Testing Label Zq'))
    t.label = 'Testing Label Zq'
    fs.writeFileSync(file, JSON.stringify(v, null, 2))
    assert.equal(run('--root', dir).status, 0)
    assert.ok(readDocs(dir)['docs/vocabularies.md'].includes(`| \`${t.id}\` | Testing Label Zq |`))
  })

  it('heads every page with the lists\' version, and approved only once every list is approved', () => {
    const dir = copyRepo()
    const vocab = path.join(dir, 'data/vocab')
    const setStatus = (status, only) => {
      for (const f of fs.readdirSync(vocab).filter(f => f.endsWith('.json') && (!only || f === only))) {
        const v = JSON.parse(fs.readFileSync(path.join(vocab, f), 'utf8'))
        v.status = status
        fs.writeFileSync(path.join(vocab, f), JSON.stringify(v, null, 2))
      }
    }
    const headings = () => Object.values(readDocs(dir)).map(page => page.split('\n').find(l => l.startsWith('# ')))
    setStatus('approved')
    assert.equal(run('--root', dir).status, 0)
    for (const h of headings()) assert.match(h, /\(v\d+\.\d+\.\d+, approved\)$/)
    setStatus('draft', 'sizes.json')
    assert.equal(run('--root', dir).status, 0)
    for (const h of headings()) assert.match(h, /\(v\d+\.\d+\.\d+, draft\)$/)
  })

  it('renders tie-break rules on every list, faction flavours included', () => {
    const dir = copyRepo()
    const file = path.join(dir, 'data/vocab/faction-flavours.json')
    const v = JSON.parse(fs.readFileSync(file, 'utf8'))
    const [a, b] = v.terms
    v.tie_breaks = [{ terms: [a.id, b.id], rule: 'A test rule Zq for two flavours.' }]
    fs.writeFileSync(file, JSON.stringify(v, null, 2))
    assert.equal(run('--root', dir).status, 0)
    const page = readDocs(dir)['docs/vocabularies.md']
    assert.ok(page.includes(`- *${a.label}* or *${b.label}*: A test rule Zq for two flavours.`))
    const section = page.slice(page.indexOf('<a id="faction-flavours">'), page.indexOf('<a id="roles">'))
    assert.ok(section.includes('A test rule Zq'), 'the rule sits under the faction flavours list')
  })

  it("labels every term's coding rule the same way, tiers included", () => {
    const page = readDocs(REPO_ROOT)['docs/vocabularies.md']
    assert.doesNotMatch(page, /source rule:/)
    const t1 = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'data/vocab/tiers.json'), 'utf8')).terms[0]
    assert.ok(page.includes(`*Coding rule:* ${t1.source_rule}`))
  })

  it("says 'classes: all' only while a term has every generator class in the word list", () => {
    const dir = copyRepo()
    assert.equal(run('--root', dir).status, 0)
    assert.match(readDocs(dir)['docs/vocabularies.md'], /classes: all/)
    const file = path.join(dir, 'data/vocab/classes.json')
    const v = JSON.parse(fs.readFileSync(file, 'utf8'))
    v.terms.push({ id: 'testclass', label: 'Test class', description: 'A class added by a test.', rarity: 'rare' })
    fs.writeFileSync(file, JSON.stringify(v, null, 2))
    assert.equal(run('--root', dir).status, 0)
    assert.doesNotMatch(readDocs(dir)['docs/vocabularies.md'], /classes: all/)
  })

  it("names a research-only class that a term allows after 'classes: all'", () => {
    const dir = copyRepo()
    const file = path.join(dir, 'data/vocab/sensor-traits.json')
    const v = JSON.parse(fs.readFileSync(file, 'utf8'))
    const radar = v.terms.find(t => t.id === 'radar')
    radar.classes = [...radar.classes.filter(c => c !== 'naval'), 'naval']
    fs.writeFileSync(file, JSON.stringify(v, null, 2))
    assert.equal(run('--root', dir).status, 0)
    const row = readDocs(dir)['docs/vocabularies.md'].split('\n').find(l => l.startsWith('| `radar` |'))
    assert.match(row, /classes: all, plus Naval \(research only\)/)
  })

  it("takes the example card's key allowance and balance flags from the data", () => {
    const dir = copyRepo()
    const cardFile = path.join(dir, 'docs/examples/concept-card.example.json')
    const card = JSON.parse(fs.readFileSync(cardFile, 'utf8'))
    card.balance.flags = ['off-flavour']
    fs.writeFileSync(cardFile, JSON.stringify(card, null, 2))
    const tiersFile = path.join(dir, 'data/vocab/tiers.json')
    const tiers = JSON.parse(fs.readFileSync(tiersFile, 'utf8'))
    const tier = tiers.terms.find(t => t.id === card.parts.tier)
    tier.max_keys = 7
    fs.writeFileSync(tiersFile, JSON.stringify(tiers, null, 2))
    assert.equal(run('--root', dir).status, 0)
    const line = readDocs(dir)['docs/samples.md'].split('\n').find(l => l.startsWith('| Balance hints |'))
    assert.match(line, new RegExp(`\\(${tier.label} allows 7\\), flags: Off-flavour \\|$`))
  })

  it('samples.md shows only the listed samples, however many records the data holds', () => {
    const dir = copyRepo()
    assert.equal(run('--root', dir).status, 0)
    const before = readDocs(dir)['docs/samples.md']
    fs.writeFileSync(path.join(dir, 'data/units/zz-extra.json'), JSON.stringify({ units: [{ id: 'zz.x.extra-unit', name: 'Extra Unit Zq' }] }))
    fs.writeFileSync(path.join(dir, 'data/patterns/zz-extra.json'), JSON.stringify({ id: 'zz-extra', name: 'Extra Pattern Zq' }))
    assert.equal(run('--root', dir).status, 0)
    assert.equal(readDocs(dir)['docs/samples.md'], before)
    assert.equal(SAMPLE_UNITS.length, 3)
    assert.equal(SAMPLE_PATTERNS.length, 3)

    fs.rmSync(path.join(dir, `data/patterns/${SAMPLE_PATTERNS[0]}.json`))
    const res = run('--root', dir)
    assert.notEqual(res.status, 0)
    assert.match(res.stderr, new RegExp(`sample pattern '${SAMPLE_PATTERNS[0]}' is not in the data`))
  })

  it('rejects unknown arguments', () => {
    const res = run('--nope')
    assert.equal(res.status, 2)
    assert.match(res.stderr, /usage:/)
  })
})
