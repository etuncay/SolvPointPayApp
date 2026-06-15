import { useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fmtMoney, fmtNumber } from '@/lib/format';
import { WidgetSegment } from '../components/widget-segment';
import { useWidgetNavigation } from '../hooks/use-widget-navigation';
import { useWidgetData } from '../hooks/use-dashboard';
import { WidgetShell } from './widget-shell';
import { type WidgetProps } from './widget-props';

type Tab = 'received' | 'paid';

export function WTopAgents({ detailLevel, onFullscreen, mode = 'compact' }: WidgetProps) {
  const { t, i18n } = useTranslation();
  const { goToWidget } = useWidgetNavigation();
  const { data, error, loading, refreshedAt, refresh } = useWidgetData('top_agents');
  const [tab, setTab] = useState<Tab>('received');

  const sorted = useMemo(() => {
    const list = [...(data ?? [])];
    list.sort((a, b) => b[tab] - a[tab]);
    return list;
  }, [data, tab]);

  if (!data && !loading && !error) return null;

  const maxRows = mode === 'scr_fullscreen' ? sorted.length : 10;
  const visible = sorted.slice(0, maxRows);
  const maxVal = visible[0]?.[tab] ?? 1;

  const timeLabel = refreshedAt
    ? refreshedAt.toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : t('now');

  const segment = (
    <WidgetSegment
      value={tab}
      onChange={(id) => setTab(id as Tab)}
      options={[
        { id: 'received', label: t('dash_seg_receiver') },
        { id: 'paid', label: t('dash_seg_payout') },
      ]}
    />
  );

  return (
    <WidgetShell
      icon={Building2}
      iconTone="warn"
      titleKey="w_top_agents"
      meta={detailLevel === 'compact' ? segment : undefined}
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
          className="link-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
          onClick={() => goToWidget('top_agents')}
        >
          {t('view_all')} →
        </button>
      }
    >
      {detailLevel !== 'compact' && <div style={{ padding: '0 14px 8px' }}>{segment}</div>}
      <div className="card-body padded" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {visible.map((row, i) => {
          const value = row[tab];
          const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
          return (
            <div
              key={`${row.name}-${i}`}
              className="dashboard-rank-row linkable"
              style={{ gridTemplateColumns: '22px 1fr auto auto' }}
            >
              <span className="mono fs-11 t-mute" style={{ textAlign: 'right' }}>
                {i + 1}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.name}
                </div>
                <div className="dashboard-rank-bar dashboard-rank-bar--warn">
                  <span style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="mono fs-11 t-mute">
                {fmtNumber(row.txCount, i18n.language)} {t('dash_tx_short')}
              </span>
              <span className="amount fs-12">{fmtMoney(value, i18n.language)}</span>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}
