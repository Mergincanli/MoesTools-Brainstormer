// Lists what changed in the word lists between two versions, in plain words, so a new word-list version can be
// reviewed before it is approved.
//
// Usage: node scripts/vocab-diff.mjs <old> [<new>] [--json]
//
// <old> and <new> are each a folder of word lists (such as data/vocab) or a git commit, branch or tag, read from
// data/vocab/ at that commit. <new> defaults to data/vocab in the working tree.
//
// Reported: lists added and removed; per list, its version and any changed label, description, group or status; terms
// added, removed or merged into another (a new term's 'replaces' names the old ids it takes over); per changed term,
// each field that changed, with list values shown as added (+) and removed (-) items. Tie-break rules are compared
// as a set, so a reworded rule shows as one removed and one added.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** { list id: word list } from a folder, or from data/vocab at a git commit. */
export function readLists(where, { cwd = REPO_ROOT } = {}) {
  const out = {}
  const dir = path.resolve(cwd, where)
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
      const v = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
      out[v.id] = v
    }
    return out
  }
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
  let names
  try {
    names = git(['ls-tree', '--name-only', `${where}:data/vocab`]).split('\n').filter(f => f.endsWith('.json'))
  } catch {
    throw new Error(`'${where}' is neither a folder nor a git commit with data/vocab/`)
  }
  for (const f of names.sort()) {
    const v = JSON.parse(git(['show', `${where}:data/vocab/${f}`]))
    out[v.id] = v
  }
  return out
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const show = v => (typeof v === 'string' ? v : JSON.stringify(v))

/** How one field of a term or list changed, as short text: '+a, -b', 'x -> y' or 'reworded: ...'. */
export function fieldChange(key, a, b) {
  if (Array.isArray(a) || Array.isArray(b)) {
    const A = (a || []).map(show)
    const B = (b || []).map(show)
    const plus = B.filter(x => !A.includes(x))
    const minus = A.filter(x => !B.includes(x))
    if (!plus.length && !minus.length) return 'reordered'
    return [...plus.map(x => `+${x}`), ...minus.map(x => `-${x}`)].join(', ')
  }
  const isMap = v => v && typeof v === 'object'
  if (isMap(a) || isMap(b)) {
    const keys = [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])].sort()
    return keys
      .filter(k => !same(a?.[k], b?.[k]))
      .map(k => `${k}: ${fieldChange(k, a?.[k], b?.[k])}`)
      .join('; ')
  }
  if (a === undefined) return `added: ${show(b)}`
  if (b === undefined) return `removed (was: ${show(a)})`
  if (typeof a === 'string' && typeof b === 'string' && (a.length > 60 || b.length > 60)) return `reworded: ${b}`
  return `${show(a)} -> ${show(b)}`
}

const LIST_KEYS = ['label', 'description', 'group', 'status']

/** The changes from the old lists to the new ones. */
export function diffLists(oldLists, newLists) {
  const added = Object.keys(newLists).filter(id => !oldLists[id]).sort()
  const removed = Object.keys(oldLists).filter(id => !newLists[id]).sort()
  const changed = []
  for (const id of Object.keys(newLists).filter(id => oldLists[id]).sort()) {
    const o = oldLists[id]
    const n = newLists[id]
    const listFields = LIST_KEYS.filter(k => !same(o[k], n[k])).map(k => ({ key: k, change: fieldChange(k, o[k], n[k]) }))
    const oldTerms = Object.fromEntries(o.terms.map(t => [t.id, t]))
    const newTerms = Object.fromEntries(n.terms.map(t => [t.id, t]))
    const replacedBy = {}
    for (const t of n.terms) for (const r of t.replaces || []) replacedBy[r] = t.id
    const termsAdded = n.terms.filter(t => !oldTerms[t.id]).map(t => ({ id: t.id, label: t.label, description: t.description, replaces: t.replaces || [] }))
    const termsRemoved = o.terms.filter(t => !newTerms[t.id]).map(t => ({ id: t.id, label: t.label, into: replacedBy[t.id] || null }))
    const termsChanged = []
    for (const t of n.terms.filter(t => oldTerms[t.id])) {
      const was = oldTerms[t.id]
      const keys = [...new Set([...Object.keys(was), ...Object.keys(t)])].filter(k => k !== 'id' && !same(was[k], t[k]))
      if (keys.length) termsChanged.push({ id: t.id, label: t.label, fields: keys.map(k => ({ key: k, change: fieldChange(k, was[k], t[k]) })) })
    }
    const ruleKey = r => JSON.stringify([[...r.terms].sort(), r.rule])
    const oldRules = new Map((o.tie_breaks || []).map(r => [ruleKey(r), r]))
    const newRules = new Map((n.tie_breaks || []).map(r => [ruleKey(r), r]))
    const tieBreaksAdded = [...newRules].filter(([k]) => !oldRules.has(k)).map(([, r]) => r)
    const tieBreaksRemoved = [...oldRules].filter(([k]) => !newRules.has(k)).map(([, r]) => r)
    const orderChanged = same(o.terms.map(t => t.id).filter(x => newTerms[x]), n.terms.map(t => t.id).filter(x => oldTerms[x])) ? false : true
    if (o.version !== n.version || listFields.length || termsAdded.length || termsRemoved.length || termsChanged.length ||
      tieBreaksAdded.length || tieBreaksRemoved.length || orderChanged) {
      changed.push({ id, label: n.label, from: o.version, to: n.version, listFields, termsAdded, termsRemoved, termsChanged,
        tieBreaksAdded, tieBreaksRemoved, orderChanged })
    }
  }
  const versions = l => [...new Set(Object.values(l).map(v => v.version))].sort()
  return { from: versions(oldLists), to: versions(newLists), added, removed, changed,
    newLists: Object.fromEntries(added.map(id => [id, newLists[id]])) }
}

const esc = s => String(s).replace(/\|/g, '\\|')
const isVersionOnly = c => !c.listFields.length && !c.termsAdded.length && !c.termsRemoved.length && !c.termsChanged.length &&
  !c.tieBreaksAdded.length && !c.tieBreaksRemoved.length && !c.orderChanged

/** The changes as Markdown. */
export function renderMarkdown(d, { oldName = 'old', newName = 'new' } = {}) {
  const count = (xs, k) => xs.reduce((n, c) => n + c[k].length, 0)
  const lines = [
    `# Word-list changes: ${d.from.join(', ')} to ${d.to.join(', ')}`,
    '',
    `From \`${oldName}\` to \`${newName}\`. ${d.added.length} list(s) added, ${d.removed.length} removed, ${d.changed.length} changed; ` +
      `${count(d.changed, 'termsAdded')} term(s) added, ${count(d.changed, 'termsRemoved')} removed, ${count(d.changed, 'termsChanged')} changed, ` +
      `${count(d.changed, 'tieBreaksAdded')} tie-break rule(s) added, ${count(d.changed, 'tieBreaksRemoved')} removed.`,
  ]
  if (d.added.length) {
    lines.push('', '## New lists')
    for (const id of d.added) {
      const v = d.newLists[id]
      lines.push('', `### ${v.label} (\`${id}\`)`, '', v.description, '', ...v.terms.map(t => `- \`${t.id}\` ${t.label}: ${t.description}`))
    }
  }
  if (d.removed.length) lines.push('', '## Removed lists', '', ...d.removed.map(id => `- \`${id}\``))
  const versionOnly = d.changed.filter(isVersionOnly)
  const real = d.changed.filter(c => !isVersionOnly(c))
  if (real.length) lines.push('', '## Changed lists')
  for (const c of real) {
    lines.push('', `### ${c.label} (\`${c.id}\`)${c.from !== c.to ? `, ${c.from} to ${c.to}` : ''}`)
    const body = []
    for (const f of c.listFields) body.push(`- **List ${f.key}:** ${f.change}`)
    for (const t of c.termsAdded) body.push(`- **Added \`${t.id}\`** (${t.label})${t.replaces.length ? `, replacing ${t.replaces.map(r => `\`${r}\``).join(', ')}` : ''}: ${t.description}`)
    for (const t of c.termsRemoved) body.push(`- **Removed \`${t.id}\`** (${t.label})${t.into ? `, merged into \`${t.into}\`` : ''}.`)
    for (const t of c.termsChanged) {
      body.push(`- **Changed \`${t.id}\`** (${t.label}):`)
      for (const f of t.fields) body.push(`  - ${f.key}: ${f.change}`)
    }
    for (const r of c.tieBreaksAdded) body.push(`- **Tie-break added** (${r.terms.map(x => `\`${x}\``).join(' / ')}): ${r.rule}`)
    for (const r of c.tieBreaksRemoved) body.push(`- **Tie-break removed** (${r.terms.map(x => `\`${x}\``).join(' / ')}): ${r.rule}`)
    if (c.orderChanged) body.push('- Terms reordered.')
    lines.push('', ...body.map(esc))
  }
  if (versionOnly.length) lines.push('', '## Lists with a new version number only', '', versionOnly.map(c => `\`${c.id}\``).join(', ') + '.')
  return lines.join('\n') + '\n'
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2)
  const json = argv.includes('--json')
  const pos = argv.filter(a => a !== '--json')
  let diff
  try {
    if (pos.length < 1 || pos.length > 2 || pos.some(a => a.startsWith('--'))) throw new Error('give one or two versions')
    const [oldName, newName = 'data/vocab'] = pos
    diff = diffLists(readLists(oldName), readLists(newName))
    if (json) console.log(JSON.stringify(diff, null, 2))
    else process.stdout.write(renderMarkdown(diff, { oldName, newName }))
  } catch (e) {
    console.error(`${e.message}\nusage: node scripts/vocab-diff.mjs <old folder or git commit> [<new folder or git commit>] [--json]`)
    process.exit(2)
  }
}
