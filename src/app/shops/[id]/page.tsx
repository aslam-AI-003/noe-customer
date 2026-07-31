'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Heart, ShoppingCart, Star, MessageCircle, Zap, MapPin,
  Phone, Clock, Bike, Wallet, Store, Utensils, Info,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SEED_SHOPS, SEED_PRODUCTS } from '@/lib/seed-data';
import toast from 'react-hot-toast';

// ━━━ REVIEWS SECTION (real reviews from store + sample fallback) ━━━
function ReviewsSection({ shopId, shopRating, shopTotalRatings }: { shopId: string; shopRating: number; shopTotalRatings: number }) {
  const { getShopReviews } = useStore();
  const storeReviews = getShopReviews(shopId);

  // Default reviews (shown when no real reviews yet)
  const defaultReviews = [
    { id: 'd1', customerName: 'Ravi Kumar', rating: 5, review: 'Excellent quality and fast delivery! Highly recommended.', createdAt: new Date(Date.now() - 2*86400000).toISOString() },
    { id: 'd2', customerName: 'Priya S', rating: 4, review: 'Good products, fresh and well-packed. Will order again.', createdAt: new Date(Date.now() - 7*86400000).toISOString() },
    { id: 'd3', customerName: 'Murugan T', rating: 5, review: 'Best shop in Thanjavur! Always on time.', createdAt: new Date(Date.now() - 14*86400000).toISOString() },
  ];

  const allReviews = storeReviews.length > 0 ? storeReviews : defaultReviews;
  const avgRating = storeReviews.length > 0
    ? (storeReviews.reduce((sum, r) => sum + r.rating, 0) / storeReviews.length).toFixed(1)
    : shopRating.toString();
  const totalCount = storeReviews.length > 0 ? storeReviews.length : shopTotalRatings || 3;

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-3">
      {/* Rating Summary */}
      <div className="glass-card p-5 text-center">
        <div className="text-5xl font-black text-body">{avgRating}</div>
        <div className="flex justify-center gap-1 mt-2">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={16} fill={s <= Math.round(Number(avgRating)) ? '#F97316' : 'none'} stroke={s <= Math.round(Number(avgRating)) ? '#F97316' : 'var(--card-border)'} />
          ))}
        </div>
        <p className="text-sm text-muted mt-1">Based on {totalCount} reviews</p>
      </div>

      {/* Individual Reviews */}
      {allReviews.map((r) => (
        <div key={r.id} className="glass-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/15 rounded-full flex items-center justify-center text-sm font-bold text-accent">
                {r.customerName[0]}
              </div>
              <span className="text-sm font-semibold text-body">{r.customerName}</span>
            </div>
            <span className="text-xs text-faint">{timeAgo(r.createdAt)}</span>
          </div>
          <div className="flex gap-0.5 mb-2">
            {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= r.rating ? '#F97316' : 'none'} stroke={s <= r.rating ? '#F97316' : 'var(--card-border)'} />)}
          </div>
          {r.review && <p className="text-xs text-muted leading-relaxed">{r.review}</p>}
          {'tags' in r && (r as any).tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {(r as any).tags.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/8 text-accent border border-orange-500/15">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      {storeReviews.length === 0 && (
        <p className="text-center text-xs text-faint py-2">Order from this shop and leave your review! ⭐</p>
      )}
    </div>
  );
}

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { cart, addToCart, updateQuantity, removeFromCart, favoriteShopIds, toggleFavorite, vendorRegistrations, vendorProducts } = useStore();
  const [activeTab, setActiveTab] = useState('menu');
  const [vegOnly, setVegOnly] = useState(false);

  // Try seed shops first, then look in approved vendor registrations
  const seedShop = SEED_SHOPS.find(s => s.id === id);
  const vendorReg = !seedShop ? vendorRegistrations.find(v => v.status === 'approved' && (v.shopId === id || v.id === id)) : null;

  // Build a unified shop object
  const shop = seedShop || (vendorReg ? {
    id: vendorReg.shopId || vendorReg.id,
    name: vendorReg.shopName,
    description: `${vendorReg.category} shop by ${vendorReg.ownerName}`,
    categoryId: vendorReg.category,
    images: { banner: '/images/shops/shop-1.jpg', logo: '/images/shops/shop-1.jpg' },
    rating: 4.5,
    totalRatings: 0,
    totalOrders: 0,
    avgPrepTime: 20,
    deliveryCharge: 25,
    freeDeliveryAbove: 299,
    minOrderAmount: 0,
    deliveryRadius: 5,
    isOpen: true,
    isFeatured: false,
    address: { full: vendorReg.address, city: vendorReg.city, pincode: vendorReg.pincode, lat: 11.02, lng: 76.97 },
    openTime: '08:00',
    closeTime: '22:00',
    tags: ['New'],
  } : null);

  // Get products: seed products OR vendor products
  const seedProducts = SEED_PRODUCTS.filter(p => p.shopId === id && (!vegOnly || p.isVeg));
  const vendorProds = vendorProducts
    .filter(p => p.shopId === id && p.isAvailable && (!vegOnly || p.isVeg))
    .map(p => ({
      id: p.id,
      shopId: p.shopId,
      name: p.name,
      nameTamil: p.nameTamil,
      price: p.price,
      discountPrice: p.discountPrice,
      unit: p.unit,
      category: p.category,
      isVeg: p.isVeg,
      isAvailable: p.isAvailable,
      image: p.image || '/images/products/meals-thali.jpg',
      description: p.description || '',
    }));
  const products = [...seedProducts, ...vendorProds];

  const cartItems = cart.filter(i => i.shopId === id);
  const cartTotal = cartItems.reduce((sum, i) => sum + (i.discountPrice || i.price) * i.quantity, 0);
  const isFav = favoriteShopIds.includes(id);

  if (!shop) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="text-center">
          <Store size={44} className="text-faint mx-auto mb-4" />
          <h2 className="text-xl font-bold text-body">Shop not found</h2>
          <Link href="/shops" className="btn-primary mt-4 inline-flex">Browse Shops</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen app-bg pb-32 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/shops" className="btn-icon flex-shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-body truncate">{shop.name}</h1>
            <p className="text-xs text-faint truncate">{shop.address.full}</p>
          </div>
          <button onClick={() => toggleFavorite(id)}
            className={`btn-icon flex-shrink-0 ${isFav ? 'bg-orange-500/15 border-orange-500/30' : ''}`}>
            <Heart size={18} fill={isFav ? '#FB923C' : 'none'} stroke={isFav ? '#FB923C' : 'currentColor'} />
          </button>
          <Link href="/cart" className="relative btn-icon flex-shrink-0">
            <ShoppingCart size={18} />
            {cartItems.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{cartItems.reduce((s, i) => s + i.quantity, 0)}</span>}
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4">
        {/* Shop Banner */}
        <div className="mt-4 glass-card overflow-hidden">
          <div className="card-media h-44 relative">
            <Image src={shop.images.banner || '/images/categories/groceries.jpg'} alt={shop.name} fill sizes="800px" className="object-cover" />
            <div className="card-media-overlay" />
            <div className={`absolute bottom-3 left-3 badge ${shop.isOpen ? 'badge-success' : 'badge-error'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${shop.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {shop.isOpen ? 'Open Now' : 'Closed'}
            </div>
            {shop.isFeatured && <span className="floating-badge flex items-center gap-1"><Star size={9} fill="currentColor" /> Popular</span>}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-body">{shop.name}</h2>
                {'nameTamil' in shop && shop.nameTamil && <p className="text-sm text-muted mt-0.5">{shop.nameTamil}</p>}
                <p className="text-xs text-faint mt-1">{shop.description}</p>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Rating', value: shop.rating.toString(), icon: Star },
                { label: 'Reviews', value: shop.totalRatings.toString(), icon: MessageCircle },
                { label: 'Prep Time', value: `${shop.avgPrepTime}m`, icon: Zap },
                { label: 'Radius', value: `${shop.deliveryRadius}km`, icon: MapPin },
              ].map(stat => (
                <div key={stat.label} className="glass-sm p-2.5 text-center">
                  <stat.icon size={15} className="text-accent mx-auto" />
                  <div className="text-sm font-black text-body mt-0.5">{stat.value}</div>
                  <div className="text-[10px] text-faint">{stat.label}</div>
                </div>
              ))}
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {shop.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 surface rounded-full text-[10px] text-muted">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 surface rounded-xl mt-4 mb-4">
          {[
            { id: 'menu', label: 'Menu', icon: Utensils },
            { id: 'info', label: 'Info', icon: Info },
            { id: 'reviews', label: 'Reviews', icon: Star },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === tab.id ? 'bg-orange-500 text-white' : 'text-muted hover:text-secondary'}`}>
              <tab.icon size={13} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'menu' && (
          <>
            {/* Veg filter */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted">{products.length} items</p>
              <button onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${vegOnly ? 'bg-emerald-500/12 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'surface text-secondary'}`}>
                <span className={`w-3 h-3 border-2 rounded-sm flex items-center justify-center ${vegOnly ? 'border-emerald-500' : 'border-[var(--card-border)]'}`}>
                  {vegOnly && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                </span>
                Veg Only
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted">No veg items available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map(product => {
                  const cartItem = cart.find(i => i.productId === product.id);
                  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                  const discountPct = hasDiscount ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) : 0;

                  return (
                    <div key={product.id} className="glass-sm p-4 flex items-center gap-4">
                      {/* Veg indicator */}
                      <div className="flex-shrink-0">
                        <span className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${product.isVeg ? 'border-emerald-500' : 'border-red-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </span>
                      </div>

                      {/* Product photo */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0">
                        <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" />
                        {hasDiscount && (
                          <span className="absolute top-0.5 right-0.5 px-1 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded">
                            -{discountPct}%
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-body">{product.name}</h4>
                        <p className="text-[11px] text-faint mt-0.5">{product.nameTamil} • {product.unit}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={10} fill="#F97316" stroke="none" />
                          <span className="text-[10px] text-accent font-bold">{'rating' in product ? (product as any).rating : 4.5}</span>
                        </div>
                      </div>

                      {/* Price + Add */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-black text-body">₹{product.discountPrice || product.price}</span>
                          {hasDiscount && <span className="block text-[10px] text-faint line-through">₹{product.price}</span>}
                        </div>
                        {cartItem ? (
                          <div className="qty-control">
                            <button className="qty-btn" onClick={() => cartItem.quantity === 1 ? removeFromCart(product.id) : updateQuantity(product.id, cartItem.quantity - 1)}>−</button>
                            <span className="qty-value">{cartItem.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}>+</button>
                          </div>
                        ) : (
                          <button onClick={() => {
                            addToCart({ productId: product.id, shopId: product.shopId, name: product.name, nameTamil: product.nameTamil, price: product.price, discountPrice: product.discountPrice, quantity: 1, unit: product.unit, isVeg: product.isVeg });
                            toast.success('Added to cart!');
                          }} className="px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 text-accent text-xs font-black rounded-lg hover:bg-orange-500/15 active:scale-95 transition-all">
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'info' && (
          <div className="space-y-3">
            {[
              { icon: MapPin, label: 'Address', value: shop.address.full },
              { icon: Phone, label: 'Phone', value: ('phone' in shop ? (shop as any).phone : 'N/A') },
              { icon: Clock, label: 'Timing', value: ('timing' in shop ? `${(shop as any).timing.openTime} – ${(shop as any).timing.closeTime}` : `${(shop as any).openTime || '08:00'} – ${(shop as any).closeTime || '22:00'}`) },
              { icon: Bike, label: 'Delivery Radius', value: `${shop.deliveryRadius} km` },
              { icon: Wallet, label: 'Min. Order', value: shop.minOrderAmount > 0 ? `₹${shop.minOrderAmount}` : 'No minimum' },
              { icon: Zap, label: 'Avg Prep Time', value: `${shop.avgPrepTime} minutes` },
            ].map(item => (
              <div key={item.label} className="glass-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/8 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs text-faint">{item.label}</p>
                  <p className="text-sm font-semibold text-body mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <ReviewsSection shopId={shop.id} shopRating={shop.rating} shopTotalRatings={shop.totalRatings} />
        )}
      </div>

      {/* Cart Bar */}
      {cartItems.length > 0 && (
        <div className="sticky-bottom">
          <div className="max-w-5xl mx-auto">
            <Link href="/cart" className="btn-primary w-full py-4 text-base justify-between">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 bg-black/20 rounded-lg flex items-center justify-center text-xs font-black">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)}
                </span>
                View Cart
              </span>
              <span className="font-black">₹{cartTotal} →</span>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
