// Renders readable Markdown from the JSON drafts so docs and data never drift.
//
// Usage:
//   node scripts/build-docs.mjs [--root <dir>] [--check]
//
// Writes docs/vocabularies.md, docs/fields.md and docs/samples.md under the root (default: this repo).
// --check builds the three pages in memory, lists the ones that differ from the files on disk and exits 1;
// it writes nothing.
//
// This began as a port of the original Python builder (build_docs.py), byte-identical in output up to word-list
// version 0.3.0; changes since then (class rarities, versioned titles, sensors, the fixed sample list) are made
// here only. The functions and their order still follow the Python version. Where JavaScript behaves differently
// from Python, the small helpers in the next section make it behave like Python.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const OUTPUTS = ['docs/vocabularies.md', 'docs/fields.md', 'docs/samples.md']
// What docs/samples.md shows, in this order: the three source units and three patterns written as the samples for
// the brief's first step. The page stays this size however many units and patterns the research run adds.
export const SAMPLE_UNITS = ['ra3.soviet.terror-drone', 'ra3.soviet.hammer-tank', 'ra3.allied.multigunner-ifv']
export const SAMPLE_PATTERNS = ['infest-vehicle', 'leech-weapon-on-kill', 'passenger-sets-weapon']
const GEN_NOTE = '<!-- Generated from the JSON in data/ and schemas/. Edit the JSON, not this file. -->\n'

// ------------------------------------------------------------------ Python behaviour
// - strict(): loaded JSON throws on a missing key or list index, as Python's d["k"] and xs[i] do, instead
//   of quietly printing "undefined" into the docs. get(d, k, dflt) is Python's d.get(k, dflt) and
//   has(x, k) is Python's `k in x`.
// - truthy(), given() and or(): Python truthiness, where an empty list or object counts as false.
// - f`...` and str(): Python f-strings. Values print as Python prints them: None, True, 1.5, 1e-05.
// - join(sep, xs): Python's sep.join(xs), which refuses anything but text.
// - items(): dict.items() in written order.
// - sorted(): a stable sort with strings in code-point order, as Python compares them.
// On data that fits the schemas the output matches Python's byte for byte. On badly typed data Python
// stops with an error; these helpers make this version stop too rather than write broken docs, though
// not always at the same place or with the same message.
// Known gap: JSON.parse cannot tell 1.0 from 1, so a whole number below 1e16 written with a decimal point
// prints as an integer (Python prints 1.0). From 1e16 up it prints as a float (1e+16), which is right for
// floats; integers that large lose digits in JS anyway. No data file has either at present.

class KeyError extends Error {}

const isDict = x => x !== null && typeof x === 'object' && !Array.isArray(x)

const STRICT = new WeakSet()
const STRICT_HANDLER = {
  get(target, key, receiver) {
    if (typeof key === 'symbol' || Object.hasOwn(target, key)) return Reflect.get(target, key, receiver)
    if (Array.isArray(target) && !/^\d+$/.test(key) && key in target) return Reflect.get(target, key, receiver) // map, ...
    throw new KeyError(Array.isArray(target) ? `list index ${key} out of range` : `missing key '${key}'`)
  },
}

// Wraps parsed JSON (deeply, in place) so that reading a missing key or index throws.
function strict(value) {
  if (value === null || typeof value !== 'object' || STRICT.has(value)) return value
  for (const k of Object.keys(value)) value[k] = strict(value[k])
  const proxy = new Proxy(value, STRICT_HANDLER)
  STRICT.add(proxy)
  return proxy
}

function get(obj, key, dflt = null) {
  if (!isDict(obj)) throw new TypeError(`.get('${key}') on something that is not a dict`)
  return Object.hasOwn(obj, key) ? obj[key] : dflt
}

function has(obj, key) {
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.includes(key) // substring or membership
  if (isDict(obj)) return Object.hasOwn(obj, key)
  throw new TypeError(`'${key}' in something that is neither a dict, a list nor text`)
}

function truthy(x) {
  if (Array.isArray(x)) return x.length > 0
  if (x !== null && typeof x === 'object') return Object.keys(x).length > 0
  if (typeof x === 'number') return x !== 0 // NaN counts as true in Python
  return Boolean(x)
}
const given = (obj, key) => truthy(get(obj, key)) // Python's `if d.get(key):`
const or = (a, b) => (truthy(a) ? a : b) // Python's `a or b`

// Python's str() for JSON values. JSON has no undefined, so one here means a field was read from text,
// a number or a list as if it were a dict, which Python refuses.
function str(x) {
  if (typeof x === 'string') return x
  if (x === undefined) throw new TypeError('a field was read from something that is not a dict')
  if (x === null) return 'None'
  if (typeof x === 'boolean') return x ? 'True' : 'False'
  if (typeof x === 'number') return pyNumber(x)
  return repr(x)
}

// Python's repr() of an int or float: shortest round-trip digits, scientific when the exponent is
// below -4 or 16 and up. Whole numbers below 1e16 print as integers (see the known gap above).
function pyNumber(n) {
  if (Number.isNaN(n)) return 'nan'
  if (!Number.isFinite(n)) return n > 0 ? 'inf' : '-inf'
  if (Number.isInteger(n) && Math.abs(n) < 1e16) return String(n)
  const [mant, e] = n.toExponential().split('e')
  const exp = Number(e)
  const digits = mant.replace('-', '').replace('.', '')
  const sign = n < 0 ? '-' : ''
  if (exp < -4 || exp >= 16) {
    const frac = digits.length > 1 ? '.' + digits.slice(1) : ''
    return `${sign}${digits[0]}${frac}e${exp < 0 ? '-' : '+'}${String(Math.abs(exp)).padStart(2, '0')}`
  }
  if (exp < 0) return `${sign}0.${'0'.repeat(-exp - 1)}${digits}`
  return `${sign}${digits.slice(0, exp + 1).padEnd(exp + 1, '0')}.${digits.slice(exp + 1) || '0'}`
}

// Python's repr() of a list, dict or string, for the rare case one lands in an f-string.
function repr(x) {
  if (typeof x === 'string') {
    const q = x.includes("'") && !x.includes('"') ? '"' : "'"
    let s = ''
    for (const ch of x) {
      const cp = ch.codePointAt(0)
      if (ch === q || ch === '\\') s += '\\' + ch
      else if (ch === '\n') s += '\\n'
      else if (ch === '\r') s += '\\r'
      else if (ch === '\t') s += '\\t'
      else if (ch !== ' ' && /[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Cn}\p{Z}]/u.test(ch)) {
        s += cp < 0x100 ? '\\x' + cp.toString(16).padStart(2, '0')
          : cp < 0x10000 ? '\\u' + cp.toString(16).padStart(4, '0') : '\\U' + cp.toString(16).padStart(8, '0')
      } else s += ch
    }
    return q + s + q
  }
  if (Array.isArray(x)) return '[' + x.map(repr).join(', ') + ']'
  if (x !== null && typeof x === 'object') return '{' + Object.entries(x).map(([k, v]) => `${repr(k)}: ${repr(v)}`).join(', ') + '}'
  return str(x)
}

// f`...` stands in for a Python f-string: each ${value} is turned into text as Python's str() would.
const f = (strings, ...values) => strings.reduce((out, s, i) => out + str(values[i - 1]) + s)

// sep.join(xs)
function join(sep, xs) {
  const parts = [...xs]
  parts.forEach((x, i) => {
    if (typeof x !== 'string') throw new TypeError(`join: item ${i} is ${x === null ? 'null' : typeof x}, not text`)
  })
  return parts.join(sep)
}

// dict.items(). JS objects move integer-like keys ("10") to the front, so refuse those rather than
// print them in a different order from the file.
function items(obj) {
  if (!isDict(obj)) throw new TypeError('.items() on something that is not a dict')
  const keys = Object.keys(obj)
  const moved = keys.find(k => /^(0|[1-9]\d*)$/.test(k) && Number(k) < 2 ** 32 - 1)
  if (moved !== undefined) throw new Error(`key '${moved}' looks like a number, so JS would reorder it`)
  return keys.map(k => [k, obj[k]])
}

function compare(a, b) {
  if (typeof a === 'string' && typeof b === 'string') {
    const x = Array.from(a)
    const y = Array.from(b)
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
      const d = x[i].codePointAt(0) - y[i].codePointAt(0)
      if (d) return d
    }
    return x.length - y.length
  }
  return a < b ? -1 : a > b ? 1 : 0
}
const sorted = (xs, key = x => x) => [...xs].sort((a, b) => compare(key(a), key(b)))

// next(x for x in xs if pred(x)), or next(..., default) when a default is passed.
function next(xs, pred, ...dflt) {
  for (const x of xs) if (pred(x)) return x
  if (dflt.length) return dflt[0]
  throw new Error('StopIteration: no matching item')
}

// s.partition(sep)
function partition(s, sep) {
  const i = s.indexOf(sep)
  return i < 0 ? [s, '', ''] : [s.slice(0, i), sep, s.slice(i + sep.length)]
}

// s.strip(): Python's whitespace set differs from trim()'s (it adds \x1c-\x1f and \x85, and leaves out \ufeff).
const strip = s => s.replace(/^[\t\n\v\f\r\x1c-\x20\x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[\t\n\v\f\r\x1c-\x20\x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$/g, '')
// s.title() for the plain words it is used on here.
const titleCase = s => s.replace(/[\p{Lu}\p{Ll}\p{Lt}]+/gu, w => { const [c, ...rest] = w; return c.toUpperCase() + rest.join('').toLowerCase() })
// s.isdigit() for ASCII digits (the paths it is used on are ASCII).
const isdigit = s => /^[0-9]+$/.test(s)

// Path(name).stem
function stem(name) {
  const i = name.lastIndexOf('.')
  return i > 0 && i < name.length - 1 ? name.slice(0, i) : name
}

// ------------------------------------------------------------------ loading

let ROOT, VOCABS, L, VL, REF_KINDS, REGISTRY, WRITTEN, VERSION, STATUS

const UTF8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }) // like read_text(encoding="utf-8")

function readJson(file) {
  return strict(JSON.parse(UTF8.decode(fs.readFileSync(file))))
}

function load(p) {
  return readJson(path.join(ROOT, p))
}

// sorted((ROOT / dir).glob("*.json"))
function listJson(dir) {
  const full = path.join(ROOT, dir)
  if (!fs.existsSync(full)) return []
  return sorted(fs.readdirSync(full).filter(n => n.endsWith('.json'))).map(n => path.join(full, n))
}

function esc(s) {
  s = str(s).replaceAll('|', '\\|').replaceAll('\n', ' ')
  const parts = s.split('`')
  for (let i = 0; i < parts.length; i += 2) { // outside code spans, so GitHub doesn't eat <game> as an HTML tag
    parts[i] = parts[i].replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  }
  return join('`', parts)
}

function loadShared(root) {
  ROOT = root
  VOCABS = strict(Object.fromEntries(listJson('data/vocab').map(file => [stem(path.basename(file)), readJson(file)])))
  L = strict(Object.fromEntries(items(VOCABS).map(([vid, v]) => [vid, Object.fromEntries(v.terms.map(t => [t.id, t.label]))])))
  VL = strict(Object.fromEntries(items(VOCABS).map(([vid, v]) => [vid, v.label])))
  REF_KINDS = load('schemas/common.schema.json')['x-ref-kinds']
  REGISTRY = strict(Object.fromEntries(load('data/pattern-registry.json').patterns.map(p => [p.id, p])))
  WRITTEN = strict(Object.fromEntries(listJson('data/patterns').map(file => { const p = readJson(file); return [p.id, p.name] })))
  VERSION = items(VOCABS)[0][1].version // the word lists share one version; the validator checks that they agree
  STATUS = items(VOCABS).every(([, v]) => v.status === 'approved') ? 'approved' : 'draft' // approved only once every list is
}

function patternLabel(pid) {
  if (has(WRITTEN, pid)) return WRITTEN[pid]
  if (has(REGISTRY, pid)) return REGISTRY[pid].name + ' (planned)'
  return pid.replaceAll('-', ' ') + ' (not in the registry)'
}

// Plain seat wording for the samples (seat-role labels nest brackets badly inside table cells).
const SEAT_TXT = strict({
  'driver': 'driver', 'gunner': 'gunner', 'commander': 'commander',
  'passenger-cargo': 'passenger seat (cargo only)',
  'passenger-firing': 'passenger seat (fires their own weapon)',
  'passenger-module': 'passenger seat (sets the weapon)',
})

function lab(vid, ids) {
  if (typeof ids === 'string') return get(get(L, vid, {}), ids, ids)
  return join(', ', [...ids].map(i => get(get(L, vid, {}), i, i))) || 'none'
}

// patternNames is unused, as in the Python version: written patterns come from WRITTEN.
function refText(ref, unitNames = null, patternNames = null) {
  let [kind, , rest] = partition(ref, ':')
  let cmp = ''
  if (rest.startsWith('<=') || rest.startsWith('>=')) [cmp, rest] = [rest.slice(0, 2), rest.slice(2)]
  const cmpTxt = get({ '<=': 'at most ', '>=': 'at least ' }, cmp, '')
  if (kind === 'unit') return get(or(unitNames, {}), rest, rest)
  if (kind === 'pattern') {
    if (has(WRITTEN, rest)) return WRITTEN[rest] + ' (pattern)'
    if (has(REGISTRY, rest)) return REGISTRY[rest].name + ' (planned pattern)'
    return rest.replaceAll('-', ' ') + ' (pattern not in the registry)'
  }
  if (kind === 'passengers') return f`${cmpTxt}${rest} passenger seat(s)`
  const vid = get(get(REF_KINDS, kind, {}), 'vocab')
  const label = truthy(vid) ? get(get(L, vid, {}), rest, rest) : rest
  const kindLabel = get({
    'hits': 'can hit', 'target': 'is a target of type', 'armour-class': 'armour', 'weapon': 'weapon',
    'mobility-trait': 'trait', 'weapon-trait': 'weapon trait', 'delivery': 'delivery', 'mount': 'mount',
    'damage': 'damage', 'class': 'class', 'role': 'role', 'speed': 'speed', 'size': 'size',
    'range': 'range', 'tier': 'tier', 'body': 'body', 'crew': 'crew', 'nature': 'nature',
    'category': 'pattern category', 'mobility': 'mobility', 'armour-model': 'armour model',
    'handling': 'handling', 'resource': 'resource', 'sight': 'sight', 'sensor': 'sensor',
  }, kind, kind)
  if (kind === 'hits' || kind === 'target') return f`${kindLabel} ${label.toLowerCase()}`
  return f`${cmpTxt}${label} (${kindLabel})`
}

// ------------------------------------------------------------------ vocabularies

// The classes a generated card can have: every class in the word list except those kept for research only.
const generatorClasses = () => VOCABS.classes.terms.filter(t => get(t, 'source_only') !== true).map(t => t.id)

// A class_rarity map as text, rarest last: 'uncommon on: Hovercraft; rare on: Aircraft, Drone / support'.
function classRarityText(cr) {
  const parts = []
  for (const r of VOCABS.rarity.terms) {
    const cls = items(cr).filter(([, v]) => v === r.id).map(([c]) => c)
    if (cls.length) parts.push(f`${r.label.toLowerCase()} on: ${lab('classes', cls)}`)
  }
  return join('; ', parts)
}

function rulesText(t) {
  const parts = []
  if (given(t, 'classes')) {
    const cl = t.classes
    const set = new Set(cl)
    parts.push('classes: ' + (generatorClasses().every(c => set.has(c)) ? 'all' : lab('classes', cl)))
  }
  if (given(t, 'class_rarity')) parts.push(classRarityText(t.class_rarity))
  for (const [k, h] of [['default_damage', ['damage-types', 'default damage']], ['default_aim', ['aim-models', 'default mount']],
    ['default_delivery', ['weapon-delivery', 'default delivery']], ['default_range', ['range-bands', 'default range']],
    ['default_handling', ['handling', 'handling']], ['target_type', ['target-types', 'counts as']]]) {
    if (given(t, k)) parts.push(f`${h[1]}: ${lab(h[0], t[k]).toLowerCase()}`)
  }
  for (const [vid, ids] of items(or(get(t, 'allowed'), {}))) {
    parts.push(f`only with ${get(VL, vid, vid).toLowerCase()}: ${lab(vid, ids)}`)
  }
  for (const [vid, ids] of items(or(get(t, 'excluded'), {}))) {
    parts.push(f`never with ${get(VL, vid, vid).toLowerCase()}: ${lab(vid, ids)}`)
  }
  for (const g of or(get(t, 'requires'), [])) {
    parts.push('needs ' + join(' or ', g.map(r => refText(r))))
  }
  for (const [k, h] of [['strong_vs', 'strong vs'], ['weak_vs', 'weak vs'], ['immune', 'no effect on']]) {
    if (given(t, k)) parts.push(f`${h} ` + join(', ', t[k].map(r => refText(r))))
  }
  if (given(t, 'min_tier')) parts.push(f`from ${L.tiers[t.min_tier]}`)
  if (get(t, 'uses_key') === true) {
    parts.push('uses a key' + (given(t, 'pattern') ? f` (pattern: ${patternLabel(t.pattern)})` : ''))
  }
  if (given(t, 'seats')) parts.push(f`seats: ${lab('seat-roles', t.seats)}; players ${t.min_players}-${t.max_players}`)
  if (has(t, 'max_keys')) {
    parts.push(f`max ${t.max_keys} keys, ${t.max_passive} passive, ${t.max_keys_per_seat} keys per seat`)
  }
  if (given(t, 'severity')) parts.push(f`severity: ${t.severity}`)
  if (given(t, 'weights')) {
    parts.push(f`from spice ${t.min_spice}; weights at spice 1-5: ${join(', ', t.weights.map(w => str(w)))}`)
  }
  return join('; ', parts)
}

function vocabDocs() {
  const vocabs = items(VOCABS).map(([, v]) => v)
  const order = ['classes', 'tiers', 'faction-flavours', 'roles', 'mobility', 'bodies', 'weapon-families', 'damage-types',
    'armour-classes', 'crew-models']
  const core = sorted(vocabs.filter(v => v.group === 'core'), v => (order.includes(v.id) ? order.indexOf(v.id) : 99))
  const supporting = sorted(vocabs.filter(v => v.group === 'supporting'), v => v.label)
  const out = [GEN_NOTE, f`# Vocabularies (v${VERSION}, ${STATUS})\n`,
    'Fixed word lists. Every source unit, pattern and generated card may only use these terms, and the validator rejects anything else. ' +
    'Ids (in `code`) are what the data stores; labels are what the app shows.\n',
    '- **Core** lists are the ten the brief asks for. **Supporting** lists make them usable: scales, aim, traits, seats and so on.',
    "- **Rules** say which terms can go together. They bind generated cards (so the generator can't roll tracks on an aircraft). " +
    "Real units that break them are recorded as they are and listed as 'atypical'. Real games breaking our rules is useful spice material, and evidence for relaxing a rule. " +
    "A term's classes are every class it is physically possible for; a class left out is a hard ban.",
    '- **Rarity** feeds the spice control: common terms appear at every spice level, rare ones only when spice is turned up. ' +
    "A part that is possible but unusual for a class has its own rarity there ('rare on: Aircraft' in the rules), so cross-overs such as a flamethrower on an aircraft appear only at high spice.",
    "- **Typed links** such as 'at most Small (size)' or 'can hit high air' point at other terms; see [fields](fields.md).",
    "- **'Seen in'** examples illustrate a term and are not cited here; the research run cites them on the units.\n",
    f`${vocabs.length} lists, ${vocabs.reduce((n, v) => n + v.terms.length, 0)} terms.\n`,
    '## Contents\n']
  for (const [group, vs] of [['Core', core], ['Supporting', supporting]]) {
    out.push(f`**${group}:** ` + join(' · ', vs.map(v => f`[${v.label}](#${v.id}) (${v.terms.length})`)) + '\n')
  }
  for (const [group, vs] of [['Core vocabularies', core], ['Supporting vocabularies', supporting]]) {
    out.push(f`## ${group}\n`)
    for (const v of vs) {
      out.push(f`<a id="${v.id}"></a>\n### ${v.label} (\`${v.id}\`)\n`)
      out.push(v.description + '\n')
      if (v.id === 'faction-flavours') {
        for (const t of v.terms) {
          out.push(f`#### ${t.label} (\`${t.id}\`): ${t.description}\n`)
          out.push('- **Themes:** ' + join('; ', t.themes) + '.')
          for (const [vid, ids] of items(t.favoured)) {
            out.push(f`- **Favoured ${VL[vid].toLowerCase()}:** ${lab(vid, ids)}.`)
          }
          for (const [vid, ids] of items(get(t, 'avoided', {}))) {
            out.push(f`- **Held back until spice ${t.avoided_until_spice} (${VL[vid].toLowerCase()}):** ${lab(vid, ids)}.`)
          }
          out.push(f`- **Name style:** ${t.name_style}\n`)
        }
        out.push(...tieBreakLines(v))
        continue
      }
      const hasRules = v.terms.some(t => rulesText(t))
      const hasRarity = v.terms.some(t => given(t, 'rarity'))
      const heads = ['Id', 'Label', 'Meaning', ...(hasRules ? ['Rules'] : []), ...(hasRarity ? ['Rarity'] : [])]
      out.push('| ' + join(' | ', heads) + ' |')
      out.push('|' + '---|'.repeat(heads.length))
      for (const t of v.terms) {
        let meaning = t.description
        if (given(t, 'aliases')) meaning += f` Also called: ${join(', ', t.aliases)}.`
        if (given(t, 'notes')) meaning += f` *Note:* ${t.notes}`
        if (given(t, 'source_rule')) meaning += f` *Coding rule:* ${t.source_rule}`
        if (given(t, 'replaces')) meaning += f` *Replaces:* ${join(', ', t.replaces.map(r => f`\`${r}\``))}.`
        if (given(t, 'examples')) meaning += ' *Seen in:* ' + join('; ', t.examples) + '.'
        if (given(t, 'source_only')) meaning += ' *(research only)*'
        const row = [f`\`${t.id}\``, esc(t.label), esc(meaning)]
        if (hasRules) row.push(esc(rulesText(t)))
        if (hasRarity) row.push(get(t, 'rarity', ''))
        out.push('| ' + join(' | ', row) + ' |')
      }
      out.push('')
      out.push(...tieBreakLines(v))
    }
  }
  return join('\n', out) + '\n'
}

// A word list's tie-break rules as Markdown lines, or no lines when it has none.
function tieBreakLines(v) {
  if (!given(v, 'tie_breaks')) return []
  return ['**Tie-breaks** (when two terms seem to fit a source unit):\n',
    ...v.tie_breaks.map(tb => f`- ${join(' or ', tb.terms.map(x => tieTermText(v.id, x)))}: ${tb.rule}`), '']
}

// A term named in a tie-break rule: its label, with its list's name when it is from another list.
function tieTermText(listId, x) {
  const [lid, id] = x.includes(':') ? x.split(':') : [listId, x]
  const label = f`*${L[lid][id]}*`
  return lid === listId ? label : f`${label} (${VL[lid].toLowerCase()})`
}

// ------------------------------------------------------------------ fields

const SCHEMAS = [
  ['source-unit.schema.json', 'Source unit', 'One researched unit from a real game. File: `data/units/<game>.json`.', '#/$defs/unit'],
  ['pattern.schema.json', 'Mechanic pattern', 'A reusable building block abstracted from units. File: `data/patterns/<pattern-id>.json`, one per pattern.', '#'],
  ['concept-card.schema.json', 'Concept card', 'One generated unit concept (Phase 2). Example: [docs/examples/concept-card.example.json](examples/concept-card.example.json).', '#'],
  ['board.schema.json', 'Board', 'The saved board (Phase 3): a version number for migrations and the cards on it.', '#'],
  ['game.schema.json', 'Game', 'One entry in the games registry, `data/games.json`.', '#/$defs/game'],
  ['pattern-registry.schema.json', 'Pattern registry', 'The shared list of pattern ids, `data/pattern-registry.json`.', '#'],
  ['vocabulary.schema.json', 'Word list', 'One fixed word list, `data/vocab/<list>.json`, with the fields each term may carry.', '#'],
]
const HINTS = strict({
  slug: 'id', unitId: 'unit id', ref: 'typed link', rating: 'term', confidence: 'term', relation: 'link + reason',
  source: 'source', review: 'group', cnf: 'conditions', points: 'group',
})
const SKIP = new Set(['$schema'])

function fieldsDocs() {
  const schemas = strict(Object.fromEntries(listJson('schemas').map(file => [path.basename(file), readJson(file)])))

  function resolve(schemaName, ref) {
    let doc, ptr
    if (ref.startsWith('#')) [doc, ptr] = [schemaName, ref.slice(1)]
    else [doc, , ptr] = partition(ref, '#')
    let node = schemas[doc]
    for (const part of ptr.split('/').filter(p => p)) node = node[part]
    return [doc, node]
  }

  const rows = []

  function typ(node) {
    if (has(node, 'enum')) return 'one of ' + join(', ', node.enum.map(x => f`\`${x}\``))
    const t = get(node, 'type')
    if (Array.isArray(t)) {
      const base = t.filter(x => x !== 'null')
      const s = base.length ? get({ string: 'text' }, base[0], base[0]) : ''
      return s + (t.includes('null') ? ' or empty' : '')
    }
    return get({ string: 'text' }, t, or(t, ''))
  }

  function reqTxt(node, required) {
    if (required) return 'yes'
    if (given(node, 'x-required-when')) return 'when ' + node['x-required-when']
    if (given(node, 'x-required-unless')) return 'unless ' + node['x-required-unless']
    return ''
  }

  // fieldPath is `path` in the Python version.
  function walk(schemaName, node, fieldPath, required, depth = 0, hint = null, item = false) {
    if (has(node, '$ref') && depth < 8) {
      const ref = node.$ref
      if (ref === 'concept-card.schema.json') {
        rows.push([fieldPath, 'concept card', reqTxt(node, required), '', 'The full concept card (see above).'])
        return
      }
      const [sn, target] = resolve(schemaName, ref)
      const merged = strict({ ...target, ...Object.fromEntries(Object.entries(node).filter(([k]) => k !== '$ref')) })
      return walk(sn, merged, fieldPath, required, depth + 1, ref.split('/').at(-1), item)
    }
    if (has(node, 'oneOf')) {
      const opts = node.oneOf.filter(o => get(o, 'type') !== 'null')
      const o = opts[0]
      const [sn, target] = has(o, '$ref') ? resolve(schemaName, o.$ref) : [schemaName, o]
      const description = strip(or(get(node, 'description'), get(target, 'description', '')) + ' May be empty.')
      return walk(sn, strict({ ...target, description }), fieldPath, required, depth + 1, null, item)
    }
    const t = get(node, 'type')
    let desc = get(node, 'description', '')
    const voc = get(node, 'x-vocab', '')
    if (get(node, 'x-provenance') === 'proposal') desc = strip('*Proposal, not a sourced fact.* ' + desc)
    if (!truthy(desc) && truthy(voc)) desc = f`A term from *${get(VL, voc, voc)}*.`
    if (t === 'object' && has(node, 'properties')) {
      if (fieldPath && !item) rows.push([fieldPath, 'group', reqTxt(node, required), '', desc])
      const req = new Set(get(node, 'required', []))
      for (const [k, sub] of items(node.properties)) {
        if (SKIP.has(k)) continue
        walk(schemaName, sub, fieldPath ? `${fieldPath}.${k}` : k, req.has(k), depth)
      }
      return
    }
    if (t === 'array') {
      const itemSchema = get(node, 'items', {}) // `items` in the Python version
      const target = has(itemSchema, '$ref') && itemSchema.$ref !== 'concept-card.schema.json'
        ? resolve(schemaName, itemSchema.$ref)[1] : itemSchema
      const lim = []
      if (has(node, 'minItems')) lim.push(f`min ${node.minItems}`)
      if (has(node, 'maxItems')) lim.push(f`max ${node.maxItems}`)
      const lims = lim.length ? ` (${join(', ', lim)})` : ''
      if ((get(target, 'type') === 'object' || has(target, 'properties')) && !get(itemSchema, '$ref', '').includes('relation')) {
        rows.push([fieldPath + '[]', 'list of groups' + lims, reqTxt(node, required), '', or(desc, get(target, 'description', ''))])
        walk(schemaName, itemSchema, fieldPath + '[]', false, depth, null, true)
        return
      }
      const ivoc = get(target, 'x-vocab', '')
      let itype
      if (has(itemSchema, '$ref')) itype = get(HINTS, itemSchema.$ref.split('/').at(-1), 'item')
      else if (truthy(ivoc)) itype = 'term'
      else if (get(target, 'type') === 'array') itype = 'list'
      else itype = or(typ(target), 'text')
      let idesc = or(desc, has(itemSchema, '$ref') ? '' : get(target, 'description', ''))
      if (!truthy(idesc) && truthy(ivoc)) idesc = f`Terms from *${get(VL, ivoc, ivoc)}*.`
      rows.push([fieldPath, f`list of ${itype}s${lims}`, reqTxt(node, required), ivoc, idesc])
      return
    }
    if (t === 'object' && has(node, 'additionalProperties') && !has(HINTS, hint)) {
      rows.push([fieldPath, 'map', reqTxt(node, required), '', desc])
      return
    }
    let ty = typ(node)
    if (has(HINTS, hint)) {
      ty = HINTS[hint] + (Array.isArray(get(node, 'type')) && node.type.includes('null') ? ' or empty' : '')
      if (desc === get(get(schemas['common.schema.json'].$defs, hint, {}), 'description')) {
        desc = fieldPath.endsWith('.ref') ? '' : desc
      }
    } else if (truthy(voc)) {
      ty = 'term' + (Array.isArray(t) && t.includes('null') ? ' or empty' : '')
    }
    if (get(node, 'format') === 'uri') ty = 'URL'
    if (['integer', 'number'].includes(get(node, 'type')) && (has(node, 'minimum') || has(node, 'maximum'))) {
      ty = f`${ty} (${get(node, 'minimum', '')}-${get(node, 'maximum', '')})`
    }
    rows.push([fieldPath, or(ty, ''), reqTxt(node, required), voc, desc])
  }

  const common = schemas['common.schema.json']
  const kinds = join(', ', items(common['x-ref-kinds']).map(([k, v]) => f`\`${k}\` (${v.means})`))
  const out = [GEN_NOTE, f`# Field reference (v${VERSION}, ${STATUS})\n`,
    'Every field of every record type, generated from the JSON schemas in `schemas/`. ' +
    '**Vocabulary** names the fixed word list a field draws from (see [vocabularies](vocabularies.md)).\n',
    '## Conventions\n',
    '- **Ids.** Lower-case, ASCII, words joined by dashes; apostrophes and full stops dropped, `&` becomes `and`, numbers and roman numerals kept (`mammoth-mk-ii`, `v4-rocket-launcher`). Unit ids are `<game>.<faction>.<slug>`. The slug is the in-game name by these rules, with a final word such as Squad or Team dropped (Riflemen Squad -> `riflemen`). ' +
    'Pattern ids are generic English, verb first (`infest-vehicle`). Expansions are never game ids. The faction id `shared` is reserved for units every side can field. ' +
    'A link to a unit not yet researched (a rider, a rival in matchups) uses the id its entry would get, and a lineage uses that slug.',
    '- **Typed links** are written `kind:id`, such as `role:anti-air`, `size:<=small` or `hits:high-air`. A link always describes a unit: in strengths, weaknesses and pattern requirements it describes the unit itself; in *counters* the unit it beats; in *countered by* the unit that beats it; in combos the teammate. Ranked kinds accept `<=` and `>=`. ' +
    f`Kinds: ${kinds}.`,
    '- **Matchups.** Write the reason first, then pick the link that names the part behind it. ' +
    '(1) Name the other unit the way the sources do: by its job (`role:anti-armour`, `role:anti-air`) when they name a job; by what it fires when they name a weapon (`weapon:machine-gun`) or a kind of harm (`damage:electric`); by what it is (`class:aircraft`, `class:infantry`, `armour-class:heavy`) when they name a kind of unit. When they name only a unit, use the same order for what makes that unit win. When one phrase names the enemy two ways at once (rocket-armed infantry), take the first that fits in this order. ' +
    '(2) For fliers, use `class:aircraft` when the sources mean air units in general; use `target:low-air` or `target:high-air` only when the point holds for one layer. ' +
    '(3) Prefer word-list and pattern links. Add a `unit:` link only for a same-game partner or rival the sources name, next to a word-list or pattern link for the same reason. A link to the unit itself is fine in combos when the sources say it works best in numbers. ' +
    "(4) In strengths and weaknesses, give the unit's own value with no `<=` or `>=` (`range:long`, not `range:>=long`; `passengers:1`, not `passengers:>=1`). Use comparators only in counters, countered by and combos, for a group of units. A link may name a proposal field (a mount, a handling) when the reason itself is sourced. " +
    '(5) Something the unit lacks (no weapon reaches aircraft) is not a link of its own: put the enemy that exploits it in countered by (`class:aircraft`), and if you also list it as a weakness, hang it on the part that causes it and name the gap in the reason. ' +
    '(6) The same enemy may sit in counters and in countered by only when the two reasons name different situations. Otherwise put it where the head-on fight at equal cost ends, and give the tactic that turns it in the reason. ' +
    '(7) Most important first; keep each list short, about two to five. A link to a planned pattern is fine; its warning clears when the pattern is written. ' +
    '(8) A `unit:` link to a unit not yet researched uses the id its entry would get (see Ids).',
    "- **Proposals vs facts.** Fields marked *proposal* (handling, weapon mount, flavour affinity and 'as a player'), weapon and ability seats unless crew.basis is in-game, crew and on-death wherever their basis says 'proposal', and the sight band where sensors.basis says 'proposal', are our design suggestions for a player version. The checker skips them and confidence covers only sourced facts.",
    '- **Weapons vs abilities.** Anything fired with an attack button is a weapon. A shot fired from its own ability button (a grenade, a rocket volley on a cooldown) is an ability, not a weapon. Abilities are counted by the rule under `abilities[]` below. ' +
    'A passive or triggered effect is its own ability only when that rule asks for one: Paired entries asks for it, or the source names the effect and it adds a mechanic. ' +
    "An effect that is part of how a weapon works (an infester hidden inside its host, or escaping when the host dies) stays in that weapon's summary and patterns. " +
    'A swap is an ability only when the source lists it as an ability or command with its own name (Electro-Stasis Ray, Leech Beam, special-ammo commands). ' +
    "Switching a seat's weapons with number keys or a scroll wheel, as in shooters, is not: each weapon is its own primary, secondary or option entry. " +
    "A weapon may link a pattern whose generator lists only ability kinds (the drone's claws link `infest-vehicle`). The generator makes that an ability on a card, so do not add one to the source unit. Unarmed units have an empty weapon list.",
    '- **Weapon entries.** Count weapon entries by these rules. ' +
    '(1) One in-game weapon is one entry, even when it acts differently against different targets. Code its family and traits as it works against its main target: the target its primary role is about, or else the one the source names first. ' +
    'Its damage and delivery follow their own rules (`armament[].damage` step 5 when its damage category differs by target; the order under `armament[].delivery`). List every target it can hit, and put the other behaviour in the summary. ' +
    "(2) Among the fixed weapons of one seat, make one entry per family. Copies of one gun are one entry (twin cannons, a squad's five rifles). " +
    "So are different guns of one family that the seat uses on the same attack order, at once or each against its own kind of target (a stock sergeant's carbine with the squad's rifles, a ground battery with an air battery). " +
    'Name them all and list every target any of them can hit. A gun of another family is its own entry. A gun of the same family on its own key or button (a pistol beside a rifle) is its own entry too. ' +
    'Where players set their own fire groups (MechWarrior), each family on a seat is one entry. ' +
    '(3) Rule 2 never merges a loadout choice, or a weapon the unit does not always have. Alternate, passenger, acquired and option weapons are counted by their own rules. ' +
    '(4) Versions of one weapon across the titles of a series entry (the same place in the loadout, renamed or retuned) are one entry. Code the version the Series games convention picks, even when an older version works differently, and put the differences in the summary. ' +
    '(5) Loadout choices for one place are one entry when they would get the same family, damage, delivery, target list and traits. Name them all; range and other numbers may differ. Otherwise each choice is its own entry (Smart Rockets home in, so they are apart). ' +
    '(6) A weapon whose kind depends on the donor is one adaptive acquired entry. Do not list the donors. Weapons gained in fixed steps (salvage crates) get one acquired entry per step that changes the family. ' +
    '(7) Passenger weapons follow the passenger slot rule. Riders who fire their own guns from ports give no entries. ' +
    '(8) Never record an upgrade that only changes numbers, or a weapon the unit gets through a shared mechanic or a universal key (see Shared mechanics). ' +
    'Protection that only shoots down incoming missiles, rockets or shells by itself is not a weapon either: it is the interceptor armour model.',
    "- **Main weapon.** A unit's main weapon is its one primary entry (see `armament[].slot`). Every other weapon the base form always has is secondary, including a second seat's main gun. " +
    "The roles rules read the main weapon from this entry, so it is chosen without looking at the unit's roles.",
    '- **Paired entries.** Some weapons always come with an ability, and both entries of the pair link the same patterns. ' +
    'A weapon swapped in by an ability is an alternate weapon plus a toggle ability (deploy when the unit cannot move in one of the two states). ' +
    "Both link one swap pattern: the mode's own pattern (its `modes[].via`, such as `deploy-siege-mode`) when the swap comes with a mode, otherwise `switch-weapon-mode`. " +
    'Both also link the pattern of what the swapped-in weapon does, if one fits. The weapon that is swapped out links no swap pattern. ' +
    'A weapon gained from a kill or a wreck is an acquired weapon plus a triggered ability, both linking the gain pattern (`leech-weapon-on-kill`). ' +
    'A weapon added by a bought upgrade or research has no ability; it links `upgrade-in-field` when the upgrade reaches units already in the field (bought on the unit, or for all of them at a building), and no pattern when only units built later get it. ' +
    'An ability that a bought upgrade or research adds links `upgrade-in-field` on the same terms as such a weapon (bought on the unit, or researched for all of them at a building, and reaching units already in the field), next to the patterns of what it does. ' +
    'A weapon that comes with a rank links `earn-veterancy`. ' +
    'A unit with passenger seats gets one passive ability for them, source innate, or source upgrade when only a bought upgrade adds the seats. ' +
    'It links `passenger-sets-weapon` when riders set its weapon or fire their own from it (passenger-module or passenger-firing seats), and `carry-passengers` otherwise (passenger-cargo seats), never both; each passenger weapon links `passenger-sets-weapon` too. ' +
    'The weapon used when nobody rides inside is a plain primary and links no passenger pattern. Load and unload buttons stay off (universal keys).',
    "- **Shared mechanics and universal keys.** Some mechanics belong to the game, not the unit: every unit of its class has them, on its side or in the whole game, apart from a few named exceptions. " +
    'Examples are basic orders (move, attack, stop, hold, patrol, stances), Company of Heroes infantry that retreat, reinforce, garrison, capture points, pick up dropped weapons and re-crew abandoned guns, and veterancy that every unit earns. ' +
    "Leave them off the unit's weapons and abilities. " +
    "Each game's list is written once, before any unit of that game is coded, in that batch's registry note (`research/registry-notes/games-r<batch>.md`, section Game-wide mechanics). " +
    'It names each mechanic, the units that lack it, and the pattern it would link or the pattern wanted. Coders follow the list. ' +
    'A coder who meets a mechanic that may be game-wide but is not listed codes it on the unit and adds a fit_note, and the merge pass decides. ' +
    'If this unit does a listed mechanic better or worse than the rest (it captures faster), say so in its strengths or weaknesses. ' +
    'Leave off actions that match one of our universal keys (enter or leave, pick up, shake off, bail out, switch seat, ping, evict passengers), even when the source gives the unit its own button for it, such as Evacuate. ' +
    'But record what only some unit types gain from such an action (vehicles that turn salvage crates into weapons). Also record a button that does more than the key (troops that rappel onto a building and clear it). ' +
    "A side-wide power (a protocol, doctrine or general's power) that changes every unit of a class is left off too. " +
    'A power that gives named unit types a new button or a new effect is recorded on each of them, with source commander-power.',
    "- **Pattern links.** Link a pattern when the ability or weapon gives the player the same interaction and the enemy the same counterplay as the pattern's summary. " +
    "Fiction, delivery and size don't matter (see Granularity). " +
    'Link a second pattern only when it passes the same test on its own: an ECM that hides you from radar and breaks locks links `jam-sensors` and `fire-countermeasures`. ' +
    'Hiding from radar or minimaps, and blocking new locks while hidden, is `jam-sensors`; breaking a lock already made or pulling missiles in flight off you is `fire-countermeasures`. ' +
    'Flares or chaff that also keep new locks off for a moment after firing link `fire-countermeasures` alone. ' +
    'Smoke links `lay-smoke` only when the sources say it blocks sight or aim. ' +
    'Do not link a pattern for a part that only looks like it. `capture-structure` needs an enemy building, so taking over a neutral one is not it. ' +
    'A thrown sticky bomb is `throw-explosive`, not `infest-vehicle`, because nobody latches on. ' +
    'Ending your own burning or disabled state on a key links `heal-self`, unless the patterns group adds a pattern for it. ' +
    'A retreat-to-base order is a game-wide mechanic in most games (see Shared mechanics); where a unit does record one, it links `retreat-to-base`, never `dash` or `brace`. ' +
    "When `research/registry-notes/patterns.md` disagrees with a pattern's summary, the summary wins. " +
    'If nothing fits, keep the ability, leave its patterns empty and add a fit_note (see `abilities[].patterns`). ' +
    'Link any registered id, written or planned. Never edit an existing pattern file: the merge pass keeps its source_units up to date with `npm run sync-patterns`.',
    '- **Granularity.** Same player-facing interaction and same counterplay = one pattern; differences in fiction, delivery or size are variants. Plain mechanics (sprint, healing yourself, stat buff) get generic patterns that stay out of the top-30 list. ' +
    'A pattern that mirrors a word-list term (a weapon trait or family, an armour model, a sensor trait) is the home for the ability version only; a weapon or always-on effect uses the term. ' +
    'A swapped-in weapon is still a weapon, so neither it nor its toggle links a pattern that mirrors its family or trait (a drain beam on a toggle links no `drain-health`). ' +
    'The mirroring patterns are `mark-target`, `suppress-with-fire`, `leave-hazard-zone`, `drain-health`, `launch-drones`, `reveal-area` and `heal-self`.',
    "- **Bands with numbers.** Ratio bands (speed, sight, range) compare a unit with its own game's reference unit, named in the games registry. A ratio exactly on an edge goes to the band nearer medium. " +
    'Threshold bands (price, cooldown) give each band\'s lowest value, so a value exactly on an edge takes the higher band. Divide the figures as the sources give them and round only the result. ' +
    'Only `cost_band.raw` and `mobility.speed_raw` hold stat figures. ' +
    'Every text field of a unit (basis, notes, summaries, uncertain notes and source notes) gives prices, speeds, reaches, sight, cooldowns, damage and armour values as comparisons in words ("about twice the rifle\'s reach", "takes a few seconds", "a little more from behind"), never as figures. ' +
    'Names, patch numbers, dates and counts (seats, missiles) are fine.',
    '- **Stock values.** Every band describes the stock unit at the version researched: no researched or bought upgrades, no veterancy, no temporary buffs, in its default mode. ' +
    'Put what upgrades change in notes, and what another mode changes in modes. ' +
    'An ability or weapon that an upgrade unlocks is still recorded (ability source upgrade, weapon slot acquired); only its bands are taken as unlocked, before further upgrades. ' +
    'Passenger seats that only an upgrade adds are recorded too: put them in crew.passengers and name the upgrade in crew.notes. ' +
    'The body plan describes the stock unit; an add-on turret goes in body.notes. ' +
    "A loadout pick is not an upgrade: each field's own rule says how picks are recorded.",
    '- **Series games.** For a games.json entry of kind series, the counted titles are the lead titles named in `version_researched` and any title named there for the archetype being coded. ' +
    "Only counted titles fill fields; facts from the series' other titles go in notes. " +
    "When counted titles differ, on whether a mechanic exists or on a value, the newest counted title whose sources speak to it decides, at its final patch; give the other version in notes or in the weapon's summary. " +
    'A figure that the source says a later patch of that title changed, without giving the new value, does not count for that title. ' +
    'Where the registry entry says where a kind of fact comes from (MechWarrior speeds from the BattleTechWiki), follow the registry. ' +
    "When one archetype mirrors several models, one per side, take figures from the model of the first faction in the registry's list that is not shared, and say which in notes. " +
    'A matchup may rest on a source about any title, as long as the parts it names exist in a counted title.',
    '- **Copyright.** Paraphrase only, no quoted voice lines or flavour text, no images. Real names are reference only and never reach a generated card.\n']
  for (const [file, title, blurb, ptr] of SCHEMAS) {
    rows.length = 0
    const [sn, node] = resolve(file, ptr)
    walk(sn, node, '', true)
    out.push(f`## ${title}\n\n${blurb} Schema: \`schemas/${file}\`.\n`)
    out.push('| Field | Type | Required | Vocabulary | Meaning |')
    out.push('|---|---|---|---|---|')
    for (const [p, ty, rq, vc, d] of rows) {
      out.push(f`| \`${p}\` | ${esc(ty)} | ${rq} | ${truthy(vc) ? f`\`${vc}\`` : ''} | ${esc(d)} |`)
    }
    out.push('')
  }
  out.push('## Shared parts\n')
  for (const k of ['source', 'relation', 'uncertain', 'fitNote', 'review']) {
    const node = common.$defs[k]
    out.push(f`**${k}**: ${get(node, 'description', '')}\n`)
    out.push('| Field | Type | Required | Vocabulary | Meaning |')
    out.push('|---|---|---|---|---|')
    for (const [fld, sub] of items(node.properties)) {
      let ty = or(typ(sub), has(sub, '$ref') ? 'typed link' : '')
      if (get(sub, 'format') === 'uri') ty = 'URL'
      if (get(sub, 'type') === 'array') ty = 'list'
      if (has(sub, 'x-vocab')) ty = 'term'
      out.push(f`| \`${fld}\` | ${esc(ty)} | ${get(node, 'required', []).includes(fld) ? 'yes' : ''} | ${has(sub, 'x-vocab') ? '`' + sub['x-vocab'] + '`' : ''} | ${esc(get(sub, 'description', ''))} |`)
    }
    out.push('')
  }
  return join('\n', out) + '\n'
}

// ------------------------------------------------------------------ samples

function samplesDocs() {
  // Every unit and pattern is loaded so links to them read as names; only the samples are shown.
  const rel = file => path.relative(ROOT, file).split(path.sep).join('/')
  const allUnits = []
  const allPatterns = []
  const fileOf = {} // record id -> its file, for the intro
  for (const file of listJson('data/units')) {
    for (const u of readJson(file).units) {
      allUnits.push(u)
      fileOf[u.id] = rel(file)
    }
  }
  for (const file of listJson('data/patterns')) {
    const p = readJson(file)
    allPatterns.push(p)
    fileOf[p.id] = rel(file)
  }
  const pick = (all, ids, what) => ids.map(id => {
    const x = next(all, y => y.id === id, null)
    if (x === null) throw new Error(`docs/samples.md: sample ${what} '${id}' is not in the data (SAMPLE_${what.toUpperCase()}S)`)
    return x
  })
  const units = pick(allUnits, SAMPLE_UNITS, 'unit')
  const patterns = pick(allPatterns, SAMPLE_PATTERNS, 'pattern')
  const games = strict(Object.fromEntries(load('data/games.json').games.map(g => [g.id, g])))
  const un = strict(Object.fromEntries(allUnits.map(u => [u.id, u.name])))
  const pn = strict(Object.fromEntries(allPatterns.map(p => [p.id, p.name])))
  const r = ref => refText(ref, un, pn)
  const sampleFiles = [...new Set([...SAMPLE_UNITS, ...SAMPLE_PATTERNS].map(id => fileOf[id]))].map(x => f`\`${x}\``)

  function src(s) {
    return f`[${s.title}](${s.url})`
  }

  const FIELD_WORDS = { can_target: 'targets', cooldown: 'cooldown' }

  // 'armament/3/delivery' -> 'Stun roar (war bear), delivery'; 'countered_by' -> 'Countered by'.
  function pathLabel(u, fieldPath) {
    const parts = fieldPath.split('/')
    if (['armament', 'abilities'].includes(parts[0]) && parts.length > 1 && isdigit(parts[1])) {
      const item = u[parts[0]][Number(parts[1])].name
      const rest = join(' ', parts.slice(2).map(x => get(FIELD_WORDS, x, x.replaceAll('_', ' '))))
      return item + (rest ? ', ' + rest : '')
    }
    const words = join(' ', parts.filter(x => !isdigit(x)).map(x => get(FIELD_WORDS, x, x.replaceAll('_', ' '))))
    const [first = '', ...more] = words // words[:1].upper() + words[1:], by code point
    return first.toUpperCase() + more.join('')
  }

  const rarityFrom = strict(Object.fromEntries(VOCABS.rarity.terms.map(t => [t.id, t.min_spice])))

  function overridesText(o) {
    const bits = []
    if (given(o, 'classes')) bits.push('classes: ' + lab('classes', o.classes))
    if (given(o, 'class_rarity')) bits.push(classRarityText(o.class_rarity))
    if (given(o, 'min_tier')) bits.push('from ' + L.tiers[o.min_tier])
    if (given(o, 'kinds')) bits.push('as: ' + lab('ability-kinds', o.kinds).toLowerCase())
    if (given(o, 'requires')) bits.push('needs ' + join('; and ', o.requires.map(g => join(' or ', g.map(x => r(x))))))
    if (given(o, 'excludes')) bits.push('never with ' + join(', ', o.excludes.map(x => r(x))))
    if (has(o, 'implies')) bits.push('sets first: ' + (join(', ', o.implies.map(x => r(x))) || 'nothing'))
    for (const [key, head] of [['adds_strengths', 'own strengths'], ['adds_weaknesses', 'own weaknesses'], ['counters', 'own counters'], ['countered_by', 'own countered by']]) {
      if (has(o, key)) bits.push(f`${head}: ` + (join('; ', o[key].map(x => f`${x.why} [${r(x.ref)}]`)) || 'none'))
    }
    return join('; ', bits) || '-'
  }

  function gameLabel(g) {
    if (g.startsWith('extra:')) return g.slice(6)
    return get(get(games, g, {}), 'title', g)
  }

  const out = [GEN_NOTE, f`# Sample entries (v${VERSION}, ${STATUS})\n`,
    'The three source units and three mechanic patterns the brief asks for, fully filled in, plus one hand-made concept card showing what the generator will produce. ' +
    f`Rendered from ${join(', ', sampleFiles)} and \`docs/examples/concept-card.example.json\`; ` +
    'the page shows only these samples (listed in `scripts/build-docs.mjs`), not the whole database. Real unit and weapon names are reference only.\n',
    '**How to read it.** *(proposal)* marks our design suggestions for the player version, not sourced facts. ' +
    'The tag in square brackets after each strength, weakness or counter is the coded link the generator uses. ' +
    "'Review: unchecked' means the research run's sampling checker hasn't signed the record yet; this draft's fact-check is summarised in the pull request.\n",
    'Contents: ' + join(' · ', [...units.map(u => f`[${u.name}](#${u.id.replaceAll('.', '-')})`), ...patterns.map(p => f`[${p.name}](#${p.id})`), '[Example concept card](#example-card)']) + '\n']
  out.push('## Source units\n')
  for (const u of units) {
    const g = games[u.game]
    const fac = next(g.factions, fc => fc.id === u.faction).name
    out.push(f`<a id="${u.id.replaceAll('.', '-')}"></a>\n### ${u.name} (\`${u.id}\`)\n`)
    out.push(f`> ${u.memorable}\n`)
    out.push('| Field | Value |\n|---|---|')
    out.push(f`| Game / faction | ${g.title}, ${fac} |`)
    out.push(f`| Flavour affinity | ${lab('faction-flavours', get(u, 'flavour_affinity', []))} |`)
    out.push(f`| Class · nature · availability | ${lab('classes', u.class)} · ${lab('nature', u.nature)} · ${lab('availability', u.availability)} |`)
    out.push(f`| Role | ${lab('roles', u.roles.primary)}; secondary: ${lab('roles', get(u.roles, 'secondary', []))} |`)
    const t = u.tier
    out.push(f`| Tier | ${truthy(t.band) ? lab('tiers', t.band) : 'none'}${given(t, 'gate') ? ' (gate: ' + t.gate + ')' : ''}: ${esc(t.basis)} |`)
    const c = u.cost_band
    out.push(f`| Cost band | ${truthy(c.band) ? lab('cost-bands', c.band) : 'none'}: ${esc(c.basis)} |`)
    const m = u.mobility
    out.push(f`| Mobility | ${lab('mobility', m.base)}; handling: ${lab('handling', m.handling).toLowerCase()} *(proposal)*; traits: ${lab('mobility-traits', get(m, 'traits', []))}; speed: ${lab('speed-bands', m.speed).toLowerCase()}. ${esc(get(m, 'notes', ''))} |`)
    const b = u.body
    out.push(f`| Body | ${lab('bodies', b.plan)}, ${lab('sizes', b.size).toLowerCase()}. ${esc(get(b, 'notes', ''))} |`)
    const a = u.armour
    out.push(f`| Armour | ${lab('armour-classes', a.class)}; model: ${lab('armour-models', a.models)}. ${esc(get(a, 'notes', ''))} |`)
    const se = u.sensors
    out.push(f`| Sensors | ${lab('sight-bands', se.sight)} sight; traits: ${lab('sensor-traits', se.traits).toLowerCase()} (${se.basis}). ${esc(get(se, 'notes', ''))} |`)
    const cr = u.crew
    const pnSeats = given(cr, 'passengers') ? cr.passengers.seats : 0
    const pas = given(cr, 'passengers')
      ? f`; ${pnSeats} ${SEAT_TXT[cr.passengers.kind].replaceAll('passenger seat', pnSeats > 1 ? 'passenger seats' : 'passenger seat')}` : ''
    out.push(f`| Crew | ${lab('crew-models', cr.model)} (${cr.basis})${pas}. ${esc(get(cr, 'notes', ''))} |`)
    out.push(f`| On death | ${lab('on-death', u.on_death.outcomes)} (${u.on_death.basis})${given(u.on_death, 'notes') ? '. ' + esc(u.on_death.notes) : ''} |`)
    out.push(f`| Confidence | ${u.confidence} (review: ${u.review.status}) |\n`)
    out.push('**Armament**\n')
    out.push('| Weapon | Slot | Family | Damage | Mount / delivery / range | Hits | Traits | What it does |')
    out.push('|---|---|---|---|---|---|---|---|')
    for (const w of u.armament) {
      const cond = given(w, 'condition') ? f` *When:* ${w.condition}` : ''
      const pats = given(w, 'patterns') ? f` *Pattern:* ${join(', ', get(w, 'patterns', []).map(p => patternLabel(p)))}.` : ''
      const mdr = join(' / ', [given(w, 'mount') ? lab('aim-models', w.mount).toLowerCase() : '', given(w, 'delivery') ? lab('weapon-delivery', w.delivery).toLowerCase() : '', given(w, 'range') ? lab('range-bands', w.range).toLowerCase() : ''].filter(x => x)) || 'from the kill'
      let slot
      if (w.slot === 'passenger' && str(get(w, 'seat', '')).startsWith('passenger')) {
        slot = SEAT_TXT[w.seat]
      } else {
        slot = w.slot + (given(w, 'seat') ? f` (${SEAT_TXT[w.seat]})` : '')
      }
      let hits = given(w, 'can_target') ? lab('target-types', w.can_target).toLowerCase() : 'from the kill'
      if (get(w, 'affects') === 'allies') hits += ' (allies)'
      out.push(f`| ${esc(w.name)} | ${slot} | ${lab('weapon-families', w.family)} | ${given(w, 'damage') ? lab('damage-types', w.damage) : '-'} | ${mdr} | ${hits} | ${given(w, 'traits') ? lab('weapon-traits', get(w, 'traits', [])) : '-'} | ${esc(w.summary + cond + pats)} |`)
    }
    out.push('\n**Abilities**\n')
    for (const ab of u.abilities) {
      const cd = given(ab, 'cooldown') ? f`, ${lab('cooldown-bands', ab.cooldown).toLowerCase()} cooldown` : ''
      out.push(f`- **${ab.name}** (${lab('ability-kinds', ab.kind).toLowerCase()}${cd}): ${ab.summary} *Pattern:* ${join(', ', ab.patterns.map(p => patternLabel(p)))}.`)
    }
    for (const [k, h] of [['strengths', 'Strengths'], ['weaknesses', 'Weaknesses'], ['countered_by', 'Countered by'], ['counters', 'Counters'], ['combos', 'Notable combos']]) {
      if (given(u, k)) {
        out.push(f`\n**${h}**\n`)
        out.push(...u[k].map(x => f`- ${x.why} *[${r(x.ref)}]*`))
      }
    }
    out.push(f`\n**As a player** *(proposal)***:** ${u.as_player}\n`)
    if (given(u, 'uncertain')) {
      out.push('**Less certain**\n')
      out.push(...u.uncertain.map(x => f`- *${pathLabel(u, x.path)}:* ${x.note}${given(x, 'sources_disagree') ? ' (sources disagree)' : ''}`))
    }
    if (given(u, 'atypical')) {
      out.push('\n**Rule breaks** (kept as the game has them; our word lists would not allow them)\n')
      out.push(...u.atypical.map(x => f`- *${pathLabel(u, x.path)}:* ${x.note}`))
    }
    if (given(u, 'fit_notes')) {
      out.push('\n**Where no word-list term fitted**\n')
      out.push(...u.fit_notes.map(x => f`- *${pathLabel(u, x.path)}* (used ${x.used}${given(x, 'wanted') ? '; wanted ' + x.wanted : ''}): ${x.note}`))
    }
    out.push('\n**Sources**\n')
    out.push(...u.sources.map(s => f`- ${src(s)} (${s.kind}, read ${s.accessed})${given(s, 'note') ? ' - ' + s.note : ''}`))
    out.push('')
  }

  out.push('## Mechanic patterns\n')
  for (const p of patterns) {
    out.push(f`<a id="${p.id}"></a>\n### ${p.name} (\`${p.id}\`)\n`)
    const cats = lab('pattern-categories', p.category) + (given(p, 'also_in') ? f` (also ${lab('pattern-categories', p.also_in)})` : '')
    out.push(f`*Category:* ${cats}. *Also called:* ${join(', ', get(p, 'aliases', []))}. *Shooter fit:* ${p.shooter_fit.score}/5. *Confidence:* ${p.confidence}. *Status:* ${p.status} (review: ${p.review.status}).\n`)
    out.push(f`**What it does.** ${p.summary}\n`)
    out.push(f`**Why it suits Shamble Frontlines.** ${p.shooter_fit.reason}\n`)
    out.push('**Counterplay**\n')
    out.push(...p.counterplay.map(x => f`- ${x}`))
    out.push('\n**Source units in the database:** ' + join(', ', get(p, 'source_units', []).map(x => get(un, x, x))) + '\n')
    for (const [k, h] of [['other_examples', 'Other examples found (to be entered as source units during the research run)'], ['shooter_analogues', 'Shooter analogues (where players already do this)']]) {
      if (given(p, k)) {
        out.push(f`**${h}**\n`)
        out.push(...p[k].map(e => f`- *${gameLabel(e.game)}*, ${e.unit}: ${e.note} (${e.confidence}; ` + join(', ', e.sources.map(s => src(s))) + ')'))
        out.push('')
      }
    }
    const pt = p.player_translation
    out.push('#### Translation to a player-controlled unit\n')
    out.push(pt.summary + '\n')
    for (const [k, h] of [['as_user', 'As the user'], ['as_target', 'As the target'], ['teammates', 'Teammates'],
      ['controls', 'Controls (proposal)'], ['feedback', 'Readability cues'], ['changes_from_rts', 'What changes from the RTS']]) {
      out.push(f`**${h}**\n`)
      out.push(...pt[k].map(x => f`- ${x}`))
      out.push('')
    }
    const tp = p.team_play
    out.push(f`**Team-play potential: ${tp.potential}.** Hooks: ${lab('team-play-hooks', tp.hooks)}. ${tp.notes}\n`)
    const bd = p.build_difficulty
    out.push(f`**Build difficulty: ${bd.level}.**\n`)
    out.push(...bd.notes.map(x => f`- ${x}`))
    out.push('')
    for (const k of ['balance', 'readability']) {
      const rk = p.risks[k]
      out.push(f`**${titleCase(k)} risk: ${rk.level}.**\n`)
      out.push(...rk.notes.map(x => f`- ${x}`))
      out.push('')
    }
    out.push('**Variants the generator can roll**\n')
    out.push('| Variant | From spice | What changes | Rules that differ | Seen in |\n|---|---|---|---|---|')
    out.push(...p.variants.map(v => f`| ${esc(v.name)} (\`${v.id}\`) | ${v.min_spice} | ${esc(v.summary)} | ${esc(overridesText(get(v, 'overrides', {})))} | ${esc(get(v, 'seen_in', ''))} |`))
    const gr = get(p, 'generator')
    if (truthy(gr) && get(rarityFrom, gr.rarity, 1) > 1) {
      out.push(f`\nThe pattern itself is ${gr.rarity}, so on a rolled card these variants appear from spice ${rarityFrom[gr.rarity]} at the earliest.`)
    }
    if (truthy(gr)) {
      out.push('\n**Generator rules**\n')
      const cr = given(gr, 'class_rarity') ? f` (${classRarityText(gr.class_rarity)})` : ''
      out.push(f`- Classes: ${lab('classes', gr.classes)}. From ${L.tiers[gr.min_tier]}. As: ${lab('ability-kinds', gr.kinds).toLowerCase()}, ${gr.slot} slot. Rarity: ${gr.rarity}${cr}. Leans: ${lab('faction-flavours', get(gr, 'flavour_lean', []))}.`)
      if (given(gr, 'requires')) out.push('- Needs: ' + join('; and ', gr.requires.map(g => join(' or ', g.map(x => r(x))))) + '.')
      if (given(gr, 'excludes')) out.push('- Never with: ' + join(', ', gr.excludes.map(x => r(x))) + '.')
      if (given(gr, 'implies')) out.push('- Sets first: ' + join(', ', gr.implies.map(x => r(x))) + '.')
      for (const [k, h] of [['adds_strengths', 'Adds strength'], ['adds_weaknesses', 'Adds weakness'], ['counters', 'Counters'], ['countered_by', 'Countered by']]) {
        for (const x of get(gr, k, [])) out.push(f`- ${h}: ${x.why} *[${r(x.ref)}]*`)
      }
    }
    if (given(p, 'related')) {
      const rel = p.related.map(x => (has(WRITTEN, x.id)
        ? f`${WRITTEN[x.id]} (${x.kind.replaceAll('-', ' ')})`
        : f`${get(get(REGISTRY, x.id, {}), 'name', x.id)} (planned; ${x.kind.replaceAll('-', ' ')})`))
      out.push('- Related: ' + join(', ', rel) + '.')
    }
    if (given(p, 'open_questions')) {
      out.push('\n**Open design questions**\n')
      out.push(...p.open_questions.map(x => f`- ${x}`))
    }
    out.push('')
  }

  const ex = path.join(ROOT, 'docs/examples/concept-card.example.json')
  if (fs.existsSync(ex)) {
    const c = readJson(ex)
    const [P, T] = [c.parts, c.text]
    out.push('<a id="example-card"></a>\n## Example concept card (hand-made)\n')
    const sig = P.signature
    const spat = next(allPatterns, x => x.id === sig.pattern, null)
    const svar = next(get(or(spat, {}), 'variants', []), v => v.id === get(sig, 'variant'), null)
    const srcUnit = next(allUnits, u => c.inspiration.source_units.includes(u.id), null) // `src` in the Python version
    let moved = ''
    if (truthy(srcUnit)) {
      const sfac = next(games[srcUnit.game].factions, fc => fc.id === srcUnit.faction).name
      moved = f` from its source, the ${srcUnit.name} (${sfac}, ${lab('mobility', srcUnit.mobility.base).toLowerCase()}), to ` +
        f`${lab('faction-flavours', P.flavour)} with ${lab('mobility', P.mobility.base).toLowerCase()} movement`
    }
    out.push(f`A hand-written illustration of the card format, not generator output. It moves the *${get(pn, sig.pattern, sig.pattern)}* pattern` +
      f`${truthy(svar) ? ' (' + svar.name.toLowerCase() + ' variant)' : ''}${moved}, and adds one original twist in its signature, *${T.signature.name}* (below).\n`)
    out.push(f`### ${T.name}\n\n> ${T.pitch}\n`)

    const wp = w => {
      if (!truthy(w)) return 'none'
      const dmg = given(w, 'damage') ? lab('damage-types', w.damage).toLowerCase() : 'no damage'
      return f`${lab('weapon-families', w.family)} (${dmg}, ${lab('weapon-delivery', w.delivery).toLowerCase()}, ${lab('range-bands', w.range).toLowerCase()} range; hits ${lab('target-types', w.can_target).toLowerCase()}; ${lab('weapon-traits', w.traits).toLowerCase()})`
    }
    out.push('| Field | Value |\n|---|---|')
    out.push(f`| Class · tier · flavour | ${lab('classes', P.class)} · ${L.tiers[P.tier]} · ${lab('faction-flavours', P.flavour)} |`)
    out.push(f`| Role | ${lab('roles', P.roles.primary)}; secondary: ${lab('roles', P.roles.secondary)} |`)
    out.push(f`| Mobility | ${lab('mobility', P.mobility.base)}, ${lab('handling', P.mobility.handling).toLowerCase()}, ${lab('speed-bands', P.mobility.speed).toLowerCase()} |`)
    out.push(f`| Body | ${lab('bodies', P.body.plan)}, ${lab('sizes', P.body.size).toLowerCase()} |`)
    out.push(f`| Primary | ${wp(P.armament.primary)} |`)
    out.push(f`| Secondary | ${wp(P.armament.secondary)} |`)
    out.push(f`| Armour | ${lab('armour-classes', P.armour.class)}, ${lab('armour-models', P.armour.models).toLowerCase()} |`)
    out.push(f`| Sensors | ${lab('sight-bands', P.sensors.sight)} sight; ${given(P.sensors, 'traits') ? lab('sensor-traits', P.sensors.traits).toLowerCase() : 'no sensor traits'} |`)
    out.push(f`| Crew | ${lab('crew-models', P.crew.model)} |`)
    out.push(f`| Signature | **${T.signature.name}**: ${T.signature.effect} *(pattern: ${get(pn, P.signature.pattern)}, variant ${P.signature.variant}; ${lab('cooldown-bands', P.signature.cooldown).toLowerCase()} cooldown)* |`)
    out.push(f`| Team-play hook | ${T.team_play_hook.text} *(${lab('team-play-hooks', T.team_play_hook.hook)})* |`)
    out.push('| Strengths | ' + join(' ', c.matchups.strengths.map(s => f`${s.why}`)) + ' |')
    out.push('| Weaknesses | ' + join(' ', c.matchups.weaknesses.map(s => f`${s.why}`)) + ' |')
    out.push('| Countered by | ' + join(' ', c.matchups.countered_by.map(s => f`${s.why}`)) + ' |')
    out.push('| Counters | ' + join(' ', c.matchups.counters.map(s => f`${s.why}`)) + ' |')
    out.push('| Counterplay | ' + join(' ', c.matchups.counterplay) + ' |')
    out.push(f`| How it plays | **As the user:** ${T.how_it_plays.as_user} **As the target:** ${T.how_it_plays.as_target} **Teammates:** ${T.how_it_plays.teammates} |`)
    out.push('| Controls | ' + join('; ', T.how_it_plays.controls.map(x => f`${x.input}: ${x.action}`)) + ' |')
    out.push(f`| Tells | ${T.how_it_plays.tells} |`)
    const closest = truthy(svar) && given(svar, 'seen_in') ? f` (${svar.name.toLowerCase()} variant; closest real examples: ${esc(svar.seen_in)})` : ''
    out.push(f`| Inspiration | ${get(pn, c.inspiration.patterns[0])}${closest}; ${join(', ', c.inspiration.source_units.map(x => get(un, x, x)))} |`)
    const b = c.balance
    const maxKeys = next(VOCABS.tiers.terms, t => t.id === P.tier).max_keys
    const flags = truthy(b.flags) ? f`flags: ${lab('balance-flags', b.flags)}` : 'no flags'
    out.push(f`| Balance hints | cost ${lab('cost-bands', b.cost_band).toLowerCase()}, power ${b.power}/10, complexity ${b.complexity}/10, ${b.keys} keys (${L.tiers[P.tier]} allows ${maxKeys}), ${flags} |`)
    out.push(f`| Seed | \`${c.seed}\` at spice ${c.spice} |\n`)
  }
  return join('\n', out) + '\n'
}

// ------------------------------------------------------------------ build, check, write

// Builds the three pages in memory: { 'docs/vocabularies.md': text, ... }.
export function buildDocs(root = REPO_ROOT) {
  loadShared(path.resolve(root))
  const docs = {
    'docs/vocabularies.md': vocabDocs(),
    'docs/fields.md': fieldsDocs(),
    'docs/samples.md': samplesDocs(),
  }
  for (const [rel, text] of Object.entries(docs)) {
    // Python refuses to write a lone surrogate as UTF-8; Node would quietly write U+FFFD instead.
    if (!text.isWellFormed()) throw new Error(`${rel}: text has a lone surrogate and cannot be written as UTF-8`)
  }
  return docs
}

// The pages whose file on disk is missing or differs from the built text.
export function staleDocs(docs, root = REPO_ROOT) {
  return Object.keys(docs).filter(rel => {
    try {
      return !fs.readFileSync(path.join(root, rel)).equals(Buffer.from(docs[rel], 'utf8'))
    } catch {
      return true
    }
  })
}

export function writeDocs(docs, root = REPO_ROOT) {
  for (const [rel, text] of Object.entries(docs)) {
    const file = path.join(root, rel)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, text, 'utf8')
  }
}

const USAGE = 'usage: node scripts/build-docs.mjs [--root <dir>] [--check]'

function parseArgs(argv) {
  const opts = { root: REPO_ROOT, check: false, help: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--check') opts.check = true
    else if (a === '--root') {
      if (!argv[i + 1]) throw new Error('--root needs a directory')
      opts.root = path.resolve(argv[++i])
    } else if (a.startsWith('--root=')) opts.root = path.resolve(a.slice('--root='.length))
    else if (a === '-h' || a === '--help') opts.help = true
    else throw new Error(`unknown argument: ${a}`)
  }
  return opts
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let opts
  try {
    opts = parseArgs(process.argv.slice(2))
  } catch (e) {
    console.error(`${e.message}\n${USAGE}`)
    process.exit(2)
  }
  if (opts.help) {
    console.log(USAGE)
  } else if (opts.check) {
    const stale = staleDocs(buildDocs(opts.root), opts.root)
    for (const rel of stale) console.log(`out of date: ${rel}`)
    console.log(stale.length
      ? `${stale.length} of ${OUTPUTS.length} generated doc(s) out of date; run npm run docs`
      : `all ${OUTPUTS.length} generated docs up to date`)
    process.exitCode = stale.length ? 1 : 0
  } else {
    writeDocs(buildDocs(opts.root), opts.root)
    console.log('docs written')
  }
}
