// Formats the repo's JSON files in one house style: 2-space indent, and arrays of plain values (or arrays of
// such arrays) kept on one line when that line fits in 110 characters. Every data file is written this way.
//
// Usage:
//   node scripts/format-json.mjs                 format every *.json under schemas/, data/ and docs/examples/
//   node scripts/format-json.mjs <file>...       format just these files
//   node scripts/format-json.mjs --check [...]   list files that are not formatted and exit 1; writes nothing
//
// The output is byte-identical to the original Python formatter (json.loads, then json.dumps with
// ensure_ascii=False per value). To match it exactly this file parses JSON itself rather than with JSON.parse:
// object keys keep their written order (JSON.parse moves keys like "10" to the front), integers stay exact,
// numbers written with a fraction or exponent stay floats ("1.0" stays "1.0"), and widths count code points.
// Two deliberate differences keep every output standard JSON with the same data: NaN, Infinity and numbers
// too large for a float (1e400) are refused, where Python would write NaN or Infinity; and a lone surrogate
// in a string is written as a \uXXXX escape, where Python's file write would fail.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const WIDTH = 110
export const DEFAULT_DIRS = ['schemas', 'data', 'docs/examples']

// ---------------------------------------------------------------- parsing
// Values: objects are { type: 'object', entries: [[key, value], ...] }, arrays are JS arrays, integers are
// { type: 'int', value: BigInt }, floats are { type: 'float', value: Number }, strings, booleans and null as is.

const WS = new Set([' ', '\t', '\n', '\r'])
const NUMBER = /-?(?:0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?/y
const SIMPLE_ESCAPES = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' }

export function parseJson(text) {
  let i = 0
  const fail = msg => { throw new SyntaxError(`${msg} at offset ${i}`) }
  const skip = () => { while (i < text.length && WS.has(text[i])) i++ }

  function value() {
    skip()
    const c = text[i]
    if (c === '{') return object()
    if (c === '[') return array()
    if (c === '"') return string()
    if (text.startsWith('true', i)) { i += 4; return true }
    if (text.startsWith('false', i)) { i += 5; return false }
    if (text.startsWith('null', i)) { i += 4; return null }
    // NaN and Infinity, which Python's json module also reads, are not JSON and are refused here.
    NUMBER.lastIndex = i
    const m = NUMBER.exec(text)
    if (!m) fail('expected a value')
    if (m[1] || m[2]) {
      const value = Number(m[0])
      if (!Number.isFinite(value)) fail(`number ${m[0]} is too large for a float`)
      i += m[0].length
      return { type: 'float', value }
    }
    i += m[0].length
    return { type: 'int', value: BigInt(m[0]) }
  }

  function object() {
    i++ // {
    // A repeated key keeps its first position and takes the last value, as in a Python dict.
    const map = new Map()
    skip()
    if (text[i] === '}') { i++; return { type: 'object', entries: [] } }
    for (;;) {
      skip()
      if (text[i] !== '"') fail('expected a key')
      const k = string()
      skip()
      if (text[i] !== ':') fail("expected ':'")
      i++
      map.set(k, value())
      skip()
      if (text[i] === ',') { i++; continue }
      if (text[i] === '}') { i++; break }
      fail("expected ',' or '}'")
    }
    return { type: 'object', entries: [...map] }
  }

  function array() {
    i++ // [
    const out = []
    skip()
    if (text[i] === ']') { i++; return out }
    for (;;) {
      out.push(value())
      skip()
      if (text[i] === ',') { i++; continue }
      if (text[i] === ']') { i++; break }
      fail("expected ',' or ']'")
    }
    return out
  }

  function string() {
    i++ // opening quote
    let out = ''
    for (;;) {
      if (i >= text.length) fail('unterminated string')
      const c = text[i]
      if (c === '"') { i++; return out }
      if (c < ' ') fail('control character in string')
      if (c !== '\\') { out += c; i++; continue }
      const e = text[i + 1]
      if (e in SIMPLE_ESCAPES) { out += SIMPLE_ESCAPES[e]; i += 2; continue }
      if (e !== 'u' || !/^[0-9a-fA-F]{4}$/.test(text.slice(i + 2, i + 6))) fail('bad escape')
      out += String.fromCharCode(parseInt(text.slice(i + 2, i + 6), 16)) // surrogate pairs join up as in Python
      i += 6
    }
  }

  const v = value()
  skip()
  if (i !== text.length) fail('extra data')
  return v
}

// ---------------------------------------------------------------- writing scalars as Python's json.dumps does

const isContainer = v => Array.isArray(v) || (v !== null && typeof v === 'object' && v.type === 'object')

function dumpString(s) {
  let out = '"'
  for (const ch of s) {
    const c = ch.codePointAt(0)
    if (ch === '"') out += '\\"'
    else if (ch === '\\') out += '\\\\'
    else if (ch === '\n') out += '\\n'
    else if (ch === '\r') out += '\\r'
    else if (ch === '\t') out += '\\t'
    else if (ch === '\b') out += '\\b'
    else if (ch === '\f') out += '\\f'
    else if (c < 0x20) out += '\\u' + c.toString(16).padStart(4, '0')
    else if (c >= 0xd800 && c <= 0xdfff) out += '\\u' + c.toString(16) // a lone surrogate; pairs arrive joined
    else out += ch
  }
  return out + '"'
}

// Python's repr(float): shortest round-trip digits, fixed notation from 1e-4 up to (not including) 1e16,
// otherwise exponent notation such as 1e-05 or 1.5e+16; fixed notation always has a fraction ('2.0').
function dumpFloat(x) {
  if (!Number.isFinite(x)) throw new RangeError(`${x} cannot be written as JSON`)
  const sign = x < 0 || Object.is(x, -0) ? '-' : ''
  const [mant, exp] = Math.abs(x).toExponential().split('e')
  const digits = mant.replace('.', '')
  const decpt = Number(exp) + 1 // the value is 0.<digits> times 10^decpt
  if (decpt <= -4 || decpt > 16) {
    const e = Number(exp)
    const rest = digits.length > 1 ? '.' + digits.slice(1) : ''
    return `${sign}${digits[0]}${rest}e${e < 0 ? '-' : '+'}${String(Math.abs(e)).padStart(2, '0')}`
  }
  if (decpt <= 0) return `${sign}0.${'0'.repeat(-decpt)}${digits}`
  if (decpt >= digits.length) return `${sign}${digits}${'0'.repeat(decpt - digits.length)}.0`
  return `${sign}${digits.slice(0, decpt)}.${digits.slice(decpt)}`
}

function dumpScalar(v) {
  if (v === null) return 'null'
  if (v === true) return 'true'
  if (v === false) return 'false'
  if (typeof v === 'string') return dumpString(v)
  if (v.type === 'int') return v.value.toString()
  if (v.type === 'float') return dumpFloat(v.value)
  throw new TypeError('not a scalar')
}

// ---------------------------------------------------------------- the layout

const width = s => { let n = 0; for (const _ of s) n++; return n } // code points, like Python's len()

export function fmt(v, indent = 0) {
  const pad = '  '.repeat(indent)
  if (Array.isArray(v)) {
    if (!v.length) return '[]'
    if (v.every(x => !isContainer(x))) {
      const one = '[' + v.map(dumpScalar).join(', ') + ']'
      if (width(one) + width(pad) <= WIDTH) return one
    }
    if (v.every(x => Array.isArray(x) && x.every(y => !isContainer(y)))) {
      const one = '[' + v.map(x => fmt(x)).join(', ') + ']'
      if (width(one) + width(pad) <= WIDTH) return one
    }
    return '[\n' + v.map(x => `${pad}  ${fmt(x, indent + 1)}`).join(',\n') + '\n' + pad + ']'
  }
  if (isContainer(v)) {
    if (!v.entries.length) return '{}'
    const items = v.entries.map(([k, x]) => `${pad}  ${dumpString(k)}: ${fmt(x, indent + 1)}`)
    return '{\n' + items.join(',\n') + '\n' + pad + '}'
  }
  return dumpScalar(v)
}

function sameData(a, b) {
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => sameData(x, b[i]))
  if (a === null || typeof a !== 'object') return a === b
  if (b === null || typeof b !== 'object' || a.type !== b.type) return false
  if (a.type === 'object') {
    return a.entries.length === b.entries.length
      && a.entries.every(([k, x], i) => k === b.entries[i][0] && sameData(x, b.entries[i][1]))
  }
  return a.value === b.value
}

/** Returns the formatted text of a JSON document (with the final newline). */
export function formatText(text) {
  const data = parseJson(text)
  const out = fmt(data) + '\n'
  // Safety net, like the Python version's assert: the output must read back as the same data, and must be
  // standard JSON that every other tool reads.
  if (!sameData(parseJson(out), data)) throw new Error('formatting changed the data')
  JSON.parse(out)
  return out
}

/** Every *.json file under the given directories of root, sorted. */
export function listJsonFiles(root = REPO_ROOT, dirs = DEFAULT_DIRS) {
  const out = []
  const walk = d => {
    if (!fs.existsSync(d)) return
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.isFile() && e.name.endsWith('.json')) out.push(p)
    }
  }
  for (const d of dirs) walk(path.join(root, d))
  return out.sort()
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const checkOnly = args.includes('--check')
  const unknown = args.filter(a => a.startsWith('--') && a !== '--check')
  if (unknown.length) {
    console.error(`unknown option(s): ${unknown.join(' ')}\nusage: node scripts/format-json.mjs [--check] [file...]`)
    process.exit(2)
  }
  const named = args.filter(a => !a.startsWith('--'))
  const files = named.length ? named.map(f => path.resolve(f)) : listJsonFiles()
  const show = f => { const r = path.relative(process.cwd(), f); return r && !r.startsWith('..') && !path.isAbsolute(r) ? r : f }
  const changed = []
  let failed = false
  for (const f of files) {
    let text, out
    try {
      text = fs.readFileSync(f, 'utf8')
      out = formatText(text)
    } catch (e) {
      console.error(`ERROR    ${show(f)}: ${e.message}`)
      failed = true
      continue
    }
    if (out === text) continue
    changed.push(f)
    if (!checkOnly) fs.writeFileSync(f, out, 'utf8')
  }
  if (checkOnly) {
    for (const f of changed) console.log(`not formatted: ${show(f)}`)
    console.log(changed.length
      ? `${changed.length} of ${files.length} file(s) not formatted; run npm run format`
      : `all ${files.length} file(s) formatted`)
    if (changed.length) failed = true
  } else {
    for (const f of changed) console.log(`formatted: ${show(f)}`)
    console.log(`checked ${files.length} file(s), rewrote ${changed.length}`)
  }
  process.exitCode = failed ? 1 : 0
}
