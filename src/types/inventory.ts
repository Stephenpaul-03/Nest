/**
 * Medical Inventory Types
 * Spreadsheet-friendly data structure for medical items
 */

// ============================================================================
// Core Types
// ============================================================================

export type ItemStatus = 'active' | 'out_of_stock';

export interface MedicalItem {
  // Core identification
  id: string;
  name: string;

  // Classification - always 'medicine' now
  type: 'medicine';
  category: string; // User-defined (e.g., "Pain Relief", "Antibiotics", "Vitamins")

  // Stock information
  quantity: number;
  unit: 'tablets' | 'bottles' | 'strips';
  
  // For strips: number of tablets per strip (e.g., 10 tablets per strip)
  tabletsPerStrip?: number;

  // Expiry (optional for medicines)
  expiryDate?: string; // ISO 8601 date string (YYYY-MM-DD)

  // Thresholds and alerts
  lowStockThreshold: number;

  // Optional assignment (person name or ID)
  assignedTo?: string;

  // Notes
  notes?: string;

  // Status derived from quantity
  status: ItemStatus;

  // Metadata
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

// ============================================================================
// Filter Types
// ============================================================================

export interface InventoryFilters {
  category?: string | 'all';
  status?: ItemStatus | 'all';
  search?: string;
  assignedTo?: string | 'all';
}

export interface InventoryVisibilityOptions {
  showExpired: boolean;
  showOutOfStock: boolean;
}

// ============================================================================
// Alert Types
// ============================================================================

export interface InventoryAlerts {
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number;
  expiredCount: number;
}

export interface ExpiryConfig {
  warningDays: number; // Default: 30 days
}

// ============================================================================
// Modal Types
// ============================================================================

export type ModalMode = 'add' | 'edit';

export interface ItemFormData {
  name: string;
  type: 'medicine'; // Always medicine now
  category: string;
  quantity: number;
  unit: 'tablets' | 'bottles' | 'strips';
  tabletsPerStrip?: number; // Only used when unit is 'strips'
  expiryDate?: string;
  lowStockThreshold: number;
  assignedTo?: string;
  notes?: string;
}

// ============================================================================
// Store Types
// ============================================================================

export interface InventoryState {
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

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_EXPIRY_WARNING_DAYS = 30;

export const ITEM_UNITS = [
  { label: 'Tablets', value: 'tablets' as const },
  { label: 'Bottles', value: 'bottles' as const },
  { label: 'Strips', value: 'strips' as const },
] as const;

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

// Sample users for dropdown - in production this would come from a users store/API
export const SAMPLE_USERS = [
  { id: 'user1', name: 'John Doe' },
  { id: 'user2', name: 'Jane Smith' },
  { id: 'user3', name: 'Mike Johnson' },
  { id: 'user4', name: 'Sarah Williams' },
  { id: 'user5', name: 'Tom Brown' },
  { id: 'user6', name: 'Emily Davis' },
  { id: 'user7', name: 'Chris Wilson' },
  { id: 'user8', name: 'Lisa Anderson' },
];

export const DEFAULT_USERS = SAMPLE_USERS.map(u => u.name);

// ============================================================================
// Spreadsheet Mapping Notes
// ============================================================================
//
// The MedicalItem structure is designed to map 1:1 to spreadsheet columns:
//
// | id | name | type | category | quantity | unit | tabletsPerStrip | expiryDate | lowStockThreshold | assignedTo | notes | status | createdAt | updatedAt |
//
// All fields are flat (no nested objects) for easy CSV/Excel export.
// Date fields use ISO 8601 format for consistent parsing.
//
