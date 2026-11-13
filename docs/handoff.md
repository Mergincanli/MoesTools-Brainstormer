# Handoff: continuing Unit Forge in a new session

Written on 10 November 2026, when the project moved from the session that ran it from 17 October to a new account. Read this first, then [CLAUDE.md](../CLAUDE.md) and the [research runbook](research-runbook.md). Updated on 11 November 2026: the phases that were open then are done, the saved work in progress (`research/handoff/`) has been used and deleted, and Mustafa approved pull request #6 (section 4). Updated on 12 November 2026: pull requests #7 and #8 are merged, batch R4 is parked after its prep, and the next work is a first generator, the plan's step 3b (section 3, "What is left", and section 4). Updated on 13 November 2026: pull request #9 is merged, and Mustafa approved the generator's rule sheet ([docs/generator-rules.md](generator-rules.md)), so the build has started.

## TL;DR

- **The project:** Unit Forge, a tool for Mustafa that turns a researched database of real RTS and shooter units into original unit concepts for his game, Shamble Frontlines. The brief is [docs/brief.md](brief.md) and the plan is [docs/proposal.md](proposal.md).
- **Where it stands (12 November 2026):** the next work is the first generator, the plan's step 3b, which Mustafa moved ahead of batch R4 that day (section 3, "What is left"). Its first step was a rule sheet, which he approved on 13 November 2026 ([docs/generator-rules.md](generator-rules.md)); the rules as data, the module and a first page of sample cards follow. Batch R4 is parked after its prep: the record is in [research/r4/prep/](../research/r4/prep/README.md), and R4 starts only when he says so.
- **Batch R3** (Command & Conquer: Generals with Zero Hour, Tempest Rising, Iron Harvest), in plan step 3, the research run, is done.
  - All 27 R3 units are coded, checked and in `data/units/` (commit 6c817f1).
  - The merge pass, the patterns, the checker, the rule problems, the report, the final review and the claims check followed on 10 and 11 November (section 3). The report is [research/r3/README.md](../research/r3/README.md).
  - R3 is finished. Mustafa approved its pull request on 11 November 2026. R4 waits for his word: do not start it before he says so.
- **Everything is on one branch, `claude/quirky-cray-tih1w4`, in [pull request #6](https://github.com/Mergincanli/MoesTools-Brainstormer/pull/6).** That pull request also holds Mustafa's plan change of 24 October. He approved the plan change, the wording change in `schemas/game.schema.json` and the merge on 11 November 2026 (section 4). It is merged with a merge commit that records his approval.
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
  | 3 | Research run: batches R1, R3, R4 | R1 and R3 merged; R4 next, on Mustafa's word |
  | 4 | Pattern consolidation: merge duplicates, coverage report, top-30 list | after R4 and its rule-fix round |
  | 5 | Generator (TypeScript, seeded rolls) | not started |
  | 6 | App (GitHub Pages) | not started |

- **Plan change of 24 October 2026** (Mustafa):
  - R3 now, then a new R4: StarCraft II (Legacy of the Void only), Halo Wars, Halo Wars 2, Planetary Annihilation: TITANS, MechWarrior/BattleTech. On 11 November 2026 he changed the StarCraft II scope: multiplayer only, and every unit of the three races except the workers, about 50 (section 4).
  - Then one rule-fix round for R3's and R4's rule problems (his answer 3A), then steps 4 to 6.
  - R2 (Tiberian Dawn, Tiberian Sun, Tiberium Wars, Renegade) is paused with its prep kept in [research/r2/](../research/r2/README.md). Fourteen other games are shelved until after the app.
- **Merged to `main` so far:**
  - the proposal;
  - step 1;
  - step 2;
  - batch R1 (Red Alert 1, 2 and 3; pull request #4);
  - the rule-fix round after R1, which made word lists 1.1.0 (pull request #5);
  - batch R3, with the plan change of 24 October 2026 (pull request #6);
  - the status lines after R3's merge, the games registry's status and the StarCraft II plan change of 11 November 2026 (pull request #7).

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
| f9f4a18, 51d6c62 | R3 second recheck: its 3 fixes; the report names the commit the copy-check ran on; this file updated |
| the last commit before the merge | Mustafa's approval and answers of 11 November 2026 recorded (this file and the review record) |

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

1. **Nothing for R3.** Pull request #6 is approved and merged (runbook section 9).
2. **The first generator, the plan's step 3b** (Mustafa's plan change of 12 November 2026; the plan's sections 2.1 and 2.2 have the text). It is built on the 55 units and 69 proposed patterns of R1 and R3, before R4. The order of the work: the rule sheet; a check for patterns that are one mechanic under two names (such a pair is marked so that no card gets both; nothing is merged or renamed); the rules as data under `data/generator/`; the module in `src/core/` with its tests; a command that rolls cards, and a page of sample cards (`docs/cards.md`). His conditions of 12 November 2026:
   1. **The rule sheet comes before any code.** It states every rule the generator applies and every number it uses, for his approval.
   2. **A new schema file or a word-list change:** show him the wording too, and wait for his approval.
   3. **A first page of sample cards** as soon as the module rolls valid cards, before the review passes.
   4. **The stop rule:** report the tokens after the rule sheet and after the first build job, and stop to ask him above one and a half times the estimate. The estimate given to him on 11 November 2026, in million tokens: the rule sheet with the points 1.5 to 2.5; the check for double patterns 1.5 to 2.5; the module 5.5 to 8, in four build jobs; a separate card checker and the big roll tests 1.5 to 2.5; text templates and name words 1 to 1.5; review in two passes and fixes 2 to 3; the roll command and the sample page 0.3 to 0.5; the session's own work 3 to 5; about 16 to 25 in all. About 4 to 7 of that comes back after R4 and the rule-fix round (rules and points for the new patterns, tests on the bigger data, tuning, a re-check of R4's prep).
3. **R4** (StarCraft II: Legacy of the Void, Halo Wars, Halo Wars 2, Planetary Annihilation: TITANS, MechWarrior/BattleTech), parked after its prep, and **only when Mustafa says so**. The prep ran on 11 November 2026. Its record is in [research/r4/prep/](../research/r4/prep/README.md), which also says how to go on. In short:
   - **The tool work of the prep is merged** (pull request #8): the copy-check reads rendered wiki pages (plant test on the StarCraft Wiki: 5 of 5, as he required), the plant test and a page reader are scripts in the repository, and every agent brief carries his line on evidence and asks for tool problems apart from the hesitations.
   - **The unit list is ready:** 85 units. StarCraft II 49, with the Hellion and the Hellbat as one unit by the modes rule, and 9 each for the other four games.
   - **Not put in:** the editors' notes and their 30 registry edits are saved in the record. `research/registry-notes/games-r4.md` and `data/games.json` stay untouched until R4 resumes (his word of 12 November 2026).
   - **Waiting for him:** eight questions from the prep, and how Liquipedia is read. Its terms do not allow automated reading of its pages, and the game's own unit descriptions can be read only there. The tools ask it for nothing until he has decided.
   - **The site test** passed on every site the batch would cite; the record has the results. Run it again when R4 goes on, and check the games' versions again.
   - **The fill rule for StarCraft II** (Mustafa, 11 November 2026): code StarCraft II one race at a time. After the first race, report to him the tokens used per unit against the estimate. The estimate is 0.44 million tokens per unit for the fill, from R3's fill (about 11 million for 25 units). Measure it as the fill workflows' own token totals for that race, divided by its units. Above one and a half times the estimate, 0.66 million per unit, stop and ask him. Otherwise go on. For a first race of 16 units that is about 7 million expected, and a stop above about 10.6 million.

**Known and left alone:** `npm run copy-check -- --offline --also data/units` finds coincidental six-word runs in R1's units (13 on 11 November 2026; the count depends on the cache), against pages that other records cite or name, most of them cited by R1's own pattern files, such as "while it is in the air" (Halopedia's Plasma grenade page, cited by throw-explosive). None is a page those units cite, and none is in R3's units.

## 4. Mustafa's decisions of 11 November 2026, and what still waits

**Decided on 11 November 2026:**

1. **Pull request #6:** he approved the plan change of 24 October 2026, the wording change in `schemas/game.schema.json` (no rule changes) and the merge. The merge commit message records it.
2. **StarCraft II:** every Legacy of the Void multiplayer unit except the three workers, about 50; multiplayer only. He approved the new plan lines (the StarCraft II sentence and the size target, now about 140 units before the generator) and the registry line. In the fill, StarCraft II is coded one race at a time, with a report after the first race (section 3, "What is left").
3. **The copy-check and rendered pages:** option A, as the first step of R4's prep, with tests. It passes only when the StarCraft wiki plant test flags 5 of 5. The plant test goes into the repository as a script that can be run again.
4. **The line for the agent briefs:** approved, with his wording (section 3, "What is left").
5. **The night shift:** leave it off.
6. **R4:** not until he says so.
7. **The games registry's `status`:** the six games of R1 and R3 say `done`, and the schema describes the field. He approved that wording change in `schemas/`.
8. **Liquipedia:** before any fill, a report on how it will be read within its terms (section 3, "What is left").
9. **Models for the agents:** the session itself may run on the most capable model. Every work agent runs on the family below it, at the highest effort. Set the model on every agent call, so that no agent takes the session's model. Model names are not written in files: if in doubt, ask him.

**Decided late on 11 November and on 12 November 2026:**

1. **Pull request #7** (two status lines, the games registry's `status`, the StarCraft II plan lines): merged late on 11 November, on his answer "Merge #7, then push".
2. **R4 stopped after its prep** ("Do not start R4", 11 November). He asked for a plan change to be proposed: a first generator before R4.
3. **Pull request #8** (the tool work of R4's prep): merged on 12 November, on his word.
4. **The first generator, the plan's step 3b:** approved on 12 November with the plan lines as shown to him, and with four conditions (section 3, "What is left", item 2).
5. **R4's prep record** is kept under `research/r4/prep/`. The games registry and the notes file stay untouched until R4 resumes.

**Decided on 13 November 2026:**

1. **Pull request #9** (the plan lines for the first generator, and R4's parked prep record): merged on his word.
2. **The rule sheet** ([docs/generator-rules.md](generator-rules.md)), which he saw after a second agent had checked it twice:
   - P1, P3 and P4 approved "with the wording in section 13 of the rule sheet": a new schema with three data files under `data/generator/`; a new, separate checker for rolled cards; one line of wording in the card schema.
   - P2 approved with its sentence: "A key-bound mobility trait and the ability that implies it are one button and count as one key."
   - Each approval is recorded in its commit message, as he asked.
   - All eleven questions answered A: K1, K2, HC, SP, FL, RF, MU, PT, AV, T3S, MD.
3. **K2 A needs a fifth approval.** It adds a new property to the card schema (`primary_fire`) and changes the example card's key count. He sees its exact wording first; until he approves it, a signature fired with primary fire is counted as a key, as before.
4. **HC A is an exception to his decision 5B,** and he asked for that to be said, with the date, where the rule is written. It is in the rule sheet's section 6 and in the hard-control part of `data/generator/rules.json`.
5. **His reminder:** a first page of sample cards as soon as the module rolls valid cards, before the review passes.

**Still open:**

1. The five questions from R3's prep (pull request #6, items 3 to 7). He gave no other answer, so the units stay coded by the recommended answers:
   - the Generals tier map (A, keep it);
   - Generals lasers (A, follow the game's damage types);
   - Purpose lines for generals' versions (A);
   - Tempest Rising's "air control" and "zone control" (A now: they name no role; then C: write that into the word list at the rule-fix round);
   - Iron Harvest's "mech hunter" (B, add to anti-armour at the rule-fix round).
2. Taken during the batch, each reversible if he asks: night decisions N1 to N4 (above), the consistency check's fixes, three choices about the new patterns, the Vimana's second roles and 18 settled rule problems. The report's "Decisions" lists them.
3. Left for him at the pattern review (plan step 4): whether to fold `stack-to-overload` into `freeze-and-shatter`.
4. For the rule-fix round after R4: the 83 rule problems in `research/r3/rule-problems.md`, among them the walker body-plan tie-break and the confidence rule (`research/r3/opening/splits.json`).
5. For R4, when it goes on: the eight questions of its prep and the Liquipedia decision (`research/r4/prep/README.md`, sections 3 and 6).
6. For the first generator: his word on the wording of the new card property that answer K2 A needs.

## 5. How the work is done

The procedure is [docs/research-runbook.md](research-runbook.md): its sections 1 to 10, the state file and night log, decisions, Git and safety. [CLAUDE.md](../CLAUDE.md) lists the rules that matter most. The ones learned the hard way:

- **Spend limits stop workflows part way.** Each agent keeps progress notes in its workspace (`.progress/`), so a resumed run goes on from them. `resumeFromRunId` works only within the session that launched the run. A new session re-runs the missing agents with the same script and arguments.
- **At most two workflows at once.** Mustafa wants efficient use of tokens. A fill job of two units costs about 0.5 to 1 million tokens; the R3 fill as a whole cost about 11 million. R3 in all cost about 60 million new tokens (new input, cache writes and output): about 40 million measured on 10 and 11 November, the fill's 11 million, and a guess of about 9 million for the prep and the opening check, which were not recorded. The estimate given to Mustafa for R4 with about 86 units is 100 to 135 million.
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
| Night-shift routine | the old account (disabled on 29 October) | Leave it off: Mustafa's decision of 11 November 2026 ([appendix](#appendix-the-night-shift-routine)). Delete the old one |
| Branch name | `claude/quirky-cray-tih1w4`, named in the runbook (lines 39, 234, 248, 270) and the routine | Keep using it if the new environment can push to it; otherwise update those lines |

## 7. First steps in the new session

1. Make sure the Claude GitHub app can reach `Mergincanli/MoesTools-Brainstormer`, with push access.
2. Run `npm install` (Node.js 22.18 or newer), then `npm run check:merge`. It should pass every test (510 on 13 November 2026).
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

Running it costs usage around the clock. Mustafa paused it on 29 October to free usage for other work. On 11 November 2026 he decided to leave it off.
