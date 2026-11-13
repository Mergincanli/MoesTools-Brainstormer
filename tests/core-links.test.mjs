// Tests for typed-link matching (src/core/links.ts, rule N1): every link kind on the plan's example card, matched as
// scripts/validate.mjs matches them, and the third answer, 'open', for a draft that is only partly filled.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { loadGeneratorData, REPO_ROOT } from '../scripts/lib/generator-data.mjs'
import { indexOf } from '../src/core/data.ts'
import { emptyParts } from '../src/core/draft.ts'
import { matchLink, parseLink } from '../src/core/links.ts'

const ix = indexOf(loadGeneratorData())
const example = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'docs/examples/concept-card.example.json'), 'utf8'))
const card = example.parts

describe('parseLink', () => {
  it('reads the kind, the comparator and the id', () => {
    assert.deepEqual(parseLink('size:<=small'), { kind: 'size', cmp: '<=', id: 'small' })
    assert.deepEqual(parseLink('passengers:>=2'), { kind: 'passengers', cmp: '>=', id: '2' })
    assert.deepEqual(parseLink('role:anti-air'), { kind: 'role', cmp: null, id: 'anti-air' })
    assert.deepEqual(parseLink('unit:ra3.soviet.terror-drone'), { kind: 'unit', cmp: null, id: 'ra3.soviet.terror-drone' })
  })
})

describe('N1 on the example card (a finished card: only yes or no)', () => {
  const cases = {
    yes: [
      'class:drone', 'role:scout', 'role:disabler', 'tier:t1', 'tier:<=t1', 'availability:open', 'damage:cryo',
      'armour-class:light', 'armour-class:<=medium', 'armour-model:charge-shield', 'weapon:blades', 'weapon:cryo',
      'mobility:hover', 'handling:drift', 'body:micro-bot', 'size:tiny', 'size:<=small', 'speed:fast', 'speed:>=fast',
      'crew:solo', 'passengers:0', 'passengers:<=2', 'mount:free-aim', 'delivery:attach', 'delivery:beam', 'range:melee',
      'range:<=short', 'range:>=medium', 'weapon-trait:mark', 'weapon-trait:slow', 'target:infantry', 'hits:ground-vehicle',
      'hits:infantry', 'sight:long', 'sight:>=medium', 'sensor:detector', 'nature:uncrewed-machine',
      'category:infiltration', 'pattern:infest-vehicle',
    ],
    no: [
      'class:infantry', 'role:assault', 'tier:>=t2', 'availability:unique', 'damage:emp', 'armour-class:>=medium',
      'armour-model:evasive', 'weapon:cannon', 'mobility:rotor', 'mobility-trait:leap', 'handling:strafe', 'body:disc',
      'size:>=medium', 'speed:very-fast', 'crew:squad', 'passengers:>=1', 'mount:body-aim', 'delivery:hitscan',
      'range:>=long', 'weapon-trait:stun', 'target:ground-vehicle', 'target:structure', 'hits:low-air', 'sight:short',
      'sensor:radar', 'nature:organic', 'category:control', 'resource:heat', 'pattern:cloak', 'immune:fire',
      'unit:ra3.soviet.terror-drone',
    ],
  }
  for (const [want, links] of Object.entries(cases)) {
    it(`${want}: ${links.length} links`, () => {
      for (const l of links) assert.equal(matchLink(ix, card, l, example.balance.cost_band), want, l)
    })
  }

  it('the example card\'s strengths and weaknesses describe its own parts (as the validator checks)', () => {
    for (const r of [...example.matchups.strengths, ...example.matchups.weaknesses]) assert.equal(matchLink(ix, card, r.ref), 'yes', r.ref)
  })

  it('category: reads the main category only (infest-vehicle is also in control, which does not count)', () => {
    assert.equal(matchLink(ix, card, 'category:control'), 'no')
  })

  it('cost: reads the cost band, open until it is worked out', () => {
    assert.equal(matchLink(ix, card, 'cost:low', 'low'), 'yes')
    assert.equal(matchLink(ix, card, 'cost:>=medium', 'low'), 'no')
    assert.equal(matchLink(ix, card, 'cost:low'), 'open')
  })
})

describe('N1 on a partly filled draft', () => {
  it('nothing chosen: every link is open, except the kinds that never match a card', () => {
    const d = emptyParts()
    for (const l of ['class:drone', 'role:scout', 'weapon:cannon', 'passengers:>=2', 'pattern:cloak', 'category:support', 'target:infantry', 'sight:long', 'mobility-trait:leap']) {
      assert.equal(matchLink(ix, d, l), 'open', l)
    }
    assert.equal(matchLink(ix, d, 'immune:fire'), 'no')
    assert.equal(matchLink(ix, d, 'unit:ra3.soviet.terror-drone'), 'no')
  })

  it('target: a ground mobility needs the size (a tiny or small ground unit counts as infantry); a flier does not', () => {
    const d = { ...emptyParts(), mobility: { base: 'hover' } }
    assert.equal(matchLink(ix, d, 'target:infantry'), 'open')
    assert.equal(matchLink(ix, { ...d, body: { size: 'small' } }, 'target:infantry'), 'yes')
    assert.equal(matchLink(ix, { ...d, body: { size: 'medium' } }, 'target:infantry'), 'no')
    assert.equal(matchLink(ix, { ...emptyParts(), mobility: { base: 'jet' } }, 'target:high-air'), 'yes')
  })

  it('weapons: a match on a chosen weapon is yes; no is said only once every weapon is chosen', () => {
    const one = { ...emptyParts(), armament: { primary: { family: 'cannon' } } }
    assert.equal(matchLink(ix, one, 'weapon:cannon'), 'yes')
    assert.equal(matchLink(ix, one, 'weapon:machine-gun'), 'open')
    assert.equal(matchLink(ix, one, 'damage:explosive'), 'open', 'the damage of the cannon is not chosen yet')
    const all = { ...emptyParts(), armament: { primary: { family: 'cannon', damage: 'armour-piercing' }, secondary: null, conditional: [] } }
    assert.equal(matchLink(ix, all, 'weapon:machine-gun'), 'no')
    assert.equal(matchLink(ix, all, 'damage:explosive'), 'no')
    const unarmed = { ...emptyParts(), armament: { primary: null, secondary: null, conditional: [] } }
    assert.equal(matchLink(ix, unarmed, 'hits:infantry'), 'no')
  })

  it('roles: the primary decides at once; a role not yet held stays open until the secondary roles are chosen', () => {
    const d = { ...emptyParts(), roles: { primary: 'assault' } }
    assert.equal(matchLink(ix, d, 'role:assault'), 'yes')
    assert.equal(matchLink(ix, d, 'role:scout'), 'open')
    assert.equal(matchLink(ix, { ...d, roles: { primary: 'assault', secondary: [] } }, 'role:scout'), 'no')
  })

  it('abilities: the signature counts at once; other patterns stay open until the extras are chosen', () => {
    const d = { ...emptyParts(), signature: { pattern: 'cloak' } }
    assert.equal(matchLink(ix, d, 'pattern:cloak'), 'yes')
    assert.equal(matchLink(ix, d, 'category:stealth-deception'), 'yes')
    assert.equal(matchLink(ix, d, 'pattern:leap'), 'open')
    assert.equal(matchLink(ix, { ...d, abilities: [] }, 'pattern:leap'), 'no')
  })

  it('passengers: null seats count as 0', () => {
    const d = { ...emptyParts(), crew: { passengers: null } }
    assert.equal(matchLink(ix, d, 'passengers:>=1'), 'no')
    assert.equal(matchLink(ix, d, 'passengers:<=0'), 'yes')
    assert.equal(matchLink(ix, { ...emptyParts(), crew: { passengers: { seats: 4, kind: 'passenger-cargo' } } }, 'passengers:>=2'), 'yes')
  })
})
