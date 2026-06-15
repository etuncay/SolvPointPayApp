import * as React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { cn } from '../lib/utils';

export function QRCode({
  value,
  size = 160,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-grid place-items-center rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--bg-elev)] p-3',
        className,
      )}
    >
      <QRCodeCanvas value={value} size={size} bgColor="transparent" fgColor="currentColor" />
    </div>
  );
}

