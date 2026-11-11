import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DailyAttendance } from '../pages/attendance/DailyAttendance';
import { authService } from '../services/auth';
import { employeeService } from '../services/employee';
import { departmentService } from '../services/department';
import { attendanceSettingService } from '../services/setting';
import { dailyAttendanceService } from '../services/attendance';

describe('Giao diện Bảng Theo Dõi Chấm Công Ngày (ATT-03: Daily Attendance UI)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    employeeService.resetMockData();
    departmentService.resetMockData();
    attendanceSettingService.resetMockData();
    dailyAttendanceService.resetMockData();

    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
  });

  it('Hiển thị tiêu đề, thẻ tóm tắt số liệu và danh sách nhân sự chấm công ban đầu (ngày 06/11/2026)', async () => {
    render(<DailyAttendance tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Bảng Theo Dõi Chấm Công Ngày')).toBeInTheDocument();
    });

    expect(screen.getByText('Tổng nhân sự')).toBeInTheDocument();
    expect(screen.getByText('Đã có mặt tại cơ quan')).toBeInTheDocument();
    expect(screen.getAllByText('Đúng giờ').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Đi muộn').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Nghỉ phép').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Chưa đến / Vắng mặt').length).toBeGreaterThanOrEqual(1);

    // Kiểm tra tên cán bộ nhân sự xuất hiện trên bảng ở Trang 1
    await waitFor(() => {
      expect(screen.getByText('Thượng sĩ Ngô Văn Kiên')).toBeInTheDocument();
    });

    // Cột "Độ lệch giờ", "Trạng thái" không xuất hiện; Cột "Thao tác" xuất hiện
    expect(screen.queryByText('Độ lệch giờ')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Trạng thái' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Thao tác' })).toBeInTheDocument();

    // Giờ đến hiển thị giờ và trạng thái "Đúng giờ" trong cột Check-in
    expect(screen.getAllByText('06:55').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Đúng giờ').length).toBeGreaterThanOrEqual(1);

    // Chuyển sang Trang 3 để xem Bà Phạm Thị Cúc (đi muộn 45 phút)
    const page3Btn = screen.getByRole('button', { name: /Trang 3/i });
    expect(page3Btn).toBeInTheDocument();
    fireEvent.click(page3Btn);

    await waitFor(() => {
      expect(screen.getByText('Bà Phạm Thị Cúc')).toBeInTheDocument();
    });

    // Kiểm tra giờ đến 07:45 và nhãn "Đi muộn (45p)"
    expect(screen.getByText('07:45')).toBeInTheDocument();
    expect(screen.getAllByText(/Đi muộn/i).length).toBeGreaterThanOrEqual(1);
  });

  it('Tìm kiếm cán bộ nhân sự cập nhật bảng lọc tức thì', async () => {
    render(<DailyAttendance tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Thượng sĩ Ngô Văn Kiên')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm theo tên cán bộ, mã NV/i);
    fireEvent.change(searchInput, { target: { value: 'Phạm Thị Cúc' } });

    await waitFor(() => {
      expect(screen.getByText('Bà Phạm Thị Cúc')).toBeInTheDocument();
      expect(screen.queryByText('Thượng sĩ Ngô Văn Kiên')).not.toBeInTheDocument();
    });
  });

  it('Lọc theo trạng thái Đi muộn chỉ hiển thị nhân sự đi muộn', async () => {
    render(<DailyAttendance tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Thượng sĩ Ngô Văn Kiên')).toBeInTheDocument();
    });

    // Chọn bộ lọc trạng thái (Select thứ 2 là status filter)
    const statusSelects = screen.getAllByRole('combobox');
    const statusFilter = statusSelects[1];
    fireEvent.change(statusFilter, { target: { value: 'late' } });

    await waitFor(() => {
      expect(screen.getByText('Bà Phạm Thị Cúc')).toBeInTheDocument();
      expect(screen.queryByText('Thượng sĩ Ngô Văn Kiên')).not.toBeInTheDocument();
    });
  });

  it('Modal Chi Tiết: Không mở khi bấm vào tên cán bộ; chỉ mở khi bấm icon 3 chấm [Chi tiết chấm công]', async () => {
    render(<DailyAttendance tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Thượng sĩ Ngô Văn Kiên')).toBeInTheDocument();
    });

    // 1. Bấm vào cột cán bộ nhân sự không mở modal
    fireEvent.click(screen.getByText('Thượng sĩ Ngô Văn Kiên'));
    expect(screen.queryByText('Chi tiết chấm công')).not.toBeInTheDocument();

    // 2. Mở qua nút Thao tác (3 chấm) -> "Chi tiết chấm công"
    const actionBtns = screen.getAllByRole('button', { name: /Thao tác/i });
    fireEvent.click(actionBtns[0]);

    const detailMenuOption = screen.getByText('Chi tiết chấm công');
    fireEvent.click(detailMenuOption);

    await waitFor(() => {
      expect(screen.getByText('Chi tiết chấm công')).toBeInTheDocument();
    });

    const leaveCheckboxAn = screen.getByRole('checkbox', { name: /Xác nhận nghỉ phép/i });
    // Quản trị viên vẫn có thể tích chọn nghỉ phép đột xuất ngay cả khi cán bộ đã check-in
    expect(leaveCheckboxAn).toBeEnabled();
    expect(screen.getByText(/Đã vào ca/i)).toBeInTheDocument();

    // Đóng modal
    const closeBtnAn = screen.getByRole('button', { name: 'Đóng' });
    fireEvent.click(closeBtnAn);

    await waitFor(() => {
      expect(screen.queryByText('Chi tiết chấm công')).not.toBeInTheDocument();
    });

    // 3. Kiểm tra với cán bộ CHƯA ĐẾN / VẮNG (Ông Bùi Tiến Dũng - chưa có check-in)
    const searchInput = screen.getByPlaceholderText(/Tìm theo tên cán bộ, mã NV/i);
    fireEvent.change(searchInput, { target: { value: 'Bùi Tiến Dũng' } });

    await waitFor(() => {
      expect(screen.getByText('Ông Bùi Tiến Dũng')).toBeInTheDocument();
    });

    // Bấm vào tên không mở modal
    fireEvent.click(screen.getByText('Ông Bùi Tiến Dũng'));
    expect(screen.queryByText('Chi tiết chấm công')).not.toBeInTheDocument();

    // Mở chi tiết qua nút 3 chấm thao tác
    const dungActionBtn = screen.getByRole('button', { name: /Thao tác/i });
    fireEvent.click(dungActionBtn);
    fireEvent.click(screen.getByText('Chi tiết chấm công'));

    await waitFor(() => {
      expect(screen.getByText('Chi tiết chấm công')).toBeInTheDocument();
    });

    const leaveCheckboxDung = screen.getByRole('checkbox', { name: /Xác nhận nghỉ phép/i });
    expect(leaveCheckboxDung).toBeEnabled();
    expect(leaveCheckboxDung).not.toBeChecked();
    expect(screen.getByText(/Chưa đến \/ Vắng \(Không phép\)/i)).toBeInTheDocument();

    // Admin tick chọn để xác nhận Nghỉ phép
    fireEvent.click(leaveCheckboxDung);

    await waitFor(() => {
      expect(leaveCheckboxDung).toBeChecked();
      expect(screen.getByText('Cả ngày')).toBeInTheDocument();
    });

    // Bấm nút Xác nhận trong khối nghỉ phép để mở popup xác nhận
    const confirmLeaveTrigger = screen.getByRole('button', { name: 'Xác nhận' });
    fireEvent.click(confirmLeaveTrigger);

    await waitFor(() => {
      expect(screen.getByText('Xác nhận ghi nhận nghỉ phép')).toBeInTheDocument();
    });

    // Bấm nút Xác nhận trong popup modal
    const popupConfirmBtns = screen.getAllByRole('button', { name: 'Xác nhận' });
    fireEvent.click(popupConfirmBtns[popupConfirmBtns.length - 1]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Điều chỉnh' })).toBeInTheDocument();
    });

    // Đóng modal và kiểm tra hàng trên bảng chính đã cập nhật hiển thị "Nghỉ phép"
    const closeBtnDung = screen.getByRole('button', { name: 'Đóng' });
    fireEvent.click(closeBtnDung);

    await waitFor(() => {
      expect(screen.queryByText('Chi tiết chấm công')).not.toBeInTheDocument();
      expect(screen.getAllByText('Nghỉ phép').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('Điều hướng ngày: Mặc định là 06/11/2026, nút Ngày sau bị vô hiệu hóa khi ở ngày hôm nay', async () => {
    render(<DailyAttendance tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Bảng Theo Dõi Chấm Công Ngày')).toBeInTheDocument();
    });

    const dateInput = screen.getByLabelText(/Chọn ngày xem chấm công/i) as HTMLInputElement;
    expect(dateInput.value).toBe('2026-11-06');
    expect(dateInput.max).toBe('2026-11-06');

    // Nút Ngày sau (tiến đến tương lai) bị disabled vì hôm nay là ngày mới nhất
    const nextDayBtn = screen.getByTitle(/Không thể xem ngày trong tương lai/i);
    expect(nextDayBtn).toBeDisabled();

    // Bấm nút Ngày trước (lùi về 05/11/2026)
    const prevDayBtn = screen.getByTitle('Ngày trước');
    fireEvent.click(prevDayBtn);

    await waitFor(() => {
      expect(dateInput.value).toBe('2026-11-05');
      // Lúc này không còn ở hôm nay nên nút Hôm nay xuất hiện
      expect(screen.getByRole('button', { name: /Hôm nay \(06\/11\)/i })).toBeInTheDocument();
    });

    // Bấm nút "Hôm nay (06/11)" quay trở lại ngày 06/11
    const todayBtn = screen.getByRole('button', { name: /Hôm nay \(06\/11\)/i });
    fireEvent.click(todayBtn);

    await waitFor(() => {
      expect(dateInput.value).toBe('2026-11-06');
    });
  });

  it('Mở modal Chi tiết chấm công hiển thị đầy đủ lịch sử quét trong ngày bằng cách bấm vào hàng nhân sự', async () => {
    render(<DailyAttendance tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Thượng sĩ Ngô Văn Kiên')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm theo tên cán bộ, mã NV/i);
    fireEvent.change(searchInput, { target: { value: 'Nguyễn Văn An' } });

    await waitFor(() => {
      expect(screen.getByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();
      expect(screen.queryByText('Bà Phạm Thị Cúc')).not.toBeInTheDocument();
    });

    // Bấm vào tên cán bộ trên hàng KHÔNG mở modal
    fireEvent.click(screen.getByText('Đ/c Nguyễn Văn An'));
    expect(screen.queryByText('Chi tiết chấm công')).not.toBeInTheDocument();

    // Mở modal qua nút 3 chấm thao tác
    const actionBtn = screen.getByRole('button', { name: 'Thao tác' });
    fireEvent.click(actionBtn);
    fireEvent.click(screen.getByText('Chi tiết chấm công'));

    await waitFor(() => {
      expect(screen.getByText('Chi tiết chấm công')).toBeInTheDocument();
      expect(screen.getByText(/Vào ca \(Check-in\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Tan ca \(Check-out\)/i)).toBeInTheDocument();
    });
  });

  it('Cột Thao tác: Bấm nút 3 chấm hiển thị duy nhất thao tác "Chi tiết chấm công", bấm vào mở SideSheet', async () => {
    render(<DailyAttendance tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: 'Thao tác' })).toBeInTheDocument();
      expect(screen.getByText('Thượng sĩ Ngô Văn Kiên')).toBeInTheDocument();
    });

    // Tìm các nút Thao tác (3 chấm)
    const actionButtons = screen.getAllByRole('button', { name: 'Thao tác' });
    expect(actionButtons.length).toBeGreaterThan(0);

    // Bấm vào nút 3 chấm của cán bộ đầu tiên
    fireEvent.click(actionButtons[0]);

    // Menu xuất hiện có duy nhất hành động "Chi tiết chấm công"
    await waitFor(() => {
      expect(screen.getByText('Chi tiết chấm công')).toBeInTheDocument();
    });

    // Bấm vào hành động "Chi tiết chấm công"
    fireEvent.click(screen.getByText('Chi tiết chấm công'));

    // SideSheet mở ra với tiêu đề "Chi tiết chấm công"
    await waitFor(() => {
      expect(screen.getAllByText('Chi tiết chấm công').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Lịch sử các lần quét thiết bị/i)).toBeInTheDocument();
    });
  });

  it('Mở modal Quét điểm danh nhanh và thực hiện quét thành công cập nhật bảng', async () => {
    render(<DailyAttendance tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Quét điểm danh nhanh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Quét điểm danh nhanh'));

    await waitFor(() => {
      expect(screen.getByText('Xác nhận quét điểm danh')).toBeInTheDocument();
    });

    // Phương thức xác thực chỉ có duy nhất 1 lựa chọn: "Ghi nhận thủ công từ Quản trị viên"
    const methodSelect = screen.getByLabelText(/Phương thức xác thực/i) as HTMLSelectElement;
    expect(methodSelect).toBeInTheDocument();
    expect(methodSelect.options.length).toBe(1);
    expect(methodSelect.options[0].text).toBe('Ghi nhận thủ công từ Quản trị viên');

    // Nhập giờ quét: 16:30 (Check-out)
    const typeSelect = screen.getByLabelText(/Loại sự kiện/i);
    fireEvent.change(typeSelect, { target: { value: 'check_out' } });

    const timeInput = screen.getByLabelText(/Thời điểm quét/i);
    fireEvent.change(timeInput, { target: { value: '16:30' } });

    const confirmBtn = screen.getByText('Xác nhận quét điểm danh');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByText('Xác nhận quét điểm danh')).not.toBeInTheDocument();
    });
  });

  it('Từ ngày 01 đến 04/11/2026: Tất cả cán bộ có mặt đều có đầy đủ dữ liệu giờ về (Check-out)', async () => {
    const dates = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04'];

    for (const d of dates) {
      const records = await dailyAttendanceService.getDailyAttendance(ubndTenant, { date: d });
      const presentRecords = records.filter((r) => Boolean(r.checkInTime) && r.status !== 'leave');

      expect(presentRecords.length).toBeGreaterThan(0);
      for (const rec of presentRecords) {
        expect(rec.checkOutTime).toBeDefined();
        expect(rec.checkOutTime).not.toBe('');
        expect(rec.checkOutMethod).toBeDefined();
      }
    }
  });

  it('Ngày hôm trước (05/11/2026): Quản trị viên bổ sung giờ về (Check-out bù) cho cán bộ quên quét và lưu vết kiểm toán (Audit Log) thành công', async () => {
    // 1. Kiểm tra ngày 05/11/2026 có 2 cán bộ quên check-out
    const unCheckedList = await dailyAttendanceService.getUncheckedOutEmployees(ubndTenant, '2026-11-05');
    expect(unCheckedList.length).toBe(2);
    expect(unCheckedList.some(r => r.employeeCode === 'UBND-003')).toBe(true);

    // 2. Thực hiện check-out bù cho cán bộ UBND-003 (Ông Hoàng Văn Đức)
    const updated = await dailyAttendanceService.adminCheckOut({
      tenantId: ubndTenant,
      employeeId: 'emp-ubnd-03',
      date: '2026-11-05',
      checkOutTime: '17:00',
      reason: 'Cán bộ quên quét vân tay khi ra về',
      adminName: 'Đ/c Nguyễn Văn An (Quản trị viên)',
      note: 'Đã xác nhận có mặt làm việc đến hết ca'
    });

    expect(updated.checkOutTime).toBe('17:00');
    expect(updated.checkOutMethod).toBe('manual');
    expect(updated.status).toBe('on_time');
    expect(updated.auditLogs).toBeDefined();
    expect(updated.auditLogs!.length).toBeGreaterThan(0);
    expect(updated.auditLogs![0].action).toBe('admin_checkout');
    expect(updated.auditLogs![0].performedBy).toContain('Nguyễn Văn An');
    expect(updated.auditLogs![0].reason).toBe('Cán bộ quên quét vân tay khi ra về');

    // 3. Sau khi check-out bù, danh sách quên check-out giảm còn 1
    const remaining = await dailyAttendanceService.getUncheckedOutEmployees(ubndTenant, '2026-11-05');
    expect(remaining.length).toBe(1);
  });

  it('SideSheet Chi tiết: Quản trị viên điều chỉnh giờ về ngay trong right-sheet và xác nhận qua popup popup modal', async () => {
    render(<DailyAttendance tenantId={ubndTenant} />);

    // Chuyển sang ngày 05/11/2026 (có người quên check-out)
    const prevBtn = screen.getByRole('button', { name: /Ngày trước/i });
    fireEvent.click(prevBtn);

    // Tìm kiếm cán bộ Hoàng Văn Đức (UBND-003 - quên check-out)
    const searchInput = screen.getByPlaceholderText(/Tìm theo tên cán bộ, mã NV/i);
    fireEvent.change(searchInput, { target: { value: 'Hoàng Văn Đức' } });

    await waitFor(() => {
      expect(screen.getByText('Ông Hoàng Văn Đức')).toBeInTheDocument();
    });

    // Mở SideSheet Chi tiết chấm công
    const actionBtn = screen.getByRole('button', { name: /Thao tác/i });
    fireEvent.click(actionBtn);
    fireEvent.click(screen.getByText('Chi tiết chấm công'));

    await waitFor(() => {
      expect(screen.getAllByText('Chi tiết chấm công').length).toBeGreaterThanOrEqual(1);
    });

    // Ban đầu hiển thị "Chưa về" và nút "Chấm công"
    expect(screen.getByText('Chưa về')).toBeInTheDocument();
    const chamCongBtn = screen.getByRole('button', { name: 'Chấm công' });
    expect(chamCongBtn).toBeInTheDocument();
    fireEvent.click(chamCongBtn);

    // Khi bấm "Chấm công", "Chưa về" được thay thế bằng ô nhập giờ và nút chuyển thành "Xác nhận"
    const timeInput = screen.getByLabelText('Giờ về bổ sung') as HTMLInputElement;
    expect(timeInput).toBeInTheDocument();
    fireEvent.change(timeInput, { target: { value: '17:30' } });

    // Bấm nút "Xác nhận" ngay cạnh ô giờ để mở pop-up xác nhận
    const confirmInlineBtn = screen.getByRole('button', { name: 'Xác nhận' });
    fireEvent.click(confirmInlineBtn);

    // Pop-up modal xác nhận xuất hiện
    await waitFor(() => {
      expect(screen.getByText('Xác nhận bổ sung giờ về')).toBeInTheDocument();
      expect(screen.getByText(/Bạn có chắc chắn muốn xác nhận bổ sung giờ về lúc/i)).toBeInTheDocument();
      expect(screen.getByText(/Thông tin check-out được bổ sung bởi/i)).toBeInTheDocument();
    });

    // Bấm nút "Xác nhận" trên popup
    const confirmBtns = screen.getAllByRole('button', { name: /^Xác nhận$/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);

    // Kiểm tra nhãn hiển thị thông tin check-out được bổ sung bởi admin
    await waitFor(() => {
      expect(screen.getByText(/Thông tin check-out được bổ sung bởi/i)).toBeInTheDocument();
    });
  });

  it('SideSheet Chi tiết: Cán bộ đã check-in nhưng có việc khẩn cấp, Quản trị viên xác nhận nghỉ phép và chọn Buổi chiều / Buổi sáng / Cả ngày', async () => {
    render(<DailyAttendance tenantId={ubndTenant} />);

    // Tìm kiếm cán bộ Nguyễn Văn An (đã check-in vào ca)
    const searchInput = screen.getByPlaceholderText(/Tìm theo tên cán bộ, mã NV/i);
    fireEvent.change(searchInput, { target: { value: 'Nguyễn Văn An' } });

    await waitFor(() => {
      expect(screen.getByText('Đ/c Nguyễn Văn An')).toBeInTheDocument();
    });

    // Mở SideSheet Chi tiết chấm công
    const actionBtn = screen.getByRole('button', { name: /Thao tác/i });
    fireEvent.click(actionBtn);
    fireEvent.click(screen.getByText('Chi tiết chấm công'));

    await waitFor(() => {
      expect(screen.getAllByText('Chi tiết chấm công').length).toBeGreaterThanOrEqual(1);
    });

    const leaveCheckbox = screen.getByRole('checkbox', { name: /Xác nhận nghỉ phép/i });
    expect(leaveCheckbox).toBeEnabled();

    // Bật xác nhận nghỉ phép đột xuất
    fireEvent.click(leaveCheckbox);

    await waitFor(() => {
      expect(leaveCheckbox).toBeChecked();
      // Hiển thị các lựa chọn: Cả ngày, Buổi sáng, Buổi chiều
      expect(screen.getByText('Buổi chiều')).toBeInTheDocument();
      expect(screen.getByText('Buổi sáng')).toBeInTheDocument();
      expect(screen.getByText('Cả ngày')).toBeInTheDocument();
    });

    // Chọn nghỉ phép "Buổi chiều"
    const afternoonRadio = screen.getByRole('radio', { name: /Buổi chiều/i });
    fireEvent.click(afternoonRadio);
    expect(afternoonRadio).toBeChecked();

    // Bấm nút "Xác nhận" trong khối nghỉ phép để mở popup xác nhận
    const confirmLeaveTrigger = screen.getByRole('button', { name: 'Xác nhận' });
    fireEvent.click(confirmLeaveTrigger);

    await waitFor(() => {
      expect(screen.getByText('Xác nhận ghi nhận nghỉ phép')).toBeInTheDocument();
    });

    // Bấm nút "Xác nhận" trong popup modal
    const popupConfirmBtns = screen.getAllByRole('button', { name: 'Xác nhận' });
    fireEvent.click(popupConfirmBtns[popupConfirmBtns.length - 1]);

    await waitFor(() => {
      expect(screen.getAllByText('Nghỉ buổi chiều').length).toBeGreaterThanOrEqual(1);
    });

    // 1. Sau khi xác nhận, khối nghỉ phép chuyển sang Trạng thái đã xác nhận (Confirmed Stage) kèm nút "Điều chỉnh"
    const adjustBtn = screen.getByRole('button', { name: 'Điều chỉnh' });
    expect(adjustBtn).toBeInTheDocument();

    // 2. Bấm "Điều chỉnh" cho phép Quản trị viên sửa lại thông tin nghỉ phép
    fireEvent.click(adjustBtn);
    expect(screen.getByRole('radio', { name: /Buổi sáng/i })).toBeInTheDocument();
  });
});
