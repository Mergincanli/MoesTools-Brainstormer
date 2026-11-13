// Roll steps 1 to 3 (rules.json roll_order: class, tier-and-flavour, primary-role).
//
// A step leaves a value the inputs or its own locks set (I1) and checks that it fits; otherwise it rolls the value with
// the field's own dice among the values that fit everything already chosen. A role chosen as an input is known before
// step 1, so the class, the tier and the flavour are offered only among those that can hold it (G5, G13). Locks are set
// at their own steps; the steps before them draw again when a lock rules their draw out (locks.ts): a locked role, a
// locked signature or locked extras must be holdable with the class, tier and flavour drawn.
import { termsOf, type Index } from './data.ts'
import { diceFor } from './dice.ts'
import { fixedBy, lockWaits, trace, weightedIds } from './draft.ts'
import { anyOf, matchLink, parseLink } from './links.ts'
import { drawKeeping, keptTrace, leastRareOf, lockProblem } from './locks.ts'
import { offerTerms, poolOf, termProblem, type Candidate, type Mode, type Pool } from './offer.ts'
import { termOdds } from './odds.ts'
import { reachOf, reachWithAbilities, roleProblem, variantProblem } from './reach.ts'
import type { Draft, DraftParts, Need } from './types.ts'

export type StepResult = { ok: true } | { ok: false; reason: string; final: boolean }

const ok: StepResult = { ok: true }

/** G5: the mode for a part an input or a lock needs (grey-out, answer B, would keep it at the gate). */
function forcedMode(ix: Index): Mode {
  return ix.data.rules.defaults.spice_fallback === 'grey-out' ? 'gate' : 'forced'
}

/** The role chosen as an input (known before step 1). */
function inputRoles(d: Draft): string[] {
  return d.inputs.role !== null ? [d.inputs.role] : []
}

/** The roles the card must hold: the input role and the locked roles, primary first (the secondary roles are set at
 *  their own step, but held from the start: G5, G13). */
function rolesToHold(d: Draft): string[] {
  const L = d.locked.roles
  return [...new Set([...inputRoles(d), ...(L ? [L.primary, ...L.secondary] : [])])]
}

/** Why a card of this class, tier and flavour cannot hold these roles (G5, G13), or undefined when it can. */
function rolesProblem(ix: Index, d: Draft, roles: readonly string[], cls: string, tier: string, flavour: string): string | undefined {
  if (!roles.length) return undefined
  const R = reachOf(ix, { ...d.parts, class: cls, tier, flavour, roles: {} }, d.spice, forcedMode(ix))
  for (const role of roles) {
    const why = roleProblem(ix, R, role)
    if (why) return `role ${role} ${why}`
  }
  return undefined
}

/** Why a card of this class, tier and flavour cannot hold what the locks need: the locked roles, the locked signature
 *  and the locked extras (the hard rules, without rarity: I1, G5), or undefined. The same checks steps 3, 4 and 14
 *  make on the locked values themselves. */
function lockedHoldProblem(ix: Index, d: Draft, cls: string, tier: string, flavour: string): string | undefined {
  const roles = rolesProblem(ix, d, rolesToHold(d), cls, tier, flavour)
  if (roles) return roles
  const plain: DraftParts = { ...d.parts, class: cls, tier, flavour, roles: {} }
  const sig = lockWaits(d, 'signature', 'signature') ? d.locked.signature : undefined
  const extras = lockWaits(d, 'abilities', 'extra-abilities') ? d.locked.abilities ?? [] : []
  if (!sig?.pattern && !extras.length) return undefined
  const R = reachOf(ix, plain, d.spice, 'forced')
  if (sig?.pattern && sig.variant && ix.patternById.has(sig.pattern)) {
    const why = variantProblem(ix, R, sig.pattern, sig.variant)
    if (why) return `the locked signature ${sig.pattern}: ${why}`
  }
  for (let i = 0; i < extras.length; i++) {
    const x = extras[i]
    if (!x?.pattern || !x.variant || !ix.patternById.has(x.pattern)) continue
    const Ri = reachWithAbilities(ix, R, { ...plain, signature: d.locked.signature, pending: extras.slice(0, i) })
    const why = variantProblem(ix, Ri, x.pattern, x.variant)
    if (why) return `the locked extra ${x.pattern}: ${why}`
  }
  return undefined
}

/** The tiers and flavours still open: the fixed one (set, or locked when `withLocks`), or every one with input odds. */
function tiersLeft(ix: Index, d: Draft, withLocks: boolean): string[] {
  const fixed = d.parts.tier ?? (withLocks ? d.locked.tier : undefined)
  return fixed !== undefined ? [fixed] : weightedIds(ix, 'tiers', ix.data.rules.defaults.input_odds.tier)
}
function flavoursLeft(ix: Index, d: Draft, withLocks: boolean): string[] {
  const fixed = d.parts.flavour ?? (withLocks ? d.locked.flavour : undefined)
  return fixed !== undefined ? [fixed] : weightedIds(ix, 'faction-flavours', ix.data.rules.defaults.input_odds.flavour)
}

/** Can some open tier and flavour hold the input role (or, `withLocks`, what the locks need) with this class? */
function classHolds(ix: Index, d: Draft, cls: string, withLocks: boolean, tiers = tiersLeft(ix, d, withLocks)): string | undefined {
  let last: string | undefined
  for (const t of tiers) {
    for (const f of flavoursLeft(ix, d, withLocks)) {
      last = withLocks ? lockedHoldProblem(ix, d, cls, t, f) : rolesProblem(ix, d, inputRoles(d), cls, t, f)
      if (last === undefined) return undefined
    }
  }
  return last ?? 'no tier or flavour is left'
}

/** Does anything before step 3 have to be held for the locks (roles, signature, extras)? */
function holdsForLocks(d: Draft): boolean {
  return d.locked.roles !== undefined || lockWaits(d, 'signature', 'signature') || lockWaits(d, 'abilities', 'extra-abilities')
}

/** Step 1: the class (rolled by the classes list's rarity, S1; an input role keeps only classes that can hold it). */
export function stepClass(ix: Index, d: Draft): StepResult {
  const fixed = d.parts.class
  if (fixed !== undefined) {
    const how = fixedBy(d, 'class') ?? 'input'
    const why = termProblem(ix, d.parts, 'classes', fixed) ?? classHolds(ix, d, fixed, true) ?? lockProblem(ix, d, d.parts)
    if (why) return { ok: false, reason: `the ${how === 'locked' ? 'locked' : 'chosen'} class ${fixed} does not fit: ${why}`, final: true }
    trace(d, { field: 'class', value: fixed, how, candidates: 0, rule: 'I1' })
    return ok
  }
  const offer = offerTerms(ix, d.parts, d.spice, 'classes')
  const dropped = [...offer.dropped]
  const fits: Candidate[] = []
  for (const c of offer.candidates) {
    const why = classHolds(ix, d, c.id, false)
    if (why) dropped.push({ id: c.id, why })
    else fits.push(c)
  }
  // G5: when nothing at the gate can hold the input role, the least rare class that can is used.
  let pool = poolOf(ix, fits, 'gate', d.spice)
  if (!pool.items.length && inputRoles(d).length) pool = poolOf(ix, fits, forcedMode(ix), d.spice)
  const accept = (id: string): string | undefined => lockProblem(ix, d, { ...d.parts, class: id }) ?? (holdsForLocks(d) ? classHolds(ix, d, id, true) : undefined)
  const got = drawKeeping(ix, d, diceFor(d.seed, 'class', d.attempt), pool, accept, leastRareOf(ix, d, fits))
  if (!got) return { ok: false, reason: 'no class fits the inputs and locks', final: true }
  d.parts = { ...d.parts, class: got.id } // a parts object is never changed once made: a new one replaces it
  trace(d, { field: 'class', value: got.id, how: 'rolled', rule: 'S1, G1', ...keptTrace(got), dropped })
  return ok
}

/** Step 2: the tier, then the flavour (section 1 input odds; an input role keeps only those that can hold it). */
export function stepTierFlavour(ix: Index, d: Draft): StepResult {
  const cls = d.parts.class
  if (cls === undefined) throw new Error('step 2 needs the class')
  const odds = ix.data.rules.defaults.input_odds
  // A failure here is final only when nothing before it was rolled (the class was fixed).
  const final = d.inputs.class !== null || d.locks.includes('class')

  const tierFixed = d.parts.tier
  if (tierFixed !== undefined) {
    const how = fixedBy(d, 'tier') ?? 'input'
    const why = termProblem(ix, d.parts, 'tiers', tierFixed) ?? classHolds(ix, d, cls, true, [tierFixed]) ?? lockProblem(ix, d, d.parts)
    if (why) return { ok: false, reason: `the ${how === 'locked' ? 'locked' : 'chosen'} tier ${tierFixed} does not fit: ${why}`, final }
    trace(d, { field: 'tier', value: tierFixed, how, candidates: 0, rule: 'I1' })
  } else {
    const dropped: Array<{ id: string; why: string }> = []
    const items: Pool['items'] = []
    for (const t of termsOf(ix, 'tiers')) {
      const w = odds.tier[t.id] ?? 0
      if (w <= 0) continue
      const why = termProblem(ix, d.parts, 'tiers', t.id) ?? classHolds(ix, d, cls, false, [t.id])
      if (why) dropped.push({ id: t.id, why })
      else items.push({ id: t.id, weight: w })
    }
    const accept = (id: string): string | undefined => lockProblem(ix, d, { ...d.parts, tier: id }) ?? (holdsForLocks(d) ? classHolds(ix, d, cls, true, [id]) : undefined)
    const got = drawKeeping(ix, d, diceFor(d.seed, 'tier', d.attempt), { items }, accept)
    if (!got) return { ok: false, reason: `no tier fits class ${cls} and the inputs and locks`, final }
    d.parts = { ...d.parts, tier: got.id }
    trace(d, { field: 'tier', value: got.id, how: 'rolled', rule: 'section 1 (input odds), G1', ...keptTrace(got), dropped })
  }

  const tier = d.parts.tier
  if (tier === undefined) throw new Error('the tier must be set here')
  const flavourFixed = d.parts.flavour
  if (flavourFixed !== undefined) {
    const how = fixedBy(d, 'flavour') ?? 'input'
    const why = lockedHoldProblem(ix, d, cls, tier, flavourFixed) ?? lockProblem(ix, d, d.parts)
    if (why) return { ok: false, reason: `the ${how === 'locked' ? 'locked' : 'chosen'} flavour ${flavourFixed} does not fit: ${why}`, final: final && d.parts.tier === tierFixed }
    trace(d, { field: 'flavour', value: flavourFixed, how, candidates: 0, rule: 'I1' })
    return ok
  }
  const dropped: Array<{ id: string; why: string }> = []
  const items: Pool['items'] = []
  for (const f of termsOf(ix, 'faction-flavours')) {
    const w = odds.flavour[f.id] ?? 0
    if (w <= 0) continue
    const why = rolesProblem(ix, d, inputRoles(d), cls, tier, f.id)
    if (why) dropped.push({ id: f.id, why })
    else items.push({ id: f.id, weight: w })
  }
  const accept = (id: string): string | undefined => lockProblem(ix, d, { ...d.parts, flavour: id }) ?? (holdsForLocks(d) ? lockedHoldProblem(ix, d, cls, tier, id) : undefined)
  const got = drawKeeping(ix, d, diceFor(d.seed, 'flavour', d.attempt), { items }, accept)
  if (!got) return { ok: false, reason: `no flavour fits class ${cls}, tier ${tier} and the inputs and locks`, final: false }
  d.parts = { ...d.parts, flavour: got.id }
  trace(d, { field: 'flavour', value: got.id, how: 'rolled', rule: 'section 1 (input odds)', ...keptTrace(got), dropped })
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
    for (const role of rolesToHold(d)) {
      const why = roleProblem(ix, forced, role)
      if (why) return { ok: false, reason: `the ${how === 'locked' ? 'locked' : 'chosen'} role ${role} cannot be held: ${why}`, final: false }
    }
    const clash = lockProblem(ix, d, d.parts)
    if (clash) return { ok: false, reason: `the ${how === 'locked' ? 'locked' : 'chosen'} role ${fixed} does not fit: ${clash}`, final: false }
    const atGate = roleProblem(ix, gate, fixed)
    trace(d, {
      field: 'roles.primary',
      value: fixed,
      how,
      rule: 'I1, G5',
      candidates: 0,
      ...(atGate ? { aboveGate: `at spice ${d.spice} ${atGate}; the role is chosen, so a later step sets its tool above the gate if it must (G5, G13)` } : {}),
    })
    // The input or locked primary role passes its needs on. The locked secondary roles are set at their own step (16):
    // the steps before keep their needs possible by drawing again (locks.ts), and step 14 adds a tool they still lack.
    for (const role of [...new Set([...inputRoles(d), fixed])]) d.needs.push(...roleNeeds(ix, d, role, true))
    return ok
  }
  const dropped: Array<{ id: string; why: string }> = []
  const fits: Candidate[] = []
  const all: Candidate[] = []
  const ctx = { class: cls, flavour, spice: d.spice }
  for (const t of termsOf(ix, 'roles')) {
    const hard = termProblem(ix, d.parts, 'roles', t.id)
    const why = hard ?? roleProblem(ix, gate, t.id)
    const c = { id: t.id, odds: termOdds(ix, 'roles', t.id, ctx) }
    if (!hard) all.push(c)
    if (why) dropped.push({ id: t.id, why: hard ?? `${why} at spice ${d.spice} (G14)` })
    else fits.push(c)
  }
  const pool = poolOf(ix, fits, 'gate', d.spice)
  // A role the locks rule out is drawn again; when none at the gate fits them, the least rare role the card can hold
  // that fits them (G5).
  const accept = (id: string): string | undefined => lockProblem(ix, d, { ...d.parts, roles: { ...d.parts.roles, primary: id } })
  const fallback = (fitsLocks: (id: string) => boolean): Pool => {
    const forced = reachOf(ix, { ...d.parts, roles: {} }, d.spice, forcedMode(ix))
    return leastRareOf(ix, d, all.filter(c => roleProblem(ix, forced, c.id) === undefined))(fitsLocks)
  }
  const got = drawKeeping(ix, d, diceFor(d.seed, 'roles.primary', d.attempt), pool, accept, fallback)
  if (!got) return { ok: false, reason: `no role can be held by a ${flavour} ${cls} at ${tier}, spice ${d.spice}`, final: false }
  d.parts = { ...d.parts, roles: { ...d.parts.roles, primary: got.id } }
  trace(d, { field: 'roles.primary', value: got.id, how: 'rolled', rule: 'G13, G14, S1', ...keptTrace(got), dropped })
  d.needs.push(...roleNeeds(ix, d, got.id, got.pool.fallback !== undefined))
  return ok
}
