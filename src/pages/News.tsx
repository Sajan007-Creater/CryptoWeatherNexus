import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import NewsCard from '../components/NewsCard';
import { Search } from 'lucide-react';
import { fetchNews, fetchNewsByCategory, NewsItem } from '../utils/newsApi';
import { toast } from '@/components/ui/use-toast';

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch news data
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        let newsData: NewsItem[];
        
        if (activeTag) {
          newsData = await fetchNewsByCategory(activeTag);
        } else {
          newsData = await fetchNews(10);
        }
        
        setAllNews(newsData);
        
        // Extract unique tags from all news articles
        const tags = Array.from(new Set(newsData.flatMap(news => news.tags || [])));
        setAllTags(tags);
      } catch (error) {
        console.error('Error fetching news:', error);
        toast({
          title: "News data error",
          description: "Failed to fetch news data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
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

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container mx-auto pt-24 pb-12 px-4">
        <h1 className="text-4xl font-bold text-gradient text-shadow-lg bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm mb-8">Crypto News</h1>
        
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
