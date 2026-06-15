import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@epay/ui';
import { fmtAge, fmtMoney } from '@/lib/format';
import { DashCustAvatar } from '../components/dash-cust-avatar';
import { useWidgetData } from '../hooks/use-dashboard';
import { WidgetTable } from './widget-table';
import type { WidgetProps } from './widget-props';

export function WAmlHeld({ detailLevel, ...props }: WidgetProps) {
  const { t, i18n } = useTranslation();
  const { data, error, loading, refreshedAt, refresh } = useWidgetData('aml_held');
  if (!data && !loading && !error) return null;

  const compact = detailLevel === 'compact';

  const rows = (data ?? []).map((r, i) => {
    if (compact) {
      return [
        <span key="id" className="mono">
          {r.id}
        </span>,
        <DashCustAvatar key="cust" name={r.customer} idx={i + 1} />,
        <span key="rule" className="t-soft" style={{ maxWidth: 0 }}>
          {r.rule ?? '—'}
        </span>,
        fmtMoney(r.amount, i18n.language),
      ];
    }
    return [
      <span key="id" className="mono">
        {r.id}
      </span>,
      <DashCustAvatar key="cust" name={r.customer} idx={i + 1} />,
      r.rule ?? '—',
      fmtMoney(r.amount, i18n.language),
      fmtAge(r.age, i18n.language),
      <Badge key="r" tone="danger">
        {t('s_held')}
      </Badge>,
    ];
  });

  return (
    <WidgetTable
      {...props}
      detailLevel={detailLevel}
      widgetCode="aml_held"
      icon={Shield}
      iconTone="danger"
      titleKey="w_aml_held"
      count={data?.length}
      countTone="danger"
      loading={loading}
      error={error}
      onRetry={refresh}
      refreshedAt={refreshedAt}
      sortable
      rowIds={data?.map((r) => r.id)}
      searchKeys={data?.map((r) => `${r.id} ${r.customer} ${r.rule ?? ''}`)}
      columns={
        compact
          ? [
              { label: t('rpt_col_reference'), width: 100 },
              { label: t('scf_entity_customer') },
              { label: t('col_reason') },
              { label: t('rpt_col_amount'), align: 'right' },
            ]
          : [
              { label: t('rpt_col_reference'), width: 100 },
              { label: t('scf_entity_customer') },
              { label: t('col_rule') },
              { label: t('rpt_col_amount'), align: 'right' },
              { label: t('col_age'), align: 'right' },
              { label: t('rpt_col_status') },
            ]
      }
      rows={rows}
    />
  );
}
