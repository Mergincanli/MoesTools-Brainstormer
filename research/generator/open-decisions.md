# First generator (plan step 3b): where the work stopped, and the decisions that wait for Mustafa

Written on 13 November 2026, when Mustafa paused the work. A later session continues from this page, [docs/handoff.md](../../docs/handoff.md) and the log next to it ([log.md](log.md)).

## Where the work stopped

Done and pushed on branch `claude/quirky-cray-tih1w4` (no pull request is open for it yet):

- The rule sheet, approved ([docs/generator-rules.md](../../docs/generator-rules.md)); its section 18 lists every reading settled while the work was built and cross-checked.
- The rules as data (`data/generator/`, approval P1), the key count in the validator (P2), the card schema line (P4), the separate rolled-card checker `scripts/check-cards.mjs` (P3).
- The module `src/core/` (four build jobs, two fix rounds), `npm run roll`, `npm run cards` with `docs/cards.md`, and `npm run cross-check`.
- `npm run check:merge` passes with 664 tests.
- The cross-check with random requests (`npm run cross-check -- t3`): 10,000 rolls, 9,943 cards, none with a problem.

Not done:

1. **The cross-check over every combination of inputs** (`t4`, 190,400 rolls). It was stopped at the pause after about 40,000 rolls, with no failing card so far. Run it again in four parts, each in the background, and keep the four summaries:
   `node scripts/cross-check.mjs t4 --seeds 20 --shard 0/4 --out <file>`, and the same with `--shard 1/4`, then `--shard 2/4`, then `--shard 3/4`. Together they take about 25 minutes on four processors. Record the result in the handoff.
2. **Show Mustafa the sample page** ([docs/cards.md](../../docs/cards.md)). It was sent to him with the pause report; his remarks on it come first.
3. **Two review passes and their fixes** (estimate 2 to 3 million tokens): one on the module against the rule sheet, one on the tests and the checker. Not started.
4. **The pull request** for step 3b, with a description that starts with `## TL;DR`, then "Decisions needed", then "For Mustafa"; then wait for his "merge".
5. **His four answers below**, each applied with his approval recorded in its commit message.

Kept for step 4 (the rule-fix round), from the builder's and the checker's notes:

- 208 of the 2,713 pattern lines a card can show name a real game or unit, so cards fall back on neutral sentences there. Rewording those lines makes the cards read better.
- Four matchup reasons start with the research marker "Reasoned:".
- The rule that body-aim weapons sit on the driver's seat is only prose in the aim-models word list.
- A card has no text for what an extra ability does; the sample page reads it from the pattern.
- Points and weights are starting values: T3 cards sit at the top of the power and complexity scales, and the cost-outside-tier warning hardly ever shows.

## Decisions that wait for Mustafa

Each was shown to him with this wording on 13 November 2026. None is applied.

### K2-WORDING: the card property for answer K2 A

He answered K2 with A (a signature that is the primary weapon, fired with primary fire, is not a key) and asked to see the exact wording first.

- New optional property on `$defs.abilityPart` in `schemas/concept-card.schema.json`:
  `"primary_fire": { "description": "True when this ability is the card's primary weapon and is fired with primary fire: it then uses no key. Only the signature may set it, and only on a card that has a primary weapon. Left out means false.", "type": "boolean" }`
- New sentence in the validator's header: "A signature that is the card's primary weapon and is fired with primary fire is not a key."
- The validator does not count such a signature as a key, and reports two new errors: "primary_fire is set on an extra ability: only the signature can be the card's primary weapon" and "primary_fire is set, but the card has no primary weapon".
- The example card's signature gets `"primary_fire": true` and its key count goes from 2 to 1; the docs are rebuilt.
- Then: the flag `SIGNATURE_ON_PRIMARY_FIRE_IS_KEY` in `src/core/keys.ts` and `countKeys` in `scripts/check-cards.mjs` follow, with tests.

### DUP-LIST: which pairs of patterns count as one mechanic under two names

The list is [duplicates/pairs.md](duplicates/pairs.md): 18 pairs the same mechanic, 18 mostly a repeat, 9 real second tools, 1 rejected, 3 already kept apart by the patterns themselves.

- A: mark the 18 "same" pairs.
- B (recommended): mark the 18 "same" and the 18 "mostly a repeat" pairs.
- C: mark none.

The proposed entries for B are in [duplicates/same-mechanic-proposed.json](duplicates/same-mechanic-proposed.json) (35 entries: 17 same and 18 repeat; the eighteenth "same" pair, X-01, sits inside the widened repeat entry L2-30). For answer A, add X-01 (disguised-bomb with wolf-in-the-column) as its own entry. Nothing is merged or renamed either way.

### DUP-WORDING: the list must be able to name variants

All but 3 of the pairs hold between variants, not whole patterns. The approved shape of `same_mechanic` holds pattern ids only.

- New description of `same_mechanic` in `schemas/generator.schema.json`: "Pairs that are one mechanic under two names (rule A11). Each side names a pattern and, when the pair holds only for some of its variants, those variants; a side with no variants means every variant of the pattern. No card holds both sides of a pair. Nothing is merged or renamed. Each pair says whether the two are the same mechanic or mostly a repeat, and why."
- Entries: `{ "a": { "pattern": ..., "variants": [...] }, "b": { ... }, "verdict": "same" | "repeat", "note": ... }`.
- Rule A11 in the rule sheet gains: "A pair you confirm is listed in the rules file, with the variants it holds for, and no card holds both sides."
- The module (`mayJoin` in `src/core/patterns.ts`) and the checker (`sameMechanicPairs`) already read both shapes.

### DV: what the data version covers

The name check reads the real names (units, games) and the pattern registry, which the data version does not cover today.

- A (recommended): the data version also covers them. The line in `schemas/concept-card.schema.json` would read: "Content hash of the data the generator reads: the vocabularies, patterns, generator rules, pattern registry and the real names it checks against (data/manifest.json)."
- B: keep it as approved (word lists, patterns, generator rules).

## Tokens so far (new tokens: input, cache writes and output, from the agents' own records)

| Part | Estimate given (million) | Used (million) |
|---|---|---|
| Rule sheet, written and checked | 1.5 to 2.5 | 2.40 |
| Check for double patterns | 1.5 to 2.5 | 1.41 |
| Rules as data, text templates and name words | 1 to 1.5 | 0.74 |
| Separate card checker | 1.5 to 2.5 (with the big roll tests) | 1.73 |
| Module: four build jobs and two fix rounds | 5.5 to 8 | 5.15 |
| Review in two passes and fixes | 2 to 3 | not started |
| Agents together | | 11.43 |

The session's own work (estimate 3 to 5 million) is not in this table: its tokens are not measured by these records.
