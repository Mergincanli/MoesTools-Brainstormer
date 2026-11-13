// Tests for step 4 (the signature) and step 14 (the extra abilities): which patterns and variants can be offered
// (A1, A6, and the four variants the hard-control rules keep off cards), the role's tool (G13), implied patterns as
// extras (A8), the weights (S1, S5, role_weight), locked abilities (I1), and the same-mechanic gate in its two shapes
// (A6, A7, A11).
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadGeneratorData } from '../scripts/lib/generator-data.mjs'
import { variantDraftProblem } from '../src/core/abilities.ts'
import { blockOf, indexOf } from '../src/core/data.ts'
import { newDraft } from '../src/core/draft.ts'
import { newMemo } from '../src/core/needs.ts'
import { patternOdds } from '../src/core/odds.ts'
import { mayJoin } from '../src/core/patterns.ts'
import { roll } from '../src/core/roll.ts'
import { reachesFor, signatureChoices } from '../src/core/step-signature.ts'
import { stepClass, stepPrimaryRole, stepTierFlavour } from '../src/core/steps.ts'

const data = loadGeneratorData()
const ix = indexOf(data)
const CLASSES = ['infantry', 'vehicle', 'walker', 'hover', 'aircraft', 'drone']
const TIERS = ['t1', 't2', 't3']
const entry = (r, field) => r.trace.find(e => e.field === field)
const abilitiesOf = r => [r.draft.parts.signature, ...r.draft.parts.abilities]

/** A draft after step 3 for these inputs. */
function draftAt(inputs, spice) {
  const d = newDraft({ seed: 'abilities', spice, inputs }, 1)
  for (const step of [stepClass, stepTierFlavour, stepPrimaryRole]) assert.ok(step(ix, d).ok)
  return d
}

describe('A1 and A6: which patterns and variants can be offered', () => {
  it('every variant can be offered for some input at spice 5, but the four the hard-control rules keep off cards', () => {
    const offered = new Set()
    for (const role of ['anti-infantry', 'assault', 'scout']) {
      for (const cls of CLASSES) {
        for (const tier of TIERS) {
          const d = draftAt({ class: cls, tier, flavour: 'soviet', role }, 5)
          const rs = reachesFor(ix, d)
          for (const c of signatureChoices(ix, d, rs).choices) for (const v of c.variants) offered.add(`${c.pattern}/${v}`)
          const memo = newMemo()
          for (const [id, pr] of rs.gate.patterns) for (const v of pr.extra) if (variantDraftProblem(ix, d, d.parts, rs, id, v, 'extra', false, memo) === undefined) offered.add(`${id}/${v}`)
        }
      }
    }
    // A variant that needs a signature-only pattern can only be an extra on a card whose signature is that pattern.
    const missing = data.patterns.flatMap(p => p.variants.map(v => `${p.id}/${v.id}`)).filter(x => !offered.has(x))
    const left = missing.filter(x => {
      const [pid, vid] = x.split('/')
      const needs = blockOf(ix.patternById.get(pid), vid).requires.flat().filter(l => l.startsWith('pattern:')).map(l => l.slice(8))
      for (const sig of needs.filter(n => ix.patternById.get(n)?.generator?.slot === 'signature')) {
        for (const cls of CLASSES) for (const tier of TIERS) {
          const d = draftAt({ class: cls, tier, flavour: 'empire', role: 'anti-infantry' }, 5)
          const c = signatureChoices(ix, d, reachesFor(ix, d)).choices.find(x => x.pattern === sig)
          if (!c) continue
          const v = c.variants[0]
          d.parts = { ...d.parts, signature: { pattern: sig, variant: v, kind: blockOf(ix.patternById.get(sig), v).kinds[0], cooldown: null } }
          if (variantDraftProblem(ix, d, d.parts, reachesFor(ix, d), pid, vid, 'extra', false, newMemo()) === undefined) return false
        }
      }
      return true
    })
    assert.deepEqual(left.sort(), ['confuse-enemies/curse-one-ally', 'dash/pin-charge', 'mind-control/auto-capture-field', 'passenger-sets-weapon/tool-seat'])
  })

  it('G13: when the role needs a tool and one fits, the signature is drawn among the tools only; its weight is the pattern odds (S1, S5, A1)', () => {
    let toolsOnly = 0
    let asExtra = 0
    for (let i = 0; i < 60; i++) {
      const r = roll(data, { seed: `pool-${i}`, spice: 1 + (i % 5), inputs: { role: i % 2 ? 'engineer' : null } })
      const e = entry(r, 'signature.pattern')
      assert.ok(e.options.some(o => o.id === e.value), 'the drawn pattern was offered')
      const p = r.draft.parts
      const fit = data.rules.role_fit[p.roles.primary]?.patterns ?? []
      if (fit.length) {
        // "The signature when one fits, otherwise an extra ability": the pool is all tools, or holds none.
        const tools = e.options.filter(o => fit.includes(o.id)).length
        assert.ok(tools === 0 || tools === e.options.length, `${p.roles.primary}: ${tools} tools among ${e.options.length}`)
        if (tools) toolsOnly++
        else {
          assert.ok(p.abilities.some(a => fit.includes(a.pattern)), 'no tool as the signature: one comes as an extra')
          asExtra++
        }
      }
      for (const o of e.options) {
        if (entry(r, 'signature.pattern').aboveGate) break
        const best = Math.max(...ix.patternById.get(o.id).variants.map(v => patternOdds(ix, blockOf(ix.patternById.get(o.id), v.id), { class: p.class, flavour: p.flavour, spice: r.draft.spice }).weight))
        assert.ok(o.weight <= best * (fit.includes(o.id) ? data.rules.defaults.role_weight : 1), `${o.id} ${o.weight}`)
        if (fit.includes(o.id)) assert.equal(o.weight % data.rules.defaults.role_weight, 0, `${o.id} serves the role: x${data.rules.defaults.role_weight}`)
      }
      const v = entry(r, 'signature.variant')
      assert.ok(v.options.some(o => o.id === p.signature.variant) && v.options.every(o => o.weight === 1), 'S6: equal odds')
      for (const o of v.options) assert.ok(ix.patternById.get(p.signature.pattern).variants.find(x => x.id === o.id).min_spice <= r.draft.spice || v.aboveGate)
    }
    assert.ok(toolsOnly >= 10, `${toolsOnly} cards drew the signature among tools only (${asExtra} took the tool as an extra)`)
  })
})

describe('G13: the role\'s tool', () => {
  const tools = role => data.rules.role_fit[role]?.patterns
  for (const role of ['engineer', 'logistics', 'buffer', 'infiltrator', 'transport']) {
    it(`a chosen ${role} always holds a pattern that serves it`, () => {
      for (const cls of CLASSES) {
        for (const spice of [1, 3, 5]) {
          const r = roll(data, { seed: `tool-${role}-${cls}-${spice}`, spice, inputs: { role, class: cls } })
          if (role === 'transport' && (cls === 'infantry' || cls === 'drone')) {
            assert.equal(r.ok, false)
            continue
          }
          assert.equal(r.ok, true, `${role} ${cls} spice ${spice}: ${r.reason}`)
          const ids = abilitiesOf(r).map(a => a.pattern)
          if (tools(role)) assert.ok(ids.some(id => tools(role).includes(id)), `${role} ${cls} spice ${spice}: ${ids}`)
          else assert.ok(r.draft.parts.crew.passengers && r.draft.parts.crew.passengers.seats >= 2, `${role} ${cls} spice ${spice}: seats`)
        }
      }
    })
  }

  it('a tool above the spice gate is used for a chosen role, and the trace says why (G5)', () => {
    const r = roll(data, { seed: 'engineer-walker', spice: 1, inputs: { role: 'engineer', class: 'walker', flavour: 'soviet' } })
    const tool = r.trace.find(e => e.field.endsWith('.pattern') && tools('engineer').includes(e.value))
    assert.ok(tool, 'the tool is on the card')
    assert.match(tool.aboveGate ?? '', /least rare/)
  })
})

describe('A8: an implied pattern arrives as an extra', () => {
  it('tunnel-carrier implies burrow: burrow is an extra, and its key-bound trait comes with it (K-d)', () => {
    const signature = { pattern: 'carry-passengers', variant: 'tunnel-carrier', kind: 'passive', cooldown: null }
    const r = roll(data, { seed: 'a8', spice: 5, inputs: { class: 'vehicle', tier: 't2' }, locks: { signature } })
    assert.equal(r.ok, true, r.reason)
    assert.ok(r.draft.parts.abilities.some(a => a.pattern === 'burrow'))
    const e = r.trace.find(x => x.field.startsWith('abilities.') && x.field.endsWith('.pattern') && x.value === 'burrow')
    assert.equal(e.rule.split(',')[0], 'A8')
    assert.ok(r.draft.parts.mobility.traits.includes('burrow'))
    assert.ok(r.draft.parts.crew.passengers.seats >= 2)
  })
})

describe('I1: locked abilities', () => {
  it('a locked signature is kept; one that breaks a hard rule is refused', () => {
    const free = roll(data, { seed: 'lock-sig', spice: 3 })
    const again = roll(data, { seed: 'another', spice: 3, locks: { signature: free.draft.parts.signature } })
    assert.equal(again.ok, true, again.reason)
    assert.equal(again.draft.parts.signature.pattern, free.draft.parts.signature.pattern)
    assert.equal(again.draft.parts.signature.variant, free.draft.parts.signature.variant)
    const stun = roll(data, { seed: 'x', spice: 5, inputs: { tier: 't1' }, locks: { signature: { pattern: 'lock-in-stasis', variant: 'erase-beam', kind: 'active', cooldown: 'medium' } } })
    assert.equal(stun.ok, false)
  })
})

describe('A6, A7, A11: may a pattern join the card?', () => {
  const placed = [{ pattern: 'rally-allies', variant: 'timed-call' }]
  it('never the same pattern twice, never a conflict (either side)', () => {
    assert.match(mayJoin(ix, placed, 'rally-allies', 'standing-aura'), /A6/)
    assert.match(mayJoin(ix, [{ pattern: 'cloak', variant: 'cloak-on-key' }], 'burrow', 'tunnel'), /A7/)
    assert.match(mayJoin(ix, [{ pattern: 'burrow', variant: 'tunnel' }], 'cloak', 'cloak-on-key'), /A7/)
    assert.equal(mayJoin(ix, placed, 'resupply-allies', 'dropped-crate'), undefined)
  })

  it('same_mechanic in today\'s shape (a pair of pattern ids) and in the shape under discussion (sides with variants)', () => {
    const withPairs = same => indexOf({ ...data, rules: { ...data.rules, same_mechanic: same } })
    const pairs = withPairs([['rally-allies', 'resupply-allies']])
    assert.match(mayJoin(pairs, placed, 'resupply-allies', 'dropped-crate'), /A11/)
    const sides = withPairs([{ a: { pattern: 'resupply-allies', variants: ['hand-off'] }, b: { pattern: 'rally-allies' }, verdict: 'same', note: 'test entry' }])
    assert.match(mayJoin(sides, placed, 'resupply-allies', 'hand-off'), /A11/)
    assert.equal(mayJoin(sides, placed, 'resupply-allies', 'dropped-crate'), undefined, 'only the listed variant')
    const repeat = withPairs([{ a: { pattern: 'rally-allies', variants: ['timed-call'] }, b: { pattern: 'resupply-allies' }, verdict: 'repeat' }])
    assert.match(mayJoin(repeat, placed, 'resupply-allies', 'open-crate'), /A11/, 'either side, either verdict')
  })
})
