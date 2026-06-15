import { fmtNumber } from '@/lib/format';
import type { AgentTransactionRow } from './types';
import { transactionTypeSpec } from './transaction-type-spec';

function fmtCur(n: number, ccy: string, lang: string): string {
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
  return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${ccy}`;
}

function fmtDateTime(iso: string, lang: string): string {
  const normalized = iso.includes('T') ? iso : iso.replace(' ', 'T');
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    d.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ' · ' +
    d.toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  );
}

/** Drawer satırı → DynamicForm değerleri. */
export function rowToDetailFormValues(
  row: AgentTransactionRow,
  lang: string,
  t: (key: string) => string,
  feeFixed: number,
  feeVariable: number,
): Record<string, unknown> {
  const typeSpec = transactionTypeSpec(row.transactionType);
  const roleLabel =
    row.agentRole === 'SenderAgent' ? t('ag_tx_hist_role_sender') : t('ag_tx_hist_role_receiver');

  return {
    senderName: row.senderName,
    receiverName: row.receiverName,
    iban: row.iban ?? '—',
    roleLabel,
    txTypeLabel: t(typeSpec.labelKey),
    amountLabel: fmtCur(row.amount, row.currency, lang),
    feesLabel: fmtCur(feeFixed + feeVariable, row.currency, lang),
    totalLabel: fmtCur(row.amount + feeFixed + feeVariable, row.currency, lang),
    dateLabel: fmtDateTime(row.createdAt, lang),
    referenceNo: row.referenceNo,
    currency: row.currency,
    description: row.description?.trim() || '—',
    revenueLabel:
      row.totalRevenueTry != null ? `${fmtNumber(row.totalRevenueTry, lang)} TRY` : '—',
    _hasIban: !!row.iban,
  };
}
