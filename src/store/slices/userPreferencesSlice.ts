import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserPreferences {
  favoriteCities: string[];
  favoriteCryptos: string[];
  darkMode: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
  lastVisited: {
    city?: string;
    crypto?: string;
    news?: string;
  };
}

const initialState: UserPreferences = {
  favoriteCities: [],
  favoriteCryptos: [],
  darkMode: false,
  temperatureUnit: 'celsius',
  lastVisited: {}
};

// Load persisted preferences from localStorage if available
const loadPersistedPreferences = (): UserPreferences => {
  try {
    const persistedPreferences = localStorage.getItem('userPreferences');
    
    if (persistedPreferences) {
      return JSON.parse(persistedPreferences);
    }
  } catch (error) {
    console.error('Failed to load persisted preferences:', error);
  }
  
  return initialState;
};

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState: loadPersistedPreferences(),
  reducers: {
    // City preferences
    addFavoriteCity: (state, action: PayloadAction<string>) => {
      if (!state.favoriteCities.includes(action.payload)) {
        state.favoriteCities.push(action.payload);
        persistPreferences(state);
      }
    },
    removeFavoriteCity: (state, action: PayloadAction<string>) => {
      state.favoriteCities = state.favoriteCities.filter(city => city !== action.payload);
      persistPreferences(state);
    },
    
    // Crypto preferences
    addFavoriteCrypto: (state, action: PayloadAction<string>) => {
      if (!state.favoriteCryptos.includes(action.payload)) {
        state.favoriteCryptos.push(action.payload);
        persistPreferences(state);
      }
    },
    removeFavoriteCrypto: (state, action: PayloadAction<string>) => {
      state.favoriteCryptos = state.favoriteCryptos.filter(crypto => crypto !== action.payload);
      persistPreferences(state);
    },
    
    // UI preferences
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      persistPreferences(state);
    },
    setTemperatureUnit: (state, action: PayloadAction<'celsius' | 'fahrenheit'>) => {
      state.temperatureUnit = action.payload;
      persistPreferences(state);
    },
    
    // Last visited tracking
    setLastVisitedCity: (state, action: PayloadAction<string>) => {
      state.lastVisited.city = action.payload;
      persistPreferences(state);
    },
    setLastVisitedCrypto: (state, action: PayloadAction<string>) => {
      state.lastVisited.crypto = action.payload;
      persistPreferences(state);
    },
    setLastVisitedNews: (state, action: PayloadAction<string>) => {
      state.lastVisited.news = action.payload;
      persistPreferences(state);
    },
    
    // Reset all preferences
    resetPreferences: (state) => {
      Object.assign(state, initialState);
      localStorage.removeItem('userPreferences');
    }
  }
});

// Helper function to persist preferences to localStorage
const persistPreferences = (state: UserPreferences) => {
  try {
    localStorage.setItem('userPreferences', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to persist preferences:', error);
  }
};

export const {
  addFavoriteCity,
  removeFavoriteCity,
  addFavoriteCrypto,
  removeFavoriteCrypto,
  toggleDarkMode,
  setTemperatureUnit,
  setLastVisitedCity,
  setLastVisitedCrypto,
  setLastVisitedNews,
  resetPreferences
} = userPreferencesSlice.actions;

export default userPreferencesSlice.reducer; 