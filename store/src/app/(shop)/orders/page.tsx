import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
          <p className="text-gray-600 mb-8">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/products"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Your Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {order.status.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <li key={item.id} className="py-6 flex">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <Image
                            src={typeof item.product.images[0] === 'string' ? item.product.images[0] : '/placeholder.jpg'}
                            alt={item.product.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>

                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>
                                <Link href={`/products/${item.product.id}`}>
                                  {item.product.name}
                                </Link>
                              </h3>
                              <p className="ml-4">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <p className="text-gray-500">Qty {item.quantity}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View Order Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 