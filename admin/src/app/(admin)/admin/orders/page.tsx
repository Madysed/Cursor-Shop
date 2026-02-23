'use client';

import { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { Trash2, RefreshCw, Search, Package, Filter, Eye, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface OrderWithDetails extends Order {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
    };
  }>;
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
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      
      // Log received data for debugging
      console.log('Orders retrieved:', data);
      
      if (Array.isArray(data)) {
        // Process orders to ensure they have the required structure
        const processedOrders = data.map((order: any) => {
          // Make sure items is always an array
          const items = Array.isArray(order.items) ? order.items : [];
          
          // Ensure each item has product information
          const processedItems = items.map((item: any) => {
            if (!item.product) {
              console.warn(`Item ${item.id} has no product information`);
              return {
                ...item,
                product: {
                  id: 'unknown',
                  name: 'Unknown Product',
                }
              };
            }
            return item;
          });
          
          return {
            ...order,
            items: processedItems,
            user: order.user || { id: 'unknown', name: null, email: null }
          };
        });
        
        setOrders(processedOrders);
      } else {
        console.error('Received non-array response:', data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }
    
    setDeleting(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } finally {
      setDeleting(null);
    }
  };

  const openOrderDetails = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const filteredOrders = orders
    .filter(order => {
      // Apply status filter
      if (statusFilter && order.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.id.toLowerCase().includes(searchLower) ||
          (order.user.name?.toLowerCase() || '').includes(searchLower) ||
          (order.user.email?.toLowerCase() || '').includes(searchLower) ||
          order.items.some(item => 
            item.product.name.toLowerCase().includes(searchLower)
          )
        );
      }
      
      return true;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              console.log('Manual debug - checking database connection');
              fetch('/api/debug', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                  console.log('Debug response:', data);
                  toast.success('Debug check completed, see console');
                })
                .catch(error => {
                  console.error('Debug error:', error);
                  toast.error('Debug check failed');
                });
            }}
            className="flex items-center space-x-1 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
          >
            <span>Debug</span>
          </button>
          <button 
            onClick={fetchOrders} 
            className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by order ID, customer name, or product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-[#0f172a] text-white rounded-md">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-xl font-medium mb-2">No orders found</p>
          <p className="text-gray-400">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search or filter criteria'
              : 'Orders will appear here once customers make purchases'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-[#0f172a] text-white">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.user.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{order.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-0.5">
                          {item.quantity}x {item.product.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                    <div className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        disabled={updating === order.id || deleting === order.id}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        {Object.values(OrderStatus).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      
                      <button 
                        onClick={() => openOrderDetails(order.id)}
                        className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      
                      <button
                        onClick={() => deleteOrder(order.id)}
                        disabled={updating === order.id || deleting === order.id}
                        className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100 transition-colors"
                        title="Delete Order"
                      >
                        {deleting === order.id ? (
                          <RefreshCw size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Order Details Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-[#0f172a] px-4 py-3 flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">
                  Order Details #{selectedOrder.id.slice(0, 8)}
                </h3>
                <button onClick={closeModal} className="text-white hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>
              
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><span className="font-medium">Name:</span> {selectedOrder.user.name || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.user.email}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Order Status</h4>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Last updated: {new Date(selectedOrder.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p>{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="bg-gray-50 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.product.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              ${(item.quantity * item.price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <th scope="row" colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            Total
                          </th>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-600 text-right">
                            ${selectedOrder.total.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus);
                    setSelectedOrder({...selectedOrder, status: e.target.value as OrderStatus});
                  }}
                  className="mt-3 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  {Object.values(OrderStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 