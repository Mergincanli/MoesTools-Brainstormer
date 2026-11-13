// Tests for the dice (src/core/dice.ts; rule sheet section 2, I2, T1, T2): the algorithm is pinned by test vectors, so
// that a change to it, which would change every card, can never go unnoticed. The vectors were checked against a
// separate implementation of the same algorithm in another language.
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cyrb128, diceFor, sfc32, streamKey } from '../src/core/dice.ts'

describe('dice: pinned vectors', () => {
  it('cyrb128 hashes the key\'s UTF-16 code units to four 32-bit words', () => {
    assert.deepEqual(cyrb128(''), [41608494, 3485963809, 1435736333, 1262568316])
    assert.deepEqual(cyrb128('a'), [1589175524, 148824423, 2405369273, 1476957317])
    assert.deepEqual(cyrb128('my seed|class|1'), [4104099654, 52122414, 1489558579, 22545610])
    assert.deepEqual(cyrb128('ünïcode ✓|roles.primary|2'), [648398187, 250354690, 3636967613, 4286697779])
  })

  it('sfc32 gives unsigned 32-bit words', () => {
    const g = sfc32(1, 2, 3, 4)
    assert.deepEqual([g(), g(), g(), g(), g()], [7, 34, 56623200, 188882296, 3431242869])
  })

  it('a field\'s stream is sfc32 seeded by cyrb128(seed|path|attempt), after 15 words thrown away', () => {
    const d = diceFor('my seed', 'class', 1)
    assert.deepEqual([d.word(), d.word(), d.word()], [913723885, 3263589064, 360397842])
    assert.equal(diceFor('my seed', 'class', 2).word(), 1657004653, 'the next attempt has new dice')
  })

  it('below() and pick() give pinned results', () => {
    const e = diceFor('my seed', 'class', 1)
    assert.deepEqual(Array.from({ length: 8 }, () => e.below(6)), [1, 4, 0, 5, 4, 3, 5, 3])
    const f = diceFor('my seed', 'tier', 1)
    assert.deepEqual([f.pick([10, 0, 4, 10]), f.pick([10, 0, 4, 10]), f.pick([10, 0, 4, 10])], [
      { index: 3, draw: 15 },
      { index: 2, draw: 10 },
      { index: 0, draw: 2 },
    ])
  })
})

describe('dice: behaviour', () => {
  it('the same seed, field and attempt always give the same numbers', () => {
    const a = diceFor('seed-x', 'roles.primary', 3)
    const b = diceFor('seed-x', 'roles.primary', 3)
    for (let i = 0; i < 100; i++) assert.equal(a.word(), b.word())
  })

  it('every field has its own stream', () => {
    const words = path => { const d = diceFor('seed-x', path, 1); return [d.word(), d.word()] }
    assert.notDeepEqual(words('class'), words('tier'))
    assert.notDeepEqual(words('tier'), words('flavour'))
  })

  it('the key reads back uniquely: a | in the seed cannot make two fields share a stream', () => {
    assert.equal(streamKey('a|b', 'c', 3), 'a|b|c|3')
    assert.throws(() => streamKey('a', 'b|c', 3), /may not contain/)
    assert.throws(() => streamKey('a', 'b', 1.5), /whole number/)
  })

  it('below(n) stays in range and reaches every value', () => {
    const d = diceFor('range', 'test', 1)
    const seen = new Set()
    for (let i = 0; i < 2000; i++) {
      const r = d.below(7)
      assert.ok(Number.isInteger(r) && r >= 0 && r < 7)
      seen.add(r)
    }
    assert.equal(seen.size, 7)
    assert.equal(diceFor('one', 'test', 1).below(1), 0)
    assert.throws(() => d.below(0))
    assert.throws(() => d.below(2.5))
  })

  it('pick() never picks a weight of 0, and its draw is below the sum of the weights', () => {
    const d = diceFor('weights', 'test', 1)
    for (let i = 0; i < 1000; i++) {
      const { index, draw } = d.pick([0, 3, 0, 5, 0])
      assert.ok(index === 1 || index === 3)
      assert.ok(draw >= 0 && draw < 8)
      assert.equal(index, draw < 3 ? 1 : 3, 'the pick is the first item whose running sum is above the draw')
    }
  })

  it('pick() takes whole-number weights only', () => {
    const d = diceFor('weights', 'test', 1)
    assert.throws(() => d.pick([1.5, 2]), /whole numbers/)
    assert.throws(() => d.pick([-1, 2]), /whole numbers/)
    assert.throws(() => d.pick([0, 0]), /at least one weight/)
  })

  it('pick() follows the weights over many draws', () => {
    const d = diceFor('odds', 'test', 1)
    const n = [0, 0]
    for (let i = 0; i < 20000; i++) n[d.pick([1, 3]).index]++
    const share = n[1] / 20000
    assert.ok(share > 0.73 && share < 0.77, `weight 3 of 4 came up ${share}`)
  })
})
