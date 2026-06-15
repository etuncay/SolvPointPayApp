import { findCustomerByQuery } from '@/features/agent-transactions/domain/customer-lookup';
import { receiverInfoStore } from '@/mocks/receiver-info';
import type { MaskedRecipient } from './types';

/** 6.3 — kayıtlı alıcı maskeli profil veya geçici receiver_info. */
export function lookupRecipientMasked(idNo: string): MaskedRecipient | null {
  const trimmed = idNo.trim();
  if (!trimmed) return null;

  const customer = findCustomerByQuery({ idNo: trimmed });
  if (customer) {
    const mask = (s: string, visible = 1) =>
      s.length <= visible ? s : `${s.slice(0, visible)}${'*'.repeat(Math.max(3, s.length - visible))}`;
    return {
      name: mask(customer.name, 2),
      phone: mask(customer.phone ?? '', 4),
      email: mask(customer.email ?? '', 2),
      customerId: customer.id,
      isRegistered: true,
    };
  }

  const temp = receiverInfoStore.findByIdNo(trimmed);
  if (temp) {
    return {
      name: temp.maskedName,
      phone: temp.maskedPhone,
      email: temp.maskedEmail,
      isRegistered: false,
    };
  }

  return null;
}
