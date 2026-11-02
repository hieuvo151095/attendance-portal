---
title: Mở wiki bằng Obsidian để xem graph
type: overview
sources:
  - SCHEMA.md
updated: 2026-11-02
---

# Mở wiki bằng Obsidian để xem graph

Thư mục `llm-wiki/` là một **Obsidian vault** đã cấu hình sẵn trong `.obsidian/`. Trong mẫu LLM Wiki, vai trò được chia như sau: Obsidian là IDE, LLM là lập trình viên, còn wiki là codebase.

## Tóm tắt

1. Cài Obsidian: `brew install --cask obsidian` (macOS), hoặc tải từ obsidian.md.
2. Mở vault: Obsidian → **Open folder as vault** → chọn `Attendance Portal/llm-wiki`.
3. Xem graph: `Cmd+G`. Mở một trang rồi chạy **Open local graph** để xem các trang quanh nó.

## Bản đồ

| Màu node | Nhóm | Thư mục |
|---|---|---|
| Đỏ cam | Tổng quan | `pages/overview/` |
| Cam | Luồng nghiệp vụ | `pages/flows/` |
| Xanh dương | Màn hình | `pages/screens/` |
| Xanh lá | Thực thể | `pages/entities/` |
| Tím | Khái niệm | `pages/concepts/` |
| Xám | Nguồn đã ingest | `pages/sources/` |
| Xám nhạt | Nguồn thô | `raw/` |
| Đen | Điều hướng | `index.md`, `log.md`, `SCHEMA.md`, file này |

Cấu hình đặt sẵn:
- Dùng link markdown tương đối, không dùng `[[wikilink]]`, khớp SCHEMA §4.3.
- Trang mới tạo vào `pages/`; ảnh dán vào lưu ở `raw/assets/`.
- Graph ẩn thư mục `tools/`, ẩn file đính kèm và link chưa có đích.
- `workspace.json` (bố cục cửa sổ cá nhân) bị git bỏ qua. Các file cấu hình còn lại được commit, để cả nhóm thấy cùng một graph.

## Quy tắc khi sửa trong Obsidian

- Wiki do LLM sở hữu. Bạn ghi chú được, nhưng nên nhờ LLM ingest để `index.md`, `log.md` và các liên kết được cập nhật đồng bộ (SCHEMA §6).
- **Không sửa `raw/`.**
- Sau khi sửa tay, chạy lint: `python3 -I tools/lint_wiki.py .`

## Liên quan

- [Danh mục wiki](index.md)
- [SCHEMA](SCHEMA.md)
