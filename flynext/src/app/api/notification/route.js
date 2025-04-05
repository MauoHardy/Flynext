import { NextResponse } from 'next/server';
import { getNotifications, createNotification } from '@/services/notificationService';

// GET: Fetch all notifications or notifications for a specific user
export async function GET(request) {
  try {
    // Get the URL from the request
    const url = new URL(request.url);
    
    // Extract userId from query parameters if present
    const userId = url.searchParams.get('userId');
    
    // Pass the userId (or null if not provided) to getNotifications
    const notifications = await getNotifications(userId);
    
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new notification
export async function POST(request) {
  try {
    const { userId, type, message } = await request.json();

    // Validate required fields
    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, or message' },
        { status: 400 }
      );
    }

    // create and send the actual notification
    const notification = await createNotification(userId, type, message);
    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}