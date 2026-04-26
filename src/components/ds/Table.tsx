import { TableHTMLAttributes } from 'react';

export function Table({ className = '', children, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="ds-table-wrap">
      <table className={`ds-table ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}
