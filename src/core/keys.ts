// The key count (K-a, K-g, P2), kept in this one place.
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

const isKeyKind = (ix: Index, kind: string | undefined): boolean => kind !== undefined && term(ix, 'ability-kinds', kind)?.uses_key === true

function impliedTraits(ix: Index, a: AbilityDraft): string[] {
  const p = a.pattern !== undefined ? patternOf(ix, a.pattern) : undefined
  if (!p?.generator) return []
  return blockOf(p, a.variant ?? null).implies.map(parseLink).filter(l => l.kind === 'mobility-trait').map(l => l.id)
}

/** Keys and passives of a card's parts (abilities with no kind yet count as neither). */
export function countKeys(ix: Index, parts: DraftParts, signatureOnPrimaryFireIsKey = SIGNATURE_ON_PRIMARY_FIRE_IS_KEY): KeyCount {
  const abilities = [parts.signature, ...(parts.abilities ?? [])].filter((a): a is AbilityDraft => a !== undefined)
  const onKey = abilities.filter(a => isKeyKind(ix, a.kind))
  const sameButton = new Set(onKey.flatMap(a => impliedTraits(ix, a)))
  const primaryFire = (a: AbilityDraft): boolean => a === parts.signature && a.primaryFire === true && !signatureOnPrimaryFireIsKey
  const keys =
    onKey.filter(a => !primaryFire(a)).length +
    (parts.mobility.traits ?? []).filter(t => term(ix, 'mobility-traits', t)?.uses_key === true && !sameButton.has(t)).length +
    (parts.armament.secondary ? 1 : 0)
  const passives = abilities.filter(a => a.kind !== undefined && !isKeyKind(ix, a.kind)).length
  return { keys, passives }
}
