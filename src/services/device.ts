import type { CameraDevice, CreateCameraDeviceDTO, UpdateCameraDeviceDTO } from '../types/device';

const STORAGE_DEVICES_KEY = 'finviet_attendance_camera_devices';

export const DEFAULT_CAMERA_DEVICES: CameraDevice[] = [
  {
    id: 'cam-01',
    tenantId: 'tenant-ubnd-001',
    name: 'Camera AI Cổng Tiếp Dân',
    code: 'CAM-UBND-CC-01',
    attendanceType: 'attendance',
    attendanceTypes: ['attendance'],
    status: 'active',
    connectionStatus: 'online',
    location: 'Cổng chính tiếp dân UBND',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'cam-02',
    tenantId: 'tenant-ubnd-001',
    name: 'Camera AI Cổng Cán Bộ & Ban Chỉ Huy',
    code: 'CAM-UBND-CC-02',
    attendanceType: 'both',
    attendanceTypes: ['attendance', 'meeting'],
    status: 'active',
    connectionStatus: 'online',
    location: 'Cổng nội bộ & Lối vào hội trường',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'cam-03',
    tenantId: 'tenant-ubnd-001',
    name: 'Camera AI Hội Trường Số 1',
    code: 'CAM-UBND-MTG-01',
    attendanceType: 'meeting',
    attendanceTypes: ['meeting'],
    status: 'active',
    connectionStatus: 'online',
    location: 'Hội trường số 1 - Tầng 2',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'cam-04',
    tenantId: 'tenant-ubnd-001',
    name: 'Camera AI Phòng Họp Hội Đồng Nhân Dân',
    code: 'CAM-UBND-MTG-02',
    attendanceType: 'meeting',
    attendanceTypes: ['meeting'],
    status: 'locked',
    connectionStatus: 'offline',
    location: 'Phòng họp HĐND - Tầng 2',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'cam-05',
    tenantId: 'tenant-ubnd-001',
    name: 'Camera AI Cổng Nhà Xe Cán Bộ (Bảo trì)',
    code: 'CAM-UBND-CC-03',
    attendanceType: 'attendance',
    attendanceTypes: ['attendance'],
    status: 'locked',
    connectionStatus: 'offline',
    location: 'Lối vào nhà xe',
    createdAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-05T08:00:00Z'
  }
];

class CameraDeviceService {
  private memoryDevices: CameraDevice[] = [];

  constructor() {
    this.initStorage();
  }

  private hasLocalStorage(): boolean {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  private initStorage(): void {
    if (this.hasLocalStorage()) {
      const stored = localStorage.getItem(STORAGE_DEVICES_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_DEVICES_KEY, JSON.stringify(DEFAULT_CAMERA_DEVICES));
      } else {
        try {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            let needsSave = false;
            // Đảm bảo thiết bị cam-04 (CAM-UBND-MTG-02) và cam-05 (CAM-UBND-CC-03) khớp chuẩn 3 hoạt động / 2 tạm khóa
            const cam04 = list.find((d: CameraDevice) => d.id === 'cam-04' || d.code === 'CAM-UBND-MTG-02');
            if (cam04 && cam04.status === 'active') {
              cam04.status = 'locked';
              needsSave = true;
            }
            // Migrate: đảm bảo mọi thiết bị đều có connectionStatus
            for (const d of list) {
              if (!d.connectionStatus) {
                d.connectionStatus = d.status === 'active' ? 'online' : 'offline';
                needsSave = true;
              }
            }
            if (needsSave) {
              localStorage.setItem(STORAGE_DEVICES_KEY, JSON.stringify(list));
            }
          }
        } catch {
          localStorage.setItem(STORAGE_DEVICES_KEY, JSON.stringify(DEFAULT_CAMERA_DEVICES));
        }
      }
    } else {
      this.memoryDevices = DEFAULT_CAMERA_DEVICES.map((d) => ({ ...d }));
    }
  }

  private getAllDevices(): CameraDevice[] {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(STORAGE_DEVICES_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return [...DEFAULT_CAMERA_DEVICES];
        }
      }
      return [...DEFAULT_CAMERA_DEVICES];
    }
    return this.memoryDevices;
  }

  private saveAllDevices(devices: CameraDevice[]): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_DEVICES_KEY, JSON.stringify(devices));
      try {
        window.dispatchEvent(new CustomEvent('finviet_devices_changed', { detail: devices }));
      } catch {}
    } else {
      this.memoryDevices = [...devices];
    }
  }

  public resetMockData(): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_DEVICES_KEY, JSON.stringify(DEFAULT_CAMERA_DEVICES));
      try {
        window.dispatchEvent(new CustomEvent('finviet_devices_changed', { detail: DEFAULT_CAMERA_DEVICES }));
      } catch {}
    }
    this.memoryDevices = DEFAULT_CAMERA_DEVICES.map((d) => ({ ...d }));
  }

  public async getDevicesByTenant(tenantId: string): Promise<CameraDevice[]> {
    const all = this.getAllDevices();
    return all.filter((d) => d.tenantId === tenantId);
  }

  public async getDeviceById(tenantId: string, id: string): Promise<CameraDevice | null> {
    const list = await this.getDevicesByTenant(tenantId);
    return list.find((d) => d.id === id) || null;
  }

  public async createDevice(tenantId: string, dto: CreateCameraDeviceDTO): Promise<CameraDevice> {
    const all = this.getAllDevices();
    const cleanCode = dto.code.trim().toUpperCase();

    // Check duplicate code in same tenant
    const exists = all.some((d) => d.tenantId === tenantId && d.code.toUpperCase() === cleanCode);
    if (exists) {
      throw new Error(`Mã thiết bị "${cleanCode}" đã tồn tại trong hệ thống.`);
    }

    const now = new Date().toISOString();
    const resolvedTypes: ('attendance' | 'meeting')[] =
      dto.attendanceTypes && dto.attendanceTypes.length > 0
        ? dto.attendanceTypes
        : dto.attendanceType === 'both'
        ? ['attendance', 'meeting']
        : [dto.attendanceType as 'attendance' | 'meeting'];

    const newDevice: CameraDevice = {
      id: `cam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId,
      name: dto.name.trim(),
      code: cleanCode,
      attendanceType: dto.attendanceType,
      attendanceTypes: resolvedTypes,
      status: dto.status || 'active',
      connectionStatus: (dto.status || 'active') === 'active' ? 'online' : 'offline',
      location: dto.location?.trim() || '',
      createdAt: now,
      updatedAt: now
    };

    all.push(newDevice);
    this.saveAllDevices(all);
    return newDevice;
  }

  public async updateDevice(
    tenantId: string,
    id: string,
    dto: UpdateCameraDeviceDTO
  ): Promise<CameraDevice> {
    const all = this.getAllDevices();
    const index = all.findIndex((d) => d.id === id && d.tenantId === tenantId);
    if (index === -1) {
      throw new Error('Không tìm thấy thiết bị để cập nhật.');
    }

    const current = all[index];
    if (dto.code) {
      const cleanCode = dto.code.trim().toUpperCase();
      const codeDuplicate = all.some(
        (d) => d.id !== id && d.tenantId === tenantId && d.code.toUpperCase() === cleanCode
      );
      if (codeDuplicate) {
        throw new Error(`Mã thiết bị "${cleanCode}" đã tồn tại cho thiết bị khác.`);
      }
      current.code = cleanCode;
    }

    if (dto.name !== undefined) {
      current.name = dto.name.trim();
    }
    if (dto.attendanceType !== undefined) {
      current.attendanceType = dto.attendanceType;
      current.attendanceTypes =
        dto.attendanceTypes && dto.attendanceTypes.length > 0
          ? dto.attendanceTypes
          : dto.attendanceType === 'both'
          ? ['attendance', 'meeting']
          : [dto.attendanceType as 'attendance' | 'meeting'];
    } else if (dto.attendanceTypes !== undefined) {
      current.attendanceTypes = dto.attendanceTypes;
      current.attendanceType =
        dto.attendanceTypes.length > 1 ? 'both' : dto.attendanceTypes[0] || 'attendance';
    }
    if (dto.status !== undefined) {
      current.status = dto.status;
    }
    if (dto.location !== undefined) {
      current.location = dto.location.trim();
    }
    current.updatedAt = new Date().toISOString();

    all[index] = current;
    this.saveAllDevices(all);
    return current;
  }

  public async toggleDeviceStatus(tenantId: string, id: string): Promise<CameraDevice> {
    const device = await this.getDeviceById(tenantId, id);
    if (!device) {
      throw new Error('Không tìm thấy thiết bị.');
    }
    const nextStatus = device.status === 'active' ? 'locked' : 'active';
    return this.updateDevice(tenantId, id, { status: nextStatus });
  }

  public async deleteDevice(tenantId: string, id: string): Promise<boolean> {
    let all = this.getAllDevices();
    const initialLen = all.length;
    all = all.filter((d) => !(d.id === id && d.tenantId === tenantId));
    if (all.length === initialLen) {
      throw new Error('Không tìm thấy thiết bị cần xóa.');
    }
    this.saveAllDevices(all);
    return true;
  }
}

export const cameraDeviceService = new CameraDeviceService();
export const deviceService = cameraDeviceService;
