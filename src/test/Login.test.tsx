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

  it('Khi triển khai hoặc tắt demo (showDemoAccounts={false}): Ẩn hoàn toàn khối tài khoản mẫu', () => {
    render(<Login showDemoAccounts={false} />);

    expect(screen.getByText('Cổng Điểm Danh Đơn Vị')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên đăng nhập hoặc Mã đơn vị/i)).toBeInTheDocument();
    expect(screen.queryByText(/TÀI KHOẢN MẪU CỦA ĐƠN VỊ KHÁCH HÀNG/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Ủy Ban Nhân Dân Phường Bến Nghé')).not.toBeInTheDocument();
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

  it('Tự động bật Modal Yêu cầu đổi mật khẩu lần đầu khi tài khoản dùng mật khẩu mặc định (AUTH-02)', async () => {
    render(<Login />);

    // Đăng nhập với tài khoản có isDefaultPassword = true
    fireEvent.click(screen.getByText('Ủy Ban Nhân Dân Phường Bến Nghé'));
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập vào hệ thống/i }));

    // Modal xuất hiện
    await waitFor(() => {
      expect(screen.getByText('Yêu Cầu Đổi Mật Khẩu Lần Đầu')).toBeInTheDocument();
      expect(
        screen.getByText(/Tài khoản của đơn vị đang dùng mật khẩu mặc định của Finviet/i)
      ).toBeInTheDocument();
    });

    // Điền mật khẩu mới hợp lệ và thông tin người phụ trách
    const newPassInput = screen.getByLabelText(/Mật khẩu mới bảo mật/i);
    const confirmPassInput = screen.getByLabelText(/Nhập lại mật khẩu mới/i);
    const contactNameInput = screen.getByLabelText(/Người phụ trách điểm danh/i);
    const contactPhoneInput = screen.getByLabelText(/Số điện thoại \/ Hotline/i);

    fireEvent.change(newPassInput, { target: { value: 'UBND@PhuongBenNghe2026' } });
    fireEvent.change(confirmPassInput, { target: { value: 'UBND@PhuongBenNghe2026' } });
    fireEvent.change(contactNameInput, { target: { value: 'Đ/c Phan Minh Quân' } });
    fireEvent.change(contactPhoneInput, { target: { value: '0908 112 233' } });

    // Bấm lưu mật khẩu
    const saveBtn = screen.getByRole('button', { name: /Lưu mật khẩu & Tiếp tục/i });
    expect(saveBtn).not.toBeDisabled();
    fireEvent.click(saveBtn);

    // Modal đóng lại và cập nhật hồ sơ thành công
    await waitFor(() => {
      expect(
        screen.getByText(/Đã cập nhật mật khẩu mới và hồ sơ người đại diện thành công/i)
      ).toBeInTheDocument();
      expect(screen.getByText('Đ/c Phan Minh Quân')).toBeInTheDocument();
      expect(screen.getByText('0908 112 233')).toBeInTheDocument();
      expect(screen.getByText(/Mật khẩu an toàn đã được cập nhật/i)).toBeInTheDocument();
    });
  });

  it('Cho phép mở Modal đổi mật khẩu và cập nhật hồ sơ chủ động bất kỳ lúc nào', async () => {
    render(<Login />);

    fireEvent.click(screen.getByText('Bệnh Viện Nhi Đồng 1'));
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập vào hệ thống/i }));

    // Đóng modal lần đầu bằng nút "Bỏ qua lần này"
    await waitFor(() => {
      expect(screen.getByText('Yêu Cầu Đổi Mật Khẩu Lần Đầu')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Bỏ qua lần này/i }));

    // Bấm nút "Cập nhật mật khẩu & Hồ sơ" trên giao diện đã đăng nhập
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Cập nhật mật khẩu & Hồ sơ/i })
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Cập nhật mật khẩu & Hồ sơ/i }));

    // Modal mở lại
    await waitFor(() => {
      expect(screen.getByText(/Cập Nhật Mật Khẩu & Hồ Sơ/i)).toBeInTheDocument();
    });
  });
});
