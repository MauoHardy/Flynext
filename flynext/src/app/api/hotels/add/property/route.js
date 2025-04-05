import { addHotel } from '@/services/hotelService';
import { getUserFromCookieToken } from '@/lib/auth';

/**
 * @swagger
 * /api/hotels/add/property:
 *   post:
 *     summary: Add a new hotel
 *     description: Add a new hotel to the platform with details like name, logo, address, location, star rating, and images.
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
 *               - name
 *               - address
 *               - location
 *               - starRating
 *               - images
 *             properties:
 *               name:
 *                 type: string
 *                 description: Hotel name
 *               logo:
 *                 type: string
 *                 format: uri
 *                 description: URL to the hotel logo image
 *               address:
 *                 type: string
 *                 description: Hotel address
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               starRating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Hotel star rating (1-5)
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
 *         description: Hotel created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(request) {
    try {
        const user = await getUserFromCookieToken(request);

        if (!user || !user.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.id;

        const body = await request.json();

        const { name, address, location, starRating, images } = body;
        const logo = body.logo || (images && images.length > 0 ? images[0] : null);
        const amenities = body.amenities || [];

        if (!name || !address || !location || !starRating || !images || !Array.isArray(images) || images.length === 0) {
            return Response.json(
                { error: 'Missing required fields. Name, address, location, star rating, and at least one image are required.' },
                { status: 400 }
            );
        }

        if (!location.latitude || !location.longitude) {
            return Response.json(
                { error: 'Location must include both latitude and longitude' },
                { status: 400 }
            );
        }

        if (starRating < 1 || starRating > 5 || !Number.isInteger(starRating)) {
            return Response.json(
                { error: 'Star rating must be an integer between 1 and 5' },
                { status: 400 }
            );
        }

        let allImages = [...images];
        if (logo && !images.includes(logo)) {
            allImages = [logo, ...images];
        }

        const hotel = await addHotel({
            name,
            ownerId: userId,
            address,
            location,
            starRating,
            images: allImages,
            amenities
        });

        return Response.json(hotel, { status: 201 });
    } catch (error) {
        console.error('Error adding hotel:', error);
        return Response.json(
            { error: error.message || 'Failed to add hotel' },
            { status: 500 }
        );
    }
} 