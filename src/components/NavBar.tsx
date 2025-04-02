import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, RefreshCw, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { weatherEvents } from '../pages/Weather';
import UserPreferences from './UserPreferences';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import { useAppSelector } from '../store/hooks';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();
  const { darkMode, favoriteCities, favoriteCryptos } = useAppSelector(state => state.userPreferences);
  const totalFavorites = favoriteCities.length + favoriteCryptos.length;
  
  // Apply dark mode class to body when preference changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const refreshWeatherData = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      toast({
        title: "Refreshing weather",
        description: "Updating weather data...",
      });
      
      // Use the weather events system to refresh
      weatherEvents.refresh();
      
      // Wait for a moment to show the refreshing state
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing weather data:', error);
      toast({
        title: "Refresh failed",
        description: "Could not update weather data",
        variant: "destructive"
      });
      setIsRefreshing(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gradient">
          CryptoWeatherNexus
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`font-medium hover:text-primary-foreground transition-colors ${location.pathname === '/' ? 'text-purple-600' : ''}`}>
            Dashboard
          </Link>
          <div className="flex items-center space-x-2">
            <Link to="/weather" className={`font-medium hover:text-primary-foreground transition-colors ${location.pathname === '/weather' ? 'text-purple-600' : ''}`}>
              Weather
            </Link>
            <button 
              onClick={refreshWeatherData}
              disabled={isRefreshing}
              className={`rounded-full p-1.5 transition-colors ${isRefreshing ? 'text-purple-300' : 'hover:bg-purple-100 text-purple-500'}`}
              title="Refresh weather data"
            >
              <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <Link to="/crypto" className={`font-medium hover:text-primary-foreground transition-colors ${location.pathname === '/crypto' ? 'text-purple-600' : ''}`}>
            Cryptocurrency
          </Link>
          <Link to="/news" className={`font-medium hover:text-primary-foreground transition-colors ${location.pathname === '/news' ? 'text-purple-600' : ''}`}>
            News
          </Link>
          <Link 
            to="/favorites" 
            className={`font-medium hover:text-primary-foreground transition-colors flex items-center ${location.pathname === '/favorites' ? 'text-purple-600' : ''}`}
          >
            <Star className="mr-1 h-4 w-4" />
            Favorites
            {totalFavorites > 0 && (
              <span className="ml-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 px-2 py-0.5 rounded-full text-xs">
                {totalFavorites}
              </span>
            )}
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notification Center */}
          <NotificationCenter />
          
          {/* User Preferences */}
          <UserPreferences />
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden rounded-full p-2 hover:bg-secondary transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 p-4 glass">
          <div className="flex flex-col space-y-4 py-4">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg hover:bg-secondary transition-colors ${location.pathname === '/' ? 'bg-purple-100 text-purple-700' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
              <Link 
                to="/weather" 
                className={`${location.pathname === '/weather' ? 'text-purple-700' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Weather
              </Link>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  refreshWeatherData();
                }}
                disabled={isRefreshing}
                className={`rounded-full p-1 ${isRefreshing ? 'text-purple-300' : 'hover:bg-purple-100 text-purple-500'}`}
                title="Refresh weather data"
              >
                <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <Link 
              to="/crypto" 
              className={`px-4 py-2 rounded-lg hover:bg-secondary transition-colors ${location.pathname === '/crypto' ? 'bg-purple-100 text-purple-700' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              Cryptocurrency
            </Link>
            <Link 
              to="/news" 
              className={`px-4 py-2 rounded-lg hover:bg-secondary transition-colors ${location.pathname === '/news' ? 'bg-purple-100 text-purple-700' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              News
            </Link>
            <Link 
              to="/favorites" 
              className={`px-4 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center ${location.pathname === '/favorites' ? 'bg-purple-100 text-purple-700' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <Star className="mr-2 h-4 w-4" />
              Favorites
              {totalFavorites > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 px-2 py-0.5 rounded-full text-xs">
                  {totalFavorites}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
