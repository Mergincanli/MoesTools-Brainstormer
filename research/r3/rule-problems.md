# Batch R3: rule problems

Every place where the R3 agents found a written rule unclear, two rules in conflict, or a rule whose result looks wrong for a unit, under the word lists and field rules as they stand (version 1.1.0). The list merges 19 reports: the four opening-check coder reports (Jarmen Kell and the Kaiser, coders A and B), the two reconciler reports (Generals and Iron Harvest) and the thirteen fill jobs (j01 to j13). Three analysts, one per game, first drew 140 items from them and from the batch's other records (44 for Generals, 48 each for Tempest Rising and Iron Harvest). The same rule raised by several reports, or in two games, is one entry.

This file joins those three lists and adds the items no game list holds: the opening check's two splits (`research/r3/opening/splits.json`), the merge check's list for the rule-fix round and its findings that were not confirmed (`research/r3/merge/`), the patterns phase's list (`research/r3/patterns/README.md`) and the night decisions N1 to N4. A last check added four things the lists had left out: two more cases of a role shut out by its requires (in item 10), roles.primary step 3's deploy clause (item 78), Tempest Rising's open prep question on control words (item 80) and a Generals command set that fills one slot twice (item 99). A problem that the 1.1.0 rules already settle is left out; where batch R1's file has the same problem and the 1.1.0 round left it open, the entry says so. Each Rule line was checked against `docs/fields.md` or `docs/vocabularies.md` as they stand, and each unit named against its code in `data/units/`.

- **Open, for Mustafa: 83.** The fix changes the word lists, the field rules or the validator's checks.
- **Open, for the batch: 23.** The fix changes only the registry notes, the registries or the unit data. 18 are settled, each as its entry says. Five are left open: item 86 waits for Mustafa's answer in pull request #6, item 93 for the rule-fix round, item 95 for the confidence rule (item 8), and items 84 and 92 for a source to be read.
- **Settled during the batch: 25.**

Each list runs from the problem that touches the most batch units to the fewest; among equals, the one more reports raised comes first. Units are the batch units the problem touches, by id. The two problems already named to Mustafa in pull request #6 (the walker body plan and the confidence rule) and the three of his five open prep questions that turn on a rule's wording (the generals' Purpose entries, Tempest Rising's air and zone control, and Iron Harvest's mech hunter) say so in their titles; the other two (the Generals tier map and the Generals lasers) are choices about the registry's maps, with no rule wording in doubt, so they have no entry here. The night decisions are notes that stand in for a rule; each entry that holds one says which rule change would replace it: N1 in item 115, N2 in item 109, N3 in item 14 and N4 in item 8. The Tempest Rising note on control of a place (item 80) is another such note.

## Open, for Mustafa

**1. Sizes: stand-ins that disagree, tell nothing apart or run out, and mech weight words**
- *Rule:* Sizes: "Examples win over measurements", and "A weight word in the unit's type (light, medium, heavy or super-heavy tank or mech) is not a size", yet the examples put light mechs at medium, medium to assault mechs at large and giant mechs at huge. With no footprint, stand-ins come in order: the hull the unit is built on, then the game's own size data (a size group, or the room it takes in a transport) against its main battle tank's. A unit that fills an infantry seat in a transport is small.
- *Problem:* The 1.1.0 stand-ins (R1 items 4 and 33) leave gaps. Data can disagree: the Overlord's collision box is twice the Battlemaster's length, though transports give both the same room (coded huge), and the Sentry Drone fills an infantry seat in aircraft but not in the Humvee (small). Data can say nothing: the Skycrane gives every Tempest Rising vehicle the same room (the Shieldmaiden is large on it), the Tempest Sphere's crush group is above the tank's, a case the rule leaves open, and the Vimana has no data (sized huge from lore words). Iron Harvest has no tank to measure against, and its mech weight words are read both ways: the Grimbart is medium as a light mech, the other four mechs were sized from other examples or the Kaiser's Mega Mech label. Units: `generals.china.overlord`, `generals.usa.sentry-drone`, `tempest-rising.gdf.shieldmaiden`, `tempest-rising.dynasty.tempest-sphere`, `tempest-rising.veti.vimana`, `iron-harvest.saxony.grimbart`, `iron-harvest.rusviet.nakovalnya`, `iron-harvest.usonia.stark`, `iron-harvest.polania.mocny`, `iron-harvest.saxony.kaiser`.
- *Fix:* Order the game data (a footprint before transport room); use a stand-in only when it tells units apart; let a size group above the tank's give large unless a figure shows twice its size; and make a unit that fills an infantry seat in any of the game's transports small. With no stand-in, the nearest example decides, with an uncertain entry; lore words about bulk never measure. Mech classes are example words only where the registry note maps them (Iron Harvest: light medium, medium and heavy large, mega huge), and a game with no tanks measures against its cost-anchor units. Nine units stay as coded; the Nakovalnya, whose workshop builds light mechs (job j13's size hesitation and its body/size uncertain entry), moves to medium unless the map binds only units coded as walkers (it is coded a vehicle) or the self-propelled-gun example wins, and the rule must say which. *Alternative:* Reword the mech examples without weight words and let each registry note place its game's mech classes.
- *Raised by* 10 reports (Kaiser coder A, Kaiser coder B, j02, j04, j06, j07, j08, j11, j12, j13).

**2. The speed lists of mobility types leave out real units' speeds**
- *Rule:* Mobility types: on foot is "only with speed bands: Slow, Medium, Fast"; wheels take Medium to Very fast, many legs Slow to Very fast, hovering flight Medium to Very fast, and tracks Very slow to Fast. Two legs allow Very slow.
- *Problem:* Seven units carry an atypical speed line. Very slow, at 0.45 to 0.60 of the rifle squads' pace: the Kaiser, the Mocny and the Stark on many legs, William Mason in his exosuit on foot and the Nakovalnya on wheels. Very fast on tracks: the Sentry Drone, a small tracked robot three times the Ranger's speed. Slow in hovering flight: the Vimana, a slow anti-grav fortress (airship fits its pace and bulk but means lighter-than-air flight). The Kaiser's reconciler calls these lines evidence that the lists are too narrow, and the Wotan will carry one too. Units: `iron-harvest.saxony.kaiser`, `iron-harvest.polania.mocny`, `iron-harvest.usonia.stark`, `iron-harvest.usonia.william-mason`, `iron-harvest.rusviet.nakovalnya`, `generals.usa.sentry-drone`, `tempest-rising.veti.vimana`.
- *Fix:* Add Very slow to many legs (perhaps only at large and huge size), to on foot (perhaps only with the power-suit body) and to wheels; allow Very fast on tracks for drones or tiny and small units; allow Slow in hovering flight from T3 for heavy craft, or let airship cover any slow, looming flier. The seven atypical lines go. *Alternative:* Keep the lists for generated cards, keep the atypical lines as the record of real games, and say so in the mobility list's description so coders stop raising it.
- *Raised by* 7 reports (Kaiser coder A, Iron Harvest reconciler, j04, j08, j11, j12, j13).

**3. Weapon families' damage lists are narrower than the games' damage types**
- *Rule:* armament[].damage step 4 takes the game's mapped type "even when the family's list leaves it out", records the break in atypical and never changes the family; step 5's exceptions apply only "when the family allows the type". Blades allow only melee, electric and energy damage, drone-launcher only explosive, kinetic and EMP, tesla only electric, and cannon only armour-piercing and explosive.
- *Problem:* Five units carry such a line: the Enlightened's fists (kinetic on blades), the Tempest Sphere's roller (explosive on blades), the Drone Operator's drone missiles (armour-piercing on drone-launcher), the Voltaic Tank's beam (armour-piercing on tesla) and the Technical's salvaged cannon (kinetic on cannon; see item 98). The other way round, the Stark's jackhammer is built to break armour and hits heavier armour hardest, but blades cannot be armour-piercing, so step 5 never applies and anti-armour fails (a fit_note asks for it). Units: `tempest-rising.veti.enlightened`, `tempest-rising.dynasty.tempest-sphere`, `tempest-rising.gdf.drone-operator`, `tempest-rising.dynasty.voltaic-tank`, `generals.gla.technical`, `iron-harvest.usonia.stark`.
- *Fix:* Widen the lists where the break is normal for the kind of weapon: kinetic on blades (blows a game types as bullet damage), armour-piercing on blades (hammers, drills and saws built against armour, with step 5 deciding) and armour-piercing on drone-launcher. Keep tesla electric-only and the Voltaic Tank atypical, since one game types its electric weapons as cannon fire. The Sphere's slam goes with the ram family (item 59). *Alternative:* No change: the lines stay as evidence for the word-list review, and anti-armour's requires gain a route for a melee weapon the sources build against armour, as infest-vehicle is one now.
- *Raised by* 4 reports (j05, j07, j09, j12).

**4. roles.secondary step 1: which official text calls the unit by a role**
- *Rule:* roles.secondary step 1: "Official text calls the unit by the role label or one of its aliases." The roles word list counts official words only "when they describe the unit's own job".
- *Problem:* R1 item 56, still open. The Zero Hour manual's tactics pages list Technicals as the GLA's group for recon attacks (scout at step 1, as coded). An official line calls the Sentry Drone's upgrade gun anti-personnel; the coder read it as naming the gun, so anti-infantry ranks at step 5. The 2.0.0 notes move the Enlightened into the game's Support selection group (coded as calling it support). A change log says Anna's bear now heals friendly infantry; her support rests on it, since the heal is a passive no other step ranks. The Engineer's support ranks first on a change log that has every side's engineers repair allied units and remarks on players who like support play. Units: `generals.gla.technical`, `generals.usa.sentry-drone`, `tempest-rising.veti.enlightened`, `iron-harvest.polania.anna-kos`, `iron-harvest.shared.engineer`.
- *Fix:* Say that step 1 counts official text that names this unit, or every unit of its kind, for a job (its designation, its description, or advice that sends it to that job), a companion's job included; that a label on one of its weapons counts where that weapon counts; and that a selection or hotkey group, or a passing remark about play styles, names no role. Only the Enlightened's order changes (buffer first, support at step 2 through Sacrifice); the Engineer keeps support through the repair line. *Alternative:* R1 item 56's fix (only text that names the unit counts at step 1; text about a part supports the role at step 2): Anna loses support and the Engineer ranks anti-armour first; the Technical keeps scout, since the manual's tactics text names Technicals. Only a stricter rule that counts a designation or description alone, never tactics advice, also makes the Technical transport and raider.
- *Raised by* 5 reports (j02, j04, j09, j10, j13).

**5. Matchups rule 5: who harms no enemy, and when counters may be empty**
- *Rule:* Matchups rule 5: a unit "that harms no enemy with a weapon or an ability" lists in counters only what it slips past or foils, and leaves counters empty when the sources name nothing; the validator reads weapons only. Weapon entries rule 7: riders who fire their own guns from ports give no entries.
- *Problem:* The Battle Bus and the Combat Chinook have no weapon; their riders shoot out of them. Job j01, which coded both, kept each unit's counters to what it foils by itself (Hijackers, missiles); if riders' fire were the carrier's harm, the bus's counters would hold infantry and buildings. The Thunderhead has no weapon but strikes back at close attackers (Arcing): by the text it harms with an ability, yet it keeps an empty list, which only the validator allows. Armed units that no source shows winning must still name a counter: the Line Officer and the Enlightened each got a reasoned one, and a first one on the Enlightened contradicted its own countered_by (removed in the merge pass, L4). Units: `generals.gla.battle-bus`, `generals.usa-air-force.combat-chinook`, `tempest-rising.veti.thunderhead`, `tempest-rising.dynasty.line-officer`, `tempest-rising.veti.enlightened`.
- *Fix:* Say that fire from riders' own weapons is the riders' harm, so such a carrier follows rule 5 and what its riders beat goes in combos (as coded). Say that a strike back that only answers an attack does not make a unit one that harms enemies (the Thunderhead stays as coded), or have the validator also read damaging abilities. Keep the duty of a counter for armed units. *Alternative:* Let any unit leave counters empty when no source names a win, as combos may be.
- *Raised by* 4 reports (j01, j06, j08, j09).

**6. Matchups rule 1: no set link for 'fighters' or 'faster units'**
- *Rule:* Matchups rule 1 names the other unit by its job, then by what it fires, then by what it is, and says how to link tanks; rule 2 uses a layer link "only when the point holds for one layer"; rule 4 allows comparators in countered by for a group of units. Nothing maps 'fighters' or a speed word that compares.
- *Problem:* The Aurora Bomber's tooltip names fighters as a threat. The coder chose target:high-air, which also covers bombers that cannot attack it, beside a role:anti-air entry for the tooltip's anti-air units. Iron Harvest pages say only that faster or more agile units beat slow mechs; four coders wrote speed:>=medium (the rifle squads' pace or faster, since speed:>=fast would cover almost no ground unit), a reading written nowhere. Units: `generals.usa.aurora-bomber`, `iron-harvest.saxony.kaiser`, `iron-harvest.polania.mocny`, `iron-harvest.saxony.grimbart`, `iron-harvest.rusviet.nakovalnya`.
- *Fix:* Add sentences like the one for tanks. Fighters named as a threat are role:anti-air, merged into an existing role:anti-air entry; a layer link is for a point about where they fly (the Aurora's target:high-air entry merges). When the sources say only that faster units win, link speed:>= the band of the game's speed reference for a slow or very slow unit, or the band above its own for a faster one, and say in the reason how much faster that is (the mechs stay as coded). *Alternative:* Always use the band just above the unit's own; the four very slow mechs move to speed:>=slow.
- *Raised by* 3 reports (Kaiser coder B, Iron Harvest reconciler, j04).

**7. Damage step 5 and labels: which words make a weapon armour-piercing**
- *Rule:* armament[].damage step 5 gives armour-piercing "when the sources call the weapon anti-tank or anti-armour, say it is built to kill vehicles, or give it a bonus against armoured targets". can_target step 3 defines a label as wording that names the weapon by its job or its targets, and says "A label on the unit, such as its role, does not count"; step 5 has no such sentence.
- *Problem:* The Mocny's walking cannon is armour-piercing only because the wiki calls the walking Mocny an anti-mech unit, a label on the unit; without it the shell's blast would give explosive. The Kaiser's cannon passes on prose that names it the main weapon against armour. William Mason's autocannon stays explosive although the wiki calls its shells armour-piercing. Jarmen Kell's wiki infobox lists the real-world rifles behind his guns, one marked anti-armour; whether such lore words are a label, or call his snipe anti-armour, is open (it changes nothing for him). Units: `iron-harvest.polania.mocny`, `iron-harvest.usonia.william-mason`, `iron-harvest.saxony.kaiser`, `generals.gla.jarmen-kell`.
- *Fix:* Tie step 5's first exception to can_target step 3's label: the words must name this weapon by its job or its targets; a label on the unit counts, but only for its main weapon; rounds called armour-piercing count as calling the weapon anti-armour; and words about a weapon's real-world model are never a label. Mason's autocannon becomes armour-piercing; the Mocny and the Kaiser stay as coded. *Alternative:* A label on the unit never counts here, as in can_target step 3, so the Mocny's walking cannon becomes explosive; for Kell alone, a Generals note could say the infobox's lore field is no label (a batch change).
- *Raised by* 6 reports (Kell coder A, Kell coder B, Kaiser coder A, Kaiser coder B, j11, j12).

**8. Confidence: which pages the High or Medium tie-break reads, and whether a guide counts (already named to Mustafa)**
- *Rule:* Confidence levels, High or Medium tie-break: drop to medium when established sites contradict each other on a point that decides a coded term and "no official text settles it". sources[]: "Confidence counts only the cited pages", and another established site is cited rather than a third page of one site; yet the same field makes the sources the cited pages plus every page an uncertain entry names, and "every rule reads that same set". Neither says what an established site is, or which of the two sets the tie-break reads.
- *Problem:* Jarmen Kell's two opening coders read the same pages and split. Coder A cited CNCNZ, a guide the R1 notes make the other site for the third-page rule; it shows his snipe as instant, against the wiki and the 1.04 files, so A coded medium. Coder B cited a 1.04 file, only named CNCNZ in an uncertain entry and coded high: the level turns on which page fills a free slot. The Battle Bus is medium only because CNCNZ says it crushes soldiers after a salvage step. A wiki against the 1.04 files (kind database) is not covered either, and the Nakovalnya's coder asked whether a Steam guide is a second site. The Voltaic Tank is high only because the Tempest Overflow page, whose list clashes with its other pages on a point that now decides its primary role (item 94), is named in an uncertain entry, not cited. Night decision N4 keeps the current practice until the round (judge on the cited pages, cite CNCNZ for Generals, log every clash). Units: `generals.gla.jarmen-kell`, `generals.gla.battle-bus`, `iron-harvest.rusviet.nakovalnya`, `tempest-rising.dynasty.voltaic-tank`.
- *Fix:* The opening check's final draft (option O2 as its skeptic corrected it): the tie-break reads every page the sources include, cited or named in an uncertain entry; official, wiki and database pages are established sites, but a guide, video or community page never is, so a clash only such a page raises keeps its uncertain entry without dropping the level; and only cited pages can lift confidence to high. This rule change would replace N4. Kell and the Battle Bus become high; the Voltaic Tank drops to medium unless the batch rules its Overflow list a copying slip (item 94), because the whole-set reading counts its uncited Tempest Overflow page; no R1 unit changes. *Alternative:* Option O3 also lets a game file the registry names as the game's own data settle a point, reversing an R1 call and lifting two R1 units; option O1, a Generals note only, leaves the cause for R4.
- *Raised by* 5 reports (Kell coder A, Kell coder B, Generals reconciler, j01, j13) and the opening split's analyst and skeptic.

**9. roles.secondary step 2: buttons whose harm is unusual, splash buttons and built turrets**
- *Rule:* roles.secondary step 2: a button with extra damage against one kind of target, one that "harms only one kind of target" or one a source labels supports that anti role, which "may meet its requires through the button's damage and targets, read as for a weapon". A splash weapon gives anti-infantry at step 3. The engineer, area denial or support tie-break makes turrets that guard ground area denial.
- *Problem:* Jarmen Kell's Sniper Attack kills a vehicle's crew and leaves the hull whole; its damage name (KILL_PILOT) is not in the Generals map and a button has no family, so it is unclear whether it harms vehicles and how its damage is read (two step-1 roles filled both slots, so nothing changed). The Combat Chinook's Combat Drop clears a building through the Rangers it drops; the coder counted it for anti-infantry. The Nakovalnya's Bombardment, a button of lobbed rockets with a wide blast, gives no role, though as a weapon it would give anti-infantry; its secondary list is empty. The Engineer's anti-air turret harms only aircraft, but the coder turned it away with the tie-break above. Units: `generals.gla.jarmen-kell`, `generals.usa-air-force.combat-chinook`, `iron-harvest.rusviet.nakovalnya`, `iron-harvest.shared.engineer`.
- *Fix:* Say that a button that takes a target out of the fight without lowering its health harms it, as damage step 2 says for weapons; that a damage name the registry leaves out is read at damage step 5; that harm done by troops a button delivers counts when the sources give that attack as the button's job (as coded); that a button whose hit is a blast over an area supports anti-infantry at step 2; and that the tie-break chooses only among engineer, area denial and support, so a built turret that harms only aircraft supports anti-air (recorded in atypical). *Alternative:* Keep step 2 as written and say outright that a splash button and a built turret give no anti role there.
- *Raised by* 4 reports (Kell coder A, Kell coder B, j01, j13).

**10. A role's requires shut out the job the sources give**
- *Rule:* Roles: "A source unit never claims a role whose requires it fails." Anti-armour needs armour-piercing, energy, electric or EMP damage or the infest-vehicle pattern; scout needs speed, stealth, a mark, long sight, a sensor or a reveal; marksman needs a sniper weapon that reaches long or further; area denial needs a lingering-zone weapon or a pattern of the area or summon category.
- *Problem:* R1 item 10, which the 1.1.0 round dropped (requires stay a test of the unit's parts, and fit_notes keep the wanted role for later review), meets five new cases. The Tempest Sphere runs over battle tanks and its Codex names tanks first among what it beats, but its kills come from the crush trait and its slam is explosive. The Drone Operator scouts over cliffs with his hand-flown drone, but no stock part meets scout's requires. The makers call Anna Kos a sniper and her rifle is in the sniper family, but it reaches about 1.39 times the reference rifle (medium), so marksman fails. Anna also wants scout, which the wiki names among her specialities, but she is not fast, no source gives her long sight, and she has no sensor trait, stealth, mark or reveal. The Battle Bus wants area denial for its bunker, a fortification its riders fight from, but it has no lingering-zone weapon and no area or summon pattern. Each case has a fit_note at roles; the Stark's anti-armour is item 3. Units: `tempest-rising.dynasty.tempest-sphere`, `tempest-rising.gdf.drone-operator`, `iron-harvest.polania.anna-kos`, `generals.gla.battle-bus`.
- *Fix:* Keep the 1.1.0 decision for anti-armour, scout and area denial, with the fit_notes kept for the review. For marksman, let a main weapon of the sniper family that the game's official text calls a sniper weapon meet the coding rule and requires, whatever its band: Anna would take marksman at step 1, ahead of support, and disabler would drop out at the cap of two. *Alternative:* Also let anti-armour accept the crush trait on a unit that runs over vehicles, scout the launch-drones pattern when the drone is steered by hand, and area denial a fortification form the unit takes; or keep marksman as it is too.
- *Raised by* 4 reports (j01, j05, j07, j10).

**11. No body plan for a scout car, a rolling sphere or a floating alien hull**
- *Rule:* Body plans: open-mount "needs crew or riders who sit exposed"; box-carrier is an enclosed hull with a passenger compartment; hull-turret is for tanks; casemate has a forward-fixed main gun; rotorcraft is "A helicopter or VTOL airframe"; disc is "A saucer or flying disc", at tiny to large size only.
- *Problem:* Four units took the nearest plan, each with a fit_note. The Sentinel, a light scout car with one minigun, no passenger room and no source on its crew: open-mount. The Tempest Sphere, an armoured ball whose whole hull is the weapon: casemate. The Thunderhead, a hovering hull with no rotors or wings: rotorcraft. The Vimana, a flying stepped pyramid: disc, which also breaks disc's size list at huge. R1 item 53 (a hovering humanoid robot) is a different body-plan gap, also still open. Units: `tempest-rising.gdf.sentinel`, `tempest-rising.dynasty.tempest-sphere`, `tempest-rising.veti.thunderhead`, `tempest-rising.veti.vimana`.
- *Fix:* Let open-mount also cover a light car with one gun and no passenger room when no source shows its crew enclosed, or add an armoured-car plan; add a plan for a hull that is itself the weapon, or let casemate cover it; and add a plan for a floating hull that is neither a helicopter nor a saucer, at sizes up to huge from T3, which would also take the Vimana. *Alternative:* Allow disc at huge from T3 for the Vimana, and keep the other three as fit_notes.
- *Raised by* 3 reports (j05, j07, j08).

**12. A typed link cannot be limited to ground units**
- *Rule:* Matchups rule 3: "a link false for only a few of the units it covers stays". Rule 6: the same enemy may sit in counters and in countered by only when the two reasons name different situations.
- *Problem:* Several counters links also cover batch aircraft that the unit cannot hit and that its own countered_by class:aircraft says beat it: Jarmen Kell's role:transport covers the Chinooks, the Sentry Drone's role:siege the Aurora Bomber, the Technical's armour-class:light the aircraft the Generals armour map makes light (about two fifths of the units it makes light) and the Line Officer's role:engineer the Thunderhead. The merge check's skeptic found this allowed as written (L7, not confirmed), but a generator reading both lists sees the same enemies beaten and beating, and the Sentry Drone's coder left armour-class:light out for this reason. It is what remains after R1 item 22's 1.1.0 wording. Units: `generals.gla.jarmen-kell`, `generals.usa.sentry-drone`, `generals.gla.technical`, `tempest-rising.dynasty.line-officer`.
- *Fix:* Let one matchup entry hold two links that must both hold (armour-class:light with target:ground-vehicle), and teach the validator and the generator to read both; Kell's, the Sentry Drone's and the Technical's entries gain target:ground-vehicle beside their link, and the Line Officer's role:engineer gains target:infantry, since its reason names unarmed engineers on foot such as the GDF Engineer. *Alternative:* Keep single links and say in rule 3 that a counters link may not cover a whole air layer the unit cannot hit: use the narrower link and name the rest in the reason.
- *Raised by* 1 report (j04) and the merge check (L7).

**13. No place to record a pattern variant**
- *Rule:* Pattern links hold pattern ids only ("Link any registered id"); a source unit has no field for a variant.
- *Problem:* The Hacker's task asked for a capture-structure variant that does not exist, and no field could have held one anyway, so only the id is stored. Other units name the variant that covers them only in free text: Jarmen Kell's crew-snipe (hijack-vehicle), the Combat Chinook's storm-a-garrison (drop-in-from-above) and the Aurora Bomber's attack-run (become-invulnerable). Units: `generals.china.hacker`, `generals.gla.jarmen-kell`, `generals.usa-air-force.combat-chinook`, `generals.usa.aurora-bomber`.
- *Fix:* Add an optional variant id beside each pattern link on weapons and abilities, which the validator checks against the pattern file's variants. *Alternative:* Say that the variant is named in the weapon's or ability's summary.
- *Raised by* 1 report (j03).

**14. Body plan of a walker on many legs with a fixed main gun (already named to Mustafa)**
- *Rule:* Body plans: casemate has a forward-fixed main gun, but takes only ground vehicles and hovercraft on wheels, tracks or hover, at medium or large size; spider-frame is "A body slung between several visible legs". The only tie-break on the gun decides between casemate and hull-turret by where the main gun sits, and the word lists call a class left out "a hard ban".
- *Problem:* The two opening coders split on the Kaiser: coder A chose spider-frame, the one plan that breaks nothing; coder B and the reconciler chose casemate, with three atypical lines (walker class, many legs, huge size). Nothing ranks spider-frame against a hull body. Night decision N3 made spider-frame the interim reading in the Iron Harvest notes, so the Kaiser and the Mocny are spider-frame, each with an uncertain entry and a fit_note at body/plan; the Stark is spider-frame under either reading. The Wotan and R4's legged walkers will meet the same case. Units: `iron-harvest.saxony.kaiser`, `iron-harvest.polania.mocny`, `iron-harvest.usonia.stark`.
- *Fix:* The final fix in `research/r3/opening/splits.json` (option A, narrowed by its skeptic): a fourth body tie-break makes a walker on many legs whose main weapon is fixed facing forward, or sits in a mount that does not turn all the way round, spider-frame, unless it is a launcher rack, a troop carrier or a creature; its other weapons never change that, and the casemate or hull-turret tie-break is for vehicles and hovercraft only. This rule change would replace N3. The Kaiser and the Mocny drop their interim entries at body/plan. *Alternative:* Option C: open casemate to walkers (rare), many legs and huge size, deciding by the main gun on legs too; the two units move to casemate by a mechanical recode, and the generator starts rolling fixed-gun walkers.
- *Raised by* 5 reports (Kaiser coder A, Kaiser coder B, Iron Harvest reconciler, j11, j12) and the opening split's analyst and skeptic.

**15. Infiltrator: work done from outside**
- *Rule:* infiltrator's description: gets inside enemy units or buildings, or passes as one of them, "to spy, steal or sabotage"; its tie-breaks: "Infiltrator needs spying, theft or sabotage from inside", and a charge stuck to a tank gives the anti role for that unit. roles.secondary step 1 reads official labels.
- *Problem:* R1 item 55, still open: the description and the tie-break disagree. Jarmen Kell's manual Purpose says Base Infiltration, so infiltrator ranks at step 1, but he never gets inside: he kills a vehicle's crew from range and another soldier climbs in. The rules do not say whether a role named at step 1 must still pass the tie-break; if it must, anti-armour from the Sniper Attack takes the slot. The Hacker shuts buildings down with a virus from a short distance, read as sabotage inside the building's systems. Olga Morozova, a hidden agent who sets charges on mechs and buildings, gets infiltrator from no step (item 17), and the tie-break would send charges set from outside to anti-armour. Units: `generals.gla.jarmen-kell`, `generals.china.hacker`, `iron-harvest.rusviet.olga-morozova`.
- *Fix:* Make the tie-breaks match the description and widen both: infiltration is spying, theft or sabotage done to an enemy unit or building from inside, by hacking it at close range or by a hidden agent's charges, or passing as the enemy. Say that a role official text names at step 1 needs its description to fit, while a tie-break only chooses between two terms that both fit. Kell and the Hacker stay as coded. *Alternative:* The tie-break binds at step 1 too: Kell's second slot goes to anti-armour (recorded in atypical), the Hacker keeps infiltrator only if hacking a building counts as from inside, and Olga's charges can give only an anti role.
- *Raised by* 5 reports (Kell coder A, Kell coder B, Generals reconciler, j03, j10).

**16. Crew: weapons count as firing one at a time when the sources do not say**
- *Rule:* Crew models, driver-gunner coding rule: "If the source doesn't say whether two weapons fire together, count them as one at a time."
- *Problem:* RTS pages rarely say that two weapons fire at the same moment, even when each clearly has its own target. The Kaiser's four side machine guns cover every side and fire on the move beside the cannon, the Mocny's machine gun sits in a turret of its own, and the Stark's flamethrower swivels on its own side mount. All stay with the driver by this default: the Mocny and the Stark are solo, and the Kaiser is driver-gunner only through its veteran rockets (item 23). The player versions lose the gunner seat these units seem to have. R1 item 57 (copies of one gun on separate mounts), still open, is a neighbouring question. Units: `iron-harvest.saxony.kaiser`, `iron-harvest.polania.mocny`, `iron-harvest.usonia.stark`.
- *Fix:* The reconciler's proposal: in a commanded game, where the sources give each weapon its own reach and reload under one attack order, weapons on separate mounts count as firing together unless a source says otherwise. The three units would go to driver-gunner, falling back to full control. *Alternative:* Keep the default and accept solo for such units, naming the possible gunner seat in crew.notes as a design idea.
- *Raised by* 5 reports (Kaiser coder A, Kaiser coder B, Iron Harvest reconciler, j11, j12).

**17. Armed units whose job is a button or another official line fall to assault**
- *Rule:* roles.primary step 1 reads the designation or else the official one-line description; step 2 reads the main button only for a unit that is unarmed, armed only with a tool, or built to carry, supply, build or spy with guns fired from other seats; step 4 reads the main weapon only; step 5: "Otherwise assault."
- *Problem:* R1 item 39, still open, in a wider form. The Drone Operator's tooltip names his drone's targets but no role, his main weapon is the pistol with no bonus, and the makers' line calling him anti-tank infantry counts only for second roles: assault, with a fit_note asking for anti-armour. The Enlightened's designation names no role and its weak fists do damage, so step 2 never reads its Sacrifice button: assault, with a fit_note asking for buffer or support. Olga Morozova, a hidden saboteur whom the makers call an assassin, has a submachine gun, so step 2 is skipped; with no role line and no speed figure she is assault, with fit_notes asking for infiltrator and anti-armour. Units: `tempest-rising.gdf.drone-operator`, `tempest-rising.veti.enlightened`, `iron-harvest.rusviet.olga-morozova`.
- *Fix:* At step 1, when the designation or one-line description names no role, read the newest other official text that calls the unit by a role label or alias (a patch note's design line), still skipping roles whose requires fail. And let step 2 also take a unit built to spy or sabotage, or whose sources give its job through its main button, when its own gun only defends it. The Drone Operator becomes anti-armour, the Enlightened support or buffer, and Olga infiltrator (with item 15). *Alternative:* Only the step 2 widening (R1 item 39's fix, widened): it helps the Enlightened and Olga, and the Drone Operator stays assault.
- *Raised by* 3 reports (j05, j09, j10).

**18. Mark: a tag with no team reveal**
- *Rule:* Weapon traits: mark "Tags the target so the whole team sees it and hits it harder for a time." The Tempest Rising notes: a weapon that marks takes the mark trait.
- *Problem:* Tempest Rising's Marked status gives Intel when the target dies and more damage from Networked weapons; no page shows a reveal. The Sentinel's minigun and scanner rounds and the Shieldmaiden's doctrine laser take mark anyway, the Shieldmaiden with a fit_note. The Tempest Sphere's roller makes its target take more damage from every source for a while, with no reveal; it got no trait and a fit_note, because mark also reveals. Units: `tempest-rising.gdf.sentinel`, `tempest-rising.gdf.shieldmaiden`, `tempest-rising.dynasty.tempest-sphere`.
- *Fix:* Split the trait's two effects, or let mark cover a tag that makes the target take more damage, with or without a reveal, and say in the summary which it does; a bounty paid when a marked target dies goes in the summary. The Sphere's roller could then take mark.
- *Raised by* 3 reports (j05, j06, j07).

**19. The accessed date for pages read from the page cache**
- *Rule:* sources[].accessed: "Date the page was read."
- *Problem:* Most pages came from the shared page cache. Jarmen Kell's two coders wrote the day they read the page and put the cache's fetch date in the source note, as R1 did; job j02 wrote the fetch date instead. So the Technical's and the Overlord's wiki and string-table sources carry the fetch dates (19 and 20 October), while the other units carry reading dates. R1's batch item 3, settled in the RA2 notes, counted a cache copy as read but did not say which date goes in accessed. Units: `generals.gla.jarmen-kell`, `generals.gla.technical`, `generals.china.overlord`.
- *Fix:* Say in the field: the date the coder read the page, and for a copy read from a cache, the cache's fetch date in the source note. Then align the Technical's and the Overlord's dates (a data fix). *Alternative:* Put the fetch date in accessed, since that is the copy the entry rests on, and align the other units instead.
- *Raised by* 3 reports (Kell coder A, Kell coder B, j02).

**20. A soldier's partner that fights on its own: a drone or an animal**
- *Rule:* body.count is "Bodies per purchase" and body.plan holds one shape; squad needs soldiers who move as one. The aim tie-break's step 2 gives auto-target to "launched drones that act on their own", which the humanoid body's mount list leaves out. A passive or triggered entry needs a source that describes the effect as a distinct state or behaviour.
- *Problem:* No rule covers a soldier whose partner fights by itself. The Drone Operator's drone and Anna Kos's bear Wojtek both get auto-target, so both units carry the line 'bodies:humanoid allowed.aim-models auto-target'. Wojtek is always with Anna: body.count 2, the plan humanoid with a fit_note for the beast, and his maul a secondary blades weapon. Olga's tiger Changa waits out of sight: no count, and its short fight after she dismounts is a triggered entry of its own, though the sources describe it only inside the Ride the Tiger text. The two coders treated the companions differently on purpose. The pattern side is settled (command-companion). Units: `tempest-rising.gdf.drone-operator`, `iron-harvest.polania.anna-kos`, `iron-harvest.rusviet.olga-morozova`.
- *Fix:* Write a companion rule: an AI partner bought with the unit that fights on its own is part of the unit; body.count counts it when it is always on the field; body.plan describes the player's own body and body.notes the partner; the crew stays solo; the partner's attack is a secondary weapon with an auto-target mount; and a behaviour of the partner that the sources tune on its own is its own entry linking command-companion. Allow auto-target on the humanoid and power-suit bodies for a weapon that acts on its own away from the body, so the two atypical lines go. *Alternative:* Keep the partner out of armament and body.count, and describe it only in its command-companion ability.
- *Raised by* 2 reports (j05, j10).

**21. No mobility type for a rolling ball, or for wheels pushed by legs**
- *Rule:* Unit classes: a vehicle is "A wheeled or tracked ground vehicle", a walker "A vehicle on legs". Mobility types: wheels turn in arcs; many legs means three or more legs.
- *Problem:* The Tempest Sphere moves as one rolling ball (the game's Roller): coded wheels, as one big wheel, with a fit_note. The Nakovalnya rolls on two big wheels pushed along by three small legs, and the game counts it a mech: coded a vehicle on wheels, with a fit_note (and the very slow line of item 2). One knock-on: the Engineer's counters link class:walker (its mines go off under mechs) leaves the Nakovalnya out. Units: `tempest-rising.dynasty.tempest-sphere`, `iron-harvest.rusviet.nakovalnya`, `iron-harvest.shared.engineer`.
- *Fix:* Add a tie-break: a unit carried on wheels is wheels however the wheels are driven, its class follows its mobility, and legs that only push it go in mobility.notes. Add a rolling mobility type, or let wheels cover a single ball with a note. *Alternative:* Let the class follow what the game calls the unit (a mech is a walker) and the mobility what carries its weight, recording the class break as atypical.
- *Raised by* 2 reports (j07, j13).

**22. Fallen heroes who are never removed: downed-revive and the on-death default**
- *Rule:* Armour models: downed-revive is "At zero health it goes down instead of dying: it can crawl, and a teammate can revive it or an enemy finish it." on_death.basis: a unit that is simply gone takes the 3C default, respawn for infantry, and respawn means "Nothing is left: the unit is simply gone."
- *Problem:* An Iron Harvest hero at zero health falls unconscious: it cannot be targeted, does not crawl, and any friendly infantry revive it for free, so it is never removed. The notes give heroes downed-revive, with armour.notes saying how it differs. on_death then falls to respawn, which says the unit is gone, and no on-death term fits a body that teammates revive in the field (wreck is barred for organic units). Anna Kos and Olga keep respawn as a proposal; William Mason's dismounted form also takes downed-revive. Units: `iron-harvest.polania.anna-kos`, `iron-harvest.rusviet.olga-morozova`, `iron-harvest.usonia.william-mason`.
- *Fix:* Widen downed-revive's meaning: the unit goes down instead of dying and a teammate can revive it; whether it can crawl and whether an enemy can finish it vary by game, and armour.notes says which. Add to on_death that a unit whose only end is its armour model's downed state keeps the 3C default as a proposal, with the revival in on_death.notes. *Alternative:* Add an on-death term for a body that stays on the field to be revived (the infantry counterpart of wreck), coded in-game for Iron Harvest's heroes.
- *Raised by* 1 report (j10) and the Iron Harvest notes (Fallen heroes).

**23. Parts that only a veteran gets: mobility traits, roles and crew**
- *Rule:* Stock values: every band describes the stock unit with "no veterancy", but that covers bands only; sensors.traits sends a sensor from veterancy to sensors.notes, while mobility.traits has no such rule. roles.primary counts weapons in the primary, secondary and alternate slots and innate buttons as what every copy has; roles.secondary step 2 needs "A button or mode that every copy has"; the driver-gunner rule says nothing of weapons a veteran button opens.
- *Problem:* The Kaiser's Entrench and the Nakovalnya's Sentry Mode open only at the first rank, yet both units keep deploy-anchor, so the trait reads as stock. On the Kaiser, Entrench gives nothing at step 2, but the rockets it uncovers (a secondary weapon with the mode since N1) count at step 3 and alone make the crew driver-gunner. On the Nakovalnya, the veteran Sentry Mode rockets sit in the alternate slot, which roles.primary treats as stock, and they are what the validator reads for siege's requires. Units: `iron-harvest.saxony.kaiser`, `iron-harvest.rusviet.nakovalnya`.
- *Fix:* Add to Stock values one rule for parts that need a rank: a key-bound mobility trait is listed whatever its ability's source, with mobility.notes saying it needs a rank; a weapon reached only through a veteran button is not what every copy has, so it ranks at roles.secondary step 5, never meets a role's requires for roles.primary and does not count toward the crew model; and an ability that comes with a rank links the patterns of what it does. The Kaiser goes back to solo, and the Nakovalnya's siege would rest on its innate Bombardment (item 70). *Alternative:* The sensors-style rule throughout: veteran-only traits go to mobility.notes, and veteran-only weapons and their roles to notes.
- *Raised by* 4 reports (Kaiser coder A, Kaiser coder B, Iron Harvest reconciler, j13) and the N1 recode.

**24. roles.primary step 1 when no named role has a target**
- *Rule:* roles.primary step 1: when more than one named role is left, use the one with the bonus; "a role with no target (siege, transport) never wins this test and waits for roles.secondary step 1. If none has a bonus, go on." Step 2 then takes the role whose description fits the main button or main action.
- *Problem:* R1 item 18's 1.1.0 order leaves this case. Jarmen Kell's Purpose entry names scout and infiltrator; both pass their requires and neither has a target, so step 1 goes on and step 3 makes him marksman, a role his official line never names. Both opening coders found the rule clear but the result surprising, and one notes that a coder could easily take the first named role instead. The Combat Chinook's tooltip names transport and logistics; neither has a target, so step 2 must pick the main action of a unit that does both, and the coder chose transport (named first) by judgement. Units: `generals.gla.jarmen-kell`, `generals.usa-air-force.combat-chinook`.
- *Fix:* In step 1, when two or more named roles are left and none of them has a target, take the first one the line names, so the official line still decides. Kell's primary role becomes scout, with infiltrator leading his second roles; the Chinook stays transport, now by rule. *Alternative:* Keep the rule, and say plainly that targetless named roles all wait for roles.secondary step 1, so a later step decides the primary (as coded).
- *Raised by* 3 reports (Kell coder A, Kell coder B, j01).

**25. A second life: no on-death outcome and no armour model**
- *Rule:* On death: wreck needs remains a unit "can repair, recrew or salvage"; bail-out and pilot-eject are crew or a pilot leaving as the unit dies. Armour models: none names a second health pool; ablative plates break off one by one.
- *Problem:* The Battle Bus's lethal hit turns it into a static bunker with fresh, larger health and a building's armour; its riders survive hurt and fight on until it falls. No term covers this, so it is coded bail-out (proposal) and flat-pool, each with a fit_note; the patterns phase gave the mechanic its own id, fortify-on-death, but that settles neither word list. William Mason's exosuit soaks damage, and when it fails, Exit Strategy leaves him on foot with his own, smaller health, to climb into a new suit later: he is coded downed-revive on both forms and pilot-eject on death (item 68), with a fit_note asking for an outer shell over a pilot. Units: `generals.gla.battle-bus`, `iron-harvest.usonia.william-mason`.
- *Fix:* Add one term for a second life: an outer shell or form with fresh health that, once destroyed, leaves the unit fighting in a weaker form. Either an on-death outcome, coded in-game (the Battle Bus's analyst), or an armour model (Mason's analyst). Say in Armour models that a second life is recorded through it and the fortify-on-death pattern, with flat-pool for each life. Both units drop their fit_notes. *Alternative:* Let pilot-eject carry Mason's case whenever the pilot fights on, with the shell's own health in armour.notes, and leave the bus's two fit_notes as the record.
- *Raised by* 2 reports (j01, j12) and the patterns phase (its list for the rule-fix round).

**26. roles.secondary step 2: passive perks and summoned helpers**
- *Rule:* roles.secondary step 2: "A button or mode that every copy has, and the alternate weapon it switches to." No step names an innate passive or triggered ability, or the units a button summons.
- *Problem:* Since the patterns phase linked dampen-missile-fire (category control) to the Shieldmaiden's Missile Interference Aura, she meets disabler's requires, but the aura is a passive, so no step ranks disabler; her slots stay support and scout (step 5, through a doctrine weapon). The patterns integration check noted the same for every new passive or triggered entry. The 2.0.0 notes say the Vimana's summoned Servitors may scout, and no rule says whether a summoned unit's job supports a role for the summoner (today the hedge rule decides, since that line hedges). R1 item 52, on the same step, is also still open. Units: `tempest-rising.gdf.shieldmaiden`, `tempest-rising.veti.vimana`.
- *Fix:* Let step 2 also count an innate passive or triggered ability that every copy has, ranked with buttons: the Shieldmaiden would get support and disabler, and lose scout. Say that a summon button supports roles only through its own patterns, never through what the summoned units do.
- *Raised by* 2 reports (j06, j08) and the patterns integration check.

**27. A splash weapon gives anti-infantry whatever its targets**
- *Rule:* roles.secondary: anti-infantry "for any of those, for a splash weapon, or for small arms" that do little to vehicles. The drop rule reads only official text that calls a target a weak or limited point.
- *Problem:* The Voltaic Tank's beam hurts an area, so it gets anti-infantry, though the game's own data has infantry resist its damage type and no official text calls it good against infantry (kept, with an uncertain entry). The Aurora Bomber's bomb hurts an area, so anti-infantry ranks at step 3, though official text names only buildings and the wiki aims it at buildings and vehicles. Units: `tempest-rising.dynasty.voltaic-tank`, `generals.usa.aurora-bomber`.
- *Fix:* Let a splash weapon give anti-infantry only when the game's data does not show infantry resisting its damage type, and only when no official text names other targets as its main ones, unless a source names soldiers among them. Both units lose anti-infantry. *Alternative:* Keep the clause, and let the candidate test (the role's description must fit a sourced part) drop it case by case.
- *Raised by* 2 reports (j04, j07).

**28. roles.secondary step 5: which riders and add-ons count, and roles the validator cannot see**
- *Rule:* roles.secondary step 5: "Passengers, upgrades, doctrines, option weapons and acquired weapons. Rank these roles by how many of the options give them." A role that enters there may meet its requires through the part that gives it. Only step 2 says the validator reads requires from weapons and patterns alone, so the role goes in atypical.
- *Problem:* The Battle Bus has no weapon; its riders fire from the windows. Step 5 does not say which riders are the options (the main GLA infantry, the generals', captured or allied ones), how to count riders no source shows firing, or whether the tooltip calling the unarmed bus strong against infantry ranks a role above step 5; anti-armour, anti-air and marksman tie at one rider type each, and the list's order gave anti-armour. The Overlord gets scout at step 5 from its Gattling add-on, which detects stealth, though a detector on a slow super-heavy tank may not fit scout's description. In both, the part sits where the validator does not look, so each shows an atypical requires line that step 5 allows. Units: `generals.gla.battle-bus`, `generals.china.overlord`.
- *Fix:* In step 5, say: passengers count as options when they are infantry of the unit's own faction (its generals' included) that a source shows firing from it; official strong-against text about a carrier only supports a role its riders give; a role that enters through a part the validator cannot read is recorded in atypical, as at step 2; and the role's description must fit the unit with that part, so an add-on detector gives scout only when the sources show the unit scouting or hunting hidden units with it. The Battle Bus stays as coded; the Overlord's second roles become support and transport. *Alternative:* Keep scout for any detector part (it is the information part scout's tie-break asks for), and write only the rider and atypical sentences.
- *Raised by* 2 reports (j01, j02).

**29. Crush on medium vehicles**
- *Rule:* crush: "only with sizes: Large, Huge". The Generals game-wide note gives crush to every ground vehicle whose crusher level is above zero and records a smaller one's size break in atypical.
- *Problem:* Every Generals ground vehicle with a crusher level runs soldiers over, trucks included. The Battle Bus and the Technical are medium, so each carries the trait with an atypical line, as the note asks. With R1's two Minelayers and the Gap Generator, five researched units now break the rule the same way. R1's batch item 8 settled this in the batch by recording the break; its alternative, allowing crush on medium vehicles, is still Mustafa's to take. Units: `generals.gla.battle-bus`, `generals.gla.technical`.
- *Fix:* Allow crush on medium ground vehicles and walkers, keeping the sentence that super-heavies also crush light vehicles. The five atypical lines go. *Alternative:* Keep the size rule; the atypical lines stay as the evidence they are meant to be.
- *Raised by* 2 reports (j01, j02).

**30. Jobs done by an order on a target, with no button**
- *Rule:* abilities[]: "One entry per button the unit has in the source". Ability kinds: passive is "Always on", triggered "Happens on an event" (a kill, a death, a hit), and the other five kinds use a key.
- *Problem:* The Combat Chinook gathers supplies when it is sent to a supply dock, with no button for it; the wiki lists it as a passive, but 'always on' does not describe an order, triggered fits no better (an order the player gives is not such an event), and the other kinds need a key. So it is coded passive with an uncertain entry. The Engineer's repairs and its wire cutting may be orders given by clicking the damaged unit or the wire; no source says whether either has a button. The coder coded Repair as a channel ability and folded the wire cutting into the build-cover entry's summary. R1 item 41 (an action aimed with the attack order that does nothing to its target), still open, is a neighbouring case. Units: `generals.usa-air-force.combat-chinook`, `iron-harvest.shared.engineer`.
- *Fix:* Say that a job done on a basic order on a target, with no button of its own (a harvester sent to a dock, a repairer sent to a damaged unit), is an ability entry when it does something the attack order does not, with the order described in its summary, and say which kind it takes (as coded: passive for the Chinook, channel for the repair); an order that only adds a detail to another entry goes in that entry's summary.
- *Raised by* 2 reports (j01, j13).

**31. Weapons a doctrine adds: no slot or source can say so**
- *Rule:* Shared mechanics: a power that gives named unit types "a new button or a new effect is recorded on each of them, with source commander-power", but only abilities have a source field. armament[].slot acquired is a weapon "added or swapped in by a bought upgrade, research or a rank". Paired entries links upgrade-in-field only for an upgrade bought on the unit or for all of them at a building; roles.secondary step 5 counts doctrines and acquired weapons.
- *Problem:* The Shieldmaiden's laser marks under the Pinpoint Weaknesses doctrine, and the Enlightened throw grenades under Refined Enlightenment. Both weapons are coded acquired with the doctrine named in condition (the Shieldmaiden's with a fit_note), since no slot or source can say commander power. No rule says whether a doctrine reaches units already in the field, so upgrade-in-field is left off the grenades. Through step 5, the doctrine laser's mark makes the Shieldmaiden a scout, which its coder thought a stretch. Units: `tempest-rising.gdf.shieldmaiden`, `tempest-rising.veti.enlightened`.
- *Fix:* Let acquired also cover a weapon that a commander power adds or changes, named in condition. Say that upgrade-in-field applies to a doctrine as to research at a building: it reaches units in the field unless a source says otherwise. Say whether a doctrine weapon may give a second role at step 5; today it does.
- *Raised by* 2 reports (j06, j09).

**32. No damage type that ignores armour**
- *Rule:* armament[].damage step 5: a category the map leaves out gives "the family's default damage", with two exceptions the family must allow. The Tempest Rising notes leave the game's Omni type (it ignores armour) out of the map.
- *Problem:* The Sentinel's scanner rounds and the Vimana's cannon deal Omni damage, which ignores every resistance. They fall to kinetic and energy, the family defaults, and the weapon's point is lost; both have fit_notes. Units: `tempest-rising.gdf.sentinel`, `tempest-rising.veti.vimana`.
- *Fix:* Add a damage type for hits that ignore armour and resistances, with no strong or weak links, or a weapon trait that says so.
- *Raised by* 2 reports (j05, j08).

**33. Cost band for a unit that is never bought, or that no source prices**
- *Rule:* cost_band.band: "Null only when units are not bought in the game"; cost_band.raw: "The base price paid to get one unit". cost_band gives no fallback for a unit with no usable price, while the speed rule has one.
- *Problem:* No Enlightened is ever bought: buildings spawn them for free, and captures and Subjugated kills give more. The validator rejects null for Tempest Rising, so very-low stands in, with raw left out and a fit_note. No source read gives Olga Morozova's price (her wiki page and its history, two other wikis, the makers' posts); her coder banded her low by judgement from other heroes' prices, left raw out and added an uncertain entry, borrowing the speed rule's method. Units: `tempest-rising.veti.enlightened`, `iron-harvest.rusviet.olga-morozova`.
- *Fix:* Allow null, or a free value, for a unit that cannot be bought in a game with prices, when the basis says how it is obtained, and have the validator accept it. Give cost_band the speed rule's fallback: with no usable price, leave raw out, band from the prices of units of the same kind in the same game, add an uncertain entry at cost_band, and take the band nearer medium when the judgement sits on an edge.
- *Raised by* 2 reports (j09, j10).

**34. Nature of a construct that names no crew**
- *Rule:* Nature: uncrewed-machine "Only when the source says it is a robot, drone or remote-controlled machine"; when the source says nothing either way, a vehicle, walker, hover, aircraft or naval unit is crewed.
- *Problem:* R1 item 50, still open. The Vimana's page calls it a construct and names no crew, and the Thunderhead's sources describe a hull like a storm cloud and name no crew. Both fall to crewed-machine, and so to bail-out on death as a proposal; the coders weighed uncrewed-machine and respawn. Units: `tempest-rising.veti.vimana`, `tempest-rising.veti.thunderhead`.
- *Fix:* Take R1 item 50's fix: uncrewed-machine also covers a machine the sources show run by no crew (a brain, a computer, a living construct). Say whether the word construct is enough; recommended: only when no source shows people inside.
- *Raised by* 1 report (j08).

**35. No link kind for health**
- *Rule:* Typed links have kinds for class, armour class, cost, availability, immunity and more, but not health. Matchups rule 4 hangs a weakness that compares the unit with its own kind "on the part that exposes it (its armour or health)".
- *Problem:* The Mocny's page calls it fragile for a medium mech, with low health even at the top rank; the weakness hangs on armour-class:heavy, which reads as the opposite. The Stark's weakness that it is rather fragile for its price shares one armour-class:heavy link with a point about its armour class. R1 items 1 and 37, settled in 1.1.0, added cost:, availability: and immune: and wrote that wording, but no kind names health. Units: `iron-harvest.polania.mocny`, `iron-harvest.usonia.stark`.
- *Fix:* Add a link kind for health compared with units of the same kind (rated low, medium or high, as on the Ratings list), so rule 4's "its armour or health" has a part to name. *Alternative:* Let rule 4 name only the armour class, with the health comparison in the reason.
- *Raised by* 1 report (j11).

**36. Confidence: a unit's entry in a patch-note post**
- *Rule:* Confidence levels, high: a page counts only if it is about the unit itself, "its own page, or its own entry in a unit list", and "Patch notes and pages about other units do not count toward high".
- *Problem:* DevBlog #24 introduces the Kaiser in an entry of its own, in a list of new units under the post's patch-note highlights. Both opening coders could not tell whether that is an entry in a unit list (toward high) or patch notes (not), and coded medium. Units: `iron-harvest.saxony.kaiser`.
- *Fix:* Say that an entry about one unit inside a patch-note post counts as patch notes, not as an entry in a unit list. No level changes. *Alternative:* Count a post's own description of a new unit as its entry in a unit list: the Kaiser would rest on official text about the unit and rise to high, unless a clash drops it.
- *Raised by* 2 reports (Kaiser coder A, Kaiser coder B).

**37. can_target lists structures because of one building type**
- *Rule:* can_target: "Every kind of target the weapon can be fired at and hurt in the source, even a little"; for a family that leaves structures out, list them only when the sources say the weapon damages buildings.
- *Problem:* Jarmen Kell's rifle hurts one building type, the Fire Base (and the soldiers in it); every other building is immune. So the rifle lists structure and the sniper family shows an atypical break, which a generator could read as a sniper that attacks buildings. Both coders and the reconciler listed it, with an uncertain entry. Units: `generals.gla.jarmen-kell`.
- *Fix:* List a kind only when the weapon can hurt that kind in general, and name a lone exception, such as one building type, in the summary. Kell's rifle would list infantry only, and its atypical line goes.
- *Raised by* 2 reports (Kell coder B, Generals reconciler).

**38. can_target: a hedged remark that the unit may hit fliers**
- *Rule:* can_target, air: in a commanded game, list low air and high air "only when the sources say the weapon attacks air units". The 1.1.0 rule that words hedging whether a job is done at all do not count is written for roles only.
- *Problem:* The Kaiser page's pros suggest, with a hedge, that it may even shoot at airships, but name no weapon. Both opening coders left air off all three weapons, unsure whether a hedged remark counts or which weapon it would go on; another mech's page says its machine guns hit fliers, which may hold for the Kaiser's too. Units: `iron-harvest.saxony.kaiser`.
- *Fix:* Say that can_target reads hedges as the roles rules do (a remark that hedges whether the weapon can attack a kind of target at all does not count), and that a claim about the unit that names no weapon adds that kind to no weapon. The Kaiser stays as coded.
- *Raised by* 2 reports (Kaiser coder A, Kaiser coder B).

**39. Aim: one entry for copies on mounts that face different ways**
- *Rule:* Weapon entries rule 2: "Copies of one gun are one entry". The aim tie-break's step 3: a gun placed on the side or at the tail of a hull, or in a door, is limited-arc, "one in the nose or the front of a hull is fixed".
- *Problem:* The Kaiser's four ball-mounted machine guns, one on each side of the hull, the front included, are one entry, and so are its three rocket batteries (front and both flanks). By the tie-break the front copy is fixed and the others limited-arc, while together they cover every direction (the rockets all but the rear). Both coders gave each entry the side copies' limited-arc, which no rule picks. R1 item 57 (the crew model for copies of one gun on separate mounts), still open, concerns the same kind of entry. Units: `iron-harvest.saxony.kaiser`.
- *Fix:* Say that one entry for copies on several mounts takes the mount most of its copies have, and that copies which together cover the whole circle count as a full turret (step 5).
- *Raised by* 2 reports (Kaiser coder A, Kaiser coder B).

**40. Stun for a basic weapon's knockdown**
- *Rule:* Weapon traits: stun is "The target can't do anything for a very short time. T2 and up, on a medium or longer cooldown", from T2.
- *Problem:* Anna Kos's rifle knocks surviving soldiers to the ground with every hit, with no cooldown, at t1. It is coded stun, which adds the line 'weapon-traits:stun min_tier t2' and gives her the disabler role. The merge pass settled that the game's general reaction to heavy hits stays off and that stun goes only where a weapon's own sources make flooring soldiers part of its job, naming her rifle (REG-15); what is left is the term, whose meaning ties stun to a cooldown and a tier that a knockdown on every hit does not have. Units: `iron-harvest.polania.anna-kos`.
- *Fix:* Split stun's meaning: any effect that stops the target acting for a very short time is stun; the T2 floor and the medium or longer cooldown apply to stun on a button, and a weapon may carry it at any tier. Anna's atypical line goes. *Alternative:* Use knockback for a hit that throws soldiers down for a moment, with no stun and no disabler role.
- *Raised by* 1 report (j10) and the merge check (REG-15).

**41. Ability source for a side-wide plan switched on at a building**
- *Rule:* Ability sources tie-break: commander-power when the unlock comes from "the side's own power menu or tree, picked during the match outside any building"; upgrade when it is "bought or researched at a building or on the unit".
- *Problem:* The Dynasty's Martial Plan runs from the Construction Yard, paid in power, neither bought nor researched, and it turns on the Voltaic Tank's Tempest Dynamos button. Neither clause fits, so the Tempest Rising notes had to decide: commander-power, through the Shared mechanics rule for side-wide powers. The coder followed them. Units: `tempest-rising.dynasty.voltaic-tank`.
- *Fix:* Add to the tie-break: a side-wide mode or plan switched on at a building, neither bought nor researched, is commander-power (as coded).
- *Raised by* 1 report (j07) and the Tempest Rising notes (Dynasty Plans).

**42. A bonus that holds only against targets carrying a status**
- *Rule:* roles.primary step 4, also used by the step 1 bonus test: a bonus is when "the game data gives the main weapon extra damage against that target". Nothing says what a bonus that depends on a status is.
- *Problem:* The Tempest Rising notes had to decide: a bonus tied to a status counts against the kinds of target that can carry it, so Voltaic Reaction (which destroys an overloaded vehicle outright) is a bonus against armour. Since the merge check (REG-09), the Voltaic Tank's primary role rests on that reading at the step 1 bonus test; without it, it would be assault. Units: `tempest-rising.dynasty.voltaic-tank`.
- *Fix:* Say in step 4 that extra damage against targets in a status that only some kinds of target can carry counts as a bonus against those kinds, as the notes read it. *Alternative:* Say such a bonus does not count; the Voltaic Tank would then be assault.
- *Raised by* 1 report (j07) and the Tempest Rising notes (Strong and weak points).

**43. Stealth trait or cloak pattern for a unit hidden until enemies come close**
- *Rule:* Sensor traits: stealth is "Hard to spot: enemies see it only at close range", with the note "Turning fully invisible, on a key or not, is the cloak pattern." The Iron Harvest notes let coders use either for Olga and the Attucks.
- *Problem:* Olga is invisible until an enemy comes fairly close, and any action shows her: both seen only at close range (the trait) and fully invisible (cloak). Her coder chose cloak on a passive ability and no sensor trait; another coder could fairly choose the trait, and the Attucks will raise the same choice. Units: `iron-harvest.rusviet.olga-morozova`.
- *Fix:* Draw the line in the word list: always-on hiding that enemies see through at close range is the stealth trait; cloak is invisibility that holds at any range until the unit acts or a detector comes near, or that is switched on with a key. Olga would take the stealth trait in place of the cloak ability. *Alternative:* Decide it for Iron Harvest only, in the game notes (a batch change), keeping cloak for Olga.
- *Raised by* 1 report (j10) and the Iron Harvest notes (Stealth and detection).

**44. Raider at step 4 for a bomber**
- *Rule:* roles.secondary step 4: "Raider: fast or very fast with light or no armour"; raider "Hits and runs, picking off isolated targets: fast flankers, gunships that make attack runs".
- *Problem:* R1 item 59, still open, for raider instead of assault: the Aurora Bomber gets raider at step 4 from its speed and armour. Raider's meaning names gunships that make attack runs, which seems to cover it; but a gunship makes pass after pass with guns it keeps firing, picking off what it finds, while the Aurora drops one bomb per sortie and must fly back to its Air Field to reload before it can strike again, so the fit is loose. The coder found the rule clear and the result mechanical. Units: `generals.usa.aurora-bomber`.
- *Fix:* Say that step 4's raider and assault tests are for units that fight with weapons they fire again and again, not for a bomber that makes single runs. With item 27, the Aurora's second-role list would be empty.
- *Raised by* 1 report (j04).

**45. A unit whose only weapon comes with an upgrade**
- *Rule:* Raider's coding rule: "Needs a weapon that is not a tool"; roles.secondary step 4 gives raider from speed and armour, while upgrades and acquired weapons count at step 5. Matchups rule 5: a unit with no weapon at all hangs the lack on the part it carries, or else on its class or armour class.
- *Problem:* The stock Sentry Drone is unarmed; its machine gun comes with an upgrade. Primary step 2 rightly treats it as unarmed (scout). Raider needs a weapon, and only the upgrade gun meets that need; the rules do not say whether it may do so at step 4 or only at step 5. The coder ranked raider at step 4, ahead of anti-infantry (step 5). In the weaknesses, rule 5's clause for a unit with no weapon seemed not to apply, so 'cannot shoot as bought' hangs on weapon:machine-gun, the upgrade gun. R1 item 25's 1.1.0 wording does not decide it. Units: `generals.usa.sentry-drone`.
- *Fix:* Say that a weapon the unit has only through an upgrade meets a coding rule's need for a weapon only at step 5, so raider ranks there beside anti-infantry and the roles list's order puts anti-infantry first. Say in rule 5 that 'no weapon at all' means no weapon as bought, and that such a unit may hang the lack on its upgrade weapon (as coded).
- *Raised by* 1 report (j04).

**46. A vehicle's static or building form: class, body and target**
- *Rule:* modes[]: "Write only the parts that change from the base form", and no class or body plan describes a structure. modes[].target gives the kind that a vehicle that deploys into a building is, "by the Target types rules".
- *Problem:* R1 item 51, still open (there, the Slave Miner's refinery). The Battle Bus's bunker is a fixed fortification, but no class or body plan describes it, so the mode keeps the bus's class and body, with a fit_note. Its target is coded structure, following the wiki, the Garrisoning page and its building armour set, while the 1.04 object keeps a vehicle kind; the coder found no rule on which source decides what kind of target a form is. Units: `generals.gla.battle-bus`.
- *Fix:* As R1 item 51 proposed: a building form keeps the base class and body, is described in the mode's summary, and keeps the base armour unless a source gives the building's. Add to modes[].target that the kind follows how the game treats the form in play (what can attack it, which armour set it takes), not an internal flag; the bus stays structure. *Alternative:* Add a research-only structure class and a fortification body plan for such forms.
- *Raised by* 1 report (j01).

**47. Off-screen for an add-on on a short-sighted unit**
- *Rule:* off-screen's first reason: a weapon long by its reach that "reaches past its own unit's sight figure", reading the carrier's sight "for an add-on or a turret".
- *Problem:* The Overlord's fog figure is half the Ranger's, so its Gattling add-on, long by its reach, bands off-screen against air and ground: a direct-fire gun that shoots at what it sees. The coder followed the rule and found the result odd. R1 item 46, still open, comes from the same first reason (every long RA1 aircraft gun is off-screen because those aircraft see nothing in flight). Units: `generals.china.overlord`.
- *Fix:* Let the first reason compare the reach with the carrier's sight only when that sight is at least the game's reference unit's; below that, compare it with the reference unit's sight. The Gattling would then band long unless its reach passes the Ranger's fog figure. *Alternative:* Apply the first reason only to lobbed, launched or guided weapons, never to direct-fire guns.
- *Raised by* 1 report (j02).

**48. A change of speed alone as a mode**
- *Rule:* modes[]: "Second forms that change how the unit moves or what it is: deploy, siege and transform modes"; modes[].mobility allows a mode with "a new base, handling or speed".
- *Problem:* R1 item 58, still open, which proposed the same sentence for the Kirov's boost. The Aurora Bomber's wiki infobox lists normal, supersonic and sluggish modes: automatic changes of speed at each attack run and after it. The coder recorded no mode and put the speeds in the ability summary and mobility notes. Units: `generals.usa.aurora-bomber`.
- *Fix:* Say that a change of speed alone is never a mode; record it in mobility.notes or in the summary of the ability that causes it (as coded).
- *Raised by* 1 report (j04).

**49. Range of a bomb released far ahead**
- *Rule:* drop: "Released below or just ahead of the unit". armament[].range: one band per weapon, "from its longest reach against any target".
- *Problem:* The Aurora Bomber lets its bomb go well before the target and the bomb flies on by itself, so its attack range is three times the Ranger's rifle and bands long, while the delivery that fits it best says below or just ahead. The coder banded by the figure. Units: `generals.usa.aurora-bomber`.
- *Fix:* Say in drop's meaning that a bomb may be released well ahead of the target, and that its reach is banded by the release distance the sources give, like any weapon's (as coded).
- *Raised by* 1 report (j04).

**50. An automatic set-up step: no trait and no link**
- *Rule:* deploy-anchor: "Stops to enter a stronger stationary mode; must pack up to move", and it uses a key. Matchups rule 4 hangs a weakness on the part that exposes it.
- *Problem:* The Sentry Drone stops and unpacks by itself before it fires and packs up before it moves, with no button and no stronger mode; the wiki counts the delay on move orders as its main weakness. No mobility trait covers this (a fit_note at mobility/traits), and no part names a slow answer to orders, so that weakness hangs on role:scout. Units: `generals.usa.sentry-drone`.
- *Fix:* Add a mobility trait that uses no key for an automatic set-up step (the unit must stop and unpack before its weapon fires, and pack up before it moves), and let weaknesses link it. The fit_note goes and the weakness moves to the new trait.
- *Raised by* 1 report (j04).

**51. Interceptor's meaning does not fit its own Generals example**
- *Rule:* interceptor: an automatic system that "shoots down incoming missiles and rockets; it has few charges and must reload". Its Seen in names the Generals Paladin's point-defence laser.
- *Problem:* The Combat Chinook's point-defence laser fires several times a second with no clip. It fits the term's own Generals example, but not its meaning; the coder coded interceptor by the example. Units: `generals.usa-air-force.combat-chinook`.
- *Fix:* Reword the meaning: the system is limited by charges and a reload, or by its rate of fire and reach, so a volley or a weapon it cannot stop gets through.
- *Raised by* 1 report (j01).

**52. Paired entries: what 'never both' binds**
- *Rule:* Paired entries: a unit's passive for its passenger seats links passenger-sets-weapon or carry-passengers, "never both".
- *Problem:* It is unclear whether 'never both' binds only the passenger passive or every ability of the unit. The Combat Chinook's rope drop fits carry-passengers' hot-drop variant, but its seats link passenger-sets-weapon, so the coder read the rule as binding the whole unit. The patterns phase then gave the drop drop-in-from-above's storm-a-garrison variant, so this unit no longer needs an answer, but the next carrier with a drop button will. Units: `generals.usa-air-force.combat-chinook`.
- *Fix:* Say that 'never both' binds the passenger passive; another button may link carry-passengers when it passes the pattern-link test on its own.
- *Raised by* 1 report (j01).

**53. deploy-anchor and the deploy kind for a set-up that is no stronger in a fight**
- *Rule:* deploy-anchor: "Stops to enter a stronger stationary mode"; the deploy kind: "Becomes stationary to gain a stronger mode".
- *Problem:* The Hacker sets up his laptop to earn money and cannot move while he hacks; the mode is no stronger in a fight. The coder gave the deploy kind, deploy-anchor and a mode via deploy-siege-mode, following the pattern and R1's Slave Miner, and asked whether 'stronger' covers a set-up that only earns. Units: `generals.china.hacker`.
- *Fix:* Say that a stronger mode includes a job the unit can do only while set up (earning, building, a field that works only while it stays put), so deploy-anchor and the deploy kind apply (as coded).
- *Raised by* 1 report (j03).

**54. Friendly buildings in combos**
- *Rule:* Typed links: "A link always describes a unit"; the one exception is target:structure in counters and countered by, "which names enemy buildings".
- *Problem:* The hints, the Academy text and the Zero Hour manual pair Hackers with the Internet Center, a friendly building that holds up to eight of them and speeds up their earning. No link names a friendly building, so the pairing is told in an ability summary and a strength, with a fit_note at combos. R1 item 14's 1.1.0 wording covers enemy buildings only. Units: `generals.china.hacker`.
- *Fix:* Let target:structure also name a friendly building in combos, with its job in the reason, as rule 2 does for enemy buildings. The fit_note goes.
- *Raised by* 1 report (j03).

**55. Seats in a garrison that the unit places and recalls**
- *Rule:* transport "Needs two or more passenger seats"; the seat roles name riders who sit inside the unit (cargo, firing, module), and Paired entries links carry-passengers for "passenger-cargo seats". The Tempest Rising notes leave it to the coder whether the Lightning Rod's places are the Thunderhead's seats.
- *Problem:* The Thunderhead carries nobody itself: riders sit in the Lightning Rod it places, and recalling the Rod sets them down beside it. Whether those ten places are its seats decides transport (otherwise engineer, for placing the Rod). Riders shoot out of the Rod's slits, which reads as firing seats, but the pattern notes keep a building garrison on carry-passengers, which pairs with cargo seats. It is coded with 10 cargo seats and transport, with a fit_note and uncertain entries. Units: `tempest-rising.veti.thunderhead`.
- *Fix:* Say that places in a structure the unit places and recalls count as its passenger seats when carrying them is its job, with cargo seats and carry-passengers as for any garrison, or add a seat role for a placed garrison. Until then the Tempest Rising notes could settle the seat count instead of leaving it to the coder.
- *Raised by* 1 report (j08).

**56. The remote crew model's example names a soldier its own rules exclude**
- *Rule:* remote: "Only when the source has a person who stays on the field, outside the machine, while steering it (a soldier who parks to fly a drone)." Its classes leave out infantry, and it is never with nature organic.
- *Problem:* The example describes the Drone Operator, but the unit coded is the soldier, organic infantry, which the model's rules exclude, so he is coded solo. The patterns phase settled how to code him: a soldier who plants himself to steer his one drone links launch-drones' piloted-drone variant with crew solo, and remote stays for a machine flown from afar (the corrections in `research/registry-notes/patterns.md` and the widened launch-drones summary). The word list's example still points the other way. R1 item 47 (remote for a unit run from a building), still open, is about the same coding rule. Units: `tempest-rising.gdf.drone-operator`.
- *Fix:* Reword remote's coding rule so its example names the machine coded (the drone a parked soldier flies, when the drone is the unit), and add that a soldier who flies a drone as his weapon is solo and links launch-drones' piloted-drone variant.
- *Raised by* 1 report (j05).

**57. A drone weapon: reach from the drone or from its owner, family from the drone or its gun**
- *Rule:* armament[].range: one band per weapon, from its longest reach against any target; drone-launcher's default range is long. Nothing says where a drone's reach is measured from, or whether a drone's family comes from the drone or from its gun.
- *Problem:* The Drone Operator's drone fires micromissiles that reach short from the drone, but it attacks whatever he attacks, and in Remote Control mode it flies within a leash a little longer than a rifle shot. Short (from the drone), medium (his own attack reach) and long (the family default, or leash plus missiles) all have a case; it is coded short. The family is drone-launcher, though the drone's gun alone would be rockets. Units: `tempest-rising.gdf.drone-operator`.
- *Fix:* Say that a drone weapon's family is drone-launcher, its damage follows the drone gun's own game category, and its reach is how far from the owner the drone can strike (its leash or control reach plus its gun's reach), or the family default when no figure gives that.
- *Raised by* 1 report (j05).

**58. A named perk that changes how a weapon works**
- *Rule:* abilities[]: a passive or triggered entry is added when a source describes the effect as a distinct state or behaviour, "such as naming it as an ability, perk, upgrade or loadout pick", and it adds a mechanic; a perk that changes how one of the unit's other abilities works is not an entry of its own. Weapons vs abilities: an effect that is part of how a weapon works stays in that weapon's summary and patterns.
- *Problem:* The Drone Factory perk rebuilds the Drone Operator's destroyed drone after a while. It is a named perk that adds a mechanic, and also part of how the drone weapon works, so the two rules pull apart; it is coded as its own triggered ability linking reinforce-squad. The one wording that R1 item 23 gave both places in 1.1.0 does not say which rule wins when the effect is part of a weapon. Units: `tempest-rising.gdf.drone-operator`.
- *Fix:* Extend the perk clause to weapons: a perk that changes how one of the unit's weapons works goes in that weapon's summary and patterns (the Drone Factory would move into the drone's summary, and reinforce-squad onto the weapon). *Alternative:* Say that a named perk that adds a mechanic is its own entry even when it concerns a weapon (as coded).
- *Raised by* 1 report (j05).

**59. No family for a hull that rams**
- *Rule:* Weapon families: blades is "Blades, claws, fists, hammers, saws or drills used up close", with only melee or attach delivery and melee, electric or energy damage; explosives allows ram delivery but means grenades, charges, mines and bomb trucks.
- *Problem:* The Tempest Sphere's weapon is its own body slammed into what it attacks: ram delivery, explosive damage by the map. Blades is the nearest family by behaviour, so the unit carries two atypical lines (explosive and ram on blades) and a fit_note asking for a ram family. Units: `tempest-rising.dynasty.tempest-sphere`.
- *Fix:* Add a ram family: the vehicle's own hull as the weapon, with ram delivery, melee range and kinetic, melee or explosive damage.
- *Raised by* 1 report (j07).

**60. Thrown grenades: no delivery fits the explosives family**
- *Rule:* Weapon delivery: lobbed is indirect fire, where "the shot arcs over cover onto a ground point"; projectile is a visible shot with travel time. Explosives allows only place, lobbed, attach and ram delivery, with place as its default.
- *Problem:* The Enlightened's doctrine grenades are hurled at the target. No source describes an arc, so lobbed fails; projectile breaks the explosives list (atypical); and place, the default, is wrong for a throw. Units: `tempest-rising.veti.enlightened`.
- *Fix:* Allow projectile delivery on explosives for a thrown grenade, or say that a thrown grenade is lobbed unless a source shows it flying straight. The coder notes that the pilot's proposal of a grenade-launcher family would also cover it.
- *Raised by* 1 report (j09).

**61. Charge-up needs a held trigger: an automatic wind-up has no term**
- *Rule:* charge-up: "Set it when the sources say the player holds the trigger to build the shot up before it fires"; energy a weapon releases by itself is not charge-up.
- *Problem:* The Voltaic Tank's beam charges for a moment before every shot by itself, a real warning to its target. In a commanded game nobody holds a trigger, so the wind-up has no term: it is in the summary, with a fit_note. Units: `tempest-rising.dynasty.voltaic-tank`.
- *Fix:* Add a wind-up trait (each shot needs a visible build-up first), or widen charge-up's coding rule to a build-up the weapon does by itself before every shot.
- *Raised by* 1 report (j07).

**62. A death that leaves a full combat unit**
- *Rule:* On death: bail-out means the crew "eject as basic infantry with low health"; pilot-eject is a pilot who "can reach a new unit or a pickup".
- *Problem:* Since patch 1.7.0, a Demolitionist, a tier 3 heavy infantry unit with two weapons, appears where the Tempest Sphere is destroyed. Neither term fits, so it is coded bail-out (basis in-game) with a fit_note. The Pillager, which leaves an Ignitor, will meet the same question. This is not item 25's second life: what is left is another unit. Units: `tempest-rising.dynasty.tempest-sphere`.
- *Fix:* Add an on-death outcome for a unit that leaves a full combat unit behind (the unit named in on_death.notes), or let bail-out cover crew who get out as a fighting unit.
- *Raised by* 1 report (j07).

**63. No role for breaking buildings up close**
- *Rule:* siege's coding rule needs a lobbed weapon that reaches long or further, bombs dropped from the air, a deploy mode with a long area gun, or a long-range missile or rocket built mainly against structures. The anti roles name infantry, armour and air, and the Tempest Rising notes say anti-building and anti-structure name no role.
- *Problem:* R1 item 38, still open, met here at close range. The makers present the Tempest Sphere as a base breaker, but it rams at melee range, so siege fails, and no anti role covers buildings; a fit_note records it. Units: `tempest-rising.dynasty.tempest-sphere`.
- *Fix:* Add an anti-structure role: breaks buildings and defences, at any range. *Alternative:* R1 item 38's fix (a long-range weapon whose sources name buildings as its main target gives siege, whatever its delivery) does not reach the Sphere, which rams at melee range; it would also have to drop the reach test, which goes beyond R1's fix, and siege means hitting from afar.
- *Raised by* 1 report (j07).

**64. A pistol with the game's sniper damage: small arms or sniper**
- *Rule:* Small arms or Machine gun tie-break: "Pistols, rifles, carbines and SMGs are always small arms." Small arms or Sniper tie-break: sniper when the sources "give it the game's sniper damage category". roles.secondary gives anti-infantry to small arms (rifles, pistols, machine guns, shotguns) that do little to vehicles.
- *Problem:* The Line Officer's handgun carries the game's Sniper damage type. One tie-break calls pistols always small arms, the other makes this one sniper; it is coded sniper. It is then unclear whether the anti-infantry clause, which gives him his anti-infantry second role, still applies to a pistol coded sniper. Units: `tempest-rising.dynasty.line-officer`.
- *Fix:* Say that 'always small arms' settles only small arms against machine gun, so a pistol the game types as sniper is sniper; and that the anti-infantry clause names kinds of weapon, not families (its list includes machine guns), so it still applies (as coded).
- *Raised by* 1 report (j06).

**65. A unit that is itself its side's resource**
- *Rule:* Resources: "A gauge on the unit itself that shapes how it plays."
- *Problem:* The Enlightened are the Veti's second resource, spent by Sacrifice, by Caretakers planting anchors and by garrisoning anchors. Resources describe a gauge on a unit, so nothing records this; a fit_note does. Units: `tempest-rising.veti.enlightened`.
- *Fix:* Add a way to say that a unit is itself spent as a resource (a resource term or a team-play hook), or say that this goes in cost_band.basis and the notes.
- *Raised by* 1 report (j09).

**66. Crush kills and the weapon's targets**
- *Rule:* can_target lists "Every kind of target the weapon can be fired at and hurt in the source"; the crush trait "Runs over smaller units in its path".
- *Problem:* The Tempest Sphere's attack order runs over what it can crush and slams with its roller what is too big to crush. The rules do not say whether the kinds it kills by crushing belong in the roller's can_target; infantry were listed on the 1.7.0 notes' reading. Units: `tempest-rising.dynasty.tempest-sphere`.
- *Fix:* Say that a kind the unit kills only by running it over belongs to the crush trait, not to the weapon's can_target, unless a source shows the weapon itself hitting it.
- *Raised by* 1 report (j07).

**67. A family for a weapon that no source describes**
- *Rule:* The weapon-family tie-breaks decide by how the shot travels or what it fires (plasma or laser: "Bolts that travel are plasma; light that hits at once or is held on the target is laser"). No rule covers a weapon whose sources give only a name.
- *Problem:* For the Vimana's cannon only its name and the wiki weapon box's word that it is an energy weapon exist. Laser was chosen by analogy with a same-named Veti defence whose Codex describes a light beam; cannon would have made the damage explosive and added the soviet flavour. Units: `tempest-rising.veti.vimana`.
- *Fix:* Say what to do when no source describes the shot: take the family of a same-named weapon on another unit only when a source ties the two, as can_target step 3 asks for labels; otherwise the family whose description best fits the sources' words, with an uncertain entry.
- *Raised by* 1 report (j08).

**68. pilot-eject leaves out the power-suit trooper**
- *Rule:* On death: pilot-eject is listed only for "Walker / mech, Aircraft, Tank / ground vehicle, Hovercraft". Body plans: a power suit at small size "is infantry".
- *Problem:* William Mason's Exit Strategy is what pilot-eject describes: the pilot leaves the failing suit on his own and fights on, later taking a new suit. Coded as a small power-suit trooper (infantry), he carries the line 'on-death:pilot-eject classes infantry'. Under the walker reading of his class (item 105) the break would go. Units: `iron-harvest.usonia.william-mason`.
- *Fix:* Add Infantry to pilot-eject's classes, only with the power-suit body. *Alternative:* Leave the list and let the class question decide: if Iron Harvest's exosuits are walkers, no break remains.
- *Raised by* 1 report (j12).

**69. A weapon left behind on a deployed shell**
- *Rule:* armament[].slot: an alternate is "swapped in by a button the unit has", and the weapon it replaces is silent meanwhile; armament[].mode is for a weapon that works only in one mode; modes[] write only what changes from the base form.
- *Problem:* William Mason's Deploy Exosuit button takes him out of the suit, which stays where it is and keeps firing its cannon as a turret while he fights on with a revolver. No field rule covers a weapon that stays on a deployed body while its owner switches weapons. The coder kept the cannon as the primary, coded the revolver as an alternate of the dismounted mode, linked transform and deploy-turret on the button, and described the hand-over in the summaries. R1 item 51, still open, is another deployed form the mode rules do not describe. Units: `iron-harvest.usonia.william-mason`.
- *Fix:* Say that a weapon left on a deployed body that fights by itself (a turret, an empty suit) keeps its entry and slot, that the mode's summary says it fires on its own there, and that the button that leaves it links deploy-turret beside the mode's pattern (as coded). *Alternative:* Give the left-behind weapon its own entry for the mode, with an auto-target mount and the deploy-turret pattern.
- *Raised by* 1 report (j12).

**70. Siege for a unit whose only stock attack is a button**
- *Rule:* roles.primary counts "weapons in the primary, secondary and alternate slots, and innate buttons", and step 1 skips a role "whose requires the unit's stock parts fail". Siege's coding rule speaks of weapons, and the validator reads requires from weapons and patterns only.
- *Problem:* The Nakovalnya's label (Rocket Artillery) names siege. Its only stock attack is the innate Bombardment button, rockets lobbed onto the ground at long reach, which its coder read as meeting siege's coding rule and requires. The validator is satisfied only through the Sentry Mode rockets, an alternate weapon that only a veteran has (item 23). The step 1 test and the validator read different parts. R1 item 21's 1.1.0 clause covers buttons only at roles.secondary step 2. Units: `iron-harvest.rusviet.nakovalnya`.
- *Fix:* Say that an innate button counts for roles.primary as a weapon would, its delivery, reach and damage read from its summary, for the coding rules and the requires alike, and that the role is then recorded in atypical, as roles.secondary step 2 says for a button's anti role. *Alternative:* Only weapons meet a role's coding rule and requires; the Nakovalnya keeps siege only through its veteran rockets, which item 23 would rule out, and then falls to a later step.
- *Raised by* 1 report (j13).

**71. The alternate slot when a mode silences a button, not a weapon**
- *Rule:* armament[].slot: an alternate is swapped in by a button, and "the weapon it replaces, usually the primary, is silent meanwhile"; a weapon a mode adds "while the primary keeps firing is also secondary, with mode".
- *Problem:* The Nakovalnya's Sentry Mode rockets fire only in that mode, which silences the Bombardment button. No weapon is replaced, because the unit has no other weapon, and no primary keeps firing either. The coder chose alternate with the mode, by judgement. Units: `iron-harvest.rusviet.nakovalnya`.
- *Fix:* Say that a weapon a mode adds is alternate when the mode silences the unit's main attack, weapon or button, and secondary when the main attack keeps working (as coded).
- *Raised by* 1 report (j13).

**72. Lineage for a generic job name across unrelated games**
- *Rule:* lineage: "Link units doing the same job that have the same or nearly the same name"; only a game outside the registry, or "the same real-world vehicle in an unrelated series", is ruled out.
- *Problem:* By the letter, Iron Harvest's Engineers would share a lineage with the Red Alert games' and Tempest Rising's engineers: same name, same job. The coder left it out, because these are generic engineers of unrelated franchises and every lineage example stays within one series. Riflemen, medics and snipers will raise the same question. R1 item 49, still open, finds the same test too wide in another direction (a tank and a foot soldier). Units: `iron-harvest.shared.engineer`.
- *Fix:* Add that a lineage needs one series, or a source that presents the unit as the same design, so a generic job name shared across unrelated franchises never makes one.
- *Raised by* 1 report (j13).

**73. Suppression gives disabler only through an ability**
- *Rule:* disabler needs the stun, root, silence or slow weapon trait, cryo or EMP damage, or a control pattern. The suppress trait is not on that list, while suppress-with-fire, a control pattern, is the ability version of the same trait (Granularity).
- *Problem:* The Grimbart's gatling has the suppress trait, since DevBlog #35 made pinning infantry a main job of its fire, and Iron Harvest's suppression slows infantry's movement and fire. Its disabler rank comes only from the Sweep button, which links suppress-with-fire. If the Sweep were its veteran ability (item 89), disabler would drop, though the gun does the same job all the time. Units: `iron-harvest.saxony.grimbart`.
- *Fix:* Add the suppress weapon trait to disabler's requires. *Alternative:* Leave it, if suppression on a weapon is meant to stay an anti-infantry matter, and say so in disabler's description.
- *Raised by* 1 report (j11).

**74. Abilities that work in one mode only**
- *Rule:* abilities[] has no mode field, unlike armament[].mode. Ability kinds that use a key "count toward the tier's key budget".
- *Problem:* The Mocny has one smoke button while walking (Smokescreen) and another while planted (Smoke Canister). Each is its own entry, the mode shows only in their summaries, and both count toward the t2 key budget, although the two are never usable together and may share a key. Units: `iron-harvest.polania.mocny`.
- *Fix:* Add an optional mode field to abilities[], as armament[].mode has, and say that buttons of different modes that sit on one key count once toward the key budget.
- *Raised by* 1 report (j11).

**75. Assault's reach test with several anchor units**
- *Rule:* roles.secondary step 4: assault needs medium or heavier armour and a main weapon that is short- or medium-range or "reaches no further than the main guns of the game's main battle tanks (the tanks its cost bands are anchored on)".
- *Problem:* Iron Harvest anchors its cost bands on four line mechs whose guns reach from about the rifle's reach to about twice it. The Mocny's walking cannon matches the Knox's, falls short of the Wotan's and outreaches the Lowca's and the Nagan's. Read as no further than the longest anchor gun, the Mocny takes assault as its second role, as coded; read as no further than every anchor gun, the slot stays empty. The wording R1 item 31 gave in 1.1.0 assumed one standard tank gun. Units: `iron-harvest.polania.mocny`.
- *Fix:* Write "no further than the longest main gun among the units the cost bands are anchored on". *Alternative:* "No further than the shortest of them", the strict reading; the Mocny would lose assault.
- *Raised by* 1 report (j11).

**76. Body and size of a mode in which the unit rides an animal**
- *Rule:* Body plans: "A mode records a second body only when the upper body changes shape (a mech folding into a jet)"; modes[].body.size is optional, and nothing says what size a mode's new body takes.
- *Problem:* R1 item 54, still open. Olga riding her tiger is faster and tougher, cannot shoot and can be seen. The coder recorded a mode with the beast body and kept the base size, small, because the game still heals her as infantry while she rides. Whether a rider on a big cat is a new upper body, and what size that body is, is not written. Units: `iron-harvest.rusviet.olga-morozova`.
- *Fix:* R1 item 54's fix (a mode with a new body plan gives the size its body's examples give), with one addition: a soldier riding an animal takes the beast body only when the animal is the bigger part, keeping small while the game still treats the rider as infantry. *Alternative:* A soldier on a mount keeps the humanoid body and size, and the mount shows only in the mode's mobility and summary.
- *Raised by* 1 report (j10).

**77. Matchups rule 5 when the gap comes from our own coding**
- *Rule:* Matchups rule 5: something the unit lacks ("no weapon reaches aircraft") puts the enemy that exploits it in countered by, and an entry that only restates a sourced gap counts as named. Weapon delivery: a lobbed shot "never hits fliers".
- *Problem:* The Nakovalnya's rockets are coded lobbed, so by our own rules nothing it has reaches aircraft. But no source says it cannot fire at air units or names aircraft as a threat, so its coder left class:aircraft out of countered by. The gap is real in our data but not sourced, and it is unclear whether rule 5 puts the enemy in. Units: `iron-harvest.rusviet.nakovalnya`.
- *Fix:* Say that rule 5 also applies to a gap that follows from the word lists' rules for the unit's sourced parts (a lobbed weapon cannot reach fliers), as a reasoned entry with an uncertain entry; the Nakovalnya would gain class:aircraft in countered by. *Alternative:* Rule 5 applies only to gaps the sources state; leave the entry out, as coded.
- *Raised by* 1 report (j13).

**78. roles.primary step 3: a deploy mode whose gun is not its own**
- *Rule:* roles.primary step 3 gives siege "if the unit deploys into a mode whose gun reaches long or further and hits an area", and siege's coding rule says the same of a deploy mode; it adds that "A long-range missile or cannon alone is not siege". Neither says whether the gun must be one that the mode adds or swaps in.
- *Problem:* The Kaiser's stock main cannon reaches long and hits an area, and it keeps firing when the Kaiser entrenches. Its coding reads the clause as asking for the mode's own gun: the rockets that entrenching uncovers reach only medium and are not lobbed, so siege is no candidate (its roles/secondary uncertain entry). Read literally, any gun that fires in the mode counts. Today nothing changes, since Entrench opens only at the first rank and roles.primary reads only innate buttons; but the unlock rests on wiki pages, while DevBlog #24 lists the deploy with the unit without saying when it opens (its abilities uncertain entry), and if Entrench were innate, the literal reading would make the Kaiser siege at step 3 instead of assault. The Mocny is siege at step 1, and its planted mode swaps in a lobbed gun of its own, so it does not turn on this. Units: `iron-harvest.saxony.kaiser`.
- *Fix:* Write "if the unit deploys into a mode that adds or swaps in a gun that reaches long or further and hits an area" in step 3 and in siege's coding rule, so a gun the unit fires in every form never makes it siege through the mode (as coded). *Alternative:* Say that any gun the unit fires in the deploy mode counts, so a unit with a long splash gun and an innate deploy is siege at step 3.
- *Raised by* 1 report (Kaiser coder B).

**79. No term for immunity to a status**
- *Rule:* Typed links: immune: names "the damage type, pattern or mobility trait the unit shrugs off". No term or link names immunity to a status effect.
- *Problem:* Engine Tuning, a Veti doctrine, gives every Veti vehicle and aircraft the Tempest Shielded perk, an immunity to statuses, and nothing could code it (job j08 logged gaps on the Thunderhead and the Vimana). The doctrine left both units in the merge pass (REG-03, item 113), so the pattern asked for it (shrug-off-status) was taken off the patterns list and the doctrine sits in their armour notes. The next unit with such an immunity of its own will meet the gap. Units: none.
- *Fix:* Let immune: also take a status (a weapon trait such as stun or slow), or add a term for immunity to statuses.
- *Raised by* the patterns phase (its list for the rule-fix round) and 1 report (j08).

**80. Tempest Rising's 'air control' and 'zone control' as disabler words (already named to Mustafa)**
- *Rule:* Roles: official words name a role through its label or an alias in any word form, and "each half of a slash label (Artillery / siege) counts as a label", so control names Disabler / control; the words that name no role include "control in mind control or a control point". The Tempest Rising notes add: "Control of a place names no role, like the word list's control point", and say "This is this note's reading; the word list itself names only mind control and a control point."
- *Problem:* The build tooltips call the Peacekeeper an air control helicopter and the Physicist a zone control specialist. By the word list's letter, both lines name disabler, which step 1 keeps only when the unit's stock parts meet disabler's requires; the notes read control of a place as naming no role, a note that stands in for a rule, as N3 and N4 do. It is R3's fourth prep question, coded by its recommended answer A (the note as written), and it waits for Mustafa in pull request #6. Neither unit is coded in this batch, so no batch value waits on it, as for the mech-hunter question (item 81). The Sniper's combat control names disabler under every option. Units: none.
- *Fix:* The prep's recommendation: A for R3, then its option C at the rule-fix round: add control of a place (air control, zone control) to the words that name no role, beside a control point. This rule change would replace the note. *Alternative:* The prep's option B: read the word list as written, so both lines name disabler, kept at step 1 only when the unit's stock parts meet disabler's requires; the note goes.
- *Raised by* R3's prep (`research/r3/prep/editors.json`, the Tempest Rising open question) and the Tempest Rising notes (Official role lines, control of a place).

**81. Iron Harvest's 'mech hunter', 'mech destroyer' and 'anti-mech' as anti-armour words (already named to Mustafa)**
- *Rule:* Roles: anti-armour's aliases are "anti-tank, anti-vehicle, anti-armor, tank hunter, tank destroyer", and official words name a role only through its label or an alias, in any word form.
- *Problem:* In Iron Harvest the armoured fighting machines are mechs. The makers' newest labels call the Lowca and the Wotan mech hunters and the Knox a mech destroyer, and their game page calls field cannons anti-mech cannons. Under the word list, roles step 1 gives these units nothing; the notes tell coders to add an uncertain entry at roles/primary and report the alias question. None of the nine kept units carries such a label, so no batch value waits on it; the Mocny's anti-mech label from the wiki (item 7) shows the same word. It is the last of R3's five prep questions, waiting for Mustafa in pull request #6. Units: none.
- *Fix:* The prep's recommended option B: add 'mech hunter', 'mech destroyer' and 'anti-mech' to anti-armour's aliases at the rule-fix round, and recode the units whose step 1 changes. *Alternative:* The prep's option C: let a registry note name a game's own word for its armoured units, which then stands for tank or vehicle inside any alias.
- *Raised by* R3's prep (`research/r3/prep/editors.json`, the Iron Harvest open question) and the Iron Harvest notes (Mech Hunter and Mech destroyer).

**82. No team-play hook for a pure buff or for screening teammates**
- *Rule:* Team-play hooks: protector "Shields, heals or repairs others on an ongoing basis", and spotter gives the team information; no hook names making allies stronger for a time, or hiding them from sight.
- *Problem:* The patterns phase found no hook for rally-allies or sacrifice-for-allies (a pure buff) or for lay-smoke (screening teammates from sight), so their pattern files cannot say how they create teamwork. The gap sits in the pattern files, not in unit codes; batch units that link those patterns are the Overlord, the Line Officer, the Enlightened, the Vimana and the Mocny. Units: none.
- *Fix:* Add two hooks, one for a unit that makes nearby allies stronger for a time and one for a unit that hides teammates from sight, and give them to those three pattern files.
- *Raised by* the patterns phase (its list for the rule-fix round).

**83. The validator does not check that an alias belongs to one pattern only**
- *Rule:* Mechanic pattern: aliases are "Generic synonyms and old ids merged into this one (the resolver accepts them)". The validator has no check on them.
- *Problem:* An alias that sits in two pattern files leaves the resolver unable to tell which id is meant. The patterns phase found two such collisions by hand in its new files and removed them; nothing stops the next. Units: none.
- *Fix:* Make the validator fail when an alias appears in two pattern files or equals another pattern's id, with a test.
- *Raised by* the patterns phase (its list for the rule-fix round).

## Open, for the batch

**84. The in-game name and the slug of Iron Harvest units**
- *Rule:* Ids: "The slug is the in-game name by these rules", and a link to a unit not yet researched uses the id its entry would get; name is the "In-game name, for reference only". The Iron Harvest notes on wiki traps say page titles carry the type number and the name in quotes, while the makers' posts write the bare name.
- *Problem:* Five units carry the page-title form as their name (PZM-13 "Mocny", Sd. KS 49 "Grimbart", SKS 300 "Kaiser", SHM-68 "Nakovalnya", M-22 "Stark"), following the reconciled Kaiser, but their slugs use the bare name, which the Ids rule would not give from those names. Which form the game shows is not settled. The same question leaves the ids of units not yet researched to guesses: field-cannon for the shared field cannon (five units link it), and ward, kolokol, wotan, lowca, straznik and erlkonig, while the Engineer left the heavy machine gun and the mortar out of its combos because their ids are unknown. Units: `iron-harvest.polania.mocny`, `iron-harvest.saxony.grimbart`, `iron-harvest.saxony.kaiser`, `iron-harvest.rusviet.nakovalnya`, `iron-harvest.usonia.stark`, `iron-harvest.shared.engineer`, `iron-harvest.polania.anna-kos`.
- *Fix:* Add to the Iron Harvest notes that the in-game name is the bare name the posts use (Mocny), that the slug is made from it, and that the page title with its type number goes in a source note; list the ids of the shared weapon systems (field-cannon, and the heavy machine gun's and the mortar's). Then rename the five units' name fields. *Alternative:* Keep the page-title names, and add to the Ids convention that a type number before a quoted name is dropped from the slug (a rules change, for Mustafa).
- *Raised by* 4 reports (Kaiser coder A, j11, j12, j13).
- *Left open:* No source read shows which name the game itself displays, and renaming five units on a guess would be worse than the mismatch. It waits for that source, or for Mustafa's choice of the alternative.

**85. hijack-vehicle's registry summary covers only taking the vehicle**
- *Rule:* Pattern links: link a pattern when the ability gives "the same interaction and the enemy the same counterplay as the pattern's summary". The pattern registry's summary for hijack-vehicle: "Take over an enemy vehicle by throwing out or killing its crew."
- *Problem:* Jarmen Kell's Sniper Attack kills a vehicle's crew and leaves the hull neutral for either side to claim; he never takes it himself, so the opening check found that the link fits only half. The patterns phase then wrote the pattern's file with a crew-snipe variant for Kell and a crew-kill-blast variant for the Nuke Cannon's neutron shells and mines, which the Battle Bus, the Overlord and the Sentry Drone link in their matchups. The file's own summary names the ranged twist, but the registry's one-line summary still says take over, so by its letter the pattern-link test fails for all these links. Units: `generals.gla.jarmen-kell`, `generals.gla.battle-bus`, `generals.china.overlord`, `generals.usa.sentry-drone`.
- *Fix:* Reword the registry summary to match the file, as R1 did for throw-explosive and this batch did for deploy-turret and launch-drones: take over an enemy vehicle by throwing out or killing its crew, or kill the crew from range so that the empty hull goes to whoever claims it first. *Alternative:* Say in Pattern links that a link may rest on a variant in the pattern's file when the registry summary covers only part of it (the Generals reconciler's general proposal; a rules change, for Mustafa).
- *Raised by* 3 reports (Kell coder A, Kell coder B, Generals reconciler).
- *Settled in the batch:* As proposed: the registry summary of hijack-vehicle now covers killing the crew from range, so these links pass the pattern-link test by its letter. No unit changes.

**86. Purpose entries for the generals' versions (already named to Mustafa)**
- *Rule:* The roles word list: "For a unit recorded once for several sides, official text counts only when every side's version carries it." The Generals notes read every general's version as carrying its main unit's Purpose entry.
- *Problem:* The base-game manual of 2003 predates the nine Zero Hour generals, so whether a general's version carries its main unit's Purpose entry is a reading the notes had to make. Roles step 1 rests on it for Jarmen Kell (scout, infiltrator), the Red Guard (anti-infantry), the Hacker (logistics) and the Technical (transport, anti-infantry). It is R3's third prep question, coded by its recommended answer A, and it waits for Mustafa in pull request #6. Units: `generals.gla.jarmen-kell`, `generals.china.red-guard`, `generals.china.hacker`, `generals.gla.technical`.
- *Fix:* Record Mustafa's answer in the Generals notes: A keeps the reading (no change); B skips the Purpose entry for every unit a general also fields: Jarmen Kell's and the Technical's roles change, the Red Guard keeps anti-infantry through its shared tooltip's strong-against line (step 4), and the Hacker, who is unarmed, goes to step 2, where its main action decides. *Alternative:* If he wants the reading for every game, add to the roles word list that official text written before a side's version existed counts for that version when the version keeps the unit's name (a rules change).
- *Raised by* R3's prep (`research/r3/prep/editors.json`, Generals open question 3) and the Generals notes (Uncertain).
- *Left open:* It waits for Mustafa's answer in pull request #6 (the third prep question). The units follow answer A.

**87. What the pause figure in an infobox '(Ability)' slot means**
- *Rule:* The Iron Harvest notes on wiki traps send the infobox's '(Ability)' weapon slots to abilities, and abilities[].cooldown is the "Band of the cooldown figure". The note does not say whether the slot's pause between shots is that figure.
- *Problem:* The Grimbart's Sweep is banded long from the pause in its ability slot, read as the wait between uses, as other mech pages seem to give theirs, and Anna's Piercing Shot is banded medium the same way. On the Kaiser, both opening coders read the rocket slot's short pause as the reload between salvos, not Entrench's wait, and left Entrench's cooldown out. One field is read two ways. Units: `iron-harvest.saxony.grimbart`, `iron-harvest.polania.anna-kos`, `iron-harvest.saxony.kaiser`.
- *Fix:* Add to the note what the slot's pause figure is: the ability's cooldown for a one-off ability attack (the Sweep, Piercing Shot), and the rate of fire for a standing weapon that a mode adds (the Kaiser's rockets, a weapon since N1), whose mode button then has no figure (as coded).
- *Raised by* 3 reports (Kaiser coder A, Kaiser coder B, j11).
- *Settled in the batch:* As proposed: the Iron Harvest note on '(Ability)' slots now says what the pause figure is. No unit changes; the three units already read so.

**88. Which link carries 'never ranks up'**
- *Rule:* The Generals veterancy note: "Units that never rank up say so in weaknesses", with no link named. Matchups rule 5 hangs a lack on the part that causes it, and rule 4 a weakness on the part that exposes it.
- *Problem:* Three units hang the same lack on three parts: the Battle Bus on armour-class:medium, the Combat Chinook on armour-class:light, and the Sentry Drone on nature:uncrewed-machine (its wiki says it cannot rank because it is a machine, as with RA2's Robot Tank). Job j04 logged a gap: no link for 'cannot gain veterancy'. The merge check proposed one link for all three (REG-08); its skeptic did not confirm it, since each link follows the cause its source names, and the note was left as it is. Units: `generals.gla.battle-bus`, `generals.usa-air-force.combat-chinook`, `generals.usa.sentry-drone`.
- *Fix:* Reword the note as REG-08's skeptic proposed: hang the weakness on the part a source names as the cause (a drone's machine nature), otherwise on the armour class. The three units already comply. *Alternative:* A link kind for a game-wide mechanic the unit lacks (a word-list change, for Mustafa).
- *Raised by* 2 reports (j01, j04) and the merge check (REG-08).
- *Settled in the batch:* As proposed: the Generals veterancy note now names the link. No unit changes.

**89. Which button is a unit's veteran ability when no source names it**
- *Rule:* Ability sources tie-break: "Pick veterancy only when the ability itself first appears at a rank." The Iron Harvest Veterancy note: the first rank unlocks the unit's veteran ability, recorded with source veterancy.
- *Problem:* The note says every unit has a veteran ability, but no source names the Mocny's, the Grimbart's or the Stark's, and wiki pages are known to leave such locks out (the Strażnik's and the Erlkönig's, which DevBlog #24 confirms). All three coders coded every button innate under the tie-break, with uncertain entries. For the Grimbart it decides a role: the Sweep is its only button, and if it is the veteran ability, disabler loses the button every copy has and drops (item 73). Units: `iron-harvest.polania.mocny`, `iron-harvest.saxony.grimbart`, `iron-harvest.usonia.stark`.
- *Fix:* Add to the Veterancy note: where no source names a unit's veteran ability, code its buttons innate, as the tie-break says, and add an uncertain entry at abilities that names the Veterancy page and the roles the choice would change. The units already read so. *Alternative:* Read a unit's only button as its veteran ability, since the game gives every unit one, with an uncertain entry; the Grimbart would lose disabler.
- *Raised by* 2 reports (j11, j12).
- *Settled in the batch:* As proposed: the Veterancy note now covers a unit whose veteran ability no source names. No unit changes.

**90. One-off armour sets: the note names step 1, and a bus sits between truck and APC**
- *Rule:* The Generals armour note: the one-off sets (the Battle Bus and the Sentry Drone among them) "map by what the unit is", written beside the step 1 bullet, while that bullet says step 1 decides only for sets the map lists and a set it leaves out goes on to steps 3 and 4. Armour-class step 4 reads the kind of unit: light names trucks, medium names APCs.
- *Problem:* The Battle Bus is a reinforced civilian bus used as an APC: trucks are light, APCs medium. It was coded medium, with an uncertain entry; its health equals a Battlemaster's, and its set lets gunfire through as Tank Armor does. The merge check found it and the Sentry Drone naming different deciding steps for the same exception (conv-7): the one-off sets are not armour_map keys, so step 4 decides, not step 1. Both units now say step 4; the note's wording was left for the round. Units: `generals.gla.battle-bus`, `generals.usa.sentry-drone`.
- *Fix:* Reword the note: the one-off sets are not armour_map keys, so step 4 decides by the kind of unit; and name the class of each of the seven sets (the Battle Bus medium as an APC, the Sentry Drone light as a drone no bigger than a soldier, and so on), so no coder has to choose.
- *Raised by* 1 report (j01) and the merge check (conv-7).
- *Settled in the batch:* A smaller fix: the note now says that step 4 decides the one-off sets, and names the two coded so far (the Battle Bus medium, the Sentry Drone light). The other five sets are named when their units are coded, since no unit of the batch wears them.

**91. Doctrines that change a status or a helper: on the named units, or off**
- *Rule:* Shared mechanics: a side-wide power "that changes every unit of a class is left off too"; one that gives named unit types "a new button or a new effect is recorded on each of them, with source commander-power". The Tempest Rising notes: "The Ambush Protocols doctrine's wider stealth stays off."
- *Problem:* EM Interference makes every Marked enemy silenced. The Doctrine page names the markers (the Sentinel among them), while the Status effect page ties the silence to the status, whoever marks. It is coded on the Sentinel (a passive, source commander-power, linking block-abilities), but its uncertain entry still says the merge pass may drop it as a side-wide change, and the merge pass did not take it up. Ambush Protocols hides the Drone Operator's drone while it moves; the notes' line does not say whether it covers a new effect for a named helper, so it is left off, with an uncertain entry. Units: `tempest-rising.gdf.sentinel`, `tempest-rising.gdf.drone-operator`.
- *Fix:* Say in the Tempest Rising doctrine note that a doctrine adding an effect to a status that named units apply is recorded on each named unit (EM Interference on the Sentinel, as block-abilities' block-the-marked variant already reads it), and that Ambush Protocols stays off because it hides the drone, not the unit coded. Then reword the Sentinel's uncertain entry. *Alternative:* Leave EM Interference off as a change to the Marked status; block-abilities would then lose its only source unit.
- *Raised by* 1 report (j05).
- *Settled in the batch:* As proposed: the doctrine note records such a doctrine on each named unit and says why Ambush Protocols stays off, and the Sentinel's uncertain entry now points to the note.

**92. A hero's named melee weapon under the Melee note**
- *Rule:* The Iron Harvest Melee note leaves the plain blow every squad has out of the armament, and keeps a melee weapon a unit is built around (the Groza's blades, the Serp's scythe, the Stark's jackhammer) as a weapon entry.
- *Problem:* Olga's sabre falls between the two: the wiki calls it her second weapon and rates her highly in melee, and Change Log #04 retunes its damage, but she is built around her gun. It was left out and named in the gun's summary. Wojtek's maul, the second weapon slot of Anna's infobox, was kept as a weapon. The note does not say which way a hero's named blade goes. Units: `iron-harvest.rusviet.olga-morozova`, `iron-harvest.polania.anna-kos`.
- *Fix:* Add to the Melee note: a hero's melee weapon that the sources name and retune (its own weapon slot, its own damage changes) is a weapon entry; only the unnamed blow every soldier has stays out. Olga would gain a secondary blades entry. *Alternative:* Keep a hero's sidearm blade out unless the unit is built around it, and name both heroes' cases in the note.
- *Raised by* 1 report (j10).
- *Left open:* Giving Olga a sabre entry needs her sources read again for its figures. Until then the sabre stays in the gun's summary.

**93. Tempest Rising's researched version and patch 2.0.2**
- *Rule:* The games registry gives Tempest Rising's version researched as patch 2.0.1+60808, and the notes' Version item keeps the batch on 2.0.1 and lists the known differences of patch 2.0.2 (29 October 2026).
- *Problem:* Patch 2.0.2 came out during the fill and changes facts that two units state, though no band: the Line Officer's pistol now reaches a little past his sight, so his sensors note that it reaches exactly as far as he sees no longer holds on the live game; and the Caretaker is now as slow as the Vimana, which the Vimana's mobility notes and one of its weaknesses compare it with. It also moves the tier gates of units not yet researched (the Trebuchet, the Queller, the Comms Rig's pulse). The merge check (facts-06) left the move to the rule-fix round. Units: `tempest-rising.dynasty.line-officer`, `tempest-rising.veti.vimana`.
- *Fix:* Decide at the round whether to move the version researched to 2.0.2. If it moves, update the registry's tier gates it names and reword the two units' lines; if not, the notes' list of known differences stands.
- *Raised by* the merge check (facts-06).
- *Left open:* For the rule-fix round, as the merge check left it.

**94. Confidence when a contested point decides a link, and now a role**
- *Rule:* High or Medium tie-break: drop to medium "only when a contradicted point decides a term the entry codes, such as a weapon's family or damage, a band, a role or the tier". Night decision N4 keeps that practice until the round and judges the level "on the cited pages".
- *Problem:* The Tempest Overflow page leaves the Voltaic Tank out of its Voltaic Reaction list (logged with sources_disagree and read as a copying slip). In the fill this decided only pattern links, so the coder kept high, unsure whether a pattern link is a coded term. Since the merge check (REG-09) the tooltip's 'disables' names disabler, so step 1 has two roles and anti-armour wins only through the Voltaic Reaction bonus (item 42); without it the primary would be assault. The contested point now decides a role, yet roles/primary has no uncertain entry, and confidence stays high only because the Overflow page is named in an uncertain entry and not cited. Units: `tempest-rising.dynasty.voltaic-tank`.
- *Fix:* Add an uncertain entry at roles/primary that names the Overflow page. Under N4 the level is judged on the cited pages, and the Overflow page is only named in an uncertain entry, so the tank stays high for now; under item 8's fix, which reads every named page, it would drop to medium unless the batch rules the Overflow list a copying slip and removes sources_disagree. Whether a clash that decides only a pattern link drops the level also waits for the confidence rule (item 8).
- *Raised by* 1 report (j07) and the merge check (REG-09).
- *Settled in the batch:* As proposed: the Voltaic Tank has an uncertain entry at roles/primary that names the Overflow page. Its confidence stays high under N4; item 8 decides the rest.

**95. Official text older than the version researched**
- *Rule:* High or Medium tie-break: a contradicted point lowers the level only when "no official text settles it".
- *Problem:* The base-game manual (official, 2003) gives the Red Guard a bayonet for close fighting. The wiki says it was cut, and the 1.04 files have no bayonet among his weapons or buttons. The coder read the old manual as not settling the point, coded no bayonet and dropped the entry to medium; if the manual does settle it, the entry would be high with a melee weapon. The rules do not say whether official text that the game data at the version researched contradicts still settles a point. R1's batch item 10 settled a like case in the RA1 notes; the Generals notes have no such item. Units: `generals.china.red-guard`.
- *Fix:* Add to the Generals notes, as the RA1 notes do for the remaster: the base-game manual describes the game at release; where the 1.04 files and the wiki show a feature cut or changed by 1.04, that is a version difference, not a contradiction, so code 1.04 and name the manual in an uncertain entry without sources_disagree. The Red Guard would become high, with no bayonet. *Alternative:* A rule in the confidence word list for every game: official text older than the version researched does not settle a point that the game data at that version contradicts (a rules change, for Mustafa).
- *Raised by* 1 report (j03).
- *Left open:* It changes a confidence level, and the confidence rule itself waits for the rule-fix round (item 8). The Red Guard stays medium.

**96. Tier gate: the factory or the building it waits for**
- *Rule:* tier.gate: "The tech gate from the game's tier_map". The Generals notes read the gate from the Prerequisites block of the unit's 1.04 Object file.
- *Problem:* The Combat Chinook is built at the Air Force General's Supply Center once a War Factory stands, and both are t1. No rule says which to name. The coder named the War Factory, the extra building it waits for, as Jarmen Kell's entry names the Palace rather than the Barracks. R1's batch item 14 (two gates of one tier) did not cover a factory beside a prerequisite. Units: `generals.usa-air-force.combat-chinook`.
- *Fix:* Say in the Generals tier-gate note that the gate is the building in the Prerequisites that the unit waits for beyond its own factory (as coded).
- *Raised by* 1 report (j01).
- *Settled in the batch:* As proposed: one line in the Generals notes. No unit changes.

**97. variant_of for a general's unit of its own**
- *Rule:* variant_of: "For subfaction or general-specific versions: the base unit id." The Generals notes: a general's unit with its own in-game name "is a unit of its own".
- *Problem:* It is unclear whether a unit of its own still takes variant_of. The coder set the Combat Chinook's to the ordinary Chinook, which the wiki names as its base unit. Units: `generals.usa-air-force.combat-chinook`.
- *Fix:* Say in the Generals notes that a general's unit of its own still sets variant_of to the main unit its sources name as its base, and that being a unit of its own decides its id, its faction and which official text it reads (as coded).
- *Raised by* 1 report (j01).
- *Settled in the batch:* As proposed: one line in the Generals notes. No unit changes.

**98. Two damage names from two sources that map to one type**
- *Rule:* armament[].damage step 4 applies when the sources give the weapon "one game damage category that the map lists". The Generals damage note sends a weapon the sources give two names to step 5.
- *Problem:* The wiki names the damage of the Technical's machine gun and salvaged cannon Comanche Vulcan, and Weapon.ini says GATTLING; both map to kinetic. The coder took them as one category (step 4), so the cannon is kinetic, which the cannon family does not allow, and it carries an atypical line (item 3). Read as two names, the cannon goes to step 5 and comes out explosive (its shell hurts an area), with no break. The note's examples are a shell with the field it leaves and different names against ground and air; it does not say whether two sources naming one category differently count as two names. Units: `generals.gla.technical`.
- *Fix:* Say in the Generals damage note that names from different sources that map to the same type are one category (step 4, as coded), and that two names means names that map to different types, or one name per kind of target. *Alternative:* Two names from two sources always go to step 5: the Technical's cannon becomes explosive and its atypical line goes.
- *Raised by* 1 report (j02).
- *Settled in the batch:* As proposed: one line in the Generals notes. No unit changes.

**99. A 1.04 command set that fills one slot twice**
- *Rule:* The Generals notes read what a factory offers from its 1.04 command set ("what a factory really offers is its CommandSet in CommandSet.ini"), and N2 puts the extra or missing buttons of a general's version in tier.basis; nothing says how to read a set that gives one slot two buttons.
- *Problem:* The Stealth General's Battle Bus command set gives slot 1 first to a disguise button and then to an unload button. The coder took the later line as the button the game shows, without checking the engine code. On that reading, with the missing disguise module and the wiki's trivia that the disguise was cut, the bus's tier.basis says that general's copy never disguises. The Generals analyst left it out as a source problem, but the notes read command sets for every Generals unit, so the next repeated slot will raise it again. Units: `generals.gla.battle-bus`.
- *Fix:* Add one line to the Generals notes: when a command set fills one slot twice, read the later line as the button shown, as the coder did, and name the earlier one in an uncertain entry, until someone checks the engine code. The bus already does both and stays as coded.
- *Raised by* 1 report (j01).
- *Settled in the batch:* As proposed: one line in the Generals notes. No unit changes.

**100. Naming what can hit aircraft in a game that does not split its fliers**
- *Rule:* Matchups rule 1: name the enemy "by what it fires when they name a weapon"; a hits: link means the unit "has a weapon that can hit this kind of target". The Tempest Rising notes: only weapons with an Air line hit aircraft, and such a weapon lists low air and high air.
- *Problem:* The Thunderhead's countered_by names the weapons that reach it as hits:low-air, its own layer. In this game every Air-line weapon also lists high air, while in other games hits:low-air matches most direct-fire weapons. hits:high-air and role:anti-air were the alternatives, and the rules do not say which. Units: `tempest-rising.veti.thunderhead`.
- *Fix:* Say in the notes' item on aircraft as targets that an enemy able to hit Tempest Rising aircraft is named hits:high-air, which means an air-capable weapon in every game, and recode the Thunderhead's countered_by/0. *Alternative:* Settle it in Matchups rule 2 for every game where only anti-air weapons reach fliers (a rules change, for Mustafa).
- *Raised by* 1 report (j08).
- *Settled in the batch:* As proposed: the notes name hits:high-air, and the Thunderhead's first countered_by link now uses it.

**101. disable-machine for a weapon that shuts down only buildings**
- *Rule:* Pattern links: link a pattern when it gives "the same interaction and the enemy the same counterplay as the pattern's summary". disable-machine's registry summary: "Pin or shut down a vehicle or drone with an electric or EMP effect."
- *Problem:* The Voltaic Tank's Structural Overload powers down buildings only, never vehicles. Its cannon links disable-machine as a partial fit, with an uncertain entry, beside the silence trait, which already records the shutdown. Units: `tempest-rising.dynasty.voltaic-tank`.
- *Fix:* Drop disable-machine from the Voltaic Cannon; no role changes, since the silence trait meets disabler. *Alternative:* Add a building variant to disable-machine at the pattern review.
- *Raised by* 1 report (j07).
- *Settled in the batch:* As proposed: the Voltaic Cannon no longer links disable-machine. The silence trait records the shutdown, and the weapon's uncertain entry says why the pattern is left off. No role changes.

**102. depend-on-relay for a unit destroyed with its relay**
- *Rule:* Pattern links: the same interaction and counterplay as the pattern's summary. depend-on-relay's registry summary has linked units shut down while their relay is gone, until a working relay exists again.
- *Problem:* The Vimana is destroyed outright when its Celestial Gate falls, and each Gate supports one Vimana. It links depend-on-relay (the counterplay is the same: kill the relay), with a fit_note for the harsher variant. The pattern's file, written in R1, already has two variants in which losing the relay brings the unit down: home-pad (an aircraft tied to one landing pad, lost if the pad falls while it flies; one plane per airfield) and untouchable-tether (a unit that ordinary weapons cannot harm, brought down with its relay). Neither fits as written: home-pad ties the aircraft to a pad where it reloads limited ammunition, which the Vimana does not have, and any weapon can harm the Vimana. Units: `tempest-rising.veti.vimana`.
- *Fix:* Name the home-pad variant in the ability's summary now, as the nearest (one aircraft per relay, lost when it falls), and reword the fit_note to say that home-pad fits except for the pad and its reload; at the pattern review, widen home-pad so that the pad may be any relay and the reload is optional, then drop the fit_note. *Alternative:* Add a death-bond variant to depend-on-relay at the pattern review (the unit dies with its relay; one unit per relay), then drop the fit_note.
- *Raised by* 1 report (j08).
- *Settled in the batch:* The part the batch can do: the Vimana's ability names home-pad as the nearest variant, and its fit note says what does not fit. Widening the variant waits for the pattern review.

**103. Newest official text: does older text still count?**
- *Rule:* The Tempest Rising notes: "Use the newest official text that speaks to the unit, since a later patch can change its job."
- *Problem:* The Enlightened's buffer role rests on the beta's build guide (May 2026) calling them a buff unit. The newer 2.0.0 notes speak to the unit (its selection group) without restating or changing that job, and it is unclear whether the older text still counts. Units: `tempest-rising.veti.enlightened`.
- *Fix:* Reword the note: older official text still counts where newer text does not change the unit's job; the newest decides only where they differ.
- *Raised by* 1 report (j09).
- *Settled in the batch:* As proposed: the note's wording. No unit changes.

**104. The Enlightened's Subjugation strength still hangs on its weapon family**
- *Rule:* Matchups: "Write the reason first, then pick the link that names the part behind it"; rule 3: "Prefer word-list and pattern links."
- *Problem:* With no id for Subjugation, the Enlightened's strength about it was hung on weapon:blades. The patterns phase added convert-on-kill and linked it on both of the Enlightened's weapons, but strengths/3 still links weapon:blades. Units: `tempest-rising.veti.enlightened`.
- *Fix:* Link strengths/3 to pattern:convert-on-kill (a data fix).
- *Raised by* 1 report (j09).
- *Settled in the batch:* As proposed: strengths/3 now links pattern:convert-on-kill.

**105. The class of Iron Harvest's exosuit heroes**
- *Rule:* Body plans: a power suit "At small size (one soldier's size, such as power armour) it is infantry; at medium size or bigger it is a walker". The size examples put power-suit troopers at small and light mechs at medium. The Iron Harvest notes allow an exosuit hero coded as infantry but do not say when.
- *Problem:* William Mason's own page calls him an infantry hero in an exosuit, and the Unit page counts exosuits as advanced infantry; but his infobox uses the mech template, the wiki calls the suit his mech, and the Unit page lists the other exosuit hero among the mech heroes. He is coded a small power-suit trooper (infantry), which brings two atypical lines (very slow on foot, pilot-eject on infantry), downed-revive and an organic nature; as a medium walker those would change. The armour notes already step exosuits to medium whatever their class. Units: `iron-harvest.usonia.william-mason`.
- *Fix:* Add to the Iron Harvest notes which class the game's exosuits take, squads and heroes alike: small power-suit infantry, as coded, with the mech-template evidence in an uncertain entry at class. *Alternative:* Medium walkers on two legs: Mason would take pilot-eject and very slow without a break, and exosuit squads would need a rule of their own.
- *Raised by* 1 report (j12).
- *Settled in the batch:* As proposed: the Iron Harvest notes name the class of exosuits. No unit changes; William Mason's uncertain entry at class already holds the mech-template evidence.

**106. The notes ask for the production page to be cited, against the limit of five sources**
- *Rule:* The Tempest Rising notes on official role lines: "Cite the production page as kind wiki, with a note that it copies the build tooltip." sources[] holds at most five pages, and where a registry note says a rule needs a page, "naming it in an uncertain entry meets that".
- *Problem:* The Drone Operator does not cite the GDF Barracks page that carries his build tooltip, unlike the other five GDF and Dynasty units. His five slots hold his own page, the Combat Drone page, StrategyWiki and two official patch posts, one of which gives anti-armour at roles.secondary step 1; his roles/primary uncertain entry names the production page. The merge check's skeptic found this allowed (conv-4, not confirmed): dropping a post to cite the page would leave a role resting on an uncited page. Units: `tempest-rising.gdf.drone-operator`.
- *Fix:* Reword the note: cite the production page, or, when the five slots hold pages the entry rests on more, name it in an uncertain entry with what its sidebox says (as the Drone Operator does). No unit changes.
- *Raised by* the merge check (conv-4).
- *Settled in the batch:* As proposed: the note's wording. No unit changes.

## Settled during the batch

**107. Four mechanics with no pattern: a companion, rage when wounded, recalling a parked suit, raising production buildings**
- *Rule:* Pattern links: "If nothing fits, keep the ability, leave its patterns empty and add a fit_note".
- *Problem:* Anna's bear and Olga's tiger (a lasting AI partner, the tiger also a mount), the Stark's Berserk (more damage as health falls), William Mason's Relocate (the parked suit jumps back to him) and the Engineer's headquarters, barracks and workshop had no pattern; each had a fit_note or was reported as a new mechanic. Units: `iron-harvest.polania.anna-kos`, `iron-harvest.rusviet.olga-morozova`, `iron-harvest.usonia.stark`, `iron-harvest.usonia.william-mason`, `iron-harvest.shared.engineer`.
- *Settled by:* The patterns phase (ef2460e): new ids command-companion (with a mount-partner variant), rage-when-wounded and build-structure, and a deploy-turret variant for Relocate, which the units now link; the fit_notes that asked for them are gone. The companion's word-list side is item 20.
- *Raised by* 3 reports (j10, j12, j13).

**108. Terms set from the 1.04 files only**
- *Rule:* The Generals note said that a term only the 1.04 files would set stays unset (friendly-fire was its example), while sources[] reads every page an uncertain entry names and the splash rule counts a radius figure in the sources.
- *Problem:* Job j02 left the Technical's rockets without splash (their radius is only in Weapon.ini) while the Overlord's cannons got splash (the wiki gives a radius). Job j04 left friendly-fire off the Aurora Bomber's bomb and kept the Sentry Drone's gun hitscan, though Weapon.ini gives it a travel speed. The coders followed the note against the field rules. Units: `generals.gla.technical`, `generals.china.overlord`, `generals.usa.aurora-bomber`, `generals.usa.sentry-drone`.
- *Settled by:* The merge pass (REG-02, 527724f): the note now sets a term from these files when a figure or flag in them meets the term's own rule (splash from a damage radius, projectile from a travel speed, friendly-fire where a blast lists allies or has no such line), and other terms stay unset. The Technical's cannon and rockets, the Overlord's cannons and the Aurora's bomb gained the traits, and the Sentry Drone's gun became projectile.
- *Raised by* 2 reports (j02, j04) and the merge check (REG-02).

**109. Where a general's version's extra or missing buttons go**
- *Rule:* The Generals notes put a general's version that differs "in the notes of the fields it would change"; abilities[] has no notes field.
- *Problem:* The Demolition General's timed and remote charges and detonator on Jarmen Kell went in tier.basis (coder A) or in on_death.notes (coder B). The same question touches the Demolition General's self-destruct button on the Battle Bus and the Technical, and the Stealth General's bus, whose button set names a disguise it never uses. Units: `generals.gla.jarmen-kell`, `generals.gla.battle-bus`, `generals.gla.technical`.
- *Settled by:* Night decision N2 (27 October 2026, reversible, in the Generals notes): tier.basis holds a version's extra or missing buttons, beside the generals it names, as all three units now do (merge check conv-5). N2 stands in for a rule: the rule change that would replace it is the reconciler's other proposal, an optional abilities[].notes field, or else a line in tier.basis's field rule that names this use. Either is Mustafa's to take.
- *Raised by* 3 reports (Kell coder A, Kell coder B, Generals reconciler) and the merge check (conv-5).

**110. Wiki 'Lore' quotes as official text**
- *Rule:* The Iron Harvest notes ruled that the wiki's italic opening line is not official text, and said nothing of the quotes under a page's Lore heading, which read like the in-game Codex.
- *Problem:* The Kaiser's Lore quote would give roles step 4 a strength against infantry and mechs, and so an anti-infantry primary role, if it were official. Both opening coders asked; the Grimbart's and the Nakovalnya's pages carry such quotes too. Units: `iron-harvest.saxony.kaiser`, `iron-harvest.saxony.grimbart`, `iron-harvest.rusviet.nakovalnya`.
- *Settled by:* The merge pass (REG-12, 527724f): the Lore quotes are the wiki's own words unless a readable source shows them in the game. No unit changed.
- *Raised by* 2 reports (Kaiser coder A, Kaiser coder B) and the merge check (REG-12).

**111. Super-heavy 'by size' with no footprint**
- *Rule:* Armour classes, check A: super-heavy is only for a huge unit at t3, and for a unit the game's armour_map or registry notes make super-heavy.
- *Problem:* The notes lifted the Tempest Sphere to super-heavy by size, though it is coded large, and the Vimana's super-heavy rested on a huge size taken from Codex words, over the armour map's light for aircraft. Units: `tempest-rising.dynasty.tempest-sphere`, `tempest-rising.veti.vimana`.
- *Settled by:* The merge pass (REG-07, 527724f): the note lifts the Sphere, the War Ender and the Vimana by health (more than twice either main battle tank's) and says this decides no size. The sizes themselves stay open (item 1).
- *Raised by* 2 reports (j07, j08) and the merge check (REG-07).

**112. Arcing: passive or triggered**
- *Rule:* Ability kinds, Passive or Triggered tie-break: pick triggered "when each event causes a one-off effect".
- *Problem:* The notes said to record Arcing as a passive ability, while the tie-break makes a strike back at each attack triggered. Units: `tempest-rising.veti.thunderhead`, `tempest-rising.veti.vimana`.
- *Settled by:* The merge pass (REG-04, 527724f): the note says triggered, both units are recoded, and Arcing links the new retaliate-on-hit pattern.
- *Raised by* 1 report (j08) and the merge check (REG-04).

**113. A doctrine that names every unit of a class**
- *Rule:* Shared mechanics: a side-wide power "that changes every unit of a class is left off too".
- *Problem:* Engine Tuning names all 14 Veti vehicles and aircraft, and the notes asked to record it, so the Thunderhead and the Vimana carried it as an ability, with fit_notes for its status immunity. Units: `tempest-rising.veti.thunderhead`, `tempest-rising.veti.vimana`.
- *Settled by:* The merge pass (REG-03, 527724f): class-wide doctrine changes stay off, new effects included; Engine Tuning is mentioned in armour.notes only, and both abilities are gone. The missing term for its status immunity is item 79.
- *Raised by* 1 report (j08) and the merge check (REG-03).

**114. A wiki figure that a later official post changed: a contradiction to log?**
- *Rule:* High or Medium tie-break: record contradictions between pages in uncertain with sources_disagree, and drop the level only when the point decides a coded term and "no official text settles it".
- *Problem:* The Mocny's infobox gives planted reload and blast figures that look stale against DevBlogs #41 and #45, and Anna's rifle damage predates Change Log #17's cut. The Mocny's coder asked whether such a stale figure counts as a contradiction, and logged it. Units: `iron-harvest.polania.mocny`, `iron-harvest.polania.anna-kos`.
- *Settled by:* The tie-break as written, with N4's logging: every such clash is logged with sources_disagree, and the official post settles the point, so the level does not drop on it.
- *Raised by* 1 report (j11).

**115. The infobox's '(Ability)' slot against the mode-weapon rule (the Kaiser's rockets)**
- *Rule:* armament[].slot and armament[].mode: "A weapon that a mode adds while the primary keeps firing is also secondary, with mode." The Iron Harvest notes on wiki traps sent every '(Ability)' slot, the Kaiser's Rockets by name, to abilities.
- *Problem:* Both opening coders and the reconciler followed the note, so the entrenched rocket batteries, which keep firing salvos while the mode lasts, existed only in words inside the Entrench ability, and no weapon recorded the deploy mode's main payoff. Units: `iron-harvest.saxony.kaiser`.
- *Settled by:* Night decision N1 (27 October 2026, reversible): a slot that a mode adds as a standing weapon is coded as a weapon with the mode, and the button that enters the mode stays the ability; the Kaiser was recoded (its veteran side effects are item 23). N1 only puts the field rules ahead of the note, so no rule change is needed to replace it; if Mustafa wants it said for every game, one line in Weapons vs abilities would do: a standing attack that a mode adds and that fires with the attack order is a weapon with that mode, whatever the game's own menus call it.
- *Raised by* 3 reports (Kaiser coder A, Kaiser coder B, Iron Harvest reconciler).

**116. The horde bonus: no pattern, and the note's count**
- *Rule:* rally-allies needs one unit that raises the others; the Generals note counted four other soldiers "of any kind".
- *Problem:* The Red Guard's horde bonus had no pattern (a fit_note), so its strength hung on weapon:small-arms, since no rule names a link for a passive with no pattern; and the note's count disagreed with the code and the wiki, which count only soldiers that carry the bonus themselves. Units: `generals.china.red-guard`.
- *Settled by:* The patterns phase and the merge pass (REG-05, facts-05): the horde passive links the new id band-together, and the note counts only soldiers that carry the bonus. The strength still hangs on weapon:small-arms and could now link pattern:band-together (a data choice, no rule needed).
- *Raised by* 1 report (j03) and the merge check (REG-05, facts-05).

**117. The soldier rule against the notes' 'the label is enough'**
- *Rule:* Armour classes, soldier rule: a soldier is light when its game data gives it tougher armour than the game's basic rifle infantry, and the rule wins over every step. The Tempest Rising notes first said the infobox label alone decides the class.
- *Problem:* The Line Officer's Infantry label gave unarmoured, though he resists four damage types that the Field Scout does not. The coder followed the notes. Units: `tempest-rising.dynasty.line-officer`.
- *Settled by:* The merge pass (REG-01, 527724f): the note applies the soldier rule with a test against the Field Scout's resistances, and the Line Officer is now light.
- *Raised by* 1 report (j06) and the merge check (REG-01).

**118. 'Disables' as a word form of disabler**
- *Rule:* Roles: official words name a role through its label or an alias "in any word form", and only when they describe the unit's own job.
- *Problem:* The notes' list of role words in the tooltips left out the Voltaic Tank's 'disables', which decides its path through step 1 and the order of its second roles. Units: `tempest-rising.dynasty.voltaic-tank`.
- *Settled by:* The merge pass (REG-09, 527724f): the list now reads 'disables' as disabler for the Voltaic Tank, as the Generals note reads 'disable', in line with R1's batch item 9 as settled in 1.1.0. Its side effects are items 42 and 94.
- *Raised by* 1 report (j07) and the merge check (REG-09).

**119. Codex wording that nothing is a match for the unit**
- *Rule:* roles.primary step 4 counts official text that says the unit "is strong against" a target; the Tempest Rising notes list the phrases that give strengths.
- *Problem:* The notes' list did not say whether it was complete, and it left out the Tempest Sphere's Codex sentence, which decides anti-infantry against assault as its primary role. Units: `tempest-rising.dynasty.tempest-sphere`.
- *Settled by:* The merge pass (REG-10, 527724f): the list now includes being no match for the unit, and any wording that says the unit beats a kind of target.
- *Raised by* 1 report (j07) and the merge check (REG-10).

**120. Iron Harvest's shared faction and the Engineers**
- *Rule:* Ids: "The faction id shared is reserved for units every side can field." The registry described Iron Harvest's shared faction as the common aircraft and weapon systems only.
- *Problem:* The Engineer, whose stat box and stock build list are the same for every faction, was recorded once under shared, against the registry's description; only the bunkers of veteran and elite engineers differ by side. Units: `iron-harvest.shared.engineer`.
- *Settled by:* The merge pass (REG-06): the registry's shared faction now covers the engineers too, and the notes say so.
- *Raised by* 1 report (j13) and the merge check (REG-06).

**121. A balance line in a patch post as strong-against text**
- *Rule:* roles.primary step 4 counts official text that the unit is strong against a target. The Iron Harvest list of such text left out DevBlog #40's line on Anna and Wojtek.
- *Problem:* Anna's primary role, anti-infantry, rests on DevBlog #40's word that the pair outmatch most infantry groups when they arrive, a balance comparison rather than a matchup line; read otherwise, step 5 gives assault. Units: `iron-harvest.polania.anna-kos`.
- *Settled by:* The merge pass (REG-11, 527724f): the line counts, weighed as of its patch.
- *Raised by* 1 report (j10) and the merge check (REG-11).

**122. The engineers' build menu: which pattern each defence serves, and one source per entry**
- *Rule:* abilities[]: a build menu is "one entry per pattern its items serve", and an entry takes one source. The Iron Harvest notes named only build-cover and lay-mines for the engineers' fortifications.
- *Problem:* The Engineer's MG and cannon bunkers and its anti-air turret fire by themselves (deploy-turret), its unarmed bunker shelters a garrison, and one entry mixed an item every engineer has with bunkers that only veteran and elite engineers build. Units: `iron-harvest.shared.engineer`.
- *Settled by:* The merge pass (REG-13, 527724f): unarmed bunkers are build-cover, defences that fire by themselves link deploy-turret, and a mixed build-menu entry takes the source of the item every squad has (innate) and names the ranks in its summary.
- *Raised by* 1 report (j13) and the merge check (REG-13).

**123. An ability attack in an unmarked infobox slot (the Nakovalnya's Bombardment)**
- *Rule:* The Iron Harvest notes on wiki traps listed only the weapon slots marked '(Ability)' as abilities.
- *Problem:* The Nakovalnya's Bombardment sits unmarked in its first weapon slot, though the page lists it under abilities and has it aimed by hand; coded as a weapon, it would have added anti-infantry. Its coder asked which evidence wins. Units: `iron-harvest.rusviet.nakovalnya`.
- *Settled by:* The merge pass (REG-14, 527724f): a weapon slot whose name the page's Abilities section lists is an ability too, marked or not.
- *Raised by* 1 report (j13) and the merge check (REG-14).

**124. The Battle Bus's bunker: which pattern switches to it, and a link used twice**
- *Rule:* modes[].via: "The pattern that switches to this mode"; no rule says whether one link may appear twice in a list.
- *Problem:* No pattern switched a form on death, so the bunker mode and the second-life ability linked passenger-sets-weapon (its wreck-bunker variant), and that link then appeared twice in the bus's strengths and twice in its weaknesses. Units: `generals.gla.battle-bus`.
- *Settled by:* The patterns phase: the new id fortify-on-death is the mode's via and the second-life ability's pattern, and it carries one strength and one weakness, so no list repeats a link (the integration check's decision 3). The word-list side is item 25.
- *Raised by* 1 report (j01) and the patterns integration check.

**125. Income earned in place, and pay that rises with rank**
- *Rule:* gather-resources rests on a field, a route and a drop-off; Paired entries links earn-veterancy only for a weapon that comes with a rank.
- *Problem:* No pattern covered the Hacker's Internet income (a fit_note), and it was unclear whether its pay rising with each rank called for earn-veterancy. Units: `generals.china.hacker`.
- *Settled by:* The patterns phase: Hack Internet links the new id generate-income, whose summary covers earning more with each rank gained by doing it; the fit_note is gone.
- *Raised by* 1 report (j03).

**126. Clearing a garrison from the air**
- *Rule:* Pattern links; drop-in-from-above covered only arriving on a chosen spot.
- *Problem:* The Combat Chinook's Combat Drop sends Rangers down ropes to kill the soldiers in a building and hold it; no pattern covered the clearing (a fit_note). Units: `generals.usa-air-force.combat-chinook`.
- *Settled by:* The patterns phase: drop-in-from-above's storm-a-garrison variant covers it, and the fit_note is gone.
- *Raised by* 1 report (j01).

**127. Immunity on an attack run that makes aimed fire miss**
- *Rule:* become-invulnerable: make yourself immune to damage for a moment, at a cost.
- *Problem:* The Aurora Bomber's attack run makes aimed attackers miss rather than ignore damage (area blasts still hurt it), comes with every attack order and is paid for by a slow trip home; the coder linked become-invulnerable with a fit_note. Units: `generals.usa.aurora-bomber`.
- *Settled by:* The patterns phase: become-invulnerable's attack-run variant covers it (the asked-for untouchable-attack-run was folded into it), and the fit_note is gone.
- *Raised by* 1 report (j04).

**128. The Repair Turret: the task text against the notes**
- *Rule:* Pattern links: the same interaction and counterplay as the pattern's summary; deploy-turret's summary then asked for a device that fights.
- *Problem:* The task named deploy-turret, while the notes kept the Repair Turret off it because it only repairs; it was coded repair-allies, with a fit_note asking for a placed-device pattern. Units: `tempest-rising.gdf.shieldmaiden`.
- *Settled by:* The patterns phase: deploy-turret's summary was widened and a support-station variant added, the note sends the Repair Turret there, and the Shieldmaiden links deploy-turret and repair-allies.
- *Raised by* 1 report (j06).

**129. Tempest Plating: healing that comes only from using up a debuff**
- *Rule:* abilities[]: "If a word-list term says the same, use the term instead"; the self-repair armour model is health that comes back on its own.
- *Problem:* Self-repair only partly matched a perk that heals the Tempest Sphere by using up Tempest Charge, and the notes said to record it without saying as what. Units: `tempest-rising.dynasty.tempest-sphere`.
- *Settled by:* The patterns phase: a new pattern, heal-from-debuff (feed-on-status variant), which the note names and the Sphere's passive links.
- *Raised by* 1 report (j07).

**130. Sacrifice: how much of the receivers' bonuses the giver carries**
- *Rule:* Pattern links: the same interaction and counterplay as the pattern's summary. The Tempest Rising notes put each Consecrated perk on the unit that receives it.
- *Problem:* The Enlightened's Sacrifice linked only rally-allies and resupply-allies; giving up its own life and the bonuses that depend on each receiver had no pattern, and nothing said how far the giver's entry should carry them. Units: `tempest-rising.veti.enlightened`.
- *Settled by:* The patterns phase: a new pattern, sacrifice-for-allies, with spend-minion, spend-self and receiver-bonus variants; the notes say which buttons link which ids, and the Enlightened links it.
- *Raised by* 1 report (j09).

**131. Tempest Rising's silence blocks only abilities**
- *Rule:* The silence trait: "The target can move but can't fire or use abilities." disable-machine covers machines stopped by electric or EMP effects.
- *Problem:* The game's Silenced status blocks abilities but not firing, so neither the trait nor any pattern fitted EM Interference's effect; the Sentinel's ability had an empty pattern list and a fit_note. Units: `tempest-rising.gdf.sentinel`.
- *Settled by:* The patterns phase: a new pattern, block-abilities, whose block-the-marked variant names EM Interference, and the Sentinel links it. Whether the doctrine stays on the Sentinel is item 91.
- *Raised by* 1 report (j05).
