import { describe, it, expect, beforeEach } from 'vitest';
import { roomService } from '../services/room';
import { authService } from '../services/auth';

describe('Dịch Vụ Quản Lý Phòng Họp (Office Rooms)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(async () => {
    authService.resetMockData();
    roomService.resetMockData();
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
  });

  it('Lấy danh sách các phòng họp ban đầu của cơ quan', async () => {
    const rooms = await roomService.getRoomsByTenant(ubndTenant);
    expect(rooms.length).toBeGreaterThan(0);
    const roomIds = rooms.map((r) => r.roomId);
    expect(roomIds).toContain('PH-HT-01');
    expect(roomIds).toContain('PH-DN-02');
  });

  it('Thêm phòng họp mới với mã phòng, tên và vị trí (Room ID, Name, Location)', async () => {
    const newRoom = await roomService.createRoom(ubndTenant, {
      roomId: 'PH-VIP-06',
      name: 'Phòng Tiếp Khách VIP',
      location: 'Tầng 1 Trụ sở UBND',
      capacity: 15,
      status: 'available'
    });

    expect(newRoom.id).toBeDefined();
    expect(newRoom.roomId).toBe('PH-VIP-06');
    expect(newRoom.name).toBe('Phòng Tiếp Khách VIP');
    expect(newRoom.location).toBe('Tầng 1 Trụ sở UBND');
    expect(newRoom.capacity).toBe(15);
    expect(newRoom.status).toBe('available');

    const rooms = await roomService.getRoomsByTenant(ubndTenant);
    expect(rooms.some((r) => r.roomId === 'PH-VIP-06')).toBe(true);
  });

  it('Từ chối khi thêm phòng họp trùng mã phòng (Room ID)', async () => {
    await expect(
      roomService.createRoom(ubndTenant, {
        roomId: 'PH-HT-01',
        name: 'Hội trường mới',
        location: 'Tầng 2',
        capacity: 50,
        status: 'available'
      })
    ).rejects.toThrow('Mã phòng "PH-HT-01" đã tồn tại');
  });

  it('Cập nhật thông tin phòng họp thành công', async () => {
    const rooms = await roomService.getRoomsByTenant(ubndTenant);
    const target = rooms[0];

    const updated = await roomService.updateRoom(ubndTenant, target.id, {
      roomId: target.roomId,
      name: 'Hội trường lớn UBND - Sửa tên',
      location: target.location,
      capacity: 120,
      status: 'maintenance'
    });

    expect(updated.name).toBe('Hội trường lớn UBND - Sửa tên');
    expect(updated.capacity).toBe(120);
    expect(updated.status).toBe('maintenance');
  });

  it('Xóa phòng họp khỏi danh sách cơ quan', async () => {
    const rooms = await roomService.getRoomsByTenant(ubndTenant);
    const target = rooms[rooms.length - 1];
    const initialCount = rooms.length;

    await roomService.deleteRoom(ubndTenant, target.id);

    const reloaded = await roomService.getRoomsByTenant(ubndTenant);
    expect(reloaded.length).toBe(initialCount - 1);
    expect(reloaded.some((r) => r.id === target.id)).toBe(false);
  });
});
