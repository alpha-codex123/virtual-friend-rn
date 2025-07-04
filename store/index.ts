// store.ts
import AsyncStorage from '@react-native-async-storage/async-storage'; // for React Native
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';

// 1. Create persist config for the reducers you want to persist
const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth', 'chat'], // only persist auth slice
};

// 2. Combine reducers if you have more than one
const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
});

// 3. Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configure store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Required to avoid warnings with redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 5. Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
