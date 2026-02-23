import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { CartItem } from '@/types'
import { cookies } from 'next/headers'

type CartItemWithProduct = {
  id: string
  quantity: number
  productId: string
  cartId: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Please login to add items to cart' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { message: 'Product is out of stock' },
        { status: 400 }
      )
    }

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      // Create new cart for user
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        }
      })
    }

    // Check if product already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    })

    if (existingItem) {
      // Check if updating quantity would exceed stock
      if (existingItem.quantity + quantity > product.stock) {
        return NextResponse.json(
          { message: 'Cannot add more items than available in stock' },
          { status: 400 }
        )
      }

      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      })
    }

    return NextResponse.json(
      { message: 'Product added to cart' },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    )
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { message: 'Failed to add product to cart' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Please login to view cart' },
        { status: 401 }
      )
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                stock: true,
              },
            },
          },
        },
      },
    })

    if (!cart) {
      return NextResponse.json({ items: [] })
    }

    // Filter out any items where the product no longer exists or is out of stock
    const validItems = cart.items.filter(item => 
      item.product && item.quantity <= item.product.stock
    )

    return NextResponse.json({
      ...cart,
      items: validItems,
    })
  } catch (error) {
    console.error('Cart error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { message: 'Missing item ID' },
        { status: 400 }
      )
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    })

    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Cart error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
} 