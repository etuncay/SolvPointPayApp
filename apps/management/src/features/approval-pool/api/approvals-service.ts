import type {
  ApprovalActionResult,
  ApprovalListFilter,
  ApprovalPayload,
  ApprovalRequest,
  CurrentUser,
} from '../domain/types';

export type CreateApprovalRequestInput = {
  screenKey: string;
  screenName: string;
  initiatedBy: CurrentUser;
  requiredApprovals: 1 | 2;
  payload: ApprovalPayload;
};

export type ApprovalsService = {
  list(filter: ApprovalListFilter, user: CurrentUser): ApprovalRequest[];
  getById(id: number): ApprovalRequest | null;
  countPendingForUser(user: CurrentUser): number;
  createRequest(input: CreateApprovalRequestInput): ApprovalActionResult & { approvalId?: number };
  approve(id: number, user: CurrentUser, comment?: string): ApprovalActionResult;
  reject(id: number, user: CurrentUser, comment: string): ApprovalActionResult;
  withdraw(id: number, user: CurrentUser): ApprovalActionResult;
  resubmit(id: number, user: CurrentUser): ApprovalActionResult;
};
