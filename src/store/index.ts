import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './slices/weatherSlice.ts';
import cryptoReducer from './slices/cryptoSlice.ts';
import newsReducer from './slices/newsSlice.ts';
import userPreferencesReducer from './slices/userPreferencesSlice.ts';
import notificationReducer from './slices/notificationSlice.ts';
import { RootState as AppRootState } from './types.ts';

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    crypto: cryptoReducer,
    news: newsReducer,
    userPreferences: userPreferencesReducer,
    notifications: notificationReducer
  },
  // Note: Redux Toolkit's configureStore already includes thunk by default
  // so we don't need to explicitly add it
});

// Export the store state and dispatch types
export type RootState = AppRootState;
export type AppDispatch = typeof store.dispatch; 