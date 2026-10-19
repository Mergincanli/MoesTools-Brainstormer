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
- **Generals damage: which step decides** (armament[].damage).
  - **Step 4 binds.** The damage_map applies to Generals. The wiki's UnitBox gives each weapon's numbers in its `groundattack` and `airattack` lines, which the template takes from the game data, and ends each line with the damage name in brackets, written out in words. That name is the weapon's category. Weapon.ini in the unedited 1.04 files (see Generals official role lines below) has the same name as `DamageType`.
  - **No step 3 exceptions.** Each damage name a Generals weapon uses is either a map key or on the left-out list above, and a left-out name goes to step 5.
  - **Steps 1 and 2 still come first.** A weapon that does no damage at all, because it only hacks, jams, marks a target or cleans up toxins, takes step 2, even when its name is a map key (the SUBDUAL names).
  - **Two names, no single category.** A weapon the sources give two names, such as a shell plus the toxin or radiation field it leaves, or one name against ground targets and another against aircraft, goes to step 5.
  - **Rotary guns.** GATTLING and SMALL_ARMS are bullet categories: a rotary gun that deals either fires bullets, so it is a machine gun (the weapon-families tie-break between machine guns, autocannons and cannons). COMANCHE_VULCAN is not decided here; go by what the sources say the gun fires.
- **Generals armour: steps 1 and 2** (the armour-class order).
  - **Step 1** (the armour_map, with the exceptions in the bullet above) decides for every set the map lists.
  - **Step 2 never applies.** Each Generals unit has a named armour set (Human Armor, Tank Armor and so on), never a bare light, medium or heavy, so a set the map leaves out goes on to step 3, then step 4.
  - **Soldiers.** Armor.ini in the 1.04 files has several human sets besides Human Armor, and the wiki's `armortype` field names some of them (for example Chem-Suit Human Armor). For the soldier rule, a set is tougher armour than the basic rifle infantry's only when it lets less gunfire through than Human Armor does (its SMALL_ARMS, GATTLING or COMANCHE_VULCAN lines); then the soldier is light. A set that differs only against fire, lasers, toxins, radiation or microwaves leaves the soldier unarmoured; say so in armour.notes.
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
- **Generals tooltip source.** The Strong vs. and Weak vs. lines are read from a community repository's copy of the 1.04 files, not from an EA page or the wiki. Coders may cite it (kind database, with a note that it copies the in-game tooltip). Its tooltip lines are official text read through a faithful copy, for roles and for confidence.
- **Purpose lines and the generals.** The base-game manual is older than the Zero Hour generals. The role-lines note below reads a general's version as carrying its main unit's Purpose entry; check that this fits the roles rule that official text must hold for every side's version.
- **Infantry armour sets.** Where Generals armour above draws the line between hazard protection and tougher armour for the soldier rule, that is a choice made here, not a game label.

## Game-wide mechanics

Mechanics that belong to the game, not the unit (see Shared mechanics and universal keys in the Conventions). Leave them off every unit's weapons and abilities. A unit that does one of them better or worse than the rest says so in its strengths or weaknesses.

### Command & Conquer: Generals (`generals`)

Written in the research run's batch preparation, before any Generals unit is coded, from the Command & Conquer Wiki's Veterancy, Garrisoning, Capture building, Salvaging, UN Crates, Pilot, Neutron shells, Horde Bonus, General's Promotion and Demolition pages, the Generals and Zero Hour manual scans the wiki hosts, and the unedited 1.04 data files named under Generals official role lines.

- **Basic orders** (move, attack, stop, guard, attack-move, force-fire, waypoints, teams and formations, and the Retaliation option that stops units firing back on their own): every unit. No pattern. Most units' command sets in the 1.04 files carry the same Attack Move, Guard (or a Guard variant) and Stop buttons; leave those off and count only the unit's other buttons.
- **Veterancy** (earn-veterancy): every unit that fights rises through Veteran, Elite and Heroic, mainly by destroying enemies, counted by what they were worth. Elite and Heroic units also heal over time; that healing belongs to veterancy, not to an armour model or an ability. These routes are game-wide too and stay off: basic infantry rank up by capturing buildings, GLA units by picking up salvage crates, the USA Advanced Training upgrade doubles the rate, and some General's Powers and generals produce named unit types already ranked (the Veterancy and General's Promotion pages list them). The Pilot page names units that never rank up: construction dozers, Chinese supply trucks, Chinooks, Battle Buses, terrorists and saboteurs. A unit that ranks up through its own special action (the Veterancy page names hackers stealing money) says so in that ability's summary.
- **Pilots** (on_death, not an ability): when a USA vehicle or aircraft that holds a rank is destroyed, a Pilot gets out, who can take that rank into another vehicle. On USA vehicles and aircraft that can rank up, code on_death pilot-eject with the rank condition in on_death.notes. No building trains Pilots.
- **Garrison** (carry-passengers, recorded on the building or vehicle, not on the riders): every infantry unit except the Angry Mob can enter an empty civilian building, and each side has garrison buildings of its own (Fire Base, Bunker, Palace and others). Entering, leaving and Evacuate are universal keys. A transport keeps one passive for its passenger seats (see Paired entries). A button that does more than enter, such as dropping troops into a building to clear it, is recorded on the unit that has it.
- **Tunnel Networks** (build-linked-exits, recorded on the structure): GLA ground units, vehicles included, can go into one Tunnel Network and come out of another, and heal while inside. The Zero Hour manual says Angry Mobs cannot. Leave it off the units.
- **Taking over an empty vehicle** (recover-wreck): a vehicle whose crew has been killed turns neutral, and any infantry unit can climb in and claim it (Neutron shells and Pilot pages). Leave it off the infantry; a weapon that kills crews is recorded on its own unit.
- **Crates** (picking up is a universal key): any unit can collect the money crates found on the battlefield. A salvage crate drops when a GLA unit destroys a vehicle or a GLA vehicle dies; only GLA units see and collect it, and most of them get a little money or experience from it, which stays off. A few GLA vehicles gain fixed upgrade steps from these crates instead (the Salvaging page lists them). Record those on the vehicle: an acquired weapon for each step that changes the weapon's family and one triggered ability, both linking leech-weapon-on-kill. A step that changes only numbers (reload, range, armour) goes in notes.
- **Repair, healing and rearming at buildings** (no pattern): the USA Barracks heals infantry, the USA and Chinese War Factories repair vehicles, each Air Field rearms and repairs up to four planes, a Speaker Tower heals units near it, and a captured Hospital or Repair Bay heals all of a player's infantry or vehicles wherever they are. Leave these off. The GLA Junk Repair upgrade makes every GLA vehicle repair itself: a side-wide upgrade, left off and mentioned in notes. A unit that repairs, heals or rearms others, or rearms away from an Air Field, records that on itself.
- **Capturing buildings** (capture-structure): not game-wide. The Capture Building upgrade, bought at each side's Barracks, gives that side's basic infantry a capture button, which the Zero Hour manual says tech buildings also need. Record it on each infantry type the Capture building page lists, as an ability with source upgrade. A unit that captures without the upgrade records its own ability.
- **General's Powers** (bought with promotion points and launched from the Command Center): air strikes and bombs, paradrops and other drops, artillery barrages, mines, EMP and leaflet drops, spy drones, cash hacks and bounties, area repair, Frenzy and the GPS Scrambler. They stay off every unit. Powers that unlock a unit are gates in the tier_map, and powers that produce a unit type already ranked belong to veterancy. A power that gave named unit types a new button or effect would be recorded on each of them with source commander-power; the General's Promotion page lists none.
- **Side-wide upgrades and battle plans**: upgrades bought once for a whole class (armour, rate of fire, Nationalism for the horde bonus, armour-piercing ammunition, stronger toxins and the like) and the battle plans of the USA Strategy Center (more sight, armour or firepower for every unit) stay off; bands use the stock unit. An upgrade that gives named unit types a new weapon or button (flash-bang grenades, a drone or missiles bought for a vehicle, camouflage, booby traps) is recorded on each of them, as Paired entries and Stock values say. The Demolition General's Demolition upgrade gives nearly all his units and defences a detonate button and a blast on death. It reaches almost every unit of that general's side, so treat it as a side-wide upgrade: it stays off, and on_death.notes names it, as that field asks.
- **Horde Bonus**: not game-wide. Some Chinese units fire faster when five or more of them stand together (the Horde Bonus page lists which). Record it on each of them as an innate passive. The rally-allies pattern does not fit, because no one unit gives the bonus to the rest, so leave its patterns empty and add a fit_note. Nationalism and Patriotism, which strengthen it, are side-wide upgrades.
- **Crushing** (the mobility trait crush, not an ability): vehicles run over infantry, and the wiki's UnitBox can give crusher and crushable levels. Use the trait only where its size rule allows. CRUSH damage is left out of the damage map.
- **Sight**: every unit and building sees around itself, and allies share what they see; the radar map is a base feature. No pattern. Stealth and stealth detection are not game-wide: code them per unit (cloak, the sensors field).
- **No retreat or reinforce order**: neither manual lists one.

Tempest Rising and Iron Harvest have no list yet. Write one before any of their units is coded.

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
  - A unit most generals of a side field goes under the main faction, with the generals that lack it in its notes. For example, Shin Fai fields neither the Troop Crawler nor the Helix. Name those generals in tier.basis. Code every field from the main faction's version; a general's version that differs (Tao's Overlord is faster, its shells leave radiation and it explodes on death) goes in the notes of the fields it would change, never in on_death outcomes or traits.
- **Generals official role lines.**
  - **Designation (roles step 1).** The base game's manual gives nearly every base-game unit a short Purpose entry next to its description, such as "Purpose: Builder" or "Purpose: Siege". Read it as the unit's designation. The wiki's transcript of that manual (page Command & Conquer: Generals manual) keeps the USA and China unit tables with these entries but drops the GLA table. The scan the wiki hosts, https://cnc.fandom.com/wiki/File:Command_and_Conquer_-_Generals_-_UK_Manual_-_PC.pdf, has all three sides; read the page images, because a text dump mixes the two columns. Many entries are phrases that match no role label or alias, and those name no role. Entries built on the word Assault (Tank/Structure Assault, Base/Unit Assault) are among them.
  - **Zero Hour units have no designation.** The Zero Hour manual (the wiki's transcript, and the 2015 Mac scan the wiki hosts) gives descriptions but no Purpose entries. Use the opening line of the unit's build tooltip as its official one-line description, when it has one.
  - **Build tooltips have strong-against and weak-against lines.** In the game's 1.04 string table, most combat units' build tooltip is a "Strong vs." line and a "Weak vs." line, sometimes after a short line on what the unit does; builders, collectors and a few support units have only a description. Roles.primary step 4 and the secondary candidates read the Strong vs. line, and the secondary rule that drops a role reads the Weak vs. line. Read the target words this way: tanks, vehicles and light vehicles are armour; infantry of any kind (missile-armed infantry, rocket soldiers) is infantry; aircraft is air; buildings, base defenses, missiles and scouts match none of the three anti roles.
  - **The wiki does not copy the tooltips.** Fewer than twenty Generals pages have Strong vs and Weak vs bullets in the UnitBox `notes` field, with no source given, and on most of those compared at least one target differs from the 1.04 text. Treat them as the wiki's own words.
  - **Where to read the tooltip text.** TheSuperHackers' community patch repository keeps the unedited Zero Hour 1.04 game files in its Patch104pZH/GameFilesOriginalZH folder (its folder notes say so); the English string table there (Data/English/generals.csf) is binary. A plain-text copy is the first version of the repository's string file: https://raw.githubusercontent.com/TheSuperHackers/GeneralsGamePatch/a65f341431e95e926fca3ad7bbdce32bc6912d6d/Patch104pZH/GameFilesEdited/Data/generals.str. Every build tooltip in it matches the binary original; later versions are edited, so do not use the main branch. To find a unit's text, look up its build button in https://raw.githubusercontent.com/TheSuperHackers/GeneralsGamePatch/6c7f40d6af6a4babb77a33a4502ec7656446c13e/Patch104pZH/GameFilesOriginalZH/Data/INI/CommandButton.ini (a UNIT_BUILD button whose Object is the unit's internal name, which some wiki pages give as `internalname`; otherwise match the button's TextLabel, whose `US:` text is the unit's name with & before its hotkey letter). Its DescriptLabel names the string, and the `US:` line under that label in the string file is the English text. Cite it as kind database, with a note that it copies the in-game tooltip (see Uncertain).
  - **Raw 1.04 data files** (Weapon.ini, Armor.ini, the Object files): read them to check figures, buttons and tooltip labels, and where this note sends you to them (Armor.ini sets for the soldier rule, Weapon.ini's DamageType to confirm a damage name). Any other term only they would set (friendly-fire from a blast that hurts allies, magazine from a clip size, auto-target from an add-on's own AI) is not set; mention the fact in notes.
  - **Generals' versions.** Most of the Zero Hour generals' build buttons (their names start with the general's prefix, such as AirF_ or Infa_) reuse the main faction's tooltip; ten have their own. For a unit recorded once under a main faction, official text counts only when every general's version carries it, so check those buttons too. The manual predates the generals; this note reads a general's version as carrying its main unit's Purpose entry (see Uncertain).
  - **Wiki infobox fields.** In the UnitBox, `role` is the wiki's own label for the unit's niche, and `notes` and the prose are the wiki's words as well; `useguns` and `usearmor` describe the lore. `name`, `cost`, `time`, `hotkey`, `armortype`, `groundattack` and `airattack` come from the game, but they are names and figures, not role text. Quote boxes credited to the Generals or Zero Hour manual copy that manual's unit description, which is official text; they leave the Purpose entry out.
  - **Official site.** The wiki links an Internet Archive copy of EA's 2004 official site, which would not load from this session, so whether it had unit profiles is unchecked.
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
