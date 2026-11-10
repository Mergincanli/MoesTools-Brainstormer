// Apply R3's notes-and-trim results to a repository copy: the game-level notes in
// research/registry-notes/games-r3.md, the registry edits in data/games.json, and the record in research/r3/prep/.
// usage: node apply-prep.mjs <repo root> <nat-a.json> <nat-b.json>
import fs from 'node:fs'
import path from 'node:path'

const [root, aFile, bFile] = process.argv.slice(2)
const a = JSON.parse(fs.readFileSync(aFile, 'utf8'))
const b = JSON.parse(fs.readFileSync(bFile, 'utf8'))
const ORDER = ['generals', 'tempest-rising', 'iron-harvest']
const eds = { generals: a.generals, 'tempest-rising': a['tempest-rising'], 'iron-harvest': b['iron-harvest'] }
for (const g of ORDER) if (!eds[g]) throw new Error(`no editor result for ${g}`)
const trim = b.trim
if (!trim) throw new Error('no trim result')

// 1. The notes.
const notesPath = path.join(root, 'research/registry-notes/games-r3.md')
let lines = fs.readFileSync(notesPath, 'utf8').split('\n')
const toRemove = [...new Set(ORDER.flatMap(g => eds[g].remove_from_existing || []))]
for (const l of toRemove) {
  const n = lines.filter(x => x === l).length
  if (n !== 1) throw new Error(`line to remove found ${n} times: ${l.slice(0, 80)}`)
  lines.splice(lines.indexOf(l), 1)
}
const at = h => { const i = lines.indexOf(h); if (i < 0) throw new Error(`heading not found: ${h}`); return i }
const block = texts => texts.map(t => t.trim()).join('\n\n').split('\n')

// Official role lines: a new section before Game-wide mechanics, as in games-r1.md.
const gw = at('## Game-wide mechanics')
lines.splice(gw, 0, '## Official role lines', '',
  'Written in batch R3 preparation, before any unit of these games was coded, and checked against the sources by a second researcher. Roles step 1 reads this text first; roles step 4 and the roles.secondary drop rule read its strong-against and weak-against wording.', '',
  ...block(ORDER.map(g => eds[g].role_lines)), '')

// Game-wide mechanics: the three sections after the section's opening paragraph.
const gw2 = at('## Game-wide mechanics')
let p = gw2 + 1
while (p < lines.length && lines[p] === '') p++ // blank lines after the heading
while (p < lines.length && lines[p] !== '') p++ // the opening paragraph
lines.splice(p, 0, '', ...block(ORDER.map(g => eds[g].game_wide)))

// Research notes: one subsection per game at the end of the section (the end of the file).
const rn = at('## Research notes for the r3 agents')
let end = lines.length
for (let i = rn + 1; i < lines.length; i++) if (/^## /.test(lines[i])) { end = i; break }
const extra = ORDER.map(g => eds[g].research_notes).filter(t => t && t.trim())
lines.splice(end, 0, '', ...block(extra))

let text = lines.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s*$/, '\n')
fs.writeFileSync(notesPath, text)

// 2. The registry edits (JSON pointers inside each game's entry), in the order given.
const gamesPath = path.join(root, 'data/games.json')
const reg = JSON.parse(fs.readFileSync(gamesPath, 'utf8'))
const unesc = s => s.replace(/~1/g, '/').replace(/~0/g, '~')
for (const g of ORDER) {
  const entry = reg.games.find(e => e.id === g)
  for (const e of eds[g].registry_edits) {
    const parts = e.path.split('/').slice(1).map(unesc)
    const key = parts.pop()
    let parent = entry
    for (const k of parts) { parent = Array.isArray(parent) ? parent[Number(k)] : parent[k]; if (parent === undefined) throw new Error(`${g}: no parent for ${e.path}`) }
    if (Array.isArray(parent)) {
      const i = key === '-' ? parent.length : Number(key)
      if (e.op === 'add') { if (i > parent.length) throw new Error(`${g}: add past the end at ${e.path}`); parent.splice(i, 0, e.value) }
      else if (e.op === 'replace') { if (i >= parent.length) throw new Error(`${g}: nothing to replace at ${e.path}`); parent[i] = e.value }
      else if (e.op === 'remove') parent.splice(i, 1)
    } else {
      if (e.op === 'replace' && !(key in parent)) throw new Error(`${g}: nothing to replace at ${e.path}`)
      if (e.op === 'remove') delete parent[key]; else parent[key] = e.value
    }
    console.log(`${g}: ${e.op} ${e.path}`)
  }
}
fs.writeFileSync(gamesPath, JSON.stringify(reg, null, 2) + '\n')

// 3. The record: the trim, and what each editor changed, with its open questions and registry edits.
const dir = path.join(root, 'research/r3/prep')
fs.mkdirSync(dir, { recursive: true })
fs.writeFileSync(path.join(dir, 'trim.json'), JSON.stringify(trim, null, 1) + '\n')
const editors = Object.fromEntries(ORDER.map(g => [g, { changes: eds[g].changes, open_questions: eds[g].open_questions, registry_edits: eds[g].registry_edits, removed_lines: (eds[g].remove_from_existing || []).length }]))
fs.writeFileSync(path.join(dir, 'editors.json'), JSON.stringify(editors, null, 1) + '\n')
console.log(`notes: removed ${toRemove.length} lines; keep ${trim.keep.length}, cut ${trim.cut.length}; open questions ${ORDER.reduce((n, g) => n + eds[g].open_questions.length, 0)}`)
