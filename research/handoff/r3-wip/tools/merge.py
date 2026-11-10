# Merge pass, step 1: add the batch's units from the committed records to data/units/<game>.json.
# usage: python3 -I merge.py <repo with research/r1 records> <target root> [--allow-missing]
import json, sys, os, glob
src, dst = sys.argv[1], sys.argv[2]
allow_missing = '--allow-missing' in sys.argv
trim = json.load(open(f'{src}/research/r3/prep/trim.json'))
order = [k['id'] for k in trim['keep']]
found, origin = {}, {}
def take(path, ids):
    d = json.load(open(path))
    for u in d['units']:
        if u['id'] in ids:
            assert u['id'] not in found, ('twice', u['id'], path, origin.get(u['id']))
            found[u['id']] = u; origin[u['id']] = path
    return d
for g in ['generals', 'iron-harvest']:
    p = f'{src}/research/r3/opening/final/{g}.json'
    take(p, set(order))
for rep in sorted(glob.glob(f'{src}/research/r3/fill/*/report.json')):
    r = json.load(open(rep)); job = os.path.dirname(rep)
    take(f'{job}/{r["game"]}.json', set(r['units']) & set(order))
missing = [i for i in order if i not in found]
print('units found', len(found), 'of', len(order), '; missing:', missing)
if missing and not allow_missing: sys.exit(1)
for g in sorted({i.split('.')[0] for i in order}):
    p = f'{dst}/data/units/{g}.json'
    if os.path.exists(p):
        d = json.load(open(p)); before = json.dumps(d['units'])
    else:
        d = {"$schema": "../../schemas/source-unit.schema.json", "schema_version": "1.0.0", "vocab_version": "1.1.0", "game": g, "units": []}; before = '[]'
    have = {u['id'] for u in d['units']}
    new = [found[i] for i in order if i.split('.')[0] == g and i in found and i not in have]
    d['units'] += new
    assert json.dumps(d['units'][:len(json.loads(before))]) == before, 'existing entries changed'
    # the samples a record carries must equal the file's existing entries
    for i, u in enumerate(json.loads(before)):
        for path in set(origin[x] for x in found if x.split('.')[0] == g):
            rec = {v['id']: v for v in json.load(open(path))['units']}
            if u['id'] in rec and json.dumps(rec[u['id']]) != json.dumps(u):
                print('NOTE: record', path, 'changed existing unit', u['id'])
    open(p, 'w').write(json.dumps(d, indent=2, ensure_ascii=False) + '\n')
    print(g, 'existing', len(json.loads(before)), 'added', len(new), '->', len(d['units']))
