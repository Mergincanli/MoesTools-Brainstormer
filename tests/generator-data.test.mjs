// Tests for the check of the generator's data files (scripts/check-generator-data.mjs): the repository passes, and a
// copy with one thing broken fails with a line that says what.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, after } from 'node:test'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CHECK = path.join(REPO_ROOT, 'scripts/check-generator-data.mjs')
const run = root => spawnSync(process.execPath, root ? [CHECK, root] : [CHECK], { encoding: 'utf8' })

const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })
// A copy of what the check reads: the schemas, the data and the example card.
function copyWith(file, change) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-generator-'))
  tmpDirs.push(dir)
  for (const d of ['schemas', 'data', 'docs/examples']) fs.cpSync(path.join(REPO_ROOT, d), path.join(dir, d), { recursive: true })
  const f = path.join(dir, file)
  const data = JSON.parse(fs.readFileSync(f, 'utf8'))
  change(data)
  fs.writeFileSync(f, JSON.stringify(data, null, 2))
  return dir
}

describe('check of the generator data', () => {
  it('passes on the repository', () => {
    const r = run()
    assert.equal(r.status, 0, r.stdout.split('\n').filter(l => l.startsWith('ERROR')).join('\n') + r.stderr)
    assert.equal(r.stdout.trim().split('\n').at(-1), 'PASSED')
  })

  const broken = [
    ['a top-level property that the schema does not have', 'data/generator/rules.json', d => { d.extra = true }],
    ['a pattern id that does not exist', 'data/generator/rules.json', d => { d.role_fit.engineer.patterns.push('no-such-pattern') }],
    ['a variant id that does not exist', 'data/generator/rules.json', d => { d.hard_control.entries.find(e => e.pattern === 'burrow').variants = ['no-such-variant'] }],
    ['a name word that is a real unit\'s name', 'data/generator/names.json', d => { d.soviet.words.noun.push('Kirov') }],
    ['a card sentence that names a real game', 'data/generator/texts.json', d => { d.neutral.pitch = 'A unit in the style of Red Alert.' }],
    ['a missing escape line for a weapon family of the hard-control list', 'data/generator/texts.json', d => { delete d.escapes.cryo }],
  ]
  for (const [name, file, change] of broken) {
    it(`fails on ${name}`, () => {
      const r = run(copyWith(file, change))
      assert.equal(r.status, 1, `expected a failure; the output ends with: ${r.stdout.trim().split('\n').slice(-2).join(' | ')}`)
      assert.ok(r.stdout.split('\n').some(l => l.startsWith('ERROR')), 'expected an ERROR line')
    })
  }
})
