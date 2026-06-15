import type { TransactionStatus } from '@/features/wallets/domain/activity-types';

const TERMINAL: TransactionStatus[] = ['Completed', 'Sent', 'Canceled', 'ErrorComplete', 'ErrorSend', 'ErrorReceive'];

export function isTerminalStatus(status: TransactionStatus): boolean {
  return TERMINAL.includes(status);
}

export function canHold(status: TransactionStatus): boolean {
  return status === 'Pending';
}

export function canUnblock(status: TransactionStatus): boolean {
  return status === 'OnHold';
}

export function canCancel(status: TransactionStatus): boolean {
  return status === 'Pending' || status === 'OnHold';
}

export function applyHold(status: TransactionStatus): TransactionStatus | null {
  if (!canHold(status)) return null;
  return 'OnHold';
}

export function applyUnblock(status: TransactionStatus): TransactionStatus | null {
  if (!canUnblock(status)) return null;
  return 'Unblocked';
}

export function applyCancel(status: TransactionStatus): TransactionStatus | null {
  if (!canCancel(status)) return null;
  return 'Canceled';
}
