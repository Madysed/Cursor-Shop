import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Get profile information
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { message: 'Failed to get user profile', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Update profile information
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await req.json();
    const { name } = data;
    
    // Check required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Update user information
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { message: 'Failed to update user profile', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Set CORS headers
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
} 