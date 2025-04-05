"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, Calendar, Edit, LogOut, Bookmark, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '@/app/components/ui/Button';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, refreshSession } = useAuth();
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  
  // Debug logging
  useEffect(() => {
    console.log("Profile Page - Auth state:", { 
      isAuthenticated, 
      isLoading, 
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      } : null
    });
  }, [user, isAuthenticated, isLoading]);
  
  useEffect(() => {
    // If not authenticated and not loading, try refreshing session once
    if (!isLoading && !isAuthenticated) {
      const attemptRefresh = async () => {
        console.log("Profile page - Not authenticated, attempting refresh");
        setIsRefreshing(true);
        try {
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.log("Profile page - Refresh failed, redirecting to login");
            router.push('/login');
          } else {
            console.log("Profile page - Refresh successful");
          }
        } catch (error) {
          console.error("Profile page - Refresh error:", error);
          router.push('/login');
        } finally {
          setIsRefreshing(false);
        }
      };
      
      attemptRefresh();
    }
  }, [isLoading, isAuthenticated, router, refreshSession]);
  
  // Handle manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await refreshSession();
      if (!refreshed) {
        setError('Unable to refresh session. Please login again.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error) {
      console.error("Manual refresh error:", error);
      setError('Error refreshing session');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  if (isLoading || isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="rounded-full bg-gray-200 h-24 w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    );
  }
  
  if (!user && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  // For safety, handle case where user object might not be fully loaded
  if (!user || !user.id || !user.firstName || !user.lastName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg max-w-md flex flex-col items-center">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 mr-2" />
            <div>
              <p className="font-bold">User data incomplete or not available</p>
              <p className="text-sm">Please try refreshing the session or logging in again.</p>
            </div>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm mb-3 text-center w-full">
              {error}
            </div>
          )}
          
          <div className="flex gap-3">
            <Button 
              variant="primary" 
              onClick={handleManualRefresh}
              isLoading={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw size={16} />
              Refresh Session
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={() => router.push('/login')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Format creation date
  const createdAt = user.createdAt 
    ? new Date(user.createdAt.toString()).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'N/A';
  
  // Use random Unsplash background image
  const backgroundImage = 'https://source.unsplash.com/random/1600x900/?travel,landscape';
  
  // Get profile picture or use default from Unsplash
  const profilePicture = user.profilePicture || `https://source.unsplash.com/random/400x400/?person,portrait&seed=${user.id}`;
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cover image */}
      <div 
        className="h-64 w-full bg-cover bg-center" 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="h-full w-full bg-indigo-800 bg-opacity-30 flex items-end">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-4">
            <div className="flex justify-between items-end">
              {/* <h1 className="text-3xl font-bold text-black drop-shadow-md">
                {user.firstName} {user.lastName}
              </h1> */}
                    <div className="flex gap-2 justify-end mb-4 ml-auto">
                    <Link href="/profile/edit">
                    <Button variant="secondary" size="sm" className="flex items-center gap-1">
                    <Edit size={16} />
                    Edit Profile
                    </Button>
                    </Link>
                    <Button 
                    onClick={logout} 
                    variant="secondary" 
                    size="sm"
                    className="flex items-center gap-1 text-red-600 hover:text-red-800"
                    >
                    <LogOut size={16} />
                    Sign Out
                    </Button>
                    </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Profile info */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 -mt-44  ">
              <div className="flex flex-col items-center">
                <img 
                  src={profilePicture} 
                  // alt={`${user.firstName} ${user.lastName}`}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-sm object-cover"
                />
                <h2 className="mt-4 text-xl font-semibold text-indigo-800">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-black">Member since {createdAt}</p>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                
                {user.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{user.phoneNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Joined {createdAt}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Bookings & actions */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-black">Your Bookings</h3>
                <Link href="/bookings">
                  <Button variant="primary" size="sm" className="flex items-center gap-1">
                    <Bookmark size={16} />
                    View All
                  </Button>
                </Link>
              </div>
              
              {/* Bookings placeholder */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <img 
                      src="https://images.trvl-media.com/lodging/1000000/30000/23700/23677/0f6d311c.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill" 
                      alt="Hotel" 
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div bg-black='true'>
                      <h4 className="font-medium text-indigo-700">Grand Hyatt New York</h4>
                      <p className="text-sm text-gray-500">Jul 15, 2023 - Jul 20, 2023</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <img 
                      src="data:image/jpeg;base64,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" 
                      alt="Flight" 
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-indigo-700">Flight to Paris</h4>
                      <p className="text-sm text-gray-500">Aug 23, 2023</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Upcoming
                  </span>
                </div>
                
                {/* <Link href="/bookings" className="block text-center text-blue-600 hover:text-blue-800 text-sm mt-4">
                  View all bookings
                </Link> */}
              </div>
            </div>
            
            {/* Quick stats section */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              <div className="bg-black rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-2">Flights</h3>
                <p className="text-3xl font-bold">2</p>
                <p className="text-sm text-indigo-400 mt-1">1 upcoming</p>
              </div>
              
              <div className="bg-black rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-2">Hotel Stays</h3>
                <p className="text-3xl font-bold">3</p>
                <p className="text-sm text-indigo-400 mt-1">0 upcoming</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}