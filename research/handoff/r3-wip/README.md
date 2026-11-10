# R3 work in progress, saved for the move to a new session

Saved on 10 November 2026 from the old session's scratchpad, which does not move to a new account. Nothing here has been checked by a skeptic. It is a starting point, not a record: never copy it into `data/` as it stands. Paths on the old machine are written as `<scratchpad>`, `<repo>` and `<session>`.

Delete this folder (and `research/handoff/`) once R3's merge pass and patterns no longer need it, before R3's final checks. [docs/handoff.md](../../../docs/handoff.md) explains where it fits.

## What is here

| Folder | What | State |
|---|---|---|
| `merge-consistency/` | `findings-unverified.json`: the merge pass's consistency check, 15 `registry` findings and 9 `links` findings, each with evidence and a proposed fix. `merge-consistency.js`: the workflow script that made them, with four finders (registry, links, conventions, facts) and a skeptic each. `r1-merge-fixes-template.js`: R1's script that applied confirmed fixes per game, to adapt for R3. | Finders only. No skeptic has checked these findings, and the `conventions` and `facts` finders never ran. |
| `patterns/g1-stealth-capture/` | Drafted pattern files `cloak`, `hijack-vehicle`, `convert-on-kill` and `block-abilities`, plus `writer-report.json` (its registry entries, unit links and open points) and `progress.md` (the writer's notes, ending with DONE). | Written, not checked. |
| `patterns/g2-arrival-production/` | The same for `drop-in-from-above`, `host-spawn-point`, `build-linked-exits` and `produce-unit-in-field`. | Written, not checked. |
| `args/patterns.json` | The 9 groups and 35 patterns for `research/workflows/patterns.js`. | Groups g3 to g9 not started. |
| `args/fill.json`, `args/reconcile.json` | The arguments of the fill and the opening reconcile, as they ran. | Done; kept for the record. |
| `scripts/opening-splits.js` | The opening check's analyst and skeptic for the fields below 80%. | Done (`research/r3/opening/splits.json`). |
| `tools/` | Helpers used outside the workflow scripts. `merge.py` adds a batch's units from its records in the trim's order. `record-fill.py` copies a finished fill job into `research/r3/fill/<job>/`. `fill-hesitations.py` and `opening-hesitations.py` write the hesitations files. `apply-prep.mjs` and `save-prep.mjs` were used in R3's prep. `pdfcheck.mjs` runs the six-word check against manual PDFs turned into text with `pdftotext`. | Working copies. |
| `session/` | `state.json` and `night-log.md`, the old session's state file and log; `morning-2026-10-26.md`; `pr6-body.md`, the text of pull request #6's description. | As of 29 October, with this move added. |

## The consistency findings in one line each

All are unverified.

**Registry and notes** (`registry`). These change `research/registry-notes/games-r3.md` and then recode the units named:
- REG-01: Tempest Rising soldier armour. The Line Officer's armour percentages make him `light`, not unarmoured.
- REG-02: the Generals note on the 1.04 files keeps terms its own rules would set. This touches splash, friendly-fire and projectile delivery on the Technical, Sentry Drone, Aurora Bomber and Overlord.
- REG-03: the Engine Tuning doctrine reaches every Veti vehicle and aircraft, so the Shared mechanics rule leaves it off the Thunderhead and the Vimana.
- REG-04: Arcing is triggered, not passive, by the Passive or Triggered tie-break (Thunderhead, Vimana).
- REG-05 to REG-15 (minor): the horde bonus count; the shared faction's note against the Engineer squad; the super-heavy size remarks; never ranking up as a weakness link; role and strength phrase lists missing a line (Voltaic Tank, Tempest Sphere, Anna Kos); Lore blockquotes; the Engineer's defences; the Nakovalnya's unmarked ability slot; infantry tumbling.

**Links** (`links`): L1 to L4 are major and L5 to L9 minor. They cover matchup links that miss a fitting typed link, such as hijack-vehicle for Kell's snipe, and a link in both lists for the same situation. They also cover counters that take in enemies which beat the unit, and comparisons without `>=`.

## How to go on

**Consistency check:**
1. Make a script from `merge-consistency.js`, with `REPO` and `SP` set for the new machine. Run the skeptic stage on `findings-unverified.json`: one skeptic each for `registry` and `links`. Also run the `conventions` and `facts` finders, each with its skeptic. The findings point at the units as of 6c817f1, which is still their state.
2. Apply the confirmed fixes per game, adapting `r1-merge-fixes-template.js`. A fix to the notes or the registry is a decision about the notes (runbook, "Decisions"). One that needs the word lists or the field rules goes to the rule-fix round instead.

**Patterns:**
1. Make 9 workspaces with `sh research/workflows/mkws.sh <scratchpad>/r3/patterns/ws-g<N>` from the current commit, and put the new paths into `args/patterns.json`.
2. For g1 and g2, copy into the new workspace:
   - the drafted files into `data/patterns/`;
   - the registry entries from `writer-report.json` into `data/pattern-registry.json`;
   - `progress.md` into `.progress/write/`.

   The writer then answers from its notes, which end with DONE, and the skeptic and fixer stages run.
3. Run `research/workflows/patterns.js` with those arguments: at most two workflows at once, so with the consistency check that is both slots. Then integrate as runbook section 5 says.

Open points the g1 and g2 writers raised, which decide how to integrate:
- Kell's crew snipe became a `crew-snipe` variant of `hijack-vehicle`, not a new id.
- `untouchable-attack-run` waits on group g8.
- The Enlightened's strengths/3 could link `pattern:convert-on-kill`.
- Group g2 found the Combat Chinook's building clearing best as a variant of `drop-in-from-above`. See each `writer-report.json`.
