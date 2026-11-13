// Step 14: the extra abilities, then the seats and the second form.
//
// Step 14 aims for a total number of abilities by tier (counts.abilities), and adds extras while the key, passive and
// seat budgets allow, never the same pattern twice and never a conflict (A6, A7, A11); a pattern an extra implies comes
// with it (A8). Then the seats are given out (A5): a commander takes the last extra (or the signature), a gunner the
// secondary weapon, the driver everything else. Last, a card with a transform pattern gets its second form (A9).
import { abilityCap, drawAbility, itemForNeed, placeItem, placeNeededExtras, placed, variantDraftProblem, type PatternChoice } from './abilities.ts'
import { blockOf, usablePattern, type Index } from './data.ts'
import { diceFor } from './dice.ts'
import { budgetOf, budgetProblem, seatPlan } from './keys.ts'
import { matchLink, parseLink } from './links.ts'
import { lockedRoleNeeds, pendingNotLocked } from './locks.ts'
import { needAnswer, needsOfBlock, newMemo } from './needs.ts'
import { dueNeeds, fail } from './parts.ts'
import { blockFor, cooldownWeights, hardControlOf, kindsAtTier, mayJoin } from './patterns.ts'
import { reachOf, reachWithAbilities, variantProblem } from './reach.ts'
import { emptyParts } from './draft.ts'
import { stepSecondForm } from './step-late.ts'
import { reachesFor } from './step-signature.ts'
import type { StepResult } from './steps.ts'
import type { AbilityDraft, Draft, DraftParts } from './types.ts'

/** The most extras a card of this tier holds: the tier's cap of abilities (A6) less the signature. */
export function maxExtras(ix: Index, tier: string | undefined): number {
  return abilityCap(ix, tier) - 1
}

/** Why locked extras do not fit (the hard rules apply: I1, G5). Each is checked on the reach of the card with the
 *  signature and the extras before it. */
function lockedExtrasProblem(ix: Index, d: Draft): string | undefined {
  const plain: DraftParts = { ...emptyParts(), class: d.parts.class, tier: d.parts.tier, flavour: d.parts.flavour, roles: { ...d.parts.roles } }
  const base = reachOf(ix, plain, d.spice, 'forced')
  const extras = d.parts.abilities ?? []
  if (extras.length > maxExtras(ix, d.parts.tier)) return `${extras.length} extras; a ${d.parts.tier} card holds ${maxExtras(ix, d.parts.tier)} (A6)`
  const before: Array<{ pattern: string; variant: string | null | undefined }> = d.parts.signature?.pattern ? [{ pattern: d.parts.signature.pattern, variant: d.parts.signature.variant }] : []
  for (const x of extras) {
    const p = x.pattern !== undefined ? ix.patternById.get(x.pattern) : undefined
    if (!p || !usablePattern(p)) return `pattern ${x.pattern} cannot be on a card`
    if (p.generator?.slot === 'signature') return `${p.id} can only be the signature (A6)`
    if (!x.variant || !p.variants.some(v => v.id === x.variant)) return `${p.id} needs a variant it has (A2)`
    const join = mayJoin(ix, before, p.id, x.variant)
    if (join) return join
    const R = reachWithAbilities(ix, base, { ...plain, signature: d.parts.signature, pending: extras.slice(0, before.length - (d.parts.signature?.pattern ? 1 : 0)) })
    before.push({ pattern: p.id, variant: x.variant })
    const hard = variantProblem(ix, R, p.id, x.variant)
    if (hard) return `${p.id}: ${hard}`
    const hc = hardControlOf(ix, p.id, x.variant)
    if (!x.kind || !kindsAtTier(ix, blockOf(p, x.variant), d.parts.tier as string, hc).includes(x.kind)) return `${p.id} cannot take kind ${x.kind} (A3, HC3)`
    const bands = cooldownWeights(ix, x.kind, hc)
    const cd = x.cooldown ?? null
    if (bands.length ? !bands.some(b => b.id === cd) : cd !== null) return `${p.id}: cooldown ${cd} does not go with kind ${x.kind} (A4)`
  }
  return budgetOf(ix, d.parts)
}

/** A5: give each ability and the secondary weapon its seat. */
function giveSeats(ix: Index, d: Draft): void {
  const plan = seatPlan(ix, d.parts)
  const seat = (a: AbilityDraft | undefined, s: string | undefined): AbilityDraft | undefined => (a ? { ...a, seat: s ?? 'driver' } : a)
  const signature = seat(d.parts.signature, plan.abilities[0])
  const abilities = (d.parts.abilities ?? []).map((a, i) => seat(a, plan.abilities[i + 1]) as AbilityDraft)
  const secondary = d.parts.armament.secondary ? { ...d.parts.armament.secondary, seat: plan.secondary ?? 'driver' } : d.parts.armament.secondary
  d.parts = { ...d.parts, ...(signature ? { signature } : {}), abilities, armament: { ...d.parts.armament, secondary } }
  d.trace.push({ field: 'seats', value: { signature: plan.abilities[0], abilities: plan.abilities.slice(1), secondary: plan.secondary ?? null }, how: 'default', rule: 'A5, C4', candidates: 0 })
}

export function stepExtras(ix: Index, d: Draft): StepResult {
  if (d.parts.abilities !== undefined) {
    // The locked extras: the ones step 4 placed for the card's needs are among them (locks.ts kept them so), and the
    // list replaces them.
    const pending = d.parts.pending ?? []
    const why = pendingNotLocked(pending, d.parts.abilities) ?? lockedExtrasProblem(ix, { ...d, parts: { ...d.parts, pending: undefined } })
    if (why) return fail(`the locked extra abilities do not fit: ${why}`)
    const { pending: _placed, ...rest } = d.parts
    d.parts = rest
    d.trace.push({ field: 'abilities', value: d.parts.abilities?.map(a => a.pattern), how: 'locked', rule: 'I1', candidates: 0 })
    for (const a of d.parts.abilities ?? []) {
      if (pending.some(x => x.pattern === a.pattern)) continue // its needs are on the draft since step 4
      d.needs.push(...needsOfBlock(blockFor(ix, a.pattern as string, a.variant ?? null), `pattern:${a.pattern}`, true))
    }
  } else {
    let rs = reachesFor(ix, d)
    // Needs this step owns last (a pattern or category no earlier step met): an extra must meet each (G2, G13, G4).
    for (const n of dueNeeds(ix, d, 'extra-abilities')) {
      if (n.avoid || !dueNeeds(ix, d, 'extra-abilities').includes(n)) continue // met by an extra placed meanwhile
      if (!n.links.some(l => ['pattern', 'category'].includes(parseLink(l).kind))) continue
      const item = itemForNeed(ix, d, rs, n)
      const why = typeof item === 'string' ? item : placeItem(ix, d, rs, item) ?? placeNeededExtras(ix, d, reachesFor(ix, d))
      if (why) return fail(why)
      rs = reachesFor(ix, d)
    }
    // A6: the total the card aims for, signature included; the extras the card needed count in it.
    const tier = d.parts.tier as string
    const weights = ix.data.rules.counts.abilities[tier] ?? [0, 1]
    const target = diceFor(d.seed, 'abilities', d.attempt).pick(weights).index
    const room = Math.min(target, 1 + maxExtras(ix, tier))
    let stopped: string | undefined
    while (1 + (d.parts.pending ?? []).length < room) {
      rs = reachesFor(ix, d)
      const memo = newMemo()
      const choices: PatternChoice[] = []
      for (const [id, pr] of rs.gate.patterns) {
        const variants = pr.extra.filter(v => variantDraftProblem(ix, d, d.parts, rs, id, v, 'extra', false, memo) === undefined)
        if (variants.length) choices.push({ pattern: id, variants })
      }
      const index = (d.parts.pending ?? []).length
      const got = drawAbility(ix, d, d.parts, `abilities.${index}`, 'extra', choices, false, rs, { how: 'rolled', rule: 'A6' })
      if (typeof got === 'string') {
        stopped = got // G16: the card takes what fits
        break
      }
      d.parts = placed(d.parts, got.ability, 'extra')
      d.needs.push(...needsOfBlock(got.block, `pattern:${got.ability.pattern}`, false))
      d.trace.push(...got.trace)
      const why = placeNeededExtras(ix, d, reachesFor(ix, d)) // A8: a pattern the extra implies comes with it
      if (why) return fail(why)
    }
    // G5: a tool a locked secondary role still lacks (a pattern or category its fit or requires names) comes last.
    for (const n of lockedRoleNeeds(ix, d)) {
      if (n.avoid || needAnswer(ix, d.parts, n) === 'yes' || !n.links.some(l => ['pattern', 'category'].includes(parseLink(l).kind))) continue
      if (n.links.some(l => !['pattern', 'category'].includes(parseLink(l).kind) && matchLink(ix, d.parts, l) !== 'no')) continue
      const item = itemForNeed(ix, d, reachesFor(ix, d), n)
      const why = typeof item === 'string' ? item : placeItem(ix, d, reachesFor(ix, d), item) ?? placeNeededExtras(ix, d, reachesFor(ix, d))
      if (why) return fail(`the locked secondary role: ${why}`)
    }
    d.trace.push({ field: 'abilities', value: target, how: 'rolled', rule: 'A6', candidates: weights.filter(w => w > 0).length, note: `${(d.parts.pending ?? []).length} extras${stopped ? `; stopped: ${stopped}` : ''}` })
    const { pending, ...rest } = d.parts
    d.parts = { ...rest, abilities: [...(pending ?? [])] }
  }
  giveSeats(ix, d)
  const why = budgetProblem(ix, d.parts)
  return why ? fail(why) : stepSecondForm(ix, d)
}
