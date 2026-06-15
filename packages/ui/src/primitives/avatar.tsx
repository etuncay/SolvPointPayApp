import * as React from 'react';
import { cn } from '../lib/utils';

export function Avatar({
  className,
  children,
  variant = 'indv-m',
  size = 26,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'indv-m' | 'indv-f' | 'corp' | 'pros';
  size?: number;
}) {
  return (
    <span
      className={cn('avatar', variant, className)}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      {...props}
    >
      {children}
    </span>
  );
}
