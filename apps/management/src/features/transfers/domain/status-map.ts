/** Dashboard ?status= alias → transaction status filtresi */
export function mapUrlStatus(param: string | null | undefined): string {
  if (!param || param === 'all') return 'all';
  const key = param.toLowerCase();
  const alias: Record<string, string> = {
    pending: 'Pending',
    aml: 'OnHold',
    rejected: 'Canceled',
    onhold: 'OnHold',
    completed: 'Completed',
    sent: 'Sent',
    unblocked: 'Unblocked',
  };
  return alias[key] ?? param;
}

export const STATUS_CHIP_VALUES = [
  'all',
  'Pending',
  'OnHold',
  'Completed',
  'Sent',
  'Canceled',
  'ErrorComplete',
  'ErrorSend',
  'ErrorReceive',
  'Retrying',
  'Unblocked',
] as const;
