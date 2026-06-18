import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig, type TableCustomFunctions } from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import { findActiveTier } from '@/features/agent-transfers/domain/fees';
import type { TransferFeeTier } from '@/features/agent-transfers/domain/types';
import { useAgentUiPermissions } from '@/hooks/use-agent-ui-permissions';

interface Props {
  config: TableConfig;
  tiers: TransferFeeTier[];
  amount: number;
  titleKey?: string;
}

/** Ücret kademeleri — aktif satır vurgusu (6.1 §5). */
export function FeeTierTable({ config, tiers, amount, titleKey = 'ag_tr_own_panel_fees' }: Props) {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const activeTierId = useMemo(() => findActiveTier(amount, tiers)?.id ?? null, [amount, tiers]);
  const ui = useAgentUiPermissions();

  const feeFns: TableCustomFunctions = useMemo(
    () => ({
      renderMoney: (val: unknown): ReactNode => fmtNumber(Number(val ?? 0), i18n.language),
      renderMax: (val: unknown): ReactNode =>
        val == null ? t('ag_tr_own_tier_open') : fmtNumber(Number(val), i18n.language),
      renderRate: (val: unknown): ReactNode => `%${fmtNumber(Number(val ?? 0), i18n.language)}`,
      renderActive: (val: unknown): ReactNode =>
        String(val) === activeTierId ? (
          <span className="badge badge--success">{t('ag_tr_own_tier_active')}</span>
        ) : null,
    }),
    [activeTierId, i18n.language, t],
  );

  return (
    <div className="fcard" style={{ marginBottom: 16 }}>
      <div className="fcard-body">
        <div className="section-h" style={{ marginBottom: 12 }}>
          {t(titleKey)}
        </div>
        <DynamicTable
          config={config}
          permissions={ui.table.fees}
          customFunctions={feeFns}
          locale={i18n.language}
          t={translate}
        />
      </div>
    </div>
  );
}
