# Batch R3: C&C Generals, Tempest Rising and Iron Harvest (step 3 of the plan)

R3 is the second research batch of step 3 to finish ([docs/proposal.md](../../docs/proposal.md), section 2.2; R2 is paused by the plan change of 24 October 2026). It covers Command & Conquer: Generals with Zero Hour, Tempest Rising and Iron Harvest. It ran by [docs/research-runbook.md](../../docs/research-runbook.md): the prep, the opening check and the fill at night from 26 to 29 October 2026, and the merge pass, the patterns, the checker and this report by day on 10 and 11 November, after the work moved to a new session. The units follow word lists 1.1.0.

## TL;DR

- **27 new units,** 9 per game: 10 infantry, 7 vehicles, 4 walkers, 4 aircraft, a hovercraft and a drone.
- **33 new pattern files,** 16 of them for mechanics no registry id covered. The pattern registry now has 79 ids, and every pattern an R3 unit links has a file.
- **The word lists stay at 1.1.0.** The opening check found two fields below 80% agreement, the body plan and the confidence. Both come from rules that give two answers; their fixes wait for the rule-fix round after R4, and two note decisions (N3 and N4) keep the batch consistent meanwhile.
- **The checker passed every game.** It re-checked 705 fields of 9 sampled units and 11 sampled patterns. No field was wrong in Generals or Tempest Rising, 2 of 176 in Iron Harvest (1.1%), and 21 of 303 in the patterns (6.9%), against the 15% line. All 23 confirmed fields are fixed.
- **Rule problems:** 83 change the word lists, the field rules or the validator's checks, and 39 of them recur (more than one report, or more than one unit). By your decision of 24 October 2026 they wait for the one rule-fix round after R4. Of the 23 the batch could settle itself, 18 are settled and 5 wait for you, for a source or for the round; 25 more were settled earlier in the batch. The units are coded by the current rules meanwhile (see [Rule problems](#rule-problems)).
- **Decisions:** every decision of the batch took the recommended option and can be reversed: four note decisions taken at night (N1 to N4), the consistency check's fixes to the notes, four choices about the new patterns and the 18 settled rule problems. The five questions from the prep are coded by their recommended answers and still wait for you in pull request #6. See [Decisions](#decisions).

## How it ran

1. **Prep** (9340fde). For each game, a researcher wrote the game-level notes: where the official role text lives, the game-wide mechanics, and traps for the coders. A skeptic checked every claim against the pages, and an editor applied the confirmed corrections ([research/registry-notes/games-r3.md](../registry-notes/games-r3.md)). The same commit fixed the three games' registry entries in `data/games.json`. A judge then kept 27 units and cut 15 candidates, 5 per game, with a reason for every cut ([prep/trim.json](prep/trim.json)).
2. **Opening check** (48629b8). The rules had changed since R1's check (word lists 1.1.0), so two coders coded Jarmen Kell and the Kaiser without seeing each other's work. 54 of the 56 measured fields reached 80% ([opening/agreement.md](opening/agreement.md)). For the two that did not, an analyst drafted a rule fix and a skeptic tested it ([opening/splits.json](opening/splits.json)); neither draft held as written, so both go to the rule-fix round. A reconciler merged each pair into one entry, and the Kaiser was recoded once after two note decisions ([opening/final/recode-iron-harvest.md](opening/final/recode-iron-harvest.md)).
3. **Fill** (a9cd648, 2ccc323, 2870003, bcdfa81). Thirteen research agents coded the other 25 units, two each and one for the Enlightened, each in its own copy of the repository. Each agent's unit file and report are in `fill/<job>/`. [fill/hesitations.md](fill/hesitations.md) lists every hesitation, gap and unclear rule they reported.
4. **Merge pass.** The units went into `data/units/` (6c817f1). Four finders then looked across the 27 units, one each for errors in the registry and notes, links between units, shared conventions and repeated facts, and a skeptic tried to refute each finding. Of 37 findings the skeptics confirmed 33. The confirmed fixes went into the notes and the registry (527724f) and into the units, where a fixer and a verifier per game applied 28 items (3618824). The record is in [merge/](merge/README.md).
5. **Patterns** (ef2460e). For each mechanic the coders reported with no pattern id, and for each registered id the units use that had no file yet, a writer wrote a proposed pattern file. A skeptic checked each one against its pages, the schema and the units, and the writer applied the confirmed corrections: 170 verdicts, 76 confirmed problems. The integrator then linked the units, and an independent agent checked that step. The record is in [patterns/](patterns/README.md).
6. **Checker.** The sample seed was recorded before the draw (8e1746f). A checker who wrote none of the records re-opened the sources of 9 sampled units, three per game, and of 11 of the 33 patterns, and checked 705 fields. A skeptic re-checked each of the 24 fields marked wrong or unsupported and confirmed 23. All are fixed (9ce1f96), and the record is in [checker/](checker/) (6556887).

The work stopped between 29 October and 10 November 2026: a spend limit cut both running workflows, and the night shift was then paused. On 10 November it moved to a new session, with the state saved in the repository first (71d7e67). Nothing finished was redone: every agent keeps progress notes, and the finished results were read back from the workflows' journals.

## The units

**C&C Generals with Zero Hour** (9 units, in `data/units/generals.json`)

| Unit | Side | Class | Main role | Tier | Price |
|---|---|---|---|---|---|
| Jarmen Kell (`generals.gla.jarmen-kell`) | Global Liberation Army | infantry | marksman | t3 | very-high |
| Battle Bus (`generals.gla.battle-bus`) | Global Liberation Army | vehicle | transport | t3 | medium |
| Technical (`generals.gla.technical`) | Global Liberation Army | vehicle | anti-infantry | t1 | low |
| Overlord (`generals.china.overlord`) | China | vehicle | anti-armour | t3 | very-high |
| Red Guard (`generals.china.red-guard`) | China | infantry | anti-infantry | t1 | very-low |
| Hacker (`generals.china.hacker`) | China | infantry | logistics | t3 | low |
| Aurora Bomber (`generals.usa.aurora-bomber`) | United States of America | aircraft | siege | t3 | very-high |
| Sentry Drone (`generals.usa.sentry-drone`) | United States of America | drone | scout | t1 | medium |
| Combat Chinook (`generals.usa-air-force.combat-chinook`) | Air Force General (Malcolm Granger) | aircraft | transport | t1 | high |

**Tempest Rising** (9 units, in `data/units/tempest-rising.json`)

| Unit | Side | Class | Main role | Tier | Price |
|---|---|---|---|---|---|
| Drone Operator (`tempest-rising.gdf.drone-operator`) | Global Defense Force | infantry | assault | t1 | very-low |
| Sentinel (`tempest-rising.gdf.sentinel`) | Global Defense Force | vehicle | scout | t1 | low |
| Shieldmaiden (`tempest-rising.gdf.shieldmaiden`) | Global Defense Force | hover | anti-air | t2 | high |
| Line Officer (`tempest-rising.dynasty.line-officer`) | Tempest Dynasty | infantry | assault | t2 | high |
| Voltaic Tank (`tempest-rising.dynasty.voltaic-tank`) | Tempest Dynasty | vehicle | anti-armour | t3 | high |
| Tempest Sphere (`tempest-rising.dynasty.tempest-sphere`) | Tempest Dynasty | vehicle | anti-infantry | t3 | very-high |
| Enlightened (`tempest-rising.veti.enlightened`) | Veti | infantry | assault | t1 | very-low |
| Thunderhead (`tempest-rising.veti.thunderhead`) | Veti | aircraft | transport | t2 | very-high |
| Vimana (`tempest-rising.veti.vimana`) | Veti | aircraft | assault | t3 | very-high |

**Iron Harvest** (9 units, in `data/units/iron-harvest.json`)

| Unit | Side | Class | Main role | Tier | Price |
|---|---|---|---|---|---|
| Anna Kos (`iron-harvest.polania.anna-kos`) | Polania Republic | infantry | anti-infantry | t1 | very-low |
| PZM-13 "Mocny" (`iron-harvest.polania.mocny`) | Polania Republic | walker | siege | t2 | low |
| Sd. KS 49 "Grimbart" (`iron-harvest.saxony.grimbart`) | Saxony Empire | walker | assault | t1 | low |
| SKS 300 "Kaiser" (`iron-harvest.saxony.kaiser`) | Saxony Empire | walker | assault | t3 | high |
| Olga Morozova (`iron-harvest.rusviet.olga-morozova`) | Rusviet Tsardom | infantry | assault | t1 | low |
| SHM-68 "Nakovalnya" (`iron-harvest.rusviet.nakovalnya`) | Rusviet Tsardom | vehicle | siege | t1 | low |
| William Mason (`iron-harvest.usonia.william-mason`) | Usonia | infantry | assault | t2 | medium |
| M-22 "Stark" (`iron-harvest.usonia.stark`) | Usonia | walker | assault | t2 | low |
| Engineers (`iron-harvest.shared.engineer`) | All factions | infantry | engineer | t1 | very-low |

Fifteen units are coded with high confidence and twelve with medium.

## Coverage gained

Units of the batch by class:

| Class | Generals | Tempest Rising | Iron Harvest |
|---|---|---|---|
| infantry | 3 | 3 | 4 |
| vehicle | 3 | 3 | 1 |
| walker | 0 | 0 | 4 |
| hover | 0 | 1 | 0 |
| aircraft | 2 | 2 | 0 |
| drone | 1 | 0 | 0 |
| naval | 0 | 0 | 0 |

- **Main roles:** assault 9, anti-infantry 4, transport 3, siege 3, anti-armour 2, scout 2, and one each of marksman, logistics, anti-air and engineer. No R3 unit has support, infiltrator, disabler, raider, area denial or buffer as its main role, though each of those is a second role somewhere in the batch. Nine assault units is a lot: most reach it at the last step of the role rules, where an armed unit that no earlier step claims ends up (see [Rule problems](#rule-problems)).
- **Tiers:** t1 12, t2 6, t3 9.
- **Patterns:** 33 new files in `data/patterns/`, all `proposed` (not yet approved by Mustafa). By category: support 7, defence 4, control 4, summon 4, transport and garrison 3, and stealth and deception, conversion, mobility and weapon behaviour 2 each, and area, infiltration and progression 1 each.
- **The 16 new registry ids,** for mechanics no id covered:
  - `convert-on-kill`: enemies that die while tagged rise as weak minions on your side (Enlightened, Vimana);
  - `block-abilities`: enemies cannot use their abilities for a while, but can still move and shoot (Sentinel);
  - `produce-unit-in-field`: bring a full, lasting unit into play away from any factory (Vimana);
  - `join-ally-crew`: board a teammate's vehicle as extra crew and lift its rank while you ride (Line Officer);
  - `fortify-on-death`: the blow that would destroy the vehicle parks it as a fortified shell that its riders fight on from (Battle Bus);
  - `command-companion`: a lasting AI partner fights beside you and takes short orders (Anna Kos, Olga Morozova);
  - `sacrifice-for-allies`: spend a minion or yourself to give allies a strong timed buff (Enlightened);
  - `refill-on-ally-buff`: your ammunition comes back when a teammate's buff lands on you (Vimana);
  - `dampen-missile-fire`: a field around you slows enemy rocket and missile fire while you stand still (Shieldmaiden);
  - `build-structure`: lay down a building that then serves the team (Engineers);
  - `heal-from-debuff`: a status that harms other units heals you instead (Tempest Sphere);
  - `rage-when-wounded`: your damage rises as your health falls (Stark);
  - `retaliate-on-hit`: each attack on you from close by sets off a strike back (Thunderhead, Vimana);
  - `stack-to-overload`: allied hits stack a charge on a vehicle until it overloads, and finishers then destroy it (Voltaic Tank);
  - `band-together`: units of a group get better while enough of them stand together (Red Guard);
  - `generate-income`: stop anywhere and earn money for the team (Hacker).

## Units that break rules, and gaps

**Units that break a combination rule** (the validator's ATYPICAL lines; each is recorded in the unit's `atypical` list with a note). The 27 units carry 28 such lines on 18 units:
- **Very slow walkers and vehicles** (5 lines): the Mocny, the Kaiser, the Stark, the Nakovalnya and William Mason in his suit move more slowly than their movement type allows.
- **Weapon families** (9 lines): a sniper rifle that can hurt one kind of building (Jarmen Kell, Anna Kos); a cannon with the game's bullet damage (Technical); a tesla weapon and a drone weapon that pierce armour (Voltaic Tank, Drone Operator); a ramming hull coded as a blade (Tempest Sphere, two lines); fists with rifle damage and thrown grenades (Enlightened).
- **Crush on medium vehicles** (2 lines): the Battle Bus and the Technical run soldiers over.
- **Roles whose requirement the stock parts fail** (3 lines): anti-armour for the Battle Bus's riders and for the Engineers' buttons, scout for the Overlord's add-on.
- **Heroes at tier 1** (3 lines): Anna Kos and Olga Morozova are unique units before tier 2, and Anna's rifle stuns before tier 2.
- **Others** (6 lines): the Sentry Drone is very fast on tracks; the Vimana is a huge flying pyramid, slow for a hovering craft (two lines); two soldiers auto-target (Drone Operator, Anna Kos); William Mason's suit lets its pilot out as a vehicle would.

**Gaps where no term fitted well:** 38 fit notes on 18 of the 27 units, after the pattern phase removed the 26 that asked for a pattern. By field: roles 11, body plan 7, weapon traits 3, weapon damage 2, armour models 2, on death 2, movement 3, and one each for modes, combos, weapon slot, weapon family, the price band, resources, passengers and one pattern variant. Every gap with the coder's reasoning is in [opening/hesitations.md](opening/hesitations.md) (88 hesitations, 11 gaps, 34 unclear rules) and [fill/hesitations.md](fill/hesitations.md) (416 hesitations, 90 gaps, 128 unclear rules).

## Rule problems

The agents reported every place where a written rule was unclear, two rules conflicted, or a rule gave a result that looks wrong for the unit. [rule-problems.md](rule-problems.md) merges them into one list. Three analysts, one per game, drew 140 items from the 19 reports; an editor merged them into 128 entries; a skeptic then checked every entry against the rules and the units as they stand. It asked for changes to 12 entries and named 4 missing problems; the editor applied them, declining one point with its reason, and the file grew to 131 entries. Each entry gives the rule, what goes wrong, the units, a proposed fix and who raised it.

- **83 for Mustafa:** the fix changes the word lists, the field rules or the validator's checks. 39 were raised by more than one report or touch more than one unit, and 44 are one-off cases. They wait for the rule-fix round after R4 (your decision of 24 October 2026).
- **23 for the batch:** only the registry notes, the registries or the unit data would change. 18 are settled, with the recommended fix: 11 clarify a note to say what the units already do, and 7 also change a unit or the pattern registry (the Sentinel, the Thunderhead, the Voltaic Tank twice, the Vimana and the Enlightened, and the summary of `hijack-vehicle`). Five are left open: the Purpose entries of the generals' versions wait for your answer in pull request #6, Tempest Rising's version for the round, the Red Guard's confidence for the confidence rule, and the Iron Harvest unit names and Olga Morozova's sabre for a source.
- **25 settled** earlier in the batch, by the merge pass, the patterns phase or a night decision.

The ones that touch the most units:
1. **Sizes** (10 units): the stand-ins for a footprint disagree, or tell nothing apart.
2. **The speed lists of the mobility types** (7 units) leave out speeds that real units have: seven units of this batch are slower or faster than their movement type allows.
3. **The damage lists of the weapon families** (6 units) are narrower than the games' damage types, which gives five of the batch's nine atypical weapon lines.
4. **Which official text calls a unit by a role** (5 units), in roles.secondary step 1.
5. **Matchups** (5 units each): who counts as harming no enemy, and no link for sets such as fighters or faster units.

Two were already named to you: the body plan of a walker on many legs with a fixed main gun (3 units, note decision N3 meanwhile) and which pages the confidence tie-break reads (4 units, note decision N4 meanwhile). Armed units whose real job is a button or another official line still fall to assault (3 units), which is part of why the batch has nine assault units.

Meanwhile the units are coded by the current rules, and the coders recorded their doubts in uncertain entries and fit notes.

## Checker

- **The sample.** The seed `r3-2026-11-11` was committed before the draw (8e1746f). The draw took one unit in five per game, at least three, and one proposed pattern in three, from a copy that held only this batch's 27 units and 33 pattern files: 9 units and 11 patterns.
- **The check.** Five checkers who wrote none of the records re-opened the cited pages and the pages the uncertain entries name, and checked 705 fields. A skeptic then re-checked each of the 24 fields marked wrong or unsupported.

| | Fields checked | Marked | Confirmed | Refuted | Rate |
|---|---|---|---|---|---|
| Generals (3 units) | 120 | 0 | 0 | 0 | 0% |
| Tempest Rising (3 units) | 106 | 0 | 0 | 0 | 0% |
| Iron Harvest (3 units) | 176 | 2 | 2 | 0 | 1.1% |
| Patterns (11 files) | 303 | 22 | 21 | 1 | 6.9% |

- **What was wrong.** On the units, only the Mocny: one source claimed to back the whole armour group, and one note said no post mentions the cannon's reach when a cited change log does. In the patterns, 12 of the 21 fields were the confidence of one example: ten were too low, because the cited page quotes the game's own text, and two too high. Two patterns carried a higher confidence than their only source unit. Five notes said more than their pages, one example was filed outside its registry game, and one version label was wrong.
- **All 23 are fixed** (9ce1f96). The 9 units and 11 patterns carry their review record: the paths checked, the paths found wrong and the fix commit. [checker/result.json](checker/result.json) has the counts and [checker/checks.json](checker/checks.json) every field with its verdict. The checkers' evidence quotes the pages, so it stays outside the repository, as in batch R1.

## Copied wording

- Each research agent ran the copy-check on its own file before finishing, and each record was checked again when it was committed. The agents' reports and the skeptics' evidence often quote pages, so the rewording was in the record's text and in a few notes, never in a coded value.
- **The game manuals, by hand.** The copy-check cannot read PDFs, so the text of the two cited manuals (the Generals manual and the Zero Hour manual) was extracted and compared, six words at a time, with every prose string in the units, the patterns, the registry notes and the record. The few runs found during the batch were reworded; none is left.
- **The online copy-check** on the data, the whole record and the registry notes (`npm run copy-check -- --also research/r3 --also research/registry-notes`) finds no shared run in the 1173 pages it could read. 36 addresses could not be read from this machine, and no R3 unit or pattern cites any of them: 23 ModEnc pages, which refuse the request, and 8 archived pages on web.archive.org, which resets the connection (batch R1's notes and one Generals page); one page of tempestrising.com that no longer exists; and four placeholder or folder addresses in the notes, which are not pages.

## Decisions

**Taken during the batch with the recommended option** (each can be reversed; the units it affects are named):
1. **N1, 27 October 2026:** an Iron Harvest "(Ability)" slot that a mode adds as a standing weapon is coded as a weapon. Units: the Kaiser (its rockets).
2. **N2, 27 October:** the extra or missing buttons of a Generals general's version go in `tier.basis`. Units: the Generals units that generals also field.
3. **N3, 27 October:** until the rule-fix round, a walker on many legs with a fixed main gun is `spider-frame`. Units: the Kaiser, the Mocny, the Stark.
4. **N4, 27 October:** confidence keeps the current practice, and every contradiction between pages is logged. Units: all.
5. **The consistency check's fixes to the notes and the registry** (527724f), each confirmed by a skeptic; [merge/README.md](merge/README.md) lists them. The ones that changed a coded value: Tempest Rising soldiers take their armour class from the soldier rule (the Line Officer becomes light); a doctrine that reaches a whole class stays off the units (Engine Tuning leaves the Thunderhead and the Vimana); Arcing is a triggered ability (the same two units); terms may be set from the Generals 1.04 files (the Technical, the Overlord, the Aurora Bomber, the Sentry Drone).
6. **Four choices about the new patterns** (ef2460e; [patterns/README.md](patterns/README.md)): `stack-to-overload` stays its own pattern, marked a variant of `freeze-and-shatter` (the Voltaic Tank); `fortify-on-death` is a new id beside the wreck-bunker variant of `passenger-sets-weapon` (the Battle Bus); `convert-on-kill` is a new id beside a variant of `execute-target` (the Vimana, the Enlightened); the Repair Turret links `deploy-turret`, whose registry summary was widened, as was that of `launch-drones` (the Shieldmaiden, the Drone Operator).
7. **The Vimana's second roles are support and buffer** (ef2460e). Its Benediction gained the resupply link, to match the Enlightened's Sacrifice, and the roles rule as written then puts support ahead of anti-infantry. An independent agent checked it.
8. **18 batch-level rule problems settled** in the notes, the registry and five units, each as [rule-problems.md](rule-problems.md) says.

**The five questions from the prep,** coded by their recommended answers and waiting for you in pull request #6:
1. The Generals tier map stays as it is.
2. Generals lasers follow the game's damage types.
3. A general's version carries its main unit's Purpose entry.
4. Tempest Rising's "air control" and "zone control" name no role.
5. Iron Harvest's "mech hunter" joins anti-armour at the rule-fix round.

**Decided by you:**
- The plan change of 24 October 2026: R3, then a new R4, and one rule-fix round for both after R4.
- The checker re-checks one proposed pattern in three, at least three (22 October 2026).
- Commit messages carry no model name (11 November 2026).

## Files

| Path | What it holds |
|---|---|
| [prep/trim.json](prep/trim.json) | The unit list: kept units with their briefs, cut candidates with reasons, the opening-check choice, coverage and the planned new patterns |
| [opening/](opening/) | The opening check: both codings, the agreement report, the hesitations, the drafted fixes for the two splits, and the reconciled entries with the reconcilers' reports (`final/`) |
| `fill/<job>/` | Each fill job's unit file, as recorded before the merge pass, and its report |
| [fill/hesitations.md](fill/hesitations.md) | Every hesitation, gap and unclear rule of the fill |
| [merge/](merge/README.md) | The consistency check: 37 findings with their verdicts, and the fixes to the notes, the registry and the units |
| [patterns/](patterns/README.md) | The pattern phase: the groups' reports, verdicts and fixes, the integration and its independent check |
| [rule-problems.md](rule-problems.md) | Every rule problem the agents raised: 83 for Mustafa, 23 for the batch with what became of each (18 settled, 5 left open), and 25 settled earlier |
| [checker/](checker/) | The checker: the seed, the sample, the counts and rates, the confirmed fields and their fixes (`result.json`), and every field checked (`checks.json`) |
| [../registry-notes/games-r3.md](../registry-notes/games-r3.md) | The game-level notes for Generals, Tempest Rising and Iron Harvest |
| `data/units/generals.json`, `tempest-rising.json`, `iron-harvest.json` | The units |
| `data/patterns/`, `data/pattern-registry.json` | The pattern files and the registry |
| `data/games.json` | The registry entries of the three games |
