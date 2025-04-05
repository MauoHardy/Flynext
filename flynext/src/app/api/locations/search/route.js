import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/locations/search:
 *   get:
 *     summary: Search for cities and airports
 *     description: Searches for cities and airports that match the query string
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term for cities or airports
 *     responses:
 *       200:
 *         description: List of matching cities and airports
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim() || '';
    
    if (!query || query.length < 2) {
      return Response.json({ cities: [], airports: [] });
    }
    
    // For development/testing - if no database is available, return mock data
    // This section can be uncommented for development or testing purposes
    /* 
    const mockData = {
      cities: [
        {
          id: '1',
          name: 'New York',
          country: 'USA',
          display: 'New York, USA',
          type: 'city',
          airports: [
            {
              id: '101',
              code: 'JFK',
              name: 'John F. Kennedy International Airport',
              display: 'JFK - John F. Kennedy International Airport',
            },
            {
              id: '102',
              code: 'LGA',
              name: 'LaGuardia Airport',
              display: 'LGA - LaGuardia Airport',
            }
          ]
        },
        {
          id: '2',
          name: 'London',
          country: 'UK',
          display: 'London, UK',
          type: 'city',
          airports: [
            {
              id: '201',
              code: 'LHR',
              name: 'Heathrow Airport',
              display: 'LHR - Heathrow Airport',
            },
            {
              id: '202',
              code: 'LGW',
              name: 'Gatwick Airport',
              display: 'LGW - Gatwick Airport',
            }
          ]
        }
      ],
      airports: [
        {
          id: '301',
          code: 'CDG',
          name: 'Charles de Gaulle Airport',
          city: 'Paris',
          country: 'France',
          display: 'CDG - Charles de Gaulle Airport (Paris)',
          type: 'airport'
        },
        {
          id: '302',
          code: 'LAX',
          name: 'Los Angeles International Airport',
          city: 'Los Angeles',
          country: 'USA',
          display: 'LAX - Los Angeles International Airport (Los Angeles)',
          type: 'airport'
        }
      ]
    };
    
    // Filter mock data based on query
    const filteredCities = mockData.cities.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase()) || 
      city.country.toLowerCase().includes(query.toLowerCase())
    );
    
    const filteredAirports = mockData.airports.filter(airport => 
      airport.code.toLowerCase().includes(query.toLowerCase()) || 
      airport.name.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase())
    );
    
    // Return mock data
    return Response.json({
      cities: filteredCities,
      airports: filteredAirports
    });
    */
    
    // Convert query to lowercase for comparison
    const queryLower = query.toLowerCase();

    // Search for cities without using mode: "insensitive"
    const cities = await prisma.city.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { country: { contains: query } },
          // Add additional queries for uppercase and lowercase
          { name: { contains: query.toUpperCase() } },
          { name: { contains: query.toLowerCase() } },
          { country: { contains: query.toUpperCase() } },
          { country: { contains: query.toLowerCase() } }
        ]
      },
      include: {
        airports: true
      },
      take: 10
    });
    
    // Search for airports without using mode: "insensitive"
    const airports = await prisma.airport.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { code: { contains: query } },
          // Add additional queries for uppercase and lowercase
          { name: { contains: query.toUpperCase() } },
          { name: { contains: query.toLowerCase() } },
          { code: { contains: query.toUpperCase() } },
          { code: { contains: query.toLowerCase() } }
        ]
      },
      include: {
        city: true
      },
      take: 10
    });
    
    // Remove duplicate airports (those already included with cities)
    const cityAirportIds = new Set();
    cities.forEach(city => {
      city.airports.forEach(airport => {
        cityAirportIds.add(airport.id);
      });
    });
    
    const uniqueAirports = airports.filter(airport => !cityAirportIds.has(airport.id));
    
    // Format the response
    const formattedResults = {
      cities: cities.map(city => ({
        id: city.id,
        name: city.name,
        country: city.country,
        display: `${city.name}, ${city.country}`,
        type: 'city',
        airports: city.airports.map(airport => ({
          id: airport.id,
          code: airport.code,
          name: airport.name,
          display: `${airport.code} - ${airport.name}`,
        }))
      })),
      airports: uniqueAirports.map(airport => ({
        id: airport.id,
        code: airport.code,
        name: airport.name,
        city: airport.city.name,
        country: airport.city.country,
        display: `${airport.code} - ${airport.name} (${airport.city.name})`,
        type: 'airport'
      }))
    };
    
    return Response.json(formattedResults);
  
  } catch (error) {
    console.error('Error searching locations:', error);
    return Response.json(
      { message: error.message || 'An error occurred while searching for locations' },
      { status: 500 }
    );
  }
}
