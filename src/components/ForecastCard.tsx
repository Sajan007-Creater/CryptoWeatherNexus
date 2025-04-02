
import { ArrowUp, ArrowDown } from 'lucide-react';
import { CloudSun, CloudRain, CloudSnow, Wind, Moon, Sun } from 'lucide-react';

type WeatherCondition = 'partly-cloudy' | 'rainy' | 'snowy' | 'windy' | 'sunny' | 'night';

interface ForecastCardProps {
  day: string;
  condition: WeatherCondition;
  highTemp: number;
  lowTemp: number;
  className?: string;
}

const ForecastCard = ({
  day,
  condition,
  highTemp,
  lowTemp,
  className = '',
}: ForecastCardProps) => {
  const getWeatherIcon = () => {
    switch (condition) {
      case 'partly-cloudy':
        return <CloudSun size={24} className="text-weather-cloud" />;
      case 'rainy':
        return <CloudRain size={24} className="text-weather-rain" />;
      case 'snowy':
        return <CloudSnow size={24} className="text-weather-snow" />;
      case 'windy':
        return <Wind size={24} className="text-weather-cloud" />;
      case 'sunny':
        return <Sun size={24} className="text-weather-sun" />;
      case 'night':
        return <Moon size={24} className="text-weather-night" />;
      default:
        return <CloudSun size={24} className="text-weather-cloud" />;
    }
  };

  return (
    <div className={`glass-card p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          {getWeatherIcon()}
          <p className="text-sm font-medium mt-2">{day}</p>
          <p className="text-xs text-gray-600 capitalize">{condition.replace('-', ' ')}</p>
        </div>
        
        <div className="flex items-center">
          <div className="text-right">
            <div className="flex items-center justify-end">
              <ArrowUp size={16} className="text-red-500" />
              <span className="ml-1 text-lg font-bold">{highTemp}°</span>
            </div>
            <div className="flex items-center justify-end mt-1">
              <ArrowDown size={16} className="text-blue-500" />
              <span className="ml-1 text-lg font-bold">{lowTemp}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastCard;
