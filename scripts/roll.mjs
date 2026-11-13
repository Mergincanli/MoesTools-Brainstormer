// Rolls concept cards from the command line.
//
//   npm run roll -- [--seed <text>] [--class <id>] [--tier <id>] [--flavour <id>] [--role <id>] [--spice <n>]
//                   [--lock <part>=<value>]... [--count <n>] [--json] [--out <file>]
//
// --lock keeps a part of the card at a value: a word list id (--lock size=large), or JSON for a part with several
// fields (--lock 'speed="fast"', --lock 'roles={"primary":"scout","secondary":[]}'). --count rolls n cards on seeds
// made from the seed (<seed>-1, <seed>-2, ...). --json prints the card objects (one object, or an array for --count);
// the default is a readable card in plain text. --out writes the output to a file instead of the screen.
// Exit codes: 0 every card rolled; 1 a roll is unavailable (the reason is printed); 2 an unknown option or a bad value.
// The output never shows a local path.
import fs from 'node:fs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGeneratorData } from './lib/generator-data.mjs'
import { renderCard } from './lib/render-card.mjs'
import { roll } from '../src/core/roll.ts'
import { LOCKABLE } from '../src/core/draft.ts'

class UsageError extends Error {}

const VALUE_OPTIONS = ['--seed', '--class', '--tier', '--flavour', '--role', '--spice', '--lock', '--count', '--out']

/** Reads the command line into options; throws a UsageError with one sentence when it cannot. */
export function parseArgs(argv, defaults) {
  const opts = { seed: undefined, inputs: {}, spice: defaults.spice, locks: {}, count: 1, json: false, out: undefined }
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i]
    let value
    const eq = a.indexOf('=')
    if (a.startsWith('--') && eq > 0 && VALUE_OPTIONS.includes(a.slice(0, eq))) {
      value = a.slice(eq + 1)
      a = a.slice(0, eq)
    }
    if (a === '--json') {
      opts.json = true
      continue
    }
    if (!VALUE_OPTIONS.includes(a)) throw new UsageError(`Unknown option ${a}; the options are ${[...VALUE_OPTIONS, '--json'].join(', ')}.`)
    if (value === undefined) {
      value = argv[++i]
      if (value === undefined) throw new UsageError(`The option ${a} needs a value.`)
    }
    switch (a) {
      case '--seed':
        if (!value) throw new UsageError('The seed must be at least one character.')
        opts.seed = value
        break
      case '--class': case '--tier': case '--flavour': case '--role':
        opts.inputs[a.slice(2)] = value
        break
      case '--spice':
        if (!/^\d+$/.test(value)) throw new UsageError(`The spice must be a whole number, not ${value}.`)
        opts.spice = Number(value)
        break
      case '--count':
        if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 1000) throw new UsageError(`The count must be a whole number from 1 to 1000, not ${value}.`)
        opts.count = Number(value)
        break
      case '--out':
        opts.out = value
        break
      case '--lock': {
        const at = value.indexOf('=')
        const part = at > 0 ? value.slice(0, at) : ''
        if (!LOCKABLE.includes(part)) throw new UsageError(`A lock is <part>=<value> with a part from ${LOCKABLE.join(', ')}; ${value} is not one.`)
        const raw = value.slice(at + 1)
        let v = raw
        if (/^[[{"]/.test(raw) || raw === 'null' || /^-?\d+$/.test(raw)) {
          try {
            v = JSON.parse(raw)
          } catch {
            throw new UsageError(`The value of the lock on ${part} is not valid JSON: ${raw}`)
          }
        }
        opts.locks[part] = v
        break
      }
    }
  }
  return opts
}

/** The requests of a run: one seed, or `count` seeds made from it. */
export function requestsOf(opts) {
  const seeds = opts.count === 1 ? [opts.seed] : Array.from({ length: opts.count }, (_, i) => `${opts.seed}-${i + 1}`)
  return seeds.map(seed => ({ seed, spice: opts.spice, inputs: opts.inputs, locks: opts.locks }))
}

/** Rolls the cards of a run; the text to print, the problems and the exit code. */
export function run(argv, data = loadGeneratorData()) {
  let opts
  try {
    opts = parseArgs(argv, { spice: data.rules.defaults.spice })
  } catch (e) {
    if (e instanceof UsageError) return { out: '', err: e.message, code: 2 }
    throw e
  }
  opts.seed ??= randomBytes(4).toString('hex')
  const cards = []
  const problems = []
  let code = 0
  for (const request of requestsOf(opts)) {
    const r = roll(data, request)
    if (r.ok) cards.push(r.card)
    else if (r.attempts === 0) return { out: '', err: `${r.reason[0].toUpperCase()}${r.reason.slice(1)}.`, code: 2 }
    else {
      problems.push(`The card for seed ${request.seed} is unavailable: ${r.reason}.`)
      code = 1
    }
  }
  const out = opts.json ? `${JSON.stringify(opts.count === 1 ? cards[0] ?? null : cards, null, 2)}\n` : cards.map(c => renderCard(c, data)).join('\n---\n\n')
  return { out, err: problems.join('\n'), code, file: opts.out, cards }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = run(process.argv.slice(2))
  if (r.file !== undefined && r.code !== 2) {
    fs.writeFileSync(r.file, r.out, 'utf8')
    console.log(`${r.cards.length} card${r.cards.length === 1 ? '' : 's'} written.`)
  } else if (r.out) process.stdout.write(r.out.endsWith('\n') ? r.out : `${r.out}\n`)
  if (r.err) console.error(r.err)
  process.exitCode = r.code
}
