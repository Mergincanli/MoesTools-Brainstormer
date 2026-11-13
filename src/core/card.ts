// Step 17 (matchups-balance-text) and the finished card (schemas/concept-card.schema.json).
//
// In the data's order: the matchups (matchups.ts), the balance hints (balance.ts) and the text (text.ts). A block flag
// never reaches a card: the attempt is rolled again (G7); the warn flags are written on it. The card's id is a hash of
// the reproduction key (seed, inputs, locks, spice, data version, generator version), so the same roll always has the
// same id. The module has no clock: created_at is the caller's, when it passes one.
import { balanceOf, warnFlags } from './balance.ts'
import { term, type Index } from './data.ts'
import { cyrb128 } from './dice.ts'
import { LOCKABLE } from './draft.ts'
import { abilitiesOf, budgetProblem } from './keys.ts'
import { matchLink, parseLink } from './links.ts'
import { matchupsOf } from './matchups.ts'
import { blockFor } from './patterns.ts'
import { inspirationOf, textOf, type CardText } from './text.ts'
import type { AbilityDraft, ConditionalDraft, Draft, DraftParts, Inputs, LockValues, ModeDraft, RollRequest, TraceEntry, WeaponDraft } from './types.ts'

/** The generator's version (generator.version on every card): one constant, raised when the code changes a card. */
export const GENERATOR_VERSION = '0.1.0'
/** The card schema's version the cards follow (schemas/concept-card.schema.json). */
export const CARD_SCHEMA_VERSION = '1.0.0'

export interface Relation {
  ref: string
  why: string
}

export interface Card {
  id: string
  schema_version: string
  generator: { version: string; data_version: string }
  seed: string
  spice: number
  inputs: Inputs
  locks: string[]
  parts: Record<string, unknown>
  matchups: { strengths: Array<Relation & { paired_with: number }>; weaknesses: Relation[]; countered_by: Relation[]; counters: Relation[]; counterplay: string[] }
  text: CardText
  inspiration: { patterns: string[]; source_units: string[] }
  balance: { cost_band: string; power: number; complexity: number; keys: number; flags: string[] }
  created_at?: string
}

/** A plain-data copy with the keys sorted (for the reproduction key). */
function canonical(x: unknown): unknown {
  if (Array.isArray(x)) return x.map(canonical)
  if (x && typeof x === 'object') return Object.fromEntries(Object.keys(x).sort().filter(k => (x as Record<string, unknown>)[k] !== undefined).map(k => [k, canonical((x as Record<string, unknown>)[k])]))
  return x
}

/** The card's id: a hash of its reproduction key (the card schema's id field). */
export function cardId(request: RollRequest, inputs: Inputs, dataVersion: string): string {
  const key = JSON.stringify(canonical({ seed: request.seed, inputs, locks: request.locks ?? {}, spice: request.spice, data: dataVersion, generator: GENERATOR_VERSION }))
  return `card-${cyrb128(key).map(n => n.toString(16).padStart(8, '0')).join('')}`
}

const weapon = (w: WeaponDraft): Record<string, unknown> => ({
  family: w.family, damage: w.damage ?? null, mount: w.mount, delivery: w.delivery ?? null, range: w.range ?? null,
  can_target: [...(w.can_target ?? [])], traits: [...(w.traits ?? [])], seat: w.seat ?? 'driver',
})
const ability = (a: AbilityDraft): Record<string, unknown> => ({ pattern: a.pattern, variant: a.variant ?? null, kind: a.kind, seat: a.seat ?? 'driver', cooldown: a.cooldown ?? null })

/** The card's parts in the card schema's shape (the draft's working fields left out). */
export function cardParts(p: DraftParts): Record<string, unknown> {
  const a = p.armament
  const mode = (m: ModeDraft): Record<string, unknown> => ({
    via: m.via, class: m.class, mobility: { base: m.mobility?.base, handling: m.mobility?.handling, speed: m.mobility?.speed },
    ...((m.armament ?? []).length ? { armament: (m.armament ?? []).map(weapon) } : {}),
  })
  return {
    class: p.class, tier: p.tier, flavour: p.flavour, nature: p.nature, availability: p.availability,
    roles: { primary: p.roles.primary, secondary: [...(p.roles.secondary ?? [])] },
    mobility: { base: p.mobility.base, handling: p.mobility.handling, traits: [...(p.mobility.traits ?? [])], speed: p.mobility.speed },
    body: { plan: p.body.plan, size: p.body.size, count: p.body.count },
    armament: {
      primary: a.primary ? weapon(a.primary) : null,
      secondary: a.secondary ? weapon(a.secondary) : null,
      conditional: (a.conditional ?? []).map((c: ConditionalDraft) => ({ when: c.when, weapon: weapon(c.weapon) })),
    },
    armour: { class: p.armour.class, models: [...(p.armour.models ?? [])] },
    sensors: { sight: p.sensors.sight, traits: [...(p.sensors.traits ?? [])] },
    crew: { model: p.crew.model, solo_fallback: p.crew.solo_fallback ?? null, passengers: p.crew.passengers ? { seats: p.crew.passengers.seats, kind: p.crew.passengers.kind } : null },
    signature: ability(p.signature as AbilityDraft),
    abilities: (p.abilities ?? []).map(ability),
    modes: (p.modes ?? []).map(mode),
    resource: p.resource ?? null,
    on_death: [...(p.on_death ?? [])],
  }
}

/** The cost links (`cost:`) the patterns name and the needs carry, judged now that the cost band is known. */
function costProblem(ix: Index, d: Draft, band: string): string | undefined {
  const p = d.parts
  const isCost = (l: string): boolean => parseLink(l).kind === 'cost'
  const yes = (l: string): boolean => matchLink(ix, p, l, band) === 'yes'
  for (const a of abilitiesOf(p)) {
    const b = blockFor(ix, a.pattern as string, a.variant ?? null)
    for (const l of b.implies.filter(isCost)) if (!yes(l)) return `${a.pattern} implies ${l}; the card's cost band is ${band}`
    for (const g of b.requires.filter(x => x.some(isCost))) if (!g.some(yes)) return `${a.pattern} requires one of ${g.join(', ')}; the card's cost band is ${band}`
    for (const l of b.excludes.filter(isCost)) if (yes(l)) return `${a.pattern} excludes ${l}; the card's cost band is ${band}`
    for (const r of [...b.adds_strengths, ...b.adds_weaknesses]) if (isCost(r.ref) && !yes(r.ref)) return `${a.pattern} names ${r.ref}; the card's cost band is ${band} (M2)`
  }
  for (const n of d.needs) {
    if (!n.links.some(isCost)) continue
    const met = n.links.some(yes)
    if (n.avoid ? met : !met) return `${n.by} ${n.avoid ? 'excludes' : 'needs'} ${n.links.join(' or ')}; the card's cost band is ${band}`
  }
  return undefined
}

/** Step 17 and the finished card; or why the attempt fails (with the block flag it would have carried). */
export function finishCard(ix: Index, d: Draft, request: RollRequest): { card: Card; trace: TraceEntry[] } | { flag?: string; problem: string } {
  const p = d.parts
  const m = matchupsOf(ix, p)
  if ('problem' in m) return m
  const b = balanceOf(ix, p)
  const cost = costProblem(ix, d, b.cost_band)
  if (cost) return { problem: cost }
  const budget = budgetProblem(ix, p)
  if (budget) return { flag: /seat/.test(budget) ? 'seat-overloaded' : 'too-many-keys-for-tier', problem: budget }
  const t = textOf(ix, d, m)
  if ('problem' in t) return t
  const flags = warnFlags(ix, p, b.cost_band)
  for (const f of flags) if (term(ix, 'balance-flags', f)?.severity === 'block') return { flag: f, problem: `block flag ${f}` }
  const rel = (l: { ref: string; why: string }): Relation => ({ ref: l.ref, why: l.why })
  const card: Card = {
    id: cardId(request, d.inputs, ix.data.dataVersion),
    schema_version: CARD_SCHEMA_VERSION,
    generator: { version: GENERATOR_VERSION, data_version: ix.data.dataVersion },
    seed: request.seed,
    spice: request.spice,
    inputs: { ...d.inputs },
    locks: LOCKABLE.filter(n => (request.locks as Partial<LockValues> | undefined)?.[n] !== undefined),
    parts: cardParts(p),
    matchups: {
      strengths: t.whys.strengths.map(s => ({ ...rel(s), paired_with: s.paired_with })),
      weaknesses: t.whys.weaknesses.map(rel),
      countered_by: t.whys.countered_by.map(rel),
      counters: t.whys.counters.map(rel),
      counterplay: t.counterplay,
    },
    text: t.text,
    inspiration: inspirationOf(ix, d),
    balance: { cost_band: b.cost_band, power: b.power, complexity: b.complexity, keys: b.keys, flags },
    ...(request.created_at !== undefined ? { created_at: request.created_at } : {}),
  }
  const trace: TraceEntry[] = [
    ...t.trace,
    { field: 'balance', value: { power: b.power, complexity: b.complexity, cost: b.cost, cost_band: b.cost_band, keys: b.keys }, how: 'default', rule: 'section 10 (B1 to B3, K-g)', candidates: 0, ...(flags.length ? { note: `warnings: ${flags.join(', ')}` } : {}) },
  ]
  return { card, trace }
}
