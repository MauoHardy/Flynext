import React from 'react';
import Link from 'next/link';
import { Check, BellOff } from 'lucide-react';
import type { Notification } from '@/app/contexts/NotificationsContext';
// Use a relative import instead of absolute since they're in the same directory
import NotificationItem from '@/app/components/ui/NotificationItem';

interface NotificationsDropdownProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
        {notifications.some(n => !n.read) && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            <Check className="w-3 h-3 mr-1" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center">
            <BellOff className="w-8 h-8 mb-2 text-gray-400" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200">
        <Link href="/notifications" className="block text-xs text-center text-blue-600 hover:text-blue-800">
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationsDropdown;

