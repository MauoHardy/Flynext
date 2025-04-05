import { PrismaClient } from '@prisma/client';
import { authenticate } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    const userId = await authenticate(req);

    console.log(userId, bookingId);
    const bookings = await prisma.booking.findUniqueOrThrow({
      where: {
        id: bookingId
      },
      include: {
        hotelBookings: true,        
        flightBooking: true,
        payments: true,
        user: true
      },
    });
    
    if (bookings.userId !== userId.id) {
      throw new Error('You are not authorized to view this booking');
    }
    console.log('Bookings:', bookings);

    return Response.json({ bookings: bookings }, { status: 200 });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return Response.json(
      { message: 'Failed to fetch bookings', error: error.message },
      { status: error.message.includes('Auth') ? 403 : 400 }
    );
  } finally {
    await prisma.$disconnect();
  }
}