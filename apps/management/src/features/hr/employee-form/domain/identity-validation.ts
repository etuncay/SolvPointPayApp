import type { IdentityDocument } from './types';

const TCKN_REGEX = /^[1-9]\d{10}$/;

export function validateIdentityNo(identityNo: string, docType: IdentityDocument): string | null {
  const trimmed = identityNo.trim();
  if (!trimmed) return 'ef_identity_required';
  if (docType === 'IdentityCard') {
    if (!TCKN_REGEX.test(trimmed)) return 'ef_tckn_invalid';
    return null;
  }
  if (trimmed.length < 5) return 'ef_identity_invalid';
  return null;
}
