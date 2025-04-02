import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationType } from '../../utils/notificationService';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add notification to the beginning of the array
      state.notifications.unshift(action.payload);
      
      // Limit the number of notifications to store (keep the 50 most recent)
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
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    
    clearNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    clearNotificationsByType: (state, action: PayloadAction<NotificationType>) => {
      const unreadToRemove = state.notifications.filter(
        n => n.type === action.payload && !n.read
      ).length;
      
      state.notifications = state.notifications.filter(
        n => n.type !== action.payload
      );
      
      state.unreadCount = Math.max(0, state.unreadCount - unreadToRemove);
    }
  }
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotification,
  clearAllNotifications,
  clearNotificationsByType
} = notificationSlice.actions;

export default notificationSlice.reducer; 