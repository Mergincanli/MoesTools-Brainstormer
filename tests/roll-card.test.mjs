// The finished card (step 17): the card schema and the validator's card rules over a sweep, the reproduction (T1),
// the id, the flags, the name and text checks (T-a, T-b, section 18), the pitch, the controls, the matchup lists
// (M3, M4, N2) and the balance hints on the plan's example card (section 10).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { loadGeneratorData, REPO_ROOT } from '../scripts/lib/generator-data.mjs'
import { validate } from '../scripts/validate.mjs'
import { balanceOf } from '../src/core/balance.ts'
import { cardId } from '../src/core/card.ts'
import { indexOf } from '../src/core/data.ts'
import { satisfiable } from '../src/core/matchups.ts'
import { realNameIn } from '../src/core/names.ts'
import { roll } from '../src/core/roll.ts'

const data = loadGeneratorData()
const ix = indexOf(data)
const ids = list => data.vocab[list].terms.filter(t => !t.source_only).map(t => t.id)
const CLASSES = ids('classes'), TIERS = ids('tiers'), FLAVOURS = ids('faction-flavours'), ROLES = ids('roles')

// The card schema, compiled the way scripts/validate.mjs compiles it.
function cardSchema() {
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false })
  addFormats(ajv)
  const vocab = new Map(Object.values(data.vocab).map(v => [v.id, new Set(v.terms.map(t => t.id))]))
  ajv.addKeyword({
    keyword: 'x-vocab', schemaType: 'string', errors: true,
    validate: function check(id, value) {
      if (value === null || typeof value !== 'string') return true
      if (vocab.get(id)?.has(value)) return true
      check.errors = [{ message: `'${value}' is not a term of ${id}` }]
      return false
    },
  })
  for (const k of ['x-ref-kinds', 'x-provenance', 'x-required-unless', 'x-required-when']) ajv.addKeyword({ keyword: k, schemaType: k === 'x-ref-kinds' ? 'object' : 'string' })
  for (const f of fs.readdirSync(path.join(REPO_ROOT, 'schemas')).filter(f => f.endsWith('.json'))) ajv.addSchema(JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'schemas', f), 'utf8')))
  return ajv.getSchema('concept-card.schema.json')
}

// A sweep of finished cards over every class, tier, flavour, role and spice.
const sweep = []
for (let i = 0; i < 700; i++) {
  const inputs = i % 2 ? { class: CLASSES[i % CLASSES.length], flavour: FLAVOURS[i % 3], role: i % 4 === 1 ? ROLES[i % ROLES.length] : null, tier: TIERS[i % 3] } : {}
  const r = roll(data, { seed: `finished-${i}`, spice: 1 + (i % 5), inputs })
  if (r.ok) sweep.push(r.card)
  else assert.ok(inputs.role === 'transport' && ['infantry', 'drone'].includes(inputs.class), r.reason)
}

const textFields = c => [
  c.text.name, c.text.pitch, c.text.signature.name, c.text.signature.effect, c.text.team_play_hook.text,
  c.text.how_it_plays.as_user, c.text.how_it_plays.as_target, c.text.how_it_plays.teammates, c.text.how_it_plays.tells,
  ...c.text.how_it_plays.controls.map(x => x.action), ...c.matchups.counterplay,
  ...['strengths', 'weaknesses', 'counters', 'countered_by'].flatMap(k => c.matchups[k].map(x => x.why)),
]

describe('the finished card', () => {
  it('every card passes the card schema', () => {
    const check = cardSchema()
    assert.ok(sweep.length > 600, `${sweep.length} cards`)
    for (const c of sweep) assert.ok(check(c), `${c.seed}: ${JSON.stringify(check.errors?.slice(0, 3))}`)
  })

  it("every card passes the validator's card rules (scripts/validate.mjs, on a copy of the data with the cards as examples)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-cards-'))
    try {
      for (const d of ['data', 'schemas']) fs.symlinkSync(path.join(REPO_ROOT, d), path.join(root, d), 'dir')
      fs.mkdirSync(path.join(root, 'docs', 'examples'), { recursive: true })
      sweep.slice(0, 60).forEach((c, i) => fs.writeFileSync(path.join(root, 'docs', 'examples', `concept-card.rolled-${i}.json`), JSON.stringify(c)))
      const { errors } = validate(root)
      assert.deepEqual(errors.filter(e => e.includes('concept-card')).slice(0, 10), [])
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  it('T1: 1,000 random requests, each rolled twice, give identical cards', () => {
    for (let i = 0; i < 1000; i++) {
      const pick = (xs, n) => (n % 3 === 0 ? null : xs[n % xs.length])
      const request = { seed: `t1-${i * 7919}`, spice: 1 + ((i * 31) % 5), inputs: { class: pick(CLASSES, i), tier: pick(TIERS, i >> 1), flavour: pick(FLAVOURS, i >> 2), role: i % 5 ? null : pick(ROLES, i >> 3) } }
      const a = roll(data, request), b = roll(data, request)
      assert.deepEqual(a.ok ? a.card : a.reason, b.ok ? b.card : b.reason, request.seed)
    }
  })

  it('the id is the same for the same roll, and differs when the seed, an input, a lock, the spice or the data version differs', () => {
    const base = { seed: 'id-check', spice: 3, inputs: { class: 'walker' }, locks: { size: 'large' } }
    const a = roll(data, base), b = roll(data, base)
    assert.equal(a.card.id, b.card.id)
    assert.equal(a.card.id, cardId(base, a.card.inputs, data.dataVersion))
    const others = [
      { ...base, seed: 'id-check-2' }, { ...base, inputs: { class: 'vehicle' } }, { ...base, locks: { size: 'medium' } }, { ...base, locks: {} }, { ...base, spice: 4 },
    ].map(r => roll(data, r).card.id)
    assert.equal(new Set([a.card.id, ...others]).size, 6)
    assert.notEqual(cardId(base, a.card.inputs, `${data.dataVersion}x`), a.card.id)
    assert.equal(roll(data, { ...base, created_at: '2026-11-13T10:00:00Z' }).card.created_at, '2026-11-13T10:00:00Z')
    assert.equal(a.card.created_at, undefined)
  })

  it('no returned card carries a block flag; inputs and locks say what was asked for', () => {
    const block = new Set(data.vocab['balance-flags'].terms.filter(t => t.severity === 'block').map(t => t.id))
    for (const c of sweep) assert.deepEqual(c.balance.flags.filter(f => block.has(f)), [], c.seed)
    const r = roll(data, { seed: 'asked', spice: 2, inputs: { tier: 't2' }, locks: { speed: 'fast', size: 'medium' } })
    assert.deepEqual(r.card.inputs, { class: null, tier: 't2', flavour: null, role: null })
    assert.deepEqual(r.card.locks, ['speed', 'size'])
  })

  it('T-a, T-b: no text field names a real thing; the working name is not a real name', () => {
    for (const c of sweep) for (const t of textFields(c)) assert.equal(realNameIn(ix, t), undefined, `${c.seed}: ${t}`)
  })

  it('the pitch is at most 160 characters and ends on a whole word (section 18)', () => {
    for (const c of sweep) {
      assert.ok(c.text.pitch.length <= 160, c.text.pitch)
      assert.ok(!/\s$/.test(c.text.pitch) && !/\.\.\.$/.test(c.text.pitch), c.text.pitch)
    }
  })

  it('the controls follow section 18: weapons on LMB and RMB (a gunner on LMB), the signature on Q, extras on R then Shift, a movement key on Space, nothing for a passive ability', () => {
    const keyKinds = new Set(data.vocab['ability-kinds'].terms.filter(t => t.uses_key).map(t => t.id))
    for (const c of sweep) {
      const C = c.text.how_it_plays.controls
      const p = c.parts
      assert.ok(C.length >= 1)
      if (p.armament.primary) assert.ok(C.some(x => x.input === 'LMB' && x.seat === p.armament.primary.seat))
      if (p.armament.secondary) assert.ok(C.some(x => x.input === (p.armament.secondary.seat === 'gunner' ? 'LMB' : 'RMB') && x.seat === p.armament.secondary.seat))
      const keys = [p.signature, ...p.abilities].filter(a => keyKinds.has(a.kind)).length
      const abilityInputs = C.filter(x => ['Q', 'R', 'Shift', 'Space'].includes(x.input)).length
      assert.ok(abilityInputs <= keys + p.mobility.traits.length, c.seed)
      if (keyKinds.has(p.signature.kind)) assert.ok(C.some(x => ['Q', 'Space'].includes(x.input)), `${c.seed}: the signature has a key`)
      assert.equal(new Set(C.map(x => `${x.seat}:${x.input}`)).size, C.length, `${c.seed}: one action per input and seat`)
    }
  })

  it('every matchup list has 1 to 5 entries; strengths pair with weaknesses of their own ability (M3, M4)', () => {
    for (const c of sweep) {
      for (const k of ['strengths', 'weaknesses', 'counters', 'countered_by']) assert.ok(c.matchups[k].length >= 1 && c.matchups[k].length <= 5, `${c.seed} ${k}`)
      for (const s of c.matchups.strengths) assert.ok(s.paired_with < c.matchups.weaknesses.length)
      // The pairs come from one ability: the signature's strength pairs with the signature's weakness.
      const sig = data.patterns.find(p => p.id === c.parts.signature.pattern)
      const v = sig.variants.find(x => x.id === c.parts.signature.variant)?.overrides ?? {}
      const S = v.adds_strengths ?? sig.generator.adds_strengths, W = v.adds_weaknesses ?? sig.generator.adds_weaknesses
      assert.equal(c.matchups.strengths[0].ref, S[0].ref)
      assert.equal(c.matchups.weaknesses[c.matchups.strengths[0].paired_with].ref, W[0].ref)
    }
  })

  it('N2, N3: a link no card can satisfy never appears in countered by, and the three the sheet names are among those', () => {
    for (const l of ['weapon-trait:stun', 'immune:stack-to-overload']) assert.equal(satisfiable(ix, l), false, l)
    if (!data.patterns.some(p => p.id === 'raise-shield')) assert.equal(satisfiable(ix, 'pattern:raise-shield'), false)
    for (const l of ['weapon:machine-gun', 'class:aircraft', 'role:anti-air', 'hits:high-air']) assert.equal(satisfiable(ix, l), true, l)
    for (const c of sweep) for (const r of c.matchups.countered_by) assert.ok(satisfiable(ix, r.ref), `${c.seed}: ${r.ref}`)
  })

  it("section 10 on the plan's example card: power 4, complexity 4, cost 4 = low, 2 keys", () => {
    const ex = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'docs/examples/concept-card.example.json'), 'utf8'))
    const b = balanceOf(ix, ex.parts)
    assert.deepEqual([b.power, b.complexity, b.cost, b.cost_band, b.keys], [4, 4, 4, 'low', 2])
  })
})
