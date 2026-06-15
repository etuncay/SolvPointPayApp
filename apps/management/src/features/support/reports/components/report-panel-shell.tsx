import type { LucideIcon } from 'lucide-react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Skeleton, WidgetCard } from '@epay/ui';
import type { PanelState } from '../domain/types';

export function ReportPanelShell({
  icon,
  iconTone = 'accent',
  titleKey,
  state,
  onRetry,
  onFullscreen,
  count,
  countTone,
  children,
}: {
  icon: LucideIcon;
  iconTone?: 'accent' | 'warn' | 'danger' | 'ok' | 'info';
  titleKey: string;
  state?: PanelState<unknown>;
  onRetry?: () => void;
  onFullscreen?: () => void;
  count?: number;
  countTone?: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  if (!state || state.status === 'loading') {
    return (
      <WidgetCard icon={icon} iconTone={iconTone} title={t(titleKey)} onFullscreen={onFullscreen}>
        <Skeleton style={{ height: 120, borderRadius: 8 }} />
      </WidgetCard>
    );
  }

  if (state.status === 'error') {
    return (
      <WidgetCard icon={icon} iconTone={iconTone} title={t(titleKey)} onFullscreen={onFullscreen}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 24 }}>
          <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
          <p className="t-mute fs-12">{t(state.message, state.message)}</p>
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
      onFullscreen={onFullscreen}
      footerLink={
        onFullscreen ? (
          <button
            type="button"
            className="link-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
            onClick={onFullscreen}
          >
            {t('scr_fullscreen')} →
          </button>
        ) : undefined
      }
    >
      {children}
    </WidgetCard>
  );
}
