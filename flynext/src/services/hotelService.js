import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Search for hotels based on various filters like city, check-in/out dates, price range, star rating, and name
export const searchHotels = async (filters) => {
  const {
    city,
    checkIn,
    checkOut,
    minPrice = 0,
    maxPrice = 10000,
    starRating = 0,
    name
  } = filters;

  const cleanCity = city?.trim();
  const cleanName = name?.trim();

  const whereConditions = {
    AND: [
      cleanCity ? {
        OR: [
          { address: { contains: cleanCity.toLowerCase() } },
          { address: { contains: cleanCity.toUpperCase() } },
          { address: { contains: cleanCity } }
        ]
      } : null,
      { starRating: { gte: starRating } },
      cleanName ? {
        OR: [
          { name: { contains: cleanName.toLowerCase() } },
          { name: { contains: cleanName.toUpperCase() } },
          { name: { contains: cleanName } }
        ]
      } : null,
      {
        roomTypes: {
          some: {
            pricePerNight: { gte: minPrice, lte: maxPrice }
          }
        }
      }
    ].filter(Boolean)
  };

  const hotels = await prisma.hotel.findMany({
    where: whereConditions,
    include: {
      roomTypes: {
        where: {
          pricePerNight: { gte: minPrice, lte: maxPrice },
        },
        select: {
          id: true,
          name: true,
          pricePerNight: true,
          totalRooms: true,
          description: true,
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
              },
            }
            : undefined,
        },
      },
      images: {
        take: 1,
      },
    },
  });

  return hotels
    .map((hotel) => {
      const processedRoomTypes = hotel.roomTypes
        .map((roomType) => {
          if (!checkIn || !checkOut) {
            return {
              id: roomType.id,
              name: roomType.name,
              pricePerNight: roomType.pricePerNight,
              totalRooms: roomType.totalRooms,
              description: roomType.description,
              availableRooms: roomType.totalRooms,
            };
          }

          const maxConcurrent = roomType.hotelBookings?.reduce(
            (sum, booking) => sum + booking.roomsBooked, 0) || 0;

          const availableRooms = roomType.totalRooms - maxConcurrent;

          return {
            id: roomType.id,
            name: roomType.name,
            pricePerNight: roomType.pricePerNight,
            totalRooms: roomType.totalRooms,
            description: roomType.description,
            availableRooms: availableRooms > 0 ? availableRooms : 0
          };
        })
        .filter((roomType) => roomType.availableRooms > 0);

      return {
        ...hotel,
        roomTypes: processedRoomTypes,
      };
    })
    .filter((hotel) => hotel.roomTypes.length > 0);
};

// Add a new hotel to the platform
export const addHotel = async (hotelData) => {
  const {
    name,
    ownerId,
    address,
    location,
    starRating,
    images,
    amenities
  } = hotelData;

  try {
    const hotel = await prisma.hotel.create({
      data: {
        name,
        ownerId,
        address,
        location,
        starRating,
        images: {
          create: images.map(url => ({ url }))
        },
        amenities: {
          create: amenities.map(name => ({ name }))
        }
      },
      include: {
        images: true,
        amenities: true
      }
    });

    return hotel;
  } catch (error) {
    console.error('Error adding hotel:', error);
    throw new Error('Failed to add hotel');
  }
};

// Add a new room type to a hotel
export const addRoomType = async (roomTypeData) => {
  const {
    hotelId,
    name,
    description,
    pricePerNight,
    images,
    amenities,
    totalRooms
  } = roomTypeData;

  try {
    const roomType = await prisma.roomType.create({
      data: {
        hotelId,
        name,
        description,
        pricePerNight,
        totalRooms,
        images: {
          create: images.map(url => ({ url }))
        },
        amenities: {
          create: amenities.map(name => ({ name }))
        }
      },
      include: {
        images: true,
        amenities: true
      }
    });

    return roomType;
  } catch (error) {
    console.error('Error adding room type:', error);
    throw new Error('Failed to add room type');
  }
};

// Update the number of available rooms for a room type
export const updateRoomAvailability = async (updateData) => {
  const { roomTypeId, newTotalRooms } = updateData;

  try {
    // Get the current room type information
    const currentRoomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: {
        hotelBookings: {
          where: {
            status: 'Confirmed'
          },
          include: {
            booking: true
          },
          orderBy: {
            booking: {
              createdAt: 'desc'
            }
          }
        }
      }
    });

    if (!currentRoomType) {
      throw new Error('Room type not found');
    }

    // If increasing rooms or no change, simply update
    if (newTotalRooms >= currentRoomType.totalRooms) {
      const updatedRoomType = await prisma.roomType.update({
        where: { id: roomTypeId },
        data: { totalRooms: newTotalRooms }
      });
      return {
        updatedRoomType,
        cancelledBookings: []
      };
    }

    // If decreasing rooms, we need to check if we need to cancel bookings
    // Calculate how many rooms we need to free up
    const roomsToFreeUp = currentRoomType.totalRooms - newTotalRooms;

    // Get all active bookings for this room type
    const bookings = await prisma.hotelBooking.findMany({
      where: {
        roomTypeId,
        status: 'Confirmed'
      }
    });

    // Group bookings by date ranges to find overbooked dates
    const dateRangeMap = new Map();

    for (const booking of bookings) {
      const key = `${booking.checkIn.toISOString()}-${booking.checkOut.toISOString()}`;
      if (!dateRangeMap.has(key)) {
        dateRangeMap.set(key, 0);
      }
      dateRangeMap.set(key, dateRangeMap.get(key) + booking.roomsBooked);
    }

    // Find date ranges that would be overbooked with the new total
    const overbookedRanges = [];
    for (const [dateRange, bookedRooms] of dateRangeMap.entries()) {
      if (bookedRooms > newTotalRooms) {
        const [startDateStr, endDateStr] = dateRange.split('-');
        overbookedRanges.push({
          startDate: new Date(startDateStr),
          endDate: new Date(endDateStr),
          overbooked: bookedRooms - newTotalRooms
        });
      }
    }

    // If no overbooked dates, just update the total rooms
    if (overbookedRanges.length === 0) {
      const updatedRoomType = await prisma.roomType.update({
        where: { id: roomTypeId },
        data: { totalRooms: newTotalRooms }
      });
      return {
        updatedRoomType,
        cancelledBookings: []
      };
    }

    const cancelledBookings = [];
    let roomsFreed = 0;

    const sortedBookings = [...currentRoomType.hotelBookings].sort(
      (a, b) => new Date(b.booking.createdAt) - new Date(a.booking.createdAt)
    );

    for (const booking of sortedBookings) {
      if (roomsFreed >= roomsToFreeUp) break;

      const bookingOverlapsOverbooked = overbookedRanges.some(range => {
        return (
          (booking.checkIn <= range.endDate && booking.checkOut >= range.startDate)
        );
      });

      if (bookingOverlapsOverbooked) {
        // Cancel this booking
        await prisma.hotelBooking.update({
          where: { id: booking.id },
          data: { status: 'Cancelled' }
        });

        // Update the main booking status if all sub-bookings are cancelled
        const allSubBookings = await prisma.hotelBooking.findMany({
          where: { bookingId: booking.bookingId }
        });

        const allCancelled = allSubBookings.every(b => b.status === 'Cancelled');

        if (allCancelled) {
          await prisma.booking.update({
            where: { id: booking.bookingId },
            data: { status: 'Cancelled' }
          });
        }

        // Create a notification for the user
        await prisma.notification.create({
          data: {
            userId: booking.booking.userId,
            type: 'Cancellation',
            message: `Your booking at ${currentRoomType.hotel?.name || 'our hotel'} has been cancelled due to availability changes.`
          }
        });

        roomsFreed += booking.roomsBooked;
        cancelledBookings.push(booking);
      }
    }

    // Update the room type with the new total
    const updatedRoomType = await prisma.roomType.update({
      where: { id: roomTypeId },
      data: { totalRooms: newTotalRooms }
    });

    return {
      updatedRoomType,
      cancelledBookings
    };
  } catch (error) {
    console.error('Error updating room availability:', error);
    throw new Error('Failed to update room availability');
  }
};