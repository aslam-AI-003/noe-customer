'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import { Bike, Target, Eye, Heart, Rocket, Phone, Mail, Instagram, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen app-bg">
      <Header />
      <div className="pt-24 pb-12 max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-body mb-4">About <span className="text-accent">Namma Ooru Express</span></h1>
          <p className="text-xl text-muted">நீங்க சொல்லுங்க... நாங்க Deliver பண்றோம்!</p>
        </div>

        <Card className="mb-8">
          <h2 className="text-xl font-bold text-body mb-4 flex items-center gap-2"><Bike size={20} className="text-accent" /> Our Story</h2>
          <p className="text-muted leading-relaxed mb-4">
            Namma Ooru Express was born from a simple idea — to connect local shops with customers in Thanjavur and Kumbakonam through fast, reliable delivery. We believe every local shop deserves the power of digital ordering and home delivery.
          </p>
          <p className="text-muted leading-relaxed">
            Whether it&apos;s groceries at midnight, medicine during an emergency, or a parcel across town — we&apos;re here to deliver anything, anytime, anywhere in your ooru!
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <Target size={32} className="text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-body mb-2">Our Mission</h3>
              <p className="text-sm text-muted">Empower local businesses and provide fast doorstep delivery to every household</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <Eye size={32} className="text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-body mb-2">Our Vision</h3>
              <p className="text-sm text-muted">Become Tamil Nadu&apos;s most trusted hyperlocal delivery platform</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <Heart size={32} className="text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-body mb-2">Our Values</h3>
              <p className="text-sm text-muted">Speed, Safety, Trust, and Community-first approach</p>
            </div>
          </Card>
        </div>

        <Card className="mb-8">
          <h2 className="text-xl font-bold text-body mb-4 flex items-center gap-2"><MapPin size={20} className="text-accent" /> Service Areas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Thanjavur', 'Kumbakonam', 'Papanasam', 'Thiruvaiyaru'].map((city) => (
              <div key={city} className="p-3 surface rounded-xl text-center">
                <span className="text-sm text-secondary">{city}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-accent mt-4 flex items-center gap-1"><Rocket size={12} /> Expanding to more cities soon...</p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-body mb-4">Contact Us</h2>
          <div className="space-y-3">
            <p className="text-muted flex items-center gap-3"><Phone size={15} /> 9566700534</p>
            <p className="text-muted flex items-center gap-3"><Mail size={15} /> support@nammaooru.express</p>
            <p className="text-muted flex items-center gap-3"><Instagram size={15} /> @namba_ooru_delivery</p>
            <p className="text-muted flex items-center gap-3"><MapPin size={15} /> Thanjavur, Tamil Nadu 613001</p>
          </div>
        </Card>
      </div>
      <Footer />
    </main>
  );
}
