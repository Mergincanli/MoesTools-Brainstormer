export const meta = {
  name: 'batch-final-review',
  description: 'Research batch final review: find problems per dimension, then adversarially verify each finding',
  phases: [{ title: 'Review', detail: 'one reviewer per dimension' }, { title: 'Verify', detail: 'one skeptic per dimension tries to refute each finding' }],
}

// args: { batch: { id: 'r1', scope: '...' }, base: 'origin/main', draft: '<scratchpad>/r<N>/pr-body.md', dimensions: ['data', 'consistency', 'patterns', 'record'],
//   progress: '<scratchpad>/r<N>/progress/final-review',   // the agents' notes, outside the repository; the same folder on a resume
// }
// Add 'tooling' to the dimensions when the batch changed scripts, tests or workflows.
// Fix only the findings marked real, then run verify-fixes.js (runbook section 7).
const REPO = '/home/user/MoesTools-Brainstormer'
const B = args.batch
const BASE = args.base || 'origin/main'
if (!args.progress) throw new Error('args.progress is required: a folder outside the repository for the agents\' notes (runbook, "Progress notes")')

const DIMENSIONS = {
  data: `The units the batch added (git diff ${BASE} -- data/units). research/${B.id}/checker/checks.json lists, per unit, the fields the checker re-checked: do not re-check those. For every unit the batch added, the sampled ones included, fetch its cited pages and the pages its uncertain entries name. Check every other coded field against the written rules (docs/fields.md, docs/vocabularies.md, research/registry-notes/games-${B.id}.md) and the pages, starting with tier, price, class, roles, speed, armour and the weapons. On a sampled unit, that leaves fields such as nature, availability, modes, lineage, confidence and the matchups. Quote the rule and the page for each finding.`,
  consistency: `Consistency across the batch and with the rules: the same fact coded the same way on every unit that shares it (game-wide mechanics, shared weapons, the registry's references), matchup links that describe the right part, the registry notes and data/games.json agreeing with the units, and rule problems the agents reported that the report leaves out (research/${B.id}/rule-problems.md lists them). Run node scripts/validate.mjs and read its output: it already checks that uncertain, fit_notes and supports paths exist and that every ATYPICAL line is recorded in the unit's atypical list, so do not redo those by hand. It also lists the unit links that point at units not researched yet, but does not check them: check that each id in that list names a real unit of that game and faction, spelled by the Ids convention (docs/fields.md).`,
  patterns: `The pattern files and registry entries the batch added or changed (git diff ${BASE} -- data/patterns data/pattern-registry.json). Each had a skeptic when it was written, and the checker re-checked the sampled ones field by field (research/${B.id}/checker/checks.json), so do not re-check those fields. Check every pattern against its cited pages, schemas/pattern.schema.json, the word lists and the units that link it, leaving out only the fields checks.json lists for it; the fixes made after the checker (git log -- data/patterns); duplicates and overlaps between patterns, new and old; and source_units against the units (npm run sync-patterns:check).`,
  tooling: `The scripts, tests and workflows the batch changed (git diff ${BASE} -- scripts tests research/workflows package.json .github): run npm run check:merge and each changed script; look for a check that no longer catches what it caught, a command, option or path the runbook names that does not exist, and a test removed or weakened.`,
  record: `The record and the report: research/${B.id}/ (README, prep, opening, fill, checker, review), research/registry-notes/games-${B.id}.md, and the draft pull-request description at ${args.draft}. Check that the report covers what the runbook's section 8 lists and that each claim matches the record; spot-check a few numbers only, because the claims check recomputes every number after the final texts (runbook section 8). Check that "Decisions needed" items are self-contained with options and a recommendation; look for local paths, six-word runs copied from a page (npm run copy-check -- --offline --also research/${B.id}), and plain-words problems.`,
}

const FINDINGS = { type: 'object', required: ['findings'], properties: { findings: { type: 'array', items: { type: 'object',
  required: ['id', 'severity', 'file', 'summary', 'evidence', 'fix'],
  properties: { id: { type: 'string' }, severity: { enum: ['major', 'minor'] }, file: { type: 'string' }, summary: { type: 'string' },
    evidence: { type: 'string', description: 'quotes, pages fetched, commands run and their output' }, fix: { type: 'string', description: 'the exact change' } } } } } }
const VERDICTS = { type: 'object', required: ['verdicts'], properties: { verdicts: { type: 'array', items: { type: 'object',
  required: ['id', 'real', 'reason', 'evidence'], properties: { id: { type: 'string' }, real: { type: 'boolean' }, reason: { type: 'string' }, evidence: { type: 'string', description: 'the page URL fetched or the command run, and what it showed, paraphrased' }, better_fix: { type: 'string' } } } } } }

// Progress notes (docs/research-runbook.md, "Progress notes"): an agent cut off part way and started again with
// the same task goes on from its notes instead of starting over. root is the repository or copy it works in.
const saving = (dir, root) => `## Saving your progress
A usage limit can cut you off part way, and you would then be started again with this same task. So keep notes in ${dir}/progress.md (make the folder; you may always write there).
- Look there first. If the notes are for another task (their first line names the task), move them into ${dir}/old/ and start fresh. If they end with DONE, write your answer from them without redoing the work. Otherwise go on from where they stop, without redoing the steps they mark done.
- A new notes file starts with one line naming your task. After each step you finish (a unit or record done, a page read, a check run), add a line or two: what is done, what you found and where (page URL or file), what comes next. Keep them short: just enough to write your answer without opening the pages again.
- When the work is done, add a last line DONE, then give your answer.
Pages fetched before are cached in ${root}/.cache/sources/<site>/ (one JSON file per page, named after its path; the raw field holds the page text): look there before fetching a page. Read long files and pages in parts, by searching for the section you need.`

const COMMON = `Unit Forge (repo ${REPO}, read only for you: do not edit anything) is a research database of real RTS and shooter units, coded with fixed word lists (version 1.1.0, approved), that feeds a generator of original unit concepts for a top-down team shooter. The branch checked out is research batch ${B.id.toUpperCase()} (${B.scope}), compared with ${BASE}. docs/research-runbook.md is the procedure, and research/${B.id}/README.md the batch report. House rules: plain words, paraphrase only (never six or more words copied from a cited page), mechanics over numbers. Wikis through their API, two seconds apart, retry after a 429. npm run check:merge runs every check.`

const out = await pipeline(
  args.dimensions,
  key => agent(`${COMMON}\n\n${saving(`${args.progress}/review-${key}`, REPO)}\n\n## Your dimension\n${DIMENSIONS[key]}\n\nReport real problems only, each with evidence you checked yourself and the exact fix. Major: a wrong value a generator would use, a broken rule or check, a contradiction, a false claim to Mustafa. Minor: wording, small inconsistencies. Skip style preferences. Up to 25 findings, most severe first.`,
    { label: `review:${key}`, phase: 'Review', schema: FINDINGS }),
  (found, key) => found && (found.findings.length
    ? agent(`${COMMON}\n\n${saving(`${args.progress}/verify-${key}`, REPO)}\n\n## Your job: try to refute each finding below (dimension: ${key})\nFor each, check the evidence yourself (run commands, read the files, fetch the pages). Mark real=false when the finding is wrong, already handled, or not a problem in practice; real=true only when you confirmed it. Give a better fix when the proposed one is wrong or incomplete. Default to real=false when you cannot confirm it.\n\n${JSON.stringify(found.findings, null, 1)}`,
      { label: `verify:${key}`, phase: 'Verify', schema: VERDICTS }).then(v => ({ key, found: found.findings, verdicts: v ? v.verdicts : null, unverified: !v }))
    : { key, found: [], verdicts: [] }),
)
// A dimension with no result, or whose skeptic returned nothing, is not done: run it again on its own.
// A finding without a verdict is not 'not confirmed'.
return {
  results: out.filter(Boolean),
  failed: args.dimensions.filter((d, i) => !out[i]),
  unverified: out.filter(r => r && r.unverified).map(r => r.key),
}
