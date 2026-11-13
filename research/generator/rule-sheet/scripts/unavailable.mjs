// Combinations of class, tier, flavour, role (and spice 1-2 vs 3-5) for which no card is possible under the rule
// sheet's hard rules (word-list classes, min_tier, allowed/excluded, role requires, role fit, flavour avoided parts
// below spice 3). Spice rarity never makes a combination unavailable (rule G5). Usage: node unavailable.mjs
import { D, hardParts } from './feasibility.mjs'
const out = []
for (const F of D.FLAVOURS) for (const C of D.GEN_CLASSES) for (const t of D.TIERS) for (const band of [[1, 'spice 1-2'], [3, 'spice 3-5']]) {
  const P = hardParts(C, t, F, band[0])
  for (const r of D.ROLES) if (!P.role.includes(r)) out.push({ role: r, class: C, tier: t, flavour: F, spice: band[1] })
}
const key = o => `${o.role}@${o.class}/${o.tier}`
const groups = {}
for (const o of out) (groups[key(o)] ||= []).push(`${o.flavour}:${o.spice}`)
console.log('unavailable role/class/tier combinations:', Object.keys(groups).length)
for (const [k, v] of Object.entries(groups)) console.log(' ', k, v.length === 6 ? '(every flavour, every spice)' : v.join(' '))
// signature candidates per class/tier with nothing at all
for (const C of D.GEN_CLASSES) for (const t of D.TIERS) { const P = hardParts(C, t, null, 5); if (!P.pattern.length) console.log('no pattern at all for', C, t) }
