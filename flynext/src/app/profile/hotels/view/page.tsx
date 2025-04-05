'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Hotel, Plus, Edit, Star, Building, AlertCircle, RefreshCw, 
  Calendar, MapPin, Eye, BarChart2, BedDouble, Settings, BookOpen
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useHotels } from '@/app/contexts/HotelContext';
import Button from '@/app/components/ui/Button';

export default function ViewHotelsPage() {
  const { user, isAuthenticated, isLoading, refreshSession } = useAuth();
  const { hotels, loading: fetchingHotels, error: hotelsError, fetchHotels } = useHotels();
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    console.log("View Hotels Page - Auth state:", { 
      isAuthenticated, 
      isLoading, 
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        ownedHotels: user.ownedHotels
      } : null
    });
  }, [user, isAuthenticated, isLoading]);

  useEffect(() => {
    // If not authenticated and not loading, try refreshing session once
    if (!isLoading && !isAuthenticated) {
      const attemptRefresh = async () => {
        console.log("View Hotels page - Not authenticated, attempting refresh");
        setIsRefreshing(true);
        try {
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.log("View Hotels page - Refresh failed, redirecting to login");
            router.push('/login?redirect=/profile/hotels/view');
          } else {
            console.log("View Hotels page - Refresh successful");
            fetchHotels();
          }
        } catch (error) {
          console.error("View Hotels page - Refresh error:", error);
          router.push('/login?redirect=/profile/hotels/view');
        } finally {
          setIsRefreshing(false);
        }
      };
      
      attemptRefresh();
    } else if (isAuthenticated && !isLoading && user) {
      fetchHotels();
    }
  }, [isLoading, isAuthenticated, user, router, refreshSession, fetchHotels]);

  // Handle manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await refreshSession();
      if (!refreshed) {
        setError('Unable to refresh session. Please login again.');
        setTimeout(() => {
          router.push('/login?redirect=/profile/hotels/view');
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

  // Helper function to get total rooms per hotel
  const getTotalRooms = (hotel) => {
    return hotel.roomTypes.reduce((sum, roomType) => sum + (roomType.totalRooms || 0), 0);
  };

  // Helper function to get total bookings per hotel
  const getTotalBookings = (hotel) => {
    return hotel.roomTypes.reduce((sum, roomType) => 
      sum + (roomType._count?.hotelBookings || 0), 0);
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
              onClick={() => router.push('/login?redirect=/profile/hotels/view')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use the error from context or local state
  const displayError = hotelsError || error;

  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">My Hotels</h1>
            <p className="text-blue-600">View and manage your hotel properties</p>
          </div>
          <div className="flex gap-3">
            <Link href="/profile/hotels/bookings">
              <Button
                variant="outline"
                className="flex items-center gap-1 text-gray-800 font-medium"
              >
                <BookOpen size={16} />
                View All Bookings
              </Button>
            </Link>
            
            <Button
              variant="outline"
              onClick={fetchHotels}
              className="flex items-center gap-1 text-gray-800 font-medium"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            
            <Link href="/profile/hotels/add">
              <Button variant="primary" className="text-white font-medium">Add New Hotel</Button>
            </Link>
          </div>
        </div>

        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {displayError}
          </div>
        )}

        {hotels.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Building className="w-16 h-16 mx-auto text-blue-300 mb-4" />
            <h2 className="text-2xl font-bold text-blue-900 mb-2">No hotels yet</h2>
            <p className="text-blue-600 mb-6">Add your first hotel to start receiving bookings</p>
            <Link
              href="/profile/hotels/add"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2 font-medium"
            >
              Add Hotel
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {hotels.map((hotel) => (
              <div 
                key={hotel.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="md:flex">
                  {/* Hotel image or placeholder */}
                  <div className="md:w-1/4 h-48 md:h-auto relative">
                    {hotel.images && hotel.images.length > 0 ? (
                      <img
                        src={hotel.images[0].url}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <Hotel className="w-12 h-12 text-blue-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full shadow-md flex items-center">
                      {[...Array(hotel.starRating || 0)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  {/* Hotel details */}
                  <div className="p-6 md:w-3/4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-blue-900">{hotel.name}</h2>
                        <div className="flex items-center text-blue-700 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {hotel.address}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span>Created: {formatDate(hotel.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-sm text-blue-700 mb-1 flex items-center justify-center">
                          <BedDouble className="w-4 h-4 mr-1" /> Room Types
                        </div>
                        <div className="text-xl font-bold text-blue-800">
                          {hotel._count?.roomTypes || 0}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-sm text-blue-700 mb-1 flex items-center justify-center">
                          <BarChart2 className="w-4 h-4 mr-1" /> Total Bookings
                        </div>
                        <div className="text-xl font-bold text-blue-800">
                          {getTotalBookings(hotel)}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-sm text-blue-700 mb-1 flex items-center justify-center">
                          <Calendar className="w-4 h-4 mr-1" /> Total Rooms
                        </div>
                        <div className="text-xl font-bold text-blue-800">
                          {getTotalRooms(hotel)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/hotels/${hotel.id}`}>
                        <Button variant="outline" className="flex items-center gap-1 text-gray-800 font-medium">
                          <Eye size={16} />
                          View Hotel
                        </Button>
                      </Link>
                      
                      <Link href={`/profile/hotels/${hotel.id}/edit`}>
                        <Button variant="outline" className="flex items-center gap-1 text-gray-800 font-medium">
                          <Edit size={16} />
                          Edit Details
                        </Button>
                      </Link>
                      
                      <Link href={`/profile/hotels/${hotel.id}/rooms`}>
                        <Button variant="outline" className="flex items-center gap-1 text-gray-800 font-medium">
                          <BedDouble size={16} />
                          Manage Rooms
                        </Button>
                      </Link>
                      
                      <Link href={`/profile/hotels/${hotel.id}/bookings`}>
                        <Button variant="primary" className="flex items-center gap-1 text-white font-medium">
                          <Settings size={16} />
                          Manage Hotel
                        </Button>
                      </Link>
                    </div>
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
