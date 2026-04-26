import { HTMLAttributes } from 'react';

export function CodeBlock({ className = '', children, ...props }: HTMLAttributes<HTMLPreElement>) {
  return (
    <pre className={`ds-code ${className}`} {...props}>
      {children}
    </pre>
  );
}
