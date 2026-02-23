'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface NotificationResponse {
  notifications: any[];
  error: string | null;
}

interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string;
  orderId?: string;
}

// Server action to safely fetch notifications 
export async function getNotifications(): Promise<NotificationResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { error: 'Unauthorized', notifications: [] };
    }

    // Using prisma directly in a server action is safe
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Limit to 20 most recent notifications
    });

    return { notifications, error: null };
  } catch (error) {
    console.error('Error in getNotifications server action:', error);
    return { error: 'An unexpected error occurred', notifications: [] };
  }
}

// Server action to mark a notification as read
export async function markNotificationAsRead(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.notification.update({
      where: {
        id,
        userId: session.user.id, // Ensure user can only update their own notifications
      },
      data: {
        read: true,
      },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Failed to update notification' };
  }
}

// Server action to send a notification to a user
export async function sendNotification(
  params: SendNotificationParams
): Promise<{ success: boolean; error: string | null }> {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if caller is authorized (admin or the user themselves)
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Create the notification
    await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title, 
        message: params.message,
        type: params.type,
        orderId: params.orderId,
        read: false
      }
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
} 