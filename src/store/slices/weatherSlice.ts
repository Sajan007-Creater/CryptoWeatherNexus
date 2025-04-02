import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Weather alert type definition
export type WeatherAlertType = 'storm' | 'flood' | 'heat' | 'cold' | 'wind';

export interface WeatherAlert {
  id: string;
  type: WeatherAlertType;
  cityId: string;
  cityName: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

interface WeatherData {
  cityId: string;
  cityName: string;
  temperature?: number;
  conditions?: string;
  forecast?: any[];
  loading: boolean;
  error: string | null;
}

interface WeatherState {
  currentWeather: WeatherData | null;
  cities: WeatherData[];
  alerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
}

const initialState: WeatherState = {
  currentWeather: null,
  cities: [],
  alerts: [],
  loading: false,
  error: null
};

export const fetchWeatherByCity = createAsyncThunk(
  'weather/fetchByCity',
  async (cityName: string, { rejectWithValue }) => {
    try {
      // This would typically be an API call
      // For now, we'll simulate a fetch response with mock data
      const response = await new Promise<WeatherData>((resolve) => {
        setTimeout(() => {
          resolve({
            cityId: Math.random().toString(36).substring(2, 15),
            cityName,
            temperature: Math.floor(Math.random() * 30),
            conditions: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
            forecast: [],
            loading: false,
            error: null
          });
        }, 500);
      });
      
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch weather data');
    }
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setCurrentWeather: (state, action: PayloadAction<WeatherData>) => {
      state.currentWeather = action.payload;
    },
    clearWeatherError: (state) => {
      state.error = null;
    },
    // Add a new reducer for weather alerts
    addWeatherAlert: (state, action: PayloadAction<WeatherAlert>) => {
      // Add the alert to the beginning of the array so newest alerts are first
      state.alerts = [action.payload, ...state.alerts].slice(0, 10); // Keep only 10 most recent alerts
    },
    // Add a reducer to dismiss/remove an alert
    dismissWeatherAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    // Add a reducer to clear all alerts
    clearAllWeatherAlerts: (state) => {
      state.alerts = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherByCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherByCity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWeather = action.payload;
        
        // Add to cities if not already present
        const cityExists = state.cities.some(city => city.cityId === action.payload.cityId);
        if (!cityExists) {
          state.cities.push(action.payload);
        }
      })
      .addCase(fetchWeatherByCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch weather data';
      });
  }
});

export const { 
  setCurrentWeather, 
  clearWeatherError, 
  addWeatherAlert, 
  dismissWeatherAlert, 
  clearAllWeatherAlerts 
} = weatherSlice.actions;
export default weatherSlice.reducer; 