import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  exp?: number;
  [key: string]: any;
}

const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret_key";

export async function GET(request: NextRequest) {
  try {
    console.log("Auth Status API: Checking auth status");
    // Get the access token from request cookies
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      console.log("Auth Status API: No token found in cookie");
      return Response.json({ 
        isAuthenticated: false,
        message: 'Not authenticated' 
      });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      console.log("Auth Status API: Token verified for user:", decoded.userId);
      
      return Response.json({ 
        isAuthenticated: true,
        userId: decoded.userId,
        expiresAt: decoded.exp
      });
    } catch (error) {
      console.error("Auth Status API: JWT verification error:", error);
      return Response.json({ 
        isAuthenticated: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error("Auth Status API: Unexpected error:", error);
    return Response.json({ 
      isAuthenticated: false,
      message: 'Error checking authentication status'
    }, { status: 500 });
  }
}
