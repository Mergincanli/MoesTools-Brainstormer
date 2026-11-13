// The public entry: roll(data, request).
//
// Each attempt starts a fresh draft from the request (inputs and locks set, I1) and runs the steps in the roll order;
// every field draws from its own dice (seed, field path, attempt). A step that breaks a rule fails the attempt and the
// next attempt rolls again on new dice; a failure no dice can change (the inputs or locks themselves cannot be held)
// stops at once. After rules.json `attempts` attempts the inputs are unavailable for that seed (G7).
//
// Written so far: steps 1 to 3 (class, tier and flavour, primary role). The result carries the draft; the finished
// card in the card schema comes with the last step.
import { indexOf, type Index } from './data.ts'
import { newDraft, requestProblem } from './draft.ts'
import { stepClass, stepPrimaryRole, stepTierFlavour, type StepResult } from './steps.ts'
import type { Draft, GeneratorData, RollRequest, TraceEntry } from './types.ts'

/** The steps written so far, with their ids in rules.json roll_order. */
export const STEPS: ReadonlyArray<{ id: string; run: (ix: Index, d: Draft) => StepResult }> = [
  { id: 'class', run: stepClass },
  { id: 'tier-and-flavour', run: stepTierFlavour },
  { id: 'primary-role', run: stepPrimaryRole },
]

export type RollResult =
  | { ok: true; draft: Draft; trace: TraceEntry[]; attempts: number }
  | { ok: false; reason: string; attempts: number }

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
      const r = step.run(ix, d)
      if (!r.ok) {
        failed = r
        break
      }
    }
    if (!failed) return { ok: true, draft: d, trace: d.trace, attempts: attempt }
    if (failed.final) return { ok: false, reason: failed.reason, attempts: attempt }
    last = failed.reason
  }
  return { ok: false, reason: `no card passed the rules in ${max} attempts (G7); the last attempt failed: ${last}`, attempts: max }
}
