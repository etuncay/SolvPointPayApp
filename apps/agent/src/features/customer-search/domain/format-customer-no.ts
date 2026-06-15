/** Mock müşteri no gösterimi. */
export function formatCustomerNo(id: number): string {
  return `MUS-${String(id).padStart(7, '0')}`;
}

/** Müşteri no girişini sayısal id'ye çevirir. */
export function parseCustomerNo(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const m = trimmed.match(/^MUS-(\d+)$/i);
  if (m) return Number(m[1]);
  return null;
}
