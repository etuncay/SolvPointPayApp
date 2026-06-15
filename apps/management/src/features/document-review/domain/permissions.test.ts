import { describe, expect, it } from 'vitest';
import { canApproveCategory, canViewCategory, getDocumentReviewPermissions } from './permissions';

describe('getDocumentReviewPermissions', () => {
  it('ops ve compliance tam yetki alır', () => {
    expect(getDocumentReviewPermissions('ops').list).toBe(true);
    expect(getDocumentReviewPermissions('compliance').approve).toBe(true);
  });

  it('finance gibi roller listelenemez', () => {
    const perms = getDocumentReviewPermissions('finance');
    expect(perms.list).toBe(false);
    expect(perms.view).toBe(false);
  });
});

describe('category role matrix', () => {
  it('Identity yalnızca compliance görür/onaylar', () => {
    expect(canViewCategory('ops', 'Identity')).toBe(false);
    expect(canViewCategory('compliance', 'Identity')).toBe(true);
    expect(canApproveCategory('ops', 'Identity')).toBe(false);
    expect(canApproveCategory('compliance', 'Identity')).toBe(true);
  });

  it('ProofOfAddress ops ve compliance görür', () => {
    expect(canViewCategory('ops', 'ProofOfAddress')).toBe(true);
    expect(canApproveCategory('ops', 'ProofOfAddress')).toBe(true);
  });
});
