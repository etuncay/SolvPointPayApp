import type {
  CustomerTxMetricRow,
  RelatedCustomerRow,
} from '@/features/risk-compliance/cases/detail/domain/types';

type MetricRow = { label: string; value: string };

/** 7.5.2 Müşteri künyesi — hesaplanmış/sistem verisi (salt-okunur). */
export type CustomerProfileFields = {
  riskCategory: string;
  idType: string;
  idCountry: string;
  birthCountry: string;
  addressCountry: string;
  birthDate: string;
  declaredIncome: string;
  occupation: string;
  address: string;
  accountAge: string;
  addressVerified: string;
};

export type AgentProfileFields = {
  riskCategory: string;
  country: string;
};

export type CaseDetailProfile = {
  linkedCustomersCount: number;
  assignedToManager: boolean;
  hideAgentPanel: boolean;
  txMetrics: CustomerTxMetricRow[];
  accessSignals: MetricRow[];
  agentMetrics: MetricRow[];
  customerProfile: CustomerProfileFields;
  agentProfile: AgentProfileFields;
  relatedCustomers: RelatedCustomerRow[];
  sharedEmails?: string[];
  sharedPhones?: string[];
};

/* ──────────────────────────────────────────────────────────
 * Fraud attribute kataloğu (7.5.2 panelleri — GenelIsleyis "Attributes").
 * Pencere (`windows`) tanımlıysa attribute her gün-penceresi için ayrı satır üretir.
 * ────────────────────────────────────────────────────────── */

type AttrSpec = { attr: string; windows?: number[] };

/** Panel 3 — Müşteri İşlem Geçmişi */
const HISTORY_SPECS: AttrSpec[] = [
  { attr: 'EODBalanceAvg', windows: [30] },
  { attr: 'SendingTxCount', windows: [1, 7, 30] },
  { attr: 'ReceivingTxCount', windows: [1, 7, 30] },
  { attr: 'TxCountLastHour' },
  { attr: 'SendingAmountTotal', windows: [1, 7, 30] },
  { attr: 'ReceivingAmountTotal', windows: [1, 7, 30] },
  { attr: 'SendingAmountLastHour' },
  { attr: 'ReceivingAmountLastHour' },
  { attr: 'SendingAmountAvg', windows: [1, 7, 30] },
  { attr: 'ReceivingAmountAvg', windows: [1, 7, 30] },
  { attr: 'SendingAmountStdDev', windows: [30] },
  { attr: 'IncomingFlatAmountShare', windows: [30] },
  { attr: 'ComplaintCount', windows: [30] },
  { attr: 'ManualReviewCount', windows: [30] },
  { attr: 'ChargebackCount', windows: [30] },
  { attr: 'UniqueReceiverCount', windows: [1, 7, 30] },
  { attr: 'UniqueSenderCount', windows: [1, 7, 30] },
];

/** Panel 4 — Erişim Bilgileri */
const ACCESS_SPECS: string[] = [
  'DeviceCountToday',
  'SameDeviceCustomerCountToday',
  'IPCountToday',
  'SameIPCustomerCountToday',
  'FailedLoginAttemptsLastHour',
  'LastContactInfoChangeDate',
  'LastTxDate',
  'ImpossibleTravel',
];

/** Panel 5 — Temsilci işlem metrikleri */
const AGENT_METRIC_SPECS: AttrSpec[] = [
  { attr: 'TxCountDays', windows: [1, 7, 30] },
  { attr: 'TxCountLastHour' },
  { attr: 'AmountTotal', windows: [1, 7, 30] },
  { attr: 'AmountAvg', windows: [1, 7, 30] },
  { attr: 'ComplaintCount', windows: [30] },
  { attr: 'ManualReviewCount', windows: [30] },
  { attr: 'ChargebackCount', windows: [30] },
];

const RISK_CATEGORIES = ['Low', 'Medium', 'High', 'Critical'];
const OCCUPATIONS = ['Serbest Meslek', 'Memur', 'Mühendis', 'Esnaf', 'Emekli'];

/** Deterministik sözde-rastgele (caseId + anahtar) — seed'e bağlı stabil değer. */
function hash(seed: number, key: string): number {
  let h = seed >>> 0;
  for (let i = 0; i < key.length; i++) h = (Math.imul(h, 33) + key.charCodeAt(i)) >>> 0;
  return h % 1000;
}

function seedFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
  return h % 9973;
}

/** Binlik ayraçlı tam sayı (ICU-bağımsız, deterministik). */
function grp(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const fmtTRY = (n: number) => `${grp(n)} TRY`;

function attrLabel(attr: string, window?: number): string {
  return window ? `${attr}(${window})` : attr;
}

function attrValue(seed: number, attr: string, window?: number): string {
  const label = attrLabel(attr, window);
  const r = hash(seed, label);
  if (attr === 'ImpossibleTravel') return r % 6 === 0 ? 'Evet' : 'Hayır';
  if (/Date$/.test(attr)) {
    const day = (1 + (r % 27)).toString().padStart(2, '0');
    const month = (1 + (r % 5)).toString().padStart(2, '0');
    return `2026-${month}-${day}`;
  }
  if (/Share/.test(attr)) return `%${5 + (r % 40)}`;
  if (/StdDev/.test(attr)) return fmtTRY(500 + r * 9);
  if (/Balance|Amount/.test(attr)) {
    const cumulative = /Total/.test(attr);
    const unit = /Avg|LastHour/.test(attr) ? 800 + r * 8 : 3000 + r * 22;
    return fmtTRY(cumulative && window ? unit * window : unit);
  }
  // sayım türü metrikler
  const cumulative =
    /Total|SendingTxCount|ReceivingTxCount|UniqueReceiverCount|UniqueSenderCount|TxCountDays/.test(
      attr,
    ) && !/LastHour/.test(attr);
  const base = 1 + (r % 12);
  return String(cumulative && window ? base * window : base);
}

function buildRows(seed: number, specs: AttrSpec[]): MetricRow[] {
  const out: MetricRow[] = [];
  for (const s of specs) {
    if (s.windows) {
      for (const w of s.windows) out.push({ label: attrLabel(s.attr, w), value: attrValue(seed, s.attr, w) });
    } else {
      out.push({ label: s.attr, value: attrValue(seed, s.attr) });
    }
  }
  return out;
}

function buildAccess(seed: number): MetricRow[] {
  return ACCESS_SPECS.map((attr) => ({ label: attr, value: attrValue(seed, attr) }));
}

function buildCustomerProfile(seed: number, overrides?: Partial<CustomerProfileFields>): CustomerProfileFields {
  return {
    riskCategory: RISK_CATEGORIES[seed % RISK_CATEGORIES.length],
    idType: 'TCKN',
    idCountry: 'TR',
    birthCountry: 'TR',
    addressCountry: 'TR',
    birthDate: `19${70 + (seed % 30)}-0${1 + (seed % 8)}-${(10 + (seed % 18)).toString()}`,
    declaredIncome: fmtTRY(15000 + (seed % 50) * 1000),
    occupation: OCCUPATIONS[seed % OCCUPATIONS.length],
    address: 'İstanbul, Türkiye',
    accountAge: `${1 + (seed % 72)} ay`,
    addressVerified: seed % 4 === 0 ? 'Doğrulanmadı' : 'Doğrulandı',
    ...overrides,
  };
}

function buildAgentProfile(seed: number): AgentProfileFields {
  return {
    riskCategory: RISK_CATEGORIES[(seed + 1) % RISK_CATEGORIES.length],
    country: 'TR',
  };
}

/* ──────────────────────────────────────────────────────────
 * Vaka-özel seed yapılandırması (panel verisi seed'den türetilir).
 * ────────────────────────────────────────────────────────── */

type CaseSeed = {
  linkedCustomersCount: number;
  assignedToManager: boolean;
  hideAgentPanel: boolean;
  relatedCustomers: RelatedCustomerRow[];
  sharedEmails?: string[];
  sharedPhones?: string[];
  customerOverrides?: Partial<CustomerProfileFields>;
};

const CASE_SEEDS: Record<string, CaseSeed> = {
  'C-1001': {
    linkedCustomersCount: 2,
    assignedToManager: false,
    hideAgentPanel: false,
    relatedCustomers: [
      { customerId: 99902, name: 'Hatice Acar', relation: 'SharedDevice', txCount1y: 8, totalAmount1y: 22_400 },
      { customerId: 99915, name: 'Mehmet Kaya', relation: 'Counterparty', txCount1y: 3, totalAmount1y: 9_800 },
    ],
    sharedEmails: ['hatice.acar@gmail.com'],
    sharedPhones: ['+90 590 598 65 71'],
    customerOverrides: { riskCategory: 'High', occupation: 'Kuyumcu', addressVerified: 'Doğrulandı' },
  },
  'C-1002': {
    linkedCustomersCount: 0,
    assignedToManager: false,
    hideAgentPanel: true,
    relatedCustomers: [],
  },
  'C-1003': {
    linkedCustomersCount: 1,
    assignedToManager: true,
    hideAgentPanel: false,
    relatedCustomers: [
      { customerId: 99908, name: 'Ali Veli', relation: 'IBAN', txCount1y: 5, totalAmount1y: 15_200 },
    ],
    sharedPhones: ['+90 532 100 22 33'],
  },
};

function composeProfile(caseId: string, cfg: CaseSeed): CaseDetailProfile {
  const seed = seedFromId(caseId);
  return {
    linkedCustomersCount: cfg.linkedCustomersCount,
    assignedToManager: cfg.assignedToManager,
    hideAgentPanel: cfg.hideAgentPanel,
    txMetrics: buildRows(seed, HISTORY_SPECS),
    accessSignals: buildAccess(seed),
    agentMetrics: buildRows(seed, AGENT_METRIC_SPECS),
    customerProfile: buildCustomerProfile(seed, cfg.customerOverrides),
    agentProfile: buildAgentProfile(seed),
    relatedCustomers: cfg.relatedCustomers,
    sharedEmails: cfg.sharedEmails,
    sharedPhones: cfg.sharedPhones,
  };
}

export function getCaseDetailProfile(caseId: string): CaseDetailProfile {
  const cfg =
    CASE_SEEDS[caseId] ??
    ({
      linkedCustomersCount: 0,
      assignedToManager: false,
      hideAgentPanel: false,
      relatedCustomers: [],
    } satisfies CaseSeed);
  return composeProfile(caseId, cfg);
}
