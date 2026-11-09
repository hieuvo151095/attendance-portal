// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cameraDeviceService } from '../services/device';
import type { CreateCameraDeviceDTO } from '../types/device';

describe('Quản trị thiết bị Camera (Camera Device Management)', () => {
  const ubndTenant = 'tenant-ubnd-001';

  beforeEach(() => {
    cameraDeviceService.resetMockData();
    vi.clearAllMocks();
  });

  it('Lấy danh sách thiết bị camera theo đơn vị', async () => {
    const devices = await cameraDeviceService.getDevicesByTenant(ubndTenant);
    expect(devices.length).toBeGreaterThanOrEqual(4);

    const checkInDev = devices.find((d) => d.code === 'CAM-UBND-CC-01');
    expect(checkInDev).toBeDefined();
    expect(checkInDev?.name).toContain('Camera AI Cổng Tiếp Dân');
    expect(checkInDev?.attendanceType).toBe('attendance');
    expect(checkInDev?.status).toBe('active');

    const meetingDev = devices.find((d) => d.code === 'CAM-UBND-MTG-01');
    expect(meetingDev).toBeDefined();
    expect(meetingDev?.attendanceType).toBe('meeting');
  });

  it('Thêm mới thiết bị camera thành công với loại điểm danh và trạng thái chỉ định', async () => {
    const dto: CreateCameraDeviceDTO = {
      name: 'Camera Cổng Bắc Trụ Sở',
      code: 'CAM-NORTH-01',
      attendanceType: 'attendance',
      status: 'active',
      location: 'Cổng Bắc đường Lê Duẩn'
    };

    const created = await cameraDeviceService.createDevice(ubndTenant, dto);
    expect(created.id).toBeDefined();
    expect(created.code).toBe('CAM-NORTH-01');
    expect(created.name).toBe('Camera Cổng Bắc Trụ Sở');
    expect(created.attendanceType).toBe('attendance');
    expect(created.status).toBe('active');

    const list = await cameraDeviceService.getDevicesByTenant(ubndTenant);
    expect(list.some((d) => d.code === 'CAM-NORTH-01')).toBe(true);
  });

  it('Từ chối tạo thiết bị khi trùng mã thiết bị trong cùng đơn vị', async () => {
    const dto: CreateCameraDeviceDTO = {
      name: 'Camera Trùng Mã',
      code: 'CAM-UBND-CC-01', // Mã đã có
      attendanceType: 'attendance'
    };

    await expect(cameraDeviceService.createDevice(ubndTenant, dto)).rejects.toThrow(
      'Mã thiết bị "CAM-UBND-CC-01" đã tồn tại trong hệ thống.'
    );
  });

  it('Cập nhật thông tin thiết bị (tên, loại điểm danh, trạng thái)', async () => {
    const list = await cameraDeviceService.getDevicesByTenant(ubndTenant);
    const target = list[0];

    const updated = await cameraDeviceService.updateDevice(ubndTenant, target.id, {
      name: 'Camera Cổng Tiếp Dân (Đã nâng cấp 4K)',
      attendanceType: 'meeting',
      status: 'locked'
    });

    expect(updated.name).toBe('Camera Cổng Tiếp Dân (Đã nâng cấp 4K)');
    expect(updated.attendanceType).toBe('meeting');
    expect(updated.status).toBe('locked');
  });

  it('Điều chỉnh trạng thái thiết bị trong Thao tác (Tạm khoá / Mở khoá)', async () => {
    const list = await cameraDeviceService.getDevicesByTenant(ubndTenant);
    const activeDevice = list.find((d) => d.status === 'active')!;

    // Tạm khoá
    const locked = await cameraDeviceService.toggleDeviceStatus(ubndTenant, activeDevice.id);
    expect(locked.status).toBe('locked');

    // Mở khoá lại
    const unlocked = await cameraDeviceService.toggleDeviceStatus(ubndTenant, activeDevice.id);
    expect(unlocked.status).toBe('active');
  });

  it('Xóa thiết bị camera khỏi danh mục đơn vị', async () => {
    const listBefore = await cameraDeviceService.getDevicesByTenant(ubndTenant);
    const toDelete = listBefore[listBefore.length - 1];

    const success = await cameraDeviceService.deleteDevice(ubndTenant, toDelete.id);
    expect(success).toBe(true);

    const listAfter = await cameraDeviceService.getDevicesByTenant(ubndTenant);
    expect(listAfter.some((d) => d.id === toDelete.id)).toBe(false);
  });
});
