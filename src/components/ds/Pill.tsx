import { HTMLAttributes } from 'react';

type PillVariant = 'default' | 'success' | 'danger' | 'warn' | 'info' | 'accent' | 'paper' | 'live';

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant;
}

export function Pill({ variant = 'default', className = '', children, ...props }: PillProps) {
  const cls = variant === 'default' ? 'ds-pill' : `ds-pill ds-pill--${variant}`;
  return (
    <span className={`${cls} ${className}`} {...props}>
      {children}
    </span>
  );
}
