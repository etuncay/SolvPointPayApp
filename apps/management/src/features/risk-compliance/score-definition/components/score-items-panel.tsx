import { ListChecks, Pencil, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, DynamicTable, FormCard, IconButton, type TableConfig } from '@epay/ui';
import type { RiskScoreRule } from '../domain/types';

export function ScoreItemsPanel({
  rules,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  readOnly,
}: {
  rules: RiskScoreRule[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (rule: RiskScoreRule) => void;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <FormCard
      title={t('rs_score_panel')}
      icon={<ListChecks size={13} />}
      meta={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mono fs-11 t-mute">{rules.length}</span>
          {!readOnly && (
            <Button variant="primary" size="sm" onClick={onAdd}>
              <Plus size={14} /> {t('rs_add')}
            </Button>
          )}
        </div>
      }
      padless
    >
      {rules.length === 0 ? (
        <div className="rs-def-empty">{t('rs_empty_rules')}</div>
      ) : (
        <div className="rs-def-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <DynamicTable
            config={
              {
                rowKey: 'id',
                hideTitleBar: true,
                hideColumnFilters: true,
                pagination: false,
                columns: [
                  { key: 'title', title: t('rs_col_title'), dataIndex: 'title', render: 'renderTitle' },
                  { key: 'conditionDsl', title: t('rs_col_condition'), dataIndex: 'conditionDsl', render: 'renderCondition' },
                  { key: 'scoreContribution', title: t('rs_col_score'), dataIndex: 'scoreContribution', render: 'renderScore', width: 110 },
                  { key: 'status', title: t('rpt_col_status'), dataIndex: 'status', render: 'renderStatus', width: 120 },
                  { key: 'actions', title: '', dataIndex: 'id', render: 'renderActions', width: 70, align: 'right' },
                ],
                api: {
                  method: async () => ({
                    success: true,
                    data: rules as unknown as Record<string, unknown>[],
                    total: rules.length,
                  }),
                },
              } satisfies TableConfig
            }
            permissions={{}}
            customFunctions={{
              renderTitle: (v: unknown, row: Record<string, unknown>) => (
                <span
                  className="rs-col-title"
                  style={{ cursor: 'pointer', fontWeight: selectedId === String(row.id) ? 700 : 500 }}
                  onClick={() => onSelect(String(row.id))}
                >
                  {String(v ?? '')}
                </span>
              ),
              renderCondition: (v: unknown, row: Record<string, unknown>) => (
                <code className="rs-dsl-chip" onClick={() => onSelect(String(row.id))}>
                  {String(v ?? '')}
                </code>
              ),
              renderScore: (v: unknown, row: Record<string, unknown>) => (
                <span className="rs-score-pill" onClick={() => onSelect(String(row.id))}>
                  +{String(v ?? 0)}
                </span>
              ),
              renderStatus: (v: unknown, row: Record<string, unknown>) => (
                <span onClick={() => onSelect(String(row.id))}>
                  <Badge tone={String(v) === 'Active' ? 'ok' : 'default'}>
                    {String(v) === 'Active' ? t('ib_status_Active') : t('rs_status_passive')}
                  </Badge>
                </span>
              ),
              renderActions: (_v: unknown, row: Record<string, unknown>) =>
                !readOnly ? (
                  <IconButton
                    aria-label={t('ib_edit', 'Düzenle')}
                    onClick={(e) => {
                      e.stopPropagation();
                      const rule = rules.find((r) => r.id === String(row.id));
                      if (rule) onEdit(rule);
                    }}
                  >
                    <Pencil size={14} />
                  </IconButton>
                ) : null,
            }}
            locale="tr"
            t={(k, fb) => t(k, { defaultValue: fb ?? k })}
          />
        </div>
      )}
    </FormCard>
  );
}
