'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Star, Search, Calendar, ArrowRight } from 'lucide-react';

export default function HotelsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState({
    city: searchParams.get('city') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    minPrice: searchParams.get('minPrice') || '0',
    maxPrice: searchParams.get('maxPrice') || '10000',
    starRating: searchParams.get('starRating') || '0',
    name: searchParams.get('name') || ''
  });

  const [hotels, setHotels] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const hasSearchParams = 
      searchParams.get('city') || 
      searchParams.get('name') || 
      searchParams.get('checkIn');
    
    if (hasSearchParams) {
      performSearch();
    }

    if (!hasSearchParams) {
      const savedSearch = localStorage.getItem('hotelSearchParams');
      if (savedSearch) {
        const parsedParams = JSON.parse(savedSearch);
        setFormState(parsedParams);
        
        const queryParams = new URLSearchParams();
        Object.entries(parsedParams).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        
        const url = `${window.location.pathname}?${queryParams.toString()}`;
        window.history.pushState({ path: url }, '', url);
        performSearch();
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStarRatingChange = (rating) => {
    setFormState(prev => ({
      ...prev,
      starRating: rating.toString()
    }));
  };

  const handleImageError = (hotelId) => {
    setImageErrors(prev => ({
      ...prev,
      [hotelId]: true
    }));
  };

  const performSearch = async () => {
    setIsSearching(true);
    setError('');

    try {
      const queryParams = new URLSearchParams();
      Object.entries(formState).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/hotels/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch hotels');
      }

      const data = await response.json();
      console.log('Fetched hotels:', data);
      setHotels(data || []);
    } catch (err) {
      console.error('Error searching hotels:', err);
      setError(err.message || 'An error occurred while searching for hotels');
    } finally {
      setIsSearching(false);
    }
  };

  const searchHotels = (e) => {
    e.preventDefault();
    
    localStorage.setItem('hotelSearchParams', JSON.stringify(formState));
    
    const queryParams = new URLSearchParams();
    Object.entries(formState).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const url = `${window.location.pathname}?${queryParams.toString()}`;
    window.history.pushState({ path: url }, '', url);
    
    performSearch();
  };

  const clearSearch = () => {
    setFormState({
      city: '',
      checkIn: '',
      checkOut: '',
      minPrice: '0',
      maxPrice: '10000',
      starRating: '0',
      name: ''
    });
    
    localStorage.removeItem('hotelSearchParams');
    
    window.history.pushState({}, '', window.location.pathname);
    
    setHotels([]);
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const activeStars = Math.floor(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${i <= activeStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    
    return <div className="flex">{stars}</div>;
  };

  const getLowestPrice = (roomTypes) => {
    if (!roomTypes || roomTypes.length === 0) return 0;
    return Math.min(...roomTypes.map(room => room.pricePerNight));
  };

  // Convert decimal coordinates to DMS (Degrees, Minutes, Seconds) format for Google Maps
  const convertToDMS = (coordinate, isLatitude) => {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    
    const direction = isLatitude
      ? (coordinate >= 0 ? "N" : "S")
      : (coordinate >= 0 ? "E" : "W");
    
    return `${degrees}%C2%B0${minutes}'${seconds}"${direction}`;
  };

  // Create Google Maps URL using DMS format
  const createGoogleMapsUrl = (latitude, longitude) => {
    // Use default coordinates if none provided
    const lat = latitude || 43.7311331;
    const lng = longitude || -79.4042678;
    
    // Convert to DMS format
    const latDMS = convertToDMS(lat, true);
    const lngDMS = convertToDMS(lng, false);
    
    // Create the URL with both DMS format and decimal coordinates for positioning
    return `https://www.google.ca/maps/place/${latDMS}+${lngDMS}/@${lat},${lng},17z/`;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8 text-blue-900">Find Your Perfect Stay</h1>
          <div className="animate-pulse">
            <div className="bg-blue-200 h-64 rounded-xl mb-8"></div>
            <div className="bg-blue-200 h-96 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-blue-900">Find Your Perfect Stay</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-200 mb-8">
          <form onSubmit={searchHotels} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-800 mb-1">City or Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="city"
                    name="city"
                    value={formState.city}
                    onChange={handleInputChange}
                    className="w-full p-2 pl-10 border rounded-md text-gray-900"
                    placeholder="Where are you going?"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">Hotel Name (optional)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    className="w-full p-2 pl-10 border rounded-md text-gray-900"
                    placeholder="Search by hotel name"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkIn" className="block text-sm font-medium text-gray-800 mb-1">Check-in Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={formState.checkIn}
                    onChange={handleInputChange}
                    className="w-full p-2 pl-10 border rounded-md text-gray-900"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="checkOut" className="block text-sm font-medium text-gray-800 mb-1">Check-out Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={formState.checkOut}
                    onChange={handleInputChange}
                    min={formState.checkIn}
                    className="w-full p-2 pl-10 border rounded-md text-gray-900"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Price Range ($ per night)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    value={formState.minPrice}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md text-gray-900"
                    min="0"
                    placeholder="Min"
                  />
                  <ArrowRight size={18} className="text-gray-400" />
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    value={formState.maxPrice}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md text-gray-900"
                    min={formState.minPrice}
                    placeholder="Max"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Star Rating (minimum)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarRatingChange(star)}
                      className={`p-2 rounded-md ${parseInt(formState.starRating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className={`w-6 h-6 ${parseInt(formState.starRating) >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : (
                  <>
                    <Search size={18} />
                    Search Hotels
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {hotels.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-blue-900">
                Found {hotels.length} hotels
                {formState.city && ` in ${formState.city}`}
              </h2>
            </div>
          )}
          
          <div className="space-y-6">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-lg shadow-md border border-blue-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 relative h-48 md:h-auto">
                    {imageErrors[hotel.id] ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center p-4">
                          <div className="mb-2">
                            <MapPin className="h-10 w-10 mx-auto text-gray-400" />
                          </div>
                          <p className="text-gray-600 text-sm">Image not available</p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={hotel.images?.[0]?.url || '/hotel-placeholder.jpg'}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(hotel.id)}
                      />
                    )}
                  </div>
                  
                  <div className="p-4 md:w-2/3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                      <div className="flex items-center">
                        {renderStarRating(hotel.starRating)}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center text-gray-700">
                      <MapPin size={16} className="mr-1" />
                      <a 
                        href={createGoogleMapsUrl(hotel.location?.latitude, hotel.location?.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 hover:underline"
                      >
                        {hotel.address}
                      </a>
                    </div>
                    
                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Available Room Types:</h4>
                        <ul className="mt-1 text-sm text-gray-800">
                          {hotel.roomTypes.slice(0, 3).map((room) => (
                            <li key={room.id} className="mb-1">
                              <span className="font-medium">{room.name}</span> - ${room.pricePerNight}/night ({room.availableRooms} available)
                            </li>
                          ))}
                          {hotel.roomTypes.length > 3 && (
                            <li className="text-blue-700 font-medium">+ {hotel.roomTypes.length - 3} more room types</li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right">
                          <p className="text-sm text-gray-700">Starting from</p>
                          <p className="text-2xl font-bold text-blue-700">${getLowestPrice(hotel.roomTypes)}</p>
                          <p className="text-sm text-gray-700">per night</p>
                        </div>
                        
                        <a 
                          href={`/hotels/${hotel.id}`} 
                          className="mt-2 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 inline-block text-center"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {hotels.length === 0 && !isSearching && !error && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md border border-blue-200">
              <Search size={48} className="mx-auto text-blue-300 mb-4" />
              <h3 className="text-xl font-medium text-blue-800 mb-2">Search for your next stay</h3>
              <p className="text-blue-700">Enter destination, dates and other preferences to find the perfect hotel</p>
            </div>
          )}
          
          {isSearching && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}