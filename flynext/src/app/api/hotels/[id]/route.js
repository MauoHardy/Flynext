import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Get hotel details
 *     description: Get detailed information about a specific hotel by ID
 *     tags:
 *       - Hotels
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *       - in: query
 *         name: checkIn
 *         schema:
 *           type: string
 *           format: date
 *         description: Check-in date (YYYY-MM-DD)
 *       - in: query
 *         name: checkOut
 *         schema:
 *           type: string
 *           format: date
 *         description: Check-out date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Hotel details
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const hotelId = params.id;
    
    // Get request date parameters for availability calculation
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    
    // Fetch the hotel with all its details
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        images: true,
        amenities: true,
        roomTypes: {
          include: {
            images: true,
            amenities: true,
            hotelBookings: checkIn && checkOut
              ? {
                where: {
                  status: { equals: "Confirmed" },
                  OR: [
                    {
                      AND: [
                        { checkIn: { lt: new Date(checkOut) } },
                        { checkOut: { gt: new Date(checkIn) } }
                      ]
                    },
                    {
                      AND: [
                        { checkIn: { gte: new Date(checkIn) } },
                        { checkOut: { lte: new Date(checkOut) } }
                      ]
                    }
                  ]
                },
                select: {
                  roomsBooked: true,
                }
              }
              : undefined,
          }
        }
      }
    });
    
    if (!hotel) {
      return Response.json(
        { message: 'Hotel not found' },
        { status: 404 }
      );
    }
    
    // Process room types to include availability information
    const processedHotel = {
      ...hotel,
      roomTypes: hotel.roomTypes.map(roomType => {
        // If date range provided, calculate availability
        if (checkIn && checkOut) {
          const maxConcurrent = roomType.hotelBookings?.reduce(
            (sum, booking) => sum + booking.roomsBooked, 0) || 0;
          
          const availableRooms = roomType.totalRooms - maxConcurrent;
          
          return {
            ...roomType,
            availableRooms: availableRooms > 0 ? availableRooms : 0,
            hotelBookings: undefined // Remove the bookings data from response
          };
        }
        
        // If no date range, just return total rooms
        return {
          ...roomType,
          availableRooms: roomType.totalRooms,
          hotelBookings: undefined // Remove the bookings data from response
        };
      })
    };
    
    return Response.json(processedHotel);
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    return Response.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
