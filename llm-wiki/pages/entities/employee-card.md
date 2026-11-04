---
title: Thẻ nhân viên
type: entity
sources:
  - pages/sources/portal-architecture-decisions-2026-11-02.md
spec_ids: [ORG-03]
updated: 2026-11-02
---

# Thẻ nhân viên

## Định nghĩa
Thực thể `Thẻ nhân viên` (Employee Card) đại diện cho thẻ vật lý (thẻ nhựa RFID/NFC/Mifare) được đơn vị cấp phát cho nhân viên để thực hiện quẹt thẻ điểm danh tại phòng họp hoặc chấm công vào ra tại cổng cơ quan.

## Thuộc tính / quy tắc nghiệp vụ
| Mã | Quy tắc | Ghi chú |
|---|---|---|
| ORG-03 | Quản lý mã UID vật lý của thẻ, ngày liên kết, trạng thái thẻ (Đang hoạt động, Tạm khóa, Đã hủy). Mỗi thẻ tại một thời điểm chỉ liên kết với duy nhất một nhân viên. Khi nhân viên mất thẻ, hệ thống cho phép hủy thẻ cũ và liên kết mã thẻ mới ngay lập tức. | Kế thừa logic liên kết thẻ từ ECO Card |

## Quan hệ
- Liên kết với một [Nhân viên](employee.md).
- Khi chạm vào đầu đọc, tạo ra [Bản ghi điểm danh](attendance-record.md) mang mã thẻ này.

## Khác biệt spec ↔ code
| Mã spec | Ưu tiên | Spec yêu cầu | Code hiện tại | Mức | Bằng chứng |
|---|---|---|---|---|---|
| ORG-03 | P0 | Quản lý cấp phát, liên kết và thu hồi thẻ vật lý nhân viên | Đã hoàn thành quản lý mã thẻ UID, liên kết nhân sự, tạm khóa/mở khóa và cấp đổi thẻ mới khi mất | MATCH | repo:src/services/card.ts:1, repo:src/pages/organization/CardManagementModal.tsx:1 |

## Liên quan
- [Phân hệ Tổ chức và nhân sự](../overview/module-organization.md)
- [Nhân viên](employee.md)
- [Màn hình quản lý nhân viên](../screens/employee-management-screen.md)
