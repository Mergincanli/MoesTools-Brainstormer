> **Working notes from step 1** (filling the games registry). They explain choices and give tips for this batch's research agents. They were written before the fact-check, so where they and `data/games.json` differ, the registry wins; the fact-check fixes are listed in the step-1 pull request.

# Games registry, batch r2: notes

Entries: `cnc-td`, `cnc-ts`, `cnc3`, `renegade` in `games_r2.json`. `check_games.py` prints OK. Every cited URL was checked: the wiki pages through the MediaWiki API (they exist under exactly the cited title, with no redirect), and the EA source file returns 200.

## One thing for the orchestrator (affects other batches)

- **No faction tags on tier gates.** The validator accepts a unit's gate only if the tier_map entry has no faction or the same faction as the unit. Tagging gates with `gdi` or `nod` would reject every `shared` unit (TD and TS Minigunner/Light infantry, Engineer, Harvester, TD MRLS and Commando) and every Kane's Wrath subfaction unit (a Steel Talons Titan built at the War Factory). So none of the four entries tag gates. The gate names are still specific to one side, apart from shared names such as "War Factory", "Radar" and "Tech Center", which mean the same tier for both sides. Generals (Zero Hour generals) and any other game with subfactions will hit the same problem.
- Gate strings are bare building names, because units must copy them exactly. When a unit needs two gates, it records the higher one (for example, the TW Commando needs the Armory and the Tech Center, so it records "Tech Center").

## Hard-to-map tiers and how I decided

- **Tiberian Dawn.** The gates come from the released source code (UDATA.CPP and HOUSE.CPP) and the wiki's Tier page.
  - The Mammoth tank needs only the Repair Facility, and the Stealth tank only the Communications Center. Both are therefore **t2**, even though their wiki infoboxes say tier 3. This follows the strict gating used for the RA3 Hammer tank.
  - The Helipad needs only the Barracks or the Hand of Nod. It is mapped to **t2**, as the wiki does, because it is an extra, expensive production building rather than a basic one. A strict reading could make Orca, Apache and Chinook t1. Please confirm.
  - In multiplayer, the build level comes from the game setup (the Remastered client passes it in). Every unit that can be built in multiplayer has level 7 or lower, so at full tech the level never gates a unit and only the buildings do. I did not check what the original DOS lobby defaulted to.
  - In the 2020 source, the Temple of Nod counts as the Advanced Communications Center. So the MRLS, the Commando and the MCV are both sides' units ("shared") at t3.
  - The Remastered balance patch made the APC need the Repair Facility. Under the original rules the APC is t1 (Barracks); under the Remastered rules it would be t2. The entry describes the original rules.
- **Tiberian Sun.** The wiki's war factory pages list production by tier, together with each requirement. Besides Radar (t2), the two Tech Centers and the Upgrade Center or Temple of Nod (t3), there are special gates:
  - Electromagnetic Pulse Cannon (t2, for the Mobile EMP)
  - Stealth Generator (t3, for the Mobile Stealth Generator)
  - Tiberium Waste Facility (t3, for the Weed Eater)
  - Helipad (t2; it needs Radar)

  The wiki contradicts itself on the Fist of Nod. The war factory page says it needs the Upgrade Center (a GDI building); the Temple page says the Temple. Check this.
- **Tiberium Wars / Kane's Wrath.** The wiki's "tier 4" buildings (Signal Transmitter) and the epic-unit buildings (Reclamator Hub, Redeemer Engineering Facility, Warp Chasm) all map to t3. The Armory, Secret Shrine and Stasis Chamber need only a basic production building, but the units they unlock are listed as tier 2 and count one extra building, so they are t2. Aircraft buildings (Airfield, Air Tower, Gravity Stabilizer) need the t2 building, so they are t2.
- **Renegade.** `has_tiers: false`. Characters are grouped by price (free, class 1, class 2, hero), and everything is buyable from the start. Losing the Barracks or factory removes purchases, but that is loss, not tech gating. The cost bands carry the progression.

## Prices

- **TD and Renegade:** the anchor is 700, the mean of the GDI Medium Tank (800) and the Nod Light Tank (600). The Light Tank therefore falls in "low", and the Mammoth (1,500) in "very high".
- **TS:** the anchor is 800 (Titan and Tick tank).
- **TW:** the anchor is 1,100 (the Predator). The mean of the three main battle tanks is about the same: Scorpion 700, Devourer 1,600, the latter needing the Nerve Center. Thresholds are rounded to the nearest 50. The Devourer's 1,600 comes from the wiki only; I did not cross-check it.
- **Renegade price errors on the wiki:**
  - The Airstrip page swaps the Light Tank and Flame Tank prices, and the Apache and Transport helicopter prices. The unit pages give Light 600, Flame 800 and Apache 900.
  - The Transport helicopter is 700 on the Weapons factory page but 900 on its own page.
  - The Barracks page lists the Grenadier as free but says in its text that the Rocket Soldier stays free.
- Free Renegade characters: record `raw` 0, which gives "very low".

## Speeds

- **TD:** the source and the wiki agree: Minigunner 8, Medium Tank 18.
- **TS:** Light infantry 5 comes from the wiki infobox only. I could not reach a copy of rules.ini to check it.
- **TW:** patch 1.05 made all infantry about 20% faster, and the infoboxes may mix values from before and after it. The Rifleman squad is 57 and the Militant squad 43, which looks inconsistent. Compare only values the page ties to one version, and lower confidence otherwise.
- **Renegade:** no source gives speeds as numbers. The archived renegadewiki.com, linked from the unit pages, could not be reached from here.

## Damage and armour maps

- **TW:** lasers (Avatar, Obelisk, Tripod), the Shatterer's sonic beam and the Devourer's shot are all of type "Cannon", and flamethrowers are "Grenade". The map gives the defaults; type each weapon by what it is (energy, sonic, fire).
- **TS:** the warhead names are rules.ini names shown in the infoboxes. RailShot and RailShot2 are mapped to armour-piercing as a judgement call. Warheads I could not match to a clear meaning were left out: Super (the Obelisk), TankOGas, Organic, Shard, Slimer, RPG and Fire2.
- **Renegade:** "Steel" is left out. It covers both bullets (chaingun, ramjet) and explosives (rockets, grenades), and the guide's multipliers make it look anti-infantry. The armour map uses the strategy guide's categories. Unit infoboxes show internal names instead (SkinFlesh, CNCVehicleHeavy), and the Light Tank counts as a heavy vehicle.
- **No armour_map for TD, TS or TW.** Their categories cut across our classes:
  - TD's Steel covers the Light tank, APC, Orca, Apache and Mammoth.
  - TS's Light covers the Tick tank, Cyborgs and the Banshee.
  - TW gives each unit its own armour percentages.

  Set the armour class per unit from size, role and health.

## Flavour affinity (a proposal, not a sourced fact)

- **Given:**
  - Steel Talons: soviet (walkers and firepower).
  - Black Hand: soviet (flame weapons, heavy infantry, no stealth).
  - Traveler-59: empire (speed and mind control). This one is the weakest fit.
- **Left out because they are mixed:**
  - GDI: heavy armour, but also air power, sonic weapons and railguns.
  - Nod: stealth and lasers, but also speed, flame and fanatics.
  - Scrin, ZOCOM and Marked of Kane.
  - Reaper-17: heavy armour, but Scrin shields are on the Soviet avoid list.

## Notes for the r2 research agents

- **Wiki access.** Use the Command & Conquer Wiki through its API (`action=parse&prop=wikitext`). Useful infobox fields are `tier`, `cost`, `landspeed`, `req`, `armortype`, and `groundattack` with the damage type in brackets.
- **Factory pages.** For TS and TW, the war factory, barracks and air building pages list production by tier, with requirements and subfaction availability ("(Steel Talons only)").
- **TD source code.** For exact TD values, EA's source release (electronicarts/CnC_Remastered_Collection, folder TIBERIANDAWN: UDATA, IDATA, AADATA, BDATA, CONST, HOUSE) is official. Download it from raw.githubusercontent.com; github.com pages are blocked here. Ownership flags show multiplayer availability. For example, in this source the SSM launcher is Nod campaign-only, while the Covert Operations page calls it multiplayer-only. Check before using it.
- **TD wiki tier labels.** These sometimes disagree with the gates (Mammoth, Stealth tank). Take the band from the tier_map and mention the wiki label in the basis.
- **Covert Operations.** It adds missions and maps only. The dinosaurs belong to a hidden mode; skip them or mark them atypical.
- **Kane's Wrath.** Patch 1.02 changed several costs and upgrades. Check each unit's changelog section.
- **Citing.** Cite the resolved page title, not the redirect. For example, 'Medium Tank (Tiberian Dawn)' has a capital T, and 'Radar station' redirects to 'Radar (Tiberian Sun)'.
- **Extra pages for unit-level gates and prices** (not cited in the registry because of the four-source limit):
  - Helipad (Tiberian Sun)
  - GDI war factory (Tiberian Sun)
  - Barracks (Tiberium Wars), Hand of Nod (Tiberium Wars), Portal
  - Airfield (Tiberium Wars), Air tower, Gravity stabilizer
  - Damage Calculation (Tiberian Dawn), for the TD damage names
  - Cyborg (Tiberian Sun), which lists most TS warhead names
