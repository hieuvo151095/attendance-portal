#!/usr/bin/env python3
"""Rebuilds dist/index.html from the files in src/ (no dependencies, Python 3).
   Output is byte-identical to the published page: compare with SHA256SUMS."""
import os, sys, hashlib
HERE = os.path.dirname(os.path.abspath(__file__))
def read(p):
    with open(os.path.join(HERE, p), encoding="utf-8") as f:
        return f.read()
shell   = read("src/shell.html")
css     = read("src/css.css")
saved   = read("src/saved_data.js")
working = read("src/working_data.js") + read("src/rebuild_data.js")
engine  = read("src/engine.js")
ret     = read("src/return_statement.js")
def factory(name, data):
    return "function " + name + "(){\n" + data + ret + "\n}\n"
script = "\n" + factory("makeSavedModel", saved) + "\n" + factory("makeWorkingModel", working) + "\n\n" + engine
html = shell.replace("{{CSS}}", css, 1).replace("{{SCRIPT}}", script, 1)
out = os.path.join(HERE, "dist", "index.html")
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "w", encoding="utf-8", newline="") as f:
    f.write(html)
print("built", out, len(html), "chars", hashlib.sha256(html.encode("utf-8")).hexdigest())
