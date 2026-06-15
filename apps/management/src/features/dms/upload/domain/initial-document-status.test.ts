import { describe, expect, it } from 'vitest';
import { resolveInitialDocumentStatus } from './initial-document-status';

describe('initial-document-status', () => {
  it('approval required → Inactive + Pending', () => {
    expect(resolveInitialDocumentStatus(true)).toEqual({
      documentStatus: 'Inactive',
      approvalStatus: 'Pending',
    });
  });

  it('no approval → Active + null', () => {
    expect(resolveInitialDocumentStatus(false)).toEqual({
      documentStatus: 'Active',
      approvalStatus: null,
    });
  });
});
