# The Kaiser, recoded after night decisions N1 and N3

The reconciler's entry (`report-iron-harvest.json`) kept the Kaiser's rocket batteries inside its Entrench ability, as the Iron Harvest note on the infobox's "(Ability)" slots then said. Both coders and the reconciler flagged that the field rules say otherwise: a weapon that a mode adds while the primary keeps firing is a secondary weapon with that mode (`armament[].slot` and `armament[].mode` in docs/fields.md).

On 27 October 2026 the night shift amended that note (decision N1, reversible): a slot that a mode adds as a standing weapon is coded as a weapon with the mode, and the button that enters the mode stays the ability. One agent then recoded the entry in `iron-harvest.json` here.

## What N1 changed

- **A new weapon, armament/2 (Rockets).** Its figures come from the Kaiser page's third weapon slot and DevBlog #24.
  - **Slot:** secondary, with the mode `entrenched`. The cannon keeps firing into its narrow arc. A weapon a rank adds with no button would be acquired, but here the first rank opens Entrench, and that button enters the mode.
  - **Family and delivery:** rockets, projectile. These are the family's defaults, and no page says the rockets steer.
  - **Damage:** explosive. The registry has no damage map for Iron Harvest, so the family default applies. By the Armor page, they hurt infantry about three times as much as light and medium mechs.
  - **Traits:** splash.
  - **Range:** medium (about 1.4 times the reference rifle's reach).
  - **Targets and mount:** infantry, ground vehicles and buildings, on limited-arc mounts (front and flanks, none to the rear). Seat: gunner.
  - **Pattern:** deploy-siege-mode, as for the Entrench button.
- **abilities/0 (Entrench):** the summary now covers only the deploy. That is its unlock, the arc it leaves the cannon, the moment it stands exposed and its weakness to field guns and artillery.
- **modes/0:** the summary names the rockets.
- **Crew:** solo became driver-gunner, falling back to full control. Once dug in, the rockets fire from mounts of their own beside the cannon. The side machine guns stay with the driver, because no page says they fire at the same moment as the cannon.
- **as_player, sources and uncertain:**
  - as_player gains the gunner seat;
  - the three cited pages that give the rockets now list the new weapon among what they support;
  - the uncertain entry asking whether the batteries belong in armament is gone, and new entries cover the slot, the mount and the crew.
- **Checked and left as they were:** roles, flavour_affinity, the other two weapons, the matchup lists and memorable.

## Checks after N1

- `node scripts/format-json.mjs data/units/iron-harvest.json`: no changes.
- `node scripts/validate.mjs .`: OK, no errors. The Kaiser's four atypical lines are each in its atypical list: many legs at very slow speed, plus three for the fixed-gun hull (class, legs, size).
- `node scripts/copy-check.mjs . --only` on the five cited pages: no shared runs.

## Night decision N3: the body plan

The two coders split on the Kaiser's body plan: spider-frame (coder A) or casemate (coder B, and the reconciler). An analyst and a skeptic then drafted a body tie-break for walkers on many legs, for the rule-fix round after R4 (`../splits.json`). Under it, a walker whose main weapon is fixed facing forward, or sits in a mount that does not turn all the way round, is spider-frame.

The night shift wrote that reading into the Iron Harvest notes as the interim rule (decision N3, reversible), so the fill codes the Mocny and the Stark the same way. The Kaiser was then recoded by hand:
- body.plan: casemate became spider-frame. The fixed cannon still shows in its body-aim mount;
- atypical: the three casemate lines are gone (walker class, many legs, huge size). The line for many legs at very slow speed stays;
- body.notes, the body/plan fit_note and the body/plan uncertain entry: rewritten for the new plan. The fit_note still asks for a fixed-gun hull on legs, which is option C of the fix.

Checks after N3: the validator gives OK, with only the very-slow line, which is recorded. The copy-check finds no shared runs on the cited pages.
