// app/api/hotel-owner/availability/route.js
import { PrismaClient } from '@prisma/client';
import { getUserFromCookieToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request) {

    let user;
    try {
        user = await getUserFromCookieToken(request);
    } catch (error) {
        return Response.json(
            { message: 'Failed to getUserFromCookieToken user', error: error.message },
            { status: 401 }
        );
    }
  try {

    const { searchParams } = new URL(request.url);
    const roomTypeId = searchParams.get('roomTypeId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Date validation
    const startDate = startDateParam ? new Date(startDateParam) : new Date();
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    endDate.setDate(endDate.getDate() + 30); // Default 30-day window

    if (isNaN(startDate)) throw new Error('Invalid start date');
    if (isNaN(endDate)) throw new Error('Invalid end date');
    if (startDate > endDate) throw new Error('Start date must be before end date');

    const roomType = await prisma.roomType.findUnique({
        where: { id: roomTypeId }
    });
    
    if (!roomType) {
    throw new Error('Room type not found');
    }

    // Calculate availability for each room type
    const overlappingBookings = await prisma.hotelBooking.findMany({
        where: {
          hotel: { ownerId: user.id },
          roomTypeId,
          OR: [
            { 
              checkIn: { lt: endDate.toISOString() },
              checkOut: { gt: startDate.toISOString() } 
            },
            { 
              checkIn: { gte: startDate.toISOString() },
              checkOut: { lte: endDate.toISOString() } 
            }
          ],
          status: 'Confirmed'
        }
      });
    
      // Calculate maximum concurrent bookings
      const maxConcurrent = overlappingBookings.reduce((acc, booking) => {
        return acc + booking.roomsBooked;
      }, 0);
    
      // Check availability
      const availability = roomType.totalRooms - maxConcurrent;

    return Response.json({
      roomName: roomType.name,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      availability
    });

  } catch (error) {
    console.error('Availability check error:', error);
    return Response.json(
      { message: 'Failed to check availability', error: error.message },
      { status:  error instanceof Error ? 400 : 403 }
    );
  } finally {
    await prisma.$disconnect();
  }
}