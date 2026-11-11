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
// Each agent keeps its notes in <ws>/.progress/<stage>/, so a resumed run goes on from them (runbook, "Progress notes").
const B = args.batch

// Rules every agent gets with its brief, word for word (docs/research-runbook.md, "The quality bar"): the rule on
// evidence that Mustafa approved on 11 November 2026, tool problems reported apart from the hesitations, and how to
// read a page (scripts/page-text.mjs). args.batch.rules (args.round.rules in a rule-fix round) adds a batch's own rules, such as a
// site that must not be fetched.
const EVIDENCE_RULE = 'Evidence: give the page\'s address and where on the page it is (the section or box), and say in your own words what it shows. Never copy six or more words in a row from a page, in any field of your answer, your notes or a file, the evidence included; give a figure or a name as it is, and paraphrase everything else.'
const TOOL_RULE = 'Tool problems: when a tool fails you or cannot do its job (a script that crashes, a check that cannot read a page, a site that refuses you), list it in tool_problems, apart from your hesitations: the tool, what you asked of it and what happened. Leave the list empty when there were none.'
const WIKI_RULE = 'Reading pages: read a page with `node scripts/page-text.mjs <page address>`, run from the root of the repository or of your workspace. It prints the page as plain text: for a wiki page its source and then the rendered page, which also holds what templates kept on other pages draw in, such as an ability box. It reads the page cache first and keeps what it fetches there. Do not fetch a rendered wiki page as HTML yourself: it is ten to twenty times the size.'
const BATCH_RULES = (args.batch && args.batch.rules) || (args.round && args.round.rules) || ''
const RULES = `## Rules for every answer\n- ${EVIDENCE_RULE}\n- ${TOOL_RULE}\n- ${WIKI_RULE}${BATCH_RULES ? `\n- For this batch: ${BATCH_RULES}` : ''}`
const TOOL_PROBLEMS = { type: 'array', items: { type: 'string' }, description: 'tool problems, one line each: the tool, what you asked of it and what happened; empty when there were none' }
// ask() is agent() with the rules at the end of the brief and a tool_problems list in the answer.
const ask = (prompt, opts = {}) => agent(`${prompt}\n\n${RULES}`, opts.schema ? { ...opts, schema: { ...opts.schema, properties: { ...opts.schema.properties, tool_problems: TOOL_PROBLEMS } } } : opts)
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

// Progress notes (docs/research-runbook.md, "Progress notes"): an agent cut off part way and started again with
// the same task goes on from its notes instead of starting over. root is the repository or copy it works in.
const saving = (dir, root) => `## Saving your progress
A usage limit can cut you off part way, and you would then be started again with this same task. So keep notes in ${dir}/progress.md (make the folder; you may always write there).
- Look there first. If the notes are for another task (their first line names the task), move them into ${dir}/old/ and start fresh. If they end with DONE, write your answer from them without redoing the work. Otherwise go on from where they stop, without redoing the steps they mark done.
- A new notes file starts with one line naming your task. After each step you finish (a unit or record done, a page read, a check run), add a line or two: what is done, what you found and where (page URL or file), what comes next. Keep them short: just enough to write your answer without opening the pages again.
- When the work is done, add a last line DONE, then give your answer.
Pages fetched before are cached in ${root}/.cache/sources/<site>/ (one JSON file per page, named after its path; the raw field holds the page text or, for a wiki page, its source, and the rendered field holds the rendered wiki page): look there before fetching a page. Read long files and pages in parts, by searching for the section you need.`

function prompt(j) {
  const indep = MODE === 'opening'
    ? `This is the opening check of batch ${B.id.toUpperCase()}: another research agent codes the same units in a separate workspace, and the two codings are compared field by field to test the word lists on fresh units before the rest of the batch. Do not open, list or search /home/user/MoesTools-Brainstormer or any folder outside your workspace, and do not look up Unit Forge data elsewhere. Code every field exactly as the written rules say; wherever they still leave you unsure, say so in your report instead of guessing silently.`
    : `Work only inside your workspace; do not open, list or search /home/user/MoesTools-Brainstormer or any other workspace. Code every field exactly as the written rules say; wherever they leave you unsure, say so in your report instead of guessing silently.`
  return `You are research agent ${j.agent} in batch ${B.id.toUpperCase()} of Unit Forge's research run (step 3 of the plan). Unit Forge is a research database of real RTS and shooter units, coded with fixed word lists (version 1.1.0, approved), that feeds a generator of original unit concepts for Shamble Frontlines, a top-down team shooter where each player buys and becomes one unit.

## Your workspace
${j.ws}, a copy of the Unit Forge repository (no git history). Run every command from it.
${indep}

${saving(`${j.ws}/.progress/code`, j.ws)}

## Task
Research and fill in these units, using exactly these unit ids:
${j.units.map(u => `- \`${u.id}\`: ${u.brief}`).join('\n')}

If data/units/${j.game}.json already exists, add your units after the units in it and leave those exactly as they are. Otherwise create it with this header: {"$schema": "../../schemas/source-unit.schema.json", "schema_version": "1.0.0", "vocab_version": "1.1.0", "game": "${j.game}", "units": [ ... ]}.
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
- Pages: read them with the page reader (see the rules at the end of this brief). To find a page's title, ask the wiki's own API (action=query or opensearch; the batch's note names the wikis), about two seconds between requests, and retry after a 429. Cite the normal page URL.

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
  ask(prompt(j), { label: `${MODE}:${j.label}`, phase: 'Code units', schema: REPORT }).then(r => r && ({ label: j.label, ws: j.ws, game: j.game, ...r }))))
log(`done: ${results.filter(Boolean).length} of ${(args.jobs || []).length}`)
return { results: results.filter(Boolean), failed: (args.jobs || []).filter((j, i) => !results[i]).map(j => j.label) }
