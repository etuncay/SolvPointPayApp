import { Calendar, HeartPulse, Palmtree } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { KpiCard, KpiStrip } from '@epay/ui';
import type { LeaveSummary } from '../domain/types';

export function LeaveSummaryStrip({ summary, year }: { summary: LeaveSummary; year: number }) {
  const { t } = useTranslation();
  return (
    <KpiStrip>
      <KpiCard
        icon={<Palmtree size={12} />}
        label={t('lv_summary_used_annual')}
        value={String(summary.usedAnnualLeaveDays)}
        sub={t('lv_summary_year', { year })}
      />
      <KpiCard
        icon={<Calendar size={12} />}
        label={t('lv_summary_remaining')}
        value={String(summary.remainingAnnualLeaveDays)}
        sub={t('lv_summary_entitlement', { days: summary.entitlementDays })}
      />
      <KpiCard
        icon={<HeartPulse size={12} />}
        label={t('lv_summary_sick')}
        value={String(summary.usedSickLeaveDays)}
        sub={t('lv_summary_year', { year })}
      />
    </KpiStrip>
  );
}
