import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig } from '@epay/ui';
import { getCatalogEntry } from '@/features/system/parameters/domain/parameter-catalog';
import type { ApprovalPayload } from '../domain/types';

type Props = {
  payload: ApprovalPayload;
};

export function PayloadDiffView({ payload }: Props) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';

  if (!payload.changes?.length) {
    return (
      <pre className="mono fs-12 t-mute" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
        {JSON.stringify(payload.raw ?? payload, null, 2)}
      </pre>
    );
  }

  return (
    <DynamicTable
      config={
        {
          rowKey: 'field',
          hideTitleBar: true,
          hideColumnFilters: true,
          pagination: false,
          columns: [
            { key: 'label', title: tr ? 'Alan' : 'Field', dataIndex: 'label', render: 'renderLabel' },
            { key: 'oldValue', title: tr ? 'Eski' : 'Old', dataIndex: 'oldValue', render: 'renderOld' },
            { key: 'newValue', title: tr ? 'Yeni' : 'New', dataIndex: 'newValue', render: 'renderNew' },
          ],
          api: {
            method: async () => ({
              data: payload.changes as unknown as Record<string, unknown>[],
              total: payload.changes.length,
              success: true,
            }),
          },
        } satisfies TableConfig
      }
      permissions={{}}
      customFunctions={{
        renderLabel: (_val: unknown, row: Record<string, unknown>) => {
          const label = String(row.label || row.field || '');
          let display = label;
          if (payload.screenKey === 'system_parameters') {
            const statusSuffix = label.endsWith(' (status)');
            const paramKey = statusSuffix ? label.replace(/ \(status\)$/, '') : label;
            const entry = getCatalogEntry(paramKey);
            if (entry) {
              display = statusSuffix
                ? `${t(entry.descriptionKey, paramKey)} (${t('rpt_col_status', 'Durum')})`
                : t(entry.descriptionKey, paramKey);
            }
          }
          return <span className="fs-12">{display}</span>;
        },
        renderOld: (val: unknown) => (
          <span className="mono fs-12" style={{ background: 'var(--warn-soft)' }}>
            {String(val ?? '—')}
          </span>
        ),
        renderNew: (val: unknown) => (
          <span className="mono fs-12" style={{ background: 'oklch(0.95 0.06 145 / 0.5)' }}>
            {String(val ?? '—')}
          </span>
        ),
      }}
      locale={i18n.language}
      t={(k, fb) => t(k, { defaultValue: fb ?? k })}
    />
  );
}
