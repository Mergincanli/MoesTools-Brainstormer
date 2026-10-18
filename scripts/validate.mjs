// Validates the Unit Forge data. Usage: node scripts/validate.mjs [root]   (root defaults to the repo root)
//
// What it checks:
// 1) JSON Schema validation (Ajv, draft 2020-12) of every file in data/ and the example cards, with an
//    x-vocab keyword that checks term ids against the word lists in data/vocab/.
// 2) Word-list integrity: allowed/excluded/favoured/avoided maps, typed links, ranks, key-bound patterns, class
//    rarities (every class_rarity key must be in the term's classes), and one version shared by all word lists.
// 3) Cross-references: patterns <-> units, the pattern registry, games and factions, typed links.
// 4) Combination rules (classes, allowed, excluded, requires, min_tier, sensors included; per weapon, its family's
//    and its delivery's lists, such as which air layers it reaches): errors on example concept cards;
//    on researched units each broken rule is printed as ATYPICAL and must be recorded in the unit's
//    'atypical' list (and every 'atypical' entry must match a broken rule).
// 5) Card rules: key and passive budgets per tier, cooldowns, strength/weakness pairing, matchups that
//    describe the card's own parts, and no real unit names or unit links on a card.
//
// Output: a summary line, then WARN, ATYPICAL and ERROR lines, then OK or FAILED. Exit code 1 on errors.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Validates the data under `root` and returns { errors, warnings, atypical, summary }. */
export function validate(root = REPO_ROOT) {
  const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'))
  const ls = d => fs.existsSync(path.join(root, d))
    ? fs.readdirSync(path.join(root, d)).filter(f => f.endsWith('.json')).sort().map(f => path.join(d, f))
    : []

  const errors = [], warnings = [], atypical = []
  const missingUnits = new Set() // unit links to units not researched yet; reported once at the end
  const err = m => errors.push(m)
  const warn = m => warnings.push(m)

  // ---------------------------------------------------------------- word lists and schemas
  const vocabFiles = ls('data/vocab')
  const vocab = {}, terms = {}
  for (const f of vocabFiles) {
    const v = read(f)
    vocab[v.id] = new Set(v.terms.map(t => t.id))
    terms[v.id] = Object.fromEntries(v.terms.map(t => [t.id, t]))
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
  const schemas = Object.fromEntries(ls('schemas').map(f => [path.basename(f), read(f)]))
  for (const s of Object.values(schemas)) ajv.addSchema(s)
  const REF_KINDS = schemas['common.schema.json']['x-ref-kinds']

  // Validates one file against a schema, reports every schema error and returns the data.
  function check(file, schemaId) {
    const data = read(file)
    const fn = ajv.getSchema(schemaId)
    if (!fn(data)) {
      for (const e of fn.errors) {
        const allowed = e.params?.allowedValues ? ' ' + JSON.stringify(e.params.allowedValues) : ''
        err(`${file}: ${e.instancePath || '/'} ${e.message}${allowed}`)
      }
    }
    return data
  }

  for (const f of vocabFiles) check(f, 'vocabulary.schema.json')

  // The word lists are versioned together; the docs print this one version, and data files record it as vocab_version.
  const vocabVersions = {}
  for (const f of vocabFiles) (vocabVersions[read(f).version] ||= []).push(f)
  const vocabVersion = Object.entries(vocabVersions).sort((a, b) => b[1].length - a[1].length)[0]?.[0]
  for (const [ver, files] of Object.entries(vocabVersions)) {
    if (ver !== vocabVersion) for (const f of files) err(`${f}: version ${ver} differs from the other word lists' ${vocabVersion}`)
  }
  function checkVocabVersion(file, data) {
    if (vocabVersion && data.vocab_version !== vocabVersion) {
      warn(`${file}: coded against word lists ${data.vocab_version}, but they are now ${vocabVersion}; re-check it and update vocab_version`)
    }
  }

  // class_rarity keys must be classes the term or pattern allows at all (values are checked by the schema).
  function checkClassRarity(where, classRarity, classes) {
    for (const c of Object.keys(classRarity || {})) {
      if (!(classes || []).includes(c)) err(`${where}: class_rarity names '${c}', which is not in its classes`)
    }
  }

  // ---------------------------------------------------------------- games, patterns, units
  const games = fs.existsSync(path.join(root, 'data/games.json')) ? check('data/games.json', 'game.schema.json').games : []
  const gameById = Object.fromEntries(games.map(g => [g.id, g]))
  const patterns = []
  for (const f of ls('data/patterns')) {
    const p = check(f, 'pattern.schema.json')
    if (path.basename(f) !== `${p.id}.json`) err(`${f}: file name must be <id>.json`)
    checkVocabVersion(f, p)
    patterns.push({ ...p, _file: f })
  }
  const patternById = Object.fromEntries(patterns.map(p => [p.id, p]))
  // The registry lists every pattern id agents may use. Written = has a file; planned = registry only.
  const registry = fs.existsSync(path.join(root, 'data/pattern-registry.json'))
    ? check('data/pattern-registry.json', 'pattern-registry.schema.json').patterns
    : []
  const registryById = Object.fromEntries(registry.map(p => [p.id, p]))
  if (new Set(registry.map(p => p.id)).size !== registry.length) err('data/pattern-registry.json: duplicate pattern ids')
  for (const p of patterns) {
    const r = registryById[p.id]
    if (!r) err(`${p._file}: pattern '${p.id}' is not in data/pattern-registry.json`)
    else if (r.category !== p.category) err(`${p._file}: category '${p.category}' differs from the registry's '${r.category}'`)
  }
  // Returns false (and reports) when a pattern id is neither written nor planned.
  function patternKnown(where, id, what) {
    if (patternById[id]) return true
    if (registryById[id]) { warn(`${where}: ${what} '${id}' is planned, not filled in yet`); return false }
    err(`${where}: ${what} '${id}' is not in the pattern registry`)
    return false
  }
  const units = []
  for (const f of ls('data/units')) {
    const d = check(f, 'source-unit.schema.json')
    checkVocabVersion(f, d)
    for (const u of d.units) units.push({ ...u, _file: f, _game: d.game })
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

  // Word-list integrity: maps and links inside terms.
  for (const [vid, tm] of Object.entries(terms)) {
    for (const t of Object.values(tm)) {
      const w = `data/vocab/${vid}.json ${t.id}`
      for (const key of ['allowed', 'excluded', 'favoured', 'avoided']) {
        for (const [k, list] of Object.entries(t[key] || {})) {
          if (!vocab[k]) { err(`${w}.${key}: unknown vocabulary '${k}'`); continue }
          for (const x of list) if (!vocab[k].has(x)) err(`${w}.${key}.${k}: unknown term '${x}'`)
        }
      }
      for (const key of ['strong_vs', 'weak_vs', 'immune']) for (const r of t[key] || []) checkRef(w, r)
      for (const g of t.requires || []) for (const r of g) checkRef(w, r)
      if (t.pattern) patternKnown(w, t.pattern, 'pattern behind this key-bound trait')
      checkClassRarity(w, t.class_rarity, t.classes)
    }
  }

  // ---------------------------------------------------------------- profiles and matching
  // A profile is the flat set of parts that typed links and combination rules are matched against.
  const isKey = kind => terms['ability-kinds'][kind]?.uses_key === true
  // What kind of target a unit is, from its mobility: a flier is 'low-air' (jetpack, hovering flight) or
  // 'high-air' (jet, airship), and a tiny or small ground unit counts as infantry.
  function targetType(p) {
    const tt = terms.mobility[p.mobility]?.target_type
    if (tt === 'ground-vehicle' && (rank('sizes', p.size) ?? 9) <= 2) return 'infantry'
    return tt
  }
  function unitProfile(u) {
    const weapons = u.armament || []
    const abil = u.abilities || []
    return {
      class: u.class, tier: u.tier.band, nature: u.nature, roles: [u.roles.primary, ...(u.roles.secondary || [])],
      mobility: u.mobility.base, handling: u.mobility.handling, traits: u.mobility.traits || [], speed: u.mobility.speed,
      body: u.body.plan, size: u.body.size, armour: u.armour.class, armourModels: u.armour.models,
      sight: u.sensors?.sight, sensors: u.sensors?.traits || [],
      crew: u.crew.model, passengers: u.crew.passengers?.seats || 0, resources: u.resources || [],
      weapons, patterns: [...new Set([...abil.flatMap(a => a.patterns), ...weapons.flatMap(w => w.patterns || [])])],
    }
  }
  function cardProfile(c) {
    const p = c.parts
    const weapons = [p.armament.primary, p.armament.secondary, ...p.armament.conditional.map(x => x.weapon)].filter(Boolean)
    const abil = [p.signature, ...p.abilities]
    return {
      class: p.class, tier: p.tier, nature: p.nature, roles: [p.roles.primary, ...p.roles.secondary],
      mobility: p.mobility.base, handling: p.mobility.handling, traits: p.mobility.traits, speed: p.mobility.speed,
      body: p.body.plan, size: p.body.size, armour: p.armour.class, armourModels: p.armour.models,
      sight: p.sensors?.sight, sensors: p.sensors?.traits || [],
      crew: p.crew.model, passengers: p.crew.passengers?.seats || 0, resources: p.resource ? [p.resource] : [],
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
      case 'category': return P.patterns.some(pid => patternById[pid]?.category === id)
      case 'resource': return P.resources.includes(id)
      case 'pattern': return P.patterns.includes(id)
      default: return false
    }
  }

  // Combination rules: returns a list of { key: '<vocab>:<term>', msg } problems for a profile.
  function combinationProblems(P) {
    const out = []
    const used = {
      classes: [P.class], tiers: [P.tier], nature: [P.nature], roles: P.roles, mobility: [P.mobility], handling: [P.handling],
      'mobility-traits': P.traits, 'speed-bands': [P.speed], bodies: [P.body], sizes: [P.size], 'armour-classes': [P.armour],
      'armour-models': P.armourModels, 'sight-bands': [P.sight], 'sensor-traits': P.sensors, 'crew-models': [P.crew], resources: P.resources,
      'aim-models': [...new Set(P.weapons.map(w => w.mount).filter(Boolean))],
      'weapon-families': [...new Set(P.weapons.map(w => w.family))],
    }
    // These lists are checked per weapon below, not against the whole profile.
    const perWeapon = new Set(['damage-types', 'weapon-delivery', 'target-types', 'range-bands', 'weapon-traits'])
    const tierRank = rank('tiers', P.tier)
    for (const [vid, ids] of Object.entries(used)) {
      for (const id of ids) {
        const t = terms[vid]?.[id]
        if (!t) continue
        const name = `${vid} '${id}'`, key = `${vid}:${id}`
        const add = m => out.push({ key, msg: m })
        if (t.classes && !t.classes.includes(P.class)) add(`${name} is not for class '${P.class}'`)
        if (t.min_tier && tierRank < rank('tiers', t.min_tier)) add(`${name} needs tier ${t.min_tier} or higher`)
        for (const [k, list] of Object.entries(t.allowed || {})) {
          if (perWeapon.has(k)) continue
          for (const x of used[k] || []) if (!list.includes(x)) add(`${name} doesn't combine with ${k} '${x}'`)
        }
        for (const [k, list] of Object.entries(t.excluded || {})) {
          if (perWeapon.has(k)) continue
          for (const x of used[k] || []) if (list.includes(x)) add(`${name} excludes ${k} '${x}'`)
        }
        for (const g of t.requires || []) if (!g.some(r => matches(r, P))) add(`${name} requires one of [${g.join(', ')}]`)
      }
    }
    for (const w of P.weapons) {
      const fam = terms['weapon-families'][w.family]
      if (!fam) continue
      const add = (key, m) => out.push({ key, msg: m })
      const label = `weapon '${w.name || w.family}'`
      const checkFamily = (k, vals) => {
        const list = fam.allowed?.[k]
        if (list) {
          for (const x of vals.filter(Boolean)) {
            if (!list.includes(x)) add(`weapon-families:${w.family}`, `${label}: family '${w.family}' doesn't combine with ${k} '${x}'`)
          }
        }
      }
      checkFamily('damage-types', [w.damage])
      checkFamily('weapon-delivery', [w.delivery])
      checkFamily('target-types', w.can_target || [])
      // A delivery can limit what the weapon reaches: a lobbed or dropped shot lands on the ground, so it never hits fliers.
      const reach = terms['weapon-delivery'][w.delivery]?.allowed?.['target-types']
      if (reach) {
        for (const x of (w.can_target || []).filter(Boolean)) {
          if (!reach.includes(x)) add(`weapon-delivery:${w.delivery}`, `${label}: delivery '${w.delivery}' doesn't combine with target-types '${x}'`)
        }
      }
      const body = terms.bodies[P.body]
      if (body?.allowed?.['aim-models'] && w.mount && !body.allowed['aim-models'].includes(w.mount)) {
        add(`bodies:${P.body}`, `body '${P.body}' doesn't take mount '${w.mount}'`)
      }
      if (body?.allowed?.['weapon-families'] && !body.allowed['weapon-families'].includes(w.family) && w.family !== 'adaptive') {
        add(`bodies:${P.body}`, `body '${P.body}' doesn't take weapon family '${w.family}'`)
      }
      const traits = w.traits || []
      for (const tr of traits) {
        for (const x of terms['weapon-traits'][tr]?.excluded?.['weapon-traits'] || []) {
          if (traits.includes(x)) add(`weapon-traits:${tr}`, `${label}: trait '${tr}' excludes '${x}'`)
        }
      }
      for (const tr of traits) {
        const mt = terms['weapon-traits'][tr]?.min_tier
        if (mt && tierRank < rank('tiers', mt)) add(`weapon-traits:${tr}`, `${label}: trait '${tr}' needs tier ${mt}`)
      }
    }
    for (const r of P.roles) {
      for (const g of terms.roles[r]?.requires || []) {
        if (!g.some(x => matches(x, P))) out.push({ key: `roles:${r}`, msg: `role '${r}' requires one of [${g.join(', ')}]` })
      }
    }
    return out
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
    if ((u.mobility.traits || []).includes('transform') && !(u.modes || []).length) {
      atypical.push(`${w}: transform trait without a recorded second form (modes)`)
    }
    for (const r of [...u.strengths, ...u.weaknesses, ...u.countered_by, ...u.counters, ...(u.combos || [])]) checkRef(w, r.ref)
    for (const wp of u.armament) if (wp.when) checkRef(`${w} weapon '${wp.name}'`, wp.when)
    for (const a of [...u.abilities, ...u.armament]) {
      for (const p of a.patterns || []) {
        if (!patternKnown(w, p, `pattern linked by '${a.name}'`)) continue
        if (!patternById[p].source_units.includes(u.id)) err(`${w}: links pattern '${p}' but the pattern does not list this unit`)
      }
    }
    for (const m of u.modes || []) patternKnown(w, m.via, `pattern behind mode '${m.id}'`)
    if (u.roles.secondary?.includes(u.roles.primary)) err(`${w}: primary role repeated in secondary`)
    if (u.crew.passengers && !String(u.crew.passengers.kind).startsWith('passenger')) err(`${w}: passengers.kind must be a passenger seat role`)
    const multiSeat = (terms['crew-models'][u.crew.model]?.max_players || 1) > 1
    if (multiSeat && !u.crew.solo_fallback) err(`${w}: multi-seat crew model needs solo_fallback`)
    for (const wp of u.armament) {
      if (['passenger', 'acquired', 'alternate'].includes(wp.slot) && !wp.condition) err(`${w}: weapon '${wp.name}' (${wp.slot}) needs a condition`)
    }
    const P = unitProfile(u)
    for (const r of [...u.strengths, ...u.weaknesses]) {
      if (!['unit', 'pattern'].includes(parseRef(r.ref).kind) && !matches(r.ref, P)) {
        warn(`${w}: strength/weakness link ${r.ref} doesn't describe this unit's own parts`)
      }
    }
    // A real unit may break a rule; it must say so in 'atypical' (rule starts with the '<vocab>:<term>' key).
    const problems = combinationProblems(P)
    const recorded = u.atypical || []
    for (const pr of problems) {
      atypical.push(`${w}: ${pr.msg}`)
      if (!recorded.some(a => a.rule.split(' ')[0] === pr.key)) err(`${w}: breaks a combination rule (${pr.msg}) but 'atypical' has no entry for '${pr.key}'`)
    }
    for (const a of recorded) {
      if (!problems.some(pr => pr.key === a.rule.split(' ')[0])) err(`${w}: atypical entry '${a.rule}' at ${a.path} matches no broken rule`)
    }
  }

  // ---------------------------------------------------------------- patterns
  for (const p of patterns) {
    const w = `${p._file} ${p.id}`
    const computed = units
      .filter(u => unitProfile(u).patterns.includes(p.id) || (u.modes || []).some(m => m.via === p.id))
      .map(u => u.id)
      .sort()
    if (p.source_units && JSON.stringify([...p.source_units].sort()) !== JSON.stringify(computed)) {
      err(`${w}: source_units [${p.source_units}] differ from the units that link it [${computed}]`)
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
    }
    for (const v of p.variants) {
      const o = v.overrides || {}
      for (const r of [...(o.adds_strengths || []), ...(o.adds_weaknesses || []), ...(o.counters || []), ...(o.countered_by || [])]) {
        checkRef(`${w} variant ${v.id}`, r.ref, { onCard: true })
      }
    }
    for (const k of G.kinds) {
      const mt = terms['ability-kinds'][k]?.min_tier
      if (mt && rank('tiers', G.min_tier) < rank('tiers', mt)) warn(`${w}: kind '${k}' needs ${mt} but pattern min_tier is ${G.min_tier}`)
    }
  }

  // ---------------------------------------------------------------- example cards
  const simpleName = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const realNames = new Set(units.map(u => simpleName(u.name)))
  for (const f of ls('docs/examples')) {
    if (!f.includes('concept-card')) continue
    const c = check(f, 'concept-card.schema.json')
    const P = cardProfile(c)
    for (const pr of combinationProblems(P)) err(`${f}: ${pr.msg}`)
    const tier = terms.tiers[c.parts.tier]
    const abil = [c.parts.signature, ...c.parts.abilities]
    const keys = abil.filter(a => isKey(a.kind)).length
      + c.parts.mobility.traits.filter(t => terms['mobility-traits'][t]?.uses_key).length
      + (c.parts.armament.secondary ? 1 : 0)
    const passives = abil.filter(a => !isKey(a.kind)).length
    if (keys > tier.max_keys) err(`${f}: ${keys} keys exceeds ${c.parts.tier} budget ${tier.max_keys}`)
    if (passives > tier.max_passive) err(`${f}: ${passives} passives exceeds ${c.parts.tier} budget ${tier.max_passive}`)
    if (keys !== c.balance.keys) err(`${f}: balance.keys says ${c.balance.keys}, counted ${keys}`)
    for (const a of abil) {
      if (isKey(a.kind) && !a.cooldown) err(`${f}: ability '${a.pattern}' uses a key but has no cooldown`)
      const pat = patternById[a.pattern]
      if (!pat) { patternKnown(f, a.pattern, 'ability pattern'); continue }
      if (!pat.generator.kinds.includes(a.kind)) err(`${f}: pattern '${a.pattern}' can't be a '${a.kind}' ability`)
      if (a.variant && !pat.variants.some(v => v.id === a.variant)) err(`${f}: unknown variant '${a.variant}' of '${a.pattern}'`)
      const vo = pat.variants.find(v => v.id === a.variant)?.overrides || {}
      for (const g of vo.requires || pat.generator.requires || []) {
        if (!g.some(r => matches(r, P))) err(`${f}: pattern '${a.pattern}' requires one of [${g.join(', ')}]`)
      }
      for (const r of vo.excludes || pat.generator.excludes || []) if (matches(r, P)) err(`${f}: pattern '${a.pattern}' excludes ${r}`)
      for (const r of vo.implies || pat.generator.implies || []) if (!matches(r, P)) err(`${f}: pattern '${a.pattern}' implies ${r}, which the card lacks`)
      const cls = vo.classes || pat.generator.classes
      if (!cls.includes(c.parts.class)) err(`${f}: pattern '${a.pattern}' is not for class '${c.parts.class}'`)
    }
    const M = c.matchups
    for (const s of M.strengths) if (s.paired_with >= M.weaknesses.length) err(`${f}: strength '${s.ref}' paired with a missing weakness`)
    for (const r of [...M.strengths, ...M.weaknesses]) {
      checkRef(f, r.ref, { onCard: true })
      if (!matches(r.ref, P)) err(`${f}: matchup link ${r.ref} doesn't match the card's own parts`)
    }
    for (const r of [...M.countered_by, ...M.counters]) checkRef(f, r.ref, { onCard: true })
    if (realNames.has(simpleName(c.text.name))) err(`${f}: working name matches a real unit name`)
    if ((terms['crew-models'][c.parts.crew.model]?.max_players || 1) > 1 && !c.parts.crew.solo_fallback) err(`${f}: multi-seat crew needs a solo fallback`)
    for (const fl of c.balance.flags) if (terms['balance-flags'][fl].severity === 'block') err(`${f}: blocking flag '${fl}' on a rolled card`)
  }

  if (missingUnits.size) warn(`${missingUnits.size} unit link(s) point to units not researched yet: ${[...missingUnits].sort().join(', ')}`)
  const termCount = Object.values(vocab).reduce((n, s) => n + s.size, 0)
  const summary = `vocabularies: ${vocabFiles.length}, terms: ${termCount}, games: ${games.length}, units: ${units.length}, patterns: ${patterns.length}`
  return { errors, warnings, atypical, summary }
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
  const result = validate(root)
  console.log(formatReport(result))
  process.exitCode = result.errors.length ? 1 : 0
}
