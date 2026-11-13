// Step 17, the balance hints (section 10; every number is a starting value in rules.json points).
//
// Pattern points: power and complexity are the ranks of the pattern's risks.balance and risks.readability levels, cost
// is power divided by cost_divisor, rounded up; the stored generator.points win; an ultimate kind adds ultimate_bonus
// power, up to max. Part points come from points.parts. Power (B1) and complexity (B2) are kept between their min and
// max; the cost band (B3) is the band whose range holds the cost sum. Keys come from the one key count (keys.ts).
import { term, type Index } from './data.ts'
import { abilitiesOf, countKeys, crewSeats } from './keys.ts'
import type { AbilityDraft, DraftParts, WeaponDraft } from './types.ts'

export interface PatternPoints {
  power: number
  complexity: number
  cost: number
}

/** The points of one ability (section 10's pattern points). Reading (reported): the ultimate bonus raises power only;
 *  the cost stays the pattern's own. */
export function patternPoints(ix: Index, a: AbilityDraft): PatternPoints {
  const P = ix.data.rules.points.pattern
  const p = a.pattern !== undefined ? ix.patternById.get(a.pattern) : undefined
  if (!p) throw new Error(`no pattern ${a.pattern}`)
  const level = (path: string): number => {
    const v = path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), p)
    return typeof v === 'string' ? (P.scale[v] ?? 0) : 0
  }
  const stored = (p.generator as unknown as { points?: Partial<PatternPoints> } | undefined)?.points
  let power = P.stored_wins && stored?.power !== undefined ? stored.power : level(P.power)
  const complexity = P.stored_wins && stored?.complexity !== undefined ? stored.complexity : level(P.complexity)
  const divided = power / P.cost_divisor
  const cost = P.stored_wins && stored?.cost !== undefined ? stored.cost : P.cost_rounding === 'up' ? Math.ceil(divided) : Math.floor(divided)
  if (a.kind === 'ultimate') power = Math.min(P.max, power + P.ultimate_bonus)
  return { power, complexity, cost }
}

/** The weapons whose range counts as the card's best (its own weapons, conditional ones included). */
const weaponsOf = (p: DraftParts): WeaponDraft[] => [p.armament.primary, p.armament.secondary, ...(p.armament.conditional ?? []).map(c => c.weapon)].filter((w): w is WeaponDraft => !!w)

/** Section 10's part points: power, cost and complexity. */
export function partPoints(ix: Index, p: DraftParts): PatternPoints {
  const T = ix.data.rules.points.parts
  const out: PatternPoints = { power: 0, cost: 0, complexity: 0 }
  const add = (table: { power?: Record<string, number> | number; cost?: Record<string, number> | number; complexity?: Record<string, number> | number } | undefined, id: string | undefined | true): void => {
    if (!table || id === undefined) return
    for (const k of ['power', 'cost', 'complexity'] as const) {
      const t = table[k]
      if (t === undefined) continue
      out[k] += typeof t === 'number' ? (id === true ? t : 0) : typeof id === 'string' ? (t[id] ?? 0) : 0
    }
  }
  add(T.armour_class, p.armour.class)
  add(T.speed, p.mobility.speed)
  const ranges = weaponsOf(p).map(w => w.range).filter((r): r is string => typeof r === 'string')
  const best = ranges.sort((a, b) => (term(ix, 'range-bands', b)?.rank ?? 0) - (term(ix, 'range-bands', a)?.rank ?? 0))[0]
  add(T.best_weapon_range, best)
  add(T.size, p.body.size)
  if (p.armament.secondary) add(T.secondary_weapon, true)
  add(T.availability, p.availability)
  if ((p.crew.passengers?.seats ?? 0) > 0) add(T.passenger_seats, true)
  return out
}

export interface Balance {
  power: number
  complexity: number
  cost: number
  cost_band: string
  keys: number
}

const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n))

/** B1 to B3 and the keys (K-g) of a card's parts. */
export function balanceOf(ix: Index, p: DraftParts): Balance {
  const R = ix.data.rules.points
  const abilities = abilitiesOf(p).map(a => patternPoints(ix, a))
  const parts = partPoints(ix, p)
  const keys = countKeys(ix, p).keys
  const operating = crewSeats(ix, p).filter(s => s !== 'driver' && ix.data.rules.defaults.seats.operating.includes(s)).length
  const power = clamp(abilities.reduce((n, a) => n + a.power - R.power.ability_minus, 0) + parts.power, R.power.min, R.power.max)
  const C = R.complexity
  const extra = keys * C.per_key + operating * C.per_operating_seat + parts.complexity + (p.crew.model === 'squad' ? C.squad : 0) + ((p.modes ?? []).length ? C.second_form : 0)
  const complexity = clamp(abilities.reduce((n, a) => n + a.complexity - C.ability_minus, 0) + extra, C.min, C.max)
  const cost = abilities.reduce((n, a) => n + a.cost, 0) + parts.cost
  const band = Object.entries(R.cost_bands).find(([, b]) => cost >= b.min && (b.max === undefined || cost <= b.max))?.[0] ?? ''
  return { power, complexity, cost, cost_band: band, keys }
}

/** The warn flags a card carries (section 10): cost-outside-tier when its band is not among the tier's, off-flavour
 *  when it holds a part its flavour avoids. */
export function warnFlags(ix: Index, p: DraftParts, band: string): string[] {
  const out: string[] = []
  if (!(ix.data.rules.points.tier_bands[p.tier ?? ''] ?? []).includes(band)) out.push('cost-outside-tier')
  const avoided = (p.flavour !== undefined ? term(ix, 'faction-flavours', p.flavour)?.avoided : undefined) ?? {}
  const on = (list: string): string[] => {
    const ws = weaponsOf(p)
    switch (list) {
      case 'weapon-families': return ws.map(w => w.family ?? '')
      case 'damage-types': return ws.map(w => w.damage ?? '')
      case 'weapon-delivery': return ws.map(w => w.delivery ?? '')
      case 'aim-models': return ws.map(w => w.mount ?? '')
      case 'weapon-traits': return ws.flatMap(w => w.traits ?? [])
      case 'mobility': return [p.mobility.base ?? '']
      case 'mobility-traits': return p.mobility.traits ?? []
      case 'bodies': return [p.body.plan ?? '']
      case 'sizes': return [p.body.size ?? '']
      case 'armour-classes': return [p.armour.class ?? '']
      case 'armour-models': return p.armour.models ?? []
      case 'sensor-traits': return p.sensors.traits ?? []
      case 'crew-models': return [p.crew.model ?? '']
      case 'classes': return [p.class ?? '']
      case 'roles': return [p.roles.primary ?? '', ...(p.roles.secondary ?? [])]
      case 'patterns': return abilitiesOf(p).map(a => a.pattern ?? '')
      default: return []
    }
  }
  if (Object.entries(avoided).some(([list, ids]) => (ids as string[]).some(id => on(list).includes(id)))) out.push('off-flavour')
  return out
}
