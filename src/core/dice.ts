// The dice (rule sheet section 2, I2, T1, T2).
//
// Every card field draws from its own stream, so locking or rerolling one part never moves the dice of another, and
// the same seed always gives the same numbers. The algorithm, fixed by test vectors in tests/core-dice.test.mjs (a
// change to any step changes every card, so it must never change unnoticed):
//
//   1. key   = seed + "|" + field path + "|" + attempt number in decimal, e.g. "my seed|roles.primary|1".
//              Field paths never contain "|" and the attempt is digits, so reading the key from the right gives back
//              the three parts: two different (seed, path, attempt) never share a key.
//   2. state = cyrb128(key): four 32-bit words from the key's UTF-16 code units (the cyrb128 string hash, as
//              published by bryc in "PRNGs in JavaScript", with its final mixing line).
//   3. words = sfc32(state): the small fast counter generator (Chris Doty-Humphrey's sfc32), one unsigned 32-bit
//              word per call; the first 15 words are thrown away so that close keys start far apart.
//   4. below(n), a whole number from 0 to n - 1: draw words until one is below the largest multiple of n that fits
//              in 2^32, then take it modulo n (no bias).
//   5. pick(weights): weights are whole numbers; r = below(sum of weights); the pick is the first item whose running
//              sum of weights is above r. An item of weight 0 is never picked.
//
// Only whole-number arithmetic is used (32-bit operations and exact sums below 2^53), so every JavaScript engine gives
// the same numbers.

const TWO_32 = 4294967296
const WARM_UP = 15

/** cyrb128 string hash: four unsigned 32-bit words. */
export function cyrb128(text: string): [number, number, number, number] {
  let h1 = 1779033703
  let h2 = 3144134277
  let h3 = 1013904242
  let h4 = 2773480762
  for (let i = 0; i < text.length; i++) {
    const k = text.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  h1 ^= h2 ^ h3 ^ h4
  h2 ^= h1
  h3 ^= h1
  h4 ^= h1
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]
}

/** sfc32: a function that returns the next unsigned 32-bit word each time it is called. */
export function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    a |= 0
    b |= 0
    c |= 0
    d |= 0
    const t = (((a + b) | 0) + d) | 0
    d = (d + 1) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
    return t >>> 0
  }
}

/** One field's dice. */
export interface Dice {
  /** The next unsigned 32-bit word. */
  word(): number
  /** A whole number from 0 to n - 1 (n from 1 to 2^32). */
  below(n: number): number
  /** Picks an index by whole-number weights; returns it with the dice result r (0 <= r < sum of weights). */
  pick(weights: readonly number[]): { index: number; draw: number }
}

/** The stream key of a field (step 1 above). */
export function streamKey(seed: string, path: string, attempt: number): string {
  if (path.includes('|')) throw new Error(`a field path may not contain '|': ${path}`)
  if (!Number.isSafeInteger(attempt) || attempt < 0) throw new Error(`the attempt must be a whole number: ${attempt}`)
  return `${seed}|${path}|${attempt}`
}

/** The dice of one card field on one attempt. */
export function diceFor(seed: string, path: string, attempt: number): Dice {
  const [a, b, c, d] = cyrb128(streamKey(seed, path, attempt))
  const word = sfc32(a, b, c, d)
  for (let i = 0; i < WARM_UP; i++) word()
  const below = (n: number): number => {
    if (!Number.isSafeInteger(n) || n < 1 || n > TWO_32) throw new Error(`below() needs a whole number from 1 to 2^32: ${n}`)
    const limit = TWO_32 - (TWO_32 % n)
    for (;;) {
      const r = word()
      if (r < limit) return r % n
    }
  }
  const pick = (weights: readonly number[]): { index: number; draw: number } => {
    let total = 0
    for (const w of weights) {
      if (!Number.isSafeInteger(w) || w < 0) throw new Error(`weights must be whole numbers of 0 or more: ${weights.join(', ')}`)
      total += w
    }
    if (total < 1) throw new Error('pick() needs at least one weight above 0')
    const draw = below(total)
    let run = 0
    for (let i = 0; i < weights.length; i++) {
      run += weights[i] ?? 0
      if (draw < run) return { index: i, draw }
    }
    throw new Error('pick() ran past the last weight') // unreachable: draw < total
  }
  return { word, below, pick }
}
