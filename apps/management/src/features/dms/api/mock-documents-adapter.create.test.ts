import { describe, expect, it, beforeEach } from 'vitest';
import {
  getDocumentsRelationsForTest,
  getUploadAuditForTest,
  mockDocumentsAdapter,
  resetDocumentsMockStore,
} from './mock-documents-adapter';

function makeFile(name: string, size: number, type: string): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe('mock-documents-adapter.create', () => {
  beforeEach(() => {
    resetDocumentsMockStore();
  });

  it('appends document with hash on valid pdf', async () => {
    const result = await mockDocumentsAdapter.create('compliance', {
      category: 'Identity',
      documentTypeId: 'DT-IDCARD',
      file: makeFile('id.pdf', 1024, 'application/pdf'),
      relations: [{ relationType: 'Customer', relatedId: '10042' }],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fileHash).toHaveLength(64);
      expect(result.documentStatus).toBe('Inactive');
      expect(result.approvalStatus).toBe('Pending');
    }
    if (result.ok) {
      const rels = getDocumentsRelationsForTest().filter((r) => r.documentId === result.id);
      expect(rels).toHaveLength(1);
    }
    expect(getUploadAuditForTest().length).toBeGreaterThan(0);
  });

  it('approval not required → Active', async () => {
    const result = await mockDocumentsAdapter.create('finance', {
      category: 'ProofOfFunds',
      documentTypeId: 'DT-PAYSLIP',
      file: makeFile('pay.pdf', 512, 'application/pdf'),
      relations: [],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.documentStatus).toBe('Active');
      expect(result.approvalStatus).toBeNull();
    }
  });

  it('rejects exe', async () => {
    const result = await mockDocumentsAdapter.create('compliance', {
      category: 'Identity',
      documentTypeId: 'DT-IDCARD',
      file: makeFile('bad.exe', 100, 'application/octet-stream'),
      relations: [],
    });
    expect(result).toEqual({ ok: false, error: 'du_invalid_extension' });
  });
});
