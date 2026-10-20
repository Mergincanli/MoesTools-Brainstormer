// Tests for the validator (the repo passes; broken copies each fail in the expected way, or only warn) and for the
// research checker's tools (the sampler's deterministic pick, and copy-check's word matching, offline).
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it, before, after } from 'node:test'
import { REPO_ROOT, validate } from '../scripts/validate.mjs'
import { buildSample, pickCount, sampleIds } from '../scripts/sample-for-check.mjs'
import { citedUrls, grams, mediaWikiTarget, proseStrings, sharedRuns, wikitextToText, words } from '../scripts/copy-check.mjs'

const VALIDATE = path.join(REPO_ROOT, 'scripts/validate.mjs')
const SAMPLE = path.join(REPO_ROOT, 'scripts/sample-for-check.mjs')

// ---------------------------------------------------------------- helpers for broken copies

const tmpDirs = []
function freshCopy() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-validate-'))
  tmpDirs.push(dir)
  for (const d of ['schemas', 'data', 'docs/examples']) fs.cpSync(path.join(REPO_ROOT, d), path.join(dir, d), { recursive: true })
  return dir
}
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })

const load = (dir, f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
const dump = (dir, f, d) => fs.writeFileSync(path.join(dir, f), JSON.stringify(d, null, 2))
const unit = (d, slug) => d.units.find(u => u.id.endsWith('.' + slug)) ?? assert.fail(`no unit '${slug}' in the data`)
const UNITS = 'data/units/ra3.json'
const REGISTRY = 'data/pattern-registry.json'
const GAMES = 'data/games.json'
const CARD = 'docs/examples/concept-card.example.json'
const PATTERN = id => `data/patterns/${id}.json`
const VOCAB = id => `data/vocab/${id}.json`
// The first term in a word list that has a class rarity (decision 4B), so the cases don't depend on one term.
const crossOverTerm = v => v.terms.find(t => t.class_rarity) ?? assert.fail(`no term in '${v.id}' has a class_rarity`)
const term = (v, id) => v.terms.find(t => t.id === id) ?? assert.fail(`no term '${id}' in '${v.id}'`)
// Changes one word list (or pattern, unit file, card) in a copy.
const edit = (dir, f, fn) => { const d = load(dir, f); fn(d); dump(dir, f, d) }
const editTerm = (dir, list, id, fn) => edit(dir, VOCAB(list), v => fn(term(v, id)))
const editUnit = (dir, slug, fn) => edit(dir, UNITS, d => fn(unit(d, slug)))
// A copy of one of a unit's weapons under a new name, slot and fields (for loadout and upgrade groups).
function extraWeapon(u, i, fields) {
  const { default: _, option_group: __, ...copy } = structuredClone(u.armament[i])
  u.armament.push({ ...copy, name: `Test copy of ${u.armament[i].name}`, ...fields })
}
const gameOf = (dir, u) => load(dir, GAMES).games.find(g => g.id === u.game) ?? assert.fail(`no game '${u.game}'`)
// Puts a plain 'anti-air' weapon trait in a copy: the data may not have it yet, or may give it rules of its own.
function plainAntiAir(dir) {
  edit(dir, VOCAB('weapon-traits'), v => {
    v.terms = v.terms.filter(t => t.id !== 'anti-air')
    v.terms.push({ id: 'anti-air', label: 'Anti-air', description: 'Test copy: reaches high air whatever its family.' })
  })
}
const allowedTargets = (dir, family) => term(load(dir, VOCAB('weapon-families')), family).allowed['target-types']
// The IFV weapon (and its index) whose break an atypical entry records, found by the start of the entry's rule.
function recordedWeapon(u, rulePrefix) {
  const a = u.atypical.find(x => x.rule.startsWith(rulePrefix)) ?? assert.fail(`no atypical entry starting '${rulePrefix}'`)
  const i = Number(a.path.split('/')[1])
  return { i, w: u.armament[i] }
}
// A rule-free role nobody has, now requiring the category of a planned pattern the Hammer Tank doesn't reach yet;
// the Hammer Tank takes that role. Returns what a case needs to link the planned pattern.
function categoryRole(dir) {
  const d = load(dir, UNITS), c = load(dir, CARD), reg = load(dir, REGISTRY).patterns
  const used = new Set([...d.units.flatMap(u => [u.roles.primary, ...(u.roles.secondary || [])]), c.parts.roles.primary, ...c.parts.roles.secondary])
  const roles = load(dir, VOCAB('roles'))
  const role = roles.terms.find(t => !t.requires && !t.classes && !used.has(t.id)) ?? assert.fail('no free role without rules')
  const u = unit(d, 'hammer-tank')
  const linked = new Set([...u.abilities, ...u.armament].flatMap(a => a.patterns || []))
  const have = new Set(reg.filter(p => linked.has(p.id)).map(p => p.category))
  const planned = reg.find(p => !fs.existsSync(path.join(dir, PATTERN(p.id))) && !have.has(p.category)) ?? assert.fail('no planned pattern to use')
  role.requires = [[`category:${planned.category}`]]; dump(dir, VOCAB('roles'), roles)
  u.roles.secondary = [...(u.roles.secondary || []), role.id]
  return { d, u, role, planned }
}

// Each case breaks one thing in a fresh copy. kind 'error': a new ERROR containing `expect`;
// kind 'warn': a new WARN containing `expect` and no new error; kind 'ok': no new error at all;
// kind 'no-warn': no new error and no new WARN containing `expect`.
// `expect` may be a function of the copy, for text that comes from the word lists.
const cases = [
  ['unit links an unknown pattern', 'is not in the pattern registry', 'error', dir => {
    const d = load(dir, UNITS); unit(d, 'terror-drone').abilities[0].patterns.push('made-up-pattern'); dump(dir, UNITS, d)
  }],
  ['unit links a planned pattern (warn only)', 'is planned, not filled in yet', 'warn', dir => {
    // A pattern in the registry with no file yet, not linked here already (the original case used 'cloak').
    const d = load(dir, UNITS); const linked = unit(d, 'terror-drone').abilities[0].patterns
    const planned = load(dir, REGISTRY).patterns.find(p => !fs.existsSync(path.join(dir, PATTERN(p.id))) && !linked.includes(p.id))
    assert.ok(planned, 'the registry has no planned pattern to link')
    linked.push(planned.id); dump(dir, UNITS, d)
  }],
  ['written pattern missing from registry', 'is not in data/pattern-registry.json', 'error', dir => {
    const r = load(dir, REGISTRY); r.patterns = r.patterns.filter(p => p.id !== 'infest-vehicle'); dump(dir, REGISTRY, r)
  }],
  ['pattern category differs from registry', 'differs from the registry', 'error', dir => {
    const r = load(dir, REGISTRY); r.patterns.find(p => p.id === 'infest-vehicle').category = 'mobility'; dump(dir, REGISTRY, r)
  }],
  ['duplicate registry id', 'duplicate pattern ids', 'error', dir => {
    const r = load(dir, REGISTRY); r.patterns.push({ ...r.patterns[0] }); dump(dir, REGISTRY, r)
  }],
  ["rule break not recorded in atypical", "but 'atypical' has no entry", 'error', dir => {
    // A unit that records rule breaks (the original case used the Multigunner IFV).
    const d = load(dir, UNITS); const u = d.units.find(x => x.atypical?.length)
    assert.ok(u, 'no unit records a rule break'); delete u.atypical; dump(dir, UNITS, d)
  }],
  ['stale atypical entry', 'matches no broken rule', 'error', dir => {
    const d = load(dir, UNITS); const u = unit(d, 'hammer-tank')
    u.atypical = [...(u.atypical || []), { path: 'class', rule: 'classes:tank invented', note: 'test' }]; dump(dir, UNITS, d)
  }],
  ["tier gate of another faction", "not in ra3's tier_map", 'error', dir => {
    // The Terror Drone is Soviet; the Armor Facility is an Allied gate.
    const d = load(dir, UNITS); unit(d, 'terror-drone').tier.gate = 'Armor Facility'; dump(dir, UNITS, d)
  }],
  ['weapon missing damage while not adaptive', "must have required property 'damage'", 'error', dir => {
    const d = load(dir, UNITS); delete unit(d, 'hammer-tank').armament[0].damage; dump(dir, UNITS, d)
  }],
  ['accepted pattern without generator', "must have required property 'generator'", 'error', dir => {
    const p = load(dir, PATTERN('leech-weapon-on-kill')); p.status = 'accepted'; delete p.generator; dump(dir, PATTERN('leech-weapon-on-kill'), p)
  }],
  ['pattern with no source units', 'must NOT have fewer than 1 items', 'error', dir => {
    const p = load(dir, PATTERN('leech-weapon-on-kill')); p.source_units = []; dump(dir, PATTERN('leech-weapon-on-kill'), p)
  }],
  ['unit without combos', "must have required property 'combos'", 'error', dir => {
    const d = load(dir, UNITS); delete unit(d, 'hammer-tank').combos; dump(dir, UNITS, d)
  }],
  ['card: wrong class for a part', 'is not for class', 'error', dir => {
    const c = load(dir, CARD); c.parts.mobility.base = 'jet'; dump(dir, CARD, c)
  }],
  ['card: key budget exceeded', 'exceeds t1 budget', 'error', dir => {
    const c = load(dir, CARD); c.parts.abilities = [{ ...c.parts.signature }, { ...c.parts.signature }]; dump(dir, CARD, c)
  }],
  ['card: tracks on an aircraft', "mobility 'tracks' is not for class 'aircraft'", 'error', dir => {
    const c = load(dir, CARD); c.parts.class = 'aircraft'; c.parts.mobility.base = 'tracks'; dump(dir, CARD, c)
  }],
  ['card: active ability without cooldown', 'uses a key but has no cooldown', 'error', dir => {
    // The schema requires the field (null for passive and triggered abilities), so the break is a null cooldown.
    const c = load(dir, CARD); c.parts.signature.cooldown = null; dump(dir, CARD, c)
  }],
  ['card: real unit link in matchups', 'real unit names may not appear', 'error', dir => {
    const c = load(dir, CARD); c.matchups.countered_by.push({ ref: 'unit:ra3.soviet.hammer-tank', why: 'test' }); dump(dir, CARD, c)
  }],
  ['card: real unit name', 'working name matches a real unit name', 'error', dir => {
    const c = load(dir, CARD); c.text.name = 'Terror Drone'; dump(dir, CARD, c)
  }],
  ['card: strength paired with a missing weakness', 'paired with a missing weakness', 'error', dir => {
    const c = load(dir, CARD); c.matchups.strengths[0].paired_with = 9; dump(dir, CARD, c)
  }],
  ['card: unknown variant', 'unknown variant', 'error', dir => {
    const c = load(dir, CARD); c.parts.signature.variant = 'no-such-variant'; dump(dir, CARD, c)
  }],
  // Decision 4B: classes are hard bans; class_rarity only makes a cross-over rarer.
  ['word list: class_rarity names a class outside classes', 'which is not in its classes', 'error', dir => {
    const v = load(dir, VOCAB('weapon-families')); const t = crossOverTerm(v)
    const [cls] = Object.keys(t.class_rarity); t.classes = t.classes.filter(c => c !== cls); dump(dir, VOCAB('weapon-families'), v)
  }],
  ['word list: class_rarity with an unknown rarity', "is not a term of vocabulary 'rarity'", 'error', dir => {
    const v = load(dir, VOCAB('weapon-families')); const t = crossOverTerm(v)
    t.class_rarity[Object.keys(t.class_rarity)[0]] = 'legendary'; dump(dir, VOCAB('weapon-families'), v)
  }],
  ['word list: class_rarity with an unknown class', "is not a term of vocabulary 'classes'", 'error', dir => {
    const v = load(dir, VOCAB('weapon-families')); crossOverTerm(v).class_rarity.spaceship = 'rare'; dump(dir, VOCAB('weapon-families'), v)
  }],
  ['pattern generator: class_rarity names a class outside classes', 'which is not in its classes', 'error', dir => {
    const p = load(dir, PATTERN('leech-weapon-on-kill')); const G = p.generator
    const outside = ['infantry', 'vehicle', 'walker', 'hover', 'aircraft', 'drone'].find(c => !G.classes.includes(c))
    G.class_rarity = { [outside]: 'rare' }; dump(dir, PATTERN('leech-weapon-on-kill'), p)
  }],
  ['pattern generator: class_rarity with an unknown rarity', "is not a term of vocabulary 'rarity'", 'error', dir => {
    const p = load(dir, PATTERN('leech-weapon-on-kill')); p.generator.class_rarity = { [p.generator.classes[0]]: 'legendary' }
    dump(dir, PATTERN('leech-weapon-on-kill'), p)
  }],
  ["pattern variant: class_rarity names a class outside the variant's classes", 'which is not in its classes', 'error', dir => {
    // kit-swap narrows the pattern to infantry, so a vehicle rarity on it is out of place.
    const p = load(dir, PATTERN('leech-weapon-on-kill')); const v = p.variants.find(x => x.id === 'kit-swap')
    assert.deepEqual(v.overrides.classes, ['infantry']); v.overrides.class_rarity = { vehicle: 'rare' }; dump(dir, PATTERN('leech-weapon-on-kill'), p)
  }],
  ['card: a cross-over within classes is allowed', '', 'ok', dir => {
    // Interceptor armour is rare on drones but possible, so the drone card may carry it.
    const t = load(dir, VOCAB('armour-models')).terms.find(x => x.id === 'interceptor')
    assert.equal(t.class_rarity?.drone, 'rare')
    const c = load(dir, CARD); assert.equal(c.parts.class, 'drone'); c.parts.armour.models.push('interceptor'); dump(dir, CARD, c)
  }],
  ['unit: a cross-over within classes is no rule break', '', 'ok', dir => {
    const d = load(dir, UNITS); unit(d, 'terror-drone').armour.models.push('interceptor'); dump(dir, UNITS, d)
  }],
  ['unit: a hard class ban still needs an atypical entry', "but 'atypical' has no entry with rule 'armour-models:downed-revive classes vehicle'", 'error', dir => {
    const d = load(dir, UNITS); const u = unit(d, 'hammer-tank'); assert.equal(u.class, 'vehicle')
    u.armour.models.push('downed-revive'); dump(dir, UNITS, d)
  }],
  ['word lists with different versions', "differs from the other word lists'", 'error', dir => {
    const v = load(dir, VOCAB('rarity')); v.version = '0.0.1'; dump(dir, VOCAB('rarity'), v)
  }],
  ['units coded against an older word-list version (warn only)', 'coded against word lists 0.0.1', 'warn', dir => {
    const d = load(dir, UNITS); d.vocab_version = '0.0.1'; dump(dir, UNITS, d)
  }],
  // Decision 6C: two air layers (low air, high air) and a sensors field.
  ['unit: unknown sensor trait', "'x-ray-eyes' is not a term of vocabulary 'sensor-traits'", 'error', dir => {
    const d = load(dir, UNITS); unit(d, 'hammer-tank').sensors.traits = ['x-ray-eyes']; dump(dir, UNITS, d)
  }],
  ['card: unknown sensor trait', "'x-ray-eyes' is not a term of vocabulary 'sensor-traits'", 'error', dir => {
    const c = load(dir, CARD); c.parts.sensors.traits = ['x-ray-eyes']; dump(dir, CARD, c)
  }],
  ['unit without sensors', "must have required property 'sensors'", 'error', dir => {
    const d = load(dir, UNITS); delete unit(d, 'terror-drone').sensors; dump(dir, UNITS, d)
  }],
  ['card: high-air target on a ground-only weapon family', "family 'blades' doesn't combine with target-types 'high-air'", 'error', dir => {
    // The card's claws are melee, a family that stays on the ground.
    const c = load(dir, CARD); assert.equal(c.parts.armament.primary.family, 'blades')
    c.parts.armament.primary.can_target.push('high-air'); dump(dir, CARD, c)
  }],
  ['card: a lobbed shot aimed at low air', "delivery 'lobbed' doesn't combine with target-types 'low-air'", 'error', dir => {
    // Cryo allows lobbed shells and low air, but not together: a lobbed shell lands on the ground.
    const c = load(dir, CARD); const w = c.parts.armament.secondary; assert.equal(w.family, 'cryo')
    w.delivery = 'lobbed'; w.can_target.push('low-air'); dump(dir, CARD, c)
  }],
  // The expected text is the role's own requires group, whatever the word list says it is.
  ['card: anti-air role with nothing that reaches the air', dir => `roles 'anti-air' requires one of [${term(load(dir, VOCAB('roles')), 'anti-air').requires[0].join(', ')}]`, 'error', dir => {
    const c = load(dir, CARD); c.parts.roles.secondary.push('anti-air'); dump(dir, CARD, c)
  }],
  ['card: stealth on a huge body', "sensor-traits 'stealth' excludes sizes 'huge'", 'error', dir => {
    const c = load(dir, CARD); c.parts.sensors.traits = ['stealth']; c.parts.body.size = 'huge'; dump(dir, CARD, c)
  }],
  ['card: link to an unknown sight band', "sight:far does not resolve in 'sight-bands'", 'error', dir => {
    const c = load(dir, CARD); c.matchups.counters.push({ ref: 'sight:far', why: 'test' }); dump(dir, CARD, c)
  }],
  ['card: sensor strength the card lacks', "matchup link sensor:radar doesn't match the card's own parts", 'error', dir => {
    const c = load(dir, CARD); assert.ok(!c.parts.sensors.traits.includes('radar'))
    c.matchups.strengths.push({ ref: 'sensor:radar', why: 'test', paired_with: 0 }); dump(dir, CARD, c)
  }],
  ['card: sight and sensor strengths it has', '', 'ok', dir => {
    const c = load(dir, CARD); assert.equal(c.parts.sensors.sight, 'long'); assert.ok(c.parts.sensors.traits.includes('detector'))
    c.matchups.strengths.push({ ref: 'sight:>=medium', why: 'test', paired_with: 0 }, { ref: 'sensor:detector', why: 'test', paired_with: 1 })
    dump(dir, CARD, c)
  }],
  ['unit: a flier link on a ground unit (warn only)', "link target:low-air doesn't describe this unit's own parts", 'warn', dir => {
    // A walking drone is a ground target (infantry-sized), not a low flier.
    const d = load(dir, UNITS); unit(d, 'terror-drone').strengths.push({ ref: 'target:low-air', why: 'test' }); dump(dir, UNITS, d)
  }],

  // Only an anti-air weapon reaches high air outside the anti-air families (decision 6C, review fix).
  ['unit: high air on a family without it needs an atypical entry', "but 'atypical' has no entry with rule 'weapon-families:rockets allowed.target-types high-air'", 'error', dir => {
    // The IFV's missiles reach every aircraft; without the anti-air trait, the rockets family's target list is broken.
    assert.ok(!allowedTargets(dir, 'rockets').includes('high-air'))
    const d = load(dir, UNITS); const u = unit(d, 'multigunner-ifv'); const w = u.armament[0]; assert.equal(w.family, 'rockets')
    w.traits = (w.traits || []).filter(t => t !== 'anti-air')
    if (!w.can_target.includes('high-air')) w.can_target.push('high-air')
    u.atypical = u.atypical.filter(a => a.rule !== 'weapon-families:rockets allowed.target-types high-air'); dump(dir, UNITS, d)
  }],
  ['unit: an anti-air weapon reaches high air when its family reaches low air', '', 'ok', dir => {
    plainAntiAir(dir)
    const d = load(dir, UNITS); const u = unit(d, 'multigunner-ifv'); const w = u.armament[0]; assert.equal(w.family, 'rockets')
    w.traits = [...new Set([...(w.traits || []), 'anti-air'])]
    if (!w.can_target.includes('high-air')) w.can_target.push('high-air')
    u.atypical = u.atypical.filter(a => a.rule !== 'weapon-families:rockets allowed.target-types high-air'); dump(dir, UNITS, d)
  }],
  ['card: an anti-air weapon reaches high air when its family reaches low air', '', 'ok', dir => {
    plainAntiAir(dir); assert.ok(!allowedTargets(dir, 'cryo').includes('high-air'))
    const c = load(dir, CARD); const w = c.parts.armament.secondary; assert.equal(w.family, 'cryo')
    w.can_target.push('high-air'); w.traits.push('anti-air'); dump(dir, CARD, c)
  }],
  ['card: high air on a family without it, with no anti-air trait', "family 'cryo' doesn't combine with target-types 'high-air'", 'error', dir => {
    assert.ok(!allowedTargets(dir, 'cryo').includes('high-air'))
    const c = load(dir, CARD); const w = c.parts.armament.secondary; assert.equal(w.family, 'cryo'); assert.ok(!w.traits.includes('anti-air'))
    w.can_target.push('high-air'); dump(dir, CARD, c)
  }],
  ['card: the anti-air trait does not lift a ground-only family (blades)', "family 'blades' doesn't combine with target-types 'high-air'", 'error', dir => {
    plainAntiAir(dir); assert.ok(!allowedTargets(dir, 'blades').includes('low-air'))
    const c = load(dir, CARD); const w = c.parts.armament.primary; assert.equal(w.family, 'blades')
    w.can_target.push('high-air'); w.traits.push('anti-air'); dump(dir, CARD, c)
  }],
  ['card: the anti-air trait does not lift a ground-only family (flamethrower)', "family 'flamethrower' doesn't combine with target-types 'high-air'", 'error', dir => {
    plainAntiAir(dir); assert.ok(!allowedTargets(dir, 'flamethrower').includes('low-air'))
    const c = load(dir, CARD); const w = c.parts.armament.secondary
    w.family = 'flamethrower'; w.damage = 'fire'; w.range = 'short'; w.can_target = ['infantry', 'high-air']; w.traits = ['anti-air']; dump(dir, CARD, c)
  }],
  ['card: the anti-air trait never goes with a melee delivery', "'melee'", 'error', dir => {
    const c = load(dir, CARD); const w = c.parts.armament.primary
    w.delivery = 'melee'; w.traits.push('anti-air'); dump(dir, CARD, c)
  }],
  ['card: the anti-air trait does not lift the delivery rule', "delivery 'lobbed' doesn't combine with target-types 'high-air'", 'error', dir => {
    plainAntiAir(dir)
    const c = load(dir, CARD); const w = c.parts.armament.secondary
    w.delivery = 'lobbed'; w.can_target.push('high-air'); w.traits.push('anti-air'); dump(dir, CARD, c)
  }],

  // A delivery (or any weapon term) may require something of the weapon's unit or card (review fix).
  ['card: a dropped weapon on a unit that does not fly', "delivery 'drop' requires one of [target:low-air, target:high-air]", 'error', dir => {
    editTerm(dir, 'weapon-delivery', 'drop', t => { t.requires = [['target:low-air', 'target:high-air']] })
    const c = load(dir, CARD); c.parts.armament.primary.delivery = 'drop'; dump(dir, CARD, c)
  }],
  ['unit: a delivery requirement the unit misses needs an atypical entry', "has no entry with rule 'weapon-delivery:attach requires size:>=large'", 'error', dir => {
    // The Terror Drone's claws attach, and it is tiny.
    editTerm(dir, 'weapon-delivery', 'attach', t => { t.requires = [['size:>=large']] })
  }],
  ['unit and card: a delivery requirement both meet', '', 'ok', dir => {
    editTerm(dir, 'weapon-delivery', 'attach', t => { t.requires = [['size:<=small']] })
  }],
  ['card: a weapon trait limited to other classes', "trait 'mark' is not for class 'drone'", 'error', dir => {
    assert.ok(load(dir, CARD).parts.armament.primary.traits.includes('mark'))
    editTerm(dir, 'weapon-traits', 'mark', t => { t.classes = ['infantry'] })
  }],
  ['card: a delivery that excludes a unit-wide part', "delivery 'attach' excludes mobility 'hover'", 'error', dir => {
    assert.equal(load(dir, CARD).parts.mobility.base, 'hover')
    editTerm(dir, 'weapon-delivery', 'attach', t => { t.excluded = { mobility: ['hover'] } })
  }],
  ["card: a family's list for another part of the same weapon", "family 'blades' doesn't combine with weapon-traits 'mark'", 'error', dir => {
    editTerm(dir, 'weapon-families', 'blades', t => { t.allowed['weapon-traits'] = ['damage-over-time'] })
  }],

  // Word lists that were never checked: on-death, availability and ability kinds (review fix).
  ['card: pilot eject on a drone', "on-death 'pilot-eject' is not for class 'drone'", 'error', dir => {
    assert.ok(!term(load(dir, VOCAB('on-death')), 'pilot-eject').classes.includes('drone'))
    const c = load(dir, CARD); c.parts.on_death = ['pilot-eject']; dump(dir, CARD, c)
  }],
  ['card: a wreck left by infantry', "on-death 'wreck' excludes classes 'infantry'", 'error', dir => {
    const c = load(dir, CARD); c.parts.class = 'infantry'; c.parts.on_death = ['wreck']; dump(dir, CARD, c)
  }],
  ['unit: pilot eject on the Terror Drone needs an atypical entry', "has no entry with rule 'on-death:pilot-eject classes drone'", 'error', dir => {
    // A sourced outcome (basis in-game), so the 3C default for proposals does not apply.
    editUnit(dir, 'terror-drone', u => { u.on_death = { ...u.on_death, outcomes: ['pilot-eject'], basis: 'in-game' } })
  }],
  ['unit: a break recorded under its exact rule string passes', '', 'ok', dir => {
    editUnit(dir, 'terror-drone', u => {
      u.on_death = { ...u.on_death, outcomes: ['pilot-eject'], basis: 'in-game' }
      u.atypical = [...(u.atypical || []), { path: 'on_death/outcomes/0', rule: 'on-death:pilot-eject classes drone', note: 'test' }]
    })
  }],
  ['unit: a unique unit below the tier its availability needs', "has no entry with rule 'availability:unique min_tier t2'", 'error', dir => {
    const d = load(dir, UNITS); const u = unit(d, 'terror-drone'); assert.equal(u.tier.band, 't1'); u.availability = 'unique'; dump(dir, UNITS, d)
  }],
  ['unit: an ultimate ability on a tier-1 unit', "has no entry with rule 'ability-kinds:ultimate min_tier t3'", 'error', dir => {
    const d = load(dir, UNITS); unit(d, 'terror-drone').abilities[0].kind = 'ultimate'; dump(dir, UNITS, d)
  }],
  ['card: an ultimate ability on a tier-1 card', "ability-kinds 'ultimate' needs tier t3 or higher", 'error', dir => {
    const c = load(dir, CARD); assert.equal(c.parts.tier, 't1'); c.parts.signature.kind = 'ultimate'; dump(dir, CARD, c)
  }],
  ['word list: rules on a list the combination rules never read', "has combination rules (min_tier), but the combination rules read no 'test-rules' part", 'error', dir => {
    const version = load(dir, VOCAB('rarity')).version
    dump(dir, VOCAB('test-rules'), {
      id: 'test-rules', label: 'Test rules', description: 'Test list.', group: 'supporting', status: 'draft', version,
      terms: [{ id: 'a', label: 'A', description: 'A.', min_tier: 't2' }, { id: 'b', label: 'B', description: 'B.' }],
    })
  }],
  ['word list: a map keyed by a list the combination rules never read', "the combination rules read no 'seat-roles' part", 'error', dir => {
    editTerm(dir, 'bodies', 'humanoid', t => { t.allowed['seat-roles'] = ['driver'] })
  }],

  // Atypical entries match the whole rule string, not just '<list>:<term>' (review fix).
  ['unit: an entry covers only its own rule, not every break of the term', "has no entry with rule 'weapon-families:laser allowed.target-types high-air'", 'error', dir => {
    // The Imperial Warrior laser records a damage break; reaching high air is a second, unrecorded break.
    assert.ok(!allowedTargets(dir, 'laser').includes('high-air'))
    const d = load(dir, UNITS); const { w } = recordedWeapon(unit(d, 'multigunner-ifv'), 'weapon-families:laser ')
    assert.ok(!(w.traits || []).includes('anti-air')); w.can_target.push('high-air'); dump(dir, UNITS, d)
  }],
  ['unit: a new delivery break is not covered by an entry for the family', "has no entry with rule 'weapon-families:rockets allowed.weapon-delivery drop'", 'error', dir => {
    assert.ok(!term(load(dir, VOCAB('weapon-families')), 'rockets').allowed['weapon-delivery'].includes('drop'))
    const d = load(dir, UNITS); const w = unit(d, 'multigunner-ifv').armament[0]; assert.equal(w.family, 'rockets')
    w.delivery = 'drop'; dump(dir, UNITS, d)
  }],
  ['unit: an entry with the right term but the wrong rule', "has no entry with rule 'weapon-traits:stun min_tier t2'", 'error', dir => {
    const d = load(dir, UNITS); const u = unit(d, 'multigunner-ifv')
    for (const a of u.atypical) if (a.rule === 'weapon-traits:stun min_tier t2') a.rule = 'weapon-traits:stun min_tier t3'
    dump(dir, UNITS, d)
  }],
  ['unit: an atypical path that does not exist', "has path 'armament/99/can_target', which does not exist on this unit", 'error', dir => {
    const d = load(dir, UNITS); const u = d.units.find(x => x.atypical?.length); u.atypical[0].path = 'armament/99/can_target'; dump(dir, UNITS, d)
  }],

  // Cards meet the tier floors of their patterns, variants and ability kinds, and the rest of a pattern's rules (review fix).
  ["card: a variant above the card's tier", "pattern 'infest-vehicle' (variant 'latched-control') needs tier t3 or higher", 'error', dir => {
    const v = load(dir, PATTERN('infest-vehicle')).variants.find(x => x.id === 'latched-control'); assert.equal(v?.overrides?.min_tier, 't3')
    const c = load(dir, CARD); assert.equal(c.parts.tier, 't1'); c.parts.signature.variant = 'latched-control'; dump(dir, CARD, c)
  }],
  ["card: a pattern above the card's tier", "pattern 'infest-vehicle' needs tier t3 or higher", 'error', dir => {
    edit(dir, PATTERN('infest-vehicle'), p => { p.generator.min_tier = 't3' })
    const c = load(dir, CARD); c.parts.signature.variant = null; dump(dir, CARD, c)
  }],
  ['card: a variant at its own tier', '', 'ok', dir => {
    const c = load(dir, CARD); c.parts.tier = 't3'; c.parts.signature.variant = 'latched-control'; dump(dir, CARD, c)
  }],
  ["card: a variant's kinds replace the pattern's", "pattern 'infest-vehicle' (variant 'tracker') can't be a 'active' ability", 'error', dir => {
    const c = load(dir, CARD); assert.equal(c.parts.signature.variant, 'tracker'); assert.equal(c.parts.signature.kind, 'active')
    edit(dir, PATTERN('infest-vehicle'), p => { p.variants.find(x => x.id === 'tracker').overrides = { kinds: ['passive'] } })
  }],
  ['card: a signature-only pattern as an extra ability', "pattern 'infest-vehicle' (variant 'tracker') can only be the card's signature ability", 'error', dir => {
    assert.equal(load(dir, PATTERN('infest-vehicle')).generator.slot, 'signature')
    const c = load(dir, CARD); c.parts.abilities.push({ ...c.parts.signature }); dump(dir, CARD, c)
  }],
  ['card: two patterns that conflict', "patterns 'infest-vehicle' and 'passenger-sets-weapon' conflict", 'error', dir => {
    edit(dir, PATTERN('infest-vehicle'), p => { p.generator.conflicts_with = ['passenger-sets-weapon'] })
    const c = load(dir, CARD); c.parts.abilities.push({ pattern: 'passenger-sets-weapon', variant: null, kind: 'passive', seat: 'driver', cooldown: null }); dump(dir, CARD, c)
  }],
  ['card: a rejected pattern', "pattern 'infest-vehicle' is rejected, so a card can't use it", 'error', dir => {
    edit(dir, PATTERN('infest-vehicle'), p => { p.status = 'rejected' })
  }],
  ['card: a planned pattern', "is planned, not written yet, so a card can't use it", 'error', dir => {
    const planned = load(dir, REGISTRY).patterns.find(p => !fs.existsSync(path.join(dir, PATTERN(p.id))))
    const c = load(dir, CARD); c.parts.signature.pattern = planned.id; c.parts.signature.variant = null; dump(dir, CARD, c)
  }],
  ['card: a pattern with no generator yet', "pattern 'infest-vehicle' has no generator yet", 'error', dir => {
    edit(dir, PATTERN('infest-vehicle'), p => { assert.equal(p.status, 'proposed'); delete p.generator })
  }],

  // Schema-invalid data is reported, not a crash (review fix).
  ['card: unknown tier', "'t9' is not a term of vocabulary 'tiers'", 'error', dir => {
    const c = load(dir, CARD); c.parts.tier = 't9'; dump(dir, CARD, c)
  }],
  ['card: unknown balance flag', "'no-such-flag' is not a term of vocabulary 'balance-flags'", 'error', dir => {
    const c = load(dir, CARD); c.balance.flags = ['no-such-flag']; dump(dir, CARD, c)
  }],
  ['unit without roles', "must have required property 'roles'", 'error', dir => {
    const d = load(dir, UNITS); delete unit(d, 'hammer-tank').roles; dump(dir, UNITS, d)
  }],
  ['a file that is not valid JSON', `${UNITS}: not valid JSON`, 'error', dir => {
    fs.writeFileSync(path.join(dir, UNITS), '{ "units": [')
  }],

  // Integrity checks the header promised (review fix).
  ['word list: duplicate term id', "data/vocab/sizes.json: duplicate term id 'tiny'", 'error', dir => {
    edit(dir, VOCAB('sizes'), v => { v.terms.push({ ...term(v, 'tiny'), rank: 99 }) })
  }],
  ["word list: file name differs from the list's id", "data/vocab/rarity-copy.json: file name must be <id>.json", 'error', dir => {
    fs.copyFileSync(path.join(dir, VOCAB('rarity')), path.join(dir, VOCAB('rarity-copy')))
  }],
  ['word list: a ranked term without a rank', 'no rank, but every term of a ranked list needs a whole-number rank', 'error', dir => {
    edit(dir, VOCAB('sizes'), v => { delete v.terms.at(-1).rank })
  }],
  ['word list: two terms with one rank', 'data/vocab/sight-bands.json: rank 1 is used by more than one term', 'error', dir => {
    edit(dir, VOCAB('sight-bands'), v => { v.terms.forEach((t, i) => { t.rank = i === 0 ? 1 : i }) })
  }],
  ['word list: a tie-break naming a term that does not exist', "data/vocab/sizes.json tie_breaks/0: 'not-a-size' is not a term of 'sizes'", 'error', dir => {
    edit(dir, VOCAB('sizes'), v => { v.tie_breaks = [{ terms: ['tiny', 'not-a-size'], rule: 'pick the smaller one' }] })
  }],
  ['word list: a tie-break naming an unknown list', "data/vocab/sizes.json tie_breaks/0: unknown word list 'nope' in 'nope:tiny'", 'error', dir => {
    edit(dir, VOCAB('sizes'), v => { v.tie_breaks = [{ terms: ['tiny', 'nope:tiny'], rule: 'pick the smaller one' }] })
  }],
  ['word list: a tie-break naming a term twice', "data/vocab/sizes.json tie_breaks/0: 'tiny' is named twice", 'error', dir => {
    edit(dir, VOCAB('sizes'), v => { v.tie_breaks = [{ terms: ['tiny', 'tiny'], rule: 'pick the smaller one' }] })
  }],
  ['word list: a term replacing one that still exists', "data/vocab/sizes.json small: replaces 'tiny', which is still a term of this list", 'error', dir => {
    edit(dir, VOCAB('sizes'), v => { v.terms.find(t => t.id === 'small').replaces = ['tiny'] })
  }],
  ['word list: two terms replacing the same id', "data/vocab/sizes.json: 'wee' is replaced by more than one term", 'error', dir => {
    edit(dir, VOCAB('sizes'), v => { v.terms[0].replaces = ['wee']; v.terms[1].replaces = ['wee'] })
  }],
  ['duplicate unit id', "duplicate unit id 'ra3.soviet.hammer-tank'", 'error', dir => {
    const d = load(dir, UNITS); d.units.push(structuredClone(unit(d, 'hammer-tank'))); dump(dir, UNITS, d)
  }],
  ['duplicate game id', 'data/games.json: duplicate game id', 'error', dir => {
    edit(dir, GAMES, g => { g.games.push(structuredClone(g.games[0])) })
  }],
  ['duplicate faction id', 'duplicate faction id', 'error', dir => {
    edit(dir, GAMES, g => { const f = g.games[0].factions; f.push({ ...f[0] }) })
  }],

  // One rule is checked once, and an adaptive weapon is not bound by a body's family list (review fix).
  ["unit: an adaptive weapon is not bound by a body's family list", '', 'ok', dir => {
    const u = unit(load(dir, UNITS), 'hammer-tank'); assert.ok(u.armament.some(w => w.family === 'adaptive'))
    const families = [...new Set(u.armament.map(w => w.family).filter(f => f !== 'adaptive'))]
    editTerm(dir, 'bodies', u.body.plan, t => { t.allowed['weapon-families'] = families })
  }],
  ["unit: a body's family list binds the other families", "has no entry with rule 'bodies:hull-turret allowed.weapon-families drain'", 'error', dir => {
    const u = unit(load(dir, UNITS), 'hammer-tank'); assert.equal(u.body.plan, 'hull-turret')
    assert.ok(u.armament.some(w => w.family === 'drain')); assert.ok(u.armament.some(w => w.family === 'cannon'))
    editTerm(dir, 'bodies', 'hull-turret', t => { t.allowed['weapon-families'] = ['cannon'] })
  }],

  // 'category:' links also see the category of a planned pattern, from the registry (review fix).
  ['unit: a category link met by a planned pattern', '', 'ok', dir => {
    const { d, u, planned } = categoryRole(dir); u.abilities[0].patterns.push(planned.id); dump(dir, UNITS, d)
  }],
  ['unit: a category link nothing meets', "has no entry with rule 'roles:", 'error', dir => {
    const { d } = categoryRole(dir); dump(dir, UNITS, d)
  }],

  // Field rules from pilot round 1 (word lists 1.0). Seats: 'driver' is never written; any other seat is the unit's own.
  ["unit: a weapon with seat 'driver'", "seat 'driver' is the default; leave it out", 'error', dir => {
    editUnit(dir, 'hammer-tank', u => { u.armament[0].seat = 'driver' })
  }],
  ["unit: an ability with seat 'driver'", "seat 'driver' is the default; leave it out", 'error', dir => {
    editUnit(dir, 'hammer-tank', u => { u.abilities[0].seat = 'driver' })
  }],
  ['unit: a seat the crew model does not have', "seat 'gunner' is not a seat of this unit", 'error', dir => {
    editUnit(dir, 'hammer-tank', u => { assert.equal(u.crew.model, 'solo'); u.armament[1].seat = 'gunner' })
  }],
  ['unit: a passenger seat of another kind than crew.passengers', "seat 'passenger-firing' is not a seat of this unit", 'error', dir => {
    editUnit(dir, 'multigunner-ifv', u => {
      assert.equal(u.crew.passengers.kind, 'passenger-module'); u.armament.find(x => x.slot === 'passenger').seat = 'passenger-firing'
    })
  }],
  ['unit: a seat named in crew.seats', '', 'ok', dir => {
    editUnit(dir, 'hammer-tank', u => { u.crew.seats = [{ role: 'driver', count: 1 }, { role: 'gunner', count: 1 }]; u.armament[1].seat = 'gunner' })
  }],

  // The main weapon: at most one primary, listed first, and the driver's whenever the driver has a weapon.
  ['unit: two primary weapons', 'a unit has at most one primary weapon, listed first', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => { u.armament[1].slot = 'primary' })
  }],
  ['unit: a primary that is not listed first', 'a unit has at most one primary weapon, listed first', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => { assert.equal(u.armament[0].slot, 'primary'); u.armament.reverse() })
  }],
  ["unit: a gunner's primary while the driver has a weapon", "the driver has a weapon, so the primary is the driver's: leave its seat out", 'error', dir => {
    editUnit(dir, 'hammer-tank', u => {
      u.crew.model = 'driver-gunner'; u.crew.solo_fallback = 'full-control'
      u.armament[0].seat = 'gunner'; u.armament[1].slot = 'secondary'
    })
  }],
  ["unit: a gunner's primary when the driver fires nothing", '', 'ok', dir => {
    // A Foxhole light tank: the driver only drives, so the first gun seat's main gun is primary.
    editUnit(dir, 'hammer-tank', u => {
      u.crew.model = 'driver-gunner'; u.crew.solo_fallback = 'full-control'
      u.armament[0].seat = 'gunner'; u.armament[1].slot = 'secondary'; u.armament[1].seat = 'gunner'
    })
  }],

  // Loadout groups (option entries plus at most one fitted entry, the default) and upgrade groups (acquired entries only).
  ['unit: an option weapon without an option_group', 'needs an option_group', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => extraWeapon(u, 0, { slot: 'option' }))
  }],
  ['unit: default: true outside a loadout group', 'which belongs only on the primary or secondary entry of a loadout group', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => { u.armament[0].default = true })
  }],
  ['unit: a loadout group with its default', '', 'ok', dir => {
    editUnit(dir, 'hammer-tank', u => {
      Object.assign(u.armament[0], { option_group: 'main-gun', default: true }); extraWeapon(u, 0, { slot: 'option', option_group: 'main-gun' })
    })
  }],
  ['unit: the fitted choice of a loadout group without default: true', 'so it needs default: true', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => { u.armament[0].option_group = 'main-gun'; extraWeapon(u, 0, { slot: 'option', option_group: 'main-gun' }) })
  }],
  ['unit: two fitted weapons in one option group', 'it is neither a loadout group', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => {
      Object.assign(u.armament[0], { option_group: 'main-gun', default: true })
      extraWeapon(u, 0, { slot: 'secondary', option_group: 'main-gun', default: true })
    })
  }],
  ['unit: an upgrade group of acquired weapons', '', 'ok', dir => {
    editUnit(dir, 'hammer-tank', u => {
      const i = u.armament.findIndex(x => x.slot === 'acquired'); assert.ok(i >= 0, 'no acquired weapon')
      u.armament[i].option_group = 'upgrades'; extraWeapon(u, i, { option_group: 'upgrades' })
    })
  }],
  ['unit: an upgrade group with a default', 'which belongs only on the primary or secondary entry of a loadout group', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => {
      const i = u.armament.findIndex(x => x.slot === 'acquired')
      Object.assign(u.armament[i], { option_group: 'upgrades', default: true }); extraWeapon(u, i, { option_group: 'upgrades', default: false })
    })
  }],
  ['unit: an option group that mixes acquired and option weapons', 'it is neither a loadout group', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => {
      u.armament.find(x => x.slot === 'acquired').option_group = 'mixed'; extraWeapon(u, 0, { slot: 'option', option_group: 'mixed' })
    })
  }],

  // 'when' names the rider of a passenger weapon, and only there.
  ["unit: 'when' on a weapon that is not a passenger weapon", "has 'when': 'when' is for passenger weapons only", 'error', dir => {
    editUnit(dir, 'hammer-tank', u => { u.armament[1].when = 'unit:ra3.soviet.terror-drone' })
  }],
  ["unit: a passenger weapon without 'when'", "has no 'when': 'when' is for passenger weapons only", 'error', dir => {
    editUnit(dir, 'multigunner-ifv', u => { delete u.armament.find(x => x.slot === 'passenger').when })
  }],

  // Body-aim turns the whole unit, so only the driver fires it.
  ['unit: body-aim fired from another seat', 'body-aim is fired from the driver seat', 'error', dir => {
    editUnit(dir, 'multigunner-ifv', u => { assert.equal(u.armament[0].mount, 'body-aim'); u.armament[0].seat = 'passenger-module' })
  }],
  ['card: body-aim fired from another seat', 'armament primary has seat \'gunner\': body-aim is fired from the driver seat', 'error', dir => {
    edit(dir, CARD, c => { Object.assign(c.parts.armament.primary, { mount: 'body-aim', seat: 'gunner' }) })
  }],

  // Crew basis and death outcomes in games where players command units (decision 3C for the proposal default).
  ['unit: an in-game crew in a game where players command units', 'an RTS unit has no player seats; use basis proposal', 'error', dir => {
    editUnit(dir, 'terror-drone', u => { assert.equal(gameOf(dir, u).control, 'commanded'); u.crew.basis = 'in-game' })
  }],
  ['unit: an in-game squad in a game where players command units', '', 'ok', dir => {
    editUnit(dir, 'terror-drone', u => { Object.assign(u.crew, { model: 'squad', basis: 'in-game' }); u.body.count = 3 })
  }],
  ['unit: a proposal death outcome other than the 3C default', 'a proposal death outcome is the 3C default; if the source shows another outcome, set basis in-game', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => {
      assert.equal(u.nature, 'crewed-machine'); assert.equal(u.on_death.basis, 'proposal'); u.on_death.outcomes = ['respawn']
    })
  }],
  ['unit: a death outcome shown by the source', '', 'ok', dir => {
    editUnit(dir, 'hammer-tank', u => { Object.assign(u.on_death, { outcomes: ['wreck'], basis: 'in-game' }) })
  }],
  ['unit: an in-game respawn in a game where players command units', 'an RTS unit that is simply gone is a proposal', 'error', dir => {
    editUnit(dir, 'terror-drone', u => { assert.deepEqual(u.on_death.outcomes, ['respawn']); u.on_death.basis = 'in-game' })
  }],
  ['unit: a solo fallback on a one-player crew model', 'solo_fallback is only for multi-seat crew models', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => { assert.equal(u.crew.model, 'solo'); u.crew.solo_fallback = 'full-control' })
  }],
  ['unit: a squad without a body count', 'a squad needs body.count 2 or more', 'error', dir => {
    editUnit(dir, 'terror-drone', u => { u.crew.model = 'squad'; delete u.body.count })
  }],

  // Handling: the mobility default unless a listed reason applies, and then the reason goes in mobility.notes.
  ['unit: handling other than the default with no reason (warn only)', 'say why the handling differs in mobility.notes', 'warn', dir => {
    editUnit(dir, 'hammer-tank', u => { assert.equal(u.mobility.handling, 'pivot'); u.mobility.handling = 'steer'; delete u.mobility.notes })
  }],
  ['unit: handling other than the default with a reason in the notes', 'say why the handling differs', 'no-warn', dir => {
    editUnit(dir, 'hammer-tank', u => { assert.ok(u.mobility.notes); u.mobility.handling = 'steer' })
  }],
  ['unit: a small unit on legs strafes without a note', 'say why the handling differs', 'no-warn', dir => {
    editUnit(dir, 'terror-drone', u => {
      assert.ok(u.mobility.base.startsWith('legs')); assert.ok(['tiny', 'small'].includes(u.body.size))
      u.mobility.handling = 'strafe'; delete u.mobility.notes
    })
  }],

  // source_units are filled by npm run sync-patterns in the merge pass, so a stale list only warns.
  ['unit: links a written pattern that does not list it (warn only)', 'source_units out of date; the merge pass runs npm run sync-patterns', 'warn', dir => {
    editUnit(dir, 'hammer-tank', u => { u.abilities[0].patterns.push('infest-vehicle') })
  }],
  ['pattern: source_units name a unit that does not link it (warn only)', 'source_units out of date; the merge pass runs npm run sync-patterns', 'warn', dir => {
    edit(dir, PATTERN('infest-vehicle'), p => { p.source_units.push('ra3.soviet.hammer-tank') })
  }],

  // The transform trait says the unit records its second form in modes.
  ['unit: the transform trait with no modes', 'mobility trait transform with no modes: a unit that transforms records its second form in modes', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => { assert.ok(!(u.modes || []).length); u.mobility.traits = [...(u.mobility.traits || []), 'transform'] })
  }],

  // An ability with no pattern stays, and a fit_note at its patterns says which mechanic is wanted.
  ['unit: an ability with no pattern and no fit_note', 'an ability with no pattern needs a fit_note naming the mechanic wanted', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => { u.abilities[0].patterns = [] })
  }],
  ['unit: an ability with no pattern and a fit_note with no wanted text', 'an ability with no pattern needs a fit_note naming the mechanic wanted', 'error', dir => {
    editUnit(dir, 'hammer-tank', u => {
      u.abilities[0].patterns = []; u.fit_notes = [...(u.fit_notes || []), { path: 'abilities/0/patterns', used: '(none)', note: 'test' }]
    })
  }],
  ['unit: an ability with no pattern and a fit_note naming the mechanic wanted', '', 'ok', dir => {
    editUnit(dir, 'hammer-tank', u => {
      u.abilities[0].patterns = []
      u.fit_notes = [...(u.fit_notes || []), { path: 'abilities/0/patterns', used: '(none)', wanted: 'a test mechanic', note: 'test' }]
    })
  }],

  // Paths in fit_notes, uncertain and sources[].supports use '/' and real positions.
  ['unit: a path with dots (warn only)', "uses '.' or '*': write paths with / and real positions", 'warn', dir => {
    editUnit(dir, 'hammer-tank', u => { u.uncertain = [...(u.uncertain || []), { path: 'sensors.sight', note: 'test' }] })
  }],
  ['unit: a supports path with a star (warn only)', "uses '.' or '*': write paths with / and real positions", 'warn', dir => {
    editUnit(dir, 'hammer-tank', u => { u.sources[0].supports = [...(u.sources[0].supports || []), 'abilities/*'] })
  }],
  ['unit: a path into a part the unit does not have (warn only)', 'which does not exist on this unit: write paths with / and real positions', 'warn', dir => {
    editUnit(dir, 'hammer-tank', u => { u.fit_notes = [...(u.fit_notes || []), { path: 'armament/99/damage', used: 'energy', note: 'test' }] })
  }],
  ['unit: a path to a field left out of a real part', 'write paths with / and real positions', 'no-warn', dir => {
    editUnit(dir, 'hammer-tank', u => { u.uncertain = [...(u.uncertain || []), { path: 'armament/0/no-such-field', note: 'test' }] })
  }],
]

// ---------------------------------------------------------------- the validator

describe('validator', () => {
  it('the repo validates with no errors', () => {
    const { errors } = validate(REPO_ROOT)
    assert.deepEqual(errors, [], `validation errors:\n${errors.join('\n')}`)
  })

  it('the command prints a summary and OK, and exits 0', () => {
    const r = spawnSync(process.execPath, [VALIDATE], { encoding: 'utf8' })
    assert.equal(r.status, 0, r.stdout + r.stderr)
    const lines = r.stdout.trim().split('\n')
    assert.match(lines[0], /^vocabularies: \d+, terms: \d+, games: \d+, units: \d+, patterns: \d+$/)
    assert.equal(lines.at(-1), 'OK')
  })

  it('the command exits 1 and prints FAILED when there are errors', () => {
    const dir = freshCopy()
    const c = load(dir, CARD); c.text.name = 'Terror Drone'; dump(dir, CARD, c)
    const r = spawnSync(process.execPath, [VALIDATE, dir], { encoding: 'utf8' })
    assert.equal(r.status, 1)
    assert.match(r.stdout, /^ERROR {4}docs\/examples\/concept-card\.example\.json: working name matches a real unit name$/m)
    assert.match(r.stdout.trim().split('\n').at(-1), /^FAILED with \d+ error\(s\)$/)
  })

  it('the command turns a crash into an ERROR line and exits 1', () => {
    // A file where the word-list folder should be makes reading the folder throw.
    const dir = freshCopy()
    fs.rmSync(path.join(dir, 'data/vocab'), { recursive: true }); fs.writeFileSync(path.join(dir, 'data/vocab'), 'not a folder')
    const r = spawnSync(process.execPath, [VALIDATE, dir], { encoding: 'utf8' })
    assert.equal(r.status, 1)
    assert.match(r.stdout, /^ERROR {4}internal: /m)
    assert.equal(r.stdout.trim().split('\n').at(-1), 'FAILED with 1 error(s)')
  })

  it('an empty folder fails with a clear error', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-empty-')); tmpDirs.push(dir)
    const { errors } = validate(dir)
    assert.ok(errors.some(e => e.includes('no schema files found')), errors.join('\n'))
  })

  it('stops after JSON or schema errors, before the rule checks', () => {
    // The unknown tier is a schema error; the real unit name would be a rule error, and must not be reached.
    const dir = freshCopy()
    const c = load(dir, CARD); c.parts.tier = 't9'; c.text.name = 'Terror Drone'; dump(dir, CARD, c)
    const { errors, warnings } = validate(dir)
    assert.ok(errors.some(e => e.includes("'t9' is not a term of vocabulary 'tiers'")), errors.join('\n'))
    assert.ok(!errors.some(e => e.includes('working name matches')), 'a rule check ran after a schema error')
    assert.ok(warnings.some(w => w.includes('the rule checks') && w.includes('did not run')))
  })

  it('reports one broken rule once', () => {
    // The role's requires and the body's mount list were each checked twice before.
    const dir = freshCopy()
    const c = load(dir, CARD); c.parts.roles.secondary.push('anti-air'); dump(dir, CARD, c)
    const d = load(dir, UNITS); const u = unit(d, 'hammer-tank')
    assert.ok(!term(load(dir, VOCAB('bodies')), u.body.plan).allowed['aim-models'].includes('body-aim'))
    u.armament[0].mount = 'body-aim'; dump(dir, UNITS, d)
    const { errors, atypical } = validate(dir)
    assert.equal(errors.filter(e => e.includes("'anti-air' requires")).length, 1, errors.join('\n'))
    assert.equal(atypical.filter(a => a.includes('hammer-tank') && a.includes("'body-aim'")).length, 1, atypical.join('\n'))
    assert.equal(errors.filter(e => e.includes('hammer-tank') && e.includes('body-aim')).length, 1, errors.join('\n'))
  })

  it('each ATYPICAL line ends with the rule string to record, and every recorded rule string is printed', () => {
    const { atypical } = validate(REPO_ROOT)
    const printed = new Set(atypical.map(a => a.match(/\(rule '([^']+)'\)$/)?.[1]).filter(Boolean))
    const units = load(REPO_ROOT, UNITS).units
    for (const u of units) for (const a of u.atypical || []) assert.ok(printed.has(a.rule), `'${a.rule}' is not printed`)
    for (const r of printed) assert.match(r, /^[a-z0-9-]+:[a-z0-9-]+ (classes|min_tier|requires|(allowed|excluded)\.[a-z0-9-]+) \S+$/)
  })

  describe('negative cases: one break each', () => {
    let baseline, baselineWarnings
    before(() => {
      const r = validate(freshCopy())
      baseline = new Set(r.errors)
      baselineWarnings = new Set(r.warnings)
    })
    for (const [name, expected, kind, breakIt] of cases) {
      it(name, () => {
        const dir = freshCopy()
        breakIt(dir)
        const expect = typeof expected === 'function' ? expected(dir) : expected
        const { errors, warnings } = validate(dir)
        const fresh = errors.filter(e => !baseline.has(e))
        if (kind === 'error') {
          assert.ok(fresh.some(e => e.includes(expect)), `expected an ERROR containing "${expect}"; new errors:\n${fresh.slice(0, 6).join('\n')}`)
        } else if (kind === 'ok') {
          assert.deepEqual(fresh, [], 'expected no new errors')
        } else if (kind === 'no-warn') {
          assert.deepEqual(fresh, [], 'expected no new errors')
          const freshWarnings = warnings.filter(w => !baselineWarnings.has(w) && w.includes(expect))
          assert.deepEqual(freshWarnings, [], `expected no new WARN containing "${expect}"`)
        } else {
          assert.ok(warnings.some(w => !baselineWarnings.has(w) && w.includes(expect)), `expected a new WARN containing "${expect}"`)
          assert.deepEqual(fresh, [], 'expected a warning only, but got new errors')
        }
      })
    }
  })
})

// ---------------------------------------------------------------- research checker tools

describe('sample-for-check', () => {
  const ids = Array.from({ length: 40 }, (_, i) => `game.faction.unit-${String(i).padStart(2, '0')}`)

  it('checks 1 in 5 units, rounded up, at least 3, or all when there are fewer', () => {
    const want = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 3, 14: 3, 15: 3, 16: 4, 20: 4, 21: 5, 40: 8, 100: 20 }
    for (const [n, k] of Object.entries(want)) assert.equal(pickCount(Number(n)), k, `pickCount(${n})`)
  })

  it('gives the same pick for the same seed, whatever the input order', () => {
    const a = sampleIds(ids, 'r1-2026-10-18')
    assert.deepEqual(sampleIds(ids, 'r1-2026-10-18'), a)
    assert.deepEqual(sampleIds([...ids].reverse(), 'r1-2026-10-18'), a)
    assert.equal(a.length, 8)
    assert.deepEqual(a, [...a].sort())
    for (const id of a) assert.ok(ids.includes(id))
  })

  it('gives a different pick for a different seed', () => {
    assert.notDeepEqual(sampleIds(ids, 'seed-one'), sampleIds(ids, 'seed-two'))
  })

  it('samples every game in the repo and lists the proposed patterns', () => {
    const s = buildSample(REPO_ROOT, { seed: 'test' })
    assert.ok(s.games.length > 0)
    for (const g of s.games) assert.equal(g.picked.length, pickCount(g.total), g.game)
    for (const id of s.patterns) assert.equal(load(REPO_ROOT, PATTERN(id)).status, 'proposed')
  })

  it('prints the same output on every run with the same seed', () => {
    const run = () => spawnSync(process.execPath, [SAMPLE, '--seed', 'same-seed'], { encoding: 'utf8' })
    const [a, b] = [run(), run()]
    assert.equal(a.status, 0, a.stderr)
    assert.equal(a.stdout, b.stdout)
  })
})

describe('copy-check matching (offline)', () => {
  it('compares words lower-cased, without punctuation, with British and American spellings equal', () => {
    assert.deepEqual(words('Armoured, colour-coded; it’s IMMOBILISED.'), ['armored', 'color', 'coded', 'its', 'immobilized'])
  })

  it('finds runs of 6+ shared words, merged into one run, and ignores shorter ones', () => {
    const page = grams(words('The drone leaps inside an enemy vehicle and eats it from within.'), 6)
    assert.deepEqual(sharedRuns(words('Our drone leaps inside an enemy vehicle and eats it, then leaves.'), page, 6),
      ['drone leaps inside an enemy vehicle and eats it'])
    assert.deepEqual(sharedRuns(words('It leaps inside an enemy tank.'), page, 6), [])
    const ignore = grams(words('drone leaps inside an enemy vehicle'), 6)
    assert.deepEqual(sharedRuns(words('drone leaps inside an enemy vehicle'), page, 6, ignore), [])
  })

  it('reads wikitext link labels and drops markup', () => {
    assert.equal(wikitextToText("'''Bold''' [[Terror drone (Red Alert 3)|terror drone]] [[Soviet]]<!-- x -->").replace(/\s+/g, ' ').trim(),
      'Bold terror drone Soviet')
  })

  it('reaches MediaWiki sites through api.php and other sites as pages', () => {
    assert.deepEqual(mediaWikiTarget('https://strategywiki.org/wiki/Command_%26_Conquer:_Red_Alert_3/Soviet_units'),
      { title: 'Command & Conquer: Red Alert 3/Soviet units', apis: ['https://strategywiki.org/w/api.php'] })
    assert.deepEqual(mediaWikiTarget('https://cnc.fandom.com/wiki/Hammer_tank').apis, ['https://cnc.fandom.com/api.php'])
    assert.equal(mediaWikiTarget('https://www.halopedia.org/Red_Team').title, 'Red Team')
    assert.equal(mediaWikiTarget('https://cncnz.com/games/red-alert-2/soviet-units/'), null)
    assert.deepEqual(mediaWikiTarget('https://www.sarna.net/wiki/Atlas').apis, ['https://www.sarna.net/wiki/api.php'])
    assert.deepEqual(mediaWikiTarget('https://liquipedia.net/starcraft2/Siege_Tank_(Legacy_of_the_Void)'),
      { title: 'Siege Tank (Legacy of the Void)', apis: ['https://liquipedia.net/starcraft2/api.php'] })
  })

  it('collects cited URLs from nested sources and skips citation fields as prose', () => {
    const rec = {
      id: 'x', summary: 'Our own words here.',
      other_examples: [{ game: 'extra:Some Game', note: 'An example note.', sources: [{ url: 'https://a.example/p', title: 'Page title' }] }],
    }
    assert.deepEqual(citedUrls(rec), ['https://a.example/p'])
    assert.deepEqual(proseStrings(rec).map(([p]) => p), ['/summary', '/other_examples/0/note'])
  })
})
