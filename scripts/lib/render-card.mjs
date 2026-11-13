// Renders a finished card (schemas/concept-card.schema.json) as plain text that reads as Markdown: the readable card
// of `npm run roll` and the cards of docs/cards.md. It shows what the card holds, with the word lists' labels for its
// ids, and for each extra ability what it does: its variant's summary from the patterns, when that summary passes the
// text check (the card schema has an effect text for the signature only). No rule codes.
import { indexOf } from '../../src/core/data.ts'
import { realNameIn } from '../../src/core/names.ts'

/** Plain words for the kinds of typed links. */
const KIND_WORDS = {
  class: 'class', role: 'role', tier: 'tier', cost: 'cost band', availability: 'availability', damage: 'damage',
  'armour-class': 'armour', 'armour-model': 'armour model', weapon: 'weapon', mobility: 'movement', 'mobility-trait': 'movement trait',
  handling: 'handling', body: 'body', size: 'size', speed: 'speed', crew: 'crew', passengers: 'passenger seats', mount: 'mount',
  delivery: 'delivery', range: 'range', 'weapon-trait': 'weapon trait', target: 'target', hits: 'can hit', sight: 'sight',
  sensor: 'sensor', nature: 'nature', category: 'ability type', resource: 'resource', pattern: 'ability', immune: 'immune to', unit: 'unit',
}

/** A labeller over the data's word lists, link kinds and patterns. */
export function labeller(data) {
  const terms = new Map(Object.values(data.vocab).map(l => [l.id, new Map(l.terms.map(t => [t.id, t.label ?? t.id]))]))
  const patterns = new Map(data.patterns.map(p => [p.id, p.name ?? p.id]))
  const label = (list, id) => (id === null || id === undefined ? 'none' : terms.get(list)?.get(id) ?? String(id))
  const link = ref => {
    const m = /^([a-z-]+):(>=|<=)?(.+)$/.exec(ref)
    if (!m) return ref
    const [, kind, cmp, id] = m
    const list = data.refKinds[kind]?.vocab
    const value = kind === 'pattern' ? patterns.get(id) ?? id : kind === 'passengers' ? id : list ? label(list, id) : id
    const more = cmp === '>=' ? ' or more' : cmp === '<=' ? ' or less' : ''
    return `${value}${more} (${KIND_WORDS[kind] ?? kind})`
  }
  return { label, link, pattern: id => patterns.get(id) ?? id }
}

const list = xs => (xs.length ? xs.join(', ') : 'none')

function weaponLine(L, w, seatWord = true) {
  if (!w) return 'none'
  const bits = [L.label('weapon-families', w.family)]
  if (w.damage) bits.push(`${L.label('damage-types', w.damage)} damage`)
  if (w.delivery) bits.push(L.label('weapon-delivery', w.delivery))
  if (w.range) bits.push(`${L.label('range-bands', w.range)} range`)
  bits.push(`${L.label('aim-models', w.mount)} mount`)
  const line = [bits.join(', '), `hits ${list(w.can_target.map(t => L.label('target-types', t)))}`]
  if (w.traits.length) line.push(`traits: ${list(w.traits.map(t => L.label('weapon-traits', t)))}`)
  if (seatWord) line.push(`fired from the ${L.label('seat-roles', w.seat)} seat`)
  return line.join('; ')
}

/** The card as readable lines (Markdown); `level` is the heading level of its name. */
export function renderCard(card, data, { level = 2 } = {}) {
  const L = labeller(data)
  const p = card.parts
  const t = card.text
  const out = []
  const h = '#'.repeat(level)
  out.push(`${h} ${t.name}`, '', `*${t.pitch}*`, '')
  const roles = [L.label('roles', p.roles.primary), ...p.roles.secondary.map(r => `${L.label('roles', r)} (also)`)]
  out.push(`${L.label('classes', p.class)} · ${L.label('tiers', p.tier)} · ${L.label('faction-flavours', p.flavour)} · role: ${roles.join(', ')} · spice ${card.spice} · seed \`${card.seed}\``, '')
  out.push(`${h}# Body`, '')
  const traits = p.mobility.traits.length ? `; ${list(p.mobility.traits.map(x => L.label('mobility-traits', x)))}` : ''
  out.push(`- Moves: ${L.label('mobility', p.mobility.base)} (${L.label('handling', p.mobility.handling)}), ${L.label('speed-bands', p.mobility.speed)} speed${traits}`)
  out.push(`- Body: ${L.label('bodies', p.body.plan)}, ${L.label('sizes', p.body.size)}${p.body.count > 1 ? `, ${p.body.count} bodies` : ''}; ${L.label('nature', p.nature)}; ${L.label('availability', p.availability)}`)
  out.push(`- Armour: ${L.label('armour-classes', p.armour.class)} (${list(p.armour.models.map(x => L.label('armour-models', x)))})`)
  out.push(`- Sensors: ${L.label('sight-bands', p.sensors.sight)} sight${p.sensors.traits.length ? `; ${list(p.sensors.traits.map(x => L.label('sensor-traits', x)))}` : ''}`)
  const seats = p.crew.solo_fallback ? `; alone: ${L.label('solo-fallback', p.crew.solo_fallback)}` : ''
  const riders = p.crew.passengers ? `; ${p.crew.passengers.seats} passenger seats (${L.label('seat-roles', p.crew.passengers.kind)})` : ''
  out.push(`- Crew: ${L.label('crew-models', p.crew.model)}${seats}${riders}`)
  out.push(`- On death: ${list(p.on_death.map(x => L.label('on-death', x)))}${p.resource ? `; resource: ${L.label('resources', p.resource)}` : ''}`, '')
  out.push(`${h}# Weapons`, '')
  out.push(`- Main: ${weaponLine(L, p.armament.primary)}`)
  if (p.armament.secondary) out.push(`- Second: ${weaponLine(L, p.armament.secondary)}`)
  for (const c of p.armament.conditional) out.push(`- When ${L.link(c.when)}: ${weaponLine(L, c.weapon, false)}`)
  for (const m of p.modes ?? []) {
    out.push(`- Second form: ${L.label('classes', m.class)} on ${L.label('mobility', m.mobility.base)}, ${L.label('speed-bands', m.mobility.speed)} speed; weapon: ${m.armament?.length ? weaponLine(L, m.armament[0], false) : 'none'}`)
  }
  out.push('', `${h}# Abilities`, '')
  const keyOf = name => t.how_it_plays.controls.find(c => c.action === name)
  const abilities = [p.signature, ...p.abilities]
  const ix = indexOf(data)
  const names = abilities.map((a, i) => (i === 0 ? t.signature.name : L.pattern(a.pattern)))
  abilities.forEach((a, i) => {
    const name = names[i]
    const key = keyOf(name)
    const how = [L.label('ability-kinds', a.kind), a.cooldown ? `${L.label('cooldown-bands', a.cooldown)} cooldown` : null, key ? `key ${key.input}` : null, a.seat !== 'driver' ? `${L.label('seat-roles', a.seat)} seat` : null].filter(Boolean).join(', ')
    // An extra's effect: its variant's summary in the patterns, when it names no real thing.
    const summary = i === 0 ? t.signature.effect : data.patterns.find(x => x.id === a.pattern)?.variants.find(v => v.id === a.variant)?.summary
    const effect = i === 0 || (summary && realNameIn(ix, summary) === undefined) ? ` ${summary ?? ''}` : ''
    out.push(`- **${name}**${i === 0 ? ' (signature)' : ''}: ${how}.${effect}`.trimEnd())
  })
  const traitKeys = t.how_it_plays.controls.filter(c => c.input === data.rules.layout.key_bound_movement && !names.includes(c.action))
  for (const c of traitKeys) out.push(`- Movement key ${c.input}: ${c.action}.`)
  out.push('', `${h}# Team play`, '', `${L.label('team-play-hooks', t.team_play_hook.hook)}: ${t.team_play_hook.text}`, '')
  out.push(`${h}# How it plays`, '')
  out.push(`- As the player: ${t.how_it_plays.as_user}`)
  out.push(`- Facing it: ${t.how_it_plays.as_target}`)
  out.push(`- For teammates: ${t.how_it_plays.teammates}`)
  out.push(`- What others see: ${t.how_it_plays.tells}`)
  // Controls, grouped by seat when the card has more than one.
  const seatsUsed = [...new Set(t.how_it_plays.controls.map(c => c.seat))]
  const controls = seatsUsed.length > 1
    ? seatsUsed.map(s => `${L.label('seat-roles', s)}: ${t.how_it_plays.controls.filter(c => c.seat === s).map(c => `${c.input} ${c.action}`).join(', ')}`).join(' · ')
    : t.how_it_plays.controls.map(c => `${c.input} ${c.action}`).join(', ')
  out.push(`- Controls: ${controls}`, '')
  const rel = r => `- ${L.link(r.ref)}: ${r.why}`
  out.push(`${h}# Strong against`, '', ...card.matchups.counters.map(rel), '')
  out.push(`${h}# Countered by`, '', ...card.matchups.countered_by.map(rel), '')
  out.push(`${h}# Strengths`, '')
  for (const s of card.matchups.strengths) out.push(`- ${L.link(s.ref)}: ${s.why} Paid for by: ${L.link(card.matchups.weaknesses[s.paired_with]?.ref ?? '')}.`)
  out.push('', `${h}# Weaknesses`, '', ...card.matchups.weaknesses.map(rel))
  out.push('', `${h}# Balance hints`, '')
  const b = card.balance
  const flags = b.flags.length ? `; warnings: ${list(b.flags.map(f => L.label('balance-flags', f)))}` : ''
  out.push(`Cost ${L.label('cost-bands', b.cost_band)}, power ${b.power} of 10, complexity ${b.complexity} of 10, ${b.keys} key${b.keys === 1 ? '' : 's'}${flags}.`, '')
  out.push(`${h}# Counterplay`, '', ...card.matchups.counterplay.map(x => `- ${x}`), '')
  out.push(`${h}# Inspiration`, '', `- Patterns: ${list(card.inspiration.patterns.map(x => `\`${x}\``))}`, `- Source units: ${list(card.inspiration.source_units.map(x => `\`${x}\``))}`, '')
  return out.join('\n')
}
