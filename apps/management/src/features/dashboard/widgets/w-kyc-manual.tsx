import { UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@epay/ui';
import { fmtAge } from '@/lib/format';
import { DashCustAvatar } from '../components/dash-cust-avatar';
import { useWidgetData } from '../hooks/use-dashboard';
import { WidgetTable } from './widget-table';
import type { WidgetProps } from './widget-props';

export function WKycManual({ detailLevel, ...props }: WidgetProps) {
  const { t, i18n } = useTranslation();
  const { data, error, loading, refreshedAt, refresh } = useWidgetData('kyc_manual');
  if (!data && !loading && !error) return null;

  const compact = detailLevel === 'compact';

  const rows = (data ?? []).map((r, i) => {
    if (compact) {
      return [
        <span key="id" className="mono">
          {r.id}
        </span>,
        <DashCustAvatar key="cust" name={r.customer} idx={i + 2} />,
        <span key="reason" className="t-soft">
          {r.reason}
        </span>,
        fmtAge(r.age, i18n.language),
      ];
    }
    return [
      <span key="id" className="mono">
        {r.id}
      </span>,
      <DashCustAvatar key="cust" name={r.customer} idx={i + 2} />,
      r.reason,
      r.level,
      fmtAge(r.age, i18n.language),
      <Badge key="r" tone={r.risk === 'high' ? 'danger' : 'warn'}>
        {r.risk === 'high' ? t('scf_level_High') : t('rs_level_medium')}
      </Badge>,
    ];
  });

  return (
    <WidgetTable
      {...props}
      detailLevel={detailLevel}
      widgetCode="kyc_manual"
      icon={UserCheck}
      iconTone="info"
      titleKey="w_kyc_manual"
      count={data?.length}
      countTone="info"
      loading={loading}
      error={error}
      onRetry={refresh}
      refreshedAt={refreshedAt}
      sortable
      rowIds={data?.map((r) => r.id)}
      searchKeys={data?.map((r) => `${r.id} ${r.customer} ${r.reason}`)}
      columns={
        compact
          ? [
              { label: t('rpt_col_reference'), width: 95 },
              { label: t('scf_entity_customer') },
              { label: t('col_reason') },
              { label: t('col_age'), width: 60, align: 'right' },
            ]
          : [
              { label: t('rpt_col_reference'), width: 100 },
              { label: t('scf_entity_customer') },
              { label: t('col_reason') },
              { label: 'KYC' },
              { label: t('col_age'), align: 'right' },
              { label: t('rpt_col_risk') },
            ]
      }
      rows={rows}
    />
  );
}
