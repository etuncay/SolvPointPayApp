import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Skeleton, WidgetCard } from '@epay/ui';
import type { LucideIcon } from 'lucide-react';

export function WidgetShell({
  icon,
  iconTone,
  titleKey,
  loading,
  error,
  onRetry,
  onFullscreen,
  count,
  countTone,
  meta,
  footerLeft,
  footerLink,
  children,
}: {
  icon: LucideIcon;
  iconTone?: 'accent' | 'warn' | 'danger' | 'ok' | 'info';
  titleKey: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onFullscreen?: () => void;
  count?: number;
  countTone?: string;
  meta?: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerLink?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <WidgetCard icon={icon} iconTone={iconTone} title={t(titleKey)} onFullscreen={onFullscreen}>
        <Skeleton style={{ height: 120, borderRadius: 8 }} />
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard
        icon={icon}
        iconTone={iconTone}
        title={t(titleKey)}
        onFullscreen={onFullscreen}
        footerLeft={footerLeft}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            padding: '24px 12px',
            textAlign: 'center',
          }}
        >
          <AlertCircle size={22} style={{ color: 'var(--danger)' }} />
          <p className="t-mute" style={{ fontSize: 13 }}>
            {t('error_loading')}
          </p>
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              <RefreshCw size={14} /> {t('try_again')}
            </Button>
          )}
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      icon={icon}
      iconTone={iconTone}
      title={t(titleKey)}
      count={count}
      countTone={countTone}
      meta={meta}
      onFullscreen={onFullscreen}
      footerLeft={footerLeft}
      footerLink={footerLink}
    >
      {children}
    </WidgetCard>
  );
}
