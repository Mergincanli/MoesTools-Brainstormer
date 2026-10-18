# Unit Forge

A creativity tool for designing units for **Shamble Frontlines**, a browser team shooter with a top-down camera where every player buys and *becomes* a unit. Unit Forge turns a researched database of real RTS and shooter unit designs into randomly combined, original unit concepts. You save them on a board, refine them, and export them as Markdown for design docs and as JSON for a later import into the game. It works like a morphological box: break units into building blocks, then recombine them.

## Status

**Step 1 of the plan, Foundations: done.** The proposal for the brief's first step (section 7 of the brief) was approved on 18 October 2026 (decisions 1B 2A 3C 4B 5B 6C 7B 8B 9A). Step 1 brought the tooling and CI (below), the games registry for the 28 games of the starting scope, the pattern registry grown past 50 ids, and decisions 4B (hard class bans only for physical nonsense, rarity per class) and 6C (low and high air, sight bands, sensor traits) applied to the word lists and data. It was approved on 18 October 2026 with the recommended answers to its two decisions: the whole team shares what any teammate sees (1A), and the calibration pilot tests two ways of banding speed in shooters before one is picked (2C). Next: the calibration pilot. The research run, the generator and the app have not started.

- [Proposal](docs/proposal.md): the plan, repository structure, decisions needed. Start here. Its counts (37 word lists at version 0.3.0, 23 planned patterns) are as they were when it was approved.
- [Samples](docs/samples.md): three researched units (RA3 Terror Drone, Hammer Tank, Multigunner IFV), three mechanic patterns and an example concept card.
- [Vocabularies](docs/vocabularies.md): the fixed word lists every record uses.
- [Fields](docs/fields.md): every field of every record type.

## Layout

| Folder | Contents |
|---|---|
| `data/` | Games registry, pattern registry, word lists, researched units, mechanic patterns (JSON). |
| `schemas/` | JSON Schemas for every record type. |
| `docs/` | Proposal, generated reference pages and the example concept card (`docs/examples/`). |
| `scripts/` | Validator, docs builder, JSON formatter, copy-check and checker sampler. |
| `research/` | Research working notes; `research/registry-notes/` has the step-1 notes for each research batch. |
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
| `npm run copy-check` | Fetches every page the data cites and flags any run of six or more words that a record shares with a page it cites. |
| `npm run sample -- --seed <text>` | Picks what the research checker re-checks: 1 in 5 units per game (at least 3) and every proposed pattern. The same seed always gives the same pick; add `--game <id>` for one game and `--json` for output a script can read. |
| `npm run check` | Format check, validator, docs check and tests, in that order. |

Edit the JSON directly; the word lists in `data/vocab/*.json` are the source of truth. After any JSON edit run `npm run format`; after any change under `data/`, `schemas/` or `docs/examples/` run `npm run docs`, and commit the rebuilt pages with it.

**CI** (`.github/workflows/ci.yml`) runs `npm ci` and `npm run check` on every push to `main` and every pull request, on Linux and Windows with Node.js 22 and 24. Git checks every text file out with LF line endings (`.gitattributes`), so the checks give the same result on Windows.

**The copy-check needs the network, so CI does not run it.** Research agents and checkers run it by hand before a research pull request. It asks one page at a time, pauses between requests and waits when a site asks it to slow down. A dropped connection or timeout is tried again at most twice; after three network failures in a row it stops fetching and lists the remaining pages as not checked. Wikis are read through their API. Pages are kept in `.cache/sources/` (not committed), so later runs can work offline. Behind a proxy (`HTTPS_PROXY`) it needs Node.js 22.21 or newer.

Options go after `--`, for example `npm run copy-check -- --offline`:

| Option | What it does |
|---|---|
| `--offline` | Uses cached pages only; pages not in the cache are listed as not checked. |
| `--min-words N` | The shortest shared run to report (default 6). |
| `--only <part of a URL>` | Checks only the pages whose URL contains this text; can be given more than once. |
| `--max-fetch N` | Fetches at most N pages in this run; the rest are listed as not checked. |
| `--refresh` | Fetches pages again even when they are cached. |
| `--delay MS` | The pause between requests, in milliseconds (default 1500). |
| `<folder>` | Checks another copy of the repository instead of this one. |

It ends with one of these exit codes, so a script can tell the results apart:

| Code | Meaning |
|---|---|
| 0 | Every cited page was checked and no record shares a run of words with a page it cites. |
| 1 | Shared runs were found (`FOUND` lines); rewrite them in your own words. Pages that were not checked are listed too. |
| 2 | Bad options. |
| 3 | No shared runs were found, but some pages were not checked (`INCOMPLETE` line): offline and not cached, over `--max-fetch`, an HTTP error or no network. The check is not finished; run it again with the network, or fix the URLs listed. |
