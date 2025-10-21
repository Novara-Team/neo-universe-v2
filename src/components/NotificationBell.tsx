import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading notifications:', error);
    } else {
      setNotifications(data || []);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'tool_update':
        return '🔄';
      case 'system':
        return '📢';
      case 'admin_message':
        return '👤';
      default:
        return '📬';
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowNotifications(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-30">
            <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
              {unreadCount > 0 && (
                <p className="text-slate-400 text-sm mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No notifications yet</p>
                  <p className="text-slate-500 text-sm mt-1">
                    You'll be notified about tool updates and important messages
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-all hover:bg-slate-700/50 ${
                        !notification.read ? 'bg-slate-700/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                                {notification.title}
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0"></span>
                                )}
                              </h4>
                              <p className="text-slate-300 text-sm mb-2 leading-relaxed">
                                {notification.message}
                              </p>
                              {notification.link && (
                                <Link
                                  to={notification.link}
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    setShowNotifications(false);
                                  }}
                                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium inline-flex items-center gap-1"
                                >
                                  View details →
                                </Link>
                              )}
                            </div>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                              aria-label="Delete notification"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-slate-500 text-xs">
                              {new Date(notification.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
