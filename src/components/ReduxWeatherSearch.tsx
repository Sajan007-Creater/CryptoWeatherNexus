import { useState } from 'react';
import { Search } from 'lucide-react';
import { useWeather } from '../hooks/useWeather.ts';

interface WeatherSearchProps {
  onSearch?: () => void;
}

const ReduxWeatherSearch = ({ onSearch }: WeatherSearchProps) => {
  const { loading, error, searchCity, clearError } = useWeather();
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    try {
      await searchCity(searchTerm);
      setSearchTerm('');
      
      // Call optional callback
      if (onSearch) onSearch();
    } catch (error) {
      // Error is already handled in the hook
      console.error('Search error in component:', error);
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
          <button 
            onClick={clearError} 
            className="ml-2 text-red-500 hover:text-red-700 underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default ReduxWeatherSearch; 