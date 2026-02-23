import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Fetching order details for order ID: ${params.id}`);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('No user session found when fetching order details');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log(`User ${session.user.id} is requesting order ${params.id}`);
    
    // First try to find the order without the userId filter to check if it exists
    const orderExists = await prisma.order.findUnique({
      where: {
        id: params.id
      },
      select: {
        id: true,
        userId: true
      }
    });
    
    if (!orderExists) {
      console.log(`Order ${params.id} not found in database`);
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    // If the order doesn't belong to the current user
    if (orderExists.userId !== session.user.id) {
      console.log(`Order ${params.id} belongs to user ${orderExists.userId}, not current user ${session.user.id}`);
      return NextResponse.json(
        { message: 'You do not have permission to view this order' },
        { status: 403 }
      );
    }
    
    // Find the order with full details
    const order = await prisma.order.findUnique({
      where: {
        id: params.id
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Successfully retrieved order ${params.id} with ${order?.items.length || 0} items`);
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { message: 'Failed to fetch order details', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 