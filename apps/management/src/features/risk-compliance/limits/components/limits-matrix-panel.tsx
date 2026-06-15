import type { ReactNode } from 'react';
import { Building2, User, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, FormCard, type TableConfig } from '@epay/ui';
import type { EntityTypeCore, InternationalTransfer, RiskBasedLimitRow } from '../domain/types';
import { ENTITY_TYPES } from '../domain/types';
import { LimitValueInput } from './limit-value-input';

const ENTITY_KEYS: Record<EntityTypeCore, string> = {
  IndividualCustomer: 'rl_entity_individual',
  CorporateCustomer: 'rl_entity_corporate',
  Agent: 'rpt_col_agent',
};

const ENTITY_ICONS: Record<EntityTypeCore, ReactNode> = {
  IndividualCustomer: <User size={13} />,
  CorporateCustomer: <Building2 size={13} />,
  Agent: <Users size={13} />,
};

const LEVEL_KEYS: Record<string, string> = {
  global: 'rl_level_global',
  Low: 'rs_level_low',
  Medium: 'rs_level_medium',
  High: 'scf_level_High',
  Critical: 'rs_level_critical',
};

const LEVEL_SEG: Record<string, string> = {
  Low: 'low',
  Medium: 'med',
  High: 'high',
  Critical: 'critical',
};

type RowRef = { row: RiskBasedLimitRow; idx: number };

export function LimitsMatrixPanel({
  rows,
  readOnly,
  onUpdateRow,
}: {
  rows: RiskBasedLimitRow[];
  readOnly: boolean;
  onUpdateRow: (index: number, patch: Partial<RiskBasedLimitRow>) => void;
}) {
  const { t } = useTranslation();

  const grouped = ENTITY_TYPES.map((entityType) => ({
    entityType,
    entries: rows
      .map((row, idx) => ({ row, idx }))
      .filter(({ row }) => row.entityType === entityType),
  }));

  return (
    <div className="rl-matrix">
      {grouped.map(({ entityType, entries }) => (
        <FormCard
          key={entityType}
          title={t(ENTITY_KEYS[entityType])}
          icon={ENTITY_ICONS[entityType]}
          meta={<span className="mono fs-11 t-mute">{entries.length}</span>}
          padless
        >
          <div className="rl-matrix-table-wrap">
            <DynamicTable
              config={
                {
                  rowKey: 'rowKey',
                  hideTitleBar: true,
                  hideColumnFilters: true,
                  pagination: false,
                  columns: [
                    { key: 'riskLevel', title: t('rs_col_risk_level'), dataIndex: 'riskLevel', render: 'renderLevel' },
                    { key: 'singleTxLimit', title: t('rl_col_single_tx'), dataIndex: 'singleTxLimit', render: 'renderSingleTx', align: 'right' },
                    { key: 'dailyLimit', title: t('rl_col_daily'), dataIndex: 'dailyLimit', render: 'renderDaily', align: 'right' },
                    { key: 'monthlyLimit', title: t('rl_col_monthly'), dataIndex: 'monthlyLimit', render: 'renderMonthly', align: 'right' },
                    { key: 'singleTxApprovalThreshold', title: t('rl_col_approval'), dataIndex: 'singleTxApprovalThreshold', render: 'renderApproval', align: 'right' },
                    { key: 'internationalTransfer', title: t('rl_col_intl'), dataIndex: 'internationalTransfer', render: 'renderIntl' },
                  ],
                  api: {
                    method: async () => ({
                      success: true,
                      data: entries.map(({ row, idx }) => ({
                        ...row,
                        __index: idx,
                        rowKey: `${entityType}-${row.riskLevel ?? 'global'}`,
                      })) as unknown as Record<string, unknown>[],
                      total: entries.length,
                    }),
                  },
                } satisfies TableConfig
              }
              permissions={{}}
              customFunctions={{
                renderLevel: (_v: unknown, row: Record<string, unknown>) => {
                  const rLevel = row.riskLevel as string | null;
                  if (rLevel == null) return <span className="rl-level-badge">{t('rl_level_global')}</span>;
                  return <span className={`risk-seg ${LEVEL_SEG[rLevel]}`}>{t(LEVEL_KEYS[rLevel])}</span>;
                },
                renderSingleTx: (_v: unknown, row: Record<string, unknown>) => {
                  const idx = Number(row.__index);
                  const r = rows[idx];
                  if (!r) return null;
                  return <LimitValueInput value={r.singleTxLimit} readOnly={readOnly} onChange={(v) => onUpdateRow(idx, { singleTxLimit: v })} />;
                },
                renderDaily: (_v: unknown, row: Record<string, unknown>) => {
                  const idx = Number(row.__index);
                  const r = rows[idx];
                  if (!r) return null;
                  return <LimitValueInput value={r.dailyLimit} readOnly={readOnly} onChange={(v) => onUpdateRow(idx, { dailyLimit: v })} />;
                },
                renderMonthly: (_v: unknown, row: Record<string, unknown>) => {
                  const idx = Number(row.__index);
                  const r = rows[idx];
                  if (!r) return null;
                  return <LimitValueInput value={r.monthlyLimit} readOnly={readOnly} onChange={(v) => onUpdateRow(idx, { monthlyLimit: v })} />;
                },
                renderApproval: (_v: unknown, row: Record<string, unknown>) => {
                  const idx = Number(row.__index);
                  const r = rows[idx];
                  if (!r) return null;
                  return <LimitValueInput value={r.singleTxApprovalThreshold} readOnly={readOnly} onChange={(v) => onUpdateRow(idx, { singleTxApprovalThreshold: v })} />;
                },
                renderIntl: (_v: unknown, row: Record<string, unknown>) => {
                  const idx = Number(row.__index);
                  const r = rows[idx];
                  if (!r) return null;
                  return <IntlTransferToggle value={r.internationalTransfer} readOnly={readOnly} onChange={(v) => onUpdateRow(idx, { internationalTransfer: v })} />;
                },
              }}
              locale="tr"
              t={(k, fb) => t(k, { defaultValue: fb ?? k })}
            />
          </div>
        </FormCard>
      ))}
    </div>
  );
}

function IntlTransferToggle({
  value,
  readOnly,
  onChange,
}: {
  value: InternationalTransfer;
  readOnly: boolean;
  onChange: (v: InternationalTransfer) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="rl-intl-toggle" role="group" aria-label={t('rl_col_intl')}>
      <button
        type="button"
        className={`rl-intl-chip${value === 'Allowed' ? ' is-on is-allow' : ''}`}
        disabled={readOnly}
        aria-pressed={value === 'Allowed'}
        onClick={() => onChange('Allowed')}
      >
        {t('rl_intl_allowed')}
      </button>
      <button
        type="button"
        className={`rl-intl-chip${value === 'Forbidden' ? ' is-on is-deny' : ''}`}
        disabled={readOnly}
        aria-pressed={value === 'Forbidden'}
        onClick={() => onChange('Forbidden')}
      >
        {t('rl_intl_forbidden')}
      </button>
    </div>
  );
}
