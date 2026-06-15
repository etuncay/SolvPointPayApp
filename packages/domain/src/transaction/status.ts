/** Platform geneli işlem durumları — backoffice / agent / API ile hizalı */

export const TRANSACTION_STATUSES = [
  'Pending',
  'Sent',
  'Completed',
  'OnHold',
  'Unblocked',
  'ErrorComplete',
  'Canceled',
  'ErrorSend',
  'ErrorReceive',
  'Retrying',
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

/** Müşteri self-servis portalında görünen alt küme */
export const CUSTOMER_PORTAL_TRANSACTION_STATUSES = [
  'Pending',
  'Sent',
  'Completed',
  'ErrorSend',
  'ErrorReceive',
] as const;

export type CustomerPortalTransactionStatus =
  (typeof CUSTOMER_PORTAL_TRANSACTION_STATUSES)[number];

const TERMINAL: TransactionStatus[] = [
  'Completed',
  'Sent',
  'Canceled',
  'ErrorComplete',
  'ErrorSend',
  'ErrorReceive',
];

export function isTerminalTransactionStatus(status: TransactionStatus): boolean {
  return TERMINAL.includes(status);
}

export function isCustomerPortalTransactionStatus(
  status: TransactionStatus,
): status is CustomerPortalTransactionStatus {
  return (CUSTOMER_PORTAL_TRANSACTION_STATUSES as readonly string[]).includes(status);
}
