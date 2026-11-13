// The draft of a card: the inputs and the locked parts are set first (I1: a class, part or lock you choose is always
// used), then the steps fill the rest in the roll order.
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

/**
 * Puts the locked values on the draft. Each lock fills the card fields it names; two readings (reported):
 * the mobility lock keeps base, handling and traits (speed has its own lock), and the body lock keeps the body plan
 * only, since the body count follows the crew (it is rolled with the crew at step 12); a crew lock may carry the
 * count.
 */
function applyLocks(d: Draft, locks: Partial<LockValues>): void {
  const p = d.parts
  const L = copy(locks)
  if (L.class !== undefined) p.class = L.class
  if (L.tier !== undefined) p.tier = L.tier
  if (L.flavour !== undefined) p.flavour = L.flavour
  if (L.name !== undefined) d.name = L.name
  if (L.roles !== undefined) p.roles = { primary: L.roles.primary, secondary: L.roles.secondary }
  if (L.mobility !== undefined) p.mobility = { ...p.mobility, base: L.mobility.base, handling: L.mobility.handling, traits: L.mobility.traits }
  if (L.speed !== undefined) p.mobility.speed = L.speed
  if (L.body !== undefined) p.body.plan = L.body.plan
  if (L.size !== undefined) p.body.size = L.size
  if (L.primary !== undefined) p.armament.primary = L.primary
  if (L.secondary !== undefined) p.armament.secondary = L.secondary
  if (L.conditional !== undefined) p.armament.conditional = L.conditional
  if (L.armour !== undefined) p.armour = { class: L.armour.class, models: L.armour.models }
  if (L.sensors !== undefined) p.sensors = { sight: L.sensors.sight, traits: L.sensors.traits }
  if (L.crew !== undefined) {
    p.crew = { model: L.crew.model, solo_fallback: L.crew.solo_fallback, passengers: L.crew.passengers }
    if (L.crew.count !== undefined) p.body.count = L.crew.count
  }
  if (L.signature !== undefined) p.signature = L.signature
  if (L.abilities !== undefined) p.abilities = L.abilities
  if (L.modes !== undefined) p.modes = L.modes
  if (L.resource !== undefined) p.resource = L.resource
  if (L.on_death !== undefined) p.on_death = L.on_death
}

export function inputsOf(request: RollRequest): Inputs {
  const i = request.inputs ?? {}
  return { class: i.class ?? null, tier: i.tier ?? null, flavour: i.flavour ?? null, role: i.role ?? null }
}

/** A fresh draft for one attempt: the inputs and the locks set, nothing rolled yet. */
export function newDraft(request: RollRequest, attempt: number): Draft {
  const inputs = inputsOf(request)
  const locks = request.locks ?? {}
  const d: Draft = {
    seed: request.seed,
    spice: request.spice,
    attempt,
    inputs,
    locks: LOCKABLE.filter(n => locks[n] !== undefined),
    locked: copy(locks),
    parts: emptyParts(),
    needs: [],
    trace: [],
  }
  if (inputs.class !== null) d.parts.class = inputs.class
  if (inputs.tier !== null) d.parts.tier = inputs.tier
  if (inputs.flavour !== null) d.parts.flavour = inputs.flavour
  if (inputs.role !== null) d.parts.roles.primary = inputs.role
  applyLocks(d, locks)
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
