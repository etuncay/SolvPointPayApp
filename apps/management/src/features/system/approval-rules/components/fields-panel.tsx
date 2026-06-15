import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CheckCircle, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Button, DynamicTable, type CustomFunctions, type TableConfig } from '@epay/ui';
import { BACKOFFICE_SCREENS } from '@/features/system/shared/screen-registry';
import { APPROVAL_SCOPES, scopeLabelKey, scopeRequiresLimits } from '../domain/scopes';
import type {
  ApprovalCount,
  FieldApprovalRule,
  FieldApprovalRuleInput,
} from '../domain/types';

type Props = {
  rows: FieldApprovalRule[];
  canEdit: boolean;
  editingId: string | 'new' | null;
  draft: FieldApprovalRuleInput | null;
  onStartNew: () => void;
  onStartEdit: (row: FieldApprovalRule) => void;
  onCancel: () => void;
  onPatch: (patch: Partial<FieldApprovalRuleInput>) => void;
  onSave: () => { ok: boolean; errorCode?: string; warnings?: { screenKey: string }[] };
  onDelete: (id: string) => void;
  onValidate: (
    screenId: string,
    fieldName: string,
    specialCondition?: string | null,
  ) => { ok: boolean; errors: string[] };
};

export function FieldsPanel({
  rows,
  canEdit,
  editingId,
  draft,
  onStartNew,
  onStartEdit,
  onCancel,
  onPatch,
  onSave,
  onDelete,
  onValidate,
}: Props) {
  const { t } = useTranslation();
  const showLimits = draft ? scopeRequiresLimits(draft.scope) : false;

  const handleSave = () => {
    const result = onSave();
    if (!result.ok) {
      toast.error(t(result.errorCode ?? 'frd_save_failed'));
      return;
    }
    if (result.warnings && result.warnings.length > 0) {
      toast.warning(t('ar_field_save_warn'));
    } else {
      toast.success(t('ar_field_saved_ok'));
    }
  };

  const handleValidate = () => {
    if (!draft) return;
    const res = onValidate(draft.screenId, draft.fieldName, draft.specialCondition);
    if (res.ok) toast.success(t('ar_validate_ok'));
    else res.errors.forEach((e) => toast.error(t(e, e)));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
        {canEdit && !editingId ? (
          <Button type="button" variant="ghost" size="sm" onClick={onStartNew}>
            <Plus size={14} /> {t('ar_add_field_rule')}
          </Button>
        ) : null}
      </div>

      {editingId && draft ? (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div className="form-grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <label className="fs-12">
              <span className="t-mute">{t('ar_col_operation')}</span>
              <input
                className="input"
                disabled={editingId !== 'new'}
                value={draft.operationName}
                onChange={(e) => onPatch({ operationName: e.target.value })}
              />
            </label>
            <label className="fs-12">
              <span className="t-mute">{t('ar_col_screen')}</span>
              <select
                className="select"
                value={draft.screenId}
                onChange={(e) => onPatch({ screenId: e.target.value })}
              >
                {BACKOFFICE_SCREENS.map((s) => (
                  <option key={s.screenId} value={s.screenId}>
                    {t(s.labelKey, s.screenId)}
                  </option>
                ))}
              </select>
            </label>
            <label className="fs-12">
              <span className="t-mute">{t('ar_col_field')}</span>
              <input
                className="input mono"
                value={draft.fieldName}
                onChange={(e) => onPatch({ fieldName: e.target.value })}
              />
            </label>
            <label className="fs-12" style={{ gridColumn: '1 / -1' }}>
              <span className="t-mute">{t('ar_col_condition')}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input mono"
                  style={{ flex: 1 }}
                  value={draft.specialCondition ?? ''}
                  onChange={(e) => onPatch({ specialCondition: e.target.value || null })}
                  placeholder={t('ar_condition_ph')}
                />
                <Button type="button" variant="ghost" size="sm" onClick={handleValidate}>
                  <CheckCircle size={14} /> {t('rs_validate_btn')}
                </Button>
              </div>
            </label>
            <label className="fs-12">
              <span className="t-mute">{t('fr_col_scope')}</span>
              <select
                className="select"
                value={draft.scope}
                onChange={(e) =>
                  onPatch({
                    scope: e.target.value as FieldApprovalRuleInput['scope'],
                    noApprovalLimit: null,
                    oneApprovalLimit: null,
                  })
                }
              >
                {APPROVAL_SCOPES.map((sc) => (
                  <option key={sc} value={sc}>
                    {t(scopeLabelKey(sc), sc)}
                  </option>
                ))}
              </select>
            </label>
            <label className="fs-12">
              <span className="t-mute">{t('ar_col_approval_count')}</span>
              <select
                className="select"
                value={draft.approvalCount}
                onChange={(e) => onPatch({ approvalCount: Number(e.target.value) as ApprovalCount })}
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </label>
            {showLimits ? (
              <>
                <label className="fs-12">
                  <span className="t-mute">{t('ar_col_no_limit')}</span>
                  <input
                    type="number"
                    className="input mono"
                    value={draft.noApprovalLimit ?? ''}
                    onChange={(e) =>
                      onPatch({ noApprovalLimit: e.target.value === '' ? null : Number(e.target.value) })
                    }
                  />
                </label>
                <label className="fs-12">
                  <span className="t-mute">{t('ar_col_one_limit')}</span>
                  <input
                    type="number"
                    className="input mono"
                    value={draft.oneApprovalLimit ?? ''}
                    onChange={(e) =>
                      onPatch({
                        oneApprovalLimit: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
              </>
            ) : null}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button type="button" variant="primary" size="sm" onClick={handleSave}>
              <Save size={14} /> {t('ib_save')}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              <X size={14} /> {t('ib_cancel')}
            </Button>
          </div>
        </div>
      ) : null}

      <DynamicTable
        config={
          {
            rowKey: 'id',
            hideTitleBar: true,
            hideColumnFilters: true,
            pagination: { defaultPageSize: 8, pageSizeOptions: [8, 15, 30] },
            columns: [
              { key: 'operationName', title: t('ar_col_operation'), dataIndex: 'operationName', mono: true },
              { key: 'screenId', title: t('ar_col_screen'), dataIndex: 'screenId' },
              { key: 'fieldName', title: t('ar_col_field'), dataIndex: 'fieldName', mono: true },
              { key: 'scope', title: t('fr_col_scope'), dataIndex: 'scope', render: 'renderScope' },
              { key: 'approvalCount', title: t('ar_col_approval_count'), dataIndex: 'approvalCount', width: 120 },
              ...(canEdit
                ? [
                    {
                      key: 'actions',
                      title: t('ib_col_actions'),
                      dataIndex: 'id',
                      render: 'renderActions',
                      width: 120,
                      align: 'right',
                      excludeFromExport: true,
                    } as const,
                  ]
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
            renderScope: (val: unknown) => t(scopeLabelKey(String(val) as Parameters<typeof scopeLabelKey>[0]), String(val)),
            renderActions: (_val: unknown, row: Record<string, unknown>) => {
              const r = row as unknown as FieldApprovalRule;
              return (
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onStartEdit(r)}>
                    <Pencil size={12} />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(r.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
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
