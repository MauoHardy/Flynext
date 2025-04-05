import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import Card from '@/app/components/ui/Card';

export interface HotelCardProps {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  imageUrl: string;
  amenities?: string[];
}

export default function HotelCard({
  id,
  name,
  location,
  price,
  rating,
  imageUrl,
  amenities = []
}: HotelCardProps) {
  return (
    <Link href={`/hotels/${id}`}>
      <Card className="group h-full transition-all duration-300 hover:shadow-xl">
        <div className="relative h-48 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <div className="relative h-full w-full transition-transform duration-300 group-hover:scale-110">
            <Image
              src={imageUrl || '/placeholder-hotel.jpg'}
              alt={name}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 z-20 flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
            <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <Card.Body className="pt-4">
          <h3 className="font-bold text-lg mb-1 text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600 mb-2">{location}</p>
          
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {amenities.slice(0, 3).map((amenity) => (
                <span 
                  key={amenity} 
                  className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="text-xs text-gray-500 px-1">+{amenities.length - 3} more</span>
              )}
            </div>
          )}
        </Card.Body>
        
        <Card.Footer className="flex justify-between items-center">
          <div>
            <span className="text-xl font-bold text-blue-600">${price}</span>
            <span className="text-sm text-gray-500"> / night</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
            View Details
          </button>
        </Card.Footer>
      </Card>
    </Link>
  );
}