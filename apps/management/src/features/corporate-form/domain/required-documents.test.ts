import { describe, expect, it } from 'vitest';
import { validateCorporateDocumentsForSave } from './required-documents';

describe('validateCorporateDocumentsForSave', () => {
  it('LimitedCompany eksik belge grubunda hata döner', () => {
    const err = validateCorporateDocumentsForSave('LimitedCompany', [
      { type: 'TaxCertificate', status: 'approved' },
    ]);
    expect(err).toMatch(/^cf_doc_missing:/);
  });

  it('SoleProprietorship zorunlu belgelerle geçer', () => {
    const err = validateCorporateDocumentsForSave('SoleProprietorship', [
      { type: 'TaxCertificate', status: 'approved' },
      { type: 'CorporateAddressProof', status: 'approved' },
      { type: 'UltimateBeneficialOwnerDeclaration', status: 'approved' },
      { type: 'SanctionsComplianceForm', status: 'approved' },
      { type: 'ChamberOfCommerceCertificate', status: 'approved' },
      { type: 'AuthorizedRepresentativeProof', status: 'approved' },
    ]);
    expect(err).toBeNull();
  });

  it('ForeignLegalEntity her zaman blok', () => {
    expect(validateCorporateDocumentsForSave('ForeignLegalEntity', [])).toBe('cf_foreign_blocked');
  });

  it('pending statüsündeki belge zorunluluğu KARŞILAMAZ (§0.19)', () => {
    const err = validateCorporateDocumentsForSave('SoleProprietorship', [
      { type: 'TaxCertificate', status: 'pending' },
      { type: 'CorporateAddressProof', status: 'pending' },
      { type: 'UltimateBeneficialOwnerDeclaration', status: 'pending' },
      { type: 'SanctionsComplianceForm', status: 'pending' },
      { type: 'ChamberOfCommerceCertificate', status: 'pending' },
      { type: 'AuthorizedRepresentativeProof', status: 'pending' },
    ]);
    expect(err).toMatch(/^cf_doc_missing:/);
  });

  it('approval_required=false (active) belge zorunluluğu karşılar (§0.19)', () => {
    const err = validateCorporateDocumentsForSave('SoleProprietorship', [
      { type: 'TaxCertificate', status: 'active' },
      { type: 'CorporateAddressProof', status: 'active' },
      { type: 'UltimateBeneficialOwnerDeclaration', status: 'active' },
      { type: 'SanctionsComplianceForm', status: 'active' },
      { type: 'ChamberOfCommerceCertificate', status: 'active' },
      { type: 'AuthorizedRepresentativeProof', status: 'active' },
    ]);
    expect(err).toBeNull();
  });
});
