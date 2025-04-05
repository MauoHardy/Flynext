import { NextRequest } from 'next/server';
import { registerUser } from '@/services/authService';
import { generateToken, generateRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const user = await registerUser(userData);
    
    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Create response with user data and refreshToken
    const response = Response.json({
      user,
      refreshToken
    }, { 
      status: 201 
    });
    
    // Set access token in cookie
    response.headers.append('Set-Cookie', `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    
    return response;
  } catch (error) {
    console.error("Register API error:", error);
    
    return Response.json(
      { message: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
