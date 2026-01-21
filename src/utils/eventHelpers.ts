/**
 * Event Helper Utilities
 * Event manipulation, date formatting, and filtering operations
 */

import {
  DayCellData,
  Event,
  EventFormData,
  MONTHS,
  RECURRENCE_LABELS,
  SHORT_MONTHS,
  TimePeriod,
  WeekCellData,
  WeekStartDay
} from '@/src/types/event';

// ============================================================================
// ID Generation
// ============================================================================

export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Date Parsing & Formatting
// ============================================================================

/**
 * Parse ISO date string to Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to readable string
 */
export function formatDateReadable(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time from ISO string
 */
export function formatTime(dateTime: string, locale?: string): string {
  const date = new Date(dateTime);
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !is24HourFormat()
  });
}

/**
 * Format datetime for display
 */
export function formatDateTime(dateTime: string, locale?: string): string {
  const date = new Date(dateTime);
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get month name from date
 */
export function getMonthName(date: Date): string {
  return MONTHS[date.getMonth()];
}

/**
 * Get short month name from date
 */
export function getShortMonthName(date: Date): string {
  return SHORT_MONTHS[date.getMonth()];
}

/**
 * Get year from date
 */
export function getYear(date: Date): number {
  return date.getFullYear();
}

/**
 * Get month from date (0-11)
 */
export function getMonth(date: Date): number {
  return date.getMonth();
}

/**
 * Get day of month from date
 */
export function getDay(date: Date): number {
  return date.getDate();
}

/**
 * Get day of week from date (0 = Sunday, 1 = Monday, etc.)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Check if device uses 24-hour format
 */
function is24HourFormat(): boolean {
  const testDate = new Date();
  testDate.setHours(14, 0, 0, 0);
  const timeString = testDate.toLocaleTimeString();
  return !timeString.includes('PM') && !timeString.includes('AM');
}

// ============================================================================
// Calendar Generation
// ============================================================================

/**
 * Get first day of month
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/**
 * Get last day of month (including days to fill calendar grid)
 */
export function getLastDayOfMonthIndex(year: number, month: number, weekStart: WeekStartDay): number {
  const lastDay = new Date(year, month + 1, 0).getDay();
  // Adjust for week start day
  if (weekStart === 'monday') {
    return (lastDay + 6) % 7 + 6; // Include padding days
  }
  return lastDay + 6; // Include padding days
}

/**
 * Get number of days in month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Generate calendar grid data for a month
 */
export function generateCalendarDays(
  year: number,
  month: number,
  selectedDate: string,
  events: Event[],
  weekStart: WeekStartDay = 'sunday'
): DayCellData[] {
  const days: DayCellData[] = [];
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const today = formatDate(new Date());
  
  // Get the day of week for the first day (0-6)
  let firstDayOfWeek = firstDayOfMonth.getDay();
  if (weekStart === 'monday') {
    firstDayOfWeek = (firstDayOfWeek + 6) % 7; // Convert Sunday=0 to Monday=0
  }
  
  // Add padding days from previous month
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = new Date(year, month - 1, day);
    days.push(createDayCellData(date, false, selectedDate, today, events, weekStart));
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push(createDayCellData(date, true, selectedDate, today, events, weekStart));
  }
  
  // Add padding days from next month to complete the grid (6 rows × 7 days = 42)
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push(createDayCellData(date, false, selectedDate, today, events, weekStart));
  }
  
  return days;
}

/**
 * Create a single day cell data object
 */
function createDayCellData(
  date: Date,
  isCurrentMonth: boolean,
  selectedDate: string,
  today: string,
  events: Event[],
  weekStart: WeekStartDay
): DayCellData {
  const dateString = formatDate(date);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  return {
    date,
    dateString,
    isCurrentMonth,
    isToday: dateString === today,
    isSelected: dateString === selectedDate,
    isWeekend,
    events: getEventsForDate(events, dateString)
  };
}

/**
 * Get week cell data grouped by weeks
 */
export function generateWeekCells(
  year: number,
  month: number,
  selectedDate: string,
  events: Event[],
  weekStart: WeekStartDay = 'sunday'
): WeekCellData[] {
  const allDays = generateCalendarDays(year, month, selectedDate, events, weekStart);
  const weeks: WeekCellData[] = [];
  
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push({
      weekNumber: Math.floor(i / 7),
      days: allDays.slice(i, i + 7)
    });
  }
  
  return weeks;
}

// ============================================================================
// Event Filtering
// ============================================================================

/**
 * Get events for a specific date
 */
export function getEventsForDate(events: Event[], dateString: string): Event[] {
  return events.filter(event => {
    if (event.isAllDay) {
      // For all-day events, check if the date falls within the event range
      const eventStart = formatDate(parseDate(event.startDateTime));
      const eventEnd = event.endDateTime 
        ? formatDate(parseDate(event.endDateTime))
        : eventStart;
      return dateString >= eventStart && dateString <= eventEnd;
    }
    // For timed events, check if the date matches
    return formatDate(parseDate(event.startDateTime)) === dateString;
  });
}

/**
 * Get events for today
 */
export function getTodayEvents(events: Event[]): Event[] {
  const today = formatDate(new Date());
  return getEventsForDate(events, today);
}

/**
 * Get events for current week
 */
export function getWeekEvents(events: Event[], referenceDate?: Date): Event[] {
  const date = referenceDate || new Date();
  const startOfWeek = getStartOfWeek(date, 'sunday');
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  
  const startString = formatDate(startOfWeek);
  const endString = formatDate(endOfWeek);
  
  return events.filter(event => {
    const eventDate = formatDate(parseDate(event.startDateTime));
    return eventDate >= startString && eventDate <= endString;
  });
}

/**
 * Get events for current month
 */
export function getMonthEvents(events: Event[], year?: number, month?: number): Event[] {
  const now = new Date();
  const targetYear = year !== undefined ? year : now.getFullYear();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const startString = formatDate(new Date(targetYear, targetMonth, 1));
  const endString = formatDate(new Date(targetYear, targetMonth + 1, 0));
  
  return events.filter(event => {
    const eventDate = formatDate(parseDate(event.startDateTime));
    return eventDate >= startString && eventDate <= endString;
  });
}

/**
 * Get events by time period
 */
export function getEventsByPeriod(events: Event[], period: TimePeriod): Event[] {
  switch (period) {
    case 'today':
      return getTodayEvents(events);
    case 'week':
      return getWeekEvents(events);
    case 'month':
      return getMonthEvents(events);
    default:
      return events;
  }
}

// ============================================================================
// Multi-Day Event Handling
// ============================================================================

/**
 * Check if event spans multiple days
 */
export function isMultiDayEvent(event: Event): boolean {
  if (event.isAllDay && event.endDateTime) {
    const start = parseDate(event.startDateTime);
    const end = parseDate(event.endDateTime);
    // All-day events that span past midnight are multi-day
    return start.toDateString() !== end.toDateString();
  }
  return false;
}

/**
 * Get display dates for a multi-day event
 */
export function getMultiDayEventDates(event: Event): string[] {
  if (!event.endDateTime) return [];
  
  const dates: string[] = [];
  const start = parseDate(event.startDateTime);
  const end = parseDate(event.endDateTime);
  const current = new Date(start);
  
  // Include the start date
  while (formatDate(current) <= formatDate(end)) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Get visible portion of multi-day event for a specific date
 */
export function getMultiDayEventPosition(
  event: Event,
  dateString: string
): { isStart: boolean; isEnd: boolean; isMiddle: boolean; isFull: boolean } {
  if (!event.endDateTime) {
    return { isStart: true, isEnd: true, isMiddle: false, isFull: true };
  }
  
  const eventStart = formatDate(parseDate(event.startDateTime));
  const eventEnd = formatDate(parseDate(event.endDateTime));
  
  if (dateString === eventStart && dateString === eventEnd) {
    return { isStart: true, isEnd: true, isMiddle: false, isFull: true };
  }
  
  return {
    isStart: dateString === eventStart,
    isEnd: dateString === eventEnd,
    isMiddle: dateString > eventStart && dateString < eventEnd,
    isFull: false
  };
}

// ============================================================================
// Recurrence Generation
// ============================================================================

/**
 * Check if an event is recurring
 */
export function isRecurringEvent(event: Event): boolean {
  return event.recurrence !== 'none';
}

/**
 * Generate next occurrence dates for recurring event
 * (Simple implementation for display purposes)
 */
export function getRecurrenceDates(
  event: Event,
  count: number = 10
): string[] {
  if (event.recurrence === 'none') {
    return [event.startDateTime];
  }
  
  const dates: string[] = [];
  const startDate = parseDate(event.startDateTime);
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    dates.push(currentDate.toISOString());
    
    switch (event.recurrence) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
    
    // Safety limit
    if (currentDate.getFullYear() > startDate.getFullYear() + 5) {
      break;
    }
  }
  
  return dates;
}

/**
 * Get recurrence display label
 */
export function getRecurrenceLabel(event: Event): string {
  return RECURRENCE_LABELS[event.recurrence];
}

// ============================================================================
// Week Calculations
// ============================================================================

/**
 * Get start of week for a given date
 */
export function getStartOfWeek(date: Date, weekStart: WeekStartDay): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay();
  
  if (weekStart === 'monday') {
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    result.setDate(result.getDate() - diff);
  } else {
    result.setDate(result.getDate() - dayOfWeek);
  }
  
  return result;
}

/**
 * Get end of week for a given date
 */
export function getEndOfWeek(date: Date, weekStart: WeekStartDay): Date {
  const start = getStartOfWeek(date, weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return formatDate(date) === formatDate(new Date());
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

// ============================================================================
// Event Creation & Updates
// ============================================================================

/**
 * Create a new event from form data
 */
export function createEvent(data: EventFormData): Event {
  const now = new Date().toISOString();
  return {
    ...data,
    id: generateEventId(),
    isMultiDay: data.isAllDay && !!data.endDateTime 
      ? formatDate(parseDate(data.startDateTime)) !== formatDate(parseDate(data.endDateTime))
      : false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update an existing event
 */
export function updateEvent(event: Event, updates: Partial<EventFormData>): Event {
  const { startDateTime, endDateTime, isAllDay } = updates;
  
  const isMultiDay = isAllDay !== undefined 
    ? (isAllDay && endDateTime ? formatDate(parseDate(startDateTime || event.startDateTime)) !== formatDate(parseDate(endDateTime)) : false)
    : event.isMultiDay;
  
  return {
    ...event,
    ...updates,
    isMultiDay,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Clone event with new dates (for recurrence instances - future feature)
 */
export function cloneEventForDate(event: Event, newDate: Date): Event {
  const startDate = parseDate(event.startDateTime);
  const timeDiff = newDate.getTime() - startDate.getTime();
  
  const newStartDateTime = new Date(event.startDateTime.getTime() + timeDiff).toISOString();
  const newEndDateTime = event.endDateTime
    ? new Date(event.endDateTime.getTime() + timeDiff).toISOString()
    : undefined;
  
  return {
    ...event,
    id: generateEventId(), // New ID for instance
    startDateTime: newStartDateTime,
    endDateTime: newEndDateTime,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate event form data
 */
export function validateEventForm(data: EventFormData): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  if (!data.title.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!data.startDateTime) {
    errors.startDateTime = 'Start date and time are required';
  }
  
  if (data.endDateTime && data.endDateTime < data.startDateTime) {
    errors.endDateTime = 'End date must be after start date';
  }
  
  if (!data.createdBy.trim()) {
    errors.createdBy = 'Created by is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Check if event is ongoing (currently happening)
 */
export function isEventOngoing(event: Event): boolean {
  const now = new Date();
  const start = parseDate(event.startDateTime);
  const end = event.endDateTime ? parseDate(event.endDateTime) : start;
  
  return now >= start && now <= end;
}

/**
 * Check if event has started but not ended
 */
export function isEventStarted(event: Event): boolean {
  const now = new Date();
  return now >= parseDate(event.startDateTime);
}

/**
 * Check if event is in the future
 */
export function isEventFuture(event: Event): boolean {
  const now = new Date();
  return parseDate(event.startDateTime) > now;
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sort events by start time
 */
export function sortEventsByTime(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
  });
}

/**
 * Sort events with all-day events first
 */
export function sortEventsForDisplay(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
  });
}

/**
 * Get upcoming events within a number of days
 */
export function getUpcomingEvents(events: Event[], days: number): Event[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);
  
  return events
    .filter((event) => {
      const eventDate = new Date(event.startDateTime);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today && eventDate <= endDate;
    })
    .sort((a, b) => {
      return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
    });
}

