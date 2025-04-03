// News API utility
const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
if (!API_KEY) {
  console.error('News API key is missing. Please check your .env file and ensure VITE_NEWS_API_KEY is set.');
}
const BASE_URL = 'https://cryptopanic.com/api/v1';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  image?: string;
  content?: string;
  tags?: string[];
}

// Sample fallback news data in case the API fails
const fallbackNewsData: NewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin Surges Past $84,000 as Institutional Adoption Continues',
    source: 'CoinDesk',
    date: '2025-04-01T14:30:00Z',
    url: 'https://www.coindesk.com',
    content: 'Bitcoin continues its bullish trend as more institutions add it to their balance sheets.',
    tags: ['BTC', 'Institutional'],
    image: 'https://images.unsplash.com/photo-1543699565-003b8adda5fc?ixlib=rb-4.0.3'
  },
  {
    id: '2',
    title: 'Ethereum Layer 2 Solutions Show Record Growth in Total Value Locked',
    source: 'Cointelegraph',
    date: '2025-04-01T12:15:00Z',
    url: 'https://cointelegraph.com',
    content: 'Ethereum scaling solutions are seeing unprecedented adoption as gas fees remain high.',
    tags: ['ETH', 'Layer 2'],
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3'
  },
  {
    id: '3',
    title: 'XRP Price Analysis: Technical Indicators Point to Potential Breakout',
    source: 'CryptoNews',
    date: '2025-04-01T10:45:00Z',
    url: 'https://cryptonews.com',
    content: 'XRP displays bullish patterns on the daily chart as volume increases.',
    tags: ['XRP', 'Technical Analysis'],
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3'
  },
  {
    id: '4',
    title: 'Central Banks Accelerate CBDC Development in Response to Crypto Growth',
    source: 'Bloomberg Crypto',
    date: '2025-04-01T08:20:00Z',
    url: 'https://www.bloomberg.com/crypto',
    content: 'Major central banks are fast-tracking their digital currency projects.',
    tags: ['CBDC', 'Regulation'],
    image: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?ixlib=rb-4.0.3'
  },
  {
    id: '5',
    title: 'DeFi Protocol Reports Record User Growth Amid Bullish Market Conditions',
    source: 'DeFi Pulse',
    date: '2025-04-01T07:00:00Z',
    url: 'https://defipulse.com',
    content: 'Decentralized finance applications are seeing significant user onboarding.',
    tags: ['DeFi', 'Growth'],
    image: 'https://images.unsplash.com/photo-1620808341953-ce24cc5d80a1?ixlib=rb-4.0.3'
  },
  {
    id: '6',
    title: 'NFT Market Shows Signs of Recovery After Q1 Slowdown',
    source: 'NFT Insider',
    date: '2025-04-01T06:30:00Z',
    url: 'https://nftinsider.io',
    content: 'Non-fungible token sales volume is increasing after a slow start to the year.',
    tags: ['NFT', 'Market'],
    image: 'https://images.unsplash.com/photo-1645213584659-9f2b02bff2df?ixlib=rb-4.0.3'
  },
];

// Fixed news images for various sources
const newsSourceImages: Record<string, string> = {
  'coindesk': 'https://images.cryptocompare.com/news/default/coindesk.png',
  'cointelegraph': 'https://images.cryptocompare.com/news/default/cointelegraph.png', 
  'bitcoin': 'https://images.cryptocompare.com/news/default/bitcoin.png',
  'bloomberg': 'https://logowik.com/content/uploads/images/bloomberg6513.jpg',
  'cnbc': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/CNBC_logo.svg',
  'reuters': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Reuters_logo.svg/1280px-Reuters_logo.svg.png',
  'yahoo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Yahoo_Finance_Logo_2021.svg/1024px-Yahoo_Finance_Logo_2021.svg.png',
  'decrypt': 'https://cdn.prod.website-files.com/5f7351fae9007c3c137f2c38/5f7351fae9007cc2137f2f54_decrypt-logo.svg',
  'cryptonews': 'https://assets-global.website-files.com/62b5827cf303c7594b1a8b6e/62bd5c5e0edbb6c60dd96387_Logo.png',
  'defi pulse': 'https://cryptologos.cc/logos/defichain-dfi-logo.png',
  'nft insider': 'https://cryptologos.cc/logos/enjincoin-enj-logo.png',
  'bloomberg crypto': 'https://logowik.com/content/uploads/images/bloomberg6513.jpg'
};

// Category-based fallback images
const categoryImages: Record<string, string> = {
  'crypto': 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'defi': 'https://images.unsplash.com/photo-1620808341953-ce24cc5d80a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'nft': 'https://images.unsplash.com/photo-1645213584659-9f2b02bff2df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'market': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'finance': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'bitcoin': 'https://images.unsplash.com/photo-1543699565-003b8adda5fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'ethereum': 'https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
};

// Default image (reliable)
const defaultNewsImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const getNewsImage = (item: any, seed: number) => {
  // Try to extract domain from URL to use for image sourcing
  try {
    // Check if the source provides images
    if (item.metadata && item.metadata.image) {
      return item.metadata.image;
    }
    
    const sourceLower = (item.source?.title || '').toLowerCase();
    
    // Handle exact source matches for problem cases
    if (sourceLower === 'defi pulse') {
      return 'https://cryptologos.cc/logos/defichain-dfi-logo.png';
    }
    
    if (sourceLower === 'nft insider') {
      return 'https://cryptologos.cc/logos/enjincoin-enj-logo.png';
    }
    
    if (sourceLower === 'bloomberg crypto') {
      return 'https://logowik.com/content/uploads/images/bloomberg6513.jpg';
    }
    
    if (sourceLower === 'cryptonews') {
      return 'https://assets-global.website-files.com/62b5827cf303c7594b1a8b6e/62bd5c5e0edbb6c60dd96387_Logo.png';
    }
    
    // Try to get the domain
    let domain = '';
    try {
      domain = new URL(item.url).hostname.toLowerCase();
    } catch (e) {
      // URL parsing failed, continue with other checks
    }
    
    // Check for source name matches
    for (const [key, imageUrl] of Object.entries(newsSourceImages)) {
      if (sourceLower.includes(key) || domain.includes(key)) {
        return imageUrl;
      }
    }
    
    // Check for tags/categories
    if (item.currencies && item.currencies.length > 0) {
      const tag = item.currencies[0].title.toLowerCase();
      if (tag === 'btc' || tag === 'bitcoin') {
        return categoryImages.bitcoin;
      } else if (tag === 'eth' || tag === 'ethereum') {
        return categoryImages.ethereum;
      }
    }
    
    // Check title for keywords
    const title = item.title.toLowerCase();
    for (const [key, imageUrl] of Object.entries(categoryImages)) {
      if (title.includes(key)) {
        return imageUrl;
      }
    }
    
    // Fallback to default image
    return defaultNewsImage;
  } catch (error) {
    // If URL parsing fails, use generic image
    return defaultNewsImage;
  }
};

// Utility function to sort news items by date (most recent first)
const sortNewsByDate = (news: NewsItem[]): NewsItem[] => {
  return [...news].sort((a, b) => {
    // Try to parse the dates
    try {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      // If both dates are valid, sort by date (most recent first)
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateB - dateA;
      }
    } catch (error) {
      console.warn('Error sorting dates:', error);
    }
    
    // If date parsing fails, keep original order
    return 0;
  });
};

export const fetchNews = async (limit: number = 5): Promise<NewsItem[]> => {
  try {
    // Using a proxy or CORS-anywhere service might help with CORS issues
    const response = await fetch(`${BASE_URL}/posts/?auth_token=${API_KEY}&public=true&limit=${limit}`, {
      headers: {
        'Accept': 'application/json',
      },
      // Adding a slightly longer timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      console.warn(`News API returned status: ${response.status}. Using fallback data.`);
      return sortNewsByDate(fallbackNewsData).slice(0, limit);
    }
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      console.warn('News API returned empty or invalid results. Using fallback data.');
      return sortNewsByDate(fallbackNewsData).slice(0, limit);
    }
    
    const newsItems = data.results.map((item: any, index: number) => {
      // Use source domain or title as seed for consistent images
      const imageId = Math.floor(Math.random() * 1000) + index;
      
      return {
        id: item.id.toString(),
        title: item.title,
        source: item.source?.title || 'Crypto News',
        date: item.published_at,
        url: item.url,
        content: item.body || item.title,
        tags: item.currencies?.map((c: any) => c.title) || [],
        image: getNewsImage(item, imageId)
      };
    });
    
    // Sort news items by date before returning
    return sortNewsByDate(newsItems).slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch news:', error);
    // Return fallback data in case of any error
    return sortNewsByDate(fallbackNewsData).slice(0, limit);
  }
};

export const fetchNewsByCategory = async (category: string, limit: number = 10): Promise<NewsItem[]> => {
  try {
    let filter = '';
    if (category && category !== 'All') {
      filter = `&currencies=${category.toLowerCase()}`;
    }
    
    // Using a proxy or CORS-anywhere service might help with CORS issues
    const response = await fetch(`${BASE_URL}/posts/?auth_token=${API_KEY}&public=true&limit=${limit}${filter}`, {
      headers: {
        'Accept': 'application/json',
      },
      // Adding a slightly longer timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      console.warn(`News by category API returned status: ${response.status}. Using fallback data.`);
      const filteredNews = fallbackNewsData
        .filter(item => !category || category === 'All' || 
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))));
      
      return sortNewsByDate(filteredNews).slice(0, limit);
    }
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      console.warn('News by category API returned empty results. Using fallback data.');
      const filteredNews = fallbackNewsData
        .filter(item => !category || category === 'All' || 
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))));
      
      return sortNewsByDate(filteredNews).slice(0, limit);
    }
    
    const newsItems = data.results.map((item: any, index: number) => {
      // Use consistent seed for each item
      const imageId = Math.floor(Math.random() * 1000) + index;
      
      return {
        id: item.id.toString(),
        title: item.title,
        source: item.source?.title || 'Crypto News',
        date: item.published_at,
        url: item.url,
        content: item.body || item.title,
        tags: item.currencies?.map((c: any) => c.title) || [],
        image: getNewsImage(item, imageId)
      };
    });
    
    // Sort news items by date before returning
    return sortNewsByDate(newsItems).slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch news by category:', error);
    // Return filtered fallback data in case of any error
    const filteredNews = fallbackNewsData
      .filter(item => !category || category === 'All' || 
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))));
    
    return sortNewsByDate(filteredNews).slice(0, limit);
  }
};
