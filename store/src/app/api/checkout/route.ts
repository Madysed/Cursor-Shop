import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

interface CheckoutItem {
  productId: string
  quantity: number
  price: number
}

interface ShippingDetails {
  name: string
  email: string
  address: string
  city: string
  country: string
  postalCode: string
}

export async function POST(request: Request) {
  try {
    // Check database connectivity first
    try {
      const dbCheck = await prisma.$queryRaw`SELECT 1 as result`
      console.log('Database check result:', dbCheck)
    } catch (dbError) {
      console.error('Database connectivity error:', dbError)
      return NextResponse.json(
        { message: 'Database connection error. Please try again later.' },
        { status: 500 }
      )
    }

    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to place an order' },
        { status: 401 }
      )
    }

    console.log('Checkout process started for user:', session.user.id);
    const userId = session.user.id

    // Parse request body for shipping address
    const body = await request.json()
    const { items: requestItems, shippingAddress } = body

    console.log('Checkout request received:', { userId, shippingAddressLength: shippingAddress?.length });

    if (!shippingAddress) {
      return NextResponse.json(
        { message: 'Shipping address is required' },
        { status: 400 }
      )
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    console.log('Cart retrieved:', {
      cartId: cart?.id,
      itemCount: cart?.items?.length
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { message: 'Your cart is empty' },
        { status: 400 }
      )
    }

    // Validate all products are in stock
    const outOfStockItems = cart.items.filter(
      (item) => item.product.stock < item.quantity
    )

    if (outOfStockItems.length > 0) {
      return NextResponse.json(
        {
          message: 'Some items are out of stock',
          outOfStockItems: outOfStockItems.map((item) => ({
            name: item.product.name,
            requested: item.quantity,
            available: item.product.stock,
          })),
        },
        { status: 400 }
      )
    }

    // Calculate order total
    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    )

    console.log('Order total calculated:', { total });

    // Validate the total is reasonable
    if (!total || total <= 0 || total > 1000000 || !isFinite(total)) {
      return NextResponse.json(
        { message: 'Invalid order total' },
        { status: 400 }
      )
    }

    // Begin direct creation without transaction to diagnose any issues
    try {
      console.log('Creating order directly...');
      
      // Create the order first
      const newOrder = await prisma.order.create({
        data: {
          userId,
          status: 'PENDING',
          total,
          shippingAddress,
        },
      });
      
      console.log('Order created with ID:', newOrder.id);
      
      // Create the order items
      const orderItems = await Promise.all(
        cart.items.map(async (item) => {
          const orderItem = await prisma.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            },
          });
          console.log('Created order item:', orderItem.id);
          return orderItem;
        })
      );
      
      console.log(`Created ${orderItems.length} order items`);
      
      // Update product stock
      for (const item of cart.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
      
      console.log('Updated product stock');
      
      // Clear the cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      
      console.log('Cleared cart items');
      
      // Return the order details
      return NextResponse.json({
        message: 'Order created successfully',
        orderId: newOrder.id,
      });
    } catch (createError) {
      console.error('Error creating order:', createError);
      return NextResponse.json(
        { message: `Failed to create order: ${createError instanceof Error ? createError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { message: 'Failed to process your order. Please try again later.' },
      { status: 500 }
    );
  }
} 