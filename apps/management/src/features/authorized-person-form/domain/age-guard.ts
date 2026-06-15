/** Spec §7 — yetkili kişi en az 18 yaşında olmalı */
export function isAtLeast18(birthDate: string, today = new Date()): boolean {
  if (!birthDate) return false;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return false;
  const cutoff = new Date(today);
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return birth <= cutoff;
}

export function assertAuthorizedPersonAge(birthDate: string): string | null {
  if (!isAtLeast18(birthDate)) return 'ap2_under_18';
  return null;
}
