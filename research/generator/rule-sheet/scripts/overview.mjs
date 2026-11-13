// Prints one line per pattern: its generator block in short, its ratings and variants.
// Usage: node overview.mjs [repoRoot]
import { load } from './lib.mjs'
const D = load(process.argv[2])
for (const p of D.patterns) {
  const G = p.generator
  const cr = G.class_rarity ? Object.entries(G.class_rarity).map(([k, v]) => `${k}=${v[0]}`).join(',') : ''
  const vs = p.variants.map(v => v.min_spice).join('')
  const ov = p.variants.filter(v => v.overrides).map(v => `${v.id}{${Object.keys(v.overrides).join(',')}}`).join(' ')
  console.log([p.id, p.category + (p.also_in ? '+' + p.also_in.join('+') : ''), p.generic ? 'GENERIC' : '', G.slot, G.kinds.join('/'), G.rarity, G.min_tier,
    G.classes.map(c => c.slice(0, 3)).join(','), cr, G.flavour_lean ? 'lean:' + G.flavour_lean.join(',') : '',
    G.requires ? 'req:' + JSON.stringify(G.requires) : '', G.excludes ? 'exc:' + G.excludes.join(',') : '', G.implies ? 'imp:' + G.implies.join(',') : '',
    G.conflicts_with ? 'conf:' + G.conflicts_with.join(',') : '', `s${(G.adds_strengths || []).length}w${(G.adds_weaknesses || []).length}c${(G.counters || []).length}cb${G.countered_by.length}`,
    G.points ? 'pts:' + JSON.stringify(G.points) : '', `tp:${p.team_play.potential} bd:${p.build_difficulty.level} rb:${p.risks.balance.level} rr:${p.risks.readability.level} fit:${p.shooter_fit.score}`,
    `v:${vs}`, ov].filter(Boolean).join(' | '))
}
