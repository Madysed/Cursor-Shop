'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { sendNotification } from '@/actions/notifications';

export default function TestNotification() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  
  if (!session?.user) {
    return null;
  }

  const sendTestNotification = async () => {
    try {
      setLoading(true);
      
      const result = await sendNotification({
        userId: session.user.id,
        title: 'Test Notification',
        message: 'This is a test notification to verify that notifications are working correctly.',
        type: 'SUCCESS'
      });
      
      if (result.success) {
        toast.success('Test notification sent!');
      } else {
        toast.error(`Failed to send notification: ${result.error}`);
      }
    } catch (error) {
      toast.error('Error sending notification');
      console.error('Error sending test notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={sendTestNotification}
      disabled={loading}
      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
    >
      {loading ? 'Sending...' : 'Test Notification'}
    </button>
  );
} 