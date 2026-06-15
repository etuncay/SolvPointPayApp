/** Örnek bireysel müşteri — prototip individual-customer-form-shared.jsx */
export type BankAccount = {
  id: number;
  bank: string;
  iban: string;
  currency: string;
  branch: string;
  accountNo: string;
  suffix: string;
  isDefault: boolean;
  status: string;
};

export type WalletRow = {
  id: string;
  balance: number;
  currency: string;
  blocked: number;
  txCountDay: number;
  txAmountDay: number;
};

export type AddressRow = {
  id: number;
  type: string;
  country: string;
  city: string;
  district: string;
  neighbourhood: string;
  postcode: string;
  street: string;
  building: string;
  apt: string;
  uavt: string;
  isContact: boolean;
  status: string;
};

export type ContactRow = {
  id: number;
  type: 'email' | 'phone';
  value: string;
  verified: boolean;
  primary: boolean;
  kind?: string;
};

export type DocumentRow = {
  id: number;
  category: string;
  type: string;
  validFrom: string;
  validTo: string;
  status: string;
};

export type SamplePerson = {
  firstName: string;
  lastName: string;
  idType: string;
  idCountry: string;
  idNo: string;
  birthDate: string;
  customerType: string;
  customerNo: string;
  campaign: string;
  campaignEndDate: string;
  kycLevel: string;
  riskScore: number;
  riskSegment: string;
  createdAt: string;
  status: string;
  statusReason: string | null;
  lastLogin: string;
  failedAttempts: number;
  device: string;
  ipLocation: string;
  birthPlace: string;
  maritalStatus: string;
  serialNo: string;
  issueDate: string;
  issuingAuthority: string;
  validityDate: string;
  motherName: string;
  fatherName: string;
  gender: string;
  maidenName: string;
  taxCountry: string;
  education: string;
  employment: string;
  occupation: string;
  employer: string;
  language: string;
  notes: string;
  visaType: string | null;
  visaEndDate: string | null;
  residencePermit: string | null;
  residencePermitEnd: string | null;
  birthCountry: string;
  residentCountry: string;
  banks: BankAccount[];
  wallets: WalletRow[];
  addresses: AddressRow[];
  contacts: ContactRow[];
  limits: { perTx: number; daily: number; monthly: number; currency: string };
  documents: DocumentRow[];
};

export const SAMPLE_PERSON: SamplePerson = {
  firstName: 'Ayşe',
  lastName: 'Demir',
  idType: 'TCKN',
  idCountry: 'TUR',
  idNo: '12345678901',
  birthDate: '1991-04-18',
  customerType: 'individual',
  customerNo: 'MUS-0100482',
  campaign: 'Diaspora Avrupa',
  campaignEndDate: '2026-12-31',
  kycLevel: 'L2',
  riskScore: 28,
  riskSegment: 'low',
  createdAt: '2024-08-12T11:42:00',
  status: 'active',
  statusReason: null,
  lastLogin: '2026-05-22T09:14:12',
  failedAttempts: 0,
  device: 'iPhone 14 · iOS 17.5',
  ipLocation: 'İstanbul, TR · 85.96.214.12',
  birthPlace: 'İstanbul',
  maritalStatus: 'married',
  serialNo: 'B12 N87234',
  issueDate: '2019-03-04',
  issuingAuthority: 'Kadıköy Nüfus Md.',
  validityDate: '2029-03-04',
  motherName: 'Fatma',
  fatherName: 'Mehmet',
  gender: 'female',
  maidenName: 'Yılmaz',
  taxCountry: 'TUR',
  education: 'bachelors',
  employment: 'salaried',
  occupation: 'Yazılım Geliştirici',
  employer: 'Marmara Tekstil A.Ş.',
  language: 'tr',
  notes: 'Avrupa diaspora kampanyasına bağlı. Düzenli Almanya transferleri.',
  visaType: null,
  visaEndDate: null,
  residencePermit: null,
  residencePermitEnd: null,
  birthCountry: 'TUR',
  residentCountry: 'TUR',
  banks: [
    {
      id: 1,
      bank: 'Garanti BBVA',
      iban: 'TR33 0006 2000 1234 0001 2345 67',
      currency: 'TRY',
      branch: '212',
      accountNo: '12340012345',
      suffix: '100',
      isDefault: true,
      status: 'active',
    },
    {
      id: 2,
      bank: 'İş Bankası',
      iban: 'TR45 0064 0000 0001 1234 5678 90',
      currency: 'USD',
      branch: '1234',
      accountNo: '1234567',
      suffix: '200',
      isDefault: true,
      status: 'active',
    },
    {
      id: 3,
      bank: 'Yapı Kredi',
      iban: 'TR12 0067 1000 0000 4321 8765 43',
      currency: 'EUR',
      branch: '844',
      accountNo: '43218765',
      suffix: '300',
      isDefault: true,
      status: 'active',
    },
    {
      id: 4,
      bank: 'Garanti BBVA',
      iban: 'TR98 0006 2000 1234 0009 8765 11',
      currency: 'TRY',
      branch: '212',
      accountNo: '98765',
      suffix: '101',
      isDefault: false,
      status: 'active',
    },
  ],
  wallets: [
    { id: 'WAL-TRY-0001', balance: 24820.5, currency: 'TRY', blocked: 0, txCountDay: 4, txAmountDay: 8200 },
    { id: 'WAL-USD-0001', balance: 1240, currency: 'USD', blocked: 0, txCountDay: 1, txAmountDay: 320 },
    { id: 'WAL-EUR-0001', balance: 540, currency: 'EUR', blocked: 0, txCountDay: 0, txAmountDay: 0 },
  ],
  addresses: [
    {
      id: 1,
      type: 'home',
      country: 'TUR',
      city: 'İstanbul',
      district: 'Kadıköy',
      neighbourhood: 'Caferağa',
      postcode: '34710',
      street: 'Moda Cd.',
      building: '12',
      apt: '5',
      uavt: '23847122',
      isContact: true,
      status: 'active',
    },
    {
      id: 2,
      type: 'work',
      country: 'TUR',
      city: 'İstanbul',
      district: 'Şişli',
      neighbourhood: 'Mecidiyeköy',
      postcode: '34394',
      street: 'Büyükdere Cd.',
      building: '201',
      apt: '14',
      uavt: '23847900',
      isContact: false,
      status: 'active',
    },
  ],
  contacts: [
    { id: 1, type: 'email', value: 'ayse.demir@gmail.com', verified: true, primary: true },
    { id: 2, type: 'email', value: 'ayse.demir@marmara.com', verified: true, primary: false },
    { id: 3, type: 'phone', value: '+90 532 412 67 89', verified: true, primary: true },
    { id: 4, type: 'phone', value: '+90 216 348 02 14', verified: false, primary: false, kind: 'landline' },
  ],
  limits: { perTx: 50000, daily: 80000, monthly: 500000, currency: 'TRY' },
  documents: [
    {
      id: 1,
      category: 'Identity',
      type: 'TC Kimlik Kartı (Ön)',
      validFrom: '2019-03-04',
      validTo: '2029-03-04',
      status: 'approved',
    },
    {
      id: 2,
      category: 'Identity',
      type: 'TC Kimlik Kartı (Arka)',
      validFrom: '2019-03-04',
      validTo: '2029-03-04',
      status: 'approved',
    },
    {
      id: 3,
      category: 'AddressProof',
      type: 'İkametgah Belgesi',
      validFrom: '2025-11-02',
      validTo: '2026-11-02',
      status: 'approved',
    },
  ],
};

export const FOREIGN_OVERLAY: Partial<SamplePerson> = {
  firstName: 'Hans',
  lastName: 'Müller',
  idType: 'PASSPORT',
  idCountry: 'DEU',
  idNo: 'C8F4G2H21',
  birthDate: '1985-09-22',
  birthPlace: 'München',
  birthCountry: 'DEU',
  residentCountry: 'TUR',
  visaType: 'ShortTerm',
  visaEndDate: '2026-12-15',
  residencePermit: 'TR-99-2024-04421',
  residencePermitEnd: '2026-12-15',
  motherName: 'Petra',
  fatherName: 'Klaus',
  maidenName: '',
  taxCountry: 'DEU',
  language: 'en',
  notes: 'Yabancı uyruklu — vize/oturum kontrolü düzenli yapılır.',
};
