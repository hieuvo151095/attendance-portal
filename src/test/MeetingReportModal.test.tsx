import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MeetingReportModal } from '../pages/meeting/MeetingReportModal';
import { Meeting } from '../types/meeting';
import { meetingReportService } from '../services/report';

describe('MeetingReportModal Component (MTG-04)', () => {
  const mockMeeting: Meeting = {
    id: 'mtg-modal-test',
    tenantId: 'ubnd-ben-nghe',
    title: 'Hội nghị Triển khai Chuyển đổi số Năm 2026',
    roomName: 'Phòng Họp A1',
    hostName: 'Đ/c Nguyễn Văn An - Chủ tịch UBND',
    startTime: '2026-11-04T08:00:00Z',
    endTime: '2026-11-04T10:00:00Z',
    status: 'completed',
    closedAt: '2026-11-04T10:00:00Z',
    closedBy: 'Đ/c Lê Thị Thảo',
    attendees: [
      {
        employeeId: 'emp-01',
        employeeCode: 'CB-001',
        fullName: 'Nguyễn Văn An',
        position: 'Chủ tịch UBND',
        departmentId: 'dept-01',
        departmentName: 'Văn phòng HĐND & UBND',
        role: 'required',
        attendanceStatus: 'left',
        checkInTime: '2026-11-04T07:55:00Z',
        checkInMethod: 'face_id',
        isLate: false,
        lateMinutes: 0,
        checkOutTime: '2026-11-04T10:00:00Z',
        checkOutMethod: 'face_id',
        isEarlyLeave: false,
        earlyLeaveMinutes: 0,
        durationMinutes: 125
      },
      {
        employeeId: 'emp-02',
        employeeCode: 'CB-002',
        fullName: 'Trần Thị Mai',
        position: 'Phó Chủ tịch UBND',
        departmentId: 'dept-01',
        departmentName: 'Văn phòng HĐND & UBND',
        role: 'required',
        attendanceStatus: 'left',
        checkInTime: '2026-11-04T08:15:00Z',
        checkInMethod: 'card',
        isLate: true,
        lateMinutes: 10,
        checkOutTime: '2026-11-04T10:00:00Z',
        checkOutMethod: 'card',
        isEarlyLeave: false,
        earlyLeaveMinutes: 0,
        durationMinutes: 105
      },
      {
        employeeId: 'emp-03',
        employeeCode: 'CB-003',
        fullName: 'Phạm Thị Cúc',
        position: 'Công chức Địa chính - Xây dựng',
        departmentId: 'dept-02',
        departmentName: 'Bộ phận Địa chính',
        role: 'optional',
        attendanceStatus: 'not_joined'
      }
    ],
    summary: {
      totalAttendees: 3,
      presentAttendees: 2,
      lateAttendees: 1,
      earlyLeaveAttendees: 0,
      absentAttendees: 1,
      attendanceRate: 67,
      averageDurationMinutes: 115
    },
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-04T10:00:00Z'
  };

  it('hiển thị đầy đủ thông tin biên bản hành chính, quốc hiệu, tiêu ngữ và số hiệu', () => {
    render(
      <MeetingReportModal
        meeting={mockMeeting}
        tenantOrgName="ỦY BAN NHÂN DÂN PHƯỜNG BẾN NGHÉ"
        onClose={vi.fn()}
      />
    );

    expect(screen.getAllByText(/CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Độc lập - Tự do - Hạnh phúc/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/BIÊN BẢN ĐIỂM DANH & BÁO CÁO CHUYÊN CẦN CUỘC HỌP/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Hội nghị Triển khai Chuyển đổi số Năm 2026/i).length).toBeGreaterThan(0);
  });

  it('hiển thị số liệu tổng hợp chuyên cần (tổng số, % có mặt, đi muộn, vắng)', () => {
    render(
      <MeetingReportModal
        meeting={mockMeeting}
        tenantOrgName="ỦY BAN NHÂN DÂN PHƯỜNG BẾN NGHÉ"
        onClose={vi.fn()}
      />
    );

    // Kiểm tra card metrics
    expect(screen.getAllByText(/Tổng triệu tập/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Có mặt \(% đạt\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/67%/i).length).toBeGreaterThan(0);
  });

  it('hiển thị con dấu số Finviet và mã băm SHA-256 niêm phong', () => {
    render(
      <MeetingReportModal
        meeting={mockMeeting}
        tenantOrgName="ỦY BAN NHÂN DÂN PHƯỜNG BẾN NGHÉ"
        onClose={vi.fn()}
      />
    );

    expect(screen.getAllByText(/CHỨNG THỰC DỮ LIỆU ĐIỆN TỬ BẤT BIẾN/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/FINVIET/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/BẤT BIẾN/i).length).toBeGreaterThan(0);
  });

  it('lọc danh sách đại biểu khi bấm các nút lọc trên thanh công cụ', () => {
    render(
      <MeetingReportModal
        meeting={mockMeeting}
        tenantOrgName="ỦY BAN NHÂN DÂN PHƯỜNG BẾN NGHÉ"
        onClose={vi.fn()}
      />
    );

    // Mặc định hiển thị cả 3 đại biểu
    expect(screen.getByText('Nguyễn Văn An')).toBeDefined();
    expect(screen.getByText('Trần Thị Mai')).toBeDefined();
    expect(screen.getByText('Phạm Thị Cúc')).toBeDefined();

    // Bấm lọc "Đi muộn"
    const lateFilterBtn = screen.getByRole('button', { name: /Đi muộn \(1\)/i });
    fireEvent.click(lateFilterBtn);

    // Chỉ còn Trần Thị Mai
    expect(screen.getByText('Trần Thị Mai')).toBeDefined();
    expect(screen.queryByText('Nguyễn Văn An')).toBeNull();
    expect(screen.queryByText('Phạm Thị Cúc')).toBeNull();

    // Bấm lọc "Vắng"
    const absentFilterBtn = screen.getByRole('button', { name: /Vắng \(1\)/i });
    fireEvent.click(absentFilterBtn);
    expect(screen.getByText('Phạm Thị Cúc')).toBeDefined();
    expect(screen.queryByText('Trần Thị Mai')).toBeNull();
  });

  it('kích hoạt xuất file Excel và in khi click các nút tương ứng', () => {
    const exportSpy = vi.spyOn(meetingReportService, 'exportMeetingToExcel').mockImplementation(() => {});
    const printSpy = vi.spyOn(meetingReportService, 'printMeetingReport').mockImplementation(() => {});

    render(
      <MeetingReportModal
        meeting={mockMeeting}
        tenantOrgName="ỦY BAN NHÂN DÂN PHƯỜNG BẾN NGHÉ"
        onClose={vi.fn()}
      />
    );

    const excelBtns = screen.getAllByRole('button', { name: /Xuất Excel|Tải file Excel/i });
    fireEvent.click(excelBtns[0]);
    expect(exportSpy).toHaveBeenCalled();

    const printBtns = screen.getAllByRole('button', { name: /In \/ Xuất PDF|In \/ Lưu PDF/i });
    fireEvent.click(printBtns[0]);
    expect(printSpy).toHaveBeenCalled();

    exportSpy.mockRestore();
    printSpy.mockRestore();
  });

  it('Thời điểm chốt biên bản hiển thị đúng 1 tiếng sau khi sự kiện kết thúc', () => {
    // Cuộc họp dự kiến 15:00 - 18:00 ngày 25/09/2026 (08:00 - 11:00 UTC)
    const testMeeting: Meeting = {
      ...mockMeeting,
      startTime: '2026-09-25T08:00:00Z',
      endTime: '2026-09-25T11:00:00Z',
      status: 'completed',
      closedAt: '2026-09-25T12:00:00Z'
    };

    render(
      <MeetingReportModal
        meeting={testMeeting}
        tenantOrgName="ỦY BAN NHÂN DÂN PHƯỜNG BẾN NGHÉ"
        onClose={vi.fn()}
      />
    );

    // Thời gian dự kiến: 15:00 - 18:00
    expect(screen.getByText(/15:00 - 18:00 ngày 25\/09\/2026/)).toBeInTheDocument();

    // Thời điểm chốt biên bản: 19:00 ngày 25/09/2026 (đúng 1 tiếng sau sự kiện)
    expect(screen.getByText(/19:00 ngày 25\/09\/2026/)).toBeInTheDocument();
  });
});
