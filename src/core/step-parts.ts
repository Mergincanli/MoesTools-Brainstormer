// Steps 5 to 11: mobility and handling, body plan, size, speed, mobility traits, armour class and models, and sensors
// (section 2's table; G10; C1; section 7's sight weights). Each part is rolled by the helpers of parts.ts: a lock keeps
// its value (I1), the offer is the terms that fit everything chosen so far (G1, G2), every need stays possible, and a
// need this step owns last is met (G3, G5).
import { term, type Index } from './data.ts'
import { fixedOdds, fail, ok, rollMulti, rollSingle } from './parts.ts'
import { allNeedsProblem } from './needs.ts'
import type { StepResult } from './steps.ts'
import type { Draft } from './types.ts'

/** Step 5: the mobility base, and its handling, which is always the mobility's default_handling (G10). */
export function stepMobility(ix: Index, d: Draft): StepResult {
  const locked = d.locks.includes('mobility')
  const r = rollSingle(ix, d, { step: 'mobility', field: 'mobility.base', list: 'mobility', get: p => p.mobility.base, locked, rule: 'G1, S1' })
  if (!r.ok) return r
  if (d.parts.mobility.handling !== undefined) {
    d.trace.push({ field: 'mobility.handling', value: d.parts.mobility.handling, how: 'locked', rule: 'I1', candidates: 0 })
    return ok
  }
  const base = d.parts.mobility.base as string
  const handling = term(ix, 'mobility', base)?.default_handling
  if (!handling) return fail(`mobility ${base} has no default handling`)
  d.parts = { ...d.parts, mobility: { ...d.parts.mobility, handling } }
  d.trace.push({ field: 'mobility.handling', value: handling, how: 'default', by: `mobility:${base}`, rule: 'G10', candidates: 0 })
  const why = allNeedsProblem(ix, d.parts, d.spice, d.needs)
  return why ? fail(why) : ok
}

/** Step 6: the body plan. */
export function stepBody(ix: Index, d: Draft): StepResult {
  return rollSingle(ix, d, { step: 'body', field: 'body.plan', list: 'bodies', get: p => p.body.plan, locked: d.locks.includes('body'), rule: 'G1, S1, S3' })
}

/** Step 7: the size. */
export function stepSize(ix: Index, d: Draft): StepResult {
  return rollSingle(ix, d, { step: 'size', field: 'body.size', list: 'sizes', get: p => p.body.size, locked: d.locks.includes('size'), rule: 'G1, G9, S1' })
}

/** Step 8: the speed. */
export function stepSpeed(ix: Index, d: Draft): StepResult {
  return rollSingle(ix, d, { step: 'speed', field: 'mobility.speed', list: 'speed-bands', get: p => p.mobility.speed, locked: d.locks.includes('speed'), rule: 'G1, G9, S1' })
}

/** Step 9: mobility traits. Those an ability implies first (K-d: a key-bound trait comes only that way), then traits
 *  without a key: 0, 1 or 2 by counts.mobility_traits, the key-bound ones counted in the two (C1). */
export function stepMobilityTraits(ix: Index, d: Draft): StepResult {
  return rollMulti(ix, d, {
    step: 'mobility-traits',
    field: 'mobility.traits',
    list: 'mobility-traits',
    get: p => p.mobility.traits,
    set: (p, ids) => ({ ...p, mobility: { ...p.mobility, traits: ids } }),
    locked: d.locks.includes('mobility'),
    counts: ix.data.rules.counts.mobility_traits,
    rule: 'C1, K-d, G1, S1',
    keyBoundFromNeedsOnly: ix.data.rules.defaults.key_traits_only_when_implied,
  })
}

/** Step 10: the armour class, then one or two armour models (C1). */
export function stepArmour(ix: Index, d: Draft): StepResult {
  const locked = d.locks.includes('armour')
  const r = rollSingle(ix, d, { step: 'armour', field: 'armour.class', list: 'armour-classes', get: p => p.armour.class, locked, rule: 'G1, G9, S1' })
  if (!r.ok) return r
  return rollMulti(ix, d, {
    step: 'armour',
    field: 'armour.models',
    list: 'armour-models',
    get: p => p.armour.models,
    set: (p, ids) => ({ ...p, armour: { ...p.armour, models: ids } }),
    locked,
    counts: ix.data.rules.counts.armour_models,
    rule: 'C1, G1, S1, S3',
  })
}

/**
 * Step 11: sight, by section 7's weights (counts.sight; the boosted band times as likely for the roles of sight_boost,
 * read on the primary role, the only role known here), then sensor traits: 0, 1 or 2 by counts.sensor_traits, as many as
 * fit at the spice (G16: at spice 1 every sensor trait is uncommon, so none).
 */
export function stepSensors(ix: Index, d: Draft): StepResult {
  const locked = d.locks.includes('sensors')
  const counts = ix.data.rules.counts
  const boost = counts.sight_boost
  const role = d.parts.roles.primary
  const r = rollSingle(ix, d, {
    step: 'sensors',
    field: 'sensors.sight',
    list: 'sight-bands',
    get: p => p.sensors.sight,
    locked,
    rule: 'section 7 (sight weights)',
    odds: id => fixedOdds((counts.sight[id] ?? 0) * (id === boost.band && role !== undefined && boost.roles.includes(role) ? boost.times : 1), false),
  })
  if (!r.ok) return r
  return rollMulti(ix, d, {
    step: 'sensors',
    field: 'sensors.traits',
    list: 'sensor-traits',
    get: p => p.sensors.traits,
    set: (p, ids) => ({ ...p, sensors: { ...p.sensors, traits: ids } }),
    locked,
    counts: counts.sensor_traits,
    rule: 'section 7, G1, G16, S1, S3',
  })
}
