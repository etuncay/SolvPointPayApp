import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const pillVariants = cva('', {
  variants: {
    tone: {
      default: 'kyc-pill',
      l0: 'kyc-pill l0',
      l1: 'kyc-pill l1',
      l2: 'kyc-pill l2',
      l3: 'kyc-pill l3',
      ok: 'kyc-pill ok',
      pending: 'kyc-pill pending',
      rejected: 'kyc-pill rejected',
      corp: 'type-badge corp',
      indv: 'type-badge indv',
      pros: 'type-badge pros',
      st: 'st',
    },
  },
  defaultVariants: { tone: 'default' },
});

export function Pill({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof pillVariants>) {
  return <span className={cn(pillVariants({ tone }), className)} {...props} />;
}
