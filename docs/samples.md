<!-- Generated from the JSON in data/ and schemas/. Edit the JSON, not this file. -->

# Sample entries (v1.1.0, approved)

The three source units and three mechanic patterns the brief asks for, fully filled in, plus one hand-made concept card showing what the generator will produce. Rendered from `data/units/ra3.json`, `data/patterns/infest-vehicle.json`, `data/patterns/leech-weapon-on-kill.json`, `data/patterns/passenger-sets-weapon.json` and `docs/examples/concept-card.example.json`; the page shows only these samples (listed in `scripts/build-docs.mjs`), not the whole database. Real unit and weapon names are reference only.

**How to read it.** *(proposal)* marks our design suggestions for the player version, not sourced facts. The tag in square brackets after each strength, weakness or counter is the coded link the generator uses. 'Review: unchecked' means the research run's sampling checker hasn't signed the record yet; this draft's fact-check is summarised in the pull request.

Contents: [Terror Drone](#ra3-soviet-terror-drone) · [Hammer Tank](#ra3-soviet-hammer-tank) · [Multigunner IFV](#ra3-allied-multigunner-ifv) · [Infest a vehicle](#infest-vehicle) · [Leech the weapon of what you destroy](#leech-weapon-on-kill) · [A weapon that changes with the passenger](#passenger-sets-weapon) · [Example concept card](#example-card)

## Source units

<a id="ra3-soviet-terror-drone"></a>
### Terror Drone (`ra3.soviet.terror-drone`)

> A small, disposable robot that hides inside the enemy's own tank: once it's in, ordinary fire can't reach it, so the enemy has to cure the host.

| Field | Value |
|---|---|
| Game / faction | Command & Conquer: Red Alert 3, Soviet Union |
| Flavour affinity | Soviets |
| Class · nature · availability | Drone / support · Uncrewed machine · Open |
| Role | Anti-armour; secondary: Scout / recon, Disabler / control |
| Tier | T1 (gate: War Factory): Built at the War Factory with no further tech; the wiki lists it as tier 1. |
| Cost band | Low: A little over half the price of a main battle tank. |
| Mobility | Many legs; handling: strafe *(proposal)*; traits: Amphibious; speed: very fast. One of the fastest ground units in the game. It crosses water and can even reach submerged submarines. Its handling is strafe rather than the pivot default for many legs, because it is a small unit on legs (handling tie-break, reason 1). |
| Body | Spider frame, small. A spider-like robot that the sources call small or diminutive. Although it comes from the vehicle factory, the game handles it like infantry: it fills an infantry seat in troop transports, so it is coded small. It heals only at a captured hospital or dry dock or at top veterancy, not from an engineer's medical tent or from repair drones. |
| Armour | Light; model: Single health bar. Very little health. Machine guns and snipers hurt it badly and electric weapons do many times normal damage; melee animals and radiation can't hurt it. Step 4 of the armour-class order decided: its armour set has no plain armour word, and drones are light. |
| Sensors | Short sight; traits: none (in-game). The wiki gives one sight figure, half the Conscript's vision figure that the registry compares single figures with, so short. Patch 1.11 lengthened its view in stasis ray mode. |
| Crew | Solo (proposal). One player is the drone. While it is inside a host, the camera rides along with the host. |
| On death | Respawn (proposal) |
| Confidence | high (review: unchecked) |

**Armament**

| Weapon | Slot | Family | Damage | Mount / delivery / range | Hits | Traits | What it does |
|---|---|---|---|---|---|---|---|
| Dismantler Claws | primary | Melee weapon | Melee | free aim / attach / melee | infantry, ground vehicles, naval | Damage over time | Closes to touching distance and strikes. Infantry die in one strike. A vehicle or ship (even a submerged one) gets the drone inside it and takes damage from within until it dies or the drone is removed. Aircraft can be infested only while landed. If its own damage destroys the host, the drone can escape (it parachutes down from an aircraft) and attack again. If anything else destroys the host first, the drone dies with it. *Pattern:* Infest a vehicle. |
| Electro-Stasis Ray | alternate | EMP | EMP | free aim / beam / long | ground vehicles, naval | Root / pin | A long-range beam that pins a vehicle in place: it can't move, transform or deploy, but its guns still work. One documented exception, the Allied aircraft carrier, is shut down completely. *When:* In stasis mode, switched with the mode toggle. *Pattern:* Switch weapon mode, Disable a machine. |

**Abilities**

- **Electro-Stasis Ray / Dismantler Claws** (toggle / mode switch): Swaps between the claws and the stasis ray. It uses one at a time, so pinning and infesting the same target takes two drones. *Pattern:* Switch weapon mode, Disable a machine.

**Strengths**

- One of the fastest ground units, so it scouts well and reaches vehicles quickly. *[Very fast (speed)]*
- Can't be shot normally once inside a vehicle; the enemy must repair or teleport the host, use one of a few special attacks, or lose it. *[Attach (delivery)]*
- Kills infantry in one strike, even elite commandos who aren't shooting at it. *[can hit infantry]*
- Crosses water and reaches even submerged submarines. *[Amphibious (trait)]*
- The stasis ray outranges most guns. *[Long (range)]*
- Cheap and quick to build, so losing one costs little. *[Low (cost)]*

**Weaknesses**

- Very little health: machine guns, snipers and electric weapons destroy it quickly. *[Light (armour)]*
- The claws need touching distance, so it is exposed on the approach and can't reach aircraft. *[Melee (range)]*
- One mode at a time, and the ray stops movement but not the target's guns. *[Switch weapon mode (pattern)]*
- Dies with the host if someone else destroys the vehicle first. *[Attach (delivery)]*
- Electric weapons do many times normal damage, and normal repair can't heal it. *[Uncrewed machine (nature)]*

**Countered by**

- Neither weapon can hit aircraft in the air; it survives only by staying away from them or hiding inside an enemy vehicle or a friendly Bullfrog transport. *[Aircraft (class)]*
- Machine-gun and autocannon fire does extra damage to it, so anti-infantry escorts shred approaching drones. *[Machine gun (weapon)]*
- Electric weapons do many times normal damage to it. *[Electric (damage)]*
- Repair drones, Multigunners carrying an engineer, and repair stations such as the Crusher Crane, Mecha Bay or War Factory strip an infesting drone out of the host. *[Repair tool (weapon)]*
- Snipers pick it off from range, and some can clear an infested vehicle. *[Sniper (weapon)]*

**Counters**

- Vehicles, especially unarmed ones such as ore collectors and construction vehicles, die to an infesting drone unless they reach repairs or other help in time. *[Tank / ground vehicle (class)]*
- Kills infantry in one strike if they don't shoot it first. *[Infantry (class)]*
- Infestation and the stasis ray stop a unit transforming or deploying, trapping it in its current form. *[Transform (trait)]*

**Notable combos**

- A second drone, or any teammate with a pin, holds the vehicle still so this one can jump in. *[Root / pin (weapon trait)]*
- A Twinblade helicopter or Bullfrog transport carries several drones at once, giving them extra mobility. *[Transport (role)]*
- Drones hold enemy vehicles in place while heavier teammates destroy them. *[Frontline assault (role)]*

**As a player** *(proposal)***:** A cheap, very fast and fragile T1 pick: drawn small and low, with a soldier-sized hitbox outlined in team colour so it can be hit from above. Dive a vehicle to ride inside and chew it up, or hang back and pin it for your team. Aircraft, machine guns and electric weapons are its nightmare.

**Less certain**

- *Electro-Stasis Ray:* No source gives the stasis ray's exact range or duration; a patch note implies the drone keeps the beam on the target rather than firing once.
- *Electro-Stasis Ray, range:* No source gives the ray's reach. It is long by the profile's words (it outranges most other weapons). The drone's single sight figure is shorter than any long reach would be, but a reach known only from words counts as passing the sight only when a source says so, and none does, so the ray stays long rather than off-screen. Patch 1.11 lengthened the drone's view in stasis ray mode.
- *Countered by:* The official profile says only repair crews at facilities can remove an infesting drone; the main wiki lists many more ways (repair drones, teleporting the host, several special attacks). The entry follows the wiki. (sources disagree)
- *Dismantler Claws, damage:* Game data gives the claws explosive-type damage against vehicles and a sniper-type hit against infantry big enough to kill even a commando at once; 'melee' is used only because the blades family requires it.
- *Body size:* Sources call it small or diminutive and no source compares it with a soldier; it is coded small because it fills a soldier's seat in transports.
- *Sensors sight:* The infobox's sight figure has no label, while the Hammer tank's page splits vision from fog clearing, so it isn't clear which one this is, or whether it predates patch 1.11.

**Where no word-list term fitted**

- *Dismantler Claws, damage* (used melee; wanted explosive (against vehicles) or kinetic (against infantry)): Game data gives the claws explosive-type damage against vehicles and sniper-type damage against infantry, which maps to kinetic. The blades family allows only melee, electric or energy damage, so a player version may want explosive or kinetic.
- *Electro-Stasis Ray, damage* (used emp): The beam only immobilises: the target can't move, transform or deploy, but its weapons keep working (the Allied aircraft carrier is the one exception). The emp damage type stands for a full shutdown.

**Sources**

- [Terror drone (Red Alert 3), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Terror_drone_(Red_Alert_3)) (wiki, read 2026-10-17)
- [Terror drone official profile (transcribed), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Terror_drone_(Red_Alert_3)/Profile) (wiki, read 2026-10-17) - Transcribes EA's official unit profile; the original page is offline.
- [Red Alert 3: Soviet units, StrategyWiki](https://strategywiki.org/wiki/Command_%26_Conquer:_Red_Alert_3/Soviet_units) (wiki, read 2026-10-17)

<a id="ra3-soviet-hammer-tank"></a>
### Hammer Tank (`ra3.soviet.hammer-tank`)

> A main battle tank that loots: the first weapon it takes from a vehicle dying in its beam is its one-time loadout choice, since it holds only one stolen gun and can't swap it.

| Field | Value |
|---|---|
| Game / faction | Command & Conquer: Red Alert 3, Soviet Union |
| Flavour affinity | Soviets |
| Class · nature · availability | Tank / ground vehicle · Crewed machine · Open |
| Role | Anti-armour; secondary: Frontline assault |
| Tier | T2 (gate: Super Reactor): The Hammer tank page's infobox lists it as tier 2; it needs a Super Reactor. |
| Cost band | Medium: The Hammer tank page's price falls in our medium band for RA3; with the Mass Production upgrade it drops to the low band. |
| Mobility | Tracks; handling: pivot (tank controls) *(proposal)*; traits: Crush; speed: medium. Slower than the Allied main battle tank and not amphibious. Heavy enough to run over infantry, but crushing is a fallback, not a plan. |
| Body | Hull with turret, large.  |
| Armour | Heavy; model: Directional armour. The toughest of the three factions' main battle tanks. Machine-gun fire does much less damage to it. Facing matters only mildly: side and rear hits do slightly more (game data on the wiki). Step 3 of the armour-class order decided: its armour set name is not a plain armour word, and the game's cost anchor averages its price with the other two main battle tanks, so heavy. |
| Sensors | Medium sight; traits: none (in-game). The wiki gives a vision figure and a fog-clearing figure more than twice as large. As the registry says, the fog-clearing figure counts; it equals the Conscript's, so medium. Patch 1.11 lengthened its view in leech mode. |
| Crew | Solo (proposal). One player drives, fires the cannon and holds the beam. A two-seat version could give the beam and the stolen weapon to a second player. |
| On death | Bail out (proposal). A Soviet protocol the player can pick can make destroyed Soviet vehicles release a Terror Drone; that is a faction power, not this unit's own outcome. |
| Confidence | high (review: unchecked) |

**Armament**

| Weapon | Slot | Family | Damage | Mount / delivery / range | Hits | Traits | What it does |
|---|---|---|---|---|---|---|---|
| 85 mm cannon | primary | Cannon | Armour-piercing | slow turret / projectile / medium | infantry, ground vehicles, structures, naval | - | A fast-firing anti-vehicle gun. Poor against infantry and unable to hit aircraft. |
| Leech Beam | alternate | Drain beam | Energy | slow turret / beam / long | ground vehicles, naval, structures | Heals on hit | Reaches about twice as far as the cannon. Deals modest damage that ignores armour type, and repairs the tank while it stays on target. A vehicle that dies in the beam can hand over its weapon if the tank has none yet. *When:* In leech mode. Since patch 1.11 the tank must stand still to use it. *Pattern:* Switch weapon mode, Leech the weapon of what you destroy. |
| Auxiliary weapon port | acquired | Adaptive | - | from the kill | from the kill | - | Empty when built. Holds one weapon taken from the dead vehicle, such as anti-air flak, an anti-infantry gun, a tesla coil or artillery. It fires alongside the cannon, one weapon at a time, and is silent in leech mode; a Sky Knight drone taken from an aircraft carrier is the one exception; a Multigunner IFV gives anti-air rockets whoever rides inside. *When:* Filled once, by a vehicle that dies in the leech beam; can't be swapped. It is kept for the life of the tank, except that losing a Sky Knight drone taken from an aircraft carrier frees the slot in the base game (not in Uprising). *Pattern:* Leech the weapon of what you destroy. |

**Abilities**

- **Leech Beam (mode switch)** (toggle / mode switch): Switches between the cannon and the leech beam. Leeching kills more slowly than the cannon; it is a choice to heal or to loot, not to deal more damage. *Pattern:* Switch weapon mode, Leech the weapon of what you destroy.
- **Weapon salvage** (triggered): When a vehicle dies while held in the beam, whoever lands the kill, a tank with an empty port mounts that vehicle's weapon and can't swap it later. It works on friendly vehicles with force-fire. Structures give nothing, and neither do a few vehicles, among them the Grinder, the Mortar Cycle and some ships and submarines. *Pattern:* Leech the weapon of what you destroy.

**Strengths**

- Its armour is rated the heaviest among main battle tanks, which makes it the toughest of the three; beats the Allied and Imperial tanks one-on-one. *[Heavy (armour)]*
- Heals itself mid-fight with the beam, so a damaged tank can step behind the line and leech at range to recover instead of leaving the battle. *[Heals on hit (weapon trait)]*
- A stolen weapon can cover its own gaps, such as anti-air or anti-infantry, or add a big-unit gun. *[Adaptive (weapon)]*
- The beam outranges basic defences such as small turrets. *[Long (range)]*
- Runs over infantry caught in the open. *[Crush (trait)]*

**Weaknesses**

- Its cannon can't hit aircraft and is poor against infantry; without a stolen weapon it has no answer to air. *[Cannon (weapon)]*
- While leeching it stands still, kills slowly and its stolen weapon goes quiet (a stolen Sky Knight drone is the one exception). The player version slows it heavily instead of rooting it. *[Beam (delivery)]*
- A stolen weapon can't be swapped, so a poor first steal can't be undone. *[Adaptive (weapon)]*
- Needs a Super Reactor built first. *[T2 (tier)]*
- Slower than the Allied tank and can't cross water. *[Medium (speed)]*

**Countered by**

- Bombers and gunships hit it freely when it has no stolen anti-air weapon. *[Aircraft (class)]*
- The official notes call anti-tank infantry a real threat, since its cannon is poor against small targets. *[Anti-armour (role)]*
- Infesting drones ride inside it, where its weapons can't reach them, or pin it with a ray. *[Infest a vehicle (pattern)]*
- The beam can't target the drone. As the drone's own entry describes, it can ride inside the tank, where it can't be shot, or pin the tank in place with its ray. *[Terror Drone]*

**Counters**

- Beats the other factions' main battle tanks one-on-one thanks to heavier armour and steady damage. *[Tank / ground vehicle (class)]*
- The beam outranges basic defences such as small turrets. *[is a target of type structures]*

**Notable combos**

- The official notes pair it with an anti-infantry walker to cover its blind spot. *[Anti-infantry (role)]*
- An anti-air escort, or leeching a friendly anti-air vehicle on purpose, covers its weakness to aircraft. *[Anti-air (role)]*
- Teammates soften a big enemy vehicle while the tank holds the beam on it; the tank still gets the weapon if someone else lands the kill. *[Frontline assault (role)]*

**As a player** *(proposal)***:** A mid-tier brawler with a cannon on left mouse. The turret turns slowly, so a close flanker can get round it. Hold Q for a long tether that heals you while it holds; while tethering you are heavily slowed but not rooted, your turret stays locked on the target and the cannon is silent. Tether what your team is already killing: if it dies in your beam, a tier-scaled copy of its gun goes on right mouse for this life.

**Less certain**

- *Auxiliary weapon port:* Sources disagree on what a few Uprising vehicles give when leeched (Pacifier, Reaper). (sources disagree)
- *Leech Beam, targets:* No source states outright that the beam can't target infantry; it is described as working on ground vehicles, ships (submarines only when surfaced) and buildings.
- *85 mm cannon, targets:* The sources call the cannon an anti-vehicle weapon and say it is poor against infantry, so can_target step 3 lists ground vehicles and infantry. The infobox's ground attack line names the cannon, which counts as the sources saying it damages buildings, so structures are listed.
- *85 mm cannon, delivery:* Taken from the cannon family default; no source describes the shell's travel.
- *Leech Beam, damage:* The game classes the beam's damage as 'Magic', which ignores armour: every armour type takes it in full. 'energy' is our approximation, and the only damage type the drain family allows.
- *On death:* The protocol's effect comes from the Terror drone (Red Alert 3) page of the Command & Conquer Wiki, which says the Terror Drone Surprise protocol can make a destroyed Soviet vehicle release a drone; the Hammer page only names Terror Drone Surprise, as an upgrade.

**Where no word-list term fitted**

- *Leech Beam, damage* (used energy; wanted a damage type that ignores armour): The game classes the beam's damage as 'Magic', which every armour type takes in full; the drain family allows only energy, and no damage type ignores armour.

**Sources**

- [Hammer tank, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Hammer_tank) (wiki, read 2026-10-17)
- [Red Alert 3: Leech Beam effects, StrategyWiki](https://strategywiki.org/wiki/Command_%26_Conquer:_Red_Alert_3/Leech_Beam_Effects) (wiki, read 2026-10-17)
- [Hammer tank official profile (transcribed), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Hammer_tank/Profile) (wiki, read 2026-10-17) - Transcribes EA's official unit profile; the original page is offline.

<a id="ra3-allied-multigunner-ifv"></a>
### Multigunner IFV (`ra3.allied.multigunner-ifv`)

> A cheap, fast car whose gun is whoever sits in it: the soldier you load decides whether it hunts aircraft, snipes infantry, kills tanks or repairs them.

| Field | Value |
|---|---|
| Game / faction | Command & Conquer: Red Alert 3, Allied Nations |
| Flavour affinity | Allies |
| Class · nature · availability | Tank / ground vehicle · Crewed machine · Open |
| Role | Anti-air; secondary: Raider / flanker, Marksman / overwatch |
| Tier | T1 (gate: Armor Facility): Built at the Allied Armor Facility with no further tech; the wiki lists it as tier 1. |
| Cost band | Low: The wiki's price from patch 1.08 on falls in our low band for RA3; before that patch it sat in the medium band, and an early beta priced it lower still. |
| Mobility | Wheels; handling: steer *(proposal)*; traits: none; speed: fast. Outruns most ground vehicles. Not amphibious, and it can't crush infantry. |
| Body | Troop carrier, medium. No rotating turret: in the game the whole car turns to aim (its Red Alert 2 ancestor had a turret). The wiki calls it an up-armoured dune buggy, the official profile an armoured car; its size is inferred from that, as no source gives dimensions. Most passenger types show their own roof weapon model (the wiki's gallery shows each version). The player version adds a free-aiming roof turret for the passenger only (see crew notes). |
| Armour | Light; model: Single health bar. Light armour (the wiki calls it very light); it trades armour for speed. Step 2 of the armour-class order decided: the wiki's infobox gives the armour word Light. |
| Sensors | Medium sight; traits: none (proposal). No cited page gives a vision range, so the sight is the medium proposal. The source gives it no radar; a player version could add a warning against aircraft. |
| Crew | Solo (proposal); 1 passenger seat (sets the weapon). One driver and one infantry passenger; the single passenger seat is in-game. Proposal for a player version: the passenger's class sets the roof weapon, and the passenger fires it from a small roof turret that aims freely while the driver steers (the official profile already describes a 'multiturret', though in the game it has no turret and the whole car turns to fire). The driver's own missiles stay fixed forward and are aimed by turning the car. |
| On death | Bail out (proposal). In the source the rider dies with the car; the player version throws both players out hurt, as bail-out says. |
| Confidence | high (review: unchecked) |

**Armament**

| Weapon | Slot | Family | Damage | Mount / delivery / range | Hits | Traits | What it does |
|---|---|---|---|---|---|---|---|
| Multipurpose missile launcher | primary | Rockets | Explosive | body aim / projectile / long | low air, high air, ground vehicles, infantry, structures, naval | Anti-air | Rapid, light missiles. Against aircraft they hit about three times as hard, and reach about twice as far, as against ground targets. Good against aircraft and light vehicles, weak against armour. *When:* Only when nobody is riding inside. |
| Repair tool (any engineer) | passenger seat (sets the weapon) | Repair tool | Repair | free aim / beam / short | ground vehicles (allies) | - | Replaces the weapon with a repair tool for friendly vehicles. It drives to nearby damaged friends on its own and removes Terror Drones from them. It can't attack. *When:* An engineer of any faction rides inside. *Pattern:* A weapon that changes with the passenger. |
| Stun bark (attack dog) | passenger seat (sets the weapon) | Sonic | Sonic | free aim / beam / long | infantry | Stun | Loudspeakers amplify the dog's bark to stun enemy infantry for a few seconds at long range. Commandos are immune. *When:* An Allied attack dog rides inside. *Pattern:* A weapon that changes with the passenger. |
| Stun roar (war bear) | passenger seat (sets the weapon) | Sonic | Sonic | free aim / beam / long | infantry | Stun | Loudspeakers amplify the bear's roar to stun enemy infantry for a few seconds at long range, over a slightly larger area than the dog version. Commandos are immune. *When:* A Soviet war bear rides inside. *Pattern:* A weapon that changes with the passenger. |
| Auto-shotgun (Peacekeeper) | passenger seat (sets the weapon) | Shotgun | Kinetic | free aim / hitscan / short | infantry, ground vehicles, structures, naval | Knockback | A close-range shotgun that knocks infantry back. *When:* An Allied Peacekeeper rides inside. *Pattern:* A weapon that changes with the passenger. |
| Missile pod (Javelin soldier) | passenger seat (sets the weapon) | Rockets | Armour-piercing | free aim / projectile / medium | ground vehicles, naval, infantry, structures | Magazine | Fires a large burst of rockets, then pauses a few seconds to reload. Lets the car take on heavier units, though the wiki says it does only half damage to tanks, King Onis, ore collectors and Assault Destroyers. *When:* An Allied Javelin soldier rides inside. *Pattern:* A weapon that changes with the passenger. |
| Sniper rifle (Spy) | passenger seat (sets the weapon) | Sniper | Kinetic | free aim / hitscan / long | infantry | - | Kills infantry in one shot and can fire on the move. Also hits terror drones, but no vehicles. *When:* An Allied Spy rides inside. *Pattern:* A weapon that changes with the passenger. |
| Anti-infantry autocannons (Tanya) | passenger seat (sets the weapon) | Small arms | Kinetic | free aim / hitscan / medium | infantry | - | The commando's own guns, mounted with identical stats: shreds groups of infantry but can attack nothing else. *When:* Tanya, the Allied commando, rides inside. *Pattern:* A weapon that changes with the passenger. |
| Cryo beam (Cryo Legionnaire) | passenger seat (sets the weapon) | Cryo | Cryo | free aim / beam / medium | infantry, ground vehicles, low air, high air, structures, naval | Anti-air, Slow, Root / pin, Silence / disarm | A single freezing beam that can also freeze aircraft, which then fall and shatter. It reaches further than the Cryo Legionnaire on foot or the Cryocopter. *When:* An Allied Cryo Legionnaire rides inside (Uprising only). *Pattern:* A weapon that changes with the passenger. |
| Gatling gun (Conscript) | passenger seat (sets the weapon) | Machine gun | Kinetic | free aim / hitscan / medium | infantry, ground vehicles, structures, naval | - | A weak gatling gun; even against infantry it is not very effective. *When:* A Soviet Conscript rides inside. *Pattern:* A weapon that changes with the passenger. |
| Flak cannon (Flak Trooper) | passenger seat (sets the weapon) | Flak | Explosive | free aim / projectile / medium | low air, high air | Anti-air | Anti-air only, a little stronger than the Soviets' own flak transport, on a fast chassis that keeps up with aircraft. *When:* A Soviet Flak Trooper rides inside. *Pattern:* A weapon that changes with the passenger. |
| Tesla gun (Tesla Trooper) | passenger seat (sets the weapon) | Tesla / electric | Electric | free aim / hitscan / medium | infantry, ground vehicles, structures, naval | - | Kills infantry in one zap and hurts vehicles and buildings. A beta patch added a pre-attack delay and lowered its overall damage output. *When:* A Soviet Tesla Trooper rides inside. *Pattern:* A weapon that changes with the passenger. |
| Radiation spray (Desolator) | passenger seat (sets the weapon) | Chemical / radiation | Toxic | free aim / projectile / medium | infantry, ground vehicles, structures, naval | Splash, Friendly fire | The Desolator's own radiation spray with identical stats, good for clearing groups of infantry. *When:* A Soviet Desolator rides inside (Uprising only). *Pattern:* A weapon that changes with the passenger. |
| Piercing sniper rifle (Natasha) | passenger seat (sets the weapon) | Sniper | Kinetic | free aim / hitscan / long | infantry | Pierce | Kills several infantry in a line, but can't fire while moving. *When:* Natasha, the Soviet commando, rides inside. *Pattern:* A weapon that changes with the passenger. |
| Infantry laser (Imperial Warrior) | passenger seat (sets the weapon) | Laser | Kinetic | free aim / beam / medium | infantry, ground vehicles, naval | - | An anti-infantry laser that is also fair against light vehicles. *When:* An Empire Imperial Warrior rides inside. *Pattern:* A weapon that changes with the passenger. |
| Anti-vehicle laser (Tankbuster) | passenger seat (sets the weapon) | Laser | Energy | free aim / beam / long | ground vehicles, infantry, structures, naval | - | A fast-firing anti-vehicle laser with a much longer reach than the soldier on foot; StrategyWiki rates the combination as highly versatile and strong. *When:* An Empire Tankbuster rides inside. *Pattern:* A weapon that changes with the passenger. |
| Shuriken launcher (Shinobi) | passenger seat (sets the weapon) | Sniper | Kinetic | free aim / projectile / long | infantry | - | Throws shuriken that deal heavy sniper-type damage to infantry, firing slightly faster than the Spy version. *When:* An Empire Shinobi rides inside. *Pattern:* A weapon that changes with the passenger. |
| Bow launcher (Archer Maiden) | passenger seat (sets the weapon) | Small arms | Kinetic | free aim / projectile / medium | low air, high air, infantry | Anti-air | Arrows that hit both aircraft and infantry, with a little more anti-air reach than on foot. *When:* An Empire Archer Maiden rides inside (Uprising only). *Pattern:* A weapon that changes with the passenger. |
| Psychokinetic blast (Yuriko Omega) | passenger seat (sets the weapon) | Psionic | Psionic | free aim / beam / medium | infantry, ground vehicles, naval | - | A mounted version of her psychic attack. The gain is mostly range, speed and protection rather than damage. *When:* Yuriko Omega, the Empire's psychic commando, rides inside. *Pattern:* A weapon that changes with the passenger. |

**Abilities**

- **Weapon changes with the passenger** (passive): Loading one infantry swaps the missiles for a vehicle-mounted version of that soldier's weapon or role: some stronger than on foot, some identical. Unloading brings the missiles back. *Pattern:* A weapon that changes with the passenger.

**Strengths**

- Outruns most ground vehicles: a cheap anti-air escort and rapid responder from the first minutes. *[Fast (speed)]*
- Empty, its missiles reach every aircraft, jets and airships included, hitting them about three times as hard as ground targets from about twice as far. *[can hit high air]*
- The same missiles, with the same extra damage and reach, work against helicopters and other low fliers. *[can hit low air]*
- Changes role mid-match by swapping the passenger: anti-air, anti-tank, anti-infantry, stun or field repair. *[1 passenger seat(s)]*
- With an engineer aboard it repairs tanks in the field and pulls infesting drones out of them. *[Repair tool (weapon)]*

**Weaknesses**

- Light armour; it trades armour for speed. *[Light (armour)]*
- Empty, its missiles deal only light damage to armour, partly offset by their high rate of fire. *[Rockets (weapon)]*
- A passenger without an anti-air weapon removes its anti-air ability, and in RA3 the passenger dies with the car: one kill for the price of two. The player version throws both players out hurt instead. *[1 passenger seat(s)]*
- Can't cross water or crush infantry, and with no turret the whole car must turn to fire; the player version keeps this only for the driver's own missiles. *[Wheels (mobility)]*

**Countered by**

- Tanks shrug off its light missiles unless an anti-armour passenger rides along. *[Heavy (armour)]*
- Carrying a passenger without an anti-air weapon replaces its missiles, so it can no longer fire back at aircraft. *[Aircraft (class)]*
- A Hammer tank shrugs off its light missiles, and leeching the car to death gives the Hammer an anti-air rocket weapon, whoever was riding inside. *[Hammer Tank]*
- An infesting drone kills it from inside unless another Multigunner carrying an engineer, repair drones or a repair station removes it. *[Infest a vehicle (pattern)]*
- An infesting Terror Drone kills it unless repair drones, an engineer-loaded Multigunner, a Chronosphere teleport or a few special attacks remove it (see the Terror Drone's entry). *[Terror Drone]*

**Counters**

- Its default missiles are built for anti-air, with extra damage and range against aircraft. *[Aircraft (class)]*
- With a sniper, commando, tesla or radiation passenger it deletes infantry while staying hard to catch. *[Infantry (class)]*
- With an engineer aboard it strips infesting drones out of friendly vehicles; with a spy it can shoot drones. *[Infest a vehicle (pattern)]*

**Notable combos**

- Engineer cars repair the main tanks in the field. *[Frontline assault (role)]*
- Ferries engineers quickly across the battlefield for sabotage runs. *[Engineer / builder (role)]*
- Most infantry types are a loadout: the team's infantry mix decides what the cars can do. *[Infantry (class)]*

**As a player** *(proposal)***:** A two-seat T1 runabout. Alone, the driver fires rapid light missiles, best against aircraft, on left mouse and aims them by turning the car. A teammate who climbs in (E) gets a small roof turret with a mounted version of their class weapon and aims it freely while you drive; your missiles stay silent until they leave or you evict them (G). If the car dies, both players are thrown out hurt.

**Less certain**

- *Roles secondary:* The official profile says the default missiles hit heavier vehicles and infantry only lightly, so anti-armour and anti-infantry are dropped, as roles.secondary asks, although many riders would give them. Marksman (the Spy, Natasha and Shinobi riders) and disabler (the dog, bear and Cryo Legionnaire riders) tie at step 5 with three riders each; marksman comes first in the roles list.
- *Armament:* Sources list Soviet and Empire soldiers as passengers but don't say how they normally end up in an Allied car (bribed soldiers, captured barracks or mixed teams).
- *Missile pod (Javelin soldier), targets:* No cited source says the Javelin version attacks aircraft, so no air layer is listed.
- *Armament:* The wiki gives figures for about half the mounted weapons (and says the Tanya, Natasha and Desolator versions match the soldiers' own weapons); this entry records only relative strength.
- *Armament:* Delivery terms for the passenger weapons are not sourced weapon by weapon: most are family defaults, while the shuriken and arrow versions are coded as projectiles from their descriptions. Ranges are family defaults where the wiki gives none.
- *Armament:* The cited pages tie only the Desolator version to the Uprising expansion; the Uprising tags on the Cryo Legionnaire and Archer Maiden versions come from those soldiers' own wiki pages.
- *Multipurpose missile launcher, delivery:* No source says whether the default missiles steer or lock on; the wiki calls them rockets, so they are coded as unguided.
- *Multipurpose missile launcher, damage:* The wiki gives no damage category for the default missiles; explosive is chosen from their light anti-vehicle and anti-air role.
- *Repair tool (any engineer), delivery:* No source says how the repair tool reaches its target (StrategyWiki calls it a passive repair tool); beam is the repair-tool family default.
- *Stun bark (attack dog), delivery:* No source describes how the stun travels; beam is the sonic family default. The main wiki says the stun covers a tiny area, while StrategyWiki says it stuns one enemy at a time. (sources disagree)
- *Stun roar (war bear), delivery:* As for the attack dog version: beam is the sonic family default, and the two wikis disagree on a tiny area versus one target at a time. (sources disagree)
- *Missile pod (Javelin soldier), summary:* The wiki's damage note for tanks and the other heavy targets is read as half damage, the way the wiki writes damage modifiers elsewhere; it gives no other context.
- *Anti-infantry autocannons (Tanya), family:* The wiki calls the mounted guns autocannons, but they copy Tanya's own pistols, so they keep her small-arms family.
- *Cryo beam (Cryo Legionnaire), targets:* Aircraft are named outright; ground targets are implied, not stated.
- *Flak cannon (Flak Trooper), range:* No source gives the flak version's range; medium is the flak family default.
- *Radiation spray (Desolator), range:* The Desolator trooper (Uprising) page on the Command & Conquer Wiki, which the IFV page says this weapon copies, gives the spray a reach of one and a half Conscript rifles; the range rests on that page.
- *Radiation spray (Desolator), traits:* The same Desolator trooper (Uprising) page gives the spray a damage radius and warns that it hurts friendly units too; the traits rest on that page.
- *Anti-vehicle laser (Tankbuster), damage:* The wiki gives no damage category for the Tankbuster version; energy is the laser family default.
- *Body plan:* Enclosed carrier or open buggy: the sources describe it both ways.
- *Armour models:* The wiki doesn't say whether side or rear hits do extra damage to it.
- *Countered by:* The Hammer tank and Terror Drone entries under 'Countered by', and the repair drones and repair stations in the infesting-drone entry, rest on those units' own cited pages (the Hammer tank page and the Terror drone page); none of this unit's three sources covers them.
- *Cryo beam (Cryo Legionnaire), traits:* Slow, root and silence rest on the Cryo page of the Command & Conquer Wiki, which describes the freeze for every cryo weapon; the IFV pages say only that the beam freezes and downs aircraft.

**Rule breaks** (kept as the game has them; our word lists would not allow them)

- *Stun bark (attack dog), traits:* The source's tier-1 IFV stuns when carrying a dog or bear; our word list keeps stun for tier 2 and up.
- *Stun roar (war bear), traits:* The source's tier-1 IFV stuns when carrying a dog or bear; our word list keeps stun for tier 2 and up.
- *Infantry laser (Imperial Warrior), family:* The wiki calls the Imperial Warrior version a laser but gives it the game's gun damage type, which maps to kinetic; our laser family allows only energy or fire damage.

**Sources**

- [Multigunner IFV, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Multigunner_IFV) (wiki, read 2026-10-17) - Its changelog says beta patch 1.3 raised the reach of the attack dog and war bear versions to twice the Conscript rifle's.
- [Red Alert 3: Multigunner IFV infantry effects, StrategyWiki](https://strategywiki.org/wiki/Command_%26_Conquer:_Red_Alert_3/Multigunner_IFV_Infantry_Effects) (wiki, read 2026-10-17)
- [Multigunner IFV official profile (transcribed), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Multigunner_IFV/Profile) (wiki, read 2026-10-17) - Transcribes EA's official unit profile; the original page is offline.

## Mechanic patterns

<a id="infest-vehicle"></a>
### Infest a vehicle (`infest-vehicle`)

*Category:* Infiltration (also Control). *Also called:* parasite, latch onto a vehicle, burrow into a vehicle. *Shooter fit:* 5/5. *Confidence:* high. *Status:* proposed (review: unchecked).

**What it does.** Usually a small, cheap, fast and fragile attacker (some examples are hero or caster units) reaches an enemy vehicle and attaches to it: it burrows inside, clings on top or welds itself underneath. Once attached it is protected (untargetable in the purest form, or just hard to hit) and keeps working on the host until it is removed or the host dies. The effect can be damage over time, a slow, a blocked ability, a tracking mark, a timed charge or brief control of the host; stealing the vehicle outright is a separate pattern, hijack a vehicle. Removal is narrow, so the latch starts a visible clock that the victim and their team must beat. The trade-off is heavy exposure on the way in for safety once attached.

**Why it suits Shamble Frontlines.** A direct player-versus-player duel with a clear tell, a reaction window and a team rescue; Titanfall's rodeo shows it already works in a shooter.

**Counterplay**

- Kill it on the approach: infesters are fragile, so anti-infantry fire and point defence stop them before they connect.
- Keep moving and avoid stalls; a pin (stasis beam or EMP) is the infester's setup tool, so dodging the pin is the first defence.
- Remove it with repair: a repair station, repair drones, a mobile repair vehicle or an engineer-crewed vehicle pulls the infester out.
- Use a self-cleanse on a cooldown, such as an electric discharge, smoke or a hold-to-shake-off input.
- Get a teammate to shoot the rider off, or to use an ability that clears the hull.
- Teleport or make the host invulnerable, which drops or suspends the infester.
- Abandon the host: hold X to bail out and deny the kill (in the RTS originals, owners even destroyed their own infested vehicle to stop a chain jump).
- Spread vehicles out so a chain jump or contagion can't spread through a group.

**Source units in the database:** Terror Drone

**Other examples found (to be entered as source units during the research run)**

- *Command & Conquer: Red Alert 2 / Yuri's Revenge*, Terror Drone (Soviets): The original: leaps inside a vehicle, can't be hit while inside, and pops out to dive the next vehicle if its own damage kills the host. One drone per vehicle; an infested construction vehicle can't deploy. Repair (a service depot, a tech outpost or an IFV carrying an engineer) is the standard way to remove it; edge cases such as the Iron Curtain or a Chrono Miner's teleport also drop it. (high; [Terror drone (Red Alert 2), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Terror_drone_(Red_Alert_2)), [Red Alert 2 Soviet units, CNCNZ](https://cncnz.com/games/red-alert-2/soviet-units/))
- *Command & Conquer: Red Alert 3*, Burst Drone (Empire): A flying scout that clings to the outside of a vehicle or aircraft, slows it and can self-destruct a few seconds later to hurt the host and its neighbours. Unlike the terror drone it can be shot off while attached, and repair drones destroy it. (high; [Burst drone, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Burst_drone), [Red Alert 3: Empire units, StrategyWiki](https://strategywiki.org/wiki/Command_%26_Conquer:_Red_Alert_3/Empire_of_the_Rising_Sun_units))
- *Command & Conquer: Tiberian Sun - Firestorm*, Limpet Drone (GDI and Nod): Waits hidden like a mine, welds itself under the first vehicle that drives over it, slows it down and reports what it sees. It does no real damage: a tracker, not a killer. Repair removes it; sensors reveal it and EMP destroys it. (medium; [Limpet drone, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Limpet_drone), [Research Lab: drones, CNCNZ](https://cncnz.com/features/nmenths-research-lab/drones/))
- *Command & Conquer: Generals / Zero Hour*, Hijacker and hero sniper crew kill (GLA): For contrast (belongs to the planned hijack-vehicle pattern): a GLA infantry unit, unarmed and stealthed while idle, that takes over most enemy vehicles on contact; a related hero shot (Jarmen Kell) kills a vehicle's crew from range and leaves it empty for anyone to claim. The hijacker can't take uncrewed vehicles such as drones, or transports carrying passengers; Kell's shot instead forces the passengers out. (high; [Hijacker (Generals 1), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Hijacker_(Generals_1)), [Jarmen Kell, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Jarmen_Kell), [Generals GLA units, CNCNZ](https://cncnz.com/games/generals/gla-units/))
- *StarCraft II: Legacy of the Void*, Viper's parasitic bomb (Zerg): Attaches a parasitic cloud to one enemy aircraft that damages it and every aircraft near it over several seconds, so the victim's best move is to leave its group. Damage values differ between versions. (high; [Viper, StarCraft Wiki](https://starcraft.fandom.com/wiki/Viper), [Legacy of the Void beta patch notes, Blizzard](https://news.blizzard.com/en-us/article/18483059/starcraft-ii-legacy-of-the-void-beta-patchnotes-1-0))
- *StarCraft II*, Infestor's neural parasite (Zerg): A tether that takes control of one enemy unit for a short, fixed time; control also ends early if the caster dies or the victim gets too far away. Kill the caster or pull the victim out of range to break it. (medium; [Infestor, StarCraft Wiki](https://starcraft.fandom.com/wiki/Infestor))
- *Halo Wars / Halo Wars 2*, Spartan vehicle hijack (UNSC): For contrast (belongs to the planned hijack-vehicle pattern): spartan heroes take over enemy vehicles; the target is frozen during the takeover, which is cancelled if the Spartan dies. In the sequel an EMP leap pins the target first. (medium; [Red Team, Halopedia](https://www.halopedia.org/Red_Team), [Boarding (gameplay mechanic), Halopedia](https://www.halopedia.org/Boarding_(gameplay_mechanic)))

**Shooter analogues (where players already do this)**

- *Titanfall / Titanfall 2*, Rodeo: A pilot climbs onto an enemy Titan and damages it from the back (the sequel turns this into stealing its battery and jumping off). The Titan hears a distinct sound and gets a warning, and can kill the rider with electric smoke or by disembarking and shooting them. A friendly rider blocks enemy rodeos. (high; [Rodeo, Titanfall Wiki](https://titanfall.wiki.gg/wiki/Rodeo), [The Evolution of Rodeo in 'Titanfall' (GDC 2017), GDC Vault](https://gdcvault.com/play/1024094/The-Evolution-of-Rodeo-in))
- *Halo series*, Vehicle boarding: Holding a button next to a vehicle throws the driver out; on tanks the boarder clings on top and punches through the hatch or drops a grenade in. Keep moving, have the gunner shoot boarders, or blow up your own vehicle to deny it. (medium; [Boarding (gameplay mechanic), Halopedia](https://www.halopedia.org/Boarding_(gameplay_mechanic)))
- *Battlefield: Bad Company 2 / Hardline*, Tracer dart: A dart stuck to an enemy vehicle lets teammates lock on with launchers and shows the vehicle to the team for a while: the tracker variant in player hands. (medium; [Tracer Dart, Battlefield Wiki](https://battlefield.fandom.com/wiki/Tracer_Dart))
- *ARC Raiders*, Tick (enemy machine): Small spider robots leap onto players after a short delay, screeching as they leap, then pin the victim in place and deal continuous damage until removed. The victim holds the action key to pull it off or a teammate shoots it off. AI-controlled, but a working model of the victim's side. (medium; [Tick, ARC Raiders Wiki](https://arc-raiders.fandom.com/wiki/Tick))

#### Translation to a player-controlled unit

A cheap, very fast, fragile pouncer whose skill is the approach. Once latched, the player rides the host and makes choices (drill, sabotage, arm a charge, leap off), while the victim always gets a reaction window and an escape.

**As the user**

- You buy a cheap T1 unit with very low health and a short respawn; losing it on the approach is normal, not a disaster.
- The skill is the approach: flank, use cover, wait for a stalled or lone vehicle, or have a teammate pin it first. The pounce is a short committed leap toward the cursor that snaps onto any enemy hull it touches.
- Once latched, your camera follows the host and you still have decisions: hold to drill if your variant does damage (it ramps up), with the anchor variant pick your sabotage on a multi-seat host by where you land (on the turret to jam its gun, on the rear to slow it, on the front to block deploying), and choose when to leap off.
- If your own damage finishes the host, you pop out with a short grace period. If anything else destroys it, you are thrown clear at low health and briefly stunned, so your team can finish a host you are riding without killing you.
- Against infantry, a pounce should not kill outright as in the RTS; at most it finishes weakened soldiers.

**As the target**

- You know at once: a metallic clang, the hull shakes, a large 'infested' marker on your vehicle and a timer ring showing how long until it is critical.
- You always have an answer within a few seconds: hold F to shake it off, drive onto a repair pad, call an engineer, or hold X to bail out and deny the kill.
- Your own main gun can't hit your hull, but other seats can help, for example with a close-defence zap from the commander seat.
- Against the anchor variant, every crew member of a multi-seat vehicle sees which part is sabotaged ('gun jammed', 'host slowed', 'deploying blocked') and can coordinate.

**Teammates**

- Engineers and repair classes get a clear job: a repair beam on an infested hull pulls the infester out faster than it repairs.
- Escort infantry with anti-small-target weapons screen vehicles; spacing vehicles out becomes a team skill.
- On the attacking side a pinner (stasis beam or EMP) sets up the pounce, and a transport can drop several infesters at once.
- Friendly infantry in a vehicle's firing seat can shoot an infester off the hull, which gives infantry a reason to ride with tanks.

**Controls (proposal)**

- Move with WASD and aim with the mouse.
- Left mouse: pounce toward the cursor, snapping to the nearest enemy hull in a small cone.
- Right mouse (optional per variant): a pin beam held on an enemy vehicle. Its range is capped so the pinner always stays on the victim's screen, and the cap is drawn as a ring around the pinner.
- While latched: hold left mouse to drill (variants that do damage, such as gnaw). With the anchor variant, where you land on a multi-seat host picks the sabotage (turret: gun jammed, rear: host slowed, front: deploying blocked), shown as an icon at that spot. Space leaps off; with the ticking-charge variant, leaping off arms the charge. With the pin that is two counted keys (right mouse and Space), within the T1 budget. Because the generator always sets an attach weapon first, an infester with a gun on left mouse carries that attach weapon on right mouse and has no weapon slot left for a separate pin.
- Victim, with the universal keys: hold F for a moment to shake it off; it works from every seat and while pinned, and you can drive but not fire while shaking. Hold X to bail out. Teammates: the repair tool's main fire removes the infester.

**Readability cues**

- Before the latch: a high-pitched skitter and a visible lunge arc, so alert victims can react.
- On the latch: a clang, sparks at the attach point, the hull rocking, and an icon on the host that everyone can see from above.
- Victim HUD: an 'infested' banner, a direction marker, a timer ring and per-seat status icons, plus an announcer line.
- A minimap marker on the infested vehicle for the host's team; the infester's team sees it only with the tracker variant.
- A clear sound for a successful removal, and a pop when the infester is thrown out or dies; a radius ring on the ground for charge or contagion variants.

**What changes from the RTS**

- In the RTS the infester is untargetable and repair is the main way to remove it. Here the victim also needs a shake-off of their own and teammates a mobile removal tool, because a drive back to base feels like a death sentence.
- RTS players mass many drones; here one player is one drone, so a single infester must matter on its own while its damage still leaves a readable reaction window.
- The RTS drone is passive once inside; a player needs decisions while latched, or it is dull.
- Instant infantry kills are fine against computer-controlled squads but frustrating against people; soften or remove them.
- Chain jumps must be capped and stacking blocked (one infester per host), so a cheap T1 can't wipe a T3 convoy.
- The approach and the attached state must be readable from above: tells, sounds and icons, since the camera can't show the inside of a vehicle.
- In a browser game, snapping onto a fast vehicle must be decided by the server with lag compensation, or pounces will feel random.
- Add a re-latch rule, since a shaken-off infester can try again: after leaving a host for any reason it is locked out of latching onto that same host for a short time, and the victim's shake-off always recharges faster than that lockout.

**Team-play potential: high.** Hooks: Rescue, Setup and finisher, Needs an escort, Counter-pick, Spotter. Both teams get jobs: attackers combine a pinner, a carrier and the infester, and a tracker infester spots the host for its team; defenders need escorts, a repair class, crews that coordinate and riders in firing seats who shoot infesters off.

**Build difficulty: medium.**

- Attaching is simple in a top-down game: follow the host's position and show an icon instead of climbing animations.
- The state machine has many edge cases: approach, pounce, attached, thrown clear when the host dies, removed, shaken off, teleported, re-latch lockout, host changes seat or bails out.
- Networking a pounce onto a moving vehicle in a browser game needs server authority and lag compensation.
- Many systems must respect the latch: repair tools, EMP and freeze effects, deploy and transform locks, teleports, invulnerability.
- UI on both sides: the attacker's latched HUD, the victim's banner and seat icons, team markers and the minimap.

**Balance risk: high.**

- An untargetable infester with guaranteed damage and no self-counter leaves the victim no agency; inside versus targetable is the main tuning lever (RA3 changed it between patches).
- A cheap T1 that kills T3 vehicles, especially with chain jumps through packed groups.
- Stacking several infesters on one host, or a pin-plus-latch loop that locks a vehicle down completely.
- Control variants hand a cheap unit an expensive vehicle's gun, so latched control stays short and weapon-only; stealing the whole vehicle belongs to a separate pattern, hijack a vehicle.
- If only one class can remove infesters, teams without it have no answer; always pair it with a self-cleanse.

**Readability risk: high.**

- A tiny infester on a large vehicle is easy to lose from above, and an inside attachment is invisible without an icon.
- Players must be able to tell an infested friendly vehicle from a hijacked one.
- Each crew member needs to see which seat is affected, not just falling health.
- Whether shooting the infester also hurts the host must be obvious.

**Variants the generator can roll**

| Variant | From spice | What changes | Rules that differ | Seen in |
|---|---|---|---|---|
| Gnaw from inside (`gnaw`) | 1 | Steady damage from inside until the host dies or the infester is removed; can't be shot while inside. | - | Red Alert 2 and 3 terror drones |
| Anchor (`anchor`) | 1 | Little or no damage; it slows the host, blocks its deploying or transforming, or jams its gun (on a multi-seat host, where it lands picks which), so teammates can catch or outgun it. | - | RA3 burst drone, Firestorm limpet drone |
| Parasite tracker (`tracker`) | 1 | Shows the host to the infester's team or enables lock-on; lasts long or until cleansed. | - | Firestorm limpet drone, Battlefield tracer dart |
| Chain jump (`chain-jump`) | 2 | If its own damage kills the host it pops out unharmed and can dive the next vehicle (two jumps at most); if anything else kills the host it is thrown clear at low health instead of dying with it. | - | Red Alert 2 and 3 terror drones |
| Ticking charge (`ticking-charge`) | 2 | Latches, then arms a charge as it leaps off; the charge detonates after a short fuse, hurting the host and nearby vehicles, and the victim gets a window to shake it off or spread out. | - | RA3 burst drone (Halo's grenade dropped into a tank's hatch is a looser, player-planted version) |
| Pin then pounce (`pin-then-pounce`) | 2 | A ranged pin holds the vehicle first so the latch lands safely; can be split between two teammates. The pin never blocks the victim's shake-off. | sets first: Attach (delivery), Melee (range), Root / pin (weapon trait) | RA3 terror drone stasis ray, Halo plasma-pistol EMP before boarding |
| Grab and run (`grab-and-run`) | 3 | A brief latch that rips a resource out of the host (a battery, a shield) after a short, visible pull that a quick shake-off stops; the thief then leaps off, the host can chase it, and the stolen resource can power up a friendly vehicle. | - | Titanfall 2 rodeo |
| Mine latch (`mine-latch`) | 3 | You plant up to two hidden latch-mines; the first enemy vehicle to drive over one is tagged (tracker) or slowed (anchor), never gnawed, and you get a ping. You never wait inside the mine yourself. | as: active; sets first: Place (delivery); own strengths: Works while you are elsewhere: the first vehicle over a hidden mine is tagged or slowed, and you get a ping. [Place (delivery)]; own weaknesses: A mine sits still and does nothing until a vehicle drives over it; a driver who spots it goes around it or shoots it. [Place (delivery)] | Firestorm limpet drone |
| Contagion (`contagion`) | 4 | The latched effect also hurts the host's allies nearby, so the victim's best move is to leave its group. | - | StarCraft II parasitic bomb |
| Latched control (`latched-control`) | 5 | Latches on and takes over only the host's weapon, never its movement, for a few seconds at most; it ends at once if the infester is shaken off, repaired off or killed, and the victim can drive the whole time. | from T3 | StarCraft II neural parasite |

The pattern itself is uncommon, so on a rolled card these variants appear from spice 2 at the earliest.

**Generator rules**

- Classes: Infantry, Aircraft, Drone / support. From T1. As: active, signature slot. Rarity: uncommon (rare on: Aircraft). Leans: Soviets.
- Needs: at most Small (size).
- Never with: at least 1 passenger seat(s).
- Sets first: Attach (delivery), Melee (range).
- Adds strength: While latched it is hard to hit and keeps working until the host shakes it off, gets repaired or a teammate removes it. *[Attach (delivery)]*
- Adds weakness: It has to reach touching distance, so it is exposed on the way in. *[Melee (range)]*
- Counters: Lone or slow vehicles without an escort or a cleanse are its prey. *[Tank / ground vehicle (class)]*
- Countered by: Sustained anti-infantry fire stops a fragile infester before it connects. *[Machine gun (weapon)]*
- Countered by: Repair tools pull the infester out of the host. *[Repair tool (weapon)]*
- Countered by: Out of its reach: it can't latch onto or hit aircraft in flight, and they can shoot it freely. *[Aircraft (class)]*
- Related: Disable a machine (combos with), Hijack a vehicle (planned; often confused with).

**Open design questions**

- Should the infester sit inside the vehicle (untargetable, needs a cleanse or repair) or on top (teammates can shoot it off)?
- Should a cheap infester be able to kill a T3 vehicle at all, or only sabotage and mark it?
- How long should the victim's reaction window be? This needs playtesting.

<a id="leech-weapon-on-kill"></a>
### Leech the weapon of what you destroy (`leech-weapon-on-kill`)

*Category:* Conversion (also Weapon behaviour). *Also called:* weapon salvage, loot the kill, steal a weapon. *Shooter fit:* 4/5. *Confidence:* high. *Status:* proposed (review: unchecked).

**What it does.** A unit turns enemy losses into its own power. It first claims a donor: a tether held on the target, a finishing blow, or touching the wreck or a dropped item. When the donor dies, something moves to the claimer: a copy of its weapon (so the reward depends on what was killed), an upgrade step, a new loadout or materials. The only living donor is a teammate who chooses to give (the willing-donor variant); taking a living enemy's vehicle or battery belongs to other patterns (hijack a vehicle; infest's grab-and-run). The usual limits are one slot or a short upgrade ladder, a short window to claim, and a vulnerable claiming state. Players pick targets by what they will get, and damaged players learn to back off before they become loot.

**Why it suits Shamble Frontlines.** Turns every kill into a loadout decision and rewards 'soften and claim' team play, but needs firm rules (tier scaling, no farming teammates) to avoid snowballing.

**Counterplay**

- Break the claim: get out of tether range before you die, so the enemy gets nothing.
- Attack the claimer while it is busy: claiming usually silences its main gun and slows or roots it.
- Deny the leftovers: destroy wrecks, crates and dropped weapons, or reach them first.
- Bring units that give nothing useful, or nothing that fills the claimer's gap (for example no anti-air donors).
- Use aircraft against ground claimers that can't tether them.
- Use hard counters against the stolen weapon itself, such as point defence against salvaged rockets.

**Source units in the database:** Technical, Hammer Tank

**Other examples found (to be entered as source units during the research run)**

- *Command & Conquer: Generals / Zero Hour*, Salvage crates (GLA Technical, Marauder, Scorpion and others): Destroyed vehicles drop crates that only the leeching faction can see. Each compatible vehicle climbs a fixed two-step upgrade ladder, whatever the donor was; vehicles already at the top get a little cash and experience instead. (high; [Salvaging, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Salvaging), [Technical (Generals 1), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Technical_(Generals_1)), [Command & Conquer: Generals – Zero Hour – Kassad's Units, CNCNZ](https://cncnz.com/games/zero-hour/kassads-units/))
- *Command & Conquer: Generals / Zero Hour*, Hijacker (GLA): For contrast (belongs to the planned hijack-vehicle pattern): an unarmed soldier, stealthed while idle, takes most enemy vehicles on contact and keeps their veterancy. It can't get out until the vehicle is destroyed, then climbs out to steal another. (high; [Hijacker (Generals 1), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Hijacker_(Generals_1)), [Command & Conquer: Generals – Zero Hour – Kassad's Units, CNCNZ](https://cncnz.com/games/zero-hour/kassads-units/))
- *Command & Conquer: Tiberian Sun*, Mutant Hijacker (Forgotten): For contrast (belongs to the planned hijack-vehicle pattern): a one-at-a-time commando that can steal any vehicle, even the heaviest walkers, and pops out to steal again when it is destroyed. (medium; [Mutant hijacker, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Mutant_hijacker))
- *Command & Conquer 3: Tiberium Wars / Kane's Wrath*, Avatar walker's commandeer, and walker husks (Nod): The Avatar tears parts off four Nod vehicle types (flame tank, attack bike, stealth tank, beam cannon), friendly or enemy, destroying the donor, and mounts them on itself: a flamethrower, a stealth detector, a cloak or a second beam. For contrast (a death outcome, not a leech): heavy walkers leave husks that an engineer from either side can revive, and a revived Avatar returns at reduced health. (medium; [Avatar (Tiberium Wars), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Avatar_(Tiberium_Wars)), [Husk, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Husk))
- *Company of Heroes*, Dropped weapons and abandoned team weapons (all factions): Specialist weapons sometimes drop when the soldiers carrying them are killed, and another infantry squad, even an enemy one, can pick them up. A crew-served gun left with too few crew is abandoned, and an infantry squad of any faction can recrew it with at least two men. (medium; [Infantry weapons, Company of Heroes Wiki](https://companyofheroes.fandom.com/wiki/Infantry_Weapons), [Weapon team, Company of Heroes Wiki](https://companyofheroes.fandom.com/wiki/Weapon_Team))
- *Iron Harvest*, Infantry weapon kits: Picking up a kit converts a whole squad into that class, always in the picker's own faction version. The beta-era wiki says kits come from crates and from killed enemy infantry; that needs a second source for the released game. (low; [Weapon, Iron Harvest Wiki](https://iron-harvest.fandom.com/wiki/Weapon), [Iron Harvest early impressions, Wayward Strategy](https://waywardstrategy.com/2018/08/27/iron-harvest-early-impressions/))
- *Supreme Commander*, Reclaim: Wrecks are broken down into the economy's mass by builders and a few combat units: the loot-as-currency version. (medium; [Reclaim, Supreme Commander Wiki](https://supcom.fandom.com/wiki/Reclaim))

**Shooter analogues (where players already do this)**

- *Titanfall 2*, Battery theft: For contrast (closer to infest's grab-and-run variant): a pilot rips the battery out of an enemy Titan, which damages it, and carries it to a friendly Titan for a shield and health boost; the carrier drops it on death, so the enemy can chase it back. (medium; [Rodeo, Titanfall Wiki](https://titanfall.fandom.com/wiki/Rodeo), [Battery, Titanfall Wiki](https://titanfall.fandom.com/wiki/Battery))
- *Battlefield series*, Kit pickup: A killed player's kit can be picked up and used at once; dropped kits vanish after a short time. (medium; [Kit, Battlefield Wiki](https://battlefield.fandom.com/wiki/Kit))
- *Mega Man (classic series)*, Boss weapons: Beating a boss permanently gives its weapon, which runs on limited energy that must be refilled: the cleanest 'kill it, get its gun' with an ammo limit. (medium; [Special Weapon, Mega Man Knowledge Base](https://megaman.fandom.com/wiki/Special_Weapon))
- *ARC Raiders*, Salvaging machines: Destroyed machines drop power cells, which recharge shields mid-fight or go into crafting, and parts such as a damaged Hornet driver that are recycled into crafting materials: kills pay out in resources. (medium; [ARC, ARC Raiders Wiki](https://arc-raiders.fandom.com/wiki/ARC), [ARC Powercell, ARC Raiders Wiki](https://arc-raiders.fandom.com/wiki/ARC_Powercell), [Damaged Hornet Driver, ARC Raiders Wiki](https://arc-raiders.fandom.com/wiki/Damaged_Hornet_Driver))
- *Halo series*, Vehicle hijacking: For contrast (belongs to the planned hijack-vehicle pattern): throwing a driver out and taking the seat. (medium; [Boarding (gameplay mechanic), Halopedia](https://www.halopedia.org/Boarding_(gameplay_mechanic)))

#### Translation to a player-controlled unit

A mid-tier vehicle with a main gun and a tether. Hold the tether on a target the team is killing; if it dies while tethered, whoever landed the kill, a copy of its weapon scaled to your tier snaps onto your chassis and fires on right mouse.

**As the user**

- The choice is tether or shoot: while tethered your main gun and stolen weapon are silent, you are heavily slowed and your turret stays locked on the target. Good players tether the target their team is already focusing.
- Target choice becomes a shopping list: hunt the enemy's anti-air vehicle to cover your weakness to aircraft, or a heavy tank for its cannon. The vehicle under your cursor previews what it would give.
- The stolen weapon lasts for this life; on death it drops as a salvage crate for a short time that only a leech-capable unit can claim and anyone can shoot to destroy.
- A new claim always replaces the stolen weapon. The target's preview ring shows the swap before you start the tether, so not tethering is how you keep what you have.

**As the target**

- A tether on you is a countdown: if you die now, the enemy gets your gun. Get out of range, break line of sight, hold F to shake the tether off, or burst the slowed claimer while its guns are silent.
- Damaged vehicles near a leecher should retreat earlier: 'don't feed' becomes a skill.
- Seeing your own weapon on an enemy tank is readable and gives a revenge goal: kill it and the weapon drops as salvage.

**Teammates**

- Claim and finish: the leecher pings its tethered target and allies burst it, because the claim doesn't need the killing blow.
- Escort the leecher while it is slowed and its guns are quiet.
- The team decides which weapon to take, based on what the team lacks.
- Friendly donations are limited to wrecks, abandoned allied vehicles and, in the willing-donor variant, a teammate who chooses to give; a leecher never takes from a living teammate by force, so teammates can't farm each other.

**Controls (proposal)**

- Move with WASD and aim with the mouse; the enemy vehicle under the cursor previews the weapon it would give. Left mouse: main gun.
- Hold Q: tether the enemy vehicle under the cursor while it is in range and in line of sight. Tether range is capped so you always stay on the target's screen, and the cap is drawn as a ring around you.
- Right mouse: fire the stolen weapon, your secondary slot, on its own trigger and cooldown (empty until your first claim; no hidden alternation with the main gun).
- No swap key: a new claim always replaces the stolen weapon, and a preview ring on the target shows the swap before the claim lands.
- Middle mouse, the universal ping, on the tethered target: 'leeching, finish it'. The pattern uses two counted keys (Q and right mouse), within the T2 budget; the other universal keys (E, hold F, hold X, 1-3) work as on every unit.
- Target, with the universal keys: hold F for a moment to shake the tether off; you can drive but not fire while shaking.

**Readability cues**

- A thick beam in the leecher's team colour that pulses with the drain, and a hum that rises as the target's health drops.
- A ring and icon over the enemy vehicle under your cursor, and over your tethered target, that preview the weapon you would get and show when it would replace the one you carry.
- On a claim: a distinct sound, the weapon visibly snapping onto the chassis, and the donor's icon in the HUD slot.
- On the target: a red edge vignette and a 'leeched' warning with an arrow to the source and a hold-F prompt.
- Each stolen weapon class has an oversized, distinct attachment model readable from above; claimable wrecks glow and show a despawn ring.

**What changes from the RTS**

- Map the donor table to units players can actually buy; RA3's naval and epic donors don't exist here.
- Replace RA3's random pick between several leechers with a visible rule, such as first to latch.
- Forbid leeching living teammates by force, which invites farming; allow only enemies and abandoned or wrecked allies (the willing-donor variant lets a teammate choose to give).
- Scale stolen weapons to the leecher's tier so a T2 can't carry a T3 gun at full power.
- Give the stolen weapon its own trigger instead of RA3's hidden one-weapon-at-a-time alternation.
- RA3 locks the slot after the first steal; here a new claim replaces it, previewed before it lands, so a poor first steal isn't a mistake for the whole life.
- Instead of RA3's full root, leeching applies a heavy slow and locks the turret onto the target.
- RA3's stolen weapon dies with the tank; here it drops as a short-lived salvage crate that only leech-capable units can claim (the open questions keep the alternatives).

**Team-play potential: high.** Hooks: Setup and finisher, Share the spoils, Needs an escort, Counter-pick. The claim-at-death rule rewards coordination directly: one player claims, others finish. The enemy has to coordinate its retreats and deny wrecks.

**Build difficulty: medium.**

- A generic upgrade ladder is cheap: one upgrade track per eligible unit and a pickup.
- The donor-specific version needs a donor-to-weapon table plus sockets, models and effects for every stolen weapon on every leecher; content grows with donors times leechers.
- The claim at the moment of death must be decided by the server; ties and latency create disputes.
- A tether weapon needs range and line-of-sight checks, a slow and turret-lock state, drain and heal ticks, and break rules.
- UI: donor previews, target warnings, kill-feed icons and loadout slot states.

**Balance risk: high.**

- Snowballing: the team winning fights collects the most stolen weapons and wins more fights.
- Players hunt the best donor instead of playing the objective.
- Stealing anti-air or anti-infantry removes the leecher's designed weakness and flattens the counter wheel.
- Cheap units carrying top-tier weapons undermine top-tier prices.
- Drain, healing and extra damage together can make the leecher very hard to kill.

**Readability risk: medium.**

- Players may not see which stolen weapon an enemy carries unless each class has a distinct, oversized silhouette.
- A tank firing another faction's weapon effects can make players misjudge it and pick the wrong counter.
- With several beams in a brawl it can be unclear who will get the claim.

**Variants the generator can roll**

| Variant | From spice | What changes | Rules that differ | Seen in |
|---|---|---|---|---|
| Tether and copy (`tether-copy`) | 1 | Hold a beam on the target; if it dies while tethered, whoever landed the kill, you mount a copy of its weapon, so the enemy roster becomes a loot table. The copy can be weaker or altered; here it is scaled to your tier. | as: channel; sets first: Adaptive (weapon); own weaknesses: Starts each life with an empty stolen-weapon slot, loses it on death, and goes quiet while it tethers. [Adaptive (weapon)] | RA3 Hammer Tank; Mega Man boss weapons (a donor copy without the tether) |
| Upgrade ladder (`upgrade-ladder`) | 1 | Every claim moves the unit one step up a fixed ladder, whatever the donor was; extra claims become cash or experience. Easier to read and balance. | from T1; as: triggered; sets first: nothing; own strengths: Each claim moves it one step up a fixed upgrade ladder, whatever the donor was. [Leech the weapon of what you destroy (pattern)]; own weaknesses: Starts each life at the bottom of the ladder and loses its steps on death; once at the top, claims pay only a little. [Leech the weapon of what you destroy (pattern)] | Generals salvage crates |
| Wreck crate race (`wreck-crate`) | 2 | A kill drops a pickup that the first unit to touch claims, before it decays; enemies can grab or destroy it first. | as: triggered; own strengths: Any wreck it reaches first can arm it, whoever made the kill. [Adaptive (weapon)]; own weaknesses: Starts each life with an empty slot and must reach a crate before it decays or an enemy grabs or destroys it. [Adaptive (weapon)] | Battlefield kits, Company of Heroes dropped weapons and abandoned team weapons, Generals salvage (only GLA players can see or take crates) |
| Kit swap (`kit-swap`) | 2 | A pickup replaces the whole loadout or class for this life instead of adding a weapon, but only with a kit of the picker's tier or lower. | classes: Infantry; from T1; as: triggered; sets first: nothing; own strengths: Can become another class mid-fight by picking up a kit. [Leech the weapon of what you destroy (pattern)]; own weaknesses: Takes only kits of its own tier or lower, only where they drop, and loses the new loadout on death. [Leech the weapon of what you destroy (pattern)]; own counters: Soldiers it helps kill drop kits it can take. [Infantry (class)]; own countered by: A kit only swaps one soldier loadout for another, so vehicles still outclass it. [Tank / ground vehicle (class)] | Iron Harvest kits, Battlefield kits |
| Loot as currency (`loot-currency`) | 2 | Wrecks pay out in resources or crafting material rather than direct power. | as: triggered; sets first: nothing; own strengths: Every wreck it salvages pays out resources or materials for later purchases. [Leech the weapon of what you destroy (pattern)]; own weaknesses: Salvage adds no power in the current fight, and wrecks must be reached before they decay or the enemy denies them. [Leech the weapon of what you destroy (pattern)] | Supreme Commander reclaim, ARC Raiders salvage |
| Limited-ammo copy (`limited-copy`) | 2 | The gained weapon runs on limited energy or ammo; when it runs dry it stays mounted but can't fire until refilled. | own weaknesses: Its stolen weapon runs dry and stays silent until refilled, and it starts each life with an empty slot. [Adaptive (weapon)] | Mega Man |
| Willing donor (`willing-donor`) | 3 | A living teammate chooses to hand over their vehicle's second weapon: they park beside the leecher and confirm with interact. The leecher mounts a copy at its own tier, and the donor loses that weapon for this life but keeps its main gun. One gift per life on each side and never by force, so teammates can't be farmed. | as: triggered; own strengths: A teammate can hand it a copy of their second weapon, so the team chooses what it carries. [Adaptive (weapon)]; own weaknesses: Needs a teammate to park beside it, at most once per life, and the gift costs that teammate their second weapon. [Adaptive (weapon)]; own counters: none; own countered by: Catches it and its donor while they park side by side for the gift. [Anti-armour (role)] | An original twist on the Tiberium Wars Avatar, which strips friendly vehicles by destroying them; here the ally consents and survives |

The pattern itself is uncommon, so on a rolled card these variants appear from spice 2 at the earliest.

**Generator rules**

- Classes: Tank / ground vehicle, Walker / mech, Hovercraft. From T2. As: channel, triggered, signature slot. Rarity: uncommon. Leans: Soviets.
- Needs: Cannon (weapon) or Autocannon (weapon) or Machine gun (weapon) or Laser (weapon) or Tesla / electric (weapon) or Rockets (weapon) or Railgun / gauss (weapon) or Flamethrower (weapon) or Small arms (weapon).
- Sets first: Adaptive (weapon).
- Adds strength: Gains a weapon from kills that can cover its own gaps. *[Adaptive (weapon)]*
- Adds weakness: Starts each life with an empty stolen-weapon slot and loses it on death. *[Adaptive (weapon)]*
- Counters: Every vehicle it helps kill pays it something: a weapon, an upgrade step or materials. *[Tank / ground vehicle (class)]*
- Countered by: Ground claimers usually can't reach aircraft or their wrecks, and have no anti-air until they gain some. *[Aircraft (class)]*
- Countered by: Fast targets get away before they die near it, leaving nothing to claim. *[at least Fast (speed)]*
- Countered by: Punishes it while it is busy claiming. *[Anti-armour (role)]*
- Related: Drain health (planned; combos with), Hijack a vehicle (planned; often confused with), Infest a vehicle (combos with), Switch weapon mode (combos with).

**Open design questions**

- What happens to a stolen weapon on death: lost, dropped as salvage, or kept until the round resets?
- Should the slot lock once filled (as in RA3), be replaceable, or run on limited ammo?
- The universal shake-off (hold F) also breaks a tether: how long must the target hold it, and how soon may the leecher re-tether the same target?
- Should leeching be one faction's signature (the Soviets, in RA3's spirit) or shared by all factions?
- In a multi-seat vehicle, who controls the stolen weapon and the tether?

<a id="passenger-sets-weapon"></a>
### A weapon that changes with the passenger (`passenger-sets-weapon`)

*Category:* Transport and garrison (also Weapon behaviour). *Also called:* passenger-defined armament, multigunner, fire ports. *Shooter fit:* 5/5. *Confidence:* high. *Status:* proposed (review: unchecked).

**What it does.** A vehicle whose weapon, or whole job, comes from whoever is inside. Empty, it has a modest default weapon or none at all. When someone boards, either the vehicle swaps its weapon for a vehicle-sized version of the passenger's specialty (a gun, a launcher or a tool such as a repair beam), or the passengers fight out of firing ports with their own weapons. One chassis becomes anti-air, anti-armour, anti-infantry or support depending on who rides it, so the composition choice moves from the factory to the battlefield. The design levers: how many seats count, whether the passenger weapon replaces or adds to the default, who aims it, whose upgrades apply, whether the vehicle must deploy first, how long a swap takes, and what happens to passengers when the vehicle dies.

**Why it suits Shamble Frontlines.** A built-in two-player combo that uses the seat systems team shooters already have (Battlefield, PlanetSide, Halo) and gives cheap infantry a job all game.

**Counterplay**

- Read the loadout from the roof weapon, then fight it with what that loadout lacks; a passenger without anti-air removes the vehicle's anti-air.
- Burst the light chassis: it throws both players out hurt and on foot, so keep anti-infantry fire ready for the follow-up.
- Out-range firing-port vehicles, whose reach is capped by the infantry inside.
- Target the crew rather than the hull: crew-killing shots force passengers out or leave the vehicle open to capture.
- Punish the swap: hit infantry while they walk to board or after they leave, before the vehicle's threat changes.
- Catch deploy-to-fire carriers while they move, and attack fixed firing ports from their blind side.

**Source units in the database:** Overlord, Battle Bus, Combat Chinook, Multigunner IFV

**Other examples found (to be entered as source units during the research run)**

- *Command & Conquer: Red Alert 2 / Yuri's Revenge*, IFV (Allies): The original: one infantry passenger picks the weapon pod (machine gun, repair crane, sniper rifle, tesla, psychic blast, suicide bomb and more). Only the vehicle's own rank counts, and an elite IFV is very strong. (high; [Infantry Fighting Vehicle, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Infantry_Fighting_Vehicle), [Red Alert 2 Allied units, CNCNZ](https://cncnz.com/games/red-alert-2/allied-units/))
- *Command & Conquer: Red Alert 2 - Yuri's Revenge*, Battle Fortress (Allies) and Tank Bunker (Yuri): A heavy carrier whose five passengers fire their own weapons out of gun ports with a range and damage bonus, so the loadout defines the vehicle. The Tank Bunker inverts it: a vehicle parks inside a bunker and fights with its own weapon, boosted. (medium; [Battle Fortress, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Battle_Fortress), [Tank bunker, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Tank_bunker))
- *Command & Conquer: Generals / Zero Hour*, Battle Bus (GLA), Humvee and Combat Chinook (USA): The bus has no weapon of its own: its damage and range are whatever the passengers bring. When first destroyed it becomes an immobile bunker whose wounded passengers keep fighting. The Humvee and the Air Force General's Combat Chinook also have gun ports for their passengers; Humvee passengers die with the vehicle. (medium; [Battle bus (Zero Hour), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Battle_bus_(Zero_Hour)), [Humvee (Generals), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Humvee_(Generals)), [Combat Chinook, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Combat_Chinook))
- *Command & Conquer: Generals / Zero Hour*, Overlord battle bunker and Helix bunker (China): A one-time add-on choice: a bunker that lets five infantry fire from the tank or helicopter, instead of a gatling cannon or a propaganda tower. (medium; [Overlord tank (Generals 1), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Overlord_tank_(Generals_1)), [Helix (Zero Hour), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Helix_(Zero_Hour)))
- *Command & Conquer 3: Kane's Wrath*, Reckoner (Nod): An unarmed carrier whose squads can't fire out of it at all until it deploys into a static bunker, on order or automatically when first destroyed, and it can't pack up again; deployed, it gains room for one more squad and they can all fire. (medium; [Reckoner (Kane's Wrath), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Reckoner_(Kane's_Wrath)))
- *Company of Heroes 2 / Tales of Valor*, M5 half-track (Soviets) and Kangaroo carrier (British): Squads fire out of the open-topped M5 half-track (Company of Heroes 2). The British Kangaroo carrier comes from Tales of Valor, an expansion for the first Company of Heroes: it carries more infantry than any other transport in that game, but fewer than half of them can shoot out of the top, so firepower is capped by ports, not capacity. (medium; [M5 Half-Track Transport, Company of Heroes Wiki](https://companyofheroes.fandom.com/wiki/M5_Half-Track_Transport), [Kangaroo Carrier, Company of Heroes Wiki](https://companyofheroes.fandom.com/wiki/Kangaroo_Carrier))
- *Command & Conquer: Red Alert 3*, Bullfrog (Soviets): The passengers are the ammunition: its only exit is a man-cannon that fires them over obstacles, and they parachute down, exposed to anti-air. (medium; [Bullfrog, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Bullfrog))

**Shooter analogues (where players already do this)**

- *Battlefield 3 / Battlefield 4*, Scout helicopter side benches: Passengers on the side seats keep their own kit, so the helicopter's extra firepower depends on who sits there: an engineer's repair tool, a lock-on launcher, or other classes' weapons fired in narrow side arcs. (medium; [AH-6 Little Bird, Battlefield Wiki](https://battlefield.fandom.com/wiki/AH-6_Little_Bird))
- *PlanetSide 2*, Harasser rumble seat: A three-seat buggy whose rear rider fights with their own loadout, so the third gun depends on who climbs on; the seat is exposed. (medium; [Harasser/Main, PlanetSide Wiki](https://planetside.fandom.com/wiki/Harasser/Main))
- *Halo series*, Warthog passenger seat: Driver, mounted gunner and a passenger who fires their own carried weapon; a rocket-carrying passenger turns it into an anti-vehicle car. (medium; [M12 Force Application Vehicle, Halo Wiki](https://halo.fandom.com/wiki/M12_Force_Application_Vehicle))
- *Foxhole*, Crewed tank seats: Each seat owns a weapon or job (driver, gunners, commander), so firepower depends on how many seats are filled and by whom. (medium; [Battle Tank, Foxhole Wiki](https://foxhole.fandom.com/wiki/Battle_Tank))

#### Translation to a player-controlled unit

A cheap, fast two-seat car. Alone, the driver has a modest default weapon. When a teammate climbs in, the roof weapon becomes a vehicle-sized version of their class weapon or tool, and they aim it. If the car dies, both players are thrown out hurt.

**As the user**

- As the driver you buy a cheap, fast chassis with a narrow but useful default weapon, so you aren't useless alone.
- Your power spikes when a teammate climbs into the specialist seat: their class decides whether you become anti-armour, anti-infantry, anti-air or a repair platform. You pick up whoever answers the threat in front of you.
- The driver's skill is positioning: kiting, flanking, and keeping the gunner's arc on target.
- As the passenger you trade your fragile body for speed, armour and a vehicle-sized version of your class weapon at the car's tier, which you aim yourself; the risk is being thrown out hurt when the car dies.

**As the target**

- Check the roof weapon, the colour of its shots and the loadout icon before committing, then fight it with what it lacks.
- It is a high-value, fragile target: killing the light hull dumps two hurt players on foot in front of you, and a repair-loaded one keeps their tanks alive.
- Watch for swaps: boarding, leaving and the swap delay are when it is weakest and when its threat is about to change.
- If it shows a loadout without anti-air, your aircraft can engage it freely.

**Teammates**

- A built-in two-player combo: 'need a ride' and 'need anti-tank' calls, and in-field counter-picking without re-buying.
- An engineer passenger makes it a mobile repair station that also strips parasites off vehicles, a natural answer to infesters.
- Squads rotate specialists through one car as the enemy changes: anti-air when aircraft appear, anti-tank when armour pushes.
- Kill credit and score go to both driver and passenger.

**Controls (proposal)**

- Universal keys, the same on every unit and outside the tier budget: E enters the nearest free seat or leaves it at once; 1-3 switch seats; hold X bails out from any seat; hold F shakes off anything attached; middle mouse pings ('request ride', 'request specialist').
- Driver: WASD to move; the mouse aims and left mouse fires the default weapon, which works only while the specialist seat is empty. G evicts the passenger, on a short cooldown. Locking the seat is a toggle in the vehicle menu, not a key.
- Passenger: the mouse aims the roof weapon at the point under the cursor; left mouse fires it, or works the tool on a tool seat (for example the repair beam); right mouse fires the class's vehicle-sized secondary weapon, if it has one (for example a slowing shot).
- The base pattern is passive and spends no budgeted key. Variants that need one put it on Q: deploying to fire, or launching the passengers.

**Readability cues**

- A distinct roof weapon model for each of 4-6 loadout groups (for example anti-armour, anti-infantry, anti-air and support tool), readable from above, plus colour-coded shots and a group icon on the nameplate.
- A short, visible and audible swap animation, so enemies see the loadout change.
- An empty-seat marker for allies, and the passenger's class icon for everyone.
- The driver's HUD shows the passenger's class and health; the passenger's HUD shows the hull's health, the weapon's ammo or heat and its firing arc, with a warning when the hull is low, since both players are thrown out hurt if it dies.
- Kill feed lists both driver and passenger with the loadout icon.

**What changes from the RTS**

- Passengers are people, not switches: they must aim the weapon or use the tool themselves, or nobody will ride.
- Collapse RA3's 18 per-soldier results into 4-6 loadout groups that enemies can learn from above.
- Swaps need a time cost (boarding delay, re-entry cooldown), or the vehicle always has the perfect answer.
- RA3 kills the passenger with the car, a double penalty on two people. Here both players are thrown out hurt instead; make the moment loud and visible.
- The empty vehicle must be playable alone, since one player is the whole unit.
- Anti-grief rules: passengers can always leave, drivers can lock seats or evict on a cooldown.
- Scale the roof weapon to the car's tier, not the passenger's: a T3 commando in a T1 car gets a T1-strength mount, so the car never out-trades the price of its two parts.

**Team-play potential: high.** Hooks: Seat synergy, Carry, Protector, Counter-pick. The vehicle's value depends on which teammate boards it, and the passenger gets speed, armour and a bigger weapon in return.

**Build difficulty: medium.**

- Needs a general multi-seat system (enter, leave, switch seats, several players on one networked vehicle), which the crew models need anyway.
- The driver's movement and the passenger's aim from a moving platform must both be predicted and reconciled in the browser.
- Content grows with weapon families: each needs a roof model, a swap animation, projectiles and tuning. Mapping classes to families keeps it bounded.
- Tools in the seat (repair, stun, parasite removal) need their own targeting and effects.
- Edge cases: a passenger leaving mid-shot, the vehicle dying during a swap, kill credit, whose upgrades apply.

**Balance risk: medium.**

- Single combinations can dominate: RA3 patches slowed and weakened the tesla and shotgun results and raised the vehicle's price.
- A fast, cheap hull carrying a specialist's amplified weapon can out-trade both parts.
- Free swapping lets the vehicle always have the right answer; it needs delays and cooldowns.
- Too weak alone makes it unbuyable without a partner; too strong alone makes the passenger optional.

**Readability risk: high.**

- Too many results to learn: per-soldier unique weapons across three factions can't be read at a glance.
- Roof weapon differences are small on screen, so colour, projectile shape and an icon must carry the information.
- The loadout state must always be visible and honest; a Red Alert 2 trick that disguised a loaded IFV as empty had to be patched out.
- What happens to the passengers when the vehicle dies (here: thrown out hurt) must be clear to everyone.

**Variants the generator can roll**

| Variant | From spice | What changes | Rules that differ | Seen in |
|---|---|---|---|---|
| Class swap (`class-swap`) | 1 | One specialist seat: the passenger's class replaces the default weapon with a vehicle-sized version of its own; empty, the default returns. | - | Red Alert 2 and 3 IFVs |
| Tool seat (`tool-seat`) | 1 | Some passengers give a tool instead of a gun: a repair beam that also strips parasites, a slowing horn (a stun only on T2 and higher carriers), a heal aura or a detector. | - | RA3 Multigunner IFV with an engineer (repairs and removes Terror Drones) or a dog or bear (stuns infantry); RA2 IFV with an engineer (repair crane); the heal aura and detector are new ideas |
| Fire ports (`fire-ports`) | 1 | Passengers shoot their own weapons out of ports, possibly with a bonus; the vehicle's output is the sum of who is aboard. | sets first: at least 1 passenger seat(s) | Battle Fortress, Battle Bus, half-tracks, Warthog, Battlefield Little Bird benches, PlanetSide 2 Harasser rumble seat |
| Modular bay (`modular-bay`) | 2 | A one-time purchase fits the bay as a passenger bunker whose riders fire their own weapons out of it, instead of a fixed weapon or aura; the options exclude each other. | sets first: at least 1 passenger seat(s) | Overlord and Helix add-ons |
| Anchor to fire (`anchor-to-fire`) | 3 | Passengers can only shoot once the vehicle deploys into a static bunker, trading mobility for firepower. | rare on: Aircraft; as: deploy; sets first: at least 1 passenger seat(s) | Kane's Wrath Reckoner |
| Wreck bunker (`wreck-bunker`) | 3 | When the vehicle dies, both players are thrown out hurt as usual, but the wreck stays behind as hard cover they can fight from until it is destroyed. | uncommon on: Aircraft | Zero Hour Battle Bus |
| Human ammunition (`human-ammunition`) | 4 | The passengers are the payload: the vehicle launches them over obstacles into the fight, briefly exposed in the air. | as: active | RA3 Bullfrog |
| Vehicle as passenger (`vehicle-as-passenger`) | 4 | A host, in the known example a static bunker, takes a smaller vehicle inside and fires its weapon with a boost while the small one can't move. | uncommon on: Hovercraft; rare on: Aircraft; from T2; needs at least Large (size) | Yuri's Revenge tank bunker (a static structure that holds one turreted vehicle) |
| Cross-faction hybrids (`cross-faction`) | 5 | A passenger from another faction produces its own distinct result, so captured or allied troops unlock hybrid weapons. | - | RA3 IFV result tables for all three factions |

The pattern itself is uncommon, so on a rolled card these variants appear from spice 2 at the earliest.

**Generator rules**

- Classes: Tank / ground vehicle, Hovercraft, Walker / mech, Aircraft. From T1. As: passive, signature slot. Rarity: uncommon. Leans: Allies.
- Never with: at most Small (size).
- Sets first: at least 1 passenger seat(s), Adaptive (weapon).
- Adds strength: Changes role mid-match depending on who climbs in. *[at least 1 passenger seat(s)]*
- Adds weakness: Alone it has at most a modest default weapon, and losing the vehicle leaves everyone inside hurt and on foot. *[at least 1 passenger seat(s)]*
- Counters: Brings whatever weapons its riders carry, or vehicle-sized versions of them, to soldiers who can't outrun it. *[Infantry (class)]*
- Countered by: Its light hull falls fast to anti-armour, throwing everyone inside out hurt. *[Anti-armour (role)]*
- Countered by: Splash and burst damage kill the light hull and then catch the hurt players it throws out. *[Splash (weapon trait)]*
- Related: Switch weapon mode (often confused with), Infest a vehicle (counters).

**Open design questions**

- Can players of different factions be on one team? If so, cross-faction results become a real feature.
- Who aims the passenger weapon, the driver or the passenger? (Recommended: the passenger.)
- What happens to the passenger when the vehicle dies: killed, thrown out hurt, or unharmed? (Recommended, and used in this file: thrown out hurt.)
- Whose upgrades power the weapon: the vehicle's, the passenger's, or both?

<a id="example-card"></a>
## Example concept card (hand-made)

A hand-written illustration of the card format, not generator output. It moves the *Infest a vehicle* pattern (parasite tracker variant) from its source, the Terror Drone (Soviet Union, many legs), to Allies with hover movement, and adds one original twist in its signature, *Frost Tag* (below).

### Rime Burr

> A tiny Allied hover-drone that rides enemy vehicles and frosts them over until your team's fire shatters them.

| Field | Value |
|---|---|
| Class · tier · flavour | Drone / support · T1 · Allies |
| Role | Scout / recon; secondary: Disabler / control |
| Mobility | Hover, drift, fast |
| Body | Micro-bot, tiny |
| Primary | Melee weapon (no damage, attach, melee range; hits ground vehicles; mark) |
| Secondary | Cryo (cryo, beam, medium range; hits infantry, ground vehicles; slow) |
| Armour | Light, charged shield |
| Sensors | Long sight; detector |
| Crew | Solo |
| Signature | **Frost Tag**: Latch onto an enemy vehicle: it shows on your team's minimap, and every hit your team lands while you ride adds frost; at full frost you are flung clear and the hull turns brittle for a short window, taking extra damage from every hit. If you leave or are removed before that, the frost melts away. *(pattern: Infest a vehicle, variant tracker; medium cooldown)* |
| Team-play hook | Ride the tank while your team pours fire into it: every hit adds frost, and at full frost it turns brittle. *(Setup and finisher)* |
| Strengths | Once latched it is hard to hit and stays on until a shake-off, repair or EMP removes it; every hit the team lands builds toward the brittle window. The hover frame reaches vehicles quickly and slips away again. |
| Weaknesses | It has to touch the vehicle, so it is exposed on the way in. A light frame: once its charged shield is gone, one burst ends it. |
| Countered by | Sustained fire stops it before it reaches the hull. A repair beam pulls it off the host. EMP drops its shield and knocks it off. Nothing on it can reach aircraft, and they can shoot it freely. |
| Counters | A ridden vehicle shows up for the whole team, and their focused fire turns it brittle. Its detector shows stealthy and disguised enemies near it to the whole team. |
| Counterplay | Shoot it on the way in: it is tiny and lightly protected. Hold F to shake it off, or drive onto a repair pad. Break away from the enemy's guns: frost only builds while they hit you. |
| How it plays | **As the user:** Skim in fast, pounce on a vehicle and ride it while your team piles on; the more they hit it, the sooner it turns brittle and flings you clear. You can't fire while riding, and leaping off early to chill infantry coming to help lets the frost melt. **As the target:** A pale glint lands on your hull, frost starts creeping across it and the enemy team sees you on their minimap. Hold F to shake it off, drive onto a repair pad, or get out of their fire: frost only builds when they hit you. Shaking it off clears the frost. **Teammates:** The ridden vehicle shows on your minimap. Every hit on it adds frost, and heavy hitters cash in on the brittle window; a repair player is the host's best friend. |
| Controls | LMB: Pounce and latch (Frost Tag); RMB: Cryo beam: slows infantry and vehicles (not while latched); Space: Leap off |
| Tells | A pale blue glint on the hull, a frost layer that visibly spreads across the vehicle from above as it fills, a crack-and-flash when it turns brittle, and cracked, glowing ice on the hull for as long as the brittle window lasts. |
| Inspiration | Infest a vehicle (parasite tracker variant; closest real examples: Firestorm limpet drone, Battlefield tracer dart); Terror Drone |
| Balance hints | cost low, power 4/10, complexity 3/10, 2 keys (T1 allows 2), no flags |
| Seed | `example-rime-burr` at spice 2 |

