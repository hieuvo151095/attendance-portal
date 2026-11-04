import React, { useState, useEffect } from 'react';
import { PopupModal, TextField, SelectField, InlineNotice } from '../../design-system';
import { Employee, CreateEmployeeDTO, UpdateEmployeeDTO } from '../../types/employee';
import { Department } from '../../types/organization';
import { employeeService } from '../../services/employee';
import { departmentService } from '../../services/department';

export interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  employeeToEdit?: Employee | null;
  onSuccess: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  open,
  onClose,
  tenantId,
  employeeToEdit,
  onSuccess
}) => {
  const isEditing = Boolean(employeeToEdit);

  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [position, setPosition] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setError(null);
    departmentService.getDepartmentsByTenant(tenantId).then((depts) => {
      setDepartments(depts);
      if (employeeToEdit) {
        setEmployeeCode(employeeToEdit.employeeCode);
        setFullName(employeeToEdit.fullName);
        setIdentityNumber(employeeToEdit.identityNumber);
        setPosition(employeeToEdit.position);
        setDepartmentId(employeeToEdit.departmentId);
        setEmail(employeeToEdit.email || '');
        setPhoneNumber(employeeToEdit.phoneNumber || '');
        setGender(employeeToEdit.gender || 'male');
      } else {
        setEmployeeCode('');
        setFullName('');
        setIdentityNumber('');
        setPosition('');
        setDepartmentId(depts[0]?.id || '');
        setEmail('');
        setPhoneNumber('');
        setGender('male');
      }
    });
  }, [open, tenantId, employeeToEdit]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!employeeCode.trim()) {
      setError('Mã nhân viên (Employee ID) không được để trống.');
      return;
    }
    if (!fullName.trim()) {
      setError('Họ và tên nhân viên không được để trống.');
      return;
    }
    if (!identityNumber.trim()) {
      setError('Số CCCD / Hộ chiếu không được để trống.');
      return;
    }
    if (!position.trim()) {
      setError('Chức danh / Vị trí công tác không được để trống.');
      return;
    }
    if (!departmentId) {
      setError('Vui lòng chọn phòng ban trực thuộc.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && employeeToEdit) {
        const updateDto: UpdateEmployeeDTO = {
          employeeCode: employeeCode.trim(),
          fullName: fullName.trim(),
          identityNumber: identityNumber.trim(),
          position: position.trim(),
          departmentId,
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          gender
        };
        await employeeService.updateEmployee(tenantId, employeeToEdit.id, updateDto);
      } else {
        const createDto: CreateEmployeeDTO = {
          employeeCode: employeeCode.trim(),
          fullName: fullName.trim(),
          identityNumber: identityNumber.trim(),
          position: position.trim(),
          departmentId,
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          gender
        };
        await employeeService.createEmployee(tenantId, createDto);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu thông tin nhân viên.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.code} - ${d.name}`
  }));

  const genderOptions = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' }
  ];

  return (
    <PopupModal
      open={open}
      title={isEditing ? 'Cập nhật hồ sơ nhân sự' : 'Thêm nhân sự mới'}
      description="Điền thông tin định danh và phòng ban của nhân viên vào hệ thống điểm danh."
      icon="user-plus"
      width={560}
      onClose={onClose}
      primaryAction={{
        label: isSubmitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm nhân sự',
        icon: isEditing ? 'check' : 'plus',
        onClick: () => handleSubmit(),
        disabled: isSubmitting
      }}
      secondaryAction={{
        label: 'Hủy',
        onClick: onClose,
        disabled: isSubmitting
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {error && (
          <InlineNotice tone="danger" label={error} />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
          <TextField
            id="emp-code"
            label="Mã nhân viên (Employee ID)"
            required
            placeholder="VD: NV-001, BCD-042"
            value={employeeCode}
            onChange={(val) => setEmployeeCode(val)}
            disabled={isSubmitting}
          />

          <TextField
            id="emp-name"
            label="Họ và tên"
            required
            placeholder="VD: Nguyễn Văn An"
            value={fullName}
            onChange={(val) => setFullName(val)}
            disabled={isSubmitting}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
          <TextField
            id="emp-cccd"
            label="Số CCCD / Hộ chiếu"
            required
            placeholder="VD: 079085001234"
            value={identityNumber}
            onChange={(val) => setIdentityNumber(val)}
            disabled={isSubmitting}
          />

          <TextField
            id="emp-position"
            label="Chức danh / Vị trí"
            required
            placeholder="VD: Chuyên viên, Bác sĩ, Trưởng phòng"
            value={position}
            onChange={(val) => setPosition(val)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label
            htmlFor="emp-dept"
            className="body-sm-medium"
            style={{ display: 'block', marginBottom: 'var(--space-6)', color: 'var(--text-heading)' }}
          >
            Phòng ban trực thuộc <span style={{ color: 'var(--semantic-danger)' }}>*</span>
          </label>
          <SelectField
            id="emp-dept"
            options={departmentOptions.length > 0 ? departmentOptions : ['Chưa có phòng ban']}
            value={departmentId}
            onChange={(val) => setDepartmentId(val)}
            disabled={isSubmitting || departmentOptions.length === 0}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
          <TextField
            id="emp-email"
            label="Email công vụ"
            type="email"
            placeholder="VD: an.nguyen@donvi.gov.vn"
            value={email}
            onChange={(val) => setEmail(val)}
            disabled={isSubmitting}
          />

          <TextField
            id="emp-phone"
            label="Số điện thoại"
            type="tel"
            placeholder="VD: 0903 123 456"
            value={phoneNumber}
            onChange={(val) => setPhoneNumber(val)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label
            htmlFor="emp-gender"
            className="body-sm-medium"
            style={{ display: 'block', marginBottom: 'var(--space-6)', color: 'var(--text-heading)' }}
          >
            Giới tính
          </label>
          <SelectField
            id="emp-gender"
            options={genderOptions}
            value={gender}
            onChange={(val) => setGender(val as 'male' | 'female' | 'other')}
            disabled={isSubmitting}
            style={{ width: '100%' }}
          />
        </div>

        <div
          className="body-xs"
          style={{
            padding: 'var(--space-12)',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-8)',
            color: 'var(--text-subtle)'
          }}
        >
          💡 <b>Lưu ý về Face ID:</b> Sau khi tạo hồ sơ, ảnh chân dung và nhận diện khuôn mặt sẽ được chuyển tự động từ Camera Hikvision sang Portal khi nhân viên đăng ký tại thiết bị điểm danh.
        </div>
      </form>
    </PopupModal>
  );
};
