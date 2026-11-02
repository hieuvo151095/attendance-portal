# ECO School ecosystem: mindmap + roadmap (single-file page)

`dist/index.html` is the deliverable. Everything else lets you rebuild it or understand it.

## Rebuild
    python3 build.py            # writes dist/index.html from src/
    sha256sum dist/index.html   # must match SHA256SUMS
    cd tests && npm install && node verify.js ../dist/index.html

## How the page is assembled
`shell.html` (markup, two `<section>` panels, tab buttons) + `css.css` + a script made of:
1. `function makeSavedModel(){ <saved_data.js> <return_statement.js> }`
2. `function makeWorkingModel(){ <working_data.js><rebuild_data.js> <return_statement.js> }`
3. `engine.js` (UI code; calls both factories, freezes the Saved model, mounts both panels, wires the tabs).
Glue strings are fixed in `build.py` (a single extra newline matters for the byte-identical hash).

## Data model (inside each factory)
- `S`: sources `{key: [title, url]}`; `BEH`: behaviour table; `BEHNOTE`, `LABELS`: optional text overrides; `ROADMAP`: only in the Working model.
- `TREE`: nodes with `type` root | aud | line | mod | leaf, `label`, `sub`, `tag` (seen, store, prop, gap, mkt = how confirmed), `aud` (mn, k12, cross, int), `lv` (mn, th, thcs, thpt), `children`.
- Detail fields shown in the panel: `meta`, `insight`, `what`, `note`, `d`, `uv` (end-user value by role), `bv` (business value), `planned` (new features: `{t, when, v}`), `buy`, `table`, `data`, `feeds`, `basis`, `read`, `fvNote`, `vendors`, `src`; leaf status `st` = available | qc | backlog.
- Helpers at the top of the data files: `P` (assign), `M`/`MM` (module), `MF` (leaf), `D` (leaves from "label|description" strings), `ML` (line).
- `vi:true` on a line switches panel labels to Vietnamese.

## Roadmap model
`ROADMAP = {buckets[9], milestones[], lanes[8], cards[]}`. A board may set `months` (default 6) and `minMonthW` (default 150); `AFTER = months+1`, `NONE = months+2`.
- Bucket index: 0 = before Oct 2026, 1..6 = Oct 2026..Mar 2027 (continuous, quarter-month steps), 7 = after Mar 2027, 8 = unscheduled.
- Card: `{id, lane, ref:[line, module], title?, col, span, row?, plan:"user"|"prop", after:[ids], note?}`; `ref` must match a line label or `line›module` in `TREE` (this is how a card opens the same panel as the mindmap).
- Moves are stored as overrides `{id: {col, span, row}}`.
- Persistence: runtime database doc `roadmap/layout` = `{cards, updatedAt}` (capabilities `db` and `user`), else localStorage `eco-roadmap-layout-v1`. Panel width: localStorage `eco-split-w`.

## Second board: "Rebuild School Portal Roadmap"
`ROADMAP2` (file `src/rebuild_data.js`) has the same shape as `ROADMAP` plus: lane `node` (panel of the module group), card `kind` (verify | missing | source | integration, drives the colour), `badge`/`badgeTip` (done/total requirements) and `node` (a ready-made panel object: `meta`, `what`, `table`, `blocks`, `basis`). The data comes from the audit report `bao-cao-nghiep-vu-tien-do.html` (37 modules, 211 requirements); regenerate with `python3 tools/gen_rebuild_data.py > src/rebuild_data.js` (reads `tools/modules_full.json`). The board has a 7-month axis (`months`:7, `minMonthW`:240, `weekLabels`:true draws four week columns 1/8/15/22 in every month header; T10/2026 to T4/2027, `AFTER` = 8.0 = end of April 2027, the release goal). `breaks` (`[{from, to, label, title, what}]`, axis units) draws a hatched band in every lane and a header flag that opens a panel; the engine adds a warning (red border, "!") to any card that overlaps a break. The break here is 1-14/2/2027 (`from` 5.0, `to` 5.5) for Tết Nguyên đán 4-10/2/2027. Cards carry no `kind`/`badge`: all cards of a lane share one colour derived from the lane `tone` (`.rb2 .rmcard`, `color-mix`), and the 7 lanes use 7 different tones (teal, purple, blue, orange, green, amber, gray). The schedule is the layout the product owner arranged on 23/10/2026 (`LAYOUT` in the generator, start and length in months), checked against the PRDs in `docs_legacy`; the generator asserts that no card overlaps the break, ends after April, leaves the quarter-month grid, or starts before one of its hard dependencies (`NEEDS`, from the PRDs) has started. Each card carries `after` (its hard dependencies); the board has `depMode:"start"`, i.e. it warns when a card starts before a dependency starts (overlap with a dependency that is still running is allowed: the data contract is enough). `SOFT` lists optional links, `M4_NEED` is the transitive closure of the hard dependencies of the six M4 sub-modules, and the panel shows both plus "Với bản phát hành M4". Sub-modules that are not in the audit are defined in `tools/new_modules.py` (now only M7/SM2 Đăng nhập: login by Tài khoản or by SSO of the Sở GD&ĐT, a proposed 12-requirement spec) and added as extra cards; they are left out of the audit totals (37 sub-modules, 211 requirements) and `M4_NEED` includes it as a release prerequisite. Two corrections were applied to the owner layout (hard-dependency errors): Tài khoản starts before Giáo viên, and Báo cáo (Học phí) starts no earlier than Học phí. What the report calls "đã làm" is UI only, nothing is integrated with the core. Storage: db doc `roadmap/layout-rebuild`, localStorage `eco-roadmap-rebuild-layout-v1`.
Engine: `makeBoard(cfg)` draws a board; `initRoadmap()` creates the first board and, when `model.ROADMAP2` exists, the second one and wires the view switch. New panel fields: `blocks` (`[{h, items[], ol?, muted?}]`), evidence tag `audit`.

## Constraints of the host (claude.ai artifact)
Self-contained file under 16 MB; scripts only from a few CDNs (none used); no network calls; no `<form>`; localStorage allowed.
