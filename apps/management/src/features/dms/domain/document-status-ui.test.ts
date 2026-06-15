import { describe, expect, it } from 'vitest';
import {
  isDownloadableDocumentStatus,
  isEvidenceDocumentStatus,
} from './document-status-ui';

describe('document-status-ui', () => {
  it('Active and Archived are downloadable', () => {
    expect(isDownloadableDocumentStatus('Active')).toBe(true);
    expect(isDownloadableDocumentStatus('Archived')).toBe(true);
    expect(isDownloadableDocumentStatus('Rejected')).toBe(false);
  });

  it('Rejected, Expired, Inactive are evidence statuses', () => {
    expect(isEvidenceDocumentStatus('Rejected')).toBe(true);
    expect(isEvidenceDocumentStatus('Expired')).toBe(true);
    expect(isEvidenceDocumentStatus('Inactive')).toBe(true);
    expect(isEvidenceDocumentStatus('Active')).toBe(false);
  });
});
