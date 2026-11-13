// The cross-check (tests T3 and T4 of docs/generator-rules.md): cards rolled by the generator (src/core/) are judged
// by code that is separate from it: the rolled-card checker (scripts/check-cards.mjs) and the validator's card rules.
//
// Usage: node scripts/cross-check.mjs t3 [--n 10000] [--out <file.json>]
//        node scripts/cross-check.mjs t4 [--seeds 20] [--shard <i>/<n>] [--out <file.json>]
//   t3   n random requests (each input open or chosen at even odds, a random spice), one seed each
//   t4   every combination of inputs: 7 class choices (6 or open) x 4 tiers x 4 flavours x 17 roles x 5 spices,
//        each with the given number of seeds; --shard 0/4 ... 3/4 splits the combinations over four runs
//   --out  writes the full result (counts, the unavailable combinations, a few examples per rule code) as JSON
//
// Output: one summary on standard output. Exit codes: 0 every card passes and nothing is unavailable that should
// roll; 1 a card fails a check, a roll throws, or a combination is unavailable that the data does not rule out;
// 2 bad usage.
//
// Unavailable by the data: a chosen role whose word-list entry does not allow the chosen class (today role transport
// with class infantry or drone). Nothing else may be unavailable.
//
// The requests come from this file's own small random generator, not from the generator's dice. Full runs are slow
// (about 25 ms a roll): t3 with 10,000 rolls takes about five minutes, t4 with 20 seeds about 80 minutes of
// processor time. tests/cross-check.test.mjs runs a small slice of both on every `npm test`.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGeneratorData } from './lib/generator-data.mjs'
import { loadCheckData, checkCard, validateCards } from './check-cards.mjs'
import { roll } from '../src/core/roll.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SPICES = [1, 2, 3, 4, 5]

/** The lists the requests are built from, read from the word lists (terms a card can use). */
export function inputLists(root = ROOT) {
  const terms = id => JSON.parse(fs.readFileSync(path.join(root, 'data', 'vocab', `${id}.json`), 'utf8')).terms
  const usable = id => terms(id).filter(t => !t.source_only)
  const roles = usable('roles')
  return {
    classes: usable('classes').map(t => t.id),
    tiers: usable('tiers').map(t => t.id),
    flavours: usable('faction-flavours').map(t => t.id),
    roles: roles.map(t => t.id),
    roleClasses: Object.fromEntries(roles.map(t => [t.id, t.classes ?? null])),
  }
}

function mulberry32(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** n random requests: each input open or chosen at even odds, a random spice, the seed 't3-<i>'. */
export function* requestsT3(lists, n, from = 20261113) {
  const rnd = mulberry32(from)
  const pick = list => list[Math.floor(rnd() * list.length)]
  const maybe = list => (rnd() < 0.5 ? null : pick(list))
  for (let i = 0; i < n; i++) {
    yield { seed: `t3-${i}`, spice: pick(SPICES), inputs: { class: maybe(lists.classes), tier: maybe(lists.tiers), flavour: maybe(lists.flavours), role: maybe(lists.roles) } }
  }
}

/** Every combination of inputs, each with `seeds` seeds; shard i of n takes every n-th combination. */
export function* requestsT4(lists, seeds, shard = 0, of = 1) {
  let k = 0
  for (const c of [null, ...lists.classes])
    for (const t of [null, ...lists.tiers])
      for (const f of [null, ...lists.flavours])
        for (const r of [null, ...lists.roles])
          for (const s of SPICES) {
            if (k++ % of !== shard) continue
            for (let i = 0; i < seeds; i++) yield { seed: `t4-${i}`, spice: s, inputs: { class: c, tier: t, flavour: f, role: r } }
          }
}

const keyOf = q => `${q.inputs.class ?? '*'}|${q.inputs.tier ?? '*'}|${q.inputs.flavour ?? '*'}|${q.inputs.role ?? '*'}|${q.spice}`

/**
 * Rolls every request and checks every card. Returns the counts, the unavailable combinations (each marked expected
 * or not), the problems by rule code with a few examples, and `ok`.
 */
export function crossCheck(requests, { root = ROOT, examples = 6, batch = 1000, progress } = {}) {
  const data = loadGeneratorData(root)
  const check = loadCheckData(root)
  const lists = inputLists(root)
  const ruledOut = q => q.inputs.class != null && q.inputs.role != null && lists.roleClasses[q.inputs.role] != null && !lists.roleClasses[q.inputs.role].includes(q.inputs.class)
  const out = { rolls: 0, cards: 0, cardsWithProblems: 0, unavailable: {}, unexpectedUnavailable: 0, attempts: {}, byCode: {}, examples: {}, dataProblems: [...(check.dataProblems || [])] }
  const note = (code, q, p) => {
    out.byCode[code] = (out.byCode[code] || 0) + 1
    const ex = (out.examples[code] ||= [])
    if (ex.length < examples) ex.push({ request: q, path: p.path, message: p.message })
  }
  let pending = []
  const flush = () => {
    if (!pending.length) return
    const v = validateCards(pending.map(b => b.card), check)
    for (const e of v.dataErrors) if (!out.dataProblems.includes(e) && out.dataProblems.length < 20) out.dataProblems.push(e)
    pending.forEach((b, i) => {
      const ps = [...b.problems, ...v.problems[i]]
      if (ps.length) out.cardsWithProblems++
      for (const p of ps) note(p.code, b.request, p)
    })
    pending = []
  }
  for (const q of requests) {
    out.rolls++
    let r
    try {
      r = roll(data, q)
    } catch (e) {
      note('THROW', q, { path: '/', message: String(e?.message ?? e) })
      continue
    }
    out.attempts[r.attempts] = (out.attempts[r.attempts] || 0) + 1
    if (!r.ok) {
      const expected = ruledOut(q)
      const u = (out.unavailable[keyOf(q)] ||= { count: 0, expected, reason: r.reason })
      u.count++
      if (!expected) out.unexpectedUnavailable++
      continue
    }
    if (ruledOut(q)) note('T4', q, { path: '/', message: 'a card came out for inputs the word lists rule out' })
    out.cards++
    pending.push({ request: q, card: r.card, problems: checkCard(r.card, check) })
    if (pending.length >= batch) flush()
    if (progress && out.rolls % 5000 === 0) progress(out)
  }
  flush()
  out.ok = out.cardsWithProblems === 0 && out.unexpectedUnavailable === 0 && !out.byCode.THROW && !out.byCode.T4 && out.dataProblems.length === 0
  return out
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const mode = args[0]
  const opt = (name, dflt) => {
    const i = args.indexOf(`--${name}`)
    return i >= 0 ? args[i + 1] : dflt
  }
  const lists = inputLists()
  let requests
  if (mode === 't3') requests = requestsT3(lists, Number(opt('n', 10000)))
  else if (mode === 't4') {
    const [i, n] = String(opt('shard', '0/1')).split('/').map(Number)
    if (!(n >= 1) || !(i >= 0) || i >= n) {
      console.log('--shard takes <i>/<n> with 0 <= i < n')
      process.exit(2)
    }
    requests = requestsT4(lists, Number(opt('seeds', 20)), i, n)
  } else {
    console.log('Usage: node scripts/cross-check.mjs t3 [--n 10000] [--out <file.json>]\n       node scripts/cross-check.mjs t4 [--seeds 20] [--shard <i>/<n>] [--out <file.json>]')
    process.exit(2)
  }
  const res = crossCheck(requests, { progress: o => console.error(`${o.rolls} rolls, ${o.cards} cards, ${o.cardsWithProblems} with problems`) })
  const file = opt('out')
  if (file) fs.writeFileSync(file, JSON.stringify({ mode, ...res }, null, 1))
  const unavailable = Object.values(res.unavailable)
  console.log(`${mode}: ${res.rolls} rolls, ${res.cards} cards, ${res.cardsWithProblems} with problems`)
  console.log(`unavailable: ${unavailable.reduce((n, u) => n + u.count, 0)} rolls in ${unavailable.length} combinations, ${res.unexpectedUnavailable} of them not ruled out by the data`)
  for (const [code, n] of Object.entries(res.byCode)) console.log(`  ${code}: ${n}${res.examples[code]?.[0] ? `, for example ${JSON.stringify(res.examples[code][0].request)} ${res.examples[code][0].path}: ${res.examples[code][0].message}` : ''}`)
  for (const m of res.dataProblems) console.log(`  DATA ${m}`)
  console.log(res.ok ? 'PASS' : 'FAIL')
  process.exitCode = res.ok ? 0 : 1
}
