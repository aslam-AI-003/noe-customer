'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Rocket, Wallet, TrendingUp, Users, FileText } from 'lucide-react';

export default function FranchisePage() {
  return (
    <main className="min-h-screen app-bg">
      <Header />
      <div className="pt-24 pb-12 max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-body mb-4 flex items-center justify-center gap-2"><Rocket size={32} className="text-accent" /> Franchise <span className="text-accent">Opportunity</span></h1>
          <p className="text-muted text-lg">Start your own delivery business with Namma Ooru Express</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Wallet, title: 'Low Investment', desc: 'Start with just ₹2-5 Lakhs' },
            { icon: TrendingUp, title: 'High Returns', desc: 'ROI within 6-12 months' },
            { icon: Users, title: 'Full Support', desc: 'Technology + Training + Marketing' },
          ].map((item) => (
            <Card key={item.title} className="text-center">
              <item.icon size={32} className="text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-body mb-2">{item.title}</h3>
              <p className="text-sm text-muted">{item.desc}</p>
            </Card>
          ))}
        </div>

        <Card>
          <h2 className="text-xl font-bold text-body mb-6 flex items-center gap-2"><FileText size={20} className="text-accent" /> Apply for Franchise</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="Your name" />
            <Input label="Phone" placeholder="Phone number" />
            <Input label="City" placeholder="Which city?" />
            <Input label="Investment Budget" placeholder="e.g., 3 Lakhs" />
          </div>
          <Button className="w-full mt-6">Submit Franchise Application</Button>
        </Card>
      </div>
      <Footer />
    </main>
  );
}
