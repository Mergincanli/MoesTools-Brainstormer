// Tests for the word-list diff: field changes, added, removed and merged terms, tie-break rules, reading folders and
// git commits, and the command line.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import { REPO_ROOT, diffLists, fieldChange, readLists, renderMarkdown } from '../scripts/vocab-diff.mjs'

const DIFF = path.join(REPO_ROOT, 'scripts/vocab-diff.mjs')
const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })

const list = (id, version, terms, extra = {}) => ({ id, label: id.toUpperCase(), description: 'd', group: 'core', status: 'draft', version, terms, ...extra })
const term = (id, extra = {}) => ({ id, label: id, description: `about ${id}`, ...extra })

describe('fieldChange', () => {
  it('shows list items added and removed', () => {
    assert.equal(fieldChange('classes', ['a', 'b'], ['b', 'c']), '+c, -a')
    assert.equal(fieldChange('classes', ['a', 'b'], ['b', 'a']), 'reordered')
    assert.equal(fieldChange('classes', undefined, ['a']), '+a')
  })
  it('shows maps key by key', () => {
    assert.equal(fieldChange('class_rarity', { aircraft: 'rare' }, { aircraft: 'uncommon', drone: 'rare' }), 'aircraft: rare -> uncommon; drone: added: rare')
    assert.equal(fieldChange('allowed', { x: ['a'] }, { x: ['a', 'b'] }), 'x: +b')
  })
  it('shows short values as old -> new and long text as reworded', () => {
    assert.equal(fieldChange('rarity', 'common', 'rare'), 'common -> rare')
    assert.equal(fieldChange('min_tier', undefined, 't2'), 'added: t2')
    assert.equal(fieldChange('min_tier', 't2', undefined), 'removed (was: t2)')
    const long = 'x'.repeat(70)
    assert.equal(fieldChange('description', 'short', long), `reworded: ${long}`)
  })
})

describe('diffLists', () => {
  const oldLists = {
    a: list('a', '0.4.0', [term('one'), term('two'), term('three', { rarity: 'common' })]),
    b: list('b', '0.4.0', [term('x'), term('y')]),
    gone: list('gone', '0.4.0', [term('p'), term('q')]),
  }
  const newLists = {
    a: list('a', '1.0.0', [term('one'), term('both', { replaces: ['two'] }), term('three', { rarity: 'rare' })],
      { tie_breaks: [{ terms: ['one', 'both'], rule: 'pick one when unsure' }] }),
    b: list('b', '1.0.0', [term('x'), term('y')]),
    fresh: list('fresh', '1.0.0', [term('m'), term('n')]),
  }
  const d = diffLists(oldLists, newLists)

  it('finds lists added and removed', () => {
    assert.deepEqual(d.added, ['fresh'])
    assert.deepEqual(d.removed, ['gone'])
    assert.deepEqual(d.from, ['0.4.0'])
    assert.deepEqual(d.to, ['1.0.0'])
  })
  it('reports merged, changed and new terms and tie-breaks', () => {
    const a = d.changed.find(c => c.id === 'a')
    assert.deepEqual(a.termsAdded.map(t => [t.id, t.replaces]), [['both', ['two']]])
    assert.deepEqual(a.termsRemoved, [{ id: 'two', label: 'two', into: 'both' }])
    assert.deepEqual(a.termsChanged, [{ id: 'three', label: 'three', fields: [{ key: 'rarity', change: 'common -> rare' }] }])
    assert.equal(a.tieBreaksAdded.length, 1)
    assert.equal(a.orderChanged, false)
  })
  it('keeps lists whose only change is the version', () => {
    const b = d.changed.find(c => c.id === 'b')
    assert.ok(b)
    assert.equal(b.termsChanged.length, 0)
  })
  it('renders Markdown, with version-only lists on one line', () => {
    const md = renderMarkdown(d, { oldName: 'v0.4', newName: 'v1' })
    assert.match(md, /^# Word-list changes: 0\.4\.0 to 1\.0\.0/)
    assert.match(md, /1 list\(s\) added, 1 removed, 2 changed; 1 term\(s\) added, 1 removed, 1 changed, 1 tie-break rule\(s\) added, 0 removed\./)
    assert.match(md, /- \*\*Added `both`\*\* \(both\), replacing `two`: about both/)
    assert.match(md, /- \*\*Removed `two`\*\* \(two\), merged into `both`\./)
    assert.match(md, /- \*\*Tie-break added\*\* \(`one` \/ `both`\): pick one when unsure/)
    assert.match(md, /## Lists with a new version number only\n\n`b`\./)
    assert.match(md, /## Removed lists\n\n- `gone`/)
  })
  it('counts a reworded tie-break as one removed and one added, in the summary too', () => {
    const rule = (text) => ({ tie_breaks: [{ terms: ['x', 'y'], rule: text }] })
    const was = { b: list('b', '1.0.0', [term('x'), term('y')], rule('pick x when unsure')) }
    const now = { b: list('b', '1.0.0', [term('x'), term('y')], rule('pick x when the sources are unsure')) }
    const md = renderMarkdown(diffLists(was, now))
    assert.match(md, /1 tie-break rule\(s\) added, 1 removed\./)
    assert.match(md, /- \*\*Tie-break added\*\* \(`x` \/ `y`\): pick x when the sources are unsure/)
    assert.match(md, /- \*\*Tie-break removed\*\* \(`x` \/ `y`\): pick x when unsure/)
  })
})

describe('reading lists and the command line', () => {
  it('reads a folder and a git commit alike', () => {
    const fromFolder = readLists('data/vocab')
    assert.ok(Object.keys(fromFolder).length > 30)
    assert.deepEqual(Object.keys(readLists(path.join(REPO_ROOT, 'data/vocab'))).sort(), Object.keys(fromFolder).sort())
    // The git side is checked against git itself, not the working tree, so uncommitted edits don't matter. HEAD only:
    // CI checks out a single commit.
    const fromGit = readLists('HEAD')
    const git = args => execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' })
    const committed = git(['ls-tree', '--name-only', 'HEAD:data/vocab']).split('\n').filter(f => f.endsWith('.json')).map(f => f.slice(0, -5))
    assert.ok(Object.keys(fromGit).length > 30)
    assert.deepEqual(Object.keys(fromGit).sort(), committed.sort()) // every list file is named after its id
    assert.ok(fromGit.sizes.terms.length > 0)
    assert.deepEqual(fromGit.sizes, JSON.parse(git(['show', 'HEAD:data/vocab/sizes.json'])))
  })
  it('prints nothing changed for a folder against itself', () => {
    const r = spawnSync(process.execPath, [DIFF, 'data/vocab', 'data/vocab'], { encoding: 'utf8', cwd: REPO_ROOT })
    assert.equal(r.status, 0, r.stderr)
    assert.match(r.stdout, /0 list\(s\) added, 0 removed, 0 changed/)
  })
  it('compares two folders and prints JSON with --json', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-vocab-diff-'))
    tmpDirs.push(dir)
    fs.cpSync(path.join(REPO_ROOT, 'data/vocab'), dir, { recursive: true })
    const f = path.join(dir, 'sizes.json')
    const sizes = JSON.parse(fs.readFileSync(f, 'utf8'))
    sizes.terms[0].description = 'Changed.'
    fs.writeFileSync(f, JSON.stringify(sizes))
    const r = spawnSync(process.execPath, [DIFF, path.join(REPO_ROOT, 'data/vocab'), dir, '--json'], { encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr)
    const out = JSON.parse(r.stdout)
    assert.deepEqual(out.changed.map(c => c.id), ['sizes'])
    assert.equal(out.changed[0].termsChanged[0].fields[0].key, 'description')
  })
  it('exits 2 on a bad version or bad arguments', () => {
    for (const args of [[], ['no-such-commit-or-folder'], ['a', 'b', 'c'], ['--x']]) {
      const r = spawnSync(process.execPath, [DIFF, ...args], { encoding: 'utf8', cwd: REPO_ROOT })
      assert.equal(r.status, 2, args.join(' '))
      assert.match(r.stderr, /usage:/)
    }
  })
})
