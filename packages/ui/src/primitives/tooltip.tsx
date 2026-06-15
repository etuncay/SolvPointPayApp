import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={className}
        style={{
          background: 'var(--fg)',
          color: 'var(--bg-elev)',
          fontSize: 11,
          padding: '4px 8px',
          borderRadius: 4,
        }}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
