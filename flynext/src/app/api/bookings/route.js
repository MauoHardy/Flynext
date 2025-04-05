import { PrismaClient } from '@prisma/client';
import { authenticate } from '@/lib/auth';
import { validateCardDetails, validateHotels } from '@/services/bookingService';
import { createNotification } from '@/services/notificationService';

const prisma = new PrismaClient();

export async function POST(req) {
  let userId;
  try {
    userId = await authenticate(req);
  } catch (error) {
    console.error('Authentication error:', error);
    return Response.json({ message: error.message }, {
      status: (error.message.includes('Auth') || error.message.includes('token')) ? 403 : 400,
    });
  }
  let totalPrice = 0;
  const body = await req.json();
  // console.log('Request body:', body);
  const { flightBookings, hotelBookings, paymentDetails } = body;
  const apiKey = process.env.FLIGHTS_API_KEY;
  try {
    // Validate card details
    const cardValidation = validateCardDetails(paymentDetails);
    if (!cardValidation.valid) {
      return Response.json({
        message: 'Card validation failed',
        errors: cardValidation.errors,
      }, {
        status: 400,
      });
    }
    console.log('Card details are valid');

    // Validate hotel availability
    if (hotelBookings) {
      const hotelValidation = await validateHotels(hotelBookings);
      if (!hotelValidation.isValid) {
        return Response.json({
          message: 'Hotel validation failed',
          errors: ['Insufficient rooms available'],
        }, {
          status: 400,
        });
      }
    }

    console.log('Hotels are available');

  } catch (error) {
    console.error('Validation error:', error);
    return Response.json({ message: error.message }, {
      status: error.message.includes('auth') ? 403 : 400,
    });
  }

  try {
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the main booking
      const booking = await tx.booking.create({
        data: {
          user: { connect: { id: userId.id } },
          status: 'Confirmed',
        },
      });
      // Create flight bookings if any
      let flight_booking;
      if (flightBookings) {
        const fltresponse = await fetch('https://advanced-flights-system.replit.app/api/bookings',
          {
            method: 'POST',
            headers: {
              "x-api-key": apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(flightBookings),
          }
        );
        if (!fltresponse.ok) {
          const error = await fltresponse.json();
          throw new Error(error.message, fltresponse.status);
        }
        const data = await fltresponse.json();
        console.log('Flight data:', data.flights);
        let source = [];
        let acc = 0;
        let bool = false;
        data['flights'].forEach(async (flight) => {
          totalPrice += flight.price;
          acc += 1;
          source.push(flight.originId);
          if (acc > 1 && source.includes(flight.destinationId)) {
            bool = true;
          }
        });
        flight_booking = await tx.flightBooking.create({
          data: {
            booking: { connect: { id: booking.id } },
            bookingRef: data.bookingReference,
            lastName: data.lastName,
            returnFlight: bool,
            status: 'Confirmed',
          },
        });
      }

      // Create hotel bookings if any
      let hotel_booking;
      if (hotelBookings) {
      const room = await tx.roomType.findUnique({
        where: { id: hotelBookings.roomTypeId },
        select: { pricePerNight: true },
      });
      const hotelprice = room.pricePerNight * hotelBookings.roomsBooked;
      console.log('Hotel price:', hotelprice );
      totalPrice += hotelprice;
      
      hotel_booking = await tx.hotelBooking.create({
        data: {
          booking: { connect: { id: booking.id } },
          hotel: { connect: { id: hotelBookings.hotelId } },
          roomType: { connect: { id: hotelBookings.roomTypeId } },
          checkIn: new Date(hotelBookings.checkIn),
          checkOut: new Date(hotelBookings.checkOut),
          roomsBooked: hotelBookings.roomsBooked,
          totalPrice: hotelprice,
          status: 'Confirmed',
        },
      });
      } 
      // Create payment record
      if (!paymentDetails) {
        throw new Error('Payment details not provided');
      }
        const payment = await tx.payment.create({
        data: {
          booking: { connect: { id: booking.id } },
          user: { connect: { id: userId.id } },
          cardLast4: paymentDetails.cardNumber.slice(-4),
          cardBrand: paymentDetails.cardBrand,
          expiryMonth: paymentDetails.expiryMonth,
          expiryYear: paymentDetails.expiryYear,
          amount: totalPrice,
        },
      });
      // console.log('Booking:', booking);
      // console.log('Payment:', payment);
      // console.log('Hotel booking:', hotel_booking);
      // console.log('Flight booking:', flight_booking);
      return { booking, payment, hotel_booking, flight_booking };
    });

    await createNotification(userId.id, 'BookingConfirmation', 'Your booking has been confirmed, your booking reference is ' + result.booking.id);

    return Response.json({
      message: 'Booking created successfully',
      booking: result,
    }, {
      status: 201,
    });
  } catch (error) {
    console.error('Booking creation failed:', error);
    return Response.json({
      message: 'Booking creation failed',
      error: error.message
    }, {
      status: error.message.includes('auth') ? 403 : 400,
    });
  } finally {
    await prisma.$disconnect();
  }
}