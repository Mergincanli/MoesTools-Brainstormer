# Writes research/r3/opening/hesitations.md from the four opening-check coder reports,
# in the format of research/r1/opening/hesitations.md.
# usage: python3 opening-hesitations.py <reports dir> <out file>
import json, re, sys
src, dst = sys.argv[1], sys.argv[2]
def norm(p):  # drop indexes: armament[1].traits, armament/1/traits -> armament.traits
    p = re.sub(r'\[\d+\]', '', p or '')
    p = re.sub(r'(^|[/.])\d+(?=$|[/.])', r'\1', p)
    return re.sub(r'[/.]+', '.', p.replace('/', '.')).strip('.')
def n(k, word, plural=None):
    return f'{k} {word if k == 1 else (plural or word + "s")}'
def alts(a):
    return '; '.join(a) if isinstance(a, list) else str(a or '')
UNITS = [('generals', 'generals.gla.jarmen-kell'), ('iron-harvest', 'iron-harvest.saxony.kaiser')]
reps = {(g, s): json.load(open(f'{src}/{s}-{g}.json')) for g, _ in UNITS for s in 'AB'}
H = sum(len(r['hesitations']) for r in reps.values()); G = sum(len(r.get('gaps') or []) for r in reps.values()); U = sum(len(r.get('unclear_rules') or []) for r in reps.values())
out = ['# Batch R3 opening check: hesitations, gaps and unclear rules', '',
       f'{H} hesitations, {G} gaps and {U} unclear rules in four coder reports (two coders, two units). Paths are normalised (indexes dropped).']
for g, u in UNITS:
    out += ['', f'## {u}']
    for s in 'AB':
        r = reps[(g, s)]
        assert r['units'] == [u], (s, g, r['units'])
        hs, gs, us = r['hesitations'], r.get('gaps') or [], r.get('unclear_rules') or []
        out += ['', f'### Coder {s}: {n(len(hs), "hesitation")}, {n(len(gs), "gap")}, {n(len(us), "unclear rule")}', '']
        for h in hs:
            assert h.get('unit') in (None, u), h.get('unit')
            out.append(f'- **{norm(h["path"])}**: chose {h["chosen"]}; alternatives {alts(h["alternatives"])}. {h["reason"]}'.rstrip())
        if gs:
            out += ['', 'Gaps (no term fitted well):', '']
            for x in gs:
                w = f'; wanted {x["wanted"]}' if x.get('wanted') else ''
                out.append(f'- **{norm(x["path"])}**: used {x["used"]}{w}. {x["note"]}'.rstrip())
        if us:
            out += ['', 'Unclear rules:', '']
            for x in us:
                out.append(f'- **{x["topic"]}**: {x["note"]}')
open(dst, 'w').write('\n'.join(out) + '\n')
print(H, 'hesitations', G, 'gaps', U, 'unclear rules')
