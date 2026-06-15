import * as React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '../lib/utils';

/** Rol bazlı görünürlük bilgi şeridi (Dijital Cüzdanlar vb.) */
export function RoleHint({
  children,
  icon,
  className,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('role-hint', className)}>
      <div className="ic">{icon ?? <Shield size={13} />}</div>
      <span>{children}</span>
    </div>
  );
}
