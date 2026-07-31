'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/firebaseService';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { notifications, setNotifications, user } = useStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (notifId: string) => {
    if (!user) return;
    try {
      await markNotificationRead(user.uid, notifId!);
      setNotifications(notifications.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch {
      // silent fail — UI already updated optimistically
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsRead(user.uid);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 172800) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <main className="min-h-screen app-bg pb-24 md:pb-8">
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-bold text-body flex-1">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded-full">{unreadCount}</span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-xs text-accent font-semibold hover:opacity-80 transition-opacity">
              Mark all read
            </button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4">
        {!user ? (
          <div className="text-center py-20">
            <Lock size={44} className="text-faint mx-auto mb-4" />
            <h3 className="text-lg font-bold text-muted">Login to see notifications</h3>
            <Link href="/auth/login" className="btn-primary mt-5 inline-flex">Login →</Link>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={44} className="text-faint mx-auto mb-4" />
            <h3 className="text-lg font-bold text-muted">No notifications yet</h3>
            <p className="text-sm text-faint mt-1">We&apos;ll notify you about orders, offers &amp; more</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <button key={n.id} onClick={() => !n.read && handleMarkRead(n.id!)}
                className={`w-full text-left glass-card p-4 flex items-start gap-3 transition-all hover:border-orange-400/25 ${!n.read ? 'border-orange-400/25' : ''}`}
                style={{ background: !n.read ? 'rgba(249,115,22,0.04)' : 'var(--card-bg)' }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${!n.read ? 'bg-orange-500/12' : 'surface'}`}>
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold ${!n.read ? 'text-body' : 'text-secondary'}`}>{n.title}</p>
                    <span className="text-[10px] text-faint flex-shrink-0">{formatTime(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-faint mt-0.5 leading-relaxed">{n.body}</p>
                  {n.orderId && (
                    <Link href="/orders" onClick={e => e.stopPropagation()}
                      className="text-[10px] text-accent font-bold mt-1 inline-block hover:opacity-80">
                      View Order →
                    </Link>
                  )}
                </div>
                {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
