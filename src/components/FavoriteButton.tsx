import { Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addFavoriteCity, removeFavoriteCity, addFavoriteCrypto, removeFavoriteCrypto } from '../store/slices/userPreferencesSlice';
import { motion } from 'framer-motion';

interface FavoriteButtonProps {
  id: string;
  type: 'city' | 'crypto';
  className?: string;
}

const FavoriteButton = ({ id, type, className = '' }: FavoriteButtonProps) => {
  const dispatch = useAppDispatch();
  const { favoriteCities, favoriteCryptos } = useAppSelector(state => state.userPreferences);
  
  const isFavorite = type === 'city' 
    ? favoriteCities.includes(id)
    : favoriteCryptos.includes(id);
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (type === 'city') {
      if (isFavorite) {
        dispatch(removeFavoriteCity(id));
      } else {
        dispatch(addFavoriteCity(id));
      }
    } else {
      if (isFavorite) {
        dispatch(removeFavoriteCrypto(id));
      } else {
        dispatch(addFavoriteCrypto(id));
      }
    }
  };

  return (
    <motion.button
      onClick={handleToggleFavorite}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
        isFavorite
          ? 'bg-amber-100 text-amber-500 dark-mode:bg-amber-900/40 dark-mode:text-amber-300'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark-mode:bg-gray-800/40 dark-mode:text-gray-500 dark-mode:hover:bg-gray-700/60 dark-mode:hover:text-gray-300'
      } ${className}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      whileTap={{ scale: 0.85 }}
      initial={{ scale: 1 }}
      animate={{ 
        scale: isFavorite ? [1, 1.2, 1] : 1,
        rotate: isFavorite ? [0, 15, 0] : 0,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
    >
      <Star 
        size={16} 
        className={isFavorite ? 'fill-amber-500 dark-mode:fill-amber-300' : ''} 
      />
    </motion.button>
  );
};

export default FavoriteButton; 