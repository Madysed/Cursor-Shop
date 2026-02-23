import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only allow users to access their own notifications or admins to access any
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
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

    if (!notification) {
      return NextResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to view this notification
    if (session.user.role !== 'ADMIN' && notification.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized to access this notification' },
        { status: 403 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { message: 'Failed to fetch notification', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the notification to check ownership
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });

    if (!notification) {
      return NextResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }

    // Only allow users to update their own notifications or admins to update any
    if (session.user.role !== 'ADMIN' && notification.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized to update this notification' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { read } = data;

    // Update the notification
    const updatedNotification = await prisma.notification.update({
      where: { id: params.id },
      data: { read },
    });

    return NextResponse.json({
      message: 'Notification updated successfully',
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { message: 'Failed to update notification', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the notification to check ownership
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });

    if (!notification) {
      return NextResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }

    // Only allow users to delete their own notifications or admins to delete any
    if (session.user.role !== 'ADMIN' && notification.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized to delete this notification' },
        { status: 403 }
      );
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { message: 'Failed to delete notification', error: error instanceof Error ? error.message : 'Unknown error' },
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