// Rules about one pattern or variant that do not depend on the rest of the card: its hard-control entry (section 6),
// the kinds it can take at a tier (A3, HC3) and their cooldowns (A4), whether it may join the abilities already on a
// card (A6, A7, A11), the passenger seats it brings (section 7), and whether it serves a role (G13).
import { blockOf, term, termsOf, tierAtLeast, type Block, type Index } from './data.ts'
import { abilitiesOf } from './keys.ts'
import { parseLink } from './links.ts'
import type { Mode, Pool } from './offer.ts'
import type { DraftParts, HardControlEntry, Link, Pattern, SameMechanicEntry, SameMechanicSide } from './types.ts'

/** The hard-control entry (rules.json hard_control.entries) that covers a pattern's variant, if any. */
export function hardControlOf(ix: Index, patternId: string, variantId: string | null): HardControlEntry | undefined {
  for (const e of ix.data.rules.hard_control.entries) {
    if (e.pattern !== patternId) continue
    if (e.variants === 'all') {
      if (!variantId || !(e.except ?? []).includes(variantId)) return e
    } else if (variantId && (e.variants ?? []).includes(variantId)) return e
  }
  return undefined
}

/** The hard-control entries that name a part by a typed link (HC1 stun trait, HC4 latch delivery). */
export function hardControlTerms(ix: Index): HardControlEntry[] {
  return ix.data.rules.hard_control.entries.filter(e => e.term !== undefined)
}

/** HC1: a part that never goes on a card weapon (the stun weapon trait). */
export function neverOnCardWeapon(ix: Index, link: Link): boolean {
  return hardControlTerms(ix).some(e => e.term === link && e.never_on_card_weapon === true)
}

/**
 * A3 and HC3: the kinds a block can take at a tier: the kind's own min_tier (ultimate only at T3), only kinds that use
 * a key for a class whose key_kinds_only is set (stuns), and only kinds the tier's budget can hold at all (a key kind
 * needs max_keys of 1 or more, any other kind max_passive of 1 or more). The rest of the card's budget is checked when
 * the kind is rolled.
 */
export function kindsAtTier(ix: Index, block: Block, tier: string, hc: HardControlEntry | undefined): string[] {
  const t = term(ix, 'tiers', tier)
  const keyOnly = hc ? ix.data.rules.hard_control.classes[hc.class].key_kinds_only : false
  return block.kinds.filter(k => {
    const kind = term(ix, 'ability-kinds', k)
    if (!kind || !tierAtLeast(ix, tier, kind.min_tier)) return false
    if (keyOnly && kind.uses_key !== true) return false
    return kind.uses_key === true ? (t?.max_keys ?? 0) >= 1 : (t?.max_passive ?? 0) >= 1
  })
}

/**
 * A4: the cooldown bands a kind can take, with their weights, in the cooldown-bands list's order. A kind that uses no
 * key gets none (an empty list: the cooldown is null). A hard-control ability (stun or latch: the rules.json note reads
 * A4 as covering both) takes the hard_control weights whatever its kind, or hard_control_ultimate for an ultimate.
 */
export function cooldownWeights(ix: Index, kind: string, hc: HardControlEntry | undefined): Array<{ id: string; weight: number }> {
  if (term(ix, 'ability-kinds', kind)?.uses_key !== true) return []
  const c = ix.data.rules.cooldowns
  const table: Record<string, number> = hc
    ? (kind === 'ultimate' ? c.hard_control_ultimate : c.hard_control)
    : ((c as unknown as Record<string, Record<string, number> | undefined>)[kind] ?? {})
  return termsOf(ix, 'cooldown-bands').map(b => ({ id: b.id, weight: table[b.id] ?? 0 })).filter(w => w.weight > 0)
}

/** One ability on a card, as mayJoin reads it. */
export interface Placed {
  pattern: string
  variant: string | null | undefined
}

function sideMatches(side: SameMechanicSide, a: Placed): boolean {
  return side.pattern === a.pattern && (!side.variants || (a.variant !== null && a.variant !== undefined && side.variants.includes(a.variant)))
}

/** A11: does a same-mechanic entry cover these two abilities (in either order)? Today's entries are pairs of pattern
 *  ids; the shape under discussion ({a, b, verdict}) names each side's pattern and, optionally, some variants (none =
 *  every variant). Both verdicts it may carry ("same", "repeat") are read as "never on one card", until Mustafa says. */
function sameMechanic(entry: SameMechanicEntry, x: Placed, y: Placed): boolean {
  if (Array.isArray(entry)) return entry.includes(x.pattern) && entry.includes(y.pattern) && x.pattern !== y.pattern
  return (sideMatches(entry.a, x) && sideMatches(entry.b, y)) || (sideMatches(entry.a, y) && sideMatches(entry.b, x))
}

/**
 * May this pattern and variant join the abilities already on the card? Never the same pattern twice (A6); never two
 * patterns either of which lists the other in conflicts_with (A7); never two abilities that rules.json same_mechanic
 * names as one mechanic (A11). Returns why not, or undefined when it may.
 */
export function mayJoin(ix: Index, onCard: readonly Placed[], pattern: string, variant: string | null): string | undefined {
  const me: Placed = { pattern, variant }
  const mine = ix.patternById.get(pattern)?.generator?.conflicts_with ?? []
  for (const a of onCard) {
    if (a.pattern === pattern) return `${pattern} is already on the card (A6)`
    const theirs = ix.patternById.get(a.pattern)?.generator?.conflicts_with ?? []
    if (mine.includes(a.pattern) || theirs.includes(pattern)) return `conflicts with ${a.pattern} (A7)`
    if (ix.data.rules.same_mechanic.some(e => sameMechanic(e, me, a))) return `the same mechanic as ${a.pattern} (A11)`
  }
  return undefined
}

/**
 * Section 7: the passenger seats a block needs when it implies or requires them (a passengers: link with >= or an
 * exact number of 1 or more); 0 when it brings none. A requires group brings seats only when it has no other way to be
 * met, so only a group of passengers: links counts.
 */
export function seatsBrought(block: Block): number {
  let need = 0
  const consider = (l: Link): void => {
    const { kind, cmp, id } = parseLink(l)
    if (kind !== 'passengers' || cmp === '<=') return
    const n = Number(id)
    if (n >= 1) need = Math.max(need, n)
  }
  for (const l of block.implies) consider(l)
  for (const g of block.requires) if (g.every(l => parseLink(l).kind === 'passengers')) for (const l of g) consider(l)
  return need
}

/** Section 7: the kind of passenger seats, from the first entry of rules.json passengers.kinds that matches a pattern
 *  (and variant) on the card; an entry with no pattern matches every card. */
export function passengerKind(ix: Index, parts: DraftParts): string | undefined {
  const abilities = abilitiesOf(parts)
  for (const e of ix.data.rules.defaults.passengers.kinds) {
    if (!e.pattern) return e.kind
    if (abilities.some(a => a.pattern === e.pattern && (!e.variants || (a.variant != null && e.variants.includes(a.variant))))) return e.kind
  }
  return undefined
}

/**
 * G13: does a pattern serve a role? Its role_fit patterns name it; or the role's fit needs passenger seats, which come
 * only from a pattern that brings them (rules.json role_fit description: those patterns serve transport).
 */
export function servesRole(ix: Index, role: string | undefined, block: Block): boolean {
  if (role === undefined) return false
  const fit = ix.data.rules.role_fit[role]
  if (!fit) return false
  if (fit.patterns?.includes(block.pattern)) return true
  const seatLinks = [...(fit.all ?? []), ...(fit.any ?? [])].filter(l => parseLink(l).kind === 'passengers')
  return seatLinks.length > 0 && seatsBrought(block) > 0
}

/** Does the role need a pattern that serves it (role_fit patterns, or seats that only a pattern brings)? */
export function roleNeedsTool(ix: Index, role: string | undefined): boolean {
  if (role === undefined) return false
  const fit = ix.data.rules.role_fit[role]
  if (!fit) return false
  return (fit.patterns?.length ?? 0) > 0 || [...(fit.all ?? []), ...(fit.any ?? [])].some(l => parseLink(l).kind === 'passengers')
}

/**
 * S6: the variants to draw from, with equal odds (rules.json defaults.variant_odds), among those whose min_spice is at
 * most the card's spice. `ids` are the variants that passed the other rules. When an input or a lock needs the pattern
 * and none of them is open at the spice (G5: sacrifice-for-allies has no variant at spice 1), the least wild ones that
 * are, those with the lowest min_spice, are used.
 */
export function variantPool(p: Pattern, ids: readonly string[], spice: number, mode: Mode): Pool {
  const variants = p.variants.filter(v => ids.includes(v.id))
  const open = variants.filter(v => v.min_spice <= spice)
  if (open.length || mode === 'gate' || !variants.length) return { items: open.map(v => ({ id: v.id, weight: 1 })) }
  const least = Math.min(...variants.map(v => v.min_spice))
  return {
    items: variants.filter(v => v.min_spice === least).map(v => ({ id: v.id, weight: 1 })),
    fallback: `no variant opens at spice ${spice}; the least wild open at spice ${least} (G5, S6)`,
  }
}

/** The block of a pattern's variant (a shorthand for the steps). */
export function blockFor(ix: Index, patternId: string, variantId: string | null): Block {
  const p = ix.patternById.get(patternId)
  if (!p) throw new Error(`no pattern ${patternId}`)
  return blockOf(p, variantId)
}
