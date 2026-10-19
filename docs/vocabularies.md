<!-- Generated from the JSON in data/ and schemas/. Edit the JSON, not this file. -->

# Vocabularies (draft v1.0.0)

Fixed word lists. Every source unit, pattern and generated card may only use these terms, and the validator rejects anything else. Ids (in `code`) are what the data stores; labels are what the app shows.

- **Core** lists are the ten the brief asks for. **Supporting** lists make them usable: scales, aim, traits, seats and so on.
- **Rules** say which terms can go together. They bind generated cards (so the generator can't roll tracks on an aircraft). Real units that break them are recorded as they are and listed as 'atypical'. Real games breaking our rules is useful spice material, and evidence for relaxing a rule. A term's classes are every class it is physically possible for; a class left out is a hard ban.
- **Rarity** feeds the spice control: common terms appear at every spice level, rare ones only when spice is turned up. A part that is possible but unusual for a class has its own rarity there ('rare on: Aircraft' in the rules), so cross-overs such as a flamethrower on an aircraft appear only at high spice.
- **Typed links** such as 'at most Small (size)' or 'can hit high air' point at other terms; see [fields](fields.md).
- **'Seen in'** examples illustrate a term and are not cited here; the research run cites them on the units.

39 lists, 310 terms.

## Contents

**Core:** [Unit classes](#classes) (7) · [Tier bands](#tiers) (3) · [Faction flavours](#faction-flavours) (3) · [Roles](#roles) (16) · [Mobility types](#mobility) (12) · [Body plans](#bodies) (18) · [Weapon families](#weapon-families) (32) · [Damage types](#damage-types) (13) · [Armour classes](#armour-classes) (5) · [Crew models](#crew-models) (5)

**Supporting:** [Ability kinds](#ability-kinds) (7) · [Ability sources](#ability-sources) (5) · [Aim / mount](#aim-models) (6) · [Armour models](#armour-models) (15) · [Availability](#availability) (3) · [Balance flags](#balance-flags) (9) · [Confidence levels](#confidence) (3) · [Cooldown bands](#cooldown-bands) (5) · [Cost bands](#cost-bands) (5) · [Handling](#handling) (5) · [Mobility traits](#mobility-traits) (9) · [Nature](#nature) (3) · [On death](#on-death) (5) · [Pattern categories](#pattern-categories) (13) · [Range bands](#range-bands) (5) · [Rarity](#rarity) (3) · [Ratings](#ratings) (3) · [Resources](#resources) (5) · [Seat roles](#seat-roles) (6) · [Sensor traits](#sensor-traits) (5) · [Sight bands](#sight-bands) (3) · [Sizes](#sizes) (5) · [Solo fallback](#solo-fallback) (4) · [Source kinds](#source-kinds) (6) · [Speed bands](#speed-bands) (5) · [Target types](#target-types) (6) · [Team-play hooks](#team-play-hooks) (13) · [Weapon delivery](#weapon-delivery) (11) · [Weapon traits](#weapon-traits) (23)

## Core vocabularies

<a id="classes"></a>
### Unit classes (`classes`)

What kind of body the player controls. The six generator classes come from the brief; 'naval' is kept for research only. Rarity applies only when the class is left open; a class you pick is always used.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `infantry` | Infantry | A soldier on foot, from rifleman to power-suit trooper or war animal. Small hitbox, uses cover, can enter vehicles and buildings. |  | common |
| `vehicle` | Tank / ground vehicle | A wheeled or tracked ground vehicle: buggies, tanks, IFVs and APCs, artillery. This is the brief's 'tank' class, widened so IFVs and buggies fit. Also called: tank. |  | common |
| `walker` | Walker / mech | A vehicle on legs, from a nimble scout walker to a towering assault mech (rarely a giant war beast). Steps over low obstacles and has a strong silhouette. Also called: mech. |  | common |
| `hover` | Hovercraft | Rides on an air cushion or anti-grav field, so it crosses land and water. Slides and drifts when it turns. |  | uncommon |
| `aircraft` | Aircraft | A flyer bigger than a drone, usually crewed: helicopter, VTOL, jet or airship (rarely remote-piloted, or a flying beast). Hovering flight is low air; jets and airships are high air. Ignores ground obstacles; a top-down view needs a clear height cue such as a shadow. |  | common |
| `drone` | Drone / support | A small uncrewed machine or support device: attack, scout and repair drones and deployable gadgets. Usually fast and fragile; the player is the machine. *Note:* Only for uncrewed units of tiny or small size (the size rule is checked), however they move: a small spider robot on legs is a drone, not a walker. Bigger robots are classed by how they move. Support is a role, not a class: a repair truck is a vehicle with the support role. | only with sizes: Tiny, Small | uncommon |
| `naval` | Naval (research only) | Ships and submarines. Recorded only when they teach a mechanic, such as submerging. The generator never rolls this class. *(research only)* |  |  |

<a id="tiers"></a>
### Tier bands (`tiers`)

How early, cheap and complex a unit is. Tiers cap the number of keys: every button except primary fire and movement (secondary weapon, active abilities, toggles, deploys, key-bound movement, ultimate). The cap is a maximum, not a target, and counts innate abilities only. Universal keys that every unit shares never count: E interact (enter or leave a seat, pick up), hold F shake off anything attached to you, hold X bail out of a vehicle, 1-3 switch seat, middle mouse ping, and G for a transport's driver to evict passengers. A signature fired with primary fire counts as primary fire only when it is the unit's primary weapon. For source units the tier comes from tech gating alone; games without tech tiers record none. Some games use 'tier' for upgraded versions of the same vehicle (Foxhole, Halo Wars): record those as upgrades, not tiers. The game's tier_map, read with its registry notes, decides what counts as a tech step. An add-on or research that is not on it, such as StarCraft II's Tech Lab or Reactor, is not a step; one the notes translate into a tier, such as Dawn of War's Monastery, is. A unit of a game without tech tiers has no tier and is never checked against a term's min_tier.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `t1` | T1 | Early: cheap, available from the start, simple and readable. | max 2 keys, 1 passive, 3 keys per seat; source rule: Built from a basic production building with no extra tech. |
| `t2` | T2 | Mid: needs one tech step; stronger or more specialised. | max 3 keys, 1 passive, 3 keys per seat; source rule: Needs one tech building or upgrade beyond the basics. |
| `t3` | T3 | Late: top tech, elites and super-heavies. May carry an ultimate. | max 4 keys, 1 passive, 3 keys per seat; source rule: Needs top-level tech. A faction's end-game production building counts as top-level tech even where its prerequisite is shallow (a basic building, or none in the game data); say so in the source note. |

<a id="faction-flavours"></a>
### Faction flavours (`faction-flavours`)

Generic faction identities in Red Alert 3's spirit. A flavour makes its favoured parts three times as likely and one step more common for that faction (rare counts as uncommon, uncommon as common), so a grounded Soviet card can roll tesla weapons and an Allied card at spice 2 can roll prism. The step never applies to a class rarity, so a favoured cross-over (a flamethrower on a Soviet aircraft) still waits for high spice. It holds back its avoided parts until spice 3.

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

What the unit is for: its job or the targets it is best against, never how it does it (mechanics are patterns). A card has one primary role and up to two secondary roles. Requires says what a unit needs before it can claim a role. A source unit never claims a role whose requires it fails. If such a role still fits, leave it out and record it in fit_notes (path roles, wanted: that role). Meeting the requires is not enough: the role description must fit too. Official text means words the game or its makers wrote: the in-game role line, tooltip or production text, the manual, the official unit profile and patch notes. It still counts when read through a page that copies it. A wiki's own words (its infobox labels, prose and tables), strategy guides and internal file names are not official text; the registry notes say which infobox fields copy in-game text. For a unit recorded once for several sides, official text counts only when every side's version carries it. Official words name a role only through the role's whole label or one of its aliases; each half of a slash label (Artillery / siege) counts as a label. One word of a longer label is not enough: 'Assault' alone does not name Frontline assault, so a Purpose such as 'Tank/Structure Assault' names no role. These words name no role: main battle tank; light, medium or heavy tank; core or line infantry; multipurpose; general-purpose; attack (as in attack helicopter); support when it means firepower (combat support, fire support, artillery support, close air support); control in mind control or a control point; and aura in a healing or repair aura (that job is support). How to pick the primary and secondary roles is under roles in docs/fields.md. The tie-breaks settle close calls.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `assault` | Frontline assault | Leads pushes, soaks damage and brawls at short to medium range. *Coding rule:* As primary: any generalist that is not fast with light or no armour (step 5 of roles.primary). |  |
| `anti-armour` | Anti-armour | Kills vehicles and mechs. Also called: anti-tank, anti-vehicle, anti-armor, tank hunter, tank destroyer. | needs Armour-piercing (damage) or Energy (damage) or Electric (damage) or EMP (damage) or Infest a vehicle (pattern) |
| `anti-infantry` | Anti-infantry | Clears soldiers and light targets. Also called: anti-personnel. |  |
| `anti-air` | Anti-air | Brings down aircraft, including jets and airships in high air. Also called: anti-aircraft, air defence, AA. | needs can hit high air |
| `siege` | Artillery / siege | Hits from very far, from above or over cover; breaks defences and structures. Also called: artillery, bombardment, bomber. *Coding rule:* A lobbed weapon that reaches long or further, bombs dropped from the air, a deploy mode whose gun reaches long or further and hits an area, or a long-range missile or rocket that the sources say is built mainly to destroy structures (they name structures as its first or only target). A gun aimed straight at targets in view is never siege by that last clause, even when official text calls it strong against buildings; what else it is strong against may still give an anti role under roles.secondary. A long-range missile or cannon alone is not siege, and a team that sets up its gun before firing is not deploying. | needs Lobbed (delivery) or Drop (delivery) or at least Long (range) |
| `marksman` | Marksman / overwatch | Holds long sightlines and picks off targets with precise shots. Also called: sniper, sharpshooter. *Coding rule:* Only a sniper weapon (the sniper family) that reaches long or further. A long-range missile gives the anti role for its target; a long-range splash or lobbed gun is siege. | needs at least Long (range) |
| `scout` | Scout / recon | Finds, spots and marks enemies; usually fast and fragile. Also called: recon, reconnaissance, spotter. | needs at least Fast (speed) or Stealth and deception (pattern category) or Mark (weapon trait) or at least Long (sight) or Radar (sensor) or Detector (sensor) or Lingering sight (sensor) or Stealth (sensor) or Reveal an area (planned pattern) or Mark a target (planned pattern) |
| `support` | Support | Heals, repairs or resupplies teammates. Also called: medic, healer, repair, resupply. | needs Repair tool (weapon) or Repair and heal allies (planned pattern) or Resupply allies (planned pattern) |
| `transport` | Transport | Carries teammates around the map. Also called: troop transport, troop carrier, personnel carrier. *Coding rule:* Needs two or more passenger seats. A carrier with one seat is not a transport, whatever the source calls it; its seat shows in crew.passengers and its carry-passengers or passenger-sets-weapon pattern. | classes: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; needs at least 2 passenger seat(s) |
| `infiltrator` | Infiltrator / saboteur | Gets inside enemy units or buildings, or passes as one of them, to spy, steal or sabotage: steals vehicles or money, spies on or shuts down buildings. Also called: spy, saboteur, hijacker, thief. |  |
| `disabler` | Disabler / control | Stops enemies from acting: stun, root, silence, freeze, slow. | needs Stun (weapon trait) or Root / pin (weapon trait) or Silence / disarm (weapon trait) or Slow (weapon trait) or Cryo (damage) or EMP (damage) or Control (pattern category) |
| `raider` | Raider / flanker | Hits and runs, picking off isolated targets: fast flankers, gunships that make attack runs. Also called: hit-and-run, flanker, harasser. *Coding rule:* As primary: a fast or very fast generalist with light or no armour (step 5 of roles.primary). As secondary: see roles.secondary. | needs at least Fast (speed) |
| `area-denial` | Area denial | Controls ground with mines, fire, turrets or fortifications. Also called: minelayer. | needs Lingering zone (weapon trait) or Area (pattern category) or Summon (pattern category) |
| `buffer` | Buffer / aura | Makes nearby allies stronger for a time (more damage, armour, speed or accuracy) with an aura or a timed call. Spotting is scout; healing and resupply are support; spawn points and buildings are engineer. |  |
| `engineer` | Engineer / builder | Builds, converts or takes over structures that serve the team: barracks, outposts, spawn or supply points, bridges. Also called: builder, sapper, pioneer. |  |
| `logistics` | Logistics | Earns, carries or delivers resources for the team: harvesting, salvage, supply runs. Also called: harvester, collector, miner, supply. |  |

**Tie-breaks** (when two terms seem to fit a source unit):

- *Raider / flanker* or *Scout / recon*: Damage first is a raider, information first is a scout. Speed alone makes a scout only when official text calls the unit a scout (by the label or an alias, such as recon). Otherwise scout needs an information part with an in-game basis: long sight, a sensor trait, stealth, or a mark or reveal ability.
- *Buffer / aura* or *Scout / recon*: Finding and marking enemies is scout; buffer is for making allies stronger.
- *Disabler / control* or *Area denial*: A disabler acts on units; area denial acts on ground.
- *Area denial* or *Artillery / siege*: A gun line that holds ground only by the threat of its fire (a sieged tank) is siege or an anti role. Area denial needs something that stays on the ground: mines, a lingering zone, turrets or fortifications.
- *Engineer / builder* or *Area denial* or *Support*: Mines, wire, walls, tank traps and turrets that block or guard ground are area denial. Engineer is for buildings that serve the team (barracks, outposts, spawn or supply points, bridges) and for taking buildings over. Repairing or healing is support.
- *Engineer / builder* or *Infiltrator / saboteur* or *Logistics*: Capturing map control points is a game-mode rule, so a faster capture rate supports no role. Engineer needs structures the unit builds, neutral buildings it converts, or enemy buildings it takes over and keeps. Logistics needs resources the unit gathers, carries or earns by its own action. Infiltrator needs spying, theft or sabotage from inside.
- *Infiltrator / saboteur* or *Anti-armour* or *Anti-infantry* or *Engineer / builder* or *Raider / flanker*: Ask what the unit does once it gets in or onto its target. If it destroys a unit (an infesting drone, a charge stuck to a tank), use the anti role for that unit: anti-armour for vehicles, anti-infantry for soldiers. If it takes over a building and keeps it, it is an engineer. Infiltrator is for spying, theft and sabotage from inside, or for passing as the enemy. A fast unit that hunts workers or harvesters from outside is a raider.

<a id="mobility"></a>
### Mobility types (`mobility`)

How the unit moves. Each type lists the classes that may use it (this is how 'aircraft don't get tracks' is enforced), its default handling, the speeds that make sense, and what kind of target it is (a flier is in low air or high air).

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `foot` | On foot | Walks and runs. Can take cover and enter buildings and vehicles. | classes: Infantry; handling: strafe; counts as: infantry; only with speed bands: Slow, Medium, Fast | common |
| `jetpack` | Jetpack / wings | Personal flight at low height on a jetpack or wings. Hops over walls and hovers; counts as a low flier while airborne. | classes: Infantry; handling: strafe; counts as: low air; only with speed bands: Medium, Fast | uncommon |
| `wheels` | Wheels | Fast on roads and open ground, turns in arcs, struggles on rough terrain. | classes: Tank / ground vehicle, Drone / support; handling: steer; counts as: ground vehicles; only with speed bands: Medium, Fast, Very fast | common |
| `tracks` | Tracks | Slower, but turns on the spot and handles rough ground. | classes: Tank / ground vehicle, Drone / support; handling: pivot (tank controls); counts as: ground vehicles; only with speed bands: Very slow, Slow, Medium, Fast | common |
| `legs-biped` | Two legs | Walks on two legs, stepping over low walls and swaying as it moves. Small ones are nimble; big ones are slow and imposing. | classes: Walker / mech; handling: pivot (tank controls); counts as: ground vehicles; only with speed bands: Very slow, Slow, Medium, Fast | common |
| `legs-multi` | Many legs | Three or more legs, like a spider or a four-legged walker. Stable, scuttles over rubble and can straddle obstacles. | classes: Walker / mech, Drone / support; handling: pivot (tank controls); counts as: ground vehicles; only with speed bands: Slow, Medium, Fast, Very fast | uncommon |
| `hover` | Hover | Air cushion or anti-grav. Crosses land and water, drifts in turns, avoids steep slopes. *Note:* Only for ground-level skimmers, which ground weapons hit like any vehicle. If it flies over cliffs and walls, use hovering flight (a low flier) instead. | classes: Hovercraft, Drone / support; handling: drift; counts as: ground vehicles; only with speed bands: Medium, Fast, Very fast | common |
| `rotor` | Hovering flight | Rotor, VTOL or anti-grav flight. Can hover in place and strafe. Flies low, so most direct-fire weapons can reach it, not only anti-air. | classes: Aircraft, Drone / support; handling: strafe; counts as: low air; only with speed bands: Medium, Fast, Very fast | common |
| `jet` | Jet | Fixed-wing flight. Very fast, must keep moving and attacks in passes. Flies high, so only anti-air weapons reach it. | classes: Aircraft; handling: forward only; counts as: high air; only with speed bands: Fast, Very fast | uncommon |
| `airship` | Airship | Lighter-than-air flight. Very slow and very tough; a looming, visible threat that flies high, so only anti-air weapons reach it. | classes: Aircraft; handling: drift; counts as: high air; only with speed bands: Very slow, Slow; from T3 | rare |
| `naval-surface` | Ship hull | Floats on the water surface. Research only. *(research only)* | classes: Naval (research only); counts as: naval |  |
| `naval-submerged` | Submarine | Moves underwater, surfacing to attack or be seen. Research only. *(research only)* | classes: Naval (research only); counts as: naval |  |

<a id="bodies"></a>
### Body plans (`bodies`)

The unit's upper-body shape and silhouette (legs and wheels live in mobility, scale in size). Each body lists the mobility types and sizes it fits and how its weapons can be mounted. A transforming unit records its second form's body in its modes. A mode records a second body only when the upper body changes shape (a mech folding into a jet); bracing, deploying or raising a gun in place keeps the body.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `humanoid` | Humanoid | A soldier or hero on two feet. | classes: Infantry; only with mobility types: On foot, Jetpack / wings; only with sizes: Small; only with aim / mount: Free aim, Body aim, Radial, Limited arc | common |
| `power-suit` | Power suit | Powered armour, an exosuit or a battlesuit around one pilot. At small size (one soldier's size, such as power armour) it is infantry; at medium size or bigger it is a walker. | classes: Infantry, Walker / mech; only with mobility types: On foot, Jetpack / wings, Two legs; only with sizes: Small, Medium | uncommon |
| `beast` | Creature | A war animal or creature of any size, from an attack dog to a giant beast. | classes: Infantry, Walker / mech, Aircraft, Drone / support; rare on: Drone / support; only with mobility types: On foot, Two legs, Many legs, Hovering flight; only with aim / mount: Free aim, Body aim, Radial | rare |
| `hull-turret` | Hull with turret | A chassis with a rotating turret: the classic tank shape, also on legs. | classes: Tank / ground vehicle, Hovercraft, Walker / mech; only with mobility types: Wheels, Tracks, Hover, Many legs; only with sizes: Medium, Large, Huge; only with aim / mount: Free aim, Slow turret, Auto-target, Limited arc | common |
| `casemate` | Fixed-gun hull | A chassis with a forward-fixed main gun and no main turret, like a tank destroyer. | classes: Tank / ground vehicle, Hovercraft; only with mobility types: Wheels, Tracks, Hover; only with sizes: Medium, Large; only with aim / mount: Body aim, Limited arc | uncommon |
| `open-mount` | Open mount | An open-topped vehicle with an exposed weapon mount and crew, like a gun truck or buggy. | classes: Tank / ground vehicle, Hovercraft; only with mobility types: Wheels, Tracks, Hover; only with sizes: Medium; only with aim / mount: Free aim, Limited arc | common |
| `box-carrier` | Troop carrier | An enclosed hull with a passenger compartment, with at most a small turret or a remote weapon mount: APC or IFV. | classes: Tank / ground vehicle, Hovercraft; only with mobility types: Wheels, Tracks, Hover; only with sizes: Medium, Large | common |
| `multi-turret` | Multi-turret giant | A very large chassis with two or more independently turning turrets, like a super-heavy tank. | classes: Tank / ground vehicle, Walker / mech; only with mobility types: Tracks, Two legs, Many legs; only with sizes: Huge; only with aim / mount: Free aim, Slow turret, Auto-target, Limited arc; from T3 | rare |
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

**Tie-breaks** (when two terms seem to fit a source unit):

- *Troop carrier* or *Hull with turret* or *Open mount* or *Launcher rack*: A hull whose riders sit hidden and protected inside is box-carrier, even with a small turret or a roof launcher (most APCs and IFVs). Hull-turret is for tanks, whose turret and gun are the main body. Open-mount needs crew or riders who sit exposed. Launcher-rack is for a vehicle built around an exposed rack, mast or mortar, with no passenger compartment.
- *Humanoid* or *Power suit*: Power suit when the sources say the soldier wears powered armour, an exosuit or a battlesuit (Space Marines, the PlanetSide 2 MAX, Elementals). Humanoid for a soldier in ordinary body armour or carapace, however heavy. Size and armour class follow their own rules: one soldier's size is small, and the armour class comes from the armour-class steps and the soldier rule.
- *Fixed-gun hull* or *Hull with turret*: Decide by where the main gun sits: fixed in the hull is casemate, even when a small turret on top carries another seat's gun (the Magrider); in a turret is hull-turret. A roof turret's free aim then breaks casemate's mount rule, and the validator lists that as atypical.

<a id="weapon-families"></a>
### Weapon families (`weapon-families`)

What the weapon is, judged by how it behaves in the source, not by its name. Each family has defaults (damage, mount, delivery, range) and lists what it may be combined with. Air: every family lists the target types it can reach. High air is reached only by the anti-air families (flak, guided missiles, autocannons), by adaptive, which takes whatever weapon it gains, and by any weapon with the anti-air trait whose family reaches low air. Most direct-fire families reach low air; lobbed, dropped, melee and short-range area families stay on the ground, except that explosives can reach a low flier by ramming it or clinging to it. Whatever the family, a lobbed, dropped or placed shot never hits a flier. Ships (research only) are on every family's list except flak's.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `small-arms` | Small arms | Hand-held weapons that fire single shots or short bursts: rifles, carbines, pistols, SMGs and automatic rifles, and also bows, crossbows and thrown blades. | classes: all; uncommon on: Hovercraft; rare on: Aircraft; default damage: kinetic; default mount: free aim; default delivery: hitscan; default range: medium; only with damage types: Kinetic, Armour-piercing; only with weapon delivery: Hitscan, Projectile; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | common |
| `machine-gun` | Machine gun | Sustained automatic fire, from light to heavy machine guns. | classes: all; default damage: kinetic; default mount: free aim; default delivery: hitscan; default range: medium; only with damage types: Kinetic, Armour-piercing, Fire; only with weapon delivery: Hitscan, Projectile; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | common |
| `shotgun` | Shotgun | A short-range spread of pellets or slugs. | classes: all; rare on: Aircraft, Drone / support; default damage: kinetic; default mount: free aim; default delivery: hitscan; default range: short; only with damage types: Kinetic, Fire; only with weapon delivery: Hitscan, Projectile; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | uncommon |
| `sniper` | Sniper | Precision shots at long range, slow to fire. | classes: all; uncommon on: Hovercraft; rare on: Aircraft; default damage: kinetic; default mount: free aim; default delivery: hitscan; default range: long; only with damage types: Kinetic, Armour-piercing, Energy; only with weapon delivery: Hitscan, Projectile; only with target types: Infantry, Ground vehicles, Low air, Naval | uncommon |
| `autocannon` | Autocannon | Rapid medium-calibre shells. Anti-aircraft guns are often autocannons, so it is one of the few families that can reach high air. | classes: all; rare on: Infantry, Drone / support; default damage: explosive; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: Explosive, Kinetic, Armour-piercing; only with weapon delivery: Projectile; only with target types: Infantry, Ground vehicles, Low air, High air, Structures, Naval | common |
| `cannon` | Cannon | A direct-fire gun firing heavy shells. | classes: all; uncommon on: Aircraft; rare on: Infantry, Drone / support; default damage: armour-piercing; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: Armour-piercing, Explosive; only with weapon delivery: Projectile; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | common |
| `artillery` | Artillery / mortar | Shells lobbed over cover onto a target point. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft, Drone / support; rare on: Drone / support; default damage: explosive; default mount: free aim; default delivery: lobbed; default range: long; only with damage types: Explosive, Fire, Toxic, Cryo; only with weapon delivery: Lobbed; only with target types: Infantry, Ground vehicles, Structures, Naval | common |
| `rockets` | Rockets | Rockets or rocket pods with no lock and no steering by the shooter. Some correct their own course on the way (homing trait). | classes: all; default damage: explosive; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: Explosive, Armour-piercing, Fire; only with weapon delivery: Projectile, Lobbed; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | common |
| `guided-missiles` | Guided missiles | Missiles the sources say steer to the target: locked on before firing, steered by the shooter, or, in a commanded game, homing in on the target. | classes: all; default damage: armour-piercing; default mount: free aim; default delivery: lock-on; default range: long; only with damage types: Armour-piercing, Explosive, EMP; only with weapon delivery: Lock-on, Guided; only with target types: Infantry, Ground vehicles, Low air, High air, Structures, Naval | common |
| `flak` | Flak | Air-bursting shells, mainly against aircraft. | classes: all; rare on: Aircraft, Drone / support; default damage: explosive; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: Explosive; only with weapon delivery: Projectile; only with target types: Infantry, Low air, High air | uncommon |
| `flamethrower` | Flamethrower | A short-range stream of fire that sets the ground alight. | classes: all; rare on: Aircraft, Drone / support; default damage: fire; default mount: free aim; default delivery: projectile; default range: short; only with damage types: Fire, Toxic; only with weapon delivery: Projectile; only with target types: Infantry, Ground vehicles, Structures, Naval | uncommon |
| `tesla` | Tesla / electric | Electric arcs that can jump between targets. | classes: all; default damage: electric; default mount: free aim; default delivery: hitscan; default range: medium; only with damage types: Electric; only with weapon delivery: Hitscan, Beam; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | uncommon |
| `laser` | Laser | A continuous or pulsed beam of light. | classes: all; default damage: energy; default mount: free aim; default delivery: beam; default range: medium; only with damage types: Energy, Fire; only with weapon delivery: Beam, Hitscan; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | uncommon |
| `prism` | Prism | A light beam that splits or refracts to hit several targets. | classes: all; rare on: Drone / support; default damage: energy; default mount: free aim; default delivery: beam; default range: long; only with damage types: Energy; only with weapon delivery: Beam; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | rare |
| `cryo` | Cryo | A freezing ray or shell: slows, then freezes the target solid. | classes: all; default damage: cryo; default mount: free aim; default delivery: beam; default range: medium; only with damage types: Cryo; only with weapon delivery: Beam, Projectile, Lobbed; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | uncommon |
| `plasma` | Plasma / energy bolt | Bolts of charged energy, often charged up before release. | classes: all; default damage: energy; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: Energy; only with weapon delivery: Projectile; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | uncommon |
| `sonic` | Sonic | Sound or pressure waves that push targets and pass through them. | classes: all; rare on: Aircraft, Drone / support; default damage: sonic; default mount: free aim; default delivery: beam; default range: short; only with damage types: Sonic; only with weapon delivery: Beam, Projectile; only with target types: Infantry, Ground vehicles, Structures, Naval | rare |
| `blades` | Melee weapon | Blades, claws, fists, hammers, saws or drills used up close. | classes: all; uncommon on: Hovercraft; rare on: Aircraft; default damage: melee; default mount: free aim; default delivery: melee; default range: melee; only with damage types: Melee, Electric, Energy; only with weapon delivery: Melee, Attach; only with target types: Infantry, Ground vehicles, Structures, Naval | uncommon |
| `chemical` | Chemical / radiation | Toxic gas, acid or radiation that lingers as a hazard zone. | classes: all; rare on: Hovercraft, Drone / support; default damage: toxic; default mount: free aim; default delivery: projectile; default range: short; only with damage types: Toxic; only with weapon delivery: Projectile, Lobbed, Drop; only with target types: Infantry, Ground vehicles, Structures, Naval | rare |
| `explosives` | Explosives | Grenades, satchel charges, mines, sticky bombs and bomb trucks. Anti-tank charges and mines are armour-piercing. | classes: all; uncommon on: Walker / mech, Hovercraft; rare on: Aircraft; default damage: explosive; default mount: free aim; default delivery: place; default range: short; only with damage types: Explosive, EMP, Fire, Armour-piercing; only with weapon delivery: Place, Lobbed, Attach, Ram / kamikaze; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | common |
| `bombs` | Bombs | Ordnance dropped from above. *Note:* Only a flier can drop anything (the drop delivery needs one), so on infantry it means a jetpack trooper bombing from above, and a drone must fly. | classes: Infantry, Aircraft, Drone / support; rare on: Infantry; default damage: explosive; default mount: body aim; default delivery: drop; default range: short; only with damage types: Explosive, Fire, Toxic, EMP; only with weapon delivery: Drop; only with target types: Infantry, Ground vehicles, Structures, Naval | common |
| `emp` | EMP | An electric or electromagnetic pulse or ray that stops machines and shields for a time: they can't move, can't fire, or both. Little or no damage. | classes: all; default damage: emp; default mount: free aim; default delivery: projectile; default range: medium; only with damage types: EMP; only with weapon delivery: Projectile, Beam, Hitscan, Drop; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | uncommon |
| `drain` | Drain beam | A beam that pulls health or energy from the target into the attacker. *Note:* Always carries the heal-on-hit weapon trait. | classes: all; rare on: Aircraft; default damage: energy; default mount: free aim; default delivery: beam; default range: medium; only with damage types: Energy; only with weapon delivery: Beam; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | rare |
| `railgun` | Railgun / gauss | A magnetically fired slug: an instant, piercing line shot with a long reload. | classes: all; rare on: Aircraft, Drone / support; default damage: armour-piercing; default mount: free aim; default delivery: hitscan; default range: long; only with damage types: Armour-piercing, Kinetic; only with weapon delivery: Hitscan; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | rare |
| `magnetic` | Magnetic | Magnetic beams or harpoons that physically pull, lift or drag vehicles. *Note:* Can pull down a low flier such as a helicopter; jets and airships fly out of its reach. | classes: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; default damage: kinetic; default mount: free aim; default delivery: beam; default range: medium; only with damage types: Kinetic; only with weapon delivery: Beam; only with target types: Ground vehicles, Low air, Naval | rare |
| `nanites` | Nanites | A cloud or swarm of nano-machines that eats armour or repairs allies. | classes: all; default damage: toxic; default mount: free aim; default delivery: projectile; default range: short; only with damage types: Toxic, Repair; only with weapon delivery: Projectile, Lobbed, Drop; only with target types: Infantry, Ground vehicles, Structures, Naval | rare |
| `psionic` | Psionic | Powers of the mind: control, confusion, fear, or telekinesis that lifts and crushes. Machines without a crew are immune to mind control. | classes: all; rare on: Hovercraft, Aircraft; default damage: psionic; default mount: free aim; default delivery: beam; default range: medium; only with damage types: Psionic; only with weapon delivery: Beam, Hitscan; only with target types: Infantry, Ground vehicles, Low air, Naval | rare |
| `drone-launcher` | Drone launcher | Launches small drones or munitions that act on their own. | classes: all; default damage: explosive; default mount: auto-target; default delivery: projectile; default range: long; only with damage types: Explosive, Kinetic, EMP; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | rare |
| `repair-tool` | Repair tool | A torch, beam or spray that restores health to allies or vehicles instead of harming enemies. | classes: all; default damage: repair; default mount: free aim; default delivery: beam; default range: short; only with damage types: Repair; only with weapon delivery: Beam, Projectile; only with target types: Infantry, Ground vehicles, Low air, Structures, Naval | uncommon |
| `adaptive` | Adaptive | No fixed family: the weapon is taken from a passenger, a kill or the current mode. The signature pattern says how. | classes: all; only with target types: Infantry, Ground vehicles, Low air, High air, Structures, Naval | rare |
| `torpedoes` | Torpedoes | Underwater weapons. Research only. *(research only)* | classes: Naval (research only); default damage: armour-piercing; default delivery: projectile |  |
| `none` | Unarmed | No weapon. Research only; a generated card shows an empty slot instead. *(research only)* |  |  |

**Tie-breaks** (when two terms seem to fit a source unit):

- *Small arms* or *Machine gun*: Judge by how it fires, not where it sits. Pistols, rifles, carbines and SMGs are always small arms. An automatic rifle or light machine gun is small arms when the sources say it must reload every few bursts (such as the BAR), and a machine gun when it fires long, sustained bursts from a belt, drum or large box. If the sources say neither, a light machine gun is a machine gun. Any belt-fed gun, and any rotary gun firing bullets, is a machine gun, whether a soldier carries it or it sits on a mount. A mounted weapon that the sources say copies a soldier's own gun keeps that soldier's family.
- *Small arms* or *Sniper*: Sniper when the sources call it a sniper weapon, give it the game's sniper damage category, or describe slow, precise shots that reach further than ordinary rifles. Killing a soldier in one hit is not enough by itself: commandos' pistols often do. Otherwise a gun, bow, crossbow or thrown blade is small arms.
- *Machine gun* or *Autocannon* or *Cannon*: Machine guns fire bullets in long bursts. An autocannon fires shells rapidly, whether the sources call it a cannon or an autocannon; a rotary gun counts only when it fires shells. A rotary gun that fires bullets is a machine gun whatever its name (Generals' Gattling Cannon), as the small-arms rule says: what it fires wins over what it is called. A cannon fires one heavy shell at a time, with a pause between shots. Exploding rounds alone, such as bolts, do not make a gun an autocannon: it stays small arms or a machine gun by how it fires. A gun copied from a soldier is settled by the small-arms rule first.
- *Artillery / mortar* or *Cannon* or *Rockets*: Artillery when a gun or mortar lobs shells over cover onto a ground point, or when the sources call the gun artillery or indirect fire and it reaches further than the unit itself can see, so others must spot for it. A gun aimed straight at targets in view is a cannon, even when it reaches far. Rockets fired in an arc stay rockets with lobbed delivery, even when the sources call them rocket artillery.
- *Rockets* or *Guided missiles*: Guided missiles only when the sources say the missile steers to its target: it locks on before it is fired, the shooter steers it (by wire, laser, camera or crosshair), or, in a commanded game, it homes in on or tracks its target. If they do not say it steers, it is rockets, whatever the game calls it. In a piloted game (control piloted or both in data/games.json), a rocket that corrects its own course with no lock step and no warning stays rockets and takes the homing trait, and so does a rocket the sources call smart, seeking or self-guided with no lock step.
- *Prism* or *Laser*: Prism only if the beam splits or bounces to hit several targets; otherwise laser.
- *Plasma / energy bolt* or *Laser*: Bolts that travel are plasma; light that hits at once or is held on the target is laser.
- *Plasma / energy bolt* or *Cannon*: A gun that fires one heavy shot, then pauses or reloads, is plasma when the game's own description of the weapon says its shots are plasma or energy bolts or charges, and cannon when they are shells. Its damage category and its cannon-like rhythm do not decide it; say how it fires in the summary. A registry note that sends some damage categories to a bullet family still wins (PlanetSide 2's bullet types).
- *Explosives* or *Bombs*: Charges that are placed or thrown are explosives; ordnance dropped from a flier is bombs.
- *EMP* or *Magnetic* or *Tesla / electric*: EMP for an electric or electromagnetic pulse or ray whose main effect is to stop machines for a time while doing little or no damage. Code what it stops with traits: root when they can't move, silence when they can't fire, root and silence when they can do neither. Use stun only for a very short stop. Magnetic only for a weapon that physically pulls, lifts or drags its target. Tesla for electric arcs that do real damage.

<a id="damage-types"></a>
### Damage types (`damage-types`)

What a hit does. 'Strong vs', 'weak vs' and 'no effect on' are typed links to what the target is (armour class, nature, armour model, target type). They drive the generator's counter hints and are relative, not numbers. On a researched unit, pick a weapon's type with the steps under armament[].damage in docs/fields.md.

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
| `emp` | EMP | Little or no damage: it stops vehicles and drones from moving, firing or both, and knocks out energy shields, for a time. | strong vs Uncrewed machine (nature), Crewed machine (nature), Recharging shield (armour model), Charged shield (armour model); no effect on Organic (nature) |
| `melee` | Melee | Blades, claws and bites up close. | strong vs Unarmoured (armour), Light (armour); weak vs Heavy (armour), Super-heavy (armour) |
| `psionic` | Psionic | Affects minds: control, confusion, fear. | strong vs Organic (nature); no effect on Uncrewed machine (nature) |
| `repair` | Repair | Restores health to friendly units instead of harming enemies. |  |

<a id="armour-classes"></a>
### Armour classes (`armour-classes`)

How tough the unit is next to the other units of its own game, as a band. Code it with the steps in the first tie-break below. Combined with one or two armour models on the card.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `unarmoured` | Unarmoured | Flesh and cloth: soldiers and animals without armour plating. A game's basic rifle infantry is unarmoured. Never a machine. | only with sizes: Tiny, Small |
| `light` | Light | Machines that light weapons still hurt, and soldiers in real armour: buggies, jeeps, motorbikes and trucks; drones and robots no bigger than a soldier; helicopters, attack helicopters too; planes and boats; and soldiers whose game data gives them tougher armour than its basic rifle infantry, power-suit troopers included. |  |
| `medium` | Medium | Shrugs off most light weapons but is weaker than a battle tank: IFVs, APCs, half-tracks and armoured cars, light tanks, suits bigger than a soldier, and light walkers bigger than a soldier. | only with sizes: Small, Medium, Large |
| `heavy` | Heavy | The game's main battle tank and every other battle tank, whatever the game calls it (medium or heavy tank), and assault mechs. | only with sizes: Medium, Large, Huge |
| `super-heavy` | Super-heavy | The game's top heavyweights, set apart from its battle tanks: units two tanks in size or more at t3, or ones the game's armour map or registry notes make super-heavy. Super-heavy tanks, giant mechs, experimental units and big airships. | only with sizes: Large, Huge; from T3 |

**Tie-breaks** (when two terms seem to fit a source unit):

- *Unarmoured* or *Light* or *Medium* or *Heavy* or *Super-heavy*: Judge the unit as bought, without upgrades or veterancy. Go through steps 1 to 5 in order and stop at the first one that gives an answer. Then apply checks A and B and the soldier rule below, which win over every step. 1. The game's armour_map in data/games.json, with any step up or down its registry notes name. 2. The game's own armour word for this unit, when the word is light, medium or heavy; for sc2, the class its registry note gives for the unit's attributes. Skip this step for cnc-td, cnc-ts, cnc3, coh1, coh2 and coh3, whose words cut across our classes, and for a word from a series title that version_researched does not name. 3. The tanks whose prices are averaged in the game's cost anchor are heavy. Other tanks the anchor text mentions are not decided here. In a game without costs, its standard main battle tank is heavy. 4. The kind of unit named in the class descriptions. The kind decides, however tough this unit is next to others of its kind. 5. For a kind named nowhere, compare its health (shields included) and the weapons that hurt it with the step 3 tank (heavy) and with the game's basic rifle infantry (unarmoured). Check A: super-heavy is only for a unit two tanks in size or more (body size huge) at t3, or in a game without tiers, and for a unit the game's armour_map or registry notes make super-heavy. Such a unit is super-heavy whatever the steps gave. Check B: a machine is never unarmoured; where a step gives unarmoured, code light. Say in armour.notes which step or check decided, and mention armour upgrades there.
- *Unarmoured* or *Light* or *Medium*: A soldier or animal is unarmoured, unless step 1 or 2 gives more, or its game data gives it tougher armour than the game's basic rifle infantry: a tougher infantry armour type or attribute, or body armour its registry notes name. Then it is light. A power suit worn by one soldier (body size small) is light, unless step 1 or 2 gives more (Dawn of War Terminators are medium by the dow1 armour map) or it is the game's basic rifle infantry, which stays unarmoured whatever it wears (the StarCraft II Marine); a suit bigger than a soldier (body size medium or more) is medium. Protection every soldier of the game can get, such as cover, veterancy ranks or the retreat bonus, never lifts the class; mention it in armour.notes.

<a id="crew-models"></a>
### Crew models (`crew-models`)

Who operates the unit, and how many players that takes. Passenger seats are counted separately, so any crew model can also carry passengers. That covers the brief's 'transport with passengers' (shown on the card whenever there are passenger seats) and IFVs that have both a gunner and passengers.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `solo` | Solo | One player moves, aims and uses abilities. *Coding rule:* In-game for a unit with one player seat in the source (a MechWarrior mech, a PlanetSide 2 Lightning). The proposal for every unit without player seats unless driver-gunner, squad or remote applies. A crew named in lore or voice lines does not change it. *Seen in:* Titanfall: one pilot runs the Titan, which fights on its own when the pilot gets out; MechWarrior: one pilot per mech; PlanetSide 2: the Lightning light tank is built for one player. | seats: Driver / pilot; players 1-1 | common |
| `driver-gunner` | Driver + gunner | Two operating seats: the driver moves (and may fire the main gun), the gunner mans a turret. Each weapon records which seat fires it; the solo fallback says what a lone player can do. *Coding rule:* In-game when the source has a driver seat and a separate gun seat. As a proposal, only for a vehicle, walker, hover or aircraft of medium size or bigger, never a power suit, that fires two weapons at the same time from separate mounts. A separate mount aims on its own: a roof gun, a gun on the front or side of the hull, a second turret. A gun that turns with the main gun is the same mount. These do not count: weapons swapped by a mode or toggle; weapons the source picks by target type (one for ground, one for air), which fire one at a time; weapons added by an upgrade, a passenger or a kill; and point defence that fires by itself. If the source doesn't say whether two weapons fire together, count them as one at a time. The driver keeps the main weapon and the gunner gets the others (decision 2A). *Seen in:* Battlefield and PlanetSide 2 battle tanks: the driver fires the main gun, a second seat mans a top gun; C&C Renegade: the driver drives and the gunner fires; alone, the driver fires too; Foxhole light tanks: the driver only drives, a separate seat fires the main gun; Halo Warthog: driver, turret gunner and a passenger. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; rare on: Infantry; only with sizes: Medium, Large, Huge; never with body plans: Power suit; seats: Driver / pilot, Gunner; players 1-2 | common |
| `driver-gunner-commander` | Driver + gunner + commander | Adds a commander seat that spots and marks targets, sees further, and triggers abilities or a secondary weapon. *Coding rule:* In-game only, when the source has a separate seat that spots, marks or commands, or a crew seat that only loads, repairs or runs systems. A gunner seat whose loadout swaps its gun for spotting tools is still a gunner. Never proposed for a unit without player seats. *Seen in:* Foxhole battle tanks: driver, gunners, a commander with a better view, and an engineer who reloads and repairs; Battlefield 3 main battle tanks: the CITV Station unlock opens a third seat, a commander with zoom, thermal vision, laser designation and a motion sensor but no weapon. | classes: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; only with sizes: Large, Huge; from T2; seats: Driver / pilot, Gunner, Commander; players 1-3 | uncommon |
| `squad` | Squad | One player leads a small group (a leader with AI followers, or a pack of tiny drones) that moves as one; losing members weakens it before it dies. *Coding rule:* In-game when the source moves two or more soldiers or tiny drones as one unit for their whole life, with one order and a shared fate (Company of Heroes or Dawn of War squads). Units bought in pairs that then act alone are solo. *Seen in:* Company of Heroes: infantry squads share one health bar but lose firepower as soldiers die. | classes: Infantry, Drone / support; only with sizes: Tiny, Small; seats: Driver / pilot; players 1-1 | rare |
| `remote` | Remote operator | The player pilots a remote body while their own soldier stays parked and vulnerable; losing the remote returns them to that soldier. *Coding rule:* Only when the source has a person who stays on the field, outside the machine, while steering it (a soldier who parks to fly a drone). A note in the lore that the machine was once remote-controlled does not count. | classes: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft, Drone / support; rare on: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; never with on death: Pilot eject, Bail out; never with nature: Organic, Crewed machine; seats: Driver / pilot; players 1-1 | rare |

**Tie-breaks** (when two terms seem to fit a source unit):

- *Solo* or *Driver + gunner*: A unit with player seats copies them, however many weapons its one pilot fires. For a unit without player seats, count what the source unit does, not what its text says: two weapons firing at the same time from separate mounts make driver-gunner (its coding rule says what doesn't count); anything else is solo. Faction flavours never decide a source unit's crew; they only weight generated cards.
- *Solo* or *Remote operator*: Remote only when an operator stays on the field in the source. Otherwise an uncrewed machine is solo.

## Supporting vocabularies

<a id="ability-kinds"></a>
### Ability kinds (`ability-kinds`)

How an ability is triggered. 'Uses a key' kinds count toward the tier's key budget.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `active` | Active | Press to use. It may have a cooldown, a cost per use, or neither. | uses a key |
| `toggle` | Toggle / mode switch | Switches between two modes, such as two weapons. | uses a key |
| `deploy` | Deploy | Becomes stationary to gain a stronger mode. | uses a key |
| `channel` | Channel | Hold to keep it going; ends on release, interruption or when its resource runs out. | uses a key |
| `ultimate` | Ultimate | Charges up over time or through play. | from T3; uses a key |
| `passive` | Passive | Always on. |  |
| `triggered` | Triggered | Happens on an event: on a kill, on death, when hit. |  |

**Tie-breaks** (when two terms seem to fit a source unit):

- *Toggle / mode switch* or *Deploy*: Pick deploy when the unit cannot move at all in one of the two states: it has to stop and set up. Pick toggle when it can move in both, even if it is slow or cannot fire while moving in one of them.
- *Active* or *Channel*: Pick channel when the source says you hold the key to keep the effect going (press and hold to burn a boost, to keep a beam or a shield up), or that it stops as soon as you let go, move or are interrupted. Holding a key to aim or charge and releasing it to act is not channel: the effect starts on release. A timed action that runs to its end on its own is active.
- *Active* or *Ultimate*: Ultimate when the source says the button must be charged before each use, through play (kills, damage dealt or taken) or by a charge meter of its own, even when it also has a cooldown; band that cooldown as given. Active when only a cooldown or a stock holds it back.
- *Passive* or *Triggered*: Pick triggered when each event causes a one-off effect, such as taking a weapon on a kill or exploding on death. Pick passive when the effect is always on, including bonuses that build up from events and then stay, such as ranks.

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

**Tie-breaks** (when two terms seem to fit a source unit):

- *Upgrade* or *Commander power*: Pick commander-power when the unlock comes from the side's own power menu or tree, picked during the match outside any building: a doctrine, protocols, a general's promotions, battlegroups, leader powers. What it costs does not matter. Pick upgrade when it is bought or researched at a building or on the unit, even when it then reaches every unit of that type.
- *Loadout option* or *Upgrade*: Pick loadout when the player picks it from a set of choices when buying, spawning or fitting the unit. How a choice was first unlocked (score, rank, progression) does not matter. Pick upgrade when it is bought during the match and then stays.
- *Innate* or *Veterancy*: Pick veterancy only when the ability itself first appears at a rank. An ability the unit has from the start is innate, even if ranks make it stronger. A cost per use, such as reinforcing or munitions, does not change the source.

<a id="aim-models"></a>
### Aim / mount (`aim-models`)

How a weapon's mount relates to movement. The biggest change from an RTS, where the game aims for you.

| Id | Label | Meaning | Rarity |
|---|---|---|---|
| `free-aim` | Free aim | The weapon points at the cursor independently of movement: drive one way, shoot another (twin-stick). | common |
| `slow-turret` | Slow turret | Free aim, but the turret turns slowly behind the cursor, so close flankers can out-turn it. *Coding rule:* The main turret of a large or huge unit that moves on the ground, and any gun that turns with it. | common |
| `body-aim` | Body aim | The weapon points where the unit faces; you aim by turning the whole unit. *Coding rule:* A fixed weapon fired from the driver seat. Never on a gunner, commander or passenger seat. | common |
| `limited-arc` | Limited arc | The mount covers only part of the circle, for example the front quarter. *Coding rule:* A mount the source shows covering only part of the circle, including a set-up heavy weapon carried by soldiers. A gun that turns only a little off the nose is body-aim. | uncommon |
| `auto-target` | Auto-target | The weapon picks its own targets in range; the player handles positioning. | uncommon |
| `radial` | Radial | Hits all around the unit at once (pulse, aura); you aim by where you stand. | uncommon |

**Tie-breaks** (when two terms seem to fit a source unit):

- *Radial* or *Auto-target* or *Limited arc* or *Free aim* or *Slow turret* or *Body aim*: Go down this list and take the first that fits. (1) It hits all around the unit at once, like an aura or a pulse: radial. (2) It fires by itself while the unit's player does something else (point defence, interceptors, a deployed sentry gun, or launched drones that act on their own): auto-target. In a commanded game every weapon picks targets for itself, so there (2) needs one of those kinds; a turret carried on the unit (an add-on or a roof gun) goes on to the later steps, even when it picks its own targets while the unit is idle. (3) The source shows it covering only part of the circle: a gun on the side or front of a hull, a door gun, a tail gun, a mech torso that twists only partway, or a soldiers' heavy weapon that must be set up and then covers only an arc (a machine-gun team, a field gun): limited-arc. A gun that turns only a little either side of the nose (a tank destroyer) counts as fixed; see (6). If the source doesn't say how far a turret turns, treat it as a full turret. (4) A soldier or creature carries it, or it is built into a tiny or small body: free-aim. A squad's weapons all take the leader's mount. (5) It sits on a full turret, or on a torso that turns all the way round: slow-turret for the main turret (the one holding the main weapon) of a large or huge unit that moves on the ground (tracks, wheels, legs or hover), free-aim for any other turret (on a medium vehicle, a roof gun, a chin gun, a turret holding only another seat's weapon, any aircraft turret). A gun that turns with the main gun takes the same mount. (6) It is fixed and fires where the unit faces (no turret, wing pods, forward launchers, bombs): body-aim. If a seat other than the driver fires it, use free-aim instead, because that seat cannot turn the unit. The family's default mount only fills in when the source says nothing about how the weapon is mounted.

<a id="armour-models"></a>
### Armour models (`armour-models`)

How the unit absorbs damage. A card has one or two; a researched unit up to three. If more apply, first keep the models the unit has without any loadout pick; then keep the rarest (rare, then uncommon, then common; on a tie, the one listed first here). Name the others in armour.notes. Shields you switch on, barriers that protect allies, invulnerability and 'draw fire' are abilities, so they live in patterns instead. Code what this unit has. Protection that comes from where it stands (cover), from rank (veterancy), from an order every unit of its kind has (the retreat bonus) or from game settings (difficulty) is not a model, even though the unit benefits; mention it in armour.notes. A model built into the unit's own armour counts even when every unit of its kind in the game shares it (Company of Heroes rear armour). For a squad, code what protects each member; losing members is part of the squad crew model. A model that only an optional loadout pick gives (reactive armour, an auto-repair module, a shield item) still counts; say in armour.notes that it is a pick. Sensor traits differ: a sensor pick goes to sensors.notes, because a pick that changes how a unit is hit changes what beats it, while a sensor pick rarely does.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `flat-pool` | Single health bar | One health bar and nothing more: every hit just subtracts. The easiest to read. *Coding rule:* Code it only when no other model on this list applies, and never together with another model. Damage scaled by armour type or class, as in most strategy games, is the armour class's job: it does not rule out flat-pool, and it does not make the unit another model. *Seen in:* Red Alert 3: the Multigunner IFV has one health value; its armour type only scales the damage each kind of weapon does; Iron Harvest: fixed damage per armour class comes straight off health. |  | common |
| `directional` | Directional armour | The front is tougher than the sides and rear, so flanking pays off. Reads well from above if facing is obvious. *Coding rule:* Code it when the unit's own data, or a rule its game applies to every unit of its kind, makes side or rear hits do more, however little; say in armour.notes, in words, how much more. Leave it out when neither gives this unit facing values, even if some other units of its game have them. *Seen in:* Company of Heroes: rear hits multiply penetration; Broken Arrow: separate front, side, rear and top armour; tanks have almost none at the rear; PlanetSide 2: damage scales with the side the attacker stands on; Red Alert 3: mild; the tank armour sets take a little more damage on the sides and rear; Iron Harvest: many mechs take double damage from behind. |  | common |
| `penetration-check` | Penetration check | Each hit is checked against the armour, and depending on angle or the weapon's penetration it may bounce for little or no damage. *Seen in:* Company of Heroes: every hit rolls its penetration chance and bounces on a failure; Foxhole: hidden armour points; penetration chance rises as armour wears down; Wargame and Broken Arrow: weapons below the target's armour value do little or won't fire. | only with armour classes: Medium, Heavy, Super-heavy | uncommon |
| `zonal` | Zonal damage | Parts such as tracks, turret, engine, rotor, legs or a weapon can be knocked out by damage before the unit dies, switching that function off for a while or for good. The part may be chosen by where the hit lands, by a heavy hit or by chance. *Coding rule:* Code it when the sources say damage the unit takes can switch off one function (movement, steering, the turret or a weapon) while it lives on, however the part is chosen. A function lost because a crewman no player controls is hit (a gunner killed) counts too. A stun, root, slow or shutdown that comes from an enemy weapon's own effect is that weapon's trait or damage type, not zonal. Being disabled as a whole and burning at low health is critical-burn, not zonal. *Seen in:* MechWarrior and BattleTech: head, arm, leg and torso locations with their own armour; Foxhole: tracks, turret and fuel can be disabled by hits there; Company of Heroes: critical hits damage engines or kill gunners; Battlefield 4: a heavy hit can knock out a vehicle's movement, or a helicopter's control, for a few seconds; Wargame: critical hits on the crew disable specific systems. | never with sizes: Tiny, Small | uncommon |
| `crew-casualties` | Crew casualties | Hits can knock out seats: in a multi-seat vehicle a player can be ejected or killed while the vehicle survives. *Coding rule:* Code it only when hits can kill or throw out a player inside while the vehicle survives (open seats, shots through the glass). It needs two or more player seats, passenger seats included. Never for a squad: losing members is part of the squad crew model. A hit that only switches off a function by hurting a crewman no player controls is zonal. *Seen in:* Foxhole: exposed seats leave their occupants open to fire. | never with crew models: Squad, Remote operator; needs Driver + gunner (crew) or Driver + gunner + commander (crew) or at least 1 passenger seat(s) | rare |
| `regen-shield` | Recharging shield | A shield layer over health soaks damage and recharges after a short pause without being hit. *Seen in:* Halo: shields refill a few seconds after the last hit; StarCraft II: Protoss shields regenerate out of combat; PlanetSide 2: every soldier has a regenerating personal shield. |  | uncommon |
| `charge-shield` | Charged shield | A shield with its own charge that reduces incoming damage while it lasts; once drained, it has to be recharged with an item or at a station. *Seen in:* ARC Raiders: light, medium and heavy shields take roughly half of each hit while charged; heavier ones slow you; refilled with recharger items or power cells from destroyed machines. |  | uncommon |
| `ablative-plates` | Ablative plates | Armour plates soak hits and break off one by one, exposing the hull. *Seen in:* Battlefield 3: reactive armour panels cancel the first anti-vehicle hit on each side; ARC Raiders: a heavy round can blow armour plates off a drone; BattleTech: bolt-on modular armour soaks damage first. | never with armour classes: Unarmoured | uncommon |
| `damage-reduction` | Damage reduction | Armour takes a fixed amount off every hit, so small hits do little or nothing. *Coding rule:* Code it only when the game takes a fixed amount off each hit, and that amount changes which weapons work: the weapon of the game's basic rifle infantry loses a quarter or more of each hit to it. Judge the unit as bought, without upgrades. A smaller value only trims hits; mention it in armour.notes, in words. A cut by percentage or by damage type (guns doing half damage to tanks, small arms doing nothing to vehicles) belongs to the armour class and the damage map, not to this model. *Seen in:* StarCraft II: each unit's armour value comes off every hit; on the most armoured units, such as the Ultralisk or the Battlecruiser, a Marine's rifle loses a large part of each hit. | only with armour classes: Medium, Heavy, Super-heavy | uncommon |
| `self-repair` | Self-repair | Slowly regains health on its own, often only out of combat. *Note:* Passive. A heal on a key is the heal-self pattern; healing by dealing damage is the heal-on-hit weapon trait. *Seen in:* PlanetSide 2: an auto-repair module heals vehicles out of combat; Battlefield 3: vehicles slowly regain armour. |  | common |
| `evasive` | Evasive | Survives by dodging: the game gives it an explicit evasion mechanic (a dodge roll, a miss chance), not just a small size. *Coding rule:* Code it only when the unit itself has a way to dodge: a dodge roll, a stated chance to avoid hits, or a hard-to-hit value of its own that is better than the game's basic rifle infantry has. Hit chance from cover, rank or moving, which every soldier of the game gets, is not evasive. | only with sizes: Tiny, Small, Medium; only with armour classes: Unarmoured, Light, Medium | common |
| `downed-revive` | Downed, revivable | At zero health it goes down instead of dying: it can crawl, and a teammate can revive it or an enemy finish it. | classes: Infantry | uncommon |
| `weak-point` | Weak point | A small exposed spot, such as a vent, a joint or a fuel tank, takes extra damage when hit on purpose. *Coding rule:* Code it only for a spot the shooter must aim at. Extra damage to a whole side, the rear or the top is directional, even when the game calls it a weak spot. *Seen in:* ARC Raiders machines: shoot the joints and rear cylinders. |  | uncommon |
| `interceptor` | Interceptor | An active protection system shoots down incoming missiles and rockets; it has few charges and must reload, so a volley can overwhelm it. *Note:* Automatic. Flares, chaff or smoke fired on a key to shake off missiles are the fire-countermeasures pattern. *Coding rule:* Code it only when the protection fires by itself. One the player switches on with a key, even for a few seconds, is the fire-countermeasures pattern. *Seen in:* Broken Arrow: active protection stops HEAT rounds fully, kinetic ones partly, then reloads; Generals: the Paladin tank's point-defence laser shoots down incoming missiles. | classes: all; rare on: Infantry, Aircraft, Drone / support | rare |
| `critical-burn` | Critical burn | Below a health threshold it is disabled and burning, and dies unless a teammate repairs it in time. *Seen in:* Battlefield: vehicles below a threshold are disabled and burn out unless repaired; PlanetSide 2: vehicles catch fire at low health; Foxhole: many vehicles are disabled below a health threshold. | never with unit classes: Infantry; never with nature: Organic | uncommon |

<a id="availability"></a>
### Availability (`availability`)

How many of the unit a side may field at once. Count only a cap the game puts on this unit itself; a population or army cap shared by all units does not count.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `open` | Open | No cap of its own: held back only by price, tech, the population cap or respawn rules. |  |
| `limited` | Limited | The game caps this unit at a few at a time per player or side: a unit cap, a slot limit or a set number of spawns on the map. |  |
| `unique` | Unique | A one-of-a-kind character the game allows once per player or side: a named hero, a commando or the army's commander unit. This is the hero flag (decision 7B). An ordinary vehicle capped at one, by a unit cap or by map spawns, is limited. | from T2 |

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
| `high` | High | The cited sources include official text about the unit, read directly or through a faithful copy: a page that says what it copies, or an infobox description or tooltip field that the game's registry note names as a copy of in-game text and does not mark as still to be checked (the PlanetSide 2 Wiki's Description field; the StarCraft II wikis' unit description). Or they include pages from two different established sites that each describe the unit and agree. A page counts only if it is about the unit itself: its own page, or its own entry in a unit list. Patch notes and pages about other units do not count toward high. Pages of one site count as one site. Two wikis count as independent unless one names the other as its source. |
| `medium` | Medium | Everything rests on one established site (any number of its pages) or one database, and nothing contradicts it. |
| `low` | Low | From a forum, a guide, a search snippet or a single unclear source. Needs a check before use. |

<a id="cooldown-bands"></a>
### Cooldown bands (`cooldown-bands`)

How often an ability can be used: the wait from one use until it can be used again. Band the source's cooldown figure alone; do not add the time the effect lasts. Use real seconds at the game's normal multiplayer speed (StarCraft II: Faster). Where the source gives a span ("8 to 12 seconds", "up to 15 seconds"), band its largest value. For an ability with charges, band the time to regain one charge. Edges are exact, and a value on an edge takes the higher band. An ability that comes back only at a resupply point or on respawn is per-life, with or without a figure. An ability with no wait has no band: leave cooldown out. That covers instant orders such as unloading, and mode switches that only take time to finish; say in the summary, in words, how long the switch takes. An ability held back only by a stock, such as Company of Heroes munitions or the unit's energy, has no band unless the source also gives a cooldown. A boost's own fuel tank, which only that ability burns and which refills by itself, is its cooldown, not a stock: band the time it takes to refill from empty. An energy pool stays a stock even on a unit with only one ability that spends it (the StarCraft II Medivac's Heal).

| Id | Label | Meaning |
|---|---|---|
| `spam` | Spammable | Under 5 seconds; several uses in every fight. |
| `short` | Short | From 5 up to but not including 15 seconds; a couple of uses per fight. |
| `medium` | Medium | From 15 up to but not including 45 seconds; roughly once per fight. |
| `long` | Long | 45 seconds or more; a few uses per life. |
| `per-life` | Once per life | One use per life or purchase, restocked only at a resupply point or on respawn. |

<a id="cost-bands"></a>
### Cost bands (`cost-bands`)

Relative price. For source units it is relative within their own game: the games registry gives each band's lowest price, so a price exactly on a threshold takes the higher band. For generated concepts it is derived from the parts.

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

**Tie-breaks** (when two terms seem to fit a source unit):

- *Strafe* or *Pivot (tank controls)* or *Steer* or *Drift* or *Forward only*: Start from the default handling of the unit's mobility type. Change it only for one of these reasons, and name the reason in mobility.notes. (1) A tiny or small unit on legs (two legs or many) gets strafe. (2) The source clearly shows the unit can't do what the default needs: if it can't turn on the spot, pivot becomes steer; if it can't stop or hover, strafe becomes forward-only; if it can't stop quickly and only slides through turns, with no hover and no sideways move, strafe becomes drift. (3) In a game where players drive the unit (registry control piloted or both), the source clearly shows it sliding sideways at will, such as a hover tank built to strafe: strafe. Momentum, tilting to speed up, a heavy feel, or an RTS model turning on the spot never change it on their own; put them in mobility.notes. A mode with its own mobility type follows the same rule from that type.

<a id="mobility-traits"></a>
### Mobility traits (`mobility-traits`)

Extras on top of the base mobility; a card has up to two. Traits marked 'uses a key' are buttons: they count toward the tier's key budget and need their matching mechanic pattern.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `amphibious` | Amphibious | Moves on water as well as land. | classes: Infantry, Tank / ground vehicle, Walker / mech, Drone / support; never with mobility types: Hovering flight, Jet, Airship, Jetpack / wings, Hover | uncommon |
| `climb` | Climb | Climbs walls and cliffs. *Coding rule:* Code it when the sources show the unit moving up walls, cliffs or buildings that stop other units of its kind, however it holds on (legs, claws, hover thrust). A jump or a flight up or over the obstacle is not climb (see leap; a jetpack is the unit's mobility). Where the trait's rules leave out the unit's class or mobility, code it anyway; the validator lists the break as atypical, which is evidence for relaxing the rule. | classes: Infantry, Walker / mech, Drone / support; only with mobility types: On foot, Many legs | uncommon |
| `crush` | Crush | Runs over smaller units in its path: infantry and small drones; super-heavies also crush light vehicles. | classes: Tank / ground vehicle, Walker / mech, Hovercraft; only with sizes: Large, Huge | common |
| `leap` | Leap | Jumps over walls or gaps. | classes: Infantry, Tank / ground vehicle, Walker / mech, Drone / support; rare on: Tank / ground vehicle; never with mobility types: Hovering flight, Jet, Airship, Jetpack / wings, Hover; uses a key (pattern: Leap (planned)) | uncommon |
| `boost` | Boost | A short burst of speed or a dash, on a key, usable anywhere. An order that sends the unit running back to base, like Company of Heroes retreat, is not boost, and its ability links no dash pattern. A boost with no meter, cooldown or other limit is part of the unit's speed (see Speed bands), not this trait. | classes: all; uses a key (pattern: Dash (planned)) | common |
| `burrow` | Burrow / submerge | Goes underground or underwater to hide or travel; must surface to act. | classes: Infantry, Tank / ground vehicle, Walker / mech, Hovercraft, Drone / support; rare on: Hovercraft; never with mobility types: Hovering flight, Jet, Airship, Jetpack / wings; uses a key (pattern: Burrow or submerge (planned)) | rare |
| `teleport` | Teleport | Blinks a short distance or jumps through space. | classes: all; rare on: Aircraft; uses a key (pattern: Teleport (planned)) | rare |
| `transform` | Transform | Switches between two forms, such as walker and jet; the unit records the second form in its modes. | classes: all; rare on: Infantry, Drone / support; uses a key (pattern: Transform between two forms (planned)) | rare |
| `deploy-anchor` | Deploy / anchor | Stops to enter a stronger stationary mode; must pack up to move. | classes: all; uncommon on: Drone / support; rare on: Aircraft; uses a key (pattern: Deploy into siege mode (planned)) | uncommon |

<a id="nature"></a>
### Nature (`nature`)

What the unit is made of, which decides how EMP, psionic, toxic and electric attacks affect it.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `organic` | Organic | Flesh: soldiers and animals. Unaffected by EMP; vulnerable to psionic and toxic attacks. | classes: Infantry, Walker / mech, Aircraft; rare on: Walker / mech, Aircraft |
| `crewed-machine` | Crewed machine | A vehicle or mech with people inside: hit by EMP, sealed against most toxic attacks. *Coding rule:* Code it when the source shows or implies people inside: a cockpit, a pilot or crew in the fiction or the voice lines (paraphrased), crew who bail out. When the source says nothing either way, a vehicle, walker or aircraft is crewed. |  |
| `uncrewed-machine` | Uncrewed machine | A drone or robot: immune to psionic and toxic attacks, extra-vulnerable to electric and EMP. *Coding rule:* Only when the source says it is a robot, drone or remote-controlled machine. |  |

<a id="on-death"></a>
### On death (`on-death`)

What happens when the unit is destroyed. A card has one or two.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `respawn` | Respawn | Nothing is left: the unit is simply gone. In a player version the player goes back to the buy screen (a remote operator goes back to their parked soldier). *Coding rule:* In-game for a unit players drive in a game where they come back after it dies, including a vehicle whose crew die inside it. For a unit that is simply gone in the source, it is the proposal for infantry, organic units and uncrewed machines. |  | common |
| `bail-out` | Bail out | The vehicle is destroyed and its crew eject as basic infantry with low health. Everyone inside gets out, passengers too. *Coding rule:* In-game when the crew or riders get out on their own as the vehicle dies, even when only one gets out or only by chance. Jumping out by hand before it dies does not count; in our game that is the hold-X key every vehicle has. It is the proposal for any crewed machine outside the infantry class that is simply gone in the source. | never with unit classes: Infantry | common |
| `wreck` | Wreck | Leaves a wreck that teammates can repair or enemies can salvage. *Coding rule:* In-game only when the remains stay on the field and a unit can repair, recrew or salvage them in the same match. Remains that only block the way or give cover do not count, nor do crates, weapons or loot that drop for pickup or for crafting later; put those in on_death.notes. | never with unit classes: Infantry; never with nature: Organic | uncommon |
| `death-blast` | Death blast | Explodes on death, damaging everything nearby. *Coding rule:* In-game only when the source says the explosion hurts units nearby, for this unit in its own title (for a series, the titles its registry entry leads with). A blast that is only for show, or a wreck that only hurts what it falls on, does not count. |  | uncommon |
| `pilot-eject` | Pilot eject | The pilot pops out in a light suit and can reach a new unit or a pickup. *Coding rule:* In-game when the pilot leaves the wreck on their own as a unit that can keep fighting, such as walking to a new vehicle or a pickup. Ejecting by hand before the unit dies does not count. | classes: Walker / mech, Aircraft, Tank / ground vehicle, Hovercraft | uncommon |

**Tie-breaks** (when two terms seem to fit a source unit):

- *Respawn* or *Bail out*: A crewed vehicle that is simply gone in the source: bail-out, basis proposal. A vehicle players drive in a shooter whose crew die inside it: respawn, basis in-game, even when they could have jumped out by hand first.
- *Respawn* or *Wreck* or *Death blast* or *Pilot eject*: Use two outcomes only when the source shows both, such as a husk that also explodes. Never pair a sourced outcome with the 3C default.

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
| `defence` | Defence | Survives in special ways: shields, shield domes, countermeasures, armour tricks, self-repair. |
| `support` | Support | Helps teammates: heal, repair, buff, resupply, find and mark enemies for them, gather resources for the team. |
| `transport-garrison` | Transport and garrison | Carries or houses others; passengers matter. |
| `conversion` | Conversion | Turns the enemy's strength into yours: leech, salvage, mind control. |
| `area` | Area | Shapes the ground: mines, zones, cover and fortifications, terrain. |
| `summon` | Summon | Spawns drones, turrets or minions. |
| `progression` | Progression | Grows stronger during a life: veterancy, levels, kill streaks, stacking buffs. |

<a id="range-bands"></a>
### Range bands (`range-bands`)

How far a weapon reaches, relative to the top-down screen. For source units the band compares the weapon with its own game: with the reach of the game's reference weapon (registry range_reference, usually the basic rifle) and with its own unit's sight (see each term's coding rule and the tie-breaks). It does not compare the weapon with the screen or with the unit's other weapons. Each weapon gets one band, from its longest reach against any target, as the stock weapon with no upgrades or veterancy.

| Id | Label | Meaning |
|---|---|---|
| `melee` | Melee | Touching distance. *Coding rule:* Hits only at touching distance: claws, blades, a bite. A unit that leaps or latches onto its target is still melee. |
| `short` | Short | A few soldier-lengths: shotguns, flamethrowers. *Coding rule:* Longest reach under 0.7 times the reference weapon's. |
| `medium` | Medium | Comfortable on-screen distance: rifles, tank guns. *Coding rule:* Longest reach from 0.7 up to and including 1.5 times the reference weapon's. The reference weapon itself is medium. |
| `long` | Long | Near the edge of the visible screen: snipers, missiles. *Coding rule:* Longest reach over 1.5 times the reference weapon's, unless off-screen applies. |
| `off-screen` | Off-screen | Beyond the camera view; needs spotting, a zoom or a scope mode. *Coding rule:* Any one of these: the weapon is long by its reach (figure or words) and reaches past its own unit's sight figure, the figure its sight band uses (for an add-on or a turret, the unit that carries it); the source says it needs spotters or fires at targets beyond its own sight; or the shot is steered through its own camera, such as a TV-guided missile. A scope or zoom alone is not enough, and calling a weapon long-ranged never makes it off-screen. |

**Tie-breaks** (when two terms seem to fit a source unit):

- *Long* or *Off-screen*: Check off-screen first, and pick it only for the reasons in its coding rule. Its first reason needs a weapon that is long by its reach: one that reaches past its unit's sight but is short or medium by its reach keeps that band. Its second reason stands on its own, whatever the reach: a weapon the sources say fires indirectly at targets that a teammate or a spotter locks, marks or sees for it fires at targets beyond its own sight.
- *Short* or *Medium* or *Long*: Use the longest reach against any target: a launcher that reaches twice as far against aircraft is banded by its air reach. Use the maximum reach, not where the weapon works best: "best at 10-20 m" is not a reach. When the weapon or the game's reference weapon has no figure, go in this order. First, if the source compares the reach with a named weapon, start from that weapon's band: from its figure where a source or the registry gives one, otherwise from its family's default range. Keep that band, and move one band only when the source says much further or much shorter ("huge", "far"); never past long. Second, if the source calls the weapon short-, medium- or long-ranged, or says it outranges most units (long), take that band. Otherwise take the family's default range.
- *Melee* or *Short*: Melee only when the blow lands at touching distance, the unit's own leap or latch included. A shot, spray or thrown weapon that crosses any gap is short or longer.

<a id="rarity"></a>
### Rarity (`rarity`)

How readily the generator offers a term at each spice level (1 = grounded, 5 = wild). Weights are relative. A term can have its own rarity for some classes (its class rarity): a part that is possible but unusual for a class, such as a flamethrower on an aircraft, is rare there and so appears only from spice 4. A faction's favoured parts count one step more common for that faction, except where a class rarity applies. Rarity applies only to parts the generator picks; a class or part you choose yourself is always used.

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

A gauge on the unit itself that shapes how it plays. A card has at most one. A price paid from the team's or player's shared stock (Company of Heroes munitions, money for an upgrade) is not a resource; say in the ability's summary, in words, that each use draws on that stock.

| Id | Label | Meaning |
|---|---|---|
| `heat` | Shared heat | Weapons and abilities add heat to one gauge; overheating shuts the unit down briefly. |
| `energy` | Energy pool | One pool feeds weapons, shields and abilities, so the player chooses what to spend it on. |
| `fuel` | Fuel | Flight or boost time drains a gauge that refills on the ground or at a pad. A boost's own tank, which only that one ability burns and which refills by itself anywhere, is not fuel: it is that ability's cooldown (see Cooldown bands). |
| `limited-ammo` | Limited ammo | Total ammo is finite and does not come back on its own over time; only a supporter, a pickup or the base refills it, if anything does. Ammo that comes back on its own is the weapon's magazine trait, not this. |
| `kill-charge` | Kill charge | A meter filled by kills or damage dealt powers an upgrade or an ultimate. |

<a id="seat-roles"></a>
### Seat roles (`seat-roles`)

What one player in a multi-seat unit controls.

| Id | Label | Meaning |
|---|---|---|
| `driver` | Driver / pilot | Moves the unit. In a solo unit also aims, fires and uses abilities. *Coding rule:* Never written on a source unit. A weapon or ability with no seat belongs to the driver. |
| `gunner` | Gunner | Aims and fires a weapon. |
| `commander` | Commander | Spots, marks and sees further; triggers abilities or a secondary weapon. Also a crew seat that only loads, repairs or runs systems; list it in crew.seats and say what it does in crew.notes. *Seen in:* Foxhole: the commander directs the crew and can open the cupola to look out; Battlefield 3 main battle tanks: the CITV Station seat laser-marks targets for the driver's guided shells. |
| `passenger-cargo` | Passenger (cargo) | Rides inside, protected, and can't act until they get out. |
| `passenger-firing` | Passenger (firing) | Rides inside and fires their own weapon out of a port or an open top. *Seen in:* PlanetSide 2: rumble seats let riders use their own weapons, exposed to fire; Halo: the Mongoose passenger fires their own weapon. |
| `passenger-module` | Passenger (module) | Who rides inside decides the vehicle's weapon or ability; the passenger may aim it. *Seen in:* Red Alert 3: the Multigunner IFV's weapon depends on its passenger. |

<a id="sensor-traits"></a>
### Sensor traits (`sensor-traits`)

Always-on ways a unit finds enemies or hides from them, on top of its sight band. They need no key; the same effects on a key are patterns (cloak, reveal an area, mark a target, jam sensors, fire countermeasures). For source units, list only the traits the stock unit has whatever its loadout. A sensor from a loadout pick, an upgrade or veterancy goes in sensors.notes. Never add a trait as a proposal.

| Id | Label | Meaning | Rules | Rarity |
|---|---|---|---|---|
| `radar` | Radar | Shows enemies in a wide circle beyond its sight as blips on the team's minimap: where they are, not what they are. A blip can't be aimed at until someone sees it, and stealthy enemies don't show. | classes: all; rare on: Infantry | uncommon |
| `detector` | Detector | Reveals stealthy, cloaked, burrowed and disguised enemies close to it, for the whole team. | classes: all | uncommon |
| `stealth` | Stealth | Hard to spot: enemies see it only at close range, and radar never shows it. Firing gives it away for a moment, and a detector nearby reveals it. *Note:* Always on. Turning fully invisible, on a key or not, is the cloak pattern. | classes: all; rare on: Tank / ground vehicle, Walker / mech, Hovercraft, Aircraft; never with mobility types: Airship; never with sizes: Huge | uncommon |
| `lingering-sight` | Lingering sight | Enemies it sees stay marked for the whole team for a few seconds after they leave its sight, visible through walls and fog while the mark lasts. *Note:* Unlike the mark weapon trait, it marks everything it sees, not only what it hits, and adds no extra damage. Not the spotter team-play hook, which covers any way of spotting for the team. | classes: all | uncommon |
| `jammer` | Jammer | Hides itself and allies close to it from radar and lock-ons: they show on no minimap and can be targeted only by sight. *Note:* Always on. A jamming bubble on a key is the jam-sensors pattern; flares or chaff fired on a key to break a lock are the fire-countermeasures pattern. *Seen in:* MechWarrior Online: the Guardian ECM hides the mech and nearby allies from enemy sensors. | classes: all; rare on: Infantry | uncommon |

<a id="sight-bands"></a>
### Sight bands (`sight-bands`)

How far a unit sees through the fog of war, measured against the top-down screen. Walls and buildings block sight, and what one unit sees its whole team sees. For source units, compare the unit's sight with the sight of the game's reference unit (registry sight_reference, usually its basic rifle infantry). Use the stock unit in its default mode, and put a mode or upgrade that sees further in notes. Use the figure for how far it clears the fog; the registry says which one where a game lists two. A grade on the game's own word scale (Wargame optics) counts as a figure; the registry says which grades are short, medium and long. A statement about a group the unit belongs to ("all infantry see 35 m", "most units see 35 m") counts as its figure, unless the source names an exception that covers it. With no figure, or in a game with no fog of war, the band is medium and a proposal. A scout or recon label, other words ("sees far"), height, and zoom or thermal sights do not change it; the scout role carries scouting.

| Id | Label | Meaning |
|---|---|---|
| `short` | Short | Clears the fog only well inside the screen, so the edges of the player's own view stay dark until a teammate sees them. *Coding rule:* Sight under 0.7 times the reference unit's, or a grade the registry calls short. |
| `medium` | Medium | Clears the fog to about the edges of the screen: the player sees what the camera shows. The usual sight. *Coding rule:* Sight from 0.7 up to and including 1.5 times the reference unit's; the reference itself is medium. Also a grade the registry calls medium, and the band for a unit with no sight figure or in a game with no fog of war. |
| `long` | Long | Sees past the edge of the screen. The player can't look that far, so the extra reach serves the team: enemies out there show on the minimap and on the screens of teammates nearer to them. *Coding rule:* Sight over 1.5 times the reference unit's, or a grade the registry calls long. |

<a id="sizes"></a>
### Sizes (`sizes`)

Footprint seen from above, which sets the hitbox. Pick the band whose examples name what the unit is. Examples win over measurements, because strategy games draw soldiers oversized. A weight word in the unit's type (light, medium or heavy tank or mech) is not a size. Count the hull, fuselage and wings, not a rotor disc or a gun barrel. Only for a unit that no example covers, measure. Compare it with the same game's foot soldier: one soldier is small, two to three soldier-widths is medium. In a game with no foot soldiers, compare it with its main battle tank: clearly smaller is medium, about the same is large, twice or more is huge.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `tiny` | Tiny | Clearly smaller than one soldier of its own game: hand-sized or knee-high drones and bots, animals smaller than a dog. Hard to hit, easy to lose sight of. A unit the game handles like a soldier (it fills an infantry seat in a transport, or the game counts it as infantry) is small, however small it looks. |  |
| `small` | Small | One soldier: infantry, power-suit troopers, war dogs, and robots or drones the game handles like a soldier. |  |
| `medium` | Medium | About two to three soldier-widths: buggies, cars, armoured cars, APCs and IFVs, light mechs and light walkers, light scout helicopters. |  |
| `large` | Large | Tanks of every weight (light, medium and heavy tanks, tank destroyers, self-propelled guns), carriers built on a tank hull, medium to assault mechs, attack and transport helicopters, jets. |  |
| `huge` | Huge | Two tanks or more: super-heavies, giant mechs, airships. | from T3 |

<a id="solo-fallback"></a>
### Solo fallback (`solo-fallback`)

What a lone player can do in a multi-seat unit.

| Id | Label | Meaning | Rarity |
|---|---|---|---|
| `full-control` | Full control | Alone, the player drives and still fires a weapon: the driver seat's own weapons, or a weapon the source hands to a lone driver. Weapons in other seats either pass to the driver or wait for a teammate; say which in crew notes. *Seen in:* C&C Renegade: the driver takes over the weapon whenever the gunner seat is empty; Battlefield tanks and attack helicopters: the driver keeps the main gun or the rockets, while the second seat's gun waits for a teammate; PlanetSide 2: a lone Liberator pilot fires the nose gun and may hop to the belly gun mid-fight; the tail gun waits for a teammate. | common |
| `seat-swap` | Seat swap | Alone, the player must change seats to shoot, because no weapon works from the driver seat: drive or shoot, not both. *Seen in:* PlanetSide 2: the Sunderer's driver has no gun, so a lone driver hops into a gun seat to fight. | rare |
| `auto-gunner` | Auto-gunner | Empty gun seats fire on their own at reduced accuracy until a player takes them. *Seen in:* Halo campaign: computer-controlled gunners man the turret. | uncommon |
| `needs-crew` | Needs crew | Even by changing seats, a lone player can't do a core job, such as firing the main gun, because the source needs two seats working at once. | rare |

**Tie-breaks** (when two terms seem to fit a source unit):

- *Full control* or *Seat swap* or *Needs crew* or *Auto-gunner*: Ask what one player alone can do, in this order. (1) The source makes empty gun seats fire by themselves: auto-gunner. (2) A lone driver can still fire something, their own weapon or one the source hands over: full-control, even when other seats' guns go quiet. (3) A lone player can reach the guns by changing seats, even slowly: seat-swap. (4) Otherwise: needs-crew. A proposal crew is always full-control (decision 2A).

<a id="source-kinds"></a>
### Source kinds (`source-kinds`)

Where a citation comes from, in order of preference.

| Id | Label | Meaning |
|---|---|---|
| `official` | Official | Publisher or developer, read on their own site (or an archived copy of it, such as the Wayback Machine) or in the game: manual, official site, patch notes, developer posts, in-game text. |
| `wiki` | Established wiki | A large, maintained community wiki for the series, including one the developer endorses as its official wiki. A wiki page that copies official text is still a wiki source: say in its note that it copies official text and where the original is. |
| `database` | Game database | Data-mined values or stat databases. |
| `guide` | Guide | Published strategy guides or long-standing community guides. |
| `video` | Video | Gameplay footage, cited with a timestamp in the note; official developer videos count as official. |
| `community` | Community | Forums and discussion threads. Low confidence on their own. |

**Tie-breaks** (when two terms seem to fit a source unit):

- *Official* or *Established wiki*: Code the site you actually read. A wiki page that copies an official profile, manual page or in-game text is wiki, with a note naming the original; confidence still counts the copied text as official. A wiki the developer calls official is still a wiki, because players write it.

<a id="speed-bands"></a>
### Speed bands (`speed-bands`)

Speed as a ratio to a reference unit. For source units it is the game's speed reference, named in the games registry: usually its basic rifle infantry, or a basic bot or medium mech where the game has none. Every unit of the game is compared with it, vehicles and aircraft included. For generated cards it is a Shamble Frontlines soldier. Compare the speeds each can keep up for as long as it likes: count a sprint or a boost only when nothing limits it (no meter, stamina or cooldown), for the reference and the unit alike. Use the stock unit: no upgrades, empty, at full health. Use the way it moves in a fight: flying speed for units that fight in the air, water speed for boats, land speed for the rest, amphibious and hover units included. Use plain open ground: the off-road speed where a game gives road and off-road speeds, off creep, with no other terrain bonus. A ratio exactly on an edge goes to the band nearer medium: 0.7 is slow, 1 and 1.5 are medium, 2.5 is fast. The validator computes the band from speed_raw the same way. With no usable figure, use comparisons. A source that compares the unit with a unit that has a band ("faster than the Prowler", "keeps pace with infantry") gives that unit's band, moved one band only when it says much faster or much slower. A speed word on its own ("fast", "slow moving") sets the band of the same name only where the registry's speed_reference says the game's words are read that way (Halo Wars 2); elsewhere it describes the unit among its own kind, so put it in notes. With nothing usable, judge from figures for neighbouring units or from footage, and add an uncertain entry for mobility/speed. If the judgement cannot tell which side of an edge the unit falls on, take the band nearer medium, as for a ratio exactly on an edge, and say so in that uncertain entry. Source units have no band for standing still.

| Id | Label | Meaning |
|---|---|---|
| `very-slow` | Very slow | Under 0.7 times the reference. |
| `slow` | Slow | From 0.7 up to but not including 1 times the reference. |
| `medium` | Medium | From 1 up to and including 1.5 times the reference. The reference unit itself is medium. |
| `fast` | Fast | Over 1.5 and up to and including 2.5 times the reference. |
| `very-fast` | Very fast | Over 2.5 times the reference. |

<a id="target-types"></a>
### Target types (`target-types`)

What a weapon can hit (on a weapon) or what kind of target a unit is (from its mobility; a tiny or small ground unit counts as infantry). Fliers are in one of two air layers: low air, which most direct-fire weapons can reach, and high air, which only anti-air weapons reach.

| Id | Label | Meaning |
|---|---|---|
| `infantry` | Infantry | Soldiers, animals and other infantry-sized ground targets, including small ground drones. |
| `ground-vehicle` | Ground vehicles | Vehicles, walkers and hovercraft. |
| `low-air` | Low air | Helicopters, flying drones, jetpack troops and other low fliers. Most direct-fire weapons can reach them, not only anti-air. |
| `high-air` | High air | Jets and airships flying high above the fight. Only anti-air weapons reach them. *Coding rule:* On a weapon: in a commanded game, list it for any weapon the sources say can attack air units, unless the game splits its fliers and this weapon cannot reach its jets or airships. In a piloted game (control piloted or both in data/games.json), list it only for a weapon built to bring down aircraft: the sources call it anti-air or anti-aircraft, it locks onto jets, or it is a flak gun. A weapon that could hit a passing jet by chance does not count. |
| `structure` | Structures | Buildings, turrets and deployables. |
| `naval` | Naval | Ships, boats and submarines. Research only. *Coding rule:* On a weapon: in a game with ships or boats, list naval on every weapon that lists ground-vehicle, unless the sources say it cannot reach ships. In a game without ships or boats, never list it. *(research only)* |

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

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `hitscan` | Hitscan | Hits instantly along the line of fire. |  |
| `projectile` | Projectile | A visible shot with travel time that can be dodged. |  |
| `beam` | Beam | A continuous beam held on the target; the effect builds while it stays on. |  |
| `lobbed` | Lobbed | Indirect fire: the shot arcs over cover onto a ground point, or lands on a target the shooter cannot see itself, which others must spot. Usually slow to land, often with a minimum range. It never hits fliers. | only with target types: Infantry, Ground vehicles, Structures, Naval |
| `lock-on` | Lock-on | Hold on a target to lock, then fire homing shots; the target gets a warning. | never with weapon traits: Homing |
| `guided` | Guided | You steer the shot in flight by keeping your aim on it; it is lost if you stop aiming, so the shooter stays exposed until it lands. It reaches whatever its family reaches. *Note:* The player does the steering, so it needs a mount the player aims (not auto-target or radial) and no homing trait, and it is a medium-range or longer shot. A shot that steers itself after a lock is lock-on; one that steers itself with no lock step is projectile with the homing trait. *Seen in:* Battlefield: TOW missiles follow the gunner's crosshair until they hit; Battlefield: the attack helicopter gunner flies the TV-guided missile through its camera. | only with range bands: Medium, Long, Off-screen; never with aim / mount: Auto-target, Radial; never with weapon traits: Homing |
| `melee` | Melee | Strikes or lunges at touching distance. |  |
| `attach` | Attach | Works by latching onto or getting inside the target. |  |
| `place` | Place | Sets down charges, mines or devices on the ground or a target. What is placed stays on the ground, so it never hits fliers; a charge that clings to a flier is attach. | only with target types: Infantry, Ground vehicles, Structures, Naval |
| `drop` | Drop | Released below or just ahead of the unit; you aim by flying over the target, so only a flier can drop. It falls to the ground, so it never hits fliers. | only with target types: Infantry, Ground vehicles, Structures, Naval; needs is a target of type low air or is a target of type high air |
| `ram` | Ram / kamikaze | The unit itself is the weapon: it hits by colliding with or diving into the target, often destroying itself. |  |

**Tie-breaks** (when two terms seem to fit a source unit):

- *Lock-on* or *Guided*: Lock-on when the target is chosen before firing and the shot then finds it alone, so the shooter may look away; the target is usually warned. A missile that homes on a laser spot is lock-on when a teammate's designator also works. Guided when only the shooter steers it and must keep aiming until it lands: by wire, camera, crosshair or the shooter's own laser. When one entry stands for several titles of a series that differ, follow the Series games convention and give the other version in the summary.

<a id="weapon-traits"></a>
### Weapon traits (`weapon-traits`)

Combinable twists on a weapon. A card's weapon has up to three; a researched weapon up to four.

| Id | Label | Meaning | Rules |
|---|---|---|---|
| `splash` | Splash | Damages an area around the impact. *Coding rule:* Set it when the sources say the hit hurts everything in an area around the impact. Leave it off when they say it hits one target at a time, call the area tiny or very small, or disagree. An area effect that does no damage, such as an area stun, is not splash. A radius figure in the sources counts as saying the hit hurts an area. Tiny or very small must be the sources' own words, never a judgement from the figure. |  |
| `pierce` | Pierce | Passes through the first target to hit others behind it. |  |
| `chain` | Chain | Jumps from the first target to nearby ones. |  |
| `damage-over-time` | Damage over time | Keeps hurting the target after the hit: burning, corrosion, damage from inside. |  |
| `zone` | Lingering zone | Leaves a hazard on the ground (fire, gas, nanites) that hurts whoever stands in it. |  |
| `charge-up` | Charge-up | Hold to charge, then release: a stronger shot, or a burst of more shots. *Coding rule:* Set it when the sources say the player holds the trigger to build the shot up before it fires. Energy that builds while the weapon keeps firing, released by another key or by itself, is not charge-up: describe it in the summary. |  |
| `spin-up` | Spin-up | Fires slowly at first and speeds up while held. *Coding rule:* Set it when the sources say or show the rate of fire rising while the weapon keeps firing; continuous-fire stages in a stats table count, because the rise is how it fires. |  |
| `overheat` | Overheat | Fires continuously until it overheats, then must cool down. | never with weapon traits: Magazine |
| `magazine` | Magazine | Fires a set number of shots, then must reload, or wait for its ammo to come back on its own. *Coding rule:* Set it only when the sources show the reload as part of how this weapon fights: they describe it firing a burst or salvo and then stopping to reload, name its reload or clip as a strength or weakness of this weapon, or say its ammo runs out and comes back on its own. A reload time in a stats table, a passing mention, or a comparison of how often two guns reload does not count. A weapon that holds one shot per reload (a single-shot launcher or cannon) never gets it for that reload: its reload is its rate of fire, so say in the summary, in words, how long it takes. | never with weapon traits: Overheat |
| `homing` | Homing | Shots steer toward the target. *Coding rule:* Only for shots that steer themselves after firing with no lock step and no steering by the shooter, such as smart rockets. Never with lock-on or guided delivery, which already steer. |  |
| `knockback` | Knockback | Pushes targets away. |  |
| `slow` | Slow | Slows the target. |  |
| `root` | Root / pin | The target can't move but can still fire and use abilities. |  |
| `silence` | Silence / disarm | The target can move but can't fire or use abilities. |  |
| `stun` | Stun | The target can't do anything for a very short time. T2 and up, on a medium or longer cooldown. | from T2 |
| `suppress` | Suppress | Sustained fire pins targets: slows them and spoils their aim while under fire. *Coding rule:* Set it only when the sources say this weapon's own fire, with no ability in use, pins or suppresses targets as one of its main jobs, as with a machine gun built for it. A weapon that pins only now and then, or only while an ability is active, does not get it; that ability links the suppress-with-fire pattern instead. |  |
| `mark` | Mark | Tags the target so the whole team sees it and hits it harder for a time. |  |
| `min-range` | Minimum range | Can't hit targets inside a dead zone close to the unit. |  |
| `friendly-fire` | Friendly fire | Its splash or penetration also hurts allies. |  |
| `finite-ammo` | Limited ammo | Carries a fixed stock that does not come back by itself; only a teammate, a station or a pickup refills it, if anything does. A stock that refills on its own over time is magazine. *Coding rule:* When the unit has the limited-ammo resource, give this trait only to the weapons that draw on it while others do not (a 'Mech's autocannon and missiles beside its lasers); when every weapon draws on it, the resource alone says so. |  |
| `shield-breaker` | Shield-breaker | Deals bonus damage to shields and barriers. |  |
| `heal-on-hit` | Heals on hit | Damage dealt restores the attacker's health. *Note:* Healing by hurting, on the weapon itself. Not the heal-self pattern (a heal on a key) or the self-repair armour model (health that comes back on its own). |  |
| `anti-air` | Anti-air | Built to bring down aircraft: a weapon whose family reaches low air can, with this trait, reach high air too. Lobbed, dropped, placed and melee shots never hit high fliers, so it never goes with those deliveries. *Coding rule:* On a researched weapon, set it exactly when its can_target includes high-air, whatever the family. On flak, guided missiles and autocannons it marks what the weapon is for; on other families it is also what lets the weapon reach high air. *Seen in:* Red Alert 3: the Multigunner IFV's default missiles and its Archer Maiden bow reach every aircraft; PlanetSide 2: anti-aircraft machine guns, which the game gives a damage class of their own. | never with weapon delivery: Lobbed, Drop, Place, Melee |

