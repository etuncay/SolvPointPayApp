import { TRANSACTIONS } from '@/mocks/transactions';
import { isWithinIstanbulDay } from '../domain/istanbul-day';
import { toAmountTry } from '../domain/try-conversion';
import type { GeneratorContext, ReportColumnDef, ReportParams, ReportResult } from '../domain/types';

export function correlationId(): string {
  return `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function baseResult(
  columns: ReportColumnDef[],
  rows: Record<string, unknown>[],
  summary?: Record<string, number>,
): ReportResult {
  return {
    columns,
    rows,
    summary,
    generatedAt: new Date('2026-05-24T12:00:00Z').toISOString(),
    correlationId: correlationId(),
  };
}

export function inDateRange(iso: string, params: ReportParams): boolean {
  if (!params.dateFrom || !params.dateTo) return true;
  const t = new Date(iso).getTime();
  return (
    t >= new Date(params.dateFrom).getTime() &&
    t <= new Date(`${params.dateTo}T23:59:59`).getTime()
  );
}

export function filterTransactions(params: ReportParams, predicate: (tx: (typeof TRANSACTIONS)[0]) => boolean) {
  return TRANSACTIONS.filter(
    (tx) =>
      tx.recordStatus === 1 &&
      predicate(tx) &&
      (params.reportDate
        ? isWithinIstanbulDay(tx.createdAt, params.reportDate)
        : inDateRange(tx.createdAt, params)),
  );
}

export function mapTxRow(tx: (typeof TRANSACTIONS)[0]) {
  const amountTry = toAmountTry(tx.amount, tx.currency, tx.createdAt);
  return {
    txNo: tx.txNo,
    referenceNo: tx.referenceNo,
    type: tx.type,
    currency: tx.currency,
    amount: tx.amount,
    amountTry,
    status: tx.status,
    createdAt: tx.createdAt,
  };
}

export function defaultRangeParams(): ReportParams {
  return { dateFrom: '2026-04-01', dateTo: '2026-05-24' };
}

export function defaultReportDate(): string {
  return '2026-05-24';
}

export function emptyCtx(): GeneratorContext {
  return { role: 'finance', userId: 'u1', now: new Date('2026-05-24T12:00:00Z') };
}
