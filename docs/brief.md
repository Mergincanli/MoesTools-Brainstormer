# Unit Forge: brief for Claude Code

## 0. Who it's for, and why
You're building **Unit Forge**, a creativity tool for the game designer Mustafa. It turns a researched database of real
RTS and shooter unit designs into **randomly combined, original unit concepts**. He can save them on a board, refine
them, and later export them to his game. It's a digital *morphological box*: break units into building blocks, then
recombine them to spark ideas.

**The game it serves: SHAMBLE FRONTLINES.**
- A browser team shooter with a top-down camera.
- Three factions inspired by Red Alert 3: Soviets, Allies and the Empire of the Rising Sun.
- Each player buys and **becomes** a unit: infantry, vehicles, mechs.
- Units come in tiers (T1–T3), and each faction has its own identity.
- Depth comes from combos and counters, like RA3's Hammer Tank leeching the weapon of what it kills.
- Design references: Red Alert 3, the Command & Conquer series (including Kane's Wrath and Renegade), Tempest Rising,
  Iron Harvest, Broken Arrow, Foxhole, WARDOGS, Arc Raiders, Planetary Annihilation.

**The key difference from an RTS:** there, you *command* units; here, a player *is* the unit. Every mechanic must be
translated into "how does this play when one player controls it?". Take RA3's Terror Drone: as a player you'd be a tiny,
fast, fragile drone that latches onto an enemy vehicle and damages it from inside, or disables it with an electric
beam, while the vehicle's crew has to react. **This translation is the heart of the tool.**

## 1. The product
- **Generator:**
  - Pick a unit class (infantry, tank, walker/mech, hovercraft, aircraft, drone/support) plus a tier, a faction
    flavour and, optionally, a role. Roll, and you get a unit concept card built from combinable parts.
  - Lock any part you like and reroll the rest.
  - A "spice" control runs from grounded to wild.
  - Every roll has a seed, so it can be recreated and shared.
- **Concept card:**
  - working name, a one-line pitch;
  - class, tier, faction and role;
  - mobility, body, armament (primary and secondary), armour model;
  - **crew model:** solo, driver + gunner, driver + gunner + commander, or a transport with passengers;
  - signature ability;
  - weakness, what counters it, and what it counters;
  - **team-play hook**, and **how it plays as a player**;
  - inspiration: the patterns and source units it draws from.
- **Library:** browse the researched database, both the source units (by game and faction) and the mechanic patterns.
  Filter by class, role, tier and mechanic.
- **Board:**
  - Save cards into the columns Ideas, Promising, Shortlist and Rejected.
  - Add notes, tags and a star rating.
  - Compare 2–3 cards side by side.
  - Duplicate and hand-edit a card.
- **Remix:** pick 2–3 source units or patterns and blend them into one concept.
- **Export:** cards and the board to Markdown (for design docs) and JSON (for a later import into the game).

## 2. Phase 1: the research
**Goal:** a curated, cited database. Not every unit ever made, but the ones that teach something.

**Starting scope** (add games when they teach a new mechanic, and list what you added and why):
- Red Alert 1–3 (with Uprising)
- C&C: Tiberian Dawn, Tiberian Sun, Generals (with Zero Hour), Tiberium Wars, Kane's Wrath, Renegade
- Tempest Rising, Iron Harvest
- Company of Heroes 1–3
- Supreme Commander, Planetary Annihilation
- StarCraft II, Halo Wars 2, Dawn of War 1–2
- World in Conflict, Wargame, Broken Arrow
- Battlefield (vehicle archetypes), PlanetSide 2 (faction vehicles)
- Foxhole, WARDOGS, Arc Raiders (its armour and shield model)
- MechWarrior / BattleTech (mech archetypes)

**For each source unit, record:**
- game, faction, name, class, role, tier or tech level, and a relative cost band;
- mobility, armour class, armament, crew model;
- special abilities, each linked to a pattern;
- strengths, weaknesses, counters, and notable combos;
- why it's memorable, in one line;
- 1–3 source URLs, and a confidence level (high, medium or low).

**The most important output: mechanic patterns.** These are reusable building blocks abstracted from the units.
Examples:
- infest a vehicle;
- disable with an electric or EMP effect;
- leech the weapon of what you destroy;
- a weapon that changes with the passenger;
- deploy or siege mode;
- transform (walker ↔ jet);
- disguise;
- garrison or transport;
- a shield that absorbs damage.

**For each pattern, record:**
- what it does, and its counterplay;
- which source units use it;
- **its translation to a player-controlled unit;**
- its team-play potential;
- how hard it is to build (low, medium or high);
- balance and readability risks.

**Shared vocabularies.** Fixed word lists for classes, mobility types, bodies, weapon families, damage types, armour
classes, crew models, roles, tier bands and faction flavours. Describe the factions generically, in RA3's spirit:
- **Soviets:** heavy, brute force, electric weapons.
- **Allies:** high-tech, precise, freezing and prism weapons.
- **Empire:** agile, transforming, blades and nano-tech.

**Rules:**
- Paraphrase everything; never copy text, and no images.
- Real unit names are reference only. **Generated concepts must be original**, with no trademarked names.
- Mechanics over numbers: record roles, relationships and mechanics. Use exact stats only when well sourced, and then
  only as relative bands.
- Cite your sources and mark confidence. Prefer official sources and established wikis.

**Method:**
- Parallel research agents, one per franchise.
- A separate checker samples entries against their sources.
- A validation script enforces the JSON schemas.

**Deliverables:**
- the data files and their JSON schemas;
- a coverage report (games × classes, and the number of patterns);
- the **top 30 patterns for a player-controlled shooter**, with a reason for each.

## 3. Phase 2: the generator
- Built from the vocabularies and patterns. Rules block nonsense combinations:
  - aircraft don't get tracks;
  - tiers cap the number of abilities;
  - every strength needs a weakness;
  - every concept has at least one counter.
- **Spice** widens the choices from common combinations to rare cross-overs.
- **Seeded random:** every card stores its seed and part IDs, so it regenerates exactly.
- **Lock and reroll** per field.
- **Balance hints:**
  - a relative cost band derived from the parts;
  - a power and complexity score;
  - warning flags, like "no counter" or "too many abilities for T1".
- A pure TypeScript module with full tests: seeds reproduce exactly, and 10,000 random rolls produce zero invalid
  combinations.

## 4. Phase 3: the app
- A static web app in TypeScript + Vite, with no backend. Data loads from the JSON files in the repository.
- **Saving:** the board saves in the browser, with a version number, and supports JSON import/export plus Markdown
  export. Nothing is lost on refresh.
- **Look:** a design dossier, a corkboard of index cards. Readable, keyboard-friendly, light and dark mode.
- Deployed as a static site (for example, GitHub Pages), so Mustafa just opens a link.
- Fast: rolls are instant.

## 5. Later (not now)
- Export into Shamble Frontlines' unit data format, once the game's v2 rebuild defines it.
- Optional AI-written descriptions for a card.
- Simple silhouettes or sketches per card.

## 6. Working rules
- This is its own GitHub repository (for example, `unit-forge`), not the Shamble Frontlines repository.
- Plan first. Mustafa approves the plan and the vocabularies before the big research run.
- Small pull requests, with tests and schema validation in CI.
- Reports in plain words. Start with the TL;DR; end with "Decisions needed" (each one self-contained, with options and
  your recommendation) and "For Mustafa" (his actions, or "nothing").
- Copyright: paraphrase, cite, no images, original names in generated concepts.

## 7. First step
Propose:
- the plan and the repository structure;
- the full list of fields and vocabularies;
- **three source units and three patterns, fully filled in:** RA3's Terror Drone, Hammer Tank and Allied IFV.

Then stop for Mustafa's approval. After that: the research run, then the generator, then the app.
