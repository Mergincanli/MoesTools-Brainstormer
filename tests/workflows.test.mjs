// Tests for the research workflow scripts (research/workflows/*.js): each runs here with stand-ins for the
// workflow tool's hooks, and every agent it starts must get a notes folder of its own, so an agent cut off part way
// goes on from its notes when the run is resumed (docs/research-runbook.md, "Progress notes"). The scripts whose
// agents only read the repository refuse to run without args.progress.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { REPO_ROOT } from '../scripts/validate.mjs'

const DIR = path.join(REPO_ROOT, 'research/workflows')
const AsyncFunction = (async () => {}).constructor
const P = '/scratch/r9/progress/test'
const HOME = '/home/user/MoesTools-Brainstormer' // the repository path the read-only scripts name
const ws = name => `/scratch/r9/x/ws-${name}`

// A value that fits the schema: one item in every array, true for every boolean and the last term of every enum,
// so that each script's later stages (skeptic, fixer) run too.
function fill(schema) {
  if (!schema) return 'x'
  if (schema.enum) return schema.enum[schema.enum.length - 1]
  if (schema.type === 'object') return Object.fromEntries(Object.entries(schema.properties || {}).map(([k, v]) => [k, fill(v)]))
  if (schema.type === 'array') return [fill(schema.items)]
  if (schema.type === 'boolean') return true
  return 'x'
}

// Runs a script with the hooks it uses and returns the prompts its agents got.
async function run(file, args) {
  const prompts = []
  const hooks = {
    args,
    agent: async (prompt, opts = {}) => { prompts.push({ label: opts.label, prompt }); return opts.schema ? fill(opts.schema) : 'x' },
    parallel: thunks => Promise.all(thunks.map(t => t().catch(() => null))),
    pipeline: (items, ...stages) => Promise.all(items.map(async (item, i) => {
      let r = item
      for (const stage of stages) { try { r = await stage(r, item, i) } catch { return null } }
      return r
    })),
    phase: () => {},
    log: () => {},
  }
  const body = fs.readFileSync(path.join(DIR, file), 'utf8').replace(/^export const meta/m, 'const meta')
  await new AsyncFunction(...Object.keys(hooks), body)(...Object.values(hooks))
  return prompts
}

const BATCH = { id: 'r9', scope: 'test games' }
const SCRIPTS = {
  'checker.js': { readOnly: true, args: { batch: BATCH, seed: 's', repo: '/repo', groups: [{ label: 'u-a', units: ['a.b.c'], patterns: [] }, { label: 'p1', units: [], patterns: ['p'] }] } },
  'code-units.js': { args: { batch: BATCH, mode: 'fill', jobs: ['j1', 'j2'].map(label => ({ label, agent: label, game: 'g', ws: ws(label), units: [{ id: 'g.f.u', brief: 'b' }] })) } },
  'reconcile.js': { args: { batch: BATCH, units: ['u1', 'u2'].map(id => ({ id, game: 'g', ws: ws(id), a: 'a', b: 'b', reportA: 'ra', reportB: 'rb', diff: '' })) } },
  'patterns.js': { args: { batch: BATCH, groups: ['g1', 'g2'].map(label => ({ label, ws: ws(label), patterns: [{ id: 'p', kind: 'new', summary: 's', units: ['u'] }] })) } },
  'final-review.js': { readOnly: true, args: { batch: BATCH, draft: 'd', dimensions: ['data', 'record'] } },
  'verify-fixes.js': { readOnly: true, args: { batch: BATCH, findings: 'f', since: 'abc', draft: 'd', angles: ['closure', 'claims'] } },
  'prep.js': { readOnly: true, args: { batch: BATCH, game: { id: 'g', name: 'G', scope: 's', want: 'w', notesTask: 't' } } },
  'notes-and-trim.js': { readOnly: true, args: { batch: BATCH, dir: '/d', games: [{ id: 'g', name: 'G', existing: '' }, { id: 'h', name: 'H', existing: '' }], trim: true, keep: 'k' } },
}

describe('workflow scripts', () => {
  it('covers every script in research/workflows', () => {
    assert.deepEqual(Object.keys(SCRIPTS).sort(), fs.readdirSync(DIR).filter(f => f.endsWith('.js')).sort())
  })

  for (const [file, { readOnly, args }] of Object.entries(SCRIPTS)) {
    it(`${file}: every agent keeps its notes in a folder of its own`, async () => {
      const prompts = await run(file, readOnly ? { ...args, progress: P } : args)
      assert.ok(prompts.length >= 2, `only ${prompts.length} agents ran`)
      const dirs = prompts.map(({ label, prompt }) => {
        assert.match(prompt, /## Saving your progress/, label)
        const dir = prompt.match(/keep notes in (\S+)\/progress\.md/)?.[1]
        assert.ok(dir, `${label}: no notes folder`)
        const root = readOnly ? P : ws(label.split(':')[1])
        assert.ok(dir.startsWith(readOnly ? `${P}/` : `${root}/.progress/`), `${label}: notes in ${dir}`)
        assert.ok(prompt.includes(`${readOnly ? args.repo || HOME : root}/.cache/sources/`), `${label}: no page cache`)
        return dir
      })
      assert.equal(new Set(dirs).size, dirs.length, `two agents share a notes folder: ${dirs.join(', ')}`)
    })

    if (readOnly) {
      it(`${file}: refuses to run without args.progress`, async () => {
        await assert.rejects(run(file, args), /args\.progress is required/)
      })
    }
  }
})
