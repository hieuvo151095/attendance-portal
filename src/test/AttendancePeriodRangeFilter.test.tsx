import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  AttendancePeriodRangeFilter,
  getDayRangeLabel,
  getWeekRangeLabel,
  getMonthRangeLabel
} from '../pages/dashboard/AttendancePeriodRangeFilter';

describe('Khung Điều Khiển Hợp Nhất Kỳ & Phạm Vi Ngày Thực Tế (AttendancePeriodRangeFilter)', () => {
  it('Helper functions tính toán chính xác chuỗi ngày thực tế', () => {
    expect(getDayRangeLabel('14')).toBe('24/10 - 06/11');
    expect(getDayRangeLabel('10')).toBe('28/10 - 06/11');
    expect(getDayRangeLabel('7')).toBe('31/10 - 06/11');
    expect(getDayRangeLabel('custom', '2026-10-01', '2026-10-14')).toBe('01/10 - 14/10');

    expect(getWeekRangeLabel('12')).toBe('15/08 - 06/11');
    expect(getWeekRangeLabel('8')).toBe('12/09 - 06/11');
    expect(getWeekRangeLabel('4')).toBe('10/10 - 06/11');
    expect(getWeekRangeLabel('custom', '2026-08-17', '2026-11-06')).toBe('17/08 - 06/11');

    expect(getMonthRangeLabel('12')).toBe('01/12/2025 - 30/11/2026');
    expect(getMonthRangeLabel('6')).toBe('01/06/2026 - 30/11/2026');
    expect(getMonthRangeLabel('3')).toBe('01/09/2026 - 30/11/2026');
    expect(getMonthRangeLabel('custom', '2025-12-01', '2026-11-30')).toBe('01/12/2025 - 30/11/2026');
  });

  it('Mặc định hiển thị kỳ Theo ngày và phạm vi 14 ngày gần nhất với ngày thực tế (24/10 - 06/11)', () => {
    const handlePeriodChange = vi.fn();
    const handleDayRangeChange = vi.fn();

    render(
      <AttendancePeriodRangeFilter
        period="days"
        onPeriodChange={handlePeriodChange}
        dayRange="14"
        onDayRangeChange={handleDayRangeChange}
        weekRange="12"
        onWeekRangeChange={vi.fn()}
        monthRange="12"
        onMonthRangeChange={vi.fn()}
        customStartDate="2026-10-24"
        customEndDate="2026-11-06"
        onCustomDateChange={vi.fn()}
      />
    );

    // Nút kỳ mặc định
    const periodTrigger = screen.getByTestId('period-dropdown-trigger');
    expect(periodTrigger).toHaveTextContent('Theo ngày');

    // Nút phạm vi mặc định hiển thị ngày thực tế thay vì chữ 14 ngày
    const rangeTrigger = screen.getByTestId('range-dropdown-trigger');
    expect(rangeTrigger).toHaveTextContent('24/10 - 06/11');

    // Bấm mở dropdown kỳ
    fireEvent.click(periodTrigger);
    expect(screen.getByText('Theo tuần')).toBeInTheDocument();
    expect(screen.getByText('Theo tháng')).toBeInTheDocument();

    // Chọn Theo tuần
    fireEvent.click(screen.getByText('Theo tuần'));
    expect(handlePeriodChange).toHaveBeenCalledWith('weeks');
  });

  it('Đã xóa bỏ 3 mốc gợi ý (suggested date ranges) trong hộp lịch Theo ngày theo đúng yêu cầu', () => {
    render(
      <AttendancePeriodRangeFilter
        period="days"
        onPeriodChange={vi.fn()}
        dayRange="14"
        onDayRangeChange={vi.fn()}
        weekRange="12"
        onWeekRangeChange={vi.fn()}
        monthRange="12"
        onMonthRangeChange={vi.fn()}
        customStartDate="2026-10-24"
        customEndDate="2026-11-06"
        onCustomDateChange={vi.fn()}
      />
    );

    const rangeTrigger = screen.getByTestId('range-dropdown-trigger');
    fireEvent.click(rangeTrigger);

    // Không còn 3 nút mốc gợi ý
    expect(screen.queryByText('14 ngày gần nhất')).not.toBeInTheDocument();
    expect(screen.queryByText('10 ngày gần nhất')).not.toBeInTheDocument();
    expect(screen.queryByText('7 ngày gần nhất')).not.toBeInTheDocument();

    // Vẫn hiển thị lịch và trường nhập ngày
    expect(screen.getByText('Chọn phạm vi ngày')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-first-date-input')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-last-date-input')).toBeInTheDocument();
  });

  it('Bấm đổi phạm vi ngày hiển thị NGAY LẬP TỨC lịch (calendar) để chọn ngày đầu và ngày cuối, KHÔNG hiển thị lịch bên phải', () => {
    const handleDayRangeChange = vi.fn();
    const handleCustomDateChange = vi.fn();

    const { container } = render(
      <AttendancePeriodRangeFilter
        period="days"
        onPeriodChange={vi.fn()}
        dayRange="14"
        onDayRangeChange={handleDayRangeChange}
        weekRange="12"
        onWeekRangeChange={vi.fn()}
        monthRange="12"
        onMonthRangeChange={vi.fn()}
        customStartDate="2026-10-24"
        customEndDate="2026-11-06"
        onCustomDateChange={handleCustomDateChange}
      />
    );

    // 1. Kiểm tra ban đầu không có bất kỳ hộp lịch nào nằm bên phải ngoài frame
    expect(container.querySelectorAll('input[type="date"]').length).toBe(0);

    // 2. Bấm vào nút đổi range
    const rangeTrigger = screen.getByTestId('range-dropdown-trigger');
    fireEvent.click(rangeTrigger);

    // 3. Popover lịch xuất hiện ngay lập tức bên dưới trigger
    const popover = screen.getByTestId('calendar-range-popover');
    expect(popover).toBeInTheDocument();

    // 4. Có trường nhập ngày đầu (Từ ngày) và ngày cuối (Đến ngày)
    const firstDateInput = screen.getByTestId('calendar-first-date-input') as HTMLInputElement;
    const lastDateInput = screen.getByTestId('calendar-last-date-input') as HTMLInputElement;
    expect(firstDateInput).toBeInTheDocument();
    expect(lastDateInput).toBeInTheDocument();
    expect(firstDateInput.value).toBe('2026-10-24');
    expect(lastDateInput.value).toBe('2026-11-06');

    // 5. Hiển thị lưới lịch tháng (Tháng 11, 2026) với các nút ngày
    expect(screen.getByText('Tháng 11, 2026')).toBeInTheDocument();
    expect(screen.getByText('T2')).toBeInTheDocument();
    expect(screen.getByText('CN')).toBeInTheDocument();

    // 6. Cho phép chọn ngày trực tiếp trên input hoặc bấm ngày trên lưới lịch
    fireEvent.change(firstDateInput, { target: { value: '2026-11-01' } });
    fireEvent.change(lastDateInput, { target: { value: '2026-11-05' } });

    // 7. Bấm Áp dụng
    const applyBtn = screen.getByText('Áp dụng');
    fireEvent.click(applyBtn);

    expect(handleCustomDateChange).toHaveBeenCalledWith('2026-11-01', '2026-11-05');
    expect(handleDayRangeChange).toHaveBeenCalledWith('custom');

    // 8. Đảm bảo sau khi áp dụng, popover đóng lại và TUYỆT ĐỐI không có lịch nào hiện bên phải
    expect(screen.queryByTestId('calendar-range-popover')).not.toBeInTheDocument();
    expect(container.querySelectorAll('input[type="date"]').length).toBe(0);
  });

  it('Áp dụng lịch (calendar) cho tùy chọn Theo tuần', () => {
    const handleWeekRangeChange = vi.fn();
    const handleCustomDateChange = vi.fn();

    render(
      <AttendancePeriodRangeFilter
        period="weeks"
        onPeriodChange={vi.fn()}
        dayRange="14"
        onDayRangeChange={vi.fn()}
        weekRange="12"
        onWeekRangeChange={handleWeekRangeChange}
        monthRange="12"
        onMonthRangeChange={vi.fn()}
        customStartDate="2026-08-15"
        customEndDate="2026-11-06"
        onCustomDateChange={handleCustomDateChange}
      />
    );

    expect(screen.getByTestId('period-dropdown-trigger')).toHaveTextContent('Theo tuần');
    expect(screen.getByTestId('range-dropdown-trigger')).toHaveTextContent('15/08 - 06/11');

    // Bấm nút range mở lịch chọn tuần
    fireEvent.click(screen.getByTestId('range-dropdown-trigger'));
    expect(screen.getByText('Chọn phạm vi tuần')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-week-first-date-input')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-week-last-date-input')).toBeInTheDocument();

    // Chọn tuần trên input
    const startWeekInput = screen.getByTestId('calendar-week-first-date-input');
    const endWeekInput = screen.getByTestId('calendar-week-last-date-input');
    fireEvent.change(startWeekInput, { target: { value: '2026-09-01' } });
    fireEvent.change(endWeekInput, { target: { value: '2026-11-06' } });

    // Bấm Áp dụng
    fireEvent.click(screen.getByText('Áp dụng'));
    expect(handleWeekRangeChange).toHaveBeenCalledWith('custom');
    expect(handleCustomDateChange).toHaveBeenCalledWith('2026-09-01', '2026-11-06');
  });

  it('Áp dụng lịch (calendar 12 tháng) cho tùy chọn Theo tháng', () => {
    const handleMonthRangeChange = vi.fn();
    const handleCustomDateChange = vi.fn();

    render(
      <AttendancePeriodRangeFilter
        period="months"
        onPeriodChange={vi.fn()}
        dayRange="14"
        onDayRangeChange={vi.fn()}
        weekRange="12"
        onWeekRangeChange={vi.fn()}
        monthRange="12"
        onMonthRangeChange={handleMonthRangeChange}
        customStartDate="2025-12-01"
        customEndDate="2026-11-30"
        onCustomDateChange={handleCustomDateChange}
      />
    );

    expect(screen.getByTestId('period-dropdown-trigger')).toHaveTextContent('Theo tháng');
    expect(screen.getByTestId('range-dropdown-trigger')).toHaveTextContent('01/12/2025 - 30/11/2026');

    // Bấm nút range mở lịch 12 tháng
    fireEvent.click(screen.getByTestId('range-dropdown-trigger'));
    expect(screen.getByText('Chọn phạm vi tháng')).toBeInTheDocument();
    expect(screen.getByText('Năm 2026')).toBeInTheDocument();
    expect(screen.getByText('Thg 1')).toBeInTheDocument();
    expect(screen.getByText('Thg 11')).toBeInTheDocument();

    // Bấm Áp dụng
    fireEvent.click(screen.getByText('Áp dụng'));
    expect(handleMonthRangeChange).toHaveBeenCalledWith('12');
  });

  it('Kích thước khung điều khiển cố định theo chuẩn phiên bản tháng (standard size) và không thay đổi khi chuyển đổi giữa ngày, tuần, tháng', () => {
    const { rerender } = render(
      <AttendancePeriodRangeFilter
        period="months"
        onPeriodChange={vi.fn()}
        dayRange="14"
        onDayRangeChange={vi.fn()}
        weekRange="12"
        onWeekRangeChange={vi.fn()}
        monthRange="12"
        onMonthRangeChange={vi.fn()}
        customStartDate="2025-12-01"
        customEndDate="2026-11-30"
        onCustomDateChange={vi.fn()}
      />
    );

    const monthPeriodBtn = screen.getByTestId('period-dropdown-trigger');
    const monthRangeBtn = screen.getByTestId('range-dropdown-trigger');
    expect(monthPeriodBtn).toHaveStyle({ width: '136px' });
    expect(monthRangeBtn).toHaveStyle({ width: '205px' });

    // Chuyển sang Theo ngày
    rerender(
      <AttendancePeriodRangeFilter
        period="days"
        onPeriodChange={vi.fn()}
        dayRange="14"
        onDayRangeChange={vi.fn()}
        weekRange="12"
        onWeekRangeChange={vi.fn()}
        monthRange="12"
        onMonthRangeChange={vi.fn()}
        customStartDate="2026-10-24"
        customEndDate="2026-11-06"
        onCustomDateChange={vi.fn()}
      />
    );

    const dayPeriodBtn = screen.getByTestId('period-dropdown-trigger');
    const dayRangeBtn = screen.getByTestId('range-dropdown-trigger');
    expect(dayPeriodBtn).toHaveStyle({ width: '136px' });
    expect(dayRangeBtn).toHaveStyle({ width: '205px' });

    // Chuyển sang Theo tuần
    rerender(
      <AttendancePeriodRangeFilter
        period="weeks"
        onPeriodChange={vi.fn()}
        dayRange="14"
        onDayRangeChange={vi.fn()}
        weekRange="12"
        onWeekRangeChange={vi.fn()}
        monthRange="12"
        onMonthRangeChange={vi.fn()}
        customStartDate="2026-08-15"
        customEndDate="2026-11-06"
        onCustomDateChange={vi.fn()}
      />
    );

    const weekPeriodBtn = screen.getByTestId('period-dropdown-trigger');
    const weekRangeBtn = screen.getByTestId('range-dropdown-trigger');
    expect(weekPeriodBtn).toHaveStyle({ width: '136px' });
    expect(weekRangeBtn).toHaveStyle({ width: '205px' });
  });
});
