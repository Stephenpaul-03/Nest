/**
 * Schedule Helper Utilities
 * Schedule filtering, grouping, and time-based operations
 */

import {
  ScheduleFilters,
  ScheduleItem,
  ScheduleVisibilityOptions,
  TIME_PERIOD_RANGES,
  TIME_PERIODS,
  TimePeriod
} from '@/src/types/schedule';

/**
 * Determine which time period a time falls into
 */
export function getTimePeriod(time: string): TimePeriod {
  const [hours] = time.split(':').map(Number);
  
  if (hours >= 5 && hours < 12) {
    return 'morning';
  } else if (hours >= 12 && hours < 17) {
    return 'afternoon';
  } else if (hours >= 17 && hours < 20) {
    return 'evening';
  } else {
    return 'night';
  }
}

/**
 * Sort times in chronological order
 */
export function sortTimes(times: string[]): string[] {
  return [...times].sort((a, b) => {
    const [aHours, aMinutes] = a.split(':').map(Number);
    const [bHours, bMinutes] = b.split(':').map(Number);
    return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
  });
}

/**
 * Format time for display (12-hour format)
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format time for 24-hour display
 */
export function formatTime24(time: string): string {
  return time;
}

/**
 * Check if a schedule item is paused
 */
export function isPaused(item: ScheduleItem): boolean {
  return !item.isActive;
}

/**
 * Check if a schedule item is active
 */
export function isActive(item: ScheduleItem): boolean {
  return item.isActive;
}

/**
 * Get total number of doses per day for a schedule item
 */
export function getDailyDoseCount(item: ScheduleItem): number {
  return item.times.length;
}

/**
 * Get all unique times from schedule items
 */
export function getAllTimes(items: ScheduleItem[]): string[] {
  const timesSet = new Set<string>();
  items.forEach((item) => {
    item.times.forEach((time) => timesSet.add(time));
  });
  return sortTimes(Array.from(timesSet));
}

/**
 * Group schedule items by medicine name for a person
 */
export function groupByMedicine(items: ScheduleItem[]): Map<string, ScheduleItem[]> {
  const grouped = new Map<string, ScheduleItem[]>();
  items.forEach((item) => {
    const existing = grouped.get(item.medicineName) || [];
    existing.push(item);
    grouped.set(item.medicineName, existing);
  });
  return grouped;
}

/**
 * Get unique medicines for a person
 */
export function getUniqueMedicines(items: ScheduleItem[]): string[] {
  return Array.from(new Set(items.map((item) => item.medicineName))).sort();
}

/**
 * Filter schedule items based on filters and visibility options
 */
export function matchesScheduleFilters(
  item: ScheduleItem,
  filters: ScheduleFilters,
  visibilityOptions: ScheduleVisibilityOptions
): boolean {
  // Filter by person
  if (filters.personId !== 'all' && item.personId !== filters.personId) {
    return false;
  }

  // Filter by status
  if (filters.status !== 'all') {
    if (filters.status === 'active' && !item.isActive) return false;
    if (filters.status === 'paused' && item.isActive) return false;
  }

  // Filter by search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      item.medicineName.toLowerCase().includes(searchLower) ||
      item.personName.toLowerCase().includes(searchLower) ||
      (item.notes && item.notes.toLowerCase().includes(searchLower));
    if (!matchesSearch) return false;
  }

  // Filter by visibility (paused items)
  if (!visibilityOptions.showPaused && !item.isActive) return false;

  return true;
}

/**
 * Filter items with full filter set
 */
export function filterScheduleItems(
  items: ScheduleItem[],
  filters: ScheduleFilters,
  visibilityOptions: ScheduleVisibilityOptions
): ScheduleItem[] {
  return items.filter((item) =>
    matchesScheduleFilters(item, filters, visibilityOptions)
  );
}

/**
 * Get unique people from schedule items
 */
export function getUniquePeople(items: ScheduleItem[]): Array<{ id: string; name: string }> {
  const peopleMap = new Map<string, string>();
  items.forEach((item) => {
    if (!peopleMap.has(item.personId)) {
      peopleMap.set(item.personId, item.personName);
    }
  });
  return Array.from(peopleMap.entries()).map(([id, name]) => ({ id, name }));
}

/**
 * Get schedule items for a specific person
 */
export function getItemsForPerson(
  items: ScheduleItem[],
  personId: string
): ScheduleItem[] {
  return items.filter((item) => item.personId === personId);
}

/**
 * Get active schedule items for a person
 */
export function getActiveItemsForPerson(
  items: ScheduleItem[],
  personId: string
): ScheduleItem[] {
  return items.filter((item) => item.personId === personId && item.isActive);
}

/**
 * Calculate total daily doses for a person
 */
export function getTotalDailyDoses(items: ScheduleItem[]): number {
  return items.filter((item) => item.isActive).reduce((total, item) => {
    return total + item.times.length;
  }, 0);
}

/**
 * Format dosage for display
 */
export function formatDosage(amount: string, unit: string): string {
  const unitLabel =
    amount === '1' || amount === '1.0' || amount === '1/2' || amount === '0.5'
      ? unit
      : `${unit}s`;
  return `${amount} ${unitLabel}`;
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTimeFormat(time: string): boolean {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
}

/**
 * Parse time string to hours and minutes
 */
export function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Create a default time for a time period
 */
export function getDefaultTimeForPeriod(period: TimePeriod): string {
  const range = TIME_PERIOD_RANGES[period];
  return range.defaultTimes[0];
}

/**
 * Check if a time is within a reasonable range for a period
 */
export function isTimeInPeriod(time: string, period: TimePeriod): boolean {
  const { hours } = parseTime(time);
  const { hours: rangeHours } = parseTime(TIME_PERIOD_RANGES[period].defaultTimes[0]);
  const { hours: rangeHoursEnd } = parseTime(
    TIME_PERIOD_RANGES[period].defaultTimes[TIME_PERIOD_RANGES[period].defaultTimes.length - 1]
  );
  
  // Allow some flexibility
  const adjustedHours = hours >= 24 ? hours - 24 : hours;
  return adjustedHours >= rangeHours - 1 && adjustedHours <= rangeHoursEnd + 1;
}

/**
 * Generate a unique ID for schedule items
 */
export function generateScheduleId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a schedule item object
 */
export function createScheduleItem(
  data: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>
): ScheduleItem {
  const now = new Date().toISOString();
  return {
    ...data,
    id: generateScheduleId(),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get medicines grouped by their times for timetable display
 */
export function getTimetableData(
  items: ScheduleItem[]
): Map<TimePeriod, Array<{ item: ScheduleItem; time: string }>> {
  const timetable = new Map<TimePeriod, Array<{ item: ScheduleItem; time: string }>>();
  
  // Initialize all periods
  TIME_PERIODS.forEach((period) => {
    timetable.set(period, []);
  });
  
  items
    .filter((item) => item.isActive)
    .forEach((item) => {
      item.times.forEach((time) => {
        const period = getTimePeriod(time);
        const existing = timetable.get(period) || [];
        existing.push({ item, time: sortTimes([time])[0] });
        timetable.set(period, existing);
      });
    });
  
  // Sort each period's items by time
  TIME_PERIODS.forEach((period) => {
    const value = timetable.get(period) || [];
    timetable.set(
      period,
      value.sort((a, b) => {
        const [aHours, aMinutes] = a.time.split(':').map(Number);
        const [bHours, bMinutes] = b.time.split(':').map(Number);
        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
      })
    );
  });
  
  return timetable;
}

/**
 * Get medicine schedule summary for a person
 */
export function getPersonScheduleSummary(items: ScheduleItem[]) {
  const activeCount = items.filter((item) => item.isActive).length;
  const pausedCount = items.filter((item) => !item.isActive).length;
  const totalDoses = getTotalDailyDoses(items);
  const uniqueMedicines = getUniqueMedicines(items).length;

  return {
    activeSchedules: activeCount,
    pausedSchedules: pausedCount,
    totalDailyDoses: totalDoses,
    uniqueMedicines: uniqueMedicines,
  };
}

