import { useTranslation } from 'react-i18next';
import { DynamicTable, type CustomFunctions, type TableConfig } from '@epay/ui';
import { jobRunStatusI18nKey, jobRunStatusTone } from '../../domain/job-status-ui';
import type { ScheduledJobLog } from '../../domain/types';

type Props = { logs: ScheduledJobLog[]; jobName: string };

export function LogTab({ logs, jobName }: Props) {
  const { t, i18n } = useTranslation();

  const fmt = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
          dateStyle: 'short',
          timeStyle: 'medium',
        })
      : '—';

  if (logs.length === 0) {
    return <p className="t-mute fs-12" style={{ padding: 16 }}>{t('sj_log_empty')}</p>;
  }

  return (
    <DynamicTable
      config={
        {
          rowKey: 'id',
          hideTitleBar: true,
          hideColumnFilters: true,
          pagination: { defaultPageSize: 8, pageSizeOptions: [8, 15, 30] },
          columns: [
            { key: 'jobName', title: t('sj_col_name'), dataIndex: 'jobName' },
            { key: 'jobStatus', title: t('rpt_col_status'), dataIndex: 'jobStatus', render: 'renderStatus', width: 140 },
            { key: 'startTime', title: t('sj_log_col_start'), dataIndex: 'startTime', render: 'renderDate', mono: true, width: 165 },
            { key: 'endTime', title: t('sj_log_col_end'), dataIndex: 'endTime', render: 'renderDate', mono: true, width: 165 },
            { key: 'attemptCount', title: t('sj_log_col_attempt'), dataIndex: 'attemptCount', width: 90 },
            { key: 'serviceOutput', title: t('sj_log_col_output'), dataIndex: 'serviceOutput', render: 'renderOutput' },
            { key: 'triggeredByName', title: t('sj_log_col_trigger'), dataIndex: 'triggeredByName' },
            { key: 'nextRunAt', title: t('sj_log_col_next'), dataIndex: 'nextRunAt', render: 'renderDate', mono: true, width: 165 },
          ],
          api: {
            method: async () => ({
              data: logs.map((x) => ({ ...x, jobName })) as unknown as Record<string, unknown>[],
              total: logs.length,
              success: true,
            }),
          },
        } satisfies TableConfig
      }
      permissions={{}}
      customFunctions={
        {
          renderStatus: (val: unknown) => {
            const s = String(val) as Parameters<typeof jobRunStatusTone>[0];
            return (
              <span className={`pill fs-11 pill-${jobRunStatusTone(s)}`}>{t(jobRunStatusI18nKey(s))}</span>
            );
          },
          renderDate: (val: unknown) => fmt((val as string | null) ?? null),
          renderOutput: (val: unknown) => (
            <span className="mono" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {String(val ?? '—')}
            </span>
          ),
        } satisfies CustomFunctions
      }
      locale={i18n.language}
      t={(k, fb) => t(k, { defaultValue: fb ?? k })}
    />
  );
}
