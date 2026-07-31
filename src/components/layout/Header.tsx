'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bike, ShoppingCart, UserRound, Menu, X, Home, Store, MapPin, Info } from 'lucide-react';
import { useStore } from '@/store/useStore';
import AreaSelector from '@/components/ui/AreaSelector';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, language, setLanguage, isAuthenticated } = useStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <Bike size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold font-display text-body">
                Namma Ooru <span className="text-accent">Express</span>
              </h1>
              <p className="text-xs text-faint -mt-0.5">Fast • Safe • Trusted</p>
            </div>
          </Link>

          {/* Area Selector */}
          <AreaSelector />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/shops" className="nav-link">Shops</Link>
            <Link href="/track" className="nav-link">Track Order</Link>
            <Link href="/about" className="nav-link">About</Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'ta' ? 'en' : 'ta')}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 surface surface-hover rounded-lg text-sm font-medium text-secondary hover:text-accent transition-colors"
            >
              {language === 'ta' ? 'EN' : 'தமிழ்'}
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-[var(--card-hover)] transition-colors">
              <ShoppingCart size={22} className="text-secondary" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Auth Button */}
            {isAuthenticated ? (
              <Link href="/profile" className="w-9 h-9 bg-orange-500/15 rounded-xl flex items-center justify-center">
                <UserRound size={18} className="text-accent" />
              </Link>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm px-4 py-2">
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-[var(--card-hover)] transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={22} className="text-secondary" /> : <Menu size={22} className="text-secondary" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-subtle animate-slide-down">
            <nav className="flex flex-col gap-3">
              <Link href="/" className="nav-link py-2 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}><Home size={15} /> Home</Link>
              <Link href="/shops" className="nav-link py-2 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}><Store size={15} /> Shops</Link>
              <Link href="/track" className="nav-link py-2 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}><MapPin size={15} /> Track Order</Link>
              <Link href="/about" className="nav-link py-2 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}><Info size={15} /> About</Link>
              <Link href="/shop/register" className="nav-link py-2 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}><Store size={15} /> Register Shop</Link>
              <Link href="/rider/register" className="nav-link py-2 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}><Bike size={15} /> Become a Partner</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
