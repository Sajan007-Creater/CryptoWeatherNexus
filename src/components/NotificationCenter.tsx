import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { Bell, X, Check, ChevronDown, ChevronUp, AlertTriangle, Droplets, Thermometer, Wind, DollarSign } from 'lucide-react';
import { 
  markAsRead, 
  markAllAsRead, 
  clearNotification, 
  clearAllNotifications,
  clearNotificationsByType 
} from '../store/slices/notificationSlice';
import { format } from 'date-fns';

const NotificationCenter = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(state => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  
  // Auto-close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const notificationCenter = document.getElementById('notification-center');
      
      if (notificationCenter && !notificationCenter.contains(target) && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
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
  
  const handleDismissNotification = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(clearNotification(id));
  };
  
  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };
  
  const handleClearByType = (type: 'price_alert' | 'weather_alert' | 'system_alert') => {
    dispatch(clearNotificationsByType(type));
  };
  
  const formatTimestamp = (timestamp: number): string => {
    return format(new Date(timestamp), 'h:mm a');
  };
  
  const getIconForNotification = (type: string, subtype?: string) => {
    if (type === 'weather_alert') {
      switch (subtype) {
        case 'storm':
          return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        case 'flood':
          return <Droplets className="h-5 w-5 text-blue-500" />;
        case 'heat':
          return <Thermometer className="h-5 w-5 text-red-500" />;
        case 'cold':
          return <Thermometer className="h-5 w-5 text-blue-300" />;
        case 'wind':
          return <Wind className="h-5 w-5 text-gray-500" />;
        default:
          return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      }
    } else if (type === 'price_alert') {
      return <DollarSign className="h-5 w-5 text-green-500" />;
    } else {
      return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getBackgroundForPriority = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20';
      case 'low':
      default:
        return 'bg-gray-50 dark:bg-gray-800 dark:bg-opacity-20';
    }
  };
  
  return (
    <div id="notification-center" className="relative z-50">
      {/* Bell icon with unread count */}
      <button 
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden z-50">
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex space-x-2">
              <button 
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={notifications.length === 0}
              >
                Clear All
              </button>
              {unreadCount > 0 && (
                <button 
                  onClick={() => dispatch(markAllAsRead())}
                  className="flex items-center text-xs text-blue-500 hover:text-blue-700"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </button>
              )}
            </div>
          </div>
          
          {/* Filter options */}
          <div className="p-2 border-b dark:border-gray-700 flex justify-between items-center text-xs">
            <button 
              onClick={() => handleClearByType('price_alert')}
              className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Clear Price Alerts
            </button>
            <button 
              onClick={() => handleClearByType('weather_alert')}
              className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Clear Weather Alerts
            </button>
          </div>
          
          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-10' : getBackgroundForPriority(notification.priority)}`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getIconForNotification(notification.type, notification.data?.alertType || notification.data?.cryptoId)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          <button
                            onClick={(e) => handleDismissNotification(notification.id, e)}
                            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            aria-label="Dismiss notification"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                          <span>{formatTimestamp(notification.timestamp)}</span>
                          <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-2 border-t dark:border-gray-700 text-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 