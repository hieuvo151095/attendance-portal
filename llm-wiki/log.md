# Log — LLM Wiki Attendance Portal

> Append-only, mới nhất ở cuối. Định dạng: `## [YYYY-MM-DD] ingest|query|lint|decide | Tiêu đề` (SCHEMA §7).
> `grep "^## \[" log.md | tail -5`

## [2026-11-02] lint | Khởi tạo wiki (skill llm-wiki, chế độ new)

- Tạo SCHEMA.md, wiki.json, index.md, log.md, OBSIDIAN.md, tools/ (lint, graph, viewer), .obsidian/, khung raw/ và pages/.
- Tiền tố: chưa có. Code: —. Tài liệu: —.

## [2026-11-02] ingest | raw/specs/initial-requirements.md

- Nạp yêu cầu khởi tạo hệ thống Attendance Portal từ Product Owner.
- Định nghĩa 10 mã spec thuộc 4 phân hệ: MTG (Điểm danh cuộc họp), CC (Chấm công vào ra), TB (Thiết bị và tích hợp), NV (Tổ chức và nhân sự).
- Tạo các trang entities (meeting, attendance-record, employee, device), flows (meeting-attendance-flow, daily-attendance-flow), screens (meeting-attendance-screen, attendance-dashboard) và 4 module overview.
