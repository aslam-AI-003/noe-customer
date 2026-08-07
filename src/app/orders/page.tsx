'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft, X, PartyPopper, Lock, Package, ClipboardList, CheckCircle2,
  ChefHat, Bike, XCircle, Star,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { rateOrder, cancelOrder, addNotification } from '@/lib/firebaseService';
import { orderService } from '@/lib/firestoreService';
import type { Order } from '@/lib/firebaseService';
import toast from 'react-hot-toast';

// Helper: ensure image src is a valid URL/path (not emoji or garbage)
function safeImageSrc(src?: string): string {
  if (src && (src.startsWith('/') || src.startsWith('http'))) return src;
  return '/images/categories/groceries.jpg';
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  new:        { label: 'Order Placed',   color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: ClipboardList },
  placed:     { label: 'Order Placed',   color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: ClipboardList },
  accepted:   { label: 'Confirmed',      color: 'text-purple-600 dark:text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: CheckCircle2 },
  confirmed:  { label: 'Confirmed',      color: 'text-purple-600 dark:text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: CheckCircle2 },
  preparing:  { label: 'Preparing',      color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: ChefHat },
  ready:      { label: 'Ready for Pickup', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Package },
  picked_up:  { label: 'Picked Up',     color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: Bike },
  on_the_way: { label: 'On the Way',     color: 'text-orange-600 dark:text-[#0E9F6E]',  bg: 'bg-[#0E9F6E]/10',  border: 'border-[#0E9F6E]/20',  icon: Bike },
  in_transit: { label: 'On the Way',     color: 'text-orange-600 dark:text-[#0E9F6E]',  bg: 'bg-[#0E9F6E]/10',  border: 'border-[#0E9F6E]/20',  icon: Bike },
  delivered:  { label: 'Delivered',      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: PartyPopper },
  cancelled:  { label: 'Cancelled',      color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: XCircle },
};

const TABS = ['All', 'Active', 'Delivered', 'Cancelled'];
const STEPS = ['new', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered'];
const STEP_ICONS = [ClipboardList, CheckCircle2, ChefHat, Package, Bike, PartyPopper];

function SuccessBanner({ onClose }: { onClose: () => void }) {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (searchParams.get('new')) {
      setShow(true);
      const t = setTimeout(() => { setShow(false); onClose(); }, 4000);
      return () => clearTimeout(t);
    }
  }, [searchParams, onClose]);
  if (!show) return null;
  return (
    <div className="fixed top-4 left-4 right-4 z-[100]" style={{ animation: 'slideUp 0.4s ease' }}>
      <div className="max-w-md mx-auto p-4 rounded-2xl border backdrop-blur-xl flex items-center gap-3 bg-emerald-500/12 border-emerald-500/30 shadow-lg">
        <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <PartyPopper size={20} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div><p className="font-black text-emerald-600 dark:text-emerald-400">Order Placed!</p><p className="text-xs text-secondary">Your order is being prepared</p></div>
        <button onClick={() => { setShow(false); onClose(); }} className="ml-auto text-faint hover:text-secondary"><X size={18} /></button>
      </div>
    </div>
  );
}

function RatingModal({ order, onClose, onSubmit }: { order: Order; onClose: () => void; onSubmit: (rating: number, review: string) => void }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const QUICK_TAGS = ['Fast Delivery', 'Fresh Items', 'Good Packaging', 'Friendly Rider', 'Value for Money', 'Will Order Again'];
  const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full mx-auto mb-4 bg-[var(--card-border)]" />
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-xl overflow-hidden relative mx-auto mb-2">
            <Image src={safeImageSrc(order.shopIcon)} alt={order.shopName} fill sizes="64px" className="object-cover" />
          </div>
          <h2 className="font-black text-body text-lg">Rate Your Order</h2>
          <p className="text-xs mt-0.5 text-faint">{order.shopName} • {order.id?.slice(-8).toUpperCase()}</p>
        </div>
        <div className="flex justify-center gap-3 mb-4">
          {[1,2,3,4,5].map(star => (
            <button key={star}
              onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="transition-all duration-150"
              style={{ transform: (hovered || rating) >= star ? 'scale(1.15)' : 'scale(1)' }}>
              <Star size={32} fill={(hovered || rating) >= star ? '#F97316' : 'none'} stroke={(hovered || rating) >= star ? '#F97316' : 'var(--card-border)'} />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-sm font-bold mb-4 text-accent">
            {RATING_LABELS[rating]}
          </p>
        )}
        {rating >= 4 && (
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {QUICK_TAGS.map(tag => (
              <button key={tag} onClick={() => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${tags.includes(tag) ? 'bg-[#0E9F6E]/15 border-[#0E9F6E]/40 text-accent' : 'surface text-muted'}`}>
                {tag}
              </button>
            ))}
          </div>
        )}
        <textarea value={review} onChange={e => setReview(e.target.value)}
          placeholder="Share your experience (optional)..."
          className="input-glass text-sm resize-none mb-4 w-full" rows={3} />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 py-3">Skip</button>
          <button onClick={() => { if (rating === 0) { toast.error('Please select a rating'); return; } onSubmit(rating, review); }}
            className="btn-primary flex-1 py-3">Submit Review</button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { orders, user, demoOrders, updateDemoOrderStatus } = useStore();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [firestoreOrders, setFirestoreOrders] = useState<Order[]>([]);

  useEffect(() => { setMounted(true); }, []);

  // Real-time Firestore order listener
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = orderService.onAll((liveOrders) => {
      // Filter orders for this user
      const myOrders: Order[] = liveOrders
        .filter((o: any) => o.userId === user.uid)
        .map((d: any) => ({
          id: d.id,
          userId: d.userId,
          shopId: d.shopId,
          shopName: d.shopName,
          shopIcon: d.shopIcon || '/images/shops/shop-1.jpg',
          items: d.items || [],
          subtotal: d.subtotal || 0,
          deliveryCharge: d.deliveryCharge || 0,
          total: d.total || 0,
          status: (d.status === 'picked_up' || d.status === 'on_the_way' ? 'in_transit' : d.status) as Order['status'],
          paymentMethod: d.paymentMethod || 'cod',
          address: d.address || {},
          notes: d.notes || '',
          riderId: d.riderId,
          riderName: d.riderName,
          rating: d.rating,
          review: d.review,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        }));
      setFirestoreOrders(myOrders);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Use Firestore orders as primary source
  const allOrders: Order[] = firestoreOrders;

  const filtered = allOrders.filter(o => {
    if (activeTab === 'Active') return ['new', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way', 'placed', 'confirmed', 'in_transit'].includes(o.status);
    if (activeTab === 'Delivered') return o.status === 'delivered';
    if (activeTab === 'Cancelled') return o.status === 'cancelled';
    return true;
  });

  const isDemoOrder = (orderId: string) => demoOrders.some(d => d.id === orderId);

  const { addShopReview } = useStore();

  const handleRatingSubmit = async (order: Order, rating: number, review: string) => {
    try {
      const demoOrder = demoOrders.find(d => d.id === order.id);
      if (demoOrder) {
        updateDemoOrderStatus(demoOrder.id, demoOrder.status, { rating, review });
      } else {
        await rateOrder(order.id!, rating, review);
      }

      // Save review to store (appears on shop detail page)
      addShopReview({
        id: 'rev-' + Date.now().toString(36),
        shopId: order.shopId || (demoOrder?.shopId ?? ''),
        orderId: order.id || demoOrder?.id || '',
        customerName: user?.displayName || 'Customer',
        rating,
        review,
        createdAt: new Date().toISOString(),
      });

      setRatingOrder(null);
      toast.success(`Thanks for your ${rating}-star review!`);
    } catch {
      toast.error('Failed to submit review');
    }
  };

  const handleCancel = async (order: Order) => {
    if (!user) return;
    setCancelling(order.id!);
    try {
      if (isDemoOrder(order.id!)) {
        updateDemoOrderStatus(order.id!, 'cancelled');
      } else {
        await cancelOrder(order.id!);
      }
      await addNotification(user.uid, {
        type: 'order',
        icon: '❌',
        title: 'Order Cancelled',
        body: `Your order from ${order.shopName} has been cancelled.`,
        read: false,
        orderId: order.id,
      }).catch(() => {});
      toast.success('Order cancelled');
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' +
      date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="min-h-screen app-bg pb-24 md:pb-8">
      <Suspense fallback={null}>
        <SuccessBanner onClose={() => {}} />
      </Suspense>

      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-bold text-body flex-1">My Orders</h1>
          <Link href="/track" className="text-xs text-accent font-semibold">Track →</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-4 surface">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-[#0E9F6E] text-white' : 'text-muted hover:text-secondary'}`}>
              {tab}
            </button>
          ))}
        </div>

        {!user ? (
          <div className="text-center py-20">
            <Lock size={44} className="text-faint mx-auto mb-4" />
            <h3 className="text-lg font-bold text-muted">Login to see your orders</h3>
            <Link href="/auth/login" className="btn-primary mt-5 inline-flex">Login →</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package size={44} className="text-faint mx-auto mb-4" />
            <h3 className="text-lg font-bold text-muted">No orders yet</h3>
            <p className="text-sm text-faint mt-1">Start ordering from nearby shops</p>
            <Link href="/shops" className="btn-primary mt-5 inline-flex">Browse Shops →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
              const currentIdx = STEPS.indexOf(order.status);
              const isActive = STEPS.slice(0, 4).includes(order.status);

              return (
                <div key={order.id} className="glass-card p-4 cursor-pointer hover:border-[#0E9F6E]-400/25 transition-all"
                  onClick={() => setSelectedOrder(order)}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden relative flex-shrink-0">
                        <Image src={safeImageSrc(order.shopIcon)} alt={order.shopName} fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-black text-faint">#{order.id?.slice(-8).toUpperCase()}</span>
                          <span className="text-faint">•</span>
                          <span className="text-xs text-faint">{formatDate(order.createdAt)}</span>
                        </div>
                        <h3 className="font-bold text-body">{order.shopName}</h3>
                        <p className="text-xs truncate mt-0.5 text-faint">
                          {order.items.map(i => i.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className={`badge ${cfg.bg} ${cfg.color} ${cfg.border} flex-shrink-0 text-[10px]`}>
                      <cfg.icon size={11} /> {cfg.label}
                    </div>
                  </div>

                  {/* Progress for active orders */}
                  {isActive && (
                    <div className="mb-3">
                      <div className="flex justify-between mb-1.5">
                        {STEPS.map((s, i) => {
                          const StepIcon = STEP_ICONS[i];
                          return (
                            <div key={s} className={`flex flex-col items-center gap-1 ${i <= currentIdx ? 'opacity-100' : 'opacity-25'}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i <= currentIdx ? 'bg-[#0E9F6E] text-white' : 'bg-[var(--bg3)] text-faint'}`}>
                                <StepIcon size={12} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="h-1 rounded-full overflow-hidden bg-[var(--bg3)]">
                        <div className="h-full rounded-full bg-[#0E9F6E] transition-all" style={{ width: `${(currentIdx + 1) * 20}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Rating stars if delivered */}
                  {order.status === 'delivered' && order.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={13} fill={s <= (order.rating || 0) ? '#F97316' : 'none'} stroke={s <= (order.rating || 0) ? '#F97316' : 'var(--card-border)'} />
                      ))}
                      <span className="text-xs ml-1 text-faint">Your rating</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-body">₹{order.total}</span>
                      <span className="text-xs text-faint">{order.paymentMethod}</span>
                    </div>
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      {order.status === 'delivered' && !order.rating && (
                        <button onClick={() => setRatingOrder(order)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-[#0E9F6E]/10 border border-[#0E9F6E]/25 text-accent flex items-center gap-1">
                          <Star size={11} /> Rate
                        </button>
                      )}
                      {order.status === 'in_transit' && (
                        <Link href="/track" className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-[#0E9F6E]/10 border border-[#0E9F6E]/25 text-accent flex items-center gap-1">
                          <Bike size={11} /> Track
                        </Link>
                      )}
                      {['placed', 'confirmed', 'preparing'].includes(order.status) && (
                        <button
                          disabled={cancelling === order.id}
                          onClick={() => handleCancel(order)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 bg-red-500/10 border border-red-500/25 text-red-500 dark:text-red-400">
                          {cancelling === order.id ? '...' : 'Cancel'}
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <Link href="/shops" className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors surface text-secondary">
                          Reorder
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-4 bg-[var(--card-border)]" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-body">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="btn-icon w-8 h-8">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Order ID', value: '#' + selectedOrder.id?.slice(-8).toUpperCase() },
                { label: 'Shop', value: selectedOrder.shopName },
                { label: 'Date & Time', value: formatDate(selectedOrder.createdAt) },
                { label: 'Payment', value: selectedOrder.paymentMethod },
                { label: 'Address', value: selectedOrder.address?.fullAddress || '' },
              ].map(row => (
                <div key={row.label} className="flex justify-between gap-4">
                  <span className="text-sm flex-shrink-0 text-faint">{row.label}</span>
                  <span className="text-sm font-bold text-body text-right">{row.value}</span>
                </div>
              ))}
              <div className="divider" />
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-sm text-secondary">{item.name} × {item.quantity}</span>
                  <span className="text-sm font-semibold text-body">₹{(item.discountPrice || item.price) * item.quantity}</span>
                </div>
              ))}
              <div className="divider" />
              <div className="flex justify-between text-sm">
                <span className="text-faint">Delivery</span>
                <span className={selectedOrder.deliveryCharge === 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-body'}>
                  {selectedOrder.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-black text-body">Total</span>
                <span className="font-black text-accent">₹{selectedOrder.total}</span>
              </div>
              {selectedOrder.status === 'delivered' && !selectedOrder.rating && (
                <button onClick={() => { setSelectedOrder(null); setRatingOrder(selectedOrder); }}
                  className="btn-primary w-full mt-2">Rate this order</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingOrder && (
        <RatingModal
          order={ratingOrder}
          onClose={() => setRatingOrder(null)}
          onSubmit={(rating, review) => handleRatingSubmit(ratingOrder, rating, review)}
        />
      )}
    </main>
  );
}
