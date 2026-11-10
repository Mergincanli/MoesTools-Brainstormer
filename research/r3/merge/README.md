# R3 merge pass: the consistency check

This is the record of merge pass steps 2 and 3 for batch R3 (runbook, section 4): the errors in the registry and the game notes that the coding agents reported, the links between units, the conventions each game's units share, and the facts that two or more units repeat. Step 1, adding the 27 units to `data/units/`, is commit 6c817f1.

## TL;DR

- Four finders looked at the 27 units, one per dimension. A skeptic then tried to refute each finding.
- They raised 37 findings. The skeptics confirmed 33 and rejected 4. Every verdict carries its evidence.
- The confirmed fixes to the game notes and the registry are applied with this record. The fixes to the units follow in the next commit.
- Everything is in [consistency.json](consistency.json): each finding, its verdict and its status.

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

## What follows in the units

The next commit applies the unit fixes per game: 11 items for Generals, 13 for Tempest Rising and 4 for Iron Harvest. Each game has a fixer, then a verifier that compares every change with the brief.

The largest are:

- the Line Officer's armour class (REG-01);
- four Generals units' splash, friendly-fire and delivery terms (REG-02);
- the Engine Tuning ability coming off the Thunderhead and the Vimana (REG-03);
- the Vimana's cannon range, which its page now gives as longer (facts-01).

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
