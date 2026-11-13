// The key count (K-a, K-c, K-g, P2) and the seats that own the card's abilities and secondary weapon (A5), kept in
// this one place.
//
// A key is: an ability whose kind uses a key; a key-bound mobility trait; the secondary weapon. A key-bound mobility
// trait and the ability that implies it are one button and count as one key (K1, P2): only an ability that is itself
// on a key takes the trait's key with it; under a passive one the trait keeps its own. Passive and triggered abilities
// count against max_passive. This is how scripts/validate.mjs counts keys today.
import { blockOf, patternOf, term, type Index } from './data.ts'
import { parseLink } from './links.ts'
import type { AbilityDraft, DraftParts } from './types.ts'

/**
 * Question K2 (open until Mustafa approves the card property): is a signature that is the card's primary weapon,
 * fired with primary fire, a key? Today it is, as the validator counts it. Answer K2 A sets this to false.
 */
export const SIGNATURE_ON_PRIMARY_FIRE_IS_KEY = true

export interface KeyCount {
  keys: number
  passives: number
}

export const isKeyKind = (ix: Index, kind: string | undefined): boolean => kind !== undefined && term(ix, 'ability-kinds', kind)?.uses_key === true

/** The key-bound mobility traits an ability's pattern (or variant) implies (worked out once per block). */
export function impliedKeyTraits(ix: Index, a: AbilityDraft): string[] {
  const p = a.pattern !== undefined ? patternOf(ix, a.pattern) : undefined
  if (!p?.generator) return []
  const block = blockOf(p, a.variant ?? null)
  const known = KEY_TRAITS.get(block)
  if (known) return known
  const out = block.implies.map(parseLink).filter(l => l.kind === 'mobility-trait' && term(ix, 'mobility-traits', l.id)?.uses_key === true).map(l => l.id)
  KEY_TRAITS.set(block, out)
  return out
}
const KEY_TRAITS = new WeakMap<object, string[]>()

/** The card's abilities in order: the signature, then the extras (chosen so far). */
export function abilitiesOf(parts: DraftParts): AbilityDraft[] {
  return [parts.signature, ...(parts.abilities ?? []), ...(parts.pending ?? [])].filter((a): a is AbilityDraft => a !== undefined)
}

/** Keys and passives of a card's parts (abilities with no kind yet count as neither). */
export function countKeys(ix: Index, parts: DraftParts, signatureOnPrimaryFireIsKey = SIGNATURE_ON_PRIMARY_FIRE_IS_KEY): KeyCount {
  const seats = seatKeys(ix, parts, signatureOnPrimaryFireIsKey)
  const keys = Object.values(seats).reduce((n, k) => n + k, 0)
  const passives = abilitiesOf(parts).filter(a => a.kind !== undefined && !isKeyKind(ix, a.kind)).length
  return { keys, passives }
}

/** The seats of the card's crew model (only the driver while the crew is not chosen: the driver holds everything). */
export function crewSeats(ix: Index, parts: DraftParts): string[] {
  const model = parts.crew.model
  return (model !== undefined ? term(ix, 'crew-models', model)?.seats : undefined) ?? ['driver']
}

export interface SeatPlan {
  /** The seat of each ability, signature first. */
  abilities: string[]
  /** The seat of the secondary weapon, when the card has one. */
  secondary: string | undefined
  /** The operating seats beyond the driver that the crew has (rules.json defaults.seats.operating). */
  operating: string[]
}

/**
 * A5: who owns what. The driver owns every weapon and ability no other seat owns. Each operating seat the crew has
 * takes, in its order of choice (rules.json defaults.seats), the first thing the card has that no seat took yet: the
 * secondary weapon (a gunner), the last extra ability or, with no extra, the signature (a commander).
 */
export function seatPlan(ix: Index, parts: DraftParts): SeatPlan {
  const rules = ix.data.rules.defaults.seats
  const crew = crewSeats(ix, parts)
  const extras = [...(parts.abilities ?? []), ...(parts.pending ?? [])]
  const has: Record<string, boolean> = {
    'secondary-weapon': !!parts.armament.secondary,
    'last-extra': extras.length > 0,
    signature: parts.signature !== undefined,
  }
  const owner: Record<string, string> = {}
  const operating = rules.operating.filter(s => crew.includes(s))
  for (const seat of operating) {
    const choices = (rules as unknown as Record<string, string[] | undefined>)[seat] ?? []
    const take = choices.find(c => has[c] && owner[c] === undefined)
    if (take) owner[take] = seat
  }
  const abilities = [owner.signature ?? 'driver', ...extras.map((_, i) => (i === extras.length - 1 ? owner['last-extra'] ?? 'driver' : 'driver'))]
  return { abilities, secondary: parts.armament.secondary ? owner['secondary-weapon'] ?? 'driver' : undefined, operating }
}

/** K-c: the keys each seat holds. Movement traits sit with the driver, unless they share the button of an ability on a key. */
export function seatKeys(ix: Index, parts: DraftParts, signatureOnPrimaryFireIsKey = SIGNATURE_ON_PRIMARY_FIRE_IS_KEY): Record<string, number> {
  const plan = seatPlan(ix, parts)
  const out: Record<string, number> = {}
  const add = (seat: string): void => { out[seat] = (out[seat] ?? 0) + 1 }
  const abilities = abilitiesOf(parts)
  const sameButton = new Set<string>()
  abilities.forEach((a, i) => {
    if (!isKeyKind(ix, a.kind)) return
    for (const t of impliedKeyTraits(ix, a)) sameButton.add(t)
    const primaryFire = i === 0 && a.primaryFire === true && !signatureOnPrimaryFireIsKey
    if (!primaryFire) add(plan.abilities[i] ?? 'driver')
  })
  for (const t of parts.mobility.traits ?? []) {
    if (term(ix, 'mobility-traits', t)?.uses_key === true && !sameButton.has(t)) add('driver')
  }
  if (parts.armament.secondary) add(plan.secondary ?? 'driver')
  return out
}

/** Section 5: why the parts break the key budget, the passive budget or the keys of a seat, or undefined when they fit. */
export function budgetProblem(ix: Index, parts: DraftParts): string | undefined {
  const tier = parts.tier !== undefined ? term(ix, 'tiers', parts.tier) : undefined
  if (!tier) return undefined
  const { keys, passives } = countKeys(ix, parts)
  if (tier.max_keys !== undefined && keys > tier.max_keys) return `${keys} keys, over the ${parts.tier} budget of ${tier.max_keys} (K-a)`
  if (tier.max_passive !== undefined && passives > tier.max_passive) return `${passives} passives, over the ${parts.tier} budget of ${tier.max_passive} (K-a)`
  for (const [seat, n] of Object.entries(seatKeys(ix, parts))) {
    if (tier.max_keys_per_seat !== undefined && n > tier.max_keys_per_seat) return `the ${seat} seat holds ${n} keys, over ${tier.max_keys_per_seat} (K-c)`
  }
  return undefined
}

/** The parts as the key count sees them while the mobility traits are open: each key-bound trait an ability implies is
 *  counted (K-d: it comes with the ability; step 9 sets it). */
function forBudget(ix: Index, parts: DraftParts): DraftParts {
  if (parts.mobility.traits !== undefined) return parts
  const traits = [...new Set(abilitiesOf(parts).flatMap(a => impliedKeyTraits(ix, a)))]
  return { ...parts, mobility: { ...parts.mobility, traits } }
}

/** The budgets (K-a, K-c) of a draft, the key-bound traits its abilities imply counted while the traits are open. */
export function budgetOf(ix: Index, parts: DraftParts): string | undefined {
  return budgetProblem(ix, forBudget(ix, parts))
}
