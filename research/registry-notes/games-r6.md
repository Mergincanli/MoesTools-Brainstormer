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
  - The resist types are the game's damage categories.
  - VS lasers use the Small Arms resist, so they map to kinetic. They behave like bullets apart from having no bullet drop; mention the energy look in the unit's notes.
  - "Gatling Guns" (Tank Buster, Shredder) is mapped to armour-piercing, because those guns are built to strip vehicles.
- **Armour map.** None: vehicles each have their own resist profile. MBTs, the Lightning, the Colossus and the Valkyrie use directional armour.
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
  - ARC attacks (fire, shockwaves, mortars, lasers) have no ammo type: type each one by what it is.

### MechWarrior / BattleTech (`has_tiers` false, `has_costs` false, as the brief asks)
- **Why no tiers or costs.** Tech eras (3025 Succession Wars, 3050 Clan Invasion, later) are times, not gates. C-bill prices and Battle Value exist, but the brief asks for weight classes.
- **Weight class as a cost proxy, if a cost band is ever needed:** light → low, medium → medium, heavy → high, assault → very high. I did not put this in the entry.
- **The `armour_map` is a weight-class proxy.**
  - BattleTech has no named armour categories: armour is points per location.
  - Mapping: light and medium 'Mechs → medium ("light walkers"), heavy and assault → heavy (the class text names assault mechs), superheavy → super-heavy.
  - Drop the map if a proxy is not acceptable.
- **Damage map.** It covers the three hardpoint types (Energy, Ballistic, Missile).
  - Flamers are Energy in MWO but deal heat; type them as fire.
  - Physical attacks (punches, kicks, hatchets, death from above) are melee.
  - Gauss rifles and large autocannons can be armour-piercing per weapon.
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
- **Battlefield:** the side ids beyond `shared` are a guess at what the research will need. Agents should record mirrored vehicles once, under `shared`, naming each side's model in the notes.
- **WARDOGS:**
  - Prices and unlock levels come from fan sites. Only the patch notes are official.
  - The game is three weeks into a stormy Season 2, so confidence for its units should stay medium or low.
- **Foxhole:** `year` is 2017 (Early Access). Version 1.0 came in 2022.
- **ARC Raiders:** the year is the 2025 launch. A PvE toggle is in beta (13-20 October 2026) and may change how ARC are met.

## Suggested research notes for the r6 agents

- **Battlefield.**
  - Wiki: battlefield.fandom.com, through its API. Vehicle pages have one section per title. Infobox speeds are words before BF4.
  - Pick archetypes across titles: MBT, IFV, mobile AA, scout and attack helicopters, transport helicopter, jets, boats, behemoths, the BF2142 Titan and walker.
  - Record mirrored vehicles once, under `shared`.
  - Good patterns:
    - seat roles (driver fires the main gun, gunner on the top gun);
    - the BF3/4 vehicle upgrade picks (reactive armour, active protection, thermal optics);
    - BF1 vehicle packages, which swap a seat layout and arms;
    - tracer darts and laser designation.
- **PlanetSide 2.**
  - Wiki: planetside.fandom.com. Use the `X/Main` subpages (e.g. `Prowler/Main`); the bare page often only transcludes them.
  - The Template:Resist page holds the resist names.
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
  - Good patterns:
    - heat management and shutdown;
    - jump jets;
    - torso twist;
    - OmniMech pods;
    - zonal armour and losing arms or legs;
    - MASC and triple-strength myomer sprint bursts;
    - ECM;
    - Elementals as power armour.
