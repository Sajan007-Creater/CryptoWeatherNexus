# Favorites Implementation

This document outlines the implementation of the favorites feature in the Weather-Verse-Visuals application, allowing users to bookmark cities and cryptocurrencies for quick access.

## Overview

The favorites feature enables users to:

1. **Mark items as favorites**: Cities for weather data and cryptocurrencies for price tracking
2. **View favorites in dedicated sections**: For quick access to frequently checked items
3. **Persist favorites**: Between browser sessions using localStorage
4. **Visually highlight favorites**: In list views and search results

## Implementation Architecture

The favorites feature is implemented using Redux for state management and localStorage for persistence.

### Redux State Structure

The favorites data is stored in the `userPreferences` slice of the Redux store:

```typescript
// From store/slices/userPreferencesSlice.ts
interface UserPreferencesState {
  favoriteCities: string[];      // Array of city IDs
  favoriteCryptos: string[];     // Array of crypto IDs
  darkMode: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
  lastVisited: {
    city?: string;
    crypto?: string;
    news?: string;
  };
}

const initialState: UserPreferencesState = {
  favoriteCities: [],
  favoriteCryptos: [],
  darkMode: false,
  temperatureUnit: 'celsius',
  lastVisited: {}
};
```

### Redux Actions

Actions for managing favorites in the Redux slice:

```typescript
// userPreferencesSlice.ts
const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    // City favorites
    addFavoriteCity: (state, action: PayloadAction<string>) => {
      if (!state.favoriteCities.includes(action.payload)) {
        state.favoriteCities.push(action.payload);
      }
    },
    removeFavoriteCity: (state, action: PayloadAction<string>) => {
      state.favoriteCities = state.favoriteCities.filter(id => id !== action.payload);
    },
    
    // Crypto favorites
    addFavoriteCrypto: (state, action: PayloadAction<string>) => {
      if (!state.favoriteCryptos.includes(action.payload)) {
        state.favoriteCryptos.push(action.payload);
      }
    },
    removeFavoriteCrypto: (state, action: PayloadAction<string>) => {
      state.favoriteCryptos = state.favoriteCryptos.filter(id => id !== action.payload);
    },
    
    // Other preference actions...
  }
});

export const { 
  addFavoriteCity, 
  removeFavoriteCity, 
  addFavoriteCrypto, 
  removeFavoriteCrypto 
} = userPreferencesSlice.actions;
```

### LocalStorage Persistence

The application persists favorites using a Redux middleware that synchronizes state with localStorage:

```typescript
// store/middleware/localStorageMiddleware.ts
import { Middleware } from 'redux';
import { RootState } from '../types';

const STORAGE_KEY = 'weather-verse-preferences';

export const localStorageMiddleware: Middleware = store => next => action => {
  // Call the next dispatch method in the middleware chain
  const result = next(action);
  
  // Actions that should trigger an update to localStorage
  if (
    action.type.startsWith('userPreferences/') && 
    !action.type.includes('initialize')
  ) {
    const state = store.getState() as RootState;
    const preferences = state.userPreferences;
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.error('Could not save to localStorage:', e);
    }
  }
  
  return result;
};

// Initial loading from localStorage
export const loadPreferencesFromStorage = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined; // Use default state if nothing in storage
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.error('Could not load from localStorage:', e);
    return undefined;
  }
};
```

### Adding the Middleware to Redux Store

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { localStorageMiddleware, loadPreferencesFromStorage } from './middleware/localStorageMiddleware';
import userPreferencesReducer from './slices/userPreferencesSlice';

// Load initial state from localStorage
const preloadedPreferences = loadPreferencesFromStorage();

export const store = configureStore({
  reducer: {
    // Other reducers...
    userPreferences: userPreferencesReducer
  },
  preloadedState: preloadedPreferences ? { userPreferences: preloadedPreferences } : undefined,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware)
});
```

## UI Implementation

### Favorite Toggle Button

A reusable component for toggling favorite status:

```tsx
// components/common/FavoriteToggle.tsx
import { useState } from 'react';
import { Star, StarOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  addFavoriteCity, 
  removeFavoriteCity,
  addFavoriteCrypto,
  removeFavoriteCrypto
} from '../../store/slices/userPreferencesSlice';

interface FavoriteToggleProps {
  id: string;
  type: 'city' | 'crypto';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FavoriteToggle = ({ id, type, size = 'md', className = '' }: FavoriteToggleProps) => {
  const dispatch = useAppDispatch();
  
  // Select the right list based on type
  const favoriteList = useAppSelector(state => 
    type === 'city' ? state.userPreferences.favoriteCities : state.userPreferences.favoriteCryptos
  );
  
  const isFavorite = favoriteList.includes(id);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const toggleFavorite = () => {
    if (type === 'city') {
      if (isFavorite) {
        dispatch(removeFavoriteCity(id));
      } else {
        dispatch(addFavoriteCity(id));
      }
    } else {
      if (isFavorite) {
        dispatch(removeFavoriteCrypto(id));
      } else {
        dispatch(addFavoriteCrypto(id));
      }
    }
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <button 
      onClick={toggleFavorite}
      className={`transition-all ${isAnimating ? 'scale-125' : 'scale-100'} ${className}`}
      aria-label={isFavorite ? `Remove ${type} from favorites` : `Add ${type} to favorites`}
    >
      {isFavorite ? (
        <Star className={`fill-yellow-400 text-yellow-500 ${sizeClasses[size]}`} />
      ) : (
        <StarOff className={`text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 ${sizeClasses[size]}`} />
      )}
    </button>
  );
};

export default FavoriteToggle;
```

### Favorites Section in Weather Page

```tsx
// pages/Weather.tsx (excerpt)
const Weather = () => {
  const { cities, loading, error } = useAppSelector(state => state.weather);
  const { favoriteCities } = useAppSelector(state => state.userPreferences);
  
  // Filter cities to get favorite cities
  const favoriteCityData = cities.filter(city => 
    favoriteCities.includes(city.cityId)
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Weather</h1>
      
      {/* Favorites section */}
      {favoriteCityData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Favorite Locations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteCityData.map(city => (
              <WeatherCard key={city.cityId} city={city} />
            ))}
          </div>
        </div>
      )}
      
      {/* Rest of the component... */}
    </div>
  );
};
```

### Favorites Section in Crypto Page

```tsx
// pages/Crypto.tsx (excerpt)
const Crypto = () => {
  const { cryptocurrencies, loading, error } = useAppSelector(state => state.crypto);
  const { favoriteCryptos } = useAppSelector(state => state.userPreferences);
  
  // Filter cryptocurrencies to get favorites
  const favoriteCryptoData = cryptocurrencies.filter(crypto => 
    favoriteCryptos.includes(crypto.id)
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cryptocurrency Tracker</h1>
      
      {/* Favorites section */}
      {favoriteCryptoData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Favorite Cryptocurrencies
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteCryptoData.map(crypto => (
              <CryptoCard key={crypto.id} crypto={crypto} />
            ))}
          </div>
        </div>
      )}
      
      {/* Rest of the component... */}
    </div>
  );
};
```

### Integration in Detail Pages

```tsx
// pages/CityDetail.tsx (excerpt)
const CityDetail = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const { cities } = useAppSelector(state => state.weather);
  const { favoriteCities } = useAppSelector(state => state.userPreferences);
  
  const cityData = cities.find(city => city.cityId === cityId);
  const isFavorite = favoriteCities.includes(cityId);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{cityData?.cityName || 'Loading...'}</h1>
        
        <FavoriteToggle id={cityId} type="city" size="lg" />
      </div>
      
      {/* Rest of the component... */}
    </div>
  );
};
```

## Visual Highlighting

Favorite items are visually highlighted in list views with a special icon or background:

```tsx
// components/WeatherCard.tsx (excerpt)
const WeatherCard = ({ city }: { city: WeatherData }) => {
  const { favoriteCities } = useAppSelector(state => state.userPreferences);
  const isFavorite = favoriteCities.includes(city.cityId);
  
  return (
    <div className={`
      p-4 rounded-lg shadow transition-all hover:shadow-md
      ${isFavorite ? 'ring-2 ring-yellow-400 dark:ring-yellow-600' : ''}
    `}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium">{city.cityName}</h3>
        <FavoriteToggle id={city.cityId} type="city" />
      </div>
      
      {/* Rest of the component... */}
    </div>
  );
};
```

## Prioritizing Favorites in Search

Favorites are prioritized when searching or filtering results:

```typescript
// utils/searchHelpers.ts
export const searchAndSortCities = (
  cities: WeatherData[], 
  searchTerm: string, 
  favoriteCities: string[]
): WeatherData[] => {
  if (!searchTerm) {
    // If no search term, sort by favorites first, then alphabetically
    return [...cities].sort((a, b) => {
      const aIsFavorite = favoriteCities.includes(a.cityId);
      const bIsFavorite = favoriteCities.includes(b.cityId);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      return a.cityName.localeCompare(b.cityName);
    });
  }
  
  // If search term exists, filter and sort results
  const normalizedSearchTerm = searchTerm.toLowerCase();
  
  return cities
    .filter(city => 
      city.cityName.toLowerCase().includes(normalizedSearchTerm)
    )
    .sort((a, b) => {
      // First, sort by favorites
      const aIsFavorite = favoriteCities.includes(a.cityId);
      const bIsFavorite = favoriteCities.includes(b.cityId);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // Second, sort by exact match
      const aStartsWithTerm = a.cityName.toLowerCase().startsWith(normalizedSearchTerm);
      const bStartsWithTerm = b.cityName.toLowerCase().startsWith(normalizedSearchTerm);
      
      if (aStartsWithTerm && !bStartsWithTerm) return -1;
      if (!aStartsWithTerm && bStartsWithTerm) return 1;
      
      // Finally, sort alphabetically
      return a.cityName.localeCompare(b.cityName);
    });
};
```

## Favorite Count Badge

The application shows a count of favorites in the navigation:

```tsx
// components/NavBar.tsx (excerpt)
const NavBar = () => {
  const { favoriteCities, favoriteCryptos } = useAppSelector(state => state.userPreferences);
  const totalFavorites = favoriteCities.length + favoriteCryptos.length;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4">
      {/* ... */}
      
      <div className="flex items-center space-x-4">
        {totalFavorites > 0 && (
          <Link to="/favorites" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-yellow-600 rounded-full">
              {totalFavorites}
            </span>
          </Link>
        )}
        
        {/* Other navbar items... */}
      </div>
    </nav>
  );
};
```

## Favorites Page

A dedicated page to view and manage all favorites in one place:

```tsx
// pages/Favorites.tsx
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Star, Trash2 } from 'lucide-react';
import { removeFavoriteCity, removeFavoriteCrypto } from '../store/slices/userPreferencesSlice';
import WeatherCard from '../components/WeatherCard';
import CryptoCard from '../components/CryptoCard';

const Favorites = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('cities');
  
  const { cities } = useAppSelector(state => state.weather);
  const { cryptocurrencies } = useAppSelector(state => state.crypto);
  const { favoriteCities, favoriteCryptos } = useAppSelector(state => state.userPreferences);
  
  // Get favorite data for both categories
  const favoriteCityData = cities.filter(city => favoriteCities.includes(city.cityId));
  const favoriteCryptoData = cryptocurrencies.filter(crypto => favoriteCryptos.includes(crypto.id));
  
  const clearAllCityFavorites = () => {
    if (confirm('Are you sure you want to remove all favorite cities?')) {
      favoriteCities.forEach(cityId => {
        dispatch(removeFavoriteCity(cityId));
      });
    }
  };
  
  const clearAllCryptoFavorites = () => {
    if (confirm('Are you sure you want to remove all favorite cryptocurrencies?')) {
      favoriteCryptos.forEach(cryptoId => {
        dispatch(removeFavoriteCrypto(cryptoId));
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Star className="h-6 w-6 text-yellow-500 mr-2" />
          My Favorites
        </h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="cities" className="flex items-center">
            Cities
            {favoriteCities.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {favoriteCities.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="cryptos" className="flex items-center">
            Cryptocurrencies
            {favoriteCryptos.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {favoriteCryptos.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="cities">
          {favoriteCityData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't added any cities to your favorites yet.</p>
              <Link to="/weather" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Browse Cities
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button 
                  onClick={clearAllCityFavorites}
                  className="flex items-center text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteCityData.map(city => (
                  <WeatherCard key={city.cityId} city={city} />
                ))}
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="cryptos">
          {favoriteCryptoData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't added any cryptocurrencies to your favorites yet.</p>
              <Link to="/crypto" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Browse Cryptocurrencies
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button 
                  onClick={clearAllCryptoFavorites}
                  className="flex items-center text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteCryptoData.map(crypto => (
                  <CryptoCard key={crypto.id} crypto={crypto} />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Favorites;
```

## Migration & Data Persistence

The application includes migration logic to handle changes in data structure:

```typescript
// utils/migrateUserPreferences.ts
export const migrateUserPreferences = (storedPreferences: any): UserPreferencesState => {
  const defaultPreferences: UserPreferencesState = {
    favoriteCities: [],
    favoriteCryptos: [],
    darkMode: false,
    temperatureUnit: 'celsius',
    lastVisited: {}
  };
  
  // If nothing stored, return default
  if (!storedPreferences) {
    return defaultPreferences;
  }
  
  // Ensure all required fields exist
  const migratedPreferences = {
    ...defaultPreferences,
    ...storedPreferences
  };
  
  // Ensure arrays are actually arrays
  if (!Array.isArray(migratedPreferences.favoriteCities)) {
    migratedPreferences.favoriteCities = [];
  }
  
  if (!Array.isArray(migratedPreferences.favoriteCryptos)) {
    migratedPreferences.favoriteCryptos = [];
  }
  
  return migratedPreferences;
};
```

## Summary

The favorites feature in the Weather-Verse-Visuals application provides:

1. A persistent way for users to track their frequently accessed cities and cryptocurrencies
2. Visual highlighting of favorite items throughout the application
3. Dedicated sections for favorites on relevant pages for quick access
4. A consolidated favorites page for management
5. Prioritization of favorites in search results
6. Integration with the global navigation for quick access
7. Clear visual affordances for adding and removing favorites 