// For every adds_strengths / adds_weaknesses link in the generator blocks (base and variant overrides): is it the
// pattern itself (pattern:<own id>), guaranteed by the block's implies or requires, or not guaranteed (the card may
// lack the part, so the validator's "matchup link doesn't match the card's own parts" would fire)?
// Usage: node sw-links.mjs [repoRoot]
import { load, parseRef } from './lib.mjs'
const D = load(process.argv[2])
const res = { self: 0, implied: 0, required: 0, notGuaranteed: [] }
const otherPattern = []
for (const p of D.patterns) {
  const G = p.generator
  const blocks = [{ where: 'generator', o: G, base: true }, ...p.variants.map((v, i) => ({ where: `variants/${i}/overrides`, o: v.overrides || {}, v }))]
  for (const b of blocks) {
    const implies = b.o.implies || G.implies || []
    const requires = b.o.requires || G.requires || []
    for (const f of ['adds_strengths', 'adds_weaknesses']) {
      for (const [i, x] of (b.o[f] || []).entries()) {
        const r = parseRef(x.ref)
        if (r.kind === 'pattern' && r.id === p.id) { res.self++; continue }
        if (implies.includes(x.ref)) { res.implied++; continue }
        if (requires.some(g => g.length === 1 && g[0] === x.ref)) { res.required++; continue }
        const entry = { file: p._file, path: `${b.where}/${f}/${i}/ref`, ref: x.ref }
        if (r.kind === 'pattern') otherPattern.push(entry)
        res.notGuaranteed.push(entry)
      }
    }
  }
}
console.log('self:', res.self, 'implied:', res.implied, 'required (single-link group):', res.required, 'not guaranteed:', res.notGuaranteed.length, '(of which other patterns:', otherPattern.length + ')')
const byKind = {}
for (const e of res.notGuaranteed) { const k = parseRef(e.ref).kind; byKind[k] = (byKind[k] || 0) + 1 }
console.log('not guaranteed by kind:', JSON.stringify(byKind))
for (const e of res.notGuaranteed) console.log('  ', e.file, e.path, e.ref)
