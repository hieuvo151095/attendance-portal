import React, { useState } from 'react';
import {
  PopupModal,
  TextField,
  InlineNotice
} from '../../design-system';
import { departmentService } from '../../services/department';
import { Department } from '../../types/organization';

export interface DepartmentModalProps {
  open: boolean;
  tenantId: string;
  department?: Department | null; // Có giá trị khi sửa, null khi thêm mới
  parentDepartment?: Department | null; // Gợi ý phòng ban cha khi bấm "Thêm phòng ban con"
  availableParents: Department[];
  onClose: () => void;
  onSuccess: () => void;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  open,
  tenantId,
  department,
  parentDepartment,
  availableParents,
  onClose,
  onSuccess
}) => {
  const isEditing = !!department;
  const [code, setCode] = useState(department?.code || '');
  const [name, setName] = useState(department?.name || '');
  const [parentId, setParentId] = useState<string>(
    department?.parentId || parentDepartment?.id || ''
  );
  const [managerName, setManagerName] = useState(department?.managerName || '');
  const [managerPhone, setManagerPhone] = useState(department?.managerPhone || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lọc danh sách cha hợp lệ (không chọn chính nó khi sửa)
  const validParents = availableParents.filter((d) => !department || d.id !== department.id);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!code.trim()) {
      setErrorMessage('Vui lòng nhập mã định danh phòng ban (ví dụ: VP-UBND, PX-MAY-1)');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập tên phòng ban / phân xưởng / khoa phòng');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && department) {
        await departmentService.updateDepartment(tenantId, department.id, {
          code,
          name,
          parentId: parentId || null,
          managerName,
          managerPhone
        });
      } else {
        await departmentService.createDepartment(tenantId, {
          code,
          name,
          parentId: parentId || null,
          managerName,
          managerPhone
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi phát sinh khi lưu phòng ban';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PopupModal
      open={open}
      icon="building"
      title={isEditing ? 'Cập Nhật Phòng Ban / Đơn Vị' : 'Thêm Phòng Ban / Đơn Vị Mới'}
      description="Thiết lập mã định danh, cấp quản lý trực thuộc và người phụ trách phòng ban"
      width={480}
      onClose={onClose}
      primaryAction={{
        label: loading ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm phòng ban',
        onClick: handleSubmit,
        disabled: loading || !code.trim() || !name.trim(),
        icon: 'circle-check'
      }}
      secondaryAction={{
        label: 'Hủy bỏ',
        onClick: onClose
      }}
    >
      {errorMessage && (
        <InlineNotice tone="danger" style={{ marginBottom: '16px' }}>
          {errorMessage}
        </InlineNotice>
      )}

      <TextField
        id="dept-code"
        label="Mã phòng ban (Mã định danh duy nhất)"
        required
        prefixIcon="hashtag"
        placeholder="Ví dụ: VP-UBND, PX-MAY-1, K-KHAM"
        value={code}
        onChange={(val) => {
          setCode(val.toUpperCase());
          if (errorMessage) setErrorMessage(null);
        }}
        disabled={loading}
      />

      <TextField
        id="dept-name"
        label="Tên phòng ban / Phân xưởng / Khoa phòng"
        required
        prefixIcon="building"
        placeholder="Ví dụ: Văn phòng HĐND & UBND, Phân xưởng May 1"
        value={name}
        onChange={(val) => {
          setName(val);
          if (errorMessage) setErrorMessage(null);
        }}
        disabled={loading}
      />

      {/* Chọn cấp quản lý trực thuộc (phòng ban cha) */}
      <div className="ecomd-field">
        <label htmlFor="dept-parent-select" className="ecomd-field__label">
          Cấp quản lý trực thuộc (Phòng ban cha)
        </label>
        <div className="ecomd-select-wrap">
          <select
            id="dept-parent-select"
            className="ecomd-select body-sm-medium"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            disabled={loading}
            aria-label="Cấp quản lý trực thuộc"
          >
            <option value="">(Không có — Đây là phòng ban cấp cao nhất)</option>
            {validParents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>
        <span className="ecomd-field__helper">
          Giúp xây dựng cây cơ cấu phân cấp trực thuộc trong cơ quan
        </span>
      </div>

      <PopupModal.Section label="NGƯỜI PHỤ TRÁCH PHÒNG BAN">
        <TextField
          id="dept-manager-name"
          label="Họ tên người phụ trách / Trưởng phòng"
          prefixIcon="user-tie"
          placeholder="Ví dụ: Ông Nguyễn Văn An, BSCK2 Lê Văn Hải"
          value={managerName}
          onChange={(val) => setManagerName(val)}
          disabled={loading}
        />

        <TextField
          id="dept-manager-phone"
          label="Số điện thoại người phụ trách"
          prefixIcon="phone"
          placeholder="Ví dụ: 0903 123 456"
          value={managerPhone}
          onChange={(val) => setManagerPhone(val)}
          disabled={loading}
        />
      </PopupModal.Section>
    </PopupModal>
  );
};
