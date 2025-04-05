import prisma from '@/lib/prisma'
import { createNotification } from './notificationService';

export const validateHotels = async (hotelBookings) => {
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

  const overlappingBookings = await prisma.hotelBooking.findMany({
    where: {
      roomTypeId,
      OR: [
        { 
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate } 
        },
        { 
          checkIn: { gte: checkInDate },
          checkOut: { lte: checkOutDate } 
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
  const available = roomType.totalRooms - maxConcurrent;
  return {
    available,
    isValid: available >= roomsRequested,
    roomType
  };
}

// Helper functions
export const validateCardDetails = (paymentDetails) => {
  const errors = [];
  
  // Validate card number (Luhn check)
  if (!luhnCheck(paymentDetails.cardNumber)) {
    throw new Error('Invalid card number');
  }

  // Validate expiration
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  if (paymentDetails.expiryYear < currentYear || 
      (paymentDetails.expiryYear === currentYear && 
       paymentDetails.expiryMonth < currentMonth)) {
    throw new Error('Card expired');
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
  for (let i = nDigits - 1; i >= 0; i--)
  {

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

export const cancelHotelReservation = async (hotelBookingId, loggedId) => {
  // Check if the booking belongs to the hotel owner
  const hotelBooking = await prisma.hotelBooking.findUnique({
    where: { id: hotelBookingId },
    include: {
      booking: true,
      hotel: true,
      roomType: true,
    }
  });

  if (!hotelBooking) {
    throw new Error('Booking not found');
  }
  console.log(loggedId, hotelBooking.hotel.ownerId);
  if (hotelBooking.hotel.ownerId != loggedId) {
    console.log('Not authorized');
    throw new Error('You are not authorized to cancel this reservation');
  }

  try {
    await prisma.booking.update({
        where: { id: hotelBooking.booking.id },
        data: { status: 'Changed' },
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    throw new Error('Cancellation failed');
  }

  await createNotification(hotelBooking.booking.userId, 'Cancellation', 'Your booking at ' + hotelBooking.hotel.name + ' with booking ID ' + hotelBooking.booking.id + ' has been cancelled by the hotel owner');

  return await prisma.hotelBooking.update({
    where: { id: hotelBookingId },
    data: { status: 'Cancelled' }
  });
}

export const cancelUserHotelReservation = async (bookingId, user) => {
  // Check if the booking belongs to the hotel owner
  // console.log('Booking ID:', bookingId);
  const booking = await prisma.hotelBooking.findUnique({
    where: { id: bookingId },
    include: {
      booking: true,
      hotel: true,
      roomType: true,
    }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }
  console.log(user.id, booking.booking.userId);
  if (booking.booking.userId !== user.id) {
    console.log('Not authorized');
    throw new Error('You are not authorized to cancel this reservation');
  }

  try {
    await prisma.booking.update({
        where: { id: booking.booking.id },
        data: { status: 'Changed' },
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    throw new Error('Cancellation failed');
  }

  return await prisma.hotelBooking.update({
    where: { id: bookingId },
    data: { status: 'Cancelled' }
  });
}

export const cancelBooking = async (bookingId, user) => {
  // Check if the booking belongs to the user
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      hotelBookings: true,
    }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.userId !== user.id) {
    throw new Error('You are not authorized to cancel this booking');
  }

  const updatedhotels = await prisma.hotelBooking.updateManyAndReturn({
    where: { id: booking.hotelBookings.id },
    data: { status: 'Cancelled' }
  });

  console.log('Updated hotels:', updatedhotels);
  // Update booking status to Cancelled 
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'Cancelled' }
  })
}
