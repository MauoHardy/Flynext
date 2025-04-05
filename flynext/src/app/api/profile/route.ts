import { NextRequest } from 'next/server';
import { getUserFromCookieToken } from '@/lib/auth';
import { updateUserProfile } from '@/services/authService';
import { createNotification } from '@/services/notificationService';

export async function PATCH(request: NextRequest) {
  try {
    console.log("Profile API: Processing update request");
    const user = await getUserFromCookieToken(request);
    const updateData = await request.json();

    console.log("Profile API: Updating user:", user.id);
    const updatedUser = await updateUserProfile(user.id, updateData);

    await createNotification(user.id, 'SystemUpdate', 'Your profile has been successfully updated');

    return Response.json(updatedUser);
  } catch (error) {
    console.error("Profile API error:", error);
    return Response.json(
      { message: error instanceof Error ? error.message : 'Update failed' },
      { status: error instanceof Error && 
        (error.message.includes('token') || 
         error.message.includes('Authentication')) ? 401 : 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("Profile API: Processing get request");
    const user = await getUserFromCookieToken(request);
    console.log("Profile API: Found user:", user.id);

    return Response.json(user);
  } catch (error) {
    console.error("Profile API error:", error);
    return Response.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch profile' },
      { status: error instanceof Error && 
        (error.message.includes('token') || 
         error.message.includes('Authentication')) ? 401 : 400 }
    );
  }
}