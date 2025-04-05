import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, createNotification, NotificationType } from '@/services/notificationService';

interface CreateNotificationBody {
  userId: string;
  type: NotificationType;
  message: string;
}

// GET: Fetch all notifications or notifications for a specific user
export async function GET(request: NextRequest) {
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
      { error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST: Create a new notification
export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as CreateNotificationBody;
    const { userId, type, message } = data;

    // Validate required fields
    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, or message' },
        { status: 400 }
      );
    }

    // Create and send the actual notification
    const notification = await createNotification(userId, type, message);
    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create notification' },
      { status: 500 }
    );
  }
}
