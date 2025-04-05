"use client";
import React, { useState, useEffect } from 'react';
import { AlertCircle, Search, Plane, ArrowLeftRight } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import { useSearchParams, useRouter } from 'next/navigation';
import LocationAutocomplete from '@/app/components/ui/LocationAutocomplete';

export default function FlightsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [flights, setFlights] = useState({
    departureFlights: [],
    returnFlights: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('departure');
  const [formState, setFormState] = useState({
    source: searchParams.get('source') || '',
    destination: searchParams.get('destination') || '',
    departureDate: searchParams.get('departureDate') || '',
    returnDate: searchParams.get('returnDate') || '',
    passengers: searchParams.get('passengers') || 1
  });
  const [displayValues, setDisplayValues] = useState({
    source: '',
    destination: ''
  });

  useEffect(() => {
    const hasSearchParams =
      searchParams.get('source') &&
      searchParams.get('destination') &&
      searchParams.get('departureDate');

    if (hasSearchParams) {
      performSearch();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (fieldName, value, displayValue) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: value
    }));

    setDisplayValues((prev) => ({
      ...prev,
      [fieldName]: displayValue
    }));
  };

  const performSearch = async () => {
    setIsSearching(true);
    setError('');

    try {
      const departureParams = new URLSearchParams();
      Object.entries(formState).forEach(([key, value]) => {
        if (value) {
          if (key !== 'returnDate') {
            departureParams.append(key, value);
          }
        }
      });

      const departureResponse = await fetch(`/api/flights/search?${departureParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!departureResponse.ok) {
        const errorData = await departureResponse.json();
        throw new Error(errorData.message || 'Failed to fetch departure flights');
      }

      const departureData = await departureResponse.json();
      const departureFlights = departureData.departureFlights || [];

      let returnFlights = [];

      if (formState.returnDate) {
        const returnParams = new URLSearchParams();
        returnParams.append('source', formState.destination);
        returnParams.append('destination', formState.source);
        returnParams.append('departureDate', formState.returnDate);
        returnParams.append('passengers', formState.passengers);

        const returnResponse = await fetch(`/api/flights/search?${returnParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (returnResponse.ok) {
          const returnData = await returnResponse.json();
          returnFlights = returnData.departureFlights || [];
        } else {
          console.warn('Failed to fetch return flights');
        }
      }

      setFlights({
        departureFlights: departureFlights,
        returnFlights: returnFlights
      });

      if (departureFlights.length > 0) {
        setActiveTab('departure');
      } else if (returnFlights.length > 0) {
        setActiveTab('return');
      }
    } catch (err) {
      console.error('Error searching flights:', err);
      setError(err.message || 'An error occurred while searching for flights');
    } finally {
      setIsSearching(false);
    }
  };

  const searchFlights = (e) => {
    e.preventDefault();

    const queryParams = new URLSearchParams();
    Object.entries(formState).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const url = `${window.location.pathname}?${queryParams.toString()}`;
    window.history.pushState({ path: url }, '', url);

    performSearch();
  };

  const clearSearch = () => {
    setFormState({
      source: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      passengers: 1
    });

    setDisplayValues({
      source: '',
      destination: ''
    });

    window.history.pushState({}, '', window.location.pathname);

    setFlights({
      departureFlights: [],
      returnFlights: []
    });
    setActiveTab('departure');
  };

  const activeFlights = activeTab === 'departure' ? flights.departureFlights : flights.returnFlights;
  const hasReturnFlight = formState.returnDate && flights.returnFlights.length > 0;
  console.log('Active Flights:', activeFlights);
  console.log('Form State:', formState);
  console.log('Flights:', flights);
  return (
    <div className="min-h-screen bg-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-blue-900">Find Your Perfect Flight</h1>

        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-200 mb-8">
          <form onSubmit={searchFlights} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-800 mb-1">
                Origin
              </label>
              <LocationAutocomplete
                id="source"
                name="source"
                value={displayValues.source || formState.source}
                onChange={(e) => handleInputChange(e)}
                onSelect={(value, displayValue) => handleLocationSelect('source', value, displayValue)}
                placeholder="From"
                required
              />
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-800 mb-1">
                Destination
              </label>
              <LocationAutocomplete
                id="destination"
                name="destination"
                value={displayValues.destination || formState.destination}
                onChange={(e) => handleInputChange(e)}
                onSelect={(value, displayValue) => handleLocationSelect('destination', value, displayValue)}
                placeholder="To"
                required
              />
            </div>
            <div>
              <label htmlFor="departureDate" className="block text-sm font-medium text-gray-800 mb-1">
                Departure
              </label>
              <input
                type="date"
                id="departureDate"
                name="departureDate"
                value={formState.departureDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
            <div>
              <label htmlFor="returnDate" className="block text-sm font-medium text-gray-800 mb-1">
                Return (Optional)
              </label>
              <input
                type="date"
                id="returnDate"
                name="returnDate"
                value={formState.returnDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="passengers" className="block text-sm font-medium text-gray-800 mb-1">
                Passengers
              </label>
              <input
                type="number"
                id="passengers"
                name="passengers"
                value={formState.passengers}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>
            <div className="md:col-span-5 mt-2 flex gap-2">
              <Button
                type="submit"
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search Flights'}
                {!isSearching && <Search size={16} />}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={clearSearch}
                disabled={isSearching}
                className="px-4 border border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Clear
              </Button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-4 space-y-6">
            {(flights.departureFlights.length > 0 || flights.returnFlights.length > 0) && (
              <div className="mb-4">
                {hasReturnFlight && (
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={() => setActiveTab('departure')}
                      className={`flex-1 py-2 px-4 rounded-t-lg font-medium ${
                        activeTab === 'departure'
                          ? 'bg-white border-b-2 border-blue-600 text-blue-900'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      Departure Flight
                      <div className="text-xs text-blue-600">
                        {formState.source} → {formState.destination} ({formState.departureDate})
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('return')}
                      className={`flex-1 py-2 px-4 rounded-t-lg font-medium ${
                        activeTab === 'return'
                          ? 'bg-white border-b-2 border-blue-600 text-blue-900'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      Return Flight
                      <div className="text-xs text-blue-600">
                        {formState.destination} → {formState.source} ({formState.returnDate})
                      </div>
                    </button>
                  </div>
                )}

                <h2 className="text-xl font-semibold text-blue-900">
                  {activeTab === 'departure' ? (
                    <>
                      Found {flights.departureFlights.length} departure flights
                      {formState.source && formState.destination &&
                        ` from ${formState.source} to ${formState.destination}`}
                    </>
                  ) : (
                    <>
                      Found {flights.returnFlights.length} return flights
                      {formState.destination && formState.source &&
                        ` from ${formState.destination} to ${formState.source}`}
                    </>
                  )}
                </h2>
              </div>
            )}

            {activeFlights.length > 0 ? (
              activeFlights.map((flight, index) => (
                <FlightResultCard key={index} flight={flight} isReturn={activeTab === 'return'} />
              ))
            ) : isSearching ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-md border border-blue-200">
                <Plane size={48} className="mx-auto text-blue-300 mb-4" />
                <h3 className="text-xl font-medium text-blue-800 mb-2">Search for flights</h3>
                <p className="text-blue-700">Enter your travel details to find available flights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const FlightResultCard = ({ flight, isReturn = false }) => {
  const airline = flight?.flights?.[0]?.airline?.name || 'Unknown Airline';
  const price = flight?.totalPrice || 299;
  const departureTime = new Date(flight?.flights?.[0]?.departureTime)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '00:00';
  const arrivalTime = new Date(flight?.flights?.[flight?.flights?.length - 1]?.arrivalTime)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '00:00';
  const departureAirport = flight?.flights?.[0]?.origin?.code || 'Unknown';
  const arrivalAirport = flight?.flights?.[flight?.flights?.length - 1]?.destination?.code || 'Unknown';
  const departureCity = flight?.flights?.[0]?.origin?.city || '';
  const arrivalCity = flight?.flights?.[flight?.flights?.length - 1]?.destination?.city || '';

  const start = new Date(flight?.flights?.[0]?.departureTime);
  const end = new Date(flight?.flights?.[flight?.flights?.length - 1]?.arrivalTime);
  const durationMs = end - start;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const duration = `${hours}h ${minutes}m`;

  const stops = flight?.flights?.length - 1 || 0;
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const calculateLayoverDuration = (arrival, nextDeparture) => {
    const arrivalTime = new Date(arrival);
    const departureTime = new Date(nextDeparture);
    const durationMs = departureTime - arrivalTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-blue-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg text-blue-700">${price}</span>
            <span className="text-blue-800">{airline}</span>
            <span className="text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded-full">
              {formatDate(flight?.flights?.[0]?.departureTime)}
            </span>
            {isReturn && (
              <span className="text-white text-xs bg-blue-600 px-2 py-1 rounded-full">Return</span>
            )}
          </div>
          <Button variant="primary" className="bg-blue-600 hover:bg-blue-700">
            {isReturn ? 'Select Return' : 'Select Flight'}
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-xl font-bold text-blue-900">{departureTime}</p>
            <p className="text-blue-800">{departureAirport}</p>
            <p className="text-blue-600 text-sm">{departureCity}</p>
          </div>

          <div className="text-blue-700 text-sm text-center flex-1 mx-4">
            <p>{duration}</p>
            <div className="relative">
              <div className="border-t border-blue-400 my-2 mx-auto" />
              {stops > 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                  {stops === 1 ? '1 stop' : `${stops} stops`}
                </div>
              )}
            </div>
            {stops > 0 && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-700 hover:text-blue-800 text-xs underline mt-1"
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
            )}
          </div>

          <div>
            <p className="text-xl font-bold text-blue-900">{arrivalTime}</p>
            <p className="text-blue-800">{arrivalAirport}</p>
            <p className="text-blue-600 text-sm">{arrivalCity}</p>
          </div>
        </div>
      </div>

      {showDetails && stops > 0 && (
        <div className="bg-blue-50 p-4 border-t border-blue-200">
          <h4 className="text-blue-900 font-medium mb-2">Flight Details</h4>

          <div className="space-y-4">
            {flight.flights.map((segment, index) => (
              <div key={index}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <span className="text-blue-800 font-medium">{segment.airline.name}</span>
                    <span className="text-blue-600 text-xs">Flight {segment.flightNumber}</span>
                  </div>
                  <span className="text-blue-700 text-sm">
                    {new Date(segment.departureTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {' - '}
                    {new Date(segment.arrivalTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="ml-8 mt-1 flex justify-between">
                  <div>
                    <p className="text-blue-800">
                      {segment.origin.code} → {segment.destination.code}
                    </p>
                    <p className="text-blue-600 text-xs">
                      {segment.origin.city} to {segment.destination.city}
                    </p>
                  </div>
                  <div className="text-blue-600 text-xs text-right">{formatDate(segment.departureTime)}</div>
                </div>

                {index < flight.flights.length - 1 && (
                  <div className="ml-8 mt-2 mb-2 pb-2 border-b border-blue-200">
                    <div className="flex items-center text-blue-700 text-xs">
                      <div className="w-2 h-2 bg-blue-300 rounded-full mr-2"></div>
                      <span>
                        Layover: {calculateLayoverDuration(segment.arrivalTime, flight.flights[index + 1].departureTime)}{' '}
                        in {segment.destination.city} ({segment.destination.code})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-blue-200 flex justify-between text-blue-700 text-sm">
            <span>Total duration: {duration}</span>
            <span>
              Total price: <span className="font-bold">${price}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};