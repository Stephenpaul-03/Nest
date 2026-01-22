/**
 * Workspace Actions
 * 
 * Redux actions for workspace management.
 * All mock data seeding has been removed.
 * The app now starts with empty data.
 */

import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import {
  clearEvents
} from './eventsSlice';
import type { RootState } from './index';
import {
  clearItems
} from './inventorySlice';
import {
  clearItems as clearScheduleItems
} from './scheduleSlice';
import {
  clearAllTransactions
} from './transactionSlice';

// Type-only imports for state interfaces
import type { EventsState } from '@/src/types/event';
import type { InventoryState } from '@/src/types/inventory';
import type { ScheduleState } from '@/src/types/schedule';
import type { TransactionState } from '@/src/types/transaction';
import { createAsyncThunk } from '@reduxjs/toolkit';

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
 * Clears all tool data when switching workspaces.
 * No mock data is loaded - the workspace starts empty.
 * 
 * This ensures each workspace is clean when first created.
 */
export const switchWorkspace = createAsyncThunk(
  'workspace/switchWorkspace',
  async (workspaceId: string, { dispatch }) => {
    console.log(`[Workspace] Switching to workspace: ${workspaceId}`);
    console.log(`[Workspace] Clearing existing data...`);

    // Clear all existing data first
    dispatch(clearAllToolDataThunk());

    // No mock data is loaded - workspace starts empty
    console.log(`[Workspace] Workspace is now empty. Ready for fresh data.`);

    return { 
      success: true, 
      workspaceId,
      counts: {
        transactions: 0,
        inventory: 0,
        schedule: 0,
        events: 0,
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
// Development Helpers
// ============================================================================

/**
 * Clear all data for all workspaces
 */
export const clearAllWorkspaceData = (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
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

