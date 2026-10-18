# Unit Forge, step 1: plan, fields, vocabularies and samples

**For:** Mustafa · **Status:** waiting for your approval · **Covers:** section 7 of the brief (the plan and repository structure, the full list of fields and vocabularies, and the Terror Drone, Hammer Tank and Allied IFV with three patterns, fully filled in)

## TL;DR

- **What this is.** The plan for Unit Forge, every field and word list the research will use, and the three requested units and three mechanic patterns, filled in and cited. The big research run starts only after you approve this.
- **What to read.** This page, the [samples](samples.md) (about 15 minutes) and the core lists in the [vocabularies](vocabularies.md). The [field reference](fields.md) is there for the details.
- **How the data fits together.** Researched units link to *mechanic patterns*. Each pattern carries the heart of the tool: how it plays when one player *is* the unit, as the user, as the target and for teammates. The generator combines word-list terms and patterns into concept cards, and cards go on your board.
- **The three samples.**
  - **Terror Drone:** a cheap T1 drone that rides inside an enemy tank.
  - **Hammer Tank:** a T2 battle tank that steals the gun of whatever dies in its beam.
  - **Multigunner IFV:** a T1 car whose roof weapon depends on which soldier rides inside.
- **The three patterns.** *Infest a vehicle*, *leech the weapon of what you destroy* and *a weapon that changes with the passenger*. Each has 7 sourced RTS examples, 4-5 shooter examples and 11 variants the generator can roll.
- **One finding that changes the brief's assumptions.** The Hammer Tank is *not* a starter tank: like every RA3 main battle tank it needs a tech step, so it is T2. RA3's T1 vehicles are scouts, transports and light support. Several RA3 units also break rules we want for Shamble; for example, the IFV can stun infantry at T1. The data records such units as they are and lists the rule breaks, so we can choose which rules to keep.
- **Your input is needed on nine decisions** (at the end). The most important ones: how the tier limit on abilities works, who controls a multi-seat vehicle when you are alone in it, and what happens when a vehicle dies.

## Contents

1. [What is in this step](#1-what-is-in-this-step)
2. [The plan](#2-the-plan)
3. [Repository structure](#3-repository-structure)
4. [How the data fits together](#4-how-the-data-fits-together)
5. [Fields](#5-fields)
6. [Vocabularies](#6-vocabularies)
7. [The samples](#7-the-samples)
8. [How this draft was made and checked](#8-how-this-draft-was-made-and-checked)
9. [Risks](#9-risks)
10. [Decisions needed](#decisions-needed)
11. [For Mustafa](#for-mustafa)

## 1. What is in this step

| File | What it is |
|---|---|
| `docs/proposal.md` | This page. |
| `docs/samples.md` | The three units, three patterns and an example concept card, in readable form. |
| `docs/vocabularies.md` | All 37 word lists (299 terms) with their meaning and combination rules. |
| `docs/fields.md` | Every field of every record type. |
| `data/units/ra3.json` | The three source units. |
| `data/patterns/*.json` | The three patterns, one file each. |
| `data/vocab/*.json` | The word lists, one file each (draft version 0.3.0). |
| `data/games.json` | The games registry, with Red Alert 3's tech tiers, price bands and speed reference. |
| `schemas/*.schema.json` | Draft JSON Schemas for every record type, including the concept card and the board (later phases). |
| `docs/examples/concept-card.example.json` | One hand-made concept card, to show what the generator will produce. |

The three readable `docs/*.md` pages are generated from the JSON, so the docs and the data can't disagree. Everything validates against the schemas. No code, tooling or app has been built yet; that starts after your approval.

## 2. The plan

### 2.1 Phases and pull requests

| Step | What happens | Output | Pull requests |
|---|---|---|---|
| 0 | **This proposal.** | Plan, fields, word lists, 3 units, 3 patterns, example card. | This one |
| 1 | **Foundations.** Turn the checks used for this draft into real scripts: the validator, the docs builder and a copy-check. Set up CI. Fill the games registry for the whole starting scope, and seed a list of about 50 pattern ids so every research agent uses the same names. | Repo tooling and CI; `data/games.json` complete. | 1 |
| 2 | **Calibration pilot.** Three agents code the same three RA3 units without seeing each other's work, plus three units from games without tiers or prices (StarCraft II, Company of Heroes, Battlefield). Any field they agree on less than about 80% of the time gets a sharper rule or a merged term. Then the word lists are frozen as version 1.0. | Word lists 1.0, tie-break rules. | Part of step 1 |
| 3 | **Research run.** Six batches (below), each in its own pull request. Per batch: research agents, then a separate checker, then the validator. | Units and proposed patterns, with a short report per batch. | 6 |
| 4 | **Pattern consolidation.** Merge duplicate patterns, set the generator rules, write the coverage report and the top-30 list. | `docs/research/coverage.md`, `docs/research/top-30-patterns.md`. | 1 |
| 5 | **Generator.** A pure TypeScript module: seeded rolls, lock and reroll, spice, rules, balance hints, text templates and original names, with full tests. | `src/core/`. | 2-3 |
| 6 | **App.** Generator view, library, board, compare, duplicate and edit, remix, export and import, then polish (light and dark mode, keyboard) and deployment to GitHub Pages. | `src/app/`, a public link. | 4-6 |

Every pull request stays small, runs the schema checks and tests in CI, and ends with a report in the brief's format: TL;DR first, "Decisions needed" and "For Mustafa" last.

### 2.2 The research run

**Batches**, one research agent per franchise inside each:

| Batch | Games |
|---|---|
| R1 | Red Alert 1, 2 (with Yuri's Revenge) and 3 (with Uprising) |
| R2 | C&C Tiberian Dawn, Tiberian Sun, Tiberium Wars (with Kane's Wrath), Renegade |
| R3 | C&C Generals (with Zero Hour), Tempest Rising, Iron Harvest |
| R4 | Company of Heroes 1-3, World in Conflict, Wargame, Broken Arrow |
| R5 | Supreme Commander, Planetary Annihilation, StarCraft II, Halo Wars 2, Dawn of War 1-2 |
| R6 | Battlefield (vehicle archetypes), PlanetSide 2, Foxhole, WARDOGS, Arc Raiders, MechWarrior/BattleTech |

**How a batch runs:**

1. **Before the agents start,** I fill in each game's registry entry (factions, expansions, tech tiers, price bands, speed reference) and share the seed list of pattern ids.
2. **Each agent proposes 8-15 units per game** that teach something: a distinct mechanic, an iconic counter or a memorable twist. I trim the list to avoid repeats, then the agent fills the entries, using this step's three units as worked examples. New mechanics go in as *proposed* patterns, one file each.
3. **A separate checker** re-opens the sources for at least one unit in five per game (at least three), plus every new pattern. It focuses on tier, cost and abilities, and records which fields it checked and which were wrong. A batch with more than 15% wrong fields is redone.
4. **The validator** must pass: schemas, word lists, links between files and combination rules. A copy-check flags any run of eight or more words shared with a cited page, and image links are rejected.
5. **The pull request report** lists coverage gained, units that break our rules, and places where no term fitted (the "vocabulary gaps" that feed the next word-list version).

**Games added beyond the starting scope** need a reason: the new mechanic they teach and the patterns that justify them. They are listed in the registry and in the final report.

**Size target:** about 250 units and 80-100 patterns after merging. See decision 8.

**Coverage report:** games × classes, units per franchise, patterns per category, patterns by how many franchises use them, units without tiers or prices, rule breaks, and vocabulary gaps.

**Top-30 patterns for a player-controlled shooter:** ranked by a published formula: 2 × shooter fit + team-play potential + (4 − build difficulty) + (4 − readability risk) + how many franchises use it. Plain mechanics (sprint, self-heal, stat buffs) are excluded, and every entry gets a one-paragraph reason.

**Source access.** The Command & Conquer wiki blocks automated page fetches but allows its official API, which is how this step's research was done. It rate-limits heavy use, so the run throttles requests and keeps a local cache of fetched pages; the cache is never committed. Other sources: StrategyWiki, CNCNZ, official pages and patch notes, and the established wiki for each series. Recent games with thin wikis (WARDOGS, Arc Raiders, Broken Arrow) may cite gameplay video at lower confidence.

### 2.3 The generator (Phase 2) at a glance

- **Inputs:** class, tier, faction flavour, optional role, spice (1 grounded to 5 wild), a seed, and any locked parts.
- **Roll order:** class, then the signature pattern (which sets parts it needs, such as passenger seats), then mobility, body, size, speed, armour, crew, weapons, extra abilities, matchups and text. Every step only offers terms that fit everything already chosen, so nonsense such as tracks on an aircraft can't be rolled.
- **Seeds:** every field draws from its own random stream (seed plus field name). Locking one field never changes the others, and a seed plus the same data version always rebuilds the same card.
- **Spice:** each term has a rarity. Spice 1 offers only common parts; uncommon parts appear from spice 2 and rare cross-overs from spice 4. A faction flavour makes its favoured parts three times as likely and holds back its avoided parts until spice 3.
- **Rules from the brief:**
  - aircraft don't get tracks (combination rules on every term);
  - tiers cap abilities (a key budget per tier);
  - every strength is paired with a weakness;
  - every card has at least one counter that some valid card can actually satisfy.
  A card that breaks a rule is rerolled. Hand-edited cards show the break as a warning flag instead.
- **Balance hints:** a cost band derived from the parts, a power score and a complexity score, the number of keys, and warning flags.
- **Text:** the working name, pitch and "how it plays" are built from templates, using the patterns' player translations and faction word banks. No AI is used in version 1. Names are checked against every real unit name in the database.
- **Tests:** the same seed reproduces exactly; 10,000 random rolls produce zero invalid cards (checked by a validator separate from the generator); every class, tier, flavour and role combination either yields a valid card or is greyed out in the app.

### 2.4 The app (Phase 3) at a glance

A static TypeScript site built with Vite, using the small Preact library for the interface, with no backend. The data ships as the JSON files in the repository. The board is saved in the browser with a version number and migrated automatically when the format changes. It can be exported and imported as JSON, and exported as Markdown. The look is a design dossier: a corkboard of index cards that is readable, keyboard-friendly and has light and dark modes. It is deployed to GitHub Pages, so you just open a link.

## 3. Repository structure

```
README.md
docs/
  proposal.md                  this page
  samples.md                   the 3 units, 3 patterns and example card (generated)
  vocabularies.md              every word list (generated)
  fields.md                    every field (generated)
  examples/
    concept-card.example.json
  research/                    later: coverage report, top-30, checker reports, vocabulary gaps
data/
  games.json                   games registry
  vocab/<list>.json            37 word lists
  units/<game>.json            source units, one file per game
  patterns/<pattern-id>.json   one mechanic pattern per file
schemas/
  common, vocabulary, game, source-unit, pattern, concept-card, board (.schema.json)

Added in later steps:
scripts/                       validate, build-docs, coverage, sample-for-check, copy-check
research/<batch>/              proposed patterns, notes on poor fits, checker logs (page cache is git-ignored)
src/core/                      the generator: pure TypeScript, no browser code
src/app/                       the web app
tests/
.github/workflows/             CI (validate, test, docs in sync) and GitHub Pages
index.html, package.json, tsconfig.json, vite.config.ts
```

## 4. How the data fits together

```mermaid
flowchart LR
  G[games.json<br/>factions, tiers, prices] --> U[units/&lt;game&gt;.json<br/>researched units]
  U -- weapons and abilities link --> P[patterns/&lt;id&gt;.json<br/>mechanic patterns<br/>+ player translation]
  V[vocab/*.json<br/>37 word lists] -. every coded field .-> U
  V -. every coded field .-> P
  P --> GEN[generator<br/>Phase 2]
  V --> GEN
  GEN --> C[concept card]
  C --> B[board<br/>Phase 3]
```

- A **source unit** is one real unit, coded with word-list terms. Its weapons and abilities link to patterns. Its strengths, weaknesses and counters are **typed links** such as `class:aircraft` or `size:<=small`, so the generator can reason about matchups instead of only reading prose.
- A **pattern** is a reusable mechanic, abstracted from one or more units. It records what it does and its counterplay, sourced examples from other games, the player translation, team-play potential, build difficulty, balance and readability risks, variants, and rules for the generator.
- A **concept card** is a generated unit. It stores its seed and every part id, so it can be rebuilt exactly.

## 5. Fields

The full list, with types and meanings, is in [fields.md](fields.md). In short:

- **Source unit:**
  - **Identity:** id, game, faction, name, lineage (the same design across games).
  - **Classification:** class, nature (organic, crewed machine, uncrewed machine), availability (open, limited, unique), roles, tier and cost band (with the source's gate and price).
  - **Movement and body:** mobility (base, handling, traits, speed), body (plan, size, count).
  - **Combat:** armour (class plus up to three models), armament (each weapon's slot, seat, family, damage, mount, delivery, range, targets and traits), crew (model, seats, solo fallback, passengers), abilities (kind, cooldown, where it comes from), modes for transforming units, resources, what happens on death.
  - **Matchups:** strengths, weaknesses, counters, countered-by and combos.
  - **Notes and checking:** why it's memorable, how it plays as a player, 1-3 sources (with the fields each one backs), confidence, specific uncertain points, notes where no term fitted, and the checker's review.
- **Pattern:**
  - **Identity:** id, status (proposed, accepted, merged, rejected), name, aliases, in-game names, category.
  - **Substance:** summary, counterplay, source units, other sourced examples, shooter analogues.
  - **Translation:** user, target, teammates, controls, readability cues, and what changes from the RTS.
  - **Ratings and generator data:** team play, build difficulty, balance and readability risks, variants, generator rules, related patterns, open design questions, shooter-fit score, confidence and review.
- **Concept card:**
  - **Reproduction:** seed, spice, inputs, locks.
  - **Parts:** class, tier, flavour, nature, availability, roles, mobility, body, armament (primary, secondary and conditional weapons), armour, crew, signature ability, extra abilities, second form, resource, on death.
  - **Matchups:** strengths paired with weaknesses, counters, countered-by, counterplay.
  - **Text:** working name, pitch, signature name and effect, team-play hook, how it plays (user, target, teammates, controls, tells).
  - **Inspiration and balance:** inspiration, balance hints.
- **Board card:** the card, plus column, position, notes, tags, stars, origin, parent, and the fields you edited by hand (a reroll never touches those).

Fields marked *proposal* (such as handling, aim, seats for RTS units, on-death and "as a player") are our design suggestions for a player version. They are kept apart from sourced facts, and the checker skips them.

## 6. Vocabularies

All 37 lists are in [vocabularies.md](vocabularies.md). The ten the brief asks for:

| List | Terms | Examples |
|---|---|---|
| Classes | 7 | Infantry, tank / ground vehicle, walker / mech, hovercraft, aircraft, drone / support; naval (research only) |
| Tier bands | 3 | T1, T2, T3, each with a key budget |
| Faction flavours | 3 | Soviets, Allies, Empire, each with themes, favoured parts and a naming style |
| Roles | 16 | Assault, anti-armour, anti-air, siege, marksman, scout, support, transport, infiltrator, disabler, raider, area denial, buffer, engineer, logistics... |
| Mobility types | 12 | Foot, jetpack, wheels, tracks, two legs, many legs, hover, hovering flight, jet, airship... |
| Body plans | 18 | Humanoid, power suit, creature, hull with turret, fixed-gun hull, open mount, troop carrier, launcher rack, mechs, aircraft frames... |
| Weapon families | 32 | From small arms and cannons to tesla, prism, cryo, sonic, nanites, psionic, repair tools and "adaptive" (taken from a passenger or a kill); torpedoes and "unarmed" are research only |
| Damage types | 13 | Kinetic, armour-piercing, explosive, fire, electric, energy, cryo, sonic, toxic, EMP, melee, psionic, repair |
| Armour classes | 5 | Unarmoured, light, medium, heavy, super-heavy |
| Crew models | 5 | Solo, driver + gunner, driver + gunner + commander, squad, remote operator (passenger seats are counted separately) |

The 27 supporting lists make the core ones usable. They cover aim and mount, weapon delivery, range, weapon traits, handling, speed, size, armour models (each with examples from the reference games), nature, seat roles, the solo fallback, ability kinds and their sources, cooldowns, resources, on-death outcomes, availability, cost bands, pattern categories, team-play hooks, balance flags, rarity, confidence, ratings and source kinds.

Each term can carry **combination rules**: which classes may use it, what it combines with, what it excludes, what it needs, and the lowest tier. These stop the generator rolling nonsense. Real units that break them are recorded as they are and listed as "atypical".

**Faction flavours, in RA3's spirit:**

- **Soviets:** heavy, brute force, electric weapons, magnetism, salvage, big walkers and airships.
- **Allies:** high-tech and precise; freezing and prism weapons, lock-ons, time tricks, shields and seats that work together.
- **Empire:** agile and transforming; blades, nano-tech, psionics and kamikaze drones.

## 7. The samples

All in [samples.md](samples.md).

| Sample | One line | What the research added |
|---|---|---|
| **Terror Drone** (Soviets, T1 drone) | A tiny robot that rides inside an enemy vehicle; you can't shoot it there, so the enemy has to cure the host. | Twelve documented ways to remove it, the one-drone-per-vehicle rule, chain jumps, and that the stasis ray pins a vehicle but leaves its guns working. |
| **Hammer Tank** (Soviets, T2 vehicle) | A battle tank that steals the gun of whatever dies in its leech beam. | It is T2, like every RA3 battle tank. The steal works whoever lands the kill (a built-in team combo), the slot is permanent, and leeching roots the tank. |
| **Multigunner IFV** (Allies, T1 vehicle) | A fast car whose roof weapon is set by the soldier riding in it. | 18 passenger results across all three factions, plus its turretless hull, the passenger dying with the car, and the dog and bear stun at T1. |
| **Infest a vehicle** (pattern) | Latch onto or into a vehicle and work on it until removed. | Shooter fit 5/5. Titanfall's rodeo, Halo boarding and Arc Raiders' Tick show the victim's side; the translation always gives the victim an escape. |
| **Leech the weapon of what you destroy** (pattern) | Turn enemy losses into your own weapons. | Shooter fit 4/5. Eleven variants, from upgrade ladders to whole-vehicle steals; the key risks are snowballing and teammates farming each other. |
| **A weapon that changes with the passenger** (pattern) | A vehicle whose gun is whoever rides in it. | Shooter fit 5/5. Fire ports, crewed hardpoints and human ammunition as variants; collapse RA3's 18 results into a few readable weapon families. |
| **Example card: Rime Burr** (hand-made) | An Allied T1 hover-drone that latches onto vehicles and paints them for the team. | Shows a pattern recombined into a new class and faction, within the T1 key budget. |

## 8. How this draft was made and checked

1. **Research.** Eight agents researched in parallel:
   - one per unit and one per pattern, citing every claim with sources and a confidence level;
   - two more checked the armour-model and crew-seat word lists against the reference games.
2. **Critique.** Four independent reviewers attacked the first draft of the fields and word lists:
   - a generator engineer;
   - a top-down shooter designer;
   - a research data-quality lead;
   - a stress test that encoded 16 real units from other games (StarCraft II Siege Tank, Mecha Tengu, Kirov, Mammoth Mk II, Overlord, Panther, a Foxhole tank, Supreme Commander's ACU, Sunderer, Magrider, Warthog, an Arc Raiders raider, Atlas, Dreadnought, a mobile SAM, an Iron Harvest hero mech).

   Their findings led to version 0.3. Its main changes:
   - aim is split into mount and delivery, and every weapon gets a range;
   - handling, nature and what happens on death are new fields;
   - the tier limit counts buttons rather than abilities;
   - seats own weapons, passengers are counted separately, and transforming units record a second form;
   - one pattern per file, with a status and merging;
   - games without tiers or prices are allowed;
   - per-source provenance, and tie-break rules for terms that are easy to confuse.
3. **Validation.** The data passes every check:
   - schemas, every term, every link between files and every combination rule;
   - the example card fits the T1 key budget;
   - a deliberately broken test card is caught on every rule it breaks: tracks on an aircraft, too many keys, a missing cooldown, an unpaired strength, a real unit name, and a working name copied from a real unit.
4. **Verification.** Separate fact-checkers re-opened the sources for every unit claim and a sample of the pattern examples; the results are in the pull request.

## 9. Risks

- **The word lists are big** (37 lists, 299 terms). Only the ten core lists need your eyes; the supporting lists are mostly scales and plumbing.
- **Sources can be thin or slow.** The C&C wiki rate-limits, and some recent games have little written about them. Mitigations: caching, throttling, video at low confidence, and recording "no tier or price" rather than inventing one.
- **Live games change.** Each game records the version or date researched.
- **Generator tuning** (rarity weights, cost points) can only be judged once there are about 100 units; the numbers in the draft are starting points.
- **Copyright.** Paraphrase-only is checked automatically, real names never reach generated cards, and no images are used.

## Decisions needed

Each one stands on its own. A reply like "1B 2A 3C 4B 5B 6A 7B 8B 9A" is enough.

1. **What counts toward a tier's ability limit?** The brief says tiers cap abilities.
   - **A.** Count abilities only: active abilities up to the tier number (T1 one, T2 two, T3 three), plus one passive.
   - **B.** Count buttons: everything on a key except primary fire and movement (secondary weapon, abilities, toggles, deploys, dash or leap). T1 gets 2 keys, T2 3 and T3 4, plus at most one passive, and no more than 3 keys per seat.

   **Recommendation: B.** It measures what the player actually has to juggle, and it stops a "simple" T1 from hiding five buttons in toggles and movement tricks. The draft uses B.
2. **Who controls a multi-seat vehicle when you are alone in it?**
   - **A.** The buyer drives and fires the main weapon; extra seats add a second gun, spotting or passenger effects (Battlefield and PlanetSide style).
   - **B.** The main gun needs a second player (Foxhole style).
   - **C.** Alone, you switch seats: drive or shoot, not both.

   **Recommendation: A** as the default, with B and C only as rare high-spice variants. In a buy-and-become game nobody should need a friend to use what they paid for.
3. **What happens when your unit dies?**
   - **A.** Always back to the buy screen.
   - **B.** Vehicle crews always bail out as weak infantry.
   - **C.** Decided per unit: respawn, bail out, wreck (repairable or salvageable), death blast or pilot eject.

   **Recommendation: C**, with bail-out as the default for crewed vehicles and respawn for infantry and drones. The draft uses C.
4. **How strict should combination rules be at high spice?**
   - **A.** Absolute: a flamethrower helicopter never appears.
   - **B.** Hard bans only for physical nonsense (tracks on aircraft); other cross-class parts just become rare and appear at high spice.

   **Recommendation: B.** It is what makes spice 5 produce real "rare cross-overs". It changes one field (allowed classes becomes a rarity per class) before the research run.
5. **Hard crowd control (stuns and freezes that stop the victim acting).**
   - **A.** Allowed anywhere.
   - **B.** Stuns only from T2, kept short and on a medium or longer cooldown, and every lockdown card must state the victim's escape.
   - **C.** No stuns at all; only roots, silences and slows.

   **Recommendation: B.** The infest and freeze fantasies need some lockdown, but the player on the receiving end must always have something to do. The draft uses B.
6. **Vision and air.** Does Shamble Frontlines hide enemies outside line of sight, and is there more than one air layer?
   - **A.** Line-of-sight fog of war, one air layer.
   - **B.** Everything on screen is visible, one air layer.
   - **C.** Fog of war and two air layers (low: helicopters, drones, jetpacks; high: jets and airships, hit only by anti-air).

   **Recommendation: A**, unless jets and airships are planned, in which case C. With fog, units get a small "sensors" field (sight range, radar, stealth, detection) before the research run; with B, spotting and scouting terms shrink.
7. **Heroes and squads.**
   - **A.** "Hero" stays a role, and every player is always one body.
   - **B.** Hero becomes an availability flag (open, limited, one per team) that any role can have, and "squad" (one player plus a few AI followers, or a pack of tiny drones) is a rare crew model from spice 3.

   **Recommendation: B.** A commando card still says what it does, team caps become explicit, and squad-based sources (Company of Heroes, Dawn of War) translate honestly. The draft uses B.
8. **How big should the research run be?**
   - **A.** Lean: about 150 units and 60 patterns, 3 pull requests, the fastest route to the generator.
   - **B.** Standard: about 250 units and 80-100 patterns, 6 pull requests.
   - **C.** Deep: about 400 units and over 120 patterns, 8 or more pull requests.

   **Recommendation: B.** It covers every game in the brief with enough examples per pattern, without a long wait for the generator.
9. **Repository name.**
   - **A.** Keep `MoesTools-Brainstormer` and call the product Unit Forge inside it.
   - **B.** Rename the repository to `unit-forge` now. GitHub redirects old links, and the Pages link would change.

   **Recommendation: A.** No work and nothing breaks; renaming stays cheap until the app is published.

**Defaults I picked (tell me if any are wrong):**

- **Classes:**
  - "Tank" is widened to "tank / ground vehicle" so IFVs and buggies fit.
  - Ships are recorded for research only and never generated.
  - "Drone / support" means small uncrewed machines; support is a role, so a repair truck is a vehicle with the support role.
- **Research coding:**
  - Tiers come from tech gating only.
  - Logistics units (harvesters, supply trucks) are recorded sparingly, under a logistics role.
  - Loadout options and in-match upgrades are recorded during research; whether the generator rolls them is decided later.
  - Battlefield, MechWarrior/BattleTech and Wargame are researched as series (archetypes); Company of Heroes 1-3 title by title.
- **Player-version proposals:**
  - The passenger aims a passenger-set weapon.
  - Stolen weapons are scaled to the thief's tier.
  - Infestation always comes with a self-cleanse for the victim.
- **Other:** no AI-written text in version 1 (the brief lists it as later).

## For Mustafa

1. Read the TL;DR and the [decisions](#decisions-needed), and reply with your choices. A list like "1B 2A 3C..." is enough.
2. Skim [samples.md](samples.md), especially the three "translation to a player-controlled unit" sections. Do they feel like Shamble Frontlines?
3. Skim the core lists in [vocabularies.md](vocabularies.md) (classes, roles, flavours, mobility, bodies, weapon families) for anything wrong for your game.
4. Approve this pull request, or say what to change. Nothing else is needed from you: no accounts, keys or installs.
