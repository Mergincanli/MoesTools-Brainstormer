# Handoff: continuing Unit Forge in a new session

Written on 10 November 2026, when the project moved from the session that ran it from 17 October to a new account. Read this first, then [CLAUDE.md](../CLAUDE.md) and the [research runbook](research-runbook.md). Updated on 11 November 2026: the phases that were open then are done, and the saved work in progress (`research/handoff/`) has been used and deleted.

## TL;DR

- **The project:** Unit Forge, a tool for Mustafa that turns a researched database of real RTS and shooter units into original unit concepts for his game, Shamble Frontlines. The brief is [docs/brief.md](brief.md) and the plan is [docs/proposal.md](proposal.md).
- **Where it stands:** plan step 3, the research run, batch R3 (Command & Conquer: Generals with Zero Hour, Tempest Rising, Iron Harvest).
  - All 27 R3 units are coded, checked and in `data/units/` (commit 6c817f1).
  - The merge pass, the patterns, the checker, the rule problems, the report, the final review and the claims check followed on 10 and 11 November (section 3). The report is [research/r3/README.md](../research/r3/README.md).
  - R3 is finished. It waits for Mustafa's approval of the pull request, and R4 waits for his word.
- **Everything is on one branch, `claude/quirky-cray-tih1w4`, in [pull request #6](https://github.com/Mergincanli/MoesTools-Brainstormer/pull/6).** That pull request also holds Mustafa's plan change of 24 October, and it waits for his approval (section 4).
- **First thing to do in the new session:** section 7.

## 1. What the project is

- **Brief:** [docs/brief.md](brief.md) is Mustafa's original brief, as he wrote it.
  - The tool breaks real units into building blocks (class, mobility, body, weapons, crew, abilities, counters) and recombines them into concept cards.
  - The game it serves is a browser team shooter with a top-down camera, where each player buys and *becomes* one unit. So every mechanic must be translated into how it plays for one player.
- **Plan:** [docs/proposal.md](proposal.md), section 2. It has six steps:

  | Step | What | Status |
  |---|---|---|
  | 1 | Foundations: tooling, CI, games registry, pattern registry | done |
  | 2 | Calibration pilot: word lists 1.0 | done |
  | 3 | Research run: batches R1, R3, R4 | R1 merged; R3 in progress; R4 next |
  | 4 | Pattern consolidation: merge duplicates, coverage report, top-30 list | after R4 and its rule-fix round |
  | 5 | Generator (TypeScript, seeded rolls) | not started |
  | 6 | App (GitHub Pages) | not started |

- **Plan change of 24 October 2026** (Mustafa):
  - R3 now, then a new R4: StarCraft II (Legacy of the Void only: multiplayer, Archon mode, co-op Allied Commanders and its campaign, all three races), Halo Wars, Halo Wars 2, Planetary Annihilation: TITANS, MechWarrior/BattleTech.
  - Then one rule-fix round for R3's and R4's rule problems (his answer 3A), then steps 4 to 6.
  - R2 (Tiberian Dawn, Tiberian Sun, Tiberium Wars, Renegade) is paused with its prep kept in [research/r2/](../research/r2/README.md). Fourteen other games are shelved until after the app.
- **Merged to `main` so far:**
  - the proposal;
  - step 1;
  - step 2;
  - batch R1 (Red Alert 1, 2 and 3; pull request #4);
  - the rule-fix round after R1, which made word lists 1.1.0 (pull request #5).

## 2. The commits on pull request #6

| Commit | What |
|---|---|
| 8366649 | Plan change of 24 October 2026 (proposal, runbook, README, games registry buckets) |
| 489ba33 | Copy-check drops web addresses in JSON notes |
| 5b2dd46 | R2 paused: the prep of three games kept |
| 9340fde | R3 prep: game notes, registry edits, trim (27 units) |
| 48629b8 | R3 opening check, and night decisions N1 to N4 |
| a9cd648, 2ccc323, 2870003, bcdfa81 | R3 fill: 13 jobs, 25 units, and the fill hesitations |
| 6c817f1 | R3 merge pass step 1: the 27 units into `data/units/` |
| 71d7e67 | Handoff: this file, the brief and CLAUDE.md |
| 527724f, 3618824 | R3 merge pass, steps 2 and 3: the consistency check and its fixes |
| 9b65b5e | Runbook: commit messages carry no model name |
| ef2460e | R3 patterns: 33 proposed pattern files and the units' links |
| 8e1746f, 9ce1f96, 6556887 | R3 checker: the seed, the 23 confirmed fixes, the record |
| e05e5c4 | R3 rule problems (18 settled) and the report |
| 7142f5c | Handoff updated; the saved work in progress deleted |
| bc3d69a, 43f6abb | R3 final review: the 40 confirmed findings fixed, and the findings recorded |
| a199319, 9fe2a4e, c04f1a1 | R3 follow-up check: 9 fixes, its record, and the report's copy-check figures |
| 4920f1a, 1e6a63d | R3 claims check: the 11 confirmed findings fixed |
| 8217585, 50f85f5 | R3 recheck: its 5 fixes, and 16 rewordings from the comparison with the rendered wiki pages |
| f9f4a18 and the commit after it | R3 second recheck: its 3 fixes; the report names the commit the copy-check ran on; this file updated |

CI runs four check jobs on every push; it was green on each head it has finished on. `npm run check:merge` passes, with 305 of 305 tests.

## 3. Batch R3 in detail

**Units (9 per game):**
- **Generals:** Jarmen Kell, Battle Bus, Technical, Overlord, Red Guard, Hacker, Aurora Bomber, Sentry Drone, Combat Chinook.
- **Tempest Rising:** Drone Operator, Sentinel, Shieldmaiden, Line Officer, Voltaic Tank, Tempest Sphere, Enlightened, Thunderhead, Vimana.
- **Iron Harvest:** Anna Kos and Wojtek, Mocny, Grimbart, Kaiser, Olga Morozova and Changa, Nakovalnya, William Mason, Stark, Engineer squad.

**The record so far** ([research/r3/](../research/r3/)):
- `prep/`: the trim and the editors' changes;
- `opening/`:
  - the opening check (54 of the 56 measured fields reached 80% agreement);
  - the drafted fixes for its two splits (`splits.json`);
  - the reconciled entries;
- `fill/`: one folder per job (unit file and report) and `hesitations.md`, with 416 hesitations, 90 gaps and 128 unclear rules.

**Night decisions taken on 27 October**, which are notes only and reversible, in `research/registry-notes/games-r3.md`:
- **N1:** an Iron Harvest "(Ability)" slot that a mode adds as a standing weapon is coded as a weapon (the Kaiser's rockets).
- **N2:** the extra or missing buttons of a Generals general's version go in `tier.basis`.
- **N3:** until the rule-fix round, a walker on many legs with a fixed main gun is `spider-frame` (the Kaiser, the Mocny, the Stark).
- **N4:** confidence keeps the current practice, and every contradiction between pages is logged.

**Done since the handoff, in runbook order:**

1. **Merge pass, steps 2 and 3** (527724f, 3618824): four finders and their skeptics, 33 of 37 findings confirmed and fixed. Record: `research/r3/merge/`.
2. **Patterns** (ef2460e): 33 proposed pattern files, 16 of them new ids, each checked by a skeptic; the units link them. Record: `research/r3/patterns/`.
3. **Checker** (8e1746f, 9ce1f96, 6556887): seed `r3-2026-11-11`; every game passes; 23 confirmed fields fixed. Record: `research/r3/checker/`.
4. **Rule problems and report** (e05e5c4): `research/r3/rule-problems.md` and `research/r3/README.md`.
5. **Final review** (bc3d69a, 43f6abb): 48 findings, 40 confirmed, 8 answered. A follow-up check on the fixes confirmed 10 more. All are fixed but one, a line of the plan that waits for Mustafa (pull request #6, item 2). The copy-check now reads Steam news posts. Record: `research/r3/review/` and the report's "Copied wording".
6. **Claims check and rechecks** (4920f1a, 8217585, f9f4a18): the claims check recomputed 147 claims of the report and the pull-request description and raised 11 findings. A recheck of the changed sentences raised 5, and a second recheck 3. Skeptics confirmed all of them, and all are fixed. The description is posted on pull request #6. Record: `research/r3/review/findings.json`, under `follow_ups`.
7. **Comparison with the rendered wiki pages** (8217585): the copy-check reads a wiki page's source text, so it does not see text that a template kept on another page draws in, such as an ability box. A one-off script fetched the rendered version of all 982 wiki pages in the cache, and the unchanged copy-check compared the data, the record and the notes with them. It found 16 shared runs of six or seven words; all are reworded, text only. The report's "Copied wording" describes it as part 4.

**What is left:**

1. **Mustafa's approval of pull request #6**, which also holds the plan change. Then the merge (runbook section 9): only when every gate passes on the same wake-up, and with a merge commit, never a squash.
2. **Then R4** (StarCraft II: Legacy of the Void, Halo Wars, Halo Wars 2, Planetary Annihilation: TITANS, MechWarrior/BattleTech), from its prep, and only when Mustafa says so. Before any fill:
   - **The copy-check and rendered pages.** Pull request #6 asks Mustafa whether the copy-check should learn to read the rendered wiki page as R4's first prep step (recommended) or in that pull request. Until the tool can, repeat the one-off comparison before a batch is called clean: ask each wiki's `api.php` for `action=parse` with `prop=text` instead of `prop=wikitext`, save the result as an html page in a throwaway root's cache, copy `data/`, `schemas/` and the batch's `research/` folders beside it, and run the copy-check there with `--offline`.
   - **The site test.** Test the copy-check on one page from each site R4 will cite, and show that it reads the page's real text: open the page in a browser, plant passages of what a reader sees in a throwaway record that cites the page, and see that the copy-check flags them. For a wiki that shows a headless browser a bot page (Fandom, Liquipedia), take the wiki's own rendered page from its API as the reader's view.
   - **The test of 11 November** (run ahead, as a tool check): all planted passages were flagged on www.halopedia.org, halo.fandom.com, www.sarna.net, mwo.fandom.com, planetaryannihilation.fandom.com, palobby.com, news.blizzard.com and www.halowaypoint.com (its news index; test a Halo Wars 2 page too). On starcraft.fandom.com only 2 of 5 were flagged: its ability and upgrade boxes are templates kept on other pages. liquipedia.net: 4 of 5 on a saved page; the site limits automated reading, so read its API terms before citing it at volume. mwomercs.com: 4 of 5 (the miss is a cookie notice). planetaryannihilation.com refuses the request (HTTP 403): check by hand if it is cited. A Steam news index page holds no post; single posts are read. Repeat the test for every site the prep adds.
   - **A line for the agent briefs,** proposed to Mustafa on 11 November and not in the runbook until he approves: "Evidence: give the page's address and say in your own words what it shows. Never copy six or more words in a row from a page, in any field of your answer, your notes or a file, the evidence included; give a figure or a name as it is, and paraphrase everything else."

**Known and left alone:** `npm run copy-check -- --offline --also data/units` finds coincidental six-word runs in R1's units (13 on 11 November 2026; the count depends on the cache), against pages that other records cite or name, most of them cited by R1's own pattern files, such as "while it is in the air" (Halopedia's Plasma grenade page, cited by throw-explosive). None is a page those units cite, and none is in R3's units.

## 4. What waits for Mustafa (pull request #6, "Decisions needed")

1. Approve the plan change and merge. R3 has passed its checker and its final review. His approval also covers a one-line wording change in `schemas/game.schema.json` (no rule changes); the merge commit message records it.
2. The StarCraft II count: about 15 units, 5 per race (A, recommended: keep it; B: another number before R4's prep). The plan lists this count among his answers of 24 October, but the saved record of that day has no count; the plan's line stands until he says which it is.
3. The five questions from R3's prep. Coding follows the recommended answers:
   - the Generals tier map (A, keep it);
   - Generals lasers (A, follow the game's damage types);
   - Purpose lines for generals' versions (A);
   - Tempest Rising's "air control" and "zone control" (A now: they name no role; then C: write that into the word list at the rule-fix round);
   - Iron Harvest's "mech hunter" (B, add to anti-armour at the rule-fix round).
4. Taken during the batch with the recommended option, each reversible: night decisions N1 to N4 (above), the consistency check's fixes, three choices about the new patterns, the Vimana's second roles and 18 settled rule problems. The report's "Decisions" lists them.
5. Left for him at the pattern review (plan step 4): whether to fold `stack-to-overload` into `freeze-and-shatter`.
6. For the rule-fix round after R4, no answer needed now: the 83 rule problems in `research/r3/rule-problems.md`, among them the walker body-plan tie-break and the confidence rule (`research/r3/opening/splits.json`).
7. For R4's prep, no answer needed to merge: whether the copy-check learns to read rendered wiki pages as R4's first prep step (A, recommended) or in pull request #6 (B); and the one-line rule on evidence for the agent briefs (section 3, "What is left").

## 5. How the work is done

The procedure is [docs/research-runbook.md](research-runbook.md): its sections 1 to 10, the state file and night log, decisions, Git and safety. [CLAUDE.md](../CLAUDE.md) lists the rules that matter most. The ones learned the hard way:

- **Spend limits stop workflows part way.** Each agent keeps progress notes in its workspace (`.progress/`), so a resumed run goes on from them. `resumeFromRunId` works only within the session that launched the run. A new session re-runs the missing agents with the same script and arguments.
- **At most two workflows at once.** Mustafa wants efficient use of tokens. A fill job of two units costs about 0.5 to 1 million tokens; the R3 fill as a whole cost about 11 million.
- **The copy-check finds six-word runs in agent text every time.** This happens most in reports, hesitations and uncertain notes, and in older text once a new page is cited. Run it on the whole record before every commit, and reword only the text, never a coded value.
- **Tests that read the live data can break when units are added.** Fix the test without weakening it, as in 6c817f1.
- **The copy-check reads a wiki page's source text, not the page a reader sees.** Text that a template kept on another page draws in is missed (section 3, item 7). A script-drawn page can be missed too, as Steam news posts were. Test each new site before a fill.
- **The page cache** (`.cache/sources/`, 271 MB, not committed) does not move to a new machine. Agents and the copy-check fetch pages again as needed, through the wiki APIs, two seconds apart.

## 6. What did not move, and what to do about it

| Item | Where it was | What to do |
|---|---|---|
| Scratchpad (state file, night log, workspaces, agent results) | the session's machine | It does not move. What a later session needs is in the repository: the record under `research/r3/` and this file |
| Workflow runs | the old session | They cannot be resumed from a new session: re-run (section 3) |
| Page cache | `.cache/sources/` on the old machine | Rebuilt as pages are fetched again |
| Night-shift routine | the old account (disabled on 29 October) | Recreate it on the new account if wanted ([appendix](#appendix-the-night-shift-routine)); delete the old one |
| Branch name | `claude/quirky-cray-tih1w4`, named in the runbook (lines 39, 234, 248, 270) and the routine | Keep using it if the new environment can push to it; otherwise update those lines |

## 7. First steps in the new session

1. Make sure the Claude GitHub app can reach `Mergincanli/MoesTools-Brainstormer`, with push access.
2. Run `npm install` (Node.js 22 or newer), then `npm run check:merge`. It should pass 305 of 305 tests.
3. Check out `claude/quirky-cray-tih1w4` at this handoff commit or later.
4. Read this file, CLAUDE.md and the runbook.
5. Go on with section 3, "What is left".

## Appendix: the night-shift routine

Mustafa's standing instruction of 20 October 2026 lets the session work between 00:00 and 08:30 Amsterdam time without waiting for him. The routine on the old account:
- fired into the session at five past every hour from 00:05 to 08:05 (cron `CRON_TZ=Europe/Amsterdam 5 0-8 * * *`);
- wrote a morning summary at 08:05.

Its prompt follows. If you recreate it, change the branch and the state file's place to match the new environment.

> Night shift for Unit Forge. This is Mustafa's standing instruction of 20 October 2026: between 00:00 and 08:30 Amsterdam time he is asleep and wants the research run to go on without waiting for his approval, at the same quality as the day sessions. The procedure and the quality bar are docs/research-runbook.md: read its section "The night shift" first, then follow the whole runbook exactly.
>
> On every wake-up, in this order:
> 0. Run `TZ=Europe/Amsterdam date`. The night powers (merging, taking decisions, starting a batch) apply only between 00:00 and 08:30. At any other time, follow the day rules.
> 1. On the routine's 08:05 wake-up (between 08:00 and 08:30): write the morning summary from the night log and the state file; send a short push notification if you can; start nothing, and stop.
> 2. Read the state file and the night log (in the scratchpad: `r<N>/state.json` and `r<N>/night-log.md`, for the current batch). If the state file has a `hold` whose time has not passed, launch no agent or workflow: log the wake-up and end the turn. Then check: the pending notifications; the open pull request of the batch's branch (CI on its head, merge state, review threads); which workflows are still running.
> 3. A workflow that failed on a usage limit: if the reset time the error gave has passed, resume it as runbook section 3 says, with the same script and the same arguments; otherwise, end the turn.
> 4. Otherwise, start the next phase that is ready (the state file's `next` list gives the order), unless one is already running. If everything is waiting, end the turn without a message.
> 5. Merge only when every check in runbook section 9 passes on this wake-up, with its output in the night log. The plan-change pull request is Mustafa's to approve: never merge it at night.
> 6. Take only the decisions the runbook allows at night, and record each one.
> 7. Never: change the approved word lists or field rules (`data/vocab`, `schemas`, the Conventions in `scripts/build-docs.mjs`, the rule checks in `scripts/validate.mjs`); push anywhere but the batch's branch, or force-push; work around a denied action (skip it and note it).
>
> Write every action to the night log as you go. If Mustafa has written since the last wake-up, his message comes first.

Running it costs usage around the clock. Mustafa paused it on 29 October to free usage for other work.
