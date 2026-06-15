import type { CustomerRecord } from '../types/customer';

export function formValuesToRecord(
  id: string,
  values: Record<string, unknown>,
  opts: { isNew?: boolean; existing?: CustomerRecord },
): CustomerRecord {
  const type = String(values.customerType ?? values.type ?? 'individual') as CustomerRecord['type'];
  const firstName = String(values.firstName ?? '').trim();
  const lastName = String(values.lastName ?? '').trim();
  const tradeName = String(values.tradeName ?? '').trim();
  const name =
    type === 'corporate' && tradeName
      ? tradeName
      : [firstName, lastName].filter(Boolean).join(' ') || String(values.name ?? '');

  return {
    id,
    name,
    type,
    status: (values.status as CustomerRecord['status']) ?? opts.existing?.status ?? 'Active',
    email: String(values.email ?? opts.existing?.email ?? ''),
    phone: String(values.phone ?? opts.existing?.phone ?? ''),
    city: String(values.city ?? opts.existing?.city ?? ''),
    kycLevel: String(values.kycLevel ?? opts.existing?.kycLevel ?? '0'),
    riskScore: Number(values.riskScore ?? opts.existing?.riskScore ?? 0),
    balance: Number(values.balance ?? opts.existing?.balance ?? 0),
    createdAt: opts.existing?.createdAt ?? new Date().toISOString(),
    customerType: type,
    firstName,
    lastName,
    tradeName: tradeName || undefined,
    taxNo: values.taxNo != null ? String(values.taxNo) : opts.existing?.taxNo,
    tckn: values.tckn != null ? String(values.tckn) : opts.existing?.tckn,
    birthDate: values.birthDate != null ? String(values.birthDate) : opts.existing?.birthDate,
    country: values.country != null ? String(values.country) : opts.existing?.country,
    address: values.address != null ? String(values.address) : opts.existing?.address,
    language: values.language != null ? String(values.language) : opts.existing?.language,
    smsNotify: values.smsNotify != null ? Boolean(values.smsNotify) : opts.existing?.smsNotify,
    emailNotify:
      values.emailNotify != null ? Boolean(values.emailNotify) : opts.existing?.emailNotify,
    monthlyLimit:
      values.monthlyLimit != null ? Number(values.monthlyLimit) : opts.existing?.monthlyLimit,
    notes: values.notes != null ? String(values.notes) : opts.existing?.notes,
  };
}

export function customerToFormValues(row: CustomerRecord): Record<string, unknown> {
  const parts = row.name.split(' ');
  return {
    customerType: row.customerType ?? row.type,
    status: row.status,
    firstName: row.firstName ?? parts[0] ?? '',
    lastName: row.lastName ?? parts.slice(1).join(' '),
    tradeName: row.tradeName ?? (row.type === 'corporate' ? row.name : ''),
    email: row.email,
    phone: row.phone,
    city: row.city,
    country: row.country ?? 'TR',
    tckn: row.tckn ?? '',
    taxNo: row.taxNo ?? '',
    birthDate: row.birthDate ?? '',
    address: row.address ?? '',
    language: row.language ?? 'tr',
    kycLevel: row.kycLevel,
    smsNotify: row.smsNotify ?? true,
    emailNotify: row.emailNotify ?? true,
    monthlyLimit: row.monthlyLimit ?? 185000,
    notes: row.notes ?? '',
  };
}
