/** Backoffice / agent cüzdan hareketleri */
export const LEDGER_DIRECTIONS = ['Inflow', 'Outflow'] as const;
export type LedgerDirection = (typeof LEDGER_DIRECTIONS)[number];

/** Müşteri portalı hesap hareketleri */
export const CUSTOMER_PORTAL_DIRECTIONS = ['in', 'out'] as const;
export type CustomerPortalDirection = (typeof CUSTOMER_PORTAL_DIRECTIONS)[number];

export function portalToLedger(direction: CustomerPortalDirection): LedgerDirection {
  return direction === 'in' ? 'Inflow' : 'Outflow';
}

export function ledgerToPortal(direction: LedgerDirection): CustomerPortalDirection {
  return direction === 'Inflow' ? 'in' : 'out';
}
