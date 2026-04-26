'use client';

import { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

interface NavItemProps {
  href: string;
  active?: boolean;
  icon?: ReactNode;
  badge?: number;
  children: ReactNode;
}

export function NavItem({ href, active, icon, badge, children }: NavItemProps) {
  return (
    <Link href={href} className={`ds-nav__item ${active ? 'ds-nav__item--active' : ''}`}>
      {icon && <span className="ds-nav__icon">{icon}</span>}
      <span>{children}</span>
      {badge != null && badge > 0 && <span className="ds-pill ds-pill--warn" style={{ marginLeft: 'auto' }}>{badge}</span>}
    </Link>
  );
}
