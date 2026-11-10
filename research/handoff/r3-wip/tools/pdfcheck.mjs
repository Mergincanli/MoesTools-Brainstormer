// Six-word check of a batch record against the text of the manuals it cites (PDFs the copy-check cannot read).
// Usage: node pdfcheck.mjs <repo> <folder of manual .txt files> <record folder, e.g. research/r2>
import fs from 'node:fs'
import path from 'node:path'
const [repo, txtDir, rec] = process.argv.slice(2)
const { words, grams, sharedRuns, noteTexts } = await import(path.join(repo, 'scripts/copy-check.mjs'))
const N = 6
const manuals = fs.readdirSync(txtDir).filter(f => f.endsWith('.txt')).map(f => {
  const t = fs.readFileSync(path.join(txtDir, f), 'utf8').replace(/-\n\s*/g, '') // join words split across lines
  return [f.replace(/\.txt$/, ''), grams(words(t), N)]
})
const files = fs.readdirSync(path.join(repo, rec), { recursive: true }).map(String).filter(f => /\.(json|md)$/.test(f)).map(f => path.join(rec, f))
let hits = 0, texts = 0
for (const f of files) {
  for (const t of noteTexts(path.join(repo, f)).texts) {
    texts++
    for (const [m, g] of manuals) for (const run of sharedRuns(t.ws, g, N)) { hits++; console.log(`${f} ${t.at(0)} [${m}]: ${JSON.stringify(run)}`) }
  }
}
console.error(`${files.length} files, ${texts} texts, ${manuals.length} manuals, ${hits} shared runs`)
