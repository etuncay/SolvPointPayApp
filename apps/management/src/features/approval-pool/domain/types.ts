import type { BackOfficeRole } from '@epay/ui';

export type ApprovalStageStatus = 'Pending' | 'Approved' | 'Rejected';

export type ApprovalUiStatus =
  | 'awaiting_first'
  | 'awaiting_second'
  | 'second_rejected'
  | 'approved'
  | 'rejected'
  | 'superseded'
  | 'withdrawn'
  | 'canceled';

export type ApprovalListFilter =
  | 'pending_mine'
  | 'initiated_mine'
  | 'approved_mine'
  | 'rejected_mine'
  | 'all';

export type PayloadChange = {
  field: string;
  label: string;
  oldValue: string;
  newValue: string;
};

export type ApprovalPayload = {
  screenKey: string;
  summary?: string;
  changes: PayloadChange[];
  raw?: Record<string, unknown>;
  /** Onay ekranında render edilecek form anahtarı (approval-form-registry). Yoksa özet tablo gösterilir. */
  formKey?: string;
  /** Form initialValues şekli — yeni değerler (onay görünümünde forma yüklenir) */
  newValues?: Record<string, unknown>;
  /** Eski değer snapshot'ı (düzenleme onaylarında alan-bazlı diff için; yeni kayıtta boş) */
  oldValues?: Record<string, unknown>;
};

export type ApprovalRequest = {
  id: number;
  referenceNo: string;
  screenName: string;
  payload: ApprovalPayload;
  requiredApprovals: 1 | 2;
  initiatedBy: string;
  initiatedByName: string;
  initiatedAt: string;
  firstApprover: string | null;
  firstApproverName: string | null;
  firstApprovalAt: string | null;
  firstStatus: ApprovalStageStatus | null;
  secondApprover: string | null;
  secondApproverName: string | null;
  secondApprovalAt: string | null;
  secondStatus: ApprovalStageStatus | null;
  uiStatus: ApprovalUiStatus;
  previousApprovalRef: number | null;
  comment: string | null;
  /** Son aksiyonu yapan kullanıcı id (onay/red filtreleri için) */
  lastActionBy?: string | null;
};

export type ApprovalListItem = ApprovalRequest;

export type ApprovalActionResult = {
  ok: boolean;
  error?: string;
  id?: number;
};

export type ApprovalPermissions = {
  list: boolean;
  view: boolean;
  approve: boolean;
  reject: boolean;
  withdraw: boolean;
};

export type CurrentUser = {
  id: string;
  displayName: string;
  role: BackOfficeRole;
  canFirstApprove: boolean;
  canSecondApprove: boolean;
};

export type ApprovalAuditEntry = {
  at: string;
  by: string;
  byName: string;
  action: 'approve' | 'reject' | 'withdraw' | 'resubmit';
  comment?: string;
};

export const MOCK_USER_IDS = {
  ops: 'u.ops',
  compliance: 'u.comp',
  management: 'u.mgmt',
  finance: 'u.fin',
} as const;
