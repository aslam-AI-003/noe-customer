'use client';

import React, { useState, useEffect } from 'react';
import { type Theme, getResolvedTheme, applyTheme, getStoredTheme, storeTheme } from '@/lib/theme';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ThemeToggle — Dark / Light / System switcher
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ThemeToggleProps {
  variant?: 'icon' | 'full' | 'pill';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(getStoredTheme());

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const current = getStoredTheme();
      if (current === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const cycleTheme = () => {
    const order: Theme[] = ['dark', 'light', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    storeTheme(next);
    applyTheme(next);
  };

  const setSpecificTheme = (t: Theme) => {
    setTheme(t);
    storeTheme(t);
    applyTheme(t);
  };

  if (!mounted) return null;

  const resolved = getResolvedTheme(theme);
  const isDark = resolved === 'dark';

  // Icon-only variant (for header)
  if (variant === 'icon') {
    return (
      <button
        onClick={cycleTheme}
        className={`btn-icon relative group ${className}`}
        aria-label={`Theme: ${theme}. Click to switch.`}
        title={`Theme: ${theme === 'system' ? `System (${resolved})` : theme}`}
      >
        {/* Sun icon */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`absolute transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        {/* Moon icon */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        {/* System indicator dot */}
        {theme === 'system' && (
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-400" />
        )}
      </button>
    );
  }

  // Full variant (for profile/settings page)
  if (variant === 'full') {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="text-sm font-bold text-white/70">Appearance</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: 'dark' as Theme, icon: '🌙', label: 'Dark' },
            { id: 'light' as Theme, icon: '☀️', label: 'Light' },
            { id: 'system' as Theme, icon: '💻', label: 'System' },
          ]).map((option) => (
            <button
              key={option.id}
              onClick={() => setSpecificTheme(option.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                theme === option.id
                  ? 'bg-yellow-400/10 border-yellow-400/30 shadow-lg'
                  : 'glass-card-hover border-transparent'
              }`}
            >
              <div className="text-xl mb-1">{option.icon}</div>
              <span className={`text-xs font-bold ${theme === option.id ? 'text-yellow-400' : 'text-white/50'}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Pill variant (compact for nav)
  return (
    <div className={`flex items-center gap-1 p-1 rounded-full glass-sm ${className}`}>
      {(['dark', 'light', 'system'] as Theme[]).map((t) => (
        <button
          key={t}
          onClick={() => setSpecificTheme(t)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
            theme === t ? 'bg-yellow-400 text-black' : 'text-white/40 hover:text-white/70'
          }`}
        >
          {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '💻'}
        </button>
      ))}
    </div>
  );
}
