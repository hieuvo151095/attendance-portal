import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MeetingReportArchive } from '../pages/report/MeetingReportArchive';
import { authService } from '../services/auth';
import { meetingService } from '../services/meeting';
import { meetingReportService } from '../services/report';

describe('Báo Cáo Cuộc Họp & Lưu Trữ Biên Bản Kỳ (DASH-01: Meeting Attendance Summary & Archive)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    meetingService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    vi.clearAllMocks();
  });

  it('Hiển thị các thẻ thống kê tổng hợp và danh mục các cuộc họp đã kết thúc', async () => {
    render(<MeetingReportArchive tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(screen.getByText('Cuộc họp đã kết thúc')).toBeInTheDocument();
    });

    // Xác nhận đã xóa tiêu đề thừa theo yêu cầu UI
    expect(
      screen.queryByText('Tổng Hợp & Lưu Trữ Báo Cáo Cuộc Họp Kỳ (DASH-01)')
    ).not.toBeInTheDocument();

    // Các thẻ thống kê
    expect(screen.getByText('Cuộc họp đã kết thúc')).toBeInTheDocument();
    expect(screen.getByText('Tỷ lệ chuyên cần trung bình')).toBeInTheDocument();
    expect(screen.getByText('Tổng lượt đại biểu có mặt')).toBeInTheDocument();
    expect(screen.getByText('Tổng lượt vắng mặt')).toBeInTheDocument();

    // Kiểm tra danh mục cuộc họp đã kết thúc được hiển thị
    await waitFor(() => {
      expect(
        screen.getByText('Họp Giao Ban Khối Kinh Tế - Đô Thị Tháng 10/2026')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Hội Nghị Chuyên Đề Cải Cách Thủ Tục Hành Chính Số')
      ).toBeInTheDocument();
    });

    // Các thông tin phòng họp
    expect(
      screen.getByText('Hội trường số 1 - Tầng 2 Trụ sở UBND')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Phòng Họp Hội Đồng Nhân Dân - Trụ sở UBND')
    ).toBeInTheDocument();
  });

  it('Tuyệt đối KHÔNG hiển thị các cuộc họp đang diễn ra hoặc sắp diễn ra (status !== completed)', async () => {
    render(<MeetingReportArchive tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(
        screen.getByText('Họp Giao Ban Khối Kinh Tế - Đô Thị Tháng 10/2026')
      ).toBeInTheDocument();
    });

    // Cuộc họp đang diễn ra 'mtg-ubnd-01' không được xuất hiện trên bảng này
    expect(
      screen.queryByText('Họp Giao Ban Thường Kỳ Tháng 11/2026')
    ).not.toBeInTheDocument();
  });

  it('Tính toán chính xác tỷ lệ chuyên cần và số lượt đại biểu vắng mặt', async () => {
    render(<MeetingReportArchive tenantId={ubndTenant} />);

    await waitFor(() => {
      // mtg-ubnd-03 có tỷ lệ 67%, mtg-ubnd-04 có tỷ lệ 100%
      expect(screen.getByText('67%')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    // Kiểm tra thông tin vắng mặt
    expect(screen.getAllByText('1 vắng').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('0 vắng')).toBeInTheDocument();
  });

  it('Hỗ trợ tìm kiếm theo tên cuộc họp hoặc người chủ trì', async () => {
    render(<MeetingReportArchive tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(
        screen.getByText('Họp Giao Ban Khối Kinh Tế - Đô Thị Tháng 10/2026')
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Tìm theo tên cuộc họp, chủ trì, phòng họp...'
    );

    // Tìm kiếm cụm từ 'Kinh Tế'
    fireEvent.change(searchInput, { target: { value: 'Kinh Tế' } });

    await waitFor(() => {
      expect(
        screen.getByText('Họp Giao Ban Khối Kinh Tế - Đô Thị Tháng 10/2026')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Hội Nghị Chuyên Đề Cải Cách Thủ Tục Hành Chính Số')
      ).not.toBeInTheDocument();
    });

    // Xóa từ khóa tìm kiếm
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(
        screen.getByText('Hội Nghị Chuyên Đề Cải Cách Thủ Tục Hành Chính Số')
      ).toBeInTheDocument();
    });
  });

  it('Bấm Xem biên bản họp mở modal hiển thị đầy đủ thông tin chi tiết và chứng thực số', async () => {
    render(<MeetingReportArchive tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(
        screen.getByText('Hội Nghị Chuyên Đề Cải Cách Thủ Tục Hành Chính Số')
      ).toBeInTheDocument();
    });

    // Mở menu tác vụ của dòng đầu tiên
    const actionButtons = screen.getAllByRole('button', { name: /thao tác|tác vụ/i });
    expect(actionButtons.length).toBeGreaterThan(0);
    fireEvent.click(actionButtons[0]);

    // Bấm 'Xem biên bản họp'
    const viewReportItem = await screen.findByText('Xem biên bản họp');
    fireEvent.click(viewReportItem);

    // Kiểm tra modal biên bản họp xuất hiện
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /BIÊN BẢN ĐIỂM DANH & BÁO CÁO CHUYÊN CẦN CUỘC HỌP/i
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/CHỨNG THỰC DỮ LIỆU ĐIỆN TỬ BẤT BIẾN/i)
      ).toBeInTheDocument();
    });

    // Đóng modal bằng nút đóng
    const closeButtons = screen.getAllByRole('button', { name: /đóng/i });
    expect(closeButtons.length).toBeGreaterThan(0);
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', {
          name: /BIÊN BẢN ĐIỂM DANH & BÁO CÁO CHUYÊN CẦN CUỘC HỌP/i
        })
      ).not.toBeInTheDocument();
    });
  });

  it('Hỗ trợ xuất báo cáo tổng hợp danh mục cuộc họp ra file Excel', async () => {
    const exportSpy = vi
      .spyOn(meetingReportService, 'exportConcludedMeetingsSummaryToExcel')
      .mockImplementation(() => {});

    render(<MeetingReportArchive tenantId={ubndTenant} />);

    await waitFor(() => {
      expect(
        screen.getByText('Xuất Excel Tổng Hợp Kỳ')
      ).toBeInTheDocument();
    });

    const exportBtn = screen.getByText('Xuất Excel Tổng Hợp Kỳ');
    fireEvent.click(exportBtn);

    expect(exportSpy).toHaveBeenCalledTimes(1);
    exportSpy.mockRestore();
  });
});
