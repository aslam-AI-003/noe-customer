'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search, MapPin, ChevronDown, Bell, ShoppingCart, Bike, Star, Zap,
  ChevronRight, Store,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SEED_SHOPS, SEED_CATEGORIES, SEED_BANNERS } from '@/lib/seed-data';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const HERO_STATS = [
  { value: '500+', label: 'Shops', icon: Store },
  { value: '10K+', label: 'Deliveries', icon: Bike },
  { value: '30 min', label: 'Avg Delivery', icon: Zap },
  { value: '4.8★', label: 'Rating', icon: Star },
];

const PROMO_META: Record<string, { title: string; sub: string; desc: string; code: string | null }> = {
  b1: { title: '50% OFF', sub: 'First Order', desc: 'New users only', code: 'FIRST50' },
  b2: { title: 'FREE Delivery', sub: 'Orders ₹500+', desc: 'No code needed', code: null },
  b3: { title: '₹100 Cashback', sub: 'Wallet Payment', desc: 'Use code below', code: 'WALLET100' },
};

export default function HomePage() {
  const { getCartItemCount, getCartTotal, currentLocation } = useStore();
  const [activeBanner, setActiveBanner] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [openShopsCount] = useState(SEED_SHOPS.filter(s => s.isOpen).length);
  const bannerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    bannerRef.current = setInterval(() => setActiveBanner(p => (p + 1) % SEED_BANNERS.length), 4000);
    return () => { if (bannerRef.current) clearInterval(bannerRef.current); };
  }, []);

  const cartCount = mounted ? getCartItemCount() : 0;
  const cartTotal = mounted ? getCartTotal() : 0;
  const featuredShops = SEED_SHOPS.filter(s => s.isFeatured).slice(0, 6);
  const openShops = SEED_SHOPS.filter(s => s.isOpen).slice(0, 6);

  return (
    <main className="min-h-screen app-bg pb-24 md:pb-8">

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bike size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-black text-body">NammaOoru</span>
              <span className="text-sm font-black text-accent"> Express</span>
            </div>
          </Link>

          {/* Location */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 surface surface-hover rounded-xl flex-1 max-w-[180px] transition-colors">
            <MapPin size={13} className="text-accent flex-shrink-0" />
            <span className="text-xs font-semibold text-body truncate">{currentLocation?.address || 'Thanjavur'}</span>
            <ChevronDown size={12} className="text-faint flex-shrink-0" />
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <Link href="/search" className="btn-icon">
              <Search size={16} />
            </Link>
            <ThemeToggle variant="icon" />
            <Link href="/notifications" className="btn-icon relative">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">3</span>
            </Link>
            <Link href="/cart" className="btn-icon relative">
              <ShoppingCart size={16} />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{cartCount}</span>}
            </Link>
            <Link href="/profile" className="w-9 h-9 bg-gradient-to-br from-orange-400/20 to-orange-500/10 border border-orange-400/25 rounded-xl flex items-center justify-center text-sm font-black text-accent">U</Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-yellow w-96 h-96 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60" />
        <div className="orb orb-orange w-64 h-64 top-20 right-0 opacity-40" />
        <div className="orb orb-purple w-48 h-48 bottom-0 left-0 opacity-30" />

        <div className="max-w-5xl mx-auto px-4 pt-8 pb-6 relative z-10">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-5 animate-fade-in">
            <div className="live-dot" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{openShopsCount} shops open near you</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              {/* Main heading */}
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-3 animate-slide-down">
                <span className="text-body">நம்ம ஊரு</span><br />
                <span className="gradient-text">Express</span>
              </h1>
              <p className="text-base text-muted leading-relaxed mb-6 animate-fade-in delay-200">
                உங்கள் கதவுக்கே கொண்டு வருகிறோம்!<br />
                <span className="text-secondary">Groceries, Food, Medicine & more — delivered in 30 mins</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-3 flex-wrap animate-fade-in delay-300">
                <Link href="/shops" className="btn-primary text-sm px-6 py-3">
                  <ShoppingCart size={16} />
                  Order Now
                </Link>
                <Link href="/track" className="btn-secondary text-sm px-6 py-3">
                  <MapPin size={16} />
                  Track Order
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mt-6 animate-fade-in delay-400">
                {HERO_STATS.map((s, i) => (
                  <div key={i} className="glass-sm p-2.5 text-center">
                    <s.icon size={16} className="text-accent mx-auto" />
                    <div className="text-sm font-black text-body mt-0.5">{s.value}</div>
                    <div className="text-[9px] text-faint">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden md:flex items-center justify-center relative">
              <div className="relative w-64 h-64">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border border-orange-400/20 animate-spin" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-4 rounded-full border border-orange-400/15" style={{ animation: 'spin 15s linear infinite reverse' }} />
                {/* Center */}
                <div className="absolute inset-8 bg-gradient-to-br from-orange-400/15 to-orange-500/10 rounded-full border border-orange-400/25 flex items-center justify-center animate-pulse-glow">
                  <Bike size={64} className="text-accent animate-float" />
                </div>
                {/* Floating category thumbnails */}
                {[
                  { img: '/images/categories/groceries.jpg', pos: 'top-0 left-8', delay: '0s' },
                  { img: '/images/categories/restaurants.jpg', pos: 'top-4 right-4', delay: '0.5s' },
                  { img: '/images/categories/medicines.jpg', pos: 'bottom-4 left-4', delay: '1s' },
                  { img: '/images/categories/cakes.jpg', pos: 'bottom-0 right-8', delay: '1.5s' },
                ].map((item, i) => (
                  <div key={i} className={`absolute ${item.pos} w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-lg animate-float`} style={{ animationDelay: item.delay }}>
                    <Image src={item.img} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH BAR ── */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <Link href="/search" className="block">
          <div className="search-bar">
            <span className="search-icon">
              <Search size={16} />
            </span>
            <div className="w-full py-3 pl-10 pr-4 input-glass text-sm text-faint cursor-pointer">
              Search shops, products, medicines...
            </div>
          </div>
        </Link>
      </div>

      {/* ── PROMO BANNERS ── */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl">
          {SEED_BANNERS.map((banner, i) => {
            const meta = PROMO_META[banner.id];
            return (
              <div key={banner.id}
                className={`transition-all duration-500 ${i === activeBanner ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
                <div className="relative overflow-hidden rounded-2xl h-32 sm:h-36">
                  <Image src={banner.image} alt={banner.title} fill sizes="800px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-white">{meta.title}</span>
                        <span className="text-sm text-white/80">{meta.sub}</span>
                      </div>
                      <p className="text-xs text-white/70 mt-0.5">{meta.desc}</p>
                      {meta.code && (
                        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-white/15 border border-dashed border-white/40 rounded-lg backdrop-blur-sm">
                          <span className="text-xs font-black text-white tracking-widest">{meta.code}</span>
                        </div>
                      )}
                    </div>
                    <Link href="/offers" className="btn-primary text-xs px-4 py-2 flex-shrink-0">Grab →</Link>
                  </div>
                </div>
              </div>
            );
          })}
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {SEED_BANNERS.map((_, i) => (
              <button key={i} onClick={() => setActiveBanner(i)}
                className={`h-1.5 rounded-full transition-all ${i === activeBanner ? 'w-6 bg-orange-500' : 'w-1.5 bg-[var(--card-border)]'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="section-title">What do you need?</h2>
            <p className="section-subtitle">Browse by category</p>
          </div>
          <Link href="/categories" className="text-xs text-accent font-bold hover:opacity-80 transition-opacity flex items-center gap-0.5">See all <ChevronRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {SEED_CATEGORIES.slice(0, 16).map((cat, i) => (
            <Link key={cat.id} href={`/shops?category=${cat.id}`}
              className="glass-card-hover p-2 flex flex-col items-center gap-1.5 text-center group animate-fade-in overflow-hidden"
              style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="w-full aspect-square rounded-xl overflow-hidden relative">
                <Image src={cat.image} alt={cat.name} fill sizes="80px" className="object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-[10px] font-semibold text-secondary group-hover:text-accent transition-colors leading-tight">{cat.name.split('/')[0].split(' & ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── FEATURED SHOPS ── */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="section-title flex items-center gap-1.5"><Star size={16} className="text-accent" fill="currentColor" /> Popular Shops</h2>
            <p className="section-subtitle">Top-rated near you</p>
          </div>
          <Link href="/shops" className="text-xs text-accent font-bold hover:opacity-80 transition-opacity flex items-center gap-0.5">View all <ChevronRight size={14} /></Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {featuredShops.map((shop, i) => (
            <Link key={shop.id} href={`/shops/${shop.id}`}
              className="flex-shrink-0 w-44 glass-card-hover overflow-hidden group animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="card-media h-28 relative">
                <Image src={shop.images.banner || '/images/categories/groceries.jpg'} alt={shop.name} fill sizes="180px" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="card-media-overlay" />
                <div className={`absolute bottom-2 right-2 badge ${shop.isOpen ? 'badge-success' : 'badge-error'} text-[9px]`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${shop.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {shop.isOpen ? 'Open' : 'Closed'}
                </div>
                {shop.isFeatured && <span className="floating-badge flex items-center gap-1"><Star size={9} fill="currentColor" /> Popular</span>}
              </div>
              <div className="p-3">
                <h3 className="text-xs font-bold text-body truncate group-hover:text-accent transition-colors">{shop.name}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold text-accent flex items-center gap-0.5"><Star size={10} fill="currentColor" /> {shop.rating}</span>
                  <span className="text-[10px] text-faint flex items-center gap-0.5"><Zap size={10} /> {shop.avgPrepTime}m</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── OPEN NOW ── */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <div className="live-dot" />
              Open Now
            </h2>
            <p className="section-subtitle">{openShopsCount} shops ready to deliver</p>
          </div>
          <Link href="/shops" className="text-xs text-accent font-bold hover:opacity-80 transition-opacity flex items-center gap-0.5">View all <ChevronRight size={14} /></Link>
        </div>
        <div className="space-y-2">
          {openShops.map((shop, i) => (
            <Link key={shop.id} href={`/shops/${shop.id}`}
              className="glass-card-hover flex items-center gap-3 p-3 group animate-fade-in"
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0">
                <Image src={shop.images.banner || '/images/categories/groceries.jpg'} alt={shop.name} fill sizes="56px" className="object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-body truncate group-hover:text-accent transition-colors">{shop.name}</h3>
                <p className="text-xs text-faint truncate mt-0.5">{shop.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-accent flex items-center gap-0.5"><Star size={10} fill="currentColor" /> {shop.rating}</span>
                  <span className="text-[10px] text-faint flex items-center gap-0.5"><Zap size={10} /> {shop.avgPrepTime} min</span>
                  <span className="text-[10px] text-faint flex items-center gap-0.5"><MapPin size={10} /> {shop.deliveryRadius} km</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <ChevronRight size={14} className="text-accent" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="glass-card p-5 bg-gradient-to-br from-orange-400/5 to-transparent">
          <h2 className="section-title text-center mb-1">How it works?</h2>
          <p className="section-subtitle text-center mb-5">Order in 4 simple steps</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: MapPin, title: 'Set Location', desc: 'Allow GPS or enter address' },
              { icon: Store, title: 'Choose Shop', desc: 'Browse nearby shops' },
              { icon: ShoppingCart, title: 'Add Items', desc: 'Pick what you need' },
              { icon: Bike, title: 'Get Delivered', desc: 'Track in real-time' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2 hover:scale-110 transition-transform">
                  <s.icon size={18} className="text-accent" />
                </div>
                <p className="text-xs font-black text-body">{s.title}</p>
                <p className="text-[10px] text-faint mt-0.5 leading-tight">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── QUICK LINKS ── */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/offers" className="glass-card p-4 flex items-center gap-3 bg-gradient-to-br from-orange-400/10 to-transparent border-orange-400/20 hover:border-orange-400/40 transition-all group">
            <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-black text-body">Offers & Deals</p>
              <p className="text-xs text-faint">Save up to 50%</p>
            </div>
          </Link>
          <Link href="/track" className="glass-card p-4 flex items-center gap-3 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-all group">
            <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bike size={20} className="text-accent animate-float" />
            </div>
            <div>
              <p className="text-sm font-black text-body">Track Order</p>
              <p className="text-xs text-faint">Live tracking</p>
            </div>
          </Link>
          <Link href="/wallet" className="glass-card p-4 flex items-center gap-3 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
            <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-black text-body">My Wallet</p>
              <p className="text-xs text-faint">Add money & cashback</p>
            </div>
          </Link>
          <Link href="/support" className="glass-card p-4 flex items-center gap-3 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 hover:border-blue-500/40 transition-all group">
            <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-black text-body">Help & Support</p>
              <p className="text-xs text-faint">24/7 assistance</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="glass-sm p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <Bike size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-body">NammaOoru <span className="text-accent">Express</span></span>
          </div>
          <p className="text-xs text-faint">Thanjavur & Kumbakonam • Made with ❤️ in Tamil Nadu</p>
          <div className="flex justify-center gap-4 mt-3">
            {[['About', '/about'], ['Terms', '/terms'], ['Privacy', '/privacy'], ['Support', '/support']].map(([l, h]) => (
              <Link key={l} href={h} className="text-[11px] text-faint hover:text-secondary transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav className="bottom-nav md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { href: '/', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>, label: 'Home', active: true },
            { href: '/search', icon: <Search size={20} />, label: 'Search', active: false },
            { href: '/orders', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label: 'Orders', active: false },
            { href: '/cart', icon: <ShoppingCart size={20} />, label: 'Cart', active: false, badge: cartCount },
            { href: '/profile', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: 'Profile', active: false },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${item.active ? 'text-accent' : 'text-faint hover:text-secondary'}`}>
              {item.icon}
              <span className="text-[9px] font-semibold">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{item.badge}</span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── FLOATING CART BAR ── */}
      {cartCount > 0 && (
        <div className="sticky-bottom md:hidden">
          <Link href="/cart" className="btn-primary w-full py-3.5 justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 bg-black/20 rounded-lg flex items-center justify-center text-xs font-black">{cartCount}</span>
              View Cart
            </span>
            <span className="font-black">₹{cartTotal} →</span>
          </Link>
        </div>
      )}
    </main>
  );
}
