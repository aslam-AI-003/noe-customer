'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Phone, MessageCircle, Mail, ChevronDown, FileText, Lock,
  Wallet, Building2, ChevronRight, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

const FAQS = [
  { q: 'How long does delivery take?', a: 'Most orders are delivered within 20–45 minutes depending on the shop and your location.' },
  { q: 'Can I cancel my order?', a: 'You can cancel your order within 2 minutes of placing it. After that, cancellation depends on the shop\'s policy.' },
  { q: 'How do I get a refund?', a: 'Refunds are processed within 3–5 business days to your original payment method or wallet.' },
  { q: 'What if my order is wrong or missing items?', a: 'Please contact us within 24 hours of delivery. We\'ll resolve it with a refund or replacement.' },
  { q: 'How does the wallet work?', a: 'Add money to your NammaOoru wallet and use it for faster checkout. Cashback is also credited to your wallet.' },
  { q: 'Is there a minimum order amount?', a: 'Minimum order varies by shop. Most shops have no minimum or a small minimum of ₹50–₹100.' },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message) return toast.error('Please fill all fields');
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll reply within 24 hours.');
    setForm({ subject: '', message: '' });
    setSending(false);
  };

  return (
    <main className="min-h-screen app-bg pb-24 md:pb-8">
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/profile" className="btn-icon"><ArrowLeft size={18} /></Link>
          <h1 className="font-bold text-body flex-1">Help & Support</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-5">
        {/* Quick Contact */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Phone, label: 'Call Us', sub: '1800-XXX-XXXX', href: 'tel:1800XXXXXXX', color: '#10B981' },
            { icon: MessageCircle, label: 'WhatsApp', sub: 'Chat now', href: 'https://wa.me/919876543210', color: '#22C55E' },
            { icon: Mail, label: 'Email', sub: 'support@noe.in', href: 'mailto:support@noe.in', color: '#3B82F6' },
          ].map(c => (
            <a key={c.label} href={c.href} target="_blank" rel="noreferrer"
              className="glass-card p-3 text-center hover:scale-105 transition-transform">
              <c.icon size={22} style={{ color: c.color }} className="mx-auto mb-1" />
              <p className="text-xs font-bold text-body">{c.label}</p>
              <p className="text-[10px] text-faint mt-0.5">{c.sub}</p>
            </a>
          ))}
        </div>

        {/* FAQs */}
        <div className="glass-card overflow-hidden p-0">
          <div className="p-4 border-b border-subtle">
            <h2 className="text-sm font-bold text-body">Frequently Asked Questions</h2>
          </div>
          {FAQS.map((faq, i) => (
            <React.Fragment key={i}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left p-4 flex items-start gap-3 hover:bg-[var(--card-hover)] transition-colors">
                <div className="flex-1">
                  <p className={`text-sm font-semibold transition-colors ${openFaq === i ? 'text-accent' : 'text-body'}`}>{faq.q}</p>
                  {openFaq === i && (
                    <p className="text-xs text-muted mt-2 leading-relaxed animate-slide-up">{faq.a}</p>
                  )}
                </div>
                <ChevronDown size={14} className={`flex-shrink-0 mt-0.5 text-faint transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {i < FAQS.length - 1 && <div className="divider mx-4" />}
            </React.Fragment>
          ))}
        </div>

        {/* Contact Form */}
        <div className="glass-card p-4">
          <h2 className="text-sm font-bold text-body mb-4">Send us a message</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Subject</label>
              <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input-glass text-sm">
                <option value="">Select a topic</option>
                <option value="order">Order Issue</option>
                <option value="payment">Payment Problem</option>
                <option value="delivery">Delivery Issue</option>
                <option value="refund">Refund Request</option>
                <option value="account">Account Help</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Message</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder="Describe your issue in detail..." className="input-glass text-sm resize-none" rows={4} />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full py-3 disabled:opacity-60 flex items-center justify-center gap-2">
              {sending ? 'Sending...' : <>Send Message <Send size={14} /></>}
            </button>
          </form>
        </div>

        {/* Links */}
        <div className="glass-sm overflow-hidden">
          {[
            { icon: FileText, label: 'Terms of Service', href: '/terms' },
            { icon: Lock, label: 'Privacy Policy', href: '/privacy' },
            { icon: Wallet, label: 'Refund Policy', href: '/refund' },
            { icon: Building2, label: 'About NammaOoru', href: '/about' },
          ].map((item, i) => (
            <React.Fragment key={item.href}>
              <Link href={item.href} className="flex items-center gap-3 p-4 hover:bg-[var(--card-hover)] transition-colors">
                <item.icon size={16} className="text-secondary" />
                <span className="text-sm text-secondary flex-1">{item.label}</span>
                <ChevronRight size={14} className="text-faint" />
              </Link>
              {i < 3 && <div className="divider mx-4" />}
            </React.Fragment>
          ))}
        </div>

        <p className="text-center text-xs text-faint pb-2">
          NammaOoru Express • Thanjavur, Tamil Nadu<br />
          Available 8 AM – 10 PM daily
        </p>
      </div>
    </main>
  );
}
