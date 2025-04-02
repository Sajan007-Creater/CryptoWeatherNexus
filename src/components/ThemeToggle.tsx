import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleDarkMode } from '../store/slices/userPreferencesSlice';
import { Sun, Moon } from 'lucide-react';

// Ultra-simple theme toggle without any animations or transitions
const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector(state => state.userPreferences);
  
  // Handle dark mode toggle with a direct DOM manipulation
  const handleToggle = () => {
    // First dispatch the Redux action to update state
    dispatch(toggleDarkMode());
    
    // Directly apply or remove dark-mode class to avoid any transition delay
    const newDarkMode = !darkMode;
    
    // Immediately update document and root elements
    document.documentElement.classList.toggle('dark-mode', newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.toggle('dark-mode', newDarkMode);
    }
    
    // Update app wrapper and other containers
    document.querySelectorAll('.app-wrapper').forEach(el => {
      el.classList.toggle('dark-mode', newDarkMode);
    });
  };
  
  return (
    <button
      onClick={handleToggle}
      className={`theme-toggle relative p-2.5 rounded-full ${
        darkMode 
          ? 'bg-gray-900 text-purple-300 hover:bg-gray-800' 
          : 'bg-blue-100 text-blue-500 hover:bg-blue-200'
      }`}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle; 