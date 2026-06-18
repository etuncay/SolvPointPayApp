import type { SupportCaseInput, SupportCaseRecord } from '../types/customer-portal';
import {
  pushCustomerPortalSupportCaseFeed,
  type CustomerPortalSupportCaseFeedEntry,
} from './customer-support-case-feed';

export function newSupportCaseId(now = Date.now()): string {
  return `SC-${now}`;
}

export function buildSupportCaseRecord(
  input: SupportCaseInput,
  now = Date.now(),
): SupportCaseRecord {
  const id = newSupportCaseId(now);
  return {
    ...input,
    id,
    caseNo: `CASE-${id.slice(-6)}`,
    createdAt: new Date(now).toISOString(),
    status: 'Open',
  };
}

export function toSupportCaseFeedEntry(
  record: SupportCaseRecord,
  customerId: string,
): CustomerPortalSupportCaseFeedEntry {
  return {
    portalCaseId: record.id,
    caseNo: record.caseNo,
    subject: record.reason,
    complaintType: record.type,
    message: record.message,
    customerId,
    createdAt: record.createdAt,
  };
}

export function publishSupportCaseToFeed(
  record: SupportCaseRecord,
  customerId: string,
): void {
  pushCustomerPortalSupportCaseFeed(toSupportCaseFeedEntry(record, customerId));
}
