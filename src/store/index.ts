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

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    events: persistedEventsReducer,
    inventory: persistedInventoryReducer,
    schedule: persistedScheduleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
