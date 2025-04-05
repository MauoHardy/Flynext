// app/api/bookings/cancel/route.js
import { getUserFromCookieToken } from '@/lib/auth'
import { cancelHotelReservation } from '@/services/bookingService'
import { createNotification } from '@/services/notificationService'
export async function GET(request) {
  try {
    const user = await getUserFromCookieToken(request);
    const { searchParams } = new URL(request.url);
    const hotelBookingId = searchParams.get('hotelBookingId');

    console.log('Hotel booking ID:', hotelBookingId)
    const result = await cancelHotelReservation(hotelBookingId, user.id)

    await createNotification(user.id, 'Cancellation', 'You have successfully cancelled booking at your hotel with ID:  ' + hotelBookingId);
    return Response.json(result)

  } catch (error) {
    return Response.json(
      { message: error.message },
      { status: error.message.includes('authorized') ? 403 : 400 }
    )
  }
}