'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Search, X, Clock, TrendingUp, LayoutGrid, Star, Zap,
  ChevronRight, ShoppingCart, SearchX, Store, Package,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SEED_SHOPS, SEED_PRODUCTS, SEED_CATEGORIES } from '@/lib/seed-data';
import toast from 'react-hot-toast';

const POPULAR_SEARCHES = ['Rice', 'Chicken', 'Medicine', 'Cake', 'Coffee', 'Vegetables', 'Biryani', 'Milk'];

export default function SearchPage() {
  const router = useRouter();
  const { addToCart, updateQuantity, removeFromCart, cart, getCartTotal, getCartItemCount } = useStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'shops' | 'products'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(['Ponni Rice', 'Filter Coffee', 'Chicken Biryani']);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const shopResults = query.length > 1
    ? SEED_SHOPS.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase()) ||
        s.tags.some(t => t.includes(query.toLowerCase())))
    : [];

  const productResults = query.length > 1
    ? SEED_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.nameTamil.includes(query))
    : [];

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.length > 2 && !recentSearches.includes(q)) {
      setRecentSearches(prev => [q, ...prev].slice(0, 5));
    }
  };

  const handleAddToCart = (product: typeof SEED_PRODUCTS[0]) => {
    addToCart({
      productId: product.id,
      shopId: product.shopId,
      name: product.name,
      nameTamil: product.nameTamil,
      price: product.price,
      discountPrice: product.discountPrice,
      quantity: 1,
      unit: product.unit,
      isVeg: product.isVeg,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleIncrease = (product: typeof SEED_PRODUCTS[0], currentQty: number) => {
    updateQuantity(product.id, currentQty + 1);
  };

  const handleDecrease = (product: typeof SEED_PRODUCTS[0], currentQty: number) => {
    if (currentQty <= 1) {
      removeFromCart(product.id);
      toast(`${product.name} removed from cart`, { duration: 1500 });
    } else {
      updateQuantity(product.id, currentQty - 1);
    }
  };

  const totalResults = shopResults.length + productResults.length;
  const cartItemCount = getCartItemCount();
  const cartTotal = getCartTotal();

  return (
    <main className="min-h-screen app-bg pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="btn-icon flex-shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="search-bar flex-1">
            <span className="search-icon">
              <Search size={16} />
            </span>
            <input ref={inputRef} value={query} onChange={e => handleSearch(e.target.value)}
              placeholder="Search shops, products, medicines..." autoFocus />
          </div>
          {query && (
            <button onClick={() => setQuery('')} className="btn-icon flex-shrink-0">
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4">
        {!query ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Recent</h3>
                  <button onClick={() => setRecentSearches([])} className="text-xs text-faint hover:text-secondary">Clear</button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map(s => (
                    <button key={s} onClick={() => handleSearch(s)}
                      className="w-full flex items-center gap-3 p-3 glass-sm surface-hover transition-colors text-left">
                      <Clock size={14} className="text-faint" />
                      <span className="text-sm text-secondary flex-1">{s}</span>
                      <ChevronRight size={12} className="text-faint" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5"><TrendingUp size={14} /> Popular</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(s => (
                  <button key={s} onClick={() => handleSearch(s)}
                    className="cat-pill">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse Categories */}
            <div>
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5"><LayoutGrid size={14} /> Browse Categories</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {SEED_CATEGORIES.slice(0, 12).map(cat => (
                  <Link key={cat.id} href={`/shops?category=${cat.id}`}
                    className="glass-card-hover p-3 flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg overflow-hidden relative flex-shrink-0">
                      <Image src={cat.image} alt={cat.name} fill sizes="32px" className="object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-semibold text-secondary group-hover:text-body transition-colors truncate">{cat.name.split('/')[0]}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted">
                {totalResults > 0
                  ? <><span className="text-body font-bold">{totalResults}</span> results for &ldquo;<span className="text-accent">{query}</span>&rdquo;</>
                  : 'No results found'}
              </p>
            </div>

            {/* Tabs */}
            {totalResults > 0 && (
              <div className="flex gap-1 p-1 surface rounded-xl mb-4">
                {([['all', `All (${totalResults})`], ['shops', `Shops (${shopResults.length})`], ['products', `Products (${productResults.length})`]] as const).map(([tab, label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-orange-500 text-white' : 'text-muted hover:text-secondary'}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Shop Results */}
            {(activeTab === 'all' || activeTab === 'shops') && shopResults.length > 0 && (
              <div className="mb-4">
                {activeTab === 'all' && <h3 className="text-xs font-bold text-faint uppercase tracking-wider mb-2 flex items-center gap-1.5"><Store size={12} /> Shops</h3>}
                <div className="space-y-2">
                  {shopResults.map(shop => (
                    <Link key={shop.id} href={`/shops/${shop.id}`}
                      className="glass-card-hover flex items-center gap-3 p-3 group">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                        <Image src={shop.images.banner || '/images/categories/groceries.jpg'} alt={shop.name} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-body group-hover:text-accent transition-colors truncate">{shop.name}</h4>
                        <p className="text-xs text-faint truncate">{shop.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-accent flex items-center gap-0.5"><Star size={9} fill="currentColor" /> {shop.rating}</span>
                          <span className="text-[10px] text-faint flex items-center gap-0.5"><Zap size={9} /> {shop.avgPrepTime}m</span>
                          <div className={`badge ${shop.isOpen ? 'badge-success' : 'badge-error'} text-[9px]`}>
                            {shop.isOpen ? 'Open' : 'Closed'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-faint" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Product Results */}
            {(activeTab === 'all' || activeTab === 'products') && productResults.length > 0 && (
              <div className="mb-4">
                {activeTab === 'all' && <h3 className="text-xs font-bold text-faint uppercase tracking-wider mb-2 flex items-center gap-1.5"><Package size={12} /> Products</h3>}
                <div className="space-y-2">
                  {productResults.map(product => {
                    const cartItem = cart.find(i => i.productId === product.id);
                    return (
                      <div key={product.id} className="glass-sm p-3 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                          <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-body truncate">{product.name}</h4>
                          <p className="text-xs text-faint">{product.nameTamil} • {product.unit}</p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-sm font-black text-body">₹{product.discountPrice || product.price}</span>
                            {product.discountPrice && <span className="text-[10px] text-faint line-through">₹{product.price}</span>}
                          </div>
                        </div>
                        {cartItem ? (
                          <div className="qty-control flex-shrink-0">
                            <button
                              className="qty-btn"
                              onClick={() => handleDecrease(product, cartItem.quantity)}>
                              −
                            </button>
                            <span className="qty-value">{cartItem.quantity}</span>
                            <button
                              className="qty-btn"
                              onClick={() => handleIncrease(product, cartItem.quantity)}>
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-shrink-0 px-4 py-1.5 bg-orange-500/10 border border-orange-500/25 text-accent text-xs font-black rounded-lg hover:bg-orange-500/15 active:scale-95 transition-all">
                            ADD
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No results */}
            {totalResults === 0 && (
              <div className="text-center py-16">
                <SearchX size={44} className="text-faint mx-auto mb-4" />
                <h3 className="text-lg font-bold text-muted">No results for &ldquo;{query}&rdquo;</h3>
                <p className="text-sm text-faint mt-1">Try a different search term</p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {POPULAR_SEARCHES.slice(0, 4).map(s => (
                    <button key={s} onClick={() => handleSearch(s)} className="cat-pill">{s}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Floating Cart Bar ─────────────────────────────────── */}
      {cartItemCount > 0 && (
        <div
          className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50 max-w-lg mx-auto"
          style={{ animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <button
            onClick={() => router.push('/cart')}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #FB923C, #F97316)',
              boxShadow: '0 8px 32px rgba(249,115,22,0.4)',
            }}>
            {/* Left: item count badge */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black/15 rounded-xl flex items-center justify-center">
                <span className="text-sm font-black text-white">{cartItemCount}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-white leading-tight">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in cart
                </p>
                <p className="text-[11px] text-white/75 font-semibold">Tap to review & checkout</p>
              </div>
            </div>

            {/* Right: total + arrow */}
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white">₹{cartTotal}</span>
              <div className="w-7 h-7 bg-black/15 rounded-lg flex items-center justify-center">
                <ChevronRight size={14} className="text-white" />
              </div>
            </div>
          </button>
        </div>
      )}
    </main>
  );
}
