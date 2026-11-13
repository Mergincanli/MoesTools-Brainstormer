// Tests for the odds of the rule sheet's section 3 (src/core/odds.ts and the offer filter's pool): the spice table
// value by value, the sheet's own example, class rarity (S3) and the favoured step (S2), avoided parts (S4, G6), a
// pattern's flavour lean (S5), role weights (G14) and the default rarity (G9).
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadGeneratorData } from '../scripts/lib/generator-data.mjs'
import { blockOf, indexOf } from '../src/core/data.ts'
import { emptyParts } from '../src/core/draft.ts'
import { atGate, patternOdds, spiceWeight, termOdds } from '../src/core/odds.ts'
import { offerTerms, poolOf } from '../src/core/offer.ts'
import { variantPool } from '../src/core/patterns.ts'

const ix = indexOf(loadGeneratorData())
const weight = (list, id, cls, flavour, spice) => termOdds(ix, list, id, { class: cls, flavour, spice }).weight
const draft = fields => ({ ...emptyParts(), ...fields })
const poolIds = (fields, list, spice, mode = 'gate') =>
  Object.fromEntries(poolOf(ix, offerTerms(ix, draft(fields), spice, list).candidates, mode, spice).items.map(i => [i.id, i.weight]))

describe('S1: the spice table of section 3', () => {
  const table = { common: [10, 10, 8, 6, 5], uncommon: [0, 4, 5, 6, 6], rare: [0, 0, 0, 3, 5] }
  const minSpice = { common: 1, uncommon: 2, rare: 4 }
  for (const [rarity, row] of Object.entries(table)) {
    it(`${rarity}: weights ${row.join(', ')} and offered from spice ${minSpice[rarity]}`, () => {
      for (let s = 1; s <= 5; s++) {
        assert.equal(spiceWeight(ix, rarity, s), row[s - 1], `${rarity} at spice ${s}`)
        assert.equal(atGate(ix, rarity, s), s >= minSpice[rarity], `${rarity} at the gate at spice ${s}`)
      }
    })
  }
})

describe('the sheet\'s example: a Soviet vehicle at spice 1', () => {
  it('tesla 30 (uncommon stepped to common, x3), machine gun 30, autocannon 10, prism 0', () => {
    assert.equal(weight('weapon-families', 'tesla', 'vehicle', 'soviet', 1), 30)
    assert.equal(weight('weapon-families', 'machine-gun', 'vehicle', 'soviet', 1), 30)
    assert.equal(weight('weapon-families', 'autocannon', 'vehicle', 'soviet', 1), 10)
    assert.equal(weight('weapon-families', 'prism', 'vehicle', 'soviet', 1), 0)
  })

  it('the offer filter gives the same weights for the card\'s weapon', () => {
    const offer = offerTerms(ix, draft({ class: 'vehicle', tier: 't1', flavour: 'soviet' }), 1, 'weapon-families', { weapon: {} })
    const w = Object.fromEntries(offer.candidates.map(c => [c.id, c.odds.weight]))
    assert.deepEqual([w.tesla, w['machine-gun'], w.autocannon, w.prism], [30, 30, 10, 0])
    const pool = poolOf(ix, offer.candidates, 'gate', 1).items.map(i => i.id)
    assert.ok(pool.includes('tesla') && !pool.includes('prism'), 'prism is above the spice gate and is not rolled')
  })
})

describe('S3 class rarity and S2 the favoured step', () => {
  it('a class_rarity replaces the rarity: a shotgun is uncommon, but rare on an aircraft', () => {
    assert.equal(weight('weapon-families', 'shotgun', 'vehicle', 'allied', 2), 4)
    assert.equal(weight('weapon-families', 'shotgun', 'aircraft', 'allied', 2), 0)
    assert.equal(weight('weapon-families', 'shotgun', 'aircraft', 'allied', 4), 3)
    assert.equal(termOdds(ix, 'weapon-families', 'shotgun', { class: 'aircraft', flavour: 'allied', spice: 4 }).byClass, true)
  })

  it('a favoured part counts one step more common: an Allied prism (rare) rolls from spice 2, x3', () => {
    assert.equal(weight('weapon-families', 'prism', 'vehicle', 'allied', 1), 0)
    assert.equal(weight('weapon-families', 'prism', 'vehicle', 'allied', 2), 12)
    assert.equal(termOdds(ix, 'weapon-families', 'prism', { class: 'vehicle', flavour: 'allied', spice: 2 }).rarity, 'uncommon')
  })

  it('the step never applies where a class rarity does; the x3 still does', () => {
    // A Soviet flamethrower: favoured; uncommon on a vehicle (stepped to common), rare on an aircraft (class rarity).
    assert.equal(weight('weapon-families', 'flamethrower', 'vehicle', 'soviet', 1), 30)
    for (const s of [1, 2, 3]) assert.equal(weight('weapon-families', 'flamethrower', 'aircraft', 'soviet', s), 0)
    assert.equal(weight('weapon-families', 'flamethrower', 'aircraft', 'soviet', 4), 9)
    // A Soviet cannon on infantry: rare by class, favoured.
    assert.equal(weight('weapon-families', 'cannon', 'infantry', 'soviet', 3), 0)
    assert.equal(weight('weapon-families', 'cannon', 'infantry', 'soviet', 4), 9)
    // An Allied prism on a drone: rare by class, so no step to uncommon.
    assert.equal(weight('weapon-families', 'prism', 'drone', 'allied', 2), 0)
  })

  it('a common favoured part stays common and gets x3', () => {
    assert.equal(weight('weapon-families', 'machine-gun', 'walker', 'soviet', 5), 15)
  })

  it('class rarity of the class itself: hover and drone are uncommon, so an open class never rolls them at spice 1', () => {
    assert.deepEqual(poolIds({}, 'classes', 1), { infantry: 10, vehicle: 10, walker: 10, aircraft: 10 })
    assert.deepEqual(poolIds({}, 'classes', 2), { infantry: 10, vehicle: 10, walker: 10, hover: 4, aircraft: 10, drone: 4 })
  })
})

describe('S4 and G6: avoided parts', () => {
  it('a Soviet card holds back teleport and the shields below spice 3', () => {
    for (const s of [1, 2]) {
      assert.equal(termOdds(ix, 'mobility-traits', 'teleport', { class: 'infantry', flavour: 'soviet', spice: s }).held, true)
      assert.equal(termOdds(ix, 'armour-models', 'regen-shield', { class: 'vehicle', flavour: 'soviet', spice: s }).held, true)
    }
    assert.equal(termOdds(ix, 'armour-models', 'regen-shield', { class: 'vehicle', flavour: 'soviet', spice: 3 }).held, false)
    assert.equal(termOdds(ix, 'armour-models', 'regen-shield', { class: 'vehicle', flavour: 'allied', spice: 2 }).held, false)
  })

  it('below spice 3 a held-back part is not in the pool; from spice 3 it is', () => {
    const fields = { class: 'vehicle', tier: 't3', flavour: 'empire' } // the Empire avoids huge
    assert.ok(!('huge' in poolIds(fields, 'sizes', 2)), 'huge is held back at spice 2')
    assert.equal(poolIds(fields, 'sizes', 3).huge, 8, 'huge is offered at spice 3, at the default (common) weight')
    const models = poolIds({ class: 'vehicle', tier: 't1', flavour: 'soviet' }, 'armour-models', 2)
    assert.ok(!('regen-shield' in models) && !('charge-shield' in models) && 'zonal' in models)
    assert.ok('regen-shield' in poolIds({ class: 'vehicle', tier: 't1', flavour: 'soviet' }, 'armour-models', 3))
  })

  it('when an input or a lock needs a held-back part and nothing else fits, it is used, with the reason (G5)', () => {
    const fields = { class: 'vehicle', tier: 't3', flavour: 'empire', body: { plan: 'multi-turret' } } // multi-turret allows huge only
    const offer = offerTerms(ix, draft(fields), 2, 'sizes')
    assert.deepEqual(offer.candidates.map(c => c.id), ['huge'])
    assert.deepEqual(poolOf(ix, offer.candidates, 'gate', 2).items, [])
    const forced = poolOf(ix, offer.candidates, 'forced', 2)
    assert.deepEqual(forced.items.map(i => i.id), ['huge'])
    assert.match(forced.fallback, /hold back/)
  })
})

describe('S5: a pattern\'s flavour lean counts as favoured', () => {
  const odds = (id, cls, flavour, spice) => patternOdds(ix, blockOf(ix.patternById.get(id), null), { class: cls, flavour, spice })
  it('infest-vehicle leans Soviet: uncommon becomes common and x3 for Soviet infantry', () => {
    assert.equal(odds('infest-vehicle', 'infantry', 'soviet', 1).weight, 30)
    assert.equal(odds('infest-vehicle', 'infantry', 'allied', 1).weight, 0)
    assert.equal(odds('infest-vehicle', 'infantry', 'allied', 2).weight, 4)
  })
  it('the lean takes no step where a class rarity applies (infest-vehicle is rare on an aircraft)', () => {
    assert.equal(odds('infest-vehicle', 'aircraft', 'soviet', 3).weight, 0)
    assert.equal(odds('infest-vehicle', 'aircraft', 'soviet', 4).weight, 9)
  })
})

describe('S6: variants', () => {
  const ids = p => ix.patternById.get(p).variants.map(v => v.id)
  const pool = (p, spice, mode = 'gate') => variantPool(ix.patternById.get(p), ids(p), spice, mode)
  it('equal odds among the variants whose min_spice is at most the card\'s spice', () => {
    assert.deepEqual(pool('infest-vehicle', 1).items, [{ id: 'gnaw', weight: 1 }, { id: 'anchor', weight: 1 }, { id: 'tracker', weight: 1 }])
    assert.equal(pool('infest-vehicle', 2).items.length, 6)
    assert.equal(pool('infest-vehicle', 5).items.length, 10)
  })
  it('no variant at spice 1 (sacrifice-for-allies): none on the generator\'s own roll, the least wild when needed (G5)', () => {
    assert.deepEqual(pool('sacrifice-for-allies', 1).items, [])
    const forced = pool('sacrifice-for-allies', 1, 'forced')
    assert.deepEqual(forced.items.map(i => i.id), ['spend-minion', 'spend-follower'])
    assert.match(forced.fallback, /least wild/)
  })
})

describe('G14 role weights and G9 the default rarity', () => {
  it('a role has the common weight, three times as likely when the flavour favours it', () => {
    assert.equal(weight('roles', 'assault', 'vehicle', 'soviet', 1), 30)
    assert.equal(weight('roles', 'scout', 'vehicle', 'soviet', 1), 10)
    assert.equal(weight('roles', 'scout', 'vehicle', 'allied', 1), 30)
    assert.equal(weight('roles', 'assault', 'vehicle', 'soviet', 5), 15)
  })
  it('a term with no rarity counts as common', () => {
    assert.equal(termOdds(ix, 'sizes', 'medium', { class: 'vehicle', flavour: 'soviet', spice: 3 }).rarity, 'common')
    assert.equal(weight('sizes', 'medium', 'vehicle', 'soviet', 3), 8)
    assert.equal(weight('sizes', 'large', 'vehicle', 'soviet', 3), 24, 'the Soviet flavour favours large')
  })
})
