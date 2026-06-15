import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DynamicTable, type TableConfig } from '@epay/ui';
import type { SimulationResult } from '../domain/types';

export function SimulationModal({
  open,
  onClose,
  onRun,
}: {
  open: boolean;
  onClose: () => void;
  onRun: () => SimulationResult;
}) {
  const { t } = useTranslation();
  const [result, setResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    if (open) setResult(onRun());
    else setResult(null);
  }, [open, onRun]);

  if (!open) return null;

  const levelLabel = (l: string) => {
    const key =
      l === 'Low'
        ? 'rs_level_low'
        : l === 'Medium'
          ? 'rs_level_medium'
          : l === 'High'
            ? 'scf_level_High'
            : 'rs_level_critical';
    return t(key);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{t('rs_simulation_title')}</h3>
        </div>
        <div className="modal-body">
          {result && result.transitions.length === 0 ? (
            <p className="t-mute">{t('rs_simulation_empty')}</p>
          ) : (
            <DynamicTable
              config={
                {
                  rowKey: 'key',
                  hideTitleBar: true,
                  hideColumnFilters: true,
                  pagination: false,
                  columns: [
                    { key: 'fromLevel', title: t('rs_sim_from'), dataIndex: 'fromLevel', render: 'renderFrom' },
                    { key: 'toLevel', title: t('rs_sim_to'), dataIndex: 'toLevel', render: 'renderTo' },
                    { key: 'count', title: t('rpt_col_count'), dataIndex: 'count', render: 'renderCount', align: 'right' },
                  ],
                  api: {
                    method: async () => ({
                      success: true,
                      data: (result?.transitions ?? []).map((row) => ({
                        ...row,
                        key: `${row.fromLevel}-${row.toLevel}`,
                      })) as unknown as Record<string, unknown>[],
                      total: result?.transitions.length ?? 0,
                    }),
                  },
                } satisfies TableConfig
              }
              permissions={{}}
              customFunctions={{
                renderFrom: (v: unknown) => levelLabel(String(v)),
                renderTo: (v: unknown) => levelLabel(String(v)),
                renderCount: (v: unknown) => <span className="mono ta-r">{String(v)}</span>,
              }}
              locale="tr"
              t={(k, fb) => t(k, { defaultValue: fb ?? k })}
            />
          )}
          {result && (
            <p className="fs-12 t-mute" style={{ marginTop: 12 }}>
              {t('rs_simulation_total', { count: result.totalAffected })}
            </p>
          )}
        </div>
        <div className="modal-foot">
          <Button type="button" variant="primary" onClick={onClose}>
            {t('rs_close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
