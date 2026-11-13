// Checks the proposed name word banks (word-bank.json) and every name the templates can build, against every name in
// the data. Real names: unit names (data/units), faction names and game titles (data/games.json), and the names of
// real units and abilities inside the patterns (other_examples[].unit, shooter_analogues[].unit). (A) No bank word may
// be a working-name word (3+ letters) of a real name; signature nouns are plain English action words and are
// only reported when they occur inside one. (B) No bank word may equal a whole source term (an in-game ability name in
// a pattern's source_terms). (C) No working or signature name the templates can build may equal a real name or a
// source term, after the validator's normalising (lower case, letters and digits only). (D) For information: bank
// words that also appear in our own pattern names, aliases or variant names (generic English, allowed).
// Usage: node names.mjs [repoRoot]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from './lib.mjs'
const D = load(process.argv[2])
const here = path.dirname(fileURLToPath(import.meta.url))
const B = JSON.parse(fs.readFileSync(path.join(here, 'word-bank.json'), 'utf8'))
const games = D.rd('data/games.json').games
const words = s => (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter(w => w.length >= 3)
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const real = []
for (const u of D.units) real.push(['unit name', u.name])
for (const g of games) { real.push(['game title', g.title]); for (const f of g.factions) real.push(['faction name', f.name]) }
const nUnitsGamesFactions = real.length
for (const p of D.patterns) for (const x of [...(p.other_examples || []), ...(p.shooter_analogues || [])]) real.push([`example in ${p.id}`, x.unit])
const terms = D.patterns.flatMap(p => (p.source_terms || []).map(s => ['source term', s]))
const forbiddenWord = new Map()
for (const [k, s] of real) for (const w of words(s)) if (!forbiddenWord.has(w)) forbiddenWord.set(w, `${k}: ${s}`)
const wholeNames = new Map([...real, ...terms].map(([k, s]) => [norm(s), `${k}: ${s}`]))
const bankWords = [...B.soviet.nouns, ...B.allied.words, ...B.empire.first, ...B.empire.second, ...Object.values(B.signature_nouns).flat()]
console.log(`real names: ${real.length} (units ${D.units.length}, games ${games.length}, factions ${nUnitsGamesFactions - D.units.length - games.length}, unit and ability names in pattern examples ${real.length - nUnitsGamesFactions}); source terms: ${terms.length}; bank words: ${bankWords.length}`)
const nameWords = [...B.soviet.nouns, ...B.allied.words, ...B.empire.first, ...B.empire.second]
const a = nameWords.filter(w => forbiddenWord.has(w.toLowerCase()))
console.log('(A) working-name words that are a word of a real name:', a.length, a.map(w => `${w} <- ${forbiddenWord.get(w.toLowerCase())}`).join('; '))
const a2 = Object.values(B.signature_nouns).flat().filter(w => forbiddenWord.has(w.toLowerCase()))
console.log('    signature nouns that occur inside a real name (allowed, plain English):', a2.length, a2.join(', '))
const b = bankWords.filter(w => wholeNames.has(norm(w)))
console.log('(B) bank words equal to a whole real name or source term:', b.length, b.map(w => `${w} <- ${wholeNames.get(norm(w))}`).join('; '))
const built = []
for (const n of B.soviet.nouns) { built.push(n); for (const k of B.soviet.numbers) built.push(`${n}-${k}`) }
for (const w of B.allied.words) for (const l of B.allied.code_letters) for (const d of B.allied.code_digits) built.push(`${w} ${l}${d}`)
for (const x of B.empire.first) for (const y of B.empire.second) built.push(`${x} ${y}`)
const flavourWords = [...B.soviet.nouns, ...B.allied.words, ...B.empire.first, ...B.empire.second]
const sigs = []
for (const f of flavourWords) for (const n of Object.values(B.signature_nouns).flat()) sigs.push(`${f} ${n}`)
const c1 = built.filter(n => wholeNames.has(norm(n)))
const c2 = sigs.filter(n => wholeNames.has(norm(n)))
console.log(`(C) working names buildable: ${built.length}, equal to a real name or source term: ${c1.length} ${c1.join(', ')}`)
console.log(`(C) signature names buildable: ${sigs.length}, equal to a real name or source term: ${c2.length} ${c2.map(n => `${n} <- ${wholeNames.get(norm(n))}`).join('; ')}`)
const own = new Set(D.patterns.flatMap(p => [p.name, ...(p.aliases || []), ...p.variants.map(v => v.name)]).flatMap(words))
const d = bankWords.filter(w => own.has(w.toLowerCase()))
console.log(`(D) bank words also in our own pattern names, aliases or variant names (allowed): ${d.length} ${d.join(', ')}`)
