# Data Refresh Strategy & Error Handling

This document outlines the implementation of data refresh mechanisms and error handling strategies in the Weather-Verse-Visuals application.

## Data Refresh Approach

The application implements a comprehensive data refresh strategy to ensure users always have access to relatively current data while balancing API usage and performance considerations.

### Periodic Data Synchronization

The application uses a multi-tiered approach to data refreshing:

1. **Automatic Refresh Interval**: Data is refreshed automatically every 60 seconds
2. **Manual Refresh Controls**: Users can initiate refreshes for immediate updates
3. **On-Focus Refresh**: Data refreshes when the browser tab regains focus after being inactive
4. **On-Mount Refresh**: Fresh data is fetched when components mount if data is stale

### Implementation Example

```typescript
// Weather data refresh logic in weatherSlice.ts
export const startWeatherRefreshCycle = (): AppThunk => async (dispatch, getState) => {
  // Set up initial refresh interval
  const refreshInterval = setInterval(() => {
    const state = getState();
    const { cities } = state.weather;
    
    // Only refresh data that is older than 60 seconds
    const citiesToRefresh = cities.filter(city => {
      const lastUpdated = city.lastUpdated || 0;
      const now = Date.now();
      return now - lastUpdated > 60000; // 60 seconds
    });
    
    // Refresh each city that needs it
    citiesToRefresh.forEach(city => {
      dispatch(fetchWeatherForCity(city.cityId));
    });
  }, 60000); // Run every 60 seconds
  
  // Store interval ID for cleanup
  dispatch(setRefreshInterval(refreshInterval));
  
  // Clean up on component unmount
  return () => {
    clearInterval(refreshInterval);
    dispatch(setRefreshInterval(null));
  };
};
```

### Manual Refresh Implementation

The application provides UI controls for manual data refresh:

```tsx
// Manual refresh button in WeatherPage.tsx
const handleRefreshClick = () => {
  setIsRefreshing(true);
  
  dispatch(refreshAllWeatherData())
    .then(() => {
      // Show success toast
      toast({
        title: "Weather Updated",
        description: "Latest weather data has been loaded",
        variant: "default"
      });
    })
    .catch(error => {
      // Show error toast
      toast({
        title: "Update Failed",
        description: error.message || "Could not refresh weather data",
        variant: "destructive"
      });
    })
    .finally(() => {
      setIsRefreshing(false);
    });
};
```

### Focus/Visibility Detection

The application detects when a user returns to the tab to refresh data:

```typescript
// Focus detection in App.tsx
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // User has returned to the tab
      dispatch(refreshStaleData());
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [dispatch]);
```

## Error Handling Strategy

The application implements robust error handling to ensure a smooth user experience even when API calls fail or data is unavailable.

### Graceful Degradation Approach

1. **Component-Level Error Boundaries**: Prevent entire app crashes when components fail
2. **Fallback UI Components**: Display user-friendly alternatives when data cannot be loaded
3. **Cached Data Usage**: Show stale data with an indicator when fresh data cannot be fetched
4. **Retry Mechanisms**: Attempt to recover automatically from transient failures

### Error State Management in Redux

Error states are tracked in Redux slices to allow for appropriate UI feedback:

```typescript
// Error state management in cryptoSlice.ts
const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    // ...other reducers
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});
```

### API Call Error Handling

The application handles API call failures with a standardized approach:

```typescript
// Thunk with error handling
export const fetchCryptoData = (): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(clearError());
  
  try {
    // Track retry attempts
    let retryCount = 0;
    const maxRetries = 3;
    
    // Retry logic
    const executeFetch = async (): Promise<CryptoData[]> => {
      try {
        const response = await fetch('https://api.example.com/crypto');
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          // Exponential backoff
          const delay = 1000 * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeFetch();
        }
        throw error;
      }
    };
    
    const data = await executeFetch();
    dispatch(setCryptoData(data));
  } catch (error) {
    console.error('Failed to fetch crypto data:', error);
    dispatch(setError(error.message || 'Failed to load cryptocurrency data'));
    
    // Notify user
    if (error.message !== 'Request aborted') {
      // Don't show notifications for canceled requests
      dispatch(addNotification({
        id: `error-${Date.now()}`,
        type: 'system_alert',
        title: 'Data Fetch Error',
        message: 'Could not retrieve latest cryptocurrency data. Using cached data.',
        priority: 'medium',
        timestamp: Date.now(),
        read: false
      }));
    }
  } finally {
    dispatch(setLoading(false));
  }
};
```

### Fallback UI Components

The application implements fallback UI components for failed data loads:

```tsx
// Fallback component example in CryptoCardList.tsx
const CryptoCardList = () => {
  const { cryptocurrencies, loading, error } = useAppSelector(state => state.crypto);
  
  if (loading && cryptocurrencies.length === 0) {
    return <CryptoCardSkeleton count={6} />;
  }
  
  if (error && cryptocurrencies.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-red-50 dark:bg-red-900/20">
        <h3 className="text-lg font-medium mb-2">Unable to load cryptocurrency data</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
        <button 
          onClick={() => dispatch(fetchCryptoData())}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // If we have cached data but there was an error fetching new data
  if (error && cryptocurrencies.length > 0) {
    return (
      <>
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
          <AlertTriangle className="inline-block mr-2 h-4 w-4 text-yellow-600" />
          Showing cached data. Could not retrieve latest updates.
          <button 
            onClick={() => dispatch(fetchCryptoData())}
            className="ml-2 underline text-purple-600"
          >
            Retry
          </button>
        </div>
        
        {/* Render crypto cards with cached data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cryptocurrencies.map(crypto => (
            <CryptoCard key={crypto.id} crypto={crypto} />
          ))}
        </div>
      </>
    );
  }
  
  // Normal render with data
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cryptocurrencies.map(crypto => (
        <CryptoCard key={crypto.id} crypto={crypto} />
      ))}
    </div>
  );
};
```

### Error Boundary Implementation

The application uses React Error Boundaries to catch render errors:

```tsx
// ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to a service like Sentry/LogRocket
    // logErrorToService(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-6 border rounded-lg bg-red-50 dark:bg-red-900/20">
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Partial API Failures

The application handles partial API failures, where some data is available but other parts fail to load:

### Partial Failure Strategy

1. **Independent Data Fetching**: Each data category is fetched independently
2. **Section-by-Section Fallback**: Only affected sections show error states
3. **Granular Error Tracking**: Track errors at the entity level (per city, per crypto)

### Implementation Example

```typescript
// Handling partial failures in weatherSlice.ts
export const fetchWeatherForMultipleCities = (cityIds: string[]): AppThunk => async (dispatch) => {
  // Track individual failures
  const failedCities: string[] = [];
  
  // Process each city independently
  await Promise.allSettled(
    cityIds.map(async (cityId) => {
      try {
        await dispatch(fetchWeatherForCity(cityId));
      } catch (error) {
        console.error(`Failed to fetch weather for city ${cityId}:`, error);
        failedCities.push(cityId);
        
        // Set error at the individual city level
        dispatch(setWeatherErrorForCity({
          cityId,
          error: error.message || 'Failed to load weather data'
        }));
      }
    })
  );
  
  // Notify about failed cities if there were any
  if (failedCities.length > 0) {
    dispatch(addNotification({
      id: `partial-failure-${Date.now()}`,
      type: 'system_alert',
      title: 'Partial Data Failure',
      message: `Weather data for ${failedCities.length} cities could not be loaded.`,
      priority: 'medium',
      timestamp: Date.now(),
      read: false
    }));
  }
  
  return { failedCities };
};
```

## Data Freshness Tracking

The application tracks data freshness to provide transparency to users:

```tsx
// LastUpdated component for data freshness indication
const LastUpdated = ({ timestamp }: { timestamp: number }) => {
  const [timeAgo, setTimeAgo] = useState<string>('');
  
  useEffect(() => {
    const updateTimeAgo = () => {
      const now = Date.now();
      const seconds = Math.floor((now - timestamp) / 1000);
      
      if (seconds < 60) {
        setTimeAgo('just now');
      } else if (seconds < 120) {
        setTimeAgo('1 minute ago');
      } else if (seconds < 3600) {
        setTimeAgo(`${Math.floor(seconds / 60)} minutes ago`);
      } else {
        setTimeAgo(`${Math.floor(seconds / 3600)} hours ago`);
      }
    };
    
    updateTimeAgo();
    const intervalId = setInterval(updateTimeAgo, 30000);
    
    return () => clearInterval(intervalId);
  }, [timestamp]);
  
  // Apply warning class if data is stale (older than 5 minutes)
  const isStale = Date.now() - timestamp > 5 * 60 * 1000;
  
  return (
    <span className={`text-xs ${isStale ? 'text-yellow-600' : 'text-gray-500'}`}>
      Updated {timeAgo}
      {isStale && <RefreshCw className="inline-block ml-1 h-3 w-3" />}
    </span>
  );
};
```

## Summary

The Weather-Verse-Visuals application implements a comprehensive data refresh and error handling strategy that ensures:

1. Data is periodically refreshed to maintain freshness
2. Users can manually trigger refreshes when needed
3. The application gracefully handles API failures
4. Fallback UI components maintain usability when data cannot be loaded
5. Error boundaries prevent catastrophic application failures
6. Partial API failures only affect relevant sections
7. Data freshness is tracked and communicated to users 