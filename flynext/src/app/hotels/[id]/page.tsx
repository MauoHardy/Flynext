'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Star, Check, Wifi, Coffee, Utensils, Dumbbell, 
  Car, Tv, User, Calendar, ArrowLeft, ChevronDown, ChevronUp,
  X, ArrowRight, ArrowLeft as ArrowLeftIcon
} from 'lucide-react';

export default function HotelDetailPage({ params }: { params: { id: string } }) {
  // Unwrap params if it's a Promise
  const unwrappedParams = React.use(params);
  const hotelId = unwrappedParams.id;

  const router = useRouter();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Booking state
  const [booking, setBooking] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomId: '',
    rooms: 1
  });

  // Price calculation
  const [totalPrice, setTotalPrice] = useState(0);
  const [numNights, setNumNights] = useState(1);

  // Create a ref for the room types section
  const roomTypesRef = React.useRef<HTMLDivElement>(null);

  // State for room image gallery modal
  const [roomGalleryOpen, setRoomGalleryOpen] = useState(false);
  const [activeRoomImages, setActiveRoomImages] = useState<any[]>([]);
  const [activeRoomImageIndex, setActiveRoomImageIndex] = useState(0);
  const [activeRoomName, setActiveRoomName] = useState('');
  
  useEffect(() => {
    setMounted(true);
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        
        // Try to get reservation data from localStorage
        const savedSearch = localStorage.getItem('hotelSearchParams');
        if (savedSearch) {
          const parsedParams = JSON.parse(savedSearch);
          setBooking(prev => ({
            ...prev,
            checkIn: parsedParams.checkIn || '',
            checkOut: parsedParams.checkOut || ''
          }));
        }
        
        // Construct URL with query parameters if available
        let url = `/api/hotels/${hotelId}`;
        const queryParams = new URLSearchParams();
        
        if (booking.checkIn) queryParams.append('checkIn', booking.checkIn);
        if (booking.checkOut) queryParams.append('checkOut', booking.checkOut);
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch hotel details');
        }
        
        const data = await response.json();
        setHotel(data);

        // Calculate number of nights if dates are selected
        calculateStayDuration(booking.checkIn, booking.checkOut);
      } catch (err: any) {
        console.error('Error fetching hotel details:', err);
        setError(err.message || 'Failed to load hotel details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotelDetails();
  }, [hotelId]);

  // Recalculate when dates change
  useEffect(() => {
    if (booking.checkIn && booking.checkOut) {
      calculateStayDuration(booking.checkIn, booking.checkOut);
    }

    // Update URL with check-in/out dates to refresh room availability
    if (hotel && (booking.checkIn || booking.checkOut)) {
      fetchUpdatedAvailability();
    }
  }, [booking.checkIn, booking.checkOut]);

  // Recalculate total price when selected room, num nights or rooms count changes
  useEffect(() => {
    if (booking.roomId && numNights > 0) {
      const selectedRoom = hotel?.roomTypes.find(room => room.id === booking.roomId);
      if (selectedRoom) {
        setTotalPrice(selectedRoom.pricePerNight * booking.rooms * numNights);
      }
    } else {
      setTotalPrice(0);
    }
  }, [booking.roomId, booking.rooms, numNights, hotel]);

  const calculateStayDuration = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) {
      setNumNights(1);
      return;
    }
    
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    setNumNights(nights > 0 ? nights : 1);
  };

  const scrollToRoomTypes = () => {
    if (roomTypesRef.current) {
      roomTypesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchUpdatedAvailability = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (booking.checkIn) queryParams.append('checkIn', booking.checkIn);
      if (booking.checkOut) queryParams.append('checkOut', booking.checkOut);
      
      const response = await fetch(`/api/hotels/${hotelId}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to update availability');
      }
      
      const data = await response.json();
      setHotel(data);
      
      // Scroll to room types section after updating availability if there are dates selected
      if (booking.checkIn && booking.checkOut) {
        setTimeout(() => scrollToRoomTypes(), 100);
      }
    } catch (err) {
      console.error('Error updating availability:', err);
    }
  };
  
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };
  
  const toggleRoomExpand = (roomId: string) => {
    setExpandedRoom(expandedRoom === roomId ? null : roomId);
  };

  const handleRoomSelection = (roomId: string) => {
    setBooking(prev => ({
      ...prev,
      roomId
    }));
  };

  const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBooking(prev => ({
        ...prev,
        guests: value
      }));
    }
  };

  const handleRoomsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBooking(prev => ({
        ...prev,
        rooms: value
      }));
    }
  };
  
  const renderStarRating = (rating: number) => {
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
  
  const renderAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (amenityLower.includes('coffee') || amenityLower.includes('bar')) return <Coffee className="w-4 h-4" />;
    if (amenityLower.includes('restaurant') || amenityLower.includes('breakfast')) return <Utensils className="w-4 h-4" />;
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return <Dumbbell className="w-4 h-4" />;
    if (amenityLower.includes('parking')) return <Car className="w-4 h-4" />;
    if (amenityLower.includes('tv')) return <Tv className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };
  
  const handleBookNow = () => {
    if (!booking.checkIn || !booking.checkOut || !booking.roomId) {
      alert('Please select check-in/out dates and a room type');
      return;
    }

    const selectedRoom = hotel?.roomTypes.find(room => room.id === booking.roomId);
    if (!selectedRoom) {
      alert('Invalid room selection');
      return;
    }
    
    // Prepare booking data for the booking page
    const bookingData = {
      hotelId: hotel.id,
      roomTypeId: booking.roomId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      roomsBooked: booking.rooms,
      guests: booking.guests,
      totalPrice: totalPrice
    };
    
    // Save booking data to localStorage
    localStorage.setItem('currentBookingData', JSON.stringify(bookingData));
    
    // Navigate to booking page
    router.push('/booking/hotel');
  };

  const openRoomGallery = (roomImages: any[], roomName: string) => {
    setActiveRoomImages(roomImages);
    setActiveRoomName(roomName);
    setActiveRoomImageIndex(0);
    setRoomGalleryOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeRoomGallery = () => {
    setRoomGalleryOpen(false);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  const nextRoomImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeRoomImages.length > 0) {
      setActiveRoomImageIndex((prevIndex) => 
        prevIndex === activeRoomImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevRoomImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeRoomImages.length > 0) {
      setActiveRoomImageIndex((prevIndex) => 
        prevIndex === 0 ? activeRoomImages.length - 1 : prevIndex - 1
      );
    }
  };
  
  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 bg-blue-100">
        <div className="animate-pulse">
          <div className="h-8 bg-blue-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-blue-200 rounded-xl mb-8"></div>
          <div className="h-32 bg-blue-200 rounded-xl mb-4"></div>
          <div className="h-32 bg-blue-200 rounded-xl mb-4"></div>
          <div className="h-32 bg-blue-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 bg-blue-100">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 bg-blue-100">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-700 mb-6 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to search results
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Could not find hotel details'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-700 mb-6 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to search results
        </button>
        
        {/* Hotel Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{hotel.name}</h1>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center text-blue-700">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{hotel.address}</span>
            </div>
            <div className="flex items-center">
              {renderStarRating(hotel.starRating)}
            </div>
          </div>
        </div>
        
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative h-80 md:h-96 rounded-lg overflow-hidden shadow-md">
              {imageErrors[activeImage] ? (
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <div className="text-center p-4">
                    <MapPin className="h-12 w-12 mx-auto text-blue-400 mb-2" />
                    <p className="text-blue-600">Image not available</p>
                  </div>
                </div>
              ) : (
                <img
                  src={hotel.images?.[activeImage]?.url || '/hotel-placeholder.jpg'}
                  alt={`${hotel.name} - Main view`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(activeImage)}
                />
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {hotel.images?.slice(1, 5).map((image, index) => (
                <div 
                  key={index} 
                  className={`relative h-36 rounded-lg overflow-hidden cursor-pointer shadow-md ${activeImage === index + 1 ? 'ring-2 ring-blue-600' : ''}`}
                  onClick={() => setActiveImage(index + 1)}
                >
                  {imageErrors[index + 1] ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <MapPin className="h-8 w-8 text-gray-400" />
                    </div>
                  ) : (
                    <img
                      src={image.url}
                      alt={`${hotel.name} - View ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(index + 1)}
                    />
                  )}
                </div>
              ))}
              {hotel.images?.length > 5 && (
                <div className="relative h-36 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer">
                  <span className="text-gray-700 font-medium">+{hotel.images.length - 5} more</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hotel Description & Booking Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-blue-900 mb-4">About this hotel</h2>
            <p className="text-blue-800 mb-6">
              {hotel.description || "This elegant hotel offers a comfortable stay with modern amenities and convenient location."}
            </p>
            
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {hotel.amenities?.map((amenity, index) => (
                <div key={index} className="flex items-center text-blue-700">
                  {renderAmenityIcon(amenity.name)}
                  <span className="ml-2">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-600 p-6 rounded-lg shadow-md text-white">
            <h3 className="text-lg font-semibold mb-4">Book Your Stay</h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Check-in Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" size={18} />
                  <input
                    type="date"
                    value={booking.checkIn}
                    onChange={(e) => setBooking(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="w-full p-2 pl-10 border rounded-md text-blue-900 bg-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Check-out Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" size={18} />
                  <input
                    type="date"
                    value={booking.checkOut}
                    onChange={(e) => setBooking(prev => ({ ...prev, checkOut: e.target.value }))}
                    min={booking.checkIn}
                    className="w-full p-2 pl-10 border rounded-md text-blue-900 bg-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Guests</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" size={18} />
                    <input
                      type="number"
                      value={booking.guests}
                      onChange={handleGuestChange}
                      min="1"
                      className="w-full p-2 pl-10 border rounded-md text-blue-900 bg-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Rooms</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={booking.rooms}
                      onChange={handleRoomsChange}
                      min="1"
                      className="w-full p-2 pl-3 border rounded-md text-blue-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {booking.roomId && (
              <div className="bg-white p-3 rounded-md border mb-4 text-blue-800">
                <h4 className="font-medium text-blue-900">Booking Summary</h4>
                <div className="text-sm mt-2">
                  <p><span className="font-medium">Stay:</span> {numNights} night{numNights !== 1 ? 's' : ''}</p>
                  <p><span className="font-medium">Rooms:</span> {booking.rooms}</p>
                  <p><span className="font-medium">Guests:</span> {booking.guests}</p>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="flex justify-between">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-blue-700">${totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={!booking.checkIn || !booking.checkOut ? fetchUpdatedAvailability : booking.roomId ? handleBookNow : scrollToRoomTypes}
              disabled={(!booking.checkIn || !booking.checkOut) && !booking.roomId}
              className={`w-full p-2 rounded-md font-medium ${
                (!booking.checkIn || !booking.checkOut) && !booking.roomId
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-white text-blue-700 hover:bg-blue-50'
              }`}
            >
              {!booking.checkIn || !booking.checkOut
                ? 'Search Availability'
                : !booking.roomId
                  ? 'Select a room below'
                  : 'Book Now'}
            </button>
          </div>
        </div>
        
        {/* Room Types */}
        <div ref={roomTypesRef}>
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Available Room Types</h2>
          
          <div className="space-y-6">
            {hotel.roomTypes?.map((room) => (
              <div key={room.id} className="border border-blue-200 rounded-lg overflow-hidden bg-white shadow-md">
                <div 
                  className="flex justify-between items-center p-4 border-b border-blue-200 cursor-pointer hover:bg-blue-50"
                  onClick={() => toggleRoomExpand(room.id)}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{room.name}</h3>
                    <p className="text-blue-700">
                      <span className="font-medium">${room.pricePerNight}</span> per night
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm mr-2 ${
                      booking.checkIn && booking.checkOut 
                        ? (room.availableRooms > 0 ? 'text-green-600' : 'text-red-600')
                        : 'text-blue-700'
                    }`}>
                      {booking.checkIn && booking.checkOut
                        ? (room.availableRooms > 0 ? `${room.availableRooms} available` : 'Not available')
                        : `Total rooms: ${room.totalRooms}`
                      }
                    </span>
                    {expandedRoom === room.id ? 
                      <ChevronUp className="w-5 h-5 text-blue-500" /> : 
                      <ChevronDown className="w-5 h-5 text-blue-500" />
                    }
                  </div>
                </div>
                
                {expandedRoom === room.id && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-blue-800 mb-4">{room.description}</p>
                        
                        <h4 className="font-medium text-blue-900 mb-2">Room Amenities</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {room.amenities?.map((amenity, index) => (
                            <div key={index} className="flex items-center text-blue-700">
                              {renderAmenityIcon(amenity.name)}
                              <span className="ml-2 text-sm">{amenity.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {room.images && room.images.length > 0 && (
                        <div>
                          <h4 className="font-medium text-blue-900 mb-2">Room Images</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {room.images.slice(0, 4).map((image, index) => (
                              <div 
                                key={index} 
                                className="relative h-24 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => openRoomGallery(room.images, room.name)}
                              >
                                <img 
                                  src={image.url} 
                                  alt={`${room.name} - Image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/room-placeholder.jpg';
                                  }}
                                />
                                {index === 3 && room.images.length > 4 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                                    +{room.images.length - 4} more
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {room.images.length > 0 && (
                            <button 
                              onClick={() => openRoomGallery(room.images, room.name)}
                              className="mt-2 text-sm text-blue-700 hover:text-blue-800 flex items-center"
                            >
                              <ArrowRight className="w-4 h-4 mr-1" /> View all {room.images.length} photos
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-blue-200">
                      <div className="mb-4 sm:mb-0">
                        <p className="text-sm text-blue-600">Price per night</p>
                        <p className="text-2xl font-bold text-blue-700">${room.pricePerNight}</p>
                        <p className="text-sm text-blue-600">
                          {booking.checkIn && booking.checkOut
                            ? (room.availableRooms > 0 ? `${room.availableRooms} rooms available` : 'No rooms available')
                            : `Total capacity: ${room.totalRooms} rooms`
                          }
                        </p>
                      </div>
                      
                      <button
                        disabled={
                          (booking.checkIn && booking.checkOut && room.availableRooms <= 0) || 
                          (!booking.checkIn || !booking.checkOut)
                        }
                        className={`px-6 py-2 rounded-md ${
                          (booking.checkIn && booking.checkOut && room.availableRooms <= 0) || 
                          (!booking.checkIn || !booking.checkOut)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : booking.roomId === room.id
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        onClick={() => handleRoomSelection(room.id)}
                      >
                        {booking.roomId === room.id 
                          ? 'Selected' 
                          : (booking.checkIn && booking.checkOut && room.availableRooms <= 0) 
                            ? 'Not Available' 
                            : 'Book Room'
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {hotel.roomTypes?.length === 0 && (
              <div className="bg-white border border-blue-200 rounded-lg p-8 text-center shadow-md">
                <p className="text-blue-700">No room types available for this hotel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Room Image Gallery Modal */}
      {roomGalleryOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeRoomGallery}
        >
          <div className="relative w-full max-w-4xl p-4">
            <button 
              className="absolute right-4 top-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 z-10"
              onClick={closeRoomGallery}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-white text-center mb-4">
              <h3 className="text-xl">{activeRoomName}</h3>
              <p className="text-sm">
                Image {activeRoomImageIndex + 1} of {activeRoomImages.length}
              </p>
            </div>
            
            <div className="relative h-[60vh] bg-black/30 rounded-lg overflow-hidden">
              <img 
                src={activeRoomImages[activeRoomImageIndex]?.url || '/room-placeholder.jpg'} 
                alt={`${activeRoomName} - Large view`}
                className="w-full h-full object-contain"
              />
              
              <button 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
                onClick={prevRoomImage}
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
                onClick={nextRoomImage}
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
            
            {activeRoomImages.length > 5 && (
              <div className="flex justify-center gap-2 mt-4 overflow-x-auto p-2">
                {activeRoomImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`h-16 w-24 rounded cursor-pointer overflow-hidden ${
                      index === activeRoomImageIndex ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRoomImageIndex(index);
                    }}
                  >
                    <img 
                      src={image.url}
                      alt={`${activeRoomName} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
