// Writes data/manifest.json: the data version every rolled card records (rule G8), a content hash of the word lists
// (data/vocab), the patterns (data/patterns) and the generator files (data/generator), with each folder's own hash.
// How the hash is made: dataVersionOf in scripts/lib/generator-data.mjs. A card rolled before a data change is not
// rebuilt by its seed afterwards; the data version on the card says which data it was rolled on.
//
// Usage:
//   node scripts/build-manifest.mjs [root]           write the file (only when it changed)
//   node scripts/build-manifest.mjs --check [root]   write nothing; exit 1 when the file is missing or out of date
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { formatText } from './format-json.mjs'
import { HASHED_FOLDERS, REPO_ROOT, dataVersionOf } from './lib/generator-data.mjs'

export const MANIFEST = 'data/manifest.json'

/** The manifest's content for the data under root. */
export function manifestOf(root = REPO_ROOT) {
  const { data_version, folders } = dataVersionOf(root)
  return {
    description:
      'The data version a rolled card records (generator.data_version, rule G8): a content hash of the word lists, the patterns and the generator files. Written by npm run manifest; checked by npm run manifest:check.',
    algorithm: `sha256 over ${HASHED_FOLDERS.join(', ')}: each file's parsed-and-reserialised JSON, by folder in name order (scripts/lib/generator-data.mjs)`,
    data_version,
    folders,
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const check = args.includes('--check')
  const root = path.resolve(args.find(a => !a.startsWith('--')) || REPO_ROOT)
  const file = path.join(root, ...MANIFEST.split('/'))
  const want = manifestOf(root)
  let have
  try {
    have = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    have = undefined
  }
  // The data is compared, not the bytes: formatting is the formatter's check, line endings are nobody's.
  const same = have !== undefined && JSON.stringify(have) === JSON.stringify(want)
  if (check) {
    if (same) console.log(`OK       ${MANIFEST} is up to date (data version ${want.data_version})`)
    else {
      console.log(`ERROR    ${MANIFEST} is ${have === undefined ? 'missing or not JSON' : 'out of date'}: run npm run manifest`)
      process.exitCode = 1
    }
  } else if (same) console.log(`${MANIFEST} is up to date (data version ${want.data_version})`)
  else {
    fs.writeFileSync(file, formatText(JSON.stringify(want)))
    console.log(`wrote ${MANIFEST} (data version ${want.data_version})`)
  }
}
