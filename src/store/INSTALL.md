# Redux Installation Guide

This guide will help you set up Redux with Redux Toolkit and Redux Thunk middleware in your project.

## Installation

Install the required packages:

```bash
npm install redux react-redux @reduxjs/toolkit
```

Redux Thunk is included with Redux Toolkit, so you don't need to install it separately.

## File Structure

Create the following directory structure:

```
src/
└── store/
    ├── index.ts        # Main store configuration
    ├── hooks.ts        # Custom Redux hooks
    ├── types.ts        # TypeScript type definitions
    └── slices/         # Feature slices
        ├── weatherSlice.ts
        ├── cryptoSlice.ts
        └── newsSlice.ts
```

## Implementation Steps

### 1. Define Types (types.ts)

Create state types for each feature slice and a root state type:

```typescript
// Weather State Types
export interface WeatherState {
  currentWeather: WeatherData | null;
  cities: WeatherData[];
  loading: boolean;
  error: string | null;
}

// Root State Type
export interface RootState {
  weather: WeatherState;
  crypto: CryptoState;
  news: NewsState;
}
```

### 2. Configure Store (index.ts)

Set up the Redux store:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './slices/weatherSlice';
import cryptoReducer from './slices/cryptoSlice';
import newsReducer from './slices/newsSlice';
import { RootState as AppRootState } from './types';

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    crypto: cryptoReducer,
    news: newsReducer
  }
  // Redux Toolkit's configureStore already includes thunk middleware by default
});

export type RootState = AppRootState;
export type AppDispatch = typeof store.dispatch;
```

### 3. Create Custom Hooks (hooks.ts)

Create typed hooks for better TypeScript integration:

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 4. Create Feature Slices

Create slice files for each feature:

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Create an async thunk for data fetching
export const fetchData = createAsyncThunk(
  'feature/fetchData',
  async (param, { rejectWithValue }) => {
    try {
      // API call
      return data;
    } catch (error) {
      return rejectWithValue('Error message');
    }
  }
);

// Create the slice
const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    // Synchronous actions
  },
  extraReducers: (builder) => {
    // Handle async actions
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});
```

### 5. Wrap App with Provider

Update your main App file to use the Redux Provider:

```tsx
import { Provider } from 'react-redux';
import { store } from './store';

const App = () => (
  <Provider store={store}>
    <YourApp />
  </Provider>
);
```

### 6. Use Redux in Components

Use the custom hooks in your components:

```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchData } from '../store/slices/featureSlice';

function YourComponent() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(state => state.feature);

  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  // Render using the data
}
```

## Troubleshooting

If you encounter module resolution issues with TypeScript, try using explicit file extensions in imports:

```typescript
import { RootState } from './types.ts';
import weatherReducer from './slices/weatherSlice.ts';
```

This is particularly useful in projects using Vite or other bundlers that might require explicit extensions. 