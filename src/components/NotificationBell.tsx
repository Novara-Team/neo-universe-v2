import { useState, useEffect } from 'react';
import { Bell, X, Check, RefreshCw, MessageSquare, AlertCircle, CheckCircle, Info, Sparkles, Trash2 } from 'lucide-react';
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
        return { icon: RefreshCw, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
      case 'system':
        return { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
      case 'admin_message':
        return { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
      case 'success':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
      default:
        return { icon: Bell, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all group"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-5.5 px-1.5 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
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
          <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-30">
            <div className="p-5 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-900/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-slate-400 text-xs">
                        {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg border border-cyan-500/20 font-semibold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-10 h-10 text-slate-500" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">No notifications yet</h4>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                    You'll be notified about tool updates, submissions, and important messages
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {notifications.map((notification) => {
                    const iconConfig = getNotificationIcon(notification.type);
                    const IconComponent = iconConfig.icon;

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 transition-all hover:bg-slate-700/40 ${
                          !notification.read ? 'bg-slate-700/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 ${iconConfig.bg} ${iconConfig.border} border rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className={`w-5 h-5 ${iconConfig.color}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-white font-semibold flex items-center gap-2 flex-1">
                                <span className="line-clamp-1">{notification.title}</span>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 animate-pulse shadow-lg shadow-cyan-500/50"></span>
                                )}
                              </h4>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 p-1 hover:bg-red-500/10 rounded-lg"
                                aria-label="Delete notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <p className="text-slate-300 text-sm mb-3 leading-relaxed line-clamp-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between gap-3">
                              <p className="text-slate-500 text-xs font-medium">
                                {getTimeAgo(notification.created_at)}
                              </p>

                              <div className="flex items-center gap-2">
                                {notification.link && (
                                  <Link
                                    to={notification.link}
                                    onClick={() => {
                                      markAsRead(notification.id);
                                      setShowNotifications(false);
                                    }}
                                    className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition-colors hover:underline"
                                  >
                                    View details
                                  </Link>
                                )}
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 px-2 py-1 hover:bg-cyan-500/10 rounded-lg"
                                  >
                                    <Check className="w-3 h-3" />
                                    Read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-700 bg-slate-900/50 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
