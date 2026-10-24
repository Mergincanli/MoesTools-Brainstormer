export const meta = {
  name: 'batch-notes-and-trim',
  description: 'Research batch: final game-level notes and registry edits per game, and the trimmed unit list',
  phases: [{ title: 'Edit notes', detail: 'one editor per game applies the skeptic\'s corrections' }, { title: 'Trim', detail: 'one judge picks the units' }],
}

// args: {
//   batch: { id: 'r2', scope: '...' },
//   dir: '<scratchpad>/r2',      // holds prep-<game>.json from prep.js
//   games: [{ id, name, existing }],  // existing: what the game's notes already have ('' when none)
//   trim: true | false,
//   trimGames: ['ra1', 'ra2', 'ra3'], // every game of the batch, when the editors run in more than one workflow
//   keep: 'about 9 per game; ...',     // the trim target, counting units already researched
//   progress: '<scratchpad>/r<N>/progress/notes-and-trim',   // the agents' notes, outside the repository; the same folder on a resume
// }
const REPO = '/home/user/MoesTools-Brainstormer'
const B = args.batch
const DIR = args.dir
if (!args.progress) throw new Error('args.progress is required: a folder outside the repository for the agents\' notes (runbook, "Progress notes")')
const NOTES_FILE = `research/registry-notes/games-${B.id}.md`

// Progress notes (docs/research-runbook.md, "Progress notes"): an agent cut off part way and started again with
// the same task goes on from its notes instead of starting over. root is the repository or copy it works in.
const saving = (dir, root) => `## Saving your progress
A usage limit can cut you off part way, and you would then be started again with this same task. So keep notes in ${dir}/progress.md (make the folder; you may always write there).
- Look there first. If the notes are for another task (their first line names the task), move them into ${dir}/old/ and start fresh. If they end with DONE, write your answer from them without redoing the work. Otherwise go on from where they stop, without redoing the steps they mark done.
- A new notes file starts with one line naming your task. After each step you finish (a unit or record done, a page read, a check run), add a line or two: what is done, what you found and where (page URL or file), what comes next. Keep them short: just enough to write your answer without opening the pages again.
- When the work is done, add a last line DONE, then give your answer.
Pages fetched before are cached in ${root}/.cache/sources/<site>/ (one JSON file per page, named after its path; the raw field holds the page text): look there before fetching a page. Read long files and pages in parts, by searching for the section you need.`

const COMMON = `Unit Forge (repository ${REPO}; read only for you, never edit a file there) is a research database of real RTS and shooter units, coded with fixed word lists (data/vocab/, docs/vocabularies.md, version 1.1.0, approved) and field rules (docs/fields.md, Conventions first), that feeds a generator of original unit concepts for Shamble Frontlines, a top-down team shooter where each player buys and becomes one unit. Step 3 is the research run; batch ${B.id.toUpperCase()} covers ${B.scope}, about 9 units per game (decision 8B). docs/research-runbook.md is the procedure. House rules: plain words and short sentences, paraphrase only (never six or more words copied from a page), no images, mechanics over numbers, cite pages by URL. Read wikis through their API, about two seconds between requests, retry after a 429.`

const EDIT = { type: 'object', required: ['role_lines', 'game_wide', 'research_notes', 'registry_edits', 'open_questions', 'changes'], properties: {
  role_lines: { type: 'string', description: "Markdown for this game's subsection under '## Official role lines': starts with '### <Game name> (`id`)', then bullets" },
  game_wide: { type: 'string', description: "Markdown for this game's subsection under '## Game-wide mechanics': starts with '### <Game name> (`id`)'" },
  research_notes: { type: 'string', description: `Markdown bullets for this game under '## Research notes' (only what ${NOTES_FILE} does not already say), starting with '### <Game name> (\`id\`)'; empty string if none` },
  remove_from_existing: { type: 'array', items: { type: 'string' }, description: `exact lines of the current ${NOTES_FILE} that the new text replaces and that must be removed, copied character for character` },
  registry_edits: { type: 'array', items: { type: 'object', required: ['path', 'op', 'reason'], properties: {
    path: { type: 'string', description: 'JSON pointer inside this game\'s entry of data/games.json, e.g. /damage_map/Cryo or /cost_thresholds/basis' },
    op: { enum: ['replace', 'add', 'remove'] }, value: { description: 'the new JSON value (omit for remove)' }, reason: { type: 'string' } } } },
  open_questions: { type: 'array', items: { type: 'string' }, description: 'design questions only Mustafa can answer, each self-contained with options and a recommendation; empty when none' },
  changes: { type: 'string', description: 'what you changed against the first draft and why, in a few lines' },
} }

const TRIM = { type: 'object', required: ['keep', 'cut', 'opening_check', 'coverage', 'new_patterns'], properties: {
  keep: { type: 'array', items: { type: 'object', required: ['id', 'game', 'brief', 'why'], properties: {
    id: { type: 'string' }, game: { type: 'string' }, brief: { type: 'string', description: 'one line a researcher gets: unit name, faction, what to cover' },
    why: { type: 'string' } } } },
  cut: { type: 'array', items: { type: 'object', required: ['id', 'reason'], properties: { id: { type: 'string' }, reason: { type: 'string' } } } },
  opening_check: { type: 'array', items: { type: 'string' }, description: 'two unit ids from keep, from two different games, for an opening check if one is needed (runbook section 2); may be empty' },
  opening_reason: { type: 'string' },
  coverage: { type: 'string', description: 'classes, roles, factions, tiers and mechanics the kept list covers, and what it leaves out' },
  new_patterns: { type: 'array', items: { type: 'object', required: ['id', 'summary', 'units'], properties: { id: { type: 'string' }, summary: { type: 'string' }, units: { type: 'array', items: { type: 'string' } } } }, description: 'mechanics in the kept units that no registry id covers, deduplicated across games' },
} }

function editPrompt(g) {
  return `${COMMON}

${saving(`${args.progress}/edit-${g.id}`, REPO)}

## Your task: the final game-level notes and registry edits for ${g.name} (\`${g.id}\`)
A researcher drafted this game's notes before any unit of it is coded, and a skeptic checked every claim. Both are in ${DIR}/prep-${g.id}.json: \`notes\` (role_line, game_wide, registry_findings, other_notes, pages_read) and \`verdicts\` (each claim marked real or not, with corrections, plus \`missing\` items). Read first: docs/fields.md (Conventions, the roles steps, Paired entries, Shared mechanics and universal keys, Bands with numbers), docs/vocabularies.md (the armour-class steps: Armour classes, first tie-break), research/registry-notes/README.md, research/registry-notes/games-r1.md (the model), ${NOTES_FILE}, and this game's entry in data/games.json.

Write the final texts:
1. Apply every correction the skeptic confirmed, and add every missing item that holds up. Where the researcher and the skeptic disagree and the evidence is not plain, fetch the page and decide yourself; say what you decided in \`changes\`.
2. Keep only what a unit researcher needs to code this game's units the same way: where the official role text lives and how roles step 1 and step 4 read it; each game-wide mechanic with its pattern id, exceptions by unit and how to record it; traps and page names. Cut background, duplicated points and anything the field rules already say. Plain words, short bullets, page URLs where a reader must look.
3. Registry: turn the confirmed registry findings into exact edits of this game's entry in data/games.json (JSON pointers inside the entry). Keep the registry's shape (schemas/game.schema.json). Decide unclear findings by the field rules; leave a finding out when the rules already handle it, and say why in \`changes\`. A design question only Mustafa can answer goes in open_questions, with options and a recommendation.
4. ${g.existing ? `This game already has: ${g.existing}. Your text replaces it: list the old lines in remove_from_existing, keep what was right word for word where you can, and say in changes if anything you change would change a unit already coded (data/units/).` : 'This game has no role-line or game-wide text yet.'}

Do not edit any file (your notes aside); return the texts and edits.`
}

function trimPrompt() {
  return `${COMMON}

${saving(`${args.progress}/trim`, REPO)}

## Your task: pick batch ${B.id.toUpperCase()}'s units
Researchers proposed candidate units for each game; they are in ${(args.trimGames || args.games.map(g => g.id)).map(id => `${DIR}/prep-${id}.json`).join(', ')} under \`candidates\`. The plan (docs/proposal.md section 2.2, step 2 of How a batch runs) keeps about 9 units per game and removes repeats. Target: ${args.keep}.

How to pick:
- Each kept unit must teach the generator something no other kept unit or unit already in data/units/ teaches: a distinct mechanic, an iconic counter or a memorable twist that would make a fun player-controlled unit.
- Across the batch, cover the classes (infantry, vehicles, aircraft in both air layers, ships, walkers, odd ones), the factions of each game, the roles, the price and tier bands, and the registry patterns (data/pattern-registry.json; research/registry-notes/patterns.md names the example units each id was registered for, and this batch should cover the ids whose examples are in its games).
- Remove repeats across the batch's games and against the units already researched: the same unit line in two games stays only where the later game adds a clear twist, and then only once.
- Prefer units buildable in skirmish or multiplayer, with good sources.
- Name two units for an opening check (two different games), in case the runbook calls for one.
- List the mechanics in the kept units that no registry id covers, deduplicated across games, as new patterns.

Each kept unit gets a one-line brief for its researcher. Give a reason for every cut. Do not edit any file (your notes aside).`
}

const out = {}
await parallel([
  ...args.games.map(g => () => agent(editPrompt(g), { label: `edit:${g.id}`, phase: 'Edit notes', schema: EDIT }).then(r => { out[g.id] = r })),
  ...(args.trim ? [() => agent(trimPrompt(), { label: 'trim', phase: 'Trim', schema: TRIM }).then(r => { out.trim = r })] : []),
])
return out
