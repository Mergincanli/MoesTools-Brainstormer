// Tests for the agreement measure of the calibration pilot: the pair scores, ranked and count fields, sets, the unit
// field extraction on the real sample units, the reference comparison, table files and the command line.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import {
  REPO_ROOT, UNIT_FIELDS, compareWithReference, jaccard, loadRanks, measure, readCoderFolders, readTable, renderMarkdown, unitCoding,
} from '../scripts/agreement.mjs'

const AGREEMENT = path.join(REPO_ROOT, 'scripts/agreement.mjs')
const RA3 = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'data/units/ra3.json'), 'utf8'))
const ranks = loadRanks(path.join(REPO_ROOT, 'data/vocab'))
const field = (result, p) => result.fields.find(f => f.path === p) ?? assert.fail(`no field '${p}'`)

const tmpDirs = []
const tmp = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-agreement-'))
  tmpDirs.push(d)
  return d
}
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })

describe('jaccard', () => {
  it('scores the overlap of two sets, and 1 for two empty ones', () => {
    assert.equal(jaccard(['a', 'b'], ['b', 'c']), 1 / 3)
    assert.equal(jaccard(['a'], ['a']), 1)
    assert.equal(jaccard([], []), 1)
    assert.equal(jaccard(undefined, null), 1)
    assert.equal(jaccard(['a'], []), 0)
  })
  it('ignores order and repeats', () => {
    assert.equal(jaccard(['b', 'a', 'a'], ['a', 'b']), 1)
  })
})

describe('measure', () => {
  const fields = [
    { path: 'speed', kind: 'one', list: 'speed-bands' },
    { path: 'traits', kind: 'set' },
    { path: 'n', kind: 'one', numeric: true },
    { path: 'refs', kind: 'set', gate: false },
  ]
  const codings = {
    a: { u1: { speed: 'slow', traits: ['x', 'y'], n: 1, refs: ['r'] }, u2: { speed: 'fast', traits: [], n: 0 } },
    b: { u1: { speed: 'slow', traits: ['x'], n: 2, refs: [] }, u2: { speed: 'very-fast', traits: [], n: 3 } },
    c: { u1: { speed: 'medium', traits: ['x', 'y'], n: 1, refs: [] }, u3: { speed: 'slow' } },
  }
  const r = measure(codings, { fields, ranks, threshold: 0.8 })

  it('counts every pair of coders on every item coded by two or more', () => {
    const f = field(r, 'speed')
    assert.equal(f.items, 2) // u3 has one coder only
    assert.equal(f.pairs, 4) // u1: 3 pairs, u2: 1 pair
    assert.equal(f.agreement, 0.25) // only a-b on u1 agree
    assert.equal(f.within_one, 1) // slow-medium and fast-very-fast are one step apart
    assert.equal(f.all_agree, 0)
    assert.equal(f.below, true)
  })
  it('scores sets by their overlap and two empty sets as agreeing', () => {
    const f = field(r, 'traits')
    // u1: a-b 0.5, a-c 1, b-c 0.5; u2: a-b 1 (both empty)
    assert.equal(f.agreement, 0.75)
    assert.equal(f.within_one, null)
    assert.equal(f.all_agree, 1)
  })
  it('treats counts as numbers one step apart', () => {
    const f = field(r, 'n')
    assert.equal(f.kind, 'count')
    assert.equal(f.agreement, 0.25)
    assert.equal(f.within_one, 0.75) // u1: 1-2, 1-1, 2-1 near; u2: 0-3 not
  })
  it('never flags an information-only field', () => {
    const f = field(r, 'refs')
    assert.equal(f.gated, false)
    assert.equal(f.below, false)
  })
  it('keeps the value each coder gave, per item', () => {
    const d = field(r, 'speed').details.find(x => x.item === 'u1')
    assert.deepEqual(d.values, { a: 'slow', b: 'slow', c: 'medium' })
    assert.equal(d.agreement, 0.333)
  })
  it('lets two missing values agree, but not a value and a missing one', () => {
    const one = measure({ a: { u: {} }, b: { u: {} }, c: { u: { speed: 'slow' } } }, { fields: fields.slice(0, 1), ranks })
    assert.equal(one.fields[0].agreement, 0.333)
    assert.equal(one.fields[0].within_one, 0.333)
  })
})

describe('unit fields', () => {
  const ifv = RA3.units.find(u => u.id === 'ra3.allied.multigunner-ifv')
  const c = unitCoding(ifv)
  it('reads the coded fields of a real unit', () => {
    assert.equal(c.class, ifv.class)
    assert.equal(c['tier.band'], ifv.tier.band)
    assert.equal(c['armament (number of weapons)'], ifv.armament.length)
    assert.ok(c['armament.family'].length > 1)
    assert.deepEqual(c['armament.family'], [...c['armament.family']].sort())
    assert.ok(c['patterns (abilities and weapons)'].includes('passenger-sets-weapon'))
    assert.ok(c['atypical rules'].length > 0)
  })
  it('gives every field a value or a defined empty', () => {
    for (const u of RA3.units) {
      const coding = unitCoding(u)
      assert.equal(Object.keys(coding).length, UNIT_FIELDS.length)
      for (const f of UNIT_FIELDS.filter(f => f.kind === 'set')) assert.ok(Array.isArray(coding[f.path] ?? []), f.path)
    }
  })
  it('has unique field paths, and ranked fields name a ranked word list', () => {
    assert.equal(new Set(UNIT_FIELDS.map(f => f.path)).size, UNIT_FIELDS.length)
    for (const f of UNIT_FIELDS.filter(f => f.list)) assert.ok(ranks[f.list], `${f.path}: '${f.list}' is not ranked`)
  })
})

describe('coder folders, the reference and the command line', () => {
  const root = tmp()
  for (const c of ['coder-a', 'coder-b', 'coder-c']) {
    fs.mkdirSync(path.join(root, c))
    const copy = structuredClone(RA3)
    if (c === 'coder-c') copy.units[0].class = copy.units[0].class === 'infantry' ? 'drone' : 'infantry'
    fs.writeFileSync(path.join(root, c, 'ra3.json'), JSON.stringify(copy))
  }

  it('matches units by id across coder folders', () => {
    const codings = readCoderFolders(root)
    assert.deepEqual(Object.keys(codings), ['coder-a', 'coder-b', 'coder-c'])
    const r = measure(codings, { fields: UNIT_FIELDS, ranks })
    assert.equal(field(r, 'class').agreement, Math.round((7 / 9) * 1000) / 1000) // one of three units: 1 of 3 pairs agree
    assert.equal(field(r, 'tier.band').agreement, 1)
    assert.equal(field(r, 'class').below, true)
  })
  it('compares every coder with a reference', () => {
    const codings = readCoderFolders(root)
    const ref = compareWithReference(codings, Object.fromEntries(RA3.units.map(u => [u.id, unitCoding(u)])), { fields: UNIT_FIELDS })
    const cls = ref.find(x => x.path === 'class')
    assert.equal(cls.comparisons, 9)
    assert.equal(cls.agreement, Math.round((8 / 9) * 1000) / 1000)
  })
  it('needs at least two coder folders', () => {
    const lone = tmp()
    fs.mkdirSync(path.join(lone, 'coder-a'))
    assert.throws(() => readCoderFolders(lone), /at least two/)
  })
  it('prints a Markdown report with the disagreements and the reference', () => {
    const r = spawnSync(process.execPath, [AGREEMENT, root, '--reference', path.join(REPO_ROOT, 'data/units')], { encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr)
    assert.match(r.stdout, /^# Agreement between coders/)
    assert.match(r.stdout, /\| class \| one \| 3 \| 78% \|/)
    assert.match(r.stdout, /### class \(78%, below the threshold\)/)
    assert.match(r.stdout, /## Compared with the reference/)
  })
  it('prints JSON with --json', () => {
    const r = spawnSync(process.execPath, [AGREEMENT, root, '--json'], { encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr)
    const out = JSON.parse(r.stdout)
    assert.deepEqual(out.coders, ['coder-a', 'coder-b', 'coder-c'])
    assert.equal(out.reference, null)
  })
  it('exits 2 on bad arguments', () => {
    for (const args of [[], [root, '--threshold', '2'], [root, '--nope'], [root, root], ['--table', 'x.json', '--reference', root]]) {
      const r = spawnSync(process.execPath, [AGREEMENT, ...args], { encoding: 'utf8' })
      assert.equal(r.status, 2, args.join(' '))
      assert.match(r.stderr, /usage:/)
    }
  })
})

describe('table files', () => {
  it('reads plain codings and infers each field kind', () => {
    const file = path.join(tmp(), 'speed.json')
    fs.writeFileSync(file, JSON.stringify({
      fields: { band_a: { list: 'speed-bands' } },
      coders: {
        A: { tank: { band_a: 'fast', raw: 7.5, tags: ['x'] }, quad: { band_a: 'very-fast', raw: null, tags: [] } },
        B: { tank: { band_a: 'medium', raw: 7.5, tags: ['x'] }, quad: { band_a: 'very-fast', raw: 20, tags: [] } },
      },
    }))
    const { codings, fields } = readTable(file)
    assert.deepEqual(fields.map(f => [f.path, f.kind, f.numeric, f.list]), [
      ['band_a', 'one', false, 'speed-bands'],
      ['raw', 'one', true, undefined],
      ['tags', 'set', false, undefined],
    ])
    const r = measure(codings, { fields, ranks })
    assert.equal(field(r, 'band_a').agreement, 0.5)
    assert.equal(field(r, 'band_a').within_one, 1)
    assert.equal(field(r, 'tags').agreement, 1)
    const md = renderMarkdown(r, { title: 'Speed' })
    assert.match(md, /^# Speed/)
    assert.match(md, /### band_a \(50%, below the threshold\)/)
  })
})
