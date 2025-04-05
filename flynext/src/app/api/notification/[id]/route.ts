import { NextRequest, NextResponse } from 'next/server';
import { updateNotification } from '@/services/notificationService';

interface RouteParams {
  params: {
    id: string;
  };
}

interface UpdateNotificationBody {
  read: boolean;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const data = await request.json() as UpdateNotificationBody;

    // Validate request body
    if (typeof data.read !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid "read" field' },
        { status: 400 }
      );
    }

    const updatedNotification = await updateNotification(params.id, data);
    return NextResponse.json(updatedNotification);

  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update notification' },
      { status: statusCode }
    );
  }
}
