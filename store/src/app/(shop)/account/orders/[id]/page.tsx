'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Package, ArrowLeft, AlertCircle, CheckCircle, Truck, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
}

const statusSteps = [
  { status: 'PENDING', label: 'Pending', icon: ShoppingBag },
  { status: 'PROCESSING', label: 'Processing', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const statusColors: Record<string, string> = {
  'PENDING': 'border-yellow-300 text-yellow-800 bg-yellow-50',
  'PROCESSING': 'border-blue-300 text-blue-800 bg-blue-50',
  'SHIPPED': 'border-purple-300 text-purple-800 bg-purple-50',
  'DELIVERED': 'border-green-300 text-green-800 bg-green-50',
  'COMPLETED': 'border-green-300 text-green-800 bg-green-50',
  'CANCELLED': 'border-red-300 text-red-800 bg-red-50',
};

const getStatusIndex = (status: string): number => {
  const index = statusSteps.findIndex(step => step.status === status);
  return index >= 0 ? index : 0;
};

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/orders');
    } else if (status === 'authenticated') {
      fetchOrder();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/orders/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Order not found');
        } else if (response.status === 403) {
          setError('You do not have permission to view this order');
        } else {
          setError('Failed to fetch order');
        }
        return;
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('An error occurred while fetching the order');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
            <p className="text-gray-500 mb-6">
              Please try again or go back to your orders.
            </p>
            <Link
              href="/account/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusIndex = getStatusIndex(order.status);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/account/orders"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Order Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-[#0f172a] px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-white font-medium">
                Order #{order.id.substring(0, 8)}
              </h2>
              <p className="text-gray-300 text-sm">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[order.status]}`}>
              {order.status}
            </span>
          </div>

          {/* Order Tracking */}
          {order.status !== 'CANCELLED' && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
              <div className="relative">
                <div className="absolute top-5 left-5 w-[calc(100%-40px)] h-0.5 bg-gray-200"></div>
                <div 
                  className="absolute top-5 left-5 h-0.5 bg-blue-600 transition-all duration-500" 
                  style={{ width: `${statusIndex * 100 / (statusSteps.length - 1)}%` }}
                ></div>
                <div className="relative flex justify-between">
                  {statusSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = index <= statusIndex;
                    const isCurrent = index === statusIndex;
                    
                    return (
                      <div key={step.status} className="flex flex-col items-center">
                        <div 
                          className={`rounded-full h-10 w-10 flex items-center justify-center z-10 ${
                            isActive 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          } ${
                            isCurrent ? 'ring-4 ring-blue-100' : ''
                          }`}
                        >
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <p className={`mt-2 text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="flex py-4">
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden relative">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gray-200">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <Link href={`/products/${item.product.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {item.product.name}
                    </Link>
                    <div className="flex justify-between mt-1">
                      <div className="text-sm text-gray-500">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-sm font-medium text-gray-900">${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Shipping</span>
              <span className="text-sm font-medium text-gray-900">Free</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Tax</span>
              <span className="text-sm font-medium text-gray-900">$0.00</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-base font-medium text-gray-900">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-700">{order.shippingAddress}</p>
          </div>
        </div>

        {/* Need Help */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Need Help?</h3>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-700 mb-4">
              If you have any questions about your order, please contact our customer support.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}