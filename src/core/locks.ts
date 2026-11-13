// Locks and the draws of the steps before them (I1, G5, G7, T2).
//
// A lock is set at its own step (draft.ts). A step before it draws from the offer it would have without the lock, and
// when the lock rules the draw out (the drawn value does not fit the locked parts), it draws again on the same dice.
// This keeps the odds exact (rejection: each value that fits keeps its share), and it keeps T2: a card whose locked
// values break no rule is rolled again into the same card, since every draw that fits the locks is the draw it was.
// When nothing in the offer fits the locks, the least rare value that fits is used (G5: a part a lock needs is set).
import { term, type Index } from './data.ts'
import type { Dice } from './dice.ts'
import { lockWaits, locksWaiting, withPendingLocks } from './draft.ts'
import { abilitiesOf, budgetOf, impliedKeyTraits } from './keys.ts'
import { allNeedsProblem, needsOfBlock } from './needs.ts'
import { drawOne, poolOf, termProblem, UNIT_PARTS, type Candidate, type Pool } from './offer.ts'
import { blockFor, mayJoin, type Placed } from './patterns.ts'
import type { AbilityDraft, Draft, DraftParts, Need, TraceEntry } from './types.ts'

/** Does an ability (decided so far: its kind and cooldown may still be open) match a locked one? */
export function sameAbility(a: AbilityDraft, locked: AbilityDraft): boolean {
  return (
    a.pattern === locked.pattern &&
    (a.variant ?? null) === (locked.variant ?? null) &&
    (a.kind === undefined || a.kind === locked.kind) &&
    (a.cooldown === undefined || (a.cooldown ?? null) === (locked.cooldown ?? null))
  )
}

/** Why the extras a draft holds so far are not all among the locked extras (each matches one of its own), or undefined. */
export function pendingNotLocked(pending: readonly AbilityDraft[], locked: readonly AbilityDraft[]): string | undefined {
  const free = [...locked]
  for (const a of pending) {
    const i = free.findIndex(x => sameAbility(a, x))
    if (i < 0) return `the extra abilities are locked, and ${a.pattern} ${a.variant ?? ''} is not one of them`
    free.splice(i, 1)
  }
  return undefined
}

/** The needs of the locked abilities not set yet: their implied parts, requires, excludes and strengths (G3, G4, A7,
 *  M2), each needed by a lock (forced, G5). */
function lockNeeds(ix: Index, d: Draft): Need[] {
  const out: Need[] = []
  const add = (a: AbilityDraft | undefined): void => {
    if (a?.pattern === undefined || !ix.patternById.has(a.pattern)) return
    const p = ix.patternById.get(a.pattern)
    if (!p?.variants.some(v => v.id === a.variant)) return
    out.push(...needsOfBlock(blockFor(ix, a.pattern, a.variant ?? null), `pattern:${a.pattern}`, true))
  }
  if (lockWaits(d, 'signature', 'signature')) add(d.locked.signature)
  if (lockWaits(d, 'abilities', 'extra-abilities')) for (const a of d.locked.abilities ?? []) add(a)
  return out
}

/** K-d: the locked key-bound mobility traits that no ability on the card implies (they need one that does). */
export function lockedTraitsWithoutAbility(ix: Index, d: Draft, parts: DraftParts): string[] {
  if (!ix.data.rules.defaults.key_traits_only_when_implied) return []
  const all = withPendingLocks(d, parts) ?? parts
  const implied = new Set(abilitiesOf(all).flatMap(a => impliedKeyTraits(ix, a)))
  return (d.locked.mobility?.traits ?? []).filter(t => term(ix, 'mobility-traits', t)?.uses_key === true && !implied.has(t))
}

/** The mobility traits some pattern that can be an extra ability implies in one of its variants (worked out once). */
const EXTRA_TRAITS = new WeakMap<Index, Set<string>>()
function traitsExtrasImply(ix: Index): Set<string> {
  let out = EXTRA_TRAITS.get(ix)
  if (!out) {
    out = new Set()
    for (const p of ix.patterns) {
      if (!p.generator || p.generator.slot === 'signature') continue
      for (const v of p.variants) for (const l of blockFor(ix, p.id, v.id).implies) if (l.startsWith('mobility-trait:')) out.add(l.slice('mobility-trait:'.length))
    }
    EXTRA_TRAITS.set(ix, out)
  }
  return out
}

/**
 * Why a draft (a candidate placed on it) does not fit the locks still waiting for their steps, or undefined. With the
 * locks on top, every part must fit the others (G1, both ways), the abilities must go together (A6, A7, A11) and fit
 * the budgets (K-a, K-c), the extras placed so far must be among the locked extras, a locked key-bound trait must come
 * with an ability once the signature step has placed the needed extras (K-d), and, from step 5 on, every need must
 * stay possible, the locked abilities' needs included.
 */
export function lockProblem(ix: Index, d: Draft, next: DraftParts): string | undefined {
  const waiting = withPendingLocks(d, next)
  if (!waiting) return undefined
  let all = waiting
  if (lockWaits(d, 'abilities', 'extra-abilities')) {
    const why = pendingNotLocked(next.pending ?? [], d.locked.abilities ?? [])
    if (why) return why
    all = { ...all, pending: undefined } // the extras placed so far are among the locked ones
  }
  for (const list of Object.keys(UNIT_PARTS)) {
    for (const id of UNIT_PARTS[list]?.(all) ?? []) {
      if (typeof id !== 'string') continue
      const why = termProblem(ix, all, list, id)
      if (why) return `with the locked parts, ${list} ${id}: ${why}`
    }
  }
  const seen: Placed[] = []
  for (const a of abilitiesOf(all)) {
    if (a.pattern === undefined) continue
    const why = mayJoin(ix, seen, a.pattern, a.variant ?? null)
    if (why) return `with the locked abilities, ${a.pattern}: ${why}`
    seen.push({ pattern: a.pattern, variant: a.variant })
  }
  const budget = budgetOf(ix, all)
  if (budget) return `with the locked parts, ${budget}`
  if (lockWaits(d, 'mobility', 'mobility-traits') && next.signature !== undefined) {
    // K-d: once the signature is drawn, a locked key-bound trait no ability implies must come with an extra (step 4
    // places it), so some extra must be able to imply it; once step 4 is done, an ability must imply it.
    const alone = lockedTraitsWithoutAbility(ix, d, next).filter(t => d.done.includes('signature') || !traitsExtrasImply(ix).has(t))
    if (alone.length) return `the locked mobility trait ${alone[0]} uses a key, and no ability on the card implies it (K-d)`
  }
  // The needs are checked from step 5 on: before step 3 the card has no role, and during step 4 the extras the card
  // needs come after the signature (a need they meet looks impossible until they are placed; the step checks its own).
  if (!d.done.includes('signature')) return undefined
  const why = allNeedsProblem(ix, all, d.spice, [...d.needs, ...lockNeeds(ix, d)])
  return why ? `with the locked parts: ${why}` : undefined
}

/** A draw that kept to the locks: the value, its dice result, the pool it came from, and what the locks ruled out. */
export interface Kept {
  id: string
  draw: number
  pool: Pool
  ruledOut: Array<{ id: string; why: string }>
}

/**
 * The draw of a step that keeps to the locks still waiting for their steps. Without such locks it is the plain draw
 * (drawOne). Otherwise it draws from the step's own pool again and again on the same dice until a value fits (`accept`
 * gives why one does not); when no value in the pool fits, `fallback` gives the pool of the values that fit, the least
 * rare first (G5; only where rules.json spice_fallback is least-rare). Undefined when nothing fits.
 */
export function drawKeeping(
  ix: Index, d: Draft, dice: Dice, pool: Pool, accept: (id: string) => string | undefined, fallback?: (fits: (id: string) => boolean) => Pool,
): Kept | undefined {
  if (!locksWaiting(d)) {
    const got = drawOne(dice, pool)
    return got && { ...got, pool, ruledOut: [] }
  }
  const known = new Map<string, string | undefined>()
  const check = (id: string): string | undefined => {
    if (!known.has(id)) known.set(id, accept(id))
    return known.get(id)
  }
  const ruledOut: Kept['ruledOut'] = []
  let items = pool.items
  for (let tries = 0; items.some(i => !known.has(i.id) || known.get(i.id) === undefined); tries++) {
    // After many draws (the values that fit carry very little weight) the values known not to fit leave the pool.
    if (tries === 10000) items = items.filter(i => check(i.id) === undefined)
    const got = drawOne(dice, { items })
    if (!got) break
    if (known.has(got.id) && known.get(got.id) !== undefined) continue
    const why = check(got.id)
    if (why === undefined) return { id: got.id, draw: got.draw, pool, ruledOut }
    ruledOut.push({ id: got.id, why })
  }
  if (!fallback || ix.data.rules.defaults.spice_fallback !== 'least-rare') return undefined
  const fb = fallback(id => check(id) === undefined)
  const got = drawOne(dice, fb)
  return got && { id: got.id, draw: got.draw, pool: fb, ruledOut }
}

/** The fallback of drawKeeping for a step's candidates: those that fit, from the gate, else the least rare (G5). */
export function leastRareOf(ix: Index, d: Draft, candidates: readonly Candidate[]): (fits: (id: string) => boolean) => Pool {
  return fits => poolOf(ix, candidates.filter(c => fits(c.id)), 'forced', d.spice)
}

/** A short note for the trace: the values the locks ruled out first. */
export function ruledOutNote(kept: Kept | undefined): { note?: string } {
  if (!kept?.ruledOut.length) return {}
  const shown = kept.ruledOut.slice(0, 3).map(r => `${r.id} (${r.why})`).join('; ')
  return { note: `drawn again on the same dice; the locks ruled out ${shown}${kept.ruledOut.length > 3 ? `, and ${kept.ruledOut.length - 3} more` : ''}` }
}

/** The trace fields of a draw that kept to the locks: its pool, its dice result, the gate note and what was ruled out. */
export function keptTrace(got: Kept): Pick<TraceEntry, 'candidates' | 'options' | 'draw' | 'aboveGate' | 'note'> {
  return {
    candidates: got.pool.items.length,
    options: got.pool.items.map(i => ({ id: i.id, weight: i.weight })),
    draw: got.draw,
    ...(got.pool.fallback ? { aboveGate: got.pool.fallback } : {}),
    ...ruledOutNote(got),
  }
}
