'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Package, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getNotifications, markNotificationAsRead } from '@/actions/notifications';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  orderId?: string;
  createdAt: string;
}

export default function Notifications() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialFetch = useRef(false);

  // Fetch notifications when component mounts or session changes
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      
      // Set up polling to check for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchNotifications = async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      
      // Don't fetch notifications immediately on mount
      // This helps reduce server load during page initialization
      if (!initialFetch.current) {
        // Add a small delay for initial fetch to allow other components to load first
        await new Promise(resolve => setTimeout(resolve, 1500));
        initialFetch.current = true;
      }
      
      // Use the server action instead of direct fetch
      const { notifications: notificationsData, error } = await getNotifications();
      
      if (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      setNotifications(notificationsData);
      
      // Calculate unread count
      const unread = notificationsData.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't show errors to user, just handle gracefully
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Use the server action
      const { success, error } = await markNotificationAsRead(id);
      
      if (!success) {
        console.error('Failed to mark notification as read:', error);
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate if needed based on notification type
    if (notification.type === 'ORDER_UPDATE' && notification.orderId) {
      router.push(`/account/orders/${notification.orderId}`);
      setIsOpen(false);
    }
  };

  // Skip rendering if no session
  if (!session?.user) {
    return null;
  }

  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER_UPDATE':
      case 'ORDER_DELETED':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 rounded-full text-white hover:bg-blue-700/20 focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0f172a] rounded-md shadow-lg overflow-hidden z-20">
          <div className="p-3 border-b border-blue-800 flex justify-between items-center">
            <h3 className="font-medium text-white">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="py-4 px-3 text-center text-gray-400">
                <div className="animate-spin h-5 w-5 border-b-2 border-blue-600 rounded-full mx-auto mb-2"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 px-3 text-center text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`border-b border-blue-800 last:border-0 hover:bg-blue-900/40 transition-colors
                    ${notification.read ? 'opacity-70' : 'bg-blue-900/20'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="p-3 cursor-pointer">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-white">
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-400">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-2 border-t border-blue-800 text-center">
              <button
                onClick={() => router.push('/account/notifications')}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}