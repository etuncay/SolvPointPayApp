import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import { Button, DynamicTable, type CustomFunctions, type TableConfig } from '@epay/ui';
import type { ApprovalCount, ScreenApprovalRule } from '../domain/types';

type Props = {
  rows: ScreenApprovalRule[];
  draft: Record<string, ApprovalCount>;
  dirty: boolean;
  canEdit: boolean;
  onInit: (rows: ScreenApprovalRule[]) => void;
  onPatch: (id: string, count: ApprovalCount) => void;
  onSave: () => void;
};

export function ScreensPanel({
  rows,
  draft,
  dirty,
  canEdit,
  onInit,
  onPatch,
  onSave,
}: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    onInit(rows);
  }, [rows, onInit]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        {canEdit ? (
          <Button type="button" variant="primary" size="sm" disabled={!dirty} onClick={onSave}>
            <Save size={14} /> {t('ar_save_screens')}
          </Button>
        ) : null}
      </div>
      <DynamicTable
        config={
          {
            rowKey: 'id',
            hideTitleBar: true,
            hideColumnFilters: true,
            pagination: false,
            columns: [
              { key: 'moduleId', title: t('usr_act_col_module'), dataIndex: 'moduleId', render: 'renderModule' },
              { key: 'screenId', title: t('ar_col_screen'), dataIndex: 'screenId', render: 'renderScreen' },
              { key: 'approvalCount', title: t('ar_col_approval_count'), dataIndex: 'approvalCount', render: 'renderApprovalCount', width: 180 },
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
            renderModule: (_v: unknown, row: Record<string, unknown>) => {
              const r = row as unknown as ScreenApprovalRule;
              return t(r.moduleLabelKey, r.moduleId);
            },
            renderScreen: (_v: unknown, row: Record<string, unknown>) => {
              const r = row as unknown as ScreenApprovalRule;
              return t(r.screenLabelKey, r.screenId);
            },
            renderApprovalCount: (_v: unknown, row: Record<string, unknown>) => {
              const r = row as unknown as ScreenApprovalRule;
              return (
                <select
                  className="select fs-12"
                  disabled={!canEdit}
                  value={draft[r.id] ?? r.approvalCount}
                  onChange={(e) => onPatch(r.id, Number(e.target.value) as ApprovalCount)}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              );
            },
          } satisfies CustomFunctions
        }
        locale="tr"
        t={(k, fb) => t(k, fb ?? k)}
      />
      <p className="t-mute fs-11" style={{ marginTop: 12 }}>
        {t('ar_screens_no_add_hint')}
      </p>
    </div>
  );
}
