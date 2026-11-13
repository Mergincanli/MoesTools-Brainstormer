// The public entry: roll(data, request).
//
// Each attempt starts a fresh draft from the request (inputs set, I1) and runs the steps in the roll order; each lock is
// set when its step comes (the steps before keep to it, locks.ts), and every field draws from its own dice (seed,
// field path, attempt). A step that breaks a rule fails the attempt and the
// next attempt rolls again on new dice; a failure no dice can change (the inputs or locks themselves cannot be held)
// stops at once. After rules.json `attempts` attempts the inputs are unavailable for that seed (G7).
//
// Written: all 17 steps, the second form (A9) at the end of step 14, and step 17 (matchups, balance, text) with the
// finished card in the card schema (card.ts). The result is that card and its trace (and the draft the steps filled),
// or the unavailable answer with its reason.
//
// What a caller needs: the data as one plain object (GeneratorData: the word lists, the patterns, the generator files,
// the real names and the data version); loading it is the caller's job, in Node through scripts/lib/generator-data.mjs
// (loadGeneratorData). A request is a seed, a spice, optional inputs (class, tier, flavour, role), optional locks (the
// card schema's lockable parts, with their values) and an optional created_at (the module has no clock). The module is
// pure: no files, no clock, no randomness of its own.
import { indexOf, type Index } from './data.ts'
import { finishCard, type Card } from './card.ts'
import { applyStepLocks, newDraft, requestProblem } from './draft.ts'
import { needAnswer, ownersOf } from './needs.ts'
import { stepCrew } from './step-crew.ts'
import { stepExtras } from './step-extras.ts'
import { finishedProblem, stepOnDeath, stepSecondaryRoles } from './step-late.ts'
import { stepArmour, stepBody, stepMobility, stepMobilityTraits, stepSensors, stepSize, stepSpeed } from './step-parts.ts'
import { stepSignature } from './step-signature.ts'
import { stepWeapons } from './step-weapons.ts'
import { stepClass, stepPrimaryRole, stepTierFlavour, type StepResult } from './steps.ts'
import type { Draft, GeneratorData, RollRequest, TraceEntry } from './types.ts'

export interface Step {
  /** The step's id in rules.json roll_order. */
  id: string
  run: (ix: Index, d: Draft) => StepResult
}

/** The steps written so far, in the roll order. */
export const STEPS: readonly Step[] = [
  { id: 'class', run: stepClass },
  { id: 'tier-and-flavour', run: stepTierFlavour },
  { id: 'primary-role', run: stepPrimaryRole },
  { id: 'signature', run: stepSignature },
  { id: 'mobility', run: stepMobility },
  { id: 'body', run: stepBody },
  { id: 'size', run: stepSize },
  { id: 'speed', run: stepSpeed },
  { id: 'mobility-traits', run: stepMobilityTraits },
  { id: 'armour', run: stepArmour },
  { id: 'sensors', run: stepSensors },
  { id: 'crew', run: stepCrew },
  { id: 'weapons', run: stepWeapons },
  { id: 'extra-abilities', run: stepExtras },
  { id: 'on-death', run: stepOnDeath },
  { id: 'secondary-roles', run: stepSecondaryRoles },
]

export type RollResult =
  | { ok: true; card: Card; trace: TraceEntry[]; attempts: number; draft: Draft }
  | { ok: false; reason: string; attempts: number }

/** A need whose owners have all run must be met (a gap in a step shows here, and the attempt is rolled again). */
function unmetNeed(ix: Index, d: Draft): string | undefined {
  for (const n of d.needs) {
    const owners = new Set(n.links.flatMap(l => [...ownersOf(l)]))
    if ([...owners].every(o => d.done.includes(o)) && needAnswer(ix, d.parts, n) !== 'yes') {
      return `${n.by} ${n.avoid ? 'excludes' : 'needs'} ${n.links.join(' or ')} (${n.rule}), and the card does not ${n.avoid ? 'avoid' : 'meet'} it`
    }
  }
  return undefined
}

/** Rolls a card for a request: the finished card and its trace, or the reason it is unavailable. The same data and
 *  request always give the same result. */
export function roll(data: GeneratorData, request: RollRequest): RollResult {
  const ix = indexOf(data)
  const bad = requestProblem(ix, request)
  if (bad) return { ok: false, reason: bad, attempts: 0 }
  const max = data.rules.attempts
  let last = ''
  for (let attempt = 1; attempt <= max; attempt++) {
    const d = newDraft(request, attempt)
    let failed: Extract<StepResult, { ok: false }> | undefined
    for (const step of STEPS) {
      applyStepLocks(d, step.id) // a lock is set at its own step; the steps before it keep to it (locks.ts)
      const r = step.run(ix, d)
      if (!r.ok) {
        failed = { ...r, reason: `${step.id}: ${r.reason}` }
        break
      }
      d.done.push(step.id)
    }
    if (!failed) {
      // G7: the finished card is checked as a whole; a card that breaks a rule is rolled again on new dice.
      const gap = unmetNeed(ix, d) ?? finishedProblem(ix, d)
      if (gap) failed = { ok: false, reason: `the finished card: ${gap}`, final: false }
    }
    if (!failed) {
      // Step 17: matchups, balance and text; a block flag never reaches a card (G7).
      const fin = finishCard(ix, d, request)
      if ('problem' in fin) failed = { ok: false, reason: `matchups-balance-text: ${fin.flag ? `${fin.flag}: ` : ''}${fin.problem}`, final: false }
      else {
        d.done.push('matchups-balance-text')
        d.trace.push(...fin.trace)
        return { ok: true, card: fin.card, trace: d.trace, attempts: attempt, draft: d }
      }
    }
    if (failed.final) return { ok: false, reason: failed.reason, attempts: attempt }
    last = failed.reason
  }
  return { ok: false, reason: `no card passed the rules in ${max} attempts (G7); the last attempt failed at ${last}`, attempts: max }
}
