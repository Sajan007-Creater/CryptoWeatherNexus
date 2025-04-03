import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { CloudSun, CloudRain, CloudSnow, Wind, Moon, Sun, ArrowLeft } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { fetchCurrentWeather, fetchWeatherForecast, WeatherData } from '../utils/weatherApi';
import ForecastCard from '../components/ForecastCard';
import ChanceOfRain from '../components/ChanceOfRain';
import { toast } from '@/components/ui/use-toast';

type WeatherCondition = 'partly-cloudy' | 'rainy' | 'snowy' | 'windy' | 'sunny' | 'night';

const getWeatherIcon = (condition: WeatherCondition) => {
  switch (condition) {
    case 'partly-cloudy':
      return <CloudSun size={48} className="text-weather-cloud animate-float" />;
    case 'rainy':
      return <CloudRain size={48} className="text-weather-rain animate-float" />;
    case 'snowy':
      return <CloudSnow size={48} className="text-weather-snow animate-float" />;
    case 'windy':
      return <Wind size={48} className="text-weather-cloud animate-float" />;
    case 'sunny':
      return <Sun size={48} className="text-weather-sun animate-pulse-gentle" />;
    case 'night':
      return <Moon size={48} className="text-weather-night animate-float" />;
    default:
      return <CloudSun size={48} className="text-weather-cloud animate-float" />;
  }
};

const getBackgroundClass = (condition: WeatherCondition) => {
  switch (condition) {
    case 'partly-cloudy':
      return 'bg-gradient-to-br from-blue-200 to-gray-200';
    case 'rainy':
      return 'bg-gradient-to-br from-blue-700 to-blue-400';
    case 'snowy':
      return 'bg-gradient-to-br from-blue-100 to-white';
    case 'windy':
      return 'bg-gradient-to-br from-gray-300 to-gray-100';
    case 'sunny':
      return 'bg-gradient-to-br from-yellow-400 to-orange-300';
    case 'night':
      return 'bg-gradient-night';
    default:
      return 'bg-gradient-to-br from-blue-200 to-white';
  }
};

const generateHourlyData = (baseTemp: number) => {
  const hours = [];
  const now = new Date();
  now.setMinutes(0, 0, 0); // Set to current hour start
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime());
    time.setHours(time.getHours() + i);
    
    let tempVariation = Math.sin((i / 24) * Math.PI * 2) * 5;
    let temp = baseTemp + tempVariation;
    
    hours.push({
      time: time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      temperature: Math.round(temp),
      condition: (i > 18 || i < 6) ? 'night' : 
                 (i > 12 && i < 15) ? 'sunny' : 'partly-cloudy'
    });
  }
  
  return hours;
};

const CityDetail = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [rainData, setRainData] = useState<{ time: string; chance: number }[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('hourly');
  const [error, setError] = useState<string | null>(null);
  const [cityImage, setCityImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!cityId) {
        setError("City name not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const weather = await fetchCurrentWeather(cityId);
        setWeatherData(weather);

        const forecast = await fetchWeatherForecast(cityId);
        setForecastData(forecast.forecast);
        setRainData(forecast.hourlyRain);
        setCityImage(forecast.cityImage || weather.image);

        setHourlyForecast(generateHourlyData(weather.temperature));

      } catch (err) {
        console.error("Error fetching city data:", err);
        setError("Failed to load weather information for this city");
        toast({
          title: "Error loading city data",
          description: "We couldn't fetch weather information for this city",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <NavBar />
        <main className="container mx-auto pt-24 pb-12 px-4">
          <div className="flex items-center mb-8">
            <Link to="/weather" className="flex items-center text-primary-foreground hover:underline">
              <ArrowLeft size={20} className="mr-2" />
              Back to Weather
            </Link>
          </div>
          
          <div className="glass-card p-12 text-center">
            <h3 className="text-2xl font-medium text-red-600 mb-4">{error}</h3>
            <p className="text-gray-600 mb-8">Try searching for a different city</p>
            <Link to="/weather" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Return to Weather Page
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <NavBar />
      
      <main className="container mx-auto pt-24 pb-12 px-4">
        <div className="flex items-center mb-8">
          <Link to="/weather" className="flex items-center text-primary-foreground hover:underline">
            <ArrowLeft size={20} className="mr-2" />
            Back to Weather
          </Link>
        </div>
        
        {loading ? (
          <div className="space-y-6">
            <div className="glass-card p-6 animate-pulse">
              <div className="w-64 h-8 bg-gray-200 rounded mb-3"></div>
              <div className="w-32 h-6 bg-gray-200 rounded"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card p-6 animate-pulse h-96"></div>
              <div className="glass-card p-6 animate-pulse h-96"></div>
            </div>
          </div>
        ) : weatherData ? (
          <>
            <div className="glass-card p-6 mb-8 relative overflow-hidden">
              {cityImage && (
                <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={cityImage} 
                    alt={weatherData.city} 
                    className="w-full h-full object-cover opacity-20"
                  />
                </div>
              )}
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{weatherData.city}</h1>
                    <p className="text-xl text-gray-600">{weatherData.country}</p>
                  </div>
                  
                  <div className="flex items-center mt-4 md:mt-0">
                    {getWeatherIcon(weatherData.condition)}
                    <div className="ml-4">
                      <div className="flex items-end">
                        <span className="text-5xl font-bold">{Math.round(weatherData.temperature)}</span>
                        <span className="text-2xl mb-1 ml-1">°C</span>
                      </div>
                      <p className="text-gray-600 capitalize">{weatherData.condition.replace('-', ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-6">
                  <div className="flex space-x-4 mb-6">
                    <button 
                      className={`px-4 py-2 rounded-lg ${activeTab === 'hourly' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
                      onClick={() => setActiveTab('hourly')}
                    >
                      Hourly Forecast
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-lg ${activeTab === '7day' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
                      onClick={() => setActiveTab('7day')}
                    >
                      7-Day Forecast
                    </button>
                  </div>
                  
                  {activeTab === 'hourly' ? (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">24-Hour Forecast</h3>
                      <div className="overflow-x-auto pb-4">
                        <div className="inline-flex space-x-4 min-w-max">
                          {hourlyForecast.map((hour, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <span className="text-sm text-gray-600">{hour.time}</span>
                              <div className="my-2">
                                {hour.condition === 'sunny' && <Sun size={24} className="text-yellow-500" />}
                                {hour.condition === 'partly-cloudy' && <CloudSun size={24} className="text-blue-400" />}
                                {hour.condition === 'night' && <Moon size={24} className="text-indigo-600" />}
                              </div>
                              <span className="font-bold">{hour.temperature}°</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart
                          data={hourlyForecast}
                          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="temperature" stroke="#8884d8" fill="#8884d8" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Extended Forecast</h3>
                      <div className="space-y-4">
                        {forecastData.map((day, index) => (
                          <ForecastCard 
                            key={index}
                            day={day.day} 
                            condition={day.condition} 
                            highTemp={day.highTemp} 
                            lowTemp={day.lowTemp} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold mb-4">Precipitation</h3>
                  <ChanceOfRain data={rainData} />
                </div>
              </div>
              
              <div>
                <div className="glass-card p-6 sticky top-24">
                  <h3 className="text-xl font-semibold mb-6">Weather Details</h3>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Humidity</span>
                      <span className="font-semibold">{weatherData.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wind Speed</span>
                      <span className="font-semibold">{weatherData.windSpeed} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precipitation</span>
                      <span className="font-semibold">{weatherData.precipitation}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Local Time</span>
                      <span className="font-semibold">{new Date(weatherData.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 rounded-xl relative overflow-hidden">
                    <div className={`absolute inset-0 ${getBackgroundClass(weatherData.condition)} opacity-30`}></div>
                    <div className="relative z-10">
                      <h4 className="font-medium mb-1">Weather Description</h4>
                      <p className="text-sm text-gray-700">
                        {weatherData.condition === 'sunny' ? "Clear skies with abundant sunshine."
                          : weatherData.condition === 'partly-cloudy' ? "Partly cloudy with some sun breaks."
                          : weatherData.condition === 'rainy' ? "Precipitation expected with cloudy conditions."
                          : weatherData.condition === 'snowy' ? "Snow falling with cold temperatures."
                          : weatherData.condition === 'windy' ? "Strong winds expected throughout the day."
                          : "Clear night sky with calm conditions."
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h4 className="font-medium mb-2">Related Cities</h4>
                    <div className="flex flex-wrap gap-2">
                      <Link 
                        to="/weather/london" 
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        London
                      </Link>
                      <Link 
                        to="/weather/new-york" 
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        New York
                      </Link>
                      <Link 
                        to="/weather/madrid" 
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        Madrid
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Location Map</h3>
              <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
                {cityImage ? (
                  <img 
                    src={cityImage} 
                    alt={weatherData.city} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-gray-500">Map view would be displayed here</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card p-12 text-center">
            <h3 className="text-2xl font-medium text-gray-600">City not found</h3>
            <p className="text-gray-500 mt-2">Please try searching for a different city</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CityDetail;
