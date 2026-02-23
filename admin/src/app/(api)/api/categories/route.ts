import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Set dynamic config
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds timeout

export async function GET() {
  console.log('Categories GET request received'); // Server-side log
  try {
    const session = await getServerSession(authOptions);
    console.log('Auth session status:', session ? 'authenticated' : 'unauthenticated'); // Server-side log
    
    if (!session || session.user.role !== 'ADMIN') {
      console.log('Unauthorized categories fetch attempt'); // Server-side log
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    console.log(`Found ${categories.length} categories`); // Server-side log
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('Categories POST request received'); // Server-side log
  try {
    const session = await getServerSession(authOptions);
    console.log('Auth session status:', session ? 'authenticated' : 'unauthenticated'); // Server-side log
    
    if (!session || session.user.role !== 'ADMIN') {
      console.log('Unauthorized category creation attempt'); // Server-side log
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const json = await request.json();
    const { name, imageUrl } = json;
    console.log('Category creation data:', { name, imageUrl }); // Server-side log

    if (!name) {
      console.log('Invalid category data: missing name'); // Server-side log
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    console.log('Creating category with prisma...'); // Server-side log
    const category = await prisma.category.create({
      data: {
        name,
        imageUrl: imageUrl || null,
      },
    });
    console.log('Category created successfully with ID:', category.id); // Server-side log
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 