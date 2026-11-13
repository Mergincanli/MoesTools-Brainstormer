// One weapon of step 13: family, damage, delivery, mount, range, targets and traits (G11, G12, C1, HC1, A10).
//
// The family is drawn by the families word list's odds (rarity, class rarity, the flavour's lean), among those the
// card can hold (G1, both ways) and that leave a damage, a delivery and a mount that fit; an adaptive weapon comes
// only from a pattern (A10). Damage, delivery and mount start from the family's defaults: another allowed value is drawn
// with the default three times as likely (G12, rules.json weapon_default_weight), a mount by the aim models' own rarity
// as well, and only one the body allows (its allowed aim models: the term rules). The range is the family's default;
// a range a pattern's implies or requires names replaces it (G11). The targets are every type the family and the
// delivery allow, high air also through the anti-air trait on a family that reaches low air (G12). Traits: 0 to 3 by
// counts.weapon_traits, the ones the needs ask for first, never the stun trait (C1, HC1). Section 18: an adaptive weapon
// has no damage type, delivery or range of its own (its conditional weapons carry them).
//
// Every value keeps every need possible (needs.ts); a need no later weapon part can meet is met here, since its answer
// turns to no once the card's weapons are all on the draft (weaponsOf). A value a lock of a later step rules out is
// drawn again (locks.ts).
import { term, termsOf, type Index } from './data.ts'
import { diceFor } from './dice.ts'
import { matchLink, parseLink } from './links.ts'
import { drawKeeping, keptTrace, leastRareOf, lockProblem, type Kept } from './locks.ts'
import { allNeedsProblem, lastChance, memoAfter, needAnswer, needsAfter, newMemo, ownersOf } from './needs.ts'
import { offerTerms, onOwnRolls, poolOf, termProblem, type Candidate, type Pool } from './offer.ts'
import { neverOnCardWeapon } from './patterns.ts'
import { weaponContextOf } from './reach.ts'
import type { Draft, DraftParts, Need, TraceEntry, WeaponDraft } from './types.ts'

/** The adaptive weapon family (A10) and the trait that lifts a weapon to high air (G12). */
export const ADAPTIVE = 'adaptive'
export const ANTI_AIR = 'anti-air'

/** The open needs only weapon parts can meet (every link a weapon link; a need on the main weapon alone is judged by
 *  needs.ts), on the draft as it stands. */
function weaponOnlyNeeds(ix: Index, d: Draft, parts: DraftParts): Need[] {
  return d.needs.filter(n => !n.avoid && !n.onPrimary && n.links.every(l => ownersOf(l).includes('weapons')) && needAnswer(ix, parts, n) !== 'yes')
}

/** One way a weapon of a family can be: its delivery and damage, and the traits, targets, mounts and ranges they allow. */
interface Way {
  delivery: string | null
  damage: string | null
  traits: string[]
  targets: string[]
  mounts: string[]
  settable: string[]
  own: string | null
}

/** The ways a weapon of this family can be on the draft (kept by what they depend on: reach.ts weaponContextOf). */
function waysOf(ix: Index, d: Draft, parts: DraftParts, family: string, F: Forced): Way[] {
  const key = `ways|${family}|${F.damage}${F.delivery}${F.mount}|${weaponContextOf(ix, parts, d.spice, 'gate')}`
  const known = ix.cache.get(key) as Way[] | undefined
  if (known) return known
  const out: Way[] = []
  const w0: WeaponDraft = { family }
  const fam = term(ix, 'weapon-families', family)
  const dels = family === ADAPTIVE ? [null] : allowedFits(ix, parts, d.spice, 'weapon-delivery', w0, deliveriesThatFit(ix, parts, w0), F.delivery).map(c => c.id)
  const dmgs = family === ADAPTIVE ? [null] : allowedFits(ix, parts, d.spice, 'damage-types', w0, damagesOf(ix, family), F.damage).map(c => c.id)
  const allRanges = termsOf(ix, 'range-bands').filter(t => !t.source_only).map(t => t.id)
  for (const delivery of dels) {
    const w1: WeaponDraft = { ...w0, delivery }
    const mounts = mountsThatFit(ix, parts, d.spice, w1).filter(c => F.mount || onOwnRolls(c)).map(c => c.id)
    if (!mounts.length) continue
    const traits = termsOf(ix, 'weapon-traits').filter(t => !t.source_only && !neverOnCardWeapon(ix, `weapon-trait:${t.id}`) && termProblem(ix, parts, 'weapon-traits', t.id, w1) === undefined).map(t => t.id)
    const targets = targetsOf(ix, { ...w1, traits: traits.includes(ANTI_AIR) ? [ANTI_AIR] : [] })
    const settable = typeof delivery === 'string' ? term(ix, 'weapon-delivery', delivery)?.allowed?.['range-bands'] ?? allRanges : []
    for (const damage of dmgs) out.push({ delivery, damage, traits, targets, mounts, settable, own: fam?.default_range ?? null })
  }
  ix.cache.set(key, out)
  return out
}

/**
 * Could one weapon of this family meet all these needs together (each need one of its links): some delivery, damage,
 * range, targets and traits that fit the draft? The quick joint check that keeps two needs from being left to one
 * weapon that cannot meet both.
 */
function familyCan(ix: Index, d: Draft, parts: DraftParts, family: string, needs: readonly Need[], F: Forced): boolean {
  if (!needs.length) return true
  return waysOf(ix, d, parts, family, F).some(way => needs.every(n => n.links.some(l => wayMeets(ix, way, family, n, l))))
}

/** Do the ways of this weapon (its family, with its delivery and damage where chosen) leave the needs within reach of
 *  it and of the weapons after it whose family is open (none: it meets them all; one: that one meets the rest)? */
function jointOk(ix: Index, d: Draft, w: WeaponDraft, needs: readonly Need[], after: number): boolean {
  if (!needs.length || after > 1 || w.family === undefined) return true
  const F = forcedOf(ix, d)
  const ways = waysOf(ix, d, d.parts, w.family, F).filter(x => (w.delivery === undefined || x.delivery === w.delivery) && (w.damage === undefined || x.damage === w.damage))
  const meets = (way: Way, n: Need): boolean => n.links.some(l => wayMeets(ix, way, w.family as string, n, l))
  if (after === 0) return ways.some(way => needs.every(n => meets(way, n)))
  const rest = needs.filter(n => !ways.some(way => meets(way, n)))
  return !rest.length || offerTerms(ix, d.parts, d.spice, 'weapon-families', { weapon: {} }).candidates.some(c => c.id !== ADAPTIVE && (F.family || onOwnRolls(c)) && familyCan(ix, d, d.parts, c.id, rest, F))
}

/** Does one way of a weapon of this family meet a link of a need? */
function wayMeets(ix: Index, way: Way, family: string, n: Need, l: string): boolean {
  const { kind, cmp, id } = parseLink(l)
  const ok = (r: string | null | undefined): boolean => typeof r === 'string' && cmpRankOf(ix, r, cmp, id)
  switch (kind) {
    case 'weapon': return id === family
    case 'damage': return id === way.damage
    case 'delivery': return id === way.delivery
    case 'weapon-trait': return way.traits.includes(id)
    case 'hits': return way.targets.includes(id)
    case 'mount': return way.mounts.includes(id)
    case 'range': return ['G3', 'G4', 'M2'].includes(n.rule) ? way.settable.some(ok) || ok(way.own) : ok(way.own)
    default: return false
  }
}

const cmpRankOf = (ix: Index, r: string, cmp: string | null | undefined, id: string): boolean => {
  const a = term(ix, 'range-bands', r)?.rank ?? 0
  const b = term(ix, 'range-bands', id)?.rank ?? 0
  return cmp === '>=' ? a >= b : cmp === '<=' ? a <= b : r === id
}

/** Could this many weapons, all still open, meet the needs only weapons meet (none: no such need; one: one family meets
 *  them all together; more: taken as yes)? */
export function weaponsCanMeet(ix: Index, d: Draft, parts: DraftParts, weapons: number): boolean {
  const needs = weaponOnlyNeeds(ix, d, parts)
  if (!needs.length || weapons > 1) return true
  if (weapons === 0) return false
  const F = forcedOf(ix, d)
  return offerTerms(ix, parts, d.spice, 'weapon-families', { weapon: {} }).candidates.some(c => c.id !== ADAPTIVE && (F.family || onOwnRolls(c)) && familyCan(ix, d, parts, c.id, needs, F))
}

/** Where a weapon is built: its dice path, how to read and place it on the draft, and its seat. */
export interface WeaponSpec {
  path: string
  get(p: DraftParts): WeaponDraft
  set(p: DraftParts, w: WeaponDraft): DraftParts
  seat: string
  /** A family set by a pattern (A10: adaptive, or a leeched victim's family), and what set it. */
  family?: string
  familyBy?: string
  /** The last weapon of the step: a need on traits or targets still open must be met by it. */
  last: boolean
  /** How many weapons come after this one whose family is still open (for the joint check of the needs). */
  after?: number
}

const targetTypes = (ix: Index): string[] => termsOf(ix, 'target-types').filter(t => !t.source_only).map(t => t.id)

/** G12: the targets of a weapon: every type its family and delivery allow, and high air through the anti-air trait. */
export function targetsOf(ix: Index, w: WeaponDraft): string[] {
  const all = targetTypes(ix)
  const fam = w.family !== undefined ? term(ix, 'weapon-families', w.family) : undefined
  const famT = fam?.allowed?.['target-types'] ?? all
  const dt = typeof w.delivery === 'string' ? term(ix, 'weapon-delivery', w.delivery) : undefined
  const delT = dt?.allowed?.['target-types'] ?? all
  const lifted = (w.traits ?? []).includes(ANTI_AIR) && famT.includes('low-air') && delT.includes('high-air')
  return all.filter(x => (famT.includes(x) && delT.includes(x)) || (x === 'high-air' && lifted))
}

/** The deliveries a family allows (its default when it lists none). */
function deliveriesOf(ix: Index, family: string): string[] {
  const fam = term(ix, 'weapon-families', family)
  return fam?.allowed?.['weapon-delivery'] ?? (fam?.default_delivery ? [fam.default_delivery] : [])
}

/** The damage types a family allows (its default when it lists none). */
function damagesOf(ix: Index, family: string): string[] {
  const fam = term(ix, 'weapon-families', family)
  return fam?.allowed?.['damage-types'] ?? (fam?.default_damage ? [fam.default_damage] : [])
}

/** G2 for a delivery: its requires groups on what the unit is (drop needs a flier) hold on the draft. */
function deliveryRequiresOk(ix: Index, parts: DraftParts, delivery: string): boolean {
  return (term(ix, 'weapon-delivery', delivery)?.requires ?? []).every(g => g.some(l => matchLink(ix, parts, l) !== 'no'))
}

/** The deliveries of a family that fit the draft and this weapon (G1 both ways, G2). */
function deliveriesThatFit(ix: Index, parts: DraftParts, w: WeaponDraft): string[] {
  if (w.family === undefined || w.family === ADAPTIVE) return []
  return deliveriesOf(ix, w.family).filter(x => termProblem(ix, parts, 'weapon-delivery', x, w) === undefined && deliveryRequiresOk(ix, parts, x))
}

/** The mounts at the spice gate that fit the draft and this weapon (the body's allowed aim models, the delivery's
 *  excluded ones: G1 both ways). */
function mountsThatFit(ix: Index, parts: DraftParts, spice: number, w: WeaponDraft): Candidate[] {
  // Body aim is fired from the driver seat, never from a gunner's (aim-models word list, in prose; validate.mjs).
  return offerTerms(ix, parts, spice, 'aim-models', { weapon: w }).candidates.filter(c => c.id !== BODY_AIM || (w.seat ?? 'driver') === 'driver')
}
const BODY_AIM = 'body-aim'

/** Does a weapon (its family and delivery chosen) leave a mount at the gate, or above it when `forced`? */
function hasMount(ix: Index, parts: DraftParts, spice: number, w: WeaponDraft, forced: boolean): boolean {
  return mountsThatFit(ix, parts, spice, w).some(c => forced || onOwnRolls(c))
}

/** The values of a list the family allows that fit the weapon, at the gate (or above it when `forced`). */
function allowedFits(ix: Index, parts: DraftParts, spice: number, list: string, w: WeaponDraft, only: string[], forced: boolean): Candidate[] {
  return offerTerms(ix, parts, spice, list, { weapon: w, only }).candidates.filter(c => forced || onOwnRolls(c))
}

/** Can a weapon of this family be completed on the draft: a damage, a delivery and a mount (at the gate, or above it
 *  when `forced`) that fit together? */
function completable(ix: Index, parts: DraftParts, spice: number, family: string, F: Forced, seat?: string): boolean {
  const w: WeaponDraft = seat !== undefined ? { family, seat } : { family }
  if (family === ADAPTIVE) return hasMount(ix, parts, spice, w, F.mount)
  if (!allowedFits(ix, parts, spice, 'damage-types', w, damagesOf(ix, family), F.damage).length) return false
  return allowedFits(ix, parts, spice, 'weapon-delivery', w, deliveriesThatFit(ix, parts, w), F.delivery).some(c => hasMount(ix, parts, spice, { ...w, delivery: c.id }, F.mount))
}

/** Can a weapon on this seat be made within the spice gate (a family with a damage, a delivery and a mount at the
 *  gate)? A crew whose gunner could get none is not offered on the generator's own roll. */
export function seatCanArm(ix: Index, parts: DraftParts, spice: number, seat: string): boolean {
  return offerTerms(ix, parts, spice, 'weapon-families', { weapon: {} }).candidates.some(c => c.id !== ADAPTIVE && onOwnRolls(c) && completable(ix, parts, spice, c.id, NONE_FORCED, seat))
}

/** G11: the range of a weapon: the family's default, or the range nearest to it that meets an open need a pattern's
 *  implies or requires names (one a delivery of the weapon allows). An adaptive weapon has none (section 18). */
function rangeFor(ix: Index, d: Draft, s: WeaponSpec, w: WeaponDraft): string | null {
  if (w.family === undefined || w.family === ADAPTIVE) return null
  const own = term(ix, 'weapon-families', w.family)?.default_range ?? null
  const byPattern = d.needs.filter(n => ['G3', 'G4', 'M2'].includes(n.rule) && !n.avoid && n.links.some(l => parseLink(l).kind === 'range'))
  const open = byPattern.filter(n => needAnswer(ix, s.set(d.parts, { ...w, range: own }), n) !== 'yes')
  if (!open.length) return own
  const dels = typeof w.delivery === 'string' ? [w.delivery] : deliveriesThatFit(ix, d.parts, w)
  const allowed = new Set(dels.flatMap(x => term(ix, 'weapon-delivery', x)?.allowed?.['range-bands'] ?? termsOf(ix, 'range-bands').filter(t => !t.source_only).map(t => t.id)))
  const rank = (id: string | null): number => (id === null ? 0 : term(ix, 'range-bands', id)?.rank ?? 0)
  const meets = [...allowed].filter(r => open.every(n => n.links.some(l => parseLink(l).kind === 'range' && matchLink(ix, s.set(d.parts, { ...w, range: r }), l) === 'yes')))
  if (!meets.length) return own
  meets.sort((a, b) => Math.abs(rank(a) - rank(own)) - Math.abs(rank(b) - rank(own)) || rank(a) - rank(b))
  return meets[0] ?? own
}

/** G5: may a weapon's part go above the spice gate? Only for an input's or a lock's need still open on a link of one
 *  of these kinds; never on the generator's own roll (section 18: the least rare fallback is for what an input or a
 *  lock needs). */
function forcedFor(ix: Index, d: Draft, kinds: readonly string[]): boolean {
  return ix.data.rules.defaults.spice_fallback === 'least-rare' && d.needs.some(n => n.forced && n.links.some(l => kinds.includes(parseLink(l).kind)) && needAnswer(ix, d.parts, n) !== 'yes')
}

/** The weapon link kinds (a need on any of them may take the family above the gate). */
const WEAPON_LINKS = ['weapon', 'damage', 'delivery', 'range', 'mount', 'weapon-trait', 'hits']

/** Which of a weapon's parts may go above the gate (an input's or a lock's need on that part). */
interface Forced {
  family: boolean
  damage: boolean
  delivery: boolean
  mount: boolean
}
function forcedOf(ix: Index, d: Draft): Forced {
  return { family: forcedFor(ix, d, WEAPON_LINKS), damage: forcedFor(ix, d, ['damage']), delivery: forcedFor(ix, d, ['delivery']), mount: forcedFor(ix, d, ['mount']) }
}
const NONE_FORCED: Forced = { family: false, damage: false, delivery: false, mount: false }
const ALL_FORCED: Forced = { family: true, damage: true, delivery: true, mount: true }

const times = (c: Candidate, f: number): Candidate => (f === 1 ? c : { id: c.id, odds: { ...c.odds, weight: c.odds.weight * f, fallbackWeight: c.odds.fallbackWeight * f } })

/**
 * Draws one part of the weapon among candidates: those that keep every need possible, at the gate (or the least rare
 * for an input's or a lock's need, G5), each weight times `factor` (the default three times as likely, G12); a value a
 * waiting lock rules out is drawn again.
 */
function drawPart(
  ix: Index, d: Draft, s: WeaponSpec, field: string, list: string, candidates: readonly Candidate[], toWeapon: (id: string) => WeaponDraft, factor: (id: string) => number, forced: boolean,
): { got: Kept | undefined; fits: Candidate[] } {
  // The needs only weapons meet are judged together, by the ways this weapon and the ones after it can be (jointOk);
  // the others one by one, by the look-ahead of needs.ts.
  const joint = (s.after ?? 99) <= 1 ? weaponOnlyNeeds(ix, d, d.parts) : []
  const recheck = needsAfter(ix, d.needs, list).filter(n => !joint.includes(n))
  const base = newMemo()
  const fits = candidates
    .filter(c => jointOk(ix, d, toWeapon(c.id), joint, s.after ?? 99) && allNeedsProblem(ix, s.set(d.parts, toWeapon(c.id)), d.spice, recheck, memoAfter(ix, base, list)) === undefined)
    .map(c => times(c, factor(c.id)))
  let pool: Pool = poolOf(ix, fits, 'gate', d.spice)
  if (!pool.items.length && forced) pool = poolOf(ix, fits, 'forced', d.spice)
  const accept = (id: string): string | undefined => lockProblem(ix, d, s.set(d.parts, toWeapon(id)))
  return { got: drawKeeping(ix, d, diceFor(d.seed, `${s.path}.${field}`, d.attempt), pool, accept, leastRareOf(ix, d, fits)), fits }
}

function entry(s: WeaponSpec, field: string, value: unknown, got: Kept | undefined, rule: string, extra: Partial<TraceEntry> = {}): TraceEntry {
  return { field: `${s.path}.${field}`, value, how: 'rolled', rule, ...(got ? keptTrace(got) : { candidates: 0 }), ...extra }
}

/** Builds one weapon on the draft; why it could not be built, or undefined. */
export function rollWeapon(ix: Index, d: Draft, s: WeaponSpec): string | undefined {
  let w: WeaponDraft = { ...s.get(d.parts), seat: s.seat }
  const F = forcedOf(ix, d)
  const place = (next: WeaponDraft): void => {
    w = next
    d.parts = s.set(d.parts, w)
  }
  // Family: set by a pattern (A10), else drawn; never adaptive on the card's own rolls (only a pattern brings one).
  if (s.family !== undefined) {
    if (termProblem(ix, d.parts, 'weapon-families', s.family, {}) !== undefined || !completable(ix, d.parts, d.spice, s.family, ALL_FORCED, s.seat)) return `${s.familyBy} needs a ${s.family} weapon, and it does not fit`
    place({ ...w, family: s.family })
    d.trace.push({ field: `${s.path}.family`, value: s.family, how: 'implied', by: s.familyBy, rule: 'A10, G3', candidates: 0 })
  } else {
    const families = offerTerms(ix, d.parts, d.spice, 'weapon-families', { weapon: {} }).candidates.filter(c => c.id !== ADAPTIVE && completable(ix, d.parts, d.spice, c.id, F, s.seat))
    // The needs only weapons meet stay within reach of this weapon and the one after it, together (drawPart, jointOk).
    const offer = families
    const toWeapon = (id: string): WeaponDraft => {
      const v = { ...w, family: id }
      return { ...v, range: rangeFor(ix, d, s, v) }
    }
    const { got } = drawPart(ix, d, s, 'family', 'weapon-families', offer, toWeapon, () => 1, F.family)
    if (!got) return `no weapon family fits the card and its needs`
    place({ ...w, family: got.id })
    d.trace.push(entry(s, 'family', got.id, got, 'G1, S1, S3'))
  }
  const family = w.family as string
  const fam = term(ix, 'weapon-families', family)
  const weight = ix.data.rules.defaults.weapon_default_weight
  if (family === ADAPTIVE) {
    place({ ...w, damage: null, delivery: null, range: null })
  } else {
    // Damage and delivery: the family's allowed values, the default three times as likely (G12).
    const dmg = offerTerms(ix, d.parts, d.spice, 'damage-types', { weapon: w, only: damagesOf(ix, family) }).candidates
    const damage = drawPart(ix, d, s, 'damage', 'damage-types', dmg, id => ({ ...w, damage: id }), id => (id === fam?.default_damage ? weight : 1), F.damage).got
    if (!damage) return `no damage type of ${family} fits`
    place({ ...w, damage: damage.id })
    d.trace.push(entry(s, 'damage', damage.id, damage, 'G12 (default x3)'))
    const dels = offerTerms(ix, d.parts, d.spice, 'weapon-delivery', { weapon: w, only: deliveriesThatFit(ix, d.parts, w) }).candidates
      .filter(c => hasMount(ix, d.parts, d.spice, { ...w, delivery: c.id }, F.mount))
    const delivery = drawPart(ix, d, s, 'delivery', 'weapon-delivery', dels, id => ({ ...w, delivery: id }), id => (id === fam?.default_delivery ? weight : 1), F.delivery).got
    if (!delivery) return `no delivery of ${family} fits`
    place({ ...w, delivery: delivery.id })
    d.trace.push(entry(s, 'delivery', delivery.id, delivery, 'G12 (default x3)'))
    const range = rangeFor(ix, d, s, w)
    place({ ...w, range })
    const own = fam?.default_range ?? null
    d.trace.push({ field: `${s.path}.range`, value: range, how: range === own ? 'default' : 'implied', rule: 'G11', candidates: 0 })
  }
  // Mount: by the aim models' rarity, the default three times as likely, only those the body allows (G12, G1).
  const mount = drawPart(ix, d, s, 'mount', 'aim-models', mountsThatFit(ix, d.parts, d.spice, w), id => ({ ...w, mount: id }), id => (id === fam?.default_aim ? weight : 1), F.mount).got
  if (!mount) return `no mount fits a ${family} on this body`
  place({ ...w, mount: mount.id })
  d.trace.push(entry(s, 'mount', mount.id, mount, 'G12 (default x3, aim rarity), G1'))
  // Traits (C1): the count first; the traits an open need asks for when this is the last weapon; then free ones.
  const counts = ix.data.rules.counts.weapon_traits
  const dice = diceFor(d.seed, `${s.path}.traits`, d.attempt)
  const want = dice.pick(counts).index
  const max = counts.length - 1
  const chosen: string[] = []
  const withTraits = (ids: string[]): WeaponDraft => {
    const v = { ...w, traits: ids }
    return { ...v, can_target: targetsOf(ix, v) }
  }
  const offered = (): Candidate[] =>
    offerTerms(ix, d.parts, d.spice, 'weapon-traits', { weapon: { ...w, traits: chosen }, except: chosen }).candidates.filter(c => !neverOnCardWeapon(ix, `weapon-trait:${c.id}`))
  const notes: string[] = []
  if (s.last) {
    for (const n of d.needs) {
      if (n.avoid || !lastChance(d, n, 'weapons') || !n.links.some(l => ['weapon-trait', 'hits'].includes(parseLink(l).kind))) continue
      if (needAnswer(ix, s.set(d.parts, withTraits(chosen)), n) === 'yes') continue
      const meets = offered().filter(c => needAnswer(ix, s.set(d.parts, withTraits([...chosen, c.id])), n) === 'yes')
      let pool: Pool = poolOf(ix, meets, 'gate', d.spice)
      if (!pool.items.length && n.forced) pool = poolOf(ix, meets, 'forced', d.spice)
      const got = drawKeeping(ix, d, dice, pool, id => lockProblem(ix, d, s.set(d.parts, withTraits([...chosen, id]))), leastRareOf(ix, d, meets))
      if (!got || chosen.length >= max) return `${n.by} needs ${n.links.join(' or ')} (${n.rule}), and no trait of this ${family} gives it`
      chosen.push(got.id)
      notes.push(`${got.id} for ${n.by} (${n.rule})${got.pool.fallback ? `; ${got.pool.fallback}` : ''}`)
    }
  }
  const recheck = needsAfter(ix, d.needs, 'weapon-traits')
  for (let i = Math.min(want, max) - chosen.length; i > 0; i--) {
    const base = newMemo()
    const c = offered().filter(x => allNeedsProblem(ix, s.set(d.parts, withTraits([...chosen, x.id])), d.spice, recheck, memoAfter(ix, base, 'weapon-traits')) === undefined)
    // A waiting lock's needs on the traits are judged on the full list (the last pick), as for any list (locks.ts).
    const got = drawKeeping(ix, d, dice, poolOf(ix, c, 'gate', d.spice), id => lockProblem(ix, d, s.set(d.parts, withTraits([...chosen, id])), i > 1))
    if (!got) break // G16: the weapon takes what fits
    chosen.push(got.id)
  }
  place(withTraits(chosen))
  const clash = lockProblem(ix, d, d.parts)
  if (clash) return `the ${s.path} traits: ${clash}`
  d.trace.push({ field: `${s.path}.traits`, value: [...chosen], how: notes.length ? 'needed' : 'rolled', rule: 'C1, HC1, G1', candidates: counts.filter(x => x > 0).length, note: `count ${want}${notes.length ? `; ${notes.join('; ')}` : ''}` })
  d.trace.push({ field: `${s.path}.can_target`, value: w.can_target, how: 'default', rule: 'G12', candidates: 0 })
  return undefined
}

/** Why a whole weapon (a locked one, or one on a finished card) breaks the rules of one weapon, or undefined. */
export function weaponProblem(ix: Index, parts: DraftParts, w: WeaponDraft): string | undefined {
  if (w.family === undefined || !term(ix, 'weapon-families', w.family)) return `a weapon needs a family`
  const lists: Array<[string, readonly (string | null | undefined)[]]> = [
    ['weapon-families', [w.family]], ['damage-types', [w.damage]], ['weapon-delivery', [w.delivery]], ['aim-models', [w.mount]],
    ['range-bands', [w.range]], ['target-types', w.can_target ?? []], ['weapon-traits', w.traits ?? []],
  ]
  for (const [list, ids] of lists) {
    for (const id of ids) {
      if (typeof id !== 'string') continue
      const why = termProblem(ix, parts, list, id, w)
      if (why) return `${list} ${id}: ${why}`
    }
  }
  if (w.mount === undefined) return 'a weapon needs a mount'
  if ((w.traits ?? []).length > ix.data.rules.counts.weapon_traits.length - 1) return `more than ${ix.data.rules.counts.weapon_traits.length - 1} weapon traits (C1)`
  if ((w.traits ?? []).some(t => neverOnCardWeapon(ix, `weapon-trait:${t}`))) return 'the stun trait is never on a card weapon (HC1)'
  if (w.family === ADAPTIVE) {
    if (w.damage != null || w.delivery != null || w.range != null) return 'an adaptive weapon has no damage, delivery or range of its own (section 18)'
  } else {
    if (typeof w.delivery === 'string' && !deliveryRequiresOk(ix, parts, w.delivery)) return `delivery ${w.delivery} needs what the unit is not (G2)`
    if (w.damage == null || w.delivery == null) return 'a weapon needs a damage type and a delivery'
  }
  return undefined
}
