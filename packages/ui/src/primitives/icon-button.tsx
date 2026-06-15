import * as React from 'react';
import { cn } from '../lib/utils';

export const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { dot?: boolean }
>(({ className, dot, children, ...props }, ref) => (
  <button ref={ref} type="button" className={cn('icon-btn', className)} {...props}>
    {children}
    {dot && <span className="dot" />}
  </button>
));
IconButton.displayName = 'IconButton';
