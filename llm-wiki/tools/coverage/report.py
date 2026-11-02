"""report.py — số liệu, diff cấu hình so với git HEAD, và phần "chưa phủ theo thiết kế" (coverage, skill llm-wiki)."""
import collections
import json
import os
import re

from common import file_role, git_show_json

SCAN_KEYS = ("scan", "roles", "mandatory_roles", "report_only_roles", "profiles", "custom_profiles",
             "verbs_mandatory", "schema_import_re", "extensions")


def config_diff(repo, wiki_rel, wiki_raw_cfg, st, cfg):
    """Dòng mô tả mọi thay đổi của file quyết định so với HEAD. Agent không được tự đổi các file này."""
    lines, scan_changed = [], False
    rel = lambda p: os.path.join(wiki_rel, p).replace(os.sep, "/")
    head_wiki = git_show_json(repo, "HEAD", rel("wiki.json"))
    if head_wiki is not None:
        old, new = head_wiki.get("coverage") or {}, wiki_raw_cfg.get("coverage") or {}
        for k in sorted(set(old) | set(new)):
            if json.dumps(old.get(k), sort_keys=True) != json.dumps(new.get(k), sort_keys=True):
                if k == "subjects":
                    o, n = old.get(k) or {}, new.get(k) or {}
                    moved = [s for s in set(o) & set(n) if (o[s] or {}).get("owner") != (n[s] or {}).get("owner")]
                    lines.append(f"wiki.json coverage.subjects: +{len(set(n) - set(o))} −{len(set(o) - set(n))}, đổi chủ {len(moved)}")
                else:
                    lines.append(f"wiki.json coverage.{k} đã đổi so với HEAD")
                    scan_changed |= k in SCAN_KEYS
    for name, key in (("exclusions", lambda e: e.get("id") or e.get("glob")), ("renames", lambda e: e.get("from"))):
        head = git_show_json(repo, "HEAD", rel(cfg["files"][name]))
        if head is None and not st[name]:
            continue
        o, n = {key(e) for e in head or []}, {key(e) for e in st[name]}
        if o != n:
            lines.append(f"{cfg['files'][name]}: +{len(n - o)} −{len(o - n)} so với HEAD")
    head_b = git_show_json(repo, "HEAD", rel(cfg["files"]["baseline"]))
    o = {e["id"] for e in (head_b or {}).get("entries", [])}
    n = {e["id"] for e in st["baseline"].get("entries", [])}
    if o != n:
        lines.append(f"{cfg['files']['baseline']}: +{len(n - o)} −{len(o - n)} so với HEAD")
    head_l = git_show_json(repo, "HEAD", rel(cfg["files"]["lock"]))
    ol, nl = (head_l or {}).get("facts", {}), st["lock"].get("facts", {})
    changed = [i for i in set(ol) | set(nl) if ol.get(i) != nl.get(i)]
    if changed:
        lines.append(f"{cfg['files']['lock']}: {len(changed)} dấu vân tay được khoá lại so với HEAD")
    return lines, scan_changed, head_wiki


def design_uncovered(scan_result, cfg):
    pats = scan_result["profiles"].get("design_uncovered", {})
    counts = collections.Counter()
    for path, (_, stripped) in scan_result["texts"].items():
        if file_role(path, cfg) != "prod":
            continue
        for k, rx in pats.items():
            counts[k] += len(re.findall(rx, stripped))
    return dict(counts)


def summarize(cfg, facts, owned, claimed, excluded, base, gaps, mentions, wiki_texts):
    cited = set()
    for t in wiki_texts.values():
        cited |= set(re.findall(r"repo:([A-Za-z0-9_./@()\[\]+~-]+?)(?::\d|[\s`|),;]|$)", t))
    by_subject = {}
    for key in sorted(owned):
        fs = [f for f in facts.values() if f["subject"] == key and f["mandatory"]]
        ids = {f["id"] for f in fs}
        unc = ids - claimed - excluded
        denom = len(ids - excluded)
        by_subject[key] = {
            "owner": (cfg["subjects"].get(key) or {}).get("owner"),
            "mandatory": len(ids), "claimed": len(ids & claimed), "excluded": len(ids & excluded),
            "baselined": len(unc & base), "unclaimed": len(unc - base),
            "coverage_pct": round(100 * len(ids & claimed) / denom, 1) if denom else 100.0,
            "hint_mentioned": len({i for i in unc if facts[i]["path"] in cited}),
            "hint_not_mentioned": len({i for i in unc if facts[i]["path"] not in cited}),
        }
    by_prefix = collections.defaultdict(lambda: collections.Counter())
    for v in by_subject.values():
        for k in ("mandatory", "claimed", "excluded", "baselined", "unclaimed"):
            by_prefix[v["owner"]][k] += v[k]
    kinds = collections.Counter((m["kind"], m["key"] in base) for m in mentions)
    return {
        "by_subject": by_subject,
        "by_prefix": {p: dict(c) for p, c in by_prefix.items()},
        "mentions": {"unclassified_new": kinds[("unclassified", False)], "unclassified_baselined": kinds[("unclassified", True)],
                     "dynamic_new": kinds[("dynamic", False)], "dynamic_baselined": kinds[("dynamic", True)]},
        "gaps_total": len(gaps), "baseline_size": len(base),
    }


def text(stats):
    out = []
    for key, v in stats["by_subject"].items():
        out.append(f"  {key:<34} chủ {v['owner'] or '—':<6} phủ {v['coverage_pct']:>5}%  "
                   f"bắt buộc {v['mandatory']:>3} · claim {v['claimed']:>3} · loại trừ {v['excluded']:>2} · "
                   f"baseline {v['baselined']:>3} · CHƯA CLAIM {v['unclaimed']:>3}"
                   + (f"  (gợi ý: {v['hint_mentioned']} được nhắc, {v['hint_not_mentioned']} không được nhắc)"
                      if v['hint_mentioned'] + v['hint_not_mentioned'] else ""))
    m = stats["mentions"]
    out.append(f"  lần nhắc chưa phân loại: mới {m['unclassified_new']} · trong baseline {m['unclassified_baselined']}"
               f" · tín hiệu bảng động: mới {m['dynamic_new']} · trong baseline {m['dynamic_baselined']}")
    if stats.get("unowned"):
        out.append(f"  subject chưa có chủ: {len(stats['unowned'])} (vd. {', '.join(stats['unowned'][:5])})")
    du = stats.get("design_uncovered") or {}
    if du:
        out.append("  chưa phủ theo thiết kế (chỉ đếm): " + " · ".join(f"{k} {v}" for k, v in sorted(du.items())))
    for line in stats.get("config_diff") or []:
        out.append(f"  THAY ĐỔI QUYẾT ĐỊNH: {line}")
    return "\n".join(out)
