import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig } from '@epay/ui';
import { OCCUPATION_OPTIONS } from '@/mocks/occupation-thresholds';
import type { OccupationThreshold } from '../domain/types';

type Props = {
  rows: OccupationThreshold[];
  onChange: (rows: OccupationThreshold[]) => void;
  canEdit: boolean;
};

export function OccupationThresholdsTable({ rows, onChange, canEdit }: Props) {
  const { t } = useTranslation();

  const patchRow = (index: number, patch: Partial<OccupationThreshold>) => {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange(next);
  };

  return (
    <>
      <h4 className="rm-ref-occupation-title">{t('rm_occupation_title')}</h4>
      <div className="rm-table-wrap">
        <DynamicTable
          config={
            {
              rowKey: 'occupationId',
              hideTitleBar: true,
              hideColumnFilters: true,
              pagination: false,
              columns: [
                { key: 'occupationLabel', title: t('rm_occ_col_occupation'), dataIndex: 'occupationLabel', render: 'renderOccupation' },
                { key: 'maxMonthlyIncome', title: t('rm_occ_col_monthly_income'), dataIndex: 'maxMonthlyIncome', render: 'renderMonthlyIncome', align: 'right' },
                { key: 'maxSingleTxAmount', title: t('rm_occ_col_single_tx'), dataIndex: 'maxSingleTxAmount', render: 'renderSingleTx', align: 'right' },
                { key: 'maxMonthlyTxAmount', title: t('rm_occ_col_monthly_tx'), dataIndex: 'maxMonthlyTxAmount', render: 'renderMonthlyTx', align: 'right' },
              ],
              api: {
                method: async () => ({
                  success: true,
                  data: rows.map((row, i) => ({ ...row, __index: i })) as unknown as Record<string, unknown>[],
                  total: rows.length,
                }),
              },
            } satisfies TableConfig
          }
          permissions={{}}
          customFunctions={{
            renderOccupation: (_v: unknown, row: Record<string, unknown>) => {
              const i = Number(row.__index);
              const r = rows[i];
              if (!r) return null;
              return canEdit ? (
                <select
                  className="select"
                  value={r.occupationId}
                  onChange={(e) => {
                    const opt = OCCUPATION_OPTIONS.find((o) => o.id === e.target.value);
                    patchRow(i, { occupationId: e.target.value, occupationLabel: opt?.label ?? r.occupationLabel });
                  }}
                >
                  {OCCUPATION_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                r.occupationLabel
              );
            },
            renderMonthlyIncome: (_v: unknown, row: Record<string, unknown>) => {
              const i = Number(row.__index);
              const r = rows[i];
              if (!r) return null;
              return canEdit ? (
                <input className="input" type="number" min={0} value={r.maxMonthlyIncome} onChange={(e) => patchRow(i, { maxMonthlyIncome: Number(e.target.value) || 0 })} />
              ) : (
                <span className="mono">{r.maxMonthlyIncome.toLocaleString('tr-TR')}</span>
              );
            },
            renderSingleTx: (_v: unknown, row: Record<string, unknown>) => {
              const i = Number(row.__index);
              const r = rows[i];
              if (!r) return null;
              return canEdit ? (
                <input className="input" type="number" min={0} value={r.maxSingleTxAmount} onChange={(e) => patchRow(i, { maxSingleTxAmount: Number(e.target.value) || 0 })} />
              ) : (
                <span className="mono">{r.maxSingleTxAmount.toLocaleString('tr-TR')}</span>
              );
            },
            renderMonthlyTx: (_v: unknown, row: Record<string, unknown>) => {
              const i = Number(row.__index);
              const r = rows[i];
              if (!r) return null;
              return canEdit ? (
                <input className="input" type="number" min={0} value={r.maxMonthlyTxAmount} onChange={(e) => patchRow(i, { maxMonthlyTxAmount: Number(e.target.value) || 0 })} />
              ) : (
                <span className="mono">{r.maxMonthlyTxAmount.toLocaleString('tr-TR')}</span>
              );
            },
          }}
          locale="tr"
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      </div>
    </>
  );
}
