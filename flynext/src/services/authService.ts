import prisma from '@/lib/prisma';
import { generateRefreshToken, generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface UpdateData {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    profilePicture?: string;
  };
}

export const registerUser = async (userData: UserData) => {
  const { email, password, firstName, lastName } = userData;
  
  // Validation
  if (!email || !password || !firstName || !lastName) {
    throw new Error('All fields are required');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  return prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      profilePicture: true,
      createdAt: true
    }
  });
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  console.log("AuthService: Attempting login for email:", email);
  
  const user = await prisma.user.findUnique({ 
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      profilePicture: true,
      createdAt: true,
      updatedAt: true,
      password: true
    }
  });
  
  if (!user) {
    console.log("AuthService: User not found with email:", email);
    throw new Error('Invalid credentials - user not found');
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    console.log("AuthService: Password invalid for user:", email);
    throw new Error('Invalid credentials - password mismatch');
  }
  
  // Debug log to see if we have the correct user data
  console.log("AuthService: User found during login:", {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  });
  
  // Remove password from the user object before returning
  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber ?? undefined,
    profilePicture: user.profilePicture ?? undefined,
  };
  
  // Generate tokens
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Return complete response with user data
  const response: LoginResponse = {
    accessToken,
    refreshToken,
    user: userWithoutPassword
  };
  
  console.log("AuthService: Login successful, returning user data:", {
    id: response.user.id,
    email: response.user.email,
    firstName: response.user.firstName,
    lastName: response.user.lastName
  });
  
  return response;
};

export const updateUserProfile = async (userId: string, updateData: UpdateData) => {
  // Define allowed fields for updates
  const allowedFields = ['email', 'firstName', 'lastName', 'password', 'phoneNumber', 'profilePicture'];
  const requiredNonEmptyFields = ['email', 'firstName', 'lastName', 'password'];
  
  // Create a new object with only allowed fields
  const validatedData: Record<string, string | undefined> = {};
  
  // Validate incoming data
  for (const [key, value] of Object.entries(updateData)) {
    // Check if the field is allowed
    if (!allowedFields.includes(key)) {
      throw new Error(`Field '${key}' cannot be updated, either missing or restricted`);
    }
    
    // Check required fields are not empty
    if (requiredNonEmptyFields.includes(key) && !value) {
      throw new Error(`Field '${key}' cannot be empty`);
    }
    
    // Handle email validation
    if (key === 'email' && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Invalid email format');
      }
      
      // Check if email is already in use by another user
      const existingUser = await prisma.user.findUnique({ 
        where: { 
          email: value 
        }
      });
      
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already in use');
      }
    }
    
    // Handle password hashing
    if (key === 'password' && typeof value === 'string') {
      validatedData[key] = await bcrypt.hash(value, 10);
    } else {
      validatedData[key] = value;
    }
  }
  
  // Update the user profile
  return prisma.user.update({
    where: { id: userId },
    data: validatedData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      profilePicture: true
    }
  });
};
