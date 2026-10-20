export const meta = {
  name: 'batch-reconcile',
  description: 'Research batch opening check: merge the two independent codings of each unit into the final entry',
  phases: [{ title: 'Reconcile', detail: 'one agent per unit, in its own workspace' }],
}

// args: { batch: { id: 'r2' }, units: [{ id, game, ws, a, b, reportA, reportB, diff }] }
// a and b are the two coders' unit files; reportA and reportB their reports; diff names the fields they split on.
const B = args.batch
const NOTES_FILE = `research/registry-notes/games-${B.id}.md`

const REPORT = { type: 'object', required: ['file_written', 'decisions', 'validator_result', 'copy_check_result'], properties: {
  file_written: { type: 'string' },
  decisions: { type: 'array', items: { type: 'object', required: ['path', 'chosen', 'why'], properties: {
    path: { type: 'string' }, a: { type: 'string' }, b: { type: 'string' }, chosen: { type: 'string' }, why: { type: 'string', description: 'which rule and which page decide it' } } } },
  rule_problems: { type: 'array', items: { type: 'string' }, description: 'places where both coders followed the written rules and the result still looks wrong for the unit, with the rule text and the fix you would propose' },
  validator_result: { type: 'string' }, copy_check_result: { type: 'string' },
} }

function prompt(u) {
  return `Unit Forge is a research database of real RTS and shooter units, coded with fixed word lists (version 1.0.0, approved) and field rules, that feeds a generator of original unit concepts for a top-down team shooter. In batch ${B.id.toUpperCase()}'s opening check, two research agents coded \`${u.id}\` independently. They agreed on every measured field${u.diff ? ` except: ${u.diff}` : ''}. Your job is to produce the one final entry.

## Your workspace
${u.ws}, a copy of the repository (no git history). Work only there.

## Inputs
- Coding A: ${u.a}. Coding B: ${u.b}. Each is a full unit file.
- The coders' reports (their hesitations, gaps, unclear rules and pages read but not cited): ${u.reportA} and ${u.reportB}.
- The rules: docs/fields.md (Conventions and the Source unit section), docs/vocabularies.md, data/games.json (the \`${u.game}\` entry), ${NOTES_FILE} (this game's official role lines, game-wide mechanics and research notes), and data/units/ as worked examples.

## Task
1. Start from the coding whose text is clearer and better sourced, and write the unit into data/units/${u.game}.json in your workspace (add it after any units already there; header for a new file: {"$schema": "../../schemas/source-unit.schema.json", "schema_version": "1.0.0", "vocab_version": "1.0.0", "game": "${u.game}", "units": [ ... ]}).
2. Every field where A and B differ: decide by the written rules and the sources. Fetch the pages yourself where needed (wikis through their API, two seconds apart, retry after a 429). Record each decision.
3. Text fields (summaries, notes, uncertain, fit_notes, matchups): merge the best of both. Keep every uncertain point either coder raised that still holds, and the pages a code rests on (cited, up to five, or named in uncertain). Matchups are open choices: keep the strongest and best-sourced from both, within the schema's limits.
4. researched_by: "batch ${B.id}, opening check (agents A and B, reconciled)"; review: {"status": "unchecked"}.
5. Where both coders followed the rules and the result still looks wrong for the unit, do not override the rule: keep the coded value, add an uncertain entry, and report it under rule_problems with the rule text and the fix you would propose.
6. Check: node scripts/format-json.mjs data/units/${u.game}.json; node scripts/validate.mjs . (no errors; every ATYPICAL line about the unit recorded in its atypical list); node scripts/copy-check.mjs . --only <part of each cited URL> (exit 0). Paraphrase only: never six or more words copied from a page.

Report the file, your decisions, any rule problems, and the check results.`
}

const out = await parallel(args.units.map(u => () => agent(prompt(u), { label: `reconcile:${u.id}`, phase: 'Reconcile', schema: REPORT }).then(r => r && ({ id: u.id, ...r }))))
return out.filter(Boolean)
