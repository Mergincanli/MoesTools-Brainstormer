// The offer filter: which terms of one word list fit a draft, and with which weight.
//
// G1  a term is offered only if it is not source_only, the card's class is in its classes, the tier is at least its
//     min_tier, its allowed and excluded maps accept every part chosen so far, and theirs accept it. "Theirs" also
//     covers the classes and min_tier of the parts already chosen, when the class or the tier is the one offered.
//     Maps are read the way scripts/validate.mjs reads them: a unit-wide term's maps against the unit-wide parts and
//     every weapon's parts; a weapon term's maps against that weapon's own parts and the unit-wide parts.
// G2  a requires group (its own, or a chosen part's) that can no longer hold drops the term; a group that is still
//     open is left for the later steps, which must set it (the caller records it as a need).
// G9, S1 to S4: the odds (odds.ts). G6: a part the flavour avoids is held back below avoided_until_spice.
// G5  the pool to draw from: on the generator's own rolls only parts at the spice gate and not held back; when an
//     input or a lock needs the part, the same pool, or if it is empty the least rare parts that fit.
// G16 take what fits: a count draws distinct parts until the pool is empty (pickDistinct).
import { blockOf, patternOf, term, termsOf, tierAtLeast, type Index } from './data.ts'
import type { Dice } from './dice.ts'
import { matchLink } from './links.ts'
import { rarityRank, termOdds, type Odds } from './odds.ts'
import type { DraftParts, Term, WeaponDraft } from './types.ts'

type Values = Array<string | null | undefined>

/** The unit-wide parts the combination rules read, by word list (validate.mjs UNIT_PARTS). */
export const UNIT_PARTS: Readonly<Record<string, (p: DraftParts) => Values>> = {
  classes: p => [p.class],
  tiers: p => [p.tier],
  nature: p => [p.nature],
  availability: p => [p.availability],
  roles: p => [p.roles.primary, ...(p.roles.secondary ?? [])],
  mobility: p => [p.mobility.base],
  handling: p => [p.mobility.handling],
  'mobility-traits': p => p.mobility.traits ?? [],
  'speed-bands': p => [p.mobility.speed],
  bodies: p => [p.body.plan],
  sizes: p => [p.body.size],
  'armour-classes': p => [p.armour.class],
  'armour-models': p => p.armour.models ?? [],
  'sight-bands': p => [p.sensors.sight],
  'sensor-traits': p => p.sensors.traits ?? [],
  'crew-models': p => [p.crew.model],
  resources: p => [p.resource],
  'ability-kinds': p => [p.signature?.kind, ...(p.abilities ?? []).map(a => a.kind)],
  'on-death': p => p.on_death ?? [],
}

/** The parts of one weapon, by word list (validate.mjs WEAPON_PARTS). */
export const WEAPON_PARTS: Readonly<Record<string, (w: WeaponDraft) => Values>> = {
  'weapon-families': w => [w.family],
  'aim-models': w => [w.mount],
  'damage-types': w => [w.damage],
  'weapon-delivery': w => [w.delivery],
  'target-types': w => w.can_target ?? [],
  'range-bands': w => [w.range],
  'weapon-traits': w => w.traits ?? [],
}

export const isWeaponList = (list: string): boolean => Object.hasOwn(WEAPON_PARTS, list)

const present = (values: Values): string[] => [...new Set(values.filter((v): v is string => typeof v === 'string'))]

function unitValues(parts: DraftParts, list: string): string[] {
  const read = UNIT_PARTS[list]
  return read ? present(read(parts)) : []
}

function weaponValues(w: WeaponDraft, list: string): string[] {
  const read = WEAPON_PARTS[list]
  return read ? present(read(w)) : []
}

function allWeapons(parts: DraftParts): WeaponDraft[] {
  const a = parts.armament
  return [a.primary, a.secondary, ...(a.conditional ?? []).map(c => c.weapon)].filter((w): w is WeaponDraft => !!w)
}

/**
 * The two exemptions the word lists state in prose (validate.mjs exempt): a weapon with the anti-air trait may reach
 * high air when its family reaches low air, and an adaptive weapon has no fixed family, so no list of allowed families
 * binds it.
 */
export function exempt(ix: Index, ownerList: string, key: string, value: string, weapon?: WeaponDraft): boolean {
  if (ownerList === 'weapon-families' && key === 'target-types' && value === 'high-air') {
    const fam = weapon?.family !== undefined ? term(ix, 'weapon-families', weapon.family) : undefined
    return (weapon?.traits ?? []).includes('anti-air') && (fam?.allowed?.['target-types'] ?? ['low-air']).includes('low-air')
  }
  return key === 'weapon-families' && value === 'adaptive'
}

/** A chosen term on the draft, with the weapon it belongs to (for a weapon part). */
interface Chosen {
  list: string
  id: string
  t: Term
  weapon?: WeaponDraft
}

function chosenTerms(ix: Index, parts: DraftParts, weapons: readonly WeaponDraft[]): Chosen[] {
  const out: Chosen[] = []
  for (const list of Object.keys(UNIT_PARTS)) {
    for (const id of unitValues(parts, list)) {
      const t = term(ix, list, id)
      if (t) out.push({ list, id, t })
    }
  }
  for (const w of weapons) {
    for (const list of Object.keys(WEAPON_PARTS)) {
      for (const id of weaponValues(w, list)) {
        const t = term(ix, list, id)
        if (t) out.push({ list, id, t, weapon: w })
      }
    }
  }
  return out
}

/** The draft with one more part: the candidate placed where its list belongs (for the requires check of G2). */
export function withPart(parts: DraftParts, list: string, id: string, weapon?: WeaponDraft): DraftParts {
  const p: DraftParts = {
    ...parts,
    roles: { ...parts.roles },
    mobility: { ...parts.mobility },
    body: { ...parts.body },
    armament: { ...parts.armament },
    armour: { ...parts.armour },
    sensors: { ...parts.sensors },
    crew: { ...parts.crew },
  }
  if (isWeaponList(list)) {
    const w = weapon ?? {}
    const next: WeaponDraft = { ...w }
    if (list === 'weapon-families') next.family = id
    else if (list === 'aim-models') next.mount = id
    else if (list === 'damage-types') next.damage = id
    else if (list === 'weapon-delivery') next.delivery = id
    else if (list === 'range-bands') next.range = id
    else if (list === 'target-types') next.can_target = [...(w.can_target ?? []), id]
    else if (list === 'weapon-traits') next.traits = [...(w.traits ?? []), id]
    const a = p.armament
    if (a.primary === w) a.primary = next
    else if (a.secondary === w) a.secondary = next
    else if ((a.conditional ?? []).some(c => c.weapon === w)) {
      a.conditional = (a.conditional ?? []).map(c => (c.weapon === w ? { ...c, weapon: next } : c))
    } else a.conditional = [...(a.conditional ?? []), { weapon: next }]
    return p
  }
  switch (list) {
    case 'classes': p.class = id; break
    case 'tiers': p.tier = id; break
    case 'nature': p.nature = id; break
    case 'availability': p.availability = id; break
    case 'roles':
      if (p.roles.primary === undefined) p.roles.primary = id
      else p.roles.secondary = [...(p.roles.secondary ?? []), id]
      break
    case 'mobility': p.mobility.base = id; break
    case 'handling': p.mobility.handling = id; break
    case 'mobility-traits': p.mobility.traits = [...(p.mobility.traits ?? []), id]; break
    case 'speed-bands': p.mobility.speed = id; break
    case 'bodies': p.body.plan = id; break
    case 'sizes': p.body.size = id; break
    case 'armour-classes': p.armour.class = id; break
    case 'armour-models': p.armour.models = [...(p.armour.models ?? []), id]; break
    case 'sight-bands': p.sensors.sight = id; break
    case 'sensor-traits': p.sensors.traits = [...(p.sensors.traits ?? []), id]; break
    case 'crew-models': p.crew.model = id; break
    case 'resources': p.resource = id; break
    case 'on-death': p.on_death = [...(p.on_death ?? []), id]; break
    default: break // lists no combination rule reads (solo-fallback, cooldown-bands, ...) change nothing here
  }
  return p
}

/** G1 and G2 for one term: why it does not fit the draft, or undefined when it fits. */
export function termProblem(ix: Index, parts: DraftParts, list: string, id: string, weapon?: WeaponDraft): string | undefined {
  const t = term(ix, list, id)
  if (!t) return `not a term of ${list}`
  if (t.source_only) return 'research only (G1)'
  if (parts.class !== undefined && t.classes && !t.classes.includes(parts.class)) return `not for class ${parts.class} (G1)`
  if (parts.tier !== undefined && !tierAtLeast(ix, parts.tier, t.min_tier)) return `starts at ${t.min_tier} (G1)`
  const weaponPart = isWeaponList(list)
  const weapons = allWeapons(parts)
  // Its own maps against the parts chosen so far.
  const has = (k: string): string[] => {
    if (!isWeaponList(k)) return unitValues(parts, k)
    if (weaponPart) return weapon ? weaponValues(weapon, k) : []
    return present(weapons.flatMap(w => WEAPON_PARTS[k]?.(w) ?? []))
  }
  for (const [k, allowed] of Object.entries(t.allowed ?? {})) {
    for (const x of has(k)) if (!allowed.includes(x) && !exempt(ix, list, k, x, weapon)) return `allowed.${k} leaves out ${x} (G1)`
  }
  for (const [k, excluded] of Object.entries(t.excluded ?? {})) {
    for (const x of has(k)) if (excluded.includes(x)) return `excludes ${k} ${x} (G1)`
  }
  // Their maps (and their classes and min_tier) against the candidate.
  const theirs = chosenTerms(ix, parts, weaponPart ? (weapon ? [weapon] : []) : weapons)
  for (const c of theirs) {
    if (list === 'classes' && c.t.classes && !c.t.classes.includes(id)) return `${c.list} ${c.id} is not for class ${id} (G1)`
    if (list === 'tiers' && !tierAtLeast(ix, id, c.t.min_tier)) return `${c.list} ${c.id} starts at ${c.t.min_tier} (G1)`
    const allowed = c.t.allowed?.[list]
    if (allowed && !allowed.includes(id) && !exempt(ix, c.list, list, id, c.weapon ?? weapon)) return `${c.list} ${c.id} allows only ${allowed.join(', ')} (G1)`
    if (c.t.excluded?.[list]?.includes(id)) return `${c.list} ${c.id} excludes it (G1)`
  }
  // The patterns of chosen abilities bind the class and the tier too (A1: classes, min_tier).
  if (list === 'classes' || list === 'tiers') {
    for (const a of [parts.signature, ...(parts.abilities ?? [])]) {
      const p = a?.pattern !== undefined ? patternOf(ix, a.pattern) : undefined
      if (!p?.generator) continue
      const b = blockOf(p, a?.variant ?? null)
      if (list === 'classes' && !b.classes.includes(id)) return `pattern ${p.id} is not for class ${id} (A1)`
      if (list === 'tiers' && !tierAtLeast(ix, id, b.min_tier)) return `pattern ${p.id} starts at ${b.min_tier} (A1)`
    }
  }
  // G2: no requires group may become impossible.
  const next = withPart(parts, list, id, weapon)
  const groups = [...(t.requires ?? []).map(g => ({ g, by: `${list} ${id}` })), ...theirs.flatMap(c => (c.t.requires ?? []).map(g => ({ g, by: `${c.list} ${c.id}` })))]
  for (const { g, by } of groups) {
    if (g.every(l => matchLink(ix, next, l) === 'no')) return `${by} requires one of ${g.join(', ')} (G2)`
  }
  return undefined
}

export interface Candidate {
  id: string
  odds: Odds
}

export interface Offer {
  list: string
  candidates: Candidate[]
  dropped: Array<{ id: string; why: string }>
}

export interface OfferOptions {
  /** When the list is a weapon part: the weapon it goes on. */
  weapon?: WeaponDraft
  /** Terms already taken by this count (multi-part lists). */
  except?: readonly string[]
  /** Only these terms (kept in the word list's order). */
  only?: readonly string[]
}

/** Every term of a list that fits the draft by the hard rules (G1, G2), with its odds (S1 to S4, G9). */
export function offerTerms(ix: Index, parts: DraftParts, spice: number, list: string, opts: OfferOptions = {}): Offer {
  const candidates: Candidate[] = []
  const dropped: Offer['dropped'] = []
  const ctx = { class: parts.class, flavour: parts.flavour, spice }
  for (const t of termsOf(ix, list)) {
    if (opts.only && !opts.only.includes(t.id)) continue
    if (opts.except?.includes(t.id)) {
      dropped.push({ id: t.id, why: 'already on the card' })
      continue
    }
    const why = termProblem(ix, parts, list, t.id, opts.weapon)
    if (why) dropped.push({ id: t.id, why })
    else candidates.push({ id: t.id, odds: termOdds(ix, list, t.id, ctx) })
  }
  return { list, candidates, dropped }
}

export type Mode = 'gate' | 'forced'

export interface PoolItem {
  id: string
  weight: number
}

export interface Pool {
  items: PoolItem[]
  /** Set when the items are above the spice gate or held back by the flavour (G5): why they were used. */
  fallback?: string
}

/** Is a candidate offered on the generator's own rolls (at the gate, not held back, weight above 0)? */
export const onOwnRolls = (c: { odds: Odds }): boolean => !c.odds.held && !c.odds.aboveGate && c.odds.weight > 0

/**
 * G5: the pool to draw from. gate: the generator's own roll, only parts at the spice gate that the flavour does not
 * hold back. forced: an input or a lock needs the part; the same pool when it has anything, else (spice_fallback
 * least-rare) the least rare parts that fit, parts the flavour holds back last, each with its rarity's weight at the
 * rarity's own min_spice and its favoured weight.
 */
export function poolOf(ix: Index, candidates: readonly Candidate[], mode: Mode, spice: number): Pool {
  const items = candidates.filter(onOwnRolls).map(c => ({ id: c.id, weight: c.odds.weight }))
  if (items.length || mode === 'gate' || ix.data.rules.defaults.spice_fallback !== 'least-rare') return { items }
  const key = (c: Candidate): number => (c.odds.held ? 100 : 0) + rarityRank(ix, c.odds.rarity)
  const usable = candidates.filter(c => c.odds.fallbackWeight > 0)
  if (!usable.length) return { items: [] }
  const best = Math.min(...usable.map(key))
  const chosen = usable.filter(c => key(c) === best)
  const first = chosen[0]
  const why = first?.odds.held
    ? `nothing at spice ${spice} fits that the flavour does not hold back; an input or a lock needs it (G5, S4)`
    : `nothing at spice ${spice} fits; the least rare that fits is ${first?.odds.rarity} (G5)`
  return { items: chosen.map(c => ({ id: c.id, weight: c.odds.fallbackWeight })), fallback: why }
}

/** Draws one item of a pool with a field's dice; undefined when the pool is empty. */
export function drawOne(dice: Dice, pool: Pool): { id: string; draw: number } | undefined {
  if (!pool.items.length) return undefined
  const { index, draw } = dice.pick(pool.items.map(i => i.weight))
  const item = pool.items[index]
  return item ? { id: item.id, draw } : undefined
}

/**
 * G16: draws up to `count` distinct items, one after another on the same dice; `next` gives the pool for each draw
 * (so that each pick can see the ones before it). Stops early when a pool is empty: the card takes what fits.
 */
export function pickDistinct(dice: Dice, count: number, next: (taken: readonly string[]) => Pool): string[] {
  const taken: string[] = []
  while (taken.length < count) {
    const pool = next(taken)
    const items = pool.items.filter(i => !taken.includes(i.id))
    const got = drawOne(dice, { items })
    if (!got) break
    taken.push(got.id)
  }
  return taken
}
