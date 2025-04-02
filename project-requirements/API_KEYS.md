# API Key Management

This document outlines how API keys are securely managed in the Weather-Verse-Visuals application.

## Environment Variables

API keys are stored in environment variables using the standard Vite approach with a `.env` file. This ensures:

1. **Security**: API keys are not hardcoded in the source code
2. **Version Control Safety**: Keys are not committed to the repository
3. **Environment-specific Configuration**: Different keys can be used for development, testing, and production

## Implementation

The following API keys are required for the application to function properly:

| API | Environment Variable | Purpose |
|-----|---------------------|---------|
| Weather API | `VITE_WEATHER_API_KEY` | Access to weather data and forecasts |
| Crypto API | `VITE_CRYPTO_API_KEY` | Cryptocurrency price data and market information |
| News API | `VITE_NEWS_API_KEY` | Fetching crypto and financial news |

## Setting Up Environment Variables

1. Create a `.env` file in the root directory of the project
2. Add your API keys in the following format:
   ```
   VITE_WEATHER_API_KEY=your_weather_api_key
   VITE_CRYPTO_API_KEY=your_crypto_api_key
   VITE_NEWS_API_KEY=your_news_api_key
   ```
3. Restart the development server for the changes to take effect

## Example Configuration

An `.env.example` file is provided with the project as a template. Copy this file to create your own `.env` file:

```bash
cp .env.example .env
```

Then edit the `.env` file to include your actual API keys.

## Security Considerations

- **Never commit your `.env` file to version control**
- The `.env` file is listed in `.gitignore` to prevent accidental commits
- For production deployments, set environment variables through your hosting platform's secure environment configuration
- API keys with front-end exposure should have appropriate rate limiting and domain restrictions where possible

## Error Handling

The application includes error handling for missing API keys:

1. Console warnings will appear if API keys are missing
2. Graceful UI fallbacks are implemented for API request failures
3. User-friendly error messages guide users when services are unavailable

## Production Deployment

For production environments, set environment variables through your hosting platform:

- **Vercel**: Add environment variables in the project settings
- **Netlify**: Configure environment variables in the site settings
- **AWS/GCP/Azure**: Use their respective secrets management systems

## Getting API Keys

To obtain API keys for development:

1. **Weather API**: Register at [WeatherAPI.com](https://www.weatherapi.com/)
2. **Crypto API**: Sign up at [CryptoCompare](https://min-api.cryptocompare.com/)
3. **News API**: Register at [CryptoPanic](https://cryptopanic.com/developers/api/) 