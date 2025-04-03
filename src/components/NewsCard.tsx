import { ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NewsCardProps {
  title: string;
  source: string;
  date: string;
  url: string;
  image?: string;
  className?: string;
}

const NewsCard = ({
  title,
  source,
  date,
  url,
  image,
  className = '',
}: NewsCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>('');
  
  useEffect(() => {
    // Format the date when the component mounts or when date prop changes
    setFormattedDate(formatDate(date));
  }, [date]);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    
    try {
      // Try to parse the date string
      const dateObj = new Date(dateString);
      
      // Check if the date is valid
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('en-US', options);
      }
      
      // Try parsing without timezone
      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0];
        const parsedDate = new Date(datePart);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString('en-US', options);
        }
      }
      
      // Return original string if parsing fails
      return dateString;
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

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

  // Fallback images for different news categories
  const categoryImages: Record<string, string> = {
    'crypto': 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'defi': 'https://images.unsplash.com/photo-1620808341953-ce24cc5d80a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'nft': 'https://images.unsplash.com/photo-1645213584659-9f2b02bff2df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'market': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'finance': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'bitcoin': 'https://images.unsplash.com/photo-1543699565-003b8adda5fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'ethereum': 'https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  };

  // Default image that always works
  const defaultNewsImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  // Fallback image based on source
  const getSourceImage = () => {
    const sourceLower = source.toLowerCase();
    
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
    
    // Check for source name matches
    for (const [key, imageUrl] of Object.entries(newsSourceImages)) {
      if (sourceLower.includes(key)) {
        return imageUrl;
      }
    }
    
    // Check title for category keywords
    const titleLower = title.toLowerCase();
    for (const [key, imageUrl] of Object.entries(categoryImages)) {
      if (titleLower.includes(key) || sourceLower.includes(key)) {
        return imageUrl;
      }
    }
    
    // Default news image
    return defaultNewsImage;
  };

  const handleSecondaryImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // If even the source-based image fails, use the default image
    e.currentTarget.src = defaultNewsImage;
    // Remove error handler to prevent infinite loop
    e.currentTarget.onerror = null;
  };

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`block ${className}`}
    >
      <div className="glass-card h-full">
        <div className="flex flex-col h-full">
          {image && !imageError ? (
            <div className="h-40 overflow-hidden rounded-t-2xl">
              <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="h-40 overflow-hidden rounded-t-2xl bg-gradient-to-br from-purple-200 to-indigo-100 dark-mode:from-purple-900 dark-mode:to-indigo-950 flex items-center justify-center">
              <img 
                src={getSourceImage()} 
                alt={source}
                className={`w-full h-full ${['DeFi Pulse', 'NFT Insider', 'Bloomberg Crypto'].includes(source) ? 'object-contain p-4 bg-white dark-mode:bg-gray-800' : 'object-cover'}`}
                onError={handleSecondaryImageError}
                loading="lazy"
              />
            </div>
          )}
          
          <div className="p-5 flex flex-col h-full">
            <h3 className="text-lg font-medium line-clamp-2 mb-2">{title}</h3>
            
            <div className="mt-auto flex justify-between items-center text-sm">
              <p className="text-gray-600 dark-mode:text-gray-300">{source}</p>
              <div className="flex items-center gap-1 text-primary-foreground">
                <span>{formattedDate}</span>
                <ExternalLink size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};

export default NewsCard;
