// Save a prep.js workflow result as r2/prep-<game>.json and print what came back.
// usage: node save-prep.mjs <task output file> <r2 dir>
import fs from 'node:fs'
const [out, dir] = process.argv.slice(2)
const wrap = JSON.parse(fs.readFileSync(out, 'utf8'))
const j = wrap.result
fs.writeFileSync(`${dir}/prep-${j.game}.json`, JSON.stringify(j, null, 1) + '\n')
const n = j.notes, v = j.verdicts, c = j.candidates
console.log('game', j.game, '| agents', wrap.agentCount, '| tokens', wrap.totalTokens)
console.log('notes', !!n, '| registry_findings', n?.registry_findings.length, '| pages_read', n?.pages_read.length)
console.log('verdicts', v?.verdicts.length, '| real', v?.verdicts.filter(x => x.real).length, '| not real', v?.verdicts.filter(x => !x.real).length, '| missing', v?.missing.length)
console.log('candidates', c?.candidates.length, '\n ', c?.candidates.map(x => `${x.id} [${x.class}]`).join(', '))
for (const f of n?.registry_findings || []) console.log(' RF', f.severity, f.path, '|', String(typeof f.proposed === 'string' ? f.proposed : JSON.stringify(f.proposed)).slice(0, 180))
for (const x of (v?.verdicts || []).filter(x => !x.real)) console.log(' NOT REAL:', x.claim.slice(0, 150), '=>', (x.correction || '').slice(0, 220))
for (const m of v?.missing || []) console.log(' MISSING:', m.slice(0, 240))
