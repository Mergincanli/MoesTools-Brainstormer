// Step 13: the weapons (section 7, A5, A6, A10, G11, G12, C1, HC1).
//
// In this order: whether there is a secondary weapon (it takes its key before the extras, A6: always with a gunner
// seat, when a pattern needs its adaptive weapon as the secondary one (A10), otherwise 1 in one_in if the budgets have
// a key left); the adaptive weapon's place (A10) and its 2 to 4 conditional weapons with their when links; whether the
// card is unarmed (section 7: primary role and signature category from the data's lists, 1 in one_in, never when a need
// asks for the weapon); then each weapon in turn, the primary first (weapons.ts). Seats (A5): the primary weapon sits
// on the seat rules.json primary_weapon_seat gives the solo fallback (the driver for a single-seat crew), the
// secondary on the gunner seat when the crew has one, a conditional weapon on its adaptive weapon's seat.
import { categoryOf, type Index } from './data.ts'
import { diceFor } from './dice.ts'
import { applyStepLocks, lockWaits } from './draft.ts'
import { abilitiesOf, budgetOf, crewSeats, seatPlan } from './keys.ts'
import { matchLink, parseLink } from './links.ts'
import { drawKeeping, lockProblem } from './locks.ts'
import { allNeedsProblem, needAnswer, ownersOf } from './needs.ts'
import { offerTerms, poolOf } from './offer.ts'
import { fail, ok } from './parts.ts'
import { blockFor } from './patterns.ts'
import { itemChoices, itemForNeed, type Option, type Reaches } from './abilities.ts'
import { reachesFor } from './step-signature.ts'
import type { StepResult } from './steps.ts'
import type { ConditionalDraft, Draft, DraftParts, Link, Need, WeaponDraft } from './types.ts'
import { ADAPTIVE, rollWeapon, weaponProblem, weaponsCanMeet, type WeaponSpec } from './weapons.ts'

/** A10: the pattern that implies an adaptive weapon, and its place: the secondary when the pattern's requires names
 *  another family for the card (rules.json adaptive.slot_when_family_required), else the primary. */
export function adaptiveOf(ix: Index, parts: DraftParts): { slot: 'primary' | 'secondary'; pattern: string } | undefined {
  const rule = ix.data.rules.defaults.adaptive
  for (const a of abilitiesOf(parts)) {
    if (a.pattern === undefined) continue
    const b = blockFor(ix, a.pattern, a.variant ?? null)
    if (!b.implies.includes(`weapon:${ADAPTIVE}`)) continue
    const family = b.requires.some(g => g.some(l => parseLink(l).kind === 'weapon' && parseLink(l).id !== ADAPTIVE))
    return { slot: family ? rule.slot_when_family_required : rule.slot, pattern: a.pattern }
  }
  return undefined
}

/** Section 7: why this card may not be unarmed (the primary role and the signature's category the data names). */
export function unarmedProblem(ix: Index, parts: DraftParts): string | undefined {
  const rule = ix.data.rules.defaults.unarmed
  const role = parts.roles.primary
  const cat = parts.signature?.pattern !== undefined ? categoryOf(ix, parts.signature.pattern) : undefined
  if (role === undefined || !rule.primary_roles.includes(role)) return `an unarmed card needs one of the primary roles ${rule.primary_roles.join(', ')} (section 7)`
  if (cat === undefined || !rule.signature_categories.includes(cat)) return `an unarmed card needs a signature of category ${rule.signature_categories.join(', ')} (section 7)`
  return undefined
}

const WEAPON_KINDS = new Set(['weapon', 'damage', 'delivery', 'range', 'mount', 'weapon-trait', 'hits'])

/**
 * The open needs whose links name weapon parts and other parts that no later step can set any more: a pattern or a
 * category no extra ability can bring (none the reach offers as an extra joins the card), each with its weapon links
 * only. A role link stays with step 16, which adds a role the finished card holds.
 */
function weaponsMustMeet(ix: Index, d: Draft): Need[] {
  const out: Need[] = []
  let rs: Reaches | undefined
  // Could an extra ability meet these pattern and category links: one at the spice gate (G5: above it only when nothing
  // at the gate fits, and the weapons may fit) that passes the draft's checks (abilities.ts) and asks nothing of the
  // weapons, which are set before step 14 places it?
  const open = (l: Link): boolean => WEAPON_KINDS.has(parseLink(l).kind) && matchLink(ix, d.parts, l) !== 'yes'
  const asksWeapons = (o: Option): boolean =>
    o.block.implies.some(open) || o.block.requires.some(g => g.every(open)) || [...o.block.adds_strengths, ...o.block.adds_weaknesses].some(r => open(r.ref))
  const extraCan = (n: Need, links: Link[]): boolean => {
    rs ??= reachesFor(ix, d)
    const item = itemForNeed(ix, d, rs, { ...n, links, forced: false })
    if (typeof item === 'string') return false
    const options = item.options.filter(o => !asksWeapons(o))
    return options.length > 0 && itemChoices(ix, d, rs, { ...item, options }).length > 0
  }
  for (const n of d.needs) {
    if (n.avoid || needAnswer(ix, d.parts, n) === 'yes') continue
    const weapon = n.links.filter(l => WEAPON_KINDS.has(parseLink(l).kind))
    if (!weapon.length || weapon.length === n.links.length) continue
    const other = n.links.filter(l => !weapon.includes(l) && matchLink(ix, d.parts, l) === 'open')
    const byAbility = other.filter(l => ['pattern', 'category'].includes(parseLink(l).kind))
    const later = other.some(l => {
      const kind = parseLink(l).kind
      if (kind === 'role' || kind === 'resource' || kind === 'cost') return true
      return !byAbility.includes(l) && ownersOf(l).some(o => !d.done.includes(o) && o !== 'weapons')
    }) || (byAbility.length > 0 && extraCan(n, byAbility))
    if (!later) out.push({ ...n, links: weapon })
  }
  return out
}

/** A5: the seat of the primary weapon: the one rules.json primary_weapon_seat gives the crew's solo fallback, when the
 *  crew has that seat; the driver otherwise. */
export function primarySeat(ix: Index, parts: DraftParts): string {
  const fallback = parts.crew.solo_fallback
  const seat = typeof fallback === 'string' ? ix.data.rules.defaults.primary_weapon_seat[fallback] : undefined
  return seat !== undefined && crewSeats(ix, parts).includes(seat) ? seat : 'driver'
}

/** The first part of the step: is there a secondary weapon? ({} on the draft until its parts are rolled.) */
function secondaryPresence(ix: Index, d: Draft): StepResult {
  const a = d.parts.armament
  if (lockWaits(d, 'secondary', 'weapons.secondary')) {
    // A locked secondary weapon is set in its turn (after the primary); its place is kept from the start.
    d.parts = { ...d.parts, armament: { ...a, secondary: d.locked.secondary ? {} : null } }
    d.trace.push({ field: 'armament.secondary', value: d.locked.secondary ? 'yes' : 'none', how: 'locked', rule: 'I1', candidates: 0 })
    return ok
  }
  if (a.secondary !== undefined) {
    const why = budgetOf(ix, d.parts) ?? (a.secondary ? weaponProblem(ix, d.parts, a.secondary) : undefined)
    if (why) return fail(`the locked secondary weapon does not fit: ${why}`)
    d.trace.push({ field: 'armament.secondary', value: a.secondary === null ? 'none' : 'yes', how: 'locked', rule: 'I1', candidates: 0 })
    return ok
  }
  const rule = ix.data.rules.defaults.secondary_weapon
  const roll = diceFor(d.seed, 'armament.secondary', d.attempt).below(rule.one_in) // drawn every time, whatever decides
  const withIt = { ...d.parts, armament: { ...a, secondary: {} } }
  const room = budgetOf(ix, withIt) === undefined
  const gunner = crewSeats(ix, d.parts).includes(rule.always_with)
  const adaptive = adaptiveOf(ix, d.parts)
  // The needs only weapons meet may ask for two weapons (no one family meets them all): then a second one is set (G5).
  const twoNeeded = !adaptive && !weaponsCanMeet(ix, d, { ...d.parts, armament: { ...a, secondary: null, conditional: [] } }, 1)
  const forcedBy = gunner ? `crew:${d.parts.crew.model}` : adaptive?.slot === 'secondary' ? `pattern:${adaptive.pattern}` : twoNeeded ? 'the needs on weapon parts (no one weapon meets them all)' : undefined
  // A secondary weapon the waiting locks leave no key for is drawn again: there is none (locks.ts).
  const clash = forcedBy === undefined && room && roll === 0 ? lockProblem(ix, d, withIt) : undefined
  const has = forcedBy !== undefined || (room && roll === 0 && !clash)
  if (has && !room) return fail(`the secondary weapon ${forcedBy} needs takes a key the budgets do not have (K-a, K-c)`)
  d.parts = has ? withIt : { ...d.parts, armament: { ...a, secondary: null } }
  d.trace.push({
    field: 'armament.secondary',
    value: has ? 'yes' : 'none',
    how: forcedBy ? 'needed' : 'rolled',
    ...(forcedBy ? { by: forcedBy } : {}),
    rule: forcedBy ? (gunner ? 'section 7 (always with a gunner seat)' : twoNeeded ? 'G3, G4, G5' : 'A10') : `section 7 (1 in ${rule.one_in} if a key is left), A6`,
    candidates: rule.one_in,
    draw: roll,
    ...(!room && !forcedBy ? { note: 'no key left for it' } : clash ? { note: `the locks rule it out: ${clash}` } : {}),
  })
  return ok
}

/** A10: the conditional weapons of an adaptive weapon: 2 to 4 (counts.conditional_weapons), each with its own when
 *  link of the kind rules.json adaptive.when_links gives the pattern (a passenger's role, or a victim's family). */
function conditionalSlots(ix: Index, d: Draft, pattern: string): ConditionalDraft[] | string {
  const kind = ix.data.rules.defaults.adaptive.when_links[pattern]
  if (kind !== 'role' && kind !== 'weapon') return `rules.json adaptive.when_links names no link for ${pattern}`
  const count = diceFor(d.seed, 'armament.conditional', d.attempt).pick(ix.data.rules.counts.conditional_weapons).index
  const dice = diceFor(d.seed, 'armament.conditional.when', d.attempt)
  const out: ConditionalDraft[] = []
  const used: string[] = []
  for (let i = 0; i < count; i++) {
    // A passenger may have any role; a victim's family is one this card could hold, by the families' odds.
    const pool = kind === 'role'
      ? { items: [...(ix.terms.get('roles')?.values() ?? [])].filter(t => !t.source_only && !used.includes(t.id)).map(t => ({ id: t.id, weight: 1 })) }
      : poolOf(ix, offerTerms(ix, d.parts, d.spice, 'weapon-families', { weapon: {}, except: [...used, ADAPTIVE] }).candidates, 'gate', d.spice)
    const got = drawKeeping(ix, d, dice, pool, () => undefined)
    if (!got) break
    used.push(got.id)
    out.push({ when: `${kind}:${got.id}`, weapon: {} })
  }
  return out.length >= 2 ? out : `${pattern} needs 2 to 4 conditional weapons, and only ${out.length} ${kind} links fit (A10)`
}

export function stepWeapons(ix: Index, d: Draft): StepResult {
  const sec = secondaryPresence(ix, d)
  if (!sec.ok) return sec
  const adaptive = adaptiveOf(ix, d.parts)
  let a = d.parts.armament
  // The conditional weapons (A10), placed before the primary so that the draft knows every weapon slot it will have.
  if (lockWaits(d, 'conditional', 'weapons.conditional')) {
    // Locked conditional weapons are set in their turn; their places and when links are kept from the start.
    const locked = d.locked.conditional ?? []
    d.parts = { ...d.parts, armament: { ...a, conditional: locked.map(c => ({ ...(c.when !== undefined ? { when: c.when } : {}), weapon: {} })) } }
    d.trace.push({ field: 'armament.conditional', value: locked.map(c => c.when), how: 'locked', rule: 'I1', candidates: 0 })
    if (adaptive && locked.length < 2) return fail(`the locked conditional weapons are ${locked.length}; ${adaptive.pattern}'s adaptive weapon needs 2 to 4 (A10)`)
    if (!adaptive && locked.length) return fail('locked conditional weapons need an adaptive weapon (A10)')
  } else if (a.conditional === undefined) {
    let conditional: ConditionalDraft[] = []
    if (adaptive) {
      const slots = conditionalSlots(ix, d, adaptive.pattern)
      if (typeof slots === 'string') return fail(slots)
      conditional = slots
      d.trace.push({ field: 'armament.conditional', value: slots.map(c => c.when), how: 'needed', by: `pattern:${adaptive.pattern}`, rule: 'A10', candidates: ix.data.rules.counts.conditional_weapons.filter(w => w > 0).length })
    }
    d.parts = { ...d.parts, armament: { ...a, conditional } }
  } else {
    d.trace.push({ field: 'armament.conditional', value: a.conditional.map(c => c.when), how: 'locked', rule: 'I1', candidates: 0 })
    if (adaptive && a.conditional.length < 2) return fail(`the locked conditional weapons are ${a.conditional.length}; ${adaptive.pattern}'s adaptive weapon needs 2 to 4 (A10)`)
  }
  a = d.parts.armament
  // Unarmed (section 7): only for the data's primary roles and signature categories, 1 in one_in, never with an
  // adaptive primary, and never when a need asks for the weapon.
  if (a.primary === undefined) {
    const rule = ix.data.rules.defaults.unarmed
    const roll = diceFor(d.seed, 'armament.primary', d.attempt).below(rule.one_in) // drawn every time
    const may = unarmedProblem(ix, d.parts) === undefined && adaptive?.slot !== 'primary'
    const unarmed: DraftParts = { ...d.parts, armament: { ...a, primary: null } }
    const rest = (unarmed.armament.secondary ? 1 : 0) + (unarmed.armament.conditional ?? []).length
    const why = may && roll === 0
      ? allNeedsProblem(ix, unarmed, d.spice, d.needs) ?? (weaponsCanMeet(ix, d, unarmed, rest) ? undefined : 'the other weapons cannot meet the needs on weapon parts') ?? lockProblem(ix, d, unarmed)
      : undefined
    const none = may && roll === 0 && !why
    d.parts = none ? unarmed : { ...d.parts, armament: { ...a, primary: {} } }
    d.trace.push({
      field: 'armament.primary', value: none ? 'none' : 'yes', how: 'rolled', rule: `section 7 (unarmed: 1 in ${rule.one_in} for the roles and signature categories it names)`,
      candidates: may ? rule.one_in : 0, ...(may ? { draw: roll } : {}), ...(why ? { note: `armed: ${why}` } : {}),
    })
  } else {
    const why = a.primary !== null ? weaponProblem(ix, d.parts, a.primary) : unarmedProblem(ix, d.parts)
    if (why) return fail(`the locked primary weapon does not fit: ${why}`)
    d.trace.push({ field: 'armament.primary', value: a.primary === null ? 'none' : 'yes', how: 'locked', rule: 'I1', candidates: 0 })
  }
  for (const c of d.parts.armament.conditional ?? []) {
    if (c.weapon.family === undefined) continue
    const why = weaponProblem(ix, d.parts, c.weapon)
    if (why) return fail(`a locked conditional weapon does not fit: ${why}`)
  }
  // The weapons still to roll, in order; the last one meets what the needs still ask of traits and targets.
  const pSeat = primarySeat(ix, d.parts)
  const sSeat = seatPlan(ix, d.parts).secondary ?? 'driver'
  const specs: Array<Omit<WeaponSpec, 'last'>> = []
  if (d.parts.armament.primary && d.parts.armament.primary.family === undefined) {
    specs.push({
      path: 'armament.primary', seat: pSeat, get: p => p.armament.primary ?? {}, set: (p, w) => ({ ...p, armament: { ...p.armament, primary: w } }),
      ...(adaptive?.slot === 'primary' ? { family: ADAPTIVE, familyBy: `pattern:${adaptive.pattern}` } : {}),
    })
  }
  if (d.parts.armament.secondary && d.parts.armament.secondary.family === undefined) {
    specs.push({
      path: 'armament.secondary', seat: sSeat, get: p => p.armament.secondary ?? {}, set: (p, w) => ({ ...p, armament: { ...p.armament, secondary: w } }),
      ...(adaptive?.slot === 'secondary' ? { family: ADAPTIVE, familyBy: `pattern:${adaptive.pattern}` } : {}),
    })
  }
  const adaptiveSeat = adaptive?.slot === 'secondary' ? sSeat : pSeat
  ;(d.parts.armament.conditional ?? []).forEach((c, i) => {
    if (c.weapon.family !== undefined) return
    const victim = c.when !== undefined && parseLink(c.when).kind === 'weapon' ? parseLink(c.when).id : undefined
    specs.push({
      path: `armament.conditional.${i}`, seat: adaptiveSeat,
      get: p => p.armament.conditional?.[i]?.weapon ?? {},
      set: (p, w) => ({ ...p, armament: { ...p.armament, conditional: (p.armament.conditional ?? []).map((x, k) => (k === i ? { ...x, weapon: w } : x)) } }),
      ...(victim ? { family: victim, familyBy: `${c.when} (the victim's weapon, A10)` } : {}),
    })
  })
  // A need that names weapon parts and other parts, whose other parts no later step can still set, is the weapons'
  // to meet: while the weapons are rolled it stands with its weapon links only (G2, G4, G5: set, not rolled).
  const own = weaponsMustMeet(ix, d)
  const before = d.needs
  d.needs = [...before, ...own]
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i] as Omit<WeaponSpec, 'last'>
    // The locks of the secondary and the conditional weapons are set in their turn (draft.ts).
    if (spec.path === 'armament.secondary') applyStepLocks(d, 'weapons.secondary')
    if (spec.path.startsWith('armament.conditional')) applyStepLocks(d, 'weapons.conditional')
    const now = spec.get(d.parts)
    if (now.family !== undefined) {
      const why = weaponProblem(ix, d.parts, now)
      if (why) {
        d.needs = before
        return fail(`the locked ${spec.path} does not fit: ${why}`)
      }
      continue
    }
    const after = specs.slice(i + 1).filter(x => x.family === undefined).length
    const why = rollWeapon(ix, d, { ...spec, last: i === specs.length - 1, after: specs.slice(i + 1).some(x => x.family !== undefined) ? 99 : after })
    if (why) {
      d.needs = before
      return fail(why)
    }
  }
  d.needs = before
  applyStepLocks(d, 'weapons.secondary')
  applyStepLocks(d, 'weapons.conditional')
  // Seats of locked weapons follow the same rules (A5).
  const seat = (w: WeaponDraft | null | undefined, s: string): WeaponDraft | null | undefined => (w ? { ...w, seat: s } : w)
  const arm = d.parts.armament
  d.parts = {
    ...d.parts,
    armament: { primary: seat(arm.primary, pSeat), secondary: seat(arm.secondary, sSeat), conditional: (arm.conditional ?? []).map(c => ({ ...c, weapon: { ...c.weapon, seat: adaptiveSeat } })) },
  }
  const budget = budgetOf(ix, d.parts)
  if (budget) return fail(budget)
  const clash = lockProblem(ix, d, d.parts)
  return clash ? fail(clash) : ok
}
