import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../pages/auth/Login';
import { authService } from '../services/auth';

describe('Giao diện Màn hình Đăng nhập (AUTH-01: Login Screen)', () => {
  beforeEach(() => {
    authService.resetMockData();
  });

  it('Hiển thị đầy đủ nhận diện thương hiệu Finviet và các trường nhập liệu chuẩn Design System', () => {
    render(<Login />);

    expect(screen.getByText('Cổng Điểm Danh Đơn Vị')).toBeInTheDocument();
    expect(screen.getByText('FINVIET TECH')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên đăng nhập hoặc Mã đơn vị/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mật khẩu tài khoản/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng nhập vào hệ thống/i })).toBeInTheDocument();
    expect(screen.getByText(/TÀI KHOẢN MẪU CỦA ĐƠN VỊ KHÁCH HÀNG/i)).toBeInTheDocument();
  });

  it('Báo lỗi nghiệp vụ khi bấm đăng nhập mà để trống thông tin', async () => {
    render(<Login />);

    const submitBtn = screen.getByRole('button', { name: /Đăng nhập vào hệ thống/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Vui lòng nhập tên đăng nhập hoặc mã đơn vị/i)
      ).toBeInTheDocument();
    });
  });

  it('Bấm vào tài khoản mẫu tự động điền mã đơn vị và mật khẩu Finviet', async () => {
    render(<Login />);

    const hospitalBtn = screen.getByText('Bệnh Viện Nhi Đồng 1');
    fireEvent.click(hospitalBtn);

    const usernameInput = screen.getByLabelText(/Tên đăng nhập hoặc Mã đơn vị/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Mật khẩu tài khoản/i) as HTMLInputElement;

    expect(usernameInput.value).toBe('bv-nhidong-1');
    expect(passwordInput.value).toBe('Finviet@2026');
  });

  it('Đăng nhập thành công hiển thị màn hình thông tin phiên làm việc và gọi callback onLoginSuccess', async () => {
    const handleSuccess = vi.fn();
    render(<Login onLoginSuccess={handleSuccess} />);

    // Chọn tài khoản UBND
    fireEvent.click(screen.getByText('Ủy Ban Nhân Dân Phường Bến Nghé'));

    const submitBtn = screen.getByRole('button', { name: /Đăng nhập vào hệ thống/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Đã Đăng Nhập Thành Công')).toBeInTheDocument();
      expect(screen.getByText('Ủy Ban Nhân Dân Phường Bến Nghé')).toBeInTheDocument();
      expect(screen.getByText('ubnd-ben-nghe')).toBeInTheDocument();
      expect(screen.getByText(/Ủy ban \/ Khối Nhà Nước/i)).toBeInTheDocument();
    });

    expect(handleSuccess).toHaveBeenCalledTimes(1);
    expect(handleSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: expect.objectContaining({
          username: 'ubnd-ben-nghe',
          orgType: 'government'
        })
      })
    );
  });

  it('Cho phép đăng xuất và quay lại màn hình đăng nhập ban đầu', async () => {
    render(<Login />);

    // Chọn tài khoản và đăng nhập
    fireEvent.click(screen.getByText('Công Ty May & Sản Xuất Tân Bình'));
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập vào hệ thống/i }));

    await waitFor(() => {
      expect(screen.getByText('Đã Đăng Nhập Thành Công')).toBeInTheDocument();
    });

    // Bấm đăng xuất
    const logoutBtn = screen.getByRole('button', { name: /Đăng xuất/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByText('Cổng Điểm Danh Đơn Vị')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Đăng nhập vào hệ thống/i })).toBeInTheDocument();
    });
  });
});
