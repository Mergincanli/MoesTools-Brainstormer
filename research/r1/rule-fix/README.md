# Rule-fix round after R1: word lists 1.1.0

You chose this round on 22 October 2026 (option A): before R2's fill, the rule problems that recur are turned into exact rule changes, checked against the R1 codings and brought to you for approval as word lists 1.1.0. You approved the set on 24 October 2026 (option A, with the first option of each smaller choice), and it is applied in 9fda853: every word list is now at version 1.1.0, and the units below are recoded. [word-list-changes.md](word-list-changes.md) lists every word-list change against 1.0.0.

## TL;DR

- **40 rule problems went in:** the 37 that recur from [../rule-problems.md](../rule-problems.md) ("Open, for Mustafa", items 1 to 37), batch items 5 and 9, and item 62.
- **39 become rule changes and one is dropped** (item 10: a role's requires stay a test of the unit's parts, which the generator's cards must also pass).
- **Each change was tested twice:** first by a skeptic for its group in a copy of the repository, then all 40 together in one copy with every recode applied. There every check passes: format, validator, docs, and 295 of 296 tests; the one failing test needs git history, which a copy lacks. The copy-check finds no shared run.
- **Where the changes go:** 27 in the field rules (the schemas and the conventions in `scripts/build-docs.mjs`), 10 in the word lists (`data/vocab`) and 2 in the validator; the test count rises from 284 to 296, and six items also adjust the RA1 to RA3 game notes.
- **What it changes in the data:** 23 R1 units, the three step-1 samples and one pattern, in 142 recodes: 58 change a coded value or a matchup entry, 83 change notes, reasons, sources or review records, and one records that the Chrono Legionnaire's targets stay as they are. The largest: the Mammoth Tank becomes an assault unit with super-heavy armour, the Gap Generator a buffer of medium size, the Siege Chopper loses anti-air, six units lose a faction flavour (the Chaos Drone and the Mastermind their only one), and price, availability and immunity reasons get their own link kinds.

## Decision (approved on 24 October 2026: A)

**Approve the set as word lists 1.1.0?**
- **A. Approve all of it** (39 changes, item 10 dropped). Then the three patches here are applied, the word lists get version 1.1.0 (all 39: they share one version), the word-list diff and the docs are regenerated, everything is checked again, and the pull request merges with your approval in the commit message.
- **B. Approve only the 31 items their skeptic confirmed as drafted.** The 9 that the skeptic corrected (items 5, 21, batch 9, 1, 22, 28, 14, 15 and 2) wait for another test round.
- **C. Strike the items you reject** and approve the rest. Keep these pairs together: 5 with 25, 13 with 11, 35 with 32. Item 17 takes anti-air from the Siege Chopper; batch 9 on its own only moves its raider ahead of anti-air.

**Recommended: A.** Every item was tested on its own (the 9 corrected ones in the form their skeptic gave, as its fix of what it found), and the whole set passes together. With B, R2 would be coded while those 9 problems stay open.

**Three smaller choices inside the set** (the first option of each was applied):
1. Item 21 (a stock button such as anti-tank mines can count toward a second role) changes no R1 value. Keep it, or drop it.
2. With super-heavy armour (item 33), the Mammoth's crush trait would also run over light vehicles, which RA1 does not do. The set records this as a fit note on the Mammoth. The other way is to change the crush description in the word list.
3. The Mastermind keeps ships among its targets because the Yuri's Revenge manual says Yuri's mind control works on every unit outside a short immune list. If you do not accept that reading, ships come off.

## The changes

Each line gives the item number from [../rule-problems.md](../rule-problems.md), the change, and what it changes on the units. "Corrected" marks the 9 that the skeptic fixed. [items.json](items.json) holds every item's exact edits, recodes and reasons.

**Roles** (9)
- **5** (corrected): the generalist step 5 needs a weapon that is not a tool, and a new step 6 gives a unit that no step reaches the closest role whose requires it meets, with a fit note. The Gap Generator becomes buffer instead of raider; the M.A.D. Tank keeps assault through step 6.
- **10**: dropped. Praise in the sources cannot meet a role's requires; the units' fit notes keep the wanted role for later review.
- **17**: words that hedge whether the unit does a job at all (to some extent, up to a point, can serve as) no longer count for a role; words that hedge only how much it destroys (potentially, at times) still do. The Siege Chopper loses anti-air.
- **18**: when one official line names two roles, first drop any whose requires fail; if one is left it is the role, and only if more are left does the bonus test choose (a role with no target, such as siege, never wins it). No value changes; the Mastermind's and the Siege Chopper's notes follow.
- **21** (corrected): a stock button that harms only one kind of target, or that a source labels anti-tank or anti-aircraft, supports that anti role, and may meet the role's requires through its damage and targets, read as for a weapon (recorded in atypical). No value changes: the Allied Minelayer's mines fail anti-armour's requires, and its notes now say so.
- **25**: a weapon that does no damage (a stun, a freeze) is a tool, and raider needs a weapon that is not one. The Chaos Drone loses raider.
- **30**: step 4 reads only the main weapon's strong-against text; text about a second weapon can give only a second role. The Mammoth Tank becomes assault, with anti-armour and anti-infantry second.
- **31**: for assault as a second role, a main weapon counts as short to medium when it reaches no further than the game's main battle tanks' guns. No value changes.
- **Batch 9** (corrected): one rule for every game on which words count for roles: any word form of a role's label or alias, only when it describes the unit's own job. The Siege Chopper's raider now ranks first, from its profile's harass (with item 17, raider is its only second role); the Soviet Minelayer's notes follow.

**Matchup links** (5)
- **1** (corrected): three new link kinds, `cost:`, `availability:` and `immune:`, for reasons about price, limits and immunities, with validator support and tests. 12 R1 units, the Terror Drone sample and one pattern move such reasons off stand-ins (for example `tier:t1` for cheap, `class:infantry` for immune to crushing).
- **19**: when one phrase names the enemy two ways, both parts may get a link. Fast units join the Siege Chopper's countered-by list, and three reasons are reworded.
- **22** (corrected): something only one kind of unit makes (a minefield) names that unit, and a lone unit link says why. The Yak gains both Minelayers as counters.
- **28** (corrected): "tanks" is `armour-class:heavy` when the sources set tanks apart from lighter vehicles, else `class:vehicle`. The tanks in the Multigunner IFV sample's countered-by list become armour-class:heavy.
- **36**: when a source names only a unit, the three matchup lists each name a different part of it. No value changes.

**Matchup entries** (6)
- **3**: a reasoned matchup must name the sourced facts it rests on and carry an uncertain entry. Two units' notes follow.
- **12**: when the sources say one loses but several win, the enemy goes in both lists, each reason saying which. The Mammoth and the Chrono Legionnaire gain a counter.
- **14** (corrected): `target:structure` names enemy buildings in counters and countered by; a job that units and buildings share keeps its role link and names the buildings in the reason. The Spy gains a building counter, and the Chaos Drone base defences in its countered-by list.
- **15** (corrected): a unit that harms no enemy lists in counters only what it slips past or foils, and may leave the list empty, with a validator check that reads weapons only. The Field Mechanic's counters become empty.
- **16**: about two to five entries is a guide; one is fine when the sources give one, and a sourced sixth may stay. No value changes.
- **37**: a weakness about being slow for its kind may keep the unit's own speed band only when the band agrees. The Yak's speed weakness merges into another.

**Weapons** (9)
- **2** (corrected): one definition of a weapon label for can_target step 3 and the second-role test; a ground line that is the weapon's own lists structures. The Robot Tank and the Hammer Tank sample add structures.
- **6**: game code or data that places a weapon counts as the source on its mount, and design trivia about a real vehicle does not; a gun on the side, tail or in a door is limited-arc and one in the nose fixed; and when no source says, a turreted hull puts the main weapon on the main turret before the family default. The Siege Chopper's gun becomes free-aim; the Mastermind's and Slave Miner's weapons become slow turrets.
- **11**: a weapon whose sources say it stops the target moving, firing or both for a time takes root, silence or both, whatever its family; no family or damage type brings them by itself. A weapon that erases or removes its target counts as doing damage. The IFV sample's cryo weapon gains slow, root and silence.
- **13**: can_target step 1 wins over the naval rule: a weapon that does no damage, latches on or takes over minds lists ships only when a source names them or says it works on every unit (the reading that keeps the Mastermind's ships). The IFV sample's weapon loses ships.
- **20**: what the sources present as one weapon is one entry, even when the game data splits it. No value changes.
- **24**: affects: both is for a weapon the sources also use on purpose on friends to help them, such as a shielding beam; harm that spills onto nearby friends is the friendly-fire trait. No value changes.
- **32**: a mode can set the target kind it becomes (`modes[].target`), so a landed helicopter is hit as a ground vehicle. The Siege Chopper and the Slave Miner get mode targets.
- **34**: a fixed burst that the game repeats at its normal rate is not a magazine. The Mammoth's missiles lose the trait.
- **35**: the validator checks a weapon that works only in a mode against that mode, with tests. No value changes.

**Body, class and flavour** (5)
- **4**: the size list gains examples (trucks medium; harvesters, mobile refineries and submarines large), and a unit that no example covers and no source measures takes stand-ins in order: the hull it is built on, then the game's own size data against its main battle tank. The Gap Generator, a truck, becomes medium, and its crush is listed as atypical; the Submarine's and Slave Miner's size notes now cite the examples.
- **7**: movement and body plan alone cannot add a second faction flavour. The Yak, Siege Chopper, Chaos Drone, Mastermind, Mecha Tengu and Sudden Transport lose a flavour.
- **27**: the detector trait says whose view it reveals in, and naval units may have it. The Submarine's atypical entry goes.
- **33**: super-heavy is a weight word, not a size, and the huge example becomes a tank at least twice a battle tank's size. The Mammoth becomes super-heavy; the M.A.D. Tank's counter widens to heavy and above.
- **Batch 5**: medium's description now names light mechs bigger than a soldier, hovering ones too, and the soldier rule judges partial armour data by the part it gives. No value changes; the Mecha Tengu's (medium) and Tanya's (light) notes follow.

**Abilities, text and sources** (6)
- **8**: per-life covers a stock that only a resupply point or a respawn refills, and any action that uses up the unit. Both Minelayers' notes follow.
- **9**: effect durations are written in words, and a zero as none. No value changes.
- **23**: a passive effect gets its own ability entry only when a source treats it as a distinct state and no term covers it. One note follows.
- **26**: source order decides which pages fill the five slots, not the order of the list. No value changes.
- **29**: a type whose stock parts differ by side gets one entry per side. No value changes; the Minelayers' notes about their split go, as the rule now says it.
- **62**: the validator rejects a unit link whose game or faction is unknown, with tests. No value changes.

## How it ran

1. `research/workflows/rule-fix.js` (run `wf_bcbadf88-df7`) gave each of six groups an analyst, who wrote the exact edits and listed the units they recode, and a skeptic, who applied them in a copy of the repository and ran every check. The run was cut off twice by usage limits and resumed from the agents' notes.
2. One reviewer then applied the 31 items the skeptics confirmed in one copy, found 9 clashes, and gave each a fix.
3. A last pass applied all 40, the 9 in their corrected form, with every recode merged, the clash fixes kept, except two that corrected items now settle (item 5's step 6 for clash 1, batch 9's note for clash 3) and two small edits for consistency: assault's coding rule now says what step 4's range test means, and item 21's button clause uses item 2's wording for labels.
4. The lead applied the three patches below to a fresh copy and ran `npm run check:merge` again: 295 of 296 tests pass (the failing one reads git history, which the copy lacks), and the validator passes with 11 atypical lines, as now: the Submarine's detector line goes, and the Gap Generator's crush line comes in.

## Files

| File | What it holds |
|---|---|
| [items.json](items.json) | All 40 items in group order: title, where the change goes, the recommendation, whether the skeptic confirmed or corrected it, the reason, the exact edits and the recodes |
| [merged-recodes.json](merged-recodes.json) | Every recode as applied, with the items behind it |
| [word-list-changes.md](word-list-changes.md) | Every word-list change from 1.0.0 to 1.1.0 (`npm run vocab-diff -- origin/main`, run before the merge) |
| [rules.patch](rules.patch) | The changes to the word lists, schemas, docs builder, validator and tests |
| [docs.patch](docs.patch) | The regenerated `docs/` pages, for reading the new rules in place |
| [data.patch](data.patch) | The recoded units, the pattern and the RA1 to RA3 game notes |

All three were applied in 9fda853.
