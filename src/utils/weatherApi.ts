// Weather API utility
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
if (!API_KEY) {
  console.error('Weather API key is missing. Please check your .env file and ensure VITE_WEATHER_API_KEY is set.');
}
const BASE_URL = 'https://api.weatherapi.com/v1';

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  condition: 'partly-cloudy' | 'rainy' | 'snowy' | 'windy' | 'sunny' | 'night';
  humidity: number;
  precipitation: number;
  windSpeed: number;
  image?: string;
  time: string;
}

// Map WeatherAPI condition codes to our app's condition types
const mapConditionCode = (code: number, isDay: number): WeatherData['condition'] => {
  // Clear
  if (code === 1000) {
    return isDay ? 'sunny' : 'night';
  }
  // Partly cloudy, cloudy, overcast
  if (code >= 1003 && code <= 1030) {
    return 'partly-cloudy';
  }
  // Rainy conditions
  if (code >= 1063 && code <= 1201) {
    return 'rainy';
  }
  // Snow conditions
  if (code >= 1210 && code <= 1282) {
    return 'snowy';
  }
  // Default for other conditions like fog, mist, etc.
  return 'partly-cloudy';
};

// Fixed nature image for default cases (no randomization)
const defaultNatureImage = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1470';

// Weather condition specific images
const weatherConditionImages: Record<string, string> = {
  'partly-cloudy': 'https://images.unsplash.com/photo-1525490829609-d166ddb58678?q=80&w=1469',
  'rainy': 'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?q=80&w=1469',
  'snowy': 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=80&w=1508',
  'windy': 'https://images.unsplash.com/photo-1516490981167-dc990a242afe?q=80&w=1470',
  'sunny': 'https://images.unsplash.com/photo-1595586864753-777814ab8a5a?q=80&w=1470',
  'night': 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?q=80&w=1459'
};

// Get city image based on city name or use a fallback
export const getCityImage = (city: string, country: string, condition?: string): string => {
  // City-specific landmark images for popular cities
  const landmarkImages: Record<string, string> = {
    'Warangal': 'https://images.unsplash.com/photo-1627301517152-11505d731bef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Hyderabad': 'https://images.unsplash.com/photo-1563448927992-9e2401c3356a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Mumbai': 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Agra': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Jaipur': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Kolkata': 'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Bengaluru': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Los Angeles': 'https://images.unsplash.com/photo-1597982087630-ba7875a3154c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Chicago': 'https://images.unsplash.com/photo-1581373449483-37449f962b6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'San Francisco': 'https://images.unsplash.com/photo-1521464302861-ce943915d1c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Paris': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Madrid': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Dubai': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Singapore': 'https://images.unsplash.com/photo-1565967511849-76a60a516170?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Bangkok': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  };

  // Exact city match - highest priority
  if (city && landmarkImages[city]) {
    console.log(`Using landmark image for ${city}`);
    return landmarkImages[city];
  }

  // Special handling for Indian cities/states
  if (country === 'India') {
    // For cities in India that aren't directly in our landmark images
    // Check if it's a special region
    const indianRegions = {
      'Telangana': 'https://images.unsplash.com/photo-1627301517152-11505d731bef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Warangal Fort
      'Maharashtra': 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Mumbai Gateway
      'Tamil Nadu': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Chennai Temple
      'Karnataka': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Bangalore Palace
      'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // India Gate
      'Rajasthan': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Jaipur Palace
      'West Bengal': 'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Kolkata
      'Uttar Pradesh': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Taj Mahal
    };

    for (const region in indianRegions) {
      if (city.includes(region)) {
        return indianRegions[region];
      }
    }

    // If we don't have a specific image for this Indian location, 
    // return a general image for India
    return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  }

  // Country-specific fallback images
  const countryImages: Record<string, string> = {
    'USA': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'UK': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Italy': 'https://images.unsplash.com/photo-1529260830199-42c24126f198?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Japan': 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'China': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Australia': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Russia': 'https://images.unsplash.com/photo-1513326738677-b964603b136d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'Brazil': 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  };

  if (country && countryImages[country]) {
    console.log(`Using country image for ${country}`);
    return countryImages[country];
  }

  // Weather condition specific images - lowest priority
  if (condition && weatherConditionImages[condition]) {
    console.log(`Using weather image for ${condition}`);
    return weatherConditionImages[condition];
  }

  // Last resort fallback
  console.log('Using default nature image fallback');
  return defaultNatureImage;
};

export const fetchCurrentWeather = async (city: string): Promise<WeatherData> => {
  try {
    console.log('🌐 Fetching weather for location:', city);
    const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=no`);
    
    if (!response.ok) {
      console.error('❌ Weather API error:', response.status, response.statusText);
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Weather API response for city/coordinates:', city, data);
    
    const condition = mapConditionCode(data.current.condition.code, data.current.is_day);
    
    // Use proper location name from API response for image lookup
    const cityImage = getCityImage(data.location.name, data.location.country);
    console.log('🖼️ Image for', data.location.name, ':', cityImage);
    
    // Transform API response to our app's format
    const weatherData = {
      city: data.location.name,
      country: data.location.country,
      temperature: data.current.temp_c,
      condition: condition,
      humidity: data.current.humidity,
      precipitation: data.current.precip_mm,
      windSpeed: data.current.wind_kph,
      image: cityImage,
      time: data.location.localtime
    };
    
    console.log('✅ Processed weather data:', weatherData);
    return weatherData;
  } catch (error) {
    console.error('❌ Failed to fetch weather data:', error);
    throw error;
  }
};

export const fetchWeatherForecast = async (city: string) => {
  try {
    const response = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const condition = mapConditionCode(data.current.condition.code, data.current.is_day);
    
    // Transform forecast data
    const forecastData = data.forecast.forecastday.map((day: any) => ({
      day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
      condition: mapConditionCode(day.day.condition.code, 1), // Assume day for forecast
      highTemp: day.day.maxtemp_c,
      lowTemp: day.day.mintemp_c,
    }));
    
    // Extract hourly chance of rain for today
    const hourlyRain = data.forecast.forecastday[0].hour
      .filter((_: any, i: number) => i % 3 === 0)  // Every 3 hours
      .map((hour: any) => ({
        time: new Date(hour.time).toLocaleTimeString('en-US', { hour: '2-digit' }).toLowerCase(),
        chance: hour.chance_of_rain
      }));
    
    return { 
      forecast: forecastData, 
      hourlyRain,
      cityImage: getCityImage(data.location.name, data.location.country)
    };
  } catch (error) {
    console.error('Failed to fetch weather forecast:', error);
    throw error;
  }
};

export const fetchMultipleCitiesWeather = async (cities: string[]): Promise<WeatherData[]> => {
  try {
    const weatherPromises = cities.map(city => fetchCurrentWeather(city));
    return await Promise.all(weatherPromises);
  } catch (error) {
    console.error('Failed to fetch multiple cities weather:', error);
    throw error;
  }
};

// Get user's current location and fetch weather
export const fetchCurrentLocationWeather = async (): Promise<WeatherData | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    console.log('📍 Requesting user location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('✅ Got coordinates:', latitude, longitude);
          
          // Ensure coordinates are properly formatted
          const coords = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
          console.log('📍 Using coordinates string:', coords);
          
          const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${coords}&aqi=no`);
          console.log('🌐 Fetching weather from:', `${BASE_URL}/current.json?key=${API_KEY}&q=${coords}&aqi=no`);
          
          if (!response.ok) {
            console.error('❌ Weather API error:', response.status, response.statusText);
            throw new Error(`Weather API error: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('✅ Weather API response for coordinates:', data);
          
          const condition = mapConditionCode(data.current.condition.code, data.current.is_day);
          console.log('☁️ Mapped condition:', condition);
          
          // Extract image using city name from API response
          const cityImage = getCityImage(data.location.name, data.location.country);
          console.log('🖼️ City image URL:', cityImage);
          
          // Transform API response to our app's format
          const weatherData = {
            city: data.location.name,
            country: data.location.country,
            temperature: data.current.temp_c,
            condition: condition,
            humidity: data.current.humidity,
            precipitation: data.current.precip_mm,
            windSpeed: data.current.wind_kph,
            image: cityImage,
            time: data.location.localtime
          };
          
          console.log('✅ Processed weather data:', weatherData);
          resolve(weatherData);
        } catch (error) {
          console.error('❌ Failed to fetch current location weather:', error);
          resolve(null);
        }
      },
      (error) => {
        console.error('❌ Geolocation error code:', error.code, 'message:', error.message);
        resolve(null);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 30000,  // Increase from 15s to 30s for more reliability
        maximumAge: 0    // Always get fresh position
      }
    );
  });
};
