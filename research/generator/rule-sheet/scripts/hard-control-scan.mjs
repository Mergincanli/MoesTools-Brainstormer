// Finds pattern bases and variants whose text describes a lockdown of the victim (stun, freeze, stasis, lift, full
// shutdown, helpless) or a latch onto the victim. Prints each hit with the effective min_tier and kinds, so the rule
// sheet's hard-control list can be checked. Usage: node hard-control-scan.mjs [repoRoot]
import { load } from './lib.mjs'
const D = load(process.argv[2])
const STUN = /\bstun|\bfreez|\bfrozen|stasis|can'?t move,? (or )?fire|cannot move,? (or )?fire|can'?t move or fire|helpless|can'?t do anything|can'?t act|paraly|shut(s)? ?down|stops? (every|one|it|the) machine|stops? it\b|lift(s|ed)? (a|the|it|one)|seize|full control|knock(s|ed)? (soldiers )?off their feet/i
const LATCH = /\blatch|\battach|cling|clamp|stuck onto|sticks? (to|onto)|boards?\b|climbs? (in|on)/i
const out = []
for (const p of D.patterns) {
  const G = p.generator
  const baseText = p.summary
  const hit = (txt) => [STUN.test(txt) ? 'stun-like' : null, LATCH.test(txt) ? 'latch-like' : null].filter(Boolean)
  const hb = hit(baseText)
  if (hb.length) out.push({ p: p.id, v: '(base)', tier: G.min_tier, kinds: G.kinds.join('/'), hits: hb.join('+'), text: baseText.slice(0, 150) })
  for (const v of p.variants) {
    const h = hit(v.summary)
    if (h.length) out.push({ p: p.id, v: v.id, spice: v.min_spice, tier: v.overrides?.min_tier || G.min_tier, kinds: (v.overrides?.kinds || G.kinds).join('/'), hits: h.join('+'), text: v.summary.slice(0, 150) })
  }
}
for (const o of out) console.log(`${o.p} | ${o.v} | s${o.spice ?? '-'} | ${o.tier} | ${o.kinds} | ${o.hits} | ${o.text}`)
console.log('hits:', out.length)
