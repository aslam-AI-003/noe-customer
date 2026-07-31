'use client';

import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'outline';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({
  children,
  className,
  variant = 'glass',
  hover = false,
  padding = 'md',
  onClick,
}: CardProps) {
  const variants = {
    glass: 'surface',
    solid: 'surface',
    outline: 'bg-transparent border border-subtle',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'rounded-2xl',
        variants[variant],
        paddings[padding],
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] hover:border-orange-400/25 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
