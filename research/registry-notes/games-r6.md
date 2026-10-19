> **Working notes from step 1** (filling the games registry). They explain choices and give tips for this batch's research agents. They were written before the fact-check, so where they and `data/games.json` differ, the registry wins; the fact-check fixes are listed in the step-1 pull request.

# Games registry, batch r6: notes

Entries in `games_r6.json`: `battlefield` (series), `ps2`, `foxhole`, `wardogs`, `arc-raiders` and `mechwarrior` (series). `check_games.py` prints OK.

Checks run:
- **URLs.** Every cited URL was checked. Wiki pages went through each site's MediaWiki API (Fandom, foxhole.wiki.gg, arcraiders.wiki, sarna.net): each page exists under exactly the cited title, with no redirect. The other pages (Steam News, Gfinity, WARDOGS Hub, MP1st) return 200, and their page titles match the cited titles.
- **Copy-check.** A six-word copy-check of every text field against all the pages read (wiki text, the Steam patch notes, community pages) finds no shared runs.

## For the orchestrator (affects other batches)

1. **Speed reference in shooters.** Rule used: 1.0 is the speed a soldier can keep up on foot.
   - **Sprint where it is unlimited:** Battlefield and PlanetSide 2, both 6.5 m/s.
   - **Walking where sprint drains stamina:** Foxhole, 5 m/s.

   Either way, almost every vehicle in these games comes out "fast" or "very fast". Bands then separate infantry from vehicles but say little about one vehicle against another. If that matters, the pilot (step 2) could add a vehicle-to-vehicle note, or use a slower reference for shooters. Renegade (r2) has the same issue but gives no numbers.
2. **Wrong site names in the samples.**
   - `planetside.fandom.com` is called "PlanetSide 2 Wiki", but `docs/samples.md` cites it as "PlanetSide Wiki".
   - The samples cite `foxhole.fandom.com/wiki/Battle_Tank`. That Fandom wiki is no longer maintained (its Battle Tank page was last edited in 2022). The official, current wiki is `foxhole.wiki.gg`, whose API works with a descriptive User-Agent.
3. **Tier gates carry no faction tag** (Foxhole), for the reason r2 gave: the validator would reject `shared` units otherwise.

## Games whose tiers or prices are hard to map, and how I decided

### Battlefield (`has_tiers` false, `has_costs` false)
- Vehicles come from map spawns on timers, at bases or captured flags. BF1 and BFV let the player choose among a team's heavy-vehicle spawns; BF2042 has call-ins limited by a team cap and a personal timer. Nothing is bought, and no tech gates anything.
- Near-misses I did not use:
  - BFV squad reinforcements cost squad points earned in the match (an in-match price, but only for a few call-ins).
  - BF1 behemoths are a comeback mechanic for the losing team.
  - Vehicle unlocks are XP progression.
- **Factions.**
  - `shared` holds the archetypes: the sides' vehicles are mirrors (the wiki calls the Bad Company M1A2 statistically identical to its Russian and MEC counterparts).
  - `us`, `russia`, `germany` and `britain` exist only for vehicles one side alone fields, such as BF1's L30 airship (Germany) and Dreadnought (Britain), or BFV's side-specific tanks.
  - No flavour is given, because the sides play the same.
- **Speed.** 6.5 m/s comes from a DICE gameplay designer's posts relayed by MP1st, cited as `community`. Vehicle top speeds are in some Battlefield Wiki infoboxes only (BF4 M1 Abrams 40/56 km/h); older titles give words ("Medium").

### PlanetSide 2 (`has_tiers` false, `has_costs` true)
- **Tiers.** No tech ladder. The one gate is map control: main battle tanks can be pulled away from the warpgate only while a linked Tech Plant is held. MBTs also spawn only at large outposts, major facilities and the warpgate. Either rule as a tier would make MBTs T2 and everything else T1, which says little.
- **Prices.**
  - The anchor is 450 nanites, the price of every MBT.
  - The bank caps at 750, so nothing priced in nanites reaches "high". The Liberator and Galaxy also cost 450 (medium).
  - The Colossus (15 Polystellarite from outfit war assets, Merit for its upgrades) and the Bastion Fleet Carrier are not bought with nanites. I said to record them as very high with no raw price.
  - Free infantry classes get raw 0, which gives very low.
- **Damage map.**
  - The resist types are the game's damage categories. The keys use the names the PlanetSide 2 Wiki's Template:Resist gives them.
  - "Gatling Guns" (Tank Buster, Shredder) is mapped to armour-piercing, because those guns are built to strip vehicles.
- **PlanetSide 2 damage: which step decides** (armament[].damage). Checked for the research run against the wiki's Template:Resist, its Vehicle armor and damage resistance page, the WeaponInfobox template, about a dozen weapon pages and the resist types in Daybreak's Census API (October 2026).
  - **Step 4 binds.** Every weapon's damage carries a resist type (explosive weapons often carry two, see Direct hit plus splash below). A weapon page names it in the Damage Type row of its infobox (the `DamageType` field, linked to the resist page), and Template:Resist lists, under each type, the weapons that use it. Either page gives the category for step 4; cite it or name it in an uncertain entry. "Explosive Splash" on some pages is the old name of Common Explosive.
  - **Census names.** The Census API (see PlanetSide 2 official role lines below) numbers the same types but words several of them differently. Match them by number with Template:Resist: type 5 is Light Anti-Vehicle on the wiki and Heavy Anti-Armor in Census, 12 is Flak Explosion and Flak Explosive Blast, 28 is Gatling Guns and AP Gatling, 46 is Core Explosion and Core Explosion / Glaive. A singular form (Tank Shell, A2A Missile) is the same name.
  - **Left out of the map:** the three collision types (hitting or being hit by moving objects, terrain and falls), Tempest Burn (an Esamir hazard) and Orbital Strike (type 47 in Census). No weapon a unit fires uses them; one that did would take step 5. Running a soldier over is not a weapon.
  - **Step 1 still comes first.** A tool that heals or repairs (the Medical Applicator, the Nano-Armor Kit) is repair.
  - **Step 3 exceptions** (record these kinds of weapon as the type named, whatever their resist type):
    - **Direct hit plus splash.** Many explosive weapons have two types. The Damage Type row names the direct-hit type first and the splash type after it (the weapon data tables split them into `DamageType` and `InDamageType`), and the splash is usually Common Explosive. Record the mapped type of the direct-hit type, and code the splash as the splash trait, not as a second category. A weapon whose direct hit is Common Explosive too is explosive.
    - **Flak.** A gun our flak family fits, whose splash type is Flak Explosion, is explosive, whatever its direct-hit type (often Heavy Machine Guns).
    - **Laser or plasma.** A weapon coded in our laser or plasma family is energy. The game puts Vanu beam and bolt weapons under the same resist types as the other empires' guns (Template:Resist lists them together), so step 4 would give them a type those two families do not allow. The Dawn of War II note does the same.
    - **Not an exception: Vanu guns of the bullet types.** A Vanu gun whose resist type is Small Arms, Sniper Rifles, Heavy Machine Guns, Aircraft Machine Guns or Anti-Aircraft Machine Guns is dealt with like the other empires' guns of that type. Code its family by how it fires (small arms, machine gun, sniper), not as laser or plasma, let step 4 give kinetic, and mention the energy look in the summary. This replaces the earlier wording, which called the Small Arms case a step 3 exception.
- **Armour map.** None: vehicles each have their own resist profile. MBTs, the Lightning, the Colossus and the Valkyrie use directional armour.
- **PlanetSide 2 armour: steps 1 to 5** (the armour-class order).
  - **Step 1 never applies:** there is no armour_map. The resist values per vehicle (from the page Vehicle armor and damage resistance) belong to the damage side; step 5 can compare them.
  - **Step 2 never applies.** The game has no light, medium or heavy armour word. Where an official description calls a vehicle light or heavy, or lightly armoured, it describes a job or a weight, and the wiki's Type field (MBT, Transport and the like) is the wiki's label.
  - **Step 3:** the tanks the cost anchor names (`cost_thresholds.basis` in data/games.json) are heavy. The Liberator and Galaxy share the anchor's price but are not tanks, so step 3 does not decide them.
  - **Steps 4 and 5** decide every other unit. For step 5, the resist page gives each vehicle's resist values and the infoboxes give health; compare them with the step 3 tanks and with a soldier, who takes every type in full.
  - **Check A.** The game has no tiers, so a unit of body size huge can be super-heavy. This note makes no unit super-heavy by name.
  - **Soldiers.** The resist page says infantry take every resist type in full, so the five non-MAX classes are unarmoured. Their personal shields, and the Nanoweave Armor and Flak Armor suit picks that all five classes can take, are protection every soldier can get: they never lift the class (mention them in armour.notes). The MAX and the Defector have their own column in the resist table, a tougher infantry armour type, so the soldier rule makes them light at least, and the power-suit line (a suit no bigger than a soldier is light, a bigger one medium) decides between light and medium.
- **Range words** (armament[].range; the registry has no reference weapon). Weapon pages give an Effective Range word, not a maximum reach. Read it as the band, the way the range tie-break reads a source calling a weapon short-, medium- or long-ranged: Close and Short are short; Medium and Medium-Long are medium; Long and Very Long are long. A word never makes a weapon off-screen. A weapon with two kinds of fire takes the word of the one that reaches further (the Aphelion's energy wave).
- **Flavour.**
  - TR → soviet: red, authoritarian, high fire rate, the anchored Prowler.
  - VS → allied and empire: hover tanks, lasers and plasma, agility.
  - NC is left out. Its heavy single hits, shields and rail guns sit between soviet and allied.
  - NSO is left out.
- **NSO** arrived in a free 2020 update, so it has no `introduced_in`.

### Foxhole (`has_tiers` true, `has_costs` true)
- **Tiers.** Each faction researches its tech during a war, at Engineering Centers, on two trees. The vehicle tree's first eight levels are paid in Iron Alloy and later levels in Copper Alloy. I used that split as the t2/t3 line, plus the "Tier 2 Facilities" and "Tier 3 Facilities" technologies, which unlock facility production such as the Heavy Tank Assembly upgrade of the Large Assembly Station:

  | Band | Gates |
  |---|---|
  | t1 | Starting technology |
  | t2 | Vehicle research, Iron Alloy levels; Weapons and structures research; Tier 2 Facilities |
  | t3 | Vehicle research, Copper Alloy levels; Tier 3 Facilities |

  - **Typical levels.** The wiki's vehicle class infoboxes carry a `tech_level`: motorcycle 1, armoured car 2, tankette 4, scout tank, heavy-duty truck and landing APC 5, half-track 6, light tank 8, assault tank, light infantry tank and siege tank 10, destroyer tank 11, battle and super tanks 12.
  - **Result.** Light tanks are t2; assault, destroyer, battle and super tanks are t3; unarmed logistics vehicles are t1.
  - **Caveat.** The tree order can change between wars, so record the gate from the unit page or the typical level, and say so.
  - **Tier 2 and 3 vehicles are upgrades, not tiers.** Field Modification Center upgrades (10% and 20% damage reduction) are recorded as upgrades, as `tiers.json` says. Prototypes (built from Prototype Kits for 100 Basic Materials, taking 25% more damage) are also not tiers.
  - **Weapons and structures research** is one t2 gate for infantry kits built around a researched weapon. Use t3 for infantry only for Tier 3 Facilities items.
- **Prices.**
  - The anchor is about 150 Refined Materials, from the two Garage-built assault tanks (Silverhand Mk. IV 160, Falchion 135).
  - Formula: price = Refined Materials + Basic Materials / 10. This is my weighting, from the refinery ratios: 20 Components per Refined Material, 2 Salvage per Basic Material.
  - Facility-built vehicles cost Steel Construction Materials, Assembly Materials I-V and Rare Alloys, which have no clean conversion. Battle and super tanks take 18-48 hours to build and are very high by rule. Other facility vehicles are banded by judgement.
  - Examples: Devitt light tank 120 is low; Falchion 135 and Silverhand 160 are medium.
- **Speed.** Vehicle pages give road and off-road top speeds in m/s. Compare off-road speeds with the 5 m/s soldier: most tanks come out "medium" (Silverhand 5.42 off road), which matches how Foxhole plays.
- **Damage and armour maps.** These use the Damage Types and Damage Resistance pages (https://foxhole.wiki.gg/wiki/Damage_Types, https://foxhole.wiki.gg/wiki/Damage_Resistance). They are not in `sources` because of the four-source limit.
  - Note the trap: Foxhole's own "Unarmoured" category means trucks, which are our `light`. Soldiers have no category: they take full damage, so they are `unarmoured`.
  - Super tanks share "Heavily Armoured" with all other tanks; record them as super-heavy by judgement.
  - Ship categories are left out; judge naval units one by one.
- **Flavour** is left out for both sides. The Factions page says their gameplay is identical. It does note that Warden tanks have more armour and less health than Colonial ones, which is a weak soviet hint for Wardens.

### WARDOGS (`has_tiers` false, `has_costs` true)
- **Tiers.** Vehicles unlock by account progression: a Driver, Pilot or WARDOG track level plus a one-off cash fee. That is like Battlefield unlocks, not in-match tech, so there is no tier map. If a proxy is ever wanted, Season 2 gates run from Driver 3 (Ural) to Driver 35 (L2A6) and Pilot 35 (Havoc).
- **Prices.** Bulkhead publishes no vehicle prices, and the community figures conflict.
  - Closed Alpha and Season 1 lists (wardogswiki.cc, keymap.io, boostroom) give the L2A6 at $14,000 and the Havoc at $18,000.
  - The Season 2 list (WARDOGS Hub, 15 October) gives the L2A6 at $22,000 and the Havoc at $28,000. Gfinity confirms the new T-72B3 at $16,000.
  - The official patch notes describe the T-72B3 as the cheaper of the two main battle tanks, next to the L2A6. That only fits the Season 2 figures, so I used Season 2.
  - The anchor is the T-72B3 at $16,000. The L2A6 is called the "Heavy Tank" in the unlock tracks.
  - Results: L2A6 22,000 is medium, Havoc 28,000 high, Gepard 14,000 low, Bobcat 500 very low.
  - Bulkhead has said Season 3 may come early (PCGamesN, 17 October), so prices may move again. Record the season next to every raw price.
- **Factions.** The three teams appear to differ only in uniform colour: one shared vendor, and only one team was played when the vendor was recorded. Units go under `shared`; the team ids are there in case faction-locked stock is confirmed. Season 2's Lonestar cash bonus was withdrawn after one day.
- **Armour.** Body armour and helmets come in levels 1-4. In Season 2, Level 3 reduces damage by 50% and Level 4 by 60%. There is no `armour_map`, because a soldier's armour comes from the loadout. Suggestion: a soldier is unarmoured, or light with Level 3-4 armour. Vehicles have health in game units (Bobcat 200, tanks 800, M113 1,000 per keymap.io).

### ARC Raiders (`has_tiers` false, `has_costs` false)
- **Why neither.** Nothing is a bought unit. ARC machines are spawned by the world. The raider's gear has trader prices in Coins and crafting recipes, but those are item prices.
- **Not tiers either:**
  - Workshop bench levels gate crafting.
  - Weapon levels I-IV are upgrades of the same gun.
  - Gear rarity (common to legendary) is loot quality.
- **Factions.** `shared` is every raider (no player factions); `arc` is the AI enemy side. The research is mostly ARC machines, plus the raider's shield model as an armour pattern.
- **Armour map.**
  - The game's categories are the machine infobox field `armor`: None, Light, Heavy.
  - I mapped None → light (drones), Light → medium and Heavy → heavy.
  - Exceptions to judge:
    - Fireball (Heavy, 20 HP) and Comet are small, so `heavy` breaks the size rule for that class: record medium, or keep heavy and list it as atypical.
    - Bombardier and Vaporizer have Light plating but 2,670 and 1,500 HP.
  - The Queen and Matriarch (Heavy, 23,000 HP) are super-heavy by judgement.
  - Raiders are `unarmoured` with the `charge-shield` armour model, whatever shield they wear.
- **Damage map.**
  - The categories are the six ammo types, ranked by ARC armour penetration.
  - Heavy is mapped to armour-piercing, Launcher to explosive and Energy Clip to energy.
  - ARC attacks (fire, shockwaves, mortars, lasers) have no ammo type: use step 5 under armament[].damage.

### MechWarrior / BattleTech (`has_tiers` false, `has_costs` false, as the brief asks)
- **Why no tiers or costs.** Tech eras (3025 Succession Wars, 3050 Clan Invasion, later) are times, not gates. C-bill prices and Battle Value exist, but the brief asks for weight classes.
- **Weight class as a cost proxy, if a cost band is ever needed:** light → low, medium → medium, heavy → high, assault → very high. I did not put this in the entry.
- **The `armour_map` is a weight-class proxy.**
  - BattleTech has no named armour categories: armour is points per location.
  - Mapping: light and medium 'Mechs → medium ("light walkers"), heavy and assault → heavy (the class text names assault mechs), superheavy → super-heavy.
  - Drop the map if a proxy is not acceptable.
- **MechWarrior armour: steps 1 to 3** (the armour-class order). Checked against the BattleTechWiki's BattleMech page and InfoBoxBattleMech template (October 2026).
  - **Step 1 decides every 'Mech the map lists.** The key is the weight class, which the BattleTechWiki infobox fills in from the mass (Light, Medium, Heavy, Assault, Superheavy). This note names no step up or down: a thinly armoured heavy 'Mech is still heavy. Describe its armour in words in armour.notes.
  - **Ultralight 'Mechs** (the infobox's class below 20 tons) are not in the map. Go on to step 4, where a walker bigger than a soldier is medium.
  - **Step 2 never applies.** BattleTech has no light, medium or heavy armour word. Light, medium and heavy are weight classes, and the armour a design's page names (a brand, or a kind of plating such as ferro-fibrous) does not change the class. A plating with a special effect goes in armour.notes, or into an armour model where one fits.
  - **Step 3 decides nothing.** The game has no costs, and the registry names no standard main battle tank.
  - **Check A.** Superheavy 'Mechs are super-heavy through the map. The game has no tiers, so another unit of body size huge can be super-heavy too.
  - **Other kinds of unit** (combat vehicles, aerospace fighters, battle armour), if any is coded, are not in the map either: go on to step 4.
- **Damage map.** It covers the three weapon kinds (Energy, Ballistic, Missile). They are MechWarrior Online's hardpoint types, and the BattleTechWiki's BattleMech page sorts 'Mech weapons into the same three, with physical attacks besides.
- **MechWarrior damage: which step decides** (armament[].damage). Checked against the BattleTechWiki's BattleMech page and about twenty weapon pages, and the MechWarrior Online Wiki's Weapons page (October 2026).
  - **Step 4 binds.** A weapon's kind is the first word of the Type field in its BattleTechWiki infobox: Energy for lasers, PPCs, flamers and plasma weapons, Ballistic for machine guns, autocannons and Gauss rifles, Missile for LRMs and other launchers. In MechWarrior Online it is the hardpoint type the weapon needs. A 'Mech's own page lists its weapons without their kind, so step 4 needs the weapon's page, or the MechWarrior Online 'Mech page's hardpoint types, among the sources (cited, or named in an uncertain entry).
  - **Kinds the map leaves out take step 5:** Artillery (the Long Tom, Thumper and Sniper pieces, and the Arrow IV, whose Type reads Artillery (Missile)), Equipment (the anti-missile system and TAG) and Utility (the Narc beacon). Melee weapons a design carries (a hatchet and the like) have no kind, and step 5 gives melee. Unarmed physical attacks stay off the unit (see Game-wide mechanics).
  - **Steps 1 and 2 still come first.** TAG and the Narc beacon do no damage: they only mark a target for friendly guided fire, so they take step 2. The anti-missile system shoots down incoming missiles; where its sources show it firing on its own, it is the interceptor armour model rather than a weapon.
  - **Step 3 exceptions** (record these kinds of weapon as the type named, whatever their kind): flamers (Energy) are fire; Gauss rifles of every size (Ballistic) are armour-piercing.
  - **Not exceptions:** autocannons and machine guns (Ballistic) take kinetic from the map; plasma rifles and plasma cannons (Energy, marked heat-inducing in their Type) take energy; missiles take explosive, guided or not.
  - **Words in brackets.** The Type field also tags some weapons in brackets (anti-infantry, heat-inducing, direct fire). These are the wiki's words, so they are not official text for roles, but the secondary-role rule counts a source that calls a weapon anti-infantry, and this tag is one.
- **Which title decides** (Series games). This entry splits facts by kind, and the split comes before the newest-title rule. What a 'Mech carries and where comes from its tabletop design on the BattleTechWiki: its weapons and which way each faces, armour values, weight class, speed and the tabletop ranges the range_reference compares. How it plays comes from MechWarrior 5: Clans where its pages cover the 'Mech, otherwise from MechWarrior Online: whether a weapon locks on, fires one shell or a burst, or fires indirectly, and what happens when it dies. Kinds of target come from all counted titles together: the tabletop has infantry, VTOLs (low air) and naval vessels, so 'Mech weapons list them where their own rules allow. A lock-on weapon still lists only what the title that decides its play lets it lock onto (can_target step 2), plus naval by the naval rule; the tabletop's wider list adds nothing to it. So the Atlas's centre-torso lasers face backwards; an Inner Sphere autocannon that MechWarrior Online fires as one shell per shot is a cannon; LRMs lock on and also fire indirectly; SRMs that MechWarrior Online calls non-locking are rockets with no homing trait, and the tabletop's self-guided wording goes in notes. Pilots come back in the next drop or match, so on_death is respawn, basis in-game.
- **Control.** Set to `both`: MechWarrior is piloted, the 2018 BattleTech game and the tabletop are commanded.
- **Factions.**
  - `inner-sphere` and `clan` are the main tech split.
  - `shared` is for Star League designs fielded by both.
  - The five Great Houses are subfactions of `inner-sphere`.
  - Only House Kurita (Draconis Combine, a Japanese-styled feudal empire) gets a flavour: empire.
  - Possible but weaker: Steiner → soviet (the Lyran taste for assault 'Mechs).
  - The Clans are left out: an elite, honour-bound warrior caste with superior tech, between allied and empire.
- **Speed.** The Centurion CN9-A (4/6 movement, 43.2/64.8 km/h) is the reference: the games have no playable infantry, and mediums are the workhorse class. An Atlas (32.4 km/h cruising, 54 km/h top) comes out slow and a Jenner (118.8 km/h) fast.

## Other uncertainties

- **PlanetSide 2:**
  - The developer field says only "Sony Online Entertainment (Daybreak Game Company from 2015)". Later studio changes (Rogue Planet Games and after) were not checked.
  - The wiki's cost table may lag behind recent patches. Spot-check a unit's price against its own page or patch notes.
  - Two step 3 exceptions under PlanetSide 2 damage are choices made here, not game labels. Direct hit plus splash follows the direct-hit type, where the Generals note sends a weapon with two damage names to step 5. Laser or plasma gives Vanu beam and bolt weapons energy, where step 4 would give them armour-piercing with an atypical break. Decide whether to keep both.
  - The italic Class Overview paragraphs on class pages: if a source shows they are the game's own text, they become official class text.
- **MechWarrior / BattleTech:**
  - The MUL refused this session's requests (HTTP 403 at masterunitlist.battletech.com), so reading the unit role there (Official role lines) is untested. If coders cannot reach it either, roles step 1 never finds an official line for this game.
  - Whether MechWarrior Online or MechWarrior 5: Clans shows a role or description line in the game was not checked.
  - Physical attacks and battle armour riding come from the tabletop. The pages I read do not say whether the two piloted titles have them, so the Series games rule (the newest counted title decides) could not be applied; the note leaves both off the 'Mech either way.
  - Riding battle armour gives the 'Mech no passenger seats. If OmniMech handholds should count as seats, the passenger passive of Paired entries would apply to most OmniMechs.
- **Battlefield:** the side ids beyond `shared` are a guess at what the research will need. Agents should record mirrored vehicles once, under `shared`, naming each side's model in the notes.
- **WARDOGS:**
  - Prices and unlock levels come from fan sites. Only the patch notes are official.
  - The game is three weeks into a stormy Season 2, so confidence for its units should stay medium or low.
- **Foxhole:** `year` is 2017 (Early Access). Version 1.0 came in 2022.
- **ARC Raiders:** the year is the 2025 launch. A PvE toggle is in beta (13-20 October 2026) and may change how ARC are met.

## Game-wide mechanics

Mechanics that belong to the game, not the unit (see Shared mechanics and universal keys in the Conventions). Leave them off every unit's weapons and abilities. A unit that does one of them better or worse than the rest says so in its strengths or weaknesses.

### Battlefield (`battlefield`)

Written for pilot round 1, from the Battlefield Wiki's Vehicle Boost, Spotting and Parachute pages.

- **Entering, leaving and switching seats**: universal keys (enter or leave, bail out, switch seat) on every vehicle, ejecting from an aircraft included.
- **Parachutes**: a soldier's own way down after bailing out of an aircraft or jumping from a height. Not a vehicle ability; leave it off.
- **Spotting** (the universal ping key): any player, on foot or in a seat, can mark enemies for the team. Leave it off; a vehicle part that spots by itself (a radar, a spotter seat) is coded as a sensor.
- **Vehicle boost**: from Battlefield 3 on, ground vehicles boost on the sprint key with no meter, and Battlefield 4 adds boats; helicopters do not boost. With no meter it counts in the unit's speed (see Speed bands), not as an ability or the boost trait. A jet's afterburner follows the jet's own page.

### PlanetSide 2 (`ps2`)

Written in the research run's batch preparation, before any ps2 unit is coded, from the PlanetSide 2 Wiki's Spotting, Terminals, Vehicle Resupply, Facility Capture Mechanics, Spawn Beacon, Redeploy, Squad Leader, Orbital Strike, Battle Rank, Implants, Personal Shield, Medical Applicator, Nano-Armor Kit, Fire Suppression System, Nanite Auto Repair System, Decoy Flares, Ejection System, Construction System, Reclaimed Vehicle and Vehicle armor and damage resistance pages, and its Universal Certifications and class certification templates.

- **Entering, leaving and switching seats**: universal keys (enter or leave, bail out, switch seat) on every vehicle. A vehicle with passenger seats keeps one passive for them (see Paired entries).
- **Ejection System**: riders who bail out of an aircraft that has it drop straight down and take no fall damage. It is built into the Valkyrie and the Galaxy and is a utility-slot pick on the empire fighters and the Liberator. Because only these aircraft give the bail-out key this effect, record it on them as a passive: innate where it is built in, a loadout pick in the utility slot's exclusive_group where it is picked. No pattern fits, so leave patterns empty and add a fit_note.
- **Spotting** (the universal ping key): any player can mark the enemy under the crosshair, and allies near the spotter see the mark for a few seconds. Leave it off. A part that spots by itself is coded on its unit: a radar pick goes in sensors.notes, a dart or sensor placed on a key links reveal-area, and a weapon that marks what it hits takes the mark trait.
- **Terminals and resupply at bases** (no pattern): infantry change class and loadout, refill ammunition and consumables and restore their shields at equipment terminals; ground vehicles refill at a base's ammo towers and aircraft on its landing pads. These are base features: leave them off. A unit that refills or repairs others records it (resupply-allies, repair-allies): the Engineer's ammunition pack and repair tool, a vehicle ammo dispenser pick, a medic's healing. Vehicle ammunition is a limited pool that only these means restore, so the limited-ammo resource fits vehicles where that field's rule fits.
- **Spawning and redeploying** (no pattern): soldiers respawn at bases, at spawn points that units provide, or in a drop pod above a squad's spawn beacon, which every member of a squad with at least two players carries. Redeploy takes a player back to spawn selection after a short wait, and no death is counted. All of these are game-wide: leave them off the infantry, with no drop-in-from-above on any class. A unit that teammates spawn at or into records host-spawn-point (a Sunderer deployed as a mobile station, a vehicle squadmates can spawn into).
- **Capturing bases** (a game-mode rule, no pattern): only soldiers on foot move capture points. MAXes, Defectors, cloaked soldiers and anyone inside a vehicle cannot, except at the vehicle capture points some facilities have. A unit that cannot capture may say so in its weaknesses. Carrying a conduit at Capture the Conduit facilities is a game-mode rule too.
- **Hacking** (capture-structure): not game-wide. Infiltrators can turn most enemy terminals to their own side (the Terminals page), and the Facility Capture Mechanics page mentions hacked turrets too. Record it on that class.
- **Progression** (no pattern): battle ranks, certification points and the Advanced Specialization Program are account progression that carries over between lives. No unit gains ranks of its own while it lives, so there is no veterancy. Gear unlocked with certification points is a loadout pick (ability source loadout, however it was unlocked). Its further ranks are bought outside the match: bands use rank 1, as Stock values asks, and notes can say what later ranks change.
- **Implants** (no pattern): every soldier, MAX included, fills two implant slots from one shared pool of perks, drawn from packs or crafted. Leave them off. An implant the Implants page marks as class-specific is that class's loadout pick: record it only when it adds a mechanic, not just numbers.
- **Universal infantry picks** (no pattern): the utility and tactical items every class can take (Medical Kit, Restoration Kit, Auxiliary Shield, Diver Propulsion Device) and the Nanoweave Armor and Flak Armor suit picks open to all five non-MAX classes are game-wide. Leave them off; notes can name them where they matter.
- **Vehicle slot picks**: not game-wide. Many vehicles share the same choices (the Fire Suppression System and the Nanite Auto Repair System on every vehicle but the Sunderer, decoy flares on the fighters, Valkyrie, Liberator and Galaxy, and others), but each is a choice on that vehicle's own slot. Record them per vehicle as abilities[] asks, the choices of one slot in one exclusive_group; a pick that only changes numbers goes in notes. The auto repair module, which works on its own, is the self-repair armour model (say in armour.notes that it is a pick). The Fire Suppression System, a key that puts out a fire and repairs for a few seconds, links heal-self. Flares that break locks link fire-countermeasures. Smoke Screen, which for a few seconds hides the vehicle and friendly vehicles near it from enemy minimap detection, blocks new lock-ons and makes missiles already locked on lose their target (its own wiki page), links jam-sensors and fire-countermeasures. Its smoke is thin, so it links no lay-smoke.
- **Burning** (armour model critical-burn): a vehicle catches fire once it drops below a fifth of its health (the fire threshold on the Fire Suppression System and resist pages), and the critical-burn model's examples name this game. It is part of vehicle armour, so code it on each vehicle even though they all share it. The model never goes on soldiers.
- **Personal shields** (armour model regen-shield): every non-MAX soldier has a personal shield over its health that recharges after a few seconds without damage; the Infiltrator's is smaller. MAXes and Defectors have none. Code the model on each class that has it.
- **Revive** (repair-allies, on the reviver): a non-MAX soldier who dies leaves a body that a Combat Medic can revive. The pages describe no crawling and no finishing blow, so do not code downed-revive on the classes; mention revival in armour.notes. The Medical Applicator cannot heal or revive MAXes or Defectors.
- **Repair by Engineers** (repair-allies, on the Engineer): the Nano-Armor Kit repairs vehicles, MAXes and deployed equipment. Being repairable is game-wide: leave it off the vehicles and the MAX.
- **Outfit war assets and squad-leader tools** (side-wide powers): the global war assets outfits craft and call down, such as the Orbital Strike and the Steel Rain that drops a whole squad in pods, and the waypoints, rally smoke and requests of squad leaders belong to players, not units. Leave them off. The Colossus and the Bastion are units even though war-asset resources pay for them (see Prices).
- **Construction** (no pattern on soldiers): any player can take structures from a construction terminal (on a deployed ANT or a cortium silo) and place them; the structures are not units. The ANT records what it does itself, such as mining cortium (gather-resources) and deploying its terminal.
- **Collisions** (no pattern): moving vehicles hurt what they hit through the collision resist types. That is not a weapon. Code the crush trait only where its size rule allows and the unit's sources show it running soldiers down.
- **Weapon pickups**: the pages I read describe none; soldiers change gear at equipment terminals.
- **Reclaimed vehicles**: fixed-loadout copies of existing vehicles that a tool, now marked expired content, could bring back from wrecks on Esamir. They are not separate units: leave them out.

### MechWarrior / BattleTech (`mechwarrior`)

Written in the research run's batch preparation, before any mechwarrior unit is coded, from the BattleTechWiki's BattleMech, Physical Attacks, Jump Jet, Heat Sink, OmniMech, Mechanized Battle Armor, List of Design Quirks and MechWarrior 5: Clans pages, and the MechWarrior Online Wiki's Beginners Guide: Interface/Basics, Heat Sinks, Heat Scaling, Critical Hit, Armor, Module and Quirks pages. The MechWarrior Online Wiki pages are old (last edited between 2012 and 2021), so check MechWarrior Online facts against its patch notes. The counted titles are the tabletop designs, MechWarrior Online and MechWarrior 5: Clans (see Series games).

- **Basic controls** (throttle, turning the legs, torso twist and centring the torso, full stop, powering down and up, targeting an enemy to see its weapons and damage and to lock guided missiles, weapon groups, chain fire and alpha strike, zoom, night and heat vision): every 'Mech. No pattern. Torso twist is how a biped 'Mech aims, not an ability; quads cannot twist without a design quirk. The mount proposal follows the aim-models tie-break, which counts a torso that twists only partway as limited arc.
- **Orders to teammates** (no pattern): MechWarrior 5: Clans gives the player a Command Wheel and a Battle Grid to direct the rest of the star, and in MechWarrior Online one player per team can place battle-plan markers. These are basic orders: leave them off.
- **Heat** (resource heat; no pattern): every 'Mech gains heat from firing, moving and jumping, and sheds it through heat sinks; past its limit it shuts down. In MechWarrior Online the pilot can override the shutdown for a few seconds, at the risk of internal damage and an ammunition explosion. Code heat as the resource on every 'Mech; shutdown and override belong to it and are not abilities. MechWarrior Online's heat scaling ("ghost heat") adds extra heat when too many of certain weapons fire at once: mention it in the summary of a weapon it affects. Equipment that dumps heat on a key (a coolant pod and the like) belongs to the design that carries it.
- **Ammunition** (resource limited-ammo, where that field's rule fits): ballistic and missile weapons feed from ammunition carried in the 'Mech. The only refill during a fight in the pages I read is MechWarrior 5: Clans' ammo caches, tagged in scan mode.
- **Locations and critical hits** (armour model zonal): every 'Mech's armour and structure are split by location (head, torso sections with front and rear armour, arms, legs). Once a location's armour is gone, hits can wreck the weapons and equipment inside it, ammunition included, before the location itself is destroyed. Code zonal on every 'Mech; it is built into the armour, and the model's examples name this game. Code directional as well: every torso section has front and rear armour, and standard designs put less on the rear. Leave it off only when a source shows the rear as thick as the front. Ammunition-protection equipment (CASE) belongs to the design: mention it in armour.notes.
- **Physical attacks** (tabletop; no pattern): as its build allows, a 'Mech can punch with its arms, push, kick, charge, or swing something it has picked up, and one with jump jets can make a death-from-above attack. These come with being a 'Mech: leave them off weapons and abilities. A melee weapon the design carries (a hatchet and the like) is a weapon of our melee family.
- **Jump jets** (mobility trait leap; pattern leap, planned): not game-wide. Only designs that mount them can jump; record them on those units.
- **Speed and electronic equipment**: not game-wide. MASC, triple-strength myomer and superchargers, and electronics such as ECM, active probes, TAG and Narc, belong to the designs that carry them; record them on those units (patterns.md gives MASC as an overclock-self example, and an always-on ECM is the jammer trait). The standard sensors and the electronic-warfare features every 'Mech has, which make it harder to lock onto (the BattleMech page), give no sensor trait.
- **Variants, OmniMech configurations and refits** (no pattern): a design's variants, an OmniMech's pod configurations and MechLab refits are chosen before a battle, never during one, so they are not abilities or modes. Code the model researched; other configurations follow the armament rules for loadout picks, or go in notes.
- **Design quirks** (no pattern): the tabletop's optional quirks and MechWarrior Online's per-variant quirks mostly change numbers: put those in notes. Record a quirk as a passive only when it adds a mechanic. A quirk that changes rolls or numbers, for the 'Mech or for units near it (Command 'Mech, Distracting), is a number change: notes only.
- **Progression** (no pattern): MechWarrior Online's skill tree and MechWarrior 5: Clans' 'Mech XP upgrades and pilot skills improve a 'Mech outside the fight. Bands use the stock 'Mech; notes can name them.
- **Consumables and call-in strikes** (side-wide powers): in MechWarrior Online the player fits consumables (artillery and air strikes, Cool Shot coolant and others) into a 'Mech's consumable slots. They are the player's kit, not the design's: leave them off.
- **Scan mode** (MechWarrior 5: Clans; no pattern): every pilot can switch to a mode, with weapons unable to fire, for hacking turret controls, disarming mines, opening locks and tagging salvage and ammo caches. Leave it off.
- **Repair and salvage** (no pattern): technicians repair 'Mechs between missions in MechWarrior 5: Clans, and the pages describe no repair during a fight. Leave it off.
- **Riding battle armour** (tabletop; carry-passengers would be the pattern): most OmniMechs have handholds that let friendly battle armour ride them into battle (six suits at most, twice that on superheavy 'Mechs), and other 'Mechs can carry riders only when the riders have magnetic clamps. The riders hang on outside rather than sit in seats, so give the 'Mech no passenger seats and leave the riding off it; say in crew.notes that an OmniMech can carry riders. If battle armour is coded, record riding on it as its own (see Other uncertainties).
- **Capturing bases** (a game-mode rule, no pattern): the capture points of MechWarrior Online's Assault and Conquest modes.

Foxhole, WARDOGS and ARC Raiders have no list yet. Write one before any of their units is coded.

## Suggested research notes for the r6 agents

- **Battlefield.**
  - Wiki: battlefield.fandom.com, through its API. Vehicle pages have one section per title. Infobox speeds are words before BF4.
  - Pick archetypes across titles: MBT, IFV, mobile AA, scout and attack helicopters, transport helicopter, jets, boats, behemoths, the BF2142 Titan and walker.
  - Record mirrored vehicles once, under `shared`.
  - Official role lines for mirrored archetypes: no single side's text decides a role; use only text that every side's version shares. The class name the game shows for every side's version (for example Mobile Anti-Air, Scout Helicopter, Transport Helicopter) is such shared text.
  - Good patterns:
    - seat roles (driver fires the main gun, gunner on the top gun);
    - the BF3/4 vehicle upgrade picks (reactive armour, active protection, thermal optics);
    - BF1 vehicle packages, which swap a seat layout and arms;
    - tracer darts and laser designation.
- **PlanetSide 2.**
  - Wiki: planetside.fandom.com. Use the `X/Main` subpages (e.g. `Prowler/Main`); the bare page often only transcludes them.
  - The Template:Resist page holds the resist names.
  - **Official role lines.** Written before any ps2 unit is coded, from the wiki's VehicleInfobox, WeaponInfobox, Infobox vehicle weapon and ClassInfobox templates, a sample of vehicle, weapon and class pages, and Daybreak's Census API (census.daybreakgames.com, the developer's public game-data service; for example `https://census.daybreakgames.com/s:example/get/ps2:v2/vehicle?c:show=name.en,description.en`).
    - **Official text: the game's own descriptions.** Census serves the text the game uses: each vehicle's description (the `vehicle` collection) and each weapon's, tool's and ability's description (the `item` collection). Cite it as kind official and name the collection in the note. The wiki's VehicleInfobox `Description` and WeaponInfobox `Description` fields copy that text, so they are official text read through a page that copies it: checked against Census for several vehicles and weapons, the wiki only leaves out the closing sentence on which empires may use a weapon. Copies can lag (the Infobox vehicle weapon template's own example line no longer matches the game's text for that gun), so where the wiki and Census differ, Census decides.
    - **The wiki's own words:** the VehicleInfobox `Type` (MBT, Transport and so on), the WeaponInfobox `Weapon Type` (Anti-Vehicle, Anti-Air, Assault Rifles, or a gun family's name), the ClassInfobox fields and all prose. The italic Class Overview paragraphs at the head of some class pages read like official lore, but no page names where they come from: treat them as the wiki's words until a source is found. Census's `type_name` for vehicles (Four Wheeled Ground Vehicle, Light Aircraft, Hover Tank) is an internal grouping that names no role. A Weapon Type of Anti-Vehicle or Anti-Air still counts where the secondary-role rule asks whether a source calls a weapon anti-tank or anti-aircraft.
    - **Designation:** none. No vehicle or class has a type line, so roles step 1 reads a vehicle's description as its official one-line description. Classes have no description either: their Census entries (the `profile` collection) only repeat the class name, and the pages I read show no in-game class text, so step 1 finds nothing for a class.
    - **Item categories.** The game's own item categories (the Census `item_category` collection) sort MAX arm weapons into AI MAX, AV MAX and AA MAX (each for the left and the right arm), plus Flak MAX and Flamethrower MAX. They class a weapon, not the MAX, so they do not serve step 1. In the secondary-role rule, AV (anti-vehicle), AA (anti-aircraft) and AI (anti-infantry) count as a source naming that weapon's target.
    - **Strong-against and weak-against:** no separate lines. A description says it inside its sentences: a gun said to do better against aircraft, a bomber's weapon said to be strong against ground targets, a turret said to hurt infantry and light armour. Read such a phrase as official strong-against text for roles step 4 when it names a kind of target. The weak points I saw in descriptions are about speed or armour and name no target, so they drop no role.
    - **Empires.** Each empire-specific vehicle has its own Census entry and text, and a common-pool vehicle has one entry for every empire. The rule that official text must hold for every side's version therefore only matters for an archetype recorded once across empires.
    - Patch notes (planetside2.com/news, and the Steam news feed for app 218230) are official text too.
  - Good patterns:
    - Prowler Anchored Mode and Rampart;
    - Vanguard Shield;
    - Magrider strafing and Magburner;
    - Harasser rumble seat;
    - Sunderer deploy (mobile spawn);
    - Colossus Skylance deploy;
    - ANT construction;
    - directional armour.
- **Foxhole.**
  - Wiki: foxhole.wiki.gg (official), API at `https://foxhole.wiki.gg/api.php`; set a User-Agent.
  - Vehicle infoboxes carry `speed`/`offspeed` (m/s), `TechID`, production source and inputs.
  - Good patterns:
    - crewed seats (driver, gunner, commander, engineer who reloads);
    - tank armour deflection that wears down;
    - subsystem disables;
    - fuel logistics;
    - the cruiser tank's boost.
  - Record vehicle upgrade tiers as upgrades.
- **WARDOGS.**
  - The Fandom wiki is a stub. Use the official Steam news (the Steam news API, app id 1867240, gives full patch-note text) for mechanics. Use WARDOGS Hub for vendor numbers, and footage for behaviour.
  - Good patterns:
    - cash as the life currency (buy, lose, earn back);
    - tipping the driver;
    - the Drill Rig pulling the Hot Zone;
    - FOB supply types;
    - the spawn vehicle;
    - the Gepard and CIWS as anti-air.
- **ARC Raiders.**
  - Prefer arcraiders.wiki: more complete, updated this week, API at `https://arcraiders.wiki/w/api.php`. Its machine infoboxes have `armor`, `health`, `weakness` and `pAttack`. The Fandom wiki (arc-raiders.fandom.com, used in the samples) is thinner and older.
  - Good patterns:
    - the Tick latch;
    - Snitch reinforcement calls;
    - Spotter and Bombardier laser marking;
    - strippable armour plates and weak points;
    - shield mitigation that works with any charge left;
    - Queen and Matriarch boss machines.
- **MechWarrior / BattleTech.**
  - Sarna (BattleTechWiki), API at `https://www.sarna.net/wiki/api.php`. Mech pages need the `(BattleMech)` suffix when the name is ambiguous ("Centurion" alone is a disambiguation).
  - The MechWarrior Online Fandom wiki is mostly pre-launch and old: use it only for game-specific mechanics, such as hardpoints and ghost heat.
  - **Official role lines.** Written before any mechwarrior unit is coded, from the BattleTechWiki's unit role pages (Scout, Sniper, Striker and Juggernaut, and the Unit Roles category), its Master Unit List, BattleMech and InfoBoxBattleMech pages and a sample of 'Mech pages, the MechWarrior Online Wiki's 'Mech pages, and the official MechWarrior Online and MechWarrior 5: Clans sites.
    - **Designation: the unit role.** The rulebooks the role pages cite (the Introductory Rulebook of Classic BattleTech, the two Alpha Strike books and Campaign Operations) define a set of battlefield roles, and the Master Unit List (MUL), Catalyst Game Labs' official unit database, gives units their role (the role pages link MUL searches by role). Read the role of the MUL entry for the model researched as its designation for roles step 1, and cite the MUL as kind official.
    - **Which roles name ours.** The Unit Roles category lists fourteen: Ambusher, Attack Fighter, Brawler, Dogfighter, Fast Dogfighter, Fire Support, Interceptor, Juggernaut, Missile Boat, Scout, Skirmisher, Sniper, Striker and Transport. Scout is our scout label, Sniper is an alias of marksman, and Transport is our transport label. Fire Support means firepower, so it names no role, and the other ten are none of our labels or aliases. Marksman still has its coding rule: a Sniper whose long-range guns are not in our sniper family fails it, and step 1 goes on.
    - **Where to read it.** The BattleTechWiki's Master Unit List page says MUL 2.0 replaced the old site on 31 August 2026. The masterunitlist.info unit links on the wiki's pages now fail, and the new site (masterunitlist.battletech.com) refused this session's requests. The BattleTechWiki's 'Mech pages do not give the role: InfoBoxBattleMech has no role field (its seldom-used Use field is the wiki's words), and the role pages describe each role without listing units. When no coder can read the MUL, step 1 finds no official line: go on to step 2.
    - **Technical Readouts.** A readout's own text on a design (its Capabilities section and the rest) is official, but the BattleTechWiki does not copy it: its Description and Weapons and Equipment sections retell it in the wiki's words, with page references, so they are not official text. The infobox's weight class (Ultralight, Light, Medium, Heavy, Assault, Superheavy) is filled in from the mass; it is the armour map's key, not a role.
    - **The piloted games.** No official 'Mech role or description line was found for MechWarrior Online or MechWarrior 5: Clans. Neither official site (mwomercs.com, mw5clans.com) has 'Mech pages, the game-manual link of the MechWarrior Online site leads back to its overview page, and the 'Mech descriptions on the MechWarrior Online Wiki are its own words. Their patch notes are official text: mwomercs.com/game/patch-notes and the Steam news feed for app 342200, and the release notes in the news on mw5clans.com.
    - **Strong-against and weak-against:** none of these sources has such lines.
    - **Sides.** A design is one entry whichever side fields it, so the rule that official text must hold for every side's version only matters for an archetype recorded once for several designs.
  - Good patterns:
    - heat management and shutdown;
    - jump jets;
    - torso twist;
    - OmniMech pods;
    - zonal armour and losing arms or legs;
    - MASC and triple-strength myomer sprint bursts;
    - ECM;
    - Elementals as power armour.
  - Heat, torso twist, OmniMech pods and zonal armour are game-wide or word-list terms (see Game-wide mechanics), so they never become a unit's abilities.
