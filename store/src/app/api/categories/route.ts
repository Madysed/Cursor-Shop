import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrSet, invalidateCache } from '@/lib/redis';

/**
 * Get all categories with caching
 * - Categories change infrequently, making them perfect for caching
 * - 15 minute cache TTL is reasonable for this data
 */
export async function GET() {
  try {
    // Use Redis cache with a fallback to database
    const categories = await getOrSet(
      'categories:all',
      async () => {
        console.log('Cache miss: Fetching categories from database...');
        return await prisma.category.findMany({
          orderBy: {
            name: 'asc',
          },
        });
      },
      900 // Cache for 15 minutes
    );

    // Add cache header to response
    const headers = new Headers();
    headers.set('X-Cache', 'HIT');
    headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=900');
    
    console.log(`Returning ${categories.length} categories`);
    return NextResponse.json(categories, { headers });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * Create a new category
 */
export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        imageUrl,
      },
    });
    
    // Invalidate the categories cache when a new one is added
    await invalidateCache('categories:all');
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

/**
 * CORS headers for the categories API
 */
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
} 