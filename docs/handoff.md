# Handoff: continuing Unit Forge in a new session

Written on 10 November 2026, when the project moved from the session that ran it from 17 October to a new account. Read this first, then [CLAUDE.md](../CLAUDE.md) and the [research runbook](research-runbook.md).

## TL;DR

- **The project:** Unit Forge, a tool for Mustafa that turns a researched database of real RTS and shooter units into original unit concepts for his game, Shamble Frontlines. The brief is [docs/brief.md](brief.md) and the plan is [docs/proposal.md](proposal.md).
- **Where it stands:** plan step 3, the research run, batch R3 (Command & Conquer: Generals with Zero Hour, Tempest Rising, Iron Harvest).
  - All 27 R3 units are coded, checked and in `data/units/` (commit 6c817f1).
  - Two phases were half done when the work paused on 29 October:
    - the merge pass's consistency check;
    - the pattern files.
  - Their partial results are saved in [research/handoff/r3-wip/](../research/handoff/r3-wip/README.md).
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
| (this commit) | Handoff: this file, the brief, CLAUDE.md, and the saved work in `research/handoff/` |

CI was green on 6c817f1 (four check jobs). `npm run check:merge` passes, with 297 of 297 tests.

## 3. Batch R3 in detail

**Units (9 per game):**
- **Generals:** Jarmen Kell, Battle Bus, Technical, Overlord, Red Guard, Hacker, Aurora Bomber, Sentry Drone, Combat Chinook.
- **Tempest Rising:** Drone Operator, Sentinel, Shieldmaiden, Line Officer, Voltaic Tank, Tempest Sphere, Enlightened, Thunderhead, Vimana.
- **Iron Harvest:** Anna Kos and Wojtek, Mocny, Grimbart, Kaiser, Olga Morozova and Changa, Nakovalnya, William Mason, Stark, Engineer squad.

**The record so far** ([research/r3/](../research/r3/)):
- `prep/`: the trim and the editors' changes;
- `opening/`:
  - the opening check (54 of 56 fields agreed);
  - the drafted fixes for its two splits (`splits.json`);
  - the reconciled entries;
- `fill/`: one folder per job (unit file and report) and `hesitations.md`, with 416 hesitations, 90 gaps and 128 unclear rules.

**Night decisions taken on 27 October**, which are notes only and reversible, in `research/registry-notes/games-r3.md`:
- **N1:** an Iron Harvest "(Ability)" slot that a mode adds as a standing weapon is coded as a weapon (the Kaiser's rockets).
- **N2:** the extra or missing buttons of a Generals general's version go in `tier.basis`.
- **N3:** until the rule-fix round, a walker on many legs with a fixed main gun is `spider-frame` (the Kaiser, the Mocny, the Stark).
- **N4:** confidence keeps the current practice, and every contradiction between pages is logged.

**What is left, in runbook order:**

1. **Merge pass, steps 2 and 3 (half done).**
   - A consistency check with four finders, each with a skeptic, ran on 29 October.
     - The `registry` finder (15 findings) and the `links` finder (9 findings) finished. **No skeptic has checked them yet.**
     - The `conventions` and `facts` finders never ran.
   - Saved: `research/handoff/r3-wip/merge-consistency/` (findings and the workflow script).
   - Next:
     1. run a skeptic on the 24 findings;
     2. run the two missing finders and their skeptics;
     3. apply the confirmed fixes per game: `r1-merge-fixes-template.js` is R1's script for this, to adapt;
     4. commit.
   - Findings that change the registry or the notes are decisions about the notes (runbook, "Decisions"). Any that would change the word lists or field rules go to the rule-fix round instead.
2. **Patterns (runbook section 5, 8 of 35 files drafted).**
   - There are 35 pattern files in 9 groups: 17 registered ids the R3 units link with no file yet, and 18 new ids.
   - The arguments are saved in `research/handoff/r3-wip/args/patterns.json`.
   - The writers of groups g1 and g2 finished. Their 8 drafted files, notes and reports are saved under `research/handoff/r3-wip/patterns/`. No skeptic has checked them.
   - Groups g3 to g9 have not started.
   - How to go on is in [research/handoff/r3-wip/README.md](../research/handoff/r3-wip/README.md).
   - Then integrate:
     1. add the pattern files and the registry entries;
     2. add the unit links and remove the fit notes that asked for them;
     3. run `npm run sync-patterns`, `npm run docs` and `npm run check:merge`;
     4. commit.
3. **Checker** (section 6): seed `r3-<date>`, committed before drawing; 1 unit in 5 per game and 1 proposed pattern in 3; a 15% limit per game.
4. **Report and final review** (section 7):
   - `research/r3/README.md`;
   - `research/r3/rule-problems.md`, built the way `research/r1/rule-problems.md` was, from the opening's `splits.json` items, the reconciler's six remaining rule problems and the fill reports;
   - the final review, then `verify-fixes.js`.
5. **Checks and claims check** (section 8): the online copy-check in three parts, the PDF manuals by hand, the local-path grep, then the claims check.
6. **Merge** (section 9): only when every gate passes. Pull request #6 also needs Mustafa's approval of the plan change.

**Known and left alone:** `npm run copy-check -- --offline --also data/units` finds 19 coincidental six-word runs in R1's units, against pages only R3 caches, such as "one of them at a time". None is a page those units cite, and none is in R3's units.

## 4. What waits for Mustafa (pull request #6, "Decisions needed")

1. Approve the plan change and merge the pull request.
2. The StarCraft II count: about 15 units, 5 per race.
3. The five questions from R3's prep. Coding follows the recommended answers:
   - the Generals tier map (A, keep it);
   - Generals lasers (A, follow the game's damage types);
   - Purpose lines for generals' versions (A);
   - Tempest Rising's "air control" and "zone control" (A, they name no role);
   - Iron Harvest's "mech hunter" (B, add to anti-armour at the rule-fix round).
4. Night decisions N1 to N4 (above), each reversible.
5. For the rule-fix round after R4, no answer needed now: the walker body-plan tie-break and the confidence rule (`research/r3/opening/splits.json`).

## 5. How the work is done

The procedure is [docs/research-runbook.md](research-runbook.md): its sections 1 to 10, the state file and night log, decisions, Git and safety. [CLAUDE.md](../CLAUDE.md) lists the rules that matter most. The ones learned the hard way:

- **Spend limits stop workflows part way.** Each agent keeps progress notes in its workspace (`.progress/`), so a resumed run goes on from them. `resumeFromRunId` works only within the session that launched the run. A new session re-runs the missing agents with the same script and arguments.
- **At most two workflows at once.** Mustafa wants efficient use of tokens. A fill job of two units costs about 0.5 to 1 million tokens; the R3 fill as a whole cost about 11 million.
- **The copy-check finds six-word runs in agent text every time.** This happens most in reports, hesitations and uncertain notes, and in older text once a new page is cited. Run it on the whole record before every commit, and reword only the text, never a coded value.
- **Tests that read the live data can break when units are added.** Fix the test without weakening it, as in 6c817f1.
- **The page cache** (`.cache/sources/`, 271 MB, not committed) does not move to a new machine. Agents and the copy-check fetch pages again as needed, through the wiki APIs, two seconds apart.

## 6. What did not move, and what to do about it

| Item | Where it was | What to do |
|---|---|---|
| Scratchpad (state file, night log, workspaces, agent results) | the old session's machine | What matters is in `research/handoff/r3-wip/`. Copy `session/state.json` and `session/night-log.md` into the new scratchpad's `r3/` folder if you keep the night shift |
| Workflow runs | the old session | They cannot be resumed from a new session: re-run (section 3) |
| Page cache | `.cache/sources/` on the old machine | Rebuilt as pages are fetched again |
| Night-shift routine | the old account (disabled on 29 October) | Recreate it on the new account if wanted ([appendix](#appendix-the-night-shift-routine)); delete the old one |
| Branch name | `claude/quirky-cray-tih1w4`, named in the runbook (lines 39, 234, 248, 270) and the routine | Keep using it if the new environment can push to it; otherwise update those lines |

## 7. First steps in the new session

1. Make sure the Claude GitHub app can reach `Mergincanli/MoesTools-Brainstormer`, with push access.
2. Run `npm install` (Node.js 22 or newer), then `npm run check:merge`. It should pass 297 of 297 tests.
3. Check out `claude/quirky-cray-tih1w4` at this handoff commit or later.
4. Read this file, CLAUDE.md, the runbook and `research/handoff/r3-wip/README.md`.
5. Go on with section 3, "What is left": first the merge pass's consistency check, then the patterns. Both can run at the same time.

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
