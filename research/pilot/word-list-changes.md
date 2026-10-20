# Word-list changes: 0.4.0 to 1.0.0

From `9719ee2` to `data/vocab`. 0 list(s) added, 0 removed, 39 changed; 0 term(s) added, 0 removed, 111 changed, 43 tie-break rule(s) added, 0 removed.

## Changed lists

### Ability kinds (`ability-kinds`), 0.4.0 to 1.0.0

- **List description:** reworded: How an ability is triggered. 'Uses a key' kinds count toward the tier's key budget.
- **Changed `active`** (Active):
  - description: reworded: Press to use. It may have a cooldown, a cost per use, or neither.
- **Tie-break added** (`toggle` / `deploy`): Pick deploy when the unit cannot move at all in one of the two states: it has to stop and set up. Pick toggle when it can move in both, even if it is slow or cannot fire while moving in one of them.
- **Tie-break added** (`active` / `channel`): Pick channel when the source says you hold the key to keep the effect going (press and hold to burn a boost, to keep a beam or a shield up), or that it stops as soon as you let go, move or are interrupted. Holding a key to aim or charge and releasing it to act is not channel: the effect starts on release. A timed action that runs to its end on its own is active.
- **Tie-break added** (`active` / `ultimate`): Ultimate when the source says the button must be charged before each use, through play (kills, damage dealt or taken) or by a charge meter of its own, even when it also has a cooldown; band that cooldown as given. Active when only a cooldown or a stock holds it back.
- **Tie-break added** (`passive` / `triggered`): Pick triggered when each event causes a one-off effect, such as taking a weapon on a kill or exploding on death. Pick passive when the effect is always on, including bonuses that build up from events and then stay, such as ranks.

### Ability sources (`ability-sources`), 0.4.0 to 1.0.0

- **Tie-break added** (`upgrade` / `commander-power`): Pick commander-power when the unlock comes from the side's own power menu or tree, picked during the match outside any building: a doctrine, protocols, a general's promotions, battlegroups, leader powers. What it costs does not matter. Pick upgrade when it is bought or researched at a building or on the unit, even when it then reaches every unit of that type.
- **Tie-break added** (`loadout` / `upgrade`): Pick loadout when the player picks it from a set of choices when buying, spawning or fitting the unit. How a choice was first unlocked (score, rank, progression) does not matter. Pick upgrade when it is bought during the match and then stays.
- **Tie-break added** (`innate` / `veterancy`): Pick veterancy only when the ability itself first appears at a rank. An ability the unit has from the start is innate, even if ranks make it stronger. A cost per use, such as reinforcing or munitions, does not change the source.

### Aim / mount (`aim-models`), 0.4.0 to 1.0.0

- **Changed `slow-turret`** (Slow turret):
  - source_rule: added: The main turret of a large or huge unit that moves on the ground, and any gun that turns with it.
- **Changed `body-aim`** (Body aim):
  - source_rule: added: A fixed weapon fired from the driver seat. Never on a gunner, commander or passenger seat.
- **Changed `limited-arc`** (Limited arc):
  - source_rule: added: A mount the source shows covering only part of the circle, including a set-up heavy weapon carried by soldiers. A gun that turns only a little off the nose is body-aim.
- **Tie-break added** (`radial` / `auto-target` / `limited-arc` / `free-aim` / `slow-turret` / `body-aim`): Go down this list and take the first that fits. (1) It hits all around the unit at once, like an aura or a pulse: radial. (2) It fires by itself while the unit's player does something else (point-defence guns that fire at units, a deployed sentry gun, or launched drones that act on their own): auto-target. In a commanded game every weapon picks targets for itself, so there (2) needs one of those kinds; a turret carried on the unit (an add-on or a roof gun) goes on to the later steps, even when it picks its own targets while the unit is idle. (3) The source shows it covering only part of the circle: a gun on the side or front of a hull, a door gun, a tail gun, a mech torso that twists only partway, or a soldiers' heavy weapon that must be set up and then covers only an arc (a machine-gun team, a field gun): limited-arc. A gun that turns only a little either side of the nose (a tank destroyer) counts as fixed; see (6). If the source doesn't say how far a turret turns, treat it as a full turret. (4) A soldier or creature carries it, or it is built into a tiny or small body: free-aim. A squad's weapons all take the leader's mount. (5) It sits on a full turret, or on a torso that turns all the way round: slow-turret for the main turret (the one holding the main weapon) of a large or huge unit that moves on the ground (tracks, wheels, legs or hover), free-aim for any other turret (on a medium vehicle, a roof gun, a chin gun, a turret holding only another seat's weapon, any aircraft turret). A gun that turns with the main gun takes the same mount. (6) It is fixed and fires where the unit faces (no turret, wing pods, forward launchers, bombs): body-aim. If a seat other than the driver fires it, use free-aim instead, because that seat cannot turn the unit. The family's default mount only fills in when the source says nothing about how the weapon is mounted.

### Armour classes (`armour-classes`), 0.4.0 to 1.0.0

- **List description:** reworded: How tough the unit is next to the other units of its own game, as a band. Code it with the steps in the first tie-break below. Combined with one or two armour models on the card.
- **Changed `unarmoured`** (Unarmoured):
  - description: reworded: Flesh and cloth: soldiers and animals without armour plating. A game's basic rifle infantry is unarmoured, unless step 1 or 2 of the armour-class steps (the first tie-break) gives more. Never a machine.
- **Changed `light`** (Light):
  - description: reworded: Machines that light weapons still hurt, and soldiers in real armour: buggies, jeeps, motorbikes and trucks; drones and robots no bigger than a soldier; helicopters, attack helicopters too; planes and boats; and soldiers whose game data gives them tougher armour than its basic rifle infantry, power-suit troopers included.
- **Changed `medium`** (Medium):
  - description: reworded: Shrugs off most light weapons but is weaker than a battle tank: IFVs, APCs, half-tracks and armoured cars, light tanks, suits bigger than a soldier, and light walkers bigger than a soldier.
- **Changed `heavy`** (Heavy):
  - description: reworded: The game's main battle tank and every other battle tank, whatever the game calls it (medium or heavy tank), and assault mechs.
- **Changed `super-heavy`** (Super-heavy):
  - description: reworded: The game's top heavyweights, set apart from its battle tanks: units two tanks in size or more at t3, or ones the game's armour map or registry notes make super-heavy. Super-heavy tanks, giant mechs, experimental units and big airships.
- **Tie-break added** (`unarmoured` / `light` / `medium` / `heavy` / `super-heavy`): Judge the unit as bought, without upgrades or veterancy. Go through steps 1 to 5 in order and stop at the first one that gives an answer. Then apply checks A and B and the soldier rule below, which win over every step. 1. The game's armour_map in data/games.json, with any step up or down its registry notes name. 2. The game's own armour word for this unit, when the word is light, medium or heavy; for sc2, the class its registry note gives for the unit's attributes. Skip this step for cnc-td, cnc-ts, cnc3, coh1, coh2 and coh3, whose words cut across our classes, and for a word from a series title that version_researched does not name. 3. The tanks whose prices are averaged in the game's cost anchor are heavy. Other tanks the anchor text mentions are not decided here. In a game without costs, its standard main battle tank is heavy. 4. The kind of unit named in the class descriptions. The kind decides, however tough this unit is next to others of its kind. 5. For a kind named nowhere, compare its health (shields included) and the weapons that hurt it with the step 3 tank (heavy) and with the game's basic rifle infantry (as these steps class it). Check A: super-heavy is only for a unit two tanks in size or more (body size huge) at t3, or in a game without tiers, and for a unit the game's armour_map or registry notes make super-heavy. Such a unit is super-heavy whatever the steps gave. Check B: a machine is never unarmoured; where a step gives unarmoured, code light. Say in armour.notes which step or check decided, and mention armour upgrades there.
- **Tie-break added** (`unarmoured` / `light` / `medium`): A soldier or animal is unarmoured, unless step 1 or 2 gives more, or its game data gives it tougher armour than the game's basic rifle infantry: a tougher infantry armour type or attribute, or body armour its registry notes name. Then it is light. A power suit worn by one soldier (body size small) is light, unless step 1 or 2 gives another class (by the dow1 armour map the Space Marine Squad is light and Terminators are medium). Where neither step decides, the game's basic rifle infantry (the speed reference in data/games.json) stays unarmoured whatever it wears (the StarCraft II Marine). A suit bigger than a soldier (body size medium or more) is medium. Protection every soldier of the game can get, such as cover, veterancy ranks or the retreat bonus, never lifts the class; mention it in armour.notes.

### Armour models (`armour-models`), 0.4.0 to 1.0.0

- **List description:** reworded: How the unit absorbs damage. A card has one or two; a researched unit up to three. If more apply, first keep the models the unit has without any loadout pick; then keep the rarest (rare, then uncommon, then common; on a tie, the one listed first here). Name the others in armour.notes. Shields you switch on, barriers that protect allies, invulnerability and 'draw fire' are abilities, so they live in patterns instead. Code what this unit has. Protection that comes from where it stands (cover), from rank (veterancy), from an order every unit of its kind has (the retreat bonus) or from game settings (difficulty) is not a model, even though the unit benefits; mention it in armour.notes. A model built into the unit's own armour counts even when every unit of its kind in the game shares it (Company of Heroes rear armour). For a squad, code what protects each member; losing members is part of the squad crew model. A model that only an optional loadout pick gives (reactive armour, an auto-repair module, a shield item) still counts; say in armour.notes that it is a pick. Sensor traits differ: a sensor pick goes to sensors.notes, because a pick that changes how a unit is hit changes what beats it, while a sensor pick rarely does.
- **Changed `flat-pool`** (Single health bar):
  - description: reworded: One health bar and nothing more: every hit just subtracts. The easiest to read.
  - examples: +Red Alert 3: the Multigunner IFV has one health value; its armour type only scales the damage each kind of weapon does, -Red Alert 3: one health value per unit, with damage first scaled by the unit's armour type
  - source_rule: added: Code it only when no other model on this list applies, and never together with another model. Damage scaled by armour type or class, as in most strategy games, is the armour class's job: it does not rule out flat-pool, and it does not make the unit another model.
- **Changed `directional`** (Directional armour):
  - examples: +Red Alert 3: mild; the tank armour sets take a little more damage on the sides and rear, +Iron Harvest: many mechs take double damage from behind, -Red Alert 3: mild; side and rear hits do slightly more
  - source_rule: added: Code it when the unit's own data, or a rule its game applies to every unit of its kind, makes side or rear hits do more, however little; say in armour.notes, in words, how much more. Leave it out when neither gives this unit facing values, even if some other units of its game have them.
- **Changed `zonal`** (Zonal damage):
  - description: reworded: Parts such as tracks, turret, engine, rotor, legs or a weapon can be knocked out by damage before the unit dies, switching that function off for a while or for good. The part may be chosen by where the hit lands, by a heavy hit or by chance.
  - examples: +Battlefield 4: a heavy hit can knock out a vehicle's movement, or a helicopter's control, for a few seconds, +Wargame: critical hits on the crew disable specific systems, -Battlefield 4: heavy hits cause mobility kills
  - source_rule: added: Code it when the sources say damage the unit takes can switch off one function (movement, steering, the turret or a weapon) while it lives on, however the part is chosen. A function lost because a crewman no player controls is hit (a gunner killed) counts too. A stun, root, slow or shutdown that comes from an enemy weapon's own effect is that weapon's trait or damage type, not zonal. Being disabled as a whole and burning at low health is critical-burn, not zonal.
- **Changed `crew-casualties`** (Crew casualties):
  - excluded: crew-models: -solo
  - examples: -Company of Heroes: each soldier and gun crewman is tracked; a gun without crew can be captured, -Wargame: crew critical hits disable specific systems
  - requires: +["crew:driver-gunner","crew:driver-gunner-commander","passengers:>=1"]
  - source_rule: added: Code it only when hits can kill or throw out a player inside while the vehicle survives (open seats, shots through the glass). It needs two or more player seats, passenger seats included. Never for a squad: losing members is part of the squad crew model. A hit that only switches off a function by hurting a crewman no player controls is zonal.
- **Changed `damage-reduction`** (Damage reduction):
  - examples: +StarCraft II: each unit's armour value comes off every hit; on the most armoured units, such as the Ultralisk or the Battlecruiser, a Marine's rifle loses a large part of each hit, -StarCraft II: armour takes a fixed amount off every hit, but every hit still does a little damage, -PlanetSide 2: main battle tanks ignore small arms completely
  - source_rule: added: Code it only when the game takes a fixed amount off each hit, and that amount changes which weapons work: the weapon of the game's basic rifle infantry loses a quarter or more of each hit to it. Judge the unit as bought, without upgrades. A smaller value only trims hits; mention it in armour.notes, in words. A cut by percentage or by damage type (guns doing half damage to tanks, small arms doing nothing to vehicles) belongs to the armour class and the damage map, not to this model.
- **Changed `self-repair`** (Self-repair):
  - examples: -Red Alert 3: top-rank and some heavy vehicles heal themselves
- **Changed `evasive`** (Evasive):
  - source_rule: added: Code it only when the unit itself has a way to dodge: a dodge roll, a stated chance to avoid hits, or a hard-to-hit value of its own that is better than the game's basic rifle infantry has. Hit chance from cover, rank or moving, which every soldier of the game gets, is not evasive.
- **Changed `weak-point`** (Weak point):
  - description: reworded: A small exposed spot, such as a vent, a joint or a fuel tank, takes extra damage when hit on purpose.
  - examples: -Iron Harvest: many mechs take double damage at the back
  - source_rule: added: Code it only for a spot the shooter must aim at. Extra damage to a whole side, the rear or the top is directional, even when the game calls it a weak spot.
- **Changed `interceptor`** (Interceptor):
  - examples: +Generals: the Paladin tank's point-defence laser shoots down incoming missiles, -Battlefield 4: active protection detonates incoming missiles for a moment, then recharges
  - source_rule: added: Code it only when the protection fires by itself. One the player switches on with a key, even for a few seconds, is the fire-countermeasures pattern.

### Availability (`availability`), 0.4.0 to 1.0.0

- **List description:** reworded: How many of the unit a side may field at once. Count only a cap the game puts on this unit itself; a population or army cap shared by all units does not count.
- **Changed `open`** (Open):
  - description: reworded: No cap of its own: held back only by price, tech, the population cap or respawn rules.
- **Changed `limited`** (Limited):
  - description: reworded: The game caps this unit at a few at a time per player or side: a unit cap, a slot limit or a set number of spawns on the map.
- **Changed `unique`** (Unique):
  - description: reworded: A one-of-a-kind character the game allows once per player or side: a named hero, a commando or the army's commander unit. This is the hero flag (decision 7B). An ordinary vehicle capped at one, by a unit cap or by map spawns, is limited.

### Balance flags (`balance-flags`), 0.4.0 to 1.0.0

- **Changed `hard-control-without-escape`** (Control without escape):
  - description: reworded: A stun, freeze or attach effect with no stated way for the victim to escape.

### Body plans (`bodies`), 0.4.0 to 1.0.0

- **List description:** reworded: The unit's upper-body shape and silhouette (legs and wheels live in mobility, scale in size). Each body lists the mobility types and sizes it fits and how its weapons can be mounted. A transforming unit records its second form's body in its modes. A mode records a second body only when the upper body changes shape (a mech folding into a jet); bracing, deploying or raising a gun in place keeps the body.
- **Changed `humanoid`** (Humanoid):
  - allowed: aim-models: +limited-arc
- **Changed `power-suit`** (Power suit):
  - description: reworded: Powered armour, an exosuit or a battlesuit around one pilot. At small size (one soldier's size, such as power armour) it is infantry; at medium size or bigger it is a walker.
- **Changed `hull-turret`** (Hull with turret):
  - allowed: aim-models: +limited-arc
- **Changed `casemate`** (Fixed-gun hull):
  - description: reworded: A chassis with a forward-fixed main gun and no main turret, like a tank destroyer.
- **Changed `box-carrier`** (Troop carrier):
  - description: reworded: An enclosed hull with a passenger compartment, with at most a small turret or a remote weapon mount: APC or IFV.
- **Changed `multi-turret`** (Multi-turret giant):
  - allowed: aim-models: +limited-arc
- **Tie-break added** (`box-carrier` / `hull-turret` / `open-mount` / `launcher-rack`): A hull whose riders sit hidden and protected inside is box-carrier, even with a small turret or a roof launcher (most APCs and IFVs). Hull-turret is for tanks, whose turret and gun are the main body. Open-mount needs crew or riders who sit exposed. Launcher-rack is for a vehicle built around an exposed rack, mast or mortar, with no passenger compartment.
- **Tie-break added** (`humanoid` / `power-suit`): Power suit when the sources say the soldier wears powered armour, an exosuit or a battlesuit (Space Marines, the PlanetSide 2 MAX, Elementals). Humanoid for a soldier in ordinary body armour or carapace, however heavy. Size and armour class follow their own rules: one soldier's size is small, and the armour class comes from the armour-class steps and the soldier rule.
- **Tie-break added** (`casemate` / `hull-turret`): Decide by where the main gun sits: fixed in the hull is casemate, even when a small turret on top carries another seat's gun (the Magrider); in a turret is hull-turret. A roof turret's free aim then breaks casemate's mount rule, and the validator lists that as atypical.

### Unit classes (`classes`), 0.4.0 to 1.0.0

- **Changed `drone`** (Drone / support):
  - notes: reworded: Only for uncrewed units of tiny or small size (the size rule is checked), however they move: a small spider robot on legs is a drone, not a walker. Bigger robots are classed by how they move. Support is a role, not a class: a repair truck is a vehicle with the support role.

### Confidence levels (`confidence`), 0.4.0 to 1.0.0

- **Changed `high`** (High):
  - description: reworded: The cited sources include official text about the unit, read directly or through a faithful copy: a page that says what it copies, or an infobox description or tooltip field that the game's registry note names as a copy of in-game text and does not mark as still to be checked (the PlanetSide 2 Wiki's Description field; the StarCraft II wikis' unit description). Or they include pages from two different established sites that each describe the unit and agree. A page counts only if it is about the unit itself: its own page, or its own entry in a unit list. Patch notes and pages about other units do not count toward high. Pages of one site count as one site. Two wikis count as independent unless one names the other as its source.
- **Changed `medium`** (Medium):
  - description: reworded: Everything rests on one established site (any number of its pages) or one database, and no other site contradicts it. Pages of that site that contradict each other follow the tie-break.
- **Tie-break added** (`high` / `medium`): When established sites, or pages of one site, contradict each other on a point the entry uses and no official text settles it, record each such point in uncertain with sources_disagree. Then judge the level on what the pages agree on. Drop to medium only when a contradicted point decides a term the entry codes, such as a weapon's family or damage, a band, a role or the tier.

### Cooldown bands (`cooldown-bands`), 0.4.0 to 1.0.0

- **List description:** reworded: How often an ability can be used: the wait from one use until it can be used again. Band the source's cooldown figure alone; do not add the time the effect lasts. Use real seconds at the game's normal multiplayer speed (StarCraft II: Faster). Where the source gives a span ("8 to 12 seconds", "up to 15 seconds"), band its largest value. For an ability with charges, band the time to regain one charge. Edges are exact, and a value on an edge takes the higher band. An ability that comes back only at a resupply point or on respawn is per-life, with or without a figure. An ability with no wait has no band: leave cooldown out. That covers instant orders such as unloading, and mode switches that only take time to finish; say in the summary, in words, how long the switch takes. An ability held back only by a stock, such as Company of Heroes munitions or the unit's energy, has no band unless the source also gives a cooldown. A boost's own fuel tank, which only that ability burns and which refills by itself, is its cooldown, not a stock: band the time it takes to refill from empty. An energy pool stays a stock even on a unit with only one ability that spends it (the StarCraft II Medivac's Heal).
- **Changed `spam`** (Spammable):
  - description: About 1-3 seconds; several uses in every fight. -> Under 5 seconds; several uses in every fight.
- **Changed `short`** (Short):
  - description: reworded: From 5 up to but not including 15 seconds; a couple of uses per fight.
- **Changed `medium`** (Medium):
  - description: reworded: From 15 up to but not including 45 seconds; roughly once per fight.
- **Changed `long`** (Long):
  - description: About 45-90 seconds; a few uses per life. -> 45 seconds or more; a few uses per life.

### Cost bands (`cost-bands`), 0.4.0 to 1.0.0

- **List description:** reworded: Relative price. For source units it is relative within their own game: the games registry gives each band's lowest price, so a price exactly on a threshold takes the higher band. For generated concepts it is derived from the parts.

### Crew models (`crew-models`), 0.4.0 to 1.0.0

- **Changed `solo`** (Solo):
  - source_rule: added: In-game for a unit with one player seat in the source (a MechWarrior mech, a PlanetSide 2 Lightning). The proposal for every unit without player seats unless driver-gunner, squad or remote applies. A crew named in lore or voice lines does not change it.
- **Changed `driver-gunner`** (Driver + gunner):
  - source_rule: added: In-game when the source has a driver seat and a separate gun seat. As a proposal, only for a vehicle, walker, hover or aircraft of medium size or bigger, never a power suit, that fires two weapons at the same time from separate mounts. A separate mount aims on its own: a roof gun, a gun on the front or side of the hull, a second turret. A gun that turns with the main gun is the same mount. These do not count: weapons swapped by a mode or toggle; weapons the source picks by target type (one for ground, one for air), which fire one at a time; weapons added by an upgrade, a passenger or a kill; and point defence that fires by itself. If the source doesn't say whether two weapons fire together, count them as one at a time. The driver keeps the main weapon and any gun that turns with it. Each other weapon on its own mount that fires at the same time as the main weapon goes to the gunner, and every other weapon stays with the driver (decision 2A; see armament[].seat).
- **Changed `driver-gunner-commander`** (Driver + gunner + commander):
  - examples: +Battlefield 3 main battle tanks: the CITV Station unlock opens a third seat, a commander with zoom, thermal vision, laser designation and a motion sensor but no weapon, -Battlefield 3: an optional commander seat adds zoom, thermal vision and laser designation
  - source_rule: added: In-game only, when the source has a separate seat that spots, marks or commands, or a crew seat that only loads, repairs or runs systems. A gunner seat whose loadout swaps its gun for spotting tools is still a gunner. Never proposed for a unit without player seats.
- **Changed `squad`** (Squad):
  - source_rule: added: In-game when the source moves two or more soldiers or tiny drones as one unit for their whole life, with one order and a shared fate (Company of Heroes or Dawn of War squads). Units bought in pairs that then act alone are solo.
- **Changed `remote`** (Remote operator):
  - source_rule: added: Only when the source has a person who stays on the field, outside the machine, while steering it (a soldier who parks to fly a drone). A note in the lore that the machine was once remote-controlled does not count.
- **Tie-break added** (`solo` / `driver-gunner`): A unit with player seats copies them, however many weapons its one pilot fires. For a unit without player seats, count what the source unit does, not what its text says: two weapons firing at the same time from separate mounts make driver-gunner (its coding rule says what doesn't count); anything else is solo. Faction flavours never decide a source unit's crew; they only weight generated cards.
- **Tie-break added** (`solo` / `remote`): Remote only when an operator stays on the field in the source. Otherwise an uncrewed machine is solo.

### Damage types (`damage-types`), 0.4.0 to 1.0.0

- **List description:** reworded: What a hit does. 'Strong vs', 'weak vs' and 'no effect on' are typed links to what the target is (armour class, nature, armour model, target type). They drive the generator's counter hints and are relative, not numbers. On a researched unit, pick a weapon's type with the steps under armament[].damage in docs/fields.md.
- **Changed `emp`** (EMP):
  - description: reworded: Little or no damage: it stops vehicles and drones from moving, firing or both, and knocks out energy shields, for a time.

### Handling (`handling`), 0.4.0 to 1.0.0

- **Tie-break added** (`strafe` / `pivot` / `steer` / `drift` / `forward-only`): Start from the default handling of the unit's mobility type. Change it only for one of these reasons. (1) A tiny or small unit on legs (two legs or many) gets strafe; this needs no note, since its size and mobility show it. (2) The source clearly shows the unit can't do what the default needs: if it can't turn on the spot, pivot becomes steer; if it can't stop or hover, strafe becomes forward-only; if it can't stop quickly and only slides through turns, with no hover and no sideways move, strafe becomes drift. (3) In a game where players drive the unit (registry control piloted or both), the source clearly shows it sliding sideways at will, such as a hover tank built to strafe: strafe. For reason (2) or (3), name the reason in mobility.notes. Momentum, tilting to speed up, a heavy feel, or an RTS model turning on the spot never change it on their own; put them in mobility.notes. A mode with its own mobility type follows the same rule from that type.

### Mobility traits (`mobility-traits`), 0.4.0 to 1.0.0

- **Changed `climb`** (Climb):
  - source_rule: added: Code it when the sources show the unit moving up walls, cliffs or buildings that stop other units of its kind, however it holds on (legs, claws, hover thrust). A jump or a flight up or over the obstacle is not climb (see leap; a jetpack is the unit's mobility). Where the trait's rules leave out the unit's class or mobility, code it anyway; the validator lists the break as atypical, which is evidence for relaxing the rule.
- **Changed `boost`** (Boost):
  - description: reworded: A short burst of speed or a dash, on a key, usable anywhere. An order that sends the unit running back to base, like Company of Heroes retreat, is not boost, and its ability links no dash pattern. A boost with no meter, cooldown or other limit is part of the unit's speed (see Speed bands), not this trait.

### Nature (`nature`), 0.4.0 to 1.0.0

- **Changed `crewed-machine`** (Crewed machine):
  - source_rule: added: Code it when the source shows or implies people inside: a cockpit, a pilot or crew in the fiction or the voice lines (paraphrased), crew who bail out. When the source says nothing either way, a unit of the vehicle, walker, hover, aircraft or naval class is crewed.
- **Changed `uncrewed-machine`** (Uncrewed machine):
  - source_rule: added: Only when the source says it is a robot, drone or remote-controlled machine.

### On death (`on-death`), 0.4.0 to 1.0.0

- **Changed `respawn`** (Respawn):
  - description: reworded: Nothing is left: the unit is simply gone. In a player version the player goes back to the buy screen (a remote operator goes back to their parked soldier).
  - source_rule: added: In-game for a unit players drive in a game where they come back after it dies, including a vehicle whose crew die inside it. For a unit that is simply gone in the source, it is the proposal for infantry, organic units and uncrewed machines.
- **Changed `bail-out`** (Bail out):
  - description: reworded: The vehicle is destroyed and its crew eject as basic infantry with low health. Everyone inside gets out, passengers too.
  - source_rule: added: In-game when the crew or riders get out on their own as the vehicle dies, even when only one gets out or only by chance. Jumping out by hand before it dies does not count; in our game that is the hold-X key every vehicle has. It is the proposal for any crewed machine outside the infantry class that is simply gone in the source.
- **Changed `wreck`** (Wreck):
  - source_rule: added: In-game only when the remains stay on the field and a unit can repair, recrew or salvage them in the same match. Remains that only block the way or give cover do not count, nor do crates, weapons or loot that drop for pickup or for crafting later; put those in on_death.notes.
- **Changed `death-blast`** (Death blast):
  - source_rule: added: In-game only when the source says the explosion hurts units nearby, for this unit in its own title (for a series, its counted titles, as the Series games convention in docs/fields.md decides). A blast that is only for show, or a wreck that only hurts what it falls on, does not count.
- **Changed `pilot-eject`** (Pilot eject):
  - source_rule: added: In-game when the pilot leaves the wreck on their own as a unit that can keep fighting, such as walking to a new vehicle or a pickup. Ejecting by hand before the unit dies does not count.
- **Tie-break added** (`respawn` / `bail-out`): A crewed vehicle that is simply gone in the source: bail-out, basis proposal. A vehicle players drive in a shooter whose crew die inside it: respawn, basis in-game, even when they could have jumped out by hand first.
- **Tie-break added** (`respawn` / `wreck` / `death-blast` / `pilot-eject`): Use two outcomes only when the source shows both, such as a husk that also explodes. Never pair a sourced outcome with the 3C default.
- **Tie-break added** (`bail-out` / `pilot-eject`): Pilot eject when the one who gets out is a pilot who, the sources say, can take a new vehicle or a pickup and keep fighting. Bail out when crew or riders get out as ordinary soldiers. Never code both for the same person.

### Range bands (`range-bands`), 0.4.0 to 1.0.0

- **List description:** reworded: How far a weapon reaches, relative to the top-down screen. For source units the band compares the weapon with its own game: with the reach of the game's reference weapon (registry range_reference, usually the basic rifle) and with its own unit's sight (see each term's coding rule and the tie-breaks). It does not compare the weapon with the screen or with the unit's other weapons. Each weapon gets one band, from its longest reach against any target, as the stock weapon with no upgrades or veterancy.
- **Changed `melee`** (Melee):
  - source_rule: added: Hits only at touching distance: claws, blades, a bite. A unit that leaps or latches onto its target is still melee.
- **Changed `short`** (Short):
  - source_rule: added: Longest reach under 0.7 times the reference weapon's.
- **Changed `medium`** (Medium):
  - source_rule: added: Longest reach from 0.7 up to and including 1.5 times the reference weapon's. The reference weapon itself is medium.
- **Changed `long`** (Long):
  - source_rule: added: Longest reach over 1.5 times the reference weapon's, unless off-screen applies.
- **Changed `off-screen`** (Off-screen):
  - source_rule: added: Any one of these: the weapon is long by its reach (figure or words) and reaches past its own unit's sight figure, the figure its sight band uses (for an add-on or a turret, the unit that carries it), where a reach known only from words passes that figure only when the sources say so; the source says it needs spotters or fires at targets beyond its own sight; or the shot is steered through its own camera, such as a TV-guided missile. A scope or zoom alone is not enough, and calling a weapon long-ranged never makes it off-screen.
- **Tie-break added** (`long` / `off-screen`): Check off-screen first, and pick it only for the reasons in its coding rule. Its first reason needs a weapon that is long by its reach: one that reaches past its unit's sight but is short or medium by its reach keeps that band. Its second reason stands on its own, whatever the reach: a weapon the sources say fires indirectly at targets that a teammate or a spotter locks, marks or sees for it fires at targets beyond its own sight.
- **Tie-break added** (`short` / `medium` / `long`): Use the longest reach against any target: a launcher that reaches twice as far against aircraft is banded by its air reach. Use the maximum reach, not where the weapon works best: "best at 10-20 m" is not a reach. When the weapon or the game's reference weapon has no figure, go in this order. First, if the source compares the reach with a named weapon, start from that weapon's band: from its figure where a source or the registry gives one, otherwise from its family's default range. Keep that band, and move one band only when the source says much further or much shorter ("huge", "far"); never past long. Second, if the source calls the weapon short-, medium- or long-ranged, or says it outranges most units (long), take that band. Otherwise take the family's default range.
- **Tie-break added** (`melee` / `short`): Melee only when the blow lands at touching distance, the unit's own leap or latch included. A shot, spray or thrown weapon that crosses any gap is short or longer.

### Resources (`resources`), 0.4.0 to 1.0.0

- **List description:** reworded: A gauge on the unit itself that shapes how it plays. A card has at most one. A price paid from the team's or player's shared stock (Company of Heroes munitions, money for an upgrade) is not a resource; say in the ability's summary, in words, that each use draws on that stock.
- **Changed `fuel`** (Fuel):
  - description: reworded: Flight or boost time drains a gauge that refills on the ground or at a pad. A boost's own tank, which only that one ability burns and which refills by itself anywhere, is not fuel: it is that ability's cooldown (see Cooldown bands).
- **Changed `limited-ammo`** (Limited ammo):
  - description: reworded: Total ammo is finite and does not come back on its own over time; only a supporter, a pickup or the base refills it, if anything does. Ammo that comes back on its own is the weapon's magazine trait, not this.

### Roles (`roles`), 0.4.0 to 1.0.0

- **List description:** reworded: What the unit is for: its job or the targets it is best against, never how it does it (mechanics are patterns). A card has one primary role and up to two secondary roles. Requires says what a unit needs before it can claim a role. A source unit never claims a role whose requires it fails. If such a role still fits, leave it out and record it in fit_notes (path roles, wanted: that role). Meeting the requires is not enough: the role description must fit too. Official text means words the game or its makers wrote: the in-game role line, tooltip or production text, the manual, the official unit profile and patch notes. It still counts when read through a page that copies it. A wiki's own words (its infobox labels, prose and tables), strategy guides and internal file names are not official text; the registry notes say which infobox fields copy in-game text. For a unit recorded once for several sides, official text counts only when every side's version carries it. Official words name a role only through the role's whole label or one of its aliases; each half of a slash label (Artillery / siege) counts as a label. One word of a longer label is not enough: 'Assault' alone does not name Frontline assault, so a Purpose such as 'Tank/Structure Assault' names no role. These words name no role: main battle tank; light, medium or heavy tank; core or line infantry; multipurpose; general-purpose; attack (as in attack helicopter); support when it means firepower (combat support, fire support, artillery support, close air support); control in mind control or a control point; and aura in a healing or repair aura (that job is support). How to pick the primary and secondary roles is under roles in docs/fields.md. The tie-breaks settle close calls.
- **Changed `assault`** (Frontline assault):
  - source_rule: added: As primary: any generalist that is not fast with light or no armour (step 5 of roles.primary).
- **Changed `anti-armour`** (Anti-armour):
  - aliases: +anti-tank, +anti-vehicle, +anti-armor, +tank hunter, +tank destroyer
- **Changed `anti-infantry`** (Anti-infantry):
  - aliases: +anti-personnel
- **Changed `anti-air`** (Anti-air):
  - aliases: +anti-aircraft, +air defence, +AA
- **Changed `siege`** (Artillery / siege):
  - description: reworded: Hits from very far, from above or over cover; breaks defences and structures.
  - requires: +["delivery:lobbed","delivery:drop","range:>=long"], -["delivery:lobbed","range:>=long"]
  - aliases: +artillery, +bombardment, +bomber
  - source_rule: added: A lobbed weapon that reaches long or further, bombs dropped from the air, a deploy mode whose gun reaches long or further and hits an area, or a long-range missile or rocket that the sources say is built mainly to destroy structures (they name structures as its first or only target). A gun aimed straight at targets in view is never siege by that last clause, even when official text calls it strong against buildings; what else it is strong against may still give an anti role under roles.secondary. A long-range missile or cannon alone is not siege, and a team that sets up its gun before firing is not deploying.
- **Changed `marksman`** (Marksman / overwatch):
  - aliases: +sniper, +sharpshooter
  - source_rule: added: Only a sniper weapon (the sniper family) that reaches long or further. A long-range weapon of any other family never gives marksman; siege's coding rule and roles.secondary say what it gives.
- **Changed `scout`** (Scout / recon):
  - aliases: +recon, +reconnaissance, +spotter
- **Changed `support`** (Support):
  - aliases: +medic, +healer, +repair, +resupply
- **Changed `transport`** (Transport):
  - aliases: +troop transport, +troop carrier, +personnel carrier
  - source_rule: added: Needs two or more passenger seats. A carrier with one seat is not a transport, whatever the source calls it; its seat shows in crew.passengers and its carry-passengers or passenger-sets-weapon pattern.
- **Changed `infiltrator`** (Infiltrator / saboteur):
  - description: reworded: Gets inside enemy units or buildings, or passes as one of them, to spy, steal or sabotage: steals vehicles or money, spies on or shuts down buildings.
  - aliases: +spy, +saboteur, +hijacker, +thief
- **Changed `raider`** (Raider / flanker):
  - description: reworded: Hits and runs, picking off isolated targets: fast flankers, gunships that make attack runs.
  - aliases: +hit-and-run, +flanker, +harasser
  - source_rule: added: As primary: a fast or very fast generalist with light or no armour (step 5 of roles.primary). As secondary: see roles.secondary.
- **Changed `area-denial`** (Area denial):
  - aliases: +minelayer
- **Changed `buffer`** (Buffer / aura):
  - description: reworded: Makes nearby allies stronger for a time (more damage, armour, speed or accuracy) with an aura or a timed call. Spotting is scout; healing and resupply are support; spawn points and buildings are engineer.
- **Changed `engineer`** (Engineer / builder):
  - description: reworded: Builds, converts or takes over structures that serve the team: barracks, outposts, spawn or supply points, bridges.
  - aliases: +builder, +sapper, +pioneer
- **Changed `logistics`** (Logistics):
  - aliases: +harvester, +collector, +miner, +supply
- **Tie-break added** (`raider` / `scout`): Damage first is a raider, information first is a scout. Speed alone makes a scout only when official text calls the unit a scout (by the label or an alias, such as recon). Otherwise scout needs an information part with an in-game basis: long sight, a sensor trait, stealth, or a mark or reveal ability.
- **Tie-break added** (`buffer` / `scout`): Finding and marking enemies is scout; buffer is for making allies stronger.
- **Tie-break added** (`disabler` / `area-denial`): A disabler acts on units; area denial acts on ground.
- **Tie-break added** (`area-denial` / `siege`): A gun line that holds ground only by the threat of its fire (a sieged tank) is siege or an anti role. Area denial needs something that stays on the ground: mines, a lingering zone, turrets or fortifications.
- **Tie-break added** (`engineer` / `area-denial` / `support`): Mines, wire, walls, tank traps and turrets that block or guard ground are area denial. Engineer is for buildings that serve the team (barracks, outposts, spawn or supply points, bridges) and for taking buildings over. Repairing or healing is support.
- **Tie-break added** (`engineer` / `infiltrator` / `logistics`): Capturing map control points is a game-mode rule, so a faster capture rate supports no role. Engineer needs structures the unit builds, neutral buildings it converts, or enemy buildings it takes over and keeps. Logistics needs resources the unit gathers, carries or earns by its own action. Infiltrator needs spying, theft or sabotage from inside.
- **Tie-break added** (`infiltrator` / `anti-armour` / `anti-infantry` / `engineer` / `raider`): Ask what the unit does once it gets in or onto its target. If it destroys a unit (an infesting drone, a charge stuck to a tank), use the anti role for that unit: anti-armour for vehicles, anti-infantry for soldiers. If it takes over a building and keeps it, it is an engineer. Infiltrator is for spying, theft and sabotage from inside, or for passing as the enemy. A fast unit that hunts workers or harvesters from outside is a raider.

### Seat roles (`seat-roles`), 0.4.0 to 1.0.0

- **Changed `driver`** (Driver / pilot):
  - source_rule: added: Never written as the seat of a weapon or ability on a source unit: a weapon or ability with no seat belongs to the driver. It may still be listed in crew.seats.
- **Changed `commander`** (Commander):
  - description: reworded: Spots, marks and sees further; triggers abilities or a secondary weapon. Also a crew seat that only loads, repairs or runs systems; list it in crew.seats and say what it does in crew.notes.
  - examples: +Battlefield 3 main battle tanks: the CITV Station seat laser-marks targets for the driver's guided shells, -Battlefield 3: the commander seat designates targets for guided shells
- **Changed `passenger-module`** (Passenger (module)):
  - examples: -Foxhole: the battle tank's engineer seat reloads the gun and repairs

### Sensor traits (`sensor-traits`), 0.4.0 to 1.0.0

- **List description:** reworded: Always-on ways a unit finds enemies or hides from them, on top of its sight band. They need no key; the same effects on a key are patterns (cloak, reveal an area, mark a target, jam sensors, fire countermeasures). For source units, list only the traits the stock unit has whatever its loadout. A sensor from a loadout pick, an upgrade or veterancy goes in sensors.notes. Never add a trait as a proposal.

### Sight bands (`sight-bands`), 0.4.0 to 1.0.0

- **List description:** reworded: How far a unit sees through the fog of war, measured against the top-down screen. Walls and buildings block sight, and what one unit sees its whole team sees. For source units, compare the unit's sight with the sight of the game's reference unit (registry sight_reference, usually its basic rifle infantry). Use the stock unit in its default mode, and put a mode or upgrade that sees further in notes. Use the figure for how far it clears the fog; the registry says which one where a game lists two. A grade on the game's own word scale (Wargame optics) counts as a figure; the registry says which grades are short, medium and long. A statement about a group the unit belongs to ("all infantry see 35 m", "most units see 35 m") counts as its figure, unless the source names an exception that covers it. With no figure, or in a game with no fog of war, the band is medium and a proposal. A scout or recon label, other words ("sees far"), height, and zoom or thermal sights do not change it; the scout role carries scouting.
- **Changed `short`** (Short):
  - source_rule: added: Sight under 0.7 times the reference unit's, or a grade the registry calls short.
- **Changed `medium`** (Medium):
  - source_rule: added: Sight from 0.7 up to and including 1.5 times the reference unit's; the reference itself is medium. Also a grade the registry calls medium, and the band for a unit with no sight figure or in a game with no fog of war.
- **Changed `long`** (Long):
  - source_rule: added: Sight over 1.5 times the reference unit's, or a grade the registry calls long.

### Sizes (`sizes`), 0.4.0 to 1.0.0

- **List description:** reworded: Footprint seen from above, which sets the hitbox. Pick the band whose examples name what the unit is. Examples win over measurements, because strategy games draw soldiers oversized. A weight word in the unit's type (light, medium or heavy tank or mech) is not a size. Count the hull, fuselage and wings, not a rotor disc or a gun barrel. Only for a unit that no example covers, measure. Compare it with the same game's foot soldier: one soldier is small, two to three soldier-widths is medium. When it is wider than that, or the game has no foot soldiers, compare it with the game's main battle tank: clearly smaller is medium, about the same is large, twice or more is huge.
- **Changed `tiny`** (Tiny):
  - description: reworded: Clearly smaller than one soldier of its own game: hand-sized or knee-high drones and bots, animals smaller than a dog. Hard to hit, easy to lose sight of. A unit the game handles like a soldier (it fills an infantry seat in a transport, or the game counts it as infantry) is small, however small it looks.
- **Changed `small`** (Small):
  - description: reworded: One soldier: infantry, power-suit troopers, war dogs, and robots or drones the game handles like a soldier.
- **Changed `medium`** (Medium):
  - description: reworded: About two to three soldier-widths: buggies, cars, armoured cars, APCs and IFVs, light mechs and light walkers, light scout helicopters.
- **Changed `large`** (Large):
  - description: reworded: Tanks of every weight (light, medium and heavy tanks, tank destroyers, self-propelled guns), carriers built on a tank hull, medium to assault mechs, attack and transport helicopters, jets.

### Solo fallback (`solo-fallback`), 0.4.0 to 1.0.0

- **Changed `full-control`** (Full control):
  - description: reworded: Alone, the player drives and still fires a weapon: the driver seat's own weapons, or a weapon the source hands to a lone driver. Weapons in other seats either pass to the driver or wait for a teammate; say which in crew notes.
  - examples: +Battlefield tanks and attack helicopters: the driver keeps the main gun or the rockets, while the second seat's gun waits for a teammate, +PlanetSide 2: a lone Liberator pilot fires the nose gun and may hop to the belly gun mid-fight; the tail gun waits for a teammate, -Battlefield tanks: the driver has the main gun
- **Changed `seat-swap`** (Seat swap):
  - description: reworded: Alone, the player must change seats to shoot, because no weapon works from the driver seat: drive or shoot, not both.
  - examples: +PlanetSide 2: the Sunderer's driver has no gun, so a lone driver hops into a gun seat to fight, -PlanetSide 2: solo Liberator pilots switch to the belly gun mid-fight
- **Changed `auto-gunner`** (Auto-gunner):
  - examples: -Titanfall: the Titan fights on its own when the pilot is out
- **Changed `needs-crew`** (Needs crew):
  - description: reworded: Even by changing seats, a lone player can't do a core job, such as firing the main gun, because the source needs two seats working at once.
  - examples: -Foxhole: only the engineer seat can reload a battle tank's main gun
- **Tie-break added** (`full-control` / `seat-swap` / `needs-crew` / `auto-gunner`): Ask what one player alone can do, in this order. (1) The source makes empty gun seats fire by themselves: auto-gunner. (2) A lone driver can still fire something, their own weapon or one the source hands over: full-control, even when other seats' guns go quiet. (3) A lone player can reach the guns by changing seats, even slowly: seat-swap. (4) Otherwise: needs-crew. A proposal crew is always full-control (decision 2A).

### Source kinds (`source-kinds`), 0.4.0 to 1.0.0

- **Changed `official`** (Official):
  - description: reworded: Publisher or developer, read on their own site (or an archived copy of it, such as the Wayback Machine) or in the game: manual, official site, patch notes, developer posts, in-game text.
- **Changed `wiki`** (Established wiki):
  - description: reworded: A large, maintained community wiki for the series, including one the developer endorses as its official wiki. A wiki page that copies official text is still a wiki source: say in its note that it copies official text and where the original is.
- **Tie-break added** (`official` / `wiki`): Code the site you actually read. A wiki page that copies an official profile, manual page or in-game text is wiki, with a note naming the original; confidence still counts the copied text as official. A wiki the developer calls official is still a wiki, because players write it.

### Speed bands (`speed-bands`), 0.4.0 to 1.0.0

- **List description:** reworded: Speed as a ratio to a reference unit. For source units it is the game's speed reference, named in the games registry: usually its basic rifle infantry, or a basic bot or medium mech where the game has none. Every unit of the game is compared with it, vehicles and aircraft included. For generated cards it is a Shamble Frontlines soldier. Compare the speeds each can keep up for as long as it likes: count a sprint or a boost only when nothing limits it (no meter, stamina or cooldown), for the reference and the unit alike. Use the stock unit: no upgrades, empty, at full health. Use the way it moves in a fight: flying speed for units that fight in the air, water speed for boats, land speed for the rest, amphibious and hover units included. Use plain open ground: the off-road speed where a game gives road and off-road speeds, off creep, with no other terrain bonus. A ratio exactly on an edge goes to the band nearer medium: 0.7 is slow, 1 and 1.5 are medium, 2.5 is fast. The validator computes the band from speed_raw the same way. With no usable figure, use comparisons. A source that compares the unit with a unit that has a band ("faster than the Prowler", "keeps pace with infantry") gives that unit's band, moved one band only when it says much faster or much slower. A speed word on its own ("fast", "slow moving") sets the band of the same name only where the registry's speed_reference says the game's words are read that way (Halo Wars 2); elsewhere it describes the unit among its own kind, so put it in notes. With nothing usable, judge from figures for neighbouring units or from footage, and add an uncertain entry for mobility/speed. If the judgement cannot tell which side of an edge the unit falls on, take the band nearer medium, as for a ratio exactly on an edge, and say so in that uncertain entry. Source units have no band for standing still.
- **Changed `slow`** (Slow):
  - description: 0.7 to 1 times the reference. -> From 0.7 up to but not including 1 times the reference.
- **Changed `medium`** (Medium):
  - description: reworded: From 1 up to and including 1.5 times the reference. The reference unit itself is medium.
- **Changed `fast`** (Fast):
  - description: Over 1.5 and up to 2.5 times the reference. -> Over 1.5 and up to and including 2.5 times the reference.

### Target types (`target-types`), 0.4.0 to 1.0.0

- **Changed `high-air`** (High air):
  - source_rule: added: On a weapon: in a commanded game, list it for any weapon the sources say can attack air units, unless the game splits its fliers and this weapon cannot reach its jets or airships. In a piloted game (control piloted or both in data/games.json), list it only for a weapon built to bring down aircraft: the sources call it anti-air or anti-aircraft, it locks onto jets, or it is a flak gun. A weapon that could hit a passing jet by chance does not count.
- **Changed `naval`** (Naval):
  - description: Ships and submarines. Research only. -> Ships, boats and submarines. Research only.
  - source_rule: added: On a weapon: in a game with ships or boats, list naval on every weapon that lists ground-vehicle, unless the sources say it cannot reach ships. In a game without ships or boats, never list it.

### Tier bands (`tiers`), 0.4.0 to 1.0.0

- **List description:** reworded: How early, cheap and complex a unit is. Tiers cap the number of keys: every button except primary fire and movement (secondary weapon, active abilities, toggles, deploys, key-bound movement, ultimate). The cap is a maximum, not a target, and counts innate abilities only. Universal keys that every unit shares never count: E interact (enter or leave a seat, pick up), hold F shake off anything attached to you, hold X bail out of a vehicle, 1-3 switch seat, middle mouse ping, and G for a transport's driver to evict passengers. A signature fired with primary fire counts as primary fire only when it is the unit's primary weapon. For source units the tier comes from tech gating alone; games without tech tiers record none. Some games use 'tier' for upgraded versions of the same vehicle (Foxhole, Halo Wars): record those as upgrades, not tiers. The game's tier_map, read with its registry notes, decides what counts as a tech step. An add-on or research that is not on it, such as StarCraft II's Tech Lab or Reactor, is not a step; one the notes translate into a tier, such as Dawn of War's Monastery, is. A unit of a game without tech tiers has no tier and is never checked against a term's min_tier.

### Weapon delivery (`weapon-delivery`), 0.4.0 to 1.0.0

- **Changed `lobbed`** (Lobbed):
  - description: reworded: Indirect fire: the shot arcs over cover onto a ground point, or lands on a target the shooter cannot see itself, which others must spot. Usually slow to land, often with a minimum range. It never hits fliers.
- **Changed `lock-on`** (Lock-on):
  - excluded: weapon-traits: +homing
- **Changed `guided`** (Guided):
  - notes: reworded: The player does the steering, so it needs a mount the player aims (not auto-target or radial) and no homing trait, and it is a medium-range or longer shot. A shot that steers itself after a lock is lock-on. One that steers itself with no lock step is projectile with the homing trait, except a rocket or missile that homes in, in a commanded game, which is a guided missile with lock-on delivery (see the rockets or guided missiles tie-break).
- **Tie-break added** (`lock-on` / `guided`): Lock-on when the target is chosen before firing and the shot then finds it alone, so the shooter may look away; the target is usually warned. A missile that homes on a laser spot is lock-on when a teammate's designator also works. Guided when only the shooter steers it and must keep aiming until it lands: by wire, camera, crosshair or the shooter's own laser. When one entry stands for several titles of a series that differ, follow the Series games convention and give the other version in the summary.

### Weapon families (`weapon-families`), 0.4.0 to 1.0.0

- **List description:** reworded: What the weapon is, judged by how it behaves in the source, not by its name. Each family has defaults (damage, mount, delivery, range) and lists what it may be combined with. Air: every family lists the target types it can reach. High air is reached only by the anti-air families (flak, guided missiles, autocannons), by adaptive, which takes whatever weapon it gains, and by any weapon with the anti-air trait whose family reaches low air. Most direct-fire families reach low air; lobbed, dropped, melee and short-range area families stay on the ground, except that explosives can reach a low flier by ramming it or clinging to it. Whatever the family, a lobbed, dropped or placed shot never hits a flier. Ships (research only) are on every family's list except flak's.
- **Changed `small-arms`** (Small arms):
  - description: reworded: Hand-held weapons that fire single shots or short bursts: rifles, carbines, pistols, SMGs and automatic rifles, and also bows, crossbows and thrown blades.
- **Changed `rockets`** (Rockets):
  - description: reworded: Rockets or rocket pods with no lock and no steering by the shooter. Some correct their own course on the way (homing trait).
- **Changed `guided-missiles`** (Guided missiles):
  - description: reworded: Missiles the sources say steer to the target: locked on before firing, steered by the shooter, or, in a commanded game, homing in on the target.
- **Changed `explosives`** (Explosives):
  - description: reworded: Grenades, satchel charges, mines, sticky bombs and bomb trucks. Anti-tank charges and mines are armour-piercing.
  - allowed: damage-types: +armour-piercing
- **Changed `emp`** (EMP):
  - description: reworded: An electric or electromagnetic pulse or ray that stops machines and shields for a time: they can't move, can't fire, or both. Little or no damage.
- **Changed `magnetic`** (Magnetic):
  - description: reworded: Magnetic beams or harpoons that physically pull, lift or drag vehicles.
- **Changed `psionic`** (Psionic):
  - description: reworded: Powers of the mind: control, confusion, fear, or telekinesis that lifts and crushes. Machines without a crew are immune to mind control.
- **Tie-break added** (`small-arms` / `machine-gun`): Judge by how it fires, not where it sits. Pistols, rifles, carbines and SMGs are always small arms. An automatic rifle or light machine gun is small arms when the sources say it must reload every few bursts (such as the BAR), and a machine gun when it fires long, sustained bursts from a belt, drum or large box. If the sources say neither, a light machine gun is a machine gun. Any belt-fed gun, and any rotary gun firing bullets, is a machine gun, whether a soldier carries it or it sits on a mount. A mounted weapon that the sources say copies a soldier's own gun keeps that soldier's family.
- **Tie-break added** (`small-arms` / `sniper`): Sniper when the sources call it a sniper weapon, give it the game's sniper damage category, or describe slow, precise shots that reach further than ordinary rifles. Killing a soldier in one hit is not enough by itself: commandos' pistols often do. Otherwise a gun, bow, crossbow or thrown blade is small arms.
- **Tie-break added** (`machine-gun` / `autocannon` / `cannon`): Machine guns fire bullets in long bursts. An autocannon fires shells rapidly, whether the sources call it a cannon or an autocannon; a rotary gun counts only when it fires shells. A rotary gun that fires bullets is a machine gun whatever its name (Generals' Gattling Cannon), as the small-arms rule says: what it fires wins over what it is called. A cannon fires one heavy shell at a time, with a pause between shots. Exploding rounds alone, such as bolts, do not make a gun an autocannon: it stays small arms or a machine gun by how it fires. A gun copied from a soldier is settled by the small-arms rule first.
- **Tie-break added** (`artillery` / `cannon` / `rockets`): Artillery when a gun or mortar lobs shells over cover onto a ground point, or when the sources call the gun artillery or indirect fire and it reaches further than the unit itself can see, so others must spot for it. A gun aimed straight at targets in view is a cannon, even when it reaches far. Rockets fired in an arc stay rockets with lobbed delivery, even when the sources call them rocket artillery.
- **Tie-break added** (`rockets` / `guided-missiles`): Guided missiles only when the sources say the missile steers to its target: it locks on before it is fired, the shooter steers it (by wire, laser, camera or crosshair), or, in a commanded game, it homes in on or tracks its target. In a commanded game such a missile takes lock-on delivery (the attack order picks the target before it fires) and no homing trait. If they do not say it steers, it is rockets, whatever the game calls it. In a piloted game (control piloted or both in data/games.json), a rocket that corrects its own course with no lock step and no warning stays rockets and takes the homing trait, and so does a rocket the sources call smart, seeking or self-guided with no lock step.
- **Tie-break added** (`prism` / `laser`): Prism only if the beam splits or bounces to hit several targets; otherwise laser.
- **Tie-break added** (`plasma` / `laser`): Bolts that travel are plasma; light that hits at once or is held on the target is laser.
- **Tie-break added** (`plasma` / `cannon`): A gun that fires one heavy shot, then pauses or reloads, is plasma when the game's own description of the weapon says its shots are plasma or energy bolts or charges, and cannon when they are shells. Its damage category and its cannon-like rhythm do not decide it; say how it fires in the summary. A registry note that sends some damage categories to a bullet family still wins (PlanetSide 2's bullet types).
- **Tie-break added** (`explosives` / `bombs`): Charges that are placed or thrown are explosives; ordnance dropped from a flier is bombs.
- **Tie-break added** (`emp` / `magnetic` / `tesla`): EMP for an electric or electromagnetic pulse or ray whose main effect is to stop machines for a time while doing little or no damage. Code what it stops with traits: root when they can't move, silence when they can't fire, root and silence when they can do neither. Use stun only for a very short stop. Magnetic only for a weapon that physically pulls, lifts or drags its target. Tesla for electric arcs that do real damage.

### Weapon traits (`weapon-traits`), 0.4.0 to 1.0.0

- **Changed `splash`** (Splash):
  - source_rule: added: Set it when the sources say the hit hurts everything in an area around the impact. Leave it off when they say it hits one target at a time, call the area tiny or very small, or disagree. An area effect that does no damage, such as an area stun, is not splash. A radius figure in the sources counts as saying the hit hurts an area. Tiny or very small must be the sources' own words, never a judgement from the figure.
- **Changed `charge-up`** (Charge-up):
  - description: reworded: Hold to charge, then release: a stronger shot, or a burst of more shots.
  - source_rule: added: Set it when the sources say the player holds the trigger to build the shot up before it fires. Energy that builds while the weapon keeps firing, released by another key or by itself, is not charge-up: describe it in the summary.
- **Changed `spin-up`** (Spin-up):
  - source_rule: added: Set it when the sources say or show the rate of fire rising while the weapon keeps firing; continuous-fire stages in a stats table count, because the rise is how it fires.
- **Changed `magazine`** (Magazine):
  - description: reworded: Fires a set number of shots, then must reload, or wait for its ammo to come back on its own.
  - source_rule: added: Set it only when the sources show the reload as part of how this weapon fights: they describe it firing a burst or salvo and then stopping to reload, name its reload or clip as a strength or weakness of this weapon, or say its ammo runs out and comes back on its own. A reload time in a stats table, a passing mention, or a comparison of how often two guns reload does not count. A weapon that holds one shot per reload (a single-shot launcher or cannon) never gets it for that reload: its reload is its rate of fire, so say in the summary, in words, how long it takes.
- **Changed `homing`** (Homing):
  - source_rule: added: Only for shots that steer themselves after firing with no lock step and no steering by the shooter, such as smart rockets. Never with lock-on or guided delivery, which already steer.
- **Changed `suppress`** (Suppress):
  - source_rule: added: Set it only when the sources say this weapon's own fire, with no ability in use, pins or suppresses targets as one of its main jobs, as with a machine gun built for it. A weapon that pins only now and then, or only while an ability is active, does not get it; that ability links the suppress-with-fire pattern instead.
- **Changed `finite-ammo`** (Limited ammo):
  - description: reworded: Carries a fixed stock that does not come back by itself; only a teammate, a station or a pickup refills it, if anything does. A stock that refills on its own over time is magazine.
  - source_rule: added: When the unit has the limited-ammo resource, give this trait only to the weapons that draw on it while others do not (a 'Mech's autocannon and missiles beside its lasers); when every weapon draws on it, the resource alone says so.
- **Changed `anti-air`** (Anti-air):
  - source_rule: added: On a researched weapon, set it exactly when its can_target includes high-air, whatever the family. On flak, guided missiles and autocannons it marks what the weapon is for; on other families it is also what lets the weapon reach high air.

## Lists with a new version number only

`faction-flavours`, `mobility`, `pattern-categories`, `rarity`, `ratings`, `team-play-hooks`.
