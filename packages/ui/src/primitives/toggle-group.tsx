import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const toggleGroupItemVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] border text-[12px] font-medium',
  {
    variants: {
      variant: {
        default: 'border-[var(--line)] bg-[var(--bg-elev)] text-[var(--fg)] hover:bg-[var(--bg-hover)]',
        ghost: 'border-transparent bg-transparent text-[var(--fg)] hover:bg-[var(--bg-hover)]',
      },
      size: {
        sm: 'h-7 px-2',
        md: 'h-8 px-2.5',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export const ToggleGroup = ToggleGroupPrimitive.Root;

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleGroupItemVariants>
>(({ className, variant, size, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      toggleGroupItemVariants({ variant, size }),
      'data-[state=on]:border-transparent data-[state=on]:bg-[var(--accent-soft)] data-[state=on]:text-[var(--accent-fg)]',
      className,
    )}
    {...props}
  />
));
ToggleGroupItem.displayName = 'ToggleGroupItem';

