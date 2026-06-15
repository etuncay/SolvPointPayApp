import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fmtNumber } from '@/lib/format';
import { useWidgetNavigation } from '../hooks/use-widget-navigation';
import { useWidgetData } from '../hooks/use-dashboard';
import { WidgetShell } from './widget-shell';
import type { WidgetProps } from './widget-props';

export function WNewCustomers(props: WidgetProps) {
  const { t, i18n } = useTranslation();
  const { onFullscreen } = props;
  const { data, error, loading, refreshedAt, refresh } = useWidgetData('new_customers');
  const { goToWidget } = useWidgetNavigation();

  const series = data ?? [];
  const today = series[series.length - 1]?.count ?? 0;
  const max = Math.max(...series.map((d) => d.count), 1);

  const timeLabel = refreshedAt
    ? refreshedAt.toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : t('now');

  return (
    <WidgetShell
      icon={UserPlus}
      iconTone="accent"
      titleKey="w_new_customers"
      loading={loading}
      error={error}
      onRetry={refresh}
      onFullscreen={onFullscreen}
      footerLeft={
        <>
          {t('last_updated')} · {timeLabel}
        </>
      }
      footerLink={
        <button
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
          onClick={() => goToWidget('new_customers')}
        >
          {t('view_all')} →
        </button>
      }
    >
      <div className="kpi-row" style={{ paddingBottom: 4 }}>
        <div className="kpi">
          <span className="kpi-label">{t('today')}</span>
          <span className="kpi-value">{fmtNumber(today, i18n.language)}</span>
        </div>
      </div>
      <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        {series.map((d) => (
          <div
            key={d.day}
            style={{
              flex: 1,
              height: `${(d.count / max) * 100}%`,
              minHeight: 2,
              background: 'var(--accent-soft)',
              borderTop: '2px solid var(--accent)',
            }}
          />
        ))}
      </div>
    </WidgetShell>
  );
}
