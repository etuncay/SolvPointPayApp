import type { NotificationType } from './types';

const TR_PHONE = /^(\+90|0)?5\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRecipient(
  type: NotificationType,
  address: string,
): string | null {
  const trimmed = address.trim();
  if (!trimmed) return 'nt_recipient_required';
  switch (type) {
    case 'SMS':
      return TR_PHONE.test(trimmed.replace(/\s/g, '')) ? null : 'nt_recipient_invalid_phone';
    case 'Email':
      return EMAIL.test(trimmed) ? null : 'nt_recipient_invalid_email';
    case 'Push':
      return trimmed.length >= 8 ? null : 'nt_recipient_invalid_token';
    default:
      return 'nt_recipient_invalid';
  }
}
