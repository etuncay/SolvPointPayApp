import { describe, expect, it } from 'vitest';
import { EMPTY_DOCUMENT_TYPE_FORM } from './form-types';
import { validateDocumentTypeForm } from './validation';

const existing = [
  { id: 'DT-IDCARD', documentTypeCode: 'IDCARD' },
  { id: 'DT-PASSPORT', documentTypeCode: 'PASSPORT' },
];

describe('document-type form validation', () => {
  it('rejects duplicate code across categories', () => {
    const result = validateDocumentTypeForm(
      {
        ...EMPTY_DOCUMENT_TYPE_FORM,
        documentCategory: 'ProofOfFunds',
        name: 'IDCARD',
        viewerRoles: ['compliance'],
      },
      { isEdit: false, existingTypes: existing },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('dtf_duplicate_type_code');
  });

  it('requires approver roles when approval required', () => {
    const result = validateDocumentTypeForm(
      {
        ...EMPTY_DOCUMENT_TYPE_FORM,
        documentCategory: 'Identity',
        name: 'Yeni Belge',
        approvalRequired: true,
        viewerRoles: ['compliance'],
        approverRoles: [],
      },
      { isEdit: false, existingTypes: existing },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('dtf_approver_roles_required');
  });

  it('clears approver when approval not required', () => {
    const result = validateDocumentTypeForm(
      {
        ...EMPTY_DOCUMENT_TYPE_FORM,
        documentCategory: 'Identity',
        name: 'Yeni Belge',
        approvalRequired: false,
        viewerRoles: ['compliance'],
        approverRoles: ['ops'],
      },
      { isEdit: false, existingTypes: existing },
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.approverRoles).toEqual([]);
  });
});
