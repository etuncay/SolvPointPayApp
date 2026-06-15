import type { BackOfficeRole } from '@epay/ui';

/** Spec §10 — widget detay seviyesi */
export type DetailLevel = 'compact' | 'full';

export type WidgetCode =
  | 'my_approvals'
  | 'pending_xfer'
  | 'kyc_manual'
  | 'aml_held'
  | 'rejected'
  | 'daily_volume'
  | 'new_customers'
  | 'top_customers'
  | 'top_agents'
  | 'sys_health';

/** Spec §10 — dashboard_widget_visibility satırı */
export type WidgetVisibility = {
  widget_code: WidgetCode;
  role: BackOfficeRole;
  is_visible: boolean;
  detail_level: DetailLevel;
};

/** Spec §10 — user_preference kaydı */
export type UserPreference = {
  user_id: string;
  language: 'tr' | 'en' | 'ar';
  theme: 'light' | 'dark';
  text_size: 'small' | 'standard' | 'large' | 'xlarge';
  welcome_message: string;
  password_change_frequency: '1' | '3' | '6';
  updated_at: string;
  updated_by: string;
};

export type ApprovalRow = {
  id: string;
  type: string;
  typeCode: string;
  requester: string;
  age: number;
  priority: 'high' | 'med' | 'low';
  amount: number | null;
};

export type TransferRow = {
  id: string;
  customer: string;
  from?: string;
  to?: string;
  amount: number;
  state: string;
  age: number;
  risk?: string;
  rule?: string;
  reason?: string;
};

export type KycRow = {
  id: string;
  customer: string;
  reason: string;
  age: number;
  level: string;
  risk: string;
};

export type TopCustomerRow = {
  rank: number;
  name: string;
  id?: string;
  sent: number;
  received: number;
  withdrawn?: number;
  txCount: number;
};

export type TopAgentRow = {
  rank: number;
  name: string;
  id?: string;
  received: number;
  paid: number;
  txCount: number;
};

export type DailyVolumeHour = {
  hour: number;
  success: number;
  failed: number;
  amount: number;
};

export type NewCustomerDay = {
  day: string | number;
  count: number;
};

export type SysHealthData = {
  successRate: number;
  p95: number;
  p99: number;
  errorRate: number;
  topErrors: { svc: string; errors: number; p95: number; p99: number }[];
};

export type FailedLoginRow = {
  ip: string;
  loc: string;
  when: string;
  ua: string;
};

export type WidgetDataMap = {
  my_approvals: ApprovalRow[];
  pending_xfer: TransferRow[];
  kyc_manual: KycRow[];
  aml_held: TransferRow[];
  rejected: TransferRow[];
  daily_volume: DailyVolumeHour[];
  new_customers: NewCustomerDay[];
  top_customers: TopCustomerRow[];
  top_agents: TopAgentRow[];
  sys_health: SysHealthData;
};

export type DashboardSnapshot = {
  refreshedAt: Date;
  data: WidgetDataMap;
  errors: Partial<Record<WidgetCode, string>>;
};

export type WidgetPayload<K extends WidgetCode = WidgetCode> = {
  refreshedAt: Date;
  data: WidgetDataMap[K] | null;
  error?: string;
};

export type DashboardService = {
  getSnapshot(role: BackOfficeRole, refreshCount: number): Promise<DashboardSnapshot>;
  getWidget<K extends WidgetCode>(
    role: BackOfficeRole,
    code: K,
    refreshCount: number,
  ): Promise<WidgetPayload<K>>;
  refreshAll(role: BackOfficeRole, refreshCount: number): Promise<DashboardSnapshot>;
  getFailedLogins(): Promise<FailedLoginRow[]>;
};

export type WidgetLink = {
  href: string;
  soon: boolean;
  rowHref?: (id: string) => string;
};

export const WIDGET_LINKS: Record<WidgetCode, WidgetLink> = {
  my_approvals: { href: '/approvals', soon: false, rowHref: (id) => `/approvals?ref=${id}` },
  pending_xfer: {
    href: '/transfers?status=pending',
    soon: false,
    rowHref: (id) => `/transfers?id=${id}`,
  },
  kyc_manual: { href: '/ops/kyc', soon: false, rowHref: (id) => `/ops/kyc?id=${id}` },
  aml_held: {
    href: '/transfers?status=aml',
    soon: false,
    rowHref: (id) => `/transfers?id=${id}`,
  },
  rejected: {
    href: '/transfers?status=rejected',
    soon: false,
    rowHref: (id) => `/transfers?id=${id}`,
  },
  daily_volume: { href: '/transfers', soon: false },
  new_customers: { href: '/customers', soon: false },
  top_customers: { href: '/customers', soon: false },
  top_agents: { href: '/agents', soon: false },
  sys_health: { href: '/system/integrations', soon: false },
};

/** Bekleyen iş widget'ları — yüksek öncelikli kümede görünen TRX id'leri düşük öncelikliden çıkarılır. */
export const PENDING_WIDGET_PRIORITY: WidgetCode[] = [
  'aml_held',
  'kyc_manual',
  'my_approvals',
  'pending_xfer',
  'rejected',
];

export const TRANSFER_WIDGETS = new Set<WidgetCode>(['aml_held', 'pending_xfer', 'rejected']);
