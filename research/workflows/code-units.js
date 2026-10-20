export const meta = {
  name: 'batch-code-units',
  description: 'Research batch: research agents fill unit entries, each in its own copy of the repository',
  phases: [{ title: 'Code units', detail: 'one research agent per job, in an isolated workspace' }],
}

// args: {
//   batch: { id: 'r2' },
//   mode: 'opening' | 'fill',   // opening: two agents code the same units independently (runbook section 2)
//   jobs: [{ label, agent, game, ws, units: [{ id, brief }] }],  // ws made with research/workflows/mkws.sh
// }
const B = args.batch
const MODE = args.mode
const NOTES_FILE = `research/registry-notes/games-${B.id}.md`

const REPORT = {
  type: 'object',
  required: ['file_written', 'units', 'validator_result', 'copy_check_result', 'hesitations', 'gaps', 'unclear_rules', 'new_mechanics'],
  properties: {
    file_written: { type: 'string' },
    units: { type: 'array', items: { type: 'string' } },
    validator_result: { type: 'string', description: 'OK, or the error lines that remain, verbatim' },
    copy_check_result: { type: 'string' },
    hesitations: { type: 'array', items: { type: 'object', required: ['unit', 'path', 'chosen', 'alternatives', 'reason'], properties: {
      unit: { type: 'string' }, path: { type: 'string' }, chosen: { type: 'string' }, alternatives: { type: 'array', items: { type: 'string' } },
      reason: { type: 'string', description: 'which written rule, tie-break or term description left it open, if any' } } } },
    gaps: { type: 'array', items: { type: 'object', required: ['unit', 'path', 'used', 'note'], properties: {
      unit: { type: 'string' }, path: { type: 'string' }, used: { type: 'string' }, wanted: { type: 'string' }, note: { type: 'string' } } } },
    unclear_rules: { type: 'array', items: { type: 'object', required: ['topic', 'note'], properties: { topic: { type: 'string' }, note: { type: 'string' } } } },
    new_mechanics: { type: 'array', description: 'abilities or weapons whose mechanic no registry pattern covers (left with an empty patterns list and a fit_note); each a proposed pattern', items: { type: 'object',
      required: ['unit', 'path', 'proposed_id', 'summary', 'pages'], properties: {
        unit: { type: 'string' }, path: { type: 'string', description: 'e.g. abilities/0' }, proposed_id: { type: 'string', description: 'kebab-case id' },
        summary: { type: 'string', description: 'what it does and its counterplay, in two sentences' }, pages: { type: 'array', items: { type: 'string' } } } } },
    pages_read_not_cited: { type: 'array', items: { type: 'string' } },
    source_problems: { type: 'string' },
  },
}

function prompt(j) {
  const indep = MODE === 'opening'
    ? `This is the opening check of batch ${B.id.toUpperCase()}: another research agent codes the same units in a separate workspace, and the two codings are compared field by field to test the word lists on fresh units before the rest of the batch. Do not open, list or search /home/user/MoesTools-Brainstormer or any folder outside your workspace, and do not look up Unit Forge data elsewhere. Code every field exactly as the written rules say; wherever they still leave you unsure, say so in your report instead of guessing silently.`
    : `Work only inside your workspace; do not open, list or search /home/user/MoesTools-Brainstormer or any other workspace. Code every field exactly as the written rules say; wherever they leave you unsure, say so in your report instead of guessing silently.`
  return `You are research agent ${j.agent} in batch ${B.id.toUpperCase()} of Unit Forge's research run (step 3 of the plan). Unit Forge is a research database of real RTS and shooter units, coded with fixed word lists (version 1.0.0, approved), that feeds a generator of original unit concepts for Shamble Frontlines, a top-down team shooter where each player buys and becomes one unit.

## Your workspace
${j.ws}, a copy of the Unit Forge repository (no git history). Run every command from it.
${indep}

## Task
Research and fill in these units, using exactly these unit ids:
${j.units.map(u => `- \`${u.id}\`: ${u.brief}`).join('\n')}

If data/units/${j.game}.json already exists, add your units after the units in it and leave those exactly as they are. Otherwise create it with this header: {"$schema": "../../schemas/source-unit.schema.json", "schema_version": "1.0.0", "vocab_version": "1.0.0", "game": "${j.game}", "units": [ ... ]}.
Fill every field the schema allows that applies to the unit, as the real research run does: the required fields, plus every optional field the unit's facts call for.

## Read first, fully
1. docs/fields.md: the Conventions and the whole "Source unit" section. Field descriptions say how to decide each field, often step by step.
2. docs/vocabularies.md: every word list a field uses, with each term's coding rule and each list's tie-breaks (the JSON in data/vocab/ is the same).
3. data/games.json: the \`${j.game}\` entry (version_researched, factions, tier_map, cost_thresholds, speed_reference, sight_reference, range_reference, damage_map, armour_map).
4. ${NOTES_FILE}: the notes for this batch, including the official role lines and the Game-wide mechanics for ${j.game}.
5. data/pattern-registry.json and data/patterns/*.json: the pattern ids abilities and weapons link to. Link only ids in the registry; never edit data/patterns/ or the registry (the validator's warnings about planned patterns and source_units are expected). A mechanic no id covers gets an empty patterns list with a fit_note saying what is wanted, and goes in new_mechanics in your report.
6. data/units/ra3.json and the other files in data/units/: worked examples coded under the same rules (docs/samples.md shows three of them readably).
7. schemas/source-unit.schema.json and schemas/common.schema.json for exact shapes.

## Research rules
- Cite the pages you actually read, official pages and established wikis first, up to the five the schema allows; fill each source's supports with the field paths it backs. Name every other page a code rests on in an uncertain entry, as the sources rule says.
- Paraphrase everything. Never copy a run of six or more words from a source; no flavour text, no images.
- Mechanics over numbers: figures only where the fields doc allows them.
- Set confidence; put doubts in uncertain, and every place where no term fitted well in fit_notes.
- Fields the fields doc marks as a proposal are design suggestions for a player-controlled version. Fill them too.
- review: {"status": "unchecked"}; researched_by: "batch ${B.id}, agent ${j.agent}".
- Wikis: read them through their MediaWiki API (https://cnc.fandom.com/api.php?action=parse&page=<Title>&prop=wikitext&format=json for the Command & Conquer Wiki; the batch's note names the others). Space requests about two seconds apart and retry after a 429. Cite the normal page URL.

## Check before you finish
1. \`node scripts/format-json.mjs data/units/${j.game}.json\`.
2. \`node scripts/validate.mjs .\`: no errors. Every ATYPICAL line about your units must be recorded in that unit's atypical list under its exact rule string, with a note.
3. \`node scripts/copy-check.mjs . --only <part of each source URL you cite>\`: exit 0 (exit 1 means copied wording: rewrite and run again; exit 3 means pages could not be fetched: say which). A cited PDF is not read by the copy-check: extract its text and compare your prose with it yourself.

## Report (your final answer)
- file_written, units, validator_result, copy_check_result.
- hesitations: every field where you hesitated between two or more terms or values, with the path, your choice, the alternatives and which rule left it open (or that the rule was clear but the source was not). Be thorough.
- gaps, unclear_rules, new_mechanics, pages_read_not_cited, source_problems.`
}

const results = await parallel((args.jobs || []).map(j => () =>
  agent(prompt(j), { label: `${MODE}:${j.label}`, phase: 'Code units', schema: REPORT }).then(r => r && ({ label: j.label, ws: j.ws, game: j.game, ...r }))))
log(`done: ${results.filter(Boolean).length} of ${(args.jobs || []).length}`)
return { results: results.filter(Boolean), failed: (args.jobs || []).filter((j, i) => !results[i]).map(j => j.label) }
