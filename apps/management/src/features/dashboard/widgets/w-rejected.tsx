import { Ban } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@epay/ui';
import { fmtAge, fmtMoney } from '@/lib/format';
import { DashCustAvatar } from '../components/dash-cust-avatar';
import { useWidgetData } from '../hooks/use-dashboard';
import { WidgetTable } from './widget-table';
import type { WidgetProps } from './widget-props';

export function WRejected({ detailLevel, ...props }: WidgetProps) {
  const { t, i18n } = useTranslation();
  const { data, error, loading, refreshedAt, refresh } = useWidgetData('rejected');
  if (!data && !loading && !error) return null;

  const compact = detailLevel === 'compact';
  const rej = (data ?? []).filter((r) => r.state === 'rejected').length;
  const cnc = (data ?? []).filter((r) => r.state === 'cancelled').length;

  const rows = (data ?? []).map((r, i) => {
    const stateBadge = (
      <Badge key="s" tone={r.state === 'rejected' ? 'danger' : 'default'}>
        {r.state === 'rejected' ? t('sc_chip_rejected') : t('s_cancelled')}
      </Badge>
    );

    if (compact) {
      return [
        <span key="id" className="mono">
          {r.id}
        </span>,
        <DashCustAvatar key="cust" name={r.customer} idx={i + 3} />,
        <span key="reason" className="t-soft">
          {r.reason ?? '—'}
        </span>,
        stateBadge,
        fmtMoney(r.amount, i18n.language),
      ];
    }

    return [
      <span key="id" className="mono">
        {r.id}
      </span>,
      <DashCustAvatar key="cust" name={r.customer} idx={i + 3} />,
      r.reason ?? '—',
      fmtMoney(r.amount, i18n.language),
      fmtAge(r.age, i18n.language),
      stateBadge,
    ];
  });

  return (
    <WidgetTable
      {...props}
      detailLevel={detailLevel}
      widgetCode="rejected"
      icon={Ban}
      titleKey="w_rejected"
      meta={
        compact ? (
          <span className="fs-11 t-mute">
            <span className="mono" style={{ color: 'var(--danger-fg)' }}>
              {rej}
            </span>{' '}
            + <span className="mono">{cnc}</span>
          </span>
        ) : undefined
      }
      count={compact ? undefined : data?.length}
      loading={loading}
      error={error}
      onRetry={refresh}
      refreshedAt={refreshedAt}
      sortable
      rowIds={data?.map((r) => r.id)}
      searchKeys={data?.map((r) => `${r.id} ${r.customer} ${r.reason ?? ''}`)}
      columns={
        compact
          ? [
              { label: t('rpt_col_reference'), width: 100 },
              { label: t('scf_entity_customer') },
              { label: t('col_reason') },
              { label: t('rpt_col_status') },
              { label: t('rpt_col_amount'), align: 'right' },
            ]
          : [
              { label: t('rpt_col_reference'), width: 100 },
              { label: t('scf_entity_customer') },
              { label: t('col_reason') },
              { label: t('rpt_col_amount'), align: 'right' },
              { label: t('col_age'), align: 'right' },
              { label: t('rpt_col_status') },
            ]
      }
      rows={rows}
    />
  );
}
