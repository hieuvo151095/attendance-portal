// Smoke test for dist/index.html.  Usage:  npm install && node verify.js ../dist/index.html
// Loads the page in jsdom (no real layout), then checks structure, data, schedule rules and CSS health.
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");
const csstree = require("css-tree");
const file = path.resolve(process.argv[2] || path.join(__dirname, "..", "dist", "index.html"));
const html = fs.readFileSync(file, "utf8");
const errs = [];
const vc = new VirtualConsole(); vc.on("jsdomError", e => errs.push(e.message));
const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole: vc, pretendToBeVisual: true, url: "https://example.test/" });
const w = dom.window, d = w.document, ECO = w.ECO;
let fail = 0;
const check = (name, ok, got) => { if (!ok) fail++; console.log((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "   got: " + JSON.stringify(got))); };

check("page loads without script errors", errs.length === 0, errs);
const W = ECO.working, S = ECO.saved, T = W.TREE;
const R = d.getElementById("panel-working"), Sv = d.getElementById("panel-saved");

// ---- shell: two tabs, Saved frozen, Working has the Mindmap/Roadmap switch ----
check("two tabs: Working and Saved", d.querySelectorAll(".tab").length === 2 && [...d.querySelectorAll(".tab")].map(t => t.dataset.tab).join() === "working,saved");
check("Saved model is deep-frozen (legacy, read-only)", w.Object.isFrozen(S.TREE));
check("Working has a roadmap model; Saved has none", !!W.ROADMAP && !S.ROADMAP);
check("Roadmap switch visible in Working, hidden in Saved", !R.querySelector("[data-role=vbar]").hidden && Sv.querySelector("[data-role=seg-view]").hidden);

// ---- default open state: Lines level (root, audiences, product lines), explanation panel hidden ----
const visible = P => [...P.querySelectorAll(".node")].filter(x => { let p = x.closest(".branch").parentElement; while (p && p !== P) { if (p.classList && p.classList.contains("kids") && p.parentElement.classList.contains("collapsed")) return false; p = p.parentElement; } return true; });
const by = P => { const o = {}; visible(P).forEach(x => { const t = [...x.classList].find(c => c.startsWith("t-")); o[t] = (o[t] || 0) + 1; }); return o; };
check("mindmap opens at Lines level: root 1, audiences 3, product-line nodes 11 (9 distinct lines; ECO Me and ECO Teacher sit under both Mầm non and K12), no modules", JSON.stringify(by(R)) === JSON.stringify({ "t-root": 1, "t-aud": 3, "t-line": 11 }), by(R));
check("Lines button is selected by default", R.querySelector("[data-role=seg-depth] button.on").textContent === "Lines");
check("explanation panel is hidden at first", R.querySelector("[data-role=split]").classList.contains("collapsed"));
const line = [...R.querySelectorAll(".node.t-line")].find(x => x.querySelector(".lbl").textContent === "School Management Portal");
line.click();
check("clicking a product line shows its modules but does not open the panel", R.querySelector("[data-role=split]").classList.contains("collapsed") && by(R)["t-mod"] === 9, by(R));
R.querySelector("[data-role=pclose]").click();
R.querySelector("[data-role=seg-depth] [data-depth='99']").click();
check("Everything button expands all levels", Object.keys(by(R)).length === 5, by(R));
R.querySelector("[data-role=seg-depth] [data-depth='2']").click();

// ---- data size (Working) ----
const stats = [...R.querySelectorAll(".stat")].map(s => s.textContent.replace(/\s+/g, " ").trim());
check("Working stats chips", stats.join(" | ").startsWith("9product lines | 80modules | 202sub-modules and features"), stats);
const lines = T.children.flatMap(a => a.children).map(l => l.label);
check("Working branches: Mầm non (MN), K12, Internal", T.children.map(c => c.label).join(" | ") === "Mầm non (MN) | K12 | Internal", T.children.map(c => c.label));
check("Internal branch has two lines (Managing portal, Internal Admin)", T.children[2].children.map(l => l.label).join(" | ") === "Managing portal | Internal Admin (ECC và NPP)", T.children[2].children.map(l => l.label));
check("Saved still has the legacy ECO Card portal line", S.TREE.children.flatMap(a => a.children).some(l => l.label === "ECO Card portal"));

// ---- ECO Teacher feature list: audience + status ----
const teacher = T.children[0].children.find(l => l.label === "ECO Teacher");
const feats = teacher.children.flatMap(m => (m.children || []).filter(f => f.st));
const cnt = { available: 0, qc: 0, backlog: 0 }; feats.forEach(f => cnt[f.st]++);
check("ECO Teacher: 15 features = 8 Available, 1 In QC, 6 In-backlog", feats.length === 15 && cnt.available === 8 && cnt.qc === 1 && cnt.backlog === 6, cnt);
check("status badges and legend key are drawn", R.querySelectorAll(".node .st").length === 30 && !!R.querySelector(".legend .st"));

// ---- roadmap ----
R.querySelector("[data-role=seg-view] [data-view=rm]").click();
const RM = W.ROADMAP, L = w.__rm.layout();
check("roadmap shape: 9 buckets, 8 lanes, 3 milestones", RM.buckets.length === 9 && RM.lanes.length === 8 && RM.milestones.length === 3, [RM.buckets.length, RM.lanes.length, RM.milestones.length]);
check("roadmap cards", RM.cards.length === 57, RM.cards.length);
const reg = new Set(); (function f(n, p) { if (n.type === "line") reg.add(n.label); if (n.type === "mod") reg.add(p[2] + "›" + n.label); (n.children || []).forEach(c => f(c, p.concat(n.label))); })(T, []);
check("every card resolves to a mindmap node", RM.cards.every(c => reg.has(c.ref.length > 1 ? c.ref[0] + "›" + c.ref[1] : c.ref[0])), RM.cards.filter(c => !reg.has(c.ref.length > 1 ? c.ref[0] + "›" + c.ref[1] : c.ref[0])).map(c => c.id));
check("no dependency warnings at the default schedule", Object.keys(w.__rm.warnings(L)).length === 0, w.__rm.warnings(L));
const inM = c => c >= 1 && c < 7, lane = id => RM.cards.filter(c => c.lane === id);
check("K12 school administration cards start Jan 2027 or later", lane("k12admin").filter(c => inM(L[c.id].col)).every(c => L[c.id].col >= 4));
check("Timetable portal + Digital school record cards start Dec 2026 or later", lane("tkb").concat(lane("hbs")).filter(c => inM(L[c.id].col) && c.col >= 1).every(c => L[c.id].col >= 3));
check("ECO Teacher cards start Dec 2026 or later", lane("teacher").filter(c => inM(L[c.id].col)).every(c => L[c.id].col >= 3));
check("every K12 card of ECO Me depends on the K12 admin source-purchase card", lane("parent-k12").every(c => (c.after || []).includes("A-MUA")));
// free placement in quarter-month steps
const before = L["E-DV"].col; w.__rm.commit("E-DV", { col: before + 0.5, row: 0 });
check("a card can sit mid-month (quarter-month steps)", Math.abs(w.__rm.layout()["E-DV"].col - (before + 0.5)) < 1e-6);
R.querySelector("[data-act=reset]").click();
check("reset restores the default layout", w.__rm.layout()["E-DV"].col === before);
w.__rm.select("T-NT");
const det = R.querySelector("[data-role=detail]");
check("clicking a card fills the same explanation panel (Lộ trình box, new-features block) but does not open it", R.querySelector("[data-role=split]").classList.contains("collapsed") && det.textContent.includes("Lộ trình") && !!det.querySelector(".newbox"));

// ---- sources and CSS health ----
const Ssrc = W.S, miss = new Set(); (function f(n) { (n.src || []).forEach(k => { if (!Ssrc[k]) miss.add(k); }); (n.children || []).forEach(f); })(T);
check("all source keys resolve", miss.size === 0, [...miss]);
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1], perr = [];
csstree.parse(css, { onParseError: e => perr.push(e.message) });
check("CSS parses with no errors and braces balance", perr.length === 0 && css.split("{").length === css.split("}").length, perr);
let top = 0; csstree.walk(csstree.parse(css), { enter(n) { if (n.type === "Rule" && this.atrule === null) top++; } });
check("CSS keeps every rule at top level (an unclosed @media once swallowed 140 rules)", top >= 195, top);
const cs = (sel, prop) => { const el = d.querySelector(sel); return el ? w.getComputedStyle(el).getPropertyValue(prop) : "(missing)"; };
check("computed styles apply (node, tree, split, panel toggle)", cs(".node", "display") === "inline-flex" && cs(".split", "display") === "grid" && cs(".ptoggle", "margin-left") === "auto" && cs(".kids", "margin-left") === "20px");

console.log(fail ? "\n" + fail + " check(s) FAILED" : "\nALL CHECKS PASSED");
process.exit(fail ? 1 : 0);
