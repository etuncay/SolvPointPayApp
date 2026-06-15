export const REFERENCE_LIST_CODES = [
  'RiskyCountries',
  'RiskyPhonePrefixes',
  'RiskyEmailProviders',
  'RiskyCities',
  'UsuallyUsedCurrencies',
  'BlacklistedKeywords',
  'RiskyAgents',
  'RiskyCustomers',
  'RiskyCredentials',
  'RiskyIPs',
  'RiskyOccupations',
] as const;

export type ReferenceListCode = (typeof REFERENCE_LIST_CODES)[number];

export type ReferenceSourceTag = 'manual' | 'fatf_feed' | 'tor_feed';

export type ReferenceListItem = {
  id: string;
  listCode: ReferenceListCode;
  value: string;
  sourceTag?: ReferenceSourceTag;
  effectiveFrom: string;
  effectiveTo?: string | null;
};

export type OccupationThreshold = {
  occupationId: string;
  occupationLabel: string;
  maxMonthlyIncome: number;
  maxSingleTxAmount: number;
  maxMonthlyTxAmount: number;
};

export type CaseGroupType = 'Operator' | 'Manager' | 'Custom';

export type CaseGroup = {
  id: string;
  name: string;
  type: CaseGroupType;
  isDefault: boolean;
  memberIds: string[];
};

export type CaseRoutingRule = {
  id: string;
  conditionDsl: string;
  targetGroupId: string;
  autoDistribute: boolean;
  sortOrder: number;
};

export type FraudEngineParamKey = 'fraud_engine_timeout_ms';

export type FraudEngineParams = {
  fraud_engine_timeout_ms: string;
};

export type RiskManagementAuditEntry = {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  performedBy: string;
  createdAt: string;
};

export type AssignableGroup = CaseGroup & {
  members: { userId: string; displayName: string }[];
};

export type ReferenceListsPayload = {
  items: ReferenceListItem[];
  occupationThresholds: OccupationThreshold[];
};

export type GroupsPayload = {
  groups: CaseGroup[];
};

export type RoutingRulesPayload = {
  rules: CaseRoutingRule[];
};

export type SaveResult = {
  ok: boolean;
  error?: string;
  auditId?: string;
};

export type RouteTargetResolution = {
  groupId: string;
  userId: string;
  autoDistributed: boolean;
};
