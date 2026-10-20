// Validates the Unit Forge data. Usage: node scripts/validate.mjs [root]   (root defaults to the repo root)
//
// It works in two passes.
//
// Pass 1, shape. Every file in data/ and the example cards must be valid JSON and pass its JSON Schema (Ajv, draft
// 2020-12), with an x-vocab keyword that checks term ids against the word lists in data/vocab/ (each list's file is
// named <id>.json). If anything fails here the report stops, because the rule checks below rely on the shape.
//
// Pass 2, rules.
// 1) Word-list integrity: unique term ids; ranks (on a ranked list every term has one and no two share one);
//    allowed/excluded/favoured/avoided maps; typed links; key-bound patterns; class rarities (every class_rarity key
//    must be in the term's classes); tie-break rules name real terms; ids a term 'replaces' are no longer terms; one
//    version shared by all word lists; and every term with combination rules sits in a list the rules read, with maps
//    keyed only by lists the rules read, so no rule is skipped unseen.
// 2) Cross-references: unique game, faction and unit ids; patterns <-> units, the pattern registry, games and
//    factions, typed links. A pattern's source_units that differ from the units linking it only warn: research
//    agents never edit an existing pattern file (a new pattern gets its first list by hand), and the merge pass keeps
//    source_units up to date with npm run sync-patterns.
// 3) Combination rules: every term's classes, min_tier, allowed, excluded and requires. A unit or card is read as
//    unit-wide parts (UNIT_PARTS) and, per weapon, weapon parts (WEAPON_PARTS). A weapon term's maps are compared
//    with that weapon's own parts and with the unit-wide parts; a unit-wide term's maps with the unit-wide parts and
//    with every weapon's parts. Requires links are always matched against the whole unit or card. Two exemptions,
//    stated in the word lists' prose: a weapon with the 'anti-air' trait may reach high air when its family reaches low
//    air (its delivery still binds it: lobbed, dropped, placed and melee shots never hit high fliers), and an 'adaptive' weapon has no fixed
//    family, so no list of allowed weapon families binds it.
//    On example concept cards every break is an error. On researched units every break is printed as ATYPICAL and
//    must be recorded in the unit's 'atypical' list under its exact rule string (below); every 'atypical' entry
//    must match a rule the unit breaks, and its path must exist on the unit.
// 4) Card rules: key and passive budgets per tier and cooldowns; each ability's pattern must be written, with a
//    generator, and the card must meet its rules (or its variant's): kinds, slot, min_tier, classes, requires,
//    excludes, implies, conflicts_with; strength/weakness pairing, matchups that describe the card's own parts, no
//    real unit names or unit links on a card, and body-aim only on the driver's weapons.
// 5) Field rules on researched units (the coding rules in the field descriptions):
//    - seats: 'driver' is never written (a weapon or ability with no seat is the driver's), and any other seat must
//      be one the unit has: its crew model's seats, crew.seats or crew.passengers.kind;
//    - the main weapon: at most one primary, listed first; it has no seat when the driver has a weapon of its own
//      (another primary or secondary entry with no seat); body-aim only from the driver seat;
//    - option groups: a loadout group is option entries plus at most one primary or secondary entry, its default
//      (default: true); an upgrade group is acquired entries only, with no default; every option entry has a group;
//    - 'when' on passenger weapons only, and on every one of them;
//    - crew and death: no in-game crew (except a squad) and no in-game respawn in a game where players command units;
//      a proposal death outcome is the 3C default (bail-out for a crewed machine that is not infantry, respawn for
//      the rest); solo_fallback only on multi-seat crew models; a squad has body.count 2 or more;
//    - an ability with no pattern has a fit_note at abilities/<i>/patterns that says what is wanted;
//    - a unit with the transform mobility trait records its second form in modes;
//    - warnings: handling other than the mobility default with nothing in mobility.notes (a tiny or small unit on
//      legs may strafe with no note, since its size and mobility show why), and fit_notes, uncertain and
//      sources[].supports paths that use '.' or '*', have an empty part, or whose parent does not exist on the unit.
//
// Rule strings. Each broken combination rule has exactly one string, '<list>:<term> <field> <value>':
//   <list>:<term> classes <class>            the term's classes leave out the unit's class
//   <list>:<term> min_tier <tier>            the term starts at <tier> (its min_tier) and the unit is lower
//   <list>:<term> allowed.<list2> <term2>    the unit (or the weapon) has <term2>, which the term's allowed.<list2> leaves out
//   <list>:<term> excluded.<list2> <term2>   the unit (or the weapon) has <term2>, which the term's excluded.<list2> names
//   <list>:<term> requires <link>|<link>...  the unit has none of the links in that requires group (joined by '|', in order)
// For example 'weapon-families:rockets allowed.target-types high-air' or 'weapon-traits:stun min_tier t2'. Each
// ATYPICAL line ends with the string to record. Two weapons that break the same rule share one string.
//
// Output: a summary line, then WARN, ATYPICAL and ERROR lines, then OK or FAILED. Exit code 1 on errors.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// The parts of a unit or card (as a profile, see unitProfile) that the combination rules read, by word list.
const UNIT_PARTS = {
  classes: P => [P.class],
  tiers: P => [P.tier],
  nature: P => [P.nature],
  availability: P => [P.availability],
  roles: P => P.roles,
  mobility: P => [P.mobility],
  handling: P => [P.handling],
  'mobility-traits': P => P.traits,
  'speed-bands': P => [P.speed],
  bodies: P => [P.body],
  sizes: P => [P.size],
  'armour-classes': P => [P.armour],
  'armour-models': P => P.armourModels,
  'sight-bands': P => [P.sight],
  'sensor-traits': P => P.sensors,
  'crew-models': P => [P.crew],
  resources: P => P.resources,
  'ability-kinds': P => P.abilityKinds,
  'on-death': P => P.onDeath,
}
// The parts of one weapon, by word list, and how each is named in messages.
const WEAPON_PARTS = {
  'weapon-families': w => [w.family],
  'aim-models': w => [w.mount],
  'damage-types': w => [w.damage],
  'weapon-delivery': w => [w.delivery],
  'target-types': w => w.can_target,
  'range-bands': w => [w.range],
  'weapon-traits': w => w.traits,
}
const WEAPON_PART_NAME = {
  'weapon-families': 'family', 'aim-models': 'mount', 'damage-types': 'damage', 'weapon-delivery': 'delivery',
  'target-types': 'target', 'range-bands': 'range', 'weapon-traits': 'trait',
}
const READ_LISTS = new Set([...Object.keys(UNIT_PARTS), ...Object.keys(WEAPON_PARTS)])
const RULE_FIELDS = ['classes', 'min_tier', 'allowed', 'excluded', 'requires']
// Reads a part table: each list's values, without gaps or repeats.
const partsOf = (table, x) => Object.fromEntries(Object.entries(table).map(([k, get]) => [k, [...new Set((get(x) || []).filter(v => v != null))]]))
const repeated = xs => [...new Set(xs.filter((x, i) => xs.indexOf(x) !== i))]

/** Validates the data under `root` and returns { errors, warnings, atypical, summary }. */
export function validate(root = REPO_ROOT) {
  const errors = [], warnings = [], atypical = []
  const missingUnits = new Set() // unit links to units not researched yet; reported once at the end
  const err = m => errors.push(m)
  const warn = m => warnings.push(m)
  // Paths in messages always use '/', whatever the system.
  const ls = d => fs.existsSync(path.join(root, d))
    ? fs.readdirSync(path.join(root, d)).filter(f => f.endsWith('.json')).sort().map(f => `${d}/${f}`)
    : []
  const exists = p => fs.existsSync(path.join(root, p))
  // Reads a JSON file, or reports it and returns undefined when it isn't valid JSON.
  function read(p) {
    try { return JSON.parse(fs.readFileSync(path.join(root, p), 'utf8')) }
    catch (e) { err(`${p}: not valid JSON (${e.message})`); return undefined }
  }

  let games = [], units = [], patterns = []
  const vocab = {}, terms = {}
  const vocabFiles = ls('data/vocab')
  function done() {
    const termCount = Object.values(vocab).reduce((n, s) => n + s.size, 0)
    const summary = `vocabularies: ${vocabFiles.length}, terms: ${termCount}, games: ${games.length}, units: ${units.length}, patterns: ${patterns.length}`
    return { errors, warnings, atypical, summary }
  }

  // ================================================================ pass 1: JSON and schemas
  const vocabDocs = vocabFiles.map(f => ({ f, v: read(f) }))
  for (const { f, v } of vocabDocs) {
    if (v === undefined) continue
    if (path.posix.basename(f) !== `${v?.id}.json`) err(`${f}: file name must be <id>.json (the list's id is '${v?.id}')`)
    if (typeof v?.id !== 'string' || !Array.isArray(v.terms)) continue // the schema reports it
    const list = v.terms.filter(t => typeof t?.id === 'string')
    vocab[v.id] = new Set(list.map(t => t.id))
    terms[v.id] = Object.fromEntries(list.map(t => [t.id, t]))
  }
  const rank = (vid, id) => terms[vid]?.[id]?.rank

  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false })
  addFormats(ajv)
  ajv.addKeyword({
    keyword: 'x-vocab',
    schemaType: 'string',
    errors: true,
    validate: function check(vocabId, data) {
      if (data === null || typeof data !== 'string') return true
      if (!vocab[vocabId]) { check.errors = [{ message: `unknown vocabulary '${vocabId}'` }]; return false }
      if (!vocab[vocabId].has(data)) { check.errors = [{ message: `'${data}' is not a term of vocabulary '${vocabId}'` }]; return false }
      return true
    },
  })
  ajv.addKeyword({ keyword: 'x-ref-kinds', schemaType: 'object' })
  ajv.addKeyword({ keyword: 'x-provenance', schemaType: 'string' })
  // Notes for readers; the real rule is an if/then in the same schema.
  ajv.addKeyword({ keyword: 'x-required-unless', schemaType: 'string' })
  ajv.addKeyword({ keyword: 'x-required-when', schemaType: 'string' })
  const schemaFiles = ls('schemas')
  if (!schemaFiles.length) err('schemas/: no schema files found')
  const schemas = {}
  for (const f of schemaFiles) {
    const s = read(f)
    if (s === undefined) continue
    schemas[path.posix.basename(f)] = s
    try { ajv.addSchema(s) } catch (e) { err(`${f}: not a usable schema (${e.message})`) }
  }
  const REF_KINDS = schemas['common.schema.json']?.['x-ref-kinds'] || {}
  if (errors.length) return done()

  // Validates parsed data against a schema and reports every schema error; returns the data.
  function check(file, schemaId, data) {
    if (data === undefined) return undefined
    let fn
    try { fn = ajv.getSchema(schemaId) } catch (e) { err(`${file}: schema ${schemaId} does not compile (${e.message})`); return data }
    if (!fn) { err(`${file}: no schema '${schemaId}'`); return data }
    if (!fn(data)) {
      for (const e of fn.errors) {
        const allowed = e.params?.allowedValues ? ' ' + JSON.stringify(e.params.allowedValues) : ''
        err(`${file}: ${e.instancePath || '/'} ${e.message}${allowed}`)
      }
    }
    return data
  }
  const readChecked = (f, schemaId) => check(f, schemaId, read(f))

  for (const { f, v } of vocabDocs) check(f, 'vocabulary.schema.json', v)
  const GAMES = 'data/games.json', REGISTRY = 'data/pattern-registry.json'
  const gamesDoc = exists(GAMES) ? readChecked(GAMES, 'game.schema.json') : undefined
  const patternDocs = ls('data/patterns').map(f => ({ f, p: readChecked(f, 'pattern.schema.json') }))
  const registryDoc = exists(REGISTRY) ? readChecked(REGISTRY, 'pattern-registry.schema.json') : undefined
  const unitDocs = ls('data/units').map(f => ({ f, d: readChecked(f, 'source-unit.schema.json') }))
  const cardDocs = ls('docs/examples').filter(f => f.includes('concept-card')).map(f => ({ f, c: readChecked(f, 'concept-card.schema.json') }))
  if (errors.length) {
    warn('JSON or schema errors were found, so the rule checks (word lists, links, combination and card rules) did not run; fix those errors first')
    // Count what was read, so the summary line doesn't claim the data is empty.
    games = Array.isArray(gamesDoc?.games) ? gamesDoc.games : []
    units = unitDocs.flatMap(x => Array.isArray(x.d?.units) ? x.d.units : [])
    patterns = patternDocs.filter(x => x.p !== undefined).map(x => x.p)
    return done()
  }

  // ================================================================ pass 2: rules
  // The word lists are versioned together; the docs print this one version, and data files record it as vocab_version.
  const vocabVersions = {}
  for (const { f, v } of vocabDocs) (vocabVersions[v.version] ||= []).push(f)
  const vocabVersion = Object.entries(vocabVersions).sort((a, b) => b[1].length - a[1].length)[0]?.[0]
  for (const [ver, files] of Object.entries(vocabVersions)) {
    if (ver !== vocabVersion) for (const f of files) err(`${f}: version ${ver} differs from the other word lists' ${vocabVersion}`)
  }
  function checkVocabVersion(file, data) {
    if (vocabVersion && data.vocab_version !== vocabVersion) {
      warn(`${file}: coded against word lists ${data.vocab_version}, but they are now ${vocabVersion}; re-check it and update vocab_version`)
    }
  }

  // Term ids are unique; on a ranked list (one a ranked link kind names, or one whose terms carry ranks) every term
  // has a whole-number rank and no two terms share one.
  const rankedLists = new Set(Object.values(REF_KINDS).filter(k => k.ranked && k.vocab).map(k => k.vocab))
  for (const { f, v } of vocabDocs) {
    for (const id of repeated(v.terms.map(t => t.id))) err(`${f}: duplicate term id '${id}'`)
    if (!rankedLists.has(v.id) && !v.terms.some(t => t.rank !== undefined)) continue
    for (const t of v.terms) if (!Number.isInteger(t.rank)) err(`${f} ${t.id}: no rank, but every term of a ranked list needs a whole-number rank`)
    for (const r of repeated(v.terms.map(t => t.rank).filter(Number.isInteger))) err(`${f}: rank ${r} is used by more than one term`)
  }

  // A tie-break rule names two or more different terms, of its own list ('id') or of another ('<list>:id'). A term's
  // 'replaces' names ids of earlier versions, which are no longer terms of the list, each taken over by one term only.
  for (const { f, v } of vocabDocs) {
    for (const [i, tb] of (v.tie_breaks || []).entries()) {
      for (const x of tb.terms) {
        const [lid, id] = x.includes(':') ? x.split(':') : [v.id, x]
        if (!vocab[lid]) err(`${f} tie_breaks/${i}: unknown word list '${lid}' in '${x}'`)
        else if (!vocab[lid].has(id)) err(`${f} tie_breaks/${i}: '${x}' is not a term of '${lid}'`)
      }
      for (const x of repeated(tb.terms)) err(`${f} tie_breaks/${i}: '${x}' is named twice`)
    }
    const replaced = v.terms.flatMap(t => (t.replaces || []).map(r => ({ r, by: t.id })))
    for (const { r, by } of replaced) if (vocab[v.id]?.has(r)) err(`${f} ${by}: replaces '${r}', which is still a term of this list`)
    for (const r of repeated(replaced.map(x => x.r))) err(`${f}: '${r}' is replaced by more than one term`)
  }

  // class_rarity keys must be classes the term or pattern allows at all (values are checked by the schema).
  function checkClassRarity(where, classRarity, classes) {
    for (const c of Object.keys(classRarity || {})) {
      if (!(classes || []).includes(c)) err(`${where}: class_rarity names '${c}', which is not in its classes`)
    }
  }

  // ---------------------------------------------------------------- games, patterns, units
  games = gamesDoc?.games || []
  const gameById = Object.fromEntries(games.map(g => [g.id, g]))
  for (const id of repeated(games.map(g => g.id))) err(`${GAMES}: duplicate game id '${id}'`)
  for (const g of games) {
    for (const id of repeated(g.factions.map(x => x.id))) err(`${GAMES} ${g.id}: duplicate faction id '${id}'`)
    for (const id of repeated((g.expansions || []).map(x => x.id))) err(`${GAMES} ${g.id}: duplicate expansion id '${id}'`)
  }
  for (const { f, p } of patternDocs) {
    if (path.posix.basename(f) !== `${p.id}.json`) err(`${f}: file name must be <id>.json`)
    checkVocabVersion(f, p)
    patterns.push({ ...p, _file: f })
  }
  const patternById = Object.fromEntries(patterns.map(p => [p.id, p]))
  // The registry lists every pattern id agents may use. Written = has a file; planned = registry only.
  const registry = registryDoc?.patterns || []
  const registryById = Object.fromEntries(registry.map(p => [p.id, p]))
  if (new Set(registry.map(p => p.id)).size !== registry.length) err(`${REGISTRY}: duplicate pattern ids`)
  for (const p of patterns) {
    const r = registryById[p.id]
    if (!r) err(`${p._file}: pattern '${p.id}' is not in ${REGISTRY}`)
    else if (r.category !== p.category) err(`${p._file}: category '${p.category}' differs from the registry's '${r.category}'`)
  }
  // Returns false (and reports) when a pattern id is neither written nor planned.
  function patternKnown(where, id, what) {
    if (patternById[id]) return true
    if (registryById[id]) { warn(`${where}: ${what} '${id}' is planned, not filled in yet`); return false }
    err(`${where}: ${what} '${id}' is not in the pattern registry`)
    return false
  }
  for (const { f, d } of unitDocs) {
    checkVocabVersion(f, d)
    for (const u of d.units) units.push({ ...u, _file: f, _game: d.game })
  }
  for (const id of repeated(units.map(u => u.id))) {
    err(`duplicate unit id '${id}' (in ${[...new Set(units.filter(u => u.id === id).map(u => u._file))].join(', ')})`)
  }
  const unitIds = new Set(units.map(u => u.id))

  // ---------------------------------------------------------------- typed links
  // A link looks like 'kind:id', 'kind:<=id' or 'kind:>=id' (comparators only on ranked kinds).
  function parseRef(ref) {
    const i = ref.indexOf(':')
    const kind = ref.slice(0, i)
    let rest = ref.slice(i + 1), cmp = null
    if (rest.startsWith('<=') || rest.startsWith('>=')) { cmp = rest.slice(0, 2); rest = rest.slice(2) }
    return { kind, cmp, id: rest }
  }
  function checkRef(where, ref, { onCard = false } = {}) {
    const { kind, cmp, id } = parseRef(ref)
    const spec = REF_KINDS[kind]
    if (!spec) return err(`${where}: unknown link kind in ${ref}`)
    if (cmp && !spec.ranked) err(`${where}: ${ref} uses a comparator on an unranked kind`)
    if (kind === 'passengers') { if (!/^\d+$/.test(id)) err(`${where}: ${ref} needs a number`); return }
    if (kind === 'pattern') { patternKnown(where, id, 'pattern'); return }
    if (kind === 'unit') {
      if (onCard) err(`${where}: ${ref} -> real unit names may not appear in a card's matchups`)
      else if (!unitIds.has(id)) missingUnits.add(id)
      return
    }
    if (!vocab[spec.vocab]?.has(id)) err(`${where}: ${ref} does not resolve in '${spec.vocab}'`)
    else if (onCard && terms[spec.vocab][id].source_only) err(`${where}: ${ref} is research-only and can't be used on a card`)
  }

  // Word-list integrity: maps and links inside terms, and rules the combination checks would never read.
  for (const [vid, tm] of Object.entries(terms)) {
    for (const t of Object.values(tm)) {
      const w = `data/vocab/${vid}.json ${t.id}`
      for (const key of ['allowed', 'excluded', 'favoured', 'avoided']) {
        for (const [k, list] of Object.entries(t[key] || {})) {
          if (!vocab[k]) { err(`${w}.${key}: unknown vocabulary '${k}'`); continue }
          if ((key === 'allowed' || key === 'excluded') && !READ_LISTS.has(k)) {
            err(`${w}.${key}.${k}: the combination rules read no '${k}' part from a unit or card, so this map is never checked`)
          }
          for (const x of list) if (!vocab[k].has(x)) err(`${w}.${key}.${k}: unknown term '${x}'`)
        }
      }
      const rules = RULE_FIELDS.filter(k => t[k] !== undefined)
      if (rules.length && !READ_LISTS.has(vid)) {
        err(`${w}: has combination rules (${rules.join(', ')}), but the combination rules read no '${vid}' part from a unit or card, so they are never checked`)
      }
      for (const key of ['strong_vs', 'weak_vs', 'immune']) for (const r of t[key] || []) checkRef(w, r)
      for (const g of t.requires || []) for (const r of g) checkRef(w, r)
      if (t.pattern) patternKnown(w, t.pattern, 'pattern behind this key-bound trait')
      checkClassRarity(w, t.class_rarity, t.classes)
    }
  }

  // ---------------------------------------------------------------- profiles and matching
  // A profile is the flat set of parts that typed links and combination rules are matched against.
  const isKey = kind => terms['ability-kinds']?.[kind]?.uses_key === true
  // What kind of target a unit is, from its mobility: a flier is 'low-air' (jetpack, hovering flight) or
  // 'high-air' (jet, airship), and a tiny or small ground unit counts as infantry.
  function targetType(p) {
    const tt = terms.mobility?.[p.mobility]?.target_type
    if (tt === 'ground-vehicle' && (rank('sizes', p.size) ?? 9) <= 2) return 'infantry'
    return tt
  }
  function unitProfile(u) {
    const weapons = u.armament || []
    const abil = u.abilities || []
    return {
      class: u.class, tier: u.tier.band, nature: u.nature, availability: u.availability,
      roles: [u.roles.primary, ...(u.roles.secondary || [])],
      mobility: u.mobility.base, handling: u.mobility.handling, traits: u.mobility.traits || [], speed: u.mobility.speed,
      body: u.body.plan, size: u.body.size, armour: u.armour.class, armourModels: u.armour.models || [],
      sight: u.sensors?.sight, sensors: u.sensors?.traits || [],
      crew: u.crew.model, passengers: u.crew.passengers?.seats || 0, resources: u.resources || [],
      abilityKinds: abil.map(a => a.kind), onDeath: u.on_death?.outcomes || [],
      weapons, patterns: [...new Set([...abil.flatMap(a => a.patterns || []), ...weapons.flatMap(w => w.patterns || [])])],
    }
  }
  function cardProfile(c) {
    const p = c.parts
    const weapons = [p.armament.primary, p.armament.secondary, ...(p.armament.conditional || []).map(x => x.weapon)].filter(Boolean)
    const abil = [p.signature, ...(p.abilities || [])]
    return {
      class: p.class, tier: p.tier, nature: p.nature, availability: p.availability,
      roles: [p.roles.primary, ...(p.roles.secondary || [])],
      mobility: p.mobility.base, handling: p.mobility.handling, traits: p.mobility.traits || [], speed: p.mobility.speed,
      body: p.body.plan, size: p.body.size, armour: p.armour.class, armourModels: p.armour.models || [],
      sight: p.sensors?.sight, sensors: p.sensors?.traits || [],
      crew: p.crew.model, passengers: p.crew.passengers?.seats || 0, resources: p.resource ? [p.resource] : [],
      abilityKinds: abil.map(a => a.kind), onDeath: p.on_death || [],
      weapons, patterns: abil.map(a => a.pattern),
    }
  }
  function cmpRank(vid, have, cmp, want) {
    const a = rank(vid, have), b = rank(vid, want)
    if (cmp === '<=') return a <= b
    if (cmp === '>=') return a >= b
    return have === want
  }
  // Does profile P have the part that a typed link names?
  function matches(ref, P) {
    const { kind, cmp, id } = parseRef(ref)
    const W = P.weapons
    switch (kind) {
      case 'class': return P.class === id
      case 'role': return P.roles.includes(id)
      case 'tier': return cmpRank('tiers', P.tier, cmp, id)
      case 'damage': return W.some(w => w.damage === id)
      case 'armour-class': return cmpRank('armour-classes', P.armour, cmp, id)
      case 'armour-model': return P.armourModels.includes(id)
      case 'weapon': return W.some(w => w.family === id)
      case 'mobility': return P.mobility === id
      case 'mobility-trait': return P.traits.includes(id)
      case 'handling': return P.handling === id
      case 'body': return P.body === id
      case 'size': return cmpRank('sizes', P.size, cmp, id)
      case 'speed': return cmpRank('speed-bands', P.speed, cmp, id)
      case 'crew': return P.crew === id
      case 'passengers': {
        const n = Number(id)
        return cmp === '>=' ? P.passengers >= n : cmp === '<=' ? P.passengers <= n : P.passengers === n
      }
      case 'mount': return W.some(w => w.mount === id)
      case 'delivery': return W.some(w => w.delivery === id)
      case 'range': return W.some(w => w.range && cmpRank('range-bands', w.range, cmp, id))
      case 'weapon-trait': return W.some(w => (w.traits || []).includes(id))
      case 'target': return targetType(P) === id
      case 'hits': return W.some(w => (w.can_target || []).includes(id))
      case 'sight': return cmpRank('sight-bands', P.sight, cmp, id)
      case 'sensor': return P.sensors.includes(id)
      case 'nature': return P.nature === id
      // A planned pattern has no file yet, but the registry already gives its category.
      case 'category': return P.patterns.some(pid => (patternById[pid] || registryById[pid])?.category === id)
      case 'resource': return P.resources.includes(id)
      case 'pattern': return P.patterns.includes(id)
      default: return false
    }
  }

  // Exemptions that the word lists state in prose (see the header).
  function exempt(vid, k, x, w) {
    if (vid === 'weapon-families' && k === 'target-types' && x === 'high-air') {
      // Only a family that already reaches low air can be lifted to high air by the trait.
      return (w?.traits || []).includes('anti-air') && (terms[vid][w.family]?.allowed?.['target-types'] || ['low-air']).includes('low-air')
    }
    if (k === 'weapon-families' && x === 'adaptive') return true
    return false
  }
  // Combination rules: returns a list of { rule, msg } problems for a profile (rule strings as in the header).
  function combinationProblems(P) {
    const out = []
    const U = partsOf(UNIT_PARTS, P)
    const perWeapon = P.weapons.map(w => partsOf(WEAPON_PARTS, w))
    const allWeapons = Object.fromEntries(Object.keys(WEAPON_PARTS).map(k => [k, [...new Set(perWeapon.flatMap(W => W[k]))]]))
    const tierRank = rank('tiers', P.tier)
    // Checks one term's rules; has(k) gives the parts its allowed and excluded maps are compared with.
    function checkTerm(vid, id, has, w) {
      const t = terms[vid]?.[id]
      if (!t) return
      const name = w ? `weapon '${w.name || w.family}': ${WEAPON_PART_NAME[vid]} '${id}'` : `${vid} '${id}'`
      const add = (rule, msg) => out.push({ rule: `${vid}:${id} ${rule}`, msg: `${name} ${msg}` })
      if (t.classes && !t.classes.includes(P.class)) add(`classes ${P.class}`, `is not for class '${P.class}'`)
      if (t.min_tier && tierRank < rank('tiers', t.min_tier)) add(`min_tier ${t.min_tier}`, `needs tier ${t.min_tier} or higher`)
      for (const [k, list] of Object.entries(t.allowed || {})) {
        for (const x of has(k)) if (!list.includes(x) && !exempt(vid, k, x, w)) add(`allowed.${k} ${x}`, `doesn't combine with ${k} '${x}'`)
      }
      for (const [k, list] of Object.entries(t.excluded || {})) {
        for (const x of has(k)) if (list.includes(x)) add(`excluded.${k} ${x}`, `excludes ${k} '${x}'`)
      }
      for (const g of t.requires || []) if (!g.some(r => matches(r, P))) add(`requires ${g.join('|')}`, `requires one of [${g.join(', ')}]`)
    }
    for (const vid of Object.keys(UNIT_PARTS)) for (const id of U[vid]) checkTerm(vid, id, k => U[k] || allWeapons[k] || [])
    P.weapons.forEach((w, i) => {
      const W = perWeapon[i]
      for (const vid of Object.keys(WEAPON_PARTS)) for (const id of W[vid]) checkTerm(vid, id, k => W[k] || U[k] || [], w)
    })
    return out
  }
  // Does a '/'-separated path of field names and list positions exist on an object?
  function pathExists(obj, p) {
    if (typeof p !== 'string' || p === '') return false
    let at = obj
    for (const seg of p.split('/')) {
      if (at === null || typeof at !== 'object' || !Object.hasOwn(at, seg)) return false
      at = at[seg]
    }
    return true
  }

  // Field rules on one researched unit (header, part 5). w names the unit in messages; g is its game, if known.
  const LOADOUT_SLOTS = ['primary', 'secondary']
  function unitFieldRules(u, w, g) {
    const weaponName = x => `weapon '${x.name}' (${x.slot})`
    const commanded = g?.control === 'commanded'

    // Seats. Leaving a seat out means the driver; any other seat must be one the unit has.
    const seats = new Set([
      ...(terms['crew-models']?.[u.crew.model]?.seats || []),
      ...(u.crew.seats || []).map(s => s.role),
      ...(u.crew.passengers?.kind ? [u.crew.passengers.kind] : []),
    ])
    for (const [what, x] of [...u.armament.map(x => [weaponName(x), x]), ...u.abilities.map(x => [`ability '${x.name}'`, x])]) {
      if (x.seat === undefined) continue
      if (x.seat === 'driver') err(`${w}: ${what}: seat 'driver' is the default; leave it out`)
      else if (!seats.has(x.seat)) err(`${w}: ${what}: seat '${x.seat}' is not a seat of this unit`)
    }

    // The main weapon: one primary at most, first in the list. The driver's own weapon is the primary whenever the
    // driver has one at spawn, that is another primary or secondary entry with no seat.
    const primaries = u.armament.flatMap((x, i) => (x.slot === 'primary' ? [i] : []))
    if (primaries.length > 1 || primaries[0] > 0) {
      err(`${w}: primary at ${primaries.map(i => `armament/${i}`).join(', ')}: a unit has at most one primary weapon, listed first`)
    }
    const main = u.armament.find(x => x.slot === 'primary')
    if (main?.seat !== undefined && main.seat !== 'driver'
      && u.armament.some(x => x !== main && LOADOUT_SLOTS.includes(x.slot) && (x.seat ?? 'driver') === 'driver')) {
      err(`${w}: ${weaponName(main)} has seat '${main.seat}': the driver has a weapon, so the primary is the driver's: leave its seat out`)
    }
    for (const x of u.armament) {
      if (x.mount === 'body-aim' && (x.seat ?? 'driver') !== 'driver') err(`${w}: ${weaponName(x)} has seat '${x.seat}': body-aim is fired from the driver seat`)
      // 'when' names the rider, so it belongs on passenger weapons and nowhere else.
      if (x.slot === 'passenger' && x.when === undefined) err(`${w}: ${weaponName(x)} has no 'when': 'when' is for passenger weapons only, and every passenger weapon needs one`)
      if (x.slot !== 'passenger' && x.when !== undefined) err(`${w}: ${weaponName(x)} has 'when': 'when' is for passenger weapons only, and every passenger weapon needs one`)
    }

    // Option groups. A loadout group: option entries plus at most one primary or secondary entry, its default. An
    // upgrade group: acquired entries only, with no default.
    for (const x of u.armament) {
      if (x.slot === 'option' && x.option_group === undefined) err(`${w}: ${weaponName(x)} needs an option_group: every option entry belongs to a loadout group`)
      if (x.default === true && (x.option_group === undefined || !LOADOUT_SLOTS.includes(x.slot))) {
        err(`${w}: ${weaponName(x)} has default: true, which belongs only on the primary or secondary entry of a loadout group`)
      }
    }
    const groups = new Map()
    for (const x of u.armament) if (x.option_group !== undefined) groups.set(x.option_group, [...(groups.get(x.option_group) || []), x])
    for (const [id, xs] of groups) {
      if (xs.every(x => x.slot === 'acquired')) continue // an upgrade group
      const fitted = xs.filter(x => LOADOUT_SLOTS.includes(x.slot))
      if (fitted.length > 1 || xs.some(x => x.slot !== 'option' && !LOADOUT_SLOTS.includes(x.slot))) {
        err(`${w}: option_group '${id}' holds ${xs.map(x => x.slot).join(', ')}: it is neither a loadout group (option entries plus at most one primary or secondary entry, the default) nor an upgrade group (acquired entries only)`)
      } else if (fitted.length === 1 && fitted[0].default !== true) {
        err(`${w}: ${weaponName(fitted[0])} is the fitted choice of loadout group '${id}', so it needs default: true`)
      }
    }

    // Crew and death. In a game where players command units, nobody sits in a unit and a unit that dies is simply
    // gone; a proposal death outcome is decision 3C's default.
    if (commanded && u.crew.basis === 'in-game' && u.crew.model !== 'squad') {
      err(`${w}: crew basis in-game in ${g.id}, where players command units: an RTS unit has no player seats; use basis proposal`)
    }
    const outcomes = u.on_death?.outcomes || []
    if (u.on_death?.basis === 'proposal') {
      const want = u.nature === 'crewed-machine' && u.class !== 'infantry' ? 'bail-out' : 'respawn'
      if (outcomes.length !== 1 || outcomes[0] !== want) {
        err(`${w}: on_death [${outcomes.join(', ')}] with basis proposal should be [${want}]: a proposal death outcome is the 3C default; if the source shows another outcome, set basis in-game`)
      }
    }
    if (commanded && u.on_death?.basis === 'in-game' && outcomes.includes('respawn')) {
      err(`${w}: on_death respawn with basis in-game in ${g.id}, where players command units: an RTS unit that is simply gone is a proposal`)
    }

    // Handling: the mobility type's default, or strafe for a tiny or small unit on legs; anything else needs a reason.
    const def = terms.mobility?.[u.mobility.base]?.default_handling
    const smallOnLegs = ['tiny', 'small'].includes(u.body.size) && String(u.mobility.base).startsWith('legs')
    if (def && u.mobility.handling !== def && !(smallOnLegs && u.mobility.handling === 'strafe') && !u.mobility.notes?.trim()) {
      warn(`${w}: handling '${u.mobility.handling}' is not the '${u.mobility.base}' default '${def}': say why the handling differs in mobility.notes`)
    }

    // An ability with no pattern keeps its place, and a fit_note says which mechanic is wanted.
    u.abilities.forEach((a, i) => {
      if ((a.patterns || []).length) return
      const at = `abilities/${i}/patterns`
      if (!(u.fit_notes || []).some(n => n.path === at && typeof n.wanted === 'string' && n.wanted.trim())) {
        err(`${w}: ability '${a.name}' links no pattern and no fit_note at ${at} has a wanted text: an ability with no pattern needs a fit_note naming the mechanic wanted`)
      }
    })

    // Paths in fit_notes, uncertain and sources[].supports: '/' between parts and real positions. The last part may
    // be something left out (armament/0/traits on a weapon without traits), but what holds it must exist.
    const paths = [
      ...(u.fit_notes || []).map((n, i) => [`fit_notes/${i}`, n.path]),
      ...(u.uncertain || []).map((n, i) => [`uncertain/${i}`, n.path]),
      ...(u.sources || []).flatMap((s, i) => (s.supports || []).map((p, j) => [`sources/${i}/supports/${j}`, p])),
    ]
    for (const [at, p] of paths) {
      if (typeof p !== 'string') continue
      const parts = p.split('/')
      const parent = parts.slice(0, -1).join('/')
      const why = /[.*]/.test(p) ? "uses '.' or '*'"
        : parts.includes('') ? 'has an empty part'
        : parent && !pathExists(u, parent) ? `points into '${parent}', which does not exist on this unit`
        : null
      if (why) warn(`${w}: ${at} path '${p}' ${why}: write paths with / and real positions`)
    }
  }

  // ---------------------------------------------------------------- units
  for (const u of units) {
    const w = `${u._file} ${u.id}`
    if (u.game !== u._game) err(`${w}: game '${u.game}' but file is for '${u._game}'`)
    if (!u.id.startsWith(`${u.game}.${u.faction}.`)) err(`${w}: id must start with '${u.game}.${u.faction}.'`)
    const g = gameById[u.game]
    if (!g) err(`${w}: unknown game '${u.game}'`)
    else {
      if (!g.factions.some(x => x.id === u.faction)) err(`${w}: faction '${u.faction}' not in games.json`)
      if (u.introduced_in && u.introduced_in !== g.id && !(g.expansions || []).some(x => x.id === u.introduced_in)) {
        err(`${w}: introduced_in '${u.introduced_in}' unknown`)
      }
    }
    if (g) {
      if (u.tier.band === null && g.has_tiers) err(`${w}: tier band is null but ${g.id} has tiers`)
      if (u.tier.band !== null && !g.has_tiers) err(`${w}: ${g.id} has no tiers, so tier band must be null`)
      if (u.cost_band.band === null && g.has_costs) err(`${w}: cost band is null but ${g.id} has costs`)
      if (u.cost_band.band !== null && !g.has_costs) err(`${w}: ${g.id} has no costs, so cost band must be null`)
      const th = g.cost_thresholds
      if (th && typeof u.cost_band.raw === 'number') {
        const raw = u.cost_band.raw
        const band = raw >= th['very-high'] ? 'very-high' : raw >= th.high ? 'high' : raw >= th.medium ? 'medium' : raw >= th.low ? 'low' : 'very-low'
        if (band !== u.cost_band.band) err(`${w}: cost ${raw} maps to '${band}' under ${g.id}'s thresholds, not '${u.cost_band.band}'`)
      }
      // A gate tagged with a faction also serves its subfactions; 'shared' units may use any side's gate.
      const parent = g.factions.find(x => x.id === u.faction)?.parent
      const gateFits = t => !t.faction || t.faction === u.faction || t.faction === parent || u.faction === 'shared'
      if (u.tier.gate && g.tier_map && !g.tier_map.some(t => t.gate === u.tier.gate && t.band === u.tier.band && gateFits(t))) {
        err(`${w}: tier gate '${u.tier.gate}' / ${u.tier.band} not in ${g.id}'s tier_map`)
      }
      if (typeof u.mobility.speed_raw === 'number') {
        const r = u.mobility.speed_raw
        const band = r < 0.7 ? 'very-slow' : r < 1 ? 'slow' : r <= 1.5 ? 'medium' : r <= 2.5 ? 'fast' : 'very-fast'
        if (band !== u.mobility.speed) err(`${w}: speed ratio ${r} maps to '${band}', not '${u.mobility.speed}'`)
      }
    }
    for (const r of [...u.countered_by, ...u.counters, ...(u.combos || [])]) {
      const pr = parseRef(r.ref)
      if (pr.kind === 'unit' && !pr.id.startsWith(`${u.game}.`)) warn(`${w}: unit link ${r.ref} crosses games; prefer class, role, weapon or damage links`)
    }
    // The transform trait's own definition says the unit records its second form in modes.
    if ((u.mobility.traits || []).includes('transform') && !(u.modes || []).length) {
      err(`${w}: mobility trait transform with no modes: a unit that transforms records its second form in modes`)
    }
    for (const r of [...u.strengths, ...u.weaknesses, ...u.countered_by, ...u.counters, ...(u.combos || [])]) checkRef(w, r.ref)
    for (const wp of u.armament) if (wp.when) checkRef(`${w} weapon '${wp.name}'`, wp.when)
    for (const a of [...u.abilities, ...u.armament]) {
      for (const p of a.patterns || []) {
        if (!patternKnown(w, p, `pattern linked by '${a.name}'`)) continue
        if (!patternById[p].source_units.includes(u.id)) {
          warn(`${w}: links pattern '${p}', which does not list this unit: source_units out of date; the merge pass runs npm run sync-patterns`)
        }
      }
    }
    for (const m of u.modes || []) patternKnown(w, m.via, `pattern behind mode '${m.id}'`)
    if (u.roles.secondary?.includes(u.roles.primary)) err(`${w}: primary role repeated in secondary`)
    if (u.crew.passengers && !String(u.crew.passengers.kind).startsWith('passenger')) err(`${w}: passengers.kind must be a passenger seat role`)
    const multiSeat = (terms['crew-models']?.[u.crew.model]?.max_players || 1) > 1
    if (multiSeat && !u.crew.solo_fallback) err(`${w}: multi-seat crew model needs solo_fallback`)
    if (!multiSeat && u.crew.solo_fallback) err(`${w}: crew model '${u.crew.model}' has one player: solo_fallback is only for multi-seat crew models`)
    if (u.crew.model === 'squad' && !(u.body.count >= 2)) {
      err(`${w}: crew model squad with body.count ${u.body.count ?? 'left out'}: a squad needs body.count 2 or more`)
    }
    for (const wp of u.armament) {
      if (['passenger', 'acquired', 'alternate'].includes(wp.slot) && !wp.condition) err(`${w}: weapon '${wp.name}' (${wp.slot}) needs a condition`)
    }
    unitFieldRules(u, w, g)
    const P = unitProfile(u)
    for (const r of [...u.strengths, ...u.weaknesses]) {
      if (!['unit', 'pattern'].includes(parseRef(r.ref).kind) && !matches(r.ref, P)) {
        warn(`${w}: strength/weakness link ${r.ref} doesn't describe this unit's own parts`)
      }
    }
    // A real unit may break a rule; it must record it in 'atypical' under the exact rule string.
    const broken = new Map() // rule string -> first message
    for (const pr of combinationProblems(P)) {
      atypical.push(`${w}: ${pr.msg} (rule '${pr.rule}')`)
      if (!broken.has(pr.rule)) broken.set(pr.rule, pr.msg)
    }
    const recorded = u.atypical || []
    for (const [rule, msg] of broken) {
      if (!recorded.some(a => a.rule === rule)) err(`${w}: breaks a combination rule (${msg}) but 'atypical' has no entry with rule '${rule}'`)
    }
    for (const a of recorded) {
      if (!broken.has(a.rule)) err(`${w}: atypical entry '${a.rule}' at ${a.path} matches no broken rule (the rule must be the exact string an ATYPICAL line ends with)`)
      if (!pathExists(u, a.path)) err(`${w}: atypical entry '${a.rule}' has path '${a.path}', which does not exist on this unit`)
    }
  }

  // ---------------------------------------------------------------- patterns
  for (const p of patterns) {
    const w = `${p._file} ${p.id}`
    const computed = units
      .filter(u => unitProfile(u).patterns.includes(p.id) || (u.modes || []).some(m => m.via === p.id))
      .map(u => u.id)
      .sort()
    // Only a list sync-patterns can write is out of date: with no unit linking the pattern it leaves the list as it is.
    if (computed.length && p.source_units && JSON.stringify([...p.source_units].sort()) !== JSON.stringify(computed)) {
      warn(`${w}: source_units [${p.source_units}] differ from the units that link it [${computed}]: source_units out of date; the merge pass runs npm run sync-patterns`)
    }
    if (!computed.length && p.status !== 'merged' && p.status !== 'rejected') err(`${w}: no unit links this pattern`)
    for (const r of p.related || []) patternKnown(w, r.id, 'related pattern')
    if (p.status === 'merged' && !patternById[p.merged_into]) err(`${w}: merged_into '${p.merged_into}' does not exist`)
    if (!p.generator) continue
    const G = p.generator
    checkClassRarity(`${w} generator`, G.class_rarity, G.classes)
    for (const r of [...(G.requires || []).flat(), ...(G.excludes || []), ...(G.implies || [])]) checkRef(w, r)
    for (const r of [...(G.adds_strengths || []), ...(G.adds_weaknesses || []), ...(G.counters || []), ...G.countered_by]) {
      checkRef(w, r.ref, { onCard: true })
    }
    for (const c of G.conflicts_with || []) patternKnown(w, c, 'conflicts_with pattern')
    const vids = p.variants.map(x => x.id)
    if (new Set(vids).size !== vids.length) err(`${w}: duplicate variant ids`)
    for (const v of p.variants) {
      const o = v.overrides || {}
      for (const r of [...(o.requires || []).flat(), ...(o.excludes || []), ...(o.implies || [])]) checkRef(`${w} variant ${v.id}`, r)
      checkClassRarity(`${w} variant ${v.id}`, o.class_rarity, o.classes || G.classes)
      for (const r of [...(o.adds_strengths || []), ...(o.adds_weaknesses || []), ...(o.counters || []), ...(o.countered_by || [])]) {
        checkRef(`${w} variant ${v.id}`, r.ref, { onCard: true })
      }
    }
    for (const k of G.kinds) {
      const mt = terms['ability-kinds']?.[k]?.min_tier
      if (mt && rank('tiers', G.min_tier) < rank('tiers', mt)) warn(`${w}: kind '${k}' needs ${mt} but pattern min_tier is ${G.min_tier}`)
    }
  }

  // ---------------------------------------------------------------- example cards
  const simpleName = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const realNames = new Set(units.map(u => simpleName(u.name)))
  for (const { f, c } of cardDocs) {
    const P = cardProfile(c)
    for (const pr of combinationProblems(P)) err(`${f}: ${pr.msg}`)
    const A = c.parts.armament
    for (const [at, x] of [['primary', A.primary], ['secondary', A.secondary], ...(A.conditional || []).map((x, i) => [`conditional/${i}`, x.weapon])]) {
      if (x?.mount === 'body-aim' && (x.seat ?? 'driver') !== 'driver') err(`${f}: armament ${at} has seat '${x.seat}': body-aim is fired from the driver seat`)
    }
    const tier = terms.tiers?.[c.parts.tier] || {}
    const abil = [c.parts.signature, ...c.parts.abilities]
    const keys = abil.filter(a => isKey(a.kind)).length
      + c.parts.mobility.traits.filter(t => terms['mobility-traits']?.[t]?.uses_key).length
      + (c.parts.armament.secondary ? 1 : 0)
    const passives = abil.filter(a => !isKey(a.kind)).length
    if (keys > tier.max_keys) err(`${f}: ${keys} keys exceeds ${c.parts.tier} budget ${tier.max_keys}`)
    if (passives > tier.max_passive) err(`${f}: ${passives} passives exceeds ${c.parts.tier} budget ${tier.max_passive}`)
    if (keys !== c.balance.keys) err(`${f}: balance.keys says ${c.balance.keys}, counted ${keys}`)
    const cardTier = rank('tiers', c.parts.tier)
    abil.forEach((a, i) => {
      const slot = i === 0 ? 'signature' : 'extra'
      if (isKey(a.kind) && !a.cooldown) err(`${f}: ability '${a.pattern}' uses a key but has no cooldown`)
      const pat = patternById[a.pattern]
      if (!pat) {
        if (registryById[a.pattern]) err(`${f}: pattern '${a.pattern}' is planned, not written yet, so a card can't use it`)
        else err(`${f}: pattern '${a.pattern}' is not in the pattern registry`)
        return
      }
      if (pat.status === 'merged' || pat.status === 'rejected') err(`${f}: pattern '${a.pattern}' is ${pat.status}, so a card can't use it`)
      if (!pat.generator) { err(`${f}: pattern '${a.pattern}' has no generator yet, so a card can't use it`); return }
      const G = pat.generator
      const v = a.variant ? pat.variants.find(x => x.id === a.variant) : undefined
      if (a.variant && !v) err(`${f}: unknown variant '${a.variant}' of '${a.pattern}'`)
      const vo = v?.overrides || {}
      const what = `pattern '${a.pattern}'${v ? ` (variant '${v.id}')` : ''}`
      if (!(vo.kinds || G.kinds).includes(a.kind)) err(`${f}: ${what} can't be a '${a.kind}' ability`)
      if (G.slot === 'signature' && slot !== 'signature') err(`${f}: ${what} can only be the card's signature ability`)
      if (G.slot === 'extra' && slot !== 'extra') err(`${f}: ${what} can only be an extra ability, not the signature`)
      const mt = vo.min_tier || G.min_tier
      if (cardTier < rank('tiers', mt)) err(`${f}: ${what} needs tier ${mt} or higher`)
      const cls = vo.classes || G.classes
      if (!cls.includes(c.parts.class)) err(`${f}: ${what} is not for class '${c.parts.class}'`)
      for (const g of vo.requires || G.requires || []) {
        if (!g.some(r => matches(r, P))) err(`${f}: ${what} requires one of [${g.join(', ')}]`)
      }
      for (const r of vo.excludes || G.excludes || []) if (matches(r, P)) err(`${f}: ${what} excludes ${r}`)
      for (const r of vo.implies || G.implies || []) if (!matches(r, P)) err(`${f}: ${what} implies ${r}, which the card lacks`)
    })
    // Patterns that may not share a card (either side may list the other).
    for (let i = 0; i < abil.length; i++) {
      for (let j = i + 1; j < abil.length; j++) {
        const [a, b] = [abil[i].pattern, abil[j].pattern]
        if ((patternById[a]?.generator?.conflicts_with || []).includes(b) || (patternById[b]?.generator?.conflicts_with || []).includes(a)) {
          err(`${f}: patterns '${a}' and '${b}' conflict, so they may not share a card`)
        }
      }
    }
    const M = c.matchups
    for (const s of M.strengths) if (s.paired_with >= M.weaknesses.length) err(`${f}: strength '${s.ref}' paired with a missing weakness`)
    for (const r of [...M.strengths, ...M.weaknesses]) {
      checkRef(f, r.ref, { onCard: true })
      if (!matches(r.ref, P)) err(`${f}: matchup link ${r.ref} doesn't match the card's own parts`)
    }
    for (const r of [...M.countered_by, ...M.counters]) checkRef(f, r.ref, { onCard: true })
    if (realNames.has(simpleName(c.text.name))) err(`${f}: working name matches a real unit name`)
    if ((terms['crew-models']?.[c.parts.crew.model]?.max_players || 1) > 1 && !c.parts.crew.solo_fallback) err(`${f}: multi-seat crew needs a solo fallback`)
    for (const fl of c.balance.flags) if (terms['balance-flags']?.[fl]?.severity === 'block') err(`${f}: blocking flag '${fl}' on a rolled card`)
  }

  if (missingUnits.size) warn(`${missingUnits.size} unit link(s) point to units not researched yet: ${[...missingUnits].sort().join(', ')}`)
  return done()
}

/** The printed report: summary, WARN, ATYPICAL and ERROR lines, then OK or FAILED. */
export function formatReport({ errors, warnings, atypical, summary }) {
  return [
    summary,
    ...warnings.map(w => `WARN     ${w}`),
    ...atypical.map(a => `ATYPICAL ${a}`),
    ...errors.map(e => `ERROR    ${e}`),
    errors.length ? `FAILED with ${errors.length} error(s)` : 'OK',
  ].join('\n')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] || REPO_ROOT)
  try {
    const result = validate(root)
    console.log(formatReport(result))
    process.exitCode = result.errors.length ? 1 : 0
  } catch (e) {
    // A crash is a bug in the validator, but it must still fail the check with a readable line.
    console.log(`ERROR    internal: ${e.message}`)
    console.log('FAILED with 1 error(s)')
    console.error(e.stack)
    process.exitCode = 1
  }
}
