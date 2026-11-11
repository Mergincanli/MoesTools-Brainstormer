> **Working notes for batch R4.** The parts down to "Uncertain" were written in step 1, while the games registry was filled, and explain its choices. They were written before the fact-check, so where they and `data/games.json` differ, the registry wins. The prep of batch R4 adds the official role lines, the game-wide mechanics and the research notes below them.

# Games registry, batch r4: notes

Batch R4 is StarCraft II: Legacy of the Void (`sc2`), Halo Wars (`hw1`), Halo Wars 2 (`hw2`), Planetary Annihilation: TITANS (`pa`) and MechWarrior / BattleTech (`mechwarrior`), by the plan change of 24 October 2026. This file was gathered on 11 November 2026 from the step-1 notes of those games: `pa`, `sc2` and `hw2` came from [games-r5.md](games-r5.md) and `mechwarrior` from [games-r6.md](games-r6.md), word for word. Halo Wars (2009) had no notes in step 1. The file that was games-r4.md until then (Company of Heroes 1-3, World in Conflict, Wargame, Broken Arrow) is now [games-later-1.md](games-later-1.md).

## Choices that need a look

- **Liquipedia blocked this session.** After two parse calls spaced 31 seconds apart, a few quick search calls triggered a temporary IP block. The block page has a CAPTCHA; I did not try to get around it. Its API terms allow at most one parse request every 30 seconds and need gzip and a named user agent. SC2 agents should follow those terms or use the other sources listed below. The block may still be active from this machine.
- **Faction tags on tier gates.**
  - The `sc2` gates carry the race (terran, zerg, protoss). StarCraft II has no subfactions and every building name belongs to one race.
  - The `pa` and `hw2` gates are untagged. They are shared by every faction (PA, the HW2 tech levels). This follows the r2 and r3 finding that a tagged gate rejects subfaction and `shared` units.
- **No leader subfactions for HW2.** The game has 16 multiplayer leaders, and most swap one or two units (Forge's Grizzly replaces the Scorpion, Johnson's Mantis replaces the Warthog). I kept two factions. Record a leader's units under `unsc` or `banished` and name the leader in the notes and availability.
  - If you prefer the Generals style instead, add subfactions with `parent`.
  - In that case Pavium and Voridus get `introduced_in: hw2-awakening-the-nightmare`; the Halopedia page for the expansion says it added them.
- **Franchise names.** Supreme Commander and Planetary Annihilation are separate franchises, although both descend from Total Annihilation. If design lineage should count, note that they are related.

## Tiers that were hard to map, and how they were decided

- **Planetary Annihilation.**
  - The PA Lobby database itself labels basic factories T1, advanced factories T2 and Titans T3, so the map follows it.
  - Titans use the gate `Titan (built by an advanced fabricator)`.
  - Oddly, the database lists the T1 orbital fabrication bot among the Atlas's builders. Treat Titans as t3 anyway.
  - Units launched from the T2 Unit Cannon keep their own factory gate.
  - The commander uses `Start of the match`.
- **StarCraft II.** (Corrected after the fact-check to match data/games.json.) There is no in-game tier label, so I matched the Zerg Hatchery, Lair and Hive levels:
  - **t1:** the first production building, plus the tech building its line units need. Terran: Command Center, Barracks. Zerg: Hatchery, Spawning Pool, Roach Warren, Baneling Nest. Protoss: Nexus, Gateway, Cybernetics Core.
  - **t2:** the second step. Terran: Factory, Starport, Armory, Ghost Academy. Zerg: Lair-tech buildings (Lair, Hydralisk Den, Lurker Den, Infestation Pit, Spire, Nydus Network). Protoss: Robotics Facility, Stargate.
  - **t3:** the third step. Terran: Fusion Core, and the Thor, whose own gate is "Factory with tech lab and Armory (Thor)". Zerg: Hive-tech buildings (Hive, Ultralisk Cavern, Greater Spire). Protoss: Fleet Beacon, Robotics Bay, Dark Shrine, Templar Archives.
  - The two add-ons, Tech Lab and Reactor, are not a tier step. So the Marauder is t1 and the Siege Tank t2; the Banshee and Raven are t2.
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
  - **Other kinds of unit** (battle armour, combat vehicles, aerospace fighters), if any is coded, are not in the map either: go on to step 4.
- **Damage map.** It covers the three weapon kinds (Energy, Ballistic, Missile). They are MechWarrior Online's hardpoint types, and the BattleTechWiki's BattleMech page sorts 'Mech weapons into the same three, with physical attacks besides.
- **MechWarrior damage: which step decides** (armament[].damage). Checked against the BattleTechWiki's BattleMech page and about twenty weapon pages, and the MechWarrior Online Wiki's Weapons page (October 2026).
  - **Step 4 binds.** A weapon's kind is the first word of the Type field in its BattleTechWiki infobox: Energy for lasers, PPCs, flamers and plasma weapons, Ballistic for autocannons, machine guns and Gauss rifles, Missile for LRMs and other launchers. In MechWarrior Online it is the hardpoint type the weapon needs. A 'Mech's own page lists its weapons without their kind, so step 4 needs the weapon's page, or the MechWarrior Online 'Mech page's hardpoint types, among the sources (cited, or named in an uncertain entry).
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

## Prices

Method (the same for the six games of the step-1 note): price as stated in each basis, anchor on the main battle tank, thresholds at about 0.5, 0.9, 1.4 and 2 times the anchor. The checks below use the wiki values I saw; values marked "about" are from memory and may differ by patch.

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

## Speed

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

## Damage and armour maps

- **No maps for PA, SC2 or HW2.** SC2's attributes (Light, Armored, Biological, Mechanical, Massive, Psionic) cut across our classes. For sc2 they are step 2 of the armour-class order. The Siege Tank, the cost anchor, is heavy. Other Massive units are heavy; only check A makes one super-heavy. Other Armored units are medium, or light when they are infantry-sized (body size small, such as the Marauder). Light units are unarmoured when Biological and not Mechanical, otherwise light. A unit that is neither Light nor Armored goes on to step 4.
- **MechWarrior / BattleTech:** its armour map, its damage map and the steps that decide them are under its heading in "Tiers that were hard to map" above.

## Flavour affinity (a proposal, not a sourced fact)

- **Given:**
  - SC2 protoss: allied (shields, warp and blink, stasis and time tricks, cloaking, carriers and air power). They also have psionics, which is Empire, so this is a judgement call.
  - HW2 banished: soviet (brute force, scavenged machines, ramming Choppers, the Scarab walker). Also a judgement call.
- **Left out because they are mixed:** Terran, Zerg and UNSC.
- PA has no factions.
- MechWarrior / BattleTech: see its Factions bullet above (only House Kurita gets a flavour).

## Uncertain

1. The HW2 tier map assumes both sides start at tech level 1 (stated only for the Banished).
2. The HW2 prices are Halopedia values that are not tied to a patch.
3. The two-resource weights are judgement calls: SC2 gas counts 3 times; HW2 counts both resources at par.
4. PA cost bands follow tech level almost one to one.
5. MechWarrior / BattleTech:
   - The MUL refused this session's requests (HTTP 403 at masterunitlist.battletech.com), so reading the unit role there (Official role lines) is untested. If coders cannot reach it either, roles step 1 never finds an official line for this game.
   - Whether MechWarrior Online or MechWarrior 5: Clans shows a role or description line in the game was not checked.
   - Physical attacks and battle armour riding come from the tabletop. The pages I read do not say whether the two piloted titles have them, so the Series games rule (the newest counted title decides) could not be applied; the note leaves both off the 'Mech either way.
   - Riding battle armour gives the 'Mech no passenger seats. If OmniMech handholds should count as seats, the passenger passive of Paired entries would apply to most OmniMechs.

## Official role lines

StarCraft II's and MechWarrior's are in "Research notes for the r4 agents" below, as step 1 and the earlier preparation left them. The prep of batch R4 writes one section per game here.

## Game-wide mechanics

Mechanics that belong to the game, not the unit (see Shared mechanics and universal keys in the Conventions). Leave them off every unit's weapons and abilities. A unit that does one of them better or worse than the rest says so in its strengths or weaknesses.

### StarCraft II (`sc2`)

Written for pilot round 1, from the StarCraft Wiki's Burrow page and this note's speed rules. The health regeneration and plasma shield bullets were added after pilot round 2; check both against Liquipedia before the SC2 research run.

- **Basic orders** (move, attack, stop, hold position, patrol): every unit. No pattern.
- **Burrow** (burrow): most Zerg ground units can burrow once the Burrow research is done. Leave it off them; the wiki names the broodling as one that never can. A unit that does more with it records that on the unit: roaches and infestors keep moving when burrowed, and the lurker attacks only while burrowed.
- **Creep**: Zerg ground units move faster on creep. Speeds are taken off creep (see Speed above), and creep is not recorded on units.
- **Entering and leaving a transport or a bunker**: universal keys. The carrier (Medivac, Warp Prism, an Overlord with its transport upgrade) keeps one passive for its passenger seats (see Paired entries).
- **Weapon and armour upgrades** bought at a research building for a whole class of units (Engineering Bay, Armory, Evolution Chamber, Forge and the like): side-wide upgrades, left off. Bands use the stock unit.
- **Health regeneration** (armour model self-repair): every Zerg unit slowly regains health on its own. Code self-repair on each Zerg unit and say in armour.notes that it is slow and shared by the race. Terran and Protoss units have none.
- **Plasma shields** (armour model regen-shield): every Protoss unit has a shield over its health that recharges after a short time out of combat. Code regen-shield on each Protoss unit, as the term's examples say.

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

Halo Wars, Halo Wars 2 and Planetary Annihilation have no list yet. The prep of batch R4 writes one before any of their units is coded.

## Research notes for the r4 agents

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
- **Squads (decision 7B).** Halo Wars 2 sells squads. Record squad size in the notes; a squad source maps to the rare squad crew model.
