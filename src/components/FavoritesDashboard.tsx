import { useAppSelector } from '../store/hooks';
import FavoritesList from './FavoritesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Coins } from 'lucide-react';

const FavoritesDashboard = () => {
  const userPreferences = useAppSelector(state => state.userPreferences);
  const hasFavorites = userPreferences.favoriteCities.length > 0 || userPreferences.favoriteCryptos.length > 0;
  
  if (!hasFavorites) {
    return (
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Favorites</h2>
        <div className="p-6 text-center text-gray-500">
          <p>You haven't added any favorites yet.</p>
          <p className="text-sm mt-2">
            Browse cities and cryptocurrencies and click the star icon to add them to your favorites.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="glass-card p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Your Favorites</h2>
      
      <Tabs defaultValue={userPreferences.favoriteCities.length > 0 ? "cities" : "cryptos"}>
        <TabsList className="w-full mb-4">
          <TabsTrigger 
            value="cities" 
            className="flex items-center gap-2 flex-1"
            disabled={userPreferences.favoriteCities.length === 0}
          >
            <MapPin size={16} />
            Cities
            {userPreferences.favoriteCities.length > 0 && (
              <span className="ml-1 bg-gray-100 dark:bg-gray-800 px-2 rounded-full text-xs">
                {userPreferences.favoriteCities.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="cryptos" 
            className="flex items-center gap-2 flex-1"
            disabled={userPreferences.favoriteCryptos.length === 0}
          >
            <Coins size={16} />
            Cryptocurrencies
            {userPreferences.favoriteCryptos.length > 0 && (
              <span className="ml-1 bg-gray-100 dark:bg-gray-800 px-2 rounded-full text-xs">
                {userPreferences.favoriteCryptos.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="cities" className="mt-2">
          <FavoritesList type="cities" />
        </TabsContent>
        
        <TabsContent value="cryptos" className="mt-2">
          <FavoritesList type="cryptos" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FavoritesDashboard; 