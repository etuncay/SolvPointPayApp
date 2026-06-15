import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Button, DynamicTable, type CustomFunctions, type TableConfig } from '@epay/ui';
import { BACKOFFICE_SCREENS } from '@/features/system/shared/screen-registry';
import { ROLE_OPERATIONS } from '../domain/operations-registry';
import type { RoleFieldApprovalRow } from '../domain/types';

type Props = {
  rows: RoleFieldApprovalRow[];
  canEdit: boolean;
  onChange: (rows: RoleFieldApprovalRow[]) => void;
};

export function RoleFieldApprovalTable({ rows, canEdit, onChange }: Props) {
  const { t } = useTranslation();

  const addRow = () => {
    onChange([
      ...rows,
      {
        id: `rfa-new-${Date.now()}`,
        roleId: rows[0]?.roleId ?? '',
        operationName: ROLE_OPERATIONS[0],
        screenId: BACKOFFICE_SCREENS[0]!.screenId,
        canFirstApprove: false,
        canSecondApprove: false,
      },
    ]);
  };

  const patch = (id: string, patch: Partial<RoleFieldApprovalRow>) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  return (
    <div>
      {canEdit ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <Button type="button" variant="ghost" size="sm" onClick={addRow}>
            <Plus size={14} /> {t('ef_add_row')}
          </Button>
        </div>
      ) : null}
      <DynamicTable
        config={
          {
            rowKey: 'id',
            hideTitleBar: true,
            hideColumnFilters: true,
            pagination: false,
            columns: [
              { key: 'operationName', title: t('ar_col_operation'), dataIndex: 'operationName', render: 'renderOperation' },
              { key: 'screenId', title: t('ar_col_screen'), dataIndex: 'screenId', render: 'renderScreen' },
              { key: 'canFirstApprove', title: t('ap_col_first_approver'), dataIndex: 'canFirstApprove', render: 'renderFirst', width: 160, align: 'center' },
              { key: 'canSecondApprove', title: t('ap_col_second_approver'), dataIndex: 'canSecondApprove', render: 'renderSecond', width: 160, align: 'center' },
              ...(canEdit
                ? [{ key: 'actions', title: '', dataIndex: 'id', render: 'renderActions', width: 70, align: 'right', excludeFromExport: true } as const]
                : []),
            ],
            api: {
              method: async () => ({
                data: rows as unknown as Record<string, unknown>[],
                total: rows.length,
                success: true,
              }),
            },
          } satisfies TableConfig
        }
        permissions={{}}
        customFunctions={
          {
            renderOperation: (val: unknown, row: Record<string, unknown>) => {
              const r = row as RoleFieldApprovalRow;
              return (
                <select
                  className="select fs-12"
                  disabled={!canEdit}
                  value={String(val ?? '')}
                  onChange={(e) => patch(r.id, { operationName: e.target.value })}
                >
                  {ROLE_OPERATIONS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              );
            },
            renderScreen: (val: unknown, row: Record<string, unknown>) => {
              const r = row as RoleFieldApprovalRow;
              return (
                <select
                  className="select fs-12"
                  disabled={!canEdit}
                  value={String(val ?? '')}
                  onChange={(e) => patch(r.id, { screenId: e.target.value })}
                >
                  {BACKOFFICE_SCREENS.map((s) => (
                    <option key={s.screenId} value={s.screenId}>
                      {t(s.labelKey, s.screenId)}
                    </option>
                  ))}
                </select>
              );
            },
            renderFirst: (val: unknown, row: Record<string, unknown>) => {
              const r = row as RoleFieldApprovalRow;
              return (
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={Boolean(val)}
                  onChange={(e) => patch(r.id, { canFirstApprove: e.target.checked })}
                />
              );
            },
            renderSecond: (val: unknown, row: Record<string, unknown>) => {
              const r = row as RoleFieldApprovalRow;
              return (
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={Boolean(val)}
                  onChange={(e) => patch(r.id, { canSecondApprove: e.target.checked })}
                />
              );
            },
            renderActions: (_val: unknown, row: Record<string, unknown>) => {
              const r = row as RoleFieldApprovalRow;
              return (
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(r.id)}>
                  <Trash2 size={12} />
                </Button>
              );
            },
          } satisfies CustomFunctions
        }
        locale="tr"
        t={(k, fb) => t(k, fb ?? k)}
      />
    </div>
  );
}
