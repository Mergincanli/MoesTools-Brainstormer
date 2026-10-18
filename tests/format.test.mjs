// Tests for the JSON formatter: every data file is formatted, and the layout and number rules match the
// original Python formatter (2-space indent, short arrays of plain values on one line, width 110).
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import { REPO_ROOT, WIDTH, formatText, listJsonFiles } from '../scripts/format-json.mjs'

const FORMAT = path.join(REPO_ROOT, 'scripts/format-json.mjs')
const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })

describe('formatter', () => {
  it('every JSON file is formatted', () => {
    const files = listJsonFiles()
    assert.ok(files.length > 0, 'no JSON files found')
    const bad = files.filter(f => formatText(fs.readFileSync(f, 'utf8')) !== fs.readFileSync(f, 'utf8'))
    assert.deepEqual(bad.map(f => path.relative(REPO_ROOT, f)), [], 'run npm run format')
  })

  it('indents by two spaces and keeps short arrays of plain values on one line', () => {
    assert.equal(formatText('{"a":{"b":[1,2,"x"],"c":{}},"d":[]}'),
      '{\n  "a": {\n    "b": [1, 2, "x"],\n    "c": {}\n  },\n  "d": []\n}\n')
  })

  it('breaks an array once its one-line form plus indent is longer than 110 characters', () => {
    const fits = '"' + 'x'.repeat(WIDTH - 4) + '"' // ["xxx…"] is exactly 110 characters
    assert.equal(formatText(`[${fits}]`), `[${fits}]\n`)
    assert.equal(formatText(`{"k":[${fits}]}`), `{\n  "k": [\n    ${fits}\n  ]\n}\n`) // 2 more for the indent
  })

  it('counts width in characters, not UTF-16 units', () => {
    const s = '"' + '\u{1F600}'.repeat(WIDTH - 4) + '"' // 106 emoji: 110 characters, 216 UTF-16 units
    assert.equal(formatText(`[${s}]`), `[${s}]\n`)
  })

  it('keeps arrays of short arrays on one line and puts objects on their own lines', () => {
    assert.equal(formatText('{"requires":[["a:b","c:d"],["e:f"]]}'), '{\n  "requires": [["a:b", "c:d"], ["e:f"]]\n}\n')
    assert.equal(formatText('[{"a":1}]'), '[\n  {\n    "a": 1\n  }\n]\n')
  })

  it('writes numbers the way Python does', () => {
    assert.equal(formatText('[1.0, 1.50, 1e-5, 1E3, 1e16, 1e15, 0.0001, -0, -0.0, 123456789012345678901234567890]'),
      '[1.0, 1.5, 1e-05, 1000.0, 1e+16, 1000000000000000.0, 0.0001, 0, -0.0, 123456789012345678901234567890]\n')
  })

  it('keeps key order as written, including keys that look like numbers, and the last of repeated keys', () => {
    assert.equal(formatText('{"b":1,"10":2,"a":3,"b":4}'), '{\n  "b": 4,\n  "10": 2,\n  "a": 3\n}\n')
  })

  it('escapes strings like Python with ensure_ascii off', () => {
    assert.equal(formatText('["caf\\u00e9 \\/ \\"q\\" \\\\ \\t \\u0001 \\u2028"]'), '["café / \\"q\\" \\\\ \\t \\u0001  "]\n')
  })

  it('rejects text that is not JSON', () => {
    assert.throws(() => formatText('{"a": 1,}'))
    assert.throws(() => formatText('{"a": 1} x'))
  })

  it('refuses NaN, Infinity and numbers too large for a float rather than write them', () => {
    for (const text of ['[NaN]', '[Infinity]', '[-Infinity]', '[1e400]', '{"a": -1e400}']) {
      assert.throws(() => formatText(text), SyntaxError, text)
    }
    assert.equal(formatText('[1e308, 123456789012345678901234567890]'), '[1e+308, 123456789012345678901234567890]\n')
  })

  it('writes a lone surrogate as an escape, so the output stays valid JSON with the same text', () => {
    const out = formatText('["\\ud800 lone", "\\udfff", "\\ud83d\\ude00"]')
    assert.equal(out, '["\\ud800 lone", "\\udfff", "\u{1F600}"]\n') // a proper pair is written as the character
    assert.deepEqual(JSON.parse(out), ['\ud800 lone', '\udfff', '\u{1F600}'])
    assert.ok(out.isWellFormed())
  })

  it('--check lists an unformatted file and exits 1 without writing it', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-format-'))
    tmpDirs.push(dir)
    const f = path.join(dir, 'x.json')
    fs.writeFileSync(f, '{"a":[1,2]}')
    const r = spawnSync(process.execPath, [FORMAT, '--check', f], { encoding: 'utf8' })
    assert.equal(r.status, 1)
    assert.match(r.stdout, /not formatted: .*x\.json/)
    assert.equal(fs.readFileSync(f, 'utf8'), '{"a":[1,2]}')
    const w = spawnSync(process.execPath, [FORMAT, f], { encoding: 'utf8' })
    assert.equal(w.status, 0, w.stderr)
    assert.equal(fs.readFileSync(f, 'utf8'), '{\n  "a": [1, 2]\n}\n')
  })
})
