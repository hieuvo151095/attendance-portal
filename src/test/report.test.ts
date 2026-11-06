import { describe, it, expect, vi } from 'vitest';
import { meetingReportService } from '../services/report';
import { Meeting } from '../types/meeting';

describe('MeetingReportService (MTG-04)', () => {
  const mockMeeting: Meeting = {
    id: 'mtg-test-01',
    tenantId: 'ubnd-ben-nghe',
    title: 'Họp Giao Ban Công Tác Cải Cách Hành Chính Tuần 45',
    roomName: 'Hội trường Thống Nhất (Tầng 2)',
    hostName: 'Đ/c Nguyễn Văn An - Chủ tịch UBND',
    description: 'Đánh giá tiến độ số hóa hồ sơ thủ tục hành chính',
    startTime: '2026-11-04T08:00:00Z',
    endTime: '2026-11-04T10:00:00Z',
    status: 'completed',
    closedAt: '2026-11-04T10:00:00Z',
    closedBy: 'Đ/c Lê Thị Thảo - Chánh Văn phòng',
    checkInGraceMinutes: 5,
    checkOutGraceMinutes: 10,
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
        checkInTime: '2026-11-04T08:12:00Z',
        checkInMethod: 'card',
        isLate: true,
        lateMinutes: 7,
        checkOutTime: '2026-11-04T10:00:00Z',
        checkOutMethod: 'card',
        isEarlyLeave: false,
        earlyLeaveMinutes: 0,
        durationMinutes: 108
      },
      {
        employeeId: 'emp-03',
        employeeCode: 'CB-003',
        fullName: 'Lê Văn Hùng',
        position: 'Chỉ huy trưởng BCH Quân sự',
        departmentId: 'dept-04',
        departmentName: 'Ban Chỉ huy Quân sự Phường',
        role: 'required',
        attendanceStatus: 'left',
        checkInTime: '2026-11-04T07:58:00Z',
        checkInMethod: 'face_id',
        isLate: false,
        lateMinutes: 0,
        checkOutTime: '2026-11-04T09:30:00Z',
        checkOutMethod: 'face_id',
        isEarlyLeave: true,
        earlyLeaveMinutes: 20,
        durationMinutes: 92
      },
      {
        employeeId: 'emp-04',
        employeeCode: 'CB-004',
        fullName: 'Hoàng Văn Đức',
        position: 'Công chức Tư pháp - Hộ tịch',
        departmentId: 'dept-03',
        departmentName: 'Bộ phận Tư pháp - Hộ tịch',
        role: 'optional',
        attendanceStatus: 'not_joined',
        note: 'Vắng có lý do trực tiếp công dân'
      }
    ],
    summary: {
      totalAttendees: 4,
      presentAttendees: 3,
      lateAttendees: 1,
      earlyLeaveAttendees: 1,
      absentAttendees: 1,
      attendanceRate: 75,
      averageDurationMinutes: 108
    },
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-04T10:00:00Z'
  };

  it('xây dựng cấu trúc dữ liệu biên bản họp chuẩn Nghị định 30/2020/NĐ-CP (buildMeetingReportData)', () => {
    const report = meetingReportService.buildMeetingReportData(
      mockMeeting,
      'Ủy Ban Nhân Dân Phường Bến Nghé'
    );

    expect(report.title).toBe('Họp Giao Ban Công Tác Cải Cách Hành Chính Tuần 45');
    expect(report.orgName).toBe('Ủy Ban Nhân Dân Phường Bến Nghé');
    expect(report.roomName).toBe('Hội trường Thống Nhất (Tầng 2)');
    expect(report.hostName).toContain('Nguyễn Văn An');
    expect(report.closedBy).toContain('Lê Thị Thảo');

    // Kiểm tra chỉ số chuyên cần
    expect(report.summary.totalAttendees).toBe(4);
    expect(report.summary.presentAttendees).toBe(3);
    expect(report.summary.lateAttendees).toBe(1);
    expect(report.summary.earlyLeaveAttendees).toBe(1);
    expect(report.summary.absentAttendees).toBe(1);
    expect(report.summary.attendanceRate).toBe(75);
    expect(report.summary.averageDurationMinutes).toBe(108);

    // Kiểm tra danh sách đại biểu
    expect(report.attendees).toHaveLength(4);
    expect(report.attendees[0].fullName).toBe('Nguyễn Văn An');
    expect(report.attendees[0].conclusion).toBe('Có mặt trọn vẹn');
    expect(report.attendees[1].fullName).toBe('Trần Thị Mai');
    expect(report.attendees[1].conclusion).toBe('Đến muộn');
    expect(report.attendees[2].fullName).toBe('Lê Văn Hùng');
    expect(report.attendees[2].conclusion).toBe('Về sớm');
    expect(report.attendees[3].fullName).toBe('Hoàng Văn Đức');
    expect(report.attendees[3].conclusion).toBe('Vắng mặt');

    // Kiểm tra con dấu số Finviet (Digital Seal)
    expect(report.digitalSeal.serialNumber).toContain('FINVIET-DS-MTG-TEST-01');
    expect(report.digitalSeal.hash).toMatch(/^FV-ATT-MTG-TEST-01-[0-9A-F]+$/);
    expect(report.digitalSeal.issuer).toContain('Finviet');
  });

  it('xuất file Excel (.csv) có UTF-8 BOM và đầy đủ cấu trúc văn bản hành chính (generateExcelCSV)', () => {
    const csv = meetingReportService.generateExcelCSV(mockMeeting, 'UBND Phường Bến Nghé');

    // Kiểm tra tiền tố UTF-8 BOM (\uFEFF)
    expect(csv.startsWith('\uFEFF')).toBe(true);

    // Kiểm tra tiêu đề quốc hiệu & biên bản
    expect(csv).toContain('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM');
    expect(csv).toContain('Độc lập - Tự do - Hạnh phúc');
    expect(csv).toContain('BIÊN BẢN ĐIỂM DANH & BÁO CÁO CHUYÊN CẦN CUỘC HỌP');

    // Kiểm tra dữ liệu tổng hợp
    expect(csv).toContain('TỔNG HỢP CHUYÊN CẦN THAM DỰ');
    expect(csv).toContain('75%');
    expect(csv).toContain('108 phút');

    // Kiểm tra dữ liệu đại biểu
    expect(csv).toContain('"Nguyễn Văn An"');
    expect(csv).toContain('"Trần Thị Mai"');
    expect(csv).toContain('"Lê Văn Hùng"');
    expect(csv).toContain('"Hoàng Văn Đức"');

    // Kiểm tra dấu niêm phong số
    expect(csv).toContain('CHỨNG THỰC DỮ LIỆU ĐIỆN TỬ BẤT BIẾN');
    expect(csv).toContain('FV-ATT-MTG-TEST-01');
  });

  it('gọi lệnh in printMeetingReport an toàn khi window.print khả dụng', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    meetingReportService.printMeetingReport();
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
