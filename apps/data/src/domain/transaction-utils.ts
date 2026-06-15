/** IBAN maskeleme — müşteri/agent/backoffice ortak */
export function maskIban(iban: string): string {
  const clean = iban.replace(/\s/g, '');
  if (clean.length < 6) return 'TR** **** ****';
  const tail = clean.slice(-4);
  return `TR** **** **** **** **${tail.slice(0, 2)} ${tail.slice(2)}`;
}

export function countTransactionsByStatus(
  rows: { recordStatus: number; status: string }[],
  status: string,
): number {
  return rows.filter((t) => t.recordStatus === 1 && t.status === status).length;
}
