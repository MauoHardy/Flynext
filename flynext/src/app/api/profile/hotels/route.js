import { getUserFromCookieToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/profile/hotels:
 *   get:
 *     summary: Get hotels owned by the authenticated user
 *     description: Retrieves all hotels owned by the currently authenticated user
 *     tags:
 *       - Profile
 *       - Hotels
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of owned hotels
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    // Authenticate the user
    const user = await getUserFromCookieToken(request);
    
    if (!user) {
      return Response.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Fetch all hotels owned by the user
    const hotels = await prisma.hotel.findMany({
      where: {
        ownerId: user.id
      },
      include: {
        images: true,
        amenities: true,
        roomTypes: {
          include: {
            _count: {
              select: {
                hotelBookings: true
              }
            }
          }
        },
        _count: {
          select: {
            roomTypes: true
          }
        }
      }
    });
    
    return Response.json(hotels);
  } catch (error) {
    console.error('Error fetching owned hotels:', error);
    return Response.json(
      { message: error.message || 'An error occurred while fetching hotels' },
      { status: 500 }
    );
  }
}
