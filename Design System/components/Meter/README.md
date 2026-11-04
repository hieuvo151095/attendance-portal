# Meter

Thanh tỉ lệ nhỏ đặt trong ô bảng: sĩ số trên sức chứa, tỉ lệ lớp đã gán GVCN.

## Khi nào dùng

- **Dùng khi:** một con số có ý nghĩa nhất khi so với mức tối đa.
- **Không dùng khi:** tiến trình đang chạy (tải lên…) → thanh tiến trình riêng.

## Biến thể

| Prop | Giá trị | Dùng khi |
|---|---|---|
| `tone` | `default` | Bình thường. |
| | `warning` | Đã đầy hoặc vượt ngưỡng. |
| | `success` | Đã đạt mục tiêu. |

## Cách dùng

```html
<x-import component-from-global-scope="ECOMD.Meter" value="{{24}}" max="{{30}}" text="24/30" label="Sĩ số"></x-import>
```

## Props

| Prop | Kiểu | Mặc định | Ý nghĩa |
|---|---|---|---|
| `value`, `max` | number | `0`, `100` | |
| `text` | string | `pct%` | Nhãn bên phải. |
| `showLabel` | boolean | `true` | |
| `tone` | `'default' \| 'success' \| 'warning'` | `'default'` | |
| `label` | string | — | `aria-label` của thanh. |

## Thông số

- Thanh cao `space-6`, rộng tối thiểu `size-40`, nền `bg-muted`, bo `radius-full`; phần đầy `eco-blue-strong` (success `semantic-success`, warning `semantic-warning`).
- Nhãn `body-xs` `text-subtle`, số đều độ rộng, cách thanh `space-8`.
