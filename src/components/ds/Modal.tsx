'use client';

import { HTMLAttributes, useEffect } from 'react';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
}

export function Modal({ open, onClose, className = '', children, ...props }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ds-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
      <div className={`ds-modal ${className}`} {...props}>
        {children}
      </div>
    </div>
  );
}
