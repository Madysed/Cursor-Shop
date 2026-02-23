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
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin can see all notifications, regular users can only see their own
    const where = session.user.role === "ADMIN" 
      ? {} 
      : { userId: session.user.id };
    
    // Get notifications based on role
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Increased limit for admin view
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
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

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
} 