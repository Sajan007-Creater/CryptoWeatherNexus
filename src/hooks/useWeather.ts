import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts'; 
import { fetchWeatherByCity, clearWeatherError } from '../store/slices/weatherSlice.ts';
import { toast } from '@/components/ui/use-toast';

export function useWeather() {
  const dispatch = useAppDispatch();
  const { currentWeather, cities, loading, error } = useAppSelector(state => state.weather);

  const searchCity = useCallback(async (cityName: string) => {
    if (!cityName.trim()) return;
    
    try {
      const resultAction = await dispatch(fetchWeatherByCity(cityName)).unwrap();
      toast({
        title: "Weather data loaded",
        description: `Weather information for ${cityName} has been loaded.`,
      });
      return resultAction;
    } catch (error) {
      console.error('Error searching for city:', error);
      toast({
        title: "Search failed",
        description: `No results found for "${cityName}"`,
        variant: "destructive"
      });
      throw error;
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearWeatherError());
  }, [dispatch]);

  return {
    currentWeather,
    cities,
    loading,
    error,
    searchCity,
    clearError
  };
} 