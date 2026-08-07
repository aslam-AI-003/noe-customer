'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Star, Zap, MapPin, Heart, Store, Navigation } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SEED_CATEGORIES } from '@/lib/seed-data';
import { vendorService } from '@/lib/firestoreService';
import type { VendorRegistration } from '@/store/useStore';
import { getAreaById, getDistanceKm } from '@/lib/serviceAreas';

function ShopsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const { favoriteShopIds, toggleFavorite, vendorRegistrations, selectedAreaId } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'rating' | 'time' | 'orders'>('rating');
  const [onlyOpen, setOnlyOpen] = useState(false);

  // Get selected area for filtering
  const selectedArea = getAreaById(selectedAreaId);

  // Real-time Firestore vendors
  const [firebaseShops, setFirebaseShops] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = vendorService.onAll((vendors) => {
      const approved = vendors
        .filter((v: any) => v.status === 'approved' && v.onboardingStep >= 3 && v.address)
        .map((v: any) => ({
          id: v.id, // Firestore doc ID — used in URL /shops/{id}
          name: v.shopName || 'Shop',
          description: v.description || `${v.shopType || 'shop'} • ${v.city || ''}`,
          categoryId: v.shopType || 'general',
          images: { banner: v.shopPhotoUrl || '/images/shops/shop-1.jpg', logo: '/images/shops/shop-1.jpg' },
          rating: v.rating || 4.5,
          totalRatings: v.totalRatings || 0,
          totalOrders: v.totalOrders || 0,
          avgPrepTime: v.prepTime || 20,
          deliveryCharge: v.deliveryCharge || 25,
          freeDeliveryAbove: v.freeDeliveryAbove || 299,
          minOrderAmount: v.minOrder || 0,
          deliveryRadius: v.deliveryRadius || 5,
          isOpen: v.isOnline !== false && !v.holidayMode,
          isFeatured: v.isFeatured || false,
          address: { full: v.address || '', city: v.city || '', pincode: v.pincode || '', lat: v.lat || 11.02, lng: v.lng || 76.97 },
          openTime: v.operatingHours?.[0]?.open || '08:00',
          closeTime: v.operatingHours?.[0]?.close || '22:00',
          tags: [v.shopType || 'shop'],
        }));
      setFirebaseShops(approved);
    });
    return () => unsubscribe();
  }, []);

  // Use only Firestore vendors (no seed data)
  const allShops = firebaseShops;

  // ━━━ AREA-BASED FILTERING ━━━
  // Show shops in selected area OR within 15km radius
  const areaFilteredShops = selectedArea
    ? allShops.filter(shop => {
        // Match by city name (case-insensitive)
        const shopCity = (shop.address?.city || '').toLowerCase();
        const areaName = selectedArea.name.toLowerCase();
        const areaDistrict = selectedArea.district.toLowerCase();
        if (shopCity === areaName || shopCity === areaDistrict) return true;
        // Match by distance (within 15km of selected area)
        if (shop.address?.lat && shop.address?.lng) {
          const dist = getDistanceKm(selectedArea.lat, selectedArea.lng, shop.address.lat, shop.address.lng);
          return dist <= 15;
        }
        return true; // Show shops without coordinates (demo)
      })
    : allShops;

  const filtered = areaFilteredShops
    .filter(s => category === 'all' || s.categoryId === category)
    .filter(s => !onlyOpen || s.isOpen)
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'time') return a.avgPrepTime - b.avgPrepTime;
      return b.totalOrders - a.totalOrders;
    });

  return (
    <main className="min-h-screen app-bg pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="btn-icon flex-shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 search-bar">
            <span className="search-icon">
              <Search size={16} />
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shops..." />
          </div>
          <button onClick={() => setOnlyOpen(!onlyOpen)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${onlyOpen ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400' : 'surface text-secondary'}`}>
            Open
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4">
        {/* Area indicator */}
        {selectedArea && (
          <div className="flex items-center gap-2 mb-3 p-2.5 surface rounded-xl">
            <MapPin size={13} className="text-accent" />
            <p className="text-xs text-muted flex-1">
              Showing shops in <span className="font-bold text-body">{selectedArea.name}</span>
              <span className="text-faint"> ({selectedArea.nameTamil})</span>
              <span className="text-faint"> • within 15km</span>
            </p>
            <Link href="/" className="text-[10px] font-bold text-accent hover:underline">Change ↗</Link>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
          <button onClick={() => setCategory('all')}
            className={`cat-pill flex-shrink-0 ${category === 'all' ? 'active' : ''}`}>
            All Shops
          </button>
          {SEED_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`cat-pill flex-shrink-0 ${category === cat.id ? 'active' : ''}`}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            <span className="text-body font-bold">{filtered.length}</span> shops found
          </p>
          <div className="flex gap-1">
            {([['rating', 'Rating'], ['time', 'Fastest'], ['orders', 'Popular']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setSortBy(val)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  sortBy === val ? 'bg-[#0E9F6E]/12 text-accent border border-[#0E9F6E]/30' : 'text-faint hover:text-secondary'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Shop grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Store size={44} className="text-faint mx-auto mb-4" />
            <h3 className="text-lg font-bold text-muted">No shops found</h3>
            <p className="text-sm text-faint mt-1">Try a different category or search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(shop => (
              <div key={shop.id} className="glass-card-hover group overflow-hidden">
                <div className="card-media h-40 relative">
                  <Image src={shop.images.banner || '/images/categories/groceries.jpg'} alt={shop.name} fill sizes="360px" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="card-media-overlay" />
                  {shop.isFeatured && <span className="floating-badge flex items-center gap-1"><Star size={9} fill="currentColor" /> Popular</span>}
                  <div className={`absolute bottom-2 right-2 badge ${shop.isOpen ? 'badge-success' : 'badge-error'} text-[10px]`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${shop.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {shop.isOpen ? 'Open' : 'Closed'}
                  </div>
                  <button onClick={() => toggleFavorite(shop.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center hover:scale-110 transition-all">
                    <Heart size={14} fill={favoriteShopIds.includes(shop.id) ? '#FB923C' : 'none'} stroke={favoriteShopIds.includes(shop.id) ? '#FB923C' : '#fff'} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-body group-hover:text-accent transition-colors">{shop.name}</h3>
                  <p className="text-xs text-faint mt-0.5 line-clamp-1">{shop.description}</p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star size={11} fill="#F97316" stroke="none" />
                      <span className="text-xs font-bold text-accent">{shop.rating}</span>
                      <span className="text-[10px] text-faint">({shop.totalRatings})</span>
                    </div>
                    <span className="text-xs text-muted flex items-center gap-1"><Zap size={11} /> {shop.avgPrepTime} min</span>
                    <span className="text-xs text-muted flex items-center gap-1"><MapPin size={11} /> {shop.deliveryRadius} km</span>
                  </div>
                  {shop.minOrderAmount > 0 && (
                    <p className="text-[10px] text-faint mt-1.5">Min. order ₹{shop.minOrderAmount}</p>
                  )}
                  <Link href={`/shops/${shop.id}`}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#0E9F6E]/10 border border-[#0E9F6E]/25 text-accent text-xs font-bold rounded-xl hover:bg-[#0E9F6E]/15 transition-colors">
                    View Menu →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ShopsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen app-bg flex items-center justify-center"><div className="text-muted">Loading...</div></div>}>
      <ShopsContent />
    </Suspense>
  );
}
