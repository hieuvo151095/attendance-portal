import { describe, it, expect, vi } from 'vitest';
import { generateExcelBuffer, downloadExcelFile, ExcelSheetDefinition } from '../utils/excelExport';
import { meetingReportService } from '../services/report';
import { Meeting } from '../types/meeting';

describe('Excel OpenXML (.xlsx) Generator', () => {
  it('tạo file Excel binary (.xlsx) chuẩn định dạng ZIP PK', () => {
    const sheet: ExcelSheetDefinition = {
      name: 'Test Sheet',
      columns: [{ width: 10 }, { width: 30 }],
      rows: [
        {
          cells: [
            { value: 'Tiêu đề báo cáo tiếng Việt có dấu', style: 'title', colSpan: 2 }
          ]
        },
        {
          height: 25,
          cells: [
            { value: 'STT', style: 'header' },
            { value: 'Họ và tên', style: 'header' }
          ]
        },
        {
          cells: [
            { value: 1, style: 'borderCenter' },
            { value: 'Nguyễn Văn An', style: 'boldBorderLeft' }
          ]
        }
      ]
    };

    const buffer = generateExcelBuffer(sheet);
    expect(buffer).toBeInstanceOf(Uint8Array);
    expect(buffer.length).toBeGreaterThan(1000);

    // ZIP magic number: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4B);
    expect(buffer[2]).toBe(0x03);
    expect(buffer[3]).toBe(0x04);
  });

  it('downloadExcelFile gọi URL.createObjectURL và tạo thẻ a download file .xlsx', () => {
    vi.useFakeTimers();
    const sheet: ExcelSheetDefinition = {
      name: 'Download Test',
      rows: [
        { cells: [{ value: 'Test' }] }
      ]
    };

    const createObjectURLMock = vi.fn().mockReturnValue('blob:test-url');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const clickSpy = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      setAttribute: vi.fn(),
      click: clickSpy,
      style: {}
    } as unknown as HTMLElement);

    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    downloadExcelFile(sheet, 'Test_Report.xlsx');
    vi.advanceTimersByTime(1000);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    vi.useRealTimers();
  });

  it('exportMeetingToExcel xuất biên bản cuộc họp ra file .xlsx với cấu trúc bảng hoàn chỉnh', () => {
    const mockMeeting: Meeting = {
      id: 'mtg-test-01',
      tenantId: 'ubnd-ben-nghe',
      title: 'Họp giao ban tuần đầu tháng 11',
      roomName: 'Hội trường 1 - UBND Phường',
      startTime: '2026-11-06T08:00:00Z',
      endTime: '2026-11-06T09:30:00Z',
      status: 'completed',
      hostName: 'Chủ tịch UBND Phường Bến Nghé',
      description: 'Đánh giá tiến độ công tác chuyên môn',
      attendees: [
        {
          employeeId: 'emp-ubnd-01',
          employeeCode: 'UBND-001',
          fullName: 'Đ/c Nguyễn Văn An',
          position: 'Chủ tịch UBND Phường',
          departmentId: 'dept-ubnd-01',
          departmentName: 'Văn phòng HĐND & UBND',
          role: 'required',
          attendanceStatus: 'joined',
          checkInTime: '2026-11-06T08:00:00Z'
        }
      ],
      createdAt: '2026-11-01T08:00:00Z',
      updatedAt: '2026-11-06T10:00:00Z'
    };

    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-meeting-report');
    window.URL.revokeObjectURL = vi.fn();

    expect(() => {
      meetingReportService.exportMeetingToExcel(mockMeeting, 'UBND Phường Bến Nghé');
    }).not.toThrow();
  });
});
