'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MapPin } from 'lucide-react';

export default function CareersPage() {
  const jobs = [
    { title: 'Operations Manager', location: 'Thanjavur', type: 'Full-time' },
    { title: 'Customer Support Executive', location: 'Thanjavur', type: 'Full-time' },
    { title: 'Marketing Intern', location: 'Remote', type: 'Internship' },
    { title: 'Delivery Operations Lead', location: 'Kumbakonam', type: 'Full-time' },
  ];

  return (
    <main className="min-h-screen app-bg">
      <Header />
      <div className="pt-24 pb-12 max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-body mb-4">Join Our <span className="text-accent">Team</span></h1>
          <p className="text-muted">Build the future of hyperlocal delivery</p>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.title} hover>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-body">{job.title}</h3>
                  <p className="text-sm text-muted flex items-center gap-1"><MapPin size={13} /> {job.location} • {job.type}</p>
                </div>
                <Button size="sm">Apply</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
