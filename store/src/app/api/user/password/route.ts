import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
    const { currentPassword, newPassword } = data;
    
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current and new passwords are required' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // Find user with hashed password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, hashedPassword: true }
    });
    
    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { message: 'User not found or has no password set' },
        { status: 404 }
      );
    }
    
    // Verify current password
    const passwordMatches = await bcrypt.compare(currentPassword, user.hashedPassword);
    
    if (!passwordMatches) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword }
    });
    
    return NextResponse.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { message: 'Failed to update password', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 