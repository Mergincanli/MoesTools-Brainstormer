// Tests for "can hold" (src/core/reach.ts): the roles a card can hold at its spice (G13, G14) against the rule
// sheet's figures, the roles a chosen input can always get (G5, T4), and the pattern rules the model applies when it
// decides whether a pattern's variant can be offered (A1, G5, G6, HC2 to HC4, M2).
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadGeneratorData } from '../scripts/lib/generator-data.mjs'
import { blockOf, indexOf } from '../src/core/data.ts'
import { emptyParts } from '../src/core/draft.ts'
import { patternOdds } from '../src/core/odds.ts'
import { canMeet, reachOf, roleProblem, variantProblem } from '../src/core/reach.ts'

const ix = indexOf(loadGeneratorData())
const CLASSES = ['infantry', 'vehicle', 'walker', 'hover', 'aircraft', 'drone']
const TIERS = ['t1', 't2', 't3']
const FLAVOURS = ['soviet', 'allied', 'empire']
const reach = (cls, tier, flavour, spice, mode = 'gate') => reachOf(ix, { ...emptyParts(), class: cls, tier, flavour }, spice, mode)
const combos = () => FLAVOURS.flatMap(f => CLASSES.flatMap(c => TIERS.map(t => ({ c, t, f }))))

/** Where (class/tier/flavour) a role can be held, at a spice and in a mode. */
function whereHeld(role, spice, mode = 'gate') {
  return combos().filter(({ c, t, f }) => roleProblem(ix, reach(c, t, f, spice, mode), role) === undefined).map(({ c, t, f }) => `${c}/${t}/${f}`)
}

describe('G14: roles the generator can roll at spice 1 (the sheet\'s figures, feasibility.mjs)', () => {
  it('engineer in 3 of the 54 combinations: Allied infantry, where capture-structure leans common', () => {
    assert.deepEqual(whereHeld('engineer', 1), ['infantry/t1/allied', 'infantry/t2/allied', 'infantry/t3/allied'])
  })

  it('logistics in 12: Soviet infantry, vehicles, hovercraft and drones, where gather-resources leans common', () => {
    const w = whereHeld('logistics', 1)
    assert.equal(w.length, 12)
    assert.ok(w.every(x => x.endsWith('/soviet') && !x.startsWith('walker') && !x.startsWith('aircraft')))
  })

  it('infiltrator in 27', () => {
    assert.equal(whereHeld('infiltrator', 1).length, 27)
  })

  it('support and buffer cannot be rolled in 18 combinations each', () => {
    const support = whereHeld('support', 1)
    const buffer = whereHeld('buffer', 1)
    assert.equal(54 - support.length, 18)
    assert.equal(54 - buffer.length, 18)
    assert.ok(support.every(x => !x.startsWith('walker') && !x.startsWith('drone')), 'resupply-allies is uncommon on walkers and drones')
    assert.ok(buffer.every(x => !x.startsWith('aircraft') && !x.startsWith('drone')), 'rally-allies is uncommon on aircraft and drones')
  })

  it('the other roles of the word list can be rolled everywhere, except transport (see the next test)', () => {
    for (const r of ['assault', 'anti-armour', 'anti-infantry', 'anti-air', 'siege', 'marksman', 'scout', 'disabler', 'raider', 'area-denial']) {
      assert.equal(whereHeld(r, 1).length, 54, r)
    }
  })

  it('transport in 30, not the 36 of feasibility.mjs: seats come only from a pattern that brings them (G13, section 7)', () => {
    const w = whereHeld('transport', 1)
    assert.equal(w.length, 30)
    // Walkers: carry-passengers is uncommon on a walker, and passenger-sets-weapon implies an adaptive weapon (rare),
    // except its fire-ports variant, which leans Allied: only Allied walkers keep the role at spice 1.
    assert.deepEqual(w.filter(x => x.startsWith('walker')), ['walker/t1/allied', 'walker/t2/allied', 'walker/t3/allied'])
    assert.equal(variantProblem(ix, reach('walker', 't1', 'allied', 1), 'passenger-sets-weapon', 'fire-ports'), undefined)
    assert.match(variantProblem(ix, reach('walker', 't1', 'allied', 1), 'passenger-sets-weapon', 'class-swap'), /weapon:adaptive/)
  })
})

describe('G5 and T4: a role the user chooses can be held everywhere but one place', () => {
  it('in forced mode every role can be held in every combination, except transport on infantry or a drone', () => {
    for (const r of ix.lists.get('roles').map(t => t.id)) {
      const w = whereHeld(r, 1, 'forced')
      if (r === 'transport') {
        assert.equal(w.length, 36)
        assert.ok(w.every(x => !x.startsWith('infantry') && !x.startsWith('drone')))
      } else assert.equal(w.length, 54, r)
    }
  })
})

describe('the patterns the model offers (section 4)', () => {
  it('signature candidates: at spice 1 from 8 (Soviet aircraft T1) to 28; at spice 5 from 36 (aircraft T1) to 62 (walker T3)', () => {
    const count = (c, t, f, s) => [...reach(c, t, f, s).patterns.values()].filter(p => p.signature.length > 0).length
    const one = combos().map(({ c, t, f }) => count(c, t, f, 1))
    assert.equal(Math.min(...one), 8)
    assert.equal(Math.max(...one), 28)
    assert.equal(count('aircraft', 't1', 'soviet', 1), 8)
    const five = CLASSES.flatMap(c => TIERS.map(t => count(c, t, 'soviet', 5)))
    assert.equal(Math.min(...five), 36)
    assert.equal(Math.max(...five), 62)
    assert.equal(count('aircraft', 't1', 'soviet', 5), 36)
    assert.equal(count('walker', 't3', 'soviet', 5), 62)
  })

  it('G5: repair-allies is out at spice 1 in the 36 combinations its own rarity allows: the repair tool it implies is uncommon', () => {
    let rarityOk = 0
    for (const { c, t, f } of combos()) {
      const R = reach(c, t, f, 1)
      assert.ok(!R.patterns.has('repair-allies'), `${c}/${t}/${f}`)
      if (!patternOdds(ix, blockOf(ix.patternById.get('repair-allies'), null), { class: c, flavour: f, spice: 1 }).aboveGate) rarityOk++
    }
    assert.equal(rarityOk, 36)
    assert.match(variantProblem(ix, reach('infantry', 't1', 'allied', 1), 'repair-allies', 'repair-beam'), /implied weapon:repair-tool/)
  })

  it('a pattern that implies a role brings the role with it (resupply-allies, capture-structure take-over)', () => {
    assert.ok(reach('infantry', 't1', 'soviet', 1).patterns.has('resupply-allies'))
    assert.equal(variantProblem(ix, reach('infantry', 't1', 'allied', 1), 'capture-structure', 'take-over'), undefined)
  })

  it('M2: a strength or weakness link is set like an implied part (infest-vehicle\'s melee range)', () => {
    assert.equal(variantProblem(ix, reach('infantry', 't1', 'soviet', 1), 'infest-vehicle', 'gnaw'), undefined)
  })

  it('G6: a part the flavour avoids cannot be set below spice 3, so a pattern that implies it is not offered', () => {
    assert.equal(canMeet(ix, reach('vehicle', 't1', 'soviet', 2), 'armour-model:regen-shield'), false)
    assert.equal(canMeet(ix, reach('vehicle', 't1', 'soviet', 3), 'armour-model:regen-shield'), true)
    assert.equal(canMeet(ix, reach('vehicle', 't3', 'allied', 1), 'mobility-trait:crush'), false)
    assert.equal(canMeet(ix, reach('vehicle', 't3', 'allied', 3), 'mobility-trait:crush'), true)
    assert.equal(canMeet(ix, reach('vehicle', 't3', 'allied', 1, 'forced'), 'mobility-trait:crush'), true, 'an input or a lock may still need it')
  })
})

describe('hard control (section 6)', () => {
  it('HC4: a hard-control variant whose pattern states no escape is never offered', () => {
    const R = reach('infantry', 't3', 'soviet', 5)
    assert.match(variantProblem(ix, R, 'confuse-enemies', 'curse-one-ally'), /HC4/)
    assert.match(variantProblem(ix, reach('vehicle', 't3', 'allied', 5), 'passenger-sets-weapon', 'tool-seat'), /HC4/)
  })

  it('HC3: a stun takes only kinds that use a key, so a passive-only stun is never offered', () => {
    assert.match(variantProblem(ix, reach('infantry', 't3', 'empire', 5), 'mind-control', 'auto-capture-field'), /A3, HC3/)
  })

  it('HC2: a stun waits for T2, even a borderline one the data opens at T1', () => {
    assert.match(variantProblem(ix, reach('vehicle', 't1', 'soviet', 5), 'suppress-with-fire', 'knockdown-barrage'), /HC2/)
    assert.doesNotMatch(variantProblem(ix, reach('vehicle', 't2', 'soviet', 5), 'suppress-with-fire', 'knockdown-barrage') ?? '', /HC2/)
  })

  it('HC6: a latch may appear at T1', () => {
    assert.equal(variantProblem(ix, reach('infantry', 't1', 'soviet', 5), 'infest-vehicle', 'tracker'), undefined)
  })

  it('HC1: the stun trait is never a card weapon\'s trait', () => {
    for (const s of [1, 5]) assert.equal(canMeet(ix, reach('vehicle', 't3', 'empire', s), 'weapon-trait:stun'), false)
    assert.equal(canMeet(ix, reach('vehicle', 't3', 'empire', 5), 'weapon-trait:root'), true)
  })
})
