# First generator (step 3b): the rule sheet

**For:** Mustafa · **Status:** approved by Mustafa on 13 November 2026: P1, P3 and P4 with the wording of section 13, P2 with its sentence, and all eleven questions answered A (section 15). One part waits for his word: the new card property that answer K2 A needs. The sheet was checked twice by a second agent before he saw it (section 16) · **Data checked:** commit a592331, word lists 1.1.0, 55 units, 69 patterns (all proposed), 501 variants · **Counts:** every count here comes from a script in `research/generator/rule-sheet/scripts/`; each section names its script. To re-run one: `node research/generator/rule-sheet/scripts/<name>.mjs` (it only reads the data). The counts were taken at the commit named here.

## TL;DR

- **What this is.** Every rule the first generator applies, and every number it uses, with where each comes from. Mustafa approved it on 13 November 2026, before any code was written.
- **Most rules already exist.** The word lists and the patterns' generator blocks hold almost everything: classes, tiers, rarity and spice weights, flavour odds, key budgets, pattern rules. The validator already checks a card's schema, its key budget and its patterns' rules; the rest is checked by a new, separate checker (P3).
- **What is new** is marked **NEW**: the order of the roll in detail, a few defaults, how many parts of each kind a card gets, a hard-control list, a role-fit list, the balance points method, the name word banks and the text templates. Of about 95 rules, more than half are new or have a new part; there are about 100 new numbers, all starting values. They go in three new files under `data/generator/` with one new schema.
- **No word-list change is needed** for step 3b. That holds because a few numbers that could live in the word lists are kept in the new rules file for now (section 13).
- **Four items were approved** (section 13): the new schema with its three files; one change to how the validator counts keys; a new, separate checker for rolled cards; and one line of wording in the card schema.
- **Two conflicts about keys** (K1 and K2, section 15). The validator counts a key-bound move (dash, leap, teleport...) and its own ability as two keys, though they are one button; that eats the whole T1 budget. And the tiers word list says a signature that is the unit's primary weapon, fired with primary fire, is not a key, while the validator and the plan's example card count it as one.
- **The data has small problems** (section 14). None blocks the generator. One kind matters for cards: 106 text lines in the patterns name a real game, unit or wiki, so they never go onto a card (T-b).
- **Only one kind of input has no valid card:** role transport on infantry or a drone (6 class-and-tier pairs).
- **Not in step 3b:** remix and the app (P2.3, plan change of 12 November).
- **Eleven questions** were put to Mustafa; he answered A to each (section 15).

**How to read a rule.** Each rule has a code, then **From:** where it comes from, then **In:** where it lives or would live. Codes for sources: **B3** brief section 3; **P2.3** plan section 2.3; **1B...7B** your decisions of 18 October; **WL** a word list (`list.field`); **PG** a pattern's `generator` block; **FR** the field rules in `docs/fields.md`; **V** the card checks in `scripts/validate.mjs`; **CS** the card schema; **NEW** proposed here. Places: **R** = `data/generator/rules.json`, **N** = `names.json`, **X** = `texts.json` (all new), **code** = the generator's code.

## 1. Inputs

| Input | Allowed values | Left open | From | In |
|---|---|---|---|---|
| class | infantry, vehicle, walker, hover, aircraft, drone (naval never) | rolled by `classes.rarity` (hover and drone uncommon, the rest common) | P2.3, WL classes | WL |
| tier | t1, t2, t3 | rolled, equal odds | P2.3; odds NEW | R |
| flavour | soviet, allied, empire | rolled, equal odds | P2.3; odds NEW | R |
| role | any of the 16 roles, or none | rolled at step 3 | P2.3 | WL, R |
| spice | 1 to 5 | default 2 (the command only) | P2.3, CS; default NEW | R |
| seed | any text | the command makes one and stores it | P2.3, CS | code |
| locks | any of the 20 lockable parts in CS (`class` ... `on_death`, `name`) | none | P2.3, CS | code |

- **I1** A class, part or lock you choose is always used; rarity and spice never apply to it. From: WL rarity and classes descriptions. In: code.
- **I2** The card records its inputs and seed; the same inputs, spice, locks, seed, generator version and data version always rebuild the same card. From: P2.3, CS. In: code.

## 2. The roll order

Each step offers only terms that fit everything already chosen. Each card field draws from its own dice stream, made from the seed and the field's name, so locking or rerolling one part never moves the dice of another (P2.3, CS description). A step that fills several fields, such as the weapons, uses one stream per field.

| # | Step (card field) | Lists and term fields used | Pattern rules used here | From |
|---|---|---|---|---|
| 1 | class | `classes`: rarity, `source_only` | none | P2.3 |
| 2 | tier, flavour | `tiers`; `faction-flavours` | none | NEW place |
| 3 | primary role | `roles`: classes, requires; role fit (RF) | none | NEW place |
| 4 | signature: pattern, variant, kind, cooldown | `ability-kinds`: min_tier, uses_key; `cooldown-bands` | classes, class_rarity, rarity, flavour_lean, min_tier, kinds, slot, requires, excludes, implies, conflicts_with; variants: min_spice, overrides | P2.3 |
| 5 | mobility base, handling | `mobility`: classes, rarity, min_tier, allowed.speed-bands, default_handling, target_type | the signature's implies, excludes | P2.3 |
| 6 | body plan | `bodies`: classes, class_rarity, rarity, min_tier, allowed.mobility/sizes/aim-models | same | P2.3 |
| 7 | size | `sizes`: min_tier; allowed.sizes of class, body, armour, crew, traits | requires and excludes on `size:` | P2.3 |
| 8 | speed | `speed-bands`; allowed.speed-bands of the mobility | same | P2.3 |
| 9 | mobility traits | `mobility-traits`: classes, class_rarity, rarity, allowed, excluded, uses_key, pattern | implies `mobility-trait:` | NEW place |
| 10 | armour class and models | `armour-classes`: allowed.sizes, min_tier; `armour-models`: rarity, classes, class_rarity, allowed, excluded, requires | requires and excludes | P2.3 |
| 11 | sensors: sight, traits | `sight-bands`; `sensor-traits`: classes, class_rarity, rarity, excluded | requires `sensor:` | NEW place |
| 12 | crew, solo fallback, the seat of each weapon and ability, passengers, body count, nature, availability | `crew-models`: classes, class_rarity, rarity, allowed.sizes, excluded, min_tier, seats, max_players; `solo-fallback`: rarity; `nature`; `availability`: min_tier | implies `passengers:`, `crew:`; excludes | P2.3 |
| 13 | weapons: primary, secondary, conditional | `weapon-families`: classes, class_rarity, rarity, default_*, allowed.damage/delivery/targets; `weapon-delivery`: allowed, excluded, requires; `weapon-traits`: excluded, min_tier; `aim-models` | implies and requires on `weapon:`, `delivery:`, `range:`, `weapon-trait:`, `hits:`, `damage:` | P2.3 |
| 14 | extra abilities, second form | as step 4; `parts.modes` | as step 4 | P2.3 |
| 15 | on death, resource | `on-death`: rarity, classes, excluded; `resources` | implies `resource:` | NEW place |
| 16 | secondary roles | `roles`: requires; role fit | implies `role:`; strength links `role:` | NEW place |
| 17 | matchups, balance, text, inspiration | sections 8 to 11 | adds_strengths, adds_weaknesses, counters, countered_by, player_translation, counterplay | P2.3 |

General rules for every step:

- **G1** A term is offered only if: it is not `source_only`; the card's class is in its `classes`; the tier is at least its `min_tier`; its `allowed` and `excluded` maps accept every part chosen so far, and theirs accept it (the word lists check `allowed` both ways). From: WL (vocabulary schema), V. In: WL.
- **G2** A term's `requires` groups (each group needs one of its links) must hold on the finished card. A group not met yet is passed on to the later steps as a part they must set. From: WL requires, V. In: WL.
- **G3** Parts a chosen pattern `implies` are set before the rest is rolled. From: PG implies (schema text). In: PG.
- **G4** A pattern's `requires` group that the card does not meet yet is met by setting one of its links, picked like any part, at the step that owns it. From: PG requires; method NEW. In: R.
- **G5** A part that your inputs or locks need is set, not rolled: hard rules (G1) apply, rarity does not. That covers a part you chose, a part that a pattern you chose implies or requires, and the tool that a role you chose needs (G13). When several parts would meet the need, the generator picks among them by the spice odds, and uses a part above the spice gate only when nothing at the gate fits. So spice never makes a combination you asked for unavailable (question SP). What the generator rolls on its own never goes above the gate: a pattern whose implied or required parts are above it is not offered, and a role is rolled only if the card can hold it at its spice (G14). From: I1 by analogy, P2.3 (spice 1 offers only common parts); NEW. In: R.
- **G6** A flavour's avoided parts stay out below spice 3 even when a pattern implies them; such a pattern is then not offered. From: WL faction-flavours.avoided_until_spice; extension NEW. In: R.
- **G7** A rolled card that breaks any rule of this sheet is rolled again, on the next attempt's dice (stream = seed + step + attempt). Locked parts never change. After 200 attempts the generator reports the inputs as unavailable for that seed. A lock never moves another part's dice, but it can change which attempt passes the rules, so a part that the locked value rules out can come out differently. From: P2.3 ("a card that breaks a rule is rerolled"); 200 NEW. In: R.
- **G8** Every card records the data version it was rolled on; a card rolled before a data change is not rebuilt by its seed afterwards. From: plan change of 12 November (2.2), CS. In: code.
- **G9** A term with no `rarity` counts as common: roles, sizes, speeds, armour classes, damage types, deliveries, ranges, targets, weapon traits, sight, nature, availability (except AV), resources, cooldowns, hooks. From: NEW. In: R.
- **G10** Handling is always the mobility's `default_handling` (the handling list's rarities are not used in step 3b). From: FR mobility.handling; NEW for cards. In: R.
- **G11** Range is the family's `default_range`; a range that a pattern implies or requires replaces it. From: WL default_range, PG implies and requires. In: WL, PG.
- **G12** Damage, delivery and mount start from the family's `default_damage`, `default_delivery`, `default_aim`; another allowed value is rolled with the default three times as likely (for mounts the aim models' own rarity applies as well). Mounts must also be in the body's `allowed.aim-models`. Targets are every type the family and delivery allow (lobbed, dropped and placed shots never hit fliers; high air only for flak, guided missiles, autocannon, adaptive, or the anti-air trait on a family that reaches low air). From: WL weapon-families defaults and description, V exemptions; the three-times weight NEW. In: WL, R.
- **G13** Role fit (RF). A role is held only if its word-list `requires` are met and it fits: engineer needs capture-structure, build-structure, host-spawn-point or build-linked-exits; logistics needs gather-resources or generate-income; buffer needs rally-allies or sacrifice-for-allies; infiltrator needs a pattern whose category or `also_in` is infiltration (capture-structure, hijack-vehicle, infest-vehicle, cloak, disguise); anti-infantry needs the splash trait or small arms, a machine gun or a shotgun; assault needs armour medium or heavier and a main weapon of medium range or less; raider needs speed fast or more and armour light or less; transport needs passenger seats (its word-list `requires`), so a pattern that brings them (section 7). A card with such a role holds at least one pattern that serves it: the signature when one fits, otherwise an extra ability inside the budgets. While the role is fixed, patterns that serve it are three times as likely. From: FR roles.primary and roles.secondary rules, PG implies (`role:engineer` on capture-structure variants, `role:logistics`, `role:buffer`); the list, the armour and speed conditions for assault and raider, and the weight are NEW (question RF). In: R.
- **G14** The primary role is rolled among the roles a card of this class and tier can hold at its spice (G13): a role whose tools are all above the spice gate is not rolled. Today most tools of engineer, logistics and infiltrator are uncommon or rare. At spice 1 those roles can be rolled only where a flavour lean makes a tool common: engineer in 3 of the 54 combinations of class, tier and flavour, logistics in 12, infiltrator in 27. Support and buffer cannot be rolled at spice 1 in 18 combinations each (`feasibility.mjs`). A role you choose is always used (G5). Each role has common weight, three times as likely when the flavour favours it. Secondary roles: 0, 1 or 2 (weights 2:2:1), from roles the finished card holds; a role a pattern implies or names in a strength is added first; with no room the pattern is not offered. From: CS (max 2), WL faction-flavours.favoured.roles; weights NEW. In: R.
- **G15** Word-list fields the generator does not read: `examples`, `notes`, `source_rule`, `tie_breaks`, `aliases`, `replaces`, `min_players`, `themes` (research coding and prose); `weak_vs` and the handling list's `rarity` (left for later); `points` and `brings` (empty in every list). From: WL; NEW. In: none.
- **G16** When a count asks for more parts than the rules allow at the card's spice (for example a sensor trait at spice 1, where every sensor trait is uncommon), the card takes as many as fit and no more. From: NEW. In: R.

## 3. Spice and flavour

| Rarity (WL rarity) | min_spice | weight at spice 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| common | 1 | 10 | 10 | 8 | 6 | 5 |
| uncommon | 2 | 0 | 4 | 5 | 6 | 6 |
| rare | 4 | 0 | 0 | 0 | 3 | 5 |

- **S1** A rolled part's chance = its weight at the card's spice × 3 if the flavour favours it (`favoured_weight` 3 for all three flavours), divided by the sum over all candidates. From: WL rarity.weights, faction-flavours.favoured_weight. In: WL.
- **S2** A favoured part counts one step more common (rare as uncommon, uncommon as common), but never where a `class_rarity` applies. From: WL faction-flavours and rarity descriptions (prose only, no field). In: R (`favoured_step: 1`).
- **S3** A term's or pattern's `class_rarity` for the card's class replaces its `rarity`. From: WL class_rarity, PG class_rarity. In: WL, PG.
- **S4** Avoided parts are not offered below spice 3 (`avoided_until_spice` 3 for all three flavours); from spice 3 they are offered and the card gets the `off-flavour` warning. From: WL faction-flavours. In: WL.
- **S5** A pattern's `flavour_lean` counts as favoured for that flavour: three times as likely and one step more common (not for its class_rarity). From: PG flavour_lean ("roll it more often", no number); treatment NEW (question FL). In: R.
- **S6** Variants are rolled with equal odds among those whose `min_spice` is at most the card's spice. From: PG variants.min_spice; equal odds NEW. In: R.

**The plan's text against the data.** "Spice 1 offers only common parts; uncommon parts appear from spice 2 and rare cross-overs from spice 4": matches `min_spice` 1, 2, 4 and the zero weights. "three times as likely": matches `favoured_weight` 3. "holds back its avoided parts until spice 3": matches `avoided_until_spice` 3. "one step more common": in the word lists' prose only, with no field, so R holds it. The data adds what the plan leaves out: the step never applies to a class rarity. Spice 3 changes the odds, opens the avoided parts and opens 130 more variants (variants by `min_spice`: 142 at spice 1, 188 at 2, 130 at 3, 35 at 4, 6 at 5). Patterns' `flavour_lean` has no number anywhere (S5). Example: a Soviet vehicle at spice 1 rolls a tesla gun at weight 30 (uncommon stepped to common, ×3), a machine gun at 30, an autocannon at 10, a prism at 0.

## 4. Patterns on a card

- **A1 Signature.** Candidates have `slot` signature or any; their (or the variant's) `classes` include the card's class; the tier meets `min_tier`; the rarity (S3, S5) is allowed at the spice; at least one variant fits; their `requires` can be met, their `implies` and strength links can be set, their `excludes` avoided. Weight: S1 with S5, × 3 if it serves the primary role (G13). From: PG, V, P2.3; role weight NEW. In: PG, R.
- **A2 Variant.** Always chosen on a rolled card (null only on hand-made cards); its `overrides` replace the base fields they name, exactly as the validator reads them. From: PG variants, V; always-chosen NEW. In: R.
- **A3 Kind.** Rolled with equal odds among the variant's (or base) `kinds` allowed at the tier (`ultimate` only at T3) and fitting the key and passive budgets; a stun-class ability takes only kinds that use a key (HC3). From: PG kinds, WL ability-kinds.min_tier, V; odds NEW. In: R.
- **A4 Cooldown.** A key kind needs a cooldown band; passive and triggered get none. Weights (NEW): active short 1, medium 2, long 1; toggle spam 2, short 1; deploy spam 1, short 2; channel short 1, medium 2; ultimate long 2, per-life 1. A hard-control ability takes medium or long (per-life for an ultimate) whatever its kind; the weights of its kind do not apply. From: V, CS, 5B; weights NEW. In: R.
- **A5 Seat.** Seats are given out at step 12, once the crew is known. The driver owns every ability, except: a commander seat owns one ability (the last extra, or the signature when there is no extra; idle-seat flag), and a gunner seat owns the secondary weapon (C4). From: 2A, WL seat-roles, balance-flags.idle-seat; placement NEW. In: R.
- **A6 Extras.** Candidates have `slot` extra or any; same filters as A1; never the same pattern twice. The card aims for a total number of abilities by tier, then adds extras while the key and passive budgets allow (a secondary weapon takes its key first): T1 1 or 2 (weights 2:1), T2 1, 2 or 3 (1:2:1), T3 2, 3 or 4 (1:2:1); at most 3 extras (CS). From: B3 ("tiers cap the number of abilities"), CS; targets NEW. In: R.
- **A7 Pattern fields, all of them used:** `classes` hard ban; `class_rarity` S3; `rarity` S1; `flavour_lean` S5; `min_tier` and `kinds` A3; `slot` A1, A6; `requires` G4; `excludes` the finished card has none of the links; `implies` G3; `conflicts_with` no card holds both patterns, whichever side lists it; `adds_strengths`, `adds_weaknesses` section 8; `counters`, `countered_by` section 9; `points` section 10. From: PG schema, V. In: PG.
- **A8 Implied patterns.** An implied `pattern:` link (tunnel-carrier → burrow, own-fire → leave-hazard-zone) adds that pattern as an extra ability, inside the budgets, or the variant is not offered. From: PG implies; NEW. In: R.
- **A9 Second form.** Only transform gives a second form (`parts.modes`, one entry): a class the transform pattern allows other than the card's own, a mobility rolled for that class (step 5 rules, without the body rule, since cards record no second body), and 0 or 1 weapon rolled by step 13. Deploy-siege-mode adds no second form in step 3b: a card's mode needs a mobility, and a deployed unit cannot move. The card schema and the field rules do allow a deploy form, so this is a choice (question MD); the ability's own text describes the deployed state. From: CS modes, FR modes; the limit to transform is NEW. In: R.
- **A10 Adaptive weapons.** An implied `weapon:adaptive` is the primary weapon, unless the pattern's `requires` names another family for the card (leech-weapon-on-kill), then it is the secondary weapon. It gets 2 to 4 `conditional` weapons rolled by step 13, each with a `when` link: a passenger role (`role:...`) for passenger-sets-weapon, a victim family (`weapon:...`) for leech-weapon-on-kill. From: CS ("Needed when a weapon's family is 'adaptive'"), FR Paired entries; NEW. In: R.
- **A11 One mechanic under two names.** The check (script `duplicates.mjs`): a pair is a candidate when the patterns are linked `variant-of` or `generalises`, or when their generator blocks score 0.5 or more on likeness (the mean overlap of categories, kinds, classes, implies, requires, countered_by, counters and hooks) and two or more unit entries link both. A pair you confirm is listed in R and treated like `conflicts_with`. No pattern is merged or renamed. First run: 2 candidates of 2,346 pairs: freeze-and-shatter with stack-to-overload (`variant-of`; already in `conflicts_with`; whether to merge stays yours at step 4) and rally-allies with resupply-allies (judged distinct: a buff against a refill). So no new pair is listed. From: plan change of 12 November; criteria and 0.5 NEW. In: R.

Counts (`counts.mjs`, `feasibility.mjs`, `signature-counts.mjs`): slot any 54, signature 10, extra 5; rarity common 19, uncommon 44, rare 6; min_tier t1 44, t2 23, t3 2. Under the word lists and the pattern blocks, every pattern and every variant can be offered for some class and tier; the hard-control rules (section 6) then keep 4 variants out. Signature candidates at spice 5: from 36 (aircraft T1) to 62 (walker T3); at spice 1, from 8 (Soviet aircraft T1) to 28. Under G5 a pattern whose implied parts are above the spice gate is not offered on the generator's own rolls: repair-allies, for example, is out at spice 1 in 36 of the 54 combinations of class, tier and flavour.

## 5. The key budget (decision 1B)

| Tier (WL tiers) | max_keys | max_passive | max_keys_per_seat |
|---|---|---|---|
| T1 | 2 | 1 | 3 |
| T2 | 3 | 1 | 3 |
| T3 | 4 | 1 | 3 |

- **K-a What is a key:** an ability whose kind has `uses_key` true (active, toggle, deploy, channel, ultimate); a mobility trait with `uses_key` true (leap, boost, burrow, teleport, transform, deploy-anchor); the secondary weapon, even when a gunner fires it. Passive and triggered abilities count against `max_passive` (the signature too). A signature that is the card's primary weapon, fired with primary fire, is counted as a key today, although the tiers word list says it counts as primary fire (question K2). From: 1B, WL ability-kinds.uses_key, mobility-traits.uses_key, V (keys and passives), FR Main weapon. In: WL, V.
- **K-b Never keys:** E interact, hold F shake off, hold X bail out, 1-3 switch seat, middle mouse ping, G evict passengers. From: 1B, P2.3, WL tiers description. In: WL.
- **K-c Per seat:** no seat holds more than 3 keys; movement traits sit with the driver. So a solo card has at most 3 keys, even at T3 (question T3S). From: 1B, WL tiers.max_keys_per_seat, balance-flags.seat-overloaded, seat-roles.driver. In: WL.
- **K-d Key-bound traits** are never rolled on their own. A card has one only when an ability on it implies the trait: its own pattern (leap, dash, burrow, teleport, transform, deploy-siege-mode), or a variant of another pattern that implies it (four variants imply deploy-anchor: gather-resources deploy-processor, leave-hazard-zone planted-field, reveal-area deployed-array, shroud-area fixed-generator). Such a variant does not add a second ability. From: WL mobility-traits description ("need their matching mechanic pattern"), PG implies; the wider reading NEW. In: WL, R.
- **K-e Counting conflict (K1).** The validator adds the trait and the ability as two keys, though they are one button; 14 of the 15 units with such a trait also link the pattern (`keytraits.mjs`). Under that count 52 variants cost 2 keys and fill a T1 card alone, and the 46 of them open at T1 can never be the signature of a T1 two-seat card. Counted once, wherever an ability on the card implies the trait, only one variant costs 2 keys (`keys.mjs`). The generator follows whichever count you approve.
- **K-f Layout:** LMB primary weapon; RMB secondary weapon; Q signature; R next ability; Space key-bound movement; Shift a fourth key. A signature that is the primary weapon may sit on LMB. A gunner uses LMB for its gun. From: 1B layout, CS (the inputs it lists, Shift among them). In: R.
- **K-g** `balance.keys` is the count above. From: CS, V. In: code.

## 6. Hard control (decision 5B)

The data has no hard-control field. Its definition comes from the balance flag: "a stun, freeze or attach effect", and from 5B: stuns only from T2, kept short, on a medium or longer cooldown, and every lockdown card states the victim's escape. Roots, silences and slows are not hard control: 5C names them as the soft alternative. Knockback and suppression are not either (NEW reading).

**Weapons are a separate case.** The word lists say four weapon families stop a target in some way: cryo slows and then freezes it solid, emp stops machines from moving or firing, psionic controls or lifts, magnetic pulls or lifts. None has a tier limit. Cryo is a favoured Allied part and emp a favoured Empire part, so both can roll at spice 1, and the plan's own example card has a cryo weapon at T1. This sheet does not hold them to T2 or to a cooldown; it gives each such weapon a fixed escape line instead (HC7, question HC).

**Exception to decision 5B** (Mustafa, 13 November 2026; question HC, answer A). Decision 5B allows stuns only from T2, kept short and on a medium or longer cooldown. Weapons of the cryo, emp, psionic and magnetic families may freeze or stop a target at any tier and without a cooldown, because a weapon has no cooldown. Of 5B, only the rule that the card states the victim's escape applies to them (HC7).

| Hard control (list in R, NEW) | Class | Escape line (`player_translation.as_target`) |
|---|---|---|
| weapon trait stun | stun | never on a card weapon (HC1) |
| weapon delivery attach | latch | the universal shake-off (hold F) |
| freeze-and-shatter, all but brittle-chill, shatter-strike, shatter-threshold | stun | /1 |
| lock-in-stasis, all but shelter-ally, other-plane | stun | /2 |
| pull-target, mind-control, hijack-vehicle (all variants) | stun | /1, /2, /0 |
| disable-machine: shutdown-pulse, charged-burst, clamp-on-stunner | stun | /1 |
| stack-to-overload: stagger-window | stun | /3 |
| confuse-enemies: curse-one-ally | stun | none stated |
| burrow: erupt; lay-mines: snare-trap; passenger-sets-weapon: tool-seat (text: stun or freeze only from T2) | stun | /3 (avoid), /2 (avoid), none |
| suppress-with-fire: knockdown-barrage; dash: pin-charge; launch-drones: summoned-brute; execute-target: committed-takedown (borderline) | stun | /1 (avoid), none, /1 (avoid), /1 (avoid) |
| become-invulnerable: lock-and-pulse; retaliate-on-hit: reflect-window (both stun attackers; T2 actives) | stun | /1 (avoid), /1 (avoid) |
| infest-vehicle (all); throw-explosive: sticky-charge | latch | /1, /1 |

- **HC1** The stun weapon trait is never rolled on a card weapon: a weapon part has no cooldown, so "a medium or longer cooldown" cannot hold. Stuns come only from abilities. From: 5B, WL weapon-traits.stun, CS weaponPart; NEW. In: R.
- **HC2** A stun-class ability needs tier T2 or higher (its variant's min_tier or the tier its own text names). From: 5B, WL weapon-traits.stun.min_tier. In: R.
- **HC3** A stun-class ability takes a kind that uses a key and a cooldown of medium or long, or per-life for an ultimate. From: 5B. In: R, P3.
- **HC4** Every hard-control part puts its escape into `text.how_it_plays.as_target`: the pattern's own escape line, or for a latch delivery the fixed line about the universal shake-off (hold F), kept in X. A variant whose pattern states no escape is not offered. From: 5B, balance-flags.hard-control-without-escape; NEW. In: R, X.
- **HC5** "Kept short" is not a card field; it is stated by the variant's own text. Not checked in step 3b. From: 5B. In: none.
- **HC6** Latches may appear at T1 (infest-vehicle starts at T1 in the data), but they need their escape line (HC4). From: PG infest-vehicle.min_tier, 5B. In: R.
- **HC7** A card weapon of the cryo, emp, psionic or magnetic family adds a fixed escape line to `as_target` (kept in X), for example: break the line of fire and the frost stops building. These families are not held to T2 or to a cooldown. From: 5B (every lockdown card states the victim's escape), WL weapon-families; NEW, and an exception to 5B that Mustafa approved on 13 November 2026 (question HC, answer A). In: R, X.
- "(avoid)" in the table: that line says how to avoid the effect, not how to end it. It counts as the escape for the entries marked so (question HC).

Result (`hard-control.mjs`): 58 variants listed (47 stun, 11 latch). Eight break a rule, some more than one: 2 can never be offered (mind-control auto-capture-field and tool-seat take only passive kinds), 3 state no escape (curse-one-ally, tool-seat, pin-charge), 3 gate their stun by tier only in their text, 3 borderline ones are open at T1 (question HC). So 4 variants are kept off cards.

## 7. Crew, seats, availability, death, sensors and air

| Part | Default or rolled | Rule | From | In |
|---|---|---|---|---|
| crew model | rolled | step 12 term rules; squad only infantry or drone, rare (spice 4); driver-gunner-commander from T2 | 2A, 7B, WL crew-models | WL |
| solo fallback | rolled, multi-seat only | full-control common, auto-gunner uncommon, seat-swap rare, needs-crew rare; null for solo, squad, remote | 2A (data matches it exactly), WL solo-fallback, V | WL |
| who does what | default | with full control or an auto-gunner the buyer drives and fires the primary; a gunner seat owns the secondary weapon (C4); a commander seat owns one ability. With seat-swap the lone player switches between driving and shooting, and with needs-crew the main gun needs a second player (both rare, as 2A allows) | 2A, WL solo-fallback, FR armament seat | R |
| passengers | only when a chosen pattern or variant implies or requires them (carry-passengers, passenger-sets-weapon, and variants such as disguised-carrier, rope-drop, storm-a-garrison or wreck-fort) | seats from the needed minimum to a cap by size (tiny 0, small 1, medium 4, large 6, huge 8); a variant that needs more than the cap is not offered. Kind: passenger-module for passenger-sets-weapon (passenger-firing for its fire-ports variant), passenger-cargo for all others | FR Paired entries (which names only those two patterns), PG implies and requires; the wider reading and the caps NEW | R |
| body count | default | 1; squad 2 to 5, equal odds | CS; odds NEW | R |
| nature | default | infantry organic; drone uncrewed machine; other classes crewed machine; remote crew uncrewed machine; beast body organic (walker, aircraft: rare) | WL nature, classes descriptions; NEW | R |
| availability | rolled | fixed weights: open 10, limited 2, unique 1; limited from spice 2, unique from spice 4 and from T2 | 7B, WL availability.min_tier; weights NEW (question AV) | R |
| on death | rolled | outcome 1 from {respawn, bail-out, pilot-eject}, the 3C default (bail-out for a crewed machine, respawn for the rest) three times as likely; bail-out and pilot-eject only for a crewed machine (never for a drone, a beast or a remote crew). Optional outcome 2 from {wreck, death-blast} (weights 4:1 for none:one); a wreck never goes with respawn, whose word-list text says nothing is left. Term rules apply (infantry: no bail-out or wreck) | 3C, WL on-death; groups, the crewed-machine limit and weights NEW | R |
| sight | rolled | short 1, medium 4, long 1; long × 3 for scout and marksman | 6C, WL sight-bands; weights NEW | R |
| sensor traits | rolled | 0, 1 or 2 (weights 6:3:1); term rules | 6C, WL sensor-traits, CS max 2 | WL, R |
| air layer | default | from the mobility's `target_type`: rotor and jetpack low air; jet and airship high air | 6C, WL mobility.target_type | WL |
| unarmed | rolled | primary null only when the role is support, transport, infiltrator, engineer or logistics and the signature's category is support, transport-garrison, infiltration, summon or control; chance 1 in 3 | CS armament.primary; the role condition and the chance NEW | R |
| secondary weapon | rolled | always with a gunner seat; otherwise chance 1 in 2 if the key budget allows | 2A; chance NEW | R |
| resource | default | none, unless a pattern implies or requires one | WL resources ("at most one"); NEW | R |

- **C1 Counts (NEW, R):** mobility traits without a key 0, 1, 2 (weights 6:3:1, keyed traits included in the 2); armour models 1 or 2 (3:1); weapon traits per weapon 0 to 3 (4:4:2:1, implied ones included). From: CS maxima; weights NEW.
- **C2** A multi-seat crew must have a solo fallback. From: V. In: V.
- **C3** Two outcomes never contradict: one "who gets out" outcome, at most one "what is left" outcome, and no wreck with respawn. From: WL on-death descriptions; NEW. In: R.
- **C4** An operating seat (gunner, commander) owns at least one weapon or ability. From: WL balance-flags.idle-seat. In: R, P3.

## 8. Strengths and weaknesses

- **M1** A card's strengths and weaknesses come from its abilities: each pattern block adds its `adds_strengths` and `adds_weaknesses` (a variant's overrides replace them). Every base block has exactly one of each; 77 variants override strengths, 115 weaknesses (`counts.mjs`). Parts add none on rolled cards in step 3b (question MU). A hand-made card may hold more: the plan's example card pairs its fast speed with its light armour. From: PG; no-parts NEW. In: PG.
- **M2** Each link must match the card's own parts (the validator rejects one that does not). Counting the base blocks and the variants' overrides together, 258 are the pattern itself, 70 are implied, 9 are required and 5 are not guaranteed (`sw-links.mjs`). Seen per variant, 21 links are not guaranteed (the second agent's count): 19 because a variant inherits one of those 5, and 2 because repair-allies heal-aura empties `implies` but keeps the base block's repair-tool strength and weakness. The generator sets such a link like an implied part, or the variant is not offered. From: V; NEW. In: R.
- **M3 Pairing, exact check:** every strength has `paired_with` = the index of a weakness that exists (the validator checks this today). On a rolled card the pair also comes from the same ability: within one ability the strengths pair with its weaknesses in order, and a second strength pairs with the last weakness. An unpaired weakness is allowed. The same-ability rule is checked by the rolled-card checker (P3), not by the validator, so hand-made cards such as the example stay valid. From: B3, P2.3, CS, V, balance-flags.strength-without-weakness; same-ability rule NEW. In: R, V, P3.
- **M4** Lists are kept to at most 5 entries each, signature first. From: FR Matchups (7); cap NEW. In: R.

## 9. Counters

- **N1 Satisfy.** A typed link is satisfied by a card when the validator's matching (`matches` in `scripts/validate.mjs`) is true for that card: `class:` its class; `role:` primary or secondary; `weapon:`, `damage:`, `delivery:`, `range:`, `weapon-trait:`, `hits:` any weapon, conditional ones included; `pattern:` any ability; `category:` an ability's main category; `target:` the mobility's target type (a tiny or small ground unit counts as infantry); ranked kinds with `<=` and `>=` by rank. `immune:` and `unit:` never match a card, and no card is a building (`target:structure`). From: V, FR Conventions (typed links). In: V.
- **N2 Exact check (the brief's "at least one counter"):** at least one of the card's `countered_by` links can be satisfied by some card the generator can roll, at any class, tier, flavour and spice; otherwise the card gets `no-counter` and is rolled again. The flag's own text names "countered by", so that is the list checked. Links no card can satisfy are dropped from the card. From: B3, P2.3, WL balance-flags.no-counter; drop NEW. In: R, P3.
- **N3 Which links can be satisfied** is worked out once per data version from the hard rules (`counters.mjs`): 52 distinct links in the patterns' `countered_by`; 3 cannot be satisfied (`weapon-trait:stun` 4 uses, because of HC1; `pattern:raise-shield`, not written; `immune:stack-to-overload`). No block is left without a satisfiable link. The test (T5) confirms each listed link by rolling a card with that part locked. From: NEW. In: code.
- **N4 A card's lists:** `countered_by` = its abilities' `countered_by`, plus links from its parts: each damage type whose `strong_vs` names the card's armour class, nature or armour model gives `damage:<type>`; a flier gives `hits:low-air` or `hits:high-air`; a card with no weapon that hits air gives `class:aircraft`. A `damage:` link whose `immune` list names the card's nature is dropped. `counters` = its abilities' `counters` plus, for each weapon damage type, its `strong_vs` links. Both must end with at least one entry (CS). From: PG, WL damage-types ("they drive the generator's counter hints"), FR Matchups (5); method NEW. In: R.

| Link kinds in `countered_by` (275 links, 18 kinds) | role 72, weapon-trait 48, class 38, range 28, speed 20, pattern 17, weapon 16, sensor 13, damage 6, armour-class 5, nature 5, target, armour-model, mobility-trait, size, cost, immune, delivery 1 each |
|---|---|
| **in `counters` (125 links, 17 kinds)** | class 31, role 23, pattern 14, armour-class 11, target 10, speed 7, mobility-trait 6, range 5, weapon-trait 4, nature 4, weapon 3, category 2, cost, delivery, damage, sensor, sight 1 each |

(`link-kinds.mjs`; base blocks and variant overrides.)

## 10. Balance hints (PROPOSED; every number here is NEW and a starting value)

**Pattern points** (0 to 3 each, the scale `generator.points` already has): power = the rank of `risks.balance.level`, complexity = the rank of `risks.readability.level` (low 1, medium 2, high 3), cost = power ÷ 2, rounded up. The four stored values win. Checked against them (`points.mjs`): cost 4 of 4, complexity 4 of 4, power 3 of 4 (lay-smoke is stored at 1, the formula gives 2). No pattern file is edited.

| cost/power/complexity | Patterns |
|---|---|
| 1/1/1 stored | lay-smoke |
| 1/2/1 | fire-power-shot (stored), band-together, block-abilities, dash, deploy-siege-mode, heal-self, join-ally-crew, overclock-self, resupply-allies, reveal-area, throw-explosive |
| 1/2/2 | dampen-missile-fire, suppress-with-fire (both stored), bombard-area, build-linked-exits, carry-passengers, convert-on-kill, disable-machine, drop-in-from-above, fortify-on-death, leap, leave-hazard-zone, overload-past-cap, pull-target, rage-when-wounded, rally-allies, refill-on-ally-buff, repair-allies, retaliate-on-hit, rewind-self, self-destruct, shrink-target, switch-weapon-mode, transform, upgrade-in-field |
| 1/2/3 | command-companion, confuse-enemies, disguise, heal-from-debuff, lay-mines, passenger-sets-weapon, reinforce-squad, shroud-area, teleport |
| 2/3/1 | deploy-turret |
| 2/3/2 | become-invulnerable, build-cover, build-structure, capture-structure, cloak, deal-percent-damage, depend-on-relay, earn-veterancy, execute-target, freeze-and-shatter, gather-resources, generate-income, hijack-vehicle, host-spawn-point, launch-drones, leech-weapon-on-kill, lock-in-stasis, produce-unit-in-field, sacrifice-for-allies, stack-to-overload |
| 2/3/3 | burrow, infest-vehicle, mind-control |

An ultimate kind adds 1 power (at most 3). **Part points**: steps above the middle term of each ranked word list, which the descriptions call the standard (medium):

| Part | Points | Counts toward |
|---|---|---|
| armour class | heavy 1, super-heavy 2 | power, cost |
| speed | fast 1, very fast 2 | power, cost |
| best weapon range | long 1, off-screen 2 | power, cost |
| size | large 1, huge 2 | cost |
| secondary weapon | 1 | power, cost |
| availability | limited 1, unique 2 (unique also 1 power) | cost |
| passenger seats | 1 | cost, complexity |

- **B1 Power (1 to 10)** = the sum over abilities of (pattern power − 1) + the part points for power, kept between 1 and 10.
- **B2 Complexity (1 to 10)** = the sum over abilities of (pattern complexity − 1) + keys + operating seats beyond the driver + 1 for passengers + 1 for a squad + 1 for a second form, kept between 1 and 10.
- **B3 Cost band** from the sum of pattern cost + the part points for cost: 0 to 2 very low, 3 or 4 low, 5 to 7 medium, 8 to 10 high, 11 or more very high. Expected bands: T1 very low to medium, T2 low to high, T3 medium to very high.
- Check on the hand-made example card (Rime Burr, T1): power 4 (the card says 4), complexity 4 (3), cost 4, low (low).
- The spread is narrow: 68 of 69 patterns have power 2 or 3, and cost is 1 (45 patterns) or 2 (24). Every cost band can be reached in every tier (sums: T1 1 to 13, T2 1 to 16, T3 2 to 20), but a plain T3 card with three cheap abilities sums 3 or 4, which is "low". So the `cost-outside-tier` warning may show often on T3 cards until the points are tuned in step 5.
- From: B3 and P2.3 ("a cost band derived from the parts, a power score and a complexity score"), CS (1 to 10, bands from `cost-bands`), WL ranks and ratings; method and every number NEW. In: R.

| Flag (WL balance-flags) | Severity | Fires when |
|---|---|---|
| no-counter | block | N2 fails |
| strength-without-weakness | block | M3 fails |
| too-many-keys-for-tier | block | keys over `max_keys` or passives over `max_passive` |
| seat-overloaded | block | a seat holds more than 3 keys |
| idle-seat | block | C4 fails |
| cost-outside-tier | warn | the cost band is outside the tier's expected bands (B3) |
| name-collision | block | a name or a text line fails the name check (T-a, T-b) |
| hard-control-without-escape | block | HC4 fails |
| off-flavour | warn | the card holds a part its flavour avoids (spice 3 and up, or forced by inputs or locks) |

A block flag never appears on a rolled card: the card is rolled again (G7). From: WL balance-flags (severity), P2.3; conditions as above.

## 11. Text

Templates are NEW and live in X; word banks in N. Every line taken from a pattern is our own paraphrased text. A line that names a real game, unit, faction or wiki is never used (T-b).

| Card text | Template | Fed by |
|---|---|---|
| name | Soviet: `{noun}` or `{noun}-{number}`; Allied: `{word} {letter}{digit}`; Empire: `{first} {second}` | N, by the flavour's `name_style` |
| pitch | `{A} {size} {flavour} {class noun}: {first sentence of the variant summary}`, cut at a word to 160 characters (CS) | size label; class noun and flavour word from N (soldier, vehicle, walker, hovercraft, aircraft, drone; Soviet, Allied, Empire); `variants[].summary` |
| signature name | `{flavour word} {noun for the pattern's category}` | N |
| signature effect | the variant's summary | `variants[].summary` |
| team-play hook | hook: the first of the pattern's `team_play.hooks` that the flavour favours, else its first; text: `player_translation.teammates[0]` | PG fields, WL faction-flavours.favoured.team-play-hooks |
| as user | `as_user[0]` of the signature, then the first sentence of each extra's | `player_translation` |
| as target | `as_target[0]`, then every hard-control escape line (HC4) | `player_translation` |
| teammates, tells | the pattern's second `teammates` line (the first when it has only one), so that the hook's line is not shown twice; `feedback[0]` of the signature | `player_translation` |
| controls | one entry per bound input, by the layout (K-f) | the card's parts |
| matchup reasons | the pattern's `why`; derived links (N4) use fixed sentences in X | PG, X |
| counterplay | the signature's `counterplay[0]` and `[1]`, each extra's `[0]` | PG counterplay |
| inspiration | the card's patterns; up to 3 of the signature pattern's `source_units`, picked by the seed | PG source_units |

**Word banks** (script `names.mjs`, file `word-bank.json`):
- **Soviet** (blunt, heavy: tools, weather, beasts, numbers): Rivet, Piston, Crank, Boiler, Furnace, Mallet, Girder, Ingot, Bellows, Squall, Sleet, Hail, Whiteout, Boar, Walrus, Elk, Auroch; numbers 3, 7, 9, 12, 21, 40.
- **Allied** (clean, technical: light, sky, cold, a short code): Lumen, Zenith, Cirrus, Stratus, Nimbus, Glint, Polar, Rime, Glacier, Floe, Lucent, Aster, Meridian, Parhelion, Sleetlight, Icefall; code letters A E L R with a digit 1 to 9.
- **Empire** (nature, animals, weather, virtues; two parts): first Willow, Cedar, Wisteria, Plum, Pine, Maple, Iris, Heron, Hare, Koi, Moth, Swallow, Bamboo, Peony; second Mist, Gale, Resolve, Grace, Valour, Vigil, Patience, Constancy, Thaw, Bloom, Current.
- **Signature nouns** by category: weapon-behaviour Strike, Lance, Volley, Breaker; control Snare, Lock, Hold, Bind; infiltration Latch, Breach, Tap, Tag; stealth-deception Veil, Shade, Mask, Hush; mobility Leap, Rush, Stride, Skip; mode-change Stance, Shift, Fold, Brace; defence Ward, Bulwark, Shell, Mantle; support Mend, Boon, Aid, Relay; transport-garrison Bay, Berth, Haven, Convoy; conversion Claim, Siphon, Turn, Theft; area Wall, Trap, Ground, Moat; summon Brood, Swarm, Call, Kennel; progression Rank, Edge, Climb, Grow.

- **T-a The name check** (NEW, stricter than the validator's). Real names: every unit name, faction name and game title in the data, and the real unit and ability names inside the patterns' examples. No working-name word is a word of a real name; no bank word is a whole source term (in-game ability name); no name the templates can build equals a real name or a source term. Signature nouns are plain English action words and may occur inside a real name (15 do, such as Wall in an engineer's wall section). Result: 110 bank words against 761 real names (55 units, 28 game titles, 139 factions, 539 example names) and 601 source terms: 0 collisions; 849 working names and 3,016 signature names, none equal to a real name. Eight first choices were replaced (Dawn, Zone, Line, Lotus, Mercy, Ember: words of real names; Blizzard, Ferry: source terms). After the second agent's check 15 more entries were dropped: names known from games or brands outside the data (Halcyon, Daybreak, Sledge, Anvil, Badger, Lynx, Dusk, Bison, Corona), the number 88, the code letters C and K (C4, K9), and three words the script had missed inside the data (Chisel, a weapon's name; Rain, in a game title that a pattern names; Crane). The script reads unit names, faction names, the registry's game titles and the example names in the patterns; weapon names and game titles named only in pattern text are added to it in step 3b. No list of names outside the data exists, so a word can still collide with the wider world: say so if one feels wrong. From: brief sections 2 and 6 (generated names original), P2.3, V (name equals a real unit name). In: N, V, P3.
- **T-b No real names in card text** (NEW). The templates take lines from the patterns. 106 of the 1,657 lines they can use name a real game, franchise, faction, unit or wiki (59 matchup reasons, 30 counterplay lines, 12 player-translation lines, 5 variant summaries). Such a line never goes onto a card: the generator takes the next line of the same field that passes the check, or a fixed neutral sentence from X. For text, the check uses the real names of T-a plus the short forms of the games' titles (such as Generals, Red Alert or Dawn of War) and the word wiki; the real names alone would catch only 85 of the 106. The same check runs on every text field of a rolled card. `inspiration` is the one place where a card points at real units, by their ids. The 106 lines are a data problem (section 14), for rewording at step 4. From: plan section 9 (real names never reach generated cards), brief section 6; method NEW. In: X, code, P3.

## 12. Tests the rules imply

- **T1 Same seed, same card:** 1,000 random inputs and seeds, each rolled twice: the two cards are identical (except `created_at`). From: B3, P2.3.
- **T2 Own dice per part:** the dice of one field are the same whether or not another part is locked; locking a part and rolling a new seed keeps that part's value; a card whose locked values break no rule keeps every other part. From: P2.3.
- **T3 10,000 random rolls, zero invalid cards,** checked by code that is separate from the generator: the card schema and the validator's card rules, and the new rolled-card checker, which holds every rule of this sheet that the validator does not check (P3). From: B3, P2.3.
- **T4 Every combination of inputs:** 7 class choices (6 or open) × 4 tier × 4 flavour × 17 role × 5 spice = 9,520 combinations, each with 20 seeds: each gives a valid card, or is on the published unavailable list, which must equal the computed one (today: role transport with class infantry or drone, 6 class-and-tier pairs, every flavour and spice). From: P2.3; 20 seeds NEW.
- **T5 Counters:** every link the counter table calls satisfiable is held by a card rolled with that part locked. From: N3.
- **T6 Spice:** a part above the card's spice gate appears only when an input or a lock needs it, which the checker works out from the card's recorded inputs and locks; with open inputs no part is above the gate; avoided parts never appear below spice 3. From: S1 to S5, G5, G6.
- **T7 Data:** the three generator files pass their schema; every pattern, variant, term and list they name exists. From: P1 below.
- **T8 Names:** `names.mjs` passes; no rolled card's names match a real name. From: section 11.

## 13. New files, the new schema and word-list changes

**Word lists:** no change in step 3b. To be plain about why: the word lists already have empty `points` and `brings` fields, and the patterns a `points` field that only 4 of 69 fill; the approved plan reserves them for the generator, and this sheet does not fill them yet. Part points come from ranks (section 10), matchups from patterns and damage types (N4), and a few odds that belong to terms (availability, sight, the default rarity) sit in the new rules file. When the numbers are tuned in step 5, moving them into the word lists is a word-list change that comes to you then (questions PT and MU).

**Also unchanged:** the example card (unless you answer K2 with A), the field rules, the pattern files and the pattern schema. The card schema allows deploy forms; step 3b simply does not roll them (question MD).

**Approved by Mustafa on 13 November 2026** (P1, P3 and P4 "with the wording in section 13 of the rule sheet"; P2 with its first sentence):

- **P1 One new schema and three data files.** `schemas/generator.schema.json` validates `data/generator/rules.json`, `names.json` and `texts.json`; each file says which it is in `kind`.

| Property | Type | Holds |
|---|---|---|
| `kind` | `rules`, `names` or `texts` | which file |
| `version`, `status` | text; `draft` or `approved` | goes into the data version |
| rules: `defaults` | object | default rarity (G9), favoured step (S2), flavour lean (S5), handling (G10), nature (section 7), on-death groups (C3), passenger kinds and caps, unarmed and secondary chances, input odds, spice default |
| rules: `roll_order` | list of step ids | section 2 |
| rules: `counts` | step id → list of weights | G14, A6, C1, body count, sensor traits, on death, availability |
| rules: `cooldowns` | kind → band → weight | A4 |
| rules: `role_fit` | role → `patterns`, `any` or `all` lists of ids and links | G13 |
| rules: `hard_control` | list of {pattern or term, class, variants, except, escape index, min_tier}; the weapon families of HC7 | section 6 |
| rules: `same_mechanic` | list of pattern id pairs | A11 (empty today) |
| rules: `points` | object | section 10 formulas, part points, thresholds, tier bands |
| rules: `layout`, `attempts` | slot → input; integer | K-f; 200 |
| names: per flavour | templates and word lists | section 11 |
| names: `signature_nouns` | category → words | section 11 |
| texts: `templates`, `derived_reasons`, `escapes`, `neutral` | field → template; link kind → sentence; fixed escape lines (HC4, HC7); fixed neutral sentences (T-b) | section 11, N4 |

- **P2 The key count in `scripts/validate.mjs` (K1):** a key-bound mobility trait that an ability on the card implies is the same button as that ability. Wording for the validator's header: "A key-bound mobility trait and the ability that implies it are one button and count as one key." If you answer K2 with A, a second sentence is added: "A signature that is the card's primary weapon and is fired with primary fire is not a key." Nothing on a card says today that its signature is its primary weapon, so K2 A also needs one new optional property in the card schema (P4), and the example card's key count changes from 2 to 1. Mustafa treats that as a fifth approval: its exact wording is shown to him first, and until he approves it the count stays as it is today.
- **P3 A new, separate checker for rolled cards** (`scripts/check-cards.mjs`, with tests). The validator's rules stay as they are, so hand-made cards such as the example stay valid. The checker runs on what the generator rolls and is written apart from the generator. It checks the rules of this sheet that the validator does not. The list:
  - the generator files against their schema, and every id they name;
  - keys per seat (K-c), idle seats and seats that exist (C4, A5);
  - hard control (HC1 to HC4, HC7);
  - a counter that some card can satisfy (N2), and pairing within one ability (M3);
  - the on-death rules (C3 and the on-death row of section 7), the unarmed rule, no solo fallback on a solo, squad or remote crew, body count, passenger seats and the availability gates (section 7);
  - the spice gate, with parts above it only where an input or lock needs them (G5, T6), and avoided parts (S4, G6);
  - conditional weapons for an adaptive weapon (A10), role fit (G13) and second forms (A9);
  - that a rolled card has a variant (A2), and its handling, ranges and mounts (G10 to G12);
  - the matchup lists (N4, M4) and the balance scores and cost band (B1 to B3);
  - the name check and the text check (T-a, T-b).
- **P4 One line in `schemas/concept-card.schema.json`:** `generator.data_version` from "Content hash of the vocabularies and patterns used" to "Content hash of the vocabularies, patterns and generator rules used". Without it, a rule change would not change the data version (G8). `data/manifest.json` is already in the approved plan. Only if you answer K2 with A: one new optional property on the card's signature, `primary_fire` (true or false), described as "True when the signature is the card's primary weapon and is fired with primary fire; it then uses no key."

## 14. Problems found in the data

Nothing was fixed. The first draft's list, with each file and JSON path, is `data-problems.json` (43 entries, script `data-problems.mjs`); the second agent checked 23 of them, covering every kind, and all held. The rows marked + were added by that check and are not in the file's 43. No generator block names a term that does not exist.

| Kind | Count | Example (file, path) | Effect here |
|---|---|---|---|
| names a pattern not yet written | 3 | `block-abilities.json` variants/4/overrides/requires/0 (`pattern:mark-target`); `fire-power-shot.json` generator/countered_by/0 (`raise-shield`); `cloak.json` generator/conflicts_with/2 (`draw-fire`) | that half or link can never hold |
| research-only class in a block | 4 | `host-spawn-point.json` generator/classes/6 and class_rarity/naval; same in `produce-unit-in-field.json` | ignored |
| `countered_by` link no card can satisfy | 6 | `weapon-trait:stun` in dash, heal-self, pull-target, rage-when-wounded (HC1); `pattern:raise-shield`; `stack-to-overload.json` generator/countered_by/1 `immune:stack-to-overload` | dropped from cards (N2) |
| strength link not guaranteed by its block | 5 | `execute-target.json` generator/adds_strengths/0 `hits:infantry` (and 2 variants); `leave-hazard-zone` `role:area-denial`; `reveal-area` `role:scout` | set like implied parts (M2) |
| key-bound trait counted as a second key | 10 implies, 53 variants | `dash.json` generator/implies/0, and burrow, deploy-siege-mode, leap, teleport, transform, 4 deploy variants | question K1 |
| hard control: tier gate only in text | 3 | `burrow.json` variants/3 (erupt), `lay-mines.json` variants/2, `passenger-sets-weapon.json` variants/1 | offered from T2 (HC2) |
| hard control at T1 (borderline) | 3 (1 of them +) | `suppress-with-fire.json` variants/5, `dash.json` variants/3; + execute-target committed-takedown | question HC |
| + abilities that stun attackers, not on the first list | 2 | become-invulnerable lock-and-pulse, retaliate-on-hit reflect-window | now listed (section 6) |
| + weapon families that stop a target, with no tier limit | 4 | cryo, emp, psionic, magnetic in `weapon-families.json` | question HC |
| hard control with no escape stated | 3 | confuse-enemies curse-one-ally, tool-seat, dash pin-charge | not offered (HC4) |
| hard control that can never be offered | 2 | `mind-control.json` variants/4 (passive), tool-seat | never offered (HC3) |
| possible duplicate | 2 | stack-to-overload with freeze-and-shatter; rally-allies with resupply-allies | A11 |
| inputs with no valid card | 2 | `roles.json` terms/8/classes: transport on infantry, on drone (all tiers) | greyed out (T4) |
| no variant at spice 1 | 1 | `sacrifice-for-allies.json` variants | only when you ask for it (G5) |
| + pattern text that names a real game, unit, faction or wiki | 106 lines | band-together counterplay/0; launch-drones timed-wave summary | never put on a card (T-b); reword at step 4 |
| + strength or weakness that a variant keeps but no longer guarantees | 2 links | `repair-allies.json` heal-aura (19 more are inherited from the row of 5 above) | set like an implied part (M2) |
| + strength or weakness links written with a comparator | 36 | `passengers:>=2` | read as written; the checker reports that the field rules (Matchups, rule 4) ask for plain links: one for the rule-fix round |

The static check found no class a block lists that a card of that class can never use, no `ultimate` below T3, and no block that implies what it excludes (`dead-classes.mjs`).

## 15. Decisions taken

**Mustafa, 13 November 2026: K1 A, K2 A, HC A, SP A, FL A, RF A, MU A, PT A, AV A, T3S A, MD A.** K2 A takes effect once he has approved the wording of the new card property (P2, P4). HC A is an exception to his decision 5B, recorded in section 6. The questions as they were put:

- **K1. Count a dash, leap or teleport once or twice?** The validator counts the movement trait and its ability as two keys, though the player presses one button. *Why it matters:* 52 variants then fill a whole T1 card. *Options:* A) count once (change P2); B) keep two. *Recommendation:* A.
- **K2. Is a signature fired with primary fire a key?** Your decision 1B lets a signature that is the unit's primary weapon sit on left mouse, and the tiers word list says it then counts as primary fire, so it is not a key. The validator and the plan's example card (the infester's pounce, 2 keys) count it as a key. *Why it matters:* a T1 card whose signature is its main attack has one key left, or two. *Options:* A) not a key, as the word list says (a validator change in P2, one new optional card property in P4 so that a card can say its signature is its primary weapon, and the example card's count goes from 2 to 1); B) a key, as the validator counts today (the sentence in the tiers word list then changes at the rule-fix round). *Recommendation:* A.
- **HC. What counts as hard control?** *Why it matters:* it decides which abilities wait for T2, need a cooldown and must state an escape. *Options:*
  - A) the list in section 6. Stuns, freezes, stasis, holds, full shutdowns, takeovers and latches from abilities count; so do knockdowns, grabs and abilities that stun attackers. Latches may appear at T1 with their escape, as on the plan's example card. Weapons that freeze or stop a target (cryo, emp, psionic, magnetic) are not held to T2 or a cooldown, but the card states the escape (HC7). That is an exception to 5B for those weapons: 5B asks for T2 and a medium or longer cooldown, and a weapon has no cooldown. The stun weapon trait is never rolled.
  - B) narrower: only stun, freeze, stasis and latches from abilities.
  - C) wider: the four weapon families count too and are rolled only from T2. Even then a weapon cannot meet 5B's cooldown rule. The plan's example card, a T1 unit with a cryo beam, would break the rule.
  - *Recommendation:* A.
- **SP. Spice fallback for what you ask for.** When you choose something the spice holds back (an engineer at spice 1 needs an uncommon pattern), should the generator use the least rare part that fits? *Why it matters:* without it, 156 combinations of role, class, tier and flavour would be greyed out at spice 1. What the generator rolls on its own never goes above the spice gate either way. *Options:* A) use the least rare part (G5); B) grey the combination out. *Recommendation:* A.
- **FL. Patterns that lean to a flavour.** *Why it matters:* it sets whether, for example, a Soviet card at spice 1 can roll infest-vehicle. *Options:* A) treat a lean like a favoured word-list part: three times as likely and one step more common; B) three times only; C) one step only. *Recommendation:* A.
- **RF. Role fit.** Should a role need a matching tool (an engineer needs a building or capture pattern)? The list in G13 also has two conditions that are new: assault needs medium or heavier armour, and raider needs fast speed with light or no armour. *Why it matters:* without it a card can claim a job it has no tool for. *Options:* A) yes, the list in G13; B) only the word lists' requires. *Recommendation:* A.
- **MU. Where strengths come from.** *Why it matters:* rolled cards show about one strength and one weakness per ability; parts add none, although the plan's example card pairs a fast speed with light armour. *Options:* A) patterns plus damage types now, and fill the word lists' reserved `brings` field later if cards feel thin (a word-list change for step 5); B) fill `brings` now (a word-list change now). *Recommendation:* A.
- **PT. The points method.** Power from each pattern's balance risk, complexity from its readability risk, cost from power. *Why it matters:* it sets every cost band and score on the sample page. *Options:* A) accept as starting values in the rules file, tuned in step 5 and then moved into the reserved `points` fields with your approval; B) set 69 × 3 points by hand now. *Recommendation:* A.
- **AV. Heroes and limited units.** 7B made "hero" an availability, but no odds exist. With the usual rarity odds, about 31% of T2 and T3 cards would be unique at spice 5. *Why it matters:* it sets how many cards are capped or one per team. *Options:* A) fixed weights: open 10, limited 2, unique 1 (about 77%, 15% and 8% where all three are allowed), limited from spice 2, unique from spice 4 and T2; B) always open in step 3b; C) the usual rarity odds. *Recommendation:* A.
- **T3S. A solo T3 card gets 3 keys, not 4.** Decision 1B caps each seat at 3, so only multi-seat T3 cards reach 4. *Why it matters:* T3 solo units are no busier than T2 ones. *Options:* A) keep, as 1B says; B) let a solo seat hold 4 at T3 (a word-list change). *Recommendation:* A.
- **MD. Deploy and siege forms.** The card schema lets a card record a second form for a deploy pattern as well as for transform. This sheet records one only for transform. *Why it matters:* a deployed form does not move, and a card's second form needs a way of moving, so a deploy form needs a new "does not move" term. *Options:* A) transform only in step 3b; a deploy ability is described by its own text; B) deploy forms now (a word-list change). *Recommendation:* A.

## 16. What the check changed

A second agent checked the first draft against the data, the plan and the validator. Of its 75 coded rules, 54 held, 19 held in part and 2 did not; every headline count and all 69 pattern points were reproduced. What changed in this draft:

- **The new card checks moved out of the validator** into a separate checker for rolled cards (P3). As first written they would have rejected the plan's own example card.
- **Hard control** now names the weapons that freeze or stop a target and three more abilities, and asks you about them (HC). A hard-control ability on a toggle can now get a cooldown.
- **The generator's own rolls never go above the spice gate.** The first draft let a rolled role pull uncommon parts onto spice-1 cards.
- **Pattern text that names a real game or unit never goes onto a card** (T-b).
- **Keys:** the wording of the count covers every case, and a second question is raised (K2).
- **Smaller fixes:** dice per field, not per step; drones no longer bail out; a wreck never goes with respawn; the passenger rule fits the patterns that need passengers; who fires the main gun under the rare seat-swap and needs-crew fallbacks.
- **15 name words dropped.**
- **Choices the first draft made silently are now questions** (MD, and parts of HC, RF and AV).

The same agent then checked this revision: 23 of its 26 findings were resolved and 3 in part, and it found 12 new slips in the revised text (3 medium, 9 low). Those 15 points are worked in as well; that last pass was not checked again.

Not redone: the counts of rules and of new numbers in the TL;DR are approximate after this revision. No generator exists yet, so every frequency in this sheet comes from the stated weights, not from rolled cards.

## 17. Values added when the rules were written as data

The rules went into `data/generator/` on 13 November 2026 (P1). Where the sheet gave a range or a rule without odds, the data takes the plainest value, and each such entry carries a `note` in its file. They are starting values like the rest:

- **Equal odds** where the sheet gives none: a hard-control ability's cooldown (medium or long); the number of conditional weapons (2 to 4) and of second-form weapons (0 or 1); the number of passenger seats between the needed minimum and the size's cap; the Soviet flavour's two name templates.
- **Text details:** a control's action text is the part's plain name; the as-target text never repeats a line; the pitch writes the size in lower case and uses "A" or "An" as fits.
- **Readings of this sheet:**
  - the word before the signature noun is a word from the flavour's own name words;
  - the unarmed rule and the sight boost read the primary role;
  - with seat-swap or needs-crew the gunner seat fires the primary weapon;
  - assault's range condition is read on the main weapon only;
  - the cap of five applies to all four matchup lists;
  - the cooldown rule for hard control covers latches as well as stuns, and only stuns are limited to kinds that use a key.
- **Housekeeping:** each file starts with `$schema` and `schema_version`, as the other data files do, and has version 0.1.0 and status draft.

`npm run check:generator` (`scripts/check-generator-data.mjs`) checks the three files against their schema, every id they name, this sheet's counts, the card texts (no real name, no wording shared with the patterns) and that every rule code of sections 2 to 11 has its place in the data (`research/generator/data/coverage.json`).

## 18. Points settled while the checker and the module were built

The checker of P3 is written from this sheet alone, apart from the module. Writing it showed places where the sheet did not say enough. They are settled here, on 13 November 2026; none changes an answer of section 15.

- **What "names a real thing" means (T-b).** A text names a real thing when it holds a whole real name: a name of T-a's list, a franchise, a short form of a game's title, or the word wiki. A name of several words counts when its words are capitalised as in the name. A name of one word counts when it is capitalised in the middle of a sentence; at the start of a sentence it counts only when our own texts never write the word in lower case, or when it has capitals inside it. A plain description of a side, such as "every side", is not a name. Read this way, 108 of the pattern lines that the templates can use fail, 2 more than the first count.
- **The fallback of T-b.** A field with one value (a summary, a reason) takes its neutral sentence. A field with several lines takes the next line that passes and is not on the card yet, and the neutral sentence when there is none.
- **An adaptive weapon** has no damage type, delivery or range of its own; its conditional weapons carry them.
- **The pitch** is cut after the last whole word that fits in 160 characters, with no dots added.
- **Controls.** The signature sits on Q, the first extra ability on R and the next on Shift. An ability that implies a key-bound movement trait sits on Space, as the movement key. A passive or triggered ability has no entry, and neither have conditional weapons or the weapon of a second form.
- **The order of matchup links (N4).** First the links of the abilities, the signature's first. Then the links from parts. In "countered by": the damage types in the word list's order, then the link for fliers, then the aircraft link. In "counters": for the primary weapon and then the secondary, what its damage type is strong against, in the word list's order. A second form's weapon adds no link.
- **On-death outcomes** follow rarity and spice like every rolled part.
- **The name check (T-a)** also reads the weapon names of the researched units, and the titles of the games that the patterns' examples come from.
- **Not on rolled cards today:** the range off-screen (no weapon family leads to it), so its points never apply.

**Settled by the first cross-check** (13 November 2026). The module's cards were run through the separate checker. Where the two read this sheet differently, the reading below now holds, and the side that read it otherwise was changed.

- **Implied patterns (A8).** The implied pattern is on the card, as the signature or as an extra.
- **The number of abilities (A6).** The tier's largest count is a cap, the signature included, also when a role, an implied or required pattern or a lock needs an extra. What does not fit is not offered.
- **A chosen role's tool (G13 with G5).** In this order: a tool as the signature at the spice gate; a tool as an extra at the gate; above the gate, a tool as the signature when one fits by the hard rules; a tool as an extra above the gate.
- **Passenger seats and the spice gate (G5, S6).** Seats have no rarity of their own, but only a pattern brings them (section 7). So the pattern that brings them is the part judged against the gate, and a variant above the card's spice is allowed when the card needs seats and no variant within the spice brings them.
- **Nature (section 7).** The data's order decides: the first entry whose condition holds. An entry is passed over only when the nature word list does not allow that nature for the card's class, so a drone with a creature body stays an uncrewed machine. No other part overrules it: a part that excludes the card's nature is not offered.
- **Counter links from weapons (N4).** Conditional weapons count: what each one's damage type is strong against, in their order, at the place of the adaptive weapon they belong to.
- **Escape lines (HC7).** A second form's weapon of the cryo, emp, psionic or magnetic family owes its escape line too.
- **Controls.** An ability on the movement key has one entry on Space, named as the ability is on any other key. A key-bound trait with no key ability behind it keeps an entry of its own, named by the trait. When the signature is passive, a third ability on a key takes Q.
- **The text check (T-b), in detail.** A real name followed by a possessive ending is still that name. In an example's name, the part before a colon, each bracketed part, and each part between commas or semicolons inside brackets are names of their own, also when they are one word. Our own words are not real names in a text: the labels of the word lists, the patterns' names, and the flavour words and class nouns that the pitch writes (EMP is such a label). The weapon names of the researched units are read by the name check only: many are plain words. Read this way, 206 of the 2,713 distinct pattern lines that a card can show fail the check.
- **The pitch.** When the cut leaves a clause unfinished, the pitch is cut back to the last comma, semicolon, colon or bracket before it, and that mark is dropped.
- **Names.** The word in the signature's name is never a word of the card's working name.
- **Body-aim weapons** sit on the driver's seat only. The validator asks for this; the aim-models word list says it only in prose (a data problem for step 4).
- **Not on a card today:** what an extra ability does. The card schema has an effect text for the signature only. The sample page reads each extra's summary from the patterns instead.

## What comes next

1. The rules as data (P1), the key count (P2) and the card schema line (P4).
2. The module in `src/core/` (job 1 of 4 is done), a command that rolls cards and a first page of sample cards, which Mustafa sees as soon as the module rolls valid cards and before the review passes.
3. The wording of the card property for K2 A, for his approval.
