/** Müşteri portalı şikâyet feed — BackOffice destek listesine demo köprüsü. */
export interface CustomerPortalSupportCaseFeedEntry {
  portalCaseId: string;
  caseNo: string;
  subject: string;
  complaintType: string;
  message: string;
  customerId: string;
  createdAt: string;
}

let feed: CustomerPortalSupportCaseFeedEntry[] = [];

export function getCustomerPortalSupportCaseFeed(): CustomerPortalSupportCaseFeedEntry[] {
  return feed.map((row) => ({ ...row }));
}

export function pushCustomerPortalSupportCaseFeed(entry: CustomerPortalSupportCaseFeedEntry): void {
  if (feed.some((row) => row.portalCaseId === entry.portalCaseId)) return;
  feed.push({ ...entry });
}

export function resetCustomerPortalSupportCaseFeed(): void {
  feed = [];
}
