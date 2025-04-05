// app/api/logout/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // Create response with success message
  const response = Response.json({ message: 'Logged out successfully' });
  
  // Clear cookies by setting them to expire in the past
  response.headers.append('Set-Cookie', 'accessToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
  
  return response;
}