# Unit Forge

A creativity tool for designing units for **Shamble Frontlines**, a browser team shooter with a top-down camera where every player buys and *becomes* a unit. Unit Forge turns a researched database of real RTS and shooter unit designs into randomly combined, original unit concepts. You save them on a board, refine them, and export them as Markdown for design docs and as JSON for a later import into the game. It works like a morphological box: break units into building blocks, then recombine them.

## Status

**Step 1 of the plan, Foundations: done.** The proposal for the brief's first step (section 7 of the brief) was approved on 18 October 2026 (decisions 1B 2A 3C 4B 5B 6C 7B 8B 9A). Step 1 brought the tooling and CI (below), the games registry for the 28 games of the starting scope, the pattern registry grown past 50 ids, and decisions 4B (hard class bans only for physical nonsense, rarity per class) and 6C (low and high air, sight bands, sensor traits) applied to the word lists and data. It was approved on 18 October 2026 with the recommended answers to its two decisions: the whole team shares what any teammate sees (1A), and the calibration pilot tests two ways of banding speed in shooters before one is picked (2C).

**Step 2, Calibration pilot: done.** Three independent coders per unit coded six units in round 1 and four new units in round 2, and a speed test tried both ways of banding speed. Where the coders split, the word lists and field rules got sharper rules and tie-breaks. The result is word lists 1.0.0, approved on 20 October 2026 with the recommended answers to its six decisions: speed is banded against the game's soldier (1A); an ability's cost per use is not a resource (2A); a unit cites up to five sources (3B); faction flavour is computed from the unit's parts, and infiltrator is a favoured Allied role instead of a Soviet one (4A); a matchup about something the unit lacks keeps today's workaround (5A); and the lists are frozen now, with batch R1 opening with two units coded twice to test the last changes (6C). The report is in [research/pilot/](research/pilot/README.md).

**Step 3, Research run: in progress.** Batch R1 (Red Alert 1, 2 and 3: 25 units and 33 pattern files) was merged on 23 October 2026 ([research/r1/](research/r1/README.md)). The rule-fix round after it took up 40 of R1's rule problems and turned 39 of them into word lists 1.1.0 (one was dropped), approved on 24 October 2026, and recoded 23 of the 25 R1 units to match ([research/r1/rule-fix/](research/r1/rule-fix/README.md)).

On 24 October 2026, Mustafa narrowed the research run to reach the generator sooner: batch R3 (Generals with Zero Hour, Tempest Rising, Iron Harvest), then a new batch R4 (StarCraft II: Legacy of the Void, Halo Wars, Halo Wars 2, Planetary Annihilation: TITANS, MechWarrior/BattleTech), then steps 4 to 6. Batch R2 is paused during its prep, and the other games are shelved until after the app ([proposal, section 2.2](docs/proposal.md#22-the-research-run)).

Now: batch R3's prep. The generator and the app have not started.

- [Proposal](docs/proposal.md): the plan, repository structure, decisions needed. Start here. Its counts (37 word lists at version 0.3.0, 23 planned patterns) are as they were when it was approved.
- [Samples](docs/samples.md): three researched units (RA3 Terror Drone, Hammer Tank, Multigunner IFV), three mechanic patterns and an example concept card.
- [Vocabularies](docs/vocabularies.md): the fixed word lists every record uses (version 1.1.0, approved), with each term's coding rule and each list's tie-breaks.
- [Fields](docs/fields.md): every field of every record type.
- [Research runbook](docs/research-runbook.md): how a research batch runs step by step, its quality checks, and the night shift.

## Layout

| Folder | Contents |
|---|---|
| `data/` | Games registry, pattern registry, word lists, researched units, mechanic patterns (JSON). |
| `schemas/` | JSON Schemas for every record type. |
| `docs/` | Proposal, generated reference pages and the example concept card (`docs/examples/`). |
| `scripts/` | Validator, docs builder, JSON formatter, copy-check, checker sampler, agreement measure, word-list diff and pattern sync. |
| `research/` | Research working notes: `research/registry-notes/` has the notes for each research batch (games registry and patterns), `research/pilot/` the calibration pilot's record and report, `research/r<N>/` each batch's record, `research/workflows/` the batch's workflow scripts. |
| `tests/` | Tests for the scripts (`node:test`). |
| `.github/workflows/` | CI, which runs `npm run check` on every push to `main` and every pull request. |

## Rules for the data

Paraphrase only, cite every claim with a confidence level, no images. Real unit names are reference only; generated concepts always get original names.

## Working on the data

You need Node.js 22 or newer; `npm install` refuses older versions. Install once with `npm install`, then run `npm run check` before you push: it runs everything CI runs. The scripts live in `scripts/` and the tests in `tests/`.

| Command | What it does |
|---|---|
| `npm run validate` | Checks every file against the schemas and word lists, the links between files and the combination rules. Prints warnings, the rules that real units break (ATYPICAL) and errors, and fails on any error. |
| `npm run format` | Rewrites the JSON in `schemas/`, `data/` and `docs/examples/` in the house style (2-space indent, short lists on one line). |
| `npm run format:check` | Lists JSON files that are not in the house style, without changing them. |
| `npm run docs` | Rebuilds the generated pages in `docs/` (samples, vocabularies, fields) from the JSON. |
| `npm run docs:check` | Fails if a generated page is out of date. |
| `npm test` | Runs the tests in `tests/`. |
| `npm run copy-check` | Fetches every page the data cites and flags any run of six or more words that a record shares with a page it cites. Add `--also <folder>` to check notes too (see the options below). |
| `npm run sample -- --seed <text>` | Picks what the research checker re-checks: 1 in 5 units per game (at least 3) and 1 in 3 proposed patterns (at least 3). The same seed always gives the same pick; add `--game <id>` for one game, `--all-patterns` to list every proposed pattern (as batch R1 did) and `--json` for output a script can read. |
| `npm run agreement -- <folder>` | Measures how often independent coders agree, field by field, on the same units: `<folder>` holds one folder of unit files per coder (folders with no unit files, such as notes, are skipped and named). Add `--reference <folder>` to compare each coder with other unit files (such as `data/units`), `--json` for output a script can read, or `--table <file>` for codings that are not units (whole numbers count as counts; for decimals the table can give a `tolerance` and a `step`, see the script's header). Used by the calibration pilot. |
| `npm run vocab-diff -- <old> [<new>]` | Lists what changed in the word lists between two versions: each version is a folder of word lists or a git commit (its `data/vocab/`); `<new>` defaults to `data/vocab`. |
| `npm run sync-patterns` | Fills in each pattern file's `source_units` from the units that link it (through abilities, weapons and modes). Research agents never run it and never edit an existing pattern file: they run `npm run validate`, which warns while a list is out of date (a new pattern they write gets its first list by hand). The merge pass runs it once, then `npm run docs`, then `npm run check:merge`. |
| `npm run sync-patterns:check` | Lists the pattern files whose `source_units` are out of date, without changing them, and fails if there is one. |
| `npm run check` | Format check, validator, docs check and tests, in that order. This is what CI runs. |
| `npm run check:merge` | The pattern sync check, then `npm run check`. For the merge pass: a research pull request may leave pattern lists out of date, so CI does not run it. |

Edit the JSON directly; the word lists in `data/vocab/*.json` are the source of truth. After any JSON edit run `npm run format`; after any change under `data/`, `schemas/` or `docs/examples/` run `npm run docs`, and commit the rebuilt pages with it.

**CI** (`.github/workflows/ci.yml`) runs `npm ci` and `npm run check` on every push to `main` and every pull request, on Linux and Windows with Node.js 22 and 24. Git checks every text file out with LF line endings (`.gitattributes`), so the checks give the same result on Windows.

**The copy-check needs the network, so CI does not run it.** Research agents and checkers run it by hand before a research pull request, with `--also` for any folder of notes the pull request adds or changes. It asks one page at a time, pauses between requests and waits when a site asks it to slow down. A dropped connection or timeout is tried again at most twice; after three network failures in a row it stops fetching and lists the remaining pages as not checked. Wikis are read through their API. Pages are kept in `.cache/sources/` (not committed), so later runs can work offline. Behind a proxy (`HTTPS_PROXY`) it needs Node.js 22.21 or newer.

Options go after `--`, for example `npm run copy-check -- --offline`:

| Option | What it does |
|---|---|
| `--offline` | Uses cached pages only; pages not in the cache are listed as not checked. |
| `--min-words N` | The shortest shared run to report (default 6). |
| `--only <part of a URL>` | Checks only the pages whose URL contains this text; can be given more than once. |
| `--max-fetch N` | Fetches at most N pages in this run; the rest are listed as not checked. |
| `--refresh` | Fetches pages again even when they are cached. |
| `--delay MS` | The pause between requests, in milliseconds (default 1500). |
| `--also <folder>` | Also checks notes that cite no page, such as `research/pilot`: every text in the `.json` and `.md` files under the folder, against every page in the cache, every page the data cites and every page the notes link to. Runs that also appear in our own data, schemas or registry notes are ignored, since that is our own wording quoted back. Can be given more than once. |
| `<folder>` | Checks another copy of the repository instead of this one. |

It ends with one of these exit codes, so a script can tell the results apart:

| Code | Meaning |
|---|---|
| 0 | Every cited page was checked and no record shares a run of words with a page it cites (and no note, with `--also`, shares one with any page). |
| 1 | Shared runs were found (`FOUND` lines); rewrite them in your own words. Pages that were not checked are listed too. |
| 2 | Bad options, an `--also` folder that does not exist, or a `.json` file under it that is not valid JSON. |
| 3 | No shared runs were found, but some pages were not checked (`INCOMPLETE` line): offline and not cached, over `--max-fetch`, an HTTP error or no network. The check is not finished; run it again with the network, or fix the URLs listed. |
