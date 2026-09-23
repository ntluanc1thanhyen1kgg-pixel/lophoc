/**
 * dateUtils.ts - Tiện ích xử lý tuần và ngày tháng cho Kế hoạch dạy học
 */

export function parseDate(dateStr: string): Date {
  // Supports YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

export function formatDateVN(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Tính ngày Thứ Hai của tuần thứ `weekNumber` dựa trên ngày bắt đầu tuần 1
 */
export function getMondayOfWeek(startDateWeek1Str: string, weekNumber: number): Date {
  const baseDate = parseDate(startDateWeek1Str);
  // Ensure we are working from Monday of baseDate
  const day = baseDate.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const mondayWeek1 = new Date(baseDate);
  mondayWeek1.setDate(baseDate.getDate() + diffToMonday);

  // Add (weekNumber - 1) * 7 days
  const monday = new Date(mondayWeek1);
  monday.setDate(mondayWeek1.getDate() + (weekNumber - 1) * 7);
  return monday;
}

/**
 * Lấy khoảng ngày từ Thứ Hai đến Thứ Sáu của tuần thứ `weekNumber`
 */
export function getWeekDateRange(
  startDateWeek1Str: string,
  weekNumber: number
): { startDate: string; endDate: string; mondayDate: Date; fridayDate: Date } {
  const monday = getMondayOfWeek(startDateWeek1Str, weekNumber);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  return {
    startDate: formatDateVN(monday),
    endDate: formatDateVN(friday),
    mondayDate: monday,
    fridayDate: friday
  };
}

/**
 * Lấy ngày dạng DD/MM/YYYY cho thứ cụ thể trong tuần (2 = Thứ Hai, ..., 6 = Thứ Sáu, 7 = Thứ Bảy)
 */
export function getDateForDayOfWeek(
  startDateWeek1Str: string,
  weekNumber: number,
  dayOfWeek: number
): string {
  const monday = getMondayOfWeek(startDateWeek1Str, weekNumber);
  // dayOfWeek: 2 = Mon (offset 0), 3 = Tue (offset 1), ..., 7 = Sat (offset 5)
  const offset = Math.max(0, dayOfWeek - 2);
  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + offset);
  return formatDateVN(targetDate);
}

export function getDayOfWeekName(dayOfWeek: number): string {
  switch (dayOfWeek) {
    case 2:
      return 'Thứ Hai';
    case 3:
      return 'Thứ Ba';
    case 4:
      return 'Thứ Tư';
    case 5:
      return 'Thứ Năm';
    case 6:
      return 'Thứ Sáu';
    case 7:
      return 'Thứ Bảy';
    default:
      return `Thứ ${dayOfWeek}`;
  }
}
