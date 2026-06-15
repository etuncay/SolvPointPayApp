import { useTranslation } from 'react-i18next';
import { Button, DynamicTable, type TableConfig } from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import type { FraudSimulationResult } from '../domain/types';

export function SimulationModal({
  open,
  onClose,
  metrics,
}: {
  open: boolean;
  onClose: () => void;
  metrics: FraudSimulationResult | null;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  if (!open) return null;

  const rows = metrics
    ? [
        { label: t('frd_sim_total'), value: metrics.totalTransactions },
        { label: t('frd_sim_blocked'), value: metrics.blockedCount },
        { label: t('rc_col_cases_opened'), value: metrics.casesOpened },
        { label: t('rc_col_tp'), value: metrics.truePositive },
        { label: t('fr_col_fp'), value: metrics.falsePositive },
        { label: t('frd_sim_tn'), value: metrics.trueNegative },
        { label: t('frd_sim_fn'), value: metrics.falseNegative },
      ]
    : [];

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{t('frd_sim_title')}</h3>
          <p className="t-mute fs-13">{t('frd_sim_subtitle')}</p>
        </div>
        <div className="modal-body">
          {metrics ? (
            <DynamicTable
              config={
                {
                  rowKey: 'label',
                  hideTitleBar: true,
                  hideColumnFilters: true,
                  pagination: false,
                  columns: [
                    { key: 'label', title: t('rpt_col_field'), dataIndex: 'label' },
                    { key: 'value', title: t('rpt_col_value'), dataIndex: 'value', render: 'renderValue', align: 'right' },
                  ],
                  api: { method: async () => ({ success: true, data: rows as unknown as Record<string, unknown>[], total: rows.length }) },
                } satisfies TableConfig
              }
              permissions={{}}
              customFunctions={{
                renderValue: (v: unknown) => <span className="mono ta-r">{fmtNumber(Number(v), lang)}</span>,
              }}
              locale="tr"
              t={(k, fb) => t(k, { defaultValue: fb ?? k })}
            />
          ) : (
            <p className="t-mute">{t('frd_sim_empty')}</p>
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
