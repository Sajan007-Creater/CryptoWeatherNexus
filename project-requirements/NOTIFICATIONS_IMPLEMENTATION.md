# Real-Time Notifications

This document describes the implementation of real-time notifications in the Weather-Verse-Visuals application.

## Overview

The real-time notifications system provides timely updates to users about significant events related to cryptocurrency price changes and weather alerts. The system uses WebSocket connections to receive up-to-date information and displays notifications through both a centralized notification center and toast notifications.

## Architecture

The notification system consists of several key components:

1. **WebSocket Service**: Receives real-time data and triggers notification events
2. **Notification Service**: Processes events and creates standardized notification objects
3. **Redux Store**: Manages notification state, including read/unread status
4. **Notification Center**: UI component displaying all notifications
5. **Toast Notifications**: Transient notifications for high-priority events

## Notification Types

Each notification includes a `type` field that categorizes the notification:

- **`price_alert`**: Notifications related to cryptocurrency price changes
- **`weather_alert`**: Notifications related to weather events/alerts
- **`system_alert`**: System-related notifications (connections, errors, etc.)

## Implementation Details

### Notification Data Structure

```typescript
interface Notification {
  id: string;                      // Unique identifier
  type: NotificationType;          // 'price_alert' | 'weather_alert' | 'system_alert'
  title: string;                   // Short notification title
  message: string;                 // Detailed notification message
  priority: NotificationPriority;  // 'low' | 'medium' | 'high'
  timestamp: number;               // When the notification was created
  read: boolean;                   // Whether the user has seen the notification
  data?: any;                      // Additional data specific to notification type
}
```

### Notification Service

The `notificationService.ts` file manages the creation and processing of notifications:

```typescript
// Handle crypto price change notifications
handlePriceChange: (cryptoId: string, newPrice: number, oldPrice: number) => {
  // Calculate percentage change
  const percentChange = Math.abs(((newPrice - oldPrice) / oldPrice) * 100);
  const direction = newPrice > oldPrice ? 'increased' : 'decreased';
  
  // Determine priority based on thresholds
  let priority: NotificationPriority = 'low';
  if (percentChange >= PRICE_CHANGE_THRESHOLDS.high) {
    priority = 'high';
  } else if (percentChange >= PRICE_CHANGE_THRESHOLDS.medium) {
    priority = 'medium';
  } else if (percentChange >= PRICE_CHANGE_THRESHOLDS.low) {
    priority = 'low';
  } else {
    // Change is too small to notify
    return;
  }
  
  // Create and dispatch notification
  const notification: Notification = {
    id: `price-${cryptoId}-${Date.now()}`,
    type: 'price_alert',
    title: `${cryptoName} Price ${direction === 'increased' ? 'Up' : 'Down'}`,
    message: `${cryptoName} has ${direction} by ${percentChange.toFixed(2)}% to ${formattedPrice}`,
    priority,
    timestamp: Date.now(),
    read: false,
    data: { cryptoId, newPrice, oldPrice, percentChange, direction },
  };
  
  // Dispatch to store
  store.dispatch(addNotification(notification));
}
```

### Redux State Management

The notification state is managed in `notificationSlice.ts`:

```typescript
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add notification to the beginning of the array
      state.notifications.unshift(action.payload);
      
      // Limit the number of notifications to store
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
      
      // Increment unread count
      state.unreadCount += 1;
    },
    
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    // Additional reducers...
  }
});
```

### WebSocket Integration

The WebSocket service integrates with the notification system in `websocketServices.ts`:

```typescript
// Process cryptocurrency price updates from WebSocket
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
      
      // Update Redux store
      store.dispatch(updateCryptoPriceInRealtime({
        id: asset,
        price: numericPrice
      }));
    });
  } catch (error) {
    console.error('Error processing WebSocket message:', error);
  }
};
```

### UI Components

The notification center UI is implemented in `NotificationCenter.tsx`:

```tsx
const NotificationCenter = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(state => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  
  // JSX implementation with:
  // - Bell icon with unread count
  // - Dropdown panel of notifications
  // - Options to filter and clear notifications
  // - Individual notification display with proper icons and styling
};
```

## Thresholds and Triggers

### Price Alert Thresholds

Cryptocurrency price alerts are triggered based on the percentage change:

```typescript
const PRICE_CHANGE_THRESHOLDS = {
  low: 0.5,    // 0.5% change
  medium: 1.0, // 1.0% change
  high: 2.0,   // 2.0% change
};
```

### Weather Alert Triggers

Weather alerts are triggered by the weather alert simulation which generates random alerts at intervals between 30-60 seconds. Each alert includes:

- Alert type (storm, flood, heat, cold, wind)
- City affected
- Severity level (low, medium, high)
- Custom message based on the alert type

## Toast Integration

High and medium priority notifications are also displayed as toast notifications for immediate visibility:

```typescript
// Show toast for medium and high priority
if (priority === 'medium' || priority === 'high') {
  toast({
    title: notification.title,
    description: notification.message,
    variant: priority === 'high' ? 'destructive' : undefined,
  });
}
```

## User Experience

### Reading Notifications

Notifications are automatically marked as read when the notification center is opened:

```typescript
// Mark notifications as read when panel opens
useEffect(() => {
  if (isOpen && unreadCount > 0) {
    // Short delay to allow user to see the unread state first
    const timer = setTimeout(() => {
      dispatch(markAllAsRead());
    }, 2000);
    
    return () => clearTimeout(timer);
  }
}, [isOpen, unreadCount, dispatch]);
```

### Notification Management

Users can:
- View all notifications in the notification center
- Mark all notifications as read
- Clear individual notifications
- Clear all notifications
- Filter notifications by type (price alerts or weather alerts)

## Future Improvements

Potential enhancements to the notification system:

1. **User Preferences**: Allow users to customize notification types and thresholds
2. **Scheduled Notifications**: Add support for scheduled or recurring notifications
3. **Notification Categories**: More detailed categorization beyond the current types
4. **Push Notifications**: Browser or mobile push notifications for critical alerts
5. **Notification History**: Extended history with search and advanced filtering 