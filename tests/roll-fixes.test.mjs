// The rulings of the first cross-check (section 18, "Settled by the first cross-check"): the text check's possessives
// and example name parts, the controls of an ability on the movement key, nature, the cap of abilities (A6), a chosen
// role's tool (G13 with G5), conditional weapons in counters (N4), escape lines of a second form's weapon (HC7), the
// signature's word, the pitch's cut, and the readable card's extras and controls.
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadGeneratorData } from '../scripts/lib/generator-data.mjs'
import { renderCard } from '../scripts/lib/render-card.mjs'
import { indexOf } from '../src/core/data.ts'
import { realNameIn } from '../src/core/names.ts'
import { roll } from '../src/core/roll.ts'
import { cutAtWord } from '../src/core/text.ts'

const data = loadGeneratorData()
const ix = indexOf(data)
const pat = id => data.patterns.find(p => p.id === id)
const cards = []
for (let i = 0; i < 500; i++) {
  const r = roll(data, { seed: `fix-${i}`, spice: 1 + (i % 5) })
  if (r.ok) cards.push(r.card)
}

/** Every distinct pattern line a card can show: summaries, the four matchup lists' reasons (base blocks and overrides),
 *  as_user, as_target, teammates, feedback and counterplay. */
function patternLines() {
  const lines = new Set()
  for (const p of data.patterns) {
    if (!p.generator) continue
    for (const v of p.variants) lines.add(v.summary)
    for (const b of [p.generator, ...p.variants.map(v => v.overrides ?? {})]) for (const k of ['adds_strengths', 'adds_weaknesses', 'counters', 'countered_by']) for (const r of b[k] ?? []) lines.add(r.why)
    for (const k of ['as_user', 'as_target', 'teammates', 'feedback']) for (const l of p.player_translation?.[k] ?? []) lines.add(l)
    for (const l of p.counterplay ?? []) lines.add(l)
  }
  return [...lines]
}

describe('the text check (T-b) as settled', () => {
  it('208 of the 2,713 distinct pattern lines a card can show name a real thing', () => {
    const lines = patternLines()
    assert.equal(lines.length, 2713)
    assert.equal(lines.filter(l => realNameIn(ix, l) !== undefined).length, 208)
  })

  it("the two lines of the second cross-check fail: an example game's short form, and a name after a colon", () => {
    const ghosts = pat('cloak').generator.counters.find(r => r.why.includes('cloaked Ghosts and Banshees')).why
    const battlefield = pat('heal-self').counterplay.find(l => l.startsWith('Follow up after an emergency fix'))
    assert.equal(realNameIn(ix, ghosts), 'Ghosts')
    assert.equal(realNameIn(ix, battlefield), 'Battlefield')
  })

  it('the fifteen lines of the cross-check fail: possessives and the parts of an example name', () => {
    const block = id => pat(id).generator
    const variant = (id, v) => pat(id).variants.find(x => x.id === v)
    const why = (rels, has) => rels.find(r => r.why.includes(has))?.why
    const lines = [
      ['block-abilities counterplay', pat('block-abilities').counterplay.find(l => l.startsWith('Shoot the device or the caster'))],
      ['build-linked-exits countered_by', why(block('build-linked-exits').countered_by, "Generals'")],
      ['fire-power-shot/marked-lock summary', variant('fire-power-shot', 'marked-lock').summary],
      ['freeze-and-shatter as_user', pat('freeze-and-shatter').player_translation.as_user.find(l => l.includes("Cryocopter's"))],
      ['freeze-and-shatter counterplay', pat('freeze-and-shatter').counterplay.find(l => l.includes("Overwatch's"))],
      ['launch-drones/timed-wave summary', variant('launch-drones', 'timed-wave').summary],
      ['launch-drones as_user', pat('launch-drones').player_translation.as_user.find(l => l.startsWith('In the bought add-on variant'))],
      ['launch-drones teammates', pat('launch-drones').player_translation.teammates.find(l => l.includes('Defender'))],
      ['overclock-self counterplay', pat('overclock-self').counterplay.find(l => l.includes('Void Ray'))],
      ['produce-unit-in-field countered_by', why(block('produce-unit-in-field').countered_by, 'Fatboy')],
      ['produce-unit-in-field counterplay', pat('produce-unit-in-field').counterplay.find(l => l.includes('Fatboy'))],
      ['produce-unit-in-field/lay-an-egg countered_by', why(variant('produce-unit-in-field', 'lay-an-egg').overrides.countered_by, 'Megalith')],
      ['rage-when-wounded countered_by', why(block('rage-when-wounded').countered_by, 'Lech Kos')],
      ['rage-when-wounded counterplay', pat('rage-when-wounded').counterplay.find(l => l.includes('Lech Kos'))],
      ['retaliate-on-hit as_user', pat('retaliate-on-hit').player_translation.as_user.find(l => l.includes("Thunderhead's"))],
    ]
    for (const [where, line] of lines) {
      assert.ok(typeof line === 'string', `${where}: line not found`)
      assert.notEqual(realNameIn(ix, line), undefined, `${where}: ${line}`)
    }
  })
})

describe('the parts and text rulings', () => {
  it('controls: an ability on the movement key is named as on any other key; a trait without one keeps its label', () => {
    let space = 0
    for (const c of cards) {
      const names = [c.text.signature.name, ...c.parts.abilities.map(a => pat(a.pattern).name)]
      const traits = data.vocab['mobility-traits'].terms.filter(t => t.uses_key).map(t => t.label)
      for (const x of c.text.how_it_plays.controls.filter(x => x.input === data.rules.layout.key_bound_movement)) {
        space++
        assert.ok(names.includes(x.action) || traits.includes(x.action), `${c.seed}: ${x.action}`)
      }
    }
    assert.ok(space > 5, `${space} movement keys`)
  })

  it('nature: the first entry whose condition holds; a creature-bodied walker is organic (seed t3-143)', () => {
    const r = roll(data, { seed: 't3-143', spice: 5, inputs: { flavour: 'empire' } })
    assert.ok(r.ok, r.reason)
    if (r.card.parts.body.plan === 'beast' && ['walker', 'aircraft', 'infantry'].includes(r.card.parts.class)) assert.equal(r.card.parts.nature, 'organic')
    for (const c of cards) {
      const p = c.parts
      const first = data.rules.defaults.nature.find(e => {
        const t = data.vocab.nature.terms.find(x => x.id === e.nature)
        if (t.classes && !t.classes.includes(p.class)) return false
        if (!e.when) return true
        const [k, v] = e.when.split(':')
        return (k === 'body' && p.body.plan === v) || (k === 'crew' && p.crew.model === v) || (k === 'class' && p.class === v)
      })
      assert.equal(p.nature, first.nature, `${c.seed}: ${p.class} ${p.body.plan} ${p.crew.model}`)
    }
  })

  it('A6: no card holds more abilities than its tier allows, needed extras included (seed t3-208)', () => {
    const cap = tier => data.rules.counts.abilities[tier].length - 1
    const r = roll(data, { seed: 't3-208', spice: 3, inputs: { flavour: 'empire', role: 'disabler' } })
    assert.ok(r.ok, r.reason)
    for (const c of [r.card, ...cards]) assert.ok(1 + c.parts.abilities.length <= cap(c.parts.tier), `${c.seed}: ${1 + c.parts.abilities.length} on ${c.parts.tier}`)
  })

  it("G13 with G5: a chosen role's tool above the gate is the signature when one fits (seed t3-270)", () => {
    const r = roll(data, { seed: 't3-270', spice: 1, inputs: { tier: 't3', flavour: 'soviet', role: 'transport' } })
    assert.ok(r.ok, r.reason)
    const sig = pat(r.card.parts.signature.pattern)
    const block = { ...sig.generator, ...(sig.variants.find(v => v.id === r.card.parts.signature.variant)?.overrides ?? {}) }
    const seats = [...(block.implies ?? []), ...(block.requires ?? []).flat()].some(l => /^passengers:(>=)?[1-9]/.test(l))
    assert.ok(seats, `${sig.id} brings no passenger seats`)
  })

  it('N4: the conditional weapons count in counters, at the place of their adaptive weapon', () => {
    const r = roll(data, { seed: 'n4-adaptive', spice: 5, inputs: { class: 'vehicle', tier: 't3' }, locks: { signature: { pattern: 'passenger-sets-weapon', variant: pat('passenger-sets-weapon').variants[0].id, kind: pat('passenger-sets-weapon').generator.kinds[0], cooldown: null } } })
    assert.ok(r.ok, r.reason)
    const strong = r.card.parts.armament.conditional.flatMap(c => data.vocab['damage-types'].terms.find(t => t.id === c.weapon.damage)?.strong_vs ?? [])
    const refs = r.card.matchups.counters.map(x => x.ref)
    const fromWeapons = refs.filter(x => strong.includes(x))
    assert.ok(fromWeapons.length > 0 || refs.length === 5, `counters ${refs}, conditional damage links ${strong}`)
  })

  it("HC7: a second form's cryo, emp, psionic or magnetic weapon owes its escape line", () => {
    let seen = 0
    for (let i = 0; i < 80 && seen < 3; i++) {
      const r = roll(data, { seed: `hc7-${i}`, spice: 5, inputs: { tier: 't3' }, locks: { signature: { pattern: 'transform', variant: pat('transform').variants[i % 6].id, kind: 'active', cooldown: 'medium' } } })
      if (!r.ok) continue
      const w = r.card.parts.modes[0]?.armament?.[0]
      if (!w || !data.rules.hard_control.weapon_families.families.includes(w.family)) continue
      seen++
      assert.ok(r.card.text.how_it_plays.as_target.includes(data.texts.escapes[w.family]), `${r.card.seed}: ${w.family}`)
    }
    assert.ok(seen > 0, 'no second form with such a weapon came up')
  })

  it("names: the signature's word is never a word of the card's working name", () => {
    for (const c of cards) {
      const words = new Set(c.text.name.split(/[^\p{L}\p{N}]+/u).filter(Boolean))
      assert.ok(!words.has(c.text.signature.name.split(' ')[0]), `${c.text.name} / ${c.text.signature.name}`)
    }
  })

  it('the pitch: a cut goes back to the last comma, semicolon, colon or bracket, never into the opening, keeping half the length', () => {
    const long = 'A medium Empire hovercraft: Each mine can be set to go off by itself or only on your order, so it can wait for the best target (the tank, not the scout in front of it).'
    assert.equal(cutAtWord(long, 160, 28), 'A medium Empire hovercraft: Each mine can be set to go off by itself or only on your order, so it can wait for the best target')
    assert.equal(cutAtWord('A short pitch, untouched.', 160), 'A short pitch, untouched.')
    const opening = 'A large Empire aircraft: '
    const noMark = `${opening}Nothing in this sentence has a comma so the whole thing just keeps on going and going past the limit of the pitch until it is cut somewhere near the end`
    const cut = cutAtWord(noMark, 160, opening.length)
    assert.ok(cut.length > 80 && cut.length <= 160 && noMark.startsWith(cut), cut)
    for (const c of cards) {
      assert.ok(c.text.pitch.length <= 160 && !/[,;:([]$/.test(c.text.pitch), c.text.pitch)
      // Never only the opening: the summary's words stay (the cut-back keeps at least half the length).
      assert.ok(c.text.pitch.length > c.text.pitch.indexOf(':') + 2, c.text.pitch)
    }
  })

  it('N4: a damage link the nature is immune to is dropped wherever it comes from (seed t3-1624)', () => {
    const r = roll(data, { seed: 't3-1624', spice: 5, inputs: { class: 'infantry', role: 'engineer' } })
    assert.ok(r.ok, r.reason)
    for (const c of [r.card, ...cards]) {
      for (const x of c.matchups.countered_by.filter(x => x.ref.startsWith('damage:'))) {
        const t = data.vocab['damage-types'].terms.find(d => d.id === x.ref.slice(7))
        assert.ok(!(t.immune ?? []).includes(`nature:${c.parts.nature}`), `${c.seed}: ${x.ref} on a ${c.parts.nature} card`)
      }
    }
  })

  it("HC4: a second form's weapon with a latch delivery owes the shake-off line (seed t3-9987)", () => {
    const r = roll(data, { seed: 't3-9987', spice: 5, inputs: { tier: 't3', role: 'anti-armour' } })
    assert.ok(r.ok, r.reason)
    if ((r.card.parts.modes ?? []).some(m => m.armament?.some(w => w.delivery === 'attach'))) assert.ok(r.card.text.how_it_plays.as_target.includes(data.texts.escapes.latch))
  })

  it("G5, G16: nothing above the spice gate on the generator's own roll; a gunner's crew only when the gunner can be armed within it (seed t3-5883)", () => {
    for (let i = 0; i < 150; i++) {
      const r = roll(data, { seed: `own-${i}`, spice: 1 + (i % 2) })
      if (r.ok) assert.deepEqual(r.trace.filter(e => e.aboveGate).map(e => e.field), [], r.card.seed)
    }
    const r = roll(data, { seed: 't3-5883', spice: 1, inputs: { class: 'aircraft', flavour: 'allied', role: 'anti-infantry' } })
    assert.ok(r.ok, r.reason)
    const rare = new Set(data.vocab['aim-models'].terms.filter(t => t.rarity !== 'common').map(t => t.id))
    for (const w of [r.card.parts.armament.primary, r.card.parts.armament.secondary].filter(Boolean)) assert.ok(!rare.has(w.mount), w.mount)
  })

  it('the readable card: each extra shows what it does when its summary passes the text check; controls by seat', () => {
    let grouped = 0
    for (const c of cards.slice(0, 120)) {
      const text = renderCard(c, data)
      for (const a of c.parts.abilities) {
        const summary = pat(a.pattern).variants.find(v => v.id === a.variant).summary
        if (realNameIn(ix, summary) === undefined) assert.ok(text.includes(summary), `${c.seed}: ${a.pattern}`)
        else assert.ok(!text.includes(summary))
      }
      const seats = new Set(c.text.how_it_plays.controls.map(x => x.seat))
      if (seats.size > 1) {
        grouped++
        assert.match(text, / · /)
      }
    }
    assert.ok(grouped > 0)
  })
})
