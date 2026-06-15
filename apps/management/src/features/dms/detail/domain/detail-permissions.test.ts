import { describe, expect, it } from 'vitest';
import { documentTypesService } from '@/features/dms/document-types/api/mock-document-types-adapter';
import { canDownloadFile, canViewDetail } from './detail-permissions';

const hrType = documentTypesService.getTypeDefinitionById('DT-HR-CONTRACT')!;
const txType = documentTypesService.getTypeDefinitionById('DT-TX-DECONT')!;

describe('detail-permissions', () => {
  it('compliance can view HR type', () => {
    expect(canViewDetail('compliance', hrType)).toBe(true);
  });

  it('ops cannot view HR-only type', () => {
    expect(canViewDetail('ops', hrType)).toBe(false);
  });

  it('Active allows download', () => {
    expect(
      canDownloadFile(
        'compliance',
        { documentStatus: 'Active', documentTypeId: 'DT-HR-CONTRACT' },
        hrType,
      ),
    ).toBe(true);
  });

  it('Inactive blocks download', () => {
    expect(
      canDownloadFile(
        'compliance',
        { documentStatus: 'Inactive', documentTypeId: 'DT-HR-CONTRACT' },
        hrType,
      ),
    ).toBe(false);
  });

  it('Archived allows download for ops on tx type', () => {
    expect(
      canDownloadFile(
        'ops',
        { documentStatus: 'Archived', documentTypeId: 'DT-TX-DECONT' },
        txType,
      ),
    ).toBe(true);
  });
});
