import * as React from 'react';

export function PageHead({
  title,
  subtitle,
  status,
  meta,
  actions,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  status?: React.ReactNode;
  /** @deprecated status ile aynı satırda; yeni ekranlarda status tercih edin */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {title}
          {status ?? meta}
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="head-actions">{actions}</div>}
    </div>
  );
}
