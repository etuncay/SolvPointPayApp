import { describe, expect, it, beforeEach } from 'vitest';
import { resetDocumentTypesStore } from '@/mocks/document-types-store';
import { STANDARD_CATEGORIES } from '../domain/standard-types';
import type { DocumentTypeFormPayload } from '../form/domain/form-types';
import {
  documentTypesService,
  getDocumentTypesAccessLogForTest,
  resetDocumentTypesAccessLog,
} from './mock-document-types-adapter';

const samplePayload: DocumentTypeFormPayload = {
  documentCategory: 'Identity',
  name: 'Test Tip',
  documentTypeCode: 'TEST_TIP_X',
  description: 'test',
  activeRetentionYears: 3,
  archiveRetentionYears: 5,
  maxFileSizeMb: null,
  isPersonalData: false,
  approvalRequired: false,
  viewerRoles: ['compliance'],
  approverRoles: [],
  uploaderRoles: ['compliance'],
};

describe('mock-document-types-adapter', () => {
  beforeEach(() => {
    resetDocumentTypesStore();
    resetDocumentTypesAccessLog();
  });

  it('lists all categories for compliance', () => {
    const rows = documentTypesService.list({ query: '', category: 'any' }, 'compliance');
    const cats = new Set(rows.map((r) => r.documentCategory));
    for (const c of STANDARD_CATEGORIES) {
      expect(cats.has(c)).toBe(true);
    }
    expect(getDocumentTypesAccessLogForTest().length).toBe(1);
  });

  it('filters by category', () => {
    const rows = documentTypesService.list(
      { query: '', category: 'Identity' },
      'management',
    );
    expect(rows.every((r) => r.documentCategory === 'Identity')).toBe(true);
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('ops cannot list', () => {
    expect(documentTypesService.list({ query: '', category: 'any' }, 'ops')).toEqual([]);
  });

  it('listByCategoryForUpload respects uploader roles', () => {
    const finance = documentTypesService.listByCategoryForUpload('finance', 'ProofOfFunds');
    expect(finance.some((t) => t.code === 'PAYSLIP')).toBe(true);
    const opsIdentity = documentTypesService.listByCategoryForUpload('ops', 'Identity');
    expect(opsIdentity.length).toBeGreaterThan(0);
    const opsHr = documentTypesService.listByCategoryForUpload('ops', 'EmployeeHR');
    expect(opsHr.length).toBe(0);
  });

  it('creates document type for compliance', () => {
    const result = documentTypesService.create('compliance', samplePayload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const row = documentTypesService.getById(result.id);
      expect(row?.documentTypeCode).toBe('TEST_TIP_X');
      expect(row?.maxFileSizeMb).toBeNull();
    }
    const logs = getDocumentTypesAccessLogForTest();
    expect(logs.some((l) => l.action === 'create')).toBe(true);
  });

  it('rejects duplicate code on create', () => {
    documentTypesService.create('management', samplePayload);
    const dup = documentTypesService.create('management', {
      ...samplePayload,
      documentCategory: 'Identity',
      name: 'Other',
    });
    expect(dup.ok).toBe(false);
    if (!dup.ok) expect(dup.error).toBe('dtf_duplicate_type_code');
  });

  it('ops cannot create', () => {
    expect(documentTypesService.create('ops', samplePayload)).toEqual({
      ok: false,
      error: 'rsc_forbidden',
    });
  });

  it('update keeps code immutable', () => {
    const created = documentTypesService.create('compliance', samplePayload);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const locked = documentTypesService.update('compliance', created.id, {
      ...samplePayload,
      documentTypeCode: 'CHANGED',
      name: 'Güncel Ad',
      viewerRoles: ['ops', 'compliance'],
    });
    expect(locked.ok).toBe(false);
    if (!locked.ok) expect(locked.error).toBe('dtf_code_locked');

    const ok = documentTypesService.update('compliance', created.id, {
      ...samplePayload,
      name: 'Güncel Ad',
      viewerRoles: ['ops', 'compliance'],
      approverRoles: [],
    });
    expect(ok.ok).toBe(true);
    const row = documentTypesService.getById(created.id);
    expect(row?.name).toBe('Güncel Ad');
    expect(row?.viewerRoles).toContain('ops');
  });
});
