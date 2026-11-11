# R3 patterns

This is the record of the pattern phase for batch R3 (runbook, section 5): a proposed pattern file for every registered id the batch's units link, and for every mechanic the batch's agents reported with no id.

## TL;DR

- 33 proposed pattern files were written: 17 fill ids the registry already had, and 16 are new ids.
- Nine groups did the work. Each had a writer, then a skeptic, then a fixer that applied the confirmed corrections.
- The skeptics gave 170 verdicts, each with its evidence. 76 were confirmed problems, and 94 claims held. Every confirmed problem is corrected, or was handed to the integrator and applied.
- The units now link the new ids: 23 links were added on 16 units, and 26 fit notes that had asked for them are gone.
- An independent agent then checked the integration. It confirmed all 33 unit links and seven of the integrator's nine decisions, and its corrections are applied.
- The registry grew from 63 to 79 entries, and the pattern files from 36 to 69. Every pattern an R3 unit links now has a file.
- [result.json](result.json) holds each group's writer report, verdicts and fixes. [integration.json](integration.json) holds what the integrator changed outside the pattern files and how that was checked.

## The patterns

"Planned" means the registry had the id and no file. "New" means the id was added now. Every file has status `proposed` and review status `unchecked`.

| Pattern | New or planned | Category | Source units | Variants | Examples (RTS + shooter) | Confidence |
|---|---|---|---|---|---|---|
| `cloak` | planned | stealth-deception | jarmen-kell, sentry-drone, olga-morozova | 8 | 6 + 4 | high |
| `hijack-vehicle` | planned | infiltration | jarmen-kell | 6 | 4 + 2 | high |
| `convert-on-kill` | new | conversion | enlightened, vimana | 6 | 3 + 3 | high |
| `block-abilities` | new | control | sentinel | 6 | 3 + 3 | medium |
| `drop-in-from-above` | planned | mobility | combat-chinook, william-mason | 9 | 6 + 4 | high |
| `host-spawn-point` | planned | transport-garrison | vimana | 7 | 1 + 7 | high |
| `build-linked-exits` | planned | transport-garrison | thunderhead | 7 | 4 + 4 | high |
| `produce-unit-in-field` | new | summon | vimana | 6 | 6 + 3 | high |
| `upgrade-in-field` | planned | progression | overlord, red-guard, sentry-drone | 6 | 3 + 3 | high |
| `join-ally-crew` | new | transport-garrison | line-officer | 6 | 3 + 2 | high |
| `fortify-on-death` | new | defence | battle-bus | 7 | 2 + 2 | high |
| `command-companion` | new | summon | anna-kos, olga-morozova | 7 | 3 + 4 | medium |
| `rally-allies` | planned | support | overlord, line-officer, enlightened, vimana | 9 | 5 + 3 | high |
| `resupply-allies` | planned | support | enlightened, vimana | 7 | 2 + 5 | high |
| `sacrifice-for-allies` | new | support | enlightened | 8 | 5 + 1 | high |
| `refill-on-ally-buff` | new | support | vimana | 6 | 2 + 2 | high |
| `suppress-with-fire` | planned | control | grimbart | 6 | 4 + 0 | high |
| `lay-smoke` | planned | stealth-deception | mocny | 6 | 4 + 3 | high |
| `fire-power-shot` | planned | weapon-behaviour | anna-kos | 8 | 4 + 2 | high |
| `dampen-missile-fire` | new | control | shieldmaiden | 5 | 3 + 1 | high |
| `deploy-turret` | planned | summon | engineer, william-mason, shieldmaiden | 8 | 6 + 8 | medium |
| `build-cover` | planned | area | engineer | 7 | 5 + 5 | medium |
| `build-structure` | new | support | engineer | 5 | 3 + 1 | medium |
| `launch-drones` | planned | summon | drone-operator, vimana | 8 | 4 + 8 | medium |
| `heal-self` | planned | defence | stark | 8 | 3 + 7 | medium (generic) |
| `heal-from-debuff` | new | conversion | tempest-sphere | 6 | 5 + 2 | medium |
| `rage-when-wounded` | new | weapon-behaviour | stark | 8 | 3 + 3 | medium |
| `retaliate-on-hit` | new | defence | thunderhead, vimana | 8 | 5 + 5 | high |
| `dash` | planned | mobility | tempest-sphere | 10 | 5 + 5 | high (generic) |
| `become-invulnerable` | planned | defence | aurora-bomber | 9 | 6 + 9 | high |
| `stack-to-overload` | new | control | voltaic-tank | 10 | 3 + 4 | medium |
| `band-together` | new | support | red-guard | 5 | 3 + 1 | high |
| `generate-income` | new | support | hacker | 6 | 3 + 1 | high |

**Asked for and not written:**

- `untouchable-attack-run`: the writer made it the attack-run variant of `become-invulnerable`, because the interaction and the counterplay are the same. The skeptic agreed.
- `shrug-off-status`: taken off the list before the run. Its only linking ability, Engine Tuning, left the units in the merge pass (finding REG-03), so no unit would link it. It is a side-wide doctrine, recorded in the two units' armour notes.

Ten registered ids still have no file, because no unit links them yet: `raise-shield`, `drain-health`, `mark-target`, `draw-fire`, `brace`, `recover-wreck`, `spawn-decoy`, `jam-sensors`, `fire-countermeasures` and `retreat-to-base`.

## What the skeptics found

| Group | Files | Verdicts | Confirmed problems | Entries in the fixer's applied list | Entries handed on or kept |
|---|---|---|---|---|---|
| g1-stealth-capture | 4 | 14 | 6 | 9 | 6 |
| g2-arrival-production | 4 | 17 | 4 | 6 | 2 |
| g3-crew-upgrades | 4 | 23 | 6 | 7 | 2 |
| g4-support | 4 | 18 | 8 | 7 | 4 |
| g5-fire-area | 4 | 25 | 15 | 15 | 3 |
| g6-devices-building | 4 | 17 | 11 | 11 | 2 |
| g7-self-sustain | 4 | 22 | 9 | 9 | 2 |
| g8-movement-invulnerability | 2 | 17 | 9 | 8 | 1 |
| g9-economy-status | 3 | 17 | 8 | 9 | 4 |
| Total | 33 | 170 | 76 | 81 | 26 |

A fixer's list can be longer than the confirmed problems, because one problem can touch several fields. The last column holds unit-side changes handed to the integrator, corrections the fixer declined with a reason, and notes.

The kinds of problem the skeptics confirmed most often:

- a note that said more than its page says, or the opposite;
- a variant, hook or generator rule used against its word-list meaning;
- an overlap with another pattern that the file did not name;
- a registry line or unit note that no longer matched the file.

No skeptic found copied wording that the files still carry: one six-word run from an image caption was reworded (`generate-income`).

## What changed outside the pattern files

The integrator made these changes in one place, with one script, after the workspace checks passed.

**Registry (`data/pattern-registry.json`):**

- 16 new entries.
- Two summaries were widened to match their files, as batch R1 did for two ids:
  - `deploy-turret` now also covers a placed device that heals, repairs or resupplies (the Shieldmaiden's Repair Turret);
  - `launch-drones` now also covers taking one drone over and steering it by hand (the Drone Operator).

**Units (`data/units/`):**

- 23 links added on 16 units: 22 of the 33 links the writers proposed, and one from a skeptic's finding (the Vimana's Benediction). The other 11 proposed links were already on the units. One link was removed (the Battle Bus, in the table below).
- 26 fit notes removed, each one the note that asked for the pattern now linked.
- Text that pointed at a removed fit note now names the pattern or variant that answers it (7 units: Jarmen Kell, the Combat Chinook, the Aurora Bomber, Olga Morozova, William Mason, the Stark and the Engineer). The Drone Operator's notes now follow the widened `launch-drones` line.
- The coded values that changed beyond the links:

| Unit | Change | Why |
|---|---|---|
| Vimana | Sacrificial Benediction also links `resupply-allies` | It lays the same Consecration as the Enlightened's Sacrifice, which links it (group 4, finding 8) |
| Vimana | secondary roles go from buffer, anti-infantry to support, buffer | With that link, support's requirement is met through a button every copy has, so it ranks at step 2 beside buffer; anti-infantry, at step 3, is third |
| Battle Bus | the second life links `fortify-on-death` in place of `passenger-sets-weapon`, and so do the bunker mode, one strength and one weakness | The second life is what switches to that mode; the firing ports keep `passenger-sets-weapon` (the independent check, decision 3) |
| Voltaic Tank | a `stack-to-overload` combo comes first, before the two unit links | A pattern link now names the units that build Charge (group 9, finding 3) |

- Text only: the Hacker's tier note now says the Infantry General's version stays hidden while it earns and shows itself only for its other hacks (group 9, finding 4).

**Notes (decisions about the notes, each reversible):**

- `research/registry-notes/games-r3.md` names the new ids where it said no pattern fits: the horde bonus, Tempest Plating, the Charge weapons, Subjugation, Consecrated Restocking, Arcing and the Consecration buttons. The Repair Turret line now sends it to `deploy-turret`'s support-station variant (group 6, finding 1).
- `research/registry-notes/patterns.md` has three new corrections at the top: the horde bonus is `band-together`, a hand-steered drone is `launch-drones`' piloted-drone variant, and a placed support device is `deploy-turret`'s support-station variant.

**Pattern files, across groups:** no group's skeptic could see the other groups' new files, so the independent check looked across them. Seven `related` links were added between new files, and one open question that another new file answers was removed (`produce-unit-in-field`).

No word list and no field rule changed.

## The independent check of the integration

One agent, working read-only, compared the integrated units with the groups' reports and the field rules. Its full answer is in [integration.json](integration.json).

| What it checked | Result |
|---|---|
| The 33 proposed unit links, matched by name | all on the right ability or weapon; no problem |
| The 27 units against the last commit, field by field | 19 changed; every change traced to the integration script |
| 19 items the groups handed to the integrator | 17 right; 2 not (the Battle Bus, the Drone Operator's note), now corrected |
| The integrator's 9 decisions | 7 confirmed, among them the Vimana's roles and the Hacker's text; 2 corrected (the Battle Bus's links, one line of the notes) |
| Text left pointing at removed notes | 4 passages, corrected |
| The new files of different groups against each other | 4 overlaps between variants or boundaries, each now named by a cross-link |

## Decisions taken, each reversible

- **`stack-to-overload` stays its own pattern, marked a variant of `freeze-and-shatter`.** Its skeptic asked for a fold into `freeze-and-shatter`, since both build up a slow, then disable, then let a finisher cash in. A fold would widen a pattern that batch R1's checker has checked beyond cold weapons. That is a calibration choice for the pattern review, so the file keeps the link and an open question. Units it affects: the Voltaic Tank.
- **`fortify-on-death` is a new id beside `passenger-sets-weapon`'s wreck-bunker variant.** The second life works without passengers in other games, and the counterplay differs. The older file keeps its variant for now. Units it affects: the Battle Bus.
- **`convert-on-kill` is a new id beside `execute-target`'s spawn-from-victim variant.** The new file names the overlap. Units it affects: the Vimana and the Enlightened.
- **The Repair Turret links `deploy-turret`** (option a of its skeptic's finding), and not a new id for placed support devices. Units it affects: the Shieldmaiden.

## For the report and the rule-fix round

These came up in the patterns and need the word lists, so nothing changes now:

- No team-play hook names a pure buff, and none names screening teammates from sight (`rally-allies`, `sacrifice-for-allies`, `lay-smoke`).
- No on-death outcome and no armour model names a second life (the Battle Bus keeps its two fit notes).
- No term names immunity to a status (Tempest Shielded).
- The validator does not check that an alias belongs to one pattern only. Two collisions were found by hand and removed from the new files.

The 33 files carry 162 open questions between them. Most are design questions for Mustafa about the player version, to answer when the patterns are reviewed.

## Checks

| Check | Result |
|---|---|
| The nine workspaces against the commit they were made from | only the registry and each group's own pattern files changed; group 6 also changed one line of the batch notes, which its skeptic's finding asked for |
| Validator | no errors; the same 39 atypical lines as before, all recorded |
| `npm run check:merge` | 297 of 297 tests pass |
| Copy-check on the data, the R3 record and the registry notes | no shared run in 1168 pages |
| The two Generals manuals, by hand | no shared run |
| Local paths in the record | none |

The copy-check first found shared runs in the record only: the skeptics had quoted pages in their evidence. 55 such wordings in [result.json](result.json) and 4 mentions of a page title in the merge record were reworded, text only. It found none in the pattern files or the units.

Not checked: 36 addresses this machine cannot reach, the same as in the merge pass. They are 23 pages of modenc.renegadeprojects.com and 8 of web.archive.org (batch R1's notes and one Generals page), one tempestrising.com page, and four placeholder or folder addresses.
