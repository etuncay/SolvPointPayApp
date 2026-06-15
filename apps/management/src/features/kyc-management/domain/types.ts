export type KycEntityKind = 'Customer' | 'Agent';

export type KycDecision =
  | null
  | 'FalsePositive'
  | 'RequestAdditional'
  | 'Rejected'
  | 'PendingVerification'
  | 'Verified';

export type KycReview = {
  id: number;
  entityKind: KycEntityKind;
  entityId: number;
  entityNo: string;
  entityTypeFull: string;
  identityDocumentExtended: string;
  identityNo: string;
  displayName: string;
  phone: string;
  email: string;
  birthDate: string | null;
  queryTime: string;
  queryResultLabel: string;
  previousQueryResultLabel: string | null;
  blockageReason: string | null;
  kycStatusDisplay: string;
  entityStatus: string;
  decision: KycDecision;
  evaluationNote: string | null;
  approvalId: number | null;
  proposedRiskScore: number | null;
  screeningPayloadId: string;
  isKnownException: boolean;
  inQueue: boolean;
};

export type KycReviewListRow = KycReview;

export type KycKnownException = {
  id: string;
  listId: string;
  matchRule: string;
  threshold: number;
  identityKey: string;
};

export type KycEntityDocument = {
  id: string;
  title: string;
  status: string;
  uploadedAt: string;
};

export type KycAuditEntry = {
  id: string;
  at: string;
  actorName: string;
  action: string;
  note: string | null;
};

export type KycReviewDetail = KycReview & {
  riskScore: number;
  riskSegment: string;
  rawJson: unknown;
  documents: KycEntityDocument[];
  auditLog: KycAuditEntry[];
};

export type KycActionResult = {
  ok: boolean;
  error?: string;
  approvalId?: number;
};

export type KycNoteInput = {
  evaluationNote: string;
};

export type KycVerifyInput = KycNoteInput & {
  riskScore: number;
  approverUserId: string;
};

export type KycDocumentInput = {
  category: string;
  type: string;
  validFrom: string;
  validTo: string;
};

export type KycPermissions = {
  list: boolean;
  detail: boolean;
  falsePositive: boolean;
  requestAdditional: boolean;
  reject: boolean;
  verifySubmit: boolean;
  verifyFinalize: boolean;
  addDocument: boolean;
};

export type EntityStatePatch = {
  status?: string;
  blockReason?: string | null;
  closeReason?: string | null;
  kyc?: string;
  kycType?: 'kyc_level' | 'approval_status';
  riskScore?: number;
};
