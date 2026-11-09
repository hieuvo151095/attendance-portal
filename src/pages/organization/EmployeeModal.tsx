import React, { useState, useEffect } from 'react';
import { SideSheet, TextField, SelectField, InlineNotice, Checkbox, Icon } from '../../design-system';
import { Employee, CreateEmployeeDTO, UpdateEmployeeDTO, AllowedAttendanceMethods } from '../../types/employee';
import { Department } from '../../types/organization';
import { employeeService } from '../../services/employee';
import { departmentService } from '../../services/department';
import { cardService } from '../../services/card';

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
  const [allowedMethods, setAllowedMethods] = useState<AllowedAttendanceMethods>({
    faceId: true,
    fingerprint: true,
    card: true
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [hasCard, setHasCard] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Face ID chỉ cần ảnh khuôn mặt (tải trực tiếp trên Portal hoặc đã đồng bộ từ trước)
  const hasFaceId = Boolean(avatarUrl && avatarUrl.trim());
  // Vân tay mới cần lấy mẫu từ thiết bị phần cứng Hikvision
  const hasFingerprint = (employeeToEdit?.fingerprintStatus ?? (employeeToEdit ? 'enrolled' : 'pending')) === 'enrolled';

  useEffect(() => {
    if (!open) return;

    setError(null);
    departmentService.getDepartmentsByTenant(tenantId).then(async (depts) => {
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
        setAvatarUrl(employeeToEdit.avatarUrl || '');

        const activeCard = await cardService.getActiveCardByEmployee(tenantId, employeeToEdit.id);
        const cardExists = Boolean(activeCard);
        setHasCard(cardExists);

        const faceEnrolled = Boolean(employeeToEdit.avatarUrl) || employeeToEdit.faceIdStatus === 'enrolled';
        const fpEnrolled = (employeeToEdit.fingerprintStatus ?? 'enrolled') === 'enrolled';

        setAllowedMethods({
          faceId: faceEnrolled ? (employeeToEdit.allowedMethods?.faceId ?? true) : false,
          fingerprint: fpEnrolled ? (employeeToEdit.allowedMethods?.fingerprint ?? true) : false,
          card: cardExists ? (employeeToEdit.allowedMethods?.card ?? true) : false
        });
      } else {
        setEmployeeCode('');
        setFullName('');
        setIdentityNumber('');
        setPosition('');
        setDepartmentId(depts[0]?.id || '');
        setEmail('');
        setPhoneNumber('');
        setGender('male');
        setAvatarUrl('');
        setHasCard(false);
        setAllowedMethods({
          faceId: false,
          fingerprint: false,
          card: false
        });
      }
    });
  }, [open, tenantId, employeeToEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        setAllowedMethods((prev) => ({ ...prev, faceId: true }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarUrl('');
    setAllowedMethods((prev) => ({ ...prev, faceId: false }));
  };

  const SAMPLE_AVATARS = [
    { label: 'Cán bộ Nam 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { label: 'Cán bộ Nữ 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    { label: 'Cán bộ Nam 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { label: 'Cán bộ Nữ 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' }
  ];

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
      setError('Số CCCD không được để trống.');
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
      const hasFacePhoto = Boolean(avatarUrl && avatarUrl.trim());

      if (isEditing && employeeToEdit) {
        const updateDto: UpdateEmployeeDTO = {
          employeeCode: employeeCode.trim(),
          fullName: fullName.trim(),
          identityNumber: identityNumber.trim(),
          position: position.trim(),
          departmentId,
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          gender,
          avatarUrl: hasFacePhoto ? avatarUrl.trim() : undefined,
          faceIdStatus: hasFacePhoto ? 'enrolled' : 'pending',
          allowedMethods: {
            faceId: hasFacePhoto ? allowedMethods.faceId : false,
            fingerprint: hasFingerprint ? allowedMethods.fingerprint : false,
            card: hasCard ? allowedMethods.card : false
          }
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
          gender,
          avatarUrl: hasFacePhoto ? avatarUrl.trim() : undefined,
          faceIdStatus: hasFacePhoto ? 'enrolled' : 'pending',
          fingerprintStatus: 'pending',
          allowedMethods: {
            faceId: hasFacePhoto ? allowedMethods.faceId : false,
            fingerprint: false,
            card: false
          }
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

  const isFormValid = Boolean(
    employeeCode.trim() &&
    fullName.trim() &&
    identityNumber.trim() &&
    position.trim() &&
    departmentId.trim()
  );

  return (
    <SideSheet
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
        disabled: isSubmitting || !isFormValid
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
            label="Số CCCD"
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

        {/* Section: Ảnh chân dung nhận diện khuôn mặt (Face ID) */}
        <div
          style={{
            padding: 'var(--space-16)',
            border: '1px solid var(--border-neutral-subtle)',
            borderRadius: 'var(--radius-8)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <Icon name="camera" size={18} style={{ color: 'var(--primary-600)' }} />
              <span className="body-sm-semibold" style={{ color: 'var(--text-heading)' }}>
                Ảnh chân dung nhận diện khuôn mặt (Face ID)
              </span>
            </div>
            {hasFaceId && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0'
                }}
              >
                Đã có ảnh Face ID
              </span>
            )}
          </div>
          <p className="body-xs" style={{ color: 'var(--text-subtle)', margin: '0 0 var(--space-12) 0' }}>
            Tải ảnh chân dung rõ mặt để hệ thống kích hoạt điểm danh Face ID và sẵn sàng đồng bộ đến các Camera AI (Không cần chụp tại camera Hikvision).
          </p>

          {avatarUrl ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-16)',
                padding: 'var(--space-12)',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-8)',
                border: '1px solid var(--border-default)'
              }}
            >
              <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
                <img
                  src={avatarUrl}
                  alt="Ảnh Face ID"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 'var(--radius-8)',
                    objectFit: 'cover',
                    border: '2px solid var(--primary-500)'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                >
                  ✓
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                  Ảnh chân dung hợp lệ cho Face ID
                </div>
                <div className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                  Đã tải ảnh lên Portal • Sẵn sàng đồng bộ đến các thiết bị Camera AI
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-8)' }}>
                  <label
                    style={{
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 500,
                      borderRadius: 'var(--radius-6)',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-body)'
                    }}
                  >
                    <Icon name="upload" size={12} />
                    <span>Đổi ảnh khác</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 500,
                      borderRadius: 'var(--radius-6)',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--semantic-danger)',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon name="trash" size={12} />
                    <span>Xóa ảnh</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-16) var(--space-12)',
                  border: '2px dashed var(--border-default)',
                  borderRadius: 'var(--radius-8)',
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--space-6)'
                  }}
                >
                  <Icon name="upload" size={16} />
                </div>
                <span className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                  Nhấp để tải ảnh chân dung khuôn mặt (JPG, PNG)
                </span>
                <span className="body-xs" style={{ color: 'var(--text-subtle)', marginTop: '2px' }}>
                  Có thể tải ảnh trực tiếp trên Portal, không cần chụp qua camera Hikvision
                </span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </label>

              {/* Gợi ý chọn ảnh chân dung mẫu */}
              <div style={{ marginTop: 'var(--space-10)' }}>
                <div className="body-xs" style={{ color: 'var(--text-subtle)', marginBottom: 'var(--space-6)' }}>
                  Hoặc chọn nhanh ảnh mẫu có sẵn:
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
                  {SAMPLE_AVATARS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(sample.url);
                        setAllowedMethods((prev) => ({ ...prev, faceId: true }));
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                        border: '1px solid var(--border-neutral-subtle)',
                        borderRadius: 'var(--radius-6)',
                        backgroundColor: 'var(--bg-surface)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: 'var(--text-body)'
                      }}
                    >
                      <img
                        src={sample.url}
                        alt={sample.label}
                        style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span>{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Hình thức điểm danh cho phép */}
        <div
          style={{
            marginTop: 'var(--space-8)',
            padding: 'var(--space-16)',
            border: '1px solid var(--border-neutral-subtle)',
            borderRadius: 'var(--radius-8)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>
            <Icon name="check-circle" size={18} style={{ color: 'var(--primary-600)' }} />
            <span className="body-sm-semibold" style={{ color: 'var(--text-heading)' }}>
              Hình thức điểm danh cho phép
            </span>
          </div>
          <p className="body-xs" style={{ color: 'var(--text-subtle)', margin: '0 0 var(--space-12) 0' }}>
            Bật/tắt các phương thức điểm danh được áp dụng cho cán bộ nhân viên này (khi điểm danh hàng ngày hoặc đi họp).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
            {/* Phương thức 1: Face ID */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-10) var(--space-12)',
                backgroundColor: hasFaceId
                  ? (allowedMethods.faceId ? 'var(--primary-50)' : 'var(--bg-surface)')
                  : 'var(--bg-subtle)',
                border: `1px solid ${
                  hasFaceId
                    ? (allowedMethods.faceId ? 'var(--primary-200)' : 'var(--border-neutral-subtle)')
                    : 'var(--border-neutral-subtle)'
                }`,
                borderRadius: 'var(--radius-6)',
                opacity: hasFaceId ? 1 : 0.8,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-10)' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-6)',
                    backgroundColor: hasFaceId && allowedMethods.faceId ? 'var(--primary-100)' : 'var(--bg-surface)',
                    color: hasFaceId && allowedMethods.faceId ? 'var(--primary-700)' : 'var(--text-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name="camera" size={16} />
                </div>
                <div>
                  <div className="body-sm-medium" style={{ color: hasFaceId ? 'var(--text-heading)' : 'var(--text-subtle)' }}>
                    Nhận diện khuôn mặt (Face ID)
                  </div>
                  {hasFaceId ? (
                    <div className="body-xs" style={{ color: '#047857', fontWeight: 500 }}>
                      ✅ Đã có ảnh khuôn mặt — Sẵn sàng đồng bộ đến Camera AI
                      {!allowedMethods.faceId && <span style={{ color: 'var(--text-disabled)', marginLeft: 6 }}>• Đang tạm tắt</span>}
                    </div>
                  ) : (
                    <div className="body-xs" style={{ color: '#b45309', fontWeight: 500, marginTop: 2 }}>
                      ⚠️ Chưa có ảnh khuôn mặt — Hãy tải ảnh chân dung ở trên để kích hoạt Face ID (Không cần camera Hikvision).
                    </div>
                  )}
                </div>
              </div>
              <Checkbox
                checked={hasFaceId && allowedMethods.faceId}
                onChange={(checked) => setAllowedMethods((prev) => ({ ...prev, faceId: checked }))}
                disabled={isSubmitting || !hasFaceId}
                aria-label={hasFaceId ? 'Cho phép điểm danh bằng Face ID' : 'Chưa có dữ liệu Face ID (bị khóa)'}
              />
            </div>

            {/* Phương thức 2: Vân tay */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-10) var(--space-12)',
                backgroundColor: hasFingerprint
                  ? (allowedMethods.fingerprint ? 'var(--primary-50)' : 'var(--bg-surface)')
                  : 'var(--bg-subtle)',
                border: `1px solid ${
                  hasFingerprint
                    ? (allowedMethods.fingerprint ? 'var(--primary-200)' : 'var(--border-neutral-subtle)')
                    : 'var(--border-neutral-subtle)'
                }`,
                borderRadius: 'var(--radius-6)',
                opacity: hasFingerprint ? 1 : 0.8,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-10)' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-6)',
                    backgroundColor: hasFingerprint && allowedMethods.fingerprint ? 'var(--primary-100)' : 'var(--bg-surface)',
                    color: hasFingerprint && allowedMethods.fingerprint ? 'var(--primary-700)' : 'var(--text-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name="fingerprint" size={16} />
                </div>
                <div>
                  <div className="body-sm-medium" style={{ color: hasFingerprint ? 'var(--text-heading)' : 'var(--text-subtle)' }}>
                    Sinh trắc học vân tay (Fingerprint)
                  </div>
                  {hasFingerprint ? (
                    <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                      Quét dấu vân tay trên thiết bị chấm công chuyên dụng
                      {!allowedMethods.fingerprint && <span style={{ color: 'var(--text-disabled)', marginLeft: 6 }}>• Đang tạm tắt</span>}
                    </div>
                  ) : (
                    <div className="body-xs" style={{ color: '#b45309', fontWeight: 500, marginTop: 2 }}>
                      ⚠️ Chưa có dữ liệu vân tay — Cần lấy mẫu vân tay trực tiếp trên thiết bị Hikvision trước khi bật.
                    </div>
                  )}
                </div>
              </div>
              <Checkbox
                checked={hasFingerprint && allowedMethods.fingerprint}
                onChange={(checked) => setAllowedMethods((prev) => ({ ...prev, fingerprint: checked }))}
                disabled={isSubmitting || !hasFingerprint}
                aria-label={hasFingerprint ? 'Cho phép điểm danh bằng Vân tay' : 'Chưa có dữ liệu vân tay (bị khóa)'}
              />
            </div>

            {/* Phương thức 3: Thẻ nhân viên */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-10) var(--space-12)',
                backgroundColor: hasCard
                  ? (allowedMethods.card ? 'var(--primary-50)' : 'var(--bg-surface)')
                  : 'var(--bg-subtle)',
                border: `1px solid ${
                  hasCard
                    ? (allowedMethods.card ? 'var(--primary-200)' : 'var(--border-neutral-subtle)')
                    : 'var(--border-neutral-subtle)'
                }`,
                borderRadius: 'var(--radius-6)',
                opacity: hasCard ? 1 : 0.8,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-10)' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-6)',
                    backgroundColor: hasCard && allowedMethods.card ? 'var(--primary-100)' : 'var(--bg-surface)',
                    color: hasCard && allowedMethods.card ? 'var(--primary-700)' : 'var(--text-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name="id-badge" size={16} />
                </div>
                <div>
                  <div className="body-sm-medium" style={{ color: hasCard ? 'var(--text-heading)' : 'var(--text-subtle)' }}>
                    Thẻ nhân sự (RFID / NFC)
                  </div>
                  {hasCard ? (
                    <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                      Quẹt thẻ vật lý hoặc CCCD gắn chip tại đầu đọc thẻ
                      {!allowedMethods.card && <span style={{ color: 'var(--text-disabled)', marginLeft: 6 }}>• Đang tạm tắt</span>}
                    </div>
                  ) : (
                    <div className="body-xs" style={{ color: '#b45309', fontWeight: 500, marginTop: 2 }}>
                      ⚠️ Chưa cấp thẻ nhân sự — Cần cấp thẻ tại mục Quản lý thẻ trước khi bật.
                    </div>
                  )}
                </div>
              </div>
              <Checkbox
                checked={hasCard && allowedMethods.card}
                onChange={(checked) => setAllowedMethods((prev) => ({ ...prev, card: checked }))}
                disabled={isSubmitting || !hasCard}
                aria-label={hasCard ? 'Cho phép điểm danh bằng Thẻ nhân sự' : 'Chưa cấp thẻ nhân sự (bị khóa)'}
              />
            </div>
          </div>
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
          💡 <b>Lưu ý đồng bộ:</b> Ảnh khuôn mặt có thể nạp trực tiếp qua Portal để điểm danh Face ID và đồng bộ đến các thiết bị Camera AI. Thiết bị Hikvision chỉ bắt buộc khi đăng ký mẫu sinh trắc học vân tay.
        </div>
      </form>
    </SideSheet>
  );
};
