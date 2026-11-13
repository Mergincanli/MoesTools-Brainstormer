// Proposed balance points per pattern (rule sheet section 10, method NEW): power = rank of risks.balance.level,
// complexity = rank of risks.readability.level (ratings: low 1, medium 2, high 3), cost = power / 2 rounded up.
// Stored generator.points win. Prints the full table and how well the formula reproduces the four stored values.
// Usage: node points.mjs [repoRoot] [--table]
import { load } from './lib.mjs'
const D = load(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : undefined)
const R = id => D.rank('ratings', id)
export function formula(p) { const power = R(p.risks.balance.level); return { cost: Math.ceil(power / 2), power, complexity: R(p.risks.readability.level) } }
const rows = D.patterns.map(p => ({ id: p.id, f: formula(p), stored: p.generator.points || null }))
let match = { cost: 0, power: 0, complexity: 0 }
for (const r of rows.filter(r => r.stored)) for (const k of Object.keys(match)) if (r.f[k] === r.stored[k]) match[k]++
console.log('stored points:', rows.filter(r => r.stored).length, 'formula reproduces them:', JSON.stringify(match), 'of 4 each')
for (const r of rows.filter(r => r.stored)) console.log('  ', r.id, 'stored', JSON.stringify(r.stored), 'formula', JSON.stringify(r.f))
const used = rows.map(r => r.stored || r.f)
const tally = k => used.reduce((m, x) => (m[x[k]] = (m[x[k]] || 0) + 1, m), {})
console.log('distribution (C/P/X used):', 'cost', JSON.stringify(tally('cost')), 'power', JSON.stringify(tally('power')), 'complexity', JSON.stringify(tally('complexity')))
if (process.argv.includes('--table')) {
  const g = {}
  for (const r of rows) { const u = r.stored || r.f; const k = `${u.cost}/${u.power}/${u.complexity}${r.stored ? ' (stored)' : ''}`; (g[k] ||= []).push(r.id) }
  for (const [k, v] of Object.entries(g).sort()) console.log(`| ${k} | ${v.length} | ${v.join(', ')} |`)
}
