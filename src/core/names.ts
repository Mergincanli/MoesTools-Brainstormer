// The name check (T-a) and the text check (T-b), with section 18's reading of "names a real thing".
//
// Real names for a text (T-b): the researched units' names, the factions, the game titles and franchises, the short
// forms of the titles (the parts of a title around its colons, dashes and slashes, without a trailing number), the
// names in the patterns' examples and the titles of the games they come from, and the word wiki. For a working name or
// a signature name (T-a) also the units' weapon names (section 18) and the source terms (in-game ability names).
// Reading (reported): the weapon names are read by the name check only; many are plain words ("Machine gun").
//
// A text names a real thing when it holds a whole real name. A name of several words counts when its words are
// capitalised as in the name. A name of one word counts when it is capitalised in the middle of a sentence; at the
// start of a sentence it counts only when our own texts never write the word in lower case, or when it has capitals
// inside it. A plain description (a name with no capital letter, such as "every side") is not a name.
import type { Index } from './data.ts'
import type { Pattern } from './types.ts'

interface NameIndex {
  /** Names of several words, as written. */
  phrases: string[]
  /** Names of one word, as written. */
  words: Set<string>
  /** Real names and source terms, folded to lower case (for whole-name equality, T-a). */
  whole: Set<string>
  /** Every word of a real name, folded (T-a: no working-name word is a word of a real name). */
  nameWords: Set<string>
  /** Words our own texts write in lower case. */
  lower: Set<string>
}

const WIKI = 'wiki'
const fold = (s: string): string => s.toLowerCase().replace(/[‐-―-]/g, ' ').replace(/\s+/g, ' ').trim()
const wordsOf = (s: string): string[] => s.match(/[\p{L}\p{N}']+/gu) ?? []

/** The parts of a game title around its colons, dashes and slashes, each also without a trailing number. */
function shortForms(title: string): string[] {
  const out = new Set<string>()
  for (const part of title.split(/\s*(?::|\s[–—-]\s|\/)\s*/)) {
    const p = part.trim()
    if (!p) continue
    out.add(p)
    const bare = p.replace(/\s+(?:\d+|[IVX]+)$/u, '').trim()
    if (bare) out.add(bare)
  }
  return [...out]
}

/** The names a pattern's examples give (units and games, a parenthesis read as a name of its own). */
function exampleNames(p: Pattern): string[] {
  const out: string[] = []
  const rec = p as unknown as Record<string, unknown>
  for (const key of ['other_examples', 'shooter_analogues']) {
    for (const e of (rec[key] as Array<Record<string, unknown>> | undefined) ?? []) {
      for (const field of ['unit', 'game', 'franchise']) {
        const v = e[field]
        if (typeof v !== 'string') continue
        // The part before a colon, each bracketed part, and each part between commas or semicolons inside brackets are
        // names of their own (section 18), as is the whole name.
        const text = v.replace(/^extra:/, '')
        const inner = [...text.matchAll(/\(([^)]*)\)/g)].flatMap(m => [m[1] ?? '', ...(m[1] ?? '').split(/[,;]/)])
        const outer = text.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()
        const beforeColon = outer.includes(':') ? [outer.slice(0, outer.indexOf(':'))] : []
        for (const name of [outer, ...beforeColon, ...inner]) {
          if (!name.trim()) continue
          // A game an example comes from counts by its title and its short forms, as a researched game does.
          if (field === 'unit' || field === 'franchise') out.push(name.trim())
          else if (name === outer) out.push(...shortForms(outer))
        }
      }
    }
  }
  return out
}

/** Every text line of a pattern (the words it writes in lower case show that a word is plain English). */
/** The fields of a pattern that are examples or sources, not its own text (section 18: "our own texts"). */
const NOT_TEXT = new Set(['other_examples', 'shooter_analogues', 'source_units', 'source_terms', 'sources', 'seen_in', '$schema', 'id', 'related', 'review'])

function patternLines(p: Pattern): string[] {
  const out: string[] = []
  const walk = (x: unknown): void => {
    if (typeof x === 'string') out.push(x)
    else if (Array.isArray(x)) x.forEach(walk)
    else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (!NOT_TEXT.has(k)) walk(v)
  }
  walk(p)
  return out
}

/** The name index of a data version (worked out once). */
export function nameIndex(ix: Index): NameIndex {
  const known = ix.derived.get('name-index') as NameIndex | undefined
  if (known) return known
  const rn = ix.data.realNames
  const names = new Set<string>()
  const add = (s: string | undefined): void => {
    const t = s?.trim()
    if (t && /\p{Lu}/u.test(t)) names.add(t) // a plain description is not a name
  }
  for (const u of rn.units) add(u)
  for (const f of rn.factions) add(f)
  for (const g of rn.games) {
    for (const s of shortForms(g.title)) add(s)
    add(g.franchise)
  }
  for (const p of ix.patterns) for (const s of exampleNames(p)) add(s)
  // Our own words are not read as real names in a text (reading, reported): the flavour words and class nouns the
  // pitch's template writes (names.json; "Empire" also names a side in the patterns' examples), the word lists' labels
  // and the patterns' names (the controls name the parts by them).
  const own = new Set<string>()
  for (const style of Object.values(ix.data.names as unknown as Record<string, { flavour_word?: string; class_nouns?: Record<string, string> }>)) {
    if (typeof style?.flavour_word === 'string') own.add(style.flavour_word)
    for (const noun of Object.values(style?.class_nouns ?? {})) own.add(noun)
  }
  for (const list of Object.values(ix.data.vocab)) for (const t of list.terms) if (typeof t.label === 'string') own.add(t.label)
  for (const p of ix.patterns) if (typeof p.name === 'string') own.add(p.name)
  const phrases: string[] = []
  const words = new Set<string>()
  for (const n of names) {
    if (own.has(n)) continue
    if (wordsOf(n).length > 1) phrases.push(n)
    else words.add(n)
  }
  phrases.sort((a, b) => b.length - a.length)
  // The name check (T-a) also reads the researched units' weapon names (section 18) and the source terms.
  const forNames = new Set(names)
  for (const w of rn.weapons ?? []) add2(forNames, w)
  const whole = new Set([...forNames].map(fold))
  for (const p of ix.patterns) for (const t of ((p as unknown as { source_terms?: string[] }).source_terms ?? [])) whole.add(fold(t))
  const nameWords = new Set([...forNames].flatMap(n => wordsOf(n).map(w => w.toLowerCase())))
  const lower = new Set<string>()
  const texts = ix.data.texts as unknown as Record<string, unknown>
  // Our own texts: the patterns' text lines (not their examples or sources), the word lists' labels and descriptions,
  // and the generator's texts (section 18).
  const generatorTexts: string[] = []
  const walk = (x: unknown): void => {
    if (typeof x === 'string') generatorTexts.push(x)
    else if (Array.isArray(x)) x.forEach(walk)
    else if (x && typeof x === 'object') Object.values(x).forEach(walk)
  }
  walk(texts)
  const vocabTexts = Object.values(ix.data.vocab).flatMap(l => l.terms.flatMap(t => [t.label, (t as unknown as { description?: string }).description].filter((x): x is string => typeof x === 'string')))
  const lines = [...ix.patterns.flatMap(patternLines), ...vocabTexts, ...generatorTexts]
  for (const line of lines) for (const w of wordsOf(line)) if (w === w.toLowerCase()) lower.add(w)
  const out: NameIndex = { phrases, words, whole, nameWords, lower }
  ix.derived.set('name-index', out)
  return out
}

function add2(set: Set<string>, s: string): void {
  const t = s.trim()
  if (t && /\p{Lu}/u.test(t)) set.add(t)
}

const isBoundary = (ch: string | undefined): boolean => ch === undefined || !/[\p{L}\p{N}]/u.test(ch)

/** The real name a text holds (section 18's reading), or undefined. */
export function realNameIn(ix: Index, text: string): string | undefined {
  const N = nameIndex(ix)
  for (const p of N.phrases) {
    let at = text.indexOf(p)
    while (at >= 0) {
      if (isBoundary(text[at - 1]) && isBoundary(text[at + p.length])) return p
      at = text.indexOf(p, at + 1)
    }
  }
  for (const m of text.matchAll(/[\p{L}\p{N}'’]+/gu)) {
    // A real name followed by a possessive ending ('s, or ' after an s) is still that name (section 18).
    const w = m[0].replace(/['’]s$/u, '').replace(/(?<=s)['’]$/u, '').replace(/^['’]+|['’]+$/gu, '')
    if (w.toLowerCase() === WIKI) return w
    if (!N.words.has(w)) continue
    // Only a full stop, a question mark, an exclamation mark, a quotation mark or a line start begins a sentence; after
    // a colon or a semicolon the sentence goes on (section 18).
    const before = text.slice(0, m.index).replace(/[ \t]+$/u, '')
    const start = before === '' || /[.!?"“”‘\n]$/.test(before)
    if (!start) return w
    if (!N.lower.has(w.toLowerCase()) || /\p{Lu}/u.test(w.slice(1))) return w
  }
  return undefined
}

/** T-a: why a working name or a signature name collides with a real name or a source term, or undefined. The words
 *  `free` (the signature's category noun: a plain action word) may occur inside a real name. */
export function nameProblem(ix: Index, name: string, free: readonly string[] = []): string | undefined {
  const N = nameIndex(ix)
  if (N.whole.has(fold(name))) return `the name ${name} is a real name or a source term (T-a)`
  for (const w of wordsOf(name)) {
    if (free.includes(w) || /^\p{N}+$/u.test(w)) continue
    if (N.nameWords.has(w.toLowerCase())) return `the word ${w} of ${name} is a word of a real name (T-a)`
  }
  return realNameIn(ix, name) ? `the name ${name} holds a real name (T-a)` : undefined
}
