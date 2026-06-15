import type {
  AddressEntry,
  AgentRegistrationRecord,
  ContactEntry,
  Gender,
  IdType,
  MaritalStatus,
} from '../types/registration';

function str(v: unknown, fallback = ''): string {
  return v != null ? String(v) : fallback;
}

function toAddresses(v: unknown): AddressEntry[] {
  if (!Array.isArray(v)) return [];
  return v.map((a, i) => {
    const o = (a ?? {}) as Record<string, unknown>;
    return {
      id: str(o.id, `addr-${i + 1}`),
      type: str(o.type, 'home'),
      country: str(o.country, 'TUR'),
      city: str(o.city),
      district: str(o.district),
      street: str(o.street),
    };
  });
}

function toContacts(v: unknown): ContactEntry[] {
  if (!Array.isArray(v)) return [];
  return v.map((c, i) => {
    const o = (c ?? {}) as Record<string, unknown>;
    return {
      id: str(o.id, `contact-${i + 1}`),
      type: o.type === 'phone' ? 'phone' : 'email',
      value: str(o.value),
      primary: Boolean(o.primary),
    };
  });
}

/** Form değerleri → kalıcı kayıt. */
export function formValuesToRegistration(
  id: string,
  customerNo: string,
  values: Record<string, unknown>,
  opts: { status: AgentRegistrationRecord['status']; existing?: AgentRegistrationRecord },
): AgentRegistrationRecord {
  const now = new Date().toISOString();
  return {
    id,
    customerNo,
    status: opts.status,
    firstName: str(values.firstName, opts.existing?.firstName),
    lastName: str(values.lastName, opts.existing?.lastName),
    nationality: str(values.nationality, opts.existing?.nationality ?? 'TUR'),
    idType: (str(values.idType, opts.existing?.idType ?? 'TCKN') as IdType),
    idNo: str(values.idNo, opts.existing?.idNo),
    birthDate: str(values.birthDate, opts.existing?.birthDate),
    isSuspicious: values.isSuspicious != null ? Boolean(values.isSuspicious) : Boolean(opts.existing?.isSuspicious),
    birthPlace: str(values.birthPlace, opts.existing?.birthPlace),
    maritalStatus: (str(values.maritalStatus, opts.existing?.maritalStatus ?? '') as MaritalStatus | ''),
    serialNo: str(values.serialNo, opts.existing?.serialNo),
    issueDate: str(values.issueDate, opts.existing?.issueDate),
    issuingAuthority: str(values.issuingAuthority, opts.existing?.issuingAuthority),
    validityDate: str(values.validityDate, opts.existing?.validityDate),
    motherName: str(values.motherName, opts.existing?.motherName),
    fatherName: str(values.fatherName, opts.existing?.fatherName),
    gender: (str(values.gender, opts.existing?.gender ?? '') as Gender | ''),
    maidenName: str(values.maidenName, opts.existing?.maidenName),
    taxCountry: str(values.taxCountry, opts.existing?.taxCountry),
    educationLevel: str(values.educationLevel, opts.existing?.educationLevel),
    employmentStatus: str(values.employmentStatus, opts.existing?.employmentStatus),
    occupation: str(values.occupation, opts.existing?.occupation),
    employer: str(values.employer, opts.existing?.employer),
    language: str(values.language, opts.existing?.language),
    notes: str(values.notes, opts.existing?.notes),
    foreignNationality: str(values.foreignNationality, opts.existing?.foreignNationality),
    foreignIdNo: str(values.foreignIdNo, opts.existing?.foreignIdNo),
    visaType: str(values.visaType, opts.existing?.visaType),
    visaExpiry: str(values.visaExpiry, opts.existing?.visaExpiry),
    residencePermitNo: str(values.residencePermitNo, opts.existing?.residencePermitNo),
    residencePermitExpiry: str(values.residencePermitExpiry, opts.existing?.residencePermitExpiry),
    birthCountry: str(values.birthCountry, opts.existing?.birthCountry),
    residenceCountry: str(values.residenceCountry, opts.existing?.residenceCountry),
    addresses: toAddresses(values.addresses ?? opts.existing?.addresses),
    contacts: toContacts(values.contacts ?? opts.existing?.contacts),
    documents: (values.documents as Record<string, unknown>) ?? opts.existing?.documents ?? {},
    createdAt: opts.existing?.createdAt ?? now,
    updatedAt: now,
  };
}

/** Kalıcı kayıt → form değerleri (edit/view). */
export function registrationToFormValues(row: AgentRegistrationRecord): Record<string, unknown> {
  return {
    firstName: row.firstName,
    lastName: row.lastName,
    nationality: row.nationality,
    idType: row.idType,
    idNo: row.idNo,
    birthDate: row.birthDate,
    isSuspicious: row.isSuspicious,
    birthPlace: row.birthPlace,
    maritalStatus: row.maritalStatus,
    serialNo: row.serialNo,
    issueDate: row.issueDate,
    issuingAuthority: row.issuingAuthority,
    validityDate: row.validityDate,
    motherName: row.motherName,
    fatherName: row.fatherName,
    gender: row.gender,
    maidenName: row.maidenName,
    taxCountry: row.taxCountry,
    educationLevel: row.educationLevel,
    employmentStatus: row.employmentStatus,
    occupation: row.occupation,
    employer: row.employer,
    language: row.language,
    notes: row.notes,
    foreignNationality: row.foreignNationality,
    foreignIdNo: row.foreignIdNo,
    visaType: row.visaType,
    visaExpiry: row.visaExpiry,
    residencePermitNo: row.residencePermitNo,
    residencePermitExpiry: row.residencePermitExpiry,
    birthCountry: row.birthCountry,
    residenceCountry: row.residenceCountry,
    addresses: row.addresses,
    contacts: row.contacts,
    documents: row.documents,
  };
}

/** Basit sanction taraması — adı "sanction" içeren kayıt eşleşir (mock). */
export function screenSanction(fullName: string): boolean {
  return fullName.toLowerCase().includes('sanction');
}
