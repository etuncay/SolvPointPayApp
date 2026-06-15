import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig } from '@epay/ui';
import { computeNextRuns } from '../../domain/compute-next-runs';
import type { ScheduledJob } from '../../domain/types';

type Props = { job: ScheduledJob };

export function ScheduleTab({ job }: Props) {
  const { t, i18n } = useTranslation();
  const slots = useMemo(
    () => computeNextRuns(job.cronExpression, job.name, job.description),
    [job],
  );

  if (job.jobType !== 'Recurring' || !job.cronExpression) {
    return (
      <p className="t-mute fs-12" style={{ padding: 16 }}>
        {t('sj_schedule_empty')}
      </p>
    );
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <DynamicTable
      config={
        {
          rowKey: 'at',
          hideTitleBar: true,
          hideColumnFilters: true,
          pagination: false,
          columns: [
            { key: 'at', title: t('sj_sched_col_at'), dataIndex: 'at', render: 'renderDate', mono: true, width: 180 },
            { key: 'name', title: t('sj_col_name'), dataIndex: 'name' },
            { key: 'description', title: t('rpt_col_desc'), dataIndex: 'description', render: 'renderDescription' },
          ],
          api: {
            method: async () => ({
              data: slots as unknown as Record<string, unknown>[],
              total: slots.length,
              success: true,
            }),
          },
        } satisfies TableConfig
      }
      permissions={{}}
      customFunctions={{
        renderDate: (val: unknown) => (typeof val === 'string' ? fmt(val) : '—'),
        renderDescription: (val: unknown) => <span className="t-mute">{String(val ?? '')}</span>,
      }}
      locale={i18n.language}
      t={(k, fb) => t(k, { defaultValue: fb ?? k })}
    />
  );
}
