# Copies finished fill jobs into a record copy: research/r3/fill/<job>/<game>.json and report.json,
# in the form of research/r1/fill/<job>/ (no workspace path; file_written relative; local paths replaced).
# usage: python3 record-fill.py <record repo root> <result json> [<result json> ...] -- <job> [<job> ...]
import json, re, sys, shutil, os
args = sys.argv[1:]; cut = args.index('--')
root, results, jobs = args[0], args[1:cut], args[cut + 1:]
LOCAL = re.compile(r'(/tmp/claude-0/[^\s"\')]*|/home/user/[^\s"\')]*|(?:the )?scratchpad/[^\s"\')]*|\.progress/[^\s"\')]*)')
found = {}
for f in results:
    d = json.load(open(f)); r = d.get('result', d)
    for x in r['results']: found[x['label']] = x
for j in jobs:
    x = dict(found[j]); ws = x.pop('ws'); game = x['game']
    out = os.path.join(root, 'research/r3/fill', j); os.makedirs(out, exist_ok=True)
    shutil.copy(os.path.join(ws, 'data/units', game + '.json'), os.path.join(out, game + '.json'))
    x['file_written'] = 'data/units/%s.json' % game
    n = [0]
    def walk(v):
        if isinstance(v, str):
            v2 = LOCAL.sub('<scratch>', v)
            if v2 != v: n[0] += 1
            return v2
        if isinstance(v, list): return [walk(y) for y in v]
        if isinstance(v, dict): return {k: walk(y) for k, y in v.items()}
        return v
    x = walk(x)
    order = ['label', 'game', 'file_written', 'units', 'validator_result', 'copy_check_result', 'hesitations', 'gaps', 'unclear_rules', 'new_mechanics', 'pages_read_not_cited', 'source_problems']
    x = {k: x[k] for k in order if k in x} | {k: v for k, v in x.items() if k not in order}
    json.dump(x, open(os.path.join(out, 'report.json'), 'w'), indent=1, ensure_ascii=False); open(os.path.join(out, 'report.json'), 'a').write('\n')
    print(j, game, 'units', x['units'], 'hes', len(x.get('hesitations', [])), 'gaps', len(x.get('gaps', [])), 'unclear', len(x.get('unclear_rules', [])), 'local paths replaced', n[0])
