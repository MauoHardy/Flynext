import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { NextRequest } from 'next/server';
import prisma from './prisma';

// Use environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret_key";
const REFRESH_KEY = process.env.REFRESH_KEY || "your_secure_refresh_key";

// Standardized JWT payload
export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Generates an access token for the user
 */
export const generateToken = (user: User): string => {
  const tokenPayload: JwtPayload = { userId: user.id };
  
  return jwt.sign(
    tokenPayload,
    JWT_SECRET,
    { expiresIn: '1h' } // 1 hour
  );
};

/**
 * Generates a refresh token for the user
 */
export const generateRefreshToken = (user: User): string => {
  const tokenPayload: JwtPayload = { userId: user.id };
  
  return jwt.sign(
    tokenPayload,
    REFRESH_KEY,
    { expiresIn: '30d' } // 30 days
  );
};

/**
 * Authenticates a request using the Authorization header
 * Returns the authenticated user if successful
 */
export const authenticateRequest = async (req: NextRequest) => {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    if (!decoded.userId) {
      throw new Error('Invalid token: missing userId');
    }
    
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
        updatedAt: true
      }
    });

    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid or expired token');
    }
    throw error;
  }
};

/**
 * Verifies an access token from cookies
 * Returns the decoded payload if valid
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    if (!decoded.userId) {
      throw new Error('Invalid token: missing userId');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verifies a refresh token
 * Returns the decoded payload if valid
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, REFRESH_KEY) as JwtPayload;
    
    if (!decoded.userId) {
      throw new Error('Invalid token: missing userId');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Gets the user from an access token cookie
 */
export const getUserFromCookieToken = async (req: NextRequest) => {
  console.log("Auth: Getting user from cookie token");
  
  // Look for token in cookie
  const token = req.cookies.get('accessToken')?.value;
  
  // If no token in cookie, check Authorization header as fallback
  const authHeader = !token ? req.headers.get('authorization') : null;
  const headerToken = authHeader ? authHeader.split(' ')[1] : null;
  
  // Use whichever token we found
  const accessToken = token || headerToken;

  if (!accessToken) {
    console.log("Auth: No token found in cookie or header");
    throw new Error('Authentication required');
  }

  try {
    console.log("Auth: Verifying token");
    const decoded = verifyAccessToken(accessToken);
    console.log("Auth: Token verified for user:", decoded.userId);
    
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
        updatedAt: true
      }
    });

    if (!user) {
      console.log("Auth: User not found after verifying token");
      throw new Error('User not found');
    }
    
    console.log("Auth: User found:", user.id);
    return user;
  } catch (error) {
    console.error("Auth: Error during token verification:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid or expired token');
    }
    throw error;
  }
};

// NextAuth configuration
export const authOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }: { session: any, token: any }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  secret: JWT_SECRET
};
