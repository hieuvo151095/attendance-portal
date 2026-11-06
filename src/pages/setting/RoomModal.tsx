import React, { useState, useEffect } from 'react';
import { SideSheet, TextField, SelectField, InlineNotice } from '../../design-system';
import { OfficeRoom, CreateOfficeRoomDTO, UpdateOfficeRoomDTO } from '../../types/room';
import { roomService } from '../../services/room';

export interface RoomModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  roomToEdit?: OfficeRoom | null;
  onSuccess: () => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  open,
  onClose,
  tenantId,
  roomToEdit,
  onSuccess
}) => {
  const isEditing = Boolean(roomToEdit);

  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('30');
  const [status, setStatus] = useState<'available' | 'maintenance'>('available');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (roomToEdit) {
      setRoomId(roomToEdit.roomId);
      setName(roomToEdit.name);
      setLocation(roomToEdit.location);
      setCapacity(String(roomToEdit.capacity || 30));
      setStatus(roomToEdit.status);
    } else {
      setRoomId('');
      setName('');
      setLocation('');
      setCapacity('30');
      setStatus('available');
    }
  }, [open, roomToEdit]);

  const isFormValid = Boolean(roomId.trim() && name.trim() && location.trim());

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) return;

    setError(null);
    setIsSubmitting(true);

    try {
      if (isEditing && roomToEdit) {
        const updateDto: UpdateOfficeRoomDTO = {
          roomId: roomId.trim().toUpperCase(),
          name: name.trim(),
          location: location.trim(),
          capacity: parseInt(capacity, 10) || 30,
          status
        };
        await roomService.updateRoom(tenantId, roomToEdit.id, updateDto);
      } else {
        const createDto: CreateOfficeRoomDTO = {
          roomId: roomId.trim().toUpperCase(),
          name: name.trim(),
          location: location.trim(),
          capacity: parseInt(capacity, 10) || 30,
          status
        };
        await roomService.createRoom(tenantId, createDto);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi lưu thông tin phòng.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'available', label: 'Sẵn sàng phục vụ' },
    { value: 'maintenance', label: 'Đang bảo trì / Nâng cấp' }
  ];

  return (
    <SideSheet
      open={open}
      title={isEditing ? 'Cập nhật thông tin phòng họp' : 'Thêm phòng họp mới'}
      description="Thiết lập mã phòng, tên phòng và vị trí trong trụ sở cơ quan."
      icon="building"
      width={520}
      onClose={onClose}
      primaryAction={{
        label: isSubmitting ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm phòng',
        icon: isEditing ? 'check' : 'plus',
        onClick: handleSubmit,
        disabled: isSubmitting || !isFormValid
      }}
      secondaryAction={{
        label: 'Hủy',
        onClick: onClose,
        disabled: isSubmitting
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {error && <InlineNotice tone="danger" label={error} />}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
          <TextField
            id="room-id"
            label="Mã phòng (Room ID)"
            required
            placeholder="VD: PH-01, HT-T2"
            value={roomId}
            onChange={(val) => setRoomId(val.toUpperCase())}
            disabled={isSubmitting}
          />

          <TextField
            id="room-name"
            label="Tên phòng"
            required
            placeholder="VD: Hội trường số 1"
            value={name}
            onChange={(val) => setName(val)}
            disabled={isSubmitting}
          />
        </div>

        <TextField
          id="room-location"
          label="Vị trí / Địa điểm"
          required
          placeholder="VD: Tầng 2 - Trụ sở UBND, Dãy nhà B"
          value={location}
          onChange={(val) => setLocation(val)}
          disabled={isSubmitting}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
          <TextField
            id="room-capacity"
            label="Sức chứa (Người)"
            type="number"
            placeholder="VD: 50"
            value={capacity}
            onChange={(val) => setCapacity(val)}
            disabled={isSubmitting}
          />

          <div>
            <label
              htmlFor="room-status"
              className="body-sm-medium"
              style={{ display: 'block', marginBottom: 'var(--space-6)', color: 'var(--text-heading)' }}
            >
              Trạng thái
            </label>
            <SelectField
              id="room-status"
              options={statusOptions}
              value={status}
              onChange={(val) => setStatus(val as 'available' | 'maintenance')}
              disabled={isSubmitting}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </form>
    </SideSheet>
  );
};
