"""Dựng graph của vault giống Obsidian (link markdown tương đối) để kiểm trước khi mở.

Dùng (từ llm-wiki/):  python3 -I tools/obsidian_graph.py .
Thoát 1 nếu có link .md hỏng trong vault hoặc trang mồ côi (không link vào, không link ra).
"""
import os
import re
import sys
from collections import Counter
from urllib.parse import unquote

root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
LINK = re.compile(r'(?<!!)\[[^\]]*\]\(([^)\s]+)\)')
CODE = re.compile(r'```.*?```|`[^`\n]*`', re.S)
IGNORE = ('tools', '.obsidian')

notes = []
for dp, dns, fns in os.walk(root):
    dns[:] = [d for d in dns if d not in IGNORE and not d.startswith('.')]
    notes += [os.path.relpath(os.path.join(dp, f), root) for f in fns if f.endswith('.md')]
note_set = set(notes)

edges, broken = set(), []
for n in notes:
    text = CODE.sub('', open(os.path.join(root, n), encoding='utf-8').read())
    for href in LINK.findall(text):
        if re.match(r'[a-z]+:', href) or href.startswith('#'):
            continue
        target = unquote(href.split('#')[0])
        if not target.endswith('.md'):
            continue  # file đính kèm (.xlsx/.csv/.patch) — graph đang ẩn attachments
        resolved = os.path.normpath(os.path.join(os.path.dirname(n), target))
        if resolved.startswith('..'):
            continue  # ra ngoài vault (vd. ../docs/voi) — Obsidian không vẽ
        if resolved in note_set:
            edges.add((n, resolved))
        else:
            broken.append((n, href))

deg_in = Counter(t for _, t in edges)
deg_out = Counter(s for s, _ in edges)
orphans = [n for n in notes if not deg_in[n] and not deg_out[n]]
groups = Counter(n.split(os.sep)[1] if n.startswith('pages' + os.sep) else n.split(os.sep)[0] if os.sep in n else '(gốc)' for n in notes)

print(f'nodes: {len(notes)}  edges: {len(edges)}')
print('theo nhóm:', ', '.join(f'{k}={v}' for k, v in sorted(groups.items())))
print('hub nhiều link vào nhất:', ', '.join(f'{n} ({c})' for n, c in deg_in.most_common(5)))
print(f'link .md hỏng: {len(broken)}')
for s, h in broken:
    print(f'  {s} -> {h}')
print(f'mồ côi: {len(orphans)}')
for n in orphans:
    print(f'  {n}')
sys.exit(1 if broken or orphans else 0)
