/**
 * Load Workspace Config (Multi-Workspace Support)
 * 
 * Loads the workspaces configuration from persistent storage.
 */

import type { WorkspaceConfig, WorkspacesConfig } from './types';
import {
  getConfigKey,
  getConfigStorage,
  validateAndMigrateConfig
} from './types';

export interface LoadConfigResult {
  success: boolean;
  config: WorkspacesConfig | null;
  error?: string;
}

export interface ActiveWorkspaceResult {
  success: boolean;
  workspace: WorkspaceConfig | null;
  activeWorkspaceId: string | null;
  error?: string;
}

/**
 * Load workspaces config from storage
 */
export async function loadConfig(): Promise<LoadConfigResult> {
  const storage = await getConfigStorage();
  const key = await getConfigKey();

  try {
    const rawConfig = await storage.getItem(key);

    if (!rawConfig) {
      console.log('[Config] No config found in storage');
      return { success: true, config: null };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawConfig);
    } catch (parseError) {
      console.error('[Config] Failed to parse config JSON:', parseError);
      return { 
        success: false, 
        config: null, 
        error: 'Invalid config format' 
      };
    }

    const config = validateAndMigrateConfig(parsed);

    if (!config) {
      console.warn('[Config] Config validation failed');
      return { 
        success: false, 
        config: null, 
        error: 'Config validation failed' 
      };
    }

    console.log('[Config] Config loaded successfully, workspaces:', Object.keys(config.workspaces).length);
    return { success: true, config };

  } catch (error) {
    console.error('[Config] Error loading config:', error);
    return { 
      success: false, 
      config: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get the active workspace config
 */
export async function getActiveWorkspace(): Promise<ActiveWorkspaceResult> {
  const result = await loadConfig();
  
  if (!result.success || !result.config) {
    return { success: false, workspace: null, activeWorkspaceId: null, error: result.error };
  }

  const { activeWorkspaceId, workspaces } = result.config;

  if (!activeWorkspaceId || !workspaces[activeWorkspaceId]) {
    return { success: false, workspace: null, activeWorkspaceId: null, error: 'No active workspace' };
  }

  return { 
    success: true, 
    workspace: workspaces[activeWorkspaceId], 
    activeWorkspaceId 
  };
}

/**
 * Get a specific workspace by ID
 */
export async function getWorkspace(workspaceId: string): Promise<WorkspaceConfig | null> {
  const result = await loadConfig();
  
  if (!result.success || !result.config) {
    return null;
  }

  return result.config.workspaces[workspaceId] || null;
}

/**
 * Check if config exists
 */
export async function hasConfig(): Promise<boolean> {
  const storage = await getConfigStorage();
  const key = await getConfigKey();

  try {
    const value = await storage.getItem(key);
    return value !== null;
  } catch {
    return false;
  }
}

/**
 * Get raw config JSON (for debugging)
 */
export async function getRawConfig(): Promise<string | null> {
  const storage = await getConfigStorage();
  const key = await getConfigKey();

  try {
    return await storage.getItem(key);
  } catch {
    return null;
  }
}

