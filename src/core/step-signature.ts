// Step 4: the signature (A1 to A4, A7, A8; S5, S6; G13; K-d; HC2 to HC4, HC6), then the extras the card needs.
//
// The signature is drawn among the patterns whose slot is signature or any and that the card can hold at its spice
// (the reach, gate mode), each checked against the draft (abilities.ts), weighted by its odds and by role_weight when
// it serves the primary role. When nothing at the gate fits and an input or a lock needs it, the least rare that fits
// is used (G5). A locked signature is kept and checked against the hard rules (I1). Its implied parts, requires,
// excludes and strength links become needs (G3, G4, A7, M2); a key-bound trait it implies is one of them (K-d: step 9
// sets it, and only then).
import { emptyParts, locksWaiting } from './draft.ts'
import { drawAbility, kindsThatFit, neededItems, placeNeededExtras, placed, variantDraftProblem, type PatternChoice, type Reaches } from './abilities.ts'
import { blockOf, usablePattern, type Index } from './data.ts'
import { budgetOf } from './keys.ts'
import { lockProblem } from './locks.ts'
import { needsOfBlock, newMemo } from './needs.ts'
import { fail, ok } from './parts.ts'
import { cooldownWeights, hardControlOf } from './patterns.ts'
import { reachOf, reachWithAbilities, variantProblem, type Reach } from './reach.ts'
import type { StepResult } from './steps.ts'
import type { AbilityDraft, Draft, DraftParts } from './types.ts'

/** The draft with only its class, tier, flavour and roles: the plain reach, kept across rolls. */
function plainOf(parts: DraftParts): DraftParts {
  return { ...emptyParts(), class: parts.class, tier: parts.tier, flavour: parts.flavour, roles: { ...parts.roles } }
}

/** The reaches the ability steps draw from: gate mode, and forced mode when an input or a lock may need it (G5: an
 *  input role, a locked role, signature or extras, a lock still waiting for its step, or a need of one of them); both
 *  see the abilities the draft already has (a pattern that needs one of them may then be offered). */
export function reachesFor(ix: Index, d: Draft): Reaches {
  const p = plainOf(d.parts)
  const gate = reachWithAbilities(ix, reachOf(ix, p, d.spice, 'gate'), d.parts)
  const byLock = d.locks.includes('roles') || d.locks.includes('signature') || d.locks.includes('abilities') || locksWaiting(d)
  const mayForce = ix.data.rules.defaults.spice_fallback === 'least-rare' && (d.inputs.role !== null || byLock || d.needs.some(n => n.forced))
  return { gate, forced: mayForce ? reachWithAbilities(ix, reachOf(ix, p, d.spice, 'forced'), d.parts) : undefined }
}

/** Why a locked signature does not fit the card (the hard rules apply, rarity does not: I1, G5). */
function lockedProblem(ix: Index, d: Draft, rs: Reaches, sig: AbilityDraft): string | undefined {
  const p = sig.pattern !== undefined ? ix.patternById.get(sig.pattern) : undefined
  if (!p || !usablePattern(p)) return `pattern ${sig.pattern} cannot be on a card`
  if (p.generator?.slot === 'extra') return `${p.id} can only be an extra ability (A1)`
  if (!sig.variant) return 'a rolled card always has a variant (A2)'
  if (!p.variants.some(v => v.id === sig.variant)) return `${p.id} has no variant ${sig.variant}`
  // The hard rules, without rarity (I1, G5), on the reach of the card without this signature.
  const R: Reach = reachOf(ix, plainOf(d.parts), d.spice, 'forced')
  const hard = variantProblem(ix, R, p.id, sig.variant)
  if (hard) return hard
  const without: DraftParts = { ...d.parts, signature: undefined }
  const draft = variantDraftProblem(ix, d, without, rs, p.id, sig.variant, 'signature', true, newMemo())
  if (draft) return draft
  const block = blockOf(p, sig.variant)
  const hc = hardControlOf(ix, p.id, sig.variant)
  const kinds = kindsThatFit(ix, without, 'signature', p.id, sig.variant, neededItems(ix, d, d.parts, rs).items)
  if (!sig.kind || !kinds.includes(sig.kind)) return `kind ${sig.kind} is not one it can take here (A3, HC3, section 5)`
  const bands = cooldownWeights(ix, sig.kind, hc)
  const cd = sig.cooldown ?? null
  if (bands.length ? !bands.some(b => b.id === cd) : cd !== null) return `cooldown ${cd} does not go with kind ${sig.kind} (A4)`
  if (block.pattern !== p.id) return 'internal: block mismatch'
  return budgetOf(ix, d.parts) ?? lockProblem(ix, d, d.parts)
}

/**
 * The signature candidates of a draft at step 4: each pattern the reach offers as a signature, with the variants that
 * pass the draft's checks. From the gate first; from the least rare when nothing at the gate fits and an input or a
 * lock may need it (G5).
 */
export function signatureChoices(ix: Index, d: Draft, rs: Reaches): { choices: PatternChoice[]; forced: boolean; more: () => PatternChoice[] } {
  const memo = newMemo()
  const choicesFrom = (R: Reach, forced: boolean): PatternChoice[] => {
    const out: PatternChoice[] = []
    for (const [id, pr] of R.patterns) {
      const variants = pr.signature.filter(v => variantDraftProblem(ix, d, d.parts, rs, id, v, 'signature', forced, memo) === undefined)
      if (variants.length) out.push({ pattern: id, variants })
    }
    return out
  }
  // The forced reach's choices, for a lock still waiting that no choice at the gate fits (G5, locks.ts).
  const more = (): PatternChoice[] => (rs.forced ? choicesFrom(rs.forced, true) : [])
  const gate = choicesFrom(rs.gate, false)
  if (gate.length || !rs.forced) return { choices: gate, forced: false, more }
  return { choices: choicesFrom(rs.forced, true), forced: true, more }
}

export function stepSignature(ix: Index, d: Draft): StepResult {
  const rs = reachesFor(ix, d)
  const sig = d.parts.signature
  if (sig !== undefined) {
    const why = lockedProblem(ix, d, rs, sig)
    if (why) return fail(`the locked signature ${sig.pattern} does not fit: ${why}`)
    d.trace.push({ field: 'signature', value: { ...sig }, how: 'locked', rule: 'I1', candidates: 0 })
    d.needs.push(...needsOfBlock(blockOf(ix.patternById.get(sig.pattern as string) as never, sig.variant ?? null), `pattern:${sig.pattern}`, true))
  } else {
    const { choices, forced: forcedOk, more } = signatureChoices(ix, d, rs)
    const got = drawAbility(ix, d, d.parts, 'signature', 'signature', choices, forcedOk, rs, { how: 'rolled', rule: 'A1' }, more)
    if (typeof got === 'string') return fail(got)
    d.parts = placed(d.parts, got.ability, 'signature')
    d.needs.push(...needsOfBlock(got.block, `pattern:${got.ability.pattern}`, got.mode === 'forced'))
    d.trace.push(...got.trace)
  }
  const why = placeNeededExtras(ix, d, reachesFor(ix, d))
  return why ? fail(why) : ok
}
