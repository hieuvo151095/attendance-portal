#!/usr/bin/env python3
"""coverage_wiki.py — hợp đồng độ phủ code ↔ wiki (skill llm-wiki, SCHEMA §6.3). Chỉ đọc code của repo.

    python3 -I coverage_wiki.py <llm-wiki-dir>                     # kiểm + báo cáo (exit 1 nếu có lỗi)
    python3 -I coverage_wiki.py <wiki> --unclaimed [--owner DH]     # danh sách fact chưa claim (đầu vào brief)
    python3 -I coverage_wiki.py <wiki> --detect [--write]           # đề xuất subject + chủ cho wiki.json
    python3 -I coverage_wiki.py <wiki> --accept                     # khoá dấu vân tay các claim sau khi đọc lại code
    python3 -I coverage_wiki.py <wiki> --baseline                   # chụp baseline lần đầu / chỉ co lại về sau
    thêm --json để in số liệu máy đọc.

Chạy khi wiki.json có khoá `coverage`; lint_wiki.py tự gọi `run()`. Thiết kế: code là căn cứ hiện trạng; mọi fact
create/change/delete trên subject có chủ phải được claim trong `## Điểm chạm code`, loại trừ có ký, hoặc nằm trong
baseline (tập id chỉ co lại). 0 lỗi cấu trúc ≠ đã phủ.
"""
import datetime
import importlib.util
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "coverage"))

import claims as claims_mod  # noqa: E402
import report  # noqa: E402
import state  # noqa: E402
from common import merged_config, read_text, save_json  # noqa: E402
from mentions import classify  # noqa: E402
from scan import scan  # noqa: E402

LIVE_LEVELS = ("OK", "PARTIAL", "CONTRADICTS")


def _lint():
    spec = importlib.util.spec_from_file_location("lint_wiki", os.path.join(HERE, "lint_wiki.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def collect(wiki):
    """Ngữ cảnh như lint_wiki.py thấy: trang, mã spec đã định nghĩa, dòng gap."""
    lint = _lint()
    cfg, _ = lint.load_config(wiki)
    texts = {}
    for dp, dns, fns in os.walk(wiki):
        dns[:] = [d for d in dns if not d.startswith(".") and d not in ("tools", "raw")]
        for f in fns:
            if f.endswith(".md"):
                n = os.path.relpath(os.path.join(dp, f), wiki)
                texts[n] = read_text(os.path.join(wiki, n))
    pre = cfg["prefixes"]
    id_re = re.compile(r"(?<![A-Za-z0-9-])((?:%s)-%s)" % ("|".join(map(re.escape, sorted(pre, key=len, reverse=True))),
                                                        cfg["spec_id_suffix"])) if pre else None
    defined, gaps = set(), []
    for n, t in texts.items():
        if not n.startswith("pages" + os.sep):
            continue
        secs = lint.sections(t)
        for row in lint.table_rows(lint.section_body(secs, cfg["defined_section"])):
            m = id_re.match(row[0].strip("`* ")) if (row and id_re) else None
            if m:
                defined.add(m.group(1))
        for row in lint.table_rows(lint.section_body(secs, cfg["gap_section"])):
            lvl = next((c.strip("`* ") for c in row if c.strip("`* ") in cfg["gap_levels"]), None)
            if lvl:
                gaps.append({"page": n, "key": row[0].strip("`* "), "level": lvl})
    return {"wiki": wiki, "cfg_wiki": cfg, "texts": texts, "defined": defined, "gaps": gaps, "id_re": id_re,
            "sections": lint.sections, "table_rows": lint.table_rows}


def run(ctx, mode="check"):
    wiki, wcfg = ctx["wiki"], ctx["cfg_wiki"]
    cfg = merged_config(wcfg.get("coverage"))
    repo = os.path.normpath(os.path.join(wiki, wcfg.get("repo_root", "..")))
    wiki_rel = os.path.relpath(wiki, repo)
    errors, warns = [], []
    sr = scan(repo, cfg, HERE)
    facts = sr["facts"]
    errors += [f"coverage: {e}" for e in sr["errors"]]
    owned, unowned, now = set(), [], datetime.date.today().isoformat()
    for key in sorted(sr["subjects"]):
        conf = cfg["subjects"].get(key)
        if key not in cfg["subjects"]:
            n = sum(1 for f in facts.values() if f["subject"] == key and f["mandatory"])
            errors.append(f"coverage: unowned-subject `{key}` ({n} fact bắt buộc) — thêm vào wiki.json → coverage.subjects")
        elif not (conf or {}).get("owner"):
            unowned.append(key)
            if (conf or {}).get("deferred_until", "9999") < now:
                errors.append(f"coverage: `{key}` chưa có chủ và đã quá hạn deferred_until {conf['deferred_until']}")
        else:
            owned.add(key)
    st = state.load(wiki, cfg)
    renames = state.renames_map(st, cfg, errors)
    excluded = state.excluded_ids(st, facts, cfg, errors)
    cl = claims_mod.parse(ctx["texts"], ctx["sections"], ctx["table_rows"], cfg["claim_section"],
                          wcfg.get("generated_dirs", ["proposals"]))
    cctx = {"id_re": ctx["id_re"], "defined": ctx["defined"], "texts": ctx["texts"], "repo": repo}
    claimed, e2, w2, by_spec = claims_mod.check(cl, facts, cfg, cctx, renames, st["lock"])
    errors += e2
    warns += w2
    if mode == "accept":
        return state.write_lock(st, facts, cl, renames)
    state.stale(st, facts, claimed, errors, warns)
    fact_gaps = {i for i, f in facts.items() if f["subject"] in owned and f["mandatory"]} - claimed - excluded
    ms = classify(sr, cfg, sorted(owned))
    spec_gaps = set()
    for g in ctx["gaps"]:
        if g["level"] in LIVE_LEVELS and ctx["id_re"]:
            for sp in ctx["id_re"].findall(g["key"]):
                if not [i for i in by_spec.get(sp, []) if i in facts]:
                    spec_gaps.add(f"spec:{sp}")
    all_gaps = fact_gaps | {m["key"] for m in ms} | spec_gaps
    if mode == "baseline":
        return state.write_baseline(st, all_gaps, cfg)
    base = state.baseline_ids(st, repo, wiki_rel, cfg, errors)
    for i in sorted(fact_gaps - base):
        f = facts[i]
        errors.append(f"coverage: fact chưa claim `{i}` (dòng {','.join(map(str, f['lines'][:4]))}"
                      + (f", qua {f['via']}" if f["via"] else "") + ")")
    for m in ms:
        if m["key"] not in base:
            (errors if m["kind"] == "unclassified" else warns).append(
                f"coverage: {'lần nhắc chưa phân loại' if m['kind'] == 'unclassified' else 'tín hiệu bảng động'} "
                f"{m['path']}:{m['line']} ({m['subject']}): {m['text']}")
    for sp in sorted(spec_gaps - base):
        errors.append(f"coverage: {sp[5:]} ở mức OK/PARTIAL/CONTRADICTS nhưng không claim fact sống nào (wiki → code)")
    stats = report.summarize(cfg, facts, owned, claimed, excluded, base, all_gaps, ms, ctx["texts"])
    stats["unowned"] = unowned
    stats["design_uncovered"] = report.design_uncovered(sr, cfg)
    diff, scan_changed, head_wiki = report.config_diff(repo, wiki_rel, json.loads(read_text(os.path.join(wiki, "wiki.json"))), st, cfg)
    if scan_changed and head_wiki and head_wiki.get("coverage"):
        old = scan(repo, merged_config(head_wiki["coverage"]), HERE)["facts"]
        o = sum(1 for f in old.values() if f["subject"] in owned and f["mandatory"])
        n = sum(1 for f in facts.values() if f["subject"] in owned and f["mandatory"])
        diff.append(f"cấu hình quét đổi: fact bắt buộc {o} → {n} ({n - o:+d})")
    stats["config_diff"] = diff
    stats["claims"] = len(cl)
    return errors, warns, stats, {"facts": facts, "fact_gaps": fact_gaps, "owned": owned, "subjects": sr["subjects"]}


def detect(ctx, write):
    """Đề xuất chủ cho mỗi subject từ slug hub phân hệ (pages/overview/module-<slug>.md)."""
    wiki, wcfg = ctx["wiki"], ctx["cfg_wiki"]
    repo = os.path.normpath(os.path.join(wiki, wcfg.get("repo_root", "..")))
    cov = wcfg.get("coverage") or {}
    cfg = merged_config(cov)
    sr = scan(repo, cfg, HERE)
    hubs = {}
    for n, t in ctx["texts"].items():
        m = re.match(r"pages[\\/]overview[\\/]module-(.+)\.md$", n)
        p = re.search(r"`([A-Z][A-Z0-9]{1,7})-NN`", t) or re.search(r"\b([A-Z][A-Z0-9]{1,7})-\d+", t)
        if m and p:
            hubs[p.group(1)] = {w.rstrip("s") for w in m.group(1).split("-")}
    subjects = dict(cov.get("subjects") or {})
    later = (datetime.date.today() + datetime.timedelta(days=60)).isoformat()
    for key, s in sorted(sr["subjects"].items()):
        if key in subjects:
            continue
        toks = {w.rstrip("s") for w in s["name"].split("_")}
        cand = [p for p, ws in hubs.items() if toks & ws]
        subjects[key] = ({"owner": cand[0], "_proposed": True} if len(cand) == 1
                         else {"owner": None, "deferred_until": later, "_proposed": True})
    if write:
        raw = json.loads(read_text(os.path.join(wiki, "wiki.json")))
        raw.setdefault("coverage", {})["subjects"] = subjects
        raw["coverage"].setdefault("profiles", cfg["profiles"])
        save_json(os.path.join(wiki, "wiki.json"), raw)
    return subjects


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    wiki = os.path.abspath(args[0] if args else ".")
    ctx = collect(wiki)
    flag = lambda f: f in argv
    if flag("--detect"):
        subs = detect(ctx, flag("--write"))
        owned = sum(1 for v in subs.values() if v.get("owner"))
        print(json.dumps(subs, ensure_ascii=False, indent=1) if flag("--json") else
              f"{len(subs)} subject · có chủ đề xuất {owned} · chưa có chủ {len(subs) - owned}"
              + (" — đã ghi wiki.json (duyệt các mục _proposed)" if flag("--write") else " — thêm --write để ghi"))
        return 0
    if "coverage" not in ctx["cfg_wiki"]:
        print("wiki.json chưa có khoá `coverage` — chạy --detect --write trước", file=sys.stderr)
        return 2
    if flag("--accept"):
        n, g = run(ctx, "accept")
        print(f"đã khoá {n} fact, {g} glob vào claims.lock.json")
        return 0
    if flag("--baseline"):
        old, new = run(ctx, "baseline")
        print(f"baseline: {old} → {new} mục" + (" (chụp lần đầu)" if not old else " (chỉ co lại)"))
        return 0
    errors, warns, stats, extra = run(ctx)
    if flag("--unclaimed"):
        owner = argv[argv.index("--owner") + 1] if "--owner" in argv else None
        cfg = merged_config(ctx["cfg_wiki"]["coverage"])
        rows = [extra["facts"][i] for i in sorted(extra["fact_gaps"])
                if not owner or (cfg["subjects"].get(extra["facts"][i]["subject"]) or {}).get("owner") == owner
                or owner in (cfg["subjects"].get(extra["facts"][i]["subject"]) or {}).get("co_owners", [])]
        out = [{"id": f["id"], "lines": f["lines"], "fp": f["fp"], "via": f["via"]} for f in rows]
        print(json.dumps(out, ensure_ascii=False, indent=1) if flag("--json") else "\n".join(f["id"] for f in out))
        return 0
    if flag("--json"):
        print(json.dumps({"errors": errors, "warnings": warns, **stats}, ensure_ascii=False, indent=1))
    else:
        for e in errors:
            print("LỖI  ", e)
        for w in warns:
            print("CẢNH BÁO", w)
        print(f"\ncoverage: lỗi {len(errors)} · cảnh báo {len(warns)} · claim {stats['claims']}")
        print(report.text(stats))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
