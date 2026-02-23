'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Search, Filter, RefreshCw } from 'lucide-react';
import Image from 'next/image';

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

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress: string;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-300',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-300',
  DELIVERED: 'bg-green-100 text-green-800 border-green-300',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/orders');
    } else if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const getProductImageUrl = (images: string[]) => {
    if (!images || images.length === 0) return '/placeholder.jpg';
    
    const image = images[0];
    if (typeof image === 'string') return image;
    return '/placeholder.jpg';
  };

  const filteredOrders = orders.filter(order => {
    // Apply status filter
    if (statusFilter && order.status !== statusFilter as OrderStatus) {
      return false;
    }
    
    // Apply search filter (search in order ID or product names)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.items.some(item => 
          item.product.name.toLowerCase().includes(searchLower)
        )
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h1>
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Link href="/account" className="text-blue-600 hover:text-blue-800">
                My Account
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700">Orders</span>
            </div>
            
            <button
              onClick={fetchOrders}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="font-medium text-lg mb-4">Filters</h2>
            
            <div className="mb-4">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Order number or product"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 pr-10 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Search size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending Payment</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          
          {/* Orders list */}
          <div className="md:col-span-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter 
                    ? 'Please try changing your search or filter criteria' 
                    : 'You have not placed any orders yet'}
                </p>
                <Link 
                  href="/products" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status as OrderStatus] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
                          >
                            {order.status === 'PENDING' && 'Pending Payment'}
                            {order.status === 'PROCESSING' && 'Processing'}
                            {order.status === 'SHIPPED' && 'Shipped'}
                            {order.status === 'DELIVERED' && 'Delivered'}
                            {order.status === 'COMPLETED' && 'Completed'}
                            {order.status === 'CANCELLED' && 'Cancelled'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="flex -space-x-2 space-x-reverse">
                            {order.items.slice(0, 3).map((item, index) => (
                              <div key={item.id} className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                                <Image
                                  src={getProductImageUrl(item.product.images)}
                                  alt={item.product.name}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                            
                            {order.items.length > 3 && (
                              <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-sm">
                            {order.items.length} item(s)
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            ${order.total.toFixed(2)}
                          </div>
                          <ChevronRight size={16} className="text-gray-400 ml-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Order details modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Order Details #{selectedOrder.id.slice(0, 8)}</h2>
                    <p className="text-sm text-gray-500">
                      Order Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={closeOrderDetails}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Order Status</h3>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                        statusColors[selectedOrder.status as OrderStatus] || 'bg-gray-100 text-gray-800 border-gray-300'
                      }`}
                    >
                      {selectedOrder.status === 'PENDING' && 'Pending Payment'}
                      {selectedOrder.status === 'PROCESSING' && 'Processing'}
                      {selectedOrder.status === 'SHIPPED' && 'Shipped'}
                      {selectedOrder.status === 'DELIVERED' && 'Delivered'}
                      {selectedOrder.status === 'COMPLETED' && 'Completed'}
                      {selectedOrder.status === 'CANCELLED' && 'Cancelled'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Address</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {selectedOrder.shippingAddress}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden">
                                  <Image
                                    src={getProductImageUrl(item.product.images)}
                                    alt={item.product.name}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.product.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold">
                    Total: ${selectedOrder.total.toFixed(2)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={closeOrderDetails}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <Link
                      href={`/account/orders/${selectedOrder.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 