"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth';

// Define notification type
export interface Notification {
  id: string;
  type: 'SystemUpdate' | 'BookingConfirmation' | 'Cancellation' | 'Reminder';
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// Context interface
interface NotificationsContextProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

// Create the context
const NotificationsContext = createContext<NotificationsContextProps | undefined>(undefined);

// Provider component
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Fetch all notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth('/api/notification');
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch notifications' }));
        setError(errorData.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetchWithAuth(`/api/notification/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true } 
              : notification
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // We'll use a Promise.all to make multiple requests for marking all as read
      await Promise.all(
        notifications
          .filter(notification => !notification.read)
          .map(notification => 
            fetchWithAuth(`/api/notification/${notification.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ read: true }),
            })
          )
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Load notifications on mount
  useEffect(() => {
    // Only fetch if we're mounted
    fetchNotifications();
    
    // Set up polling for new notifications (every 30 seconds)
    const intervalId = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Context value
  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// Custom hook to use the notifications context
export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
