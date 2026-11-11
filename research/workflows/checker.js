export const meta = {
  name: 'batch-checker',
  description: 'Research batch checker: re-open the sources of the sampled units and patterns; a skeptic re-checks each field marked wrong',
  phases: [{ title: 'Check', detail: 'one checker per group; none checks its own work' }, { title: 'Verify', detail: 'a skeptic re-checks every field marked wrong' }],
}

// args: {
//   batch: { id: 'r1' },
//   seed: 'r1-2026-10-21',          // the npm run sample seed, recorded in the report
//   repo: '/home/user/MoesTools-Brainstormer',   // or a workspace holding the integrated batch
//   groups: [{ label, units: [ids], patterns: [ids] }],   // from npm run sample -- --seed <seed> --json
//   progress: '<scratchpad>/r<N>/progress/checker',   // the agents' notes, outside the repository; the same folder on a resume
// }
// More than 15% wrong fields (after the skeptic) means the batch is redone for that game (runbook section 6).
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
const ROOT = args.repo
if (!args.progress) throw new Error('args.progress is required: a folder outside the repository for the agents\' notes (runbook, "Progress notes")')

const CHECK = { type: 'object', required: ['records'], properties: { records: { type: 'array', items: { type: 'object', required: ['id', 'fields'], properties: {
  id: { type: 'string', description: 'unit or pattern id' },
  fields: { type: 'array', items: { type: 'object', required: ['path', 'coded', 'verdict', 'evidence'], properties: {
    path: { type: 'string' }, coded: { type: 'string', description: 'the value as coded' },
    verdict: { enum: ['ok', 'wrong', 'unsupported'], description: 'wrong: the sources show another value; unsupported: no page read backs it' },
    evidence: { type: 'string', description: 'the page URL and what it shows, paraphrased' }, fix: { type: 'string' } } } },
  pages_opened: { type: 'array', items: { type: 'string' } } } } } } }
const VERDICTS = { type: 'object', required: ['verdicts'], properties: { verdicts: { type: 'array', items: { type: 'object', required: ['id', 'path', 'confirmed', 'reason', 'evidence'], properties: {
  evidence: { type: 'string', description: 'the page URL fetched or the command run, and what it showed, paraphrased' },
  id: { type: 'string' }, path: { type: 'string' }, confirmed: { type: 'boolean', description: 'true when the field really is wrong or unsupported' }, reason: { type: 'string' }, fix: { type: 'string' } } } } } }

// Progress notes (docs/research-runbook.md, "Progress notes"): an agent cut off part way and started again with
// the same task goes on from its notes instead of starting over. root is the repository or copy it works in.
const saving = (dir, root) => `## Saving your progress
A usage limit can cut you off part way, and you would then be started again with this same task. So keep notes in ${dir}/progress.md (make the folder; you may always write there).
- Look there first. If the notes are for another task (their first line names the task), move them into ${dir}/old/ and start fresh. If they end with DONE, write your answer from them without redoing the work. Otherwise go on from where they stop, without redoing the steps they mark done.
- A new notes file starts with one line naming your task. After each step you finish (a unit or record done, a page read, a check run), add a line or two: what is done, what you found and where (page URL or file), what comes next. Keep them short: just enough to write your answer without opening the pages again.
- When the work is done, add a last line DONE, then give your answer.
Pages fetched before are cached in ${root}/.cache/sources/<site>/ (one JSON file per page, named after its path; the raw field holds the page text or, for a wiki page, its source, and the rendered field holds the rendered wiki page): look there before fetching a page. Read long files and pages in parts, by searching for the section you need.`

const COMMON = `Unit Forge (repository or copy at ${ROOT}; read only for you, never edit a file) is a research database of real RTS and shooter units and mechanic patterns, coded with fixed word lists (version 1.1.0, approved) and field rules (docs/fields.md, docs/vocabularies.md), that feeds a generator of original unit concepts for a top-down team shooter. You are the separate checker of research batch ${B.id.toUpperCase()} (docs/proposal.md, section 2.2, step 3; docs/research-runbook.md, section 6); sample seed "${args.seed}". You wrote none of these records. Read the batch's notes (research/registry-notes/games-${B.id}.md) and the registry entries (data/games.json) the records rely on. Read pages with the page reader (see the rules at the end of this brief).`

function checkPrompt(g) {
  return `${COMMON}

${saving(`${args.progress}/check-${g.label}`, ROOT)}

## Records to check
Units: ${g.units.join(', ') || 'none'}. Patterns: ${g.patterns.join(', ') || 'none'}.

For each record, re-open its cited pages and the pages its uncertain entries name, then check field by field. On every unit, list each of these fields in fields, even when ok: tier.band, tier.gate, cost_band.band, cost_band.raw, class, roles.primary, mobility.speed, armour.class; for each weapon family, damage, range and can_target; for each ability kind, source, cooldown and patterns. Then add the other fields you can check from the pages: class, roles, mobility and speed, armour, weapons (family, damage, range, targets, traits, mount), crew, death, sensors, sources[].supports, and for patterns the source_units, other_examples and their sources. Apply the written rules exactly: a field is wrong only when the pages and the rules give another value; a field no page backs is unsupported. Record every field you checked, with the coded value, your verdict and the evidence. Do not edit files (your notes aside).`
}

function verifyPrompt(g, c) {
  const bad = c.records.flatMap(r => r.fields.filter(f => f.verdict !== 'ok').map(f => ({ id: r.id, ...f })))
  return `${COMMON}

${saving(`${args.progress}/verify-${g.label}`, ROOT)}

## Your job: try to refute the checker's findings
The checker marked these fields wrong or unsupported. For each, fetch the pages and apply the written rules yourself. confirmed=true when the field really is wrong or unsupported; give the right value. When you cannot open the page or cannot tell, set confirmed=true and say so in the reason: a field nobody could check counts as unsupported. Give the evidence for every verdict.

${JSON.stringify(bad, null, 1)}`
}

const out = await pipeline(
  args.groups,
  g => ask(checkPrompt(g), { label: `check:${g.label}`, phase: 'Check', schema: CHECK }),
  (c, g) => c && (c.records.some(r => r.fields.some(f => f.verdict !== 'ok'))
    ? ask(verifyPrompt(g, c), { label: `verify:${g.label}`, phase: 'Verify', schema: VERDICTS }).then(v => ({ group: g.label, check: c, verdicts: v || null, unverified: !v }))
    : { group: g.label, check: c, verdicts: { verdicts: [] } }),
)
// A group with no result, or whose skeptic returned nothing, is not done: run it again on its own.
// A field the skeptic could not check counts as unsupported (runbook section 6).
return {
  results: out.filter(Boolean),
  failed: args.groups.filter((g, i) => !out[i]).map(g => g.label),
  unverified: out.filter(r => r && r.unverified).map(r => r.group),
}
