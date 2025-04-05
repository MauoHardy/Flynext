import { searchHotels } from '@/services/hotelService'

/**
 * @swagger
 * /api/hotels/search:
 *   get:
 *     summary: Search for hotels
 *     description: Search for hotels based on various filters like city, check-in/out dates, price range, star rating, and name.
 *     tags:
 *       - Hotels
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City where the hotel is located
 *       - in: query
 *         name: checkIn
 *         schema:
 *           type: string
 *           format: date
 *         description: Check-in date (YYYY-MM-DD)
 *       - in: query
 *         name: checkOut
 *         schema:
 *           type: string
 *           format: date
 *         description: Check-out date (YYYY-MM-DD)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price per night
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per night
 *       - in: query
 *         name: starRating
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum star rating (0-5)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Hotel name to search for
 *     responses:
 *       200:
 *         description: A list of hotels matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   city:
 *                     type: string
 *                   price:
 *                     type: number
 *                   starRating:
 *                     type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      city: searchParams.get('city')?.trim(),
      checkIn: searchParams.get('checkIn'),
      checkOut: searchParams.get('checkOut'),
      minPrice: parseFloat(searchParams.get('minPrice')) || 0,  // Default to 0
      maxPrice: parseFloat(searchParams.get('maxPrice')) || 999999999,  // Default very high value
      starRating: parseInt(searchParams.get('starRating')) || 0, // Default to 0
      name: searchParams.get('name')?.trim()
    }
    

    const validatedDates = {}
    if (filters.checkIn) validatedDates.checkIn = new Date(filters.checkIn)
    if (filters.checkOut) validatedDates.checkOut = new Date(filters.checkOut)

    const hotels = await searchHotels({
      ...filters,
      ...validatedDates
    })

    return Response.json(hotels)
  } catch (error) {
    return Response.json(
      { message: error.message },
      { status: 500 }
    )
  }
}