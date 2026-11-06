import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../design-system/Pagination';
import { DataTable } from '../design-system/DataTable';

describe('Thành phần Phân Trang (Pagination Component)', () => {
  it('Hiển thị thông tin tổng số bản ghi và các nút trang chính xác với 25 bản ghi, 10/trang', () => {
    const handleChange = vi.fn();
    render(
      <Pagination
        current={1}
        pageSize={10}
        total={25}
        onChange={handleChange}
      />
    );

    // Kiểm tra văn bản tóm tắt
    expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument();
    expect(screen.getByText('1 - 10')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();

    // 25 bản ghi, 10/trang => 3 trang
    expect(screen.getByRole('button', { name: 'Trang 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang 3' })).toBeInTheDocument();

    // Trang 1: Nút Trang trước bị disabled
    const prevBtn = screen.getByRole('button', { name: /Trang trước/i });
    expect(prevBtn).toBeDisabled();

    // Nút Trang sau hoạt động
    const nextBtn = screen.getByRole('button', { name: /Trang sau/i });
    expect(nextBtn).not.toBeDisabled();

    // Bấm sang Trang 2
    fireEvent.click(screen.getByRole('button', { name: 'Trang 2' }));
    expect(handleChange).toHaveBeenCalledWith(2, 10);
  });

  it('Bấm nút Trang sau gọi hàm onChange tăng số trang', () => {
    const handleChange = vi.fn();
    render(
      <Pagination
        current={1}
        pageSize={10}
        total={25}
        onChange={handleChange}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /Trang sau/i });
    fireEvent.click(nextBtn);
    expect(handleChange).toHaveBeenCalledWith(2, 10);
  });

  it('Ở trang cuối cùng (Trang 3), nút Trang sau bị disabled', () => {
    const handleChange = vi.fn();
    render(
      <Pagination
        current={3}
        pageSize={10}
        total={25}
        onChange={handleChange}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /Trang sau/i });
    expect(nextBtn).toBeDisabled();

    const prevBtn = screen.getByRole('button', { name: /Trang trước/i });
    expect(prevBtn).not.toBeDisabled();
    fireEvent.click(prevBtn);
    expect(handleChange).toHaveBeenCalledWith(2, 10);
  });
});

describe('Tích hợp Phân Trang trong Bảng Dữ Liệu (DataTable Pagination Integration)', () => {
  const sampleData = Array.from({ length: 25 }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Cán bộ ${i + 1}`,
    code: `NV-${String(i + 1).padStart(3, '0')}`
  }));

  const columns = [
    { key: 'code', title: 'Mã NV' },
    { key: 'name', title: 'Họ và tên' }
  ];

  it('Tự động chia 10 dòng/trang và chỉ hiển thị 10 dòng đầu tiên ở Trang 1', () => {
    render(
      <DataTable
        columns={columns}
        rows={sampleData}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    );

    // Trang 1 hiển thị Cán bộ 1 và Cán bộ 10
    expect(screen.getByText('Cán bộ 1')).toBeInTheDocument();
    expect(screen.getByText('Cán bộ 10')).toBeInTheDocument();

    // Tuyệt đối không hiển thị Cán bộ 11 ở Trang 1
    expect(screen.queryByText('Cán bộ 11')).not.toBeInTheDocument();

    // Chuyển sang Trang 2
    fireEvent.click(screen.getByRole('button', { name: 'Trang 2' }));

    // Trang 2 hiển thị Cán bộ 11 và Cán bộ 20
    expect(screen.getByText('Cán bộ 11')).toBeInTheDocument();
    expect(screen.getByText('Cán bộ 20')).toBeInTheDocument();
    expect(screen.queryByText('Cán bộ 1')).not.toBeInTheDocument();

    // Chuyển sang Trang 3
    fireEvent.click(screen.getByRole('button', { name: 'Trang 3' }));

    // Trang 3 hiển thị Cán bộ 21 đến Cán bộ 25
    expect(screen.getByText('Cán bộ 21')).toBeInTheDocument();
    expect(screen.getByText('Cán bộ 25')).toBeInTheDocument();
    expect(screen.queryByText('Cán bộ 11')).not.toBeInTheDocument();
  });
});
