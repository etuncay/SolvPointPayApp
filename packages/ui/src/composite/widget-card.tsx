import * as React from 'react';
import { Maximize2, MoreHorizontal } from 'lucide-react';
import { Card, CardBody, CardFooter, CardHeader } from '../primitives/card';
import { IconButton } from '../primitives/icon-button';
import { cn } from '../lib/utils';

const iconToneMap = {
  accent: 'accent',
  warn: 'warn',
  danger: 'danger',
  ok: 'ok',
  info: 'info',
} as const;

export function WidgetCard({
  icon: Icon,
  iconTone = 'accent',
  title,
  count,
  countTone,
  meta,
  onFullscreen,
  footerLeft,
  footerLink,
  children,
  className,
}: {
  icon?: React.ComponentType<{ size?: number }>;
  iconTone?: keyof typeof iconToneMap;
  title: string;
  count?: number | string;
  countTone?: string;
  meta?: React.ReactNode;
  onFullscreen?: () => void;
  footerLeft?: React.ReactNode;
  footerLink?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        {Icon && (
          <div className={cn('card-icon', iconToneMap[iconTone])}>
            <Icon size={14} />
          </div>
        )}
        <h3 className="card-title">{title}</h3>
        {count != null && (
          <span className={cn('card-count', countTone)}>{count}</span>
        )}
        <div className="card-meta">
          {meta}
          {onFullscreen && (
            <IconButton onClick={onFullscreen} aria-label="Tam ekran" style={{ width: 24, height: 24 }}>
              <Maximize2 size={13} />
            </IconButton>
          )}
          <IconButton aria-label="Daha fazla" style={{ width: 24, height: 24 }}>
            <MoreHorizontal size={14} />
          </IconButton>
        </div>
      </CardHeader>
      <CardBody>{children}</CardBody>
      {(footerLeft || footerLink) && (
        <CardFooter>
          <span className="t-mute">{footerLeft}</span>
          {footerLink}
        </CardFooter>
      )}
    </Card>
  );
}
