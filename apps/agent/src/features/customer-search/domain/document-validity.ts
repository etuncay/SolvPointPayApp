/** Belge geçerlilik etiketi — spec §7 + plan X=30 gün. */
export function documentValidityLabel(
  validTo: string | null | undefined,
  today = new Date(),
  soonDays = 30,
): string {
  if (!validTo) return 'unlimited';
  const end = new Date(validTo);
  if (Number.isNaN(end.getTime())) return 'unlimited';
  const dayMs = 86400000;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endStart = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (endStart < todayStart) return 'expired';
  const diffDays = Math.ceil((endStart.getTime() - todayStart.getTime()) / dayMs);
  if (diffDays <= soonDays) return 'soon';
  return 'valid';
}
