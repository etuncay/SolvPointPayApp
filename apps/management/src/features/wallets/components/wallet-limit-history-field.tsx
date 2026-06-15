import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig, type TableCustomFunctions } from '@epay/ui';
import type { LimitHistoryEntry } from '../domain/detail-types';
import historyJson from '../config/wallet-limit-history.table.config.json';
import { fmtNumber } from '@/lib/format';

type Props = {
  value?: unknown;
  componentProps?: { rows?: LimitHistoryEntry[] };
};

type TableConfigJson = Omit<TableConfig, 'api'>;

/** DynamicForm CustomComponent — limit geçmişi tablosu. */
export function WalletLimitHistoryField({ componentProps }: Props) {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) => t(key, { defaultValue: fb ?? key });

  const rows = componentProps?.rows ?? [];

  const config = useMemo(() => {
    const base = historyJson as TableConfigJson;
    return {
      ...base,
      title: t('wd_panel_history', base.title as string),
      api: {
        method: async () => ({
          data: rows as unknown as Record<string, unknown>[],
          total: rows.length,
          success: true,
        }),
      },
    } satisfies TableConfig;
  }, [rows, t]);

  const fns: TableCustomFunctions = useMemo(
    () => ({
      renderLimitGroup: (val: unknown): ReactNode => t(`wd_group_${String(val)}`, String(val)),
      renderLimitType: (val: unknown): ReactNode => t(`wd_limit_${String(val)}`, String(val)),
      renderLimitAmount: (val: unknown): ReactNode => {
        const n = Number(val);
        return n === -1 ? t('wd_unlimited') : fmtNumber(n, i18n.language);
      },
    }),
    [t, i18n.language],
  );

  if (rows.length === 0) {
    return <p className="t-mute fs-12" style={{ padding: 12, margin: 0 }}>{t('wd_hist_empty')}</p>;
  }

  return <DynamicTable config={config} permissions={{}} customFunctions={fns} locale={i18n.language} t={translate} />;
}

