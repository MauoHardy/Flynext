// app/_utils/api.ts
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiOptions {
  method?: RequestMethod;
  body?: Record<string, unknown>;
  params?: Record<string, string>;
  headers?: HeadersInit;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, params, headers = {} } = options;

  // Add query parameters if provided
  const url = new URL(`${window.location.origin}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // Include cookies for authentication
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), requestOptions);

  if (!response.ok) {
    // Try to parse error message from response
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If we can't parse JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// API endpoints with typed responses
export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiRequest<{ user: Record<string, unknown>; token: string }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
    register: (userData: Record<string, unknown>) =>
      apiRequest<{ user: Record<string, unknown>; token: string }>('/api/auth/register', {
        method: 'POST',
        body: userData,
      }),
    logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    refresh: () => apiRequest('/api/auth/refresh', { method: 'POST' }),
  },
  
  // Profile endpoints
  profile: {
    get: () => apiRequest('/api/profile'),
    update: (data: Record<string, unknown>) =>
      apiRequest('/api/profile', { method: 'PUT', body: data }),
  },
  
  // Flight endpoints
  flights: {
    search: (searchParams: Record<string, string>) =>
      apiRequest('/api/flights/search', { params: searchParams }),
  },
  
  // Hotel endpoints
  hotels: {
    search: (searchParams: Record<string, string>) =>
      apiRequest('/api/hotels/search', { params: searchParams }),
    addProperty: (propertyData: Record<string, unknown>) =>
      apiRequest('/api/hotels/add/property', {
        method: 'POST',
        body: propertyData,
      }),
    addRoomType: (roomData: Record<string, unknown>) =>
      apiRequest('/api/hotels/add/room_type', {
        method: 'POST',
        body: roomData,
      }),
    update: (hotelId: string, data: Record<string, unknown>) =>
      apiRequest('/api/hotels/update', {
        method: 'PUT',
        body: { id: hotelId, ...data },
      }),
  },
  
  // Booking endpoints
  bookings: {
    create: (bookingData: { userId: string; flightId: string; date: string }) =>
      apiRequest('/api/bookings', { method: 'POST', body: bookingData }),
    getAll: () => apiRequest('/api/bookings'),
    cancel: (bookingId: string) =>
      apiRequest('/api/bookings/cancel', {
        method: 'POST',
        body: { bookingId },
      }),
    verify: (flightNumber: string) =>
      apiRequest('/api/bookings/verifyFlight', {
        params: { flightNumber },
      }),
  },
};