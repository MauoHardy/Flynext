// app/components/layout/UserMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/app/contexts/NotificationsContext';
import NotificationBell from '@/app/components/ui/NotificationBell';
import NotificationsDropdown from '@/app/components/ui/NotificationsDropdown';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Get notifications from context
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        notificationRef.current && 
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (isOpen) setIsOpen(false);
  };

  return (
    <div className="relative flex items-center space-x-4">
      {/* Notification Bell */}
      <div ref={notificationRef}>
        <NotificationBell 
          count={unreadCount} 
          onClick={toggleNotifications} 
        />
        
        {/* Notifications Dropdown */}
        {notificationsOpen && (
          <NotificationsDropdown
            notifications={notifications}
            isLoading={notificationsLoading}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
        )}
      </div>

      {/* User Menu */}
      <div ref={menuRef}>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (notificationsOpen) setNotificationsOpen(false);
          }}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={`${user.firstName} ${user.lastName}`}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-lg font-semibold text-gray-700">
                {user?.firstName?.charAt(0).toUpperCase() || ''}
              </span>
            )}
          </div>
          <span className="hidden md:block text-sm font-medium">
            {user?.firstName || 'Guest'}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Edit Profile
            </Link>
            <Link
              href="/bookings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              My Bookings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu;