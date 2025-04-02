# Deep Linking Implementation

This document describes the implementation of deep linking support in the Weather-Verse-Visuals application, allowing users to directly access detailed content via URLs.

## Overview

Deep linking enables users to navigate directly to specific content within the application through URLs. This includes:

1. Direct access to city weather details (e.g., `/weather/london-uk`)
2. Direct access to cryptocurrency details (e.g., `/crypto/bitcoin`)
3. Direct access to news articles (e.g., `/news/article/12345`)
4. Proper data loading for initial page renders
5. Preserving user context when sharing links

## Implementation Strategy

The application uses React Router for routing and implements a comprehensive data fetching strategy for deep links.

### Route Configuration

The routes are defined in `App.tsx` with specific parameter patterns to support deep linking:

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Weather from './pages/Weather';
import CityDetail from './pages/CityDetail';
import Crypto from './pages/Crypto';
import CryptoDetail from './pages/CryptoDetail';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="weather" element={<Weather />} />
          <Route path="weather/:cityId" element={<CityDetail />} />
          <Route path="crypto" element={<Crypto />} />
          <Route path="crypto/:cryptoId" element={<CryptoDetail />} />
          <Route path="news" element={<News />} />
          <Route path="news/article/:articleId" element={<NewsDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Data Fetching for Deep Links

The application implements data pre-fetching in detail view components to ensure data is available when accessing a page directly:

```tsx
// pages/CityDetail.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWeatherForCity } from '../store/slices/weatherSlice';

const CityDetail = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { cities, loading, error } = useAppSelector(state => state.weather);
  const cityData = cities.find(city => city.cityId === cityId);
  
  // Fetch data if accessing the page directly (deep link)
  useEffect(() => {
    // Only fetch if we don't already have the data
    if (!cityData && !loading && !error) {
      dispatch(fetchWeatherForCity(cityId))
        .unwrap()
        .catch(error => {
          console.error('Failed to load city data:', error);
          // Redirect to main weather page if city not found
          if (error.status === 404) {
            navigate('/weather', { replace: true });
          }
        });
    }
  }, [cityId, cityData, loading, error, dispatch, navigate]);
  
  // Update last visited city in user preferences
  useEffect(() => {
    if (cityId) {
      dispatch(setLastVisited({ city: cityId }));
    }
  }, [cityId, dispatch]);
  
  // ... rest of component
};
```

### Handling Crypto Detail Deep Links

Similar approach for cryptocurrency detail pages:

```tsx
// pages/CryptoDetail.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCryptoDetail } from '../store/slices/cryptoSlice';

const CryptoDetail = () => {
  const { cryptoId } = useParams<{ cryptoId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { selectedCrypto, loading, error } = useAppSelector(state => state.crypto);
  
  // Fetch data if accessing the page directly (deep link)
  useEffect(() => {
    // Only fetch if we don't have the data or it's for a different crypto
    if ((!selectedCrypto || selectedCrypto.id !== cryptoId) && !loading) {
      dispatch(fetchCryptoDetail(cryptoId))
        .unwrap()
        .catch(error => {
          console.error('Failed to load crypto data:', error);
          // Redirect to main crypto page if not found
          if (error.status === 404) {
            navigate('/crypto', { replace: true });
          }
        });
    }
  }, [cryptoId, selectedCrypto, loading, dispatch, navigate]);
  
  // ... rest of component
};
```

## State Dehydration/Rehydration

For optimal performance with deep links, the application implements state dehydration/rehydration:

```typescript
// utils/stateHydration.ts
import { RootState } from '../store/types';

// Key for storing dehydrated state
const STATE_STORAGE_KEY = 'weather-verse-state';

// Dehydrate key portions of state for future rehydration
export const dehydrateState = (state: RootState): void => {
  try {
    // Only store essential data to keep storage size manageable
    const dehydratedState = {
      weather: {
        cities: state.weather.cities.map(city => ({
          cityId: city.cityId,
          cityName: city.cityName,
          temperature: city.temperature,
          conditions: city.conditions,
          lastUpdated: city.lastUpdated
        }))
      },
      crypto: {
        cryptocurrencies: state.crypto.cryptocurrencies.map(crypto => ({
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol,
          price: crypto.price,
          change24h: crypto.change24h
        }))
      }
    };
    
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(dehydratedState));
  } catch (error) {
    console.error('Failed to dehydrate state:', error);
  }
};

// Rehydrate state from storage when app loads
export const rehydrateState = (): Partial<RootState> | undefined => {
  try {
    const storedState = localStorage.getItem(STATE_STORAGE_KEY);
    if (!storedState) return undefined;
    
    return JSON.parse(storedState);
  } catch (error) {
    console.error('Failed to rehydrate state:', error);
    return undefined;
  }
};
```

## URL Parameters and Data Fetching

The application carefully handles URL parameters to ensure correct data fetching:

```typescript
// utils/urlParams.ts
// Extract and sanitize URL parameters
export const sanitizeCityId = (cityId: string): string => {
  // Remove any potentially dangerous characters
  return cityId.replace(/[^a-zA-Z0-9-_]/g, '');
};

export const sanitizeCryptoId = (cryptoId: string): string => {
  return cryptoId.toLowerCase().replace(/[^a-z0-9-]/g, '');
};

// Convert display names to URL-friendly IDs
export const cityNameToId = (cityName: string): string => {
  return cityName.toLowerCase().replace(/\s+/g, '-');
};

export const cryptoNameToId = (cryptoName: string): string => {
  return cryptoName.toLowerCase().replace(/\s+/g, '-');
};
```

## Handling Loading States for Deep Links

The application provides appropriate loading indicators for deep links:

```tsx
// components/DetailPageSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

const DetailPageSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Skeleton className="h-64 w-full rounded-lg mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        
        <div>
          <Skeleton className="h-48 w-full rounded-lg mb-4" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default DetailPageSkeleton;
```

## Navigation from Search

The application supports direct deep link generation from search results:

```tsx
// components/SearchResults.tsx (excerpt)
import { Link } from 'react-router-dom';

const SearchResults = ({ results, type }) => {
  return (
    <div className="search-results">
      {results.map(result => (
        <Link 
          key={result.id}
          to={type === 'city' ? `/weather/${result.cityId}` : `/crypto/${result.id}`}
          className="search-result-item"
        >
          {/* Result content */}
        </Link>
      ))}
    </div>
  );
};
```

## Deep Link Sharing

The application facilitates sharing deep links:

```tsx
// components/ShareButton.tsx
import { Share2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ShareButtonProps {
  title: string;
  path: string;
}

const ShareButton = ({ title, path }: ShareButtonProps) => {
  const handleShare = async () => {
    const url = `${window.location.origin}${path}`;
    
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: "Link Copied",
          description: "Link has been copied to clipboard",
        });
      });
    }
  };
  
  return (
    <button 
      onClick={handleShare}
      className="flex items-center px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
      aria-label="Share"
    >
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </button>
  );
};

export default ShareButton;
```

## URL Search Parameters for Filters

The application preserves filter states in URLs for shareable filtered views:

```typescript
// hooks/useSearchParams.ts
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export function useFilterParams<T extends Record<string, string | string[]>>(
  initialFilters: T,
  onChange?: (filters: T) => void
) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract filters from URL search params
  const getFiltersFromParams = (): T => {
    const result = { ...initialFilters };
    
    // Populate from search params
    Object.keys(initialFilters).forEach(key => {
      if (searchParams.has(key)) {
        const value = searchParams.get(key);
        if (value) {
          if (Array.isArray(initialFilters[key])) {
            result[key] = value.split(',') as any;
          } else {
            result[key] = value as any;
          }
        }
      }
    });
    
    return result;
  };
  
  // Get current filters
  const filters = getFiltersFromParams();
  
  // Update URL when filters change
  const updateFilters = (newFilters: Partial<T>) => {
    const updated = { ...filters, ...newFilters };
    
    // Create new search params
    const newSearchParams = new URLSearchParams();
    
    // Add non-empty filters to search params
    Object.entries(updated).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            newSearchParams.set(key, value.join(','));
          }
        } else {
          newSearchParams.set(key, value as string);
        }
      }
    });
    
    // Update URL
    setSearchParams(newSearchParams);
  };
  
  // Notify parent component of filter changes
  useEffect(() => {
    if (onChange) {
      onChange(filters);
    }
  }, [searchParams, onChange]);
  
  return {
    filters,
    updateFilters,
    resetFilters: () => setSearchParams(new URLSearchParams())
  };
}
```

## Error Handling for Invalid Deep Links

The application gracefully handles invalid deep links:

```tsx
// components/NotFound.tsx
import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/notificationSlice';

const NotFound = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Notify user about invalid URL
    dispatch(addNotification({
      id: `not-found-${Date.now()}`,
      type: 'system_alert',
      title: 'Page Not Found',
      message: `The requested page "${location.pathname}" does not exist.`,
      priority: 'medium',
      timestamp: Date.now(),
      read: false
    }));
  }, [location.pathname, dispatch]);
  
  // Determine relevant suggestion based on URL pattern
  const getSuggestion = () => {
    if (location.pathname.startsWith('/weather/')) {
      return (
        <>
          <p>Looking for weather data? Try our main weather page:</p>
          <Link to="/weather" className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Browse Weather
          </Link>
        </>
      );
    }
    
    if (location.pathname.startsWith('/crypto/')) {
      return (
        <>
          <p>Looking for cryptocurrency data? Try our main crypto page:</p>
          <Link to="/crypto" className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Browse Cryptocurrencies
          </Link>
        </>
      );
    }
    
    return (
      <>
        <p>You can return to our homepage:</p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Go to Homepage
        </Link>
      </>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Sorry, the page you're looking for doesn't exist.
      </p>
      
      <div className="mb-8">
        {getSuggestion()}
      </div>
    </div>
  );
};

export default NotFound;
```

## Deep Link Analytics

The application tracks deep link usage:

```typescript
// utils/analytics.ts
export const trackPageView = (path: string) => {
  // In a real app, this would integrate with Google Analytics, 
  // Mixpanel, or another analytics service
  
  const isDeepLink = path.split('/').length > 2;
  
  console.log('Analytics pageview:', {
    path,
    isDeepLink,
    timestamp: new Date().toISOString()
  });
  
  // Example implementation with window.gtag
  /*
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
      deep_link: isDeepLink
    });
  }
  */
};

// Hook for tracking page views
export const usePageTracking = () => {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);
};
```

## Testing Deep Links

The application includes tests for deep link functionality:

```typescript
// __tests__/deepLinks.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store';
import CryptoDetail from '../pages/CryptoDetail';
import CityDetail from '../pages/CityDetail';

// Mock API responses
jest.mock('../api/crypto', () => ({
  fetchCryptoById: jest.fn().mockResolvedValue({
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 50000,
    change24h: 2.5
  })
}));

jest.mock('../api/weather', () => ({
  fetchCityWeather: jest.fn().mockResolvedValue({
    cityId: 'london-uk',
    cityName: 'London',
    temperature: 15,
    conditions: 'Cloudy'
  })
}));

describe('Deep linking', () => {
  test('loads crypto details directly via URL', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/crypto/bitcoin']}>
          <Routes>
            <Route path="/crypto/:cryptoId" element={<CryptoDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    // Should show loading state initially
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    
    // Should display data after loading
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      expect(screen.getByText('$50,000.00')).toBeInTheDocument();
    });
  });
  
  test('loads city weather details directly via URL', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/weather/london-uk']}>
          <Routes>
            <Route path="/weather/:cityId" element={<CityDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    // Should display data after loading
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('15°')).toBeInTheDocument();
      expect(screen.getByText('Cloudy')).toBeInTheDocument();
    });
  });
});
```

## Summary

The deep linking implementation in Weather-Verse-Visuals provides:

1. Direct access to detailed content through URLs
2. Proper data loading for initial page renders
3. Graceful handling of invalid deep links
4. URL-based filter preservation
5. Sharing functionality for deep links
6. Analytics tracking for deep link usage
7. Comprehensive testing of deep link functionality 