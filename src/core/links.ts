// Typed-link matching against a card draft (rule N1). It mirrors `matches` in scripts/validate.mjs, kind by kind,
// and adds a third answer for a draft that is only partly filled: 'open' means the parts that decide the link are
// not chosen yet, so a later step can still make it hold or fail. A finished card only ever gets 'yes' or 'no'.
import { categoryOf, cmpRank, rank, term, type Index } from './data.ts'
import type { DraftParts, Link, WeaponDraft } from './types.ts'

export type Tri = 'yes' | 'no' | 'open'

export interface ParsedLink {
  kind: string
  cmp: '<=' | '>=' | null
  id: string
}

/** kind:id, kind:<=id or kind:>=id (validate.mjs parseRef). */
export function parseLink(link: Link): ParsedLink {
  const i = link.indexOf(':')
  const kind = link.slice(0, i)
  let id = link.slice(i + 1)
  let cmp: ParsedLink['cmp'] = null
  if (id.startsWith('<=') || id.startsWith('>=')) {
    cmp = id.slice(0, 2) as '<=' | '>='
    id = id.slice(2)
  }
  return { kind, cmp, id }
}

const tri = (b: boolean): Tri => (b ? 'yes' : 'no')

/** One value that may be open (undefined). */
function one(value: string | null | undefined, test: (v: string) => boolean): Tri {
  if (value === undefined) return 'open'
  if (value === null) return 'no'
  return tri(test(value))
}

/** A list that may be open (undefined): does any item pass? */
function some(list: readonly string[] | undefined, test: (v: string) => boolean): Tri {
  if (list === undefined) return 'open'
  return tri(list.some(test))
}

/** 'yes' if any answer is yes; else 'open' if any is open (or more may come); else 'no'. */
export function anyOf(answers: Iterable<Tri>, moreMayCome = false): Tri {
  let open = moreMayCome
  for (const a of answers) {
    if (a === 'yes') return 'yes'
    if (a === 'open') open = true
  }
  return open ? 'open' : 'no'
}

/** The card's weapons: primary, secondary and the conditional ones (validate.mjs cardProfile), and whether more may come. */
export function weaponsOf(parts: DraftParts): { weapons: WeaponDraft[]; complete: boolean } {
  const a = parts.armament
  const weapons: WeaponDraft[] = []
  if (a.primary) weapons.push(a.primary)
  if (a.secondary) weapons.push(a.secondary)
  for (const c of a.conditional ?? []) weapons.push(c.weapon)
  return { weapons, complete: a.primary !== undefined && a.secondary !== undefined && a.conditional !== undefined }
}

/** The patterns of the card's abilities (signature first), and whether more may come. */
export function abilityPatternsOf(parts: DraftParts): { patterns: Array<string | undefined>; complete: boolean } {
  const patterns: Array<string | undefined> = []
  if (parts.signature) patterns.push(parts.signature.pattern)
  for (const a of parts.abilities ?? []) patterns.push(a.pattern)
  return { patterns, complete: parts.signature !== undefined && parts.abilities !== undefined }
}

/**
 * What kind of target the unit is, from its mobility; a tiny or small ground unit counts as infantry (target-types
 * word list; validate.mjs targetType compares the size's rank with 2, the rank of small). undefined while open.
 */
export function targetOf(ix: Index, mobility: string | undefined, size: string | undefined): string | undefined {
  if (mobility === undefined) return undefined
  const tt = term(ix, 'mobility', mobility)?.target_type
  if (tt !== 'ground-vehicle') return tt
  if (size === undefined) return undefined
  const r = rank(ix, 'sizes', size)
  const small = rank(ix, 'sizes', 'small')
  return r !== undefined && small !== undefined && r <= small ? 'infantry' : tt
}

/** Does the draft have the part a typed link names? */
export function matchLink(ix: Index, parts: DraftParts, link: Link, costBand?: string): Tri {
  const { kind, cmp, id } = parseLink(link)
  const ranked = (list: string, value: string | null | undefined): Tri => one(value, v => cmpRank(ix, list, v, cmp, id))
  const anyWeapon = (test: (w: WeaponDraft) => Tri): Tri => {
    const { weapons, complete } = weaponsOf(parts)
    return anyOf(weapons.map(test), !complete)
  }
  switch (kind) {
    case 'class':
      return one(parts.class, v => v === id)
    case 'role': {
      const r = parts.roles
      return anyOf([one(r.primary, v => v === id), some(r.secondary, v => v === id)])
    }
    case 'tier':
      return ranked('tiers', parts.tier)
    case 'cost':
      return ranked('cost-bands', costBand)
    case 'availability':
      return one(parts.availability, v => v === id)
    case 'damage':
      return anyWeapon(w => one(w.damage, v => v === id))
    case 'armour-class':
      return ranked('armour-classes', parts.armour.class)
    case 'armour-model':
      return some(parts.armour.models, v => v === id)
    case 'weapon':
      return anyWeapon(w => one(w.family, v => v === id))
    case 'mobility':
      return one(parts.mobility.base, v => v === id)
    case 'mobility-trait':
      return some(parts.mobility.traits, v => v === id)
    case 'handling':
      return one(parts.mobility.handling, v => v === id)
    case 'body':
      return one(parts.body.plan, v => v === id)
    case 'size':
      return ranked('sizes', parts.body.size)
    case 'speed':
      return ranked('speed-bands', parts.mobility.speed)
    case 'crew':
      return one(parts.crew.model, v => v === id)
    case 'passengers': {
      const p = parts.crew.passengers
      if (p === undefined) return 'open'
      const seats = p === null ? 0 : p.seats
      const n = Number(id)
      return tri(cmp === '>=' ? seats >= n : cmp === '<=' ? seats <= n : seats === n)
    }
    case 'mount':
      return anyWeapon(w => one(w.mount, v => v === id))
    case 'delivery':
      return anyWeapon(w => one(w.delivery, v => v === id))
    case 'range':
      return anyWeapon(w => one(w.range, v => cmpRank(ix, 'range-bands', v, cmp, id)))
    case 'weapon-trait':
      return anyWeapon(w => some(w.traits, v => v === id))
    case 'target': {
      const t = targetOf(ix, parts.mobility.base, parts.body.size)
      return t === undefined ? 'open' : tri(t === id)
    }
    case 'hits':
      return anyWeapon(w => some(w.can_target, v => v === id))
    case 'sight':
      return ranked('sight-bands', parts.sensors.sight)
    case 'sensor':
      return some(parts.sensors.traits, v => v === id)
    case 'nature':
      return one(parts.nature, v => v === id)
    case 'category': {
      const { patterns, complete } = abilityPatternsOf(parts)
      return anyOf(
        patterns.map(p => (p === undefined ? 'open' : tri(categoryOf(ix, p) === id))),
        !complete,
      )
    }
    case 'resource':
      return one(parts.resource, v => v === id)
    case 'pattern': {
      const { patterns, complete } = abilityPatternsOf(parts)
      return anyOf(
        patterns.map(p => (p === undefined ? 'open' : tri(p === id))),
        !complete,
      )
    }
    default:
      // immune: and unit: never match a card (N1); an unknown kind matches nothing, as in the validator.
      return 'no'
  }
}
