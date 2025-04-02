// Weather State Types
export interface WeatherData {
  cityId: string;
  cityName: string;
  temperature?: number;
  conditions?: string;
  forecast?: any[];
  loading: boolean;
  error: string | null;
}

export interface WeatherState {
  currentWeather: WeatherData | null;
  cities: WeatherData[];
  alerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
}

// Crypto State Types
export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price?: number;
  change24h?: number;
  marketCap?: number;
  volume24h?: number;
  image?: string;
}

export interface CryptoState {
  cryptocurrencies: CryptoData[];
  selectedCrypto: CryptoData | null;
  loading: boolean;
  error: string | null;
}

// News State Types
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  source: string;
  category: string;
  publishedAt: string;
  url?: string;
  imageUrl?: string;
}

export interface NewsState {
  articles: NewsArticle[];
  selectedArticle: NewsArticle | null;
  categories: string[];
  loading: boolean;
  error: string | null;
}

// User Preferences Types
export interface UserPreferences {
  favoriteCities: string[];
  favoriteCryptos: string[];
  darkMode: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
  lastVisited: {
    city?: string;
    crypto?: string;
    news?: string;
  };
}

// Weather Alert Types
export type WeatherAlertType = 'storm' | 'flood' | 'heat' | 'cold' | 'wind';

export interface WeatherAlert {
  id: string;
  type: WeatherAlertType;
  cityId: string;
  cityName: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

// Notification Types
export type NotificationType = 'price_alert' | 'weather_alert' | 'system_alert';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: number;
  read: boolean;
  data?: any;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

// Root State Type
export interface RootState {
  weather: WeatherState;
  crypto: CryptoState;
  news: NewsState;
  userPreferences: UserPreferences;
  notifications: NotificationState;
} 