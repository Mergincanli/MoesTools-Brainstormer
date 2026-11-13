// Checks the generator files: schemas/generator.schema.json and data/generator/{rules,names,texts}.json.
//
// Usage: node scripts/check-generator-data.mjs [repoRoot] [--coverage <coverage.json>] [--sheet <generator-rules.md>] [--bank <word-bank.json>]
//   repoRoot   the repository, or a copy of it (default: this repository)
//   coverage   rule code -> where it is (default: research/generator/data/coverage.json)
//   sheet      the rule sheet, to list its rule codes (default: docs/generator-rules.md)
//   bank       the name words as the rule sheet's script holds them (default: research/generator/rule-sheet/scripts/word-bank.json)
//
// It reads only; it writes nothing. Exit code 1 when anything fails.
// 1. Schema: compiles generator.schema.json with the same Ajv setup as scripts/validate.mjs (Ajv 2020, strict, the
//    x-vocab keyword and the four note keywords, every schema in schemas/ added) and validates the three files.
// 2. Ids: every pattern, variant, word-list term and typed link the files name exists (x-vocab terms are already
//    checked by the schema; this adds patterns, variants, links and map keys).
// 3. Cross-checks against the data and the sheet: sets that must equal a word list, the sheet's own counts
//    (hard-control list 58 = 47 stun + 11 latch, 849 working names, 3,016 signature names, 110 bank words), the
//    pattern points table of section 10 and the example card's scores.
// 4. Texts: every template's card fields exist in the card schema, every placeholder has a fill, every derived link
//    kind has a sentence, no card sentence shares a run of six words with any pattern's text, and none names a real
//    game, faction, unit, example name, franchise, title short form or the word wiki (the T-b check).
// 5. Coverage: every rule code of sections 2 to 11 of the sheet is in coverage.json; every place it names exists;
//    every code the sheet places in R, N or X has a place in the files.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined }
const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')))
const REPO = path.resolve(HERE, '..')
const ROOT = path.resolve(positional[0] || REPO)
const COVERAGE = path.resolve(opt('--coverage') || path.join(REPO, 'research/generator/data/coverage.json'))
const SHEET = path.resolve(opt('--sheet') || path.join(REPO, 'docs/generator-rules.md'))
const BANK = path.resolve(opt('--bank') || path.join(REPO, 'research/generator/rule-sheet/scripts/word-bank.json'))

const errors = [], info = []
// A crash on badly broken data still prints what was found before it.
process.on('uncaughtException', e => {
  for (const m of errors) console.log('ERROR', m)
  console.log('ERROR', `the check stopped: ${e.stack}`)
  console.log(`FAILED: ${errors.length + 1} error(s)`)
  process.exit(1)
})
const err = m => errors.push(m)
const say = m => info.push(m)
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'))
const ls = d => fs.readdirSync(path.join(ROOT, d)).filter(f => f.endsWith('.json')).sort()
const eqSet = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')
const diff = (a, b) => `missing [${b.filter(x => !a.includes(x)).join(', ')}], extra [${a.filter(x => !b.includes(x)).join(', ')}]`

// ------------------------------------------------------------------ load the data
const vocab = {}, terms = {}
for (const f of ls('data/vocab')) {
  const v = rd(`data/vocab/${f}`)
  vocab[v.id] = new Set(v.terms.map(t => t.id))
  terms[v.id] = Object.fromEntries(v.terms.map(t => [t.id, t]))
}
const ids = vid => Object.keys(terms[vid])
const patterns = ls('data/patterns').map(f => rd(`data/patterns/${f}`))
const P = Object.fromEntries(patterns.map(p => [p.id, p]))
const common = rd('schemas/common.schema.json')
const REF_KINDS = common['x-ref-kinds']
const GEN = 'data/generator'
const files = { rules: `${GEN}/rules.json`, names: `${GEN}/names.json`, texts: `${GEN}/texts.json` }
const R = rd(files.rules), N = rd(files.names), X = rd(files.texts)
const GEN_CLASSES = ids('classes').filter(c => !terms.classes[c].source_only)

// ------------------------------------------------------------------ 1. schema, with validate.mjs's Ajv setup
const validateSrc = fs.readFileSync(path.join(ROOT, 'scripts/validate.mjs'), 'utf8')
for (const needle of [
  "new Ajv2020({ allErrors: true, strict: true, strictRequired: false })", 'addFormats(ajv)', "keyword: 'x-vocab'",
  "keyword: 'x-ref-kinds'", "keyword: 'x-provenance'", "keyword: 'x-required-unless'", "keyword: 'x-required-when'",
]) if (!validateSrc.includes(needle)) err(`validate.mjs no longer contains ${needle}: update this check's Ajv setup to match`)
const require = createRequire(path.join(ROOT, 'package.json'))
const ajvMod = require('ajv/dist/2020.js'), fmtMod = require('ajv-formats')
const Ajv2020 = ajvMod.default || ajvMod, addFormats = fmtMod.default || fmtMod
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false })
addFormats(ajv)
ajv.addKeyword({
  keyword: 'x-vocab', schemaType: 'string', errors: true,
  validate: function check(vocabId, data) {
    if (data === null || typeof data !== 'string') return true
    if (!vocab[vocabId]) { check.errors = [{ message: `unknown vocabulary '${vocabId}'` }]; return false }
    if (!vocab[vocabId].has(data)) { check.errors = [{ message: `'${data}' is not a term of vocabulary '${vocabId}'` }]; return false }
    return true
  },
})
ajv.addKeyword({ keyword: 'x-ref-kinds', schemaType: 'object' })
ajv.addKeyword({ keyword: 'x-provenance', schemaType: 'string' })
ajv.addKeyword({ keyword: 'x-required-unless', schemaType: 'string' })
ajv.addKeyword({ keyword: 'x-required-when', schemaType: 'string' })
for (const f of ls('schemas')) ajv.addSchema(rd(`schemas/${f}`))
let validateGen
try { validateGen = ajv.getSchema('generator.schema.json') } catch (e) { err(`generator.schema.json does not compile in strict mode: ${e.message}`) }
if (validateGen) {
  say('schema: generator.schema.json compiles with the validator\'s Ajv setup (strict mode)')
  for (const [kind, f] of Object.entries(files)) {
    const data = rd(f)
    if (validateGen(data)) say(`schema: ${f} is valid (kind ${kind})`)
    else for (const e of validateGen.errors) err(`${f}: ${e.instancePath || '/'} ${e.message}${e.params?.allowedValues ? ' ' + JSON.stringify(e.params.allowedValues) : ''}`)
  }
  // The schema must refuse what P1 does not allow: a property of another kind, an unknown kind, a missing kind.
  const bad = [
    ['a names property in rules', { ...R, signature_nouns: {} }],
    ['an unknown top-level property', { ...X, extra: 1 }],
    ['an unknown kind', { ...N, kind: 'other' }],
    ['no kind', Object.fromEntries(Object.entries(R).filter(([k]) => k !== 'kind'))],
    ['a word that is not a term', { ...R, defaults: { ...R.defaults, default_rarity: 'legendary' } }],
  ]
  for (const [what, data] of bad) if (validateGen(data)) err(`schema accepts ${what}`)
  say(`schema: refuses ${bad.length} of ${bad.length} broken files (other kind's property, unknown property, unknown kind, no kind, bad term)`)
  // validate.mjs adds every schema in schemas/; make sure ours does not break that
  const ajv2 = new Ajv2020({ allErrors: true, strict: true, strictRequired: false })
  addFormats(ajv2)
  for (const k of ['x-vocab', 'x-ref-kinds', 'x-provenance', 'x-required-unless', 'x-required-when']) ajv2.addKeyword({ keyword: k })
  try { for (const f of ls('schemas')) ajv2.addSchema(rd(`schemas/${f}`)); say('schema: every schema in schemas/ can be added together, as validate.mjs does') } catch (e) { err(`adding the schemas together fails: ${e.message}`) }
}

// ------------------------------------------------------------------ helpers for ids and links
function parseRef(ref) {
  const i = ref.indexOf(':')
  const kind = ref.slice(0, i)
  let rest = ref.slice(i + 1), cmp = null
  if (rest.startsWith('<=') || rest.startsWith('>=')) { cmp = rest.slice(0, 2); rest = rest.slice(2) }
  return { kind, cmp, id: rest }
}
let linksChecked = 0
function checkRef(where, ref) {
  linksChecked++
  const { kind, cmp, id } = parseRef(ref)
  const spec = REF_KINDS[kind]
  if (!spec) return err(`${where}: unknown link kind in ${ref}`)
  if (cmp && !spec.ranked) err(`${where}: ${ref} uses a comparator on an unranked kind`)
  if (kind === 'passengers') { if (!/^\d+$/.test(id)) err(`${where}: ${ref} needs a number`); return }
  if (kind === 'pattern') { if (!P[id]) err(`${where}: ${ref} names no written pattern`); return }
  if (kind === 'unit') return err(`${where}: ${ref}: a unit link has no place in generator data`)
  if (kind === 'immune') { if (!(vocab['damage-types'].has(id) || vocab['mobility-traits'].has(id) || P[id])) err(`${where}: ${ref} names nothing`); return }
  const t = terms[spec.vocab]?.[id]
  if (!t) return err(`${where}: ${ref}: '${id}' is not a term of ${spec.vocab}`)
  if (t.source_only) err(`${where}: ${ref}: '${id}' is research-only`)
}
let patternsChecked = 0, variantsChecked = 0
function checkPattern(where, id) { patternsChecked++; if (!P[id]) { err(`${where}: pattern '${id}' is not in data/patterns`); return false } return true }
function checkVariant(where, pid, vid) { variantsChecked++; if (P[pid] && !P[pid].variants.some(v => v.id === vid)) err(`${where}: '${vid}' is not a variant of ${pid}`) }
const isRefKind = k => Object.hasOwn(REF_KINDS, k)

// ------------------------------------------------------------------ 2 and 3. rules.json
const D = R.defaults
const keyKinds = ids('ability-kinds').filter(k => terms['ability-kinds'][k].uses_key)
if (!eqSet(Object.keys(D.input_odds.tier), ids('tiers'))) err(`rules defaults.input_odds.tier: ${diff(Object.keys(D.input_odds.tier), ids('tiers'))}`)
if (!eqSet(Object.keys(D.input_odds.flavour), ids('faction-flavours'))) err(`rules defaults.input_odds.flavour: ${diff(Object.keys(D.input_odds.flavour), ids('faction-flavours'))}`)
// operating seats = every seat a crew model has, but the driver
const crewSeats = [...new Set(ids('crew-models').flatMap(c => terms['crew-models'][c].seats || []))].filter(s => s !== 'driver')
if (!eqSet(D.seats.operating, crewSeats)) err(`rules defaults.seats.operating: ${diff(D.seats.operating, crewSeats)}`)
for (const id of D.second_form.via) checkPattern('rules defaults.second_form.via', id)
if (D.second_form.via.includes('deploy-siege-mode')) err('rules defaults.second_form.via: deploy-siege-mode gives no second form in step 3b (A9)')
for (const [pid, kind] of Object.entries(D.adaptive.when_links)) {
  if (!checkPattern('rules defaults.adaptive.when_links', pid)) continue
  if (!isRefKind(kind)) err(`rules defaults.adaptive.when_links ${pid}: '${kind}' is not a link kind`)
  const imp = [...(P[pid].generator.implies || []), ...P[pid].variants.flatMap(v => v.overrides?.implies || [])]
  if (!imp.includes('weapon:adaptive')) err(`rules defaults.adaptive.when_links: ${pid} never implies weapon:adaptive`)
}
const fallbacks = Object.keys(D.primary_weapon_seat).filter(k => k !== 'note')
if (!eqSet(fallbacks, ids('solo-fallback'))) err(`rules defaults.primary_weapon_seat: ${diff(fallbacks, ids('solo-fallback'))}`)
if (!eqSet(Object.keys(D.passengers.caps), ids('sizes'))) err(`rules defaults.passengers.caps: ${diff(Object.keys(D.passengers.caps), ids('sizes'))}`)
for (const [i, k] of D.passengers.kinds.entries()) {
  if (k.pattern) { checkPattern(`rules defaults.passengers.kinds/${i}`, k.pattern); for (const v of k.variants || []) checkVariant(`rules defaults.passengers.kinds/${i}`, k.pattern, v) }
  if (!k.pattern && i !== D.passengers.kinds.length - 1) err('rules defaults.passengers.kinds: the entry for every card must come last')
}
for (const [i, n] of D.nature.entries()) {
  if (n.when) checkRef(`rules defaults.nature/${i}`, n.when)
  else if (i !== D.nature.length - 1) err('rules defaults.nature: the entry for every card must come last')
}
const od = D.on_death
if (!eqSet([...od.who_gets_out, ...od.what_is_left], ids('on-death'))) err(`rules defaults.on_death groups: ${diff([...od.who_gets_out, ...od.what_is_left], ids('on-death'))}`)
if (!eqSet(Object.keys(od.default), ids('nature'))) err(`rules defaults.on_death.default: ${diff(Object.keys(od.default), ids('nature'))}`)
for (const o of Object.values(od.default)) if (!od.who_gets_out.includes(o)) err(`rules defaults.on_death.default: ${o} is not a who-gets-out outcome`)
for (const o of od.crewed_machine_only) if (!od.who_gets_out.includes(o)) err(`rules defaults.on_death.crewed_machine_only: ${o} is not a who-gets-out outcome`)
if (D.resource !== null) err('rules defaults.resource: must be null (none, unless a pattern implies or requires one)')
for (const k of D.derived_links.damage_vs) if (!isRefKind(k)) err(`rules defaults.derived_links.damage_vs: ${k} is not a link kind`)
for (const [tt, ref] of Object.entries(D.derived_links.flier_hits)) {
  checkRef('rules defaults.derived_links.flier_hits', ref)
  if (!ids('mobility').some(m => terms.mobility[m].target_type === tt)) err(`rules defaults.derived_links.flier_hits: no mobility has target type ${tt}`)
}
const flierTypes = [...new Set(ids('mobility').map(m => terms.mobility[m].target_type).filter(t => t === 'low-air' || t === 'high-air'))]
if (!eqSet(Object.keys(D.derived_links.flier_hits), flierTypes)) err(`rules defaults.derived_links.flier_hits: ${diff(Object.keys(D.derived_links.flier_hits), flierTypes)}`)
checkRef('rules defaults.derived_links.no_air_weapon', D.derived_links.no_air_weapon)
// roll order
if (R.roll_order.length !== 17) err(`rules roll_order: ${R.roll_order.length} steps, the sheet has 17`)
// counts
const C = R.counts
if (!eqSet(Object.keys(C.abilities), ids('tiers'))) err(`rules counts.abilities: ${diff(Object.keys(C.abilities), ids('tiers'))}`)
if (!eqSet(Object.keys(C.availability), ids('availability'))) err(`rules counts.availability: ${diff(Object.keys(C.availability), ids('availability'))}`)
for (const [a, e] of Object.entries(C.availability)) if ((e.min_tier || null) !== (terms.availability[a].min_tier || null)) err(`rules counts.availability.${a}.min_tier ${e.min_tier} differs from the word list's ${terms.availability[a].min_tier}`)
if (!eqSet(Object.keys(C.sight), ids('sight-bands'))) err(`rules counts.sight: ${diff(Object.keys(C.sight), ids('sight-bands'))}`)
for (const [k, w] of Object.entries(C)) if (Array.isArray(w) && !w.some(x => x > 0)) err(`rules counts.${k}: every weight is 0`)
for (const t of ids('tiers')) if (C.abilities[t].length - 1 > 4) err(`rules counts.abilities.${t}: more than a signature and 3 extras`)
// cooldowns
const cdKinds = Object.keys(R.cooldowns).filter(k => k !== 'note' && !k.startsWith('hard_control'))
if (!eqSet(cdKinds, keyKinds)) err(`rules cooldowns: kinds ${diff(cdKinds, keyKinds)} (every key kind needs weights; passive and triggered get none)`)
for (const k of ids('ability-kinds').filter(k => !terms['ability-kinds'][k].uses_key)) if (R.cooldowns[k]) err(`rules cooldowns: ${k} takes no cooldown`)
// role fit
for (const [role, f] of Object.entries(R.role_fit)) {
  for (const id of f.patterns || []) checkPattern(`rules role_fit.${role}.patterns`, id)
  for (const l of [...(f.any || []), ...(f.all || [])]) checkRef(`rules role_fit.${role}`, l)
}
const infiltration = patterns.filter(p => p.category === 'infiltration' || (p.also_in || []).includes('infiltration')).map(p => p.id)
if (!eqSet(R.role_fit.infiltrator.patterns, infiltration)) err(`rules role_fit.infiltrator: G13 says the patterns whose category or also_in is infiltration: ${diff(R.role_fit.infiltrator.patterns, infiltration)}`)
const roleReq = r => (terms.roles[r].requires || []).flat()
if (!eqSet(R.role_fit.transport.all, roleReq('transport'))) err('rules role_fit.transport: should be the word list\'s requires (G13)')
// hard control
const HC = R.hard_control
let listed = { stun: 0, latch: 0 }, noEscape = []
const hcVariants = []
for (const [i, e] of HC.entries.entries()) {
  const where = `rules hard_control.entries/${i}`
  if (e.term) {
    checkRef(where, e.term)
    if (e.escape_line && !X.escapes[e.escape_line]) err(`${where}: escape_line '${e.escape_line}' is not in texts escapes`)
    continue
  }
  if (!checkPattern(where, e.pattern)) continue
  const p = P[e.pattern]
  for (const v of e.except || []) checkVariant(where, e.pattern, v)
  if (Array.isArray(e.variants)) for (const v of e.variants) checkVariant(where, e.pattern, v)
  if (e.except && e.variants !== 'all') err(`${where}: except only goes with variants all`)
  const vs = e.variants === 'all' ? p.variants.filter(v => !(e.except || []).includes(v.id)) : p.variants.filter(v => e.variants.includes(v.id))
  if (e.escape !== null && !(e.escape < p.player_translation.as_target.length)) err(`${where}: escape ${e.escape} is past the ${p.player_translation.as_target.length} as_target lines of ${e.pattern}`)
  if (e.escape === null) noEscape.push(...vs.map(v => `${e.pattern}/${v.id}`))
  listed[e.class] += vs.length
  hcVariants.push(...vs.map(v => ({ p, v, e })))
}
const nListed = listed.stun + listed.latch
if (nListed !== 58 || listed.stun !== 47 || listed.latch !== 11) err(`rules hard_control: ${nListed} variants listed (${listed.stun} stun, ${listed.latch} latch); the sheet counts 58 (47 stun, 11 latch)`)
else say('rules hard_control: 58 variants listed, 47 stun and 11 latch, as the sheet counts (hard-control.mjs)')
if (!eqSet(noEscape, ['confuse-enemies/curse-one-ally', 'passenger-sets-weapon/tool-seat', 'dash/pin-charge'])) err(`rules hard_control: variants with no escape ${noEscape.join(', ')}; the sheet names curse-one-ally, tool-seat and pin-charge`)
// the sheet: 4 variants are kept off cards (3 with no escape, and mind-control auto-capture-field, which takes only passive kinds)
const usesKey = k => terms['ability-kinds'][k].uses_key
const offCards = hcVariants.filter(({ p, v, e }) => {
  const kinds = v.overrides?.kinds || p.generator.kinds
  return e.escape === null || (HC.classes[e.class].key_kinds_only && !kinds.some(usesKey))
}).map(({ p, v }) => `${p.id}/${v.id}`)
if (offCards.length !== 4) err(`rules hard_control: ${offCards.length} variants can never be offered (${offCards.join(', ')}); the sheet counts 4`)
else say(`rules hard_control: 4 variants kept off cards, as the sheet counts: ${offCards.join(', ')}`)
const borderline = HC.entries.filter(e => e.borderline).map(e => e.pattern)
const avoid = HC.entries.filter(e => e.escape_avoids).length
say(`rules hard_control: borderline marks ${borderline.length} (${borderline.join(', ')}), (avoid) marks ${avoid}, text tier gates ${HC.entries.filter(e => e.min_tier).length}`)
for (const f of HC.weapon_families.families) if (!X.escapes[f]) err(`rules hard_control.weapon_families: no escape line for ${f} in texts`)
if (!HC.weapon_families.note.includes('Exception to decision 5B (Mustafa, 13 November 2026')) err('rules hard_control.weapon_families.note: must carry the sheet\'s words on the exception to 5B')
// same mechanic
for (const pair of R.same_mechanic) for (const id of pair) checkPattern('rules same_mechanic', id)
// points: the scale, the cost bands, the sheet's pattern table and the example card
const PT = R.points
for (const r of ids('ratings')) if (PT.pattern.scale[r] !== terms.ratings[r].rank) err(`rules points.pattern.scale.${r} differs from the ratings rank`)
const bands = Object.entries(PT.cost_bands).sort((a, b) => a[1].min - b[1].min)
if (bands[0][1].min !== 0) err('rules points.cost_bands: the lowest band must start at 0')
for (let i = 1; i < bands.length; i++) if (bands[i][1].min !== bands[i - 1][1].max + 1) err(`rules points.cost_bands: gap or overlap before ${bands[i][0]}`)
if (bands.at(-1)[1].max !== undefined) err('rules points.cost_bands: the top band has no max')
if (!eqSet(bands.map(b => b[0]), ids('cost-bands'))) err(`rules points.cost_bands: ${diff(bands.map(b => b[0]), ids('cost-bands'))}`)
if (!eqSet(bands.map(b => b[0]), bands.map(b => b[0]).sort((a, b) => terms['cost-bands'][a].rank - terms['cost-bands'][b].rank))) err('rules points.cost_bands: bands out of rank order')
if (!eqSet(Object.keys(PT.tier_bands), ids('tiers'))) err(`rules points.tier_bands: ${diff(Object.keys(PT.tier_bands), ids('tiers'))}`)
const get = (o, p) => p.split('.').reduce((x, k) => x?.[k], o)
function patternPoints(p) {
  if (PT.pattern.stored_wins && p.generator.points) return { ...p.generator.points, stored: true }
  const power = PT.pattern.scale[get(p, PT.pattern.power)]
  const round = PT.pattern.cost_rounding === 'up' ? Math.ceil : Math.floor
  return { cost: round(power / PT.pattern.cost_divisor), power, complexity: PT.pattern.scale[get(p, PT.pattern.complexity)] }
}
const SHEET_POINTS = {
  '1/1/1': ['lay-smoke'],
  '1/2/1': ['fire-power-shot', 'band-together', 'block-abilities', 'dash', 'deploy-siege-mode', 'heal-self', 'join-ally-crew', 'overclock-self', 'resupply-allies', 'reveal-area', 'throw-explosive'],
  '1/2/2': ['dampen-missile-fire', 'suppress-with-fire', 'bombard-area', 'build-linked-exits', 'carry-passengers', 'convert-on-kill', 'disable-machine', 'drop-in-from-above', 'fortify-on-death', 'leap', 'leave-hazard-zone', 'overload-past-cap', 'pull-target', 'rage-when-wounded', 'rally-allies', 'refill-on-ally-buff', 'repair-allies', 'retaliate-on-hit', 'rewind-self', 'self-destruct', 'shrink-target', 'switch-weapon-mode', 'transform', 'upgrade-in-field'],
  '1/2/3': ['command-companion', 'confuse-enemies', 'disguise', 'heal-from-debuff', 'lay-mines', 'passenger-sets-weapon', 'reinforce-squad', 'shroud-area', 'teleport'],
  '2/3/1': ['deploy-turret'],
  '2/3/2': ['become-invulnerable', 'build-cover', 'build-structure', 'capture-structure', 'cloak', 'deal-percent-damage', 'depend-on-relay', 'earn-veterancy', 'execute-target', 'freeze-and-shatter', 'gather-resources', 'generate-income', 'hijack-vehicle', 'host-spawn-point', 'launch-drones', 'leech-weapon-on-kill', 'lock-in-stasis', 'produce-unit-in-field', 'sacrifice-for-allies', 'stack-to-overload'],
  '2/3/3': ['burrow', 'infest-vehicle', 'mind-control'],
}
let pointRows = 0
for (const [key, list] of Object.entries(SHEET_POINTS)) for (const id of list) {
  pointRows++
  const pp = patternPoints(P[id])
  if (`${pp.cost}/${pp.power}/${pp.complexity}` !== key) err(`rules points: ${id} gives ${pp.cost}/${pp.power}/${pp.complexity}, the sheet's table says ${key}`)
}
if (pointRows !== patterns.length) err(`rules points: the sheet's table has ${pointRows} patterns, the data ${patterns.length}`)
else say(`rules points: the formula (with the 4 stored values winning) gives the sheet's table for all ${pointRows} patterns`)
// the sheet's check: the example card (Rime Burr, T1) has power 4, complexity 4, cost 4 (low)
function partPoints(score, card) {
  const pp = PT.parts, A = card.parts.armament
  const weapons = [A.primary, A.secondary, ...A.conditional.map(c => c.weapon)].filter(Boolean)
  const best = weapons.map(w => w.range).filter(Boolean).sort((a, b) => terms['range-bands'][b].rank - terms['range-bands'][a].rank)[0]
  const val = (part, term) => { const x = pp[part]?.[score]; return typeof x === 'number' ? (term ? x : 0) : (x?.[term] || 0) }
  return val('armour_class', card.parts.armour.class) + val('speed', card.parts.mobility.speed) + val('best_weapon_range', best) +
    val('size', card.parts.body.size) + (A.secondary ? val('secondary_weapon', true) : 0) + val('availability', card.parts.availability) +
    (card.parts.crew.passengers ? val('passenger_seats', true) : 0)
}
function scores(card) {
  const abilities = [card.parts.signature, ...card.parts.abilities]
  const pts = abilities.map(a => { const x = patternPoints(P[a.pattern]); return a.kind === 'ultimate' ? { ...x, power: Math.min(PT.pattern.max, x.power + PT.pattern.ultimate_bonus) } : x })
  const clamp = (v, s) => Math.max(s.min, Math.min(s.max, v))
  const keys = abilities.filter(a => usesKey(a.kind)).length + (card.parts.armament.secondary ? 1 : 0)
  const seats = (terms['crew-models'][card.parts.crew.model].seats || []).filter(s => R.defaults.seats.operating.includes(s)).length
  const power = clamp(pts.reduce((s, x) => s + x.power - PT.power.ability_minus, 0) + partPoints('power', card), PT.power)
  const complexity = clamp(pts.reduce((s, x) => s + x.complexity - PT.complexity.ability_minus, 0) + keys * PT.complexity.per_key + seats * PT.complexity.per_operating_seat +
    (card.parts.crew.model === 'squad' ? PT.complexity.squad : 0) + ((card.parts.modes || []).length ? PT.complexity.second_form : 0) + partPoints('complexity', card), PT.complexity)
  const cost = pts.reduce((s, x) => s + x.cost, 0) + partPoints('cost', card)
  const band = Object.entries(PT.cost_bands).find(([, b]) => cost >= b.min && (b.max === undefined || cost <= b.max))[0]
  return { power, complexity, cost, band, keys }
}
const example = rd('docs/examples/concept-card.example.json')
const ex = scores(example)
if (ex.power !== 4 || ex.complexity !== 4 || ex.cost !== 4 || ex.band !== 'low') err(`rules points on the example card: power ${ex.power}, complexity ${ex.complexity}, cost ${ex.cost} (${ex.band}); the sheet says 4, 4, 4 (low)`)
else say(`rules points on the example card ${example.text.name}: power ${ex.power}, complexity ${ex.complexity}, cost ${ex.cost} (${ex.band}), as the sheet's check says (the card itself says power ${example.balance.power}, complexity ${example.balance.complexity}, ${example.balance.cost_band})`)
// layout and controls
if (!eqSet(Object.keys(X.templates.controls.actions), Object.keys(R.layout))) err(`texts templates.controls.actions vs rules layout: ${diff(Object.keys(X.templates.controls.actions), Object.keys(R.layout))}`)

// ------------------------------------------------------------------ names.json
const FLAVOURS = ids('faction-flavours')
const flavourKeys = Object.keys(N).filter(k => !['$schema', 'schema_version', 'kind', 'version', 'status', 'signature_nouns'].includes(k))
if (!eqSet(flavourKeys, FLAVOURS)) err(`names: flavours ${diff(flavourKeys, FLAVOURS)}`)
const placeholders = s => [...s.matchAll(/\{([A-Za-z_]+)\}/g)].map(m => m[1])
for (const f of FLAVOURS) {
  const e = N[f]
  if (!eqSet(Object.keys(e.class_nouns), GEN_CLASSES)) err(`names ${f}.class_nouns: ${diff(Object.keys(e.class_nouns), GEN_CLASSES)}`)
  const used = new Set([...e.templates.flatMap(placeholders), ...e.signature_words])
  for (const ph of e.templates.flatMap(placeholders)) if (!e.words[ph]) err(`names ${f}: template placeholder {${ph}} has no word list`)
  for (const w of e.signature_words) if (!e.words[w]) err(`names ${f}.signature_words: no list '${w}'`)
  for (const k of Object.keys(e.words)) if (!used.has(k)) err(`names ${f}.words.${k} is used by no template`)
  if (e.flavour_word.toLowerCase() !== f && !terms['faction-flavours'][f].label.toLowerCase().startsWith(e.flavour_word.toLowerCase().slice(0, 4))) err(`names ${f}.flavour_word '${e.flavour_word}' does not fit the flavour`)
}
if (!eqSet(Object.keys(N.signature_nouns), ids('pattern-categories'))) err(`names signature_nouns: ${diff(Object.keys(N.signature_nouns), ids('pattern-categories'))}`)
// the word bank as word-bank.json gives it, after the 15 dropped entries
const B = JSON.parse(fs.readFileSync(BANK, 'utf8'))
const same = (a, b, what) => { if (!eqSet(a.map(String), b.map(String))) err(`names ${what} differs from word-bank.json: ${diff(a.map(String), b.map(String))}`) }
same(N.soviet.words.noun, B.soviet.nouns, 'soviet nouns'); same(N.soviet.words.number, B.soviet.numbers, 'soviet numbers')
same(N.allied.words.word, B.allied.words, 'allied words'); same(N.allied.words.letter, B.allied.code_letters, 'allied letters'); same(N.allied.words.digit, B.allied.code_digits, 'allied digits')
same(N.empire.words.first, B.empire.first, 'empire first'); same(N.empire.words.second, B.empire.second, 'empire second')
for (const c of Object.keys(B.signature_nouns)) same(N.signature_nouns[c] || [], B.signature_nouns[c], `signature nouns ${c}`)
// the order of each list as section 11 of the sheet writes it
const sheetText = fs.readFileSync(SHEET, 'utf8')
const sheetList = label => { const m = sheetText.match(new RegExp(`\\*\\*${label}\\*\\* \\([^)]*\\): ([^;\\n]+)`)); return m ? m[1].replace(/\.$/, '').split(', ') : null }
const sovietSheet = sheetList('Soviet'), alliedSheet = sheetList('Allied')
if (sovietSheet && sovietSheet.join(',') !== N.soviet.words.noun.join(',')) err(`names soviet nouns: not in the sheet's order (${sovietSheet.join(', ')})`)
if (alliedSheet && alliedSheet.join(',') !== N.allied.words.word.join(',')) err(`names allied words: not in the sheet's order (${alliedSheet.join(', ')})`)
const DROPPED = ['Halcyon', 'Daybreak', 'Sledge', 'Anvil', 'Badger', 'Lynx', 'Dusk', 'Bison', 'Corona', '88', 'C', 'K', 'Chisel', 'Rain', 'Crane', 'Dawn', 'Zone', 'Line', 'Lotus', 'Mercy', 'Ember', 'Blizzard', 'Ferry']
const allWords = [...FLAVOURS.flatMap(f => Object.values(N[f].words).flat()), ...Object.values(N.signature_nouns).flat()].map(String)
for (const w of DROPPED) if (allWords.includes(w)) err(`names: '${w}' was dropped from the banks (T-a)`)
const nameWords = [...N.soviet.words.noun, ...N.allied.words.word, ...N.empire.words.first, ...N.empire.words.second]
const sigNouns = Object.values(N.signature_nouns).flat()
// every name the templates can build
const built = []
for (const f of FLAVOURS) for (const t of N[f].templates) {
  let names = ['']
  for (const part of t.split(/(\{[a-z_]+\})/).filter(Boolean)) {
    const m = part.match(/^\{([a-z_]+)\}$/)
    names = m ? names.flatMap(n => (N[f].words[m[1]] || []).map(w => n + w)) : names.map(n => n + part)
  }
  built.push(...names)
}
const sigNames = FLAVOURS.flatMap(f => N[f].signature_words.flatMap(l => N[f].words[l] || []).flatMap(w => sigNouns.map(n => `${w} ${n}`)))
const bankCount = nameWords.length + sigNouns.length
if (bankCount !== 110) err(`names: ${bankCount} bank words; the sheet counts 110`)
if (built.length !== 849) err(`names: ${built.length} working names can be built; the sheet counts 849`)
if (new Set(sigNames).size !== 3016) err(`names: ${new Set(sigNames).size} signature names can be built; the sheet counts 3,016`)
if (!errors.some(e => e.startsWith('names:'))) say(`names: ${bankCount} bank words, ${built.length} working names, ${new Set(sigNames).size} signature names, as the sheet counts; none of the 23 dropped or replaced words is left`)
// the name check of T-a (names.mjs), on these files
const games = rd('data/games.json').games
const units = ls('data/units').flatMap(f => rd(`data/units/${f}`).units)
const words3 = s => (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter(w => w.length >= 3)
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const real = []
for (const u of units) real.push(u.name)
for (const g of games) { real.push(g.title); for (const f of g.factions) real.push(f.name) }
for (const p of patterns) for (const x of [...(p.other_examples || []), ...(p.shooter_analogues || [])]) real.push(x.unit)
const sourceTerms = patterns.flatMap(p => p.source_terms || [])
const realWords = new Set(real.flatMap(words3))
const wholeNames = new Set([...real, ...sourceTerms].map(norm))
const tA = nameWords.filter(w => realWords.has(w.toLowerCase()))
const tB = [...nameWords, ...sigNouns].filter(w => wholeNames.has(norm(w)))
const tC = [...built, ...sigNames].filter(n => wholeNames.has(norm(n)))
if (tA.length || tB.length || tC.length) err(`names: the T-a name check fails: words of real names [${tA}], whole real names or source terms [${tB}], built names [${tC}]`)
else say(`names: the T-a name check passes on these files (${real.length} real names, ${sourceTerms.length} source terms): 0 collisions`)

// ------------------------------------------------------------------ 4. texts.json
const card = rd('schemas/concept-card.schema.json')
function cardPath(p) {
  let node = card
  const resolve = n => {
    if (n?.$ref) { const [doc, ptr] = n.$ref.split('#'); const base = doc ? rd(`schemas/${doc}`) : card; return ptr.split('/').filter(Boolean).reduce((x, k) => x[k], base) }
    return n
  }
  for (const part of p.split('/')) {
    node = resolve(node)
    if (node.type === 'array' || node.items) node = resolve(node.items)
    if (node.oneOf) node = resolve(node.oneOf.find(o => resolve(o).properties) || node.oneOf[0])
    node = node?.properties?.[part]
    if (!node) return false
  }
  return true
}
for (const [k, t] of Object.entries(X.templates)) {
  for (const f of t.fields) if (!cardPath(f)) err(`texts templates.${k}: '${f}' is not a field of the card schema`)
  const phs = [...placeholders(t.template || ''), ...Object.values(t.actions || {}).flatMap(placeholders)]
  for (const ph of phs) if (!t.fills?.[ph]) err(`texts templates.${k}: {${ph}} has no fill`)
  for (const ph of Object.keys(t.fills || {})) if (!phs.includes(ph)) err(`texts templates.${k}: fill '${ph}' is used by no placeholder`)
}
const strongKinds = [...new Set(ids('damage-types').flatMap(d => (terms['damage-types'][d].strong_vs || []).map(l => parseRef(l).kind)))]
const derivedKinds = [...new Set(['damage', ...Object.values(D.derived_links.flier_hits).map(l => parseRef(l).kind), parseRef(D.derived_links.no_air_weapon).kind, ...strongKinds])]
if (!eqSet(Object.keys(X.derived_reasons), derivedKinds)) err(`texts derived_reasons: ${diff(Object.keys(X.derived_reasons), derivedKinds)}`)
for (const k of Object.keys(X.derived_reasons)) if (!isRefKind(k)) err(`texts derived_reasons: '${k}' is not a link kind`)
const escapeKeys = ['latch', ...HC.weapon_families.families]
if (!eqSet(Object.keys(X.escapes), escapeKeys)) err(`texts escapes: ${diff(Object.keys(X.escapes), escapeKeys)}`)
// the card sentences: derived reasons, escapes, neutral sentences, and the literal words of templates and actions
const cardSentences = [
  ...Object.entries(X.derived_reasons).map(([k, s]) => [`derived_reasons.${k}`, s]),
  ...Object.entries(X.escapes).map(([k, s]) => [`escapes.${k}`, s]),
  ...Object.entries(X.neutral).map(([k, s]) => [`neutral.${k}`, s]),
  ...Object.entries(X.templates).flatMap(([k, t]) => [[`templates.${k}.template`, t.template || ''], ...Object.entries(t.actions || {}).map(([a, s]) => [`templates.${k}.actions.${a}`, s])]),
]
// (a) no run of six words in a row from any pattern's text
const strings = (x, out = []) => { if (typeof x === 'string') out.push(x); else if (x && typeof x === 'object') for (const v of Object.values(x)) strings(v, out); return out }
const tok = s => (s.toLowerCase().replace(/[’']/g, '').match(/[a-z0-9]+/g) || [])
const shingles = new Set()
for (const p of patterns) for (const s of strings(p)) { const w = tok(s); for (let i = 0; i + 6 <= w.length; i++) shingles.add(w.slice(i, i + 6).join(' ')) }
let copied = 0
for (const [where, s] of cardSentences) { const w = tok(s); for (let i = 0; i + 6 <= w.length; i++) { const sh = w.slice(i, i + 6).join(' '); if (shingles.has(sh)) { copied++; err(`texts ${where}: shares six words in a row with pattern text: '${sh}'`) } } }
if (!copied) say(`texts: none of the ${cardSentences.length} card strings shares a run of six words with the patterns' text (${shingles.size} runs)`)
// (b) no real name, as T-b checks text: the real names of T-a (units, factions, game titles, example names), the
// short forms of the titles and the word wiki; franchise names are added. Source terms (in-game ability names, many of
// them plain words such as Charge or Building) belong to the name check (T-a), not to the text check.
const realPhrases = new Set(['wiki'])
for (const n of [...real, ...games.map(g => g.franchise).filter(Boolean)]) realPhrases.add(n.toLowerCase())
for (const g of games) for (const part of g.title.split(/[:(),/]/).map(s => s.trim()).filter(s => s.length > 2)) realPhrases.add(part.toLowerCase())
const hits = []
for (const [where, s] of cardSentences) {
  const low = ` ${s.toLowerCase().replace(/[^a-z0-9' ]/g, ' ')} `
  for (const n of realPhrases) {
    const nn = n.replace(/[^a-z0-9' ]/g, ' ').replace(/\s+/g, ' ').trim()
    if (nn.length < 3) continue
    if (low.replace(/\s+/g, ' ').includes(` ${nn} `)) hits.push(`${where}: '${n}'`)
  }
}
// Plain English words that are also the whole name of a unit or faction in the data are reported, not failed.
const COMMON_WORDS = new Set(['engineer', 'scout', 'aircraft', 'drone', 'support'])
const hard = hits.filter(h => !COMMON_WORDS.has(h.split("'")[1]))
for (const h of hard) err(`texts real-name check: ${h}`)
if (!hard.length) say(`texts: no card string names a real game, title short form, franchise, faction, unit or example name, nor the word wiki (${realPhrases.size} names checked)${hits.length ? `; plain words that are also a real name, reported only: ${hits.join('; ')}` : ''}`)
const longest = Math.max(...cardSentences.filter(([w]) => !w.startsWith('templates')).map(([, s]) => s.split(/\s+/).length))
say(`texts: ${Object.keys(X.templates).length} templates, ${Object.keys(X.derived_reasons).length} derived reasons, ${Object.keys(X.escapes).length} escape lines, ${Object.keys(X.neutral).length} neutral sentences; longest sentence ${longest} words`)
// the escape lines the hard-control list points to: does any name a real game or unit? (T-b would drop it)
for (const { p, e } of hcVariants) if (e.escape !== null) {
  const line = (p.player_translation.as_target[e.escape] || '').toLowerCase()
  for (const n of realPhrases) if (n.length > 3 && !COMMON_WORDS.has(n) && new RegExp(`(^|[^a-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(line)) { say(`note: the escape line ${p.id} as_target/${e.escape} contains '${n}'`); break }
}

// ------------------------------------------------------------------ summary of ids
say(`ids: ${patternsChecked} pattern ids, ${variantsChecked} variant ids and ${linksChecked} typed links checked against the data (word-list terms by the schema's x-vocab)`)

// ------------------------------------------------------------------ 5. coverage
if (fs.existsSync(COVERAGE)) {
  const cov = JSON.parse(fs.readFileSync(COVERAGE, 'utf8')).codes
  const docs = { 'rules.json': R, 'names.json': N, 'texts.json': X, 'generator.schema.json': rd('schemas/generator.schema.json') }
  const pointer = (doc, ptr) => ptr.split('/').slice(1).map(s => s.replace(/~1/g, '/').replace(/~0/g, '~')).reduce((x, k) => (x !== undefined && x !== null && Object.hasOwn(Object(x), k)) ? x[k] : undefined, doc)
  // rule codes of sections 2 to 11: bold codes such as **G1**, **K-a What is a key:**, **T-a The name check**
  const sec = sheetText.split(/\n## /)
  const inRange = sec.filter(s => /^(\d+)\./.test(s) && +s.match(/^(\d+)\./)[1] >= 2 && +s.match(/^(\d+)\./)[1] <= 11).join('\n')
  const codes = [...new Set([...inRange.matchAll(/\*\*((?:G|S|A|HC|C|M|N|B)\d+|K-[a-g]|T-[ab])\b/g)].map(m => m[1]))]
  for (const c of codes) if (!cov[c]) err(`coverage: rule code ${c} of the sheet is missing`)
  let places = 0
  for (const [code, e] of Object.entries(cov)) {
    if (!e.in) err(`coverage ${code}: no 'in' (the sheet's In marker)`)
    const needsData = /\b(R|N|X)\b/.test(e.in || '')
    if (needsData && !(e.where || []).length) err(`coverage ${code}: the sheet places it in ${e.in}, but no place in the files is given`)
    if (!e.where && !e.not_data) err(`coverage ${code}: neither where nor not_data`)
    for (const w of e.where || []) {
      places++
      const [file, ptr] = w.split('#')
      if (!docs[file]) { err(`coverage ${code}: unknown file in ${w}`); continue }
      if (pointer(docs[file], ptr || '') === undefined) err(`coverage ${code}: ${w} does not exist`)
    }
  }
  say(`coverage: ${codes.length} rule codes in sections 2 to 11, all listed; ${Object.keys(cov).length} entries in all, ${places} places, every one found`)
} else err(`coverage file not found: ${COVERAGE}`)

for (const m of info) console.log('OK   ', m)
for (const m of errors) console.log('ERROR', m)
console.log(errors.length ? `FAILED: ${errors.length} error(s)` : 'PASSED')
process.exit(errors.length ? 1 : 0)
