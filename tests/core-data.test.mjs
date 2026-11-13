// Tests for the generator's data side: the data version and data/manifest.json (rule G8; scripts/build-manifest.mjs),
// the loader (scripts/lib/generator-data.mjs), the key count kept in one place (src/core/keys.ts), and that src/core/
// stays pure (no Node or browser API, imports of .ts files only), so it can run unchanged in a browser.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { after, describe, it } from 'node:test'
import { manifestOf } from '../scripts/build-manifest.mjs'
import { dataVersionOf, HASHED_FOLDERS, loadGeneratorData, REPO_ROOT } from '../scripts/lib/generator-data.mjs'
import { indexOf } from '../src/core/data.ts'
import { LOCKABLE } from '../src/core/draft.ts'
import { countKeys } from '../src/core/keys.ts'

const BUILD = path.join(REPO_ROOT, 'scripts/build-manifest.mjs')
const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })

/** A copy of the hashed folders; `rewrite` may change each file's text on the way. */
function copyData(rewrite = (name, text) => text) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-core-'))
  tmpDirs.push(dir)
  for (const folder of HASHED_FOLDERS) {
    fs.mkdirSync(path.join(dir, folder), { recursive: true })
    for (const f of fs.readdirSync(path.join(REPO_ROOT, folder))) {
      const text = fs.readFileSync(path.join(REPO_ROOT, folder, f), 'utf8')
      fs.writeFileSync(path.join(dir, folder, f), rewrite(`${folder}/${f}`, text))
    }
  }
  return dir
}

describe('G8: the data version', () => {
  it('data/manifest.json is up to date', () => {
    const file = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'data/manifest.json'), 'utf8'))
    assert.deepEqual(file, manifestOf(REPO_ROOT), 'run npm run manifest')
    assert.match(file.data_version, /^[0-9a-f]{64}$/)
  })

  it('formatting and line endings do not change it', () => {
    const squeezed = copyData((name, text) => JSON.stringify(JSON.parse(text)))
    const crlf = copyData((name, text) => JSON.stringify(JSON.parse(text), null, 4).replace(/\n/g, '\r\n'))
    assert.deepEqual(dataVersionOf(squeezed), dataVersionOf(REPO_ROOT))
    assert.deepEqual(dataVersionOf(crlf), dataVersionOf(REPO_ROOT))
  })

  it('a change to the data changes it, and the hash of that folder only', () => {
    const changed = copyData((name, text) => {
      if (name !== 'data/generator/rules.json') return text
      const d = JSON.parse(text)
      d.attempts += 1
      return JSON.stringify(d, null, 2)
    })
    const a = dataVersionOf(REPO_ROOT)
    const b = dataVersionOf(changed)
    assert.notEqual(b.data_version, a.data_version)
    assert.notEqual(b.folders['data/generator'].sha256, a.folders['data/generator'].sha256)
    assert.equal(b.folders['data/vocab'].sha256, a.folders['data/vocab'].sha256)
    assert.equal(b.folders['data/patterns'].sha256, a.folders['data/patterns'].sha256)
  })

  it('the manifest check passes on the repository and fails on stale data', () => {
    const ok = spawnSync(process.execPath, [BUILD, '--check'], { encoding: 'utf8' })
    assert.equal(ok.status, 0, ok.stdout + ok.stderr)
    const stale = copyData((name, text) => (name === 'data/generator/names.json' ? text.replace('"Rivet"', '"Rivets"') : text))
    fs.copyFileSync(path.join(REPO_ROOT, 'data/manifest.json'), path.join(stale, 'data/manifest.json'))
    const bad = spawnSync(process.execPath, [BUILD, '--check', stale], { encoding: 'utf8' })
    assert.equal(bad.status, 1)
    assert.match(bad.stdout, /out of date/)
  })
})

describe('the loader', () => {
  const data = loadGeneratorData()
  it('gives the module one plain object with every part it reads', () => {
    assert.equal(data.dataVersion, manifestOf(REPO_ROOT).data_version)
    assert.equal(Object.keys(data.vocab).length, fs.readdirSync(path.join(REPO_ROOT, 'data/vocab')).length)
    assert.equal(data.patterns.length, fs.readdirSync(path.join(REPO_ROOT, 'data/patterns')).length)
    assert.deepEqual(data.patterns.map(p => p.id), [...data.patterns.map(p => p.id)].sort())
    assert.ok(data.registry.length >= data.patterns.length)
    assert.equal(data.refKinds.size.ranked, true)
    assert.deepEqual([data.rules.kind, data.names.kind, data.texts.kind], ['rules', 'names', 'texts'])
    assert.ok(data.realNames.units.length > 0 && data.realNames.factions.length > 0 && data.realNames.games.length > 0)
    assert.doesNotThrow(() => JSON.stringify(data), 'plain data only')
  })

  it('the index rejects a rule value the code does not implement, rather than misreading it', () => {
    const copy = JSON.parse(JSON.stringify(data))
    copy.rules.defaults.avoided_blocks_implied = false
    assert.throws(() => indexOf(copy), /does not implement/)
  })
})

describe('locks and keys', () => {
  it('the lockable parts are the card schema\'s, in its order', () => {
    const schema = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'schemas/concept-card.schema.json'), 'utf8'))
    assert.deepEqual(LOCKABLE, schema.$defs.lockable.enum)
  })

  it('K-a: the example card has 2 keys (its signature and its secondary weapon) and no passive, as the validator counts', () => {
    const ix = indexOf(loadGeneratorData())
    const card = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'docs/examples/concept-card.example.json'), 'utf8'))
    assert.deepEqual(countKeys(ix, card.parts), { keys: card.balance.keys, passives: 0 })
  })

  it('K1: a key-bound trait and the key ability that implies it are one button; K2 is one flag', () => {
    const ix = indexOf(loadGeneratorData())
    const parts = {
      roles: {}, body: {}, armour: {}, sensors: {}, crew: {},
      mobility: { traits: ['leap'] },
      armament: { primary: { family: 'blades' }, secondary: null, conditional: [] },
      signature: { pattern: 'leap', variant: null, kind: 'active', primaryFire: true },
      abilities: [{ pattern: 'heal-self', variant: null, kind: 'passive' }],
    }
    assert.deepEqual(countKeys(ix, parts), { keys: 1, passives: 1 }, 'leap and its ability: one key')
    assert.deepEqual(countKeys(ix, parts, false), { keys: 0, passives: 1 }, 'K2 A: the signature on primary fire is not a key')
    assert.deepEqual(countKeys(ix, { ...parts, signature: { ...parts.signature, kind: 'passive' } }), { keys: 1, passives: 2 }, 'under a passive ability the trait keeps its own key')
  })
})

describe('src/core/ is pure', () => {
  const dir = path.join(REPO_ROOT, 'src/core')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'))
  const code = f => fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
  it('uses no Node or browser API, no clock and no random source', () => {
    const banned = [/\bprocess\b/, /\bnode:/, /\brequire\s*\(/, /\bDate\b/, /Math\.random/, /\bcrypto\b/, /\bfs\b/, /\bwindow\b/, /\bdocument\b/, /\bconsole\b/, /\bglobalThis\b/, /\bperformance\b/, /\bfetch\s*\(/]
    for (const f of files) for (const b of banned) assert.doesNotMatch(code(f), b, `${f} uses ${b}`)
  })

  it('imports only its own .ts files, and types with import type', () => {
    for (const f of files) {
      for (const m of code(f).matchAll(/^\s*import\s+(type\s+)?[^'"]*from\s+'([^']+)'/gm)) {
        assert.match(m[2], /^\.\/[a-z-]+\.ts$/, `${f} imports ${m[2]}`)
      }
    }
  })
})
