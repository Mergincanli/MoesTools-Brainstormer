# Unit Forge

A creativity tool for designing units for **Shamble Frontlines**, a browser team shooter with a top-down camera where every player buys and *becomes* a unit. Unit Forge turns a researched database of real RTS and shooter unit designs into randomly combined, original unit concepts. You save them on a board, refine them, and export them as Markdown for design docs and as JSON for a later import into the game. It works like a morphological box: break units into building blocks, then recombine them.

## Status

**The brief's first step (section 7 of the brief): proposal, approved on 18 October 2026** (decisions 1B 2A 3C 4B 5B 6C 7B 8B 9A). Nothing is built yet beyond draft data and schemas.

- [Proposal](docs/proposal.md): the plan, repository structure, decisions needed. Start here.
- [Samples](docs/samples.md): three researched units (RA3 Terror Drone, Hammer Tank, Multigunner IFV), three mechanic patterns and an example concept card.
- [Vocabularies](docs/vocabularies.md): the fixed word lists every record uses.
- [Fields](docs/fields.md): every field of every record type.

## Layout

| Folder | Contents |
|---|---|
| `data/` | Games registry, pattern registry, word lists, researched units, mechanic patterns (JSON). |
| `schemas/` | JSON Schemas for every record type. |
| `docs/` | Proposal and generated reference pages. |

## Rules for the data

Paraphrase only, cite every claim with a confidence level, no images. Real unit names are reference only; generated concepts always get original names.

## Working on the data

You need Node.js 20 or newer (CI uses 22). Install once with `npm install`, then run `npm run check` before you push: it runs everything CI runs. The scripts live in `scripts/` and the tests in `tests/`.

| Command | What it does |
|---|---|
| `npm run validate` | Checks every file against the schemas and word lists, the links between files and the combination rules. Prints warnings, the rules that real units break (ATYPICAL) and errors, and fails on any error. |
| `npm run format` | Rewrites the JSON in `schemas/`, `data/` and `docs/examples/` in the house style (2-space indent, short lists on one line). |
| `npm run format:check` | Lists JSON files that are not in the house style, without changing them. |
| `npm run docs` | Rebuilds the generated pages in `docs/` (samples, vocabularies, fields) from the JSON. |
| `npm run docs:check` | Fails if a generated page is out of date. |
| `npm test` | Runs the tests in `tests/`. |
| `npm run copy-check` | Fetches every page the data cites and flags any run of six or more words that a record shares with a page it cites. |
| `npm run sample -- --seed <text>` | Picks what the research checker re-checks: 1 in 5 units per game (at least 3) and every proposed pattern. The same seed always gives the same pick; add `--game <id>` for one game. |
| `npm run check` | Format check, validator, docs check and tests, in that order. |

The word lists in `data/vocab/*.json` are now edited directly. After changing one, run `npm run format` and `npm run docs`, and commit the rebuilt pages with it.

**CI** (`.github/workflows/ci.yml`) runs `npm ci` and `npm run check` on every push and pull request.

**The copy-check needs the network, so CI does not run it.** Research agents and checkers run it by hand before a research pull request. It asks one page at a time, pauses between requests and waits when a site asks it to slow down. Wikis are read through their API. Pages are kept in `.cache/sources/` (not committed), so later runs can work offline. Options go after `--`, for example `npm run copy-check -- --offline`: `--offline` (cached pages only), `--min-words N` (default 6), `--only <part of a URL>`, `--max-fetch N`, `--refresh`.
