import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

export function Card({ inset, className = '', children, ...props }: CardProps) {
  return (
    <div className={`ds-card ${inset ? 'ds-card--inset' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}
