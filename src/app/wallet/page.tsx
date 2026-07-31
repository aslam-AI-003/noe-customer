'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, Loader2, Lock, Inbox, ArrowUpFromLine, Gift, BarChart3 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { addMoneyToWallet } from '@/lib/firebaseService';
import toast from 'react-hot-toast';

const ADD_AMOUNTS = [50, 100, 200, 500, 1000];
const FILTER_TABS = ['All', 'Credit', 'Debit'];

export default function WalletPage() {
  const { walletBalance, walletTransactions, user } = useStore();
  const [addAmount, setAddAmount] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('All');
  const [adding, setAdding] = useState(false);

  const filtered = walletTransactions.filter(t => {
    if (filter === 'Credit') return t.type === 'credit';
    if (filter === 'Debit') return t.type === 'debit';
    return true;
  });

  const totalAdded = walletTransactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalSpent = walletTransactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const totalCashback = walletTransactions.filter(t => t.type === 'credit' && t.icon === '💰').reduce((s, t) => s + t.amount, 0);

  // Build chart data from real transactions (last 7 days)
  const chartData = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    return days.map((day, i) => {
      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() - (6 - i));
      const spend = walletTransactions
        .filter(t => {
          if (t.type !== 'debit' || !t.createdAt) return false;
          const txDate = (t.createdAt as any).toDate ? (t.createdAt as any).toDate() : new Date(t.createdAt as any);
          return txDate.toDateString() === dayDate.toDateString();
        })
        .reduce((s, t) => s + t.amount, 0);
      return { day, spend };
    });
  })();
  const maxSpend = Math.max(...chartData.map(d => d.spend), 1);

  const handleAddMoney = async () => {
    const amount = parseInt(addAmount);
    if (!amount || amount < 10) return toast.error('Min. ₹10');
    if (!user) return toast.error('Please login first');
    setAdding(true);
    try {
      await addMoneyToWallet(user.uid, amount, 'Wallet Top-up');
      toast.success(`₹${amount} added to wallet!`);
      setShowAdd(false);
      setAddAmount('');
    } catch {
      toast.error('Failed to add money. Try again.');
    } finally {
      setAdding(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' • ' +
      date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="min-h-screen app-bg pb-24 md:pb-8">
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/profile" className="btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-bold text-body flex-1">My Wallet</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-4">

        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-3xl border p-6 text-center bg-gradient-to-br from-orange-400/12 to-orange-500/5 border-orange-400/20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 rounded-full bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
          <p className="text-xs font-bold uppercase tracking-widest mb-2 text-faint">Available Balance</p>
          <div className="text-6xl font-black text-body mb-1">₹{walletBalance}</div>
          <p className="text-xs mb-5 text-faint">NammaOoru Wallet</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setShowAdd(true)} className="btn-primary px-6">+ Add Money</button>
            <Link href="/shops" className="btn-secondary px-6">Use Now</Link>
          </div>
        </div>

        {/* Quick Add */}
        {showAdd && (
          <div className="glass-card p-4" style={{ animation: 'slideUp 0.3s ease' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-body">Add Money to Wallet</h3>
              <button onClick={() => { setShowAdd(false); setAddAmount(''); }} className="text-faint hover:text-secondary"><X size={18} /></button>
            </div>
            <div className="flex gap-2 flex-wrap mb-3">
              {ADD_AMOUNTS.map(a => (
                <button key={a} onClick={() => setAddAmount(a.toString())}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${addAmount === a.toString() ? 'bg-orange-500 text-white border-orange-500' : 'surface text-secondary'}`}>
                  ₹{a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={addAmount} onChange={e => setAddAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter amount" className="input-glass flex-1 text-sm" />
              <button onClick={handleAddMoney} disabled={adding}
                className="btn-primary px-5 disabled:opacity-60">
                {adding ? <Loader2 size={16} className="animate-spin" /> : 'Pay'}
              </button>
            </div>
            <p className="text-xs text-center mt-2 text-faint flex items-center justify-center gap-1"><Lock size={11} /> Secure payment via UPI / Card</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Added', value: `₹${totalAdded}`, icon: Inbox, color: '#10B981' },
            { label: 'Total Spent', value: `₹${totalSpent}`, icon: ArrowUpFromLine, color: '#EF4444' },
            { label: 'Cashback', value: `₹${totalCashback}`, icon: Gift, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} className="glass-card p-3 text-center">
              <s.icon size={18} style={{ color: s.color }} className="mx-auto" />
              <div className="text-sm font-black mt-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] mt-0.5 text-faint">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Spending Chart */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-body flex items-center gap-1.5"><BarChart3 size={15} className="text-accent" /> Spending This Week</h3>
            {totalSpent > 0 && <span className="text-xs font-bold text-red-500 dark:text-red-400">₹{totalSpent} spent</span>}
          </div>
          <div className="flex items-end gap-2 h-20">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg transition-all duration-700 relative group"
                  style={{
                    height: `${Math.max((d.spend / maxSpend) * 64, d.spend > 0 ? 8 : 2)}px`,
                    background: d.spend > 0 ? 'linear-gradient(180deg, #EF4444, rgba(239,68,68,0.4))' : 'var(--bg3)',
                    minHeight: '2px',
                  }}>
                  {d.spend > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-500 dark:text-red-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{d.spend}
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-bold text-faint">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="glass-card overflow-hidden p-0">
          <div className="p-4 border-b border-subtle flex items-center justify-between">
            <h3 className="text-sm font-bold text-body">Transaction History</h3>
            <div className="flex gap-1">
              {FILTER_TABS.map(tab => (
                <button key={tab} onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${filter === tab ? 'bg-orange-500 text-white' : 'surface text-faint'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-faint text-sm">
              {walletTransactions.length === 0 ? 'No transactions yet' : 'No transactions in this category'}
            </div>
          ) : (
            filtered.map((t, i) => (
              <React.Fragment key={t.id || i}>
                <div className="flex items-center gap-3 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${t.type === 'credit' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-body truncate">{t.desc}</p>
                    <p className="text-xs text-faint">{formatDate(t.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black" style={{ color: t.type === 'credit' ? '#10B981' : '#EF4444' }}>
                      {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                    </p>
                    {t.status === 'refunded' && <span className="text-[10px] text-blue-500 dark:text-blue-400">Refunded</span>}
                    {t.status === 'completed' && <span className="text-[10px] text-faint">Completed</span>}
                  </div>
                </div>
                {i < filtered.length - 1 && <div className="divider mx-4" />}
              </React.Fragment>
            ))
          )}
        </div>

      </div>
    </main>
  );
}
