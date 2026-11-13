// Step 13 (only whether the card has a secondary weapon, so far) and step 14 (the extra abilities), then the seats.
//
// The secondary weapon takes its key before the extras (A6). Step 13 comes before step 14 in the roll order, so the
// choice is made at step 13's place: always with a gunner seat, and when a pattern needs its adaptive weapon as the
// secondary one (A10); otherwise 1 in one_in, if the budgets have a key left (section 7, K-a, K-c). The weapon itself
// is rolled with the rest of step 13 later; this step marks only that it exists ({} on the draft).
//
// Step 14 aims for a total number of abilities by tier (counts.abilities), and adds extras while the key, passive and
// seat budgets allow, never the same pattern twice and never a conflict (A6, A7, A11); a pattern an extra implies comes
// with it (A8). Then the seats are given out (A5): a commander takes the last extra (or the signature), a gunner the
// secondary weapon, the driver everything else.
import { drawAbility, itemForNeed, placeItem, placeNeededExtras, placed, variantDraftProblem, type PatternChoice } from './abilities.ts'
import { blockOf, usablePattern, type Index } from './data.ts'
import { diceFor } from './dice.ts'
import { abilitiesOf, budgetOf, budgetProblem, crewSeats, seatPlan } from './keys.ts'
import { parseLink } from './links.ts'
import { lockProblem, pendingNotLocked } from './locks.ts'
import { needsOfBlock, newMemo } from './needs.ts'
import { dueNeeds, fail, ok } from './parts.ts'
import { blockFor, cooldownWeights, hardControlOf, kindsAtTier, mayJoin } from './patterns.ts'
import { reachOf, reachWithAbilities, variantProblem } from './reach.ts'
import { emptyParts } from './draft.ts'
import { reachesFor } from './step-signature.ts'
import type { StepResult } from './steps.ts'
import type { AbilityDraft, Draft, DraftParts } from './types.ts'

/** The adaptive weapon family (weapon-families word list), which A10 places by the pattern that implies it. */
const ADAPTIVE = 'adaptive'

/** A10: a pattern on the card implies an adaptive weapon and requires another family for the card, so the adaptive
 *  weapon is the secondary one (rules.json defaults.adaptive.slot_when_family_required). */
function adaptiveAsSecondary(ix: Index, d: Draft): string | undefined {
  if (ix.data.rules.defaults.adaptive.slot_when_family_required !== 'secondary') return undefined
  for (const a of abilitiesOf(d.parts)) {
    if (a.pattern === undefined) continue
    const b = blockFor(ix, a.pattern, a.variant ?? null)
    const adaptive = b.implies.some(l => l === `weapon:${ADAPTIVE}`)
    const family = b.requires.some(g => g.some(l => parseLink(l).kind === 'weapon' && parseLink(l).id !== ADAPTIVE))
    if (adaptive && family) return `pattern:${a.pattern}`
  }
  return undefined
}

/** Step 13, its first part: does the card have a secondary weapon? */
export function stepSecondaryWeapon(ix: Index, d: Draft): StepResult {
  const a = d.parts.armament
  if (a.secondary !== undefined) {
    const why = budgetOf(ix, d.parts)
    if (why) return fail(`the locked secondary weapon does not fit: ${why}`)
    d.trace.push({ field: 'armament.secondary', value: a.secondary === null ? 'none' : 'yes', how: 'locked', rule: 'I1', candidates: 0 })
    return ok
  }
  const rule = ix.data.rules.defaults.secondary_weapon
  const roll = diceFor(d.seed, 'armament.secondary', d.attempt).below(rule.one_in) // drawn every time, whatever decides
  const withIt = { ...d.parts, armament: { ...a, secondary: {} } }
  const room = budgetOf(ix, withIt) === undefined
  const gunner = crewSeats(ix, d.parts).includes(rule.always_with)
  const forcedBy = gunner ? `crew:${d.parts.crew.model}` : adaptiveAsSecondary(ix, d)
  // A secondary weapon the waiting locks leave no key for is drawn again: there is none (locks.ts).
  const clash = forcedBy === undefined && room && roll === 0 ? lockProblem(ix, d, withIt) : undefined
  const has = forcedBy !== undefined || (room && roll === 0 && !clash)
  if (has && !room) return fail(`the secondary weapon ${forcedBy} needs takes a key the budgets do not have (K-a, K-c)`)
  d.parts = has ? withIt : { ...d.parts, armament: { ...a, secondary: null } }
  d.trace.push({
    field: 'armament.secondary',
    value: has ? 'yes' : 'none',
    how: forcedBy ? 'needed' : 'rolled',
    ...(forcedBy ? { by: forcedBy } : {}),
    rule: forcedBy ? (gunner ? 'section 7 (always with a gunner seat)' : 'A10') : `section 7 (1 in ${rule.one_in} if a key is left), A6`,
    candidates: rule.one_in,
    draw: roll,
    ...(!room && !forcedBy ? { note: 'no key left for it' } : clash ? { note: `the locks rule it out: ${clash}` } : {}),
  })
  return ok
}

/** The most extras a card holds: the largest count of counts.abilities, less the signature (the card schema's three). */
export function maxExtras(ix: Index): number {
  return Math.max(...Object.values(ix.data.rules.counts.abilities).map(w => w.length - 1)) - 1
}

/** Why locked extras do not fit (the hard rules apply: I1, G5). Each is checked on the reach of the card with the
 *  signature and the extras before it. */
function lockedExtrasProblem(ix: Index, d: Draft): string | undefined {
  const plain: DraftParts = { ...emptyParts(), class: d.parts.class, tier: d.parts.tier, flavour: d.parts.flavour, roles: { ...d.parts.roles } }
  const base = reachOf(ix, plain, d.spice, 'forced')
  const extras = d.parts.abilities ?? []
  if (extras.length > maxExtras(ix)) return `${extras.length} extras; a card holds ${maxExtras(ix)}`
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
    const room = Math.min(target, 1 + maxExtras(ix))
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
    d.trace.push({ field: 'abilities', value: target, how: 'rolled', rule: 'A6', candidates: weights.filter(w => w > 0).length, note: `${(d.parts.pending ?? []).length} extras${stopped ? `; stopped: ${stopped}` : ''}` })
    const { pending, ...rest } = d.parts
    d.parts = { ...rest, abilities: [...(pending ?? [])] }
  }
  giveSeats(ix, d)
  const why = budgetProblem(ix, d.parts)
  return why ? fail(why) : ok
}
