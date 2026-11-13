# Batch R4: the prep, parked before the fill

## TL;DR

- **Parked on 12 November 2026.** The prep ran on 11 November 2026, on Mustafa's word. That evening he stopped R4 before the fill, and on 12 November he moved a first generator ahead of it ([proposal, section 2.2](../../../docs/proposal.md#22-the-research-run)). R4 starts from this record, when he says so.
- **The unit list is ready:** 85 units. StarCraft II 49 (every Legacy of the Void multiplayer unit except the three workers, no trim), and 9 each for Halo Wars, Halo Wars 2, Planetary Annihilation: TITANS and MechWarrior/BattleTech. 21 candidates were cut, each with a reason.
- **The Hellion and the Hellbat are one unit** by the field rules as written (the modes rule), so StarCraft II has 49 units, not 50.
- **Every site the batch would cite passed the plant test,** except two that cannot be tested this way and three that refuse requests (section 2).
- **Liquipedia:** the official StarCraft II unit descriptions can be read only there, and its terms do not allow automated reading of its pages. Mustafa has not decided yet how it is read (section 3).
- **Not put in:** the editors' notes and their 30 registry edits are saved here, but `research/registry-notes/games-r4.md` and `data/games.json` are untouched, as Mustafa asked. No unit was coded.
- **Eight questions wait for Mustafa** (section 6), with the Liquipedia decision.

## What each file holds

- `prep-<game>.json`: one game's result from [`research/workflows/prep.js`](../../workflows/prep.js):
  - `notes`: a researcher's draft of the game's official role lines, its game-wide mechanics, its registry findings, other notes for the unit researchers, and the pages read;
  - `verdicts`: a skeptic's check of every claim in the notes, each marked as holding or not, with a correction where it does not, plus the points the notes missed (`missing`);
  - `candidates`: the candidate units, each with what it teaches, its pattern ids, its pages and a line on how it would play.
- `editors.json`: one editor per game, from [`research/workflows/notes-and-trim.js`](../../workflows/notes-and-trim.js). Each applied the skeptic's corrections and returned the final texts for the notes file (`role_lines`, `game_wide`, `research_notes`), the lines of the notes file that those texts replace (`remove_from_existing`), exact edits of the game's registry entry (`registry_edits`), questions for Mustafa (`open_questions`) and what it changed against the draft (`changes`).
- `trim.json`: the one judge's unit list for the batch: `keep` (each with a one-line brief for its researcher), `cut` (each with its reason), `coverage`, and `new_patterns` (27 mechanics in the kept units that no pattern id covers yet).
- `integrate-notes.mjs`: the script that puts the editors' texts into the notes file and their edits into the registry (section 7). It was tried without writing, never run for real.
- [`../tool-problems.md`](../tool-problems.md): the tool problems the agents reported, apart from their hesitations.

| Game | Registry findings | Claims checked | Corrected | Missing points | Candidates | Kept | Registry edits | Questions |
|---|---|---|---|---|---|---|---|---|
| StarCraft II (`sc2`) | 2 | 64 | 7 | 8 | 49 | 49 | 2 | 1 |
| Halo Wars (`hw1`) | 1 | 46 | 14 | 8 | 15 | 9 | 1 | 1 |
| Halo Wars 2 (`hw2`) | 4 | 68 | 14 | 11 | 14 | 9 | 14 | 1 |
| Planetary Annihilation: TITANS (`pa`) | 5 | 66 | 19 | 12 | 14 | 9 | 7 | 2 |
| MechWarrior / BattleTech (`mechwarrior`) | 4 | 52 | 8 | 10 | 14 | 9 | 6 | 3 |

**Changed after the agents returned them:** - Paths of the session's machine were replaced by plain words.
- The copy-check found 136 runs of six words or more that the texts share with web pages, many of them one list of object names counted several times. A check by hand against the two cited PDF files (the Halo Wars manual and its tech-tree chart) found 4 more. Most were names in a page's order, object names from the game data, titles of posts and rows of figures from tables. Each was reworded: the names put in another order, the title described, the figures given with their labels.
- One line of the editors' removal list was brought in step with the notes file, where the same list of names had been reworded.
- Text only. No id, page address or figure changed, and no proposed registry value except the wording of two sentences in the drafted Halo Wars entry.

## 1. The unit list

### StarCraft II: 49 units, in full

- **Terran (15), in the order of the alphabet:** Banshee, Battlecruiser, Cyclone, Ghost, Hellion (with the Hellbat as its second mode), Liberator, Marauder, Marine, Medivac, Raven, Reaper, Siege Tank, Thor, Viking, Widow Mine.
- **Zerg (16), in the order of the alphabet:** Baneling, Brood Lord, Corruptor, Hydralisk, Infestor, Lurker, Mutalisk, Overlord, Overseer, Queen, Ravager, Roach, Swarm Host, Ultralisk, Viper, Zergling.
- **Protoss (18), in the order of the alphabet:** Adept, Archon, Carrier, Colossus, Dark Templar, Disruptor, High Templar, Immortal, Mothership, Observer, Oracle, Phoenix, Sentry, Stalker, Tempest, Void Ray, Warp Prism, Zealot.

Left out by the plan's closed list: the three workers, the MULE, the Larva and the Cocoon; the Changeling, Locust, Broodling and Interceptor are coded with the Overseer, Swarm Host, Brood Lord and Carrier.

**The Hellion and the Hellbat: one unit** (`sc2.terran.hellion`, with the Hellbat as its second mode). The rule that decides is the modes rule in `docs/fields.md`: a second form that changes how the unit moves or what it is, is a mode; and when a unit can be built in either form, its base form is the one whose name the unit carries. Every Hellion can switch to Hellbat and back with one button, the switch changes how it moves and what it is, and the shared button carries the Hellion's name. The researcher and the judge agree. If Mustafa wants the Hellbat as a unit of its own, the count becomes 50.

### The other four games: 9 kept each, and every cut with its reason

**Halo Wars** (15 candidates, 9 kept)

- Kept: Arbiter, Banshee, Brute Chieftain, Cyclops, Elephant, Ghost, Hunter, Prophet of Regret, Vampire.
- Cut: **Spartan**. Same line as the kept Halo Wars 2 Jerome-092. Halopedia's Red Team page says the Halo Wars 2 Spartans act almost as in Halo Wars but add the EMP hold, the Spartan Slam and a takeover cancelled by death, so the line stays in Halo Wars 2; this version's extras (three per army, outside the population cap) go in Jerome's notes.
- Cut: **Gremlin**. Its EMP that stops a vehicle from firing repeats the kept StarCraft II Raven's Interference Matrix (disable-machine, weapons-lock variant) and the data's Terror Drone, and the chain upgrade is the trait the Voltaic Tank already has. It is Anders' only unique unit, so Halo Wars keeps the units of two of its three UNSC leaders.
- Cut: **Locust**. Overdrive spends its shield on beam damage, one more cost for overclock-self, which the kept Marine, Void Ray, Arbiter and Executioner already carry, and standing still to fire repeats the kept Siege Tank's and Lurker's stop-to-fight lesson; fire-when-stopped is not proposed from this batch. Halo Wars 2's Locust is the same line without Overdrive.
- Cut: **Cobra**. Its lockdown into long-range artillery repeats the kept Siege Tank (deploy-siege-mode is the data's most used pattern), and its piercing railgun rounds are a weapon trait. deploy-siege-mode's pattern file names it as an example, but that id is well covered.
- Cut: **Jackal**. A cheap shielded rifleman that links no pattern: its gauntlet shield is an armour model and its anti-infantry job is common in the data.
- Cut: **Scarab**. Same line as the kept Halo Wars 2 Scarab, which adds the plasma-shield invulnerability, Thrasher missiles and Skitterer riders; the Halo Wars cap of two goes in that entry's notes. Cutting it leaves Halo Wars with no tier-3 unit, since it was the game's only tier-3 candidate.

**Halo Wars 2** (14 candidates, 9 kept)

- Kept: Colossus (Mark II (J) heavy mech, Sergeant Johnson's), Hunter Captain (Mgalekgolo Captain, Colony's hero), Jackrabbit (M121 scout vehicle), Jerome-092 (Red Team Spartan hero; Alice-130 and Douglas-042 are the same unit for two other leaders), Kinsano's Cyclops (Kinsano's flamer exosuit hero), Methane Wagon (Yapyap's support wagon), Scarab (Banished super unit), Shroud (Banished support aircraft), Skitterer (Colony's scout walker).
- Cut: **Condor (G81 heavy gunship, the UNSC super unit)**. A slow flying fortress with a slow power shot repeats the kept Battlecruiser (capital ship, fire-power-shot); its dodgeable shells are a weakness note. The kept Scarab already fills Halo Wars 2's super-unit tier.
- Cut: **Protector Sentinel (Forerunner flier under Professor Anders)**. Its two escort Sentinels repeat launch-drones (the kept Swarm Host and Jackrabbit, and the kept Prophet of Regret, whose escorts are this same Sentinel), its stun bolt is a weapon trait and its slowing death pulse an on_death note.
- Cut: **Engineer (Huragok, Banished support flier)**. Its healing repeats the kept Medivac, and its stacking shield, which Halopedia's Info line says cuts the damage taken inside it, repeats the kept Sentry's Guardian Shield and Infestor's Microbial Shroud; the kept Immortal already carries raise-shield. Halo Wars' Huragok is the same line, so neither game keeps it.
- Cut: **Pavium (Awakening the Nightmare leader's hero)**. His paint that slows enemies and strips their armour repeats the kept StarCraft II Raven's armour-lowering missile and the MechWarrior Raven's TAG (mark-target); his reflecting shield repeats retaliate-on-hit, and his structure repair and healing drones repeat repair-allies and launch-drones.
- Cut: **Warlord (Jiralhanae Warlord, Decimus's hero)**. His gravity pull repeats the kept Viper's Abduct and Phoenix's lift (pull-target), and he is the same hammer-brute line as the kept Halo Wars Brute Chieftain, whose vortex teaches more; heal-on-hit is on the kept Hunter Captain.

**Planetary Annihilation: TITANS** (14 candidates, 9 kept)

- Kept: Astraeus, Atlas, Bluehawk, Commander, Icarus, Locusts, Manhattan, Nyx, SXX-1304 Laser Platform.
- Cut: **Stitch**. Repairs, mines and teleporters repeat the data's Iron Harvest Engineer, the kept Widow Mine and the kept Commander, which builds teleporters too (build-linked-exits); its mine sight is a detector fit note.
- Cut: **Gil-E**. A long-range sniper repeats the data's Jarmen Kell and the kept Ghost and Tempest, and its beam that downs missiles repeats the kept Shroud's point defence. First swap if Planetary Annihilation needs a medium-price unit or a marksman.
- Cut: **Kaiju**. A hover gunboat from the naval yard teaches little beyond its class and terrain, and hover is already common in the data and in this batch. First swap if a high-price or naval-yard unit is wanted.
- Cut: **Angel**. Its repair aura repeats the kept Medivac, its reclaim repeats gather-resources (the kept Commander reclaims), and its beam that downs missiles repeats the kept Shroud's point defence.
- Cut: **Helios**. A flying far end of the team's teleporter repeats the kept Warp Prism's forward arrival point and the data's Thunderhead (build-linked-exits); the kept SXX-1304 already teaches the orbital layer and the kept Atlas the titan tier.

**MechWarrior / BattleTech** (14 candidates, 9 kept)

- Kept: Atlas (AS7-D), Catapult (CPLT-C1), Dire Wolf (Daishi) Prime, Elemental, Executioner (Gladiator) Prime, Firestarter (FS9-H), Hatchetman (HCT-3F), Phoenix Hawk LAM (PHX-HK2), Raven (RVN-3L).
- Cut: **Piranha**. Its anti-infantry machine guns repeat the kept Firestarter's job and a weapon common in the data, and its rear-armour hunting and component wrecking lean on armour rules that are game-wide for every 'Mech. First swap if a very fast light raider or a dedicated counter to the Elemental is wanted.
- Cut: **Nova (Black Hawk) Prime**. Firepower capped by heat is game-wide (every 'Mech uses the heat resource), so it adds a strengths-and-weaknesses note rather than a mechanic.
- Cut: **Barghest (BGS-1T)**. Tabletop only; four legs are already in the data (Iron Harvest walkers, the Sickle), its solid-or-cluster ammunition switch repeats switch-weapon-mode (the kept Thor), and its fixed torso with a sidestep is a word-list gap for the rule-fix round.
- Cut: **Timber Wolf (Mad Cat) Prime**. Iconic, but its pod configurations are loadout picks that every kept OmniMech (Executioner, Dire Wolf) carries too, and its LRMs repeat the kept Catapult.
- Cut: **135-K "Lifesaver" Coolant Truck**. Tabletop only, and its cooling of overheated 'Mechs exists only in design text with no game rule, so no source shows how it plays. Cutting it leaves House Kurita and a MechWarrior vehicle uncovered; first swap if the generator wants a heat-support partner for the Firestarter.

## 2. The sites the batch would cite, with their plant-test results

The plant test (`npm run plant-test`) takes passages of ten words from the page as a reader sees it, plants them in a throwaway record that cites the page, and counts how many the copy-check flags. A site passes when all are flagged.

| Game | Site | Page tested | Result | Reader's view |
|---|---|---|---|---|
| StarCraft II | starcraft.fandom.com | Marine (StarCraft II) | 5 of 5 | the wiki's rendered page (it answers a headless browser with HTTP 403) |
| StarCraft II | news.blizzard.com | the 5.0.17 patch notes | 5 of 5 | browser |
| StarCraft II | liquipedia.net | Raven and Reaper (Legacy of the Void), from the page cache | 5 of 5 each | the cached rendered page; no request was made |
| Halo Wars, Halo Wars 2 | www.halopedia.org | Firebase, UNSC Vehicle Depot, XRP12 Gremlin, Season 15, UNSC Garage | 5 of 5 each | browser |
| Halo Wars, Halo Wars 2 | halo.fandom.com | Standard (Halo Wars) | 5 of 5 | the wiki's rendered page (403 for the browser) |
| Halo Wars | news.xbox.com | the Definitive Edition post of December 2016 | 5 of 5 | browser |
| Halo Wars | Steam news feed of the Definitive Edition (api.steampowered.com, app 459220) | the feed | 5 of 5 | the posts its community page shows in a browser |
| Halo Wars 2 | www.halowaypoint.com | the news post "Lovely Letters" | 5 of 5 | browser |
| Planetary Annihilation | palobby.com | the Dox's unit page and its blueprint view | 2 of 2 and 3 of 3 (short pages) | browser |
| Planetary Annihilation | planetaryannihilation.fandom.com | Planetary Annihilation | 5 of 5 | the wiki's rendered page (403 for the browser) |
| Planetary Annihilation | store.steampowered.com | the game's store page | 5 of 5 | browser |
| Planetary Annihilation | Steam news feed (api.steampowered.com, app 386070): the patch notes | the feed | 5 of 5 | the posts its community page shows in a browser |
| MechWarrior | www.sarna.net (BattleTechWiki) | Centurion (BattleMech) | 5 of 5 | browser |
| MechWarrior | mwo.fandom.com | Centurion CN9-A | 5 of 5 | the wiki's rendered page (403 for the browser) |
| MechWarrior | mwomercs.com | patch notes 3116 | 5 of 5 | browser (its home page gave 4 of 5: the miss is a cookie notice that a script draws) |
| MechWarrior | mw5clans.com | the patch notes of February 2026 | 5 of 5 | browser |

Not testable this way, or not citable:

- **The Halo Wars game data** on raw.githubusercontent.com: a data file has no line of prose to plant. Cite figures and tag names from it, never prose.
- **The Halo Wars manual and tech-tree chart** (PDF files on halo.wiki.gallery): the copy-check cannot read a PDF. They are checked by hand with `pdftotext` and a six-word check, as in R3.
- **Steam's own pages of a post** hold no post text for these games. The news feed is cited instead, with the post's title and date.
- **Halo Waypoint's Halo Wars 2 game page and three posts of 2017** answer HTTP 500: not citable.
- **planetaryannihilation.com** and **the new Master Unit List site** (masterunitlist.battletech.com) refuse requests (HTTP 403): not cited. The second one matters: it is the only official place that gives a 'Mech's role, so no MechWarrior unit has an official role line today (question MW-3 in section 6).
- **web.archive.org** reset every connection from this session, so no archived page could be read.

## 3. Liquipedia: how it may be read

**What its terms say** (liquipedia.net/api-terms-of-use, read on 11 November 2026), in my words:

- Its web pages may not be read by automated tools at all.
- Its wiki API is meant for people who edit the wiki; other use is "not supported". For using its data it points to a separate data API that needs an approved request.
- Through the wiki API: at most one request every 2 seconds, and at most one request that renders a page every 30 seconds; a User-Agent that names the project and gives a contact; compressed answers; one IP address; keep what you fetched.
- Its text is under CC-BY-SA 3.0: say that it comes from Liquipedia.
- Breaking the terms brings automatic temporary bans.

**Why it matters more than expected.** The prep found that the game's own unit description and its "strong against" and "weak against" help lists can be read only on Liquipedia. The StarCraft Wiki does not carry them, Blizzard's site has no unit pages, and the old Battle.net unit guide sits on web.archive.org, which this session cannot reach. Only 8 unit pages of Liquipedia are in the page cache (Baneling, Carrier, Raven, Reaper, Swarm Host, Warp Prism, Ravager, Void Ray). So without Liquipedia, 41 of the 49 units have no readable official role line. The roles rule then goes on to its next steps (what the unit is and does), and each of those units gets a note of doubt at its main role.

**What already happened, so you know it.**

- October (step 1): a session was blocked for a time after a few quick search calls.
- 11 November, before I had read the terms: one page opened in a headless browser (the site answered with a rate-limit notice), three or four page-rendering requests by the copy-check during the site test, and 36 more, 31 seconds apart, for the rendered versions of the 35 Liquipedia pages the data already cites. All went through the API except the one browser page. The User-Agent named the tool but gave no contact.
- Since then the copy-check, the plant test and the page reader refuse to ask Liquipedia for anything. They would do so only after two switches are set: the site named as allowed, and a contact given. Its pages are never fetched as web pages, and the tools wait 30 seconds between rendering requests. The prep's agents were told to request nothing from it, and none did.

**Options.**

- **A (recommended): do not read Liquipedia for R4.** Units cite the StarCraft Wiki and Blizzard's patch notes; the cached pages stay citable. Cost: 41 units without an official role line, each with a note of doubt, which the merge pass can revisit.
- **B: read it through its wiki API within the stated limits.** One queue run by the session, one rendering request every 30 seconds, each page once, with a contact in the User-Agent that you choose. About 50 unit pages take 25 minutes. The terms call this use "not supported", so a ban stays possible. I do not recommend it without Liquipedia's word.
- **C: ask Liquipedia** (its Discord, or a request for its data API). Only you can do that, and it may take days. It can run beside A: if they agree, the merge pass reads the official lines then.

## 4. Tokens: what the prep cost, and what changes the estimate

Agent tokens, as the harness counts them. The session's own use is not in these figures.

| Part | Agents | Tokens |
|---|---|---|
| Prep of five games (a researcher, a skeptic and a candidates researcher each) | 15 | 7.05 million (1.2 to 1.6 million per game) |
| Editors for the notes and registry edits (five), and the one judge for the trim | 6 | 3.04 million |
| Review of the tool changes (one reviewer, three passes) | 1 | 1.14 million |
| **Prep in all** | | **11.2 million** |

What changes the estimate for the rest of R4 (it was 100 to 135 million tokens for about 86 units):

- **85 units, not 86** (the Hellbat is a mode). No real change.
- **Reading pages costs less than in R3.** The new page reader gives a page as plain text; a wiki page fetched as a web page is ten to twenty times that size. The pages of every StarCraft II unit on the StarCraft Wiki, of every Planetary Annihilation unit on PA Lobby, and most Halopedia pages the units need are already in the page cache.
- **The prep cost a little more than I guessed** (about 9 million was my guess for R3's prep and opening check together).
- **Liquipedia** changes waiting time, not tokens, if option B is ever chosen.
- I keep the estimate at **100 to 135 million tokens**, with the lower half now more likely. The yardstick for the StarCraft II fill stays as you set it: 0.44 million tokens per unit, stop and ask above 0.66 million.

## 5. Tool problems

The agents reported 46 tool problems apart from their hesitations. They are in [`../tool-problems.md`](../tool-problems.md), to be read before the merge pass, as Mustafa asked. Three were faults of the repository's own tools and are fixed.

## 6. Questions the prep raised for Mustafa

Each is as its editor wrote it, with options and a recommendation. No unit is coded yet, so nothing depends on an answer while R4 is parked.

1. (StarCraft II) VR-1, the StarCraft II version line in the games registry. The line you approved on 11 November says the units are described by Liquipedia, the StarCraft Wiki and Blizzard's patch notes in October 2026. Batch R4 reads its pages in November and reads Liquipedia only from the page cache until you decide how Liquipedia may be read. Why it matters: the line should say where the facts come from; no band and no unit changes either way. Options: (A) keep the line until your Liquipedia decision, then adjust it once; (B) change it now to name the StarCraft Wiki, Blizzard's patch notes and the cached Liquipedia pages, read in November 2026. Recommendation: A. Patch 5.0.17 is still the newest, so what the line describes has not changed, and your Liquipedia decision may change the wording again.

2. (Halo Wars) HW1-LEADERS: should Halo Wars' six leaders be subfactions? The question: the drafted registry entry lists Sergeant Forge, Captain Cutter, Professor Anders, the Arbiter, the Brute Chieftain and the Prophet of Regret as subfactions of the UNSC and the Covenant (as Red Alert 2's countries and Generals' generals are), while Halo Wars 2 keeps two factions and names its leaders in notes. Why it matters: it sets the unit ids and factions for the whole hw1 batch (hw1.cutter.elephant or hw1.unsc.elephant). Options: (A) subfactions, as drafted: each leader fields units the others lack (Elephant and ODSTs; Cyclops and Grizzly; Gremlin and Hawk; Suicide Grunts; Brutes and the Brute Chopper; Elite Honor Guard), the three Covenant leaders are units themselves, the Chieftain's Grunt squads differ, and Halopedia calls the leaders sub-factions; the candidate list's ids then move to the leaders (hw1.anders.gremlin, hw1.arbiter.arbiter). (B) two factions, as Halo Wars 2: leaders named in notes and tier.basis, ids stay as the candidate list has them, and the six leader entries, the research notes' subfaction bullet and the Temple gate's tag become simpler. Recommendation: A. Halo Wars has only six fixed leaders, each with its own units, and three of them fight as units; Halo Wars 2 stays two factions because its sixteen leaders mostly swap one or two units.

3. (Halo Wars 2) HW2-LEADERS: should Halo Wars 2's 16 multiplayer leaders become subfactions in the games registry? Why it matters: the Halo Wars (hw1) entry drafted in this same prep lists its six leaders as subfactions, while step 1 kept Halo Wars 2 to two factions (unsc and banished) and names the leader only in tier.basis, so the two Halo Wars games would record leader units differently; it changes unit ids (hw2.unsc.grizzly against hw2.forge.grizzly), not bands. Options: (A) add the leaders as subfactions with parent unsc or banished (Pavium and Voridus with introduced_in hw2-awakening-the-nightmare), with a leader's own unit under its leader and a unit several leaders field under the side, as the Halo Wars entry and Generals do; (B) keep two factions, as now. Recommendation: one rule for both Halo Wars games, so A if the Halo Wars entry keeps its subfactions; no hw2 unit is coded yet, so the change costs only ids.

4. (Planetary Annihilation: TITANS) PA-ORBIT (orbital units). Question: should the word lists get terms for Planetary Annihilation's orbital layer, a layer of units above the planet that only special weapons can hit? Today there is no orbital class, mobility type or target kind. Why it matters: three of the PA candidates (Astraeus, SXX-1304 Laser Platform, Helios) are orbital, and every orbital unit and every weapon that hits orbit would carry a fit_note and some rule breaks. Options: A) keep the interim coding written in the game notes (class aircraft; mobility jet when the unit is fast or very fast, otherwise airship; a weapon that hits only orbit lists no target kind; fit_notes name the gap) and decide at the merge pass with the coded evidence; B) add an orbital target kind and an orbital mobility type now, before the PA fill (a word-list change that needs your approval); C) leave orbital units out of batch R4. Recommendation: A. The interim coding keeps the facts and the gap in view, a top-down shooter may never need a separate orbital layer, and the merge pass can show you how often the gap came up.

5. (Planetary Annihilation: TITANS) PA-ANCHOR (PA's cost anchor). Question: should PA's cost bands stay anchored on the Leveler (the T2 assault tank, 800 metal) although official text, the balance post of 11 April 2022 on Steam, calls the Ant (the T1 light tank, 150 metal) the game's intended main battle tank? The cost method says to anchor on the game's standard main battle tank. Why it matters: the anchor sets every PA unit's cost band, and the field rules also read the game's main battle tank for the heavy armour class and for the assault role's range test. Options: A) keep the Leveler, with the reason written into the registry basis (one of these registry edits): bands spread from very low to very high, and the Ant stays a light tank with medium armour; B) anchor on the Ant: thresholds 75, 135, 210 and 300, so 46 of the 69 buildable mobile units, every T2 unit among them, land in very high, and the Ant becomes heavy as the main battle tank. Recommendation: A, because cost bands exist to tell a game's units apart, and the Leveler anchor also matches Supreme Commander's.

6. (MechWarrior / BattleTech) MW-1, fast light 'Mechs and the raider role. The armour map makes light 'Mechs medium armour (the armour-class word list puts light mechs bigger than a soldier in medium), and the raider role needs light or no armour. So by the rules as written no 'Mech is ever a raider: a fast light 'Mech with only guns ends as assault (or anti-infantry, when its main weapon is machine guns or flamers), and one with TAG, a Narc beacon or an active probe is a scout only as its second role. A 6/9 light 'Mech such as the Raven also runs exactly 1.5 times the reference speed, which the edge rule makes medium, not fast. Why it matters: it decides the roles of the light 'Mechs R4 keeps, such as the Raven, the Firestarter or the Piranha. Options: (A) code R4 by the rules as written and take the question to the rule-fix round planned after R4's merge; (B) change the registry's armour map now so light 'Mechs are light armour, which makes the fast ones (7/11 or faster) raiders at step 5. Recommendation: A. Option B goes against the word list's description of medium armour and changes how every light 'Mech's armour reads for the generator, so it belongs with the other rule questions.

7. (MechWarrior / BattleTech) MW-2, battle armour riding on OmniMechs. Most OmniMechs have handholds that let up to six friendly battle armour suits ride on the outside (twelve on superheavy 'Mechs). The notes give the 'Mech no passenger seats and record the riding on the battle armour. Why it matters: counted as seats, the handholds would give most OmniMechs (the Timber Wolf, Nova, Executioner and Dire Wolf among them) a passenger passive, and two or more seats make transport a candidate second role. Options: (A) no seats: crew.notes says that the OmniMech can carry riders; (B) count the handholds as six passenger-cargo seats on every OmniMech that has them. Recommendation: A. The riders cling on outside and fight on their own, a standard 'Mech carries them only when the riders bring magnetic clamps, and MechWarrior 5: Clans' Elementals do not ride friendly 'Mechs in the pages read, so the riding is the battle armour's mechanic.

8. (MechWarrior / BattleTech) MW-3, reading the Master Unit List. The MUL, Catalyst Game Labs' official unit database, is the only official source of a 'Mech's role. Its new site refuses automated reading (HTTP 403 on 11 November 2026), and the old site's links are dead, so roles step 1 never decides for this game. Why it matters: of the MUL's eight ground roles only Scout can give one of our roles (Sniper fails marksman's rule, since 'Mech weapons fall in other families, the Gauss rifle in our railgun family for example), so only a 'Mech the MUL calls a scout, and that is fast or has an information part such as TAG, would change, from assault to scout first. Options: (A) code without the MUL, with an uncertain entry at roles/primary on each unit, as the notes say now; (B) someone reads the MUL role of each kept 'Mech (about 9) in a normal browser before the fill, and the coders cite those MUL pages; (C) ask Catalyst Game Labs whether automated reading is allowed. Recommendation: A for R4. The change would reach only the few 'Mechs the MUL calls scouts, the uncertain entries record the gap, and a page read by someone other than the coder does not meet the sources rule, which wants the page the coder read.

## 7. How to go on with R4

Only when Mustafa says so. The procedure is [docs/research-runbook.md](../../../docs/research-runbook.md), section 1 (the prep), from its step 4.

1. **Get his answers** to the eight questions of section 6 and to the Liquipedia decision of section 3. Where he gives none, the runbook says to take the recommended option and record it.
2. **Check that the prep still holds.** The games change: StarCraft II was at patch 5.0.17, Planetary Annihilation's last patch was of 8 October 2026, and MechWarrior Online is patched every month. Read each game's newest patch notes, and run the plant test again on one page of every site (`npm run plant-test -- <page address>`).
3. **Put the editors' work in:** `node research/r4/prep/integrate-notes.mjs . research/r4/prep/editors.json --dry` shows what would change; without `--dry` it writes the notes file and the registry. It stops if a line it should remove is no longer in the notes file. Then apply his answers by hand where they differ from the editors' drafts (the Halo Wars entry lists its six leaders as subfactions, for example).
4. **Run the checks:** `npm run format`, `npm run docs`, `npm run check:merge`, and the copy-check on `research/r4` and the registry notes.
5. **Commit the prep,** open the batch's pull request, and go on with the fill. Mustafa's fill rule for StarCraft II is in [docs/handoff.md](../../../docs/handoff.md): one race at a time, with a report after the first race.
