// Reads the generator's data from the repository and builds the one plain object that src/core/ takes (GeneratorData
// in src/core/types.ts), and works out the data version every card records (rule G8). The module itself reads no
// files, so it runs unchanged in a browser; this loader is its Node side.
//
// Usage from another script:  import { loadGeneratorData } from './lib/generator-data.mjs'; const data = loadGeneratorData()
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** The folders whose files make up the data version, in the order they are hashed. */
export const HASHED_FOLDERS = ['data/vocab', 'data/patterns', 'data/generator']

// A byte-order mark is dropped before parsing; file names are sorted by code unit, the same order on every system.
const readJson = (root, rel) => JSON.parse(fs.readFileSync(path.join(root, ...rel.split('/')), 'utf8').replace(/^﻿/, ''))
const jsonFiles = (root, dir) => fs.readdirSync(path.join(root, ...dir.split('/'))).filter(f => f.endsWith('.json')).sort()

/**
 * The data version (G8): a content hash of the word lists, the patterns and the generator files.
 *   canonical JSON of a file = JSON.stringify(JSON.parse(its text)): no spaces and no line breaks, so formatting,
 *     indentation and line endings do not change the hash (the data, including the order of keys, does).
 *   folder hash   = sha256 of, for each .json file of the folder in name order: name + "\n" + canonical JSON + "\n".
 *   data version  = sha256 of, for each folder of HASHED_FOLDERS in that order: folder + "\n" + folder hash + "\n".
 * All text is hashed as UTF-8; hashes are written in lower-case hex.
 */
export function dataVersionOf(root = REPO_ROOT) {
  const folders = {}
  const all = crypto.createHash('sha256')
  for (const dir of HASHED_FOLDERS) {
    const h = crypto.createHash('sha256')
    const files = jsonFiles(root, dir)
    for (const f of files) h.update(`${f}\n${JSON.stringify(readJson(root, `${dir}/${f}`))}\n`, 'utf8')
    const sha256 = h.digest('hex')
    folders[dir] = { files: files.length, sha256 }
    all.update(`${dir}\n${sha256}\n`, 'utf8')
  }
  return { data_version: all.digest('hex'), folders }
}

/**
 * Everything src/core/ reads, as one plain object: the word lists, the patterns (sorted by file name), the pattern
 * registry, the link kinds of schemas/common.schema.json, the three generator files, the real names the name check
 * needs (unit names, faction names, game titles and franchises; the patterns' own example names and source terms
 * travel with the patterns) and the data version.
 */
export function loadGeneratorData(root = REPO_ROOT) {
  const vocab = {}
  for (const f of jsonFiles(root, 'data/vocab')) {
    const v = readJson(root, `data/vocab/${f}`)
    vocab[v.id] = { id: v.id, version: v.version, terms: v.terms }
  }
  const patterns = jsonFiles(root, 'data/patterns').map(f => readJson(root, `data/patterns/${f}`))
  const generator = {}
  for (const f of jsonFiles(root, 'data/generator')) {
    const d = readJson(root, `data/generator/${f}`)
    generator[d.kind] = d
  }
  for (const kind of ['rules', 'names', 'texts']) {
    if (!generator[kind]) throw new Error(`data/generator has no file of kind '${kind}'`)
  }
  const games = readJson(root, 'data/games.json').games
  const units = jsonFiles(root, 'data/units').flatMap(f => readJson(root, `data/units/${f}`).units)
  return {
    dataVersion: dataVersionOf(root).data_version,
    vocab,
    patterns,
    registry: readJson(root, 'data/pattern-registry.json').patterns,
    refKinds: readJson(root, 'schemas/common.schema.json')['x-ref-kinds'],
    rules: generator.rules,
    names: generator.names,
    texts: generator.texts,
    realNames: {
      units: units.map(u => u.name),
      factions: games.flatMap(g => g.factions.map(x => x.name)),
      games: games.map(g => (g.franchise ? { title: g.title, franchise: g.franchise } : { title: g.title })),
    },
  }
}
