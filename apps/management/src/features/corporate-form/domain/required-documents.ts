import type { OrganizationType } from './types';

/** Sicil numarası opsiyonel hukuki statüler — spec §7 */
export const REGISTRY_OPTIONAL_TYPES: OrganizationType[] = [
  'OrdinaryPartnership',
  'ApartmentSiteManagement',
  'Association',
  'Foundation',
  'PoliticalParty',
  'UnionConfederation',
  'ForeignLegalEntity',
  'NonLegalEntityOrganization',
  'PublicInstitution',
];

/** MERSİS opsiyonel — SoleProprietorship + registry optional tipler */
export function isMersisOptional(orgType: OrganizationType): boolean {
  return orgType === 'SoleProprietorship' || REGISTRY_OPTIONAL_TYPES.includes(orgType);
}

/** Kuruluş tarihi opsiyonel tipler */
export const ESTABLISHMENT_OPTIONAL_TYPES: OrganizationType[] = [
  'OrdinaryPartnership',
  'ApartmentSiteManagement',
  'NonLegalEntityOrganization',
];

export function isRegistryOptional(orgType: OrganizationType): boolean {
  return REGISTRY_OPTIONAL_TYPES.includes(orgType);
}

/** Spec §0.19 — tek zorunluluk: belge kodu, OR listesi veya iç içe OR */
export type DocGroup = string | string[] | string[][];

const BASE_COMMERCIAL: DocGroup[] = [
  'TradeRegistryGazette',
  'TaxCertificate',
  'ArticlesOfAssociation',
  'SignatureCircular',
  'CorporateAddressProof',
  'UltimateBeneficialOwnerDeclaration',
  'SanctionsComplianceForm',
  [['ChamberOfCommerceCertificate', 'CompanyRegistrationCertificate']],
  [['BoardResolution', 'AuthorizedRepresentativeProof']],
];

const SOLE_PROP: DocGroup[] = [
  'TaxCertificate',
  'CorporateAddressProof',
  'UltimateBeneficialOwnerDeclaration',
  'SanctionsComplianceForm',
  [['ChamberOfCommerceCertificate', 'CompanyRegistrationCertificate']],
  [['AuthorizedRepresentativeProof', 'SignatureCircular']],
];

const ORDINARY_PARTNERSHIP: DocGroup[] = [
  'TaxCertificate',
  'ArticlesOfAssociation',
  'CorporateAddressProof',
  'UltimateBeneficialOwnerDeclaration',
  'SanctionsComplianceForm',
  'AuthorizedRepresentativeProof',
];

const APARTMENT: DocGroup[] = [
  'TaxCertificate',
  'CorporateAddressProof',
  'SanctionsComplianceForm',
  'UltimateBeneficialOwnerDeclaration',
  [['ArticlesOfAssociation', 'BoardResolution']],
  'AuthorizedRepresentativeProof',
];

const NGO_STYLE: DocGroup[] = [
  'CompanyRegistrationCertificate',
  'TaxCertificate',
  'ArticlesOfAssociation',
  'CorporateAddressProof',
  'SanctionsComplianceForm',
  'UltimateBeneficialOwnerDeclaration',
  [['SignatureCircular', 'AuthorizedRepresentativeProof']],
  [['BoardResolution', 'AuthorizedRepresentativeProof']],
];

const PUBLIC_STYLE: DocGroup[] = [
  'CompanyRegistrationCertificate',
  'TaxCertificate',
  'CorporateAddressProof',
  'SanctionsComplianceForm',
  'UltimateBeneficialOwnerDeclaration',
  [['BoardResolution', 'AuthorizedRepresentativeProof']],
  [['SignatureCircular', 'AuthorizedRepresentativeProof']],
];

const NON_LEGAL: DocGroup[] = [
  'TaxCertificate',
  'ArticlesOfAssociation',
  'CorporateAddressProof',
  'SanctionsComplianceForm',
  'UltimateBeneficialOwnerDeclaration',
  'AuthorizedRepresentativeProof',
];

export function getRequiredDocGroups(orgType: OrganizationType): DocGroup[] {
  switch (orgType) {
    case 'AnonimCompany':
    case 'LimitedCompany':
    case 'LimitedPartnership':
    case 'CollectiveCompany':
    case 'Cooperative':
    case 'CapitalCompany':
      return BASE_COMMERCIAL;
    case 'SoleProprietorship':
      return SOLE_PROP;
    case 'EconomicPublicInstitution':
      return PUBLIC_STYLE;
    case 'OrdinaryPartnership':
      return ORDINARY_PARTNERSHIP;
    case 'ApartmentSiteManagement':
      return APARTMENT;
    case 'Association':
    case 'Foundation':
    case 'PoliticalParty':
    case 'UnionConfederation':
      return NGO_STYLE;
    case 'NonLegalEntityOrganization':
      return NON_LEGAL;
    case 'PublicInstitution':
      return PUBLIC_STYLE;
    case 'ForeignLegalEntity':
      return [];
    default:
      return BASE_COMMERCIAL;
  }
}

function groupSatisfied(group: DocGroup, approvedTypes: Set<string>): boolean {
  if (typeof group === 'string') return approvedTypes.has(group);
  if (Array.isArray(group) && typeof group[0] === 'string' && !Array.isArray(group[0])) {
    return (group as string[]).some((t) => approvedTypes.has(t));
  }
  return (group as string[][]).some((alt) => alt.some((t) => approvedTypes.has(t)));
}

/** Kayıt için belge kontrolü — eksik belge kodu döner */
export function validateCorporateDocumentsForSave(
  orgType: OrganizationType,
  documents: { type: string; status: string }[],
): string | null {
  if (orgType === 'ForeignLegalEntity') return 'cf_foreign_blocked';

  // §0.19: belge yalnızca approval_status=Approved ya da approval_required=false
  // (statü 'active') ise zorunluluğu karşılar. 'pending' / 'rejected' yeterli değildir.
  const approved = new Set(
    documents
      .filter((d) => d.status === 'approved' || d.status === 'active')
      .map((d) => d.type),
  );

  for (const group of getRequiredDocGroups(orgType)) {
    if (!groupSatisfied(group, approved)) {
      const label = typeof group === 'string' ? group : Array.isArray(group[0]) ? group[0][0] : group[0];
      return `cf_doc_missing:${label}`;
    }
  }
  return null;
}
