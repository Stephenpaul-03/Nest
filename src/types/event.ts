/**
 * Event Types
 * Data structure for workspace calendar events
 * Designed to map 1:1 to Google Calendar events for future sync
 */

// ============================================================================
// Core Types
// ============================================================================

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type WeekStartDay = 'monday' | 'sunday';

export interface EventReminder {
  //预留字段 - 未来用于提醒功能
  minutesBefore?: number;
  type?: 'notification' | 'email' | 'sms';
}

export interface Event {
  // Core identification
  id: string;
  
  // Event details
  title: string;
  description?: string;
  
  // Time information (device local time)
  startDateTime: string; // ISO 8601 datetime string
  endDateTime?: string; // ISO 8601 datetime string (optional)
  
  // Event type flags
  isAllDay: boolean;
  isMultiDay: boolean; // Derived, true if event spans multiple days
  
  // Recurrence
  recurrence: RecurrenceType;
  
  // Workspace scoping
  workspaceId?: string; // Future: for multi-workspace support
  
  // Authorship
  createdBy: string; // Person name or ID
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  
  // Future fields (reserved for features)
  reminders?: EventReminder[];
  location?: string; // Reserved for future location feature
  color?: string; // Reserved for future color coding
}

// ============================================================================
// Form Types
// ============================================================================

export interface EventFormData {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime?: string;
  isAllDay: boolean;
  recurrence: RecurrenceType;
  createdBy: string;
  reminders?: EventReminder[];
}

// ============================================================================
// Filter Types
// ============================================================================

export interface EventFilters {
  search: string;
  showAllDay: boolean;
  recurrence?: RecurrenceType;
}

// ============================================================================
// Store Types
// ============================================================================

export interface EventsState {
  // Events data
  items: Event[];
  
  // Calendar state
  selectedDate: string; // YYYY-MM-DD
  currentMonth: string; // YYYY-MM
  weekStart: WeekStartDay;
  
  // Modal state
  modalMode: 'add' | 'edit' | 'view';
  editingEventId: string | null;
  isModalOpen: boolean;
  
  // UI state
  timelineTab: 'today' | 'week' | 'month';
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Recurrence Constants
// ============================================================================

export const RECURRENCE_OPTIONS: { label: string; value: RecurrenceType; description: string }[] = [
  { label: 'Does not repeat', value: 'none', description: 'One-time event' },
  { label: 'Daily', value: 'daily', description: 'Every day' },
  { label: 'Weekly', value: 'weekly', description: 'Every week on the same day' },
  { label: 'Monthly', value: 'monthly', description: 'Same day each month' },
  { label: 'Yearly', value: 'yearly', description: 'Same date each year' },
];

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'No repeat',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

// ============================================================================
// Time Period Constants
// ============================================================================

export const TIME_PERIODS = ['today', 'week', 'month'] as const;
export type TimePeriod = typeof TIME_PERIODS[number];

// ============================================================================
// Calendar Constants
// ============================================================================

export const MONTHS: string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const SHORT_MONTHS: string[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const WEEKDAYS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAYS_MONDAY_START: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ============================================================================
// Helper Interfaces
// ============================================================================

export interface DayCellData {
  date: Date;
  dateString: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  events: Event[];
}

export interface WeekCellData {
  weekNumber: number;
  days: DayCellData[];
}

export interface EventWithPosition extends Event {
  gridPositions?: number[]; // For multi-day spanning
}

