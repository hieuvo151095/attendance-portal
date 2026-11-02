"""claims.py — đọc claim trong mục `## Điểm chạm code` và kiểm chất lượng (coverage, skill llm-wiki)."""
import fnmatch
import os
import re

from common import read_text

EVID = re.compile(r"repo:([A-Za-z0-9_./@()\[\]+~-]+?)(?::(\d+)(?:[-–](\d+))?)?(?=[\s`|),;]|$)")
IMPORT_LINE = re.compile(r"^\s*(?:import\b|export\s+\{|export\s+\*|from\s+\S+\s+import\b|const\s+\w+\s*=\s*require\()")
TOKEN = re.compile(r"[A-Za-z_][A-Za-z0-9_]{2,}")
HEADER = {"fact", "fact id", "sự kiện"}


def page_prefixes(text, id_re):
    m = re.search(r"^spec_ids:\s*(.*)$", text, re.M)
    ids = id_re.findall(m.group(1)) if (m and id_re) else []
    return {i.split("-")[0] for i in ids}


def parse(texts, sections, table_rows, section_name, generated_dirs):
    claims = []
    for page, text in texts.items():
        if not page.startswith("pages" + os.sep) or any(page.startswith(os.path.join("pages", g) + os.sep)
                                                       for g in generated_dirs):
            continue
        secs = sections(text)
        body = "\n".join(v for k, v in secs.items() if k.lower().startswith(section_name.lower()))
        for row in table_rows(body):
            fact = row[0].strip()
            if fact.startswith("**") and fact.endswith("**"):
                fact = fact[2:-2]
            fact = fact.strip("` ")                 # không strip `*`: glob bắt đầu/kết thúc bằng *
            if len(row) < 2 or fact.lower() in HEADER:
                continue
            claims.append({"page": page, "fact": fact, "behaviour": row[1] if len(row) > 1 else "",
                           "evidence": row[2] if len(row) > 2 else "", "spec": row[3] if len(row) > 3 else "",
                           "glob": "*" in fact})
    return claims


def owners_of(subject, cfg):
    conf = cfg["subjects"].get(subject) or {}
    return {conf.get("owner")} | set(conf.get("co_owners", [])) - {None}


def check(claims, facts, cfg, ctx, renames, lock):
    """→ (claimed_ids, errors, warnings, spec_claims{spec: [fact ids]})."""
    errors, warns, claimed, by_spec = [], [], set(), {}
    id_re, defined, texts, repo = ctx["id_re"], ctx["defined"], ctx["texts"], ctx["repo"]
    seen_beh = []
    for c in claims:
        where = f'{c["page"]}'
        fid = renames.get(c["fact"], c["fact"])
        if c["glob"]:
            ids = sorted(i for i in facts if fnmatch.fnmatchcase(i, fid))
            locked = (lock.get("globs") or {}).get(c["fact"])
            if locked is None:
                errors.append(f'{where}: glob claim `{c["fact"]}` chưa khoá danh sách id — chạy coverage_wiki.py --accept sau khi đọc lại')
            elif sorted(locked) != ids:
                new, gone = sorted(set(ids) - set(locked)), sorted(set(locked) - set(ids))
                errors.append(f'{where}: glob `{c["fact"]}` đổi tập fact (+{len(new)} −{len(gone)}), vd. {(new or gone)[0]} — mô tả lại rồi --accept')
            targets = ids
        else:
            if fid not in facts:
                errors.append(f'{where}: claim trỏ tới fact không còn tồn tại `{c["fact"]}` (đổi tên? khai báo coverage/renames.json có ký)')
                continue
            targets = [fid]
            _evidence(c, facts[fid], cfg, repo, errors, where)
        specs = id_re.findall(c["spec"]) if id_re else []
        if not specs:
            errors.append(f'{where}: claim `{c["fact"]}` thiếu mã spec')
        for sp in specs:
            if defined and sp not in defined:
                errors.append(f'{where}: mã spec {sp} trong claim chưa được định nghĩa ở trang source nào')
        if not c["behaviour"].strip():
            errors.append(f'{where}: claim `{c["fact"]}` thiếu mô tả hành vi')
        for t in targets:
            f = facts[t]
            own = owners_of(f["subject"], cfg)
            if own and specs and not ({s.split("-")[0] for s in specs} & own):
                errors.append(f'{where}: claim `{t}` dùng mã {specs[0]} không thuộc chủ {sorted(own)} của {f["subject"]}')
            if own and not (page_prefixes(texts[c["page"]], id_re) & own):
                errors.append(f'{where}: claim về {f["subject"]} đặt ở trang không thuộc chủ {sorted(own)}')
            claimed.add(t)
            for sp in specs:
                by_spec.setdefault(sp, []).append(t)
        _heuristics(c, [facts[t] for t in targets], seen_beh, warns, where)
    return claimed, errors, warns, by_spec


def _evidence(c, f, cfg, repo, errors, where):
    evs = [(p, int(a), int(b or a)) for p, a, b in EVID.findall(c["evidence"]) if a]
    if not evs:
        errors.append(f'{where}: claim `{f["id"]}` thiếu bằng chứng repo:path:dòng')
        return
    lo, hi = f["range"]
    ok = False
    for p, a, b in evs:
        if p != f["path"]:
            continue
        if b - a + 1 > cfg["max_evidence_span"]:
            errors.append(f'{where}: bằng chứng repo:{p}:{a}-{b} dài {b - a + 1} dòng > {cfg["max_evidence_span"]}')
            continue
        try:
            line = read_text(os.path.join(repo, p)).splitlines()[a - 1]
        except (OSError, IndexError):
            line = ""
        if IMPORT_LINE.match(line):
            errors.append(f'{where}: bằng chứng repo:{p}:{a} là dòng import, không chứng minh hành vi')
            continue
        if lo <= a and b <= hi:
            ok = True
    if not ok:
        errors.append(f'{where}: không có bằng chứng nằm trong thân `{f["symbol"]}` (dòng {lo}-{hi}) của {f["path"]}')


def _heuristics(c, targets, seen, warns, where):
    words = {w.lower() for w in TOKEN.findall(c["behaviour"])}
    if len(c["behaviour"].split()) < 6:
        warns.append(f'{where}: mô tả của `{c["fact"]}` quá ngắn (< 6 từ)')
    domain = set()
    for f in targets:
        domain |= {x.lower() for x in f["fp"]} | {f["subject"].split(":")[-1].lower()}
    domain_hit = words & domain or any(d.replace("_", "") in c["behaviour"].lower().replace("_", "") for d in domain if len(d) > 3)
    if targets and not domain_hit:
        warns.append(f'{where}: mô tả của `{c["fact"]}` không nhắc thuật ngữ nào của fact (cột/literal: {", ".join(sorted(domain)[:5])})')
    for other in seen:
        if words and len(words & other) / max(1, len(words | other)) >= 0.8:
            warns.append(f'{where}: mô tả của `{c["fact"]}` gần trùng nguyên văn một claim khác')
            break
    seen.append(words)
