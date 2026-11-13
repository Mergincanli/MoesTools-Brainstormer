// Step 17, the card's text (section 11): the name, the pitch, the signature's name and effect, the team-play hook, how
// it plays (as user, as target, teammates, tells, controls), the counterplay and the inspiration. Every template and
// neutral sentence comes from data/generator/texts.json and every word from names.json.
//
// The text check (T-b) runs on every line: a line that names a real thing never goes on the card. A field with one
// value (a summary, a reason) then takes its neutral sentence; a field with several lines takes the next line that
// passes and is not on the card yet, and the neutral sentence when there is none (section 18). Readings (reported):
// the pitch keeps its frame and puts the neutral sentence where the summary was; "A" and "An", which the pitch's
// template names, are the only words written here.
import { categoryOf, term, type Index } from './data.ts'
import type { Dice } from './dice.ts'
import { diceFor } from './dice.ts'
import { abilitiesOf, isKeyKind, impliedKeyTraits } from './keys.ts'
import { nameProblem, realNameIn } from './names.ts'
import type { Matchups } from './matchups.ts'
import type { AbilityDraft, Draft, DraftParts, NameStyle, Pattern, TraceEntry, WeaponDraft } from './types.ts'

interface PlayerTranslation {
  as_user?: string[]
  as_target?: string[]
  teammates?: string[]
  feedback?: string[]
}

const pt = (p: Pattern): PlayerTranslation => ((p as unknown as { player_translation?: PlayerTranslation }).player_translation ?? {})
const counterplayOf = (p: Pattern): string[] => ((p as unknown as { counterplay?: string[] }).counterplay ?? [])
const hooksOf = (p: Pattern): string[] => ((p as unknown as { team_play?: { hooks?: string[] } }).team_play?.hooks ?? [])
const sourceUnitsOf = (p: Pattern): string[] => ((p as unknown as { source_units?: string[] }).source_units ?? [])

/** The first sentence of a text (up to its first full stop, question or exclamation mark that ends a sentence). */
export function firstSentence(s: string): string {
  const m = /^.*?[.!?](?=\s|$)/su.exec(s.trim())
  return (m ? m[0] : s).trim()
}

/** Section 18: a text longer than `max` is cut after the last whole word that fits, then back to the last comma,
 *  semicolon, colon or bracket before the unfinished clause, that mark dropped; never on an opening bracket, and with
 *  no dots added. A text that fits is untouched. */
export function cutAtWord(s: string, max: number, opening = 0): string {
  if (s.length <= max) return s
  const room = s.slice(0, max + 1)
  const at = room.lastIndexOf(' ')
  const words = (at > 0 ? room.slice(0, at) : s.slice(0, max)).replace(/[\s,;:([]+$/u, '')
  // The cut-back never reaches into the opening words before the summary and keeps at least half the allowed length;
  // otherwise the text ends after the last whole word that fits (section 18).
  const floor = Math.max(opening, Math.ceil(max / 2))
  const mark = Math.max(...[',', ';', ':', '(', ')', '[', ']'].map(m => words.lastIndexOf(m)))
  let cut = mark >= floor ? words.slice(0, mark) : words
  // A bracket the cut leaves open is an unfinished clause too, so the cut goes back to it (within the same limits).
  const open = cut.lastIndexOf('(')
  if (open > cut.lastIndexOf(')') && open >= floor) cut = cut.slice(0, open)
  return cut.replace(/[\s,;:([]+$/u, '')
}

/** The card's text lines so far (a line is never shown twice) and the check (T-b). */
class Lines {
  readonly used = new Set<string>()
  private readonly ix: Index
  constructor(ix: Index) {
    this.ix = ix
  }
  ok(line: string | undefined): line is string {
    return typeof line === 'string' && line.trim().length > 0 && realNameIn(this.ix, line) === undefined
  }
  /** One value: the line if it passes, else the neutral sentence. */
  one(line: string | undefined, neutral: string): string {
    const out = this.ok(line) ? line : neutral
    this.used.add(out)
    return out
  }
  /** Several lines: the first that passes and is not on the card yet, from `start`; undefined when none does. */
  next(lines: readonly string[], start = 0, cut: (s: string) => string = s => s): string | undefined {
    for (let i = start; i < lines.length; i++) {
      const line = cut(lines[i] ?? '')
      if (this.ok(line) && !this.used.has(line)) {
        this.used.add(line)
        return line
      }
    }
    for (let i = 0; i < Math.min(start, lines.length); i++) {
      const line = cut(lines[i] ?? '')
      if (this.ok(line) && !this.used.has(line)) {
        this.used.add(line)
        return line
      }
    }
    return undefined
  }
}

const pick = <T>(dice: Dice, list: readonly T[]): T | undefined => (list.length ? list[dice.below(list.length)] : undefined)

/** A flavour's name words (names.json). */
const styleOf = (ix: Index, flavour: string | undefined): NameStyle | undefined => (ix.data.names as unknown as Record<string, NameStyle | undefined>)[flavour ?? '']

/** One template of texts.json, with the fields the text step reads. */
interface Template {
  template?: string
  max_length?: number
  actions?: Record<string, string>
  max?: number
}
const templateOf = (ix: Index, name: string): Template => (ix.data.texts.templates[name] ?? {}) as Template

/** The working name by the flavour's templates in names.json, each placeholder a word of the list of its name. */
function workingName(ix: Index, d: Draft): { name: string; problem?: string } {
  if (d.name !== undefined) return { name: d.name, problem: nameProblem(ix, d.name) }
  const style = styleOf(ix, d.parts.flavour)
  if (!style) return { name: '', problem: `names.json has no names for flavour ${d.parts.flavour}` }
  const dice = diceFor(d.seed, 'text.name', d.attempt)
  const template = pick(dice, style.templates) ?? ''
  const name = template.replace(/\{(\w+)\}/g, (_: string, key: string) => String(pick(dice, style.words[key] ?? []) ?? ''))
  return { name, problem: nameProblem(ix, name) }
}

/** The signature's name: a word of the flavour's signature_words lists, never a word of the card's working name
 *  (drawn again on the same dice until it differs, section 18), then a noun for the pattern's category. */
function signatureName(ix: Index, d: Draft, cardName: string): { name: string; problem?: string } {
  const style = styleOf(ix, d.parts.flavour)
  const cat = categoryOf(ix, d.parts.signature?.pattern ?? '') ?? ''
  const nouns = (ix.data.names as unknown as { signature_nouns?: Record<string, string[]> }).signature_nouns?.[cat] ?? []
  const words = (style?.signature_words ?? []).flatMap((list: string) => (style?.words[list] ?? []).map(String))
  const dice = diceFor(d.seed, 'text.signature.name', d.attempt)
  const taken = new Set(cardName.split(/[^\p{L}\p{N}]+/u).filter(Boolean))
  if (!words.some(w => !taken.has(w))) return { name: '', problem: `every signature word of ${d.parts.flavour} is a word of the name ${cardName}` }
  let word = pick(dice, words)
  while (word !== undefined && taken.has(word)) word = pick(dice, words)
  const noun = pick(dice, nouns)
  if (!word || !noun) return { name: '', problem: `names.json has no signature words for ${d.parts.flavour} or no nouns for category ${cat}` }
  const name = (templateOf(ix, 'signature_name').template ?? '').replace('{name_word}', word).replace('{category_noun}', noun)
  return { name, problem: nameProblem(ix, name, [noun]) }
}

/** The hard-control parts of the card and their escape lines (HC4, HC7): an ability's own as-target line at its
 *  escape index, the line for a latch delivery, or the line for a weapon of an HC7 family. Undefined when one has none. */
function escapeLines(ix: Index, p: DraftParts): string[] | undefined {
  const out: string[] = []
  const hc = ix.data.rules.hard_control
  const escapes = (ix.data.texts as unknown as { escapes?: Record<string, string> }).escapes ?? {}
  for (const a of abilitiesOf(p)) {
    const e = hc.entries.find(x => x.pattern === a.pattern && (x.variants === 'all' ? !(x.except ?? []).includes(a.variant ?? '') : (x.variants ?? []).includes(a.variant ?? '')))
    if (!e) continue
    const pat = ix.patternById.get(a.pattern ?? '')
    const line = typeof e.escape === 'number' && pat ? pt(pat).as_target?.[e.escape] : undefined
    if (!line) return undefined
    out.push(line)
  }
  // A latch delivery (HC4) and a weapon of the cryo, emp, psionic or magnetic family (HC7) owe their escape lines, a
  // second form's weapon included (section 18).
  const formWeapons = (p.modes ?? []).flatMap(m => m.armament ?? [])
  const weapons = [p.armament.primary, p.armament.secondary, ...(p.armament.conditional ?? []).map(c => c.weapon), ...formWeapons].filter((w): w is WeaponDraft => !!w)
  for (const e of hc.entries) {
    if (!e.term || !e.escape_line) continue
    const [kind, id] = e.term.split(':')
    if (kind === 'delivery' && weapons.some(w => w.delivery === id)) out.push(escapes[e.escape_line] ?? '')
  }
  for (const f of hc.weapon_families?.families ?? []) if (weapons.some(w => w.family === f)) out.push(escapes[f] ?? '')
  return out.some(l => !l) ? undefined : out
}

export interface CardText {
  name: string
  pitch: string
  signature: { name: string; effect: string }
  team_play_hook: { hook: string; text: string }
  how_it_plays: { as_user: string; as_target: string; teammates: string; controls: Array<{ seat: string; input: string; action: string }>; tells: string }
}

/** The controls (K-f, section 18): one entry per bound input, by rules.json layout. */
export function controlsOf(ix: Index, p: DraftParts, sigName: string): CardText['how_it_plays']['controls'] {
  const L = ix.data.rules.layout
  const acts = templateOf(ix, 'controls').actions ?? {}
  const out: CardText['how_it_plays']['controls'] = []
  const label = (list: string, id: string | undefined): string => (id !== undefined ? term(ix, list, id)?.label ?? id : '')
  const fill = (slot: string, values: Record<string, string>): string => (acts[slot] ?? '').replace(/\{(\w+)\}/g, (_: string, k: string) => values[k] ?? '')
  const add = (seat: string, slot: string, values: Record<string, string>): void => {
    const input = L[slot]
    if (input !== undefined) out.push({ seat, input, action: fill(slot, values) })
  }
  const a = p.armament
  if (a.primary) add(a.primary.seat ?? 'driver', a.primary.seat === 'gunner' ? 'gunner_weapon' : 'primary_weapon', { weapon: label('weapon-families', a.primary.family) })
  // A gunner fires its gun with LMB; when the gunner seat also fires the primary (seat swap, needs crew), the second gun
  // keeps RMB.
  const gunnerLmb = a.secondary?.seat === 'gunner' && a.primary?.seat !== 'gunner'
  if (a.secondary) add(a.secondary.seat ?? 'driver', gunnerLmb ? 'gunner_weapon' : 'secondary_weapon', { weapon: label('weapon-families', a.secondary.family) })
  // Abilities on keys: the signature on Q, the first extra on R, the next on Shift; one that implies a key-bound movement
  // trait sits on Space, as the movement key. A passive or triggered ability has no entry. Reading (reported): when the
  // signature is passive, a third key extra takes the free Q.
  const traitsWithAbility = new Set<string>()
  let movementUsed = false
  const free = ['next_ability', 'fourth_key', ...(isKeyKind(ix, p.signature?.kind) ? [] : ['signature'])]
  abilitiesOf(p).forEach((ab: AbilityDraft, i) => {
    if (!isKeyKind(ix, ab.kind)) return
    const traits = impliedKeyTraits(ix, ab)
    const name = ix.patternById.get(ab.pattern ?? '')?.name ?? ab.pattern ?? ''
    if (traits.length && !movementUsed) {
      // On the movement key, named as the ability is on any other key (section 18).
      movementUsed = true
      for (const t of traits) traitsWithAbility.add(t)
      const input = L.key_bound_movement
      if (input !== undefined) out.push({ seat: ab.seat ?? 'driver', input, action: i === 0 ? fill('signature', { signature_name: sigName }) : fill('next_ability', { ability: name }) })
      return
    }
    if (i === 0) add(ab.seat ?? 'driver', 'signature', { signature_name: sigName })
    else {
      const slot = free.shift()
      if (slot) add(ab.seat ?? 'driver', slot, slot === 'signature' ? { signature_name: name } : { ability: name })
    }
  })
  // A key-bound trait under a passive ability keeps its own key, on Space.
  for (const t of p.mobility.traits ?? []) {
    if (term(ix, 'mobility-traits', t)?.uses_key !== true || traitsWithAbility.has(t) || movementUsed) continue
    movementUsed = true
    add('driver', 'key_bound_movement', { trait: label('mobility-traits', t) })
  }
  return out
}

/**
 * The card's text, or why it cannot have one (a name that fails the name check: the block flag name-collision; a
 * hard-control part with no escape line: hard-control-without-escape; no control at all).
 */
export function textOf(ix: Index, d: Draft, m: Matchups): { text: CardText; counterplay: string[]; whys: Matchups; trace: TraceEntry[] } | { flag?: string; problem: string } {
  const p = d.parts
  const T = ix.data.texts
  const neutral = T.neutral as Record<string, string>
  const lines = new Lines(ix)
  const sig = p.signature as AbilityDraft
  const sp = ix.patternById.get(sig.pattern ?? '') as Pattern
  const extras = (p.abilities ?? []).map(a => ix.patternById.get(a.pattern ?? '') as Pattern)
  const trace: TraceEntry[] = []
  const name = workingName(ix, d)
  if (name.problem) return { flag: 'name-collision', problem: name.problem }
  trace.push({ field: 'text.name', value: name.name, how: d.name !== undefined ? 'locked' : 'rolled', rule: 'section 11 (name style), T-a', candidates: 0 })
  const sn = signatureName(ix, d, name.name)
  if (sn.problem) return { flag: 'name-collision', problem: sn.problem }
  trace.push({ field: 'text.signature.name', value: sn.name, how: 'rolled', rule: 'section 11 (signature name), T-a', candidates: 0 })
  // The pitch: the template, the summary's first sentence, cut at a word (section 18).
  const variant = sp.variants.find(v => v.id === sig.variant)
  const summary = (variant as unknown as { summary?: string } | undefined)?.summary ?? ''
  const style = styleOf(ix, p.flavour)
  const size = (term(ix, 'sizes', p.body.size ?? '')?.label ?? p.body.size ?? '').toLowerCase()
  const lead = lines.one(firstSentence(summary), neutral.pitch ?? '')
  const pitchTemplate = templateOf(ix, 'pitch')
  const article = /^[aeiou]/i.test(size) ? 'An' : 'A'
  const frame = (pitchTemplate.template ?? '').replace('{A}', article).replace('{size}', size).replace('{flavour}', style?.flavour_word ?? '').replace('{class_noun}', style?.class_nouns[p.class ?? ''] ?? '')
  const opening = frame.indexOf('{summary}')
  const pitch = cutAtWord(frame.replace('{summary}', lead), pitchTemplate.max_length ?? 160, opening < 0 ? 0 : opening)
  const effect = lines.one(summary, neutral.signature_effect ?? '')
  // The team-play hook: the first of the pattern's hooks the flavour favours, else its first; its line the first
  // teammates line.
  const favoured = (term(ix, 'faction-flavours', p.flavour ?? '')?.favoured?.['team-play-hooks'] ?? []) as string[]
  const hooks = hooksOf(sp)
  const hook = hooks.find(h => favoured.includes(h)) ?? hooks[0] ?? ''
  const team = pt(sp).teammates ?? []
  const hookText = lines.next(team, 0) ?? lines.one(undefined, neutral.team_play_hook ?? '')
  // How it plays.
  const userParts = [lines.next(pt(sp).as_user ?? [], 0), ...extras.map(x => lines.next(pt(x).as_user ?? [], 0, firstSentence))].filter((x): x is string => !!x)
  const asUser = userParts.length ? userParts.join(' ') : lines.one(undefined, neutral.as_user ?? '')
  const escapes = escapeLines(ix, p)
  if (escapes === undefined) return { flag: 'hard-control-without-escape', problem: 'a hard-control part with no escape line (HC4)' }
  const targetLine = lines.next(pt(sp).as_target ?? [], 0)
  const esc: string[] = []
  for (const e of escapes) {
    if (!lines.ok(e)) return { flag: 'name-collision', problem: `an escape line names a real thing (T-b): ${e}` }
    if (e !== targetLine && !esc.includes(e)) esc.push(e)
  }
  const asTarget = [targetLine ?? neutral.as_target ?? '', ...esc].join(' ')
  const teammates = lines.next(team, team.length > 1 ? 1 : 0) ?? lines.one(undefined, neutral.teammates ?? '')
  const tells = lines.next(pt(sp).feedback ?? [], 0) ?? lines.one(undefined, neutral.tells ?? '')
  const controls = controlsOf(ix, p, sn.name)
  if (!controls.length) return { problem: 'the card has no bound input (every ability passive and no weapon)' }
  // Counterplay: the signature's first two lines, then each extra's first.
  const cp = [lines.next(counterplayOf(sp), 0), lines.next(counterplayOf(sp), 1), ...extras.map(x => lines.next(counterplayOf(x), 0))].filter((x): x is string => !!x)
  const counterplay = cp.length ? cp : [neutral.counterplay ?? '']
  // Matchup reasons: one value each.
  const why = <L extends { why: string; list: string }>(l: L): L => ({ ...l, why: lines.ok(l.why) ? l.why : neutral[l.list] ?? l.why })
  const whys: Matchups = { strengths: m.strengths.map(why), weaknesses: m.weaknesses.map(why), countered_by: m.countered_by.map(why), counters: m.counters.map(why) }
  return {
    text: { name: name.name, pitch, signature: { name: sn.name, effect }, team_play_hook: { hook, text: hookText }, how_it_plays: { as_user: asUser, as_target: asTarget, teammates, controls, tells } },
    counterplay,
    whys,
    trace,
  }
}

/** Inspiration: the card's patterns, and up to `max` of the signature pattern's source units, picked by the seed. */
export function inspirationOf(ix: Index, d: Draft): { patterns: string[]; source_units: string[] } {
  const p = d.parts
  const patterns = abilitiesOf(p).map(a => a.pattern as string)
  const units = sourceUnitsOf(ix.patternById.get(p.signature?.pattern ?? '') as Pattern)
  const max = templateOf(ix, 'inspiration').max ?? 3
  if (units.length <= max) return { patterns, source_units: [...units] }
  const dice = diceFor(d.seed, 'inspiration.source_units', d.attempt)
  const left = [...units.keys()]
  const chosen: number[] = []
  while (chosen.length < max) chosen.push(left.splice(dice.below(left.length), 1)[0] as number)
  return { patterns, source_units: chosen.sort((a, b) => a - b).map(i => units[i] as string) }
}
