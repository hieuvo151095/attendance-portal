# Quy ước hiển thị số

Cùng quy ước với [DS] ECO MERCHANT, để một con số trông giống nhau trên mọi sản phẩm ECO.

## Dấu phân cách

- Phân cách hàng nghìn bằng dấu phẩy: `1,540,000`.
- Phần thập phân sau dấu chấm: `18.9%`.
- Áp dụng cho mọi con số có từ 4 chữ số trở lên: tiền, số học sinh, số bản ghi, tổng.
- Không phân cách các dãy số dùng như mã: số điện thoại, CCCD, mã nhân viên, mã học sinh, số tài khoản, năm (`2026 - 2027`).

## Tiền

- Đơn vị `đ` viết liền sau số, không có khoảng trắng: `1,540,000đ`. Không dùng `VND`, `₫`, `vnđ`.
- Không hiện phần lẻ thập phân: `1,540,000đ`, không viết `1,540,000.00đ`.
- Số âm (miễn giảm, hoàn tiền): dấu trừ liền trước số, `-28,500đ`.

| Đúng | Sai |
|---|---|
| `1,540,000đ` | `1.540.000đ` · `1,540,000 đ` · `1,540,000 VND` · `đ1,540,000` |
| `-28,500đ` | `- 28,500đ` · `(28,500đ)` |
| `18.9%` | `18,9%` · `18.9 %` |

## Căn lề

- Cột số và cột tiền trong `DataTable` căn phải (`align: 'right'`); các số trong cùng một cột thẳng hàng theo hàng đơn vị.
- Số nằm trong câu đi theo dòng chữ: "Hiển thị **7** giáo viên".

## Chữ số đều độ rộng

- Mọi chỗ hiển thị số dùng chữ số đều độ rộng (`font-variant-numeric: tabular-nums`), để cột số thẳng hàng và con số không nhảy khi thay đổi.
- `StatCard` đã bật sẵn. Ô bảng chứa số: bật thuộc tính này cho phần tử chứa số.
