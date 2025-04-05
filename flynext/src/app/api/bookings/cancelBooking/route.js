import { authenticate } from '@/lib/auth';
import { cancelUserHotelReservation } from '@/services/bookingService';
import { cancelBooking } from '../../../../services/bookingService';
import { createNotification } from '../../../../services/notificationService';

// Removing unused prisma instance since we're using the service functions
// const prisma = new PrismaClient();

export async function POST(req) {

    try {
        const user = await authenticate(req);
        const body = await req.json();
        // console.log('Request body:', body);
        const { bookingId, hotelBookingId } = body;
        // Cancel hotel reservation
        if (hotelBookingId) {
        const result = await cancelUserHotelReservation(hotelBookingId, user);
        console.log(result);
        if (result.status === 404) {
            return Response.json({ message: result.error }, { status: 404 });
        }
        if (result.status === 403) {
            return Response.json({ message: result.error }, { status: 403 });
        }
        await createNotification(user.id, 'Cancellation', 'Your hotel reservation for reference no.' + hotelBookingId + ' has been cancelled');
        console.log('Hotel reservation cancelled');
        return Response.json({ message: 'Hotel reservation cancelled' }, { data: result}, { status: 200 });
        }
        if (bookingId) {
        const result = await cancelBooking(bookingId, user);
        if (result.status === 404) {
            return Response.json({ message: result.error }, { status: 404 });
        }
        if (result.status === 403) {
            return Response.json({ message: result.error }, { status: 403 });
        }
        // console.log('Booking cancelled');
        // console.log(result);
        await createNotification(user.id, 'Cancellation', 'Your itenary booking for reference no.' + bookingId + ' has been cancelled');
        return Response.json({ message: 'Booking cancelled' }, { data: result }, { status: 200 });
        }
    } catch (error) {
        console.error('Cancellation error:', error);
        return Response.json({ message: error.message }, {
            status: error.message.includes('auth') ? 403 : 400,
        });
    }
}
