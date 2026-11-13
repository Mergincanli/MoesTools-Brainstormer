// A static feasibility model of the rule sheet: for a class, tier, flavour and spice, which parts can appear on a card
// at all (each term's hard rules, rarity at that spice with the flavour's one-step bonus, avoided-until-spice), and,
// from that, which roles and patterns (signature / extra) can be offered. It ignores most interactions between two
// parts, so it can only show what is impossible, never prove a full card exists (the generator's own test does that).
// Exports possible(); run directly it prints the tables used in the rule sheet. Usage: node feasibility.mjs [repoRoot]
import { load, parseRef } from './lib.mjs'
export const D = load(process.env.REPO)
const T = D.terms
const rk = (v, id) => D.rank(v, id)
const tierOK = (mt, tier) => !mt || rk('tiers', tier) >= rk('tiers', mt)
const STEP = { rare: 'uncommon', uncommon: 'common', common: 'common' }
// Effective rarity of a term (or pattern block) for class C and flavour F: class_rarity wins (no flavour step);
// otherwise the rarity (common when the term has none: rule G9), one step more common when F favours it.
export function effRarity(x, C, favoured) {
  if (x.class_rarity && x.class_rarity[C]) return x.class_rarity[C]
  const r = x.rarity || 'common'
  return favoured ? STEP[r] : r
}
export const minSpice = r => T.rarity[r].min_spice
const favouredBy = (F, vid, id) => (T['faction-flavours'][F]?.favoured?.[vid] || []).includes(id)
const avoidedBy = (F, vid, id) => (T['faction-flavours'][F]?.avoided?.[vid] || []).includes(id)
// Is term id of list vid offered at all for class C, tier, flavour F, spice s (single-term rules only)?
export function termOK(vid, id, C, tier, F, s) {
  const t = T[vid][id]
  if (!t || t.source_only) return false
  if (t.classes && !t.classes.includes(C)) return false
  if (!tierOK(t.min_tier, tier)) return false
  if (F && avoidedBy(F, vid, id) && s < T['faction-flavours'][F].avoided_until_spice) return false
  const r = effRarity(t, C, F && favouredBy(F, vid, id))
  return s >= minSpice(r)
}
const ids = vid => Object.keys(T[vid])
const inter = (a, b) => a.filter(x => b.includes(x))

export function possible(C, tier, F, s) {
  const P = { class: [C], tier: [tier] }
  P.mobility = ids('mobility').filter(m => termOK('mobility', m, C, tier, F, s))
  P.body = ids('bodies').filter(b => termOK('bodies', b, C, tier, F, s) && (!T.bodies[b].allowed?.mobility || inter(T.bodies[b].allowed.mobility, P.mobility).length))
  const classSizes = T.classes[C].allowed?.sizes || ids('sizes')
  P.size = [...new Set(P.body.flatMap(b => T.bodies[b].allowed?.sizes || ids('sizes')))].filter(z => classSizes.includes(z) && termOK('sizes', z, C, tier, F, s))
  P.speed = [...new Set(P.mobility.flatMap(m => T.mobility[m].allowed?.['speed-bands'] || ids('speed-bands')))].filter(x => termOK('speed-bands', x, C, tier, F, s))
  P['armour-class'] = ids('armour-classes').filter(a => termOK('armour-classes', a, C, tier, F, s) && (!T['armour-classes'][a].allowed?.sizes || inter(T['armour-classes'][a].allowed.sizes, P.size).length))
  P.crew = ids('crew-models').filter(c => { const t = T['crew-models'][c]; return termOK('crew-models', c, C, tier, F, s) && (!t.allowed?.sizes || inter(t.allowed.sizes, P.size).length) })
  P.nature = []
  if (C === 'infantry') P.nature.push('organic')
  if (['walker', 'aircraft'].includes(C) && P.body.includes('beast') && termOK('nature', 'organic', C, tier, F, s)) P.nature.push('organic')
  if (['vehicle', 'walker', 'hover', 'aircraft'].includes(C)) P.nature.push('crewed-machine')
  if (C === 'drone' || P.crew.includes('remote')) P.nature.push('uncrewed-machine')
  P['armour-model'] = ids('armour-models').filter(a => { const t = T['armour-models'][a]; if (!termOK('armour-models', a, C, tier, F, s)) return false
    if (t.allowed?.['armour-classes'] && !inter(t.allowed['armour-classes'], P['armour-class']).length) return false
    if (t.allowed?.sizes && !inter(t.allowed.sizes, P.size).length) return false
    if (t.excluded?.sizes && P.size.every(z => t.excluded.sizes.includes(z))) return false
    if (t.excluded?.classes?.includes(C)) return false
    if (t.excluded?.nature && P.nature.every(n => t.excluded.nature.includes(n))) return false
    if (t.excluded?.['armour-classes'] && P['armour-class'].every(z => t.excluded['armour-classes'].includes(z))) return false
    if (a === 'crew-casualties' && !P.crew.some(c => ['driver-gunner', 'driver-gunner-commander'].includes(c)) && !['vehicle', 'hover', 'walker', 'aircraft'].includes(C)) return false
    return true })
  P.mount = [...new Set(P.body.flatMap(b => T.bodies[b].allowed?.['aim-models'] || ids('aim-models')))].filter(m => termOK('aim-models', m, C, tier, F, s))
  P.target = [...new Set(P.mobility.map(m => T.mobility[m].target_type))]
  if (P.target.includes('ground-vehicle') && P.size.some(z => rk('sizes', z) <= 2)) P.target.push('infantry')
  const flier = P.target.some(t => t === 'low-air' || t === 'high-air')
  P.weapon = ids('weapon-families').filter(f => termOK('weapon-families', f, C, tier, F, s))
  P.damage = new Set(); P.delivery = new Set(); P.hits = new Set(); P.range = new Set(); P['weapon-trait'] = new Set()
  const RB = ids('range-bands')
  for (const f of P.weapon) {
    const t = T['weapon-families'][f]
    let dels = t.allowed?.['weapon-delivery'] || [t.default_delivery].filter(Boolean)
    if (f === 'adaptive') dels = []
    dels = dels.filter(d => d !== 'drop' || flier)
    for (const d of (t.allowed?.['damage-types'] || [t.default_damage]).filter(Boolean)) P.damage.add(d)
    for (const d of dels) P.delivery.add(d)
    const ri = RB.indexOf(t.default_range)
    if (ri >= 0) for (const j of [ri - 1, ri, ri + 1]) if (RB[j]) P.range.add(RB[j])
    const tt = (t.allowed?.['target-types'] || []).filter(x => !T['target-types'][x]?.source_only)
    const groundOnlyDel = dels.length && dels.every(d => ['lobbed', 'drop', 'place'].includes(d))
    for (const x of tt) { if ((x === 'low-air' || x === 'high-air') && groundOnlyDel) continue; P.hits.add(x) }
    if (tt.includes('low-air') && dels.some(d => !['lobbed', 'drop', 'place', 'melee'].includes(d))) P.hits.add('high-air')
  }
  for (const tr of ids('weapon-traits')) if (tr !== 'stun') P['weapon-trait'].add(tr)
  for (const k of ['damage', 'delivery', 'hits', 'range', 'weapon-trait']) P[k] = [...P[k]]
  P.sensor = ids('sensor-traits').filter(x => { const t = T['sensor-traits'][x]; if (!termOK('sensor-traits', x, C, tier, F, s)) return false
    if (t.excluded?.mobility && P.mobility.every(m => t.excluded.mobility.includes(m))) return false
    if (t.excluded?.sizes && P.size.every(z => t.excluded.sizes.includes(z))) return false
    return true })
  P.sight = ids('sight-bands')
  P.availability = ids('availability').filter(a => termOK('availability', a, C, tier, F, s))
  P.handling = [...new Set(P.mobility.map(m => T.mobility[m].default_handling))]
  P.cost = ids('cost-bands')
  P.resource = ids('resources')
  P.passengersMax = (['vehicle', 'walker', 'hover', 'aircraft'].includes(C) && P.size.some(z => rk('sizes', z) >= 3)) ? 8 : 0
  P['mobility-trait'] = ids('mobility-traits').filter(x => { const t = T['mobility-traits'][x]; if (!termOK('mobility-traits', x, C, tier, F, s)) return false
    if (t.allowed?.sizes && !inter(t.allowed.sizes, P.size).length) return false
    if (t.allowed?.mobility && !inter(t.allowed.mobility, P.mobility).length) return false
    if (t.excluded?.mobility && P.mobility.every(m => t.excluded.mobility.includes(m))) return false
    return true })
  // roles and patterns, to a fixed point (roles need patterns and categories, patterns need roles)
  P.pattern = []; P.category = []; P.role = []
  for (let it = 0; it < 4; it++) {
    P.role = ids('roles').filter(r => roleOK(r, P, C))
    const pats = D.patterns.filter(p => patternOK(p, P, C, tier, F, s).length)
    P.pattern = pats.map(p => p.id)
    P.category = [...new Set(pats.map(p => p.category))]
  }
  return P
}
// Role fit (rule sheet rule G13): roles whose word-list requires say nothing about the mechanic get a fit
// test: a pattern (any of the listed) or parts, taken from docs/fields.md roles rules and the patterns' implies.
export const ROLE_FIT = {
  engineer: { patterns: ['capture-structure', 'build-structure', 'host-spawn-point', 'build-linked-exits'] },
  logistics: { patterns: ['gather-resources', 'generate-income'] },
  buffer: { patterns: ['rally-allies', 'sacrifice-for-allies'] },
  infiltrator: { patterns: ['capture-structure', 'hijack-vehicle', 'infest-vehicle', 'cloak', 'disguise'] },
  'anti-infantry': { any: ['weapon-trait:splash', 'weapon:small-arms', 'weapon:machine-gun', 'weapon:shotgun'] },
  assault: { all: ['armour-class:>=medium', 'range:<=medium'] },
  raider: { all: ['speed:>=fast', 'armour-class:<=light'] },
}
export function roleOK(r, P, C, selfPattern) {
  const t = T.roles[r]
  if (t.classes && !t.classes.includes(C)) return false
  const hasL = l => l.startsWith('pattern:') ? (P.pattern.includes(l.slice(8)) || l.slice(8) === selfPattern) : l.startsWith('category:') ? (P.category.includes(l.slice(9)) || D.patternById[selfPattern]?.category === l.slice(9)) : has(P, l)
  if (!(t.requires || []).every(g => g.some(hasL))) return false
  const f = ROLE_FIT[r]
  if (f?.patterns && !f.patterns.some(x => P.pattern.includes(x) || x === selfPattern)) return false
  if (f?.any && !f.any.some(hasL)) return false
  if (f?.all && !f.all.every(hasL)) return false
  return true
}
// Does the possible-part set P allow link l (by the validator's matching rules)?
export function has(P, l) {
  const { kind, cmp, id } = parseRef(l)
  if (kind === 'passengers') { const n = Number(id); return cmp === '<=' ? true : cmp === '>=' ? P.passengersMax >= n : (n === 0 || P.passengersMax >= n) }
  if (kind === 'immune' || kind === 'unit') return false
  const list = P[kind]
  if (!list) return false
  const vid = D.refKinds[kind]?.vocab
  if (!cmp) return list.includes(id)
  return list.some(x => cmp === '<=' ? rk(vid, x) <= rk(vid, id) : rk(vid, x) >= rk(vid, id))
}
// Can a part set P be made to avoid link l? (an exclude only bites when every option has the part)
function avoidable(P, l) {
  const { kind, cmp, id } = parseRef(l)
  if (kind === 'passengers') return true
  const list = P[kind]; if (!list || !list.length) return true
  const vid = D.refKinds[kind]?.vocab
  return list.some(x => !(cmp ? (cmp === '<=' ? rk(vid, x) <= rk(vid, id) : rk(vid, x) >= rk(vid, id)) : x === id))
}
// Variants of pattern p that can be offered for class C, tier, flavour F, spice s, given part set P.
export function patternOK(p, P, C, tier, F, s) {
  const G = p.generator
  const out = []
  for (const v of p.variants) {
    const o = v.overrides || {}
    const classes = o.classes || G.classes
    if (!classes.includes(C)) continue
    const cr = o.class_rarity || G.class_rarity
    const lean = F && (G.flavour_lean || []).includes(F)
    const r = cr && cr[C] ? cr[C] : (lean ? STEP[G.rarity] : G.rarity)
    if (s < minSpice(r)) continue
    if (s < v.min_spice) continue
    if (!tierOK(o.min_tier || G.min_tier, tier)) continue
    const kinds = (o.kinds || G.kinds).filter(k => tierOK(T['ability-kinds'][k].min_tier, tier))
    if (!kinds.length) continue
    const req = o.requires || G.requires || []
    if (!req.every(g => g.some(l => l.startsWith('pattern:') ? P.pattern.includes(l.slice(8)) || l.slice(8) === p.id : has(P, l)))) continue
    const imp = o.implies || G.implies || []
    if (!imp.every(l => l.startsWith('pattern:') ? P.pattern.includes(l.slice(8)) : l.startsWith('role:') ? roleOK(l.slice(5), P, C, p.id) : has(P, l))) continue
    const exc = o.excludes || G.excludes || []
    if (!exc.every(l => avoidable(P, l))) continue
    const sw = [...(o.adds_strengths || G.adds_strengths || []), ...(o.adds_weaknesses || G.adds_weaknesses || [])].map(x => x.ref)
    if (!sw.every(l => (l.startsWith('pattern:') ? true : l.startsWith('role:') ? roleOK(l.slice(5), P, C, p.id) : has(P, l)))) continue
    out.push(v.id)
  }
  return out
}

if (process.argv[1] && process.argv[1].endsWith('feasibility.mjs')) {
  const CL = D.GEN_CLASSES, TI = D.TIERS
  // 1. Roles that no card of a class and tier can hold (spice 5, any flavour), and at spice 1 per flavour.
  console.log('ROLE x CLASS x TIER (spice 5, no flavour): impossible combinations')
  const imp5 = []
  for (const C of CL) for (const t of TI) { const P = possible(C, t, null, 5); for (const r of D.ROLES) if (!P.role.includes(r)) imp5.push(`${r}@${C}/${t}`) }
  console.log(' ', imp5.length, imp5.join(' '))
  console.log('ROLE x CLASS x TIER x FLAVOUR at spice 1: impossible (beyond the spice-5 list)')
  const imp1 = []
  for (const F of D.FLAVOURS) for (const C of CL) for (const t of TI) { const P = possible(C, t, F, 1); for (const r of D.ROLES) if (!P.role.includes(r) && !imp5.includes(`${r}@${C}/${t}`)) imp1.push(`${r}@${C}/${t}/${F}`) }
  console.log(' ', imp1.length, imp1.join(' '))
  // 2. Patterns never offered, per slot, at spice 5.
  const ever = new Set(), everSig = new Set(), everExtra = new Set()
  const sigCount = {}
  for (const C of CL) for (const t of TI) {
    const P = possible(C, t, null, 5)
    for (const p of D.patterns) {
      const v = patternOK(p, P, C, t, null, 5)
      if (!v.length) continue
      ever.add(p.id)
      if (p.generator.slot !== 'extra') { everSig.add(p.id); sigCount[`${C}/${t}`] = (sigCount[`${C}/${t}`] || 0) + 1 }
      if (p.generator.slot !== 'signature') everExtra.add(p.id)
    }
  }
  console.log('patterns offered somewhere (spice 5):', ever.size, '; never:', D.patterns.filter(p => !ever.has(p.id)).map(p => p.id).join(', ') || 'none')
  console.log('signature-capable patterns per class/tier at spice 5:', JSON.stringify(sigCount))
  // 3. Signature candidates at spice 1 per class/tier/flavour
  const s1 = {}
  for (const F of D.FLAVOURS) for (const C of CL) for (const t of TI) {
    const P = possible(C, t, F, 1)
    s1[`${C}/${t}/${F}`] = D.patterns.filter(p => p.generator.slot !== 'extra' && patternOK(p, P, C, t, F, 1).length).length
  }
  console.log('signature-capable patterns at spice 1 (min, max over class/tier/flavour):', Math.min(...Object.values(s1)), Math.max(...Object.values(s1)))
  console.log('  lowest:', Object.entries(s1).sort((a, b) => a[1] - b[1]).slice(0, 8).map(([k, v]) => k + '=' + v).join(' '))
  // 4. Variants never offered anywhere at any spice (static model)
  const vEver = new Set()
  for (const C of CL) for (const t of TI) { const P = possible(C, t, null, 5); for (const p of D.patterns) for (const v of patternOK(p, P, C, t, null, 5)) vEver.add(p.id + '/' + v) }
  const vNever = D.patterns.flatMap(p => p.variants.filter(v => !vEver.has(p.id + '/' + v.id)).map(v => p.id + '/' + v.id))
  console.log('variants never offered (static model, spice 5):', vNever.length, vNever.join(' '))
}
// Hard-rule part set (rarity ignored, as for parts that inputs, locks, implies and requires set: rule G5),
// with the flavour's avoided parts removed below their spice (rules S4 and G6).
export function hardParts(C, tier, F, s) {
  const P = possible(C, tier, null, 5)
  if (!F || s >= T['faction-flavours'][F].avoided_until_spice) return P
  const av = T['faction-flavours'][F].avoided
  const map = { 'mobility-traits': 'mobility-trait', 'armour-models': 'armour-model', 'weapon-families': 'weapon', bodies: 'body', sizes: 'size' }
  const Q = { ...P }
  for (const [vid, list] of Object.entries(av)) { const k = map[vid]; if (k) Q[k] = Q[k].filter(x => !list.includes(x)) }
  return Q
}
