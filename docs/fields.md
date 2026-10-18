<!-- Generated from the JSON in data/ and schemas/. Edit the JSON, not this file. -->

# Field reference (draft v0.3)

Every field of every record type, generated from the JSON schemas in `schemas/`. **Vocabulary** names the fixed word list a field draws from (see [vocabularies](vocabularies.md)).

## Conventions

- **Ids.** Lower-case, ASCII, words joined by dashes; apostrophes and full stops dropped, `&` becomes `and`, numbers and roman numerals kept (`mammoth-mk-ii`, `v4-rocket-launcher`). Unit ids are `<game>.<faction>.<slug>`; pattern ids are generic English, verb first (`infest-vehicle`). Expansions are never game ids. The faction id `shared` is reserved for units every side can field.
- **Typed links** are written `kind:id`, such as `role:anti-air`, `size:<=small` or `hits:aircraft`. A link always describes a unit: in strengths, weaknesses and pattern requirements it describes the unit itself; in *counters* the unit it beats; in *countered by* the unit that beats it; in combos the teammate. Ranked kinds accept `<=` and `>=`. Kinds: `class` (is of this class), `role` (has this role (primary or secondary)), `tier` (is this tier), `damage` (has a weapon that deals this damage), `armour-class` (has this armour class), `armour-model` (has this armour model), `weapon` (has a weapon of this family), `mobility` (moves this way), `mobility-trait` (has this mobility trait), `handling` (handles this way), `body` (has this body plan), `size` (is this size), `speed` (moves at this speed), `crew` (has this crew model), `passengers` (has this many passenger seats (a number, usually with >= or <=)), `mount` (has a weapon on this mount), `delivery` (has a weapon with this delivery), `range` (has a weapon with this range), `weapon-trait` (has a weapon with this trait), `target` (is this kind of target (from its mobility and size)), `hits` (has a weapon that can hit this kind of target), `nature` (is organic, a crewed machine or an uncrewed machine), `category` (has an ability whose pattern is in this category), `resource` (uses this resource), `pattern` (has this mechanic pattern (an id in data/patterns)), `unit` (is this source unit (research data only; never on a generated card)).
- **Proposals vs facts.** Fields marked *proposal* (aim and seat per weapon, handling, crew for RTS units, what happens on death, 'as a player') are our design suggestions for a player version. The checker skips them and confidence covers only sourced facts.
- **Weapons vs abilities.** Anything fired with an attack button is a weapon. An ability exists only when the source has a separate button, cooldown, toggle, or a triggered or passive effect. A weapon swapped in by an ability gets both: an `alternate` weapon and a `toggle` ability, linking the same pattern. A weapon gained on a kill gets an `acquired` weapon and a `triggered` ability. Unarmed units have an empty weapon list.
- **Granularity.** Same player-facing interaction and same counterplay = one pattern; differences in fiction, delivery or size are variants. Plain mechanics (sprint, self-heal, stat buff) get generic patterns that stay out of the top-30 list.
- **Copyright.** Paraphrase only, no quoted voice lines or flavour text, no images. Real names are reference only and never reach a generated card.

## Source unit

One researched unit from a real game. File: `data/units/<game>.json`. Schema: `schemas/source-unit.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `id` | unit id | yes |  | Source unit id: <game>.<faction>.<slug>, e.g. 'ra3.soviet.terror-drone'. |
| `game` | id | yes |  | Game id; must match the file. |
| `introduced_in` | id |  |  | Game or expansion id where this version first appears, if not the base game. |
| `faction` | id | yes |  | Faction id from the game's entry in data/games.json. |
| `name` | text | yes |  | In-game name, for reference only. |
| `flavour_affinity` | list of terms (max 3) |  | `faction-flavours` | *Proposal, not a sourced fact.* Which of our faction flavours this design fits, if any. |
| `class` | term | yes | `classes` | A term from *Unit classes*. |
| `nature` | term | yes | `nature` | A term from *Nature*. |
| `availability` | term | yes | `availability` | How many a side may field: open, limited or unique (heroes). |
| `roles` | group | yes |  |  |
| `roles.primary` | term | yes | `roles` | A term from *Roles*. |
| `roles.secondary` | list of terms (max 2) |  | `roles` | Terms from *Roles*. |
| `tier` | group | yes |  |  |
| `tier.band` | term or empty | yes | `tiers` | Null only when the game has no tech tiers. |
| `tier.gate` | text |  |  | The tech gate from the game's tier_map, e.g. 'Super Reactor'. |
| `tier.basis` | text | yes |  | Why this band, in plain words. |
| `cost_band` | group | yes |  |  |
| `cost_band.band` | term or empty | yes | `cost-bands` | Null only when units are not bought in the game. |
| `cost_band.raw` | number |  |  | The price in the game's currency. Stored only so the band can be recomputed; the generator and app never show or use it. |
| `cost_band.basis` | text | yes |  |  |
| `mobility` | group | yes |  |  |
| `mobility.base` | term | yes | `mobility` | A term from *Mobility types*. |
| `mobility.handling` | term | yes | `handling` | *Proposal, not a sourced fact.* Our proposal for how a player version would handle. |
| `mobility.traits` | list of terms (max 3) |  | `mobility-traits` | Terms from *Mobility traits*. |
| `mobility.speed` | term | yes | `speed-bands` | Relative to the game's basic infantry. |
| `mobility.notes` | text |  |  |  |
| `mobility.speed_raw` | number |  |  | Speed as a ratio to the game's speed reference, when a stat table gives it. Stored only so the band can be recomputed. |
| `body` | group | yes |  |  |
| `body.plan` | term | yes | `bodies` | A term from *Body plans*. |
| `body.size` | term | yes | `sizes` | A term from *Sizes*. |
| `body.count` | integer |  |  | Bodies per purchase in the source, e.g. 5 for a squad. Default 1. |
| `body.notes` | text |  |  |  |
| `armour` | group | yes |  |  |
| `armour.class` | term | yes | `armour-classes` | A term from *Armour classes*. |
| `armour.models` | list of terms (min 1, max 3) | yes | `armour-models` | Terms from *Armour models*. |
| `armour.notes` | text |  |  |  |
| `armament[]` | list of groups | yes |  | Weapons, in slot order. Empty for unarmed units. |
| `armament[].name` | text | yes |  | In-game weapon name, for reference only. |
| `armament[].slot` | one of `primary`, `secondary`, `alternate`, `passenger`, `acquired`, `option` | yes |  | primary / secondary; alternate = switched to by an ability or mode; passenger = depends on who rides inside (one entry per distinct result); acquired = gained during play, e.g. salvaged from a kill; option = one of several loadout choices (see option_group). |
| `armament[].seat` | term |  | `seat-roles` | *Proposal, not a sourced fact.* Which seat fires it in a player version. Default: driver. |
| `armament[].family` | term | yes | `weapon-families` | A term from *Weapon families*. |
| `armament[].damage` | term | unless family is adaptive | `damage-types` | A term from *Damage types*. |
| `armament[].mount` | term | unless family is adaptive | `aim-models` | *Proposal, not a sourced fact.* Our proposed mount for a player version. |
| `armament[].delivery` | term | unless family is adaptive | `weapon-delivery` | A term from *Weapon delivery*. |
| `armament[].range` | term | unless family is adaptive | `range-bands` | Relative to the source's other weapons. |
| `armament[].can_target` | list of terms | unless family is adaptive | `target-types` | Terms from *Target types*. |
| `armament[].affects` | one of `enemies`, `allies`, `both` |  |  | Default: enemies. Repair and buff tools affect allies. |
| `armament[].traits` | list of terms (max 4) |  | `weapon-traits` | Terms from *Weapon traits*. |
| `armament[].summary` | text | yes |  | What it does, in plain words. |
| `armament[].when` | typed link |  |  | For passenger, alternate or acquired weapons: a typed link saying when it applies, e.g. the passenger's unit id (unit:...) or role (role:engineer). |
| `armament[].condition` | text |  |  | The same condition in plain words. |
| `armament[].patterns` | list of ids |  |  | Pattern ids (from data/pattern-registry.json) this weapon is an example of. |
| `armament[].mode` | id |  |  | Mode id from the unit's modes, if the weapon only works in that mode. |
| `armament[].option_group` | id |  |  | For option weapons: options in the same group exclude each other. |
| `armament[].default` | boolean |  |  | For option weapons: the one fitted by default. |
| `crew` | group | yes |  |  |
| `crew.model` | term | yes | `crew-models` | Who operates the unit. |
| `crew.basis` | one of `in-game`, `lore`, `proposal` | yes |  | in-game = the source has these seats; lore = the source describes a crew; proposal = our suggestion for a player version. |
| `crew.solo_fallback` | term |  | `solo-fallback` | For multi-seat models: what a lone player can do. |
| `crew.passengers` | group |  |  | Passenger seats, if any. Any crew model can carry passengers; the card then shows 'transport with passengers'. |
| `crew.passengers.seats` | integer | yes |  |  |
| `crew.passengers.kind` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `crew.notes` | text |  |  |  |
| `crew.seats[]` | list of groups |  |  | Exact seat layout when the preset doesn't say it all (e.g. one driver and two gunners). |
| `crew.seats[].role` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `crew.seats[].count` | integer | yes |  |  |
| `abilities[]` | list of groups | yes |  |  |
| `abilities[].name` | text | yes |  | In-game ability name, for reference only. |
| `abilities[].kind` | term | yes | `ability-kinds` | A term from *Ability kinds*. |
| `abilities[].seat` | term |  | `seat-roles` | *Proposal, not a sourced fact.* Which seat triggers it in a player version. Default: driver. |
| `abilities[].cooldown` | term |  | `cooldown-bands` | How often it can be used, if the source says or it is clear. |
| `abilities[].summary` | text | yes |  |  |
| `abilities[].patterns` | list of ids (min 1) | yes |  | Every ability links to at least one mechanic pattern. |
| `abilities[].source` | term |  | `ability-sources` | Where the ability comes from. Default: innate. |
| `abilities[].exclusive_group` | id |  |  | Abilities in the same group exclude each other (loadout or upgrade choices). |
| `modes[]` | list of groups (max 3) |  |  | Second forms: transform, deploy or siege modes. |
| `modes[].id` | id | yes |  | Lower-case id with dashes, e.g. 'infest-vehicle'. |
| `modes[].name` | text | yes |  |  |
| `modes[].via` | id | yes |  | The pattern that switches to this mode. |
| `modes[].class` | term |  | `classes` | A term from *Unit classes*. |
| `modes[].mobility` | group |  |  |  |
| `modes[].mobility.base` | term | yes | `mobility` | A term from *Mobility types*. |
| `modes[].mobility.handling` | term |  | `handling` | A term from *Handling*. |
| `modes[].mobility.speed` | term |  | `speed-bands` | A term from *Speed bands*. |
| `modes[].summary` | text | yes |  | What changes in this mode. |
| `modes[].body` | group |  |  |  |
| `modes[].body.plan` | term | yes | `bodies` | A term from *Body plans*. |
| `modes[].body.size` | term |  | `sizes` | A term from *Sizes*. |
| `modes[].armour` | group |  |  |  |
| `modes[].armour.class` | term | yes | `armour-classes` | A term from *Armour classes*. |
| `modes[].armour.models` | list of terms (max 3) |  | `armour-models` | Terms from *Armour models*. |
| `resources` | list of terms (max 2) |  | `resources` | Terms from *Resources*. |
| `on_death` | group | yes |  |  |
| `on_death.outcomes` | list of terms (min 1, max 2) | yes | `on-death` | Terms from *On death*. |
| `on_death.basis` | one of `in-game`, `proposal` | yes |  |  |
| `strengths` | list of link + reasons (min 1) | yes |  | What this unit is good at; links describe the unit itself. |
| `weaknesses` | list of link + reasons (min 1) | yes |  | Where it falls short; links describe the unit itself. |
| `countered_by` | list of link + reasons (min 1) | yes |  | What beats it; links describe the enemy. |
| `counters` | list of link + reasons (min 1) | yes |  | What it beats; links describe the enemy. |
| `combos` | list of link + reasons | yes |  | Notable combinations; links describe the teammate or the setup. Required, so 'none known' is an explicit empty list. |
| `memorable` | text | yes |  | One line: why this unit is memorable. |
| `as_player` | text | yes |  | *Proposal, not a sourced fact.* Two or three lines: how it would play if one player controlled it. |
| `sources[]` | list of groups (min 1, max 3) | yes |  | A citation. Paraphrase only; never copy text or images. |
| `sources[].url` | URL | yes |  | The page actually read (https only; never an image). |
| `sources[].title` | text | yes |  | Page title and site. |
| `sources[].kind` | term | yes | `source-kinds` | A term from *Source kinds*. |
| `sources[].accessed` | text | yes |  | Date the page was read. |
| `sources[].note` | text |  |  |  |
| `sources[].supports` | list of texts |  |  | Which fields this source backs, as paths such as 'tier', 'cost_band' or 'abilities/0'. |
| `sources[].version` | text |  |  | Patch, edition or remaster the page describes, for games that change. |
| `confidence` | term | yes | `confidence` | A term from *Confidence levels*. |
| `uncertain[]` | list of groups |  |  | A specific point that is less certain than the overall confidence, or where sources disagree. |
| `uncertain[].path` | text | yes |  |  |
| `uncertain[].note` | text | yes |  |  |
| `uncertain[].sources_disagree` | boolean |  |  |  |
| `review` | group | yes |  | Checker status. The research run samples entries and re-checks them against their sources. |
| `review.status` | one of `unchecked`, `checked`, `disputed` | yes |  |  |
| `review.checked_by` | text |  |  |  |
| `review.checked_on` | text |  |  |  |
| `review.checked_paths` | list of texts |  |  |  |
| `review.wrong_paths` | list of texts |  |  |  |
| `review.notes` | text |  |  |  |
| `researched_by` | text | yes |  | Research bucket or agent that wrote the entry. |
| `lineage` | id |  |  | Shared id for the same design across games, e.g. 'terror-drone' for the RA2 and RA3 versions. |
| `variant_of` | unit id |  |  | For subfaction or general-specific versions: the base unit id. |
| `fit_notes[]` | list of groups |  |  | Where no vocabulary term fitted well. Collected into a vocabulary-gaps report that feeds the next vocabulary version. |
| `fit_notes[].path` | text | yes |  |  |
| `fit_notes[].used` | text | yes |  |  |
| `fit_notes[].wanted` | text |  |  |  |
| `fit_notes[].note` | text | yes |  |  |
| `atypical[]` | list of groups |  |  | Combination rules this real unit breaks. Found by the validator and recorded here; never blocks a source unit, and useful evidence for relaxing a rule. |
| `atypical[].path` | text | yes |  |  |
| `atypical[].rule` | text | yes |  |  |
| `atypical[].note` | text | yes |  |  |

## Mechanic pattern

A reusable building block abstracted from units. File: `data/patterns/<pattern-id>.json`, one per pattern. Schema: `schemas/pattern.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `schema_version` | text | yes |  |  |
| `vocab_version` | text | yes |  |  |
| `id` | id | yes |  | Generic English, verb first: <verb>-<object>[-<qualifier>], e.g. 'infest-vehicle'. No fiction words. |
| `status` | one of `proposed`, `accepted`, `merged`, `rejected` | yes |  | proposed = written, not yet reviewed and calibrated; accepted = reviewed and calibrated in the merge pass; merged = folded into another pattern; rejected. |
| `merged_into` | id |  |  | Required when status is merged. |
| `name` | text | yes |  | Our own generic name, never a trademark. |
| `aliases` | list of texts |  |  | Generic synonyms and old ids merged into this one (the resolver accepts them). |
| `source_terms` | list of texts |  |  | In-game names for this mechanic, reference only; never shown by the generator. |
| `category` | term | yes | `pattern-categories` | A term from *Pattern categories*. |
| `also_in` | list of terms (max 2) |  | `pattern-categories` | Up to two more categories for filtering. |
| `generic` | boolean |  |  | True for plain mechanics (sprint, self-heal, stat buff) kept so every ability can link a pattern; excluded from the top-30 list. |
| `summary` | text | yes |  | What it does, in plain words. |
| `counterplay` | list of texts (min 1) | yes |  | How the enemy deals with it. |
| `source_units` | list of unit ids (min 1) | yes |  | Unit ids that use this pattern. Must match the units that link it (the validator checks; a build step will compute it). |
| `other_examples[]` | list of groups |  |  | Further uses found during research that are not (yet) entered as source units. |
| `other_examples[].game` | text | yes |  | Game id from the registry, or 'extra:<title>' for a game outside it. |
| `other_examples[].unit` | text | yes |  | Unit, ability or mechanic name (reference only). |
| `other_examples[].note` | text | yes |  | How it works there, paraphrased. |
| `other_examples[].sources[]` | list of groups (min 1, max 3) | yes |  | A citation. Paraphrase only; never copy text or images. |
| `other_examples[].sources[].url` | URL | yes |  | The page actually read (https only; never an image). |
| `other_examples[].sources[].title` | text | yes |  | Page title and site. |
| `other_examples[].sources[].kind` | term | yes | `source-kinds` | A term from *Source kinds*. |
| `other_examples[].sources[].accessed` | text | yes |  | Date the page was read. |
| `other_examples[].sources[].note` | text |  |  |  |
| `other_examples[].sources[].supports` | list of texts |  |  | Which fields this source backs, as paths such as 'tier', 'cost_band' or 'abilities/0'. |
| `other_examples[].sources[].version` | text |  |  | Patch, edition or remaster the page describes, for games that change. |
| `other_examples[].confidence` | term | yes | `confidence` | A term from *Confidence levels*. |
| `other_examples[].unit_id` | unit id |  |  | Unit id, once the unit is in the database. |
| `other_examples[].franchise` | text |  |  | Franchise name, for counting how many franchises use a pattern. |
| `shooter_analogues[]` | list of groups |  |  | Where players already do this in shooters or action games. |
| `shooter_analogues[].game` | text | yes |  | Game id from the registry, or 'extra:<title>' for a game outside it. |
| `shooter_analogues[].unit` | text | yes |  | Unit, ability or mechanic name (reference only). |
| `shooter_analogues[].note` | text | yes |  | How it works there, paraphrased. |
| `shooter_analogues[].sources[]` | list of groups (min 1, max 3) | yes |  | A citation. Paraphrase only; never copy text or images. |
| `shooter_analogues[].sources[].url` | URL | yes |  | The page actually read (https only; never an image). |
| `shooter_analogues[].sources[].title` | text | yes |  | Page title and site. |
| `shooter_analogues[].sources[].kind` | term | yes | `source-kinds` | A term from *Source kinds*. |
| `shooter_analogues[].sources[].accessed` | text | yes |  | Date the page was read. |
| `shooter_analogues[].sources[].note` | text |  |  |  |
| `shooter_analogues[].sources[].supports` | list of texts |  |  | Which fields this source backs, as paths such as 'tier', 'cost_band' or 'abilities/0'. |
| `shooter_analogues[].sources[].version` | text |  |  | Patch, edition or remaster the page describes, for games that change. |
| `shooter_analogues[].confidence` | term | yes | `confidence` | A term from *Confidence levels*. |
| `shooter_analogues[].unit_id` | unit id |  |  | Unit id, once the unit is in the database. |
| `shooter_analogues[].franchise` | text |  |  | Franchise name, for counting how many franchises use a pattern. |
| `player_translation` | group | yes |  | The heart of the tool: how the pattern plays when one player controls the unit. |
| `player_translation.summary` | text | yes |  |  |
| `player_translation.as_user` | list of texts (min 1) | yes |  | What the player using it does and feels. |
| `player_translation.as_target` | list of texts (min 1) | yes |  | What the player on the receiving end sees, and what they can do about it right now. |
| `player_translation.teammates` | list of texts (min 1) | yes |  | How teammates on both sides get involved. |
| `player_translation.controls` | list of texts (min 1) | yes |  | A proposed input mapping. |
| `player_translation.feedback` | list of texts (min 1) | yes |  | Sound, visual and UI cues that keep it readable from a top-down camera. |
| `player_translation.changes_from_rts` | list of texts (min 1) | yes |  | What has to change compared with the RTS original, and why. |
| `team_play` | group | yes |  |  |
| `team_play.potential` | term | yes | `ratings` | A term from *Ratings*. |
| `team_play.hooks` | list of terms (min 1) | yes | `team-play-hooks` | Terms from *Team-play hooks*. |
| `team_play.notes` | text | yes |  |  |
| `build_difficulty` | group | yes |  |  |
| `build_difficulty.level` | term | yes | `ratings` | A term from *Ratings*. |
| `build_difficulty.notes` | list of texts (min 1) | yes |  |  |
| `risks` | group | yes |  |  |
| `risks.balance` | group | yes |  |  |
| `risks.balance.level` | term | yes | `ratings` | A term from *Ratings*. |
| `risks.balance.notes` | list of texts (min 1) | yes |  |  |
| `risks.readability` | group | yes |  |  |
| `risks.readability.level` | term | yes | `ratings` | A term from *Ratings*. |
| `risks.readability.notes` | list of texts (min 1) | yes |  |  |
| `variants[]` | list of groups (min 1) | yes |  | Distinct twists the generator can roll. Higher min_spice = wilder. |
| `variants[].id` | id | yes |  | Lower-case id with dashes, e.g. 'infest-vehicle'. |
| `variants[].name` | text | yes |  |  |
| `variants[].summary` | text | yes |  |  |
| `variants[].min_spice` | integer | yes |  |  |
| `variants[].seen_in` | text |  |  | Where this twist comes from (game or unit names, reference only). |
| `variants[].overrides` | group |  |  | Generator rules that differ for this variant. |
| `variants[].overrides.classes` | list of terms |  | `classes` | Terms from *Unit classes*. |
| `variants[].overrides.min_tier` | term |  | `tiers` | A term from *Tier bands*. |
| `variants[].overrides.kinds` | list of terms |  | `ability-kinds` | Terms from *Ability kinds*. |
| `variants[].overrides.requires` | list of lists |  |  | Conditions as groups of typed links: every group must hold, and one link in a group is enough. |
| `variants[].overrides.excludes` | list of typed links |  |  |  |
| `variants[].overrides.implies` | list of typed links |  |  |  |
| `variants[].overrides.adds_strengths` | list of link + reasons |  |  | Replaces the base generator's adds_strengths for this variant (for example a mine variant that no longer has to reach its target). |
| `variants[].overrides.adds_weaknesses` | list of link + reasons |  |  | Replaces the base generator's adds_weaknesses for this variant. |
| `generator` | group | when status is accepted |  | Rules for the generator. Links in requires, excludes, implies, adds_strengths and adds_weaknesses describe the card itself; counters and countered_by describe the enemy. |
| `generator.classes` | list of terms (min 1) | yes | `classes` | Classes that can roll this pattern. |
| `generator.min_tier` | term | yes | `tiers` | A term from *Tier bands*. |
| `generator.kinds` | list of terms (min 1) | yes | `ability-kinds` | Ability kinds this pattern can take on a card. |
| `generator.slot` | one of `signature`, `extra`, `any` | yes |  | signature = only as the card's signature ability; extra = only as an extra ability; any = either. |
| `generator.rarity` | term | yes | `rarity` | A term from *Rarity*. |
| `generator.flavour_lean` | list of terms |  | `faction-flavours` | Flavours that roll it more often. |
| `generator.requires` | list of lists |  |  | What the card must have. |
| `generator.excludes` | list of typed links |  |  | What the card must not have. |
| `generator.implies` | list of typed links |  |  | Parts the generator sets before rolling the rest. |
| `generator.conflicts_with` | list of ids |  |  | Pattern ids that may not appear on the same card. |
| `generator.adds_strengths` | list of link + reasons |  |  |  |
| `generator.adds_weaknesses` | list of link + reasons |  |  |  |
| `generator.counters` | list of link + reasons |  |  |  |
| `generator.countered_by` | list of link + reasons (min 1) | yes |  | The typed twin of counterplay: what beats a card with this pattern. |
| `generator.points` | group |  |  | Weights for the generator's balance hints, 0-3 each. Proposed with the generator (Phase 2). |
| `generator.points.cost` | integer | yes |  |  |
| `generator.points.power` | integer | yes |  |  |
| `generator.points.complexity` | integer | yes |  |  |
| `related[]` | list of groups |  |  |  |
| `related[].id` | id | yes |  | Lower-case id with dashes, e.g. 'infest-vehicle'. |
| `related[].kind` | one of `variant-of`, `generalises`, `often-confused-with`, `counters`, `combos-with` | yes |  |  |
| `open_questions` | list of texts |  |  | Design questions for Mustafa that the research raised. |
| `confidence` | term | yes | `confidence` | Confidence that the linked source units implement the mechanic as summarised; each example carries its own confidence. |
| `review` | group | yes |  | Checker status. The research run samples entries and re-checks them against their sources. |
| `review.status` | one of `unchecked`, `checked`, `disputed` | yes |  |  |
| `review.checked_by` | text |  |  |  |
| `review.checked_on` | text |  |  |  |
| `review.checked_paths` | list of texts |  |  |  |
| `review.wrong_paths` | list of texts |  |  |  |
| `review.notes` | text |  |  |  |
| `shooter_fit` | group | yes |  | How well the pattern suits a player-controlled, top-down team shooter. Feeds the top-30 list. |
| `shooter_fit.score` | integer | yes |  |  |
| `shooter_fit.reason` | text | yes |  |  |

## Concept card

One generated unit concept (Phase 2). Example: [docs/examples/concept-card.example.json](examples/concept-card.example.json). Schema: `schemas/concept-card.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `id` | text | yes |  | Hash of the reproduction key, so the same roll always has the same id. |
| `schema_version` | text | yes |  |  |
| `generator` | group | yes |  |  |
| `generator.version` | text | yes |  | Generator code version. |
| `generator.data_version` | text | yes |  | Content hash of the vocabularies and patterns used (data/manifest.json). |
| `seed` | text | yes |  | Shareable seed string. |
| `spice` | integer | yes |  | 1 = grounded (common parts, on-flavour) ... 5 = wild (rare cross-overs). |
| `inputs` | group | yes |  | What the user picked before rolling. Null = let the generator choose. |
| `inputs.class` | term or empty | yes | `classes` | A term from *Unit classes*. |
| `inputs.tier` | term or empty | yes | `tiers` | A term from *Tier bands*. |
| `inputs.flavour` | term or empty | yes | `faction-flavours` | A term from *Faction flavours*. |
| `inputs.role` | term or empty | yes | `roles` | A term from *Roles*. |
| `locks` | list of items | yes |  | Parts kept when rerolling. |
| `parts` | group | yes |  |  |
| `parts.class` | term | yes | `classes` | A term from *Unit classes*. |
| `parts.tier` | term | yes | `tiers` | A term from *Tier bands*. |
| `parts.flavour` | term | yes | `faction-flavours` | A term from *Faction flavours*. |
| `parts.nature` | term | yes | `nature` | A term from *Nature*. |
| `parts.availability` | term | yes | `availability` | A term from *Availability*. |
| `parts.roles` | group | yes |  |  |
| `parts.roles.primary` | term | yes | `roles` | A term from *Roles*. |
| `parts.roles.secondary` | list of terms (max 2) | yes | `roles` | Terms from *Roles*. |
| `parts.mobility` | group | yes |  |  |
| `parts.mobility.base` | term | yes | `mobility` | A term from *Mobility types*. |
| `parts.mobility.handling` | term | yes | `handling` | A term from *Handling*. |
| `parts.mobility.traits` | list of terms (max 2) | yes | `mobility-traits` | Terms from *Mobility traits*. |
| `parts.mobility.speed` | term | yes | `speed-bands` | A term from *Speed bands*. |
| `parts.body` | group | yes |  |  |
| `parts.body.plan` | term | yes | `bodies` | A term from *Body plans*. |
| `parts.body.size` | term | yes | `sizes` | A term from *Sizes*. |
| `parts.body.count` | integer | yes |  | 1 unless the crew model is squad (then 2-5). |
| `parts.armament` | group | yes |  |  |
| `parts.armament.primary` | group | yes |  | Null for an unarmed unit (its signature must then be support, transport, infiltration, summon or control).May be empty. |
| `parts.armament.primary.family` | term | yes | `weapon-families` | A term from *Weapon families*. |
| `parts.armament.primary.damage` | term or empty | yes | `damage-types` | A term from *Damage types*. |
| `parts.armament.primary.mount` | term | yes | `aim-models` | A term from *Aim / mount*. |
| `parts.armament.primary.delivery` | term or empty | yes | `weapon-delivery` | A term from *Weapon delivery*. |
| `parts.armament.primary.range` | term or empty | yes | `range-bands` | A term from *Range bands*. |
| `parts.armament.primary.can_target` | list of terms | yes | `target-types` | Terms from *Target types*. |
| `parts.armament.primary.affects` | one of `enemies`, `allies`, `both` |  |  |  |
| `parts.armament.primary.traits` | list of terms (max 3) | yes | `weapon-traits` | Terms from *Weapon traits*. |
| `parts.armament.primary.seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.armament.secondary` | group | yes |  | May be empty. |
| `parts.armament.secondary.family` | term | yes | `weapon-families` | A term from *Weapon families*. |
| `parts.armament.secondary.damage` | term or empty | yes | `damage-types` | A term from *Damage types*. |
| `parts.armament.secondary.mount` | term | yes | `aim-models` | A term from *Aim / mount*. |
| `parts.armament.secondary.delivery` | term or empty | yes | `weapon-delivery` | A term from *Weapon delivery*. |
| `parts.armament.secondary.range` | term or empty | yes | `range-bands` | A term from *Range bands*. |
| `parts.armament.secondary.can_target` | list of terms | yes | `target-types` | Terms from *Target types*. |
| `parts.armament.secondary.affects` | one of `enemies`, `allies`, `both` |  |  |  |
| `parts.armament.secondary.traits` | list of terms (max 3) | yes | `weapon-traits` | Terms from *Weapon traits*. |
| `parts.armament.secondary.seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.armament.conditional[]` | list of groups (max 4) | yes |  | Weapons that depend on a passenger, a kill or a mode. Needed when a weapon's family is 'adaptive'. |
| `parts.armament.conditional[].when` | typed link | yes |  | Typed link <kind>:<id>, e.g. 'role:anti-air', 'size:<=small' or 'hits:aircraft'. A link always describes a unit. In strengths, weaknesses, requires, excludes and implies it describes this unit; in counters, the unit this one beats; in countered_by, the unit that beats this one; in combos, the teammate it works well with. Kinds and their vocabularies are listed in x-ref-kinds; ranked kinds accept <= and >=. |
| `parts.armament.conditional[].weapon` | group | yes |  |  |
| `parts.armament.conditional[].weapon.family` | term | yes | `weapon-families` | A term from *Weapon families*. |
| `parts.armament.conditional[].weapon.damage` | term or empty | yes | `damage-types` | A term from *Damage types*. |
| `parts.armament.conditional[].weapon.mount` | term | yes | `aim-models` | A term from *Aim / mount*. |
| `parts.armament.conditional[].weapon.delivery` | term or empty | yes | `weapon-delivery` | A term from *Weapon delivery*. |
| `parts.armament.conditional[].weapon.range` | term or empty | yes | `range-bands` | A term from *Range bands*. |
| `parts.armament.conditional[].weapon.can_target` | list of terms | yes | `target-types` | Terms from *Target types*. |
| `parts.armament.conditional[].weapon.affects` | one of `enemies`, `allies`, `both` |  |  |  |
| `parts.armament.conditional[].weapon.traits` | list of terms (max 3) | yes | `weapon-traits` | Terms from *Weapon traits*. |
| `parts.armament.conditional[].weapon.seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.armour` | group | yes |  |  |
| `parts.armour.class` | term | yes | `armour-classes` | A term from *Armour classes*. |
| `parts.armour.models` | list of terms (min 1, max 2) | yes | `armour-models` | Terms from *Armour models*. |
| `parts.crew` | group | yes |  |  |
| `parts.crew.model` | term | yes | `crew-models` | A term from *Crew models*. |
| `parts.crew.solo_fallback` | term or empty | yes | `solo-fallback` | Null for single-seat models. |
| `parts.crew.passengers` | group | yes |  | May be empty. |
| `parts.crew.passengers.seats` | integer | yes |  |  |
| `parts.crew.passengers.kind` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.signature` | group | yes |  |  |
| `parts.signature.pattern` | id | yes |  | Lower-case id with dashes, e.g. 'infest-vehicle'. |
| `parts.signature.variant` | text or empty | yes |  |  |
| `parts.signature.kind` | term | yes | `ability-kinds` | A term from *Ability kinds*. |
| `parts.signature.seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.signature.cooldown` | term or empty | yes | `cooldown-bands` | Null for passive and triggered abilities. |
| `parts.abilities[]` | list of groups (max 3) | yes |  | Extra abilities. Keys (signature included) fit the tier's budget. |
| `parts.abilities[].pattern` | id | yes |  | Lower-case id with dashes, e.g. 'infest-vehicle'. |
| `parts.abilities[].variant` | text or empty | yes |  |  |
| `parts.abilities[].kind` | term | yes | `ability-kinds` | A term from *Ability kinds*. |
| `parts.abilities[].seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.abilities[].cooldown` | term or empty | yes | `cooldown-bands` | Null for passive and triggered abilities. |
| `parts.modes[]` | list of groups (max 1) |  |  | A second form from a transform or deploy pattern. |
| `parts.modes[].via` | id | yes |  | Lower-case id with dashes, e.g. 'infest-vehicle'. |
| `parts.modes[].class` | term | yes | `classes` | A term from *Unit classes*. |
| `parts.modes[].mobility` | group | yes |  |  |
| `parts.modes[].mobility.base` | term | yes | `mobility` | A term from *Mobility types*. |
| `parts.modes[].mobility.handling` | term | yes | `handling` | A term from *Handling*. |
| `parts.modes[].mobility.speed` | term | yes | `speed-bands` | A term from *Speed bands*. |
| `parts.modes[].armament[]` | list of groups (max 2) |  |  |  |
| `parts.modes[].armament[].family` | term | yes | `weapon-families` | A term from *Weapon families*. |
| `parts.modes[].armament[].damage` | term or empty | yes | `damage-types` | A term from *Damage types*. |
| `parts.modes[].armament[].mount` | term | yes | `aim-models` | A term from *Aim / mount*. |
| `parts.modes[].armament[].delivery` | term or empty | yes | `weapon-delivery` | A term from *Weapon delivery*. |
| `parts.modes[].armament[].range` | term or empty | yes | `range-bands` | A term from *Range bands*. |
| `parts.modes[].armament[].can_target` | list of terms | yes | `target-types` | Terms from *Target types*. |
| `parts.modes[].armament[].affects` | one of `enemies`, `allies`, `both` |  |  |  |
| `parts.modes[].armament[].traits` | list of terms (max 3) | yes | `weapon-traits` | Terms from *Weapon traits*. |
| `parts.modes[].armament[].seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `parts.resource` | term or empty |  | `resources` | A term from *Resources*. |
| `parts.on_death` | list of terms (min 1, max 2) | yes | `on-death` | Terms from *On death*. |
| `matchups` | group | yes |  | Every strength is paired with a weakness; every card has at least one counter that some valid card can satisfy. Never stores unit: links (real names stay in inspiration). |
| `matchups.strengths[]` | list of groups (min 1) | yes |  |  |
| `matchups.strengths[].ref` | typed link | yes |  |  |
| `matchups.strengths[].why` | text | yes |  |  |
| `matchups.strengths[].paired_with` | integer | yes |  | Index of the weakness that balances this strength. |
| `matchups.weaknesses` | list of link + reasons (min 1) | yes |  |  |
| `matchups.countered_by` | list of link + reasons (min 1) | yes |  |  |
| `matchups.counters` | list of link + reasons (min 1) | yes |  |  |
| `matchups.counterplay` | list of texts (min 1) | yes |  | What the player on the receiving end can do right now (from the patterns). |
| `text` | group | yes |  | Built from templates (no AI in v1). Hand edits on the board overwrite these. |
| `text.name` | text | yes |  | Original working name; checked against every real unit name in the database. |
| `text.pitch` | text | yes |  | One line. |
| `text.signature` | group | yes |  |  |
| `text.signature.name` | text | yes |  | Original ability name. |
| `text.signature.effect` | text | yes |  | One line. |
| `text.team_play_hook` | group | yes |  |  |
| `text.team_play_hook.hook` | term | yes | `team-play-hooks` | A term from *Team-play hooks*. |
| `text.team_play_hook.text` | text | yes |  |  |
| `text.how_it_plays` | group | yes |  | How it plays as a player. |
| `text.how_it_plays.as_user` | text | yes |  |  |
| `text.how_it_plays.as_target` | text | yes |  | What fighting it feels like, and the escape. |
| `text.how_it_plays.teammates` | text | yes |  |  |
| `text.how_it_plays.controls[]` | list of groups (min 1) | yes |  |  |
| `text.how_it_plays.controls[].seat` | term | yes | `seat-roles` | A term from *Seat roles*. |
| `text.how_it_plays.controls[].input` | text | yes |  | e.g. LMB, RMB, Q, E, Shift, Space. |
| `text.how_it_plays.controls[].action` | text | yes |  |  |
| `text.how_it_plays.tells` | text | yes |  | How enemies read it from above. |
| `inspiration` | group | yes |  |  |
| `inspiration.patterns` | list of ids | yes |  |  |
| `inspiration.source_units` | list of unit ids | yes |  |  |
| `inspiration.remix_of` | list of typed links (max 3) |  |  | Set when the card came from Remix. |
| `balance` | group | yes |  | Hints, not verdicts. |
| `balance.cost_band` | term | yes | `cost-bands` | A term from *Cost bands*. |
| `balance.power` | integer | yes |  |  |
| `balance.complexity` | integer | yes |  |  |
| `balance.keys` | integer | yes |  | Buttons the card uses, counted against the tier budget. |
| `balance.flags` | list of terms | yes | `balance-flags` | Terms from *Balance flags*. |
| `created_at` | text |  |  | Not part of the reproduction key. |

## Board card

A concept card saved on the board (Phase 3). Schema: `schemas/board.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `card` | concept card | yes |  | The full concept card (see above). |
| `column` | one of `ideas`, `promising`, `shortlist`, `rejected` | yes |  |  |
| `position` | integer | yes |  | Order within the column. |
| `notes` | text | yes |  |  |
| `tags` | list of texts | yes |  |  |
| `stars` | integer | yes |  |  |
| `origin` | one of `rolled`, `duplicate`, `remix`, `manual` | yes |  |  |
| `parent_id` | text |  |  | The card this was duplicated from. |
| `edited_fields` | list of texts |  |  | Parts and texts changed by hand; a reroll never overwrites these. |
| `added_at` | text | yes |  |  |
| `updated_at` | text |  |  |  |

## Game

One entry in the games registry, `data/games.json`. Schema: `schemas/game.schema.json`.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `id` | id | yes |  | Short id used as the first part of unit ids. Expansions are never game ids. |
| `title` | text | yes |  |  |
| `kind` | one of `game`, `series` | yes |  | game = one title; series = researched as one entry through a representative title (e.g. Battlefield vehicle archetypes). |
| `titles` | list of texts |  |  | For a series: the titles it covers. |
| `year` | integer |  |  |  |
| `developer` | text |  |  |  |
| `franchise` | text | yes |  |  |
| `control` | one of `commanded`, `piloted`, `both` | yes |  | commanded = the player orders units (RTS); piloted = the player is the unit (shooter); both. |
| `research_bucket` | id | yes |  | The research agent batch this game belongs to. |
| `version_researched` | text |  |  | Patch, edition or date the research describes. |
| `expansions[]` | list of groups |  |  |  |
| `expansions[].id` | id | yes |  | Lower-case id with dashes, e.g. 'infest-vehicle'. |
| `expansions[].title` | text | yes |  |  |
| `expansions[].year` | integer | yes |  |  |
| `factions[]` | list of groups (min 1) | yes |  | Playable sides. Use the reserved id 'shared' for units every side can field or games without factions. A unit belongs to the most general faction that fields it. |
| `factions[].id` | id | yes |  | Lower-case id with dashes, e.g. 'infest-vehicle'. |
| `factions[].name` | text | yes |  |  |
| `factions[].parent` | id |  |  | For subfactions (e.g. a general or splinter group): the main faction id. |
| `factions[].introduced_in` | id |  |  | Expansion id, if the faction is not in the base game. |
| `factions[].flavour_affinity` | list of terms |  | `faction-flavours` | Terms from *Faction flavours*. |
| `has_tiers` | boolean | yes |  | False if the game has no tech gating; its units then record no tier band. |
| `has_costs` | boolean | yes |  | False if units are not bought; its units then record no cost band. |
| `tier_map[]` | list of groups |  |  | Which tech gates map to which tier band. |
| `tier_map[].gate` | text | yes |  | Building, research or level that unlocks units, in plain words. |
| `tier_map[].band` | term | yes | `tiers` | A term from *Tier bands*. |
| `tier_map[].faction` | id |  |  | Lower-case id with dashes, e.g. 'infest-vehicle'. |
| `cost_thresholds` | group |  |  | Lowest price for each cost band above 'very low', in the game's currency. |
| `cost_thresholds.currency` | text | yes |  |  |
| `cost_thresholds.low` | number | yes |  |  |
| `cost_thresholds.medium` | number | yes |  |  |
| `cost_thresholds.high` | number | yes |  |  |
| `cost_thresholds.very-high` | number | yes |  |  |
| `speed_reference` | text | yes |  | The unit whose speed counts as 1.0 for speed bands, usually the basic rifle infantry. |
| `damage_map` | map |  |  | The game's own damage categories mapped to our damage types. |
| `armour_map` | map |  |  | The game's own armour categories mapped to our armour classes. |
| `scope` | one of `starting`, `added` | yes |  | starting = in the brief's list; added = added during research. |
| `added_reason` | text |  |  | Required for added games: the new mechanic it teaches. |
| `teaches_patterns` | list of ids |  |  | For added games: the patterns that justified adding it. |
| `status` | one of `planned`, `in-progress`, `done` | yes |  |  |
| `sources[]` | list of groups |  |  | A citation. Paraphrase only; never copy text or images. |
| `sources[].url` | URL | yes |  | The page actually read (https only; never an image). |
| `sources[].title` | text | yes |  | Page title and site. |
| `sources[].kind` | term | yes | `source-kinds` | A term from *Source kinds*. |
| `sources[].accessed` | text | yes |  | Date the page was read. |
| `sources[].note` | text |  |  |  |
| `sources[].supports` | list of texts |  |  | Which fields this source backs, as paths such as 'tier', 'cost_band' or 'abilities/0'. |
| `sources[].version` | text |  |  | Patch, edition or remaster the page describes, for games that change. |

## Shared parts

**source**: A citation. Paraphrase only; never copy text or images.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `url` | URL | yes |  | The page actually read (https only; never an image). |
| `title` | text | yes |  | Page title and site. |
| `kind` | text | yes | `source-kinds` |  |
| `accessed` | text | yes |  | Date the page was read. |
| `note` | text |  |  |  |
| `supports` | list |  |  | Which fields this source backs, as paths such as 'tier', 'cost_band' or 'abilities/0'. |
| `version` | text |  |  | Patch, edition or remaster the page describes, for games that change. |

**relation**: A typed link plus a plain-words reason.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `ref` | typed link | yes |  |  |
| `why` | text | yes |  | The reason, in plain words. |

**uncertain**: A specific point that is less certain than the overall confidence, or where sources disagree.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `path` | text | yes |  |  |
| `note` | text | yes |  |  |
| `sources_disagree` | boolean |  |  |  |

**fitNote**: Where no vocabulary term fitted well. Collected into a vocabulary-gaps report that feeds the next vocabulary version.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `path` | text | yes |  |  |
| `used` | text | yes |  |  |
| `wanted` | text |  |  |  |
| `note` | text | yes |  |  |

**review**: Checker status. The research run samples entries and re-checks them against their sources.

| Field | Type | Required | Vocabulary | Meaning |
|---|---|---|---|---|
| `status` | one of `unchecked`, `checked`, `disputed` | yes |  |  |
| `checked_by` | text |  |  |  |
| `checked_on` | text |  |  |  |
| `checked_paths` | list |  |  |  |
| `wrong_paths` | list |  |  |  |
| `notes` | text |  |  |  |

