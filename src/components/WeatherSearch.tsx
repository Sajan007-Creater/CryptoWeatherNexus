import { useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWeatherByCity } from '../store/slices/weatherSlice';

interface WeatherSearchProps {
  onSearch?: () => void;
}

const WeatherSearch = ({ onSearch }: WeatherSearchProps) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.weather);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    try {
      // Dispatch Redux action to fetch weather by city
      await dispatch(fetchWeatherByCity(searchTerm)).unwrap();
      
      setSearchTerm('');
      
      // Call optional callback
      if (onSearch) onSearch();
      
      // Show success toast
      toast({
        title: "Weather data loaded",
        description: `Weather information for ${searchTerm} has been loaded.`,
      });
    } catch (error) {
      console.error('Error searching for city:', error);
      toast({
        title: "Search failed",
        description: `No results found for "${searchTerm}"`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch}>
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
              loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mt-4 p-4 glass-card bg-red-50 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default WeatherSearch; 