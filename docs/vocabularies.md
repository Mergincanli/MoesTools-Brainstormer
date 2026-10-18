<!-- Generated from the JSON in data/ and schemas/. Edit the JSON, not this file. -->

# Vocabularies (draft v0.3.0)

Fixed word lists. Every source unit, pattern and generated card may only use these terms, and the validator rejects anything else. Ids (in `code`) are what the data stores; labels are what the app shows.

- **Core** lists are the ten the brief asks for. **Supporting** lists make them usable: scales, aim, traits, seats and so on.
- **Rules** say which terms can go together. They bind generated cards (so the generator can't roll tracks on an aircraft). Real units that break them are recorded as they are and listed as 'atypical'. Real games breaking our rules is useful spice material, and evidence for relaxing a rule.
- **Rarity** feeds the spice control: common terms appear at every spice level, rare ones only when spice is turned up.
- **Typed links** such as 'at most Small (size)' or 'can hit aircraft' point at other terms; see [fields](fields.md).

37 lists, 299 terms.

## Contents

**Core:** [Unit classes](#classes) (7) · [Tier bands](#tiers) (3) · [Faction flavours](#faction-flavours) (3) · [Roles](#roles) (16) · [Mobility types](#mobility) (12) · [Body plans](#bodies) (18) · [Weapon families](#weapon-families) (32) · [Damage types](#damage-types) (13) · [Armour classes](#armour-classes) (5) · [Crew models](#crew-models) (5)

**Supporting:** [Ability kinds](#ability-kinds) (7) · [Ability sources](#ability-sources) (5) · [Aim / mount](#aim-models) (6) · [Armour models](#armour-models) (15) · [Availability](#availability) (3) · [Balance flags](#balance-flags) (9) · [Confidence levels](#confidence) (3) · [Cooldown bands](#cooldown-bands) (5) · [Cost bands](#cost-bands) (5) · [Handling](#handling) (5) · [Mobility traits](#mobility-traits) (9) · [Nature](#nature) (3) · [On death](#on-death) (5) · [Pattern categories](#pattern-categories) (13) · [Range bands](#range-bands) (5) · [Rarity](#rarity) (3) · [Ratings](#ratings) (3) · [Resources](#resources) (5) · [Seat roles](#seat-roles) (6) · [Sizes](#sizes) (5) · [Solo fallback](#solo-fallback) (4) · [Source kinds](#source-kinds) (6) · [Speed bands](#speed-bands) (5) · [Target types](#target-types) (5) · [Team-play hooks](#team-play-hooks) (13) · [Weapon delivery](#weapon-delivery) (10) · [Weapon traits](#weapon-traits) (22)

## Core vocabularies

<a id="classes"></a>
### Unit classes (`classes`)

What kind of body the player controls. The six generator classes come from the brief; 'naval' is kept for research only.

| Id | Label | Meaning | Rarity |
|---|---|---|---|
| `infantry` | Infantry | A soldier on foot, from rifleman to power-suit trooper or war animal. Small hitbox, uses cover, can enter vehicles and buildings. | common |
| `vehicle` | Tank / ground vehicle | A wheeled or tracked ground vehicle: buggies, tanks, IFVs and APCs, artillery. This is the brief's 'tank' class, widened so IFVs and buggies fit. Also called: tank. | common |
| `walker` | Walker / mech | A vehicle on legs, from a nimble scout walker to a towering assault mech. Steps over low obstacles and has a strong silhouette. Also called: mech. | common |
| `hover` | Hovercraft | Rides on an air cushion or anti-grav field, so it crosses land and water. Slides and drifts when it turns. | uncommon |
| `aircraft` | Aircraft | A crewed flyer: helicopter, VTOL, jet or airship. Ignores ground obstacles; a top-down view needs a clear height cue such as a shadow. | common |
| `drone` | Drone / support | A small uncrewed machine or support device: attack, scout and repair drones and deployable gadgets. Usually fast and fragile; the player is the machine. *Note:* Only for uncrewed units of tiny or small size; bigger robots are classed by how they move. Support is a role, not a class: a repair truck is a vehicle with the support role. | uncommon |
| `naval` | Naval (research only) | Ships and submarines. Recorded only when they teach a mechanic, such as submerging. The generator never rolls this class. *(research only)* |  |

<a id="tiers"></a>
### Tier bands (`tiers`)

How early, cheap and complex a unit is. Tiers cap the number of keys: every button except primary fire and movement (secondary weapon, active abilities, toggles, deploys, key-bound movement, ultimate). The cap is a maximum, not a target, and counts innate abilities only. For source units the tier comes from tech gating alone; games without tech tiers record none. Some games use 'tier' for upgraded versions of the same vehicle (Foxhole, Halo Wars): record those as upgrades, not tiers.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `t1` | T1 | Early: cheap, available from the start, simple and readable. | max 2 keys, 1 passive, 3 keys per seat; source rule: Built from a basic production building with no extra tech. |
| `t2` | T2 | Mid: needs one tech step; stronger or more specialised. | max 3 keys, 1 passive, 3 keys per seat; source rule: Needs one tech building or upgrade beyond the basics. |
| `t3` | T3 | Late: top tech, elites and super-heavies. May carry an ultimate. | max 4 keys, 1 passive, 3 keys per seat; source rule: Needs top-level tech. |

<a id="faction-flavours"></a>
### Faction flavours (`faction-flavours`)

Generic faction identities in Red Alert 3's spirit. A flavour makes its favoured parts three times as likely and holds back its avoided parts until spice 3.

#### Soviets (`soviet`): Heavy, brute force, electric weapons.

- **Themes:** mass and armour; tesla and electric weapons; magnetism; industrial salvage and recycling; cheap numbers and crude reliability; big walkers and airships.
- **Favoured weapon families:** Tesla / electric, Cannon, Flak, Flamethrower, Machine gun, Magnetic, Drain beam.
- **Favoured damage types:** Electric, Armour-piercing, Explosive, Fire.
- **Favoured mobility types:** Tracks, Two legs, Many legs, Airship.
- **Favoured mobility traits:** Crush, Leap, Amphibious.
- **Favoured body plans:** Hull with turret, Multi-turret giant, Reverse-joint walker, Gas envelope, Spider frame.
- **Favoured sizes:** Large, Huge.
- **Favoured speed bands:** Slow, Medium.
- **Favoured armour classes:** Heavy, Super-heavy.
- **Favoured armour models:** Damage reduction, Ablative plates, Directional armour.
- **Favoured crew models:** Driver + gunner, Driver + gunner + commander.
- **Favoured aim / mount:** Slow turret, Free aim.
- **Favoured roles:** Frontline assault, Anti-armour, Artillery / siege, Infiltrator / saboteur.
- **Favoured team-play hooks:** Protector, Needs an escort, Swarm.
- **Held back until spice 3 (mobility traits):** Teleport.
- **Held back until spice 3 (armour models):** Recharging shield, Charged shield.
- **Name style:** Blunt, heavy words: tools, weather, beasts, numbers. Short and loud.

#### Allies (`allied`): High-tech, precise, freezing and prism weapons.

- **Themes:** precision and lock-on; freeze-and-shatter; prism light that splits; time and space tricks; stealth and disguise; adaptable multi-role kit; air power and shields.
- **Favoured weapon families:** Prism, Laser, Cryo, Guided missiles, Sniper, Autocannon, Sonic.
- **Favoured damage types:** Energy, Cryo, Armour-piercing, Sonic.
- **Favoured mobility types:** Wheels, Hover, Jet, Hovering flight.
- **Favoured mobility traits:** Teleport, Amphibious, Boost.
- **Favoured body plans:** Hull with turret, Troop carrier, Fixed-wing, Rotorcraft.
- **Favoured sizes:** Medium, Large.
- **Favoured speed bands:** Medium, Fast.
- **Favoured armour classes:** Light, Medium.
- **Favoured armour models:** Recharging shield, Charged shield.
- **Favoured crew models:** Solo, Driver + gunner.
- **Favoured weapon delivery:** Lock-on, Beam, Hitscan.
- **Favoured roles:** Disabler / control, Support, Anti-air, Scout / recon, Transport.
- **Favoured team-play hooks:** Setup and finisher, Seat synergy, Spotter.
- **Held back until spice 3 (mobility traits):** Crush.
- **Held back until spice 3 (weapon families):** Drain beam, Chemical / radiation.
- **Name style:** Clean, technical words: light, sky and cold imagery, short codes with a number.

#### Empire (`empire`): Agile, transforming, blades and nano-tech.

- **Themes:** transformation; blades and close duels; nano-tech that builds, repairs and swarms; charged energy waves; psionics; kamikaze drones; speed and discipline.
- **Favoured weapon families:** Melee weapon, Plasma / energy bolt, Nanites, EMP, Psionic, Guided missiles, Drone launcher.
- **Favoured damage types:** Melee, Energy, EMP, Psionic.
- **Favoured mobility types:** Hover, Two legs, Jet, Hovering flight.
- **Favoured mobility traits:** Transform, Leap, Boost, Amphibious.
- **Favoured body plans:** Humanoid mech, Power suit, Disc, Spider frame.
- **Favoured sizes:** Small, Medium.
- **Favoured speed bands:** Fast, Very fast.
- **Favoured armour classes:** Light, Medium.
- **Favoured armour models:** Evasive, Self-repair.
- **Favoured crew models:** Solo.
- **Favoured weapon delivery:** Melee, Attach, Beam, Ram / kamikaze.
- **Favoured roles:** Raider / flanker, Disabler / control, Infiltrator / saboteur.
- **Favoured team-play hooks:** Swarm, Bait and trap, Setup and finisher.
- **Held back until spice 3 (body plans):** Multi-turret giant.
- **Held back until spice 3 (sizes):** Huge.
- **Held back until spice 3 (armour models):** Damage reduction.
- **Name style:** Nature, animal and weather imagery and virtues; elegant two-part names.

<a id="roles"></a>
### Roles (`roles`)

What the unit is for: its job or target, never its mechanic (mechanics are patterns). A card has one primary role and up to two secondary roles. 'Requires' says what a unit needs before it can claim the role. Tie-breaks: use anti-X as the primary only if the game gives a bonus against X or calls the unit that; generalists are assault. Damage first is a raider, information first is a scout. A disabler acts on units, area denial acts on ground.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `assault` | Frontline assault | Leads pushes, soaks damage and brawls at short to medium range. |  |
| `anti-armour` | Anti-armour | Kills vehicles and mechs. | needs Armour-piercing (damage) or Energy (damage) or Electric (damage) or EMP (damage) or infest vehicle (planned pattern) |
| `anti-infantry` | Anti-infantry | Clears soldiers and light targets. |  |
| `anti-air` | Anti-air | Brings down aircraft and drones. | needs can hit aircraft |
| `siege` | Artillery / siege | Hits from very far or over cover; breaks defences and structures. | needs Lobbed (delivery) or at least Long (range) |
| `marksman` | Marksman / overwatch | Holds long sightlines and picks off targets with precise shots. | needs at least Long (range) |
| `scout` | Scout / recon | Finds, spots and marks enemies; usually fast and fragile. | needs at least Fast (speed) or Stealth and deception (pattern category) or Mark (weapon trait) |
| `support` | Support | Heals, repairs or resupplies teammates. | needs Repair tool (weapon) or Support (pattern category) |
| `transport` | Transport | Carries teammates around the map. | classes: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; needs at least 2 passenger seat(s) |
| `infiltrator` | Infiltrator / saboteur | Acts inside enemy units, lines or buildings: sabotage, steal, capture. |  |
| `disabler` | Disabler / control | Stops enemies from acting: stun, root, silence, freeze, slow. | needs Stun (weapon trait) or Root / pin (weapon trait) or Silence / disarm (weapon trait) or Slow (weapon trait) or Cryo (damage) or EMP (damage) or Control (pattern category) |
| `raider` | Raider / flanker | Hits and runs, picking off isolated targets. | needs at least Fast (speed) |
| `area-denial` | Area denial | Controls ground with mines, fire, turrets or fortifications. | needs Lingering zone (weapon trait) or Area (pattern category) or Summon (pattern category) |
| `buffer` | Buffer / aura | Boosts nearby allies with auras, call-ins or team abilities (spotting belongs to scout). |  |
| `engineer` | Engineer / builder | Builds, captures or deploys structures and gadgets. |  |
| `logistics` | Logistics | Earns, carries or delivers resources for the team: harvesting, salvage, supply runs. |  |

<a id="mobility"></a>
### Mobility types (`mobility`)

How the unit moves. Each type lists the classes that may use it (this is how 'aircraft don't get tracks' is enforced), its default handling, the speeds that make sense, and what kind of target it is.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `foot` | On foot | Walks and runs. Can take cover and enter buildings and vehicles. | classes: Infantry; handling: strafe; counts as: infantry; only with speed bands: Slow, Medium, Fast | common |
| `jetpack` | Jetpack / wings | Personal flight at low height on a jetpack or wings. Hops over walls and hovers; counts as airborne while flying. | classes: Infantry; handling: strafe; counts as: aircraft; only with speed bands: Medium, Fast | uncommon |
| `wheels` | Wheels | Fast on roads and open ground, turns in arcs, struggles on rough terrain. | classes: Tank / ground vehicle, Drone / support; handling: steer; counts as: ground vehicles; only with speed bands: Medium, Fast, Very fast | common |
| `tracks` | Tracks | Slower, but turns on the spot and handles rough ground. | classes: Tank / ground vehicle, Drone / support; handling: pivot (tank controls); counts as: ground vehicles; only with speed bands: Very slow, Slow, Medium, Fast | common |
| `legs-biped` | Two legs | Walks on two legs, stepping over low walls and swaying as it moves. Small ones are nimble; big ones are slow and imposing. | classes: Walker / mech; handling: pivot (tank controls); counts as: ground vehicles; only with speed bands: Very slow, Slow, Medium, Fast | common |
| `legs-multi` | Many legs | Three or more legs, like a spider or a four-legged walker. Stable, scuttles over rubble and can straddle obstacles. | classes: Walker / mech, Drone / support; handling: pivot (tank controls); counts as: ground vehicles; only with speed bands: Slow, Medium, Fast, Very fast | uncommon |
| `hover` | Hover | Air cushion or anti-grav. Crosses land and water, drifts in turns, avoids steep slopes. *Note:* Only for ground-level skimmers. If only anti-air can hit it and it flies over cliffs, use hovering flight instead. | classes: Hovercraft, Drone / support; handling: drift; counts as: ground vehicles; only with speed bands: Medium, Fast, Very fast | common |
| `rotor` | Hovering flight | Rotor, VTOL or anti-grav flight. Can hover in place and strafe; flies low enough for most anti-air and some ground weapons to hit it. | classes: Aircraft, Drone / support; handling: strafe; counts as: aircraft; only with speed bands: Medium, Fast, Very fast | common |
| `jet` | Jet | Fixed-wing flight. Very fast, must keep moving and attacks in passes. | classes: Aircraft; handling: forward only; counts as: aircraft; only with speed bands: Fast, Very fast | uncommon |
| `airship` | Airship | Lighter-than-air flight. Very slow and very tough; a looming, visible threat. | classes: Aircraft; handling: drift; counts as: aircraft; only with speed bands: Very slow, Slow; from T3 | rare |
| `naval-surface` | Ship hull | Floats on the water surface. Research only. *(research only)* | classes: Naval (research only); counts as: naval |  |
| `naval-submerged` | Submarine | Moves underwater, surfacing to attack or be seen. Research only. *(research only)* | classes: Naval (research only); counts as: naval |  |

<a id="bodies"></a>
### Body plans (`bodies`)

The unit's upper-body shape and silhouette (legs and wheels live in mobility, scale in size). Each body lists the mobility types and sizes it fits and how its weapons can be mounted. A transforming unit records its second form's body in its modes.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `humanoid` | Humanoid | A soldier or hero on two feet. | classes: Infantry; only with mobility types: On foot, Jetpack / wings; only with sizes: Small; only with aim / mount: Free aim, Body aim, Radial | common |
| `power-suit` | Power suit | An armoured exosuit, bigger than a soldier. At small size it is infantry; at medium size or bigger it is a walker. | classes: Infantry, Walker / mech; only with mobility types: On foot, Jetpack / wings, Two legs; only with sizes: Small, Medium | uncommon |
| `beast` | Creature | A war animal or creature of any size, from an attack dog to a giant beast. | classes: Infantry, Walker / mech, Aircraft; only with mobility types: On foot, Two legs, Many legs, Hovering flight; only with aim / mount: Free aim, Body aim, Radial | rare |
| `hull-turret` | Hull with turret | A chassis with a rotating turret: the classic tank shape, also on legs. | classes: Tank / ground vehicle, Hovercraft, Walker / mech; only with mobility types: Wheels, Tracks, Hover, Many legs; only with sizes: Medium, Large, Huge; only with aim / mount: Free aim, Slow turret, Auto-target | common |
| `casemate` | Fixed-gun hull | A chassis with a forward-fixed gun and no turret, like a tank destroyer. | classes: Tank / ground vehicle, Hovercraft; only with mobility types: Wheels, Tracks, Hover; only with sizes: Medium, Large; only with aim / mount: Body aim, Limited arc | uncommon |
| `open-mount` | Open mount | An open-topped vehicle with an exposed weapon mount and crew, like a gun truck or buggy. | classes: Tank / ground vehicle, Hovercraft; only with mobility types: Wheels, Tracks, Hover; only with sizes: Medium; only with aim / mount: Free aim, Limited arc | common |
| `box-carrier` | Troop carrier | An enclosed, turretless hull with a passenger compartment (a remote weapon mount is fine): APC or IFV. | classes: Tank / ground vehicle, Hovercraft; only with mobility types: Wheels, Tracks, Hover; only with sizes: Medium, Large | common |
| `multi-turret` | Multi-turret giant | A very large chassis with two or more independently turning turrets, like a super-heavy tank. | classes: Tank / ground vehicle, Walker / mech; only with mobility types: Tracks, Two legs, Many legs; only with sizes: Huge; only with aim / mount: Free aim, Slow turret, Auto-target; from T3 | rare |
| `humanoid-mech` | Humanoid mech | A two-legged mech with a torso and arms. | classes: Walker / mech; only with mobility types: Two legs; only with sizes: Medium, Large, Huge | uncommon |
| `chicken-walker` | Reverse-joint walker | A cockpit or gun pod on backward-bending legs. | classes: Walker / mech; only with mobility types: Two legs; only with sizes: Medium, Large | common |
| `spider-frame` | Spider frame | A body slung between several visible legs, from a tiny robot to a giant walker. | classes: Walker / mech, Drone / support; only with mobility types: Many legs | uncommon |
| `rotorcraft` | Rotorcraft | A helicopter or VTOL airframe. | classes: Aircraft, Drone / support; only with mobility types: Hovering flight; only with sizes: Tiny, Small, Medium, Large | common |
| `fixed-wing` | Fixed-wing | An aeroplane airframe. | classes: Aircraft; only with mobility types: Jet; only with sizes: Medium, Large; only with aim / mount: Body aim, Auto-target | uncommon |
| `envelope` | Gas envelope | An airship or blimp with a gondola. | classes: Aircraft; only with mobility types: Airship; only with sizes: Huge; from T3 | rare |
| `disc` | Disc | A saucer or flying disc. | classes: Aircraft, Hovercraft, Drone / support; only with mobility types: Hover, Hovering flight, Jet; only with sizes: Tiny, Small, Medium, Large | rare |
| `micro-bot` | Micro-bot | A compact robot on wheels, tracks, a hover pad or rotors, with no prominent legs. | classes: Drone / support; only with mobility types: Wheels, Tracks, Hover, Hovering flight; only with sizes: Tiny, Small | common |
| `launcher-rack` | Launcher rack | A light chassis carrying an exposed launcher rack, radar mast or mortar: mobile anti-air, rocket artillery, sensor carriers. | classes: Tank / ground vehicle, Hovercraft, Walker / mech; only with sizes: Medium, Large; only with aim / mount: Free aim, Slow turret, Limited arc, Auto-target | uncommon |
| `ship` | Ship or submarine | Research only. *(research only)* | classes: Naval (research only) |  |

<a id="weapon-families"></a>
### Weapon families (`weapon-families`)

What the weapon is, judged by how it behaves in the source, not by its name. Each family has defaults (damage, mount, delivery, range) and lists what it may be combined with. Tie-breaks: a missile that steers is guided, an unguided one is a rocket; a soldier's personal gun is small arms, a belt-fed or mounted gun is a machine gun; prism only if the beam splits, travelling bolts are plasma; placed or thrown charges are explosives, dropped ones are bombs; artillery only for arcing or out-of-sight fire.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `small-arms` | Small arms | Rifles, carbines, SMGs and pistols. | classes: Infantry, Tank / ground vehicle, Walker / mech, Drone / support; default damage: kinetic; default mount: free aim; default delivery: hitscan; default range: medium; only with damage types: Kinetic, Armour-piercing; only with weapon delivery: Hitscan, Projectile | common |
| `machine-gun` | Machine gun | Sustained automatic fire, from light to heavy machine guns. | classes: all; default damage: kinetic; default mount: free aim; default delivery: hitscan; default range: medium; only with damage types: Kinetic, Armour-piercing, Fire; only with weapon delivery: Hitscan, Projectile | common |
| `shotgun` | Shotgun | A short-range spread of pellets or slugs. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft; default damage: kinetic; default mount: free aim; default delivery: hitscan; default range: short; only with damage types: Kinetic, Fire; only with weapon delivery: Hitscan, Projectile; only with target types: Infantry, Ground vehicles, Structures | uncommon |
| `sniper` | Sniper | Precision shots at long range, slow to fire. | classes: Infantry, Tank / ground vehicle, Walker / mech, Drone / support; default damage: kinetic; default mount: free aim; default delivery: hitscan; default range: long; only with damage types: Kinetic, Armour-piercing, Energy; only with weapon delivery: Hitscan, Projectile; only with target types: Infantry, Ground vehicles | uncommon |
| `autocannon` | Autocannon | Rapid medium-calibre shells, often able to hit aircraft. | classes: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; default damage: explosive; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: Explosive, Kinetic, Armour-piercing; only with weapon delivery: Projectile | common |
| `cannon` | Cannon | A direct-fire gun firing heavy shells. | classes: Tank / ground vehicle, Walker / mech, Hovercraft; default damage: armour-piercing; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: Armour-piercing, Explosive; only with weapon delivery: Projectile; only with target types: Infantry, Ground vehicles, Structures | common |
| `artillery` | Artillery / mortar | Shells lobbed over cover onto a target point. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft; default damage: explosive; default mount: free aim; default delivery: lobbed; default range: long; only with damage types: Explosive, Fire, Toxic, Cryo; only with weapon delivery: Lobbed; only with target types: Infantry, Ground vehicles, Structures | common |
| `rockets` | Rockets | Unguided rockets or rocket pods. | classes: all; default damage: explosive; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: Explosive, Armour-piercing, Fire; only with weapon delivery: Projectile, Lobbed | common |
| `guided-missiles` | Guided missiles | Missiles that lock on and steer toward the target. | classes: all; default damage: armour-piercing; default mount: free aim; default delivery: lock-on; default range: long; only with damage types: Armour-piercing, Explosive, EMP; only with weapon delivery: Lock-on | common |
| `flak` | Flak | Air-bursting shells, mainly against aircraft. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft; default damage: explosive; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: Explosive; only with weapon delivery: Projectile; only with target types: Aircraft, Infantry | uncommon |
| `flamethrower` | Flamethrower | A short-range stream of fire that sets the ground alight. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft; default damage: fire; default mount: free aim; default delivery: projectile; default range: short; only with damage types: Fire, Toxic; only with weapon delivery: Projectile; only with target types: Infantry, Ground vehicles, Structures | uncommon |
| `tesla` | Tesla / electric | Electric arcs that can jump between targets. | classes: all; default damage: electric; default mount: free aim; default delivery: hitscan; default range: medium; only with damage types: Electric; only with weapon delivery: Hitscan, Beam; only with target types: Infantry, Ground vehicles, Structures | uncommon |
| `laser` | Laser | A continuous or pulsed beam of light. | classes: all; default damage: energy; default mount: free aim; default delivery: beam; default range: medium; only with damage types: Energy, Fire; only with weapon delivery: Beam, Hitscan | uncommon |
| `prism` | Prism | A light beam that splits or refracts to hit several targets. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; default damage: energy; default mount: free aim; default delivery: beam; default range: long; only with damage types: Energy; only with weapon delivery: Beam | rare |
| `cryo` | Cryo | A freezing ray or shell: slows, then freezes the target solid. | classes: all; default damage: cryo; default mount: free aim; default delivery: beam; default range: medium; only with damage types: Cryo; only with weapon delivery: Beam, Projectile, Lobbed | uncommon |
| `plasma` | Plasma / energy bolt | Bolts of charged energy, often charged up before release. | classes: all; default damage: energy; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: Energy; only with weapon delivery: Projectile | uncommon |
| `sonic` | Sonic | Sound or pressure waves that push targets and pass through them. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft; default damage: sonic; default mount: free aim; default delivery: beam; default range: short; only with damage types: Sonic; only with weapon delivery: Beam, Projectile; only with target types: Infantry, Ground vehicles, Structures | rare |
| `blades` | Melee weapon | Blades, claws, fists, hammers, saws or drills used up close. | classes: Infantry, Walker / mech, Drone / support, Tank / ground vehicle; default damage: melee; default mount: free aim; default delivery: melee; default range: melee; only with damage types: Melee, Electric, Energy; only with weapon delivery: Melee, Attach; only with target types: Infantry, Ground vehicles, Structures | uncommon |
| `chemical` | Chemical / radiation | Toxic gas, acid or radiation that lingers as a hazard zone. | classes: Infantry, Tank / ground vehicle, Walker / mech, Aircraft; default damage: toxic; default mount: free aim; default delivery: projectile; default range: short; only with damage types: Toxic; only with weapon delivery: Projectile, Lobbed, Drop; only with target types: Infantry, Ground vehicles, Structures | rare |
| `explosives` | Explosives | Grenades, satchel charges, mines, sticky bombs and bomb trucks. | classes: Infantry, Drone / support, Tank / ground vehicle; default damage: explosive; default mount: free aim; default delivery: place; default range: short; only with damage types: Explosive, EMP, Fire; only with weapon delivery: Place, Lobbed, Attach, Ram / kamikaze; only with target types: Infantry, Ground vehicles, Structures | common |
| `bombs` | Bombs | Ordnance dropped from above. | classes: Aircraft, Drone / support; default damage: explosive; default mount: body aim; default delivery: drop; default range: short; only with damage types: Explosive, Fire, Toxic, EMP; only with weapon delivery: Drop; only with target types: Infantry, Ground vehicles, Structures | common |
| `emp` | EMP | An electromagnetic pulse that shuts down machines and shields. | classes: all; default damage: emp; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: EMP; only with weapon delivery: Projectile, Beam, Hitscan, Drop | uncommon |
| `drain` | Drain beam | A beam that pulls health or energy from the target into the attacker. *Note:* Always carries the self-heal weapon trait. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft, Drone / support; default damage: energy; default mount: free aim; default delivery: beam; default range: medium; only with damage types: Energy; only with weapon delivery: Beam; only with target types: Infantry, Ground vehicles, Structures | rare |
| `railgun` | Railgun / gauss | A magnetically fired slug: an instant, piercing line shot with a long reload. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft; default damage: armour-piercing; default mount: free aim; default delivery: hitscan; default range: long; only with damage types: Armour-piercing, Kinetic; only with weapon delivery: Hitscan | rare |
| `magnetic` | Magnetic | Magnetic beams or harpoons that pull, lift or pin vehicles. | classes: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; default damage: kinetic; default mount: free aim; default delivery: beam; default range: medium; only with damage types: Kinetic; only with weapon delivery: Beam; only with target types: Ground vehicles, Aircraft | rare |
| `nanites` | Nanites | A cloud or swarm of nano-machines that eats armour or repairs allies. | classes: all; default damage: toxic; default mount: free aim; default delivery: projectile; default range: short; only with damage types: Toxic, Repair; only with weapon delivery: Projectile, Lobbed, Drop | rare |
| `psionic` | Psionic | Mind attacks: control, confusion or fear. Machines without a crew are immune. | classes: Infantry, Walker / mech, Drone / support, Tank / ground vehicle; default damage: psionic; default mount: free aim; default delivery: beam; default range: medium; only with damage types: Psionic; only with weapon delivery: Beam, Hitscan; only with target types: Infantry, Ground vehicles | rare |
| `drone-launcher` | Drone launcher | Launches small drones or munitions that act on their own. | classes: all; default damage: explosive; default mount: auto-target; default delivery: projectile; default range: long; only with damage types: Explosive, Kinetic, EMP | rare |
| `repair-tool` | Repair tool | A torch, beam or spray that restores health to allies or vehicles instead of harming enemies. | classes: all; default damage: repair; default mount: free aim; default delivery: beam; default range: short; only with damage types: Repair; only with weapon delivery: Beam, Projectile | uncommon |
| `adaptive` | Adaptive | No fixed family: the weapon is taken from a passenger, a kill or the current mode. The signature pattern says how. | classes: all | rare |
| `torpedoes` | Torpedoes | Underwater weapons. Research only. *(research only)* | classes: Naval (research only); default damage: armour-piercing; default delivery: projectile |  |
| `none` | Unarmed | No weapon. Research only; a generated card shows an empty slot instead. *(research only)* |  |  |

<a id="damage-types"></a>
### Damage types (`damage-types`)

What a hit does. 'Strong vs', 'weak vs' and 'no effect on' are typed links to what the target is (armour class, nature, armour model, target type). They drive the generator's counter hints and are relative, not numbers.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `kinetic` | Kinetic | Bullets and slugs. | strong vs Unarmoured (armour), Light (armour); weak vs Heavy (armour), Super-heavy (armour) |
| `armour-piercing` | Armour-piercing | Penetrating shells and anti-tank warheads. | strong vs Medium (armour), Heavy (armour), Super-heavy (armour); weak vs Unarmoured (armour) |
| `explosive` | Explosive | Blast and shrapnel with an area effect. Good against groups and structures. | strong vs Unarmoured (armour), Light (armour), is a target of type structures; weak vs Super-heavy (armour) |
| `fire` | Fire | Burns over time and can leave burning ground. | strong vs Organic (nature); weak vs Heavy (armour), Super-heavy (armour) |
| `electric` | Electric | Shocks that can chain between targets; especially hard on drones and electronics. | strong vs Uncrewed machine (nature), Light (armour), Medium (armour) |
| `energy` | Energy | Lasers, plasma and prism light. Precise and good at burning through plating. | strong vs Medium (armour), Heavy (armour); weak vs Unarmoured (armour) |
| `cryo` | Cryo | Little damage by itself: it slows, then freezes. A frozen target takes heavy bonus damage from the next hit (shatter), so it is a setup for teammates. | weak vs Super-heavy (armour) |
| `sonic` | Sonic | Concussive waves that pass through targets and push them back. | strong vs Organic (nature), is a target of type structures; weak vs Super-heavy (armour) |
| `toxic` | Toxic | Gas, acid, radiation or nanites. Lingers as a zone; sealed vehicles resist it. | strong vs Organic (nature); weak vs Crewed machine (nature); no effect on Uncrewed machine (nature) |
| `emp` | EMP | Almost no damage: it shuts down vehicles, drones and energy shields for a time. | strong vs Uncrewed machine (nature), Crewed machine (nature), Recharging shield (armour model), Charged shield (armour model); no effect on Organic (nature) |
| `melee` | Melee | Blades, claws and bites up close. | strong vs Unarmoured (armour), Light (armour); weak vs Heavy (armour), Super-heavy (armour) |
| `psionic` | Psionic | Affects minds: control, confusion, fear. | strong vs Organic (nature); no effect on Uncrewed machine (nature) |
| `repair` | Repair | Restores health to friendly units instead of harming enemies. |  |

<a id="armour-classes"></a>
### Armour classes (`armour-classes`)

How tough the unit is, as a band. Combined with one or two armour models on the card.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `unarmoured` | Unarmoured | Flesh and cloth: soldiers and animals. | only with sizes: Tiny, Small |
| `light` | Light | Buggies, drones, helicopters and armoured infantry. Soldiers are unarmoured unless their game gives them a tougher category. |  |
| `medium` | Medium | IFVs, light tanks, power suits, light walkers. | only with sizes: Small, Medium, Large |
| `heavy` | Heavy | Main battle tanks and assault mechs. | only with sizes: Medium, Large, Huge |
| `super-heavy` | Super-heavy | Super-heavy tanks, giant mechs and airships. | only with sizes: Large, Huge; from T3 |

<a id="crew-models"></a>
### Crew models (`crew-models`)

Who operates the unit, and how many players that takes. Passenger seats are counted separately, so any crew model can also carry passengers. That covers the brief's 'transport with passengers' (shown on the card whenever there are passenger seats) and IFVs that have both a gunner and passengers.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `solo` | Solo | One player moves, aims and uses abilities. *Seen in:* Titanfall: one pilot runs the Titan, which fights on its own when the pilot gets out; MechWarrior: one pilot per mech; PlanetSide 2: the Lightning light tank is built for one player. | seats: Driver / pilot; players 1-1 | common |
| `driver-gunner` | Driver + gunner | Two operating seats: the driver moves (and may fire the main gun), the gunner mans a turret. Each weapon records which seat fires it; the solo fallback says what a lone player can do. *Seen in:* Battlefield and PlanetSide 2 battle tanks: the driver fires the main gun, a second seat mans a top gun; C&C Renegade: the driver drives and the gunner fires; alone, the driver fires too; Foxhole light tanks: the driver only drives, a separate seat fires the main gun; Halo Warthog: driver, turret gunner and a passenger. | classes: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; only with sizes: Medium, Large, Huge; seats: Driver / pilot, Gunner; players 1-2 | common |
| `driver-gunner-commander` | Driver + gunner + commander | Adds a commander seat that spots and marks targets, sees further, and triggers abilities or a secondary weapon. *Seen in:* Foxhole battle tanks: driver, gunners, a commander with a better view, and an engineer who reloads and repairs; Battlefield 3: an optional commander seat adds zoom, thermal vision and laser designation. | classes: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; only with sizes: Large, Huge; from T2; seats: Driver / pilot, Gunner, Commander; players 1-3 | uncommon |
| `squad` | Squad | One player leads a small group (a leader with AI followers, or a pack of tiny drones) that moves as one; losing members weakens it before it dies. *Seen in:* Company of Heroes: infantry squads share one health bar but lose firepower as soldiers die. | classes: Infantry, Drone / support; only with sizes: Tiny, Small; seats: Driver / pilot; players 1-1 | rare |
| `remote` | Remote operator | The player pilots a remote body while their own soldier stays parked and vulnerable; losing the remote returns them to that soldier. | classes: Drone / support; seats: Driver / pilot; players 1-1 | rare |

## Supporting vocabularies

<a id="ability-kinds"></a>
### Ability kinds (`ability-kinds`)

How an ability is triggered. 'Uses a key' kinds count toward the tier's key budget. Tie-break: deploy when one of the modes is stationary, otherwise toggle.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `active` | Active | Press to use, then a cooldown. | uses a key |
| `toggle` | Toggle / mode switch | Switches between two modes, such as two weapons. | uses a key |
| `deploy` | Deploy | Becomes stationary to gain a stronger mode. | uses a key |
| `channel` | Channel | Hold to keep it going; ends on release, interruption or when its resource runs out. | uses a key |
| `ultimate` | Ultimate | Charges up over time or through play. | from T3; uses a key |
| `passive` | Passive | Always on. |  |
| `triggered` | Triggered | Happens on an event: on a kill, on death, when hit. |  |

<a id="ability-sources"></a>
### Ability sources (`ability-sources`)

Where a source unit's ability comes from. Tier budgets count innate abilities only.

| Id | Label | Meaning |
|---|---|---|
| `innate` | Innate | The unit always has it. |
| `upgrade` | Upgrade | Unlocked by a purchased upgrade or research. |
| `loadout` | Loadout option | Picked from a set of options when buying or fitting the unit; options in the same group exclude each other. |
| `veterancy` | Veterancy | Gained when the unit ranks up. |
| `commander-power` | Commander power | Granted by a faction-wide power or protocol, not by the unit itself. |

<a id="aim-models"></a>
### Aim / mount (`aim-models`)

How a weapon's mount relates to movement. The biggest change from an RTS, where the game aims for you.

| Id | Label | Meaning | Rarity |
|---|---|---|---|
| `free-aim` | Free aim | The weapon points at the cursor independently of movement: drive one way, shoot another (twin-stick). | common |
| `slow-turret` | Slow turret | Free aim, but the turret turns slowly behind the cursor, so close flankers can out-turn it. | common |
| `body-aim` | Body aim | The weapon points where the unit faces; you aim by turning the whole unit. | common |
| `limited-arc` | Limited arc | The mount covers only part of the circle, for example the front quarter. | uncommon |
| `auto-target` | Auto-target | The weapon picks its own targets in range; the player handles positioning. | uncommon |
| `radial` | Radial | Hits all around the unit at once (pulse, aura); you aim by where you stand. | uncommon |

<a id="armour-models"></a>
### Armour models (`armour-models`)

How the unit absorbs damage. A card has one or two; a researched unit up to three. Shields you switch on, barriers that protect allies, invulnerability and 'draw fire' are abilities, so they live in patterns instead.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `flat-pool` | Single health bar | One health bar; every hit subtracts. The easiest to read. Used only when no other model applies. *Seen in:* Red Alert 3: one health value per unit, with damage first scaled by the unit's armour type; Iron Harvest: fixed damage per armour class comes straight off health. |  | common |
| `directional` | Directional armour | The front is tougher than the sides and rear, so flanking pays off. Reads well from above if facing is obvious. *Seen in:* Company of Heroes: rear hits multiply penetration; Broken Arrow: separate front, side, rear and top armour; tanks have almost none at the rear; PlanetSide 2: damage scales with the side the attacker stands on; Red Alert 3: mild, 5-10% extra from the side and rear. |  | common |
| `penetration-check` | Penetration check | Each hit is checked against the armour, and depending on angle or the weapon's penetration it may bounce for little or no damage. *Seen in:* Company of Heroes: every hit rolls its penetration chance and bounces on a failure; Foxhole: hidden armour points; penetration chance rises as armour wears down; Wargame and Broken Arrow: weapons below the target's armour value do little or won't fire. | only with armour classes: Medium, Heavy, Super-heavy | uncommon |
| `zonal` | Zonal damage | Hits land on parts such as tracks, turret, engine, legs or a weapon, which can break and switch off functions before the unit dies. *Seen in:* MechWarrior and BattleTech: head, arm, leg and torso locations with their own armour; Foxhole: tracks, turret and fuel can be disabled by hits there; Company of Heroes: critical hits damage engines or kill gunners; Battlefield 4: heavy hits cause mobility kills. | never with sizes: Tiny, Small | uncommon |
| `crew-casualties` | Crew casualties | Hits can knock out seats: in a multi-seat vehicle a player can be ejected or killed while the vehicle survives. *Seen in:* Company of Heroes: each soldier and gun crewman is tracked; a gun without crew can be captured; Foxhole: exposed seats leave their occupants open to fire; Wargame: crew critical hits disable specific systems. | never with crew models: Solo, Squad, Remote operator | rare |
| `regen-shield` | Recharging shield | A shield layer over health soaks damage and recharges after a short pause without being hit. *Seen in:* Halo: shields refill a few seconds after the last hit; StarCraft II: Protoss shields regenerate out of combat; PlanetSide 2: every soldier has a regenerating personal shield. |  | uncommon |
| `charge-shield` | Charged shield | A shield with its own charge that reduces incoming damage while it lasts; once drained, it has to be recharged with an item or at a station. *Seen in:* ARC Raiders: light, medium and heavy shields take 40-52.5% off each hit while charged; heavier ones slow you; refilled with recharger items or power cells from destroyed machines. |  | uncommon |
| `ablative-plates` | Ablative plates | Armour plates soak hits and break off one by one, exposing the hull. *Seen in:* Battlefield 3: reactive armour panels cancel the first anti-vehicle hit on each side; ARC Raiders: a heavy round can blow armour plates off a drone; BattleTech: bolt-on modular armour soaks damage first. | never with armour classes: Unarmoured | uncommon |
| `damage-reduction` | Damage reduction | Armour takes a fixed amount off every hit, so small hits do little or nothing. *Seen in:* StarCraft II: armour takes a fixed amount off every hit, minimum 1; PlanetSide 2: main battle tanks ignore small arms completely. | only with armour classes: Medium, Heavy, Super-heavy | uncommon |
| `self-repair` | Self-repair | Slowly regains health on its own, often only out of combat. *Seen in:* Red Alert 3: top-rank and some heavy vehicles heal themselves; PlanetSide 2: an auto-repair module heals vehicles out of combat; Battlefield 3: vehicles slowly regain armour. |  | common |
| `evasive` | Evasive | Survives by dodging: the game gives it an explicit evasion mechanic (a dodge roll, a miss chance), not just a small size. | only with sizes: Tiny, Small, Medium; only with armour classes: Unarmoured, Light, Medium | common |
| `downed-revive` | Downed, revivable | At zero health it goes down instead of dying: it can crawl, and a teammate can revive it or an enemy finish it. | classes: Infantry | uncommon |
| `weak-point` | Weak point | An exposed weak spot, such as a vent, reactor or rear hatch, takes extra damage. *Seen in:* ARC Raiders machines: shoot the joints and rear cylinders; Iron Harvest: many mechs take double damage at the back. |  | uncommon |
| `interceptor` | Interceptor | An active protection system shoots down incoming missiles and rockets; it has few charges and must reload, so a volley can overwhelm it. *Seen in:* Broken Arrow: active protection stops HEAT rounds fully, kinetic ones partly, then reloads; Battlefield 4: active protection detonates incoming missiles for a moment, then recharges. | classes: Tank / ground vehicle, Walker / mech, Hovercraft | rare |
| `critical-burn` | Critical burn | Below a health threshold it is disabled and burning, and dies unless a teammate repairs it in time. *Seen in:* Battlefield: vehicles below a threshold are disabled and burn out unless repaired; PlanetSide 2: vehicles catch fire at 20% health; Foxhole: many vehicles are disabled below a health threshold. | never with unit classes: Infantry | uncommon |

<a id="availability"></a>
### Availability (`availability`)

How many of the unit a team may field at once.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `open` | Open | Anyone can buy it. |  |
| `limited` | Limited | Only a few per team at a time. |  |
| `unique` | Unique | One per team: heroes and commandos. | from T2 |

<a id="balance-flags"></a>
### Balance flags (`balance-flags`)

Warnings the generator puts on a card. 'Block' flags never appear on rolled cards, only on hand-edited or remixed ones.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `no-counter` | No counter | Nothing in the data can satisfy any of the card's 'countered by' links. | severity: block |
| `strength-without-weakness` | Unpaired strength | A strength has no weakness paired with it. | severity: block |
| `too-many-keys-for-tier` | Too many keys for its tier | Keys or passives exceed the tier's budget. | severity: block |
| `seat-overloaded` | Seat overloaded | One seat has more keys than the per-seat limit. | severity: block |
| `idle-seat` | Idle seat | An operating seat owns no weapon or ability. | severity: block |
| `cost-outside-tier` | Cost outside tier | The derived cost band doesn't fit the tier. | severity: warn |
| `name-collision` | Name too close to a real unit | The working name matches a real unit name in the database. | severity: block |
| `hard-control-without-escape` | Control without escape | A stun or attach effect with no stated way for the victim to escape. | severity: block |
| `off-flavour` | Off-flavour | Uses parts the faction flavour avoids (allowed at high spice). | severity: warn |

<a id="confidence"></a>
### Confidence levels (`confidence`)

How sure we are that a research entry's factual claims are correct. Our own design proposals (aim, crew, how it plays) are marked as proposals and not rated.

| Id | Label | Meaning |
|---|---|---|
| `high` | High | Stated by an official source, or by two independent established sources that agree. |
| `medium` | Medium | Stated by one established wiki or database, not contradicted. |
| `low` | Low | From a forum, a guide, a search snippet or a single unclear source. Needs a check before use. |

<a id="cooldown-bands"></a>
### Cooldown bands (`cooldown-bands`)

How often an ability can be used.

| Id | Label | Meaning |
|---|---|---|
| `spam` | Spammable | About 1-3 seconds; several uses in every fight. |
| `short` | Short | About 5-10 seconds; a couple of uses per fight. |
| `medium` | Medium | About 15-30 seconds; roughly once per fight. |
| `long` | Long | About 45-90 seconds; a few uses per life. |
| `per-life` | Once per life | One use per life or purchase, restocked only at a resupply point or on respawn. |

<a id="cost-bands"></a>
### Cost bands (`cost-bands`)

Relative price. For source units it is relative within their own game (each game records its thresholds); for generated concepts it is derived from the parts.

| Id | Label | Meaning |
|---|---|---|
| `very-low` | Very low | Among the cheapest units. |
| `low` | Low | Cheaper than a standard main unit. |
| `medium` | Medium | A standard main unit. |
| `high` | High | A premium or specialist unit. |
| `very-high` | Very high | Heroes, super-heavies and epic units. |

<a id="handling"></a>
### Handling (`handling`)

How the controls feel: the first thing a player notices about a unit.

| Id | Label | Meaning | Rarity |
|---|---|---|---|
| `strafe` | Strafe | Moves in any direction regardless of facing and turns instantly; the twin-stick default. | common |
| `pivot` | Pivot (tank controls) | Turns the hull on the spot, then drives forward or back; can't strafe. | common |
| `steer` | Steer | Turns only while moving, in arcs; fast on straights, can't turn in place. | common |
| `drift` | Drift | Keeps momentum and slides through turns; needs room to stop. | uncommon |
| `forward-only` | Forward only | Must keep moving forward and turns in wide loops; attacks in passes. | uncommon |

<a id="mobility-traits"></a>
### Mobility traits (`mobility-traits`)

Extras on top of the base mobility; a card has up to two. Traits marked 'uses a key' are buttons: they count toward the tier's key budget and need their matching mechanic pattern.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `amphibious` | Amphibious | Moves on water as well as land. | classes: Infantry, Tank / ground vehicle, Walker / mech, Drone / support; never with mobility types: Hovering flight, Jet, Airship, Jetpack / wings, Hover | uncommon |
| `climb` | Climb | Climbs walls and cliffs. | classes: Infantry, Walker / mech, Drone / support; only with mobility types: On foot, Many legs | uncommon |
| `crush` | Crush | Runs over smaller units in its path: infantry and small drones; super-heavies also crush light vehicles. | classes: Tank / ground vehicle, Walker / mech, Hovercraft; only with sizes: Large, Huge | common |
| `leap` | Leap | Jumps over walls or gaps. | classes: Infantry, Walker / mech, Drone / support; never with mobility types: Hovering flight, Jet, Airship, Jetpack / wings, Hover; uses a key (pattern: leap) | uncommon |
| `boost` | Boost | A short burst of speed or a dash. | classes: all; uses a key (pattern: dash) | common |
| `burrow` | Burrow / submerge | Goes underground or underwater to hide or travel; must surface to act. | classes: Infantry, Tank / ground vehicle, Walker / mech, Drone / support; never with mobility types: Hovering flight, Jet, Airship, Jetpack / wings; uses a key (pattern: burrow) | rare |
| `teleport` | Teleport | Blinks a short distance or jumps through space. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft, Drone / support; uses a key (pattern: teleport) | rare |
| `transform` | Transform | Switches between two forms, such as walker and jet; the unit records the second form in its modes. | classes: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; uses a key (pattern: transform) | rare |
| `deploy-anchor` | Deploy / anchor | Stops to enter a stronger stationary mode; must pack up to move. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft; uses a key (pattern: deploy siege mode) | uncommon |

<a id="nature"></a>
### Nature (`nature`)

What the unit is made of, which decides how EMP, psionic, toxic and electric attacks affect it.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `organic` | Organic | Flesh: soldiers and animals. Unaffected by EMP; vulnerable to psionic and toxic attacks. | classes: Infantry |
| `crewed-machine` | Crewed machine | A vehicle or mech with people inside: hit by EMP, sealed against most toxic attacks. |  |
| `uncrewed-machine` | Uncrewed machine | A drone or robot: immune to psionic and toxic attacks, extra-vulnerable to electric and EMP. |  |

<a id="on-death"></a>
### On death (`on-death`)

What happens when the unit is destroyed. A card has one or two.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `respawn` | Respawn | The unit is lost and the player returns to the buy screen. |  | common |
| `bail-out` | Bail out | The vehicle is destroyed and its crew eject as basic infantry with low health. | never with unit classes: Infantry | common |
| `wreck` | Wreck | Leaves a wreck that teammates can repair or enemies can salvage. | never with unit classes: Infantry | uncommon |
| `death-blast` | Death blast | Explodes on death, damaging everything nearby. |  | uncommon |
| `pilot-eject` | Pilot eject | The pilot pops out in a light suit and can reach a new unit or a pickup. | classes: Walker / mech, Aircraft, Tank / ground vehicle, Hovercraft | uncommon |

<a id="pattern-categories"></a>
### Pattern categories (`pattern-categories`)

Groups for browsing mechanic patterns in the library. When several fit, pick the first in this order: conversion, infiltration, transport and garrison, mode change, summon, stealth and deception, control, defence, support, area, mobility, progression, weapon behaviour. A pattern may list up to two more categories for filtering.

| Id | Label | Meaning |
|---|---|---|
| `weapon-behaviour` | Weapon behaviour | How a weapon works: chaining, charging, beams, splitting, switching. |
| `control` | Control | Stops or hampers enemies: stun, root, silence, slow, freeze. |
| `infiltration` | Infiltration | Gets inside enemy units or lines: infest, hijack, capture, steal. |
| `stealth-deception` | Stealth and deception | Hides or fakes: cloak, disguise, decoy. |
| `mobility` | Mobility | Moves in special ways: leap, dash, teleport, burrow. |
| `mode-change` | Mode change | Switches form or stance: deploy, siege, transform. |
| `defence` | Defence | Survives in special ways: shields, barriers, armour tricks, self-repair. |
| `support` | Support | Helps teammates: heal, repair, buff, resupply. |
| `transport-garrison` | Transport and garrison | Carries or houses others; passengers matter. |
| `conversion` | Conversion | Turns the enemy's strength into yours: leech, salvage, mind control. |
| `area` | Area | Shapes the ground: mines, zones, terrain. |
| `summon` | Summon | Spawns drones, turrets or minions. |
| `progression` | Progression | Grows stronger during a life: veterancy, levels, kill streaks, stacking buffs. |

<a id="range-bands"></a>
### Range bands (`range-bands`)

How far a weapon reaches, relative to the top-down screen.

| Id | Label | Meaning |
|---|---|---|
| `melee` | Melee | Touching distance. |
| `short` | Short | A few soldier-lengths: shotguns, flamethrowers. |
| `medium` | Medium | Comfortable on-screen distance: rifles, tank guns. |
| `long` | Long | Near the edge of the visible screen: snipers, missiles. |
| `off-screen` | Off-screen | Beyond the camera view; needs spotting, a zoom or a scope mode. |

<a id="rarity"></a>
### Rarity (`rarity`)

How readily the generator offers a term at each spice level (1 = grounded, 5 = wild). Weights are relative.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `common` | Common | Offered at every spice level, a little less often as spice rises. | from spice 1; weights at spice 1-5: 10, 10, 8, 6, 5 |
| `uncommon` | Uncommon | Offered from spice 2. | from spice 2; weights at spice 1-5: 0, 4, 5, 6, 6 |
| `rare` | Rare | Offered from spice 4; the rare cross-overs. | from spice 4; weights at spice 1-5: 0, 0, 0, 3, 5 |

<a id="ratings"></a>
### Ratings (`ratings`)

Low / medium / high on the scale of the field that uses it. For team-play potential higher is better; for build difficulty and risks higher is worse.

| Id | Label | Meaning |
|---|---|---|
| `low` | Low | Low on this field's scale. |
| `medium` | Medium | Medium on this field's scale. |
| `high` | High | High on this field's scale. |

<a id="resources"></a>
### Resources (`resources`)

A unit-wide gauge that shapes how the unit plays. A card has at most one.

| Id | Label | Meaning |
|---|---|---|
| `heat` | Shared heat | Weapons and abilities add heat to one gauge; overheating shuts the unit down briefly. |
| `energy` | Energy pool | One pool feeds weapons, shields and abilities, so the player chooses what to spend it on. |
| `fuel` | Fuel | Flight or boost time drains a gauge that refills on the ground or at a pad. |
| `limited-ammo` | Limited ammo | Total ammo is finite; a supporter, a pickup or the base refills it. |
| `kill-charge` | Kill charge | A meter filled by kills or damage dealt powers an upgrade or an ultimate. |

<a id="seat-roles"></a>
### Seat roles (`seat-roles`)

What one player in a multi-seat unit controls.

| Id | Label | Meaning |
|---|---|---|
| `driver` | Driver / pilot | Moves the unit. In a solo unit also aims, fires and uses abilities. |
| `gunner` | Gunner | Aims and fires a weapon. |
| `commander` | Commander | Spots, marks and sees further; triggers abilities or a secondary weapon. *Seen in:* Foxhole: the commander directs the crew and can open the cupola to look out; Battlefield 3: the commander seat designates targets for guided shells. |
| `passenger-cargo` | Passenger (cargo) | Rides inside, protected, and can't act until they get out. |
| `passenger-firing` | Passenger (firing) | Rides inside and fires their own weapon out of a port or an open top. *Seen in:* PlanetSide 2: rumble seats let riders use their own weapons, exposed to fire; Halo: the Mongoose passenger fires their own weapon. |
| `passenger-module` | Passenger (module) | Who rides inside decides the vehicle's weapon or ability; the passenger may aim it. *Seen in:* Red Alert 3: the Multigunner IFV's weapon depends on its passenger; Foxhole: the battle tank's engineer seat reloads the gun and repairs. |

<a id="sizes"></a>
### Sizes (`sizes`)

Footprint seen from above, measured in soldiers. Sets the hitbox and readability.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `tiny` | Tiny | Smaller than one soldier: dogs, small drones. Hard to hit, easy to lose sight of. |  |
| `small` | Small | One soldier: infantry and power-suit troopers. |  |
| `medium` | Medium | Two to three soldier-widths: buggies, cars, light walkers, IFVs. |  |
| `large` | Large | Tanks, APCs and assault mechs. |  |
| `huge` | Huge | Two tanks or more: super-heavies, giant mechs, airships. | from T3 |

<a id="solo-fallback"></a>
### Solo fallback (`solo-fallback`)

What a lone player can do in a multi-seat unit.

| Id | Label | Meaning | Rarity |
|---|---|---|---|
| `full-control` | Full control | One player can drive and fire everything; extra seats add weapons, spotting or passenger effects. *Seen in:* C&C Renegade: the driver takes over the weapon whenever the gunner seat is empty; Battlefield tanks: the driver has the main gun. | common |
| `seat-swap` | Seat swap | Alone, one key switches seats: drive or shoot, not both. *Seen in:* PlanetSide 2: solo Liberator pilots switch to the belly gun mid-fight. | uncommon |
| `auto-gunner` | Auto-gunner | Empty gun seats fire on their own at reduced accuracy until a player takes them. *Seen in:* Titanfall: the Titan fights on its own when the pilot is out; Halo campaign: computer-controlled gunners man the turret. | uncommon |
| `needs-crew` | Needs crew | A seat's weapon or ability does nothing without a player in it. *Seen in:* Foxhole: only the engineer seat can reload a battle tank's main gun. | rare |

<a id="source-kinds"></a>
### Source kinds (`source-kinds`)

Where a citation comes from, in order of preference.

| Id | Label | Meaning |
|---|---|---|
| `official` | Official | Publisher or developer: manual, official site, patch notes, developer posts. |
| `wiki` | Established wiki | A large, maintained community wiki for the series. |
| `database` | Game database | Data-mined values or stat databases. |
| `guide` | Guide | Published strategy guides or long-standing community guides. |
| `video` | Video | Gameplay footage, cited with a timestamp in the note; official developer videos count as official. |
| `community` | Community | Forums and discussion threads. Low confidence on their own. |

<a id="speed-bands"></a>
### Speed bands (`speed-bands`)

Speed as a ratio to a reference unit: for source units, the game's basic rifle infantry (named in the games registry); for generated cards, a Shamble Frontlines soldier.

| Id | Label | Meaning |
|---|---|---|
| `very-slow` | Very slow | Under 0.7 times the reference. |
| `slow` | Slow | 0.7 to 1 times the reference. |
| `medium` | Medium | 1 to 1.5 times the reference. |
| `fast` | Fast | Over 1.5 and up to 2.5 times the reference. |
| `very-fast` | Very fast | Over 2.5 times the reference. |

<a id="target-types"></a>
### Target types (`target-types`)

What a weapon can hit (on a weapon) or what kind of target a unit is (from its mobility; a tiny or small ground unit counts as infantry).

| Id | Label | Meaning |
|---|---|---|
| `infantry` | Infantry | Soldiers, animals and other infantry-sized ground targets, including small ground drones. |
| `ground-vehicle` | Ground vehicles | Vehicles, walkers and hovercraft. |
| `aircraft` | Aircraft | Anything flying, including flying drones and jetpack infantry in the air. |
| `structure` | Structures | Buildings, turrets and deployables. |
| `naval` | Naval | Ships and submarines. Research only. *(research only)* |

<a id="team-play-hooks"></a>
### Team-play hooks (`team-play-hooks`)

The ways a unit creates teamwork. Used on patterns and cards, and filterable in the library.

| Id | Label | Meaning |
|---|---|---|
| `setup-finisher` | Setup and finisher | One player changes a target's state (stun, freeze, strip shields) so another can convert it into a kill. |
| `rescue` | Rescue | Teammates can undo a specific enemy effect on a victim: remove a parasite, unfreeze, revive. |
| `seat-synergy` | Seat synergy | Who rides inside changes or boosts the unit. |
| `carry` | Carry | Moves teammates where they need to be. |
| `protector` | Protector | Shields, heals or repairs others on an ongoing basis. |
| `resupply` | Resupply | Refills teammates' ammo, energy, fuel or ability charges, or needs teammates to refill its own. |
| `forward-spawn` | Forward spawn | Gives teammates a place to respawn or re-equip near the fight. |
| `spotter` | Spotter | Gives the team information: reveals or marks targets. |
| `bait-and-trap` | Bait and trap | Lures enemies into teammates or a trap. |
| `escort-dependency` | Needs an escort | Strong, but helpless against its counter without a bodyguard. |
| `counter-pick` | Counter-pick | The enemy team must coordinate unit choices to answer it. |
| `swarm` | Swarm | Several players on the same unit type stack their effects. |
| `share-spoils` | Share the spoils | Gains from kills (salvage, pickups) can be handed to or earned with teammates. |

<a id="weapon-delivery"></a>
### Weapon delivery (`weapon-delivery`)

How a shot reaches its target.

| Id | Label | Meaning |
|---|---|---|
| `hitscan` | Hitscan | Hits instantly along the line of fire. |
| `projectile` | Projectile | A visible shot with travel time that can be dodged. |
| `beam` | Beam | A continuous beam held on the target; the effect builds while it stays on. |
| `lobbed` | Lobbed | Arcs over cover onto a ground point; travel time and a minimum range. |
| `lock-on` | Lock-on | Hold on a target to lock, then fire homing shots; the target gets a warning. |
| `melee` | Melee | Strikes or lunges at touching distance. |
| `attach` | Attach | Works by latching onto or getting inside the target. |
| `place` | Place | Sets down charges, mines or devices on the ground or a target. |
| `drop` | Drop | Released below or just ahead of the unit; you aim by flying over the target. |
| `ram` | Ram / kamikaze | The unit itself is the weapon: it hits by colliding with or diving into the target, often destroying itself. |

<a id="weapon-traits"></a>
### Weapon traits (`weapon-traits`)

Combinable twists on a weapon. A weapon has up to three.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `splash` | Splash | Damages an area around the impact. |  |
| `pierce` | Pierce | Passes through the first target to hit others behind it. |  |
| `chain` | Chain | Jumps from the first target to nearby ones. |  |
| `damage-over-time` | Damage over time | Keeps hurting the target after the hit: burning, corrosion, damage from inside. |  |
| `zone` | Lingering zone | Leaves a hazard on the ground (fire, gas, nanites) that hurts whoever stands in it. |  |
| `charge-up` | Charge-up | Hold to charge a stronger shot. |  |
| `spin-up` | Spin-up | Fires slowly at first and speeds up while held. |  |
| `overheat` | Overheat | Fires continuously until it overheats, then must cool down. | never with weapon traits: Magazine |
| `magazine` | Magazine | Fires a set number of shots, then reloads. | never with weapon traits: Overheat |
| `homing` | Homing | Shots steer toward the target. |  |
| `knockback` | Knockback | Pushes targets away. |  |
| `slow` | Slow | Slows the target. |  |
| `root` | Root / pin | The target can't move but can still fire and use abilities. |  |
| `silence` | Silence / disarm | The target can move but can't fire or use abilities. |  |
| `stun` | Stun | The target can't do anything for a very short time. T2 and up, on a medium or longer cooldown. | from T2 |
| `suppress` | Suppress | Sustained fire pins targets: slows them and spoils their aim while under fire. |  |
| `mark` | Mark | Tags the target so the whole team sees it and hits it harder for a time. |  |
| `min-range` | Minimum range | Can't hit targets inside a dead zone close to the unit. |  |
| `friendly-fire` | Friendly fire | Its splash or penetration also hurts allies. |  |
| `finite-ammo` | Limited ammo | Carries a fixed stock that a teammate or station must refill (unlike a magazine, which only reloads). |  |
| `shield-breaker` | Shield-breaker | Deals bonus damage to shields and barriers. |  |
| `self-heal` | Self-heal | Damage dealt restores the attacker's health. |  |

