export type CardStatus = 'active' | 'locked' | 'revoked';

export interface EmployeeCard {
  id: string;
  tenantId: string;
  cardUid: string; // Mã UID vật lý của thẻ (RFID, NFC, Mifare - VD: "04A1B2C3D4")
  employeeId: string; // ID nhân viên được liên kết
  employeeCode: string; // Mã nhân viên (tiện truy vấn)
  employeeName: string; // Họ tên nhân viên
  linkedAt: string; // Ngày/giờ liên kết thẻ
  status: CardStatus; // 'active': Đang hoạt động | 'locked': Tạm khóa | 'revoked': Đã hủy
  revokedAt?: string; // Thời điểm hủy thẻ
  revocationReason?: string; // Lý do hủy: Báo mất thẻ, Thẻ hỏng, Nhân viên chuyển công tác...
  note?: string; // Ghi chú cấp phát
  createdAt: string;
  updatedAt: string;
}

export interface AssignCardDTO {
  employeeId: string;
  cardUid: string;
  note?: string;
}

export interface RevokeCardDTO {
  cardId: string;
  reason: string;
}

export interface ReplaceCardDTO {
  oldCardId: string;
  newCardUid: string;
  revokeReason: string;
  note?: string;
}

export interface CardFilterOptions {
  status?: CardStatus;
  employeeId?: string;
  search?: string;
}
