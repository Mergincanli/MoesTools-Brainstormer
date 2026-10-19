# Pilot round 1: decisions on the 150 proposals

Every proposal from the six analysis files (128 by the analysts, 22 added by the reviewers as MISSING) has one decision below. Change texts are not repeated here: an implementer takes the reviewer's `revised_change` (apply-revised), the analyst's `change` (apply-as-proposed; for an item the reviewer added, that item's own `change`), or the final text in [conflicts.md](conflicts.md) where a row points to a conflict (C1 to C21). Where conflicts.md gives a text for part of a proposal, that text wins.

## Counts

| Decision | Count |
|---|---|
| apply-revised | 74 (2 of them in part) |
| apply-as-proposed | 35 |
| apply-as-proposed, no file change | 13 |
| apply-merged | 16 |
| deferred | 11 |
| skipped | 1 |
| **Total** | **150** |

Applied in all: 122, plus 16 merged into another proposal's final text.

## How the rules were applied

- Every must is applied (none was rejected; the reviewers rejected nothing).
- Every should is applied unless it conflicts or needs unjustified new machinery. Two shoulds are deferred: armour/negated-links (a new kind of typed link; matchup fields are information only and the negation cases appear in 4 of 12 reports) and armour/resource-pay-per-use (conflicts with scales/resources-team-stock; a design call, Mustafa item 2).
- A could is applied only when it is a short wording change with a clear benefit. Coulds that add a term, a requires gate, a combination rule, a validator check or a required field are deferred.
- New machinery that goes in, with its justification: the registry fields sight_reference and range_reference (sight hesitations in 10 of 12 reports, range in 12 of 12); on_death.notes (on_death.outcomes 72.2%, gaps in 7 of 12 reports); validator checks for seats, slots and the main weapon (armament.seat 66.7%, main weapon 77.8%, weapon count 61.1%), mounts (10 of 12 reports), crew basis (6 of 12), on-death defaults (72.2%), handling (7 of 12), fallback and squad count (prevents a contradiction), source_units warnings and sync-patterns (prevents a contradiction), empty ability patterns (9 of 12 reports), '/' paths (prevents a contradiction); the agreement readers (needed to measure the fields below 80% in round 2).
- Decision 2C: method A for every unit, with the scales reviewer's corrections (C5). Decisions 1B, 2A, 3C, 4B, 5B, 6C, 7B, 8B and 1A are respected; the places where they shaped a decision are named in the reasons and in conflicts.md (2A in C1, 3C in crew/on-death-plain-death, 4B in C13 and explosives, 5B in emp-vs-magnetic, 7B in availability, 8B in fortify-point).

## Decisions by group

### identity (26)

| Group | Id | Priority | Decision | Package(s) | Reason |
|---|---|---|---|---|---|
| identity | infiltrator-is-a-job | must | apply-revised | p1 | Infiltrator becomes a job; tie-break sends infesters to the anti role, hunters of workers to raider. |
| identity | roles-primary-procedure | should | apply-revised | p1 p6 | Five-step primary in fixed order, settles the 12-report hesitation; RTS main weapon now chosen without roles (C1); default-pick wording and step 2 adjusted in C21. Helicopter becomes raider for all three, by design. |
| identity | roles-secondary-ranking | must | apply-revised | p6 | roles.secondary 79.6%: ranking with each role at its first supporting step settles the IFV and drone splits; step 5 wording in C21. |
| identity | scout-needs-information | must | apply-revised | p1 | Speed alone no longer makes a scout; uses role aliases and in-game sensors basis. |
| identity | role-boundaries | should | apply-revised | p1 | Area denial vs siege, engineer vs infiltrator vs logistics, engineer vs area denial; transport needs two seats; marksman only the sniper family. |
| identity | sample-td-primary | must | apply-as-proposed | p9 | Sample primary infiltrator -> anti-armour, secondaries reordered (C4). |
| identity | sample-ifv-secondary | must | apply-as-proposed | p9 | Sample secondaries -> [raider, anti-infantry] (C4). |
| identity | sizes-by-example | should | apply-revised | p1 | Examples win over measurement; weight words are not sizes; fallback for games without foot soldiers. |
| identity | sample-td-size | must | apply-as-proposed | p9 | Sample drone tiny -> small with its notes, memorable and as_player edits (C4). |
| identity | confidence-rule | must | apply-revised | p1 p6 | Source-level test for high/medium (confidence 55.6% between coders); source description in C12. |
| identity | source-kind-copies | must | apply-revised | p1 | A wiki copy of official text is wiki with a note; archived official pages stay official. |
| identity | lineage-rule | should | apply-revised | p6 | Which games count, how to match and name the id; slug rule shared with C14. |
| identity | sample-hammer-lineage | should | apply-as-proposed | p9 | Remove lineage 'hammer-tank' (C4). |
| identity | flavour-affinity-rule | should | apply-revised | p6 | Mechanical scoring on any slotted weapon, not the main weapon; Riflemen lose soviet against the coders' theme call (Mustafa item 4). |
| identity | official-role-lines-registry | should | apply-revised | p8 | Says where each pilot game's official role line lives; roles step 1 depends on it. README line merged with C10's. |
| identity | availability-cap-rule | could | apply-revised | p1 | Short wording; settles 5 reports; unique defined as decision 7B's hero flag. |
| identity | body-plan-carrier-tie-break | could | apply-revised | p1 | Short tie-break; settles the IFV body hesitation in 4 reports; mode sentence stops body copies in modes. |
| identity | nature-crew-evidence | could | apply-revised | p1 | Short source rule with a default for silent sources (feeds the 3C on-death default). |
| identity | drone-class-on-legs | could | apply-as-proposed | p1 | One-line note; closes C-ra3's doubt. |
| identity | body-count-default | could | apply-as-proposed | p6 | One-line description: leave count out when 1. |
| identity | infiltrator-requires | could | deferred | - | Adds a requires gate for cards, not a wording change; no pilot unit affected. Revisit with the generator. |
| identity | keep-anti-armour-infest | could | apply-as-proposed (no change) | - | No change: pattern:infest-vehicle stays in anti-armour's requires. |
| identity | keep-two-secondaries | could | apply-as-proposed (no change) | - | No change: cap of two stays; the ranking settles which two. |
| identity | MISSING siege-requires-drop | must | apply-as-proposed | p1 | Siege requires gains delivery:drop; without it primary step 3 (bombs -> siege) contradicts the requires gate. |
| identity | MISSING role-aliases | must | apply-as-proposed | p1 | Aliases on roles terms (field already in vocabulary.schema.json and printed by build-docs). |
| identity | MISSING buffer-description | should | apply-as-proposed | p1 | Narrows buffer so a spawn-point button cannot claim it. |

### scales (22)

| Group | Id | Priority | Decision | Package(s) | Reason |
|---|---|---|---|---|---|
| scales | speed-raw-rule | must | apply-revised | p6 | Same-scale test keeps unitless game values; band follows the stored rounded value; series figures per C2. |
| scales | speed-method-a | must | apply-revised | p2 p6 p8 | Decision 2C: method A for every unit (Mustafa item 1). Final speed-bands text in C5; BF boost line only after checking the Vehicle Boost page. |
| scales | numeric-band-edges-convention | must | apply-revised | p6 | Edge rule matches validate.mjs lines 483 and 494; no stat figures in text fields. Final bullet in C3. |
| scales | speed-bands-exact-edges | must | apply-as-proposed | p2 | Term texts match validate.mjs line 494 (texts in C5). |
| scales | cooldown-bands-exact-edges | must | apply-revised | p2 p6 p8 | Exact edges, spans, charges, per-life, SC2 Faster seconds; stock-limited abilities have no band (C7). |
| scales | range-band-anchor | must | apply-revised | p2 p6 | Range anchored on the registry reference weapon and own sight; IFV bark and roar stay long. |
| scales | sensors-basis-sight-only | must | apply-revised | p6 | Basis covers the sight band only; traits never proposed. Proposals-vs-facts bullet in C18. |
| scales | ra3-ifv-sample-fix | must | apply-revised | p9 | Radar removed; Cryo and Bow ranges long -> medium; bark/roar stay long (C4). |
| scales | sc2-armory-note | must | apply-as-proposed | p8 | games-r5.md drifted from data/games.json (Armory t2, Hellbat t2). |
| scales | sight-band-anchor | should (reviewer: must) | apply-revised | p2 p6 | 10 of 12 reports hesitated; anchor on the registry sight reference, word-scale grades accepted. |
| scales | sensor-traits-default-fit-only | should | apply-revised | p2 | Settles the only sensors.traits split (helicopter radar); picks go to notes (C8). |
| scales | registry-sight-range-reference | should (reviewer: must) | apply-revised | p6 p8 | New registry fields justified: sight hesitations in 10/12 reports, range in 12/12. Optional first, filled for all 28 games, then required. |
| scales | series-title-convention | should | apply-revised | p6 p8 | Carrier of the series rule; final text in C2 (merges armour and weapons series proposals). |
| scales | stationary-mode-no-speed | should | apply-merged into structure/modes-parts | p6 p2 | Mode text merged into C6; its 'no band for standing still' sentence is in the speed-bands text (C5). Card-side change deferred. |
| scales | tiers-addon-and-no-tier | could | apply-revised | p2 | Short; settles B-sc2 (Tech Lab) and B-battlefield (null tier vs min_tier); keeps DoW add-on steps. |
| scales | cost-edge-and-raw | could | apply-revised | p2 p6 | Short; matches validate.mjs line 483; says what raw price leaves out. |
| scales | resources-team-stock | could | apply-revised | p2 | Short; settles 3 coh1 reports. Carrier of C7 (limited-ammo text merged with weapons). |
| scales | sensor-gaps-no-change | could | apply-as-proposed (no change) | - | No new sensor trait; vision-mode pattern left to the gap report. |
| scales | MISSING speed-bands-from-words | should | apply-merged into scales/speed-method-a | p2 | Words-to-band passage goes into the speed-bands description (C5); settles the PS2 Sunderer split. |
| scales | MISSING registry-optics-grades | should | apply-merged into scales/registry-sight-range-reference | p8 | Wargame (and Broken Arrow if confirmed) optics grades mapped in sight_reference during the 28-game registry pass. |
| scales | MISSING stock-values-for-scales | should | apply-as-proposed | p6 | New Conventions bullet 'Stock values' (C3; adds weapons next to abilities). |
| scales | MISSING registry-speed-references-sustained | could | deferred | - | Registry research (gait per shooter reference, Arc Raiders sprint check), not a wording change; for the research run's registry pass. |

### crew (18)

| Group | Id | Priority | Decision | Package(s) | Reason |
|---|---|---|---|---|---|
| crew | seat-leave-out-driver | must | apply-as-proposed | p3 p6 p7 | armament.seat 66.7%: driver is never written; seat must exist on the unit. Seat text merged in C1. |
| crew | seat-and-primary | must | apply-merged into structure/main-weapon-and-slots | p6 p7 | Seat-and-slot rule merged into C1 (in-game crews copy the source seat; proposal crews follow 2A). |
| crew | crew-model-rts | must | apply-revised | p1 p3 p6 p7 | Drops 'lore'; RTS units are proposals and solo unless two weapons fire at once (6 of 12 reports). Bodies change merged in C13. |
| crew | solo-fallback-test | should | apply-revised | p3 | Ordered test settles all three Battlefield reports; implementer checks the PS2 Liberator/Sunderer and Foxhole engineer seat first. |
| crew | on-death-plain-death | must | apply-revised | p3 p6 p7 | on_death 72.2%, 12 of 12 reports: plain RTS death is a proposal with the 3C default; validator enforces it. |
| crew | on-death-notes | should | apply-revised | p6 p9 | New field justified: settles on_death.outcomes (72.2%), gaps in 7 of 12 reports. Sample notes in C4. |
| crew | mount-order | must | apply-revised | p1 p3 p6 p7 | Ordered mount test (10 of 12 reports); body-aim never on another seat. Bodies change in C13. |
| crew | hammer-mount-sample | must | apply-as-proposed | p9 | Hammer cannon and beam free-aim -> slow-turret (C4). |
| crew | handling-default | should | apply-revised | p3 p6 p7 | Keep the mobility default unless a listed reason applies (7 of 12 reports); warning only when notes are empty. |
| crew | mobility-traits-required | could | deferred | - | Making the field required is a schema change, not wording; agreement already reads a missing list as empty, so no pilot effect. |
| crew | boost-not-retreat | could | apply-revised (part) | p3 | Boost wording only (C19). The list sentence and the two-way validator check are deferred: new check, 3 of 12 reports. |
| crew | passenger-module-foxhole-example | could | apply-as-proposed | p3 | Short; removes an example that would make a Foxhole tank carry passenger-module riders. |
| crew | passengers-no-change | could | apply-as-proposed (no change) | - | No change to passenger and seat-layout fields. |
| crew | MISSING solo-fallback-only-multi-seat | should | apply-as-proposed | p6 p7 | Prevents a contradiction (schema says multi-seat only; validator checks one way); squad needs count 2+. |
| crew | MISSING battlefield-commander-example | should | apply-as-proposed | p3 | Check the BF3 tank seat list first; consistent with crew-model-rts's commander rule. |
| crew | MISSING agreement-per-weapon-and-basis | should | apply-as-proposed | p7 | Round 2 cannot test the new seat, mount, crew-basis and death rules without these readers (C15). |
| crew | MISSING mixed-passenger-kinds | could | deferred | - | No pilot case; gap report. |
| crew | MISSING mode-mobility-and-handling | could | apply-merged into structure/modes-parts | p6 | Merged into the mode mobility text (C6). |

### structure (21)

| Group | Id | Priority | Decision | Package(s) | Reason |
|---|---|---|---|---|---|
| structure | weapon-entry-count | must | apply-revised | p6 | Weapon count 61.1%: counting rules. Rule (1) adjusted for damage/delivery (C11), rule (4) points to the series rule (C2). |
| structure | passenger-entries | must | apply-merged into structure/main-weapon-and-slots | p6 p7 | Passenger slot, when and condition texts and the 'when only on passengers' check are in C1. |
| structure | shared-mechanics | must | apply-revised | p6 p8 | Game-wide mechanics and universal keys stay off units; p8 writes the per-game list before coding (pilot games now, round-2 games before round 2). |
| structure | main-weapon-and-slots | must | apply-revised | p6 p7 | Carrier of C1 (main weapon 77.8%): slot, seat, option_group, default, when, mode texts and checks. |
| structure | ability-source-required | must | apply-as-proposed | p6 | abilities.source 63% came from leaving out the default; field becomes required. |
| structure | atypical-follows | must | apply-as-proposed (no change) | p7 | No field change; agreement report marks atypical rules as derived (C15). |
| structure | paired-entry-patterns | must | apply-revised | p6 | Carrier of the Paired entries bullet (C9), with upgrade and transport additions. |
| structure | toggle-or-deploy | must | apply-as-proposed | p4 | Deploy only when one state cannot move; settles 6 reports. |
| structure | pattern-source-units | must | apply-revised | p6 p7 | Prevents a contradiction: coders may not edit pattern files but the validator demanded it. New sync-patterns script, run in the merge pass only. |
| structure | ra3-sample-fixes | must | apply-as-proposed | p9 | Drone and IFV abilities, swap patterns, Desolator id (C4). |
| structure | ability-count-rules | should | apply-revised | p6 | One entry per button with grouping rules (23 hesitations, all 12 reports); fits decision 1B. |
| structure | weapons-vs-abilities | should | apply-revised | p6 | Replaces the bullet; a shot on its own ability button is an ability. |
| structure | ability-without-pattern | should | apply-as-proposed | p6 p7 | Removes the minItems 1 contradiction (9 reports); empty list needs a fit_note. |
| structure | pattern-link-rule | should | apply-revised | p6 | Carrier of the Pattern links bullet (C10). |
| structure | when-and-alternate | should | apply-merged into structure/main-weapon-and-slots | p6 p7 | when and mode texts in C1. |
| structure | upgrade-weapons | should | apply-merged into structure/main-weapon-and-slots | p6 | Acquired slot and option_group texts in C1; its Paired entries sentences in C9. |
| structure | ability-kind-tie-breaks | should | apply-as-proposed | p4 | Active vs channel, passive vs triggered; active may have no cooldown. |
| structure | ability-source-tie-breaks | should | apply-revised | p4 | One test (where the unlock is picked) for upgrade vs commander power. |
| structure | modes-parts | could | apply-revised | p6 | Short; settles 3 sc2 reports and defines the base form. Carrier of C6 (all mode texts). |
| structure | MISSING transport-passive | should | apply-merged into structure/paired-entry-patterns | p6 p8 | Passive for passenger seats in C9; carry-passengers summary and patterns.md fire-port lines aligned (p8). |
| structure | MISSING pattern-notes-contradictions | should | apply-as-proposed | p8 | patterns.md rows that drove the sticky-bomb and capture splits; plus the fire-port lines from C9. |

### weapons (33)

| Group | Id | Priority | Decision | Package(s) | Reason |
|---|---|---|---|---|---|
| weapons | damage-decision-order | must | apply-revised | p4 p6 | Main weapon damage 77.8%: five ordered steps; damage for a weapon with per-target categories per C11. |
| weapons | damage-map-binding-registry | must | apply-revised | p6 p8 | The map binds a single stated category; notes rewritten as firm named exceptions. |
| weapons | rockets-vs-guided-missiles | must | apply-revised | p4 | Removes the family/delivery contradiction; main weapon family on the IFV goes to 100%. |
| weapons | main-weapon-slot-crossgroup | must | apply-merged into structure/main-weapon-and-slots | p6 | Merged into C1 (two defaults on the pilot seat: first weapon slot is primary). |
| weapons | sample-fixes-ra3 | must | apply-revised | p9 | Tanya small arms, naval/structure targets, Javelin no air, Yuriko loses structure and its atypical (C4). |
| weapons | emp-vs-magnetic | should | apply-revised | p4 | Stasis ray emp for all; root/silence for lasting stops, stun only for very short ones (5B). |
| weapons | small-arms-vs-machine-gun | should | apply-revised | p4 | Judged by reload behaviour; settles BAR and Tanya (6 reports). |
| weapons | sniper-vs-small-arms-and-bows | should | apply-revised | p4 | Sniper by name, category or description; one-hit kills alone do not count. |
| weapons | artillery-vs-cannon-and-lobbed | should | apply-revised | p4 | Rocket artillery stays rockets with lobbed delivery. |
| weapons | machine-gun-autocannon-cannon | could | apply-revised | p4 | Short tie-break; removes the chin-gun doubt and keeps DoW bolters out of autocannon. |
| weapons | psionic-telekinesis | could | apply-as-proposed | p4 | One-line description; closes two reports' gap. |
| weapons | family-tie-breaks-carry-over | could | apply-as-proposed | p4 | Needed: deleting the old description sentence would otherwise lose these three rules. |
| weapons | delivery-field-rule | should | apply-revised | p6 | Silent sources take the family default (11 of 12 reports); order for one weapon with several behaviours (C11). |
| weapons | lock-on-vs-guided | could | apply-revised | p4 | Short; settles the laser-guided missile. Its last sentence is replaced by the series rule (C2). |
| weapons | can-target-field-rule | should | apply-revised | p6 | Defines can_target (10 of 12 reports): ordered steps for commanded and piloted games. |
| weapons | naval-and-high-air-rules | should | apply-revised | p4 | Naval follows ground vehicles; high air in shooters only for anti-air weapons. |
| weapons | anti-air-trait-rule | should | apply-as-proposed | p4 | Trait follows high-air in can_target. The optional validator warning is deferred (new check, 4 reports). |
| weapons | suppress-trait-rule | should | apply-as-proposed | p4 | Only weapons whose own fire pins as a main job. |
| weapons | magazine-and-self-refilling-ammo | should | apply-revised | p4 | Self-refilling reserves are magazine; never-refilled stock is finite-ammo (limited-ammo aligned in C7). |
| weapons | homing-trait-rule | could | apply-as-proposed | p4 | Short; lock-on excludes homing as guided already does; settles 3 BF reports. |
| weapons | splash-trait-rule | could | apply-revised | p4 | Short source rule; non-damaging area effects are not splash. |
| weapons | new-trait-ignores-countermeasures | could | deferred | - | New term, not wording; one unit in 3 reports. Gap report. |
| weapons | no-change-none-and-true-damage | could | apply-as-proposed (no change) | - | No new damage types; steps 2 and 5 cover them. |
| weapons | no-change-sonic-bark | could | apply-as-proposed (no change) | - | No new delivery; bark takes the sonic default. |
| weapons | no-change-stun-tier | could | apply-as-proposed (no change) | - | Stun keeps min_tier t2 (5B); the atypical record is correct. |
| weapons | no-change-rts-automation-and-stat-quirks | could | apply-merged into scales/series-title-convention | - | No new traits; quirks go in summaries and follow the series rule (C2). Round-2 brief line only. |
| weapons | no-change-affects | could | apply-as-proposed (no change) | - | No change to affects. |
| weapons | no-change-picked-up-weapons-family | could | apply-as-proposed (no change) | - | No change; pickups are game-wide (shared-mechanics). |
| weapons | no-change-knockback-reading | could | apply-merged into weapons/MISSING weapon-source-coverage | - | Cause was source coverage, settled by C12. |
| weapons | MISSING explosives-allow-armour-piercing | should | apply-as-proposed | p4 | Anti-tank charges are not physical nonsense (4B); avoids predictable atypicals and wrong counter hints. |
| weapons | MISSING grenade-launcher-family | could | deferred | - | Not in the pilot; tie-break plus allowed-delivery change. Gap report. |
| weapons | MISSING weapon-source-coverage | should | apply-revised | p6 | Final text in C12 (sources description); depends on Mustafa item 3 for the cap. |
| weapons | MISSING series-version-rule | should | apply-merged into scales/series-title-convention | - | Merged into the series rule (C2). |

### armour (30)

| Group | Id | Priority | Decision | Package(s) | Reason |
|---|---|---|---|---|---|
| armour | armour-class-order | should | apply-revised | p5 | Ordered steps plus checks; settles 8 reports' hesitation, keeps all six pilot values. |
| armour | armour-class-descriptions | should | apply-revised | p5 | Each kind named once; super-heavy by size and registry, not toughness. |
| armour | unarmoured-organic-only | could | deferred | - | Adds a combination rule (not wording); check B of the armour-class order already states it. Revisit if round 2 shows slips. |
| armour | armour-registry-notes | should | apply-revised | p8 | RA3, SC2, TD/TS/TW and CoH notes rewritten to follow the order. |
| armour | flat-pool-fallback | must | apply-as-proposed | p5 | flat-pool never paired; its RA3 example fixed. |
| armour | directional-threshold | should | apply-as-proposed | p5 | However little counts; 'say how much' is written in words (C3). |
| armour | damage-reduction-threshold | should | apply-revised | p5 | A quarter or more of the basic rifle's hit, as bought; Siege Tank moves to flat-pool for all. Notes in words (C3). |
| armour | zonal-any-trigger | must | apply-revised | p5 | Definition matches its examples; enemy stuns excluded; crew-hit function loss moved here. |
| armour | crew-casualties-squad | must | apply-revised | p5 | Example/rule contradiction removed; requires another player aboard. |
| armour | shared-bonuses-not-models | should | apply-revised | p5 | Cover, rank, orders and difficulty are not models; evasive needs a better-than-baseline value. |
| armour | armour-model-cap-order | could | apply-revised | p5 | Short; one answer when more than three models apply (built-in first, then rarest). |
| armour | series-titles | should | apply-merged into scales/series-title-convention | - | Merged into the series rule (C2). |
| armour | negated-links | should | deferred | - | New kind of typed link; matchup fields are information only and the negation cases appear in 4 of 12 reports. Deferred (Mustafa item 5). |
| armour | matchup-link-guidance | should | apply-revised | p6 | Applied without the negation items (C16). |
| armour | sample-matchup-fixes | could | apply-revised (part) | p9 | Only the parts that need no negation: passengers:1 and pattern:infest-vehicle beside the unit links (C4); '!' parts deferred. |
| armour | paths-and-fit-notes | should | apply-as-proposed | p6 p7 | Prevents a contradiction (dot vs slash paths; atypical already uses '/'); the gap report that takes every deferral reads only fit_notes. Adds a '*' warning. |
| armour | as-player-seats | could | apply-revised | p6 | Short; matches decision 2A. |
| armour | memorable-no-change | could | apply-as-proposed (no change) | - | No change. |
| armour | uncertain-no-change | could | apply-as-proposed (no change) | - | No change; the cap question is C12. |
| armour | pattern-retreat-to-base | should | apply-revised | p8 | Planned registry id only, so the coh1 game-wide list can name it; units do not record retreat (shared-mechanics wins, C10). |
| armour | pattern-fortify-point | could | deferred | - | Registry growth goes through fit_notes (8B); the Observation Post is kept with an empty list and a fit_note. |
| armour | resource-pay-per-use | should | deferred | - | Conflicts with scales/resources-team-stock (C7); whether Shamble prices abilities per use is a design call (Mustafa item 2). |
| armour | sensor-thermal | could | deferred | - | New term; the only case is a loadout pick, which goes to notes (C8). Gap report. |
| armour | covered-weapon-gaps | could | apply-merged into weapons/emp-vs-magnetic | - | Superseded by the weapons texts (emp, magnetic, small-arms, psionic, magazine). Its guided and damage-types sentences are dropped: they contradict damage step 2 and the delivery rules. |
| armour | covered-field-gaps | could | skipped | - | Hand-off suggestions now superseded or contradicted by the owning groups (needs-crew vs crew/solo-fallback-test, bail-out while burning vs crew/on-death-plain-death, acquired 'when' links and mode 'base' vs C1). |
| armour | gap-triage | could | apply-as-proposed (no change) | - | Triage kept as the gap-report plan; its 'add before the freeze' list is overridden (negated links, pay-per-use, fortify-point, thermal deferred; retreat-to-base as planned id only). |
| armour | MISSING weak-point-vs-directional | should | apply-as-proposed | p5 | Prevents a contradiction created by directional-threshold (Iron Harvest rear damage). |
| armour | MISSING interceptor-automatic | could | apply-as-proposed | p5 | Short; the term's example contradicted its own note. |
| armour | MISSING armour-models-from-picks | should | apply-revised | p5 | Picks count for armour (marked in notes, built-in first); the stated difference from sensors is in C8. |
| armour | MISSING mode-armour-only-when-changed | should | apply-merged into structure/modes-parts | p6 | Merged into the mode texts (C6). |

## Work by package

Run order: p1 to p5 and p6 can start together. p8 starts its games.json part only after p6 has added sight_reference and range_reference to the game schema (the schema has additionalProperties false). p7 follows p6. p9 goes last, because the samples need on_death.notes (p6) and must pass the new checks (p7). At the end: bump the word lists to 1.0.0, run npm run docs, npm run vocab-diff, npm run validate, npm test and the copy-check.

Each item names the proposal (group/id); where a conflict holds the final text, it is named.

### p1: data/vocab roles, classes, nature, availability, faction-flavours, bodies, sizes, confidence, source-kinds

1. identity/MISSING role-aliases (roles; the other role rules match words against these aliases)
2. identity/roles-primary-procedure (roles list description, raider description, assault and raider source rules, the tie-breaks that move out of the description)
3. identity/infiltrator-is-a-job
4. identity/scout-needs-information
5. identity/role-boundaries (tie-breaks; engineer description; transport, siege and marksman source rules)
6. identity/MISSING buffer-description
7. identity/MISSING siege-requires-drop
8. identity/sizes-by-example
9. identity/drone-class-on-legs (classes)
10. identity/nature-crew-evidence (nature)
11. identity/availability-cap-rule (availability)
12. identity/body-plan-carrier-tie-break (bodies)
13. crew/crew-model-rts and crew/mount-order: limited-arc on hull-turret, multi-turret and humanoid (bodies; C13)
14. identity/confidence-rule (confidence terms)
15. identity/source-kind-copies (source-kinds)

faction-flavours: no change unless Mustafa answers item 4.

### p2: data/vocab tiers, cost-bands, resources, speed-bands, sight-bands, sensor-traits, range-bands, cooldown-bands

1. scales/speed-method-a with scales/speed-bands-exact-edges, scales/MISSING speed-bands-from-words and the standing-still sentence of scales/stationary-mode-no-speed (speed-bands; final text C5)
2. scales/sight-band-anchor (sight-bands)
3. scales/range-band-anchor (range-bands)
4. scales/cooldown-bands-exact-edges (cooldown-bands)
5. scales/sensor-traits-default-fit-only (sensor-traits; C8)
6. scales/resources-team-stock (resources; C7)
7. scales/cost-edge-and-raw (cost-bands description)
8. scales/tiers-addon-and-no-tier (tiers)

### p3: data/vocab crew-models, seat-roles, solo-fallback, aim-models, handling, mobility-traits, mobility, on-death

1. crew/crew-model-rts (crew-models source rules and tie-breaks)
2. crew/MISSING battlefield-commander-example (crew-models and seat-roles; check the Battlefield 3 tank's seat list first)
3. crew/seat-leave-out-driver (seat-roles driver source rule)
4. crew/passenger-module-foxhole-example (seat-roles)
5. crew/solo-fallback-test (solo-fallback; check the PlanetSide 2 Liberator and Sunderer seats and the Foxhole engineer seat first)
6. crew/mount-order (aim-models tie-break and source rules)
7. crew/handling-default (handling tie-break)
8. crew/boost-not-retreat, boost wording only (mobility-traits; C19)
9. crew/on-death-plain-death (on-death descriptions, source rules, tie-breaks)

### p4: data/vocab ability-kinds, ability-sources, weapon-families, damage-types, weapon-delivery, target-types, weapon-traits

1. weapons/rockets-vs-guided-missiles together with weapons/family-tie-breaks-carry-over (the old description sentence is deleted and its three rules move to tie_breaks)
2. weapons/small-arms-vs-machine-gun
3. weapons/sniper-vs-small-arms-and-bows
4. weapons/artillery-vs-cannon-and-lobbed (also weapon-delivery lobbed)
5. weapons/machine-gun-autocannon-cannon
6. weapons/emp-vs-magnetic (weapon-families emp and magnetic; damage-types emp)
7. weapons/psionic-telekinesis
8. weapons/MISSING explosives-allow-armour-piercing
9. weapons/damage-decision-order (damage-types list sentence)
10. weapons/lock-on-vs-guided (weapon-delivery tie-break; final text C2)
11. weapons/homing-trait-rule (weapon-traits homing; weapon-delivery lock-on excluded)
12. weapons/naval-and-high-air-rules (target-types)
13. weapons/anti-air-trait-rule
14. weapons/suppress-trait-rule
15. weapons/magazine-and-self-refilling-ammo
16. weapons/splash-trait-rule
17. structure/toggle-or-deploy (ability-kinds)
18. structure/ability-kind-tie-breaks (ability-kinds)
19. structure/ability-source-tie-breaks (ability-sources)

### p5: data/vocab armour-classes, armour-models and every other list

1. armour/armour-class-descriptions
2. armour/armour-class-order
3. armour/flat-pool-fallback
4. armour/directional-threshold (source rule wording in C3)
5. armour/MISSING weak-point-vs-directional
6. armour/damage-reduction-threshold (source rule in C3)
7. armour/zonal-any-trigger
8. armour/crew-casualties-squad
9. armour/shared-bonuses-not-models
10. armour/MISSING interceptor-automatic (check the Generals Paladin example first)
11. armour/armour-model-cap-order with armour/MISSING armour-models-from-picks (C8)

### p6: schemas/*.schema.json and the Conventions text in scripts/build-docs.mjs

schemas/source-unit.schema.json:

1. crew/crew-model-rts (crew.basis enum without lore; crew.model description)
2. structure/main-weapon-and-slots, carrying crew/seat-and-primary, crew/seat-leave-out-driver (seat texts), weapons/main-weapon-slot-crossgroup, structure/passenger-entries, structure/upgrade-weapons and structure/when-and-alternate (armament, slot, seat, option_group, default, when, condition, mode; C1)
3. structure/ability-source-required, structure/ability-without-pattern, structure/ability-count-rules (abilities)
4. weapons/damage-decision-order, weapons/delivery-field-rule, weapons/can-target-field-rule, scales/range-band-anchor (weapon fields)
5. scales/cooldown-bands-exact-edges (ability.cooldown)
6. scales/speed-method-a and scales/speed-raw-rule (mobility.speed, speed_raw; C5); crew/handling-default (mobility.handling)
7. scales/sight-band-anchor and scales/sensors-basis-sight-only (sensors.sight, basis, traits; C8)
8. crew/on-death-plain-death (on_death.basis) and crew/on-death-notes (new on_death.notes)
9. crew/MISSING solo-fallback-only-multi-seat (crew.solo_fallback)
10. identity/roles-primary-procedure, identity/roles-secondary-ranking (roles; edits in C21)
11. identity/lineage-rule, identity/flavour-affinity-rule, identity/body-count-default
12. scales/cost-edge-and-raw (cost_band.raw)
13. structure/modes-parts carrying scales/stationary-mode-no-speed, crew/MISSING mode-mobility-and-handling and armour/MISSING mode-armour-only-when-changed (C6)
14. armour/as-player-seats
15. armour/matchup-link-guidance (five field descriptions; C16)
16. weapons/MISSING weapon-source-coverage (sources; cap per Mustafa item 3; C12)
17. armour/paths-and-fit-notes (fit_notes description)

schemas/common.schema.json: identity/confidence-rule (source description, C12); armour/paths-and-fit-notes (fitNote.path, uncertain.path).

schemas/game.schema.json: scales/registry-sight-range-reference (two optional fields, made required once p8 has filled them); weapons/damage-map-binding-registry (damage_map); scales/series-title-convention (version_researched; C2).

schemas/pattern.schema.json: structure/pattern-source-units (source_units).

scripts/build-docs.mjs Conventions, in this order: Ids with the C14 sentence; Typed links (unchanged); Matchups (C16); Proposals vs facts (C18); Weapons vs abilities (structure/weapons-vs-abilities); Weapon entries (structure/weapon-entry-count with rules 1 and 4 from C11 and C2); Main weapon (C1); Paired entries (C9); Shared mechanics and universal keys (structure/shared-mechanics); Pattern links (C10); Granularity with the C9 sentence; Bands with numbers (C3); Stock values (C3, scales/MISSING stock-values-for-scales); Series games (C2); Copyright (unchanged).

### p7: scripts/validate.mjs, scripts/agreement.mjs and their tests

1. validate.mjs checks V1 and V2 (crew/seat-leave-out-driver)
2. V3 to V6 (structure/main-weapon-and-slots with crew/seat-and-primary, structure/passenger-entries, structure/when-and-alternate)
3. V7 (crew/mount-order)
4. V8 (crew/crew-model-rts)
5. V9 and V10 (crew/on-death-plain-death)
6. V11 (crew/handling-default)
7. V12 and V13 (crew/MISSING solo-fallback-only-multi-seat)
8. V14, scripts/sync-patterns.mjs, the package.json script and the README lines (structure/pattern-source-units)
9. V15 (structure/ability-without-pattern)
10. V16 (armour/paths-and-fit-notes)
11. agreement.mjs change set (C15): crew/MISSING agreement-per-weapon-and-basis, crew/seat-leave-out-driver, crew/on-death-plain-death, structure/ability-source-required, structure/atypical-follows, identity/confidence-rule
12. Tests for every check and reader (tests/validate.test.mjs and the agreement tests); update the two tests that expect the source_units errors.

### p8: data/games.json, research/registry-notes/*.md, data/pattern-registry.json

1. scales/registry-sight-range-reference with scales/MISSING registry-optics-grades: sight_reference and range_reference for all 28 games, each with a source (after p6 adds the fields)
2. scales/speed-method-a: battlefield.speed_reference (after checking the Vehicle Boost page; C5)
3. scales/cooldown-bands-exact-edges: sc2.speed_reference sentence
4. scales/series-title-convention: battlefield.version_researched (C2)
5. scales/sc2-armory-note (games-r5.md)
6. identity/official-role-lines-registry (games-r1, r4, r5, r6 and README; C10 for the README text)
7. weapons/damage-map-binding-registry (games-r1, r2, r3, r5, r6)
8. armour/armour-registry-notes (games-r1, r2, r4, r5)
9. structure/shared-mechanics: Game-wide mechanics sections for coh1, ra3, sc2 and battlefield now, and for every round-2 holdout game before round 2; README line (C10)
10. structure/MISSING pattern-notes-contradictions and the fire-port lines (patterns.md; C9)
11. armour/pattern-retreat-to-base (pattern-registry; C10)
12. structure/MISSING transport-passive: carry-passengers summary (pattern-registry; C9)

C20 lists the files these touch, so one pass per file is possible.

### p9: data/units/ra3.json, data/patterns/*.json, docs/examples/concept-card.example.json

1. data/units/ra3.json, every change in C4: identity/sample-td-primary, identity/sample-td-size, structure/ra3-sample-fixes, identity/sample-hammer-lineage, crew/hammer-mount-sample, scales/ra3-ifv-sample-fix, identity/sample-ifv-secondary, weapons/sample-fixes-ra3, armour/sample-matchup-fixes (parts without negation), crew/on-death-notes (sample notes)
2. data/patterns/*.json: no change (source_units are unchanged by the deletions)
3. docs/examples/concept-card.example.json: no change; re-validate
4. Validate, copy-check the new sentences, rebuild docs/samples.md

## Deferred

| Proposal | Why | Where it goes |
|---|---|---|
| scales/MISSING registry-speed-references-sustained | Registry research (which gait each shooter's reference uses; Arc Raiders sprint), not a wording change | research run, registry pass |
| crew/mobility-traits-required | A required field, not wording; no agreement effect | later schema tidy-up, with a general 'leave defaults out' convention |
| crew/boost-not-retreat (list sentence and two-way check) | New validator check backed by 3 of 12 reports | revisit if round 2 splits on key-bound traits |
| crew/MISSING mixed-passenger-kinds | No pilot case | research run gap report |
| identity/infiltrator-requires | Requires gate for cards; no pilot unit affected | generator step |
| weapons/new-trait-ignores-countermeasures | New term; one unit, 3 reports | gap report |
| weapons/MISSING grenade-launcher-family | Not met in the pilot | gap report |
| weapons/anti-air-trait-rule (optional warning) | New check, 4 reports | later |
| armour/unarmoured-organic-only | Combination rule; check B of the armour-class order already says it | after round 2 |
| armour/negated-links, and the '!' parts of armour/sample-matchup-fixes | New kind of typed link; information-only fields; 4 of 12 reports | Mustafa item 5; after round 2 |
| armour/pattern-fortify-point | Registry grows through fit_notes (8B); the Observation Post keeps a fit_note | gap report |
| armour/resource-pay-per-use | Conflicts with scales/resources-team-stock; design call | Mustafa item 2 |
| armour/sensor-thermal | New term; the only case is a loadout pick, which goes to notes | gap report |
| scales/stationary-mode-no-speed, card side (concept-card parts.modes[].mobility optional) | Cards are not part of the pilot | generator step |
| scales/sensor-gaps-no-change, 'switch vision mode' pattern | A pattern question | gap report (the helicopter's optics carry a fit_note) |

The gap report needs every gap in fit_notes with '/' paths (armour/paths-and-fit-notes, applied).

## Spot-checks of targets and quoted old texts

Checked in the repository at commit 7f91a2b:

- **Term ids.** Every term named in a new tie-break, source rule or requires exists (ability-kinds, ability-sources, roles, armour-classes, armour-models, source-kinds, target-types, weapon-traits, damage-types, weapon-families, weapon-delivery, seat-roles, pattern-categories, nature, classes, availability, bodies, faction-flavours). Every link kind used (crew, passengers, pattern, category, delivery) is in x-ref-kinds.
- **Pattern ids.** Every pattern named exists in data/pattern-registry.json except retreat-to-base, which p8 adds.
- **Quoted old texts.** 77 quoted strings were searched in their target files; 76 were found as quoted, among them the speed and cooldown band texts, the schema descriptions for speed, range, sight, seat, source, ability patterns, modes, armament, slot, option_group, default, mode and condition, the crew.basis 'lore' value, the ability-kinds tie-break sentence, the weapon-families tie-break sentence and descriptions, the target-types naval text, the infiltrator text, all armour-class and armour-model texts, the seat-roles, solo-fallback, crew-models and on-death examples, the registry-note lines in games-r1 to r6, the patterns.md rows at lines 120 and 130, and the sample values (desolator-trooper, hammer-tank, 'Escape from destroyed host', passengers:>=1, the drone's tiny texts).
- **One wording difference.** confidence.json 'high' reads "Stated by an official source, or by two independent established sources that agree."; the proposal quotes it slightly differently. Not a blocker: the description is replaced whole.
- **validate.mjs** line 483 (price, raw >= threshold) and line 494 (speed r < 0.7, r < 1, r <= 1.5, r <= 2.5) are as quoted; line 519 already requires a condition on passenger, acquired and alternate weapons; lines 510 and 551 are the two source_units errors.
- **Schema support.** vocabulary.schema.json already has tie_breaks, source_rule and aliases; build-docs prints them; validate.mjs checks tie-break terms. No list has tie_breaks yet.
- **Blocker settled in C1.** build-docs prefixes every x-provenance 'proposal' field with "Proposal, not a sourced fact", which would contradict a seat copied from the source. The keyword is removed from both seat fields.
- **Blocker settled in C9.** patterns.md line 7 and the fold-in row at line 90 send firing from inside to carry-passengers, against the written passenger-sets-weapon pattern; corrected.
- **Ordering constraint.** game.schema.json has additionalProperties false, so sight_reference and range_reference must be added to the schema before games.json gets them.
- **Facts to check before writing** (the proposals say so): the Battlefield Vehicle Boost page; the Battlefield 3 tank's seat list; the PlanetSide 2 Liberator nose gun and Sunderer seats; the Foxhole engineer seat; Wargame (and Broken Arrow) optics grades; sight and range references for all 28 games; the Generals Paladin point-defence example.
- **Card example.** docs/examples/concept-card.example.json passes every applied rule; no change.

## Choices for Mustafa

1. **Speed: method A for every unit (decision 2C).** You chose "test both and pick the one where coders agree more". A agreed 100%, B 94.4%, so A follows your rule, but the gap is one vehicle (the PlanetSide 2 Sunderer, which no coder had a figure for). The scales reviewer agrees with A for a different reason: one scale per field, the same one cards use. What A costs: in shooters, vehicles bunch at the top (6 of 12 test vehicles very fast, all four PlanetSide 2 vehicles in one band), so speed no longer separates one vehicle from another and that comparison lives only in notes and the stored ratio; PlanetSide 2, Wargame and Broken Arrow tanks get flagged as rule breaks against the tracks speed limit, and Foxhole trucks come out very slow off-road; every shooter vehicle meets the speed requirement of raider and scout, so those roles now also need light armour or an information part. Options: A (applied); B (ratio to each game's standard tank for vehicles; needs an aircraft anchor, a scale flag on every unit and its own edge rule); A now, and later turn the tracks and wheels speed limits into rarities under 4B. **Recommendation:** A, keeping Foxhole on off-road speed with road speed in notes; look at the tracks limit again after round 2.
2. **Per-use costs for abilities.** Company of Heroes abilities cost munitions each use. Options: (a) not a resource; the ability's summary says in words that it draws on the shared stock (applied); (b) add a 'pay per use' resource term, so the data records it and cards can roll abilities priced from a purse. **Recommendation:** (a), unless Shamble Frontlines will charge per ability use during a life.
3. **Source cap.** The approved field list allows 1 to 3 sources per unit. The new rules (a cooldown figure from the mechanic's own page, the page that lists a loadout's weapons one by one, a second site for high confidence) need four or five on shooter units such as the Battlefield helicopter. Options: keep 3 (pages left out go in uncertain); raise to 5. **Recommendation:** 5. Cost: more pages for the copy-check and the checker.
4. **Flavour.** The computed flavour rule gives the Riflemen [allied] only, dropping the soviet flavour all three coders gave for 'cheap numbers'. And infiltrator stays a favoured Soviet role although the Terror Drone is now anti-armour. Options: accept the computed rule, or keep flavour a free proposal; keep infiltrator under soviet, or move it to allied, whose themes include stealth and disguise (empire keeps it). **Recommendation:** accept the computed rule; move infiltrator from soviet to allied.
5. **Negated links in matchups** ('!hits:low-air': has no weapon that reaches aircraft). Deferred under the machinery rule; the gap is written today as a weakness hung on the part that causes it plus class:aircraft in countered_by. Adding it later touches the schema, validator and docs. **Recommendation:** defer until the generator's strength-and-weakness pairing is designed, and decide with round-2 data.
