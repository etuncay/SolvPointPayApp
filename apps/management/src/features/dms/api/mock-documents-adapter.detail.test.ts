import { describe, expect, it, beforeEach } from 'vitest';
import {
  getDocumentAccessLogForTest,
  mockDocumentsAdapter,
  resetDocumentsMockStore,
} from './mock-documents-adapter';

describe('mock-documents-adapter detail', () => {
  beforeEach(() => {
    resetDocumentsMockStore();
  });

  it('getDetail logs view', () => {
    const detail = mockDocumentsAdapter.getDetail('compliance', 'DOC-DETAIL-001');
    expect(detail?.id).toBe('DOC-DETAIL-001');
    expect(detail?.relations.length).toBeGreaterThanOrEqual(2);
    const logs = getDocumentAccessLogForTest();
    expect(logs.some((l) => l.action === 'view' && l.documentId === 'DOC-DETAIL-001')).toBe(true);
  });

  it('ops forbidden on compliance-only HR doc', () => {
    expect(mockDocumentsAdapter.getDetail('ops', 'DOC-DETAIL-004')).toBeNull();
  });

  it('download Active logs download', () => {
    const result = mockDocumentsAdapter.download('compliance', 'DOC-DETAIL-001');
    expect(result.ok).toBe(true);
    const logs = getDocumentAccessLogForTest();
    expect(logs.some((l) => l.action === 'download')).toBe(true);
  });

  it('download Inactive forbidden', () => {
    const result = mockDocumentsAdapter.download('ops', 'DOC-DETAIL-002');
    expect(result).toEqual({ ok: false, error: 'dd_download_forbidden' });
  });
});
