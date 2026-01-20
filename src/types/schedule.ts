/**
 * Medical Schedule Types
 * Spreadsheet-friendly data structure for medicine schedules
 */

// ============================================================================
// Core Types
// ============================================================================

export type Frequency = 'daily';

export type DosageUnit = 'tablet' | 'capsule' | 'ml' | 'drop' | 'teaspoon' | 'tablespoon' | 'patch' | 'injection' | 'other';

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ScheduleItem {
  // Core identification
  id: string;
  
  // Medicine information
  medicineName: string;
  
  // Person assignment
  personId: string;
  personName: string;
  
  // Dosage information
  dosageAmount: string; // Can be "1", "1/2", "2", "0.5", etc.
  dosageUnit: DosageUnit;
  
  // Schedule times (device local time, 24-hour format)
  times: string[]; // e.g., ["09:00", "21:00"]
  
  // Frequency - currently only "daily" supported
  frequency: Frequency;
  
  // Duration
  startDate: string; // ISO 8601 date string (YYYY-MM-DD)
  
  // Status
  isActive: boolean;
  
  // Optional notes
  notes?: string;
  
  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

// ============================================================================
// Filter Types
// ============================================================================

export interface ScheduleFilters {
  personId: string | 'all';
  status: 'all' | 'active' | 'paused';
  search: string;
}

export interface ScheduleVisibilityOptions {
  showPaused: boolean;
}

// ============================================================================
// Modal Types
// ============================================================================

export type ScheduleModalMode = 'add' | 'edit';

export interface ScheduleFormData {
  medicineName: string;
  personId: string;
  personName: string;
  dosageAmount: string;
  dosageUnit: DosageUnit;
  times: string[];
  frequency: Frequency;
  startDate: string;
  isActive: boolean;
  notes?: string;
}

// ============================================================================
// Store Types
// ============================================================================

export interface ScheduleState {
  items: ScheduleItem[];
  filters: ScheduleFilters;
  visibilityOptions: ScheduleVisibilityOptions;
  modalMode: ScheduleModalMode;
  editingItemId: string | null;
  isModalOpen: boolean;
  isEditMode: boolean; // Toggle for inline editing
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_USERS = [
  { id: 'user1', name: 'John Doe' },
  { id: 'user2', name: 'Jane Smith' },
  { id: 'user3', name: 'Mike Johnson' },
  { id: 'user4', name: 'Sarah Williams' },
  { id: 'user5', name: 'Tom Brown' },
  { id: 'user6', name: 'Emily Davis' },
  { id: 'user7', name: 'Chris Wilson' },
  { id: 'user8', name: 'Lisa Anderson' },
] as const;

export const DOSAGE_UNITS = [
  { label: 'Tablet(s)', value: 'tablet' as const },
  { label: 'Capsule(s)', value: 'capsule' as const },
  { label: 'ml', value: 'ml' as const },
  { label: 'Drop(s)', value: 'drop' as const },
  { label: 'Teaspoon', value: 'teaspoon' as const },
  { label: 'Tablespoon', value: 'tablespoon' as const },
  { label: 'Patch', value: 'patch' as const },
  { label: 'Injection', value: 'injection' as const },
  { label: 'Other', value: 'other' as const },
] as const;

export const TIME_PERIODS: TimePeriod[] = ['morning', 'afternoon', 'evening', 'night'];

export const TIME_PERIOD_RANGES: Record<TimePeriod, { label: string; icon: string; defaultTimes: string[] }> = {
  morning: { label: 'Morning', icon: 'weather-sunny', defaultTimes: ['08:00', '09:00'] },
  afternoon: { label: 'Afternoon', icon: 'weather-partly-cloudy', defaultTimes: ['12:00', '13:00'] },
  evening: { label: 'Evening', icon: 'weather-sunset', defaultTimes: ['17:00', '18:00'] },
  night: { label: 'Night', icon: 'weather-night', defaultTimes: ['20:00', '21:00', '22:00'] },
};

export const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'daily' as const },
] as const;

// ============================================================================
// Helper Types
// ============================================================================

export interface TimeSlot {
  period: TimePeriod;
  time: string;
}

export interface PersonSchedule {
  personId: string;
  personName: string;
  items: ScheduleItem[];
  totalDoses: number;
}

// ============================================================================
// Spreadsheet Mapping Notes
// ============================================================================
//
// The ScheduleItem structure is designed to map 1:1 to spreadsheet columns:
//
// | id | medicineName | personId | personName | dosageAmount | dosageUnit | times | frequency | startDate | isActive | notes | createdAt | updatedAt |
//
// All fields are flat (no nested objects) for easy CSV/Excel export.
// Date fields use ISO 8601 format for consistent parsing.
// times field uses pipe-separated values: "09:00|21:00"
//
