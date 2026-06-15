import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const alertVariants = cva('rounded-[var(--r-md)] border p-3 text-[12.5px] leading-relaxed', {
  variants: {
    variant: {
      default: 'border-[var(--line)] bg-[var(--bg-elev)] text-[var(--fg)]',
      info: 'border-transparent bg-[var(--info-soft)] text-[var(--info-fg)]',
      warn: 'border-transparent bg-[var(--warn-soft)] text-[var(--warn-fg)]',
      danger: 'border-transparent bg-[var(--danger-soft)] text-[var(--danger-fg)]',
      success: 'border-transparent bg-[var(--ok-soft)] text-[var(--ok-fg)]',
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Alert({
  className,
  variant,
  title,
  children,
  icon,
  action,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    title?: React.ReactNode;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  }) {
  return (
    <div className={cn(alertVariants({ variant }), className)} role="status" {...props}>
      <div className="flex gap-2">
        {icon && <div className="mt-[1px] shrink-0 opacity-90">{icon}</div>}
        <div className="min-w-0 flex-1">
          {title && <div className="mb-0.5 text-[12px] font-semibold">{title}</div>}
          {children && <div className="text-[12.5px] opacity-95">{children}</div>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

