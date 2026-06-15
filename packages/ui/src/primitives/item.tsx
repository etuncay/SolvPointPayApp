import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const itemVariants = cva('item', {
  variants: {
    variant: {
      default: '',
      outline: 'item--outline',
      muted: 'item--muted',
    },
    size: {
      default: '',
      sm: 'item--sm',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

export interface ItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemVariants> {
  asChild?: boolean;
}

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return <Comp ref={ref} className={cn(itemVariants({ variant, size }), className)} {...props} />;
  },
);
Item.displayName = 'Item';

export const ItemGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="list" className={cn('item-group', className)} {...props} />
  ),
);
ItemGroup.displayName = 'ItemGroup';

export const ItemSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn('item-separator', className)} {...props} />
  ),
);
ItemSeparator.displayName = 'ItemSeparator';

const itemMediaVariants = cva('item-media', {
  variants: {
    variant: {
      default: '',
      icon: 'item-media--icon',
      image: 'item-media--image',
    },
  },
  defaultVariants: { variant: 'default' },
});

export const ItemMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof itemMediaVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(itemMediaVariants({ variant }), className)} {...props} />
));
ItemMedia.displayName = 'ItemMedia';

export const ItemContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('item-content', className)} {...props} />
  ),
);
ItemContent.displayName = 'ItemContent';

export const ItemTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('item-title', className)} {...props} />
  ),
);
ItemTitle.displayName = 'ItemTitle';

export const ItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('item-description', className)} {...props} />
));
ItemDescription.displayName = 'ItemDescription';

export const ItemActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('item-actions', className)} {...props} />
  ),
);
ItemActions.displayName = 'ItemActions';

export const ItemHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('item-header', className)} {...props} />
  ),
);
ItemHeader.displayName = 'ItemHeader';

export const ItemFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('item-footer', className)} {...props} />
  ),
);
ItemFooter.displayName = 'ItemFooter';
