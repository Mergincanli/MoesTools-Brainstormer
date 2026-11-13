// Every typed link in the patterns' generator blocks and variant overrides: kinds used per field (with counts), and
// links that name no term, a research-only term, a planned pattern or a unit. Also conflicts_with ids that are not
// written patterns, and class names that are research-only. Usage: node links.mjs [repoRoot] [--json]
import { load, generatorLinks, linkProblem, parseRef } from './lib.mjs'
const D = load(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : undefined)
const all = D.patterns.flatMap(p => generatorLinks(p).map(l => ({ ...l, pattern: p.id, file: p._file })))
const byField = {}
for (const l of all) {
  const k = parseRef(l.ref).kind + (parseRef(l.ref).cmp ? parseRef(l.ref).cmp : '')
  ;((byField[l.field] ||= {})[k] = (byField[l.field][k] || 0) + 1)
}
console.log('links in generator blocks and overrides:', all.length)
for (const [f, m] of Object.entries(byField)) console.log(' ', f, JSON.stringify(Object.fromEntries(Object.entries(m).sort((a, b) => b[1] - a[1]))))
const base = D.patterns.flatMap(p => generatorLinks(p).filter(l => l.where.startsWith('generator/')).map(l => ({ ...l, pattern: p.id })))
const cbKinds = {}
for (const l of base.filter(l => l.field === 'countered_by')) { const k = parseRef(l.ref).kind; cbKinds[k] = (cbKinds[k] || 0) + 1 }
console.log('base countered_by kinds:', JSON.stringify(Object.fromEntries(Object.entries(cbKinds).sort((a, b) => b[1] - a[1]))))
const cKinds = {}
for (const l of base.filter(l => l.field === 'counters')) { const k = parseRef(l.ref).kind; cKinds[k] = (cKinds[k] || 0) + 1 }
console.log('base counters kinds:', JSON.stringify(Object.fromEntries(Object.entries(cKinds).sort((a, b) => b[1] - a[1]))))
const probs = all.map(l => ({ ...l, problem: linkProblem(D, l.ref) })).filter(l => l.problem)
console.log('link problems:', probs.length)
for (const l of probs) console.log('  ', l.file, l.where, l.ref, '->', l.problem)
for (const p of D.patterns) {
  for (const [i, c] of (p.generator.conflicts_with || []).entries()) {
    if (!D.patternById[c]) console.log('  conflicts_with not written:', p._file, `generator/conflicts_with/${i}`, c, D.registryById[c] ? '(planned in registry)' : '(not in registry)')
  }
  for (const [i, c] of p.generator.classes.entries()) if (D.terms.classes[c]?.source_only) console.log('  research-only class:', p._file, `generator/classes/${i}`, c)
  for (const c of Object.keys(p.generator.class_rarity || {})) if (D.terms.classes[c]?.source_only) console.log('  research-only class in class_rarity:', p._file, `generator/class_rarity/${c}`)
}
// distinct links used in base countered_by
const distinct = [...new Set(base.filter(l => l.field === 'countered_by').map(l => l.ref))].sort()
console.log('distinct base countered_by links:', distinct.length)
console.log(distinct.join(' '))
