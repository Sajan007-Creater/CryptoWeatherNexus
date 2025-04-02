
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { ArrowUp, ArrowDown, DollarSign, BarChart3, TrendingUp, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchCryptoData, fetchHistoricalData, CryptoData } from '../utils/cryptoApi';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from '@/components/ui/use-toast';

const CryptoDetail = () => {
  const { cryptoId } = useParams<{ cryptoId: string }>();
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [priceHistory, setPriceHistory] = useState<{date: string; price: number}[]>([]);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!cryptoId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Map ID to symbol if needed
        let symbol: string;
        switch (cryptoId.toLowerCase()) {
          case 'bitcoin': symbol = 'BTC'; break;
          case 'ethereum': symbol = 'ETH'; break;
          case 'solana': symbol = 'SOL'; break;
          case 'cardano': symbol = 'ADA'; break;
          case 'ripple': symbol = 'XRP'; break;
          case 'polkadot': symbol = 'DOT'; break;
          case 'dogecoin': symbol = 'DOGE'; break;
          case 'avalanche': symbol = 'AVAX'; break;
          case 'polygon': symbol = 'MATIC'; break;
          case 'shiba-inu': symbol = 'SHIB'; break;
          default: symbol = cryptoId.toUpperCase();
        }
        
        // Fetch crypto data
        const crypto = await fetchCryptoData(symbol);
        setCryptoData(crypto);
        
        // Fetch historical data
        const history = await fetchHistoricalData(symbol, timeframe);
        setPriceHistory(history);
      } catch (err) {
        console.error("Error fetching crypto data:", err);
        setError("Failed to load cryptocurrency information");
        toast({
          title: "Error loading crypto data",
          description: "We couldn't fetch information for this cryptocurrency",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cryptoId, timeframe]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <NavBar />
        <main className="container mx-auto pt-24 pb-12 px-4">
          <div className="flex items-center mb-8">
            <Link to="/crypto" className="flex items-center text-primary-foreground hover:underline">
              <ArrowLeft size={20} className="mr-2" />
              Back to Cryptocurrencies
            </Link>
          </div>
          
          <div className="glass-card p-12 text-center">
            <h3 className="text-2xl font-medium text-red-600 mb-4">{error}</h3>
            <p className="text-gray-600 mb-8">Try viewing a different cryptocurrency</p>
            <Link to="/crypto" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Return to Cryptocurrencies
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Get min and max price for chart scaling if we have data
  const minPrice = priceHistory.length ? Math.min(...priceHistory.map(d => d.price)) : 0;
  const maxPrice = priceHistory.length ? Math.max(...priceHistory.map(d => d.price)) : 0;
  const priceRange = maxPrice - minPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <NavBar />
      
      <main className="container mx-auto pt-24 pb-12 px-4">
        {/* Back Button */}
        <div className="flex items-center mb-8">
          <Link to="/crypto" className="flex items-center text-primary-foreground hover:underline">
            <ArrowLeft size={20} className="mr-2" />
            Back to Cryptocurrencies
          </Link>
        </div>
        
        {loading ? (
          // Loading placeholders
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 glass-card p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <div className="h-8 w-40 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="glass-card p-4 mt-4 sm:mt-0 w-full sm:w-40 h-16 bg-gray-200 rounded"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card p-6 h-80 animate-pulse"></div>
              <div className="glass-card p-6 h-80 animate-pulse"></div>
            </div>
          </div>
        ) : cryptoData ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <div className="flex items-center mb-4 sm:mb-0">
                <img 
                  src={cryptoData.image} 
                  alt={cryptoData.name}
                  className="w-12 h-12 mr-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Crypto';
                  }}
                />
                <div>
                  <h1 className="text-4xl font-bold inline-block mr-2">{cryptoData.name}</h1>
                  <span className="text-xl text-gray-500">{cryptoData.symbol.toUpperCase()}</span>
                </div>
              </div>
              
              <div className="glass-card p-4 inline-flex items-center">
                <h2 className="text-2xl font-bold mr-3">{formatPrice(cryptoData.price)}</h2>
                <div className={`px-2 py-1 rounded-lg text-sm font-medium flex items-center ${
                  cryptoData.changePercentage >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {cryptoData.changePercentage >= 0 ? (
                    <ArrowUp size={14} className="mr-1" />
                  ) : (
                    <ArrowDown size={14} className="mr-1" />
                  )}
                  {Math.abs(cryptoData.changePercentage).toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                {/* Price Chart */}
                <div className="glass-card p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Price Chart</h2>
                    <div className="flex space-x-2 text-sm">
                      <button 
                        className={`px-3 py-1 rounded-md ${timeframe === '24h' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
                        onClick={() => setTimeframe('24h')}
                      >
                        24h
                      </button>
                      <button 
                        className={`px-3 py-1 rounded-md ${timeframe === '7d' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
                        onClick={() => setTimeframe('7d')}
                      >
                        7d
                      </button>
                      <button 
                        className={`px-3 py-1 rounded-md ${timeframe === '30d' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
                        onClick={() => setTimeframe('30d')}
                      >
                        30d
                      </button>
                      <button 
                        className={`px-3 py-1 rounded-md ${timeframe === '90d' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
                        onClick={() => setTimeframe('90d')}
                      >
                        90d
                      </button>
                      <button 
                        className={`px-3 py-1 rounded-md ${timeframe === '1y' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
                        onClick={() => setTimeframe('1y')}
                      >
                        1y
                      </button>
                    </div>
                  </div>
                  
                  {priceHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={priceHistory}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => {
                            const d = new Date(date);
                            return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
                          }}
                          minTickGap={30}
                        />
                        <YAxis 
                          domain={[minPrice * 0.9, maxPrice * 1.1]}
                          tickFormatter={(value) => formatPrice(value)}
                        />
                        <Tooltip 
                          formatter={(value: any) => [formatPrice(value), 'Price']}
                          labelFormatter={(label) => formatDate(label)}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#8b5cf6" 
                          fill="url(#colorPrice)" 
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Historical data not available</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                {/* Market Stats */}
                <div className="glass-card p-6 h-full">
                  <h2 className="text-xl font-bold mb-6">Market Stats</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <DollarSign size={16} className="text-gray-500 mr-2" />
                        <span className="text-gray-600">Market Cap</span>
                      </div>
                      <span className="font-semibold">${formatNumber(cryptoData.marketCap)}</span>
                    </div>
                    
                    {cryptoData.volume24h && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <BarChart3 size={16} className="text-gray-500 mr-2" />
                          <span className="text-gray-600">24h Volume</span>
                        </div>
                        <span className="font-semibold">${formatNumber(cryptoData.volume24h)}</span>
                      </div>
                    )}
                    
                    {cryptoData.circulatingSupply && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <RefreshCw size={16} className="text-gray-500 mr-2" />
                          <span className="text-gray-600">Circulating Supply</span>
                        </div>
                        <span className="font-semibold">
                          {formatNumber(cryptoData.circulatingSupply)} {cryptoData.symbol.toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {cryptoData.maxSupply && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <TrendingUp size={16} className="text-gray-500 mr-2" />
                          <span className="text-gray-600">Max Supply</span>
                        </div>
                        <span className="font-semibold">
                          {formatNumber(cryptoData.maxSupply)} {cryptoData.symbol.toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {cryptoData.maxSupply && cryptoData.circulatingSupply && (
                      <div className="pt-2">
                        <div className="text-gray-600 mb-1">Supply Progress</div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500"
                            style={{ 
                              width: `${(cryptoData.circulatingSupply / cryptoData.maxSupply) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Circulating</span>
                          <span>Max Supply</span>
                        </div>
                      </div>
                    )}
                    
                    {cryptoData.allTimeHigh && cryptoData.allTimeHighDate && (
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center">
                          <TrendingUp size={16} className="text-gray-500 mr-2" />
                          <span className="text-gray-600">All Time High</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatPrice(cryptoData.allTimeHigh)}</div>
                          <div className="text-xs text-gray-500">{formatDate(cryptoData.allTimeHighDate)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {cryptoData.description && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-2">About {cryptoData.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{cryptoData.description}</p>
                    </div>
                  )}
                  
                  {(cryptoData.website || cryptoData.explorer) && (
                    <div className="space-y-2 mt-4">
                      {cryptoData.website && (
                        <a 
                          href={cryptoData.website} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm text-center hover:bg-purple-200 transition-colors"
                        >
                          Official Website
                        </a>
                      )}
                      {cryptoData.explorer && (
                        <a 
                          href={cryptoData.explorer} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm text-center hover:bg-gray-200 transition-colors"
                        >
                          Block Explorer
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card p-12 text-center">
            <h3 className="text-2xl font-medium text-gray-600">Cryptocurrency not found</h3>
            <p className="text-gray-500 mt-2">Please try viewing a different cryptocurrency</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CryptoDetail;
