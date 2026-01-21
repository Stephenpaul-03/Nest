import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const authStorageKey = 'auth';

export type ToolKey = 'finance' | 'events' | 'medicals';

export interface EnabledTools {
  finance: boolean;
  events: boolean;
  medicals: boolean;
}

export interface WorkspaceConfig {
  name: string;
  enabledTools: EnabledTools;
  currencySymbol?: string; // Currency symbol for this workspace (e.g., "$", "€", "£", "¥")
}

interface AuthState {
  isAuthenticated: boolean;
  activeWorkspace: string;
  workspaces: Record<string, WorkspaceConfig>;
  globalCurrencySymbol: string; // Fallback/default currency symbol
}

// Default tools for new workspaces
const defaultEnabledTools: EnabledTools = {
  finance: true,
  events: true,
  medicals: true,
};

// Default workspaces
const defaultWorkspaces: Record<string, WorkspaceConfig> = {
  'Personal': {
    name: 'Personal',
    enabledTools: { ...defaultEnabledTools },
    currencySymbol: '$',
  },
  'Family': {
    name: 'Family',
    enabledTools: { ...defaultEnabledTools },
    currencySymbol: '$',
  },
};

const initialState: AuthState = {
  isAuthenticated: false,
  activeWorkspace: 'Personal',
  workspaces: { ...defaultWorkspaces },
  globalCurrencySymbol: '$',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state) {
      state.isAuthenticated = true;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.activeWorkspace = 'Personal';
      // Reset to default workspaces
      state.workspaces = {
        'Personal': { name: 'Personal', enabledTools: { ...defaultEnabledTools }, currencySymbol: '$' },
        'Family': { name: 'Family', enabledTools: { ...defaultEnabledTools }, currencySymbol: '$' },
      };
      state.globalCurrencySymbol = '$';
    },
    setActiveWorkspace(state, action: PayloadAction<string>) {
      state.activeWorkspace = action.payload;
    },
    toggleTool(state, action: PayloadAction<{ workspace: string; tool: ToolKey }>) {
      const { workspace, tool } = action.payload;
      if (state.workspaces[workspace]?.enabledTools.hasOwnProperty(tool)) {
        state.workspaces[workspace].enabledTools[tool] = !state.workspaces[workspace].enabledTools[tool];
      }
    },
    setWorkspaceCurrencySymbol(state, action: PayloadAction<{ workspace: string; symbol: string }>) {
      const { workspace, symbol } = action.payload;
      if (state.workspaces[workspace]) {
        state.workspaces[workspace].currencySymbol = symbol;
      }
    },
    setGlobalCurrencySymbol(state, action: PayloadAction<string>) {
      state.globalCurrencySymbol = action.payload;
    },
  },
});

export const { 
  login, 
  logout, 
  setActiveWorkspace, 
  toggleTool, 
  setWorkspaceCurrencySymbol, 
  setGlobalCurrencySymbol 
} = authSlice.actions;
export default authSlice.reducer;

