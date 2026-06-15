import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type CustomComponentProps, type TableConfig } from '@epay/ui';

export function CorpWalletsTable({ value }: CustomComponentProps) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const wallets = (value as Record<string, unknown>[] | undefined) ?? [];
  const fmt = (n: number) => new Intl.NumberFormat(tr ? 'tr-TR' : 'en-US').format(n);

  const config = useMemo<TableConfig>(() => ({
    rowKey: 'id', hideTitleBar: true, hideColumnFilters: true, pagination: false,
    columns: [
      { key: 'id', title: tr ? 'Cüzdan' : 'Wallet', dataIndex: 'id', mono: true },
      { key: 'balance', title: tr ? 'Bakiye' : 'Balance', dataIndex: 'balance', render: 'renderMoney' },
      { key: 'blocked', title: tr ? 'Bloke' : 'Blocked', dataIndex: 'blocked', render: 'renderBlocked' },
    ],
    api: { method: async () => ({ success: true, data: wallets, total: wallets.length }) },
  }), [wallets, tr]);

  return (
    <DynamicTable config={config} permissions={{}} customFunctions={{
      renderMoney: (val: unknown, row: Record<string, unknown>) => <span>{fmt(Number(val ?? 0))} {String(row.currency ?? '')}</span>,
      renderBlocked: (val: unknown, row: Record<string, unknown>) => <span>{fmt(Number(val ?? 0))} {String(row.currency ?? '')}</span>,
    }} locale={i18n.language} t={(k, fb) => t(k, { defaultValue: fb ?? k })} />
  );
}
