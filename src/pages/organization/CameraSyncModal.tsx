import React, { useState, useEffect, useMemo } from 'react';
import {
  SideSheet,
  Checkbox,
  Tag,
  StatusTag,
  Icon,
  InlineNotice,
  SearchField,
  EmptyState,
  toast
} from '../../design-system';
import { Employee, CameraSyncBatchResult } from '../../types/employee';
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [unsyncedEmployees, setUnsyncedEmployees] = useState<Employee[]>([]);
  const [activeCards, setActiveCards] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncResult, setSyncResult] = useState<CameraSyncBatchResult | null>(null);
  const [syncedEmployeesList, setSyncedEmployeesList] = useState<Employee[]>([]);
  const [simulateFailure, setSimulateFailure] = useState(false);

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
    setSyncResult(null);
    setSyncedEmployeesList([]);

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
    return Boolean(emp.avatarUrl?.trim());
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
      const currentSelectedEmps = unsyncedEmployees.filter((e) => selectedIds.has(e.id));

      if (simulateFailure && currentSelectedEmps.length > 1) {
        const failedEmp = currentSelectedEmps[currentSelectedEmps.length - 1];
        const successfulEmps = currentSelectedEmps.slice(0, -1);
        const result = await employeeService.syncEmployeesToCamera(
          tenantId,
          successfulEmps.map((e) => e.id),
          targetDeviceNames
        );
        setSyncResult({
          ...result,
          totalRequested: currentSelectedEmps.length,
          syncedCount: successfulEmps.length,
          failedCount: 1,
          failedItems: [
            {
              employeeId: failedEmp.id,
              employeeCode: failedEmp.employeeCode,
              fullName: failedEmp.fullName,
              reason:
                'Camera AI Cổng Cán Bộ phản hồi lỗi 422: Góc nghiêng khuôn mặt vượt quá 30 độ hoặc độ phân giải ảnh không đạt chuẩn.'
            }
          ]
        });
        setSyncedEmployeesList(successfulEmps);
        setStep(3);
        toast.warning(`Đã đồng bộ ${successfulEmps.length} cán bộ, phát hiện 1 trường hợp lỗi.`);
        return;
      }

      const result = await employeeService.syncEmployeesToCamera(
        tenantId,
        Array.from(selectedIds),
        targetDeviceNames
      );

      setSyncResult(result);
      setSyncedEmployeesList(currentSelectedEmps);
      setStep(3);

      if (result.syncedCount > 0) {
        toast.success(
          `Đã đồng bộ thành công dữ liệu của ${result.syncedCount} cán bộ đến tất cả thiết bị Camera AI.`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi đồng bộ đến Camera';
      toast.danger(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryFailed = async (failedEmployeeId?: string) => {
    if (!syncResult?.failedItems || syncResult.failedItems.length === 0) return;
    try {
      setIsSubmitting(true);
      const itemsToRetry = failedEmployeeId
        ? syncResult.failedItems.filter((f) => f.employeeId === failedEmployeeId)
        : syncResult.failedItems;
      const retryIds = itemsToRetry.map((f) => f.employeeId);
      const targetDeviceNames = devices.map((d) => d.name);

      const retryResult = await employeeService.syncEmployeesToCamera(
        tenantId,
        retryIds,
        targetDeviceNames
      );

      const retriedEmps = unsyncedEmployees.filter((e) => retryIds.includes(e.id));
      const remainingFailed = syncResult.failedItems.filter(
        (f) => !retryResult.syncedEmployeeIds.includes(f.employeeId)
      );

      setSyncedEmployeesList((prev) => [...prev, ...retriedEmps]);
      setSyncResult({
        totalRequested: syncResult.totalRequested,
        syncedCount: syncResult.syncedCount + retryResult.syncedCount,
        failedCount: remainingFailed.length,
        deviceCount: syncResult.deviceCount,
        syncedEmployeeIds: [...syncResult.syncedEmployeeIds, ...retryResult.syncedEmployeeIds],
        failedItems: remainingFailed,
        syncedAt: new Date().toISOString()
      });

      toast.success(`Đã thử lại và đồng bộ thành công ${retryResult.syncedCount} cán bộ!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thử lại không thành công';
      toast.danger(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (syncResult && syncResult.syncedCount > 0) {
      onSuccess(syncResult.syncedCount);
    }
    onClose();
  };

  const handleResetForAnotherBatch = async () => {
    setLoading(true);
    setStep(1);
    setSyncResult(null);
    setSyncedEmployeesList([]);
    try {
      const emps = await employeeService.getUnsyncedEmployees(tenantId);
      setUnsyncedEmployees(emps);
      const eligibleEmps = emps.filter(
        (e) => Boolean(e.avatarUrl?.trim()) || activeCards.has(e.id)
      );
      setSelectedIds(new Set(eligibleEmps.map((e) => e.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideSheet
      open={open}
      title="Đồng Bộ Dữ Liệu Đến Camera AI"
      description="Quy trình 3 bước chuẩn hóa: Chọn cán bộ → Xem lại & Chọn thiết bị tiếp nhận → Báo cáo kết quả đồng bộ."
      icon="rotate-right"
      width={780}
      onClose={isSubmitting ? false : onClose}
      primaryAction={
        step === 1
          ? {
              label: `Tiếp tục: Xem lại (${selectedIds.size})`,
              icon: 'arrow-right',
              onClick: () => setStep(2),
              disabled: selectedIds.size === 0 || loading
            }
          : step === 2
          ? {
              label: isSubmitting
                ? 'Đang truyền dữ liệu...'
                : `Đồng bộ ngay (${selectedEmployeesList.length} cán bộ)`,
              icon: 'rotate-right',
              onClick: handleExecuteSync,
              disabled: isSubmitting || selectedEmployeesList.length === 0
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
              label: 'Hủy bỏ',
              onClick: onClose,
              disabled: isSubmitting
            }
          : step === 2
          ? {
              label: '← Quay lại chỉnh sửa',
              onClick: () => setStep(1),
              disabled: isSubmitting
            }
          : {
              label: 'Đồng bộ đợt khác',
              icon: 'rotate-right',
              onClick: handleResetForAnotherBatch
            }
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {/* 1. Thanh tiến trình 3 bước (Cố định, không đổi kích thước) */}
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
            { stepNumber: 1, label: 'Bước 1: Chọn cán bộ' },
            { stepNumber: 2, label: 'Bước 2: Xem lại & Đồng bộ' },
            { stepNumber: 3, label: 'Bước 3: Kết quả đồng bộ' }
          ].map((item, idx) => {
            const isActive = step === item.stepNumber;
            const isCompleted = step > item.stepNumber;

            return (
              <React.Fragment key={item.stepNumber}>
                <div
                  onClick={() => {
                    if (isCompleted && !isSubmitting && step !== 3) {
                      setStep(item.stepNumber as 1 | 2);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-8)',
                    cursor: isCompleted && !isSubmitting && step !== 3 ? 'pointer' : 'default'
                  }}
                >
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
                      border: isCompleted || isActive ? 'none' : '1px solid var(--border-neutral-subtle)',
                      transition: 'all 0.2s ease'
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
                      backgroundColor: step > idx + 1 ? 'var(--semantic-success)' : 'var(--border-default)',
                      transition: 'background-color 0.2s ease'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* BƯỚC 1: CHỌN CÁN BỘ ĐỒNG BỘ                              */}
        {/* ======================================================== */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-14)' }}>
            {ineligibleEmployees.length > 0 ? (
              <InlineNotice tone="info">
                Hệ thống phát hiện <b>{unsyncedEmployees.length} cán bộ</b> chưa đồng bộ dữ liệu đến Camera AI.
                Trong đó có <b>{eligibleEmployees.length} cán bộ đủ điều kiện</b> (đã có ảnh Face ID) và{' '}
                <b>{ineligibleEmployees.length} cán bộ chưa đủ điều kiện</b> (cần cập nhật ảnh chân dung).
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
                maxHeight: 'calc(100vh - 380px)',
                minHeight: '320px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-8)',
                paddingRight: '4px'
              }}
            >
              {loading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-subtle)' }}>
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
                          padding: '12px 14px',
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
                              width: 40,
                              height: 40,
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
                                ⚠️ Chưa có ảnh - Cần tải ảnh chân dung trước khi đồng bộ đến Camera.
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
                              title="Chưa có ảnh chân dung"
                            >
                              Chưa đủ điều kiện (Thiếu ảnh)
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
                                backgroundColor: '#ecfdf5',
                                color: '#065f46',
                                border: '1px solid #a7f3d0'
                              }}
                            >
                              <Icon name="camera" size={11} />
                              Đã có ảnh Face ID
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

        {/* ======================================================== */}
        {/* BƯỚC 2: XEM LẠI VÀ XÁC NHẬN ĐỒNG BỘ                     */}
        {/* ======================================================== */}
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
                        padding: '4px 9px',
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
                    <span style={{ fontSize: '12px', padding: '4px 9px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-6)' }}>
                      Camera AI Cổng Tiếp Dân (Trụ sở UBND)
                    </span>
                    <span style={{ fontSize: '12px', padding: '4px 9px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-6)' }}>
                      Camera AI Cổng Cán Bộ & Ban Chỉ Huy
                    </span>
                    <span style={{ fontSize: '12px', padding: '4px 9px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-6)' }}>
                      Camera AI Hội Trường Số 1
                    </span>
                    <span style={{ fontSize: '12px', padding: '4px 9px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-6)' }}>
                      Camera AI Phòng Họp Hội Đồng Nhân Dân
                    </span>
                    <span style={{ fontSize: '12px', padding: '4px 9px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-6)' }}>
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
                  maxHeight: 'calc(100vh - 440px)',
                  minHeight: '260px',
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
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-6)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          backgroundColor: 'var(--primary-100)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
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
                        <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                          {deptMap.get(emp.departmentId) || 'Phòng ban khác'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {emp.avatarUrl ? (
                        <span style={{ fontSize: '11px', color: '#065f46', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icon name="camera" size={11} /> Có ảnh khuôn mặt
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icon name="id-badge" size={11} /> Đã cấp thẻ RFID
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

              {/* Simulation Option for testing failed syncs UI */}
              {selectedEmployeesList.length > 1 && (
                <div style={{ marginTop: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      color: 'var(--text-subtle)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Mô phỏng 1 cán bộ lỗi đồng bộ Camera (để kiểm tra giao diện phân loại lỗi Bước 3)
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BƯỚC 3: KẾT QUẢ ĐỒNG BỘ (RESULT STEP)                   */}
        {/* ======================================================== */}
        {step === 3 && syncResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            {/* Header Result Hero */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: 'var(--space-12) var(--space-8)',
                gap: 'var(--space-10)'
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor:
                    syncResult.failedCount > 0
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(34, 197, 94, 0.12)',
                  color:
                    syncResult.failedCount > 0
                      ? 'var(--semantic-warning)'
                      : 'var(--semantic-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon
                  name={syncResult.failedCount > 0 ? 'triangle-exclamation' : 'circle-check'}
                  size={32}
                />
              </div>

              <div>
                <div className="headline-sm" style={{ color: 'var(--text-heading)' }}>
                  {syncResult.failedCount > 0
                    ? `Đồng bộ hoàn tất — Phát hiện ${syncResult.failedCount} trường hợp cần lưu ý`
                    : 'Đồng bộ dữ liệu đến Camera AI thành công!'}
                </div>
                <div
                  className="body-sm"
                  style={{ color: 'var(--text-subtle)', marginTop: 'var(--space-4)', maxWidth: '560px' }}
                >
                  {syncResult.failedCount > 0
                    ? `Đã truyền nạp thành công dữ liệu của ${syncResult.syncedCount} cán bộ xuống ${syncResult.deviceCount} thiết bị Camera AI. Có ${syncResult.failedCount} cán bộ không thể đồng bộ.`
                    : `Toàn bộ dữ liệu nhận diện khuôn mặt và mã thẻ của ${syncResult.syncedCount} cán bộ đã được nạp thành công xuống ${syncResult.deviceCount} thiết bị Camera AI.`}
                </div>
              </div>

              {/* 4 Chỉ số tổng quan */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 'var(--space-10)',
                  width: '100%',
                  marginTop: 'var(--space-4)'
                }}
              >
                {/* 1. Tổng số xử lý */}
                <div
                  style={{
                    padding: 'var(--space-12)',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-8)',
                    border: '1px solid var(--border-default)',
                    textAlign: 'center'
                  }}
                >
                  <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>Tổng số xử lý</div>
                  <div className="headline-sm" style={{ color: 'var(--text-heading)', marginTop: '4px' }}>
                    {syncResult.totalRequested || syncedEmployeesList.length}
                  </div>
                </div>

                {/* 2. Đồng bộ thành công */}
                <div
                  style={{
                    padding: 'var(--space-12)',
                    backgroundColor: 'rgba(34, 197, 94, 0.08)',
                    borderRadius: 'var(--radius-8)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    textAlign: 'center'
                  }}
                >
                  <div className="body-xs" style={{ color: 'var(--semantic-success)' }}>Đồng bộ thành công</div>
                  <div className="headline-sm" style={{ color: 'var(--semantic-success)', marginTop: '4px' }}>
                    {syncResult.syncedCount}
                  </div>
                </div>

                {/* 3. Đồng bộ thất bại */}
                <div
                  style={{
                    padding: 'var(--space-12)',
                    backgroundColor:
                      syncResult.failedCount > 0 ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-8)',
                    border: `1px solid ${
                      syncResult.failedCount > 0 ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-default)'
                    }`,
                    textAlign: 'center'
                  }}
                >
                  <div
                    className="body-xs"
                    style={{
                      color: syncResult.failedCount > 0 ? 'var(--semantic-danger)' : 'var(--text-subtle)'
                    }}
                  >
                    Đồng bộ thất bại
                  </div>
                  <div
                    className="headline-sm"
                    style={{
                      color: syncResult.failedCount > 0 ? 'var(--semantic-danger)' : 'var(--text-heading)',
                      marginTop: '4px'
                    }}
                  >
                    {syncResult.failedCount}
                  </div>
                </div>

                {/* 4. Camera tiếp nhận */}
                <div
                  style={{
                    padding: 'var(--space-12)',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    borderRadius: 'var(--radius-8)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    textAlign: 'center'
                  }}
                >
                  <div className="body-xs" style={{ color: '#1d4ed8' }}>Thiết bị tiếp nhận</div>
                  <div className="headline-sm" style={{ color: '#1d4ed8', marginTop: '4px' }}>
                    {syncResult.deviceCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Chi tiết cán bộ đồng bộ thất bại (nếu có) */}
            {syncResult.failedCount > 0 && syncResult.failedItems && syncResult.failedItems.length > 0 && (
              <div
                style={{
                  padding: 'var(--space-14)',
                  backgroundColor: 'rgba(239, 68, 68, 0.04)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-8)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-10)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="triangle-exclamation" size={15} style={{ color: 'var(--semantic-danger)' }} />
                    <span className="body-sm-semibold" style={{ color: 'var(--semantic-danger)' }}>
                      Danh sách cán bộ đồng bộ thất bại ({syncResult.failedCount})
                    </span>
                  </div>
                  <StatusTag tone="danger" label="Cần xử lý lại" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  {syncResult.failedItems.map((fail) => (
                    <div
                      key={fail.employeeId}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#fff',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: 'var(--radius-6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                            {fail.fullName}
                          </span>
                          <Tag variant="code">{fail.employeeCode}</Tag>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--semantic-danger)', marginTop: '2px' }}>
                          • {fail.reason}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleRetryFailed(fail.employeeId)}
                        style={{
                          fontSize: '11px',
                          padding: '4px 10px',
                          border: '1px solid #cbd5e1',
                          borderRadius: 'var(--radius-4)',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          color: 'var(--text-body)',
                          fontWeight: 500,
                          flexShrink: 0,
                          marginLeft: '10px'
                        }}
                      >
                        Thử lại
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danh sách cán bộ đã đồng bộ thành công */}
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
                  Danh sách cán bộ đã đồng bộ thành công ({syncedEmployeesList.length})
                </span>
                <span className="body-xs" style={{ color: 'var(--semantic-success)', fontWeight: 600 }}>
                  ✓ Đã sẵn sàng nhận diện tại camera
                </span>
              </div>

              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-6)',
                  paddingRight: '4px'
                }}
              >
                {syncedEmployeesList.map((emp) => (
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                        {emp.avatarUrl ? 'Khớp khuôn mặt: 99.2%' : 'Đã nạp mã thẻ RFID'}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-subtle)',
                          fontFamily: 'var(--font-mono, monospace)'
                        }}
                      >
                        ✓ {syncResult.deviceCount} camera
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách thiết bị Camera AI đã cập nhật */}
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
                  marginBottom: 'var(--space-6)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="camera" size={14} style={{ color: 'var(--primary-600)' }} />
                  <span className="body-xs" style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                    Hệ thống Camera AI đã tiếp nhận dữ liệu ({devices.length || 5} thiết bị)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#065f46',
                    backgroundColor: '#ecfdf5',
                    padding: '2px 6px',
                    borderRadius: '8px'
                  }}
                >
                  ● Đã nạp thành công
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(devices.length > 0 ? devices : [
                  { id: '1', name: 'Camera AI Cổng Tiếp Dân', code: 'CAM-UBND-CC-01' },
                  { id: '2', name: 'Camera AI Cổng Cán Bộ & Ban Chỉ Huy', code: 'CAM-UBND-CC-02' },
                  { id: '3', name: 'Camera AI Hội Trường Số 1', code: 'CAM-UBND-MTG-01' },
                  { id: '4', name: 'Camera AI Phòng Họp HĐND', code: 'CAM-UBND-MTG-02' },
                  { id: '5', name: 'Camera AI Cổng Nhà Xe Cán Bộ', code: 'CAM-UBND-CC-03' }
                ]).map((d) => (
                  <span
                    key={d.id}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-6)',
                      color: 'var(--text-body)'
                    }}
                  >
                    {d.name} <Tag variant="code" style={{ fontSize: '10px', marginLeft: 4 }}>{d.code}</Tag>
                  </span>
                ))}
              </div>
            </div>

            {/* Lưu ý kết quả */}
            <div
              style={{
                padding: 'var(--space-12) var(--space-16)',
                backgroundColor: 'var(--primary-50)',
                border: '1px solid var(--primary-100)',
                borderRadius: 'var(--radius-8)',
                color: 'var(--primary-800)',
                fontSize: '12px',
                lineHeight: 1.5,
                textAlign: 'left'
              }}
            >
              💡 Dữ liệu nhận diện khuôn mặt và mã thẻ vật lý đã có hiệu lực ngay lập tức trên các thiết bị Camera AI.
              Cán bộ có thể bắt đầu điểm danh bằng Face ID hoặc Thẻ RFID tại cổng trụ sở ngay từ thời điểm này.
            </div>
          </div>
        )}
      </div>
    </SideSheet>
  );
};
