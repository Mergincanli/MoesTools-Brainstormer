// Signature candidates per class, tier and flavour at spice 1 and 5 under rule G5 (parts that a pattern implies or
// requires are set by hard rules only; the pattern's own rarity and its variants' min_spice still apply), and the
// variants that the hard-control rules keep out. Usage: node signature-counts.mjs
import { D, hardParts, patternOK } from './feasibility.mjs'
for (const s of [1, 5]) {
  const counts = {}
  for (const F of s === 1 ? D.FLAVOURS : [null]) for (const C of D.GEN_CLASSES) for (const t of D.TIERS) {
    const P = hardParts(C, t, F, s)
    counts[`${C}/${t}${F ? '/' + F : ''}`] = D.patterns.filter(p => p.generator.slot !== 'extra' && patternOK(p, P, C, t, F, s).length).length
  }
  const v = Object.values(counts)
  const sorted = Object.entries(counts).sort((a, b) => a[1] - b[1])
  console.log(`spice ${s}: signature candidates min ${Math.min(...v)} max ${Math.max(...v)}; lowest ${sorted.slice(0, 4).map(([k, n]) => k + '=' + n).join(' ')}; highest ${sorted.slice(-2).map(([k, n]) => k + '=' + n).join(' ')}`)
}
