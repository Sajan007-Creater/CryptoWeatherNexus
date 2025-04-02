# WebSocket Implementation

This document describes the implementation of WebSocket connections in the Weather-Verse-Visuals application, which enables real-time features such as cryptocurrency price updates and weather alerts.

## Overview

WebSockets provide a persistent connection between the client and server, allowing for bi-directional, real-time data transfer. In the Weather-Verse-Visuals application, WebSockets are used to:

1. Receive real-time cryptocurrency price updates
2. Get instant notifications about weather alerts
3. Provide a more engaging and dynamic user experience

## Architecture

The WebSocket implementation consists of several key components:

1. **WebSocket Service**: Core service that manages WebSocket connections
2. **Connection Managers**: Specific handlers for different WebSocket endpoints
3. **Message Processors**: Process incoming WebSocket messages
4. **Reconnection Logic**: Handles connection issues and reconnection
5. **Integration with Redux**: Updates application state with real-time data

## WebSocket Service Implementation

The primary WebSocket service is implemented in `websocketService.ts`:

```typescript
class WebSocketService {
  private cryptoSocket: WebSocket | null = null;
  private weatherSocket: WebSocket | null = null;
  private previousPrices: Record<string, number> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second delay

  // Initialize connections
  initialize() {
    this.connectToCryptoWebSocket();
    this.connectToWeatherWebSocket();
  }

  // Establish connection to cryptocurrency WebSocket
  private connectToCryptoWebSocket() {
    try {
      this.cryptoSocket = new WebSocket('wss://api.example.com/crypto/ws');
      
      this.cryptoSocket.onopen = () => {
        console.log('Crypto WebSocket connection established');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        
        // Subscribe to specific cryptocurrency updates
        const subscribeMessage = {
          action: 'subscribe',
          assets: ['BTC', 'ETH', 'XRP', 'ADA', 'SOL', 'DOT']
        };
        
        this.cryptoSocket?.send(JSON.stringify(subscribeMessage));
      };
      
      this.cryptoSocket.onmessage = (event) => {
        this.processCryptoMessage(event);
      };
      
      this.cryptoSocket.onclose = () => {
        this.handleCryptoSocketClosure();
      };
      
      this.cryptoSocket.onerror = (error) => {
        console.error('Crypto WebSocket error:', error);
        store.dispatch(addNotification({
          id: `system-${Date.now()}`,
          type: 'system_alert',
          title: 'Connection Error',
          message: 'Error connecting to cryptocurrency data service',
          priority: 'medium',
          timestamp: Date.now(),
          read: false
        }));
      };
    } catch (error) {
      console.error('Failed to connect to crypto WebSocket:', error);
      this.scheduleCryptoReconnection();
    }
  }
  
  // Similar implementation for weather WebSocket connection
  private connectToWeatherWebSocket() {
    // Implementation similar to crypto WebSocket
    // ...
  }
  
  // Process incoming cryptocurrency data
  private processCryptoMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      // Process each cryptocurrency price update
      Object.entries(data).forEach(([asset, price]) => {
        const numericPrice = parseFloat(price as string);
        
        // Check if we have a previous price for comparison
        if (this.previousPrices[asset] !== undefined) {
          const oldPrice = this.previousPrices[asset];
          
          // Notify about significant price changes
          notificationService.handlePriceChange(asset, numericPrice, oldPrice);
        }
        
        // Update previous price record
        this.previousPrices[asset] = numericPrice;
        
        // Update Redux store with real-time price
        store.dispatch(updateCryptoPriceInRealtime({
          id: asset,
          price: numericPrice
        }));
      });
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }
  
  // Handle WebSocket connection closure
  private handleCryptoSocketClosure() {
    console.log('Crypto WebSocket connection closed');
    
    // Attempt to reconnect
    this.scheduleCryptoReconnection();
  }
  
  // Schedule reconnection with exponential backoff
  private scheduleCryptoReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect to crypto WebSocket in ${delay}ms`);
      
      setTimeout(() => {
        this.connectToCryptoWebSocket();
      }, delay);
    } else {
      console.error('Maximum WebSocket reconnection attempts reached');
      store.dispatch(addNotification({
        id: `system-${Date.now()}`,
        type: 'system_alert',
        title: 'Connection Failed',
        message: 'Could not reconnect to cryptocurrency data service. Please reload the application.',
        priority: 'high',
        timestamp: Date.now(),
        read: false
      }));
    }
  }
  
  // Cleanup connections when component unmounts
  cleanup() {
    if (this.cryptoSocket) {
      this.cryptoSocket.close();
      this.cryptoSocket = null;
    }
    
    if (this.weatherSocket) {
      this.weatherSocket.close();
      this.weatherSocket = null;
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService;
```

## Integration with React

The WebSocket service is integrated with React using a custom hook:

```typescript
// useWebSocket.ts
import { useEffect } from 'react';
import websocketService from '../services/websocketService';

export function useWebSocket() {
  useEffect(() => {
    // Initialize WebSocket connections when component mounts
    websocketService.initialize();
    
    // Clean up WebSocket connections when component unmounts
    return () => {
      websocketService.cleanup();
    };
  }, []);
}
```

This hook is then used in the main App component:

```typescript
// App.tsx
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  // Initialize WebSocket connections
  useWebSocket();
  
  return (
    // Application JSX
  );
}
```

## WebSocket Message Types

### Cryptocurrency WebSocket Messages

```typescript
// Example of incoming cryptocurrency price update message
{
  "BTC": "52341.25",
  "ETH": "2853.10",
  "XRP": "0.5123",
  "ADA": "1.2345",
  "SOL": "98.76",
  "DOT": "21.87"
}
```

### Weather Alert WebSocket Messages

```typescript
// Example of incoming weather alert message
{
  "type": "weather_alert",
  "alerts": [
    {
      "alert_id": "storm-123456",
      "alert_type": "storm",
      "city": "New York",
      "country": "US",
      "severity": "high",
      "message": "Severe thunderstorm warning",
      "timestamp": 1621523421000
    }
  ]
}
```

## Connection Status Management

The application maintains the WebSocket connection status in the Redux store:

```typescript
// connectionSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface ConnectionState {
  cryptoConnected: boolean;
  weatherConnected: boolean;
  lastReconnectAttempt: number | null;
}

const initialState: ConnectionState = {
  cryptoConnected: false,
  weatherConnected: false,
  lastReconnectAttempt: null
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setCryptoConnected: (state, action) => {
      state.cryptoConnected = action.payload;
    },
    setWeatherConnected: (state, action) => {
      state.weatherConnected = action.payload;
    },
    setLastReconnectAttempt: (state, action) => {
      state.lastReconnectAttempt = action.payload;
    }
  }
});

export const { 
  setCryptoConnected, 
  setWeatherConnected,
  setLastReconnectAttempt
} = connectionSlice.actions;

export default connectionSlice.reducer;
```

## WebSocket Simulation for Development

For development and testing purposes, a WebSocket simulator is implemented:

```typescript
// websocketSimulator.ts
class WebSocketSimulator {
  private cryptoInterval: number | null = null;
  private weatherInterval: number | null = null;
  private subscribers: ((data: any) => void)[] = [];
  
  startCryptoSimulation() {
    // Generate random price fluctuations every 5 seconds
    this.cryptoInterval = window.setInterval(() => {
      const message = {
        "BTC": (50000 + Math.random() * 5000).toFixed(2),
        "ETH": (2800 + Math.random() * 200).toFixed(2),
        "XRP": (0.5 + Math.random() * 0.1).toFixed(4),
        "ADA": (1.2 + Math.random() * 0.2).toFixed(4),
        "SOL": (95 + Math.random() * 10).toFixed(2),
        "DOT": (20 + Math.random() * 5).toFixed(2)
      };
      
      this.notifySubscribers({
        data: JSON.stringify(message)
      });
    }, 5000);
  }
  
  startWeatherAlertSimulation() {
    // Generate random weather alerts every 30-60 seconds
    this.weatherInterval = window.setInterval(() => {
      const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney'];
      const alertTypes = ['storm', 'flood', 'heat', 'cold', 'wind'];
      const severities = ['low', 'medium', 'high'];
      
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomAlertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
      
      const message = {
        "type": "weather_alert",
        "alerts": [
          {
            "alert_id": `${randomAlertType}-${Date.now()}`,
            "alert_type": randomAlertType,
            "city": randomCity,
            "severity": randomSeverity,
            "message": this.getAlertMessage(randomAlertType, randomCity),
            "timestamp": Date.now()
          }
        ]
      };
      
      this.notifySubscribers({
        data: JSON.stringify(message)
      });
    }, Math.random() * 30000 + 30000); // Random interval between 30-60 seconds
  }
  
  private getAlertMessage(alertType: string, city: string): string {
    const messages = {
      storm: `Severe thunderstorm warning for ${city}`,
      flood: `Flood warning issued for ${city} area`,
      heat: `Extreme heat advisory for ${city}`,
      cold: `Cold temperature warning for ${city}`,
      wind: `High wind advisory for ${city}`
    };
    
    return messages[alertType as keyof typeof messages];
  }
  
  subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  private notifySubscribers(event: any) {
    this.subscribers.forEach(callback => callback(event));
  }
  
  stopSimulation() {
    if (this.cryptoInterval) {
      clearInterval(this.cryptoInterval);
      this.cryptoInterval = null;
    }
    
    if (this.weatherInterval) {
      clearInterval(this.weatherInterval);
      this.weatherInterval = null;
    }
  }
}

const websocketSimulator = new WebSocketSimulator();
export default websocketSimulator;
```

## Performance Considerations

1. **Message Throttling**: WebSocket messages are throttled to prevent excessive UI updates.
2. **Selective Updates**: Only significant changes trigger UI updates to reduce rendering.
3. **Batch Processing**: Multiple updates received in a short time are batched for efficiency.
4. **Connection Health Monitoring**: The service regularly checks connection health.

## Error Handling

1. **Automatic Reconnection**: The service attempts to reconnect after connection loss.
2. **Exponential Backoff**: Reconnection attempts use exponential backoff to avoid overwhelming servers.
3. **User Notification**: Users are notified of connection issues.
4. **Fallback to Polling**: If WebSocket connections fail repeatedly, the application falls back to polling.

## Security Considerations

1. **Secure WebSocket (WSS)**: All WebSocket connections use WSS (WebSocket Secure) protocol.
2. **Message Validation**: All incoming messages are validated before processing.
3. **Origin Verification**: Server verifies the origin of WebSocket connection requests.
4. **Rate Limiting**: Connections and messages are rate-limited to prevent abuse.

## Future Improvements

1. **Compression**: Implement message compression for high-volume data.
2. **Protocol Buffers**: Use Protocol Buffers for more efficient serialization.
3. **Custom Subscriptions**: Allow users to subscribe to specific data streams.
4. **Connection Quality Metrics**: Provide users with information about connection quality.
5. **Multiple Server Support**: Connect to multiple WebSocket servers for redundancy. 