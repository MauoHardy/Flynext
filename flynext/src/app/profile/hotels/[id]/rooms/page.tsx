'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BedDouble, AlertCircle, RefreshCw, ArrowLeft, Plus, Edit, Trash2,
  Calendar, DollarSign, Users, Info, Wifi, Coffee, Utensils, Check, Search, X, Minus
} from 'lucide-react';
import Button from '@/app/components/ui/Button';
import { useAuth } from '@/app/contexts/AuthContext';
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth';

// Common room amenities
const COMMON_AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Flat-screen TV',
  'Mini Bar',
  'Room Service',
  'King Size Bed',
  'Queen Size Bed',
  'Private Bathroom',
  'Bath Tub',
  'Shower',
  'Balcony',
  'Ocean View',
  'City View',
  'Garden View',
  'Free Toiletries',
  'Hairdryer'
];

export default function ManageRoomsPage({ params }: { params: { id: string } }) {
  // Unwrap params if it's a Promise
  const unwrappedParams = React.use(params);
  const hotelId = unwrappedParams.id;

  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshSession } = useAuth();

  // States
  const [hotel, setHotel] = useState<any>(null);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  // New room form state
  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    pricePerNight: '',
    totalRooms: '1',
    images: [''],
    amenities: ['']
  });

  // Amenities selector state
  const [showAmenitiesSelector, setShowAmenitiesSelector] = useState(true);

  // Availability checker states
  const [showAvailabilityChecker, setShowAvailabilityChecker] = useState(false);
  const [availabilityDates, setAvailabilityDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [availabilityResults, setAvailabilityResults] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  // Add these new states for room editing
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState(null);
  const [newRoomCount, setNewRoomCount] = useState('');
  const [isUpdatingRoom, setIsUpdatingRoom] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Fetch hotel and room types
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const attemptRefresh = async () => {
        console.log("Manage Rooms page - Not authenticated, attempting refresh");
        setIsRefreshing(true);
        try {
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.log("Manage Rooms page - Refresh failed, redirecting to login");
            router.push(`/login?redirect=/profile/hotels/${hotelId}/rooms`);
          } else {
            console.log("Manage Rooms page - Refresh successful");
            fetchHotelDetails();
          }
        } catch (error) {
          console.error("Manage Rooms page - Refresh error:", error);
          router.push(`/login?redirect=/profile/hotels/${hotelId}/rooms`);
        } finally {
          setIsRefreshing(false);
        }
      };
      
      attemptRefresh();
    } else if (isAuthenticated && !isLoading) {
      fetchHotelDetails();
    }
  }, [isLoading, isAuthenticated, hotelId, router, refreshSession]);

  // Fetch hotel details
  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`/api/hotels/${hotelId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch hotel details');
      }
      
      const hotelData = await response.json();
      
      // Verify that the user is the owner of this hotel
      if (user?.id !== hotelData.ownerId) {
        throw new Error('You do not have permission to manage this hotel');
      }
      
      setHotel(hotelData);
      setRoomTypes(hotelData.roomTypes || []);
    } catch (err: any) {
      console.error('Error fetching hotel details:', err);
      setError(err.message || 'Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await refreshSession();
      if (!refreshed) {
        setError('Unable to refresh session. Please login again.');
        setTimeout(() => {
          router.push(`/login?redirect=/profile/hotels/${hotelId}/rooms`);
        }, 2000);
      } else {
        await fetchHotelDetails();
      }
    } catch (error) {
      console.error("Manual refresh error:", error);
      setError('Error refreshing session');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Form handlers
  const handleRoomInputChange = (e) => {
    const { name, value } = e.target;
    setRoomForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...roomForm.images];
    newImages[index] = value;
    setRoomForm(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const addImageField = () => {
    setRoomForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    if (roomForm.images.length === 1) return;
    
    const newImages = roomForm.images.filter((_, i) => i !== index);
    setRoomForm(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleAmenityChange = (index, value) => {
    const newAmenities = [...roomForm.amenities];
    newAmenities[index] = value;
    setRoomForm(prev => ({
      ...prev,
      amenities: newAmenities
    }));
  };

  const addAmenityField = () => {
    setRoomForm(prev => ({
      ...prev,
      amenities: [...prev.amenities, '']
    }));
  };

  const removeAmenityField = (index) => {
    if (roomForm.amenities.length === 1) return;
    
    const newAmenities = roomForm.amenities.filter((_, i) => i !== index);
    setRoomForm(prev => ({
      ...prev,
      amenities: newAmenities
    }));
  };

  // Handle adding a common amenity
  const addCommonAmenity = (amenity) => {
    // Check if this amenity already exists
    if (!roomForm.amenities.includes(amenity)) {
      // Find an empty field if one exists
      const emptyIndex = roomForm.amenities.findIndex(a => a === '');
      
      if (emptyIndex !== -1) {
        // Replace empty field with the new amenity
        const newAmenities = [...roomForm.amenities];
        newAmenities[emptyIndex] = amenity;
        setRoomForm(prev => ({
          ...prev,
          amenities: newAmenities
        }));
      } else {
        // Add as a new field
        setRoomForm(prev => ({
          ...prev,
          amenities: [...prev.amenities, amenity]
        }));
      }
    }
  };

  // Submit new room type
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!roomForm.name.trim()) {
      setError('Room type name is required');
      return;
    }
    
    if (!roomForm.description.trim()) {
      setError('Room description is required');
      return;
    }
    
    const price = parseFloat(roomForm.pricePerNight);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    const roomCount = parseInt(roomForm.totalRooms);
    if (isNaN(roomCount) || roomCount <= 0) {
      setError('Please enter a valid room count');
      return;
    }
    
    // Validate that all image URLs are not empty
    const validImages = roomForm.images.filter(url => url.trim() !== '');
    if (validImages.length === 0) {
      setError('At least one image URL is required');
      return;
    }
    
    // Validate that all amenities are not empty
    const validAmenities = roomForm.amenities.filter(amenity => amenity.trim() !== '');
    if (validAmenities.length === 0) {
      setError('At least one amenity is required');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      // Prepare the data for API call
      const roomTypeData = {
        hotelId,
        name: roomForm.name.trim(),
        description: roomForm.description.trim(),
        pricePerNight: price,
        totalRooms: roomCount,
        images: validImages,
        amenities: validAmenities
      };
      
      console.log("Submitting room type data:", roomTypeData);
      
      // Make API call to add room type
      const response = await fetchWithAuth('/api/hotels/add/room_type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomTypeData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add room type');
      }
      
      const data = await response.json();
      
      // Success! Update UI and reset form
      setFormSuccess('Room type added successfully!');
      setRoomTypes(prev => [...prev, data]);
      
      // Reset form after short delay
      setTimeout(() => {
        setRoomForm({
          name: '',
          description: '',
          pricePerNight: '',
          totalRooms: '1',
          images: [''],
          amenities: ['']
        });
        setShowAddRoomForm(false);
        setFormSuccess('');
      }, 2000);
      
    } catch (err) {
      console.error('Error adding room type:', err);
      setError(err.message || 'Failed to add room type. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check room availability
  const checkRoomAvailability = async () => {
    if (!availabilityDates.startDate || !availabilityDates.endDate || !selectedRoomTypeId) {
      setAvailabilityError('Please select dates and a room type');
      return;
    }

    setCheckingAvailability(true);
    setAvailabilityError('');

    try {
      const queryParams = new URLSearchParams({
        startDate: availabilityDates.startDate,
        endDate: availabilityDates.endDate,
        roomTypeId: selectedRoomTypeId
      });

      const response = await fetchWithAuth(`/api/bookings/myHotels/roomAvailability?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch availability');
      }
      
      const data = await response.json();
      console.log('Availability data:', data);
      setAvailabilityResults(data);
    } catch (err) {
      console.error('Error checking availability:', err);
      setAvailabilityError(err.message || 'Failed to check availability');
      setAvailabilityResults(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Handle date changes for availability checker
  const handleAvailabilityDateChange = (e) => {
    const { name, value } = e.target;
    setAvailabilityDates(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open edit room modal
  const openEditRoomModal = (roomType) => {
    setRoomToEdit(roomType);
    setNewRoomCount(roomType.totalRooms.toString());
    setShowEditRoomModal(true);
    setUpdateError('');
    setUpdateSuccess('');
  };

  // Update room count
  const updateRoomCount = async (e) => {
    e.preventDefault();
    
    if (!roomToEdit) return;
    
    const roomCount = parseInt(newRoomCount);
    if (isNaN(roomCount) || roomCount < 0) {
      setUpdateError('Please enter a valid room count (0 or greater)');
      return;
    }
    
    setIsUpdatingRoom(true);
    setUpdateError('');
    setUpdateSuccess('');
    
    try {
      const response = await fetchWithAuth('/api/hotels/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomTypeId: roomToEdit.id,
          newTotalRooms: roomCount
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update room count');
      }
      
      const data = await response.json();
      console.log('Room update response:', data);
      
      // Update the room type in the local state
      setRoomTypes(prevRoomTypes =>
        prevRoomTypes.map(rt => 
          rt.id === roomToEdit.id ? { ...rt, totalRooms: roomCount } : rt
        )
      );
      
      setUpdateSuccess(`Room count for ${roomToEdit.name} updated successfully!`);
      
      // Close the modal after a short delay
      setTimeout(() => {
        setShowEditRoomModal(false);
        setRoomToEdit(null);
        setUpdateSuccess('');
      }, 2000);
      
    } catch (err) {
      console.error('Error updating room count:', err);
      setUpdateError(err.message || 'Failed to update room count');
    } finally {
      setIsUpdatingRoom(false);
    }
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

  // User data check
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
              onClick={() => router.push(`/login?redirect=/profile/hotels/${hotelId}/rooms`)}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Hotel error state
  if (error && !hotel) {
    return (
      <div className="min-h-screen bg-blue-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => router.push('/profile/hotels/view')}
            className="flex items-center text-blue-700 mb-6 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Hotels
          </button>
          
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleManualRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw size={16} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Render room type
  const renderRoomType = (roomType) => (
    <div 
      key={roomType.id} 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="md:flex">
        {/* Room image or placeholder */}
        <div className="md:w-1/4 h-48 md:h-auto">
          {roomType.images && roomType.images.length > 0 ? (
            <img
              src={roomType.images[0].url}
              alt={roomType.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://th.bing.com/th/id/OIP.o7biFYXxLDCwsG8_E1v54QHaFJ?rs=1&pid=ImgDetMain';
              }}
            />
          ) : (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
              <BedDouble className="w-12 h-12 text-blue-400" />
            </div>
          )}
        </div>
        
        {/* Room details */}
        <div className="p-6 md:w-3/4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-blue-900">{roomType.name}</h3>
              <p className="text-blue-700">${roomType.pricePerNight} per night</p>
            </div>
            
            <div className="bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-blue-800 font-medium">
                {roomType.totalRooms} rooms
              </span>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">
            {roomType.description}
          </p>
          
          <div className="mb-4">
            <h4 className="font-medium text-blue-800 mb-2">Amenities:</h4>
            <div className="flex flex-wrap gap-2">
              {roomType.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-sm">
                  <Check size={14} className="mr-1" />
                  {amenity.name}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-gray-700 font-medium"
              onClick={() => openEditRoomModal(roomType)}
            >
              <Edit size={16} />
              Edit Room Type
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                // Implement delete functionality
                alert('Delete functionality would go here');
              }}
            >
              <Trash2 size={16} />
              Remove Room Type
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main content
  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => router.push('/profile/hotels/view')}
          className="flex items-center text-blue-700 mb-6 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Hotels
        </button>
        
        {/* Hotel Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Manage Rooms - {hotel?.name}
          </h1>
          <p className="text-blue-600">
            Add and manage room types available at your hotel
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {formSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {formSuccess}
          </div>
        )}
        
        {/* Add Room Button */}
        {!showAddRoomForm ? (
          <div className="mb-8">
            <Button 
              variant="primary" 
              onClick={() => setShowAddRoomForm(true)}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              Add New Room Type
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-900">Add New Room Type</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddRoomForm(false)}
              >
                Cancel
              </Button>
            </div>
            
            <form onSubmit={handleAddRoomSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={roomForm.name}
                    onChange={handleRoomInputChange}
                    className="w-full p-2 border rounded-md text-gray-800"
                    placeholder="e.g. Deluxe Suite, Standard Room"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-1">
                    Price Per Night
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      id="pricePerNight"
                      name="pricePerNight"
                      value={roomForm.pricePerNight}
                      onChange={handleRoomInputChange}
                      step="0.01"
                      min="0"
                      className="w-full p-2 pl-8 border rounded-md text-gray-800"
                      placeholder="199.99"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={roomForm.description}
                  onChange={handleRoomInputChange}
                  rows={3}
                  className="w-full p-2 border rounded-md text-gray-800"
                  placeholder="Describe the room, its features, and views"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="totalRooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Rooms Available
                </label>
                <div className="relative">
                  <BedDouble className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    id="totalRooms"
                    name="totalRooms"
                    value={roomForm.totalRooms}
                    onChange={handleRoomInputChange}
                    min="1"
                    className="w-full p-2 pl-8 border rounded-md text-gray-800"
                    placeholder="10"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Images (URLs)
                </label>
                <div className="space-y-3">
                  {roomForm.images.map((image, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="flex-1 p-2 border rounded-md text-gray-800"
                        placeholder="Enter image URL"
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                        disabled={roomForm.images.length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addImageField}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <Plus size={18} />
                    Add Another Image URL
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Room Amenities
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAmenitiesSelector(!showAmenitiesSelector)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showAmenitiesSelector ? 'Hide Common Amenities' : 'Show Common Amenities'}
                  </button>
                </div>
                
                {/* Common amenities section */}
                {showAmenitiesSelector && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <h3 className="text-sm font-medium text-blue-700 mb-2">Common Room Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_AMENITIES.map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => addCommonAmenity(amenity)}
                          className={`px-2 py-1 text-xs rounded-full border ${
                            roomForm.amenities.includes(amenity)
                              ? 'bg-blue-200 text-blue-800 border-blue-300'
                              : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {roomForm.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={amenity}
                        onChange={(e) => handleAmenityChange(index, e.target.value)}
                        className="flex-1 p-2 border rounded-md text-gray-800"
                        placeholder="Enter amenity"
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeAmenityField(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                        disabled={roomForm.amenities.length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addAmenityField}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <Plus size={18} />
                    Add Another Amenity
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddRoomForm(false)}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="flex items-center gap-1"
                >
                  {isSubmitting ? 'Adding Room Type...' : 'Add Room Type'}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Room Types List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900">
              {roomTypes.length > 0 
                ? `Room Types (${roomTypes.length})` 
                : 'No Room Types Added Yet'}
            </h2>
            
            {/* Add this button to toggle availability checker */}
            <Button
              variant="outline"
              onClick={() => setShowAvailabilityChecker(!showAvailabilityChecker)}
              className="flex items-center gap-1 text-blue-700"
            >
              <Calendar size={16} />
              {showAvailabilityChecker ? 'Hide Availability Checker' : 'Check Room Availability'}
            </Button>
          </div>
          
          {/* Add the availability checker section */}
          {showAvailabilityChecker && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Room Availability Checker</h3>
              
              {availabilityError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  {availabilityError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={availabilityDates.startDate}
                    onChange={handleAvailabilityDateChange}
                    className="w-full p-2 border rounded-md text-gray-900"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={availabilityDates.endDate}
                    onChange={handleAvailabilityDateChange}
                    className="w-full p-2 border rounded-md text-gray-900"
                    min={availabilityDates.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="roomTypeSelect" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type
                  </label>
                  <select
                    id="roomTypeSelect"
                    value={selectedRoomTypeId}
                    onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                    className="w-full p-2 border rounded-md text-gray-900"
                    required
                  >
                    <option value="">Select room type</option>
                    {roomTypes.map(roomType => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.name} - {roomType.totalRooms} rooms total
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={checkRoomAvailability}
                  isLoading={checkingAvailability}
                  className="flex items-center gap-1"
                >
                  <Search size={16} />
                  Check Availability
                </Button>
              </div>
              
              {/* Availability Results */}
              {availabilityResults && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-blue-900 mb-3">Availability Results</h4>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex justify-between mb-3">
                      <div>
                        <span className="text-gray-700">Room Type:</span>
                        <span className="ml-2 text-blue-800 font-medium">
                          {roomTypes.find(rt => rt.id === selectedRoomTypeId)?.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-700">Date Range:</span>
                        <span className="ml-2 text-blue-800 font-medium">
                          {new Date(availabilityDates.startDate).toLocaleDateString()} - {new Date(availabilityDates.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-md border border-blue-200">
                        <div className="text-sm text-gray-600">Total Rooms</div>
                        <div className="text-2xl font-bold text-blue-800">
                          {roomTypes.find(rt => rt.id === selectedRoomTypeId)?.totalRooms}
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-md border border-blue-200">
                        <div className="text-sm text-gray-600">Available Rooms</div>
                        <div className="text-2xl font-bold text-green-700">
                          {availabilityResults.availability}
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-md border border-blue-200">
                        <div className="text-sm text-gray-600">Booked Rooms</div>
                        <div className="text-2xl font-bold text-blue-800">
                          {roomTypes.find(rt => rt.id === selectedRoomTypeId)?.totalRooms - availabilityResults.availability}
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-md border border-blue-200">
                        <div className="text-sm text-gray-600">Occupancy Rate</div>
                        <div className="text-2xl font-bold text-blue-800">
                          {Math.round(((roomTypes.find(rt => rt.id === selectedRoomTypeId)?.totalRooms - availabilityResults.availability) / roomTypes.find(rt => rt.id === selectedRoomTypeId)?.totalRooms) * 100)}%
                        </div>
                      </div>
                    </div>
                    
                    {availabilityResults.availableRooms === 0 && (
                      <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded-md text-center">
                        This room type is fully booked for the selected dates.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            {roomTypes.map(roomType => renderRoomType(roomType))}
            
            {roomTypes.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <BedDouble className="w-16 h-16 mx-auto text-blue-300 mb-4" />
                <h3 className="text-xl font-medium text-blue-800 mb-2">No room types added yet</h3>
                <p className="text-blue-600 mb-6">Add your first room type to start receiving bookings</p>
                {!showAddRoomForm && (
                  <Button 
                    variant="primary" 
                    onClick={() => setShowAddRoomForm(true)}
                    className="flex items-center gap-1 mx-auto"
                  >
                    <Plus size={16} />
                    Add Room Type
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Room Edit Modal */}
      {showEditRoomModal && roomToEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-blue-900">Edit Room Count</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowEditRoomModal(false);
                  setRoomToEdit(null);
                }}
                disabled={isUpdatingRoom}
              >
                <X size={20} />
              </button>
            </div>
            
            {updateError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {updateError}
              </div>
            )}
            
            {updateSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                {updateSuccess}
              </div>
            )}
            
            <form onSubmit={updateRoomCount}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type
                </label>
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="font-medium text-blue-800">{roomToEdit.name}</p>
                  <p className="text-sm text-blue-700">Current count: {roomToEdit.totalRooms} rooms</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="newRoomCount" className="block text-sm font-medium text-gray-700 mb-2">
                  New Total Rooms
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                    onClick={() => setNewRoomCount(prev => Math.max(0, parseInt(prev) - 1).toString())}
                    disabled={isUpdatingRoom}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    id="newRoomCount"
                    value={newRoomCount}
                    onChange={(e) => setNewRoomCount(e.target.value)}
                    min="0"
                    className="flex-1 p-2 border-t border-b border-gray-300 text-center text-gray-800"
                    disabled={isUpdatingRoom}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                    onClick={() => setNewRoomCount(prev => (parseInt(prev) + 1).toString())}
                    disabled={isUpdatingRoom}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {parseInt(newRoomCount) < roomToEdit.totalRooms ? (
                    <span className="text-orange-600">Warning: Reducing room count may cancel existing bookings if necessary.</span>
                  ) : parseInt(newRoomCount) > roomToEdit.totalRooms ? (
                    <span className="text-green-600">You are adding {parseInt(newRoomCount) - roomToEdit.totalRooms} new rooms.</span>
                  ) : (
                    <span>No change to current room count.</span>
                  )}
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => {
                    setShowEditRoomModal(false);
                    setRoomToEdit(null);
                  }}
                  disabled={isUpdatingRoom}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 ${isUpdatingRoom ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={isUpdatingRoom}
                >
                  {isUpdatingRoom && (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  )}
                  {isUpdatingRoom ? 'Updating...' : 'Update Room Count'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}