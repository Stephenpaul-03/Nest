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
import inventoryReducer, { inventoryStorageKey } from './inventorySlice';

const authPersistConfig = {
  key: authStorageKey,
  storage: AsyncStorage,
};

const inventoryPersistConfig = {
  key: inventoryStorageKey,
  storage: AsyncStorage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedInventoryReducer = persistReducer(
  inventoryPersistConfig,
  inventoryReducer
);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    inventory: persistedInventoryReducer,
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
