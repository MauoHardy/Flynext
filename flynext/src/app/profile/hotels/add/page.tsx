'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Trash2, AlertCircle, Save, RefreshCw, MapPin, Image } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import { useAuth } from '@/app/contexts/AuthContext';
import { useHotels } from '@/app/contexts/HotelContext';

// Common amenities that hotels might have
const COMMON_AMENITIES = [
  'Free WiFi',
  'Parking',
  'Swimming Pool',
  'Fitness Center',
  'Restaurant',
  'Room Service',
  'Spa',
  'Air Conditioning',
  'Bar/Lounge',
  'Business Center',
  'Laundry Service',
  'Airport Shuttle',
  'Concierge Service',
  '24-Hour Front Desk',
  'Breakfast Included',
  'Beachfront Access'
];

export default function AddHotelPage() {
  const { user, isAuthenticated, isLoading, refreshSession } = useAuth();
  const { addHotel } = useHotels();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const [formState, setFormState] = useState({
    name: '',
    address: '',
    logo: '',
    location: {
      latitude: '',
      longitude: ''
    },
    starRating: 3,
    images: [''],
    amenities: ['']
  });
  
  // State for common amenities selector
  const [showAmenitiesSelector, setShowAmenitiesSelector] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log("Add Hotel Page - Auth state:", { 
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
        console.log("Add Hotel page - Not authenticated, attempting refresh");
        setIsRefreshing(true);
        try {
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.log("Add Hotel page - Refresh failed, redirecting to login");
            router.push('/login?redirect=/profile/hotels/add');
          } else {
            console.log("Add Hotel page - Refresh successful");
          }
        } catch (error) {
          console.error("Add Hotel page - Refresh error:", error);
          router.push('/login?redirect=/profile/hotels/add');
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
          router.push('/login?redirect=/profile/hotels/add');
        }, 2000);
      }
    } catch (error) {
      console.error("Manual refresh error:", error);
      setError('Error refreshing session');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested location object
    if (name === 'latitude' || name === 'longitude') {
      setFormState(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormState(prev => ({
      ...prev,
      starRating: rating
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formState.images];
    newImages[index] = value;
    setFormState(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const addImageField = () => {
    setFormState(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    if (formState.images.length === 1) return;
    
    const newImages = formState.images.filter((_, i) => i !== index);
    setFormState(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleAmenityChange = (index, value) => {
    const newAmenities = [...formState.amenities];
    newAmenities[index] = value;
    setFormState(prev => ({
      ...prev,
      amenities: newAmenities
    }));
  };

  const addAmenityField = () => {
    setFormState(prev => ({
      ...prev,
      amenities: [...prev.amenities, '']
    }));
  };

  const removeAmenityField = (index) => {
    if (formState.amenities.length === 1) return;
    
    const newAmenities = formState.amenities.filter((_, i) => i !== index);
    setFormState(prev => ({
      ...prev,
      amenities: newAmenities
    }));
  };
  
  // Handle adding a common amenity
  const addCommonAmenity = (amenity) => {
    // Check if this amenity already exists
    if (!formState.amenities.includes(amenity)) {
      // Find an empty field if one exists
      const emptyIndex = formState.amenities.findIndex(a => a === '');
      
      if (emptyIndex !== -1) {
        // Replace empty field with the new amenity
        const newAmenities = [...formState.amenities];
        newAmenities[emptyIndex] = amenity;
        setFormState(prev => ({
          ...prev,
          amenities: newAmenities
        }));
      } else {
        // Add as a new field
        setFormState(prev => ({
          ...prev,
          amenities: [...prev.amenities, amenity]
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formState.name.trim()) {
      setError('Hotel name is required');
      return;
    }
    
    if (!formState.address.trim()) {
      setError('Hotel address is required');
      return;
    }
    
    // Validate that all image URLs are not empty
    const validImages = formState.images.filter(url => url.trim() !== '');
    if (validImages.length === 0) {
      setError('At least one image URL is required');
      return;
    }
    
    // Validate that all amenities are not empty
    const validAmenities = formState.amenities.filter(amenity => amenity.trim() !== '');
    if (validAmenities.length === 0) {
      setError('At least one amenity is required');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      // Prepare the data for API call
      const hotelData = {
        name: formState.name.trim(),
        logo: formState.logo.trim() || null,
        address: formState.address.trim(),
        location: {
          latitude: parseFloat(formState.location.latitude) || null,
          longitude: parseFloat(formState.location.longitude) || null
        },
        starRating: formState.starRating,
        images: validImages,
        amenities: validAmenities
      };
      console.log("Submitting hotel data:", hotelData);
      // Use the context function instead of direct fetch
      await addHotel(hotelData);
      
      // Show success message and reset form
      setSuccess('Hotel added successfully!');
      setFormState({
        name: '',
        address: '',
        logo: '',
        location: {
          latitude: '',
          longitude: ''
        },
        starRating: 3,
        images: [''],
        amenities: ['']
      });
      
      // Redirect to hotel management page after a short delay
      setTimeout(() => {
        router.push('/profile/hotels/view');
      }, 2000);
      
    } catch (err) {
      console.error('Error adding hotel:', err);
      setError(err.message || 'Failed to add hotel. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isRefreshing) {
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
              onClick={() => router.push('/login?redirect=/profile/hotels/add')}
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
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Add New Hotel</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Hotel Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md text-gray-800"
                placeholder="Enter hotel name"
                required
              />
            </div>
            
            {/* Logo URL Field */}
            <div className="mb-4">
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Image size={16} className="mr-1" />
                  Logo URL (optional)
                </div>
              </label>
              <input
                type="url"
                id="logo"
                name="logo"
                value={formState.logo}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md text-gray-800"
                placeholder="Enter logo image URL"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formState.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md text-gray-800"
                placeholder="Enter full address"
                required
              />
            </div>
            
            {/* Location Fields */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  Location Coordinates (optional)
                </div>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-xs text-gray-500 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    id="latitude"
                    name="latitude"
                    value={formState.location.latitude}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md text-gray-800"
                    placeholder="e.g. 43.6532"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-xs text-gray-500 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    id="longitude"
                    name="longitude"
                    value={formState.location.longitude}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md text-gray-800"
                    placeholder="e.g. -79.3832"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Helps travelers find your property on the map. You can find these coordinates using Google Maps.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotel Images (URLs)
              </label>
              <div className="space-y-3">
                {formState.images.map((image, index) => (
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
                      disabled={formState.images.length === 1}
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
                  Amenities
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
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Common Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_AMENITIES.map((amenity) => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => addCommonAmenity(amenity)}
                        className={`px-2 py-1 text-xs rounded-full border ${
                          formState.amenities.includes(amenity)
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
                {formState.amenities.map((amenity, index) => (
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
                      disabled={formState.amenities.length === 1}
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
                onClick={() => router.push('/profile/hotels/view')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex items-center gap-1"
              >
                {isSubmitting ? 'Adding Hotel...' : (
                  <>
                    <Save size={18} />
                    Add Hotel
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}