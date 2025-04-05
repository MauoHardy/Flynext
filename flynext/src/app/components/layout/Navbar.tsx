"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Button from "../ui/Button";
import { useNotifications } from "@/app/contexts/NotificationsContext";
import NotificationBell from "../ui/NotificationBell";
import NotificationsDropdown from "../ui/NotificationsDropdown";

export default function Navbar() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Get notifications from context
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  
  // For debugging
  useEffect(() => {
    console.log("Navbar - Auth state:", { 
      isAuthenticated, 
      user, 
      isLoading,
      firstName: user?.firstName,
      lastName: user?.lastName
    });
  }, [isAuthenticated, user, isLoading]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    if (notificationsOpen) setNotificationsOpen(false);
  };
  
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
  };

  // Reset dropdowns when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    // No need to call router.refresh() as it's handled in the logout function
  };

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Flights", href: "/flights" },
    { name: "Hotels", href: "/hotels" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  FlyNext
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoading ? (
              <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4 relative">
                {/* Notification Bell */}
                <div className="relative">
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

                {/* Profile Menu */}
                <div className="ml-3 relative">
                  <div>
                    <button
                      onClick={toggleProfileDropdown}
                      className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
                    >
                        {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                          {user.firstName?.[0] || ''}
                          {user.lastName?.[0] || ''}
                        </div>
                        )}
                    </button>
                  </div>
                  {isProfileDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50">
                      <div className="py-1 bg-white rounded-md shadow-xs">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Your Profile
                        </Link>
                        <Link
                          href="/bookings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Your Bookings
                        </Link>
                        <Link
                          href="/profile/hotels/add"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Add Hotel
                        </Link>
                        <Link
                          href="/profile/hotels/view"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View Hotels
                        </Link>
                        {/* {Array.isArray(user?.ownedHotels) && user.ownedHotels.length > 0 && (
                          <>
                            <Link
                              href="/profile/hotels/view"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View Hotels
                            </Link>
                            <Link
                              href="/hotels/manage"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Manage Hotels
                            </Link>
                          </> */}
                        {/* )} */}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="secondary" size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
            >
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === item.href
                  ? "border-blue-500 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    {user.firstName?.[0] || ''}
                    {user.lastName?.[0] || ''}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user.firstName || ''} {user.lastName || ''}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user.email || ''}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {/* Mobile notifications link */}
                <Link
                  href="/notifications"
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Your Profile
                </Link>
                <Link
                  href="/bookings"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Your Bookings
                </Link>
                <Link
                  href="/profile/hotels/add"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Add Hotel
                </Link>
                <Link
                  href="/profile/hotels"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  My Hotels
                </Link>
                {Array.isArray(user?.ownedHotels) && user.ownedHotels.length > 0 && (
                  <>
                    <Link
                      href="/profile/hotels/view"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      View Hotels
                    </Link>
                    <Link
                      href="/hotels/manage"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Manage Hotels
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-1 px-4">
              <Link href="/login">
                <Button variant="outline" fullWidth className="mb-2">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" fullWidth>
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
