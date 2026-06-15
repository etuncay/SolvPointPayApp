import type { FeeTransactionType } from '@epay/domain';

export type { FeeTransactionType };

export type FeeCurrency = 'TRY' | 'USD' | 'EUR';

export type FeeCountry = 'ALL' | 'TUR' | 'DEU' | 'USA' | 'GBR';

export type FeeStatus = 'Active' | 'Passive';

/** customer_fee satırı */
export type CustomerFee = {
  id: number;
  transactionType: FeeTransactionType;
  currency: FeeCurrency;
  lowerLimit: number;
  fixedFee: number;
  variableFeePct: number;
  startDate: string | null;
  endDate: string | null;
  sourceCountry: FeeCountry;
  targetCountry: FeeCountry;
  status: FeeStatus;
  changedBy: string;
  changedAt: string;
  recordStatus: number;
};

export type CustomerFeeInput = {
  transactionType: FeeTransactionType;
  currency: FeeCurrency;
  lowerLimit: number;
  fixedFee: number;
  variableFeePct: number;
  startDate: string | null;
  endDate: string | null;
  sourceCountry: FeeCountry;
  targetCountry: FeeCountry;
};

export type CustomerFeePermissions = {
  list: boolean;
  insert: boolean;
  update: boolean;
  export: boolean;
};

export type SaveFeeResult = {
  ok: boolean;
  id?: number;
  error?: string;
};

export type CustomerFeeFilters = {
  query: string;
  transactionType: string;
  currency: string;
  status: string;
};

export const DEFAULT_FEE_FILTERS: CustomerFeeFilters = {
  query: '',
  transactionType: 'any',
  currency: 'any',
  status: 'Active',
};

export type CalculateFeeParams = {
  transactionType: FeeTransactionType;
  currency: FeeCurrency;
  amount: number;
  sourceCountry: FeeCountry;
  targetCountry: FeeCountry;
  asOfDate?: string;
};

export type CalculateFeeResult =
  | {
      ok: true;
      feeId: number;
      fixedFee: number;
      variableFeePct: number;
      totalFee: number;
      lowerLimit: number;
    }
  | {
      ok: false;
      error: string;
    };

export const TRANSACTION_TYPE_OPTIONS: FeeTransactionType[] = [
  'WalletToPerson',
  'InternationalTransfer',
  'WalletToBankAccount',
  'WalletTopUp',
];

export const CURRENCY_OPTIONS: FeeCurrency[] = ['TRY', 'USD', 'EUR'];

export const COUNTRY_OPTIONS: FeeCountry[] = ['ALL', 'TUR', 'DEU', 'USA', 'GBR'];

export const FEE_STATUS_OPTIONS: FeeStatus[] = ['Active', 'Passive'];

/** Kombinasyon anahtarı — çakışma tespiti */
export function feeComboKey(input: Pick<
  CustomerFeeInput,
  'transactionType' | 'currency' | 'lowerLimit' | 'sourceCountry' | 'targetCountry'
>): string {
  return `${input.transactionType}|${input.currency}|${input.lowerLimit}|${input.sourceCountry}|${input.targetCountry}`;
}
