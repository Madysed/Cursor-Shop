import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  orderId?: string;
  createdAt: string;
}

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
      
      // Calculate unread count
      const unreadNotifications = data.filter((notification: Notification) => !notification.read);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: notificationId,
          read: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Decrease unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);
      
      if (unreadIds.length === 0) return true;
      
      const promises = unreadIds.map(id => 
        fetch('/api/notifications', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            read: true,
          }),
        })
      );
      
      await Promise.all(promises);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
      return false;
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
    
    // Setup polling to check for new notifications
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
} 