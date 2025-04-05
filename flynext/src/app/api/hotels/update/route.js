import { updateRoomAvailability } from '@/services/hotelService';
import { getUserFromCookieToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/hotels/update:
 *   patch:
 *     summary: Update room availability
 *     description: Update the number of available rooms for a specific room type. If availability decreases, it may require canceling some existing reservations.
 *     tags:
 *       - Hotels
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomTypeId
 *               - newTotalRooms
 *             properties:
 *               roomTypeId:
 *                 type: string
 *                 description: ID of the room type to update
 *               newTotalRooms:
 *                 type: integer
 *                 description: New total number of rooms of this type
 *     responses:
 *       200:
 *         description: Room availability updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not the owner of the hotel
 *       404:
 *         description: Room type not found
 *       500:
 *         description: Server error
 */
export async function PATCH(request) {
    try {
        // getUserFromCookieToken user and get user ID
        const user = await getUserFromCookieToken(request);

        // If authentication fails or returns no user
        if (!user || !user.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Extract user ID from the getUserFromCookieTokend user object
        const userId = user.id;

        const body = await request.json();

        const { roomTypeId, newTotalRooms } = body;

        if (!roomTypeId || newTotalRooms === undefined) {
            return Response.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (newTotalRooms < 0) {
            return Response.json(
                { error: 'Total rooms cannot be negative' },
                { status: 400 }
            );
        }

        const roomType = await prisma.roomType.findUnique({
            where: { id: roomTypeId },
            include: { hotel: true }
        });

        if (!roomType) {
            return Response.json(
                { error: 'Room type not found' },
                { status: 404 }
            );
        }

        if (roomType.hotel.ownerId !== userId) {
            return Response.json(
                { error: 'You are not authorized to update this room type' },
                { status: 403 }
            );
        }

        const result = await updateRoomAvailability({
            roomTypeId,
            newTotalRooms
        });

        return Response.json({
            updatedRoomType: result.updatedRoomType,
            cancelledBookings: result.cancelledBookings.length,
            message: result.cancelledBookings.length > 0
                ? `Room availability updated. ${result.cancelledBookings.length} booking(s) were cancelled.`
                : 'Room availability updated successfully.'
        });
    } catch (error) {
        console.error('Error updating room availability:', error);
        return Response.json(
            { error: error.message || 'Failed to update room availability' },
            { status: 500 }
        );
    }
} 