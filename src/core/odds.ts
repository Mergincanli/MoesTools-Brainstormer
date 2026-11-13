// The odds of the rule sheet's section 3 (S1 to S6) and the spice gate.
//
// S1 a part's weight is its rarity's weight at the card's spice (the rarity list's weights), times the flavour's
//    favoured_weight when the flavour favours it.
// S2 a favoured part counts favoured_step steps more common (rare as uncommon, uncommon as common), never where a
//    class_rarity applies.
// S3 a class_rarity for the card's class replaces the rarity.
// S4 a part the flavour avoids is held back below its avoided_until_spice.
// S5 a pattern's flavour_lean counts as favoured (rules.json defaults.flavour_lean says how).
// G9 a term with no rarity counts as rules.json defaults.default_rarity.
// The spice gate (G5): a rarity is at the gate from its min_spice on; below it the part is above the gate.
import { rank, term, termsOf, type Index } from './data.ts'

/** The rarity terms ordered from most common to rarest (by rank). */
function rarities(ix: Index): string[] {
  return [...termsOf(ix, 'rarity')].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)).map(t => t.id)
}

/** S2: the rarity `steps` steps more common, never past the most common one. */
export function stepCommoner(ix: Index, rarity: string, steps: number): string {
  const order = rarities(ix)
  const i = order.indexOf(rarity)
  if (i < 0) throw new Error(`'${rarity}' is not a rarity`)
  return order[Math.max(0, i - steps)] ?? rarity
}

/** S1: the weight of a rarity at a spice (the rarity list's weights, spice 1 first). */
export function spiceWeight(ix: Index, rarity: string, spice: number): number {
  const w = term(ix, 'rarity', rarity)?.weights?.[spice - 1]
  if (w === undefined) throw new Error(`no weight for rarity '${rarity}' at spice ${spice}`)
  return w
}

/** The spice gate: is a rarity offered at this spice (its min_spice)? */
export function atGate(ix: Index, rarity: string, spice: number): boolean {
  const min = term(ix, 'rarity', rarity)?.min_spice
  if (min === undefined) throw new Error(`rarity '${rarity}' has no min_spice`)
  return spice >= min
}

/** The highest spice the rarity weights cover (5). */
export function maxSpice(ix: Index): number {
  return Math.min(...termsOf(ix, 'rarity').map(t => t.weights?.length ?? 0))
}

export function favours(ix: Index, flavour: string | undefined, list: string, id: string): boolean {
  if (!flavour) return false
  return (term(ix, 'faction-flavours', flavour)?.favoured?.[list] ?? []).includes(id)
}

export function avoids(ix: Index, flavour: string | undefined, list: string, id: string): boolean {
  if (!flavour) return false
  return (term(ix, 'faction-flavours', flavour)?.avoided?.[list] ?? []).includes(id)
}

/** S4: are the flavour's avoided parts still held back at this spice? */
export function avoidedHeld(ix: Index, flavour: string | undefined, spice: number): boolean {
  if (!flavour) return false
  const until = term(ix, 'faction-flavours', flavour)?.avoided_until_spice
  return until !== undefined && spice < until
}

/** S1: how much more likely a favoured part is (1 without a flavour). */
export function favouredWeight(ix: Index, flavour: string | undefined): number {
  if (!flavour) return 1
  return term(ix, 'faction-flavours', flavour)?.favoured_weight ?? 1
}

/** The odds of one part: its effective rarity, its weight at the spice, and where it stands at the gate. */
export interface Odds {
  /** The rarity after S3 (class rarity) or S2 (the favoured step) and G9 (the default rarity). */
  rarity: string
  /** True when a class_rarity set the rarity (S3), so no favoured step applied. */
  byClass: boolean
  favoured: boolean
  /** The flavour avoids the part and still holds it back at this spice (S4). */
  held: boolean
  /** The rarity is not offered at this spice (its min_spice is higher). */
  aboveGate: boolean
  /** S1: the weight at the card's spice (0 above the gate). */
  weight: number
  /** The weight the part gets when an input or lock needs it and nothing at the gate fits (G5): its rarity's weight
   *  at the rarity's own min_spice, times the favoured weight. */
  fallbackWeight: number
}

export interface OddsContext {
  class?: string | undefined
  flavour?: string | undefined
  spice: number
}

/**
 * The odds of a part with a rarity and an optional class_rarity. `favoured` adds the weight (S1); `stepped` adds the
 * one step more common (S2). A word-list part the flavour favours gets both; a pattern's lean follows S5.
 */
export function oddsOf(
  ix: Index,
  x: { rarity?: string | undefined; class_rarity?: Record<string, string> | undefined },
  ctx: OddsContext,
  how: { favoured: boolean; stepped: boolean; held: boolean },
): Odds {
  const rules = ix.data.rules.defaults
  const byClassRarity = ctx.class !== undefined ? x.class_rarity?.[ctx.class] : undefined
  let rarity: string
  if (byClassRarity !== undefined) rarity = byClassRarity
  else {
    rarity = x.rarity ?? rules.default_rarity
    if (how.stepped) rarity = stepCommoner(ix, rarity, rules.favoured_step)
  }
  const times = how.favoured ? favouredWeight(ix, ctx.flavour) : 1
  const aboveGate = !atGate(ix, rarity, ctx.spice)
  const min = term(ix, 'rarity', rarity)?.min_spice ?? ctx.spice
  return {
    rarity,
    byClass: byClassRarity !== undefined,
    favoured: how.favoured,
    held: how.held,
    aboveGate,
    weight: aboveGate ? 0 : spiceWeight(ix, rarity, ctx.spice) * times,
    fallbackWeight: spiceWeight(ix, rarity, min) * times,
  }
}

/** S1 to S4 and G9 for a term of a word list. */
export function termOdds(ix: Index, list: string, id: string, ctx: OddsContext): Odds {
  const t = term(ix, list, id)
  if (!t) throw new Error(`'${id}' is not a term of ${list}`)
  const favoured = favours(ix, ctx.flavour, list, id)
  const held = avoids(ix, ctx.flavour, list, id) && avoidedHeld(ix, ctx.flavour, ctx.spice)
  return oddsOf(ix, t, ctx, { favoured, stepped: favoured, held })
}

/** S1, S3 and S5 for a pattern's block (its class_rarity is the variant's when the variant has one). */
export function patternOdds(
  ix: Index,
  block: { rarity: string; class_rarity?: Record<string, string> | undefined; flavour_lean: readonly string[] },
  ctx: OddsContext,
): Odds {
  const lean = ctx.flavour !== undefined && block.flavour_lean.includes(ctx.flavour)
  const how = ix.data.rules.defaults.flavour_lean
  return oddsOf(ix, block, ctx, {
    favoured: lean && how !== 'step-only',
    stepped: lean && how !== 'weight-only',
    held: false,
  })
}

/** Rank of a rarity (1 = most common); used to order the fallback of G5 (least rare first). */
export function rarityRank(ix: Index, rarity: string): number {
  const r = rank(ix, 'rarity', rarity)
  if (r === undefined) throw new Error(`rarity '${rarity}' has no rank`)
  return r
}
