export const meta = {
  name: 'batch-verify-fixes',
  description: 'Research batch: check that the review fixes landed, made no new contradictions, and that the report and PR claims hold',
  phases: [{ title: 'Review', detail: 'one reviewer per angle' }, { title: 'Verify', detail: 'a skeptic tries to refute each finding' }],
}

// args: { batch: { id: 'r1', scope: '...' }, findings: '<path to the saved review findings JSON>', since: '<commit the review saw>', draft: '<path to the draft PR description>' }
const REPO = '/home/user/MoesTools-Brainstormer'
const B = args.batch

const ANGLES = {
  closure: `Closure of the review's findings. ${args.findings} holds every finding with its verdict. Take those marked real. The fixes landed after commit ${args.since}. For each finding, check in the current files whether it is fully resolved (prefer better_fix where given). Report only findings that are unresolved or only partly resolved, and any fix that created a new problem.`,
  regression: `New problems introduced by the fixes. Read git diff ${args.since}..HEAD, then read the changed records and texts in context. Look for a change that contradicts a rule, another unit, the registry or the notes; a link or path that no longer resolves; a value that no longer matches its pages (fetch them). Quote both clashing texts and name their files.`,
  claims: `Truth of the claims made to Mustafa. Check every factual claim in research/${B.id}/README.md and in the draft pull-request description at ${args.draft}. Recompute numbers yourself from the files (units per game, classes, patterns, atypical lines from node scripts/validate.mjs, the checker's wrong-field rate from research/${B.id}/checker/, copy-check results). Check that each decision is self-contained, gives options and a recommendation, and matches the evidence in the record; that the README and the draft agree; and that nothing claims more than the record shows. Also check plain words.`,
}

const FINDINGS = { type: 'object', required: ['findings'], properties: { findings: { type: 'array', items: { type: 'object',
  required: ['id', 'severity', 'file', 'summary', 'evidence', 'fix'],
  properties: { id: { type: 'string' }, severity: { enum: ['major', 'minor'] }, file: { type: 'string' }, summary: { type: 'string' },
    evidence: { type: 'string', description: 'quotes, commands run and their output' }, fix: { type: 'string', description: 'the exact change' } } } } } }
const VERDICTS = { type: 'object', required: ['verdicts'], properties: { verdicts: { type: 'array', items: { type: 'object',
  required: ['id', 'real', 'reason'], properties: { id: { type: 'string' }, real: { type: 'boolean' }, reason: { type: 'string' }, better_fix: { type: 'string' } } } } } }

const COMMON = `Unit Forge (repo ${REPO}; read only for you, do not edit anything) is a research database of real RTS and shooter units, coded with fixed word lists (version 1.0.0, approved), that feeds a generator of original unit concepts for a top-down team shooter. The branch checked out is research batch ${B.id.toUpperCase()} (${B.scope}). A final review found problems; they were fixed after commit ${args.since}. docs/research-runbook.md is the procedure. House rules: plain words, paraphrase only (never six or more words copied from a cited page), mechanics over numbers. npm run check:merge runs every check.`

const out = await pipeline(
  Object.keys(ANGLES),
  key => agent(`${COMMON}\n\n## Your angle: ${key}\n${ANGLES[key]}\n\nReport real problems only, each with evidence you checked yourself and the exact fix. Up to 20 findings, most severe first. An empty list is a fine answer.`,
    { label: `review:${key}`, phase: 'Review', schema: FINDINGS }),
  (found, key) => found && (found.findings.length
    ? agent(`${COMMON}\n\n## Your job: try to refute each finding below (angle: ${key})\nCheck the evidence yourself. Mark real=false when the finding is wrong, already handled, or not a problem in practice; real=true only when you confirmed it. Give a better fix when the proposed one is wrong or incomplete. Default to real=false when you cannot confirm it.\n\n${JSON.stringify(found.findings, null, 1)}`,
      { label: `verify:${key}`, phase: 'Verify', schema: VERDICTS }).then(v => ({ key, found: found.findings, verdicts: v ? v.verdicts : [] }))
    : { key, found: [], verdicts: [] }),
)
return out.filter(Boolean)
