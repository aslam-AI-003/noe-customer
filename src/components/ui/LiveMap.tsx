'use client';

import React, { useEffect, useRef, useState } from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIVE MAP — Leaflet + OpenStreetMap (FREE, no API key)
// Shows: Shop pin, Customer pin, Rider moving pin
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MapPin {
  lat: number;
  lng: number;
  label: string;
  type: 'shop' | 'customer' | 'rider';
  popup?: string;
}

interface LiveMapProps {
  pins: MapPin[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  showRoute?: boolean;
  animateRider?: boolean;
}

export default function LiveMap({
  pins,
  center,
  zoom = 14,
  className = 'h-64 w-full rounded-2xl',
  showRoute = true,
  animateRider = true,
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load Leaflet CSS + JS (client-only)
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      // Add Leaflet CSS if not already added
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Import Leaflet
      const L = (await import('leaflet')).default;

      if (!mapRef.current || mapInstanceRef.current) return;

      // Default center (Thanjavur)
      const mapCenter = center || (pins.length > 0
        ? { lat: pins[0].lat, lng: pins[0].lng }
        : { lat: 10.787, lng: 79.138 });

      // Create map
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([mapCenter.lat, mapCenter.lng], zoom);

      // Add OpenStreetMap tiles (FREE!)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control (bottom-right)
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      setLoaded(true);

      // Add pins
      updatePins(L, map, pins);

      // Fit bounds to show all pins
      if (pins.length > 1) {
        const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update pins when they change (rider moving)
  useEffect(() => {
    if (!mapInstanceRef.current || !loaded) return;

    const loadAndUpdate = async () => {
      const L = (await import('leaflet')).default;
      updatePins(L, mapInstanceRef.current, pins);
    };

    loadAndUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins, loaded]);

  const updatePins = (L: any, map: any, currentPins: MapPin[]) => {
    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    currentPins.forEach(pin => {
      // Custom icon based on type
      const iconHtml = getMarkerIcon(pin.type);
      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-map-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(map);

      if (pin.popup || pin.label) {
        marker.bindPopup(`
          <div style="font-size:12px;font-weight:bold;text-align:center;min-width:80px;">
            ${pin.popup || pin.label}
          </div>
        `);
      }

      markersRef.current.push(marker);
    });

    // Draw route line between pins
    if (showRoute && currentPins.length >= 2) {
      const routeCoords = currentPins.map(p => [p.lat, p.lng]);
      const polyline = L.polyline(routeCoords, {
        color: '#8b5cf6',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 8',
      }).addTo(map);
      markersRef.current.push(polyline);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full z-0" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg2)] animate-pulse">
          <div className="text-center">
            <span className="text-2xl">🗺️</span>
            <p className="text-xs text-muted mt-1">Loading map...</p>
          </div>
        </div>
      )}
      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-[1000] surface rounded-lg px-2 py-1.5 flex items-center gap-2 text-[9px]">
        <span className="flex items-center gap-1">🏪 Shop</span>
        <span className="flex items-center gap-1">📍 You</span>
        <span className="flex items-center gap-1">🛵 Rider</span>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Custom marker icons (emoji-based, no external images)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getMarkerIcon(type: MapPin['type']): string {
  switch (type) {
    case 'shop':
      return `<div style="background:#f97316;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(249,115,22,0.4);border:2px solid white;">🏪</div>`;
    case 'customer':
      return `<div style="background:#10b981;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(16,185,129,0.4);border:2px solid white;">📍</div>`;
    case 'rider':
      return `<div style="background:#8b5cf6;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 12px rgba(139,92,246,0.5);border:2px solid white;animation:pulse 2s infinite;">🛵</div>`;
    default:
      return `<div style="background:#6366f1;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">📌</div>`;
  }
}
