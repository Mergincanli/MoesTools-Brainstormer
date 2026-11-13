// Step 17, the matchups: strengths and weaknesses (M1 to M4) and the counters (N1 to N4).
//
// Strengths and weaknesses come from the abilities' blocks, the signature's first (a variant's overrides replace the
// base lists, M1); every link is true on the card (M2, made so by the steps before). Within one ability its strengths
// pair with its weaknesses in order, and a strength past its last weakness pairs with that last one (M3). Countered by
// and counters: the abilities' links first, the signature's first, then the links from the card's parts in section 18's
// order (N4). Links no card can satisfy are dropped from countered by (N2); which links can be satisfied is worked out
// once per data version from the rules (N3). Each list keeps at most `max` entries (M4, rules.json matchup_lists).
import { blockFor } from './patterns.ts'
import { term, termsOf, usablePattern, type Index } from './data.ts'
import { abilitiesOf } from './keys.ts'
import { parseLink, targetOf } from './links.ts'
import { neverOnCardWeapon } from './patterns.ts'
import { maxSpice } from './odds.ts'
import { canHoldRole, canMeet, reachOf, variantProblem } from './reach.ts'
import type { DraftParts, Link, WeaponDraft } from './types.ts'

export interface MatchLine {
  ref: Link
  /** The reason as the data gives it (the pattern's why, or the sentence for a link from the parts); the text step
   *  checks it (T-b). */
  why: string
  /** Which list's neutral sentence stands in for the reason when it fails the text check. */
  list: 'strengths' | 'weaknesses' | 'counters' | 'countered_by'
}

export interface StrengthLine extends MatchLine {
  paired_with: number
}

export interface Matchups {
  strengths: StrengthLine[]
  weaknesses: MatchLine[]
  countered_by: MatchLine[]
  counters: MatchLine[]
}

const weaponsOn = (p: DraftParts): WeaponDraft[] => [p.armament.primary, p.armament.secondary, ...(p.armament.conditional ?? []).map(c => c.weapon)].filter((w): w is WeaponDraft => !!w)

/** N3: can some card the generator can roll satisfy this link, at any class, tier, flavour and spice? Worked out from
 *  the rules (the reach of every combination at the highest spice, least rare parts allowed), once per link. */
export function satisfiable(ix: Index, link: Link): boolean {
  const key = `satisfiable|${link}`
  const known = ix.derived.get(key) as boolean | undefined
  if (known !== undefined) return known
  const { kind, id } = parseLink(link)
  let out: boolean
  if (kind === 'immune' || kind === 'unit' || neverOnCardWeapon(ix, link)) out = false
  else if (kind === 'target' && id === 'structure') out = false // no card is a building (N1)
  else if (kind === 'cost' || kind === 'tier') out = true
  else if (kind === 'class') out = !!term(ix, 'classes', id) && !term(ix, 'classes', id)?.source_only
  else {
    out = false
    const spice = maxSpice(ix)
    for (const cls of termsOf(ix, 'classes').filter(t => !t.source_only)) {
      for (const tier of termsOf(ix, 'tiers').filter(t => !t.source_only)) {
        for (const flavour of termsOf(ix, 'faction-flavours').filter(t => !t.source_only)) {
          const R = reachOf(ix, { class: cls.id, tier: tier.id, flavour: flavour.id, roles: {}, mobility: {}, body: {}, armament: {}, armour: {}, sensors: {}, crew: {} }, spice, 'forced')
          if (kind === 'pattern') {
            const p = ix.patternById.get(id)
            out = !!p && usablePattern(p) && p.variants.some(v => variantProblem(ix, R, id, v.id) === undefined)
          } else if (kind === 'category') {
            out = ix.patterns.some(p => p.category === id && usablePattern(p) && p.variants.some(v => variantProblem(ix, R, p.id, v.id) === undefined))
          } else if (kind === 'role') out = canHoldRole(ix, R, id)
          else out = canMeet(ix, R, link)
          if (out) break
        }
        if (out) break
      }
      if (out) break
    }
  }
  ix.derived.set(key, out)
  return out
}

const rule = (ix: Index): { max: number } => ({ max: ix.data.rules.defaults.matchup_lists.max })

/** Keeps the first entry of each link (the signature's first), at most `max`. */
function capped<T extends MatchLine>(lines: readonly T[], max: number): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const l of lines) {
    if (seen.has(l.ref) || out.length >= max) continue
    seen.add(l.ref)
    out.push(l)
  }
  return out
}

/**
 * The card's four matchup lists, or why the card fails (a block flag: strength-without-weakness when a strength has no
 * weakness of its own ability on the card, M3; no-counter when no satisfiable countered-by link is left, N2), or an
 * empty counters list (the card schema needs one entry).
 */
export function matchupsOf(ix: Index, p: DraftParts): Matchups | { flag?: string; problem: string } {
  const { max } = rule(ix)
  const texts = ix.data.texts
  const strengths: StrengthLine[] = []
  const weaknesses: MatchLine[] = []
  const cb: MatchLine[] = []
  const counters: MatchLine[] = []
  for (const a of abilitiesOf(p)) {
    if (a.pattern === undefined) continue
    const b = blockFor(ix, a.pattern, a.variant ?? null)
    const own = b.adds_weaknesses.map(r => {
      weaknesses.push({ ref: r.ref, why: r.why, list: 'weaknesses' })
      return weaknesses.length - 1
    })
    b.adds_strengths.forEach((r, k) => {
      const pair = own[Math.min(k, own.length - 1)]
      if (pair === undefined) return
      strengths.push({ ref: r.ref, why: r.why, list: 'strengths', paired_with: pair })
    })
    if (b.adds_strengths.length && !own.length) return { flag: 'strength-without-weakness', problem: `${a.pattern} adds a strength and no weakness (M3)` }
    for (const r of b.countered_by) cb.push({ ref: r.ref, why: r.why, list: 'countered_by' })
    for (const r of b.counters) counters.push({ ref: r.ref, why: r.why, list: 'counters' })
  }
  // M4: at most max of each, signature first; a strength whose weakness falls past the cap has none (M3).
  const W = weaknesses.slice(0, max)
  const S = strengths.slice(0, max)
  if (S.some(s => s.paired_with >= W.length)) return { flag: 'strength-without-weakness', problem: 'a strength whose weakness is past the cap of the list (M3, M4)' }
  // N4: countered by, from the parts: damage types strong against the card (the word list's order), the link for
  // fliers, then the aircraft link for a card with no weapon that hits fliers.
  const dl = ix.data.rules.defaults.derived_links
  const reason = texts.derived_reasons
  const mine = [...dl.damage_vs.flatMap(kind => (kind === 'armour-class' ? [`armour-class:${p.armour.class}`] : kind === 'nature' ? [`nature:${p.nature}`] : (p.armour.models ?? []).map(m => `armour-model:${m}`)))]
  for (const dt of termsOf(ix, 'damage-types')) {
    if (dt.source_only || !(dt.strong_vs ?? []).some(l => mine.includes(l))) continue
    if (dl.drop_immune && (dt.immune ?? []).includes(`nature:${p.nature}`)) continue
    cb.push({ ref: `damage:${dt.id}`, why: reason.damage ?? '', list: 'countered_by' })
  }
  const target = targetOf(ix, p.mobility.base, p.body.size)
  const flier = target !== undefined ? dl.flier_hits[target] : undefined
  if (flier) cb.push({ ref: flier, why: reason.hits ?? '', list: 'countered_by' })
  const weapons = weaponsOn(p)
  if (!weapons.some(w => (w.can_target ?? []).some(t => Object.hasOwn(dl.flier_hits, t)))) cb.push({ ref: dl.no_air_weapon, why: reason.class ?? '', list: 'countered_by' })
  // N2: links no card can satisfy are dropped; at least one must be left.
  const countered = capped(cb.filter(l => satisfiable(ix, l.ref)), max)
  if (!countered.length) return { flag: 'no-counter', problem: 'no countered-by link some card can satisfy (N2)' }
  // Counters: the abilities' links, then for the primary weapon and the secondary what its damage type is strong
  // against, in the word list's order.
  if (dl.counters_from_damage) {
    for (const w of [p.armament.primary, p.armament.secondary]) {
      const dt = typeof w?.damage === 'string' ? term(ix, 'damage-types', w.damage) : undefined
      for (const l of dt?.strong_vs ?? []) counters.push({ ref: l, why: (reason as Record<string, string>)[parseLink(l).kind] ?? '', list: 'counters' })
    }
  }
  const beats = capped(counters.filter(l => parseLink(l.ref).kind !== 'unit'), max)
  if (!beats.length) return { problem: 'the card counters nothing (its abilities and weapons name no unit it beats)' }
  return { strengths: S, weaknesses: W, countered_by: countered, counters: beats }
}
