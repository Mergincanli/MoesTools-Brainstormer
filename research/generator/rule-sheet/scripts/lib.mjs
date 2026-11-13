// Shared loader for the rule-sheet scripts. Reads the Unit Forge data READ ONLY.
// Usage from another script: import { load } from './lib.mjs'; const D = load(process.argv[2])
// The repo root is the repository this file sits in, or the REPO environment variable.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO = process.env.REPO || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')

export function load(root = REPO) {
  const rd = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'))
  const ls = d => fs.readdirSync(path.join(root, d)).filter(f => f.endsWith('.json')).sort()
  const vocab = {}, terms = {}
  for (const f of ls('data/vocab')) {
    const v = rd(`data/vocab/${f}`)
    vocab[v.id] = v
    terms[v.id] = Object.fromEntries(v.terms.map(t => [t.id, t]))
  }
  const patterns = ls('data/patterns').map(f => ({ ...rd(`data/patterns/${f}`), _file: `data/patterns/${f}` }))
  const patternById = Object.fromEntries(patterns.map(p => [p.id, p]))
  const registry = rd('data/pattern-registry.json').patterns
  const registryById = Object.fromEntries(registry.map(p => [p.id, p]))
  const units = []
  for (const f of ls('data/units')) {
    const d = rd(`data/units/${f}`)
    for (const u of d.units) units.push({ ...u, _file: `data/units/${f}` })
  }
  const common = rd('schemas/common.schema.json')
  const refKinds = common['x-ref-kinds']
  const rank = (vid, id) => terms[vid]?.[id]?.rank
  const GEN_CLASSES = vocab.classes.terms.filter(t => !t.source_only).map(t => t.id)
  const TIERS = vocab.tiers.terms.map(t => t.id)
  const FLAVOURS = vocab['faction-flavours'].terms.map(t => t.id)
  const ROLES = vocab.roles.terms.map(t => t.id)
  return { root, rd, vocab, terms, patterns, patternById, registry, registryById, units, refKinds, rank, GEN_CLASSES, TIERS, FLAVOURS, ROLES }
}

export function parseRef(ref) {
  const i = ref.indexOf(':')
  const kind = ref.slice(0, i)
  let rest = ref.slice(i + 1), cmp = null
  if (rest.startsWith('<=') || rest.startsWith('>=')) { cmp = rest.slice(0, 2); rest = rest.slice(2) }
  return { kind, cmp, id: rest }
}

// Every typed link in a pattern's generator block and its variants' overrides, with where it sits.
export function generatorLinks(p) {
  const out = []
  const G = p.generator || {}
  const push = (field, ref, where) => out.push({ field, ref, where })
  for (const [gi, g] of (G.requires || []).entries()) for (const r of g) push('requires', r, `generator/requires/${gi}`)
  for (const [i, r] of (G.excludes || []).entries()) push('excludes', r, `generator/excludes/${i}`)
  for (const [i, r] of (G.implies || []).entries()) push('implies', r, `generator/implies/${i}`)
  for (const f of ['adds_strengths', 'adds_weaknesses', 'counters', 'countered_by']) {
    for (const [i, x] of (G[f] || []).entries()) push(f, x.ref, `generator/${f}/${i}/ref`)
  }
  for (const [vi, v] of p.variants.entries()) {
    const o = v.overrides || {}
    for (const [gi, g] of (o.requires || []).entries()) for (const r of g) push('requires', r, `variants/${vi}/overrides/requires/${gi}`)
    for (const [i, r] of (o.excludes || []).entries()) push('excludes', r, `variants/${vi}/overrides/excludes/${i}`)
    for (const [i, r] of (o.implies || []).entries()) push('implies', r, `variants/${vi}/overrides/implies/${i}`)
    for (const f of ['adds_strengths', 'adds_weaknesses', 'counters', 'countered_by']) {
      for (const [i, x] of (o[f] || []).entries()) push(f, x.ref, `variants/${vi}/overrides/${f}/${i}/ref`)
    }
  }
  return out
}

// Does a link resolve to a real term (or written pattern) in the data? Returns null when fine, else a reason.
export function linkProblem(D, ref) {
  const { kind, cmp, id } = parseRef(ref)
  const spec = D.refKinds[kind]
  if (!spec) return `unknown link kind '${kind}'`
  if (cmp && !spec.ranked) return 'comparator on an unranked kind'
  if (kind === 'passengers') return /^\d+$/.test(id) ? null : 'passengers needs a number'
  if (kind === 'pattern') return D.patternById[id] ? null : (D.registryById[id] ? `pattern '${id}' is planned, not written` : `pattern '${id}' is not in the registry`)
  if (kind === 'immune') {
    if (D.terms['damage-types'][id] || D.terms['mobility-traits'][id] || D.patternById[id]) return null
    return D.registryById[id] ? `immune names planned pattern '${id}'` : `immune names nothing known: '${id}'`
  }
  if (kind === 'unit') return 'unit link'
  const t = D.terms[spec.vocab]?.[id]
  if (!t) return `'${id}' is not a term of ${spec.vocab}`
  if (t.source_only) return `'${id}' is research-only (source_only)`
  return null
}
