import { useTranslation } from 'react-i18next';
import { Button, DynamicTable, FormCard, IconButton, type TableConfig } from '@epay/ui';
import { GitBranch, Plus, Trash2 } from 'lucide-react';
import type { CaseGroup, CaseRoutingRule } from '../domain/types';

type Props = {
  rules: CaseRoutingRule[];
  groups: CaseGroup[];
  onChange: (rules: CaseRoutingRule[]) => void;
  canEdit: boolean;
};

const ROUTING_TARGET_GROUPS = (groups: CaseGroup[]) =>
  groups.filter((g) => g.type !== 'Operator');

export function RoutingRulesPanel({ rules, groups, onChange, canEdit }: Props) {
  const { t } = useTranslation();
  const targets = ROUTING_TARGET_GROUPS(groups);

  const addRule = () => {
    onChange([
      ...rules,
      {
        id: `rule-${Date.now()}`,
        conditionDsl: '',
        targetGroupId: targets[0]?.id ?? '',
        autoDistribute: false,
        sortOrder: rules.length + 1,
      },
    ]);
  };

  const patch = (id: string, patch: Partial<CaseRoutingRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => {
    onChange(rules.filter((r) => r.id !== id));
  };

  return (
    <FormCard
      id="sec-routing"
      title={t('rm_panel_routing')}
      icon={<GitBranch size={13} />}
      meta={<span className="mono fs-11 t-mute">{rules.length}</span>}
      padless
    >
      <div className="rm-table-wrap">
        <DynamicTable
          config={
            {
              rowKey: 'id',
              hideTitleBar: true,
              hideColumnFilters: true,
              pagination: false,
              columns: [
                { key: 'conditionDsl', title: t('rs_col_condition'), dataIndex: 'conditionDsl', render: 'renderCondition' },
                { key: 'targetGroupId', title: t('rm_route_col_group'), dataIndex: 'targetGroupId', render: 'renderGroup' },
                { key: 'autoDistribute', title: t('rm_route_col_auto'), dataIndex: 'autoDistribute', render: 'renderAuto' },
                ...(canEdit ? [{ key: 'actions', title: '', dataIndex: 'id', render: 'renderActions', width: 84 }] : []),
              ],
              api: {
                method: async () => ({ success: true, data: rules as unknown as Record<string, unknown>[], total: rules.length }),
              },
            } satisfies TableConfig
          }
          permissions={{}}
          customFunctions={{
            renderCondition: (_v: unknown, row: Record<string, unknown>) => {
              const id = String(row.id);
              const item = rules.find((r) => r.id === id);
              if (!item) return null;
              return canEdit ? (
                <textarea className="textarea" rows={2} value={item.conditionDsl} onChange={(e) => patch(id, { conditionDsl: e.target.value })} placeholder={t('rm_route_dsl_ph')} />
              ) : (
                <code className="rm-dsl-chip">{item.conditionDsl}</code>
              );
            },
            renderGroup: (_v: unknown, row: Record<string, unknown>) => {
              const id = String(row.id);
              const item = rules.find((r) => r.id === id);
              if (!item) return null;
              return canEdit ? (
                <select className="select" value={item.targetGroupId} onChange={(e) => patch(id, { targetGroupId: e.target.value })}>
                  {targets.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              ) : (
                groups.find((g) => g.id === item.targetGroupId)?.name
              );
            },
            renderAuto: (_v: unknown, row: Record<string, unknown>) => {
              const id = String(row.id);
              const item = rules.find((r) => r.id === id);
              if (!item) return null;
              return (
                <div className="rm-auto-toggle" role="group" aria-label={t('rm_route_col_auto')}>
                  <button type="button" className={`rm-auto-chip${!item.autoDistribute ? ' is-on' : ''}`} disabled={!canEdit} onClick={() => patch(id, { autoDistribute: false })}>
                    {t('rm_route_manual')}
                  </button>
                  <button type="button" className={`rm-auto-chip${item.autoDistribute ? ' is-on' : ''}`} disabled={!canEdit} onClick={() => patch(id, { autoDistribute: true })}>
                    {t('rm_route_auto')}
                  </button>
                </div>
              );
            },
            renderActions: (_v: unknown, row: Record<string, unknown>) => (
              <div className="rm-col-actions">
                <IconButton aria-label={t('rm_route_remove')} onClick={() => remove(String(row.id))}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            ),
          }}
          locale="tr"
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      </div>

      {canEdit ? (
        <div className="rm-route-footer">
          <Button type="button" variant="ghost" size="sm" onClick={addRule}>
            <Plus size={14} /> {t('rm_route_add')}
          </Button>
        </div>
      ) : null}
    </FormCard>
  );
}
