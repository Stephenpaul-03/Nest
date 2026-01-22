/**
 * Events Redux Slice
 * State management for workspace calendar events
 */

import {
  Event,
  EventFormData,
  EventsState,
  TimePeriod,
  WeekStartDay
} from '@/src/types/event';
import {
  createEvent,
  formatDate
} from '@/src/utils/eventHelpers';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Storage key for persistence
export const eventsStorageKey = 'events';

// Helper to get current date string
const getTodayDate = (): string => formatDate(new Date());

// Helper to get current month string
const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Initialize with empty events - no mock data
const initialState: EventsState = {
  items: [],
  selectedDate: getTodayDate(),
  currentMonth: getCurrentMonth(),
  weekStart: 'sunday',
  modalMode: 'add',
  editingEventId: null,
  isModalOpen: false,
  timelineTab: 'today',
  isLoading: false,
  error: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Modal actions
    openAddModal: (state) => {
      state.modalMode = 'add';
      state.editingEventId = null;
      state.isModalOpen = true;
    },
    openEditModal: (state, action: PayloadAction<string>) => {
      state.modalMode = 'edit';
      state.editingEventId = action.payload;
      state.isModalOpen = true;
    },
    openViewModal: (state, action: PayloadAction<string>) => {
      state.modalMode = 'view';
      state.editingEventId = action.payload;
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingEventId = null;
    },

    // CRUD operations
    addEvent: (state, action: PayloadAction<EventFormData>) => {
      const newEvent = createEvent(action.payload);
      state.items.push(newEvent);
    },

    updateEvent: (
      state,
      action: PayloadAction<{ id: string; data: Partial<EventFormData> }>
    ) => {
      const { id, data } = action.payload;
      const index = state.items.findIndex((event) => event.id === id);
      if (index !== -1) {
        const existingEvent = state.items[index];
        const isMultiDay = data.isAllDay !== undefined
          ? (data.isAllDay && data.endDateTime 
            ? formatDate(new Date(data.startDateTime || existingEvent.startDateTime)) !== formatDate(new Date(data.endDateTime))
            : false)
          : existingEvent.isMultiDay;
        
        state.items[index] = {
          ...existingEvent,
          ...data,
          isMultiDay,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    deleteEvent: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((event) => event.id !== action.payload);
    },

    // Calendar navigation
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    
    setCurrentMonth: (state, action: PayloadAction<string>) => {
      state.currentMonth = action.payload;
    },
    
    navigateMonth: (state, action: PayloadAction<number>) => {
      const [year, month] = state.currentMonth.split('-').map(Number);
      const newDate = new Date(year, month - 1 + action.payload, 1);
      state.currentMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    },
    
    goToToday: (state) => {
      state.selectedDate = getTodayDate();
      state.currentMonth = getCurrentMonth();
    },

    // Week start preference
    setWeekStart: (state, action: PayloadAction<WeekStartDay>) => {
      state.weekStart = action.payload;
    },

    // Timeline tab
    setTimelineTab: (state, action: PayloadAction<TimePeriod>) => {
      state.timelineTab = action.payload;
    },

    // Load events (for future API integration)
    loadEvents: (state, action: PayloadAction<Event[]>) => {
      state.items = action.payload;
    },

    // Clear all events (for testing/reset)
    clearEvents: (state) => {
      state.items = [];
    },
  },
});

export const {
  openAddModal,
  openEditModal,
  openViewModal,
  closeModal,
  addEvent,
  updateEvent,
  deleteEvent,
  setSelectedDate,
  setCurrentMonth,
  navigateMonth,
  goToToday,
  setWeekStart,
  setTimelineTab,
  loadEvents,
  clearEvents,
} = eventsSlice.actions;

export default eventsSlice.reducer;

// ============================================================================
// Selectors
// ============================================================================

export const selectEvents = (state: { events: EventsState }) =>
  state.events.items;

export const selectSelectedDate = (state: { events: EventsState }) =>
  state.events.selectedDate;

export const selectCurrentMonth = (state: { events: EventsState }) =>
  state.events.currentMonth;

export const selectWeekStart = (state: { events: EventsState }) =>
  state.events.weekStart;

export const selectIsEventModalOpen = (state: { events: EventsState }) =>
  state.events.isModalOpen;

export const selectEventModalMode = (state: { events: EventsState }) =>
  state.events.modalMode;

export const selectEditingEventId = (state: { events: EventsState }) =>
  state.events.editingEventId;

export const selectTimelineTab = (state: { events: EventsState }) =>
  state.events.timelineTab;

export const selectEventsError = (state: { events: EventsState }) =>
  state.events.error;

// Get event by ID
export const selectEventById =
  (id: string) => (state: { events: EventsState }) =>
    state.events.items.find((event) => event.id === id);

// ============================================================================
// Filtered Selectors
// ============================================================================

import {
  getEventsByPeriod,
  getEventsForDate,
  getMonthEvents,
  getTodayEvents,
  getWeekEvents,
  isMultiDayEvent,
  sortEventsForDisplay
} from '@/src/utils/eventHelpers';

// Events for selected date
export const selectEventsForSelectedDate = (state: { events: EventsState }) => {
  const { items, selectedDate } = state.events;
  return sortEventsForDisplay(getEventsForDate(items, selectedDate));
};

// Today's events
export const selectTodayEvents = (state: { events: EventsState }) => {
  return sortEventsForDisplay(getTodayEvents(state.events.items));
};

// This week's events
export const selectWeekEvents = (state: { events: EventsState }) => {
  return sortEventsForDisplay(getWeekEvents(state.events.items));
};

// This month's events
export const selectMonthEvents = (state: { events: EventsState }) => {
  const [year, month] = state.events.currentMonth.split('-').map(Number);
  return sortEventsForDisplay(getMonthEvents(state.events.items, year - 1, month - 1));
};

// Events by timeline tab
export const selectEventsByTimelineTab = (state: { events: EventsState }) => {
  const { items, timelineTab } = state.events;
  return sortEventsForDisplay(getEventsByPeriod(items, timelineTab));
};

// Multi-day events for calendar display
export const selectMultiDayEvents = (state: { events: EventsState }) => {
  return state.events.items.filter(isMultiDayEvent);
};

// Regular (non-multi-day) events
export const selectRegularEvents = (state: { events: EventsState }) => {
  return state.events.items.filter(event => !isMultiDayEvent(event));
};

// Events grouped by date for calendar
export const selectEventsGroupedByDate = (state: { events: EventsState }) => {
  const grouped: Record<string, typeof state.events.items> = {};
  state.events.items.forEach(event => {
    const date = formatDate(new Date(event.startDateTime));
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  });
  return grouped;
};

// ============================================================================
// Computed Values
// ============================================================================

// Get month navigation state
export const selectMonthNavigation = (state: { events: EventsState }) => {
  const [year, month] = state.events.currentMonth.split('-').map(Number);
  const current = new Date(year, month - 1);
  const prevMonth = new Date(year, month - 2);
  const nextMonth = new Date(year, month);
  
  return {
    current: {
      year,
      month,
      label: current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    },
    prev: {
      year: prevMonth.getFullYear(),
      month: prevMonth.getMonth() + 1,
      label: prevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    },
    next: {
      year: nextMonth.getFullYear(),
      month: nextMonth.getMonth() + 1,
      label: nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  };
};

