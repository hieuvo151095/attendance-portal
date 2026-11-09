import React, { useState, useEffect, useMemo } from 'react';
import {
  PopupModal,
  Checkbox,
  Tag,
  Icon,
  InlineNotice,
  SearchField,
  EmptyState,
  toast
} from '../../design-system';
import { Employee } from '../../types/employee';
import { Department } from '../../types/organization';
import { employeeService } from '../../services/employee';
import { deviceService } from '../../services/device';
import { cardService } from '../../services/card';
import { CameraDevice } from '../../types/device';

export interface CameraSyncModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  departments: Department[];
  onSuccess: (count: number) => void;
}

export const CameraSyncModal: React.FC<CameraSyncModalProps> = ({
  open,
  onClose,
  tenantId,
  departments,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [unsyncedEmployees, setUnsyncedEmployees] = useState<Employee[]>([]);
  const [activeCards, setActiveCards] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deptMap = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [departments]);

  useEffect(() => {
    if (!open) return;

    setStep(1);
    setSearchTerm('');
    setLoading(true);

    Promise.all([
      employeeService.getUnsyncedEmployees(tenantId),
      deviceService.getDevicesByTenant(tenantId),
      cardService.getCardsByTenant(tenantId)
    ])
      .then(([emps, devList, cardList]) => {
        setUnsyncedEmployees(emps);
        const cardSet = new Set(
          cardList.filter((c) => c.status !== 'revoked').map((c) => c.employeeId)
        );
        setActiveCards(cardSet);
        // Quy tắc: Chỉ tự động chọn những cán bộ ĐỦ ĐIỀU KIỆN (có ảnh hoặc có mã thẻ)
        const eligibleEmps = emps.filter(
          (e) => Boolean(e.avatarUrl?.trim()) || cardSet.has(e.id)
        );
        setSelectedIds(new Set(eligibleEmps.map((e) => e.id)));
        setDevices(devList.filter((d) => d.status === 'active'));
      })
      .catch((err) => {
        console.error('Lỗi nạp danh sách chưa đồng bộ:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, tenantId]);

  const isEmployeeEligible = (emp: Employee) => {
    return Boolean(emp.avatarUrl?.trim()) || activeCards.has(emp.id);
  };

  const eligibleEmployees = useMemo(() => {
    return unsyncedEmployees.filter(isEmployeeEligible);
  }, [unsyncedEmployees, activeCards]);

  const ineligibleEmployees = useMemo(() => {
    return unsyncedEmployees.filter((e) => !isEmployeeEligible(e));
  }, [unsyncedEmployees, activeCards]);

  const filteredUnsynced = useMemo(() => {
    if (!searchTerm.trim()) return unsyncedEmployees;
    const term = searchTerm.toLowerCase().trim();
    return unsyncedEmployees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(term) ||
        e.employeeCode.toLowerCase().includes(term) ||
        e.identityNumber.toLowerCase().includes(term)
    );
  }, [unsyncedEmployees, searchTerm]);

  const filteredEligible = useMemo(() => {
    return filteredUnsynced.filter(isEmployeeEligible);
  }, [filteredUnsynced, activeCards]);

  const allFilteredEligibleSelected =
    filteredEligible.length > 0 &&
    filteredEligible.every((e) => selectedIds.has(e.id));

  const handleToggleSelectAll = (checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      filteredEligible.forEach((e) => next.add(e.id));
    } else {
      filteredEligible.forEach((e) => next.delete(e.id));
    }
    setSelectedIds(next);
  };

  const handleToggleEmployee = (emp: Employee, checked: boolean) => {
    if (!isEmployeeEligible(emp)) return;
    const next = new Set(selectedIds);
    if (checked) {
      next.add(emp.id);
    } else {
      next.delete(emp.id);
    }
    setSelectedIds(next);
  };

  const handleRemoveFromStep2 = (id: string) => {
    const next = new Set(selectedIds);
    next.delete(id);
    setSelectedIds(next);
    if (next.size === 0) {
      setStep(1);
    }
  };

  const selectedEmployeesList = useMemo(() => {
    return unsyncedEmployees.filter((e) => selectedIds.has(e.id));
  }, [unsyncedEmployees, selectedIds]);

  const handleExecuteSync = async () => {
    if (selectedIds.size === 0) return;

    try {
      setIsSubmitting(true);
      const targetDeviceNames = devices.map((d) => d.name);
      const result = await employeeService.syncEmployeesToCamera(
        tenantId,
        Array.from(selectedIds),
        targetDeviceNames
      );

      toast.success(
        `Đã đồng bộ thành công dữ liệu của ${result.syncedCount} cán bộ đến tất cả thiết bị Camera AI.`
      );
      onSuccess(result.syncedCount);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi đồng bộ đến Camera';
      toast.danger(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PopupModal
      open={open}
      icon="rotate-right"
      title="Đồng Bộ Dữ Liệu Đến Camera AI"
      description="Quy trình 2 bước truyền nạp thông tin nhân sự và dữ liệu khuôn mặt xuống hệ thống Camera AI."
      width={720}
      onClose={() => !isSubmitting && onClose()}
      primaryAction={
        step === 1
          ? {
              label: `Tiếp tục: Xem lại (${selectedIds.size})`,
              icon: 'arrow-right',
              onClick: () => setStep(2),
              disabled: selectedIds.size === 0 || loading
            }
          : {
              label: isSubmitting
                ? 'Đang truyền dữ liệu...'
                : `Đồng bộ ngay (${selectedIds.size} cán bộ)`,
              icon: 'rotate-right',
              onClick: handleExecuteSync,
              disabled: isSubmitting || selectedIds.size === 0
            }
      }
      secondaryAction={
        step === 1
          ? {
              label: 'Hủy bỏ',
              onClick: onClose,
              disabled: isSubmitting
            }
          : {
              label: '← Quay lại chỉnh sửa',
              onClick: () => setStep(1),
              disabled: isSubmitting
            }
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {/* Step Indicator Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            border: '1px solid var(--border-neutral-subtle)',
            borderRadius: 'var(--radius-8)',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-subtle)'
          }}
        >
          {/* Step 1 Pill */}
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={isSubmitting}
            style={{
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: step === 1 ? 'var(--primary-50)' : 'transparent',
              border: 'none',
              borderRight: '1px solid var(--border-neutral-subtle)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: step === 1 ? 'var(--primary-600)' : 'var(--bg-surface)',
                color: step === 1 ? '#ffffff' : 'var(--text-subtle)',
                border: step === 1 ? 'none' : '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              1
            </div>
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: step === 1 ? 700 : 500,
                  color: step === 1 ? 'var(--primary-800)' : 'var(--text-body)'
                }}
              >
                Bước 1: Chọn cán bộ
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                Kiểm tra & bỏ chọn người chưa cần đồng bộ
              </div>
            </div>
          </button>

          {/* Step 2 Pill */}
          <button
            type="button"
            onClick={() => selectedIds.size > 0 && setStep(2)}
            disabled={isSubmitting || selectedIds.size === 0}
            style={{
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: step === 2 ? 'var(--primary-50)' : 'transparent',
              border: 'none',
              cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed',
              textAlign: 'left',
              opacity: selectedIds.size === 0 ? 0.6 : 1,
              transition: 'background-color 0.15s ease'
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: step === 2 ? 'var(--primary-600)' : 'var(--bg-surface)',
                color: step === 2 ? '#ffffff' : 'var(--text-subtle)',
                border: step === 2 ? 'none' : '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              2
            </div>
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: step === 2 ? 700 : 500,
                  color: step === 2 ? 'var(--primary-800)' : 'var(--text-body)'
                }}
              >
                Bước 2: Xem lại & Đồng bộ
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                Xác nhận danh sách và camera tiếp nhận
              </div>
            </div>
          </button>
        </div>

        {/* STEP 1: KIỂM TRA DANH SÁCH CHƯA ĐỒNG BỘ */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {ineligibleEmployees.length > 0 ? (
              <InlineNotice tone="info">
                Hệ thống phát hiện <b>{unsyncedEmployees.length} cán bộ</b> chưa đồng bộ dữ liệu đến Camera AI.
                Trong đó có <b>{eligibleEmployees.length} cán bộ đủ điều kiện</b> (đã có ảnh Face ID hoặc thẻ RFID) và{' '}
                <b>{ineligibleEmployees.length} cán bộ chưa đủ điều kiện</b> (cần cập nhật ảnh chân dung hoặc cấp thẻ trước khi đồng bộ).
              </InlineNotice>
            ) : (
              <InlineNotice tone="info">
                Hệ thống phát hiện <b>{unsyncedEmployees.length} cán bộ</b> chưa được đồng bộ dữ liệu
                đến Camera AI. Quản trị viên vui lòng kiểm tra danh sách và bỏ chọn cán bộ nếu chưa muốn đồng bộ ngay.
              </InlineNotice>
            )}

            {/* Filter & Select all bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-10) var(--space-14)',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-8)',
                border: '1px solid var(--border-neutral-subtle)',
                flexWrap: 'wrap',
                gap: 'var(--space-8)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-10)' }}>
                <Checkbox
                  checked={allFilteredEligibleSelected}
                  onChange={handleToggleSelectAll}
                  disabled={filteredEligible.length === 0}
                  aria-label="Chọn tất cả cán bộ đủ điều kiện trong danh sách"
                />
                <span className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                  Chọn tất cả{' '}
                  <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
                    ({selectedIds.size}/{filteredEligible.length} cán bộ đủ điều kiện đã chọn)
                  </span>
                </span>
              </div>

              <SearchField
                placeholder="Tìm theo tên, mã NV..."
                value={searchTerm}
                onChange={(val) => setSearchTerm(val)}
                width={240}
              />
            </div>

            {/* Unsynced Employees List */}
            <div
              style={{
                maxHeight: '340px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-8)',
                paddingRight: '4px'
              }}
            >
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                  Đang tải danh sách cán bộ chưa đồng bộ...
                </div>
              ) : filteredUnsynced.length === 0 ? (
                <EmptyState
                  label={
                    searchTerm
                      ? 'Không tìm thấy cán bộ phù hợp với từ khóa tìm kiếm.'
                      : 'Toàn bộ hồ sơ nhân sự hiện đã được đồng bộ đầy đủ đến hệ thống Camera AI.'
                  }
                  icon="circle-check"
                />
              ) : (
                filteredUnsynced
                  .slice()
                  .sort((a, b) => {
                    const aEligible = isEmployeeEligible(a) ? 1 : 0;
                    const bEligible = isEmployeeEligible(b) ? 1 : 0;
                    return bEligible - aEligible;
                  })
                  .map((emp) => {
                    const eligible = isEmployeeEligible(emp);
                    const isChecked = selectedIds.has(emp.id);
                    const hasPhoto = Boolean(emp.avatarUrl?.trim());
                    const hasCard = activeCards.has(emp.id);

                    return (
                      <div
                        key={emp.id}
                        onClick={() => eligible && handleToggleEmployee(emp, !isChecked)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: !eligible
                            ? 'var(--bg-subtle)'
                            : isChecked
                            ? 'var(--primary-50)'
                            : 'var(--bg-surface)',
                          border: `1px solid ${
                            !eligible
                              ? 'var(--border-neutral-subtle)'
                              : isChecked
                              ? 'var(--primary-200)'
                              : 'var(--border-neutral-subtle)'
                          }`,
                          borderRadius: 'var(--radius-8)',
                          cursor: eligible ? 'pointer' : 'not-allowed',
                          opacity: eligible ? 1 : 0.75,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                          <span onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <Checkbox
                              checked={eligible && isChecked}
                              onChange={(checked) => eligible && handleToggleEmployee(emp, checked)}
                              disabled={!eligible}
                              aria-label={
                                eligible
                                  ? `Chọn cán bộ ${emp.fullName}`
                                  : `Cán bộ ${emp.fullName} chưa đủ điều kiện đồng bộ`
                              }
                            />
                          </span>

                          {/* Avatar */}
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              backgroundColor: eligible ? 'var(--primary-100)' : 'var(--bg-subtle)',
                              color: eligible ? 'var(--primary-700)' : 'var(--text-disabled)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '14px',
                              flexShrink: 0,
                              border: '1px solid var(--border-default)'
                            }}
                          >
                            {emp.avatarUrl ? (
                              <img
                                src={emp.avatarUrl}
                                alt={emp.fullName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              emp.fullName.slice(0, 1)
                            )}
                          </div>

                          {/* Info */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="body-sm-semibold" style={{ color: 'var(--text-heading)' }}>
                                {emp.fullName}
                              </span>
                              <Tag variant="code">{emp.employeeCode}</Tag>
                            </div>
                            <div
                              style={{
                                fontSize: '12px',
                                color: 'var(--text-subtle)',
                                marginTop: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <span>{emp.position}</span>
                              <span>•</span>
                              <span>{deptMap.get(emp.departmentId) || 'Phòng ban khác'}</span>
                            </div>
                            {!eligible && (
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: '#b91c1c',
                                  marginTop: '4px',
                                  fontWeight: 500
                                }}
                              >
                                ⚠️ Cần tải ảnh chân dung hoặc cấp thẻ nhân sự trước khi đồng bộ đến Camera.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Photo & Sync Status Tag */}
                        <div>
                          {!eligible ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                backgroundColor: '#fef2f2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca'
                              }}
                              title="Chưa có ảnh chân dung và chưa được cấp thẻ nhân sự"
                            >
                              Chưa đủ điều kiện (Thiếu ảnh & thẻ)
                            </span>
                          ) : hasPhoto && hasCard ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                backgroundColor: '#ecfdf5',
                                color: '#065f46',
                                border: '1px solid #a7f3d0'
                              }}
                            >
                              <Icon name="camera" size={11} />
                              Đã có ảnh Face ID & Thẻ
                            </span>
                          ) : hasPhoto ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                backgroundColor: '#ecfdf5',
                                color: '#065f46',
                                border: '1px solid #a7f3d0'
                              }}
                            >
                              <Icon name="camera" size={11} />
                              Đã có ảnh Face ID
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe'
                              }}
                            >
                              <Icon name="id-badge" size={11} />
                              Đã cấp thẻ RFID (Quẹt thẻ)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* STEP 2: XEM LẠI VÀ XÁC NHẬN ĐỒNG BỘ */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-14)' }}>
            <InlineNotice tone="success">
              Đã sẵn sàng truyền nạp dữ liệu của <b>{selectedEmployeesList.length} cán bộ</b> xuống{' '}
              <b>{devices.length || 5} thiết bị Camera AI</b> đang hoạt động.
            </InlineNotice>

            {/* Target Camera AI Devices Card */}
            <div
              style={{
                padding: 'var(--space-12) var(--space-14)',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-8)',
                border: '1px solid var(--border-neutral-subtle)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-8)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="camera" size={15} style={{ color: 'var(--primary-600)' }} />
                  <span className="body-sm-semibold" style={{ color: 'var(--text-heading)' }}>
                    Thiết bị Camera AI tiếp nhận dữ liệu ({devices.length || 5} thiết bị)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#065f46',
                    backgroundColor: '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}
                >
                  ● Trực tuyến
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {devices.length > 0 ? (
                  devices.map((d) => (
                    <span
                      key={d.id}
                      style={{
                        fontSize: '12px',
                        padding: '3px 8px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-6)',
                        color: 'var(--text-body)'
                      }}
                    >
                      {d.name} <Tag variant="code" style={{ fontSize: '10px', marginLeft: 4 }}>{d.code}</Tag>
                    </span>
                  ))
                ) : (
                  <>
                    <span style={{ fontSize: '12px', padding: '3px 8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-6)' }}>
                      Camera AI Cổng Tiếp Dân (Trụ sở UBND)
                    </span>
                    <span style={{ fontSize: '12px', padding: '3px 8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-6)' }}>
                      Camera AI Cổng Cán Bộ & Ban Chỉ Huy
                    </span>
                    <span style={{ fontSize: '12px', padding: '3px 8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-6)' }}>
                      Camera AI Hội Trường Số 1
                    </span>
                    <span style={{ fontSize: '12px', padding: '3px 8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-6)' }}>
                      Camera AI Phòng Họp Hội Đồng Nhân Dân
                    </span>
                    <span style={{ fontSize: '12px', padding: '3px 8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-6)' }}>
                      Camera AI Cổng Khu Vực Cửa Sau
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Selected Employees Review List */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-8)'
                }}
              >
                <span className="body-sm-semibold" style={{ color: 'var(--text-heading)' }}>
                  Danh sách cán bộ được duyệt đồng bộ ({selectedEmployeesList.length})
                </span>
                <span className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                  Bấm dấu ✕ nếu muốn loại bỏ cán bộ khỏi đợt đồng bộ này
                </span>
              </div>

              <div
                style={{
                  maxHeight: '230px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-6)',
                  paddingRight: '4px'
                }}
              >
                {selectedEmployeesList.map((emp) => (
                  <div
                    key={emp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-6)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          backgroundColor: 'var(--primary-100)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--primary-700)',
                          flexShrink: 0
                        }}
                      >
                        {emp.avatarUrl ? (
                          <img
                            src={emp.avatarUrl}
                            alt={emp.fullName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          emp.fullName.slice(0, 1)
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                            {emp.fullName}
                          </span>
                          <Tag variant="code" style={{ fontSize: '10px' }}>{emp.employeeCode}</Tag>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                          {deptMap.get(emp.departmentId) || 'Phòng ban khác'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {emp.avatarUrl ? (
                        <span style={{ fontSize: '11px', color: '#065f46', fontWeight: 500 }}>
                          Có ảnh khuôn mặt
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#92400e', fontWeight: 500 }}>
                          Chưa có ảnh (chỉ hồ sơ)
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFromStep2(emp.id)}
                        title="Bỏ cán bộ này khỏi đợt đồng bộ"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-disabled)',
                          padding: '4px',
                          borderRadius: 'var(--radius-4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon name="xmark" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PopupModal>
  );
};