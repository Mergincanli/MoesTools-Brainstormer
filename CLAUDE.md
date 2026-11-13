# Unit Forge: notes for Claude

Unit Forge is a research database of real RTS and shooter units, and later a generator and an app, built for Mustafa's game Shamble Frontlines. The brief is [docs/brief.md](docs/brief.md) and the plan is [docs/proposal.md](docs/proposal.md). The current state and what to do next are in [docs/handoff.md](docs/handoff.md): read it first while it exists. The research procedure is [docs/research-runbook.md](docs/research-runbook.md).

## Working with Mustafa

- Write in plain words, with short sentences. He uses speech to text, so read his messages for meaning.
- Reports and pull-request descriptions:
  1. start with `## TL;DR`;
  2. then "Decisions needed", each item self-contained, with options and a recommendation;
  3. then "For Mustafa".
- Keep token use efficient: run at most two workflows at once, and reuse saved results before re-running agents.
- He approves the plan, the word lists and the field rules. Ask him when a choice is his.

## Rules for the data and the repository

- **Never change the word lists or field rules without his approval**, recorded in the commit message. They are `data/vocab/`, `schemas/`, the Conventions text in `scripts/build-docs.mjs` and the rule checks in `scripts/validate.mjs`. Before a push, `git diff --name-only origin/main...HEAD -- data/vocab schemas scripts/build-docs.mjs scripts/validate.mjs` must print nothing that lacks that approval.
- **Paraphrase only:** never six or more words in a row copied from a page. Before committing research text, run `npm run copy-check -- --also research/r<N> --also research/registry-notes`. Check cited PDF manuals by hand (`pdftotext`, then a six-word check). Then search for local paths with `grep -rnE "file://|/home/user|/tmp/|scratchpad" research/r<N>`. Reword text only, never a coded value.
- No images. No AI model names in files, commits or pull-request text.
- Run `npm run check:merge` before every push; CI runs `npm run check`. After a JSON edit run `npm run format`; after a data change run `npm run docs`, `npm run manifest` and `npm run cards`.
- **Git:**
  - work on the batch's branch (`claude/quirky-cray-tih1w4` for R3, pull request #6);
  - add files by name, never `git add -A`;
  - never push to `main`, never force-push or rewrite history;
  - merge with a merge commit, never a squash, so the commit hashes the records cite stay reachable.
- Never explore credentials or proxy internals.
