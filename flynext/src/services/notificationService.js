import prisma from '@/lib/prisma';

// Fetch all notifications with optional userId filter
export async function getNotifications(userId = null) {
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
export async function createNotification(userId, type, message) {
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

export async function updateNotification(id, data) {
  try {
    return await prisma.notification.update({
      where: { id },
      data: { read: data.read },
    });
  } catch (error) {
    if (error.code === 'P2025') throw new Error('Notification not found');
    throw new Error('Failed to update notification');
  }
}