// Applies the proposed hard-control list (hard-control.json) to the patterns: for each listed variant, its effective
// min_tier and kinds, whether it meets decision 5B as the rule sheet writes it (stun class: tier T2 or higher, a kind
// that takes a cooldown, medium or longer; every class: an escape line), and which variants can therefore never be
// offered. Usage: node hard-control.mjs [repoRoot] [--json]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from './lib.mjs'
const D = load(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : undefined)
const here = path.dirname(fileURLToPath(import.meta.url))
const HC = JSON.parse(fs.readFileSync(path.join(here, 'hard-control.json'), 'utf8'))
const usesKey = k => D.terms['ability-kinds'][k].uses_key
const tr = t => D.rank('tiers', t)
const rows = []
for (const e of HC.patterns) {
  const p = D.patternById[e.pattern]
  if (!p) { rows.push({ pattern: e.pattern, problem: 'pattern not written' }); continue }
  const vs = e.variants === 'all' ? p.variants.filter(v => !(e.except || []).includes(v.id)) : p.variants.filter(v => e.variants.includes(v.id))
  for (const id of (e.variants === 'all' ? [] : e.variants)) if (!p.variants.some(v => v.id === id)) rows.push({ pattern: e.pattern, variant: id, problem: 'variant not found' })
  const escapeLine = e.escape === null ? null : p.player_translation.as_target[e.escape]
  for (const v of vs) {
    const o = v.overrides || {}
    const mt = o.min_tier || p.generator.min_tier
    const kinds = o.kinds || p.generator.kinds
    const cdKinds = kinds.filter(usesKey)
    const r = { pattern: e.pattern, variant: v.id, index: p.variants.indexOf(v), class: e.class, min_tier: mt, kinds: kinds.join('/'), escape: escapeLine ? `as_target/${e.escape}` : null, problems: [] }
    if (e.class === 'stun' && tr(mt) < 2) r.problems.push(e.min_tier_text ? `allowed at ${mt}, but its own text gives the stun only from ${e.min_tier_text}` : `allowed at ${mt}: decision 5B wants stuns only from T2${e.borderline ? ' (borderline: ' + e.borderline + ')' : ''}`)
    if (e.class === 'stun' && !cdKinds.length) r.problems.push(`kinds ${kinds.join('/')} take no cooldown, so 'a medium or longer cooldown' can't hold: never offered`)
    if (!escapeLine) r.problems.push('the pattern states no escape for this effect')
    rows.push(r)
  }
}
if (process.argv.includes('--json')) { console.log(JSON.stringify(rows, null, 1)); process.exit(0) }
console.log('hard-control variants listed:', rows.filter(r => r.variant && !r.problem).length, '(stun', rows.filter(r => r.class === 'stun').length + ', latch', rows.filter(r => r.class === 'latch').length + ')')
for (const r of rows) if (r.problem || r.problems.length) console.log('  ', r.pattern + '/' + (r.variant || ''), r.min_tier || '', r.kinds || '', '->', r.problem || r.problems.join('; '))
const neverOffered = rows.filter(r => (r.problems || []).some(x => x.includes('never offered')))
console.log('never offered under 5B (no cooldown kind):', neverOffered.length, neverOffered.map(r => r.pattern + '/' + r.variant).join(', '))
