// Flight service for handling flight-related operations

/**
 * Search for flights based on origin, destination, and date
 * @param {Object} searchParams - Flight search parameters
 * @returns {Promise<Object>} - Flight search results
 */
export const searchFlights = async (searchParams) => {
    try {
        const {
            source,
            destination,
            departureDate,
            returnDate,
            tripType = 'one-way'
        } = searchParams;

        // Validate required parameters
        if (!source || !destination || !departureDate) {
            throw new Error('Missing required search parameters');
        }

        // Construct the API URL for the external flights API
        const apiKey = process.env.FLIGHTS_API_KEY;
        const baseUrl = 'https://advanced-flights-system.replit.app/api/flights';

        // Build query parameters for outbound flight
        const outboundQueryParams = new URLSearchParams();

        // Use 'origin' instead of 'source' as per API docs
        outboundQueryParams.append('origin', source);
        outboundQueryParams.append('destination', destination);

        // Use 'date' instead of 'departureDate' as per API docs
        outboundQueryParams.append('date', departureDate);

        // Make the API request for outbound flight
        const outboundResponse = await fetch(`${baseUrl}?${outboundQueryParams.toString()}`, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!outboundResponse.ok) {
            const errorData = await outboundResponse.json();
            throw new Error(errorData.message || 'Failed to fetch outbound flights');
        }

        const outboundData = await outboundResponse.json();

        // For one-way trips, return just the outbound flight data
        if (tripType === 'one-way' || !returnDate) {
            return {
                departureFlights: outboundData.results || [],
                returnFlights: [],
                tripType: 'one-way'
            };
        }

        // For round-trip, make a second API call for the return flight
        const returnQueryParams = new URLSearchParams();
        returnQueryParams.append('origin', destination); // Swap origin and destination
        returnQueryParams.append('destination', source);
        returnQueryParams.append('date', returnDate);

        const returnResponse = await fetch(`${baseUrl}?${returnQueryParams.toString()}`, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!returnResponse.ok) {
            const errorData = await returnResponse.json();
            throw new Error(errorData.message || 'Failed to fetch return flights');
        }

        const returnData = await returnResponse.json();

        // Return both outbound and return flight data
        return {
            departureFlights: outboundData.results || [],
            returnFlights: returnData.results || [],
            tripType: 'round-trip'
        };
    } catch (error) {
        console.error('Error searching flights:', error);
        throw error;
    }
}; 