/**
 * Save Workspace Config (Multi-Workspace Support)
 * 
 * Persists the workspaces configuration to persistent storage.
 */

import { loadConfig } from './loadConfig';
import type { WorkspaceConfig, WorkspacesConfig } from './types';
import {
  CONFIG_VERSION,
  getConfigKey,
  getConfigStorage
} from './types';

export interface SaveConfigResult {
  success: boolean;
  error?: string;
}

export interface SetActiveWorkspaceResult {
  success: boolean;
  workspace: WorkspaceConfig | null;
  error?: string;
}

/**
 * Save workspaces config to storage
 */
export async function saveConfig(config: WorkspacesConfig): Promise<SaveConfigResult> {
  const storage = await getConfigStorage();
  const key = await getConfigKey();

  try {
    // Validate required fields
    if (typeof config.version !== 'number' || config.version !== CONFIG_VERSION) {
      return { 
        success: false, 
        error: `Invalid config version: ${config.version}` 
      };
    }

    if (typeof config.workspaces !== 'object' || config.workspaces === null) {
      return { 
        success: false, 
        error: 'Config workspaces is required' 
      };
    }

    // Add updated timestamp
    const configToSave = {
      ...config,
      version: CONFIG_VERSION,
      updatedAt: new Date().toISOString(),
    };

    // Serialize to JSON
    const jsonString = JSON.stringify(configToSave, null, 2);

    // Save to storage
    await storage.setItem(key, jsonString);

    console.log('[Config] Config saved successfully, workspaces:', Object.keys(config.workspaces).length);
    return { success: true };

  } catch (error) {
    console.error('[Config] Error saving config:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Create a new workspace and set it as active
 */
export async function createWorkspace(
  name: string,
  accentColor?: string
): Promise<SetActiveWorkspaceResult> {
  const loadResult = await loadConfig();
  
  let config: WorkspacesConfig;
  
  if (loadResult.success && loadResult.config) {
    config = loadResult.config;
  } else {
    // Create new config
    config = {
      version: CONFIG_VERSION,
      activeWorkspaceId: null,
      workspaces: {},
      updatedAt: new Date().toISOString(),
    };
  }

  // Create new workspace
  const workspace: WorkspaceConfig = {
    id: `ws-${Date.now()}`,
    name,
    accentColor: accentColor || '#6366f1',
    tools: {
      finance: true,
      events: true,
      medicals: true,
    },
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  // Add to workspaces
  config.workspaces[workspace.id] = workspace;
  config.activeWorkspaceId = workspace.id;

  const saveResult = await saveConfig(config);

  if (!saveResult.success) {
    return { success: false, workspace: null, error: saveResult.error };
  }

  return { success: true, workspace };
}

/**
 * Set the active workspace
 */
export async function setActiveWorkspace(workspaceId: string): Promise<SetActiveWorkspaceResult> {
  const loadResult = await loadConfig();
  
  if (!loadResult.success || !loadResult.config) {
    return { success: false, workspace: null, error: 'Config not found' };
  }

  const config = loadResult.config;
  const workspace = config.workspaces[workspaceId];

  if (!workspace) {
    return { success: false, workspace: null, error: 'Workspace not found' };
  }

  // Update active workspace and last active timestamp
  config.activeWorkspaceId = workspaceId;
  config.workspaces[workspaceId] = {
    ...workspace,
    lastActiveAt: new Date().toISOString(),
  };

  const saveResult = await saveConfig(config);

  if (!saveResult.success) {
    return { success: false, workspace: null, error: saveResult.error };
  }

  return { success: true, workspace: config.workspaces[workspaceId] };
}

/**
 * Delete a workspace
 */
export async function deleteWorkspace(workspaceId: string): Promise<SaveConfigResult> {
  const loadResult = await loadConfig();
  
  if (!loadResult.success || !loadResult.config) {
    return { success: false, error: 'Config not found' };
  }

  const config = loadResult.config;

  // Can't delete the only workspace
  if (Object.keys(config.workspaces).length <= 1) {
    return { success: false, error: 'Cannot delete the only workspace' };
  }

  // Remove the workspace
  delete config.workspaces[workspaceId];

  // If deleting the active workspace, set a new one
  if (config.activeWorkspaceId === workspaceId) {
    const remainingIds = Object.keys(config.workspaces);
    config.activeWorkspaceId = remainingIds[0] || null;
  }

  return await saveConfig(config);
}

/**
 * Update workspace settings
 */
export async function updateWorkspace(
  workspaceId: string,
  updates: Partial<Omit<WorkspaceConfig, 'id' | 'createdAt' | 'lastActiveAt'>>
): Promise<SetActiveWorkspaceResult> {
  const loadResult = await loadConfig();
  
  if (!loadResult.success || !loadResult.config) {
    return { success: false, workspace: null, error: 'Config not found' };
  }

  const config = loadResult.config;
  const workspace = config.workspaces[workspaceId];

  if (!workspace) {
    return { success: false, workspace: null, error: 'Workspace not found' };
  }

  // Update workspace
  config.workspaces[workspaceId] = {
    ...workspace,
    ...updates,
    lastActiveAt: new Date().toISOString(),
  };

  const saveResult = await saveConfig(config);

  if (!saveResult.success) {
    return { success: false, workspace: null, error: saveResult.error };
  }

  return { success: true, workspace: config.workspaces[workspaceId] };
}

/**
 * Delete all workspace config (for testing/reset)
 */
export async function deleteConfig(): Promise<boolean> {
  const storage = await getConfigStorage();
  const key = await getConfigKey();

  try {
    await storage.removeItem(key);
    console.log('[Config] Config deleted');
    return true;
  } catch (error) {
    console.error('[Config] Error deleting config:', error);
    return false;
  }
}

