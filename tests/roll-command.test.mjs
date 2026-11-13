// The roll command (scripts/roll.mjs) and the page of sample cards (scripts/build-cards.mjs): exit codes, the --json
// output read back as the same cards, the readable card, and the page's --check.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { buildCards, PAGE } from '../scripts/build-cards.mjs'
import { loadGeneratorData, REPO_ROOT } from '../scripts/lib/generator-data.mjs'
import { run } from '../scripts/roll.mjs'
import { roll } from '../src/core/roll.ts'

const data = loadGeneratorData()
const cli = args => spawnSync(process.execPath, [path.join(REPO_ROOT, 'scripts', 'roll.mjs'), ...args], { encoding: 'utf8' })

describe('npm run roll', () => {
  it('a readable card by default, with no local path', () => {
    const r = cli(['--seed', 'command-1', '--spice', '3'])
    assert.equal(r.status, 0, r.stderr)
    const card = roll(data, { seed: 'command-1', spice: 3, inputs: {}, locks: {} }).card
    assert.ok(r.stdout.startsWith(`## ${card.text.name}`))
    assert.ok(!r.stdout.includes(REPO_ROOT) && !/\/home\/|\\Users\\|file:\/\//.test(r.stdout))
  })

  it('--json prints the card objects, which read back as the same cards; --count uses seeds made from the seed', () => {
    const one = run(['--seed', 'json-1', '--class', 'walker', '--json', '--lock', 'size=large'], data)
    assert.equal(one.code, 0)
    assert.deepEqual(JSON.parse(one.out), roll(data, { seed: 'json-1', spice: data.rules.defaults.spice, inputs: { class: 'walker' }, locks: { size: 'large' } }).card)
    const many = run(['--seed', 'json', '--count', '3', '--json', '--spice=4'], data)
    const cards = JSON.parse(many.out)
    assert.deepEqual(cards.map(c => c.seed), ['json-1', 'json-2', 'json-3'])
    cards.forEach(c => assert.deepEqual(c, roll(data, { seed: c.seed, spice: 4, inputs: {}, locks: {} }).card))
  })

  it('--out writes the output to a file and says how many cards, without the path', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-roll-'))
    try {
      const file = path.join(dir, 'cards.json')
      const r = cli(['--seed', 'out', '--count', '2', '--json', '--out', file])
      assert.equal(r.status, 0, r.stderr)
      assert.equal(r.stdout.trim(), '2 cards written.')
      assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).length, 2)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })

  it('exit code 2 with one sentence for an unknown option or a bad value', () => {
    for (const args of [['--colour', 'red'], ['--spice', 'hot'], ['--spice', '9'], ['--class', 'tank'], ['--lock', 'wheels=big'], ['--lock', 'roles={bad'], ['--count', '0'], ['--seed']]) {
      const r = cli(args)
      assert.equal(r.status, 2, `${args.join(' ')}: ${r.stdout}${r.stderr}`)
      assert.equal(r.stderr.trim().split('\n').length, 1, args.join(' '))
      assert.equal(r.stdout, '')
    }
  })

  it('exit code 1 and the reason for an unavailable roll (transport on infantry)', () => {
    const r = cli(['--seed', 'x', '--class', 'infantry', '--role', 'transport'])
    assert.equal(r.status, 1)
    assert.match(r.stderr, /unavailable/)
  })
})

describe('the page of sample cards', () => {
  it('npm run cards:check passes on the page in the repository, byte for byte (other line endings would not)', () => {
    const text = buildCards(data)
    assert.ok(fs.readFileSync(path.join(REPO_ROOT, PAGE)).equals(Buffer.from(text, 'utf8')), 'docs/cards.md is out of date: run npm run cards')
    const ok = spawnSync(process.execPath, [path.join(REPO_ROOT, 'scripts', 'build-cards.mjs'), '--check'], { encoding: 'utf8' })
    assert.equal(ok.status, 0, ok.stdout)
    assert.equal(text.split('\n### ').length - 1, 12, 'twelve cards')
    assert.ok(!/\r/.test(text), 'Unix line endings')
    assert.ok(!fs.readFileSync(path.join(REPO_ROOT, PAGE)).equals(Buffer.from(text.replace(/\n/g, '\r\n'), 'utf8')))
    assert.ok(!/\((?:[A-Z]{1,2}\d{1,2}|[A-Z]-[a-g])[,)]/.test(text) && !/\b(?:HC\d|K-[a-g]|T-[ab])\b/.test(text), 'no rule codes')
  })
})
