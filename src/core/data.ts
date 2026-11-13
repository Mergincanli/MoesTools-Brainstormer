// Lookups on the generator data: terms by list and id, ranks, patterns, variants, and a pattern's generator block
// with a variant's overrides applied the way scripts/validate.mjs reads them.
import type { GeneratorBlock, GeneratorData, Link, Pattern, Relation, RegistryEntry, Term, Variant } from './types.ts'

/** The data with its lookup tables. Built once per data object (indexOf) and never changed after. */
export interface Index {
  readonly data: GeneratorData
  /** Terms of each word list, in file order: the order every weighted draw uses. */
  readonly lists: ReadonlyMap<string, readonly Term[]>
  readonly terms: ReadonlyMap<string, ReadonlyMap<string, Term>>
  /** Written patterns, sorted by id (the file names' order). */
  readonly patterns: readonly Pattern[]
  readonly patternById: ReadonlyMap<string, Pattern>
  readonly registryById: ReadonlyMap<string, RegistryEntry>
  /** Values worked out from the data (the reach of a card, see reach.ts), by key. Same data, same values. Kept to a
   *  bound size: the oldest go first. */
  readonly cache: Map<string, unknown>
  /** Small values worked out from the data alone, kept for good (which lists a list's terms affect, and the like). */
  readonly derived: Map<string, unknown>
}

const INDEXES = new WeakMap<GeneratorData, Index>()

const byId = (a: { id: string }, b: { id: string }): number => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

/**
 * Rule switches in rules.json whose other values this code does not implement. Each value Mustafa approved is
 * implemented; any other value fails here, loudly, rather than being read as if it were the approved one.
 */
function assertSupported(data: GeneratorData): void {
  const d = data.rules.defaults
  const bad: string[] = []
  if (d.handling !== 'default_handling') bad.push(`defaults.handling '${d.handling}'`)
  if (d.avoided_blocks_implied !== true) bad.push('defaults.avoided_blocks_implied false (G6)')
  if (d.spice_fallback !== 'least-rare' && d.spice_fallback !== 'grey-out') bad.push(`defaults.spice_fallback '${d.spice_fallback}'`)
  if (d.flavour_lean !== 'favoured' && d.flavour_lean !== 'weight-only' && d.flavour_lean !== 'step-only') bad.push(`defaults.flavour_lean '${d.flavour_lean}'`)
  // The switches steps 4 to 14 read: each is implemented for the value approved (true / 'equal') only.
  const onOff: Array<[string, boolean]> = [
    ['fill_pattern_requires (G4)', d.fill_pattern_requires],
    ['take_what_fits (G16)', d.take_what_fits],
    ['always_variant (A2)', d.always_variant],
    ['implied_pattern_as_extra (A8)', d.implied_pattern_as_extra],
    ['key_traits_only_when_implied (K-d)', d.key_traits_only_when_implied],
    ['passengers.only_from_patterns (section 7)', d.passengers.only_from_patterns],
  ]
  for (const [name, on] of onOff) if (on !== true) bad.push(`defaults.${name} false`)
  for (const [name, v] of [['variant_odds', d.variant_odds], ['kind_odds', d.kind_odds], ['passengers.seat_odds', d.passengers.seat_odds]] as const) {
    if (v !== 'equal') bad.push(`defaults.${name} '${String(v)}'`)
  }
  if (bad.length) throw new Error(`rules.json has values this generator does not implement: ${bad.join('; ')}`)
}

/** The index of a data object; made on first use and kept while the data object lives. */
export function indexOf(data: GeneratorData): Index {
  const known = INDEXES.get(data)
  if (known) return known
  assertSupported(data)
  const lists = new Map<string, readonly Term[]>()
  const terms = new Map<string, ReadonlyMap<string, Term>>()
  for (const [id, list] of Object.entries(data.vocab)) {
    lists.set(id, list.terms)
    terms.set(id, new Map(list.terms.map(t => [t.id, t])))
  }
  const patterns = [...data.patterns].sort(byId)
  const ix: Index = {
    data,
    lists,
    terms,
    patterns,
    patternById: new Map(patterns.map(p => [p.id, p])),
    registryById: new Map(data.registry.map(r => [r.id, r])),
    cache: new Map(),
    derived: new Map(),
  }
  INDEXES.set(data, ix)
  return ix
}

export function term(ix: Index, list: string, id: string): Term | undefined {
  return ix.terms.get(list)?.get(id)
}

/** Every term of a word list, in file order (an empty list when the word list does not exist). */
export function termsOf(ix: Index, list: string): readonly Term[] {
  return ix.lists.get(list) ?? []
}

export function rank(ix: Index, list: string, id: string): number | undefined {
  return term(ix, list, id)?.rank
}

/** A ranked list's term at a rank compared with another term: a <= b, a >= b or equal (validate.mjs cmpRank). */
export function cmpRank(ix: Index, list: string, have: string, cmp: '<=' | '>=' | null, want: string): boolean {
  if (cmp === null) return have === want
  const a = rank(ix, list, have)
  const b = rank(ix, list, want)
  if (a === undefined || b === undefined) return false
  return cmp === '<=' ? a <= b : a >= b
}

/** Is tier a at least tier b? A missing minimum is always met. */
export function tierAtLeast(ix: Index, tier: string, min: string | undefined): boolean {
  if (min === undefined) return true
  const a = rank(ix, 'tiers', tier)
  const b = rank(ix, 'tiers', min)
  return a !== undefined && b !== undefined && a >= b
}

export function patternOf(ix: Index, id: string): Pattern | undefined {
  return ix.patternById.get(id)
}

export function variantOf(p: Pattern, id: string | null | undefined): Variant | undefined {
  return id ? p.variants.find(v => v.id === id) : undefined
}

/** A pattern's main category: a written pattern's own, else the registry's for a planned one (validate.mjs). */
export function categoryOf(ix: Index, patternId: string): string | undefined {
  return (ix.patternById.get(patternId) ?? ix.registryById.get(patternId))?.category
}

/** A generator block with the variant's overrides applied: the fields the card rules read, all present. */
export interface Block {
  pattern: string
  variant: string | null
  classes: string[]
  class_rarity: Record<string, string> | undefined
  min_tier: string
  kinds: string[]
  slot: GeneratorBlock['slot']
  rarity: string
  flavour_lean: string[]
  requires: Link[][]
  excludes: Link[]
  implies: Link[]
  conflicts_with: string[]
  adds_strengths: Relation[]
  adds_weaknesses: Relation[]
  counters: Relation[]
  countered_by: Relation[]
}

/**
 * A2: a variant's overrides replace the base fields they name, whole, exactly as validate.mjs reads them
 * (`overrides.kinds || generator.kinds`, and so on); an empty list in the overrides replaces too. slot, rarity,
 * flavour_lean and conflicts_with have no override. Without its own class_rarity a variant keeps the base one.
 */
export function blockOf(p: Pattern, variantId: string | null): Block {
  let byVariant = BLOCKS.get(p)
  if (!byVariant) BLOCKS.set(p, (byVariant = new Map()))
  const known = byVariant.get(variantId)
  if (known) return known
  const block = makeBlock(p, variantId)
  byVariant.set(variantId, block)
  return block
}

/** Blocks are worked out once per pattern and variant (they depend on the data alone, and nothing changes them). */
const BLOCKS = new WeakMap<Pattern, Map<string | null, Block>>()

function makeBlock(p: Pattern, variantId: string | null): Block {
  const G = p.generator
  if (!G) throw new Error(`pattern '${p.id}' has no generator block`)
  const v = variantOf(p, variantId)
  if (variantId && !v) throw new Error(`pattern '${p.id}' has no variant '${variantId}'`)
  const o = v?.overrides ?? {}
  return {
    pattern: p.id,
    variant: v ? v.id : null,
    classes: o.classes ?? G.classes,
    class_rarity: o.class_rarity ?? G.class_rarity,
    min_tier: o.min_tier ?? G.min_tier,
    kinds: o.kinds ?? G.kinds,
    slot: G.slot,
    rarity: G.rarity,
    flavour_lean: G.flavour_lean ?? [],
    requires: o.requires ?? G.requires ?? [],
    excludes: o.excludes ?? G.excludes ?? [],
    implies: o.implies ?? G.implies ?? [],
    conflicts_with: G.conflicts_with ?? [],
    adds_strengths: o.adds_strengths ?? G.adds_strengths ?? [],
    adds_weaknesses: o.adds_weaknesses ?? G.adds_weaknesses ?? [],
    counters: o.counters ?? G.counters ?? [],
    countered_by: o.countered_by ?? G.countered_by,
  }
}

/** Can a card use this pattern at all? It must be written with a generator block, and not merged or rejected. */
export function usablePattern(p: Pattern): boolean {
  return p.generator !== undefined && p.status !== 'merged' && p.status !== 'rejected'
}
