// Checks rolled concept cards against the approved rule sheet (docs/generator-rules.md, section 13, item P3).
//
// Usage: node scripts/check-cards.mjs [--root <dir>] [--no-validator] <card.json> [<card.json> ...]
//   card.json       a file that holds one card, or a list of cards
//   --root <dir>    the repository whose data the cards are judged against (default: this repository)
//   --no-validator  skip the validator's own card rules (scripts/validate.mjs), which run on a throwaway copy of the data
//
// Output: one line per problem, '<file>[#<index>] <rule code> <path on the card>: <sentence>', then a summary line.
// Exit codes: 0 every card passes; 1 a card breaks a rule, or a file can't be read or parsed; 2 no file given.
//
// Why a separate checker. The generator (src/core/) is written by someone else from the same rule sheet. This file
// never reads the generator's code and the generator never reads this one: where both read a rule the same way, rolled
// cards pass; where they differ, one of them misread the sheet, and that is what this arrangement is meant to find. So
// every rule here is read from the sheet and every number from the data files (data/vocab, data/patterns,
// data/generator); no number of the sheet is typed in. Where the sheet does not say enough to check a rule exactly,
// only the certain part is checked and the rest is listed under "Could not check" below.
//
// As a module:
//   loadCheckData(root)                 reads everything the checker needs (its own reading; no shared loader)
//   checkCard(card, data)               the problems of one card, [{ code, path, message }]; an empty list = it passes
//   validateCards(cards, root)          the validator's own card rules on a batch (one validate() call on a throwaway
//                                       copy of the folders it reads, with the cards written where it looks for
//                                       example cards); scripts/validate.mjs is not changed
//   checkCards(cards, data, options)    both, per card (options.validator false skips the validator)
//   countKeys(card, data)               the key count (K-a, K-c, K-g), kept in this one place
//
// Rule codes are the sheet's own (G1 ... T-b). Three more: CS the card schema, V a card rule of scripts/validate.mjs,
// and for the rows of sections 7 and 11, which have no codes of their own, S7 (section 7: crew, seats, death, nature,
// availability, unarmed, passengers, resource) and S11 (section 11: what each text field is built from).
//
// Checks (exact unless marked partial):
//   CS    the card schema, with the validator's Ajv setup and x-vocab keyword
//   G8    generator.data_version equals data/manifest.json's data_version, when that file exists
//   V     the validator's card rules (validateCards; G1, G2, G3, G4, A1, A3, A7, C2, M2 live there; C2 and A7 are
//         checked here as well, being cheap)
//   I1    the inputs (class, tier, flavour, role) are the card's parts
//   A2    every ability has a variant that exists
//   A4    a key kind has a cooldown band its kind can roll (rules.cooldowns); passive and triggered have none
//   A6    no pattern twice; the number of abilities is within the tier's counts (counts.abilities); partial: a card
//         below its tier's smallest count is not reported, since G16 lets a card take only what fits
//   A7    conflicts_with, either side; A11 rules.same_mechanic pairs (pattern ids, or {pattern, variants} sides)
//   A8    an implied pattern: link is one of the card's abilities (the signature or an extra)
//   A9    a second form only from transform (rules.defaults.second_form), one entry, another class the transform
//         pattern allows, a mobility of that class with its default handling and an allowed speed, 0 or 1 weapon
//         (counts.second_form_weapons) of a family that class can use
//   A10   an adaptive weapon has 2 to 4 conditional weapons (counts.conditional_weapons) whose 'when' kind is the one the
//         implying pattern names (defaults.adaptive.when_links); it is the primary weapon, or the secondary when the
//         implying pattern requires a weapon family; no conditional weapons without an adaptive weapon
//   K-a   keys within max_keys and passive or triggered abilities within max_passive (word list tiers)
//   K-c   no seat holds more than max_keys_per_seat keys; key-bound movement sits with the driver
//   K-d   a key-bound mobility trait only where an ability on the card implies it
//   K-g   balance.keys is the key count
//   A5    every weapon and ability sits on a seat the card has; the driver owns every ability but the commander's one
//         (the last extra, else the signature); the gunner owns the secondary weapon; the primary weapon's seat follows
//         the solo fallback (defaults.primary_weapon_seat); partial for conditional and second-form weapons (the sheet
//         names no owner: only that the seat exists)
//   C4    every operating seat (defaults.seats.operating) owns a weapon or an ability
//   HC1   no card weapon has a trait the hard-control list keeps off card weapons (weapon-trait:stun)
//   HC2   a stun-class ability is at least the class's min_tier, its entry's text tier and its variant's min_tier;
//         HC6 a latch is held to its class's min_tier (t1), so it may come at T1, with its escape (HC4)
//   HC3   a stun-class ability has a kind that uses a key and the hard-control cooldown (medium or long; per-life for an
//         ultimate, rules.cooldowns.hard_control*); A4 holds a latch ability with a key kind to the same cooldowns
//   HC4   no listed variant whose escape is null; every hard-control ability's escape line (as_target[escape]) and the
//         fixed latch line for an attach delivery are in text.how_it_plays.as_target
//   HC7   every card weapon of a listed family (cryo, emp, psionic, magnetic) has its fixed escape line in as_target
//   N2    at least one countered_by link some rollable card can satisfy (worked out from the data here: N3); no link
//         that no card can satisfy is kept
//   N4    countered_by and counters are the abilities' links plus the derived links (damage types strong against the
//         armour class, nature or armour models; the flier's hits link; class:aircraft when no weapon hits air; no
//         damage link the card's nature is immune to; weapon damage types' strong_vs in counters), no repeats, all of
//         them when they are 5 or fewer, else 5 with the signature's first; partial: the order beyond "signature first"
//   M1    every strength and weakness comes from an ability's block (a variant's overrides replace it), and all of them
//         are there when they are 5 or fewer
//   M3    a strength pairs with a weakness of the same ability: in order, a further strength with the last weakness
//   M4    at most 5 entries in each of the four matchup lists (defaults.matchup_lists), signature's first
//   C3    exactly one 'who gets out' outcome, at most one 'what is left' outcome, no pair from never_together
//   S7    bail-out or pilot-eject only for a crewed machine; solo fallback only on a multi-seat crew; body count (squad 2
//         to 5, else 1, counts.body_count); passengers only when an ability implies or requires them, seats within the
//         size's cap, the kind by defaults.passengers.kinds; nature by defaults.nature (an entry whose nature the word
//         list does not allow for the card's class is passed over); availability gates
//         (counts.availability: min_spice, min_tier); unarmed only for the listed primary roles and signature
//         categories; a secondary weapon always with a gunner seat; a resource only when an ability implies or requires it
//   G5/T6 every part with a rarity is at the spice gate (effective rarity: class_rarity replaces, else a favoured part or
//         a pattern's flavour_lean counts one step more common), unless it is locked, is the input class, or meets a
//         need of the inputs or locks (the input role's word-list requires and role fit, a locked or needed pattern's
//         implies and requires) that no part at the gate on the card meets; partial: whether a part at the gate that is
//         not on the card would have fitted is not judged, except for the class (some class at the gate that can hold
//         the input role always fits when nothing is locked)
//   S4/G6 below avoided_until_spice no part the flavour avoids, unless locked or needed as above
//   S6    every variant's min_spice is at most the spice, unless the ability is locked, or its pattern is needed and no
//         variant of it within the spice fits the card's class and tier (then the least rare: defaults.spice_fallback)
//   G10   handling is the mobility's default_handling (second form too)
//   G11   a weapon's range is its family's default_range, or a range a pattern on the card implies or requires
//   G12   damage and delivery are the family's default or allowed ones (or implied); the mount is one the body allows;
//         can_target is every type the family and delivery allow (source-only types left out; high air through the
//         anti-air trait on a family that reaches low air); partial: the adaptive family has no default or allowed
//         damage, delivery or range, so those are not judged on it
//   G13   every role the card holds fits (rules.role_fit: a pattern, any link, all links; assault's range is read on the
//         primary weapon); G14 secondary roles are not the primary role and not repeated
//   B1-B3 power, complexity and cost band recomputed by the points method (rules.points); the flags are exactly the
//         warn flags that apply: cost-outside-tier (tier_bands) and off-flavour (an avoided part)
//   T-a   no word of the working name or of the signature's name word is a word of a real name (unit, faction, game
//         title, example unit names, the units' weapon names, the example games' titles); no bank word is a whole
//         source term; neither name equals a real name or a source term
//   T-b   no text field names a real game, franchise, faction or unit, a short form of a game title, or the word wiki
//         (reading in buildTextCheck: whole names, a name of several words when written as a name, a single plain
//         word only in mid-sentence, a bracketed part of an example's name as a name of its own, our own words (the
//         word lists' labels, pattern names, flavour words, class nouns) never; on the 2,713 distinct pattern lines a
//         card can show it flags 206)
//   S11   each text field is what the templates of texts.json build from the card and the data: name, pitch,
//         signature name and effect, team-play hook and its text, as_user, as_target, teammates, tells, matchup reasons,
//         counterplay, inspiration; where a pattern line fails T-b, its fallback (the next passing line of the same
//         field, or the neutral sentence) is accepted, and a counterplay line that would then show twice may show once;
//         partial: controls (one entry per bound input: the primary and secondary weapons, the signature and extras
//         that use a key, a key-bound trait no key ability implies; seats, actions and the inputs of K-f are checked,
//         which of R, Shift or Space an extra takes is not; a trait that shares its ability's button may be listed or
//         not; conditional and second-form weapons share their weapon's input and get no entry), the pitch cut (only
//         that it is cut at a word), how many source units are picked (only a subset, at most texts' max)
//
// Could not check (the sheet does not say enough, or the card does not hold it):
//   - I2, G7, T1, T2: rebuilding a card from its seed needs the generator; the card's id is a hash of an unknown key.
//   - Locks: a locked part keeps the value of an earlier roll the card does not hold, so it is only exempt from the
//     spice and avoided-part gates.
//   - G16 and A6's lower bound: whether a smaller count was all that fitted.
//   - G13's "the signature when one fits", HC5 ("kept short", in the variant's own text), A11's likeness test.
//   - Which part at the gate would have fitted where the card uses one above it (G5), beyond the class.
//   - The order of derived matchup links and of the escape lines in as_target; which input an extra ability takes;
//     whether a second form's weapon adds counters links (accepted either way).
//   - Who owns a conditional or a second-form weapon (only that the seat exists).
//   - T-a: game titles named only in the patterns' prose (no list exists in the data; the example games' titles are
//     used, and for T-b their franchises too). T-b: a single plain word that is also a real name (Spy, Engineers,
//     Generals) at the start of a sentence, unless our own text never uses the word in lower case.
//   - The adaptive family's damage, delivery and range (no default or allowed values in the data).
//   - K2 is open: a signature fired with primary fire counts as a key, as the validator counts it (countKeys).
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { validate } from './validate.mjs'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// ==================================================================== loading
/** Reads everything the checker needs from the repository under `root`. */
export function loadCheckData(root = REPO_ROOT) {
  const at = p => path.join(root, ...p.split('/'))
  const exists = p => fs.existsSync(at(p))
  const rd = p => JSON.parse(fs.readFileSync(at(p), 'utf8'))
  const ls = d => (exists(d) ? fs.readdirSync(at(d)).filter(f => f.endsWith('.json')).sort() : [])

  const terms = {}
  for (const f of ls('data/vocab')) {
    const v = rd(`data/vocab/${f}`)
    terms[v.id] = Object.fromEntries(v.terms.map(t => [t.id, t]))
  }
  const patterns = {}
  for (const f of ls('data/patterns')) {
    const p = rd(`data/patterns/${f}`)
    patterns[p.id] = p
  }
  const registry = exists('data/pattern-registry.json') ? rd('data/pattern-registry.json').patterns : []
  const data = {
    root,
    terms,
    patterns,
    registryById: Object.fromEntries(registry.map(p => [p.id, p])),
    rules: rd('data/generator/rules.json'),
    names: rd('data/generator/names.json'),
    texts: rd('data/generator/texts.json'),
    games: exists('data/games.json') ? rd('data/games.json').games : [],
    units: ls('data/units').flatMap(f => rd(`data/units/${f}`).units || []),
    manifest: exists('data/manifest.json') ? rd('data/manifest.json') : null,
    refKinds: rd('schemas/common.schema.json')['x-ref-kinds'] || {},
    dataProblems: [],
  }

  // The card schema, compiled with the validator's Ajv setup (see scripts/validate.mjs, pass 1).
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false })
  addFormats(ajv)
  ajv.addKeyword({
    keyword: 'x-vocab',
    schemaType: 'string',
    errors: true,
    validate: function check(vocabId, value) {
      if (value === null || typeof value !== 'string') return true
      if (!terms[vocabId]) { check.errors = [{ message: `unknown vocabulary '${vocabId}'` }]; return false }
      if (!terms[vocabId][value]) { check.errors = [{ message: `'${value}' is not a term of vocabulary '${vocabId}'` }]; return false }
      return true
    },
  })
  for (const k of ['x-ref-kinds', 'x-provenance', 'x-required-unless', 'x-required-when']) {
    ajv.addKeyword({ keyword: k, schemaType: k === 'x-ref-kinds' ? 'object' : 'string' })
  }
  for (const f of ls('schemas')) ajv.addSchema(rd(`schemas/${f}`))
  data.validateCardSchema = ajv.getSchema('concept-card.schema.json')
  // The three generator files must pass their schema, or nothing below can be trusted (P1).
  const genSchema = ajv.getSchema('generator.schema.json')
  for (const [kind, doc] of [['rules', data.rules], ['names', data.names], ['texts', data.texts]]) {
    if (genSchema && !genSchema(doc)) {
      for (const e of genSchema.errors) data.dataProblems.push(`data/generator/${kind}.json: ${e.instancePath || '/'} ${e.message}`)
    }
  }
  for (const [pid] of Object.entries(data.rules.defaults?.adaptive?.when_links || {})) {
    if (!patterns[pid]) data.dataProblems.push(`rules defaults.adaptive.when_links names '${pid}', which is not a pattern`)
  }
  for (const e of data.rules.hard_control?.entries || []) {
    if (e.pattern && !patterns[e.pattern]) data.dataProblems.push(`rules hard_control names '${e.pattern}', which is not a pattern`)
  }
  for (const [role, f] of Object.entries(data.rules.role_fit || {})) {
    for (const id of f.patterns || []) if (!patterns[id]) data.dataProblems.push(`rules role_fit.${role} names '${id}', which is not a pattern`)
  }
  data.sameMechanic = sameMechanicPairs(data.rules)
  for (const pair of data.sameMechanic) for (const side of pair) if (!patterns[side.pattern]) data.dataProblems.push(`rules same_mechanic names '${side.pattern}', which is not a pattern`)

  data.names_ = buildNameCheck(data)
  data.textCheck = buildTextCheck(data)
  data.isSatisfiable = buildSatisfiable(data)
  return data
}

// ==================================================================== small helpers
const parseRef = ref => {
  const i = ref.indexOf(':')
  let rest = ref.slice(i + 1), cmp = null
  if (rest.startsWith('<=') || rest.startsWith('>=')) { cmp = rest.slice(0, 2); rest = rest.slice(2) }
  return { kind: ref.slice(0, i), cmp, id: rest }
}
const rank = (data, vid, id) => data.terms[vid]?.[id]?.rank
const tierRank = (data, t) => rank(data, 'tiers', t) ?? 0
const isKeyKind = (data, kind) => data.terms['ability-kinds']?.[kind]?.uses_key === true
// The weights of a count list (index = count) or a weight map: the counts or terms whose weight is above 0.
const positive = w => (Array.isArray(w) ? w.flatMap((x, i) => (x > 0 ? [i] : [])) : Object.keys(w || {}).filter(k => typeof w[k] === 'number' && w[k] > 0))
const label = (data, vid, id) => data.terms[vid]?.[id]?.label ?? id
const eqSet = (a, b) => a.length === b.length && [...a].sort().join('\u0000') === [...b].sort().join('\u0000')

/** A11's list, read in one place: a pair of pattern ids, or of sides { pattern, variants? } (variants a list or 'all'). */
export function sameMechanicPairs(rules) {
  const side = s => (typeof s === 'string'
    ? { pattern: s, variants: null }
    : { pattern: s?.pattern ?? s?.id, variants: Array.isArray(s?.variants) ? s.variants : null })
  return (rules.same_mechanic || []).map(pair => (Array.isArray(pair) ? pair : pair?.pair || pair?.patterns || [])).filter(p => p.length === 2).map(p => p.map(side))
}

/** The generator block of one ability: the pattern's block with its variant's overrides, as the validator reads them. */
function blockOf(data, patternId, variantId) {
  const p = data.patterns[patternId]
  if (!p?.generator) return null
  const v = variantId ? p.variants.find(x => x.id === variantId) : undefined
  const o = v?.overrides || {}
  const b = { ...p.generator }
  for (const [k, x] of Object.entries(o)) if (x !== undefined) b[k] = x
  return { ...b, _pattern: p, _variant: v }
}

/** Every weapon of a card with its path: primary, secondary, conditional, and second-form weapons. */
function weaponsOf(card) {
  const A = card.parts.armament, out = []
  if (A.primary) out.push({ w: A.primary, at: '/parts/armament/primary', slot: 'primary' })
  if (A.secondary) out.push({ w: A.secondary, at: '/parts/armament/secondary', slot: 'secondary' })
  ;(A.conditional || []).forEach((c, i) => out.push({ w: c.weapon, at: `/parts/armament/conditional/${i}/weapon`, slot: 'conditional', when: c.when }))
  ;(card.parts.modes || []).forEach((m, i) => (m.armament || []).forEach((w, j) => out.push({ w, at: `/parts/modes/${i}/armament/${j}`, slot: 'mode', mode: m })))
  return out
}

// A profile is the flat set of parts typed links are matched against, as scripts/validate.mjs builds it for a card.
function profileOf(card) {
  const p = card.parts
  const weapons = [p.armament.primary, p.armament.secondary, ...(p.armament.conditional || []).map(x => x.weapon)].filter(Boolean)
  return {
    class: p.class, tier: p.tier, cost: card.balance?.cost_band, nature: p.nature, availability: p.availability,
    roles: [p.roles.primary, ...(p.roles.secondary || [])],
    mobility: p.mobility.base, handling: p.mobility.handling, traits: p.mobility.traits || [], speed: p.mobility.speed,
    body: p.body.plan, size: p.body.size, armour: p.armour.class, armourModels: p.armour.models || [],
    sight: p.sensors?.sight, sensors: p.sensors?.traits || [],
    crew: p.crew.model, passengers: p.crew.passengers?.seats || 0, resources: p.resource ? [p.resource] : [],
    weapons, patterns: [p.signature, ...(p.abilities || [])].map(a => a.pattern),
  }
}
// What kind of target the card is (N1): the mobility's target type; a tiny or small ground unit counts as infantry.
function targetType(data, P) {
  const tt = data.terms.mobility?.[P.mobility]?.target_type
  if (tt === 'ground-vehicle' && (rank(data, 'sizes', P.size) ?? 9) <= 2) return 'infantry'
  return tt
}
function cmpRank(data, vid, have, cmp, want) {
  const a = rank(data, vid, have), b = rank(data, vid, want)
  if (cmp === '<=') return a <= b
  if (cmp === '>=') return a >= b
  return have === want
}
/** N1: does the card (as a profile) satisfy a typed link? The same matching as scripts/validate.mjs. */
function matches(data, ref, P) {
  const { kind, cmp, id } = parseRef(ref)
  const W = P.weapons
  switch (kind) {
    case 'class': return P.class === id
    case 'role': return P.roles.includes(id)
    case 'tier': return cmpRank(data, 'tiers', P.tier, cmp, id)
    case 'cost': return cmpRank(data, 'cost-bands', P.cost, cmp, id)
    case 'availability': return P.availability === id
    case 'damage': return W.some(w => w.damage === id)
    case 'armour-class': return cmpRank(data, 'armour-classes', P.armour, cmp, id)
    case 'armour-model': return P.armourModels.includes(id)
    case 'weapon': return W.some(w => w.family === id)
    case 'mobility': return P.mobility === id
    case 'mobility-trait': return P.traits.includes(id)
    case 'handling': return P.handling === id
    case 'body': return P.body === id
    case 'size': return cmpRank(data, 'sizes', P.size, cmp, id)
    case 'speed': return cmpRank(data, 'speed-bands', P.speed, cmp, id)
    case 'crew': return P.crew === id
    case 'passengers': {
      const n = Number(id)
      return cmp === '>=' ? P.passengers >= n : cmp === '<=' ? P.passengers <= n : P.passengers === n
    }
    case 'mount': return W.some(w => w.mount === id)
    case 'delivery': return W.some(w => w.delivery === id)
    case 'range': return W.some(w => w.range && cmpRank(data, 'range-bands', w.range, cmp, id))
    case 'weapon-trait': return W.some(w => (w.traits || []).includes(id))
    case 'target': return targetType(data, P) === id
    case 'hits': return W.some(w => (w.can_target || []).includes(id))
    case 'sight': return cmpRank(data, 'sight-bands', P.sight, cmp, id)
    case 'sensor': return P.sensors.includes(id)
    case 'nature': return P.nature === id
    case 'category': return P.patterns.some(pid => (data.patterns[pid] || data.registryById[pid])?.category === id)
    case 'resource': return P.resources.includes(id)
    case 'pattern': return P.patterns.includes(id)
    default: return false // immune: and unit: never match a card (N1)
  }
}

// ==================================================================== K-a, K-c, K-g: the key count, in one place
/**
 * The keys of a card (K-a), per seat (K-c), and its passive or triggered abilities.
 * A key: an ability whose kind uses a key, a key-bound mobility trait, the secondary weapon. A key-bound trait that a
 * key ability on the card implies is the same button as that ability and counts once (K1, answered A; the validator
 * counts it so). Question K2 is still open: a signature that is the card's primary weapon, fired with primary fire, is
 * counted as a key, as scripts/validate.mjs counts it today. When K2 A takes effect (the card property primary_fire),
 * change it here only.
 */
export function countKeys(card, data) {
  const p = card.parts
  const abil = [p.signature, ...(p.abilities || [])]
  const perSeat = {}
  const add = seat => { perSeat[seat] = (perSeat[seat] || 0) + 1 }
  const sameButton = new Set()
  for (const a of abil) {
    if (!isKeyKind(data, a.kind)) continue
    for (const r of blockOf(data, a.pattern, a.variant)?.implies || []) if (r.startsWith('mobility-trait:')) sameButton.add(r.slice('mobility-trait:'.length))
  }
  let total = 0
  for (const a of abil) if (isKeyKind(data, a.kind)) { total++; add(a.seat) }
  // Movement traits sit with the driver (K-c).
  for (const t of p.mobility.traits || []) if (data.terms['mobility-traits']?.[t]?.uses_key && !sameButton.has(t)) { total++; add('driver') }
  if (p.armament.secondary) { total++; add(p.armament.secondary.seat) }
  return { total, perSeat, passives: abil.filter(a => !isKeyKind(data, a.kind)).length }
}

// ==================================================================== T-a: the name check
function nameTokens(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[A-Za-z0-9]+/g) || []
}
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
// The example games' titles as the patterns give them ('extra:Titanfall / Titanfall 2'); plain ids name games.json.
function exampleGameTitles(data) {
  const out = new Set()
  for (const p of Object.values(data.patterns)) {
    for (const x of [...(p.other_examples || []), ...(p.shooter_analogues || [])]) {
      if (typeof x.game === 'string' && x.game.startsWith('extra:')) for (const t of x.game.slice(6).split(' / ')) out.add(t.trim())
    }
  }
  return [...out]
}
/** T-a's sets: the words of real names, and the whole real names and source terms (normalised). */
function buildNameCheck(data) {
  const real = []
  for (const u of data.units) {
    real.push(u.name)
    for (const w of u.armament || []) if (w.name) real.push(w.name) // weapon names: added in step 3b (T-a)
  }
  for (const g of data.games) { real.push(g.title); for (const f of g.factions || []) real.push(f.name) }
  for (const p of Object.values(data.patterns)) for (const x of [...(p.other_examples || []), ...(p.shooter_analogues || [])]) if (x.unit) real.push(x.unit)
  real.push(...exampleGameTitles(data)) // game titles named in the patterns (T-a, step 3b)
  const sourceTerms = Object.values(data.patterns).flatMap(p => p.source_terms || [])
  return {
    realWords: new Set(real.flatMap(n => nameTokens(n).map(w => w.toLowerCase()).filter(w => w.length >= 3))),
    whole: new Set([...real, ...sourceTerms].map(norm).filter(Boolean)),
    sourceTerms: new Set(sourceTerms.map(norm).filter(Boolean)),
    count: { real: real.length, sourceTerms: sourceTerms.length },
  }
}

// ==================================================================== T-b: the text check
// Reading of T-b: a text names a real thing when it holds a whole real name (T-a's names plus franchises, the short
// forms of game titles and the word wiki). A name of several words counts when its words are capitalised as a name;
// a descriptive pseudo-faction such as 'Every side' does not. A single capitalised word counts in the middle of a
// sentence (plain words such as Spy or Engineers are common in lower case), and anywhere when our own texts never use
// the word in lower case (Dota, Tanya) or when it is written with inner capitals (StarCraft, WARDOGS).
const SMALL_WORDS = new Set(['of', 'the', 'and', 'a', 'an', 'in', 'on', 'for', 'to', 'de', 's', 'vs'])
function textTokens(s) {
  const t = String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  const out = []
  const re = /[A-Za-z0-9]+/g
  let m
  while ((m = re.exec(t))) {
    // A word starts a sentence after a full stop, '!', '?', ':', a quote mark or a line break; after a letter, a
    // number, a comma, a semicolon, a bracket or a dash it does not.
    let j = m.index - 1
    while (j >= 0 && /[ \t]/.test(t[j])) j--
    out.push({ w: m[0], start: j < 0 || /[.!?:"'“”‘’\n\r]/.test(t[j]) })
  }
  return out
}
function collectStrings(x, out, skip) {
  if (typeof x === 'string') out.push(x)
  else if (Array.isArray(x)) for (const v of x) collectStrings(v, out, skip)
  else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (!skip.has(k)) collectStrings(v, out, skip)
  return out
}
function buildTextCheck(data) {
  const names = []
  // A name in brackets ('Air Force General (Malcolm Granger)', 'Mobile EMP (GDI, Firestorm)') counts as a name of its
  // own, also when it is one word ('(Marines)'); a gloss in lower case ('(morph)') is dropped by the rules for one word.
  const addName = s => {
    if (typeof s !== 'string') return
    names.push(s.replace(/\([^)]*\)/g, ' ').replace(/["“”]/g, ' ').trim())
    for (const m of s.matchAll(/\(([^)]*)\)/g)) for (const part of m[1].split(/[,;]/)) if (nameTokens(part).length) names.push(part.trim())
  }
  for (const u of data.units) addName(u.name)
  for (const g of data.games) {
    addName(g.title)
    addName(g.franchise)
    for (const f of g.factions || []) addName(f.name)
    // short forms of the title: its parts around ':', '(', ')', '/' and ' - '
    for (const part of g.title.split(/[:()/]| - /)) addName(part.trim())
  }
  for (const p of Object.values(data.patterns)) {
    for (const x of [...(p.other_examples || []), ...(p.shooter_analogues || [])]) { addName(x.unit); addName(x.franchise) }
  }
  for (const t of exampleGameTitles(data)) { addName(t); for (const part of t.split(/[:()/]| - /)) addName(part.trim()) }
  // Our own texts, to tell plain words from names: every word they use in lower case.
  const corpus = []
  const skip = new Set(['other_examples', 'shooter_analogues', 'source_terms', 'sources', 'seen_in', 'aliases', 'name', 'review'])
  for (const p of Object.values(data.patterns)) collectStrings(p, corpus, skip)
  for (const tm of Object.values(data.terms)) for (const t of Object.values(tm)) collectStrings([t.description, t.label], corpus, skip)
  collectStrings(data.texts, corpus, new Set())
  const lower = new Set(corpus.flatMap(s => nameTokens(s)).filter(w => w === w.toLowerCase()))

  // Our own words are not real names in a text (sheet section 18): the labels of the word lists, the patterns' names,
  // and the flavour words and class nouns that the pitch writes. 'EMP' is a label of ours as well as a bracketed gloss.
  const own = new Set()
  for (const tm of Object.values(data.terms)) for (const t of Object.values(tm)) if (typeof t.label === 'string') own.add(t.label)
  for (const p of Object.values(data.patterns)) if (typeof p.name === 'string') own.add(p.name)
  for (const style of Object.values(data.names || {})) {
    if (!style || typeof style !== 'object') continue
    if (typeof style.flavour_word === 'string') own.add(style.flavour_word)
    for (const noun of Object.values(style.class_nouns || {})) if (typeof noun === 'string') own.add(noun)
  }
  const byFirst = new Map()
  const seen = new Set()
  for (const n of names) {
    if (own.has(n)) continue
    const toks = nameTokens(n)
    if (!toks.length || !toks.some(w => /[A-Za-z]/.test(w))) continue
    const key = toks.join(' ')
    if (seen.has(key)) continue
    let kind
    if (toks.length > 1) {
      // a name of several words: every word but the small ones capitalised (or a number)
      if (!toks.every(w => SMALL_WORDS.has(w) || /^[A-Z0-9]/.test(w))) continue
      kind = 'phrase'
    } else {
      const w = toks[0]
      if (w.length < 3 || !/^[A-Z]/.test(w)) continue
      kind = /[A-Z0-9]/.test(w.slice(1)) || !lower.has(w.toLowerCase()) ? 'proper' : 'plain'
    }
    seen.add(key)
    if (!byFirst.has(toks[0])) byFirst.set(toks[0], [])
    byFirst.get(toks[0]).push({ toks, kind, name: n })
  }
  const cache = new Map()
  function leaks(s) {
    if (typeof s !== 'string' || !s) return []
    if (cache.has(s)) return cache.get(s)
    const toks = textTokens(s)
    const found = []
    toks.forEach((t, i) => {
      if (t.w.toLowerCase() === 'wiki') found.push('wiki')
      for (const ph of byFirst.get(t.w) || []) {
        if (ph.kind === 'plain' && t.start) continue
        if (ph.toks.every((w, k) => toks[i + k]?.w === w)) found.push(ph.toks.join(' '))
      }
    })
    const res = [...new Set(found)]
    cache.set(s, res)
    return res
  }
  return { leaks, size: seen.size }
}

// ==================================================================== N3: which links some card can satisfy
function buildSatisfiable(data) {
  const T = data.terms, R = data.rules
  const live = vid => Object.values(T[vid] || {}).filter(t => !t.source_only).map(t => t.id)
  const classes = live('classes')
  const forSomeClass = t => !t.classes || t.classes.some(c => classes.includes(c))
  const families = Object.values(T['weapon-families'] || {}).filter(t => !t.source_only && forSomeClass(t))
  const mobilities = Object.values(T.mobility || {}).filter(t => !t.source_only && forSomeClass(t))
  const hc = R.hard_control || {}
  const variantOffered = (p, v) => {
    const b = blockOf(data, p.id, v.id)
    if (!b || !(b.classes || []).some(c => classes.includes(c))) return false
    const e = hcEntry(data, p.id, v.id)
    if (e && e.escape === null) return false
    if (e && hc.classes?.[e.class]?.key_kinds_only && !b.kinds.some(k => isKeyKind(data, k))) return false
    return true
  }
  const placeable = Object.values(data.patterns).filter(p => p.generator && !['merged', 'rejected'].includes(p.status) && p.variants.some(v => variantOffered(p, v)))
  const blocks = placeable.flatMap(p => [p.generator, ...p.variants.map(v => v.overrides || {})])
  const linksOf = k => blocks.flatMap(b => [...(b.implies || []), ...(b.requires || []).flat()]).filter(r => r.startsWith(`${k}:`)).map(r => parseRef(r).id)
  const neverOnWeapon = (hc.entries || []).filter(e => e.never_on_card_weapon && e.term?.startsWith('weapon-trait:')).map(e => e.term.split(':')[1])
  const targets = new Set(mobilities.map(m => m.target_type).filter(Boolean))
  if (mobilities.some(m => m.target_type === 'ground-vehicle')) targets.add('infantry')
  const hits = new Set(families.flatMap(f => f.allowed?.['target-types'] || live('target-types')))
  if (families.some(f => (f.allowed?.['target-types'] || []).includes('low-air'))) hits.add('high-air') // the anti-air trait
  for (const t of Object.values(T['target-types'] || {})) if (t.source_only) hits.delete(t.id)
  // cost: the sums the points method can reach (B3)
  const ptsCost = placeable.map(p => patternPoints(data, p, 'active').cost)
  const partsMax = ['armour_class', 'speed', 'best_weapon_range', 'size', 'secondary_weapon', 'availability', 'passenger_seats']
    .reduce((s, k) => { const x = R.points?.parts?.[k]?.cost; return s + (typeof x === 'number' ? x : Math.max(0, ...Object.values(x || {}))) }, 0)
  const maxAbilities = Math.max(...Object.values(R.counts?.abilities || { t: [0, 1] }).map(w => Math.max(...positive(w))))
  const costMin = Math.min(...ptsCost), costMax = [...ptsCost].sort((a, b) => b - a).slice(0, maxAbilities).reduce((s, x) => s + x, 0) + partsMax
  const bands = Object.entries(R.points?.cost_bands || {}).filter(([, b]) => b.min <= costMax && (b.max === undefined || b.max >= costMin)).map(([id]) => id)
  const maxSeats = Math.max(0, ...Object.values(R.defaults?.passengers?.caps || {}))
  const vals = {
    class: classes, tier: live('tiers'), cost: bands, availability: live('availability'),
    damage: [...new Set(families.flatMap(f => [f.default_damage, ...(f.allowed?.['damage-types'] || [])]).filter(Boolean))],
    'armour-class': live('armour-classes'), 'armour-model': Object.values(T['armour-models'] || {}).filter(forSomeClass).map(t => t.id),
    weapon: families.map(f => f.id), mobility: mobilities.map(m => m.id), 'mobility-trait': live('mobility-traits'),
    handling: [...new Set(mobilities.map(m => m.default_handling).filter(Boolean))], // G10
    body: Object.values(T.bodies || {}).filter(t => !t.source_only && forSomeClass(t)).map(t => t.id), size: live('sizes'),
    speed: [...new Set(mobilities.flatMap(m => m.allowed?.['speed-bands'] || []))], crew: live('crew-models'), mount: live('aim-models'),
    delivery: [...new Set([...families.flatMap(f => [f.default_delivery, ...(f.allowed?.['weapon-delivery'] || [])]), ...linksOf('delivery')].filter(Boolean))],
    range: [...new Set([...families.map(f => f.default_range), ...linksOf('range')].filter(Boolean))], // G11
    'weapon-trait': live('weapon-traits').filter(t => !neverOnWeapon.includes(t)), // HC1
    target: [...targets].filter(t => live('target-types').includes(t)), hits: [...hits],
    sight: live('sight-bands'), sensor: Object.values(T['sensor-traits'] || {}).filter(forSomeClass).map(t => t.id), nature: live('nature'),
    category: [...new Set(placeable.map(p => p.category))], resource: [...new Set(linksOf('resource'))], pattern: placeable.map(p => p.id),
  }
  const ranked = { tier: 'tiers', cost: 'cost-bands', 'armour-class': 'armour-classes', size: 'sizes', speed: 'speed-bands', range: 'range-bands', sight: 'sight-bands' }
  function sat(ref, depth = 0) {
    const { kind, cmp, id } = parseRef(ref)
    if (kind === 'passengers') {
      const n = Number(id)
      return Array.from({ length: maxSeats + 1 }, (_, i) => i).some(i => (cmp === '>=' ? i >= n : cmp === '<=' ? i <= n : i === n))
    }
    if (kind === 'role') {
      const t = T.roles?.[id]
      if (!t || depth > 2) return !!t
      if (t.classes && !t.classes.some(c => classes.includes(c))) return false
      if (!(t.requires || []).every(g => g.some(r => sat(r, depth + 1)))) return false
      const f = R.role_fit?.[id]
      if (f?.patterns && !f.patterns.some(pid => vals.pattern.includes(pid))) return false
      if (f?.any && !f.any.some(r => sat(r, depth + 1))) return false
      if (f?.all && !f.all.every(r => sat(r, depth + 1))) return false
      return true
    }
    const list = vals[kind]
    if (!list) return false // immune:, unit: and unknown kinds never match a card
    if (ranked[kind] && cmp) return list.some(v => cmpRank(data, ranked[kind], v, cmp, id))
    return list.includes(id)
  }
  const cache = new Map()
  return ref => { if (!cache.has(ref)) cache.set(ref, sat(ref)); return cache.get(ref) }
}

// ==================================================================== hard control (section 6)
function hcEntry(data, patternId, variantId) {
  for (const e of data.rules.hard_control?.entries || []) {
    if (e.pattern !== patternId) continue
    if (e.variants === 'all' ? !(e.except || []).includes(variantId) : (e.variants || []).includes(variantId)) return e
  }
  return null
}

// ==================================================================== B1-B3: the points method (section 10)
function patternPoints(data, p, kind) {
  const PT = data.rules.points.pattern
  let pts
  if (PT.stored_wins && p.generator?.points) pts = { ...p.generator.points }
  else {
    const get = (o, dotted) => dotted.split('.').reduce((x, k) => x?.[k], o)
    const power = PT.scale[get(p, PT.power)] ?? 0
    const round = PT.cost_rounding === 'up' ? Math.ceil : Math.floor
    pts = { cost: round(power / PT.cost_divisor), power, complexity: PT.scale[get(p, PT.complexity)] ?? 0 }
  }
  if (kind === 'ultimate') pts.power = Math.min(PT.max, pts.power + PT.ultimate_bonus)
  return pts
}
/** The balance block a rolled card must carry (B1 to B3), from its parts. */
export function computeBalance(card, data) {
  const PT = data.rules.points, p = card.parts, A = p.armament
  const weapons = [A.primary, A.secondary, ...(A.conditional || []).map(c => c.weapon)].filter(Boolean)
  const best = weapons.map(w => w.range).filter(Boolean).sort((a, b) => rank(data, 'range-bands', b) - rank(data, 'range-bands', a))[0]
  const val = (part, score, term) => {
    const x = PT.parts?.[part]?.[score]
    if (typeof x === 'number') return term ? x : 0
    return (term && x?.[term]) || 0
  }
  const parts = score => val('armour_class', score, p.armour.class) + val('speed', score, p.mobility.speed) + val('best_weapon_range', score, best) +
    val('size', score, p.body.size) + val('secondary_weapon', score, !!A.secondary) + val('availability', score, p.availability) +
    val('passenger_seats', score, !!p.crew.passengers)
  const abil = [p.signature, ...(p.abilities || [])]
  const pts = abil.map(a => (data.patterns[a.pattern]?.generator ? patternPoints(data, data.patterns[a.pattern], a.kind) : { cost: 0, power: 0, complexity: 0 }))
  const clamp = (v, s) => Math.max(s.min, Math.min(s.max, v))
  const keys = countKeys(card, data).total
  const seats = (data.terms['crew-models'][p.crew.model]?.seats || []).filter(s => (data.rules.defaults.seats?.operating || []).includes(s)).length
  const C = PT.complexity
  const power = clamp(pts.reduce((s, x) => s + x.power - PT.power.ability_minus, 0) + parts('power'), PT.power)
  const complexity = clamp(pts.reduce((s, x) => s + x.complexity - C.ability_minus, 0) + keys * C.per_key + seats * C.per_operating_seat +
    (p.crew.model === 'squad' ? C.squad : 0) + ((p.modes || []).length ? C.second_form : 0) + parts('complexity'), C)
  const cost = pts.reduce((s, x) => s + x.cost, 0) + parts('cost')
  const band = Object.entries(PT.cost_bands).find(([, b]) => cost >= b.min && (b.max === undefined || cost <= b.max))?.[0]
  return { power, complexity, cost, cost_band: band, keys }
}

// ==================================================================== text helpers (section 11)
const firstSentence = s => { const m = String(s).match(/^.*?[.!?](?=\s|$)/s); return m ? m[0] : String(s) }
// A field's lines with T-b applied: the line at the template's place if it passes, else the next line of the same
// field that passes, else the neutral sentence (T-b).
function passingFrom(data, lines, from, neutral) {
  for (let i = from; i < (lines || []).length; i++) if (!data.textCheck.leaks(lines[i]).length) return lines[i]
  return neutral
}
// Does `text` equal the components in order, each one of its accepted strings ('' = left out), joined by spaces?
function sequenceMatches(text, components) {
  const go = (rest, k) => {
    if (k === components.length) return rest === ''
    for (const opt of components[k]) {
      if (opt === '') { if (go(rest, k + 1)) return true; continue }
      if (rest === opt && go('', k + 1)) return true
      if (rest.startsWith(opt + ' ') && go(rest.slice(opt.length + 1), k + 1)) return true
    }
    return false
  }
  return go(text, 0)
}

// ==================================================================== the checks
/** The problems of one rolled card: [{ code, path, message }]. An empty list means the card passes. */
export function checkCard(card, data) {
  const out = []
  const add = (code, at, message) => out.push({ code, path: at, message })
  if (!data.validateCardSchema(card)) {
    for (const e of data.validateCardSchema.errors) {
      add('CS', e.instancePath || '/', `${e.message}${e.params?.allowedValues ? ' ' + JSON.stringify(e.params.allowedValues) : ''}`)
    }
    return out // the rule checks rely on the shape, as in the validator
  }
  const ctx = context(card, data)
  for (const check of CHECKS) {
    try { check(ctx, add) } catch (e) { add('internal', '/', `the ${check.name} check stopped: ${e.message}`) }
  }
  return out
}

function context(card, data) {
  const p = card.parts
  const abil = [p.signature, ...(p.abilities || [])].map((a, i) => ({
    a, i, at: i === 0 ? '/parts/signature' : `/parts/abilities/${i - 1}`,
    pattern: data.patterns[a.pattern], block: blockOf(data, a.pattern, a.variant), hc: hcEntry(data, a.pattern, a.variant),
  }))
  return { card, data, p, abil, weapons: weaponsOf(card), P: profileOf(card), keys: countKeys(card, data), tier: tierRank(data, p.tier) }
}

// G8: the data version of the roll.
function checkDataVersion({ card, data }, add) {
  if (data.manifest && card.generator.data_version !== data.manifest.data_version) {
    add('G8', '/generator/data_version', `data version '${card.generator.data_version}' is not the data's '${data.manifest.data_version}' (data/manifest.json)`)
  }
}

// I1: a class, tier, flavour or role you choose is always used (the input role is the primary role, rolled at step 3).
function checkInputs({ card, p }, add) {
  for (const k of ['class', 'tier', 'flavour']) {
    if (card.inputs[k] != null && card.inputs[k] !== p[k]) add('I1', `/parts/${k}`, `the input ${k} '${card.inputs[k]}' was not used ('${p[k]}')`)
  }
  if (card.inputs.role != null && card.inputs.role !== p.roles.primary) add('I1', '/parts/roles/primary', `the input role '${card.inputs.role}' is not the primary role ('${p.roles.primary}')`)
}

// A2, A4, A6, A7, A8, A11: the abilities and their patterns.
function checkAbilities({ data, p, abil, tier }, add) {
  const R = data.rules
  for (const x of abil) {
    if (x.a.variant == null) add('A2', `${x.at}/variant`, `a rolled card always has a variant (pattern '${x.a.pattern}')`)
    else if (x.pattern && !x.pattern.variants.some(v => v.id === x.a.variant)) add('A2', `${x.at}/variant`, `'${x.a.variant}' is not a variant of '${x.a.pattern}'`)
    if (x.hc) continue // the hard-control cooldown is checked with section 6
    if (isKeyKind(data, x.a.kind)) {
      const bands = positive(R.cooldowns?.[x.a.kind])
      if (!bands.includes(x.a.cooldown)) add('A4', `${x.at}/cooldown`, `a '${x.a.kind}' ability takes a cooldown of ${bands.join(' or ')}, not ${x.a.cooldown}`)
    } else if (x.a.cooldown !== null) add('A4', `${x.at}/cooldown`, `a '${x.a.kind}' ability takes no cooldown`)
  }
  // A6: never the same pattern twice; the total within the tier's counts.
  const ids = abil.map(x => x.a.pattern)
  ids.forEach((id, i) => { if (ids.indexOf(id) !== i) add('A6', `${abil[i].at}/pattern`, `pattern '${id}' is on the card twice`) })
  const counts = positive(R.counts?.abilities?.[p.tier])
  if (counts.length && abil.length > Math.max(...counts)) add('A6', '/parts/abilities', `${abil.length} abilities; a ${p.tier} card has at most ${Math.max(...counts)}`)
  // A7: conflicts_with, whichever side lists it.
  for (let i = 0; i < abil.length; i++) {
    for (let j = i + 1; j < abil.length; j++) {
      const [a, b] = [abil[i], abil[j]]
      if ((a.pattern?.generator?.conflicts_with || []).includes(b.a.pattern) || (b.pattern?.generator?.conflicts_with || []).includes(a.a.pattern)) {
        add('A7', b.at, `patterns '${a.a.pattern}' and '${b.a.pattern}' conflict`)
      }
      // A11: one mechanic under two names is treated like conflicts_with.
      for (const [s, t] of data.sameMechanic) {
        const on = (side, x) => side.pattern === x.a.pattern && (!side.variants || side.variants.includes(x.a.variant))
        if ((on(s, a) && on(t, b)) || (on(s, b) && on(t, a))) add('A11', b.at, `'${a.a.pattern}' and '${b.a.pattern}' are one mechanic under two names (rules same_mechanic)`)
      }
    }
  }
  // A8: an implied pattern is one of the card's extra abilities.
  for (const x of abil) {
    for (const r of x.block?.implies || []) {
      if (!r.startsWith('pattern:')) continue
      const id = r.slice('pattern:'.length)
      if (!abil.some(y => y.a.pattern === id)) add('A8', x.at, `'${x.a.pattern}' implies pattern '${id}', which is not one of the card's abilities`)
    }
  }
}

// K-a, K-c, K-d, K-g: the key budget.
function checkKeys({ data, card, p, abil, keys }, add) {
  const t = data.terms.tiers[p.tier] || {}
  if (keys.total > t.max_keys) add('K-a', '/balance/keys', `${keys.total} keys; a ${p.tier} card has ${t.max_keys}`)
  if (keys.passives > t.max_passive) add('K-a', '/parts/abilities', `${keys.passives} passive or triggered abilities; a ${p.tier} card has ${t.max_passive}`)
  if (card.balance.keys !== keys.total) add('K-g', '/balance/keys', `balance.keys says ${card.balance.keys}, the key count is ${keys.total}`)
  for (const [seat, n] of Object.entries(keys.perSeat)) {
    if (n > t.max_keys_per_seat) add('K-c', '/parts/crew/model', `the ${seat} seat holds ${n} keys; a seat holds at most ${t.max_keys_per_seat}`)
  }
  ;(p.mobility.traits || []).forEach((tr, i) => {
    if (!data.terms['mobility-traits']?.[tr]?.uses_key) return
    if (!abil.some(x => (x.block?.implies || []).includes(`mobility-trait:${tr}`))) {
      add('K-d', `/parts/mobility/traits/${i}`, `key-bound trait '${tr}' without an ability on the card that implies it`)
    }
  })
}

// A5, C4 and section 7's seat rows: who owns what.
function checkSeats({ data, p, abil, weapons }, add) {
  const D = data.rules.defaults
  const crew = data.terms['crew-models'][p.crew.model] || {}
  const seats = crew.seats || []
  const exists = [...seats, ...(p.crew.passengers ? [p.crew.passengers.kind] : [])]
  for (const { w, at } of weapons) if (!exists.includes(w.seat)) add('A5', `${at}/seat`, `seat '${w.seat}' is not a seat of this card (${exists.join(', ')})`)
  // The driver owns every ability and weapon but what defaults.seats gives an operating seat: the commander one ability
  // (the last extra, or the signature when there is no extra), the gunner the secondary weapon (A5, C4).
  const owner = new Map() // ability index or 'secondary-weapon' -> seat
  for (const s of seats.filter(x => (D.seats?.operating || []).includes(x))) {
    for (const slot of D.seats?.[s] || []) {
      if (slot === 'secondary-weapon') { owner.set(slot, s); break }
      if (slot === 'last-extra' && abil.length > 1) { owner.set(abil.length - 1, s); break }
      if (slot === 'signature') { owner.set(0, s); break }
    }
  }
  for (const x of abil) {
    const want = owner.get(x.i) || 'driver'
    if (x.a.seat !== want) add('A5', `${x.at}/seat`, `this ability belongs to the ${want} seat, not '${x.a.seat}'`)
  }
  const A = p.armament
  if (A.primary) {
    const multi = (crew.max_players || 1) > 1
    const want = multi ? D.primary_weapon_seat?.[p.crew.solo_fallback] : 'driver'
    if (want && A.primary.seat !== want) add('A5', '/parts/armament/primary/seat', `the primary weapon belongs to the ${want} seat${multi ? ` (solo fallback ${p.crew.solo_fallback})` : ''}, not '${A.primary.seat}'`)
  }
  const gunner = owner.get('secondary-weapon')
  if (A.secondary) {
    const want = gunner || 'driver'
    if (A.secondary.seat !== want) add('A5', '/parts/armament/secondary/seat', `the secondary weapon belongs to the ${want} seat, not '${A.secondary.seat}'`)
  } else if (gunner && D.secondary_weapon?.always_with === gunner) add('S7', '/parts/armament/secondary', `a card with a ${gunner} seat always has a secondary weapon`)
  // C4: every operating seat owns a weapon or an ability.
  for (const s of seats.filter(x => (D.seats?.operating || []).includes(x))) {
    if (!weapons.some(x => x.w.seat === s) && !abil.some(x => x.a.seat === s)) add('C4', '/parts/crew/model', `the ${s} seat owns no weapon or ability (idle seat)`)
  }
}

// HC1 to HC4, HC7, and A4 for latches: hard control.
function checkHardControl({ data, card, p, abil, weapons, tier }, add) {
  const HC = data.rules.hard_control || {}, X = data.texts
  const asTarget = card.text.how_it_plays.as_target
  const need = [] // [code, path, line, what]
  const keptOff = (HC.entries || []).filter(e => e.never_on_card_weapon && e.term?.startsWith('weapon-trait:')).map(e => e.term.split(':')[1])
  const latchDelivery = (HC.entries || []).filter(e => e.term?.startsWith('delivery:') && e.escape_line)
  for (const { w, at } of weapons) {
    ;(w.traits || []).forEach((t, i) => { if (keptOff.includes(t)) add('HC1', `${at}/traits/${i}`, `weapon trait '${t}' is never rolled on a card weapon (a weapon has no cooldown)`) })
    for (const e of latchDelivery) if (w.delivery === e.term.split(':')[1]) need.push(['HC4', at, X.escapes?.[e.escape_line], `delivery '${w.delivery}'`])
    if ((HC.weapon_families?.families || []).includes(w.family)) need.push(['HC7', at, X.escapes?.[w.family], `a ${w.family} weapon`])
  }
  for (const x of abil) {
    if (!x.hc) continue
    const cls = HC.classes?.[x.hc.class] || {}
    const what = `'${x.a.pattern}' (${x.a.variant}, ${x.hc.class})`
    if (x.hc.escape === null) add('HC4', x.at, `${what} states no escape, so it is never offered`)
    if (cls.key_kinds_only && !isKeyKind(data, x.a.kind)) add('HC3', `${x.at}/kind`, `${what} takes a kind that uses a key, not '${x.a.kind}'`)
    const minTiers = [cls.min_tier, x.hc.min_tier, x.block?.min_tier].filter(Boolean)
    const needTier = minTiers.reduce((m, t) => Math.max(m, tierRank(data, t)), 0)
    if (tier < needTier) add('HC2', x.at, `${what} needs tier ${minTiers.find(t => tierRank(data, t) === needTier)} or higher`)
    if (isKeyKind(data, x.a.kind)) {
      const bands = positive(x.a.kind === 'ultimate' ? data.rules.cooldowns?.hard_control_ultimate : data.rules.cooldowns?.hard_control)
      if (!bands.includes(x.a.cooldown)) add(x.hc.class === 'stun' ? 'HC3' : 'A4', `${x.at}/cooldown`, `${what} takes a cooldown of ${bands.join(' or ')}, not ${x.a.cooldown}`)
    } else if (x.a.cooldown !== null) add('A4', `${x.at}/cooldown`, `a '${x.a.kind}' ability takes no cooldown`)
    if (x.hc.escape !== null && x.hc.escape !== undefined) need.push(['HC4', x.at, x.pattern?.player_translation?.as_target?.[x.hc.escape], what])
  }
  for (const [code, at, line, what] of need) {
    if (!line) continue
    if (!asTarget.includes(line)) add(code, '/text/how_it_plays/as_target', `the escape for ${what} (at ${at}) is missing: '${line}'`)
  }
}

// N2 and N4: the counter lists. Returns nothing; S11 for the reasons is checked here as well.
function expectedCounterLists(ctx) {
  const { data, p, abil, P, weapons } = ctx
  const D = data.rules.defaults, X = data.texts, T = data.terms
  const why = (rel, list) => (data.textCheck.leaks(rel.why).length ? X.neutral?.[list] : rel.why)
  const by = []
  for (const x of abil) for (const rel of x.block?.countered_by || []) by.push({ ref: rel.ref, why: why(rel, 'countered_by'), src: x.i })
  for (const [dt, t] of Object.entries(T['damage-types'] || {})) {
    const names = (t.strong_vs || []).filter(l => {
      const { kind, id } = parseRef(l)
      if (!(D.derived_links?.damage_vs || []).includes(kind)) return false
      return (kind === 'armour-class' && id === p.armour.class) || (kind === 'nature' && id === p.nature) || (kind === 'armour-model' && (p.armour.models || []).includes(id))
    })
    if (names.length) by.push({ ref: `damage:${dt}`, why: X.derived_reasons?.damage, src: 'parts' })
  }
  const tt = targetType(data, P)
  if (D.derived_links?.flier_hits?.[tt]) by.push({ ref: D.derived_links.flier_hits[tt], why: X.derived_reasons?.[parseRef(D.derived_links.flier_hits[tt]).kind], src: 'parts' })
  const hitsAir = P.weapons.some(w => (w.can_target || []).some(t => t === 'low-air' || t === 'high-air'))
  if (!hitsAir && D.derived_links?.no_air_weapon) by.push({ ref: D.derived_links.no_air_weapon, why: X.derived_reasons?.[parseRef(D.derived_links.no_air_weapon).kind], src: 'parts' })
  const dropped = []
  const keptBy = []
  for (const e of by) {
    const { kind, id } = parseRef(e.ref)
    if (kind === 'damage' && D.derived_links?.drop_immune && (T['damage-types'][id]?.immune || []).includes(`nature:${p.nature}`)) { dropped.push({ ...e, reason: `the card's nature '${p.nature}' is immune to ${id}` }); continue }
    if (D.counter_check?.drop_unsatisfiable && !data.isSatisfiable(e.ref)) { dropped.push({ ...e, unsatisfiable: true, reason: 'no card can satisfy it (N3)' }); continue }
    if (!keptBy.some(k => k.ref === e.ref)) keptBy.push(e)
  }
  const counters = []
  for (const x of abil) for (const rel of x.block?.counters || []) counters.push({ ref: rel.ref, why: why(rel, 'counters'), src: x.i })
  if (D.derived_links?.counters_from_damage) {
    // The card's weapons as the validator reads them (primary, secondary, conditional). Whether a second form's weapon
    // counts is not said, so its links are allowed but not required.
    const dts = slots => [...new Set(weapons.filter(x => slots.includes(x.slot)).map(x => x.w.damage).filter(Boolean))]
    for (const dt of dts(['primary', 'secondary', 'conditional'])) for (const l of T['damage-types'][dt]?.strong_vs || []) counters.push({ ref: l, why: X.derived_reasons?.[parseRef(l).kind], src: 'parts' })
    for (const dt of dts(['mode'])) for (const l of T['damage-types'][dt]?.strong_vs || []) counters.push({ ref: l, why: X.derived_reasons?.[parseRef(l).kind], src: 'parts', optional: true })
  }
  const keptCounters = []
  for (const e of counters) if (!keptCounters.some(k => k.ref === e.ref)) keptCounters.push(e)
  return { countered_by: keptBy, counters: keptCounters, dropped }
}
// Checks one derived list against what the card holds (N4, M4), and each reason (S11). Links in `skip` are reported
// by the caller.
function compareList(card, list, expected, max, add, skip = new Set()) {
  const code = 'N4'
  const have = card.matchups[list]
  const at = `/matchups/${list}`
  const seen = new Set()
  have.forEach((e, i) => {
    if (seen.has(e.ref)) add(code, `${at}/${i}`, `${e.ref} is listed twice`)
    seen.add(e.ref)
    const x = expected.find(y => y.ref === e.ref)
    if (!x) { if (!skip.has(e.ref)) add(code, `${at}/${i}`, `${e.ref} comes from no ability on the card and from none of its parts`) }
    else if (x.why !== undefined && e.why !== x.why) add('S11', `${at}/${i}/why`, `the reason for ${e.ref} should be '${x.why}'`)
  })
  const required = expected.filter(x => !x.optional)
  if (required.length <= max) {
    for (const x of required) if (!have.some(e => e.ref === x.ref)) add(code, at, `${x.ref} is missing (from ${x.src === 'parts' ? "the card's parts" : `ability ${x.src}`})`)
  } else {
    if (have.length !== max) add(code, at, `${have.length} entries; with ${required.length} links the list keeps ${max}`)
    const sig = expected.filter(x => x.src === 0).slice(0, max)
    for (const x of sig) if (!have.some(e => e.ref === x.ref)) add('M4', at, `the signature's ${x.ref} is missing (signature first)`)
  }
  // the signature's entries come first (entries reported above as foreign are left out of this)
  const srcs = have.map(e => expected.find(y => y.ref === e.ref)?.src).filter(s => s !== undefined)
  const firstOther = srcs.findIndex(s => s !== 0)
  if (firstOther >= 0 && srcs.slice(firstOther).includes(0)) add('M4', at, "the signature's entries must come first")
}
function checkCounters(ctx, add) {
  const { data, card } = ctx
  const max = data.rules.defaults.matchup_lists?.max
  const exp = expectedCounterLists(ctx)
  for (const list of ['countered_by', 'counters']) {
    if (card.matchups[list].length > max) add('M4', `/matchups/${list}`, `${card.matchups[list].length} entries; at most ${max}`)
  }
  // Links no card can satisfy never stay on a card (N2), wherever they come from; a damage link the card's nature is
  // immune to is dropped too (N4).
  const dropped = new Set()
  card.matchups.countered_by.forEach((e, i) => {
    if (!data.isSatisfiable(e.ref)) { dropped.add(e.ref); add('N2', `/matchups/countered_by/${i}`, `${e.ref} must be dropped: no card can satisfy it (N3)`) }
  })
  for (const d of exp.dropped) {
    if (d.unsatisfiable || dropped.has(d.ref)) continue
    dropped.add(d.ref)
    const i = card.matchups.countered_by.findIndex(e => e.ref === d.ref)
    if (i >= 0) add('N4', `/matchups/countered_by/${i}`, `${d.ref} must be dropped: ${d.reason}`)
  }
  compareList(card, 'countered_by', exp.countered_by, max, add, dropped)
  compareList(card, 'counters', exp.counters, max, add)
  if (!card.matchups.countered_by.some(e => data.isSatisfiable(e.ref))) add('N2', '/matchups/countered_by', 'no counter that some card can satisfy (no-counter)')
}

// M1, M3, M4: strengths and weaknesses come from the abilities, paired within one ability.
function checkStrengths({ data, card, abil }, add) {
  const X = data.texts
  const max = data.rules.defaults.matchup_lists?.max
  const M = card.matchups
  const entries = list => abil.flatMap(x => (x.block?.[list === 'strengths' ? 'adds_strengths' : 'adds_weaknesses'] || []).map((rel, k) => ({
    ref: rel.ref, why: data.textCheck.leaks(rel.why).length ? X.neutral?.[list] : rel.why, src: x.i, k,
  })))
  const ES = entries('strengths'), EW = entries('weaknesses')
  const sources = (list, E) => M[list].map(e => E.filter(x => x.ref === e.ref && x.why === e.why))
  const SS = sources('strengths', ES), SW = sources('weaknesses', EW)
  for (const [list, E, S] of [['strengths', ES, SS], ['weaknesses', EW, SW]]) {
    if (M[list].length > max) add('M4', `/matchups/${list}`, `${M[list].length} entries; at most ${max}`)
    S.forEach((src, i) => { if (!src.length) add('M1', `/matchups/${list}/${i}`, `${M[list][i].ref} ('${M[list][i].why}') comes from no ability on the card (parts add none)`) })
    const found = new Set(S.flat())
    if (E.length <= max) {
      for (const x of E) if (!found.has(x)) add('M1', `/matchups/${list}`, `${x.ref} of ability ${x.src} ('${x.why}') is missing`)
    } else if (M[list].length !== max) add('M1', `/matchups/${list}`, `${M[list].length} entries; with ${E.length} the list keeps ${max}`)
    const firstOther = S.findIndex(src => src.length && !src.some(x => x.src === 0))
    if (firstOther >= 0 && S.slice(firstOther).some(src => src.some(x => x.src === 0) && !src.some(x => x.src !== 0))) add('M4', `/matchups/${list}`, "the signature's entries must come first")
  }
  // M3: within one ability, strength k pairs with weakness k, a further strength with the last weakness.
  M.strengths.forEach((s, i) => {
    const w = M.weaknesses[s.paired_with]
    if (!w) return // a missing weakness is the validator's error
    const ok = SS[i].some(x => {
      const ws = EW.filter(y => y.src === x.src)
      if (!ws.length) return false
      const partner = ws[Math.min(x.k, ws.length - 1)]
      return SW[s.paired_with].includes(partner)
    })
    if (!ok && SS[i].length) add('M3', `/matchups/strengths/${i}/paired_with`, `${s.ref} is paired with ${w.ref}, which is not its partner in the same ability`)
    else if (!SS[i].length) add('M3', `/matchups/strengths/${i}/paired_with`, `${s.ref} comes from no ability, so its pair is not from one ability`)
  })
}

// C3 and section 7's on-death row.
function checkDeath({ data, p }, add) {
  const od = data.rules.defaults.on_death || {}
  const outs = p.on_death
  const who = outs.filter(o => (od.who_gets_out || []).includes(o)), left = outs.filter(o => (od.what_is_left || []).includes(o))
  if (who.length !== 1) add('C3', '/parts/on_death', `${who.length} 'who gets out' outcomes (${(od.who_gets_out || []).join(', ')}); a card has exactly one`)
  if (left.length > 1) add('C3', '/parts/on_death', `${left.length} 'what is left' outcomes; at most one`)
  outs.forEach((o, i) => {
    if (!who.includes(o) && !left.includes(o)) add('C3', `/parts/on_death/${i}`, `'${o}' is in neither group of outcomes`)
    if (outs.indexOf(o) !== i) add('C3', `/parts/on_death/${i}`, `'${o}' is listed twice`)
    if ((od.crewed_machine_only || []).includes(o) && p.nature !== 'crewed-machine') add('S7', `/parts/on_death/${i}`, `'${o}' only for a crewed machine (this card is ${p.nature})`)
  })
  for (const pair of od.never_together || []) if (pair.every(o => outs.includes(o))) add('C3', '/parts/on_death', `${pair.join(' and ')} never go together`)
}

// Section 7: crew, solo fallback, body count, passengers, nature, availability, unarmed, resource.
function checkCrew({ data, card, p, abil, P }, add) {
  const D = data.rules.defaults, C = data.rules.counts
  const crew = data.terms['crew-models'][p.crew.model] || {}
  const multi = (crew.max_players || 1) > 1
  if (!multi && p.crew.solo_fallback !== null) add('S7', '/parts/crew/solo_fallback', `crew model '${p.crew.model}' has one player: no solo fallback`)
  if (multi && !p.crew.solo_fallback) add('C2', '/parts/crew/solo_fallback', 'a multi-seat crew needs a solo fallback')
  const counts = positive(p.crew.model === 'squad' ? C.body_count?.squad : C.body_count?.other)
  if (counts.length && !counts.includes(p.body.count)) add('S7', '/parts/body/count', `body count ${p.body.count}; a ${p.crew.model === 'squad' ? 'squad' : 'card that is not a squad'} has ${counts.join(', ')}`)
  // Passengers only from a pattern, within the size's cap, of the kind the patterns give.
  const links = abil.flatMap(x => [...(x.block?.implies || []), ...(x.block?.requires || []).flat()])
  const pass = p.crew.passengers
  if (pass) {
    if (D.passengers?.only_from_patterns && !links.some(l => l.startsWith('passengers:'))) add('S7', '/parts/crew/passengers', 'passenger seats only when an ability implies or requires them')
    const cap = D.passengers?.caps?.[p.body.size]
    if (cap !== undefined && pass.seats > cap) add('S7', '/parts/crew/passengers/seats', `${pass.seats} passenger seats; a ${p.body.size} card holds at most ${cap}`)
    const kind = (D.passengers?.kinds || []).find(k => !k.pattern || abil.some(x => x.a.pattern === k.pattern && (!k.variants || k.variants.includes(x.a.variant))))?.kind
    if (kind && pass.kind !== kind) add('S7', '/parts/crew/passengers/kind', `the passengers' kind is '${kind}', not '${pass.kind}'`)
  }
  // Nature: the first rule of defaults.nature that holds; a rule whose nature the word list does not allow for the
  // card's class is passed over (a drone with a creature body stays an uncrewed machine).
  const natureForClass = id => { const c = data.terms.nature?.[id]?.classes; return !c || c.includes(p.class) }
  const rule = (D.nature || []).find(n => natureForClass(n.nature) && (!n.when || matches(data, n.when, P)))
  if (rule && p.nature !== rule.nature) add('S7', '/parts/nature', `nature is '${rule.nature}'${rule.when ? ` (${rule.when})` : ''}, not '${p.nature}'`)
  // Availability gates.
  const av = C.availability?.[p.availability]
  if (av) {
    if (av.min_spice && card.spice < av.min_spice) add('S7', '/parts/availability', `'${p.availability}' only from spice ${av.min_spice}`)
    if (av.min_tier && tierRank(data, p.tier) < tierRank(data, av.min_tier)) add('S7', '/parts/availability', `'${p.availability}' only from ${av.min_tier}`)
    if (!(av.weight > 0)) add('S7', '/parts/availability', `'${p.availability}' is never rolled`)
  }
  // Unarmed only for the listed primary roles with a signature of a listed category.
  if (p.armament.primary === null) {
    const u = D.unarmed || {}
    const cat = data.patterns[p.signature.pattern]?.category
    if (!(u.primary_roles || []).includes(p.roles.primary) || !(u.signature_categories || []).includes(cat)) {
      add('S7', '/parts/armament/primary', `unarmed only with a primary role of ${(u.primary_roles || []).join(', ')} and a signature of category ${(u.signature_categories || []).join(', ')} (here ${p.roles.primary}, ${cat})`)
    }
  }
  if (p.resource != null && !links.includes(`resource:${p.resource}`)) add('S7', '/parts/resource', `resource '${p.resource}' only when an ability implies or requires it`)
}

// G10, G11, G12, A10: mobility handling and the weapons.
function checkWeapons({ data, p, abil, weapons }, add) {
  const T = data.terms, D = data.rules.defaults
  const mob = T.mobility[p.mobility.base]
  if (mob?.default_handling && p.mobility.handling !== mob.default_handling) add('G10', '/parts/mobility/handling', `handling is the ${p.mobility.base} default '${mob.default_handling}', not '${p.mobility.handling}'`)
  const links = abil.flatMap(x => [...(x.block?.implies || []), ...(x.block?.requires || []).flat()])
  const implied = kind => abil.flatMap(x => x.block?.implies || []).filter(l => l.startsWith(`${kind}:`)).map(l => parseRef(l).id)
  const body = T.bodies[p.body.plan]
  const live = new Set(Object.values(T['target-types']).filter(t => !t.source_only).map(t => t.id))
  for (const { w, at, slot } of weapons) {
    const fam = T['weapon-families'][w.family]
    if (!fam) continue
    const plain = fam.default_range || fam.default_damage || fam.default_delivery || fam.allowed?.['damage-types'] || fam.allowed?.['weapon-delivery']
    if (plain) {
      // G11: the family's default range, or a range a pattern on the card implies or requires.
      const rangeOk = w.range === fam.default_range || implied('range').includes(w.range) ||
        links.filter(l => l.startsWith('range:')).some(l => { const r = parseRef(l); return w.range && cmpRank(data, 'range-bands', w.range, r.cmp, r.id) })
      if (!rangeOk) add('G11', `${at}/range`, `range '${w.range}': a ${w.family} weapon has range '${fam.default_range}' unless a pattern implies or requires another`)
      // G12: damage and delivery are the family's default or allowed ones.
      const dmg = [fam.default_damage, ...(fam.allowed?.['damage-types'] || []), ...implied('damage')].filter(Boolean)
      if (!dmg.includes(w.damage)) add('G12', `${at}/damage`, `damage '${w.damage}': a ${w.family} weapon deals ${[...new Set(dmg)].join(', ')}`)
      const del = [fam.default_delivery, ...(fam.allowed?.['weapon-delivery'] || []), ...implied('delivery')].filter(Boolean)
      if (!del.includes(w.delivery)) add('G12', `${at}/delivery`, `delivery '${w.delivery}': a ${w.family} weapon has ${[...new Set(del)].join(', ')}`)
    }
    // G12: the mount must be one the body allows (a second form records no body).
    if (slot !== 'mode' && body?.allowed?.['aim-models'] && !body.allowed['aim-models'].includes(w.mount)) add('G12', `${at}/mount`, `mount '${w.mount}': a ${p.body.plan} body allows ${body.allowed['aim-models'].join(', ')}`)
    // G12: targets are every type the family and delivery allow.
    const del = w.delivery ? T['weapon-delivery'][w.delivery] : null
    const famT = fam.allowed?.['target-types'] || [...live]
    let want = famT.filter(t => live.has(t) && (!del?.allowed?.['target-types'] || del.allowed['target-types'].includes(t)))
    const aa = T['weapon-traits']['anti-air']
    if ((w.traits || []).includes('anti-air') && famT.includes('low-air') && !(aa?.excluded?.['weapon-delivery'] || []).includes(w.delivery) &&
      (!del?.allowed?.['target-types'] || del.allowed['target-types'].includes('high-air')) && !want.includes('high-air')) want = [...want, 'high-air']
    if (!eqSet(w.can_target, want)) add('G12', `${at}/can_target`, `can_target [${w.can_target.join(', ')}] should be every type the family and delivery allow: [${want.join(', ')}]`)
  }
  // A10: an adaptive weapon and its conditional weapons.
  const A = p.armament
  const adaptive = [['primary', A.primary], ['secondary', A.secondary]].filter(([, w]) => w?.family === 'adaptive')
  const conds = A.conditional || []
  const ad = D.adaptive || {}
  if (!adaptive.length) {
    if (conds.length) add('A10', '/parts/armament/conditional', 'conditional weapons only with an adaptive weapon')
  } else {
    const counts = positive(data.rules.counts?.conditional_weapons)
    if (!counts.includes(conds.length)) add('A10', '/parts/armament/conditional', `${conds.length} conditional weapons; an adaptive weapon gets ${counts.join(', ')}`)
    const src = abil.find(x => (x.block?.implies || []).includes('weapon:adaptive'))
    if (src) {
      const famReq = (src.block.requires || []).flat().some(l => parseRef(l).kind === 'weapon')
      const slot = famReq ? ad.slot_when_family_required : ad.slot
      if (!adaptive.some(([s]) => s === slot)) add('A10', `/parts/armament/${slot}`, `the adaptive weapon that '${src.a.pattern}' implies is the ${slot} weapon`)
      const kind = ad.when_links?.[src.a.pattern]
      conds.forEach((c, i) => {
        const r = parseRef(c.when)
        if (kind && r.kind !== kind) add('A10', `/parts/armament/conditional/${i}/when`, `'${src.a.pattern}' makes conditional weapons on ${kind}: links, not ${c.when}`)
        const vid = data.refKinds[r.kind]?.vocab
        if (vid && (!T[vid]?.[r.id] || T[vid][r.id].source_only)) add('A10', `/parts/armament/conditional/${i}/when`, `${c.when} names no term a card can use`)
      })
    }
  }
}

// G13, G14: the roles fit the card.
function checkRoles({ data, p, abil, P }, add) {
  const fits = role => {
    const f = data.rules.role_fit?.[role]
    if (!f) return true
    if (f.patterns && !abil.some(x => f.patterns.includes(x.a.pattern))) return false
    // G13 asks for a main weapon of medium range or less: a range link is read on the primary weapon.
    const holds = l => (parseRef(l).kind === 'range' ? matches(data, l, { ...P, weapons: p.armament.primary ? [p.armament.primary] : [] }) : matches(data, l, P))
    if (f.any && !f.any.some(holds)) return false
    if (f.all && !f.all.every(holds)) return false
    return true
  }
  const roles = [['/parts/roles/primary', p.roles.primary], ...p.roles.secondary.map((r, i) => [`/parts/roles/secondary/${i}`, r])]
  for (const [at, r] of roles) if (!fits(r)) add('G13', at, `role '${r}' does not fit: it needs ${JSON.stringify(data.rules.role_fit[r])}`)
  p.roles.secondary.forEach((r, i) => {
    if (r === p.roles.primary) add('G14', `/parts/roles/secondary/${i}`, `'${r}' is already the primary role`)
    if (p.roles.secondary.indexOf(r) !== i) add('G14', `/parts/roles/secondary/${i}`, `'${r}' is listed twice`)
  })
}

// A9: a second form only from transform.
function checkModes({ data, p, abil, tier }, add) {
  const T = data.terms
  const via = data.rules.defaults.second_form?.via || []
  const modes = p.modes || []
  const giver = abil.find(x => via.includes(x.a.pattern))
  if (giver && modes.length !== 1) add('A9', '/parts/modes', `'${giver.a.pattern}' gives the card one second form; it has ${modes.length}`)
  modes.forEach((m, i) => {
    const at = `/parts/modes/${i}`
    if (!via.includes(m.via)) { add('A9', `${at}/via`, `only ${via.join(', ')} gives a second form, not '${m.via}'`); return }
    const x = abil.find(y => y.a.pattern === m.via)
    if (!x) { add('A9', `${at}/via`, `'${m.via}' is not an ability on the card`); return }
    if (m.class === p.class || !(x.block?.classes || []).includes(m.class) || T.classes[m.class]?.source_only) add('A9', `${at}/class`, `the second form's class is another class '${m.via}' allows, not '${m.class}'`)
    const mob = T.mobility[m.mobility.base]
    if (!mob || mob.source_only || !(mob.classes || []).includes(m.class) || (mob.min_tier && tier < tierRank(data, mob.min_tier))) add('A9', `${at}/mobility/base`, `mobility '${m.mobility.base}' is not one a ${m.class} can roll at ${p.tier}`)
    else {
      if (mob.default_handling && m.mobility.handling !== mob.default_handling) add('G10', `${at}/mobility/handling`, `handling is the ${m.mobility.base} default '${mob.default_handling}', not '${m.mobility.handling}'`)
      if (mob.allowed?.['speed-bands'] && !mob.allowed['speed-bands'].includes(m.mobility.speed)) add('A9', `${at}/mobility/speed`, `speed '${m.mobility.speed}' is not one ${m.mobility.base} allows`)
    }
    const counts = positive(data.rules.counts?.second_form_weapons)
    if (counts.length && !counts.includes((m.armament || []).length)) add('A9', `${at}/armament`, `${(m.armament || []).length} weapons; a second form has ${counts.join(' or ')}`)
    ;(m.armament || []).forEach((w, j) => {
      const fam = T['weapon-families'][w.family]
      if (!fam || fam.source_only || (fam.classes && !fam.classes.includes(m.class))) add('A9', `${at}/armament/${j}/family`, `a ${m.class} can't use a ${w.family} weapon`)
    })
  })
}

// G5/T6, S4/G6, S6: the spice gate and avoided parts.
function rarityStep(data, r, steps) {
  const byRank = Object.values(data.terms.rarity).sort((a, b) => a.rank - b.rank)
  const i = byRank.findIndex(x => x.id === r)
  return byRank[Math.max(0, i - steps)]?.id ?? r
}
function effectiveRarity(data, card, vid, id, cls) {
  const t = data.terms[vid]?.[id]
  if (!t) return null
  const cr = t.class_rarity?.[cls]
  if (cr) return cr // S3; the favoured step never applies to a class rarity (S2)
  const r = t.rarity || data.rules.defaults.default_rarity // G9
  const fav = data.terms['faction-flavours'][card.parts.flavour]?.favoured?.[vid] || []
  return fav.includes(id) ? rarityStep(data, r, data.rules.defaults.favoured_step ?? 1) : r // S2
}
function patternRarity(data, card, block) {
  const cr = block.class_rarity?.[card.parts.class]
  if (cr) return cr
  const lean = (block.flavour_lean || []).includes(card.parts.flavour) && data.rules.defaults.flavour_lean === 'favoured' // S5, question FL answered A
  return lean ? rarityStep(data, block.rarity, data.rules.defaults.favoured_step ?? 1) : block.rarity
}
// Link kinds a card meets only through a part that has a rarity: a weapon (its family carries the rarity), a pattern,
// or one of the listed parts. Other kinds (speed, size, armour class, sight, passengers ...) have no rarity (G9).
const RARITY_KINDS = new Set(['class', 'mobility', 'mobility-trait', 'body', 'armour-model', 'sensor', 'crew', 'weapon', 'mount', 'damage', 'delivery', 'range', 'weapon-trait', 'hits', 'pattern', 'category'])
const WEAPON_KINDS = new Set(['weapon', 'damage', 'delivery', 'range', 'weapon-trait', 'hits'])
// The card's parts that have a rarity, with their path, their lock, and which typed links each one meets.
function rarityParts(ctx) {
  const { data, card, p, abil, P } = ctx
  const out = []
  const push = (at, vid, id, lock, cls, meets) => {
    if (id == null) return
    out.push({ at, vid, id, lock, rarity: effectiveRarity(data, card, vid, id, cls), meets })
  }
  const kindIs = (kind, id) => l => { const r = parseRef(l); return r.kind === kind && r.id === id && !r.cmp }
  push('/parts/class', 'classes', p.class, 'class', p.class, kindIs('class', p.class))
  push('/parts/mobility/base', 'mobility', p.mobility.base, 'mobility', p.class, kindIs('mobility', p.mobility.base))
  ;(p.mobility.traits || []).forEach((t, i) => push(`/parts/mobility/traits/${i}`, 'mobility-traits', t, 'mobility', p.class, kindIs('mobility-trait', t)))
  push('/parts/body/plan', 'bodies', p.body.plan, 'body', p.class, kindIs('body', p.body.plan))
  ;(p.armour.models || []).forEach((m, i) => push(`/parts/armour/models/${i}`, 'armour-models', m, 'armour', p.class, kindIs('armour-model', m)))
  ;(p.sensors.traits || []).forEach((s, i) => push(`/parts/sensors/traits/${i}`, 'sensor-traits', s, 'sensors', p.class, kindIs('sensor', s)))
  push('/parts/crew/model', 'crew-models', p.crew.model, 'crew', p.class, kindIs('crew', p.crew.model))
  push('/parts/crew/solo_fallback', 'solo-fallback', p.crew.solo_fallback, 'crew', p.class, () => false)
  for (const { w, at, slot, mode } of weaponsOf(card)) {
    const lock = slot === 'mode' ? 'modes' : slot
    const cls = mode ? mode.class : p.class
    // A weapon meets weapon:, damage:, delivery:, range:, weapon-trait: and hits: links through its family.
    const one = { ...P, weapons: [w] }
    push(`${at}/family`, 'weapon-families', w.family, lock, cls, l => !mode && WEAPON_KINDS.has(parseRef(l).kind) && matches(data, l, one))
    push(`${at}/mount`, 'aim-models', w.mount, lock, cls, l => !mode && matches(data, l, one) && parseRef(l).kind === 'mount')
  }
  p.on_death.forEach((o, i) => push(`/parts/on_death/${i}`, 'on-death', o, 'on_death', p.class, () => false))
  ;(p.modes || []).forEach((m, i) => {
    push(`/parts/modes/${i}/class`, 'classes', m.class, 'modes', m.class, () => false)
    push(`/parts/modes/${i}/mobility/base`, 'mobility', m.mobility.base, 'modes', m.class, () => false)
  })
  for (const x of abil) {
    if (!x.block) continue
    const brings = [...(x.block.implies || []), ...(x.block.requires || []).flat()].some(l => parseRef(l).kind === 'passengers')
    const meets = l => { const r = parseRef(l); return (r.kind === 'pattern' && r.id === x.a.pattern) || (r.kind === 'category' && r.id === x.pattern.category) || (r.kind === 'passengers' && brings) }
    out.push({ at: x.at, vid: 'patterns', id: x.a.pattern, lock: x.i === 0 ? 'signature' : 'abilities', rarity: patternRarity(data, card, x.block), meets, ability: x })
  }
  return out
}
function checkSpice(ctx, add) {
  const { data, card, p, abil, P } = ctx
  const gate = r => (data.terms.rarity[r]?.min_spice ?? 1) <= card.spice
  const parts = rarityParts(ctx)
  const locks = new Set(card.locks || [])
  const exempt = x => locks.has(x.lock) || (x.at === '/parts/class' && card.inputs.class != null)
  // Needs of the inputs and locks (G5): the input role's word-list requires and role fit, then the implies and
  // requires of every pattern that is locked or serves a needed role, and the roles those patterns imply.
  const groups = []
  const neededPatterns = new Set(abil.filter(x => locks.has(x.i === 0 ? 'signature' : 'abilities')).map(x => x.a.pattern))
  const bringsSeats = b => [...(b?.implies || []), ...(b?.requires || []).flat()].some(l => parseRef(l).kind === 'passengers')
  const linkAtGate = l => {
    const r = parseRef(l)
    const vid = data.refKinds[r.kind]?.vocab
    return r.cmp || !vid || !data.terms[vid]?.[r.id] || gate(effectiveRarity(data, card, vid, r.id, p.class))
  }
  let seatsKnown
  const seatsAtGate = () => (seatsKnown ??= Object.values(data.patterns).some(pt => !abil.some(x => x.a.pattern === pt.id) && (pt.variants || []).some(y => {
    if ((y.min_spice ?? 1) > card.spice) return false
    const b = blockOf(data, pt.id, y.id)
    return b && (b.classes || []).includes(p.class) && tierRank(data, b.min_tier) <= ctx.tier && bringsSeats(b) && gate(patternRarity(data, card, b)) &&
      !(b.excludes || []).some(l => matches(data, l, P)) && (b.implies || []).every(linkAtGate)
  })))
  const roles = new Set(card.inputs.role ? [card.inputs.role] : [])
  for (let changed = true, guard = 0; changed && guard < 20; guard++) {
    changed = false
    for (const r of roles) {
      for (const g of data.terms.roles[r]?.requires || []) {
        groups.push(g)
        // A role that needs passenger seats needs a pattern that brings them (section 7). The card's own seat-bringer
        // counts as needed, with what it implies, unless another pattern would bring the seats from within the spice
        // gate (G5: above the gate only when nothing at the gate fits). Partial: that other pattern is judged by its
        // class, tier, rarity, variant spice, excludes and implied parts only.
        if (g.some(l => parseRef(l).kind === 'passengers') && !seatsAtGate()) {
          for (const x of abil) {
            if (bringsSeats(x.block) && !neededPatterns.has(x.a.pattern)) { neededPatterns.add(x.a.pattern); changed = true }
          }
        }
      }
      const f = data.rules.role_fit?.[r]
      if (f?.patterns) {
        groups.push(f.patterns.map(id => `pattern:${id}`))
        for (const x of abil) if (f.patterns.includes(x.a.pattern) && !neededPatterns.has(x.a.pattern)) { neededPatterns.add(x.a.pattern); changed = true }
      }
      if (f?.any) groups.push(f.any)
      for (const l of f?.all || []) groups.push([l])
    }
    for (const x of abil) {
      if (!neededPatterns.has(x.a.pattern) || x._expanded) continue
      x._expanded = true
      for (const l of x.block?.implies || []) {
        groups.push([l])
        const r = parseRef(l)
        if (r.kind === 'pattern' && !neededPatterns.has(r.id)) { neededPatterns.add(r.id); changed = true }
        if (r.kind === 'role' && !roles.has(r.id)) { roles.add(r.id); changed = true }
      }
      for (const g of x.block?.requires || []) groups.push(g)
      changed = true
    }
  }
  for (const x of abil) delete x._expanded
  // A need is met at the gate when a part within the spice (or a part with no rarity) meets one of its links; a part
  // above the gate is justified only by a need it meets that nothing within the spice on the card meets.
  const above = x => !gate(x.rarity)
  // Passenger seats have no rarity of their own, but only a pattern brings them (section 7): the pattern is the part.
  const viaPart = l => { const k = parseRef(l).kind; return RARITY_KINDS.has(k) || k === 'passengers' }
  const meetsAtGate = g => g.some(l => (viaPart(l) ? parts.some(x => !above(x) && x.meets(l)) : matches(data, l, P)))
  const justified = x => groups.some(g => g.some(l => x.meets(l)) && !meetsAtGate(g))
  for (const x of parts) {
    if (!above(x) || exempt(x)) continue
    if (x.at === '/parts/class' && !locks.size) {
      // The class is rolled first among classes that fit the inputs: one at the gate always fits an input role
      // whose classes include it.
      const roleClasses = card.inputs.role ? data.terms.roles[card.inputs.role]?.classes : null
      const atGate = Object.values(data.terms.classes).filter(c => !c.source_only && gate(effectiveRarity(data, card, 'classes', c.id, c.id)) && (!roleClasses || roleClasses.includes(c.id)))
      if (atGate.length) { add('G5', x.at, `class '${x.id}' is ${x.rarity}, above spice ${card.spice}, and classes at the gate fit the inputs (${atGate.map(c => c.id).join(', ')})`); continue }
    }
    if (justified(x)) continue
    add('G5', x.at, `${x.vid === 'patterns' ? 'pattern' : x.vid} '${x.id}' is ${x.rarity} for this card, above spice ${card.spice}, and no input or lock needs it`)
  }
  // S4/G6: avoided parts below avoided_until_spice.
  const fl = data.terms['faction-flavours'][p.flavour] || {}
  if (card.spice < (fl.avoided_until_spice ?? 0)) {
    for (const x of avoidedParts(ctx)) {
      const needed = locks.has(x.lock) || groups.some(g => g.includes(x.link) && !g.some(l => l !== x.link && matches(data, l, P)))
      if (!needed) add('S4', x.at, `${x.vid} '${x.id}' is avoided by the ${p.flavour} flavour below spice ${fl.avoided_until_spice}`)
    }
  }
  // S6: a variant within the spice, unless locked or needed with nothing within the spice that fits.
  for (const x of abil) {
    const v = x.pattern?.variants.find(y => y.id === x.a.variant)
    if (!v || v.min_spice <= card.spice) continue
    if (locks.has(x.i === 0 ? 'signature' : 'abilities')) continue
    const fitting = x.pattern.variants.filter(y => {
      const b = blockOf(data, x.a.pattern, y.id)
      const e = hcEntry(data, x.a.pattern, y.id)
      const keyOnly = e && data.rules.hard_control?.classes?.[e.class]?.key_kinds_only
      return (b.classes || []).includes(p.class) && tierRank(data, b.min_tier) <= ctx.tier && !(e && e.escape === null) && !(keyOnly && !b.kinds.some(k => isKeyKind(data, k)))
    })
    // The needs this ability is on the card for: a variant counts when its own block meets one of them (a pattern or
    // category link holds for every variant; passenger seats only for a variant that brings them).
    const part = parts.find(q => q.ability === x)
    const why = part ? groups.filter(g => g.some(l => part.meets(l)) && !meetsAtGate(g)) : []
    const variantMeets = (y, g) => g.some(l => {
      const r = parseRef(l)
      if (r.kind === 'pattern') return r.id === x.a.pattern
      if (r.kind === 'category') return r.id === x.pattern.category
      const b = blockOf(data, x.a.pattern, y.id)
      return r.kind === 'passengers' && [...(b.implies || []), ...(b.requires || []).flat()].some(k => parseRef(k).kind === 'passengers')
    })
    const serving = why.length ? fitting.filter(y => why.some(g => variantMeets(y, g))) : fitting
    const lowest = Math.min(...serving.map(y => y.min_spice))
    const ok = (neededPatterns.has(x.a.pattern) || why.length > 0) && !serving.some(y => y.min_spice <= card.spice) && v.min_spice === lowest
    if (!ok) add('S6', `${x.at}/variant`, `variant '${v.id}' starts at spice ${v.min_spice}, above the card's ${card.spice}`)
  }
}
// The parts a card's flavour avoids (S4), whatever the spice.
function avoidedParts({ data, card, p }) {
  const avoided = data.terms['faction-flavours'][p.flavour]?.avoided || {}
  const out = []
  const kindOf = vid => Object.entries(data.refKinds).find(([, k]) => k.vocab === vid)?.[0]
  const check = (vid, id, at, lock) => { if ((avoided[vid] || []).includes(id)) out.push({ vid, id, at, lock, link: `${kindOf(vid)}:${id}` }) }
  ;(p.mobility.traits || []).forEach((t, i) => check('mobility-traits', t, `/parts/mobility/traits/${i}`, 'mobility'))
  check('mobility', p.mobility.base, '/parts/mobility/base', 'mobility')
  check('bodies', p.body.plan, '/parts/body/plan', 'body')
  check('sizes', p.body.size, '/parts/body/size', 'size')
  check('armour-classes', p.armour.class, '/parts/armour/class', 'armour')
  ;(p.armour.models || []).forEach((m, i) => check('armour-models', m, `/parts/armour/models/${i}`, 'armour'))
  ;(p.sensors.traits || []).forEach((s, i) => check('sensor-traits', s, `/parts/sensors/traits/${i}`, 'sensors'))
  check('crew-models', p.crew.model, '/parts/crew/model', 'crew')
  check('speed-bands', p.mobility.speed, '/parts/mobility/speed', 'speed')
  for (const { w, at, slot } of weaponsOf(card)) {
    const lock = slot === 'mode' ? 'modes' : slot
    check('weapon-families', w.family, `${at}/family`, lock)
    check('damage-types', w.damage, `${at}/damage`, lock)
    check('weapon-delivery', w.delivery, `${at}/delivery`, lock)
    check('aim-models', w.mount, `${at}/mount`, lock)
  }
  return out
}

// B1 to B3 and the flags of section 10.
function checkBalance(ctx, add) {
  const { data, card, p } = ctx
  const b = computeBalance(card, data)
  if (card.balance.power !== b.power) add('B1', '/balance/power', `power ${card.balance.power}; the points method gives ${b.power}`)
  if (card.balance.complexity !== b.complexity) add('B2', '/balance/complexity', `complexity ${card.balance.complexity}; the points method gives ${b.complexity}`)
  if (card.balance.cost_band !== b.cost_band) add('B3', '/balance/cost_band', `cost band '${card.balance.cost_band}'; the points method gives ${b.cost} ('${b.cost_band}')`)
  const flags = card.balance.flags
  const outside = !(data.rules.points.tier_bands?.[p.tier] || []).includes(b.cost_band)
  if (outside !== flags.includes('cost-outside-tier')) add('B3', '/balance/flags', outside ? `cost band '${b.cost_band}' is outside the ${p.tier} bands: the cost-outside-tier warning is missing` : 'cost-outside-tier, but the cost band is within the tier\'s bands')
  const off = avoidedParts(ctx).length > 0
  if (off !== flags.includes('off-flavour')) add('S4', '/balance/flags', off ? 'the card holds a part its flavour avoids: the off-flavour warning is missing' : 'off-flavour, but the card holds no part its flavour avoids')
  flags.forEach((f, i) => {
    if (data.terms['balance-flags'][f]?.severity === 'block') add('V', `/balance/flags/${i}`, `blocking flag '${f}' on a rolled card`)
    else if (!['cost-outside-tier', 'off-flavour'].includes(f)) add('B3', `/balance/flags/${i}`, `flag '${f}' has no rule that raises it`)
    if (flags.indexOf(f) !== i) add('B3', `/balance/flags/${i}`, `'${f}' is listed twice`)
  })
}

// T-a: the name check.
function checkNames({ data, card }, add) {
  const N = data.names_
  const name = card.text.name, sig = card.text.signature.name
  const nameWords = nameTokens(name)
  for (const w of nameWords) {
    if (w.length >= 3 && N.realWords.has(w.toLowerCase())) add('T-a', '/text/name', `'${w}' is a word of a real name`)
    if (N.sourceTerms.has(norm(w))) add('T-a', '/text/name', `'${w}' is a whole source term`)
  }
  if (N.whole.has(norm(name))) add('T-a', '/text/name', `'${name}' is a real name or a source term`)
  const sw = sig.split(' ')
  const noun = sw.length > 1 ? sw[sw.length - 1] : null
  for (const w of nameTokens(sw.slice(0, noun ? -1 : undefined).join(' '))) if (w.length >= 3 && N.realWords.has(w.toLowerCase())) add('T-a', '/text/signature/name', `'${w}' is a word of a real name`)
  for (const w of nameTokens(sig)) if (N.sourceTerms.has(norm(w))) add('T-a', '/text/signature/name', `'${w}' is a whole source term`)
  if (N.whole.has(norm(sig))) add('T-a', '/text/signature/name', `'${sig}' is a real name or a source term`)
}

// T-b on every text field, and S11: what each text field is built from.
function textFields(card) {
  const t = card.text, M = card.matchups
  return [
    ['/text/name', t.name], ['/text/pitch', t.pitch], ['/text/signature/name', t.signature.name], ['/text/signature/effect', t.signature.effect],
    ['/text/team_play_hook/text', t.team_play_hook.text],
    ...['as_user', 'as_target', 'teammates', 'tells'].map(k => [`/text/how_it_plays/${k}`, t.how_it_plays[k]]),
    ...t.how_it_plays.controls.map((c, i) => [`/text/how_it_plays/controls/${i}/action`, c.action]),
    ...['strengths', 'weaknesses', 'countered_by', 'counters'].flatMap(l => M[l].map((e, i) => [`/matchups/${l}/${i}/why`, e.why])),
    ...M.counterplay.map((s, i) => [`/matchups/counterplay/${i}`, s]),
  ]
}
function checkTexts(ctx, add) {
  const { data, card, p, abil } = ctx
  for (const [at, s] of textFields(card)) {
    const found = data.textCheck.leaks(s)
    if (found.length) add('T-b', at, `names a real game, franchise, faction, unit or wiki: ${found.join(', ')}`)
  }
  const T = data.terms, X = data.texts, N = data.names, neutral = X.neutral || {}
  const fl = N[p.flavour] || {}
  const sig = abil[0]
  const sp = sig.pattern
  const v = sp?.variants.find(x => x.id === p.signature.variant)
  const text = card.text
  // name: one of the flavour's templates, each placeholder filled from the list of the same name.
  const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const templateRe = tpl => new RegExp(`^${tpl.split(/(\{[a-z_]+\})/).filter(Boolean).map(part => {
    const m = part.match(/^\{([a-z_]+)\}$/)
    return m ? `(?:${(fl.words?.[m[1]] || []).map(w => esc(w)).join('|')})` : esc(part)
  }).join('')}$`)
  if (!(fl.templates || []).some(tpl => templateRe(tpl).test(text.name))) add('S11', '/text/name', `'${text.name}' is not built by a ${p.flavour} name template (${(fl.templates || []).join(', ')})`)
  if (!sp || !v) return
  // signature name: a name word of the flavour and a noun of the signature pattern's category.
  const sigWords = (fl.signature_words || []).flatMap(k => fl.words?.[k] || []).map(String)
  const nouns = N.signature_nouns?.[sp.category] || []
  const parts = text.signature.name.split(' ')
  if (parts.length !== 2 || !sigWords.includes(parts[0]) || !nouns.includes(parts[1])) add('S11', '/text/signature/name', `'${text.signature.name}' is not '{a ${p.flavour} name word} {${nouns.join('|')}}'`)
  // signature effect: the variant's summary, or the neutral sentence when it names a real thing.
  const summaryOk = !data.textCheck.leaks(v.summary).length
  const effect = summaryOk ? v.summary : neutral.signature_effect
  if (text.signature.effect !== effect) add('S11', '/text/signature/effect', `the effect is the variant's summary${summaryOk ? '' : ' (here the neutral sentence, T-b)'}: '${effect}'`)
  // pitch: '{A} {size} {flavour} {class_noun}: {first sentence of the summary}', cut at a word to max_length.
  const tp = X.templates?.pitch || {}
  const size = String(label(data, 'sizes', p.body.size)).toLowerCase()
  const head = `${/^[aeiou]/i.test(size) ? 'An' : 'A'} ${size} ${fl.flavour_word} ${fl.class_nouns?.[p.class]}:`
  const first = firstSentence(v.summary)
  const fulls = data.textCheck.leaks(first).length ? [`${head} ${neutral.pitch}`, neutral.pitch] : [`${head} ${first}`]
  const max = tp.max_length ?? Infinity
  const pitchOk = fulls.some(full => {
    if (full.length <= max) return text.pitch === full
    // cut at a word: what is left is a start of the full line that ends where a word ends (a stop, comma or the like
    // after it may be dropped, and an ellipsis added)
    const cut = text.pitch.replace(/(…|\.\.\.)$/, '').trimEnd()
    return text.pitch.length <= max && full.startsWith(cut) && /^[^A-Za-z0-9\s]*(\s|$)/.test(full.slice(cut.length)) && cut.length >= head.length
  })
  if (!pitchOk) add('S11', '/text/pitch', `the pitch should be '${fulls[0]}'${fulls[0].length > max ? `, cut at a word to ${max} characters` : ''}`)
  // team-play hook: the first of the pattern's hooks the flavour favours, else its first; its text teammates[0].
  const hooks = sp.team_play?.hooks || []
  const favHooks = T['faction-flavours'][p.flavour]?.favoured?.['team-play-hooks'] || []
  const hook = hooks.find(h => favHooks.includes(h)) ?? hooks[0]
  if (text.team_play_hook.hook !== hook) add('S11', '/text/team_play_hook/hook', `the hook is '${hook}', the first of '${sp.id}' hooks the ${p.flavour} flavour favours (else its first)`)
  const PT = sp.player_translation || {}
  const hookText = passingFrom(data, PT.teammates, 0, neutral.team_play_hook)
  if (text.team_play_hook.text !== hookText) add('S11', '/text/team_play_hook/text', `the hook's text is '${hookText}'`)
  // as user: the signature's as_user[0], then the first sentence of each extra's as_user[0].
  const sigUser = passingFrom(data, PT.as_user, 0, neutral.as_user)
  const extras = abil.slice(1).map(x => {
    const lines = x.pattern?.player_translation?.as_user || []
    const firstOk = lines.length && !data.textCheck.leaks(firstSentence(lines[0])).length
    if (firstOk) return [firstSentence(lines[0])]
    const later = lines.slice(1).filter(l => !data.textCheck.leaks(firstSentence(l)).length)[0]
    return later ? [firstSentence(later), later] : ['', neutral.as_user] // T-b: next passing line, or neutral (or left out)
  })
  if (!sequenceMatches(text.how_it_plays.as_user, [[sigUser], ...extras])) add('S11', '/text/how_it_plays/as_user', `as_user is the signature's line '${sigUser}' then the first sentence of each extra's first as_user line`)
  // as target: the signature's as_target[0], then every hard-control escape line, none repeated (any order).
  const sigTarget = passingFrom(data, PT.as_target, 0, neutral.as_target)
  const escapes = []
  const HC = data.rules.hard_control || {}
  for (const x of abil) if (x.hc && x.hc.escape != null) escapes.push(x.pattern.player_translation.as_target[x.hc.escape])
  for (const { w } of ctx.weapons) {
    for (const e of HC.entries || []) if (e.term?.startsWith('delivery:') && e.escape_line && w.delivery === e.term.split(':')[1]) escapes.push(X.escapes?.[e.escape_line])
    if ((HC.weapon_families?.families || []).includes(w.family)) escapes.push(X.escapes?.[w.family])
  }
  const lines = [...new Set(escapes.filter(Boolean))].filter(l => l !== sigTarget)
  const asTarget = text.how_it_plays.as_target
  const anyOrder = (rest, left) => (left.length === 0 ? rest === '' : left.some((l, i) => (rest === l || rest.startsWith(l + ' ')) && anyOrder(rest.slice(l.length).replace(/^ /, ''), left.filter((_, j) => j !== i))))
  if (!(asTarget === sigTarget && !lines.length) && !(asTarget.startsWith(sigTarget) && anyOrder(asTarget.slice(sigTarget.length).replace(/^ /, ''), lines))) {
    add('S11', '/text/how_it_plays/as_target', `as_target is the signature's line '${sigTarget}' then the escape lines of its hard-control parts (${lines.length})`)
  }
  // teammates: the second teammates line (the first when there is only one); tells: feedback[0].
  const from = (PT.teammates || []).length > 1 ? 1 : 0
  const mates = passingFrom(data, PT.teammates, from, neutral.teammates)
  // When T-b moved the hook's text onto this same line, the next passing line is accepted too, so no line shows twice.
  const matesOk = [mates]
  if (mates === hookText) matesOk.push(passingFrom(data, PT.teammates, PT.teammates.indexOf(mates) + 1, neutral.teammates))
  if (!matesOk.includes(text.how_it_plays.teammates)) add('S11', '/text/how_it_plays/teammates', `teammates is '${mates}'`)
  const tells = passingFrom(data, PT.feedback, 0, neutral.tells)
  if (text.how_it_plays.tells !== tells) add('S11', '/text/how_it_plays/tells', `tells is '${tells}'`)
  // counterplay: the signature's counterplay[0] and [1], then each extra's counterplay[0]. A line that fails T-b gives
  // way to the next passing line of the same list (or the neutral sentence when none passes); when that line is one the
  // card already shows, showing it once is accepted as well.
  const passing = (ls, n) => (ls || []).filter(l => !data.textCheck.leaks(l).length).slice(0, n)
  const comps = []
  const sigLines = passing(sp.counterplay, 2)
  const want2 = Math.min(2, (sp.counterplay || []).length)
  const sigFailed = (sp.counterplay || []).slice(0, want2).some(l => data.textCheck.leaks(l).length)
  for (let k = 0; k < want2; k++) comps.push(sigLines[k] ? (k > 0 && sigFailed ? [sigLines[k], ''] : [sigLines[k]]) : [neutral.counterplay, ''])
  for (const x of abil.slice(1)) { const l = passing(x.pattern?.counterplay, 1)[0]; comps.push(l ? [l] : [neutral.counterplay, '']) }
  const cp = card.matchups.counterplay
  const cpMatch = (i, k) => (k === comps.length ? i === cp.length : comps[k].some(o => (o === '' ? cpMatch(i, k + 1) : cp[i] === o && cpMatch(i + 1, k + 1))))
  if (!cpMatch(0, 0)) add('S11', '/matchups/counterplay', `counterplay is the signature's first two lines, then each extra's first (${comps.map(c => c[0]).join(' | ')})`)
  // inspiration: every pattern on the card; up to max of the signature pattern's source units.
  const insp = card.inspiration
  if (!eqSet(insp.patterns, abil.map(x => x.a.pattern))) add('S11', '/inspiration/patterns', `the inspiration's patterns are the card's patterns (${abil.map(x => x.a.pattern).join(', ')})`)
  const maxUnits = X.templates?.inspiration?.max ?? Infinity
  const pool = sp.source_units || []
  if (insp.source_units.length > maxUnits || insp.source_units.some((u, i) => !pool.includes(u) || insp.source_units.indexOf(u) !== i)) {
    add('S11', '/inspiration/source_units', `up to ${maxUnits} of '${sp.id}' source units, none twice`)
  }
  checkControls(ctx, add)
}
// S11 controls (partial): one entry per bound input, with the seat that owns the part and its plain name (K-f).
function checkControls({ data, card, p, abil }, add) {
  const L = data.rules.layout || {}
  const X = data.texts.templates?.controls?.actions || {}
  const want = [] // { seat, inputs, action, optional }
  const fill = (tpl, values) => String(tpl).replace(/\{([a-z_]+)\}/g, (_, k) => values[k] ?? `{${k}}`)
  const A = p.armament
  if (A.primary) want.push({ seat: A.primary.seat, inputs: [A.primary.seat === 'gunner' ? L.gunner_weapon : L.primary_weapon], action: fill(X.primary_weapon, { weapon: label(data, 'weapon-families', A.primary.family) }) })
  if (A.secondary) want.push({ seat: A.secondary.seat, inputs: A.secondary.seat === 'gunner' ? [L.gunner_weapon, L.secondary_weapon] : [L.secondary_weapon], action: fill(X.secondary_weapon, { weapon: label(data, 'weapon-families', A.secondary.family) }) })
  const merged = new Set()
  abil.forEach(x => {
    if (!isKeyKind(data, x.a.kind)) return
    const traits = (x.block?.implies || []).filter(l => l.startsWith('mobility-trait:')).map(l => l.split(':')[1]).filter(t => p.mobility.traits.includes(t))
    traits.forEach(t => merged.add(t))
    const space = traits.length ? [L.key_bound_movement] : []
    if (x.i === 0) want.push({ seat: x.a.seat, inputs: [L.signature, ...space], action: fill(X.signature, { signature_name: card.text.signature.name }) })
    else want.push({ seat: x.a.seat, inputs: [L.next_ability, L.fourth_key, L.key_bound_movement], action: fill(X.next_ability, { ability: x.pattern?.name ?? x.a.pattern }) })
  })
  for (const t of p.mobility.traits) {
    if (!data.terms['mobility-traits'][t]?.uses_key) continue
    want.push({ seat: 'driver', inputs: [L.key_bound_movement], action: fill(X.key_bound_movement, { trait: label(data, 'mobility-traits', t) }), optional: merged.has(t) })
  }
  const have = card.text.how_it_plays.controls
  const seats = data.terms['crew-models'][p.crew.model]?.seats || []
  have.forEach((c, i) => {
    if (!seats.includes(c.seat)) add('S11', `/text/how_it_plays/controls/${i}/seat`, `seat '${c.seat}' is not a seat of this card`)
    if (!Object.values(L).includes(c.input)) add('S11', `/text/how_it_plays/controls/${i}/input`, `input '${c.input}' is not in the layout (${[...new Set(Object.values(L))].join(', ')})`)
    if (have.findIndex(d => d.seat === c.seat && d.input === c.input) !== i) add('S11', `/text/how_it_plays/controls/${i}`, `the ${c.seat} seat binds '${c.input}' twice`)
  })
  // match every entry to one part, every part that is not optional to one entry
  const used = new Array(want.length).fill(false)
  const assign = i => {
    if (i === have.length) return want.every((w, k) => used[k] || w.optional)
    for (let k = 0; k < want.length; k++) {
      const w = want[k]
      if (used[k] || w.seat !== have[i].seat || !w.inputs.includes(have[i].input) || w.action !== have[i].action) continue
      used[k] = true
      if (assign(i + 1)) return true
      used[k] = false
    }
    return false
  }
  if (!assign(0)) add('S11', '/text/how_it_plays/controls', `controls are one entry per bound input: ${want.map(w => `${w.seat} ${w.inputs.join('/')} '${w.action}'${w.optional ? ' (may be left out)' : ''}`).join('; ')}`)
}

const CHECKS = [
  checkDataVersion, checkInputs, checkAbilities, checkKeys, checkSeats, checkHardControl, checkCounters, checkStrengths,
  checkDeath, checkCrew, checkWeapons, checkRoles, checkModes, checkSpice, checkBalance, checkNames, checkTexts,
]

// ==================================================================== the validator's card rules, on a batch
// scripts/validate.mjs exports validate(root), which reads data/vocab, data/patterns, data/units, data/games.json,
// data/pattern-registry.json, schemas/ and every docs/examples/*concept-card*.json. The cheapest way to run its card
// rules on many cards without changing it: copy those folders once into a throwaway folder, write the cards there as
// docs/examples/concept-card.<n>.json, and call validate() once. Its pass 2 runs only when pass 1 (every file against
// its schema) is clean, so a card that fails the card schema is kept out of the batch and reported here as CS.
/** Runs the validator's card rules on `cards`. Returns { problems: one list per card, dataErrors }. */
export function validateCards(cards, rootOrData = REPO_ROOT) {
  const data = typeof rootOrData === 'string' ? null : rootOrData
  const root = data ? data.root : rootOrData
  const schema = data ? data.validateCardSchema : loadCheckData(root).validateCardSchema
  const problems = cards.map(() => [])
  const dataErrors = []
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'check-cards-'))
  try {
    for (const p of ['data/vocab', 'data/patterns', 'data/units', 'data/games.json', 'data/pattern-registry.json', 'schemas']) {
      const src = path.join(root, ...p.split('/'))
      if (fs.existsSync(src)) fs.cpSync(src, path.join(tmp, ...p.split('/')), { recursive: true })
    }
    fs.mkdirSync(path.join(tmp, 'docs', 'examples'), { recursive: true })
    const width = String(cards.length).length
    const fileOf = new Map()
    cards.forEach((c, i) => {
      if (!schema(c)) {
        for (const e of schema.errors) problems[i].push({ code: 'CS', path: e.instancePath || '/', message: e.message })
        return
      }
      const f = `docs/examples/concept-card.${String(i).padStart(width, '0')}.json`
      fs.writeFileSync(path.join(tmp, ...f.split('/')), JSON.stringify(c))
      fileOf.set(f, i)
    })
    const res = validate(tmp)
    for (const e of res.errors) {
      const f = e.slice(0, e.indexOf(': '))
      if (fileOf.has(f)) problems[fileOf.get(f)].push({ code: 'V', path: '/', message: e.slice(f.length + 2) })
      else dataErrors.push(e)
    }
    // pass 2 did not run: say so on every card rather than let the batch pass
    if (res.warnings.some(w => w.startsWith('JSON or schema errors were found'))) for (const i of fileOf.values()) problems[i].push({ code: 'V', path: '/', message: "the validator's rule checks did not run (schema errors in the data)" })
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
  return { problems, dataErrors }
}

/** Every problem of every card: this checker's rules, and the validator's card rules unless options.validator is false. */
export function checkCards(cards, data, { validator = true } = {}) {
  const out = cards.map(c => checkCard(c, data))
  let dataErrors = []
  if (validator) {
    const v = validateCards(cards, data)
    v.problems.forEach((ps, i) => out[i].push(...ps.filter(x => x.code === 'V')))
    dataErrors = v.dataErrors
  }
  return { problems: out, dataErrors }
}

// ==================================================================== command
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const ri = args.indexOf('--root')
  const root = ri >= 0 ? path.resolve(args[ri + 1] || '.') : REPO_ROOT
  const files = args.filter((a, i) => !a.startsWith('--') && !(ri >= 0 && i === ri + 1))
  if (!files.length) {
    console.log('Usage: node scripts/check-cards.mjs [--root <dir>] [--no-validator] <card.json> [<card.json> ...]')
    process.exit(2)
  }
  let bad = 0, total = 0
  const cards = [], where = []
  for (const f of files) {
    try {
      const doc = JSON.parse(fs.readFileSync(f, 'utf8'))
      const list = Array.isArray(doc) ? doc : [doc]
      list.forEach((c, i) => { cards.push(c); where.push(Array.isArray(doc) ? `${f}#${i}` : f) })
    } catch (e) {
      console.log(`${f}: can't read it (${e.message})`)
      bad++
    }
  }
  const data = loadCheckData(root)
  for (const m of data.dataProblems) console.log(`DATA ${m}`)
  const { problems, dataErrors } = checkCards(cards, data, { validator: !args.includes('--no-validator') })
  for (const m of dataErrors) console.log(`DATA ${m}`)
  problems.forEach((ps, i) => {
    total++
    if (ps.length) bad++
    for (const x of ps) console.log(`${where[i]} ${x.code} ${x.path}: ${x.message}`)
  })
  console.log(`${total} card(s), ${problems.filter(ps => ps.length).length} with problems, ${problems.reduce((n, ps) => n + ps.length, 0)} problem(s)`)
  process.exitCode = bad || data.dataProblems.length || dataErrors.length ? 1 : 0
}
