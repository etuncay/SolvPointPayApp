import { legacyGroupFromKey, syncAssignmentFromAgentGroup } from '@/features/agent-groups/api';
import { AGENTS, type Agent } from '@/mocks/agents';
import { SAMPLE_AGENT } from '@/mocks/sample-agent';
import { upsertAgentListItem } from '@/features/agents/api/mock-agents-adapter';
import type { AgentDetailService } from './agent-detail-service';
import type {
  AgentDetail,
  AgentFormValues,
  AgentWalletRow,
  SaveResult,
} from '../domain/types';
import type { DocumentRow } from '@/mocks/sample-person';
import { validateAgentDocumentsForSave } from '../domain/required-documents';
import type { OrganizationType } from '../domain/types';
import { assertAuthorizedKycLevel, assertUboPresent } from '../domain/kyc-guards';
import { registerAgentApprovalApply } from './agent-approval-bridge';

const VKN_DEMO = '1792956117';
const DEFAULT_GROUP_KEY = 'standard';

let nextId = 100050;
let nextDocId = 500;
let nextShId = 500;
let nextAuthId = 500;

function groupFromKey(key: string) {
  return legacyGroupFromKey(key);
}

function defaultWallets(id: number): AgentWalletRow[] {
  const suffix = String(id).slice(-4);
  return [
    {
      id: `BY-${suffix}-01`,
      type: 'agent_advance',
      balance: 0,
      currency: 'TRY',
      blocked: 0,
      txCountDay: 0,
      txAmountDay: 0,
    },
    {
      id: `BY-${suffix}-02`,
      type: 'agent_commission',
      balance: 0,
      currency: 'TRY',
      blocked: 0,
      txCountDay: 0,
      txAmountDay: 0,
    },
  ];
}

function agentToDetail(a: Agent): AgentDetail {
  const isSample = a.vkn === SAMPLE_AGENT.taxNo || a.id === 99901;
  const base = isSample
    ? { ...SAMPLE_AGENT, groupKey: a.group.key, settlement: a.settlement }
    : {
        ...SAMPLE_AGENT,
        name: a.name,
        taxNo: a.vkn,
        agentNo: `AGT-${String(a.id).padStart(6, '0')}`,
        groupKey: a.group.key,
        settlement: a.settlement,
        kycStatus: a.status === 'active' ? 'Approved' : 'Pending',
        riskScore: 30,
        riskSegment: 'low',
        createdAt: `${a.createdAt}T12:00:00`,
        status: a.status,
        statusReason: a.blockReason ?? a.closeReason,
        mersisNo: a.mersis.replace(/-/g, '').slice(0, 16).padEnd(16, '0'),
        banks: [],
        documents: [],
        shareholders: [],
        authorizedPersons: [],
        financialWallets: [
          {
            id: `BY-${String(a.id).slice(-4)}-01`,
            type: 'agent_advance' as const,
            balance: a.balance.TRY,
            currency: 'TRY',
            blocked: 0,
            txCountDay: a.txToday,
            txAmountDay: a.txToday * 4200,
          },
          {
            id: `BY-${String(a.id).slice(-4)}-02`,
            type: 'agent_commission' as const,
            balance: Math.floor(a.balance.TRY * 0.015),
            currency: 'TRY',
            blocked: 0,
            txCountDay: Math.floor(a.txToday * 0.3),
            txAmountDay: Math.floor(a.txToday * 65),
          },
        ],
        contacts: [
          { id: 1, type: 'email' as const, value: a.email, verified: true, primary: true },
          { id: 2, type: 'phone' as const, value: a.phone, verified: true, primary: true, kind: 'mobile' },
        ],
        addresses: SAMPLE_AGENT.addresses.slice(0, 1),
      };

  return { ...base, id: a.id, blockEndDate: null };
}

function buildStore(): Map<number, AgentDetail> {
  const map = new Map<number, AgentDetail>();
  AGENTS.filter((a) => a.recordStatus === 1).forEach((a) => {
    map.set(a.id, agentToDetail(a));
  });
  return map;
}

let store = buildStore();

function formToDetail(id: number, payload: AgentFormValues, status: string): AgentDetail {
  return {
    ...payload,
    id,
    agentNo: payload.agentNo || `AGT-${String(id).padStart(6, '0')}`,
    status,
    financialWallets: payload.financialWallets ?? defaultWallets(id),
    limits: payload.limits ?? { perTx: 100000, daily: 500000, monthly: 2000000, currency: 'TRY' },
    createdAt: payload.createdAt ?? new Date().toISOString(),
    statusReason: payload.statusReason ?? null,
  };
}

function detailToListItem(detail: AgentDetail): Agent {
  const grp = groupFromKey(detail.groupKey);
  const advance = detail.financialWallets.find((w) => w.type === 'agent_advance' && w.currency === 'TRY');
  const email =
    detail.contacts.find((c) => c.type === 'email' && c.primary)?.value ??
    detail.contacts.find((c) => c.type === 'email')?.value ??
    '';
  const phone =
    detail.contacts.find((c) => c.type === 'phone' && c.primary)?.value ??
    detail.contacts.find((c) => c.type === 'phone')?.value ??
    '';

  return {
    id: detail.id,
    name: detail.name,
    city: detail.addresses[0]?.city ?? '—',
    email,
    phone,
    vkn: detail.taxNo,
    mersis: detail.mersisNo.replace(/(\d{4})(?=\d)/g, '$1-').slice(0, 19),
    group: grp,
    settlement: detail.settlement,
    balance: {
      TRY: advance?.balance ?? 0,
      USD: 0,
      EUR: 0,
    },
    createdAt: detail.createdAt.slice(0, 10),
    lastTxAt: 'today',
    status: detail.status as Agent['status'],
    blockReason: detail.status === 'blocked' ? (detail.statusReason as string) : null,
    closeReason: detail.status === 'closed' ? (detail.statusReason as string) : null,
    txToday: advance?.txCountDay ?? 0,
    branches: 1,
    recordStatus: 1,
  };
}

function syncList(detail: AgentDetail) {
  upsertAgentListItem(detailToListItem(detail));
  syncAssignmentFromAgentGroup(detail.id, detail.groupKey);
}

function guardSave(payload: AgentFormValues): string | null {
  if (payload.organizationType === 'ForeignLegalEntity') return 'af_foreign_blocked';

  const docErr = validateAgentDocumentsForSave(
    payload.organizationType as OrganizationType,
    payload.documents,
  );
  if (docErr) return docErr.replace('cf_', 'af_');

  const kycErr = assertAuthorizedKycLevel(payload.authorizedPersons);
  if (kycErr) return kycErr;

  const uboErr = assertUboPresent(payload.shareholders);
  if (uboErr) return uboErr;

  return null;
}

export const mockAgentDetailAdapter: AgentDetailService = {
  getById(id) {
    return store.get(Number(id)) ?? null;
  },

  lookupByVkn(vkn) {
    for (const d of store.values()) {
      if (d.taxNo === vkn) return d;
    }
    return null;
  },

  create(payload, opts) {
    const groupKey = opts?.draft
      ? payload.groupKey || DEFAULT_GROUP_KEY
      : payload.groupKey || DEFAULT_GROUP_KEY;

    const enriched = { ...payload, groupKey };

    if (!opts?.draft) {
      const err = guardSave(enriched);
      if (err) return { ok: false, error: err };
    }

    const status = opts?.draft ? 'inactive' : 'active';
    const id = nextId++;
    const detail = formToDetail(id, enriched, status);
    if (isNewCreateWithoutWallets(detail)) {
      detail.financialWallets = defaultWallets(id);
    }
    store.set(id, detail);
    syncList(detail);
    return { ok: true, id, agentNo: detail.agentNo };
  },

  update(id, payload) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'af_not_found' };

    const err = guardSave(payload);
    if (err) return { ok: false, error: err };

    const detail = formToDetail(numId, {
      ...payload,
      agentNo: existing.agentNo,
      createdAt: existing.createdAt,
      financialWallets: existing.financialWallets,
      limits: existing.limits,
    }, existing.status);
    store.set(numId, detail);
    syncList(detail);
    return { ok: true, id: numId, agentNo: detail.agentNo };
  },

  block(id, reason, blockEndDate) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'af_not_found' };
    const detail = { ...existing, status: 'blocked', statusReason: reason, blockEndDate: blockEndDate ?? null };
    store.set(numId, detail);
    syncList(detail);
    return { ok: true, id: numId };
  },

  unblock(id) {
    const numId = Number(id);
    const existing = store.get(numId);
    if (!existing) return { ok: false, error: 'af_not_found' };
    const detail = { ...existing, status: 'active', statusReason: null, blockEndDate: null };
    store.set(numId, detail);
    syncList(detail);
    return { ok: true, id: numId };
  },

  runBackgroundChecks(_id, payload) {
    const ibanTotal = payload.banks.length;
    const ibanVerified = payload.banks.filter((b) => b.iban.replace(/\s/g, '').startsWith('TR')).length;
    const hit = payload.name.toLowerCase().includes('sanction');
    return {
      vkn: payload.taxNo.length === 10 ? 'ok' : 'pending',
      sanction: hit ? 'hit' : 'clean',
      ibanVerified,
      ibanTotal,
      lastRunAt: new Date().toISOString(),
    };
  },

  uploadDocument(agentId, doc) {
    const row: DocumentRow = {
      id: nextDocId++,
      category: doc.category,
      type: doc.type,
      validFrom: doc.validFrom,
      validTo: doc.validTo,
      status: 'pending',
    };
    if (agentId) {
      const numId = Number(agentId);
      const existing = store.get(numId);
      if (existing) {
        store.set(numId, { ...existing, documents: [...existing.documents, row] });
      }
    }
    return row;
  },
};

function isNewCreateWithoutWallets(detail: AgentDetail) {
  return !detail.financialWallets?.length;
}

export function createEmptyFormValues(): AgentFormValues {
  return {
    name: '',
    taxNo: '',
    agentNo: '',
    groupKey: DEFAULT_GROUP_KEY,
    settlement: 'daily',
    kycStatus: '',
    riskScore: 0,
    riskSegment: 'low',
    createdAt: new Date().toISOString(),
    status: 'inactive',
    statusReason: null,
    organizationType: 'LimitedCompany',
    registryNo: '',
    mersisNo: '',
    taxOffice: '',
    activitySubject: '',
    establishmentDate: '',
    country: 'TUR',
    ownershipType: 'domestic',
    staffCount: 1,
    language: 'tr',
    notes: '',
    banks: [],
    financialWallets: [],
    addresses: [],
    contacts: [],
    documents: [],
    shareholders: [],
    authorizedPersons: [],
    limits: { perTx: 100000, daily: 500000, monthly: 2000000, currency: 'TRY' },
  };
}

export function detailToFormValues(d: AgentDetail): AgentFormValues {
  return { ...d };
}

export function fetchVknDemo(vkn: string): Partial<AgentFormValues> | null {
  if (vkn !== VKN_DEMO) return null;
  return {
    name: SAMPLE_AGENT.name,
    organizationType: SAMPLE_AGENT.organizationType,
    registryNo: SAMPLE_AGENT.registryNo,
    mersisNo: SAMPLE_AGENT.mersisNo,
    taxOffice: SAMPLE_AGENT.taxOffice,
    activitySubject: SAMPLE_AGENT.activitySubject,
    establishmentDate: SAMPLE_AGENT.establishmentDate,
    country: SAMPLE_AGENT.country,
    ownershipType: SAMPLE_AGENT.ownershipType,
    staffCount: SAMPLE_AGENT.staffCount,
  };
}

export function createShareholderRow(_seed: number) {
  return {
    id: nextShId++,
    refNo: '',
    refType: 'TCKN' as const,
    partyType: 'individual' as const,
    name: '',
    directShare: 0,
    indirectShare: 0,
    isUbo: false,
    description: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    status: 'active',
  };
}

export function createAuthorizedRow(_seed: number) {
  return {
    id: nextAuthId++,
    personId: '',
    name: '',
    hasOperationAuth: false,
    hasSignatureAuth: false,
    singleTxLimit: 0,
    dailyLimit: 0,
    monthlyLimit: 0,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    status: 'active',
    kycLevel: 'L1',
  };
}

export function resetAgentDetailStore(): void {
  store = buildStore();
  nextId = 100050;
}

registerAgentApprovalApply((meta) => {
  if (meta.mode === 'new') {
    mockAgentDetailAdapter.create(meta.fullValues);
  } else if (meta.agentId) {
    mockAgentDetailAdapter.update(meta.agentId, meta.fullValues);
  }
});

export function getAgentDetailStoreSnapshot(): Map<number, AgentDetail> {
  return new Map(store);
}
