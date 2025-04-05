import { NextRequest } from 'next/server';
import { loginUser } from '@/services/authService';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    console.log("Login API: Processing request for email:", email);
    
    if (!email || !password) {
      return Response.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Call the loginUser service
    const loginResponse = await loginUser(email, password);
    
    console.log("Login API: Auth service response:", {
      userId: loginResponse.user.id, 
      email: loginResponse.user.email,
      hasAccessToken: !!loginResponse.accessToken,
      hasRefreshToken: !!loginResponse.refreshToken
    });
    
    // Create response first
    const response = Response.json({
      message: 'Logged in successfully',
      user: loginResponse.user,
      refreshToken: loginResponse.refreshToken
    });
    
    // Then append cookies to it
    response.headers.append('Set-Cookie', `accessToken=${loginResponse.accessToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    
    return response;
  } catch (error) {
    console.error('Login API error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
    
    return Response.json(
      { message: 'Login failed', error: errorMessage },
      { status: 401 }
    );
  }
}