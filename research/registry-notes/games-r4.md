> **Working notes from step 1** (filling the games registry). They explain choices and give tips for this batch's research agents. They were written before the fact-check, so where they and `data/games.json` differ, the registry wins; the fact-check fixes are listed in the step-1 pull request.

# Games registry, batch r4: notes

Entries in `games_r4.json`: `coh1`, `coh2`, `coh3`, `wic`, `wargame` (series) and `broken-arrow`. `check_games.py` prints OK.

Every cited URL was checked:
- Fandom pages through the MediaWiki API: each exists under exactly the cited title, with no redirect.
- The other pages return 200, and their page titles match the cited titles.

A six-word copy-check of every text field against all the pages read (wiki text, coh3stats, BattleGroup, Born2Battle, Steam posts) finds no shared runs.

## Choices that need a look

1. **One tier rule for all three Company of Heroes games.** The CoH armies climb a ladder of tier buildings, phases or officers. The map reads it like this:
   - **t1:** the HQ, plus any production building that needs nothing but the HQ.
   - **t2:** anything that needs one earlier step: a tier building, a phase, an officer, a support centre or an upgrade.
   - **t3:** the faction's top rung, meaning its last and most expensive tier building or the upgrades inside it (usually the medium or heavy tank building).

   Where a source gives no prerequisite, the band follows the game's own tier order. For CoH3 the official 2.2.0 patch notes confirm the top rungs: they list the four armies' "end-game structures" as the Tank Depot, Panzer Kompanie, Company Command Post and Panzer Armee Kommand. This rule puts main tanks at t3 for most armies (US Tank Depot, Panzer Command, Mechanized Armor Kampaneya, Battalion Command Post, Panzer Kompanie). The exceptions are armies with one more rung above the tanks:
   - CoH2 Ostheer: the Panzer IV comes from the Support Armor Korps (Battle Phase 2 of 3), so it is t2.
   - CoH2 British: the Cromwell comes from the Company Command Post (t2), with Hammer or Anvil Tactics above it.
2. **Strict reading versus top rung.** In CoH1 and CoH3, the US Motor Pool and Tank Depot both need only the same step: the Supply Yard in CoH1, any one Support Center in CoH3. A strict reading would make both t2. The Tank Depot is t3 because it is the top rung and costs about twice as much (CoH1 350 manpower and 90 fuel against 240 and 45; CoH3 300 and 140 against 200 and 40). The CoH3 Wehrmacht is the same case: the coh3-data files for patch 2.5.0 show the Luftwaffe, Panzergrenadier and Panzer Kompanie each needing only the Infanterie Kompanie. Source: https://data.coh3stats.com/cohstats/coh3-data/v2.5.0-1/data/ebps.json, field `requirement_ext`. Too large to cite as a page.
3. **Call-ins (doctrines, commanders, battlegroups).** Two shared gates are untagged, so every faction can use them:
   - "Call-in, early unlock" (t2): any other call-in.
   - "Call-in, late unlock" (t3): one of the last two unlocks of its branch. In CoH2, where commanders have no branches, it is one of the commander's two most expensive abilities.

   If the call-in also needs a tech building with a higher band, record that building's gate instead. A call-in that is then built at a building (CoH1 Pershing at the Tank Depot, after the Armor Company unlock) takes the building's gate. Command points are an experience gate, not a tech building, so this is a convention. Example: CoH2 command-point costs do not track power. The coh2stats Guard Motor Coordination page lists the T-34/85 at 0 points; tech requirements gate it instead.
4. **CoH2 gates that rest on thin or old pages.** The CoH2 pages on the Company of Heroes Wiki are often stubs from 2013-2015:
   - **Ostheer phases:** the Kampfgruppe Headquarters page has three Battle Phases (Leichte Mechanized Kompanie, Support Armor Korps, Heavy Panzer Korps). Later patches may have moved the Leichte Mechanized Kompanie to need only the Infanterie Kompanie. If so, it is t1.
   - **OKW:** the trucks set up as Battlegroup, Mechanized Regiment and Schwerer Panzer Headquarters. No page states their prerequisites, so the bands follow the order (t1, t2, t3). If the Mechanized Regiment HQ needs only the Command HQ, a strict reading makes it t1.
   - **British:** the Platoon Command Post is mapped t1 (it seems to need only the Field HQ) and the Company Command Post t2. Check whether a Battalion Command Post exists in the final patch; I could not confirm one.
   - **Building names:** the wiki writes "Special Rifle Command" on its page and "Special Rifle Company" on the faction page, and "Leichte Mechanized Kompanie" and "Leichtie Support Kompanie" for the same tier 2. The gates use the page titles.
5. **CoH3 Afrikakorps.** In the game files, the Afrikakorps buildings have no building prerequisite. The official patch notes treat the following as the faction's tiers:
   - Light Support Kompanie: tier 1.
   - Fire Support Elements (an upgrade there) or the Mechanized Kompanie: the middle step (2.3.0 and Hot Fix 1.9.1).
   - Panzerarmee Kommand: the end-game structure (2.2.0) or "final tech structure" (2.3.0).

   The map follows the patch notes. If the Mechanized Kompanie can be built straight away, a strict reading makes it t1.
6. **Flavour.** All of these are judgement calls:
   - **Given:** Soviet Union (CoH2), USSR (WiC), REDFOR and its nations (Wargame) and Russia (Broken Arrow) get soviet: massed armour and infantry, heavy tanks, rocket artillery. The US armies, the British armies, NATO and BLUFOR get allied: air power, adaptable kit and precision. They are the real "Allies".
   - **Weakest fit:** the WWII British, whose kit is emplacements, artillery and trucks. Drop them if "clearly" should be stricter.
   - **Left out:** the German factions (Wehrmacht, Panzer Elite, Ostheer, OKW, DAK) fit none.
7. **Wargame factions.** BLUFOR and REDFOR are factions. The eight nations of European Escalation are subfactions: US, UK, France and West Germany under `blufor`, and the Soviet Union, East Germany, Poland and Czechoslovakia under `redfor`.
   - The other nations have no id yet: AirLand Battle's Canada, Denmark, Norway and Sweden; Red Dragon's China, North Korea, Japan, South Korea and ANZAC; and the DLC nations.
   - Record their units under the coalition, or ask for a nation id first. Many vehicles serve several nations, and they also go under the coalition.
   - No `introduced_in` is used, because the series entry has no expansions.
8. **Broken Arrow specialisations** (Armored, Marines, Airborne, Stryker, SOF, Baltic Battalion; Guard Tank, Mechanized, Motorized, Naval Infantry, VDV, Russian Guard) are deck themes, not factions. A unit can sit in several of them, so units go under `us` or `russia`; name the specialisation in the unit's notes. Baltic Battalion (US side, free) and Russian Guard are listed as expansions for `introduced_in`.

## Prices

- **CoH weighting.** One price = manpower + 3 × fuel. This is our convention, the same weight r3 chose for Iron Harvest (iron + 3 × oil), so the r4 and r3 resource-weighted games stay comparable.
  - The CoH2 wiki's income figures point to fuel being even scarcer: +300 manpower per minute, against fuel at +3 base, +3 per standard point and +7 per fuel point.
  - A higher weight would push every infantry squad and light vehicle into "very low".
  - The weight mostly moves basic infantry between "very low" and "low". Panthers stay "high" and Tigers "very high" for any weight from 2 to 4.
  - Munitions are rarely part of a unit price; count them like fuel.
- **CoH1** (anchor about 650; thresholds 325, 585, 910, 1,300):
  - Very low: Riflemen 270.
  - Low: Infantry Section 450, M8 armoured car 370, Marder III 420.
  - Medium: Panzer IV Infantry Support Tank 600, Sherman 690.
  - High: Panther 930.
- **CoH2** (anchor about 660; thresholds 330, 595, 925, 1,320). The wiki's prices mix patches: the T-34/76 is 300/90 on its own page and 300/80 on the building page. Final-patch prices may differ by 10-20%. That rarely changes a band, but record the patch a price comes from.
- **CoH3** (anchor about 585; thresholds 295, 525, 820, 1,170):
  - Very low: Riflemen 270.
  - Low: Chaffee 450, Crusader II 510.
  - Medium: Sherman 610, Matilda II 630, Churchill IV 730.
  - High: Panther 825.
  - Very high: Tiger, King Tiger and Pershing 1,320.

  Since patch 2.2.0, the generalist heavy tanks (Tiger, Pershing, Black Prince, King Tiger) cost 20% less once the end-game structure stands; use the undiscounted price.
- **World in Conflict** (anchor 1,200; thresholds 600, 1,080, 1,680, 2,400). Prices depend on the player's role. Use the cheapest, the unit's own role.
  - Very low: Sniper 500.
  - Low: Infantry squad 650, Anti-tank squad 800, M60A3 800.
  - Medium: heavy tanks 1,200.

  I did not find a cited page saying that points come back when units die, though that is how WiC is usually described. Check it before writing "pool" mechanics into notes.
- **Wargame** (anchor about 120; thresholds 60, 110, 170, 240):
  - Very low: Motostrelki 10, T-72 45.
  - Low: T-80B 80.
  - Medium: M1A1 115, Leopard 2A4 130, T-80U 150.

  Prices changed between titles (T-80B: 105 in European Escalation, 100 in AirLand Battle, 80 in Red Dragon); use Red Dragon. Do not mix in deck activation points or availability.
- **Broken Arrow** (anchor about 225; thresholds 115, 205, 315, 450):
  - Very low: rifle squads 60.
  - Low: the T-72B (130) and the T-72B3 (180).
  - Medium: M1A2 215, T-90M 250, Leopard 2A8 260, SEP v3 280.
  - High: T-14 Armata 390.

  "Very high" may stay empty: even bombers and Iskander are 200-275. BattleGroup and the patch notes disagree in places. For example, BattleGroup lists the BMPT Terminator at 160, while the patch notes take it from 160 to 190 and later cut it by 15. Cross-check prices against the latest Steam patch notes, and record the base price without upgrades.

## Speeds

- **CoH1:** ratio = speed / 3 (m/s). Sherman 5.5 (1.83, fast), Panther 5.2, Panzer IV 5.
- **CoH2:** ratio = speed / 3. T-34/76 6.5 (2.17, fast), Panzer IV 6.3, Cromwell 7. These are wiki infobox values from several patches.
- **CoH3:** ratio = speed / 3.6. Sherman 5.5 (1.53, fast), Panzer IV 5.25 (1.46, medium), Tiger 3.8 (1.06, medium), King Tiger 3.25 (0.9, slow), Chaffee 6.9 (1.92, fast).
- **World in Conflict:** the wiki gives only a word plus a 0-100 score; ratio = score / 20. M60A3 40 (2.0, fast). Where a page shows only the word, follow Speed bands: the word goes in notes (the reference infantry is itself Slow), the band is judged from units that have a score, with an uncertain entry for mobility/speed, and `speed_raw` stays out.
- **Wargame:** ratio = off-road speed / 20. M1A1 65 (3.25, very fast), T-72 60 (3.0). Every vehicle is "very fast" against foot infantry, so say in the notes how it compares with other vehicles.
- **Broken Arrow:** ratio = speed / 18. Main battle tanks at 70 km/h give 3.9 (very fast). The same caveat as Wargame applies.

## Damage and armour maps

- **CoH3 damage:** the game data labels each weapon "small arms", "ballistic weapon", "explosive weapon" or "flame throwers", as coh3stats shows.
- **Wargame damage:** the weapon traits on the wiki's Weapons page: KE and HEAT map to armour-piercing, HE to explosive, NPLM to fire. Bullets carry no trait; record them as kinetic.
- **No armour maps.**
  - CoH3's "armour critical blueprint" is a critical-hit table, not a toughness class: the Hellcat and the Brummbär both use "heavy tank", and the Marder III uses "light tank".
  - CoH1 and CoH2 use per-unit armour numbers, and the CoH1 infobox labels (Medium, Heavy) are not used consistently.
  - WiC, Wargame and Broken Arrow use numbers.

  Set the armour class per unit with the armour-class order. Medium and heavy tanks, the Tiger and King Tiger included, are heavy; light tanks and armoured cars are medium. A tank is super-heavy only by check A.
- **No damage maps for CoH1, CoH2, WiC or Broken Arrow.** Their weapons have penetration values, not named types. Broken Arrow's KE and HEAT columns describe armour, and rifles also deal KE.

## Game-wide mechanics

Mechanics that belong to the game, not the unit (see Shared mechanics and universal keys in the Conventions). Leave them off every unit's weapons and abilities. A unit that does one of them better or worse than the rest says so in its strengths or weaknesses.

### Company of Heroes (`coh1`)

Written for pilot round 1, from the Company of Heroes Wiki's Infantry, Weapon Team and Veterancy pages.

Retreat (retreat-to-base); reinforce (reinforce-squad); veterancy (earn-veterancy); re-crewing abandoned team weapons (recover-wreck); picking up dropped weapons (leech-weapon-on-kill); garrison (carry-passengers); point capture (a game-mode rule, no pattern; a unit that captures faster says so in strengths). Who has each:

- **Retreat** (retreat-to-base): every infantry squad can retreat to its headquarters. The wiki says vehicles and weapon teams normally lack it.
- **Reinforce** (reinforce-squad): infantry squads and most weapon teams, near a base building, a reinforcing vehicle such as the M3 Halftrack, or another reinforcement point. One-man units (the Sniper, officers), some fixed weapon teams and all vehicles cannot.
- **Veterancy** (earn-veterancy): each side gets it in its own way. American units earn it from their own kills. Panzer Elite units earn it, share part of each kill with units nearby, and the player picks an offensive or a defensive bonus at each level. The Wehrmacht buys it at the Kampfkraft Center for whole groups (infantry, support, vehicles, tanks), a side-wide upgrade; the King Tiger and the Goliath never get it. Most British units get none: the Lieutenant, the Captain and the Cromwell Command Tank earn it and pass bonuses to units near them, an aura recorded on those three units.
- **Re-crewing abandoned team weapons** (recover-wreck): most infantry squads can take over a team weapon whose crew is gone; part of the squad becomes the new weapon team. Only infantry can.
- **Picking up dropped weapons** (leech-weapon-on-kill): most infantry squads can pick up special weapons left on the ground. Most basic weapons (rifles, pistols, submachine guns) are never dropped. Only infantry can.
- **Garrison** (carry-passengers, recorded on the building or transport, not on the riders; a vehicle whose riders fire out of it links passenger-sets-weapon instead, as Paired entries says): every infantry squad can enter neutral or friendly buildings and infantry transports. Vehicles and weapon teams cannot.
- **Point capture** (a game-mode rule, no pattern): almost every infantry squad captures strategic points. A unit that captures faster or slower says so in strengths or weaknesses (Riflemen capture at one and a half times the usual rate, Panzer Grenadiers at three quarters). Very few vehicles or weapon teams can capture; the Jeep is one.

Company of Heroes 2 and 3, World in Conflict, Wargame and Broken Arrow have no list yet. Write one before any of their units is coded.

## Research notes for the r4 agents

- **Company of Heroes Wiki** (https://companyofheroes.fandom.com/api.php, `action=parse&prop=wikitext`). It covers all three games, but CoH2 and CoH3 pages are thin. CoH1 coverage is good: infobox fields `unit_cost`, `prereq`, `production_struc` and `speed`. CoH2 page names carry "(CoH 2)", "(CoH2)" or "(COH2)" inconsistently, so search before guessing.
- **Official role lines.** The role field in the CoH wiki infobox (for example Core Infantry) and the production text quoted on building pages are in-game text; the wiki's own prose is not.
- **CoH1:** the "American Structures" page carries a delete tag; use the individual building pages instead (Barracks, Motor Pool, Supply Yard and so on). The Changelog page has the 2.602 notes. The Definitive Edition (Relic, due early 2027) may change balance.
- **CoH2:**
  - Prices and speeds on the wiki often predate the final patch.
  - coh2stats.com has every commander with command-point costs (data from 10 September 2021).
  - coh2.serealia.ca has data-mined weapon stats for patch 4.0.0.24250, but its data cannot be read outside its page.
  - coh2.org guides are mostly from 2013-2015.
- **CoH3:**
  - coh3stats.com is the best source: per-unit pages with cost (build time, manpower, fuel, population), speed, armour values, weapons and abilities at patch 2.5.6. URLs follow `/explorer/races/<american|german|british|dak>/units/<id>`; the race pages list buildings and battlegroups.
  - The official patch notes are on Steam; the text is easiest to read through `api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1677280`.
  - The British units carry `_africa_uk` ids.
- **World in Conflict:** WICapedia (https://worldinconflict.fandom.com/api.php). Infobox fields: `infcost`, `armcost`, `aircost`, `supcost`, `speed`, `armor` and the off/def abilities. Soviet Assault added a campaign and maps, not multiplayer units, so `introduced_in` is rarely needed. Tactical aids (airstrikes and the like) are not units. Record them only as patterns.
- **Wargame Wiki** (https://wargame.fandom.com/api.php). Each page has one unit box per title inside `{{Gamebuttons/WEE|WAB|WRD}}` blocks: read the WRD block. Fields: `cost`, `speed`, `roadspeed`, `front`/`side`/`rear`/`top` armour, `year`, `prototype` and weapons with traits. Unit names repeat across nations with different prices (for example, Leopard 2A4 and Leopard 2A4 NL).
- **Broken Arrow:**
  - The fandom wiki has only about 10 articles.
  - Use https://battlegroup.website/en/units/ (cost, speed, armour, weapons per unit) and Born2Battle's specialisation pages (prices and deck slots).
  - Check against the Steam patch notes (appid 1604270); several of them show prices only as images.
  - Video is acceptable at low confidence for mechanics.
- **Mechanics worth a look:**
  - Company of Heroes: retreat, weapon pickups and crewed weapons that can be recrewed, vehicle crews bailing out (CoH2 US), directional armour and engine damage, squad upgrades from weapon racks, CoH3 breaching and tank riding, the DAK halftrack call-ins.
  - World in Conflict: role-based buying, tactical aid as an off-map resource, infantry in buildings and forests.
  - Wargame: veterancy and availability per card, smoke, KE fall-off with range, morale, supply trucks and helicopters, radar and SEAD.
  - Broken Arrow: unit customisation (weapon and armour packages that raise the price), active protection systems, airdrops, drones and loitering munitions, sneak mode for recon.
