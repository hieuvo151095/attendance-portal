import React, { useState } from 'react';
import {
  PopupModal,
  Button
} from '../../design-system';
import { Meeting } from '../../types/meeting';
import { meetingReportService, MeetingReportData } from '../../services/report';

export interface MeetingReportModalProps {
  meeting: Meeting;
  tenantOrgName?: string;
  onClose: () => void;
}

export const MeetingReportModal: React.FC<MeetingReportModalProps> = ({
  meeting,
  tenantOrgName = 'Ủy Ban Nhân Dân Phường Bến Nghé',
  onClose
}) => {
  const [filter, setFilter] = useState<'all' | 'present' | 'late' | 'early_leave' | 'absent'>('all');

  const reportData: MeetingReportData = meetingReportService.buildMeetingReportData(
    meeting,
    tenantOrgName
  );

  const filteredAttendees = reportData.attendees.filter((att) => {
    if (filter === 'all') return true;
    if (filter === 'present') return att.checkInTime !== '--:--';
    if (filter === 'late') return att.checkInStatus.includes('Đi muộn');
    if (filter === 'early_leave') return att.checkOutStatus.includes('Về sớm');
    if (filter === 'absent') return att.checkInTime === '--:--';
    return true;
  });

  const handleExportExcel = () => {
    meetingReportService.exportMeetingToExcel(meeting, tenantOrgName);
  };

  const handlePrint = () => {
    meetingReportService.printMeetingReport();
  };

  // Ngày lập biên bản: 1 tiếng sau khi kết thúc cuộc họp
  const closedDate = meeting.endTime
    ? new Date(new Date(meeting.endTime).getTime() + 60 * 60 * 1000)
    : (meeting.closedAt ? new Date(meeting.closedAt) : new Date());
  const day = closedDate.getDate();
  const month = closedDate.getMonth() + 1;
  const year = closedDate.getFullYear();

  return (
    <PopupModal
      open={true}
      onClose={onClose}
      width={1020}
      title="Biên bản cuộc họp & Báo cáo chuyên cần"
      description="Tự động tổng hợp dữ liệu chuyên cần và hỗ trợ xuất file PDF / Excel."
      className="meeting-report-modal"
      footer={null}
      secondaryAction={null}
    >
      {/* 1. Modal Interactive Controls Toolbar (Hidden when printing) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius-8)',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="body-xs-bold" style={{ color: 'var(--text-subtle)' }}>
            Lọc hiển thị đại biểu:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setFilter('all')}
              style={{
                border: 'none',
                background: filter === 'all' ? 'var(--eco-blue-strong)' : '#ffffff',
                color: filter === 'all' ? '#ffffff' : 'var(--text-body)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-4)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              Tất cả ({reportData.summary.totalAttendees})
            </button>
            <button
              type="button"
              onClick={() => setFilter('present')}
              style={{
                border: 'none',
                background: filter === 'present' ? '#15803d' : '#ffffff',
                color: filter === 'present' ? '#ffffff' : '#15803d',
                padding: '4px 10px',
                borderRadius: 'var(--radius-4)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              Có mặt ({reportData.summary.presentAttendees})
            </button>
            <button
              type="button"
              onClick={() => setFilter('late')}
              style={{
                border: 'none',
                background: filter === 'late' ? '#b45309' : '#ffffff',
                color: filter === 'late' ? '#ffffff' : '#b45309',
                padding: '4px 10px',
                borderRadius: 'var(--radius-4)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              Đi muộn ({reportData.summary.lateAttendees})
            </button>
            <button
              type="button"
              onClick={() => setFilter('early_leave')}
              style={{
                border: 'none',
                background: filter === 'early_leave' ? '#d97706' : '#ffffff',
                color: filter === 'early_leave' ? '#ffffff' : '#d97706',
                padding: '4px 10px',
                borderRadius: 'var(--radius-4)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              Về sớm ({reportData.summary.earlyLeaveAttendees})
            </button>
            <button
              type="button"
              onClick={() => setFilter('absent')}
              style={{
                border: 'none',
                background: filter === 'absent' ? '#b91c1c' : '#ffffff',
                color: filter === 'absent' ? '#ffffff' : '#b91c1c',
                padding: '4px 10px',
                borderRadius: 'var(--radius-4)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              Vắng ({reportData.summary.absentAttendees})
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            icon="file-excel"
            onClick={handleExportExcel}
          >
            Xuất Excel (.csv)
          </Button>
          <Button
            variant="primary"
            icon="print"
            onClick={handlePrint}
          >
            In / Lưu PDF
          </Button>
        </div>
      </div>

      {/* 2. Printable Administrative Document (Decree 30/2020/NĐ-CP Form) */}
      <div
        id="printable-meeting-report"
        className="meeting-report-sheet"
        style={{
          backgroundColor: '#ffffff',
          color: '#111827',
          padding: '36px 40px',
          borderRadius: 'var(--radius-8)',
          border: '1px solid #d1d5db',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          fontFamily: 'var(--font-sans)',
          lineHeight: 1.5
        }}
      >
        {/* Header: Quốc hiệu & Đơn vị chủ quản */}
        <div
          className="meeting-report-doc-header"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '28px',
            alignItems: 'start'
          }}
        >
          {/* Cột trái: Đơn vị chủ quản & Số hiệu văn bản */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {reportData.orgName}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginTop: '2px' }}>
              HỆ THỐNG ĐIỂM DANH ĐIỆN TỬ
            </div>
            <div
              style={{
                width: '60px',
                height: '1px',
                backgroundColor: '#111827',
                margin: '6px auto'
              }}
            />
            <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#4b5563', marginTop: '4px' }}>
              Số: {meeting.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}/BB-UBND
            </div>
          </div>

          {/* Cột phải: Quốc hiệu, Tiêu ngữ */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div
              style={{
                width: '120px',
                height: '1px',
                backgroundColor: '#111827',
                margin: '6px auto'
              }}
            />
            <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#4b5563', marginTop: '4px' }}>
              Bến Nghé, ngày {day} tháng {month} năm {year}
            </div>
          </div>
        </div>

        {/* Tiêu đề chính của biên bản */}
        <div className="meeting-report-doc-title" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#0f172a',
              margin: '0 0 8px 0',
              letterSpacing: '0.03em'
            }}
          >
            BIÊN BẢN ĐIỂM DANH & BÁO CÁO CHUYÊN CẦN CUỘC HỌP
          </h2>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--eco-blue-strong)' }}>
            Về việc: {reportData.title}
          </div>
        </div>

        {/* PHẦN I: THÔNG TIN CHUNG */}
        <div className="meeting-report-doc-section-1" style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#1e3a8a',
              borderBottom: '2px solid #93c5fd',
              paddingBottom: '4px',
              marginBottom: '12px'
            }}
          >
            I. THÔNG TIN CHUNG CUỘC HỌP
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px 24px',
              fontSize: '13px'
            }}
          >
            <div>
              <span style={{ color: '#4b5563' }}>• Phòng họp / Địa điểm: </span>
              <b>{reportData.roomName}</b>
            </div>
            <div>
              <span style={{ color: '#4b5563' }}>• Thời gian dự kiến: </span>
              <b>{reportData.scheduledTimeText}</b>
            </div>
            <div>
              <span style={{ color: '#4b5563' }}>• Người chủ trì: </span>
              <b>{reportData.hostName}</b>
            </div>
            <div>
              <span style={{ color: '#4b5563' }}>• Thư ký / Người chốt: </span>
              <b>{reportData.closedBy}</b>
            </div>
            <div>
              <span style={{ color: '#4b5563' }}>• Thời điểm chốt biên bản: </span>
              <b>{reportData.closedTimeText}</b>
            </div>
            <div>
              <span style={{ color: '#4b5563' }}>• Phương thức kiểm soát: </span>
              <b>Hikvision AI Camera (Face ID) & Thẻ RFID</b>
            </div>
          </div>
        </div>

        {/* PHẦN II: TỔNG HỢP KẾT QUẢ ĐIỂM DANH */}
        <div className="meeting-report-doc-section-2" style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#1e3a8a',
              borderBottom: '2px solid #93c5fd',
              paddingBottom: '4px',
              marginBottom: '14px'
            }}
          >
            II. TỔNG HỢP CHỈ SỐ CHUYÊN CẦN
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '10px',
              marginBottom: '12px'
            }}
          >
            <div
              style={{
                padding: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748b' }}>Tổng triệu tập</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {reportData.summary.totalAttendees}
              </div>
            </div>

            <div
              style={{
                padding: '10px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', color: '#166534' }}>Có mặt (% đạt)</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                {reportData.summary.presentAttendees}{' '}
                <span style={{ fontSize: '12px', fontWeight: 600 }}>({reportData.summary.attendanceRate}%)</span>
              </div>
            </div>

            <div
              style={{
                padding: '10px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', color: '#92400e' }}>Đến muộn</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                {reportData.summary.lateAttendees}
              </div>
            </div>

            <div
              style={{
                padding: '10px',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '6px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', color: '#9a3412' }}>Về sớm</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#c2410c', marginTop: '2px' }}>
                {reportData.summary.earlyLeaveAttendees}
              </div>
            </div>

            <div
              style={{
                padding: '10px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', color: '#991b1b' }}>Vắng mặt</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#b91c1c', marginTop: '2px' }}>
                {reportData.summary.absentAttendees}
              </div>
            </div>

            <div
              style={{
                padding: '10px',
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: '6px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', color: '#5b21b6' }}>Thời lượng TB</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#6d28d9', marginTop: '2px' }}>
                {reportData.summary.averageDurationMinutes} <span style={{ fontSize: '12px' }}>phút</span>
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN III: BẢNG DANH SÁCH CHI TIẾT */}
        <div className="meeting-report-doc-section-3" style={{ marginBottom: '28px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#1e3a8a',
              borderBottom: '2px solid #93c5fd',
              paddingBottom: '4px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>III. DANH SÁCH CHI TIẾT ĐẠI BIỂU & ĐỐI SOÁT ĐIỂM DANH</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', textTransform: 'none' }}>
              (Hiển thị {filteredAttendees.length}/{reportData.attendees.length} đại biểu)
            </span>
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
              textAlign: 'left'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'center', width: '36px' }}>
                  STT
                </th>
                <th style={{ padding: '8px 8px', border: '1px solid #cbd5e1', width: '80px' }}>Mã CB</th>
                <th style={{ padding: '8px 8px', border: '1px solid #cbd5e1' }}>Họ và tên</th>
                <th style={{ padding: '8px 8px', border: '1px solid #cbd5e1' }}>Chức vụ & Đơn vị</th>
                <th style={{ padding: '8px 8px', border: '1px solid #cbd5e1', width: '70px', textAlign: 'center' }}>
                  Vai trò
                </th>
                <th style={{ padding: '8px 8px', border: '1px solid #cbd5e1', width: '90px' }}>Check-in</th>
                <th style={{ padding: '8px 8px', border: '1px solid #cbd5e1', width: '90px' }}>Check-out</th>
                <th style={{ padding: '8px 8px', border: '1px solid #cbd5e1', width: '70px', textAlign: 'center' }}>
                  Thời lượng
                </th>
                <th style={{ padding: '8px 8px', border: '1px solid #cbd5e1', width: '110px' }}>Kết luận</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map((att) => (
                <tr key={att.employeeCode} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    {att.stt}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0', fontFamily: 'var(--font-mono)' }}>
                    {att.employeeCode}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                    {att.fullName}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                    <div>{att.position}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{att.departmentName}</div>
                  </td>
                  <td style={{ padding: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: att.role === 'Bắt buộc' ? '#eff6ff' : '#f1f5f9',
                        color: att.role === 'Bắt buộc' ? '#1e40af' : '#475569',
                        fontWeight: 600
                      }}
                    >
                      {att.role}
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 600 }}>{att.checkInTime}</div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: att.checkInStatus.includes('Đi muộn') ? '#b45309' : '#15803d'
                      }}
                    >
                      {att.checkInStatus}
                    </div>
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 600 }}>{att.checkOutTime}</div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: att.checkOutStatus.includes('Về sớm') ? '#c2410c' : '#475569'
                      }}
                    >
                      {att.checkOutStatus}
                    </div>
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 600 }}>
                    {att.durationMinutes > 0 ? `${att.durationMinutes}p` : '--'}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor:
                          att.conclusion === 'Có mặt trọn vẹn'
                            ? '#dcfce7'
                            : att.conclusion === 'Đến muộn'
                            ? '#fef3c7'
                            : att.conclusion === 'Về sớm'
                            ? '#ffedd5'
                            : att.conclusion === 'Muộn & Về sớm'
                            ? '#fee2e2'
                            : '#f1f5f9',
                        color:
                          att.conclusion === 'Có mặt trọn vẹn'
                            ? '#15803d'
                            : att.conclusion === 'Đến muộn'
                            ? '#92400e'
                            : att.conclusion === 'Về sớm'
                            ? '#9a3412'
                            : att.conclusion === 'Muộn & Về sớm'
                            ? '#991b1b'
                            : '#64748b'
                      }}
                    >
                      {att.conclusion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PHẦN IV: DẤU MỘC SỐ & BẢO MẬT BẤT BIẾN FINVIET */}
        <div
          className="meeting-report-doc-seal"
          style={{
            marginBottom: '32px',
            padding: '16px 20px',
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: 'var(--radius-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '14px'
                }}
              >
                ★
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
                  CHỨNG THỰC DỮ LIỆU ĐIỆN TỬ BẤT BIẾN (FINVIET DIGITAL SEAL)
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Hồ sơ điểm danh được đóng dấu niêm phong điện tử sau khi kết thúc cuộc họp.
                </div>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#334155' }}>
              <div>• <b>Mã băm SHA-256 toàn vẹn:</b> {reportData.digitalSeal.hash}</div>
              <div>• <b>Số chứng thư số:</b> {reportData.digitalSeal.serialNumber}</div>
              <div>• <b>Thời điểm niêm phong:</b> {reportData.digitalSeal.signedAt}</div>
            </div>
          </div>

          {/* Dấu mộc tròn mô phỏng số */}
          <div
            style={{
              width: '110px',
              height: '110px',
              border: '2px dashed #dc2626',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              transform: 'rotate(-5deg)',
              flexShrink: 0,
              backgroundColor: '#fff5f5'
            }}
          >
            <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center' }}>
              ★ FINVIET ★
            </div>
            <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center' }}>
              ĐÃ XÁC THỰC
            </div>
            <div style={{ fontSize: '8px', fontStyle: 'italic', textAlign: 'center', marginTop: '2px' }}>
              BẤT BIẾN
            </div>
          </div>
        </div>

        {/* PHẦN V: CHỮ KÝ ĐẠI DIỆN HAI BÊN */}
        <div
          className="meeting-report-doc-signatures"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            textAlign: 'center',
            pageBreakInside: 'avoid'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
              THƯ KÝ LẬP BIÊN BẢN
            </div>
            <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#6b7280', marginTop: '2px' }}>
              (Ký và ghi rõ họ tên)
            </div>
            <div className="meeting-report-doc-sig-space" style={{ height: '70px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
              {reportData.closedBy}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
              CHỦ TỌA CUỘC HỌP
            </div>
            <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#6b7280', marginTop: '2px' }}>
              (Ký, đóng dấu và ghi rõ họ tên)
            </div>
            <div className="meeting-report-doc-sig-space" style={{ height: '70px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
              {reportData.hostName}
            </div>
          </div>
        </div>
      </div>
    </PopupModal>
  );
};
