/**
 * Inventory Redux Slice
 * State management for medical inventory items
 */

import {
  DEFAULT_EXPIRY_WARNING_DAYS,
  ExpiryConfig,
  InventoryFilters,
  InventoryVisibilityOptions,
  ItemFormData,
  MedicalItem,
  ModalMode,
} from '@/src/types/inventory';
import {
  createItem,
  getCalculatedStatus,
} from '@/src/utils/inventoryHelpers';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Storage key for persistence
export const inventoryStorageKey = 'inventory';

interface InventoryState {
  items: MedicalItem[];
  filters: InventoryFilters;
  visibilityOptions: InventoryVisibilityOptions;
  modalMode: ModalMode;
  editingItemId: string | null;
  isModalOpen: boolean;
  expiryConfig: ExpiryConfig;
  isLoading: boolean;
  error: string | null;
}

const initialFilters: InventoryFilters = {
  category: 'all',
  status: 'all',
  search: '',
  assignedTo: 'all',
};

const initialVisibilityOptions: InventoryVisibilityOptions = {
  showExpired: true,
  showOutOfStock: true,
};

const initialExpiryConfig: ExpiryConfig = {
  warningDays: DEFAULT_EXPIRY_WARNING_DAYS,
};

const sampleItems: MedicalItem[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    type: 'medicine',
    category: 'Pain Relief',
    quantity: 50,
    unit: 'tablets',
    expiryDate: '2025-06-15',
    lowStockThreshold: 20,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Ibuprofen 400mg',
    type: 'medicine',
    category: 'Pain Relief',
    quantity: 5,
    unit: 'tablets',
    expiryDate: '2025-03-20',
    lowStockThreshold: 10,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Amoxicillin 250mg',
    type: 'medicine',
    category: 'Antibiotics',
    quantity: 0,
    unit: 'tablets',
    expiryDate: '2025-12-01',
    lowStockThreshold: 10,
    status: 'out_of_stock',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Vitamin C 1000mg',
    type: 'medicine',
    category: 'Vitamins',
    quantity: 30,
    unit: 'tablets',
    expiryDate: '2025-08-30',
    lowStockThreshold: 10,
    status: 'active',
    assignedTo: 'John Doe',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Cetirizine 10mg',
    type: 'medicine',
    category: 'Allergy',
    quantity: 2,
    unit: 'strips',
    tabletsPerStrip: 10,
    expiryDate: '2025-01-10',
    lowStockThreshold: 5,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: 'Omeprazole 20mg',
    type: 'medicine',
    category: 'Gastric',
    quantity: 15,
    unit: 'tablets',
    expiryDate: '2025-01-10',
    lowStockThreshold: 10,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '7',
    name: 'Metformin 500mg',
    type: 'medicine',
    category: 'Diabetes',
    quantity: 8,
    unit: 'bottles',
    expiryDate: '2025-04-15',
    lowStockThreshold: 3,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '8',
    name: 'Aspirin 75mg',
    type: 'medicine',
    category: 'Cardiovascular',
    quantity: 25,
    unit: 'tablets',
    expiryDate: '2025-07-20',
    lowStockThreshold: 10,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const initialState: InventoryState = {
  items: sampleItems,
  filters: initialFilters,
  visibilityOptions: initialVisibilityOptions,
  modalMode: 'add',
  editingItemId: null,
  isModalOpen: false,
  expiryConfig: initialExpiryConfig,
  isLoading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
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
    addItem: (state, action: PayloadAction<ItemFormData>) => {
      const newItem = createItem(action.payload);
      state.items.push(newItem);
    },

    updateItem: (
      state,
      action: PayloadAction<{ id: string; data: Partial<ItemFormData> }>
    ) => {
      const { id, data } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        const existingItem = state.items[index];
        const updatedItem: MedicalItem = {
          ...existingItem,
          ...data,
          id: existingItem.id,
          type: 'medicine',
          createdAt: existingItem.createdAt,
          updatedAt: new Date().toISOString(),
          status:
            data.quantity !== undefined
              ? getCalculatedStatus({
                  ...existingItem,
                  quantity: data.quantity,
                  lowStockThreshold:
                    data.lowStockThreshold ?? existingItem.lowStockThreshold,
                  expiryDate: data.expiryDate ?? existingItem.expiryDate,
                } as MedicalItem)
              : existingItem.status,
        };
        state.items[index] = updatedItem;
      }
    },

    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    // Quantity operations
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
        item.status = getCalculatedStatus(item);
        item.updatedAt = new Date().toISOString();
      }
    },

    decrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item && item.quantity > 0) {
        item.quantity -= 1;
        item.status = getCalculatedStatus(item);
        item.updatedAt = new Date().toISOString();
      }
    },

    setQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity);
        item.status = getCalculatedStatus(item);
        item.updatedAt = new Date().toISOString();
      }
    },

    // Filter actions
    setFilters: (state, action: PayloadAction<Partial<InventoryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },

    // Visibility options
    setVisibilityOptions: (
      state,
      action: PayloadAction<Partial<InventoryVisibilityOptions>>
    ) => {
      state.visibilityOptions = {
        ...state.visibilityOptions,
        ...action.payload,
      };
    },

    // Config actions
    setExpiryConfig: (state, action: PayloadAction<Partial<ExpiryConfig>>) => {
      state.expiryConfig = { ...state.expiryConfig, ...action.payload };
    },

    // Bulk operations
    restockItem: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity += action.payload.quantity;
        item.status = getCalculatedStatus(item);
        item.updatedAt = new Date().toISOString();
      }
    },

    // Load items (for future API integration)
    loadItems: (state, action: PayloadAction<MedicalItem[]>) => {
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
  incrementQuantity,
  decrementQuantity,
  setQuantity,
  setFilters,
  resetFilters,
  setVisibilityOptions,
  setExpiryConfig,
  restockItem,
  loadItems,
  clearItems,
} = inventorySlice.actions;

export default inventorySlice.reducer;

// Selectors
export const selectItems = (state: { inventory: InventoryState }) =>
  state.inventory.items;

export const selectFilters = (state: { inventory: InventoryState }) =>
  state.inventory.filters;

export const selectVisibilityOptions = (state: {
  inventory: InventoryState;
}) => state.inventory.visibilityOptions;

export const selectIsModalOpen = (state: { inventory: InventoryState }) =>
  state.inventory.isModalOpen;

export const selectModalMode = (state: { inventory: InventoryState }) =>
  state.inventory.modalMode;

export const selectEditingItemId = (state: {
  inventory: InventoryState;
}) => state.inventory.editingItemId;

export const selectExpiryConfig = (state: {
  inventory: InventoryState;
}) => state.inventory.expiryConfig;

export const selectItemById =
  (id: string) => (state: { inventory: InventoryState }) =>
    state.inventory.items.find((item) => item.id === id);
