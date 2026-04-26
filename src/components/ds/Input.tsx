'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className = '', ...props }, ref) => {
    return (
      <div>
        {label && <label className="ds-label" htmlFor={id}>{label}</label>}
        <input ref={ref} id={id} className={`ds-input ${className}`} {...props} />
      </div>
    );
  },
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, id, className = '', ...props }, ref) => {
    return (
      <div>
        {label && <label className="ds-label" htmlFor={id}>{label}</label>}
        <textarea ref={ref} id={id} className={`ds-input ${className}`} {...props} />
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
