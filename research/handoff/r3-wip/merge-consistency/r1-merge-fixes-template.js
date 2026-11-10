export const meta = {
  name: 'r1-merge-fixes',
  description: 'Batch R1 merge pass step 3: apply the confirmed consistency fixes per game in a workspace, then a verifier checks each fix and that nothing else changed',
  phases: [{ title: 'Fix', detail: 'one fixer per game file, in its own workspace' }, { title: 'Verify', detail: 'one verifier per game' }, { title: 'Repair', detail: 'the fixer repairs what the verifier confirmed' }],
}
const SP = '<scratchpad>'
const REPO = '<repo>'
const GAMES = ['ra1', 'ra2', 'ra3']
const COMMON = g => `Unit Forge is a research database of real RTS units, coded with fixed word lists (version 1.0.0, approved) and field rules (docs/fields.md, docs/vocabularies.md), that feeds a generator of original unit concepts for a top-down team shooter. Your workspace is ${SP}/r1/consistency/ws-fix-${g}, a copy of the repository ${REPO} at its current commit (no git history; compare with ${REPO}, which you must not edit). Work only in the workspace. The game's notes: research/registry-notes/games-r1.md and data/games.json. House rules: paraphrase only (never six or more words copied from a page), cite https pages, plain words. Wikis through their API (https://cnc.fandom.com/api.php?action=parse&page=<Title>&prop=wikitext&format=json), two seconds apart, retry after a 429; the workspace .cache holds pages already fetched (JSON files under .cache/sources).`
const FIXED = { type: 'object', required: ['applied', 'not_applied', 'checks'], properties: {
  applied: { type: 'array', items: { type: 'object', required: ['id', 'what'], properties: { id: { type: 'string' }, what: { type: 'string', description: 'the exact change made, per unit and path' } } } },
  not_applied: { type: 'array', items: { type: 'object', required: ['id', 'why'], properties: { id: { type: 'string' }, why: { type: 'string' } } } },
  pages_read: { type: 'array', items: { type: 'string' } },
  checks: { type: 'string', description: 'format, validate and copy-check commands and results' } } }
const VERD = { type: 'object', required: ['verdicts', 'unexpected_changes'], properties: {
  verdicts: { type: 'array', items: { type: 'object', required: ['id', 'ok', 'reason'], properties: { id: { type: 'string' }, ok: { type: 'boolean', description: 'true when the fix landed as the brief and the rules require, and is true to the pages' }, reason: { type: 'string' }, correction: { type: 'string' } } } },
  unexpected_changes: { type: 'array', items: { type: 'string' }, description: 'changes in the diff that no fix asked for' } } }

const fixPrompt = g => `${COMMON(g)}

## Your job: apply the confirmed consistency fixes to data/units/${g}.json
Read the list at ${SP}/r1/consistency/fixes.json, key "${g}". Each item has the finding, the proposed fix, the skeptic's reasoning and better_fix (when given, better_fix wins over fix), and a note from the integrator (when given, the note wins over both). Apply each item to data/units/${g}.json in your workspace, and nothing else: do not change any field the items do not name (above all, never mobility.speed or speed_raw, which are reworked separately). Where a fix moves or removes a source, update every sources[].supports path and every uncertain or fit_notes path that pointed at it, and add an uncertain entry for any code that then rests only on a page no longer cited. Where an item says to read a cached page first, do so and report what it says.
Then run, in the workspace: node scripts/format-json.mjs data/units/${g}.json; node scripts/validate.mjs . (no errors; every ATYPICAL line about a unit recorded in its atypical list); node scripts/copy-check.mjs . --offline --only <part of each URL your changes cite or rely on> (exit 0). Report what you applied, what you did not and why, and the checks.`

const verifyPrompt = (g, f) => `${COMMON(g)}

## Your job: check the fixes another agent applied to data/units/${g}.json
The brief is ${SP}/r1/consistency/fixes.json, key "${g}" (better_fix wins over fix; the integrator's note wins over both). Diff the workspace file against ${REPO}/data/units/${g}.json (for example with a short Node script that compares the units field by field). For every item: did the change land as the brief and the written rules require, is it true to the pages, and are all paths (supports, uncertain, fit_notes) still right? List any change in the diff that no item asked for. Run node scripts/validate.mjs . in the workspace. Do not edit files.

The fixer's report: ${JSON.stringify(f)}`

const repairPrompt = (g, v) => `${COMMON(g)}

## Your job: repair your fixes
A verifier checked the fixes you applied to data/units/${g}.json in this workspace and found these problems. Apply each correction (re-read the page where unsure) and undo every unexpected change it lists unless an item of the brief (${SP}/r1/consistency/fixes.json, key "${g}") required it. Then rerun the format, validate and copy-check commands.

Problems: ${JSON.stringify(v.verdicts.filter(x => !x.ok))}
Unexpected changes: ${JSON.stringify(v.unexpected_changes)}`

const out = await pipeline(GAMES,
  g => agent(fixPrompt(g), { label: `fix:${g}`, phase: 'Fix', schema: FIXED }),
  (f, g) => f && agent(verifyPrompt(g, f), { label: `verify:${g}`, phase: 'Verify', schema: VERD }).then(v => ({ f, v })),
  (r, g) => r && (r.v && (r.v.verdicts.some(x => !x.ok) || r.v.unexpected_changes.length)
    ? agent(repairPrompt(g, r.v), { label: `repair:${g}`, phase: 'Repair', schema: FIXED }).then(rp => ({ game: g, fixed: r.f, verdicts: r.v, repaired: rp }))
    : { game: g, fixed: r.f, verdicts: r.v, repaired: null, unverified: !r.v }),
)
return { results: out.filter(Boolean), failed: GAMES.filter((g, i) => !out[i]), unverified: out.filter(r => r && r.unverified).map(r => r.game) }
