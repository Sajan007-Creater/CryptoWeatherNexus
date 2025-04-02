# CryptoWeatherNexus

![CryptoWeatherNexus Banner](https://raw.githubusercontent.com/Sajan007-Creater/assets/main/crypto-weather-nexus-banner.png)

A modern React application that combines real-time cryptocurrency tracking, weather forecasting, and news updates in one elegant dashboard.

## 🌟 Features

- **Real-time Cryptocurrency Tracking**: Live price updates, historical data, and price alerts
- **Weather Forecasting**: Current conditions, 5-day forecast, and severe weather alerts
- **News Aggregation**: Latest financial, technology, and global news
- **Smart Dashboard**: Customizable interface with widgets and dark/light mode
- **User Preferences**: Save favorite cities, cryptocurrencies, and news sources
- **Real-time Notifications**: Price alerts and severe weather warnings
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🚀 Live Demo

Check out the live application: [CryptoWeatherNexus](https://crypto-weather-nexus.vercel.app/)

## 🛠️ Technologies

- **Frontend**: React, Redux Toolkit, React Router, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **State Management**: Redux with Thunk middleware
- **API Integration**: RESTful API clients, WebSocket for real-time updates
- **Animation**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite for fast development and optimized builds

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sajan007-Creater/CryptoWeatherNexus.git
   cd CryptoWeatherNexus
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   VITE_WEATHER_API_KEY=your_weather_api_key
   VITE_CRYPTO_API_KEY=your_crypto_api_key
   VITE_NEWS_API_KEY=your_news_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and go to `http://localhost:5173`

## 📚 API References

This project uses the following APIs:

### Weather API
- [OpenWeatherMap API](https://openweathermap.org/api)
  - Usage: Weather forecasts, current conditions, and alerts
  - Documentation: [OpenWeatherMap API Docs](https://openweathermap.org/api)
  - Endpoints:
    - Current Weather: `/data/2.5/weather`
    - 5-Day Forecast: `/data/2.5/forecast`
    - Weather Alerts: `/data/2.5/onecall`

### Cryptocurrency API
- [CoinGecko API](https://www.coingecko.com/en/api)
  - Usage: Cryptocurrency prices, market data, and historical charts
  - Documentation: [CoinGecko API Docs](https://www.coingecko.com/api/documentation)
  - Endpoints:
    - Coin List: `/api/v3/coins/list`
    - Market Data: `/api/v3/coins/markets`
    - Historical Data: `/api/v3/coins/{id}/market_chart`

### News API
- [NewsAPI](https://newsapi.org/)
  - Usage: Latest news articles from various sources
  - Documentation: [NewsAPI Docs](https://newsapi.org/docs)
  - Endpoints:
    - Top Headlines: `/v2/top-headlines`
    - Everything: `/v2/everything`

## 🏗️ Project Structure

```
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── store/          # Redux store and slices
│   ├── utils/          # API clients and helpers
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── .env.example        # Example environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## 📱 Features in Detail

### Weather Dashboard
- Current weather conditions
- 5-day forecast with hourly breakdown
- Temperature, humidity, wind speed, and UV index
- Radar maps and precipitation forecasts
- Severe weather alerts and notifications

### Cryptocurrency Tracker
- Real-time price updates via WebSocket
- Historical price charts (1d, 1w, 1m, 1y)
- Portfolio tracking and performance metrics
- Price alerts and notifications
- Market trends and trading volume analysis

### News Aggregator
- Latest headlines from multiple sources
- Categorized news (finance, technology, world)
- Saved articles and reading history
- Custom news feeds based on user preferences

### User Preferences
- Dark/light mode toggle
- Favorite cities for weather
- Watchlist for cryptocurrencies
- Preferred news sources
- Unit preferences (°C/°F, km/h/mph)

## 🔄 State Management

The application uses Redux Toolkit for state management with the following slices:
- `weather`: Weather data and forecasts
- `crypto`: Cryptocurrency prices and historical data
- `news`: News articles and sources
- `userPreferences`: User settings and favorites
- `notifications`: System alerts and messages

## 🚢 Deployment

To deploy the application:

1. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- Keetha Sajan Sribalan
- GitHub: [@Sajan007-Creater](https://github.com/Sajan007-Creater)

## 🙏 Acknowledgements

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [CoinGecko](https://www.coingecko.com/) for cryptocurrency data
- [NewsAPI](https://newsapi.org/) for news data
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Shadcn/UI](https://ui.shadcn.com/) for UI components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Vercel](https://vercel.com/) for hosting 