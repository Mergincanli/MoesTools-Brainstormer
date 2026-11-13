// Counts the generator blocks: keys present, slots, kinds, rarities, min_tier, classes, variants and their min_spice,
// override keys, strengths/weaknesses per block, points. Usage: node counts.mjs [repoRoot]
import { load } from './lib.mjs'
const D = load(process.argv[2])
const tally = (arr) => arr.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {})
const P = D.patterns
console.log('patterns:', P.length, 'status:', JSON.stringify(tally(P.map(p => p.status))), 'with generator:', P.filter(p => p.generator).length)
const keys = {}
for (const p of P) for (const k of Object.keys(p.generator || {})) keys[k] = (keys[k] || 0) + 1
console.log('generator keys present:', JSON.stringify(keys))
const nonEmpty = {}
for (const p of P) for (const [k, v] of Object.entries(p.generator || {})) if (!Array.isArray(v) || v.length) nonEmpty[k] = (nonEmpty[k] || 0) + 1
console.log('generator keys non-empty:', JSON.stringify(nonEmpty))
console.log('slot:', JSON.stringify(tally(P.map(p => p.generator.slot))))
console.log('rarity:', JSON.stringify(tally(P.map(p => p.generator.rarity))))
console.log('min_tier:', JSON.stringify(tally(P.map(p => p.generator.min_tier))))
console.log('kinds (per pattern, any):', JSON.stringify(tally(P.flatMap(p => p.generator.kinds))))
console.log('kind sets:', JSON.stringify(tally(P.map(p => p.generator.kinds.join('/')))))
console.log('classes per class:', JSON.stringify(tally(P.flatMap(p => p.generator.classes))))
console.log('class_rarity entries:', JSON.stringify(tally(P.flatMap(p => Object.entries(p.generator.class_rarity || {}).map(([c, r]) => c + '=' + r)))))
console.log('flavour_lean:', JSON.stringify(tally(P.flatMap(p => p.generator.flavour_lean || []))))
console.log('generic:', P.filter(p => p.generic).map(p => p.id).join(', '))
console.log('strengths per block:', JSON.stringify(tally(P.map(p => (p.generator.adds_strengths || []).length))),
  'weaknesses per block:', JSON.stringify(tally(P.map(p => (p.generator.adds_weaknesses || []).length))),
  'counters per block:', JSON.stringify(tally(P.map(p => (p.generator.counters || []).length))),
  'countered_by per block:', JSON.stringify(tally(P.map(p => p.generator.countered_by.length))))
const V = P.flatMap(p => p.variants.map(v => ({ ...v, _p: p.id })))
console.log('variants:', V.length, 'by min_spice:', JSON.stringify(tally(V.map(v => v.min_spice))))
console.log('variants with overrides:', V.filter(v => v.overrides).length, 'override keys:', JSON.stringify(tally(V.flatMap(v => Object.keys(v.overrides || {})))))
const ovSW = V.filter(v => v.overrides && (v.overrides.adds_strengths || v.overrides.adds_weaknesses))
console.log('override strengths counts:', JSON.stringify(tally(ovSW.map(v => `${(v.overrides.adds_strengths || ['inherit']).length === undefined ? '?' : (v.overrides.adds_strengths ? v.overrides.adds_strengths.length : 'inh')}s/${v.overrides.adds_weaknesses ? v.overrides.adds_weaknesses.length : 'inh'}w`))))
console.log('min variant spice per pattern:', JSON.stringify(tally(P.map(p => Math.min(...p.variants.map(v => v.min_spice))))))
console.log('patterns whose every variant needs spice>=2:', P.filter(p => Math.min(...p.variants.map(v => v.min_spice)) >= 2).map(p => p.id).join(', '))
console.log('points:', P.filter(p => p.generator.points).map(p => p.id + JSON.stringify(p.generator.points)).join(' '))
console.log('ratings team_play:', JSON.stringify(tally(P.map(p => p.team_play.potential))), 'build:', JSON.stringify(tally(P.map(p => p.build_difficulty.level))),
  'balance risk:', JSON.stringify(tally(P.map(p => p.risks.balance.level))), 'readability risk:', JSON.stringify(tally(P.map(p => p.risks.readability.level))),
  'shooter_fit:', JSON.stringify(tally(P.map(p => p.shooter_fit.score))))
console.log('categories:', JSON.stringify(tally(P.map(p => p.category))))
console.log('team-play hooks (first):', JSON.stringify(tally(P.map(p => p.team_play.hooks[0]))))
console.log('units:', D.units.length, 'by file:', JSON.stringify(tally(D.units.map(u => u._file.split('/').pop()))))
console.log('registry:', D.registry.length, 'written:', D.registry.filter(r => D.patternById[r.id]).length, 'planned:', D.registry.filter(r => !D.patternById[r.id]).length)
