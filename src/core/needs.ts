// Needs: what the finished card must have (or must not have), passed on from the step that learns it to the steps that
// own the parts: a role's requires and fit (G2, G13), a pattern's implies (G3), requires (G4), excludes (A7) and its
// strength and weakness links (M2, "set like an implied part").
//
// Every step offers only values that leave each need possible (needProblem; a quick check per link, and a joint check
// per field for needs that name the same part), and a step meets a need itself when it is the need's last owner still
// to run (lastChance). A step that is not written yet never counts as run, so its needs wait for it.
import { blockOf, cmpRank, term, termsOf, type Block, type Index } from './data.ts'
import { abilitiesOf } from './keys.ts'
import { anyOf, matchLink, parseLink, targetOf, type Tri } from './links.ts'
import { offerTerms, onOwnRolls, termProblem, UNIT_PARTS, type Mode } from './offer.ts'
import { seatsBrought } from './patterns.ts'
import { weaponOptions, type WeaponReach } from './reach.ts'
import type { Draft, DraftParts, Link, Need, Pattern } from './types.ts'

/** The roll steps (rules.json roll_order ids) that set the parts a link kind names: section 2's table. */
export const OWNERS: Readonly<Record<string, readonly string[]>> = {
  class: ['class'],
  tier: ['tier-and-flavour'],
  role: ['primary-role', 'secondary-roles'],
  pattern: ['signature', 'extra-abilities'],
  category: ['signature', 'extra-abilities'],
  mobility: ['mobility'],
  handling: ['mobility'],
  body: ['body'],
  size: ['size'],
  speed: ['speed'],
  target: ['mobility', 'size'],
  'mobility-trait': ['mobility-traits'],
  'armour-class': ['armour'],
  'armour-model': ['armour'],
  sight: ['sensors'],
  sensor: ['sensors'],
  crew: ['crew'],
  passengers: ['crew'],
  nature: ['crew'],
  availability: ['crew'],
  weapon: ['weapons'],
  damage: ['weapons'],
  delivery: ['weapons'],
  range: ['weapons'],
  mount: ['weapons'],
  'weapon-trait': ['weapons'],
  hits: ['weapons'],
  resource: ['on-death'],
  cost: ['matchups-balance-text'],
}

export function ownersOf(link: Link): readonly string[] {
  return OWNERS[parseLink(link).kind] ?? []
}

/** G3, G4, A7 and M2: the needs a chosen pattern's block passes on. */
export function needsOfBlock(block: Block, by: string, forced: boolean): Need[] {
  const out: Need[] = []
  for (const l of block.implies) out.push({ links: [l], by, rule: 'G3', forced })
  for (const g of block.requires) out.push({ links: g, by, rule: 'G4', forced })
  for (const l of block.excludes) out.push({ links: [l], by, rule: 'A7', forced, avoid: true })
  for (const r of [...block.adds_strengths, ...block.adds_weaknesses]) out.push({ links: [r.ref], by, rule: 'M2', forced })
  return out
}

/** One link of a need on the draft; a link read on the main weapon only (G13, assault) sees the primary weapon alone. */
function answer(ix: Index, parts: DraftParts, link: Link, onPrimary: boolean): Tri {
  if (!onPrimary || parseLink(link).kind !== 'range') return matchLink(ix, parts, link)
  const primary = parts.armament.primary
  if (primary === undefined) return 'open'
  if (primary === null) return 'no'
  return matchLink(ix, { ...parts, armament: { primary, secondary: null, conditional: [] } }, link)
}

/** Does the draft meet the need: 'yes', 'no', or 'open' while the parts that decide it are not chosen? */
export function needAnswer(ix: Index, parts: DraftParts, need: Need): Tri {
  const answers = need.links.map(l => answer(ix, parts, l, need.onPrimary === true))
  if (!need.avoid) return anyOf(answers)
  if (answers.some(a => a === 'yes')) return 'no'
  return answers.every(a => a === 'no') ? 'yes' : 'open'
}

/**
 * Values worked out for one draft, shared by the checks of one candidate. A candidate's memo may lean on the memo of
 * the draft before the candidate (parent): for a list the candidate's part cannot change, the parent's values are the
 * same, so they are worked out once for all candidates.
 */
export interface Memo {
  values: Map<string, string[]>
  weapons: Map<Mode, WeaponReach>
  parent?: Memo
  affected?: ReadonlySet<string>
}
export const newMemo = (): Memo => ({ values: new Map(), weapons: new Map() })

/** The memo of a draft with one more part of `list`, leaning on the memo of the draft before it. */
export function memoAfter(ix: Index, base: Memo, list: string): Memo {
  return { values: new Map(), weapons: new Map(), parent: base, affected: affectedBy(ix, list) }
}

/** The memo that holds a list's values: the parent's when this memo's part cannot change that list (any of `lists`). */
function holder(memo: Memo, ...lists: string[]): Memo {
  const affected = memo.affected
  return memo.parent && affected && !lists.some(l => affected.has(l)) ? holder(memo.parent, ...lists) : memo
}

/**
 * The lists whose possible values can change when a part of `list` is chosen: lists whose terms have maps keyed by it,
 * the lists its terms' maps name (G1 reads maps both ways), the parts worked out from it (handling from the mobility,
 * nature from the body and crew), and the weapons (their targets follow the mobility and size, their mounts the body).
 */
export function affectedBy(ix: Index, list: string): ReadonlySet<string> {
  const key = `affected|${list}`
  const known = ix.derived.get(key) as ReadonlySet<string> | undefined
  if (known) return known
  const out = new Set<string>([list])
  if (list === 'classes' || list === 'tiers') {
    for (const id of ix.lists.keys()) out.add(id)
    out.add('weapons')
  }
  for (const [other, terms] of ix.lists) {
    for (const t of terms) {
      if (t.allowed?.[list] || t.excluded?.[list]) out.add(other)
      if (other === list) for (const k of [...Object.keys(t.allowed ?? {}), ...Object.keys(t.excluded ?? {})]) out.add(k)
    }
  }
  if (list === 'mobility') out.add('handling')
  if (list === 'bodies' || list === 'crew-models') out.add('nature')
  // The weapons: their mounts follow the body (its allowed aim models); whether the unit flies (a dropped weapon needs
  // a flier) follows the mobility and the size; any map between this list and a weapon part changes them all.
  for (const x of [...out]) if (isWeaponPart(x)) out.add(x === 'aim-models' ? 'weapon-mounts' : 'weapons')
  if (list === 'bodies') out.add('weapon-mounts')
  if (list === 'mobility' || list === 'sizes') out.add('weapons')
  ix.derived.set(key, out)
  return out
}

const WEAPON_KINDS = new Set(['weapon', 'damage', 'delivery', 'range', 'mount', 'weapon-trait', 'hits'])
const isWeaponPart = (list: string): boolean => ['weapon-families', 'aim-models', 'damage-types', 'weapon-delivery', 'target-types', 'range-bands', 'weapon-traits'].includes(list)

/** The lists whose values decide whether a link can still hold ('weapons' and 'weapon-mounts' stand for the weapons). */
export function linkLists(ix: Index, link: Link): string[] {
  const { kind } = parseLink(link)
  if (kind === 'mount') return ['weapon-mounts', 'weapons']
  if (WEAPON_KINDS.has(kind)) return ['weapons']
  if (kind === 'handling') return ['handling', 'mobility']
  if (kind === 'nature') return ['nature', 'bodies', 'crew-models', 'classes']
  if (kind === 'passengers') return ['sizes', 'crew-models']
  if (kind === 'target') return ['mobility', 'sizes']
  const list = ix.data.refKinds[kind]?.vocab
  return list ? [list] : []
}

/** The needs a new part of `list` can change: those with a link on a list it affects. */
export function needsAfter(ix: Index, needs: readonly Need[], list: string): Need[] {
  const affected = affectedBy(ix, list)
  return needs.filter(n => n.links.some(l => linkLists(ix, l).some(x => affected.has(x))))
}

/** Section 7: the natures the draft can still have (the first entry whose when link it meets and whose nature the word
 *  lists allow; an entry whose link is still open may or may not be reached). */
function naturesLeft(ix: Index, parts: DraftParts): string[] {
  const out: string[] = []
  for (const e of ix.data.rules.defaults.nature) {
    if (termProblem(ix, parts, 'nature', e.nature) !== undefined) continue
    const a = e.when ? matchLink(ix, parts, e.when) : 'yes'
    if (a === 'no') continue
    if (!out.includes(e.nature)) out.push(e.nature)
    if (a === 'yes') break
  }
  return out
}

/** The values a single-valued part can still take on this draft (from the chosen parts alone). */
export function valuesLeft(ix: Index, parts: DraftParts, spice: number, list: string, mode: Mode, given: Memo): string[] {
  const memo = holder(given, list)
  const key = `${mode}|${list}`
  const known = memo.values.get(key)
  if (known) return known
  const chosen = UNIT_PARTS[list]?.(parts)[0]
  let out: string[]
  if (typeof chosen === 'string') out = [chosen]
  else if (list === 'handling') {
    // G10: handling is always the mobility's default_handling.
    out = [...new Set(valuesLeft(ix, parts, spice, 'mobility', mode, memo).map(m => term(ix, 'mobility', m)?.default_handling).filter((h): h is string => !!h))]
  } else if (list === 'nature') out = naturesLeft(ix, parts)
  else if (list === 'availability') {
    const counts = ix.data.rules.counts.availability
    out = termsOf(ix, list).map(t => t.id).filter(id => {
      const a = counts[id]
      if (!a || a.weight <= 0) return false
      if (mode === 'gate' && spice < (a.min_spice ?? 1)) return false
      return termProblem(ix, parts, list, id) === undefined
    })
  } else if (list === 'sight-bands') {
    const w = ix.data.rules.counts.sight
    out = termsOf(ix, list).map(t => t.id).filter(id => (w[id] ?? 0) > 0 && termProblem(ix, parts, list, id) === undefined)
  } else out = offerTerms(ix, parts, spice, list).candidates.filter(c => mode === 'forced' || onOwnRolls(c)).map(c => c.id)
  memo.values.set(key, out)
  return out
}

function weaponsLeft(ix: Index, parts: DraftParts, spice: number, mode: Mode, given: Memo): WeaponReach {
  const memo = holder(given, 'weapons', 'weapon-mounts')
  const known = memo.weapons.get(mode)
  if (known) return known
  const w = weaponOptions(ix, parts, spice, mode)
  memo.weapons.set(mode, w)
  return w
}

/** The most passenger seats the draft's size can still allow (rules.json defaults.passengers.caps). */
function seatsLeft(ix: Index, parts: DraftParts, spice: number, mode: Mode, memo: Memo): number {
  const caps = ix.data.rules.defaults.passengers.caps
  return Math.max(0, ...valuesLeft(ix, parts, spice, 'sizes', mode, memo).map(s => caps[s] ?? 0))
}

/** Is an open link still possible on this draft? A quick check from the chosen parts, one link at a time. */
export function stillPossible(ix: Index, parts: DraftParts, spice: number, link: Link, mode: Mode, setByPattern: boolean, memo: Memo): boolean {
  const { kind, cmp, id } = parseLink(link)
  const list = ix.data.refKinds[kind]?.vocab ?? undefined
  switch (kind) {
    case 'availability': case 'armour-class': case 'mobility': case 'handling': case 'body': case 'size':
    case 'speed': case 'crew': case 'sight': case 'nature':
      return !!list && valuesLeft(ix, parts, spice, list, mode, memo).some(v => cmpRank(ix, list, v, cmp, id))
    case 'armour-model': case 'mobility-trait': case 'sensor': {
      if (!list) return false
      const c = offerTerms(ix, parts, spice, list, { only: [id] }).candidates[0]
      return !!c && (mode === 'forced' || onOwnRolls(c))
    }
    case 'passengers': {
      const n = Number(id)
      if (cmp === '<=' || n === 0) return true
      // Seats come only from a pattern that brings them (section 7). The abilities that can bring them are chosen at
      // step 4 (the signature and the extras it needs), before the crew step sets the seats; after that, a pattern
      // on the card must bring them.
      const brought = abilitiesOf(parts).some(a => a.pattern !== undefined && seatsBrought(blockOf(ix.patternById.get(a.pattern) as Pattern, a.variant ?? null)) > 0)
      return (parts.signature === undefined || brought) && seatsLeft(ix, parts, spice, mode, memo) >= n
    }
    case 'target': {
      const sizes = valuesLeft(ix, parts, spice, 'sizes', mode, memo)
      return valuesLeft(ix, parts, spice, 'mobility', mode, memo).some(m => sizes.some(s => targetOf(ix, m, s) === id))
    }
    case 'weapon': return weaponsLeft(ix, parts, spice, mode, memo).families.has(id)
    case 'damage': return weaponsLeft(ix, parts, spice, mode, memo).damages.has(id)
    case 'delivery': return weaponsLeft(ix, parts, spice, mode, memo).deliveries.has(id)
    case 'mount': return weaponsLeft(ix, parts, spice, mode, memo).mounts.has(id)
    case 'weapon-trait': return weaponsLeft(ix, parts, spice, mode, memo).traits.has(id)
    case 'hits': return weaponsLeft(ix, parts, spice, mode, memo).hits.has(id)
    case 'range': {
      const W = weaponsLeft(ix, parts, spice, mode, memo)
      // G11: a range a pattern implies or requires replaces the family's default, so any range a delivery allows.
      const pool = setByPattern ? W.settableRanges : W.ranges
      for (const r of pool) if (cmpRank(ix, 'range-bands', r, cmp, id)) return true
      return false
    }
    case 'resource': return !!term(ix, 'resources', id)
    // Patterns, categories and roles can still come with a later ability or as a secondary role; the cost band from
    // the finished card (only the finished card can break it, G7). class: and tier: are always chosen by now.
    case 'pattern': case 'category': case 'role': case 'cost':
      return true
    default:
      return false // immune: and unit: never match a card (N1)
  }
}

/** Can an open link still be avoided (a pattern's excludes)? */
function stillAvoidable(ix: Index, parts: DraftParts, spice: number, link: Link, mode: Mode, memo: Memo): boolean {
  const { kind, cmp, id } = parseLink(link)
  const list = ix.data.refKinds[kind]?.vocab ?? undefined
  if (list && ['availability', 'armour-class', 'mobility', 'handling', 'body', 'size', 'speed', 'crew', 'sight', 'nature'].includes(kind)) {
    return valuesLeft(ix, parts, spice, list, mode, memo).some(v => !cmpRank(ix, list, v, cmp, id))
  }
  return true
}

/** The mode a need is checked in: an input's or a lock's need may use parts above the spice gate (G5). */
export function needMode(ix: Index, need: Need): Mode {
  return need.forced && ix.data.rules.defaults.spice_fallback === 'least-rare' ? 'forced' : 'gate'
}

/** Why the need can no longer hold on this draft, or undefined while it can. */
export function needProblem(ix: Index, parts: DraftParts, spice: number, need: Need, memo: Memo = newMemo()): string | undefined {
  const a = needAnswer(ix, parts, need)
  if (a === 'yes') return undefined
  const what = `${need.by} ${need.avoid ? 'excludes' : 'needs'} ${need.links.join(' or ')} (${need.rule})`
  if (a === 'no') return what
  const mode = needMode(ix, need)
  const setByPattern = need.rule === 'G3' || need.rule === 'G4' || need.rule === 'M2'
  const open = need.links.filter(l => answer(ix, parts, l, need.onPrimary === true) === 'open')
  const ok = need.avoid
    ? open.every(l => stillAvoidable(ix, parts, spice, l, mode, memo))
    : open.some(l => stillPossible(ix, parts, spice, l, mode, setByPattern, memo))
  return ok ? undefined : `${what}: no longer possible`
}

/** The single-valued parts whose needs are checked together (two needs on one part must share a value). */
const JOINT: Readonly<Record<string, string>> = {
  mobility: 'mobility', handling: 'handling', body: 'bodies', size: 'sizes', speed: 'speed-bands',
  'armour-class': 'armour-classes', crew: 'crew-models', sight: 'sight-bands', nature: 'nature', availability: 'availability',
}

/**
 * Needs that name the same single-valued part must be met by one value: is there one for each part still open? Also
 * the passenger seats: one number of seats must meet every passengers: need (an excludes passengers:>=1 and a
 * transport's passengers:>=2 never meet).
 */
export function jointProblem(ix: Index, parts: DraftParts, spice: number, needs: readonly Need[], memo: Memo = newMemo()): string | undefined {
  const byKind = new Map<string, Need[]>()
  for (const n of needs) {
    if (needAnswer(ix, parts, n) === 'yes') continue
    const kinds = new Set(n.links.map(l => parseLink(l).kind))
    if (kinds.size !== 1) continue
    const kind = [...kinds][0] as string
    if (JOINT[kind] === undefined && kind !== 'passengers') continue
    byKind.set(kind, [...(byKind.get(kind) ?? []), n])
  }
  for (const [kind, list] of byKind) {
    if (list.length < 2) continue // one need alone is checked by needProblem
    const mode: Mode = list.some(n => needMode(ix, n) === 'forced') ? 'forced' : 'gate'
    const holds = (n: Need, test: (link: Link) => boolean): boolean => (n.avoid ? !n.links.some(test) : n.links.some(test))
    if (kind === 'passengers') {
      if (parts.crew.passengers !== undefined) continue
      const top = seatsLeft(ix, parts, spice, mode, memo)
      const fits = (seats: number): boolean => list.every(n => holds(n, l => {
        const { cmp, id } = parseLink(l)
        const want = Number(id)
        return cmp === '>=' ? seats >= want : cmp === '<=' ? seats <= want : seats === want
      }))
      let any = false
      for (let s = 0; s <= top && !any; s++) any = fits(s)
      if (!any) return `no number of passenger seats meets ${list.map(n => n.by).join(' and ')}`
      continue
    }
    const field = JOINT[kind] as string
    if (typeof UNIT_PARTS[field]?.(parts)[0] === 'string') continue // chosen: each need is answered yes or no
    const values = valuesLeft(ix, parts, spice, field, mode, memo)
    const fits = values.some(v => list.every(n => holds(n, l => cmpRank(ix, field, v, parseLink(l).cmp, parseLink(l).id))))
    if (!fits) return `no ${kind} meets ${list.map(n => `${n.by} (${n.rule})`).join(' and ')}`
  }
  return undefined
}

/** Is this step the need's last owner still to run (every other owner has run)? Then the step must meet it. */
export function lastChance(d: Draft, need: Need, step: string): boolean {
  const owners = new Set(need.links.flatMap(l => [...ownersOf(l)]))
  if (!owners.has(step)) return false
  for (const o of owners) if (o !== step && !d.done.includes(o)) return false
  return true
}

/** Every need the draft must still meet, and none it has broken: the first broken one, or undefined. */
export function allNeedsProblem(ix: Index, parts: DraftParts, spice: number, needs: readonly Need[], memo: Memo = newMemo()): string | undefined {
  for (const n of needs) {
    const why = needProblem(ix, parts, spice, n, memo)
    if (why) return why
  }
  return jointProblem(ix, parts, spice, needs, memo)
}
