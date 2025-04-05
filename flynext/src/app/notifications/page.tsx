"use client";
import React, { useState, useMemo } from 'react';
import { useNotifications } from '@/app/contexts/NotificationsContext';
import { format } from 'date-fns';
import { Check, Loader2, BellOff, Clock, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';

type FilterType = 'all' | 'unread' | 'BookingConfirmation' | 'Cancellation' | 'SystemUpdate' | 'Reminder';

export default function NotificationsPage() {
  const { 
    notifications, 
    isLoading, 
    error, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  // Add state for selected filter
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BookingConfirmation':
        return '✈️';
      case 'Cancellation':
        return '❌';
      case 'SystemUpdate':
        return '🔄';
      case 'Reminder':
        return '⏰';
      default:
        return '📣';
    }
  };

  // Get type label for notification
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BookingConfirmation':
        return 'Booking Confirmation';
      case 'Cancellation':
        return 'Cancellation Notice';
      case 'SystemUpdate':
        return 'System Update';
      case 'Reminder':
        return 'Reminder';
      default:
        return 'Notification';
    }
  };
  
  // Filter notifications based on selected filter
  const filteredNotifications = useMemo(() => {
    switch (selectedFilter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'BookingConfirmation':
      case 'Cancellation':
      case 'SystemUpdate':
      case 'Reminder':
        return notifications.filter(n => n.type === selectedFilter);
      default:
        return notifications;
    }
  }, [notifications, selectedFilter]);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Main container with full-width background
  return (
    <div className="bg-blue-100 min-h-screen w-full">
      {isLoading ? (
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      ) : error ? (
        <div className="container mx-auto p-6">
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">Error: {error}</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Your Notifications</h1>
              <p className="text-white bg-gray-700 inline-block px-2 py-1 rounded mt-1">
                You have {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                {unreadCount > 0 && (
                  <span className="text-red-400 underline font-medium ml-1">
                    {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <span className="flex items-center text-gray-600">
              <Filter className="w-4 h-4 mr-1" />
              Filter:
            </span>
            {['all', 'unread', 'BookingConfirmation', 'Cancellation', 'SystemUpdate', 'Reminder'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter as FilterType)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedFilter === filter 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All' : 
                 filter === 'unread' ? 'Unread' : 
                 getTypeLabel(filter)}
                {filter === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <BellOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-600">No notifications to display</h2>
              <p className="text-gray-500 mt-2">
                {selectedFilter !== 'all' 
                  ? `You don't have any ${selectedFilter === 'unread' ? 'unread' : getTypeLabel(selectedFilter).toLowerCase()} notifications`
                  : 'When you receive notifications, they will appear here'}
              </p>
              {selectedFilter !== 'all' && (
                <button 
                  onClick={() => setSelectedFilter('all')}
                  className="mt-4 text-blue-500 hover:text-blue-700"
                >
                  View all notifications
                </button>
              )}
              {selectedFilter === 'all' && (
                <Link href="/" className="mt-6 inline-block text-blue-500 hover:text-blue-700">
                  Return to homepage
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`border-b border-gray-200 last:border-b-0 p-4 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">
                            {getTypeLabel(notification.type)}
                          </h3>
                          <p className="text-gray-800 my-2">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark read
                          </button>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                        </div>
                        
                        {notification.link && (
                          <Link 
                            href={notification.link}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            View details
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}