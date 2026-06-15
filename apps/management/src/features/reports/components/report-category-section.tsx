import type { LucideIcon } from 'lucide-react';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, DynamicTable, FormCard, type TableConfig } from '@epay/ui';
import type { ReportDefinition } from '../domain/types';

export function ReportCategorySection({
  titleKey,
  icon: Icon,
  reports,
  onGenerate,
}: {
  titleKey: string;
  icon: LucideIcon;
  reports: ReportDefinition[];
  onGenerate: (def: ReportDefinition) => void;
}) {
  const { t } = useTranslation();
  if (reports.length === 0) return null;

  return (
    <FormCard
      title={t(titleKey)}
      icon={<Icon size={13} />}
      meta={<span className="mono fs-11 t-mute">{reports.length}</span>}
      padless
    >
      <div className="rpt-table-wrap table-wrap">
        <DynamicTable
          config={
            {
              rowKey: 'code',
              hideTitleBar: true,
              hideColumnFilters: true,
              pagination: false,
              columns: [
                { key: 'titleKey', title: t('rpt_col_report'), dataIndex: 'titleKey', render: 'renderTitle' },
                { key: 'descriptionKey', title: t('rpt_col_desc'), dataIndex: 'descriptionKey', render: 'renderDescription' },
                { key: 'columnSummaryKeys', title: t('rpt_col_columns'), dataIndex: 'columnSummaryKeys', render: 'renderColumns' },
                { key: 'requiresReportDate', title: t('rpt_col_schedule'), dataIndex: 'requiresReportDate', render: 'renderSchedule' },
                { key: 'actions', title: '', dataIndex: 'code', render: 'renderActions', width: 140 },
              ],
              api: {
                method: async () => ({
                  success: true,
                  data: reports as unknown as Record<string, unknown>[],
                  total: reports.length,
                }),
              },
            } satisfies TableConfig
          }
          permissions={{}}
          customFunctions={{
            renderTitle: (_v: unknown, row: Record<string, unknown>) => (
              <span className="rpt-col-report fs-13">{t(String(row.titleKey ?? ''))}</span>
            ),
            renderDescription: (_v: unknown, row: Record<string, unknown>) => {
              const desc = t(String(row.descriptionKey ?? ''));
              return (
                <span className="rpt-truncate fs-12 t-mute" title={desc}>
                  {desc}
                </span>
              );
            },
            renderColumns: (_v: unknown, row: Record<string, unknown>) => (
              <div className="rpt-col-chips">
                {(Array.isArray(row.columnSummaryKeys) ? row.columnSummaryKeys : []).map((key) => (
                  <span key={String(key)} className="rpt-col-chip">
                    {t(String(key))}
                  </span>
                ))}
              </div>
            ),
            renderSchedule: (v: unknown) => (
              <span className={`rpt-schedule-pill${v ? ' is-daily' : ' is-range'}`}>
                {v ? t('rpt_schedule_daily') : t('rpt_schedule_range')}
              </span>
            ),
            renderActions: (_v: unknown, row: Record<string, unknown>) => (
              <Button type="button" variant="primary" size="sm" onClick={() => onGenerate(row as unknown as ReportDefinition)}>
                <Play size={13} /> {t('rpt_generate')}
              </Button>
            ),
          }}
          locale="tr"
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      </div>
    </FormCard>
  );
}
