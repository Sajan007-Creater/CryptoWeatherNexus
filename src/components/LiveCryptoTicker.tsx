import { useAppSelector } from '../store/hooks';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const LiveCryptoTicker = () => {
  const cryptocurrencies = useAppSelector((state) => state.crypto.cryptocurrencies);
  const [tickerVisible, setTickerVisible] = useState(true);
  
  // Automatically hide the ticker after a period of inactivity (no price changes)
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  useEffect(() => {
    if (cryptocurrencies.length > 0) {
      setLastUpdate(Date.now());
    }
    
    // Hide ticker after 5 minutes of no updates
    const hideTimer = setTimeout(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdate;
      if (timeSinceLastUpdate > 5 * 60 * 1000) {
        setTickerVisible(false);
      }
    }, 5 * 60 * 1000);
    
    return () => clearTimeout(hideTimer);
  }, [cryptocurrencies, lastUpdate]);
  
  // Show ticker when user hovers near top of screen
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 100) {
        setTickerVisible(true);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  if (!tickerVisible || cryptocurrencies.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-black bg-opacity-80 text-white shadow-md z-40 overflow-hidden">
      <div className="marquee-container">
        <div className="marquee">
          {cryptocurrencies.map((crypto) => (
            <div key={crypto.id} className="inline-flex items-center px-4 py-2">
              <img 
                src={crypto.image} 
                alt={crypto.name} 
                className="w-6 h-6 mr-2 rounded-full" 
              />
              <span className="font-medium">{crypto.symbol?.toUpperCase()}</span>
              <span className="mx-2 font-mono">
                ${crypto.price?.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
              {crypto.change24h !== undefined && (
                <span className={`flex items-center text-xs ${
                  crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {crypto.change24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(crypto.change24h).toFixed(2)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveCryptoTicker;

// Add this to your App.css or a separate CSS file:
/*
.marquee-container {
  width: 100%;
  overflow: hidden;
}

.marquee {
  display: inline-block;
  white-space: nowrap;
  animation: marquee 30s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

@media (prefers-reduced-motion) {
  .marquee {
    animation-duration: 60s;
  }
}
*/ 