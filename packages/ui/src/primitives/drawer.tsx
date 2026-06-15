import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from '../lib/utils';

export const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);

export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerClose = DrawerPrimitive.Close;

export function DrawerCloseButton({ onClick }: { onClick?: () => void }) {
  return (
    <DrawerClose asChild>
      <button type="button" className="icon-btn" onClick={onClick} aria-label="Kapat">
        ×
      </button>
    </DrawerClose>
  );
}

export function DrawerContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & { side?: 'right' | 'left' }) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="drawer-backdrop open" />
      <DrawerPrimitive.Content
        className={cn('drawer open', side === 'left' && 'left-0', className)}
        {...props}
      >
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}

export function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('drawer-head', className)} {...props} />;
}

export function DrawerBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('drawer-body', className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('drawer-foot', className)} {...props} />;
}
