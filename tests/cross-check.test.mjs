// A small slice of the cross-check (T3 and T4 of docs/generator-rules.md) on every test run: cards rolled by the
// generator must pass the separate rolled-card checker and the validator's card rules. The full runs are
// `npm run cross-check -- t3` (10,000 rolls) and `npm run cross-check -- t4` (every combination of inputs).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crossCheck, inputLists, requestsT3, requestsT4 } from '../scripts/cross-check.mjs'

const lists = inputLists()
const show = res => JSON.stringify({ byCode: res.byCode, examples: Object.fromEntries(Object.entries(res.examples).map(([k, v]) => [k, v.slice(0, 2)])), dataProblems: res.dataProblems }, null, 1)

test('the input lists are the ones the rule sheet counts (6 classes, 3 tiers, 3 flavours, 16 roles)', () => {
  assert.deepEqual([lists.classes.length, lists.tiers.length, lists.flavours.length, lists.roles.length], [6, 3, 3, 16])
})

test('T3, a slice: 300 random rolls, every card passes the separate checker and the validator', () => {
  const res = crossCheck(requestsT3(lists, 300))
  assert.equal(res.rolls, 300)
  assert.ok(res.cards >= 280, `${res.cards} cards`)
  assert.equal(res.ok, true, show(res))
})

test('T4, a slice: every class with every role, one seed each, and only what the word lists rule out is unavailable', () => {
  const requests = []
  for (const q of requestsT4(lists, 1)) if (q.inputs.class && q.inputs.role && !q.inputs.tier && !q.inputs.flavour && q.spice === 3) requests.push(q)
  assert.equal(requests.length, 6 * 16)
  const res = crossCheck(requests)
  assert.equal(res.ok, true, show(res))
  const unavailable = Object.entries(res.unavailable)
  assert.ok(unavailable.length > 0 && unavailable.every(([, u]) => u.expected), JSON.stringify(unavailable))
  assert.deepEqual(unavailable.map(([k]) => k.split('|').slice(0, 4).join('|')).sort(), ['drone|*|*|transport', 'infantry|*|*|transport'])
})
