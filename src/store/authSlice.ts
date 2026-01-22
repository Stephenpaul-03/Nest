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
  currencySymbol?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
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

interface AuthState {
  isAuthenticated: boolean;
  currentUserId: string | null;
  users: Record<string, User>;
  activeWorkspace: string;
  workspaces: Record<string, WorkspaceConfig>;
  globalCurrencySymbol: string;
  // Legacy properties for backward compatibility
  user: User | null;
  idToken: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  currentUserId: null,
  users: {},
  activeWorkspace: 'Personal',
  workspaces: { ...defaultWorkspaces },
  globalCurrencySymbol: '$',
  user: null,
  idToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ user: User; idToken: string }>) {
      const { user } = action.payload;
      
      // Add user to remembered users
      state.users[user.id] = user;
      state.currentUserId = user.id;
      state.isAuthenticated = true;
      state.user = user;
      state.idToken = action.payload.idToken;
    },
    addMockUser(state, action: PayloadAction<User>) {
      const user = action.payload;
      state.users[user.id] = user;
      state.currentUserId = user.id;
      state.isAuthenticated = true;
      state.user = user;
      state.idToken = 'mock-token';
    },
    switchAccount(state, action: PayloadAction<string>) {
      const userId = action.payload;
      if (state.users[userId]) {
        state.currentUserId = userId;
        state.user = state.users[userId];
        // Reset workspace to Personal for the new user
        state.activeWorkspace = 'Personal';
        // Reset workspaces to defaults
        state.workspaces = {
          'Personal': { name: 'Personal', enabledTools: { ...defaultEnabledTools }, currencySymbol: '$' },
          'Family': { name: 'Family', enabledTools: { ...defaultEnabledTools }, currencySymbol: '$' },
        };
        state.globalCurrencySymbol = '$';
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.currentUserId = null;
      state.user = null;
      state.idToken = null;
      state.activeWorkspace = 'Personal';
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
    /**
     * Hydrate Redux state from config.json
     * 
     * This is the ONLY way workspace config enters Redux.
     * Redux is a projection/cache of config.json, never the source of truth.
     */
    hydrateFromConfig(state, action: PayloadAction<{
      name: string;
      accentColor: string;
      tools: EnabledTools;
      members: Record<string, { displayName: string; role: 'owner' | 'member' }>;
    }>) {
      const config = action.payload;
      
      // Determine owner ID and display name from members
      const ownerEntry = Object.entries(config.members).find(
        ([_, member]) => member.role === 'owner'
      );
      
      const ownerId = ownerEntry?.[0] || 'default';
      const ownerDisplayName = ownerEntry?.[1].displayName || 'User';
      
      // Update active workspace to match config
      state.activeWorkspace = config.name;
      
      // Update or create workspace entry
      state.workspaces[config.name] = {
        name: config.name,
        enabledTools: config.tools,
        currencySymbol: '$',
      };
      
      // Ensure current user exists and matches owner
      if (!state.users[ownerId]) {
        state.users[ownerId] = {
          id: ownerId,
          name: ownerDisplayName,
          email: `${ownerDisplayName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        };
      }
      state.currentUserId = ownerId;
      state.user = state.users[ownerId];
      state.idToken = 'mock-token';
      state.isAuthenticated = true;
    },
  },
});

// Selector helpers
export const selectCurrentUser = (state: { auth: AuthState }) => {
  const { currentUserId, users } = state.auth;
  return currentUserId ? users[currentUserId] : null;
};

export const selectAllUsers = (state: { auth: AuthState }) => {
  return Object.values(state.auth.users);
};

export const { 
  login, 
  addMockUser,
  switchAccount,
  logout, 
  setActiveWorkspace, 
  toggleTool, 
  setWorkspaceCurrencySymbol, 
  setGlobalCurrencySymbol,
  hydrateFromConfig 
} = authSlice.actions;

// Add user and idToken to state for backward compatibility
authSlice.caseReducers.login = (state, action) => {
  const { user } = action.payload;
  state.users[user.id] = user;
  state.currentUserId = user.id;
  state.isAuthenticated = true;
  state.user = user;
  state.idToken = action.payload.idToken;
};

authSlice.caseReducers.logout = (state) => {
  state.isAuthenticated = false;
  state.currentUserId = null;
  state.user = null;
  state.idToken = null;
  state.activeWorkspace = 'Personal';
  state.workspaces = {
    'Personal': { name: 'Personal', enabledTools: { ...defaultEnabledTools }, currencySymbol: '$' },
    'Family': { name: 'Family', enabledTools: { ...defaultEnabledTools }, currencySymbol: '$' },
  };
  state.globalCurrencySymbol = '$';
};

export default authSlice.reducer;

