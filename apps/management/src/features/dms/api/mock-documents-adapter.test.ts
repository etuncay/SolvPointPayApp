import { describe, expect, it, beforeEach } from 'vitest';
import { DEFAULT_DOCUMENTS_FILTERS } from '../domain/types';
import {
  documentsService,
  getDocumentAccessLogForTest,
  getDocumentStoreForTest,
  resetDocumentsMockStore,
  runArchiveExpiredForTest,
} from './mock-documents-adapter';

describe('mock-documents-adapter list', () => {
  beforeEach(() => {
    resetDocumentsMockStore();
  });

  it('compliance and ops see different row counts', () => {
    const compliance = documentsService.list('compliance', DEFAULT_DOCUMENTS_FILTERS);
    const ops = documentsService.list('ops', DEFAULT_DOCUMENTS_FILTERS);
    expect(compliance.length).toBeGreaterThan(ops.length);
    expect(compliance.some((r) => r.id === 'DOC-004')).toBe(true);
    expect(ops.some((r) => r.id === 'DOC-004')).toBe(false);
  });

  it('applies §17 archive-expired batch on seed load', () => {
    const expired = getDocumentStoreForTest().filter((d) => d.documentStatus === 'Expired');
    expect(expired.length).toBeGreaterThanOrEqual(2);
    expect(expired.some((d) => d.id === 'DOC-DETAIL-003')).toBe(true);
  });

  it('runArchiveExpiredForTest marks past Active docs', () => {
    resetDocumentsMockStore();
    const before = getDocumentStoreForTest().find((d) => d.id === 'DOC-015');
    expect(before?.documentStatus).toBe('Active');
    const updated = runArchiveExpiredForTest(new Date('2032-06-01T00:00:00Z'));
    expect(updated).toBeGreaterThanOrEqual(1);
    const after = getDocumentStoreForTest().find((d) => d.id === 'DOC-015');
    expect(after?.documentStatus).toBe('Expired');
  });

  it('filters by Customer deep link', () => {
    const rows = documentsService.list('compliance', {
      ...DEFAULT_DOCUMENTS_FILTERS,
      relationType: 'Customer',
      relatedId: '10042',
    });
    expect(rows.length).toBeGreaterThanOrEqual(2);
    const ids = new Set(rows.map((r) => r.id));
    expect(ids.has('DOC-001')).toBe(true);
    expect(ids.has('DOC-002')).toBe(true);
  });

  it('filters by Transaction reference deep link', () => {
    const rows = documentsService.list('ops', {
      ...DEFAULT_DOCUMENTS_FILTERS,
      relationType: 'Transaction',
      relatedId: 'REF-880001',
    });
    const ids = new Set(rows.map((r) => r.id));
    expect(ids.has('DOC-003')).toBe(true);
    expect(ids.has('DOC-013')).toBe(true);
  });

  it('filters by category and status', () => {
    const rows = documentsService.list('management', {
      ...DEFAULT_DOCUMENTS_FILTERS,
      category: 'Identity',
      status: 'Active',
    });
    expect(rows.every((r) => r.documentCategory === 'Identity' && r.documentStatus === 'Active')).toBe(true);
  });

  it('download Active appends access log; Rejected forbidden', () => {
    const ok = documentsService.download('compliance', 'DOC-001');
    expect(ok.ok).toBe(true);
    const bad = documentsService.download('compliance', 'DOC-003');
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toBe('dd_download_forbidden');
    expect(getDocumentAccessLogForTest().some((l) => l.action === 'download')).toBe(true);
  });
});
