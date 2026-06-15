import type {
  FeeCurrency,
  FeeStatus,
  FeeTransactionType,
} from '@/features/customer-fees/domain/types';

export type {
  FeeCurrency,
  FeeStatus,
  FeeTransactionType,
} from '@/features/customer-fees/domain/types';

export {
  TRANSACTION_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  FEE_STATUS_OPTIONS,
} from '@/features/customer-fees/domain/types';

/** agent_fee satırı */
export type AgentFee = {
  id: number;
  groupCode: string;
  transactionType: FeeTransactionType;
  currency: FeeCurrency;
  lowerLimit: number;
  fixedFee: number;
  variableFeePct: number;
  startDate: string | null;
  endDate: string | null;
  status: FeeStatus;
  changedBy: string;
  changedAt: string;
  recordStatus: number;
};

export type AgentFeeInput = {
  groupCode: string;
  transactionType: FeeTransactionType;
  currency: FeeCurrency;
  lowerLimit: number;
  fixedFee: number;
  variableFeePct: number;
  startDate: string | null;
  endDate: string | null;
};

export type AgentFeeUpdateInput = {
  fixedFee: number;
  variableFeePct: number;
  startDate: string | null;
  endDate: string | null;
};

export type AgentFeePermissions = {
  list: boolean;
  insert: boolean;
  update: boolean;
  export: boolean;
};

export type SaveAgentFeeResult = {
  ok: boolean;
  id?: number;
  error?: string;
};

export type AgentFeeFilters = {
  query: string;
  groupCode: string;
  transactionType: string;
  currency: string;
  status: string;
};

export const DEFAULT_AGENT_FEE_FILTERS: AgentFeeFilters = {
  query: '',
  groupCode: 'any',
  transactionType: 'any',
  currency: 'any',
  status: 'Active',
};

export type CalculateAgentFeeParams = {
  groupCode: string;
  transactionType: FeeTransactionType;
  currency: FeeCurrency;
  amount: number;
  asOfDate?: string;
};

export type CalculateAgentFeeResult =
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

/** Kombinasyon anahtarı — çakışma tespiti */
export function agentFeeComboKey(
  input: Pick<AgentFeeInput, 'groupCode' | 'transactionType' | 'currency' | 'lowerLimit'>,
): string {
  return `${input.groupCode.toUpperCase()}|${input.transactionType}|${input.currency}|${input.lowerLimit}`;
}
