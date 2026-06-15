import { PieChart } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, FormCard, type TableConfig } from '@epay/ui';
import type { ScoreBreakdownItem } from '../domain/types';

export function ScoreBreakdownPanel({ items }: { items: ScoreBreakdownItem[] }) {
  const { t } = useTranslation();

  const total = useMemo(
    () => items.reduce((sum, row) => sum + row.scoreContribution, 0),
    [items],
  );

  const maxContrib = useMemo(
    () => Math.max(...items.map((row) => row.scoreContribution), 1),
    [items],
  );

  return (
    <FormCard
      title={t('rsc_panel_breakdown')}
      icon={<PieChart size={13} />}
      meta={<span className="mono fs-11 t-mute">Σ {total}</span>}
      id="sec-breakdown"
      padless
    >
      <div className="rsc-table-wrap">
        <DynamicTable
          config={
            {
              rowKey: 'ruleId',
              hideTitleBar: true,
              hideColumnFilters: true,
              pagination: false,
              columns: [
                { key: 'title', title: t('col_rule'), dataIndex: 'title', render: 'renderRule' },
                { key: 'scoreContribution', title: t('rsc_col_contribution'), dataIndex: 'scoreContribution', render: 'renderContribution', align: 'right', width: 140 },
              ],
              api: {
                method: async () => ({
                  success: true,
                  data: items as unknown as Record<string, unknown>[],
                  total: items.length,
                }),
              },
            } satisfies TableConfig
          }
          permissions={{}}
          customFunctions={{
            renderRule: (_v: unknown, row: Record<string, unknown>) => {
              const title = String(row.title ?? '');
              const scoreContribution = Number(row.scoreContribution ?? 0);
              return (
                <>
                  <div>{title}</div>
                  <div className="rsc-breakdown-bar" aria-hidden>
                    <div className="rsc-breakdown-bar-fill" style={{ width: `${(scoreContribution / maxContrib) * 100}%` }} />
                  </div>
                </>
              );
            },
            renderContribution: (v: unknown) => <span className="rsc-contrib-pill">+{String(v ?? 0)}</span>,
          }}
          locale="tr"
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
        {items.length > 0 && (
          <div className="is-total" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px' }}>
            <span>{t('rsc_breakdown_total')}</span>
            <span className="rsc-contrib-pill">+{total}</span>
          </div>
        )}
      </div>
    </FormCard>
  );
}
