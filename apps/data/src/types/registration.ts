/** Temsilci bireysel müşteri kaydı modeli (4 sekmeli form → IndexedDB). */

export type IdType = 'TCKN' | 'PASSPORT' | 'RES_PERMIT';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type Gender = 'male' | 'female';
export type RegistrationStatus = 'active' | 'inactive' | 'pending' | 'kyc_review' | 'blocked';

export interface AddressEntry {
  id: string;
  type: string;
  country: string;
  city: string;
  district: string;
  street: string;
}

export interface ContactEntry {
  id: string;
  type: 'email' | 'phone';
  value: string;
  primary: boolean;
}

/** IndexedDB'de saklanan kayıt. */
export interface AgentRegistrationRecord {
  id: string;
  customerNo: string;
  status: RegistrationStatus;

  // Sekme 1 — Müşteri Bilgileri
  firstName: string;
  lastName: string;
  nationality: string;
  idType: IdType;
  idNo: string;
  birthDate: string;
  isSuspicious: boolean;

  // Sekme 2 — Nüfus Bilgileri
  birthPlace: string;
  maritalStatus: MaritalStatus | '';
  serialNo: string;
  issueDate: string;
  issuingAuthority: string;
  validityDate: string;
  motherName: string;
  fatherName: string;
  gender: Gender | '';

  // Sekme 2 — Detay Bilgiler Paneli (§5)
  maidenName: string;
  taxCountry: string;
  educationLevel: string;
  employmentStatus: string;
  occupation: string;
  employer: string;
  language: string;
  notes: string;

  // Sekme 2 — Yabancı Müşteri Paneli (§5, yalnızca yabancı)
  foreignNationality: string;
  foreignIdNo: string;
  visaType: string;
  visaExpiry: string;
  residencePermitNo: string;
  residencePermitExpiry: string;
  birthCountry: string;
  residenceCountry: string;

  // Sekme 3 — İletişim
  addresses: AddressEntry[];
  contacts: ContactEntry[];

  // Belgeler (yüklenen dosya adları / bayrakları)
  documents: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
}

export interface AgentRegistrationSaveResult {
  ok: boolean;
  id?: string;
  customerNo?: string;
  error?: string;
}
