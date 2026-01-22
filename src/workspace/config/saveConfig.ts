/**
 * Save Workspace Config
 * 
 * Persists the workspace configuration to persistent storage.
 * This file is the single authority - Redux must be hydrated from here.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkspaceConfig } from './types';
import {
  CONFIG_VERSION,
  createWorkspaceConfig,
  WORKSPACE_CONFIG_KEY,
} from './types';

export interface SaveConfigResult {
  success: boolean;
  config: WorkspaceConfig | null;
  error?: string;
}

export interface CreateWorkspaceResult {
  success: boolean;
  config: WorkspaceConfig | null;
  error?: string;
}

/**
 * Save workspace config to storage
 */
export async function saveConfig(config: WorkspaceConfig): Promise<SaveConfigResult> {
  try {
    // Validate required fields
    if (typeof config.version !== 'number' || config.version !== CONFIG_VERSION) {
      return { 
        success: false, 
        config: null, 
        error: `Invalid config version: ${config.version}` 
      };
    }

    if (typeof config.name !== 'string' || !config.name.trim()) {
      return { 
        success: false, 
        config: null, 
        error: 'Config name is required' 
      };
    }

    if (typeof config.tools !== 'object' || config.tools === null) {
      return { 
        success: false, 
        config: null, 
        error: 'Config tools is required' 
      };
    }

    // Add updated timestamp
    const configToSave: WorkspaceConfig = {
      ...config,
      version: CONFIG_VERSION,
      updatedAt: new Date().toISOString(),
    };

    // Serialize to JSON and save
    const jsonString = JSON.stringify(configToSave, null, 2);
    await AsyncStorage.setItem(WORKSPACE_CONFIG_KEY, jsonString);

    console.log('[Config] Config saved successfully');
    return { success: true, config: configToSave };

  } catch (error) {
    console.error('[Config] Error saving config:', error);
    return { 
      success: false, 
      config: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Create a new workspace config
 * 
 * This is called during onboarding to create the initial config.
 */
export async function createWorkspace(
  name: string,
  ownerId: string,
  ownerDisplayName: string,
  accentColor?: string
): Promise<CreateWorkspaceResult> {
  try {
    // Create the config using the factory function
    const config = createWorkspaceConfig(
      name.trim(),
      ownerId,
      ownerDisplayName,
      accentColor
    );

    // Save to storage
    const saveResult = await saveConfig(config);

    if (!saveResult.success) {
      return { success: false, config: null, error: saveResult.error };
    }

    return { success: true, config: saveResult.config };

  } catch (error) {
    console.error('[Config] Error creating workspace:', error);
    return { 
      success: false, 
      config: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Delete workspace config (for workspace deletion/reset)
 */
export async function deleteConfig(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(WORKSPACE_CONFIG_KEY);
    console.log('[Config] Config deleted');
    return true;
  } catch (error) {
    console.error('[Config] Error deleting config:', error);
    return false;
  }
}

