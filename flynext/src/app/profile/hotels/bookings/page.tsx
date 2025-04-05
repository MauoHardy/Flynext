'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Search, RefreshCw, AlertCircle, 
  Hotel, User, CreditCard, Check, X, Filter, ChevronDown, ChevronUp,
  Ban, XCircle
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import Button from '@/app/components/ui/Button';
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth';

export default function AllHotelBookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshSession } = useAuth();
  
  // States
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Cancel booking states
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [cancellationSuccess, setCancellationSuccess] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    roomTypeId: '',
    hotelName: ''
  });

  // Fetch bookings on page load
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const attemptRefresh = async () => {
        setIsRefreshing(true);
        try {
          const refreshed = await refreshSession();
          if (!refreshed) {
            router.push('/login?redirect=/profile/hotels/bookings');
          } else {
            fetchBookings();
          }
        } catch (error) {
          console.error("Refresh error:", error);
          router.push('/login?redirect=/profile/hotels/bookings');
        } finally {
          setIsRefreshing(false);
        }
      };
      
      attemptRefresh();
    } else if (isAuthenticated && !isLoading && user) {
      fetchBookings();
    }
  }, [isLoading, isAuthenticated, user, router, refreshSession]);
  
  // Fetch bookings with or without filters
  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Construct URL with any active filters
      let url = '/api/bookings/myHotels/myHotelBookings';
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.roomTypeId) queryParams.append('roomTypeId', filters.roomTypeId);
      
      // Add the query parameters to the URL if any exist
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await fetchWithAuth(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }
      
      const data = await response.json();
      console.log("Fetched bookings:", data.bookings);
      setBookings(data.bookings || []);
      
      // Filter bookings by hotel name client-side if that filter is active
      if (filters.hotelName && data.bookings) {
        const filteredBookings = data.bookings.filter(booking => 
          booking.hotel.name.toLowerCase().includes(filters.hotelName.toLowerCase())
        );
        setBookings(filteredBookings);
      }
      console.log("Filtered bookings:", data.bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    fetchBookings();
  };
  
  // Clear filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      roomTypeId: '',
      hotelName: ''
    });
    
    // Fetch bookings without filters
    setTimeout(() => {
      fetchBookings();
    }, 0);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate stay duration
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '0';
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString();
  };
  
  // Open cancel confirmation modal
  const openCancelConfirmation = (booking) => {
    console.log("Opening cancel confirmation for booking:", booking.id);
    setBookingToCancel(booking);
    setShowCancelConfirm(true);
  };
  
  // Cancel booking
  const cancelBooking = async () => {
    if (!bookingToCancel) return;
    
    setCancellationLoading(true);
    try {
      console.log('Cancelling booking ID:', bookingToCancel.id);
      
      // Fix the URL to ensure no double slashes or formatting issues
      const url = `/api/bookings/cancel?hotelBookingId=${encodeURIComponent(bookingToCancel.id)}`;
      console.log('Calling API URL:', url);
      
      const response = await fetchWithAuth(url);
      
      console.log('Cancel response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }
      
      const data = await response.json();
      console.log('Cancel response data:', data);
      
      // Update the booking in the list with more debugging
      setBookings(prevBookings => {
        console.log('Previous bookings:', prevBookings);
        const newBookings = prevBookings.map(booking => {
          if (booking.id === bookingToCancel.id) {
            console.log(`Updating booking ${booking.id} from ${booking.status} to Cancelled`);
            return { ...booking, status: 'Cancelled' };
          }
          return booking;
        });
        console.log('Updated bookings:', newBookings);
        return newBookings;
      });
      
      setCancellationSuccess(`Booking #${bookingToCancel.id.substring(0, 8)}... has been cancelled.`);
      
      // Refresh bookings from the server after a short delay
      setTimeout(() => {
        fetchBookings();
      }, 1000);
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setCancellationSuccess('');
      }, 5000);
      
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setCancellationLoading(false);
      setShowCancelConfirm(false);
      setBookingToCancel(null);
    }
  };

  // Render bookings table row
  const renderBookingRow = (booking) => {
    console.log(`Rendering booking ${booking.id} with status ${booking.status}`);
    return (
      <tr key={booking.id} className="hover:bg-gray-50">
        <td className="px-4 py-3 text-sm text-gray-800">
          <div className="font-medium">{booking.hotel.name}</div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-800">
          {booking.roomType.name}
        </td>
        <td className="px-4 py-3 text-sm text-gray-800">
          {booking.guest?.firstName} {booking.guest?.lastName}
        </td>
        <td className="px-4 py-3 text-sm text-gray-800">
          {formatDate(booking.checkIn)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-800">
          {formatDate(booking.checkOut)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-800">
          {booking.roomsBooked} ({calculateNights(booking.checkIn, booking.checkOut)} nights)
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-900">
          ${booking.totalPrice}
        </td>
        <td className="px-4 py-3 text-sm">
          {/* Show cancel button for all bookings since API only returns confirmed bookings */}
          <button 
            type="button"
            className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 shadow-sm flex items-center gap-1 min-w-[80px] justify-center whitespace-nowrap"
            onClick={() => openCancelConfirmation(booking)}
          >
            <Ban size={14} />
            Cancel
          </button>
        </td>
      </tr>
    );
  };

  // Loading state
  if (isLoading || isRefreshing) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Authentication check
  if (!user && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <Link href="/profile/hotels/view">
            <button className="flex items-center text-blue-700 hover:text-blue-800">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Hotels
            </button>
          </Link>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-gray-800"
          >
            <Filter size={16} />
            Filters
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-blue-900 mb-2">All Hotel Bookings</h1>
        <p className="text-blue-600 mb-6">View and manage bookings across all your properties</p>
        
        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-4">Filter Bookings</h2>
            
            <form onSubmit={applyFilters}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date (After)
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md text-gray-900"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date (Before)
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    min={filters.startDate}
                    className="w-full p-2 border rounded-md text-gray-900"
                  />
                </div>
                
                <div>
                  <label htmlFor="roomTypeId" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type ID (optional)
                  </label>
                  <input
                    type="text"
                    id="roomTypeId"
                    name="roomTypeId"
                    value={filters.roomTypeId}
                    onChange={handleFilterChange}
                    placeholder="Enter room type ID"
                    className="w-full p-2 border rounded-md text-gray-900"
                  />
                </div>
                
                <div>
                  <label htmlFor="hotelName" className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    id="hotelName"
                    name="hotelName"
                    value={filters.hotelName}
                    onChange={handleFilterChange}
                    placeholder="Search by hotel name"
                    className="w-full p-2 border rounded-md text-gray-900"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  className="flex items-center gap-1"
                >
                  <Search size={16} />
                  Apply Filters
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {cancellationSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {cancellationSuccess}
          </div>
        )}
        
        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">Hotel</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">Room Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">Guest Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">Check In</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">Check Out</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">Rooms</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map(renderBookingRow)}
                  </tbody>
                </table>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mt-2">
              Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto text-blue-300 mb-4" />
            <h2 className="text-xl font-medium text-blue-800 mb-2">No bookings found</h2>
            <p className="text-blue-600 mb-6">
              {filters.startDate || filters.endDate || filters.roomTypeId || filters.hotelName 
                ? 'No bookings match your current filters. Try adjusting your search criteria.'
                : 'You don\'t have any bookings for your hotels yet.'}
            </p>
            {(filters.startDate || filters.endDate || filters.roomTypeId || filters.hotelName) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mx-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      {showCancelConfirm && bookingToCancel && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center text-red-500 mb-4">
              <XCircle className="w-8 h-8 mr-3" />
              <h2 className="text-lg font-bold">Cancel Booking</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel this booking for <span className="font-semibold">{bookingToCancel.guest?.firstName} {bookingToCancel.guest?.lastName}</span> at <span className="font-semibold">{bookingToCancel.hotel.name}</span>?
            </p>
            
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Room Type:</span>
                  <span className="text-gray-600 ml-1">{bookingToCancel.roomType.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Rooms:</span>
                  <span className="text-gray-600 ml-1">{bookingToCancel.roomsBooked}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Check In:</span>
                  <span className="text-gray-600 ml-1">{formatDate(bookingToCancel.checkIn)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Check Out:</span>
                  <span className="text-gray-600 ml-1">{formatDate(bookingToCancel.checkOut)}</span>
                </div>
              </div>
            </div>
            
            <p className="text-red-600 text-sm mb-6">
              This action cannot be undone. The guest will be notified of the cancellation.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => {
                  console.log("Closing cancel modal");
                  setShowCancelConfirm(false);
                  setBookingToCancel(null);
                }}
                disabled={cancellationLoading}
              >
                No, Keep Booking
              </button>
              
              <button
                type="button"
                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 ${cancellationLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={cancelBooking}
                disabled={cancellationLoading}
              >
                {cancellationLoading && (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                )}
                {cancellationLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
