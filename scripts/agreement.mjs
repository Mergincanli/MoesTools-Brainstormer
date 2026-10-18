// Measures how often independent coders agree, field by field, when they fill in the same units: the yardstick of the
// calibration pilot (step 2 of the plan). A field where coders agree less than the threshold (default 0.8) needs a
// sharper rule, a merged term or a tie-break rule before the word lists are frozen.
//
// Usage: node scripts/agreement.mjs <dir> [--reference <dir>] [--threshold 0.8] [--json] [--vocab <dir>]
//        node scripts/agreement.mjs --table <file> [--threshold 0.8] [--json] [--vocab <dir>]
//
// <dir> holds one folder per coder (for example coder-a/, coder-b/, coder-c/), each with unit files in the format of
// data/units/. Units are matched by id. --reference <dir> is a folder of unit files to compare each coder with, such as
// data/units. --table <file> reads codings that are not units: { "coders": { "<coder>": { "<item>": { "<field>":
// value } } }, "fields": { "<field>": { "list": "<word list>" } } }; a list value is compared as a set, a number as a
// number, anything else as one value, and "fields" (optional) names the ranked word list a field's terms come from.
//
// How agreement is counted. For each field and each unit coded by two or more coders, every pair of coders counts
// once. One-value fields: the pair agrees when both values are equal (two missing values agree). Fields on a ranked
// word list (tier, price, speed, size, sight, range, cooldown, armour) and counts also report how many pairs are at
// most one step apart. Set fields (lists, such as secondary roles or weapon traits): the pair scores the overlap of
// its two sets, the size of the intersection over the size of the union (two empty sets score 1). A field's agreement
// is the mean over all its pairs. Fields marked 'proposal' are our design suggestions, not sourced facts; matchup
// lists (strengths, counters and so on) are open choices and are measured for information only, without the threshold.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const weapons = u => u.armament || []
const flat = xs => [...new Set(xs.flat().filter(v => v !== undefined && v !== null))].sort()
const each = (xs, f) => flat((xs || []).map(x => [].concat(f(x) ?? [])))
const mainWeapon = u => weapons(u).find(w => w.slot === 'primary') ?? weapons(u)[0]

const one = (p, get, o = {}) => ({ path: p, kind: 'one', get, ...o })
const set = (p, get, o = {}) => ({ path: p, kind: 'set', get, ...o })
const count = (p, get, o = {}) => ({ path: p, kind: 'one', numeric: true, get, ...o })
const refs = (p, key) => set(p, u => each(u[key], r => r.ref), { group: 'matchups', gate: false })

/** The coded fields of a source unit that agreement is measured on. Free text (names, notes, summaries) is left out. */
export const UNIT_FIELDS = [
  one('class', u => u.class),
  one('nature', u => u.nature),
  one('availability', u => u.availability),
  one('roles.primary', u => u.roles?.primary),
  set('roles.secondary', u => u.roles?.secondary),
  set('roles (primary or secondary)', u => flat([u.roles?.primary, u.roles?.secondary || []])),
  one('tier.band', u => u.tier?.band, { list: 'tiers' }),
  one('cost_band.band', u => u.cost_band?.band, { list: 'cost-bands' }),
  one('mobility.base', u => u.mobility?.base),
  one('mobility.handling', u => u.mobility?.handling, { proposal: true }),
  set('mobility.traits', u => u.mobility?.traits),
  one('mobility.speed', u => u.mobility?.speed, { list: 'speed-bands' }),
  one('body.plan', u => u.body?.plan),
  one('body.size', u => u.body?.size, { list: 'sizes' }),
  count('body.count', u => u.body?.count ?? 1),
  one('armour.class', u => u.armour?.class, { list: 'armour-classes' }),
  set('armour.models', u => u.armour?.models),
  one('sensors.sight', u => u.sensors?.sight, { list: 'sight-bands', proposal: 'partly' }),
  set('sensors.traits', u => u.sensors?.traits, { proposal: 'partly' }),
  one('crew.model', u => u.crew?.model, { proposal: 'partly' }),
  one('crew.solo_fallback', u => u.crew?.solo_fallback, { proposal: 'partly' }),
  set('crew.seats', u => each(u.crew?.seats, s => s.role), { proposal: 'partly' }),
  count('crew.passengers.seats', u => u.crew?.passengers?.seats ?? 0),
  one('crew.passengers.kind', u => u.crew?.passengers?.kind),
  set('resources', u => u.resources),
  set('on_death.outcomes', u => u.on_death?.outcomes, { proposal: 'partly' }),
  set('flavour_affinity', u => u.flavour_affinity, { proposal: true }),
  count('armament (number of weapons)', u => weapons(u).length),
  set('armament.slot', u => each(u.armament, w => w.slot)),
  set('armament.family', u => each(u.armament, w => w.family)),
  set('armament.damage', u => each(u.armament, w => w.damage)),
  set('armament.mount', u => each(u.armament, w => w.mount), { proposal: true }),
  set('armament.seat', u => each(u.armament, w => w.seat), { proposal: true }),
  set('armament.delivery', u => each(u.armament, w => w.delivery)),
  set('armament.range', u => each(u.armament, w => w.range)),
  set('armament.can_target', u => each(u.armament, w => w.can_target)),
  set('armament.traits', u => each(u.armament, w => w.traits)),
  one('main weapon.family', u => mainWeapon(u)?.family),
  one('main weapon.damage', u => mainWeapon(u)?.damage),
  one('main weapon.delivery', u => mainWeapon(u)?.delivery),
  one('main weapon.range', u => mainWeapon(u)?.range, { list: 'range-bands' }),
  set('main weapon.can_target', u => mainWeapon(u)?.can_target),
  count('abilities (number)', u => (u.abilities || []).length),
  set('abilities.kind', u => each(u.abilities, a => a.kind)),
  set('abilities.cooldown', u => each(u.abilities, a => a.cooldown)),
  set('abilities.source', u => each(u.abilities, a => a.source)),
  set('patterns (abilities and weapons)', u => flat([each(u.abilities, a => a.patterns), each(u.armament, w => w.patterns)])),
  count('modes (number)', u => (u.modes || []).length),
  set('atypical rules', u => each(u.atypical, a => a.rule)),
  refs('strengths', 'strengths'),
  refs('weaknesses', 'weaknesses'),
  refs('counters', 'counters'),
  refs('countered_by', 'countered_by'),
  refs('combos', 'combos'),
]

/** { field path: value } for one unit, by UNIT_FIELDS. */
export function unitCoding(u, fields = UNIT_FIELDS) {
  return Object.fromEntries(fields.map(f => [f.path, f.get(u)]))
}

/** Term id -> rank, per ranked word list in the vocab folder: { 'speed-bands': { slow: 2, ... } }. */
export function loadRanks(vocabDir) {
  const ranks = {}
  if (!fs.existsSync(vocabDir)) return ranks
  for (const f of fs.readdirSync(vocabDir).filter(f => f.endsWith('.json'))) {
    const v = JSON.parse(fs.readFileSync(path.join(vocabDir, f), 'utf8'))
    if ((v.terms || []).some(t => Number.isInteger(t.rank))) ranks[v.id] = Object.fromEntries(v.terms.map(t => [t.id, t.rank]))
  }
  return ranks
}

const canon = v => JSON.stringify(v === undefined ? null : v)
const asSet = v => new Set((Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]).map(canon))

/** Overlap of two sets: |A and B| / |A or B|, and 1 when both are empty. */
export function jaccard(a, b) {
  const A = asSet(a)
  const B = asSet(b)
  if (!A.size && !B.size) return 1
  let both = 0
  for (const x of A) if (B.has(x)) both++
  return both / (A.size + B.size - both)
}

function withinOne(f, a, b, ranks) {
  if (canon(a) === canon(b)) return true
  if (f.numeric) return typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= 1
  const r = f.list && ranks[f.list]
  return Boolean(r && Number.isInteger(r[a]) && Number.isInteger(r[b]) && Math.abs(r[a] - r[b]) <= 1)
}

const pairsOf = xs => xs.flatMap((x, i) => xs.slice(i + 1).map(y => [x, y]))
const score = (f, a, b) => (f.kind === 'set' ? jaccard(a, b) : canon(a) === canon(b) ? 1 : 0)
const round = x => Math.round(x * 1000) / 1000
const hasSteps = f => Boolean(f.numeric || f.list)

/**
 * Agreement per field. codings: { coder: { item: { field path: value } } }; fields: [{ path, kind: 'one'|'set',
 * numeric?, list?, proposal?, group?, gate? }]. Returns { coders, items, threshold, fields: [...] }, each field with
 * its pairs, agreement, within_one (ranked fields and counts), the items all coders agree on, whether it is below the
 * threshold, and per item the value each coder gave.
 */
export function measure(codings, { fields, ranks = {}, threshold = 0.8 }) {
  const coders = Object.keys(codings).sort()
  const items = [...new Set(coders.flatMap(c => Object.keys(codings[c])))].sort()
  const out = fields.map(f => {
    let pairs = 0
    let sum = 0
    let near = 0
    let full = 0
    let measured = 0
    const details = []
    for (const item of items) {
      const by = coders.filter(c => codings[c][item])
      if (by.length < 2) continue
      measured++
      const values = Object.fromEntries(by.map(c => [c, codings[c][item][f.path]]))
      const ps = pairsOf(by)
      const scores = ps.map(([x, y]) => score(f, values[x], values[y]))
      pairs += ps.length
      sum += scores.reduce((a, b) => a + b, 0)
      if (hasSteps(f)) near += ps.filter(([x, y]) => withinOne(f, values[x], values[y], ranks)).length
      const all = scores.every(s => s === 1)
      if (all) full++
      details.push({ item, values, agreement: round(scores.reduce((a, b) => a + b, 0) / ps.length), all_agree: all })
    }
    const agreement = pairs ? round(sum / pairs) : null
    return {
      path: f.path,
      kind: f.numeric ? 'count' : f.kind,
      group: f.group || 'fields',
      proposal: f.proposal || false,
      gated: f.gate !== false,
      items: measured,
      pairs,
      agreement,
      within_one: hasSteps(f) && pairs ? round(near / pairs) : null,
      all_agree: full,
      below: f.gate !== false && agreement !== null && agreement < threshold,
      details,
    }
  })
  return { coders, items, threshold, fields: out }
}

/** How often each coder matches a reference coding (for example the published sample units), per field. */
export function compareWithReference(codings, reference, { fields }) {
  return fields.map(f => {
    let n = 0
    let sum = 0
    for (const c of Object.keys(codings)) {
      for (const [item, coding] of Object.entries(codings[c])) {
        if (!reference[item]) continue
        n++
        sum += score(f, coding[f.path], reference[item][f.path])
      }
    }
    return { path: f.path, comparisons: n, agreement: n ? round(sum / n) : null }
  })
}

const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'))
const jsonFiles = d => fs.readdirSync(d).filter(f => f.endsWith('.json')).sort().map(f => path.join(d, f))

/** { item: coding } for every unit in the unit files of one folder. */
export function readUnitCodings(dir, fields = UNIT_FIELDS) {
  const out = {}
  for (const f of jsonFiles(dir)) for (const u of readJson(f).units || []) out[u.id] = unitCoding(u, fields)
  return out
}

/** { coder: { item: coding } } from a folder with one sub-folder of unit files per coder. */
export function readCoderFolders(dir, fields = UNIT_FIELDS) {
  const subs = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort()
  if (subs.length < 2) throw new Error(`${dir} needs a folder per coder, at least two`)
  return Object.fromEntries(subs.map(s => [s, readUnitCodings(path.join(dir, s), fields)]))
}

/** Codings and field list from a table file (see the usage note at the top). */
export function readTable(file) {
  const t = readJson(file)
  if (!t.coders || typeof t.coders !== 'object') throw new Error(`${file} has no "coders" object`)
  const paths = new Map()
  for (const items of Object.values(t.coders)) {
    for (const coding of Object.values(items)) {
      for (const [p, v] of Object.entries(coding)) {
        const prev = paths.get(p) || {}
        paths.set(p, { set: prev.set || Array.isArray(v), numeric: (prev.numeric ?? true) && (v === null || typeof v === 'number') })
      }
    }
  }
  const fields = [...paths].map(([p, k]) => ({
    path: p,
    kind: k.set ? 'set' : 'one',
    numeric: !k.set && k.numeric,
    list: t.fields?.[p]?.list,
  }))
  return { codings: t.coders, fields }
}

const cell = v => {
  if (v === undefined || v === null) return '-'
  const s = Array.isArray(v) ? (v.length ? v.join(', ') : '(none)') : String(v)
  return s.replace(/\|/g, '\\|')
}
const pct = x => (x === null ? 'n/a' : `${Math.round(x * 100)}%`)

/** The report as Markdown. */
export function renderMarkdown(result, { title = 'Agreement between coders', reference = null } = {}) {
  const { coders, items, threshold, fields } = result
  const gated = fields.filter(f => f.gated && f.agreement !== null)
  const below = gated.filter(f => f.below)
  const lines = [
    `# ${title}`,
    '',
    `Coders: ${coders.join(', ')}. Items: ${items.length} (${items.join(', ')}). Threshold: ${pct(threshold)}.`,
    '',
    `**${gated.length - below.length} of ${gated.length} measured fields reach the threshold; ${below.length} fall below it.** ` +
      'Agreement is the mean over every pair of coders on every item (sets score their overlap). "Within one step" counts ' +
      'pairs at most one rank apart, for ranked word lists and counts. Matchup lists are open choices, measured for information only.',
    '',
    '| Field | Kind | Items | Agreement | Within one step | Items all agree | Note |',
    '|---|---|---|---|---|---|---|',
  ]
  for (const f of fields) {
    const note = [f.below ? '**below**' : '', f.proposal === true ? 'proposal' : f.proposal ? 'partly proposal' : '', f.gated ? '' : 'information only']
      .filter(Boolean)
      .join(', ')
    lines.push(`| ${f.path} | ${f.kind} | ${f.items} | ${pct(f.agreement)} | ${f.within_one === null ? '' : pct(f.within_one)} | ${f.all_agree} of ${f.items} | ${note} |`)
  }
  const disagreed = fields.filter(f => f.gated && f.details.some(d => !d.all_agree))
  if (disagreed.length) {
    lines.push('', '## Where coders disagreed', '', 'Every measured field with at least one item the coders did not all code the same way.')
    for (const f of disagreed) {
      lines.push('', `### ${f.path} (${pct(f.agreement)}${f.below ? ', below the threshold' : ''})`, '', `| Item | ${coders.join(' | ')} |`, `|---|${coders.map(() => '---').join('|')}|`)
      for (const d of f.details.filter(d => !d.all_agree)) lines.push(`| ${d.item} | ${coders.map(c => (c in d.values ? cell(d.values[c]) : '')).join(' | ')} |`)
    }
  }
  if (reference) {
    lines.push('', '## Compared with the reference', '', 'How often a coder matched the reference coding, per field (sets score their overlap).', '', '| Field | Comparisons | Agreement |', '|---|---|---|')
    for (const r of reference) lines.push(`| ${r.path} | ${r.comparisons} | ${pct(r.agreement)} |`)
  }
  return lines.join('\n') + '\n'
}

function parseArgs(argv) {
  const opts = { dir: null, table: null, reference: null, threshold: 0.8, json: false, vocab: path.join(REPO_ROOT, 'data/vocab') }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--reference') opts.reference = path.resolve(argv[++i] ?? '')
    else if (a === '--table') opts.table = path.resolve(argv[++i] ?? '')
    else if (a === '--vocab') opts.vocab = path.resolve(argv[++i] ?? '')
    else if (a === '--json') opts.json = true
    else if (a === '--threshold') {
      opts.threshold = Number(argv[++i])
      if (!(opts.threshold > 0 && opts.threshold <= 1)) throw new Error('--threshold needs a number above 0 and at most 1')
    } else if (a.startsWith('--')) throw new Error(`unknown option '${a}'`)
    else if (opts.dir) throw new Error(`more than one folder given ('${opts.dir}' and '${a}')`)
    else opts.dir = path.resolve(a)
  }
  if (!opts.dir === !opts.table) throw new Error('give either a folder of coder folders or --table <file>')
  if (opts.table && opts.reference) throw new Error('--reference works only with unit folders')
  return opts
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let opts, result, reference
  try {
    opts = parseArgs(process.argv.slice(2))
    const ranks = loadRanks(opts.vocab)
    const { codings, fields } = opts.table ? readTable(opts.table) : { codings: readCoderFolders(opts.dir), fields: UNIT_FIELDS }
    result = measure(codings, { fields, ranks, threshold: opts.threshold })
    if (opts.reference) reference = compareWithReference(codings, readUnitCodings(opts.reference), { fields })
  } catch (e) {
    console.error(`${e.message}\nusage: node scripts/agreement.mjs <dir> [--reference <dir>] [--threshold 0.8] [--json] [--vocab <dir>]\n       node scripts/agreement.mjs --table <file> [--threshold 0.8] [--json] [--vocab <dir>]`)
    process.exit(2)
  }
  if (opts.json) console.log(JSON.stringify({ ...result, reference: reference ?? null }, null, 2))
  else process.stdout.write(renderMarkdown(result, { reference }))
}
