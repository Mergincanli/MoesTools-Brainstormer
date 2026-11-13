// Key-bound mobility traits (uses_key true) and their patterns: which patterns imply the trait, and how the source
// units code them (trait only, pattern only, or both), to show whether the validator's key count counts one
// button twice on a card. Usage: node keytraits.mjs [repoRoot]
import { load } from './lib.mjs'
const D = load(process.argv[2])
const kt = D.vocab['mobility-traits'].terms.filter(t => t.uses_key)
for (const t of kt) {
  const implying = D.patterns.filter(p => [...(p.generator.implies || []), ...p.variants.flatMap(v => v.overrides?.implies || [])].includes(`mobility-trait:${t.id}`)).map(p => p.id)
  const withTrait = D.units.filter(u => (u.mobility.traits || []).includes(t.id))
  const both = withTrait.filter(u => [...u.abilities.flatMap(a => a.patterns || []), ...u.armament.flatMap(w => w.patterns || [])].includes(t.pattern))
  console.log(`${t.id} (pattern ${t.pattern}): implied by [${implying.join(', ')}]; units with the trait: ${withTrait.length}, of which also link the pattern: ${both.length} [${both.map(u => u.id).join(', ')}]`)
}
