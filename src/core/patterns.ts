// Rules about one pattern or variant that do not depend on the rest of the card: its hard-control entry (section 6),
// the kinds it can take at a tier (A3, HC3), the patterns it may not share a card with (A7, A11) and the passenger
// seats it brings (section 7).
import { term, tierAtLeast, type Block, type Index } from './data.ts'
import { parseLink } from './links.ts'
import type { Mode, Pool } from './offer.ts'
import type { HardControlEntry, Link, Pattern } from './types.ts'

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

/** A7 and A11: may these two patterns share a card? Either side's conflicts_with, or a confirmed same-mechanic pair. */
export function conflicts(ix: Index, a: string, b: string): boolean {
  const ga = ix.patternById.get(a)?.generator
  const gb = ix.patternById.get(b)?.generator
  if ((ga?.conflicts_with ?? []).includes(b) || (gb?.conflicts_with ?? []).includes(a)) return true
  return ix.data.rules.same_mechanic.some(pair => pair.includes(a) && pair.includes(b) && a !== b)
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
