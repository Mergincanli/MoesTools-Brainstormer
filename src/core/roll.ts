// The public entry: roll(data, request).
//
// Each attempt starts a fresh draft from the request (inputs set, I1) and runs the steps in the roll order; each lock is
// set when its step comes (the steps before keep to it, locks.ts), and every field draws from its own dice (seed,
// field path, attempt). A step that breaks a rule fails the attempt and the
// next attempt rolls again on new dice; a failure no dice can change (the inputs or locks themselves cannot be held)
// stops at once. After rules.json `attempts` attempts the inputs are unavailable for that seed (G7).
//
// Written so far: steps 1 to 12, the first part of step 13 (whether there is a secondary weapon) and step 14. Needs on
// parts of steps not written yet (the weapons, on death and resource, secondary roles, the matchups) stay on the draft
// for those steps, and so do their locks (the steps written keep to them). The result carries the draft; the finished
// card in the card schema comes with the last step.
import { indexOf, type Index } from './data.ts'
import { applyStepLocks, newDraft, requestProblem } from './draft.ts'
import { needAnswer, ownersOf } from './needs.ts'
import { stepCrew } from './step-crew.ts'
import { stepExtras, stepSecondaryWeapon } from './step-extras.ts'
import { stepArmour, stepBody, stepMobility, stepMobilityTraits, stepSensors, stepSize, stepSpeed } from './step-parts.ts'
import { stepSignature } from './step-signature.ts'
import { stepClass, stepPrimaryRole, stepTierFlavour, type StepResult } from './steps.ts'
import type { Draft, GeneratorData, RollRequest, TraceEntry } from './types.ts'

export interface Step {
  /** The step's id in rules.json roll_order. */
  id: string
  run: (ix: Index, d: Draft) => StepResult
  /** Only part of the step is written: it does not count as run, so its needs stay open (step 13, for now). */
  partial?: boolean
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
  { id: 'weapons', run: stepSecondaryWeapon, partial: true },
  { id: 'extra-abilities', run: stepExtras },
]

export type RollResult =
  | { ok: true; draft: Draft; trace: TraceEntry[]; attempts: number }
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

/** Rolls a card (so far: its first steps) for a request; the same data and request always give the same result. */
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
      if (!step.partial) d.done.push(step.id)
    }
    if (!failed) {
      const gap = unmetNeed(ix, d)
      if (gap) failed = { ok: false, reason: gap, final: false }
    }
    if (!failed) return { ok: true, draft: d, trace: d.trace, attempts: attempt }
    if (failed.final) return { ok: false, reason: failed.reason, attempts: attempt }
    last = failed.reason
  }
  return { ok: false, reason: `no card passed the rules in ${max} attempts (G7); the last attempt failed at ${last}`, attempts: max }
}
