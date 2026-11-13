// The key budget (decision 1B) applied to the patterns: for each pattern and variant, the fewest keys it costs on a
// card, counted as scripts/validate.mjs counts them (key kinds + key-bound mobility traits + a secondary weapon) and as
// the rule sheet proposes (a key-bound trait and its own pattern are one button: proposal K1). It lists what does not
// fit a T1 budget, and the passive budget. Usage: node keys.mjs [repoRoot]
import { load } from './lib.mjs'
const D = load(process.argv[2])
const T = D.terms
const usesKey = k => T['ability-kinds'][k].uses_key
const tierRank = t => D.rank('tiers', t)
const keyTraits = Object.fromEntries(D.vocab['mobility-traits'].terms.filter(t => t.uses_key).map(t => [t.id, t.pattern]))
const rows = []
for (const p of D.patterns) {
  const G = p.generator
  for (const v of p.variants) {
    const o = v.overrides || {}
    const kinds = o.kinds || G.kinds
    const mt = o.min_tier || G.min_tier
    const imp = o.implies || G.implies || []
    const traitKeys = imp.filter(l => l.startsWith('mobility-trait:') && keyTraits[l.slice(15)]).length
    const adaptiveSecondary = imp.includes('weapon:adaptive') && (G.requires || []).some(g => g.some(l => l.startsWith('weapon:'))) ? 1 : 0
    const minKind = kinds.some(k => !usesKey(k)) ? 0 : 1
    const minPassive = kinds.some(k => usesKey(k)) ? 0 : 1
    const validatorKeys = minKind + traitKeys + adaptiveSecondary
    const k1Keys = (traitKeys && minKind ? minKind : minKind + traitKeys) + adaptiveSecondary
    rows.push({ p: p.id, v: v.id, slot: G.slot, kinds: kinds.join('/'), mt, validatorKeys, k1Keys, minPassive, traitKeys })
  }
}
const over = (r, budget) => r.validatorKeys > budget
console.log('variants:', rows.length)
console.log('variants costing 2+ keys by the validator count:', rows.filter(r => r.validatorKeys >= 2).length, '; by K1:', rows.filter(r => r.k1Keys >= 2).length)
console.log('  2+ keys (validator) list:', rows.filter(r => r.validatorKeys >= 2).map(r => `${r.p}/${r.v}(${r.validatorKeys}${r.k1Keys !== r.validatorKeys ? '->' + r.k1Keys : ''})`).join(' '))
console.log('variants whose kinds are all passive/triggered (they use the one passive):', rows.filter(r => r.minPassive).length)
console.log('variants with a key-bound trait implied:', rows.filter(r => r.traitKeys).length, [...new Set(rows.filter(r => r.traitKeys).map(r => r.p))].join(', '))
// T1 driver-gunner: signature + gunner's secondary = must fit 2
const t1dg = rows.filter(r => tierRank(r.mt) === 1 && r.slot !== 'extra' && r.validatorKeys + 1 > 2)
console.log('T1 signatures that cannot sit on a driver-gunner T1 card (validator count, gunner gun = 1 key):', t1dg.map(r => `${r.p}/${r.v}`).join(' ') || 'none')
const t1dgK1 = rows.filter(r => tierRank(r.mt) === 1 && r.slot !== 'extra' && r.k1Keys + 1 > 2)
console.log('  same with K1:', t1dgK1.map(r => `${r.p}/${r.v}`).join(' ') || 'none')
