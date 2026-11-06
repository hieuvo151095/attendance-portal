import { OfficeRoom, CreateOfficeRoomDTO, UpdateOfficeRoomDTO } from '../types/room';
import { authService } from './auth';

const STORAGE_ROOMS_KEY = 'finviet_attendance_office_rooms';

export const DEFAULT_OFFICE_ROOMS: OfficeRoom[] = [
  {
    id: 'room-01',
    roomId: 'PH-HT-01',
    name: 'Hội trường số 1',
    location: 'Tầng 2 Trụ sở UBND',
    capacity: 120,
    status: 'available',
    tenantId: 'tenant-ubnd-001',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'room-02',
    roomId: 'PH-DN-02',
    name: 'Phòng họp Đa năng',
    location: 'Trụ sở UBND Phường',
    capacity: 40,
    status: 'available',
    tenantId: 'tenant-ubnd-001',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'room-03',
    roomId: 'PH-HD-03',
    name: 'Phòng Họp Hội Đồng Nhân Dân',
    location: 'Tầng 2 Trụ sở UBND',
    capacity: 50,
    status: 'available',
    tenantId: 'tenant-ubnd-001',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'room-04',
    roomId: 'PH-BTV-04',
    name: 'Phòng họp Ban Thường vụ',
    location: 'Tầng 3 Trụ sở UBND',
    capacity: 25,
    status: 'available',
    tenantId: 'tenant-ubnd-001',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'room-05',
    roomId: 'PH-TT-05',
    name: 'Phòng họp Trực tuyến Số 1',
    location: 'Tầng 1 Trung tâm Điều hành',
    capacity: 30,
    status: 'available',
    tenantId: 'tenant-ubnd-001',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z'
  }
];

class RoomService {
  private memoryRooms: OfficeRoom[] = [];

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
      const stored = localStorage.getItem(STORAGE_ROOMS_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(DEFAULT_OFFICE_ROOMS));
      }
    } else {
      this.memoryRooms = DEFAULT_OFFICE_ROOMS.map((r) => ({ ...r }));
    }
  }

  private getAllRooms(): OfficeRoom[] {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(STORAGE_ROOMS_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return [...DEFAULT_OFFICE_ROOMS];
        }
      }
      return [...DEFAULT_OFFICE_ROOMS];
    }
    return [...this.memoryRooms];
  }

  private saveRooms(rooms: OfficeRoom[]): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));
    } else {
      this.memoryRooms = rooms.map((r) => ({ ...r }));
    }
  }

  public resetMockData(): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(DEFAULT_OFFICE_ROOMS));
    } else {
      this.memoryRooms = DEFAULT_OFFICE_ROOMS.map((r) => ({ ...r }));
    }
  }

  /**
   * Lấy danh sách toàn bộ phòng họp / phòng làm việc của cơ quan
   */
  public async getRoomsByTenant(tenantId: string): Promise<OfficeRoom[]> {
    authService.assertTenantAccess(tenantId);
    const rooms = this.getAllRooms();
    return rooms.filter((r) => r.tenantId === tenantId);
  }

  /**
   * Lấy chi tiết phòng theo ID
   */
  public async getRoomById(tenantId: string, id: string): Promise<OfficeRoom | null> {
    authService.assertTenantAccess(tenantId);
    const rooms = this.getAllRooms();
    return rooms.find((r) => r.tenantId === tenantId && (r.id === id || r.roomId === id)) || null;
  }

  /**
   * Thêm phòng mới
   */
  public async createRoom(tenantId: string, dto: CreateOfficeRoomDTO): Promise<OfficeRoom> {
    authService.assertTenantAccess(tenantId);

    const trimmedRoomId = dto.roomId.trim().toUpperCase();
    const trimmedName = dto.name.trim();
    const trimmedLocation = dto.location.trim();

    if (!trimmedRoomId) throw new Error('Mã phòng (Room ID) không được để trống');
    if (!trimmedName) throw new Error('Tên phòng không được để trống');
    if (!trimmedLocation) throw new Error('Vị trí phòng không được để trống');

    const rooms = this.getAllRooms();
    const exists = rooms.some(
      (r) => r.tenantId === tenantId && r.roomId.toUpperCase() === trimmedRoomId
    );
    if (exists) {
      throw new Error(`Mã phòng "${trimmedRoomId}" đã tồn tại trong cơ quan. Vui lòng chọn mã khác.`);
    }

    const now = new Date().toISOString();
    const newRoom: OfficeRoom = {
      id: `room-${Date.now()}`,
      roomId: trimmedRoomId,
      name: trimmedName,
      location: trimmedLocation,
      capacity: dto.capacity && dto.capacity > 0 ? dto.capacity : 30,
      status: dto.status || 'available',
      tenantId,
      createdAt: now,
      updatedAt: now
    };

    rooms.push(newRoom);
    this.saveRooms(rooms);
    return newRoom;
  }

  /**
   * Cập nhật thông tin phòng
   */
  public async updateRoom(
    tenantId: string,
    id: string,
    dto: UpdateOfficeRoomDTO
  ): Promise<OfficeRoom> {
    authService.assertTenantAccess(tenantId);

    const rooms = this.getAllRooms();
    const idx = rooms.findIndex((r) => r.tenantId === tenantId && r.id === id);
    if (idx === -1) {
      throw new Error('Không tìm thấy thông tin phòng họp cần cập nhật');
    }

    if (dto.roomId) {
      const trimmedRoomId = dto.roomId.trim().toUpperCase();
      const duplicate = rooms.some(
        (r, i) => i !== idx && r.tenantId === tenantId && r.roomId.toUpperCase() === trimmedRoomId
      );
      if (duplicate) {
        throw new Error(`Mã phòng "${trimmedRoomId}" đã tồn tại.`);
      }
      rooms[idx].roomId = trimmedRoomId;
    }

    if (dto.name !== undefined) {
      if (!dto.name.trim()) throw new Error('Tên phòng không được để trống');
      rooms[idx].name = dto.name.trim();
    }

    if (dto.location !== undefined) {
      if (!dto.location.trim()) throw new Error('Vị trí phòng không được để trống');
      rooms[idx].location = dto.location.trim();
    }

    if (dto.capacity !== undefined) {
      rooms[idx].capacity = dto.capacity;
    }

    if (dto.status !== undefined) {
      rooms[idx].status = dto.status;
    }

    rooms[idx].updatedAt = new Date().toISOString();
    this.saveRooms(rooms);
    return rooms[idx];
  }

  /**
   * Xóa phòng
   */
  public async deleteRoom(tenantId: string, id: string): Promise<boolean> {
    authService.assertTenantAccess(tenantId);
    const rooms = this.getAllRooms();
    const filtered = rooms.filter((r) => !(r.tenantId === tenantId && r.id === id));
    if (filtered.length === rooms.length) return false;
    this.saveRooms(filtered);
    return true;
  }
}

export const roomService = new RoomService();
