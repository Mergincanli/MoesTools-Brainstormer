# Calibration pilot (step 2 of the plan)

The pilot checks whether independent coders, following only the written rules, code the same unit the same way. Where they did not, the word lists and field rules got a sharper rule or a tie-break rule. No term was added, merged or removed. The result is word lists 1.0.0, still marked draft until Mustafa approves them. [What needs your OK](#what-needs-your-ok) lists the choices still open.

## How it was run

- **Coders.** Three coders (A, B, C) per unit. Each worked in a separate copy of the repository, without seeing the others' work.
- **Round 1:** six units, coded with word lists 0.4.0.
  - The three published RA3 samples: Terror Drone, Hammer Tank and Multigunner IFV. The coders worked without the samples, so the samples could serve as a reference.
  - Three units from games whose tiers and prices work differently: the StarCraft II Siege Tank (two resources), the Company of Heroes Riflemen (three resources and tier buildings) and the Battlefield attack helicopter (no prices or tiers).
- **Speed test (decision 2C).** Three more coders banded 12 shooter vehicles from Battlefield 4, PlanetSide 2 and Foxhole in two ways:
  - **Method A:** against the game's soldier;
  - **Method B:** against the game's standard tank.
- **Analysis.** Six analysts, one per group of fields, proposed changes from the disagreements and the coders' hesitations. Each analyst's proposals went to a skeptical reviewer.
  - One more agent decided all 150 proposals and resolved the overlaps between groups.
  - Implementers, each owning separate files, applied the result, and an integration pass made the checks pass.
- **Round 2:** four units the coders had not seen, coded with word lists 1.0 and with the samples as worked examples.
  - The units: the Dawn of War II Tactical Marine Squad, the PlanetSide 2 Magrider, the Generals Overlord tank and the MechWarrior Atlas.
  - The four games first got the game-level registry notes the 1.0 rules rely on: where the official role line lives, game-wide mechanics, and damage and armour notes.
  - The coders worked from the word lists as of commit 43e9a0c, with the registry notes as of d84bc8e.
- **Round-2 fix pass.** An analyst traced each of the 17 items where round-2 coders still split, and each round-2 hesitation, to its cause, and a reviewer checked every proposal. 39 changes were applied (commit 642a0ba), all listed in [round-2/fixes.json](round-2/fixes.json). Each was checked against all 12 round-2 codings and the three samples: with them, the coders would have agreed on every split item. Some also change codes the coders had agreed on; `applied.notes` in fixes.json lists those for the next rescoring.
- **Final review.** Five reviewers checked the tooling, the word lists, the field rules, the data and this record, and a skeptic tried to refute every finding. The real findings were fixed:
  - 14 word lists reworded again, still at 1.0.0: aim-models, armour-classes, balance-flags, confidence, crew-models, handling, nature, on-death, range-bands, roles, seat-roles, sizes, weapon-delivery and weapon-families;
  - a few field rules in the source-unit and game schemas and in the Conventions;
  - the samples, the games registry and the registry notes;
  - this record.

  These last two passes have not been tested on fresh units yet; decision 6 below is about that.

**How agreement is counted** (`npm run agreement`):
- Every pair of coders is compared on every unit.
- A one-value field scores whether the two values match. A list scores how much the two lists overlap.
- The target is 80%.
- Matchup lists (strengths, counters and so on) are open choices and are measured for information only.
- Because all coders are the same kind of agent, they can agree while all being unsure, so their hesitations were counted too.

## Results

| | Round 1 (0.4.0) | Round 2 (1.0) |
|---|---|---|
| Measured fields at 80% or more | 47 of 56 (41 of 49 with the first version of the measure) | 55 of 56 |
| Mean agreement over measured fields | 92% | 96% |
| Hesitations in 12 coder reports | 442 on 65 fields | 340 on 44 fields |
| Places where no term fitted (gaps) | 102 | 53 |
| Rules a coder called unclear | 226 | 137 |

**Round 1 had nine fields below the target. Six of them reached 100% in round 2:**
- the number of weapon entries (61% in round 1);
- the death outcome (72%) and what it rests on (78%);
- the main weapon's family, damage and mount (78% each).

**Two more rose above the target:**
- confidence, from 56% to 83%;
- each weapon's seat, family and mount read together, from 76% to 89%.

**Only secondary roles stayed below the target:** 80% in round 1 (79.6%, just under) and 72% in round 2. A unit can have at most two secondary roles, chosen and ranked from several that all qualify. Two of the four round-2 units split on them, and the fix pass added rules for both. See [round-2/agreement.md](round-2/agreement.md) for every remaining split.

Round 1 was rescored with the same measure in [round-1/agreement-rescored.md](round-1/agreement-rescored.md), so both rounds are compared like for like. The measure now fills in documented defaults before comparing, and reads a few more fields.

**Speed test:**
- **Agreement:** coders agreed on 100% of method A bands and 94% of method B bands.
- **The one split under B** was the PlanetSide 2 Sunderer, which has no published speed.
- **Method A's cost:**
  - in shooters, most vehicles bunch at fast or very fast;
  - PlanetSide 2's tracked tanks break the tracks speed rule.
- **Method B's cost:**
  - it cannot separate aircraft;
  - it needs a second scale on every unit.
- **Decision:** method A was applied, as your rule for 2C asked. Details are in [round-1/speed/](round-1/speed/).

## Copied wording

The record repeats what coders and analysts read, so it was checked for copied wording like the data.
- **The check:** every `.json` and `.md` file in `research/pilot/` and `research/registry-notes/` was compared with every page the coders and analysts had cached.
- **What it found:** 85 runs of six or more words shared with a page (72 when runs made only of names and titles are left out, as the copy-check does).
- **The fix:** every run was paraphrased or cut to five words or fewer. A rerun finds none.
- **The copy-check:** `npm run copy-check -- --also research/pilot --also research/registry-notes` repeats the check against every page the data cites and every page the notes link to, fetched live. It finds no shared run in the 262 pages it could fetch. The 3 it could not fetch are all in one speed coder's list of pages read: two sites refuse automated requests (the German Battlefield wiki page and a Namu wiki page) and one site did not answer (planetsideguide.com).

The record also no longer holds local machine paths.

## What needs your OK

1. **Speed: method A for every unit (decision 2C).** A agreed more (100% against 94%), so it is applied. Its costs are listed under Speed test above. Recommendation: keep A, and look at the tracks speed rule again when batch R1 is reviewed.
2. **Abilities that cost a resource each use** (Company of Heroes munitions). Today it is not a resource; the ability's summary says it in words. Round 2 had no such ability. Recommendation: keep it so, unless Shamble Frontlines charges per ability use.
3. **Sources per unit: keep 3, or raise to 5.**
   - In round 2, 10 of 12 coders said the cap of 3 forced a trade-off, and 86 of their 166 doubts (52%) rest on pages they read but could not cite.
   - Since the fix pass the cap no longer changes a code, only confidence and which pages the copy-check sees.
   - Recommendation: 5.
4. **Flavour: the computed rule, and where infiltrator sits.**
   - The rule split on one round-2 unit, only because its body plan split.
   - Coders raised three wording questions: one point per weapon family at most; skip an avoided flavour in the last step too; tied flavours in word-list order.
   - Recommendation: keep the rule, answer yes to all three, and move infiltrator from soviet to allied.
5. **Matchups that name something the unit lacks** ("has no weapon that reaches aircraft"). Today's workaround gave the same links from every coder in round 2. Recommendation: keep it, and decide again when the generator's pairing of strengths and weaknesses is designed.
6. **Freezing 1.0.** The round-2 fix pass and the final review were not tested on fresh units. Recommendation: freeze now, and open batch R1 with two units coded by two coders without seeing each other's work, compared with `npm run agreement`. A field below 80% gets its fix as 1.0.1 before the rest of the batch.

**The word-list changes to approve:**
- [word-list-changes.md](word-list-changes.md): every change from 0.4.0 (the version on main, which step 1 brought) to 1.0.0.
- [word-list-changes-from-0.3.md](word-list-changes-from-0.3.md): every change from 0.3.0, the version the proposal showed.

Items 2 to 5 are the same as the choices at the end of [round-1/decisions.md](round-1/decisions.md); round 2's evidence for each is in `proposals.for_mustafa` in [round-2/fixes.json](round-2/fixes.json).

## Files

| Path | What it is |
|---|---|
| `round-1/coder-<a,b,c>/<game>.json` | The units each round-1 coder wrote, as coded (word lists 0.4.0). |
| `round-1/agreement.md` | Round-1 agreement as the analysts saw it, with the comparison against the published samples. |
| `round-1/agreement-rescored.md` | Round 1 scored with the final measure, for comparison with round 2. |
| `round-1/hesitations.md` | Every round-1 hesitation by field, every gap and every unclear rule. |
| `round-1/speed/` | The speed test: each coder's notes, the table and its agreement. |
| `round-1/analysis/<group>.json` | The six analysts' proposals and the reviewers' verdicts. |
| `round-1/decisions.md`, `round-1/conflicts.md` | The decision on every proposal, and the final texts where groups overlapped. |
| `round-2/coder-<a,b,c>/<game>.json` | The units each round-2 coder wrote (word lists 1.0, as of 43e9a0c). |
| `round-2/agreement.md`, `round-2/hesitations.md` | Round-2 agreement and hesitations. |
| `round-2/fixes.json` | The round-2 fix pass: the proposals, the reviewer's verdicts, what was applied, the gaps left for later and the evidence for your choices. |
| `word-list-changes.md`, `word-list-changes-from-0.3.md` | Every word-list change to 1.0.0, from 0.4.0 and from 0.3.0 (`npm run vocab-diff`). |

These files are a record. They are not checked by the validator, and the coders' units stay as they were coded. Since then they were edited only to remove copied wording and local paths.
