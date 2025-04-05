import { searchFlights } from '@/services/flightService';

/**
 * @swagger
 * /api/flights/search:
 *   get:
 *     summary: Search for flights
 *     description: Search for one-way or round-trip flights by specifying origin, destination, and date(s)
 *     tags:
 *       - Flights
 *     parameters:
 *       - in: query
 *         name: source
 *         required: true
 *         schema:
 *           type: string
 *         description: Source city or airport code
 *       - in: query
 *         name: destination
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination city or airport code
 *       - in: query
 *         name: departureDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Departure date (YYYY-MM-DD)
 *       - in: query
 *         name: returnDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Return date for round-trip flights (YYYY-MM-DD)
 *       - in: query
 *         name: tripType
 *         schema:
 *           type: string
 *           enum: [one-way, round-trip]
 *           default: one-way
 *         description: Type of trip (one-way or round-trip)
 *     responses:
 *       200:
 *         description: List of flights matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 departureFlights:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       flights:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             airline:
 *                               type: object
 *                             arrivalTime:
 *                               type: string
 *                             departureTime:
 *                               type: string
 *                             destination:
 *                               type: object
 *                             origin:
 *                               type: object
 *                             flightNumber:
 *                               type: string
 *                             price:
 *                               type: number
 *                       legs:
 *                         type: number
 *                 returnFlights:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       flights:
 *                         type: array
 *                         items:
 *                           type: object
 *                       legs:
 *                         type: number
 *                 tripType:
 *                   type: string
 *                   enum: [one-way, round-trip]
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const source = searchParams.get('source');
        const destination = searchParams.get('destination');
        const departureDate = searchParams.get('departureDate');
        const returnDate = searchParams.get('returnDate');
        const tripType = searchParams.get('tripType') || 'one-way';

        if (!source || !destination || !departureDate) {
            return Response.json(
                {
                    error: 'Missing required parameters',
                    requiredParams: ['source', 'destination', 'departureDate']
                },
                { status: 400 }
            );
        }

        if (tripType === 'round-trip' && !returnDate) {
            return Response.json(
                { error: 'Return date is required for round-trip flights' },
                { status: 400 }
            );
        }

        const flights = await searchFlights({
            source,
            destination,
            departureDate,
            returnDate,
            tripType
        });

        return Response.json(flights);
    } catch (error) {
        console.error('Error in flight search API:', error);
        return Response.json(
            { error: error.message || 'Failed to search flights' },
            { status: error.message.includes('Missing') ? 400 : 500 }
        );
    }
}
