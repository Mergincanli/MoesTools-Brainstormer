// Picks what the research checker re-checks against the sources after a research batch:
// for each game, 1 in 5 of its units (rounded up, at least 3, or all of them when the game has 3 or fewer),
// plus every pattern with status 'proposed'.
//
// Usage: node scripts/sample-for-check.mjs --seed <text> [--game <id>] [--json] [--root <dir>]
//
// The pick is deterministic: each unit id is hashed together with the seed (SHA-256) and the lowest hashes
// win, so the same seed and the same units always give the same sample, and nobody can steer it once the
// seed is fixed. Use a fresh seed per batch (for example the batch id and the date) and record it in the
// checker's report.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** How many of a game's n units to check: 1 in 5 rounded up, at least 3, never more than n. */
export function pickCount(n) {
  return n <= 3 ? n : Math.max(3, Math.ceil(n / 5))
}

const rankOf = (seed, id) => crypto.createHash('sha256').update(`${seed}\n${id}`).digest('hex')

/** Picks pickCount(ids.length) ids for this seed; returned sorted by id. */
export function sampleIds(ids, seed) {
  const ranked = [...new Set(ids)].map(id => ({ id, h: rankOf(seed, id) }))
  ranked.sort((a, b) => (a.h < b.h ? -1 : a.h > b.h ? 1 : a.id < b.id ? -1 : 1))
  return ranked.slice(0, pickCount(ranked.length)).map(x => x.id).sort()
}

const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'))
const jsonFiles = d => (fs.existsSync(d) ? fs.readdirSync(d).filter(f => f.endsWith('.json')).sort().map(f => path.join(d, f)) : [])

/** Builds the sample from the data under root: { seed, games: [{ game, total, picked }], patterns }. */
export function buildSample(root, { seed, game = null }) {
  const byGame = new Map()
  for (const f of jsonFiles(path.join(root, 'data/units'))) {
    for (const u of readJson(f).units || []) {
      if (!byGame.has(u.game)) byGame.set(u.game, [])
      byGame.get(u.game).push(u.id)
    }
  }
  const known = new Set(byGame.keys())
  const gamesFile = path.join(root, 'data/games.json')
  if (fs.existsSync(gamesFile)) for (const g of readJson(gamesFile).games || []) known.add(g.id)
  if (game && !known.has(game)) throw new Error(`unknown game '${game}' (not in data/games.json and no units)`)

  const ids = game ? [game] : [...byGame.keys()].sort()
  const games = ids.map(g => {
    const units = byGame.get(g) || []
    return { game: g, total: units.length, picked: sampleIds(units, seed) }
  })
  const patterns = jsonFiles(path.join(root, 'data/patterns'))
    .map(readJson)
    .filter(p => p.status === 'proposed')
    .map(p => p.id)
    .sort()
  return { seed, games, patterns }
}

function parseArgs(argv) {
  const opts = { seed: null, game: null, json: false, root: REPO_ROOT }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--seed') opts.seed = argv[++i]
    else if (a === '--game') opts.game = argv[++i]
    else if (a === '--root') opts.root = path.resolve(argv[++i])
    else if (a === '--json') opts.json = true
    else throw new Error(`unknown argument '${a}'`)
  }
  if (!opts.seed) throw new Error('--seed <text> is required')
  return opts
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let opts, sample
  try {
    opts = parseArgs(process.argv.slice(2))
    sample = buildSample(opts.root, opts)
  } catch (e) {
    console.error(`${e.message}\nusage: node scripts/sample-for-check.mjs --seed <text> [--game <id>] [--json] [--root <dir>]`)
    process.exit(2)
  }
  if (opts.json) {
    console.log(JSON.stringify(sample, null, 2))
  } else {
    console.log(`Checker sample for seed '${sample.seed}': 1 in 5 units per game (at least 3), plus every proposed pattern`)
    for (const g of sample.games) {
      console.log(`\n${g.game}: ${g.picked.length} of ${g.total} unit(s)`)
      for (const id of g.picked) console.log(`  ${id}`)
    }
    console.log(`\nproposed patterns: ${sample.patterns.length}`)
    for (const id of sample.patterns) console.log(`  ${id}`)
  }
}
