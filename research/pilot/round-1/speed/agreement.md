# Speed test: agreement between coders

Coders: coder-a, coder-b, coder-c. Items: 12 (bf4-ah-1z-viper, bf4-lav-25, bf4-m1-abrams, bf4-m1161-itv, foxhole-devitt-mk-iii, foxhole-dunne-transport, foxhole-obrien-v110, foxhole-silverhand-mk-iv, ps2-harasser, ps2-lightning, ps2-prowler, ps2-sunderer). Threshold: 80%.

**3 of 4 measured fields reach the threshold; 1 fall below it.** Agreement is the mean over every pair of coders on every item (sets score their overlap). "Within one step" counts pairs at most one rank apart, for ranked word lists and counts. Matchup lists are open choices, measured for information only.

| Field | Kind | Items | Agreement | Within one step | Items all agree | Note |
|---|---|---|---|---|---|---|
| band_a | one | 12 | 100% | 100% | 12 of 12 |  |
| band_b | one | 12 | 94.4% | 100% | 11 of 12 |  |
| raw_speed_mps | count | 12 | 63.9% | 88.9% | 6 of 12 | **below** |
| judged | one | 12 | 94.4% |  | 11 of 12 |  |

## Where coders disagreed

Every measured field with at least one item the coders did not all code the same way.

### band_b (94.4%)

| Item | coder-a | coder-b | coder-c |
|---|---|---|---|
| ps2-sunderer | medium | slow | medium |

### raw_speed_mps (63.9%, below the threshold)

| Item | coder-a | coder-b | coder-c |
|---|---|---|---|
| bf4-ah-1z-viper | 91.667 | 91.67 | 44.444 |
| bf4-lav-25 | 11.667 | 11.67 | 11.667 |
| bf4-m1-abrams | 11.111 | 11.11 | 11.111 |
| bf4-m1161-itv | - | 20.83 | - |
| ps2-lightning | 19.444 | 19.44 | 19.444 |
| ps2-prowler | 18.333 | 18.33 | 18.333 |

### judged (94.4%)

| Item | coder-a | coder-b | coder-c |
|---|---|---|---|
| bf4-ah-1z-viper | false | true | false |
