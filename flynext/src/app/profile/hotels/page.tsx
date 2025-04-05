'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hotel, Plus, Edit, Star, Building, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import Button from '@/app/components/ui/Button';

export default function HotelsPage() {
  const { user, isAuthenticated, isLoading, logout, refreshSession } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchingHotels, setFetchingHotels] = useState(false);
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    console.log("Hotels Page - Auth state:", { 
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
        console.log("Hotels page - Not authenticated, attempting refresh");
        setIsRefreshing(true);
        try {
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.log("Hotels page - Refresh failed, redirecting to login");
            router.push('/login?redirect=/profile/hotels');
          } else {
            console.log("Hotels page - Refresh successful");
            fetchHotels();
          }
        } catch (error) {
          console.error("Hotels page - Refresh error:", error);
          router.push('/login?redirect=/profile/hotels');
        } finally {
          setIsRefreshing(false);
        }
      };
      
      attemptRefresh();
    } else if (isAuthenticated && !isLoading) {
      fetchHotels();
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
          router.push('/login?redirect=/profile/hotels');
        }, 2000);
      } else {
        fetchHotels();
      }
    } catch (error) {
      console.error("Manual refresh error:", error);
      setError('Error refreshing session');
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchHotels = async () => {
    try {
      setFetchingHotels(true);
      const response = await fetch('/api/hotels', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }

      const data = await response.json();
      setHotels(data);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Failed to load your hotels. Please try again.');
    } finally {
      setFetchingHotels(false);
    }
  };

  if (isLoading || isRefreshing || fetchingHotels) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // For safety, handle case where user object might not be fully loaded
  if (!user || !user.id || !user.firstName || !user.lastName) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
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
              onClick={() => router.push('/login?redirect=/profile/hotels')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">My Hotels</h1>
            <p className="text-blue-600">Manage your hotel listings</p>
          </div>
          <Link
            href="/profile/hotels/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Add New Hotel
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {hotels.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Building className="w-16 h-16 mx-auto text-blue-300 mb-4" />
            <h2 className="text-2xl font-bold text-blue-900 mb-2">No hotels yet</h2>
            <p className="text-blue-600 mb-6">Add your first hotel to start receiving bookings</p>
            <Link
              href="/profile/hotels/add"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Add Hotel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 relative">
                  {hotel.images && hotel.images.length > 0 ? (
                    <img
                      src={hotel.images[0].url}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                      <Hotel className="w-12 h-12 text-blue-500" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md shadow-md text-sm font-medium flex items-center">
                    {[...Array(hotel.starRating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold text-blue-900 mb-1">{hotel.name}</h3>
                  <p className="text-blue-600 text-sm mb-3 line-clamp-1">{hotel.address}</p>

                  <div className="flex justify-between text-sm text-blue-700 mb-4">
                    <div>
                      <span className="font-medium">{hotel._count.roomTypes}</span> Room Types
                    </div>
                    <div>
                      <span className="font-medium">
                        {hotel.roomTypes.reduce((sum, type) => sum + type._count.hotelBookings, 0)}
                      </span> Bookings
                    </div>
                  </div>

                  <div className="flex justify-between gap-2">
                    <Link
                      href={`/profile/hotels/${hotel.id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
                    >
                      Manage
                    </Link>
                    <Link
                      href={`/profile/hotels/${hotel.id}/edit`}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      <Edit size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
