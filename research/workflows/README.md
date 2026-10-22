# Workflow scripts for the research run

These are the multi-agent workflow scripts a research batch runs, in the order of [docs/research-runbook.md](../../docs/research-runbook.md). Each is a script for the session's workflow tool, not a Node program: run it with the workflow tool and pass `args` as the header comment shows. Every script takes `batch: { id: 'r<N>', scope: '...' }`. The agents read the batch's note, `research/registry-notes/games-r<N>.md`.

| Script | Runbook section | What it does |
|---|---|---|
| `mkws.sh` | 3 | Makes a copy of the repository for one agent: no git history, `node_modules` linked, the page cache copied. Usage: `sh research/workflows/mkws.sh <folder>`. Running it again on a folder starts that job over: it deletes the old copy, notes included. |
| `prep.js` | 1 | For one game: the game-level notes and the registry check, then a skeptic on every claim; candidate units in parallel. Save the result as `prep-<game>.json` in the batch's scratchpad folder. |
| `notes-and-trim.js` | 1 | One editor per game turns the notes and the skeptic's verdicts into final texts and registry edits; one judge trims the candidates to the batch's units. |
| `code-units.js` | 2, 3 | Research agents fill unit entries, each in its own copy. Mode `opening` for the two independent coders of an opening check, `fill` for the batch. |
| `reconcile.js` | 2 | Merges the two codings of an opening-check unit into the final entry. |
| `patterns.js` | 5 | Writes proposed pattern files for new and planned pattern ids: writer, then skeptic, then the writer applies the confirmed corrections. |
| `checker.js` | 6 | The separate checker re-opens the sources of the sampled units and every proposed pattern (`npm run --silent sample -- --seed <seed> --json --root <copy>`); a skeptic re-checks each field marked wrong. |
| `final-review.js` | 7 | One reviewer per dimension (data, consistency, patterns, record, and tooling when the batch changed any), then a skeptic per dimension. |
| `verify-fixes.js` | 7 | After the fixes: closure of each finding, new problems the fixes made, and the truth of every claim in the report and the pull-request description. |

**What comes back.** `code-units.js` and `reconcile.js` return `{ results, failed }`; `patterns.js`, `checker.js`, `final-review.js` and `verify-fixes.js` return `{ results, failed, unverified }`. `failed` lists the jobs or groups whose agent returned nothing, and `unverified` those whose skeptic returned nothing. Both must be empty before a phase counts as done; run anything listed again on its own. Every verdict carries its evidence (the page or command and what it showed); a verdict without it counts as not checked.

**Progress notes.** Every agent keeps notes as it works, so a resumed run goes on from where a cut-off agent stopped instead of starting over (runbook, "Progress notes"). Agents with a workspace keep them in `<ws>/.progress/<stage>/`. The scripts whose agents only read the repository (`prep.js`, `notes-and-trim.js`, `checker.js`, `final-review.js` and `verify-fixes.js`) also take `progress`: a folder outside the repository, such as `<scratchpad>/r<N>/progress/<script>`, in which each agent gets a folder of its own. They refuse to run without it. Pass the same folder on a resume and a new one for a new run. `tests/workflows.test.mjs` runs every script with stand-in agents and checks that each agent gets its own notes folder.

**First runs.** `patterns.js`, `checker.js`, `final-review.js` and `verify-fixes.js` had not run before batch R1's later phases. After their first run, check that the result has the shape above and that every item sent came back, before using it.

Batch R1 ran the first versions of `prep.js`, `notes-and-trim.js`, `code-units.js` and `reconcile.js`. They were written for its three games; these copies take the batch as an argument. The agents' results stay in the scratchpad until the integrator copies the units, notes and records into the repository.
