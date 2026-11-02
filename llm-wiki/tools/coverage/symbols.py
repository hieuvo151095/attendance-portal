"""symbols.py — tìm symbol có tên bao quanh một dòng code (coverage, skill llm-wiki).

Callback vô danh (`withTransaction(async (tx) => …)`) không phải symbol: dòng bên trong nó thuộc symbol có tên
bên ngoài. Không có symbol nào → `module`.
"""
import re

KEYWORDS = {"if", "for", "while", "switch", "catch", "return", "function", "else", "do", "new", "await",
            "typeof", "super", "this", "with", "elif", "except", "try", "finally", "throw", "yield", "case",
            "import", "export", "require", "describe", "it", "test", "expect"}
JS = [
    ("fn", re.compile(r"^(\s*)(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)")),
    ("fn", re.compile(r"^(\s*)(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]{0,120})?=\s*"
                      r"(?:async\s+)?(?:function\b|\([^()]*\)\s*(?::[^=]{1,80})?=>|\(\s*$|[A-Za-z_$][\w$]*\s*=>)")),
    ("class", re.compile(r"^(\s*)(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)")),
    ("method", re.compile(r"^(\s*)(?:(?:public|private|protected|static|readonly|override|async|get|set)\s+)*"
                          r"([A-Za-z_$][\w$]*)\s*(?:<[^>()]*>)?\s*\((?!.*;\s*$)")),
]
PY = [
    ("fn", re.compile(r"^(\s*)(?:async\s+)?def\s+([A-Za-z_]\w*)")),
    ("class", re.compile(r"^(\s*)class\s+([A-Za-z_]\w*)")),
]


def _decls(lines, path):
    rules = PY if path.endswith((".py", ".rb")) else JS
    out, classes = [], []
    for i, line in enumerate(lines, 1):
        if not line.strip():
            continue
        for kind, rx in rules:
            m = rx.match(line)
            if not m:
                continue
            ind, name = len(m.group(1).expandtabs(4)), m.group(2)
            if name in KEYWORDS:
                break
            while classes and classes[-1][1] >= ind:
                classes.pop()
            if kind == "method":
                if not classes or not (line.rstrip().endswith("{") or line.rstrip().endswith("(")
                                       or re.search(r"\)\s*(?::[^{]+)?\{", line)):
                    break
                cls = classes[-1]
                if cls[2] is None:
                    cls[2] = ind            # thụt lề của thành viên lớp = thụt lề phương thức đầu tiên
                elif ind != cls[2]:
                    break                   # lời gọi trong thân phương thức, không phải phương thức
                name = f"{cls[0]}.{name}"
            elif kind == "class":
                classes.append([name, ind, None])
            elif classes and kind == "fn" and path.endswith((".py", ".rb")):
                name = f"{classes[-1][0]}.{name}"
            out.append([i, ind, name, kind])
            break
    return out


def symbol_table(text, path, function_block_re=None):
    """[(start, end, name)] — end là dòng trước symbol kế tiếp có thụt lề ≤ nó (hoặc cuối file)."""
    lines = text.splitlines()
    n = len(lines)
    if path.endswith(".sql"):
        table = []
        if function_block_re:
            for m in re.finditer(function_block_re, text):
                a = text.count("\n", 0, m.start()) + 1
                b = text.count("\n", 0, m.end()) + 1
                table.append((a, b, m.group(1).strip('"')))
        return table
    decls = _decls(lines, path)
    table = []
    for k, (start, ind, name, kind) in enumerate(decls):
        end = n
        for nxt in decls[k + 1:]:
            if nxt[1] <= ind:
                end = nxt[0] - 1
                break
        table.append((start, end, name))
    return table


def enclosing(table, line):
    best = None
    for start, end, name in table:
        if start <= line <= end and (best is None or start >= best[0]):
            best = (start, end, name)
    return best or (1, None, "module")
