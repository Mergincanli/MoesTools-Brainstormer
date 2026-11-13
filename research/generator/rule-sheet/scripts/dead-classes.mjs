// Classes a generator block lists that no card of that class can use at any tier (the block's own implies, requires
// or the variants' overrides can never be met for it, under the hard rules of feasibility.mjs), plus kinds that need
// a higher tier than the block allows (ultimate before T3) and blocks that imply what they exclude.
// Usage: node dead-classes.mjs [--json]
import { D, hardParts, patternOK } from './feasibility.mjs'
const out = { deadClasses: [], ultimateEarly: [], impliesExcluded: [] }
for (const p of D.patterns) {
  const G = p.generator
  const classes = [...new Set([...G.classes, ...p.variants.flatMap(v => v.overrides?.classes || [])])].filter(c => D.GEN_CLASSES.includes(c))
  for (const C of classes) {
    let ok = false
    for (const t of D.TIERS) { const P = hardParts(C, t, null, 5); if (patternOK(p, P, C, t, null, 5).length) { ok = true; break } }
    if (!ok) out.deadClasses.push({ file: p._file, path: 'generator/classes', class: C })
  }
  const blocks = [{ w: 'generator', o: G }, ...p.variants.map((v, i) => ({ w: `variants/${i}/overrides`, o: v.overrides || {}, v }))]
  for (const b of blocks) {
    const kinds = b.o.kinds || (b.v ? null : G.kinds)
    const mt = b.o.min_tier || G.min_tier
    if (kinds && kinds.includes('ultimate') && D.rank('tiers', mt) < 3) out.ultimateEarly.push({ file: p._file, path: `${b.w}/kinds`, min_tier: mt })
    const imp = b.o.implies || (b.v ? [] : G.implies || []), exc = b.o.excludes || G.excludes || []
    for (const l of imp) if (exc.includes(l)) out.impliesExcluded.push({ file: p._file, path: `${b.w}/implies`, link: l })
  }
}
if (process.argv.includes('--json')) { console.log(JSON.stringify(out, null, 1)); process.exit(0) }
console.log('listed classes no card of that class can use:', out.deadClasses.length, out.deadClasses.map(x => x.file.split('/').pop() + ':' + x.class).join(' '))
console.log('ultimate kind allowed below T3:', out.ultimateEarly.length, out.ultimateEarly.map(x => x.file.split('/').pop() + ' ' + x.path + ' (' + x.min_tier + ')').join('; '))
console.log('blocks that imply what they exclude:', out.impliesExcluded.length)
