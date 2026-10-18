<!-- Generated from the JSON in data/ and schemas/. Edit the JSON, not this file. -->

# Sample entries (draft v0.3)

The three source units and three mechanic patterns the brief asks for, fully filled in, plus one hand-made concept card showing what the generator will produce. Rendered from `data/units/ra3.json`, `data/patterns/*.json` and `docs/examples/concept-card.example.json`. Real unit and weapon names are reference only.

Contents: [Terror Drone](#ra3-soviet-terror-drone) · [Hammer Tank](#ra3-soviet-hammer-tank) · [Multigunner IFV](#ra3-allied-multigunner-ifv) · [Infest a vehicle](#infest-vehicle) · [Leech the weapon of what you destroy](#leech-weapon-on-kill) · [A weapon that changes with the passenger](#passenger-sets-weapon) · [Example concept card](#example-card)

## Source units

<a id="ra3-soviet-terror-drone"></a>
### Terror Drone (`ra3.soviet.terror-drone`)

> A tiny, disposable robot that hides inside the enemy's own tank: once it's in, you can't shoot it, so the enemy has to cure the host.

| Field | Value |
|---|---|
| Game / faction | Command & Conquer: Red Alert 3, Soviet Union |
| Flavour affinity | Soviets |
| Class / nature / availability | Drone / support / Uncrewed machine / Open |
| Role | Infiltrator / saboteur; secondary: Disabler / control, Scout / recon |
| Tier | T1 (gate: War Factory): Built at the War Factory with no further tech; the wiki lists it as tier 1. |
| Cost band | Low (600 credits): A little over half the price of a main battle tank. |
| Mobility | Many legs; handling: strafe *(proposal)*; traits: Amphibious; speed: very fast (3 times the reference). One of the fastest ground units in the game. It crosses water and can even reach submerged submarines. |
| Body | Spider frame, tiny. A spider-like robot. Although it comes from the vehicle factory, the game treats it much like infantry: it rides in troop transports and heals like infantry. |
| Armour | Light; model: Single health bar. Very little health. Machine guns and snipers hurt it badly and electric weapons do ten times normal damage; melee animals and radiation can't hurt it. |
| Crew | Solo (proposal). One player is the drone. While it is inside a host, the camera rides along with the host. |
| On death | Respawn (proposal) |
| Confidence | high (review: unchecked) |

**Armament**

| Weapon | Slot | Family | Damage | Mount / delivery / range | Hits | Traits | What it does |
|---|---|---|---|---|---|---|---|
| Dismantler Claws | primary | Melee weapon | Melee | free aim / attach / melee | infantry, ground vehicles | Damage over time | Leaps onto the target. Infantry die in one strike. A vehicle gets the drone inside it and takes damage from within until it dies or the drone is removed. Aircraft can be infested only while landed. *Pattern:* Infest a vehicle. |
| Electro-Stasis Ray | alternate | EMP | EMP | free aim / beam / long | ground vehicles | Root / pin | A long-range beam that pins a vehicle in place: it can't move, transform or deploy, but its guns still work. One documented exception, the Allied aircraft carrier, is shut down completely. *When:* In stasis mode, switched with the mode toggle. *Pattern:* disable machine (planned). |

**Abilities**

- **Claws / stasis ray mode switch** (toggle / mode switch, spammable cooldown): Swaps between the claws and the stasis ray. It uses one at a time, so pinning and infesting the same target takes two drones. *Pattern:* switch weapon mode (planned), disable machine (planned).
- **Jump to the next host** (triggered): If its own damage destroys the host, the drone climbs out and can dive into the next vehicle. If anything else destroys the host first, the drone dies with it. *Pattern:* Infest a vehicle.

**Strengths**

- One of the fastest ground units, so it scouts, dodges and reaches vehicles before they react. *[Very fast (speed)]*
- Can't be shot once inside a vehicle; the enemy has to repair, teleport or give up the host. *[Attach (delivery)]*
- Kills infantry in one strike, even elite commandos who aren't shooting at it. *[can hit infantry]*
- Crosses water and reaches even submerged submarines. *[Amphibious (trait)]*
- The stasis ray outranges most guns. *[Long (range)]*
- Cheap and quick to build, so losing one costs little. *[T1 (tier)]*

**Weaknesses**

- Very little health: machine guns, snipers and electric weapons destroy it quickly. *[Light (armour)]*
- The claws need touching distance, so it is exposed on the approach and can't reach aircraft. *[Melee (range)]*
- One mode at a time, and the ray stops movement but not the target's guns. *[switch weapon mode (planned pattern)]*
- Dies with the host if someone else destroys the vehicle first. *[Attach (delivery)]*
- Electric weapons do ten times normal damage, and normal repair can't heal it. *[Uncrewed machine (nature)]*

**Countered by**

- Neither weapon can hit aircraft in the air; its only answer is to hide inside a vehicle or a friendly transport. *[Aircraft (class)]*
- Machine-gun and autocannon fire does extra damage to it, so anti-infantry escorts shred approaching drones. *[Machine gun (weapon)]*
- Electric weapons do ten times normal damage to it. *[Electric (damage)]*
- Repair drones, engineers and repair stations strip an infesting drone out of the host. *[Repair tool (weapon)]*
- Snipers pick it off from range, and some can clear an infested vehicle. *[Sniper (weapon)]*

**Counters**

- Lone or unescorted vehicles, especially unarmed economy vehicles, die to an infesting drone unless they reach repairs in time. *[Tank / ground vehicle (class)]*
- Kills infantry in one strike if they don't shoot it first. *[Infantry (class)]*
- Infestation and the stasis ray stop a unit transforming or deploying, trapping it in its current form. *[Transform (trait)]*

**Notable combos**

- A second drone, or any teammate with a pin, holds the vehicle still so this one can jump in. *[Root / pin (weapon trait)]*
- A helicopter or amphibious transport carries five drones for a drop behind enemy lines, or launches them over walls. *[Transport (role)]*
- Drones hold enemy vehicles in place while heavier teammates destroy them. *[Frontline assault (role)]*

**As a player** *(proposal)***:** A cheap, very fast and fragile T1 pick with a tiny hitbox. Dive a vehicle to ride inside and chew it up, or hang back and pin it for your team. Aircraft and machine guns are its nightmare.

**Less certain**

- No source gives the stasis ray's exact range or duration, or says whether it must be held on the target.
- The full list of ways to remove an infesting drone comes from one wiki page; the official profile names fewer.
- Sources differ on the claws' internal damage type (explosive against vehicles and sniper-type against infantry, or 'melee'). (sources disagree)

**Sources**

- [Terror drone (Red Alert 3), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Terror_drone_(Red_Alert_3)) (wiki, read 2026-10-17)
- [Terror drone official profile (transcribed), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Terror_drone_(Red_Alert_3)/Profile) (wiki, read 2026-10-17) - Transcribes EA's official unit profile; the original page is offline.
- [Red Alert 3: Soviet units, StrategyWiki](https://strategywiki.org/wiki/Command_%26_Conquer:_Red_Alert_3/Soviet_units) (wiki, read 2026-10-17)

<a id="ra3-soviet-hammer-tank"></a>
### Hammer Tank (`ra3.soviet.hammer-tank`)

> A plain battle tank that loots: anything that dies in its beam hands over its gun, so every kill becomes a loadout choice.

| Field | Value |
|---|---|
| Game / faction | Command & Conquer: Red Alert 3, Soviet Union |
| Flavour affinity | Soviets |
| Class / nature / availability | Tank / ground vehicle / Crewed machine / Open |
| Role | Anti-armour; secondary: Frontline assault |
| Tier | T2 (gate: Super Reactor): Built at the War Factory but also needs a Super Reactor, one tech step above the starting units. The wiki's War Factory list puts it in tier 2. |
| Cost band | Medium (1000 credits): The standard price of a main battle tank in RA3. |
| Mobility | Tracks; handling: pivot (tank controls) *(proposal)*; traits: Crush; speed: medium (1.5 times the reference). A little slower than the Allied main battle tank and not amphibious. Heavy enough to run over infantry, which is its main answer to them. |
| Body | Hull with turret, large.  |
| Armour | Heavy; model: Directional armour. The toughest of the three factions' main battle tanks. Machine-gun fire does much less damage to it. Facing matters only mildly: side and rear hits do 5% and 10% more (game data on the wiki). |
| Crew | Solo (proposal). One player drives, fires and toggles the beam. A two-seat version could give the beam and the stolen weapon to a second player. |
| On death | Bail out (proposal) |
| Confidence | high (review: unchecked) |

**Armament**

| Weapon | Slot | Family | Damage | Mount / delivery / range | Hits | Traits | What it does |
|---|---|---|---|---|---|---|---|
| 85 mm cannon | primary | Cannon | Armour-piercing | free aim / projectile / medium | ground vehicles, structures | - | A fast-firing anti-vehicle gun. Poor against infantry and unable to hit aircraft. |
| Leech Beam | alternate | Drain beam | Energy | free aim / beam / long | ground vehicles, structures | Self-heal | Reaches about twice as far as the cannon. Deals modest damage and repairs the tank while it stays on target. A vehicle that dies in the beam gives up its weapon. *When:* In leech mode. Since patch 1.11 the tank must stand still to use it. *Pattern:* Leech the weapon of what you destroy, drain health (planned). |
| Auxiliary weapon port | acquired | Adaptive | - | from the kill | from the kill | - | Empty when built. Holds one weapon taken from the dead vehicle, such as anti-air flak, an anti-infantry gun, a tesla coil or artillery. It fires alongside the cannon, one weapon at a time, and is silent in leech mode. *When:* Filled once, by a vehicle that dies in the leech beam; kept for the life of the tank and can't be swapped. *Pattern:* Leech the weapon of what you destroy. |

**Abilities**

- **Leech Beam (mode switch)** (toggle / mode switch, spammable cooldown): Switches between the cannon and the leech beam. Leeching kills more slowly than the cannon; it is a choice to heal or to loot, not to deal more damage. *Pattern:* switch weapon mode (planned), Leech the weapon of what you destroy.
- **Weapon salvage** (triggered): When a vehicle dies while held in the beam, whoever lands the kill, the tank mounts that vehicle's weapon for good. It works on friendly vehicles with force-fire. Structures and naval-only weapons give nothing. *Pattern:* Leech the weapon of what you destroy.

**Strengths**

- The most health and armour of the three factions' main battle tanks; wins tank duels one-on-one. *[Heavy (armour)]*
- Heals itself mid-fight with the beam, so it can stay at the front without a repair trip. *[Self-heal (weapon trait)]*
- A stolen weapon can cover its own gaps, such as anti-air or anti-infantry, or add a big-unit gun. *[Adaptive (weapon)]*
- The beam outranges basic defences such as small turrets. *[Long (range)]*
- Runs over infantry caught in the open. *[Crush (trait)]*

**Weaknesses**

- Its cannon can't hit aircraft and is poor against infantry; without a stolen weapon it has no answer to air. *[Cannon (weapon)]*
- While leeching it stands still, kills slowly and its stolen weapon goes quiet. *[Beam (delivery)]*
- The stolen slot is permanent, so a poor first steal can't be undone. *[Adaptive (weapon)]*
- Needs an expensive tech building first. *[T2 (tier)]*
- Slower than the Allied tank and can't cross water. *[Medium (speed)]*

**Countered by**

- Bombers and gunships hit it freely when it has no stolen anti-air weapon. *[Aircraft (class)]*
- Anti-tank infantry, especially ones that burrow or garrison so they can't be crushed, wear it down from cover. *[Anti-armour (role)]*
- Freezing or shrinking it takes it out of the fight and lets other units shatter or crush it. *[Cryo (damage)]*
- The beam can't target the drone and the cannon barely hurts it, so a drone can get inside or lock it in place. *[Terror Drone]*

**Counters**

- Beats the other factions' main battle tanks one-on-one thanks to more health and steady damage. *[Tank / ground vehicle (class)]*
- The beam outranges basic defences such as small turrets. *[is a target of type structures]*
- Runs over infantry caught in the open. *[Infantry (class)]*

**Notable combos**

- The official notes pair it with an anti-infantry walker to cover its blind spot. *[Anti-infantry (role)]*
- An anti-air escort, or leeching a friendly anti-air vehicle on purpose, covers its weakness to aircraft. *[Anti-air (role)]*
- Teammates soften a big enemy vehicle while the tank holds the beam on it; the tank still gets the weapon if someone else lands the kill. *[Frontline assault (role)]*

**As a player** *(proposal)***:** A mid-tier brawler with a cannon for fighting and a rooted, long tether beam for healing and looting. Teammates soften big targets; you collect the gun.

**Less certain**

- Sources disagree on what a few Uprising vehicles give when leeched (Pacifier, Reaper). (sources disagree)
- No source states outright that the beam can't target infantry; it is described as working on vehicles and buildings only.

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
| Class / nature / availability | Tank / ground vehicle / Crewed machine / Open |
| Role | Anti-air; secondary: Support, Anti-infantry |
| Tier | T1 (gate: Armor Facility): Built at the Allied Armor Facility with no further tech; the wiki lists it as tier 1. |
| Cost band | Low (800 credits): 800 credits in the final patch (it moved between 700 and 900 during balancing), cheaper than a main battle tank. |
| Mobility | Wheels; handling: steer *(proposal)*; traits: none; speed: fast (2.4 times the reference). Outruns most ground vehicles. Not amphibious, and too light to run over infantry. |
| Body | Troop carrier, medium. No rotating turret: the whole car turns to aim (its Red Alert 2 ancestor had one). Each passenger type shows a different roof weapon, so the loadout can be read at a glance. |
| Armour | Light; model: Single health bar. Light armour and modest health; it relies on speed and escorts. |
| Crew | Solo (in-game); 1 passenger seat(s), passenger (module). One driver and one infantry passenger. Proposal for a player version: the passenger's class sets the roof weapon and the passenger aims it. |
| On death | Bail out (proposal) |
| Confidence | high (review: unchecked) |

**Armament**

| Weapon | Slot | Family | Damage | Mount / delivery / range | Hits | Traits | What it does |
|---|---|---|---|---|---|---|---|
| Multipurpose missile launcher | primary | Guided missiles | Explosive | free aim / lock-on / long | aircraft, ground vehicles | Homing | Rapid light missiles that hit aircraft about three times as hard, and from twice as far, as ground targets. Good against aircraft and light vehicles, weak against armour. *When:* Only when nobody is riding inside. *Pattern:* A weapon that changes with the passenger. |
| Repair tool (any engineer) | passenger (passenger (module)) | Repair tool | Repair | free aim / beam / short | ground vehicles (allies) | - | Replaces the weapon with a repair beam for friendly vehicles. It drives to damaged friends on its own, removes infesting drones and cures corrosion. It can't attack. *When:* An engineer of any faction rides inside. *Pattern:* A weapon that changes with the passenger. |
| Stun bark / roar (attack dog or war bear) | passenger (passenger (module)) | Sonic | Sonic | free aim / beam / long | infantry | Stun | Loudspeakers stun enemy infantry for a few seconds from twice the animal's own reach. Commandos are immune. *When:* An attack dog (Allied) or a war bear (Soviet) rides inside. *Pattern:* A weapon that changes with the passenger. |
| Auto-shotgun (Peacekeeper) | passenger (passenger (module)) | Shotgun | Kinetic | free aim / hitscan / short | infantry, ground vehicles | Knockback | A close-range shotgun that knocks infantry back. *When:* An Allied Peacekeeper rides inside. *Pattern:* A weapon that changes with the passenger. |
| Missile pod (Javelin soldier) | passenger (passenger (module)) | Guided missiles | Armour-piercing | free aim / lock-on / long | ground vehicles, structures | Magazine, Homing | Fires a burst of eight rockets, then reloads for several seconds. Turns the car into a tank hunter. *When:* An Allied Javelin soldier rides inside. *Pattern:* A weapon that changes with the passenger. |
| Sniper rifle (Spy) | passenger (passenger (module)) | Sniper | Kinetic | free aim / hitscan / long | infantry | - | Kills infantry in one shot and can fire on the move. Also hits terror drones, but no vehicles. *When:* An Allied Spy rides inside. *Pattern:* A weapon that changes with the passenger. |
| Twin autoguns (Tanya) | passenger (passenger (module)) | Machine gun | Kinetic | free aim / hitscan / medium | infantry | - | The commando's own guns, mounted: shreds groups of infantry but can attack nothing else. *When:* Tanya, the Allied commando, rides inside. *Pattern:* A weapon that changes with the passenger. |
| Cryo beam (Cryo Legionnaire) | passenger (passenger (module)) | Cryo | Cryo | free aim / beam / long | infantry, ground vehicles, aircraft | - | A single-target freezing beam that, unlike the soldier on foot, can also freeze aircraft out of the sky. *When:* An Allied Cryo Legionnaire rides inside (Uprising only). *Pattern:* A weapon that changes with the passenger. |
| Gatling gun (Conscript) | passenger (passenger (module)) | Machine gun | Kinetic | free aim / hitscan / medium | infantry | - | A weak anti-infantry gun; one of the poorest combinations. *When:* A Soviet Conscript rides inside. *Pattern:* A weapon that changes with the passenger. |
| Flak cannon (Flak Trooper) | passenger (passenger (module)) | Flak | Explosive | free aim / projectile / medium | aircraft | Splash | Anti-air only, a little stronger than the Soviets' own flak transport, on a fast chassis that keeps up with aircraft. *When:* A Soviet Flak Trooper rides inside. *Pattern:* A weapon that changes with the passenger. |
| Tesla gun (Tesla Trooper) | passenger (passenger (module)) | Tesla / electric | Electric | free aim / hitscan / medium | infantry, ground vehicles, structures | Charge-up | Kills infantry in one zap and hurts vehicles and buildings. Patches added a wind-up delay because it was too strong. *When:* A Soviet Tesla Trooper rides inside. *Pattern:* A weapon that changes with the passenger. |
| Radiation spray (Desolator) | passenger (passenger (module)) | Chemical / radiation | Toxic | free aim / projectile / short | infantry, ground vehicles | Damage over time | The Desolator's own fast-ticking radiation spray, good for clearing groups of infantry. *When:* A Soviet Desolator rides inside (Uprising only). *Pattern:* A weapon that changes with the passenger. |
| Piercing sniper rifle (Natasha) | passenger (passenger (module)) | Sniper | Kinetic | free aim / hitscan / long | infantry | Pierce | Kills several infantry in a line, but can't fire while moving. *When:* Natasha, the Soviet commando, rides inside. *Pattern:* A weapon that changes with the passenger. |
| Infantry laser (Imperial Warrior) | passenger (passenger (module)) | Laser | Energy | free aim / beam / medium | infantry, ground vehicles | - | An anti-infantry laser that is also fair against light vehicles. *When:* An Empire Imperial Warrior rides inside. *Pattern:* A weapon that changes with the passenger. |
| Anti-vehicle laser (Tankbuster) | passenger (passenger (module)) | Laser | Energy | free aim / beam / long | ground vehicles, infantry, structures | - | A fast-firing anti-vehicle laser with long range; guides call it one of the strongest combinations. *When:* An Empire Tankbuster rides inside. *Pattern:* A weapon that changes with the passenger. |
| Shuriken launcher (Shinobi) | passenger (passenger (module)) | Sniper | Kinetic | free aim / projectile / long | infantry | - | Throws shuriken that kill infantry in one hit, slightly faster than the Spy version. *When:* An Empire Shinobi rides inside. *Pattern:* A weapon that changes with the passenger. |
| Bow launcher (Archer Maiden) | passenger (passenger (module)) | Small arms | Kinetic | free aim / projectile / long | aircraft, infantry | - | Arrows that hit both aircraft and infantry, with a little more anti-air reach than on foot. *When:* An Empire Archer Maiden rides inside (Uprising only). *Pattern:* A weapon that changes with the passenger. |
| Psychokinetic blast (Yuriko Omega) | passenger (passenger (module)) | Psionic | Psionic | free aim / beam / medium | infantry, ground vehicles | - | A mounted version of her psychic attack. The gain is mostly range, speed and protection rather than damage. *When:* Yuriko Omega, the Empire's psychic commando, rides inside. *Pattern:* A weapon that changes with the passenger. |

**Abilities**

- **Weapon changes with the passenger** (passive): Loading one infantry swaps the missiles for a stronger, vehicle-mounted version of that soldier's weapon or role. Unloading brings the missiles back. *Pattern:* A weapon that changes with the passenger.
- **Evacuate** (active, spammable cooldown): Drops the passenger out; the car goes back to its missiles. *Pattern:* A weapon that changes with the passenger.

**Strengths**

- Outruns most ground vehicles: a cheap anti-air escort and rapid responder from the first minutes. *[Fast (speed)]*
- Empty, its missiles hit aircraft three times as hard and twice as far as ground targets. *[can hit aircraft]*
- Changes role mid-match by swapping the passenger: anti-air, anti-tank, anti-infantry, stun or field repair. *[at least 1 passenger seat(s)]*
- With an engineer aboard it repairs tanks in the field and pulls infesting drones out of them. *[Repair tool (weapon)]*

**Weaknesses**

- Light armour and modest health. *[Light (armour)]*
- Empty, its missiles barely hurt armour. *[Guided missiles (weapon)]*
- A passenger without an anti-air weapon removes its anti-air ability, and if the car dies the passenger dies too: one kill for the price of two. *[at least 1 passenger seat(s)]*
- Can't cross water or run over infantry, and the whole car must turn to aim. *[Wheels (mobility)]*

**Countered by**

- Tanks shrug off its light missiles unless an anti-armour passenger rides along, and the heaviest can run it over. *[Tank / ground vehicle (class)]*
- A Hammer that leeches it to death gains its anti-air missiles, whoever was riding inside. *[Hammer Tank]*
- Pilot snipers and bribing spies can empty or steal it; the passenger is pushed out. *[Infiltrator / saboteur (role)]*
- A drone inside it can only be removed by another engineer car or repair drones. *[Terror Drone]*

**Counters**

- Its default missiles are built for anti-air, with extra damage and range against aircraft. *[Aircraft (class)]*
- With a sniper, commando, tesla or radiation passenger it deletes infantry while staying hard to catch. *[Infantry (class)]*
- With an engineer aboard it strips infesting drones out of friendly vehicles; with a spy it can shoot drones. *[Infest a vehicle]*

**Notable combos**

- Engineer cars repair the main tanks from behind; bring two so they can repair each other. *[Frontline assault (role)]*
- Ferries engineers to capture key buildings, then picks up anti-tank soldiers for the next job. *[Engineer / builder (role)]*
- Every infantry type is a loadout: the team's infantry mix decides what the cars can do. *[Infantry (class)]*

**As a player** *(proposal)***:** A two-seat T1 runabout. Alone, the driver has a light homing anti-air pod. When a teammate climbs in, the roof weapon becomes a bigger version of their class weapon and they aim it. If the car dies, both players are thrown out hurt.

**Less certain**

- Sources list Soviet and Empire soldiers as passengers but don't say how they normally end up in an Allied car (bribed soldiers, captured barracks or mixed teams).
- Whether the Javelin version can also hit aircraft: one wiki suggests yes, the other doesn't say. (sources disagree)
- Exact numbers for most mounted weapons are not published; only relative strength is recorded here.

**Sources**

- [Multigunner IFV, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Multigunner_IFV) (wiki, read 2026-10-17)
- [Red Alert 3: Multigunner IFV infantry effects, StrategyWiki](https://strategywiki.org/wiki/Command_%26_Conquer:_Red_Alert_3/Multigunner_IFV_Infantry_Effects) (wiki, read 2026-10-17)
- [Multigunner IFV official profile (transcribed), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Multigunner_IFV/Profile) (wiki, read 2026-10-17) - Transcribes EA's official unit profile; the original page is offline.

## Mechanic patterns

<a id="infest-vehicle"></a>
### Infest a vehicle (`infest-vehicle`)

*Category:* Infiltration (also Control). *Also called:* parasite, latch onto a vehicle, burrow into a vehicle. *Shooter fit:* 5/5. *Confidence:* high. *Status:* accepted (review: unchecked).

**What it does.** A small, cheap, fast and fragile attacker reaches an enemy vehicle and attaches to it: it burrows inside, clings on top or welds itself underneath. Once attached it is protected (untargetable in the purest form, or just hard to hit) and keeps working on the host until it is removed or the host dies. The effect can be damage over time, a slow, a blocked ability, a tracking mark, a timed charge or a full takeover. Removal is deliberately narrow, so the latch starts a visible clock that the victim and their team must beat. The trade-off is heavy exposure on the way in for safety once attached.

**Why it suits Shamble Frontlines.** A direct player-versus-player duel with a clear tell, a reaction window and a team rescue; Titanfall's rodeo shows it already works in a shooter.

**Counterplay**

- Kill it on the approach: infesters are fragile, so anti-infantry fire and point defence stop them before they connect.
- Keep moving and avoid stalls; a pin (stasis beam or EMP) is the infester's setup tool, so dodging the pin is the first defence.
- Remove it with repair: a repair station, repair drones, a repair tool or an engineer-crewed vehicle pulls the infester out.
- Use a self-cleanse on a cooldown, such as an electric discharge, smoke or a hold-to-shake-off input.
- Get a teammate to shoot the rider off, or to use an ability that clears the hull.
- Teleport or make the host invulnerable, which drops or suspends the infester.
- Sacrifice or abandon the host: bail out, or destroy your own vehicle to deny a chain jump or a hijack.
- Spread vehicles out so a chain jump or contagion can't spread through a group.

**Source units in the database:** Terror Drone

**Other examples found (to be entered as source units during the research run)**

- *Command & Conquer: Red Alert 2 / Yuri's Revenge*, Terror Drone (Soviets): The original: leaps inside a vehicle, can't be hit while inside, and pops out to dive the next vehicle if its own damage kills the host. One drone per vehicle; an infested construction vehicle can't deploy. Only repair removes it. (high; [Terror drone (Red Alert 2), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Terror_drone_(Red_Alert_2)), [Red Alert 2 Soviet units, CNCNZ](https://cncnz.com/games/red-alert-2/soviet-units/))
- *Command & Conquer: Red Alert 3*, Burst Drone (Empire): A flying scout that clings to the outside of a vehicle or aircraft, slows it and can self-destruct a few seconds later to hurt the host and its neighbours. Unlike the terror drone it can be shot off while attached, and repair drones destroy it. (high; [Burst drone, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Burst_drone), [Red Alert 3: Empire units, StrategyWiki](https://strategywiki.org/wiki/Command_%26_Conquer:_Red_Alert_3/Empire_of_the_Rising_Sun_units))
- *Command & Conquer: Tiberian Sun - Firestorm*, Limpet Drone (GDI and Nod): Waits hidden like a mine, welds itself under the first vehicle that drives over it, halves its speed and reports what it sees. It does no real damage: a tracker, not a killer. Repair removes it; sensors reveal it and EMP destroys it. (high; [Limpet drone, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Limpet_drone), [Research Lab: drones, CNCNZ](https://cncnz.com/features/nmenths-research-lab/drones/))
- *Command & Conquer: Generals / Zero Hour*, Hijacker and hero sniper crew kill (GLA): A stealthed, unarmed infantry unit that takes over most enemy vehicles on contact; a related hero shot kills a vehicle's crew from range and leaves it empty for anyone to claim. Uncrewed vehicles and loaded transports are immune. (high; [Hijacker (Generals), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Hijacker_(Generals_1)), [Jarmen Kell, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Jarmen_Kell))
- *StarCraft II: Legacy of the Void*, Viper's parasitic bomb (Zerg): Attaches a parasitic cloud to one enemy aircraft that damages it and every aircraft near it over several seconds, so the victim's best move is to leave its group. Damage values differ between versions. (high; [Viper, StarCraft Wiki](https://starcraft.fandom.com/wiki/Viper), [Legacy of the Void beta patch notes, Blizzard](https://news.blizzard.com/en-us/article/18483059/starcraft-ii-legacy-of-the-void-beta-patchnotes-1-0))
- *StarCraft II*, Infestor's neural parasite (Zerg): A tether that takes control of one enemy unit while the caster stays alive and within leash range. Kill the caster or pull the victim out of range to break it. (medium; [Infestor, StarCraft Wiki](https://starcraft.fandom.com/wiki/Infestor))
- *Halo Wars / Halo Wars 2*, Spartan vehicle hijack (UNSC): Spartan heroes take over enemy vehicles; the target is frozen during the takeover, which is cancelled if the Spartan dies. In the sequel an EMP leap pins the target first. (medium; [Red Team, Halopedia](https://www.halopedia.org/Red_Team), [Boarding (gameplay mechanic), Halopedia](https://www.halopedia.org/Boarding_(gameplay_mechanic)))

**Shooter analogues (where players already do this)**

- *Titanfall / Titanfall 2*, Rodeo: A pilot climbs onto an enemy Titan and damages it from the back (the sequel turns this into stealing its battery and jumping off). The Titan hears a distinct sound and gets a warning, and can shake the rider off with electric smoke or by getting out. A friendly rider blocks enemy rodeos. (high; [Rodeo, Titanfall Wiki](https://titanfall.wiki.gg/wiki/Rodeo), [The Evolution of Rodeo in Titanfall 2, GDC Vault](https://gdcvault.com/play/1024094/The-Evolution-of-Rodeo-in))
- *Halo series*, Vehicle boarding: Holding a button next to a vehicle throws the driver out; on tanks the boarder clings on top and punches through the hatch or drops a grenade in. Keep moving, have the gunner shoot boarders, or blow up your own vehicle to deny it. (medium; [Boarding (gameplay mechanic), Halopedia](https://www.halopedia.org/Boarding_(gameplay_mechanic)))
- *Battlefield: Bad Company 2 / Hardline*, Tracer dart: A dart stuck to an enemy vehicle lets teammates lock on with launchers and shows the vehicle to the team for a while: the tracker variant in player hands. (medium; [Tracer Dart, Battlefield Wiki](https://battlefield.fandom.com/wiki/Tracer_Dart))
- *ARC Raiders*, Tick (enemy machine): Small spider robots leap onto players after a high-pitched wind-up and hurt them until removed. The victim holds a key to pull it off or a teammate shoots it off. AI-controlled, but a tested model of the victim's side. (medium; [Tick, ARC Raiders Wiki](https://arc-raiders.fandom.com/wiki/Tick))

#### Translation to a player-controlled unit

A cheap, very fast, fragile pouncer whose skill is the approach. Once latched, the player rides the host and makes choices (drill, sabotage, arm a charge, leap off), while the victim always gets a reaction window and an escape.

**As the user**

- You buy a cheap T1 unit with very low health and a short respawn; losing it on the approach is normal, not a disaster.
- The skill is the approach: flank, use cover, wait for a stalled or lone vehicle, or have a teammate pin it first. The pounce is a short committed leap toward the cursor that snaps onto any hull it touches.
- Once latched, your camera follows the host and you still have decisions: hold to drill (damage ramps up), sabotage a seat on a multi-seat vehicle (jam the turret, cut the engine, block deploying), or arm a charge and leap off.
- If your damage finishes the host, you pop out with a short grace period and can pounce again (chain jumps capped). If something else kills the host, you go down with it.
- Against infantry, a pounce should not kill outright as in the RTS; at most it finishes weakened soldiers.

**As the target**

- You know at once: a metallic clang, the hull shakes, a large 'infested' marker on your vehicle and a timer ring showing how long until it is critical.
- You always have an answer within a few seconds: a self-cleanse on a cooldown, a repair pad, calling an engineer, or bailing out to deny the kill.
- Your own main gun can't hit your hull, but other seats can help, for example with a close-defence zap from the commander seat.
- On a multi-seat vehicle every crew member sees which seat is affected ('turret jammed', 'engine damaged') and can coordinate.

**Teammates**

- Engineers and repair classes get a clear job: a repair beam on an infested hull pulls the infester out faster than it repairs.
- Escort infantry with anti-small-target weapons screen vehicles; spacing vehicles out becomes a team skill.
- On the attacking side a pinner (stasis beam or EMP) sets up the pounce, and a transport can drop several infesters at once.
- Friendly infantry riding on a vehicle can block enemy latching, which gives infantry a reason to ride with tanks.

**Controls (proposal)**

- Move with WASD and aim with the mouse.
- Left mouse: pounce toward the cursor, snapping to the nearest hull in a small cone.
- Right mouse (optional per variant): a ranged pin beam held on a vehicle.
- While latched: hold left mouse to drill, Q to pick a sabotage or arm a charge, Space to leap off.
- Victim: hold E to shake off or cleanse on a cooldown; each seat has a bail-out key. Teammates: the repair tool's main fire removes the infester.

**Readability cues**

- Before the latch: a high-pitched skitter and a visible lunge arc, so alert victims can react.
- On the latch: a clang, sparks at the attach point, the hull rocking, and an icon on the host that everyone can see from above.
- Victim HUD: an 'infested' banner, a direction marker, a timer ring and per-seat status icons, plus an announcer line.
- A minimap ping on the infested vehicle for both teams.
- A clear sound for a successful removal, and a pop when the infester is thrown out or dies; a radius ring on the ground for charge or contagion variants.

**What changes from the RTS**

- In the RTS the infester is untargetable and only repair removes it. Here the victim also needs a self-cleanse and teammates a mobile removal tool, because a drive back to base feels like a death sentence.
- RTS players mass many drones; here one player is one drone, so a single infester must matter on its own while its damage still leaves a readable reaction window.
- The RTS drone is passive once inside; a player needs decisions while latched, or it is dull.
- Instant infantry kills are fine against computer-controlled squads but frustrating against people; soften or remove them.
- Chain jumps must be capped and stacking blocked (one infester per host), so a cheap T1 can't wipe a T3 convoy.
- The approach and the attached state must be readable from above: tells, sounds and icons, since the camera can't show the inside of a vehicle.
- In a browser game, snapping onto a fast vehicle must be decided by the server with lag compensation, or pounces will feel random.

**Team-play potential: high.** Hooks: Rescue, Setup and finisher, Needs an escort, Counter-pick. Both teams get jobs: attackers combine a pinner, a carrier and the infester; defenders need escorts, a repair class, crews that coordinate and riders that block latching.

**Build difficulty: medium.**

- Attaching is simple in a top-down game: follow the host's position and show an icon instead of climbing animations.
- The state machine has many edge cases: approach, pounce, attached, thrown out, killed with the host, removed, cleansed, teleported, host changes seat or bails out.
- Networking a pounce onto a moving vehicle in a browser game needs server authority and lag compensation.
- Many systems must respect the latch: repair tools, EMP and freeze effects, deploy and transform locks, teleports, invulnerability.
- UI on both sides: the attacker's latched HUD, the victim's banner and seat icons, team markers and the minimap.

**Balance risk: high.**

- An untargetable infester with guaranteed damage and no self-counter leaves the victim no agency; inside versus targetable is the main tuning lever (RA3 changed it between patches).
- A cheap T1 that kills T3 vehicles, especially with chain jumps through packed groups.
- Stacking several infesters on one host, or a pin-plus-latch loop that locks a vehicle down completely.
- Hijack variants hand a cheap unit a whole expensive vehicle.
- If only one class can remove infesters, teams without it have no answer; always pair it with a self-cleanse.

**Readability risk: high.**

- A tiny infester on a large vehicle is easy to lose from above, and an inside attachment is invisible without an icon.
- Players must be able to tell an infested friendly vehicle from a hijacked one.
- Each crew member needs to see which seat is affected, not just falling health.
- Whether shooting the infester also hurts the host must be obvious.

**Variants the generator can roll**

| Variant | From spice | What changes | Seen in |
|---|---|---|---|
| Gnaw from inside (`gnaw`) | 1 | Steady damage from inside until the host dies or the infester is removed; can't be shot while inside. | Red Alert 2 and 3 terror drones |
| Anchor (`anchor`) | 1 | Little or no damage; it slows the host or stops it deploying or transforming, so teammates can catch it. | RA3 burst drone, Firestorm limpet drone |
| Parasite tracker (`tracker`) | 1 | Shows the host to the infester's team or enables lock-on; lasts long or until cleansed. | Firestorm limpet drone, Battlefield tracer dart |
| Chain jump (`chain-jump`) | 2 | If its own damage kills the host it pops out unharmed and can dive the next vehicle; if anything else kills the host it dies too. | Red Alert 2 and 3 terror drones |
| Ticking charge (`ticking-charge`) | 2 | Latches, then detonates after a short fuse, hurting the host and nearby vehicles; the victim gets a window to shake it off or spread out. | RA3 burst drone, Halo tank boarding with a grenade |
| Pin then pounce (`pin-then-pounce`) | 2 | A ranged pin holds the vehicle first so the latch lands safely; can be split between two teammates. | RA3 stasis ray, Halo Wars 2 EMP leap |
| Grab and run (`grab-and-run`) | 3 | A brief latch that rips a resource out of the host (a battery, a shield) and leaps off; the host chases the thief, and the stolen resource can power up a friendly vehicle. | Titanfall 2 rodeo |
| Mine latch (`mine-latch`) | 3 | Waits hidden as a mine and latches onto the first vehicle that drives over it; ambush and positioning replace the approach. | Firestorm limpet drone |
| Contagion (`contagion`) | 4 | The latched effect also hurts the host's allies nearby, so the victim's best move is to leave its group. | StarCraft II parasitic bomb |
| Crew eviction (`hijack`) | 4 | Instead of destroying the vehicle, it throws out or kills the crew and takes the vehicle, or leaves it empty for anyone to claim. | Generals hijacker, Halo boarding |
| Tethered control (`tethered-control`) | 5 | Takes control of the host only while the attacker stays alive and within leash range. | StarCraft II neural parasite |

**Generator rules**

- Classes: Drone / support, Infantry. From T1. As: active, signature slot. Rarity: uncommon. Leans: Soviets.
- Needs: at most Small (size).
- Never with: at least 1 passenger seat(s).
- Sets first: Attach (delivery).
- Adds strength: While latched it is protected and keeps working until it is removed. *[Attach (delivery)]*
- Adds weakness: It has to reach touching distance, so it is exposed on the way in. *[Melee (range)]*
- Counters: Lone or slow vehicles without an escort or a cleanse are its prey. *[Tank / ground vehicle (class)]*
- Countered by: Sustained anti-infantry fire stops a fragile infester before it connects. *[Machine gun (weapon)]*
- Countered by: Repair tools pull the infester out of the host. *[Repair tool (weapon)]*
- Countered by: It can't latch onto aircraft in flight. *[Aircraft (class)]*
- Related: disable machine (planned) (combos with), hijack vehicle (planned) (often confused with).

**Open design questions**

- Should the infester sit inside the vehicle (untargetable, needs a cleanse or repair) or on top (teammates can shoot it off)?
- Should a cheap infester be able to kill a T3 vehicle at all, or only sabotage and mark it?
- How long should the victim's reaction window be? This needs playtesting.

<a id="leech-weapon-on-kill"></a>
### Leech the weapon of what you destroy (`leech-weapon-on-kill`)

*Category:* Conversion (also Weapon behaviour). *Also called:* weapon salvage, loot the kill, steal a weapon. *Shooter fit:* 4/5. *Confidence:* high. *Status:* accepted (review: unchecked).

**What it does.** A unit turns enemy losses into its own power. It first claims a donor: a tether held on the target, a finishing blow, or touching the wreck or a dropped item. When the donor dies, something moves to the claimer: a copy of the donor's weapon (so the reward depends on what was killed), a generic upgrade step, the donor's whole vehicle, or materials. The usual limits are one slot or a short ladder of upgrades, a short window to claim, and a vulnerable claiming state. It changes what a kill means: players pick targets by what they will get, and damaged players learn to back off before they become loot.

**Why it suits Shamble Frontlines.** Turns every kill into a loadout decision and rewards 'soften and claim' team play, but needs firm rules (tier scaling, no farming teammates) to avoid snowballing.

**Counterplay**

- Break the claim: leave tether range or break line of sight before you die, so the enemy gets nothing.
- Attack the claimer while it is busy: claiming usually silences its main gun and slows or roots it.
- Deny the leftovers: destroy wrecks, crates and dropped weapons, or reach them first.
- Bring units that give nothing useful, or nothing that fills the claimer's gap (for example no anti-air donors).
- Use aircraft against ground claimers that can't tether them.
- Use hard counters against the stolen weapon itself, such as point defence against salvaged rockets.

**Source units in the database:** Hammer Tank

**Other examples found (to be entered as source units during the research run)**

- *Command & Conquer: Generals / Zero Hour*, Salvage crates (GLA Technical, Marauder, Scorpion and others): Destroyed vehicles drop crates that only the leeching faction can see. Each compatible vehicle climbs a fixed two-step upgrade ladder, whatever the donor was; vehicles already at the top get a little cash and experience instead. (high; [Salvaging, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Salvaging), [Technical (Generals), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Technical_(Generals_1)), [Zero Hour units, CNCNZ](https://cncnz.com/games/zero-hour/kassads-units/))
- *Command & Conquer: Generals / Zero Hour*, Hijacker (GLA): The whole-vehicle version: an unarmed, stealthy soldier takes most enemy vehicles on contact and keeps their veterancy, and climbs out to steal another when the vehicle dies. (high; [Hijacker (Generals), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Hijacker_(Generals_1)))
- *Command & Conquer: Tiberian Sun*, Mutant Hijacker (Forgotten): A one-at-a-time commando that can steal any vehicle, even the heaviest walkers, and pops out to steal again when it is destroyed. (medium; [Mutant hijacker, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Mutant_hijacker))
- *Command & Conquer 3: Tiberium Wars / Kane's Wrath*, Avatar walker's commandeer, and walker husks (Nod): The Avatar rips modules off other vehicles, friendly ones included, destroying them, and mounts them on itself (a flamethrower, a cloak, a second beam). Heavy walkers leave husks that an engineer from either side can revive. (medium; [Avatar (Tiberium Wars), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Avatar_(Tiberium_Wars)), [Husk, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Husk))
- *Company of Heroes*, Dropped weapons and abandoned team weapons (all factions): Specialist weapons drop when their carrier dies and any squad can pick them up, enemies included; crew-served guns left without a crew can be manned by anyone. (medium; [Infantry weapons, Company of Heroes Wiki](https://companyofheroes.fandom.com/wiki/Infantry_Weapons), [Weapon team, Company of Heroes Wiki](https://companyofheroes.fandom.com/wiki/Weapon_Team))
- *Iron Harvest*, Infantry weapon kits: Picking up a kit converts a whole squad into that class, always in the picker's own faction version. Whether kits drop from killed enemies in the released game needs a second source. (low; [Weapon, Iron Harvest Wiki](https://iron-harvest.fandom.com/wiki/Weapon), [Iron Harvest early impressions, Wayward Strategy](https://waywardstrategy.com/2018/08/27/iron-harvest-early-impressions/))
- *Supreme Commander*, Reclaim: Wrecks are broken down into the economy's mass by builders and a few combat units: the loot-as-currency version. (medium; [Reclaim, Supreme Commander Wiki](https://supcom.fandom.com/wiki/Reclaim))

**Shooter analogues (where players already do this)**

- *Titanfall 2*, Battery theft: A pilot rips the battery out of an enemy Titan, which damages it, and carries it to a friendly Titan for a shield and health boost; the carrier drops it on death, so the enemy can chase it back. (medium; [Rodeo, Titanfall Wiki](https://titanfall.fandom.com/wiki/Rodeo), [Battery, Titanfall Wiki](https://titanfall.fandom.com/wiki/Battery))
- *Battlefield series*, Kit pickup: A killed player's kit can be picked up and used at once; dropped kits vanish after a short time. (medium; [Kit, Battlefield Wiki](https://battlefield.fandom.com/wiki/Kit))
- *Mega Man (classic series)*, Boss weapons: Beating a boss permanently gives its weapon, which runs on limited energy that must be refilled: the cleanest 'kill it, get its gun' with an ammo limit. (medium; [Special Weapon, Mega Man Knowledge Base](https://megaman.fandom.com/wiki/Special_Weapon))
- *ARC Raiders*, Salvaging machines: Destroyed machines drop power cells that recharge shields mid-fight and parts that become crafting material: kills pay out in resources rather than guns. (medium; [ARC, ARC Raiders Wiki](https://arc-raiders.fandom.com/wiki/ARC))
- *Halo series*, Vehicle hijacking: Throwing a driver out and taking the seat: the whole-vehicle version in a shooter. (medium; [Boarding (gameplay mechanic), Halopedia](https://www.halopedia.org/Boarding_(gameplay_mechanic)))

#### Translation to a player-controlled unit

A mid-tier vehicle with a main gun and a long-reach tether. Hold the tether on a target the team is killing; if it dies while tethered, whoever landed the kill, a copy of its weapon snaps onto your chassis.

**As the user**

- The choice is tether or shoot: while tethered your main gun is silent and you are slowed or rooted. Good players tether the target their team is already focusing.
- Target choice becomes a shopping list: hunt the enemy's anti-air vehicle to cover your weakness to aircraft, or a heavy tank for its cannon. Each target previews what it would give.
- The stolen weapon lasts for this life; on death it drops as a contested salvage crate instead of vanishing.
- A new claim asks whether to keep the current stolen weapon or swap; a deliberate hold-to-replace reads better than the RTS's locked slot.

**As the target**

- A tether on you is a countdown: if you die now, the enemy gets your gun. Get out of range, break line of sight, or burst the rooted claimer.
- Damaged vehicles near a leecher should retreat earlier: 'don't feed' becomes a skill.
- Seeing your own weapon on an enemy tank is readable and gives a revenge goal: kill it and the weapon drops as salvage.

**Teammates**

- Claim and finish: the leecher pings its tethered target and allies burst it, because the claim doesn't need the killing blow.
- Escort the leecher while it is rooted and its gun is quiet.
- The team decides which weapon to take, based on what the team lacks.
- Friendly donations are limited to wrecks or abandoned allied vehicles, to stop teammates farming each other.

**Controls (proposal)**

- Left mouse: main gun.
- Hold right mouse: tether to the vehicle under the cursor while in range and line of sight.
- Q or slot 2: fire the stolen weapon on its own trigger and cooldown (no hidden alternation with the main gun).
- Hold E for about a second: discard or replace the stolen weapon when a new claim would overwrite it.
- A context ping on the tethered target: 'leeching, finish it'.

**Readability cues**

- A thick beam in the leecher's team colour that pulses with the drain, and a hum that rises as the target's health drops.
- A ring and icon over the target that preview the weapon you would get.
- On a claim: a distinct sound, the weapon visibly snapping onto the chassis, and the donor's icon in the HUD slot.
- On the target: a red edge vignette and a 'leeched' warning with an arrow to the source.
- Each stolen weapon class has an oversized, distinct attachment model readable from above; claimable wrecks glow and show a despawn ring.

**What changes from the RTS**

- Map the donor table to units players can actually buy; RA3's naval and epic donors don't exist here.
- Replace RA3's random pick between several leechers with a visible rule, such as first to latch.
- Forbid leeching your own living teammates, which invites farming; allow only enemies and abandoned or wrecked allies.
- Scale stolen weapons to the leecher's tier so a T2 can't carry a T3 gun at full power.
- Give the stolen weapon its own trigger instead of RA3's hidden one-weapon-at-a-time alternation.
- Full rooting while leeching may be too punishing in a twitch shooter; consider a heavy slow and a turret lock instead.
- Decide what happens to a stolen weapon on death and respawn.

**Team-play potential: high.** Hooks: Setup and finisher, Share the spoils, Needs an escort, Counter-pick. The claim-at-death rule rewards coordination directly: one player claims, others finish. The enemy has to coordinate its retreats and deny wrecks.

**Build difficulty: medium.**

- A generic upgrade ladder is cheap: one upgrade track per eligible unit and a pickup.
- The donor-specific version needs a donor-to-weapon table plus sockets, models and effects for every stolen weapon on every leecher; content grows with donors times leechers.
- The claim at the moment of death must be decided by the server; ties and latency create disputes.
- A tether weapon needs range and line-of-sight checks, slow or root states, drain and heal ticks, and break rules.
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

| Variant | From spice | What changes | Seen in |
|---|---|---|---|
| Tether at death (`tether-claim`) | 1 | Hold a beam on the target; whoever is tethered when it dies gets the reward, whoever landed the kill. | RA3 Hammer Tank |
| Donor copy (`donor-copy`) | 1 | The gained weapon is a scaled-down copy of the donor's own weapon, so the enemy roster becomes a loot table. | RA3 Hammer Tank, Mega Man |
| Upgrade ladder (`upgrade-ladder`) | 1 | Every claim moves the unit one step up a fixed ladder, whatever the donor was; extra claims become cash or experience. Easier to read and balance. | Generals salvage crates |
| Wreck crate race (`wreck-crate`) | 2 | A kill drops a pickup that the first unit to touch claims, before it decays; enemies can grab or destroy it first. | Generals salvage, Battlefield kits, Company of Heroes dropped weapons |
| Kit swap (`kit-swap`) | 2 | A pickup replaces the whole loadout or class instead of adding a weapon. | Iron Harvest kits, Battlefield kits |
| Loot as currency (`loot-currency`) | 2 | Wrecks pay out in resources or crafting material rather than direct power. | Supreme Commander reclaim, ARC Raiders salvage |
| Limited-ammo copy (`limited-copy`) | 2 | The gained weapon runs on limited energy or ammo and fades when it runs dry. | Mega Man |
| Live extraction (`live-extraction`) | 3 | Rip a consumable out of a living target, damaging it, and carry it to yourself or an ally; the carrier drops it on death. | Titanfall 2 batteries |
| Revive the husk (`revive-husk`) | 3 | Heavy units leave a fragile wreck that an engineer from either side can bring back for their own team at reduced health. | Tiberium Wars husks |
| Cannibalize allies (`cannibalize-allies`) | 4 | Takes modules from friendly units too, destroying them, trading team strength for one strong unit. | Tiberium Wars Avatar |
| Whole-vehicle steal (`whole-chassis`) | 4 | Takes the vehicle itself rather than a part; the thief climbs out when it is destroyed and can try again. | Generals and Tiberian Sun hijackers, Halo boarding |

**Generator rules**

- Classes: Tank / ground vehicle, Walker / mech, Hovercraft. From T2. As: toggle / mode switch, channel, triggered, signature slot. Rarity: uncommon. Leans: Soviets.
- Sets first: Adaptive (weapon).
- Adds strength: Gains a weapon from kills that can cover its own gaps. *[Adaptive (weapon)]*
- Adds weakness: Starts each life without its best weapon, and a poor claim can fill the slot. *[Adaptive (weapon)]*
- Counters: Every vehicle it helps kill can arm it. *[Tank / ground vehicle (class)]*
- Countered by: Ground claimers usually can't tether aircraft and have no anti-air until they steal it. *[Aircraft (class)]*
- Countered by: Fast targets leave tether range before they die. *[at least Fast (speed)]*
- Countered by: Punishes it while it is busy claiming. *[Anti-armour (role)]*
- Related: drain health (planned) (combos with), hijack vehicle (planned) (often confused with), switch weapon mode (planned) (combos with).

**Open design questions**

- What happens to a stolen weapon on death: lost, dropped as salvage, or kept until the round resets?
- Should the slot lock once filled (as in RA3), be replaceable, or run on limited ammo?
- Should leeching be one faction's signature (the Soviets, in RA3's spirit) or shared by all factions?
- In a multi-seat vehicle, who controls the stolen weapon and the tether?

<a id="passenger-sets-weapon"></a>
### A weapon that changes with the passenger (`passenger-sets-weapon`)

*Category:* Transport and garrison (also Weapon behaviour). *Also called:* passenger-defined armament, multigunner, fire ports. *Shooter fit:* 5/5. *Confidence:* high. *Status:* accepted (review: unchecked).

**What it does.** A vehicle whose weapon, or whole job, comes from whoever is inside. Empty, it has a modest default weapon. When someone boards, either the vehicle swaps its weapon for a vehicle-sized version of the passenger's specialty (a gun, a launcher or a tool such as a repair beam), or the passengers fight out of firing ports with their own weapons. One chassis becomes anti-air, anti-armour, anti-infantry or support depending on who rides it, so the composition choice moves from the factory to the battlefield. The design levers: how many seats count, whether the passenger weapon replaces or adds to the default, who aims it, whose upgrades apply, whether the vehicle must deploy first, how long a swap takes, and what happens to passengers when the vehicle dies.

**Why it suits Shamble Frontlines.** A built-in two-player combo that uses the seat systems team shooters already have (Battlefield, PlanetSide, Halo) and gives cheap infantry a job all game.

**Counterplay**

- Read the loadout from the roof weapon, then fight it with what that loadout lacks; a passenger without anti-air removes the vehicle's anti-air.
- Burst the light chassis: one kill can take out two players.
- Out-range firing-port vehicles, whose reach is capped by the infantry inside.
- Target the crew rather than the hull: crew-killing shots force passengers out or leave the vehicle open to capture.
- Punish the swap: hit infantry while they board or leave, and the vehicle during the swap delay.
- Catch deploy-to-fire carriers while they move, and attack fixed firing ports from their blind side.

**Source units in the database:** Multigunner IFV

**Other examples found (to be entered as source units during the research run)**

- *Command & Conquer: Red Alert 2 / Yuri's Revenge*, IFV (Allies): The original: one infantry passenger picks the weapon pod (machine gun, repair crane, sniper rifle, tesla, psychic blast, suicide bomb and more). Only the vehicle's own rank counts, and an elite IFV is very strong. (high; [Infantry Fighting Vehicle, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Infantry_Fighting_Vehicle), [Red Alert 2 Allied units, CNCNZ](https://cncnz.com/games/red-alert-2/allied-units/))
- *Command & Conquer: Red Alert 2 - Yuri's Revenge*, Battle Fortress (Allies) and Tank Bunker (Yuri): A heavy carrier whose five passengers fire their own weapons out of gun ports with a range and damage bonus, so the loadout defines the vehicle. The Tank Bunker inverts it: a vehicle parks inside a bunker and fights with its own weapon, boosted. (high; [Battle Fortress, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Battle_Fortress), [Tank bunker, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Tank_bunker))
- *Command & Conquer: Generals / Zero Hour*, Battle Bus (GLA), Humvee and Combat Chinook (USA): The bus has no weapon of its own: its damage and range are whatever the passengers bring. When first destroyed it becomes an immobile bunker whose wounded passengers keep fighting. (medium; [Battle bus (Zero Hour), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Battle_bus_(Zero_Hour)), [Humvee (Generals), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Humvee_(Generals)))
- *Command & Conquer: Generals / Zero Hour*, Overlord battle bunker and Helix bunker (China): A one-time add-on choice: a bunker that lets five infantry fire from the tank or helicopter, instead of a gatling cannon or a propaganda tower. (medium; [Overlord tank (Generals), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Overlord_tank_(Generals_1)), [Helix (Zero Hour), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Helix_(Zero_Hour)))
- *Command & Conquer 3: Kane's Wrath*, Reckoner (Nod): An unarmed carrier whose squads can't fire while it moves; it deploys into a static bunker (or does so automatically when about to die) and then they can. (medium; [Reckoner (Kane's Wrath), Command & Conquer Wiki](https://cnc.fandom.com/wiki/Reckoner_(Kane's_Wrath)))
- *Company of Heroes 2*, M5 half-track and similar open-topped carriers: Squads fire out of open-topped half-tracks while protected; the British Kangaroo carries fifteen but only six can fire, so firepower is capped by ports, not capacity. (medium; [M5 Half-Track Transport, Company of Heroes Wiki](https://companyofheroes.fandom.com/wiki/M5_Half-Track_Transport), [Kangaroo Carrier, Company of Heroes Wiki](https://companyofheroes.fandom.com/wiki/Kangaroo_Carrier))
- *Command & Conquer: Red Alert 3*, Bullfrog (Soviets): The passengers are the ammunition: its only exit is a man-cannon that fires them over obstacles, and they parachute down, exposed to anti-air. (medium; [Bullfrog, Command & Conquer Wiki](https://cnc.fandom.com/wiki/Bullfrog))

**Shooter analogues (where players already do this)**

- *Battlefield 3 / Battlefield 4*, Scout helicopter side benches: Passengers on the benches keep their own kit, so the helicopter's extra firepower depends on who sits there: rockets, repair tools, mines. (medium; [AH-6 Little Bird, Battlefield Wiki](https://battlefield.fandom.com/wiki/AH-6_Little_Bird))
- *PlanetSide 2*, Harasser rumble seat: A three-seat buggy whose rear rider fights with their own loadout, so the third gun depends on who climbs on; the seat is exposed. (medium; [Harasser, PlanetSide Wiki](https://planetside.fandom.com/wiki/Harasser/Main))
- *Halo series*, Warthog passenger seat: Driver, mounted gunner and a passenger who fires their own carried weapon; a rocket-carrying passenger turns it into an anti-vehicle car. (medium; [M12 Force Application Vehicle, Halo Wiki](https://halo.fandom.com/wiki/M12_Force_Application_Vehicle))
- *Foxhole*, Crewed tank seats: Each seat owns a weapon or job (driver, gunners, commander), so firepower depends on how many seats are filled and by whom. (medium; [Battle Tank, Foxhole Wiki](https://foxhole.fandom.com/wiki/Battle_Tank))

#### Translation to a player-controlled unit

A cheap, fast two-seat car. Alone, the driver has a modest default weapon. When a teammate climbs in, the roof weapon becomes a vehicle-sized version of their class weapon or tool, and they aim it.

**As the user**

- As the driver you buy a cheap, fast chassis with a narrow but useful default weapon, so you aren't useless alone.
- Your power spikes when a teammate climbs into the specialist seat: their class decides whether you become anti-armour, anti-infantry, anti-air or a repair platform. You pick up whoever answers the threat in front of you.
- The driver's skill is positioning: kiting, flanking, and keeping the gunner's arc on target.
- As the passenger you trade your fragile body for speed, armour and an amplified version of your class weapon, which you aim yourself; the risk is sharing the vehicle's fate.

**As the target**

- Check the roof weapon, the colour of its shots and the loadout icon before committing, then fight it with what it lacks.
- It is a high-value, fragile target: burst damage on the light hull can take out two players, and a repair-loaded one keeps their tanks alive.
- Watch for swaps: boarding, leaving and the swap delay are when it is weakest and when its threat is about to change.
- If it shows a loadout without anti-air, your aircraft can engage it freely.

**Teammates**

- A built-in two-player combo: 'need a ride' and 'need anti-tank' calls, and in-field counter-picking without re-buying.
- An engineer passenger makes it a mobile repair station that also strips parasites off vehicles, a natural answer to infesters.
- Squads rotate specialists through one car as the enemy changes: anti-air when aircraft appear, anti-tank when armour pushes.
- Kill credit and score go to both driver and passenger.

**Controls (proposal)**

- Interact enters the nearest free seat; number keys switch seats; the passenger can always leave at once.
- Driver: WASD to move; left mouse fires the default weapon only while the specialist seat is empty; a key evacuates the passenger on a cooldown; a toggle locks the seat.
- Passenger: mouse aims the roof weapon, left mouse fires, right mouse or Q uses the vehicle-sized class ability (for example a repair beam or a stun).
- A ping wheel with 'request ride' and 'request specialist'.

**Readability cues**

- A distinct roof weapon model for each weapon family, readable from above, plus colour-coded shots and a family icon on the nameplate.
- A short, visible and audible swap animation, so enemies see the loadout change.
- An empty-seat marker for allies, and the passenger's class icon for everyone.
- The driver's HUD shows the passenger's class and health; the passenger's HUD shows the hull's health, the weapon's ammo or heat, its firing arc and the shared-fate rule.
- Kill feed lists both driver and passenger with the loadout icon.

**What changes from the RTS**

- Passengers are people, not switches: they must aim the weapon or use the tool themselves, or nobody will ride.
- Collapse RA3's twenty-odd per-soldier results into a handful of weapon families that enemies can learn from above.
- Swaps need a time cost (boarding delay, re-entry cooldown), or the vehicle always has the perfect answer.
- Revisit the death rule: RA3 kills the passenger with the car, a double penalty on two people. Eject them hurt instead, or keep it and make the fragility very visible.
- The empty vehicle must be playable alone, since one player is the whole unit.
- Anti-grief rules: passengers can always leave, drivers can lock seats or evict on a cooldown.

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
- Whether killing the vehicle also kills the passenger must be clear to everyone.

**Variants the generator can roll**

| Variant | From spice | What changes | Seen in |
|---|---|---|---|
| Class swap (`class-swap`) | 1 | One specialist seat: the passenger's class replaces the default weapon with a vehicle-sized version of its own; empty, the default returns. | Red Alert 2 and 3 IFVs |
| Tool seat (`tool-seat`) | 1 | Some passengers give a tool instead of a gun: a repair beam that also strips parasites, a stun horn, a heal aura or a detector. | IFV with an engineer, dog or bear |
| Fire ports (`fire-ports`) | 1 | Passengers shoot their own weapons out of ports, possibly with a bonus; the vehicle's output is the sum of who is aboard. | Battle Fortress, Battle Bus, half-tracks, Warthog |
| Crewed hardpoints (`crewed-hardpoints`) | 1 | Each seat owns a fixed weapon or job; firepower depends on how many seats are filled and by whom. | Battlefield, PlanetSide 2, Foxhole |
| Shared fate (`shared-fate`) | 2 | A choice of what boarding risks: passengers die with the vehicle, are thrown out hurt, or walk out unharmed. | RA3 IFV, Battle Bus, Battle Fortress |
| Modular bay (`modular-bay`) | 2 | A one-time purchase decides whether a slot is a passenger bunker or a fixed weapon or aura; the options exclude each other. | Overlord and Helix add-ons |
| Anchor to fire (`anchor-to-fire`) | 3 | Passengers can only shoot once the vehicle deploys into a static bunker, trading mobility for firepower. | Kane's Wrath Reckoner |
| Wreck bunker (`wreck-bunker`) | 3 | When the vehicle is destroyed it leaves an immobile bunker from which the hurt passengers keep fighting. | Zero Hour Battle Bus |
| Human ammunition (`human-ammunition`) | 4 | The passengers are the payload: the vehicle launches them over obstacles into the fight, briefly exposed in the air. | RA3 Bullfrog |
| Vehicle as passenger (`vehicle-as-passenger`) | 4 | A bigger host takes a smaller vehicle inside and fires its weapon with a boost while the small one can't move. | Yuri's Revenge tank bunker |
| Cross-faction hybrids (`cross-faction`) | 5 | A passenger from another faction produces its own distinct result, so captured or allied troops unlock hybrid weapons. | RA3 IFV result tables for all three factions |

**Generator rules**

- Classes: Tank / ground vehicle, Hovercraft, Walker / mech, Aircraft. From T1. As: passive, signature slot. Rarity: uncommon. Leans: Allies.
- Needs: at least 1 passenger seat(s).
- Never with: at most Small (size).
- Adds strength: Changes role mid-match depending on who climbs in. *[at least 1 passenger seat(s)]*
- Adds weakness: Alone it has only a modest default weapon, and losing the vehicle can hurt two players. *[at least 1 passenger seat(s)]*
- Counters: Brings whichever amplified class weapon the fight needs to soldiers who can't outrun it. *[Infantry (class)]*
- Countered by: Its light hull falls fast to anti-armour, often taking the passenger with it. *[Anti-armour (role)]*
- Countered by: Splash and burst damage can take out two players in one vehicle. *[Splash (weapon trait)]*
- Related: switch weapon mode (planned) (often confused with), Infest a vehicle (counters).

**Open design questions**

- Can players of different factions be on one team? If so, cross-faction results become a real feature.
- Who aims the passenger weapon, the driver or the passenger? (Recommended: the passenger.)
- What happens to the passenger when the vehicle dies: killed, thrown out hurt, or unharmed?
- Whose upgrades power the weapon: the vehicle's, the passenger's, or both?

<a id="example-card"></a>
## Example concept card (hand-made)

A hand-written illustration of the card format, not generator output. It recombines the *infest a vehicle* pattern (tracker variant) into a new class and faction.

### Rime Burr

> A tiny Allied hover-drone that latches onto enemy vehicles, frosts them and paints them for the whole team.

| Field | Value |
|---|---|
| Class / tier / flavour | Drone / support / T1 / Allies |
| Role | Scout / recon; secondary: Disabler / control |
| Mobility | Hover, drift, fast |
| Body | Micro-bot, tiny |
| Primary | Melee weapon (melee, attach, melee range; hits ground vehicles; mark) |
| Secondary | Cryo (cryo, beam, medium range; hits infantry, ground vehicles; slow) |
| Armour | Light, charged shield |
| Crew | Solo |
| Signature | **Frost Tag**: Latch onto a vehicle: while attached, the host is slowed and visible to your team through walls. *(pattern: Infest a vehicle, variant tracker; short cooldown)* |
| Team-play hook | Tag the tank, and your rocket teammates lock on to it. *(Spotter)* |
| Strengths | Once latched it is hard to shake off, and the whole team can see the host. The hover frame reaches vehicles quickly and slips away again. |
| Weaknesses | It has to touch the vehicle, so it is exposed on the way in. A light frame: once its charged shield is gone, one burst ends it. |
| Countered by | Sustained fire stops it before it reaches the hull. A repair beam pulls it off the host. EMP drops its shield and knocks it off. |
| Counters | A tagged vehicle gets focused by the whole team. |
| How it plays | **As the user:** Skim in fast, pounce on a vehicle and ride it while your team focuses it. Hop off before the crew shakes you loose, or freeze infantry that come to help. **As the target:** A pale glint lands on your hull and your vehicle shows up for the enemy. Hold E to shake it off, drive to a repair pad, or get out of the launchers' sight. **Teammates:** Rocket and missile players get free locks on the tagged vehicle; a repair player is the host's best friend. |
| Controls | LMB: Pounce and latch (Frost Tag); RMB: Cryo beam: slows infantry and vehicles; Space: Leap off |
| Tells | A pale blue glint and crackle on the hull, and a frost icon over the tagged vehicle that everyone can see. |
| Inspiration | Infest a vehicle; Terror Drone |
| Balance hints | cost low, power 4/10, complexity 3/10, 2 keys (T1 allows 2), no flags |
| Seed | `example-rime-burr` at spice 2 |

