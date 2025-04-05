import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/app/contexts/NotificationsContext';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

// Make sure to explicitly define as a function component
const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
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

  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div 
      className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex">
        <div className="flex-shrink-0 mr-3 text-xl">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1">
          <div onClick={handleClick}>
            {notification.link ? (
              <Link
                href={notification.link}
                className="text-sm text-gray-800 mb-1 block hover:text-blue-600"
              >
                {notification.message}
              </Link>
            ) : (
              <p className="text-sm text-gray-800 mb-1">{notification.message}</p>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};

// Make sure to export the component as default
export default NotificationItem;
