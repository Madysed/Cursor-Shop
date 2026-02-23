'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, Package } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID not found');
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Could not load order details. Please check your order history.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg">Loading your order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error</h1>
          <p className="text-red-600 mb-6">{error || 'Order not found'}</p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="bg-[#0f172a] text-white rounded-lg p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-4">Order Confirmed!</h1>
        <p className="text-center text-gray-300 mb-8">
          Thank you for your order. Your order has been received and is now being processed.
        </p>
        
        <div className="bg-[#1e293b] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Order Number</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Date</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="font-medium">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {order.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="font-medium">${order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/account/orders"
            className="inline-flex items-center justify-center px-4 py-2 bg-transparent border border-blue-500 text-blue-400 rounded-md hover:bg-blue-900/30 transition-colors"
          >
            <Package className="mr-2 h-4 w-4" />
            View Your Orders
          </Link>
          
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Home className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
} 