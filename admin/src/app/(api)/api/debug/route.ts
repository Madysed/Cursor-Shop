import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Test database connection
    const databaseTest = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Database test result:', databaseTest);

    // Check for recent orders
    const ordersCount = await prisma.order.count();
    console.log(`Total orders in database: ${ordersCount}`);

    // Fetch most recent order
    const latestOrder = await prisma.order.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    console.log('Latest order:', latestOrder ? {
      id: latestOrder.id,
      createdAt: latestOrder.createdAt,
      userId: latestOrder.userId,
      userName: latestOrder.user?.name,
      itemCount: latestOrder.items.length
    } : 'No orders found');

    return NextResponse.json({
      status: "success",
      databaseConnected: !!databaseTest,
      ordersCount,
      latestOrder: latestOrder ? {
        id: latestOrder.id,
        status: latestOrder.status,
        total: latestOrder.total,
        createdAt: latestOrder.createdAt,
        itemCount: latestOrder.items.length
      } : null
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
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