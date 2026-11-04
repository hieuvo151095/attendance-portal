import React, { useState } from 'react';
import { PopupModal, Button, InlineNotice, DataTable } from '../../design-system';
import { ImportEmployeeRow, ImportEmployeeResult } from '../../types/employee';
import { employeeService } from '../../services/employee';

export interface ExcelImportModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  onSuccess: () => void;
}

const DEFAULT_SAMPLE_ROWS: ImportEmployeeRow[] = [
  {
    employeeCode: 'NV-IMP-01',
    fullName: 'Trần Văn Bình',
    identityNumber: '079095009988',
    position: 'Chuyên viên Công nghệ thông tin',
    departmentCodeOrName: 'Văn phòng',
    email: 'binh.tran@finviet.com',
    phoneNumber: '0909 123 456'
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

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  open,
  onClose,
  tenantId,
  onSuccess
}) => {
  const [rows] = useState<ImportEmployeeRow[]>(DEFAULT_SAMPLE_ROWS);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportEmployeeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);
    setImportResult(null);

    if (rows.length === 0) {
      setError('Danh sách nhập liệu trống.');
      return;
    }

    try {
      setIsImporting(true);
      const res = await employeeService.importFromExcel(tenantId, rows);
      setImportResult(res);
      if (res.importedCount > 0) {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi nhập dữ liệu Excel';
      setError(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const columns = [
    {
      key: 'employeeCode',
      title: 'Mã NV',
      render: (r: ImportEmployeeRow) => <span className="body-mono-xs">{r.employeeCode}</span>
    },
    {
      key: 'fullName',
      title: 'Họ và tên',
      render: (r: ImportEmployeeRow) => <span className="body-sm-medium">{r.fullName}</span>
    },
    {
      key: 'identityNumber',
      title: 'Số CCCD',
      render: (r: ImportEmployeeRow) => r.identityNumber
    },
    {
      key: 'position',
      title: 'Chức danh',
      render: (r: ImportEmployeeRow) => r.position
    },
    {
      key: 'departmentCodeOrName',
      title: 'Phòng ban',
      render: (r: ImportEmployeeRow) => r.departmentCodeOrName
    }
  ];

  return (
    <PopupModal
      open={open}
      title="Nhập danh sách nhân sự từ file Excel"
      description="Hỗ trợ thêm hàng loạt cán bộ nhân viên nhanh chóng bằng danh sách chuẩn hóa."
      icon="file-excel"
      width={720}
      onClose={onClose}
      primaryAction={{
        label: isImporting
          ? 'Đang nhập dữ liệu...'
          : importResult
          ? 'Hoàn tất'
          : `Nhập ${rows.length} nhân sự`,
        icon: 'file-import',
        onClick: importResult ? onClose : handleImport,
        disabled: isImporting
      }}
      secondaryAction={{
        label: importResult ? 'Đóng' : 'Hủy',
        onClick: onClose,
        disabled: isImporting
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {error && (
          <InlineNotice tone="danger" label={error} />
        )}

        {importResult && (
          <InlineNotice
            tone={importResult.importedCount > 0 ? 'success' : 'warning'}
            label={
              importResult.skippedCount > 0
                ? `Kết quả import: Thành công ${importResult.importedCount}/${importResult.total} nhân sự. Bỏ qua ${importResult.skippedCount} dòng do trùng mã/CCCD hoặc lỗi định dạng.`
                : `Kết quả import: Toàn bộ ${importResult.importedCount} nhân sự đã được nạp thành công vào cơ sở dữ liệu.`
            }
          />
        )}

        {importResult && importResult.errors.length > 0 && (
          <div
            style={{
              padding: 'var(--space-12)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-8)',
              border: '1px solid var(--border-default)',
              maxHeight: '120px',
              overflowY: 'auto'
            }}
          >
            <div className="body-xs-bold" style={{ marginBottom: 'var(--space-4)', color: 'var(--semantic-danger)' }}>
              Chi tiết lỗi các hàng bị bỏ qua:
            </div>
            {importResult.errors.map((err, i) => (
              <div key={i} className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                • {err}
              </div>
            ))}
          </div>
        )}

        {/* Excel template info bar */}
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
          <div className="body-xs" style={{ color: 'var(--text-body)' }}>
            📄 Cột dữ liệu yêu cầu: <b>Mã NV</b>, <b>Họ tên</b>, <b>Số CCCD</b>, <b>Chức danh</b>, <b>Phòng ban</b>, <b>Email</b>, <b>Số ĐT</b>.
          </div>
          <Button
            variant="secondary"
            icon="download"
            onClick={() => {
              alert('Đã tải tệp mẫu Danh_sach_nhan_su_Finviet.xlsx');
            }}
          >
            Tải file mẫu
          </Button>
        </div>

        {/* Data preview table */}
        <div>
          <div className="body-sm-bold" style={{ marginBottom: 'var(--space-8)', color: 'var(--text-heading)' }}>
            Xem trước danh sách ({rows.length} nhân sự chuẩn bị nhập):
          </div>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey="employeeCode"
            emptyText="Không có dữ liệu xem trước"
          />
        </div>

        <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
          💡 Sau khi hoàn tất import, bạn có thể thực hiện <b>Đồng bộ Face ID từ Camera Hikvision</b> cho từng nhân sự trên danh sách chính.
        </div>
      </div>
    </PopupModal>
  );
};
