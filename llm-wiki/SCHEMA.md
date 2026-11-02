# SCHEMA — LLM Wiki của dự án Attendance Portal

> Đây là bản thể hiện của mẫu "LLM Wiki" (Karpathy, gist `karpathy/442a6bf555914893e9891c11519de94f`) cho repo này. Wiki được dựng bằng skill `llm-wiki`, chế độ **new**.
> File này là **cấu hình**: nó cho mọi agent LLM biết wiki có cấu trúc ra sao, quy ước viết trang và quy trình Ingest / Query / Lint. Bản máy đọc nằm ở `wiki.json`; `tools/lint_wiki.py` đọc file đó.
> Người và LLM cùng chỉnh file này theo thời gian. Ngày khởi tạo: 2026-11-02.

## 1. Mục đích

- `llm-wiki/pages/` là **đặc tả (spec) và tài liệu sống** của những gì Attendance Portal PHẢI làm. Wiki tổng hợp từ nguồn nghiệp vụ (tài liệu BA, PRD, spec sheet, quyết định của chủ sở hữu).
- Tính năng mới được đặc tả ở đây trước, rồi mới vào backlog của harness. Harness trỏ `sources.spec.root` vào `llm-wiki/pages/`.

- Dự án **mới**: chưa có code, hoặc code mới bắt đầu. Phần thân trang mô tả hành vi **mong muốn** đã được chủ sở hữu duyệt, ghi rõ nguồn quyết định.
- Bảng `## Khác biệt spec ↔ code` đóng vai trò **bảng theo dõi triển khai**. Ban đầu mọi mã là `MISSING`; khi code xong và verify xanh thì chuyển sang `OK`, kèm bằng chứng `repo:path:line`.

- Ngôn ngữ: **tiếng Việt**. Giữ nguyên tên định danh: page id, tên file code, tên trường, enum, tên package.

## 2. Ba lớp

| Lớp | Đường dẫn | Ai sở hữu | Quy tắc |
|---|---|---|---|
| Nguồn thô (raw) | `llm-wiki/raw/` | Người dùng | **Bất biến.** LLM chỉ đọc, không sửa. Thêm nguồn mới thì thêm file mới. |
| Wiki | `llm-wiki/pages/` | LLM | LLM tạo và sửa toàn bộ. Người đọc và góp ý. |
| Schema | `llm-wiki/SCHEMA.md` + `wiki.json` | Người + LLM | Chỉ sửa khi đã thống nhất quy ước mới, và ghi lại thay đổi trong `log.md`. |

Tệp điều hướng: `llm-wiki/index.md` là danh mục theo nội dung; `llm-wiki/log.md` là nhật ký theo thời gian, chỉ ghi thêm.

**Vault độc lập:** `llm-wiki/` là một Obsidian vault riêng, chỉ chứa tri thức của Attendance Portal. Không liên kết, không copy trang, không dùng chung `.obsidian/` với wiki của dự án khác. Chỉ được mượn **khuôn** (schema, tools), không mượn **nội dung**. Mọi link phải trỏ vào bên trong `llm-wiki/`, hoặc dùng tiền tố `repo:` cho file của repo này.

## 3. Cấu trúc thư mục

```
llm-wiki/
├── SCHEMA.md     ← file này
├── wiki.json     ← cấu hình máy đọc: chế độ, tiền tố mã spec, mục bắt buộc
├── OBSIDIAN.md   ← cách mở vault và xem graph
├── index.md      ← danh mục mọi trang (LLM cập nhật mỗi lần ingest)
├── log.md        ← nhật ký append-only (ingest | query | lint | decide)
├── tools/        ← lint_wiki.py, obsidian_graph.py
├── raw/          ← nguồn bất biến KHÔNG nằm sẵn trong repo
│   ├── specs/    ← spreadsheet / tài liệu yêu cầu (bản gốc + export nguyên văn)
│   └── assets/   ← ảnh dán vào từ Obsidian
└── pages/        ← wiki do LLM sở hữu (= spec root của harness)
    ├── overview/ ← type: overview — bức tranh tổng, hub từng phân hệ, phân quyền
    ├── sources/  ← type: source   — tóm tắt từng nguồn đã ingest, trang quyết định
    ├── entities/ ← type: entity   — đối tượng nghiệp vụ
    ├── concepts/ ← type: concept  — quy tắc hoặc khái niệm xuyên phân hệ
    ├── flows/    ← type: flow     — luồng nghiệp vụ nhiều bước
    └── screens/  ← type: screen   — màn hình / route; ánh xạ spec → route trong code
```

Khi code bắt đầu có, tham chiếu bằng tiền tố `repo:`, ví dụ `repo:src/orders/service.ts:42`. Không copy code vào `raw/`.

## 4. Quy ước trang

### 4.1 Frontmatter YAML (bắt buộc)

```yaml
---
title: Đơn hàng                 # tên hiển thị
type: entity                    # overview | source | entity | concept | flow | screen
sources:                        # nguồn căn cứ: đường dẫn tương đối từ llm-wiki/ hoặc repo:<path>
  - raw/specs/01-yeu-cau.md
updated: 2026-11-02               # ngày LLM sửa gần nhất (YYYY-MM-DD)
---
```

Trường tuỳ chọn:
- `spec_ids`: danh sách mã yêu cầu, xem §5.
- `apps`: các app liên quan.
- `route_ids`: chỉ cho `screen`.
- `status` (`implemented | partial | missing | extra`): chỉ cho `screen`.
- `aliases`.

### 4.2 Đặt tên file

- Tên file: **tiếng Anh**, `kebab-case`, ngắn và gợi tả, ví dụ `sales-order.md`, `outlet-debt.md`, `order-list.md`. Tiêu đề (`title:`) viết bằng ngôn ngữ của wiki.
- File dẫn hướng có tên cố định: `pages/overview/project-overview.md` (tổng quan), `pages/overview/module-<tên>.md` (hub từng phân hệ), `pages/sources/<module>-decisions-YYYY-MM-DD.md` (quyết định).
- Một khái niệm là một trang. Trước khi tạo trang mới, tìm trong `index.md` xem đã có chưa.
- Đặt tên screen theo nghiệp vụ, không theo tên component.
- Mỗi trang tối đa 600 dòng; dài hơn thì tách thành trang con.

### 4.3 Liên kết

- Dùng **link markdown tương đối**, ví dụ `[Đơn hàng](../entities/sales-order.md)`. Không dùng wikilink `[[...]]`, để file hiển thị đúng trên GitHub/GitLab và để harness đọc được.
  - Ngoại lệ duy nhất: block `<!-- ai-po:<FID> begin … end -->` do harness (AI PO) chèn vào trang spec dùng `[[proposals/ai-po-<FID>.md]]`, đường dẫn tính từ `pages/`. Đó là vùng của harness: không sửa tay bên trong; muốn lật quyết định thì xoá cả block. Lint chấp nhận block này nhưng vẫn kiểm bản ghi có tồn tại.
- Mỗi trang phải có ít nhất **một liên kết đến** từ trang khác. Trang tổng quan `overview/project-overview.md` được miễn quy tắc này.
- Trang `source` kết thúc bằng mục `## Trang chịu ảnh hưởng`; mọi loại trang còn lại kết thúc bằng `## Liên quan`.

### 4.4 Mục bắt buộc theo loại

| type | Mục bắt buộc (theo thứ tự) |
|---|---|
| `overview` | Tóm tắt · Bản đồ · Liên quan |
| `source` | Thông tin nguồn · Nội dung chính · Mã yêu cầu được định nghĩa (nếu là spec) · Điểm đáng chú ý / mâu thuẫn · Trang chịu ảnh hưởng |
| `entity` | Định nghĩa · Thuộc tính / quy tắc nghiệp vụ (kèm mã spec) · Quan hệ · Khác biệt spec ↔ code · Liên quan |
| `concept` | Định nghĩa · Quy tắc · Áp dụng ở đâu · Khác biệt spec ↔ code · Liên quan |
| `flow` | Mục tiêu · Các bước (có vai trò và app) · Quy tắc chặn / validation · Khác biệt spec ↔ code · Liên quan |
| `screen` | Mục đích · App / route / file code · Yêu cầu spec · Khác biệt spec ↔ code · Câu hỏi mở (nếu có) · Liên quan |

Mẫu từng loại trang: `references/page-templates.vi.md` của skill `llm-wiki`.

### 4.5 Mục `## Khác biệt spec ↔ code`

| Mã spec | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|

Cột `Mức` nhận một trong các giá trị:
- `MISSING`: chưa có.
- `PARTIAL`: có một phần.
- `CONTRADICTS`: làm khác spec.
- `BUG`: định làm đúng nhưng lỗi.
- `EXTRA`: code có, spec không yêu cầu.
- `OK`: khớp spec.

Cột `Bằng chứng` ghi `repo:path:line` theo snapshot của ngày trong `updated`. Số dòng có thể trôi, nên lint kiểm lại. Với mức `MISSING` khi chưa có code, bằng chứng ghi `—`.

### 4.7 Đánh dấu chưa rõ

- Chỗ spec mơ hồ hoặc tự mâu thuẫn: ghi `**[CẦN LÀM RÕ]**` kèm mô tả, và liệt kê trong mục `## Câu hỏi mở`.
- Không tự bịa quy tắc nghiệp vụ.

## 5. Mã yêu cầu (spec IDs) và thứ tự ưu tiên nguồn

Mỗi phân hệ có một tiền tố; mã có dạng `PREFIX-NN`, tăng dần và không tái dùng số. Một mã là một quy tắc nghiệp vụ kiểm được.
- Mã được định nghĩa trong trang source chính của phân hệ, ở mục "Mã yêu cầu được định nghĩa".
- Trang nào dùng mã thì ghi mã đó vào frontmatter `spec_ids`.

Danh sách tiền tố cũng nằm trong `wiki.json → prefixes`; khi thêm tiền tố thì sửa cả hai chỗ.

| Tiền tố | Phân hệ | Hub |
|---|---|---|
| `MTG` | Điểm danh cuộc họp | [Điểm danh cuộc họp](pages/overview/module-meeting.md) |
| `CC` | Chấm công vào ra | [Chấm công vào ra](pages/overview/module-daily-attendance.md) |
| `TB` | Thiết bị và tích hợp | [Thiết bị và tích hợp](pages/overview/module-device-integration.md) |
| `NV` | Tổ chức và nhân sự | [Tổ chức và nhân sự](pages/overview/module-organization.md) |

**Quyết định của chủ sở hữu:**
- Ghi vào trang source riêng `sources/<module>-decisions-YYYY-MM-DD.md`, rồi cập nhật các mã liên quan.
- Trang mới hơn thắng.
- Câu được chốt theo phương án AI đề xuất thì đánh dấu "chốt theo đề xuất", để chủ sở hữu duyệt lại sau.

**Thứ tự ưu tiên khi nguồn mâu thuẫn:**

1. Quyết định của chủ sở hữu (trang `*-decisions-*` mới nhất).
2. tài liệu yêu cầu trong raw/specs/ (bản mới hơn thắng)
3. Tài liệu phái sinh, ví dụ PRD do AI viết.

Code (khi đã có) chỉ là bằng chứng triển khai, không phải spec. Code khác spec thì ghi vào `Khác biệt spec ↔ code`.

Mâu thuẫn phải được ghi ở cả hai trang liên quan và trong kết quả lint.

## 6. Quy trình

### 6.1 Ingest (nạp nguồn mới)

1. Người dùng thả nguồn vào `raw/`, hoặc chỉ định file trong repo. Với spreadsheet: lưu bản gốc, cùng export từng tab ra `.csv` và `.md` nguyên văn, không sửa nội dung.

2. LLM đọc toàn bộ nguồn, tách thành các quy tắc kiểm được và đặt mã spec. Chỗ nào chưa rõ thì ghi `[CẦN LÀM RÕ]`, không tự quyết.

3. Tạo hoặc cập nhật **một trang source cho mỗi nguồn** trong `pages/sources/` (không gộp nhiều tài liệu vào một trang), định nghĩa mã spec mới nếu có.
4. Cập nhật mọi trang entity, concept, flow, screen bị ảnh hưởng. Khi thông tin mới mâu thuẫn với trang cũ: không xoá, mà ghi rõ mâu thuẫn và nguồn nào thắng theo §5.
5. Cập nhật bảng `Khác biệt spec ↔ code` của các trang liên quan.
6. Cập nhật `index.md`: thêm trang mới, sửa mô tả một dòng. Cập nhật `updated:` của mọi trang đã sửa.
7. Ghi thêm entry vào `log.md` theo dạng `## [YYYY-MM-DD] ingest | <Tên nguồn>`, kèm danh sách trang đã tạo hoặc sửa.
8. Chạy lint (§6.3) và sửa cho sạch trước khi báo xong. Khi `wiki.json` có khối `coverage`, "sạch" gồm cả độ phủ: **0 lỗi cấu trúc ≠ đã phủ**.

### 6.2 Query (hỏi đáp)

1. Đọc `index.md` trước, chọn trang liên quan rồi đọc sâu. Chỉ quay về `raw/`, tài liệu repo hoặc code khi wiki thiếu.
2. Trả lời kèm link trang wiki và mã spec.
3. Câu trả lời có giá trị lâu dài (so sánh, phân tích, bảng tra) thì lưu thành trang mới, thường là `concept` hoặc `overview`, và cập nhật `index.md`.
4. Ghi `## [YYYY-MM-DD] query | <Câu hỏi ngắn>` vào `log.md`.

### 6.3 Lint (kiểm tra sức khoẻ)

```bash
python3 -I tools/lint_wiki.py .          # chạy từ trong llm-wiki/; thoát 1 nếu có lỗi
python3 -I tools/lint_wiki.py . --json   # số liệu máy đọc: khoảng trống, câu hỏi mở, độ phủ mã
python3 -I tools/obsidian_graph.py .     # graph như Obsidian thấy
```

Script kiểm frontmatter, link hỏng, anchor, trang mồ côi, trang thiếu trong index, mục bắt buộc, wikilink, độ dài trang, định dạng log, mã spec lạ, bằng chứng `repo:` trỏ tới file không tồn tại, và chuỗi giống secret.

**Độ phủ code ↔ wiki** (khi `wiki.json` có khối `coverage`; lint tự gọi `tools/coverage_wiki.py`):

```bash
python3 -I tools/coverage_wiki.py . --unclaimed --owner <PREFIX>   # fact chưa mô tả — đầu vào brief ingest
python3 -I tools/coverage_wiki.py . --accept                       # người duyệt: khoá dấu vân tay claim đã kiểm
python3 -I tools/coverage_wiki.py . --baseline                     # lần đầu: chụp nợ cũ; về sau: chỉ co lại
```

- **Fact** = một symbol có tên tạo/đổi/xoá một subject (bảng…), id `verb:kind:name@path#symbol`, kèm dấu vân tay
  (cột + literal được ghi). Kho fact tính lại mỗi lần từ code, không commit.
- **Lỗi:** fact bắt buộc chưa claim · claim trỏ fact không còn · bằng chứng ngoài thân symbol / là dòng import / dải
  quá dài · mã spec không thuộc chủ · claim đặt ở trang không thuộc chủ · dấu vân tay đổi so với lần `--accept`
  · lần nhắc bảng chưa phân loại · subject chưa khai báo chủ · dòng gap `OK`/`PARTIAL`/`CONTRADICTS` không trỏ fact
  sống nào · baseline có id mới so với merge-base/HEAD hoặc quá hạn · exclusion thiếu chữ ký người.
- **File quyết định** `wiki.json`, `coverage/{exclusions,baseline,renames,claims.lock}.json` do người duyệt đổi
  (hook chặn agent); mọi thay đổi so với git HEAD được in trong báo cáo.
- **Chưa phủ theo thiết kế** (chỉ đếm, không phải lỗi): SQL chỉ đọc, cron/queue, cache/Redis, HTTP ra ngoài.

LLM kiểm thêm phần script không làm được:
- mâu thuẫn giữa các nguồn và giữa các trang;
- số dòng trong bằng chứng đã trôi;
- tài liệu ghi "Done" mà code chưa có;
- khái niệm được nhắc nhiều mà chưa có trang.

Ghi kết quả vào `log.md` theo dạng `## [YYYY-MM-DD] lint | <Phạm vi>`, gồm các mục Orphans / Mâu thuẫn / Khoảng trống / Việc cần làm.

### 6.4 Decide (ghi quyết định)

1. Chủ sở hữu trả lời câu hỏi mở.
2. LLM ghi câu trả lời vào `sources/<module>-decisions-YYYY-MM-DD.md`: câu hỏi, phương án được chọn, các phương án bị loại, người quyết định, các trang và feature bị ảnh hưởng.
3. Cập nhật các trang liên quan; bỏ `[CẦN LÀM RÕ]` ở chỗ đã chốt.
4. Ghi `## [YYYY-MM-DD] decide | <Phạm vi>` vào `log.md`.

## 7. Quy tắc `index.md` và `log.md`

- `index.md` nhóm trang theo loại (Overview, Sources, Entities, Concepts, Flows, Screens).
  - Mỗi dòng có dạng `- [Tiêu đề](pages/...md) — mô tả một dòng`.
  - Trang screen thêm ` · status` ở cuối dòng.
- `log.md` là **append-only**, mới nhất ở cuối.
  - Mỗi entry bắt đầu đúng dạng `## [YYYY-MM-DD] ingest|query|lint|decide | Tiêu đề`, để `grep` được.
  - Không sửa entry cũ. Ghi sai thì ghi entry mới để đính chính.

## 8. Ràng buộc với phần còn lại của repo

- Khi làm việc với wiki, không sửa code app, thư mục harness, skill, tệp chỉ dẫn agent gốc (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`…), trừ khi người dùng yêu cầu riêng.
- Wiki mô tả yêu cầu. Sửa code cho khớp spec là nhiệm vụ riêng: lấy bảng `Khác biệt spec ↔ code` làm nguồn backlog cho harness (AGY-Harness Kit: `agy-harness-ingest`).
- Không ghi secret (mật khẩu, token, khoá) vào wiki. Chỉ ghi `file:line` và loại secret.
