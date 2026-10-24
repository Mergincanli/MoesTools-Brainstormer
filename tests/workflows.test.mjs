// Tests for the research workflow scripts (research/workflows/*.js): each runs here with stand-ins for the
// workflow tool's hooks, and every agent it starts must get a notes folder of its own, so an agent cut off part way
// goes on from its notes when the run is resumed (docs/research-runbook.md, "Progress notes"). The scripts whose
// agents only read the repository refuse to run without args.progress. Every stage must run, and an agent that
// returns nothing must leave its item in the script's failed or unverified list. mkws.sh, which deletes the folder
// it is given, must refuse any path but a workspace folder.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, it, after } from 'node:test'
import { REPO_ROOT } from '../scripts/validate.mjs'

const DIR = path.join(REPO_ROOT, 'research/workflows')
const MKWS = path.join(DIR, 'mkws.sh')
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

// Runs a script with the hooks it uses. Returns the prompts its agents got, the script's result and the errors its
// stages threw: the workflow tool turns such an error into null, so a later stage that crashes shows only there. The
// agent labelled `skip` returns nothing, as one does when the user skips it or it dies on an API error.
async function run(file, args, { skip } = {}) {
  const prompts = []
  const errors = []
  const hooks = {
    args,
    agent: async (prompt, opts = {}) => {
      prompts.push({ label: opts.label, prompt })
      return opts.label === skip ? null : opts.schema ? fill(opts.schema) : 'x'
    },
    parallel: thunks => Promise.all(thunks.map(t => t().catch(e => { errors.push(e); return null }))),
    pipeline: (items, ...stages) => Promise.all(items.map(async (item, i) => {
      let r = item
      for (const stage of stages) { try { r = await stage(r, item, i) } catch (e) { errors.push(e); return null } }
      return r
    })),
    phase: () => {},
    log: () => {},
  }
  const body = fs.readFileSync(path.join(DIR, file), 'utf8').replace(/^export const meta/m, 'const meta')
  const result = await new AsyncFunction(...Object.keys(hooks), body)(...Object.values(hooks))
  return { prompts, result, errors }
}

const BATCH = { id: 'r9', scope: 'test games' }
// agents: how many agents a full run starts, every stage of every item.
const SCRIPTS = {
  'checker.js': { readOnly: true, agents: 4, args: { batch: BATCH, seed: 's', repo: '/repo', groups: [{ label: 'u-a', units: ['a.b.c'], patterns: [] }, { label: 'p1', units: [], patterns: ['p'] }] } },
  'code-units.js': { agents: 2, args: { batch: BATCH, mode: 'fill', jobs: ['j1', 'j2'].map(label => ({ label, agent: label, game: 'g', ws: ws(label), units: [{ id: 'g.f.u', brief: 'b' }] })) } },
  'reconcile.js': { agents: 2, args: { batch: BATCH, units: ['u1', 'u2'].map(id => ({ id, game: 'g', ws: ws(id), a: 'a', b: 'b', reportA: 'ra', reportB: 'rb', diff: '' })) } },
  'patterns.js': { agents: 6, args: { batch: BATCH, groups: ['g1', 'g2'].map(label => ({ label, ws: ws(label), patterns: [{ id: 'p', kind: 'new', summary: 's', units: ['u'] }] })) } },
  'final-review.js': { readOnly: true, agents: 4, args: { batch: BATCH, draft: 'd', dimensions: ['data', 'record'] } },
  'verify-fixes.js': { readOnly: true, agents: 6, args: { batch: BATCH, findings: 'f', since: 'abc', draft: 'd', angles: ['closure', 'claims', 'recheck'], previous: 'p', draftPrev: 'dp' } },
  'prep.js': { readOnly: true, agents: 3, args: { batch: BATCH, game: { id: 'g', name: 'G', scope: 's', want: 'w', notesTask: 't' } } },
  'rule-fix.js': { readOnly: true, agents: 5, args: { round: { id: 'r9fix', after: 'r9', version: '9.9.9' }, problems: 'p', ws: '/scratch/r9/rulefix', groups: ['g1', 'g2'].map(label => ({ label, items: ['1'] })) } },
  'notes-and-trim.js': { readOnly: true, agents: 3, args: { batch: BATCH, dir: '/d', games: [{ id: 'g', name: 'G', existing: '' }, { id: 'h', name: 'H', existing: '' }], trim: true, keep: 'k' } },
}
// The lists a script returns next to its results (research/workflows/README.md, "What comes back"): failed names the
// items whose agent returned nothing, unverified those whose skeptic returned nothing.
const LISTS = {
  'checker.js': ['failed', 'unverified'], 'code-units.js': ['failed'], 'reconcile.js': ['failed'],
  'patterns.js': ['failed', 'unverified'], 'final-review.js': ['failed', 'unverified'], 'verify-fixes.js': ['failed', 'unverified'],
  'rule-fix.js': ['failed', 'unverified'],
}

describe('workflow scripts', () => {
  it('covers every script in research/workflows', () => {
    assert.deepEqual(Object.keys(SCRIPTS).sort(), fs.readdirSync(DIR).filter(f => f.endsWith('.js')).sort())
  })

  for (const [file, { readOnly, agents, args }] of Object.entries(SCRIPTS)) {
    const full = readOnly ? { ...args, progress: P } : args
    it(`${file}: every agent keeps its notes in a folder of its own`, async () => {
      const { prompts } = await run(file, full)
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

    it(`${file}: every stage runs, and nothing comes back failed`, async () => {
      const { prompts, result, errors } = await run(file, full)
      assert.deepEqual(errors.map(String), [], 'a stage threw')
      assert.equal(prompts.length, agents, `agents that ran: ${prompts.map(p => p.label).join(', ')}`)
      for (const list of LISTS[file] || []) assert.deepEqual(result[list], [], list)
    })

    if (LISTS[file]) {
      // Each agent in turn returns nothing: its item must be listed, so it is run again (runbook, "Count what came back").
      it(`${file}: an agent that returns nothing leaves its item in ${LISTS[file].join(' or ')}`, async () => {
        const { prompts } = await run(file, full)
        for (const { label } of prompts) {
          const { result, errors } = await run(file, full, { skip: label })
          assert.deepEqual(errors.map(String), [], `${label}: a stage threw`)
          const [stage, item] = label.split(':')
          const listed = stage === 'verify' ? 'unverified' : 'failed' // the skeptic's item is unverified; any other agent's, failed
          for (const list of LISTS[file]) assert.deepEqual(result[list], list === listed ? [item] : [], `${label} returned nothing: ${list}`)
        }
      })
    }

    if (readOnly) {
      it(`${file}: refuses to run without args.progress`, async () => {
        await assert.rejects(run(file, args), /args\.progress is required/)
      })
    }
  }

  it('verify-fixes.js: the recheck angle refuses to run without the claims run it follows', async () => {
    const { previous, draftPrev, ...rest } = SCRIPTS['verify-fixes.js'].args
    await assert.rejects(run('verify-fixes.js', { ...rest, progress: P }), /angle recheck needs args\.previous/)
  })
})

const tmpDirs = []
after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })

// Only refusals run here: on a path it accepts, mkws.sh copies the repository it names.
describe('mkws.sh', () => {
  it('refuses a relative path, a path with .. and a path past the ws- folder, and deletes nothing', { skip: process.platform === 'win32' && 'needs a POSIX shell' }, () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'unit-forge-mkws-'))
    tmpDirs.push(tmp)
    const wsA = path.join(tmp, 'scratchpad/r1/x/ws-a')
    fs.mkdirSync(path.join(wsA, 'data'), { recursive: true })
    fs.writeFileSync(path.join(wsA, 'data/keep.json'), '{}')
    for (const bad of ['./scratchpad/r1/x/ws-a', `${wsA}/..`, `${wsA}/data`]) {
      const r = spawnSync('sh', [MKWS, bad], { cwd: tmp, encoding: 'utf8' })
      assert.equal(r.status, 2, `${bad}: exit ${r.status}, ${r.stderr}`)
      assert.match(r.stderr, /^usage: mkws\.sh/, bad)
      assert.ok(fs.existsSync(path.join(wsA, 'data/keep.json')), `${bad}: the folder was deleted`)
    }
  })
})
