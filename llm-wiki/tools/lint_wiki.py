#!/usr/bin/env python3
"""lint_wiki.py — kiểm sức khoẻ một LLM Wiki (skill llm-wiki, SCHEMA §6.3). Chỉ đọc.

    python3 -I lint_wiki.py <llm-wiki-dir> [--strict] [--json] [--quiet] [--viewer[=FILE]]

Đọc cấu hình từ <wiki>/wiki.json. Thiếu file đó (wiki cũ, chưa adopt) thì dùng mặc định
và đoán tiền tố mã spec từ bảng §5 của SCHEMA.md.

Lỗi (exit 1):  thiếu/sai frontmatter · link hoặc anchor hỏng · trang mồ côi · wikilink [[...]]
               · chuỗi giống secret
Cảnh báo:      type không khớp thư mục · thiếu mục bắt buộc · trang thiếu trong index.md
               · trang quá dài · entry log.md sai định dạng · tiền tố mã lạ trong spec_ids
               · bằng chứng repo: trỏ tới file không có / dòng vượt cuối file
--strict:      cảnh báo cũng làm exit 1.
--json:        in số liệu máy đọc (khoảng trống spec↔code, tài liệu↔code, câu hỏi mở,
               độ phủ mã) để dựng backlog / dashboard.
--viewer:      sau khi lint, dựng lại viewer tĩnh (wiki_viewer.py --build) vào <wiki>/viewer.html,
               hoặc vào FILE nếu viết --viewer=FILE. Viewer vẫn được dựng khi lint có lỗi.
Độ phủ:        wiki.json có khoá `coverage` → gọi coverage_wiki.py (fact create/change/delete chưa
               claim, lần nhắc chưa phân loại, dòng gap OK không trỏ fact sống = lỗi). Không có khoá
               đó thì lint chạy y như cũ.
"""
import collections
import json
import os
import re
import sys
from urllib.parse import unquote

DEFAULTS = {
    "mode": "unknown",
    "lang": "vi",
    "max_lines": 600,
    "repo_root": "..",
    "prefixes": {},
    "spec_id_suffix": r"[0-9]+(?:\.[0-9]+)?[a-z]?(?![0-9A-Za-z])",
    "orphan_exempt": ["pages/overview/project-overview.md", "pages/overview/tong-quan.md"],
    "frontmatter_required": ["title", "type", "sources", "updated"],
    "page_types": {
        "overview": {"dir": "overview", "required": ["Tóm tắt", "Bản đồ", "Liên quan"]},
        "source": {"dir": "sources", "required": ["Thông tin nguồn", "Nội dung chính",
                                                   "Trang chịu ảnh hưởng"]},
        "entity": {"dir": "entities", "required": ["Định nghĩa", "Quan hệ", "Liên quan"]},
        "concept": {"dir": "concepts", "required": ["Định nghĩa", "Quy tắc", "Liên quan"]},
        "flow": {"dir": "flows", "required": ["Mục tiêu", "Các bước", "Liên quan"]},
        "screen": {"dir": "screens", "required": ["Mục đích", "Liên quan"]},
        "contract": {"dir": "contracts", "required": ["Liên quan"]},
        "proposal": {"dir": "proposals", "required": []},
    },
    # Thư mục do HARNESS ghi (spec-lint → oq-spec-lint-<FID>.md, po-agent → ai-po-<FID>.md).
    # Theo khuôn của harness, không theo SCHEMA §4: chỉ kiểm link hỏng và secret.
    "generated_dirs": ["proposals"],
    "terminal_sections": ["Liên quan", "Trang chịu ảnh hưởng"],
    "gap_section": "Khác biệt spec ↔ code",
    "doc_section": "Khác biệt tài liệu ↔ code",
    "defined_section": "Mã yêu cầu được định nghĩa",
    "open_marker": "[CẦN LÀM RÕ]",
    "unchecked_marker": "[CHƯA KIỂM CODE]",
    "gap_levels": ["MISSING", "PARTIAL", "CONTRADICTS", "BUG", "EXTRA", "OK"],
    "doc_levels": ["STALE", "WRONG", "PLANNED", "OK"],
    "log_ops": ["ingest", "query", "lint", "decide"],
}

LINK = re.compile(r'(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
CODE = re.compile(r'```.*?```|`[^`\n]*`', re.S)
FENCE = re.compile(r'```.*?```', re.S)
WIKILINK = re.compile(r'\[\[[^\]]+\]\]')
# Vùng do HARNESS ghi vào trang spec: po-dispose.py (AI PO) chèn `<!-- ai-po:<FID> begin … end -->` và trong đó dùng
# `[[<record_dir>/ai-po-<FID>.md]]` (đường dẫn tính từ spec root = pages/). Lint không coi đó là lỗi của người viết
# wiki, nhưng vẫn kiểm link đó trỏ tới bản ghi có thật.
HARNESS_BLOCK = re.compile(r'<!-- ai-po:(\S+) begin.*?<!-- ai-po:\1 end -->', re.S)
HEADING = re.compile(r'^(#{1,6})\s+(.+?)\s*#*\s*$', re.M)
EVIDENCE = re.compile(r'repo:([A-Za-z0-9_./@()\[\]+~-]+?)(?::(\d+)(?:[-–](\d+))?)?(?=[\s`|),;]|$)')
SECRETS = [
    (re.compile(r'glpat-[A-Za-z0-9_-]{16,}'), 'GitLab PAT'),
    (re.compile(r'gh[pousr]_[A-Za-z0-9]{30,}'), 'GitHub token'),
    (re.compile(r'AKIA[0-9A-Z]{16}'), 'AWS access key'),
    (re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----'), 'private key'),
    (re.compile(r'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'), 'JWT'),
    (re.compile(r'(?i)\b(password|passwd|pwd|mật khẩu|secret|api[_-]?key)\b\s*[:=]\s*'
                r'["\']?(?!\*|<|\[|\{|\$|REDACTED|xxx|…|\.\.\.)(?=[^\s"\'`|]*[0-9])(?=[^\s"\'`|]*[A-Za-z])[^\s"\'`|]{8,}'), 'mật khẩu/secret'),
]


def load_config(root):
    cfg = json.loads(json.dumps(DEFAULTS))
    path = os.path.join(root, 'wiki.json')
    adopted = os.path.exists(path)
    if adopted:
        user = json.load(open(path, encoding='utf-8'))
        for k, v in user.items():
            if k == 'page_types' and isinstance(v, dict):
                for t, spec in v.items():
                    cfg['page_types'].setdefault(t, {}).update(spec)
            else:
                cfg[k] = v
    if not cfg['prefixes']:
        cfg['prefixes'] = infer_prefixes(root)
    return cfg, adopted


def infer_prefixes(root):
    """Wiki cũ không có wiki.json: lấy tiền tố từ bảng §5 của SCHEMA.md (ô đầu là `PREFIX…`)."""
    path = os.path.join(root, 'SCHEMA.md')
    if not os.path.exists(path):
        return {}
    text = open(path, encoding='utf-8').read()
    m = re.search(r'^## 5\..*?(?=^## 6\.)', text, re.S | re.M)
    out = {}
    for row in re.findall(r'^\|\s*`([A-Z][A-Z0-9]{0,7})(?:-[^`]*)?`\s*\|([^|]*)\|', m.group(0) if m else '', re.M):
        out.setdefault(row[0], row[1].strip())
    return out


def slug(text):
    t = re.sub(r'[`*~\[\]()<>]', '', text.strip().lower())
    t = re.sub(r'[^\w\s-]', '', t)
    return re.sub(r'\s+', '-', t)


def frontmatter(text):
    if not text.startswith('---'):
        return None
    end = text.find('\n---', 3)
    if end < 0:
        return None
    fm, key = {}, None
    for line in text[3:end].splitlines():
        m = re.match(r'^([A-Za-z_][\w-]*):\s*(.*?)\s*(?:#.*)?$', line)
        if m:
            key, val = m.group(1), m.group(2)
            fm[key] = val
        elif key and re.match(r'^\s+-\s+', line):
            fm[key] = (fm[key] + ' ' if fm[key] else '') + line.strip()[1:].strip()
    return fm


def sections(text):
    """{tên mục cấp 2: nội dung} — so tên theo tiền tố để chịu được '(nếu có)', '/ …'."""
    out, cur, buf = {}, None, []
    for line in text.splitlines():
        m = re.match(r'^##\s+(.+?)\s*$', line)
        if m:
            if cur is not None:
                out[cur] = '\n'.join(buf)
            cur, buf = m.group(1), []
        elif cur is not None:
            buf.append(line)
    if cur is not None:
        out[cur] = '\n'.join(buf)
    return out


def has_section(secs, name):
    n = name.lower()
    return any(s.lower().startswith(n) for s in secs)


def section_body(secs, name):
    n = name.lower()
    return '\n'.join(v for k, v in secs.items() if k.lower().startswith(n))


def table_rows(body):
    for line in body.splitlines():
        line = line.strip()
        if line.startswith('|') and not re.match(r'^\|[\s:|-]+\|$', line):
            yield [c.strip() for c in line.strip('|').split('|')]


def main(argv):
    args = [a for a in argv if not a.startswith('--')]
    strict, as_json, quiet = '--strict' in argv, '--json' in argv, '--quiet' in argv
    root = os.path.abspath(args[0] if args else '.')
    if not os.path.isdir(os.path.join(root, 'pages')):
        print(f'không thấy {root}/pages — đây có phải thư mục llm-wiki không?', file=sys.stderr)
        return 2
    cfg, adopted = load_config(root)
    repo_root = os.path.normpath(os.path.join(root, cfg['repo_root']))
    errors, warns = [], []
    E = lambda p, m: errors.append(f'{p}: {m}')
    W = lambda p, m: warns.append(f'{p}: {m}')

    notes = []
    for dp, dns, fns in os.walk(root):
        dns[:] = [d for d in dns if not d.startswith('.') and d not in ('tools', 'raw')]
        notes += [os.path.relpath(os.path.join(dp, f), root) for f in fns if f.endswith('.md')]
    notes.sort()
    texts = {n: open(os.path.join(root, n), encoding='utf-8').read() for n in notes}
    anchors = {}
    for n, t in texts.items():
        a = set(re.findall(r'<a\s+(?:id|name)="([^"]+)"', t))
        a |= {slug(h) for _, h in HEADING.findall(CODE.sub('', t))}
        anchors[n] = a

    prefixes = cfg['prefixes']
    id_re = re.compile(r'(?<![A-Za-z0-9-])((?:%s)-%s)' % ('|'.join(map(re.escape, sorted(prefixes, key=len, reverse=True))),
                                                        cfg['spec_id_suffix'])) if prefixes else None
    type_dirs = {v['dir']: k for k, v in cfg['page_types'].items()}
    inbound = collections.Counter()
    referenced, defined = collections.Counter(), set()
    gaps, docgaps = [], []
    open_q = unchecked = 0
    file_cache = {}

    for n, text in texts.items():
        in_pages = n.startswith('pages' + os.sep)
        body = CODE.sub('', text)
        for href in LINK.findall(body):
            if re.match(r'[a-z][a-z0-9+.-]*:', href):
                continue
            path, _, anc = unquote(href).partition('#')
            tgt = os.path.normpath(os.path.join(os.path.dirname(n), path)) if path else n
            full = os.path.join(root, tgt)
            if tgt.startswith('..'):
                if not os.path.exists(full):
                    E(n, f'link ra ngoài vault không tồn tại: {href}')
                continue
            if not os.path.exists(full):
                E(n, f'link hỏng: {href}')
                continue
            if anc and tgt.endswith('.md') and anc not in anchors.get(tgt, set()) and slug(anc) not in anchors.get(tgt, set()):
                E(n, f'anchor hỏng: {href}')
            if tgt != n:
                inbound[tgt] += 1
        generated = any(n.startswith(os.path.join('pages', g) + os.sep) for g in cfg['generated_dirs'])
        for blk in HARNESS_BLOCK.finditer(body):
            for wl in WIKILINK.findall(blk.group(0)):
                tgt = wl[2:-2].split('|')[0].split('#')[0].strip()
                if not os.path.exists(os.path.join(root, 'pages', tgt)):
                    E(n, f'block ai-po (harness) trỏ tới bản ghi không có: {wl}')
        if WIKILINK.search(HARNESS_BLOCK.sub('', body)) and not generated:
            E(n, 'dùng wikilink [[...]] — đổi sang link markdown tương đối (SCHEMA §4.3)')
        for rx, label in SECRETS:
            for m in rx.finditer(text):
                E(n, f'chuỗi giống {label} ở dòng {text.count(chr(10), 0, m.start()) + 1} — che lại, chỉ ghi file:line')
        if not in_pages or generated:
            continue
        open_q += text.count(cfg['open_marker'])
        unchecked += text.count(cfg['unchecked_marker'])

        lines = text.count('\n') + 1
        if lines > cfg['max_lines']:
            W(n, f'{lines} dòng > {cfg["max_lines"]} — tách trang con')
        fm = frontmatter(text)
        if fm is None:
            E(n, 'thiếu frontmatter YAML')
            ptype = None
        else:
            for k in cfg['frontmatter_required']:
                if not fm.get(k):
                    E(n, f'frontmatter thiếu `{k}`')
            ptype = fm.get('type')
            if ptype and ptype not in cfg['page_types']:
                E(n, f'type lạ `{ptype}` (cho phép: {", ".join(cfg["page_types"])})')
            sub = n.split(os.sep)[1] if n.count(os.sep) >= 2 else ''
            if ptype in cfg['page_types'] and sub in type_dirs and type_dirs[sub] != ptype:
                W(n, f'type `{ptype}` nằm trong thư mục `{sub}/` (của type `{type_dirs[sub]}`)')
            for sid in re.findall(r'[A-Z][A-Z0-9]*-[0-9][0-9A-Za-z.]*', fm.get('spec_ids', '')):
                if prefixes and sid.split('-')[0] not in prefixes:
                    W(n, f'spec_ids có tiền tố lạ `{sid}` (thêm vào wiki.json → prefixes nếu là tiền tố mới)')
        secs = sections(text)
        if ptype in cfg['page_types']:
            for req in cfg['page_types'][ptype].get('required', []):
                if not has_section(secs, req):
                    W(n, f'thiếu mục `## {req}`')
        if not any(has_section(secs, s) for s in cfg['terminal_sections']):
            W(n, 'không có mục `## Liên quan` (source: `## Trang chịu ảnh hưởng`)')

        if id_re:
            for sid in id_re.findall(body):
                referenced[sid.rstrip('.')] += 1
            for row in table_rows(section_body(secs, cfg['defined_section'])):
                m = id_re.match(row[0].strip('`* ')) if row else None
                if m:
                    defined.add(m.group(1).rstrip('.'))
        for kind, name, levels, sink in (('gap', cfg['gap_section'], cfg['gap_levels'], gaps),
                                         ('doc', cfg['doc_section'], cfg['doc_levels'], docgaps)):
            for row in table_rows(section_body(secs, name)):
                lvl = next((c.strip('`* ') for c in row if c.strip('`* ') in levels), None)
                if lvl:
                    sink.append({'page': n, 'key': row[0].strip('`* '), 'level': lvl})
        for m in EVIDENCE.finditer(FENCE.sub('', text)):
            path, line = m.group(1).rstrip('.'), m.group(2)
            if any(ch in path for ch in '*…<>[') or path.endswith('/'):
                continue
            full = os.path.join(repo_root, path)
            if not os.path.exists(full):
                W(n, f'bằng chứng repo:{path} không tồn tại trong repo')
            elif line and os.path.isfile(full):
                total = file_cache.get(full)
                if total is None:
                    try:
                        total = file_cache[full] = sum(1 for _ in open(full, encoding='utf-8', errors='ignore'))
                    except OSError:
                        total = file_cache[full] = 0
                if int(line) > total:
                    W(n, f'bằng chứng repo:{path}:{line} vượt cuối file ({total} dòng) — số dòng đã trôi')

    exempt = set(os.path.normpath(p) for p in cfg['orphan_exempt'])
    page_notes = [n for n in notes if n.startswith('pages' + os.sep)
                  and not any(n.startswith(os.path.join('pages', g) + os.sep) for g in cfg['generated_dirs'])]
    for n in page_notes:
        if inbound[n] == 0 and n not in exempt:
            E(n, 'trang mồ côi: không trang nào link tới')
    index = texts.get('index.md', '')
    if not index:
        E('index.md', 'không có index.md')
    else:
        linked = {os.path.normpath(unquote(h).split('#')[0]) for h in LINK.findall(CODE.sub('', index))}
        for n in page_notes:
            if n not in linked:
                W(n, 'chưa có trong index.md')
    log = texts.get('log.md', '')
    ops = '|'.join(cfg['log_ops'])
    for i, line in enumerate(log.splitlines(), 1):
        if line.startswith('## [') and not re.match(r'^## \[\d{4}-\d{2}-\d{2}\] (%s)\b.*\|' % ops, line):
            W('log.md', f'dòng {i} sai định dạng `## [YYYY-MM-DD] {ops} | Tiêu đề`')

    coverage = None
    if 'coverage' in cfg:                     # hợp đồng độ phủ (SCHEMA §6.3): chỉ chạy khi wiki.json khai báo
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            'coverage_wiki', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'coverage_wiki.py'))
        cov = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cov)
        ctx = {'wiki': root, 'cfg_wiki': cfg, 'texts': texts, 'defined': defined, 'gaps': gaps,
               'id_re': id_re, 'sections': sections, 'table_rows': table_rows}
        c_err, c_warn, coverage, _ = cov.run(ctx)
        errors += c_err
        warns += c_warn
    by_prefix = collections.Counter(s.split('-')[0] for s in referenced)
    undefined = sorted(s for s in referenced if defined and s not in defined
                       and any(d.split('-')[0] == s.split('-')[0] for d in defined))
    stats = {
        'wiki': root, 'mode': cfg['mode'], 'adopted_config': adopted,
        'pages': len(page_notes), 'notes': len(notes),
        'errors': len(errors), 'warnings': len(warns),
        'spec_ids': {'defined': len(defined), 'referenced': len(referenced),
                     'by_prefix': dict(sorted(by_prefix.items())),
                     'referenced_not_defined': undefined[:200]},
        'gaps': dict(collections.Counter(g['level'] for g in gaps)),
        'doc_vs_code': dict(collections.Counter(g['level'] for g in docgaps)),
        'open_questions': open_q, 'unchecked_claims': unchecked,
        'gap_rows': [g for g in gaps if g['level'] != 'OK'],
        'doc_rows': [g for g in docgaps if g['level'] != 'OK'],
    }
    if coverage is not None:
        stats['coverage'] = coverage
    if as_json:
        print(json.dumps(stats, ensure_ascii=False, indent=1))
    else:
        if not quiet:
            for m in errors:
                print('LỖI  ', m)
            for m in warns:
                print('CẢNH BÁO', m)
        print(f'\nwiki: {root}  (chế độ {cfg["mode"]}{"" if adopted else ", chưa có wiki.json"})')
        print(f'trang: {len(page_notes)}  · lỗi: {len(errors)}  · cảnh báo: {len(warns)}')
        print(f'mã spec: định nghĩa {len(defined)} · được nhắc {len(referenced)} · theo tiền tố {dict(sorted(by_prefix.items()))}')
        if undefined:
            print(f'mã được nhắc nhưng chưa định nghĩa: {len(undefined)} (vd. {", ".join(undefined[:8])})')
        print(f'spec ↔ code: {stats["gaps"]}')
        if docgaps:
            print(f'tài liệu ↔ code: {stats["doc_vs_code"]}')
        print(f'câu hỏi mở: {open_q}  · khẳng định chưa kiểm code: {unchecked}')
        if coverage is not None:
            print('độ phủ code ↔ wiki (0 lỗi cấu trúc ≠ đã phủ):\n' + cov.report.text(coverage))
    viewer = next((x for x in argv if x == '--viewer' or x.startswith('--viewer=')), None)
    if viewer:
        build_viewer(root, viewer.partition('=')[2] or None, quiet=as_json)
    return 1 if errors or (strict and warns) else 0


def build_viewer(root, out, quiet=False):
    """Dựng viewer tĩnh bằng wiki_viewer.py nằm CẠNH file này (tools/ của wiki, hoặc scripts/ của skill)."""
    import importlib.util
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'wiki_viewer.py')
    if not os.path.exists(path):
        print(f'(bỏ qua --viewer: không có {path})', file=sys.stderr)
        return
    spec = importlib.util.spec_from_file_location('wiki_viewer', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    if quiet:
        import contextlib, io
        with contextlib.redirect_stdout(io.StringIO()):
            mod.build(root, out)
    else:
        mod.build(root, out)


def frontmatter_raw(text):
    if not text.startswith('---'):
        return ''
    end = text.find('\n---', 3)
    return text[3:end] if end > 0 else ''


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
