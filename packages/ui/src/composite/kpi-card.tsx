import * as React from 'react';
import { cn } from '../lib/utils';

export function KpiCard({
  label,
  value,
  sub,
  action,
  icon,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('stat-tile', className)}>
      <span className="lbl">
        {icon}
        {label}
      </span>
      <span className="val">{value}</span>
      {sub && <span className="sub">{sub}</span>}
      {action}
    </div>
  );
}

export function KpiStrip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('stat-strip', className)}>{children}</div>;
}
