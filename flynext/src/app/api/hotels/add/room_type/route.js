import { addRoomType } from '@/services/hotelService';
// Removing unused import
// import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { getUserFromCookieToken } from '@/lib/auth';

/**
 * @swagger
 * /api/hotels/add/room_type:
 *   post:
 *     summary: Add a new room type
 *     description: Add a new room type to a hotel with details like name, description, price, amenities, and images.
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
 *               - hotelId
 *               - name
 *               - description
 *               - pricePerNight
 *               - totalRooms
 *             properties:
 *               hotelId:
 *                 type: string
 *                 description: ID of the hotel to add the room type to
 *               name:
 *                 type: string
 *                 description: Room type name (e.g., "Double", "Suite")
 *               description:
 *                 type: string
 *                 description: Room type description
 *               pricePerNight:
 *                 type: number
 *                 description: Price per night
 *               totalRooms:
 *                 type: integer
 *                 description: Total number of rooms of this type
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: Array of image URLs
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of amenity names
 *     responses:
 *       201:
 *         description: Room type created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not the owner of the hotel
 *       404:
 *         description: Hotel not found
 *       500:
 *         description: Server error
 */
export async function POST(request) {
    try {
        let userId;
        userId = await getUserFromCookieToken(request);
        if (!userId) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const { hotelId, name, description, pricePerNight, totalRooms } = body;
        const images = body.images || [];
        const amenities = body.amenities || [];

        if (!hotelId || !name || !description || !pricePerNight || totalRooms === undefined) {
            return Response.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (pricePerNight <= 0) {
            return Response.json(
                { error: 'Price per night must be greater than 0' },
                { status: 400 }
            );
        }

        if (totalRooms < 0) {
            return Response.json(
                { error: 'Total rooms cannot be negative' },
                { status: 400 }
            );
        }

        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return Response.json(
                { error: 'Hotel not found' },
                { status: 404 }
            );
        }


        if (hotel.ownerId !== userId.id) {
            return Response.json(
                { error: 'You are not authorized to add room types to this hotel' },
                { status: 403 }
            );
        }

        const roomType = await addRoomType({
            hotelId,
            name,
            description,
            pricePerNight,
            totalRooms,
            images,
            amenities
        });

        return Response.json(roomType, { status: 201 });
    } catch (error) {
        console.error('Error adding room type:', error);
        return Response.json(
            { error: error.message || 'Failed to add room type' },
            { status: 500 }
        );
    }
} 