import { store } from '../store';
import { updateCryptoPriceInRealtime } from '../store/slices/cryptoSlice';
import { addWeatherAlert } from '../store/slices/weatherSlice';
import notificationService from './notificationService';

// CoinCap WebSocket API
const COINCAP_WS_URL = 'wss://ws.coincap.io/prices?assets=bitcoin,ethereum,ripple,cardano,solana,dogecoin,polkadot,tron';

interface WebSocketMessage {
  [key: string]: string; // Format: { "bitcoin": "29307.32", "ethereum": "1827.45", ... }
}

// Weather alert types for simulation
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

class WebSocketService {
  private cryptoSocket: WebSocket | null = null;
  private weatherAlertSimulator: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // Initial delay of 3 seconds
  
  // Store previous prices to calculate changes
  private previousPrices: Record<string, number> = {};
  
  // Initialize WebSocket connections
  initializeSockets() {
    this.connectCryptoWebSocket();
    this.startWeatherAlertSimulation();
    
    // Notify system when WebSocket is initialized
    notificationService.sendSystemNotification(
      "Real-time Updates Active",
      "You will now receive real-time updates for cryptocurrency prices and weather alerts.",
      'low'
    );
  }
  
  // Connect to CoinCap WebSocket for real-time cryptocurrency prices
  connectCryptoWebSocket() {
    try {
      this.cryptoSocket = new WebSocket(COINCAP_WS_URL);
      
      this.cryptoSocket.onopen = () => {
        console.log('Connected to CoinCap WebSocket');
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };
      
      this.cryptoSocket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          // Process each crypto price update
          Object.entries(data).forEach(([asset, price]) => {
            const numericPrice = parseFloat(price);
            
            // Check if we have a previous price for this asset
            if (this.previousPrices[asset] !== undefined) {
              const oldPrice = this.previousPrices[asset];
              
              // Send notification for price change
              notificationService.handlePriceChange(asset, numericPrice, oldPrice);
            }
            
            // Update previous price
            this.previousPrices[asset] = numericPrice;
            
            // Dispatch to Redux store to update the crypto prices
            store.dispatch(updateCryptoPriceInRealtime({
              id: asset, // e.g. 'bitcoin'
              price: numericPrice
            }));
          });
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      this.cryptoSocket.onerror = (error) => {
        console.error('CoinCap WebSocket error:', error);
      };
      
      this.cryptoSocket.onclose = () => {
        console.log('CoinCap WebSocket connection closed');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to connect to CoinCap WebSocket:', error);
      this.attemptReconnect();
    }
  }
  
  // Attempt to reconnect with exponential backoff
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connectCryptoWebSocket();
      }, delay);
    } else {
      console.error('Maximum reconnect attempts reached. Please refresh the page.');
      
      // Send notification about connection failure
      notificationService.sendSystemNotification(
        "Connection Lost",
        "Could not reconnect to real-time price updates. Please refresh the page.",
        'high'
      );
    }
  }
  
  // Simulate weather alerts by dispatching mock events
  startWeatherAlertSimulation() {
    const cities = [
      { id: 'london-uk', name: 'London' },
      { id: 'new-york-us', name: 'New York' },
      { id: 'tokyo-jp', name: 'Tokyo' },
      { id: 'sydney-au', name: 'Sydney' },
      { id: 'paris-fr', name: 'Paris' }
    ];
    
    const alertTypes: WeatherAlertType[] = ['storm', 'flood', 'heat', 'cold', 'wind'];
    const severityLevels = ['low', 'medium', 'high'];
    
    const getAlertMessage = (type: WeatherAlertType, cityName: string): string => {
      switch (type) {
        case 'storm':
          return `Thunderstorm warning for ${cityName}. Seek shelter immediately.`;
        case 'flood':
          return `Flood alert for ${cityName}. Avoid low-lying areas.`;
        case 'heat':
          return `Extreme heat warning for ${cityName}. Stay hydrated and avoid outdoor activities.`;
        case 'cold':
          return `Extreme cold alert for ${cityName}. Be aware of potential freezing conditions.`;
        case 'wind':
          return `High wind advisory for ${cityName}. Secure loose outdoor items.`;
        default:
          return `Weather alert for ${cityName}. Check local forecast for details.`;
      }
    };
    
    // Generate a random alert every 30-60 seconds
    this.weatherAlertSimulator = setInterval(() => {
      // Randomly select a city
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      // Randomly select an alert type
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      // Randomly select a severity level
      const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)] as 'low' | 'medium' | 'high';
      
      // Get the alert message
      const message = getAlertMessage(alertType, city.name);
      
      // Create the alert
      const alert: WeatherAlert = {
        id: `alert-${Date.now()}`,
        type: alertType,
        cityId: city.id,
        cityName: city.name,
        message,
        severity,
        timestamp: Date.now()
      };
      
      // Dispatch the alert to Redux
      store.dispatch(addWeatherAlert(alert));
      
      // Send notification for the weather alert
      notificationService.handleWeatherAlert(
        city.name,
        alertType,
        severity,
        message
      );
      
      console.log('Weather alert simulated:', alert);
    }, Math.random() * 30000 + 30000); // Random interval between 30-60 seconds
  }
  
  // Clean up WebSocket connections and simulations
  cleanup() {
    if (this.cryptoSocket) {
      this.cryptoSocket.close();
      this.cryptoSocket = null;
    }
    
    if (this.weatherAlertSimulator) {
      clearInterval(this.weatherAlertSimulator);
      this.weatherAlertSimulator = null;
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService; 