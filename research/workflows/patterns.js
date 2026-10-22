export const meta = {
  name: 'batch-patterns',
  description: 'Research batch: write proposed pattern files for new and planned pattern ids, each checked by a skeptic and corrected',
  phases: [
    { title: 'Write', detail: 'one writer per group, in its own workspace' },
    { title: 'Verify', detail: 'a skeptic re-checks each pattern against its sources, the schema and the units' },
    { title: 'Fix', detail: 'the writer applies the confirmed corrections' },
  ],
}

// args: {
//   batch: { id: 'r1' },
//   groups: [{ label, ws, patterns: [{ id, kind: 'new' | 'planned', summary, units: [unit ids], hint }] }],
// }
// Each ws is a copy of the repository (mkws.sh) that already holds the batch's integrated units.
// Each agent keeps its notes in <ws>/.progress/<stage>/, so a resumed run goes on from them (runbook, "Progress notes").
// The writers only write data/patterns/<id>.json (and, for new ids, the registry entry in their own copy);
// the links to add on the units come back in the report, and the integrator applies them in one place.
const B = args.batch

const WRITE = { type: 'object', required: ['files', 'registry_entries', 'unit_links', 'checks'], properties: {
  files: { type: 'array', items: { type: 'string' }, description: 'pattern files written, workspace-relative' },
  registry_entries: { type: 'array', description: 'for new ids only: the entry to add to data/pattern-registry.json', items: { type: 'object', required: ['id', 'name', 'category', 'summary'], properties: {
    id: { type: 'string' }, name: { type: 'string' }, category: { type: 'string' }, summary: { type: 'string' } } } },
  unit_links: { type: 'array', description: 'links the integrator must add on the units', items: { type: 'object', required: ['unit', 'path', 'pattern'], properties: {
    unit: { type: 'string' }, path: { type: 'string', description: 'e.g. abilities/2 or armament/0' }, pattern: { type: 'string' },
    remove_fit_note: { type: 'string', description: 'the fit_notes path whose note asked for this pattern, if any' } } } },
  open_points: { type: 'array', items: { type: 'string' } },
  checks: { type: 'string', description: 'format, validate and copy-check results' },
} }
const VERDICTS = { type: 'object', required: ['verdicts'], properties: { verdicts: { type: 'array', items: { type: 'object', required: ['pattern', 'path', 'real', 'reason', 'evidence'], properties: {
  evidence: { type: 'string', description: 'the page URL fetched or the command run, and what it showed, paraphrased' },
  pattern: { type: 'string' }, path: { type: 'string', description: 'the field in the pattern file' }, real: { type: 'boolean', description: 'true when this is a confirmed problem' },
  reason: { type: 'string' }, correction: { type: 'string' } } } } } }
const FIXED = { type: 'object', required: ['applied', 'not_applied', 'checks'], properties: {
  applied: { type: 'array', items: { type: 'string' } }, not_applied: { type: 'array', items: { type: 'string' } }, checks: { type: 'string' } } }

// Progress notes (docs/research-runbook.md, "Progress notes"): an agent cut off part way and started again with
// the same task goes on from its notes instead of starting over. root is the repository or copy it works in.
const saving = (dir, root) => `## Saving your progress
A usage limit can cut you off part way, and you would then be started again with this same task. So keep notes in ${dir}/progress.md (make the folder; you may always write there).
- Look there first. If the notes are for another task (their first line names the task), move them into ${dir}/old/ and start fresh. If they end with DONE, write your answer from them without redoing the work. Otherwise go on from where they stop, without redoing the steps they mark done.
- A new notes file starts with one line naming your task. After each step you finish (a unit or record done, a page read, a check run), add a line or two: what is done, what you found and where (page URL or file), what comes next. Keep them short: just enough to write your answer without opening the pages again.
- When the work is done, add a last line DONE, then give your answer.
Pages fetched before are cached in ${root}/.cache/sources/<site>/ (one JSON file per page, named after its path; the raw field holds the page text): look there before fetching a page. Read long files and pages in parts, by searching for the section you need.`

const COMMON = g => `Unit Forge (your workspace: ${g.ws}, a copy of the repository with no git history; work only there) is a research database of real RTS and shooter units and of mechanic patterns, coded with fixed word lists (version 1.0.0, approved), that feeds a generator of original unit concepts for Shamble Frontlines, a top-down team shooter where each player buys and becomes one unit. A pattern is a mechanic that many units share, written so the generator can roll it onto a player-controlled unit. Batch ${B.id.toUpperCase()} of the research run (docs/research-runbook.md, section 5) now writes the patterns its units need. House rules: paraphrase only (never six or more words copied from a page), no images, mechanics over numbers, cite the pages you read (wikis through their API, two seconds apart, retry after a 429).`

function writePrompt(g) {
  return `${COMMON(g)}

${saving(`${g.ws}/.progress/write`, g.ws)}

## Your patterns
${g.patterns.map(p => `- \`${p.id}\` (${p.kind === 'new' ? 'new id, not in the registry yet' : 'registered, no file yet'}): ${p.summary}. Batch units that use it: ${p.units.join(', ')}.${p.hint ? ` ${p.hint}` : ''}`).join('\n')}

## Read first
schemas/pattern.schema.json (every field and its description), the three written patterns in data/patterns/ as worked examples, the Pattern section of docs/fields.md, docs/vocabularies.md for the lists the pattern uses, data/pattern-registry.json (categories and every existing id: never make a duplicate of one), research/registry-notes/patterns.md, and the batch's units that use each pattern (data/units/*.json).

## Task
1. For each pattern, write data/patterns/<id>.json with status "proposed", review {"status": "unchecked"} and every field the schema allows that applies. source_units lists the batch units that use it (the merge pass keeps it up to date later). other_examples come from other games and franchises, each with its sources and confidence; research them. player_translation, team_play, build_difficulty, risks, variants and the generator rules say how it works for a player-controlled unit in a team shooter.
2. For a new id, also add its entry to data/pattern-registry.json in your workspace (same shape as the others), and return it in registry_entries.
3. Do not edit data/units/: return in unit_links each ability or weapon of the batch's units that should link the pattern, with the fit_notes path to remove where a note asked for it.
4. Check: node scripts/format-json.mjs data/patterns/<id>.json data/pattern-registry.json; node scripts/validate.mjs . (no errors from your files); node scripts/copy-check.mjs . --only <part of each URL you cite> (exit 0).

Report the files, registry entries, unit links, open points and checks.`
}

function verifyPrompt(g, w) {
  return `${COMMON(g)}

${saving(`${g.ws}/.progress/verify`, g.ws)}

## Your job: try to refute the patterns another agent wrote
Files: ${w.files.join(', ')} (in the workspace). Registry entries proposed: ${JSON.stringify(w.registry_entries)}. Unit links proposed: ${JSON.stringify(w.unit_links)}.
Check each pattern against its cited pages (fetch them), the schema's field descriptions, the word lists, the batch's units that use it, and the existing patterns (is it a duplicate or a variant of one?). Check each unit link (does that ability or weapon really do this?). Report confirmed problems only, each with the field, the reason and the correction; real=false when a claim holds. Default to real=false when you cannot confirm a problem. Also check for six or more words copied from a page. Do not edit files (your notes aside).`
}

function fixPrompt(g, v) {
  return `${COMMON(g)}

${saving(`${g.ws}/.progress/fix`, g.ws)}

## Your job: apply the confirmed corrections to your patterns
A skeptic checked the pattern files you wrote in this workspace. Apply every correction below that the pages support (re-check the page where unsure), and say which you did not apply and why. Then run node scripts/format-json.mjs on the files, node scripts/validate.mjs . and node scripts/copy-check.mjs . --only <part of each URL you cite>.

${JSON.stringify(v.verdicts.filter(x => x.real), null, 1)}`
}

const out = await pipeline(
  args.groups,
  g => agent(writePrompt(g), { label: `write:${g.label}`, phase: 'Write', schema: WRITE }),
  (w, g) => w && agent(verifyPrompt(g, w), { label: `verify:${g.label}`, phase: 'Verify', schema: VERDICTS }).then(v => ({ w, v: v || null })),
  (r, g) => r && (!r.v
    ? { group: g.label, ws: g.ws, write: r.w, verdicts: null, fixed: null, unverified: true }
    : r.v.verdicts.some(x => x.real)
    ? agent(fixPrompt(g, r.v), { label: `fix:${g.label}`, phase: 'Fix', schema: FIXED }).then(f => ({ group: g.label, ws: g.ws, write: r.w, verdicts: r.v, fixed: f }))
    : { group: g.label, ws: g.ws, write: r.w, verdicts: r.v, fixed: null }),
)
// A group with no result, or whose skeptic returned nothing, is not done: run it again on its own.
return {
  results: out.filter(Boolean),
  failed: args.groups.filter((g, i) => !out[i]).map(g => g.label),
  unverified: out.filter(r => r && r.unverified).map(r => r.group),
}
