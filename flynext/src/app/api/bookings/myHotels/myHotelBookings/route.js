// app/api/hotel-owner/bookings/route.js
import { PrismaClient } from '@prisma/client';
import { getUserFromCookieToken } from '@/lib/auth';
import { stat } from 'fs';
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
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const roomTypeId = searchParams.get('roomTypeId');

    // Get owner's hotels
    const hotels = await prisma.hotel.findMany({
      where: { ownerId: user.id },
      select: { id: true }
    });

    const hotelIds = hotels.map(hotel => hotel.id);

    // Build filters
    const where = {
      hotel: { id: { in: hotelIds } },
      status: 'Confirmed'
    };

    if (startDate && endDate) {
      where.OR = [
        {
          checkIn: { gte: new Date(startDate) },
          checkOut: { lte: new Date(endDate) }
        },
        {
          checkIn: { lte: new Date(endDate) },
          checkOut: { gte: new Date(startDate) }
        }
      ];
    }

    if (roomTypeId) {
      where.roomTypeId = roomTypeId;
    }

    // Get bookings with related data
    const bookings = await prisma.hotelBooking.findMany({
      where,
      include: {
        hotel: {
          select: {
            name: true,
            location: true
          }
        },
        roomType: {
          select: {
            name: true,
            pricePerNight: true
          }
        },
        booking: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            createdAt: true
          }
        }
      },
      orderBy: {
        checkIn: 'asc'
      }
    });

    // Format response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      checkIn: booking.checkIn.toISOString(),
      checkOut: booking.checkOut.toISOString(),
      roomsBooked: booking.roomsBooked,
      totalPrice: booking.totalPrice,
      hotel: booking.hotel,
      roomType: booking.roomType,
      guest: booking.booking.user,
      bookingDate: booking.booking.createdAt.toISOString()
    }));

    return Response.json({ bookings: formattedBookings });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return Response.json(
      { message: 'Failed to fetch bookings', error: error.message },
      { status: error.message.includes('Auth') ? 401 : 400 }
    );
  } finally {
    await prisma.$disconnect();
  }
}