'use client';

import { HTMLAttributes } from 'react';

type BannerVariant = 'paper' | 'live' | 'kill';

interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  variant: BannerVariant;
}

export function Banner({ variant, className = '', children, ...props }: BannerProps) {
  return (
    <div className={`ds-banner ds-banner--${variant} ${className}`} {...props}>
      {children}
    </div>
  );
}
