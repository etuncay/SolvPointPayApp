import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva('badge', {
  variants: {
    tone: {
      default: 'muted',
      accent: 'accent',
      warn: 'warn',
      danger: 'danger',
      ok: 'ok',
      info: 'info',
    },
  },
  defaultVariants: { tone: 'default' },
});

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
