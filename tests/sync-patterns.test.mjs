// Tests for sync-patterns: it fills each written pattern's source_units from the units that link it (abilities,
// weapons and modes), keeps the rest of the file as it was, writes nothing with --check, and leaves the validator with
// no out-of-date warnings.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import { REPO_ROOT, formatSync, linkedPatterns, planSync, syncPatterns } from '../scripts/sync-patterns.mjs'
import { formatText } from '../scripts/format-json.mjs'
import { validate } from '../scripts/validate.mjs'

const SYNC = path.join(REPO_ROOT, 'scripts/sync-patterns.mjs')
const UNITS = 'data/units/ra3.json'
const PATTERN = id => `data/patterns/${id}.json`
const OUT_OF_DATE = 'source_units out of date'

const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })
// A copy of the repo's data, synced once, so each case starts from up-to-date lists whatever the repo holds.
function syncedCopy() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-sync-'))
  tmpDirs.push(dir)
  for (const d of ['schemas', 'data', 'docs/examples']) fs.cpSync(path.join(REPO_ROOT, d), path.join(dir, d), { recursive: true })
  syncPatterns(dir)
  return dir
}
const text = (dir, f) => fs.readFileSync(path.join(dir, f), 'utf8')
const load = (dir, f) => JSON.parse(text(dir, f))
const edit = (dir, f, fn) => { const d = load(dir, f); fn(d); fs.writeFileSync(path.join(dir, f), JSON.stringify(d, null, 2)) }
const unit = (d, slug) => d.units.find(u => u.id.endsWith('.' + slug)) ?? assert.fail(`no unit '${slug}' in the data`)
const run = (...args) => spawnSync(process.execPath, [SYNC, ...args], { encoding: 'utf8' })

describe('sync-patterns', () => {
  it('reads links from abilities, weapons and modes', () => {
    const u = {
      abilities: [{ patterns: ['a', 'b'] }, { patterns: [] }],
      armament: [{ patterns: ['b', 'c'] }, {}],
      modes: [{ via: 'd' }],
    }
    assert.deepEqual([...linkedPatterns(u)].sort(), ['a', 'b', 'c', 'd'])
    assert.deepEqual([...linkedPatterns({})], [])
  })

  it('finds nothing out of date after a sync', () => {
    const dir = syncedCopy()
    const plan = planSync(dir)
    assert.deepEqual(plan.problems, [])
    assert.ok(plan.patterns.length > 0)
    assert.deepEqual(plan.patterns.filter(p => p.stale), [])
    const r = run('--check', dir)
    assert.equal(r.status, 0, r.stdout + r.stderr)
    assert.match(r.stdout, /^all \d+ pattern file\(s\) up to date$/m)
  })

  it('adds a unit that links a pattern, keeping the rest of the file and the house style', () => {
    const dir = syncedCopy()
    const before = load(dir, PATTERN('infest-vehicle'))
    edit(dir, UNITS, d => { unit(d, 'hammer-tank').abilities[0].patterns.push('infest-vehicle') })
    assert.ok(validate(dir).warnings.some(w => w.includes(OUT_OF_DATE)), 'the validator should warn first')

    const check = run('--check', dir)
    assert.equal(check.status, 1)
    assert.match(check.stdout, /^out of date: data\/patterns\/infest-vehicle\.json /m)
    assert.deepEqual(load(dir, PATTERN('infest-vehicle')), before, '--check must write nothing')

    const r = run(dir)
    assert.equal(r.status, 0, r.stdout + r.stderr)
    assert.match(r.stdout, /^updated: data\/patterns\/infest-vehicle\.json /m)
    const after = load(dir, PATTERN('infest-vehicle'))
    assert.deepEqual(after.source_units, [...new Set([...before.source_units, 'ra3.soviet.hammer-tank'])].sort())
    assert.deepEqual(Object.keys(after), Object.keys(before))
    assert.deepEqual({ ...after, source_units: before.source_units }, before)
    assert.equal(formatText(text(dir, PATTERN('infest-vehicle'))), text(dir, PATTERN('infest-vehicle')))

    assert.equal(run('--check', dir).status, 0)
    const { errors, warnings } = validate(dir)
    assert.ok(!warnings.some(w => w.includes(OUT_OF_DATE)), warnings.join('\n'))
    assert.ok(!errors.some(e => e.includes('source_units')), errors.join('\n'))
  })

  it('counts a mode that works through a pattern', () => {
    const dir = syncedCopy()
    edit(dir, UNITS, d => {
      const u = unit(d, 'hammer-tank')
      u.modes = [...(u.modes || []), { id: 'test-mode', name: 'Test mode', via: 'passenger-sets-weapon', summary: 'Test.' }]
    })
    syncPatterns(dir)
    assert.ok(load(dir, PATTERN('passenger-sets-weapon')).source_units.includes('ra3.soviet.hammer-tank'))
  })

  it('drops a unit that no longer links the pattern', () => {
    const dir = syncedCopy()
    edit(dir, PATTERN('infest-vehicle'), p => { p.source_units.push('ra3.soviet.hammer-tank') })
    assert.equal(planSync(dir).patterns.find(p => p.id === 'infest-vehicle').stale, true)
    const { written } = syncPatterns(dir)
    assert.deepEqual(written, [PATTERN('infest-vehicle')])
    assert.ok(!load(dir, PATTERN('infest-vehicle')).source_units.includes('ra3.soviet.hammer-tank'))
  })

  it('leaves a pattern that no unit links as it is', () => {
    const dir = syncedCopy()
    const linked = id => load(dir, UNITS).units.filter(u => linkedPatterns(u).has(id))
    edit(dir, UNITS, d => {
      for (const u of d.units) {
        for (const x of [...(u.abilities || []), ...(u.armament || [])]) if (x.patterns) x.patterns = x.patterns.filter(p => p !== 'infest-vehicle')
      }
    })
    assert.deepEqual(linked('infest-vehicle'), [])
    const before = text(dir, PATTERN('infest-vehicle'))
    const result = syncPatterns(dir)
    assert.equal(text(dir, PATTERN('infest-vehicle')), before)
    assert.equal(result.patterns.find(p => p.id === 'infest-vehicle').unlinked, true)
    assert.match(formatSync(result).text, /^no unit links it, left as it is: data\/patterns\/infest-vehicle\.json$/m)
    assert.equal(run('--check', dir).status, 0)
  })

  it('writes nothing when a unit file is not valid JSON', () => {
    const dir = syncedCopy()
    edit(dir, PATTERN('infest-vehicle'), p => { p.source_units.push('ra3.soviet.hammer-tank') })
    const before = text(dir, PATTERN('infest-vehicle'))
    fs.writeFileSync(path.join(dir, UNITS), '{ "units": [')
    const r = run(dir)
    assert.equal(r.status, 1)
    assert.match(r.stdout, /^ERROR {4}data\/units\/ra3\.json: not valid JSON/m)
    assert.equal(text(dir, PATTERN('infest-vehicle')), before)
  })

  it('exits 2 on bad arguments', () => {
    for (const args of [['--nope'], ['a', 'b']]) {
      const r = run(...args)
      assert.equal(r.status, 2, args.join(' '))
      assert.match(r.stderr, /usage:/)
    }
  })
})
