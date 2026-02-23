import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import Link from 'next/link'

interface SuccessPageProps {
  searchParams: {
    session_id: string
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  const { session_id } = searchParams

  if (!session_id) {
    redirect('/')
  }

  // Retrieve the Stripe session
  const stripeSession = await stripe.checkout.sessions.retrieve(session_id)

  if (!stripeSession) {
    redirect('/')
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      total: stripeSession.amount_total ? stripeSession.amount_total / 100 : 0,
      status: 'PROCESSING',
      shippingAddress: 'Address will be provided by customer',
      items: {
        create: stripeSession.line_items?.data.map((item) => ({
          productId: item.price?.product as string,
          quantity: item.quantity || 0,
          price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
        })),
      },
    },
  })

  // Clear cart
  await prisma.cart.delete({
    where: { userId: session.user.id },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Thank you for your order!</h1>
        <p className="text-gray-600 mb-8">
          Your order has been successfully placed. We will send you a confirmation email shortly.
        </p>
        <div className="space-y-4">
          <Link
            href="/products"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="block px-6 py-2 text-blue-600 hover:text-blue-800"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  )
} 