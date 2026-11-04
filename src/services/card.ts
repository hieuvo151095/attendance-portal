import { EmployeeCard, AssignCardDTO, RevokeCardDTO, ReplaceCardDTO, CardFilterOptions } from '../types/card';
import { authService } from './auth';
import { employeeService } from './employee';

const STORAGE_CARDS_KEY = 'finviet_attendance_cards';

export const INITIAL_CARDS: EmployeeCard[] = [
  // 1. UBND Phường Bến Nghé (tenant-ubnd-001)
  {
    id: 'card-ubnd-01',
    tenantId: 'tenant-ubnd-001',
    cardUid: '04A1B2C3D4',
    employeeId: 'emp-ubnd-01',
    employeeCode: 'UBND-001',
    employeeName: 'Đ/c Nguyễn Văn An',
    linkedAt: '2026-11-01T08:00:00Z',
    status: 'active',
    note: 'Cấp thẻ công vụ định danh RFID Mifare',
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'card-ubnd-02',
    tenantId: 'tenant-ubnd-001',
    cardUid: '04B2C3D4E5',
    employeeId: 'emp-ubnd-02',
    employeeCode: 'UBND-002',
    employeeName: 'Bà Phạm Thị Cúc',
    linkedAt: '2026-11-01T08:05:00Z',
    status: 'active',
    note: 'Thẻ ra vào trụ sở và phòng họp',
    createdAt: '2026-11-01T08:05:00Z',
    updatedAt: '2026-11-01T08:05:00Z'
  },
  {
    id: 'card-ubnd-old-01',
    tenantId: 'tenant-ubnd-001',
    cardUid: '0499887766',
    employeeId: 'emp-ubnd-01',
    employeeCode: 'UBND-001',
    employeeName: 'Đ/c Nguyễn Văn An',
    linkedAt: '2026-10-15T09:00:00Z',
    status: 'revoked',
    revokedAt: '2026-10-31T17:00:00Z',
    revocationReason: 'Báo mất thẻ vật lý khi đi công tác',
    note: 'Thẻ cũ đã vô hiệu hóa trên toàn hệ thống',
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-31T17:00:00Z'
  },

  // 2. Nhà Máy Tân Bình (tenant-factory-002)
  {
    id: 'card-tb-01',
    tenantId: 'tenant-factory-002',
    cardUid: '04C3D4E5F6',
    employeeId: 'emp-tb-01',
    employeeCode: 'TB-001',
    employeeName: 'Bà Trần Thị Mai',
    linkedAt: '2026-11-01T07:00:00Z',
    status: 'active',
    note: 'Thẻ NFC tích hợp chấm công cổng nhà máy',
    createdAt: '2026-11-01T07:00:00Z',
    updatedAt: '2026-11-01T07:00:00Z'
  },

  // 3. Bệnh Viện Nhi Đồng 1 (tenant-hospital-003)
  {
    id: 'card-bv-01',
    tenantId: 'tenant-hospital-003',
    cardUid: '04D4E5F6A7',
    employeeId: 'emp-bv-01',
    employeeCode: 'BV-001',
    employeeName: 'BS. Lê Hoàng Nam',
    linkedAt: '2026-11-01T07:30:00Z',
    status: 'active',
    note: 'Thẻ công chức y tế và điểm danh ban giám đốc',
    createdAt: '2026-11-01T07:30:00Z',
    updatedAt: '2026-11-01T07:30:00Z'
  }
];

class CardService {
  private memoryCards: Map<string, EmployeeCard> = new Map();

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
      const stored = localStorage.getItem(STORAGE_CARDS_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(INITIAL_CARDS));
      }
    } else {
      INITIAL_CARDS.forEach((c) => this.memoryCards.set(c.id, { ...c }));
    }
  }

  private getAllCards(): EmployeeCard[] {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(STORAGE_CARDS_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return INITIAL_CARDS;
        }
      }
      return INITIAL_CARDS;
    }
    return Array.from(this.memoryCards.values());
  }

  private saveCards(cards: EmployeeCard[]): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(cards));
    } else {
      this.memoryCards.clear();
      cards.forEach((c) => this.memoryCards.set(c.id, c));
    }
  }

  /**
   * Lấy danh sách thẻ vật lý của đơn vị (có bộ lọc trạng thái, nhân viên hoặc tìm kiếm UID)
   */
  public async getCardsByTenant(
    tenantId: string,
    filters?: CardFilterOptions
  ): Promise<EmployeeCard[]> {
    authService.assertTenantAccess(tenantId);
    let list = this.getAllCards().filter((c) => c.tenantId === tenantId);

    if (filters?.status) {
      list = list.filter((c) => c.status === filters.status);
    }

    if (filters?.employeeId) {
      list = list.filter((c) => c.employeeId === filters.employeeId);
    }

    if (filters?.search?.trim()) {
      const term = filters.search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.cardUid.toLowerCase().includes(term) ||
          c.employeeCode.toLowerCase().includes(term) ||
          c.employeeName.toLowerCase().includes(term)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Lấy thẻ đang hoạt động (active hoặc locked) của một nhân viên
   */
  public async getActiveCardByEmployee(
    tenantId: string,
    employeeId: string
  ): Promise<EmployeeCard | null> {
    authService.assertTenantAccess(tenantId);
    const cards = this.getAllCards().filter(
      (c) => c.tenantId === tenantId && c.employeeId === employeeId && c.status !== 'revoked'
    );
    return cards.length > 0 ? cards[0] : null;
  }

  /**
   * Lấy lịch sử thẻ (bao gồm các thẻ đã bị hủy / báo mất) của một nhân viên
   */
  public async getCardHistoryByEmployee(
    tenantId: string,
    employeeId: string
  ): Promise<EmployeeCard[]> {
    authService.assertTenantAccess(tenantId);
    return this.getAllCards()
      .filter((c) => c.tenantId === tenantId && c.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Liên kết thẻ vật lý mới cho nhân viên (ORG-03)
   * Quy tắc nghiệp vụ:
   * 1. Mã UID không được rỗng và chuẩn hóa dạng chữ hoa.
   * 2. Mã UID phải là duy nhất (không được trùng với bất kỳ thẻ nào đang hoạt động hoặc đã bị hủy).
   * 3. Mỗi nhân viên tại một thời điểm chỉ liên kết với duy nhất 1 thẻ hoạt động.
   */
  public async assignCard(tenantId: string, dto: AssignCardDTO): Promise<EmployeeCard> {
    authService.assertTenantAccess(tenantId);

    const cardUid = dto.cardUid.trim().toUpperCase();
    if (!cardUid) {
      throw new Error('Mã UID vật lý của thẻ không được để trống');
    }
    if (!dto.employeeId) {
      throw new Error('Vui lòng chọn nhân viên cần liên kết thẻ');
    }

    // Xác thực nhân viên thuộc cùng đơn vị
    const employee = await employeeService.getEmployeeById(tenantId, dto.employeeId);

    const all = this.getAllCards();

    // 1. Kiểm tra nhân viên đã có thẻ đang hoạt động/tạm khóa chưa
    const existingActiveCard = all.find(
      (c) => c.tenantId === tenantId && c.employeeId === dto.employeeId && c.status !== 'revoked'
    );
    if (existingActiveCard) {
      throw new Error(
        `Nhân viên "${employee.fullName}" đang có thẻ hoạt động (UID: ${existingActiveCard.cardUid}). Vui lòng hủy thẻ cũ trước khi liên kết thẻ mới.`
      );
    }

    // 2. Kiểm tra tính duy nhất của mã UID thẻ trong toàn đơn vị
    const existingCardWithUid = all.find(
      (c) => c.tenantId === tenantId && c.cardUid === cardUid
    );
    if (existingCardWithUid) {
      if (existingCardWithUid.status === 'revoked') {
        throw new Error(
          `Mã thẻ UID "${cardUid}" trước đây đã bị hủy (${existingCardWithUid.revocationReason || 'Báo mất'}). Không thể tái sử dụng thẻ vật lý đã hủy.`
        );
      }
      throw new Error(
        `Mã thẻ UID "${cardUid}" đã được liên kết với nhân viên "${existingCardWithUid.employeeName}" (${existingCardWithUid.employeeCode})`
      );
    }

    const now = new Date().toISOString();
    const newCard: EmployeeCard = {
      id: `card-${tenantId.replace('tenant-', '')}-${Date.now().toString(36)}`,
      tenantId,
      cardUid,
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: employee.fullName,
      linkedAt: now,
      status: 'active',
      note: dto.note?.trim() || 'Cấp mới thẻ vật lý',
      createdAt: now,
      updatedAt: now
    };

    all.push(newCard);
    this.saveCards(all);

    return newCard;
  }

  /**
   * Tạm khóa hoặc Mở khóa thẻ vật lý (ORG-03)
   */
  public async toggleLockCard(
    tenantId: string,
    cardId: string,
    reason?: string
  ): Promise<EmployeeCard> {
    authService.assertTenantAccess(tenantId);

    const all = this.getAllCards();
    const index = all.findIndex((c) => c.id === cardId && c.tenantId === tenantId);
    if (index === -1) {
      throw new Error('Không tìm thấy thông tin thẻ cần thao tác');
    }

    const card = all[index];
    if (card.status === 'revoked') {
      throw new Error('Thẻ đã bị hủy vĩnh viễn, không thể thao tác tạm khóa hay mở khóa');
    }

    const now = new Date().toISOString();
    if (card.status === 'active') {
      card.status = 'locked';
      card.note = reason ? `Tạm khóa: ${reason}` : 'Tạm khóa thẻ vật lý';
    } else {
      card.status = 'active';
      card.note = 'Mở khóa thẻ hoạt động trở lại';
    }
    card.updatedAt = now;

    all[index] = card;
    this.saveCards(all);

    return card;
  }

  /**
   * Hủy thẻ vật lý (Báo mất thẻ / Thu hồi thẻ) (ORG-03)
   */
  public async revokeCard(tenantId: string, dto: RevokeCardDTO): Promise<EmployeeCard> {
    authService.assertTenantAccess(tenantId);

    const all = this.getAllCards();
    const index = all.findIndex((c) => c.id === dto.cardId && c.tenantId === tenantId);
    if (index === -1) {
      throw new Error('Không tìm thấy thẻ cần hủy');
    }

    const card = all[index];
    if (card.status === 'revoked') {
      throw new Error('Thẻ này đã ở trạng thái hủy trước đó');
    }

    const reason = dto.reason.trim();
    if (!reason) {
      throw new Error('Vui lòng cung cấp lý do hủy thẻ (VD: Báo mất thẻ, Thẻ hỏng chip, ...)');
    }

    const now = new Date().toISOString();
    card.status = 'revoked';
    card.revokedAt = now;
    card.revocationReason = reason;
    card.updatedAt = now;

    all[index] = card;
    this.saveCards(all);

    return card;
  }

  /**
   * Hủy thẻ cũ và liên kết mã thẻ mới ngay lập tức (ORG-03)
   * Phù hợp cho trường hợp nhân viên báo mất thẻ hoặc đổi thẻ mới.
   */
  public async replaceCard(
    tenantId: string,
    dto: ReplaceCardDTO
  ): Promise<{ oldCard: EmployeeCard; newCard: EmployeeCard }> {
    authService.assertTenantAccess(tenantId);

    // 1. Thu hồi thẻ cũ
    const oldCard = await this.revokeCard(tenantId, {
      cardId: dto.oldCardId,
      reason: dto.revokeReason || 'Hủy đổi thẻ mới'
    });

    // 2. Gán thẻ mới cho cùng nhân viên
    const newCard = await this.assignCard(tenantId, {
      employeeId: oldCard.employeeId,
      cardUid: dto.newCardUid,
      note: dto.note || `Cấp đổi thay thế thẻ cũ (UID: ${oldCard.cardUid})`
    });

    return { oldCard, newCard };
  }

  public resetMockData(): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(INITIAL_CARDS));
    }
    this.memoryCards.clear();
    INITIAL_CARDS.forEach((c) => this.memoryCards.set(c.id, { ...c }));
  }
}

export const cardService = new CardService();
