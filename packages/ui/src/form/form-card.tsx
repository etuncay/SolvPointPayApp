import * as React from 'react';
import { cn } from '../lib/utils';

export function FormCard({
  id,
  no,
  title,
  meta,
  icon,
  children,
  padless,
  className,
}: {
  id?: string;
  no?: string;
  title: string;
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  padless?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={cn('fcard', className)}>
      <div className="fcard-head">
        {icon && (
          <div className="card-icon" style={{ width: 26, height: 26 }}>
            {icon}
          </div>
        )}
        {no && <span className="no">{no}</span>}
        <h3>{title}</h3>
        {meta && <span className="meta">{meta}</span>}
      </div>
      <div className={cn('fcard-body', padless && 'padless')}>{children}</div>
    </section>
  );
}

export function FormGrid({
  cols = 4,
  children,
  className,
}: {
  cols?: 2 | 4;
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('fgrid', cols === 2 && 'cols-2', className)}>{children}</div>;
}
