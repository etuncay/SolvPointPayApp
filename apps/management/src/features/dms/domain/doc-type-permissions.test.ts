import { describe, expect, it } from 'vitest';
import { documentTypesService } from '@/features/dms/document-types/api/mock-document-types-adapter';
import { canViewDocumentType, filterDocumentsByRole } from './doc-type-permissions';
import type { DmsDocument } from './types';

const typeById = () =>
  new Map(documentTypesService.getAllTypeDefinitions().map((t) => [t.id, t]));

describe('doc-type-permissions', () => {
  it('management sees all types', () => {
    const hr = documentTypesService.getTypeDefinitionById('DT-HR-CONTRACT')!;
    expect(canViewDocumentType('management', hr)).toBe(true);
  });

  it('compliance sees Identity and EmployeeHR', () => {
    const id = documentTypesService.getTypeDefinitionById('DT-IDCARD')!;
    const hr = documentTypesService.getTypeDefinitionById('DT-HR-CONTRACT')!;
    expect(canViewDocumentType('compliance', id)).toBe(true);
    expect(canViewDocumentType('compliance', hr)).toBe(true);
  });

  it('ops sees ProofOfTransaction, not EmployeeHR only types', () => {
    const tx = documentTypesService.getTypeDefinitionById('DT-TX-DECONT')!;
    const hr = documentTypesService.getTypeDefinitionById('DT-HR-CONTRACT')!;
    expect(canViewDocumentType('ops', tx)).toBe(true);
    expect(canViewDocumentType('ops', hr)).toBe(false);
  });

  it('filterDocumentsByRole hides DOC-004 from ops', () => {
    const docs: DmsDocument[] = [
      {
        id: 'DOC-004',
        documentCategory: 'EmployeeHR',
        documentTypeId: 'DT-HR-CONTRACT',
        documentTypeName: 'İş Sözleşmesi',
        documentStatus: 'Inactive',
        approvalStatus: 'Pending',
        fileName: 'x.pdf',
        fileHash: null,
        storageFileName: 'x.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 1,
        validFrom: null,
        validUntil: null,
        createdAt: '2025-11-18T16:00:00Z',
        createdBy: 'compliance.user',
        approvedBy: null,
        approvedAt: null,
        recordStatus: 1,
      },
    ];
    expect(filterDocumentsByRole('compliance', docs, typeById()).length).toBe(1);
    expect(filterDocumentsByRole('ops', docs, typeById()).length).toBe(0);
  });
});
