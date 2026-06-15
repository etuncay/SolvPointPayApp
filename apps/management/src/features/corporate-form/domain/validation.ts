import { z } from 'zod';
import {
  ESTABLISHMENT_OPTIONAL_TYPES,
  isMersisOptional,
  isRegistryOptional,
} from './required-documents';
import { findShareholderOverlap } from './shareholder-overlap';
import type { OrganizationType } from './types';

const VKN_REGEX = /^[1-9]\d{9}$/;
const MERSIS_REGEX = /^\d{16}$/;
const PII_IN_NOTES = /\b\d{11}\b|\b(?:\d[ -]*?){13,19}\b/;

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

const shareholderSchema = z.object({
  id: z.number(),
  refNo: z.string(),
  refType: z.enum(['TCKN', 'VKN', 'CUSTOMER']),
  partyType: z.enum(['individual', 'corporate']),
  name: z.string().min(1),
  directShare: z.number().min(0).max(100),
  indirectShare: z.number().min(0).max(100),
  isUbo: z.boolean(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.string(),
});

const authorizedSchema = z.object({
  id: z.number(),
  personId: z.string(),
  name: z.string().min(1),
  hasOperationAuth: z.boolean(),
  hasSignatureAuth: z.boolean(),
  singleTxLimit: z.number(),
  dailyLimit: z.number(),
  monthlyLimit: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.string(),
  kycLevel: z.string(),
});

const limitsSchema = z.object({
  perTx: z.number().min(0),
  daily: z.number().min(0),
  monthly: z.number().min(0),
  currency: z.string(),
});

/** Spec §7 — tüzel form zod şeması */
export const corporateFormSchema = z
  .object({
    tradeName: z.string().min(2, 'cf_trade_name_required').max(255),
    taxNo: z.string().regex(VKN_REGEX, 'cf_vkn_invalid'),
    customerNo: z.string(),
    campaign: z.string(),
    campaignEndDate: z.string(),
    kycStatus: z.string(),
    riskScore: z.number(),
    riskSegment: z.string(),
    createdAt: z.string(),
    status: z.string(),
    statusReason: z.string().nullable(),
    organizationType: z.string().min(1, 'cf_org_type_required'),
    registryNo: z.string(),
    mersisNo: z.string(),
    taxOffice: z.string().min(1, 'cf_tax_office_required'),
    activitySubject: z.string().min(3, 'cf_activity_required').max(255),
    establishmentDate: z.string(),
    country: z.string().min(1, 'cf_country_required'),
    ownershipType: z.string().min(1, 'cf_ownership_required'),
    staffCount: z.number().int().positive('cf_staff_positive'),
    language: z.string().min(1, 'cf_language_required'),
    notes: z
      .string()
      .optional()
      .refine((v) => !v || !PII_IN_NOTES.test(v), { message: 'cf_notes_pii' }),
    banks: z.array(bankSchema),
    addresses: z.array(addressSchema),
    contacts: z.array(contactSchema),
    documents: z.array(documentSchema),
    shareholders: z.array(shareholderSchema),
    authorizedPersons: z.array(authorizedSchema),
    wallets: z.array(z.object({ id: z.string(), balance: z.number(), currency: z.string() })),
    limits: limitsSchema,
  })
  .superRefine((data, ctx) => {
    const orgType = data.organizationType as OrganizationType;
    const today = new Date().toISOString().slice(0, 10);

    if (orgType === 'ForeignLegalEntity') {
      ctx.addIssue({ code: 'custom', message: 'cf_foreign_blocked', path: ['organizationType'] });
    }

    if (!isRegistryOptional(orgType)) {
      if (data.registryNo.length < 5 || data.registryNo.length > 30) {
        ctx.addIssue({ code: 'custom', message: 'cf_registry_required', path: ['registryNo'] });
      }
    }

    if (!isMersisOptional(orgType)) {
      if (!MERSIS_REGEX.test(data.mersisNo)) {
        ctx.addIssue({ code: 'custom', message: 'cf_mersis_invalid', path: ['mersisNo'] });
      }
    }

    if (!ESTABLISHMENT_OPTIONAL_TYPES.includes(orgType)) {
      if (!data.establishmentDate) {
        ctx.addIssue({ code: 'custom', message: 'cf_establishment_required', path: ['establishmentDate'] });
      } else if (data.establishmentDate > today) {
        ctx.addIssue({ code: 'custom', message: 'cf_establishment_future', path: ['establishmentDate'] });
      }
    }

    const directSum = data.shareholders.reduce((s, sh) => s + (sh.directShare || 0), 0);
    if (directSum > 100) {
      ctx.addIssue({ code: 'custom', message: 'cf_share_sum_exceeded', path: ['shareholders'] });
    }

    data.shareholders.forEach((sh, i) => {
      if (sh.partyType !== 'individual' && sh.isUbo) {
        ctx.addIssue({ code: 'custom', message: 'cf_ubo_individual_only', path: [`shareholders.${i}.isUbo`] });
      }
      if ((sh.isUbo || sh.indirectShare > 0) && !sh.description.trim()) {
        ctx.addIssue({ code: 'custom', message: 'cf_share_desc_required', path: [`shareholders.${i}.description`] });
      }
    });

    const overlapIdx = findShareholderOverlap(data.shareholders);
    if (overlapIdx !== null) {
      ctx.addIssue({ code: 'custom', message: 'cf_share_overlap', path: [`shareholders.${overlapIdx}.startDate`] });
    }

    data.authorizedPersons.forEach((ap, i) => {
      if (ap.hasOperationAuth && (ap.kycLevel === 'L0' || ap.kycLevel === 'L1')) {
        ctx.addIssue({ code: 'custom', message: 'cf_auth_kyc_required', path: [`authorizedPersons.${i}.kycLevel`] });
      }
      if (ap.hasOperationAuth) {
        if (ap.singleTxLimit > 0 && ap.singleTxLimit > data.limits.perTx) {
          ctx.addIssue({ code: 'custom', message: 'cf_auth_limit_exceeded', path: [`authorizedPersons.${i}.singleTxLimit`] });
        }
        if (ap.dailyLimit > 0 && ap.dailyLimit > data.limits.daily) {
          ctx.addIssue({ code: 'custom', message: 'cf_auth_limit_exceeded', path: [`authorizedPersons.${i}.dailyLimit`] });
        }
        if (ap.monthlyLimit > 0 && ap.monthlyLimit > data.limits.monthly) {
          ctx.addIssue({ code: 'custom', message: 'cf_auth_limit_exceeded', path: [`authorizedPersons.${i}.monthlyLimit`] });
        }
      }
    });

    const ibans = data.banks.map((b) => normalizeIban(b.iban));
    if (new Set(ibans).size !== ibans.length) {
      ctx.addIssue({ code: 'custom', message: 'if_iban_duplicate', path: ['banks'] });
    }

    const emails = data.contacts.filter((c) => c.type === 'email');
    const phones = data.contacts.filter((c) => c.type === 'phone' && c.kind !== 'landline');
    if (!emails.some((c) => c.verified)) {
      ctx.addIssue({ code: 'custom', message: 'if_email_verify_required', path: ['contacts'] });
    }
    if (!phones.some((c) => c.verified)) {
      ctx.addIssue({ code: 'custom', message: 'cf_phone_verify_required', path: ['contacts'] });
    }
    if (!emails.some((c) => c.primary) || !phones.some((c) => c.primary)) {
      ctx.addIssue({ code: 'custom', message: 'cf_primary_contact_required', path: ['contacts'] });
    }

    if (!data.addresses.some((a) => a.type === 'registered')) {
      ctx.addIssue({ code: 'custom', message: 'cf_registered_address_required', path: ['addresses'] });
    }
    if (!data.addresses.some((a) => a.isContact)) {
      ctx.addIssue({ code: 'custom', message: 'if_contact_address_required', path: ['addresses'] });
    }
  });

export { validateCorporateDocumentsForSave } from './required-documents';

/**
 * %25 UBO kapsama kontrolü — doğrudan+dolaylı payı ≥ %25 olan en az bir ortak var mı?
 * Spec §8: zorunlu değil; eksikse uyarı verilir, kayıt bloklanmaz.
 */
export function hasShareholder25Coverage(
  shareholders: { directShare: number; indirectShare: number }[],
): boolean {
  return shareholders.some((sh) => (Number(sh.directShare) || 0) + (Number(sh.indirectShare) || 0) >= 25);
}

export type CorporateFormSchema = z.infer<typeof corporateFormSchema>;
