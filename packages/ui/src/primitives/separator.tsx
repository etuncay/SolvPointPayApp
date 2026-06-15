import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '../lib/utils';

export function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      decorative
      orientation={orientation}
      className={cn(orientation === 'horizontal' ? 'tb-divider' : 'h-full w-px bg-[var(--line)]', className)}
      {...props}
    />
  );
}
