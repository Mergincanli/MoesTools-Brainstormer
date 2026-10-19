# Pilot round 1: conflicts and overlaps, with final texts

This file is the only place where change texts are written out. Every other applied proposal is taken from the analysis files (`analysis/<group>.json`): the reviewer's `revised_change` for an apply-revised proposal, the analyst's `change` for an apply-as-proposed one. Where a proposal below is named as a source, the text here replaces its own text for the parts listed.

Quoted text is final. Package tags (p1 to p9) say who applies it. Ids are written group/id.

Contents

- C1 Main weapon, slots and seats
- C2 Which titles of a series count
- C3 Numbers: band edges, figures in text, stock values
- C4 RA3 sample fixes (every change once)
- C5 Speed bands under method A
- C6 Modes
- C7 Resources, ammo and per-use costs
- C8 Loadout picks: sensors against armour; the thermal optics
- C9 Paired entries and the passenger patterns
- C10 Pattern links, retreat and the game-wide lists
- C11 One weapon that acts differently by target
- C12 Cited sources and the source cap
- C13 Bodies: limited-arc on hull guns and set-up weapons
- C14 Slugs for units not yet researched
- C15 scripts/agreement.mjs: one change set
- C16 Matchups without negated links
- C17 scripts/validate.mjs: every new check in one list
- C18 The Proposals vs facts bullet
- C19 Boost against speed
- C20 Registry files that several proposals touch
- C21 Roles against the slot rules

---

## C1 Main weapon, slots and seats

**Proposals:** structure/main-weapon-and-slots (carrier), crew/seat-and-primary, weapons/main-weapon-slot-crossgroup, crew/seat-leave-out-driver, structure/passenger-entries, structure/upgrade-weapons, structure/when-and-alternate, crew/mount-order (body-aim check), identity/roles-primary-procedure (reads the main weapon), armour/covered-field-gaps (acquired 'when' links, mode 'base'; dropped).

**What clashed and how it is settled**

1. *The seat of the primary when the source's driver fires nothing* (a Foxhole light tank, a PlanetSide 2 Sunderer). Structure wrote seat driver as a 2A proposal; crew copied the source's gunner seat. Settled for crew: the seat field is "copied from the source when crew.basis is in-game", and solo_fallback already records what a lone player can do. Decision 2A governs proposal crews and the generator's cards (B and C stay rare card variants), not the record of what the source does. A proposal crew's primary never carries a seat.
2. *A loop between roles and the main weapon.* Structure picked an RTS unit's main weapon by "the weapon that does the unit's primary role", while roles.primary steps 3 and 4 read the main weapon. Settled: the main weapon is chosen without the roles.
3. *Two defaults on the pilot's seat* (Battlefield rocket pods and heat seekers). Settled: the default in the first weapon slot is primary, the other secondary (weapons' "first fire button" and structure's "selected at spawn" say the same).
4. *option_group and default texts.* Structure's split into loadout groups and upgrade groups wins over weapons' shorter text, because upgrade groups (Generals add-ons, a CoH2 BAR-or-M1919 choice) would otherwise break the validator rule.
5. *'when' on acquired weapons and a reserved mode id 'base'* (armour/covered-field-gaps): dropped. 'when' is for passenger weapons only; a weapon without a mode works in the base form.
6. *x-provenance on seat.* build-docs prints "Proposal, not a sourced fact" for every `x-provenance: proposal` field, which would contradict "copied from the source when crew.basis is in-game". Remove the keyword from both seat fields; the description carries the provenance.

**p6, schemas/source-unit.schema.json**

`unit.armament` description: "Weapons, main weapon first, counted by the Weapon entries rules in the Conventions. Empty for unarmed units."

`$defs.weapon.slot` description (whole text):

> primary = the main weapon, listed first. There is at most one, chosen among the weapons the base form always has. In a shooter it is the weapon the driver seat has selected at spawn (its first fire button); if two loadout groups of the driver seat each have a default, the one in the first weapon slot is primary and the other is secondary. If the driver seat fires nothing in the source with a full crew (a Foxhole light tank, a PlanetSide 2 Sunderer), the main gun of the first gun seat in the source's seat order is primary. In an RTS, where one attack order fires everything, it is the weapon most members carry, otherwise the one the source lists first; the unit's roles never decide it. secondary = any other weapon the base form always has: on its own key, fired by another seat (a gunner's main gun), or used by the same attack order with the primary or against targets the primary cannot hit. A weapon that a mode adds while the primary keeps firing is also secondary, with mode. alternate = swapped in by a button the unit has (an ability or a mode); the weapon it replaces, usually the primary, is silent meanwhile. A weapon the unit picks by itself for the target or range is not alternate. passenger = set by who rides in a passenger-module seat. One entry per rider unit that changes the weapon, counting riders of every faction and expansion that can get in, captured or allied ones too. When the source says any unit of a role gives the same result (any engineer), make one entry for that role instead. acquired = gained during play: taken from a kill or a wreck (with a triggered ability, see Paired entries), or added or swapped in by a bought upgrade, research or a rank (no ability). Say which in condition. option = a loadout choice that is not fitted by default (see option_group).

`$defs.weapon.seat`: remove `"x-provenance": "proposal"`. Description:

> Proposal, or copied from the source when crew.basis is in-game. Which seat fires it. Leave it out when the driver fires it: that covers every weapon of a solo, squad or remote unit and the driver's own weapons in a multi-seat unit. Write it only for another seat the unit has: gunner or commander when the crew model or crew.seats has that seat, or a passenger seat when it matches crew.passengers.kind. When crew.basis is in-game, write the seat that fires it in the source when every seat is full. A weapon the source hands to a lone driver whenever its own seat is empty (as in Renegade) still belongs to that seat; say in crew.notes that it passes to the driver. When crew.basis is proposal, follow decision 2A: the driver fires the main weapon and any gun that turns with it, and every other weapon on its own mount that the source fires at the same time as the main weapon goes to the gunner.

`$defs.ability.seat`: remove `"x-provenance": "proposal"`. Description:

> Proposal, or copied from the source when crew.basis is in-game. Which seat triggers it. Leave it out when the driver does. A passive ability has no seat. Write it only for another seat the unit has, as for weapons.

`$defs.weapon.option_group` description:

> Groups weapons that exclude each other. A loadout group holds every choice for one place in the loadout. The default choice keeps its primary or secondary slot and has default: true; the other choices are option. A place that starts empty has no default. An upgrade group holds acquired weapons from upgrades that exclude each other, with no default. How a choice is unlocked (score, rank, progression) is not recorded.

`$defs.weapon.default` description: "true on the default choice of a loadout group, and nowhere else."

`$defs.weapon.when` description:

> Passenger weapons only, and required there. Write the rider as unit:<id>, built from its in-game name by the id rules (see Ids in the Conventions), even if that unit is not researched yet. For a role entry, write role:<role>. Leave it out on every other slot.

`$defs.weapon.condition` description: "The condition in plain words. Required for passenger, alternate and acquired weapons. For a passenger weapon, name the rider, its faction and any expansion."

`$defs.weapon.mode` description:

> Mode id from the unit's modes, when the weapon works only in that mode. A weapon without a mode works in the base form and in every mode, unless an alternate with that mode replaces it. An alternate with a mode replaces another weapon, usually the primary, in that mode. A weapon that a mode adds while the primary keeps firing is secondary, with the mode. If a mode silences a weapon and nothing replaces it, say so in the mode's summary.

**p6, scripts/build-docs.mjs Conventions:** new bullet after Weapon entries:

> - **Main weapon.** A unit's main weapon is its one primary entry (see armament[].slot). Every other weapon the base form always has is secondary, including a second seat's main gun. The roles rules read the main weapon from this entry, so it is chosen without looking at the unit's roles.

**p7:** checks V1 to V7 in C17.

**Pilot result:** helicopter: Hydra pods primary (option_group pilot-rockets, default), heat seekers secondary (pilot-missiles, default), chin cannon secondary with seat gunner, the rest option; the gunner group starts empty. Main weapon rockets for A, B and C. Every other pilot unit keeps its primary. The RA3 samples already comply.

---

## C2 Which titles of a series count

**Proposals:** scales/series-title-convention (carrier), armour/series-titles, weapons/series-version-rule, weapons/lock-on-vs-guided (last sentence), weapons/no-change-rts-automation-and-stat-quirks, structure/weapon-entry-count rule (4), scales/speed-raw-rule and scales/cooldown-bands-exact-edges (which point here).

**What clashed:** scales let any title of the series fill a field as a last resort; armour said facts from titles not named in version_researched never fill fields; weapons said the newest title wins; armour said a mechanic any lead title has is coded. Settled: only counted titles fill fields; the newest counted title that speaks to a fact decides it; superseded figures do not count.

**p6, scripts/build-docs.mjs Conventions:** new bullet after Stock values (C3):

> - **Series games.** For a games.json entry of kind series, the counted titles are the lead titles named in version_researched and any title named there for the archetype being coded. Only counted titles fill fields; facts from the series' other titles go in notes. When counted titles differ, on whether a mechanic exists or on a value, the newest counted title whose sources speak to it decides, at its final patch; give the other version in notes or in the weapon's summary. A figure that the source says a later patch of that title changed, without giving the new value, does not count for that title. Where the registry entry says where a kind of fact comes from (MechWarrior speeds from the BattleTechWiki), follow the registry. When one archetype mirrors several models, one per side, take figures from the model of the first faction in the registry's list that is not shared, and say which in notes. A matchup may rest on a source about any title, as long as the parts it names exist in a counted title.

**p6, schemas/game.schema.json** `$defs.game.properties.version_researched` description:

> Patch, edition or date the research describes. For a series, name the lead titles newest first, any title used for an archetype it adds, and any title that is the source for one kind of fact; facts from its other titles do not fill fields.

**p6, Weapon entries bullet, rule (4)** (replaces the reviewer's rule 4 in structure/weapon-entry-count):

> (4) Versions of one weapon across the titles of a series entry (the same place in the loadout, renamed or retuned) are one entry. Code the version the Series games convention picks, even when an older version works differently, and put the differences in the summary.

**p4, data/vocab/weapon-delivery.json** tie-break [lock-on, guided] (full rule; replaces the reviewer's last sentence):

> Lock-on when the target is chosen before firing and the shot then finds it alone, so the shooter may look away; the target is usually warned. A missile that homes on a laser spot is lock-on when a teammate's designator also works. Guided when only the shooter steers it and must keep aiming until it lands: by wire, camera, crosshair or the shooter's own laser. When one entry stands for several titles of a series that differ, follow the Series games convention and give the other version in the summary.

**p8, data/games.json** `battlefield.version_researched`:

> Vehicle archetypes as each title's final patch has them, led by Battlefield 4 and Battlefield 3 (newest first; the fullest modern vehicle rosters), with Battlefield 1942, 2142, 1, V, 2042 and 6 for archetypes they add; as described by the Battlefield Wiki in October 2026

(wargame and mechwarrior already name their lead and source titles; leave them.)

**Round-2 coder brief, one line** (from weapons/no-change-rts-automation-and-stat-quirks): "Quirks that are not traits (spin-up, no-overkill, a fire rate that changes with distance) go in the weapon summary; for a series, follow the Series games convention."

**Pilot result (helicopter, all three coders):** speed_raw 14.1 (Battlefield 4 gives none, so Battlefield 3's AH-1Z, the model of the first non-shared faction); flares short (Battlefield 4's "up to 15 s" was changed by a later update with no new figure, so Battlefield 3's figure); ECM short; extinguisher spam (Battlefield 4 final patch); zonal coded (Battlefield 4); crew-casualties not coded (Battlefield 2 only); no spin-up; the TV missile has no finite-ammo and no high air.

---

## C3 Numbers: band edges, figures in text, stock values

**Proposals:** scales/numeric-band-edges-convention, scales/MISSING stock-values-for-scales, scales/speed-bands-exact-edges, scales/sight-band-anchor, scales/range-band-anchor, scales/cooldown-bands-exact-edges, scales/cost-edge-and-raw, armour/directional-threshold, armour/damage-reduction-threshold.

**What clashed:** the edge rules agree across speed, sight, range, price and cooldown (checked: speed and price match validate.mjs lines 483 and 494). Two armour texts asked coders to write amounts in armour.notes ("say how much"), which the no-figures rule forbids, and damage-reduction's threshold needed the edge rule stated. Settled below.

**p6, scripts/build-docs.mjs Conventions:** new bullet after Granularity:

> - **Bands with numbers.** Ratio bands (speed, sight, range) compare a unit with its own game's reference unit, named in the games registry. A ratio exactly on an edge goes to the band nearer medium. Threshold bands (price, cooldown) give each band's lowest value, so a value exactly on an edge takes the higher band. Divide the figures as the sources give them and round only the result. Only cost_band.raw and mobility.speed_raw hold stat figures. Every text field of a unit (basis, notes, summaries, uncertain notes and source notes) gives prices, speeds, reaches, sight, cooldowns, damage and armour values as comparisons in words ("about twice the rifle's reach", "takes a few seconds", "a little more from behind"), never as figures. Names, patch numbers, dates and counts (seats, missiles) are fine.

New bullet right after it:

> - **Stock values.** Every band describes the stock unit at the version researched: no researched or bought upgrades, no veterancy, no temporary buffs, in its default mode. Put what upgrades change in notes, and what another mode changes in modes. An ability or weapon that an upgrade unlocks is still recorded (ability source upgrade, weapon slot acquired); only its bands are taken as unlocked, before further upgrades. A loadout pick is not an upgrade: each field's own rule says how picks are recorded.

**p5, data/vocab/armour-models.json** directional `source_rule`:

> Code it when the unit's own data, or a rule its game applies to every unit of its kind, makes side or rear hits do more, however little; say in armour.notes, in words, how much more. Leave it out when neither gives this unit facing values, even if some other units of its game have them.

(The RA3 example change from armour/directional-threshold stands.)

damage-reduction `source_rule`:

> Code it only when the game takes a fixed amount off each hit, and that amount changes which weapons work: the weapon of the game's basic rifle infantry loses a quarter or more of each hit to it. Judge the unit as bought, without upgrades. A smaller value only trims hits; mention it in armour.notes, in words. A cut by percentage or by damage type (guns doing half damage to tanks, small arms doing nothing to vehicles) belongs to the armour class and the damage map, not to this model.

(Examples as in the reviewer's revision.)

---

## C4 RA3 sample fixes (every change once)

**Proposals:** identity/sample-td-primary, identity/sample-ifv-secondary, identity/sample-td-size, identity/sample-hammer-lineage, scales/ra3-ifv-sample-fix, crew/hammer-mount-sample, crew/on-death-notes (sample notes), structure/ra3-sample-fixes, weapons/sample-fixes-ra3, armour/sample-matchup-fixes (parts without negation).

**What clashed:** scales wanted the bark and roar short; its reviewer showed the changelog gives them long, and weapons keeps them long. Scales changes the Cryo and Bow ranges and weapons changes their targets: both apply. armour/sample-matchup-fixes' '!hits:low-air' edits and the drone's weakness rewording depend on negated links, which are deferred: they are not applied, and the Hammer's weakness stays on weapon:cannon.

All in **p9, data/units/ra3.json**. Then run the validator (expect no new atypical entries and one fewer: the Yuriko structure entry goes), copy-check the new sentences, and rebuild docs/samples.md.

**ra3.soviet.terror-drone**

| Path | Old | New |
|---|---|---|
| roles.primary | infiltrator | anti-armour |
| roles.secondary | [disabler, scout] | [scout, disabler] |
| body.size | tiny | small |
| body.notes | (current) | "A spider-like robot that looks smaller than a soldier. Although it comes from the vehicle factory, the game handles it like infantry: it fills an infantry seat in troop transports, so it is coded small. It heals only at a captured hospital or dry dock or at top veterancy, not from an engineer's medical tent or from repair drones." |
| uncertain, path body/size, note | (current) | "Sources call it small or diminutive and no source compares it with a soldier; it is coded small because it fills a soldier's seat in transports." |
| memorable | "A tiny, disposable robot ..." | "A small, disposable robot ..." (rest unchanged) |
| as_player | "drawn tiny, but its hitbox is soldier-sized and outlined" | "drawn small and low, with a soldier-sized hitbox outlined" |
| abilities[1] ('Escape from destroyed host', triggered, infest-vehicle) | present | deleted; its text moves into armament[0].summary |
| armament[1].patterns | [disable-machine] | [switch-weapon-mode, disable-machine] |

Unchanged on purpose: claws blades, melee damage, attach; stasis ray emp, emp, beam, root; weaknesses (range:melee keeps its reason).

**ra3.soviet.hammer-tank**

| Path | Old | New |
|---|---|---|
| lineage | hammer-tank | field removed |
| armament[0].mount (85 mm cannon) | free-aim | slow-turret |
| armament[1].mount (Leech Beam) | free-aim | slow-turret |
| armament[0].can_target | [infantry, ground-vehicle, structure] | [infantry, ground-vehicle, structure, naval] |
| armament[1].patterns | [leech-weapon-on-kill] | [switch-weapon-mode, leech-weapon-on-kill] |
| as_player | (current) | insert after the first sentence: "The turret turns slowly, so a close flanker can get round it." |
| countered_by | [..., unit:ra3.soviet.terror-drone] | insert before the unit link: {"ref": "pattern:infest-vehicle", "why": "Infesting drones ride inside it, where its weapons can't reach them, or pin it with a ray."}; keep the unit link |
| on_death.notes (new field) | none | "A Soviet protocol the player can pick makes destroyed Soviet vehicles release a Terror Drone; that is a faction power, not this unit's own outcome." |

Unchanged: crew solo, proposal; on_death [bail-out], proposal; weaknesses[0] weapon:cannon (its reason already says it can't hit aircraft).

**ra3.allied.multigunner-ifv**

| Path | Old | New |
|---|---|---|
| sensors.traits | [radar] | [] |
| sensors.notes | (current) | "No cited page gives a vision range, so the sight is the medium proposal. The source gives it no radar; a player version could add a warning against aircraft." |
| roles.secondary | [support, anti-infantry] | [raider, anti-infantry] |
| abilities[1] (Evacuate) | present | deleted |
| armament[0].patterns (launcher) | [passenger-sets-weapon] | field removed |
| armament[0].can_target | [low-air, high-air, ground-vehicle, infantry] | add structure, naval |
| armament[1].can_target (repair tool) | [ground-vehicle] | add naval |
| armament[2], [3] (bark, roar) | range long | range stays long; in the note of the IFV wiki source, add in words that its beta patch 1.3 changelog raised the dog's and bear's reach to twice the Conscript rifle's |
| armament[4].can_target (Peacekeeper) | [infantry, ground-vehicle] | add structure, naval |
| armament[5] (Javelin) can_target | [ground-vehicle, naval] | [ground-vehicle, naval, infantry, structure]; no air layer; traits stay [magazine] |
| uncertain, path armament/5/can_target, note | (current) | "No cited source says the Javelin version attacks aircraft, so no air layer is listed." |
| armament[7].family (Tanya) | machine-gun | small-arms; delivery stays hitscan |
| uncertain, path armament/7/family, note | (current) | "The wiki calls the mounted guns autocannons, but they copy Tanya's own pistols, so they keep her small-arms family." |
| armament[8] (Cryo) | range long | range medium; can_target add structure, naval |
| armament[9].can_target (Conscript) | [infantry, ground-vehicle] | add structure, naval |
| armament[11].can_target (Tesla) | [infantry, ground-vehicle, structure] | add naval |
| armament[12].when (Desolator) | unit:ra3.soviet.desolator-trooper | unit:ra3.soviet.desolator; can_target add structure, naval |
| armament[14].can_target (Imperial Warrior) | [infantry, ground-vehicle] | add naval |
| armament[15] (Tankbuster) | range long | range stays long; can_target add naval |
| armament[17] (Bow) | range long | range medium |
| armament[18] (Yuriko) | can_target [infantry, ground-vehicle, structure] | [infantry, ground-vehicle, naval]; range stays medium |
| atypical entry at armament/18/can_target ('weapon-families:psionic allowed.target-types structure') | present | deleted |
| strengths and weaknesses: passengers:>=1 | passengers:>=1 | passengers:1 (reasons unchanged) |
| countered_by | [..., unit:ra3.soviet.terror-drone] | insert before the unit link: {"ref": "pattern:infest-vehicle", "why": "An infesting drone kills it from inside unless an engineer passenger, repair drones or a repair station removes it."} |
| on_death.notes (new field) | none | "In the source the rider dies with the car; the player version throws both players out hurt, as bail-out says." |

Unchanged on purpose: armament[2], [3] infantry only; [6] Spy infantry; [10] flak air only; [13] Natasha and [16] Shinobi sniper, infantry; the Imperial Warrior's kinetic damage and its atypical entry; both stun atypical entries; armament[0] body-aim and range long; crew; on_death [bail-out], proposal.

**docs/examples/concept-card.example.json:** no change needed (checked against every applied rule); re-validate only. **data/patterns/*.json:** no change; source_units stay as they are after the deletions above (infest-vehicle keeps the drone through the claws, passenger-sets-weapon keeps the IFV through its passengers and passive).

---

## C5 Speed bands under method A

**Proposals:** scales/speed-method-a (carrier), scales/speed-bands-exact-edges, scales/MISSING speed-bands-from-words, scales/stationary-mode-no-speed (one sentence), scales/speed-raw-rule, identity speed review (raider and scout).

**p2, data/vocab/speed-bands.json** list description:

> Speed as a ratio to a reference unit. For source units it is the game's speed reference, named in the games registry: usually its basic rifle infantry, or a basic bot or medium mech where the game has none. Every unit of the game is compared with it, vehicles and aircraft included. For generated cards it is a Shamble Frontlines soldier. Compare the speeds each can keep up for as long as it likes: count a sprint or a boost only when nothing limits it (no meter, stamina or cooldown), for the reference and the unit alike. Use the stock unit: no upgrades, empty, at full health. Use the way it moves in a fight: flying speed for units that fight in the air, water speed for boats, land speed for the rest, amphibious and hover units included. Use plain open ground: the off-road speed where a game gives road and off-road speeds, off creep, with no other terrain bonus. A ratio exactly on an edge goes to the band nearer medium: 0.7 is slow, 1 and 1.5 are medium, 2.5 is fast. The validator computes the band from speed_raw the same way. With no usable figure, use comparisons. A source that compares the unit with a unit that has a band ("faster than the Prowler", "keeps pace with infantry") gives that unit's band, moved one band only when it says much faster or much slower. A speed word on its own ("fast", "slow moving") sets the band of the same name only where the registry's speed_reference says the game's words are read that way (Halo Wars 2, World in Conflict); elsewhere it describes the unit among its own kind, so put it in notes. With nothing usable, judge from figures for neighbouring units or from footage, and add an uncertain entry for mobility/speed. Source units have no band for standing still.

Term descriptions: very-slow "Under 0.7 times the reference."; slow "From 0.7 up to but not including 1 times the reference."; medium "From 1 up to and including 1.5 times the reference. The reference unit itself is medium."; fast "Over 1.5 and up to and including 2.5 times the reference."; very-fast "Over 2.5 times the reference."

**p6, schemas/source-unit.schema.json** `mobility.speed` description:

> Ratio to the game's speed reference (see Speed bands), for every unit, vehicles and aircraft included. For a vehicle or aircraft, also say in mobility.notes, in words, how it compares with the game's standard tank (an aircraft: with the game's other aircraft).

`mobility.speed_raw`: the reviewer's text in scales/speed-raw-rule, unchanged (it already defers to the Series games convention, C2).

**p8, data/games.json** `battlefield.speed_reference`, append only after checking the Battlefield Wiki's Vehicle Boost page: "Vehicle boost has no meter from Battlefield 3 on, so compare boosted top speeds (Battlefield 4 M1 Abrams 56 km/h)." If the page shows a meter or cooldown, append instead: "Vehicle boost is limited, so compare top speeds without it (Battlefield 4 M1 Abrams 40 km/h)."

**No change, but recorded:** raider and scout keep requires speed:>=fast. Under method A every shooter vehicle meets it, so the roles rules (identity/roles-primary-procedure step 5, identity/roles-secondary-ranking step 4, identity/scout-needs-information) also ask for light or no armour, or an information part. The tracks speed limit will flag PS2, Wargame and Broken Arrow tanks as atypical; turning that limit into a rarity under 4B is left for later (see Mustafa item 1).

---

## C6 Modes

**Proposals:** structure/modes-parts (carrier), scales/stationary-mode-no-speed, crew/MISSING mode-mobility-and-handling, armour/MISSING mode-armour-only-when-changed, crew/handling-default (modes clause), structure/when-and-alternate (base form).

**What clashed:** modes-parts said the deploy ability and the deploy-anchor trait "already record that it stands still"; the scales reviewer showed that burrow and some transforms stop a unit with no deploy-anchor. That clause is dropped. The card side (concept-card parts.modes[].mobility required) is deferred.

**p6, schemas/source-unit.schema.json**

`unit.modes` description:

> Second forms that change how the unit moves or what it is: deploy, siege and transform modes. The base form is the form the unit is built or bought in; if it can be built in either, it is the form whose name the unit carries. A weapon swap alone is not a mode (see Paired entries). Write only the parts that change from the base form; the unit's own class, body, armour and mobility hold for every mode that leaves them out.

`$defs.mode.mobility` description:

> Only when the mode moves differently from the base form: a new base, handling or speed. Leave it out when the mode keeps the unit's movement or cannot move at all; when it cannot move, say so in the mode's summary. Its handling follows the Handling tie-break from the mode's own mobility type.

`$defs.mode.armour` description: "Only when the mode's armour class or models differ from the unit's. Leave it out when they stay the same."

**p2:** "Source units have no band for standing still." is the last sentence of the speed-bands description (C5).

**Pilot result:** Siege Tank siege mode is id, name, via and summary only, for all three (A drops class, body, armour and the very-slow mobility; B drops class and body; C drops class).

---

## C7 Resources, ammo and per-use costs

**Proposals:** scales/resources-team-stock (carrier), armour/resource-pay-per-use (deferred), weapons/magazine-and-self-refilling-ammo, scales/cooldown-bands-exact-edges (stock clause).

**What clashed:** scales says a per-use price from a shared stock is not a resource; armour adds a pay-per-use resource term. Settled for 1.0: no new term (Mustafa item 2 can reverse it). The limited-ammo text also had to agree with weapons' magazine and finite-ammo texts (stock that never refills, stock that refills itself).

**p2, data/vocab/resources.json** list description:

> A gauge on the unit itself that shapes how it plays. A card has at most one. A price paid from the team's or player's shared stock (Company of Heroes munitions, money for an upgrade) is not a resource; say in the ability's summary, in words, that each use draws on that stock.

limited-ammo description:

> Total ammo is finite and does not come back on its own over time; only a supporter, a pickup or the base refills it, if anything does. Ammo that comes back on its own is the weapon's magazine trait, not this.

**p4:** weapons/magazine-and-self-refilling-ammo as revised (no change here). **p2:** the cooldown-bands sentence "An ability held back only by a stock, such as Company of Heroes munitions or the unit's energy, has no band unless the source also gives a cooldown." stands.

If Mustafa approves pay-per-use: add armour/resource-pay-per-use's revised term and list description, and replace the second and third sentences of the resources description above with the reviewer's text.

---

## C8 Loadout picks: sensors against armour; the thermal optics

**Proposals:** scales/sensor-traits-default-fit-only, scales/sensors-basis-sight-only (traits text), armour/MISSING armour-models-from-picks, armour/armour-model-cap-order, armour/covered-field-gaps (sensors line), armour/sensor-thermal (deferred), structure/ability-count-rules, structure/ability-without-pattern, scales/sensor-gaps-no-change.

**What clashed:** sensor picks go to notes, while armour picks count as models. Both stand, and each list says why. The helicopter's thermal optics fall between: no sensor term (deferred), not a numbers-only button.

**p2, data/vocab/sensor-traits.json** list description, append:

> For source units, list only the traits the stock unit has whatever its loadout. A sensor from a loadout pick, an upgrade or veterancy goes in sensors.notes. Never add a trait as a proposal.

**p6, schemas/source-unit.schema.json** `sensors.traits` description:

> Always-on sensor traits the stock unit has in every loadout, as the source gives them (see Sensor traits). A sensor from a loadout pick, an upgrade or veterancy goes in sensors.notes. Never proposed. Required, so none is an explicit empty list.

**p5, data/vocab/armour-models.json** list description. Replace "A card has one or two; a researched unit up to three." with:

> A card has one or two; a researched unit up to three. If more apply, first keep the models the unit has without any loadout pick; then keep the rarest (rare, then uncommon, then common; on a tie, the one listed first here). Name the others in armour.notes.

and append (after the shared-bonuses-not-models sentence):

> A model that only an optional loadout pick gives (reactive armour, an auto-repair module, a shield item) still counts; say in armour.notes that it is a pick. Sensor traits differ: a sensor pick goes to sensors.notes, because a pick that changes how a unit is hit changes what beats it, while a sensor pick rarely does.

**Thermal optics on the attack helicopter:** recorded as a toggle ability (source loadout, seat gunner) with an empty patterns list and a fit_note at abilities/<i>/patterns wanting a 'switch vision mode' pattern. Zoom is left out (numbers only). Expected abilities: flares, ECM, extinguisher (one exclusive_group) and the optics toggle, for all three coders.

---

## C9 Paired entries and the passenger patterns

**Proposals:** structure/paired-entry-patterns (carrier), structure/upgrade-weapons (upgrade and rank sentences), structure/MISSING transport-passive, structure/MISSING pattern-notes-contradictions.

**What clashed:** the notes in research/registry-notes/patterns.md (line 7 and the fold-in row at line 90) send firing from inside a vehicle to carry-passengers, while the written pattern data/patterns/passenger-sets-weapon.json has a fire-ports variant and transport-passive sends firing seats there. carry-passengers' registry summary ("or fight from it") claims the same. Settled for the written pattern: firing seats link passenger-sets-weapon; carry-passengers is trimmed; the notes are corrected.

**p6, scripts/build-docs.mjs Conventions:** new bullet 'Paired entries', replacing the pair sentences of 'Weapons vs abilities':

> - **Paired entries.** Some weapons always come with an ability, and both entries of the pair link the same patterns. A weapon swapped in by an ability is an alternate weapon plus a toggle ability (deploy when the unit cannot move in one of the two states). Both link one swap pattern: the mode's own pattern (its modes[].via, such as deploy-siege-mode) when the swap comes with a mode, otherwise switch-weapon-mode. Both also link the pattern of what the swapped-in weapon does, if one fits. The weapon that is swapped out links no swap pattern. A weapon gained from a kill or a wreck is an acquired weapon plus a triggered ability, both linking the gain pattern (leech-weapon-on-kill). A weapon added by a bought upgrade or research has no ability; it links upgrade-in-field when the upgrade reaches units already in the field (bought on the unit, or for all of them at a building), and no pattern when only units built later get it. A weapon that comes with a rank links earn-veterancy. A unit with passenger seats gets one passive ability for them, source innate. It links passenger-sets-weapon when riders set its weapon or fire their own from it (passenger-module or passenger-firing seats), and carry-passengers otherwise (passenger-cargo seats), never both; each passenger weapon links passenger-sets-weapon too. The weapon used when nobody rides inside is a plain primary and links no passenger pattern. Load and unload buttons stay off (universal keys).

Granularity bullet, append: "A swapped-in weapon is still a weapon, so neither it nor its toggle links a pattern that mirrors its family or trait (a drain beam on a toggle links no drain-health). The mirroring patterns are mark-target, suppress-with-fire, leave-hazard-zone, drain-health, launch-drones, reveal-area and heal-self."

**p8, data/pattern-registry.json** carry-passengers summary: "Carry teammates inside a vehicle or building, protected, and let them out where needed."

**p8, research/registry-notes/patterns.md**

- line 7, second sentence: "Firing from inside a vehicle (ports or an open top) goes to passenger-sets-weapon's fire-ports variant, with the seat role `passenger-firing`; carry-passengers is for riders who cannot act until they get out."
- line 90, last cell: "passenger-sets-weapon (fire-ports variant), with seat role `passenger-firing`"
- the rows and opening line from structure/MISSING pattern-notes-contradictions (timed charge, control point, "the summary wins").

**Pilot result:** IFV keeps one passive linking passenger-sets-weapon; Evacuate goes (C4). Terror Drone and Hammer swaps link switch-weapon-mode plus their effect pattern on both entries; the Siege Tank links deploy-siege-mode only.

---

## C10 Pattern links, retreat and the game-wide lists

**Proposals:** structure/pattern-link-rule (carrier), structure/pattern-source-units (its Conventions sentence), structure/shared-mechanics, structure/ability-without-pattern, armour/pattern-retreat-to-base, armour/pattern-fortify-point (deferred), crew/boost-not-retreat, identity/role-boundaries and identity/keep-anti-armour-infest (sticky charges), identity/official-role-lines-registry (README line).

**What clashed:** armour wanted every CoH squad to record Retreat as an ability linking a new retreat-to-base pattern; shared-mechanics (a must) keeps retreat, reinforce, veterancy and the like off units. Settled for shared-mechanics: retreat stays off units and is listed once per game; retreat-to-base is added as a planned id so that list can name it. The sticky bomb goes to throw-explosive (not infest-vehicle), which also answers identity's open question. The Observation Post is kept with an empty pattern list (fortify-point deferred to the gap report).

**p6, scripts/build-docs.mjs Conventions:** new bullet 'Pattern links' after Paired entries:

> - **Pattern links.** Link a pattern when the ability or weapon gives the player the same interaction and the enemy the same counterplay as the pattern's summary. Fiction, delivery and size don't matter (see Granularity). Link a second pattern only when it passes the same test on its own: an ECM that hides you from radar and breaks locks links jam-sensors and fire-countermeasures. Do not link a pattern for a part that only looks like it. capture-structure needs an enemy building, so taking over a neutral one is not it. A thrown sticky bomb is throw-explosive, not infest-vehicle, because nobody latches on. Ending your own burning or disabled state on a key links heal-self, unless the patterns group adds a pattern for it. A retreat-to-base order is a game-wide mechanic in most games (see Shared mechanics); where a unit does record one, it links retreat-to-base, never dash or brace. When research/registry-notes/patterns.md disagrees with a pattern's summary, the summary wins. If nothing fits, keep the ability, leave its patterns empty and add a fit_note (see abilities[].patterns). Link any registered id, written or planned. Never edit pattern files: the merge pass fills their source_units with npm run sync-patterns.

**p8, data/pattern-registry.json**, new planned entry: {"id": "retreat-to-base", "name": "Retreat to base", "category": "mobility", "summary": "On a key, run back toward base faster and harder to hurt, unable to fire on the way."}

**p8, research/registry-notes/README.md**, add two lines after "read the note for your batch first":

> Read the official role line first; roles depend on it. Where a game's tooltips have strong-against or weak-against lines, the note for that game says so, because roles step 4 reads them.
>
> Each game's note has a section Game-wide mechanics, written before any unit of that game is coded. Coders follow it; a mechanic that may be game-wide but is not listed is coded on the unit with a fit_note, and the merge pass decides.

**p8, research/registry-notes/games-r4.md**, coh1 section Game-wide mechanics: "Retreat (retreat-to-base); reinforce (reinforce-squad); veterancy (earn-veterancy); re-crewing abandoned team weapons (recover-wreck); picking up dropped weapons (leech-weapon-on-kill); garrison (carry-passengers); point capture (a game-mode rule, no pattern; a unit that captures faster says so in strengths)." Then name, for each mechanic, the units that lack it, after checking the Company of Heroes Wiki. Write the same section for ra3 (starting points from structure/shared-mechanics: veterancy, garrison, protocols as side-wide powers; evicting passengers is a universal key), sc2 and battlefield (starting points: eject, seat switching, parachutes) now, and for each round-2 holdout game before round 2 starts.

**Pilot result (Riflemen, all three):** Throw Grenade, Throw Sticky Bomb (throw-explosive), Suppression Fire (suppress-with-fire only), Upgrade to Barracks (host-spawn-point only), build defences (build-cover), lay mines (lay-mines) and the Observation Post (empty patterns, fit_note wanting 'fortify a held capture point'): 7 abilities. No Retreat, Reinforce or Veterancy.

---

## C11 One weapon that acts differently by target

**Proposals:** structure/weapon-entry-count rule (1), weapons/damage-decision-order step 5, weapons/delivery-field-rule.

**What clashed:** structure said to code such a weapon "as it works against its main target"; weapons said its damage takes the family default when categories differ by target, and its delivery follows a fixed order. On the Terror Drone claws, "main target" would give explosive damage (the vehicle category) while step 5 gives melee. Settled: the field rules for damage and delivery win; "main target" governs family and traits.

**p6, Weapon entries bullet, rule (1)** (replaces the reviewer's rule 1):

> (1) One in-game weapon is one entry, even when it acts differently against different targets. Code its family and traits as it works against its main target: the target its primary role is about, or else the one the source names first. Its damage and delivery follow their own rules (armament[].damage step 5 when its damage category differs by target; the order under armament[].delivery). List every target it can hit, and put the other behaviour in the summary.

**Pilot result:** claws: one entry, blades, melee damage, attach, targets infantry, ground-vehicle, naval, for A, B and C and the sample.

---

## C12 Cited sources and the source cap

**Proposals:** weapons/MISSING weapon-source-coverage (carrier), weapons/no-change-knockback-reading, identity/confidence-rule (source description), scales/cooldown-bands-exact-edges (mechanic pages), scales/registry-sight-range-reference (eases the cap), armour/uncertain-no-change.

**What clashed:** three rules now ask for more pages than the schema's three-source cap allows on shooter units: the cooldown rule reads a mechanic's own page, source coverage requires the page that lists passenger, mode or loadout weapons one by one, and confidence wants a second site before a third page of one site. The Battlefield helicopter already needs four or five. The cap is part of the approved field list ("1-3 sources"), so raising it is Mustafa item 3.

**p6, schemas/common.schema.json** `$defs.source` description:

> A citation. Paraphrase only; never copy text or images. When another established site covers the unit, cite it rather than a third page of the same site.

**p6, schemas/source-unit.schema.json** `unit.sources`: add the description below, and raise maxItems from 3 to 5 (recommended; needs Mustafa's OK):

> The pages this entry rests on; every field rule reads them together. When the unit's weapons change by passenger, mode or loadout and one page lists those weapons one by one, that page must be among them. Cite a mechanic's own page (flares, an extinguisher) when it gives a figure the entry uses.

If Mustafa keeps three: keep maxItems 3 and add to the description: "A page read but left out for lack of room goes in uncertain, saying what it shows; a band that rests on it is marked uncertain."

---

## C13 Bodies: limited-arc on hull guns and set-up weapons

**Proposals:** crew/crew-model-rts (forced bodies change), crew/mount-order (forced bodies change).

Both ask for the same change; mount-order also needs it on humanoid (set-up machine-gun and gun teams). Under 4B neither is physical nonsense.

**p1, data/vocab/bodies.json** allowed aim-models:

- hull-turret: [free-aim, slow-turret, auto-target, limited-arc]
- multi-turret: [free-aim, slow-turret, auto-target, limited-arc]
- humanoid: [free-aim, body-aim, radial, limited-arc]

---

## C14 Slugs for units not yet researched

**Proposals:** structure/passenger-entries (rider ids), armour/matchup-link-guidance item (8), identity/lineage-rule (naming).

All three say the same thing in different words. One rule, in the Ids bullet; the others point to it.

**p6, scripts/build-docs.mjs Conventions**, Ids bullet, append:

> A link to a unit not yet researched (a rider, a rival in matchups, a lineage) uses the slug its entry would get: its in-game name by these rules, dropping a final word such as Squad or Team (Riflemen Squad -> riflemen).

The lineage description (identity/lineage-rule, revised) stays as written; its "make one from its name by the id rules, leaving out words such as Squad or Team" matches.

---

## C15 scripts/agreement.mjs: one change set

**Proposals:** crew/MISSING agreement-per-weapon-and-basis (carrier), crew/seat-leave-out-driver (missing seat = driver), crew/on-death-plain-death (measure on_death.basis), structure/ability-source-required (optional default filling), structure/atypical-follows (derived label), identity/confidence-rule side effect (measure confidence, lineage and source kinds; confidence agreed 55.6% and is not measured today).

**p7, scripts/agreement.mjs and its tests:**

1. Before comparing, fill documented defaults: armament[].seat and abilities[].seat -> driver; abilities[].source -> innate; armament[].affects -> enemies; body.count -> 1.
2. New readers: `one('crew.basis', u => u.crew?.basis, { proposal: 'partly' })`; `one('on_death.basis', u => u.on_death?.basis)`; `set('armament (seat, family, mount)', u => each(u.armament, w => `${w.seat ?? 'driver'}/${w.family}/${w.mount ?? '-'}`), { proposal: true })`; `one('main weapon.mount', u => mainWeapon(u)?.mount, { proposal: true })`; `one('main weapon.seat', u => mainWeapon(u)?.seat ?? 'driver', { proposal: true })`; `one('confidence', u => u.confidence)`; `one('lineage', u => u.lineage ?? '(none)')`; `set('sources.kind', u => each(u.sources, s => s.kind))`.
3. Mark armament.seat as partly proposal, and print 'atypical rules' as derived (information only).
4. A test for each new reader and for the default filling.

---

## C16 Matchups without negated links

**Proposals:** armour/matchup-link-guidance (carrier), armour/negated-links (deferred), armour/sample-matchup-fixes (C4).

Negated links are deferred (new kind of typed link; Mustafa item 5), so item (5) of the guidance and every '!' example are rewritten.

**p6, scripts/build-docs.mjs Conventions:** new bullet after Typed links:

> - **Matchups.** Write the reason first, then pick the link that names the part behind it. (1) Name the other unit the way the sources do: by its job (role:anti-armour, role:anti-air) when they name a job; by what it fires when they name a weapon (weapon:machine-gun) or a kind of harm (damage:electric); by what it is (class:aircraft, class:infantry, armour-class:heavy) when they name a kind of unit. When they name only a unit, use the same order for what makes that unit win. (2) For fliers, use class:aircraft when the sources mean air units in general; use target:low-air or target:high-air only when the point holds for one layer. (3) Prefer word-list and pattern links. Add a unit: link only for a same-game partner or rival the sources name, next to a word-list or pattern link for the same reason. A link to the unit itself is fine in combos when the sources say it works best in numbers. (4) In strengths and weaknesses, give the unit's own value with no <= or >= (range:long, not range:>=long; passengers:1, not passengers:>=1). Use comparators only in counters, countered by and combos, for a group of units. (5) Something the unit lacks (no weapon reaches aircraft) is not a link of its own: put the enemy that exploits it in countered by (class:aircraft), and if you also list it as a weakness, hang it on the part that causes it and name the gap in the reason. (6) The same enemy may sit in counters and in countered by only when the two reasons name different situations. Otherwise put it where the head-on fight at equal cost ends, and give the tactic that turns it in the reason. (7) Most important first; keep each list short, about two to five. A link to a planned pattern is fine; its warning clears when the pattern is written. (8) A unit: link to a unit not yet researched uses the slug its entry would get (see Ids).

Append "See Matchups under Conventions." to the descriptions of strengths, weaknesses, counters, countered_by and combos in schemas/source-unit.schema.json.

---

## C17 scripts/validate.mjs: every new check in one list

**Proposals:** crew/seat-leave-out-driver, crew/seat-and-primary, structure/main-weapon-and-slots, structure/passenger-entries, structure/when-and-alternate, crew/mount-order, crew/crew-model-rts, crew/on-death-plain-death, crew/handling-default, crew/MISSING solo-fallback-only-multi-seat, structure/pattern-source-units, structure/ability-without-pattern, armour/paths-and-fit-notes. Deferred: weapons/anti-air-trait-rule's warning, crew/boost-not-retreat's two-way check.

Source units unless stated. One test per check in tests/validate.test.mjs.

| # | Check | Level | Message |
|---|---|---|---|
| V1 | a weapon or ability has seat 'driver' | error | seat 'driver' is the default; leave it out |
| V2 | a seat that is not in crew-models[model].seats, crew.seats[].role or crew.passengers.kind | error | seat '<x>' is not a seat of this unit |
| V3 | more than one primary weapon, or a primary that is not armament[0] | error | a unit has at most one primary weapon, listed first |
| V4 | the primary has a seat while another weapon has none (so the driver has a weapon) | error | the driver has a weapon, so the primary is the driver's: leave its seat out |
| V5 | an option_group that is neither a loadout group (option entries plus at most one primary or secondary entry, which has default: true) nor an upgrade group (acquired entries only, none with default); an option entry without option_group; default: true outside a loadout group | error | as the case |
| V6 | 'when' on a weapon that is not a passenger weapon; a passenger weapon without 'when' | error | 'when' is for passenger weapons only, and every passenger weapon needs one |
| V7 | body-aim on a weapon with a seat other than driver (source units and example cards) | error | body-aim is fired from the driver seat |
| V8 | crew.basis in-game, in a game whose registry control is commanded, with a model other than squad | error | an RTS unit has no player seats; use basis proposal |
| V9 | on_death.basis proposal and outcomes not [bail-out] (nature crewed-machine, class not infantry) or not [respawn] (everything else) | error | a proposal death outcome is the 3C default; if the source shows another outcome, set basis in-game |
| V10 | on_death outcome respawn with basis in-game in a game whose registry control is commanded | error | an RTS unit that is simply gone is a proposal |
| V11 | handling differs from the mobility default, the unit is not tiny or small on legs, and mobility.notes is empty | warning | say why the handling differs in mobility.notes |
| V12 | solo_fallback on a crew model whose max_players is 1 | error | solo_fallback is only for multi-seat crew models |
| V13 | crew model squad with body.count missing or 1 | error | a squad needs body.count 2 or more |
| V14 | the two source_units mismatch checks (unit links a pattern that does not list it; source_units differ from the units that link it) | was error, now warning | source_units out of date; the merge pass runs npm run sync-patterns |
| V15 | an ability with an empty patterns list and no fit_note at abilities/<i>/patterns with a wanted text | error | an ability with no pattern needs a fit_note naming the mechanic wanted |
| V16 | a fit_notes, uncertain or sources[].supports path that contains '.' or '*', or whose parent does not exist on the unit | warning | write paths with / and real positions |

Also in p7: new scripts/sync-patterns.mjs (rewrites source_units of each written pattern from the units that link it through abilities, weapons and modes[].via; --check lists stale files and exits 1), a package.json script for it, npm run check running sync-patterns --check, and the README lines from structure/pattern-source-units (research agents run npm run validate only; the merge pass runs sync-patterns, then docs, then check).

Schema-side (p6, not validator code): $defs.ability.patterns loses minItems 1; $defs.ability.required gains source; crew.basis enum loses lore; on_death gains notes.

---

## C18 The Proposals vs facts bullet

**Proposals:** scales/sensors-basis-sight-only (sensors part), crew/seat-and-primary (seat provenance), crew/crew-model-rts (lore dropped).

**p6, scripts/build-docs.mjs Conventions**, Proposals vs facts bullet (whole text):

> - **Proposals vs facts.** Fields marked *proposal* (handling, weapon mount, flavour affinity and 'as a player'), weapon and ability seats unless crew.basis is in-game, crew and on-death wherever their basis says 'proposal', and the sight band where sensors.basis says 'proposal', are our design suggestions for a player version. The checker skips them and confidence covers only sourced facts.

---

## C19 Boost against speed

**Proposals:** crew/boost-not-retreat (boost wording), scales/speed-method-a (an unlimited boost counts in the speed; flagged by its reviewer).

An unlimited boost counted in the speed band must not also be recorded as the boost trait.

**p3, data/vocab/mobility-traits.json** boost description:

> A short burst of speed or a dash, on a key, usable anywhere. An order that sends the unit running back to base, like Company of Heroes retreat, is not boost, and its ability links no dash pattern. A boost with no meter, cooldown or other limit is part of the unit's speed (see Speed bands), not this trait.

(The list-description sentence and the two-way validator check of crew/boost-not-retreat are deferred.)

---

## C20 Registry files that several proposals touch (p8)

No text conflicts; one implementer should apply these in one pass per file. Each bullet's text comes from the named proposal.

- **data/games.json:** schema fields first (p6: sight_reference, range_reference optional), then sight_reference and range_reference for all 28 games, pilot values from scales/registry-sight-range-reference, Wargame (and Broken Arrow if its unit lists show a grade) optics grades from scales/MISSING registry-optics-grades; then make both fields required (p6). battlefield.speed_reference (C5) and version_researched (C2); sc2.speed_reference sentence from scales/cooldown-bands-exact-edges.
- **games-r1.md:** RA3 role-line note (identity/official-role-lines-registry), RA3 Magic and Spectrum bullet and the RA2 damage line (weapons/damage-map-binding-registry), RA3 armour bullet (armour/armour-registry-notes), RA3 Game-wide mechanics (C10).
- **games-r2.md:** TW damage exception (weapons), TD/TS/TW armour line (armour).
- **games-r3.md:** Tempest Rising laser exception (weapons).
- **games-r4.md:** CoH role-field note (identity), CoH armour line (armour), coh1 Game-wide mechanics (C10).
- **games-r5.md:** SC2 Armory and Hellbat (scales/sc2-armory-note), SC2 armour attributes (armour), SC2 in-game description note (identity), DoW2 laser and melta exception (weapons), SC2 Game-wide mechanics (C10).
- **games-r6.md:** Battlefield mirrored archetypes and class names (identity), PS2 and MechWarrior damage notes (weapons), Battlefield Game-wide mechanics (C10).
- **patterns.md:** C9 and structure/MISSING pattern-notes-contradictions.
- **README.md:** C10.
- **data/pattern-registry.json:** retreat-to-base (C10), carry-passengers summary (C9).

---

## C21 Roles against the slot rules

**Proposals:** identity/roles-primary-procedure, identity/roles-secondary-ranking, structure/main-weapon-and-slots (C1).

**What clashed:** (a) The roles texts leave out "option weapons (even the default pick)", but under C1 the default choice of a loadout group holds the primary or secondary slot, so the same weapon would both count (primary slot) and not count (default pick). Settled for C1: roles read slots; only option entries count as loadout picks. (b) Primary step 2 sends every unit whose driver fires nothing to a non-fighting job. Under C1 a Foxhole light tank's main gun sits in the gunner seat, and no non-fighting job fits a tank. Settled: step 2 covers only units built to carry, supply, build or spy.

**p6, schemas/source-unit.schema.json**, edits to the reviewer's revised texts:

In `roles.primary` (identity/roles-primary-procedure), replace "Passengers, upgrades, doctrines, option weapons (even the default pick) and proposal fields never count." with:

> Passengers, upgrades, doctrines, option weapons and proposal fields never count; the default choice of a loadout group counts, because it holds the primary or secondary slot.

and replace step 2 with:

> 2. Not a fighter. If the unit is unarmed, or its only weapon is a tool, or it is built to carry, supply, build or spy and its guns are fired only from gunner or passenger seats (a transport helicopter's door guns), use the job of its main button or main action: transport, support, engineer, logistics or infiltrator. A combat vehicle whose main gun is fired from a gunner seat (a Foxhole light tank) goes on to step 3.

In `roles.secondary` (identity/roles-secondary-ranking), replace "5. Passengers, upgrades, doctrines, loadout picks (option weapons, the default pick included) and acquired weapons." with:

> 5. Passengers, upgrades, doctrines, option weapons and acquired weapons.

**Pilot result (unchanged):** helicopter primary raider (step 5). Secondaries [anti-infantry, anti-armour]: anti-infantry at step 3 (the splash rocket pods and chin cannon), anti-armour at step 5 (the TOW, guided and TV options outnumber everything else); anti-air is dropped because official text calls it limited. The other five units are not affected.

