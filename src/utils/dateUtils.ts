import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
  addWeeks,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from 'date-fns';

export function getCalendarDays(date: Date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

export function formatDate(date: Date, formatStr: string = 'MMM dd') {
  return format(date, formatStr);
}

export function isCurrentMonth(date: Date, currentMonth: Date) {
  return isSameMonth(date, currentMonth);
}

export function isTodayDate(date: Date) {
  return isToday(date);
}

export function getDaysInRange(startDate: Date, endDate: Date) {
  return eachDayOfInterval({ start: startDate, end: endDate });
}

export function normalizeDateRange(startDate: Date, endDate: Date) {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  return start <= end ? { start, end } : { start: end, end: start };
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date) {
  const { start, end } = normalizeDateRange(startDate, endDate);
  return isWithinInterval(date, { start, end });
}

export function getWeeksFromToday(weeks: number) {
  const today = new Date();
  const futureDate = addWeeks(today, weeks);
  return { start: today, end: futureDate };
}

export function getMonthName(date: Date) {
  return format(date, 'MMMM yyyy');
}

export function getDayName(date: Date) {
  return format(date, 'EEE');
}

export function getDayNumber(date: Date) {
  return format(date, 'd');
}
