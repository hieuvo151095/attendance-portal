import React, { useState, useRef, useEffect } from 'react';
import {
  SideSheet,
  Button,
  DataTable,
  Tag,
  StatusTag,
  Icon,
  EmptyValue,
  DataTableColumn
} from '../../design-system';
import {
  ImportEmployeeRow,
  ImportErrorRow,
  ImportValidationResult,
  ImportEmployeeResult
} from '../../types/employee';
import { employeeService } from '../../services/employee';
import { downloadEmployeeExcelTemplate, parseXlsxFile } from '../../utils/excelTemplate';

export interface ExcelImportModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  onSuccess: () => void;
}

// Bộ dữ liệu mẫu chuẩn hợp lệ
const DEFAULT_VALID_SAMPLE_ROWS: ImportEmployeeRow[] = [
  {
    employeeCode: 'NV-IMP-01',
    fullName: 'Trần Văn Bình',
    identityNumber: '079095009988',
    position: 'Chuyên viên Công nghệ thông tin',
    departmentCodeOrName: 'Văn phòng',
    email: 'binh.tran@finviet.com',
    phoneNumber: '0977 101 202'
  },
  {
    employeeCode: 'NV-IMP-02',
    fullName: 'Lê Thị Diệu',
    identityNumber: '079198007766',
    position: 'Kế toán viên',
    departmentCodeOrName: 'Tài chính - Kế toán',
    email: 'dieu.le@finviet.com',
    phoneNumber: '0908 654 321'
  },
  {
    employeeCode: 'NV-IMP-03',
    fullName: 'Ngô Thanh Tùng',
    identityNumber: '079092005544',
    position: 'Kỹ sư Vận hành',
    departmentCodeOrName: 'Kỹ thuật',
    email: 'tung.ngo@finviet.com',
    phoneNumber: '0912 345 678'
  }
];

// Bộ dữ liệu kiểm thử lỗi trùng lặp (Mã NV, CCCD, Email, SĐT)
const DUPLICATE_TEST_SAMPLE_ROWS: ImportEmployeeRow[] = [
  // 1. Trùng mã NV với UBND-001 (Đ/c Nguyễn Văn An)
  {
    employeeCode: 'UBND-001',
    fullName: 'Trần Minh Đức (Trùng mã NV)',
    identityNumber: '079099887711',
    position: 'Chuyên viên',
    departmentCodeOrName: 'Văn phòng',
    email: 'duc.tran@finviet.com',
    phoneNumber: '0901 888 999'
  },
  // 2. Trùng CCCD với 079186002345 (Bà Phạm Thị Cúc)
  {
    employeeCode: 'NV-IMP-04',
    fullName: 'Phan Thị Mai (Trùng CCCD)',
    identityNumber: '079186002345',
    position: 'Cán bộ Địa chính',
    departmentCodeOrName: 'Địa chính',
    email: 'mai.phan@finviet.com',
    phoneNumber: '0902 777 888'
  },
  // 3. Trùng SĐT với 0903 111 222 (Đ/c Nguyễn Văn An)
  {
    employeeCode: 'NV-IMP-05',
    fullName: 'Lý Quốc Bảo (Trùng SĐT)',
    identityNumber: '079094001122',
    position: 'Chuyên viên Tư pháp',
    departmentCodeOrName: 'Tư pháp',
    email: 'bao.ly@finviet.com',
    phoneNumber: '0903 111 222'
  },
  // 4. Trùng Email với cuc.pham@ubnd.gov.vn (Bà Phạm Thị Cúc)
  {
    employeeCode: 'NV-IMP-06',
    fullName: 'Vũ Thị Hoa (Trùng Email)',
    identityNumber: '079093009988',
    position: 'Thủ quỹ',
    departmentCodeOrName: 'Kế toán',
    email: 'cuc.pham@ubnd.gov.vn',
    phoneNumber: '0904 666 555'
  },
  // 5. Hàng hợp lệ để kiểm tra nạp thành công
  {
    employeeCode: 'NV-IMP-07',
    fullName: 'Đỗ Kim Phượng',
    identityNumber: '079098776655',
    position: 'Văn thư - Lưu trữ',
    departmentCodeOrName: 'Văn phòng',
    email: 'phuong.do@finviet.com',
    phoneNumber: '0905 111 333'
  }
];

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  open,
  onClose,
  tenantId,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rows, setRows] = useState<ImportEmployeeRow[]>(DEFAULT_VALID_SAMPLE_ROWS);
  const [fileName, setFileName] = useState<string>('Danh_sach_nhan_su_Finviet_mau.xlsx');
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<ImportEmployeeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset modal state when opened
  useEffect(() => {
    if (open) {
      setStep(1);
      setRows(DEFAULT_VALID_SAMPLE_ROWS);
      setFileName('Danh_sach_nhan_su_Finviet_mau.xlsx');
      setValidationResult(null);
      setImportResult(null);
      setErrorMessage(null);
    }
  }, [open]);

  // Tải file mẫu bảng tính Excel (.xlsx) chuẩn OpenXML
  const handleDownloadTemplate = () => {
    downloadEmployeeExcelTemplate('Mau_nhap_lieu_nhan_su_Finviet.xlsx');
  };

  // Đọc file Excel (.xlsx) hoặc CSV người dùng tải lên
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage(null);

    // Nếu là file Excel .xlsx, giải nén và phân tích bảng tính OpenXML
    if (file.name.toLowerCase().endsWith('.xlsx')) {
      try {
        const parsedRows = await parseXlsxFile(file);
        if (parsedRows.length === 0) {
          setErrorMessage('Tệp Excel tải lên không chứa dòng dữ liệu nào hợp lệ.');
          return;
        }
        setRows(parsedRows);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi đọc tệp Excel (.xlsx)';
        setErrorMessage(msg);
      }
      return;
    }

    // Nếu là file CSV hoặc text
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = (event.target?.result as string) || '';
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setErrorMessage('Tệp tải lên không chứa dòng dữ liệu nào.');
          return;
        }

        // Bỏ qua dòng tiêu đề
        const dataLines = lines.slice(1);
        const parsedRows: ImportEmployeeRow[] = dataLines.map((line) => {
          const cells = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          return {
            employeeCode: cells[0] || '',
            fullName: cells[1] || '',
            identityNumber: cells[2] || '',
            position: cells[3] || '',
            departmentCodeOrName: cells[4] || '',
            email: cells[5] || '',
            phoneNumber: cells[6] || ''
          };
        }).filter((r) => r.employeeCode || r.fullName);

        if (parsedRows.length === 0) {
          setErrorMessage('Không phân tích được dòng nhân sự nào từ tệp.');
          return;
        }

        setRows(parsedRows);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi đọc tệp dữ liệu';
        setErrorMessage(msg);
      }
    };

    reader.readAsText(file, 'utf-8');
  };

  // Chuyển sang Bước 2: Kiểm tra dữ liệu & Validate trùng lặp
  const handleProceedToStep2 = async () => {
    setErrorMessage(null);
    if (rows.length === 0) {
      setErrorMessage('Vui lòng chọn hoặc tải lên danh sách dữ liệu.');
      return;
    }

    try {
      setIsValidating(true);
      const res = await employeeService.validateExcelRows(tenantId, rows);
      setValidationResult(res);
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi kiểm tra dữ liệu';
      setErrorMessage(msg);
    } finally {
      setIsValidating(false);
    }
  };

  // Xác nhận nạp danh sách hợp lệ vào Portal
  const handleConfirmPushToPortal = async () => {
    if (!validationResult || validationResult.validRows.length === 0) {
      setErrorMessage('Không có dòng dữ liệu hợp lệ để nạp vào hệ thống.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const res = await employeeService.importFromExcel(tenantId, validationResult.validRows);
      setImportResult(res);
      setStep(3);
      if (res.importedCount > 0) {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi nạp dữ liệu vào cổng';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kết thúc quy trình
  const handleFinish = () => {
    onClose();
  };

  // Cột bảng dữ liệu lỗi (Hiển thị nổi bật phía trên)
  const errorColumns: DataTableColumn<ImportErrorRow>[] = [
    {
      key: 'rowNumber',
      title: 'Dòng',
      width: '65px',
      render: (r: ImportErrorRow) => (
        <span className="body-mono-xs" style={{ color: 'var(--semantic-danger)', fontWeight: 600 }}>
          #{r.rowNumber}
        </span>
      )
    },
    {
      key: 'employeeCode',
      title: 'Mã NV & CCCD',
      width: '140px',
      render: (r: ImportErrorRow) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Tag variant="code">{r.employeeCode || '(Trống)'}</Tag>
          <span className="body-mono-xs" style={{ color: 'var(--text-subtle)' }}>
            {r.identityNumber || '(Trống)'}
          </span>
        </div>
      )
    },
    {
      key: 'fullName',
      title: 'Họ và tên',
      width: '150px',
      render: (r: ImportErrorRow) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
            {r.fullName || '(Trống)'}
          </span>
          <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
            {r.position || r.departmentCodeOrName || '---'}
          </span>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'Liên lạc',
      width: '170px',
      render: (r: ImportErrorRow) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="envelope" size={11} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
            <span
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '145px' }}
              title={r.email || 'Chưa có'}
            >
              {r.email || <span style={{ color: 'var(--text-disabled)', fontStyle: 'italic' }}>Chưa có</span>}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="phone" size={11} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-subtle)' }}>
              {r.phoneNumber || <span style={{ color: 'var(--text-disabled)', fontStyle: 'italic' }}>Chưa có</span>}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'errors',
      title: 'Chi tiết lỗi & Vi phạm',
      width: '230px',
      render: (r: ImportErrorRow) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {r.errorTypes.map((type, i) => {
              if (type === 'duplicate_code') {
                return <StatusTag key={i} tone="danger" label="Trùng mã NV" />;
              }
              if (type === 'duplicate_identity') {
                return <StatusTag key={i} tone="danger" label="Trùng CCCD" />;
              }
              if (type === 'duplicate_email') {
                return <StatusTag key={i} tone="danger" label="Trùng Email" />;
              }
              if (type === 'duplicate_phone') {
                return <StatusTag key={i} tone="danger" label="Trùng Số ĐT" />;
              }
              return <StatusTag key={i} tone="warning" label="Thiếu thông tin" />;
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {r.errors.map((err, i) => (
              <div key={i} className="body-xs" style={{ color: 'var(--semantic-danger)', lineHeight: 1.3 }}>
                • {err}
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  // Cột bảng dữ liệu hợp lệ (Hiển thị phía dưới)
  const validColumns: DataTableColumn<ImportEmployeeRow>[] = [
    {
      key: 'employeeCode',
      title: 'Mã NV',
      width: '100px',
      render: (r: ImportEmployeeRow) => <Tag variant="code">{r.employeeCode}</Tag>
    },
    {
      key: 'fullName',
      title: 'Họ và tên',
      width: '160px',
      render: (r: ImportEmployeeRow) => <span className="body-sm-medium">{r.fullName}</span>
    },
    {
      key: 'identityNumber',
      title: 'Số CCCD',
      width: '130px',
      render: (r: ImportEmployeeRow) => <span className="body-mono-xs">{r.identityNumber}</span>
    },
    {
      key: 'position',
      title: 'Chức danh & Phòng ban',
      width: '180px',
      render: (r: ImportEmployeeRow) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
            {r.position}
          </span>
          <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
            {r.departmentCodeOrName}
          </span>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'Liên lạc',
      width: '180px',
      render: (r: ImportEmployeeRow) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="envelope" size={11} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
            <span
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '155px' }}
              title={r.email || 'Chưa có'}
            >
              {r.email || <span style={{ color: 'var(--text-disabled)', fontStyle: 'italic' }}>Chưa có email</span>}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="phone" size={11} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-subtle)' }}>
              {r.phoneNumber || <span style={{ color: 'var(--text-disabled)', fontStyle: 'italic' }}>Chưa có SĐT</span>}
            </span>
          </div>
        </div>
      )
    }
  ];

  return (
    <SideSheet
      open={open}
      title="Nhập danh sách nhân sự từ file Excel"
      description="Quy trình 3 bước chuẩn hóa: Tải lên dữ liệu → Kiểm tra & Đối chiếu trùng lặp → Xác nhận nạp vào portal."
      icon="file-excel"
      width={780}
      onClose={isSubmitting ? false : onClose}
      primaryAction={
        step === 1
          ? {
              label: isValidating ? 'Đang kiểm tra...' : 'Tiếp tục kiểm tra dữ liệu',
              icon: 'arrow-right',
              onClick: handleProceedToStep2,
              disabled: rows.length === 0 || isValidating
            }
          : step === 2
          ? {
              label: isSubmitting
                ? 'Đang nạp vào portal...'
                : `Xác nhận nạp (${validationResult?.validRows.length || 0} nhân sự)`,
              icon: 'check',
              onClick: handleConfirmPushToPortal,
              disabled: isSubmitting || !validationResult || validationResult.validRows.length === 0
            }
          : {
              label: 'Hoàn tất',
              icon: 'circle-check',
              onClick: handleFinish
            }
      }
      secondaryAction={
        step === 1
          ? {
              label: 'Hủy',
              onClick: onClose,
              disabled: isValidating
            }
          : step === 2
          ? {
              label: 'Quay lại bước 1',
              icon: 'arrow-left',
              onClick: () => setStep(1),
              disabled: isSubmitting
            }
          : {
              label: 'Nhập thêm tệp khác',
              onClick: () => {
                setStep(1);
                setRows(DEFAULT_VALID_SAMPLE_ROWS);
                setValidationResult(null);
                setImportResult(null);
              }
            }
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {/* 1. Thanh tiến trình 3 bước */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-12) var(--space-16)',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-8)',
            border: '1px solid var(--border-default)'
          }}
        >
          {[
            { stepNumber: 1, label: '1. Tải lên dữ liệu' },
            { stepNumber: 2, label: '2. Kiểm tra & Xem lại' },
            { stepNumber: 3, label: '3. Hoàn tất' }
          ].map((item, idx) => {
            const isActive = step === item.stepNumber;
            const isCompleted = step > item.stepNumber;

            return (
              <React.Fragment key={item.stepNumber}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: isCompleted
                        ? 'var(--semantic-success)'
                        : isActive
                        ? 'var(--primary-600)'
                        : 'var(--bg-surface)',
                      color: isCompleted || isActive ? '#fff' : 'var(--text-subtle)',
                      border: isCompleted || isActive ? 'none' : '1px solid var(--border-neutral-subtle)'
                    }}
                  >
                    {isCompleted ? <Icon name="check" size={13} color="#fff" /> : item.stepNumber}
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive
                        ? 'var(--text-heading)'
                        : isCompleted
                        ? 'var(--text-body)'
                        : 'var(--text-disabled)'
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      margin: '0 var(--space-12)',
                      backgroundColor: step > idx + 1 ? 'var(--semantic-success)' : 'var(--border-default)'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Thông báo lỗi chung nếu có */}
        {errorMessage && (
          <div
            style={{
              padding: 'var(--space-12) var(--space-16)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-8)',
              color: 'var(--semantic-danger)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-8)'
            }}
          >
            <Icon name="circle-exclamation" size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* BƯỚC 1: TẢI LÊN DỮ LIỆU & TẢI FILE MẪU                  */}
        {/* ======================================================== */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            {/* Box tải file mẫu */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-12) var(--space-16)',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-8)',
                border: '1px solid var(--border-default)'
              }}
            >
              <div>
                <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                  File mẫu danh sách nhân sự Finviet
                </div>
                <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                  Các cột chuẩn: <b>Mã NV</b>, <b>Họ tên</b>, <b>Số CCCD</b>, <b>Chức danh</b>, <b>Phòng ban</b>, <b>Email</b>, <b>Số ĐT</b>.
                </div>
              </div>
              <Button
                variant="secondary"
                icon="download"
                onClick={handleDownloadTemplate}
              >
                Tải file mẫu
              </Button>
            </div>

            {/* Khu vực kéo thả / chọn file */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-default)',
                borderRadius: 'var(--radius-12)',
                padding: 'var(--space-24)',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-surface)',
                transition: 'border-color 0.2s ease'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, text/csv, .xlsx, .xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-12) auto'
                }}
              >
                <Icon name="upload" size={24} />
              </div>
              <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                Kéo thả file .xlsx hoặc .csv vào đây, hoặc bấm để chọn tệp
              </div>
              <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: 'var(--space-4)' }}>
                Hỗ trợ bảng tính Excel (.xlsx) hoặc tệp CSV chuẩn Unicode. Dung lượng tối đa 10MB.
              </div>
              {fileName && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-6)',
                    marginTop: 'var(--space-12)',
                    padding: 'var(--space-4) var(--space-12)',
                    borderRadius: 'var(--radius-16)',
                    backgroundColor: 'var(--primary-50)',
                    color: 'var(--primary-700)',
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                >
                  <Icon name="file-excel" size={14} />
                  <span>{fileName} ({rows.length} dòng dữ liệu)</span>
                </div>
              )}
            </div>

            {/* Bộ tùy chọn dữ liệu mẫu trải nghiệm nhanh */}
            <div>
              <div className="body-xs-bold" style={{ color: 'var(--text-subtle)', marginBottom: 'var(--space-8)' }}>
                Hoặc chọn nhanh bộ dữ liệu mẫu để trải nghiệm quy trình:
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRows(DEFAULT_VALID_SAMPLE_ROWS);
                    setFileName('Du_lieu_hop_le_3_nhan_su.xlsx');
                  }}
                >
                  Dữ liệu hợp lệ (3 nhân sự)
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRows(DUPLICATE_TEST_SAMPLE_ROWS);
                    setFileName('Du_lieu_kiem_thu_trung_lap_5_nhan_su.xlsx');
                  }}
                >
                  Dữ liệu có lỗi trùng lặp (Mã NV, CCCD, Email, SĐT)
                </Button>
              </div>
            </div>

            {/* Xem trước nhanh dữ liệu Bước 1 */}
            <div>
              <div className="body-sm-bold" style={{ marginBottom: 'var(--space-8)', color: 'var(--text-heading)' }}>
                Xem trước danh sách ({rows.length} nhân sự chuẩn bị nhập):
              </div>
              <DataTable
                columns={validColumns}
                rows={rows}
                rowKey="employeeCode"
                emptyText="Chưa có dữ liệu tải lên"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BƯỚC 2: KIỂM TRA & XEM LẠI DỮ LIỆU (REVIEW & VALIDATE)   */}
        {/* ======================================================== */}
        {step === 2 && validationResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            {/* 1. BẢNG DỮ LIỆU LỖI NẰM Ở TRÊN CÙNG NẾU CÓ LỖI */}
            {validationResult.errorRows.length > 0 && (
              <div
                style={{
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.04)',
                  borderRadius: 'var(--radius-8)',
                  padding: 'var(--space-12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-8)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                  <Icon name="triangle-exclamation" size={18} color="var(--semantic-danger)" />
                  <div>
                    <span className="body-sm-bold" style={{ color: 'var(--semantic-danger)' }}>
                      Phát hiện {validationResult.errorRows.length} dòng dữ liệu lỗi / trùng lặp (Sẽ được loại trừ):
                    </span>
                    <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                      Các dòng dưới đây vi phạm quy tắc trùng mã NV, CCCD, Email hoặc SĐT đã tồn tại trên cổng. Hệ thống sẽ bỏ qua các dòng này khi bạn bấm <b>"Xác nhận"</b>.
                    </div>
                  </div>
                </div>

                <DataTable
                  columns={errorColumns}
                  rows={validationResult.errorRows}
                  rowKey="rowNumber"
                  emptyText="Không có lỗi"
                />
              </div>
            )}

            {/* 2. BẢNG DỮ LIỆU HỢP LỆ NẰM Ở PHÍA DƯỚI */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-8)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                  <Icon name="circle-check" size={16} color="var(--semantic-success)" />
                  <span className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                    Danh sách nhân sự hợp lệ ({validationResult.validRows.length}/{validationResult.total} nhân sự):
                  </span>
                </div>
                <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                  Sẽ được tạo mới trên portal
                </span>
              </div>

              {validationResult.validRows.length > 0 ? (
                <DataTable
                  columns={validColumns}
                  rows={validationResult.validRows}
                  rowKey="employeeCode"
                  emptyText="Không có dòng nào hợp lệ"
                />
              ) : (
                <div
                  style={{
                    padding: 'var(--space-20)',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-8)'
                  }}
                >
                  <EmptyValue italic>
                    Toàn bộ các dòng trong tệp đều bị lỗi hoặc trùng lặp. Vui lòng quay lại Bước 1 để điều chỉnh tệp nguồn.
                  </EmptyValue>
                </div>
              )}
            </div>

            <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
              💡 Nhấn nút <b>"Xác nhận nạp"</b> bên dưới để chính thức cập nhật {validationResult.validRows.length} nhân sự hợp lệ vào cơ sở dữ liệu.
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BƯỚC 3: HOÀN TẤT NẠP DỮ LIỆU                            */}
        {/* ======================================================== */}
        {step === 3 && importResult && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: 'var(--space-24) var(--space-16)',
              gap: 'var(--space-16)'
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                color: 'var(--semantic-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="circle-check" size={36} />
            </div>

            <div>
              <div className="headline-sm" style={{ color: 'var(--text-heading)' }}>
                Nạp dữ liệu nhân sự thành công!
              </div>
              <div className="body-sm" style={{ color: 'var(--text-subtle)', marginTop: 'var(--space-4)' }}>
                Kết quả import: Toàn bộ {importResult.importedCount} nhân sự hợp lệ đã được đồng bộ vào hệ thống Finviet Portal.
              </div>
            </div>

            {/* Hộp tóm tắt chỉ số */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-12)',
                width: '100%',
                maxWidth: '520px',
                marginTop: 'var(--space-8)'
              }}
            >
              <div
                style={{
                  padding: 'var(--space-12)',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-8)',
                  border: '1px solid var(--border-default)'
                }}
              >
                <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Tổng số xử lý</div>
                <div className="headline-sm" style={{ color: 'var(--text-heading)', marginTop: '4px' }}>
                  {importResult.total}
                </div>
              </div>
              <div
                style={{
                  padding: 'var(--space-12)',
                  backgroundColor: 'rgba(34, 197, 94, 0.08)',
                  borderRadius: 'var(--radius-8)',
                  border: '1px solid rgba(34, 197, 94, 0.25)'
                }}
              >
                <div className="body-xs" style={{ color: 'var(--semantic-success)' }}>Đã nạp thành công</div>
                <div className="headline-sm" style={{ color: 'var(--semantic-success)', marginTop: '4px' }}>
                  {importResult.importedCount}
                </div>
              </div>
              <div
                style={{
                  padding: 'var(--space-12)',
                  backgroundColor: importResult.skippedCount > 0 ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-8)',
                  border: `1px solid ${importResult.skippedCount > 0 ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-default)'}`
                }}
              >
                <div className="body-xs" style={{ color: importResult.skippedCount > 0 ? 'var(--semantic-danger)' : 'var(--text-subtle)' }}>
                  Bỏ qua do lỗi / trùng
                </div>
                <div
                  className="headline-sm"
                  style={{
                    color: importResult.skippedCount > 0 ? 'var(--semantic-danger)' : 'var(--text-heading)',
                    marginTop: '4px'
                  }}
                >
                  {importResult.skippedCount}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 'var(--space-12) var(--space-16)',
                backgroundColor: 'var(--primary-50)',
                border: '1px solid var(--primary-100)',
                borderRadius: 'var(--radius-8)',
                color: 'var(--primary-800)',
                fontSize: '13px',
                lineHeight: 1.5,
                textAlign: 'left',
                maxWidth: '520px'
              }}
            >
              💡 Bạn có thể tiếp tục tiến hành <b>Cấp thẻ RFID/NFC</b> hoặc <b>Đồng bộ Face ID từ Camera Hikvision</b> cho các nhân sự vừa nạp tại danh sách quản lý nhân sự chính.
            </div>
          </div>
        )}
      </div>
    </SideSheet>
  );
};
