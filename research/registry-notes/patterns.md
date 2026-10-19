> **Working notes from step 1** (growing the pattern registry). Example units are from memory and only point research at where to look; none is sourced yet. `data/pattern-registry.json` is the reference. These notes are context. Where they disagree with a pattern's summary in data/, the summary wins.
>
> **Corrections from the review, which win over the text below:**
> - Patterns that mirror a word-list term (mark-target, suppress-with-fire, leave-hazard-zone, drain-health, launch-drones, reveal-area, heal-self) cover only the version on a key; a weapon or an always-on effect uses the term. So the weapon-effect examples given for suppress-with-fire (machine-gun teams) belong to the weapon trait `suppress`, and the Carrier-style examples for launch-drones belong to the weapon family `drone-launcher`; look for ability examples instead (for launch-drones: StarCraft II Swarm Host, Generals USA vehicle drones bought as add-ons).
> - lock-in-stasis: the Chrono Legionnaire is a Red Alert 2 / Yuri's Revenge unit, not Red Alert 3; Red Alert 3's Chrono Rift is an area support power.
> - Capturing a control point is a game-mode rule, not a pattern; capture-structure is taking over or sabotaging a building.
> - A remote-piloted drone is the crew model `remote`, not launch-drones. Firing from inside a vehicle (ports or an open top) goes to passenger-sets-weapon's fire-ports variant, with the seat role `passenger-firing`; carry-passengers is for riders who cannot act until they get out.
> - invulnerability-window was renamed become-invulnerable; the tunnel network has its own id, build-linked-exits; new ids fire-countermeasures and confuse-enemies were added.

# Pattern registry additions (step 1)

26 new pattern ids, taking the registry from 26 to 52. Names below are reference only, to point research agents at where each mechanic shows up; they are not sourced claims yet. Entries marked "(to check)" are from memory and need a source before use. Each entry ends with the line that separates it from the closest existing pattern.

## New ids, with example units

### Conversion

- **recover-wreck** (Recover a wreck). Tiberium Wars / Kane's Wrath engineer reviving a walker husk; Company of Heroes 2 abandoned vehicles recrewed by any infantry squad. *Boundary:* hijack-vehicle takes a living, crewed vehicle; leech-weapon-on-kill takes a part, not the whole vehicle; the on-death term `wreck` describes what the dead unit leaves, this pattern is the unit that brings it back.

### Infiltration

- **capture-structure** (Capture or sabotage a structure). Red Alert 1 / Tiberian Dawn Engineer (captures buildings); Red Alert 2 Spy (sabotage variant: cuts power, steals money or tech); Generals China Black Lotus (captures from range). *Boundary:* hijack-vehicle is for vehicles; this is for buildings, emplacements and capture points.

### Transport and garrison

- **host-spawn-point** (Host a spawn point). PlanetSide 2 Sunderer (deployed spawn mode); Battlefield squad spawn on vehicles and the recon spawn beacon; StarCraft II Warp Prism (phasing mode, units warp in beside it). *Boundary:* carry-passengers moves living teammates; this brings dead ones back at you.

### Mode change

- **overclock-self** (Overclock yourself). StarCraft II Marine and Marauder (Stimpack, costs health); MechWarrior Online MASC (speed burst that can damage the legs). *Boundary:* dash is a free speed burst and brace trades speed for armour; this trades health or heat for offence and speed. It is the generic "stat buff" pattern, so it stays out of the top-30.

### Summon

- **launch-drones** (Launch drones). StarCraft II Carrier (interceptors); Red Alert 2 Aircraft Carrier (hornet drones); Generals USA vehicle drones (battle drone, scout drone). *Boundary:* deploy-turret is fixed in place; drones move and fight around their owner and are lost or recalled.
- **reinforce-squad** (Reinforce a squad). Company of Heroes infantry squads (reinforce near base or forward points); Dawn of War squads (reinforce in the field); Dawn of War II squads (reinforce at points). *Boundary:* the action for the `squad` crew model; repair-allies restores health, this restores bodies.

### Stealth and deception

- **lay-smoke** (Lay smoke). Company of Heroes mortar teams (smoke rounds); Battlefield 4 main battle tanks (smoke countermeasure); Arc Raiders smoke grenade. *Boundary:* cloak hides one unit; smoke hides an area from everyone, both sides.
- **spawn-decoy** (Spawn a decoy). StarCraft II Sentry (Hallucination); Tiberium Wars Nod Decoy Army support power; Generals GLA fake buildings. *Boundary:* disguise makes you look like something else; a decoy is a separate fake that draws fire while you stay real.
- **jam-sensors** (Jam sensors). MechWarrior Online Guardian ECM; Battlefield 4 jet and helicopter ECM jammer; Supreme Commander radar jammers that show false contacts (to check which units). *Boundary:* cloak hides you from eyes; jamming leaves you visible but blinds radar, minimaps and lock-ons. Pairs with the sensors field from decision 6C.

### Control

- **pull-target** (Pull a target). Red Alert 3 Apocalypse Tank (magnetic harpoon); Red Alert 2 Yuri's Revenge Magnetron (lifts and drags vehicles); StarCraft II Viper (Abduct). *Boundary:* mind-control takes the target's actions; this only moves the target. The weapon trait `knockback` pushes away; this pulls in or lifts.
- **suppress-with-fire** (Suppress with fire). Company of Heroes heavy machine gun teams; Wargame (suppression and morale on every unit); Battlefield 3 suppression effect. *Boundary:* the ability or signature version of the weapon trait `suppress`, kept as a pattern because whole game systems (pinned infantry, morale) hang on it.
- **lock-in-stasis** (Lock in stasis). Red Alert 2 Chrono Legionnaire; Red Alert 3 Chrono Legionnaire; StarCraft II Oracle (Stasis Ward). *Boundary:* freeze-and-shatter sets up bonus damage; stasis does the opposite and also protects the target. invulnerability-window protects your own side by choice.

### Defence

- **heal-self** (Heal yourself). PlanetSide 2 vehicles (nanite auto-repair slot); Company of Heroes 2 vehicle crew repairs (to check); Arc Raiders bandages and shield rechargers. *Boundary:* repair-allies heals others; the armour model `self-repair` is passive; the weapon trait `self-heal` heals by dealing damage. This is the generic active self-heal, outside the top-30.

### Support

- **reveal-area** (Reveal an area). StarCraft II Observer and scanner sweep; Tiberian Sun GDI Mobile Sensor Array; Battlefield 4 recon motion sensor and MAV. *Boundary:* mark-target tags one enemy for extra damage; this uncovers everything hidden in an area. The passive version is the sensors field from decision 6C.
- **resupply-allies** (Resupply allies). Battlefield 4 Support ammo box; PlanetSide 2 Engineer ammo pack; Wargame supply trucks and helicopters. *Boundary:* repair-allies restores health; this restores ammo, energy and charges.
- **rally-allies** (Rally allies). Generals China Overlord (propaganda tower add-on); Company of Heroes US Lieutenant and Captain officer auras (to check). *Boundary:* mark-target weakens an enemy; this strengthens allies.
- **gather-resources** (Gather resources). Red Alert 2 Chrono Miner and War Miner; Supreme Commander engineers (reclaiming wrecks); Foxhole infantry harvesting salvage. *Boundary:* leech-weapon-on-kill turns a kill into your own power; this turns map resources into team money (the `logistics` role).

### Area

- **lay-mines** (Lay mines). Red Alert 1 Minelayer (Allies and Soviets); Company of Heroes 2 Soviet Combat Engineers; Battlefield 4 Engineer anti-tank mines. *Boundary:* deploy-turret is visible and fires on its own; a mine is hidden, waits for contact and is cleared by detection or sweeping.
- **leave-hazard-zone** (Leave a hazard zone). Red Alert 2 Desolator (deployed radiation); Generals GLA Toxin Tractor; StarCraft II High Templar (Psionic Storm). *Boundary:* the ability version of the weapon trait `zone`.
- **build-cover** (Build cover). Company of Heroes Engineers and Pioneers (sandbags, wire, tank traps); Foxhole infantry building sandbags and trenches; StarCraft II Sentry (Force Field, an energy-wall variant). *Boundary:* raise-shield is a timed shield that soaks damage; cover is a lasting obstacle until destroyed.
- **bombard-area** (Bombard an area). Renegade Ion Cannon and Nuclear Strike beacons; Company of Heroes 2 mortar team barrage; World in Conflict tactical aid (artillery and air strikes). *Boundary:* mark-target tags a unit; this marks ground and hits it after a warning.

### Mobility

- **drop-in-from-above** (Drop in from above). PlanetSide 2 drop pods; Halo Wars 2 ODST drop; World in Conflict airdropped reinforcements. *Boundary:* teleport moves you within the fight; this is how you enter it. host-spawn-point is a place teammates provide; this is a spot you choose.

### Progression

- **earn-veterancy** (Earn veterancy). Red Alert 2 veteran and elite ranks; Company of Heroes veterancy; Wargame experience ranks. *Boundary:* the generic progression pattern; leech-weapon-on-kill gains a specific weapon from a specific kill.
- **upgrade-in-field** (Upgrade in the field). Supreme Commander commander enhancements; Generals China Overlord add-ons; Company of Heroes squad weapon upgrades. *Boundary:* bought mid-life rather than taken from a kill.

### Weapon behaviour

- **throw-explosive** (Throw an explosive). Company of Heroes grenades and satchel charges; Renegade timed and remote C4; Battlefield grenades and C4. *Boundary:* the ability home for thrown or planted explosives (family `explosives`, delivery `place`); self-destruct uses your own body.
- **fire-power-shot** (Fire a power shot). StarCraft II Battlecruiser (Yamato Cannon); Supreme Commander commander Overcharge; Planetary Annihilation commander Uber Cannon. *Boundary:* the weapon trait `charge-up` is a weapon you hold to charge; this is a separate heavy shot on a cooldown. switch-weapon-mode is a lasting toggle.

## Candidates rejected as duplicates or variants

Folded into an existing id:

| Candidate | Seen in | Folds into |
|---|---|---|
| Garrison a building | Red Alert 2, Company of Heroes | carry-passengers |
| Airlift a vehicle or squad | StarCraft II Medivac, Generals Chinook | carry-passengers |
| Tow a gun or vehicle | Company of Heroes 2, Foxhole | carry-passengers (cargo variant) |
| Fire from inside (firing ports, open top) | Red Alert 2 Battle Fortress, Company of Heroes half-tracks | passenger-sets-weapon (fire-ports variant), with seat role `passenger-firing` |
| Tunnel network | Generals GLA tunnels, StarCraft II Nydus | teleport (network variant) |
| Grapple hook or zipline | Battlefield 2042 | leap |
| Jump jets, jump packs | MechWarrior, Dawn of War Assault Marines | leap (or the `jetpack` mobility) |
| Charge or ram into enemies | StarCraft II Zealot Charge, Red Alert 3 King Oni | dash, with delivery `ram` |
| Sprint | Company of Heroes 2 Conscripts | dash |
| Project a shade, then blink to it | StarCraft II Adept | teleport |
| Camouflage while still, stealth when idle | Company of Heroes, Generals GLA | cloak |
| Stealth field over allies | Supreme Commander, StarCraft II Mothership | cloak (area variant) |
| Snipe a vehicle's crew | Generals Jarmen Kell | hijack-vehicle |
| Psychic control | Red Alert 2 Yuri | mind-control |
| Special ammo, ammo types | Company of Heroes, Battlefield tank shells | switch-weapon-mode |
| Projected barrier or dome | PlanetSide 2 MAX, Supreme Commander shield generators | raise-shield |
| Hit the dirt, hull down, dig in | Company of Heroes 2 | brace (short) or deploy-siege-mode (anchored) |
| Temporary invulnerability on allies | Red Alert Iron Curtain | invulnerability-window |
| Revive a downed teammate | Battlefield medic, PlanetSide 2 Combat Medic, Arc Raiders | repair-allies, with armour model `downed-revive` |
| Heal or repair aura | StarCraft II Medivac, Dawn of War II Apothecary | repair-allies |
| Laser designator for lock-ons | Battlefield SOFLAM | mark-target |
| EMP blast over an area | Generals, Tiberian Sun | disable-machine |
| Salvage crates that upgrade the collector | Generals GLA | leech-weapon-on-kill |
| Kamikaze or ram that destroys itself | Generals GLA bomb truck, Red Alert 2 Demolition Truck | self-destruct, with delivery `ram` |
| Point defence, active protection | Generals Paladin | armour model `interceptor` (not a pattern) |
| Knockback wave | sonic weapons | weapon trait `knockback` (not a pattern) |
| Stun, root or slow a target | StarCraft II Fungal Growth, Red Alert 3 IFV stun bark | weapon traits `stun`, `root`, `slow`; the machine-only version is disable-machine, the cryo version freeze-and-shatter |
| Kill streak or charged ultimate | many | resource `kill-charge` and ability kind `ultimate` (not a pattern) |

Folded into one of the new ids:

| Candidate | Seen in | Folds into |
|---|---|---|
| Plant a timed charge | Red Alert Tanya, Renegade C4 | throw-explosive (planted variant), on a vehicle too; infest-vehicle only when the attacker itself latches on |
| Pilot a remote drone | Battlefield 4 MAV and EOD bot | launch-drones (piloted variant), with crew model `remote` |
| Morph into a higher form | StarCraft II morphs | upgrade-in-field |
| Motion sensor, sensor tower | Battlefield T-UGS, PlanetSide 2 motion spotter | reveal-area (placed variant) |
| Long-range spotting, forward observer | World in Conflict, Wargame recon | reveal-area (or mark-target for single targets) |
| Flares and countermeasures | Battlefield, PlanetSide 2 aircraft | jam-sensors (break-lock variant) |
| False radar contacts | Supreme Commander | jam-sensors |
| Indirect fire that needs a spotter | Foxhole, World in Conflict artillery | weapon delivery `lobbed`, family `artillery` and team-play hook `spotter`; one-off barrages are bombard-area |
| Superweapon beacon | Renegade | bombard-area |
| Steal money or tech | Red Alert 2 Spy, Generals Black Lotus | capture-structure (sabotage variant) |
| Capture a control point | Company of Heroes, Battlefield conquest | no pattern: a game-mode rule; list it under Game-wide mechanics |
| Reclaim wrecks for resources | Supreme Commander, Planetary Annihilation | gather-resources |
| Stronger in a group (horde bonus) | Generals China | rally-allies (passive variant), team-play hook `swarm` |
| Slowing field | StarCraft II Time Warp | leave-hazard-zone |
| Blinding cloud | StarCraft II Viper | lay-smoke |
| Lift a unit | StarCraft II Graviton Beam, Red Alert 3 Uprising Yuriko | pull-target (lift variant) |
| Morale break, fear | Dawn of War | suppress-with-fire |
| Force field that blocks movement | StarCraft II Sentry | build-cover (energy-wall variant) |

Not added for now (no duplicate, but thin evidence in the starting scope): merge two units into one (StarCraft II Archon), spread ground that favours your side (StarCraft II creep), shrink a target (Red Alert 3, to check). Research agents can propose them if they find more examples.
