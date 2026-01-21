import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import authReducer, { authStorageKey } from './authSlice';
import eventsReducer, { eventsStorageKey } from './eventsSlice';
import inventoryReducer, { inventoryStorageKey } from './inventorySlice';
import scheduleReducer, { scheduleStorageKey } from './scheduleSlice';
import transactionReducer, { transactionStorageKey } from './transactionSlice';
import { switchWorkspace } from './workspaceActions';

const authPersistConfig = {
  key: authStorageKey,
  storage: AsyncStorage,
};

const eventsPersistConfig = {
  key: eventsStorageKey,
  storage: AsyncStorage,
};

const inventoryPersistConfig = {
  key: inventoryStorageKey,
  storage: AsyncStorage,
};

const schedulePersistConfig = {
  key: scheduleStorageKey,
  storage: AsyncStorage,
};

const transactionPersistConfig = {
  key: transactionStorageKey,
  storage: AsyncStorage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedEventsReducer = persistReducer(eventsPersistConfig, eventsReducer);
const persistedInventoryReducer = persistReducer(
  inventoryPersistConfig,
  inventoryReducer
);
const persistedScheduleReducer = persistReducer(
  schedulePersistConfig,
  scheduleReducer
);

const persistedTransactionReducer = persistReducer(
  transactionPersistConfig,
  transactionReducer
);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    events: persistedEventsReducer,
    inventory: persistedInventoryReducer,
    schedule: persistedScheduleReducer,
    transactions: persistedTransactionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// ============================================================================
// Workspace Change Detection
// ============================================================================

// Subscribe to store changes to detect workspace switches
// Only runs in development mode for mock data seeding
let previousActiveWorkspace: string | null = null;

store.subscribe(() => {
  // Only run in development mode
  if (!__DEV__) return;

  const state = store.getState();
  const currentActiveWorkspace = state.auth.activeWorkspace;

  // Check if workspace has changed
  if (previousActiveWorkspace !== currentActiveWorkspace) {
    console.log(`[Store] Workspace change detected: ${previousActiveWorkspace} -> ${currentActiveWorkspace}`);
    previousActiveWorkspace = currentActiveWorkspace;

    // Seed mock data for the new workspace
    // We use dispatch directly here since we're in a subscription callback
    store.dispatch(switchWorkspace(currentActiveWorkspace));
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
