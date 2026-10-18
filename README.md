# Unit Forge

A creativity tool for designing units for **Shamble Frontlines**, a browser team shooter with a top-down camera where every player buys and *becomes* a unit. Unit Forge turns a researched database of real RTS and shooter unit designs into randomly combined, original unit concepts. You save them on a board, refine them, and export them as Markdown for design docs and as JSON for a later import into the game. It works like a morphological box: break units into building blocks, then recombine them.

## Status

**The brief's first step (section 7 of the brief): proposal, approved on 18 October 2026** (decisions 1B 2A 3C 4B 5B 6C 7B 8B 9A). Nothing is built yet beyond draft data and schemas.

- [Proposal](docs/proposal.md): the plan, repository structure, decisions needed. Start here.
- [Samples](docs/samples.md): three researched units (RA3 Terror Drone, Hammer Tank, Multigunner IFV), three mechanic patterns and an example concept card.
- [Vocabularies](docs/vocabularies.md): the fixed word lists every record uses.
- [Fields](docs/fields.md): every field of every record type.

## Layout

| Folder | Contents |
|---|---|
| `data/` | Games registry, pattern registry, word lists, researched units, mechanic patterns (JSON). |
| `schemas/` | JSON Schemas for every record type. |
| `docs/` | Proposal and generated reference pages. |

## Rules for the data

Paraphrase only, cite every claim with a confidence level, no images. Real unit names are reference only; generated concepts always get original names.
