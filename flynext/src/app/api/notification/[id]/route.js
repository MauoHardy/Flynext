import { NextResponse } from 'next/server';
import { updateNotification } from '@/services/notificationService';

export async function PATCH(request, { params }) {
  try {
    const data = await request.json();

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
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { error: error.message },
      { status: statusCode }
    );
  }
}