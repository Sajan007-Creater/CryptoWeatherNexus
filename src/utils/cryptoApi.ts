// Crypto API utility
const API_KEY = import.meta.env.VITE_CRYPTO_API_KEY;
if (!API_KEY) {
  console.error('Crypto API key is missing. Please check your .env file and ensure VITE_CRYPTO_API_KEY is set.');
}
const BASE_URL = 'https://min-api.cryptocompare.com/data';

export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  changePercentage: number;
  marketCap: number;
  image?: string;
  volume24h?: number;
  circulatingSupply?: number;
  maxSupply?: number | null;
  allTimeHigh?: number;
  allTimeHighDate?: string;
  description?: string;
  website?: string;
  explorer?: string;
}

// Crypto symbols to IDs mapping for consistency
const cryptoMapping: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'XRP': 'ripple',
  'BNB': 'binance-coin',
  'SOL': 'solana',
  'USDC': 'usd-coin',
  'DOGE': 'dogecoin',
  'ADA': 'cardano',
  'TRX': 'tron',
  'DOT': 'polkadot',
  'AVAX': 'avalanche',
  'MATIC': 'polygon',
  'SHIB': 'shiba-inu'
};

// Crypto details to supplement API data
const cryptoDetails: Record<string, Partial<CryptoData>> = {
  'bitcoin': {
    description: 'Bitcoin is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries.',
    website: 'https://bitcoin.org',
    explorer: 'https://blockchain.info',
    maxSupply: 21000000,
  },
  'ethereum': {
    description: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform.',
    website: 'https://ethereum.org',
    explorer: 'https://etherscan.io',
    maxSupply: null,
  },
  'tether': {
    description: 'Tether (USDT) is a cryptocurrency stablecoin pegged to the U.S. dollar and backed by Tether\'s reserves.',
    website: 'https://tether.to',
    explorer: 'https://etherscan.io',
    maxSupply: null,
  },
  'ripple': {
    description: 'XRP is the native cryptocurrency of the XRP Ledger, which uses a consensus protocol to facilitate payments and provide a fast, efficient settlement option for global transactions.',
    website: 'https://ripple.com/xrp',
    explorer: 'https://xrpscan.com',
    maxSupply: 100000000000,
  },
  'binance-coin': {
    description: 'Binance Coin (BNB) is the cryptocurrency coin that powers the Binance ecosystem and serves as the native currency of the Binance Chain.',
    website: 'https://www.binance.com',
    explorer: 'https://bscscan.com',
    maxSupply: 200000000,
  },
  'solana': {
    description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.',
    website: 'https://solana.com',
    explorer: 'https://explorer.solana.com',
    maxSupply: null,
  },
  'usd-coin': {
    description: 'USD Coin (USDC) is a stablecoin that is pegged to the U.S. dollar on a 1:1 basis.',
    website: 'https://www.circle.com/en/usdc',
    explorer: 'https://etherscan.io',
    maxSupply: null,
  },
  'dogecoin': {
    description: 'Dogecoin is a cryptocurrency created by software engineers Billy Markus and Jackson Palmer, who decided to create a payment system as a joke, making fun of the wild speculation in cryptocurrencies.',
    website: 'https://dogecoin.com',
    explorer: 'https://dogechain.info',
    maxSupply: null,
  },
  'cardano': {
    description: 'Cardano is a proof-of-stake blockchain platform that aims to enable changemakers, innovators and visionaries to bring about positive global change.',
    website: 'https://cardano.org',
    explorer: 'https://cardanoscan.io',
    maxSupply: 45000000000,
  },
  'tron': {
    description: 'TRON is a blockchain-based decentralized platform that aims to build a free, global digital content entertainment system with distributed storage technology.',
    website: 'https://tron.network',
    explorer: 'https://tronscan.org',
    maxSupply: null,
  },
  // Add more crypto details as needed
};

// Direct image URLs for top cryptocurrencies
const cryptoImages: Record<string, string> = {
  'BTC': 'https://cryptocompare.com/media/37746251/btc.png',
  'ETH': 'https://cryptocompare.com/media/37746238/eth.png',
  'USDT': 'https://cryptocompare.com/media/37746338/usdt.png',
  'XRP': 'https://cryptocompare.com/media/38553096/xrp.png',
  'BNB': 'https://cryptocompare.com/media/40485170/bnb.png',
  'SOL': 'https://cryptocompare.com/media/37747734/sol.png',
  'USDC': 'https://cryptocompare.com/media/34835941/usdc.png',
  'DOGE': 'https://cryptocompare.com/media/37746339/doge.png',
  'ADA': 'https://cryptocompare.com/media/37746235/ada.png',
  'TRX': 'https://cryptocompare.com/media/34477805/trx.png'
};

export const fetchCryptoData = async (symbol: string): Promise<CryptoData> => {
  try {
    // Fetch price data
    const priceResponse = await fetch(`${BASE_URL}/pricemultifull?fsyms=${symbol}&tsyms=USD&api_key=${API_KEY}`);
    
    if (!priceResponse.ok) {
      throw new Error(`Crypto API error: ${priceResponse.statusText}`);
    }
    
    const priceData = await priceResponse.json();
    const cryptoInfo = priceData.RAW[symbol].USD;

    // Get ID from mapping
    const id = cryptoMapping[symbol] || symbol.toLowerCase();
    
    // Combine API data with our supplementary details
    return {
      id,
      name: cryptoInfo.FROMSYMBOL === 'SHIB' ? 'Shiba Inu' : cryptoInfo.FROMSYMBOL,
      symbol: cryptoInfo.FROMSYMBOL.toLowerCase(),
      price: cryptoInfo.PRICE,
      changePercentage: cryptoInfo.CHANGEPCT24HOUR,
      marketCap: cryptoInfo.MKTCAP,
      volume24h: cryptoInfo.TOTALVOLUME24H,
      circulatingSupply: cryptoInfo.SUPPLY,
      // Use our predefined image URLs when available, fall back to API URL
      image: cryptoImages[symbol] || `https://cryptocompare.com${cryptoInfo.IMAGEURL}`,
      ...cryptoDetails[id]
    };
  } catch (error) {
    console.error(`Failed to fetch crypto data for ${symbol}:`, error);
    throw error;
  }
};

// Helper function to get proper names for cryptocurrencies
function getCryptoName(symbol: string): string {
  const nameMap: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'USDT': 'Tether',
    'XRP': 'XRP',
    'BNB': 'BNB',
    'SOL': 'Solana',
    'USDC': 'USD Coin',
    'DOGE': 'Dogecoin',
    'ADA': 'Cardano',
    'TRX': 'TRON'
  };
  return nameMap[symbol] || symbol;
}

export const fetchTopCryptos = async (limit: number = 10, specificId?: string): Promise<CryptoData[]> => {
  try {
    // The top 10 cryptocurrencies in order
    const topSymbols = ['BTC', 'ETH', 'USDT', 'XRP', 'BNB', 'SOL', 'USDC', 'DOGE', 'ADA', 'TRX'];
    
    // If specificId is provided, find the matching symbol and just fetch that one
    if (specificId) {
      const symbolEntry = Object.entries(cryptoMapping).find(([_, id]) => id === specificId);
      if (symbolEntry) {
        try {
          const data = await fetchCryptoData(symbolEntry[0]);
          return [data];
        } catch (error) {
          console.error(`Failed to fetch data for specific crypto ${specificId}:`, error);
          throw error;
        }
      }
      throw new Error(`Could not find symbol for crypto ID: ${specificId}`);
    }
    
    // If requesting 5 or fewer, return just those
    const symbolsToFetch = limit <= 5 ? topSymbols.slice(0, limit) : topSymbols.slice(0, 10);
    
    // Fetch data for each cryptocurrency
    const promises = symbolsToFetch.map(async (symbol) => {
      try {
        return await fetchCryptoData(symbol);
      } catch (error) {
        console.error(`Failed to fetch data for ${symbol}:`, error);
        // Return a placeholder for failed fetches to maintain order
        return {
          id: cryptoMapping[symbol] || symbol.toLowerCase(),
          name: getCryptoName(symbol),
          symbol: symbol.toLowerCase(),
          price: 0,
          changePercentage: 0,
          marketCap: 0,
          image: cryptoImages[symbol] || `https://cryptocompare.com/media/37746251/${symbol.toLowerCase()}.png`,
          ...cryptoDetails[cryptoMapping[symbol] || symbol.toLowerCase()]
        };
      }
    });
    
    return await Promise.all(promises);
  } catch (error) {
    console.error('Failed to fetch top cryptos:', error);
    
    // Fallback to hardcoded data if all else fails
    const topSymbols = ['BTC', 'ETH', 'USDT', 'XRP', 'BNB', 'SOL', 'USDC', 'DOGE', 'ADA', 'TRX'];
    const symbolsToReturn = limit <= 5 ? topSymbols.slice(0, limit) : topSymbols.slice(0, 10);
    
    return symbolsToReturn.map(symbol => ({
      id: cryptoMapping[symbol] || symbol.toLowerCase(),
      name: getCryptoName(symbol),
      symbol: symbol.toLowerCase(),
      price: 0,
      changePercentage: 0,
      marketCap: 0,
      image: cryptoImages[symbol] || `https://cryptocompare.com/media/37746251/${symbol.toLowerCase()}.png`,
      ...cryptoDetails[cryptoMapping[symbol] || symbol.toLowerCase()]
    }));
  }
};

export const fetchHistoricalData = async (symbol: string, timeframe: string = '30d') => {
  try {
    // Determine parameters based on timeframe
    let limit = 30;
    let aggregate = 1;
    
    switch (timeframe) {
      case '24h':
        limit = 24;
        aggregate = 1;
        break;
      case '7d':
        limit = 7;
        aggregate = 24;
        break;
      case '30d':
        limit = 30;
        aggregate = 24;
        break;
      case '90d':
        limit = 90;
        aggregate = 24;
        break;
      case '1y':
        limit = 365;
        aggregate = 24;
        break;
    }
    
    const response = await fetch(`${BASE_URL}/v2/histo${timeframe === '24h' ? 'hour' : 'day'}?fsym=${symbol}&tsym=USD&limit=${limit}&aggregate=${aggregate}&api_key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`Crypto API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform to price history format
    return data.Data.Data.map((item: any) => ({
      date: new Date(item.time * 1000).toISOString().split('T')[0],
      price: item.close
    }));
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}:`, error);
    throw error;
  }
};

// Function to search for cryptocurrencies by name or symbol
export const searchCryptos = async (searchTerm: string): Promise<CryptoData[]> => {
  try {
    const term = searchTerm.toLowerCase();
    
    // First check if the search term matches any of our top 10 cryptocurrencies
    const topSymbols = ['BTC', 'ETH', 'USDT', 'XRP', 'BNB', 'SOL', 'USDC', 'DOGE', 'ADA', 'TRX'];
    const matchingTopSymbols = topSymbols.filter(symbol => 
      symbol.toLowerCase().includes(term) || 
      getCryptoName(symbol).toLowerCase().includes(term)
    );
    
    if (matchingTopSymbols.length > 0) {
      // Return matching top cryptocurrencies
      const promises = matchingTopSymbols.map(symbol => fetchCryptoData(symbol));
      return await Promise.all(promises);
    }
    
    // If no top matches, proceed with API search
    const response = await fetch(`${BASE_URL}/top/mktcapfull?limit=100&tsym=USD&api_key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`Crypto API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter coins by search term
    const filteredCoins = data.Data.filter((coin: any) => {
      const coinName = coin.CoinInfo.FullName.toLowerCase();
      const coinSymbol = coin.CoinInfo.Name.toLowerCase();
      
      return coinName.includes(term) || coinSymbol.includes(term);
    });
    
    // Process each coin (limit to top 20 results)
    const topResults = filteredCoins.slice(0, 20);
    const promises = topResults.map(async (coin: any) => {
      const symbol = coin.CoinInfo.Name;
      return await fetchCryptoData(symbol);
    });
    
    return await Promise.all(promises);
  } catch (error) {
    console.error('Failed to search cryptos:', error);
    throw error;
  }
};
