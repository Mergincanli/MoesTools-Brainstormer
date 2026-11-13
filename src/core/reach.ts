// What a card can still hold: the model behind "can hold" (G13, G14) and behind "can be met", "can be set" and
// "can be avoided" for a pattern's requires, implies, strengths and excludes (A1, G3 to G6, M2).
//
// Given a draft (class, tier and flavour chosen, maybe more), a spice and a mode, it works out every value each part
// could still take: in mode 'gate' only what the generator may roll on its own (at the spice gate, not held back by the
// flavour: G5, G6, S4); in mode 'forced' everything the hard rules allow, as for a part that an input or a lock needs
// (G5). Parts are checked against each other until nothing changes (each value must fit some value of every other part,
// both ways, as G1 reads the maps), then the weapons, the target the unit is, the passenger seats, and the patterns
// (to a fixed point, since patterns need roles and parts, and roles need patterns).
//
// It is a model of possibilities, one link at a time: when it says a link cannot be met, no card can meet it; when it
// says it can, a step may still find that two needs clash, and the attempt is rolled again (G7).
import { blockOf, categoryOf, cmpRank, term, termsOf, tierAtLeast, usablePattern, type Block, type Index } from './data.ts'
import { matchLink, parseLink, targetOf, weaponsOf } from './links.ts'
import { patternOdds } from './odds.ts'
import { abilitiesOf } from './keys.ts'
import { offerTerms, onOwnRolls, termProblem, UNIT_PARTS, type Mode } from './offer.ts'
import { hardControlOf, kindsAtTier, mayJoin, neverOnCardWeapon, seatsBrought } from './patterns.ts'
import type { DraftParts, Link, Term, WeaponDraft } from './types.ts'

/** The single-valued parts the model narrows against each other. classes and tiers are always chosen already. */
const SINGLE = ['classes', 'tiers', 'mobility', 'handling', 'speed-bands', 'bodies', 'sizes', 'armour-classes', 'crew-models', 'nature', 'availability', 'sight-bands']
/** The parts that hold a list of terms (each may also be empty, except armour models). */
const MULTI = ['mobility-traits', 'armour-models', 'sensor-traits']
/** Link kinds that name one of the single-valued parts. */
const SINGLE_KINDS = new Set(['class', 'tier', 'availability', 'armour-class', 'mobility', 'handling', 'body', 'size', 'speed', 'crew', 'sight', 'nature'])
const MULTI_KINDS: Readonly<Record<string, string>> = { 'armour-model': 'armour-models', 'mobility-trait': 'mobility-traits', sensor: 'sensor-traits' }

export interface WeaponReach {
  families: Set<string>
  damages: Set<string>
  deliveries: Set<string>
  /** The ranges the weapons have on their own: each family's default_range (G11), or a chosen weapon's range. */
  ranges: Set<string>
  /** The ranges a pattern's implies or requires may set on a weapon (G11): those some possible delivery allows. */
  settableRanges: Set<string>
  traits: Set<string>
  hits: Set<string>
  mounts: Set<string>
}

/** The variants of a pattern that can be offered, by slot (A1 signature, A6 extra). */
export interface PatternReach {
  signature: string[]
  extra: string[]
}

export interface Reach {
  mode: Mode
  spice: number
  parts: DraftParts
  single: Map<string, Set<string>>
  multi: Map<string, Set<string>>
  /** What kind of target the unit can be (from its mobility and size). */
  targets: Set<string>
  weapon: WeaponReach
  /** The most passenger seats the card's size allows (rules.json defaults.passengers.caps). */
  maxSeats: number
  /** Patterns that can still be added, with their variants. */
  patterns: Map<string, PatternReach>
  /** Patterns of the abilities already on the draft. */
  fixedPatterns: Set<string>
  categories: Set<string>
  resources: Set<string>
  /** Key-bound mobility traits that some pattern that can be added implies (K-d). */
  impliedTraits: Set<string>
  /** Some pattern that can be added brings passenger seats (section 7). */
  bringsSeats: boolean
  /** Ranges named by the implies and requires of patterns that can be added (G11). */
  patternRanges: Set<string>
}

/** The pattern being checked, whose own links count while it is checked (its own pattern, category, seats, ranges). */
export interface Self {
  pattern: string
  block: Block
}

/** How a link is used: a pattern's requires (G4) or implies (G3, A8), a strength or weakness (M2), or a role's needs. */
export interface MeetContext {
  self?: Self | undefined
  use?: 'requires' | 'implies' | 'strength' | 'role'
}

const hasAny = <T>(set: ReadonlySet<T>, test: (v: T) => boolean): boolean => {
  for (const v of set) if (test(v)) return true
  return false
}

// ---------------------------------------------------------------- the parts

function singleValue(parts: DraftParts, list: string): string | undefined {
  const v = UNIT_PARTS[list]?.(parts)[0]
  return typeof v === 'string' ? v : undefined
}

/** Does some value of every other part accept this term, and does the term accept some value of each (G1, both ways)? */
function supported(ix: Index, D: Map<string, Set<string>>, list: string, id: string): boolean {
  const t = term(ix, list, id)
  if (!t) return false
  for (const [k, allowed] of Object.entries(t.allowed ?? {})) {
    const dom = D.get(k)
    if (dom && !hasAny(dom, x => allowed.includes(x))) return false
  }
  for (const [k, excluded] of Object.entries(t.excluded ?? {})) {
    const dom = D.get(k)
    if (dom && dom.size && !hasAny(dom, x => !excluded.includes(x))) return false
  }
  for (const [other, dom] of D) {
    if (other === list) continue
    const accepts = hasAny(dom, b => {
      const tb = term(ix, other, b)
      const allowed = tb?.allowed?.[list]
      return (!allowed || allowed.includes(id)) && !(tb?.excluded?.[list] ?? []).includes(id)
    })
    if (!accepts) return false
  }
  return true
}

/** Can a single-part link hold, and must it, given the domains? (Used for the nature entries' when links.) */
function domainMatch(ix: Index, D: Map<string, Set<string>>, link: Link): { can: boolean; must: boolean } {
  const { kind, cmp, id } = parseLink(link)
  const list = ix.data.refKinds[kind]?.vocab
  const dom = list ? D.get(list) : undefined
  if (!list || !dom || !SINGLE_KINDS.has(kind)) return { can: true, must: false }
  const can = hasAny(dom, v => cmpRank(ix, list, v, cmp, id))
  const must = dom.size > 0 && !hasAny(dom, v => !cmpRank(ix, list, v, cmp, id))
  return { can, must }
}

/** Section 7: the natures the card can have: the first nature entry whose when link the card meets and whose nature the
 *  word lists allow for the card (rules.json defaults.nature). */
function natures(ix: Index, parts: DraftParts, D: Map<string, Set<string>>): Set<string> {
  const out = new Set<string>()
  for (const e of ix.data.rules.defaults.nature) {
    if (termProblem(ix, parts, 'nature', e.nature) !== undefined) continue // the word lists do not allow it here
    const { can, must } = e.when ? domainMatch(ix, D, e.when) : { can: true, must: true }
    if (can) out.add(e.nature)
    if (must) break // the first entry the card surely meets gives its nature; later entries are never reached
  }
  return out
}

function domains(ix: Index, parts: DraftParts, spice: number, mode: Mode): Map<string, Set<string>> {
  const D = new Map<string, Set<string>>()
  const counts = ix.data.rules.counts
  for (const list of SINGLE) {
    const fixed = singleValue(parts, list)
    if (fixed !== undefined) {
      D.set(list, new Set([fixed]))
      continue
    }
    if (list === 'handling' || list === 'nature') continue // worked out from the other parts below
    let ids: string[]
    if (list === 'availability') {
      // Availability has its own fixed weights and gates (rules.json counts.availability, question AV).
      ids = Object.entries(counts.availability)
        .filter(([, a]) => a.weight > 0 && spice >= (a.min_spice ?? 1) && tierAtLeast(ix, parts.tier ?? '', a.min_tier))
        .map(([id]) => id)
        .filter(id => termProblem(ix, parts, list, id) === undefined)
    } else if (list === 'sight-bands') {
      ids = Object.entries(counts.sight).filter(([, w]) => w > 0).map(([id]) => id)
    } else {
      ids = offerTerms(ix, parts, spice, list).candidates.filter(c => mode === 'forced' || onOwnRolls(c)).map(c => c.id)
    }
    D.set(list, new Set(ids))
  }
  // The handling and the nature follow from the other parts. Worked out again after each pass, they only ever shrink
  // (kept to what they were): a value the pass removed never comes back, so the narrowing always ends.
  const narrow = (list: string, values: Set<string>): void => {
    const before = D.get(list)
    D.set(list, before ? new Set([...values].filter(v => before.has(v))) : values)
  }
  const derive = (): void => {
    if (singleValue(parts, 'handling') === undefined) {
      // G10: handling is always the mobility's default_handling.
      const hs = new Set<string>()
      for (const m of D.get('mobility') ?? []) {
        const h = term(ix, 'mobility', m)?.default_handling
        if (h) hs.add(h)
      }
      narrow('handling', hs)
    }
    if (singleValue(parts, 'nature') === undefined) narrow('nature', natures(ix, parts, D))
  }
  derive()
  for (let changed = true; changed; ) {
    changed = false
    for (const [list, dom] of D) {
      for (const id of [...dom]) {
        if (!supported(ix, D, list, id)) {
          dom.delete(id)
          changed = true
        }
      }
    }
    if (changed) derive()
  }
  return D
}

function multiDomains(ix: Index, parts: DraftParts, spice: number, mode: Mode, D: Map<string, Set<string>>): Map<string, Set<string>> {
  const M = new Map<string, Set<string>>()
  for (const list of MULTI) {
    const read = UNIT_PARTS[list]?.(parts)
    const decided =
      (list === 'mobility-traits' && parts.mobility.traits !== undefined) ||
      (list === 'armour-models' && parts.armour.models !== undefined) ||
      (list === 'sensor-traits' && parts.sensors.traits !== undefined)
    if (decided) {
      M.set(list, new Set((read ?? []).filter((v): v is string => typeof v === 'string')))
      continue
    }
    const ids = offerTerms(ix, parts, spice, list)
      .candidates.filter(c => mode === 'forced' || onOwnRolls(c))
      .map(c => c.id)
      .filter(id => supported(ix, D, list, id))
    M.set(list, new Set(ids))
  }
  return M
}

function targets(ix: Index, D: Map<string, Set<string>>): Set<string> {
  const out = new Set<string>()
  for (const m of D.get('mobility') ?? []) {
    for (const s of D.get('sizes') ?? []) {
      const t = targetOf(ix, m, s)
      if (t) out.add(t)
    }
  }
  return out
}

// ---------------------------------------------------------------- the weapons

/** The anti-air trait that lifts a weapon to high air (validate.mjs exempt; weapon-traits word list). */
const ANTI_AIR = 'anti-air'

const emptyWeaponReach = (): WeaponReach => ({
  families: new Set(), damages: new Set(), deliveries: new Set(), ranges: new Set(), settableRanges: new Set(), traits: new Set(), hits: new Set(), mounts: new Set(),
})

/**
 * What the card's weapons can still be: the union of what each weapon can be. A weapon whose family is chosen counts
 * for itself; a weapon still to come (or one with no family yet) counts as any family the card can hold. Each weapon's
 * share depends only on itself and on the unit's parts, so it is kept by those (`context`): while one weapon's parts
 * are drawn, the others' shares are worked out once.
 */
function weaponReach(ix: Index, parts: DraftParts, spice: number, mode: Mode, D: Map<string, Set<string>>, tgts: Set<string>, context: string): WeaponReach {
  const out = emptyWeaponReach()
  const add = (r: WeaponReach): void => {
    for (const k of Object.keys(out) as Array<keyof WeaponReach>) for (const x of r[k]) out[k].add(x)
  }
  const share = (w: WeaponDraft): WeaponReach => {
    const { seat: _seat, affects: _affects, ...own } = w
    const key = `weapon-share|${context}|${JSON.stringify(own)}`
    const known = ix.cache.get(key) as WeaponReach | undefined
    if (known) return known
    const r = weaponShare(ix, parts, spice, mode, D, tgts, own)
    ix.cache.set(key, r)
    return r
  }
  const { weapons, complete } = weaponsOf(parts)
  for (const w of weapons) if (w.family !== undefined) add(share(w))
  if (!complete || weapons.some(w => w.family === undefined)) add(share({}))
  return out
}

/** What one weapon can be (weaponReach): its own parts where chosen, else what its family (or any family) allows. */
function weaponShare(ix: Index, parts: DraftParts, spice: number, mode: Mode, D: Map<string, Set<string>>, tgts: Set<string>, one: WeaponDraft): WeaponReach {
  const out = emptyWeaponReach()
  const slots: Array<{ fam: Term; w: WeaponDraft }> = []
  if (one.family !== undefined) {
    const fam = term(ix, 'weapon-families', one.family)
    if (fam) slots.push({ fam, w: one })
  } else {
    for (const c of offerTerms(ix, parts, spice, 'weapon-families', { weapon: {} }).candidates) {
      const fam = term(ix, 'weapon-families', c.id)
      if (fam && (mode === 'forced' || onOwnRolls(c))) slots.push({ fam, w: {} })
    }
  }
  const allTargets = termsOf(ix, 'target-types').filter(t => !t.source_only).map(t => t.id)
  const allRanges = termsOf(ix, 'range-bands').filter(t => !t.source_only).map(t => t.id)
  const bodies = D.get('bodies') ?? new Set<string>()
  // Traits and mounts are checked once for a weapon with no parts yet; a family whose own maps name traits or mounts
  // is checked again for itself (none does today, but the rules read maps both ways).
  const mapsName = (fam: Term, list: string): boolean => !!fam.allowed?.[list] || !!fam.excluded?.[list]
  const traitsFor = (weapon: WeaponDraft): Term[] =>
    termsOf(ix, 'weapon-traits').filter(t => !t.source_only && !neverOnCardWeapon(ix, `weapon-trait:${t.id}`) && termProblem(ix, parts, 'weapon-traits', t.id, weapon) === undefined)
  const mountsFor = (weapon: WeaponDraft): string[] =>
    offerTerms(ix, parts, spice, 'aim-models', { weapon }).candidates
      .filter(c => mode === 'forced' || onOwnRolls(c))
      .filter(c => hasAny(bodies, b => {
        const allowed = term(ix, 'bodies', b)?.allowed?.['aim-models']
        return !allowed || allowed.includes(c.id)
      }))
      .map(c => c.id)
  const plainTraits = traitsFor({})
  const plainMounts = mountsFor({})
  for (const { fam, w } of slots) {
    out.families.add(fam.id)
    const weapon: WeaponDraft = { ...w, family: fam.id }
    // Deliveries: the chosen one, else every one the family allows (its default when it lists none), that fits.
    const dels = (w.delivery !== undefined ? (w.delivery === null ? [] : [w.delivery]) : (fam.allowed?.['weapon-delivery'] ?? (fam.default_delivery ? [fam.default_delivery] : []))).filter(d => {
      if (termProblem(ix, parts, 'weapon-delivery', d, weapon) !== undefined) return false
      // A delivery's requires on what the unit is (drop needs a flier) must be possible.
      for (const g of term(ix, 'weapon-delivery', d)?.requires ?? []) {
        if (!g.some(l => (parseLink(l).kind === 'target' ? tgts.has(parseLink(l).id) : true))) return false
      }
      return true
    })
    for (const d of dels) out.deliveries.add(d)
    // Damage: the chosen one, else every allowed one (G12 rolls another allowed value now and then).
    const dmg = w.damage !== undefined ? (w.damage === null ? [] : [w.damage]) : (fam.allowed?.['damage-types'] ?? (fam.default_damage ? [fam.default_damage] : []))
    for (const x of dmg) if (termProblem(ix, parts, 'damage-types', x, weapon) === undefined) out.damages.add(x)
    // Range (G11): the chosen one, else the family's default; a pattern may set any range a delivery allows.
    const own = w.range !== undefined ? w.range : (fam.default_range ?? null)
    if (own) out.ranges.add(own)
    for (const d of dels) for (const r of term(ix, 'weapon-delivery', d)?.allowed?.['range-bands'] ?? allRanges) out.settableRanges.add(r)
    // Targets (G12): every type the family and the delivery allow; high air also through the anti-air trait.
    if (w.can_target !== undefined) for (const x of w.can_target) out.hits.add(x)
    else {
      for (const d of dels) {
        const dt = term(ix, 'weapon-delivery', d)
        const famT = fam.allowed?.['target-types'] ?? allTargets
        const delT = dt?.allowed?.['target-types'] ?? allTargets
        for (const x of famT) if (delT.includes(x) && allTargets.includes(x)) out.hits.add(x)
        const aa = term(ix, 'weapon-traits', ANTI_AIR)
        const aaFits = aa !== undefined && !(aa.excluded?.['weapon-delivery'] ?? []).includes(d) && !(dt?.excluded?.['weapon-traits'] ?? []).includes(ANTI_AIR)
        if (aaFits && famT.includes('low-air') && delT.includes('high-air')) out.hits.add('high-air')
      }
    }
    // Traits: every trait that fits the tier and some delivery, never the stun trait (HC1).
    if (w.traits !== undefined) for (const x of w.traits) out.traits.add(x)
    else {
      for (const t of mapsName(fam, 'weapon-traits') ? traitsFor(weapon) : plainTraits) {
        const fits = dels.some(d => !(t.excluded?.['weapon-delivery'] ?? []).includes(d) && !(term(ix, 'weapon-delivery', d)?.excluded?.['weapon-traits'] ?? []).includes(t.id))
        if (fits || dels.length === 0) out.traits.add(t.id)
      }
    }
    // Mounts (G12): the aim models some possible body allows, at the gate, that some delivery does not exclude.
    if (w.mount !== undefined) out.mounts.add(w.mount)
    else {
      for (const m of mapsName(fam, 'aim-models') ? mountsFor(weapon) : plainMounts) {
        const delOk = dels.length === 0 || dels.some(d => !(term(ix, 'weapon-delivery', d)?.excluded?.['aim-models'] ?? []).includes(m))
        if (delOk) out.mounts.add(m)
      }
    }
  }
  return out
}

/** The unit-wide lists that a map links with weapon parts (a unit term's map names a weapon list, or a weapon term's
 *  map names the unit list): the body's allowed mounts, for one. Worked out once per data. */
function weaponLinkedLists(ix: Index): string[] {
  const known = ix.derived.get('weapon-linked-lists') as string[] | undefined
  if (known) return known
  const weaponLists = ['weapon-families', 'aim-models', 'damage-types', 'weapon-delivery', 'target-types', 'range-bands', 'weapon-traits']
  const out = new Set<string>()
  for (const list of Object.keys(UNIT_PARTS)) {
    for (const t of termsOf(ix, list)) for (const k of [...Object.keys(t.allowed ?? {}), ...Object.keys(t.excluded ?? {})]) if (weaponLists.includes(k)) out.add(list)
  }
  for (const wl of weaponLists) {
    for (const t of termsOf(ix, wl)) for (const k of [...Object.keys(t.allowed ?? {}), ...Object.keys(t.excluded ?? {})]) if (Object.hasOwn(UNIT_PARTS, k)) out.add(k)
  }
  const list = [...out].sort()
  ix.derived.set('weapon-linked-lists', list)
  return list
}

/** What a weapon's share of the reach depends on besides the weapon itself: the class, tier, flavour, spice and mode,
 *  the possible bodies (mounts) and targets (a dropped weapon needs a flier), and the unit-wide parts that a map links
 *  with weapon parts. */
function weaponContext(ix: Index, parts: DraftParts, spice: number, mode: Mode, bodies: ReadonlySet<string>, tgts: ReadonlySet<string>): string {
  const unitMaps = weaponLinkedLists(ix).map(l => `${l}=${(UNIT_PARTS[l]?.(parts) ?? []).join('+')}`)
  return `${mode}|${spice}|${parts.class}|${parts.tier}|${parts.flavour}|${[...bodies].join('+')}|${[...tgts].join('+')}|${unitMaps.join('|')}`
}

/**
 * The weapons a draft can still get, worked out from its chosen parts alone (the other parts are not narrowed against
 * each other): the quick check of a need on a weapon part between the steps (needs.ts).
 */
/** The bodies and targets a draft can still have (each chosen part as it is, the open ones by their offer). */
function bodiesAndTargets(ix: Index, parts: DraftParts, spice: number, mode: Mode): { bodies: Set<string>; tgts: Set<string> } {
  const pool = (list: string): Set<string> => {
    const v = singleValue(parts, list)
    if (v !== undefined) return new Set([v])
    return new Set(offerTerms(ix, parts, spice, list).candidates.filter(c => mode === 'forced' || onOwnRolls(c)).map(c => c.id))
  }
  const tgts = new Set<string>()
  const sizes = pool('sizes')
  for (const m of pool('mobility')) {
    for (const s of sizes) {
      const t = targetOf(ix, m, s)
      if (t) tgts.add(t)
    }
  }
  return { bodies: pool('bodies'), tgts }
}

/** The key of what a weapon's parts depend on, besides the weapon itself (weaponContext), for a draft. */
export function weaponContextOf(ix: Index, parts: DraftParts, spice: number, mode: Mode): string {
  const { bodies, tgts } = bodiesAndTargets(ix, parts, spice, mode)
  return weaponContext(ix, parts, spice, mode, bodies, tgts)
}

export function weaponOptions(ix: Index, parts: DraftParts, spice: number, mode: Mode): WeaponReach {
  const { bodies, tgts } = bodiesAndTargets(ix, parts, spice, mode)
  // The weapons depend on the chosen weapons and on weaponContext: kept by those.
  const context = weaponContext(ix, parts, spice, mode, bodies, tgts)
  const key = `weapons|${context}|${JSON.stringify(parts.armament)}`
  const known = ix.cache.get(key) as WeaponReach | undefined
  if (known) return known
  const out = weaponReach(ix, parts, spice, mode, new Map([['bodies', bodies]]), tgts, context)
  ix.cache.set(key, out)
  if (ix.cache.size > KEEP) {
    const oldest = ix.cache.keys().next().value
    if (oldest !== undefined) ix.cache.delete(oldest)
  }
  return out
}

// ---------------------------------------------------------------- building the reach

function expandRange(ix: Index, link: Link): string[] {
  const { cmp, id } = parseLink(link)
  return termsOf(ix, 'range-bands').filter(t => !t.source_only && cmpRank(ix, 'range-bands', t.id, cmp, id)).map(t => t.id)
}

function build(ix: Index, parts: DraftParts, spice: number, mode: Mode): Reach {
  const D = domains(ix, parts, spice, mode)
  const M = multiDomains(ix, parts, spice, mode, D)
  const tgts = targets(ix, D)
  const caps = ix.data.rules.defaults.passengers.caps
  const fixedSeats = parts.crew.passengers
  const maxSeats = fixedSeats !== undefined ? (fixedSeats?.seats ?? 0) : Math.max(0, ...[...(D.get('sizes') ?? [])].map(s => caps[s] ?? 0))
  const fixedPatterns = new Set<string>()
  for (const a of abilitiesOf(parts)) if (a.pattern !== undefined) fixedPatterns.add(a.pattern)
  const R: Reach = {
    mode,
    spice,
    parts,
    single: D,
    multi: M,
    targets: tgts,
    weapon: weaponReach(ix, parts, spice, mode, D, tgts, weaponContext(ix, parts, spice, mode, D.get('bodies') ?? new Set(), tgts)),
    maxSeats,
    patterns: new Map(),
    fixedPatterns,
    categories: new Set([...fixedPatterns].map(p => categoryOf(ix, p)).filter((c): c is string => !!c)),
    resources: new Set(parts.resource ? [parts.resource] : []),
    impliedTraits: new Set(),
    bringsSeats: false,
    patternRanges: new Set(),
  }
  const moreAbilities = parts.signature === undefined || parts.abilities === undefined
  if (moreAbilities) {
    // The patterns, to a fixed point: each round sees the patterns the round before found (requires pattern:..., roles).
    for (let round = 0, size = -1; round < 10; round++) {
      const next = new Map<string, PatternReach>()
      let count = 0
      for (const p of ix.patterns) {
        if (!usablePattern(p) || fixedPatterns.has(p.id)) continue
        const ok = p.variants.filter(v => variantProblem(ix, R, p.id, v.id) === undefined).map(v => v.id)
        if (!ok.length) continue
        const slot = p.generator?.slot
        next.set(p.id, { signature: slot === 'extra' ? [] : ok, extra: slot === 'signature' ? [] : ok })
        count += ok.length
      }
      R.patterns = next
      for (const [id, pr] of next) {
        const c = categoryOf(ix, id)
        if (c) R.categories.add(c)
        const p = ix.patternById.get(id)
        if (!p) continue
        for (const v of new Set([...pr.signature, ...pr.extra])) {
          const b = blockOf(p, v)
          for (const l of [...b.implies, ...b.requires.flat()]) {
            const { kind, id: x } = parseLink(l)
            if (kind === 'resource') R.resources.add(x)
            if (kind === 'range') for (const r of expandRange(ix, l)) R.patternRanges.add(r)
          }
          for (const l of b.implies) if (parseLink(l).kind === 'mobility-trait') R.impliedTraits.add(parseLink(l).id)
          if (seatsBrought(b) > 0 && seatsBrought(b) <= maxSeats) R.bringsSeats = true
        }
      }
      if (count === size) break
      size = count
    }
  }
  // G2 for multi-part terms with requires (crew-casualties needs a gunner, a commander or a passenger seat).
  for (const [list, dom] of M) {
    for (const id of [...dom]) {
      const groups = term(ix, list, id)?.requires ?? []
      if (!groups.every(g => g.some(l => canMeet(ix, R, l)))) dom.delete(id)
    }
  }
  return R
}

/** How many reaches the index keeps; the oldest goes first. A reach depends only on the data, the draft, the spice
 *  and the mode, so a kept one is always right; the bound only keeps memory small over many rolls. */
const KEEP = 2000

/** Is the draft plain: nothing chosen yet but class, tier, flavour and roles? Only plain reaches are kept: they recur
 *  across rolls (54 class, tier and flavour combinations), while a fuller draft is new on every roll. */
function plain(parts: DraftParts): boolean {
  const empty = (o: object): boolean => Object.values(o).every(v => v === undefined)
  return (
    parts.nature === undefined && parts.availability === undefined && empty(parts.mobility) && empty(parts.body) &&
    empty(parts.armament) && empty(parts.armour) && empty(parts.sensors) && empty(parts.crew) &&
    parts.signature === undefined && parts.abilities === undefined && parts.pending === undefined &&
    parts.modes === undefined && parts.resource === undefined && parts.on_death === undefined
  )
}

/** For each pattern: c (a pattern id, or "category:" plus a category) to the patterns whose requires, implies or
 *  strength links name it. Worked out once per data. */
function dependents(ix: Index): Map<string, string[]> {
  const known = ix.derived.get('dependents') as Map<string, string[]> | undefined
  if (known) return known
  const out = new Map<string, string[]>()
  for (const p of ix.patterns) {
    if (!usablePattern(p)) continue
    for (const v of p.variants) {
      const b = blockOf(p, v.id)
      for (const l of [...b.requires.flat(), ...b.implies, ...b.adds_strengths.map(s => s.ref), ...b.adds_weaknesses.map(s => s.ref)]) {
        const { kind, id } = parseLink(l)
        if (kind !== 'pattern' && kind !== 'category') continue
        const key = kind === 'pattern' ? id : `category:${id}`
        const list = out.get(key) ?? []
        if (!list.includes(p.id)) list.push(p.id)
        out.set(key, list)
      }
    }
  }
  ix.derived.set('dependents', out)
  return out
}

/**
 * The reach of a plain draft, seeing the abilities a draft already has: a pattern whose requires, implies or strength
 * links name one of them (overload-past-cap needs mind-control, a signature-only pattern) may now be offered. Only
 * those patterns are checked again.
 */
export function reachWithAbilities(ix: Index, R: Reach, parts: DraftParts): Reach {
  const abilities = abilitiesOf(parts).filter(a => a.pattern !== undefined)
  if (!abilities.length) return R
  const seen = { signature: parts.signature, abilities: parts.abilities, pending: parts.pending }
  const R2: Reach = {
    ...R,
    parts: { ...R.parts, ...seen },
    fixedPatterns: new Set([...R.fixedPatterns, ...abilities.map(a => a.pattern as string)]),
    categories: new Set([...R.categories, ...abilities.map(a => categoryOf(ix, a.pattern as string)).filter((c): c is string => !!c)]),
    patterns: new Map(R.patterns),
  }
  const deps = dependents(ix)
  const touched = new Set(abilities.flatMap(a => [...(deps.get(a.pattern as string) ?? []), ...(deps.get(`category:${categoryOf(ix, a.pattern as string)}`) ?? [])]))
  for (const id of touched) {
    const p = ix.patternById.get(id)
    if (!p || R2.fixedPatterns.has(id)) continue
    const ok = p.variants.filter(v => variantProblem(ix, R2, id, v.id) === undefined).map(v => v.id)
    if (!ok.length) continue
    const slot = p.generator?.slot
    R2.patterns.set(id, { signature: slot === 'extra' ? [] : ok, extra: slot === 'signature' ? [] : ok })
  }
  return R2
}

/** JSON with the keys of every object sorted and undefined values left out: equal drafts give equal keys. */
function canonical(x: unknown): string {
  if (Array.isArray(x)) return `[${x.map(canonical).join(',')}]`
  if (x !== null && typeof x === 'object') {
    const entries = Object.entries(x as Record<string, unknown>).filter(([, v]) => v !== undefined).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`
  }
  return JSON.stringify(x)
}

/** The reach of a draft at a spice, in a mode. The class, the tier and the flavour must be chosen. */
export function reachOf(ix: Index, parts: DraftParts, spice: number, mode: Mode): Reach {
  if (parts.class === undefined || parts.tier === undefined || parts.flavour === undefined) {
    throw new Error('the reach of a draft needs its class, tier and flavour')
  }
  if (!plain(parts)) return build(ix, parts, spice, mode)
  // While the secondary roles are open, the roles change nothing the model offers (a role a pattern implies is then
  // checked by whether the card can hold it), so they are left out and the 54 combinations share their entries.
  const base: DraftParts = parts.roles.secondary === undefined ? { ...parts, roles: {} } : parts
  const key = `reach|${mode}|${spice}|${canonical(base)}`
  const known = ix.cache.get(key) as Reach | undefined
  if (known) return known
  const R = build(ix, base, spice, mode)
  ix.cache.set(key, R)
  if (ix.cache.size > KEEP) {
    const oldest = ix.cache.keys().next().value
    if (oldest !== undefined) ix.cache.delete(oldest)
  }
  return R
}

// ---------------------------------------------------------------- can it be met, set or avoided?

/**
 * Can the card be made to have the part a link names? A pattern's requires (G4), implies (G3) and strength and weakness
 * links (M2: "set like an implied part") are parts the pattern sets: a range may then be any range a delivery allows
 * (G11), and a resource any resource. A role's needs are met only by what the card can have on its own.
 */
export function canMeet(ix: Index, R: Reach, link: Link, ctx: MeetContext = {}): boolean {
  const now = matchLink(ix, R.parts, link)
  if (now === 'yes') return true
  if (now === 'no') return false
  const sets = ctx.use === 'implies' || ctx.use === 'requires' || ctx.use === 'strength'
  const { kind, cmp, id } = parseLink(link)
  if (SINGLE_KINDS.has(kind)) {
    const list = ix.data.refKinds[kind]?.vocab
    const dom = list ? R.single.get(list) : undefined
    return !!list && !!dom && hasAny(dom, v => cmpRank(ix, list, v, cmp, id))
  }
  const multi = MULTI_KINDS[kind]
  if (multi) {
    if (!(R.multi.get(multi)?.has(id) ?? false)) return false
    // K-d: a key-bound mobility trait comes only with an ability that implies it.
    const t = term(ix, 'mobility-traits', id)
    if (kind === 'mobility-trait' && t?.uses_key === true && ix.data.rules.defaults.key_traits_only_when_implied) {
      return (ctx.self?.block.implies.includes(link) ?? false) || R.impliedTraits.has(id)
    }
    return true
  }
  const W = R.weapon
  switch (kind) {
    case 'role':
      return canHoldRole(ix, R, id, ctx.self)
    case 'cost':
      // The cost band comes from the finished card (B3); no step sets it, so only the finished card can break it (G7).
      return true
    case 'damage':
      return W.damages.has(id)
    case 'weapon':
      return W.families.has(id)
    case 'mount':
      return W.mounts.has(id)
    case 'delivery':
      return W.deliveries.has(id)
    case 'weapon-trait':
      return W.traits.has(id)
    case 'hits':
      return W.hits.has(id)
    case 'range': {
      const fits = (r: string): boolean => cmpRank(ix, 'range-bands', r, cmp, id)
      if (sets) return hasAny(W.settableRanges, fits)
      return hasAny(W.ranges, fits) || hasAny(R.patternRanges, fits)
    }
    case 'target':
      return R.targets.has(id)
    case 'passengers': {
      const n = Number(id)
      if (cmp === '<=' || (cmp === null && n === 0)) return true
      if (n > R.maxSeats) return false
      // Seats come only from a pattern that implies or requires them (section 7).
      if (!ix.data.rules.defaults.passengers.only_from_patterns) return true
      return (ctx.self !== undefined && seatsBrought(ctx.self.block) > 0) || R.bringsSeats
    }
    case 'category':
      return R.categories.has(id) || (ctx.self !== undefined && categoryOf(ix, ctx.self.pattern) === id)
    case 'resource': {
      // Section 7: a card has a resource only when a pattern implies or requires one (rules.json defaults.resource).
      const t = term(ix, 'resources', id)
      return R.resources.has(id) || (sets && t !== undefined && !t.source_only)
    }
    case 'pattern': {
      if (ctx.self?.pattern === id) return ctx.use !== 'implies' // never the same pattern twice (A6, A8)
      if (R.fixedPatterns.has(id)) return true
      const pr = R.patterns.get(id)
      if (!pr) return false
      // A8 and G4: a pattern that a block implies or requires (or names in a strength) is added as an extra ability.
      if (sets) return pr.extra.length > 0
      return pr.signature.length > 0 || pr.extra.length > 0
    }
    default:
      return false // immune: and unit: never match a card (N1)
  }
}

/** Can the card be made not to have the part a link names (a pattern's excludes)? */
export function canAvoid(ix: Index, R: Reach, link: Link): boolean {
  const now = matchLink(ix, R.parts, link)
  if (now === 'yes') return false
  if (now === 'no') return true
  const { kind, cmp, id } = parseLink(link)
  if (SINGLE_KINDS.has(kind)) {
    const list = ix.data.refKinds[kind]?.vocab
    const dom = list ? R.single.get(list) : undefined
    return !list || !dom || hasAny(dom, v => !cmpRank(ix, list, v, cmp, id))
  }
  if (kind === 'target') return hasAny(R.targets, t => t !== id)
  return true // lists, weapons, patterns, roles, seats and resources can be left off
}

/**
 * G13 and the word list's requires: can the card hold the role? Its classes, every requires group, and its role fit
 * (rules.json role_fit): one of the patterns, any of the links, or all of them. `self` is a pattern being checked that
 * would be on the card (a pattern that implies the role, or names it in a strength).
 */
export function canHoldRole(ix: Index, R: Reach, role: string, self?: Self): boolean {
  return roleProblem(ix, R, role, self) === undefined
}

/** Why the card cannot hold the role (the first need that fails), or undefined when it can. */
export function roleProblem(ix: Index, R: Reach, role: string, self?: Self): string | undefined {
  const t = term(ix, 'roles', role)
  if (!t || t.source_only) return 'not a role a card can use'
  if (R.parts.class !== undefined && t.classes && !t.classes.includes(R.parts.class)) return `not for class ${R.parts.class} (word list)`
  const ctx: MeetContext = { self, use: 'role' }
  for (const g of t.requires ?? []) if (!g.some(l => canMeet(ix, R, l, ctx))) return `needs one of ${g.join(', ')} (word list requires)`
  const fit = ix.data.rules.role_fit[role]
  if (fit?.patterns && !fit.patterns.some(p => canMeet(ix, R, `pattern:${p}`, ctx))) return `needs one of the patterns ${fit.patterns.join(', ')} (G13)`
  if (fit?.any && !fit.any.some(l => canMeet(ix, R, l, ctx))) return `needs one of ${fit.any.join(', ')} (G13)`
  for (const l of fit?.all ?? []) if (!canMeet(ix, R, l, ctx)) return `needs ${l} (G13)`
  return undefined
}

/** The roles the card can hold (G14 rolls the primary role among them). */
export function holdableRoles(ix: Index, R: Reach): string[] {
  return termsOf(ix, 'roles').filter(t => canHoldRole(ix, R, t.id)).map(t => t.id)
}

/**
 * Why a pattern's variant cannot be offered on this card, or undefined when it can (A1, A3, A7, A8, G3 to G6, M2,
 * S1, S3, S5, S6, HC2 to HC4). Slots (signature or extra) are applied by the caller.
 */
export function variantProblem(ix: Index, R: Reach, patternId: string, variantId: string): string | undefined {
  const p = ix.patternById.get(patternId)
  if (!p || !usablePattern(p)) return 'not usable on a card: not written, merged, rejected or without a generator block'
  const v = p.variants.find(x => x.id === variantId)
  if (!v) return `no variant ${variantId}`
  const b = blockOf(p, variantId)
  const { class: cls, tier, flavour } = R.parts
  if (cls === undefined || tier === undefined) return 'class and tier not chosen'
  if (!b.classes.includes(cls)) return `not for class ${cls} (A1)`
  if (!tierAtLeast(ix, tier, b.min_tier)) return `starts at ${b.min_tier} (A1)`
  if (R.mode === 'gate') {
    const odds = patternOdds(ix, b, { class: cls, flavour, spice: R.spice })
    if (odds.aboveGate) return `${odds.rarity} for this card: above the spice gate (S1, S3, S5, G5)`
    if (v.min_spice > R.spice) return `the variant opens at spice ${v.min_spice} (S6)`
  }
  const hc = hardControlOf(ix, patternId, variantId)
  if (hc) {
    if (hc.escape === null) return 'hard control that states no escape (HC4)'
    const min = ix.data.rules.hard_control.classes[hc.class].min_tier
    if (!tierAtLeast(ix, tier, min)) return `${hc.class} only from ${min} (HC2, HC6)`
    if (!tierAtLeast(ix, tier, hc.min_tier)) return `its effect starts at ${hc.min_tier} (HC2)`
  }
  if (!kindsAtTier(ix, b, tier, hc).length) return 'no kind fits the tier (A3, HC3)'
  const self: Self = { pattern: patternId, block: b }
  for (const g of b.requires) if (!g.some(l => canMeet(ix, R, l, { self, use: 'requires' }))) return `cannot meet requires ${g.join('|')} (G4)`
  for (const l of b.implies) if (!canMeet(ix, R, l, { self, use: 'implies' })) return `cannot set implied ${l} (G3, A8, G5, G6)`
  for (const l of b.excludes) if (!canAvoid(ix, R, l)) return `cannot avoid ${l}`
  for (const s of [...b.adds_strengths, ...b.adds_weaknesses]) if (!canMeet(ix, R, s.ref, { self, use: 'strength' })) return `cannot set ${s.ref} (M2)`
  const placed = abilitiesOf(R.parts).filter(a => a.pattern !== undefined).map(a => ({ pattern: a.pattern as string, variant: a.variant }))
  return mayJoin(ix, placed, patternId, variantId)
}

