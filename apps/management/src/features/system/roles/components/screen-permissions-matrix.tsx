import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig } from '@epay/ui';
import {
  PERMISSION_FLAG_KEYS,
  permissionFlagLabelKey,
  type PermissionFlagKey,
} from '../domain/permission-flags';
import type { ScreenPermissionRow } from '../domain/types';

type Props = {
  rows: ScreenPermissionRow[];
  canEdit: boolean;
  onToggle: (screenId: string, flag: PermissionFlagKey, value: boolean) => void;
};

export function ScreenPermissionsMatrix({ rows, canEdit, onToggle }: Props) {
  const { t } = useTranslation();

  return (
    <div style={{ overflowX: 'auto', maxHeight: 'min(70vh, 640px)' }}>
      <div style={{ minWidth: 900 }}>
        <DynamicTable
          config={
            {
              rowKey: 'screenId',
              hideTitleBar: true,
              hideColumnFilters: true,
              pagination: false,
              columns: [
                {
                  key: 'screen',
                  title: t('ar_col_screen'),
                  dataIndex: 'screenLabelKey',
                  render: 'renderScreen',
                  width: 240,
                },
                ...PERMISSION_FLAG_KEYS.map((flag) => ({
                  key: flag,
                  title: t(permissionFlagLabelKey(flag), flag),
                  dataIndex: flag,
                  render: `render_${flag}`,
                  align: 'center' as const,
                  width: 120,
                })),
              ],
              api: {
                method: async () => ({
                  success: true,
                  data: rows as unknown as Record<string, unknown>[],
                  total: rows.length,
                }),
              },
            } satisfies TableConfig
          }
          permissions={{}}
          customFunctions={{
            renderScreen: (_v: unknown, row: Record<string, unknown>) => (
              <span style={{ fontWeight: 500 }}>{t(String(row.screenLabelKey), String(row.screenId))}</span>
            ),
            ...Object.fromEntries(
              PERMISSION_FLAG_KEYS.map((flag) => [
                `render_${flag}`,
                (_v: unknown, row: Record<string, unknown>) => (
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={Boolean(row[flag])}
                    onChange={(e) => onToggle(String(row.screenId), flag, e.target.checked)}
                    aria-label={`${String(row.screenId)} ${flag}`}
                  />
                ),
              ]),
            ),
          }}
          locale="tr"
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      </div>
    </div>
  );
}
