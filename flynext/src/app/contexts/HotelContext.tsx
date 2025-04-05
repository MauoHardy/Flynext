'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth';

// Types for Hotels
interface Hotel {
  id: string;
  name: string;
  address: string;
  logo?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  starRating: number;
  images: { id: string; url: string }[];
  amenities: { id: string; name: string }[];
  roomTypes?: any[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

interface HotelContextType {
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  fetchHotels: () => Promise<void>;
  addHotel: (hotelData: any) => Promise<any>;
  updateHotel: (hotelId: string, hotelData: any) => Promise<any>;
  deleteHotel: (hotelId: string) => Promise<boolean>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const useHotels = () => {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotels must be used within a HotelProvider');
  }
  return context;
};

export const HotelProvider = ({ children }: { children: ReactNode }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all hotels owned by the authenticated user
  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth('/api/profile/hotels');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch hotels');
      }
      
      const data = await response.json();
      setHotels(data);
    } catch (err: any) {
      console.error('Error fetching hotels:', err);
      setError(err.message || 'Failed to load hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new hotel
  const addHotel = useCallback(async (hotelData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use fetchWithAuth instead of directly accessing localStorage
      const response = await fetchWithAuth('/api/hotels/add/property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hotelData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add hotel');
      }
      
      const data = await response.json();
      
      // Refresh hotels list
      await fetchHotels();
      
      return data;
    } catch (err: any) {
      console.error('Error adding hotel:', err);
      setError(err.message || 'Failed to add hotel. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchHotels]);

  // Update an existing hotel
  const updateHotel = useCallback(async (hotelId: string, hotelData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth(`/api/hotels/${hotelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hotelData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update hotel');
      }
      
      const updatedHotel = await response.json();
      
      // Update local state
      setHotels(prevHotels => 
        prevHotels.map(hotel => 
          hotel.id === hotelId ? updatedHotel : hotel
        )
      );
      
      return updatedHotel;
    } catch (err: any) {
      console.error('Error updating hotel:', err);
      setError(err.message || 'Failed to update hotel. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a hotel
  const deleteHotel = useCallback(async (hotelId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth(`/api/hotels/${hotelId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete hotel');
      }
      
      // Update local state
      setHotels(prevHotels => 
        prevHotels.filter(hotel => hotel.id !== hotelId)
      );
      
      return true;
    } catch (err: any) {
      console.error('Error deleting hotel:', err);
      setError(err.message || 'Failed to delete hotel. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    hotels,
    loading,
    error,
    fetchHotels,
    addHotel,
    updateHotel,
    deleteHotel
  };

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  );
};
