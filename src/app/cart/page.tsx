'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ShoppingCart, Trash2, Sparkles, Ticket, MapPin, Receipt, Rocket,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SEED_SHOPS, SEED_COUPONS, SEED_PRODUCTS } from '@/lib/seed-data';
import toast from 'react-hot-toast';

const PRODUCT_IMAGE: Record<string, string> = Object.fromEntries(SEED_PRODUCTS.map(p => [p.id, p.image]));

export default function CartPage() {
  const router = useRouter();
  const { cart, cartShopId, updateQuantity, removeFromCart, clearCart, getCartTotal, addToCart, addresses, selectedAddressId } = useStore();
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<typeof SEED_COUPONS[0] | null>(null);
  const [couponError, setCouponError] = useState('');

  const shop = SEED_SHOPS.find(s => s.id === cartShopId);
  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.min(Math.round(subtotal * appliedCoupon.value / 100), appliedCoupon.maxDiscount)
      : appliedCoupon.value
    : 0;
  const total = subtotal + deliveryCharge - discount;

  // Upsell: products from same shop not already in cart
  const upsellProducts = SEED_PRODUCTS
    .filter(p => p.shopId === cartShopId && !cart.find(c => c.productId === p.id))
    .slice(0, 6);

  const applyCoupon = () => {
    const coupon = SEED_COUPONS.find(c => c.code === couponCode.toUpperCase() && c.isActive);
    if (!coupon) { setCouponError('Invalid coupon code'); return; }
    if (subtotal < coupon.minOrderAmount) { setCouponError(`Min. order ₹${coupon.minOrderAmount} required`); return; }
    setAppliedCoupon(coupon);
    setCouponError('');
    toast.success(`Coupon applied! You save ₹${coupon.type === 'percentage' ? Math.min(Math.round(subtotal * coupon.value / 100), coupon.maxDiscount) : coupon.value}`);
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen app-bg pb-24 md:pb-8">
        <header className="sticky top-0 z-50 header-glass">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="btn-icon"><ArrowLeft size={18} /></Link>
            <h1 className="font-bold text-body">My Cart</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-[#0E9F6E]/10 flex items-center justify-center mb-6 animate-float">
            <ShoppingCart size={36} className="text-accent" />
          </div>
          <h2 className="text-2xl font-black text-body">Your cart is empty</h2>
          <p className="text-muted mt-2 text-sm">Add items from nearby shops to get started</p>
          <Link href="/shops" className="btn-primary mt-6">Browse Shops →</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen app-bg pb-36 md:pb-8">
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={shop ? `/shops/${shop.id}` : '/shops'} className="btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-body">My Cart</h1>
            {shop && <p className="text-xs text-faint">{shop.name}</p>}
          </div>
          <button onClick={() => { clearCart(); toast.success('Cart cleared'); }}
            className="text-xs text-red-500 hover:text-red-400 font-semibold transition-colors">
            Clear All
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-4">
        {/* Shop info */}
        {shop && (
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden relative flex-shrink-0">
              <Image src={shop.images.banner || '/images/categories/groceries.jpg'} alt={shop.name} fill sizes="40px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-body truncate">{shop.name}</p>
              <p className="text-xs text-faint truncate">{shop.address.full}</p>
            </div>
            <Link href={`/shops/${shop.id}`} className="text-xs text-accent font-semibold hover:opacity-80 flex-shrink-0">
              Add More +
            </Link>
          </div>
        )}

        {/* Free delivery progress */}
        {subtotal < 500 && (
          <div className="glass-card p-3 bg-emerald-500/5 border-emerald-500/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Rocket size={13} /> Free delivery at ₹500</span>
              <span className="text-xs text-muted">₹{500 - subtotal} more</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-[var(--bg3)]">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(subtotal / 500) * 100}%`, background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-2">
          {cart.map(item => (
            <div key={item.productId} className="glass-card p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                {PRODUCT_IMAGE[item.productId] && (
                  <Image src={PRODUCT_IMAGE[item.productId]} alt={item.name} fill sizes="48px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-body truncate">{item.name}</h4>
                <p className="text-[11px] text-faint">{item.unit}</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-sm font-black text-body">₹{item.discountPrice || item.price}</span>
                  {item.discountPrice && item.discountPrice < item.price && (
                    <span className="text-[10px] text-faint line-through">₹{item.price}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => item.quantity === 1 ? removeFromCart(item.productId) : updateQuantity(item.productId, item.quantity - 1)}>−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                </div>
                <button onClick={() => removeFromCart(item.productId)} className="w-7 h-7 flex items-center justify-center text-faint hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── UPSELL: Add More Items ── */}
        {upsellProducts.length > 0 && (
          <div className="glass-card overflow-hidden p-0">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-body flex items-center gap-1.5"><Sparkles size={14} className="text-accent" /> Add More Items</h3>
              <Link href={`/shops/${cartShopId}`} className="text-xs text-accent font-semibold">View All →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar">
              {upsellProducts.map(product => {
                const inCart = cart.find(c => c.productId === product.id);
                return (
                  <div key={product.id} className="flex-shrink-0 w-36 glass-sm p-3">
                    <div className="w-full h-16 rounded-lg overflow-hidden relative mb-2">
                      <Image src={product.image} alt={product.name} fill sizes="140px" className="object-cover" />
                    </div>
                    <p className="text-xs font-bold text-body truncate mb-0.5">{product.name}</p>
                    <p className="text-[10px] text-faint mb-2">{product.unit}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-body">₹{product.discountPrice || product.price}</span>
                      {inCart ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => inCart.quantity === 1 ? removeFromCart(product.id) : updateQuantity(product.id, inCart.quantity - 1)} className="w-5 h-5 rounded-md bg-[#0E9F6E]/15 text-accent text-xs font-black flex items-center justify-center">−</button>
                          <span className="text-xs font-bold text-body w-4 text-center">{inCart.quantity}</span>
                          <button onClick={() => updateQuantity(product.id, inCart.quantity + 1)} className="w-5 h-5 rounded-md bg-[#0E9F6E]/15 text-accent text-xs font-black flex items-center justify-center">+</button>
                        </div>
                      ) : (
                        <button onClick={() => {
                          addToCart({ productId: product.id, shopId: product.shopId, name: product.name, nameTamil: product.nameTamil, price: product.price, discountPrice: product.discountPrice, quantity: 1, unit: product.unit, isVeg: product.isVeg });
                          toast.success(`${product.name} added!`);
                        }} className="w-6 h-6 rounded-md flex items-center justify-center text-sm font-black transition-all hover:scale-110 bg-[#0E9F6E]/15 text-accent border border-[#0E9F6E]/25">
                          +
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Coupon */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-body mb-3 flex items-center gap-2">
            <Ticket size={15} className="text-accent" /> Apply Coupon
          </h3>
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
              <div>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{appliedCoupon.code}</p>
                <p className="text-xs text-faint">{appliedCoupon.description}</p>
              </div>
              <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-xs text-red-500 hover:text-red-400 font-semibold">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                placeholder="Enter coupon code" className="input-glass flex-1 py-2.5 text-sm" />
              <button onClick={applyCoupon} className="btn-primary px-4 py-2.5 text-sm">Apply</button>
            </div>
          )}
          {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {SEED_COUPONS.filter(c => c.isActive).map(c => (
              <button key={c.id} onClick={() => { setCouponCode(c.code); setCouponError(''); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-[#0E9F6E]/8 border border-[#0E9F6E]/20 text-accent">
                {c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-body flex items-center gap-2"><MapPin size={15} className="text-accent" /> Delivery Address</h3>
            <Link href="/profile" className="text-xs text-accent font-semibold">Change</Link>
          </div>
          {selectedAddress ? (
            <div className="p-3 glass-sm">
              <p className="text-xs font-bold text-body">{selectedAddress.label}</p>
              <p className="text-xs text-faint mt-0.5">{selectedAddress.fullAddress} - {selectedAddress.pincode}</p>
            </div>
          ) : (
            <Link href="/profile" className="block p-3 border border-dashed border-subtle rounded-xl text-center text-xs text-muted hover:border-[#0E9F6E]-400/40 hover:text-accent transition-colors">
              + Add Delivery Address
            </Link>
          )}
        </div>

        {/* Bill Summary */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-body mb-4 flex items-center gap-2"><Receipt size={15} className="text-accent" /> Bill Summary</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Subtotal', value: `₹${subtotal}` },
              { label: `Delivery${subtotal >= 500 ? ' (Free!)' : ''}`, value: deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`, color: deliveryCharge === 0 ? 'text-emerald-600 dark:text-emerald-400' : '' },
              ...(discount > 0 ? [{ label: `Discount (${appliedCoupon?.code})`, value: `-₹${discount}`, color: 'text-emerald-600 dark:text-emerald-400' }] : []),
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm text-muted">{row.label}</span>
                <span className={`text-sm font-semibold ${row.color || 'text-body'}`}>{row.value}</span>
              </div>
            ))}
            <div className="divider" />
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-body">Total</span>
              <span className="text-base font-black text-accent">₹{total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Bar */}
      <div className="sticky-bottom">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => router.push('/checkout')} className="btn-primary w-full py-4 text-base justify-between">
            <span>Proceed to Checkout</span>
            <span className="font-black">₹{total} →</span>
          </button>
        </div>
      </div>
    </main>
  );
}
