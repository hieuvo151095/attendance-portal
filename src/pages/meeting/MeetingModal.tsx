import React, { useState, useEffect } from 'react';
import {
  PopupModal,
  TextField,
  Button,
  InlineNotice,
  Avatar,
  Tag,
  Checkbox
} from '../../design-system';
import { Meeting, CreateMeetingDTO, UpdateMeetingDTO, AttendeeRole } from '../../types/meeting';
import { Employee } from '../../types/employee';
import { Department } from '../../types/organization';
import { meetingService } from '../../services/meeting';
import { employeeService } from '../../services/employee';
import { departmentService } from '../../services/department';

export interface MeetingModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  meetingToEdit?: Meeting | null;
  onSuccess: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({
  open,
  onClose,
  tenantId,
  meetingToEdit,
  onSuccess
}) => {
  const isEditing = Boolean(meetingToEdit);

  // Form fields
  const [title, setTitle] = useState('');
  const [roomName, setRoomName] = useState('Hội trường số 1 - Tầng 2 Trụ sở');
  const [hostName, setHostName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  // Attendees selection: map employeeId -> { selected: boolean; role: AttendeeRole }
  const [selectedAttendees, setSelectedAttendees] = useState<
    Map<string, { selected: boolean; role: AttendeeRole }>
  >(new Map());

  // Master data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [attendeeSearch, setAttendeeSearch] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format ISO string to datetime-local value (YYYY-MM-DDTHH:mm)
  const toDateTimeLocal = (isoString?: string): string => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const mins = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${mins}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (!open) return;

    setError(null);

    Promise.all([
      employeeService.getEmployeesByTenant(tenantId),
      departmentService.getDepartmentsByTenant(tenantId)
    ]).then(([empList, deptList]) => {
      setEmployees(empList);
      setDepartments(deptList);

      const map = new Map<string, { selected: boolean; role: AttendeeRole }>();

      if (meetingToEdit) {
        setTitle(meetingToEdit.title);
        setRoomName(meetingToEdit.roomName);
        setHostName(meetingToEdit.hostName || '');
        setStartTime(toDateTimeLocal(meetingToEdit.startTime));
        setEndTime(toDateTimeLocal(meetingToEdit.endTime));
        setDescription(meetingToEdit.description || '');

        // Populate attendees
        meetingToEdit.attendees.forEach((att) => {
          map.set(att.employeeId, { selected: true, role: att.role });
        });
      } else {
        // Defaults for new meeting
        setTitle('');
        setRoomName('Hội trường số 1 - Tầng 2 Trụ sở');
        setHostName(empList[0] ? `${empList[0].fullName} - ${empList[0].position}` : '');
        setDescription('');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(8, 0, 0, 0);
        const endTomorrow = new Date(tomorrow);
        endTomorrow.setHours(10, 30, 0, 0);

        setStartTime(toDateTimeLocal(tomorrow.toISOString()));
        setEndTime(toDateTimeLocal(endTomorrow.toISOString()));

        // Pre-select first 2 employees as required
        empList.slice(0, 2).forEach((e) => {
          map.set(e.id, { selected: true, role: 'required' });
        });
      }

      setSelectedAttendees(map);
    });
  }, [open, tenantId, meetingToEdit]);

  const departmentMap = new Map<string, string>();
  departments.forEach((d) => departmentMap.set(d.id, d.name));

  // Quick department select / deselect
  const handleSelectDepartment = (deptId: string) => {
    const deptEmployees = employees.filter((e) => e.departmentId === deptId);
    if (deptEmployees.length === 0) return;

    const newMap = new Map(selectedAttendees);
    const allSelectedInDept = deptEmployees.every((e) => newMap.get(e.id)?.selected);

    deptEmployees.forEach((e) => {
      if (allSelectedInDept) {
        // Deselect all
        newMap.delete(e.id);
      } else {
        // Select all as required
        newMap.set(e.id, { selected: true, role: newMap.get(e.id)?.role || 'required' });
      }
    });

    setSelectedAttendees(newMap);
  };

  const handleToggleAttendee = (employeeId: string) => {
    const newMap = new Map(selectedAttendees);
    const curr = newMap.get(employeeId);
    if (curr?.selected) {
      newMap.delete(employeeId);
    } else {
      newMap.set(employeeId, { selected: true, role: 'required' });
    }
    setSelectedAttendees(newMap);
  };

  const handleChangeRole = (employeeId: string, role: AttendeeRole) => {
    const newMap = new Map(selectedAttendees);
    const curr = newMap.get(employeeId);
    if (curr) {
      newMap.set(employeeId, { ...curr, role });
      setSelectedAttendees(newMap);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError('Tiêu đề cuộc họp không được để trống.');
      return;
    }
    if (!roomName.trim()) {
      setError('Tên phòng họp không được để trống.');
      return;
    }
    if (!startTime) {
      setError('Thời điểm bắt đầu cuộc họp không được để trống.');
      return;
    }
    if (!endTime) {
      setError('Thời điểm kết thúc cuộc họp không được để trống.');
      return;
    }

    const startIso = new Date(startTime).toISOString();
    const endIso = new Date(endTime).toISOString();

    if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
      setError('Thời điểm kết thúc phải sau thời điểm bắt đầu cuộc họp.');
      return;
    }

    const attendeesList = Array.from(selectedAttendees.entries())
      .filter(([_, val]) => val.selected)
      .map(([empId, val]) => ({
        employeeId: empId,
        role: val.role
      }));

    if (attendeesList.length === 0) {
      setError('Cuộc họp bắt buộc phải triệu tập ít nhất 1 đại biểu tham dự.');
      return;
    }

    try {
      setSubmitting(true);
      if (isEditing && meetingToEdit) {
        const updateDto: UpdateMeetingDTO = {
          title: title.trim(),
          roomName: roomName.trim(),
          hostName: hostName.trim(),
          description: description.trim(),
          startTime: startIso,
          endTime: endIso,
          attendees: attendeesList
        };
        await meetingService.updateMeeting(tenantId, meetingToEdit.id, updateDto);
      } else {
        const createDto: CreateMeetingDTO = {
          title: title.trim(),
          roomName: roomName.trim(),
          hostName: hostName.trim(),
          description: description.trim(),
          startTime: startIso,
          endTime: endIso,
          attendees: attendeesList
        };
        await meetingService.createMeeting(tenantId, createDto);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi lưu cuộc họp.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter employees for the selection list
  const filteredEmployees = employees.filter((e) => {
    if (!attendeeSearch.trim()) return true;
    const term = attendeeSearch.trim().toLowerCase();
    return (
      e.fullName.toLowerCase().includes(term) ||
      e.employeeCode.toLowerCase().includes(term) ||
      e.position.toLowerCase().includes(term) ||
      (departmentMap.get(e.departmentId) || '').toLowerCase().includes(term)
    );
  });

  const selectedCount = Array.from(selectedAttendees.values()).filter((v) => v.selected).length;
  const requiredCount = Array.from(selectedAttendees.values()).filter(
    (v) => v.selected && v.role === 'required'
  ).length;
  const optionalCount = selectedCount - requiredCount;

  return (
    <PopupModal
      open={open}
      title={isEditing ? 'Cập nhật lịch cuộc họp' : 'Thiết lập cuộc họp mới'}
      description="Đặc tả MTG-01: Nhập thông tin phòng họp, thời gian và triệu tập danh sách đại biểu theo phòng ban."
      icon="calendar-plus"
      width={780}
      onClose={onClose}
      primaryAction={{
        label: submitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo cuộc họp',
        icon: isEditing ? 'check' : 'plus',
        onClick: handleSubmit,
        disabled: submitting
      }}
      secondaryAction={{
        label: 'Hủy',
        onClick: onClose,
        disabled: submitting
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {error && <InlineNotice tone="danger" label={error} />}

        {/* 1. Basic Meeting Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          <TextField
            id="meeting-title"
            label="Tiêu đề cuộc họp"
            required
            placeholder="VD: Họp Giao Ban Thường Kỳ Tháng 11/2026"
            value={title}
            onChange={(val) => setTitle(val)}
            disabled={submitting}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
            <TextField
              id="meeting-room"
              label="Tên phòng họp"
              required
              placeholder="VD: Hội trường số 1 - Tầng 2"
              value={roomName}
              onChange={(val) => setRoomName(val)}
              disabled={submitting}
            />

            <TextField
              id="meeting-host"
              label="Người chủ trì"
              placeholder="VD: Đ/c Nguyễn Văn An - Chủ tịch UBND"
              value={hostName}
              onChange={(val) => setHostName(val)}
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
            <div>
              <label
                htmlFor="meeting-start"
                className="body-sm-medium"
                style={{ display: 'block', marginBottom: 'var(--space-6)', color: 'var(--text-heading)' }}
              >
                Thời gian bắt đầu dự kiến <span style={{ color: 'var(--semantic-danger)' }}>*</span>
              </label>
              <input
                id="meeting-start"
                type="datetime-local"
                className="ecomd-input body-sm"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-8)',
                  backgroundColor: 'var(--bg-surface)'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="meeting-end"
                className="body-sm-medium"
                style={{ display: 'block', marginBottom: 'var(--space-6)', color: 'var(--text-heading)' }}
              >
                Thời gian kết thúc dự kiến <span style={{ color: 'var(--semantic-danger)' }}>*</span>
              </label>
              <input
                id="meeting-end"
                type="datetime-local"
                className="ecomd-input body-sm"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: 'var(--space-8) var(--space-12)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-8)',
                  backgroundColor: 'var(--bg-surface)'
                }}
              />
            </div>
          </div>

          <TextField
            id="meeting-desc"
            label="Nội dung / Mục đích cuộc họp"
            placeholder="VD: Họp đánh giá tiến độ quý 4 và triển khai kế hoạch năm mới"
            value={description}
            onChange={(val) => setDescription(val)}
            disabled={submitting}
          />
        </div>

        {/* 2. Attendee Selection & Department Quick Select */}
        <div
          style={{
            borderTop: '1px solid var(--border-default)',
            paddingTop: 'var(--space-16)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-12)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="body-sm-bold" style={{ color: 'var(--text-heading)' }}>
                Triệu Tập Danh Sách Đại Biểu <span style={{ color: 'var(--semantic-danger)' }}>*</span>
              </div>
              <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                Chọn đại biểu bắt buộc hoặc tùy chọn tham dự cuộc họp.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
              <Tag variant={selectedCount > 0 ? 'success' : 'default'}>
                Đã chọn: {selectedCount} đại biểu ({requiredCount} bắt buộc, {optionalCount} tùy chọn)
              </Tag>
            </div>
          </div>

          {/* Quick Select by Department Buttons */}
          <div>
            <div
              className="body-xs-bold"
              style={{ marginBottom: 'var(--space-6)', color: 'var(--text-subtle)' }}
            >
              Chọn nhanh theo phòng ban:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
              {departments.map((dept) => {
                const deptEmps = employees.filter((e) => e.departmentId === dept.id);
                const allSel =
                  deptEmps.length > 0 &&
                  deptEmps.every((e) => selectedAttendees.get(e.id)?.selected);

                return (
                  <Button
                    key={dept.id}
                    variant={allSel ? 'secondary' : 'ghost'}
                    active={allSel}
                    icon={allSel ? 'check' : 'plus'}
                    onClick={() => handleSelectDepartment(dept.id)}
                  >
                    {dept.name} ({deptEmps.length})
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Search attendee input */}
          <TextField
            id="search-attendee"
            placeholder="Tìm đại biểu theo tên, mã NV, chức vụ..."
            value={attendeeSearch}
            onChange={(val) => setAttendeeSearch(val)}
            prefixIcon="magnifying-glass"
          />

          {/* Attendee Selection List */}
          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-8)',
              backgroundColor: 'var(--bg-surface)'
            }}
          >
            {filteredEmployees.length === 0 ? (
              <div style={{ padding: 'var(--space-20)', textAlign: 'center' }}>
                <span className="body-xs" style={{ color: 'var(--text-muted)' }}>
                  Không tìm thấy nhân viên nào phù hợp
                </span>
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const isSelected = selectedAttendees.get(emp.id)?.selected || false;
                const role = selectedAttendees.get(emp.id)?.role || 'required';

                return (
                  <div
                    key={emp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-8) var(--space-12)',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleAttendee(emp.id)}
                        aria-label={`Chọn ${emp.fullName}`}
                      />
                      <Avatar src={emp.avatarUrl} name={emp.fullName} size="sm" />
                      <div>
                        <div className="body-sm-medium" style={{ color: 'var(--text-heading)' }}>
                          {emp.fullName}{' '}
                          <Tag variant="code" style={{ marginLeft: 'var(--space-4)' }}>
                            {emp.employeeCode}
                          </Tag>
                        </div>
                        <div className="body-xs" style={{ color: 'var(--text-subtle)' }}>
                          {emp.position} • {departmentMap.get(emp.departmentId) || 'Phòng ban khác'}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                        <select
                          className="ecomd-select body-xs"
                          value={role}
                          onChange={(e) => handleChangeRole(emp.id, e.target.value as AttendeeRole)}
                          style={{
                            padding: 'var(--space-4) var(--space-8)',
                            fontSize: '12px',
                            backgroundColor: 'var(--bg-surface)'
                          }}
                        >
                          <option value="required">Bắt buộc (Required)</option>
                          <option value="optional">Tùy chọn (Optional)</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </PopupModal>
  );
};
