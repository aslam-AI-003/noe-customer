'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { SEED_CATEGORIES } from '@/lib/seed-data';

const CATEGORY_DESC: Record<string, string> = {
  groceries: 'Rice, Dal, Oil & more',
  vegetables: 'Fresh farm produce',
  meat: 'Chicken, Fish & more',
  medicines: 'Medicines & healthcare',
  bakery: 'Cakes, Bread & sweets',
  restaurants: 'Hot meals delivered',
  'tea-shops': 'Tea, Coffee & snacks',
  stationery: 'Books, pens & more',
  'pet-shop': 'Pet food & accessories',
  'flower-shop': 'Fresh flowers & bouquets',
  electronics: 'Gadgets & accessories',
  courier: 'Send & receive parcels',
  'water-can': '20L water cans',
  'gas-cylinder': 'LPG cylinder booking',
  milk: 'Fresh milk & dairy',
  cakes: 'Cakes for every occasion',
  'custom-parcel': 'Send anything, anywhere',
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen app-bg pb-24 md:pb-8">
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="btn-icon"><ArrowLeft size={18} /></Link>
          <h1 className="font-bold text-body flex-1">All Categories</h1>
          <span className="text-xs text-faint">{SEED_CATEGORIES.length} categories</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4">
        <p className="text-sm text-muted mb-4">What are you looking for today?</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SEED_CATEGORIES.map(cat => (
            <Link key={cat.id} href={`/shops?category=${cat.id}`}
              className="glass-card-hover overflow-hidden group">
              <div className="card-media h-24 relative">
                <Image src={cat.image} alt={cat.name} fill sizes="240px" className="object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="card-media-overlay" />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-bold text-body group-hover:text-accent transition-colors">{cat.name}</h3>
                <p className="text-[10px] text-faint mt-0.5">{CATEGORY_DESC[cat.id] || 'Various items'}</p>
                <p className="text-[10px] text-faint mt-1">{cat.nameTamil}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
