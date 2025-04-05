/**
 * Utility function for making authenticated API requests with automatic token refresh
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Ensure credentials are included
  const fetchOptions = {
    ...options,
    credentials: 'include' as RequestCredentials,
  };

  // Make the initial request
  const response = await fetch(url, fetchOptions);

  // If we get a 401 (Unauthorized), try to refresh the token
  if (response.status === 401) {
    console.log('Token expired, attempting refresh...');
    
    // Try to refresh the token
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    // If refresh was successful, retry the original request
    if (refreshResponse.ok) {
      console.log('Token refresh successful, retrying request...');
      return fetch(url, fetchOptions);
    } else {
      console.error('Token refresh failed');
      // Let the original 401 response continue
    }
  }

  return response;
}
