import { CUSTOMERS } from '@/mocks/data';
import { getBankReconciliationsStoreSnapshot } from '@/features/banks/reconciliation/api/mock-bank-reconciliations-adapter';
import { getSupportCasesStore } from '@/mocks/support-cases-store';
import { isWithinIstanbulDay } from '../domain/istanbul-day';
import { toAmountTry } from '../domain/try-conversion';
import type { ReportGenerator } from '../domain/types';
import { baseResult, filterTransactions, mapTxRow } from './shared';

export const dailyCommissionFees: ReportGenerator = async (params) => {
  const reportDate = params.reportDate ?? '2026-05-24';
  const txs = filterTransactions({ ...params, reportDate }, () => true);
  const byCurrency = new Map<string, { feeTry: number; count: number }>();
  for (const tx of txs) {
    const fee = (tx.feeFixed ?? 0) + (tx.feeVariable ?? 0);
    const feeTry = toAmountTry(fee, tx.currency, tx.createdAt);
    const cur = byCurrency.get(tx.currency) ?? { feeTry: 0, count: 0 };
    cur.feeTry += feeTry;
    cur.count += 1;
    byCurrency.set(tx.currency, cur);
  }
  const rows = [...byCurrency.entries()].map(([currency, v]) => ({
    currency,
    txCount: v.count,
    feeTry: Math.round(v.feeTry * 100) / 100,
  }));
  const totalTry = rows.reduce((s, r) => s + Number(r.feeTry), 0);
  return baseResult(
    [
      { key: 'currency', labelKey: 'rpt_col_currency' },
      { key: 'txCount', labelKey: 'rpt_col_count' },
      { key: 'feeTry', labelKey: 'rpt_col_fee_try' },
    ],
    rows,
    { totalTry },
  );
};

export const dailyReconciliationInventory: ReportGenerator = async (params) => {
  const reportDate = params.reportDate ?? '2026-05-24';
  const recons = getBankReconciliationsStoreSnapshot().filter((r) =>
    isWithinIstanbulDay(r.reconciliationDate.replace(' ', 'T'), reportDate),
  );
  const cases = getSupportCasesStore();
  const rows = recons.map((r) => {
    const c = r.caseId != null ? cases.find((x) => x.id === r.caseId) : null;
    return {
      referenceNo: r.referenceNo,
      bank: r.bank,
      status: r.status,
      amountTry: toAmountTry(r.amount, r.bankCurrency, r.reconciliationDate),
      caseNo: c?.caseNo ?? r.caseNo ?? '—',
    };
  });
  return baseResult(
    [
      { key: 'referenceNo', labelKey: 'rpt_col_reference' },
      { key: 'bank', labelKey: 'rpt_col_bank' },
      { key: 'status', labelKey: 'rpt_col_status' },
      { key: 'amountTry', labelKey: 'rpt_col_amount_try' },
      { key: 'caseNo', labelKey: 'rpt_col_case_no' },
    ],
    rows,
  );
};

export const protectionAccount: ReportGenerator = async (params) => {
  const reportDate = params.reportDate ?? '2026-05-24';
  return baseResult(
    [
      { key: 'account', labelKey: 'rpt_col_account' },
      { key: 'balanceTry', labelKey: 'rpt_col_balance_try' },
      { key: 'asOf', labelKey: 'rpt_col_date' },
    ],
    [
      {
        account: 'Koruma Hesabı — TRY',
        balanceTry: 12_450_000,
        asOf: reportDate,
      },
    ],
  );
};

export const transactionVolumeStats: ReportGenerator = async (params) => {
  const txs = filterTransactions(params, (tx) => tx.status === 'Completed');
  const channels = new Map<string, { count: number; volumeTry: number }>();
  for (const tx of txs) {
    const ch = params.channel && params.channel !== 'any' ? params.channel : tx.type;
    if (params.channel && params.channel !== 'any' && tx.type !== params.channel) continue;
    const cur = channels.get(ch) ?? { count: 0, volumeTry: 0 };
    cur.count += 1;
    cur.volumeTry += toAmountTry(tx.amount, tx.currency, tx.createdAt);
    channels.set(ch, cur);
  }
  const rows = [...channels.entries()].map(([channel, v]) => ({
    channel,
    count: v.count,
    volumeTry: Math.round(v.volumeTry * 100) / 100,
  }));
  return baseResult(
    [
      { key: 'channel', labelKey: 'rpt_col_channel' },
      { key: 'count', labelKey: 'rpt_col_count' },
      { key: 'volumeTry', labelKey: 'rpt_col_volume_try' },
    ],
    rows,
  );
};

export const entityKycSummary: ReportGenerator = async (params) => {
  const entityType = params.entityType ?? 'any';
  let rows = CUSTOMERS.filter((c) => c.status === 'active').map((c) => ({
    entityType: c.type === 'corporate' ? 'Corporate' : 'Individual',
    entityNo: String(c.id),
    name: c.name,
    kyc: c.kyc,
    riskScore: c.riskScore,
  }));
  if (entityType !== 'any') {
    rows = rows.filter((r) => r.entityType === entityType);
  }
  return baseResult(
    [
      { key: 'entityNo', labelKey: 'rpt_col_entity' },
      { key: 'name', labelKey: 'rpt_col_name' },
      { key: 'kyc', labelKey: 'rpt_col_kyc' },
      { key: 'riskScore', labelKey: 'rpt_col_risk' },
    ],
    rows.slice(0, 50),
  );
};
