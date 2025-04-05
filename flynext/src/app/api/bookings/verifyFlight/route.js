import { PrismaClient } from '@prisma/client';
import { authenticate } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req) {
  try {

    const { searchParams } = new URL(req.url);
    console.log('Search params:', searchParams);
    const bId = searchParams.get('flightBookingId');
    const userId = await authenticate(req);
    
    console.log('Search params:', searchParams);
    await prisma.$connect();
    
    console.log('Search params:', searchParams);
    const fltbooking = await prisma.flightBooking.findUnique({
        where: {
          id: bId
        },
    });
    
    const { lastName, bookingRef, bookingId } = fltbooking;
    console.log('Flight booking:', fltbooking);
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
        include: {
            user: true,
        },
    });
    console.log('flight ref:', bookingRef);
    // console.log('last name:', lastName);
    // console.log('Booking:', booking);
    console.log('User:', userId.id);
    if (booking.user.id !== userId.id) {
        return Response.json(
            { message: 'You are not authorized to view this booking' },
            { status: 403 }
        );
    }

    const response = await fetch(
      `https://advanced-flights-system.replit.app/api/bookings/retrieve?bookingReference=${bookingRef}&lastName=${lastName}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "x-api-key": process.env.FLIGHTS_API_KEY,
        },
        });
    if (!response.ok) {
        const error = await response.json();
        return Response.json(
            { message: 'Failed to fetch bookings', error: error.message },
            { status: error.status || 500 }
        );
    }
    const data = await response.json();
    console.log('Flight data:', data);

    return Response.json({ bookings: data }, { status: 200 });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return Response.json(
      { message: 'Failed to fetch bookings', error: error.message },
      { status: (error.message.includes('authorized') || error.message.includes('Authentication')) ? 403 : 400 }
    );
  } finally {
    await prisma.$disconnect();
  }
}