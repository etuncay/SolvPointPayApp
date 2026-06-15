import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonGroupVariants = cva('btn-group', {
  variants: {
    orientation: {
      horizontal: 'btn-group--horizontal',
      vertical: 'btn-group--vertical',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation, ...props }, ref) => (
    <div ref={ref} role="group" className={cn(buttonGroupVariants({ orientation }), className)} {...props} />
  ),
);
ButtonGroup.displayName = 'ButtonGroup';

export const ButtonGroupText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('btn-group-text', className)} {...props} />
));
ButtonGroupText.displayName = 'ButtonGroupText';

export const ButtonGroupSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: 'horizontal' | 'vertical' }
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation={orientation}
    className={cn('btn-group-separator', className)}
    {...props}
  />
));
ButtonGroupSeparator.displayName = 'ButtonGroupSeparator';
