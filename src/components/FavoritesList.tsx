import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  removeFavoriteCity, 
  removeFavoriteCrypto 
} from '../store/slices/userPreferencesSlice';
import { Link } from 'react-router-dom';
import { Star, X, MapPin, Coins } from 'lucide-react';

interface FavoritesListProps {
  type: 'cities' | 'cryptos';
}

const FavoritesList = ({ type }: FavoritesListProps) => {
  const dispatch = useAppDispatch();
  const userPreferences = useAppSelector(state => state.userPreferences);
  const weatherState = useAppSelector(state => state.weather);
  const cryptoState = useAppSelector(state => state.crypto);
  
  // Get favorites based on type
  const favorites = type === 'cities' 
    ? userPreferences.favoriteCities 
    : userPreferences.favoriteCryptos;
  
  // Get full items with details from respective states
  const itemsWithDetails = type === 'cities'
    ? favorites.map(cityId => {
        const city = weatherState.cities.find(c => c.cityId === cityId);
        return {
          id: cityId,
          name: city?.cityName || cityId,
          detail: city?.temperature ? `${city.temperature}°` : '',
          path: `/weather/${cityId}`
        };
      })
    : favorites.map(cryptoId => {
        const crypto = cryptoState.cryptocurrencies.find(c => c.id === cryptoId);
        return {
          id: cryptoId,
          name: crypto?.name || cryptoId,
          detail: crypto?.price ? `$${crypto.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '',
          path: `/crypto/${cryptoId}`
        };
      });
  
  const handleRemove = (id: string) => {
    if (type === 'cities') {
      dispatch(removeFavoriteCity(id));
    } else {
      dispatch(removeFavoriteCrypto(id));
    }
  };
  
  if (favorites.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No favorite {type} yet.</p>
        <p className="text-sm mt-1">
          Add some by clicking the star icon on {type === 'cities' ? 'city' : 'crypto'} pages.
        </p>
      </div>
    );
  }
  
  return (
    <div className="divide-y">
      {itemsWithDetails.map(item => (
        <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
          <Link to={item.path} className="flex items-center flex-1">
            <span className="mr-3">
              {type === 'cities' ? <MapPin size={16} /> : <Coins size={16} />}
            </span>
            <div>
              <div className="font-medium">{item.name}</div>
              {item.detail && <div className="text-sm text-gray-500">{item.detail}</div>}
            </div>
          </Link>
          <button
            onClick={() => handleRemove(item.id)}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label={`Remove ${item.name} from favorites`}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FavoritesList; 