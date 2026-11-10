export const meta = {
  name: 'r3-opening-splits',
  description: 'R3 opening check: for each field below 80%, an analyst proposes a rule fix and a skeptic checks it against both codings',
  phases: [{ title: 'Analyse', detail: 'one analyst per field below 80%' }, { title: 'Check', detail: 'one skeptic per proposed fix' }],
}

// args: { repo, out, fields: [{ field, unit, game, a, b, codingA, codingB, reportA, reportB, rules }] }
const REPO = args.repo

const OPTION = { type: 'object', required: ['id', 'change', 'for', 'against'], properties: {
  id: { type: 'string' }, change: { type: 'string', description: 'the exact change: file, key or section, the old text and the new text' },
  for: { type: 'string' }, against: { type: 'string' } } }
const FIX = { type: 'object', required: ['field', 'cause', 'rule_now', 'options', 'recommended', 'under_fix', 'recodes', 'blocks_r4', 'meanwhile'], properties: {
  field: { type: 'string' },
  cause: { type: 'string', description: 'why the two coders split, in plain words: the rule text each one followed' },
  rule_now: { type: 'string', description: 'the rule text that lets them split: file and key or section, paraphrased or quoted under six words at a time' },
  options: { type: 'array', items: OPTION, description: 'two or three fixes, the smallest first' },
  recommended: { type: 'string', description: 'the option id and why' },
  under_fix: { type: 'string', description: 'what each coder would have coded under the recommended fix, and why the answer is then unique' },
  recodes: { type: 'array', items: { type: 'string' }, description: 'unit ids in data/units/ whose coding the recommended fix changes, and each R3 kept unit (research/r3/prep/trim.json) it may touch, each with the field and the change' },
  blocks_r4: { type: 'string', description: 'yes or no, and why: would the current rule make R4 units code badly before the rule-fix round after R4' },
  meanwhile: { type: 'string', description: 'how R3 codes the affected units by the current rules until the fix is approved' },
} }
const VERDICT = { type: 'object', required: ['field', 'holds', 'problems', 'missed_recodes', 'blocks_r4', 'final'], properties: {
  field: { type: 'string' },
  holds: { type: 'boolean', description: 'true only if the recommended fix makes the answer unique for both codings, is right for the unit, and breaks no other unit' },
  problems: { type: 'array', items: { type: 'string' }, description: 'each problem found, with the file or unit that shows it' },
  missed_recodes: { type: 'array', items: { type: 'string' }, description: 'units the fix changes that the analyst did not list' },
  blocks_r4: { type: 'string', description: 'yes or no, and why' },
  final: { type: 'string', description: 'the fix as it should go to Mustafa: the exact change, the units it recodes, and how R3 codes meanwhile; the analyst\'s if it holds, else your corrected one' },
} }

const COMMON = f => `Unit Forge (repo ${REPO}; read only for you: do not edit, commit or push anything in it) is a research database of real RTS and shooter units, coded with fixed word lists (version 1.1.0, approved) and field rules, that feeds a generator of original unit concepts for a top-down team shooter. In batch R3's opening check, two research agents (A and B) coded \`${f.unit}\` independently, from a brief of only its name, faction and game. They agree on 54 of 56 measured fields. On \`${f.field}\` they split: A coded ${f.a}, B coded ${f.b}.

Mustafa owns the word lists and field rules. He chose one rule-fix round for R3's and R4's rule problems, after R4 and before plan step 4, unless a problem blocks R4. R4 is StarCraft II: Legacy of the Void, Halo Wars, Halo Wars 2, Planetary Annihilation: TITANS and MechWarrior/BattleTech. Until he approves a fix, units are coded by the current rules, with an uncertain entry where a rule fits badly.

## Inputs
- Coding A: ${f.codingA}. Coding B: ${f.codingB}. Each is a unit file with one unit.
- The coders' reports (hesitations, gaps, unclear rules, pages read but not cited): ${f.reportA} and ${f.reportB}.
- The rules: ${f.rules}; docs/fields.md (Conventions and the Source unit section) and docs/vocabularies.md, both generated from the files above.
- The game notes: research/registry-notes/games-r3.md, and the \`${f.game}\` entry of data/games.json.
- Worked examples: data/units/*.json (batch R1, already checked) and the R3 kept units in research/r3/prep/trim.json.

Plain words. Paraphrase only: never six or more words in a row copied from a page.`

const saving = dir => `## Saving your progress
A usage limit can cut you off part way, and you would then be started again with this same task. Keep short notes in ${dir}/progress.md (make the folder; you may always write there). Look there first: if they name another task, move them into ${dir}/old/ and start fresh; if they end with DONE, answer from them; otherwise go on from where they stop. Add a line or two after each step, and a last line DONE before you answer.`

const analyst = f => `${COMMON(f)}

${saving(`${args.out}/.progress/analyst-${f.game}`)}

## Your task: the analyst
1. Find the rule text each coder followed, and say why the written rules let two careful coders split on this field.
2. Propose two or three exact fixes, the smallest first, that make the answer unique and right for this unit. Name the file and key (or the docs section) and give the old and new text. Recommend one.
3. Say what each coder would have coded under the recommended fix.
4. Check every unit in data/units/ and every R3 kept unit in research/r3/prep/trim.json that the fix could touch. List those whose coding it changes, each with the field and the change.
5. Say whether the current rule blocks R4: would R4's units code badly under it before the round after R4?
6. Say how R3 should code the affected units by the current rules meanwhile.`

const skeptic = (f, fix) => `${COMMON(f)}

${saving(`${args.out}/.progress/skeptic-${f.game}`)}

## Your task: the skeptic
An analyst proposed this fix for the split:
${JSON.stringify(fix, null, 1)}

Check it against both codings and the rules. Try to find what is wrong with it:
- Under the fix, would A and B both reach the same answer? Is that answer right for the unit, by its pages as the codings cite them?
- Does it change any unit in data/units/ or any R3 kept unit that the analyst did not list? Search the files; do not trust the list.
- Is there a smaller fix that does the same?
- Is the call on R4 right? Think of R4's units that this field touches.
- Is the "meanwhile" coding allowed by the current rules?
Mark it as holding only if it survives all of these. Then give the fix as it should go to Mustafa: the analyst's if it holds, else your corrected one.`

const out = await pipeline(args.fields,
  f => agent(analyst(f), { label: `analyst:${f.field}`, phase: 'Analyse', schema: FIX }),
  (fix, f) => fix && agent(skeptic(f, fix), { label: `skeptic:${f.field}`, phase: 'Check', schema: VERDICT }).then(v => v && ({ fix, verdict: v })))
return { results: out.map((r, i) => r && ({ field: args.fields[i].field, unit: args.fields[i].unit, ...r })).filter(Boolean), failed: args.fields.filter((f, i) => !out[i]).map(f => f.field) }
