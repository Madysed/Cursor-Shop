import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Set dynamic config
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds timeout

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    
    console.log('Products GET request with params:', { categoryId, search }); // Server-side log

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId && {
          categoryId
        }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        category: true
      }
    });

    console.log(`Found ${products.length} products`); // Server-side log
    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('Products POST request received'); // Server-side log
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('Auth session status:', session ? 'authenticated' : 'unauthenticated'); // Server-side log

    if (!session || session.user.role !== 'ADMIN') {
      console.log('Unauthorized product creation attempt'); // Server-side log
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Received product data:', JSON.stringify(body));
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Extract and validate fields
    const { name, description, price, stock, categoryId, images } = body;

    console.log('Product creation data:', { 
      name, 
      description, 
      price: typeof price, 
      stock: typeof stock,
      categoryId, 
      imagesLength: images?.length || 0
    }); // Server-side log

    if (!name || !description || price === undefined || price === null) {
      console.log('Invalid product data, missing required fields'); // Server-side log
      return NextResponse.json(
        { error: 'Name, description and price are required' },
        { status: 400 }
      );
    }
    
    // Handle optional categoryId
    const categoryData = categoryId ? {
      category: {
        connect: { id: categoryId }
      }
    } : {};

    // Add safety for images array
    const safeImages = Array.isArray(images) ? images : [];

    console.log('Creating product with prisma...'); // Server-side log
    
    try {
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(String(price)),
          stock: stock ? parseInt(String(stock)) : 0,
          images: safeImages,
          ...categoryData
        },
        include: {
          category: true
        }
      });

      console.log('Product created successfully with ID:', product.id); // Server-side log
      return NextResponse.json(product);
    } catch (dbError) {
      console.error('Database error during product creation:', dbError);
      return NextResponse.json(
        { 
          error: 'Database error',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 