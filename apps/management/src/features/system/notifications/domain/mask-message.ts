import type { NotificationType } from './types';

/** Log UI için PII maskeli özet */
export function maskMessage(
  type: NotificationType,
  address: string,
  message: string,
): string {
  const addr = maskAddress(type, address);
  const preview = message.length > 48 ? `${message.slice(0, 48)}…` : message;
  return `${addr} · ${preview}`;
}

export function maskAddress(type: NotificationType, address: string): string {
  const a = address.trim();
  if (type === 'Email' && a.includes('@')) {
    const [local, domain] = a.split('@');
    if (!local || !domain) return '***@***';
    const head = local.slice(0, 2);
    return `${head}***@${domain}`;
  }
  if (type === 'SMS') {
    const digits = a.replace(/\D/g, '');
    if (digits.length < 6) return '***';
    return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
  }
  if (type === 'Push') {
    return a.length <= 6 ? '***' : `${a.slice(0, 4)}…${a.slice(-2)}`;
  }
  return '***';
}
