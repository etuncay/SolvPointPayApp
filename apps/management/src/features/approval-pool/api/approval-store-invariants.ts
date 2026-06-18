import { deriveUiStatus } from '../domain/ui-status';
import type { ApprovalRequest, CurrentUser } from '../domain/types';
import {
  getApprovalsStoreSnapshot,
  mockApprovalsAdapter,
  pendingApprovalWidgetRows,
} from './mock-approvals-adapter';

/** Her kaydın uiStatus değeri first/second status ile tutarlı mı */
export function assertDerivedUiStatuses(rows: ApprovalRequest[] = getApprovalsStoreSnapshot()): void {
  for (const row of rows) {
    if (row.uiStatus !== deriveUiStatus(row)) {
      throw new Error(`uiStatus mismatch for id=${row.id}: ${row.uiStatus} !== ${deriveUiStatus(row)}`);
    }
  }
}

/** pending sayacı ile pending_mine listesi aynı uzunlukta mı */
export function assertPendingCountMatchesList(user: CurrentUser): void {
  const pending = mockApprovalsAdapter.list('pending_mine', user);
  const count = mockApprovalsAdapter.countPendingForUser(user);
  if (count !== pending.length) {
    throw new Error(
      `pending count mismatch for ${user.role}: count=${count} list=${pending.length}`,
    );
  }
}

/** Dashboard widget satırları pending_mine ile uyumlu mu (ilk 8) */
export function assertWidgetMatchesPending(user: CurrentUser): void {
  const pending = mockApprovalsAdapter.list('pending_mine', user);
  const widget = pendingApprovalWidgetRows(user);
  const expected = pending.slice(0, 8).map((r) => r.referenceNo);
  const actual = widget.map((r) => r.id);
  if (actual.join(',') !== expected.join(',')) {
    throw new Error(
      `widget rows mismatch for ${user.role}: expected [${expected}] got [${actual}]`,
    );
  }
}

/** getById store ile aynı snapshot mı (shallow copy) */
export function assertGetByIdMatchesStore(id: number): void {
  const fromStore = getApprovalsStoreSnapshot().find((r) => r.id === id);
  const fromGet = mockApprovalsAdapter.getById(id);
  if (!fromStore && !fromGet) return;
  if (!fromStore || !fromGet) {
    throw new Error(`getById/store presence mismatch for id=${id}`);
  }
  if (fromGet.uiStatus !== fromStore.uiStatus) {
    throw new Error(`getById uiStatus stale for id=${id}`);
  }
}
