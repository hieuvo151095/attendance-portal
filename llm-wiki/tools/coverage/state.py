"""state.py — exclusions, renames, baseline, claims.lock (coverage, skill llm-wiki).

Chống biến các file quyết định thành chỗ giấu lỗi:
- exclusion ngoài `test`/`generated` phải có `signed_by` là người, `out-of-phase` phải có `expires`;
- glob exclusion lưu danh sách id; tập id đổi → lỗi;
- baseline là TẬP id: id nào không có ở baseline tham chiếu (merge-base, hoặc HEAD) → lỗi; mục quá hạn → lỗi;
- subject trong `scope.subjects` không được có mục baseline.
"""
import datetime
import fnmatch
import os

from common import git_show_json, load_json, merge_base, save_json

AUTO_REASONS = {"test", "generated"}
REASONS = AUTO_REASONS | {"dead-code", "one-off-script", "out-of-phase", "false-positive"}


def today():
    return datetime.date.today().isoformat()


def load(wiki, cfg):
    p = {k: os.path.join(wiki, v) for k, v in cfg["files"].items()}
    return {"paths": p,
            "exclusions": load_json(p["exclusions"], []),
            "renames": load_json(p["renames"], []),
            "baseline": load_json(p["baseline"], {"entries": []}),
            "lock": load_json(p["lock"], {"facts": {}, "globs": {}})}


def _human(signed, cfg):
    s = (signed or "").strip().lower()
    return bool(s) and not any(a == s or s.startswith(a + " ") for a in cfg["agent_names"])


def renames_map(st, cfg, errors):
    out = {}
    for r in st["renames"]:
        if not _human(r.get("signed_by"), cfg):
            errors.append(f'coverage/renames.json: đổi tên {r.get("from")} → {r.get("to")} thiếu chữ ký người')
            continue
        out[r["from"]] = r["to"]
    return out


def excluded_ids(st, facts, cfg, errors):
    out, now = set(), today()
    for e in st["exclusions"]:
        target = e.get("id") or e.get("glob")
        reason = e.get("reason")
        where = f"coverage/exclusions.json [{target}]"
        if reason not in REASONS:
            errors.append(f"{where}: lý do lạ `{reason}` (cho phép: {', '.join(sorted(REASONS))})"); continue
        if reason not in AUTO_REASONS and not _human(e.get("signed_by"), cfg):
            errors.append(f"{where}: lý do `{reason}` cần `signed_by` là người duyệt, không phải agent"); continue
        if not (e.get("evidence") or "").strip():
            errors.append(f"{where}: thiếu `evidence`"); continue
        if reason == "out-of-phase" and not e.get("expires"):
            errors.append(f"{where}: `out-of-phase` phải có `expires`"); continue
        if e.get("expires") and e["expires"] < now:
            errors.append(f"{where}: đã hết hạn {e['expires']}"); continue
        if e.get("glob"):
            ids = sorted(i for i in facts if fnmatch.fnmatchcase(i, e["glob"]))
            if sorted(e.get("ids") or []) != ids:
                errors.append(f"{where}: tập fact của glob đã đổi ({len(e.get('ids') or [])} → {len(ids)}) — duyệt lại"); continue
            out |= set(ids)
        else:
            out.add(e["id"])
    return out


def baseline_ids(st, repo, wiki_rel, cfg, errors):
    entries = st["baseline"].get("entries", [])
    now = today()
    rel = os.path.join(wiki_rel, cfg["files"]["baseline"]).replace(os.sep, "/")
    mb = merge_base(repo, cfg.get("base_ref"))
    ref = git_show_json(repo, mb, rel) if mb else None
    ref_name = "merge-base"
    if ref is None:
        ref, ref_name = git_show_json(repo, "HEAD", rel), "HEAD"
    ref_ids = {e["id"] for e in (ref or {}).get("entries", [])} if ref is not None else None
    scope = set((cfg.get("scope") or {}).get("subjects", []))
    out = set()
    for e in entries:
        i = e["id"]
        if ref_ids is not None and i not in ref_ids:
            errors.append(f"coverage/baseline.json: id mới so với {ref_name} `{i}` — baseline chỉ được co lại"); continue
        if e.get("expires") and e["expires"] < now:
            errors.append(f"coverage/baseline.json: mục quá hạn {e['expires']} `{i}` — claim hoặc exclusion trước hạn"); continue
        subj = i.split("@")[0].split(":", 1)[-1] if i.startswith(("create:", "change:", "delete:")) else \
            i.split("@")[0].replace("mention:", "")
        if subj in scope:
            errors.append(f"coverage/baseline.json: `{i}` thuộc subject trong scope.subjects — phải phủ 100%, không baseline"); continue
        out.add(i)
    return out


def write_baseline(st, gaps, cfg):
    """Chưa có baseline → chụp mọi gap. Đã có → chỉ CO lại (giữ id vẫn còn là gap), không bao giờ thêm."""
    old = st["baseline"].get("entries", [])
    ttl = datetime.timedelta(days=cfg["baseline_ttl_days"])
    exp = (datetime.date.today() + ttl).isoformat()
    if old:
        entries = [e for e in old if e["id"] in gaps]
    else:
        entries = [{"id": g, "added": today(), "expires": exp} for g in sorted(gaps)]
    save_json(st["paths"]["baseline"], {"entries": entries})
    return len(old), len(entries)


def write_lock(st, facts, claims, renames):
    lock = {"facts": {}, "globs": {}}
    for c in claims:
        fid = renames.get(c["fact"], c["fact"])
        if c["glob"]:
            ids = sorted(i for i in facts if fnmatch.fnmatchcase(i, fid))
            lock["globs"][c["fact"]] = ids
        else:
            ids = [fid] if fid in facts else []
        for i in ids:
            lock["facts"][i] = {"fp": facts[i]["fp"], "body": facts[i].get("body", "")}
    save_json(st["paths"]["lock"], lock)
    return len(lock["facts"]), len(lock["globs"])


def stale(st, facts, claimed, errors, warns):
    lf = st["lock"].get("facts", {})
    for i in sorted(claimed):
        f, old = facts.get(i), lf.get(i)
        if not f:
            continue
        if old is None:
            warns.append(f"coverage: claim `{i}` chưa khoá dấu vân tay — đọc lại code rồi chạy --accept")
        elif sorted(old.get("fp", [])) != f["fp"]:
            new, gone = sorted(set(f["fp"]) - set(old["fp"])), sorted(set(old["fp"]) - set(f["fp"]))
            errors.append(f"coverage: claim cũ `{i}` — cột/literal được ghi đã đổi (+{new[:4]} −{gone[:4]}); mô tả lại rồi --accept")
        elif old.get("body") and old["body"] != f.get("body"):
            warns.append(f"coverage: thân `{f['symbol']}` đã đổi kể từ lần khoá — đọc lại claim `{i}`")
