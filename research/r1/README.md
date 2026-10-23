# Batch R1: Red Alert 1, 2 and 3 (step 3 of the plan)

R1 is the first of the six research batches of step 3 of the approved plan ([docs/proposal.md](../../docs/proposal.md), section 2.2). It covers Red Alert 1 (with The Aftermath), Red Alert 2 with Yuri's Revenge and Red Alert 3 with Uprising. It ran by [docs/research-runbook.md](../../docs/research-runbook.md), partly at night.

## TL;DR

- **25 new units:** 10 for Red Alert 1, 9 for Red Alert 2 and 6 for Red Alert 3, which already had the three samples. Between them the three games now cover all seven classes.
- **33 new pattern files,** 7 of them for mechanics no registry id covered. The pattern registry now has 63 ids.
- **The word lists stay at 1.0.0.** The opening check (your decision 6C) found no field below 80% agreement.
- **The checker passed every game.** It re-checked 1,828 fields of 9 sampled units and all 33 patterns. The confirmed error rate is 2.5% for RA1, 1.7% for RA2 and 0.8% for RA3, against the 15% line, and 3.6% for the patterns. All 58 confirmed fields are fixed.
- **62 rule problems change the word lists, the field rules or the validator's checks.** By your decision the 37 that recur (raised by more than one report or touching more than one unit) go to a rule-fix round before R2, joined by two of the batch's own that turned out to need the word lists and by a validator check the final review proposed; the 24 one-off cases wait until they come up again. Of the 20 the batch could settle itself, 17 are settled and one waits for a source; 8 more were settled earlier. The units are coded by the current rules meanwhile (see [Rule problems](#rule-problems)).
- **Decisions:** seven were taken during the batch with the recommended option. One more, decision 8 (the 17 batch-level rule-problem settlements), was taken at night on 23 October, after your decisions of 22 October, and is listed for you under Decisions needed in the pull request; two of its items depart from the proposed fix. All can be reversed. On 22 October you took the recommendations on the rule problems, decision 7 and the prep questions, and chose option B for the checker's patterns. See [Decisions](#decisions).

## How it ran

1. **Prep** (b2c55d0). For each game, a researcher wrote the game-level notes: where the official role text lives, the game-wide mechanics, and traps for the coders. A skeptic checked every claim against the pages, and an editor applied the confirmed corrections ([research/registry-notes/games-r1.md](../registry-notes/games-r1.md)). The same commit fixed the three games' registry entries in `data/games.json`. A judge then kept 24 units and cut 14 candidates, with a reason for every cut ([prep/trim.json](prep/trim.json)).
2. **Opening check** (ef62f3a, reconciled entries in 3978f5f). Two coders coded the RA1 Mammoth Tank and the RA2 Siege Chopper without seeing each other's work. All 56 measured fields reached 80% ([opening/agreement.md](opening/agreement.md)). A reconciler merged each pair into one entry, deciding each split by the rules and the pages.
3. **Fill** (4717b3c, a81dc45, 82a0d1e). Eleven research agents coded the other 22 units, two each, each in its own copy of the repository. Each agent's unit file and report are in `fill/<job>/`. [fill/hesitations.md](fill/hesitations.md) lists every hesitation, gap and unclear rule they reported (72f1b6c).
4. **Merge pass.** The units went into `data/units/` (194f4d7). A resolver and two skeptics settled how fast units move in RA1 and RA2. In RA1, the pace comes from the game's released source code, with each unit's speed read from a reference copy of its rules file. In RA2, the listed speed of walking, driving, sailing and most flying units is compared with the reference soldier's, and hover units, jumpjet fliers and teleporting units are banded by judgement. The registry and notes changed in 3df217b and the units' speed bands in c07bfbd. A consistency check across the batch raised 32 possible problems, and 26 were confirmed and fixed (63e8d8b). In the same pass the RA1 Minelayer became two entries, one per side.
5. **Patterns** (657bc26). For each mechanic the coders reported with no pattern id, and for each registered id the units use that had no file yet, a writer wrote a proposed pattern file. A skeptic checked each one against its pages, the schema and the units, and the writer applied the 86 confirmed corrections. The units now link the patterns.
6. **Checker.** The sample seed was recorded before the draw (f8743f3). A checker who wrote none of the records re-opened the sources of 9 sampled units, three per game, and of all 33 patterns, and checked 1,828 fields. A skeptic re-checked each of the 59 fields marked wrong or unsupported and confirmed 58. All are fixed (b46b01c, 0c3d4e2, cbe6de8, dcc4080), and the record is in [checker/](checker/) (e54f737).
7. **Final review:** one reviewer each for the data, consistency, patterns, the record and the tooling, each followed by a skeptic. They raised 53 findings, and the skeptics confirmed 50; all 50 are fixed or answered ([review/findings.json](review/findings.json)). A check that the fixes landed and broke nothing found 13 more, and a review of the sampled units' fields the checker did not check found 3 more; the skeptics confirmed all 16, and all are fixed, with a wrong rider id that the second review noticed on the Multigunner IFV sample. Among the fixes: the Siege Chopper's cannon does armour-piercing damage and its second roles are anti-air and raider, since a direct-fire gun with no area hit is not siege; four more RA2 units drop to medium confidence where their sources disagree on a coded term (Boris, the Chrono Legionnaire, the Mastermind and the Slave Miner); the checked units and patterns record their review; and the workflow scripts, `mkws.sh` and their tests are tightened.

The runbook and the workflow scripts ([research/workflows/](../workflows/)) were written for this batch (0cd0de4 and later). Since 040b347 every agent keeps progress notes, so an agent cut off by a usage limit goes on from where it stopped.

## The units

**Red Alert 1** (10 units, in `data/units/ra1.json`)

| Unit | Side | Class | Main role | Tier | Price |
|---|---|---|---|---|---|
| Spy (`ra1.allied.spy`) | Allies | infantry | infiltrator | t2 | low |
| Attack Dog (`ra1.soviet.attack-dog`) | Soviets | infantry | anti-infantry | t1 | very-low |
| Field Mechanic (`ra1.allied.field-mechanic`) | Allies | infantry | support | t2 | medium |
| M.A.D. Tank (`ra1.soviet.mad-tank`) | Soviets | vehicle | assault | t3 | very-high |
| Mobile Gap Generator (`ra1.allied.mobile-gap-generator`) | Allies | vehicle | raider | t3 | low |
| Minelayer (`ra1.allied.minelayer`) | Allies | vehicle | area-denial | t2 | medium |
| Minelayer (`ra1.soviet.minelayer`) | Soviets | vehicle | area-denial | t2 | medium |
| Mammoth Tank (`ra1.soviet.mammoth-tank`) | Soviets | vehicle | anti-infantry | t3 | high |
| Yak (`ra1.soviet.yak`) | Soviets | aircraft | anti-infantry | t2 | medium |
| Submarine (`ra1.soviet.submarine`) | Soviets | naval | assault | t1 | medium |

**Red Alert 2 with Yuri's Revenge** (9 units, in `data/units/ra2.json`)

| Unit | Side | Class | Main role | Tier | Price |
|---|---|---|---|---|---|
| Chrono Legionnaire (`ra2.allied.chrono-legionnaire`) | Allies | infantry | raider | t3 | very-high |
| Robot Tank (`ra2.allied.robot-tank`) | Allies | hover | anti-armour | t2 | low |
| Desolator (`ra2.iraq.desolator`) | Soviets (Iraq) | infantry | anti-infantry | t2 | low |
| Boris (`ra2.soviet.boris`) | Soviets | infantry | anti-infantry | t3 | very-high |
| Siege Chopper (`ra2.soviet.siege-chopper`) | Soviets | aircraft | anti-infantry | t3 | high |
| Mastermind (`ra2.yuri.mastermind`) | Yuri | vehicle | anti-infantry | t3 | very-high |
| Magnetron (`ra2.yuri.magnetron`) | Yuri | vehicle | assault | t2 | medium |
| Chaos Drone (`ra2.yuri.chaos-drone`) | Yuri | drone | disabler | t1 | medium |
| Slave Miner (`ra2.yuri.slave-miner`) | Yuri | vehicle | assault | t1 | very-high |

**Red Alert 3 with Uprising** (6 units, in `data/units/ra3.json`)

| Unit | Side | Class | Main role | Tier | Price |
|---|---|---|---|---|---|
| Mecha Tengu (`ra3.empire.mecha-tengu`) | Empire of the Rising Sun | hover | anti-infantry | t1 | low |
| Sudden Transport (`ra3.empire.sudden-transport`) | Empire of the Rising Sun | hover | transport | t1 | low |
| Sickle (`ra3.soviet.sickle`) | Soviets | walker | anti-infantry | t1 | medium |
| Kirov Airship (`ra3.soviet.kirov-airship`) | Soviets | aircraft | siege | t3 | very-high |
| Tanya (`ra3.allied.tanya`) | Allies | infantry | anti-infantry | t3 | very-high |
| Cryocopter (`ra3.allied.cryocopter`) | Allies | aircraft | disabler | t2 | high |

## Coverage gained

Units of the batch by class (the three RA3 samples in brackets):

| Class | RA1 | RA2 | RA3 |
|---|---|---|---|
| infantry | 3 | 3 | 1 |
| vehicle | 5 | 3 | 0 (2) |
| walker | 0 | 0 | 1 |
| hover | 0 | 1 | 2 |
| aircraft | 1 | 1 | 2 |
| drone | 0 | 1 | 0 (1) |
| naval | 1 | 0 | 0 |

- **Main roles:** anti-infantry 10, assault 4, raider 2, area-denial 2, disabler 2, and one each of infiltrator, support, anti-armour, transport and siege. No R1 unit has anti-air, marksman, scout, buffer, engineer or logistics as its main role (the Multigunner IFV sample is anti-air). Ten anti-infantry units is a lot: for the Mammoth Tank it comes from a rule problem (see [Rule problems](#rule-problems)).
- **Patterns:** 33 new files in `data/patterns/`, all `proposed` (not yet approved by Mustafa); their review records the checker's check. By category: control 6, weapon behaviour 5, support 4, area 3, mobility 3, mode change 3, conversion 2, stealth and deception 2, and one each of infiltration, transport and garrison, progression, summon and defence.
- **The 7 new registry ids,** for mechanics no id covered:
  - `overload-past-cap`: holding more captives than is safe costs health in growing steps (Mastermind);
  - `rewind-self`: on a key, snap back to where you were a few seconds ago, with the health you had then (Tanya);
  - `shrink-target`: shrink an enemy vehicle for a while, faster but weaker and easy to crush (Cryocopter);
  - `shroud-area`: an always-on field keeps the ground around you dark for the enemy (Mobile Gap Generator);
  - `execute-target`: one strike kills one kind of target outright, whatever its health (Attack Dog);
  - `deal-percent-damage`: a hit takes a fixed share of the target's health (M.A.D. Tank);
  - `depend-on-relay`: units that work only while a friendly relay stands and has power (Robot Tank).

## Units that break rules, and gaps

**Units that break a combination rule** (the validator's ATYPICAL lines; each is recorded in the unit's `atypical` list with a note):
- **Field Mechanic** (RA1): the repair-tool family lists only beam and projectile delivery, but by the rules copy and the released code his wrench repairs the moment it is used.
- **Both Minelayers** (RA1), one line each: the crush trait is listed for large and huge units, but the code and the registry make these medium vehicles run over infantry.
- **Submarine** (RA1): the detector sensor trait is not listed for the naval class, but the sources say it finds other submerged submarines.
- **Chrono Legionnaire** (RA2): foot movement stops at fast, but it never walks. It moves by teleporting jumps, which cover ground several times faster than a walking soldier, so it is banded very fast.
- **Magnetron** (RA2): the magnetic weapon family cannot hit structures, but its beam also damages buildings.
- **Mecha Tengu** (RA3), two lines: the humanoid mech body is listed for walkers only, and this robot hovers.

The Multigunner IFV sample keeps its three ATYPICAL lines from step 2.

**Gaps where no term fitted well:** 45 fit notes on the 25 units. By field: roles 12, body 5, mobility 4, weapon traits 4, weapon damage 3, strengths 3, modes 3, sensors 2, on death 2, armour 2, and one each for weapon range, family and mount, crew and countered by. Every gap with the coder's reasoning is in [opening/hesitations.md](opening/hesitations.md) (90 hesitations, 8 gaps, 35 unclear rules) and [fill/hesitations.md](fill/hesitations.md) (322 hesitations, 57 gaps, 94 unclear rules).

## Rule problems

The agents reported every place where a written rule was unclear, two rules conflicted, or a rule gave a result that looks wrong for the unit. [rule-problems.md](rule-problems.md) merges them into one list. Each entry gives the rule, what goes wrong, the units, a proposed fix and how many reports raised it.
- **62 for Mustafa:** the fix changes the word lists, the field rules or the validator's checks. Grouped by theme (my grouping): roles 14, matchups 11, weapons 11, body and class 7, abilities 5, other 14. 37 were raised by more than one report or touch more than one unit; 24 are one-off cases; the last, a validator check the final review proposed, joins the rule-fix round.
- **20 for the batch:** only the registry notes, the games registry, the pattern registry or the data would change. 17 are settled: seven units changed to match the new notes, and four more changed only in a note or a fit-note path. Two turned out to need the word lists and join the rule-fix round. One, a frame rate for RA2, needs a source not read yet: ModEnc, the likeliest one, now refuses this session's requests (HTTP 403), though it served the batch's earlier ModEnc pages.
- **8 settled** earlier in the batch, each with its commit.

The ones that change the most visible results:
1. **Roles step 4 lets a secondary weapon decide the main role.** Official praise for the Mammoth Tank's missiles makes it anti-infantry, though its main weapon is an armour-piercing cannon.
2. **Assault as a second role needs a short- or medium-range main weapon** (the second-role rules' step 4). RA1's reference rifle reaches so little that every tank gun bands long, so the Mammoth Tank, which the wiki calls a heavy assault tank, cannot get assault even as a second role.
3. **A landed flier keeps its air target layer.** The Siege Chopper's landed mode is still coded as a low-air target, though ground weapons hit it there.
4. **The combination check reads the base class, not the mode,** so a gun that fires only after a flier lands is checked as an aircraft's weapon (raised on the Siege Chopper, whose howitzer is now coded as a cannon).
5. **No link kinds for price, availability or immunity** (10 units): reasons such as cheap, one per player or immune to mind control hang on stand-ins.
6. **What counts as a weapon label in can_target step 3** (7 units), and whether a ground line includes structures.

Meanwhile the units are coded by the current rules, and the coders recorded their doubts in uncertain entries and fit notes.

## Checker

- **Sample:** seed `r1-2026-10-22`, recorded before the draw (f8743f3), drawn from a copy holding only the batch's units and patterns. One unit in five per game, at least three: the Allied Minelayer, Mobile Gap Generator and Yak (RA1); the Desolator, Boris and Siege Chopper (RA2); Tanya, the Mecha Tengu and the Sudden Transport (RA3). And every proposed pattern, 33.
- **Check:** a checker who wrote none of the records re-opened the sources and checked 1,828 fields: 370 on the units and 1,458 on the patterns. A skeptic re-checked each field marked wrong or unsupported.

| | Fields checked | Flagged | Confirmed wrong | Confirmed unsupported | Rate |
|---|---|---|---|---|---|
| RA1 | 119 | 3 | 3 | 0 | 2.5% |
| RA2 | 121 | 2 | 1 | 1 | 1.7% |
| RA3 | 130 | 1 | 1 | 0 | 0.8% |
| Patterns | 1,458 | 53 | 49 | 3 | 3.6% |

Every game is well under the 15% line. The skeptic refuted one flagged pattern field.
- **What was wrong on the units:** two outdated claims that the RA1 rules file could not be read (Minelayer, Yak); a source listed as backing a speed it contradicts (Mobile Gap Generator); the Desolator's body plan, and a source listed as backing its main role; and Tanya's charges, which by the target rule's last step also list infantry, since no source says whether they can hurt soldiers.
- **What was wrong on the patterns:** mostly confidence levels one step off. 25 examples whose page copies official text were rated medium instead of high, and 5 of their source notes did not say the page copies it; 13 examples that rest on one wiki were rated high instead of medium. The other 9 are single facts: a franchise name, two source titles that did not name the page the link leads to (one a redirect, one a page that does not exist), two seen-in lists that named units their pages do not show, and four texts that went past or against their page.
- **Fixes:** all 58, in b46b01c, 0c3d4e2, cbe6de8 and dcc4080. [checker/result.json](checker/result.json) names the commit of each fix, and [checker/checks.json](checker/checks.json) lists every field checked with its verdict. The checkers' evidence quotes the pages, so it is not kept in the repository.

## Copied wording

- Each research agent ran the copy-check on its own file before finishing, and each record was checked again when it was committed.
- **The game manuals, by hand.** The copy-check cannot read PDFs, so the text of the six manuals (Red Alert 1, The Aftermath, Red Alert 2, Yuri's Revenge, Red Alert 3 and Uprising) was extracted and compared, six words at a time, with every prose string in the batch's units, patterns, registry, notes and record. One phrase from the Yuri's Revenge manual, in the mind-control pattern, was reworded (0c3d4e2). The only shared run left is the name of the Cryocopter's shrink ability (abilities/0).
- Four older phrases in the R4 and R5 game notes (games-r4.md and games-r5.md) shared six words with cached pages; they were reworded (fa06d5a), so the notes folder passes the copy-check.
- **The full online copy-check** (runbook section 8, step 4) ran in three parts on f9a38a7, after the last fixes:
  1. **The data, the whole record and the registry notes** (`npm run copy-check -- --also research/r1 --also research/registry-notes`): no shared run in the 788 pages it could read, 22 of them fetched for this run. Ten could not be read, and no unit or pattern cites any of them:
     - two placeholders in the notes, not pages: `https://cnc.fandom.com/wiki/` and the `REDALERT/` folder of EA's source-code release;
     - three ModEnc pages, which refused the request (HTTP 403): Magnetron and MagnetronLocomotor, which the j08 fill job had found empty, and Speed, named in the review record;
     - the C&C Wiki's Gastroburners page, which does not exist (the singular Gastroburner page does), and CNCNZ's Yuri page, which returns not found (j07);
     - the fourth archived Soviet units page of the official RA2 site (sovietunits4.jsp), on which the Wayback Machine timed out, as it resets this session's connections; the Desolator's notes say it could not be read;
     - two web addresses that the copy-check cut short at an apostrophe when reading them from `checker/checks.json`: the Devil's Tongue (Tiberian Sun) page and Rek'Sai's data templates. The full pages, which `data/patterns/burrow.json` cites, are cached and were checked.
  2. **The 51 pages named in the batch's uncertain entries but not cited,** all cached: no shared run.
  3. **The six cited manuals:** the hand check above, where the shrink ability's name is the only shared run.

## Decisions

**Taken during the batch with the recommended option** (each can be reversed; the units it affects are named):
1. **The RA1 Minelayer is two entries, one per side** (`ra1.allied.minelayer`, `ra1.soviet.minelayer`). The registry's list of units both RA1 sides build leaves it out, the wiki has a page for each, and one shared entry gave matchups that cancel out. The unit list in `prep/trim.json` keeps the old shared id with a `split_into` naming the two.
2. **StrategyWiki counts as a guide for its two RA1 unit pages and as a wiki for RA3,** as in the pilot samples. No unit changes.
3. **RA1 speed comes from the reference copy of the rules file** where the wiki differs. The Mobile Gap Generator becomes fast, with raider as its main role.
4. **The RA1 Attack Dog's charge at its target counts for its speed band,** as nothing limits it: fast.
5. **RA1 ships sail at half speed,** read from the released code and stated as an inference. The Submarine becomes slow.
6. **In-game text counts as official text** for roles, such as a country's loading screen in RA2. It decides the Desolator's main role.
7. **The RA1 reference rules copy counts for every rules value,** not only speed: Rules.ini and aftrmath.ini from OpenRA's raclassic repository, which win over a wiki, with an uncertain entry. It changes eight units (b46b01c): on-death crew for both Minelayers, the Mobile Gap Generator, the Mammoth Tank and the Yak; the Mammoth's cannons hit structures and its missiles are guided; the Field Mechanic is unarmoured and his wrench lands at once; the M.A.D. Tank's pulse reaches about twice as far as the wiki says; and the Submarine's torpedo texts now follow the copy.

**Taken at night on 23 October (reversible; in the pull request's Decisions needed):**

8. **17 batch-level rule problems settled** (a3c4d6d) in the registry notes and the data, each as [rule-problems.md](rule-problems.md) says; 15 took the proposed fix, item 1 a smaller one and item 8 a different one. Seven units changed to match: the Siege Chopper's howitzer is coded as a cannon; both Minelayers get the crush trait, recorded as atypical; Boris's one-hero limit is in tier.basis; the Spy's confidence rises to high and the Field Mechanic's falls to medium; and the Slave Miner gets the rank lifts its infobox lists. Four more changed only in a note or a fit-note path: the M.A.D. Tank's and Mobile Gap Generator's fit notes, and the Chrono Legionnaire's and Chaos Drone's sight notes.

**Prep questions, settled with the recommended answers (your decision of 22 October 2026):**
1. The RA1 Ore Truck, Destroyer and Cruiser keep the heavy armour class.
2. For a unit both RA1 sides build, a manual paragraph printed once counts for the shared entry.
3. RA2's own armour types keep their map to our classes, with one named step down for the Flak Track.
4. In RA2, which has no fog of war, the off-screen range rule is read as written.

**Decided by you during the batch:** from R2 the checker re-checks one pattern in three, at least three, instead of every one (22 October 2026; ebcf283).

**Decided by you on 22 October 2026, taking the recommendations:**
1. **How to settle the 61 rule problems** ([rule-problems.md](rule-problems.md)). Chosen: A. The options were:
   - A. A rule-fix round before R2's fill, like the pilot's fix pass. Analysts turn the proposed fixes into exact rule changes, a skeptic checks each against the R1 codings, you approve the set as word lists 1.1.0, and the R1 units they touch are recoded. It covers the 37 problems raised by more than one report or touching more than one unit; the 24 one-off cases wait until they come up again.
   - B. The same round after R2, so that R2's coders add evidence first. More units to recode afterwards.
   - C. Settle each problem one by one in this pull request.

   A was recommended because the recurring problems will come up in every batch, and fixing them before R2 keeps the recode small. R1 merges as coded, since its units follow the current rules; the finished set of rule changes comes back to you for approval as word lists 1.1.0.

   Batch items 5 and 9 ([rule-problems.md](rule-problems.md), Open for the batch), which turned out after this decision to need the word lists, recur too (3 and 2 reports) and join the round. So does item 62 of the list for you, a validator check the final review proposed (an error for a unit link to an unknown game or faction).
2. **Decision 7 above stays** (the RA1 rules copy counts for every rules value): it replaced guesses with the game's own data on eight units.

## Files

| Path | What it holds |
|---|---|
| [prep/trim.json](prep/trim.json) | The unit list: kept units with their briefs, cut candidates with reasons, the opening-check choice, coverage and the planned new patterns |
| [opening/](opening/) | The opening check: both codings, the agreement report, the hesitations, and the reconciled entries with the reconcilers' reports (`final/`) |
| `fill/<job>/` | Each fill job's unit file, as recorded before the merge pass, and its report |
| [fill/hesitations.md](fill/hesitations.md) | Every hesitation, gap and unclear rule of the fill |
| [rule-problems.md](rule-problems.md) | Every rule problem the agents raised: 62 for Mustafa, 20 for the batch with what became of each (17 settled, 3 left open), and 8 settled earlier |
| [checker/](checker/) | The checker: the seed, the counts and rates, the confirmed fields and their fixes (`result.json`), and every field checked (`checks.json`) |
| [review/](review/) | The findings of the final review and of its two follow-up checks, each with its verdict and status |
| [../registry-notes/games-r1.md](../registry-notes/games-r1.md) | The game-level notes for RA1, RA2 and RA3 |
| `data/units/ra1.json`, `ra2.json`, `ra3.json` | The units |
| `data/patterns/`, `data/pattern-registry.json` | The pattern files and the registry |
| `data/games.json` | The registry entries of the three games |
