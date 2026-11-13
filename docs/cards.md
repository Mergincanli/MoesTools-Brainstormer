# Sample cards

Twelve concept cards, straight out of the card generator: nothing on them was written by hand. Each one is what
the rules make of one seed. Read them to judge whether the cards feel right.

Every weight, count and point behind these cards is a starting value. They will change as the rules are tuned,
and so will the cards.

Roll your own: `npm run roll -- --seed <any text>`. Add `--flavour soviet`, `--tier t2`, `--class walker`, `--role scout` or `--spice 4` to steer it,
and `--count 5` for five at once.

Rolled on data version `d3ec703f39df46e4868d2a0c451cefaf896db1ef64a33f7a546119fa15631dc9` with generator version 0.1.0.

Spice runs from 1 (grounded: common parts that fit the flavour) to 5 (wild: rare mixes).

## The three flavours at each tier

Spice 2 at tier 1 and spice 3 at tiers 2 and 3. The flavour and the tier were chosen; the dice chose the rest.

### Hail-12

*A large Soviet walker: Enemies you suppress are also marked for your whole team for as long as the suppression lasts.*

Walker / mech · T1 · Soviets · role: Anti-armour, Frontline assault (also) · spice 2 · seed `soviet-t1-1`

#### Body

- Moves: Two legs (Pivot (tank controls)), Medium speed; Amphibious
- Body: Reverse-joint walker, Large; Crewed machine; Open
- Armour: Medium (Damage reduction)
- Sensors: Medium sight; Lingering sight
- Crew: Driver + gunner; alone: Auto-gunner
- On death: Respawn

#### Weapons

- Main: Autocannon, Armour-piercing damage, Projectile, Medium range, Free aim mount; hits Infantry, Ground vehicles, Low air, High air, Structures; traits: Magazine, Damage over time; fired from the Driver / pilot seat
- Second: Cannon, Armour-piercing damage, Projectile, Medium range, Slow turret mount; hits Infantry, Ground vehicles, Low air, Structures; traits: Spin-up, Heals on hit; fired from the Gunner seat

#### Abilities

- **Hail Bind** (signature): Channel, Medium cooldown, key Q. Enemies you suppress are also marked for your whole team for as long as the suppression lasts.

#### Team play

Needs an escort: Setup and finisher: the gunner pins, teammates flank or throw explosives into the pinned group.

#### How it plays

- As the player: Press the key and sweep a lane, a doorway or a crossing: enemy infantry there either dive for cover or get pinned in the open.
- Facing it: A loud stream of tracers and a growing pinned marker on your own character warn you before you are fully pinned.
- For teammates: Escort: a rooted gunner needs someone watching its sides while it sweeps.
- What others see: From above, the swept area shows as a fan or lane of dense tracers with a faint tint on the ground for as long as it lasts.
- Controls: LMB Autocannon; LMB Cannon; Q Hail Bind

#### Strong against

- Infantry (class): Its abilities give it the edge over this kind of unit.
- Medium (armour): Its weapons deal damage that is strong against this armour.
- Heavy (armour): Its weapons deal damage that is strong against this armour.
- Super-heavy (armour): Its weapons deal damage that is strong against this armour.

#### Countered by

- Tank / ground vehicle (class): This kind of unit has an answer to its abilities.
- Lobbed (delivery): This kind of unit has an answer to its abilities.
- Raider / flanker (role): Reasoned: the shooter is rooted or busy in one direction, so a fast flanker from outside its arc reaches it unpinned.
- Armour-piercing (damage): This kind of damage works well against this unit's armour, shields or body.
- Electric (damage): This kind of damage works well against this unit's armour, shields or body.

#### Strengths

- Suppress with fire (ability): Pins enemy infantry in a lane or at one target for a few seconds, so teammates can flank or finish them. Paid for by: Suppress with fire (ability).

#### Weaknesses

- Suppress with fire (ability): Rooted, inaccurate or busy while the burst lasts, and the key has a long wait, so the push comes right after it ends.

#### Balance hints

Cost Low, power 2 of 10, complexity 4 of 10, 2 keys.

#### Counterplay

- Get out of the beaten zone, or into hard cover or a building, before you are pinned; the effect builds while you stay under the fire.
- Answer with something that needs no aim: grenades, mortars and other lobbed fire still land while you are pinned.

#### Inspiration

- Patterns: `suppress-with-fire`
- Source units: `iron-harvest.saxony.grimbart`

### Furnace

*A large Soviet vehicle: It heals while standing in a hazard field that hurts or slows everyone else, whether the map, the enemy or its own side made the field.*

Tank / ground vehicle · T2 · Soviets · role: Artillery / siege, Anti-armour (also) · spice 3 · seed `soviet-t2-2`

#### Body

- Moves: Tracks (Pivot (tank controls)), Fast speed
- Body: Launcher rack, Large; Crewed machine; Open
- Armour: Medium (Critical burn, Self-repair)
- Sensors: Short sight
- Crew: Driver + gunner; alone: Auto-gunner
- On death: Bail out

#### Weapons

- Main: Machine gun, Armour-piercing damage, Projectile, Medium range, Free aim mount; hits Infantry, Ground vehicles, Low air, Structures; traits: Minimum range; fired from the Driver / pilot seat
- Second: Guided missiles, Armour-piercing damage, Lock-on, Long range, Free aim mount; hits Infantry, Ground vehicles, Low air, High air, Structures; fired from the Gunner seat

#### Abilities

- **Piston Siphon** (signature): Passive. It heals while standing in a hazard field that hurts or slows everyone else, whether the map, the enemy or its own side made the field.

#### Team play

Counter-pick: Its team fights inside hazard zones or lays fields, letting it hold ground the enemy cannot.

#### How it plays

- As the player: You go where others can't: through the enemy's slowing fields or into their charge-weapon fire, repairing as the status builds on you.
- Facing it: Your status weapon visibly heals it (green sparks instead of the usual effect, and a heal number), so you learn quickly to switch to plain damage.
- For teammates: The enemy team needs a plan: send plain-damage units against it, or coordinate a burst of the status to overload it.
- What others see: The status looks different on this unit (gold or green sparks instead of the usual effect), so enemies see that it is being eaten, not suffered.
- Controls: LMB Machine gun; LMB Guided missiles

#### Strong against

- Slow (weapon trait): Its abilities give it the edge over this kind of unit.
- Leave a hazard zone (ability): Hazard fields meant to hurt or slow it become places where it heals, as Tiberium does for mutants.
- Medium (armour): Its weapons deal damage that is strong against this armour.
- Heavy (armour): Its weapons deal damage that is strong against this armour.
- Super-heavy (armour): Its weapons deal damage that is strong against this armour.

#### Countered by

- Slow (weapon trait): Several enemies stacking the status at once push it into the overload stage, which hurts it faster than it repairs, as Overflow does the Sphere.
- Armour-piercing (damage): This kind of damage works well against this unit's armour, shields or body.
- Electric (damage): This kind of damage works well against this unit's armour, shields or body.
- Energy (damage): This kind of damage works well against this unit's armour, shields or body.
- EMP (damage): This kind of damage works well against this unit's armour, shields or body.

#### Strengths

- Heal from a harmful effect (ability): Enemy weapons or fields that would slow or poison it repair it instead. Paid for by: Heal from a harmful effect (ability).

#### Weaknesses

- Heal from a harmful effect (ability): Away from a hazard field it gets no healing at all, so enemies choose to fight it elsewhere.

#### Balance hints

Cost Medium, power 4 of 10, complexity 4 of 10, 1 key.

#### Counterplay

- Fight it where its signature ability is of no use.

#### Inspiration

- Patterns: `heal-from-debuff`
- Source units: `tempest-rising.dynasty.tempest-sphere`

### Boiler-3

*A large Soviet aircraft: Pick a spot at range; a storm hurts every unit inside it, ground and air, friend and foe (not buildings), for a few seconds.*

Aircraft · T3 · Soviets · role: Anti-infantry, Area denial (also) · spice 3 · seed `soviet-t3-4`

#### Body

- Moves: Jet (Forward only), Fast speed
- Body: Fixed-wing, Large; Crewed machine; Open
- Armour: Super-heavy (Damage reduction)
- Sensors: Medium sight
- Crew: Driver + gunner + commander; alone: Full control
- On death: Bail out, Wreck

#### Weapons

- Main: Tesla / electric, Electric damage, Hitscan, Medium range, Auto-target mount; hits Infantry, Ground vehicles, Low air, Structures; fired from the Driver / pilot seat
- Second: EMP, EMP damage, Projectile, Medium range, Auto-target mount; hits Infantry, Ground vehicles, Low air, Structures; traits: Splash; fired from the Gunner seat

#### Abilities

- **Rivet Wall** (signature): Active, Medium cooldown, key Q. Pick a spot at range; a storm hurts every unit inside it, ground and air, friend and foe (not buildings), for a few seconds. Storms on the same spot do not stack.
- **Rage when wounded**: Passive.
- **Become invulnerable**: Active, Medium cooldown, key R.
- **Lay mines**: Active, Short cooldown, key Shift, Commander seat.

#### Team play

Needs an escort: Allies keep enemies inside: a stun, a pull or suppression right after it lands turns the zone into a kill box.

#### How it plays

- As the player: Read where the enemy has to walk (a choke, a capture point, the lane behind a retreating tank) and cover it; the zone works while you shoot, reposition or hold. You play close to the edge: a hurt brawler with this passive is worth more in the fight than a healthy one, so you stay in rather than retreating at half health. Press Q at the right moment: when the enemy commits its burst, to cross a deadly stretch, or to buy the seconds your teammates need to arrive. You buy a fast, lightly armed or unarmed unit and carry a few mines, shown as pips.
- Facing it: A coloured ground patch with a sharp rim and a hiss or crackle shows the zone before it has hurt you much: step out, go round, or rush through if the prize is worth it. Get out of its fire and your machine comes back to life in a moment.
- For teammates: Versions that hurt allies make the team plan around them: they must give way at the choke you flood, or the zone is tuned to spare friends.
- What others see: A strongly coloured ground patch with a crisp rim, drawn under units but above terrain and readable from the top-down camera at any zoom; the colour tells what it does (green toxic, orange fire, blue slow).
- Controls: LMB Tesla / electric; LMB EMP; Q Rivet Wall; R Become invulnerable; Shift Lay mines

#### Strong against

- Infantry (class): Soldiers cross a zone slowly and wear down fast inside it.
- Slow or less (speed): Slow units cannot get out of a zone before it has done its work.
- Infest a vehicle (ability): Its abilities give it the edge over this kind of unit.
- Infiltrator / saboteur (role): Mines at doors and side paths catch saboteurs and sneaking flankers, cloaked ones included.
- Logistics (role): Harvesters and supply runs follow set routes, so a mined route or resource field catches them.

#### Countered by

- Long or more (range): Long-range weapons hit the caster from well outside its zone.
- Heavy or more (armour): Heavy armour shrugs off most zone damage long enough to cross it or to reach the caster.
- Silence / disarm (weapon trait): This kind of unit has an answer to its abilities.
- Knockback (weapon trait): This kind of unit has an answer to its abilities.
- Aircraft (class): Fliers never touch ground mines and can hunt a planter that has to stop to lay them.

#### Strengths

- Area denial (role): Denies ground: enemies must leave the zone, go round it or pay to cross. Paid for by: Leave a hazard zone (ability).
- Rage when wounded (ability): The more health it has lost, the harder it hits, so a wounded one can still turn a losing fight. Paid for by: Rage when wounded (ability).
- Become invulnerable (ability): For a few seconds nothing can hurt it, so it rides out a burst, crosses a deadly gap or keeps a push alive. Paid for by: Become invulnerable (ability).
- Lay mines (ability): Its hidden mines keep hurting or stopping enemies on routes it is no longer watching, and every trigger pings it. Paid for by: Lay mines (ability).

#### Weaknesses

- Leave a hazard zone (ability): The zone is fixed to the ground and shows its edge, so alert enemies simply walk round it; its value depends on placement.
- Rage when wounded (ability): At full health it gets no bonus, its peak comes when one more burst would kill it, and healing takes the bonus away.
- Become invulnerable (ability): While protected it can't fire, move freely or hold objectives in most versions, and it pays afterwards with a slump or a long recharge.
- Lay mines (ability): A mine does nothing until an enemy touches it, the stock is small, and detection, sweeping or a blast at the ground removes it.

#### Balance hints

Cost High, power 9 of 10, complexity 10 of 10, 4 keys.

#### Counterplay

- Step out or go round: the zone is fixed to the ground and shows its edge, so leaving it ends the harm.
- Spread out: zones punish packed groups far more than one runner.
- Finish it in one burst: take it from healthy to dead before it can trade blows at its peak, since a badly hurt one is the most dangerous.
- Stop wasting fire and wait it out: back off, reposition and save your burst for the moment it ends; many versions can't be ended early, so the timing is known.
- Bring detection: a detector, a scan or a scout's mark reveals mines to the whole team, and a revealed mine can be driven around.

#### Inspiration

- Patterns: `leave-hazard-zone`, `rage-when-wounded`, `become-invulnerable`, `lay-mines`
- Source units: `ra2.iraq.desolator`

### Icefall A5

*A small Allied soldier: Built around one signature ability.*

Infantry · T1 · Allies · role: Frontline assault · spice 2 · seed `allied-t1-6`

#### Body

- Moves: On foot (Strafe), Fast speed; Amphibious, Climb
- Body: Humanoid, Small; Organic; Limited
- Armour: Medium (Recharging shield, Ablative plates)
- Sensors: Medium sight; Stealth
- Crew: Solo
- On death: Respawn

#### Weapons

- Main: Laser, Energy damage, Hitscan, Medium range, Limited arc mount; hits Infantry, Ground vehicles, Low air, Structures; fired from the Driver / pilot seat
- Second: Repair tool, Repair damage, Beam, Short range, Free aim mount; hits Infantry, Ground vehicles, Low air, Structures; traits: Minimum range; fired from the Driver / pilot seat

#### Abilities

- **Polar Relay** (signature): Active, Short cooldown, key Q. Its signature ability comes from the pattern listed under inspiration.
- **Disguise**: Passive.

#### Team play

Protector: Drivers protect their mechanic and stay inside its range, and the mechanic follows armoured pushes.

#### How it plays

- As the player: You buy a fragile support unit whose main tool is a repair or healing beam: hold left mouse on a damaged teammate (vehicles or soldiers, depending on the tool) to restore health, and score points for every bit you restore. Press Q on a unit in view to copy its look after a short, visible change-over; with the always-on variant you simply look like each viewer's own basic soldier.
- Facing it: Every repairer is a priority target: it is fragile, and its patient starts losing again once it falls.
- For teammates: A natural protector pair: repairers make tanks last, and tanks shield repairers.
- What others see: A team-coloured beam with sparks on vehicles or crosses on soldiers, and green numbers on the patient.
- Controls: LMB Laser; RMB Repair tool; Q Polar Relay

#### Strong against

- Infest a vehicle (ability): Its abilities give it the edge over this kind of unit.
- Deploy a turret (ability): Automatic turrets and devices don't fire at what looks like a friend.
- Structures (target): Base defences can't see through the disguise, so it slips past them.
- Medium (armour): Its weapons deal damage that is strong against this armour.
- Heavy (armour): Its weapons deal damage that is strong against this armour.

#### Countered by

- Marksman / overwatch (role): Snipers pick off the fragile repairer standing behind the line.
- Raider / flanker (role): Flankers reach the support player at the back and kill it before it can run.
- Splash (weapon trait): Splash hits the repairer standing next to its patient.
- Detector (sensor): Detectors unmask it for their whole team, and a found infiltrator has little to fight back with.
- Reveal an area (ability): A scan over the area shows which units are real.

#### Strengths

- Repair tool (weapon): Keeps teammates fighting at the front by mending them in the field instead of sending them back to base. Paid for by: Repair tool (weapon).
- Disguise (ability): Turrets, bots and careless players let it walk through enemy lines, so it chooses where the fight starts. Paid for by: Disguise (ability).

#### Weaknesses

- Repair tool (weapon): Its tool does little or nothing to enemies, so it is weak in a fight and has to stay close behind the allies it mends.
- Disguise (ability): Moving ends the cover and firing makes it flicker, and once found it is usually fragile.

#### Balance hints

Cost Medium, power 4 of 10, complexity 5 of 10, 2 keys.

#### Counterplay

- Kill the repairer first: it is usually fragile and unarmed, and once it falls its patient starts losing ground again.
- Out-damage the repair: burst the patient faster than it is mended, or finish it before the repairer arrives.
- Bring a detector: attack dogs, scout drones, psychic sensors and similar units see through a disguise, and several of them attack the impostor on their own.

#### Inspiration

- Patterns: `repair-allies`, `disguise`
- Source units: `generals.china.overlord`, `iron-harvest.polania.anna-kos`, `iron-harvest.shared.engineer`

### Meridian E9

*A small Allied drone: The carrier burrows or hides in cover and waits under the enemy's path, then goes off when they walk over it.*

Drone / support · T2 · Allies · role: Support, Area denial (also) · spice 3 · seed `allied-t2-5`

#### Body

- Moves: Tracks (Pivot (tank controls)), Fast speed; Amphibious
- Body: Micro-bot, Small; Uncrewed machine; Open
- Armour: Light (Critical burn, Evasive)
- Sensors: Medium sight
- Crew: Solo
- On death: Respawn

#### Weapons

- Main: Cryo, Cryo damage, Beam, Medium range, Auto-target mount; hits Infantry, Ground vehicles, Low air, Structures; traits: Overheat; fired from the Driver / pilot seat
- Second: Repair tool, Repair damage, Beam, Short range, Free aim mount; hits Infantry, Ground vehicles, Low air, Structures; traits: Splash; fired from the Driver / pilot seat

#### Abilities

- **Glacier Breaker** (signature): Triggered. The carrier burrows or hides in cover and waits under the enemy's path, then goes off when they walk over it.
- **Leave a hazard zone**: Deploy, Short cooldown, key R.

#### Team play

Setup and finisher: Setups keep enemies in the ring: stuns, slows, pulls and walls that pin them in the open.

#### How it plays

- As the player: Your whole life is the approach: cover, escorts and timing get you into the enemy's clump; dying on the way wastes the purchase. Read where the enemy has to walk (a choke, a capture point, the lane behind a retreating tank) and cover it; the zone works while you shoot, reposition or hold.
- Facing it: A siren and a ring on the ground show when and where it will go off: leave the ring, get behind cover, or kill the carrier first. Break the line of fire and the frost stops building.
- For teammates: Defenders answer with barriers, invulnerability or a 'can't die' field timed to the blast, and healers stand ready for afterwards.
- What others see: A ring on the ground showing the blast's reach, a countdown on the carrier and a rising alarm that everyone on screen hears; the ring is in team colour for allies and red for enemies.
- Controls: LMB Cryo; RMB Repair tool; R Leave a hazard zone

#### Strong against

- Slow or less (speed): Slow units can't get out of the blast before it goes off.
- Structures (target): Buildings and fixed defences can't dodge it at all.
- Fast or more (speed): Fast units that kite or run lose their edge while slowed inside the field.

#### Countered by

- Detector (sensor): Detection reveals the hidden carrier so it can be shot before anyone walks over it.
- Long or more (range): Once the hidden carrier is found, long-range guns destroy it before anyone walks over it.
- Fast or more (speed): Fast units leave the blast area before it goes off.
- Become invulnerable (ability): Units made immune for the moment shrug off the blast, wasting the carrier's one try.
- Kinetic (damage): This kind of damage works well against this unit's armour, shields or body.

#### Strengths

- Self-destruct (ability): One blast deals far more damage around it than its guns could, enough to break a group or a defence. Paid for by: Self-destruct (ability).
- Area denial (role): Denies ground: enemies must leave the zone, go round it or pay to cross. Paid for by: Leave a hazard zone (ability).

#### Weaknesses

- Self-destruct (ability): The blast uses up the unit, so it must reach its target alive and gets one try per life.
- Leave a hazard zone (ability): The zone is fixed to the ground and shows its edge, so alert enemies simply walk round it; its value depends on placement.

#### Balance hints

Cost Low, power 4 of 10, complexity 4 of 10, 2 keys.

#### Counterplay

- Kill it at range before it arrives: most carriers are fragile or slow, and many have no other weapon.
- Kill it far from your own side: carriers that blow up when destroyed hurt whatever is near them, and careless players have lost their own bases that way.
- Step out or go round: the zone is fixed to the ground and shows its edge, so leaving it ends the harm.

#### Inspiration

- Patterns: `self-destruct`, `leave-hazard-zone`
- Source units: `ra1.soviet.mad-tank`

### Lucent E6

*A huge Allied hovercraft: Passengers shoot their own weapons out of ports, possibly with a bonus; the vehicle's output is the sum of who is aboard.*

Hovercraft · T3 · Allies · role: Marksman / overwatch, Logistics (also) · spice 3 · seed `allied-t3-29`

#### Body

- Moves: Hover (Drift), Fast speed; Crush
- Body: Hull with turret, Huge; Crewed machine; Open
- Armour: Light (Directional armour)
- Sensors: Medium sight
- Crew: Driver + gunner; alone: Auto-gunner; 6 passenger seats (Passenger (firing))
- On death: Bail out

#### Weapons

- Main: Cryo, Cryo damage, Beam, Medium range, Free aim mount; hits Infantry, Ground vehicles, Low air, Structures; traits: Spin-up; fired from the Driver / pilot seat
- Second: Prism, Energy damage, Beam, Long range, Free aim mount; hits Infantry, Ground vehicles, Low air, Structures; fired from the Gunner seat

#### Abilities

- **Floe Berth** (signature): Passive. Passengers shoot their own weapons out of ports, possibly with a bonus; the vehicle's output is the sum of who is aboard.
- **Depend on a relay**: Active, Short cooldown, key R.
- **Freeze and shatter**: Active, Medium cooldown, key Shift.
- **Gather resources**: Channel, Medium cooldown, key Q.

#### Team play

Seat synergy: A built-in two-player combo: 'need a ride' and 'need anti-tank' calls, and in-field counter-picking without re-buying.

#### How it plays

- As the player: As the driver you buy a cheap, fast chassis with a narrow but useful default weapon, so you aren't useless alone. You buy a unit that is better than its tier suggests, such as a cheap hover tank that can't be mind-controlled or a light tank carrying a heavy laser, because part of it lives in the relay. You buy a fragile, fast support, such as a helicopter in the Cryocopter's spirit or a cryo trooper. You buy a slow, tough hauler and spend the life on the economy: drive to a node, hold the mining tool on it to fill your hopper, then drive into a drop-off's ring to bank the load.
- Facing it: Check the roof weapon, the colour of its shots and the loadout icon before committing, then fight it with what it lacks. Break the line of fire and the frost stops building.
- For teammates: An engineer passenger makes it a mobile repair station that also strips parasites off vehicles, a natural answer to infesters.
- What others see: A distinct roof weapon model for each of 4-6 loadout groups (for example anti-armour, anti-infantry, anti-air and support tool), readable from above, plus colour-coded shots and a group icon on the nameplate.
- Controls: LMB Cryo; LMB Prism; R Depend on a relay; Shift Freeze and shatter; Q Gather resources

#### Strong against

- Infantry (class): Brings whatever weapons its riders carry, or vehicle-sized versions of them, to soldiers who can't outrun it.
- Heavy or more (armour): Holds heavy tanks and walkers helpless while teammates break them, which no amount of armour prevents.
- Artillery / siege (role): Freezes artillery before it can fire, shutting down a siege gun before it reaches the defences.
- Medium (armour): Its weapons deal damage that is strong against this armour.
- Heavy (armour): Its weapons deal damage that is strong against this armour.

#### Countered by

- Anti-armour (role): Its light hull falls fast to anti-armour, throwing everyone inside out hurt.
- Splash (weapon trait): Splash and burst damage kill the light hull and then catch the hurt players it throws out.
- Infiltrator / saboteur (role): Saboteurs and spies reach the relay or black out its power, switching off every linked unit at once.
- Raider / flanker (role): Fast raiders slip past the front to hit the relay while its units are busy fighting.
- Artillery / siege (role): Artillery shells the relay from beyond the fight.

#### Strengths

- 1 or more (passenger seats): Changes role mid-match depending on who climbs in. Paid for by: 1 or more (passenger seats).
- Depend on a relay (ability): Carries its own relay, so it fights above its price wherever it plants the beacon, with no base to defend. Paid for by: Depend on a relay (ability).
- Freeze and shatter (ability): Its strike breaks frozen enemies for heavy damage, turning any teammate's freeze into a kill. Paid for by: Freeze and shatter (ability).
- Logistics (role): Earns money for the whole team by working nodes or wrecks, so the team can buy better units sooner. Paid for by: Logistics (role).

#### Weaknesses

- 1 or more (passenger seats): Alone it has at most a modest default weapon, and losing the vehicle leaves everyone inside hurt and on foot.
- Depend on a relay (ability): Shuts down whenever it leaves the beacon's radius or the beacon is destroyed, and has to stop to move it forward.
- Freeze and shatter (ability): The strike does little to targets that aren't frozen, so it depends on a freezer working beside it.
- Logistics (role): Spends its life mining instead of fighting, risks its load until it banks it, and is helpless against raiders without an escort.

#### Balance hints

Cost Very high, power 10 of 10, complexity 10 of 10, 4 keys; warnings: Off-flavour.

#### Counterplay

- Read the loadout from the roof weapon, then fight it with what that loadout lacks; a passenger without anti-air removes the vehicle's anti-air.
- Burst the light chassis: it throws both players out hurt and on foot, so keep anti-infantry fire ready for the follow-up.
- Find and destroy the relay: it is usually softer and easier to reach than the units it runs, and losing it switches all of them off at once.
- Break the build-up: leave the beam's reach or its line of sight before the freeze lands; the cold fades once the beam stops.
- Raid the gatherer away from its escort: it is slow and lightly armed or unarmed, and a kill before it banks also costs the team its load.

#### Inspiration

- Patterns: `passenger-sets-weapon`, `depend-on-relay`, `freeze-and-shatter`, `gather-resources`
- Source units: `generals.gla.battle-bus`, `generals.usa-air-force.combat-chinook`, `ra3.allied.multigunner-ifv`

### Swallow Thaw

*A medium Empire soldier: The drone mends armour or hulls, heals, turns bullets aside or helps build instead of fighting, and can be sent to a teammate; it can't*

Infantry · T1 · Empire · role: Disabler / control · spice 2 · seed `empire-t1-1`

#### Body

- Moves: On foot (Strafe), Fast speed
- Body: Power suit, Medium; Organic; Open
- Armour: Light (Charged shield)
- Sensors: Long sight
- Crew: Solo
- On death: Respawn

#### Weapons

- Main: Sniper, Kinetic damage, Hitscan, Long range, Free aim mount; hits Infantry, Ground vehicles, Low air, High air; traits: Anti-air, Minimum range; fired from the Driver / pilot seat
- Second: Flak, Explosive damage, Projectile, Medium range, Radial mount; hits Infantry, Low air, High air; traits: Damage over time, Silence / disarm; fired from the Driver / pilot seat

#### Abilities

- **Bloom Kennel** (signature): Active, Short cooldown, key Q. The drone mends armour or hulls, heals, turns bullets aside or helps build instead of fighting, and can be sent to a teammate; it can't defend itself.

#### Team play

Setup and finisher: The owner's team uses drones to scout and screen: they spot over walls, soak a few shots and pin a target that a teammate then finishes, as Gekko's Wingman concusses a defender for his team.

#### How it plays

- As the player: Press Q to release your drones: two to four small fliers (more at the top tier) that spread around you, stay inside a short leash, and attack whatever you hit last, or the nearest enemy in sight if you hit nothing.
- Facing it: Right now you can shoot them (they have little health), throw splash into the bunch, use an EMP to drop them all, break line of sight, or run past their owner's leash so they turn back.
- For teammates: Support builds send a drone to a teammate to repair, heal or turn bullets aside for them (The Division 2's Fixer and Defender), which makes the owner a protector.
- What others see: Release: a hatch sound and the drones fanning out from the unit, each with a team-coloured light and a shadow on the ground so it reads over terrain from above.
- Controls: LMB Sniper; RMB Flak; Q Bloom Kennel

#### Strong against

- Structures (target): Its abilities give it the edge over this kind of unit.
- Deploy a turret (ability): Its abilities give it the edge over this kind of unit.
- Unarmoured (armour): Its weapons deal damage that is strong against this armour.
- Light (armour): Its weapons deal damage that is strong against this armour.

#### Countered by

- Anti-air (role): This kind of unit has an answer to its abilities.
- Splash (weapon trait): This kind of unit has an answer to its abilities.
- EMP (weapon): This kind of unit has an answer to its abilities.
- Raider / flanker (role): A fast flanker reaches the owner, whose drones fall when he dies, and a piloting operator stands still and can't fight back.
- Kinetic (damage): This kind of damage works well against this unit's armour, shields or body.

#### Strengths

- Launch drones (ability): Keeps repairing, healing or shielding a chosen teammate while its owner fights, so a push outlasts chip damage. Paid for by: Launch drones (ability).

#### Weaknesses

- Launch drones (ability): The drone can't defend itself, and the teammate it guards becomes the obvious target.

#### Balance hints

Cost Medium, power 5 of 10, complexity 3 of 10, 2 keys.

#### Counterplay

- Fight it where its signature ability is of no use.

#### Inspiration

- Patterns: `launch-drones`
- Source units: `tempest-rising.gdf.drone-operator`, `tempest-rising.veti.vimana`

### Pine Mist

*A medium Empire soldier: Missiles and rockets inside the field veer off and miss instead of firing slower; the strays still explode where they land, and the*

Infantry · T2 · Empire · role: Area denial, Anti-armour (also) · spice 3 · seed `empire-t2-8`

#### Body

- Moves: On foot (Strafe), Fast speed; Amphibious
- Body: Power suit, Medium; Organic; Limited
- Armour: Heavy (Damage reduction)
- Sensors: Short sight
- Crew: Solo
- On death: Respawn

#### Weapons

- Main: Guided missiles, Armour-piercing damage, Lock-on, Long range, Body aim mount; hits Infantry, Ground vehicles, Low air, High air, Structures; traits: Lingering zone, Anti-air; fired from the Driver / pilot seat

#### Abilities

- **Thaw Bind** (signature): Deploy, Short cooldown, key Q. Missiles and rockets inside the field veer off and miss instead of firing slower; the strays still explode where they land, and the field is off while the unit uses its other main tool.

#### Team play

Protector: Protector: allies holding ground inside the field take much less rocket and missile fire.

#### How it plays

- As the player: Stop beside the team's hold point or a vehicle push and the field comes up by itself; there is no key to press.
- Facing it: Your rocket or missile weapon's fire rate visibly drops and an interference icon shows on your HUD while you are inside the field.
- For teammates: Escort dependency: the field unit stands still and is usually lightly armed, so it needs teammates to keep enemies off it.
- What others see: From above, a faint shimmering ring at the field's edge, team-coloured for allies and red for enemies, visible only while it is up.
- Controls: LMB Guided missiles; Q Thaw Bind

#### Strong against

- Rockets (weapon): Its abilities give it the edge over this kind of unit.
- Guided missiles (weapon): Its abilities give it the edge over this kind of unit.
- Medium (armour): Its weapons deal damage that is strong against this armour.
- Heavy (armour): Its weapons deal damage that is strong against this armour.
- Super-heavy (armour): Its weapons deal damage that is strong against this armour.

#### Countered by

- Artillery / mortar (weapon): This kind of unit has an answer to its abilities.
- Cannon (weapon): This kind of unit has an answer to its abilities.
- Armour-piercing (damage): This kind of damage works well against this unit's armour, shields or body.
- Fire (damage): This kind of damage works well against this unit's armour, shields or body.
- Energy (damage): This kind of damage works well against this unit's armour, shields or body.

#### Strengths

- Dampen missile fire (ability): Enemy rocket and missile weapons near it fire much more slowly, so it and nearby allies shrug off rocket-heavy attacks and missile defences. Paid for by: Dampen missile fire (ability).

#### Weaknesses

- Dampen missile fire (ability): Works only while standing still and does nothing against guns and shells, so pressure that makes it move, or a gun-armed enemy, takes it out of the fight.

#### Balance hints

Cost Medium, power 4 of 10, complexity 2 of 10, 1 key; warnings: Off-flavour.

#### Counterplay

- Bring guns, cannons or artillery: shells and bullets ignore the field entirely.
- Force the unit to move, by pressure or by flanking it: the field drops while it is on the move.

#### Inspiration

- Patterns: `dampen-missile-fire`
- Source units: `tempest-rising.gdf.shieldmaiden`

### Hare Current

*A medium Empire vehicle: Always on: each enemy sees you as one of their own basic soldiers.*

Tank / ground vehicle · T3 · Empire · role: Infiltrator / saboteur, Anti-armour (also) · spice 3 · seed `empire-t3-3`

#### Body

- Moves: Wheels (Steer), Very fast speed
- Body: Launcher rack, Medium; Crewed machine; Open
- Armour: Heavy (Self-repair)
- Sensors: Long sight
- Crew: Driver + gunner; alone: Full control
- On death: Respawn

#### Weapons

- Main: Rockets, Armour-piercing damage, Projectile, Medium range, Limited arc mount; hits Infantry, Ground vehicles, Low air, Structures; traits: Spin-up, Charge-up; fired from the Driver / pilot seat
- Second: Cannon, Armour-piercing damage, Projectile, Medium range, Free aim mount; hits Infantry, Ground vehicles, Low air, Structures; traits: Heals on hit; fired from the Gunner seat

#### Abilities

- **Moth Shade** (signature): Passive. Always on: each enemy sees you as one of their own basic soldiers. After you attack or are hit, the disguise comes back by itself a few seconds later.
- **Deploy a turret**: Active, Long cooldown, key R.
- **Convert the fallen**: Active, Short cooldown, key Shift.

#### Team play

Spotter: Pair the disguise with a strike: the disguised player walks in, opens with a sabotage (capture-structure) or a surprise shot, and the team pushes in behind.

#### How it plays

- As the player: Press Q on a unit in view to copy its look after a short, visible change-over; with the always-on variant you simply look like each viewer's own basic soldier. You carry one turret (two at the top tier), shown on your HUD with its health. Your weapon's hits, or an aura around you, tag enemy soldiers for a few seconds; the tag refreshes while you keep hitting them or while they stay in range.
- Facing it: The impostor looks like a teammate or a prop. The tells are there on purpose: its name belongs to a teammate your minimap shows somewhere else, it moves at the wrong speed, or it never answers pings.
- For teammates: A disguised transport carries a squad past the turrets and unloads deep in enemy lines; unloading ends the cover.
- What others see: The disguised player sees their real unit with a mask outline and a banner naming the current disguise, so they always know what the enemy sees.
- Controls: LMB Rockets; LMB Cannon; R Deploy a turret; Shift Convert the fallen

#### Strong against

- Deploy a turret (ability): Automatic turrets and devices don't fire at what looks like a friend.
- Structures (target): Base defences can't see through the disguise, so it slips past them.
- Infantry (class): Its abilities give it the edge over this kind of unit.
- Buffer / aura (role): A buffer's boosts do nothing for tagged soldiers.
- Medium (armour): Its weapons deal damage that is strong against this armour.

#### Countered by

- Detector (sensor): Detectors unmask it for their whole team, and a found infiltrator has little to fight back with.
- Reveal an area (ability): A scan over the area shows which units are real.
- Fire (damage): Fire burns a disguised unit like any other, and the burning gives it away.
- Raider / flanker (role): A fast flanker circles to the side or rear that the fixed arc can't cover and kills the nest there.
- Long or more (range): A turret can't move or chase, so long-range guns and artillery kill it from outside its reach.

#### Strengths

- Disguise (ability): Turrets, bots and careless players let it walk through enemy lines, so it chooses where the fight starts. Paid for by: Disguise (ability).
- Deploy a turret (ability): Its turret holds and shoots at a spot it is no longer watching, so one player covers two places. Paid for by: Deploy a turret (ability).
- Convert the fallen (ability): Enemy soldiers that die tagged come back as minions on its side, and buffs on tagged soldiers are wasted. Paid for by: Convert the fallen (ability).

#### Weaknesses

- Disguise (ability): The cover ends when it attacks or is hit, and once found it is usually fragile and poorly armed.
- Deploy a turret (ability): The turret can't move, is easy to see and outrange, and the owner loses time placing and repairing it.
- Convert the fallen (ability): Does nothing to vehicles and machines, and its minions are weak and short-lived.

#### Balance hints

Cost High, power 8 of 10, complexity 7 of 10, 3 keys.

#### Counterplay

- Bring a detector: attack dogs, scout drones, psychic sensors and similar units see through a disguise, and several of them attack the impostor on their own.
- Scan the area: a reveal ability or a detector sweep shows which units are real.
- Use splash and explosives: rockets, grenades and shelling break turrets fast, and a cluster of turrets or of players around a support station takes splash together.
- Pull tagged soldiers back rather than letting them die there: a soldier who leaves the aura, or outlives a short curse, rises as nothing.

#### Inspiration

- Patterns: `disguise`, `deploy-turret`, `convert-on-kill`
- Source units: `ra1.allied.spy`, `ra3.empire.sudden-transport`

## One wild card per flavour

Spice 5. Only the flavour was chosen.

### Rivet-40

*A small Soviet soldier: No crate: the supplier's buff or support zone reloads whoever it lands on, or makes them reload and recharge faster while they stand in*

Infantry · T1 · Soviets · role: Raider / flanker, Support (also) · spice 5 · seed `soviet-wild-1`

#### Body

- Moves: On foot (Strafe), Fast speed
- Body: Humanoid, Small, 3 bodies; Organic; Open
- Armour: Light (Ablative plates)
- Sensors: Medium sight
- Crew: Squad
- On death: Respawn

#### Weapons

- Main: Melee weapon, Electric damage, Attach, Melee range, Free aim mount; hits Infantry, Ground vehicles, Structures; traits: Silence / disarm; fired from the Driver / pilot seat

#### Abilities

- **Boar Boon** (signature): Active, Short cooldown, key Q. No crate: the supplier's buff or support zone reloads whoever it lands on, or makes them reload and recharge faster while they stand in it.
- **Switch weapon mode**: Toggle / mode switch, Spammable cooldown, key R.

#### Team play

Resupply: Players on finite ammo, such as rocket troops, artillery and gadget-heavy kits, stay near the supplier or call it over with a ping.

#### How it plays

- As the player: You buy a support unit that carries supplies as well as a weapon: press Q to drop a crate, and teammates inside its small ring get ammo, grenades and ability charges back over a few seconds. You carry two answers but use one at a time; good players switch before the fight changes, not after.
- Facing it: You see the crate and its ring; destroy it and the enemy's refills stop. Something is clinging to you: hold F to throw it off.
- For teammates: The crate turns a piece of cover into a small forward base that the team holds.
- What others see: The crate shows a team-coloured ring and a gauge of what it has left; teammates inside see their ammo counters tick up, with a soft sound.
- Controls: LMB Melee weapon; Q Boar Boon; R Switch weapon mode

#### Strong against

- Uncrewed machine (nature): Its weapons deal damage that works well on this kind of unit.
- Light (armour): Its weapons deal damage that is strong against this armour.
- Medium (armour): Its weapons deal damage that is strong against this armour.

#### Countered by

- Raider / flanker (role): Fast flankers reach the supplier and its crate behind the line and cut the refills off.
- Artillery / siege (role): Artillery shells a parked supplier or a crate from beyond the fight.
- Splash (weapon trait): Teammates bunch up around the crate, and area damage hits them all.
- Fast or more (speed): Fast units change the fight faster than it can swap, and slip out of slow lock-on modes.
- Silence / disarm (weapon trait): Blocking its abilities strands it in whichever mode it was in.

#### Strengths

- Support (role): Keeps teammates' heavy weapons, grenades and gadgets topped up at the front, so they need not go back to base. Paid for by: Resupply allies (ability).
- Switch weapon mode (ability): Carries two answers and picks the one the fight needs. Paid for by: Switch weapon mode (ability).

#### Weaknesses

- Resupply allies (ability): Its own stock or cooldown limits it, and it is soft and often standing still beside the crate or parked to hand out supplies.
- Switch weapon mode (ability): Only one mode works at a time, and each swap leaves a short gap with neither ready.

#### Balance hints

Cost Low, power 3 of 10, complexity 4 of 10, 2 keys.

#### Counterplay

- Kill the supplier: it is soft and often parked, and the heavy weapons in front of it run dry soon after.
- Cut the route: a supplier with a limited stock has to go back to a base to restock, so raid the road or the base behind it.
- Read the active mode from its model, shots or icon, and fight it with what that mode is weak against.

#### Inspiration

- Patterns: `resupply-allies`, `switch-weapon-mode`
- Source units: `tempest-rising.veti.enlightened`, `tempest-rising.veti.vimana`

### Stratus A6

*A tiny Allied drone: Earners can work from inside a friendly shelter that holds several of them and pays a little faster; they are safe while it stands, so the*

Drone / support · T3 · Allies · role: Logistics · spice 5 · seed `allied-wild-2`

#### Body

- Moves: Wheels (Steer), Fast speed; Amphibious
- Body: Micro-bot, Tiny; Uncrewed machine; Open
- Armour: Light (Ablative plates)
- Sensors: Short sight; Lingering sight, Detector
- Crew: Remote operator
- On death: Respawn, Death blast

#### Weapons

- Main: none

#### Abilities

- **Nimbus Boon** (signature): Deploy, Short cooldown, key Q. Earners can work from inside a friendly shelter that holds several of them and pays a little faster; they are safe while it stands, so the shelter becomes the enemy's target.
- **Bombard an area**: Active, Short cooldown, key R.
- **Pull a target**: Channel, Medium cooldown, key Shift.

#### Team play

Needs an escort: The earner's team: an escort or a friendly turret near its spot keeps it alive, and the money it brings lets everyone buy better cards sooner.

#### How it plays

- As the player: You buy a cheap card with no real weapon. Press the key to unpack: after a short set-up you earn a payment for the team every few seconds, and a bar shows how close you are to the next rank. Press, place the target circle (on screen, or on a zoomed-out map for the longest strikes), confirm; the strike lands after a set delay. The skill is aim and timing: the hook flies along a visible line and grabs the first enemy it meets.
- Facing it: Somewhere on the map an enemy earner is feeding their team's money. A faint signal pulse every so often gives its rough direction, so hunting it is worth a detour. Once hooked you can't fire during the short pull. A lift lasts longer, so hold F to struggle free sooner and call for help.
- For teammates: The enemy team: scouts and raiders hunt the earner, and a scout who spots it should ping it so a hunter can finish it.
- What others see: A laptop or antenna unfolds over the model, and a soft coin tick plays with each payment; teammates see small money pop-ups.
- Controls: Q Nimbus Boon; R Bombard an area; Shift Pull a target

#### Strong against

- Structures (target): Buildings, turrets and deployables cannot dodge the strike.
- Deploy / anchor (movement trait): Deployed units cannot pack up and leave before impact.
- Slow or less (speed): Slow units cannot clear the marked area in time.
- Artillery / siege (role): Artillery hiding behind its front line is dragged into brawling range.
- Marksman / overwatch (role): Snipers holding a far sightline are hooked off it.

#### Countered by

- Tank / ground vehicle (class): This kind of unit has an answer to its abilities.
- Aircraft (class): This kind of unit has an answer to its abilities.
- Scout / recon (role): It hides by setting up where nobody looks, so scouts who find and mark it hand their team an easy kill.
- Fast or more (speed): Fast units are out of the circle long before impact and can close on the caster.
- Raider / flanker (role): Flankers catch the planter while it is busy setting the beacon down at the target.

#### Strengths

- Logistics (role): Earns money for the whole team wherever it sets up, with no field or route to defend, and earns more with every rank it gains. Paid for by: Generate income in place (ability).
- Bombard an area (ability): Hits a spot far beyond its own gun's reach, hard enough to clear a point or wreck a deployed vehicle. Paid for by: Bombard an area (ability).
- Pull a target (ability): Pulls one enemy out of its group and into your team's guns, behind a wall or up into the air where it can't fight back. Paid for by: Pull a target (ability).

#### Weaknesses

- Generate income in place (ability): Unarmed and rooted while it earns, and slow to pack up, so anything that finds it can kill it and stop the income.
- Bombard an area (ability): The strike lands only after a warning, so alert, mobile enemies step out of it; it pays off mostly on slow or stationary targets.
- Pull a target (ability): One target at a time; it stands still and holds fire while it pulls, and a missed throw leaves it waiting.

#### Balance hints

Cost Medium, power 5 of 10, complexity 6 of 10, 3 keys.

#### Counterplay

- Strike early: a new earner brings in little and grows with every rank, so a kill before it ranks up costs the enemy the most future income.
- Force it to move: packing up takes a few seconds, so even a threat makes it stop earning and leaves it slow to escape.
- Watch for the warning and leave the marked area before impact.
- Dodge the throw or break line of sight before the pull starts; hooks and beams are visible and often loud.

#### Inspiration

- Patterns: `generate-income`, `bombard-area`, `pull-target`
- Source units: `generals.china.hacker`

### Peony Grace

*A small Empire aircraft: An always-on ring around the unit gives a small boost to whoever stands in it, with no key to press.*

Aircraft · T1 · Empire · role: Buffer / aura, Frontline assault (also), Scout / recon (also) · spice 5 · seed `empire-wild-4`

#### Body

- Moves: Jet (Forward only), Fast speed
- Body: Disc, Small; Crewed machine; Open
- Armour: Medium (Self-repair)
- Sensors: Medium sight
- Crew: Solo
- On death: Bail out

#### Weapons

- Main: Cannon, Explosive damage, Projectile, Medium range, Auto-target mount; hits Infantry, Ground vehicles, Low air, Structures; traits: Heals on hit; fired from the Driver / pilot seat

#### Abilities

- **Bamboo Boon** (signature): Passive. An always-on ring around the unit gives a small boost to whoever stands in it, with no key to press.
- **Sacrifice for allies**: Active, Medium cooldown, key R.
- **Launch drones**: Active, Medium cooldown, key Shift.

#### Team play

Protector: Allies gather on the buffer before a push and ask for the boost with a ping; the buffer answers when the call is ready.

#### How it plays

- As the player: You buy a unit with a modest weapon whose real value is the ring around it: teammates inside fire faster, move faster or take less damage. You play a leader with a handful of cheap AI followers (thralls, drones, conscripts). Press Q to release your drones: two to four small fliers (more at the top tier) that spread around you, stay inside a short leash, and attack whatever you hit last, or the nearest enemy in sight if you hit nothing.
- Facing it: You see the ring on the ground and a marker on every buffed enemy, so you know who is boosted and from where.
- For teammates: Two buffers of different kinds, such as speed and armour, add up to a strong push; two of the same kind should not.
- What others see: A team-coloured ring on the ground around the buffer, brighter while a call is active and visible to both teams.
- Controls: LMB Cannon; R Sacrifice for allies; Shift Launch drones

#### Strong against

- Structures (target): Its abilities give it the edge over this kind of unit.
- Deploy a turret (ability): Its abilities give it the edge over this kind of unit.
- Unarmoured (armour): Its weapons deal damage that is strong against this armour.
- Light (armour): Its weapons deal damage that is strong against this armour.

#### Countered by

- Marksman / overwatch (role): Snipers pick the buffer out of the group, and the boost ends with it.
- Raider / flanker (role): Flankers get behind the front line to the buffer standing just inside it.
- Splash (weapon trait): The ring pulls teammates into one clump that area damage hits all at once.
- Anti-infantry (role): Anything built to clear light targets thins the followers and with them the buffs.
- Anti-air (role): This kind of unit has an answer to its abilities.

#### Strengths

- Buffer / aura (role): Teammates near it fire faster, move faster or take less damage, so a group with it beats the same group without it. Paid for by: Rally allies (ability).
- Buffer / aura (role): One spent life gives the whole group around it a strong boost at the moment it matters. Paid for by: Sacrifice for allies (ability).
- Launch drones (ability): Its drones strike around corners and beyond its owner's own reach and soak a few shots, so one player pressures two places at once. Paid for by: Launch drones (ability).

#### Weaknesses

- Rally allies (ability): Its worth lies in others: alone it is a modest fighter, and it has to stand close to the group it lifts, where splash and snipers find it.
- Sacrifice for allies (ability): Every use costs a body: its followers are its ammunition, and with none left it has nothing to give.
- Launch drones (ability): The drones are fragile and leashed, most fall when their owner dies, and once a wave is spent the owner waits out a long cooldown.

#### Balance hints

Cost Medium, power 6 of 10, complexity 5 of 10, 2 keys.

#### Counterplay

- Kill or drive off the buffer first: the boost ends with it, and many buffers (officers, casters, thralls) are fragile. Where the aura rides on a heavy unit, cut it off from the group it lifts or wait out its call.
- Wait out a timed call: back off for its few seconds and come back while it is on cooldown.
- Kill the minions before they are spent: they are cheap and frail, and each one killed is a buff that never happens.

#### Inspiration

- Patterns: `rally-allies`, `sacrifice-for-allies`, `launch-drones`
- Source units: `generals.china.overlord`, `tempest-rising.dynasty.line-officer`, `tempest-rising.veti.vimana`
