// Step 12: crew model, solo fallback, passengers, body count, nature and availability (section 7, A5, C2, C4, K-a).
// The seats of the abilities and weapons follow from the crew (A5); they are given out once the extras are known, at
// the end of step 14, since a commander seat takes the last extra.
import { seatsNeeded } from './abilities.ts'
import { term, tierAtLeast, type Index } from './data.ts'
import { diceFor } from './dice.ts'
import { withPendingLocks } from './draft.ts'
import { abilitiesOf, budgetOf, budgetProblem, seatPlan } from './keys.ts'
import { matchLink, parseLink } from './links.ts'
import { drawKeeping, keptTrace, leastRareOf, lockProblem } from './locks.ts'
import { allNeedsProblem, needAnswer } from './needs.ts'
import { offerTerms, poolOf, termProblem } from './offer.ts'
import { fail, fixedOdds, ok, rollSingle } from './parts.ts'
import { passengerKind } from './patterns.ts'
import type { StepResult } from './steps.ts'
import type { Draft, DraftParts, Need } from './types.ts'

/**
 * The crew's own rules: a gunner seat always comes with a secondary weapon (section 7), which takes a key (K-a), so the
 * budgets must hold it (seats too, K-c); and every operating seat must own a weapon or an ability (C4, idle-seat).
 */
function crewProblem(ix: Index, parts: DraftParts, model: string): string | undefined {
  const seats = term(ix, 'crew-models', model)?.seats ?? ['driver']
  const gunner = ix.data.rules.defaults.secondary_weapon.always_with
  const withGun: DraftParts = seats.includes(gunner) && !parts.armament.secondary ? { ...parts, armament: { ...parts.armament, secondary: {} } } : parts
  const budget = budgetOf(ix, withGun)
  if (budget) return `${budget}, with the secondary weapon a ${gunner} seat brings`
  const plan = seatPlan(ix, withGun)
  for (const seat of plan.operating) {
    if (!plan.abilities.includes(seat) && plan.secondary !== seat) return `its ${seat} seat would own nothing (C4)`
  }
  return undefined
}

/** The passengers: needs on the draft that one number of seats must meet. */
function seatNeeds(d: Draft): Need[] {
  return d.needs.filter(n => n.links.every(l => parseLink(l).kind === 'passengers'))
}

function stepPassengers(ix: Index, d: Draft): StepResult {
  const caps = ix.data.rules.defaults.passengers.caps
  const size = d.parts.body.size as string
  const cap = caps[size] ?? 0
  // The card's abilities, the locked extras still to come included (they are on the card at step 14).
  const all = withPendingLocks(d, d.parts) ?? d.parts
  const now = d.parts.crew.passengers
  if (now !== undefined) {
    const seats = now === null ? 0 : now.seats
    if (seats > 0 && seatsNeeded(ix, all) === 0) return fail('the locked crew has passenger seats, but no pattern on the card brings them (section 7)')
    if (seats > cap) return fail(`the locked crew has ${seats} passenger seats; a ${size} unit holds ${cap}`)
    if (now !== null && seats > 0 && now.kind !== passengerKind(ix, all)) return fail(`the locked passenger seats are ${now.kind}; the patterns on the card make them ${passengerKind(ix, all)} (section 7)`)
    d.trace.push({ field: 'crew.passengers', value: now, how: 'locked', rule: 'I1', candidates: 0 })
    return ok
  }
  // From the needed minimum to the cap of the size, equally likely (rules.json passengers.seat_odds), meeting every need;
  // none when no pattern brings seats. A number a waiting lock rules out is drawn again; when none fits the locks, the
  // numbers the locked extras still to come need (locks.ts).
  const needs = seatNeeds(d)
  const optionsFor = (parts: DraftParts): Array<DraftParts['crew']['passengers']> => {
    const brought = seatsNeeded(ix, parts)
    if (brought === 0) return [null]
    const kind = passengerKind(ix, parts)
    if (!kind) return []
    const out: Array<DraftParts['crew']['passengers']> = []
    for (let n = brought; n <= cap; n++) out.push({ seats: n, kind })
    return out
  }
  const withSeats = (p: DraftParts['crew']['passengers']): DraftParts => ({ ...d.parts, crew: { ...d.parts.crew, passengers: p } })
  const own = optionsFor(d.parts).filter(p => needs.every(x => needAnswer(ix, withSeats(p), x) === 'yes'))
  const key = (p: DraftParts['crew']['passengers']): string => (p === null || p === undefined ? '0' : String(p.seats))
  const byKey = new Map([...own, ...optionsFor(all)].map(p => [key(p), p]))
  const brought = seatsNeeded(ix, d.parts)
  const got = drawKeeping(
    ix, d, diceFor(d.seed, 'crew.passengers', d.attempt), { items: brought === 0 ? [] : own.map(p => ({ id: key(p), weight: 1 })) },
    id => lockProblem(ix, d, withSeats(byKey.get(id) ?? null)),
    fits => ({ items: optionsFor(all).filter(p => needs.every(x => needAnswer(ix, withSeats(p), x) === 'yes') && fits(key(p))).map(p => ({ id: key(p), weight: 1 })) }),
  )
  if (brought === 0 && (!got || got.id === '0')) {
    // No pattern on the card brings seats: none (section 7), unless a lock needs them (got from the fallback).
    const open = needs.filter(n => !n.avoid && needAnswer(ix, withSeats(null), n) !== 'yes')
    if (open.length) return fail(`${open[0]?.by} needs passenger seats, and no pattern on the card brings them (section 7)`)
    const clash = lockProblem(ix, d, withSeats(null))
    if (clash && !got) return fail(`no passenger seats fit the locks: ${clash}`)
    d.parts = withSeats(null)
    d.trace.push({ field: 'crew.passengers', value: null, how: 'default', rule: 'section 7: only a pattern brings seats', candidates: 0 })
    return ok
  }
  if (!got) return fail(`the patterns on the card need ${brought} passenger seats; a ${size} unit holds ${cap}, or the card's needs allow none of them (section 7)`)
  const chosen = byKey.get(got.id) ?? null
  d.parts = withSeats(chosen)
  const by = abilitiesOf(all).filter(a => a.pattern !== undefined).map(a => `pattern:${a.pattern}`).join(', ')
  d.trace.push({ field: 'crew.passengers', value: chosen, how: 'needed', by, rule: 'section 7 (seats from the needed minimum to the cap, equal odds)', ...keptTrace(got) })
  return ok
}

/** Section 7: the nature, from the first entry whose when link the card meets and whose nature the word lists allow. */
function stepNature(ix: Index, d: Draft): StepResult {
  for (const e of ix.data.rules.defaults.nature) {
    if (termProblem(ix, d.parts, 'nature', e.nature) !== undefined) continue
    if (e.when && matchLink(ix, d.parts, e.when) !== 'yes') continue
    d.parts = { ...d.parts, nature: e.nature }
    d.trace.push({ field: 'nature', value: e.nature, how: 'default', by: e.when ?? 'the last entry', rule: 'section 7 (nature)', candidates: 0 })
    const why = allNeedsProblem(ix, d.parts, d.spice, d.needs)
    return why ? fail(why) : ok
  }
  return fail('no nature fits the card (rules.json defaults.nature)')
}

export function stepCrew(ix: Index, d: Draft): StepResult {
  const locked = d.locks.includes('crew')
  const model = rollSingle(ix, d, {
    step: 'crew', field: 'crew.model', list: 'crew-models', get: p => p.crew.model, locked, rule: 'G1, S1, S3',
    extra: (parts, id) => crewProblem(ix, parts, id),
  })
  if (!model.ok) return model
  const crew = term(ix, 'crew-models', d.parts.crew.model as string)
  // C2: a multi-seat crew has a solo fallback; a single-seat crew (solo, squad, remote) has none.
  const multi = (crew?.max_players ?? 1) > 1
  if (d.parts.crew.solo_fallback !== undefined) {
    if (multi !== (d.parts.crew.solo_fallback !== null)) return fail(`the locked solo fallback does not fit a ${multi ? 'multi' : 'single'}-seat crew (C2)`)
    d.trace.push({ field: 'crew.solo_fallback', value: d.parts.crew.solo_fallback, how: 'locked', rule: 'I1', candidates: 0 })
  } else if (multi) {
    const offer = offerTerms(ix, d.parts, d.spice, 'solo-fallback')
    const pool = poolOf(ix, offer.candidates, 'gate', d.spice)
    // A fallback a waiting lock rules out is drawn again; when none at the gate fits, the least rare that does (G5).
    const accept = (id: string): string | undefined => lockProblem(ix, d, { ...d.parts, crew: { ...d.parts.crew, solo_fallback: id } })
    const got = drawKeeping(ix, d, diceFor(d.seed, 'crew.solo_fallback', d.attempt), pool, accept, leastRareOf(ix, d, offer.candidates))
    if (!got) return fail('no solo fallback fits (C2)')
    d.parts = { ...d.parts, crew: { ...d.parts.crew, solo_fallback: got.id } }
    d.trace.push({ field: 'crew.solo_fallback', value: got.id, how: 'rolled', rule: 'C2, S1', ...keptTrace(got) })
  } else {
    d.parts = { ...d.parts, crew: { ...d.parts.crew, solo_fallback: null } }
    d.trace.push({ field: 'crew.solo_fallback', value: null, how: 'default', rule: 'C2 (a single-seat crew)', candidates: 0 })
  }
  const seats = stepPassengers(ix, d)
  if (!seats.ok) return seats
  // Body count: by the crew model's own weights in counts.body_count (squad: 2 to 5, equal odds), else the other ones (1).
  const counts = ix.data.rules.counts.body_count as unknown as Record<string, number[] | undefined>
  const weights = counts[d.parts.crew.model as string] ?? counts.other ?? [0, 1]
  if (d.parts.body.count !== undefined) {
    if (!(weights[d.parts.body.count] ?? 0)) return fail(`the locked body count ${d.parts.body.count} does not fit crew ${d.parts.crew.model}`)
    d.trace.push({ field: 'body.count', value: d.parts.body.count, how: 'locked', rule: 'I1', candidates: 0 })
  } else {
    const got = diceFor(d.seed, 'body.count', d.attempt).pick(weights)
    d.parts = { ...d.parts, body: { ...d.parts.body, count: got.index } }
    d.trace.push({ field: 'body.count', value: got.index, how: weights.filter(w => w > 0).length > 1 ? 'rolled' : 'default', rule: 'section 7 (body count)', candidates: weights.filter(w => w > 0).length, draw: got.draw })
  }
  const nature = stepNature(ix, d)
  if (!nature.ok) return nature
  // Availability: fixed weights, each from its min_spice and min_tier (rules.json counts.availability, question AV).
  const av = ix.data.rules.counts.availability
  const tier = d.parts.tier as string
  const r = rollSingle(ix, d, {
    step: 'crew', field: 'availability', list: 'availability', get: p => p.availability, locked: false, rule: 'section 7 (availability, AV)',
    odds: id => {
      const a = av[id]
      const gated = !a || d.spice < (a.min_spice ?? 1) || !tierAtLeast(ix, tier, a.min_tier)
      return fixedOdds(a?.weight ?? 0, gated)
    },
  })
  if (!r.ok) return r
  const budget = budgetProblem(ix, d.parts)
  return budget ? fail(budget) : ok
}
