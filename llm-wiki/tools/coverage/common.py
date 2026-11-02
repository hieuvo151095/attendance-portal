"""common.py — tiện ích dùng chung cho coverage (skill llm-wiki). Chỉ dùng stdlib."""
import fnmatch
import hashlib
import json
import os
import re
import subprocess

DEFAULTS = {
    "scan": {"include": ["."],
             "exclude": ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**", "**/.next/**",
                         "**/.turbo/**", "**/coverage/**", "**/.gitnexus/**", "**/.claude/**", "**/.agents/**", "**/.gemini/**", "**/.harness/**",
                         "**/.harness-state/**", "llm-wiki/**", "**/*.min.js"]},
    "extensions": [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".sql", ".py", ".rb", ".java", ".go", ".prisma"],
    "roles": {"test": ["**/__tests__/**", "**/*.test.*", "**/*.spec.*", "tests/**", "**/e2e/**", "test/**"],
              "script": ["scripts/**", "**/scripts/**"],
              "migration": ["**/migrations/**", "**/migration/**"],
              "generated": ["**/generated/**", "**/*.gen.*"]},
    "mandatory_roles": ["prod", "migration"],
    "report_only_roles": ["script"],
    "profiles": ["sql", "drizzle"],
    "verbs_mandatory": ["create", "change", "delete"],
    "claim_section": "Điểm chạm code",
    "max_evidence_span": 30,
    "baseline_ttl_days": 60,
    "base_ref": "",
    "agent_names": ["claude", "gemini", "antigravity", "agent", "llm", "ai", "assistant"],
    "schema_import_re": r"from\s+['\"][^'\"]*(?:database|schema|db|models?)[^'\"]*['\"]",
    "files": {"baseline": "coverage/baseline.json", "exclusions": "coverage/exclusions.json",
              "renames": "coverage/renames.json", "lock": "coverage/claims.lock.json"},
}


def merged_config(raw):
    cfg = json.loads(json.dumps(DEFAULTS))
    for k, v in (raw or {}).items():
        if isinstance(v, dict) and isinstance(cfg.get(k), dict) and k not in ("subjects",):
            cfg[k] = {**cfg[k], **v}
        else:
            cfg[k] = v
    cfg.setdefault("subjects", {})
    return cfg


def glob_match(path, patterns):
    p = path.replace(os.sep, "/")
    for pat in patterns:
        if fnmatch.fnmatchcase(p, pat) or (pat.startswith("**/") and fnmatch.fnmatchcase(p, pat[3:])):
            return True
    return False


def file_role(path, cfg):
    for role in ("generated", "test", "migration", "script"):
        if glob_match(path, cfg["roles"].get(role, [])):
            return role
    return "prod"


def walk(repo, cfg):
    exts = tuple(cfg["extensions"])
    excl = cfg["scan"]["exclude"]
    for inc in cfg["scan"]["include"]:
        base = os.path.normpath(os.path.join(repo, inc))
        for dp, dns, fns in os.walk(base):
            rel_dir = os.path.relpath(dp, repo).replace(os.sep, "/")
            sub = (lambda d: d) if rel_dir == "." else (lambda d: f"{rel_dir}/{d}")
            dns[:] = [d for d in dns if not glob_match(f"{sub(d)}/x", excl)]
            for f in fns:
                rel = os.path.relpath(os.path.join(dp, f), repo).replace(os.sep, "/")
                if f.endswith(exts) and not glob_match(rel, excl):
                    yield rel


_TOKENS = {
    "js": re.compile(r"(//[^\n]*|/\*[\s\S]*?\*/)|('(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"|`(?:\\.|[^`\\])*`)"),
    "sql": re.compile(r"(--[^\n]*|/\*[\s\S]*?\*/)|(\$(\w*)\$[\s\S]*?\$\3\$|'(?:''|[^'])*')"),
    "py": re.compile(r"(#[^\n]*)|(\"\"\"[\s\S]*?\"\"\"|'''[\s\S]*?'''|'(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\")"),
}


def strip_comments(text, path):
    """Thay comment bằng khoảng trắng, giữ nguyên số dòng và vị trí. Không đụng nội dung chuỗi."""
    kind = "sql" if path.endswith(".sql") else "py" if path.endswith((".py", ".rb")) else "js"
    blank = lambda m: re.sub(r"[^\n]", " ", m.group(1)) if m.group(1) else m.group(0)
    return _TOKENS[kind].sub(blank, text)


def line_starts(text):
    starts = [0]
    for m in re.finditer("\n", text):
        starts.append(m.end())
    return starts


def line_of(starts, pos):
    lo, hi = 0, len(starts) - 1
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if starts[mid] <= pos:
            lo = mid
        else:
            hi = mid - 1
    return lo + 1


def sha(text, n=12):
    return hashlib.sha1(re.sub(r"\s+", " ", text).strip().encode("utf-8")).hexdigest()[:n]


def git(repo, *args):
    try:
        r = subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True, timeout=30)
        return r.stdout if r.returncode == 0 else None
    except (OSError, subprocess.SubprocessError):
        return None


def git_show_json(repo, ref, relpath):
    if not ref:
        return None
    out = git(repo, "show", f"{ref}:{relpath}")
    try:
        return json.loads(out) if out else None
    except ValueError:
        return None


def merge_base(repo, base_ref):
    if not base_ref:
        return None
    out = git(repo, "merge-base", "HEAD", base_ref)
    return out.strip() if out else None


def changed_files(repo, base):
    files = set()
    for args in ((["diff", "--name-only", base] if base else ["diff", "--name-only", "HEAD"]),
                 ["ls-files", "--others", "--exclude-standard"]):
        out = git(repo, *args)
        files |= set((out or "").split())
    return files


def read_text(path):
    with open(path, encoding="utf-8", errors="ignore") as f:
        return f.read()


def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write("\n")
