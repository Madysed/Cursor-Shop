import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Specify that this route is dynamic and should not be statically generated
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('No user session found in orders API');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Fetching orders for user:', session.user.id);
    
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${orders.length} orders for user ${session.user.id}`);
    
    if (orders.length > 0) {
      console.log('First order details:', {
        id: orders[0].id,
        status: orders[0].status,
        itemCount: orders[0].items.length,
        createdAt: orders[0].createdAt
      });
    }
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { message: 'Failed to fetch orders', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 