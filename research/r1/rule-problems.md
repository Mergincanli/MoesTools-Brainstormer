# Batch R1: rule problems

Every place where the R1 agents found a written rule unclear, two rules in conflict, or a rule whose result looks wrong for a unit. The list merges 17 reports: the four opening-check coder reports (Mammoth Tank and Siege Chopper, coders A and B), the two reconciler reports (RA1 and RA2) and the eleven fill jobs (j01 to j11). The same rule raised by several reports is one entry. Each was checked against the rules as they stand after the batch's later commits.

Unit examples are as coded when the problem was raised. Since then the RA1 reference rules copy became a source for every rules value (b46b01c), which changed a few of them: the Mammoth Tank's cannons now list structures, its missiles are guided missiles, and the Field Mechanic is unarmoured.

- **Open, for Mustafa: 60.** The fix changes the word lists, the field rules or the validator's checks.
- **Open, for the batch: 20.** Only the registry notes, the games registry or the pattern registry would change (or, for one, the unit data).
- **Settled during the batch: 8.**

Each list runs from the problem that touches the most batch units to the fewest. Units are the batch units the problem touches, by id; the four problems already named to Mustafa say so in their titles.

## Open, for Mustafa

**1. No link kinds for price, availability or immunity**
- *Rule:* Typed links name parts of a unit (class, role, tier and so on). None names a price band, a cap on numbers or an immunity. The R1 notes ask immune units to "say so in strengths" but name no link.
- *Problem:* Reasons about being cheap, costly, one per player or immune hang on a stand-in that says something else: tier:t1 for cheap, tier:t3 for costly or one per player, class:infantry for a hero who cannot be crushed or mind-controlled, or for a soldier immune to radiation. Units: `ra1.soviet.attack-dog`, `ra1.allied.field-mechanic`, `ra2.allied.chrono-legionnaire`, `ra2.iraq.desolator`, `ra2.soviet.boris`, `ra2.yuri.mastermind`, `ra3.empire.sudden-transport`, `ra3.soviet.sickle`, `ra3.soviet.kirov-airship`, `ra3.allied.tanya`.
- *Fix:* Add link kinds for the price band, for availability and for an immunity to a damage type or effect (for example cost:high, availability:unique, immune:mind-control), and let strengths, weaknesses and the other matchup lists use them.
- *Raised by* 8 reports (j01, j02, j05, j06, j07, j09, j10, j11).

**2. Weapon labels: when can_target step 3 applies, and whether it lists structures**
- *Rule:* can_target step 3 (commanded games) lists only what a weapon's label names, and structures only "when the sources say the weapon damages buildings"; yet a source that says ground or surface means structures too. roles.secondary counts it when "a source calls it an anti-tank or anti-aircraft weapon".
- *Problem:* The rules do not say what a label is: a guide's weapon heading, a wiki's 'anti-tank gun', a target line such as Target: Ground or Target: Naval, a button text that names targets, or a label on another unit's copy of the same gun. Nor do they say whether 'cannot attack aircraft' means it hits only some kinds, or which structures sentence wins after a ground line. Coders read it differently, so similar guns differ: the Mammoth's and the Robot Tank's cannons list no structures, while the Yak's guns and the Mecha Tengu's guns list them from passing remarks about attacking buildings. Units: `ra1.soviet.mammoth-tank`, `ra1.soviet.yak`, `ra1.soviet.submarine`, `ra2.allied.robot-tank`, `ra3.empire.mecha-tengu`, `ra3.soviet.sickle`, `ra3.allied.tanya`.
- *Fix:* Define a label once, for both rules: words in any cited source, guides included, that name the weapon by its job or by its targets (anti-armour cannons, an AA gun, a Target line). Words about what it is good at are not a label, and neither is a label on the unit or on another unit's copy of the gun. A statement of what it cannot hit only removes that kind, and step 4 fills the rest. A weapon's own target or attack line that says ground or surface counts as saying it damages buildings, even under step 3; a bare label with no such line lists structures only when a source says it hurts buildings (the RA1 reconciler's proposal).
- *Raised by* 8 reports (Mammoth coder A, Mammoth coder B, RA1 reconciler, j04, j05, j09, j10, j11).

**3. Matchups: stated by a source, or reasoned from it?**
- *Rule:* Matchups say to "write the reason first" and link the part behind it. They do not say whether a combo or a counter must be stated by a source.
- *Problem:* Coders split. Some reasoned entries from sourced weaknesses: escorts and air cover for the Mammoth, an anti-infantry escort for the M.A.D. Tank and the Magnetron, artillery against the Gap Generator, heavy tanks as the M.A.D. Tank's victims. Others left combos empty when no page names a pairing (the other Mammoth coder, the Spy, the Attack Dog). The reconciled Mammoth keeps the reasoned combos. Units: `ra1.soviet.mammoth-tank`, `ra1.soviet.mad-tank`, `ra1.allied.mobile-gap-generator`, `ra2.yuri.magnetron`, `ra1.allied.spy`, `ra1.soviet.attack-dog`.
- *Fix:* Allow an entry reasoned from sourced facts only when its reason names those facts, with an uncertain entry at its path; otherwise leave the list empty (combos) or keep only sourced entries. *Alternative:* Only entries a source states; reasoned ones are dropped.
- *Raised by* 5 reports (Mammoth coder A, Mammoth coder B, j01, j03, j08).

**4. Sizes for units that no example covers**
- *Rule:* Sizes: "Examples win over measurements". Only a unit that no example covers is measured, against the soldier or the main battle tank. No example names a truck, a minelayer, a submarine or a mobile refinery, and wiki pages rarely give a footprint.
- *Problem:* Coders measured with whatever they found: the code's sprite-size flag (Gap Generator), the APC the Minelayers are built on, a guess of about one tank (Submarine), transport slots that hint at huge against the self-propelled-gun example (Magnetron), a remark that the unit is too big for a bunker (Slave Miner). No rule says which game data may stand in for a footprint. Units: `ra1.allied.mobile-gap-generator`, `ra1.allied.minelayer`, `ra1.soviet.minelayer`, `ra1.soviet.submarine`, `ra2.yuri.magnetron`, `ra2.yuri.slave-miner`.
- *Fix:* Keep examples first. When no example fits and no footprint is given, name the stand-ins a coder may use (the game's own size data, such as a size flag or transport slots), and add examples for trucks, submarines and mobile refineries.
- *Raised by* 4 reports (j02, j03, j04, j08).

**5. The role fallback gives assault to units no role step reaches**
- *Rule:* roles.primary step 5: "Raider if the unit is fast or very fast with light or no armour. Otherwise assault." Assault is the frontline brawler.
- *Problem:* Units whose job no earlier step can reach fall to a role that fits badly: a self-destruct tank, an unarmed shroud truck (now raider, since its speed was re-banded), a hidden ship hunter (ships are no anti role's target), a beam artillery vehicle and an armed miner. Their fit_notes ask for anti-armour or siege, support, an anti-ship role, siege and logistics. Units: `ra1.soviet.mad-tank`, `ra1.allied.mobile-gap-generator`, `ra1.soviet.submarine`, `ra2.yuri.magnetron`, `ra2.yuri.slave-miner`.
- *Fix:* Use step 5 only for armed fighters. When no step gives a role whose description fits, take the closest role whose requires the unit meets and add a fit_note. The specific causes have their own entries below (beam artillery, armed workers, damage from abilities). *Alternative:* Add the missing jobs to the word list instead: ships as an anti-armour target, and a concealment job (the Gap Generator's report offered both).
- *Raised by* 3 reports (j03, j04, j08).

**6. Aim tie-break: what counts as the source saying how a weapon is mounted**
- *Rule:* Aim / mount tie-break, last line: "The family's default mount only fills in when the source says nothing about how the weapon is mounted."
- *Problem:* It does not say whether game code that places a weapon on the turret counts (the Mammoth's missiles), whether design trivia about the real helicopter a model copies counts (the Siege Chopper's side gun), whether a side mount with no word on how far it turns is limited-arc (step 3) or fixed (step 6), or whether a hull-turret body plan alone brings step 5 (slow-turret) before the family default (the Mastermind's dome, the Slave Miner's gun). Coders chose differently on each. Units: `ra1.soviet.mammoth-tank`, `ra2.soviet.siege-chopper`, `ra2.yuri.mastermind`, `ra2.yuri.slave-miner`.
- *Fix:* Say that game code or data that places a weapon counts as the source; design-inspiration trivia does not; a side or front mount with no word on its turn is limited-arc; and a main weapon on a body plan with a turret takes step 5 before the family default. The mount stays a proposal field.
- *Raised by* 6 reports (Mammoth coder A, Mammoth coder B, Siege Chopper coder A, Siege Chopper coder B, j07, j08).

**7. Flavour affinity adds a second flavour through movement and body alone**
- *Rule:* flavour_affinity step 3 adds the top other flavour "if it scores 2 or more and at least as much as each flavour from step 1". The mobility and the body plan score a point each.
- *Problem:* Generic parts give second flavours that read wrong: a Soviet plane and a Soviet helicopter get Allied through jet, fixed-wing, hovering flight and rotorcraft; a Yuri drone gets Allied through wheels taken from images. An Allied hover tank also gets Soviet, through its role and gun. Units: `ra1.soviet.yak`, `ra2.soviet.siege-chopper`, `ra2.yuri.chaos-drone`, `ra2.allied.robot-tank`.
- *Fix:* Count the mobility and the body plan only to break ties, not toward the two points, so a second flavour needs a match on the primary role or a weapon family. The Robot Tank's Soviet flavour (role and gun) would stay, which may be intended.
- *Raised by* 4 reports (Siege Chopper coder B, j04, j05, j07).

**8. Per-life cooldown overlaps two no-band cases**
- *Rule:* Cooldown bands: an ability "that comes back only at a resupply point or on respawn is per-life"; instant orders and an ability "held back only by a stock" have no band.
- *Problem:* An infiltration or a self-destruct that uses up the unit fits both per-life and an instant order. Five mines that refill only at a depot fit both per-life and a stock, and the resources rule (limited-ammo) covers the same stock. All three coders chose per-life by judgement. Units: `ra1.allied.spy`, `ra1.soviet.mad-tank`, `ra1.allied.minelayer`, `ra1.soviet.minelayer`.
- *Fix:* Say that per-life covers any ability whose uses come back only at a resupply point or on respawn, however many the stock holds, and any action that uses up the unit. Keep 'no band' for instant orders that can be repeated and for stocks that refill by themselves or from income.
- *Raised by* 3 reports (j01, j02, j03).

**9. Text figures: effect durations and zero values**
- *Rule:* Bands with numbers: text fields give "prices, speeds, reaches, sight, cooldowns, damage and armour values" only as comparisons in words.
- *Problem:* The list leaves out how long an effect lasts (a berserk gas, a rewind window, a shrink), so coders could not tell whether a duration in seconds may stand. A sight of zero has nothing to compare with. Coders wrote words to be safe. Units: `ra2.yuri.chaos-drone`, `ra3.allied.tanya`, `ra3.allied.cryocopter`, `ra1.soviet.yak`.
- *Fix:* Add effect durations to the list (written in words, like cooldowns), and say a zero is written as none (it sees nothing in flight).
- *Raised by* 3 reports (j04, j07, j11).

**10. Anti-armour's requires shut out units the sources call tank killers**
- *Rule:* anti-armour needs armour-piercing, energy, electric or EMP damage, or the infest-vehicle pattern.
- *Problem:* Units that remove vehicles by other means can never be anti-armour: the Mastermind takes tanks over (psionic damage, though its official Application line names anti-vehicle), the Magnetron lifts and drops them (kinetic, pull-target), and the Kirov's bombs map to explosive, though its official profile calls them armour-piercing and says one airship can wreck a tank force. Each has a fit_note asking for anti-armour. Units: `ra2.yuri.mastermind`, `ra2.yuri.magnetron`, `ra3.soviet.kirov-airship`.
- *Fix:* Let official text that says the unit is strong against vehicles also meet anti-armour's requires.
- *Raised by* 3 reports (j07, j08, j10).

**11. Weapons that freeze, lift or erase their target**
- *Rule:* Root and silence each leave the target one action; only the EMP tie-break pairs them "when they can do neither". Damage step 2 and can_target step 1 treat a weapon that "does no damage" apart.
- *Problem:* Three weapons that stop a target from acting (a stasis beam, a magnetic lift, a cryo freeze) borrowed the EMP pairing by analogy, while the pilot sample's Cryo Legionnaire beam has no such traits, so two cryo weapons are coded differently. It is also open whether a beam that erases its target without lowering its health does no damage; that decides damage step 2 and can_target step 1 for it. Units: `ra2.allied.chrono-legionnaire`, `ra2.yuri.magnetron`, `ra3.allied.cryocopter`.
- *Fix:* Let any weapon whose sources say the target can neither move nor fire take root and silence, not only EMP. Say the cryo family and damage do not imply those traits, so a cryo weapon codes what it stops like any other (and align the Cryo Legionnaire sample). Say a weapon that destroys or removes its target counts as doing damage, even when no health bar falls. *Alternative:* Let the cryo family and damage type carry the slow-then-freeze, with no traits for it, as the Cryo Legionnaire sample does (j11 raised both readings).
- *Raised by* 3 reports (j05, j08, j11).

**12. Matchups rule 6 when the sources talk numbers or disagree**
- *Rule:* The same enemy may sit in counters and countered by only when the reasons name different situations; otherwise "put it where the head-on fight at equal cost ends".
- *Problem:* Sources often give the outcome by numbers (cheaper tanks swarm the Mammoth; one gunboat loses to the submarine but several win) or disagree (one page has SEALs kill the Desolator at once, another has him outrange them). Coders could not tell whether being outnumbered is a situation of its own or the equal-cost fight, and left some enemies out. Units: `ra1.soviet.mammoth-tank`, `ra1.soviet.submarine`, `ra2.iraq.desolator`.
- *Fix:* Say that one-on-one and against several cheaper units are different situations, so the enemy may sit in both lists with reasons that say which; compare at equal cost from the prices only when the sources give no numbers; and when sources disagree on who wins, leave the enemy out and add an uncertain entry.
- *Raised by* 3 reports (Mammoth coder A, j04, j06).

**13. can_target step 1 against the naval coding rule**
- *Rule:* can_target step 1: a weapon that does no damage, latches on, drains or takes over minds "lists only the kinds the sources name". The naval coding rule lists naval "on every weapon that lists ground-vehicle".
- *Problem:* Neither says which wins. The Field Mechanic's wrench leaves ships out (the code never repairs them), while the Mastermind's mind control and the Chrono Legionnaire's beam list naval from the naval rule alone. Units: `ra1.allied.field-mechanic`, `ra2.yuri.mastermind`, `ra2.allied.chrono-legionnaire`.
- *Fix:* Say step 1 wins: such a weapon lists naval only when a source names ships or says it works on every unit. *Alternative:* The naval rule wins unless a source says the weapon cannot reach ships (the Mastermind's coder read it this way).
- *Raised by* 3 reports (j02, j05, j07).

**14. Matchups with buildings**
- *Rule:* Typed links: "A link always describes a unit"; counters and countered by name enemy units.
- *Problem:* Several sourced wins and losses are against buildings: the Spy's intelligence and sabotage results, the base defences that stop the Chaos Drone, the base defences the Sudden Transport slips past. One coder left the Spy's building wins out for want of a link; others used target:structure, which reads oddly for an enemy. Units: `ra1.allied.spy`, `ra2.yuri.chaos-drone`, `ra3.empire.sudden-transport`.
- *Fix:* Say that target:structure names buildings in counters and countered by (base defences, production buildings), with the building's job in the reason.
- *Raised by* 3 reports (j01, j07, j09).

**15. Matchups for units that cannot fight**
- *Rule:* counters needs at least one entry; Matchups rule 5 hangs something the unit lacks "on the part that causes it".
- *Problem:* An unarmed repairer or transport beats nothing head-on, so coders made up a counter no source names (a long tank fight for the Field Mechanic, base defences for the Sudden Transport). An unarmed unit also has no weapon part to hang its lack of a weapon on; the Spy's went on its armour class. Units: `ra1.allied.field-mechanic`, `ra3.empire.sudden-transport`, `ra1.allied.spy`.
- *Fix:* Let counters be empty for a unit with no damaging weapon, as combos may be, or say what goes there (what it slips past or makes possible). Say that an unarmed unit's lack of a weapon hangs on its class or armour class, with the gap named in the reason.
- *Raised by* 3 reports (j01, j02, j09).

**16. Matchups list length**
- *Rule:* Matchups rule 7: "keep each list short, about two to five".
- *Problem:* Coders read it as a hard cap and cut well-sourced sixth entries (Kirov, Sickle), while another kept a single countered_by entry rather than add one with no source (Cryocopter). Units: `ra3.soviet.kirov-airship`, `ra3.soviet.sickle`, `ra3.allied.cryocopter`.
- *Fix:* Say it is a guide, not a limit: one entry is fine when the sources give only one, and a sixth may stay when it is sourced and adds a new reason.
- *Raised by* 2 reports (j10, j11).

**17. Hedged wording in the role tests**
- *Rule:* Roles step 4 reads official strong-against text; roles.secondary counts it when "a source calls it an anti-tank or anti-aircraft weapon"; the drop rule reads only official text; the anti-air trait follows high air in can_target.
- *Problem:* No rule says whether a hedged line counts. The Siege Chopper gets secondary anti-air and the anti-air trait from a wiki line that its gun can, up to a point, serve against aircraft, while the same page says it is too weak for discs, airships and jets. The Yak's primary anti-infantry rests on a hedged manual line about what one strafing run may do to massed infantry. Units: `ra2.soviet.siege-chopper`, `ra1.soviet.yak`.
- *Fix:* A hedge on whether the weapon works against a target ('to some extent', 'can be used as') does not count; a hedge only on how much it kills still counts, so the Yak stays anti-infantry. Also (the RA2 reconciler's proposal) drop a role when a cited source says the weapon is ineffective against the targets the role names, and give the anti-air trait only when no source says that of high air, keeping high air in can_target. The Siege Chopper would then take raider in place of anti-air.
- *Raised by* 4 reports (Siege Chopper coder A, Siege Chopper coder B, RA2 reconciler, j04).

**18. Roles step 1 with two named roles**
- *Rule:* roles.primary step 1: when the official line names two roles, "use the one whose target the main weapon has a bonus against", and "Skip a role whose requires the unit's stock parts fail".
- *Problem:* It does not say whether 'bonus' means step 4's tests (where official strong-against text counts), what the target of a role without one is (siege, transport), or whether a role whose requires fail is skipped before the bonus test. The Siege Chopper's line names anti-infantry and artillery. The Mastermind's names anti-infantry and anti-vehicle, and anti-armour fails its requires: skipping first gives anti-infantry, testing first gives assault. The Brute, Yuri Clone, Battle Fortress, Bullfrog and Century Bomber will raise the same question. Units: `ra2.soviet.siege-chopper`, `ra2.yuri.mastermind`.
- *Fix:* Write the order out: first skip named roles whose requires fail; if one is left, use it; if two anti roles are left, test the bonus as step 4 defines it. A role with no target (siege, transport) never wins the test and waits for roles.secondary step 1, as the RA2 notes already say for the Battle Fortress's transport. *Alternative:* Run the bonus test on both named roles first and go on when neither has a bonus; the Mastermind would then be assault.
- *Raised by* 3 reports (Siege Chopper coder A, Siege Chopper coder B, j07).

**19. Matchups rule 1: a phrase that names the enemy two ways keeps only the first**
- *Rule:* Matchups rule 1: "When one phrase names the enemy two ways at once (rocket-armed infantry), take the first that fits in this order" (job, then weapon or harm, then what it is). Speed is not in the order.
- *Problem:* The single link can drop half of the reason or claim too much. 'Fast armour-piercing units' becomes damage:armour-piercing alone, though their speed is what lets them catch the Siege Chopper before it lifts off. 'Rocket infantry' becomes weapon:rockets, which also covers the V2 that the M.A.D. Tank's pulse does hurt. Units: `ra2.soviet.siege-chopper`, `ra1.soviet.mad-tank`.
- *Fix:* When the first link alone drops half the point or covers units the reason is false for, allow a second entry for the other half (speed:>=fast, class:infantry), each with its own reason.
- *Raised by* 3 reports (Siege Chopper coder A, Siege Chopper coder B, j03).

**20. Weapon entries rule 1: what one in-game weapon is**
- *Rule:* Weapon entries (1): "One in-game weapon is one entry, even when it acts differently against different targets." Paired entries and the mode rules make a weapon swapped in by a mode an alternate.
- *Problem:* The game data gives the Magnetron two weapons (one per kind of target, each with its own reach), while the wikis show one beam. One infobox weapon serves both forms of the Mecha Tengu, but the form decides what it can hit. Coders made one entry for the first and two for the second. The Striker-VX and Sea-Wing will raise the same question. Units: `ra2.yuri.magnetron`, `ra3.empire.mecha-tengu`.
- *Fix:* Say the sources' naming decides what one weapon is, but when a mode changes what a weapon can hit, the mode's version is an alternate entry with that mode (Paired entries wins).
- *Raised by* 2 reports (j08, j09).

**21. The role steps read only weapons, so damaging abilities earn no role**
- *Rule:* The role steps and the anti roles' requires read weapons (their damage types) and patterns. An ability carries no damage type.
- *Problem:* A unit whose harm comes from an ability can never be anti-armour or siege, even when its sources give it that job: the M.A.D. Tank's pulse wrecks vehicles and buildings, and the Allied Minelayer's anti-tank mines kill vehicles. Both have fit_notes asking for anti-armour. Units: `ra1.soviet.mad-tank`, `ra1.allied.minelayer`.
- *Fix:* Let an ability that deals damage give roles the way a weapon does, from the damage and targets its summary states.
- *Raised by* 2 reports (j02, j03).

**22. Matchups rule 3: unit links**
- *Rule:* Add a unit: link "only for a same-game partner or rival the sources name, next to a word-list or pattern link for the same reason".
- *Problem:* Sometimes every word-list link claims too much: crush covers every crusher, but only the Battle Fortress can run Boris over. The merge pass left Boris with the Battle Fortress link alone, which breaks the rule. It is also unclear whether naming what only one unit makes (minefields) names that unit (the Minelayer), for the Yak's counter. Units: `ra2.soviet.boris`, `ra1.soviet.yak`.
- *Fix:* Allow a unit: link alone when every word-list link would cover units the reason is false for, and say so in the reason. Count naming what only one unit makes as naming that unit.
- *Raised by* 2 reports (j04, j06).

**23. When a passive effect gets its own ability entry**
- *Rule:* Weapons vs abilities: a passive is its own ability when "the source names the effect and it adds a mechanic". The abilities rule narrows the naming to "as an ability, perk, upgrade or loadout pick", and says to use a word-list term instead when one says the same.
- *Problem:* The Mastermind's overload has its own wiki section and an announcement but is listed nowhere as an ability. The Chrono Legionnaire teleports on every move order, which the teleport trait already says, but its freeze that grows with distance adds a mechanic. Coders kept both as passives, against one reading of each rule. Units: `ra2.yuri.mastermind`, `ra2.allied.chrono-legionnaire`.
- *Fix:* Use one wording in both places: a passive is its own entry when a source describes the effect as a distinct state or behaviour and it adds a mechanic that no word-list term covers.
- *Raised by* 2 reports (j05, j07).

**24. armament.affects: friendly fire and shielding friends**
- *Rule:* affects: "Default: enemies. Repair and buff tools affect allies."
- *Problem:* It does not say whether bombs that also hurt friendly units (at reduced strength) are both, or enemies plus the friendly-fire trait, nor whether a beam that can be used to shield a friend is both. Units: `ra3.soviet.kirov-airship`, `ra2.allied.chrono-legionnaire`.
- *Fix:* Say affects names who the weapon is meant for: harm to friends is the friendly-fire trait, not both; both is for a weapon used on purpose on either side (the chrono beam).
- *Raised by* 2 reports (j05, j10).

**25. Roles for units whose only weapon does no damage**
- *Rule:* roles.primary step 2 applies when "its only weapon is a tool", and tool is not defined. roles.secondary step 4 gives raider to any fast unit with light or no armour, while a candidate's description must also fit.
- *Problem:* A freeze beam that harms nothing could be a tool (step 2, disabler) or a weapon (step 5, raider). Raider's hit-and-run picking-off needs damage, so the Chaos Drone took raider as a secondary while the Cryocopter left the slot empty. Units: `ra3.allied.cryocopter`, `ra2.yuri.chaos-drone`.
- *Fix:* Define a tool as a weapon that does no damage (it repairs, freezes, marks or disguises), and say raider needs a weapon that does damage.
- *Raised by* 2 reports (j07, j11).

**26. Order of sources**
- *Rule:* sources: "Fill the slots in this order: an official page about the unit ... then the pages most of the entry rests on".
- *Problem:* It is unclear whether this sets the order of the list or only which pages to keep when there are more than five. The samples list a wiki page first even where an official copy exists, and the rule gives no order once the unit's own pages and a second site are in. Units: `ra3.empire.mecha-tengu`, `ra3.soviet.sickle`.
- *Fix:* Say it is a priority for which five pages to keep, and that the order of the list is free.
- *Raised by* 2 reports (j09, j10).

**27. Detector: whose view, and which classes**
- *Rule:* detector: reveals hidden enemies close to it "for the whole team"; its classes are shown as "all".
- *Problem:* The RA1 Attack Dog only sees through spies itself and attacks them, which the term does not cover (it has a fit_note). And 'all' in the word list means the six generator classes, so the validator flags a detector on a ship (the Submarine) as atypical. Units: `ra1.soviet.attack-dog`, `ra1.soviet.submarine`.
- *Fix:* Widen detector to reveal hidden enemies to itself or to its team (or add a self-only variant), and either add the naval class to its list or say in the word list that 'all' leaves out the research-only naval class.
- *Raised by* 2 reports (j01, j04).

**28. Matchups: 'tanks' as class:vehicle or armour-class:heavy**
- *Rule:* Matchups rule 1 gives armour-class:heavy as an example of naming a kind of unit; the Multigunner IFV sample links the same wording ('tanks') as class:vehicle.
- *Problem:* Coders hesitated between the two for 'tanks' and 'basic tanks', and the choice changes what the link claims (light tanks are not heavy armour). Units: `ra3.empire.mecha-tengu`, `ra1.soviet.mammoth-tank`.
- *Fix:* Say that tanks in general are class:vehicle, and that armour-class:heavy is for sources that say heavy tanks.
- *Raised by* 2 reports (Mammoth coder A, j09).

**29. A shared entry for a type whose parts differ by side**
- *Rule:* Ids: "The faction id shared is reserved for units every side can field."
- *Problem:* One RA1 game type, the Minelayer, lays anti-tank mines for one side and anti-personnel mines for the other, so a shared entry's roles, ability and matchups cancel out. The merge pass split it into two entries, as a reversible decision left for Mustafa. Units: `ra1.allied.minelayer`, `ra1.soviet.minelayer`.
- *Fix:* Confirm the split and say so in the Ids convention: a type whose stock parts differ by owner gets one entry per side.
- *Raised by* 1 report (j02).

**30. Roles step 4: strong-against text about a secondary weapon decides the main role (already named to Mustafa)**
- *Rule:* roles.primary step 4 counts official text that "the unit is strong against" a target. The RA1 notes add that text about a second weapon counts, and the first target named wins a tie.
- *Problem:* The game's heaviest cannon tank comes out primary anti-infantry, only because the manual praises its missiles and names infantry first. Units: `ra1.soviet.mammoth-tank`.
- *Fix:* In step 4, let text tied to a weapon other than the main weapon give a candidate only when the main weapon gives none, and otherwise count it at roles.secondary step 3. Also read a strong-against claim about an armour-piercing main weapon that names land as armour. The Mammoth would then be anti-armour, with anti-infantry and anti-air secondary; the RA1 notes' Mammoth line would change with it.
- *Raised by* 3 reports (Mammoth coder A, Mammoth coder B, RA1 reconciler).

**31. Assault needs a short- or medium-range main weapon, which no RA1 tank has (already named to Mustafa)**
- *Rule:* roles.secondary step 4: "Assault: medium or heavier armour and a short- or medium-range main weapon."
- *Problem:* RA1's reference rifle has one of the game's shortest reaches, so every tank gun bands long (the RA1 notes expect it) and no RA1 tank can get assault, not even one the wiki calls a heavy assault tank. Units: `ra1.soviet.mammoth-tank`.
- *Fix:* Judge 'short or medium' against the game's standard tank gun, the cost-anchor tanks: allow assault when the main weapon reaches no further than their main gun.
- *Raised by* 3 reports (Mammoth coder A, Mammoth coder B, RA1 reconciler).

**32. A landed flier keeps its air target layer (already named to Mustafa)**
- *Rule:* modes[].mobility: "Leave it out when the mode keeps the unit's movement or cannot move at all"; a target link comes from mobility and size.
- *Problem:* The landed Siege Chopper is still a low-air target in the data, though ground weapons, tank hunters and mind control reach it there; only its mode summary and a fit_note say so. No class fits a landed helicopter either. Units: `ra2.soviet.siege-chopper`.
- *Fix:* Let a mode that cannot move still give mobility.base, or add a modes[].target, when the mode changes what kind of target the unit is (a flier that lands).
- *Raised by* 3 reports (Siege Chopper coder A, Siege Chopper coder B, RA2 reconciler).

**33. Sizes and armour check A: a super-heavy tank coded large**
- *Rule:* Sizes put "super-heavies" at huge and "Tanks of every weight" at large; armour check A gives super-heavy only to a huge unit at t3, or by the registry notes.
- *Problem:* Sources call the Mammoth a super-heavy tank, and the super-heavy description fits it, but the code's size flag groups it with the battle tanks, so it is coded large and therefore heavy. The armour class hangs on the footprint. Units: `ra1.soviet.mammoth-tank`.
- *Fix:* Add super-heavy to the weight words that are not a size, and let check A also accept a t3 tank with clearly more health than the registry's cost-anchor tanks. *Alternative:* Leave the rules and list the Mammoth as super-heavy in the RA1 notes, if that is the intent (a batch change).
- *Raised by* 3 reports (Mammoth coder A, Mammoth coder B, RA1 reconciler).

**34. Magazine trait on a fixed burst**
- *Rule:* magazine: set it when the sources "name its reload or clip as a strength or weakness of this weapon"; a weapon "that holds one shot per reload" never gets it for that reload.
- *Problem:* The Mammoth's missiles get magazine because a wiki calls their wait a reload and a weakness. Its cannons fire the same two-shot burst with the same wait and get nothing, only because no page names it. RA1 has no clips: the wait is the rate of fire. Units: `ra1.soviet.mammoth-tank`.
- *Fix:* Extend the one-shot exception to a fixed burst that the game repeats at its normal rate of fire: that wait is the rate of fire unless the sources show a clip or an ammunition count.
- *Raised by* 3 reports (Mammoth coder A, Mammoth coder B, RA1 reconciler).

**35. The combination check reads the base class, not the mode (already named to Mustafa)**
- *Rule:* The validator tests a weapon family's allowed classes against the unit's base class, and ignores modes.
- *Problem:* The Siege Chopper's howitzer works only once it has landed, but the check shows it as artillery on an aircraft. Units: `ra2.soviet.siege-chopper`.
- *Fix:* For a weapon with a mode, check its family against the mode's class and mobility when the mode gives them. This needs the landed-flier fix above.
- *Raised by* 2 reports (Siege Chopper coder A, RA2 reconciler).

**36. Matchups rule 1 when the source names only a unit, in counters and combos**
- *Rule:* Matchups rule 1: "When they name only a unit, use the same order for what makes that unit win."
- *Problem:* The wording fits countered_by. In combos, the escort the sources name (Rhino tanks, Conscripts in a garrison) is not coded yet, so its job is a guess; in counters it is unclear what to name about a unit that loses (the Rocketeers the Siege Chopper beats). Units: `ra2.soviet.siege-chopper`.
- *Fix:* Say that in counters you name what makes the named unit lose to this one, and in combos what it brings to the pair; when the named unit is not coded yet, use the job its sources give it, otherwise its class.
- *Raised by* 2 reports (Siege Chopper coder A, Siege Chopper coder B).

**37. Matchups rule 4: a weakness about being slow for its kind**
- *Rule:* Matchups rule 4: in strengths and weaknesses, "give the unit's own value".
- *Problem:* A weakness about being slow among planes hangs on the Yak's own band, very fast, which reads backwards; and since speed names no target, official text calling it slow cannot drop its raider role either. The Mammoth had the same clash until its speed was re-banded slow. Units: `ra1.soviet.yak`.
- *Fix:* When the reason compares the unit with others of its own kind, hang the weakness on the part that exposes it (its armour or health) and give the comparison in the reason. Raider stays with the band, which compares the unit with the reference soldier, not with other planes.
- *Raised by* 2 reports (Mammoth coder A, j04).

**38. Siege's coding rule shuts out beam artillery**
- *Rule:* siege's coding rule: a lobbed weapon, bombs, a deploy mode whose gun hits an area, or a structure-killing missile or rocket; "A gun aimed straight at targets in view is never siege by that last clause".
- *Problem:* Every source describes the Magnetron as Yuri's artillery against buildings, but its straight beam cannot be siege; with anti-armour failing too, it falls to assault. Units: `ra2.yuri.magnetron`.
- *Fix:* Let a long-range weapon whose sources name buildings as its main target give siege, whatever its delivery. This reverses a line the rule draws on purpose, so it is Mustafa's call.
- *Raised by* 1 report (j08).

**39. Armed workers fall through to assault**
- *Rule:* roles.primary step 2 covers a unit that is unarmed, whose only weapon is a tool, or that is built to carry, supply, build or spy with its guns fired only from other seats.
- *Problem:* A miner with its own self-defence gun skips step 2, and with an Application line that names no role it ends as assault (its fit_note asks for logistics). The War Miner and Chrono Miner get logistics only because they have no designation. Units: `ra2.yuri.slave-miner`.
- *Fix:* Let step 2 also take a unit built to carry, supply, build or spy whose own gun is only for self-defence.
- *Raised by* 1 report (j08).

**40. Called-in strikes fired by the attack order**
- *Rule:* "Anything fired with an attack button is a weapon", but the RA2 notes call Boris's MiG strike one of the units' "own innate abilities, not powers".
- *Problem:* Boris calls jets onto a building by holding a designator on it with the attack order. No rule says whether to code the designator (laser, energy, beam, as now) or the bombs that do the harm. The designator's nominal energy damage meets anti-armour's requires, and siege comes only through the jets. The registry line reads as if the strike were an ability. Units: `ra2.soviet.boris`.
- *Fix:* Say a call-in fired with the attack order is a weapon coded as the ordnance that does the harm (its family, damage and delivery), with the designator, and its need to stay on the target, in the summary and condition. Reword the RA2 note to say only that the strike is innate, not a power. *Alternative:* Keep coding the designator, and say a marker's nominal damage never meets a role's requires (j06 found both readings fair).
- *Raised by* 1 report (j06).

**41. Actions aimed with the attack order that do nothing to the target**
- *Rule:* Weapons vs abilities: "Anything fired with an attack button is a weapon."
- *Problem:* The Sudden Transport disguises itself by targeting a vehicle, with no button of its own. It was coded as an active ability because it does nothing to its target, but no rule says so. Units: `ra3.empire.sudden-transport`.
- *Fix:* Say that an action aimed with the attack order that does nothing to its target (copying a vehicle's look) is an ability, not a weapon.
- *Raised by* 1 report (j09).

**42. Bail-out when the crew leaves as a self-destruct starts**
- *Rule:* bail-out is in-game "when the crew or riders get out on their own as the vehicle dies".
- *Problem:* The M.A.D. Tank's crewman leaves when the countdown starts, before the tank dies. The coder took bail-out, basis in-game, through the registry's test that a cited page shows the crew getting out. Units: `ra1.soviet.mad-tank`.
- *Fix:* Say that crew who leave on their own once an unstoppable death has begun count as bailing out.
- *Raised by* 1 report (j03).

**43. Matchups that name a side-wide power**
- *Rule:* Shared mechanics leave side-wide powers off every unit; the Matchups rules do not say whether a power may be a matchup link.
- *Problem:* A pattern link for the Iron Curtain in the M.A.D. Tank's countered_by named an enemy that no unit is. The merge pass dropped it, but nothing says it should never be there. Units: `ra1.soviet.mad-tank`.
- *Fix:* Say a side-wide power is never a matchup link; mention it in the reason of a related entry or in notes.
- *Raised by* 1 report (j03).

**44. Ability kind for a press-to-start countdown**
- *Rule:* Ability kinds tie-breaks: deploy needs a stronger stationary mode, and ultimate a charge before each use.
- *Problem:* The M.A.D. Tank's button starts a countdown that pins it in place and ends in its death. None of active, deploy or ultimate is clearly right; it was coded active. Units: `ra1.soviet.mad-tank`.
- *Fix:* Add to the tie-breaks that a press starting a timed action that runs to its end on its own is active, even when it pins the unit or ends its life.
- *Raised by* 1 report (j03).

**45. No default handling for naval mobility**
- *Rule:* mobility.handling is required and starts "from the default handling of the unit's mobility type"; the two naval mobility types have none.
- *Problem:* A coder has nothing to start from; the Submarine got steer by judgement. Units: `ra1.soviet.submarine`.
- *Fix:* Give both naval mobility types a default handling (the coder proposes steer).
- *Raised by* 1 report (j04).

**46. Off-screen range for a unit that sees nothing**
- *Rule:* Off-screen's first reason: a weapon long by its reach that "reaches past its own unit's sight figure".
- *Problem:* RA1 aircraft have sight 0 in flight, so every long aircraft gun bands off-screen, though the Yak's guns strafe at short range in play. The RA1 notes expect this for the Hind, Yak and MiG. Units: `ra1.soviet.yak`.
- *Fix:* Let off-screen's first reason apply only when the unit's sight figure is above zero.
- *Raised by* 1 report (j04).

**47. Remote crew when the operator is a building**
- *Rule:* remote: "Only when the source has a person who stays on the field, outside the machine, while steering it"; lore does not count.
- *Problem:* The Robot Tank depends on a control building, and people inside it appear only in background text. It was coded remote, as its brief asked, with a fit_note and an uncertain entry. Units: `ra2.allied.robot-tank`.
- *Fix:* Say a unit run from a building is not remote: it is solo, and its dependence on the building is the depend-on-relay pattern, now registered.
- *Raised by* 1 report (j05).

**48. Delivery of an instant hit that leaves a lasting link**
- *Rule:* Weapon delivery: hitscan lands at once; beam is held on the target.
- *Problem:* Mind control lands at once, but the link then stays on each captive as a held beam would. It was coded hitscan. Units: `ra2.yuri.mastermind`.
- *Fix:* Say delivery follows how the shot lands (hitscan here), and the lasting link goes in the summary.
- *Raised by* 1 report (j07).

**49. Lineage across very different designs**
- *Rule:* lineage is a "Shared id for the same design", but its test is the same or nearly the same name and the same job.
- *Problem:* The test links RA2's Mastermind, a tank, with the Scrin Mastermind of Tiberium Wars, a commando on foot. Units: `ra2.yuri.mastermind`.
- *Fix:* Add to the test that the class and body must be alike, so a tank and a foot soldier never share a lineage.
- *Raised by* 1 report (j07).

**50. Nature of a vehicle with no crew that is not a robot**
- *Rule:* crewed-machine: "When the source says nothing either way", a vehicle is crewed; uncrewed-machine only when "the source says it is a robot, drone or remote-controlled machine".
- *Problem:* The Mastermind is a tank run by a cloned brain, with no crew and no robot, so it falls to crewed-machine, which also gives it a bail-out on death. Units: `ra2.yuri.mastermind`.
- *Fix:* Let uncrewed-machine also cover a machine the sources show run by no crew (a brain or a computer).
- *Raised by* 1 report (j07).

**51. A vehicle that deploys into a building**
- *Rule:* modes[]: write only what changes; no class or body describes a structure.
- *Problem:* The Slave Miner deploys into a refinery. Its building form has no class or body, and no rule says how to code its armour when the building's armour type is not given. Units: `ra2.yuri.slave-miner`.
- *Fix:* Say a building form keeps the base class and body, is described in the mode's summary, and keeps the base armour unless a source gives the building's.
- *Raised by* 1 report (j08).

**52. roles.secondary step 2 and a mode's own speed and armour**
- *Rule:* roles.secondary step 2 ranks "A button or mode that every copy has"; step 4 reads speed and armour.
- *Problem:* It does not say whether a mode's own speed and armour (the Mecha Tengu's fast, light jet form) can support raider or assault at step 2, or whether step 4 reads only the base form. The answer decides between anti-air plus raider (as coded) and anti-air plus assault. Units: `ra3.empire.mecha-tengu`.
- *Fix:* Say a mode supports a role at step 2 through its own speed, armour and weapons.
- *Raised by* 1 report (j09).

**53. Class and body of a hovering humanoid robot**
- *Rule:* humanoid-mech allows only the walker class and two legs; none of the bodies the hover class allows is a mech.
- *Problem:* The Mecha Tengu hovers on boosters but has a torso, arms and legs, so either class breaks a combination rule and the validator flags it. Units: `ra3.empire.mecha-tengu`.
- *Fix:* Allow humanoid-mech with hover mobility.
- *Raised by* 1 report (j09).

**54. Body size of a mode with a new body**
- *Rule:* modes[]: "Write only the parts that change from the base form"; the size examples put jets at large.
- *Problem:* It is unclear whether a mech that folds into a jet restates its size (large) or keeps the base form's. Units: `ra3.empire.mecha-tengu`.
- *Fix:* Say a mode with a new body plan gives the size that its body's examples give.
- *Raised by* 1 report (j09).

**55. Infiltrator for a disguised transport**
- *Rule:* infiltrator's description: passes as the enemy "to spy, steal or sabotage"; its tie-break accepts passing as the enemy on its own.
- *Problem:* The Sudden Transport disguises itself only to deliver troops. It fits the tie-break but not the description; it was coded infiltrator. Units: `ra3.empire.sudden-transport`.
- *Fix:* Make the description match the tie-break: passing as the enemy, for any purpose, is infiltration.
- *Raised by* 1 report (j09).

**56. Official text that 'calls the unit by' a role**
- *Rule:* roles.secondary step 1: "Official text calls the unit by the role label or one of its aliases"; the raider-or-scout tie-break needs official text calling the unit a scout.
- *Problem:* The Sickle's profile says its jump is very useful for reconnaissance: the alias describes what an ability is good for, not the unit. Read strictly, scout fails; it was coded scout with an uncertain entry. Units: `ra3.soviet.sickle`.
- *Fix:* Say only text that names the unit counts at step 1, and text about what an ability is for supports the role at step 2, through that ability.
- *Raised by* 1 report (j10).

**57. Crew model for copies of one gun on separate mounts**
- *Rule:* Weapon entries (2) merge copies of one gun into one entry; the driver-gunner proposal needs "two weapons at the same time from separate mounts".
- *Problem:* The Sickle's three guns aim on their own and fire at different targets at once, but they are one entry, so the proposal can never apply. Units: `ra3.soviet.sickle`.
- *Fix:* Say copies of one gun on separate mounts count as one weapon for crew purposes too, so the unit stays solo, as coded.
- *Raised by* 1 report (j10).

**58. Speed boosts that cost health: trait, pattern or mode**
- *Rule:* The boost trait "uses a key", with the dash pattern; the abilities rule sends a boost that costs more than speed to overclock-self; modes are for second forms, but modes[].mobility allows a mode that changes only speed.
- *Problem:* The Kirov's Gastroburners burn its own hull for speed, on a toggle. The trait points to dash, the ability to overclock-self, and the mode rules leave a speed-only mode open. Other self-damaging boosts will raise the same. Units: `ra3.soviet.kirov-airship`.
- *Fix:* Say a costly boost keeps the boost trait, its ability links overclock-self, and a change of speed alone is never a mode.
- *Raised by* 1 report (j10).

**59. Assault at step 4 for a bomber**
- *Rule:* roles.secondary step 4: "Assault: medium or heavier armour and a short- or medium-range main weapon"; assault "Leads pushes, soaks damage and brawls at short to medium range".
- *Problem:* The Kirov gets assault from its super-heavy armour and short-range bombs, though a bombing airship does not brawl. Units: `ra3.soviet.kirov-airship`.
- *Fix:* Say step 4's assault test is for units that fight on the ground, not for bombers.
- *Raised by* 1 report (j10).

**60. Melee or short for a charge placed by hand**
- *Rule:* melee covers "claws, blades, a bite", and a unit "that leaps or latches onto its target is still melee"; the melee-or-short tie-break speaks of blows, leaps and latches.
- *Problem:* Tanya must reach the target and plant her charge by hand; the rules do not cover a placed charge. It was coded melee. Units: `ra3.allied.tanya`.
- *Fix:* Add a charge placed by hand at touching distance to melee's coding rule.
- *Raised by* 1 report (j11).

## Open, for the batch

**1. Role fit_notes use two different paths**
- *Rule:* The roles word list says to record a role whose requires fail in fit_notes "(path roles, ...)"; the opening entries and some coders use roles/primary or roles/secondary.
- *Problem:* The batch's units now mix both paths, and the vocabulary-gaps report reads fit_notes by path. Units: `ra1.soviet.mad-tank`, `ra1.allied.mobile-gap-generator`, `ra1.allied.minelayer`, `ra1.soviet.mammoth-tank`, `ra1.soviet.submarine`, `ra2.allied.robot-tank`, `ra2.yuri.mastermind`, `ra2.yuri.magnetron`, `ra2.yuri.slave-miner`, `ra3.soviet.sickle`, `ra3.soviet.kirov-airship`.
- *Fix:* Make every role fit_note follow the word list (path roles). This is a data fix, with no rule change. *Alternative:* Mustafa changes the word list to roles/primary or roles/secondary, which says more.
- *Raised by* 1 report (j03).

**2. Sight figures in RA2 text fields**
- *Rule:* The games registry's RA2 sight reference and the R1 notes on shroud and sight say to give the unit's Sight figure in sensors.notes. Bands with numbers says text fields give sight "as comparisons in words", never as figures.
- *Problem:* The two rules conflict for every RA2 unit; each coder wrote a ratio in words. Units: `ra2.allied.chrono-legionnaire`, `ra2.allied.robot-tank`, `ra2.iraq.desolator`, `ra2.soviet.boris`, `ra2.soviet.siege-chopper`, `ra2.yuri.mastermind`, `ra2.yuri.magnetron`, `ra2.yuri.chaos-drone`, `ra2.yuri.slave-miner`.
- *Fix:* Reword the registry and the notes: say in sensors.notes, in words, how far the unit lifts the shroud compared with the Conscript (the RA2 reconciler's proposal).
- *Raised by* 4 reports (Siege Chopper coder A, Siege Chopper coder B, RA2 reconciler, j06).

**3. Archived official profiles that will not load**
- *Rule:* sources: cite "The page actually read"; the RA2 notes give each profile's normal Wayback snapshot URL.
- *Problem:* The archive often resets connections from these sessions. Coders read the same snapshot through its raw form, read it from the copy-check cache, or relied on the notes' own reading of a profile they could not open (Robot Tank, Magnetron, Slave Miner). The merge pass then cited cached profiles under the registry's URLs (63e8d8b), but no rule says that counts as read. Units: `ra2.soviet.siege-chopper`, `ra2.yuri.mastermind`, `ra2.soviet.boris`, `ra2.allied.robot-tank`, `ra2.yuri.magnetron`, `ra2.yuri.slave-miner`.
- *Fix:* Write the practice into the RA2 notes: a snapshot read through its raw form or from the copy-check cache counts as read; cite the registry's snapshot URL and say in the source note how it was read; the notes' own account of a page never stands in for reading it.
- *Raised by* 4 reports (Siege Chopper coder B, j05, j07, j08).

**4. Source kinds for released code and fan sites**
- *Rule:* Source kinds name official, wiki, database, guide, video and community. None names a publisher's source-code release or a long-running fan site.
- *Problem:* Coders split between official and database for EA's released Red Alert code, and between guide, community and wiki for CNCNZ. It is also unclear whether the code counts as official text that settles a contradiction. The games registry and every merged unit now cite the code as official, but no note says so. Units: `ra1.soviet.mammoth-tank`, `ra1.allied.spy`, `ra1.soviet.attack-dog`, `ra2.yuri.chaos-drone`.
- *Fix:* Say in the R1 notes that EA's released code is kind official and settles what the engine does only for the version it is, and that CNCNZ is kind guide. *Alternative:* Mustafa adds both cases to Source kinds, so later batches follow them too.
- *Raised by* 4 reports (Mammoth coder A, Mammoth coder B, j01, j07).

**5. Armour class in RA3 for units between two classes**
- *Rule:* With no armour map, RA3's armour class goes by kind (step 4): "drones and robots no bigger than a soldier" are light, light walkers bigger than one are medium; a soldier is light only with tougher armour than the rifle infantry.
- *Problem:* A hovering combat robot (Mecha Tengu), a light walker with little health (Sickle) and an APC whose armour set is named for light vehicles (Sudden Transport) come out medium by kind, though their health is close to light units'; the class also decides the directional armour model. Tanya has one known resistance and no armour set, so light or unarmoured is a guess. Units: `ra3.empire.mecha-tengu`, `ra3.soviet.sickle`, `ra3.empire.sudden-transport`, `ra3.allied.tanya`.
- *Fix:* Add a closed armour list to the RA3 notes, as the RA1 notes have, giving these units' classes from their health against the cost anchors. *Alternative:* Mustafa adds these kinds to the armour class descriptions.
- *Raised by* 3 reports (j09, j10, j11).

**6. RA2 Sight figures and the artillery tie-break**
- *Rule:* The RA2 notes say a proposal sight band uses no figure, so a weapon is off-screen only for its other reasons. The artillery tie-break asks whether a gun "reaches further than the unit itself can see, so others must spot for it".
- *Problem:* The same Sight figure counts for one rule and not the other, and RA2 has no fog, so nobody needs to spot. The Siege Chopper's howitzer became artillery from its Sight figure, which also makes it atypical on an aircraft, while the Magnetron's and Boris's long weapons stay long. Units: `ra2.soviet.siege-chopper`, `ra2.yuri.magnetron`, `ra2.soviet.boris`.
- *Fix:* Say in the RA2 notes that the artillery tie-break, like off-screen, never reads the Sight figure, so artillery needs a source that shows the gun lobbing shells over cover. *Alternative:* Let the Sight figure count for both rules; several RA2 weapons would then be off-screen.
- *Raised by* 3 reports (Siege Chopper coder A, Siege Chopper coder B, j08).

**7. Facts that have no field: multiplayer-only, campaign-only, the hero cap**
- *Rule:* The R1 notes ask to mark multiplayer-only units "in their notes" and to give the hero cap in notes. A source unit has no general notes field, and availability has none.
- *Problem:* Coders put these facts in tier.basis (Spy, Gap Generator) or in on_death.notes (Boris). Units: `ra1.allied.spy`, `ra1.allied.mobile-gap-generator`, `ra2.soviet.boris`.
- *Fix:* Name the field in the notes: tier.basis, which already says who can build the unit, holds multiplayer-only, campaign-only and one-at-a-time limits. *Alternative:* Mustafa adds a general notes field to source units.
- *Raised by* 3 reports (j01, j03, j06).

**8. Crushers that the crush trait's size rule leaves out**
- *Rule:* crush is "only with sizes: Large, Huge". The RA1 notes list medium crushers (the APC, both Minelayers, the Radar Jammer) and then say "Use the trait only where its size rule allows."
- *Problem:* Medium crushers get no trait, and no rule says whether to record them in a fit_note; the trait's size rule even pushed one size choice (the Gap Generator's large). Units: `ra1.allied.minelayer`, `ra1.soviet.minelayer`, `ra1.allied.mobile-gap-generator`.
- *Fix:* Say in the RA1 note to leave the trait off a medium crusher and add a fit_note asking for crush, as the merged Minelayers already do, and that the trait never decides a size. *Alternative:* Mustafa allows crush on medium vehicles.
- *Raised by* 2 reports (j02, j03).

**9. The RA1 and RA2 notes differ on which words count for roles**
- *Rule:* RA1 roles step 1: a role label or alias counts "in any word form", and "The unit's own name never counts". The RA2 notes count the name ("the unit's name included") and say nothing of word forms.
- *Problem:* The same kind of wording gives different results by game: the Siege Chopper's profile says its gun harasses enemy units (a raider alias as a verb), and the Slave Miner gets logistics only through the word miner in its name. Units: `ra2.soviet.siege-chopper`, `ra2.yuri.slave-miner`.
- *Fix:* Write one rule for both games: any word form counts, and a name counts only when it names the unit's job (Engineer, Spy, Miner), as the RA2 notes already allow. *Alternative:* Names never count in either game, as in RA1; RA2's Engineer, Spy, Tank Destroyer and miners would then lose their step 1 role.
- *Raised by* 2 reports (Siege Chopper coder A, j08).

**10. Confidence: version differences and set-aside manual grades**
- *Rule:* The High-or-Medium tie-break drops an entry to medium when sites contradict each other on a point the entry codes "and no official text settles it".
- *Problem:* It does not say whether a difference that may only be a Remastered change counts (the Spy's sonar pulse is single use on the wiki and recharging in the Remastered code), or whether the manual's stat words, which the RA1 notes already set aside as band data, contradict the infobox (the Field Mechanic's armour and speed). The Spy dropped to medium; the Mechanic stayed high. Units: `ra1.allied.spy`, `ra1.allied.field-mechanic`.
- *Fix:* Add to the RA1 notes: a difference that the Remastered code or patch notes explain is a version difference, not a contradiction (code the version researched and note the other); and the manual's stat words never count as a contradiction, since they are not band data.
- *Raised by* 2 reports (j01, j02).

**11. 'A third page of the same site' for the RA1 manual and StrategyWiki**
- *Rule:* sources: "When another established site covers the unit, cite it rather than a third page of the same site."
- *Problem:* It is unclear whether the manual scan that the wiki hosts counts as a page of the wiki, and whether StrategyWiki, which the RA1 notes cite as kind guide, is an established site for this rule. Units: `ra1.allied.minelayer`, `ra1.soviet.minelayer`.
- *Fix:* Say in the RA1 notes that the manual PDF is the publisher's, not a wiki page, and that StrategyWiki counts as another established site here.
- *Raised by* 1 report (j02).

**12. Desolator page listed as having no manual quote**
- *Rule:* The RA2 notes on citing list the Desolator among wiki pages with no manual quote.
- *Problem:* The page now has an official-description box that copies the manual. Units: `ra2.iraq.desolator`.
- *Fix:* Take the Desolator off that list.
- *Raised by* 1 report (j06).

**13. Frames to seconds in RA2**
- *Rule:* Cooldown bands use "real seconds at the game's normal multiplayer speed"; the RA2 notes give no frame rate.
- *Problem:* The wiki converts frames to seconds at 60 a second on one page and 15 a second on another, so the same frame figure gives different bands. Units: `ra2.yuri.chaos-drone`.
- *Fix:* Add one frame rate for normal multiplayer speed, with its source, to the RA2 notes, so every RA2 cooldown given in frames converts the same way.
- *Raised by* 1 report (j07).

**14. Tier gate when a unit needs two top-tier buildings**
- *Rule:* The notes say to "record the highest tech building in the unit's chain", written with RA1 and RA2 in mind.
- *Problem:* RA3's Tanya needs both Max Clearance and the Defense Bureau, both t3, and the RA3 notes say only that she is t3. Units: `ra3.allied.tanya`.
- *Fix:* Say which gate to record when two gates of the same tier are needed (the coder took the Defense Bureau, as the registry suggests for other units that need both), and name both in tier.basis.
- *Raised by* 1 report (j11).

**15. The Desolator's deployed radiation: weapon or ability**
- *Rule:* The RA2 notes' basic orders call the Desolator's radiation the deploy key's ability; their Radiation item says "The weapon that leaves it gets the zone trait."
- *Problem:* The two lines point different ways. Coded as a weapon, Paired entries and Granularity would forbid the leave-hazard-zone link; the coder made it a deploy ability. Units: `ra2.iraq.desolator`.
- *Fix:* Reword the Radiation item: the zone trait is for a weapon fired with the attack order that leaves radiation; a field made with the deploy key is that unit's ability, linking leave-hazard-zone.
- *Raised by* 1 report (j06).

**16. An empty attack line in a wiki infobox**
- *Rule:* can_target in a commanded game lists air "only when the sources say the weapon attacks air units".
- *Problem:* The Siege Chopper's infobox leaves its air-attack line empty, as do those of two other units with the same gun, while the prose says it fires at aircraft. No rule says whether an empty line means it cannot. Units: `ra2.soviet.siege-chopper`.
- *Fix:* Say in the RA2 notes that an empty attack line is silence, not a statement that the weapon cannot attack; the prose decides.
- *Raised by* 1 report (Siege Chopper coder A).

**17. Earned side-wide buttons: the Spy's sonar pulse and parabombs**
- *Rule:* The RA1 notes say what a spy earns belongs to the spy, and that no RA1 ability has source commander-power.
- *Problem:* Nothing says which kind the earned buttons take: active (the player presses them) or triggered (an event grants them). Units: `ra1.allied.spy`.
- *Fix:* Add to the RA1 notes that they are active abilities, source innate, as coded.
- *Raised by* 1 report (j01).

**18. One plane per Airfield and availability**
- *Rule:* availability limited covers "a unit cap, a slot limit or a set number of spawns".
- *Problem:* Each Airfield holds one plane, shared by Yaks and MiGs and raised by building more Airfields, so it is unclear whether that is a slot limit. Units: `ra1.soviet.yak`.
- *Fix:* Say in the RA1 notes that this is not a cap on the unit, so planes stay open, and that it is a weakness, as the notes already say.
- *Raised by* 1 report (j04).

**19. Rank lifts when a unit's page and infobox disagree**
- *Rule:* The RA2 veterancy note gives every unit the same rank lifts, and handles elite weapons through Paired entries.
- *Problem:* The Slave Miner's page says it gets the elite cannon but none of the lifts, while its infobox says it gets them; the note covers the weapon, not this conflict. Units: `ra2.yuri.slave-miner`.
- *Fix:* Say in the RA2 notes to follow the infobox and add an uncertain entry naming the page, as the notes already do for heroes' healing.
- *Raised by* 1 report (j08).

**20. throw-explosive's summary says it is on a cooldown**
- *Rule:* The pattern registry's one-line summary for throw-explosive says the charge is thrown or planted "on a cooldown"; the patterns notes name Tanya's charge as its planted variant.
- *Problem:* Tanya's charge is on the attack order with no cooldown, so by the letter of the summary the link fails the pattern-link test. The pattern's own file, written in 657bc26, already covers commandos who plant charges with no cooldown. Units: `ra3.allied.tanya`.
- *Fix:* Reword the registry summary to match its file (for example, on a cooldown or from a stock), as the batch did for mind-control's summary in 657bc26.
- *Raised by* 1 report (j11).

## Settled during the batch

- **Citing the RA1 manual scan, and checking paraphrases of it.** 90240e7: the RA1 notes now cite the manual PDFs, not their File: pages, and ask for paraphrases to be checked by hand against the PDF's text, since the copy-check cannot read a PDF. Raised by 5 reports (Mammoth coder A, Mammoth coder B, j03, j04, j06).
- **In-game text as official text in RA2.** 90240e7: the RA2 notes now count in-game text, such as a country's loading screen, as official text, so it can decide roles step 4, as for the Desolator. Raised by 1 report (j06).
- **Speed scale for RA2 infantry, hover units, jumpjet fliers and teleporters.** 3df217b: the RA2 speed reference now says ModEnc's infantry factors are prone speeds, and gives hover units, jumpjet fliers and teleporters no speed_raw, banded by judgement with an uncertain entry. Raised by 4 reports (Siege Chopper coder A, Siege Chopper coder B, RA2 reconciler, j05).
- **Speed only while chasing (the RA1 Attack Dog).** 3df217b: the RA1 speed notes now band the dog from its doubled pace at a target (fast) and put its walking pace in mobility.notes. Raised by 1 report (j01).
- **mind-control's summary said control lasts a short time.** 657bc26: the pattern registry's summary now says control lasts until the controller dies, for a set time or for good. Raised by 1 report (j07).
- **Burrow or cloak for a submarine that dives by itself.** 657bc26: the burrow pattern now draws the line: a burrower must come up before it acts, a cloaked unit attacks from hiding (RA1 Submarine burrow, RA2 Typhoon cloak). Raised by 1 report (j04).
- **Free respawning workers recorded as separate units (the Slave Miner's Slaves).** 657bc26: the reinforce-squad pattern now lists the Slave Miner's respawning workers as a variant (a field linking a spawner to its spawns is still missing, a vocabulary gap). Raised by 1 report (j08).
- **The Field Mechanic's wrench, which his brief called no weapon.** 194f4d7: the merged entry keeps the wrench as a repair-tool weapon, as the field rules ask; the brief's wording was loose, not a rule. Raised by 1 report (j02).
