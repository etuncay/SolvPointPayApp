import type { DocumentStatus } from './types';

/** Active/Archived — indirilebilir (spec §8) */
export function isDownloadableDocumentStatus(status: DocumentStatus): boolean {
  return status === 'Active' || status === 'Archived';
}

/** Rejected/Expired/Inactive — listede kanıt statüsü */
export function isEvidenceDocumentStatus(status: DocumentStatus): boolean {
  return status === 'Rejected' || status === 'Expired' || status === 'Inactive';
}
