/**
 * Workspace Actions
 * 
 * Redux actions for workspace management and mock data seeding.
 * These actions are only used in development mode.
 */

import type { Event } from '@/src/types/event';
import type { MedicalItem } from '@/src/types/inventory';
import type { ScheduleItem } from '@/src/types/schedule';
import type { Transaction } from '@/src/types/transaction';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import {
  clearEvents,
  loadEvents as loadEventsAction
} from './eventsSlice';
import type { RootState } from './index';
import {
  clearItems,
  loadItems as loadItemsAction
} from './inventorySlice';
import {
  getMockDataForWorkspace,
  hasMockData
} from './mockData';
import {
  clearItems as clearScheduleItems,
  loadItems as loadScheduleItemsAction
} from './scheduleSlice';
import {
  clearAllTransactions,
  loadTransactions as loadTransactionsAction
} from './transactionSlice';

// Type-only imports for state interfaces
import type { EventsState } from '@/src/types/event';
import type { InventoryState } from '@/src/types/inventory';
import type { ScheduleState } from '@/src/types/schedule';
import type { TransactionState } from '@/src/types/transaction';

// ============================================================================
// Types
// ============================================================================

export interface WorkspaceSwitchPayload {
  workspaceId: string;
}

export interface WorkspaceState {
  lastSwitchedWorkspace: string | null;
  isSwitching: boolean;
}

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Switch Workspace Thunk
 * 
 * Clears all tool data and loads mock data for the newly selected workspace.
 * This is the main orchestrating action for workspace switching.
 * 
 * Only runs in development mode (__DEV__).
 */
export const switchWorkspace = createAsyncThunk(
  'workspace/switchWorkspace',
  async (workspaceId: string, { dispatch }) => {
    // Only run in development mode
    if (!__DEV__) {
      return { success: true, workspaceId, skipped: true };
    }

    // Check if workspace has mock data
    if (!hasMockData(workspaceId)) {
      console.warn(`[Workspace] No mock data for workspace: ${workspaceId}. Clearing all data.`);
      
      // Clear all data even if no mock data exists
      dispatch(clearAllToolDataThunk());
      return { success: true, workspaceId, skipped: true };
    }

    // Get mock data for workspace
    const mockData = getMockDataForWorkspace(workspaceId);

    console.log(`[Workspace] Switching to workspace: ${workspaceId}`);
    console.log(`[Workspace] Loading mock data...`);

    // Clear all existing data first
    dispatch(clearAllToolDataThunk());

    // Get current date for timestamps
    const now = new Date().toISOString();

    // Transform transactions with IDs and timestamps
    const transactions: Transaction[] = mockData.transactions.map((t, index) => ({
      ...t,
      id: `ws-${workspaceId.toLowerCase()}-txn-${index + 1}`,
      createdAt: now,
      updatedAt: now,
    }));

    // Transform inventory items with timestamps
    const inventory: MedicalItem[] = mockData.inventory.map((item, index) => ({
      ...item,
      id: `ws-${workspaceId.toLowerCase()}-med-${index + 1}`,
      createdAt: now,
      updatedAt: now,
    }));

    // Transform schedule items with timestamps
    const schedule: ScheduleItem[] = mockData.schedule.map((item, index) => ({
      ...item,
      id: `ws-${workspaceId.toLowerCase()}-sch-${index + 1}`,
      createdAt: now,
      updatedAt: now,
    }));

    // Transform events with timestamps
    const events: Event[] = mockData.events.map((event, index) => ({
      ...event,
      id: `ws-${workspaceId.toLowerCase()}-evt-${index + 1}`,
      createdAt: now,
      updatedAt: now,
    }));

    // Load mock data for each slice
    dispatch(loadTransactionsAction(transactions));
    dispatch(loadItemsAction(inventory));
    dispatch(loadScheduleItemsAction(schedule));
    dispatch(loadEventsAction(events));

    console.log(`[Workspace] Loaded mock data for workspace: ${workspaceId}`);
    console.log(`[Workspace]   - Transactions: ${transactions.length}`);
    console.log(`[Workspace]   - Inventory items: ${inventory.length}`);
    console.log(`[Workspace]   - Schedule items: ${schedule.length}`);
    console.log(`[Workspace]   - Events: ${events.length}`);

    return { 
      success: true, 
      workspaceId,
      counts: {
        transactions: transactions.length,
        inventory: inventory.length,
        schedule: schedule.length,
        events: events.length,
      }
    };
  }
);

/**
 * Clear All Tool Data Thunk
 * 
 * Clears data from all tool slices (finance, medicals, events).
 * Categories and filters are preserved.
 */
export const clearAllToolDataThunk = () => 
  (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
    console.log('[Workspace] Clearing all tool data...');
    
    dispatch(clearAllTransactions());
    dispatch(clearItems());
    dispatch(clearScheduleItems());
    dispatch(clearEvents());
    
    console.log('[Workspace] All tool data cleared.');
  };

// ============================================================================
// Selectors
// ============================================================================

/**
 * Select current workspace ID from auth state
 */
export const selectActiveWorkspaceId = (state: RootState): string => {
  return state.auth.activeWorkspace;
};

/**
 * Select workspace configuration
 */
export const selectWorkspaceConfig = (workspaceId: string) => (state: RootState) => {
  return state.auth.workspaces[workspaceId];
};

/**
 * Select all workspace IDs
 */
export const selectAllWorkspaceIds = (state: RootState): string[] => {
  return Object.keys(state.auth.workspaces);
};

// ============================================================================
// Development-Only Helpers
// ============================================================================

/**
 * Clear all data for all workspaces
 */
export const clearAllWorkspaceData = (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
  if (!__DEV__) {
    console.warn('[Workspace] clearAllWorkspaceData() only works in development mode.');
    return;
  }

  console.log('[Workspace] Clearing all workspace data...');
  dispatch(clearAllTransactions());
  dispatch(clearItems());
  dispatch(clearScheduleItems());
  dispatch(clearEvents());
  console.log('[Workspace] All workspace data cleared.');
};

/**
 * Get workspace data summary
 */
export const getWorkspaceDataSummary = (state: RootState) => {
  return {
    workspaceId: state.auth.activeWorkspace,
    transactionCount: (state.transactions as TransactionState).transactions.length,
    inventoryCount: (state.inventory as InventoryState).items.length,
    scheduleCount: (state.schedule as ScheduleState).items.length,
    eventCount: (state.events as EventsState).items.length,
  };
};

