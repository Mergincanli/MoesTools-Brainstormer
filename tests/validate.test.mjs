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
const CARD = 'docs/examples/concept-card.example.json'
const PATTERN = id => `data/patterns/${id}.json`
const VOCAB = id => `data/vocab/${id}.json`
// The first term in a word list that has a class rarity (decision 4B), so the cases don't depend on one term.
const crossOverTerm = v => v.terms.find(t => t.class_rarity) ?? assert.fail(`no term in '${v.id}' has a class_rarity`)

// Each case breaks one thing in a fresh copy. kind 'error': a new ERROR containing `expect`;
// kind 'warn': a new WARN containing `expect` and no new error; kind 'ok': no new error at all.
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
    const c = load(dir, CARD); delete c.parts.signature.cooldown; dump(dir, CARD, c)
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
  ['unit: a hard class ban still needs an atypical entry', "but 'atypical' has no entry for 'armour-models:downed-revive'", 'error', dir => {
    const d = load(dir, UNITS); unit(d, 'hammer-tank').armour.models.push('downed-revive'); dump(dir, UNITS, d)
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
  ['unit: anti-air weapon on a family without high air needs an atypical entry', "but 'atypical' has no entry for 'weapon-families:rockets'", 'error', dir => {
    const d = load(dir, UNITS); const u = unit(d, 'multigunner-ifv')
    u.atypical = u.atypical.filter(a => !a.rule.startsWith('weapon-families:rockets ')); dump(dir, UNITS, d)
  }],
  ['card: anti-air role with nothing that reaches the air', "role 'anti-air' requires one of [hits:low-air, hits:high-air]", 'error', dir => {
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

  describe('negative cases: one break each', () => {
    let baseline, baselineWarnings
    before(() => {
      const r = validate(freshCopy())
      baseline = new Set(r.errors)
      baselineWarnings = new Set(r.warnings)
    })
    for (const [name, expect, kind, breakIt] of cases) {
      it(name, () => {
        const dir = freshCopy()
        breakIt(dir)
        const { errors, warnings } = validate(dir)
        const fresh = errors.filter(e => !baseline.has(e))
        if (kind === 'error') {
          assert.ok(fresh.some(e => e.includes(expect)), `expected an ERROR containing "${expect}"; new errors:\n${fresh.slice(0, 4).join('\n')}`)
        } else if (kind === 'ok') {
          assert.deepEqual(fresh, [], 'expected no new errors')
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
