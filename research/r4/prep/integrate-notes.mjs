// Puts the editors' results of batch R4's prep into the repository: the texts into the batch's notes file
// (research/registry-notes/games-r4.md) and the registry edits into data/games.json. Nothing is written with --dry.
// It was only tried with --dry: batch R4 is parked (see README.md beside this file). Run `npm run format` after it.
// Usage, from the repository's root: node research/r4/prep/integrate-notes.mjs . research/r4/prep/editors.json [--dry]
import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry')
const [REPO, ...FILES] = argv.filter(a => a !== '--dry')
const ORDER = ['sc2', 'hw1', 'hw2', 'pa', 'mechwarrior']
const ed = {}
for (const f of FILES) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'))
  const r = j.result || j
  for (const id of ORDER) if (r[id]) ed[id] = r[id]
}
const games = ORDER.filter(id => ed[id])
console.log('editors:', games.join(', '))

// ------------------------------------------------------------ the notes file
const NOTES = path.join(REPO, 'research/registry-notes/games-r4.md')
let lines = fs.readFileSync(NOTES, 'utf8').split('\n')
const drop = new Set()
const indent = l => l.match(/^ */)[0].length
for (const id of games) {
  const want = ed[id].remove_from_existing || []
  const counts = new Map()
  for (const l of want) counts.set(l, (counts.get(l) || 0) + 1)
  for (const [l, n] of counts) {
    const at = lines.map((x, i) => (x === l ? i : -1)).filter(i => i >= 0)
    if (!at.length) throw new Error(`${id}: a line to remove is not in the file: ${JSON.stringify(l.slice(0, 120))}`)
    if (at.length === n) { for (const i of at) drop.add(i); continue }
    if (at.length < n) throw new Error(`${id}: listed ${n} times, found ${at.length}: ${JSON.stringify(l.slice(0, 120))}`)
    // Listed fewer times than it occurs: take the occurrences whose own sub-bullets are all listed for removal.
    const all = new Set(games.flatMap(g => ed[g].remove_from_existing || []))
    const fit = at.filter(i => {
      let k = i + 1, kids = 0
      while (k < lines.length && lines[k].trim() && indent(lines[k]) > indent(lines[i])) { if (!all.has(lines[k])) return false; kids++; k++ }
      return kids > 0
    })
    if (fit.length !== n) throw new Error(`${id}: cannot tell which of lines ${at.map(i => i + 1)} to remove (${n} listed, ${fit.length} fit): ${JSON.stringify(l.slice(0, 120))}`)
    for (const i of fit) drop.add(i)
    console.log(`${id}: "${l.slice(0, 60)}" occurs at lines ${at.map(i => i + 1)}; removed at ${fit.map(i => i + 1)} (its sub-bullets all go)`)
  }
}
console.log(`lines removed: ${drop.size}`)
lines = lines.filter((_, i) => !drop.has(i))

// A bullet that only names a game and has lost every sub-bullet is listed, not removed.
lines.forEach((l, i) => {
  if (/^\s*- \*\*[^*]+\*\*\s*$/.test(l) && !(lines[i + 1] && lines[i + 1].trim() && indent(lines[i + 1]) > indent(l))) console.log(`ORPHAN bullet at new line ${i + 1}: ${l}`)
})

const section = title => {
  const a = lines.findIndex(l => l === title)
  if (a < 0) throw new Error(`no section ${title}`)
  let b = lines.findIndex((l, i) => i > a && /^## /.test(l))
  if (b < 0) b = lines.length
  return [a, b]
}
const blocks = field => games.map(id => (ed[id][field] || '').trim()).filter(Boolean).join('\n\n')

// Official role lines: the placeholder goes, the five sections come.
{
  const [a, b] = section('## Official role lines')
  const old = lines.slice(a + 1, b).filter(l => l.trim())
  console.log('Official role lines, text replaced:', JSON.stringify(old))
  lines.splice(a + 1, b - a - 1, '', ...blocks('role_lines').split('\n'), '')
}
// Game-wide mechanics: the intro paragraph stays; what is left of the old subsections is shown.
{
  const [a, b] = section('## Game-wide mechanics')
  const body = lines.slice(a + 1, b)
  const firstSub = body.findIndex(l => /^### /.test(l))
  const intro = (firstSub < 0 ? body : body.slice(0, firstSub)).filter(l => l.trim())
  const rest = (firstSub < 0 ? [] : body.slice(firstSub)).filter(l => l.trim())
  console.log(`Game-wide mechanics: intro of ${intro.length} paragraph(s) kept; left of the old subsections: ${rest.length} line(s)`)
  for (const l of rest) console.log('  LEFT: ' + l.slice(0, 200))
  lines.splice(a + 1, b - a - 1, '', ...intro.flatMap(l => [l, '']), ...blocks('game_wide').split('\n'), '')
}
// Research notes: what is left of the old bullets stays on top; the new sections follow.
{
  const [a, b] = section('## Research notes for the r4 agents')
  const body = lines.slice(a + 1, b)
  const rest = body.filter(l => l.trim())
  console.log(`Research notes: left of the old bullets: ${rest.length} line(s)`)
  for (const l of rest) console.log('  LEFT: ' + l.slice(0, 200))
  while (body.length && !body[body.length - 1].trim()) body.pop()
  while (body.length && !body[0].trim()) body.shift()
  lines.splice(a + 1, b - a - 1, '', ...(body.length ? [...body, ''] : []), ...blocks('research_notes').split('\n'), '')
}
let text = lines.join('\n').replace(/\n{3,}/g, '\n\n')
if (!text.endsWith('\n')) text += '\n'
if (!DRY) fs.writeFileSync(NOTES, text)
console.log(`notes file: ${text.split('\n').length} lines${DRY ? ' (dry run, not written)' : ' written'}`)

// ------------------------------------------------------------ the registry
const REG = path.join(REPO, 'data/games.json')
const reg = JSON.parse(fs.readFileSync(REG, 'utf8'))
const unescape = s => s.replace(/~1/g, '/').replace(/~0/g, '~')
for (const id of games) {
  for (const e of ed[id].registry_edits || []) {
    if (e.path === '' || e.path === '/') {
      if (e.op !== 'add' || reg.games.some(g => g.id === id)) throw new Error(`${id}: a whole-entry edit must add a new entry`)
      if (e.value.id !== id) throw new Error(`${id}: the new entry's id is ${e.value.id}`)
      const before = reg.games.findIndex(g => g.id === 'hw2')
      reg.games.splice(before, 0, e.value)
      console.log(`${id}: new registry entry added before hw2 (${Object.keys(e.value).length} keys)`)
      continue
    }
    const entry = reg.games.find(g => g.id === id)
    if (!entry) throw new Error(`${id}: no registry entry`)
    const parts = e.path.split('/').slice(1).map(unescape)
    let at = entry
    for (const p of parts.slice(0, -1)) { at = Array.isArray(at) ? at[Number(p)] : at[p]; if (at === undefined || at === null) throw new Error(`${id}: no ${e.path}`) }
    const last = parts[parts.length - 1]
    if (Array.isArray(at)) {
      if (e.op === 'add') { if (last === '-') at.push(e.value); else { const k = Number(last); if (!(k >= 0 && k <= at.length)) throw new Error(`${id}: bad index ${e.path}`); at.splice(k, 0, e.value) } }
      else { const k = Number(last); if (!(k >= 0 && k < at.length)) throw new Error(`${id}: no ${e.path}`); if (e.op === 'replace') at[k] = e.value; else at.splice(k, 1) }
    } else {
      if (e.op !== 'add' && !(last in at)) throw new Error(`${id}: no ${e.path}`)
      if (e.op === 'remove') delete at[last]; else at[last] = e.value
    }
    console.log(`${id}: ${e.op} ${e.path}`)
  }
}
if (!DRY) fs.writeFileSync(REG, JSON.stringify(reg, null, 2) + '\n')
console.log(`registry: ${reg.games.length} games${DRY ? ' (dry run, not written)' : ' written'}`)
