// Tests for roll steps 1 to 3 (src/core/roll.ts, steps.ts, draft.ts): the same seed gives the same result (I2, T1),
// each field draws from its own dice so a lock never moves another field's dice (T2), inputs and locks are always used
// (I1, G5), the class, tier, flavour and primary role are rolled by their rules (S1, section 1, G13, G14), and inputs no
// card can hold are reported as unavailable (T4).
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadGeneratorData } from '../scripts/lib/generator-data.mjs'
import { indexOf } from '../src/core/data.ts'
import { emptyParts } from '../src/core/draft.ts'
import { reachOf, roleProblem } from '../src/core/reach.ts'
import { roll, STEPS } from '../src/core/roll.ts'

const data = loadGeneratorData()
const ix = indexOf(data)
const CLASSES = ['infantry', 'vehicle', 'walker', 'hover', 'aircraft', 'drone']
const ROLES = ix.lists.get('roles').map(t => t.id)
const entry = (r, field) => r.trace.find(e => e.field === field)
const picked = r => ({ class: r.draft.parts.class, tier: r.draft.parts.tier, flavour: r.draft.parts.flavour, role: r.draft.parts.roles.primary })

describe('I2 and T1: the same request always gives the same result', () => {
  it('200 requests, each rolled twice, give identical drafts and traces', () => {
    for (let i = 0; i < 200; i++) {
      const req = { seed: `same-${i}`, spice: 1 + (i % 5), inputs: i % 7 === 0 ? { role: ROLES[i % ROLES.length] } : {} }
      assert.deepEqual(roll(data, req), roll(data, req), JSON.stringify(req))
    }
  })

  it('a different seed gives different dice', () => {
    const draws = new Set()
    for (let i = 0; i < 50; i++) draws.add(entry(roll(data, { seed: `seed-${i}`, spice: 3 }), 'roles.primary').draw)
    assert.ok(draws.size > 30)
  })

  it('rolling never changes the data object', () => {
    const before = JSON.stringify(data.rules) + JSON.stringify(data.vocab.roles) + JSON.stringify(data.patterns[0])
    roll(data, { seed: 'pure', spice: 2, locks: { roles: { primary: 'scout', secondary: [] } } })
    assert.equal(JSON.stringify(data.rules) + JSON.stringify(data.vocab.roles) + JSON.stringify(data.patterns[0]), before)
  })
})

describe('T2: each field has its own dice', () => {
  const seeds = Array.from({ length: 40 }, (_, i) => `own-dice-${i}`)
  // G7: a lock never moves another part's dice, but it can change which attempt passes the rules; draws are compared
  // between rolls decided on the same attempt.
  const sameAttempt = (a, b) => a.ok && b.ok && a.attempts === b.attempts

  it('locking the class at its own value keeps every other field, draw for draw', () => {
    let compared = 0
    for (const seed of seeds) {
      const free = roll(data, { seed, spice: 2 })
      const locked = roll(data, { seed, spice: 2, locks: { class: free.draft.parts.class } })
      assert.equal(entry(locked, 'class').how, 'locked')
      if (free.attempts !== 1) continue // a card from a later attempt: an earlier one may now pass (G7)
      compared++
      assert.deepEqual(picked(locked), picked(free), seed)
      for (const f of ['tier', 'flavour', 'roles.primary']) assert.equal(entry(locked, f).draw, entry(free, f).draw, `${seed} ${f}`)
    }
    assert.ok(compared >= 30, `only ${compared} cards came on the first attempt`)
  })

  it('locking the class at another value does not move the dice of the tier, the flavour or the role', () => {
    for (const seed of seeds) {
      const free = roll(data, { seed, spice: 2 })
      const other = CLASSES.find(c => c !== free.draft.parts.class)
      const locked = roll(data, { seed, spice: 2, locks: { class: other } })
      if (!sameAttempt(free, locked)) continue
      for (const f of ['tier', 'flavour']) {
        assert.equal(entry(locked, f).draw, entry(free, f).draw, `${seed} ${f}: same dice`)
        assert.equal(entry(locked, f).value, entry(free, f).value, `${seed} ${f}: same offer, so the same value`)
      }
      // The role's offer depends on the class, so its value may change; its dice may not: the same offer gives the same draw.
      const [a, b] = [entry(locked, 'roles.primary'), entry(free, 'roles.primary')]
      if (JSON.stringify(a.options) === JSON.stringify(b.options)) assert.equal(a.draw, b.draw, `${seed} roles.primary`)
    }
  })

  it('locking the tier or the flavour leaves the class roll alone', () => {
    for (const seed of seeds) {
      const free = roll(data, { seed, spice: 4 })
      const t = roll(data, { seed, spice: 4, locks: { tier: free.draft.parts.tier === 't1' ? 't3' : 't1' } })
      const f = roll(data, { seed, spice: 4, locks: { flavour: free.draft.parts.flavour === 'soviet' ? 'empire' : 'soviet' } })
      for (const r of [t, f]) {
        if (!sameAttempt(free, r)) continue
        assert.equal(entry(r, 'class').draw, entry(free, 'class').draw)
        assert.equal(r.draft.parts.class, free.draft.parts.class)
      }
    }
  })

  it('an input counts like a lock for the dice: choosing the tier the roll gave keeps everything', () => {
    for (const seed of seeds.slice(0, 10)) {
      const free = roll(data, { seed, spice: 3 })
      const chosen = roll(data, { seed, spice: 3, inputs: { tier: free.draft.parts.tier } })
      assert.equal(entry(chosen, 'tier').how, 'input')
      if (free.attempts === 1) assert.deepEqual(picked(chosen), picked(free))
    }
  })
})

describe('steps 1 and 2: class, tier and flavour', () => {
  it('an open class at spice 1 is never hover or drone (uncommon: above the spice gate)', () => {
    const seen = new Set()
    for (let i = 0; i < 300; i++) seen.add(roll(data, { seed: `class-${i}`, spice: 1 }).draft.parts.class)
    assert.deepEqual([...seen].sort(), ['aircraft', 'infantry', 'vehicle', 'walker'])
  })

  it('from spice 2 every class can come up, and tiers and flavours have equal odds', () => {
    const r = roll(data, { seed: 'odds', spice: 2 })
    assert.deepEqual(entry(r, 'class').options.map(o => o.id), CLASSES)
    assert.deepEqual(entry(r, 'tier').options, [{ id: 't1', weight: 1 }, { id: 't2', weight: 1 }, { id: 't3', weight: 1 }])
    assert.deepEqual(entry(r, 'flavour').options.map(o => o.weight), [1, 1, 1])
  })

  it('I1: a chosen or locked class is used even above the gate', () => {
    const r = roll(data, { seed: 'hover', spice: 1, inputs: { class: 'hover' } })
    assert.equal(r.draft.parts.class, 'hover')
    assert.equal(entry(r, 'class').how, 'input')
  })

  it('G5: a lock that needs a class above the gate gets the least rare class that fits, with the reason', () => {
    const lock = { mobility: { base: 'hover', handling: 'drift', traits: [] } }
    const r = roll(data, { seed: 'g5', spice: 1, locks: lock })
    assert.ok(['hover', 'drone'].includes(r.draft.parts.class))
    assert.match(entry(r, 'class').aboveGate, /least rare that fits is uncommon/)
  })

  it('a locked part\'s min_tier binds the tier roll', () => {
    for (let i = 0; i < 20; i++) assert.equal(roll(data, { seed: `huge-${i}`, spice: 5, locks: { size: 'huge' }, inputs: { class: 'vehicle' } }).draft.parts.tier, 't3')
  })
})

describe('step 3: the primary role', () => {
  it('G14: a rolled role is always one the card can hold at its spice, and favoured roles get x3', () => {
    for (let i = 0; i < 150; i++) {
      const r = roll(data, { seed: `role-${i}`, spice: 1 + (i % 2) })
      const p = r.draft.parts
      const R = reachOf(ix, { ...emptyParts(), class: p.class, tier: p.tier, flavour: p.flavour }, r.draft.spice, 'gate')
      assert.equal(roleProblem(ix, R, p.roles.primary), undefined, JSON.stringify(picked(r)))
      const e = entry(r, 'roles.primary')
      for (const o of e.options) {
        const favoured = ix.terms.get('faction-flavours').get(p.flavour).favoured.roles.includes(o.id)
        const common = 10 // the common weight at spice 1 and at spice 2 (section 3)
        assert.equal(o.weight, favoured ? common * 3 : common, `${o.id} for ${p.flavour}`)
      }
    }
  })

  it('G5: a chosen role is always used, on every class that can hold it, at spice 1', () => {
    for (const role of ROLES) {
      for (const cls of CLASSES) {
        const r = roll(data, { seed: `chosen-${role}-${cls}`, spice: 1, inputs: { role, class: cls } })
        if (role === 'transport' && (cls === 'infantry' || cls === 'drone')) {
          assert.equal(r.ok, false)
          continue
        }
        assert.equal(r.ok, true, `${role} on ${cls}: ${r.reason}`)
        assert.equal(r.draft.parts.roles.primary, role)
        assert.equal(entry(r, 'roles.primary').how, 'input')
      }
    }
  })

  it('a chosen role whose tools are above the gate is still used, and the trace says why', () => {
    const r = roll(data, { seed: 'engineer', spice: 1, inputs: { role: 'engineer', class: 'walker' } })
    assert.equal(r.draft.parts.roles.primary, 'engineer')
    assert.match(entry(r, 'roles.primary').aboveGate, /G5/)
  })

  it('with the class open, a chosen role keeps only classes that can hold it', () => {
    for (let i = 0; i < 30; i++) {
      const r = roll(data, { seed: `transport-${i}`, spice: 2, inputs: { role: 'transport' } })
      assert.ok(['vehicle', 'walker', 'hover', 'aircraft'].includes(r.draft.parts.class))
      assert.ok(entry(r, 'class').dropped.some(d => d.id === 'infantry'))
    }
  })

  it('the role passes its needs on to the later steps (G2, G13)', () => {
    const needs = role => roll(data, { seed: 'needs', spice: 3, inputs: { role, class: 'vehicle' } }).draft.needs.filter(n => n.by.startsWith('role:'))
    assert.deepEqual(needs('anti-air'), [{ links: ['hits:high-air'], by: 'role:anti-air', rule: 'G2', forced: true }])
    assert.deepEqual(needs('engineer').map(n => [n.rule, n.links.length]), [['G13', 4]])
    assert.deepEqual(needs('assault'), [
      { links: ['armour-class:>=medium'], by: 'role:assault', rule: 'G13', forced: true },
      { links: ['range:<=medium'], by: 'role:assault', rule: 'G13', forced: true, onPrimary: true },
    ])
  })
})

describe('unavailable inputs and bad requests', () => {
  it('T4: role transport on infantry or a drone is unavailable at once, for every tier, flavour and spice', () => {
    for (const cls of ['infantry', 'drone']) {
      for (const spice of [1, 3, 5]) {
        const r = roll(data, { seed: 'x', spice, inputs: { role: 'transport', class: cls } })
        assert.equal(r.ok, false)
        assert.equal(r.attempts, 1, 'no dice can change it, so it stops on the first attempt')
        assert.match(r.reason, /transport/)
      }
    }
  })

  it('a request that cannot be rolled says why', () => {
    const bad = req => roll(data, { seed: 's', spice: 2, ...req })
    assert.match(bad({ spice: 0 }).reason, /spice/)
    assert.match(bad({ spice: 6 }).reason, /spice/)
    assert.match(bad({ spice: 2.5 }).reason, /spice/)
    assert.match(bad({ seed: '' }).reason, /seed/)
    assert.match(bad({ inputs: { class: 'naval' } }).reason, /input class/)
    assert.match(bad({ inputs: { role: 'pilot' } }).reason, /input role/)
    assert.match(bad({ inputs: { class: 'vehicle' }, locks: { class: 'infantry' } }).reason, /differ/)
    assert.match(bad({ locks: { colour: 'red' } }).reason, /cannot be locked|can be locked/)
  })
})

describe('the steps follow the roll order', () => {
  it('the steps written so far are the first ones of rules.json roll_order', () => {
    assert.deepEqual(STEPS.map(s => s.id), data.rules.roll_order.slice(0, STEPS.length))
  })

  it('the trace has one entry per field, in the roll order', () => {
    const r = roll(data, { seed: 'trace', spice: 2 })
    const fields = r.trace.map(e => e.field)
    assert.deepEqual(fields.slice(0, 4), ['class', 'tier', 'flavour', 'roles.primary'])
    for (const e of r.trace.slice(0, 4)) assert.ok(e.candidates > 0 && Number.isInteger(e.draw) && e.how === 'rolled')
    const order = ['signature.pattern', 'mobility.base', 'body.plan', 'body.size', 'mobility.speed', 'mobility.traits', 'armour.class', 'sensors.sight', 'crew.model', 'armament.secondary', 'abilities', 'seats']
    const at = order.map(f => fields.indexOf(f))
    assert.ok(at.every(i => i > 3), `every step leaves a trace: ${order.filter((f, i) => at[i] < 0).join(', ')}`)
    assert.deepEqual(at, [...at].sort((a, b) => a - b), 'in the roll order')
  })
})
