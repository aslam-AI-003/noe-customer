'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, Star, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SEED_SHOPS } from '@/lib/seed-data';

export default function FavoritesPage() {
  const { favoriteShopIds, toggleFavorite } = useStore();
  const favShops = SEED_SHOPS.filter(s => favoriteShopIds.includes(s.id));

  return (
    <main className="min-h-screen app-bg pb-24 md:pb-8">
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="btn-icon"><ArrowLeft size={18} /></Link>
          <h1 className="font-bold text-body flex-1">Favourites</h1>
          <span className="text-xs text-faint">{favShops.length} saved</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4">
        {favShops.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={44} className="text-faint mx-auto mb-4 animate-float" />
            <h3 className="text-lg font-bold text-muted">No favourites yet</h3>
            <p className="text-sm text-faint mt-1">Tap the heart icon on any shop to save it</p>
            <Link href="/shops" className="btn-primary mt-5 inline-flex">Browse Shops →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favShops.map(shop => (
              <div key={shop.id} className="glass-card-hover group overflow-hidden">
                <div className="card-media h-36 relative">
                  <Image src={shop.images.banner || '/images/categories/groceries.jpg'} alt={shop.name} fill sizes="360px" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="card-media-overlay" />
                  <div className={`absolute bottom-2 right-2 badge ${shop.isOpen ? 'badge-success' : 'badge-error'} text-[10px]`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${shop.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {shop.isOpen ? 'Open' : 'Closed'}
                  </div>
                  <button onClick={() => toggleFavorite(shop.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500/25 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-red-500/35 transition-all">
                    <Heart size={14} fill="#f87171" stroke="#f87171" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-body group-hover:text-accent transition-colors">{shop.name}</h3>
                  <p className="text-xs text-faint mt-0.5 line-clamp-1">{shop.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-bold text-accent flex items-center gap-0.5"><Star size={11} fill="currentColor" /> {shop.rating}</span>
                    <span className="text-xs text-muted flex items-center gap-0.5"><Zap size={11} /> {shop.avgPrepTime} min</span>
                  </div>
                  <Link href={`/shops/${shop.id}`}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 bg-orange-500/10 border border-orange-500/20 text-accent text-xs font-bold rounded-xl hover:bg-orange-500/15 transition-colors">
                    Order Now →
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
