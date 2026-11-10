## TL;DR

- **Your plan change of 24 October 2026 is written into the plan.**
  - The research run is now R3 (Generals with Zero Hour, Tempest Rising, Iron Harvest), then a new R4 (StarCraft II: Legacy of the Void, Halo Wars, Halo Wars 2, Planetary Annihilation: TITANS, MechWarrior/BattleTech), then steps 4 to 6.
  - R2 is paused, and its prep of three games is kept in `research/r2/`. The other 14 games are shelved until after the app.
- **R3 goes on in this pull request**, because the batch and the plan share one branch:
  - **its prep** (9340fde): the three games' notes, 10 registry fixes, and 27 units kept, 9 per game;
  - **its opening check** (48629b8): two coders coded Jarmen Kell and the Kaiser separately and agreed on 54 of 56 fields. The two splits are gaps in the rules, and fixes for them are drafted for the rule-fix round after R4. No word list changed;
  - **its fill** (a9cd648, 2ccc323, 2870003, bcdfa81): the other 25 units, each recorded with its agent's report;
  - **the merge pass's first step** (6c817f1): all 27 units are in `data/units/`.
- **Paused on 29 October, at your request.** The merge pass's consistency check and the pattern files were part done. On 10 November the work moved to a new session. [docs/handoff.md](https://github.com/Mergincanli/MoesTools-Brainstormer/blob/claude/quirky-cray-tih1w4/docs/handoff.md) says where it stands and what comes next. The unfinished work is saved, unchecked, in `research/handoff/` (71d7e67).
- **Still to do for R3:** finish the merge pass and the pattern files, then the checker, the final review, the report and the claims check.
- **Checks:** all 297 tests pass. The copy-check finds no shared runs in the records.

## Decisions needed

1. **Approve the plan as written?** This pull request now also holds R3's units, which the checker has not yet re-checked.
   - A (recommended): approve the plan now, and merge once R3 has passed its checks.
   - B: merge now, with R3's units going to `main` before the checker.
   - C: tell me what to change.
2. **StarCraft II count.** The plan keeps about 15 units, 5 per race, drawn from multiplayer, co-op and the campaign (all Legacy of the Void). Say if you want a different number.

R3's prep raised five questions. Coding goes ahead on the recommended answers, which are how the notes are written now. A different answer means recoding the units it touches.

3. **Generals tier map.**
   - A (recommended): keep it. A General's Promotion alone is t2, and each side's one tech building is t3. The tech building also opens the superweapon, and the wiki's labels agree.
   - B: make the tech building t2. That leaves only three units at t3.
4. **Generals lasers.** The game's files give the Laser Tank armour-piercing damage and the Avenger small-arms damage.
   - A (recommended): follow those types.
   - B: count every Generals laser as energy, as in Tempest Rising.
5. **The base-game manual's "Purpose" lines and the Zero Hour generals.**
   - A (recommended): a general's version of a unit keeps the main unit's line. Otherwise almost every unit loses its main official role text.
   - B: the lines count only for units that no general fields.
6. **Tempest Rising's "air control" and "zone control"** (the Peacekeeper and the Physicist).
   - A (recommended for R3): they name no role.
   - B: they name disabler.
   - C: A now, and write it into the word lists at the rule-fix round after R4.
7. **Iron Harvest's "mech hunter", "mech destroyer" and "anti-mech".**
   - A: keep the rule, so they name no role.
   - B (recommended): add them to anti-armour's words at the rule-fix round after R4.
   - C: let a game's notes name its own word for armoured units.

**Taken at night on 27 October (reversible).** Each changes only R3's notes (`research/registry-notes/games-r3.md`), so that the fill codes the same way as the two opening units:

8. **Iron Harvest's "(Ability)" weapon slots.** A weapon that a mode adds, and that keeps firing for as long as the mode lasts, is coded as a weapon, not an ability. The note said ability, but the field rules say weapon, and the rules come first. Recoded: the Kaiser's rockets.
9. **Generals generals' versions.** Their extra or missing buttons go in tier.basis, because abilities have no notes field. Recoded: none.
10. **Walkers on many legs with a fixed main gun:** coded spider frame until the rule-fix round. This is the reading of option A in item 12; if you pick A, the round will not need to recode them. Recoded: the Kaiser, from fixed-gun hull. The fill's Mocny and Stark follow the same note.
11. **Confidence until the rule-fix round:** as now. Generals units cite CNCNZ as their second site, and a contradiction it raises lowers the level. Every contradiction is logged, so the round can judge the levels again without new research. Recoded: none; Jarmen Kell stays medium.

**For the rule-fix round after R4** (your answer 3A, so no answer is needed now). An analyst drafted each fix and a skeptic tested it against both codings. The full text is in `research/r3/opening/splits.json`.

12. **Body plans of walkers.** No tie-break covers a walker on many legs whose main gun is fixed, and the fixed-gun hull (casemate) is only for vehicles and hovercraft. One coder chose spider frame, the other the fixed-gun hull.
    - A (recommended): such a walker is spider frame, unless it is a launcher rack, a troop carrier or a creature. Its gun mount already records the fixed gun.
    - B: let the fixed-gun hull take walkers too.
    - Recodes: none under A beyond item 10. Under B, the Kaiser, the Mocny and the Stark go back to the fixed-gun hull, which is a plain value change.
13. **Confidence.** Today the level can depend on whether a coder cites a page: Jarmen Kell came out medium with CNCNZ cited and high without it.
    - Recommended: the tie-break reads cited and named pages alike, and a contradiction raised only by a guide never lowers the level.
    - Recodes: Jarmen Kell to high, and any fill unit whose only contradiction comes from a guide.

## For Mustafa

- **The plan (8366649):**
  - `docs/proposal.md`: the step and batch tables with statuses, the change and your answers, and the size target (about 100 units before the generator);
  - `docs/research-runbook.md`: batch order R3 then R4, and the night shift stops after the rule-fix round that follows R4;
  - `README.md` and `research/registry-notes/README.md`: the status, and where R4's notes come from;
  - `data/games.json`: StarCraft II, Planetary Annihilation, Halo Wars 2 and MechWarrior/BattleTech move to batch r4, the shelved games to `later`, and StarCraft II's researched version reads Legacy of the Void only;
  - `schemas/game.schema.json`: the batch description, changed in wording only, with no rule change.
- **The copy-check fix (489ba33):** web addresses inside JSON notes no longer count as prose. A test covers it.
- **R2's paused record (5b2dd46), `research/r2/`:** the prep of Tiberian Dawn, Tiberian Sun and Tiberium Wars, with 13, 13 and 14 candidate units, and a README on how to go on with R2 later. All 43 runs it shared with pages and manuals were reworded.
- **R3's prep (9340fde):**
  - `research/registry-notes/games-r3.md`: official role lines, game-wide mechanics and research notes for all three games;
  - `data/games.json`: 10 fixes, covering Generals' sight reference, Tempest Rising's version and a Veti tier gate, and Iron Harvest's range reference and sources;
  - `research/r3/prep/trim.json` and `editors.json`: the units kept and cut, with reasons, and each editor's changes and questions;
  - `research/registry-notes/games-r1.md`: one phrase reworded, because it matched a Tempest Rising page that R3 now cites.
- **R3's opening check (48629b8), `research/r3/opening/`:**
  - `briefs.json`: the coders' briefs, name, faction and game only;
  - `coder-a/` and `coder-b/`: the two codings;
  - `agreement.md` and `hesitations.md`: the agreement report, and the 88 hesitations, 11 gaps and 34 unclear rules from the four coder reports;
  - `final/`: the reconciled entries with the reconciler's reports, and `recode-iron-harvest.md` on the Kaiser's two recodes;
  - `splits.json`: the drafted fixes for items 12 and 13.
  - The reconciler raised six more rule problems, such as when a weapon counts as hitting buildings. They wait for the round after R4, with the fill's.
- **R3's fill and merge pass (a9cd648 to 6c817f1):** `research/r3/fill/` has one folder per job with its unit file and report, and `hesitations.md`. `data/units/generals.json`, `tempest-rising.json` and `iron-harvest.json` hold the 27 units.
- **The handoff (71d7e67):**
  - `docs/handoff.md`;
  - `docs/brief.md` (your brief);
  - `CLAUDE.md` (the working rules);
  - `research/handoff/` (the unchecked work in progress, to delete once used).
- **Kept units:**
  - **Generals:** Jarmen Kell, Battle Bus, Technical, Overlord, Red Guard, Hacker, Aurora Bomber, Sentry Drone, Combat Chinook.
  - **Tempest Rising:** Drone Operator, Sentinel, Shieldmaiden, Line Officer, Voltaic Tank, Tempest Sphere, Enlightened, Thunderhead, Vimana.
  - **Iron Harvest:** Anna Kos and Wojtek, Mocny, Grimbart, Kaiser, Olga Morozova, Nakovalnya, William Mason, Stark, Engineer squad.
- **Halo Wars (2009)** has no registry entry yet. R4's prep adds it first.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01LaveqpCt5Xqzu7Fz1xuEi3
