import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastContainer, toast, DEFAULT_TOAST_DURATION } from '../design-system/Toast';

describe('Hệ Thống Toast Thông Báo Góc Trên Bên Phải (Design System Toast)', () => {
  beforeEach(() => {
    toast.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    toast.clear();
    vi.useRealTimers();
  });

  it('Mặc định thời gian hiển thị là 10 giây (10,000ms) theo yêu cầu hệ thống', () => {
    expect(DEFAULT_TOAST_DURATION).toBe(10000);
  });

  it('Toast hiển thị nổi ở góc trên bên phải (fixed top-right) và không làm thay đổi cấu trúc UI', () => {
    render(
      <div>
        <div data-testid="main-content">Nội dung trang quản trị</div>
        <ToastContainer />
      </div>
    );

    act(() => {
      toast.success('Đã lưu cấu hình thành công!');
    });

    const container = screen.getByTestId('toast-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveStyle({
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 99999
    });

    // Content bên trong UI không bị đẩy hay thay đổi cấu trúc
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByText('Đã lưu cấu hình thành công!')).toBeInTheDocument();
  });

  it('Toast tự động tắt sau 10 giây (10,000ms)', () => {
    render(<ToastContainer />);

    act(() => {
      toast.success('Thông báo sẽ tự đóng sau 10s');
    });

    expect(screen.getByText('Thông báo sẽ tự đóng sau 10s')).toBeInTheDocument();

    // Tiến hành tua thời gian 9.9 giây: Toast vẫn còn
    act(() => {
      vi.advanceTimersByTime(9900);
    });
    expect(screen.getByText('Thông báo sẽ tự đóng sau 10s')).toBeInTheDocument();

    // Tua thêm 200ms (tổng > 10,000ms): Toast tự động biến mất
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByText('Thông báo sẽ tự đóng sau 10s')).not.toBeInTheDocument();
  });

  it('Người dùng có thể chủ động tắt toast ngay lập tức bằng nút đóng (X)', () => {
    render(<ToastContainer />);

    act(() => {
      toast.info('Thông báo thử nghiệm chủ động đóng');
    });

    expect(screen.getByText('Thông báo thử nghiệm chủ động đóng')).toBeInTheDocument();

    const closeBtn = screen.getByTestId('toast-close-btn');
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn).toHaveAttribute('title', 'Đóng thông báo (Tự đóng sau 10s)');

    // Người dùng chủ động click nút đóng
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Thông báo thử nghiệm chủ động đóng')).not.toBeInTheDocument();
  });

  it('Hỗ trợ đầy đủ các tone thông báo: success, danger/error, warning, info với thời gian 10s', () => {
    render(<ToastContainer />);

    act(() => {
      toast.success('Thông báo thành công');
      toast.danger('Thông báo lỗi nguy hiểm');
      toast.warning('Cảnh báo lưu ý');
      toast.info('Thông tin hệ thống');
    });

    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    expect(screen.getByTestId('toast-danger')).toBeInTheDocument();
    expect(screen.getByTestId('toast-warning')).toBeInTheDocument();
    expect(screen.getByTestId('toast-info')).toBeInTheDocument();

    // Sau 10s, toàn bộ tự động đóng
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toast-danger')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toast-warning')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toast-info')).not.toBeInTheDocument();
  });
});
