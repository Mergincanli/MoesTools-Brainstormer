// The "one mechanic under two names" check (plan step 3b), first pass. For every pair of patterns it scores how alike
// their generator blocks are, and counts the unit abilities and weapons that link both. Signals (rule sheet rule A11,
// NEW): (a) related kind variant-of or generalises; (b) block likeness >= 0.5 (mean Jaccard of categories, kinds,
// classes, implies, requires links, countered_by links, counters links, team-play hooks); (c) 2 or more unit entries
// (abilities or weapons) that link both. A pair with (a), or with (b) and (c), is a candidate.
// Usage: node duplicates.mjs [repoRoot] [--all]
import { load } from './lib.mjs'
const D = load(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : undefined)
const J = (a, b) => { const A = new Set(a), B = new Set(b); if (!A.size && !B.size) return null; let n = 0; for (const x of A) if (B.has(x)) n++; return n / (A.size + B.size - n) }
const feat = p => { const G = p.generator; return {
  cat: [p.category, ...(p.also_in || [])], kinds: G.kinds, classes: G.classes, implies: G.implies || [], requires: (G.requires || []).flat(),
  cb: G.countered_by.map(x => x.ref), c: (G.counters || []).map(x => x.ref), hooks: p.team_play.hooks } }
const F = Object.fromEntries(D.patterns.map(p => [p.id, feat(p)]))
const both = {}
for (const u of D.units) for (const e of [...u.abilities, ...u.armament]) {
  const ps = [...new Set(e.patterns || [])].sort()
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) { const k = ps[i] + '|' + ps[j]; (both[k] ||= []).push(`${u.id}:${e.name}`) }
}
const rel = {}
for (const p of D.patterns) for (const r of p.related || []) if (['variant-of', 'generalises'].includes(r.kind)) { rel[[p.id, r.id].sort().join('|')] = r.kind }
const rows = []
const ids = D.patterns.map(p => p.id).sort()
for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
  const a = F[ids[i]], b = F[ids[j]]
  const parts = Object.keys(a).map(k => J(a[k], b[k])).filter(x => x !== null)
  const score = parts.reduce((s, x) => s + x, 0) / parts.length
  const k = ids[i] + '|' + ids[j]
  const conflict = (D.patternById[ids[i]].generator.conflicts_with || []).includes(ids[j]) || (D.patternById[ids[j]].generator.conflicts_with || []).includes(ids[i])
  rows.push({ k, score: Math.round(score * 100) / 100, shared: (both[k] || []).length, rel: rel[k] || '', conflict })
}
rows.sort((x, y) => y.score - x.score)
const cand = rows.filter(r => r.rel || (r.score >= 0.5 && r.shared >= 2))
console.log('pairs:', rows.length, 'candidates:', cand.length)
for (const r of cand) console.log('  CANDIDATE', r.k, 'likeness', r.score, 'shared unit entries', r.shared, r.rel, r.conflict ? 'already conflicts_with' : '')
console.log('top 12 by block likeness:')
for (const r of rows.slice(0, 12)) console.log('  ', r.k, r.score, 'shared', r.shared, r.rel, r.conflict ? 'conflicts' : '')
console.log('pairs with 2+ shared unit entries:')
for (const r of rows.filter(r => r.shared >= 2).sort((x, y) => y.shared - x.shared)) console.log('  ', r.k, 'shared', r.shared, 'likeness', r.score, r.conflict ? 'conflicts' : '', (both[r.k] || []).slice(0, 3).join('; '))
