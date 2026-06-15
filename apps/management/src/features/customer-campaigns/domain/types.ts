import type { FeeCurrency, FeeTransactionType } from '@/features/customer-fees/domain/types';

export type CampaignStatus = 'Active' | 'Passive';

export type Campaign = {
  id: number;
  campaignCode: string;
  name: string;
  description: string;
  fixedFeeGainRate: number;
  commissionGainRate: number;
  transactionType: FeeTransactionType;
  currency: FeeCurrency;
  startDate: string | null;
  endDate: string | null;
  minTxAmount: number | null;
  maxGainPerTx: number | null;
  maxGainTotal: number | null;
  maxUsageCount: number | null;
  status: CampaignStatus;
  changedBy: string;
  changedAt: string;
  recordStatus: number;
};

export type CampaignInput = Omit<Campaign, 'id' | 'status' | 'changedBy' | 'changedAt' | 'recordStatus'> & {
  campaignCode: string;
};

export type CampaignUpdateInput = Omit<CampaignInput, 'campaignCode'>;

export type CampaignFilters = {
  query: string;
  transactionType: string;
  currency: string;
  status: string;
};

export const DEFAULT_CAMPAIGN_FILTERS: CampaignFilters = {
  query: '',
  transactionType: 'any',
  currency: 'any',
  status: 'Active',
};

export type CampaignPermissions = {
  list: boolean;
  insert: boolean;
  update: boolean;
  export: boolean;
};

export type SaveCampaignResult = {
  ok: boolean;
  id?: number;
  error?: string;
};

export type CampaignOption = {
  code: string;
  name: string;
  endDate: string | null;
};

export type CustomerCampaignAssignment = {
  id: number;
  customerId: number;
  campaignId: number;
  campaignCode: string;
  campaignName: string;
  assignedAt: string;
  endDate: string | null;
  usageCount: number;
  totalGainTry: number;
  status: CampaignStatus;
};

export type AssignCampaignOptions = {
  confirm?: boolean;
};

export type AssignCampaignResult = {
  ok: boolean;
  error?: string;
  needsConfirm?: boolean;
};

export type ApplyCampaignParams = {
  customerId: number;
  transactionType: FeeTransactionType;
  currency: FeeCurrency;
  amount: number;
  sourceCountry?: string;
  targetCountry?: string;
  asOfDate?: string;
};

export type ApplyCampaignResult =
  | {
      ok: true;
      baseFee: number;
      campaignGain: number;
      finalFee: number;
      campaignCode: string;
    }
  | {
      ok: false;
      error: string;
    };

export {
  TRANSACTION_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
} from '@/features/customer-fees/domain/types';

export type { FeeCurrency, FeeTransactionType };
