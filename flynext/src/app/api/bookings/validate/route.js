import { PrismaClient } from '@prisma/client';
// Removing unused imports
// import { headers } from 'next/headers';
// import { stringify } from 'querystring';

const prisma = new PrismaClient();
// const apiKey = process.env.FLIGHTS_API_KEY;
export async function POST(req) {
  //   if (req.method !== 'POST') {
  //     return res.status(405).json({ message: 'Method not allowed' });
  //   }
  const body = await req.json();
  // console.log('Request body:', body);
  // const flightBookings = body.flightBookings;
  const hotelBookings = body.hotelBookings;
  const paymentDetails = body.paymentDetails;
  // console.log('Flight Booking:', flightBookings);
  // console.log('Hotel Booking:', hotelBookings);
  // console.log('Payment Details:', paymentDetails);
  try {
    // Validate card details
    const cardValidation = validateCardDetails(paymentDetails);
    if (!cardValidation.valid) {
      return res.status(400).json({
        message: 'Invalid card details',
        errors: cardValidation.errors,
      });
    }
    console.log('Card details are valid');

    // Validate flight availability
    // if (flightBookings) {
    //   const flightValidation = await validateFlights(flightBookings);
    //   if (!flightValidation.valid) {
    //     return res.status(400).json({
    //       message: 'Flight validation failed',
    //       errors: flightValidation.errors,
    //     });
    //   }
    // }
    // console.log('Flights are available');

    // Validate hotel availability
    if (hotelBookings) {
      const hotelValidation = await validateHotels(hotelBookings);
      if (!hotelValidation.isValid) {
        return res.status(400).json({
          message: 'Hotel validation failed',
          errors: hotelValidation.errors,
        });
      }
    }
    console.log('Hotels are available');

    // If all validations pass
    return Response.json({ message: 'Protected route accessed successfully' }, {
      status: 200,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return Response.json({ message: 'Internal server error' }, {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions
function validateCardDetails(paymentDetails) {
  const errors = [];

  // Validate card number (Luhn check)
  if (!luhnCheck(paymentDetails.cardNumber)) {
    errors.push('Invalid card number');
  }

  // Validate expiration
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  if (paymentDetails.expiryYear < currentYear ||
    (paymentDetails.expiryYear === currentYear &&
      paymentDetails.expiryMonth < currentMonth)) {
    errors.push('Card has expired');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function luhnCheck(cardNo) {
  // Implement Luhn algorithm
  // ...
  let nDigits = cardNo.length;
  let nSum = 0;
  let isSecond = false;
  for (let i = nDigits - 1; i >= 0; i--) {

    let d = cardNo[i].charCodeAt() - '0'.charCodeAt();

    if (isSecond == true)
      d = d * 2;

    // We add two digits to handle
    // cases that make two digits
    // after doubling
    nSum += parseInt(d / 10, 10);
    nSum += d % 10;

    isSecond = !isSecond;
  }
  return (nSum % 10 == 0);

}

// async function validateFlights(flightBookings) {
//   // Check flight availability
//   // ...
//   const flightid = flightBookings.flightIds;
//   for (let id of flightid) {
//     const response = await fetch(`https://advanced-flights-system.replit.app/api/flights?id=${id}`, { 
//     method: 'GET',
//     headers: {
//       "x-api-key": apiKey
//     }});
//     const flight = await response.json();
//     console.log('Flight:', flight);
//     if (flight.availableSeats < 1) {
//       return {
//         valid: false,
//         errors: [`Flight ${id} does not have enough seats`],
//       };
//     }
//   }
// }

async function validateHotels(hotelBookings) {
  // Check room availability
  // ...
  const roomTypeId = hotelBookings.roomTypeId;
  const checkIn = hotelBookings.checkIn;
  const checkOut = hotelBookings.checkOut;
  const roomsRequested = hotelBookings.roomsBooked;
  // console.log('Room type:', roomTypeId);
  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId }
  });

  if (!roomType) {
    throw new Error('Room type not found');
  }

  // Find overlapping bookings
  const checkInDate = new Date(checkIn).toISOString();
  const checkOutDate = new Date(checkOut).toISOString();

  const overlappingBookings = await prisma.bookedDate.findMany({
    where: {
      roomTypeId,
      OR: [
        {
          startDate: { lt: checkOutDate },
          endDate: { gt: checkInDate }
        },
        {
          startDate: { gte: checkInDate },
          endDate: { lte: checkOutDate }
        }
      ]
    }
  });

  console.log('Overlapping bookings:', overlappingBookings);
  // Calculate maximum concurrent bookings
  const maxConcurrent = overlappingBookings.reduce((max, booking) => {
    return Math.max(max, booking.quantity);
  }, 0);

  // Check availability
  const available = roomType.totalRooms - maxConcurrent;
  console.log("Available", available);
  return {
    available,
    isValid: available >= roomsRequested,
    roomType
  };
}