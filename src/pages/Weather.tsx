import { useState, useEffect, useCallback } from 'react';
import NavBar from '../components/NavBar';
import WeatherCard from '../components/WeatherCard';
import { Search, RefreshCw } from 'lucide-react';
import { fetchCurrentWeather, fetchMultipleCitiesWeather, WeatherData } from '../utils/weatherApi';
import { toast } from '@/components/ui/use-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { fetchWeatherByCity, setCurrentWeather } from '../store/slices/weatherSlice.ts';

// Create a simple event system to communicate between components
export const weatherEvents = {
  onRefresh: null as ((callback: () => void) => void) | null,
  subscribe: function(callback: () => void) {
    this.onRefresh = callback;
    return () => {
      this.onRefresh = null;
    };
  },
  refresh: function() {
    if (this.onRefresh) {
      this.onRefresh(() => {});
    }
  }
};

const citiesList = [
  'New York', 'London', 'Tokyo', 'Sydney', 'Paris', 
  'Dubai', 'Madrid', 'Singapore', 'Berlin', 'Toronto', 
  'Rome', 'Hong Kong', 'Amsterdam', 'Barcelona', 'Istanbul'
];

const WeatherPage = () => {
  const dispatch = useAppDispatch();
  const { cities, currentWeather, loading, error } = useAppSelector(state => state.weather);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [allCities, setAllCities] = useState<WeatherData[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const fetchWeatherData = useCallback(async () => {
    try {
      setLocalLoading(true);
      const data = await fetchMultipleCitiesWeather(citiesList.slice(0, 8)); // Limit to 8 cities for performance
      setAllCities(data);
    } catch (error) {
      console.error('Error fetching cities weather data:', error);
      toast({
        title: "Weather data error",
        description: "Failed to fetch weather data for cities",
        variant: "destructive"
      });
    } finally {
      setLocalLoading(false);
    }
  }, []);

  const refreshAllWeather = useCallback(async (callback?: () => void) => {
    if (refreshing) return;
    
    try {
      setRefreshing(true);
      // Refresh search result if available
      if (currentWeather) {
        dispatch(fetchWeatherByCity(currentWeather.cityName));
      }
      
      // Refresh all cities
      const data = await fetchMultipleCitiesWeather(citiesList.slice(0, 8));
      setAllCities(data);
      
      // Show success toast
      toast({
        title: "Weather updated",
        description: "Weather data has been refreshed",
      });
      
      if (callback) callback();
    } catch (error) {
      console.error('Error refreshing weather data:', error);
      toast({
        title: "Refresh failed",
        description: "Could not update weather data",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, currentWeather, dispatch]);

  useEffect(() => {
    fetchWeatherData();
    
    // Subscribe to refresh events from navbar
    const unsubscribe = weatherEvents.subscribe(refreshAllWeather);
    return unsubscribe;
  }, [fetchWeatherData, refreshAllWeather]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    try {
      setSearchLoading(true);
      setSearchError(null);
      
      // Dispatch Redux action to fetch weather by city
      dispatch(fetchWeatherByCity(searchTerm));
      
      setSearchCity(searchTerm);
      setSearchTerm('');
    } catch (error) {
      console.error('Error searching for city:', error);
      setSearchError(`No results found for "${searchTerm}"`);
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Convert Redux weather data to match the WeatherData interface if needed
  const convertWeatherData = useCallback((reduxWeather: any): WeatherData => {
    // Convert the condition string to the expected type
    let weatherCondition: 'partly-cloudy' | 'rainy' | 'snowy' | 'windy' | 'sunny' | 'night' = 'partly-cloudy';
    
    // Map the conditions string from Redux to the appropriate WeatherData condition
    if (reduxWeather.conditions) {
      const condition = reduxWeather.conditions.toLowerCase();
      if (condition.includes('cloud')) {
        weatherCondition = 'partly-cloudy';
      } else if (condition.includes('rain')) {
        weatherCondition = 'rainy';
      } else if (condition.includes('snow')) {
        weatherCondition = 'snowy';
      } else if (condition.includes('wind')) {
        weatherCondition = 'windy';
      } else if (condition.includes('sun') || condition.includes('clear')) {
        weatherCondition = 'sunny';
      } else if (condition.includes('night')) {
        weatherCondition = 'night';
      }
    }
    
    return {
      city: reduxWeather.cityName,
      country: 'Unknown', // Redux state might not have this info
      temperature: reduxWeather.temperature || 0,
      condition: weatherCondition,
      humidity: 0, // Add these if Redux state has them
      precipitation: 0,
      windSpeed: 0,
      image: '', // Add an appropriate image based on condition if available
      time: new Date().toISOString()
    };
  }, []);
  
  const filteredCities = currentWeather 
    ? [convertWeatherData(currentWeather), ...allCities.filter(city => 
        city.city.toLowerCase() !== currentWeather.cityName.toLowerCase())]
    : allCities;

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto pt-24 pb-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gradient text-shadow-lg bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm">Weather</h1>
          
          <button 
            onClick={() => refreshAllWeather()}
            disabled={refreshing || localLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              refreshing || localLoading
                ? 'bg-purple-100 text-purple-300 cursor-not-allowed'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200 hover:text-purple-700'
            }`}
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span className="font-medium">{refreshing ? 'Updating...' : 'Refresh All'}</span>
          </button>
        </div>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="glass-card p-4 flex items-center">
            <Search size={20} className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search for a city..."
              className="bg-transparent w-full focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit" 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                loading || searchLoading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
              disabled={loading || searchLoading}
            >
              {loading || searchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        
        {/* Search Results */}
        {error && (
          <div className="mb-8 p-4 glass-card bg-red-50 text-red-700">
            {error}
          </div>
        )}
        
        {searchError && (
          <div className="mb-8 p-4 glass-card bg-red-50 text-red-700">
            {searchError}
          </div>
        )}
        
        {currentWeather && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gradient text-shadow mb-4 inline-block bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">Search Results for "{searchCity}"</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeatherCard
                city={currentWeather.cityName}
                country={"Unknown"}
                temperature={currentWeather.temperature || 0}
                condition={(() => {
                  // Map the conditions string from Redux to the appropriate WeatherData condition
                  let weatherCondition: 'partly-cloudy' | 'rainy' | 'snowy' | 'windy' | 'sunny' | 'night' = 'partly-cloudy';
                  
                  if (currentWeather.conditions) {
                    const condition = currentWeather.conditions.toLowerCase();
                    if (condition.includes('cloud')) {
                      weatherCondition = 'partly-cloudy';
                    } else if (condition.includes('rain')) {
                      weatherCondition = 'rainy';
                    } else if (condition.includes('snow')) {
                      weatherCondition = 'snowy';
                    } else if (condition.includes('wind')) {
                      weatherCondition = 'windy';
                    } else if (condition.includes('sun') || condition.includes('clear')) {
                      weatherCondition = 'sunny';
                    } else if (condition.includes('night')) {
                      weatherCondition = 'night';
                    }
                  }
                  
                  return weatherCondition;
                })()}
                humidity={0}
                precipitation={0}
                windSpeed={0}
                image={""}
                time={new Date().toISOString()}
              />
            </div>
          </div>
        )}
        
        {/* Cities Grid */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gradient text-shadow inline-block bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">Popular Cities</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, index) => (
                <div key={index} className="glass-card h-96 animate-pulse">
                  <div className="h-full flex flex-col p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="w-32 h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="w-24 h-5 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="flex-1 my-8">
                      <div className="w-24 h-10 bg-gray-200 rounded mb-2"></div>
                      <div className="w-32 h-5 bg-gray-200 rounded"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="p-3 bg-gray-100 rounded-lg">
                          <div className="w-full h-3 bg-gray-200 rounded mb-2"></div>
                          <div className="w-1/2 mx-auto h-4 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCities.map((city, index) => (
                <WeatherCard
                  key={index}
                  city={city.city}
                  country={city.country}
                  temperature={city.temperature}
                  condition={city.condition}
                  humidity={city.humidity}
                  precipitation={city.precipitation}
                  windSpeed={city.windSpeed}
                  image={city.image}
                  time={city.time}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <h3 className="text-xl font-medium text-gray-600">No weather data available</h3>
              <p className="text-gray-500 mt-2">Please try again later</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WeatherPage;
