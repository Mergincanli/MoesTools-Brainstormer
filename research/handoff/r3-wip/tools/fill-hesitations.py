# Writes research/r1/fill/hesitations.md from the fill jobs' reports, the way research/r1/opening/hesitations.md was written.
import json, glob, os, re, collections
import sys; R = sys.argv[1]
def norm(p):  # drop indexes: armament[1].traits, armament/1/traits -> armament.traits
    p = re.sub(r'\[\d+\]', '', p or '')
    p = re.sub(r'(^|[/.])\d+(?=$|[/.])', r'\1', p)
    p = re.sub(r'[/.]+', '.', p.replace('/', '.')).strip('.')
    return p
def alts(a):
    return '; '.join(a) if isinstance(a, list) else str(a or '')
SPLIT = {}
jobs = []
for d in sorted(glob.glob(R + '/j*')):
    r = json.load(open(d + '/report.json'))
    # An entry that names its unit by a short id (ra3.kirov-airship) goes to the job's unit with the same last part.
    for x in r['hesitations'] + r['gaps']:
        if x.get('unit') not in r['units']:
            m = [u for u in r['units'] if u.split('.')[-1] == str(x.get('unit')).split('.')[-1]]
            if len(m) == 1: x['unit'] = m[0]
    jobs.append((os.path.basename(d), r))
H = sum(len(r['hesitations']) for _, r in jobs); G = sum(len(r['gaps']) for _, r in jobs); U = sum(len(r['unclear_rules']) for _, r in jobs)
units = [u for _, r in jobs for u in r['units']]
by_field = collections.Counter(norm(h['path']).split(',')[0].strip() for _, r in jobs for h in r['hesitations'])
out = [f'# Batch R3 fill: hesitations, gaps and unclear rules', '',
       f'{H} hesitations, {G} gaps and {U} unclear rules in the reports of {len(jobs)} research agents ({len(units)} units, two per agent). '
       'Paths are normalised (indexes dropped). The two opening-check units are in `research/r3/opening/hesitations.md`.', '',
       'Fields with the most hesitations:', '']
for f, n in by_field.most_common(10):
    out.append(f'- `{f}`: {n}')
for job, r in jobs:
    out += ['', f'## {job}: {", ".join(r["units"])}']
    for u in r['units']:
        hs = [h for h in r['hesitations'] if h.get('unit') == u]
        gs = [g for g in r['gaps'] if g.get('unit') == u]
        out += ['', f'### {u}' + (f' ({SPLIT[u]})' if u in SPLIT else ''), '', f'{len(hs)} hesitations, {len(gs)} gaps.', '']
        for h in hs:
            out.append(f'- **{norm(h["path"])}**: chose {h["chosen"]}; alternatives {alts(h["alternatives"])}. {h["reason"]}'.rstrip())
        if gs:
            out += ['', 'Gaps (no term fitted well):', '']
            for g in gs:
                w = f'; wanted {g["wanted"]}' if g.get('wanted') else ''
                out.append(f'- **{norm(g["path"])}**: used {g["used"]}{w}. {g["note"]}'.rstrip())
    other = [h for h in r['hesitations'] if h.get('unit') not in r['units']] + [g for g in r['gaps'] if g.get('unit') not in r['units']]
    if other:
        out += ['', '### Both units, or another unit', '']
        for h in other:
            if 'chosen' in h: out.append(f'- **{h.get("unit")} {norm(h["path"])}**: chose {h["chosen"]}; alternatives {alts(h["alternatives"])}. {h["reason"]}')
            else: out.append(f'- **{h.get("unit")} {norm(h["path"])}** (gap): used {h["used"]}. {h["note"]}')
    out += ['', f'### Unclear rules ({len(r["unclear_rules"])})', '']
    for x in r['unclear_rules']:
        out.append(f'- **{x["topic"]}**: {x["note"]}')
open(R + '/hesitations.md', 'w').write('\n'.join(out) + '\n')
print(H, G, U, len(units), 'units;', sum(1 for _, r in jobs for h in r['hesitations'] if h.get('unit') not in r['units']), 'hesitations not on the job units')
