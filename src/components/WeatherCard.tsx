import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CloudSun, CloudRain, CloudSnow, Wind, Moon, Sun } from 'lucide-react';
import FavoriteButton from './FavoriteButton';

type WeatherCondition = 'partly-cloudy' | 'rainy' | 'snowy' | 'windy' | 'sunny' | 'night';

interface WeatherCardProps {
  city: string;
  country: string;
  temperature: number;
  condition: WeatherCondition;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  image?: string;
  time?: string;
  className?: string;
  is3D?: boolean;
}

const WeatherCard = ({
  city,
  country,
  temperature,
  condition,
  humidity,
  precipitation,
  windSpeed,
  image,
  time,
  className = '',
  is3D = true,
}: WeatherCardProps) => {
  const [effects, setEffects] = useState<React.ReactNode[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getWeatherIcon = () => {
    try {
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
          // Fallback to partly-cloudy icon for unknown conditions
          return <CloudSun size={48} className="text-weather-cloud animate-float" />;
      }
    } catch (error) {
      console.error("Error rendering weather icon:", error);
      // Return a safe fallback icon if there's any error
      return <CloudSun size={48} className="text-weather-cloud animate-float" />;
    }
  };

  const getBackgroundEffects = () => {
    if (!is3D) return [];
    
    const elements: React.ReactNode[] = [];
    
    switch (condition) {
      case 'rainy':
        for (let i = 0; i < 20; i++) {
          elements.push(
            <div
              key={`rain-${i}`}
              className="rain-effect"
              style={{
                left: `${Math.random() * 100}%`,
                height: `${Math.random() * 20 + 10}px`,
                opacity: Math.random() * 0.7 + 0.3,
                animationDelay: `${Math.random() * 1.5}s`,
              }}
            />
          );
        }
        break;
      case 'snowy':
        for (let i = 0; i < 20; i++) {
          elements.push(
            <div
              key={`snow-${i}`}
              className="snow-effect"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          );
        }
        break;
      case 'partly-cloudy':
        for (let i = 0; i < 3; i++) {
          elements.push(
            <div
              key={`cloud-${i}`}
              className="cloud-effect"
              style={{
                width: `${Math.random() * 60 + 40}px`,
                height: `${Math.random() * 40 + 20}px`,
                left: `${Math.random() * 80}%`,
                top: `${Math.random() * 40 + 20}%`,
                opacity: Math.random() * 0.3 + 0.1,
              }}
            />
          );
        }
        break;
      case 'sunny':
        elements.push(
          <div
            key="sun-effect"
            className="sun-effect"
            style={{
              width: '120px',
              height: '120px',
              left: '10%',
              top: '10%',
            }}
          />
        );
        break;
    }
    
    return elements;
  };

  useEffect(() => {
    setEffects(getBackgroundEffects());
  }, [condition]);

  const getBackgroundClass = () => {
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

  const handleImageError = () => {
    setImageError(true);
  };

  const getFallbackImage = () => {
    // City-specific placeholder for when the main image fails
    const cityLower = city.toLowerCase();
    
    // Define reliable city images
    const cityImageMap: Record<string, string> = {
      'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1470',
      'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1470',
      'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1473',
      'tokyo': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1374',
      'sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1470',
      'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1470',
      'madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1470',
      'singapore': 'https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=1471',
      'berlin': 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?q=80&w=1470',
      'los angeles': 'https://images.unsplash.com/photo-1544413660-299165566b1d?q=80&w=1470'
    };
    
    // If we have a predefined image for this city, use it
    if (cityImageMap[cityLower]) {
      return cityImageMap[cityLower];
    }
    
    if (cityLower.includes('current')) {
      // Static nature images for current location (no random selection)
      return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1470';
    } else {
      // Use a weather-condition related image for cities without specific images
      const weatherConditionImages: Record<string, string> = {
        'partly-cloudy': 'https://images.unsplash.com/photo-1525490829609-d166ddb58678?q=80&w=1469',
        'rainy': 'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?q=80&w=1469',
        'snowy': 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=80&w=1508',
        'windy': 'https://images.unsplash.com/photo-1516490981167-dc990a242afe?q=80&w=1470',
        'sunny': 'https://images.unsplash.com/photo-1595586864753-777814ab8a5a?q=80&w=1470',
        'night': 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?q=80&w=1459'
      };
      
      return weatherConditionImages[condition] || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1470';
    }
  };

  return (
    <Link to={`/weather/${city.toLowerCase().replace(/\s+\(current\)/i, '')}`}>
      <div className={`glass-card overflow-hidden ${is3D ? 'card-3d' : ''} ${className}`}>
        <div className={`weather-background ${getBackgroundClass()} opacity-30`}>
          {effects}
        </div>
        
        {image && !imageError ? (
          <div className="absolute inset-0 w-full h-full -z-5">
            <img 
              src={image} 
              alt={city} 
              className="w-full h-full object-cover rounded-2xl opacity-40"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full -z-5">
            <img 
              src={getFallbackImage()} 
              alt={city} 
              className="w-full h-full object-cover rounded-2xl opacity-40"
              onError={() => {}}
            />
          </div>
        )}
        
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-start">
            <div className="backdrop-blur-sm bg-white/20 p-2 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-1 text-shadow-sm">{city.replace(/\s+\(Current\)/i, '')}</h3>
              <p className="text-sm text-gray-800 font-medium">{country}</p>
              {time && <p className="text-xs text-gray-700 mt-1">{time}</p>}
            </div>
            <div className="flex items-start space-x-2">
              <FavoriteButton 
                id={city.toLowerCase().replace(/\s+\(current\)/i, '')} 
                type="city" 
                className="backdrop-blur-sm bg-white/10 shadow-sm"
              />
              <div className="weather-icon backdrop-blur-sm bg-white/10 p-2 rounded-full shadow-sm">
                {getWeatherIcon()}
              </div>
            </div>
          </div>
          
          <div className="mt-6 backdrop-blur-sm bg-white/20 p-3 rounded-lg inline-block shadow-sm">
            <div className="flex items-end">
              <h2 className="text-4xl font-bold text-shadow-sm">{temperature}</h2>
              <span className="text-xl ml-1 font-semibold">°C</span>
            </div>
            <p className="text-sm text-gray-800 font-medium capitalize mt-1">
              {condition.replace('-', ' ')}
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-6 text-center text-xs">
            <div className="p-2 rounded-lg bg-white/30">
              <p className="font-medium text-gray-700">Humidity</p>
              <p className="mt-1 font-bold">{humidity}%</p>
            </div>
            <div className="p-2 rounded-lg bg-white/30">
              <p className="font-medium text-gray-700">Precip.</p>
              <p className="mt-1 font-bold">{precipitation}%</p>
            </div>
            <div className="p-2 rounded-lg bg-white/30">
              <p className="font-medium text-gray-700">Wind</p>
              <p className="mt-1 font-bold">{windSpeed} km/h</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WeatherCard;
