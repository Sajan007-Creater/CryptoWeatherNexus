# Redux Implementation

This project uses Redux for state management with Redux Toolkit and Redux Thunk for handling asynchronous actions.

## Structure

- `/store`: Main Redux store configuration
  - `/slices`: Redux Toolkit slices for each feature
    - `weatherSlice.ts`: Weather feature state and actions
    - `cryptoSlice.ts`: Cryptocurrency feature state and actions
    - `newsSlice.ts`: News feature state and actions
  - `index.ts`: Store configuration and exports
  - `hooks.ts`: Custom Redux hooks
  - `types.ts`: TypeScript types for the Redux state

## Usage

### Using Redux Hooks

Use the typed hooks to access the Redux store:

```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';

// In your component
const Component = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector(state => state.featureName);
  
  // Dispatch actions
  const handleAction = () => {
    dispatch(someAction());
  };
  
  return (
    // Your component UI
  );
};
```

### Using Custom Feature Hooks

The project also provides custom hooks for each feature:

```typescript
import { useWeather } from '../hooks/useWeather';

const Component = () => {
  const { currentWeather, loading, error, searchCity } = useWeather();
  
  const handleSearch = async (city) => {
    await searchCity(city);
  };
  
  return (
    // Your component UI using the weather state
  );
};
```

## Async Actions with Redux Thunk

Redux Thunk middleware is used for async operations. Example from weather slice:

```typescript
export const fetchWeatherByCity = createAsyncThunk(
  'weather/fetchByCity',
  async (cityName: string, { rejectWithValue }) => {
    try {
      // API call logic
      const response = await api.fetchWeather(cityName);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch weather data');
    }
  }
);
```

## State Structure

The root state is composed of feature states:

```typescript
{
  weather: {
    currentWeather: { ... },
    cities: [ ... ],
    loading: false,
    error: null
  },
  crypto: {
    cryptocurrencies: [ ... ],
    selectedCrypto: { ... },
    loading: false,
    error: null
  },
  news: {
    articles: [ ... ],
    selectedArticle: { ... },
    categories: [ ... ],
    loading: false,
    error: null
  }
}
``` 