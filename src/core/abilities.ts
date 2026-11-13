// Choosing abilities: the signature (step 4) and the extra abilities (step 14).
//
// An ability is a pattern, one of its variants (A2), a kind (A3) and a cooldown (A4), each drawn with its own dice
// (<path>.pattern, .variant, .kind, .cooldown). Candidates come from the reach of the card at its class, tier, flavour
// and spice (A1, A6 filters, G5, G6, HC2 to HC4), then are checked against the draft: they may join the abilities on
// the card (A6, A7, A11), keep every need possible, leave room for the roles they imply (G14), and take a kind that
// fits the key, passive and seat budgets together with the extras the card still needs (section 5).
//
// Extras a card needs are chosen right after the signature, so that the parts they imply are set before the rest is
// rolled (G3): a pattern an ability implies (A8), a requires group only a pattern can meet (G4), the role's tool when
// the signature does not serve the role (G13: "the signature when one fits, otherwise an extra ability"), and a role's
// requires group only a pattern can meet (G2). Reading of G13 (reported): the signature is rolled among all candidates,
// tools role_weight times as likely (A1); when it is not a tool, a tool comes as an extra.
import { blockOf, categoryOf, type Block, type Index } from './data.ts'
import { diceFor } from './dice.ts'
import { lockWaits, withPendingLocks } from './draft.ts'
import { abilitiesOf, budgetOf, impliedKeyTraits, isKeyKind } from './keys.ts'
import { matchLink, parseLink } from './links.ts'
import { drawKeeping, keptTrace, lockedTraitsWithoutAbility, lockProblem } from './locks.ts'
import { jointProblem, needProblem, needsOfBlock, newMemo, type Memo } from './needs.ts'
import { patternOdds, type Odds } from './odds.ts'
import { poolOf, type Candidate, type Mode, type Pool } from './offer.ts'
import { blockFor, cooldownWeights, hardControlOf, kindsAtTier, mayJoin, passengerKind, roleNeedsTool, seatsBrought, servesRole, variantPool, type Placed } from './patterns.ts'
import { canMeet, type Reach } from './reach.ts'
import type { AbilityDraft, Draft, DraftParts, Link, Need, TraceEntry } from './types.ts'

export type Slot = 'signature' | 'extra'

/** The draft with one more ability: the signature, or an extra kept pending until step 14 completes the list. */
export function placed(parts: DraftParts, a: AbilityDraft, slot: Slot): DraftParts {
  return slot === 'signature' ? { ...parts, signature: a } : { ...parts, pending: [...(parts.pending ?? []), a] }
}

const onCard = (parts: DraftParts): Placed[] =>
  abilitiesOf(parts).filter(a => a.pattern !== undefined).map(a => ({ pattern: a.pattern as string, variant: a.variant }))

/** One way to place a needed ability: a pattern's block and the kinds it may take at the tier. */
export interface Option {
  block: Block
  kinds: string[]
  /** Offered by the gate reach too (G5: the extras an input's or a lock's need takes from the gate first). */
  atGate: boolean
}

/** A needed ability still to place: any of its options. */
export interface Item {
  by: string
  rule: string
  forced: boolean
  options: Option[]
}

/** What an option costs the budget, by kind: options that cost the same are one choice for the budget search. */
function costKey(ix: Index, o: Option): string {
  const traits = impliedKeyTraits(ix, { pattern: o.block.pattern, variant: o.block.variant }).length
  return o.kinds.map(k => (isKeyKind(ix, k) ? 'key' : `passive+${traits}`)).sort().join(',')
}

/** The options of an item with one representative per budget cost (and not already on the card). */
function budgetChoices(ix: Index, parts: DraftParts, item: Item): Option[] {
  const have = new Set(onCard(parts).map(a => a.pattern))
  const seen = new Map<string, Option>()
  for (const o of item.options) {
    if (have.has(o.block.pattern)) continue
    const key = costKey(ix, o)
    if (!seen.has(key)) seen.set(key, o)
  }
  return [...seen.values()]
}

/** Section 5: can every item still be placed, each with one of its kinds, within the key, passive and seat budgets? */
export function fitAll(ix: Index, parts: DraftParts, items: readonly Item[], i = 0): boolean {
  if (budgetOf(ix, parts) !== undefined) return false
  const item = items[i]
  if (!item) return true
  for (const o of budgetChoices(ix, parts, item)) {
    for (const kind of o.kinds) {
      if (fitAll(ix, placed(parts, { pattern: o.block.pattern, variant: o.block.variant, kind }, 'extra'), items, i + 1)) return true
    }
  }
  return false
}

/** The reaches a step draws from: the card's own rolls (gate), and the least rare for a need of an input or a lock. */
export interface Reaches {
  gate: Reach
  forced: Reach | undefined
  /** Options of the role's tool, worked out once per step (G13). */
  tools?: Option[]
}

const reachFor = (rs: Reaches, forced: boolean): Reach => (forced && rs.forced ? rs.forced : rs.gate)

/** The variants the reach offers as extras for these patterns, with their kinds at the tier: from the gate reach, or
 *  for an input's or a lock's need from the forced one, each marked whether the gate reach offers it too (G5). */
function extraOptions(ix: Index, rs: Reaches, forced: boolean, tier: string, patterns: readonly string[]): Option[] {
  const R = reachFor(rs, forced)
  const out: Option[] = []
  for (const id of patterns) {
    for (const v of R.patterns.get(id)?.extra ?? []) {
      const block = blockFor(ix, id, v)
      const kinds = kindsAtTier(ix, block, tier, hardControlOf(ix, id, v))
      if (kinds.length) out.push({ block, kinds, atGate: R === rs.gate || (rs.gate.patterns.get(id)?.extra.includes(v) ?? false) })
    }
  }
  return out
}

/** G13: the extras that serve the role (role_fit patterns, or a pattern that brings passenger seats). */
function toolOptions(ix: Index, d: Draft, rs: Reaches): Option[] {
  if (rs.tools) return rs.tools
  const role = d.parts.roles.primary
  const forced = roleIsFixed(d)
  rs.tools = extraOptions(ix, rs, forced, d.parts.tier ?? '', [...reachFor(rs, forced).patterns.keys()]).filter(o => servesRole(ix, role, o.block))
  return rs.tools
}

const roleIsFixed = (d: Draft): boolean => d.inputs.role !== null || d.locks.includes('roles')

/** Was this ability placed for an input or a lock (its needs are forced, G5)? */
function abilityForced(d: Draft, a: AbilityDraft): boolean {
  if (a === d.parts.signature && d.locks.includes('signature')) return true
  if (d.locks.includes('abilities') && (d.parts.abilities ?? []).includes(a)) return true
  return d.needs.some(n => n.by === `pattern:${a.pattern}` && n.forced)
}

/** The patterns that can meet a group of pattern: and category: links. */
function patternsFor(ix: Index, links: readonly Link[]): string[] {
  const ids = links.filter(l => parseLink(l).kind === 'pattern').map(l => parseLink(l).id)
  const cats = links.filter(l => parseLink(l).kind === 'category').map(l => parseLink(l).id)
  return ix.patterns.filter(p => ids.includes(p.id) || cats.includes(categoryOf(ix, p.id) ?? '')).map(p => p.id)
}

/** G2: a role's requires group that only a pattern can meet here (no part can meet its other links). */
function onlyAbilitiesMeet(ix: Index, R: Reach, need: Need): boolean {
  const other = need.links.filter(l => !['pattern', 'category'].includes(parseLink(l).kind))
  return need.links.length > other.length && !other.some(l => canMeet(ix, R, l, { use: 'role' }))
}

/**
 * The extras the card still needs, given the abilities on it (A8, G4, G13, G2), with their options; or why one of them
 * has none. With the extras locked nothing can be added: every such need must already be met.
 */
export function neededItems(ix: Index, d: Draft, parts: DraftParts, rs: Reaches): { items: Item[]; problem?: string } {
  const items: Item[] = []
  const placedNow = onCard(parts)
  const have = new Set(placedNow.map(a => a.pattern))
  const tier = parts.tier ?? ''
  const push = (by: string, rule: string, forced: boolean, options: Option[], what: string): string | undefined => {
    const open = options.filter(o => mayJoin(ix, placedNow, o.block.pattern, o.block.variant) === undefined)
    if (parts.abilities !== undefined) return `${by} needs ${what} (${rule}), and the extras are locked`
    if (!open.length) return `${by} needs ${what} as an extra ability (${rule}), and none fits`
    items.push({ by, rule, forced, options: open })
    return undefined
  }
  for (const a of abilitiesOf(parts)) {
    if (a.pattern === undefined) continue
    const b = blockFor(ix, a.pattern, a.variant ?? null)
    const forced = abilityForced(d, a)
    for (const l of b.implies) {
      const { kind, id } = parseLink(l)
      if (kind !== 'pattern' || have.has(id)) continue
      const why = push(`pattern:${a.pattern}`, 'A8', forced, extraOptions(ix, rs, forced, tier, [id]), `pattern ${id}`)
      if (why) return { items, problem: why }
    }
    for (const g of b.requires) {
      // A group a pattern can meet becomes a needed extra when no part can meet it (G4: crew:squad or a pattern).
      const byAbility = g.filter(l => ['pattern', 'category'].includes(parseLink(l).kind))
      if (!byAbility.length) continue
      const byPart = g.filter(l => !byAbility.includes(l))
      if (byPart.some(l => {
        const now = matchLink(ix, parts, l)
        return now === 'yes' || (now === 'open' && canMeet(ix, reachFor(rs, forced), l, { use: 'requires' }))
      })) continue
      const ids = patternsFor(ix, byAbility)
      if (ids.some(id => have.has(id))) continue
      const why = push(`pattern:${a.pattern}`, 'G4', forced, extraOptions(ix, rs, forced, tier, ids), `one of ${g.join(', ')}`)
      if (why) return { items, problem: why }
    }
  }
  const role = parts.roles.primary
  if (role !== undefined && roleNeedsTool(ix, role)) {
    const served = abilitiesOf(parts).some(a => a.pattern !== undefined && servesRole(ix, role, blockFor(ix, a.pattern, a.variant ?? null)))
    if (!served) {
      const why = push(`role:${role}`, 'G13', roleIsFixed(d), toolOptions(ix, d, rs), 'a pattern that serves it')
      if (why) return { items, problem: why }
    }
  }
  for (const n of d.needs) {
    if (n.rule !== 'G2' || !n.by.startsWith('role:')) continue
    const met = n.links.some(l => {
      const { kind, id } = parseLink(l)
      return (kind === 'pattern' && have.has(id)) || (kind === 'category' && placedNow.some(a => categoryOf(ix, a.pattern) === id))
    })
    if (met || !onlyAbilitiesMeet(ix, reachFor(rs, n.forced), n)) continue
    const why = push(n.by, 'G2', n.forced, extraOptions(ix, rs, n.forced, tier, patternsFor(ix, n.links)), `one of ${n.links.join(', ')}`)
    if (why) return { items, problem: why }
  }
  return { items }
}

/** G14: the roles the card's abilities imply or name in a strength, other than the primary, fit the secondary roles. */
function roleRoomProblem(ix: Index, parts: DraftParts): string | undefined {
  const roles = new Set<string>()
  for (const a of abilitiesOf(parts)) {
    if (a.pattern === undefined) continue
    const b = blockFor(ix, a.pattern, a.variant ?? null)
    for (const l of [...b.implies, ...b.adds_strengths.map(s => s.ref)]) {
      const { kind, id } = parseLink(l)
      if (kind === 'role' && id !== parts.roles.primary) roles.add(id)
    }
  }
  const room = ix.data.rules.counts.secondary_roles.length - 1
  return roles.size > room ? `its abilities name ${roles.size} roles besides the primary; there is room for ${room} (G14)` : undefined
}

/**
 * Why a pattern's variant cannot take a slot on this draft (beyond what the reach checked): it must be able to join the
 * card, its needs must fit the needs already on the draft and the parts already chosen, its roles must have room, and
 * one of its kinds must fit the budgets together with the extras the card would still need.
 */
export function variantDraftProblem(ix: Index, d: Draft, parts: DraftParts, rs: Reaches, patternId: string, variantId: string, slot: Slot, forced: boolean, memo: Memo): string | undefined {
  const why = mayJoin(ix, onCard(parts), patternId, variantId)
  if (why) return why
  const block = blockFor(ix, patternId, variantId)
  const next = placed(parts, { pattern: patternId, variant: variantId }, slot)
  const own = needsOfBlock(block, `pattern:${patternId}`, forced)
  for (const n of own) {
    const p = needProblem(ix, next, d.spice, n, memo)
    if (p) return p
  }
  const joint = jointProblem(ix, next, d.spice, [...d.needs, ...own], memo)
  if (joint) return joint
  const room = roleRoomProblem(ix, next)
  if (room) return room
  const { items, problem } = neededItems(ix, d, next, rs)
  if (problem) return problem
  const kinds = kindsAtTier(ix, block, parts.tier ?? '', hardControlOf(ix, patternId, variantId))
  if (!kinds.some(kind => fitAll(ix, placed(parts, { pattern: patternId, variant: variantId, kind }, slot), items))) {
    return 'no kind fits the key, passive and seat budgets with the extras it needs (A3, section 5)'
  }
  return undefined
}

/** The kinds of a variant that fit the budgets with the items still to place (A3: equal odds among them). */
export function kindsThatFit(ix: Index, parts: DraftParts, slot: Slot, patternId: string, variantId: string, rest: readonly Item[]): string[] {
  const block = blockFor(ix, patternId, variantId)
  return kindsAtTier(ix, block, parts.tier ?? '', hardControlOf(ix, patternId, variantId)).filter(kind =>
    fitAll(ix, placed(parts, { pattern: patternId, variant: variantId, kind }, slot), rest),
  )
}

/** A pattern with the variants that passed every check. */
export interface PatternChoice {
  pattern: string
  variants: string[]
}

/** The odds of a pattern for the draw: the best of its passing variants (S1, S3, S5), times role_weight when one of them
 *  serves the primary role (A1, G13). */
function choiceOdds(ix: Index, d: Draft, c: PatternChoice): Odds {
  const role = d.parts.roles.primary
  let best: Odds | undefined
  let serves = false
  for (const v of c.variants) {
    const b = blockFor(ix, c.pattern, v)
    const o = patternOdds(ix, b, { class: d.parts.class, flavour: d.parts.flavour, spice: d.spice })
    if (!best || o.weight > best.weight || (o.weight === best.weight && o.fallbackWeight > best.fallbackWeight)) best = o
    if (servesRole(ix, role, b)) serves = true
  }
  const o = best as Odds
  const times = serves ? ix.data.rules.defaults.role_weight : 1
  return { ...o, weight: o.weight * times, fallbackWeight: o.fallbackWeight * times }
}

export interface Chosen {
  ability: AbilityDraft
  block: Block
  mode: Mode
  trace: TraceEntry[]
}

/**
 * Draws one ability among choices: the pattern by its odds (gate, or the least rare when an input's or a lock's need
 * allows nothing at the gate, G5), the variant with equal odds among those open at the spice (S6), the kind with equal
 * odds among those that fit (A3), the cooldown by the kind's weights or the hard-control ones (A4). Each draw keeps to
 * the locks still waiting for their steps (locks.ts): a value they rule out is drawn again on the same dice; when no
 * pattern among the choices fits them, `more` gives further choices (the forced reach) for the least rare that fits.
 */
export function drawAbility(
  ix: Index, d: Draft, parts: DraftParts, path: string, slot: Slot, choices: readonly PatternChoice[], forcedOk: boolean,
  rs: Reaches, why: { how: TraceEntry['how']; by?: string; rule: string }, more?: () => readonly PatternChoice[],
): Chosen | string {
  // The extras the card would still need with this variant placed (its own A8, G4 and the others left), and the kinds
  // that fit the budgets with them (worked out once per variant).
  const kindsMemo = new Map<string, string[]>()
  const kindsOf = (patternId: string, variantId: string): string[] => {
    const key = `${patternId}|${variantId}`
    let kinds = kindsMemo.get(key)
    if (!kinds) {
      const rest = neededItems(ix, d, placed(parts, { pattern: patternId, variant: variantId }, slot), rs).items
      kinds = kindsThatFit(ix, parts, slot, patternId, variantId, rest)
      kindsMemo.set(key, kinds)
    }
    return kinds
  }
  const fitsLocks = (a: AbilityDraft): string | undefined => lockProblem(ix, d, placed(parts, a, slot))
  const variantFits = (patternId: string, variantId: string): string | undefined => {
    let why: string | undefined = 'no kind of it fits the budgets'
    for (const kind of kindsOf(patternId, variantId)) {
      why = fitsLocks({ pattern: patternId, variant: variantId, kind })
      if (!why) return undefined
    }
    return why
  }
  let extra: readonly PatternChoice[] | undefined
  const moreChoices = (): readonly PatternChoice[] => (extra ??= (more?.() ?? []).filter(c => !choices.some(x => x.pattern === c.pattern)))
  const byId = (id: string): PatternChoice | undefined => choices.find(c => c.pattern === id) ?? moreChoices().find(c => c.pattern === id)
  const patternFits = (id: string): string | undefined => {
    let why: string | undefined = 'no variant of it fits'
    for (const v of byId(id)?.variants ?? []) {
      why = variantFits(id, v)
      if (!why) return undefined
    }
    return why
  }
  const asCandidate = (c: PatternChoice): Candidate => ({ id: c.pattern, odds: choiceOdds(ix, d, c) })
  const candidates: Candidate[] = choices.map(asCandidate)
  let pool: Pool = poolOf(ix, candidates, 'gate', d.spice)
  let mode: Mode = 'gate'
  if (!pool.items.length && forcedOk) {
    pool = poolOf(ix, candidates, 'forced', d.spice)
    mode = 'forced'
  }
  const p = drawKeeping(ix, d, diceFor(d.seed, `${path}.pattern`, d.attempt), pool, patternFits, fits =>
    poolOf(ix, [...choices, ...moreChoices()].filter(c => fits(c.pattern)).map(asCandidate), 'forced', d.spice),
  )
  if (!p) return `no pattern fits as ${slot === 'signature' ? 'the signature' : 'an extra ability'}`
  if (p.pool !== pool) mode = 'forced' // the least rare that fits the locks (G5)
  const choice = byId(p.id)
  const pattern = ix.patternById.get(p.id)
  if (!choice || !pattern) return `no pattern ${p.id}`
  const fitting = choice.variants.filter(v => kindsOf(p.id, v).length > 0)
  const vPool = variantPool(pattern, fitting, d.spice, mode)
  const v = drawKeeping(ix, d, diceFor(d.seed, `${path}.variant`, d.attempt), vPool, id => variantFits(p.id, id), fits =>
    variantPool(pattern, fitting.filter(fits), d.spice, 'forced'),
  )
  if (!v) return `no variant of ${p.id} fits`
  const kinds = kindsOf(p.id, v.id)
  const k = drawKeeping(ix, d, diceFor(d.seed, `${path}.kind`, d.attempt), { items: kinds.map(id => ({ id, weight: 1 })) }, kind => fitsLocks({ pattern: p.id, variant: v.id, kind }))
  if (!k) return `no kind of ${p.id} fits the budgets`
  const hc = hardControlOf(ix, p.id, v.id)
  const bands = cooldownWeights(ix, k.id, hc)
  const cd = bands.length
    ? drawKeeping(ix, d, diceFor(d.seed, `${path}.cooldown`, d.attempt), { items: bands }, cooldown => fitsLocks({ pattern: p.id, variant: v.id, kind: k.id, cooldown }))
    : undefined
  if (bands.length && !cd) return `no cooldown of ${p.id} fits the locks`
  const block = blockOf(pattern, v.id)
  const base = { how: why.how, ...(why.by ? { by: why.by } : {}) }
  const trace: TraceEntry[] = [
    { field: `${path}.pattern`, value: p.id, ...base, rule: `${why.rule}, S1, S3, S5${servesRole(ix, d.parts.roles.primary, block) ? ', G13 (x role_weight)' : ''}`, ...keptTrace(p) },
    { field: `${path}.variant`, value: v.id, ...base, rule: 'A2, S6', ...keptTrace(v) },
    { field: `${path}.kind`, value: k.id, ...base, rule: hc ? 'A3, HC3' : 'A3', ...keptTrace(k) },
    { field: `${path}.cooldown`, value: cd?.id ?? null, ...base, rule: hc ? 'A4 (hard control)' : 'A4', ...(cd ? keptTrace(cd) : { candidates: 0 }) },
  ]
  return { ability: { pattern: p.id, variant: v.id, kind: k.id, cooldown: cd?.id ?? null }, block, mode, trace }
}

/** The choices for one item: its options grouped by pattern, each variant checked against the draft. Those the gate
 *  reach offers come first; the others only when none of those fits (G5). */
export function itemChoices(ix: Index, d: Draft, rs: Reaches, item: Item): PatternChoice[] {
  const memo = newMemo()
  const from = (options: readonly Option[]): PatternChoice[] => {
    const byPattern = new Map<string, string[]>()
    for (const o of options) {
      const v = o.block.variant
      if (v === null) continue
      if (variantDraftProblem(ix, d, d.parts, rs, o.block.pattern, v, 'extra', item.forced, memo) !== undefined) continue
      byPattern.set(o.block.pattern, [...(byPattern.get(o.block.pattern) ?? []), v])
    }
    return [...byPattern].map(([pattern, variants]) => ({ pattern, variants }))
  }
  const gate = from(item.options.filter(o => o.atGate))
  return gate.length || !item.forced ? gate : from(item.options)
}

/** Section 7: the passenger seats the card's abilities need: the most any of them brings (0 = none brings seats). */
export function seatsNeeded(ix: Index, parts: DraftParts): number {
  return Math.max(0, ...abilitiesOf(parts).filter(a => a.pattern !== undefined).map(a => seatsBrought(blockFor(ix, a.pattern as string, a.variant ?? null))))
}

/** Places one needed extra (its own dice: abilities.<i>.*); why it could not, or undefined. */
export function placeItem(ix: Index, d: Draft, rs: Reaches, item: Item): string | undefined {
  const choices = itemChoices(ix, d, rs, item)
  const index = (d.parts.pending ?? []).length
  const got = drawAbility(ix, d, d.parts, `abilities.${index}`, 'extra', choices, item.forced, rs, { how: 'needed', by: item.by, rule: item.rule })
  if (typeof got === 'string') return `${item.by} needs an extra ability (${item.rule}): ${got}`
  d.parts = placed(d.parts, got.ability, 'extra')
  d.needs.push(...needsOfBlock(got.block, `pattern:${got.ability.pattern}`, item.forced || got.mode === 'forced'))
  d.trace.push(...got.trace)
  return undefined
}

/**
 * Extras a waiting lock needs that only a pattern brings (G5: a part a lock needs is set): an ability that implies a
 * locked key-bound trait (K-d), and a pattern that brings the locked passenger seats (section 7). They come after the
 * card's own needed extras, so a lock on a card's own value adds none (T2): on that card one of those already does it.
 */
function lockItems(ix: Index, d: Draft, parts: DraftParts, rs: Reaches): { items: Item[]; problem?: string } {
  const all = withPendingLocks(d, parts)
  if (!all) return { items: [] }
  const placedNow = onCard(parts)
  const options = (keep: (b: Block) => boolean): Option[] =>
    extraOptions(ix, rs, true, parts.tier ?? '', [...reachFor(rs, true).patterns.keys()]).filter(o => keep(o.block) && mayJoin(ix, placedNow, o.block.pattern, o.block.variant) === undefined)
  const trait = lockWaits(d, 'mobility', 'mobility-traits') ? lockedTraitsWithoutAbility(ix, d, parts)[0] : undefined
  if (trait !== undefined) {
    const o = options(b => b.implies.includes(`mobility-trait:${trait}`))
    if (!o.length) return { items: [], problem: `the locked mobility trait ${trait} uses a key, so an ability must imply it (K-d), and no extra ability that does fits` }
    return { items: [{ by: 'lock:mobility', rule: 'K-d', forced: true, options: o }] }
  }
  const locked = all.crew.passengers
  if (lockWaits(d, 'crew', 'crew') && locked && locked.seats > 0 && (seatsNeeded(ix, all) === 0 || passengerKind(ix, all) !== locked.kind)) {
    const kindWith = (b: Block): string | undefined => passengerKind(ix, placed(all, { pattern: b.pattern, variant: b.variant }, 'extra'))
    const o = options(b => seatsBrought(b) > 0 && seatsBrought(b) <= locked.seats && kindWith(b) === locked.kind)
    if (!o.length) return { items: [], problem: `the locked crew has ${locked.seats} ${locked.kind} seats, and no extra ability that brings them fits (section 7)` }
    return { items: [{ by: 'lock:crew', rule: 'section 7', forced: true, options: o }] }
  }
  return { items: [] }
}

/** Places the extras the card needs (A8, G4, G13, G2), one after another, then those a waiting lock needs. */
export function placeNeededExtras(ix: Index, d: Draft, rs: Reaches): string | undefined {
  for (let guard = 0; guard < 8; guard++) {
    let { items, problem } = neededItems(ix, d, d.parts, rs)
    if (!problem && !items.length) ({ items, problem } = lockItems(ix, d, d.parts, rs))
    if (problem) return problem
    const item = items[0]
    if (!item) return undefined
    const why = placeItem(ix, d, rs, item)
    if (why) return why
  }
  return 'too many needed extras'
}

/** An item for a need on pattern: or category: links that an extra ability must meet now (the need's last owner). */
export function itemForNeed(ix: Index, d: Draft, rs: Reaches, need: Need): Item | string {
  const placedNow = onCard(d.parts)
  const options = extraOptions(ix, rs, need.forced, d.parts.tier ?? '', patternsFor(ix, need.links)).filter(o => mayJoin(ix, placedNow, o.block.pattern, o.block.variant) === undefined)
  if (!options.length) return `${need.by} needs ${need.links.join(' or ')} (${need.rule}), and no extra ability fits`
  return { by: need.by, rule: need.rule, forced: need.forced, options }
}
