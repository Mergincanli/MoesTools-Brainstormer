// Collects every data problem the rule sheet reports (section 14) into ../data-problems.json, each with its file and
// JSON path (slash format, as the repository's own paths). It re-runs the checks of the other scripts; nothing in
// the repository is changed. Usage: node data-problems.mjs [repoRoot]
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { load, generatorLinks, linkProblem, parseRef } from './lib.mjs'
const here = path.dirname(fileURLToPath(import.meta.url))
const D = load(process.argv[2])
const out = []
const add = (kind, file, p, detail, effect, suggestion) => out.push({ kind, file, path: p, detail, effect, suggestion })

// 1. generator blocks naming a pattern that is not written (links and conflicts_with); terms that do not exist
for (const p of D.patterns) {
  for (const l of generatorLinks(p)) {
    const pr = linkProblem(D, l.ref)
    if (pr && /planned|not in the registry/.test(pr)) add('names-unwritten-pattern', p._file, l.where, `${l.field} link ${l.ref}: ${pr}`, 'no card can have it: a requires half that can never be met, or a counter no card satisfies', 'keep until the pattern is written (step 4), or name a written pattern or term')
    else if (pr && !/unit link/.test(pr)) add('names-missing-term', p._file, l.where, `${l.ref}: ${pr}`, 'the link resolves to nothing', 'fix the link')
  }
  for (const [i, c] of (p.generator.conflicts_with || []).entries()) if (!D.patternById[c]) add('names-unwritten-pattern', p._file, `generator/conflicts_with/${i}`, `conflicts_with '${c}', which is ${D.registryById[c] ? 'planned, not written' : 'not in the registry'}`, 'none today: no card can have an unwritten pattern', 'keep; it starts to work when the pattern is written')
  // 2. research-only class
  for (const [i, c] of p.generator.classes.entries()) if (D.terms.classes[c]?.source_only) add('research-only-class', p._file, `generator/classes/${i}`, `class '${c}' is research-only`, 'ignored: the generator never rolls naval', 'drop naval from generator blocks at step 4, or leave it as research information')
  for (const c of Object.keys(p.generator.class_rarity || {})) if (D.terms.classes[c]?.source_only) add('research-only-class', p._file, `generator/class_rarity/${c}`, `class_rarity names research-only class '${c}'`, 'ignored', 'as above')
}
// 3. countered_by links no card can satisfy
const cnt = JSON.parse(execSync(`node ${path.join(here, 'counters.mjs')} --json`, { env: { ...process.env, REPO: D.root } }).toString())
for (const [l, uses] of Object.entries(cnt.unsatisfiable)) for (const u of uses) {
  const [file, p] = u.split(' ')
  const why = l.startsWith('immune:') ? 'a card has no immunity part, so no card can be immune' : l.startsWith('weapon-trait:stun') ? 'rule HC1 keeps stun off card weapons (a weapon part has no cooldown), so no card has a weapon with this trait' : 'it names a pattern that is not written'
  add('countered-by-unsatisfiable', file, `${p}/ref`, `${l}: ${why}`, 'dropped from cards; each of these blocks keeps other counters that cards can satisfy', l.startsWith('weapon-trait:stun') ? 'step 4: name the stun as category:control or the stunning patterns' : 'step 4: name what beats it with a part a card can have')
}
for (const b of cnt.blocksWithout) add('no-satisfiable-counter', '', b, 'every countered_by link of this block is unsatisfiable', 'the pattern or variant is never offered', 'add a satisfiable counter')
// 4. strength / weakness links the block does not guarantee
const sw = execSync(`node ${path.join(here, 'sw-links.mjs')}`, { env: { ...process.env, REPO: D.root } }).toString().split('\n').filter(x => x.trim().startsWith('data/'))
for (const line of sw) { const [file, p, ref] = line.trim().split(/\s+/); add('strength-weakness-not-guaranteed', file, p, `${ref} is not implied or required by the block`, 'rule M2 sets it like an implied part, or the variant is not offered', 'step 4: add it to implies') }
// 5. key-bound trait and its pattern counted as two keys by scripts/validate.mjs
const keyTraits = Object.fromEntries(D.vocab['mobility-traits'].terms.filter(t => t.uses_key).map(t => [t.id, t.pattern]))
for (const p of D.patterns) {
  const blocks = [{ w: 'generator', imp: p.generator.implies || [] }, ...p.variants.map((v, i) => ({ w: `variants/${i}/overrides`, imp: v.overrides?.implies || [] }))]
  for (const b of blocks) for (const [i, l] of b.imp.entries()) {
    const t = l.startsWith('mobility-trait:') ? l.slice(15) : null
    if (t && keyTraits[t]) add('key-trait-counted-twice', p._file, `${b.w}/implies/${i}`, `implies ${l} (a key-bound trait); the ability is the same button, but scripts/validate.mjs counts the trait and the ability as two keys`, 'every card with it spends two keys on one button: at T1 it fills the whole budget', 'proposal K1 (needs approval): count a key-bound trait and its own pattern as one key')
  }
}
// 6-9. hard control
const hc = JSON.parse(execSync(`node ${path.join(here, 'hard-control.mjs')} --json`, { env: { ...process.env, REPO: D.root } }).toString())
for (const r of hc) for (const pr of r.problems || []) {
  const file = `data/patterns/${r.pattern}.json`, p = `variants/${r.index}`
  if (pr.includes('own text')) add('hard-control-tier-in-text', file, p, `${r.pattern}/${r.variant}: ${pr}`, 'offered only from T2 (rule HC2)', 'step 4: give the variant min_tier t2, or split the stun into its own variant')
  else if (pr.includes('decision 5B wants')) add('hard-control-at-t1', file, p, `${r.pattern}/${r.variant}: ${pr}`, 'offered only from T2 if Mustafa counts it as hard control (question HC)', 'decide HC; then set min_tier at step 4')
  else if (pr.includes('never offered')) add('hard-control-never-offered', file, p, `${r.pattern}/${r.variant}: ${pr}`, 'never offered', 'step 4: give it a kind that takes a cooldown, or accept it stays out')
  else if (pr.includes('no escape')) add('hard-control-no-escape', file, `player_translation/as_target`, `${r.pattern}/${r.variant}: no as_target line states the victim's escape from this effect`, 'not offered until an escape line exists (rule HC4)', 'step 4: add the escape to player_translation.as_target')
}
// 10. possible duplicates (one mechanic under two names)
add('possible-duplicate', 'data/patterns/stack-to-overload.json', 'related', 'stack-to-overload is variant-of freeze-and-shatter (block likeness 0.50); the two already conflict', 'never on one card (conflicts_with); merging stays with Mustafa at step 4 (handoff, still open)', 'Mustafa decides at step 4 whether to fold it in')
add('possible-duplicate', 'data/patterns/rally-allies.json', 'generator', 'rally-allies and resupply-allies: block likeness 0.53 and two unit abilities link both (Tempest Rising Enlightened, Vimana)', 'judged distinct on reading (a buff against a refill); not marked', 'none; recheck at step 4')
// 11. inputs with no valid card
const rolesFile = 'data/vocab/roles.json'
const ri = D.vocab.roles.terms.findIndex(t => t.id === 'transport')
for (const c of ['infantry', 'drone']) add('inputs-without-valid-card', rolesFile, `terms/${ri}/classes`, `role transport with class ${c}, at every tier, flavour and spice: the role's classes leave ${c} out (and it needs 2+ passenger seats)`, 'greyed out (listed as unavailable)', 'none: a hard ban by the word list')
// 12. patterns whose every variant needs spice 2 or more
for (const p of D.patterns) { const m = Math.min(...p.variants.map(v => v.min_spice)); if (m > 1) add('no-variant-at-spice-1', p._file, 'variants', `every variant needs spice ${m} or more`, 'never rolled at spice 1 unless the inputs need it (rule G5)', 'step 4: add a spice-1 variant if it should appear on grounded cards') }

const summary = {}
for (const o of out) summary[o.kind] = (summary[o.kind] || 0) + 1
let commit = ''
try { commit = execSync('git rev-parse --short HEAD', { cwd: D.root }).toString().trim() } catch {}
const doc = { generated_by: 'scripts/data-problems.mjs (rule-sheet folder)', data_commit: commit, note: 'Nothing was fixed. Paths use the repository slash format. Kinds and their effect under the rule sheet are explained in rule-sheet.md section 14.', counts: summary, total: out.length, problems: out }
fs.writeFileSync(path.join(here, '..', 'data-problems.json'), JSON.stringify(doc, null, 1) + '\n')
console.log('total', out.length, JSON.stringify(summary))
