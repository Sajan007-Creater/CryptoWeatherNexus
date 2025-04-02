import { useMemo, useEffect, useState } from 'react';
import { CloudRain, CloudOff } from 'lucide-react';

type TimeEntry = {
  time: string;
  chance: number;
};

interface ChanceOfRainProps {
  data: TimeEntry[];
  className?: string;
}

const ChanceOfRain = ({ data, className = '' }: ChanceOfRainProps) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isRaining, setIsRaining] = useState<boolean>(false);
  
  // Find max chance of rain for scaling
  const maxChance = useMemo(() => {
    return Math.max(...data.map(entry => entry.chance));
  }, [data]);

  // Determine the current time slot and if it's raining
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours();
      // Format to match the time format in data (e.g., "2pm")
      const formattedHour = hours % 12 === 0 ? '12' : (hours % 12).toString();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const timeString = `${formattedHour}${ampm}`;
      
      setCurrentTime(timeString);
      
      // Find the current time entry or the closest one
      const currentEntry = data.find(entry => entry.time === timeString);
      if (currentEntry) {
        setIsRaining(currentEntry.chance > 30); // Consider > 30% as raining
      }
    };
    
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [data]);

  return (
    <div className={`glass-card ${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Chance of Rain</h3>
          
          {/* Rain status indicator */}
          <div className="flex items-center gap-2">
            {isRaining ? (
              <div className="flex items-center text-blue-500">
                <CloudRain className="w-5 h-5 animate-bounce" />
                <span className="text-sm font-medium ml-1">Raining now</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <CloudOff className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-medium ml-1">No rain</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          {data.map((entry, index) => {
            const isCurrentTimeSlot = entry.time === currentTime;
            const rainBarColor = entry.chance > 70 ? 'bg-blue-700' : 
                               entry.chance > 30 ? 'bg-blue-400' : 
                               'bg-yellow-400';
            
            return (
              <div key={index} className="flex items-center gap-4">
                <p className={`text-sm font-medium w-16 ${isCurrentTimeSlot ? 'text-purple-600 font-bold' : ''}`}>
                  {entry.time}
                  {isCurrentTimeSlot && <span className="ml-1">•</span>}
                </p>
                <div className="relative flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full ${rainBarColor} ${
                      isCurrentTimeSlot ? 'animate-pulse' : ''
                    }`}
                    style={{ width: `${(entry.chance / 100) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium w-8 text-right">{entry.chance}%</span>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between mt-6 text-sm">
          <div className="text-center">
            <div className="w-4 h-4 rounded-full bg-yellow-400 mx-auto"></div>
            <p className="mt-1">Sunny</p>
          </div>
          <div className="text-center">
            <div className="w-4 h-4 rounded-full bg-blue-400 mx-auto"></div>
            <p className="mt-1">Rainy</p>
          </div>
          <div className="text-center">
            <div className="w-4 h-4 rounded-full bg-blue-700 mx-auto"></div>
            <p className="mt-1">Heavy Rain</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChanceOfRain;
