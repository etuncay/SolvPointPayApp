import type { Customer } from '@/mocks/data';
import type { SamplePerson } from '@/mocks/sample-person';
import { SAMPLE_PERSON } from '@/mocks/sample-person';

/** Grid müşteri kaydını bireysel form mock verisine dönüştürür */
export function mapCustomerToPerson(c: Customer): SamplePerson {
  const parts = c.name.trim().split(/\s+/);
  const firstName = parts[0] ?? c.name;
  const lastName = parts.slice(1).join(' ') || firstName;

  return {
    ...SAMPLE_PERSON,
    firstName,
    lastName,
    idNo: c.idNo,
    idType: c.idKind === 'TCKN' ? 'TCKN' : c.idKind === 'VKN' ? 'PASSPORT' : 'PASSPORT',
    birthPlace: c.city,
    customerNo: `MUS-${String(c.id).padStart(7, '0')}`,
    status: c.status === 'prospect' ? 'prospect' : c.status,
    statusReason: c.blockReason ?? c.closeReason,
    kycLevel: c.kyc.startsWith('L') ? c.kyc : 'L2',
    riskScore: c.riskScore,
    riskSegment: c.riskSeg,
    createdAt: `${c.createdAt}T12:00:00`,
    campaign: c.campaign ?? SAMPLE_PERSON.campaign,
    customerType: c.type === 'prospective' ? 'prospective' : 'individual',
    notes: c.campaign ? `${c.name} — ${c.campaign}` : SAMPLE_PERSON.notes,
  };
}
