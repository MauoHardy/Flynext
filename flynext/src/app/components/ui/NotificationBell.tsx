import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  count: number;
  onClick: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ count, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative focus:outline-none"
      aria-label={count > 0 ? `${count} unread notifications` : "No notifications"}
    >
      <Bell className="w-6 h-6 text-gray-700" />
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
