> **Working notes from step 1** (filling the games registry). They explain choices and give tips for this batch's research agents. They were written before the fact-check, so where they and `data/games.json` differ, the registry wins; the fact-check fixes are listed in the step-1 pull request.

# Games registry, batch r3: notes

Entries written to `games_r3.json`: `generals` (Command & Conquer: Generals with Zero Hour), `tempest-rising` (Tempest Rising with the Veti) and `iron-harvest` (Iron Harvest with Rusviet Revolution and Operation Eagle). `check_games.py` prints OK. A six-word copy-check of every note against all the pages read found no shared runs.

## Choices that need a look

1. **Generals tiers follow the wiki's own labels.** Generals has only one tech building per side (USA Strategy Center, Chinese Propaganda Center, GLA Palace). Units can also be unlocked by a General's Promotion. The wiki's infoboxes give tier 3 to units behind the tech building (Overlord, Hacker, Super Hacker) and tier 2 to a unit unlocked only by a promotion (Marauder tank, https://cnc.fandom.com/wiki/Marauder_tank). The map follows that:
   - **t1:** basic production (Command Center, Supply Center, Supply Stash, Barracks, War Factory, Arms Dealer, Airfield).
   - **t2:** a promotion alone (Paladin, Stealth Fighter, Marauder at 1-star; Pathfinder at 3-star).
   - **t3:** the tech building, alone or with a promotion (Nuke Cannon, SCUD Launcher, Hijacker).

   This puts the heroes (Burton, Black Lotus, Jarmen Kell), the Overlord and the Aurora at t3, like RA3's heroes and Apocalypse Tank. It also puts some modest specialists at t3: Rocket Buggy, Angry Mob, Bomb Truck, Battle Bus, Avenger, ECM Tank, Microwave Tank, Hacker and Saboteur. The other reading (tech building at t2, tech building plus promotion at t3) fits the "one tech building" wording too, but it would leave t3 almost empty, with only three units. Decide whether to keep this map.
2. **Three generals get a promotion unit without spending a point.** Granger gets the Stealth Fighter, Tao the Nuke Cannon and Kassad the Hijacker. The unit is recorded under its main faction, so use the main faction's gate and mention the exception in its notes. Only Granger's Stealth Fighter would change band (t2 to t1).
3. **Promotion gate names.** The wiki writes "General's Promotion Level 1". The gates say "1-star General's Promotion" and "3-star General's Promotion", matching the star ranks shown in the game. Composite gates read "Palace and 1-star General's Promotion" and so on.
4. **Faction tags on gates.** Generals and Iron Harvest gates carry no faction tag. In Generals every building is shared by a main faction and its three generals; in Iron Harvest all four factions and `shared` use the same building names. The validator accepts a tagged gate only for exactly the unit's faction, so a `usa` tag would reject a `usa-laser` unit (the same issue r1 raised). Tempest Rising has no subfactions, so its gates are tagged, and "Barracks" appears twice (gdf, dynasty).
5. **Leang (the Boss General) is left out.** She is not a normal skirmish side.
6. **No `introduced_in` on the Veti.** The Veti became playable in skirmish and multiplayer through the free patch 2.0.0+60710 (29 September 2026). It came out on the same day as The Veti's Wrath, a campaign expansion, and every owner of the base game has them. If you would rather flag Veti units as late additions, set `introduced_in: tempest-rising-vetis-wrath` on the faction.
7. **Tempest Rising half-tiers.** The wiki's "tier 2.5" steps (Satellite Uplink pods, the Dynasty Bastion, a Veti Eye tethered to an Initial or Elevated anchor) stay in t2. Its "tier 3.5" steps (Data Core pods, Transcendent tethers) stay in t3. The Tier page lists "Veti Eye with Elevated Awakening" under both 2.5 and 3.5. The unit pages put its units (Golem, Constellation) at tier 2, so the map does too.
8. **Iron Harvest `shared`.** It covers the common aircraft that every faction builds (Skybike, Airlift, Gunship). It also covers the weapon systems (Field Cannon, Heavy MG, Mortar): the wiki says every faction uses the same designs with its own crew, although it has a page per faction. Rusviet Revolution added only a four-mission campaign and no units. Operation Eagle added Usonia, plus the common aircraft and anti-air for everyone (free for all players), so set `introduced_in: iron-harvest-operation-eagle` on those units.
9. **Flavour.**
   - Generals: USA allied (lasers, drones, stealth, precision) and China soviet (tank hordes, Overlord, nukes, propaganda). The generals inherit their parent's flavour. The GLA (guerrilla, toxins, salvage, tunnels) fits none.
   - Tempest Rising: GDF allied (marking, drones, lasers, intel) and Dynasty soviet (Eurasian bloc, brute force, Voltaic electric weapons, the crushing Tempest Sphere). The Veti fit none.
   - Iron Harvest: Rusviet soviet. Usonia allied is a judgement call (air power, drones, the best-equipped army); drop it if "clearly" should be stricter. Polania and Saxony fit none.
10. **Franchise names.** Tempest Rising shares its universe with Bombshell and Ion Fury, and Iron Harvest shares the World of 1920+ setting with the board game Scythe. Neither link matters for counting, because no other researched game is in those series, so the franchise is the game's own name.

## Prices

- **Generals:** anchor about $770 (Crusader $900, Battlemaster $800, Scorpion $600), giving thresholds of 400, 700, 1,100 and 1,500.
  - Very low: Rebel 150, Ranger 225, Red Guard 300.
  - Low: Technical 500, Scorpion 600, Pathfinder 600, Hacker 625.
  - Medium: Humvee 700, Battlemaster 800, Marauder 800, Crusader 900, Inferno Cannon 900, Rocket Buggy 900.
  - High: Paladin 1,100, Tomahawk 1,200, SCUD Launcher 1,200, MiG 1,200, Raptor 1,400, Troop Crawler 1,400.
  - Very high: Burton, Black Lotus, Jarmen Kell, Comanche and Helix 1,500, Nuke Cannon and Stealth Fighter 1,600, Overlord and Avenger 2,000, Aurora 2,500.

  The Scorpion is an anchor tank but falls in low, because it is the GLA's cheap, fast tank. Many generals change prices (for example Kwai's Battlemaster costs 700); use the main faction's list price unless the unit belongs to that general.
- **Tempest Rising:** anchor about 975 credits (Hunter Tank 900, Boar Tank 1,050 since patch 2.0.0), giving 500, 900, 1,400 and 2,000.
  - Very low: Dynasty Guard 150, Field Scout 200, Missile Trooper 300, Drone Operator 370.
  - Low: Sentinel 500, Havoc 700, Subjugator 750.
  - Medium: Hunter, Boar, Peacekeeper 1,100, Riot Van 1,200, Pillager 1,300.
  - High: Line Officer, Operative and Machinist 1,500, Porcupine, Voltaic Tank and Skycrane 1,700.
  - Very high: Trebuchet 2,200, Commando and Physicist 2,500, Tempest Sphere 3,000, Leveler 3,200.

  GDF Intel units at 75 credits per Intel point:
  - Very low: Riot Trooper 5 Intel (375).
  - Low: Comms Rig and Drone Mauler 10 Intel (750).
  - High: Sniper, Comms Officer, Riot Medic and Shieldmaiden 20 Intel (1,500).
  - Very high: Scrambler 30 Intel (2,250), Condor 35 Intel (2,625), Drone Assassin, Hijacker and Drone Command Unit 40 Intel (3,000).

  The rate is an estimate. The GDF makes about one Intel point every 6 to 8.5 seconds per Intel building, plus Intel from marked kills, and the rate puts 20-Intel specialists level with the Dynasty's 1,500-credit specialists (https://tempestrising.wiki.gg/wiki/Line_Officer, https://tempestrising.wiki.gg/wiki/Sniper). In the wiki's infoboxes, `cost` and `cost_intel` are multiplayer prices and the `.sp` fields are campaign prices: ignore `.sp`.
- **Iron Harvest:** anchor about 890 (iron + 3 × oil for Lowca, Wotan, Knox and Nagan), giving 400, 800, 1,200 and 1,800. Checks at the late-2021 and 2022 prices:
  - Very low: riflemen squads (175 iron), Rycerz (390).
  - Low: Straznik 430, Grimbart 450, Skybike 480, Salem 530, Kolokol 540, Smialy 620, Erlkönig 630, Isegrim 640, Stiefmutter 690, Mocny 700, Nakovalnya 700, Serp 740, Stark 780, Lowca 790.
  - Medium: Zółw 860, Wotan 890, Knox 890, Gunship 910, Nagan 990.
  - High: Gulyay-Gorod 1,210, Samson 1,220, Tur 1,260, Kaiser 1,320.
  - Very high: none. Iron Harvest prices are compressed: the mega mechs cost only about 40% more than the line mechs, and their weight shows in population (6 to 7) and in the tech gate instead.
  - Heroes are cheap: Anna 330 (very low), Gunter 575 (low), Mason 810 and Brunhilde 1,060 (medium).
- **Why oil counts three times.** The wiki's Building Upgrade page (https://iron-harvest.fandom.com/wiki/Building_Upgrade, marked beta) gives the income rates. Per 5 seconds, an iron mine yields 4 and a big mine 8, an oil pump 1 and a big pump 3, and the headquarters 14 iron and 3 oil. A weight of 2 would drop the Tur and Gulyay-Gorod to medium, and a weight of 4 would still leave the Gulyay-Gorod there.
- **Iron Harvest wiki prices lag the patches.** Most mech pages match DevBlog #43 (December 2021), but the Nagan page still shows its pre-September-2020 price (550 iron, 190 oil). DevBlog #45 (June 2022, https://kingart-games.com/article/121) changed the Mocny, Zółw, Rycerz and Ward again. Infantry prices moved several times in early 2021 (DevBlog #35: riflemen 175 iron at the Advanced Barracks).

## Speed

- **Generals:** ratio = land speed / 20. Red Guard 25 (1.25), Crusader 30 (1.5, medium), Scorpion 40 (2.0, fast), Overlord 20 (1.0), Technical 90 (4.5, very fast). Use the healthy speed, not the "badly damaged" one.
- **Tempest Rising:** ratio = speed / 550. Dynasty Guard 625 (1.14), Hunter Tank 800 (1.45, medium), Trebuchet 450 (0.82, slow), Sentinel 1,500 (2.7, very fast).
- **Iron Harvest:** ratio = movement speed / 5. Rycerz 3.5 (0.7, slow), Smialy 6.5 (1.3, medium), Wotan 2.6 (0.52, very slow), Tur 2.21 (0.44, very slow). Some speeds changed in patches (the Groza in late 2020), and a few pages are beta.

## Damage and armour maps (not in `sources` because of the 1-4 guide)

- **Generals damage.**
  - **Source.** The keys are the INI names from EA's released Zero Hour source code, file Damage.h, read from https://raw.githubusercontent.com/electronicarts/CnC_Generals_Zero_Hour/main/GeneralsMD/Code/GameEngine/Include/GameLogic/Damage.h. github.com itself is blocked from this session; the raw file loads. Wiki infoboxes write the same names in words, for example "(Armor Piercing)".
  - **MICROWAVE maps to energy.** The code describes it as radiation that hurts only infantry, but it leaves no lingering zone, so toxic does not fit.
  - **SUBDUAL types map to emp.** The code uses them for effects that disable rather than kill, the kind the ECM Tank (vehicles) and the Microwave Tank (buildings) produce.
  - **Left out:** CRUSH, KILLPILOT (Jarmen Kell's pilot snipe; record it as an ability), HACK, SURRENDER, DEPLOY, WATER, FALLING, PENALTY, DISARM, HAZARD_CLEANUP, TOPPLING, UNRESISTABLE, KILL_GARRISONED, STATUS and SUBDUAL_UNRESISTABLE.
- **Generals armour.** Names are as written in the wiki's `armortype` field. Exceptions:
  - The drones use Tank Armor; record them as light.
  - The Overlord and Emperor Overlord are super-heavy by size.
  - One-off sets (Dozer, Toxin Truck, QuadCannon, Avenger, Sentry Drone, Battle Bus, Assault Crawler) map by what the unit is.
- **Tempest Rising damage.** These are the seven types on the wiki's Damage page; Omni (ignores armour) is left out. Every laser weapon is energy, whatever its category (Cannon for most, Explosive for the Comms Officer's). Named exception (step 3 under armament[].damage).
- **Tempest Rising armour.** Medium vehicle maps to heavy, because the two main battle tanks are Medium vehicles and our heavy class is for main battle tanks. Heavy vehicle also maps to heavy. Lift the biggest units (Tempest Sphere, War Ender) to super-heavy by size. Units also have six armour percentages, but the label is enough for the class.
- **Iron Harvest damage.** No `damage_map`: each weapon lists a damage value per armour class, and there are no named damage types.
- **Iron Harvest armour.** Unarmored, Light, Medium and Heavy (plus Structure), shifted one step up to match our definitions:
  - Light maps to medium: light walkers and exosuits are our "light walkers, power suits".
  - Medium maps to heavy: most battle mechs, including the anchor Lowca and Knox.
  - Heavy maps to heavy.
  - The mega mechs and the Samson are super-heavy by size.
  - Aircraft are exceptions: record the Skybike and Revere as light, whatever their label.

## Uncertain

- **The Samson's gate.** The Samson is Usonia's super-heavy, but the rule that mega mechs also need an Advanced Barracks (DevBlog #30) is older than Usonia. If the game asks for both buildings, use the gate "Advanced Workshop and Advanced Barracks".
- **Iron Harvest Reserve.** Since DevBlog #35 (https://kingart-games.com/article/107-iron-harvest-devblog-35-february-2021), Reserve II needs an advanced building, or else two basic buildings; no source gives Reserve I's condition. A unit that can also be built normally takes its production gate. Use the Reserve gates only for units that cannot be built any other way.
- **Iron Harvest heroes.** The wiki says skirmish heroes are built at the Headquarters (t1). A changelog calls Prince Wilhelm "a tier 2 reserve hero", so check whether a hero can come only from the reserve.
- **Iron Harvest version.** No final version number is published. The last balance changes found are in DevBlog #45 (June 2022); DevBlog #47 (September 2022) adds only a world-campaign map.
- **Veti numbers.** Most Veti wiki pages are marked as checked against 1.8.0+57892 (the public beta) or not checked at all. Patch 2.0.0 changed many of them; for example the Gorgon's page says 2,200, while the patch notes give 2,500. Some tiers also conflict: the Augur and Cultivator are labelled tier 2 but need the Corral, a tier 3 building, so the map makes them t3.
- **Generals Pathfinder.** It sits at t2 although rank 3 usually comes mid-game.

## Research notes for the r3 agents

- **All three wikis block plain page downloads.** Use their MediaWiki APIs with `action=parse&prop=wikitext`, space out requests and retry after a 429:
  - https://cnc.fandom.com/api.php
  - https://tempestrising.wiki.gg/api.php
  - https://iron-harvest.fandom.com/api.php
- **Generals, C&C Wiki.**
  - Infobox fields: `cost`, `landspeed`, `armortype`, `req`, `produced` and, on a few pages, `tier`.
  - The production building pages list units as Basic or Advanced and name any promotion they need. The General's Promotion page lists each general's differences.
  - Page names often carry "(Generals 1)", "(Generals)" or "(Zero Hour)".
  - Unit ids: `generals.usa.crusader-tank`, `generals.usa-laser.laser-tank`, `generals.china-tank.emperor-overlord`, `generals.gla.jarmen-kell`.
  - A unit most generals of a side field goes under the main faction, with the generals that lack it in its notes. For example, Shin Fai fields neither the Troop Crawler nor the Helix.
- **Generals mechanics worth a look:** drones on vehicles, GLA salvage upgrades, Overlord add-ons, the Hijacker, Jarmen Kell's pilot snipe, the horde bonus, the Battle Bus becoming a bunker, the Combat Cycle's rider swap, the ECM and Microwave Tanks, Helix add-ons and the Bomb Truck's disguise.
- **Tempest Rising, wiki.gg.**
  - Infobox fields: `cost` (multiplayer credits), `cost_intel` (multiplayer Intel), `speed`, `armortype`, `tier`, `req`, `produced` and `w1_type` (damage type).
  - Ignore the `.sp` (campaign) fields.
  - Check the `{{Verified|patch=...}}` line at the top and the page's changelog, then the 2.0.0 and 2.0.1 patch pages for anything newer.
  - Mechanics worth a look: GDF marking and Intel, Comms and pods; Dynasty plans, Distribution mode and salvage; Veti subjugation, Enlightened sacrifice, Consecration and anchor Awakenings.
- **Iron Harvest Wiki.**
  - The wiki is small and partly beta. Infobox fields: `unit_armortype`, `unit_movementSpeed`, `costs_iron`, `costs_oil`, `costs_population` and `isDeployedBy1`.
  - Check every price against KING Art's DevBlogs and change logs (https://kingart-games.com/article/90 to /article/123, from September 2020 to September 2022). The main mech price rebalance is DevBlog #43 (/article/119).
  - Mechanics worth a look: infantry picking up weapon kits from the field, cover, rear-armour weak spots (double damage), mechs walking through buildings, exosuits, weapon systems crewed by any infantry, wreck recycling, and heroes with animal companions.
