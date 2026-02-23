import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const itemId = params.itemId
    const body = await request.json()
    const { quantity } = body

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { message: 'Invalid quantity' },
        { status: 400 }
      )
    }

    // Find the cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    })

    if (!cartItem) {
      return NextResponse.json(
        { message: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Check if the cart belongs to the user
    if (cartItem.cart.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if the requested quantity is available in stock
    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        { message: 'Requested quantity exceeds available stock' },
        { status: 400 }
      )
    }

    // Update the cart item quantity
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    })

    return NextResponse.json({ message: 'Quantity updated successfully' })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { message: 'Failed to update cart item' },
      { status: 500 }
    )
  }
} 