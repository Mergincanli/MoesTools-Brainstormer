# Agreement between coders

Coders: coder-a, coder-b, coder-c, speed. Items: 6 (battlefield.shared.attack-helicopter, coh1.us.riflemen, ra3.allied.multigunner-ifv, ra3.soviet.hammer-tank, ra3.soviet.terror-drone, sc2.terran.siege-tank). Threshold: 80%.

**41 of 49 measured fields reach the threshold; 8 fall below it.** Agreement is the mean over every pair of coders on every item (sets score their overlap). "Within one step" counts pairs at most one rank apart, for ranked word lists and counts. Matchup lists are open choices, measured for information only.

| Field | Kind | Items | Agreement | Within one step | Items all agree | Note |
|---|---|---|---|---|---|---|
| class | one | 6 | 100% |  | 6 of 6 |  |
| nature | one | 6 | 100% |  | 6 of 6 |  |
| availability | one | 6 | 100% |  | 6 of 6 |  |
| roles.primary | one | 6 | 100% |  | 6 of 6 |  |
| roles.secondary | set | 6 | 79.6% |  | 4 of 6 | **below** |
| roles (primary or secondary) | set | 6 | 84.4% |  | 4 of 6 |  |
| tier.band | one | 6 | 100% | 100% | 6 of 6 |  |
| cost_band.band | one | 6 | 100% | 100% | 6 of 6 |  |
| mobility.base | one | 6 | 100% |  | 6 of 6 |  |
| mobility.handling | one | 6 | 88.9% |  | 5 of 6 | proposal |
| mobility.traits | set | 6 | 100% |  | 6 of 6 |  |
| mobility.speed | one | 6 | 100% | 100% | 6 of 6 |  |
| body.plan | one | 6 | 100% |  | 6 of 6 |  |
| body.size | one | 6 | 100% | 100% | 6 of 6 |  |
| body.count | count | 6 | 100% | 100% | 6 of 6 |  |
| armour.class | one | 6 | 100% | 100% | 6 of 6 |  |
| armour.models | set | 6 | 100% |  | 6 of 6 |  |
| sensors.sight | one | 6 | 100% | 100% | 6 of 6 | partly proposal |
| sensors.traits | set | 6 | 88.9% |  | 5 of 6 | partly proposal |
| crew.model | one | 6 | 100% |  | 6 of 6 | partly proposal |
| crew.solo_fallback | one | 6 | 100% |  | 6 of 6 | partly proposal |
| crew.seats | set | 6 | 100% |  | 6 of 6 | partly proposal |
| crew.passengers.seats | count | 6 | 100% | 100% | 6 of 6 |  |
| crew.passengers.kind | one | 6 | 100% |  | 6 of 6 |  |
| resources | set | 6 | 100% |  | 6 of 6 |  |
| on_death.outcomes | set | 6 | 72.2% |  | 3 of 6 | **below**, partly proposal |
| flavour_affinity | set | 6 | 100% |  | 6 of 6 | proposal |
| armament (number of weapons) | count | 6 | 61.1% | 94.4% | 3 of 6 | **below** |
| armament.slot | set | 6 | 92.6% |  | 5 of 6 |  |
| armament.family | set | 6 | 84.8% |  | 3 of 6 |  |
| armament.damage | set | 6 | 87% |  | 5 of 6 |  |
| armament.mount | set | 6 | 94.4% |  | 5 of 6 | proposal |
| armament.seat | set | 6 | 66.7% |  | 3 of 6 | **below**, proposal |
| armament.delivery | set | 6 | 93.5% |  | 4 of 6 |  |
| armament.range | set | 6 | 81.5% |  | 3 of 6 |  |
| armament.can_target | set | 6 | 96.3% |  | 4 of 6 |  |
| armament.traits | set | 6 | 88% |  | 3 of 6 |  |
| main weapon.family | one | 6 | 77.8% |  | 4 of 6 | **below** |
| main weapon.damage | one | 6 | 77.8% |  | 4 of 6 | **below** |
| main weapon.delivery | one | 6 | 88.9% |  | 5 of 6 |  |
| main weapon.range | one | 6 | 100% | 100% | 6 of 6 |  |
| main weapon.can_target | set | 6 | 92.2% |  | 3 of 6 |  |
| abilities (number) | count | 6 | 100% | 100% | 6 of 6 |  |
| abilities.kind | set | 6 | 100% |  | 6 of 6 |  |
| abilities.cooldown | set | 6 | 94.4% |  | 5 of 6 |  |
| abilities.source | set | 6 | 63% |  | 2 of 6 | **below** |
| patterns (abilities and weapons) | set | 6 | 90.8% |  | 4 of 6 |  |
| modes (number) | count | 6 | 100% | 100% | 6 of 6 |  |
| atypical rules | set | 6 | 68.5% |  | 3 of 6 | **below** |
| strengths | set | 6 | 52% |  | 0 of 6 | information only |
| weaknesses | set | 6 | 56.1% |  | 0 of 6 | information only |
| counters | set | 6 | 35.9% |  | 0 of 6 | information only |
| countered_by | set | 6 | 71.5% |  | 1 of 6 | information only |
| combos | set | 6 | 34.3% |  | 0 of 6 | information only |

## Where coders disagreed

Every measured field with at least one item the coders did not all code the same way.

### roles.secondary (79.6%, below the threshold)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| ra3.allied.multigunner-ifv | support, raider | raider, scout | anti-infantry, support |  |
| ra3.soviet.terror-drone | scout, disabler | anti-infantry, scout | disabler, scout |  |

### roles (primary or secondary) (84.4%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| ra3.allied.multigunner-ifv | anti-air, raider, support | anti-air, raider, scout | anti-air, anti-infantry, support |  |
| ra3.soviet.terror-drone | anti-armour, disabler, scout | anti-armour, anti-infantry, scout | anti-armour, disabler, scout |  |

### mobility.handling (88.9%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | strafe | strafe | drift |  |

### sensors.traits (88.9%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | radar | radar | (none) |  |

### on_death.outcomes (72.2%, below the threshold)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | respawn | respawn | respawn, bail-out |  |
| ra3.allied.multigunner-ifv | respawn | bail-out | respawn |  |
| ra3.soviet.hammer-tank | respawn | bail-out | respawn |  |

### armament (number of weapons) (61.1%, below the threshold)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | 8 | 6 | 7 |  |
| coh1.us.riflemen | 4 | 3 | 4 |  |
| ra3.soviet.terror-drone | 2 | 3 | 2 |  |

### armament.slot (92.6%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | option, secondary | option, primary, secondary | option, primary |  |

### armament.family (84.8%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| coh1.us.riflemen | adaptive, small-arms | small-arms | adaptive, small-arms |  |
| ra3.allied.multigunner-ifv | chemical, cryo, flak, laser, machine-gun, psionic, repair-tool, rockets, shotgun, small-arms, sniper, sonic, tesla | autocannon, chemical, cryo, flak, guided-missiles, laser, machine-gun, psionic, repair-tool, shotgun, small-arms, sniper, sonic, tesla | chemical, cryo, flak, guided-missiles, laser, machine-gun, psionic, repair-tool, rockets, shotgun, small-arms, sniper, sonic, tesla |  |
| ra3.soviet.terror-drone | blades, emp | blades, magnetic | blades, emp |  |

### armament.damage (87%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| ra3.soviet.terror-drone | emp, melee | explosive, kinetic | emp, explosive |  |

### armament.mount (94.4%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| ra3.allied.multigunner-ifv | body-aim, free-aim | free-aim | body-aim, free-aim |  |

### armament.seat (66.7%, below the threshold)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| coh1.us.riflemen | (none) | (none) | driver |  |
| ra3.soviet.terror-drone | driver | (none) | driver |  |
| sc2.terran.siege-tank | driver | (none) | driver |  |

### armament.delivery (93.5%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| ra3.allied.multigunner-ifv | beam, hitscan, projectile | beam, hitscan, lock-on, projectile | beam, hitscan, lock-on, projectile |  |
| ra3.soviet.terror-drone | attach, beam | attach, beam, melee | attach, beam |  |

### armament.range (81.5%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | long, medium | long, medium, off-screen | long, medium |  |
| ra3.soviet.terror-drone | long, melee | long, melee | medium, melee |  |
| sc2.terran.siege-tank | medium, off-screen | medium, off-screen | long, medium |  |

### armament.can_target (96.3%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | ground-vehicle, high-air, infantry, low-air, structure | ground-vehicle, high-air, infantry, low-air, structure | ground-vehicle, high-air, infantry, low-air, naval, structure |  |
| ra3.allied.multigunner-ifv | ground-vehicle, high-air, infantry, low-air, naval, structure | ground-vehicle, high-air, infantry, low-air, naval, structure | ground-vehicle, high-air, infantry, low-air, structure |  |

### armament.traits (88%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | anti-air, homing, magazine, splash | anti-air, magazine, splash | anti-air, homing, magazine, splash |  |
| coh1.us.riflemen | magazine, suppress | magazine | magazine, suppress |  |
| ra3.allied.multigunner-ifv | anti-air, knockback, magazine, pierce, stun | anti-air, magazine, pierce, splash, stun | anti-air, knockback, magazine, pierce, stun |  |

### main weapon.family (77.8%, below the threshold)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | rockets | rockets | autocannon |  |
| ra3.allied.multigunner-ifv | rockets | guided-missiles | rockets |  |

### main weapon.damage (77.8%, below the threshold)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| ra3.allied.multigunner-ifv | explosive | armour-piercing | explosive |  |
| ra3.soviet.terror-drone | melee | explosive | explosive |  |

### main weapon.delivery (88.9%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| ra3.allied.multigunner-ifv | projectile | lock-on | projectile |  |

### main weapon.can_target (92.2%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | infantry, ground-vehicle, low-air, structure | infantry, ground-vehicle, low-air, structure | infantry, ground-vehicle, low-air, structure, naval |  |
| ra3.allied.multigunner-ifv | infantry, ground-vehicle, low-air, high-air, structure, naval | infantry, ground-vehicle, low-air, high-air, structure, naval | infantry, ground-vehicle, low-air, high-air, structure |  |
| ra3.soviet.terror-drone | infantry, ground-vehicle, naval | ground-vehicle, naval | infantry, ground-vehicle, naval |  |

### abilities.cooldown (94.4%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | short | short | medium, short |  |

### abilities.source (63%, below the threshold)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| coh1.us.riflemen | commander-power, innate, upgrade | commander-power, upgrade | commander-power, upgrade |  |
| ra3.allied.multigunner-ifv | innate | (none) | innate |  |
| ra3.soviet.hammer-tank | innate | (none) | innate |  |
| ra3.soviet.terror-drone | innate | (none) | innate |  |

### patterns (abilities and weapons) (90.8%)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| coh1.us.riflemen | build-cover, earn-veterancy, host-spawn-point, lay-mines, recover-wreck, reinforce-squad, suppress-with-fire, throw-explosive | brace, build-cover, dash, earn-veterancy, host-spawn-point, lay-mines, reinforce-squad, suppress-with-fire, throw-explosive, upgrade-in-field | brace, build-cover, capture-structure, dash, earn-veterancy, host-spawn-point, lay-mines, leech-weapon-on-kill, reinforce-squad, suppress-with-fire, throw-explosive, upgrade-in-field |  |
| ra3.soviet.hammer-tank | leech-weapon-on-kill, switch-weapon-mode | leech-weapon-on-kill, switch-weapon-mode | drain-health, leech-weapon-on-kill, switch-weapon-mode |  |

### atypical rules (68.5%, below the threshold)

| Item | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|
| battlefield.shared.attack-helicopter | weapon-families:guided-missiles allowed.weapon-delivery projectile | (none) | weapon-families:guided-missiles allowed.weapon-delivery projectile |  |
| ra3.allied.multigunner-ifv | weapon-traits:stun min_tier t2 | weapon-families:laser allowed.damage-types kinetic, weapon-traits:stun min_tier t2 | weapon-families:laser allowed.damage-types kinetic, weapon-traits:stun min_tier t2 |  |
| ra3.soviet.terror-drone | (none) | weapon-families:blades allowed.damage-types explosive, weapon-families:blades allowed.damage-types kinetic, weapon-families:magnetic classes drone | weapon-families:blades allowed.damage-types explosive |  |

## Compared with the reference

How often a coder matched the reference coding, per field (sets score their overlap).

| Field | Comparisons | Agreement |
|---|---|---|
| class | 9 | 100% |
| nature | 9 | 100% |
| availability | 9 | 100% |
| roles.primary | 9 | 66.7% |
| roles.secondary | 9 | 74.1% |
| roles (primary or secondary) | 9 | 65.6% |
| tier.band | 9 | 100% |
| cost_band.band | 9 | 100% |
| mobility.base | 9 | 100% |
| mobility.handling | 9 | 100% |
| mobility.traits | 9 | 100% |
| mobility.speed | 9 | 100% |
| body.plan | 9 | 100% |
| body.size | 9 | 66.7% |
| body.count | 9 | 100% |
| armour.class | 9 | 100% |
| armour.models | 9 | 100% |
| sensors.sight | 9 | 100% |
| sensors.traits | 9 | 66.7% |
| crew.model | 9 | 66.7% |
| crew.solo_fallback | 9 | 66.7% |
| crew.seats | 9 | 100% |
| crew.passengers.seats | 9 | 100% |
| crew.passengers.kind | 9 | 100% |
| resources | 9 | 100% |
| on_death.outcomes | 9 | 55.6% |
| flavour_affinity | 9 | 100% |
| armament (number of weapons) | 9 | 55.6% |
| armament.slot | 9 | 100% |
| armament.family | 9 | 89.6% |
| armament.damage | 9 | 81.5% |
| armament.mount | 9 | 61.1% |
| armament.seat | 9 | 27.8% |
| armament.delivery | 9 | 90.7% |
| armament.range | 9 | 92.6% |
| armament.can_target | 9 | 98.1% |
| armament.traits | 9 | 96.3% |
| main weapon.family | 9 | 88.9% |
| main weapon.damage | 9 | 66.7% |
| main weapon.delivery | 9 | 88.9% |
| main weapon.range | 9 | 100% |
| main weapon.can_target | 9 | 78.3% |
| abilities (number) | 9 | 66.7% |
| abilities.kind | 9 | 83.3% |
| abilities.cooldown | 9 | 100% |
| abilities.source | 9 | 66.7% |
| patterns (abilities and weapons) | 9 | 79.6% |
| modes (number) | 9 | 100% |
| atypical rules | 9 | 63% |
| strengths | 9 | 48.1% |
| weaknesses | 9 | 36.5% |
| counters | 9 | 55.6% |
| countered_by | 9 | 54.8% |
| combos | 9 | 26.1% |

### Where most coders differ from the reference

Either the reference or a rule needs a look.

| Field | Item | Reference | coder-a | coder-b | coder-c | speed |
|---|---|---|---|---|---|---|
| roles.primary | ra3.soviet.terror-drone | infiltrator | anti-armour | anti-armour | anti-armour |  |
| roles.secondary | ra3.allied.multigunner-ifv | support, anti-infantry | support, raider | raider, scout | anti-infantry, support |  |
| roles (primary or secondary) | ra3.allied.multigunner-ifv | anti-air, anti-infantry, support | anti-air, raider, support | anti-air, raider, scout | anti-air, anti-infantry, support |  |
| roles (primary or secondary) | ra3.soviet.terror-drone | disabler, infiltrator, scout | anti-armour, disabler, scout | anti-armour, anti-infantry, scout | anti-armour, disabler, scout |  |
| body.size | ra3.soviet.terror-drone | tiny | small | small | small |  |
| sensors.traits | ra3.allied.multigunner-ifv | radar | (none) | (none) | (none) |  |
| crew.model | ra3.soviet.hammer-tank | solo | driver-gunner | driver-gunner | driver-gunner |  |
| crew.solo_fallback | ra3.soviet.hammer-tank | - | full-control | full-control | full-control |  |
| on_death.outcomes | ra3.allied.multigunner-ifv | bail-out | respawn | bail-out | respawn |  |
| on_death.outcomes | ra3.soviet.hammer-tank | bail-out | respawn | bail-out | respawn |  |
| armament (number of weapons) | ra3.allied.multigunner-ifv | 19 | 18 | 18 | 18 |  |
| armament.family | ra3.allied.multigunner-ifv | chemical, cryo, flak, laser, machine-gun, psionic, repair-tool, rockets, shotgun, small-arms, sniper, sonic, tesla | chemical, cryo, flak, laser, machine-gun, psionic, repair-tool, rockets, shotgun, small-arms, sniper, sonic, tesla | autocannon, chemical, cryo, flak, guided-missiles, laser, machine-gun, psionic, repair-tool, shotgun, small-arms, sniper, sonic, tesla | chemical, cryo, flak, guided-missiles, laser, machine-gun, psionic, repair-tool, rockets, shotgun, small-arms, sniper, sonic, tesla |  |
| armament.damage | ra3.soviet.terror-drone | emp, melee | emp, melee | explosive, kinetic | emp, explosive |  |
| armament.mount | ra3.soviet.hammer-tank | free-aim | slow-turret | slow-turret | slow-turret |  |
| armament.seat | ra3.allied.multigunner-ifv | passenger-module | driver, passenger-module | driver, passenger-module | driver, passenger-module |  |
| armament.seat | ra3.soviet.hammer-tank | (none) | driver, gunner | driver, gunner | driver, gunner |  |
| armament.seat | ra3.soviet.terror-drone | (none) | driver | (none) | driver |  |
| armament.delivery | ra3.allied.multigunner-ifv | beam, hitscan, projectile | beam, hitscan, projectile | beam, hitscan, lock-on, projectile | beam, hitscan, lock-on, projectile |  |
| main weapon.damage | ra3.soviet.terror-drone | melee | melee | explosive | explosive |  |
| main weapon.can_target | ra3.allied.multigunner-ifv | low-air, high-air, ground-vehicle, infantry | infantry, ground-vehicle, low-air, high-air, structure, naval | infantry, ground-vehicle, low-air, high-air, structure, naval | infantry, ground-vehicle, low-air, high-air, structure |  |
| main weapon.can_target | ra3.soviet.hammer-tank | infantry, ground-vehicle, structure | infantry, ground-vehicle, structure, naval | infantry, ground-vehicle, structure, naval | infantry, ground-vehicle, structure, naval |  |
| abilities (number) | ra3.soviet.terror-drone | 2 | 1 | 1 | 1 |  |
| abilities.kind | ra3.soviet.terror-drone | toggle, triggered | toggle | toggle | toggle |  |
| patterns (abilities and weapons) | ra3.allied.multigunner-ifv | passenger-sets-weapon | carry-passengers, passenger-sets-weapon | carry-passengers, passenger-sets-weapon | carry-passengers, passenger-sets-weapon |  |
| atypical rules | ra3.allied.multigunner-ifv | weapon-families:laser allowed.damage-types kinetic, weapon-families:psionic allowed.target-types structure, weapon-traits:stun min_tier t2 | weapon-traits:stun min_tier t2 | weapon-families:laser allowed.damage-types kinetic, weapon-traits:stun min_tier t2 | weapon-families:laser allowed.damage-types kinetic, weapon-traits:stun min_tier t2 |  |
| atypical rules | ra3.soviet.terror-drone | (none) | (none) | weapon-families:blades allowed.damage-types explosive, weapon-families:blades allowed.damage-types kinetic, weapon-families:magnetic classes drone | weapon-families:blades allowed.damage-types explosive |  |
