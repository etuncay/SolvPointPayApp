import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../lib/utils';
import { IconButton } from './icon-button';

export function CopyButton({
  value,
  className,
  onCopied,
  'aria-label': ariaLabel = 'Kopyala',
}: {
  value: string;
  className?: string;
  onCopied?: () => void;
  'aria-label'?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  return (
    <IconButton
      className={cn(className)}
      aria-label={ariaLabel}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        onCopied?.();
        window.setTimeout(() => setCopied(false), 900);
      }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </IconButton>
  );
}

