import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: string;
  orderId?: string;
}

export async function POST(request: Request) {
  try {
    // Parse notification data from request
    const data: NotificationPayload = await request.json();
    
    // Validate required fields
    if (!data.userId || !data.title || !data.message) {
      return NextResponse.json(
        { message: 'Missing required fields: userId, title and message are required' },
        { status: 400 }
      );
    }
    
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        orderId: data.orderId,
        read: false,
      },
    });
    
    console.log(`Notification created: ${notification.id} for user ${data.userId}`);
    
    // Return success response
    return NextResponse.json({
      message: 'Notification created successfully',
      notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { message: 'Failed to create notification', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get unread notifications for the user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Limit to 20 most recent notifications
    });
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: 'Failed to fetch notifications', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { id, read } = data;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    // Update notification read status
    const notification = await prisma.notification.update({
      where: {
        id,
        userId: session.user.id, // Ensure user can only update their own notifications
      },
      data: {
        read: read === undefined ? true : read,
      },
    });
    
    return NextResponse.json({
      message: 'Notification updated successfully',
      notification,
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { message: 'Failed to update notification', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 