import { describe, expect, it } from 'vitest';
import { documentTypesService } from '@/features/dms/document-types/api/mock-document-types-adapter';
import { DMS_DOCUMENTS_SEED } from '@/mocks/documents';
import { buildDocumentDetail } from './document-detail-projection';

describe('document-detail-projection', () => {
  it('joins retention and approval from type', () => {
    const doc = DMS_DOCUMENTS_SEED.find((d) => d.id === 'DOC-DETAIL-001')!;
    const type = documentTypesService.getTypeDefinitionById(doc.documentTypeId)!;
    const detail = buildDocumentDetail(doc, type, [], 'compliance');
    expect(detail.approvalRequired).toBe(true);
    expect(detail.isPersonalData).toBe(true);
    expect(detail.activeRetentionYears).toBe(5);
    expect(detail.canDownload).toBe(true);
  });

  it('Inactive pending doc cannot download', () => {
    const doc = DMS_DOCUMENTS_SEED.find((d) => d.id === 'DOC-DETAIL-002')!;
    const type = documentTypesService.getTypeDefinitionById(doc.documentTypeId)!;
    const detail = buildDocumentDetail(doc, type, [], 'ops');
    expect(detail.canDownload).toBe(false);
    expect(detail.approvalStatus).toBe('Pending');
  });
});
