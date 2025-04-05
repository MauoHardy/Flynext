"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plane, Home, Calendar, MapPin, Filter, Search } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

export default function BookingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-4 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  // Sample booking data - would come from API in real app
  const bookings = [
    {
      id: 'b001',
      type: 'flight',
      title: 'Flight to Paris',
      image: 'https://source.unsplash.com/random/300x200/?paris,eiffel',
      date: 'Aug 23, 2023',
      details: 'JFK to CDG, Air France',
      status: 'upcoming',
      price: '$849.99'
    },
    {
      id: 'b002',
      type: 'hotel',
      title: 'Grand Hyatt New York',
      image: 'https://source.unsplash.com/random/300x200/?hotel,luxury',
      date: 'Jul 15, 2023 - Jul 20, 2023',
      details: 'Deluxe King Room',
      status: 'completed',
      price: '$1,249.50'
    },
    {
      id: 'b003',
      type: 'flight',
      title: 'Return from Paris',
      image: 'https://source.unsplash.com/random/300x200/?airplane,sky',
      date: 'Aug 30, 2023',
      details: 'CDG to JFK, Air France',
      status: 'upcoming',
      price: '$789.99'
    },
    {
      id: 'b004',
      type: 'hotel',
      title: 'Marriott Champs Elysees',
      image: 'https://source.unsplash.com/random/300x200/?paris,hotel',
      date: 'Aug 23, 2023 - Aug 30, 2023',
      details: 'Junior Suite',
      status: 'upcoming',
      price: '$2,100.00'
    },
    {
      id: 'b005',
      type: 'hotel',
      title: 'The Plaza Hotel',
      image: 'https://source.unsplash.com/random/300x200/?newyork,plaza',
      date: 'Jun 10, 2023 - Jun 15, 2023',
      details: 'Executive Suite',
      status: 'completed',
      price: '$1,850.75'
    },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Bookings</h1>
            <p className="text-gray-600 mt-1">Manage your flights and hotel reservations</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2">
            <Link href="/flights">
              <Button variant="outline" className="flex items-center gap-1">
                <Plane size={16} />
                Book Flight
              </Button>
            </Link>
            <Link href="/hotels">
              <Button variant="primary" className="flex items-center gap-1">
                <Home size={16} />
                Book Hotel
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-full md:w-auto">
              <Input
                placeholder="Search bookings..."
                leftIcon={<Search className="w-5 h-5 text-gray-400" />}
                className="min-w-[250px]"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter size={14} />
                All
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Plane size={14} />
                Flights
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Home size={14} />
                Hotels
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Calendar size={14} />
                Upcoming
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Calendar size={14} />
                Completed
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 h-48 md:h-auto">
                  <img 
                    src={booking.image} 
                    alt={booking.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-3/4 flex flex-col md:flex-row justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center mb-2">
                      {booking.type === 'flight' ? (
                        <Plane className="w-5 h-5 text-blue-500 mr-2" />
                      ) : (
                        <Home className="w-5 h-5 text-blue-500 mr-2" />
                      )}
                      <span className="text-blue-500 text-sm font-medium">
                        {booking.type === 'flight' ? 'Flight' : 'Hotel'}
                      </span>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'upcoming' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {booking.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{booking.title}</h3>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      {booking.type === 'flight' ? (
                        <Plane className="w-4 h-4 mr-2" />
                      ) : (
                        <MapPin className="w-4 h-4 mr-2" />
                      )}
                      <span>{booking.details}</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end justify-between">
                    <div className="text-xl font-bold text-blue-700">{booking.price}</div>
                    <div className="mt-4 space-x-2">
                      <Button variant="outline" size="sm">Details</Button>
                      {booking.status === 'upcoming' && (
                        <Button variant="secondary" size="sm" className="text-red-500">Cancel</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
