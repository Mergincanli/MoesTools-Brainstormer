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
    const unit = { classes: [p.class], tiers: [p.tier], mobility: [p.mobility.base], bodies: [p.body.plan], sizes: [p.body.size], 'speed-bands': [p.mobility.speed], 'armour-classes': [p.armour.class], 'armour-models': p.armour.models, 'sensor-traits': p.sensors.traits, 'sight-bands': [p.sensors.sight], 'crew-models': [p.crew.model], nature: [p.nature], availability: [p.availability], 'mobility-traits': traits, roles: [p.roles.primary] }
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

describe('two thousand rolls of steps 1 to 14', () => {
  const check = makeChecker(data)
  const classes = [null, 'infantry', 'vehicle', 'walker', 'hover', 'aircraft', 'drone']
  const roles = [null, null, null, ...data.vocab.roles.terms.map(t => t.id)]
  const results = []
  for (let i = 0; i < 2000; i++) {
    const inputs = i % 3 === 0 ? { class: classes[i % 7], role: roles[i % roles.length], tier: i % 2 ? 't1' : null } : {}
    results.push({ i, inputs, spice: 1 + (i % 5), r: roll(data, { seed: `sweep-${i}`, spice: 1 + (i % 5), inputs }) })
  }

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
    class: p.class, tier: p.tier, flavour: p.flavour, roles: { primary: p.roles.primary, secondary: [] },
    mobility: { base: p.mobility.base, handling: p.mobility.handling, traits: p.mobility.traits }, speed: p.mobility.speed,
    body: { plan: p.body.plan }, size: p.body.size, armour: p.armour, sensors: p.sensors, crew: { ...p.crew, count: p.body.count },
    signature: p.signature, abilities: p.abilities,
  })[name]
  const NAMES = ['class', 'tier', 'flavour', 'roles', 'mobility', 'speed', 'body', 'size', 'armour', 'sensors', 'crew', 'signature', 'abilities']
  const canon = x => (Array.isArray(x) ? x.map(canon) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().filter(k => x[k] !== undefined).map(k => [k, canon(x[k])])) : x)
  const card = p => JSON.stringify(canon(p))
  // A card of these steps has no secondary roles yet; a roles lock says it has none, which an ability that names
  // another role rules out (G14, M2). Those cards are left out of the own-value test.
  const pat = new Map(data.patterns.map(p => [p.id, p]))
  const namesRole = a => { const p = pat.get(a.pattern); return JSON.stringify([p.generator, p.variants.find(v => v.id === a.variant)?.overrides ?? {}]).includes('"role:') }
  const bases = []
  for (let i = 0; i < 130; i++) {
    const r = roll(data, { seed: `lock-${i}`, spice: 1 + (i % 5) })
    if (r.ok) bases.push({ i, r, name: NAMES[i % NAMES.length] })
  }

  it("T2: a lock on a card's own value rolls the same card again, part for part", () => {
    let compared = 0
    for (const { i, r, name } of bases) {
      if (r.attempts !== 1) continue // a later attempt's card: an earlier attempt may pass with the lock (G7)
      const p = r.draft.parts
      if (name === 'roles' && [p.signature, ...p.abilities].some(namesRole)) continue
      const again = roll(data, { seed: `lock-${i}`, spice: r.draft.spice, locks: { [name]: lockOf(p, name) } })
      assert.ok(again.ok, `lock-${i} ${name}: ${again.reason}`)
      if (again.attempts !== 1) continue
      compared++
      assert.equal(card(again.draft.parts), card(p), `lock-${i} ${name}`)
    }
    assert.ok(compared >= 100, `only ${compared} compared`)
  })

  it('T2: a part locked on a new seed keeps its value, and the card passes the checker', () => {
    const problems = []
    for (const { i, r, name } of bases) {
      const lock = lockOf(r.draft.parts, name)
      const other = roll(data, { seed: `lock-other-${i}`, spice: r.draft.spice, locks: { [name]: lock } })
      assert.ok(other.ok, `lock-other-${i} ${name}: ${other.reason}`)
      const kept = name === 'signature' ? canon(other.draft.parts.signature).pattern === lock.pattern : name === 'abilities' ? other.draft.parts.abilities.map(a => a.pattern).join() === lock.map(a => a.pattern).join() : card(lockOf(other.draft.parts, name)) === card(lock)
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
