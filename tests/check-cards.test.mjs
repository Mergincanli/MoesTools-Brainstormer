// Tests for scripts/check-cards.mjs, the separate checker for rolled cards (docs/generator-rules.md, section 13, P3).
//
// No generator is used. The cards in tests/fixtures/cards/ were worked out by hand from the rule sheet and the data,
// and each passes every check:
//   a  Soviet T1 vehicle, spice 1, solo, everything rolled: a power shot, a cannon
//   b  Allied T2 vehicle, spice 3, driver and gunner: a stasis prison (hard control) and a scan
//   c  Empire T3 walker, spice 4: transform with a flying second form, a dash, a passive rage, an EMP gun (HC7)
//   d  Allied T1 vehicle, spice 4, input role transport: a weapon set by the passenger (adaptive, 3 conditional
//      weapons, passenger seats) and smoke
// Each test below changes one card so that one rule breaks and asserts that the checker reports that rule's code, and,
// where that is cheap to arrange, nothing else.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { loadCheckData, checkCard, validateCards, checkCards, countKeys, computeBalance, sameMechanicPairs } from '../scripts/check-cards.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FIXTURES = path.join(ROOT, 'tests', 'fixtures', 'cards')
const SCRIPT = path.join(ROOT, 'scripts', 'check-cards.mjs')
const data = loadCheckData(ROOT)
const FILES = {
  a: 'a-soviet-t1-vehicle-spice1.json',
  b: 'b-allied-t2-two-seat-stasis-spice3.json',
  c: 'c-empire-t3-walker-transform-spice4.json',
  d: 'd-allied-t1-adaptive-transport-spice4.json',
}
// A fresh copy of a fixture. Its data version is set to the data's, so that a later data change does not fail every
// test on G8 (G8 has a test of its own).
function card(k) {
  const c = JSON.parse(fs.readFileSync(path.join(FIXTURES, FILES[k]), 'utf8'))
  if (data.manifest) c.generator.data_version = data.manifest.data_version
  return c
}
const fmt = ps => ps.map(p => `${p.code} ${p.path}: ${p.message}`).join('\n') || '(no problems)'
const codes = (c, d = data) => [...new Set(checkCard(c, d).map(p => p.code))].sort()
function only(c, code, d = data) {
  const ps = checkCard(c, d)
  assert.deepEqual([...new Set(ps.map(p => p.code))], [code], fmt(ps))
}
function has(c, code, d = data) {
  const ps = checkCard(c, d)
  assert.ok(ps.some(p => p.code === code), `expected ${code}, got:\n${fmt(ps)}`)
}
// A copy of the data with some parts replaced, for rules whose clean break needs other data.
const withData = patch => ({ ...data, ...patch })
const withPattern = (id, generatorPatch) => withData({ patterns: { ...data.patterns, [id]: { ...data.patterns[id], generator: { ...data.patterns[id].generator, ...generatorPatch } } } })
const withPatternDoc = (id, f) => withData({ patterns: { ...data.patterns, [id]: f(structuredClone(data.patterns[id])) } })
const withRules = patch => withData({ rules: { ...data.rules, ...patch } })
const withTier = (t, patch) => withData({ terms: { ...data.terms, tiers: { ...data.terms.tiers, [t]: { ...data.terms.tiers[t], ...patch } } } })
const hcWith = f => withRules({ hard_control: { ...data.rules.hard_control, entries: data.rules.hard_control.entries.map(f) } })

describe('the data and the fixtures', () => {
  test('the generator files pass their schema and name only ids that exist', () => {
    assert.deepEqual(data.dataProblems, [])
  })

  for (const k of Object.keys(FILES)) {
    test(`fixture ${k} passes every check of this checker`, () => {
      assert.deepEqual(checkCard(card(k), data), [], fmt(checkCard(card(k), data)))
    })
  }

  test("the fixtures pass the validator's card rules too (one batch)", () => {
    const { problems, dataErrors } = validateCards(Object.keys(FILES).map(card), data)
    assert.deepEqual(dataErrors, [])
    problems.forEach((ps, i) => assert.deepEqual(ps, [], `fixture ${Object.keys(FILES)[i]}:\n${fmt(ps)}`))
  })

  test('N3: the satisfiable links are worked out from the data (the sheet counts 52 in countered_by, 3 never satisfiable)', () => {
    const links = new Set()
    for (const p of Object.values(data.patterns)) {
      for (const r of p.generator?.countered_by || []) links.add(r.ref)
      for (const v of p.variants) for (const r of v.overrides?.countered_by || []) links.add(r.ref)
    }
    const never = [...links].filter(l => !data.isSatisfiable(l)).sort()
    assert.equal(links.size, 52)
    assert.deepEqual(never, ['immune:stack-to-overload', 'pattern:raise-shield', 'weapon-trait:stun'])
    // the links the parts add (N4) can all be satisfied
    for (const l of ['damage:emp', 'damage:melee', 'hits:low-air', 'hits:high-air', 'class:aircraft']) assert.ok(data.isSatisfiable(l), l)
    // a range no family has by default and no pattern implies can't be held (G11)
    assert.equal(data.isSatisfiable('range:off-screen'), false)
  })
})

describe('the plan\'s hand-made example card, read as a rolled card', () => {
  const example = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'examples', 'concept-card.example.json'), 'utf8'))

  test('it is reported for the pairing within one ability (M3) and the escape lines (HC4, HC7)', () => {
    const ps = checkCard(example, data)
    assert.ok(ps.some(p => p.code === 'M3'), fmt(ps))
    // the attach latch and the infester's own escape (HC4), and the cryo beam's fixed line (HC7)
    assert.equal(ps.filter(p => p.code === 'HC4').length, 2, fmt(ps))
    assert.equal(ps.filter(p => p.code === 'HC7').length, 1, fmt(ps))
  })

  test('the rest it is reported for is hand-made, and the sheet says so where it speaks of the card', () => {
    // M1: section 8 says the example pairs its fast speed with its light armour, which parts never add on a rolled card.
    // B2: section 10 computes complexity 4 for it; the card says 3.
    // Not named by the sheet, but true of any hand-made card: G8 (its data version is 'draft 1.0.0'), S11 (its texts
    // are written by hand, not by the templates), N4 and M4 (its counter lists add sensor:stealth and leave out derived
    // links), G12 (its blades carry no damage, and its weapons list fewer targets than family and delivery allow), and
    // T-a ('Frost' is a word of a real name in the patterns' examples: the Frost mage).
    assert.deepEqual(codes(example), ['B2', 'G12', 'G8', 'HC4', 'HC7', 'M1', 'M3', 'M4', 'N4', 'S11', 'T-a'])
  })

  test("it stays valid under the validator's card rules (P3: the validator's rules stay as they are)", () => {
    const { problems, dataErrors } = validateCards([example], data)
    assert.deepEqual(dataErrors, [])
    assert.deepEqual(problems[0], [])
  })
})

describe('schema, data version, inputs', () => {
  test('CS: a card that breaks its schema is reported for that alone', () => {
    const c = card('a')
    delete c.parts.class
    only(c, 'CS')
  })
  test('G8: a card rolled on other data', () => {
    const c = card('a')
    c.generator.data_version = 'some-older-hash'
    only(c, 'G8')
  })
  test('I1: an input that was not used', () => {
    const c = card('a')
    c.inputs.flavour = 'allied'
    only(c, 'I1')
    const d = card('d')
    d.inputs.role = 'support'
    only(d, 'I1')
  })
})

describe('patterns on a card (section 4)', () => {
  test('A2: a rolled card always has a variant', () => {
    const c = card('a')
    c.parts.signature.variant = null
    only(c, 'A2')
  })
  test('A4: the cooldown bands a kind can roll, and none for passive abilities', () => {
    const a = card('a')
    a.parts.signature.cooldown = 'spam' // an active ability rolls short, medium or long
    only(a, 'A4')
    const c = card('c')
    c.parts.abilities[1].cooldown = 'short' // rage-when-wounded is passive
    only(c, 'A4')
  })
  test('A6: never the same pattern twice, and no more abilities than the tier counts', () => {
    const c = card('c')
    c.parts.abilities.push({ ...c.parts.abilities[0] })
    has(c, 'A6')
    const a = card('a')
    a.parts.abilities = [
      { pattern: 'lay-smoke', variant: 'self-screen', kind: 'active', seat: 'driver', cooldown: 'medium' },
      { pattern: 'heal-self', variant: 'kit-stock', kind: 'active', seat: 'driver', cooldown: 'medium' },
    ]
    has(a, 'A6') // three abilities on a T1 card
  })
  test('A7: patterns that conflict', () => {
    const c = card('c')
    c.parts.abilities[0] = { pattern: 'deploy-siege-mode', variant: 'siege-gun', kind: 'deploy', seat: 'driver', cooldown: 'short' }
    has(c, 'A7') // transform conflicts with deploy-siege-mode
  })
  test('A11: rules.same_mechanic, as pattern ids or as sides with variants', () => {
    assert.deepEqual(data.sameMechanic, []) // empty today
    only(card('c'), 'A11', withData({ sameMechanic: sameMechanicPairs({ same_mechanic: [['transform', 'dash']] }) }))
    only(card('c'), 'A11', withData({ sameMechanic: sameMechanicPairs({ same_mechanic: [[{ pattern: 'dash', variants: ['quick-lunge'] }, { pattern: 'transform' }]] }) }))
    assert.deepEqual(codes(card('c'), withData({ sameMechanic: sameMechanicPairs({ same_mechanic: [[{ pattern: 'dash', variants: ['sprint'] }, 'transform']] }) })), [])
  })
  test('A8: an implied pattern must be on the card, as the signature or as an extra', () => {
    only(card('c'), 'A8', withPattern('dash', { implies: ['mobility-trait:boost', 'pattern:lay-smoke'] }))
    // the signature of fixture c is transform: implied by an extra, it is on the card already
    const d = withPattern('dash', { implies: ['mobility-trait:boost', 'pattern:transform'] })
    assert.deepEqual(checkCard(card('c'), d), [], fmt(checkCard(card('c'), d)))
  })
  test('A9: a second form only from transform, of another class it allows', () => {
    const c = card('c')
    c.parts.modes = []
    c.balance.complexity -= 1 // the second form's complexity point goes with it
    only(c, 'A9')
    const c2 = card('c')
    c2.parts.modes[0].class = 'walker'
    only(c2, 'A9')
    const a = card('a')
    a.parts.modes = [{ via: 'deploy-siege-mode', class: 'vehicle', mobility: { base: 'tracks', handling: 'pivot', speed: 'slow' } }]
    a.balance.complexity += 1
    only(a, 'A9')
  })
  test('A10: an adaptive weapon gets 2 to 4 conditional weapons on the link kind its pattern names', () => {
    const d = card('d')
    d.parts.armament.conditional.splice(1, 2) // one left
    only(d, 'A10')
    const d2 = card('d')
    d2.parts.armament.conditional[1].when = 'weapon:flak' // passenger-sets-weapon makes them on role: links
    only(d2, 'A10')
    const a = card('a')
    a.parts.armament.conditional = [{ when: 'role:anti-air', weapon: { ...a.parts.armament.primary } }]
    has(a, 'A10') // conditional weapons without an adaptive weapon
  })
})

describe('keys (section 5)', () => {
  test('countKeys: a key-bound trait and the ability that implies it are one key (K1); the signature counts (K2 open)', () => {
    assert.deepEqual(countKeys(card('c'), data), { total: 3, perSeat: { driver: 3 }, passives: 1 })
    assert.deepEqual(countKeys(card('a'), data), { total: 1, perSeat: { driver: 1 }, passives: 0 })
    assert.deepEqual(countKeys(card('b'), data), { total: 3, perSeat: { driver: 2, gunner: 1 }, passives: 0 })
  })
  test('K-a: keys within max_keys and passives within max_passive', () => {
    only(card('a'), 'K-a', withTier('t1', { max_keys: 0 }))
    only(card('c'), 'K-a', withTier('t3', { max_passive: 0 }))
  })
  test('K-c: no seat holds more than max_keys_per_seat', () => {
    only(card('c'), 'K-c', withTier('t3', { max_keys_per_seat: 2 }))
  })
  test('K-d: a key-bound trait only where an ability implies it', () => {
    const b = card('b')
    b.parts.mobility.traits.push('boost')
    has(b, 'K-d')
  })
  test('K-g: balance.keys is the key count', () => {
    const a = card('a')
    a.balance.keys = 2
    only(a, 'K-g')
  })
})

describe('seats (A5, C4)', () => {
  test('A5: the gunner owns the secondary weapon; the primary follows the solo fallback; abilities sit with the driver', () => {
    const b = card('b')
    b.parts.abilities[0].seat = 'gunner'
    b.text.how_it_plays.controls[2].seat = 'gunner'
    only(b, 'A5')
    const b2 = card('b')
    b2.parts.crew.solo_fallback = 'seat-swap' // the gunner then fires the primary weapon (defaults.primary_weapon_seat)
    has(b2, 'A5')
    const a = card('a')
    a.parts.armament.primary.seat = 'gunner' // a seat the card does not have
    has(a, 'A5')
  })
  test('C4: an operating seat that owns nothing is idle', () => {
    const b = card('b')
    b.parts.crew.model = 'driver-gunner-commander' // the commander would own the last extra: here it owns nothing
    has(b, 'C4')
    has(b, 'A5')
  })
})

describe('hard control (section 6)', () => {
  test('HC1: no stun trait on a card weapon', () => {
    const a = card('a')
    a.parts.armament.primary.traits = ['stun']
    only(a, 'HC1')
  })
  test("HC2: a stun-class ability waits for its tier (here the entry's own text tier)", () => {
    only(card('b'), 'HC2', hcWith(e => (e.pattern === 'lock-in-stasis' ? { ...e, min_tier: 't3' } : e)))
  })
  test('HC3: a stun-class ability takes a medium or long cooldown, and a kind that uses a key', () => {
    const b = card('b')
    b.parts.signature.cooldown = 'short' // fine for an active ability, not for hard control
    only(b, 'HC3')
    const b2 = card('b')
    b2.parts.signature.kind = 'passive'
    has(b2, 'HC3')
  })
  test('A4: a latch ability with a key kind takes the hard-control cooldown too', () => {
    const b = card('b')
    b.parts.signature.cooldown = 'short'
    only(b, 'A4', hcWith(e => (e.pattern === 'lock-in-stasis' ? { ...e, class: 'latch' } : e)))
  })
  test('HC4: the escape line must be in as_target, and a variant with no escape is never offered', () => {
    const b = card('b')
    b.text.how_it_plays.as_target = data.patterns['lock-in-stasis'].player_translation.as_target[0]
    has(b, 'HC4')
    has(card('b'), 'HC4', hcWith(e => (e.pattern === 'lock-in-stasis' ? { ...e, escape: null } : e)))
  })
  test('HC4: an attach delivery needs the fixed shake-off line', () => {
    const c = card('c')
    c.parts.armament.primary = { family: 'blades', damage: 'melee', mount: 'free-aim', delivery: 'attach', range: 'melee', can_target: ['infantry', 'ground-vehicle', 'structure'], traits: [], seat: 'driver' }
    has(c, 'HC4')
  })
  test('HC7: a weapon of the cryo, emp, psionic or magnetic family needs its fixed escape line', () => {
    const c = card('c')
    c.text.how_it_plays.as_target = data.patterns.transform.player_translation.as_target[0]
    has(c, 'HC7')
  })
})

describe('counters and matchups (sections 8 and 9)', () => {
  test('N2: a link no card can satisfy is dropped', () => {
    const a = card('a')
    // fire-power-shot's own first countered_by link names a pattern that is not written
    a.matchups.countered_by.unshift({ ref: 'pattern:raise-shield', why: data.texts.neutral.countered_by })
    a.matchups.countered_by.pop()
    has(a, 'N2')
    const b = card('b')
    b.matchups.countered_by[4] = { ref: 'weapon-trait:stun', why: 'Stunned.' }
    has(b, 'N2')
  })
  test('N2: at least one counter some card can satisfy', () => {
    only(card('a'), 'N2', withData({ isSatisfiable: () => false }))
  })
  test('N4: the derived countered_by and counters lists', () => {
    const a = card('a')
    a.matchups.countered_by.pop() // damage:emp, which its crewed nature gives
    only(a, 'N4')
    const b = card('b')
    b.matchups.counters[4] = { ref: 'class:infantry', why: 'It shoots soldiers.' }
    only(b, 'N4')
  })
  test('M1: strengths come from the abilities, all of them when there is room', () => {
    const b = card('b')
    b.matchups.strengths.pop() // the scan's strength
    only(b, 'M1')
    const a = card('a')
    a.matchups.strengths.push({ ref: 'speed:medium', why: 'It keeps up.', paired_with: 0 })
    has(a, 'M1') // a part adds no strength on a rolled card
  })
  test('M3: a strength pairs with a weakness of the same ability', () => {
    const b = card('b')
    b.matchups.strengths[0].paired_with = 1
    b.matchups.strengths[1].paired_with = 0
    only(b, 'M3')
  })
  test("M4: the signature's entries first, at most five", () => {
    const b = card('b')
    const cb = b.matchups.countered_by
    b.matchups.countered_by = [cb[2], cb[0], cb[1], cb[3], cb[4]]
    only(b, 'M4')
  })
  test('S11: a matchup reason is the pattern\'s why, or the neutral sentence when that names a real game', () => {
    const c = card('c')
    c.matchups.countered_by[1].why = data.patterns.transform.generator.countered_by[1].why // names Red Alert 3
    assert.deepEqual(codes(c), ['S11', 'T-b'])
  })
})

describe('crew, death, availability and the other rows of section 7', () => {
  test('C3: one who-gets-out outcome, at most one what-is-left, no wreck with respawn', () => {
    const b = card('b')
    b.parts.on_death = ['wreck', 'death-blast']
    only(b, 'C3')
    const b2 = card('b')
    b2.parts.on_death = ['respawn', 'wreck']
    only(b2, 'C3')
  })
  test('S7: bail-out and pilot-eject only for a crewed machine', () => {
    const c = card('c')
    c.parts.on_death = ['pilot-eject']
    c.parts.nature = 'organic'
    has(c, 'S7')
  })
  test('S7: no solo fallback on a one-player crew; C2: a multi-seat crew has one', () => {
    const a = card('a')
    a.parts.crew.solo_fallback = 'full-control'
    only(a, 'S7')
    const b = card('b')
    b.parts.crew.solo_fallback = null
    only(b, 'C2')
  })
  test('S7: body count 1 unless a squad', () => {
    const a = card('a')
    a.parts.body.count = 2
    only(a, 'S7')
  })
  test('S7: passengers only when an ability needs them, within the cap, of the right kind', () => {
    const a = card('a')
    a.parts.crew.passengers = { seats: 1, kind: 'passenger-cargo' }
    a.balance.complexity += 1
    only(a, 'S7')
    const d = card('d')
    d.parts.crew.passengers.seats = 5 // a medium card holds 4
    only(d, 'S7')
    const d2 = card('d')
    d2.parts.crew.passengers.kind = 'passenger-cargo' // passenger-sets-weapon gives a passenger-module seat
    only(d2, 'S7')
  })
  test('S7: nature by the defaults', () => {
    const b = card('b')
    b.parts.nature = 'uncrewed-machine'
    has(b, 'S7')
  })
  test("S7: a default whose nature the word list does not allow for the card's class is passed over", () => {
    // organic is for infantry, walkers and aircraft only: put first for vehicles, it does not apply to fixture a
    const d = withRules({ defaults: { ...data.rules.defaults, nature: [{ when: 'class:vehicle', nature: 'organic' }, ...data.rules.defaults.nature] } })
    assert.deepEqual(checkCard(card('a'), d), [], fmt(checkCard(card('a'), d)))
  })
  test('S7: availability gates', () => {
    const a = card('a')
    a.parts.availability = 'limited' // only from spice 2
    only(a, 'S7')
  })
  test('S7: unarmed only for the listed roles and signature categories', () => {
    const a = card('a')
    a.parts.armament.primary = null
    has(a, 'S7')
  })
  test('S7: a secondary weapon always with a gunner seat', () => {
    const b = card('b')
    b.parts.armament.secondary = null
    has(b, 'S7')
  })
  test('S7: a resource only when an ability implies or requires it', () => {
    const a = card('a')
    a.parts.resource = 'heat'
    only(a, 'S7')
  })
})

describe('spice and flavour (section 3, G5, T6)', () => {
  test('G5: a part above the spice gate that nothing needs', () => {
    const a = card('a')
    a.parts.armour.models = ['zonal'] // uncommon at spice 1
    only(a, 'G5')
  })
  test("G5: a rolled pattern whose implied part is above the gate; a lock makes it a part you chose", () => {
    const d = card('d')
    d.spice = 2 // the adaptive weapon passenger-sets-weapon implies is rare
    only(d, 'G5')
    d.locks = ['signature']
    assert.deepEqual(checkCard(d, data), [])
  })
  test('G5: a part above the gate that the input role needs is set, not rolled', () => {
    // fire-power-shot made uncommon (above spice 1), and made assault's tool: needed only when assault is the input
    const d = withData({
      patterns: { ...data.patterns, 'fire-power-shot': { ...data.patterns['fire-power-shot'], generator: { ...data.patterns['fire-power-shot'].generator, rarity: 'uncommon' } } },
      rules: { ...data.rules, role_fit: { ...data.rules.role_fit, assault: { ...data.rules.role_fit.assault, patterns: ['fire-power-shot'] } } },
    })
    only(card('a'), 'G5', d)
    const a = card('a')
    a.inputs.role = 'assault'
    assert.deepEqual(checkCard(a, d), [], fmt(checkCard(a, d)))
  })
  test('G5: an input role that needs seats justifies its seat pattern above the gate only when no other pattern brings seats at the gate', () => {
    // fixture d at spice 2: input role transport, seats from passenger-sets-weapon, whose adaptive weapon is rare.
    // carry-passengers would bring the seats from within the gate, so the rare weapon is not justified ...
    const c = card('d')
    c.spice = 2
    only(c, 'G5')
    // ... and it is once no other pattern brings seats at all
    const seats = b => [...(b?.implies || []), ...(b?.requires || []).flat()].some(l => l.startsWith('passengers:'))
    const others = Object.values(data.patterns).filter(pt => pt.id !== 'passenger-sets-weapon' && (seats(pt.generator) || pt.variants.some(v => seats(v.overrides))))
    assert.ok(others.some(pt => pt.id === 'carry-passengers'))
    const d = withData({ patterns: Object.fromEntries(Object.entries(data.patterns).filter(([id]) => !others.some(pt => pt.id === id))) })
    assert.deepEqual(checkCard(c, d), [], fmt(checkCard(c, d)))
  })
  test('G5: the class is rolled at the gate when nothing is locked', () => {
    const a = card('a')
    a.parts.class = 'hover' // uncommon: vehicle, walker, infantry and aircraft are common
    has(a, 'G5')
  })
  test('S4: no avoided part below spice 3, even with the off-flavour flag', () => {
    const b = card('b')
    b.spice = 2
    b.parts.mobility.traits.push('crush') // the Allied flavour avoids crush
    b.balance.flags = ['off-flavour']
    only(b, 'S4')
  })
  test('S4: from spice 3 an avoided part needs the off-flavour warning', () => {
    const b = card('b')
    b.parts.mobility.traits.push('crush')
    only(b, 'S4')
    b.balance.flags = ['off-flavour']
    assert.deepEqual(checkCard(b, data), [])
  })
  test("S6: a variant above the card's spice", () => {
    const a = card('a')
    a.parts.signature.variant = 'refresh-on-kill' // min_spice 3
    has(a, 'S6')
  })
})

describe('mobility and weapons (G10 to G13)', () => {
  test('G10: handling is the mobility default', () => {
    const a = card('a')
    a.parts.mobility.handling = 'steer'
    only(a, 'G10')
  })
  test("G11: a weapon's range is its family's default", () => {
    const b = card('b')
    b.parts.armament.primary.range = 'short'
    only(b, 'G11')
  })
  test('G12: every target the family and delivery allow, and a mount the body allows', () => {
    const a = card('a')
    a.parts.armament.primary.can_target = ['infantry', 'ground-vehicle', 'low-air']
    only(a, 'G12')
    const b = card('b')
    b.parts.armament.secondary.mount = 'radial' // a hull-turret body does not allow it
    only(b, 'G12')
  })
  test('G13: a role the card holds must fit', () => {
    const c = card('c')
    c.parts.roles.secondary.push('engineer') // no capture, build, spawn or exits pattern
    only(c, 'G13')
  })
  test('G14: a secondary role is not the primary role and is not repeated', () => {
    const b = card('b')
    b.parts.roles.secondary = ['scout', 'scout']
    only(b, 'G14')
  })
})

describe('balance (section 10)', () => {
  test('computeBalance gives the sheet\'s numbers for the example card: power 4, complexity 4, cost 4 (low)', () => {
    const example = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'examples', 'concept-card.example.json'), 'utf8'))
    assert.deepEqual(computeBalance(example, data), { power: 4, complexity: 4, cost: 4, cost_band: 'low', keys: 2 })
  })
  test('B1, B2, B3: power, complexity and cost band', () => {
    const a = card('a')
    a.balance.power = 2
    only(a, 'B1')
    const a2 = card('a')
    a2.balance.complexity = 2
    only(a2, 'B2')
    const a3 = card('a')
    a3.balance.cost_band = 'low'
    only(a3, 'B3')
  })
  test('B3: the cost-outside-tier warning only when the band is outside the tier', () => {
    const a = card('a')
    a.balance.flags = ['cost-outside-tier']
    only(a, 'B3')
  })
})

describe('names and text (section 11, T-a, T-b)', () => {
  test('T-a: no word of a name may be a word of a real name', () => {
    const N = data.names_
    only(card('a'), 'T-a', withData({ names_: { ...N, realWords: new Set([...N.realWords, 'girder']) } }))
  })
  test('T-b: the text check finds real names, short forms of titles and the word wiki, not plain words', () => {
    const leaks = s => data.textCheck.leaks(s)
    assert.ok(leaks('as Red Alert 2 shows').includes('Red Alert'))
    assert.ok(leaks('the Generals wiki names it').includes('wiki'))
    assert.ok(leaks('a fast flank (Generals dozers need escorts)').includes('Generals'))
    assert.deepEqual(leaks('a spy can hide among engineers on every side'), [])
    assert.deepEqual(leaks('Engineers repair it.'), [])
  })
  test("T-b: possessive forms, bracketed parts of an example's name, and our own words", () => {
    const leaks = s => data.textCheck.leaks(s)
    assert.ok(leaks("splash there catches several at once, as at Generals' crowded tunnel mouths").includes('Generals'))
    assert.ok(leaks("a helicopter in the Cryocopter's spirit").includes('Cryocopter'))
    assert.ok(leaks('as Medivacs do for stimmed Marines.').includes('Marines'), 'a single word in brackets after an example is a name')
    assert.deepEqual(leaks('throw splash into the bunch, or use an EMP to drop them all'), [], 'EMP is a label of our own word lists')
    assert.ok(leaks("Follow up after an emergency fix: Battlefield's extinguisher leaves it on low health").includes('Battlefield'), 'a sentence goes on after a colon')
  })
  test("T-b: the summary in the pitch starts a sentence of its own, so its first word is not read as a name", () => {
    assert.ok(data.textCheck.leaks('a soldier: Reach the vehicle').includes('Reach'), 'Reach is a short form of a game title')
    const a = card('a')
    const sig = a.parts.signature
    const summary = 'Reach the target and fire one heavy shot.'
    const d = withPatternDoc(sig.pattern, doc => { doc.variants.find(v => v.id === sig.variant).summary = summary; return doc })
    a.text.signature.effect = summary
    a.text.pitch = `${a.text.pitch.slice(0, a.text.pitch.indexOf(': ') + 1)} ${summary}`
    assert.deepEqual(checkCard(a, d), [], fmt(checkCard(a, d)))
  })
  test('S11 controls: a key ability may sit on Q when the signature is passive, and only then', () => {
    const d = card('d') // a passive signature and one key extra, on R
    const smoke = d.text.how_it_plays.controls.find(c => c.input === data.rules.layout.next_ability)
    assert.ok(smoke, 'fixture d binds its extra to the next-ability key')
    smoke.input = data.rules.layout.signature
    assert.deepEqual(checkCard(d, data), [], fmt(checkCard(d, data)))
    const b = card('b') // a key signature on Q and a key extra
    const extra = b.text.how_it_plays.controls.find(c => c.input === data.rules.layout.next_ability)
    assert.ok(extra, 'fixture b binds its extra to the next-ability key')
    b.text.how_it_plays.controls.find(c => c.input === data.rules.layout.signature).input = data.rules.layout.fourth_key
    extra.input = data.rules.layout.signature
    has(b, 'S11')
  })
  test('T-b: no card text names a real game', () => {
    const a = card('a')
    a.matchups.counterplay[1] = 'Hit the shooter during its wind-up, as Company of Heroes players do.'
    has(a, 'T-b')
  })
  test('S11: the name is built by a template of the flavour', () => {
    const a = card('a')
    a.text.name = 'Girder-8' // 8 is not one of the Soviet numbers
    only(a, 'S11')
  })
  test('S11: pitch, effect and hook', () => {
    const a = card('a')
    a.text.signature.effect = 'Fires a big shot.'
    only(a, 'S11')
    const a2 = card('a')
    a2.text.team_play_hook.hook = 'counter-pick' // the first hook is setup-finisher; the Soviet flavour favours neither
    only(a2, 'S11')
    const a3 = card('a')
    a3.text.pitch = 'A medium Soviet vehicle: A heavy round.'
    only(a3, 'S11')
  })
  test('S11: as_user takes the first sentence of each extra', () => {
    const c = card('c')
    c.text.how_it_plays.as_user = c.text.how_it_plays.as_user.replace(' Then the key recharges.', '')
    assert.deepEqual(codes(c), [])
    const c2 = card('c')
    c2.text.how_it_plays.as_user += ' Then the key recharges.'
    only(c2, 'S11')
  })
  test('S11 with T-b: a summary that names a real game gives way to the neutral sentences', () => {
    const d = withPatternDoc('fire-power-shot', p => {
      p.variants.find(v => v.id === 'wind-up-shot').summary = 'Aim for a moment, as the Red Alert 2 tanks do, then fire one heavy round.'
      return p
    })
    const N = data.texts.neutral
    const a = card('a')
    a.text.signature.effect = N.signature_effect
    a.text.pitch = `A medium Soviet vehicle: ${N.pitch}`
    assert.deepEqual(checkCard(a, d), [], fmt(checkCard(a, d)))
    a.text.pitch = N.pitch // the neutral sentence alone is read as the pitch too
    assert.deepEqual(checkCard(a, d), [], fmt(checkCard(a, d)))
    only(card('a'), 'S11', d) // the old summary is no longer what the template builds
  })

  test('S11 with T-b: a counterplay line that names a real game gives way to the next passing line', () => {
    const d = withPatternDoc('fire-power-shot', p => {
      p.counterplay[0] = 'Watch for the wind-up, as Company of Heroes players learn to.'
      return p
    })
    const lines = data.patterns['fire-power-shot'].counterplay
    const a = card('a')
    a.matchups.counterplay = [lines[1], lines[2]]
    assert.deepEqual(checkCard(a, d), [], fmt(checkCard(a, d)))
    a.matchups.counterplay = [lines[1]] // the next passing line, shown once
    assert.deepEqual(checkCard(a, d), [], fmt(checkCard(a, d)))
    const b = card('a')
    b.matchups.counterplay = ['Watch for the wind-up, as Company of Heroes players learn to.', lines[1]]
    assert.deepEqual(codes(b, d), ['S11', 'T-b'])
  })

  test('S11: counterplay, inspiration and controls', () => {
    const b = card('b')
    b.matchups.counterplay.pop()
    only(b, 'S11')
    const b2 = card('b')
    b2.inspiration.source_units = ['ra1.allied.spy']
    only(b2, 'S11')
    const b3 = card('b')
    b3.text.how_it_plays.controls.pop() // the gunner's weapon has no entry
    only(b3, 'S11')
  })
})

describe('batches and the command', () => {
  test('validateCards maps each validator error back to its card, and keeps a card that breaks its schema out', () => {
    const bad = card('a')
    bad.parts.signature.kind = 'toggle' // fire-power-shot is only ever active
    const broken = card('a')
    delete broken.parts.tier
    const { problems, dataErrors } = validateCards([card('b'), bad, broken, card('c')], data)
    assert.deepEqual(dataErrors, [])
    assert.deepEqual(problems[0], [])
    assert.ok(problems[1].some(p => p.code === 'V' && /can't be a 'toggle' ability/.test(p.message)), fmt(problems[1]))
    assert.ok(problems[2].length && problems[2].every(p => p.code === 'CS'), fmt(problems[2]))
    assert.deepEqual(problems[3], [])
  })

  test('checkCards joins both', () => {
    const bad = card('a')
    bad.parts.signature.kind = 'toggle'
    const { problems } = checkCards([card('a'), bad], data)
    assert.deepEqual(problems[0], [])
    assert.ok(problems[1].some(p => p.code === 'V'))
  })

  test('the command: exit 0 when every card passes, 1 with a problem, 2 without a file', () => {
    const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' })
    const ok = run('--no-validator', ...Object.values(FILES).map(f => path.join(FIXTURES, f)))
    assert.equal(ok.status, 0, ok.stdout + ok.stderr)
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-cards-test-'))
    try {
      const a = card('a')
      a.balance.keys = 2
      const file = path.join(dir, 'cards.json')
      fs.writeFileSync(file, JSON.stringify([card('b'), a]))
      const bad = run(file)
      assert.equal(bad.status, 1, bad.stdout + bad.stderr)
      assert.match(bad.stdout, /cards\.json#1 K-g \/balance\/keys/)
      assert.doesNotMatch(bad.stdout, /cards\.json#0 /)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
    assert.equal(run().status, 2)
  })
})
