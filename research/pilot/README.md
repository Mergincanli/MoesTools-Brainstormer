# Calibration pilot (step 2 of the plan)

The pilot checks whether independent coders, following only the written rules, code the same unit the same way. Where they did not, the word lists and field rules got a sharper rule, a merged term or a tie-break rule. The result is word lists 1.0 (still marked draft until Mustafa approves them).

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
| Hesitations in 12 coder reports | 442 on 94 field paths | 340 on 64 field paths |
| Places where no term fitted (gaps) | 102 | 53 |
| Rules a coder called unclear | 226 | 137 |

**Round 1's weakest fields reached 100% in round 2:**
- the number of weapon entries (61%);
- the death outcome (72%);
- the main weapon's family and damage (78% each);
- the main weapon's mount (78%).

**Only secondary roles stayed below the target**, at 72% in round 2 against 80% in round 1. They are a ranking among several roles that all qualify, at most two allowed. See [round-2/agreement.md](round-2/agreement.md) for every remaining split.

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
| `round-2/coder-<a,b,c>/<game>.json` | The units each round-2 coder wrote (word lists 1.0). |
| `round-2/agreement.md`, `round-2/hesitations.md` | Round-2 agreement and hesitations. |

These files are a record. They are not checked by the validator, and the round-1 units stay as they were coded, against word lists 0.4.0.
