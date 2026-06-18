import type { BackOfficeRole } from '@epay/ui';
import { getCustomerPortalSupportCaseFeed } from '@epay/data';
import { userNameById } from '@/features/approval-pool/domain/current-user';
import {
  attachDocumentToCase,
  createReconciliationCase,
  createSupportCase,
  getSupportCaseDetail,
  getSupportCasesStore,
  ingestCustomerPortalSupportCases,
  postSupportCaseAction,
  resolveSupportCase,
} from '@/mocks/support-cases-store';
import { computeCaseAgeDays } from '../domain/compute-case-age';
import { filterCasesByRole, getSupportCasePermissions } from '../domain/permissions';
import { matchesStatusChip } from '../domain/support-case-status-groups';
import type { SupportCaseStatusChip } from '../domain/support-case-status-groups';
import { canPerformCaseAction } from '../form/domain/form-permissions';
import type { SupportCasesService } from './support-cases-service';

export { createReconciliationCase, findOpenReconciliationCase, resolveSupportCase } from '@/mocks/support-cases-store';

type ListAccessLogEntry = {
  at: string;
  role: BackOfficeRole;
  userId: string;
  filterSnapshot: string;
  resultCount: number;
};

let listAccessLog: ListAccessLogEntry[] = [];

function inDateRange(iso: string, from: string, to: string): boolean {
  const t = new Date(iso).getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (t > end.getTime()) return false;
  }
  return true;
}

function ownerName(ownerUserId: string | null): string {
  if (!ownerUserId) return '—';
  return userNameById(ownerUserId);
}

export const mockSupportCasesAdapter: SupportCasesService = {
  list(role, userId, filters) {
    if (!getSupportCasePermissions(role).list) return [];
    ingestCustomerPortalSupportCases(getCustomerPortalSupportCaseFeed());
    let rows = filterCasesByRole(role, getSupportCasesStore(), userId);
    if (filters.assignedToMe) {
      rows = rows.filter((c) => c.ownerUserId === userId);
    }
    if (filters.complaintType !== 'any') {
      rows = rows.filter((c) => c.complaintType === filters.complaintType);
    }
    if (filters.status !== 'all' && filters.status !== 'any') {
      rows = rows.filter((c) =>
        matchesStatusChip(c.caseStatus, filters.status as SupportCaseStatusChip),
      );
    }
    if (filters.urgency !== 'any') {
      rows = rows.filter((c) => c.urgency === filters.urgency);
    }
    if (filters.criticality !== 'any') {
      rows = rows.filter((c) => c.criticality === filters.criticality);
    }
    if (filters.ownerUserId !== 'any') {
      rows = rows.filter((c) => c.ownerUserId === filters.ownerUserId);
    }
    if (filters.createdFrom || filters.createdTo) {
      rows = rows.filter((c) => inDateRange(c.createdAt, filters.createdFrom, filters.createdTo));
    }
    if (filters.updatedFrom || filters.updatedTo) {
      rows = rows.filter((c) => inDateRange(c.updatedAt, filters.updatedFrom, filters.updatedTo));
    }
    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      rows = rows.filter(
        (c) =>
          c.caseNo.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          ownerName(c.ownerUserId).toLowerCase().includes(q),
      );
    }
    const mapped = rows
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((c) => ({
        id: c.id,
        caseNo: c.caseNo,
        subject: c.subject,
        complaintType: c.complaintType,
        ownerDisplayName: ownerName(c.ownerUserId),
        urgency: c.urgency,
        criticality: c.criticality,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        caseAgeDays: computeCaseAgeDays(c),
        caseStatus: c.caseStatus,
      }));
    listAccessLog = [
      ...listAccessLog,
      {
        at: new Date('2026-05-24T12:00:00Z').toISOString(),
        role,
        userId,
        filterSnapshot: JSON.stringify(filters),
        resultCount: mapped.length,
      },
    ];
    return mapped;
  },

  getListAccessLog() {
    return [...listAccessLog];
  },

  resetListAccessLogForTests() {
    listAccessLog = [];
  },

  getDetail(role, userId, id) {
    const detail = getSupportCaseDetail(id);
    if (!detail) return null;
    if (!canPerformCaseAction(role, userId, detail) && !getSupportCasePermissions(role).viewAll) {
      const perms = getSupportCasePermissions(role);
      if (!perms.list) return null;
      if (detail.ownerUserId !== userId && detail.departmentId !== role) return null;
    }
    return detail;
  },

  create(role, userId, userName, values) {
    if (!getSupportCasePermissions(role).insert) {
      return { ok: false, error: 'scf_forbidden' };
    }
    const row = createSupportCase(values, userId, userName);
    return { ok: true, id: row.id };
  },

  postAction(role, userId, userName, caseId, input) {
    const detail = getSupportCaseDetail(caseId);
    if (!detail) return { ok: false, error: 'scf_not_found' };
    if (!canPerformCaseAction(role, userId, detail)) {
      return { ok: false, error: 'scf_forbidden' };
    }
    if (detail.source === 'reconciliation' && input.kind !== 'resolve' && input.kind !== 'reject' && input.kind !== 'reopen' && input.kind !== 'take') {
      if (input.kind === 'transfer' || input.kind === 'contact' || input.kind === 'infoRequest') {
        return { ok: false, error: 'scf_recon_locked' };
      }
    }
    const updated = postSupportCaseAction(caseId, {
      ...input,
      performedBy: userId,
      performedByName: userName,
    });
    if (!updated) return { ok: false, error: 'scf_not_found' };
    return { ok: true };
  },

  attachDocument(caseId, documentId) {
    attachDocumentToCase(caseId, documentId);
  },

  closeFromReconciliation(caseId) {
    resolveSupportCase(caseId);
  },
};

export const supportCasesService: SupportCasesService = mockSupportCasesAdapter;
