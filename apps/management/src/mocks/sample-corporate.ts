import type {
  AddressRow,
  BankAccount,
  ContactRow,
  DocumentRow,
  WalletRow,
} from '@/mocks/sample-person';

/** Örnek tüzel müşteri — Anadolu Gıda (99903) */
export type ShareholderRow = {
  id: number;
  refNo: string;
  refType: 'TCKN' | 'VKN' | 'CUSTOMER';
  partyType: 'individual' | 'corporate';
  name: string;
  directShare: number;
  indirectShare: number;
  isUbo: boolean;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
};

export type AuthorizedPersonRow = {
  id: number;
  personId: string;
  name: string;
  hasOperationAuth: boolean;
  hasSignatureAuth: boolean;
  singleTxLimit: number;
  dailyLimit: number;
  monthlyLimit: number;
  startDate: string;
  endDate: string;
  status: string;
  kycLevel: string;
};

export type CorporateLimits = {
  perTx: number;
  daily: number;
  monthly: number;
  currency: string;
};

export type SampleCorporate = {
  tradeName: string;
  taxNo: string;
  customerNo: string;
  campaign: string;
  campaignEndDate: string;
  kycStatus: string;
  riskScore: number;
  riskSegment: string;
  createdAt: string;
  status: string;
  statusReason: string | null;
  organizationType: string;
  registryNo: string;
  mersisNo: string;
  taxOffice: string;
  activitySubject: string;
  establishmentDate: string;
  country: string;
  ownershipType: string;
  staffCount: number;
  language: string;
  notes: string;
  banks: BankAccount[];
  wallets: WalletRow[];
  addresses: AddressRow[];
  contacts: ContactRow[];
  documents: DocumentRow[];
  shareholders: ShareholderRow[];
  authorizedPersons: AuthorizedPersonRow[];
  limits: CorporateLimits;
};

export const SAMPLE_CORPORATE: SampleCorporate = {
  tradeName: 'Anadolu Gıda Üretim A.Ş.',
  taxNo: '1792956117',
  customerNo: 'MUS-099903',
  campaign: 'Premium Müşteri',
  campaignEndDate: '2026-12-31',
  kycStatus: 'Approved',
  riskScore: 45,
  riskSegment: 'med',
  createdAt: '2025-11-25T12:00:00',
  status: 'active',
  statusReason: null,
  organizationType: 'AnonimCompany',
  registryNo: '123456-5',
  mersisNo: '0179295611700001',
  taxOffice: 'Gaziantep Vergi Dairesi',
  activitySubject: 'Gıda üretimi ve toptan satış',
  establishmentDate: '2010-03-15',
  country: 'TUR',
  ownershipType: 'domestic',
  staffCount: 120,
  language: 'tr',
  notes: '',
  banks: [
    {
      id: 1,
      bank: 'Ziraat Bankası',
      iban: 'TR330006100519786457841326',
      currency: 'TRY',
      branch: '0012',
      accountNo: '78645784',
      suffix: '001',
      isDefault: true,
      status: 'active',
    },
  ],
  wallets: [
    {
      id: 'W-99903-TRY',
      balance: 245000,
      currency: 'TRY',
      blocked: 0,
      txCountDay: 3,
      txAmountDay: 12500,
    },
  ],
  addresses: [
    {
      id: 1,
      type: 'registered',
      country: 'TUR',
      city: 'Gaziantep',
      district: 'Şehitkamil',
      neighbourhood: 'Organize Sanayi',
      postcode: '27000',
      street: 'OSB 4. Cadde',
      building: '12',
      apt: '',
      uavt: '',
      isContact: true,
      status: 'active',
    },
  ],
  contacts: [
    {
      id: 1,
      type: 'email',
      value: 'anadolu.gida.uretim.a.s@anadolu.tr',
      verified: true,
      primary: true,
    },
    {
      id: 2,
      type: 'phone',
      value: '+90 536 484 52 95',
      verified: true,
      primary: true,
      kind: 'mobile',
    },
  ],
  documents: [
    {
      id: 1,
      category: 'LegalEntity',
      type: 'TradeRegistryGazette',
      validFrom: '2020-01-01',
      validTo: '2030-01-01',
      status: 'approved',
    },
    {
      id: 2,
      category: 'LegalEntity',
      type: 'TaxCertificate',
      validFrom: '2024-01-01',
      validTo: '2025-12-31',
      status: 'approved',
    },
    {
      id: 3,
      category: 'LegalEntity',
      type: 'ArticlesOfAssociation',
      validFrom: '2010-03-15',
      validTo: '2030-03-15',
      status: 'approved',
    },
    {
      id: 4,
      category: 'LegalEntity',
      type: 'SignatureCircular',
      validFrom: '2023-06-01',
      validTo: '2026-06-01',
      status: 'approved',
    },
    {
      id: 5,
      category: 'LegalEntity',
      type: 'CorporateAddressProof',
      validFrom: '2023-01-01',
      validTo: '2026-01-01',
      status: 'approved',
    },
    {
      id: 6,
      category: 'LegalEntity',
      type: 'UltimateBeneficialOwnerDeclaration',
      validFrom: '2024-01-01',
      validTo: '2025-12-31',
      status: 'approved',
    },
    {
      id: 7,
      category: 'LegalEntity',
      type: 'SanctionsComplianceForm',
      validFrom: '2024-01-01',
      validTo: '2025-12-31',
      status: 'approved',
    },
    {
      id: 8,
      category: 'LegalEntity',
      type: 'ChamberOfCommerceCertificate',
      validFrom: '2024-01-01',
      validTo: '2025-12-31',
      status: 'approved',
    },
    {
      id: 9,
      category: 'LegalEntity',
      type: 'BoardResolution',
      validFrom: '2024-01-01',
      validTo: '2025-12-31',
      status: 'approved',
    },
  ],
  shareholders: [
    {
      id: 1,
      refNo: '12345678901',
      refType: 'TCKN',
      partyType: 'individual',
      name: 'Mehmet Yılmaz',
      directShare: 60,
      indirectShare: 0,
      isUbo: true,
      description: 'Nihai fayda sahibi',
      startDate: '2010-03-15',
      endDate: '',
      status: 'active',
    },
    {
      id: 2,
      refNo: '9876543210',
      refType: 'VKN',
      partyType: 'corporate',
      name: 'Anadolu Holding A.Ş.',
      directShare: 40,
      indirectShare: 0,
      isUbo: false,
      description: '',
      startDate: '2015-06-01',
      endDate: '',
      status: 'active',
    },
  ],
  authorizedPersons: [
    {
      id: 1,
      personId: '12345678901',
      name: 'Ayşe Demir',
      hasOperationAuth: true,
      hasSignatureAuth: true,
      singleTxLimit: 50000,
      dailyLimit: 200000,
      monthlyLimit: 1000000,
      startDate: '2020-01-01',
      endDate: '',
      status: 'active',
      kycLevel: 'L2',
    },
  ],
  limits: { perTx: 100000, daily: 500000, monthly: 2000000, currency: 'TRY' },
};
