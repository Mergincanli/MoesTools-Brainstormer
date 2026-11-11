# Registry notes (step 1)

Working notes written while filling the games registry and growing the pattern registry in step 1. The research agents of step 3 should read the note for their batch first: it says which wiki works best, how tiers and prices were mapped, and what to watch out for.

Read the official role line first; roles depend on it. Where a game's tooltips have strong-against or weak-against lines, the note for that game says so, because roles step 4 reads them.

Each game's note has a section Game-wide mechanics, written before any unit of that game is coded. Coders follow it; a mechanic that may be game-wide but is not listed is coded on the unit with a fit_note, and the merge pass decides.

| File | Covers |
|---|---|
| [games-r1.md](games-r1.md) | Red Alert 1, 2 and 3 |
| [games-r2.md](games-r2.md) | Tiberian Dawn, Tiberian Sun, Tiberium Wars, Renegade |
| [games-r3.md](games-r3.md) | Generals, Tempest Rising, Iron Harvest |
| [games-r4.md](games-r4.md) | Company of Heroes 1-3, World in Conflict, Wargame, Broken Arrow |
| [games-r5.md](games-r5.md) | Supreme Commander, Planetary Annihilation, StarCraft II, Halo Wars 2, Dawn of War 1-2 |
| [games-r6.md](games-r6.md) | Battlefield, PlanetSide 2, Foxhole, WARDOGS, Arc Raiders, MechWarrior / BattleTech |
| [patterns.md](patterns.md) | The 26 pattern ids added in step 1, with example units to research |

The data files (`data/games.json`, `data/pattern-registry.json`) are the reference; these notes are context.

**Plan change of 24 October 2026.** The files keep the batches of step 1. The new batch R4 (StarCraft II: Legacy of the Void, Halo Wars, Halo Wars 2, Planetary Annihilation: TITANS, MechWarrior/BattleTech) takes its games' notes from games-r5.md and games-r6.md; its prep gathers them into a new games-r4.md, and the current games-r4.md is renamed then. Halo Wars has no notes yet. The other games of games-r4.md, games-r5.md and games-r6.md are shelved, and R2 is paused ([proposal, section 2.2](../../docs/proposal.md#22-the-research-run)).
