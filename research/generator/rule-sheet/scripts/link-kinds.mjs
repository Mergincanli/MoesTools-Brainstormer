// Counts the typed-link kinds used in matchups: countered_by and counters of the patterns' generator blocks and
// variant overrides (what cards will carry), and the same lists on the 55 source units (for reference).
// Usage: node link-kinds.mjs [repoRoot]
import { load, generatorLinks, parseRef } from './lib.mjs'
const D = load(process.argv[2])
const count = (refs) => { const m = {}; for (const r of refs) { const k = parseRef(r).kind; m[k] = (m[k] || 0) + 1 } return Object.fromEntries(Object.entries(m).sort((a, b) => b[1] - a[1])) }
for (const f of ['countered_by', 'counters']) {
  const refs = D.patterns.flatMap(p => generatorLinks(p).filter(l => l.field === f).map(l => l.ref))
  console.log(`patterns ${f}: ${refs.length} links, ${new Set(refs).size} distinct, kinds ${Object.keys(count(refs)).length}:`, JSON.stringify(count(refs)))
  const urefs = D.units.flatMap(u => (u[f] || []).map(x => x.ref))
  console.log(`units ${f}: ${urefs.length} links:`, JSON.stringify(count(urefs)))
}
