"""scan.py — dựng kho fact từ code (coverage, skill llm-wiki): subject + alias, fact create/change/delete,
dấu vân tay (cột + literal được ghi, hash thân symbol), nơi gọi write_surface."""
import json
import os
import re

from common import changed_files, file_role, read_text, line_of, line_starts, merge_base, sha, strip_comments, walk
from symbols import enclosing, symbol_table

KEY_RE = re.compile(r"\b([a-z_][A-Za-z0-9_]{1,40})\s*:")
LIT_RE = re.compile(r"""['"]([A-Z][A-Z0-9_]{2,40})['"]""")
COLS_RE = re.compile(r"(?is)^\s*\"?[\w.]+\"?\s*\(([^)]{1,800})\)")
WORD_RE = re.compile(r"[A-Za-z_$][\w$]*")


def load_profiles(skill_scripts, cfg):
    base = json.loads(read_text(os.path.join(skill_scripts, "coverage_profiles.json")))
    base.update(cfg.get("custom_profiles", {}))
    return base, [base[p] for p in cfg["profiles"] if p in base]


def sub(rx, name, aliases):
    alias = "|".join(re.escape(a) for a in sorted(aliases, key=len, reverse=True)) or r"(?!x)x"
    return rx.replace("{name}", re.escape(name)).replace("{alias}", alias)


def statement(text, pos, limit=2500):
    """Đoạn câu lệnh từ pos tới `;` ở độ sâu 0 (hoặc limit ký tự)."""
    depth, end = 0, min(len(text), pos + limit)
    for i in range(pos, end):
        c = text[i]
        if c in "([{":
            depth += 1
        elif c in ")]}":
            depth -= 1
            if depth < 0:
                return text[pos:i]
        elif c == ";" and depth <= 0:
            return text[pos:i]
    return text[pos:end]


def fingerprint(stmt, after_table):
    cols = set(KEY_RE.findall(stmt)) | set(LIT_RE.findall(stmt))
    m = COLS_RE.match(after_table)
    if m:
        cols |= {c.strip().strip('"') for c in m.group(1).split(",") if re.match(r"^\s*\"?\w+\"?\s*$", c)}
    cols |= set(re.findall(r"(?i)\bset\s+(\w+)\s*=", stmt)) | set(re.findall(r"(?i),\s*(\w+)\s*=", stmt))
    return cols


def discover(texts, profiles):
    subjects, errors = {}, []
    for path, (raw, stripped) in texts.items():
        for prof in profiles:
            found = 0
            for d in prof.get("discover", []):
                for m in re.finditer(d["re"], stripped):
                    name = m.group(d["name"])
                    s = subjects.setdefault(f'{d["kind"]}:{name}', {"kind": d["kind"], "name": name,
                                                                   "aliases": {name}, "decl": []})
                    if d.get("alias"):
                        s["aliases"].add(m.group(d["alias"]))
                        found += 1
                    s["decl"].append(f"{path}:{stripped.count(chr(10), 0, m.start()) + 1}")
            st = prof.get("self_test")
            if st:
                total = len(re.findall(st, stripped))
                if total > found:
                    errors.append(f"{path}: {total - found} khai báo bảng không sinh được alias "
                                  f"(sửa mẫu discover của profile) — bảng đó sẽ bị bỏ sót")
    owner = {a: s for s in subjects.values() for a in s["aliases"] if a != s["name"]}
    for prof in profiles:
        rx = prof.get("alias_rename")
        if not rx or not owner:
            continue
        pat = re.compile(sub(rx, "", set(owner)))
        for _, stripped in texts.values():
            if " as " in stripped:
                for src, new in pat.findall(stripped):
                    if new not in ("any", "unknown", "const", "never"):
                        owner[src]["aliases"].add(new)
    return subjects, errors


def read_texts(repo, cfg):
    texts = {}
    for rel in walk(repo, cfg):
        try:
            raw = read_text(os.path.join(repo, rel))
        except OSError:
            continue
        if len(raw) > 2_000_000:
            continue
        texts[rel] = (raw, strip_comments(raw, rel))
    return texts


def scan(repo, cfg, skill_scripts):
    all_prof, profiles = load_profiles(skill_scripts, cfg)
    texts = read_texts(repo, cfg)
    subjects, errors = discover(texts, profiles)
    fn_block = all_prof.get("sql", {}).get("function_block")
    base = merge_base(repo, cfg.get("base_ref"))
    diff = changed_files(repo, base) if cfg.get("report_only_roles") else set()
    names = {}
    for key, s in subjects.items():
        for a in s["aliases"]:
            names.setdefault(a, set()).add(key)
    compiled = {key: [(f["verb"], re.compile(sub(f["re"], s["name"], s["aliases"])))
                      for p in profiles for f in p.get("facts", [])] for key, s in subjects.items()}
    facts, symtabs, bodies = {}, {}, {}
    for path, (raw, stripped) in texts.items():
        hit = {k for w in set(WORD_RE.findall(stripped)) & names.keys() for k in names[w]}
        if not hit:
            continue
        role = file_role(path, cfg)
        starts = line_starts(stripped)
        table = symtabs[path] = symbol_table(stripped, path, fn_block)
        raw_lines = raw.splitlines()
        for key in hit:
            for verb, rx in compiled[key]:
                if verb not in cfg["verbs_mandatory"]:
                    continue
                for m in rx.finditer(stripped):
                    ln = line_of(starts, m.start())
                    a, b, sym = enclosing(table, ln)
                    fid = f"{verb}:{key}@{path}#{sym}"
                    f = facts.setdefault(fid, {"id": fid, "verb": verb, "subject": key, "path": path,
                                               "symbol": sym, "role": role, "lines": [], "fp": set(),
                                               "range": [a, b or len(raw_lines)], "via": None})
                    f["lines"].append(ln)
                    f["fp"] |= fingerprint(statement(stripped, m.start()), stripped[m.end():m.end() + 900])
                    rk = (path, a, b)
                    if rk not in bodies:
                        bodies[rk] = sha("\n".join(raw_lines[a - 1:(b or len(raw_lines))]))
                    f["body"] = bodies[rk]
    _surfaces(texts, cfg, subjects, facts, symtabs, fn_block)
    for f in facts.values():
        f["mandatory"] = _mandatory(f, cfg, diff)
        f["fp"] = sorted(f["fp"])
        f["lines"] = sorted(set(f["lines"]))
    return {"subjects": subjects, "facts": facts, "texts": texts, "errors": errors, "symtabs": symtabs,
            "profiles": all_prof, "active_profiles": profiles}


def _surfaces(texts, cfg, subjects, facts, symtabs, fn_block):
    for key, conf in cfg["subjects"].items():
        for fn in (conf or {}).get("write_surface", []):
            call = re.compile(r"(?<![\w$])" + re.escape(fn) + r"\s*\(")
            for path, (raw, stripped) in texts.items():
                if fn not in stripped:
                    continue
                starts = line_starts(stripped)
                table = symtabs.get(path) or symtabs.setdefault(path, symbol_table(stripped, path, fn_block))
                lines = stripped.splitlines()
                for m in call.finditer(stripped):
                    ln = line_of(starts, m.start())
                    if re.search(r"(?:function\s*\*?\s*|def\s+)$", stripped[max(0, m.start() - 20):m.start()]):
                        continue                         # chính định nghĩa hàm
                    a, b, sym = enclosing(table, ln)
                    if sym.split(".")[-1] == fn:
                        continue                         # định nghĩa (const fn = …) hoặc đệ quy
                    fid = f"change:{key}@{path}#{sym}"
                    f = facts.setdefault(fid, {"id": fid, "verb": "change", "subject": key, "path": path,
                                               "symbol": sym, "role": file_role(path, cfg), "lines": [],
                                               "fp": set(), "range": [a, b or len(lines)], "via": fn,
                                               "body": sha("\n".join(raw.splitlines()[a - 1:(b or len(lines))]))})
                    f["lines"].append(ln)
                    f["fp"].add(f"via:{fn}")


def _mandatory(f, cfg, diff):
    role = f["role"]
    if role == "migration":
        return f["symbol"] != "module"          # chỉ fact trong thân CREATE FUNCTION (chạy lúc runtime)
    if role in cfg.get("report_only_roles", []):
        return f["path"] in diff                # script: chỉ bắt buộc khi nằm trong diff hiện tại
    return role in cfg["mandatory_roles"]
