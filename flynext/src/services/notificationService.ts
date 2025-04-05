import prisma from '@/lib/prisma';

export type NotificationType = 'SystemUpdate' | 'BookingConfirmation' | 'Cancellation' | 'Reminder';

export interface NotificationUpdateData {
  read: boolean;
}

// Fetch all notifications with optional userId filter
export async function getNotifications(userId: string | null = null) {
  try {
    const whereClause = userId ? { userId } : {};
    
    return await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc' // Optional: Sort by most recent first
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Failed to fetch notifications');
  }
}

// Create a new notification
export async function createNotification(userId: string, type: NotificationType, message: string) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        message,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

export async function updateNotification(id: string, data: NotificationUpdateData) {
  try {
    return await prisma.notification.update({
      where: { id },
      data: { read: data.read },
    });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') throw new Error('Notification not found');
    throw new Error('Failed to update notification');
  }
}
