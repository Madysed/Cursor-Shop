import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { message: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const { userId, cartId } = session.metadata

      // Update order status
      await prisma.order.updateMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
        data: {
          status: 'PROCESSING',
        },
      })

      // Clear cart
      await prisma.cart.delete({
        where: { id: cartId },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { message: 'Webhook error' },
      { status: 400 }
    )
  }
} 