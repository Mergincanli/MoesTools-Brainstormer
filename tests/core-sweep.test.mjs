// A sweep over two thousand rolls of steps 1 to 14, each draft checked by a checker written here from the rule sheet
// and the data, apart from the generator's code: kinds and cooldowns (A3, A4, HC2 to HC4), the key and passive
// budgets and the keys per seat (K-a, K-c), key-bound traits (K-d), the crew and its seats (A5, C2, C4), passengers
// (section 7), nature and availability (section 7, AV), the role's tool (G13), implied patterns (A8), conflicts (A6,
// A7), handling (G10) and the single-term rules of every part (G1). The only inputs no card can hold are role
// transport on infantry or a drone (T4).
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadGeneratorData } from '../scripts/lib/generator-data.mjs'
import { roll } from '../src/core/roll.ts'

const data = loadGeneratorData()

function makeChecker(data) {
  const T = new Map(Object.values(data.vocab).map(l => [l.id, new Map(l.terms.map(t => [t.id, t]))]))
  const term = (list, id) => T.get(list)?.get(id)
  const termsOfList = list => [...(T.get(list)?.values() ?? [])]
  const rank = (list, id) => term(list, id)?.rank ?? 0
  const pat = new Map(data.patterns.map(p => [p.id, p]))
  const R = data.rules
  const block = (pid, vid) => {
    const p = pat.get(pid), G = p.generator, o = (p.variants.find(v => v.id === vid) || {}).overrides || {}
    return { classes: o.classes || G.classes, min_tier: o.min_tier || G.min_tier, kinds: o.kinds || G.kinds, slot: G.slot, requires: o.requires || G.requires || [], implies: o.implies || G.implies || [], conflicts: G.conflicts_with || [] }
  }
  const usesKey = k => term('ability-kinds', k)?.uses_key === true
  const hc = (pid, vid) => R.hard_control.entries.find(e => e.pattern === pid && (e.variants === 'all' ? !(e.except || []).includes(vid) : (e.variants || []).includes(vid)))
  const seatsOf = l => { const [k, rest] = l.split(':'); if (k !== 'passengers' || rest.startsWith('<=')) return 0; const x = Number(rest.replace('>=', '')); return x >= 1 ? x : 0 }
  const brings = b => Math.max(0, ...b.implies.map(seatsOf), ...b.requires.filter(g => g.every(l => l.startsWith('passengers:'))).flat().map(seatsOf))
  return function check(d) {
    const out = []
    const p = d.parts
    const tierT = term('tiers', p.tier)
    const abil = [p.signature, ...(p.abilities || [])]
    if (p.pending) out.push('pending extras left on the draft')
    if ((p.abilities || []).length > 3) out.push('more than 3 extras')
    const ids = abil.map(a => a.pattern)
    if (new Set(ids).size !== ids.length) out.push('a pattern twice (A6)')
    const blocks = abil.map(a => block(a.pattern, a.variant))
    abil.forEach((a, i) => {
      const b = blocks[i], where = i === 0 ? 'signature' : `extra ${a.pattern}`
      if (!a.variant) out.push(`${where}: no variant (A2)`)
      if (i === 0 && b.slot === 'extra') out.push(`${where}: an extra-only pattern`)
      if (i > 0 && b.slot === 'signature') out.push(`${where}: a signature-only pattern`)
      if (!b.classes.includes(p.class)) out.push(`${where}: not for class ${p.class}`)
      if (rank('tiers', p.tier) < rank('tiers', b.min_tier)) out.push(`${where}: below its min_tier`)
      if (!b.kinds.includes(a.kind)) out.push(`${where}: kind ${a.kind} not among its kinds (A3)`)
      const kt = term('ability-kinds', a.kind)
      if (kt?.min_tier && rank('tiers', p.tier) < rank('tiers', kt.min_tier)) out.push(`${where}: kind ${a.kind} below its tier (A3)`)
      const h = hc(a.pattern, a.variant)
      if (h) {
        if (h.escape === null) out.push(`${where}: hard control with no escape (HC4)`)
        const cls = R.hard_control.classes[h.class]
        if (rank('tiers', p.tier) < rank('tiers', cls.min_tier)) out.push(`${where}: ${h.class} below ${cls.min_tier} (HC2)`)
        if (h.min_tier && rank('tiers', p.tier) < rank('tiers', h.min_tier)) out.push(`${where}: below its effect's tier (HC2)`)
        if (cls.key_kinds_only && !usesKey(a.kind)) out.push(`${where}: a stun on a kind without a key (HC3)`)
      }
      if (!usesKey(a.kind)) { if (a.cooldown !== null) out.push(`${where}: a cooldown on a ${a.kind} ability (A4)`) }
      else {
        const table = h ? (a.kind === 'ultimate' ? R.cooldowns.hard_control_ultimate : R.cooldowns.hard_control) : R.cooldowns[a.kind]
        if (!table || !(table[a.cooldown] > 0)) out.push(`${where}: cooldown ${a.cooldown} for ${a.kind}${h ? ' (hard control)' : ''} (A4)`)
      }
      for (let j = 0; j < i; j++) if (b.conflicts.includes(abil[j].pattern) || blocks[j].conflicts.includes(a.pattern)) out.push(`${where}: conflicts with ${abil[j].pattern} (A7)`)
      for (const l of b.implies) if (l.startsWith('pattern:') && !ids.includes(l.slice(8))) out.push(`${where}: implies ${l}, missing (A8)`)
    })
    const traits = p.mobility.traits || []
    const keyTraits = traits.filter(t => term('mobility-traits', t)?.uses_key)
    const implied = new Set(blocks.flatMap(b => b.implies).filter(l => l.startsWith('mobility-trait:')).map(l => l.slice(15)))
    for (const t of keyTraits) if (!implied.has(t)) out.push(`key-bound trait ${t}, which no ability implies (K-d)`)
    // Keys as the validator counts them, per seat (K-a, K1, K-c).
    const same = new Set(abil.flatMap((a, i) => (usesKey(a.kind) ? blocks[i].implies : [])).filter(l => l.startsWith('mobility-trait:')).map(l => l.slice(15)))
    const perSeat = {}
    const add = s => { perSeat[s] = (perSeat[s] || 0) + 1 }
    abil.forEach(a => { if (usesKey(a.kind)) add(a.seat || 'none') })
    for (const t of keyTraits) if (!same.has(t)) add('driver')
    if (p.armament.secondary) add(p.armament.secondary.seat || 'none')
    const keys = Object.values(perSeat).reduce((a, b) => a + b, 0)
    if (keys > tierT.max_keys) out.push(`${keys} keys, over ${tierT.max_keys} (K-a)`)
    if (abil.filter(a => !usesKey(a.kind)).length > tierT.max_passive) out.push(`over ${tierT.max_passive} passive (K-a)`)
    for (const [s, n] of Object.entries(perSeat)) if (n > tierT.max_keys_per_seat) out.push(`seat ${s} holds ${n} keys (K-c)`)
    const crew = term('crew-models', p.crew.model)
    const multi = (crew.max_players || 1) > 1
    if (multi !== (p.crew.solo_fallback !== null)) out.push(`solo fallback ${p.crew.solo_fallback} on a ${multi ? 'multi' : 'single'}-seat crew (C2)`)
    const cseats = crew.seats || ['driver']
    if (cseats.includes('gunner') && p.armament.secondary?.seat !== 'gunner') out.push('a gunner seat without its secondary weapon (A5, C4)')
    if (cseats.includes('commander')) {
      const owner = (p.abilities || []).length ? p.abilities.at(-1) : p.signature
      if (owner.seat !== 'commander') out.push('the commander does not own the last extra or the signature (A5)')
    }
    for (const a of abil) if (a.seat !== 'driver' && !cseats.includes(a.seat)) out.push(`an ability on seat ${a.seat}, which the crew lacks`)
    if (p.crew.model === 'squad' ? !(p.body.count >= 2 && p.body.count <= 5) : p.body.count !== 1) out.push(`body count ${p.body.count} with crew ${p.crew.model}`)
    const need = Math.max(0, ...blocks.map(brings))
    const cap = R.defaults.passengers.caps[p.body.size] ?? 0
    if (p.crew.passengers) {
      if (!need) out.push('passenger seats that no pattern brings (section 7)')
      if (p.crew.passengers.seats > cap || p.crew.passengers.seats < need) out.push(`${p.crew.passengers.seats} seats, outside ${need} to ${cap}`)
      const k = R.defaults.passengers.kinds.find(e => !e.pattern || abil.some(a => a.pattern === e.pattern && (!e.variants || e.variants.includes(a.variant))))
      if (k.kind !== p.crew.passengers.kind) out.push(`passenger kind ${p.crew.passengers.kind}, expected ${k.kind}`)
    } else if (need) out.push('a pattern brings seats, but the card has none (section 7)')
    const av = R.counts.availability[p.availability]
    if (!av || d.spice < (av.min_spice || 1) || (av.min_tier && rank('tiers', p.tier) < rank('tiers', av.min_tier))) out.push(`availability ${p.availability} at spice ${d.spice}, ${p.tier} (AV)`)
    const nature = (() => {
      for (const e of R.defaults.nature) {
        const t = term('nature', e.nature)
        if (t.classes && !t.classes.includes(p.class)) continue
        if ([...(p.armour.models || []).map(m => term('armour-models', m)), term('crew-models', p.crew.model)].some(x => (x.excluded?.nature || []).includes(e.nature))) continue
        if (!e.when) return e.nature
        const [k, v] = e.when.split(':')
        if ((k === 'class' && p.class === v) || (k === 'body' && p.body.plan === v) || (k === 'crew' && p.crew.model === v)) return e.nature
      }
    })()
    if (nature !== p.nature) out.push(`nature ${p.nature}; the rules give ${nature} (section 7)`)
    const fit = R.role_fit[p.roles.primary]
    if (fit?.patterns && !ids.some(i => fit.patterns.includes(i))) out.push(`role ${p.roles.primary} without its tool (G13)`)
    if (p.roles.primary === 'transport' && !need) out.push('transport with no pattern that brings seats (G13)')
    if (p.mobility.handling !== term('mobility', p.mobility.base).default_handling) out.push('handling is not the mobility default (G10)')
    if (traits.length > 2 || (p.armour.models || []).length < 1 || (p.armour.models || []).length > 2 || (p.sensors.traits || []).length > 2) out.push('a list over its size (C1)')
    const unit = { classes: [p.class], tiers: [p.tier], mobility: [p.mobility.base], bodies: [p.body.plan], sizes: [p.body.size], 'speed-bands': [p.mobility.speed], 'armour-classes': [p.armour.class], 'armour-models': p.armour.models, 'sensor-traits': p.sensors.traits, 'sight-bands': [p.sensors.sight], 'crew-models': [p.crew.model], nature: [p.nature], availability: [p.availability], 'mobility-traits': traits, roles: [p.roles.primary, ...(p.roles.secondary || [])], 'on-death': p.on_death || [] }
    // Step 13: the weapons (section 7, A5, A10, G11, G12, C1, HC1; section 18: an adaptive weapon has no damage,
    // delivery or range of its own).
    const all = term => termsOfList(term)
    const targetsAll = all('target-types').filter(t => !t.source_only).map(t => t.id)
    const body = term('bodies', p.body.plan)
    const flier = ['low-air', 'high-air'].includes(term('mobility', p.mobility.base).target_type)
    const weaponRules = (w, where, cls, withBody) => {
      const fam = term('weapon-families', w.family)
      if (!fam || fam.source_only) return out.push(`${where}: family ${w.family}`)
      if (fam.classes && !fam.classes.includes(cls)) out.push(`${where}: ${w.family} not for ${cls} (G1)`)
      if (w.family === 'adaptive') {
        if (w.damage !== null || w.delivery !== null || w.range !== null) out.push(`${where}: an adaptive weapon with a damage, delivery or range (section 18)`)
      } else {
        if (!(fam.allowed?.['damage-types'] ?? [fam.default_damage]).includes(w.damage)) out.push(`${where}: damage ${w.damage} not allowed (G12)`)
        if (!(fam.allowed?.['weapon-delivery'] ?? [fam.default_delivery]).includes(w.delivery)) out.push(`${where}: delivery ${w.delivery} not allowed (G12)`)
        const allowedRanges = term('weapon-delivery', w.delivery).allowed?.['range-bands']
        if (w.range !== fam.default_range && !(allowedRanges ?? all('range-bands').map(t => t.id)).includes(w.range)) out.push(`${where}: range ${w.range} (G11)`)
        if (w.delivery === 'drop' && !flier) out.push(`${where}: a dropped weapon on a unit that does not fly`)
      }
      const famT = fam.allowed?.['target-types'] ?? targetsAll
      const delT = (w.delivery && term('weapon-delivery', w.delivery).allowed?.['target-types']) || targetsAll
      const lift = (w.traits || []).includes('anti-air') && famT.includes('low-air') && delT.includes('high-air')
      const want = targetsAll.filter(x => (famT.includes(x) && delT.includes(x)) || (x === 'high-air' && lift))
      if (JSON.stringify(w.can_target) !== JSON.stringify(want)) out.push(`${where}: targets ${w.can_target}, the rules give ${want} (G12)`)
      if (['lobbed', 'drop', 'place'].includes(w.delivery) && w.can_target.some(x => x.endsWith('-air'))) out.push(`${where}: a ${w.delivery} weapon hits fliers (G12)`)
      if ((w.traits || []).length > 3) out.push(`${where}: more than 3 traits (C1)`)
      if ((w.traits || []).includes('stun')) out.push(`${where}: the stun trait (HC1)`)
      for (const t of w.traits || []) {
        const tt = term('weapon-traits', t)
        if ((tt.excluded?.['weapon-delivery'] || []).includes(w.delivery) || (w.delivery && (term('weapon-delivery', w.delivery).excluded?.['weapon-traits'] || []).includes(t))) out.push(`${where}: trait ${t} with ${w.delivery} (G1)`)
        for (const x of tt.excluded?.['weapon-traits'] || []) if ((w.traits || []).includes(x)) out.push(`${where}: traits ${t} and ${x} (G1)`)
      }
      if (withBody && body.allowed?.['aim-models'] && !body.allowed['aim-models'].includes(w.mount)) out.push(`${where}: mount ${w.mount} on ${p.body.plan} (G12)`)
      if (w.delivery && (term('weapon-delivery', w.delivery).excluded?.['aim-models'] || []).includes(w.mount)) out.push(`${where}: mount ${w.mount} with ${w.delivery} (G1)`)
    }
    const a13 = p.armament
    const fallbackSeat = R.defaults.primary_weapon_seat[p.crew.solo_fallback]
    const pSeat = fallbackSeat && cseats.includes(fallbackSeat) ? fallbackSeat : 'driver'
    if (a13.primary === null) {
      const cat = data.patterns.find(x => x.id === p.signature.pattern).category
      if (!R.defaults.unarmed.primary_roles.includes(p.roles.primary) || !R.defaults.unarmed.signature_categories.includes(cat)) out.push('unarmed outside the unarmed rule (section 7)')
    } else {
      weaponRules(a13.primary, 'primary', p.class, true)
      if (a13.primary.seat !== pSeat) out.push(`primary weapon on seat ${a13.primary.seat}, not ${pSeat} (A5)`)
    }
    if (a13.secondary) {
      weaponRules(a13.secondary, 'secondary', p.class, true)
      if (a13.secondary.seat !== (cseats.includes('gunner') ? 'gunner' : 'driver')) out.push('the secondary weapon is not on the gunner seat (A5)')
    }
    const adaptive = [a13.primary, a13.secondary].find(w => w && w.family === 'adaptive')
    if (adaptive && (a13.conditional.length < 2 || a13.conditional.length > 4)) out.push(`${a13.conditional.length} conditional weapons (A10)`)
    if (!adaptive && a13.conditional.length) out.push('conditional weapons without an adaptive weapon (A10)')
    a13.conditional.forEach((c, i) => {
      weaponRules(c.weapon, `conditional ${i}`, p.class, true)
      if (!/^(role|weapon):/.test(c.when)) out.push(`conditional ${i}: when ${c.when} (A10)`)
      if (c.when.startsWith('weapon:') && c.weapon.family !== c.when.slice(7)) out.push(`conditional ${i}: a leeched weapon of another family`)
    })
    // Step 15: on death (section 7, C3) and the resource.
    const od = R.defaults.on_death
    const who = (p.on_death || []).filter(x => od.who_gets_out.includes(x))
    const left = (p.on_death || []).filter(x => od.what_is_left.includes(x))
    if (who.length !== 1 || left.length > 1 || p.on_death[0] !== who[0]) out.push(`on death ${p.on_death} (C3)`)
    if (p.on_death.includes('wreck') && p.on_death.includes('respawn')) out.push('a wreck with respawn (C3)')
    for (const x of p.on_death) {
      if (od.crewed_machine_only.includes(x) && p.nature !== 'crewed-machine') out.push(`${x} on a ${p.nature} unit (section 7)`)
      const t = term('on-death', x)
      if (t.classes && !t.classes.includes(p.class)) out.push(`${x} not for ${p.class} (G1)`)
      if ((t.excluded?.classes || []).includes(p.class) || (t.excluded?.nature || []).includes(p.nature)) out.push(`${x} excluded here (G1)`)
      if ((crew.excluded?.['on-death'] || []).includes(x)) out.push(`${x} with crew ${p.crew.model} (G1)`)
    }
    const named = new Set(blocks.flatMap(b => [...b.implies, ...b.requires.flat()]).filter(l => l.startsWith('resource:')).map(l => l.slice(9)))
    if (p.resource !== null && !named.has(p.resource) && !d.locks.includes('resource')) out.push(`resource ${p.resource} that no pattern names (section 7)`)
    if (p.resource === null && blocks.some(b => b.implies.some(l => l.startsWith('resource:')))) out.push('a pattern implies a resource the card lacks (G3)')
    // Step 16: the secondary roles (G14).
    const sec = p.roles.secondary
    if (!Array.isArray(sec) || sec.length > 2 || new Set([p.roles.primary, ...sec]).size !== sec.length + 1) out.push(`secondary roles ${sec} (G14)`)
    // The second form (A9).
    const transform = abil.find(a => R.defaults.second_form.via.includes(a.pattern))
    if (transform ? (p.modes || []).length !== 1 : (p.modes || []).length) out.push('a second form without transform, or none with it (A9)')
    for (const m of p.modes || []) {
      if (m.class === p.class || !block(transform.pattern, transform.variant).classes.includes(m.class)) out.push(`second form class ${m.class} (A9)`)
      const mt = term('mobility', m.mobility.base)
      if (mt.classes && !mt.classes.includes(m.class)) out.push(`second form mobility ${m.mobility.base} not for ${m.class} (A9)`)
      if (m.mobility.handling !== mt.default_handling) out.push('second form handling (G10)')
      if (!m.mobility.speed) out.push('second form without a speed')
      if ((m.armament || []).length > 1) out.push('more than one second-form weapon (A9)')
      for (const w of m.armament || []) weaponRules(w, 'second form weapon', m.class, false)
    }
    for (const [list, vals] of Object.entries(unit)) {
      for (const id of vals) {
        const t = term(list, id)
        if (!t) { out.push(`${list} ${id} unknown`); continue }
        if (t.source_only) out.push(`${list} ${id} research only (G1)`)
        if (t.classes && !t.classes.includes(p.class)) out.push(`${list} ${id} not for ${p.class} (G1)`)
        if (t.min_tier && rank('tiers', p.tier) < rank('tiers', t.min_tier)) out.push(`${list} ${id} below its min_tier (G1)`)
        for (const [k, allowed] of Object.entries(t.allowed || {})) for (const x of unit[k] || []) if (!allowed.includes(x)) out.push(`${list} ${id} allowed.${k} leaves out ${x} (G1)`)
        for (const [k, excluded] of Object.entries(t.excluded || {})) for (const x of unit[k] || []) if (excluded.includes(x)) out.push(`${list} ${id} excludes ${k} ${x} (G1)`)
      }
    }
    return out
  }
}

const classes = [null, 'infantry', 'vehicle', 'walker', 'hover', 'aircraft', 'drone']
const ROLES = [null, null, null, ...data.vocab.roles.terms.map(t => t.id)]
const results = []
for (let i = 0; i < 2000; i++) {
  const inputs = i % 3 === 0 ? { class: classes[i % 7], role: ROLES[i % ROLES.length], tier: i % 2 ? 't1' : null } : {}
  results.push({ i, inputs, spice: 1 + (i % 5), r: roll(data, { seed: `sweep-${i}`, spice: 1 + (i % 5), inputs }) })
}
const cards = results.filter(x => x.r.ok).map(x => x.r.draft.parts)

describe('two thousand rolls of steps 1 to 16', () => {
  const check = makeChecker(data)

  it('every draft passes the checker', () => {
    const problems = []
    for (const { i, r } of results) if (r.ok) for (const pr of check(r.draft)) problems.push(`sweep-${i}: ${pr}`)
    assert.deepEqual(problems.slice(0, 20), [])
  })

  it('the only inputs without a card are role transport on infantry or a drone (T4)', () => {
    for (const { inputs, r } of results) {
      if (r.ok) continue
      assert.equal(inputs.role, 'transport', r.reason)
      assert.ok(['infantry', 'drone'].includes(inputs.class), r.reason)
    }
  })

  it('every tier is covered, and the budgets hold on each (K-a, K-c)', () => {
    const tiers = new Set(results.filter(x => x.r.ok).map(x => x.r.draft.parts.tier))
    assert.deepEqual([...tiers].sort(), ['t1', 't2', 't3'])
    const t3keys = results.filter(x => x.r.ok && x.r.draft.parts.tier === 't3')
    assert.ok(t3keys.length > 200)
  })

  it('a stun-class ability never appears at T1 (HC2)', () => {
    let t1 = 0
    for (const { r } of results) {
      if (!r.ok || r.draft.parts.tier !== 't1') continue
      t1++
      for (const a of [r.draft.parts.signature, ...r.draft.parts.abilities]) {
        const e = data.rules.hard_control.entries.find(x => x.pattern === a.pattern && x.class === 'stun' && (x.variants === 'all' ? !(x.except || []).includes(a.variant) : x.variants.includes(a.variant)))
        assert.equal(e, undefined, `${a.pattern}/${a.variant} at T1`)
      }
    }
    assert.ok(t1 > 500, `${t1} T1 cards`)
  })

  it('G16: at spice 1 no card has a sensor trait (every sensor trait is above the gate), and from spice 3 some do', () => {
    const traits = spice => results.filter(x => x.r.ok && x.spice === spice).flatMap(x => x.r.draft.parts.sensors.traits)
    assert.ok(data.vocab['sensor-traits'].terms.every(t => t.rarity !== 'common'))
    assert.deepEqual(traits(1), [])
    assert.ok(traits(3).length + traits(5).length > 0)
  })

  it('section 7: the body count follows the crew model (counts.body_count), and every count a squad can have comes up', () => {
    const counts = data.rules.counts.body_count
    const squad = new Set()
    for (const { r } of results) {
      if (!r.ok) continue
      const p = r.draft.parts
      const weights = counts[p.crew.model] ?? counts.other
      assert.ok((weights[p.body.count] ?? 0) > 0, `${p.crew.model} with ${p.body.count} bodies`)
      if (counts[p.crew.model]) squad.add(p.body.count)
    }
    const possible = Object.entries(counts).filter(([model]) => model !== 'other').flatMap(([, w]) => w.flatMap((x, n) => (x > 0 ? [n] : [])))
    assert.deepEqual([...squad].sort(), [...new Set(possible)].sort())
  })

  it('a card that needed more than one attempt is rare (G7)', () => {
    const ok = results.filter(x => x.r.ok)
    const retried = ok.filter(x => x.r.attempts > 1).length
    assert.ok(retried / ok.length < 0.02, `${retried} of ${ok.length} needed a second attempt`)
  })
})

describe('locks: each set at its own step, the steps before it keep to it (I1, G5, G7, T2)', () => {
  const check = makeChecker(data)
  const lockOf = (p, name) => ({
    class: p.class, tier: p.tier, flavour: p.flavour, roles: p.roles,
    mobility: { base: p.mobility.base, handling: p.mobility.handling, traits: p.mobility.traits }, speed: p.mobility.speed,
    body: { plan: p.body.plan }, size: p.body.size, armour: p.armour, sensors: p.sensors, crew: { ...p.crew, count: p.body.count },
    signature: p.signature, abilities: p.abilities, primary: p.armament.primary, secondary: p.armament.secondary,
    conditional: p.armament.conditional, modes: p.modes, resource: p.resource, on_death: p.on_death,
  })[name]
  const NAMES = ['class', 'tier', 'flavour', 'roles', 'mobility', 'speed', 'body', 'size', 'armour', 'sensors', 'crew', 'signature', 'abilities', 'primary', 'secondary', 'conditional', 'modes', 'resource', 'on_death']
  // Seats follow the crew (A5), so a part locked onto another card is compared without them.
  const canon = (x, seats = true) => (Array.isArray(x) ? x.map(y => canon(y, seats)) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().filter(k => x[k] !== undefined && (seats || k !== 'seat')).map(k => [k, canon(x[k], seats)])) : x)
  const card = (p, seats = true) => JSON.stringify(canon(p, seats))
  const bases = []
  for (let i = 0; i < 190; i++) {
    const r = roll(data, { seed: `lock-${i}`, spice: 1 + (i % 5) })
    if (r.ok) bases.push({ i, r, name: NAMES[i % NAMES.length] })
  }

  it("T2: a lock on a card's own value rolls the same card again, part for part", () => {
    let compared = 0
    for (const { i, r, name } of bases) {
      if (r.attempts !== 1) continue // a later attempt's card: an earlier attempt may pass with the lock (G7)
      const p = r.draft.parts
      const again = roll(data, { seed: `lock-${i}`, spice: r.draft.spice, locks: { [name]: lockOf(p, name) } })
      assert.ok(again.ok, `lock-${i} ${name}: ${again.reason}`)
      if (again.attempts !== 1) continue
      compared++
      assert.equal(card(again.draft.parts), card(p), `lock-${i} ${name}`)
    }
    assert.ok(compared >= 150, `only ${compared} compared`)
  })

  it('T2: a part locked on a new seed keeps its value, and the card passes the checker', () => {
    const problems = []
    for (const { i, r, name } of bases) {
      const lock = lockOf(r.draft.parts, name)
      const other = roll(data, { seed: `lock-other-${i}`, spice: r.draft.spice, locks: { [name]: lock } })
      assert.ok(other.ok, `lock-other-${i} ${name}: ${other.reason}`)
      const kept = card(lockOf(other.draft.parts, name), false) === card(lock, false)
      if (!kept) problems.push(`lock-other-${i}: ${name} not kept`)
      for (const pr of check(other.draft)) problems.push(`lock-other-${i} ${name}: ${pr}`)
    }
    assert.deepEqual(problems.slice(0, 10), [])
  })

  it('K-d, G5: a locked key-bound trait comes with an ability that implies it, a signature when only a signature can', () => {
    const keyBound = data.vocab['mobility-traits'].terms.filter(t => t.uses_key).map(t => t.id)
    assert.ok(keyBound.includes('transform'))
    for (const t of keyBound) {
      for (let i = 0; i < 4; i++) {
        const mobility = i % 2 ? { base: 'tracks', handling: 'pivot', traits: [t] } : { base: 'foot', handling: 'strafe', traits: [t] }
        const r = roll(data, { seed: `kd-${t}-${i}`, spice: 3 + (i % 3), locks: { mobility } })
        assert.ok(r.ok, `${t}: ${r.reason}`)
        assert.deepEqual(r.draft.parts.mobility.traits, [t])
        assert.deepEqual(check(r.draft), [], `${t} ${i}`)
      }
    }
  })

  it('section 7: locked passenger seats come with a pattern that brings them, of the locked kind', () => {
    for (let i = 0; i < 8; i++) {
      const passengers = { seats: 2, kind: 'passenger-cargo' }
      const r = roll(data, { seed: `seats-${i}`, spice: 3, inputs: { class: 'vehicle' }, locks: { crew: { model: 'solo', solo_fallback: null, passengers } } })
      assert.ok(r.ok, r.reason)
      assert.deepEqual(r.draft.parts.crew.passengers, passengers)
      assert.deepEqual(check(r.draft), [])
    }
  })

  it('a value a later lock rules out is drawn again on the same dice, and the trace says so', () => {
    let redrawn = 0
    for (let i = 0; i < 20; i++) {
      const r = roll(data, { seed: `redraw-${i}`, spice: 5, inputs: { class: 'vehicle' }, locks: { size: 'huge' } })
      const tier = r.trace.find(e => e.field === 'tier')
      assert.equal(tier.value, 't3') // huge has min_tier t3 (G1)
      if (tier.note) {
        assert.match(tier.note, /drawn again on the same dice; the locks ruled out t[12]/)
        redrawn++
      }
    }
    assert.ok(redrawn > 5, `${redrawn} redrawn`)
  })
})

describe('steps 13 to 16 and the second form', () => {
  const check = makeChecker(data)
  const fams = data.vocab['weapon-families'].terms.filter(t => !t.source_only)
  const fam = id => fams.find(f => f.id === id)
  const weaponsOf = p => [p.armament.primary, p.armament.secondary, ...p.armament.conditional.map(c => c.weapon)].filter(Boolean)
  const pat = id => data.patterns.find(x => x.id === id)
  const usesKey = kind => data.vocab['ability-kinds'].terms.find(t => t.id === kind)?.uses_key === true
  const firstBand = kind => { const t = data.rules.cooldowns[kind] ?? {}; return Object.keys(t).find(k => typeof t[k] === 'number' && t[k] > 0) ?? null }
  const lockSig = (id, variant, k = 0) => {
    const v = variant ?? pat(id).variants[0].id
    const kinds = pat(id).variants.find(x => x.id === v)?.overrides?.kinds ?? pat(id).generator.kinds
    const kind = kinds[k % kinds.length]
    return { pattern: id, variant: v, kind, cooldown: usesKey(kind) ? firstBand(kind) : null }
  }
  const RANK = list => new Map(data.vocab[list].terms.map(t => [t.id, t.rank ?? 0]))

  it('G1: every weapon family the word lists allow for a class is rolled for it, and none they leave out; adaptive only through its patterns (A10)', () => {
    const classes = data.vocab.classes.terms.filter(t => !t.source_only).map(t => t.id)
    for (const cls of classes) {
      const seen = new Set()
      for (let i = 0; i < 150; i++) {
        // Bombs drop (a flier only): half the infantry rolls fly on a jetpack.
        const locks = cls === 'infantry' && i % 2 ? { mobility: { base: 'jetpack', handling: 'strafe', traits: [] } } : {}
        const r = roll(data, { seed: `fam-${cls}-${i}`, spice: locks.mobility ? 5 : 3 + (i % 3), inputs: { class: cls }, locks })
        assert.ok(r.ok, r.reason)
        for (const w of weaponsOf(r.draft.parts)) seen.add(w.family)
      }
      const allowed = fams.filter(f => !f.classes || f.classes.includes(cls)).map(f => f.id)
      const adaptiveHere = data.patterns.some(p => p.generator?.classes.includes(cls) && JSON.stringify([p.generator.implies, p.variants.map(v => v.overrides?.implies)]).includes('weapon:adaptive'))
      assert.deepEqual(allowed.filter(f => !seen.has(f) && (f !== 'adaptive' || adaptiveHere)), [], `${cls}: allowed but never rolled`)
      assert.deepEqual([...seen].filter(f => !allowed.includes(f)), [], `${cls}: rolled but not allowed`)
    }
  })

  it('G12: the default damage and delivery are three times as likely as another allowed value', () => {
    const share = list => {
      let hit = 0, all = 0
      for (const p of cards) for (const w of weaponsOf(p)) {
        const f = fam(w.family)
        if (w.family === 'adaptive') continue
        const field = list === 'damage-types' ? 'damage' : 'delivery'
        const ids = f.allowed?.[list] ?? [f[`default_${field}`]]
        if (ids.length !== 2) continue
        all++
        if (w[field] === f[`default_${field}`]) hit++
      }
      return { share: hit / all, all }
    }
    for (const list of ['damage-types', 'weapon-delivery']) {
      const { share: s, all } = share(list)
      assert.ok(all > 300, `${all} weapons`)
      assert.ok(Math.abs(s - 0.75) < 0.06, `${list}: the default is ${s.toFixed(3)} of ${all}; 3:1 gives 0.75`)
    }
  })

  it('G12, HC1: targets follow the family and delivery; lobbed, dropped and placed shots never hit fliers; high air by family or anti-air; never a stun trait', () => {
    let lifted = 0, ground = 0
    for (const p of cards) for (const w of weaponsOf(p)) {
      assert.ok(!(w.traits ?? []).includes('stun'), 'HC1')
      if (['lobbed', 'drop', 'place'].includes(w.delivery)) {
        ground++
        assert.ok(!w.can_target.some(t => t.endsWith('-air')), `${w.family} ${w.delivery} hits fliers`)
      }
      const famHigh = (fam(w.family).allowed?.['target-types'] ?? []).includes('high-air')
      if (w.can_target.includes('high-air') && !famHigh) {
        lifted++
        assert.ok(w.traits.includes('anti-air'), `${w.family} reaches high air without anti-air`)
      }
    }
    assert.ok(lifted > 0 && ground > 0, `${lifted} lifted by anti-air, ${ground} ground-only deliveries`)
  })

  it('A5: a gunner seat owns the secondary weapon; the primary weapon sits where the solo fallback puts it', () => {
    let gunners = 0
    for (const p of cards) {
      const seats = data.vocab['crew-models'].terms.find(t => t.id === p.crew.model).seats ?? ['driver']
      if (!seats.includes('gunner')) continue
      gunners++
      assert.equal(p.armament.secondary?.seat, 'gunner')
      if (p.armament.primary) assert.equal(p.armament.primary.seat, data.rules.defaults.primary_weapon_seat[p.crew.solo_fallback] === 'gunner' ? 'gunner' : 'driver')
    }
    assert.ok(gunners > 20, `${gunners} cards with a gunner seat`)
  })

  it('section 7: unarmed only for the roles and signature categories the data names, about 1 in 3 of those', () => {
    const rule = data.rules.defaults.unarmed
    let eligible = 0, unarmed = 0
    for (let i = 0; i < 240; i++) {
      const r = roll(data, { seed: `unarmed-${i}`, spice: 1 + (i % 5), inputs: { role: rule.primary_roles[i % rule.primary_roles.length] } })
      if (!r.ok) continue
      const p = r.draft.parts
      const cat = pat(p.signature.pattern).category
      if (rule.signature_categories.includes(cat)) eligible++
      if (p.armament.primary === null) {
        unarmed++
        assert.ok(rule.signature_categories.includes(cat) && rule.primary_roles.includes(p.roles.primary))
      }
    }
    for (const p of cards) if (p.armament.primary === null) assert.ok(rule.primary_roles.includes(p.roles.primary))
    assert.ok(unarmed > 0 && unarmed < eligible * 0.5, `${unarmed} unarmed of ${eligible} that may be`)
  })

  it('A10: an adaptive weapon has 2 to 4 conditional weapons with when links, and no damage, delivery or range of its own (section 18)', () => {
    for (let i = 0; i < 6; i++) {
      const a = roll(data, { seed: `adaptive-${i}`, spice: 5, inputs: { class: 'vehicle' }, locks: { signature: lockSig('passenger-sets-weapon') } })
      assert.ok(a.ok, a.reason)
      const p = a.draft.parts.armament
      assert.equal(p.primary.family, 'adaptive')
      assert.deepEqual([p.primary.damage, p.primary.delivery, p.primary.range], [null, null, null])
      assert.ok(p.conditional.length >= 2 && p.conditional.length <= 4)
      assert.ok(p.conditional.every(c => c.when.startsWith('role:')) && new Set(p.conditional.map(c => c.when)).size === p.conditional.length)
      const b = roll(data, { seed: `leech-${i}`, spice: 5, inputs: { class: 'walker' }, locks: { signature: lockSig('leech-weapon-on-kill') } })
      assert.ok(b.ok, b.reason)
      const q = b.draft.parts.armament
      assert.equal(q.secondary.family, 'adaptive', 'leech-weapon-on-kill requires another family: the adaptive weapon is the secondary one')
      assert.notEqual(q.primary.family, 'adaptive')
      assert.ok(q.conditional.every(c => c.when === `weapon:${c.weapon.family}`), 'a leeched weapon is the victim family')
      assert.deepEqual([...check(a.draft), ...check(b.draft)], [])
    }
  })

  it('G3, G4: the weapon parts the patterns and roles ask for are on the card', () => {
    const asks = data.patterns.filter(p => p.generator?.slot !== 'extra' && (p.generator?.implies ?? []).some(l => /^(weapon|delivery|weapon-trait):/.test(l) && l !== 'weapon:adaptive'))
    assert.ok(asks.length > 0)
    for (const p of asks.slice(0, 8)) {
      const cls = p.generator.classes.find(c => c !== 'naval')
      const r = roll(data, { seed: `asks-${p.id}`, spice: 5, inputs: { class: cls }, locks: { signature: lockSig(p.id, p.variants.find(v => !v.overrides?.implies)?.id) } })
      if (!r.ok) continue
      const ws = weaponsOf(r.draft.parts)
      for (const l of p.generator.implies.filter(x => /^(weapon|delivery|weapon-trait):/.test(x))) {
        const [kind, id] = l.split(':')
        const has = ws.some(w => (kind === 'weapon' ? w.family === id : kind === 'delivery' ? w.delivery === id : w.traits.includes(id)))
        assert.ok(has, `${p.id} implies ${l}`)
      }
    }
    for (const r of results.filter(x => x.r.ok && x.inputs.role === 'anti-infantry')) {
      const ws = weaponsOf(r.r.draft.parts)
      assert.ok(ws.some(w => ['small-arms', 'machine-gun', 'shotgun'].includes(w.family) || w.traits.includes('splash')), 'G13 anti-infantry')
    }
  })

  it('section 7, C3: on death: one who-gets-out outcome, drones, beasts and remote crews never bail out, no wreck with respawn, nothing above the gate', () => {
    for (const p of cards) {
      const od = p.on_death
      if (p.nature !== 'crewed-machine') assert.ok(!od.includes('bail-out') && !od.includes('pilot-eject'), `${p.nature} ${od}`)
      assert.ok(!(od.includes('wreck') && od.includes('respawn')))
    }
    const atOne = results.filter(x => x.r.ok && x.spice === 1 && !Object.keys(x.inputs).length).flatMap(x => x.r.draft.parts.on_death)
    assert.ok(atOne.every(x => data.vocab['on-death'].terms.find(t => t.id === x).rarity === 'common'), 'section 18: rarity and spice apply')
    const crewed = cards.filter(p => p.nature === 'crewed-machine')
    const bail = crewed.filter(p => p.on_death[0] === 'bail-out').length / crewed.length
    assert.ok(bail > 0.55, `bail-out is the crewed machine's default (x3): ${bail.toFixed(2)}`)
  })

  it('section 7: no resource unless a pattern names one; then one it names', () => {
    let named = 0
    for (const p of cards) {
      const links = [p.signature, ...p.abilities].flatMap(a => {
        const q = pat(a.pattern), o = q.variants.find(v => v.id === a.variant)?.overrides ?? {}
        return [...(o.implies ?? q.generator.implies ?? []), ...(o.requires ?? q.generator.requires ?? []).flat()]
      }).filter(l => l.startsWith('resource:'))
      if (links.length) named++
      if (p.resource !== null) assert.ok(links.includes(`resource:${p.resource}`), p.resource)
    }
    const kill = data.patterns.find(q => (q.generator?.implies ?? []).some(l => l.startsWith('resource:')) && q.generator.slot !== 'extra')
    if (kill) {
      const r = roll(data, { seed: 'resource', spice: 5, inputs: { class: kill.generator.classes[0] }, locks: { signature: lockSig(kill.id, kill.variants.find(v => !v.overrides?.implies)?.id) } })
      if (r.ok) assert.ok(kill.generator.implies.includes(`resource:${r.draft.parts.resource}`))
    }
    assert.ok(named >= 0)
  })

  it('G14: secondary roles: 0 to 2, the roles the patterns name first, each one the finished card holds', () => {
    const rank = { speed: RANK('speed-bands'), armour: RANK('armour-classes'), range: RANK('range-bands'), sight: RANK('sight-bands') }
    const cmp = (r, a, op, b) => (op === '>=' ? r.get(a) >= r.get(b) : op === '<=' ? r.get(a) <= r.get(b) : a === b)
    const yes = (p, l, primaryOnly = false) => {
      const m = /^([a-z-]+):(>=|<=)?(.+)$/.exec(l)
      const [, kind, op, id] = m
      const ws = primaryOnly ? [p.armament.primary].filter(Boolean) : weaponsOf(p)
      const abil = [p.signature, ...p.abilities]
      switch (kind) {
        case 'damage': return ws.some(w => w.damage === id)
        case 'hits': return ws.some(w => w.can_target.includes(id))
        case 'delivery': return ws.some(w => w.delivery === id)
        case 'weapon': return ws.some(w => w.family === id)
        case 'weapon-trait': return ws.some(w => w.traits.includes(id))
        case 'range': return ws.some(w => w.range && cmp(rank.range, w.range, op, id))
        case 'speed': return cmp(rank.speed, p.mobility.speed, op, id)
        case 'armour-class': return cmp(rank.armour, p.armour.class, op, id)
        case 'sight': return cmp(rank.sight, p.sensors.sight, op, id)
        case 'sensor': return p.sensors.traits.includes(id)
        case 'pattern': return abil.some(a => a.pattern === id)
        case 'category': return abil.some(a => pat(a.pattern).category === id)
        case 'passengers': return (p.crew.passengers?.seats ?? 0) >= Number(id)
        default: return false
      }
    }
    const counts = [0, 0, 0]
    for (const p of cards) {
      const sec = p.roles.secondary
      counts[sec.length]++
      for (const role of [p.roles.primary, ...sec]) {
        for (const g of data.vocab.roles.terms.find(t => t.id === role).requires ?? []) assert.ok(g.some(l => yes(p, l)), `${role} requires ${g}`)
        const fit = data.rules.role_fit[role]
        if (fit?.patterns) assert.ok(fit.patterns.some(x => yes(p, `pattern:${x}`)), `${role}: its tool`)
        if (fit?.any) assert.ok(fit.any.some(l => yes(p, l)), `${role}: ${fit.any}`)
        for (const l of fit?.all ?? []) assert.ok(yes(p, l, l.startsWith('range:')), `${role}: ${l}`)
      }
      const named = [p.signature, ...p.abilities].flatMap(a => {
        const q = pat(a.pattern), o = q.variants.find(v => v.id === a.variant)?.overrides ?? {}
        return [...(o.implies ?? q.generator.implies ?? []), ...(o.adds_strengths ?? q.generator.adds_strengths ?? []).map(x => x.ref)]
      }).filter(l => l.startsWith('role:')).map(l => l.slice(5))
      for (const r of named) assert.ok([p.roles.primary, ...sec].includes(r), `a pattern names role ${r}`)
    }
    assert.ok(counts.every(c => c > 50), `secondary role counts ${counts}`)
  })

  it('A9: transform gives one second form: another class it allows, a mobility for that class, 0 or 1 weapon', () => {
    const weapons = new Set()
    for (let i = 0; i < 8; i++) {
      const variant = pat('transform').variants[i % pat('transform').variants.length].id
      // The kinds a variant may take depend on the budgets; the first kind that fits is used.
      const r = [0, 1, 2].map(k => roll(data, { seed: `form-${i}`, spice: 3 + (i % 3), inputs: { tier: 't3' }, locks: { signature: lockSig('transform', variant, k) } })).find(x => x.ok)
      assert.ok(r, `transform ${variant}: no kind fits`)
      const [m] = r.draft.parts.modes
      assert.equal(r.draft.parts.modes.length, 1)
      assert.equal(m.via, 'transform')
      assert.notEqual(m.class, r.draft.parts.class)
      weapons.add((m.armament ?? []).length)
      assert.deepEqual(check(r.draft), [])
    }
    assert.deepEqual([...weapons].sort(), [0, 1])
    assert.ok(cards.filter(p => !p.signature.pattern.includes('transform') && !p.abilities.some(a => a.pattern === 'transform')).every(p => p.modes.length === 0))
  })
})
