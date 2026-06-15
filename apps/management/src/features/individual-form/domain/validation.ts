import { z } from 'zod';

const TCKN_REGEX = /^[1-9]\d{10}$/;
const NAME_REGEX = /^[\p{L}\s'-]{2,255}$/u;
const PASSPORT_REGEX = /^[A-Za-z0-9]{1,20}$/;
const PII_IN_NOTES = /\b\d{11}\b|\b(?:\d[ -]*?){13,19}\b/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPhoneNumber(value: string) {
  const digits = value.replace(/[\s\-()]/g, '').replace(/^\+/, '');
  return /^\d{10,15}$/.test(digits);
}

function isAtLeast18Years(birthDate: string, today: Date) {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return false;
  const cutoff = new Date(today);
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return birth <= cutoff;
}

function normalizeIban(iban: string) {
  return iban.replace(/\s/g, '').toUpperCase();
}

function isValidTrIban(iban: string) {
  const n = normalizeIban(iban);
  if (n.length !== 26 || !n.startsWith('TR')) return false;
  return /^TR\d{24}$/.test(n);
}

const bankSchema = z.object({
  id: z.number(),
  bank: z.string().min(1),
  iban: z.string().refine((v) => isValidTrIban(v), { message: 'if_iban_invalid' }),
  currency: z.string().min(1),
  branch: z.string(),
  accountNo: z.string(),
  suffix: z.string(),
  isDefault: z.boolean(),
  status: z.string(),
});

const addressSchema = z.object({
  id: z.number(),
  type: z.string(),
  country: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  neighbourhood: z.string().min(1),
  postcode: z.string().min(4).max(10),
  street: z.string().min(1),
  building: z.string().min(1).max(10),
  apt: z.string().optional(),
  uavt: z.string().optional(),
  isContact: z.boolean(),
  status: z.string(),
});

const contactSchema = z.object({
  id: z.number(),
  type: z.enum(['email', 'phone']),
  value: z.string().min(1),
  verified: z.boolean(),
  primary: z.boolean(),
  kind: z.string().optional(),
});

const documentSchema = z.object({
  id: z.number(),
  category: z.string(),
  type: z.string(),
  validFrom: z.string(),
  validTo: z.string(),
  status: z.string(),
});

/** Spec §7 — form zod şeması */
export const individualFormSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'if_name_required')
      .max(255)
      .regex(NAME_REGEX, 'if_name_letters'),
    idType: z.enum(['TCKN', 'PASSPORT', 'RES_PERMIT']),
    idCountry: z.string().min(1, 'if_id_country_required'),
    idNo: z.string().min(1, 'if_id_required'),
    birthDate: z.string().min(1, 'if_birth_required'),
    customerType: z.enum(['individual', 'prospective']),
    birthPlace: z.string().min(2, 'if_birth_place_required').max(100),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
    serialNo: z.string().min(5, 'if_serial_required').max(30),
    issueDate: z.string().min(1),
    issuingAuthority: z.string().min(3).max(50),
    validityDate: z.string().min(1),
    motherName: z.string().optional(),
    fatherName: z.string().optional(),
    gender: z.enum(['male', 'female']),
    maidenName: z.string().optional(),
    taxCountry: z.string().min(1),
    education: z.string().min(1),
    employment: z.string().min(1),
    occupation: z.string().min(1),
    employer: z.string().optional(),
    language: z.string().min(1),
    notes: z
      .string()
      .optional()
      .refine((v) => !v || !PII_IN_NOTES.test(v), { message: 'if_notes_pii' }),
    visaType: z.string().nullable().optional(),
    visaEndDate: z.string().nullable().optional(),
    residencePermit: z.string().max(50).nullable().optional(),
    residencePermitEnd: z.string().nullable().optional(),
    birthCountry: z.string().optional(),
    residentCountry: z.string().optional(),
    banks: z.array(bankSchema),
    addresses: z.array(addressSchema),
    contacts: z.array(contactSchema),
    documents: z.array(documentSchema),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    if (data.birthDate > today) {
      ctx.addIssue({ code: 'custom', message: 'if_birth_future', path: ['birthDate'] });
    } else if (!isAtLeast18Years(data.birthDate, now)) {
      ctx.addIssue({ code: 'custom', message: 'if_min_age', path: ['birthDate'] });
    }

    // §7 — kimlik belgesi veriliş/geçerlilik tarihleri
    if (data.issueDate && data.issueDate > today) {
      ctx.addIssue({ code: 'custom', message: 'if_issue_future', path: ['issueDate'] });
    }
    if (data.validityDate) {
      if (data.issueDate && data.validityDate < data.issueDate) {
        ctx.addIssue({ code: 'custom', message: 'if_validity_before_issue', path: ['validityDate'] });
      }
      if (data.validityDate < today) {
        ctx.addIssue({ code: 'custom', message: 'if_validity_expired', path: ['validityDate'] });
      }
    }

    const isTur = data.idCountry === 'TUR';
    if (isTur && data.idType === 'TCKN') {
      if (!TCKN_REGEX.test(data.idNo)) {
        ctx.addIssue({ code: 'custom', message: 'if_tckn_invalid', path: ['idNo'] });
      }
    } else if (data.idType === 'PASSPORT') {
      if (!PASSPORT_REGEX.test(data.idNo)) {
        ctx.addIssue({ code: 'custom', message: 'if_passport_invalid', path: ['idNo'] });
      }
    }

    if (isTur) {
      if (!data.motherName || data.motherName.length < 2) {
        ctx.addIssue({ code: 'custom', message: 'if_mother_required', path: ['motherName'] });
      }
      if (!data.fatherName || data.fatherName.length < 2) {
        ctx.addIssue({ code: 'custom', message: 'if_father_required', path: ['fatherName'] });
      }
    }

    if (data.gender === 'female' && data.maritalStatus === 'married' && !data.maidenName?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'if_maiden_required', path: ['maidenName'] });
    }

    if (data.idCountry !== 'TUR') {
      if (!data.visaType) {
        ctx.addIssue({ code: 'custom', message: 'if_visa_required', path: ['visaType'] });
      } else if (data.visaType !== 'VisaExempt') {
        if (!data.visaEndDate)
          ctx.addIssue({ code: 'custom', message: 'if_visa_end_required', path: ['visaEndDate'] });
        else if (data.visaEndDate <= today)
          ctx.addIssue({ code: 'custom', message: 'if_visa_end_past', path: ['visaEndDate'] });
      }
      if (!data.birthCountry)
        ctx.addIssue({ code: 'custom', message: 'if_birth_country_required', path: ['birthCountry'] });
      if (!data.residentCountry)
        ctx.addIssue({ code: 'custom', message: 'if_resident_country_required', path: ['residentCountry'] });
    }

    const ibans = data.banks.map((b) => normalizeIban(b.iban));
    if (new Set(ibans).size !== ibans.length) {
      ctx.addIssue({ code: 'custom', message: 'if_iban_duplicate', path: ['banks'] });
    }

    const emails = data.contacts.filter((c) => c.type === 'email');
    const phones = data.contacts.filter((c) => c.type === 'phone' && c.kind !== 'landline');
    if (emails.some((c) => c.value && !EMAIL_REGEX.test(c.value))) {
      ctx.addIssue({ code: 'custom', message: 'if_email_format', path: ['contacts'] });
    }
    if (data.contacts.some((c) => c.type === 'phone' && c.value && !isValidPhoneNumber(c.value))) {
      ctx.addIssue({ code: 'custom', message: 'if_phone_format', path: ['contacts'] });
    }
    const verifiedEmail = emails.some((c) => c.verified);
    const verifiedPhone = phones.some((c) => c.verified);
    if (!verifiedEmail) {
      ctx.addIssue({ code: 'custom', message: 'if_email_verify_required', path: ['contacts'] });
    }
    if (!verifiedPhone) {
      ctx.addIssue({ code: 'custom', message: 'if_phone_verify_required', path: ['contacts'] });
    }
    if (!emails.some((c) => c.primary) || !phones.some((c) => c.primary)) {
      ctx.addIssue({ code: 'custom', message: 'if_primary_contact_required', path: ['contacts'] });
    }

    const emailSet = new Set(emails.map((c) => c.value.toLowerCase()));
    if (emailSet.size !== emails.length) {
      ctx.addIssue({ code: 'custom', message: 'if_contact_duplicate', path: ['contacts'] });
    }

    if (!data.addresses.some((a) => a.isContact)) {
      ctx.addIssue({ code: 'custom', message: 'if_contact_address_required', path: ['addresses'] });
    }
  });

/** Kayıt (taslak değil) için belge kontrolü */
export function validateDocumentsForSave(documents: z.infer<typeof documentSchema>[]): string | null {
  // §8: belge yalnızca Approved veya onay gerektirmeyen (active) ise kayda yeterlidir.
  const hasIdentity = documents.some(
    (d) => d.category === 'Identity' && (d.status === 'approved' || d.status === 'active'),
  );
  if (!hasIdentity) return 'if_doc_identity_required';
  return null;
}

export type IndividualFormSchema = z.infer<typeof individualFormSchema>;
