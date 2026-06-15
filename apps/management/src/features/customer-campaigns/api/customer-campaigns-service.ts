import type {
  ApplyCampaignParams,
  ApplyCampaignResult,
  AssignCampaignOptions,
  AssignCampaignResult,
  Campaign,
  CampaignFilters,
  CampaignOption,
  CustomerCampaignAssignment,
  SaveCampaignResult,
} from '../domain/types';
import type { CampaignInput, CampaignUpdateInput } from '../domain/types';

export type CampaignChangeLogEntry = {
  id: number;
  action: 'create' | 'update' | 'assign' | 'passivate' | 'batch_expire';
  entityId: number;
  previous: unknown;
  next: unknown;
  at: string;
  by: string;
};

export type CustomerCampaignsService = {
  list(filters?: CampaignFilters): Campaign[];
  create(input: CampaignInput): SaveCampaignResult;
  update(id: number, input: CampaignUpdateInput): SaveCampaignResult;
  listActiveOptions(): CampaignOption[];
  assignToCustomer(
    customerId: number,
    campaignKey: string,
    opts?: AssignCampaignOptions,
  ): AssignCampaignResult;
  getCustomerAssignment(customerId: number): CustomerCampaignAssignment | null;
  applyCampaignToFee(params: ApplyCampaignParams): ApplyCampaignResult;
  runBatchExpire(): number;
  findCampaignByNameOrCode(key: string): Campaign | null;
};
