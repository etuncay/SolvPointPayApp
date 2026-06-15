import { CUSTOMERS } from '@/mocks/data';
import { AGENTS } from '@/mocks/agents';
import type { EntityStatePatch, KycEntityKind } from './types';

export type EntitySnapshot = {
  entityKind: KycEntityKind;
  entityId: number;
  entityNo: string;
  entityTypeFull: string;
  identityDocumentExtended: string;
  identityNo: string;
  displayName: string;
  phone: string;
  email: string;
  birthDate: string | null;
  kycStatusDisplay: string;
  entityStatus: string;
  blockageReason: string | null;
  riskScore: number;
  riskSegment: string;
};

const entityOverrides = new Map<string, EntityStatePatch>();

function key(kind: KycEntityKind, id: number): string {
  return `${kind}:${id}`;
}

export function setEntityOverride(kind: KycEntityKind, id: number, patch: EntityStatePatch): void {
  const k = key(kind, id);
  entityOverrides.set(k, { ...entityOverrides.get(k), ...patch });
}

export function resetEntityOverrides(): void {
  entityOverrides.clear();
}

export function getEntitySnapshot(kind: KycEntityKind, id: number): EntitySnapshot | null {
  if (kind === 'Customer') {
    const c = CUSTOMERS.find((x) => x.id === id);
    if (!c) return null;
    const ov = entityOverrides.get(key(kind, id)) ?? {};
    const status = ov.status ?? c.status;
    const kyc = ov.kyc ?? c.kyc;
    const kycType = ov.kycType ?? c.kycType;
    return {
      entityKind: kind,
      entityId: id,
      entityNo: String(c.id),
      entityTypeFull: c.type === 'corporate' ? 'CorporateCustomer' : 'IndividualCustomer',
      identityDocumentExtended: c.idKind === 'VKN' ? 'TaxIdentificationNumber' : c.idKind,
      identityNo: c.idNo,
      displayName: c.name,
      phone: c.phone,
      email: c.email,
      birthDate: c.type === 'individual' ? '1990-01-15' : null,
      kycStatusDisplay: kycType === 'kyc_level' ? String(kyc) : String(kyc),
      entityStatus: status,
      blockageReason: ov.blockReason ?? c.blockReason ?? null,
      riskScore: ov.riskScore ?? c.riskScore,
      riskSegment: c.riskSeg,
    };
  }
  const a = AGENTS.find((x) => x.id === id);
  if (!a) return null;
  const ov = entityOverrides.get(key(kind, id)) ?? {};
  const status = ov.status ?? a.status;
  return {
    entityKind: kind,
    entityId: id,
    entityNo: String(a.id),
    entityTypeFull: 'Agent',
    identityDocumentExtended: 'TaxIdentificationNumber',
    identityNo: a.vkn,
    displayName: a.name,
    phone: a.phone,
    email: a.email,
    birthDate: null,
    kycStatusDisplay: ov.kyc ?? 'Pending',
    entityStatus: status,
    blockageReason: ov.blockReason ?? a.blockReason ?? null,
    riskScore: ov.riskScore ?? 50,
    riskSegment: 'med',
  };
}

export function syncEntityPatch(kind: KycEntityKind, id: number, patch: EntityStatePatch): void {
  // Seed CUSTOMERS readonly; kalıcı mock güncellemesi override map üzerinden.
  setEntityOverride(kind, id, patch);
}

export function isInQueue(snapshot: EntitySnapshot): boolean {
  if (snapshot.entityStatus === 'blocked') return true;
  if (snapshot.entityKind === 'Customer') {
    if (snapshot.kycStatusDisplay === 'L0' || snapshot.kycStatusDisplay === 'L1') return true;
    if (['Pending', 'Rejected'].includes(snapshot.kycStatusDisplay)) return true;
  }
  if (snapshot.entityKind === 'Agent') {
    if (['Pending', 'Rejected'].includes(snapshot.kycStatusDisplay)) return true;
  }
  return false;
}
