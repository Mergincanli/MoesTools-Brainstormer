Task: R3 write patterns rally-allies, resupply-allies, sacrifice-for-allies, refill-on-ally-buff (workspace ws-g4)
- started; no earlier notes. Next: read schema, docs, registry, examples, units.
- read: schema (pattern + common), fields.md Pattern section + conventions, runbook s5, repair-allies.json example (has generator even when proposed), registry (63 ids; schema id/name/category/summary[/from_brief]), registry-notes/patterns.md (rally: Generals Overlord propaganda tower, CoH officer auras; horde bonus folds into rally passive variant w/ hook swarm; resupply: BF4 ammo box, PS2 ammo pack, Wargame supply trucks; overclock-self = stat buff on self).
- next: read 4 TR units in data/units/tempest-rising.json, vocab lists, samples.
- units read. Line Officer abilities/0 Inspire Troops ALREADY links rally-allies (infantry around him move+fire 1.5x, timed call). abilities/1 Supervise Crew has fit note (board vehicle -> Elite) not mine.
  Drone Operator: rally-allies only in combos/3 (Comms Officer/Comms Rig boost) -> no ability link; sync would not list it in source_units.
  Enlightened abilities/0 Sacrifice ALREADY links rally-allies+resupply-allies; fit note abilities/0/patterns asks for sacrifice pattern -> add sacrifice-for-allies there, remove that note.
  Vimana abilities/2 Sacrificial Benediction ALREADY links rally-allies (credits, no thrall); abilities/6 Consecrated Restocking patterns [] with fit note abilities/6/patterns (resupply on buff) -> refill-on-ally-buff candidate.
  Generals: generals.json:1234 some unit links rally-allies (check id); generals.json:1835 fit note on horde bonus (read).
- validator: ERROR "no unit links this pattern" if no unit links a live pattern; source_units mismatch only warns. linkedPatterns = abilities/armament patterns + modes via.
- hooks vocab: resupply = "refills teammates' ... or needs teammates to refill its own".
