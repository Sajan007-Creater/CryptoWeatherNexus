import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import CryptoCard from '../components/CryptoCard';
import { Search, RefreshCw } from 'lucide-react';
import { fetchTopCryptos, searchCryptos, CryptoData } from '../utils/cryptoApi';
import { toast } from '@/components/ui/use-toast';

const CryptoPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allCryptos, setAllCryptos] = useState<CryptoData[]>([]);
  const [searchResults, setSearchResults] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [marketData, setMarketData] = useState({
    marketCap: "2.34T",
    volume: "78.5B",
    btcDominance: "49.7%",
    activeCryptos: "22,345",
  });
  
  // Function to fetch all crypto data
  const fetchCryptoData = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
        toast({
          title: "Refreshing data",
          description: "Fetching latest cryptocurrency data"
        });
      } else {
        setLoading(true);
      }
      
      const data = await fetchTopCryptos(10);
      setAllCryptos(data);
      
      // Calculate market overview data
      if (data.length > 0) {
        const totalMarketCap = data.reduce((sum, crypto) => sum + crypto.marketCap, 0);
        const formattedMarketCap = formatLargeNumber(totalMarketCap);
        
        // Assuming first item is Bitcoin
        const btcDominance = ((data[0].marketCap / totalMarketCap) * 100).toFixed(1) + "%";
        
        // Update market data
        setMarketData({
          marketCap: formattedMarketCap,
          volume: "78.5B", // This would ideally come from API
          btcDominance,
          activeCryptos: data.length.toString(),
        });
      }
      
      if (showToast) {
        toast({
          title: "Data refreshed",
          description: "Cryptocurrency data has been updated"
        });
      }
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      toast({
        title: "Crypto data error",
        description: "Failed to fetch cryptocurrency data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to refresh an individual cryptocurrency
  const refreshSingleCrypto = async (cryptoId: string) => {
    try {
      console.log(`Refreshing data for crypto: ${cryptoId}`);
      
      // Find the index in the appropriate array
      const isInSearchResults = searchResults.some(c => c.id === cryptoId);
      const targetArray = isInSearchResults ? searchResults : allCryptos;
      const index = targetArray.findIndex(crypto => crypto.id === cryptoId);
      
      if (index === -1) return;

      // Fetch just this specific cryptocurrency
      const updatedCrypto = await fetchTopCryptos(1, cryptoId);
      if (updatedCrypto && updatedCrypto.length > 0) {
        // Create a new array with the updated crypto
        if (isInSearchResults) {
          const updatedResults = [...searchResults];
          updatedResults[index] = updatedCrypto[0];
          setSearchResults(updatedResults);
        } else {
          const updatedData = [...allCryptos];
          updatedData[index] = updatedCrypto[0];
          setAllCryptos(updatedData);
          
          // Recalculate market data if this was in the main list
          if (updatedData.length > 0) {
            const totalMarketCap = updatedData.reduce((sum, crypto) => sum + crypto.marketCap, 0);
            const formattedMarketCap = formatLargeNumber(totalMarketCap);
            const btcDominance = ((updatedData[0].marketCap / totalMarketCap) * 100).toFixed(1) + "%";
            
            setMarketData(prev => ({
              ...prev,
              marketCap: formattedMarketCap,
              btcDominance
            }));
          }
        }
        
        // Show success toast
        toast({
          title: "Updated",
          description: `${updatedCrypto[0].name} rate refreshed`,
        });
      }
    } catch (error) {
      console.error(`Failed to refresh crypto ${cryptoId}:`, error);
      toast({
        title: "Error",
        description: "Failed to refresh cryptocurrency data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, []);

  // Handle search input with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleSearch();
      } else if (searchTerm.length === 0) {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = async () => {
    if (searchTerm.length < 2) return;
    
    try {
      setSearching(true);
      const results = await searchCryptos(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching cryptos:', error);
      toast({
        title: "Search error",
        description: "Failed to search cryptocurrencies",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };
  
  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) {
      return (num / 1e12).toFixed(2) + 'T';
    }
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toString();
  };
  
  // Determine which cryptos to display
  const displayCryptos = searchTerm.length >= 2 ? searchResults : allCryptos;
  const isSearchActive = searchTerm.length >= 2;

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto pt-24 pb-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gradient text-shadow-lg bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm">Cryptocurrency</h1>
          
          <button
            onClick={() => fetchCryptoData(true)}
            disabled={refreshing || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-150 ${
              refreshing || loading
                ? 'bg-purple-200 cursor-not-allowed text-purple-400'
                : 'bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800'
            }`}
            title="Refresh all cryptocurrency data"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh All'}</span>
          </button>
        </div>
        
        {/* Search */}
        <div className="mb-8">
          <div className="glass-card p-4 flex items-center">
            <Search size={20} className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search for a cryptocurrency..."
              className="bg-transparent w-full focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isSearchActive && (
            <p className="text-sm text-gray-600 dark-mode:text-gray-300 mt-2 ml-2">
              {searching ? 'Searching...' : `Found ${searchResults.length} results for "${searchTerm}"`}
            </p>
          )}
        </div>
        
        {/* Market Overview - Only show when not searching */}
        {!isSearchActive && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Market Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/50 dark-mode:bg-gray-800/50 text-center">
                <p className="text-sm text-gray-600 dark-mode:text-gray-300 mb-1">Global Market Cap</p>
                <p className="text-xl font-bold">${marketData.marketCap}</p>
                <p className="text-xs text-green-600 dark-mode:text-green-400">+2.45%</p>
              </div>
              <div className="p-4 rounded-xl bg-white/50 dark-mode:bg-gray-800/50 text-center">
                <p className="text-sm text-gray-600 dark-mode:text-gray-300 mb-1">24h Volume</p>
                <p className="text-xl font-bold">${marketData.volume}</p>
                <p className="text-xs text-red-600 dark-mode:text-red-400">-1.78%</p>
              </div>
              <div className="p-4 rounded-xl bg-white/50 dark-mode:bg-gray-800/50 text-center">
                <p className="text-sm text-gray-600 dark-mode:text-gray-300 mb-1">BTC Dominance</p>
                <p className="text-xl font-bold">{marketData.btcDominance}</p>
                <p className="text-xs text-green-600 dark-mode:text-green-400">+0.23%</p>
              </div>
              <div className="p-4 rounded-xl bg-white/50 dark-mode:bg-gray-800/50 text-center">
                <p className="text-sm text-gray-600 dark-mode:text-gray-300 mb-1">Active Cryptocurrencies</p>
                <p className="text-xl font-bold">{marketData.activeCryptos}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Cryptocurrencies Grid */}
        {loading || searching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(isSearchActive ? 4 : 10).fill(0).map((_, index) => (
              <div key={index} className="glass-card h-52 animate-pulse">
                <div className="h-full flex flex-col p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="w-24 h-5 bg-gray-200 rounded mb-1"></div>
                        <div className="w-12 h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="w-16 h-6 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="mt-6">
                    <div className="w-32 h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="mt-4">
                    <div className="h-1 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayCryptos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayCryptos.map((crypto, index) => (
              <CryptoCard
                key={index}
                id={crypto.id}
                name={crypto.name}
                symbol={crypto.symbol}
                price={crypto.price}
                changePercentage={crypto.changePercentage}
                marketCap={crypto.marketCap}
                image={crypto.image}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 glass-card">
            <h3 className="text-xl mb-2">No cryptocurrencies found</h3>
            <p className="text-gray-600">Try a different search term</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CryptoPage;
