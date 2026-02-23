import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

export default async function OrderPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const order = await prisma.order.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
  })

  if (!order) {
    redirect('/orders')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Order Details</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Order Number</h2>
              <p className="mt-1">{order.id}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Order Date</h2>
              <p className="mt-1">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Order Status</h2>
              <p className="mt-1 capitalize">{order.status.toLowerCase()}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Amount</h2>
              <p className="mt-1">{formatPrice(order.total)}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {order.shippingAddress}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <Image
                          className="h-10 w-10 rounded object-cover"
                          src={(item.product as any).images?.[0] || '/placeholder.jpg'}
                          alt={item.product.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 