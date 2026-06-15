import { z } from 'zod';
import { validateIdentityNo } from './identity-validation';

function normalizeIban(iban: string) {
  return iban.replace(/\s/g, '').toUpperCase();
}

export function isValidTrIban(iban: string) {
  const n = normalizeIban(iban);
  if (n.length !== 26 || !n.startsWith('TR')) return false;
  return /^TR\d{24}$/.test(n);
}

const addressSchema = z.object({
  id: z.number(),
  addressType: z.string(),
  country: z.string().min(1),
  city: z.string().min(1),
  district: z.string(),
  postcode: z.string(),
  line: z.string().min(1),
});

const contactSchema = z.object({
  id: z.number(),
  type: z.enum(['email', 'phone']),
  value: z.string().min(1),
  verified: z.boolean(),
  primary: z.boolean(),
});

export const employeeFormSchema = z
  .object({
    firstName: z.string().min(1, 'ef_name_required'),
    lastName: z.string().min(1, 'ef_name_required'),
    identityNo: z.string().min(1),
    identityDocument: z.enum(['IdentityCard', 'Passport', 'ResidencePermit']),
    title: z.string().min(1, 'ef_title_required'),
    departmentId: z.string().min(1, 'ef_department_required'),
    hireDate: z.string().min(1),
    nationality: z.string().min(1),
    birthPlace: z.string(),
    birthDate: z.string().min(1),
    gender: z.enum(['Male', 'Female', 'Other']),
    maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
    iban: z.string().optional().nullable(),
    addresses: z.array(addressSchema).min(1, 'ef_address_required'),
    contacts: z.array(contactSchema).min(1),
    employmentStatus: z.enum(['Active', 'OnLeave', 'Terminated']),
  })
  .superRefine((data, ctx) => {
    const idErr = validateIdentityNo(data.identityNo, data.identityDocument);
    if (idErr) {
      ctx.addIssue({ code: 'custom', message: idErr, path: ['identityNo'] });
    }
    if (data.iban?.trim()) {
      if (!isValidTrIban(data.iban)) {
        ctx.addIssue({ code: 'custom', message: 'ef_iban_invalid', path: ['iban'] });
      }
    }
    const today = new Date().toISOString().slice(0, 10);
    if (data.birthDate > today) {
      ctx.addIssue({ code: 'custom', message: 'ef_birth_future', path: ['birthDate'] });
    }
    const phones = data.contacts.filter((c) => c.type === 'phone');
    const verifiedPrimaryPhone = phones.some((c) => c.primary && c.verified);
    if (!verifiedPrimaryPhone) {
      ctx.addIssue({ code: 'custom', message: 'ef_phone_otp_required', path: ['contacts'] });
    }
  });

export type EmployeeFormSchema = z.infer<typeof employeeFormSchema>;
