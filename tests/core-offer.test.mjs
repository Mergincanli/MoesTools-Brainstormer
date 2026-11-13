// Tests for the offer filter (src/core/offer.ts): G1 (source-only terms, class bans, min_tier, allowed and excluded
// both ways, the classes and min_tier of parts already chosen), G2 (requires that can no longer hold), the two prose
// exemptions of the validator, G5 (the pool on the generator's own rolls and the least-rare fallback) and G16.
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadGeneratorData } from '../scripts/lib/generator-data.mjs'
import { indexOf } from '../src/core/data.ts'
import { diceFor } from '../src/core/dice.ts'
import { emptyParts } from '../src/core/draft.ts'
import { exempt, offerTerms, pickDistinct, poolOf, termProblem } from '../src/core/offer.ts'

const ix = indexOf(loadGeneratorData())
const draft = (fields = {}) => ({ ...emptyParts(), ...fields })
const offered = (fields, list, opts = {}, spice = 5) => offerTerms(ix, draft(fields), spice, list, opts).candidates.map(c => c.id)
const why = (fields, list, id, weapon) => termProblem(ix, draft(fields), list, id, weapon)

describe('G1: single-term rules', () => {
  it('a source-only term is never offered', () => {
    assert.ok(!offered({}, 'classes').includes('naval'))
    assert.match(why({}, 'classes', 'naval'), /research only/)
    assert.match(why({ class: 'vehicle' }, 'weapon-families', 'torpedoes', {}), /research only/)
    assert.match(why({ class: 'vehicle' }, 'mobility', 'naval-surface'), /research only/)
  })

  it('a term whose classes leave out the card\'s class is never offered', () => {
    assert.match(why({ class: 'vehicle' }, 'mobility', 'foot'), /not for class vehicle/)
    assert.match(why({ class: 'infantry' }, 'weapon-families', 'magnetic', {}), /not for class infantry/)
    assert.match(why({ class: 'infantry' }, 'on-death', 'pilot-eject'), /not for class infantry/)
    assert.deepEqual(offered({ class: 'aircraft' }, 'mobility'), ['rotor', 'jet', 'airship'])
  })

  it('a term is offered only from its min_tier', () => {
    assert.match(why({ class: 'vehicle', tier: 't1' }, 'sizes', 'huge'), /starts at t3/)
    assert.match(why({ class: 'aircraft', tier: 't2' }, 'mobility', 'airship'), /starts at t3/)
    assert.equal(why({ class: 'aircraft', tier: 't3' }, 'mobility', 'airship'), undefined)
    assert.match(why({ class: 'vehicle', tier: 't1' }, 'weapon-traits', 'stun', { family: 'cannon' }), /starts at t2/)
  })
})

describe('G1: allowed and excluded, both ways', () => {
  it('its own allowed map: a humanoid body only comes in size small', () => {
    assert.match(why({ class: 'infantry', body: { size: 'medium' } }, 'bodies', 'humanoid'), /allowed\.sizes leaves out medium/)
  })

  it('theirs: the class drone allows only sizes tiny and small', () => {
    assert.deepEqual(offered({ class: 'drone', tier: 't3' }, 'sizes'), ['tiny', 'small'])
    assert.match(why({ class: 'drone', tier: 't3' }, 'sizes', 'medium'), /classes drone allows only tiny, small/)
  })

  it('theirs: a hull-turret body allows only some mobility', () => {
    assert.deepEqual(offered({ class: 'walker', body: { plan: 'hull-turret' } }, 'mobility'), ['legs-multi'])
  })

  it('excluded both ways: the driver-gunner crew and the power-suit body never meet', () => {
    assert.match(why({ class: 'walker', body: { plan: 'power-suit' } }, 'crew-models', 'driver-gunner'), /excludes bodies power-suit/)
    assert.match(why({ class: 'walker', crew: { model: 'driver-gunner' } }, 'bodies', 'power-suit'), /crew-models driver-gunner excludes it/)
  })

  it('theirs, for the class: a chosen part\'s classes bind the class offered', () => {
    assert.deepEqual(offered({ mobility: { base: 'foot' } }, 'classes'), ['infantry'])
    assert.deepEqual(offered({ armament: { primary: { family: 'bombs' } } }, 'classes'), ['infantry', 'aircraft', 'drone'])
    assert.deepEqual(offered({ roles: { primary: 'transport' } }, 'classes'), ['vehicle', 'walker', 'hover', 'aircraft'])
  })

  it('theirs, for the tier: a chosen part\'s min_tier binds the tier offered', () => {
    assert.deepEqual(offered({ class: 'vehicle', body: { size: 'huge' } }, 'tiers'), ['t3'])
    assert.match(why({ class: 'vehicle', body: { size: 'huge' } }, 'tiers', 't1'), /sizes huge starts at t3/)
  })

  it('a chosen ability\'s pattern binds the class and the tier (A1)', () => {
    const sig = { signature: { pattern: 'infest-vehicle', variant: 'latched-control' } } // classes infantry, aircraft, drone; min_tier t3
    assert.deepEqual(offered(sig, 'classes'), ['infantry', 'aircraft', 'drone'])
    assert.deepEqual(offered({ ...sig, class: 'drone' }, 'tiers'), ['t3'])
  })

  it('a weapon part: the family\'s allowed map binds the delivery, and a body binds the mount', () => {
    assert.deepEqual(offered({ class: 'vehicle' }, 'weapon-delivery', { weapon: { family: 'artillery' } }), ['lobbed'])
    assert.deepEqual(offered({ class: 'vehicle', body: { plan: 'casemate' } }, 'aim-models', { weapon: { family: 'cannon' } }), ['body-aim', 'limited-arc'])
  })
})

describe('G2: requires', () => {
  it('a requires group that can no longer hold drops the term', () => {
    const solo = { class: 'vehicle', crew: { model: 'solo', passengers: null } }
    assert.match(why(solo, 'armour-models', 'crew-casualties'), /requires one of crew:driver-gunner, crew:driver-gunner-commander, passengers:>=1/)
    assert.match(why({ class: 'vehicle', crew: { passengers: null } }, 'roles', 'transport'), /requires one of passengers:>=2/)
  })

  it('a group that is still open keeps the term (a later step must set it)', () => {
    assert.equal(why({ class: 'vehicle' }, 'armour-models', 'crew-casualties'), undefined)
    assert.equal(why({ class: 'vehicle', crew: { model: 'driver-gunner' } }, 'armour-models', 'crew-casualties'), undefined)
  })

  it('a weapon delivery\'s requires: a dropped weapon needs a flier', () => {
    const ground = { class: 'vehicle', mobility: { base: 'tracks' }, body: { size: 'large' } }
    assert.match(why(ground, 'weapon-delivery', 'drop', { family: 'chemical' }), /requires one of target:low-air, target:high-air/)
    assert.equal(why({ class: 'aircraft', mobility: { base: 'jet' } }, 'weapon-delivery', 'drop', { family: 'bombs' }), undefined)
  })
})

describe('the validator\'s two prose exemptions', () => {
  it('the anti-air trait lifts a family that reaches low air to high air', () => {
    const base = { class: 'vehicle' }
    assert.match(why(base, 'target-types', 'high-air', { family: 'machine-gun', delivery: 'hitscan' }), /allows only/)
    assert.equal(why(base, 'target-types', 'high-air', { family: 'machine-gun', delivery: 'hitscan', traits: ['anti-air'] }), undefined)
    // A delivery still binds it: a lobbed shot never hits fliers.
    assert.match(why(base, 'target-types', 'high-air', { family: 'rockets', delivery: 'lobbed', traits: ['anti-air'] }), /weapon-delivery lobbed allows only/)
  })

  it('an adaptive weapon is bound by no list of allowed families', () => {
    assert.equal(exempt(ix, 'any-list', 'weapon-families', 'adaptive'), true)
    assert.equal(exempt(ix, 'any-list', 'weapon-families', 'cannon'), false)
  })
})

describe('G5: the pool', () => {
  const fields = { class: 'vehicle', tier: 't1', flavour: 'allied' }
  it('the generator\'s own roll takes only parts at the spice gate', () => {
    const c = offerTerms(ix, draft(fields), 1, 'sensor-traits').candidates
    assert.ok(c.length > 0, 'the sensor traits fit the hard rules')
    assert.deepEqual(poolOf(ix, c, 'gate', 1).items, [], 'every sensor trait is uncommon: none at spice 1')
  })

  it('a part an input or a lock needs falls back to the least rare parts that fit, with the reason', () => {
    const c = offerTerms(ix, draft({ mobility: { base: 'hover' } }), 1, 'classes').candidates
    assert.deepEqual(c.map(x => x.id), ['hover', 'drone'])
    assert.deepEqual(poolOf(ix, c, 'gate', 1).items, [])
    const pool = poolOf(ix, c, 'forced', 1)
    assert.deepEqual(pool.items, [{ id: 'hover', weight: 4 }, { id: 'drone', weight: 4 }])
    assert.match(pool.fallback, /least rare that fits is uncommon/)
  })

  it('the fallback picks the least rare: uncommon before rare', () => {
    const c = offerTerms(ix, draft({ class: 'vehicle', tier: 't1', flavour: 'soviet' }), 1, 'weapon-families', { weapon: {}, only: ['prism', 'shotgun'] }).candidates
    assert.deepEqual(poolOf(ix, c, 'forced', 1).items.map(i => i.id), ['shotgun'])
  })

  it('when something at the gate fits, the forced pool is the same as the gate pool', () => {
    const c = offerTerms(ix, draft(fields), 1, 'mobility').candidates
    assert.deepEqual(poolOf(ix, c, 'forced', 1), poolOf(ix, c, 'gate', 1))
  })
})

describe('G16: take what fits', () => {
  it('a count of two at spice 1 takes no sensor trait, and two distinct ones at spice 2', () => {
    const fields = { class: 'vehicle', tier: 't1', flavour: 'allied' }
    const pool = spice => () => poolOf(ix, offerTerms(ix, draft(fields), spice, 'sensor-traits').candidates, 'gate', spice)
    assert.deepEqual(pickDistinct(diceFor('g16', 'sensors.traits', 1), 2, pool(1)), [])
    const two = pickDistinct(diceFor('g16', 'sensors.traits', 1), 2, pool(2))
    assert.equal(two.length, 2)
    assert.notEqual(two[0], two[1])
  })

  it('a count larger than the pool takes the whole pool', () => {
    const items = [{ id: 'a', weight: 1 }, { id: 'b', weight: 5 }]
    assert.deepEqual(pickDistinct(diceFor('g16', 'x', 1), 5, () => ({ items })).sort(), ['a', 'b'])
  })
})
