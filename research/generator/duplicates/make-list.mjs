// Builds the list of pairs for Mustafa (pairs.md) and the proposed same_mechanic entries from the judge's verdicts.
// Usage: node research/generator/duplicates/make-list.mjs   (reads verdicts.json next to it, writes the two files there)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const DIR = process.argv[2] || path.dirname(fileURLToPath(import.meta.url))
const v = JSON.parse(fs.readFileSync(`${DIR}/verdicts.json`, 'utf8'))
const all = [...v.level1_level2, ...v.level3_move_up, ...v.extra]
// Scopes that the judge widened beyond the two variants named (its marking notes).
const WIDE = {
  'L2-01': { b: null },                       // blast-spends-user against every self-destruct variant
  'L2-21': { a: null },                       // buried-trap against any burrow variant
  'L2-22': { b: null },                       // be-the-mine against any burrow variant
  'L2-27': { b: null },                       // scout-drone against all of reveal-area
  'L2-30': { b: null },                       // disguised-bomb against every disguise variant (covers X-01)
  'L3-32': { b: ['thrown-pool', 'planted-field', 'ranged-storm', 'trap-canisters', 'indiscriminate', 'stacking-fields'] },
}
const ALREADY = new Set(['L1-01', 'L2-38', 'L2-39'])
const COVERED = new Set(['X-01']) // inside L2-30's widened scope
const side = (s, wide) => { const vs = wide === null ? null : wide || (s.variant ? [s.variant] : null); return vs ? { pattern: s.pattern, variants: vs } : { pattern: s.pattern } }
const label = s => s.variants ? `${s.pattern}: ${s.variants.join(', ')}` : `${s.pattern} (every variant)`
const group = e => ALREADY.has(e.id) ? 'already' : e.verdict === 'same' ? 'same' : e.verdict === 'distinct' ? 'distinct' : /^a/.test(e.marking) ? 'repeat' : 'second-tool'
const entries = []
const rows = { same: [], repeat: [], 'second-tool': [], distinct: [], already: [] }
for (const e of all) {
  const g = group(e)
  const w = WIDE[e.id] || {}
  const a = side(e.a, 'a' in w ? w.a : undefined), b = side(e.b, 'b' in w ? w.b : undefined)
  rows[g].push({ id: e.id, a, b, reason: e.reason, share: e.can_share_a_card })
  if ((g === 'same' || g === 'repeat') && !COVERED.has(e.id)) entries.push({ a, b, verdict: g === 'same' ? 'same' : 'repeat', note: `${e.id}: ${e.reason.split('. ')[0]}.` })
}
const table = (list) => ['| # | One entry | The other entry | Why |', '|---|---|---|---|', ...list.map(r => `| ${r.id} | ${label(r.a)} | ${label(r.b)} | ${r.reason.replace(/\|/g, '/')} |`)].join('\n')
const md = [
  '# Patterns that are one mechanic under two names: the list for Mustafa', '',
  'A finder read all 69 patterns and proposed pairs; a judge then opened both files of every pair and gave a verdict. Nothing is merged or renamed: a marked pair only means that no card gets both. Each row names a pattern and the variants the verdict holds for.', '',
  `## 1. The same mechanic (${rows.same.length} pairs)`, '', 'A card that held both would have the same button, or the same passive, twice.', '', table(rows.same), '',
  `## 2. Mostly a repeat (${rows.repeat.length} pairs)`, '', 'The two share most of the action; each has a small part of its own, but a card holding both gets mostly the same tool twice. The judge would still keep them off one card.', '', table(rows.repeat), '',
  `## 3. Overlap, but a real second tool (${rows['second-tool'].length} pairs): no marking proposed`, '', table(rows['second-tool']), '',
  `## 4. Rejected: different mechanics (${rows.distinct.length})`, '', table(rows.distinct), '',
  `## 5. Already kept apart by the patterns themselves (${rows.already.length})`, '', table(rows.already), '',
].join('\n')
fs.writeFileSync(`${DIR}/pairs.md`, md)
fs.writeFileSync(`${DIR}/same-mechanic-proposed.json`, JSON.stringify(entries, null, 1) + '\n')
console.log(Object.fromEntries(Object.entries(rows).map(([k, x]) => [k, x.length])), 'entries proposed:', entries.length, '(same', entries.filter(e => e.verdict === 'same').length, ', repeat', entries.filter(e => e.verdict === 'repeat').length, ')')
