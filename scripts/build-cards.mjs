// Builds docs/cards.md, the page of sample cards: twelve cards from fixed seeds, rendered by scripts/lib/render-card.mjs
// (the same renderer as `npm run roll`).
//
//   node scripts/build-cards.mjs [--check]
//
// --check builds the page in memory and exits 1 when the file on disk differs (byte for byte, line endings included);
// without it the page is written.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGeneratorData, REPO_ROOT } from './lib/generator-data.mjs'
import { renderCard } from './lib/render-card.mjs'
import { GENERATOR_VERSION } from '../src/core/card.ts'
import { roll } from '../src/core/roll.ts'

export const PAGE = 'docs/cards.md'

/** The cards of the page: the three flavours at T1, T2 and T3 (class and role left to the dice), then one card per
 *  flavour at spice 5. The seeds were picked so that the nine show six classes, and the twelve no name word, role or
 *  signature noun twice where the dice allowed it. */
export const SAMPLES = [
  { seed: 'soviet-t1-1', spice: 2, inputs: { flavour: 'soviet', tier: 't1' } },
  { seed: 'soviet-t2-2', spice: 3, inputs: { flavour: 'soviet', tier: 't2' } },
  { seed: 'soviet-t3-4', spice: 3, inputs: { flavour: 'soviet', tier: 't3' } },
  { seed: 'allied-t1-6', spice: 2, inputs: { flavour: 'allied', tier: 't1' } },
  { seed: 'allied-t2-5', spice: 3, inputs: { flavour: 'allied', tier: 't2' } },
  { seed: 'allied-t3-29', spice: 3, inputs: { flavour: 'allied', tier: 't3' } },
  { seed: 'empire-t1-1', spice: 2, inputs: { flavour: 'empire', tier: 't1' } },
  { seed: 'empire-t2-8', spice: 3, inputs: { flavour: 'empire', tier: 't2' } },
  { seed: 'empire-t3-3', spice: 3, inputs: { flavour: 'empire', tier: 't3' } },
  { seed: 'soviet-wild-7', spice: 5, inputs: { flavour: 'soviet' } },
  { seed: 'allied-wild-2', spice: 5, inputs: { flavour: 'allied' } },
  { seed: 'empire-wild-40', spice: 5, inputs: { flavour: 'empire' } },
]

/** The page's text. */
export function buildCards(data = loadGeneratorData()) {
  const cards = SAMPLES.map(s => {
    const r = roll(data, s)
    if (!r.ok) throw new Error(`the sample card for seed ${s.seed} is unavailable: ${r.reason}`)
    return r.card
  })
  const steering = '`--flavour soviet`, `--tier t2`, `--class walker`, `--role scout` or `--spice 4`'
  const lines = [
    '# Sample cards',
    '',
    'Twelve concept cards, straight out of the card generator: nothing on them was written by hand. Each one is what',
    'the rules make of one seed. Read them to judge whether the cards feel right.',
    '',
    'Every weight, count and point behind these cards is a starting value. They will change as the rules are tuned,',
    'and so will the cards.',
    '',
    `Roll your own: \`npm run roll -- --seed <any text>\`. Add ${steering} to steer it,`,
    'and `--count 5` for five at once.',
    '',
    `Rolled on data version \`${data.dataVersion}\` with generator version ${GENERATOR_VERSION}.`,
    '',
    'Spice runs from 1 (grounded: common parts that fit the flavour) to 5 (wild: rare mixes).',
    '',
    '## The three flavours at each tier',
    '',
    'Spice 2 at tier 1 and spice 3 at tiers 2 and 3. The flavour and the tier were chosen; the dice chose the rest.',
    '',
  ]
  cards.slice(0, 9).forEach(c => lines.push(renderCard(c, data, { level: 3 }), ''))
  lines.push('## One wild card per flavour', '', 'Spice 5. Only the flavour was chosen.', '')
  cards.slice(9).forEach(c => lines.push(renderCard(c, data, { level: 3 }), ''))
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const bad = args.find(a => a !== '--check')
  if (bad) {
    console.error(`unknown argument: ${bad}\nusage: node scripts/build-cards.mjs [--check]`)
    process.exit(2)
  }
  const text = buildCards()
  const file = path.join(REPO_ROOT, PAGE)
  if (args.includes('--check')) {
    let same = false
    try {
      same = fs.readFileSync(file).equals(Buffer.from(text, 'utf8'))
    } catch {
      same = false
    }
    console.log(same ? `${PAGE} is up to date` : `out of date: ${PAGE}; run npm run cards`)
    process.exitCode = same ? 0 : 1
  } else {
    fs.writeFileSync(file, text, 'utf8')
    console.log(`${PAGE} written`)
  }
}
