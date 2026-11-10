import { Meeting } from '../types/meeting';
import { downloadExcelFile, ExcelSheetDefinition } from '../utils/excelExport';

export interface MeetingReportData {
  meetingId: string;
  title: string;
  roomName: string;
  hostName: string;
  closedBy: string;
  orgName: string;
  scheduledTimeText: string;
  closedTimeText: string;
  summary: {
    totalAttendees: number;
    presentAttendees: number;
    lateAttendees: number;
    earlyLeaveAttendees: number;
    absentAttendees: number;
    attendanceRate: number;
    averageDurationMinutes: number;
  };
  attendees: Array<{
    stt: number;
    employeeCode: string;
    fullName: string;
    position: string;
    departmentName: string;
    role: string;
    checkInTime: string;
    checkInStatus: string;
    checkInMethod: string;
    checkOutTime: string;
    checkOutStatus: string;
    durationMinutes: number;
    conclusion: string;
  }>;
  digitalSeal: {
    serialNumber: string;
    hash: string;
    signedAt: string;
    issuer: string;
  };
}

class MeetingReportService {
  /**
   * Tạo mã băm xác thực dữ liệu bất biến (Digital Hash)
   */
  private generateDigitalHash(meeting: Meeting): string {
    const raw = `${meeting.id}:${meeting.closedAt}:${meeting.attendees.length}:${meeting.updatedAt}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `FV-ATT-${meeting.id.toUpperCase()}-${hex.toUpperCase()}`;
  }

  /**
   * Tổng hợp dữ liệu báo cáo chuyên cần từ thực thể cuộc họp
   */
  public buildMeetingReportData(meeting: Meeting, orgName: string = 'Ủy Ban Nhân Dân Phường Bến Nghé'): MeetingReportData {
    const formatTime = (iso?: string) => {
      if (!iso) return '--:--';
      try {
        const d = new Date(iso);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      } catch {
        return '--:--';
      }
    };

    const formatDate = (iso?: string) => {
      if (!iso) return '';
      try {
        const d = new Date(iso);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch {
        return '';
      }
    };

    const scheduledTimeText = `${formatTime(meeting.startTime)} - ${formatTime(meeting.endTime)} ngày ${formatDate(meeting.startTime)}`;

    // Thời điểm chốt biên bản: 1 giờ sau khi sự kiện kết thúc
    let closedTimeDate: Date | null = null;
    if (meeting.status === 'completed' || meeting.closedAt) {
      if (meeting.endTime) {
        const endD = new Date(meeting.endTime);
        if (!isNaN(endD.getTime())) {
          closedTimeDate = new Date(endD.getTime() + 60 * 60 * 1000);
        }
      }
      if (!closedTimeDate && meeting.closedAt) {
        closedTimeDate = new Date(meeting.closedAt);
      }
    }

    const closedTimeText = closedTimeDate
      ? `${formatTime(closedTimeDate.toISOString())} ngày ${formatDate(closedTimeDate.toISOString())}`
      : meeting.status === 'in_progress'
      ? 'Đang diễn ra'
      : 'Chưa diễn ra';

    const totalAttendees = meeting.attendees.length;
    const attendedList = meeting.attendees.filter(
      (a) => a.attendanceStatus === 'joined' || a.attendanceStatus === 'left'
    );
    const presentAttendees = attendedList.length;
    const lateAttendees = meeting.attendees.filter((a) => a.isLate).length;
    const earlyLeaveAttendees = meeting.attendees.filter((a) => a.isEarlyLeave).length;
    const absentAttendees = totalAttendees - presentAttendees;
    const attendanceRate = totalAttendees > 0 ? Math.round((presentAttendees / totalAttendees) * 100) : 0;
    const totalDuration = attendedList.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
    const averageDurationMinutes = presentAttendees > 0 ? Math.round(totalDuration / presentAttendees) : 0;

    const summary = meeting.summary || {
      totalAttendees,
      presentAttendees,
      lateAttendees,
      earlyLeaveAttendees,
      absentAttendees,
      attendanceRate,
      averageDurationMinutes
    };

    const attendees = meeting.attendees.map((att, idx) => {
      let conclusion = 'Vắng mặt';
      if (att.attendanceStatus === 'left' || att.attendanceStatus === 'joined') {
        if (att.isLate && att.isEarlyLeave) {
          conclusion = 'Muộn & Về sớm';
        } else if (att.isLate) {
          conclusion = 'Đến muộn';
        } else if (att.isEarlyLeave) {
          conclusion = 'Về sớm';
        } else {
          conclusion = 'Có mặt trọn vẹn';
        }
      }

      return {
        stt: idx + 1,
        employeeCode: att.employeeCode,
        fullName: att.fullName,
        position: att.position,
        departmentName: att.departmentName || 'Chưa phân bổ',
        role: att.role === 'required' ? 'Bắt buộc' : att.isAdHoc ? 'Khách mời' : 'Tùy chọn',
        checkInTime: formatTime(att.checkInTime),
        checkInStatus: att.checkInTime
          ? att.isLate
            ? `Đi muộn (+${att.lateMinutes}p)`
            : 'Đúng giờ'
          : 'Không quét',
        checkInMethod: att.checkInMethod === 'face_id' ? 'Face ID' : att.checkInMethod === 'card' ? 'Thẻ RFID' : att.checkInMethod === 'manual' ? 'Thủ công' : '--',
        checkOutTime: formatTime(att.checkOutTime),
        checkOutStatus: att.checkOutTime
          ? att.isEarlyLeave
            ? `Về sớm (-${att.earlyLeaveMinutes}p)`
            : 'Đúng giờ'
          : 'Chưa quét ra',
        durationMinutes: att.durationMinutes || 0,
        conclusion
      };
    });

    const hash = this.generateDigitalHash(meeting);

    return {
      meetingId: meeting.id,
      title: meeting.title,
      roomName: meeting.roomName,
      hostName: meeting.hostName || 'Chưa cập nhật',
      closedBy: meeting.closedBy || 'Thư ký cuộc họp',
      orgName,
      scheduledTimeText,
      closedTimeText,
      summary,
      attendees,
      digitalSeal: {
        serialNumber: `FINVIET-DS-${meeting.id.toUpperCase()}`,
        hash,
        signedAt: closedTimeDate ? closedTimeDate.toISOString() : (meeting.closedAt || new Date().toISOString()),
        issuer: 'Finviet Attendance Portal · Chứng thư số bảo mật'
      }
    };
  }

  /**
   * Tạo nội dung CSV chuẩn Excel tiếng Việt (kèm UTF-8 BOM)
   */
  public generateExcelCSV(meeting: Meeting, orgName: string = 'Ủy Ban Nhân Dân Phường Bến Nghé'): string {
    const report = this.buildMeetingReportData(meeting, orgName);

    const escapeCsv = (val: string | number) => {
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const lines: string[] = [];

    // Header Quốc hiệu & Tiêu đề
    lines.push([escapeCsv('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM')].join(','));
    lines.push([escapeCsv('Độc lập - Tự do - Hạnh phúc')].join(','));
    lines.push('');
    lines.push([escapeCsv('ĐƠN VỊ TỔ CHỨC:'), escapeCsv(report.orgName)].join(','));
    lines.push([escapeCsv('BIÊN BẢN ĐIỂM DANH & BÁO CÁO CHUYÊN CẦN CUỘC HỌP')].join(','));
    lines.push('');

    // Thông tin cuộc họp
    lines.push([escapeCsv('Tiêu đề cuộc họp:'), escapeCsv(report.title)].join(','));
    lines.push([escapeCsv('Phòng họp / Địa điểm:'), escapeCsv(report.roomName)].join(','));
    lines.push([escapeCsv('Thời gian dự kiến:'), escapeCsv(report.scheduledTimeText)].join(','));
    lines.push([escapeCsv('Thời điểm chốt biên bản:'), escapeCsv(report.closedTimeText)].join(','));
    lines.push([escapeCsv('Người chủ trì:'), escapeCsv(report.hostName)].join(','));
    lines.push([escapeCsv('Thư ký lập biên bản:'), escapeCsv(report.closedBy)].join(','));
    lines.push('');

    // Tóm tắt số liệu
    lines.push([escapeCsv('TỔNG HỢP CHUYÊN CẦN THAM DỰ')].join(','));
    lines.push([
      escapeCsv('Tổng đại biểu triệu tập'),
      escapeCsv('Có mặt'),
      escapeCsv('Đến muộn'),
      escapeCsv('Về sớm'),
      escapeCsv('Vắng mặt'),
      escapeCsv('Tỷ lệ chuyên cần (%)'),
      escapeCsv('Thời lượng TB (phút)')
    ].join(','));
    lines.push([
      escapeCsv(report.summary.totalAttendees),
      escapeCsv(report.summary.presentAttendees),
      escapeCsv(report.summary.lateAttendees),
      escapeCsv(report.summary.earlyLeaveAttendees),
      escapeCsv(report.summary.absentAttendees),
      escapeCsv(`${report.summary.attendanceRate}%`),
      escapeCsv(`${report.summary.averageDurationMinutes} phút`)
    ].join(','));
    lines.push('');

    // Bảng danh sách chi tiết
    lines.push([escapeCsv('DANH SÁCH CHI TIẾT ĐẠI BIỂU & ĐỐI SOÁT ĐIỂM DANH')].join(','));
    lines.push([
      escapeCsv('STT'),
      escapeCsv('Mã cán bộ'),
      escapeCsv('Họ và tên'),
      escapeCsv('Chức vụ'),
      escapeCsv('Phòng ban / Đơn vị'),
      escapeCsv('Vai trò triệu tập'),
      escapeCsv('Giờ vào (Check-in)'),
      escapeCsv('Trạng thái vào'),
      escapeCsv('Phương thức vào'),
      escapeCsv('Giờ ra (Check-out)'),
      escapeCsv('Trạng thái ra'),
      escapeCsv('Thời lượng thực tế (phút)'),
      escapeCsv('Đánh giá chuyên cần')
    ].join(','));

    report.attendees.forEach((att) => {
      lines.push([
        escapeCsv(att.stt),
        escapeCsv(att.employeeCode),
        escapeCsv(att.fullName),
        escapeCsv(att.position),
        escapeCsv(att.departmentName),
        escapeCsv(att.role),
        escapeCsv(att.checkInTime),
        escapeCsv(att.checkInStatus),
        escapeCsv(att.checkInMethod),
        escapeCsv(att.checkOutTime),
        escapeCsv(att.checkOutStatus),
        escapeCsv(att.durationMinutes),
        escapeCsv(att.conclusion)
      ].join(','));
    });

    lines.push('');
    lines.push([escapeCsv('CHỨNG THỰC DỮ LIỆU ĐIỆN TỬ BẤT BIẾN')].join(','));
    lines.push([escapeCsv('Mã băm toàn vẹn (Hash):'), escapeCsv(report.digitalSeal.hash)].join(','));
    lines.push([escapeCsv('Số sê-ri chứng thư:'), escapeCsv(report.digitalSeal.serialNumber)].join(','));
    lines.push([escapeCsv('Hệ thống chứng thực:'), escapeCsv(report.digitalSeal.issuer)].join(','));
    lines.push([escapeCsv('Thời điểm ký số:'), escapeCsv(report.digitalSeal.signedAt)].join(','));

    // UTF-8 BOM để Excel hiển thị tiếng Việt có dấu chuẩn 100%
    return '\uFEFF' + lines.join('\r\n');
  }

  /**
   * Tải xuống biên bản chuyên cần cuộc họp định dạng file Excel (.xlsx) chuẩn OpenXML
   */
  public exportMeetingToExcel(meeting: Meeting, orgName?: string): void {
    const report = this.buildMeetingReportData(meeting, orgName);
    const safeTitle = meeting.title.replace(/[^a-zA-Z0-9À-ỹ\s]/g, '').trim().replace(/\s+/g, '_');

    const sheet: ExcelSheetDefinition = {
      name: 'Biên bản cuộc họp',
      columns: [
        { width: 8 },
        { width: 14 },
        { width: 26 },
        { width: 20 },
        { width: 26 },
        { width: 16 },
        { width: 14 },
        { width: 16 },
        { width: 18 },
        { width: 14 },
        { width: 16 },
        { width: 16 },
        { width: 18 }
      ],
      rows: [
        { cells: [{ value: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', style: 'subtitle', colSpan: 13 }] },
        { cells: [{ value: 'Độc lập - Tự do - Hạnh phúc', style: 'subtitle', colSpan: 13 }] },
        { cells: [] },
        { height: 28, cells: [{ value: 'BIÊN BẢN ĐIỂM DANH & BÁO CÁO CHUYÊN CẦN CUỘC HỌP', style: 'title', colSpan: 13 }] },
        { cells: [{ value: `Đơn vị: ${report.orgName}  |  Phòng họp: ${report.roomName}`, style: 'subtitle', colSpan: 13 }] },
        { cells: [{ value: `Tiêu đề cuộc họp: ${report.title}`, style: 'subtitle', colSpan: 13 }] },
        { cells: [{ value: `Thời gian: ${report.scheduledTimeText}  |  Chốt biên bản: ${report.closedTimeText}`, style: 'subtitle', colSpan: 13 }] },
        { cells: [{ value: `Chủ trì: ${report.hostName}  |  Thư ký: ${report.closedBy}`, style: 'subtitle', colSpan: 13 }] },
        { cells: [] },
        { height: 24, cells: [{ value: '1. TỔNG HỢP CHUYÊN CẦN THAM DỰ', style: 'section', colSpan: 13 }] },
        {
          height: 24,
          cells: [
            { value: 'Tổng triệu tập', style: 'header', colSpan: 2 },
            { value: 'Có mặt', style: 'header', colSpan: 2 },
            { value: 'Đến muộn', style: 'header', colSpan: 2 },
            { value: 'Về sớm', style: 'header', colSpan: 2 },
            { value: 'Vắng mặt', style: 'header', colSpan: 2 },
            { value: 'Tỷ lệ chuyên cần', style: 'header', colSpan: 2 },
            { value: 'Thời lượng TB', style: 'header' }
          ]
        },
        {
          cells: [
            { value: report.summary.totalAttendees, style: 'boldBorderCenter', colSpan: 2 },
            { value: report.summary.presentAttendees, style: 'boldBorderCenter', colSpan: 2 },
            { value: report.summary.lateAttendees, style: 'borderCenter', colSpan: 2 },
            { value: report.summary.earlyLeaveAttendees, style: 'borderCenter', colSpan: 2 },
            { value: report.summary.absentAttendees, style: 'borderCenter', colSpan: 2 },
            { value: `${report.summary.attendanceRate}%`, style: report.summary.attendanceRate >= 90 ? 'badgeSuccess' : 'badgeWarning', colSpan: 2 },
            { value: `${report.summary.averageDurationMinutes} phút`, style: 'borderCenter' }
          ]
        },
        { cells: [] },
        { height: 24, cells: [{ value: '2. DANH SÁCH CHI TIẾT ĐẠI BIỂU & ĐỐI SOÁT ĐIỂM DANH', style: 'section', colSpan: 13 }] },
        {
          height: 26,
          cells: [
            { value: 'STT', style: 'header' },
            { value: 'Mã cán bộ', style: 'header' },
            { value: 'Họ và tên', style: 'header' },
            { value: 'Chức vụ', style: 'header' },
            { value: 'Phòng ban / Đơn vị', style: 'header' },
            { value: 'Vai trò', style: 'header' },
            { value: 'Giờ vào', style: 'header' },
            { value: 'Trạng thái vào', style: 'header' },
            { value: 'Phương thức', style: 'header' },
            { value: 'Giờ ra', style: 'header' },
            { value: 'Trạng thái ra', style: 'header' },
            { value: 'Thời lượng (phút)', style: 'header' },
            { value: 'Đánh giá', style: 'header' }
          ]
        },
        ...report.attendees.map((att) => {
          const isLate = att.checkInStatus.includes('Đi muộn');
          const isAbsent = att.checkInTime === '--:--';
          const inStyle = isAbsent ? ('badgeDanger' as const) : isLate ? ('badgeWarning' as const) : ('badgeSuccess' as const);

          const isGoodConclusion = att.conclusion.includes('Đầy đủ') || att.conclusion.includes('Tốt');
          const isCautionConclusion = att.conclusion.includes('Thiếu') || att.conclusion.includes('Muộn');
          const concStyle = isGoodConclusion ? ('badgeSuccess' as const) : isCautionConclusion ? ('badgeWarning' as const) : ('badgeDanger' as const);

          return {
            height: 21,
            cells: [
              { value: att.stt, style: 'borderCenter' as const },
              { value: att.employeeCode, style: 'borderCenter' as const },
              { value: att.fullName, style: 'boldBorderLeft' as const },
              { value: att.position, style: 'borderLeft' as const },
              { value: att.departmentName, style: 'borderLeft' as const },
              { value: att.role, style: 'borderCenter' as const },
              { value: att.checkInTime, style: 'borderCenter' as const },
              { value: att.checkInStatus, style: inStyle },
              { value: att.checkInMethod, style: 'borderCenter' as const },
              { value: att.checkOutTime, style: 'borderCenter' as const },
              { value: att.checkOutStatus, style: 'borderCenter' as const },
              { value: att.durationMinutes, style: 'borderRight' as const },
              { value: att.conclusion, style: concStyle }
            ]
          };
        }),
        { cells: [] },
        { height: 24, cells: [{ value: '3. CHỨNG THỰC DỮ LIỆU ĐIỆN TỬ BẤT BIẾN', style: 'section', colSpan: 13 }] },
        { cells: [{ value: 'Mã băm toàn vẹn (SHA-256):', style: 'boldBorderLeft', colSpan: 4 }, { value: report.digitalSeal.hash, style: 'borderLeft', colSpan: 9 }] },
        { cells: [{ value: 'Số sê-ri chứng thư số:', style: 'boldBorderLeft', colSpan: 4 }, { value: report.digitalSeal.serialNumber, style: 'borderLeft', colSpan: 9 }] },
        { cells: [{ value: 'Cơ quan chứng thực:', style: 'boldBorderLeft', colSpan: 4 }, { value: report.digitalSeal.issuer, style: 'borderLeft', colSpan: 9 }] },
        { cells: [{ value: 'Thời điểm ký số:', style: 'boldBorderLeft', colSpan: 4 }, { value: report.digitalSeal.signedAt, style: 'borderLeft', colSpan: 9 }] }
      ]
    };

    downloadExcelFile(sheet, `Bien_ban_chuyen_can_${safeTitle}.xlsx`);
  }

  /**
   * Xuất báo cáo tổng hợp danh mục các cuộc họp đã kết thúc trong kỳ ra file Excel (.xlsx) chuẩn OpenXML
   */
  public exportConcludedMeetingsSummaryToExcel(
    meetings: Meeting[],
    orgName: string = 'Ủy Ban Nhân Dân Phường Bến Nghé',
    periodLabel: string = 'Tất cả các kỳ'
  ): void {
    const sheet: ExcelSheetDefinition = {
      name: 'Tổng hợp kỳ họp',
      columns: [
        { width: 8 },
        { width: 34 },
        { width: 22 },
        { width: 24 },
        { width: 22 },
        { width: 20 },
        { width: 16 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 18 }
      ],
      rows: [
        { cells: [{ value: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', style: 'subtitle', colSpan: 11 }] },
        { cells: [{ value: 'Độc lập - Tự do - Hạnh phúc', style: 'subtitle', colSpan: 11 }] },
        { cells: [] },
        { height: 28, cells: [{ value: 'BÁO CÁO TỔNG HỢP DANH MỤC CUỘC HỌP ĐÃ KẾT THÚC & CHUYÊN CẦN', style: 'title', colSpan: 11 }] },
        { cells: [{ value: `Đơn vị: ${orgName}  |  Kỳ tổng hợp: ${periodLabel}`, style: 'subtitle', colSpan: 11 }] },
        { cells: [{ value: `Thời điểm xuất: ${new Date().toLocaleString('vi-VN')}`, style: 'subtitle', colSpan: 11 }] },
        { cells: [] },
        {
          height: 26,
          cells: [
            { value: 'STT', style: 'header' },
            { value: 'Tên cuộc họp', style: 'header' },
            { value: 'Người chủ trì', style: 'header' },
            { value: 'Phòng họp / Địa điểm', style: 'header' },
            { value: 'Thời gian diễn ra', style: 'header' },
            { value: 'Thời điểm kết thúc', style: 'header' },
            { value: 'Triệu tập', style: 'header' },
            { value: 'Có mặt', style: 'header' },
            { value: 'Đến muộn', style: 'header' },
            { value: 'Vắng mặt', style: 'header' },
            { value: 'Tỷ lệ chuyên cần', style: 'header' }
          ]
        },
        ...meetings.map((m, idx) => {
          const rep = this.buildMeetingReportData(m, orgName);
          const attRate = rep.summary.attendanceRate;
          return {
            height: 21,
            cells: [
              { value: idx + 1, style: 'borderCenter' as const },
              { value: m.title, style: 'boldBorderLeft' as const },
              { value: m.hostName || '--', style: 'borderLeft' as const },
              { value: m.roomName, style: 'borderLeft' as const },
              { value: rep.scheduledTimeText, style: 'borderCenter' as const },
              { value: rep.closedTimeText, style: 'borderCenter' as const },
              { value: rep.summary.totalAttendees, style: 'borderRight' as const },
              { value: rep.summary.presentAttendees, style: 'borderRight' as const },
              { value: rep.summary.lateAttendees, style: 'borderRight' as const },
              { value: rep.summary.absentAttendees, style: 'borderRight' as const },
              { value: `${attRate}%`, style: attRate >= 90 ? ('badgeSuccess' as const) : ('badgeWarning' as const) }
            ]
          };
        })
      ]
    };

    downloadExcelFile(sheet, `Bao_cao_tong_hop_cuoc_hop_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  /**
   * Kích hoạt in / lưu PDF trực tiếp từ trình duyệt
   */
  public printMeetingReport(): void {
    if (typeof window !== 'undefined') {
      document.body.classList.add('is-printing-meeting-report');
      const handleAfter = () => {
        document.body.classList.remove('is-printing-meeting-report');
        window.removeEventListener('afterprint', handleAfter);
      };
      window.addEventListener('afterprint', handleAfter);
      setTimeout(() => {
        document.body.classList.remove('is-printing-meeting-report');
      }, 5000);

      if (window.print) {
        window.print();
      }
    }
  }
}

export const meetingReportService = new MeetingReportService();
