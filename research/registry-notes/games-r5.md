> **Working notes from step 1** (filling the games registry). They explain choices and give tips for this batch's research agents. They were written before the fact-check, so where they and `data/games.json` differ, the registry wins; the fact-check fixes are listed in the step-1 pull request.

# Games registry, batch r5: notes

Entries written to `games_r5.json`: `supcom` (Supreme Commander with Forged Alliance), `pa` (Planetary Annihilation with TITANS), `sc2` (StarCraft II: Wings of Liberty, Heart of the Swarm, Legacy of the Void), `hw2` (Halo Wars 2 with Awakening the Nightmare), `dow1` (Dawn of War with Winter Assault, Dark Crusade and Soulstorm) and `dow2` (Dawn of War II with Chaos Rising and Retribution). `check_games.py` prints OK. A six-word copy-check of every string against all the pages I downloaded finds only page and game titles.

Every cited page was checked:
- Fandom wikis (Supreme Commander, StarCraft and Dawn of War): through the MediaWiki API. Each page exists under exactly the cited title, with no redirect. Plain downloads return 403, as expected.
- Halopedia and PA Lobby pages: they return 200 directly.
- The two Liquipedia pages: fetched through the API before the block described below.

## For the orchestrator (affects other batches)

- **Liquipedia blocked this session.** After two parse calls spaced 31 seconds apart, a few quick search calls triggered a temporary IP block. The block page has a CAPTCHA; I did not try to get around it. Its API terms allow at most one parse request every 30 seconds and need gzip and a named user agent. SC2 agents should follow those terms or use the other sources listed below. The block may still be active from this machine.
- **Faction tags on tier gates.**
  - The `sc2` gates carry the race (terran, zerg, protoss). StarCraft II has no subfactions and every building name belongs to one race.
  - All other entries leave gates untagged. Their gates are either shared by every faction (SupCom factories, PA, the HW2 tech levels) or generic levels (`Tier 1` to `Tier 3` in both Dawn of War games). This follows the r2 and r3 finding that a tagged gate rejects subfaction and `shared` units.
- **No leader subfactions for HW2.** The game has 16 multiplayer leaders, and most swap one or two units (Forge's Grizzly replaces the Scorpion, Johnson's Mantis replaces the Warthog). I kept two factions. Record a leader's units under `unsc` or `banished` and name the leader in the notes and availability.
  - If you prefer the Generals style instead, add subfactions with `parent`.
  - In that case Pavium and Voridus get `introduced_in: hw2-awakening-the-nightmare`; the Halopedia page for the expansion says it added them.
- **Franchise names.**
  - Both Dawn of War games use "Warhammer 40,000", the umbrella brand, in the same way that "Command & Conquer" covers Red Alert.
  - Supreme Commander and Planetary Annihilation are separate franchises, although both descend from Total Annihilation. If design lineage should count, note that they are related.

## Tiers that were hard to map, and how I decided

- **Supreme Commander.**
  - The game has four levels: tech 1 to 3 factory upgrades, plus experimentals, which the wiki calls an unofficial tech 4.
  - Experimentals are built by tech 3 engineers, support commanders or an upgraded commander. They map to t3 under the gate `Experimental`, and support commanders map to t3 under `Quantum Gateway`.
  - The commander (ACU) is not bought. Its gate is `Start of the match` (t1), with no cost band.
- **Planetary Annihilation.**
  - The PA Lobby database itself labels basic factories T1, advanced factories T2 and Titans T3, so the map follows it.
  - Titans use the gate `Titan (built by an advanced fabricator)`.
  - Oddly, the database lists the T1 orbital fabrication bot among the Atlas's builders. Treat Titans as t3 anyway.
  - Units launched from the T2 Unit Cannon keep their own factory gate.
  - The commander uses `Start of the match`.
- **StarCraft II.** (Corrected after the fact-check to match data/games.json.) There is no in-game tier label, so I matched the Zerg Hatchery, Lair and Hive levels:
  - **t1:** the first production building, plus the tech building its line units need. Terran: Command Center, Barracks. Zerg: Hatchery, Spawning Pool, Roach Warren, Baneling Nest. Protoss: Nexus, Gateway, Cybernetics Core.
  - **t2:** the second step. Terran: Factory, Starport, Armory, Ghost Academy. Zerg: Lair-tech buildings (Lair, Hydralisk Den, Lurker Den, Infestation Pit, Spire, Nydus Network). Protoss: Robotics Facility, Stargate.
  - **t3:** the third step. Terran: Fusion Core, and the Thor, whose own gate is "Factory with tech lab and Armory (Thor)". Zerg: Hive-tech buildings (Hive, Ultralisk Cavern, Greater Spire). Protoss: Robotics Bay, Fleet Beacon, Templar Archives, Dark Shrine.
  - Tech Lab and Reactor add-ons are not a tier step. So the Marauder is t1 and the Siege Tank t2; the Banshee and Raven are t2.
  - Judgement calls: the Hellbat is t2: it is the Hellion's second mode, and the Armory is t2 in the registry. The Starport is t2 although it needs the Factory. The Ghost is t2. The Twilight Council unlocks no unit, so it is left out.
  - Campaign-only units (for example the WoL Firebat, Goliath, Diamondback and Wraith, or the LotV Reaver): use the multiplayer gate of the building that makes them. Mission unlocks are not tech gates.
  - Co-op Missions values appear in the same wiki infoboxes; ignore them.
- **Halo Wars 2.**
  - Halopedia's unit tables give each unit a "Tech" value from 0 to 3. The HQ upgrades unlock tech 1 to 3: Combat Station, Command Center and Headquarters (UNSC); Stronghold, Citadel and Fortress (Banished).
  - The Banished outpost page says a match starts with a Stronghold, so tech 1 is available from the start. Tech 0 and tech 1 are therefore both t1, tech 2 is t2 and tech 3 is t3.
  - **Check:** the UNSC Firebase page does not say outright that the UNSC main base also starts at tech 1. I assumed the two sides match.
  - Consequence: the Garage, Airpad and Foundry need tech 2, so Warthogs, Hornets, Wolverines and Marauders are t2, and the Scorpion, Wraith and Vulture are t3. Heroes such as Atriox's Chosen are listed at tech 1, so they are t1.
  - Unit upgrades (Gauss Warthog, Canister Shell) are upgrades, not tiers.
  - The Flood appear only as enemies (Awakening the Nightmare campaign, Terminus Firefight). They are not a playable side; skip them or mark them atypical.
- **Dawn of War.** Nine races step up in different ways, so the gates are generic: `Tier 1`, `Tier 2`, `Tier 3`.
  - Relic units (Land Raider, Baneblade, Avatar, Squiggoth and so on) count as Tier 3.
  - Newer wiki unit pages (the Dow1UnitData template) give the tier as a number, for example Tau Devilfish 2, Hammerhead 3, Sisters Immolator 2, Exorcist 3 and Living Saint 3. Older pages (DoWUnitData) give requirements instead. Translate them with this table:

    | Race | Tier 2 step | Tier 3 step | Confidence |
    |---|---|---|---|
    | Space Marines | Monastery (HQ add-on) | Fortress Monastery | sourced (Stronghold page) |
    | Chaos | Unholy Monastery | Desecrated Fortress | from unit requirements (Possessed and Obliterators need the first, Khorne Berzerkers the second) |
    | Orks | Pile O Gunz! | Orky Fort (Settlement add-on) | sourced (Settlement page) |
    | Eldar | Mobilize for War (Webway Assembly research, needs the Support Portal) | Annihilate the Enemy (Soul Shrine research) | sourced |
    | Necrons | Awakened Monolith | Engaged Monolith | sourced (Necron Monolith page) |
    | Dark Eldar | first Kabal Fortress upgrade | second upgrade | the page says it is upgraded twice; names not checked |
    | Sisters of Battle | Ecclesiarchal Cathedral (Chapel upgrade) | not checked | partly sourced (Pristine Sanctuary page) |
    | Tau, Imperial Guard | not checked | not checked | use the tier number on the unit page. The Leman Russ and Baneblade need "Regimental Command", probably the top IG step. |

  - Orks also have Waaagh! banner population thresholds (Wartrukk 50, Killa Kan 60, Squiggoth 70). Note them on the unit; they are not a tier.
  - Eldar aspect stones unlock single units and are not a tier.
  - Wiki data that looks wrong: the Guardsmen page lists "Kasrkin Quarters" as a requirement, and the Chaos Predator and Defiler show no requirement. Check before you rely on them.
- **Dawn of War II.** Tiers are explicit. Each HQ has Level 2 and Level 3 upgrades, and every Retribution unit page states its tier. Heroes are picked at the start, so they are t1.

## Prices

Method for all six: price as stated in each basis, anchor on the main battle tank, thresholds at about 0.5, 0.9, 1.4 and 2 times the anchor. The checks below use the wiki values I saw; values marked "about" are from memory and may differ by patch.

- **Supreme Commander: mass + energy ÷ 150, anchor about 205 (Pillar and Rhino); thresholds 100, 180, 290 and 410.**
  - The divisor is the Forged Alliance tech 2 mass fabricator's exchange rate. Energy then adds only a few per cent, so this is close to mass alone.
  - Very low: Mech Marine 36, Striker 58, Cyclone interceptor 65 (50 mass but 2,250 energy).
  - Medium: Pillar and Rhino 205.
  - High: Obsidian and Seraphim Ilshavoh 372.
  - Very high: Titan 516, the Wasp air-superiority fighter 533, Percival 1,373, Monkeylord about 20,700, Fatboy about 26,650.
  - **Hard to map.** Prices span three orders of magnitude, so tech level decides the band: all T1 is very low and all T3 is very high. Anchoring on the T1 tank (56) would push everything from T2 up into very high, which is worse.
  - Air units pay mostly in energy (the interceptor 2,250 energy for 50 mass), so the formula makes them look cheap. Mention energy-heavy units in their notes.
- **Planetary Annihilation: metal, anchor 800 (Leveler); thresholds 400, 720, 1,120 and 1,600.**
  - Very low: Dox 45, Ant 150, Inferno 225.
  - Low: Slammer and Locusts 500, Bluehawk 700.
  - Medium: Storm 750, Leveler and Gil-E 800.
  - High: Sheller 1,200, Vanguard 1,500.
  - Very high: Manhattan 8,000, Titans 30,000.
  - Same compression as SupCom. The Leveler (the database calls it an assault tank) was chosen over the Vanguard heavy tank because it is the standard T2 line tank, and to match the SupCom anchor.
- **StarCraft II: minerals + 3 × gas, anchor 525 (Siege Tank 150 minerals and 125 gas); thresholds 260, 470, 740 and 1,050.**
  - The weight 3 comes from the Liquipedia mining rates (about 925 minerals and 325 gas per saturated base per minute, 2.85 to 1).
  - The unit prices below are from memory, apart from the Siege Tank and Marine, and the 5.0.15 Viking price cut shows they move. Check each one against the current patch.
  - Very low: Marine 50, Zealot 100, Roach 150, Marauder 175, Hydralisk 250.
  - Low: Stalker 275, Mutalisk and Medivac 400.
  - Medium: Siege Tank and Ghost 525, Immortal 575, Void Ray 700.
  - High: Ultralisk, Thor and Colossus about 875 to 900.
  - Very high: Brood Lord 1,050 (including its Corruptor), Carrier 1,100, Battlecruiser 1,300, Mothership 1,600.
  - With a weight of 2, the boundaries move a little, but the order and most bands stay the same. The calibration pilot (plan step 2) uses SC2 to test the two-resource rule, so this is the place to revisit the weight.
- **Halo Wars 2: supplies + power at par, anchor about 630 (Scorpion 550 + 90, Wraith 550 + 75); thresholds 320, 570, 890 and 1,270.**
  - Very low: Marines 150, Jackrabbit 235, Warthog 250, Hornet 300.
  - Low: Wolverine 330, Nightingale 400, Kodiak 525.
  - Medium: heroes about 575, Scorpion 640, Vulture 850, Colossus 870.
  - High: Grizzly 990.
  - Very high: Scarab 4,000.
  - **Uncertain.**
    - No source gives income rates, so power is not weighted.
    - The Halopedia tables are not tied to a patch. A search snippet of the Prima eGuide (the official guide, behind Cloudflare, so I could not open it) suggested a launch Scorpion price of about 650 resources.
    - Leader-power drops and Blitz card costs are not unit prices.
- **Dawn of War: requisition + power at par, anchor about 460 (Predator 465; Chaos Predator, Leman Russ, Looted Tank and Ravager 450; Hammerhead 480); thresholds 230, 410, 640 and 920.**
  - Very low: Scouts 100, Rhino 145, Guardsmen 160, Space Marine Squad 200, Land Speeder 215.
  - Low: Falcon 300, Necron Heavy Destroyer 300, Terminators 340.
  - Medium: Dreadnought 460, Predator 465, Talos 500.
  - High: relic units 800.
  - Very high: Restored Monolith 1,000.
  - **Hard to map.** Necron units cost power only, so with power counted at par they come out about a band cheaper than they feel. Say so in their notes.
  - Relic units sit at 1.75 times the anchor, so very high is almost empty, as in the Iron Harvest entry. Their weight shows in the relic requirement and the unit cap of 1.
- **Dawn of War II: requisition + power at par, anchor about 570 (Predator and Chaos Predator 575, Leman Russ 625, Looted Tank 500); thresholds 290, 510, 800 and 1,140.**
  - Very low: Scouts 210, Guardsmen 230, Shoota Boyz 270.
  - Low: Tactical Marines 450, Looted Tank 500.
  - Medium: Predator 575, Leman Russ 625, Carnifex 760.
  - The global "red" resource pays for global abilities, not units. Globals that call in units, such as deep-striking Terminators, are not unit prices.
  - The DoW2 economy page gives income figures, but their units (per minute or per tick) are unclear, so I did not use them to weight power.

## Speed

- **SupCom:** ratio = speed / 4.
  - Very slow: Percival 2 (0.5), Monkeylord 2.5 (0.63), Fatboy 1.75 (0.44).
  - Slow: Striker and Pillar 3.3 (0.83).
  - Medium: Titan 4 (1.0).
  - Very fast: interceptors 15 (3.75).
- **PA:** ratio = speed / 20.
  - Every tank (speed 10) and most bots (12 to 14) are very slow or slow.
  - Medium: Skitter 25 (1.25).
  - Medium, at the boundary: Zeus 30 (1.5).
  - The Dox is unusually fast; this is a property of PA, and the band only reflects it.
- **SC2:** ratio = speed / 3.15.
  - Siege Tank 1.0 (medium).
  - Use base speed: no creep, Stimpack or speed upgrades. Record those as abilities or upgrades.
  - Keep one game speed throughout; the wikis use Faster.
- **HW2:** no numeric speeds. Use the unit descriptions, at low confidence:
  - "very fast moving" means fast or very fast;
  - "slow moving" means slow.
  - Some patch notes give speeds (the Season 14 notes on Halopedia raise the Vulture from 9 to 11), but there is no Marine figure to divide by.
- **DoW1:** ratio = speed / 16.
  - Very slow: Necron Warriors 10 (0.63).
  - Slow: Terminators 12 (0.75).
  - Medium: Predator 24 (1.5), at the medium/fast boundary.
  - Fast: Falcon and Land Speeder 36 (2.25).
  - Very fast: Dark Eldar Raider 42 (2.6).
- **DoW2:** ratio = speed / 5.
  - Slow: Carnifex 4.5 (0.9).
  - Medium: Leman Russ 6 (1.2), Predator and Scouts 6.5 (1.3).

## Damage and armour maps

- **DoW2 damage.** The keys are the multiplayer (pvp) damage-type names from the wiki's Damage types page. The map binds: when a weapon's sources give it one damage type the map lists, step 4 under armament[].damage uses the mapped type. Checked for the research run against the wiki's Damage types, Weapon families and weapon pages (October 2026).
  - Rockets, missiles, melta and anti-vehicle shots map to armour-piercing (RA3 also maps rockets to armour-piercing). The type explosive_pvp belongs to the missile and rocket families, which aim at vehicles, and also to the tank-cannon family (autocannon_tank_pvp).
  - Autocannon, suppression, piercing and sniper fire map to kinetic.
  - Left out, because they are unclear or special: barbed_strangler, venom_cannon_pvp, spore, rending, judge_shot_av and boss_cover. Use step 5 under armament[].damage for those weapons.
  - **Where the type comes from.** A weapon page (the RtWeaponData box) names the weapon's family, not its damage type. The Damage types page says the family sets the type, and the Weapon families table gives the type of each family. Step 4 needs both pages among the sources (cited, or named in an uncertain entry). The unit's own Weapons tab, read rendered, shows each weapon's damage type next to its family and can stand in for both. The two names often differ: bolter_pvp deals piercing_pvp, heavy_bolter_pvp deals suppression_pvp, lascannon_pvp and brightlance_pvp deal armor_piercing_pvp, missile_pvp and pvp/rocket deal explosive_pvp, sword_pvp deals melee_pvp. Some weapon pages drop the table's `pvp/` prefix (melta, sniper, plasma_cannon, grenade_launcher, melee_heavy); read them as that table entry. A page that says only `rocket` fits either pvp/rocket or rocket_pvp; both map to armour-piercing, so step 4 gives the same answer.
  - **The game's family does not follow the look of the weapon.** Lasguns, hellguns (hot-shot lasguns), laspistols, multi-lasers and scatter lasers are all in the bolter family; lascannons, brightlances and Tyranid venom cannons share the brightlance family; one sonic blaster page gives the flamer family. Step 4 still follows the type, apart from the exceptions below.
  - **Step 3 exceptions** (record these kinds of weapon as the type named, whatever their category):
    - A weapon coded in our laser or plasma family is energy. This covers lascannons, brightlances and the heat weapons (meltaguns, multi-meltas, fusion guns, inferno pistols), whose types (armor_piercing_pvp, melta) those families do not allow. It replaces the earlier wording, "laser or heat weapons", which also caught the lasguns.
    - A sonic weapon (our sonic family) is sonic.
    - Not an exception: lasguns, hellguns, laspistols, multi-lasers and scatter lasers. The game treats them as small-arms fire, so code their family by how they fire (small arms or machine gun) and let step 4 give kinetic, as the PlanetSide 2 note does for VS guns.
  - **Check:** the Damage types page's row for rocket_pvp hurts heavy infantry far more than vehicles, unlike explosive_pvp, so mapping it to armour-piercing may be wrong. No weapon page I read names rocket_pvp, so no unit depends on it yet.
- **DoW2 armour.** The armour type is the `armor` field of the wiki's unit boxes, from the game data. The game shows the same type in words on the unit's tooltip: Relic's patch notes of 19 July 2011 change that wording for two units.
  - Step 1 (the armour_map): infantry and infantry_fire_resist map to unarmoured, heavy_infantry to light, super_heavy_infantry to medium. A few units carry an infantry type that does not match their body (a walker, or a monster); step 1 still decides for them, and then checks A and B apply.
  - Not mapped, so set per unit: commander (heroes), vehicle (walkers, transports, tanks, artillery and monstrous creatures alike) and the building types.
  - Step 2: nothing for dow2. The game's armour words are the types above. The infantry types are settled by step 1, and vehicle and commander hold no light, medium or heavy. "Light" and "heavy" in role fields and descriptions (light infantry, heavy battle tank) name a job or a size, not an armour type, so they are not step 2 words.
  - Step 3: the four tanks averaged in the cost anchor (Predator, Chaos Predator, Leman Russ, Looted Tank) are heavy. Other vehicles go by kind (step 4) or by comparison (step 5). Only check A makes a unit super-heavy.
  - Heroes (commander): the Damage types table shows the type losing less than infantry to small arms and ordinary melee. So a hero who is a soldier is light by the soldier rule, or medium in a suit bigger than a soldier. A hero who is a monster goes on to steps 4 and 5.
  - This note names no body armour for the soldier rule. A soldier the game gives a plain infantry type stays unarmoured, whatever its health or its armour in the fiction. Cover, the fall-back bonus, veterancy and the melee resistance aura never lift the class (see Game-wide mechanics); mention them in armour.notes.
- **DoW1 armour.** These are the infobox names.
  - Infantry Low, Medium and High map to unarmoured.
  - Infantry Heavy Medium (power armour) maps to light.
  - Infantry Heavy High (Terminators, Obliterators) maps to medium.
  - Vehicle Low and Vehicle Air map to light.
  - Vehicle High (Land Raider, Killa Kan, Baneblade, Restored Monolith) maps to heavy. Lift the Baneblade and Restored Monolith to super-heavy by size.
  - Left out, to be set per unit: Vehicle Medium (from the Rhino to the Predator), Commander, Daemon Medium and High, and buildings.
  - DoW1 has no named damage types: each weapon lists damage per armour type, so there is no damage_map.
- **No maps for SupCom, PA, SC2 or HW2.** SC2's attributes (Light, Armored, Biological, Mechanical, Massive, Psionic) cut across our classes. For sc2 they are step 2 of the armour-class order. The Siege Tank, the cost anchor, is heavy. Other Massive units are heavy; only check A makes one super-heavy. Other Armored units are medium, or light when they are infantry-sized (body size small, such as the Marauder). Light units are unarmoured when Biological and not Mechanical, otherwise light. A unit that is neither Light nor Armored goes on to step 4.

## Flavour affinity (a proposal, not a sourced fact)

- **Given:**
  - SC2 protoss: allied (shields, warp and blink, stasis and time tricks, cloaking, carriers and air power). They also have psionics, which is Empire, so this is a judgement call.
  - HW2 banished: soviet (brute force, scavenged machines, ramming Choppers, the Scarab walker). Also a judgement call.
  - DoW1 and DoW2 orks: soviet (salvage and looted tanks, cheap numbers, crude walkers).
  - DoW1 and DoW2 imperial-guard: soviet (masses of infantry, heavy tanks, artillery, super-heavy Baneblade).
  - DoW1 tau: allied (markerlight lock-on, stealth suits, drones and shields, hover tanks, battlesuits).
- **Left out because they are mixed:**
  - SupCom: UEF leans soviet (durable, slow, artillery), Aeon allied (hover, shields, long range) and Cybran empire (agile, stealth, a transforming destroyer, self-repair). None is clear.
  - Eldar: Empire's blades, psionics and discipline, but also Allied prism weapons, hover tanks and teleporting.
  - Dark Eldar: Empire's speed and blades, but also soul-draining.
  - Space Marines, Chaos, Necrons, Sisters of Battle, Tyranids, Terran, Zerg and UNSC.
  - PA has no factions.

## Game-wide mechanics

Mechanics that belong to the game, not the unit (see Shared mechanics and universal keys in the Conventions). Leave them off every unit's weapons and abilities. A unit that does one of them better or worse than the rest says so in its strengths or weaknesses.

### StarCraft II (`sc2`)

Written for pilot round 1, from the StarCraft Wiki's Burrow page and this note's speed rules. The health regeneration and plasma shield bullets were added after pilot round 2; check both against Liquipedia before the SC2 research run.

- **Basic orders** (move, attack, stop, hold position, patrol): every unit. No pattern.
- **Burrow** (burrow): most Zerg ground units can burrow once the Burrow research is done. Leave it off them; the wiki names the broodling as one that never can. A unit that does more with it records that on the unit: roaches and infestors can move while burrowed, and the lurker attacks only while burrowed.
- **Creep**: Zerg ground units move faster on creep. Speeds are taken off creep (see Speed above), and creep is not recorded on units.
- **Entering and leaving a transport or a bunker**: universal keys. The carrier (Medivac, Warp Prism, an Overlord with its transport upgrade) keeps one passive for its passenger seats (see Paired entries).
- **Weapon and armour upgrades** bought at a research building for a whole class of units (Engineering Bay, Armory, Evolution Chamber, Forge and the like): side-wide upgrades, left off. Bands use the stock unit.
- **Health regeneration** (armour model self-repair): every Zerg unit slowly regains health on its own. Code self-repair on each Zerg unit and say in armour.notes that it is slow and shared by the race. Terran and Protoss units have none.
- **Plasma shields** (armour model regen-shield): every Protoss unit has a shield over its health that recharges after a short time out of combat. Code regen-shield on each Protoss unit, as the term's examples say.

### Dawn of War II (`dow2`)

Written before any dow2 unit is coded, from the Dawn of War Wiki's Dawn of War II combat and Dawn of War II economy pages, its Retribution ability, global, hero and building pages, and the multiplayer parts of the Retribution manual. Everything here is multiplayer (pvp); the campaign and The Last Stand work differently.

- **Basic orders** (move, attack, attack-move, facing, ranged or melee stance, forced melee): every unit. No pattern. The stance only picks which of the unit's weapons it attacks with; it is not a weapon swap, so it links no switch-weapon-mode.
- **Set-up weapons**: heavy weapons set themselves up when their squad stands still and then fire only within a fixed arc. That is how the weapon works, not a deploy ability or a mode. Describe the set-up time and the arc in the weapon's summary.
- **Fall back** (retreat-to-base): heroes and most infantry. The squad runs home to its HQ, or to a retreat point that some units and structures provide; it cannot be steered on the way, sheds suppression, speeds up after a moment and takes far less ranged but more melee damage. Vehicles and the heaviest infantry cannot fall back (the wiki gives Terminators as the example); such a unit says so in its weaknesses. Record on the unit only what goes beyond the order: a unit or structure others can fall back to (pattern wanted: a retreat point; until then leave patterns empty and add a fit_note), or an ability that stops a retreat or forces an enemy into one.
- **Reinforce** (reinforce-squad, recorded on what lets others reinforce, not on the squads): a squad that has lost members buys them back near a reinforcement point, either its HQ or a unit or structure whose description says nearby squads can reinforce (transports, a few monsters, relay beacons and bunkers, some globals). Retribution adds automatic reinforcing near such a point, switched on with a right-click on the reinforce button. Units of one model (vehicles, monsters, most heroes) have nothing to reinforce. A unit that lets other squads reinforce near it keeps one passive linking reinforce-squad. A squad that refills itself away from such points on a key records that ability. Squad leaders and extra members bought as upgrades are upgrades, not reinforcement.
- **Veterancy** (earn-veterancy): most units gain experience from kills and from reviving allied heroes, and squads close by get a share. Each level adds health, energy, regeneration, melee skill and damage. Ordinary units have four levels, heroes ten, and heroes level faster. The pages I read name no unit without it. An ability that only grows stronger with level stays innate (see the ability-sources tie-break); say how it grows in its summary. Army Level is a cosmetic account rank, not veterancy: ignore it.
- **Fallen heroes** (the revive would be repair-allies, revive variant): a hero at zero health is knocked out on the field instead of dying. Teammates can revive it there (the manual; the wiki lists the Resurrect ability on the heroes, and reviving earns experience), its owner can bring it back at base for requisition at a price that falls while it waits, and one Space Marine global revives all of them at once. Leave every revive off the units. Being knocked out is the hero's own: code the armour model downed-revive on a hero only where its sources show that the model fits (the pages I read say nothing of crawling or of enemies finishing a downed hero), and say so in armour.notes.
- **Garrison** (carry-passengers, recorded on the building, bunker or transport, not on the riders): infantry squads can go into garrisonable buildings and fire from the windows, with more protection than heavy cover. The pages describe only infantry doing it, and some massive heroes cannot; they crush cover instead (the wiki's Hive Tyrant strategy page names three). Entering and leaving are universal keys. A transport keeps one passive for its passenger seats (see Paired entries).
- **Cover** (no pattern): units in light or heavy cover, or inside a building, are hit less often and lose less to ranged fire. Cover helps only against fire from its side, flame does more against it, and some weapons ignore it. It comes from where the unit stands, so it is not an armour model; mention it in armour.notes where it matters. A unit that crushes cover or cannot use it says so in strengths or weaknesses. A unit that places cover on a key records that ability.
- **Suppression and knockback** (no pattern; the weapon traits suppress and knockback): suppressing fire drains a squad's courage until it slows right down and can hardly fight; falling back clears it. Knockback throws infantry to the ground for a moment. The game separates weapon knockback, which retreating squads and the heaviest infantry shrug off, from ability knockback, which hits them too. Vehicles and a few heavy heroes and squads cannot be suppressed. Immunity to suppression or to weapon knockback goes in strengths. An ability that breaks suppression or grants immunity is the unit's own.
- **Capturing points** (a game-mode rule, no pattern): infantry claim requisition points, power nodes and victory points (the economy page and the manual name no other claimers). A unit that captures faster, or a vehicle whose description says it can take points away, says so in strengths. Activating a power node and adding generators to it are bought at the node, not done by a unit (the manual; the wiki's generator pages name no builder).
- **Global abilities** (side-wide powers; source commander-power where one is recorded): each race earns a global resource ("red") by fighting, capturing, killing and losing units, and spends it from the global ability bar, not through any unit. Which globals a player has depends on the hero picked. Leave off every global that buffs all units of a class, buffs or hides one targeted squad of any type, strikes an area or builds a structure. A global that brings a named unit type onto a spot the player picks (deep strike, drop pod, Valkyrie drop, a squad spawned at a target point) is recorded on that unit as an ability with source commander-power, linking drop-in-from-above. One that only spawns the unit at the HQ or base adds no ability; say in notes how the unit is fielded. The global's cost is not the unit's price (see Prices).
- **HQ upgrades** (each HQ's Level 2 and Level 3): side-wide. They open the next tier and can make units already in the field stronger (the manual). Left off: bands use the stock unit, and what an HQ level adds to a unit goes in its notes. Squad and vehicle upgrades and hero wargear (a weapon, an armour and an accessory) are bought on the unit during the match, so they are the unit's own: ability source upgrade, and a weapon one of them adds links upgrade-in-field (see Paired entries).
- **Energy** (no pattern): a unit's abilities that cost energy draw on its own pool, which refills by itself; that pool is the resource energy where the field's rule fits. The race's global resource is the player's stock, not the unit's, and that includes the Ork Waaagh! that pays for many Ork unit abilities: say in the ability's summary that it draws on that stock.
- **Detection** (no pattern): every unit notices infiltrated enemies only at very close range (the keen radius, 5 for most units). Detectors, marked by an eye on their decorator and described as detecting infiltrated units, see them much further off. A stock detector gets the sensor trait detector; one that gains it from an upgrade or a squad leader puts it in sensors.notes. Infiltrating is a unit's own ability (cloak), not game-wide.
- **Melee** (no pattern): infantry tied up in melee fight back in melee and cannot shoot, and special melee attacks come from comparing melee skill. Both belong in the melee weapon's summary, not in abilities. The melee resistance aura that every hero and most melee units carry takes a fixed share off melee damage. That is a cut by kind of damage, so it is neither an ability nor an armour model: mention it in armour.notes, and in strengths where it decides fights.
- **Health regeneration** (armour model self-repair): the infantry Leveling tabs checked in pilot round 2 (Tactical Marines, Guardsmen, Scouts, Shoota Boyz) list the same slow health regeneration rate, and veterancy raises it. It is part of the unit's own health, so code self-repair on each unit whose own Leveling tab lists a rate, as the armour-models rule asks for a model every unit of its kind shares, and say in armour.notes that it is slow and shared. A unit whose tab lists no rate, or that has no Leveling tab, gets no self-repair from this. Read the Leveling tab of every unit; no fit_note is needed.
- **Repair** (repair-allies): not game-wide. The wiki gives the Repair ability to various builder squads and heroes; record it on each unit that has it. Every HQ's healing aura is a base feature: leave it off.
- **Weapon pickups**: the pages I read describe none in multiplayer. Wargear that enemies drop for the player to pick up is a campaign feature (the manual), so nothing is recorded.

Supreme Commander, Planetary Annihilation, Halo Wars 2 and Dawn of War have no list yet. Write one before any of their units is coded.

## Notes for the r5 research agents

- **Supreme Commander.**
  - Use the Supreme Commander Wiki through its API.
  - Raw values are on the `Template:Unitvalues <code>` pages, for example `Template:Unitvalues UEL0201` for the Striker. The fields are BuildCostMass, BuildCostEnergy, BuildTime, MaxSpeed and MaxHealth, plus weapon fields, all tagged SupComVersion 1.5.3599.
  - Rendered stat boxes show energy first, then mass, then build time. Do not swap them.
  - The FAF unit database describes Forged Alliance Forever balance, which differs. Do not mix the two.
  - Interesting mechanics to look for: commander (ACU) enhancements, shields, transports that can fire (ghetto gunship), the Fatboy mobile factory, and the Cybran Salem destroyer, which walks onto land.
- **Planetary Annihilation.**
  - Use palobby.com/units (plain HTML, data-mined from the game files, cited as kind "database").
  - Always add `?version=titans`. The default pages have the Legion Expansion mod switched on and mix in its units (Purger, Peacekeeper and others).
  - Unit pages: /units/unit/<id>?version=titans, for example assault_bot = Dox, tank_light_laser = Ant, tank_laser_adv = Leveler, titan_bot = Atlas.
  - The Planetary Annihilation Fandom wiki is an old, thin stub (its unit list is from build 71937). Do not use it for numbers.
- **StarCraft II.**
  - Liquipedia is the best source. Respect its API terms: one parse request every 30 seconds, gzip and a named user agent. This session was blocked for going faster.
  - The StarCraft Wiki (starcraft.fandom.com) infoboxes have costmin, costgas, supply, produced, req and speed. They also list Co-op values on the same lines; ignore those.
  - Official role lines: the in-game unit description in the Liquipedia and StarCraft Wiki infoboxes is official text.
  - Blizzard's patch notes are official: 5.0.15 (30 September 2025), 5.0.16 and its hotfix, and 5.0.17 (7 October 2026). 5.0.17 rolled most 5.0.16 changes back to 5.0.15. Wiki values may lag, so check each unit against these three patches.
- **Halo Wars 2.**
  - Halopedia allows API access and plain page loads.
  - The cost tables are on the building pages (UNSC Barracks, Garage and Airpad; Banished Hall, Foundry and Summit; Firebase, Banished outpost, War Council and Armory). Columns: Population, Tech, Supplies, Power.
  - Some rows have wrong type labels: the Scorpion is labelled "Core Aircraft".
  - Patch notes are on the Season pages (Season 0 to 15). Season 15 (August 2020) is the last.
  - The Prima eGuide (official) is behind Cloudflare.
- **Dawn of War.**
  - Use the Dawn of War Wiki (dow.fandom.com) through its API. Page names are prefixed `Soulstorm/`, with some older ones under `Dark Crusade/`, `Dawn of War/` or no prefix.
  - Older boxes (DoWUnitData): Requires, Building, Cost (requisition, power, squad or vehicle cap), Speed, Armour.
  - Newer boxes (Dow1UnitData): tier, requisition, power, speed, armor.
  - Chaos and Imperial Guard buildings, and parts of the Tau and Sisters of Battle rosters, are missing or thin. Expect more checking.
- **Dawn of War II.**
  - Use the `Retribution/` pages (RtUnitData: tier, requisition, power, population, speed, armor, role, version).
  - Avoid `Elite/` pages (a community balance mod), `Dawn of War III/` pages and campaign values. Campaign wargear and damage types differ from multiplayer (pvp).
  - **Official role lines.** Written before any dow2 unit is coded, from the wiki's unit, hero, template and Decorators pages, the Retribution manual and Relic's 2011 patch notes.
    - Official text: the `description` field of the Retribution unit and hero boxes (RtUnitData; the italic line at the foot of the box). It reads as the in-game help text. The Retribution manual (official; a PDF from https://store.steampowered.com/manual/56400) prints the same unit lines, often word for word, for the launch version, and the box's line is the later one (its data version is 3.17 to 3.19). So where the two differ, the box decides. The manual's multiplayer section (each race's heroes, units, vehicles, monsters or daemons, and globals) and Relic's patch notes (the Steam product updates of 2011, such as http://store.steampowered.com/news/5870/) are official text too. **Check:** no page says outright that the field copies the game; a look at the in-game tooltip would settle it.
    - Not official: the box's `role` field (a short line such as Basic ranged infantry, or Offense and Support for heroes) and its `type` field (Infantry, Vehicle, Monster and so on). The role field looks like game data, since a few entries are bare placeholders, but neither the manual nor any page I read shows it in the game. Until someone confirms it there, treat it as the wiki's own words. The same goes for the Effects text of ability, upgrade and wargear boxes and for all prose and Strategy pages.
    - Decorators, the icons over each squad, hint at its job (melee or ranged; against infantry, vehicles or everything). They are pictures, not words: their names are internal file names, and the meanings on the wiki's Decorators page are the wiki's words. They name no role.
    - Designation: the only type line the sources show on the tooltip is the armour type (see DoW2 armour). It names an armour, not a role, so roles step 1 reads the description as the unit's official one-line description. Skip its sentences about upgrades ("can be upgraded with", "upgrades grant"): upgrades never count for roles.
    - Strong-against and weak-against: no separate lines. The description says it inside its sentences, calling a unit effective, good or very damaging against a kind of target, or weak in melee, fragile or vulnerable to small arms. Read those phrases as the official strong-against text for roles step 4, and the weak ones for dropping secondary roles, when they name a kind of target (infantry, vehicles); a phrase about all targets names none. No unit in the wiki's Retribution lists flies (Valkyries appear only in globals), so no line names anti-air.
- **Squads (decision 7B).** Dawn of War, Dawn of War II and Halo Wars 2 sell squads. Record squad size in the notes; a squad source maps to the rare squad crew model.

## Uncertainties to check

1. The HW2 tier map assumes both sides start at tech level 1 (stated only for the Banished).
2. The HW2 prices are Halopedia values that are not tied to a patch.
3. The SupCom version: 1.5.3599 is what the wiki's data records. I did not confirm that it is the last official patch.
4. The DoW1 tier steps for Imperial Guard, Tau, Dark Eldar and Sisters of Battle are not checked by name.
5. The two-resource weights are judgement calls:
   - SC2 gas counts 3 times;
   - HW2, DoW1 and DoW2 count both resources at par;
   - SupCom counts energy at the mass-fabricator rate.
6. SupCom and PA cost bands follow tech level almost one to one.
