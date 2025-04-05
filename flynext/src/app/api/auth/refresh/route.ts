import { NextRequest } from 'next/server';
import { verifyRefreshToken, generateToken, generateRefreshToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log("Refresh API: Processing refresh request");
    
    // Get refresh token from request body
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      console.log("Refresh API: No refresh token provided");
      return Response.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      );
    }
    
    // Verify the refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
      console.log("Refresh API: Token verified for user:", decoded.userId);
    } catch (error) {
      console.error("Refresh API: Token verification failed:", error instanceof Error ? error.message : 'Unknown error');
      return Response.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    if (!user) {
      console.log("Refresh API: User not found:", decoded.userId);
      return Response.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Generate new tokens
    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    console.log("Refresh API: Generated new tokens for:", user.email);
    
    // Create response with user and new refresh token
    const response = Response.json({
      user,
      refreshToken: newRefreshToken
    });
    
    // Set new access token in cookie
    response.headers.append('Set-Cookie', `accessToken=${newAccessToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    
    return response;
  } catch (error) {
    console.error("Refresh API: Unexpected error:", error);
    return Response.json(
      { message: error instanceof Error ? error.message : 'Server error during refresh' },
      { status: 500 }
    );
  }
}