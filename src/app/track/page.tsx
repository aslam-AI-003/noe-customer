'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import { orderService } from '@/lib/firestoreService';
import {
  ArrowLeft, Phone, MapPin, Clock, Package, Bike, Store,
  CheckCircle2, Navigation, Share2, MessageSquare,
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIVE ORDER TRACKING — Map + Real-time status
// Customer sees: Shop → Rider (moving) → Their location
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Dynamic import for map (client-only, no SSR)
const LiveMap = dynamic(() => import('@/components/ui/LiveMap'), { ssr: false });

const STATUS_STEPS = [
  { key: 'new', label: 'Order Placed', icon: Package, color: 'text-blue-500' },
  { key: 'accepted', label: 'Confirmed', icon: CheckCircle2, color: 'text-purple-500' },
  { key: 'preparing', label: 'Preparing', icon: Store, color: 'text-[#0E9F6E]' },
  { key: 'ready', label: 'Ready', icon: Package, color: 'text-[#0E9F6E]' },
  { key: 'picked_up', label: 'Picked Up', icon: Bike, color: 'text-indigo-500' },
  { key: 'on_the_way', label: 'On the Way', icon: Navigation, color: 'text-cyan-500' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-500' },
];

export default function TrackOrderPage() {
  const { user } = useStore();
  const [mounted, setMounted] = useState(false);
  const [riderLat, setRiderLat] = useState(0);
  const [riderLng, setRiderLng] = useState(0);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Real-time listener for active orders from Firestore
  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const unsubscribe = orderService.onAll((liveOrders) => {
      const myActiveOrders = liveOrders.filter((o: any) =>
        o.userId === user.uid && !['delivered', 'cancelled'].includes(o.status)
      );
      setTrackingOrder(myActiveOrders[0] || null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  if (!mounted || loading) return <div className="min-h-screen app-bg animate-pulse" />;

  if (!trackingOrder) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center px-4">
        <div className="text-center">
          <Package size={48} className="text-faint mx-auto mb-4" />
          <h2 className="text-lg font-bold text-body">No Active Orders</h2>
          <p className="text-sm text-muted mt-1">Place an order to track it here</p>
          <Link href="/shops" className="btn-primary mt-4 inline-block px-6 py-2.5">
            Order Now
          </Link>
        </div>
      </div>
    );
  }

  // Map coordinates (simulated for demo — Thanjavur area)
  const shopLat = 10.787;
  const shopLng = 79.138;
  const customerLat = trackingOrder.address?.lat || 10.792;
  const customerLng = trackingOrder.address?.lng || 79.145;

  // Simulate rider position between shop and customer based on status
  const getRiderPosition = () => {
    switch (trackingOrder.status) {
      case 'ready':
        return { lat: shopLat + 0.001, lng: shopLng + 0.001 }; // Near shop
      case 'picked_up':
        return { lat: (shopLat + customerLat) / 2 - 0.002, lng: (shopLng + customerLng) / 2 }; // Midway
      case 'on_the_way':
        return { lat: customerLat - 0.003, lng: customerLng - 0.002 }; // Near customer
      default:
        return { lat: shopLat, lng: shopLng }; // At shop
    }
  };

  const riderPos = getRiderPosition();
  const showRider = ['ready', 'picked_up', 'on_the_way'].includes(trackingOrder.status);

  // Map pins
  const mapPins = [
    { lat: shopLat, lng: shopLng, label: trackingOrder.shopName, type: 'shop' as const, popup: `🏪 ${trackingOrder.shopName}` },
    { lat: customerLat, lng: customerLng, label: 'Your Location', type: 'customer' as const, popup: '📍 Delivery Here' },
    ...(showRider ? [{
      lat: riderPos.lat, lng: riderPos.lng,
      label: trackingOrder.riderName || 'Rider',
      type: 'rider' as const,
      popup: `🛵 ${trackingOrder.riderName || 'Rider'}`
    }] : []),
  ];

  // Current step index
  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === trackingOrder.status);

  // Estimated time
  const getETA = () => {
    switch (trackingOrder.status) {
      case 'placed': return '25-30 min';
      case 'confirmed': return '20-25 min';
      case 'preparing': return '15-20 min';
      case 'ready': return '10-15 min';
      case 'picked_up': return '8-12 min';
      case 'on_the_way': return '3-5 min';
      case 'delivered': return 'Delivered!';
      default: return '~20 min';
    }
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="min-h-screen app-bg pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/orders" className="btn-icon">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-body">Track Order</h1>
            <p className="text-[10px] text-faint">#{trackingOrder.id}</p>
          </div>
          <button className="btn-icon">
            <Share2 size={14} />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ━━━ LIVE MAP ━━━ */}
        <div className="glass-card overflow-hidden p-0">
          <LiveMap
            pins={mapPins}
            className="h-56 sm:h-72 w-full"
            showRoute={showRider}
          />
        </div>

        {/* ETA Banner */}
        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Clock size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted">Estimated Delivery</p>
            <p className="text-xl font-black text-body">{getETA()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-faint">Ordered</p>
            <p className="text-xs font-bold text-secondary">{timeAgo(trackingOrder.createdAt)}</p>
          </div>
        </div>

        {/* Rider Info (if assigned) */}
        {trackingOrder.riderName && showRider && (
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-11 h-11 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Bike size={18} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-body">{trackingOrder.riderName}</p>
              <p className="text-[10px] text-faint">Your delivery partner</p>
            </div>
            <div className="flex gap-2">
              <a href={`tel:+91${trackingOrder.riderPhone || '9876543210'}`} className="w-9 h-9 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Phone size={14} className="text-emerald-600" />
              </a>
              <button className="w-9 h-9 bg-blue-500/10 rounded-full flex items-center justify-center">
                <MessageSquare size={14} className="text-blue-600" />
              </button>
            </div>
          </div>
        )}

        {/* ━━━ DELIVERY OTP (Show when rider is on the way) ━━━ */}
        {trackingOrder.deliveryOtp && ['picked_up', 'on_the_way'].includes(trackingOrder.status) && (
          <div className="glass-card p-5 border-2 border-[#0E9F6E]/30 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
            <div className="text-center">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">🔐 Delivery OTP</p>
              <div className="flex justify-center gap-2">
                {trackingOrder.deliveryOtp.split('').map((digit: string, i: number) => (
                  <div key={i} className="w-12 h-14 bg-[var(--card-bg)] border-2 border-[#0E9F6E]/40 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-black text-accent">{digit}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted mt-3">
                Share this OTP with the rider to confirm delivery
              </p>
            </div>
          </div>
        )}

        {/* Order Status Timeline */}
        <div className="glass-card p-4">
          <h3 className="text-xs font-bold text-faint uppercase mb-4">Order Progress</h3>
          <div className="space-y-0">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-3">
                  {/* Dot + Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isCurrent ? 'bg-purple-500 shadow-lg shadow-purple-500/30' :
                      isCompleted ? 'bg-emerald-500' : 'bg-[var(--bg3)]'
                    }`}>
                      <Icon size={12} className={isCompleted || isCurrent ? 'text-white' : 'text-faint'} />
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`w-0.5 h-6 ${isCompleted ? 'bg-emerald-500' : 'bg-[var(--bg3)]'}`} />
                    )}
                  </div>
                  {/* Label */}
                  <div className={`pt-1 ${isCurrent ? '' : 'opacity-60'}`}>
                    <p className={`text-xs font-bold ${isCurrent ? 'text-body' : 'text-muted'}`}>
                      {step.label}
                      {isCurrent && <span className="ml-2 text-purple-500 animate-pulse">●</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Store size={16} className="text-accent" />
            <div className="flex-1">
              <p className="text-xs font-bold text-body">{trackingOrder.shopName}</p>
              <p className="text-[10px] text-faint">{trackingOrder.items.length} items • ₹{trackingOrder.total}</p>
            </div>
            <span className="text-[10px] font-bold text-faint uppercase">{trackingOrder.paymentMethod}</span>
          </div>

          {/* Delivery address */}
          <div className="flex items-start gap-2 p-2.5 surface rounded-lg">
            <MapPin size={12} className="text-emerald-500 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-secondary">{trackingOrder.address?.label || 'Home'}</p>
              <p className="text-[10px] text-faint">{trackingOrder.address?.fullAddress || 'Thanjavur'}</p>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="text-center pt-2">
          <Link href="/support" className="text-xs text-muted hover:text-accent">
            Need help? Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
