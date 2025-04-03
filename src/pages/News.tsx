import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import NewsCard from '../components/NewsCard';
import { Search, RefreshCcw } from 'lucide-react';
import { fetchNews, fetchNewsByCategory, NewsItem } from '../utils/newsApi';
import { toast } from '@/components/ui/use-toast';

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Utility function to sort news by date
  const sortNewsByDate = (newsItems: NewsItem[]): NewsItem[] => {
    return [...newsItems].sort((a, b) => {
      try {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        
        return dateB - dateA; // Most recent first
      } catch (error) {
        console.warn('Error sorting dates:', error);
        return 0;
      }
    });
  };
  
  // Function to fetch news data
  const fetchNewsData = async () => {
    try {
      setLoading(true);
      let newsData: NewsItem[];
      
      if (activeTag) {
        newsData = await fetchNewsByCategory(activeTag, 10); // Get top 10 news items by category
      } else {
        newsData = await fetchNews(10); // Get top 10 news items
      }
      
      // Double-check that news is sorted by date (most recent first)
      // Even though our API utils should already sort, we ensure it here
      const sortedNewsData = sortNewsByDate(newsData);
      setAllNews(sortedNewsData);
      
      // Extract unique tags from all news articles
      const tags = Array.from(new Set(sortedNewsData.flatMap(news => news.tags || [])));
      setAllTags(tags);
      
      // Update last refreshed timestamp
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "News data error",
        description: "Failed to fetch news data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNewsData();
  };
  
  // Fetch news data when component mounts or tag changes
  useEffect(() => {
    // Initial fetch
    fetchNewsData();
    
    // Set up daily refresh for news (86400000 ms = 24 hours)
    const newsRefreshInterval = setInterval(fetchNewsData, 86400000);
    
    // Clean up interval on component unmount
    return () => {
      clearInterval(newsRefreshInterval);
    };
  }, [activeTag]);
  
  const handleTagClick = async (tag: string | null) => {
    setActiveTag(tag);
  };
  
  const filteredNews = allNews.filter(news => {
    return searchTerm.length === 0 || 
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (news.content && news.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      news.source.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Format last updated time
  const formatLastUpdated = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return lastUpdated.toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto pt-24 pb-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-4xl font-bold text-gradient text-shadow-lg bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm">Crypto News</h1>
          
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-sm text-gray-500 mr-3">Last updated: {formatLastUpdated()}</span>
            <button 
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="glass-card p-4 flex items-center">
            <Search size={20} className="text-gray-400 dark-mode:text-gray-500 mr-3" />
            <input
              type="text"
              placeholder="Search for news..."
              className="bg-transparent w-full focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button 
            className={`px-3 py-1 rounded-full text-sm ${
              !activeTag ? 'bg-purple-100 text-purple-700 dark-mode:bg-purple-900 dark-mode:text-purple-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark-mode:bg-gray-800 dark-mode:text-gray-300 dark-mode:hover:bg-gray-700'
            }`}
            onClick={() => handleTagClick(null)}
          >
            All
          </button>
          
          {allTags.map(tag => (
            <button 
              key={tag}
              className={`px-3 py-1 rounded-full text-sm ${
                activeTag === tag ? 'bg-purple-100 text-purple-700 dark-mode:bg-purple-900 dark-mode:text-purple-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark-mode:bg-gray-800 dark-mode:text-gray-300 dark-mode:hover:bg-gray-700'
              }`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        
        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="glass-card animate-pulse">
                <div className="h-40 bg-gray-200 dark-mode:bg-gray-700 rounded-t-2xl"></div>
                <div className="p-5">
                  <div className="w-full h-5 bg-gray-200 dark-mode:bg-gray-700 rounded mb-2"></div>
                  <div className="w-4/5 h-5 bg-gray-200 dark-mode:bg-gray-700 rounded mb-4"></div>
                  <div className="flex justify-between mt-4">
                    <div className="w-16 h-4 bg-gray-200 dark-mode:bg-gray-700 rounded"></div>
                    <div className="w-24 h-4 bg-gray-200 dark-mode:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((news) => (
              <NewsCard
                key={news.id}
                title={news.title}
                source={news.source}
                date={news.date}
                url={news.url}
                image={news.image}
              />
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-12 glass-card">
            <h3 className="text-xl font-medium mb-2">No news found</h3>
            <p className="text-gray-600 dark-mode:text-gray-300">Try changing your search term or filter</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default NewsPage;
