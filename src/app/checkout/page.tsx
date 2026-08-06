'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Receipt, MapPin, Zap, CreditCard, Smartphone, Wallet, Banknote,
  StickyNote, Loader2, PartyPopper,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { orderService } from '@/lib/firestoreService';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import {
  placeOrder,
  deductFromWallet,
  addNotification,
} from '@/lib/firebaseService';
import { NOTIFICATIONS } from '@/lib/pushNotification';
import { validateCoupon, getBestCouponSuggestion, CouponResult } from '@/lib/coupons';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'upi', icon: Smartphone, label: 'UPI', desc: 'GPay, PhonePe, Paytm' },
  { id: 'card', icon: CreditCard, label: 'Card', desc: 'Credit / Debit Card' },
  { id: 'wallet', icon: Wallet, label: 'Wallet', desc: 'NammaOoru Wallet' },
  { id: 'cod', icon: Banknote, label: 'Cash on Delivery', desc: 'Pay when delivered' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart, cartShopId, getCartTotal, clearCart,
    walletBalance, addresses, selectedAddressId, user,
    addDemoOrder,
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiId, setUpiId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const orderPlacedRef = useRef(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  // Get shop name from localStorage (saved when user visits shop detail page)
  const [shopName, setShopName] = useState('Shop');
  const [shopImage, setShopImage] = useState('/images/shops/shop-1.jpg');
  useEffect(() => {
    if (cartShopId) {
      const name = localStorage.getItem(`noe-shop-name-${cartShopId}`) || 'Shop';
      setShopName(name);
    }
  }, [cartShopId]);
  const shop = cart.length > 0 ? { name: shopName, images: { banner: shopImage } } : null;
  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryCharge - couponDiscount;

  // Smart coupon suggestion
  const suggestedCoupon = getBestCouponSuggestion(subtotal);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return; }
    const result = validateCoupon(couponCode, subtotal, { isFirstOrder: true, shopId: cartShopId || '' });
    setCouponResult(result);
    if (result.valid) {
      setCouponDiscount(result.discount);
      toast.success(result.message);
    } else {
      setCouponDiscount(0);
      toast.error(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponResult(null);
    setCouponDiscount(0);
  };
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  useEffect(() => {
    if (mounted && cart.length === 0 && !orderPlacedRef.current) router.push('/cart');
  }, [mounted, cart.length, router]);

  if (!mounted || (cart.length === 0 && !orderPlacedRef.current)) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="text-muted text-sm">Redirecting...</div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please add a delivery address');
      return;
    }
    if (paymentMethod === 'upi' && !upiId) {
      toast.error('Enter your UPI ID');
      return;
    }
    if (paymentMethod === 'wallet' && walletBalance < total) {
      toast.error(`Insufficient wallet balance. You have ₹${walletBalance}`);
      return;
    }
    if (!user) {
      toast.error('Please login to place an order');
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const shopIcon = '/images/shops/shop-1.jpg';
      const now = new Date().toISOString();

      // Resolve the actual Firestore doc ID for the vendor
      const vendorDocId = (typeof window !== 'undefined' && cartShopId)
        ? localStorage.getItem(`noe-vendor-docid-${cartShopId}`) || cartShopId
        : cartShopId || '';

      // Generate readable Order ID: NOE-SHOPNAME-001
      let orderId = 'NOE-' + Date.now().toString(36).toUpperCase().slice(-6);
      try {
        if (db && vendorDocId) {
          // Get shop short code (first 6 chars of shopName, uppercase, no spaces)
          const shopCode = shopName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) || 'SHOP';
          // Increment vendor's order counter atomically
          const vendorRef = doc(db, 'vendors', vendorDocId);
          await updateDoc(vendorRef, { orderCounter: increment(1) });
          const vendorSnap = await getDoc(vendorRef);
          const counter = vendorSnap.data()?.orderCounter || 1;
          orderId = `NOE-${shopCode}-${String(counter).padStart(3, '0')}`;
        }
      } catch (e) {
        console.warn('Order ID generation fallback:', e);
      }

      // 1. PRIMARY: Save to Firestore (this is what vendor sees!)
      const firestoreOrderId = await orderService.create({
        userId: user.uid,
        orderId, // Readable order ID: NOE-TEABOY-001
        shopId: vendorDocId,
        vendorId: vendorDocId, // vendor queries orders by their Firestore doc ID
        shopName: shopName,
        shopIcon,
        items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.discountPrice || i.price })),
        subtotal,
        deliveryCharge,
        totalAmount: total,
        total,
        status: 'new', // vendor expects 'new' status for incoming orders
        riderStatus: 'pending', // Will change to 'searching' when vendor marks ready
        paymentMethod,
        address: selectedAddress,
        deliveryAddress: selectedAddress?.fullAddress || '',
        notes: notes || '',
        customerName: user.displayName || 'Customer',
        customerPhone: user.phone || '9876543210',
        createdAt: now,
        updatedAt: now,
      } as any);

      // 2. Also save via firebaseService for notifications (non-blocking)
      placeOrder({
        userId: user.uid,
        shopId: cartShopId || '',
        shopName: shopName,
        shopIcon,
        items: cart,
        subtotal,
        deliveryCharge,
        total,
        status: 'placed',
        paymentMethod,
        address: selectedAddress,
        notes: notes || '',
      }).catch(() => {});

      // 3. If wallet payment, deduct
      if (paymentMethod === 'wallet') {
        useStore.getState().setWalletBalance(walletBalance - total);
        deductFromWallet(user.uid, total, `Order ${orderId} Payment`, orderId).catch(() => {});
      }

      // 4. Clear cart
      orderPlacedRef.current = true;
      clearCart();

      // 5. Send push notification (non-blocking)
      NOTIFICATIONS.orderPlaced(orderId).catch(() => {});

      toast.success('🎉 Order placed successfully!');
      router.push('/orders?new=1');
    } catch (err: any) {
      console.error('Place order error:', err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen app-bg pb-36 md:pb-8">
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/cart" className="btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-bold text-body">Checkout</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-4">

        {/* Order Summary */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-body mb-3 flex items-center gap-2"><Receipt size={15} className="text-accent" /> Order Summary</h3>
          {shop && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-subtle">
              <div className="w-8 h-8 rounded-lg overflow-hidden relative flex-shrink-0">
                <Image src={shop.images.banner || '/images/categories/groceries.jpg'} alt={shop.name} fill sizes="32px" className="object-cover" />
              </div>
              <span className="text-sm font-bold text-body">{shop.name}</span>
            </div>
          )}
          <div className="space-y-2 mb-3">
            {cart.map(item => (
              <div key={item.productId} className="flex items-center justify-between">
                <span className="text-sm text-secondary">{item.name} × {item.quantity}</span>
                <span className="text-sm font-semibold text-body">₹{(item.discountPrice || item.price) * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="divider mb-3" />
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-body">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Delivery</span>
              <span className={deliveryCharge === 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-body'}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            {deliveryCharge > 0 && (
              <p className="text-[10px] text-faint">Add ₹{500 - subtotal} more for free delivery</p>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">🏷️ Coupon ({couponCode})</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">-₹{couponDiscount}</span>
              </div>
            )}
            <div className="divider my-1" />
            <div className="flex justify-between">
              <span className="font-black text-body">Total</span>
              <div className="text-right">
                {couponDiscount > 0 && (
                  <span className="text-xs text-faint line-through mr-2">₹{subtotal + deliveryCharge}</span>
                )}
                <span className="font-black text-accent text-lg">₹{total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-body flex items-center gap-2"><MapPin size={15} className="text-accent" /> Delivery Address</h3>
            <Link href="/profile" className="text-xs text-accent font-semibold">Change</Link>
          </div>
          {selectedAddress ? (
            <div className="p-3 bg-orange-500/6 border border-orange-500/20 rounded-xl">
              <p className="text-xs font-bold text-accent">{selectedAddress.label}</p>
              <p className="text-sm text-body mt-0.5">{selectedAddress.fullAddress}</p>
              <p className="text-xs text-faint mt-0.5">{selectedAddress.city} - {selectedAddress.pincode}</p>
            </div>
          ) : (
            <Link href="/profile" className="block p-3 border border-dashed border-subtle rounded-xl text-center text-sm text-muted hover:border-orange-400/40 hover:text-accent transition-colors">
              + Add Delivery Address
            </Link>
          )}
        </div>

        {/* Delivery Time */}
        <div className="glass-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-sm font-bold text-body">Estimated Delivery</p>
            <p className="text-xs text-faint">35–45 minutes</p>
          </div>
          <div className="ml-auto badge badge-success">On Time</div>
        </div>

        {/* Payment Method */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-body mb-3 flex items-center gap-2"><CreditCard size={15} className="text-accent" /> Payment Method</h3>
          <div className="space-y-2">
            {PAYMENT_METHODS.map(pm => (
              <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${paymentMethod === pm.id ? 'bg-orange-500/8 border-orange-500/30' : 'surface hover:bg-[var(--card-hover)]'}`}>
                <pm.icon size={20} className="text-accent flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-body">{pm.label}</p>
                  <p className="text-xs text-faint">
                    {pm.id === 'wallet'
                      ? `Balance: ₹${walletBalance}${walletBalance < total ? ' (Insufficient)' : ''}`
                      : pm.desc}
                  </p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === pm.id ? 'border-orange-500' : 'border-[var(--card-border)]'}`}>
                  {paymentMethod === pm.id && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                </div>
              </button>
            ))}
          </div>
          {paymentMethod === 'upi' && (
            <div className="mt-3">
              <input value={upiId} onChange={e => setUpiId(e.target.value)}
                placeholder="Enter UPI ID (e.g. name@upi)" className="input-glass text-sm" />
            </div>
          )}
        </div>

        {/* 🏷️ COUPON / PROMO CODE */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-body mb-3 flex items-center gap-2">
            <span className="text-base">🏷️</span> Apply Coupon
          </h3>

          {/* Coupon Input */}
          {!couponResult?.valid ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="input-glass text-sm flex-1 uppercase tracking-wider font-bold"
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  Apply
                </button>
              </div>

              {/* Error message */}
              {couponResult && !couponResult.valid && (
                <p className="text-xs text-red-500 dark:text-red-400 font-medium">{couponResult.message}</p>
              )}

              {/* Smart suggestion */}
              {suggestedCoupon && !couponResult?.valid && (
                <button
                  onClick={() => { setCouponCode(suggestedCoupon.code); }}
                  className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-left"
                >
                  <span className="text-sm">💡</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Try: {suggestedCoupon.code}
                    </p>
                    <p className="text-[10px] text-muted truncate">{suggestedCoupon.description}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    {suggestedCoupon.type === 'percentage' ? `${suggestedCoupon.value}% OFF` : `₹${suggestedCoupon.value} OFF`}
                  </span>
                </button>
              )}

              {/* Browse coupons link */}
              <Link href="/offers" className="text-[11px] text-accent font-bold flex items-center gap-1 hover:underline">
                View all coupons →
              </Link>
            </div>
          ) : (
            /* Applied coupon display */
            <div className="rounded-xl p-3 bg-emerald-500/8 border border-emerald-500/25">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎉</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{couponResult.message}</p>
                  <p className="text-[10px] text-muted mt-0.5">Code: {couponCode}</p>
                </div>
                <button onClick={handleRemoveCoupon} className="text-xs font-bold text-red-500 dark:text-red-400 hover:underline">
                  Remove
                </button>
              </div>
              {couponDiscount > 0 && (
                <div className="mt-2 pt-2 border-t border-emerald-500/15 flex justify-between">
                  <span className="text-xs text-muted">You save</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">-₹{couponDiscount}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Special Instructions */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-body mb-3 flex items-center gap-2"><StickyNote size={15} className="text-accent" /> Special Instructions</h3>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Any special requests for the shop or delivery partner..."
            className="input-glass text-sm resize-none" rows={3} />
        </div>

      </div>

      {/* Place Order Button */}
      <div className="sticky-bottom">
        <div className="max-w-5xl mx-auto">
          <button onClick={handlePlaceOrder} disabled={loading}
            className="btn-primary w-full py-4 text-base justify-between disabled:opacity-60">
            <span className="flex items-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <PartyPopper size={16} />}
              {loading ? 'Placing Order...' : 'Place Order'}
            </span>
            <span className="font-black">₹{total}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
