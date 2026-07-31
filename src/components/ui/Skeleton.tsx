'use client';

import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export default function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseStyles = 'skeleton';

  const variants = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (count === 1) {
    return <div className={clsx(baseStyles, variants[variant], className)} style={style} />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={clsx(baseStyles, variants[variant], className)} style={style} />
      ))}
    </div>
  );
}

// Pre-built skeleton patterns
export function ShopCardSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3">
      <Skeleton variant="rounded" height={120} className="w-full" />
      <Skeleton width="70%" height={16} />
      <Skeleton width="50%" height={12} />
      <div className="flex gap-3">
        <Skeleton width={60} height={24} variant="rounded" />
        <Skeleton width={80} height={24} variant="rounded" />
        <Skeleton width={60} height={24} variant="rounded" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card p-3 space-y-2">
      <Skeleton variant="rounded" height={100} className="w-full" />
      <Skeleton width="80%" height={14} />
      <Skeleton width="40%" height={12} />
      <div className="flex justify-between items-center">
        <Skeleton width={50} height={20} />
        <Skeleton width={60} height={28} variant="rounded" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton variant="circular" width={56} height={56} />
      <Skeleton width={48} height={10} />
    </div>
  );
}
