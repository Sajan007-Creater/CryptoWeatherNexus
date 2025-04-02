import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import WeatherCard from '../components/WeatherCard';
import CryptoCard from '../components/CryptoCard';
import NewsCard from '../components/NewsCard';
import ChanceOfRain from '../components/ChanceOfRain';
import ForecastCard from '../components/ForecastCard';
import { toast } from '@/components/ui/use-toast';
import { CloudSun, CloudRain, CloudSnow, Wind, Moon, Sun } from 'lucide-react';
import { 
  fetchCurrentWeather, 
  fetchWeatherForecast, 
  fetchMultipleCitiesWeather, 
  WeatherData 
} from '../utils/weatherApi';
import { fetchTopCryptos, CryptoData } from '../utils/cryptoApi';
import { fetchNews, NewsItem } from '../utils/newsApi';

// Import WeatherCondition type
type WeatherCondition = 'partly-cloudy' | 'rainy' | 'snowy' | 'windy' | 'sunny' | 'night';

// Weather condition images for fallbacks
const weatherConditionImages: Record<string, string> = {
  'partly-cloudy': 'https://images.unsplash.com/photo-1525490829609-d166ddb58678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'rainy': 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'snowy': 'https://images.unsplash.com/photo-1547754980-3df97fed72a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'windy': 'https://images.unsplash.com/photo-1505672678657-cc7037095e60?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'sunny': 'https://images.unsplash.com/photo-1599828324001-ecc7d9b2d738?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'night': 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
};

// Default nature image for when all else fails
const defaultNatureImage = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

// Collection of random placeholder images for the question mark
const randomPlaceholderImages = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517056338492-2ab23dcb6b37?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1630839437035-dac17da580d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
];

const Dashboard = () => {
  // State for all data
  const [currentLocation, setCurrentLocation] = useState<{
    city: string;
    country: string;
    loading: boolean;
    error: string | null;
  }>({
    city: 'Los Angeles',
    country: 'USA',
    loading: false,
    error: null
  });

  const [localWeather, setLocalWeather] = useState<WeatherData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [cryptoLoading, setCryptoLoading] = useState(true);
  
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const [rainData, setRainData] = useState<{ time: string; chance: number }[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  
  // State for recently viewed cities
  const [recentCities, setRecentCities] = useState<{ name: string; country: string }[]>([]);
  
  // State for current time
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // State for random placeholder image
  const [placeholderImage, setPlaceholderImage] = useState('');

  // Function to get a random placeholder image
  const getRandomPlaceholderImage = () => {
    const randomIndex = Math.floor(Math.random() * randomPlaceholderImages.length);
    return randomPlaceholderImages[randomIndex];
  };

  // Use effect to initialize the app and handle location detection
  useEffect(() => {
    // Set initial random placeholder image for question mark fallbacks
    setPlaceholderImage(getRandomPlaceholderImage());
    
    // Function to handle initial load with better error handling
    const initializeApp = async () => {
      console.log("🚀 Initializing app");
      
      try {
        // Call the location detection function directly on startup
        // This will check permissions and start geolocation immediately
        const savedLocationData = localStorage.getItem('weatherLocation');
        
        if (savedLocationData) {
          try {
            // Try to use saved location data first
            const { city, country } = JSON.parse(savedLocationData);
            console.log("📍 Using saved location:", city, country);
            
            // Load saved location weather data
            await getWeatherForCity(city, country);
          } catch (err) {
            console.error("Error parsing saved location:", err);
            // If saved data is corrupted, get fresh location
            getCurrentLocationData(false);
          }
        } else {
          // No saved data, get fresh location
          getCurrentLocationData(false);
        }
        
        // Fetch other data (crypto, news, and cities) in parallel
        try {
          // Fetch crypto data
          const cryptos = await fetchTopCryptos();
          setCryptoData(cryptos);
          setCryptoLoading(false);
          
          // Fetch news data
          const news = await fetchNews();
          setNewsData(news);
          setNewsLoading(false);
          
          // Fetch weather data for other cities
          const cities = ['New York', 'London', 'Tokyo'];
          const cityWeather = await fetchMultipleCitiesWeather(cities);
          setWeatherData(cityWeather);
          setWeatherLoading(false);
        } catch (error) {
          console.error("Error fetching additional data:", error);
        }
      } catch (error) {
        console.error("Failed during app initialization:", error);
      }
    };
    
    // Set up interval for time updates
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Initialize the app
    initializeApp();
    
    // Clean up interval on unmount
    return () => clearInterval(timeInterval);
  }, []);
  
  // Effect to save location when it changes
  useEffect(() => {
    if (currentLocation.city && currentLocation.country && !currentLocation.loading && !currentLocation.error) {
      // Save successful location data to localStorage
      localStorage.setItem('weatherLocation', JSON.stringify({
        city: currentLocation.city,
        country: currentLocation.country
      }));
    }
  }, [currentLocation]);

  // Function to get fallback images for current location based on condition and country
  const getLocationFallbackImage = (condition: string, country: string): string => {
    // Weather condition specific images - highest priority
    const weatherImages: Record<string, string> = {
      'sunny': 'https://images.unsplash.com/photo-1598022124758-65b43e8bc4c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'partly-cloudy': 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'cloudy': 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'rainy': 'https://images.unsplash.com/photo-1520609798518-96c5681f6e6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'snowy': 'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'windy': 'https://images.unsplash.com/photo-1506815444479-bfdb1e96c566?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'night': 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    };
    
    if (condition && weatherImages[condition]) {
      console.log(`Using weather fallback image for ${condition}`);
      return weatherImages[condition];
    }
    
    // Secondary set of images as additional fallbacks
    const secondaryWeatherImages: Record<string, string> = {
      'sunny': 'https://images.unsplash.com/photo-1525490829609-d166ddb58678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'partly-cloudy': 'https://images.unsplash.com/photo-1525490829609-d166ddb58678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'cloudy': 'https://images.unsplash.com/photo-1611928482473-7b27d24eab80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'rainy': 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'snowy': 'https://images.unsplash.com/photo-1547754980-3df97fed72a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'windy': 'https://images.unsplash.com/photo-1505672678657-cc7037095e60?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'night': 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    };
    
    if (condition && secondaryWeatherImages[condition]) {
      console.log(`Using secondary weather fallback image for ${condition}`);
      return secondaryWeatherImages[condition];
    }
    
    // Last resort - nice nature image that should always work
    return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  };

  // Function to determine the landmark caption based on city and country
  const getLandmarkCaption = (city: string, country: string): string => {
    const cityLower = city.toLowerCase().replace(/\s*\(current\)/i, '');
    
    // City-specific landmarks
    const landmarkCaptions: Record<string, string> = {
      'warangal': 'Kakatiya Kala Thoranam (Warangal Fort) - Historic Gateway',
      'hyderabad': 'Charminar - The Four Minarets',
      'delhi': 'India Gate - War Memorial',
      'mumbai': 'Gateway of India - Historic Arch Monument',
      'agra': 'Taj Mahal - Crown of Palaces',
      'jaipur': 'Hawa Mahal - Palace of Winds',
      'kolkata': 'Victoria Memorial - Historic Monument',
      'bengaluru': 'Vidhana Soudha - Seat of Legislature',
      'chennai': 'Marina Beach - Iconic Coastline',
      'new york': 'Statue of Liberty - Symbol of Freedom',
      'los angeles': 'Hollywood Sign - Entertainment Icon',
      'chicago': 'Cloud Gate (The Bean) - Public Sculpture',
      'san francisco': 'Golden Gate Bridge - Engineering Marvel',
      'paris': 'Eiffel Tower - Iron Lady',
      'london': 'London Eye & Big Ben - Historic Landmarks',
      'rome': 'Colosseum - Ancient Amphitheatre',
      'tokyo': 'Tokyo Tower - Communications Tower',
      'sydney': 'Sydney Opera House - Performing Arts Center',
      'dubai': 'Burj Khalifa - World\'s Tallest Building',
    };
    
    // Check for a direct match
    for (const [landmark, caption] of Object.entries(landmarkCaptions)) {
      if (cityLower.includes(landmark)) {
        return caption;
      }
    }
    
    // Generic country captions if no city match
    const countryCaptions: Record<string, string> = {
      'india': 'India Gate - New Delhi',
      'united states': 'NYC Skyline - Manhattan',
      'united kingdom': 'London Bridge - Thames River',
      'australia': 'Sydney Opera House - Port Jackson',
      'france': 'Eiffel Tower - Paris',
      'japan': 'Tokyo Tower - Minato City',
      'italy': 'Colosseum - Rome',
    };
    
    // Return country caption if available
    if (country && countryCaptions[country.toLowerCase()]) {
      return countryCaptions[country.toLowerCase()];
    }
    
    // Default caption
    return `${city}, ${country} - Scenic View`;
  };

  // Helper function to fetch weather for a specific location
  const fetchWeatherForLocation = async (city: string, country: string) => {
    try {
      const weatherData = await fetchCurrentWeather(`${city},${country}`);
      if (weatherData) {
        setLocalWeather(weatherData);
        
        // Get forecast data
        const forecastData = await fetchWeatherForecast(`${city},${country}`);
        setRainData(forecastData.hourlyRain || []);
        setForecastData(forecastData.forecast || []);
      }
    } catch (error) {
      console.error("Error fetching weather for location:", error);
    }
  };

  // Helper function to fetch rain data
  const fetchRainData = async (city: string, country: string) => {
    try {
      const forecastData = await fetchWeatherForecast(`${city},${country}`);
      setRainData(forecastData.hourlyRain || []);
    } catch (error) {
      console.error("Error fetching rain data:", error);
    }
  };

  // Function to get weather for a specific city
  const getWeatherForCity = async (city: string, country: string = "US") => {
    try {
      setLocalWeather(null);
      setRainData([]);
      setForecastData([]);
      
      // Set loading state
      setCurrentLocation(prev => ({
        ...prev,
        city,
        country,
        loading: true,
        error: null
      }));

      // Fetch weather data for the specified city
      const weatherData = await fetchCurrentWeather(`${city},${country}`);
      if (weatherData) {
        setLocalWeather(weatherData);
        
        // Get forecast data
        const forecastData = await fetchWeatherForecast(`${city},${country}`);
        setRainData(forecastData.hourlyRain || []);
        setForecastData(forecastData.forecast || []);
        
        // Update location state
        setCurrentLocation(prev => ({
          ...prev,
          loading: false,
          error: null
        }));
        
        // Add to recently viewed if not already there
        const found = recentCities.some(item => 
          item.name === city && item.country === country);
        
        if (!found) {
          setRecentCities(prev => [
            { name: city, country },
            ...prev.slice(0, 4) // Keep only 5 cities in history
          ]);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
      setCurrentLocation(prev => ({
        ...prev,
        loading: false,
        error: `Failed to get weather for ${city}`
      }));
      return false;
    }
  };

  // Get current location data
  const getCurrentLocationData = async (isRefresh = false) => {
    console.log("🌍 Getting current location data, isRefresh:", isRefresh);
    
    try {
      // First check if permission was previously denied before attempting geolocation
      const permissionStatus = await checkGeolocationPermission();
      console.log("📍 Permission status:", permissionStatus);
      
      // Set loading state
      setCurrentLocation(prev => ({
        ...prev,
        loading: true,
        error: null
      }));
      
      // Load Los Angeles data first while we wait for geolocation
      if (!isRefresh) {
        await getWeatherForCity("Los Angeles", "US");
      }
      
      // Check browser support for geolocation
      if (!navigator.geolocation) {
        console.error("❌ Geolocation is not supported by this browser");
        
        // Set location to Los Angeles with appropriate error
        setCurrentLocation(prev => ({
          ...prev,
          loading: false,
          error: "Geolocation is not supported by your browser. Showing Los Angeles weather."
        }));
        
        return;
      }
      
      // Use different approaches based on permission status
      if (permissionStatus === 'granted') {
        // Permission already granted - use simple approach without timeout
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          const options = {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
          };
          
          console.log("🔍 Permission already granted, requesting position...");
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
        
        console.log("✅ Position received:", position.coords);
        
        const { latitude, longitude } = position.coords;
        console.log(`📍 Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        
        // Fetch weather for the received coordinates
        const weatherData = await fetchCurrentWeather(`${latitude},${longitude}`);
        console.log("🌤️ Weather data received:", weatherData);
        
        if (weatherData) {
          setLocalWeather(weatherData);
          if (weatherData.city && weatherData.country) {
            setCurrentLocation({
              city: weatherData.city,
              country: weatherData.country,
              loading: false,
              error: null
            });
            
            // Get additional weather data
            const forecastData = await fetchWeatherForecast(`${weatherData.city},${weatherData.country}`);
            setRainData(forecastData.hourlyRain || []);
            setForecastData(forecastData.forecast || []);
            
            if (isRefresh) {
              toast({
                title: "Location updated",
                description: `Weather for ${weatherData.city}, ${weatherData.country}`
              });
            }
            
            // Add to recently viewed if not already there
            const found = recentCities.some(city => 
              city.name === weatherData.city && city.country === weatherData.country);
            
            if (!found) {
              setRecentCities(prev => [
                { name: weatherData.city, country: weatherData.country },
                ...prev.slice(0, 4) // Keep only 5 cities in history
              ]);
            }
          }
        }
      } else {
        // Permission not yet granted - use Promise.race with timeout
        const positionPromise = new Promise<GeolocationPosition>((resolve, reject) => {
          const options = {
            enableHighAccuracy: true,
            timeout: 30000,  // 30 second timeout
            maximumAge: 0    // Always get fresh position
          };
          
          console.log("🔍 Requesting position with options:", options);
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
        
        // Create a timeout promise slightly longer than the geolocation timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject({
              code: 3, 
              message: "Geolocation request timed out"
            });
          }, 32000);
        });
        
        // Race the promises
        const position = await Promise.race([positionPromise, timeoutPromise]) as GeolocationPosition;
        
        console.log("✅ Position received:", position.coords);
        
        const { latitude, longitude } = position.coords;
        console.log(`📍 Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        
        // Fetch weather for the received coordinates
        const weatherData = await fetchCurrentWeather(`${latitude},${longitude}`);
        console.log("🌤️ Weather data received:", weatherData);
        
        if (weatherData) {
          setLocalWeather(weatherData);
          if (weatherData.city && weatherData.country) {
            setCurrentLocation({
              city: weatherData.city,
              country: weatherData.country,
              loading: false,
              error: null
            });
            
            // Get additional weather data
            const forecastData = await fetchWeatherForecast(`${weatherData.city},${weatherData.country}`);
            setRainData(forecastData.hourlyRain || []);
            setForecastData(forecastData.forecast || []);
            
            if (isRefresh) {
              toast({
                title: "Location updated",
                description: `Weather for ${weatherData.city}, ${weatherData.country}`
              });
            }
            
            // Add to recently viewed if not already there
            const found = recentCities.some(city => 
              city.name === weatherData.city && city.country === weatherData.country);
            
            if (!found) {
              setRecentCities(prev => [
                { name: weatherData.city, country: weatherData.country },
                ...prev.slice(0, 4) // Keep only 5 cities in history
              ]);
            }
          }
        } else {
          throw new Error("No weather data received from API");
        }
      }
    } catch (error: any) {
      console.error("❌ Geolocation error:", error);
      
      let errorMessage = "Could not determine your location. Showing Los Angeles weather.";
      
      if (error.code === 1) {
        errorMessage = "Location access denied. Please grant location permissions in your browser settings and retry.";
      } else if (error.code === 2) {
        errorMessage = "Location unavailable. Showing Los Angeles weather instead.";
      } else if (error.code === 3) {
        errorMessage = "Location request timed out. Showing Los Angeles weather instead.";
      }
      
      // Just set the error message but keep the Los Angeles data
      setCurrentLocation(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      if (isRefresh) {
        toast({
          title: "Location error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };

  // Helper function to check permission status
  const checkGeolocationPermission = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.permissions || !navigator.permissions.query) {
        // Browser doesn't support permission API
        resolve('prompt');
        return;
      }
      
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then(result => {
          console.log("Permission state:", result.state);
          resolve(result.state);
        })
        .catch(error => {
          console.error("Error checking permission:", error);
          resolve('prompt');
        });
    });
  };

  const refreshCurrentLocation = () => {
    console.log("🔄 Refreshing location data...");
    
    // Clear all current data to show loading state
    setLocalWeather(null);
    setRainData([]);
    setForecastData([]);
    
    // Reset location state
    setCurrentLocation({
      city: '',
      country: '',
      loading: true,
      error: null
    });
    
    // Show toast immediately to provide feedback
    toast({
      title: "Refreshing location",
      description: "Detecting your current location...",
    });
    
    // Use a slight timeout to ensure state is fully updated
    setTimeout(() => {
      // Try to get Los Angeles data first while geolocation happens in background
      getWeatherForCity("Los Angeles", "US").then(() => {
        // After getting LA data, try to get the actual geolocation
        getCurrentLocationData(true).catch(err => {
          console.error("Failed to refresh location:", err);
          toast({
            title: "Error",
            description: "Failed to refresh your location",
            variant: "destructive"
          });
        });
      });
    }, 100);
  };

  // Fetch weather data for multiple cities
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setWeatherLoading(true);
        const cities = ['New York', 'London', 'Tokyo'];
        const data = await fetchMultipleCitiesWeather(cities);
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        toast({
          title: "Weather data error",
          description: "Failed to fetch weather data",
          variant: "destructive"
        });
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  // Fetch crypto data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setCryptoLoading(true);
        const data = await fetchTopCryptos(5); // Get top 5 cryptos for dashboard
        setCryptoData(data);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        toast({
          title: "Crypto data error",
          description: "Failed to fetch cryptocurrency data",
          variant: "destructive"
        });
      } finally {
        setCryptoLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  // Fetch news data
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setNewsLoading(true);
        const data = await fetchNews(5); // Get top 5 news items
        setNewsData(data);
      } catch (error) {
        console.error('Error fetching news data:', error);
        toast({
          title: "News data error",
          description: "Failed to fetch news data",
          variant: "destructive"
        });
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  const fetchDefaultLocationData = async (city: string) => {
    try {
      const weather = await fetchCurrentWeather(city);
      
      if (!weather) {
        throw new Error('No weather data returned');
      }
      
      setLocalWeather(weather);
      
      // Update the current location state to show we're using the default location
      setCurrentLocation({
        city: city,
        country: weather.country,
        loading: false,
        error: null
      });
      
      const forecastData = await fetchWeatherForecast(city);
      setRainData(forecastData.hourlyRain);
      setForecastData(forecastData.forecast);
      
    } catch (error) {
      console.error('Error fetching default location data:', error);
      
      // Set the error state but don't clear the existing weather data if any
      setCurrentLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch default location data. Please try again later.'
      }));
      
      toast({
        title: "Default location error",
        description: "Could not load weather for default location",
        variant: "destructive"
      });
    }
  };

  // Function to refresh a single cryptocurrency
  const refreshSingleCrypto = async (cryptoId: string) => {
    try {
      // Find the index of the crypto to refresh
      const index = cryptoData.findIndex(crypto => crypto.id === cryptoId);
      if (index === -1) return;

      // Fetch just this specific cryptocurrency
      const updatedCrypto = await fetchTopCryptos(1, cryptoId);
      if (updatedCrypto && updatedCrypto.length > 0) {
        // Create a new array with the updated crypto
        const updatedData = [...cryptoData];
        updatedData[index] = updatedCrypto[0];
        setCryptoData(updatedData);
        
        // Show success toast
        toast({
          title: "Updated",
          description: `${updatedCrypto[0].name} rate refreshed`,
        });
      }
    } catch (error) {
      console.error(`Failed to refresh crypto ${cryptoId}:`, error);
      toast({
        title: "Error",
        description: "Failed to refresh cryptocurrency data",
        variant: "destructive"
      });
    }
  };

  const filteredCryptoData = cryptoData.slice(0, 4);
  const filteredNewsData = newsData.slice(0, 3);

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="pt-24 pb-12 px-4">
        <h1 className="text-4xl font-bold text-gradient mb-8">Weather & Crypto Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 space-y-6">
            {/* Current Location Card */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gradient">Current Location</h2>
                  <h3 className="text-2xl font-bold text-shadow-sm">
                    {currentLocation.loading 
                      ? 'Detecting...' 
                      : currentLocation.error 
                        ? 'Location unavailable' 
                        : `${currentLocation.city}, ${currentLocation.country}`}
                  </h3>
                </div>
                <button 
                  onClick={refreshCurrentLocation}
                  disabled={currentLocation.loading}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 ${
                    currentLocation.loading 
                      ? 'bg-purple-200 cursor-not-allowed text-purple-400' 
                      : currentLocation.error 
                        ? 'bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700' 
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800'
                  }`}
                  title={currentLocation.loading 
                    ? "Refreshing location..." 
                    : currentLocation.error 
                      ? "Retry location detection" 
                      : "Refresh location"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                    className={`${currentLocation.loading ? 'animate-spin' : ''}`}>
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M8 16H3v5"></path>
                  </svg>
                  <span className="text-sm font-medium">
                    {currentLocation.loading 
                      ? "Detecting..." 
                      : currentLocation.error 
                        ? "Retry Location" 
                        : "Update Location"}
                  </span>
                </button>
              </div>
              
              <div className="relative overflow-hidden rounded-xl h-64">
                {localWeather ? (
                  <>
                    <img 
                      src={localWeather?.image || placeholderImage || getLocationFallbackImage(localWeather?.condition || 'sunny', currentLocation.country || 'US')}
                      alt={`${currentLocation.city || 'Weather'} - ${currentLocation.country || ''}`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onLoad={() => {
                        console.log("Image loaded successfully:", 
                          localWeather?.image || placeholderImage || getLocationFallbackImage(localWeather?.condition || 'sunny', currentLocation.country || 'US'));
                      }}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const imgElement = e.currentTarget;
                        console.error("Image failed to load:", imgElement.src);
                          
                        // First try random placeholder
                        if (placeholderImage) {
                          console.log("Using random placeholder image");
                          imgElement.src = placeholderImage;
                        } else {
                          // Then try using weather condition fallback
                          const fallbackImg = getLocationFallbackImage(localWeather?.condition || 'sunny', currentLocation.country || 'US');
                          console.log("Using weather fallback image:", fallbackImg);
                          imgElement.src = fallbackImg;
                        }
                        
                        // If first fallback also fails, use default nature image
                        imgElement.onerror = () => {
                          console.error("Fallback image also failed, using default nature image");
                          imgElement.src = defaultNatureImage;
                          imgElement.onerror = null; // Prevent infinite recursion
                        };
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent p-6 flex items-end">
                      <div className="flex items-center gap-4 backdrop-blur-sm bg-black/20 p-3 rounded-lg shadow-lg">
                        {localWeather.condition === 'partly-cloudy' && <CloudSun size={48} className="text-white drop-shadow-lg" />}
                        {localWeather.condition === 'rainy' && <CloudRain size={48} className="text-white drop-shadow-lg" />}
                        {localWeather.condition === 'snowy' && <CloudSnow size={48} className="text-white drop-shadow-lg" />}
                        {localWeather.condition === 'windy' && <Wind size={48} className="text-white drop-shadow-lg" />}
                        {localWeather.condition === 'sunny' && <Sun size={48} className="text-white drop-shadow-lg" />}
                        {localWeather.condition === 'night' && <Moon size={48} className="text-white drop-shadow-lg" />}
                        <div>
                          <div className="flex items-end">
                            <h2 className="text-6xl font-bold text-white drop-shadow-lg text-shadow-lg">{Math.round(localWeather.temperature)}</h2>
                            <span className="text-3xl text-white ml-1 drop-shadow-lg">°C</span>
                          </div>
                          <p className="text-xl text-white/90 drop-shadow-md capitalize">
                            {localWeather.condition.replace('-', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Landmark caption - show even if there's an error but we have weather data */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-3">
                      <p className="text-white text-xs font-medium text-shadow">
                        {getLandmarkCaption(currentLocation.city || 'Los Angeles', currentLocation.country || 'US')}
                      </p>
                    </div>
                    
                    {/* Show error overlay message when there's an error but we have weather data */}
                    {currentLocation.error && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white max-w-md px-6 py-4 bg-black/50 backdrop-blur-sm rounded-xl">
                          <p className="text-lg font-medium mb-1">{currentLocation.error}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Loading state or error with no weather data
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    {currentLocation.loading ? (
                      <div className="flex flex-col items-center text-white">
                        <svg className="animate-spin h-10 w-10 text-purple-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-lg font-medium">Loading weather data...</span>
                      </div>
                    ) : (
                      <div className="text-center text-white max-w-md px-6 py-8 bg-black/20 backdrop-blur-sm rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                          className="mx-auto mb-4 opacity-70">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p className="text-lg font-medium mb-2">{currentLocation.error || "Error loading weather data"}</p>
                        <p className="text-sm mt-2 opacity-80 mb-4">Weather data for Los Angeles is displayed instead</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {localWeather ? (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Today's Highlights</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass p-4 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-1">Precipitation</p>
                      <p className="text-xl font-bold">{localWeather.precipitation}%</p>
                    </div>
                    <div className="glass p-4 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-1">Humidity</p>
                      <p className="text-xl font-bold">{localWeather.humidity}%</p>
                    </div>
                    <div className="glass p-4 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-1">Wind</p>
                      <p className="text-xl font-bold">{localWeather.windSpeed} km/h</p>
                    </div>
                    <div className="glass p-4 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-1">Local Time</p>
                      <p className="text-xl font-bold">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Today's Highlights</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="glass p-4 rounded-xl text-center">
                        <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-1/2 h-6 bg-gray-200 rounded animate-pulse mx-auto"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Weather Chart */}
            <div className="glass-card p-6">
              <div className="flex items-center space-x-4 mb-6">
                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium">Today</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Week</button>
              </div>
              
              <div className="h-64 w-full">
                {/* We'd use a real chart library here, but for now let's create a simple mockup */}
                <div className="relative h-full flex items-end">
                  <div className="absolute inset-0 flex items-end justify-between px-6 pb-6">
                    <div className="h-1/3 border-l-2 border-purple-300 pl-2 flex flex-col justify-end">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mb-1"></div>
                      <p className="text-xs text-gray-600">6 am</p>
                    </div>
                    <div className="h-1/2 border-l-2 border-purple-300 pl-2 flex flex-col justify-end">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mb-1"></div>
                      <p className="text-xs text-gray-600">9 am</p>
                    </div>
                    <div className="h-2/3 border-l-2 border-purple-300 pl-2 flex flex-col justify-end">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mb-1"></div>
                      <p className="text-xs text-gray-600">12 pm</p>
                    </div>
                    <div className="h-4/5 border-l-2 border-purple-300 pl-2 flex flex-col justify-end">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mb-1"></div>
                      <p className="text-xs text-gray-600">3 pm</p>
                    </div>
                    <div className="h-3/5 border-l-2 border-purple-300 pl-2 flex flex-col justify-end">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mb-1"></div>
                      <p className="text-xs text-gray-600">6 pm</p>
                    </div>
                    <div className="h-1/2 border-l-2 border-purple-300 pl-2 flex flex-col justify-end">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mb-1"></div>
                      <p className="text-xs text-gray-600">9 pm</p>
                    </div>
                    <div className="h-2/5 border-l-2 border-purple-300 pl-2 flex flex-col justify-end">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mb-1"></div>
                      <p className="text-xs text-gray-600">12 am</p>
                    </div>
                    <div className="h-1/3 border-l-2 border-purple-300 pl-2 flex flex-col justify-end">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mb-1"></div>
                      <p className="text-xs text-gray-600">3 am</p>
                    </div>
                  </div>
                  
                  <div className="absolute inset-x-0 bottom-12 h-px bg-gray-200"></div>
                  
                  <svg className="w-full h-1/2 absolute bottom-12" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <path
                      d="M0,50 L12.5,40 L25,25 L37.5,15 L50,5 L62.5,15 L75,25 L87.5,40 L100,50"
                      fill="none"
                      stroke="rgba(168, 85, 247, 0.5)"
                      strokeWidth="3"
                    />
                    <path
                      d="M0,50 L12.5,40 L25,25 L37.5,15 L50,5 L62.5,15 L75,25 L87.5,40 L100,50"
                      fill="url(#gradient)"
                      strokeWidth="0"
                      opacity="0.3"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(168, 85, 247, 0.7)" />
                        <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Chance of Rain */}
            <ChanceOfRain data={rainData.length ? rainData : [
              { time: '09 am', chance: 30 },
              { time: '12 pm', chance: 75 },
              { time: '03 pm', chance: 60 },
              { time: '06 pm', chance: 95 },
              { time: '09 pm', chance: 60 },
              { time: '12 am', chance: 25 },
              { time: '03 am', chance: 15 },
            ]} />
            
            {/* 3 Days Forecast */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-6">3 Days Forecast</h3>
              <div className="space-y-4">
                {forecastData.length > 0 ? (
                  forecastData.map((day, index) => (
                    <ForecastCard 
                      key={index}
                      day={day.day} 
                      condition={day.condition} 
                      highTemp={day.highTemp} 
                      lowTemp={day.lowTemp} 
                    />
                  ))
                ) : (
                  <>
                    <ForecastCard 
                      day="Tuesday" 
                      condition="partly-cloudy" 
                      highTemp={26} 
                      lowTemp={11} 
                    />
                    <ForecastCard 
                      day="Wednesday" 
                      condition="rainy" 
                      highTemp={26} 
                      lowTemp={11} 
                    />
                    <ForecastCard 
                      day="Thursday" 
                      condition="snowy" 
                      highTemp={26} 
                      lowTemp={11} 
                    />
                  </>
                )}
              </div>
            </div>
            
            {/* Add City Button */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-3xl text-purple-600">+</span>
              </div>
              <h3 className="text-lg font-medium">Add City</h3>
              <p className="text-sm text-gray-600 mt-2">Add a new city to track weather</p>
            </div>
          </div>
        </div>
        
        {/* Weather Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Weather</h2>
            <Link to="/weather" className="text-primary-foreground hover:underline">View all</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weatherLoading ? (
              // Loading placeholders
              Array(3).fill(0).map((_, index) => (
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
              ))
            ) : weatherData.length > 0 ? (
              weatherData.map((city, index) => (
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
              ))
            ) : (
              <div className="col-span-3 text-center py-12 glass-card">
                <h3 className="text-xl font-medium text-gray-600">Failed to load weather data</h3>
                <p className="text-gray-500 mt-2">Please try again later</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Crypto Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Cryptocurrency</h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setCryptoLoading(true);
                  toast({
                    title: "Refreshing crypto data",
                    description: "Fetching latest cryptocurrency rates",
                  });
                  fetchTopCryptos(5)
                    .then(data => {
                      setCryptoData(data);
                      toast({
                        title: "Updated",
                        description: "Cryptocurrency rates refreshed",
                      });
                    })
                    .catch(error => {
                      console.error('Failed to refresh crypto data:', error);
                      toast({
                        title: "Error",
                        description: "Failed to refresh cryptocurrency data",
                        variant: "destructive"
                      });
                    })
                    .finally(() => {
                      setCryptoLoading(false);
                    });
                }}
                disabled={cryptoLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 text-sm ${
                  cryptoLoading 
                    ? 'bg-purple-200 cursor-not-allowed text-purple-400' 
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800'
                }`}
                title="Refresh cryptocurrency rates"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                  className={`${cryptoLoading ? 'animate-spin' : ''}`}>
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M8 16H3v5"></path>
                </svg>
                <span>{cryptoLoading ? "Updating..." : "Refresh Rates"}</span>
              </button>
              <Link to="/crypto" className="text-primary-foreground hover:underline">View all</Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {cryptoLoading ? (
              // Loading placeholders
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="glass-card h-52 animate-pulse">
                  <div className="h-full flex flex-col p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="w-24 h-5 bg-gray-200 rounded mb-1"></div>
                          <div className="w-12 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="w-16 h-6 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="mt-6">
                      <div className="w-32 h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="mt-4">
                      <div className="h-1 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : cryptoData.length > 0 ? (
              cryptoData.map((crypto, index) => (
                <CryptoCard
                  key={index}
                  id={crypto.id}
                  name={crypto.name}
                  symbol={crypto.symbol}
                  price={crypto.price}
                  changePercentage={crypto.changePercentage}
                  marketCap={crypto.marketCap}
                  image={crypto.image}
                  onRefresh={refreshSingleCrypto}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 glass-card">
                <h3 className="text-xl font-medium text-gray-600">Failed to load cryptocurrency data</h3>
                <p className="text-gray-500 mt-2">Please try again later</p>
              </div>
            )}
          </div>
        </section>
        
        {/* News Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Latest News</h2>
            <Link to="/news" className="text-primary-foreground hover:underline">View all</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {newsLoading ? (
              // Loading placeholders
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="glass-card animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-5">
                    <div className="w-full h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="w-4/5 h-5 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between mt-4">
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : newsData.length > 0 ? (
              newsData.map((news, index) => (
                <NewsCard
                  key={index}
                  title={news.title}
                  source={news.source}
                  date={news.date}
                  url={news.url}
                  image={news.image}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 glass-card">
                <h3 className="text-xl font-medium text-gray-600">Failed to load news data</h3>
                <p className="text-gray-500 mt-2">Please try again later</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
