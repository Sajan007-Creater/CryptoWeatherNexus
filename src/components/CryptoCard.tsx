import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import FavoriteButton from './FavoriteButton';

interface CryptoCardProps {
  id: string;
  name: string;
  symbol: string;
  price: number;
  changePercentage: number;
  marketCap: number;
  image?: string;
  className?: string;
  onRefresh?: (id: string) => Promise<void>;
}

const CryptoCard = ({
  id,
  name,
  symbol,
  price,
  changePercentage,
  marketCap,
  image,
  className = '',
  onRefresh,
}: CryptoCardProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(2)}B`;
    }
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(2)}M`;
    }
    return `$${(marketCap / 1000).toFixed(2)}K`;
  };

  // Get fallback image for crypto
  const getCryptoFallbackImage = () => {
    const symbolLower = symbol.toLowerCase();
    // Use a more reliable source for fallback crypto images
    return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@bea1507f8c/128/color/${symbolLower}.png`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = getCryptoFallbackImage();
    
    // Add a second fallback if the first one fails
    e.currentTarget.onerror = () => {
      const symbolLower = symbol.toLowerCase();
      e.currentTarget.src = `https://cryptoicons.org/api/icon/${symbolLower}/128`;
      
      // Final fallback - a colored circle with the symbol initials
      e.currentTarget.onerror = () => {
        e.currentTarget.style.display = 'none';
        // We'll handle this via CSS background color
      };
    };
  };

  // Handle refresh button click
  const handleRefreshClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh(id);
      } catch (error) {
        console.error(`Failed to refresh ${name} data:`, error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <Link to={`/crypto/${id}`}>
      <div className={`glass-card card-3d ${className}`}>
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {image && (
                <img 
                  src={image} 
                  alt={name} 
                  className="w-10 h-10 rounded-full"
                  onError={handleImageError}
                />
              )}
              <div>
                <h3 className="text-lg font-medium">{name}</h3>
                <p className="text-sm text-gray-600 dark-mode:text-gray-300">{symbol.toUpperCase()}</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-lg text-sm font-medium flex items-center ${
              changePercentage >= 0 
                ? 'bg-green-100 text-green-700 dark-mode:bg-green-900/40 dark-mode:text-green-300' 
                : 'bg-red-100 text-red-700 dark-mode:bg-red-900/40 dark-mode:text-red-300'
            }`}>
              {changePercentage >= 0 ? (
                <ArrowUp size={14} className="mr-1" />
              ) : (
                <ArrowDown size={14} className="mr-1" />
              )}
              {Math.abs(changePercentage).toFixed(2)}%
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-end">
            <div>
              <div className="flex items-end">
                <h2 className="text-2xl font-bold">{formatPrice(price)}</h2>
              </div>
              <p className="text-sm text-gray-600 dark-mode:text-gray-300 mt-1">
                Market Cap: {formatMarketCap(marketCap)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <FavoriteButton 
                id={id} 
                type="crypto" 
              />
              {onRefresh && (
                <button
                  onClick={handleRefreshClick}
                  disabled={isRefreshing}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                    isRefreshing
                      ? 'bg-purple-100 text-purple-300 dark-mode:bg-purple-900/30 dark-mode:text-purple-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200 hover:text-purple-700 dark-mode:bg-purple-900/40 dark-mode:text-purple-300 dark-mode:hover:bg-purple-800/60'
                  }`}
                  title="Refresh rate"
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <div className="h-1 bg-gray-200 dark-mode:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  changePercentage >= 0 
                    ? 'bg-green-500 dark-mode:bg-green-600' 
                    : 'bg-red-500 dark-mode:bg-red-600'
                }`}
                style={{ width: `${Math.min(Math.abs(changePercentage * 5), 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark-mode:text-gray-400 mt-1">
              <span>24h Low</span>
              <span>24h High</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CryptoCard;
