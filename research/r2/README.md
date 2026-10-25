# Batch R2: paused during its prep

## TL;DR

- **Paused on 24 October 2026.** Mustafa narrowed the research run to reach the generator sooner ([proposal, section 2.2](../../docs/proposal.md#22-the-research-run)). R2 (Tiberian Dawn, Tiberian Sun, Tiberium Wars with Kane's Wrath, Renegade) comes back with the other shelved games after the app.
- **What is kept:** the prep of three games, as `prep.js` returned it: Tiberian Dawn, Tiberian Sun and Tiberium Wars. Renegade's prep was never started (his answer 1A).
- **Nothing else changed:** `research/registry-notes/games-r2.md` and the R2 entries of `data/games.json` are as step 1 left them. No unit was coded.

## What each file holds

Each `prep/prep-<game>.json` is one game's result from [`research/workflows/prep.js`](../workflows/prep.js), run in batch R2 on 24 and 25 October 2026:
- `notes`: a researcher's draft of the game's official role lines, its game-wide mechanics, its registry findings (each with a JSON path, the current value, the proposed value and the evidence), other notes for the unit researchers, and the pages read;
- `verdicts`: a skeptic's check of every claim in the notes, each marked as holding or not, with a correction where it does not, plus the points the notes missed (`missing`);
- `candidates`: the candidate units, each with what it teaches, its pattern ids, its pages, whether skirmish can build it, and a line on how it would play.

| Game | Registry findings | Claims checked | Corrected | Missing points | Candidates |
|---|---|---|---|---|---|
| Tiberian Dawn (`cnc-td`) | 6 | 69 | 14 | 13 | 13 |
| Tiberian Sun (`cnc-ts`) | 3 | 69 | 14 | 21 | 13 |
| Tiberium Wars (`cnc3`) | 5 | 64 | 26 | 12 | 14 |

These are drafts, not finished notes: no editor has applied the skeptic's corrections yet (`notes-and-trim.js`), and no unit has been picked.

**Changed after the agents returned them:**
- The copy-check found 37 six-word runs shared with web pages, and a check against the cited manuals found 6 more. Most were code names copied from EA's source files, lists of names in a page's order, quoted database lines and infobox field names. Each was reworded: names put in another order, or the sentence rewritten in plain words.
- Three local file paths were replaced with `<scratch>`.

## How to go on with R2

1. Run `prep.js` for Renegade (game id `renegade`; its open points are in `research/registry-notes/games-r2.md`).
2. Put the four results, named `prep-<game>.json`, in the folder `notes-and-trim.js` reads (its `dir` argument). Then run it with the four games and the trim (runbook, section 1).
3. Before the trim, check the candidates against the units in `data/units/` at that time. These candidates were proposed when only R1's units existed, so R3's and R4's units may repeat some of them.
4. Read the notes against the word lists in use then. If the rules have changed since, R2 also needs an opening check (runbook, section 2).

## Checks

- **Copy-check, online, on this folder** (runbook section 8, step 4, part 1): no shared runs in the 958 cited pages it could read. It could not read 14:
  - the old Westwood site (two pages, which answered 503) and its archive copy (timed out);
  - GitHub folder and repository addresses (six answered 403 and three 404), and the wiki's bare address (403): addresses, not pages;
  - one StrategyWiki page that does not exist.
- **The cited manuals** (part 3, read with `pdftotext`): no shared runs with the nine that have a text layer. Two scans are images only, the 2007 Tiberium Wars manual and its tech-tree chart, so they could not be checked this way. The Ultimate Collection manual reprints the 2007 unit paragraphs, and it was checked.
- **Local paths:** none.
