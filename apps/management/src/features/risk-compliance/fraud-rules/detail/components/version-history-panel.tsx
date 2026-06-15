import { useTranslation } from 'react-i18next';
import { DynamicTable, FormCard, type TableConfig } from '@epay/ui';
import type { FraudRuleVersion } from '../domain/types';

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max)}…`;
}

export function VersionHistoryPanel({ versions }: { versions: FraudRuleVersion[] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-GB', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

  return (
    <FormCard id="sec-versions" title={t('frd_panel_versions')}>
      {versions.length === 0 ? (
        <p className="t-mute fs-13">{t('frd_no_versions')}</p>
      ) : (
        <DynamicTable
          config={
            {
              rowKey: 'id',
              hideTitleBar: true,
              hideColumnFilters: true,
              pagination: { defaultPageSize: 8, pageSizeOptions: [8, 15, 30] },
              columns: [
                { key: 'createdAt', title: t('frd_exc_created'), dataIndex: 'createdAt', render: 'renderDate', mono: true, width: 140 },
                { key: 'updatedAt', title: t('frd_ver_updated'), dataIndex: 'updatedAt', render: 'renderDate', mono: true, width: 140 },
                { key: 'conditionDsl', title: t('rs_col_condition'), dataIndex: 'conditionDsl', render: 'renderCondition', mono: true },
                { key: 'actionSummary', title: t('frd_ver_actions'), dataIndex: 'actionSummary' },
                { key: 'description', title: t('rpt_col_desc'), dataIndex: 'description', render: 'renderDescription' },
              ],
              api: {
                method: async () => ({
                  data: versions as unknown as Record<string, unknown>[],
                  total: versions.length,
                  success: true,
                }),
              },
            } satisfies TableConfig
          }
          permissions={{}}
          customFunctions={{
            renderDate: (val: unknown) => (typeof val === 'string' ? fmt(val) : '—'),
            renderCondition: (val: unknown) => {
              const text = String(val ?? '');
              return (
                <span className="mono" title={text}>
                  {truncate(text, 48)}
                </span>
              );
            },
            renderDescription: (val: unknown) => String(val ?? '—'),
          }}
          locale={lang}
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      )}
    </FormCard>
  );
}
