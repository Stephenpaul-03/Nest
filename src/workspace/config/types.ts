/**
 * Workspace Config Types
 * 
 * Single-workspace config system. Config.json is the single source of truth.
 * This file defines the schema for workspace configuration.
 * 
 * Architecture Rule (NON-NEGOTIABLE):
 * - Workspace existence and state are determined ONLY by config.json
 * - Redux is a projection/cache, never the source of truth
 */

// ============================================================================
// Constants
// ============================================================================

export const CONFIG_VERSION = 1;
export const WORKSPACE_CONFIG_KEY = 'nest_workspace_config';

// ============================================================================
// Schema Definition (LOCKED)
// ============================================================================

export interface WorkspaceMember {
  displayName: string;
  role: 'owner' | 'member';
}

export interface WorkspaceTools {
  finance: boolean;
  events: boolean;
  medicals: boolean;
}

export interface WorkspaceConfig {
  /** Schema version for future migrations */
  version: number;
  
  /** Workspace display name */
  name: string;
  
  /** Accent color for the workspace (hex code) */
  accentColor: string;
  
  /** Enabled tools in this workspace */
  tools: WorkspaceTools;
  
  /** Workspace members by userId */
  members: Record<string, WorkspaceMember>;
  
  /** ISO timestamp of workspace creation */
  createdAt: string;
  
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

export function createWorkspaceConfig(
  name: string,
  ownerId: string,
  ownerDisplayName: string,
  accentColor: string = DEFAULT_ACCENT_COLOR
): WorkspaceConfig {
  const now = new Date().toISOString();
  return {
    version: CONFIG_VERSION,
    name,
    accentColor,
    tools: { ...DEFAULT_TOOLS },
    members: {
      [ownerId]: {
        displayName: ownerDisplayName,
        role: 'owner',
      },
    },
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isWorkspaceConfig(value: unknown): value is WorkspaceConfig {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const config = value as Record<string, unknown>;

  return (
    typeof config.version === 'number' &&
    typeof config.name === 'string' &&
    typeof config.accentColor === 'string' &&
    typeof config.tools === 'object' &&
    typeof config.members === 'object' &&
    typeof config.createdAt === 'string' &&
    typeof config.updatedAt === 'string'
  );
}

// ============================================================================
// Validation & Migration
// ============================================================================

export function validateAndMigrateConfig(config: unknown): WorkspaceConfig | null {
  if (!isWorkspaceConfig(config)) {
    console.warn('[Config] Invalid workspace config structure:', config);
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

  return config;
}

