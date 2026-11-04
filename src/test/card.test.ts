import { describe, it, expect, beforeEach } from 'vitest';
import { cardService } from '../services/card';
import { authService } from '../services/auth';

describe('Dịch Vụ Quản Lý Thẻ Nhân Viên Vật Lý (ORG-03: Card Service)', () => {
  const ubndTenant = 'tenant-ubnd-001';
  const factoryTenant = 'tenant-factory-002';

  beforeEach(async () => {
    authService.resetMockData();
    // Đăng nhập quyền UBND Phường Bến Nghé
    await authService.login({
      username: 'ubnd-ben-nghe',
      password: 'Finviet@2026'
    });
    cardService.resetMockData();
  });

  it('Lấy danh sách thẻ thuộc đơn vị và kiểm tra ranh giới bảo mật đa đơn vị (multi-tenancy)', async () => {
    const list = await cardService.getCardsByTenant(ubndTenant);
    expect(list.length).toBeGreaterThan(0);
    list.forEach((c) => expect(c.tenantId).toBe(ubndTenant));

    // Không được truy cập thẻ của nhà máy Tân Bình
    await expect(cardService.getCardsByTenant(factoryTenant)).rejects.toThrow(
      /không có quyền/i
    );
  });

  it('Lấy thẻ đang hoạt động và lịch sử thẻ của từng nhân viên', async () => {
    // Nguyễn Văn An (emp-ubnd-01) có 1 thẻ active và 1 thẻ đã revoked trong lịch sử
    const activeCard = await cardService.getActiveCardByEmployee(ubndTenant, 'emp-ubnd-01');
    expect(activeCard).not.toBeNull();
    expect(activeCard?.cardUid).toBe('04A1B2C3D4');
    expect(activeCard?.status).toBe('active');

    const history = await cardService.getCardHistoryByEmployee(ubndTenant, 'emp-ubnd-01');
    expect(history.length).toBe(2);
    const revoked = history.find((c) => c.status === 'revoked');
    expect(revoked).toBeDefined();
    expect(revoked?.revocationReason).toContain('Báo mất thẻ vật lý');
  });

  it('Liên kết thẻ vật lý mới thành công cho nhân viên chưa có thẻ', async () => {
    // Hoàng Văn Đức (emp-ubnd-03) chưa có thẻ
    const newCard = await cardService.assignCard(ubndTenant, {
      employeeId: 'emp-ubnd-03',
      cardUid: '04E1F2A3B4',
      note: 'Cấp thẻ định danh RFID Mifare lần đầu'
    });

    expect(newCard.id).toBeDefined();
    expect(newCard.cardUid).toBe('04E1F2A3B4');
    expect(newCard.employeeCode).toBe('UBND-003');
    expect(newCard.status).toBe('active');

    const active = await cardService.getActiveCardByEmployee(ubndTenant, 'emp-ubnd-03');
    expect(active?.cardUid).toBe('04E1F2A3B4');
  });

  it('Từ chối liên kết thẻ khi nhân viên đang có thẻ hoạt động khác', async () => {
    // emp-ubnd-01 đã có thẻ 04A1B2C3D4
    await expect(
      cardService.assignCard(ubndTenant, {
        employeeId: 'emp-ubnd-01',
        cardUid: '04FFFFFFFF'
      })
    ).rejects.toThrow(/đang có thẻ hoạt động/i);
  });

  it('Từ chối liên kết khi mã UID thẻ bị trùng lặp với thẻ đang hoạt động khác', async () => {
    // Thẻ 04B2C3D4E5 đang gán cho emp-ubnd-02
    await expect(
      cardService.assignCard(ubndTenant, {
        employeeId: 'emp-ubnd-03',
        cardUid: '04B2C3D4E5' // Trùng UID của emp-ubnd-02
      })
    ).rejects.toThrow(/đã được liên kết với nhân viên/i);
  });

  it('Từ chối tái sử dụng mã UID của thẻ đã bị hủy trước đó', async () => {
    // Thẻ 0499887766 là thẻ đã bị hủy trong quá khứ
    await expect(
      cardService.assignCard(ubndTenant, {
        employeeId: 'emp-ubnd-03',
        cardUid: '0499887766'
      })
    ).rejects.toThrow(/Không thể tái sử dụng thẻ vật lý đã hủy/i);
  });

  it('Tạm khóa và Mở khóa thẻ vật lý theo nhu cầu', async () => {
    const activeCard = await cardService.getActiveCardByEmployee(ubndTenant, 'emp-ubnd-01');
    expect(activeCard?.status).toBe('active');

    // 1. Tạm khóa
    const lockedCard = await cardService.toggleLockCard(
      ubndTenant,
      activeCard!.id,
      'Nhân viên để quên thẻ tại nhà'
    );
    expect(lockedCard.status).toBe('locked');
    expect(lockedCard.note).toContain('Tạm khóa');

    // 2. Mở khóa lại
    const unlockedCard = await cardService.toggleLockCard(ubndTenant, activeCard!.id);
    expect(unlockedCard.status).toBe('active');
  });

  it('Hủy thẻ vật lý (Báo mất thẻ) kèm ghi nhận lý do và thời điểm', async () => {
    const card = await cardService.getActiveCardByEmployee(ubndTenant, 'emp-ubnd-02');
    expect(card).not.toBeNull();

    const revoked = await cardService.revokeCard(ubndTenant, {
      cardId: card!.id,
      reason: 'Nhân viên đánh rơi thẻ khi tham gia họp tại Thành ủy'
    });

    expect(revoked.status).toBe('revoked');
    expect(revoked.revokedAt).toBeDefined();
    expect(revoked.revocationReason).toContain('tham gia họp');

    // Sau khi hủy, nhân viên không còn thẻ active
    const activeAfter = await cardService.getActiveCardByEmployee(ubndTenant, 'emp-ubnd-02');
    expect(activeAfter).toBeNull();
  });

  it('Hủy thẻ cũ và liên kết mã thẻ mới ngay lập tức (replaceCard)', async () => {
    const currentCard = await cardService.getActiveCardByEmployee(ubndTenant, 'emp-ubnd-01');
    expect(currentCard).not.toBeNull();

    const result = await cardService.replaceCard(ubndTenant, {
      oldCardId: currentCard!.id,
      newCardUid: '04NEW999888',
      revokeReason: 'Thẻ cũ bị gãy góc vi mạch không nhận diện',
      note: 'Cấp đổi thẻ mới thay thế'
    });

    // Thẻ cũ phải chuyển sang revoked
    expect(result.oldCard.status).toBe('revoked');
    expect(result.oldCard.cardUid).toBe(currentCard!.cardUid);

    // Thẻ mới phải active với UID mới
    expect(result.newCard.status).toBe('active');
    expect(result.newCard.cardUid).toBe('04NEW999888');
    expect(result.newCard.employeeId).toBe('emp-ubnd-01');

    // Kiểm tra nhân viên hiện có thẻ mới active
    const activeNow = await cardService.getActiveCardByEmployee(ubndTenant, 'emp-ubnd-01');
    expect(activeNow?.cardUid).toBe('04NEW999888');
  });
});
