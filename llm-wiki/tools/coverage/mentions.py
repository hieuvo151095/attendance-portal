"""mentions.py — phân loại MỌI lần nhắc alias của subject (coverage, skill llm-wiki).

Lần nhắc không khớp mẫu write/read/schema/import nào, và không phải noise, là `unclassified`: một chỗ code nhắc
tới bảng mà công cụ không hiểu → người phải xem. Chuỗi production trùng ĐÚNG tên bảng là `dynamic` (dấu hiệu
`FROM ${table}`), không bao giờ là noise.
"""
import re

from common import file_role, line_of, line_starts, sha
from scan import sub
from symbols import enclosing

IMPORT_BLOCK = re.compile(r"import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*(['\"][^'\"]+['\"])")
IMPORT_NS = re.compile(r"import\s+\*\s+as\s+(\w+)\s+from\s*(['\"][^'\"]+['\"])")


def _spans(rxs, text):
    out = []
    for rx in rxs:
        out += [(m.start(), m.end()) for m in rx.finditer(text)]
    return out


def _inside(spans, a, b):
    return next((s for s in spans if s[0] <= a and b <= s[1]), None)


def classify(scan_result, cfg, subject_keys):
    subjects, texts, symtabs = scan_result["subjects"], scan_result["texts"], scan_result["symtabs"]
    noise = scan_result["profiles"].get("noise", {})
    ui_ext = tuple(noise.get("ui_extensions", []))
    sqlkw = re.compile(noise.get("sql_keywords", r"(?!x)x"))
    string_re = re.compile(noise.get("string_re", r"(?!x)x"))
    log_re = re.compile(noise.get("log_call_re", r"(?!x)x"))
    schema_src = re.compile(cfg["schema_import_re"])
    decl_files = {d.split(":")[0] for k in subject_keys for d in subjects.get(k, {}).get("decl", [])}
    mandatory = set(cfg["mandatory_roles"])
    per = {}
    for key in subject_keys:
        s = subjects.get(key)
        if not s:
            continue
        rxs = []
        for p in scan_result["active_profiles"]:
            pats = [f["re"] for f in p.get("facts", [])] + p.get("read", []) + p.get("schema", []) + p.get("import", [])
            rxs += [re.compile(sub(x, s["name"], s["aliases"]), re.M) for x in pats]
        word = re.compile(r"(?<![\w$])(" + "|".join(map(re.escape, sorted(s["aliases"], key=len, reverse=True))) + r")(?![\w$])")
        per[key] = (s, rxs, word)
    out = []
    for path, (raw, stripped) in texts.items():
        if path.endswith(ui_ext) or file_role(path, cfg) not in mandatory:
            continue
        hits = [(k, v) for k, v in per.items() if any(a in stripped for a in v[0]["aliases"])]
        if not hits:
            continue
        starts = line_starts(stripped)
        strings = [(m.start(), m.end()) for m in string_re.finditer(stripped)]
        imported, namespaces = set(), set()
        for m in IMPORT_BLOCK.finditer(stripped):
            if schema_src.search("from " + m.group(2)):
                imported |= {x.strip().split(" as ")[-1].strip() for x in m.group(1).split(",")}
        for m in IMPORT_NS.finditer(stripped):
            if schema_src.search("from " + m.group(2)):
                namespaces.add(m.group(1))
        lines = raw.splitlines()
        for key, (s, rxs, word) in hits:
            covered = _spans(rxs, stripped)
            for m in word.finditer(stripped):
                if _inside(covered, m.start(), m.end()):
                    continue
                ln = line_of(starts, m.start())
                text_line = lines[ln - 1] if ln <= len(lines) else ""
                kind = _kind(m, s, stripped, strings, sqlkw, imported, namespaces, path in decl_files,
                             log_re, text_line, file_role(path, cfg))
                if kind is None:
                    continue
                sym = enclosing(symtabs.get(path, []), ln)[2]
                out.append({"key": f"mention:{key}@{path}#{sym}:{sha(text_line, 8)}", "subject": key,
                            "path": path, "line": ln, "kind": kind, "text": text_line.strip()[:140]})
    seen, uniq = set(), []
    for m in out:
        if m["key"] not in seen:
            seen.add(m["key"]); uniq.append(m)
    return uniq


def _kind(m, s, text, strings, sqlkw, imported, namespaces, is_decl, log_re, line, role):
    st = _inside(strings, m.start(), m.end())
    if st:
        content = text[st[0] + 1:st[1] - 1]
        if content.strip().strip('"') == s["name"]:
            return "dynamic" if role == "prod" else None
        if not sqlkw.search(content) or ("/" in content and not re.search(r"\s", content)):
            return None                     # nhãn, thông điệp, URL/đường dẫn
        return None if log_re.search(line) else "unclassified"
    prefix = text[max(0, m.start() - 40):m.start()].rstrip()
    via_ns = any(prefix.endswith(ns + ".") for ns in namespaces)
    if not (m.group(1) in imported or via_ns or is_decl):
        return None                         # identifier không import từ schema: biến khác trùng tên
    return None if log_re.search(line) else "unclassified"
