export interface OfficeRoom {
  id: string;
  roomId: string;
  name: string;
  location: string;
  capacity?: number;
  status: 'available' | 'maintenance';
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfficeRoomDTO {
  roomId: string;
  name: string;
  location: string;
  capacity?: number;
  status?: 'available' | 'maintenance';
}

export interface UpdateOfficeRoomDTO {
  roomId?: string;
  name?: string;
  location?: string;
  capacity?: number;
  status?: 'available' | 'maintenance';
}
