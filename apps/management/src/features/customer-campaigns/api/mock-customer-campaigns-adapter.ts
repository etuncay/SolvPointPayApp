import i18n from '@/lib/i18n';
import { CUSTOMERS } from '@/mocks/data';
import { CAMPAIGNS } from '@/mocks/campaigns';
import { CUSTOMER_CAMPAIGN_ASSIGNMENTS } from '@/mocks/customer-campaign-assignments';
import { customerFeesService } from '@/features/customer-fees/api';
import { applyCampaignGain } from '../domain/apply-campaign-gain';
import { validateCampaignInput, validateCampaignUpdate } from '../domain/validation';
import type {
  ApplyCampaignParams,
  Campaign,
  CampaignFilters,
  CampaignInput,
  CampaignUpdateInput,
  CustomerCampaignAssignment,
} from '../domain/types';
import type { CampaignChangeLogEntry, CustomerCampaignsService } from './customer-campaigns-service';

let campaignStore: Campaign[] = CAMPAIGNS.map((c) => ({ ...c }));
let assignmentStore: CustomerCampaignAssignment[] = CUSTOMER_CAMPAIGN_ASSIGNMENTS.map((a) => ({
  ...a,
}));
let nextCampaignId = 4000;
let nextAssignmentId = 5000;
let nextLogId = 1;
let changeLog: CampaignChangeLogEntry[] = [];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

function appendLog(
  action: CampaignChangeLogEntry['action'],
  entityId: number,
  previous: unknown,
  next: unknown,
) {
  changeLog = [
    ...changeLog,
    { id: nextLogId++, action, entityId, previous, next, at: nowIso(), by: 'current.user' },
  ];
}

function sortCampaigns(items: Campaign[]): Campaign[] {
  return [...items].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'Active') return -1;
      if (b.status === 'Active') return 1;
    }
    return a.campaignCode.localeCompare(b.campaignCode);
  });
}

function applyFilters(rows: Campaign[], filters: CampaignFilters): Campaign[] {
  const q = filters.query.trim().toLowerCase();
  return rows.filter((c) => {
    if (c.recordStatus !== 1) return false;
    if (filters.transactionType !== 'any' && c.transactionType !== filters.transactionType) return false;
    if (filters.currency !== 'any' && c.currency !== filters.currency) return false;
    if (filters.status !== 'any' && c.status !== filters.status) return false;
    if (!q) return true;
    return (
      c.campaignCode.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });
}

function findCampaignByKey(key: string): Campaign | null {
  const trimmed = key.trim();
  if (!trimmed) return null;
  return (
    campaignStore.find(
      (c) =>
        c.recordStatus === 1 &&
        (c.campaignCode === trimmed || c.name === trimmed),
    ) ?? null
  );
}

function syncCustomerListCampaign(
  _customerId: number,
  _name: string | null,
  _endDate: string | null,
) {
  // @epay/data seed'ler readonly olduğu için mock tarafında customer satırlarına kalıcı update yapmıyoruz.
  // UI tarafındaki customer-campaigns ekranı zaten campaignStore üzerinden çalışır.
}

function passivateAssignment(id: number, endDate: string) {
  assignmentStore = assignmentStore.map((a) =>
    a.id === id
      ? { ...a, status: 'Passive' as const, endDate: a.endDate ?? endDate.slice(0, 10) }
      : a,
  );
}

function buildCampaignRow(input: CampaignInput, id: number, code: string): Campaign {
  return {
    id,
    campaignCode: code,
    name: input.name.trim(),
    description: input.description.trim(),
    fixedFeeGainRate: input.fixedFeeGainRate,
    commissionGainRate: input.commissionGainRate,
    transactionType: input.transactionType,
    currency: input.currency,
    startDate: input.startDate?.trim() || today(),
    endDate: input.endDate?.trim() || null,
    minTxAmount: input.minTxAmount,
    maxGainPerTx: input.maxGainPerTx,
    maxGainTotal: input.maxGainTotal,
    maxUsageCount: input.maxUsageCount,
    status: 'Active',
    changedBy: 'current.user',
    changedAt: nowIso(),
    recordStatus: 1,
  };
}

export const mockCustomerCampaignsAdapter: CustomerCampaignsService = {
  list(filters = { query: '', transactionType: 'any', currency: 'any', status: 'Active' }) {
    mockCustomerCampaignsAdapter.runBatchExpire();
    return sortCampaigns(applyFilters(campaignStore, filters));
  },

  create(input) {
    const err = validateCampaignInput(input);
    if (err) return { ok: false, error: err };
    if (campaignStore.some((c) => c.recordStatus === 1 && c.campaignCode === input.campaignCode)) {
      return { ok: false, error: 'ccm_code_duplicate' };
    }
    const row = buildCampaignRow(input, nextCampaignId++, input.campaignCode.toUpperCase());
    campaignStore = [...campaignStore, row];
    appendLog('create', row.id, null, row);
    return { ok: true, id: row.id };
  },

  update(id, input) {
    const existing = campaignStore.find((c) => c.id === id && c.recordStatus === 1);
    if (!existing) return { ok: false, error: 'finrec_not_found' };
    if (existing.status === 'Passive') return { ok: false, error: 'cfe_passive_readonly' };

    const err = validateCampaignUpdate(input);
    if (err) return { ok: false, error: err };

    const row: Campaign = {
      ...existing,
      name: input.name.trim(),
      description: input.description.trim(),
      fixedFeeGainRate: input.fixedFeeGainRate,
      commissionGainRate: input.commissionGainRate,
      transactionType: input.transactionType,
      currency: input.currency,
      startDate: input.startDate?.trim() || existing.startDate,
      endDate: input.endDate?.trim() || null,
      minTxAmount: input.minTxAmount,
      maxGainPerTx: input.maxGainPerTx,
      maxGainTotal: input.maxGainTotal,
      maxUsageCount: input.maxUsageCount,
      changedBy: 'current.user',
      changedAt: nowIso(),
    };
    campaignStore = campaignStore.map((c) => (c.id === id ? row : c));
    appendLog('update', id, existing, row);
    return { ok: true, id };
  },

  listActiveOptions() {
    mockCustomerCampaignsAdapter.runBatchExpire();
    const date = today();
    return campaignStore
      .filter(
        (c) =>
          c.recordStatus === 1 &&
          c.status === 'Active' &&
          (!c.startDate || c.startDate <= date) &&
          (!c.endDate || c.endDate >= date),
      )
      .map((c) => ({ code: c.campaignCode, name: c.name, endDate: c.endDate }));
  },

  findCampaignByNameOrCode(key: string) {
    return findCampaignByKey(key);
  },

  getCustomerAssignment(customerId) {
    return (
      assignmentStore.find((a) => a.customerId === customerId && a.status === 'Active') ?? null
    );
  },

  assignToCustomer(customerId, campaignKey, opts = {}) {
    const trimmed = campaignKey.trim();
    if (!trimmed) {
      const active = assignmentStore.find(
        (a) => a.customerId === customerId && a.status === 'Active',
      );
      if (active) {
        passivateAssignment(active.id, nowIso());
        syncCustomerListCampaign(customerId, null, null);
      }
      return { ok: true };
    }

    const campaign = findCampaignByKey(trimmed);
    if (!campaign || campaign.status !== 'Active') {
      return { ok: false, error: 'ccm_campaign_not_found' };
    }

    const active = assignmentStore.find(
      (a) => a.customerId === customerId && a.status === 'Active',
    );
    if (active && active.campaignId !== campaign.id) {
      if (!opts.confirm) {
        return { ok: false, needsConfirm: true, error: 'ccm_assign_confirm' };
      }
      const prev = { ...active };
      passivateAssignment(active.id, nowIso());
      appendLog('passivate', active.id, prev, assignmentStore.find((a) => a.id === active.id));
    } else if (active?.campaignId === campaign.id) {
      syncCustomerListCampaign(customerId, campaign.name, campaign.endDate);
      return { ok: true };
    }

    const assignment: CustomerCampaignAssignment = {
      id: nextAssignmentId++,
      customerId,
      campaignId: campaign.id,
      campaignCode: campaign.campaignCode,
      campaignName: campaign.name,
      assignedAt: nowIso(),
      endDate: campaign.endDate,
      usageCount: 0,
      totalGainTry: 0,
      status: 'Active',
    };
    assignmentStore = [...assignmentStore, assignment];
    syncCustomerListCampaign(customerId, campaign.name, campaign.endDate);
    appendLog('assign', assignment.id, null, assignment);
    return { ok: true };
  },

  applyCampaignToFee(params) {
    mockCustomerCampaignsAdapter.runBatchExpire();
    const assignment = mockCustomerCampaignsAdapter.getCustomerAssignment(params.customerId);
    if (!assignment) return { ok: false, error: 'ccm_no_assignment' };

    const campaign = campaignStore.find((c) => c.id === assignment.campaignId);
    if (!campaign) return { ok: false, error: 'ccm_campaign_not_found' };

    if (campaign.transactionType !== params.transactionType || campaign.currency !== params.currency) {
      return { ok: false, error: 'ccm_campaign_mismatch' };
    }

    const feeResult = customerFeesService.calculate({
      transactionType: params.transactionType,
      currency: params.currency,
      amount: params.amount,
      sourceCountry: (params.sourceCountry ?? 'TUR') as 'TUR',
      targetCountry: (params.targetCountry ?? 'TUR') as 'TUR',
      asOfDate: params.asOfDate,
    });
    if (!feeResult.ok) return { ok: false, error: feeResult.error };

    const asOfDate = params.asOfDate ?? today();
    const gainResult = applyCampaignGain(
      campaign,
      assignment,
      {
        fixedFee: feeResult.fixedFee,
        variableFeePct: feeResult.variableFeePct,
        totalFee: feeResult.totalFee,
      },
      params.amount,
      params.currency,
      asOfDate,
    );
    if (!gainResult.ok) return { ok: false, error: gainResult.error };

    assignmentStore = assignmentStore.map((a) =>
      a.id === assignment.id
        ? {
            ...a,
            usageCount: a.usageCount + 1,
            totalGainTry: Math.round((a.totalGainTry + gainResult.gainTry) * 100) / 100,
          }
        : a,
    );

    return {
      ok: true,
      baseFee: feeResult.totalFee,
      campaignGain: gainResult.gainTry,
      finalFee: gainResult.finalFee,
      campaignCode: campaign.campaignCode,
    };
  },

  runBatchExpire() {
    const date = today();
    let count = 0;

    campaignStore = campaignStore.map((c) => {
      if (c.recordStatus !== 1 || c.status !== 'Active') return c;
      const futureStart = c.startDate && c.startDate > date;
      const pastEnd = c.endDate && c.endDate < date;
      if (!futureStart && !pastEnd) return c;
      count += 1;
      const prev = { ...c };
      const next: Campaign = {
        ...c,
        status: 'Passive',
        changedAt: nowIso(),
        changedBy: 'system.batch',
      };
      appendLog('batch_expire', c.id, prev, next);
      return next;
    });

    assignmentStore = assignmentStore.map((a) => {
      if (a.status !== 'Active') return a;
      const camp = campaignStore.find((c) => c.id === a.campaignId);
      if (camp?.status === 'Active') return a;
      count += 1;
      return { ...a, status: 'Passive' as const, endDate: a.endDate ?? date };
    });

    return count;
  },
};

export function getCampaignChangeLog(): CampaignChangeLogEntry[] {
  return [...changeLog];
}

export function resetCustomerCampaignsStore(): void {
  campaignStore = CAMPAIGNS.map((c) => ({ ...c }));
  assignmentStore = CUSTOMER_CAMPAIGN_ASSIGNMENTS.map((a) => ({ ...a }));
  nextCampaignId = 4000;
  nextAssignmentId = 5000;
  nextLogId = 1;
  changeLog = [];
}

/** Form adapter — kampanya değiştiyse ata */
export function assignCampaignIfChanged(
  customerId: number,
  newCampaign: string,
  oldCampaign: string,
  confirmFn: () => boolean = () => window.confirm(i18n.t('ccm_assign_confirm')),
): string | null {
  const trimmed = (newCampaign ?? '').trim();
  const prev = (oldCampaign ?? '').trim();
  if (trimmed === prev) return null;

  let result = mockCustomerCampaignsAdapter.assignToCustomer(customerId, trimmed, {});
  if (!result.ok && result.needsConfirm) {
    if (!confirmFn()) return 'ccm_assign_cancelled';
    result = mockCustomerCampaignsAdapter.assignToCustomer(customerId, trimmed, { confirm: true });
  }
  if (!result.ok) return result.error ?? 'ib_save_failed';

  if (!trimmed) return null;
  const camp = mockCustomerCampaignsAdapter.findCampaignByNameOrCode(trimmed);
  return camp?.endDate ?? null;
}

export function campaignEndDateForKey(key: string): string {
  const camp = mockCustomerCampaignsAdapter.findCampaignByNameOrCode(key);
  return camp?.endDate ?? '';
}
