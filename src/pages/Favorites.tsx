import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import NavBar from '../components/NavBar';
import FavoritesDashboard from '../components/FavoritesDashboard';
import { Button } from '@/components/ui/button';
import { Star, Trash2 } from 'lucide-react';
import { removeFavoriteCity, removeFavoriteCrypto } from '../store/slices/userPreferencesSlice';

const Favorites = () => {
  const dispatch = useAppDispatch();
  const { favoriteCities, favoriteCryptos } = useAppSelector(state => state.userPreferences);
  
  const clearAllCityFavorites = () => {
    if (confirm('Are you sure you want to remove all favorite cities?')) {
      favoriteCities.forEach(cityId => {
        dispatch(removeFavoriteCity(cityId));
      });
    }
  };
  
  const clearAllCryptoFavorites = () => {
    if (confirm('Are you sure you want to remove all favorite cryptocurrencies?')) {
      favoriteCryptos.forEach(cryptoId => {
        dispatch(removeFavoriteCrypto(cryptoId));
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            My Favorites
          </h1>
          
          <div className="flex space-x-2">
            {favoriteCities.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllCityFavorites}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Cities
              </Button>
            )}
            
            {favoriteCryptos.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllCryptoFavorites}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Cryptos
              </Button>
            )}
          </div>
        </div>
        
        <FavoritesDashboard />
        
        {!favoriteCities.length && !favoriteCryptos.length && (
          <div className="text-center mt-12 p-8 glass-card">
            <h2 className="text-2xl font-semibold mb-4">No Favorites Yet</h2>
            <p className="text-gray-500 mb-6">
              You haven't added any cities or cryptocurrencies to your favorites.
            </p>
            <p className="text-gray-600">
              Browse through the Weather and Crypto pages and click the star icon on items you want to add to favorites.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 