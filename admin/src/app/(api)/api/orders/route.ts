import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Test database connection
    try {
      const dbTest = await prisma.$queryRaw`SELECT 1 as result`;
      console.log('Database connection successful:', dbTest);
    } catch (dbError) {
      console.error('Database connectivity error:', dbError);
      return NextResponse.json(
        { error: "Database connection error" },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Admin fetching orders:", session.user.email);

    // Direct query to check if orders exist at all
    const ordersCount = await prisma.order.count();
    console.log(`Total orders in database: ${ordersCount}`);

    // Query all orders directly without filters or includes first
    const allOrderIds = await prisma.order.findMany({
      select: { id: true, status: true, userId: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Found ${allOrderIds.length} order IDs:`, allOrderIds);

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${orders.length} full orders with details`);
    
    if (orders.length > 0) {
      console.log("First order sample:", {
        id: orders[0].id,
        status: orders[0].status,
        userId: orders[0].userId,
        total: orders[0].total,
        items: orders[0].items.length,
      });
    } else if (ordersCount > 0) {
      console.log("Warning: Orders exist in database but none were retrieved with details");
      
      // Try to return the basic order data without relations if we have a count mismatch
      return NextResponse.json(allOrderIds.map(order => ({
        ...order,
        user: { id: order.userId, name: "Unknown", email: "unknown@example.com" },
        items: [],
      })), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    return NextResponse.json(orders, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
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

export async function PATCH(
  request: Request
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, orderId } = body;

    if (!status || !orderId) {
      return NextResponse.json(
        { error: "Status and orderId are required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(order, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error("[ORDER_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
} 