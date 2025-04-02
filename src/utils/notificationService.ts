import { toast } from '@/components/ui/use-toast';
import { store } from '../store';
import { addNotification } from '../store/slices/notificationSlice';

// Notification types
export type NotificationType = 'price_alert' | 'weather_alert' | 'system_alert';

// Notification priority
export type NotificationPriority = 'low' | 'medium' | 'high';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: number;
  read: boolean;
  data?: any; // Optional additional data
}

// Thresholds for price changes to trigger different alert levels
const PRICE_CHANGE_THRESHOLDS = {
  low: 0.5, // 0.5% change
  medium: 1.0, // 1% change
  high: 2.0, // 2% change
};

// Service to handle notifications
const notificationService = {
  // Handle crypto price change notifications
  handlePriceChange: (cryptoId: string, newPrice: number, oldPrice: number) => {
    // Calculate percentage change
    const percentChange = Math.abs(((newPrice - oldPrice) / oldPrice) * 100);
    const direction = newPrice > oldPrice ? 'increased' : 'decreased';
    
    // Determine if notification should be triggered based on threshold
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
    
    // Format crypto name and price for display
    const cryptoName = cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1);
    const formattedPrice = newPrice.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    
    // Create notification object
    const notification: Notification = {
      id: `price-${cryptoId}-${Date.now()}`,
      type: 'price_alert',
      title: `${cryptoName} Price ${direction === 'increased' ? 'Up' : 'Down'}`,
      message: `${cryptoName} has ${direction} by ${percentChange.toFixed(2)}% to ${formattedPrice}`,
      priority,
      timestamp: Date.now(),
      read: false,
      data: {
        cryptoId,
        newPrice,
        oldPrice,
        percentChange,
        direction,
      },
    };
    
    // Dispatch to store
    store.dispatch(addNotification(notification));
    
    // Show toast for medium and high priority
    if (priority === 'medium' || priority === 'high') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: priority === 'high' ? 'destructive' : undefined,
      });
    }
  },
  
  // Handle weather alert notifications
  handleWeatherAlert: (
    cityName: string,
    alertType: string,
    severity: NotificationPriority,
    message: string
  ) => {
    // Create notification object
    const notification: Notification = {
      id: `weather-${cityName}-${Date.now()}`,
      type: 'weather_alert',
      title: `Weather Alert: ${cityName}`,
      message: message || `${alertType} alert for ${cityName}`,
      priority: severity,
      timestamp: Date.now(),
      read: false,
      data: {
        cityName,
        alertType,
        severity,
      },
    };
    
    // Dispatch to store
    store.dispatch(addNotification(notification));
    
    // Show toast for all weather alerts
    toast({
      title: notification.title,
      description: notification.message,
      variant: severity === 'high' ? 'destructive' : undefined,
    });
  },
  
  // General system notification
  sendSystemNotification: (title: string, message: string, priority: NotificationPriority = 'medium') => {
    const notification: Notification = {
      id: `system-${Date.now()}`,
      type: 'system_alert',
      title,
      message,
      priority,
      timestamp: Date.now(),
      read: false,
    };
    
    // Dispatch to store
    store.dispatch(addNotification(notification));
    
    // Show toast for medium and high priority
    if (priority === 'medium' || priority === 'high') {
      toast({
        title,
        description: message,
        variant: priority === 'high' ? 'destructive' : undefined,
      });
    }
  },
  
  // Mark notification as read
  markAsRead: (notificationId: string) => {
    // This will be implemented in the notification slice
  },
  
  // Clear all notifications
  clearAllNotifications: () => {
    // This will be implemented in the notification slice
  },
};

export default notificationService; 