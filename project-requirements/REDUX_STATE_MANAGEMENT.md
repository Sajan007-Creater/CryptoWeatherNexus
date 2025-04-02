# Redux State Management

This document describes the implementation of Redux state management in the Weather-Verse-Visuals application, including user preferences, global data state, and UI feedback mechanisms.

## Overview

The Weather-Verse-Visuals application uses Redux Toolkit to manage global state across several domains:

1. **Weather Data**: Current weather, cities, forecasts, and alerts
2. **Cryptocurrency Data**: Crypto listings, selected crypto details, and real-time prices
3. **News Data**: News articles and categories
4. **User Preferences**: Favorites, UI settings, and browsing history

## Store Structure

The Redux store is organized into feature slices, each with its own reducer, actions, and async thunks:

```
store/
├── index.ts                # Main store configuration
├── hooks.ts                # Type-safe hooks (useAppDispatch, useAppSelector)
├── types.ts                # TypeScript interfaces for state
└── slices/
    ├── weatherSlice.ts     # Weather data, alerts, loading states
    ├── cryptoSlice.ts      # Cryptocurrency data, prices, loading states  
    ├── newsSlice.ts        # News articles, categories, loading states
    └── userPreferencesSlice.ts  # User preferences and settings
```

## User Preferences

### Features

The application stores and persists user preferences including:

- **Favorite Cities**: User-bookmarked cities for quick access
- **Favorite Cryptocurrencies**: User-bookmarked cryptocurrencies
- **UI Settings**:
  - Dark Mode toggle
  - Temperature unit (Celsius/Fahrenheit)
- **Last Visited Items**: Tracks recently viewed cities, cryptos, and news articles

### Implementation

User preferences are implemented in `userPreferencesSlice.ts`:

```typescript
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
```

The slice includes actions for:
- Adding/removing favorites
- Toggling UI settings
- Tracking last visited items
- Resetting all preferences

### Persistence

User preferences are automatically persisted to localStorage:

```typescript
// Helper function to persist preferences to localStorage
const persistPreferences = (state: UserPreferences) => {
  try {
    localStorage.setItem('userPreferences', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to persist preferences:', error);
  }
};
```

On application startup, preferences are loaded from localStorage:

```typescript
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
```

## Global Data State

### Weather State

The `weatherSlice.ts` manages:

- Current weather information
- Weather for multiple cities
- Weather alerts (from WebSocket)
- Loading and error states

Key features:
- Async thunks for fetching weather data
- Weather condition mapping
- City search functionality
- Weather alert management

### Crypto State

The `cryptoSlice.ts` manages:

- List of cryptocurrencies
- Selected cryptocurrency details
- Real-time price updates (from WebSocket)
- Loading and error states

Key features:
- Async thunks for fetching crypto data
- Real-time price update actions
- Price change calculation
- Sorting and filtering options

### News State

The `newsSlice.ts` manages:

- News articles
- Article categories
- Selected article details
- Loading and error states

Key features:
- Async thunks for fetching news data
- Category-based filtering
- Article search functionality

## UI Feedback

The application provides robust UI feedback using:

### Loading States

Loading indicators are implemented as:

- Component-level loading states in Redux slices
- `LoadingState` component for visual feedback
- Size and placement options for different contexts

Example:
```typescript
// In a component
const { loading } = useAppSelector(state => state.weather);

return (
  <div>
    {loading ? (
      <LoadingState text="Loading weather data..." />
    ) : (
      // Render weather data
    )}
  </div>
);
```

### Error States

Error handling is implemented as:

- Error state tracking in Redux slices
- `ErrorState` component for display
- Retry functionality
- Toast notifications for transient errors

Example:
```typescript
// In a component
const { error } = useAppSelector(state => state.crypto);
const dispatch = useAppDispatch();

return (
  <div>
    {error ? (
      <ErrorState 
        message={error}
        onRetry={() => dispatch(fetchCryptoData())}
      />
    ) : (
      // Render crypto data
    )}
  </div>
);
```

### Toast Notifications

Toast notifications are used for:

- Action confirmations (adding/removing favorites)
- Success messages (data refresh)
- Warning messages (feature limitations)
- Error notifications (API failures)

The application uses shadcn/ui's toast system for consistent notifications.

## Component Integration

### User Preference Components

- `UserPreferences.tsx`: Settings panel for managing preferences
- `FavoriteButton.tsx`: Button for adding/removing items from favorites
- `FavoritesList.tsx`: List display of favorite items
- `FavoritesDashboard.tsx`: Dashboard widget displaying favorites

### Data Display Components

Data components integrate with Redux through:

- `useAppSelector` for accessing state
- `useAppDispatch` for dispatching actions
- Conditional rendering based on loading/error states
- Error boundaries for handling unexpected issues

## Testing

The Redux implementation can be tested through:

1. **Unit tests**: Testing reducers, actions, and selectors
2. **Integration tests**: Testing async thunks and API interactions
3. **Component tests**: Testing UI components with Redux state
4. **E2E tests**: Testing full user flows with persisted preferences

## Future Enhancements

Potential improvements to the Redux implementation:

1. **Advanced filtering**: More sophisticated filtering options
2. **Search history**: Track and suggest search history
3. **Offline support**: Enhanced offline capabilities
4. **Performance optimization**: Memoization and selective updates
5. **User accounts**: Server-side persistence of preferences 