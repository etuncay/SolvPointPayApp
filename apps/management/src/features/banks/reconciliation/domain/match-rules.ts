import type { FeeCurrency } from '@/features/customer-fees/domain/types';
import type { ReconParams } from '@/mocks/reconciliation-params';
import type { ReconciliationStatus } from './types';

export type MatchLine = {
  referenceNo: string;
  bankTransactionNo: string;
  amount: number;
  currency: FeeCurrency;
  transactionDate: string;
  bank: string;
};

export type MatchOutcome = {
  status: ReconciliationStatus;
  bankAmount: number;
  bankCurrency: FeeCurrency;
  bank: string;
  matchedBy: 'referenceNo' | 'bankTransactionNo' | 'amountDate' | null;
};

function parseTs(ts: string): number {
  return new Date(ts.replace(' ', 'T')).getTime();
}

function withinDateTolerance(a: string, b: string, hours: number): boolean {
  const diff = Math.abs(parseTs(a) - parseTs(b));
  return diff <= hours * 60 * 60 * 1000;
}

function withinAmountTolerance(
  firmAmount: number,
  bankAmount: number,
  currency: FeeCurrency,
  params: ReconParams,
): boolean {
  const tol = currency === 'TRY' ? params.amountToleranceTry : params.amountToleranceTry;
  return Math.abs(firmAmount - bankAmount) <= tol;
}

function pickMovement(
  firm: MatchLine,
  movements: MatchLine[],
  params: ReconParams,
): { movement: MatchLine; matchedBy: MatchOutcome['matchedBy'] } | null {
  const ref = firm.referenceNo.trim();
  if (ref) {
    const byRef = movements.find((m) => m.referenceNo.trim() === ref);
    if (byRef) return { movement: byRef, matchedBy: 'referenceNo' };
  }

  const btx = firm.bankTransactionNo.trim();
  if (btx) {
    const byTx = movements.find((m) => m.bankTransactionNo.trim() === btx);
    if (byTx) return { movement: byTx, matchedBy: 'bankTransactionNo' };
  }

  const byAmtDate = movements.find(
    (m) =>
      m.currency === firm.currency &&
      withinDateTolerance(firm.transactionDate, m.transactionDate, params.dateToleranceHours) &&
      withinAmountTolerance(firm.amount, m.amount, firm.currency, params),
  );
  if (byAmtDate) return { movement: byAmtDate, matchedBy: 'amountDate' };

  return null;
}

/** §8 eşleştirme sırası — refNo → bankTxNo → tutar+tarih */
export function matchFirmToBank(
  firm: MatchLine,
  movements: MatchLine[],
  params: ReconParams,
): MatchOutcome {
  const hit = pickMovement(firm, movements, params);
  if (!hit) {
    return {
      status: 'Unmatched',
      bankAmount: 0,
      bankCurrency: firm.currency,
      bank: firm.bank,
      matchedBy: null,
    };
  }

  const { movement, matchedBy } = hit;
  const dateOk = withinDateTolerance(
    firm.transactionDate,
    movement.transactionDate,
    params.dateToleranceHours,
  );
  const amountOk = withinAmountTolerance(
    firm.amount,
    movement.amount,
    firm.currency,
    params,
  );

  if (matchedBy === 'amountDate' && (!dateOk || !amountOk)) {
    return {
      status: 'Unmatched',
      bankAmount: movement.amount,
      bankCurrency: movement.currency,
      bank: movement.bank,
      matchedBy,
    };
  }

  if (!amountOk) {
    return {
      status: 'Unmatched',
      bankAmount: movement.amount,
      bankCurrency: movement.currency,
      bank: movement.bank,
      matchedBy,
    };
  }

  return {
    status: 'Matched',
    bankAmount: movement.amount,
    bankCurrency: movement.currency,
    bank: movement.bank,
    matchedBy,
  };
}
