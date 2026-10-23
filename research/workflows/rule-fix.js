export const meta = {
  name: 'rule-fix-round',
  description: 'Rule-fix round after a batch: analysts turn proposed rule fixes into exact edits and recodes, a skeptic tests each group in a scratch copy, then one check of the whole set',
  phases: [{ title: 'Draft', detail: 'one analyst per group of rule problems' }, { title: 'Test', detail: 'one skeptic per group applies the edits in a scratch copy' }, { title: 'Whole set', detail: 'one reviewer applies every group together' }],
}

// args: { round: { id: 'r1fix', after: 'r1', version: '1.1.0' }, problems: 'research/r1/rule-problems.md',
//   groups: [{ label: 'roles', items: ['30', '31', 'batch 9'], focus: '<what ties the group together>' }],
//   ws: '<scratchpad>/r1/rulefix',   // the scratch copies (research/workflows/mkws.sh makes them): ws-<group> and ws-all
//   progress: '<scratchpad>/r1/progress/rule-fix',   // the agents' notes, outside the repository; the same folder on a resume
// }
// Nothing here changes the repository. The lead turns the confirmed set into a proposal for Mustafa, and the word
// lists, field rules and validator checks change only after he approves it (runbook, "Decisions").
const REPO = '/home/user/MoesTools-Brainstormer'
const R = args.round
if (!args.progress) throw new Error('args.progress is required: a folder outside the repository for the agents\' notes (runbook, "Progress notes")')
if (!args.ws) throw new Error('args.ws is required: the folder for the scratch copies, <scratchpad>/r<N>/<phase>')

const EDIT = { type: 'object', required: ['file', 'old', 'new'], properties: { file: { type: 'string' }, old: { type: 'string', description: 'copied exactly; appears once in the file' }, new: { type: 'string' } } }
const RECODE = { type: 'object', required: ['unit', 'path', 'from', 'to', 'why'], properties: { unit: { type: 'string' }, path: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' }, why: { type: 'string' } } }
const DRAFT = { type: 'object', required: ['items'], properties: { items: { type: 'array', items: { type: 'object',
  required: ['item', 'where', 'recommendation', 'reason', 'edits', 'recodes'],
  properties: { item: { type: 'string' }, where: { enum: ['word lists', 'field rules', 'validator', 'notes or registry'] },
    recommendation: { enum: ['drop', 'different change', 'alternative', 'proposed fix'] }, reason: { type: 'string' },
    edits: { type: 'array', items: EDIT }, recodes: { type: 'array', items: RECODE }, conflicts: { type: 'string' } } } } } }
const VERDICTS = { type: 'object', required: ['verdicts'], properties: { verdicts: { type: 'array', items: { type: 'object',
  required: ['item', 'confirmed', 'reason', 'evidence'],
  properties: { item: { type: 'string' }, confirmed: { type: 'boolean' }, reason: { type: 'string' }, evidence: { type: 'string', description: 'the commands run in the scratch copy and what they showed' },
    edits: { type: 'array', items: EDIT, description: 'the corrected edits, when the drafted ones are wrong or incomplete' },
    recodes: { type: 'array', items: RECODE, description: 'the corrected recodes, when the drafted list is wrong or incomplete' } } } } } }
const WHOLE = { type: 'object', required: ['clashes', 'check', 'recodes'], properties: {
  clashes: { type: 'array', items: { type: 'object', required: ['items', 'what', 'fix'], properties: { items: { type: 'string' }, what: { type: 'string' }, fix: { type: 'string' } } } },
  check: { type: 'string', description: 'npm run check:merge in the copy with every edit applied, and what it showed' },
  recodes: { type: 'array', items: RECODE, description: 'every recode, merged per unit and path' } } }

// Progress notes (docs/research-runbook.md, "Progress notes"): an agent cut off part way and started again with
// the same task goes on from its notes instead of starting over. root is the repository or copy it works in.
const saving = (dir, root) => `## Saving your progress
A usage limit can cut you off part way, and you would then be started again with this same task. So keep notes in ${dir}/progress.md (make the folder; you may always write there).
- Look there first. If the notes are for another task (their first line names the task), move them into ${dir}/old/ and start fresh. If they end with DONE, write your answer from them without redoing the work. Otherwise go on from where they stop, without redoing the steps they mark done.
- A new notes file starts with one line naming your task. After each step you finish (an item drafted or tested, a check run), add a line or two: what is done, what you found and where, what comes next. Keep them short: just enough to write your answer without redoing the work.
- When the work is done, add a last line DONE, then give your answer.
Pages fetched before are cached in ${root}/.cache/sources/<site>/ (one JSON file per page, named after its path; the raw field holds the page text): look there before fetching a page. Read long files and pages in parts, by searching for the section you need.`

const COMMON = `Unit Forge (repo ${REPO}; read only for you: do not edit, commit or push anything in it) is a research database of real RTS and shooter units, coded with fixed word lists (version 1.0.0, approved), that feeds a generator of original unit concepts for a top-down team shooter. Batch ${R.after.toUpperCase()} is merged. Its agents reported rule problems (${args.problems}, each with the rule, the problem, the units and a proposed fix). Mustafa chose a rule-fix round before the next batch: analysts turn each proposed fix into exact rule changes, a skeptic checks each against the ${R.after.toUpperCase()} codings, Mustafa approves the set as word lists ${R.version}, and then the ${R.after.toUpperCase()} units they touch are recoded.
Where the rules live: the word lists are data/vocab/*.json; the field rules are the descriptions in schemas/*.json and the Conventions text in scripts/build-docs.mjs; scripts/build-docs.mjs generates docs/vocabularies.md, docs/fields.md and docs/samples.md from them, so never edit those three, edit their sources. The validator's rule checks are in scripts/validate.mjs, with tests in tests/. The game-level notes are research/registry-notes/games-${R.after}.md and the registry data/games.json. The units are data/units/*.json.
House rules: plain words; paraphrase only (never six or more words copied from a cited page); keep every change as small as its fix needs and in the style of the text around it.`

const DRAFT_TASK = g => `## Your group: ${g.label}
Items (numbers as in ${args.problems}; "batch N" is item N of "Open, for the batch"): ${g.items.join(', ')}. ${g.focus || ''}
For each item:
1. Read its entry, the rule text it names in the source file, and the units it names.
2. Decide where the change belongs (the word lists, the field rules, the validator, or the notes or registry), and recommend: the proposed fix, its alternative, a different change (say why), or dropping it (say why).
3. Write the exact edits: each with the file, the old text copied exactly (it must appear once in the file) and the new text. Several edits per item are fine, in the order they apply. For a validator change, also add a test in tests/validate.test.mjs.
4. List every ${R.after.toUpperCase()} unit the new rule recodes: the unit id, the path, the current value, the new value and why. Check every unit the new rule could touch, not only the ones the entry names (a short node script over data/units helps). An empty list is fine when nothing changes.
5. Say which other items in your group it conflicts or overlaps with, and how your edits resolve that.
Return the items in the order given.`

const TEST_TASK = (g, draft) => `## Your job: test the drafted changes for group ${g.label}
Make a scratch copy of the repository: sh ${REPO}/research/workflows/mkws.sh ${args.ws}/ws-${g.label} (it prints the folder and the commit). In that copy, apply each item's edits in order; an old text that does not appear exactly once is a failed edit. Then run npm run check:merge in the copy and note what fails and why.
For each item, decide whether the change does what the fix intends and nothing more, whether it breaks or contradicts another rule, and whether its recode list is complete and right: check the units yourself against the new rule, and a unit the validator now rejects must be on the list. Mark confirmed=true only when you checked it; default to false when you cannot. When the drafted edits or recodes are wrong or incomplete, give the corrected ones in full.

The drafts:
${JSON.stringify(draft.items, null, 1)}`

const out = await pipeline(
  args.groups,
  g => agent(`${COMMON}\n\n${saving(`${args.progress}/draft-${g.label}`, REPO)}\n\n${DRAFT_TASK(g)}`, { label: `draft:${g.label}`, phase: 'Draft', schema: DRAFT }),
  (draft, g) => draft && agent(`${COMMON}\n\n${saving(`${args.progress}/test-${g.label}`, REPO)}\n\n${TEST_TASK(g, draft)}`, { label: `verify:${g.label}`, phase: 'Test', schema: VERDICTS })
    .then(v => ({ label: g.label, draft: draft.items, verdicts: v ? v.verdicts : null, unverified: !v })),
)
const groups = out.filter(Boolean)
const tested = groups.filter(r => r.verdicts)

// The whole set: every confirmed item, with the skeptic's corrections, applied together in one copy.
const confirmed = tested.flatMap(r => r.draft.map(d => {
  const v = r.verdicts.find(x => x.item === d.item)
  return v && v.confirmed ? { group: r.label, item: d.item, edits: v.edits && v.edits.length ? v.edits : d.edits, recodes: v.recodes && v.recodes.length ? v.recodes : d.recodes } : null
}).filter(Boolean))
const whole = confirmed.length ? await agent(`${COMMON}\n\n${saving(`${args.progress}/whole-all`, REPO)}\n\n## Your job: the whole set
Make a scratch copy: sh ${REPO}/research/workflows/mkws.sh ${args.ws}/ws-all. Apply every item below, in the order given, each item's edits in order. List each clash: an edit whose old text an earlier item already changed, two items that change the same rule in different ways, or rules that now contradict each other; give the fix for each. Then run npm run check:merge in the copy and report what it showed. Last, merge the recodes per unit and path, and list every unit and path that two items recode differently as a clash.

${JSON.stringify(confirmed, null, 1)}`, { label: 'whole:all', phase: 'Whole set', schema: WHOLE }) : null

// A group whose analyst returned nothing, or a whole-set check that returned nothing, is not done: run it again
// on its own. A group whose skeptic returned nothing is unverified: its items are not in the whole set.
return {
  results: groups,
  whole,
  confirmed,
  failed: [...args.groups.filter((g, i) => !out[i]).map(g => g.label), ...(confirmed.length && !whole ? ['all'] : [])],
  unverified: groups.filter(r => r.unverified).map(r => r.label),
}
