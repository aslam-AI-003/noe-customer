'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PartyPopper, Bike, Wallet, X, Ticket, Users, Check, Clock, Send } from 'lucide-react';
import { SEED_COUPONS } from '@/lib/seed-data';
import toast from 'react-hot-toast';

const BANNER_OFFERS = [
  { id: 'b1', title: '50% OFF', subtitle: 'On first order', desc: 'New users get flat 50% off up to ₹100', code: 'WELCOME50', color: '#F59E0B', icon: PartyPopper, expiry: 'Today only', savings: '₹100' },
  { id: 'b2', title: 'FREE Delivery', subtitle: 'All week long', desc: 'Free delivery on all orders above ₹199', code: 'FREEDEL', color: '#10B981', icon: Bike, expiry: 'Ends Sunday', savings: '₹50' },
  { id: 'b3', title: '₹100 Cashback', subtitle: 'On wallet payment', desc: 'Pay via wallet and get ₹100 cashback', code: 'WALLET100', color: '#3B82F6', icon: Wallet, expiry: 'Limited time', savings: '₹100' },
];

export default function OffersPage() {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    toast.success(`Code "${code}" copied!`);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const applyAndGo = (code: string) => {
    setAppliedCode(code);
    toast.success(`"${code}" will be applied at checkout!`);
    setTimeout(() => router.push('/shops'), 1200);
  };

  return (
    <main className="min-h-screen app-bg pb-24 md:pb-8">
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="btn-icon"><ArrowLeft size={18} /></Link>
          <h1 className="font-bold text-body flex-1">Offers & Coupons</h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-orange-500/8 border-orange-500/20">
            <span className="text-xs font-bold text-accent">{BANNER_OFFERS.length + SEED_COUPONS.filter(c => c.isActive).length} active</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-5">

        {/* Applied banner */}
        {appliedCode && (
          <div className="rounded-2xl border p-3 flex items-center gap-3 bg-emerald-500/8 border-emerald-500/20">
            <Check size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">&quot;{appliedCode}&quot; will be applied at checkout</p>
              <p className="text-xs text-faint">Redirecting to shops...</p>
            </div>
            <button onClick={() => setAppliedCode('')} className="text-faint hover:text-secondary"><X size={16} /></button>
          </div>
        )}

        {/* Hot Deals */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest mb-3 text-faint">Hot Deals</h2>
          <div className="space-y-3">
            {BANNER_OFFERS.map(offer => (
              <div key={offer.id} className="rounded-2xl border overflow-hidden" style={{ background: `${offer.color}10`, borderColor: `${offer.color}30` }}>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border"
                      style={{ background: `${offer.color}18`, borderColor: `${offer.color}30` }}>
                      <offer.icon size={22} style={{ color: offer.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-black text-body text-base">{offer.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${offer.color}22`, color: offer.color }}>
                          Save {offer.savings}
                        </span>
                      </div>
                      <p className="text-xs font-bold mb-0.5" style={{ color: offer.color }}>{offer.subtitle}</p>
                      <p className="text-xs text-muted">{offer.desc}</p>
                    </div>
                  </div>

                  {/* Dashed coupon strip */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed"
                      style={{ borderColor: `${offer.color}40`, background: `${offer.color}0A` }}>
                      <span className="text-xs font-black tracking-widest" style={{ color: offer.color }}>{offer.code}</span>
                      <span className="text-[10px] ml-auto text-faint flex items-center gap-1"><Clock size={10} /> {offer.expiry}</span>
                    </div>
                    <button onClick={() => copyCode(offer.code)}
                      className="px-3 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 flex-shrink-0"
                      style={{ background: copiedCode === offer.code ? '#10B981' : `${offer.color}22`, color: copiedCode === offer.code ? '#fff' : offer.color, border: `1px solid ${offer.color}30` }}>
                      {copiedCode === offer.code ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={() => applyAndGo(offer.code)}
                      className="px-3 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 flex-shrink-0 text-white"
                      style={{ background: offer.color }}>
                      Use Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon Codes */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest mb-3 text-faint flex items-center gap-1.5"><Ticket size={12} /> Coupon Codes</h2>
          <div className="space-y-2">
            {SEED_COUPONS.filter(c => c.isActive).map(coupon => (
              <div key={coupon.id} className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-accent tracking-wider">{coupon.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-orange-500/10 text-accent">
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{coupon.description}</p>
                    <p className="text-[10px] mt-0.5 text-faint">Min. order ₹{coupon.minOrderAmount} • Max discount ₹{coupon.maxDiscount}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => copyCode(coupon.code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${copiedCode === coupon.code ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' : 'surface text-secondary'}`}>
                      {copiedCode === coupon.code ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={() => applyAndGo(coupon.code)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-orange-500/10 text-accent border border-orange-500/20">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral */}
        <div className="rounded-2xl border p-4 bg-gradient-to-br from-purple-500/8 to-blue-500/4 border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/12 flex items-center justify-center flex-shrink-0">
              <Users size={22} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-black text-body">Refer & Earn</h3>
              <p className="text-xs text-muted">Earn ₹50 for every friend you refer</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed mb-3 border-purple-500/30 bg-purple-500/6">
            <span className="text-xs font-black tracking-widest text-purple-600 dark:text-purple-400">REFER-NAMMAOORU</span>
            <button onClick={() => copyCode('REFER-NAMMAOORU')} className="ml-auto text-xs font-bold text-purple-600 dark:text-purple-400 hover:opacity-80">
              {copiedCode === 'REFER-NAMMAOORU' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button className="btn-primary w-full flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
            <Send size={15} /> Share with Friends
          </button>
        </div>

      </div>
    </main>
  );
}
