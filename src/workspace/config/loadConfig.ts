/**
 * Load Workspace Config
 * 
 * Loads the workspace configuration from persistent storage.
 * Config.json is the single source of truth for workspace existence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkspaceConfig } from './types';
import {
  CONFIG_VERSION,
  validateAndMigrateConfig,
  WORKSPACE_CONFIG_KEY,
} from './types';

export interface LoadConfigResult {
  success: boolean;
  config: WorkspaceConfig | null;
  error?: string;
}

/**
 * Load workspace config from storage
 * 
 * @returns LoadConfigResult with config or null if not found
 */
export async function loadConfig(): Promise<LoadConfigResult> {
  try {
    const rawConfig = await AsyncStorage.getItem(WORKSPACE_CONFIG_KEY);

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

    console.log('[Config] Config loaded successfully');
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
 * Get workspace config (alias for loadConfig for convenience)
 */
export async function getWorkspaceConfig(): Promise<WorkspaceConfig | null> {
  const result = await loadConfig();
  return result.config;
}

/**
 * Check if config exists
 * 
 * This is the critical check for onboarding:
 * - No config → onboarding required
 * - Config exists → app allowed to load
 */
export async function hasConfig(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(WORKSPACE_CONFIG_KEY);
    return value !== null;
  } catch {
    return false;
  }
}

/**
 * Get raw config JSON (for debugging)
 */
export async function getRawConfig(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(WORKSPACE_CONFIG_KEY);
  } catch {
    return null;
  }
}

/**
 * Update workspace config with partial updates
 * 
 * Merges updates safely and persists to storage.
 */
export interface UpdateConfigResult {
  success: boolean;
  config: WorkspaceConfig | null;
  error?: string;
}

export async function updateConfig(
  updates: Partial<WorkspaceConfig>
): Promise<UpdateConfigResult> {
  const loadResult = await loadConfig();
  
  if (!loadResult.success || !loadResult.config) {
    return { success: false, config: null, error: 'Config not found' };
  }

  const currentConfig = loadResult.config;

  // Ensure version is always set to current version
  const version = updates.version ?? currentConfig.version;
  if (version !== CONFIG_VERSION) {
    return { success: false, config: null, error: 'Invalid config version' };
  }

  // Prevent modifying createdAt
  const { createdAt, ...restUpdates } = updates as any;

  // Merge updates safely
  const updatedConfig: WorkspaceConfig = {
    ...currentConfig,
    ...restUpdates,
    version: CONFIG_VERSION,
    createdAt: currentConfig.createdAt,
    updatedAt: new Date().toISOString(),
  };

  try {
    const jsonString = JSON.stringify(updatedConfig, null, 2);
    await AsyncStorage.setItem(WORKSPACE_CONFIG_KEY, jsonString);
    
    console.log('[Config] Config updated successfully');
    return { success: true, config: updatedConfig };
  } catch (error) {
    console.error('[Config] Error saving updated config:', error);
    return { 
      success: false, 
      config: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

