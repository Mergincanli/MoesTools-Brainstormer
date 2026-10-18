// Tests for the docs builder: the generated pages in docs/ match the data, the builder gives the same output
// every time, and --check reports stale pages without writing anything.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import { REPO_ROOT, OUTPUTS, buildDocs } from '../scripts/build-docs.mjs'

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

  it('rejects unknown arguments', () => {
    const res = run('--nope')
    assert.equal(res.status, 2)
    assert.match(res.stderr, /usage:/)
  })
})
