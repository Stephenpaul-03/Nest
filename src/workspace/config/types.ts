/**
 * Multi-Workspace Config Types
 * 
 * Supports multiple workspaces per account with an active workspace selection.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Constants
// ============================================================================

export const CONFIG_VERSION = 1;
export const WORKSPACES_STORAGE_KEY = 'nest_workspaces';

// ============================================================================
// Schema Definition
// ============================================================================

export interface WorkspaceTools {
  finance: boolean;
  events: boolean;
  medicals: boolean;
}

export interface WorkspaceMember {
  displayName: string;
  role: 'owner' | 'member';
}

export interface WorkspaceConfig {
  /** Unique workspace ID */
  id: string;
  
  /** Workspace display name */
  name: string;
  
  /** Accent color for the workspace (hex code) */
  accentColor: string;
  
  /** Enabled tools in this workspace */
  tools: WorkspaceTools;
  
  /** ISO timestamp of workspace creation */
  createdAt: string;
  
  /** ISO timestamp of last active usage */
  lastActiveAt: string;
}

export interface WorkspacesConfig {
  /** Schema version for future migrations */
  version: number;
  
  /** Currently active workspace ID */
  activeWorkspaceId: string | null;
  
  /** All workspaces owned by this user */
  workspaces: Record<string, WorkspaceConfig>;
  
  /** ISO timestamp of last update */
  updatedAt: string;
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_TOOLS: WorkspaceTools = {
  finance: true,
  events: true,
  medicals: true,
};

export const DEFAULT_ACCENT_COLOR = '#6366f1';

export const DEFAULT_WORKSPACE_NAME = 'Personal';

export function createWorkspace(
  name: string,
  id?: string,
  accentColor: string = DEFAULT_ACCENT_COLOR
): WorkspaceConfig {
  const now = new Date().toISOString();
  return {
    id: id || `ws-${Date.now()}`,
    name,
    accentColor,
    tools: { ...DEFAULT_TOOLS },
    createdAt: now,
    lastActiveAt: now,
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isWorkspacesConfig(value: unknown): value is WorkspacesConfig {
  if (value === null || value === undefined) {
    return false;
  }

  const config = value as Record<string, unknown>;

  return (
    typeof config.version === 'number' &&
    typeof config.workspaces === 'object' &&
    (config.activeWorkspaceId === null || typeof config.activeWorkspaceId === 'string')
  );
}

export function isValidWorkspaceConfig(workspace: unknown): workspace is WorkspaceConfig {
  if (workspace === null || workspace === undefined || typeof workspace !== 'object') {
    return false;
  }

  const w = workspace as Record<string, unknown>;

  return (
    typeof w.id === 'string' &&
    typeof w.name === 'string' &&
    typeof w.accentColor === 'string' &&
    typeof w.tools === 'object' &&
    typeof w.createdAt === 'string' &&
    typeof w.lastActiveAt === 'string'
  );
}

// ============================================================================
// Validation & Migration
// ============================================================================

export function validateAndMigrateConfig(config: unknown): WorkspacesConfig | null {
  if (!isWorkspacesConfig(config)) {
    console.warn('[Config] Invalid workspaces config structure:', config);
    return null;
  }

  if (config.version < CONFIG_VERSION) {
    console.warn('[Config] Config version outdated:', config.version);
    return null;
  }

  if (config.version > CONFIG_VERSION) {
    console.error('[Config] Config version newer than expected:', config.version);
    return null;
  }

  // Validate all workspaces
  const validatedWorkspaces: Record<string, WorkspaceConfig> = {};
  
  for (const [id, workspace] of Object.entries(config.workspaces)) {
    if (isValidWorkspaceConfig(workspace)) {
      validatedWorkspaces[id] = workspace;
    } else {
      console.warn('[Config] Invalid workspace config for:', id);
    }
  }

  return {
    version: CONFIG_VERSION,
    activeWorkspaceId: config.activeWorkspaceId,
    workspaces: validatedWorkspaces,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Storage Helpers
// ============================================================================

export async function getConfigStorage() {
  return AsyncStorage;
}

export async function getConfigKey(): Promise<string> {
  return WORKSPACES_STORAGE_KEY;
}

