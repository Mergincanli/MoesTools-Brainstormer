# R3 merge pass: the consistency check

This is the record of merge pass steps 2 and 3 for batch R3 (runbook, section 4): the errors in the registry and the game notes that the coding agents reported, the links between units, the conventions each game's units share, and the facts that two or more units repeat. Step 1, adding the 27 units to `data/units/`, is commit 6c817f1.

## TL;DR

- Four finders looked at the 27 units, one per dimension. A skeptic then tried to refute each finding.
- They raised 37 findings. The skeptics confirmed 33 and rejected 4. Every verdict carries its evidence.
- The confirmed fixes are applied: to the game notes and the registry (commit 527724f) and to the units.
- [consistency.json](consistency.json) holds each finding, its verdict and its status. [fixes.json](fixes.json) holds what was changed on the units and how it was checked.

## Counts

| Dimension | Findings | Confirmed | Not confirmed |
|---|---|---|---|
| Registry and notes | 15 | 14 | 1 (REG-08) |
| Links between units | 9 | 7 | 2 (L7, L8) |
| Conventions | 7 | 6 | 1 (conv-4) |
| Repeated facts | 6 | 6 | 0 |
| Total | 37 | 33 | 4 |

The registry and links finders ran on 29 October 2026. The other two finders and all four skeptics ran on 10 November 2026.

## What changed in the notes and the registry

Each change below is a decision about the notes (runbook, "Decisions"). Each was confirmed by a skeptic against the pages, and each can be reversed.

**`research/registry-notes/games-r3.md`:**

- **Tempest Rising armour** (REG-01, REG-07):
  - The label decides the class for vehicles, aircraft and the Heavy infantry type only.
  - For other soldiers the soldier rule applies, with a test against the Field Scout's resistances.
  - The Vimana joins the units lifted to super-heavy, and the lift rests on health, not on a size.
- **Generals, the 1.04 files** (REG-02): a term is set from these files when a figure or flag in them meets the term's own rule, as from any other page an uncertain entry names.
- **Tempest Rising doctrines** (REG-03, facts-04):
  - A doctrine that reaches every unit of a class stays off the units, new effects included. This takes Engine Tuning off the Veti vehicles and aircraft.
  - The Subjugation doctrine has its current name.
- **Arcing and Servitor spawns** (REG-04): both are triggered abilities, not passive ones.
- **Horde bonus** (REG-05, facts-05): only soldiers that carry the bonus themselves count towards it.
- **Iron Harvest's shared faction** (REG-06): it also covers the Engineers.
- **Role and strength wording** (REG-09, REG-10, REG-11): three phrases the lists left out are added.
- **Lore blockquotes** (REG-12): they are the wiki's own words, like the italic opening line.
- **Engineers' defences** (REG-13): the defences that fire by themselves link deploy-turret.
- **Ability slots** (REG-14): a weapon slot that the page's Abilities section lists is an ability, marked or not.
- **Tumbling** (REG-15): a new note on infantry being knocked down.
- **Tempest Rising version** (conv-1, facts-06): patch 2.0.2 came out during the fill. The batch stays on 2.0.1, and the note lists the known differences.

**`data/games.json`:** the name of Iron Harvest's shared faction now includes the engineers (REG-06).

## What changed in the units

The unit fixes are applied: 11 items for Generals, 13 for Tempest Rising and 4 for Iron Harvest, 28 in all. Each game had a fixer in its own copy of the repository, then a verifier that compared every change with the brief. The verifiers found 26 items right at the first check. The fixers repaired the other 2, which were wording in an uncertain entry and stale source notes. The record is [fixes.json](fixes.json).

No ability, weapon or fit note moved, apart from the two Engine Tuning entries that were removed, which were the last in their lists. The validator reports no error and the same 39 atypical lines as before, all recorded.

**Coded values that changed:**

| Unit | Change | Finding |
|---|---|---|
| Line Officer | armour class unarmoured to light | REG-01 |
| Technical | the cannon gains friendly-fire; the rocket gains splash, min-range and friendly-fire | REG-02 |
| Overlord, Aurora Bomber | the main gun and the bomb gain friendly-fire | REG-02 |
| Sentry Drone | the gun's delivery goes from hitscan to projectile | REG-02 |
| Thunderhead, Vimana | the Engine Tuning ability is removed; Arcing goes from passive to triggered | REG-03, REG-04 |
| Vimana | the cannon's range goes from short to medium, and the weakness that hung on its short range is removed | facts-01 |
| Vimana | its combos gain the resupply-allies pattern beside the Enlightened | L3 |
| Overlord | its countered_by list gains the hijack-vehicle pattern beside Jarmen Kell | L1 |
| Battle Bus | its counters lose the hijack-vehicle pattern; the Hijacker link stands alone | L2 |
| Enlightened | its counters lose the armour-piercing damage link | L4 |
| Technical, Enlightened | a countered_by link widens from heavy armour to heavy armour or more | L6 |

**Text and sources only:**

- Jarmen Kell, the Red Guard and the Hacker now cite CNCNZ's Zero Hour page, and the Overlord cites it in place of a third wiki page (conv-2, conv-3).
- The Thunderhead's and the Vimana's notes follow the figures their wiki pages have shown since 7 November 2026 (facts-02, facts-03).
- The other items reword notes, reasons and uncertain entries.

## Not confirmed

- **REG-08:** the three units that never rank up use different links because their sources name different causes. No change.
- **L7:** a typed link that also covers aircraft the unit cannot hit is allowed by the matchup rules as written. No change.
- **L8:** the Operative is not coded yet, so his link on the Drone Operator stands. Look again when he is coded.
- **conv-4:** the Drone Operator's five sources follow the priority order. No change.

## For the rule-fix round

These came up in the check and need the field rules or the registry's wider choices, so nothing changes now:

- A typed link cannot say "ground units only" (L7).
- The notes ask for the production page to be cited, against the limit of five sources (conv-4).
- The Generals note on one-off armour sets names step 1, while steps 3 and 4 are what decide them (conv-7).
- Whether to move Tempest Rising's researched version to 2.0.2, which would also touch the tier gates (facts-06).
