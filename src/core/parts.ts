// Rolling one part: a single value (rollSingle) or a list with a count (rollMulti), as steps 5 to 12 do.
//
// A value a lock set is kept (I1) and checked. Otherwise the part is offered among the terms that fit everything chosen
// so far (G1, G2) and leave every need possible (needs.ts); a need this step is the last owner of must be met by the
// value (G3, G5, "set, not rolled"); the draw takes the field's own dice, among the parts at the spice gate, or, when
// an input's or a lock's need allows nothing at the gate, the least rare that fit (G5). A value a lock of a later step
// rules out is drawn again on the same dice (locks.ts).
import { term, type Index } from './data.ts'
import { diceFor } from './dice.ts'
import { withPendingLocks } from './draft.ts'
import { parseLink } from './links.ts'
import { drawKeeping, keptTrace, lockedTraitsWithoutAbility, lockProblem } from './locks.ts'
import { affectedBy, allNeedsProblem, lastChance, memoAfter, needAnswer, needProblem, needsAfter, newMemo, ownersOf, valuesLeft, type Memo } from './needs.ts'
import type { Odds } from './odds.ts'
import { offerTerms, onOwnRolls, poolOf, termProblem, UNIT_PARTS, withPart, type Candidate, type Mode, type Pool } from './offer.ts'
import type { StepResult } from './steps.ts'
import type { Draft, DraftParts, Need, TraceEntry } from './types.ts'

export const ok: StepResult = { ok: true }
export const fail = (reason: string, final = false): StepResult => ({ ok: false, reason, final })

/** Odds for a part with its own fixed weights instead of rarity odds (availability, sight). */
export function fixedOdds(weight: number, aboveGate: boolean): Odds {
  return { rarity: 'common', byClass: false, favoured: false, held: false, aboveGate, weight: aboveGate ? 0 : weight, fallbackWeight: weight }
}

/** The needs this step must meet now: not met yet, and every other owner of their links has run. */
export function dueNeeds(ix: Index, d: Draft, step: string): Need[] {
  return d.needs.filter(n => lastChance(d, n, step) && needAnswer(ix, d.parts, n) !== 'yes')
}

/** The link kinds a field of a list answers: the kinds whose word list it is, and the parts that follow from it (the
 *  target from the mobility and size, the handling from the mobility). */
function kindsOf(ix: Index, list: string): Set<string> {
  const out = new Set(Object.entries(ix.data.refKinds).filter(([, k]) => k.vocab === list).map(([kind]) => kind))
  if (list === 'mobility' || list === 'sizes') out.add('target')
  if (list === 'mobility') out.add('handling')
  return out
}

/** The single-valued parts every card has, which a value chosen now must leave at least one option for. */
const REQUIRED = ['mobility', 'bodies', 'sizes', 'speed-bands', 'armour-classes', 'armour-models', 'crew-models', 'sight-bands', 'availability']

/** The step that rolls a required part (for the look-ahead's mode). */
const STEP_OF: Readonly<Record<string, string>> = {
  mobility: 'mobility', bodies: 'body', sizes: 'size', 'speed-bands': 'speed', 'armour-classes': 'armour', 'armour-models': 'armour',
  'crew-models': 'crew', 'sight-bands': 'sensors', availability: 'crew',
}

/** One step of look-ahead: the parts still to come that this value affects keep at least one option, at the spice
 *  gate, or above it where that step may go above it (G5: an input's or a lock's need on that part; `forLocks`: the
 *  parts with the locks on top, where a locked part needs no option and the others may go above the gate). */
function leavesOptions(ix: Index, d: Draft, next: DraftParts, list: string, memo: Memo, forLocks = false): string | undefined {
  const affected = affectedBy(ix, list)
  for (const later of REQUIRED) {
    if (later === list || !affected.has(later) || (UNIT_PARTS[later]?.(next) ?? []).some(v => typeof v === 'string')) continue
    const step = STEP_OF[later] ?? ''
    const mode: Mode = forLocks || forcedFallback(ix, d, step, []) ? 'forced' : 'gate'
    if (!valuesLeft(ix, next, d.spice, later, mode, memo).length) return `leaves no ${later} that fits`
  }
  return undefined
}

/** G2 before the choice: a term's own requires groups must still be possible with it chosen. */
function ownRequiresProblem(ix: Index, d: Draft, next: DraftParts, list: string, id: string, memo: Memo): string | undefined {
  for (const g of term(ix, list, id)?.requires ?? []) {
    const why = needProblem(ix, next, d.spice, { links: g, by: `${list}:${id}`, rule: 'G2', forced: false }, memo)
    if (why) return why
  }
  return undefined
}

/** G2: a chosen term's requires groups that are not met yet pass on to the later steps as needs. */
export function passOnRequires(ix: Index, d: Draft, list: string, id: string, forced: boolean): void {
  for (const g of term(ix, list, id)?.requires ?? []) {
    const need: Need = { links: g, by: `${list}:${id}`, rule: 'G2', forced }
    if (needAnswer(ix, d.parts, need) !== 'yes') d.needs.push(need)
  }
}

/** May the step use a part above the spice gate on its own offer? Only when an input's or a lock's need on this part
 *  is open (G5). A lock still waiting for its step is kept by drawing again, and its own fallback (locks.ts). */
function forcedFallback(ix: Index, d: Draft, step: string, due: readonly Need[]): boolean {
  if (ix.data.rules.defaults.spice_fallback !== 'least-rare') return false
  if (due.some(n => n.forced)) return true
  return d.needs.some(n => n.forced && n.links.some(l => ownersOf(l).includes(step)) && needAnswer(ix, d.parts, n) !== 'yes')
}

export interface SingleSpec {
  /** The roll step (rules.json roll_order id). */
  step: string
  /** The card field, also the path of its dice. */
  field: string
  list: string
  get(p: DraftParts): string | null | undefined
  /** Set by a lock (the trace says so; a value from a lock is never rolled). */
  locked: boolean
  rule: string
  /** Own odds instead of the rarity odds (availability, sight). */
  odds?(id: string): Odds
  /** A rule of this step only (the crew's budget); why the value does not fit, or undefined. */
  extra?(parts: DraftParts, id: string): string | undefined
}

/** One single-valued part. */
export function rollSingle(ix: Index, d: Draft, spec: SingleSpec): StepResult {
  const now = spec.get(d.parts)
  if (now !== undefined && now !== null) {
    const why = termProblem(ix, d.parts, spec.list, now) ?? allNeedsProblem(ix, d.parts, d.spice, d.needs) ?? spec.extra?.(d.parts, now) ?? lockProblem(ix, d, d.parts)
    if (why) return fail(`the ${spec.locked ? 'locked' : 'chosen'} ${spec.field} ${now} does not fit: ${why}`)
    d.trace.push({ field: spec.field, value: now, how: spec.locked ? 'locked' : 'input', rule: 'I1', candidates: 0 })
    passOnRequires(ix, d, spec.list, now, true)
    return ok
  }
  // The needs this field must meet now: due at this step, and on a link this field answers (the crew model does not
  // decide the passenger seats, which come right after it).
  const kinds = kindsOf(ix, spec.list)
  const due = dueNeeds(ix, d, spec.step).filter(n => n.links.some(l => kinds.has(parseLink(l).kind)))
  const offer = offerTerms(ix, d.parts, d.spice, spec.list)
  const dropped = [...offer.dropped]
  const fits: Candidate[] = []
  // Only the needs a part of this list can change are checked again; the rest held before and still hold.
  const recheck = needsAfter(ix, d.needs, spec.list)
  const base = newMemo()
  const problem = (c: Candidate, forLocks: boolean): string | undefined => {
    const next = withPart(d.parts, spec.list, c.id)
    const memo = memoAfter(ix, base, spec.list)
    return (
      due.map(n => (needAnswer(ix, next, n) === 'yes' ? undefined : `does not meet ${n.by} (${n.rule})`)).find(Boolean) ??
      spec.extra?.(next, c.id) ??
      ownRequiresProblem(ix, d, next, spec.list, c.id, memo) ??
      allNeedsProblem(ix, next, d.spice, recheck, memo) ??
      (forLocks ? leavesOptions(ix, d, withPendingLocks(d, next) ?? next, spec.list, newMemo(), true) : leavesOptions(ix, d, next, spec.list, memo))
    )
  }
  const withOdds = (c: Candidate): Candidate => (spec.odds ? { id: c.id, odds: spec.odds(c.id) } : c)
  for (const c of offer.candidates) {
    const why = problem(c, false)
    if (why) dropped.push({ id: c.id, why })
    else fits.push(withOdds(c))
  }
  let pool: Pool = poolOf(ix, fits, 'gate', d.spice)
  if (!pool.items.length && forcedFallback(ix, d, spec.step, due)) pool = poolOf(ix, fits, 'forced', d.spice)
  // A value a waiting lock rules out is drawn again; when none in the pool fits the locks, the least rare that does.
  const accept = (id: string): string | undefined => lockProblem(ix, d, withPart(d.parts, spec.list, id))
  const fallback = (fitsLocks: (id: string) => boolean): Pool =>
    poolOf(ix, offer.candidates.filter(c => fitsLocks(c.id) && problem(c, true) === undefined).map(withOdds), 'forced', d.spice)
  const got = drawKeeping(ix, d, diceFor(d.seed, spec.field, d.attempt), pool, accept, fallback)
  if (!got) return fail(`no ${spec.field} fits: ${dropped.slice(0, 3).map(x => `${x.id} ${x.why}`).join('; ') || 'none offered'}`)
  d.parts = withPart(d.parts, spec.list, got.id)
  const entry: TraceEntry = {
    field: spec.field,
    value: got.id,
    how: due.length ? 'needed' : 'rolled',
    rule: due.length ? `${spec.rule}, ${[...new Set(due.map(n => n.rule))].join(', ')}, G5` : spec.rule,
    ...keptTrace(got),
    dropped,
  }
  if (due.length) entry.by = due.map(n => n.by).join(', ')
  d.trace.push(entry)
  passOnRequires(ix, d, spec.list, got.id, got.pool.fallback !== undefined)
  return ok
}

export interface MultiSpec {
  step: string
  field: string
  list: string
  get(p: DraftParts): string[] | undefined
  /** The parts with the list set. */
  set(p: DraftParts, ids: string[]): DraftParts
  locked: boolean
  /** How many free parts, by weight (rules.json counts); the most parts the list holds is its length minus one. */
  counts: readonly number[]
  rule: string
  /** K-d: terms that use a key come only through a need (an ability that implies them), never as free parts. */
  keyBoundFromNeedsOnly?: boolean
}

/** A list of parts: the ones the needs set first, then free ones up to the rolled count, as many as fit (G16). */
export function rollMulti(ix: Index, d: Draft, spec: MultiSpec): StepResult {
  const max = spec.counts.length - 1
  const keyBound = (id: string): boolean => spec.keyBoundFromNeedsOnly === true && term(ix, spec.list, id)?.uses_key === true
  const now = spec.get(d.parts)
  if (now !== undefined) {
    const lone = spec.set(d.parts, [])
    for (const id of now) {
      const why = termProblem(ix, lone, spec.list, id)
      if (why) return fail(`the ${spec.locked ? 'locked' : 'chosen'} ${spec.field} ${id} does not fit: ${why}`)
    }
    const alone = spec.keyBoundFromNeedsOnly ? lockedTraitsWithoutAbility(ix, d, d.parts).filter(t => now.includes(t)) : []
    const why =
      allNeedsProblem(ix, d.parts, d.spice, d.needs) ??
      (alone.length ? `${alone[0]} uses a key, and no ability on the card implies it (K-d)` : undefined) ??
      lockProblem(ix, d, d.parts)
    if (why) return fail(`the ${spec.locked ? 'locked' : 'chosen'} ${spec.field} do not fit: ${why}`)
    d.trace.push({ field: spec.field, value: now, how: spec.locked ? 'locked' : 'input', rule: 'I1', candidates: 0 })
    for (const id of now) passOnRequires(ix, d, spec.list, id, true)
    return ok
  }
  const dice = diceFor(d.seed, spec.field, d.attempt)
  const want = dice.pick(spec.counts).index // the count is the field's first draw
  let parts = spec.set(d.parts, [])
  const chosen: string[] = []
  const notes: string[] = []
  // A candidate for the list as it stands: fits the hard rules with the parts chosen so far, keeps every need possible
  // (only the needs a part of this list can change are checked again).
  const recheck = needsAfter(ix, d.needs, spec.list)
  // A part a waiting lock rules out is drawn again (locks.ts).
  const accept = (id: string): string | undefined => lockProblem(ix, d, spec.set(d.parts, [...chosen, id]))
  const candidates = (exclude: readonly string[], only?: readonly string[]): Candidate[] => {
    const offer = offerTerms(ix, spec.set(d.parts, chosen), d.spice, spec.list, { except: [...chosen, ...exclude], ...(only ? { only } : {}) })
    const base = newMemo()
    return offer.candidates.filter(c => {
      const next = spec.set(d.parts, [...chosen, c.id])
      const memo = memoAfter(ix, base, spec.list)
      return ownRequiresProblem(ix, d, next, spec.list, c.id, memo) === undefined && allNeedsProblem(ix, next, d.spice, recheck, memo) === undefined
    })
  }
  // Needs this step must meet, one part each (G3: implied parts are set; G5: from the gate, else the least rare).
  const kinds = kindsOf(ix, spec.list)
  for (const n of dueNeeds(ix, d, spec.step).filter(x => x.links.some(l => kinds.has(parseLink(l).kind)))) {
    if (needAnswer(ix, spec.set(d.parts, chosen), n) === 'yes') continue
    const ids = n.links.map(l => l.slice(l.indexOf(':') + 1))
    const c = candidates([], ids)
    let pool = poolOf(ix, c, 'gate', d.spice)
    if (!pool.items.length && n.forced) pool = poolOf(ix, c, 'forced', d.spice)
    const got = drawKeeping(ix, d, dice, pool, accept, fitsLocks => poolOf(ix, c.filter(x => fitsLocks(x.id)), 'forced', d.spice))
    if (!got || chosen.length >= max) return fail(`${spec.field}: cannot meet ${n.by} (${n.rule})`)
    chosen.push(got.id)
    notes.push(`${got.id} for ${n.by} (${n.rule})${got.pool.fallback ? `; ${got.pool.fallback}` : ''}`)
  }
  // Free parts: the count rolled, the needed ones (but not key-bound ones) counted in it, never past the list's room.
  const counted = chosen.filter(id => !keyBound(id)).length
  const free = Math.max(0, Math.min(want - counted, max - chosen.length))
  let offered = 0
  for (let i = 0; i < free; i++) {
    const c = candidates([]).filter(x => !keyBound(x.id) && onOwnRolls(x))
    offered = Math.max(offered, c.length)
    const got = drawKeeping(ix, d, dice, poolOf(ix, c, 'gate', d.spice), accept)
    if (!got) break // G16: the card takes what fits (the locks included)
    chosen.push(got.id)
  }
  parts = spec.set(d.parts, chosen)
  d.parts = parts
  const entry: TraceEntry = { field: spec.field, value: chosen, how: notes.length ? 'needed' : 'rolled', rule: spec.rule, candidates: offered, note: `count ${want}${notes.length ? `; ${notes.join('; ')}` : ''}` }
  d.trace.push(entry)
  for (const id of chosen) passOnRequires(ix, d, spec.list, id, false)
  return ok
}
