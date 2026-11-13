// The second form (A9, at the end of step 14), step 15 (on death and the resource), step 16 (the secondary roles),
// and the check of the finished card (G7).
import { term, termsOf, type Index } from './data.ts'
import { diceFor } from './dice.ts'
import { abilitiesOf, budgetProblem, crewSeats, seatPlan } from './keys.ts'
import { matchLink, parseLink } from './links.ts'
import { drawKeeping, keptTrace, leastRareOf, lockProblem } from './locks.ts'
import { needAnswer, ownersOf } from './needs.ts'
import { offerTerms, poolOf, termProblem, UNIT_PARTS, WEAPON_PARTS, type Candidate, type Pool } from './offer.ts'
import { termOdds } from './odds.ts'
import { fail, ok } from './parts.ts'
import { blockFor, neverOnCardWeapon } from './patterns.ts'
import { primarySeat, unarmedProblem } from './step-weapons.ts'
import type { StepResult } from './steps.ts'
import type { Draft, DraftParts, Link, ModeDraft, WeaponDraft } from './types.ts'
import { rollWeapon, weaponProblem } from './weapons.ts'

const pickPool = (ix: Index, d: Draft, cands: readonly Candidate[], forced: boolean): Pool => {
  const gate = poolOf(ix, cands, 'gate', d.spice)
  return gate.items.length || !forced ? gate : poolOf(ix, cands, 'forced', d.spice)
}

// ---------------------------------------------------------------- the second form (A9)

/** The pattern on the card that gives a second form (rules.json second_form.via: transform), if any. */
function secondFormPattern(ix: Index, parts: DraftParts): { pattern: string; variant: string | null } | undefined {
  const via = ix.data.rules.defaults.second_form.via
  const a = abilitiesOf(parts).find(x => x.pattern !== undefined && via.includes(x.pattern))
  return a?.pattern !== undefined ? { pattern: a.pattern, variant: a.variant ?? null } : undefined
}

/** The parts of the second form as the term rules read them: its class and mobility, the card's tier and flavour, and
 *  no body (A9: cards record no second body, so the body rule does not apply). */
function formParts(parts: DraftParts, m: ModeDraft): DraftParts {
  return {
    class: m.class, tier: parts.tier, flavour: parts.flavour, roles: {}, body: {}, armour: {}, sensors: {}, crew: {},
    mobility: { base: m.mobility?.base, handling: m.mobility?.handling, speed: m.mobility?.speed },
    armament: { primary: m.armament?.[0] ?? undefined, secondary: null, conditional: [] },
  }
}

/** Why a second form breaks A9, or undefined. */
function formProblem(ix: Index, parts: DraftParts, m: ModeDraft): string | undefined {
  const via = secondFormPattern(ix, parts)
  if (!via || m.via !== via.pattern) return `a second form comes only from ${ix.data.rules.defaults.second_form.via.join(' or ')} on the card (A9)`
  const classes = blockFor(ix, via.pattern, via.variant).classes
  if (m.class === undefined || m.class === parts.class || !classes.includes(m.class)) return `its class must be one ${via.pattern} allows other than the card's own (A9)`
  const fp = formParts(parts, m)
  for (const [list, id] of [['classes', m.class], ['mobility', m.mobility?.base], ['speed-bands', m.mobility?.speed]] as const) {
    const why = id === undefined ? `needs a ${list} value` : termProblem(ix, fp, list, id)
    if (why) return `${list} ${id}: ${why}`
  }
  if (m.mobility?.handling !== term(ix, 'mobility', m.mobility?.base ?? '')?.default_handling) return 'its handling is the mobility default (G10)'
  if ((m.armament ?? []).length > ix.data.rules.counts.second_form_weapons.length - 1) return `at most ${ix.data.rules.counts.second_form_weapons.length - 1} weapon (A9)`
  for (const w of m.armament ?? []) {
    const why = weaponProblem(ix, fp, w)
    if (why) return `its weapon: ${why}`
  }
  return undefined
}

/** A9: the second form of a card with a transform pattern: a class the pattern allows other than the card's own (by
 *  the classes list's odds), a mobility for that class with its default handling and a speed (step 5 and step 8 rules,
 *  without the body rule), and 0 or 1 weapon rolled by step 13's rules. None without such a pattern. */
export function stepSecondForm(ix: Index, d: Draft): StepResult {
  const via = secondFormPattern(ix, d.parts)
  if (d.parts.modes !== undefined) {
    const m = d.parts.modes[0]
    if (!via && d.parts.modes.length) return fail('the locked second form needs a transform pattern on the card (A9)')
    if (via && !m) return fail(`${via.pattern} gives the card a second form; the locked modes have none (A9)`)
    const why = m ? formProblem(ix, d.parts, m) : undefined
    if (why) return fail(`the locked second form does not fit: ${why}`)
    d.trace.push({ field: 'modes', value: d.parts.modes, how: 'locked', rule: 'I1', candidates: 0 })
    return ok
  }
  if (!via) {
    d.parts = { ...d.parts, modes: [] }
    return ok
  }
  const by = `pattern:${via.pattern}`
  // Above the gate only when a lock put the transform (or the form) on the card (G5); on the generator's own roll the
  // form's parts stay within the gate.
  const forced = d.locks.includes('signature') || d.locks.includes('abilities') || d.locks.includes('modes')
  const ctx = { class: d.parts.class, flavour: d.parts.flavour, spice: d.spice }
  const allowed = blockFor(ix, via.pattern, via.variant).classes
  const classes = termsOf(ix, 'classes').filter(t => !t.source_only && t.id !== d.parts.class && allowed.includes(t.id)).map(t => ({ id: t.id, odds: termOdds(ix, 'classes', t.id, ctx) }))
  const cls = drawKeeping(ix, d, diceFor(d.seed, 'modes.0.class', d.attempt), pickPool(ix, d, classes, forced), () => undefined)
  if (!cls) return fail(`${via.pattern} needs a second class, and none fits (A9)`)
  let m: ModeDraft = { via: via.pattern, class: cls.id, mobility: {} }
  d.trace.push({ field: 'modes.0.class', value: cls.id, how: 'needed', by, rule: 'A9, S1', ...keptTrace(cls) })
  const mob = offerTerms(ix, formParts(d.parts, m), d.spice, 'mobility').candidates
  const base = drawKeeping(ix, d, diceFor(d.seed, 'modes.0.mobility.base', d.attempt), pickPool(ix, d, mob, forced), () => undefined)
  const handling = base ? term(ix, 'mobility', base.id)?.default_handling : undefined
  if (!base || !handling) return fail(`no mobility fits a second form of class ${cls.id} (A9)`)
  m = { ...m, mobility: { base: base.id, handling } }
  d.trace.push({ field: 'modes.0.mobility.base', value: base.id, how: 'needed', by, rule: 'A9, G1, S1', ...keptTrace(base) })
  const spd = offerTerms(ix, formParts(d.parts, m), d.spice, 'speed-bands').candidates
  const speed = drawKeeping(ix, d, diceFor(d.seed, 'modes.0.mobility.speed', d.attempt), pickPool(ix, d, spd, forced), () => undefined)
  if (!speed) return fail(`no speed fits a second form on ${base.id} (A9)`)
  m = { ...m, mobility: { base: base.id, handling, speed: speed.id } }
  d.trace.push({ field: 'modes.0.mobility.speed', value: speed.id, how: 'needed', by, rule: 'A9, G1, S1', ...keptTrace(speed) })
  // 0 or 1 weapon (counts.second_form_weapons), rolled by step 13's rules on the form's own parts; it meets no need of
  // the card (N1 reads the card's own weapons).
  const count = diceFor(d.seed, 'modes.0.armament', d.attempt).pick(ix.data.rules.counts.second_form_weapons).index
  if (count > 0) {
    const form: Draft = { ...d, parts: formParts(d.parts, m), needs: [], trace: [], locked: {}, lockSteps: [], locks: [] }
    const why = rollWeapon(ix, form, {
      path: 'modes.0.armament.0', seat: primarySeat(ix, d.parts), last: true,
      get: p => p.armament.primary ?? {}, set: (p, w) => ({ ...p, armament: { ...p.armament, primary: w } }),
    })
    if (why) return fail(`the second form's weapon: ${why}`)
    m = { ...m, armament: [form.parts.armament.primary as WeaponDraft] }
    d.trace.push(...form.trace)
  }
  d.parts = { ...d.parts, modes: [m] }
  d.trace.push({ field: 'modes', value: `${count} weapon${count === 1 ? '' : 's'}`, how: 'needed', by, rule: 'A9', candidates: ix.data.rules.counts.second_form_weapons.length })
  const clash = lockProblem(ix, d, d.parts)
  return clash ? fail(clash) : ok
}

// ---------------------------------------------------------------- step 15: on death and the resource

/** C3 and section 7: why a list of on-death outcomes contradicts itself or the card, or undefined. */
function onDeathProblem(ix: Index, parts: DraftParts, list: readonly string[]): string | undefined {
  const rule = ix.data.rules.defaults.on_death
  const who = list.filter(x => rule.who_gets_out.includes(x))
  const left = list.filter(x => rule.what_is_left.includes(x))
  if (who.length !== 1 || left.length > 1 || who.length + left.length !== list.length) return 'one "who gets out" outcome and at most one "what is left" outcome (C3)'
  for (const pair of rule.never_together) if (pair.every(x => list.includes(x))) return `${pair.join(' and ')} never go together (C3)`
  for (const x of list) {
    if (rule.crewed_machine_only.includes(x) && parts.nature !== 'crewed-machine') return `${x} only for a crewed machine (section 7)`
    const why = termProblem(ix, { ...parts, on_death: list.filter(y => y !== x) }, 'on-death', x)
    if (why) return `${x}: ${why}`
  }
  return undefined
}

/** Step 15: on death (section 7, C3: one "who gets out" outcome, its default by nature three times as likely; then 0
 *  or 1 "what is left" outcome by counts.on_death; rarity and spice as for every rolled part, section 18), then the
 *  resource (none, unless an open need of a pattern names one). */
export function stepOnDeath(ix: Index, d: Draft): StepResult {
  const rule = ix.data.rules.defaults.on_death
  const now = d.parts.on_death
  if (now !== undefined) {
    const why = onDeathProblem(ix, d.parts, now)
    if (why) return fail(`the locked on-death outcomes do not fit: ${why}`)
    d.trace.push({ field: 'on_death', value: now, how: 'locked', rule: 'I1', candidates: 0 })
  } else {
    const dice = diceFor(d.seed, 'on_death', d.attempt)
    const def = rule.default[d.parts.nature ?? ''] ?? undefined
    const fits = (x: string, others: readonly string[]): boolean => onDeathProblem(ix, d.parts, [...others, x].sort((a, b) => Number(rule.what_is_left.includes(a)) - Number(rule.what_is_left.includes(b)))) === undefined
    const firsts = offerTerms(ix, d.parts, d.spice, 'on-death', { only: rule.who_gets_out }).candidates
      .filter(c => fits(c.id, []))
      .map(c => (c.id === def ? { id: c.id, odds: { ...c.odds, weight: c.odds.weight * rule.default_weight, fallbackWeight: c.odds.fallbackWeight * rule.default_weight } } : c))
    const first = drawKeeping(ix, d, dice, pickPool(ix, d, firsts, false), id => lockProblem(ix, d, { ...d.parts, on_death: [id] }), leastRareOf(ix, d, firsts))
    if (!first) return fail('no on-death outcome fits the card (section 7)')
    const more = dice.pick(ix.data.rules.counts.on_death).index
    const list = [first.id]
    if (more > 0) {
      const seconds = offerTerms(ix, d.parts, d.spice, 'on-death', { only: rule.what_is_left }).candidates.filter(c => fits(c.id, list))
      const second = drawKeeping(ix, d, dice, poolOf(ix, seconds, 'gate', d.spice), id => lockProblem(ix, d, { ...d.parts, on_death: [...list, id] }))
      if (second) list.push(second.id) // G16: none when none fits at the spice
    }
    d.parts = { ...d.parts, on_death: list }
    d.trace.push({ field: 'on_death', value: list, how: 'rolled', rule: `section 7 (default ${def ?? 'none'} x${rule.default_weight}), C3, G1, S1`, ...keptTrace(first), note: `what is left: ${more > 0 ? (list[1] ?? 'none fits at this spice') : 'none'}` })
  }
  // The resource: none, unless an open need names one (a pattern implies or requires it); its links in the needs' order.
  if (d.parts.resource !== undefined) {
    const r = d.parts.resource
    const why = r !== null ? termProblem(ix, d.parts, 'resources', r) : undefined
    if (why) return fail(`the locked resource ${r} does not fit: ${why}`)
    d.trace.push({ field: 'resource', value: r, how: 'locked', rule: 'I1', candidates: 0 })
    return ok
  }
  const open = d.needs.filter(n => !n.avoid && n.links.some(l => parseLink(l).kind === 'resource') && needAnswer(ix, d.parts, n) !== 'yes')
  if (!open.length) {
    d.parts = { ...d.parts, resource: null }
    d.trace.push({ field: 'resource', value: null, how: 'default', rule: 'section 7 (none unless a pattern names one)', candidates: 0 })
    return ok
  }
  const ids = termsOf(ix, 'resources').map(t => t.id).filter(id => open.every(n => n.links.includes(`resource:${id}`)))
  const cands = offerTerms(ix, d.parts, d.spice, 'resources', { only: ids }).candidates
  const got = drawKeeping(ix, d, diceFor(d.seed, 'resource', d.attempt), pickPool(ix, d, cands, open.some(n => n.forced)), id => lockProblem(ix, d, { ...d.parts, resource: id }))
  if (!got) return fail(`${open.map(n => n.by).join(' and ')} need ${open.map(n => n.links.join(' or ')).join(' and ')}, and no one resource meets them (WL resources: at most one)`)
  d.parts = { ...d.parts, resource: got.id }
  d.trace.push({ field: 'resource', value: got.id, how: 'needed', by: open.map(n => n.by).join(', '), rule: 'section 7, G3, G4', ...keptTrace(got) })
  return ok
}

// ---------------------------------------------------------------- step 16: the secondary roles

/** Answers a link on the primary weapon only (assault's main weapon, role_fit note). */
function onPrimary(ix: Index, parts: DraftParts, link: Link): boolean {
  return matchLink(ix, { ...parts, armament: { primary: parts.armament.primary, secondary: null, conditional: [] } }, link) === 'yes'
}

/** Why the finished card does not hold a role (its word-list requires, G2, and its fit, G13), or undefined. */
export function roleHeldProblem(ix: Index, parts: DraftParts, role: string): string | undefined {
  const yes = (l: Link): boolean => parseLink(l).kind === 'cost' || matchLink(ix, parts, l) === 'yes'
  for (const g of term(ix, 'roles', role)?.requires ?? []) if (!g.some(yes)) return `${role} requires one of ${g.join(', ')} (G2)`
  const fit = ix.data.rules.role_fit[role]
  if (fit?.patterns && !fit.patterns.some(p => yes(`pattern:${p}`))) return `${role} needs one of the patterns ${fit.patterns.join(', ')} (G13)`
  if (fit?.any && !fit.any.some(yes)) return `${role} needs one of ${fit.any.join(', ')} (G13)`
  for (const l of fit?.all ?? []) if (!(parseLink(l).kind === 'range' ? onPrimary(ix, parts, l) : yes(l))) return `${role} needs ${l}${parseLink(l).kind === 'range' ? ' on its main weapon' : ''} (G13)`
  return undefined
}

/** Step 16: the secondary roles (G14): 0, 1 or 2 by counts.secondary_roles, the roles a pattern implies or names in a
 *  strength first (the open needs on role: links), then others the finished card holds, by the roles' odds (S1: common,
 *  three times as likely when the flavour favours one). */
export function stepSecondaryRoles(ix: Index, d: Draft): StepResult {
  const primary = d.parts.roles.primary as string
  const max = ix.data.rules.counts.secondary_roles.length - 1
  const now = d.parts.roles.secondary
  if (now !== undefined) {
    const bad = now.length > max ? `more than ${max}` : new Set([primary, ...now]).size !== now.length + 1 ? 'a role twice' : now.map(r => roleHeldProblem(ix, d.parts, r) ?? termProblem(ix, d.parts, 'roles', r)).find(Boolean)
    if (bad) return fail(`the locked secondary roles do not fit: ${bad}`)
    d.trace.push({ field: 'roles.secondary', value: now, how: 'locked', rule: 'I1', candidates: 0 })
    return ok
  }
  const dice = diceFor(d.seed, 'roles.secondary', d.attempt)
  const want = dice.pick(ix.data.rules.counts.secondary_roles).index
  const chosen: string[] = []
  const ctx = { class: d.parts.class, flavour: d.parts.flavour, spice: d.spice }
  const held = (exclude: readonly string[], only?: readonly string[]): Candidate[] =>
    termsOf(ix, 'roles')
      .filter(t => !t.source_only && t.id !== primary && !exclude.includes(t.id) && (!only || only.includes(t.id)))
      .filter(t => termProblem(ix, d.parts, 'roles', t.id) === undefined && roleHeldProblem(ix, d.parts, t.id) === undefined)
      .map(t => ({ id: t.id, odds: termOdds(ix, 'roles', t.id, ctx) }))
  const set = (ids: string[]): DraftParts => ({ ...d.parts, roles: { primary, secondary: ids } })
  const notes: string[] = []
  // G14: the roles the patterns name come first.
  for (const n of d.needs) {
    if (n.avoid || !n.links.some(l => parseLink(l).kind === 'role') || needAnswer(ix, set(chosen), n) === 'yes') continue
    const ids = n.links.filter(l => parseLink(l).kind === 'role').map(l => parseLink(l).id)
    const got = drawKeeping(ix, d, dice, pickPool(ix, d, held(chosen, ids), n.forced), id => lockProblem(ix, d, set([...chosen, id])))
    if (!got) continue // a need that also names other parts may be met by them; the finished-card check judges it
    if (chosen.length >= max) return fail(`${n.by} names more roles than the card has room for (G14)`)
    chosen.push(got.id)
    notes.push(`${got.id} for ${n.by} (${n.rule})`)
  }
  for (let i = Math.min(want, max) - chosen.length; i > 0; i--) {
    const got = drawKeeping(ix, d, dice, poolOf(ix, held(chosen), 'gate', d.spice), id => lockProblem(ix, d, set([...chosen, id]), i > 1))
    if (!got) break // G16: only roles the card holds
    chosen.push(got.id)
  }
  d.parts = set(chosen)
  d.trace.push({ field: 'roles.secondary', value: [...chosen], how: notes.length ? 'needed' : 'rolled', rule: 'G14, G13, G2, S1', candidates: ix.data.rules.counts.secondary_roles.length, note: `count ${want}${notes.length ? `; ${notes.join('; ')}` : ''}` })
  return ok
}

// ---------------------------------------------------------------- the finished card (G7)

/**
 * Every rule that only the finished parts can answer (G7): the requires of every term (G2) and its maps both ways (G1),
 * the patterns' implies, requires and excludes and the links their strengths and weaknesses name (G3, G4, A7, M2), the
 * roles held (G2, G13, G14), the budgets and seats (K-a, K-c, C2, C4), on death (C3), the unarmed rule and the second
 * form (section 7, A9), no stun on a weapon (HC1), and every need left on the draft. Cost links wait for the card's cost
 * band (matchups, balance and text: the last step). Why the card breaks one, or undefined.
 */
export function finishedProblem(ix: Index, d: Draft): string | undefined {
  const p = d.parts
  const judged = (l: Link): boolean => !['cost', 'immune', 'unit'].includes(parseLink(l).kind)
  const yes = (l: Link): boolean => !judged(l) || matchLink(ix, p, l) === 'yes'
  for (const list of Object.keys(UNIT_PARTS)) {
    for (const id of UNIT_PARTS[list]?.(p) ?? []) {
      if (typeof id !== 'string') continue
      const why = termProblem(ix, p, list, id)
      if (why) return `${list} ${id}: ${why}`
      for (const g of term(ix, list, id)?.requires ?? []) if (!g.some(yes)) return `${list} ${id} requires one of ${g.join(', ')} (G2)`
    }
  }
  const weapons = [p.armament.primary, p.armament.secondary, ...(p.armament.conditional ?? []).map(c => c.weapon)].filter((w): w is WeaponDraft => !!w)
  for (const w of weapons) {
    const why = weaponProblem(ix, p, w)
    if (why) return `weapon ${w.family}: ${why}`
    for (const list of Object.keys(WEAPON_PARTS)) {
      for (const id of WEAPON_PARTS[list]?.(w) ?? []) {
        if (typeof id !== 'string') continue
        for (const g of term(ix, list, id)?.requires ?? []) if (!g.some(yes)) return `${list} ${id} requires one of ${g.join(', ')} (G2)`
      }
    }
    if ((w.traits ?? []).some(t => neverOnCardWeapon(ix, `weapon-trait:${t}`))) return 'a stun trait on a weapon (HC1)'
  }
  for (const a of abilitiesOf(p)) {
    if (a.pattern === undefined) return 'an ability without a pattern'
    const b = blockFor(ix, a.pattern, a.variant ?? null)
    for (const l of b.implies) if (!yes(l)) return `${a.pattern} implies ${l} (G3)`
    for (const g of b.requires) if (!g.some(yes)) return `${a.pattern} requires one of ${g.join(', ')} (G4)`
    for (const l of b.excludes) if (judged(l) && matchLink(ix, p, l) === 'yes') return `${a.pattern} excludes ${l} (A7)`
    for (const r of [...b.adds_strengths, ...b.adds_weaknesses]) if (!yes(r.ref)) return `${a.pattern} names ${r.ref} in a strength or weakness, and the card does not hold it (M2)`
  }
  for (const role of [p.roles.primary, ...(p.roles.secondary ?? [])]) {
    const why = role === undefined ? 'no primary role' : roleHeldProblem(ix, p, role)
    if (why) return why
  }
  const budget = budgetProblem(ix, p)
  if (budget) return budget
  const crew = p.crew.model !== undefined ? term(ix, 'crew-models', p.crew.model) : undefined
  if (((crew?.max_players ?? 1) > 1) !== (typeof p.crew.solo_fallback === 'string')) return 'a multi-seat crew has a solo fallback, a single-seat crew none (C2)'
  const plan = seatPlan(ix, p)
  const primarySeatNow = p.armament.primary?.seat
  for (const seat of plan.operating) {
    if (!plan.abilities.includes(seat) && plan.secondary !== seat && primarySeatNow !== seat) return `the ${seat} seat owns nothing (C4)`
  }
  if (p.armament.secondary && !crewSeats(ix, p).includes(p.armament.secondary.seat ?? 'driver')) return 'the secondary weapon sits on a seat the crew lacks (A5)'
  const death = onDeathProblem(ix, p, p.on_death ?? [])
  if (death) return death
  if (p.armament.primary === null) {
    const why = unarmedProblem(ix, p)
    if (why) return why
  }
  const via = secondFormPattern(ix, p)
  if (via && (p.modes ?? []).length !== 1) return `${via.pattern} gives one second form (A9)`
  if (!via && (p.modes ?? []).length) return 'a second form without a transform pattern (A9)'
  for (const m of p.modes ?? []) {
    const why = formProblem(ix, p, m)
    if (why) return `the second form: ${why}`
  }
  for (const n of d.needs) {
    if (!n.links.some(judged) || n.links.every(l => ownersOf(l).includes('matchups-balance-text'))) continue
    const answer = needAnswer(ix, p, n)
    if (answer !== 'yes' && !n.links.some(l => !judged(l))) return `${n.by} ${n.avoid ? 'excludes' : 'needs'} ${n.links.join(' or ')} (${n.rule})`
  }
  return undefined
}
