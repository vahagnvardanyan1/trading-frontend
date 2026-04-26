import { HTMLAttributes } from 'react';

type KPIVariant = 'default' | 'paper' | 'live';
type DeltaDir = 'up' | 'down' | 'flat';

interface KPIProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  delta?: string;
  deltaDir?: DeltaDir;
  variant?: KPIVariant;
}

export function KPI({ label, value, delta, deltaDir = 'flat', variant = 'default', className = '', ...props }: KPIProps) {
  const varCls = variant === 'default' ? '' : ` ds-kpi--${variant}`;
  const deltaCls = deltaDir === 'flat' ? '' : ` ds-kpi__delta--${deltaDir}`;

  return (
    <div className={`ds-kpi${varCls} ${className}`} {...props}>
      <span className="ds-kpi__label">{label}</span>
      <span className="ds-kpi__value">{value}</span>
      {delta && <span className={`ds-kpi__delta${deltaCls}`}>{delta}</span>}
    </div>
  );
}
