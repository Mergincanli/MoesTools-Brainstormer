export const meta = {
  name: 'batch-prep',
  description: 'Research batch prep for one game: game-level notes and registry check (with a skeptic), plus candidate units',
  phases: [
    { title: 'Research', detail: 'notes and registry check; candidate units' },
    { title: 'Verify', detail: 'a skeptic re-checks every claim in the notes against the sources' },
  ],
}

// args: {
//   batch: { id: 'r2', scope: 'C&C Tiberian Dawn, Tiberian Sun, Tiberium Wars (with Kane\'s Wrath), Renegade' },
//   game: { id, name, scope, want, notesTask },
// }
// The result ({ game, notes, verdicts, candidates }) goes to the scratchpad as prep-<game>.json for notes-and-trim.js.
const REPO = '/home/user/MoesTools-Brainstormer'
const B = args.batch
const G = args.game
const NOTES_FILE = `research/registry-notes/games-${B.id}.md`

const COMMON = `Unit Forge (repository ${REPO}; read only for you, never edit a file there) is a research database of real RTS and shooter units, coded with fixed word lists (data/vocab/, rendered in docs/vocabularies.md, version 1.0.0, approved) and field rules (docs/fields.md, Conventions first), that feeds a generator of original unit concepts for Shamble Frontlines, a top-down team shooter where each player buys and becomes one unit. Step 3 of the plan is the research run; batch ${B.id.toUpperCase()} covers ${B.scope} (docs/proposal.md, section 2.2, says how a batch runs; decision 8B sets about 9 units per game). docs/research-runbook.md is the procedure. Your game: ${G.name} (registry id \`${G.id}\`, ${G.scope}).

House rules: paraphrase only, never copy six or more words from a page; no images; mechanics over numbers; cite every claim with its page URL. Read wikis through their MediaWiki API (for the Command & Conquer Wiki: https://cnc.fandom.com/api.php?action=parse&page=<Title>&prop=wikitext&format=json; the batch's registry note names other wikis' endpoints), space requests about two seconds apart and wait and retry after a 429.`

const NOTES = {
  type: 'object', required: ['role_line', 'game_wide', 'registry_findings', 'other_notes', 'pages_read'],
  properties: {
    role_line: { type: 'string', description: "Markdown for the game's 'Official role lines' subsection: where official text naming each unit's job lives (manual, in-game tooltip, official site), how roles step 1 and step 4 read it, whether it has strong-against or weak-against lines, and the URL(s). Say plainly if no official role text exists and what coders use instead." },
    game_wide: { type: 'string', description: "Markdown for the '### <Game> (`id`)' section under Game-wide mechanics, in the style of the existing sections in research/registry-notes/games-r1.md: a first line saying which pages it was written from, then one bullet per mechanic that belongs to the game rather than the unit, with the pattern id where one applies, the exceptions by unit name, and how coders record it." },
    registry_findings: { type: 'array', items: { type: 'object', required: ['path', 'current', 'proposed', 'evidence', 'severity'], properties: {
      path: { type: 'string', description: 'JSON path inside the game entry in data/games.json, e.g. factions/2/tier_map/3' },
      current: { type: 'string' }, proposed: { type: 'string', description: 'the exact new value (JSON) or the change' },
      evidence: { type: 'string', description: 'page URLs and what each shows, paraphrased' }, severity: { enum: ['wrong', 'missing', 'unclear'] } } } },
    other_notes: { type: 'string', description: `Anything else the research agents of this game must know (traps, page names, version to research), as Markdown bullets; only what ${NOTES_FILE} does not already say.` },
    pages_read: { type: 'array', items: { type: 'string' } },
  },
}

const CANDIDATES = {
  type: 'object', required: ['candidates', 'coverage_note'],
  properties: {
    candidates: { type: 'array', items: { type: 'object',
      required: ['id', 'name', 'faction', 'class', 'teaches', 'patterns', 'new_mechanics', 'pages', 'skirmish', 'shooter_note'],
      properties: {
        id: { type: 'string', description: 'unit id per the Ids convention' },
        name: { type: 'string' }, faction: { type: 'string' }, class: { type: 'string', description: 'term from data/vocab/classes.json' },
        role_guess: { type: 'string' },
        teaches: { type: 'string', description: 'what this unit teaches the generator: a distinct mechanic, an iconic counter or a memorable twist' },
        patterns: { type: 'array', items: { type: 'string' }, description: 'ids from data/pattern-registry.json it would link' },
        new_mechanics: { type: 'array', items: { type: 'object', required: ['id', 'summary'], properties: { id: { type: 'string' }, summary: { type: 'string' } } }, description: 'mechanics no registry id covers: a proposed new pattern id (kebab-case) and a one-line summary' },
        pages: { type: 'array', items: { type: 'string' }, description: 'the pages a researcher would cite' },
        skirmish: { type: 'string', description: 'buildable in skirmish or multiplayer? say which, and any multiplayer-only or campaign-only point' },
        shooter_note: { type: 'string', description: 'one line on how it would play as a player-controlled unit' },
        repeats: { type: 'string', description: 'what it shares with units already in data/units/ or other well-known units, if anything' },
      } } },
    coverage_note: { type: 'string', description: 'which classes, roles, factions and mechanics the list covers, and what it leaves out on purpose' },
  },
}

const VERDICTS = { type: 'object', required: ['verdicts', 'missing'], properties: {
  verdicts: { type: 'array', items: { type: 'object', required: ['claim', 'real', 'reason', 'evidence'], properties: {
    evidence: { type: 'string', description: 'the page URL fetched or the command run, and what it showed, paraphrased' },
    claim: { type: 'string', description: 'the claim or finding checked, short' }, real: { type: 'boolean', description: 'true when the sources confirm it' },
    reason: { type: 'string' }, correction: { type: 'string', description: 'the corrected text or value, if the claim is wrong or incomplete' } } } },
  missing: { type: 'array', items: { type: 'string' }, description: 'game-wide mechanics or registry problems the notes missed, each with its evidence' },
} }

function notesPrompt() {
  return `${COMMON}

## Your task: the game-level notes and the registry check for ${G.name}
The 1.0 field rules rely on game-level notes that are written once, before any unit of the game is coded. Read first: docs/fields.md (the Conventions, especially Shared mechanics and universal keys, Paired entries, Series games, Bands with numbers, and the roles.primary steps), research/registry-notes/README.md, research/registry-notes/games-r1.md (its Official role lines and Game-wide mechanics sections are the model to follow), ${NOTES_FILE}, the \`${G.id}\` entry in data/games.json, and data/pattern-registry.json.

${G.notesTask}

1. **Official role lines.** Find where official text names each unit's job for this game (manual, in-game tooltip, official site; wikis often copy manual or tooltip text and say so), and whether it has strong-against or weak-against lines. Coders read it before coding roles.
2. **Game-wide mechanics.** List every mechanic that belongs to the game rather than to a unit (orders, veterancy or its absence, repair, garrisons, crates, transports' universal keys, side-wide powers, cloaking or detection rules shared by many units, and so on), with the exceptions by unit. Check each on the pages you cite.
3. **Registry check.** Check the \`${G.id}\` entry in data/games.json against the sources: factions and subfactions, tier_map gates, cost_thresholds and their basis, speed_reference (is the reference unit's listed speed the speed it really moves at in the engine?), sight_reference, range_reference, damage_map and armour_map, version_researched. Report only real problems, each with evidence.
4. **Other notes** the unit researchers need that the batch's note does not already say.

Return the Markdown texts and the findings. Do not edit any file.`
}

function candidatesPrompt() {
  return `${COMMON}

## Your task: candidate units for ${G.name}
Propose ${G.want}. Read first: docs/proposal.md section 2.2 (how a batch runs), ${NOTES_FILE}, the \`${G.id}\` entry in data/games.json, data/pattern-registry.json (every registered pattern id) and research/registry-notes/patterns.md (example units already named for each id), docs/samples.md and data/units/*.json (units already researched), and data/vocab/classes.json and roles.json.

A good candidate teaches the generator something: a distinct mechanic, an iconic counter, or a memorable twist that would make a fun player-controlled unit. Spread the list across classes (infantry, vehicles, aircraft, ships, walkers, odd ones), factions, roles and price tiers, and across mechanics: avoid two candidates that teach the same thing, and avoid repeating what units already in data/units/ teach unless the unit adds a clear twist. Prefer units that are buildable in skirmish or multiplayer. Check each candidate's main page exists on the wiki (one API request each is enough) and give the pages a researcher would cite. Name the registry pattern ids each would link, and any mechanic no registry id covers as a proposed new id with a one-line summary.

Return the list and a short note on coverage. Do not edit any file.`
}

function verifyPrompt(notes) {
  return `${COMMON}

## Your job: try to refute the notes below
Another researcher wrote these game-level notes and registry findings for ${G.name}. Check every claim against the pages (fetch them yourself). Mark real=false for anything the sources do not support, give the corrected text, and list game-wide mechanics or registry problems that were missed (with evidence). Default to real=false when you cannot confirm a claim. Also check the house rules: no run of six or more words copied from a page.

${JSON.stringify(notes, null, 1)}`
}

phase('Research')
const [notes, cands] = await parallel([
  () => agent(notesPrompt(), { label: `notes:${G.id}`, phase: 'Research', schema: NOTES }),
  () => agent(candidatesPrompt(), { label: `candidates:${G.id}`, phase: 'Research', schema: CANDIDATES }),
])
phase('Verify')
const verdicts = notes ? await agent(verifyPrompt(notes), { label: `verify:${G.id}`, phase: 'Verify', schema: VERDICTS }) : null
return { game: G.id, notes, verdicts, candidates: cands }
