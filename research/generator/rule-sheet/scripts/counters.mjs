// "At least one counter that some valid card can actually satisfy" (rule sheet section 9). For every distinct link in
// the patterns' countered_by (base blocks and variant overrides) it decides whether some card the rule sheet allows
// could have that part, using the static model in feasibility.mjs over every class and tier at spice 5: a link is
// satisfiable when some class/tier part set holds it (roles by their requires and fit, patterns by being offerable).
// Links a card can never hold: immune:, unit:, target:structure (no card is a building), planned patterns, and
// weapon-trait:stun while stun is kept off card weapons (rule HC1). It then checks every block (base and each variant
// as it would be on a card) for at least one satisfiable countered_by link. Usage: node counters.mjs [--json]
import { D, hardParts, roleOK, has } from './feasibility.mjs'
import { parseRef } from './lib.mjs'
const sets = []
for (const C of D.GEN_CLASSES) for (const t of D.TIERS) sets.push({ C, t, P: hardParts(C, t, null, 5) })
const memo = {}
export function satisfiable(l) {
  if (l in memo) return memo[l]
  const { kind, id } = parseRef(l)
  let ok
  if (kind === 'immune' || kind === 'unit') ok = false
  else if (kind === 'target' && id === 'structure') ok = false
  else if (kind === 'weapon-trait' && id === 'stun') ok = false
  else if (kind === 'pattern') ok = sets.some(s => s.P.pattern.includes(id))
  else if (kind === 'role') ok = sets.some(s => roleOK(id, s.P, s.C))
  else if (kind === 'category') ok = sets.some(s => s.P.category.includes(id))
  else if (kind === 'cost') ok = true // every band can be reached by some card (section 10)
  else ok = sets.some(s => has(s.P, l))
  return (memo[l] = ok)
}
const links = {}
const blocksWithout = []
const kindsCount = {}
for (const p of D.patterns) {
  const G = p.generator
  const blocks = [{ id: '(base)', cb: G.countered_by, where: 'generator/countered_by' }, ...p.variants.filter(v => v.overrides?.countered_by).map(v => ({ id: v.id, cb: v.overrides.countered_by, where: `variants/${p.variants.indexOf(v)}/overrides/countered_by` }))]
  for (const b of blocks) {
    for (const [i, x] of b.cb.entries()) {
      (links[x.ref] ||= []).push(`${p._file} ${b.where}/${i}`)
      const k = parseRef(x.ref).kind; kindsCount[k] = (kindsCount[k] || 0) + 1
    }
    if (!b.cb.some(x => satisfiable(x.ref))) blocksWithout.push(`${p.id} ${b.id}`)
  }
}
const uns = Object.keys(links).filter(l => !satisfiable(l))
if (process.argv.includes('--json')) { console.log(JSON.stringify({ unsatisfiable: Object.fromEntries(uns.map(l => [l, links[l]])), blocksWithout }, null, 1)); process.exit(0) }
console.log('countered_by links (base + overrides):', Object.values(links).flat().length, 'distinct:', Object.keys(links).length)
console.log('by kind:', JSON.stringify(Object.fromEntries(Object.entries(kindsCount).sort((a, b) => b[1] - a[1]))))
console.log('distinct links no card can satisfy:', uns.length)
for (const l of uns) console.log('  ', l, 'used', links[l].length, 'times:', links[l].join('; '))
console.log('blocks (base or variant) whose every countered_by link is unsatisfiable:', blocksWithout.length, blocksWithout.join(', '))
