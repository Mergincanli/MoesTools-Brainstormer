// Roll steps 1 to 3 (rules.json roll_order: class, tier-and-flavour, primary-role).
//
// A step leaves a value the inputs or the locks set (I1) and checks that it fits; otherwise it rolls the value with
// the field's own dice among the values that fit everything already chosen. A role the user fixed is already chosen
// before step 1, so the class, the tier and the flavour are rolled only among those that can hold it (G5, G13).
import { termsOf, type Index } from './data.ts'
import { diceFor } from './dice.ts'
import { fixedBy, trace, weightedIds } from './draft.ts'
import { anyOf, matchLink, parseLink } from './links.ts'
import { drawOne, offerTerms, poolOf, termProblem, type Candidate, type Mode, type Pool } from './offer.ts'
import { termOdds } from './odds.ts'
import { reachOf, roleProblem } from './reach.ts'
import type { Draft, Need } from './types.ts'

export type StepResult = { ok: true } | { ok: false; reason: string; final: boolean }

const ok: StepResult = { ok: true }

/** G5: the mode for a part an input or a lock needs (grey-out, answer B, would keep it at the gate). */
function forcedMode(ix: Index): Mode {
  return ix.data.rules.defaults.spice_fallback === 'grey-out' ? 'gate' : 'forced'
}

/** The roles fixed before the roll (an input role or locked roles): primary first. */
function fixedRoles(d: Draft): string[] {
  const r = d.parts.roles
  return r.primary !== undefined ? [r.primary, ...(r.secondary ?? [])] : []
}

/** Why a card of this class, tier and flavour cannot hold the fixed roles (G5, G13), or undefined when it can. */
function fixedRolesProblem(ix: Index, d: Draft, cls: string, tier: string, flavour: string): string | undefined {
  const roles = fixedRoles(d)
  if (!roles.length) return undefined
  const R = reachOf(ix, { ...d.parts, class: cls, tier, flavour, roles: {} }, d.spice, forcedMode(ix))
  for (const role of roles) {
    const why = roleProblem(ix, R, role)
    if (why) return `role ${role} ${why}`
  }
  return undefined
}

/** The tiers and flavours still open to the roll: the fixed one, or every one with input odds above 0. */
function tiersLeft(ix: Index, d: Draft): string[] {
  return d.parts.tier !== undefined ? [d.parts.tier] : weightedIds(ix, 'tiers', ix.data.rules.defaults.input_odds.tier)
}
function flavoursLeft(ix: Index, d: Draft): string[] {
  return d.parts.flavour !== undefined ? [d.parts.flavour] : weightedIds(ix, 'faction-flavours', ix.data.rules.defaults.input_odds.flavour)
}

/** Can some open tier and flavour hold the fixed roles with this class? */
function classHoldsRoles(ix: Index, d: Draft, cls: string): string | undefined {
  let last: string | undefined
  for (const t of tiersLeft(ix, d)) {
    for (const f of flavoursLeft(ix, d)) {
      last = fixedRolesProblem(ix, d, cls, t, f)
      if (last === undefined) return undefined
    }
  }
  return last ?? 'no tier or flavour is left'
}

const poolTrace = (pool: Pool): Array<{ id: string; weight: number }> => pool.items.map(i => ({ id: i.id, weight: i.weight }))

/** Step 1: the class (rolled by the classes list's rarity, S1; a fixed role keeps only classes that can hold it). */
export function stepClass(ix: Index, d: Draft): StepResult {
  const fixed = d.parts.class
  if (fixed !== undefined) {
    const how = fixedBy(d, 'class') ?? 'input'
    const why = termProblem(ix, d.parts, 'classes', fixed) ?? classHoldsRoles(ix, d, fixed)
    if (why) return { ok: false, reason: `the ${how === 'locked' ? 'locked' : 'chosen'} class ${fixed} does not fit: ${why}`, final: true }
    trace(d, { field: 'class', value: fixed, how, candidates: 0, rule: 'I1' })
    return ok
  }
  const offer = offerTerms(ix, d.parts, d.spice, 'classes')
  const dropped = [...offer.dropped]
  const fits: Candidate[] = []
  for (const c of offer.candidates) {
    const why = classHoldsRoles(ix, d, c.id)
    if (why) dropped.push({ id: c.id, why })
    else fits.push(c)
  }
  // G5: when nothing at the gate fits what the inputs and locks need, the least rare class that fits is used.
  let pool = poolOf(ix, fits, 'gate', d.spice)
  if (!pool.items.length && (d.locks.length || fixedRoles(d).length)) pool = poolOf(ix, fits, forcedMode(ix), d.spice)
  const got = drawOne(diceFor(d.seed, 'class', d.attempt), pool)
  if (!got) return { ok: false, reason: 'no class fits the inputs and locks', final: true }
  d.parts.class = got.id
  trace(d, {
    field: 'class',
    value: got.id,
    how: 'rolled',
    rule: 'S1, G1',
    candidates: pool.items.length,
    options: poolTrace(pool),
    draw: got.draw,
    ...(pool.fallback ? { aboveGate: pool.fallback } : {}),
    dropped,
  })
  return ok
}

/** Step 2: the tier, then the flavour (section 1 input odds; a fixed role keeps only those that can hold it). */
export function stepTierFlavour(ix: Index, d: Draft): StepResult {
  const cls = d.parts.class
  if (cls === undefined) throw new Error('step 2 needs the class')
  const odds = ix.data.rules.defaults.input_odds
  // A failure here is final only when nothing before it was rolled (the class was fixed).
  const final = d.inputs.class !== null || d.locks.includes('class')

  const tierFixed = d.parts.tier
  if (tierFixed !== undefined) {
    const how = fixedBy(d, 'tier') ?? 'input'
    let why = termProblem(ix, d.parts, 'tiers', tierFixed)
    if (!why) {
      const flav = flavoursLeft(ix, d)
      const problems = flav.map(f => fixedRolesProblem(ix, d, cls, tierFixed, f))
      if (problems.every(p => p !== undefined)) why = problems[0] ?? 'no flavour is left'
    }
    if (why) return { ok: false, reason: `the ${how === 'locked' ? 'locked' : 'chosen'} tier ${tierFixed} does not fit: ${why}`, final }
    trace(d, { field: 'tier', value: tierFixed, how, candidates: 0, rule: 'I1' })
  } else {
    const dropped: Array<{ id: string; why: string }> = []
    const items: Pool['items'] = []
    for (const t of termsOf(ix, 'tiers')) {
      const w = odds.tier[t.id] ?? 0
      if (w <= 0) continue
      let why = termProblem(ix, d.parts, 'tiers', t.id)
      if (!why) {
        const problems = flavoursLeft(ix, d).map(f => fixedRolesProblem(ix, d, cls, t.id, f))
        if (problems.every(p => p !== undefined)) why = problems[0] ?? 'no flavour is left'
      }
      if (why) dropped.push({ id: t.id, why })
      else items.push({ id: t.id, weight: w })
    }
    const got = drawOne(diceFor(d.seed, 'tier', d.attempt), { items })
    if (!got) return { ok: false, reason: `no tier fits class ${cls} and the inputs and locks`, final }
    d.parts.tier = got.id
    trace(d, { field: 'tier', value: got.id, how: 'rolled', rule: 'section 1 (input odds), G1', candidates: items.length, options: items, draw: got.draw, dropped })
  }

  const tier = d.parts.tier
  if (tier === undefined) throw new Error('the tier must be set here')
  const flavourFixed = d.parts.flavour
  if (flavourFixed !== undefined) {
    const how = fixedBy(d, 'flavour') ?? 'input'
    const why = fixedRolesProblem(ix, d, cls, tier, flavourFixed)
    if (why) return { ok: false, reason: `the ${how === 'locked' ? 'locked' : 'chosen'} flavour ${flavourFixed} does not fit: ${why}`, final: final && d.parts.tier === tierFixed }
    trace(d, { field: 'flavour', value: flavourFixed, how, candidates: 0, rule: 'I1' })
    return ok
  }
  const dropped: Array<{ id: string; why: string }> = []
  const items: Pool['items'] = []
  for (const f of termsOf(ix, 'faction-flavours')) {
    const w = odds.flavour[f.id] ?? 0
    if (w <= 0) continue
    const why = fixedRolesProblem(ix, d, cls, tier, f.id)
    if (why) dropped.push({ id: f.id, why })
    else items.push({ id: f.id, weight: w })
  }
  const got = drawOne(diceFor(d.seed, 'flavour', d.attempt), { items })
  if (!got) return { ok: false, reason: `no flavour fits class ${cls}, tier ${tier} and the inputs and locks`, final: false }
  d.parts.flavour = got.id
  trace(d, { field: 'flavour', value: got.id, how: 'rolled', rule: 'section 1 (input odds)', candidates: items.length, options: items, draw: got.draw, dropped })
  return ok
}

/** G2 and G13: what a role passes on to the later steps (its requires groups not met yet, and its role fit). */
export function roleNeeds(ix: Index, d: Draft, role: string, forced: boolean): Need[] {
  const out: Need[] = []
  const by = `role:${role}`
  const t = ix.terms.get('roles')?.get(role)
  for (const g of t?.requires ?? []) {
    if (anyOf(g.map(l => matchLink(ix, d.parts, l))) !== 'yes') out.push({ links: g, by, rule: 'G2', forced })
  }
  const fit = ix.data.rules.role_fit[role]
  if (fit?.patterns) out.push({ links: fit.patterns.map(p => `pattern:${p}`), by, rule: 'G13', forced })
  if (fit?.any) out.push({ links: fit.any, by, rule: 'G13', forced })
  // G13 reads assault's range on the main weapon ("a main weapon of medium range or less"; the role_fit note): the
  // more specific rule wins over N1, where a range link matches any weapon.
  for (const l of fit?.all ?? []) out.push({ links: [l], by, rule: 'G13', forced, ...(parseLink(l).kind === 'range' ? { onPrimary: true } : {}) })
  return out
}

/**
 * Step 3: the primary role. A role fixed by an input or a lock is always used (G5); otherwise it is rolled among the
 * roles the card can hold at its spice (G13, G14), each at the default rarity's weight, times the favoured weight when
 * the flavour favours it (S1).
 */
export function stepPrimaryRole(ix: Index, d: Draft): StepResult {
  const { class: cls, tier, flavour } = d.parts
  if (cls === undefined || tier === undefined || flavour === undefined) throw new Error('step 3 needs the class, tier and flavour')
  const gate = reachOf(ix, { ...d.parts, roles: {} }, d.spice, 'gate')
  const fixed = d.parts.roles.primary
  if (fixed !== undefined) {
    const how = fixedBy(d, 'roles') ?? 'input'
    const forced = reachOf(ix, { ...d.parts, roles: {} }, d.spice, forcedMode(ix))
    for (const role of fixedRoles(d)) {
      const why = roleProblem(ix, forced, role)
      if (why) return { ok: false, reason: `the ${how === 'locked' ? 'locked' : 'chosen'} role ${role} cannot be held: ${why}`, final: false }
    }
    const atGate = roleProblem(ix, gate, fixed)
    trace(d, {
      field: 'roles.primary',
      value: fixed,
      how,
      rule: 'I1, G5',
      candidates: 0,
      ...(atGate ? { aboveGate: `at spice ${d.spice} ${atGate}; the role is chosen, so a later step sets its tool above the gate if it must (G5, G13)` } : {}),
    })
    for (const role of fixedRoles(d)) d.needs.push(...roleNeeds(ix, d, role, true))
    return ok
  }
  const dropped: Array<{ id: string; why: string }> = []
  const fits: Candidate[] = []
  const ctx = { class: cls, flavour, spice: d.spice }
  for (const t of termsOf(ix, 'roles')) {
    const hard = termProblem(ix, d.parts, 'roles', t.id)
    const why = hard ?? roleProblem(ix, gate, t.id)
    if (why) dropped.push({ id: t.id, why: hard ?? `${why} at spice ${d.spice} (G14)` })
    else fits.push({ id: t.id, odds: termOdds(ix, 'roles', t.id, ctx) })
  }
  const pool = poolOf(ix, fits, 'gate', d.spice)
  const got = drawOne(diceFor(d.seed, 'roles.primary', d.attempt), pool)
  if (!got) return { ok: false, reason: `no role can be held by a ${flavour} ${cls} at ${tier}, spice ${d.spice}`, final: false }
  d.parts.roles.primary = got.id
  trace(d, { field: 'roles.primary', value: got.id, how: 'rolled', rule: 'G13, G14, S1', candidates: pool.items.length, options: poolTrace(pool), draw: got.draw, dropped })
  d.needs.push(...roleNeeds(ix, d, got.id, false))
  return ok
}
