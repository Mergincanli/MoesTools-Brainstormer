// The draft of a card: the inputs are set first, each lock at its own step (I1: a class, part or lock you choose is
// always used), and the steps fill the rest in the roll order. The steps before a lock keep to it by drawing again
// when it rules their draw out (locks.ts), so a lock on a card's own value gives the same card (T2).
import { term, termsOf, type Index } from './data.ts'
import { maxSpice } from './odds.ts'
import type { Draft, DraftParts, Inputs, LockName, LockValues, RollRequest, TraceEntry } from './types.ts'

/** The parts that can be locked, in the card schema's order (concept-card.schema.json, $defs.lockable). */
export const LOCKABLE: readonly LockName[] = [
  'class', 'tier', 'flavour', 'name', 'roles', 'mobility', 'speed', 'body', 'size', 'primary', 'secondary',
  'conditional', 'armour', 'sensors', 'crew', 'signature', 'abilities', 'modes', 'resource', 'on_death',
]

export function emptyParts(): DraftParts {
  return { roles: {}, mobility: {}, body: {}, armament: {}, armour: {}, sensors: {}, crew: {} }
}

/** A deep copy of plain data (locks come from the caller and must never be changed through the draft). */
const copy = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T

/** One piece of a lock: the roll step it belongs to, and how it sets its card fields. */
interface LockPiece {
  step: string
  set(p: DraftParts): DraftParts
}

/**
 * The pieces of the locks, each with the step that sets its fields (rules.json roll_order ids). Readings (reported):
 * the roles lock sets the primary role at step 3 and the secondary roles at their own step (16), so the steps between
 * see them as they would on a card rolled without the lock; the mobility lock keeps base and handling (step 5) and the
 * traits (step 9; speed has its own lock); the body lock keeps the body plan only, since the body count follows the
 * crew (rolled with it at step 12), and a crew lock may carry the count; the extra abilities' lock is set at step 14,
 * and the extras step 4 places for the card's needs must be among them. The name lock is set at once (nothing rolls
 * it yet); the weapons, modes, resource and on-death locks wait for their steps.
 */
function lockPieces(L: Partial<LockValues>): LockPiece[] {
  const out: LockPiece[] = []
  const add = (step: string, set: LockPiece['set']): void => { out.push({ step, set }) }
  if (L.class !== undefined) add('class', p => ({ ...p, class: L.class }))
  if (L.tier !== undefined) add('tier-and-flavour', p => ({ ...p, tier: L.tier }))
  if (L.flavour !== undefined) add('tier-and-flavour', p => ({ ...p, flavour: L.flavour }))
  if (L.roles !== undefined) {
    add('primary-role', p => ({ ...p, roles: { ...p.roles, primary: L.roles?.primary } }))
    add('secondary-roles', p => ({ ...p, roles: { ...p.roles, secondary: L.roles?.secondary } }))
  }
  if (L.signature !== undefined) add('signature', p => ({ ...p, signature: L.signature }))
  if (L.mobility !== undefined) {
    add('mobility', p => ({ ...p, mobility: { ...p.mobility, base: L.mobility?.base, handling: L.mobility?.handling } }))
    add('mobility-traits', p => ({ ...p, mobility: { ...p.mobility, traits: L.mobility?.traits } }))
  }
  if (L.body !== undefined) add('body', p => ({ ...p, body: { ...p.body, plan: L.body?.plan } }))
  if (L.size !== undefined) add('size', p => ({ ...p, body: { ...p.body, size: L.size } }))
  if (L.speed !== undefined) add('speed', p => ({ ...p, mobility: { ...p.mobility, speed: L.speed } }))
  if (L.armour !== undefined) add('armour', p => ({ ...p, armour: { class: L.armour?.class, models: L.armour?.models } }))
  if (L.sensors !== undefined) add('sensors', p => ({ ...p, sensors: { sight: L.sensors?.sight, traits: L.sensors?.traits } }))
  if (L.crew !== undefined) {
    add('crew', p => ({
      ...p,
      crew: { model: L.crew?.model, solo_fallback: L.crew?.solo_fallback, passengers: L.crew?.passengers },
      body: L.crew?.count !== undefined ? { ...p.body, count: L.crew.count } : p.body,
    }))
  }
  if (L.primary !== undefined) add('weapons', p => ({ ...p, armament: { ...p.armament, primary: L.primary } }))
  if (L.secondary !== undefined) add('weapons', p => ({ ...p, armament: { ...p.armament, secondary: L.secondary } }))
  if (L.conditional !== undefined) add('weapons', p => ({ ...p, armament: { ...p.armament, conditional: L.conditional } }))
  if (L.abilities !== undefined) add('extra-abilities', p => ({ ...p, abilities: L.abilities }))
  if (L.modes !== undefined) add('extra-abilities', p => ({ ...p, modes: L.modes }))
  if (L.resource !== undefined) add('on-death', p => ({ ...p, resource: L.resource }))
  if (L.on_death !== undefined) add('on-death', p => ({ ...p, on_death: L.on_death }))
  return out
}

/** The pieces of a draft's locks (worked out once: the draft's locks are its own copy and never change). */
const PIECES = new WeakMap<object, LockPiece[]>()
function piecesOf(d: Draft): LockPiece[] {
  let pieces = PIECES.get(d.locked)
  if (!pieces) {
    pieces = lockPieces(d.locked)
    PIECES.set(d.locked, pieces)
  }
  return pieces
}

/** Sets the locked fields of a step on the draft, before the step runs (a lock is set at its own step). */
export function applyStepLocks(d: Draft, step: string): void {
  if (d.lockSteps.includes(step)) return
  for (const piece of piecesOf(d)) if (piece.step === step) d.parts = piece.set(d.parts)
  d.lockSteps.push(step)
}

/** Is some lock still waiting for its step? */
export function locksWaiting(d: Draft): boolean {
  return piecesOf(d).some(piece => !d.lockSteps.includes(piece.step))
}

/** Is this lock set, and its step (the step named) not run yet? */
export function lockWaits(d: Draft, name: LockName, step: string): boolean {
  return d.locked[name] !== undefined && !d.lockSteps.includes(step)
}

/** The parts with every lock not set yet put on top (undefined when no lock is waiting for its step). A step draws from
 *  the offer it would have without these locks, and draws again when a lock rules its draw out (locks.ts). */
export function withPendingLocks(d: Draft, parts: DraftParts): DraftParts | undefined {
  const waiting = piecesOf(d).filter(piece => !d.lockSteps.includes(piece.step))
  if (!waiting.length) return undefined
  return waiting.reduce((p, piece) => piece.set(p), parts)
}

export function inputsOf(request: RollRequest): Inputs {
  const i = request.inputs ?? {}
  return { class: i.class ?? null, tier: i.tier ?? null, flavour: i.flavour ?? null, role: i.role ?? null }
}

/** A fresh draft for one attempt: the inputs set, the locks waiting for their steps, nothing rolled yet. */
export function newDraft(request: RollRequest, attempt: number): Draft {
  const inputs = inputsOf(request)
  const locks = request.locks ?? {}
  const parts = emptyParts()
  if (inputs.class !== null) parts.class = inputs.class
  if (inputs.tier !== null) parts.tier = inputs.tier
  if (inputs.flavour !== null) parts.flavour = inputs.flavour
  if (inputs.role !== null) parts.roles.primary = inputs.role
  const d: Draft = {
    seed: request.seed,
    spice: request.spice,
    attempt,
    inputs,
    locks: LOCKABLE.filter(n => locks[n] !== undefined),
    locked: copy(locks),
    lockSteps: [],
    parts,
    needs: [],
    done: [],
    trace: [],
  }
  if (locks.name !== undefined) d.name = locks.name
  return d
}

/** Was this field set by a lock or by an input (for the trace)? */
export function fixedBy(d: Draft, field: 'class' | 'tier' | 'flavour' | 'roles'): 'locked' | 'input' | undefined {
  if (d.locks.includes(field)) return 'locked'
  const input = field === 'roles' ? d.inputs.role : d.inputs[field]
  return input !== null ? 'input' : undefined
}

export function trace(d: Draft, entry: TraceEntry): void {
  d.trace.push(entry)
}

/** Why a request cannot be rolled at all (a value that is not a term, a spice out of range, an input and a lock that
 *  disagree), or undefined when it can be tried. */
export function requestProblem(ix: Index, request: RollRequest): string | undefined {
  if (typeof request.seed !== 'string' || request.seed.length === 0) return 'the seed must be a text of one character or more'
  const top = maxSpice(ix)
  if (!Number.isInteger(request.spice) || request.spice < 1 || request.spice > top) return `the spice must be a whole number from 1 to ${top}`
  const termOk = (list: string, id: unknown): boolean => typeof id === 'string' && !!term(ix, list, id) && !term(ix, list, id)?.source_only
  const inputs = inputsOf(request)
  const lists: Array<[keyof Inputs, string]> = [['class', 'classes'], ['tier', 'tiers'], ['flavour', 'faction-flavours'], ['role', 'roles']]
  for (const [k, list] of lists) {
    const v = inputs[k]
    if (v !== null && !termOk(list, v)) return `input ${k} '${String(v)}' is not a term of ${list} that a card can use`
  }
  const locks = request.locks ?? {}
  for (const k of Object.keys(locks)) if (!(LOCKABLE as readonly string[]).includes(k)) return `'${k}' is not a part that can be locked`
  const simple: Array<[LockName, string]> = [['class', 'classes'], ['tier', 'tiers'], ['flavour', 'faction-flavours'], ['speed', 'speed-bands'], ['size', 'sizes']]
  for (const [k, list] of simple) {
    const v = locks[k]
    if (v !== undefined && !termOk(list, v)) return `locked ${k} '${String(v)}' is not a term of ${list} that a card can use`
  }
  if (locks.roles !== undefined) {
    const r = locks.roles
    if (!termOk('roles', r.primary) || !Array.isArray(r.secondary) || !r.secondary.every(x => termOk('roles', x))) return 'the locked roles are not terms of roles'
  }
  for (const [k, lock] of [['class', locks.class], ['tier', locks.tier], ['flavour', locks.flavour]] as const) {
    const input = inputs[k]
    if (lock !== undefined && input !== null && lock !== input) return `the chosen ${k} '${input}' and the locked ${k} '${lock}' differ`
  }
  if (locks.roles !== undefined && inputs.role !== null && locks.roles.primary !== inputs.role) {
    return `the chosen role '${inputs.role}' and the locked primary role '${locks.roles.primary}' differ`
  }
  return undefined
}

/** The ids of a word list whose weight in a table is above 0, in the word list's order (section 1 input odds). */
export function weightedIds(ix: Index, list: string, weights: Readonly<Record<string, number>>): string[] {
  return termsOf(ix, list).filter(t => (weights[t.id] ?? 0) > 0).map(t => t.id)
}
