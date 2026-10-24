export const meta = {
  name: 'batch-verify-fixes',
  description: 'Research batch: check that the review fixes landed, made no new contradictions, and that the report and PR claims hold',
  phases: [{ title: 'Review', detail: 'one reviewer per angle' }, { title: 'Verify', detail: 'a skeptic tries to refute each finding' }],
}

// args: { batch: { id: 'r1', scope: '...' }, findings: '<path to research/r<N>/review/findings.json>', since: '<commit the review saw>', draft: '<path to the draft PR description>', angles: ['closure', 'regression'],
//   progress: '<scratchpad>/r<N>/progress/verify-fixes-<k>',   // the agents' notes, outside the repository; the same folder on a resume
//   previous: '<the claims run's result>', draftPrev: '<a copy of the draft as the claims run read it>',   // angle recheck only; since is then the commit the claims run read
// }
// Run it with angles ['closure', 'regression'] after the fixes, and with angles ['claims'] last, after the final texts (runbook section 8).
// After fixing what the claims run found, run it with angles ['recheck']: it checks only the sentences that changed since.
const REPO = '/home/user/MoesTools-Brainstormer'
const B = args.batch
if (!args.progress) throw new Error('args.progress is required: a folder outside the repository for the agents\' notes (runbook, "Progress notes")')
if ((args.angles || []).includes('recheck') && !(args.previous && args.draftPrev)) throw new Error('angle recheck needs args.previous (the claims run\'s result) and args.draftPrev (the draft as that run read it)')

const ANGLES = {
  closure: `Closure of the review's findings. ${args.findings} holds every finding with its verdict. Take those marked real. The fixes landed after commit ${args.since}. For each finding, check in the current files whether it is fully resolved (prefer better_fix where given). Report only findings that are unresolved or only partly resolved, and any fix that created a new problem.`,
  regression: `New problems introduced by the fixes. Read git diff ${args.since}..HEAD, then read the changed records and texts in context. Look for a change that contradicts a rule, another unit, the registry or the notes; a link or path that no longer resolves; a value that no longer matches its pages (fetch them). Quote both clashing texts and name their files.`,
  claims: `Truth of the claims made to Mustafa. Check every factual claim in research/${B.id}/README.md and in the draft pull-request description at ${args.draft}. Recompute numbers yourself from the files (units per game, classes, patterns, atypical lines from node scripts/validate.mjs, the checker's wrong-field rate from research/${B.id}/checker/, copy-check results). Check that each decision is self-contained, gives options and a recommendation, and matches the evidence in the record; that the README and the draft agree; and that nothing claims more than the record shows. Also check plain words.`,
  recheck: `Truth of the claims that changed after a claims check. That check's result, with its findings, their verdicts and every claim it checked, is in ${args.previous}. After it, research/${B.id}/README.md and research/${B.id}/rule-problems.md changed as \`git diff ${args.since} HEAD -- research/${B.id}/README.md research/${B.id}/rule-problems.md\` shows, and the draft pull-request description ${args.draft} changed from the copy that check read, ${args.draftPrev} (compare them with diff). List every changed or added sentence and confirm from the diffs that no other line changed. Recompute every number and factual claim in those sentences yourself from the files. Say whether each finding of that check is resolved, and check, where the changes touch, that the README and the draft agree and that each decision stays self-contained, with options and a recommendation. Neither text may say "work in progress", "running now" or "Next:". Also check plain words.`,
}
const WITH_CHECKED = ['claims', 'recheck']

const CHECKED = { type: 'array', description: 'claims and recheck angles only: every number and factual claim checked', items: { type: 'object', required: ['claim', 'where', 'source', 'value', 'holds'], properties: {
  claim: { type: 'string' }, where: { type: 'string', description: 'README or PR description, and the line' }, source: { type: 'string', description: 'the command run or the file read to recompute it' },
  value: { type: 'string', description: 'the value found' }, holds: { type: 'boolean' } } } }
const FINDINGS = { type: 'object', required: ['findings'], properties: { checked: CHECKED, findings: { type: 'array', items: { type: 'object',
  required: ['id', 'severity', 'file', 'summary', 'evidence', 'fix'],
  properties: { id: { type: 'string' }, severity: { enum: ['major', 'minor'] }, file: { type: 'string' }, summary: { type: 'string' },
    evidence: { type: 'string', description: 'quotes, commands run and their output' }, fix: { type: 'string', description: 'the exact change' } } } } } }
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

const COMMON = `Unit Forge (repo ${REPO}; read only for you, do not edit anything) is a research database of real RTS and shooter units, coded with fixed word lists (version 1.1.0, approved), that feeds a generator of original unit concepts for a top-down team shooter. The branch checked out is research batch ${B.id.toUpperCase()} (${B.scope}). A final review found problems; they were fixed after commit ${args.since}. docs/research-runbook.md is the procedure. House rules: plain words, paraphrase only (never six or more words copied from a cited page), mechanics over numbers. npm run check:merge runs every check.`

const out = await pipeline(
  args.angles || ['closure', 'regression'],
  key => agent(`${COMMON}\n\n${saving(`${args.progress}/review-${key}`, REPO)}\n\n## Your angle: ${key}\n${ANGLES[key]}\n\nReport real problems only, each with evidence you checked yourself and the exact fix. Up to 20 findings, most severe first. An empty list is a fine answer.${WITH_CHECKED.includes(key) ? ` Also return checked: every number and factual claim in ${key === 'recheck' ? 'the changed sentences' : 'both texts'}, each with the command or file you recomputed it from and the value you found. A claim missing from checked counts as not checked.` : ''}`,
    { label: `review:${key}`, phase: 'Review', schema: WITH_CHECKED.includes(key) ? { ...FINDINGS, required: ['findings', 'checked'] } : FINDINGS }),
  (found, key) => found && (found.findings.length
    ? agent(`${COMMON}\n\n${saving(`${args.progress}/verify-${key}`, REPO)}\n\n## Your job: try to refute each finding below (angle: ${key})\nCheck the evidence yourself. Mark real=false when the finding is wrong, already handled, or not a problem in practice; real=true only when you confirmed it. Give a better fix when the proposed one is wrong or incomplete. Default to real=false when you cannot confirm it.\n\n${JSON.stringify(found.findings, null, 1)}`,
      { label: `verify:${key}`, phase: 'Verify', schema: VERDICTS }).then(v => ({ key, found: found.findings, checked: found.checked || null, verdicts: v ? v.verdicts : null, unverified: !v }))
    : { key, found: [], checked: found.checked || null, verdicts: [] }),
)
const angles = args.angles || ['closure', 'regression']
return {
  results: out.filter(Boolean),
  failed: angles.filter((a, i) => !out[i]),
  unverified: out.filter(r => r && r.unverified).map(r => r.key),
}
