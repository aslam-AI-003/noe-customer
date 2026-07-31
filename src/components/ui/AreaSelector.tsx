'use client';

import React, { useState } from 'react';
import { MapPin, ChevronDown, Search, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SERVICE_AREAS, getAreaById, getAreaFromGPS } from '@/lib/serviceAreas';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AREA SELECTOR — Thanjavur-Kumbakonam corridor
// Customer selects their area to see relevant shops
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function AreaSelector() {
  const { selectedAreaId, setSelectedArea } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentArea = getAreaById(selectedAreaId) || SERVICE_AREAS[0];

  const filteredAreas = searchQuery
    ? SERVICE_AREAS.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.nameTamil.includes(searchQuery) ||
        a.pincode.includes(searchQuery)
      )
    : SERVICE_AREAS;

  const handleGPSDetect = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const area = getAreaFromGPS(pos.coords.latitude, pos.coords.longitude);
        if (area) {
          setSelectedArea(area.id);
          setShowModal(false);
        } else {
          alert('Sorry! We currently serve only Thanjavur-Kumbakonam area (60km corridor). Your location is outside our service area.');
        }
      },
      () => alert('GPS permission denied. Please select your area manually.')
    );
  };

  return (
    <>
      {/* Compact Area Display (for header) */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
      >
        <MapPin size={13} className="text-accent flex-shrink-0" />
        <span className="text-xs font-bold text-body truncate max-w-[80px] sm:max-w-[120px]">
          {currentArea.name}
        </span>
        <ChevronDown size={11} className="text-faint" />
      </button>

      {/* Area Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md max-h-[85vh] bg-[var(--bg1)] rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[var(--bg1)] border-b border-subtle px-4 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-black text-body">📍 Select Your Area</h2>
                  <p className="text-[10px] text-faint">Thanjavur - Kumbakonam corridor</p>
                </div>
                <button onClick={() => setShowModal(false)} className="btn-icon">
                  <X size={16} />
                </button>
              </div>

              {/* GPS Detect Button */}
              <button
                onClick={handleGPSDetect}
                className="w-full mb-3 flex items-center justify-center gap-2 py-2.5 bg-accent/10 border border-accent/20 rounded-xl text-xs font-bold text-accent active:scale-[0.98] transition-all"
              >
                <MapPin size={14} /> Detect My Location (GPS)
              </button>

              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search area, town, pincode..."
                  className="input-glass pl-9 text-xs py-2.5 w-full"
                  autoFocus
                />
              </div>
            </div>

            {/* Area List */}
            <div className="overflow-y-auto max-h-[50vh] p-3 space-y-1">
              {filteredAreas.map(area => (
                <button
                  key={area.id}
                  onClick={() => { setSelectedArea(area.id); setShowModal(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    area.id === selectedAreaId
                      ? 'bg-accent/10 border border-accent/30'
                      : 'hover:bg-[var(--card-hover)]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    area.type === 'city' ? 'bg-orange-500/10' :
                    area.type === 'town' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
                  }`}>
                    {area.type === 'city' ? '🏙️' : area.type === 'town' ? '🏘️' : '🌾'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-body">{area.name}</p>
                    <p className="text-[10px] text-faint">{area.nameTamil} • {area.pincode}</p>
                  </div>
                  {area.id === selectedAreaId && (
                    <span className="text-accent text-xs font-bold">✓</span>
                  )}
                </button>
              ))}

              {filteredAreas.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-muted">No areas found for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-[10px] text-faint mt-1">We serve Thanjavur-Kumbakonam area only</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
