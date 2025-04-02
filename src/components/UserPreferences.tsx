import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  toggleDarkMode, 
  setTemperatureUnit, 
  resetPreferences 
} from '../store/slices/userPreferencesSlice';
import { Settings, Sun, Moon, Trash } from 'lucide-react';

const UserPreferences = () => {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(state => state.userPreferences);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
    
    // Apply dark mode class to document body
    if (!preferences.darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  const handleTemperatureUnitChange = (unit: 'celsius' | 'fahrenheit') => {
    dispatch(setTemperatureUnit(unit));
  };

  const handleResetPreferences = () => {
    if (window.confirm('Are you sure you want to reset all preferences?')) {
      dispatch(resetPreferences());
      document.documentElement.classList.remove('dark-mode');
    }
  };

  return (
    <div className="relative">
      {/* Settings Toggle Button */}
      <button
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open user preferences"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Preferences Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 p-4 w-72 bg-white dark:bg-gray-900 shadow-lg rounded-lg z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">User Preferences</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              &times;
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="py-2 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span>Dark Mode</span>
              <button
                onClick={handleToggleDarkMode}
                className={`p-2 rounded-full ${
                  preferences.darkMode 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-yellow-100 text-yellow-600'
                }`}
              >
                {preferences.darkMode ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
          </div>

          {/* Temperature Unit */}
          <div className="py-2 border-b dark:border-gray-700">
            <div className="flex flex-col">
              <span className="mb-2">Temperature Unit</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTemperatureUnitChange('celsius')}
                  className={`px-3 py-1 rounded ${
                    preferences.temperatureUnit === 'celsius'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => handleTemperatureUnitChange('fahrenheit')}
                  className={`px-3 py-1 rounded ${
                    preferences.temperatureUnit === 'fahrenheit'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  °F
                </button>
              </div>
            </div>
          </div>

          {/* Saved Items Summary */}
          <div className="py-2 border-b dark:border-gray-700">
            <div className="flex flex-col">
              <span className="mb-2">Saved Items</span>
              <div className="flex justify-between text-sm">
                <span>Favorite Cities</span>
                <span className="bg-gray-100 dark:bg-gray-800 px-2 rounded">
                  {preferences.favoriteCities.length}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Favorite Cryptocurrencies</span>
                <span className="bg-gray-100 dark:bg-gray-800 px-2 rounded">
                  {preferences.favoriteCryptos.length}
                </span>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-4">
            <button
              onClick={handleResetPreferences}
              className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded"
            >
              <Trash size={16} />
              Reset All Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPreferences; 