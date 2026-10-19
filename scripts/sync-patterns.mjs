// Fills in each written pattern's source_units from the units that link it, so nobody edits pattern files by hand.
//
// Usage: node scripts/sync-patterns.mjs [--check] [root]   (root defaults to the repo root)
//
// A unit links a pattern through an ability's or a weapon's patterns list, or through a mode's 'via'. For every file
// in data/patterns/, the script finds the units in data/units/ that link it and writes their ids, sorted, as the
// pattern's source_units. The rest of the file keeps its keys, their order and the house style (format-json.mjs).
// A pattern that no unit links keeps its list as it is: the validator reports a live pattern that nothing links, and
// a merged or rejected pattern keeps the units it had.
//
// Who runs it. Research agents never do: they run npm run validate only, which warns while a list is out of date.
// The merge pass runs it once, then npm run docs, then npm run check, which runs it again with --check.
//
// --check writes nothing. It lists each pattern file whose source_units are out of date and exits 1 if there is one.
// Exit codes: 0 done (or nothing out of date), 1 out of date (--check) or a file that can't be read (then nothing is
// written), 2 bad options.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fmt, parseJson } from './format-json.mjs'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const UNITS_DIR = 'data/units'
export const PATTERNS_DIR = 'data/patterns'

/** The ids of the patterns one unit links: abilities[].patterns, armament[].patterns and modes[].via. */
export function linkedPatterns(u) {
  const list = x => (Array.isArray(x) ? x : [])
  return new Set([
    ...list(u.abilities).flatMap(a => list(a?.patterns)),
    ...list(u.armament).flatMap(w => list(w?.patterns)),
    ...list(u.modes).map(m => m?.via),
  ].filter(id => typeof id === 'string'))
}

// The *.json files of one folder, as '/' paths relative to root, sorted.
const jsonFiles = (root, dir) => (fs.existsSync(path.join(root, dir))
  ? fs.readdirSync(path.join(root, dir)).filter(f => f.endsWith('.json')).sort().map(f => `${dir}/${f}`)
  : [])
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())

/**
 * What a sync would do, without writing: { problems, patterns }. Each pattern is { file, id, had, want, stale,
 * unlinked }: had is its source_units now, want the units that link it, stale whether it needs rewriting, and
 * unlinked whether no unit links it (then it is left as it is). problems lists files that can't be read.
 */
export function planSync(root = REPO_ROOT) {
  const problems = []
  function read(f) {
    try { return JSON.parse(fs.readFileSync(path.join(root, f), 'utf8')) }
    catch (e) { problems.push(`${f}: not valid JSON (${e.message})`); return undefined }
  }
  const links = new Map() // pattern id -> unit ids
  for (const f of jsonFiles(root, UNITS_DIR)) {
    const d = read(f)
    if (d === undefined) continue
    if (!Array.isArray(d?.units)) { problems.push(`${f}: no 'units' list`); continue }
    for (const u of d.units) {
      if (typeof u?.id !== 'string') { problems.push(`${f}: a unit without an id`); continue }
      for (const id of linkedPatterns(u)) links.set(id, [...(links.get(id) || []), u.id])
    }
  }
  const patterns = []
  for (const f of jsonFiles(root, PATTERNS_DIR)) {
    const p = read(f)
    if (p === undefined) continue
    if (p === null || typeof p !== 'object' || Array.isArray(p) || typeof p.id !== 'string') { problems.push(`${f}: not a pattern with an id`); continue }
    const want = [...new Set(links.get(p.id) || [])].sort()
    const had = Array.isArray(p.source_units) ? p.source_units : []
    const unlinked = !want.length
    patterns.push({ file: f, id: p.id, had, want, stale: !unlinked && (!Array.isArray(p.source_units) || !same(had, want)), unlinked })
  }
  return { problems, patterns }
}

/**
 * Rewrites the source_units of every out-of-date pattern under root, or with check only plans it. Returns the plan
 * and written (the files rewritten). Nothing is written when a file can't be read.
 */
export function syncPatterns(root = REPO_ROOT, { check = false } = {}) {
  const plan = planSync(root)
  const written = []
  if (check || plan.problems.length) return { ...plan, written }
  for (const p of plan.patterns.filter(x => x.stale)) {
    const file = path.join(root, p.file)
    // parseJson keeps the keys in their written order, so only source_units changes.
    const doc = parseJson(fs.readFileSync(file, 'utf8'))
    const at = doc.entries.findIndex(([k]) => k === 'source_units')
    if (at >= 0) doc.entries[at] = ['source_units', p.want]
    else {
      const after = doc.entries.findIndex(([k]) => k === 'counterplay')
      doc.entries.splice(after >= 0 ? after + 1 : doc.entries.length, 0, ['source_units', p.want])
    }
    fs.writeFileSync(file, fmt(doc) + '\n', 'utf8')
    written.push(p.file)
  }
  return { ...plan, written }
}

/** The printed report, and the exit code. */
export function formatSync({ problems, patterns, written }, { check = false } = {}) {
  const lines = problems.map(p => `ERROR    ${p}`)
  const stale = patterns.filter(p => p.stale)
  for (const p of patterns.filter(x => x.unlinked)) lines.push(`no unit links it, left as it is: ${p.file}`)
  if (problems.length) {
    lines.push(`FAILED with ${problems.length} error(s); nothing was written`)
    return { text: lines.join('\n'), code: 1 }
  }
  if (check) {
    for (const p of stale) lines.push(`out of date: ${p.file} (source_units [${p.had.join(', ')}], linked by [${p.want.join(', ')}])`)
    lines.push(stale.length
      ? `${stale.length} of ${patterns.length} pattern file(s) out of date; the merge pass runs npm run sync-patterns`
      : `all ${patterns.length} pattern file(s) up to date`)
    return { text: lines.join('\n'), code: stale.length ? 1 : 0 }
  }
  for (const p of stale) lines.push(`updated: ${p.file} (source_units [${p.want.join(', ')}])`)
  lines.push(`checked ${patterns.length} pattern file(s), updated ${written.length}`)
  return { text: lines.join('\n'), code: 0 }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const check = args.includes('--check')
  const unknown = args.filter(a => a.startsWith('--') && a !== '--check')
  const named = args.filter(a => !a.startsWith('--'))
  if (unknown.length || named.length > 1) {
    console.error(`${unknown.length ? `unknown option(s): ${unknown.join(' ')}` : 'give at most one folder'}\nusage: node scripts/sync-patterns.mjs [--check] [root]`)
    process.exit(2)
  }
  const root = path.resolve(named[0] || REPO_ROOT)
  const { text, code } = formatSync(syncPatterns(root, { check }), { check })
  console.log(text)
  process.exitCode = code
}
