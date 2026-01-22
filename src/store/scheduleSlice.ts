/**
 * Schedule Redux Slice
 * State management for medical schedules
 */

import {
  ScheduleFilters,
  ScheduleFormData,
  ScheduleItem,
  ScheduleState,
  ScheduleVisibilityOptions
} from '@/src/types/schedule';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Storage key for persistence
export const scheduleStorageKey = 'schedule';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const createScheduleItem = (data: ScheduleFormData): ScheduleItem => {
  const now = new Date().toISOString();
  return {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
};

// Initialize with empty items - no mock data
const initialFilters: ScheduleFilters = {
  personId: 'all',
  status: 'all',
  search: '',
};

const initialVisibilityOptions: ScheduleVisibilityOptions = {
  showPaused: true,
};

const initialState: ScheduleState = {
  items: [],
  filters: initialFilters,
  visibilityOptions: initialVisibilityOptions,
  modalMode: 'add',
  editingItemId: null,
  isModalOpen: false,
  isEditMode: false,
  isLoading: false,
  error: null,
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    // Modal actions
    openAddModal: (state) => {
      state.modalMode = 'add';
      state.editingItemId = null;
      state.isModalOpen = true;
    },
    openEditModal: (state, action: PayloadAction<string>) => {
      state.modalMode = 'edit';
      state.editingItemId = action.payload;
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingItemId = null;
    },

    // CRUD operations
    addItem: (state, action: PayloadAction<ScheduleFormData>) => {
      const newItem = createScheduleItem(action.payload);
      state.items.push(newItem);
    },

    updateItem: (
      state,
      action: PayloadAction<{ id: string; data: Partial<ScheduleFormData> }>
    ) => {
      const { id, data } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        const existingItem = state.items[index];
        const updatedItem: ScheduleItem = {
          ...existingItem,
          ...data,
          id: existingItem.id,
          personId: data.personId ?? existingItem.personId,
          personName: data.personName ?? existingItem.personName,
          createdAt: existingItem.createdAt,
          updatedAt: new Date().toISOString(),
        };
        state.items[index] = updatedItem;
      }
    },

    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    // Inline editing operations (for edit mode)
    updateDosageAmount: (
      state,
      action: PayloadAction<{ id: string; dosageAmount: string }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.dosageAmount = action.payload.dosageAmount;
        item.updatedAt = new Date().toISOString();
      }
    },

    updateTimes: (
      state,
      action: PayloadAction<{ id: string; times: string[] }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.times = action.payload.times;
        item.updatedAt = new Date().toISOString();
      }
    },

    // Toggle active/paused status
    toggleActive: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        item.isActive = !item.isActive;
        item.updatedAt = new Date().toISOString();
      }
    },

    setActive: (state, action: PayloadAction<{ id: string; isActive: boolean }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.isActive = action.payload.isActive;
        item.updatedAt = new Date().toISOString();
      }
    },

    // Filter actions
    setFilters: (state, action: PayloadAction<Partial<ScheduleFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },

    // Visibility options
    setVisibilityOptions: (
      state,
      action: PayloadAction<Partial<ScheduleVisibilityOptions>>
    ) => {
      state.visibilityOptions = {
        ...state.visibilityOptions,
        ...action.payload,
      };
    },

    // Edit mode toggle
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
    },
    toggleEditMode: (state) => {
      state.isEditMode = !state.isEditMode;
    },

    // Load items (for future API integration)
    loadItems: (state, action: PayloadAction<ScheduleItem[]>) => {
      state.items = action.payload;
    },

    // Clear all items (for testing/reset)
    clearItems: (state) => {
      state.items = [];
    },
  },
});

export const {
  openAddModal,
  openEditModal,
  closeModal,
  addItem,
  updateItem,
  deleteItem,
  updateDosageAmount,
  updateTimes,
  toggleActive,
  setActive,
  setFilters,
  resetFilters,
  setVisibilityOptions,
  setEditMode,
  toggleEditMode,
  loadItems,
  clearItems,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;

// Selectors
export const selectScheduleItems = (state: { schedule: ScheduleState }) =>
  state.schedule.items;

export const selectScheduleFilters = (state: { schedule: ScheduleState }) =>
  state.schedule.filters;

export const selectScheduleVisibilityOptions = (state: {
  schedule: ScheduleState;
}) => state.schedule.visibilityOptions;

export const selectIsScheduleModalOpen = (state: { schedule: ScheduleState }) =>
  state.schedule.isModalOpen;

export const selectScheduleModalMode = (state: { schedule: ScheduleState }) =>
  state.schedule.modalMode;

export const selectEditingScheduleItemId = (state: {
  schedule: ScheduleState;
}) => state.schedule.editingItemId;

export const selectIsEditMode = (state: { schedule: ScheduleState }) =>
  state.schedule.isEditMode;

export const selectScheduleError = (state: { schedule: ScheduleState }) =>
  state.schedule.error;

export const selectScheduleItemById =
  (id: string) => (state: { schedule: ScheduleState }) =>
    state.schedule.items.find((item) => item.id === id);

// Filtered selectors
export const selectActiveItems = (state: { schedule: ScheduleState }) =>
  state.schedule.items.filter((item) => item.isActive);

export const selectItemsByPerson =
  (personId: string) => (state: { schedule: ScheduleState }) =>
    state.schedule.items.filter((item) => item.personId === personId);

export const selectFilteredItems = (state: { schedule: ScheduleState }) => {
  const { items, filters, visibilityOptions } = state.schedule;
  return items.filter((item) => {
    // Filter by person
    if (filters.personId !== 'all' && item.personId !== filters.personId)
      return false;

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
  });
};

// Get unique people from schedule items
export const selectUniquePeople = (state: { schedule: ScheduleState }) => {
  const peopleMap = new Map<string, string>();
  state.schedule.items.forEach((item) => {
    if (!peopleMap.has(item.personId)) {
      peopleMap.set(item.personId, item.personName);
    }
  });
  return Array.from(peopleMap.entries()).map(([id, name]) => ({ id, name }));
};

