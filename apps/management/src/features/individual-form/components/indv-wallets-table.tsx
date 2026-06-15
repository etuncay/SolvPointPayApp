import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type CustomComponentProps, type TableConfig } from '@epay/ui';

export function IndvWalletsTable({ value }: CustomComponentProps) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const wallets = (value as Record<string, unknown>[] | undefined) ?? [];
  const fmt = (n: number) => new Intl.NumberFormat(tr ? 'tr-TR' : 'en-US').format(n);

  const config = useMemo<TableConfig>(
    () => ({
      rowKey: 'id',
      hideTitleBar: true,
      hideColumnFilters: true,
      pagination: false,
      columns: [
        { key: 'id', title: tr ? 'Cüzdan No' : 'Wallet No', dataIndex: 'id', mono: true },
        { key: 'balance', title: tr ? 'Bakiye' : 'Balance', dataIndex: 'balance', render: 'renderMoney' },
        { key: 'blocked', title: tr ? 'Bloke' : 'Blocked', dataIndex: 'blocked', render: 'renderBlocked' },
        { key: 'txCountDay', title: tr ? 'Bugün Adet' : 'Tx today', dataIndex: 'txCountDay', mono: true },
        { key: 'txAmountDay', title: tr ? 'Bugün Tutar' : 'Vol today', dataIndex: 'txAmountDay', render: 'renderTxAmount' },
      ],
      api: {
        method: async () => ({ success: true, data: wallets, total: wallets.length }),
      },
    }),
    [wallets, tr],
  );

  return (
    <DynamicTable
      config={config}
      permissions={{}}
      customFunctions={{
        renderMoney: (val: unknown, row: Record<string, unknown>) => (
          <span>{fmt(Number(val ?? 0))} <span className="t-mute fs-11">{String(row.currency ?? '')}</span></span>
        ),
        renderBlocked: (val: unknown, row: Record<string, unknown>) => (
          <span className="mono fs-12">{fmt(Number(val ?? 0))} <span className="t-mute">{String(row.currency ?? '')}</span></span>
        ),
        renderTxAmount: (val: unknown, row: Record<string, unknown>) => (
          <span className="mono fs-12">{fmt(Number(val ?? 0))} <span className="t-mute">{String(row.currency ?? '')}</span></span>
        ),
      }}
      locale={i18n.language}
      t={(k, fb) => t(k, { defaultValue: fb ?? k })}
    />
  );
}
