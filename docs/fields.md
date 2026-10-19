<!-- Generated from the JSON in data/ and schemas/. Edit the JSON, not this file. -->

# Field reference (draft v1.0.0)

Every field of every record type, generated from the JSON schemas in `schemas/`. **Vocabulary** names the fixed word list a field draws from (see [vocabularies](vocabularies.md)).

## Conventions

- **Ids.** Lower-case, ASCII, words joined by dashes; apostrophes and full stops dropped, `&` becomes `and`, numbers and roman numerals kept (`mammoth-mk-ii`, `v4-rocket-launcher`). Unit ids are `<game>.<faction>.<slug>`; pattern ids are generic English, verb first (`infest-vehicle`). Expansions are never game ids. The faction id `shared` is reserved for units every side can field. A link to a unit not yet researched (a rider, a rival in matchups, a lineage) uses the slug its entry would get: its in-game name by these rules, dropping a final word such as Squad or Team (Riflemen Squad -> `riflemen`).
- **Typed links** are written `kind:id`, such as `role:anti-air`, `size:<=small` or `hits:high-air`. A link always describes a unit: in strengths, weaknesses and pattern requirements it describes the unit itself; in *counters* the unit it beats; in *countered by* the unit that beats it; in combos the teammate. Ranked kinds accept `<=` and `>=`. Kinds: `class` (is of this class), `role` (has this role (primary or secondary)), `tier` (is this tier), `damage` (has a weapon that deals this damage), `armour-class` (has this armour class), `armour-model` (has this armour model), `weapon` (has a weapon of this family), `mobility` (moves this way), `mobility-trait` (has this mobility trait), `handling` (handles this way), `body` (has this body plan), `size` (is this size), `speed` (moves at this speed), `crew` (has this crew model), `passengers` (has this many passenger seats (a number, usually with >= or <=)), `mount` (has a weapon on this mount), `delivery` (has a weapon with this delivery), `range` (has a weapon with this range), `weapon-trait` (has a weapon with this trait), `target` (is this kind of target (from its mobility and size)), `hits` (has a weapon that can hit this kind of target), `sight` (sees this far through the fog of war), `sensor` (has this sensor trait), `nature` (is organic, a crewed machine or an uncrewed machine), `category` (has an ability whose pattern is in this category), `resource` (uses this resource), `pattern` (has this mechanic pattern (an id in data/patterns)), `unit` (is this source unit (research data only; never on a generated card)).
- **Matchups.** Write the reason first, then pick the link that names the part behind it. (1) Name the other unit the way the sources do: by its job (`role:anti-armour`, `role:anti-air`) when they name a job; by what it fires when they name a weapon (`weapon:machine-gun`) or a kind of harm (`damage:electric`); by what it is (`class:aircraft`, `class:infantry`, `armour-class:heavy`) when they name a kind of unit. When they name only a unit, use the same order for what makes that unit win. (2) For fliers, use `class:aircraft` when the sources mean air units in general; use `target:low-air` or `target:high-air` only when the point holds for one layer. (3) Prefer word-list and pattern links. Add a `unit:` link only for a same-game partner or rival the sources name, next to a word-list or pattern link for the same reason. A link to the unit itself is fine in combos when the sources say it works best in numbers. (4) In strengths and weaknesses, give the unit's own value with no `<=` or `>=` (`range:long`, not `range:>=long`; `passengers:1`, not `passengers:>=1`). Use comparators only in counters, countered by and combos, for a group of units. (5) Something the unit lacks (no weapon reaches aircraft) is not a link of its own: put the enemy that exploits it in countered by (`class:aircraft`), and if you also list it as a weakness, hang it on the part that causes it and name the gap in the reason. (6) The same enemy may sit in counters and in countered by only when the two reasons name different situations. Otherwise put it where the head-on fight at equal cost ends, and give the tactic that turns it in the reason. (7) Most important first; keep each list short, about two to five. A link to a planned pattern is fine; its warning clears when the pattern is written. (8) A `unit:` link to a unit not yet researched uses the slug its entry would get (see Ids).
- **Proposals vs facts.** Fields marked *proposal* (handling, weapon mount, flavour affinity and 'as a player'), weapon and ability seats unless crew.basis is in-game, crew and on-death wherever their basis says 'proposal', and the sight band where sensors.basis says 'proposal', are our design suggestions for a player version. The checker skips them and confidence covers only sourced facts.
- **Weapons vs abilities.** Anything fired with an attack button is a weapon. A shot fired from its own ability button (a grenade, a rocket volley on a cooldown) is an ability, not a weapon. Abilities are counted by the rule under `abilities[]` below. A passive or triggered effect is its own ability only when that rule asks for one: Paired entries asks for it, or the source names the effect and it adds a mechanic. An effect that is part of how a weapon works (an infester hidden inside its host, or escaping when the host dies) stays in that weapon's summary and patterns. A swap is an ability only when the source lists it as an ability or command with its own name (Electro-Stasis Ray, Leech Beam, special-ammo commands). Switching a seat's weapons with number keys or a scroll wheel, as in shooters, is not: each weapon is its own primary, secondary or option entry. A weapon may link a pattern whose generator lists only ability kinds (the drone's claws link `infest-vehicle`). The generator makes that an ability on a card, so do not add one to the source unit. Unarmed units have an empty weapon list.
- **Weapon entries.** Count weapon entries by these rules. (1) One in-game weapon is one entry, even when it acts differently against different targets. Code its family and traits as it works against its main target: the target its primary role is about, or else the one the source names first. Its damage and delivery follow their own rules (`armament[].damage` step 5 when its damage category differs by target; the order under `armament[].delivery`). List every target it can hit, and put the other behaviour in the summary. (2) Among the fixed weapons of one seat, make one entry per family. Copies of one gun are one entry (twin cannons, a squad's five rifles). So are different guns of one family that the seat uses on the same attack order, at once or each against its own kind of target (a sergeant's carbine with the squad's rifles, a ground battery with an air battery). Name them all and list every target any of them can hit. A gun of another family is its own entry. A gun of the same family on its own key or button (a pistol beside a rifle) is its own entry too. Where players set their own fire groups (MechWarrior), each family on a seat is one entry. (3) Rule 2 never merges a loadout choice, or a weapon the unit does not always have. Alternate, passenger, acquired and option weapons are counted by their own rules. (4) Versions of one weapon across the titles of a series entry (the same place in the loadout, renamed or retuned) are one entry. Code the version the Series games convention picks, even when an older version works differently, and put the differences in the summary. (5) Loadout choices for one place are one entry when they would get the same family, damage, delivery, target list and traits. Name them all; range and other numbers may differ. Otherwise each choice is its own entry (Smart Rockets home in, so they are apart). (6) A weapon whose kind depends on the donor is one adaptive acquired entry. Do not list the donors. Weapons gained in fixed steps (salvage crates) get one acquired entry per step that changes the family. (7) Passenger weapons follow the passenger slot rule. Riders who fire their own guns from ports give no entries. (8) Never record an upgrade that only changes numbers, or a weapon the unit gets through a shared mechanic or a universal key (see Shared mechanics).
- **Main weapon.** A unit's main weapon is its one primary entry (see `armament[].slot`). Every other weapon the base form always has is secondary, including a second seat's main gun. The roles rules read the main weapon from this entry, so it is chosen without looking at the unit's roles.
- **Paired entries.** Some weapons always come with an ability, and both entries of the pair link the same patterns. A weapon swapped in by an ability is an alternate weapon plus a toggle ability (deploy when the unit cannot move in one of the two states). Both link one swap pattern: the mode's own pattern (its `modes[].via`, such as `deploy-siege-mode`) when the swap comes with a mode, otherwise `switch-weapon-mode`. Both also link the pattern of what the swapped-in weapon does, if one fits. The weapon that is swapped out links no swap pattern. A weapon gained from a kill or a wreck is an acquired weapon plus a triggered ability, both linking the gain pattern (`leech-weapon-on-kill`). A weapon added by a bought upgrade or research has no ability; it links `upgrade-in-field` when the upgrade reaches units already in the field (bought on the unit, or for all of them at a building), and no pattern when only units built later get it. A weapon that comes with a rank links `earn-veterancy`. A unit with passenger seats gets one passive ability for them, source innate. It links `passenger-sets-weapon` when riders set its weapon or fire their own from it (passenger-module or passenger-firing seats), and `carry-passengers` otherwise (passenger-cargo seats), never both; each passenger weapon links `passenger-sets-weapon` too. The weapon used when nobody rides inside is a plain primary and links no passenger pattern. Load and unload buttons stay off (universal keys).
- **Shared mechanics and universal keys.** Some mechanics belong to the game, not the unit: every unit of its class has them, on its side or in the whole game, apart from a few named exceptions. Examples are basic orders (move, attack, stop, hold, patrol, stances), Company of Heroes infantry that retreat, reinforce, garrison, capture points, pick up dropped weapons and re-crew abandoned guns, and veterancy that every unit earns. Leave them off the unit's weapons and abilities. Each game's list is written once, before any unit of that game is coded, in that batch's registry note (`research/registry-notes/games-r<batch>.md`, section Game-wide mechanics). It names each mechanic, the units that lack it, and the pattern it would link or the pattern wanted. Coders follow the list. A coder who meets a mechanic that may be game-wide but is not listed codes it on the unit and adds a fit_note, and the merge pass decides. If this unit does a listed mechanic better or worse than the rest (it captures faster), say so in its strengths or weaknesses. Leave off actions that match one of our universal keys (enter or leave, pick up, shake off, bail out, switch seat, ping, evict passengers), even when the source gives the unit its own button for it, such as Evacuate. But record what only some unit types gain from such an action (vehicles that turn salvage crates into weapons). Also record a button that does more than the key (troops that rappel onto a building and clear it). A side-wide power (a protocol, doctrine or general's power) that changes every unit of a class is left off too. A power that gives named unit types a new button or a new effect is recorded on each of them, with source commander-power.
- **Pattern links.** Link a pattern when the ability or weapon gives the player the same interaction and the enemy the same counterplay as the pattern's summary. Fiction, delivery and size don't matter (see Granularity). Link a second pattern only when it passes the same test on its own: an ECM that hides you from radar and breaks locks links `jam-sensors` and `fire-countermeasures`. Do not link a pattern for a part that only looks like it. `capture-structure` needs an enemy building, so taking over a neutral one is not it. A thrown sticky bomb is `throw-explosive`, not `infest-vehicle`, because nobody latches on. Ending your own burning or disabled state on a key links `heal-self`, unless the patterns group adds a pattern for it. A retreat-to-base order is a game-wide mechanic in most games (see Shared mechanics); where a unit does record one, it links `retreat-to-base`, never `dash` or `brace`. When `research/registry-notes/patterns.md` disagrees with a pattern's summary, the summary wins. If nothing fits, keep the ability, leave its patterns empty and add a fit_note (see `abilities[].patterns`). Link any registered id, written or planned. Never edit pattern files: the merge pass fills their source_units with `npm run sync-patterns`.
- **Granularity.** Same player-facing interaction and same counterplay = one pattern; differences in fiction, delivery or size are variants. Plain mechanics (sprint, healing yourself, stat buff) get generic patterns that stay out of the top-30 list. A pattern that mirrors a word-list term (a weapon trait or family, an armour model, a sensor trait) is the home for the ability version only; a weapon or always-on effect uses the term. A swapped-in weapon is still a weapon, so neither it nor its toggle links a pattern that mirrors its family or trait (a drain beam on a toggle links no `drain-health`). The mirroring patterns are `mark-target`, `suppress-with-fire`, `leave-hazard-zone`, `drain-health`, `launch-drones`, `reveal-area` and `heal-self`.
- **Bands with numbers.** Ratio bands (speed, sight, range) compare a unit with its own game's reference unit, named in the games registry. A ratio exactly on an edge goes to the band nearer medium. Threshold bands (price, cooldown) give each band's lowest value, so a value exactly on an edge takes the higher band. Divide the figures as the sources give them and round only the result. Only `cost_band.raw` and `mobility.speed_raw` hold stat figures. Every text field of a unit (basis, notes, summaries, uncertain notes and source notes) gives prices, speeds, reaches, sight, cooldowns, damage and armour values as comparisons in words ("about twice the rifle's reach", "takes a few seconds", "a little more from behind"), never as figures. Names, patch numbers, dates and counts (seats, missiles) are fine.
- **Stock values.** Every band describes the stock unit at the version researched: no researched or bought upgrades, no veterancy, no temporary buffs, in its default mode. Put what upgrades change in notes, and what another mode changes in modes. An ability or weapon that an upgrade unlocks is still recorded (ability source upgrade, weapon slot acquired); only its bands are taken as unlocked, before further upgrades. A loadout pick is not an upgrade: each field's own rule says how picks are recorded.
- **Series games.** For a games.json entry of kind series, the counted titles are the lead titles named in `version_researched` and any title named there for the archetype being coded. Only counted titles fill fields; facts from the series' other titles go in notes. When counted titles differ, on whether a mechanic exists or on a value, the newest counted title whose sources speak to it decides, at its final patch; give the other version in notes or in the weapon's summary. A figure that the source says a later patch of that title changed, without giving the new value, does not count for that title. Where the registry entry says where a kind of fact comes from (MechWarrior speeds from the BattleTechWiki), follow the registry. When one archetype mirrors several models, one per side, take figures from the model of the first faction in the registry's list that is not shared, and say which in notes. A matchup may rest on a source about any title, as long as the parts it names exist in a counted title.
- **Copyright.** Paraphrase only, no quoted voice lines or flavour text, no images. Real names are reference only and never reach a generated card.

## Source unit

One researched unit from a real game. File: `data/units/<game>.json`. Schema: `schemas/source-unit.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `id` | unit id | yes |  | Source unit id: &lt;game&gt;.&lt;faction&gt;.&lt;slug&gt;, e.g. 'ra3.soviet.terror-drone'. |
| `game` | id | yes |  | Game id; must match the file. |
| `introduced_in` | id |  |  | Game or expansion id where this version first appears, if not the base game. |
| `faction` | id | yes |  | Faction id from the game's entry in data/games.json. |
| `name` | text | yes |  | In-game name, for reference only. |
| `flavour_affinity` | list of terms (max 2) |  | `faction-flavours` | *Proposal, not a sourced fact.* Which of our flavours this design would sit in. 1. Start from the faction's flavours in data/games.json; a subfaction with none takes its parent's. Drop one if any weapon in the primary, secondary or alternate slot, or the body plan, is on that flavour's avoided list. 2. Score each other flavour: one point for each of these four that its favoured lists hold: the primary role; the family of any weapon in the primary, secondary or alternate slot; the mobility; the body plan. 3. Add the top-scoring other flavour if it scores 2 or more and at least as much as each flavour from step 1. If two tie at the top, add both, but only if there is room for both. A faction with no flavour starts empty, so step 3 uses the scores alone. At most two flavours in all; an empty list is fine. |
| `class` | term | yes | `classes` | A term from *Unit classes*. |
| `nature` | term | yes | `nature` | A term from *Nature*. |
| `availability` | term | yes | `availability` | How many a side may field: open, limited or unique (heroes). |
| `roles` | group | yes |  |  |
| `roles.primary` | term | yes | `roles` | The unit's main job. Go through the steps in order and stop at the first one that gives a role. Use only what every copy has: weapons in the primary, secondary and alternate slots, and innate buttons. Passengers, upgrades, doctrines, option weapons and proposal fields never count; the default choice of a loadout group counts, because it holds the primary or secondary slot. 1. Official role line. Read the unit's designation (its type line). If it has none, read its official one-line description. If that line names one of our roles, use it. If it names two, use the one whose target the main weapon has a bonus against. If neither has a bonus, go on. Skip a role whose requires the unit fails. 2. Not a fighter. If the unit is unarmed, or its only weapon is a tool, or it is built to carry, supply, build or spy and its guns are fired only from gunner or passenger seats (a transport helicopter's door guns), use the job of its main button or main action: transport, support, engineer, logistics or infiltrator. A combat vehicle whose main gun is fired from a gunner seat (a Foxhole light tank) goes on to step 3. 3. Reach. Siege if the main weapon is lobbed and reaches long or further, if it is bombs dropped from the air, or if the unit deploys into a mode whose gun reaches long or further and hits an area. Marksman if the main weapon is a sniper weapon that reaches long or further. 4. Bonus. Anti-armour, anti-air or anti-infantry if the game data gives the main weapon extra damage against that target, if official text says the unit is strong against it, or if the main weapon can hit nothing else. Doing little damage to other targets is not a bonus. 5. Generalist. Raider if the unit is fast or very fast with light or no armour. Otherwise assault. |
| `roles.secondary` | list of terms (max 2) |  | `roles` | Up to two more jobs, written in rank order. A candidate is any role, other than the primary, whose requires the unit meets and whose description fits a sourced part of the unit. Proposal fields never count (a proposed sensor, mount or seat). Drop any role whose target official text calls a weak or limited point of the unit. How a weapon gives a role: anti-armour or anti-air if it has a bonus against that target, official text says it is strong against it, a source calls it an anti-tank or anti-aircraft weapon, or it can hit nothing else. Anti-infantry for any of those, for a splash weapon, or for small arms (rifles, pistols, machine guns, shotguns) that do little to vehicles. Any other role if the weapon meets the role's requires. Each candidate ranks at the first of these steps that supports it. Keep the first two. Inside a step, follow the order of the roles list. 1. Official text calls the unit by the role label or one of its aliases. 2. A button or mode that every copy has, and the alternate weapon it switches to. 3. Its weapons in the primary and secondary slots. 4. Speed, armour or senses alone. Raider: fast or very fast with light or no armour. Assault: medium or heavier armour and a short- or medium-range main weapon. Scout: long sight, a sensor trait or stealth, with an in-game basis. 5. Passengers, upgrades, doctrines, option weapons and acquired weapons. Rank these roles by how many of the options give them. Leave a slot empty rather than fill it with a role that rests on none of these. |
| `tier` | group | yes |  |  |
| `tier.band` | term or empty | yes | `tiers` | Null only when the game has no tech tiers. |
| `tier.gate` | text |  |  | The tech gate from the game's tier_map, e.g. 'Super Reactor'. |
| `tier.basis` | text | yes |  | Why this band, in plain words. |
| `cost_band` | group | yes |  |  |
| `cost_band.band` | term or empty | yes | `cost-bands` | Null only when units are not bought in the game. |
| `cost_band.raw` | number |  |  | The base price paid to get one unit at the version researched, as one number in the registry's currency; use the registry's formula where a game has several resources (StarCraft II: minerals + 3 x gas). Leave out the cost of reinforcing lost members, upkeep, population, optional upgrades bought for this unit, and upgrades bought for every unit of its type. Stored only so the band can be recomputed; the generator and app never show or use it. |
| `cost_band.basis` | text | yes |  |  |
| `mobility` | group | yes |  |  |
| `mobility.base` | term | yes | `mobility` | A term from *Mobility types*. |
| `mobility.handling` | term | yes | `handling` | *Proposal, not a sourced fact.* Our proposal for how a player version would handle. Use the mobility type's default unless the Handling tie-break gives a reason to change it; write the reason in mobility.notes. |
| `mobility.traits` | list of terms (max 3) |  | `mobility-traits` | Terms from *Mobility traits*. |
| `mobility.speed` | term | yes | `speed-bands` | Ratio to the game's speed reference (see Speed bands), for every unit, vehicles and aircraft included. For a vehicle or aircraft, also say in mobility.notes, in words, how it compares with the game's standard tank (an aircraft: with the game's other aircraft). |
| `mobility.notes` | text |  |  |  |
| `mobility.speed_raw` | number |  |  | The unit's speed figure divided by the speed reference's figure in the games registry, rounded to two decimals; the validator bands the stored, rounded value. Divide only figures on the same scale: both from the game's own data (unitless game values, such as the Command & Conquer Wiki's land speed, count), or both in real units (convert km/h and m/s). A number whose scale the source does not explain, or that is on a different scale from the reference's figure, does not count. Record it whenever such a figure exists, the reference unit itself included (1). For a series game, take the figure as the Series games convention says, and name the title and model in mobility.notes. With no usable figure, leave it out, set the band from words (see Speed bands) and add an uncertain entry for mobility/speed. Stored only so the band can be recomputed; the generator and app never show or use it. |
| `body` | group | yes |  |  |
| `body.plan` | term | yes | `bodies` | A term from *Body plans*. |
| `body.size` | term | yes | `sizes` | A term from *Sizes*. |
| `body.count` | integer (1-) |  |  | Bodies per purchase in the source, e.g. 5 for a squad. Leave it out when it is 1. |
| `body.notes` | text |  |  |  |
| `armour` | group | yes |  |  |
| `armour.class` | term | yes | `armour-classes` | A term from *Armour classes*. |
| `armour.models` | list of terms (min 1, max 3) | yes | `armour-models` | Terms from *Armour models*. |
| `armour.notes` | text |  |  |  |
| `sensors` | group | yes |  | How it sees and is seen under fog of war. |
| `sensors.sight` | term | yes | `sight-bands` | How far it sees, compared with the game's reference unit (see Sight bands). |
| `sensors.traits` | list of terms (max 3) | yes | `sensor-traits` | Always-on sensor traits the stock unit has in every loadout, as the source gives them (see Sensor traits). A sensor from a loadout pick, an upgrade or veterancy goes in sensors.notes. Never proposed. Required, so none is an explicit empty list. |
| `sensors.basis` | one of `in-game`, `proposal` | yes |  | Covers the sight band only. in-game = a source or the registry gives this unit's sight in a form Sight bands accepts: its own figure, a grade on the game's word scale, or a statement about a group it belongs to ("all infantry see 35 m", "most units see 35 m"). proposal = none of these, or the game has no fog of war; the band is then medium. Sensor traits are never proposals: list only the ones the source gives, so a mixed case cannot happen. |
| `sensors.notes` | text |  |  |  |
| `armament[]` | list of groups | yes |  | Weapons, main weapon first, counted by the Weapon entries rules in the Conventions. Empty for unarmed units. |
| `armament[].name` | text | yes |  | In-game weapon name, for reference only. |
| `armament[].slot` | one of `primary`, `secondary`, `alternate`, `passenger`, `acquired`, `option` | yes |  | primary = the main weapon, listed first. There is at most one, chosen among the weapons the base form always has. In a shooter it is the weapon the driver seat has selected at spawn (its first fire button); if two loadout groups of the driver seat each have a default, the one in the first weapon slot is primary and the other is secondary. If the driver seat fires nothing in the source with a full crew (a Foxhole light tank, a PlanetSide 2 Sunderer), the main gun of the first gun seat in the source's seat order is primary. In an RTS, where one attack order fires everything, it is the weapon most members carry, otherwise the one the source lists first; the unit's roles never decide it. secondary = any other weapon the base form always has: on its own key, fired by another seat (a gunner's main gun), or used by the same attack order with the primary or against targets the primary cannot hit. A weapon that a mode adds while the primary keeps firing is also secondary, with mode. alternate = swapped in by a button the unit has (an ability or a mode); the weapon it replaces, usually the primary, is silent meanwhile. A weapon the unit picks by itself for the target or range is not alternate. passenger = set by who rides in a passenger-module seat. One entry per rider unit that changes the weapon, counting riders of every faction and expansion that can get in, captured or allied ones too. When the source says any unit of a role gives the same result (any engineer), make one entry for that role instead. acquired = gained during play: taken from a kill or a wreck (with a triggered ability, see Paired entries), or added or swapped in by a bought upgrade, research or a rank (no ability). Say which in condition. option = a loadout choice that is not fitted by default (see option_group). |
| `armament[].seat` | term |  | `seat-roles` | Proposal, or copied from the source when crew.basis is in-game. Which seat fires it. Leave it out when the driver fires it: that covers every weapon of a solo, squad or remote unit and the driver's own weapons in a multi-seat unit. Write it only for another seat the unit has: gunner or commander when the crew model or crew.seats has that seat, or a passenger seat when it matches crew.passengers.kind. When crew.basis is in-game, write the seat that fires it in the source when every seat is full. A weapon the source hands to a lone driver whenever its own seat is empty (as in Renegade) still belongs to that seat; say in crew.notes that it passes to the driver. When crew.basis is proposal, follow decision 2A: the driver fires the main weapon and any gun that turns with it, and every other weapon on its own mount that the source fires at the same time as the main weapon goes to the gunner. |
| `armament[].family` | term | yes | `weapon-families` | A term from *Weapon families*. |
| `armament[].damage` | term | unless family is adaptive | `damage-types` | What a hit does to the target. Decide in this order and stop at the first step that fits. 1. It restores health to its target: repair. A weapon that hurts its target and heals its user, such as a drain beam, is not this step. 2. It does no damage at all (it only stuns, pins, slows or marks): its family's default damage. Put the effect in traits and say in the summary that it does no damage. 3. The game's registry note tells you to record this kind of weapon as a damage type: that type. 4. The game has a damage_map in data/games.json, and the sources cited for this unit give this weapon one game damage category that the map lists: the mapped type. The same name written out in words counts. Use it even when the family's list leaves it out, and record that break in atypical. Never change the family to make the damage fit. 5. Anything else (no map, no category given for this weapon on this unit, a category the map leaves out, or different categories against different targets): the family's default damage, with two exceptions. Check them in this order, and use one only when the family allows the type. Armour-piercing when the sources call the weapon anti-tank or anti-armour, say it is built to kill vehicles, or give it a bonus against armoured targets. Explosive when it is built mainly to bring down aircraft, or its hit is a blast that hurts an area. Area damage is also the splash trait, so a shell can be armour-piercing and splash at once. |
| `armament[].mount` | term | unless family is adaptive | `aim-models` | *Proposal, not a sourced fact.* Our proposed mount for a player version, picked from the source's physical mount by the Aim / mount tie-break. |
| `armament[].delivery` | term | unless family is adaptive | `weapon-delivery` | How the shot reaches the target, as the cited sources describe it. Use attach, ram, guided, lock-on, lobbed, drop, place or melee when the sources describe that way of hitting. Otherwise pick one of three. A shot seen travelling is projectile; a thrown or launched object such as a shuriken, an arrow or a rocket counts. A hit that lands the moment it is fired is hitscan. A beam kept on the target, whose effect lasts or builds while it stays on, is beam. When the sources do not say how it travels, use the family's default delivery. A rate of fire, the weapon's name or a hidden hit roll does not count as saying. One attack button is one weapon entry, even when it works differently on different targets: code the delivery that comes first in this order: attach, ram, guided, lock-on, lobbed, drop, place, beam, projectile, hitscan, melee. Say what it does to the other targets in the summary, and list every target it can hit in can_target. |
| `armament[].range` | term | unless family is adaptive | `range-bands` | One band per weapon, from its longest reach against any target, compared with the game's reference weapon and with the unit's own sight (see Range bands); not compared with this unit's other weapons. |
| `armament[].can_target` | list of terms | unless family is adaptive | `target-types` | Every kind of target the weapon can be fired at and hurt in the source, even a little: weak, poor or not effective still count. Leave a kind out when the sources say the weapon cannot attack it or does no damage to it, or when the game has no such targets. Then, in this order: 1. A weapon that does no damage (it repairs, stuns, pins or marks), or that latches on, drains or takes over minds, lists only the kinds the sources name. 2. A lock-on weapon lists only what it can lock onto, unless the sources say it can also fire without a lock. If they do not say what it locks onto, an anti-tank one lists ground vehicles and an anti-air one low air and high air. 3. Commanded games only: a weapon the sources label by its targets (anti-infantry, anti-vehicle, anti-air) or say hits only some kinds lists those kinds, plus any kind another cited source says it hurts. Words such as anything else name every kind. A label on the unit, such as its role, does not count. 4. Any other weapon lists every ground kind its family allows: infantry, ground vehicles and structures. A source that says ground or surface means these. Structures: under steps 1 and 3, and for a family that leaves them out, list them only when the sources say the weapon damages buildings; a mention of a base is not enough. Air: in a commanded game, list low air and high air only when the sources say the weapon attacks air units, unless the game splits its fliers and the weapon reaches only some. In a piloted game (control piloted or both in data/games.json), a weapon the player aims also lists low air when its family allows it. High air and naval follow their coding rules in Target types. A flier that can be hit only while it stands on the ground is not an air target. |
| `armament[].affects` | one of `enemies`, `allies`, `both` |  |  | Default: enemies. Repair and buff tools affect allies. |
| `armament[].traits` | list of terms (max 4) |  | `weapon-traits` | Terms from *Weapon traits*. |
| `armament[].summary` | text | yes |  | What it does, in plain words. |
| `armament[].when` | typed link |  |  | Passenger weapons only, and required there. Write the rider as unit:&lt;id&gt;, built from its in-game name by the id rules (see Ids in the Conventions), even if that unit is not researched yet. For a role entry, write role:&lt;role&gt;. Leave it out on every other slot. |
| `armament[].condition` | text |  |  | The condition in plain words. Required for passenger, alternate and acquired weapons. For a passenger weapon, name the rider, its faction and any expansion. |
| `armament[].patterns` | list of ids |  |  | Pattern ids (from data/pattern-registry.json) this weapon is an example of. |
| `armament[].mode` | id |  |  | Mode id from the unit's modes, when the weapon works only in that mode. A weapon without a mode works in the base form and in every mode, unless an alternate with that mode replaces it. An alternate with a mode replaces another weapon, usually the primary, in that mode. A weapon that a mode adds while the primary keeps firing is secondary, with the mode. If a mode silences a weapon and nothing replaces it, say so in the mode's summary. |
| `armament[].option_group` | id |  |  | Groups weapons that exclude each other. A loadout group holds every choice for one place in the loadout. The default choice keeps its primary or secondary slot and has default: true; the other choices are option. A place that starts empty has no default. An upgrade group holds acquired weapons from upgrades that exclude each other, with no default. How a choice is unlocked (score, rank, progression) is not recorded. |
| `armament[].default` | boolean |  |  | true on the default choice of a loadout group, and nowhere else. |
| `crew` | group | yes |  |  |
| `crew.model` | term | yes | `crew-models` | Who operates the unit. In-game: copy the source's seats. A group the source moves as one unit: squad. Otherwise solo, unless the coding rules on Crew models give driver-gunner or remote. |
| `crew.basis` | one of `in-game`, `proposal` | yes |  | in-game = players sit in this unit in the source and its operating seats are copied from there. That happens only for units players drive in a game whose registry control is piloted or both (Battlefield, PlanetSide 2, Foxhole, WARDOGS, Renegade, MechWarrior), not for AI enemies there. It is also in-game when the source moves a group of soldiers or tiny drones as one unit under one order (a squad). proposal = our pick for a player version: every other unit, including every RTS vehicle, aircraft, walker, drone and lone soldier. A crew named only in background text or voice lines changes nothing; mention it in crew.notes. The basis covers the operating seats (model, seats, solo fallback). Passenger seats are always copied from the source. |
| `crew.solo_fallback` | term |  | `solo-fallback` | Only for multi-seat crew models (driver-gunner, driver-gunner-commander): what a lone player can do. Leave it out for solo, squad and remote. |
| `crew.passengers` | group |  |  | Passenger seats, if any. Any crew model can carry passengers; the card then shows 'transport with passengers'. |
| `crew.passengers.seats` | integer (1-) | yes |  |  |
| `crew.passengers.kind` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `crew.notes` | text |  |  |  |
| `crew.seats[]` | list of groups |  |  | Exact seat layout when the preset doesn't say it all (e.g. one driver and two gunners). |
| `crew.seats[].role` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `crew.seats[].count` | integer (1-) | yes |  |  |
| `abilities[]` | list of groups | yes |  | One entry per button the unit has in the source, with these rules. Two buttons that undo each other (siege and unsiege, land and take off) are one entry. Each choice for one loadout button is its own entry, and the choices share an exclusive_group (flares, ECM or extinguisher). A build or call-in menu is one entry per pattern its items serve (all cover pieces are one build-cover entry, mines one lay-mines entry), plus one entry for all the items that no pattern fits; name them in its summary. Two separate buttons that use the same pattern for different jobs (a grenade and a sticky bomb) stay two entries. A button that only changes numbers (a zoom) is left out. Add a passive or triggered entry only when Paired entries asks for one, or when the source names the effect (as an ability, perk, upgrade or loadout pick) and it adds a mechanic, not just numbers. If a word-list term says the same, use the term instead (an always-on scanner is a sensor trait). Leave out passives that only change numbers (more armour, faster reload, less sway), and note them in the matching field's notes. The act of buying an upgrade is never an ability: record what it adds (a weapon, an ability with source upgrade, or a term). An ability that changes something else, such as turning a building into a barracks, is still an ability. Shared mechanics, universal keys and side-wide powers are left out (see Conventions). |
| `abilities[].name` | text | yes |  | In-game ability name, for reference only. |
| `abilities[].kind` | term | yes | `ability-kinds` | A term from *Ability kinds*. |
| `abilities[].seat` | term |  | `seat-roles` | Proposal, or copied from the source when crew.basis is in-game. Which seat triggers it. Leave it out when the driver does. A passive ability has no seat. Write it only for another seat the unit has, as for weapons. |
| `abilities[].cooldown` | term |  | `cooldown-bands` | Band of the cooldown figure (see Cooldown bands). Look for the figure on the unit's page and on the page of the mechanic itself (flares, an extinguisher). Leave it out when no source gives one or the ability has no wait; a per-life ability is per-life without a figure. |
| `abilities[].summary` | text | yes |  |  |
| `abilities[].patterns` | list of ids | yes |  | The mechanic patterns this ability is an example of. If none fits, keep the ability, leave this list empty and add a fit_note at abilities/&lt;i&gt;/patterns that names the mechanic wanted. |
| `abilities[].source` | term | yes | `ability-sources` | Where the ability comes from. Always write it, innate included. |
| `abilities[].exclusive_group` | id |  |  | Abilities in the same group exclude each other (loadout or upgrade choices). |
| `modes[]` | list of groups (max 3) |  |  | Second forms that change how the unit moves or what it is: deploy, siege and transform modes. The base form is the form the unit is built or bought in; if it can be built in either, it is the form whose name the unit carries. A weapon swap alone is not a mode (see Paired entries). Write only the parts that change from the base form; the unit's own class, body, armour and mobility hold for every mode that leaves them out. |
| `modes[].id` | id | yes |  | Mode id, e.g. 'siege'. |
| `modes[].name` | text | yes |  |  |
| `modes[].via` | id | yes |  | The pattern that switches to this mode. |
| `modes[].class` | term |  | `classes` | A term from *Unit classes*. |
| `modes[].mobility` | group |  |  | Only when the mode moves differently from the base form: a new base, handling or speed. Leave it out when the mode keeps the unit's movement or cannot move at all; when it cannot move, say so in the mode's summary. Its handling follows the Handling tie-break from the mode's own mobility type. |
| `modes[].mobility.base` | term | yes | `mobility` | A term from *Mobility types*. |
| `modes[].mobility.handling` | term |  | `handling` | A term from *Handling*. |
| `modes[].mobility.speed` | term |  | `speed-bands` | A term from *Speed bands*. |
| `modes[].summary` | text | yes |  | What changes in this mode. |
| `modes[].body` | group |  |  |  |
| `modes[].body.plan` | term | yes | `bodies` | A term from *Body plans*. |
| `modes[].body.size` | term |  | `sizes` | A term from *Sizes*. |
| `modes[].armour` | group |  |  | Only when the mode's armour class or models differ from the unit's. Leave it out when they stay the same. |
| `modes[].armour.class` | term | yes | `armour-classes` | A term from *Armour classes*. |
| `modes[].armour.models` | list of terms (max 3) |  | `armour-models` | Terms from *Armour models*. |
| `resources` | list of terms (max 2) |  | `resources` | Terms from *Resources*. |
| `on_death` | group | yes |  |  |
| `on_death.outcomes` | list of terms (min 1, max 2) | yes | `on-death` | Terms from *On death*. |
| `on_death.basis` | one of `in-game`, `proposal` | yes |  | in-game = the source shows what happens when this unit dies: a wreck others can work on, a blast that hurts what is near, crew or a pilot getting out on their own, or, for a unit players drive in a game where they come back after dying (registry control piloted or both), the player going back to pick again. proposal = the source shows nothing special, because the unit is simply gone (almost every RTS unit, and AI enemies in shooters). Then code the default from decision 3C: bail-out for a crewed machine that is not infantry, respawn for everything else. When the source shows an outcome, code only that, with basis in-game, and never add the default. An outcome the unit gets on its own counts even when it needs veterancy or happens only by chance; give the condition in on_death.notes. A power or upgrade the player picks or buys for the whole faction does not count. |
| `on_death.notes` | text |  |  | Facts about the death that don't change the outcome: riders killed with the vehicle, a short window to jump out by hand, weapons, crates or loot left for pickup or for crafting, the condition on an outcome (only with veterancy, only by chance), or a power or upgrade the player picks or buys for the whole faction that changes what happens when units die (an RA3 protocol, a Generals general's upgrade). Such a picked power is not the unit's own outcome. A built-in rule that applies to the unit without any pick, such as a faction whose vehicle crews always bail out, is an outcome. |
| `strengths` | list of link + reasons (min 1) | yes |  | What this unit is good at; links describe the unit itself. See Matchups under Conventions. |
| `weaknesses` | list of link + reasons (min 1) | yes |  | Where it falls short; links describe the unit itself. See Matchups under Conventions. |
| `countered_by` | list of link + reasons (min 1) | yes |  | What beats it; links describe the enemy. See Matchups under Conventions. |
| `counters` | list of link + reasons (min 1) | yes |  | What it beats; links describe the enemy. See Matchups under Conventions. |
| `combos` | list of link + reasons | yes |  | Notable combinations; links describe the teammate or the setup. Required, so 'none known' is an explicit empty list. See Matchups under Conventions. |
| `memorable` | text | yes |  | One line: why this unit is memorable. |
| `as_player` | text | yes |  | *Proposal, not a sourced fact.* Two or three lines: how it plays for the player who buys it, and what each other seat adds, if there are any. In a vehicle with several seats the buyer drives and fires the main weapon. |
| `sources[]` | list of groups (min 1, max 3) | yes |  | The pages this entry rests on; every field rule reads them together. When the unit's weapons change by passenger, mode or loadout and one page lists those weapons one by one, that page must be among them. Cite a mechanic's own page (flares, an extinguisher) when it gives a figure the entry uses. A page read but left out for lack of room goes in uncertain, saying what it shows; a band that rests on it is marked uncertain. |
| `sources[].url` | URL | yes |  | The page actually read (https only; never an image). |
| `sources[].title` | text | yes |  | Page title and site. |
| `sources[].kind` | term | yes | `source-kinds` | A term from *Source kinds*. |
| `sources[].accessed` | text | yes |  | Date the page was read. |
| `sources[].note` | text |  |  |  |
| `sources[].supports` | list of texts |  |  | Which fields this source backs, as paths such as 'tier', 'cost_band' or 'abilities/0'. |
| `sources[].version` | text |  |  | Patch, edition or remaster the page describes, for games that change. |
| `confidence` | term | yes | `confidence` | A term from *Confidence levels*. |
| `uncertain[]` | list of groups |  |  | A specific point that is less certain than the overall confidence, or where sources disagree. |
| `uncertain[].path` | text | yes |  | The field the doubt is about, as a path with / (sensors/sight, armament/0/range). |
| `uncertain[].note` | text | yes |  |  |
| `uncertain[].sources_disagree` | boolean |  |  |  |
| `review` | group | yes |  | Checker status. The research run samples entries and re-checks them against their sources. |
| `review.status` | one of `unchecked`, `checked`, `disputed` | yes |  |  |
| `review.checked_by` | text |  |  |  |
| `review.checked_on` | text |  |  |  |
| `review.checked_paths` | list of texts |  |  |  |
| `review.wrong_paths` | list of texts |  |  |  |
| `review.notes` | text |  |  |  |
| `researched_by` | text | yes |  | Research bucket or agent that wrote the entry. |
| `lineage` | id |  |  | Shared id for the same design in two or more games of data/games.json. Link units doing the same job that have the same or nearly the same name (ignore words such as Squad, Team or Mk II), or that a source presents as the same unit in another game. The id is the slug of that unit's id in the earliest such game. If it has no id yet, make one from its name by the id rules, leaving out words such as Squad or Team. Examples: terror-drone (Red Alert 2 and 3), ifv (Red Alert 2's IFV and Red Alert 3's Multigunner IFV), riflemen (Company of Heroes 1 to 3). Leave it out when no other registry game has the design. An expansion is part of its game. A game outside the registry, or the same real-world vehicle in an unrelated series, does not count. |
| `variant_of` | unit id |  |  | For subfaction or general-specific versions: the base unit id. |
| `fit_notes[]` | list of groups |  |  | Where no word-list term fitted well. Every gap goes here, in the unit file: the gap report for the next word-list version reads only the files. |
| `fit_notes[].path` | text | yes |  | Where the term would go, as a path with / between field names and list positions (armour/models, armament/2/damage). For something left out entirely, the list it would have gone in (abilities, armament). |
| `fit_notes[].used` | text | yes |  |  |
| `fit_notes[].wanted` | text |  |  |  |
| `fit_notes[].note` | text | yes |  |  |
| `atypical[]` | list of groups |  |  | Combination rules this real unit breaks. Found by the validator and recorded here; never blocks a source unit, and useful evidence for relaxing a rule. |
| `atypical[].path` | text | yes |  | Where the break shows on this unit: field names and list positions separated by '/', e.g. 'armament/0/can_target'. It must exist on the unit. |
| `atypical[].rule` | text | yes |  | The broken rule's exact string, as the validator prints it at the end of the ATYPICAL line: '&lt;list&gt;:&lt;term&gt; &lt;field&gt; &lt;value&gt;'. The field is 'classes' (value: the unit's class), 'min_tier' (value: the term's lowest tier), 'allowed.&lt;list&gt;' (value: the unit's or weapon's term that the allowed list leaves out), 'excluded.&lt;list&gt;' (value: the term that the excluded list names) or 'requires' (value: the group's links joined by '\|'). Example: 'weapon-families:rockets allowed.target-types high-air'. Two weapons that break the same rule share one string. |
| `atypical[].note` | text | yes |  |  |

## Mechanic pattern

A reusable building block abstracted from units. File: `data/patterns/<pattern-id>.json`, one per pattern. Schema: `schemas/pattern.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `schema_version` | text | yes |  |  |
| `vocab_version` | text | yes |  |  |
| `id` | id | yes |  | Generic English, verb first: `<verb>-<object>[-<qualifier>]`, e.g. `infest-vehicle`. No fiction words. |
| `status` | one of `proposed`, `accepted`, `merged`, `rejected` | yes |  | proposed = written, not yet reviewed and calibrated; accepted = reviewed and calibrated in the merge pass; merged = folded into another pattern; rejected. |
| `merged_into` | id |  |  | Required when status is merged. |
| `name` | text | yes |  | Our own generic name, never a trademark. |
| `aliases` | list of texts |  |  | Generic synonyms and old ids merged into this one (the resolver accepts them). |
| `source_terms` | list of texts |  |  | In-game names for this mechanic, reference only; never shown by the generator. |
| `category` | term | yes | `pattern-categories` | A term from *Pattern categories*. |
| `also_in` | list of terms (max 2) |  | `pattern-categories` | Up to two more categories for filtering. |
| `generic` | boolean |  |  | True for plain mechanics (sprint, healing yourself, stat buff) kept so every ability can link a pattern; excluded from the top-30 list. |
| `summary` | text | yes |  | What it does, in plain words. |
| `counterplay` | list of texts (min 1) | yes |  | How the enemy deals with it. |
| `source_units` | list of unit ids (min 1) | yes |  | Unit ids that link this pattern. Filled by npm run sync-patterns in the merge pass; never edit by hand. |
| `other_examples[]` | list of groups |  |  | Further uses found during research that are not (yet) entered as source units. |
| `other_examples[].game` | text | yes |  | Game id from the registry, or 'extra:&lt;title&gt;' for a game outside it. |
| `other_examples[].unit` | text | yes |  | Unit, ability or mechanic name (reference only). |
| `other_examples[].note` | text | yes |  | How it works there, paraphrased. |
| `other_examples[].sources[]` | list of groups (min 1, max 3) | yes |  | A citation. Paraphrase only; never copy text or images. When another established site covers the unit, cite it rather than a third page of the same site. |
| `other_examples[].sources[].url` | URL | yes |  | The page actually read (https only; never an image). |
| `other_examples[].sources[].title` | text | yes |  | Page title and site. |
| `other_examples[].sources[].kind` | term | yes | `source-kinds` | A term from *Source kinds*. |
| `other_examples[].sources[].accessed` | text | yes |  | Date the page was read. |
| `other_examples[].sources[].note` | text |  |  |  |
| `other_examples[].sources[].supports` | list of texts |  |  | Which fields this source backs, as paths such as 'tier', 'cost_band' or 'abilities/0'. |
| `other_examples[].sources[].version` | text |  |  | Patch, edition or remaster the page describes, for games that change. |
| `other_examples[].confidence` | term | yes | `confidence` | A term from *Confidence levels*. |
| `other_examples[].unit_id` | unit id |  |  | Unit id, once the unit is in the database. |
| `other_examples[].franchise` | text |  |  | Franchise name, for counting how many franchises use a pattern. |
| `shooter_analogues[]` | list of groups |  |  | Where players already do this in shooters or action games. |
| `shooter_analogues[].game` | text | yes |  | Game id from the registry, or 'extra:&lt;title&gt;' for a game outside it. |
| `shooter_analogues[].unit` | text | yes |  | Unit, ability or mechanic name (reference only). |
| `shooter_analogues[].note` | text | yes |  | How it works there, paraphrased. |
| `shooter_analogues[].sources[]` | list of groups (min 1, max 3) | yes |  | A citation. Paraphrase only; never copy text or images. When another established site covers the unit, cite it rather than a third page of the same site. |
| `shooter_analogues[].sources[].url` | URL | yes |  | The page actually read (https only; never an image). |
| `shooter_analogues[].sources[].title` | text | yes |  | Page title and site. |
| `shooter_analogues[].sources[].kind` | term | yes | `source-kinds` | A term from *Source kinds*. |
| `shooter_analogues[].sources[].accessed` | text | yes |  | Date the page was read. |
| `shooter_analogues[].sources[].note` | text |  |  |  |
| `shooter_analogues[].sources[].supports` | list of texts |  |  | Which fields this source backs, as paths such as 'tier', 'cost_band' or 'abilities/0'. |
| `shooter_analogues[].sources[].version` | text |  |  | Patch, edition or remaster the page describes, for games that change. |
| `shooter_analogues[].confidence` | term | yes | `confidence` | A term from *Confidence levels*. |
| `shooter_analogues[].unit_id` | unit id |  |  | Unit id, once the unit is in the database. |
| `shooter_analogues[].franchise` | text |  |  | Franchise name, for counting how many franchises use a pattern. |
| `player_translation` | group | yes |  | The heart of the tool: how the pattern plays when one player controls the unit. |
| `player_translation.summary` | text | yes |  |  |
| `player_translation.as_user` | list of texts (min 1) | yes |  | What the player using it does and feels. |
| `player_translation.as_target` | list of texts (min 1) | yes |  | What the player on the receiving end sees, and what they can do about it right now. |
| `player_translation.teammates` | list of texts (min 1) | yes |  | How teammates on both sides get involved. |
| `player_translation.controls` | list of texts (min 1) | yes |  | A proposed input mapping. |
| `player_translation.feedback` | list of texts (min 1) | yes |  | Sound, visual and UI cues that keep it readable from a top-down camera. |
| `player_translation.changes_from_rts` | list of texts (min 1) | yes |  | What has to change compared with the RTS original, and why. |
| `team_play` | group | yes |  |  |
| `team_play.potential` | term | yes | `ratings` | A term from *Ratings*. |
| `team_play.hooks` | list of terms (min 1) | yes | `team-play-hooks` | Terms from *Team-play hooks*. |
| `team_play.notes` | text | yes |  |  |
| `build_difficulty` | group | yes |  |  |
| `build_difficulty.level` | term | yes | `ratings` | A term from *Ratings*. |
| `build_difficulty.notes` | list of texts (min 1) | yes |  |  |
| `risks` | group | yes |  |  |
| `risks.balance` | group | yes |  |  |
| `risks.balance.level` | term | yes | `ratings` | A term from *Ratings*. |
| `risks.balance.notes` | list of texts (min 1) | yes |  |  |
| `risks.readability` | group | yes |  |  |
| `risks.readability.level` | term | yes | `ratings` | A term from *Ratings*. |
| `risks.readability.notes` | list of texts (min 1) | yes |  |  |
| `variants[]` | list of groups (min 1) | yes |  | Distinct twists the generator can roll. Higher min_spice = wilder. |
| `variants[].id` | id | yes |  | Variant id, e.g. 'chain-jump'. |
| `variants[].name` | text | yes |  |  |
| `variants[].summary` | text | yes |  |  |
| `variants[].min_spice` | integer (1-5) | yes |  |  |
| `variants[].seen_in` | text |  |  | Where this twist comes from (game or unit names, reference only). |
| `variants[].overrides` | group |  |  | Generator rules that differ for this variant. |
| `variants[].overrides.classes` | list of terms |  | `classes` | Replaces the base generator's classes for this variant. |
| `variants[].overrides.class_rarity` | map |  |  | Replaces the base generator's class_rarity for this variant. Every key must be in the variant's classes (its own, or the base generator's). Without it, the base generator's class_rarity applies to whichever of its classes the variant keeps. |
| `variants[].overrides.min_tier` | term |  | `tiers` | A term from *Tier bands*. |
| `variants[].overrides.kinds` | list of terms |  | `ability-kinds` | Terms from *Ability kinds*. |
| `variants[].overrides.requires` | list of lists |  |  | Conditions as groups of typed links: every group must hold, and one link in a group is enough. |
| `variants[].overrides.excludes` | list of typed links |  |  |  |
| `variants[].overrides.implies` | list of typed links |  |  |  |
| `variants[].overrides.adds_strengths` | list of link + reasons |  |  | Replaces the base generator's adds_strengths for this variant (for example a mine variant that no longer has to reach its target). |
| `variants[].overrides.adds_weaknesses` | list of link + reasons |  |  | Replaces the base generator's adds_weaknesses for this variant. |
| `variants[].overrides.counters` | list of link + reasons |  |  | Replaces the base generator's counters for this variant. |
| `variants[].overrides.countered_by` | list of link + reasons |  |  | Replaces the base generator's countered_by for this variant. |
| `generator` | group | when status is accepted |  | Rules for the generator. Links in requires, excludes, implies, adds_strengths and adds_weaknesses describe the card itself; counters and countered_by describe the enemy. |
| `generator.classes` | list of terms (min 1) | yes | `classes` | Classes that can roll this pattern: every class it is physically possible for. A class left out is a hard ban. |
| `generator.class_rarity` | map |  |  | Rarity of this pattern for particular classes, used instead of 'rarity' when the card is of that class; classes not listed use 'rarity'. Every key must be in 'classes'. Cross-overs that are possible but unusual for a class are listed here as rare (or uncommon). |
| `generator.min_tier` | term | yes | `tiers` | A term from *Tier bands*. |
| `generator.kinds` | list of terms (min 1) | yes | `ability-kinds` | Ability kinds this pattern can take on a card. |
| `generator.slot` | one of `signature`, `extra`, `any` | yes |  | signature = only as the card's signature ability; extra = only as an extra ability; any = either. |
| `generator.rarity` | term | yes | `rarity` | A term from *Rarity*. |
| `generator.flavour_lean` | list of terms |  | `faction-flavours` | Flavours that roll it more often. |
| `generator.requires` | list of lists |  |  | What the card must have. |
| `generator.excludes` | list of typed links |  |  | What the card must not have. |
| `generator.implies` | list of typed links |  |  | Parts the generator sets before rolling the rest. |
| `generator.conflicts_with` | list of ids |  |  | Pattern ids that may not appear on the same card. |
| `generator.adds_strengths` | list of link + reasons |  |  |  |
| `generator.adds_weaknesses` | list of link + reasons |  |  |  |
| `generator.counters` | list of link + reasons |  |  |  |
| `generator.countered_by` | list of link + reasons (min 1) | yes |  | The typed twin of counterplay: what beats a card with this pattern. |
| `generator.points` | group |  |  | Weights for the generator's balance hints, 0-3 each. Proposed with the generator (Phase 2). |
| `generator.points.cost` | integer (0-3) | yes |  |  |
| `generator.points.power` | integer (0-3) | yes |  |  |
| `generator.points.complexity` | integer (0-3) | yes |  |  |
| `related[]` | list of groups |  |  |  |
| `related[].id` | id | yes |  | Pattern id from the registry, e.g. 'hijack-vehicle'. |
| `related[].kind` | one of `variant-of`, `generalises`, `often-confused-with`, `counters`, `combos-with` | yes |  |  |
| `open_questions` | list of texts |  |  | Design questions for Mustafa that the research raised. |
| `confidence` | term | yes | `confidence` | Confidence that the linked source units implement the mechanic as summarised; each example carries its own confidence. |
| `review` | group | yes |  | Checker status. The research run samples entries and re-checks them against their sources. |
| `review.status` | one of `unchecked`, `checked`, `disputed` | yes |  |  |
| `review.checked_by` | text |  |  |  |
| `review.checked_on` | text |  |  |  |
| `review.checked_paths` | list of texts |  |  |  |
| `review.wrong_paths` | list of texts |  |  |  |
| `review.notes` | text |  |  |  |
| `shooter_fit` | group | yes |  | How well the pattern suits a player-controlled, top-down team shooter. Feeds the top-30 list. |
| `shooter_fit.score` | integer (1-5) | yes |  |  |
| `shooter_fit.reason` | text | yes |  |  |

## Concept card

One generated unit concept (Phase 2). Example: [docs/examples/concept-card.example.json](examples/concept-card.example.json). Schema: `schemas/concept-card.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `id` | text | yes |  | Hash of the reproduction key, so the same roll always has the same id. |
| `schema_version` | text | yes |  |  |
| `generator` | group | yes |  |  |
| `generator.version` | text | yes |  | Generator code version. |
| `generator.data_version` | text | yes |  | Content hash of the vocabularies and patterns used (data/manifest.json). |
| `seed` | text | yes |  | Shareable seed string. |
| `spice` | integer (1-5) | yes |  | 1 = grounded (common parts, on-flavour) ... 5 = wild (rare cross-overs). |
| `inputs` | group | yes |  | What the user picked before rolling. Null = let the generator choose. |
| `inputs.class` | term or empty | yes | `classes` | A term from *Unit classes*. |
| `inputs.tier` | term or empty | yes | `tiers` | A term from *Tier bands*. |
| `inputs.flavour` | term or empty | yes | `faction-flavours` | A term from *Faction flavours*. |
| `inputs.role` | term or empty | yes | `roles` | A term from *Roles*. |
| `locks` | list of items | yes |  | Parts kept when rerolling. |
| `parts` | group | yes |  |  |
| `parts.class` | term | yes | `classes` | A term from *Unit classes*. |
| `parts.tier` | term | yes | `tiers` | A term from *Tier bands*. |
| `parts.flavour` | term | yes | `faction-flavours` | A term from *Faction flavours*. |
| `parts.nature` | term | yes | `nature` | A term from *Nature*. |
| `parts.availability` | term | yes | `availability` | A term from *Availability*. |
| `parts.roles` | group | yes |  |  |
| `parts.roles.primary` | term | yes | `roles` | A term from *Roles*. |
| `parts.roles.secondary` | list of terms (max 2) | yes | `roles` | Terms from *Roles*. |
| `parts.mobility` | group | yes |  |  |
| `parts.mobility.base` | term | yes | `mobility` | A term from *Mobility types*. |
| `parts.mobility.handling` | term | yes | `handling` | A term from *Handling*. |
| `parts.mobility.traits` | list of terms (max 2) | yes | `mobility-traits` | Terms from *Mobility traits*. |
| `parts.mobility.speed` | term | yes | `speed-bands` | A term from *Speed bands*. |
| `parts.body` | group | yes |  |  |
| `parts.body.plan` | term | yes | `bodies` | A term from *Body plans*. |
| `parts.body.size` | term | yes | `sizes` | A term from *Sizes*. |
| `parts.body.count` | integer (1-5) | yes |  | 1 unless the crew model is squad (then 2-5). |
| `parts.armament` | group | yes |  |  |
| `parts.armament.primary` | group | yes |  | Null for an unarmed unit (its signature must then be support, transport, infiltration, summon or control). May be empty. |
| `parts.armament.primary.family` | term | yes | `weapon-families` | A term from *Weapon families*. |
| `parts.armament.primary.damage` | term or empty | yes | `damage-types` | A term from *Damage types*. |
| `parts.armament.primary.mount` | term | yes | `aim-models` | A term from *Aim / mount*. |
| `parts.armament.primary.delivery` | term or empty | yes | `weapon-delivery` | A term from *Weapon delivery*. |
| `parts.armament.primary.range` | term or empty | yes | `range-bands` | A term from *Range bands*. |
| `parts.armament.primary.can_target` | list of terms | yes | `target-types` | Terms from *Target types*. |
| `parts.armament.primary.affects` | one of `enemies`, `allies`, `both` |  |  |  |
| `parts.armament.primary.traits` | list of terms (max 3) | yes | `weapon-traits` | Terms from *Weapon traits*. |
| `parts.armament.primary.seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.armament.secondary` | group | yes |  | May be empty. |
| `parts.armament.secondary.family` | term | yes | `weapon-families` | A term from *Weapon families*. |
| `parts.armament.secondary.damage` | term or empty | yes | `damage-types` | A term from *Damage types*. |
| `parts.armament.secondary.mount` | term | yes | `aim-models` | A term from *Aim / mount*. |
| `parts.armament.secondary.delivery` | term or empty | yes | `weapon-delivery` | A term from *Weapon delivery*. |
| `parts.armament.secondary.range` | term or empty | yes | `range-bands` | A term from *Range bands*. |
| `parts.armament.secondary.can_target` | list of terms | yes | `target-types` | Terms from *Target types*. |
| `parts.armament.secondary.affects` | one of `enemies`, `allies`, `both` |  |  |  |
| `parts.armament.secondary.traits` | list of terms (max 3) | yes | `weapon-traits` | Terms from *Weapon traits*. |
| `parts.armament.secondary.seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.armament.conditional[]` | list of groups (max 4) | yes |  | Weapons that depend on a passenger, a kill or a mode. Needed when a weapon's family is 'adaptive'. |
| `parts.armament.conditional[].when` | typed link | yes |  | Typed link `<kind>:<id>`, e.g. `role:anti-air`, `size:<=small` or `hits:high-air`. A link always describes a unit. In strengths, weaknesses, requires, excludes and implies it describes this unit; in counters, the unit this one beats; in countered_by, the unit that beats this one; in combos, the teammate it works well with. Kinds are listed under Conventions in docs/fields.md; ranked kinds accept `<=` and `>=`. |
| `parts.armament.conditional[].weapon` | group | yes |  |  |
| `parts.armament.conditional[].weapon.family` | term | yes | `weapon-families` | A term from *Weapon families*. |
| `parts.armament.conditional[].weapon.damage` | term or empty | yes | `damage-types` | A term from *Damage types*. |
| `parts.armament.conditional[].weapon.mount` | term | yes | `aim-models` | A term from *Aim / mount*. |
| `parts.armament.conditional[].weapon.delivery` | term or empty | yes | `weapon-delivery` | A term from *Weapon delivery*. |
| `parts.armament.conditional[].weapon.range` | term or empty | yes | `range-bands` | A term from *Range bands*. |
| `parts.armament.conditional[].weapon.can_target` | list of terms | yes | `target-types` | Terms from *Target types*. |
| `parts.armament.conditional[].weapon.affects` | one of `enemies`, `allies`, `both` |  |  |  |
| `parts.armament.conditional[].weapon.traits` | list of terms (max 3) | yes | `weapon-traits` | Terms from *Weapon traits*. |
| `parts.armament.conditional[].weapon.seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.armour` | group | yes |  |  |
| `parts.armour.class` | term | yes | `armour-classes` | A term from *Armour classes*. |
| `parts.armour.models` | list of terms (min 1, max 2) | yes | `armour-models` | Terms from *Armour models*. |
| `parts.sensors` | group | yes |  | How far it sees through the fog of war, and its always-on sensor traits. |
| `parts.sensors.sight` | term | yes | `sight-bands` | A term from *Sight bands*. |
| `parts.sensors.traits` | list of terms (max 2) | yes | `sensor-traits` | Terms from *Sensor traits*. |
| `parts.crew` | group | yes |  |  |
| `parts.crew.model` | term | yes | `crew-models` | A term from *Crew models*. |
| `parts.crew.solo_fallback` | term or empty | yes | `solo-fallback` | Null for single-seat models. |
| `parts.crew.passengers` | group | yes |  | May be empty. |
| `parts.crew.passengers.seats` | integer (1-8) | yes |  |  |
| `parts.crew.passengers.kind` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.signature` | group | yes |  |  |
| `parts.signature.pattern` | id | yes |  | Pattern id, e.g. 'infest-vehicle'. |
| `parts.signature.variant` | text or empty | yes |  |  |
| `parts.signature.kind` | term | yes | `ability-kinds` | A term from *Ability kinds*. |
| `parts.signature.seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.signature.cooldown` | term or empty | yes | `cooldown-bands` | Null for passive and triggered abilities. |
| `parts.abilities[]` | list of groups (max 3) | yes |  | Extra abilities. Keys (signature included) fit the tier's budget. |
| `parts.abilities[].pattern` | id | yes |  | Pattern id, e.g. 'infest-vehicle'. |
| `parts.abilities[].variant` | text or empty | yes |  |  |
| `parts.abilities[].kind` | term | yes | `ability-kinds` | A term from *Ability kinds*. |
| `parts.abilities[].seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.abilities[].cooldown` | term or empty | yes | `cooldown-bands` | Null for passive and triggered abilities. |
| `parts.modes[]` | list of groups (max 1) |  |  | A second form from a transform or deploy pattern. |
| `parts.modes[].via` | id | yes |  | Pattern id of the transform or deploy pattern, e.g. 'transform' or 'deploy-siege-mode'. |
| `parts.modes[].class` | term | yes | `classes` | A term from *Unit classes*. |
| `parts.modes[].mobility` | group | yes |  |  |
| `parts.modes[].mobility.base` | term | yes | `mobility` | A term from *Mobility types*. |
| `parts.modes[].mobility.handling` | term | yes | `handling` | A term from *Handling*. |
| `parts.modes[].mobility.speed` | term | yes | `speed-bands` | A term from *Speed bands*. |
| `parts.modes[].armament[]` | list of groups (max 2) |  |  |  |
| `parts.modes[].armament[].family` | term | yes | `weapon-families` | A term from *Weapon families*. |
| `parts.modes[].armament[].damage` | term or empty | yes | `damage-types` | A term from *Damage types*. |
| `parts.modes[].armament[].mount` | term | yes | `aim-models` | A term from *Aim / mount*. |
| `parts.modes[].armament[].delivery` | term or empty | yes | `weapon-delivery` | A term from *Weapon delivery*. |
| `parts.modes[].armament[].range` | term or empty | yes | `range-bands` | A term from *Range bands*. |
| `parts.modes[].armament[].can_target` | list of terms | yes | `target-types` | Terms from *Target types*. |
| `parts.modes[].armament[].affects` | one of `enemies`, `allies`, `both` |  |  |  |
| `parts.modes[].armament[].traits` | list of terms (max 3) | yes | `weapon-traits` | Terms from *Weapon traits*. |
| `parts.modes[].armament[].seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.resource` | term or empty |  | `resources` | A term from *Resources*. |
| `parts.on_death` | list of terms (min 1, max 2) | yes | `on-death` | Terms from *On death*. |
| `matchups` | group | yes |  | Every strength is paired with a weakness; every card has at least one counter that some valid card can satisfy. Never stores unit: links (real names stay in inspiration). |
| `matchups.strengths[]` | list of groups (min 1) | yes |  |  |
| `matchups.strengths[].ref` | typed link | yes |  |  |
| `matchups.strengths[].why` | text | yes |  |  |
| `matchups.strengths[].paired_with` | integer (0-) | yes |  | Index of the weakness that balances this strength. |
| `matchups.weaknesses` | list of link + reasons (min 1) | yes |  |  |
| `matchups.countered_by` | list of link + reasons (min 1) | yes |  |  |
| `matchups.counters` | list of link + reasons (min 1) | yes |  |  |
| `matchups.counterplay` | list of texts (min 1) | yes |  | What the player on the receiving end can do right now (from the patterns). |
| `text` | group | yes |  | Built from templates (no AI in v1). Hand edits on the board overwrite these. |
| `text.name` | text | yes |  | Original working name; checked against every real unit name in the database. |
| `text.pitch` | text | yes |  | One line. |
| `text.signature` | group | yes |  |  |
| `text.signature.name` | text | yes |  | Original ability name. |
| `text.signature.effect` | text | yes |  | One line. |
| `text.team_play_hook` | group | yes |  |  |
| `text.team_play_hook.hook` | term | yes | `team-play-hooks` | A term from *Team-play hooks*. |
| `text.team_play_hook.text` | text | yes |  |  |
| `text.how_it_plays` | group | yes |  | How it plays as a player. |
| `text.how_it_plays.as_user` | text | yes |  |  |
| `text.how_it_plays.as_target` | text | yes |  | What fighting it feels like, and the escape. |
| `text.how_it_plays.teammates` | text | yes |  |  |
| `text.how_it_plays.controls[]` | list of groups (min 1) | yes |  |  |
| `text.how_it_plays.controls[].seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `text.how_it_plays.controls[].input` | text | yes |  | e.g. LMB, RMB, Q, E, Shift, Space. |
| `text.how_it_plays.controls[].action` | text | yes |  |  |
| `text.how_it_plays.tells` | text | yes |  | How enemies read it from above. |
| `inspiration` | group | yes |  |  |
| `inspiration.patterns` | list of ids | yes |  |  |
| `inspiration.source_units` | list of unit ids | yes |  |  |
| `inspiration.remix_of` | list of typed links (max 3) |  |  | Set when the card came from Remix. |
| `balance` | group | yes |  | Hints, not verdicts. |
| `balance.cost_band` | term | yes | `cost-bands` | A term from *Cost bands*. |
| `balance.power` | integer (1-10) | yes |  |  |
| `balance.complexity` | integer (1-10) | yes |  |  |
| `balance.keys` | integer (0-) | yes |  | Buttons the card uses, counted against the tier budget. |
| `balance.flags` | list of terms | yes | `balance-flags` | Terms from *Balance flags*. |
| `created_at` | text |  |  | Not part of the reproduction key. |

## Board

The saved board (Phase 3): a version number for migrations and the cards on it. Schema: `schemas/board.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `schema_version` | text | yes |  | Bumped on every format change; the app migrates older boards on load. |
| `app_version` | text |  |  |  |
| `saved_at` | text | yes |  |  |
| `cards[]` | list of groups | yes |  |  |
| `cards[].card` | concept card | yes |  | The full concept card (see above). |
| `cards[].column` | one of `ideas`, `promising`, `shortlist`, `rejected` | yes |  |  |
| `cards[].position` | integer (0-) | yes |  | Order within the column. |
| `cards[].notes` | text | yes |  |  |
| `cards[].tags` | list of texts | yes |  |  |
| `cards[].stars` | integer (0-5) | yes |  |  |
| `cards[].origin` | one of `rolled`, `duplicate`, `remix`, `manual` | yes |  |  |
| `cards[].parent_id` | text |  |  | The card this was duplicated from. |
| `cards[].edited_fields` | list of texts |  |  | Parts and texts changed by hand; a reroll never overwrites these. |
| `cards[].added_at` | text | yes |  |  |
| `cards[].updated_at` | text |  |  |  |

## Game

One entry in the games registry, `data/games.json`. Schema: `schemas/game.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `id` | id | yes |  | Short id used as the first part of unit ids. Expansions are never game ids. |
| `title` | text | yes |  |  |
| `kind` | one of `game`, `series` | yes |  | game = one title; series = researched as one entry through a representative title (e.g. Battlefield vehicle archetypes). |
| `titles` | list of texts |  |  | For a series: the titles it covers. |
| `year` | integer (1980-) |  |  |  |
| `developer` | text |  |  |  |
| `franchise` | text | yes |  |  |
| `control` | one of `commanded`, `piloted`, `both` | yes |  | commanded = the player orders units (RTS); piloted = the player is the unit (shooter); both. |
| `research_bucket` | id | yes |  | The research batch this game belongs to: r1 Red Alert; r2 Tiberium series and Renegade; r3 Generals, Tempest Rising, Iron Harvest; r4 Company of Heroes, World in Conflict, Wargame, Broken Arrow; r5 Supreme Commander, Planetary Annihilation, StarCraft II, Halo Wars 2, Dawn of War; r6 shooters and hybrids (Battlefield, PlanetSide 2, Foxhole, WARDOGS, Arc Raiders, MechWarrior/BattleTech). |
| `version_researched` | text |  |  | Patch, edition or date the research describes. For a series, name the lead titles newest first, any title used for an archetype it adds, and any title that is the source for one kind of fact; facts from its other titles do not fill fields. |
| `expansions[]` | list of groups |  |  |  |
| `expansions[].id` | id | yes |  | Expansion id, e.g. 'ra3-uprising'. |
| `expansions[].title` | text | yes |  |  |
| `expansions[].year` | integer | yes |  |  |
| `factions[]` | list of groups (min 1) | yes |  | Sides, including AI-only enemies that are researched as units. Use the reserved id 'shared' for units every side can field or games without factions. A unit belongs to the most general faction that fields it. |
| `factions[].id` | id | yes |  | Faction id, e.g. 'soviet'. |
| `factions[].name` | text | yes |  |  |
| `factions[].parent` | id |  |  | For subfactions (e.g. a general or splinter group): the main faction id. |
| `factions[].introduced_in` | id |  |  | Expansion id, if the faction is not in the base game. |
| `factions[].flavour_affinity` | list of terms |  | `faction-flavours` | Terms from *Faction flavours*. |
| `has_tiers` | boolean | yes |  | False if the game has no tech gating; its units then record no tier band. |
| `has_costs` | boolean | yes |  | False if units are not bought; its units then record no cost band. |
| `tier_map[]` | list of groups |  |  | Which tech gates map to which tier band. |
| `tier_map[].gate` | text | yes |  | Building, research or level that unlocks units, in plain words. |
| `tier_map[].band` | term | yes | `tiers` | A term from *Tier bands*. |
| `tier_map[].faction` | id |  |  | Faction id from this game's factions, e.g. 'soviet'. |
| `cost_thresholds` | group |  |  | Lowest price for each cost band above 'very low', in the game's currency. Method: pick an anchor, the price of the game's standard main battle tank (or its main line combat unit if it has no tanks); the thresholds are about 0.5, 0.9, 1.4 and 2 times the anchor, rounded. 'basis' names the anchor. |
| `cost_thresholds.currency` | text | yes |  |  |
| `cost_thresholds.low` | number | yes |  |  |
| `cost_thresholds.medium` | number | yes |  |  |
| `cost_thresholds.high` | number | yes |  |  |
| `cost_thresholds.very-high` | number | yes |  |  |
| `cost_thresholds.basis` | text | yes |  | The anchor unit and its price, and how a multi-resource cost is turned into one number. |
| `speed_reference` | text | yes |  | The unit whose speed counts as 1.0 for speed bands, usually the basic rifle infantry. |
| `sight_reference` | text | yes |  | How far the speed reference unit sees, as the sources give it, and which figure to use where the game lists more than one. Where the game grades sight on a word scale (Wargame optics), which grades count as short, medium and long, with the reference's grade medium. "None" and the reason when the game has no fog of war or no sight figures. |
| `range_reference` | text | yes |  | The maximum reach of the speed reference unit's main weapon, as the sources give it (not where it works best). "None" and the reason when no source gives weapon reach. |
| `damage_map` | map |  |  | The game's own damage categories mapped to our damage types. When the sources cited for a unit give one of its weapons a single category from this map, the mapped type is that weapon's damage, even if the weapon's family does not allow it; record the break as atypical (step 4 under armament[].damage). A registry note that tells you to record a kind of weapon as another type comes first (step 3). A category left out of the map, or a weapon with different categories against different targets, is decided by step 5. |
| `armour_map` | map |  |  | The game's own armour categories mapped to our armour classes. |
| `scope` | one of `starting`, `added` | yes |  | starting = in the brief's list; added = added during research. |
| `added_reason` | text |  |  | Required for added games: the new mechanic it teaches. |
| `teaches_patterns` | list of ids |  |  | For added games: the patterns that justified adding it. |
| `status` | one of `planned`, `in-progress`, `done` | yes |  |  |
| `sources[]` | list of groups |  |  | A citation. Paraphrase only; never copy text or images. When another established site covers the unit, cite it rather than a third page of the same site. |
| `sources[].url` | URL | yes |  | The page actually read (https only; never an image). |
| `sources[].title` | text | yes |  | Page title and site. |
| `sources[].kind` | term | yes | `source-kinds` | A term from *Source kinds*. |
| `sources[].accessed` | text | yes |  | Date the page was read. |
| `sources[].note` | text |  |  |  |
| `sources[].supports` | list of texts |  |  | Which fields this source backs, as paths such as 'tier', 'cost_band' or 'abilities/0'. |
| `sources[].version` | text |  |  | Patch, edition or remaster the page describes, for games that change. |

## Pattern registry

The shared list of pattern ids, `data/pattern-registry.json`. Schema: `schemas/pattern-registry.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `schema_version` | text | yes |  |  |
| `patterns[]` | list of groups | yes |  |  |
| `patterns[].id` | id | yes |  | Lower-case id with dashes. |
| `patterns[].name` | text | yes |  |  |
| `patterns[].category` | term | yes | `pattern-categories` | A term from *Pattern categories*. |
| `patterns[].summary` | text | yes |  |  |
| `patterns[].from_brief` | boolean |  |  | True if the brief names it as an example. |

## Word list

One fixed word list, `data/vocab/<list>.json`, with the fields each term may carry. Schema: `schemas/vocabulary.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `id` | id | yes |  | Lower-case id with dashes. |
| `label` | text | yes |  |  |
| `description` | text | yes |  |  |
| `group` | one of `core`, `supporting` | yes |  | core = named in the brief; supporting = added to make the core lists work. |
| `status` | one of `draft`, `approved` | yes |  |  |
| `version` | text | yes |  |  |
| `terms[]` | list of groups (min 2) | yes |  |  |
| `terms[].id` | id | yes |  | Lower-case id with dashes. |
| `terms[].label` | text | yes |  |  |
| `terms[].description` | text | yes |  |  |
| `terms[].aliases` | list of texts |  |  |  |
| `terms[].replaces` | list of ids |  |  | Term ids of earlier word-list versions that this term takes over (merged or renamed). Data still using them must move to this term. |
| `terms[].notes` | text |  |  |  |
| `terms[].examples` | list of texts |  |  | Reference examples from the research, paraphrased. |
| `terms[].rarity` | term |  | `rarity` | How readily the generator offers this term (see the rarity list). |
| `terms[].source_only` | boolean |  |  | Recorded for research; never rolled by the generator. |
| `terms[].rank` | integer |  |  | Order on a scale (speed, size, cost, armour...). |
| `terms[].classes` | list of terms |  | `classes` | The unit classes this term is physically possible for. A class left out is a hard ban: the generator never rolls the term for it. This is how 'aircraft don't get tracks' is enforced. A class for which the term is possible but unusual stays in this list and gets a rarity in class_rarity. |
| `terms[].class_rarity` | map |  |  | Rarity of this term for particular classes, used instead of 'rarity' when the unit is of that class; classes not listed use 'rarity'. Every key must be in 'classes'. This is how cross-overs such as a flamethrower on an aircraft stay rare and appear only at high spice. A faction's one-step bonus for favoured parts does not apply to it. |
| `terms[].allowed` | map |  |  | Whitelist of terms this one may combine with on the same unit, keyed by vocabulary id. Checked both ways. |
| `terms[].excluded` | map |  |  | Terms this one may not combine with on the same unit, keyed by vocabulary id. |
| `terms[].requires` | list of lists |  |  | What the unit must also have for this term to make sense. |
| `terms[].min_tier` | term |  | `tiers` | Lowest tier that may use this term. |
| `terms[].uses_key` | boolean |  |  | Ability kinds and mobility traits: true if it is a button that counts toward the tier's key budget. |
| `terms[].pattern` | id |  |  | Mobility traits: the mechanic pattern a key-bound trait stands for. |
| `terms[].default_damage` | term |  | `damage-types` | A term from *Damage types*. |
| `terms[].default_aim` | term |  | `aim-models` | A term from *Aim / mount*. |
| `terms[].default_delivery` | term |  | `weapon-delivery` | A term from *Weapon delivery*. |
| `terms[].default_range` | term |  | `range-bands` | A term from *Range bands*. |
| `terms[].default_handling` | term |  | `handling` | A term from *Handling*. |
| `terms[].target_type` | term |  | `target-types` | Mobility: what kind of target a unit moving this way is. |
| `terms[].strong_vs` | list of typed links |  |  | Damage types: what this damage is good against (typed links to what the target is). |
| `terms[].weak_vs` | list of typed links |  |  |  |
| `terms[].immune` | list of typed links |  |  | Damage types: targets this damage does nothing to. |
| `terms[].seats` | list of terms |  | `seat-roles` | Terms from *Seat roles*. |
| `terms[].min_players` | integer (1-) |  |  |  |
| `terms[].max_players` | integer (1-) |  |  |  |
| `terms[].max_keys` | integer (0-) |  |  | Tiers: most buttons a unit may have, signature included. |
| `terms[].max_passive` | integer (0-) |  |  |  |
| `terms[].max_keys_per_seat` | integer (1-) |  |  |  |
| `terms[].source_rule` | text |  |  | How to code a source unit with this term: what in the source decides it. For tiers, how a game's tech level maps to the tier. |
| `terms[].themes` | list of texts |  |  |  |
| `terms[].favoured` | map |  |  | Faction flavours: term ids the flavour leans toward, keyed by vocabulary id. |
| `terms[].avoided` | map |  |  | Faction flavours: term ids held back at low spice, keyed by vocabulary id. |
| `terms[].favoured_weight` | number (1-) |  |  | Faction flavours: how much more likely favoured terms are. |
| `terms[].avoided_until_spice` | integer (1-5) |  |  |  |
| `terms[].name_style` | text |  |  |  |
| `terms[].min_spice` | integer (1-5) |  |  |  |
| `terms[].weights` | list of numbers (min 5, max 5) |  |  | Rarity: relative weight at spice 1-5. |
| `terms[].severity` | one of `block`, `warn` |  |  | Balance flags: block = never on a rolled card; warn = shown as a hint. |
| `terms[].points` | group |  |  | Weights for the generator's balance hints, 0-3 each. Proposed with the generator (Phase 2). |
| `terms[].points.cost` | integer (0-3) | yes |  |  |
| `terms[].points.power` | integer (0-3) | yes |  |  |
| `terms[].points.complexity` | integer (0-3) | yes |  |  |
| `terms[].brings` | group |  |  | What this term adds to a card's matchups when rolled (filled in with the generator, Phase 2). |
| `terms[].brings.strengths` | list of link + reasons |  |  |  |
| `terms[].brings.weaknesses` | list of link + reasons |  |  |  |
| `terms[].brings.counters` | list of link + reasons |  |  |  |
| `terms[].brings.countered_by` | list of link + reasons |  |  |  |
| `tie_breaks[]` | list of groups |  |  | Rules for coding source units when two or more terms seem to fit equally well: which one to pick. Written from the calibration pilot, where coders disagreed. A term of another list is written '&lt;list&gt;:&lt;id&gt;'. |
| `tie_breaks[].terms` | list of texts (min 2) | yes |  | The terms the rule chooses between. |
| `tie_breaks[].rule` | text | yes |  | Which term to pick, and how to tell, in plain words. |

## Shared parts

**source**: A citation. Paraphrase only; never copy text or images. When another established site covers the unit, cite it rather than a third page of the same site.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `url` | URL | yes |  | The page actually read (https only; never an image). |
| `title` | text | yes |  | Page title and site. |
| `kind` | term | yes | `source-kinds` |  |
| `accessed` | text | yes |  | Date the page was read. |
| `note` | text |  |  |  |
| `supports` | list |  |  | Which fields this source backs, as paths such as 'tier', 'cost_band' or 'abilities/0'. |
| `version` | text |  |  | Patch, edition or remaster the page describes, for games that change. |

**relation**: A typed link plus a plain-words reason.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `ref` | typed link | yes |  |  |
| `why` | text | yes |  | The reason, in plain words. |

**uncertain**: A specific point that is less certain than the overall confidence, or where sources disagree.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `path` | text | yes |  | The field the doubt is about, as a path with / (sensors/sight, armament/0/range). |
| `note` | text | yes |  |  |
| `sources_disagree` | boolean |  |  |  |

**fitNote**: Where no vocabulary term fitted well. Collected into a vocabulary-gaps report that feeds the next vocabulary version.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `path` | text | yes |  | Where the term would go, as a path with / between field names and list positions (armour/models, armament/2/damage). For something left out entirely, the list it would have gone in (abilities, armament). |
| `used` | text | yes |  |  |
| `wanted` | text |  |  |  |
| `note` | text | yes |  |  |

**review**: Checker status. The research run samples entries and re-checks them against their sources.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `status` | one of `unchecked`, `checked`, `disputed` | yes |  |  |
| `checked_by` | text |  |  |  |
| `checked_on` | text |  |  |  |
| `checked_paths` | list |  |  |  |
| `wrong_paths` | list |  |  |  |
| `notes` | text |  |  |  |

