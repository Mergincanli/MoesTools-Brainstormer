> **Working notes from step 1** (filling the games registry). They explain choices and give tips for this batch's research agents. They were written before the fact-check, so where they and `data/games.json` differ, the registry wins; the fact-check fixes are listed in the step-1 pull request.

# Games registry, batch r1: notes

Entries written: `ra1` (Red Alert with Counterstrike and The Aftermath) and `ra2` (Red Alert 2 with Yuri's Revenge), in `games_r1.json`. A suggested replacement for `ra3` is in `games_r1_ra3_suggestion.json`. All three pass `check_games.py`.

## Choices that need a look

1. **No faction tag on tier gates that more than one faction id uses.** The validator accepts a unit's gate only if the gate has no faction or exactly the unit's faction. Both games have `shared` units, and RA2 has country subfactions (for example `ra2.iraq.desolator` needs the Radar Tower). A `soviet` tag on Radar Tower would reject the Desolator. So shared gates (Barracks, War Factory, Radar Dome, Battle Lab and so on) carry no tag; only gates that a single faction id uses are tagged (RA1 Kennel and Tesla Coil; RA2 Psychic Radar, Grinder and Robot Control Center). Suggested validator change: also accept a gate tagged with the parent of the unit's faction. Then the tags could go back on.
2. **Which gate to record.** T1 gates are the production buildings. For T2 and T3, record the highest tech building in the unit's chain. RA1 aircraft come from the Helipad or Airfield, which need a Radar Dome, so they use the gate "Radar Dome". RA2 Harriers and Black Eagles use "Airforce Command Headquarters", which both builds them and is the tech step.
3. **Service Depot is T2** in both games. It is one building beyond the basics, and the wiki's war factory and barracks pages list its units (minelayers, MCVs, the RA1 Field Mechanic) under tier 2. **The RA1 Kennel is T1.** It is the dogs' own production building and needs only the barracks; the wiki lists the dog as tier 1.
4. **Stolen tech is T3** (RA2: Chrono Commando, Chrono Ivan, Psi Commando, and Yuri Prime in RA2 only). It needs a Spy inside an enemy Battle Lab, and the Allied Spy itself needs a Battle Lab.
5. **RA2 subfactions.** The nine countries are listed as subfactions with a parent, because each fields at most one unit no other country has: the Sniper (Great Britain), Tank Destroyer (Germany), Black Eagle (Korea), Terrorist (Cuba), Desolator (Iraq), Demolition Truck (Libya) and Tesla Tank (Russia). The USA (a paradrop) and France (the Grand Cannon, a defence) have no unique unit, but they are listed so the set is complete. **RA1 countries** (England, France, Germany, Greece, Spain, Turkey; Russia, Ukraine) only change stats and have no unique units, so they are left out.
6. **`shared`.** RA1: Rifle Infantry, Rocket Soldier, Engineer, Ore Truck, MCV, Transport, Tanya (multiplayer) and the Aftermath Demolition Truck. RA2: the Engineer (all three sides in Yuri's Revenge) and the Amphibious Transport. The transport has a separate version per side, and its armour differs (light for the Allies, heavy for the Soviets and Yuri), so it can be recorded per side instead. The RA2 Attack Dog belongs to the Allies and Soviets but not Yuri, so it is not `shared` in Yuri's Revenge. Record it under one side and name the other in its notes, because the schema has no "two of three sides" faction.
7. **Flavour.** Yuri gets no `flavour_affinity`. Psionics matches one Empire theme, but the faction as a whole (mind control, cloning, grinders, Gattling guns, saucers) does not clearly share any one flavour's spirit. The countries carry their parent's affinity.
8. **Five sources on `ra2`, one over the 1-4 guide.** The anchor uses three tanks with different prices, so it needs three price pages, plus one page each for tiers and speed. If four is a hard cap, drop the Lasher source and keep "Lasher (700)" in the basis.

## Prices

- **RA1:** anchor about 875 credits (Medium Tank 800, Heavy Tank 950), giving thresholds of 400, 800, 1,200 and 1,800. Checks: Rifle Infantry 100, dog 200 and Rocket Soldier 300 are very low; Ranger 600 and Light Tank 700 are low; the two main tanks are medium; Tanya and Longbow (1,200), Tesla Tank (1,500) and Mammoth Tank (1,700) are high; Cruiser 2,000, MAD Tank 2,300 and Chrono Tank 2,400 are very high. The Mammoth sits just under very high, as RA3's Apocalypse does under RA3's thresholds.
- **RA2:** anchor about 770 credits (Grizzly 700, Rhino 900, Lasher 700), giving 400, 700, 1,100 and 1,500. Checks: Conscript and GI are very low; Terror Drone 500 and IFV 600 are low; the main tanks are medium; Prism Tank 1,200 is high; Boris, Chrono Legionnaire and Demolition Truck (1,500), Apocalypse and Mastermind (1,750), and Kirov and Battle Fortress (2,000) are very high. The RA2 Tanya page's infobox has no price, so take it from another page or the rules.
- Use list prices. Ignore the Soviet Industrial Plant, which makes vehicles cheaper, and the Cloning Vats, which add a free copy of each infantry unit trained. The Vats are Soviet in RA2 and Yuri's in Yuri's Revenge.
- Rounding is to the nearest 100 in both games. That keeps RA3's style and changes no band for the prices checked above.

## Speed

- The reference is land speed 4 in both games: RA1 Rifle Infantry, and RA2 Conscript (the GI and Initiate are also 4, per their wiki pages). Ratio = unit land speed / 4. Examples: RA1 Medium Tank 8 (2.0, fast), Mammoth 4 (1.0, medium); RA2 Grizzly 7 (1.75, fast), Rhino 6 (1.5, medium), IFV and Terror Drone 10 (2.5, fast).
- Some speeds changed between patches. The RA2 Demolition Truck went from 6 to 5 in patch 1.004. Use the version named in `version_researched`.

## Damage and armour maps (not in `sources` because of the 1-4 guide)

- **RA1 damage:** EA's released source code lists the nine warheads (https://raw.githubusercontent.com/electronicarts/CnC_Remastered_Collection/master/REDALERT/RULES.CPP), and DEFINES.H in the same folder says what each is for. SA (small arms) and HollowPoint (sniper bullets) map to kinetic, HE and Nuke to explosive, AP to armour-piercing, Fire to fire, Super (the Tesla warhead) to electric, Organic (the dog's bite) to melee, and Mechanical (the Field Mechanic's vehicle repair) to repair. The Medic's heal may also use Organic; record any healing weapon as repair, whatever its warhead.
- **RA1 armour:** CONST.CPP in the same folder names five armour types: none, wood, light, heavy, concrete. Wood and concrete are building armour, so they are left out. RA1 puts every tank, from the Light Tank to the Mammoth, in "heavy". Treat the map as the default and place clearly lighter vehicles (Light Tank, APC) in our medium class, saying why.
- **RA2 armour:** from the ModEnc page https://modenc.renegadeprojects.com/Armor_types (11 types). none and flak map to unarmoured: flak is a slightly tougher soldier type, and the wiki gives it to the Conscript. plate (armoured elite infantry) maps to light, as do light and special_1 (the Terror Drone). medium maps to heavy: ModEnc says only miners and the Kirov use it, and the Kirov should still be recorded as super-heavy (a T3 airship). heavy maps to heavy. Left out: wood, steel and concrete (buildings and defences) and special_2 (missiles in flight).
- **No RA2 damage map.** Each RA2 weapon names its own warhead in the rules, dozens of them, not a short fixed list. Use step 5 under armament[].damage.
- Wiki text sometimes disagrees with the infobox. The Grizzly's text says medium armour and the Lasher's says light, but both infoboxes say Heavy. Trust the infobox, which reflects the game data.

## Uncertain

- **RA2 Chaos Drone tier:** the Yuri war factory page lists it as tier 1, but the Psychic Radar page lists it among what the radar unlocks. Check before assigning.
- **RA1 Tesla Coil:** the manual says it needs a Tech Center, but in the game it needs only the War Factory (the wiki notes this). We follow the game, so the Tesla Tank and Shock Trooper are T2.
- **RA3 Soviet Naval Yard:** its infobox says tier 2, but its own production list puts its basic boats at tier 1 with no extra gate. The suggestion maps it to t1.
- RA1's last Westwood patch, 3.03, was a beta that was never officially released, but the wiki treats it as the final version. The Remastered Collection's balance patches mostly touched Tiberian Dawn and RA1's low-power rules. They also removed Aftermath units from Quickmatch, but those units stay in skirmish.

## RA3 suggestion (`games_r1_ra3_suggestion.json`)

- **Adds missing production and tech gates.** Soviet: Barracks t1, Naval Yard t1. Allied: Boot Camp t1, Seaport t1, Airbase t1, Defense Bureau t3 (Uprising FutureTech units such as the Cryo Legionnaire, Pacifier FAV, Future Tank X-1 and Harbinger Gunship). Empire: Instant Dojo t1, Dojo Upgrade t2, Dojo Breakthrough t3, Imperial Docks t1, Docks Upgrade t2, Docks Breakthrough t3. Without these, an agent researching a Conscript, Peacekeeper, Shinobi or any ship has no matching gate. Soviet aircraft use "Super Reactor", because the Airfield needs one, and the Kirov uses "Battle Lab". The Uprising Grinder needs a Super Reactor and a Crusher Crane (a tier 1 building), so its gate is "Super Reactor".
- **Adds the wiki's Tier page as a fourth source.** The gate pages are Barracks (Red Alert 3), Boot camp (Red Alert 3), Instant dojo, Naval yard (Red Alert 3), Seaport, Imperial docks, Airbase and Defense bureau on cnc.fandom.com.
- **No armour_map suggested.** RA3 has no short list of armour categories. Each unit has its own armour set (names such as BaseTankArmor or BaseAdvancedTankArmor, with a percentage against each of its damage types; some wiki infoboxes leave it blank), so mapping happens per unit, as the samples already do. Where an infobox gives a plain armour word (Light, Medium or Heavy), that word decides (step 2 of the armour-class order in the armour-classes list). Set names such as BaseTankArmor are not such words: go on to step 3. The three tanks averaged in the cost anchor are heavy.
- **RA3 damage.** Magic (the Leech Beam's category, which hurts every armour type in full) and Spectrum are left out of the map on purpose: those weapons take step 5.
- **Official role lines.** The C&C Wiki's <unit>/Profile pages copy the official RA3 site's unit profiles. Read the designation line before coding roles, and cite the page as kind wiki with a note. The role field in the main page's infobox (for example anti-surface robot scout) is the wiki's own words, not official text.
- **Gap not fixed:** no `ra3` source backs the anchor price or the speed reference. The Hammer tank page gives 1,000 credits and land speed 75.

## Game-wide mechanics

Mechanics that belong to the game, not the unit (see Shared mechanics and universal keys in the Conventions). Leave them off every unit's weapons and abilities. A unit that does one of them better or worse than the rest says so in its strengths or weaknesses.

### Red Alert 3 (`ra3`)

Written for pilot round 1, from the Command & Conquer Wiki's Veterancy, Garrisoning and Top Secret Protocol pages. The units that never rank up, and High Technology, were added after the step-2 review, from the pages on High technology, the Cryocopter, the Cryo legionnaire and the Multigunner IFV.

- **Basic orders** (move, attack, stop, stances): every unit. No pattern.
- **Veterancy** (earn-veterancy): every unit climbs to Veteran, Elite and Heroic by fighting, by picking up veterancy crates, or by being built while its side holds Veteran Academies. The Cryocopter and the Cryo Legionnaire never rank up (their infoboxes, and the Multigunner IFV page); those units say so in weaknesses. Infantry riding in a Multigunner IFV are not promoted while inside, since the car does the firing (Veterancy page).
- **Garrison** (carry-passengers, recorded on the building or bunker, not on the riders): infantry can enter garrisonable buildings and battle bunkers. Attack dogs and war bears cannot.
- **Enter, leave and evict passengers**: universal keys, on every transport too. A transport keeps one passive for its passenger seats (see Paired entries).
- **Top Secret Protocols** (side-wide powers bought with security points): a protocol that changes every unit of a class stays off, such as Terror Drone Surprise, which can make a destroyed Soviet vehicle release a Terror Drone. A protocol that gives named unit types a new button or effect is recorded on each of them, with source commander-power. A protocol that only changes numbers is not an ability. High Technology is one: it shortens ability cooldowns (aircraft carrier, attack dog, Cryocopter, Guardian tank, Harbinger gunship) and makes some effects stronger or longer (the dog's bark, the Guardian's target painter, the carrier's blackout missile, the Cryocopter's beams, Cryo Legionnaire damage). Name it in the summary of the ability it changes, or for weapon damage in that weapon's summary, never as an ability of its own.

Red Alert 1 and Red Alert 2 have no list yet. Write one before any of their units is coded.

## Research notes for the r1 agents

- **Best source:** the Command & Conquer Wiki, read through its API. The production building pages (barracks, war factory, shipyard, airfield) list units under tier headings with their extra requirements, and each unit's infobox gives cost, land speed, armour type, tier and internal name. Space requests out and retry after a 429.
- **For RA2 rules meanings** (armour types, Verses, warhead flags), use ModEnc (modenc.renegadeprojects.com). Its pages download directly with `?action=raw`.
- **For RA1 engine behaviour,** EA's GitHub source release shows what the code does. Numbers such as cost and speed live in RULES.INI, so take them from the wiki.
- **Research what is buildable in skirmish.** Campaign-only units: Counterstrike's specials (Volkov, Chitzkoi, the ant missions), RA2's Cosmonaut, and the Navy SEAL in RA2 (it is buildable in Yuri's Revenge). Mark multiplayer-only units (RA1 Tanya, Thief, Mobile Gap Generator, Radar Jammer) in their notes. Counterstrike adds no skirmish units; The Aftermath does, so set `introduced_in: ra1-aftermath`.
- **Units dropped in Yuri's Revenge** (the Soviet Psi-Corps Trooper, and Yuri Prime as Soviet stolen tech) are RA2-only. Say so in their notes, because the researched version is Yuri's Revenge.
- **Unit id examples:** `ra2.iraq.desolator`, `ra2.shared.engineer`, `ra1.shared.rifle-infantry`, `ra2.yuri.lasher-tank`.
- **Veterancy (elite) is not a tier.** It is a passive upgrade earned in battle.
